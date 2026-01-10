"use server"

import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

export async function downloadFilesAsZip(caseId: string, uploaderId: string, storagePaths?: string[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check case access
  const { data: caseData } = await supabase
    .from("cases")
    .select("gp_id, specialist_id, patient_name, patient_species")
    .eq("id", caseId)
    .single()

  if (!caseData) {
    return { error: "Case not found" }
  }

  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const isGP = caseData.gp_id === user.id
  const isAssignedSpecialist = caseData.specialist_id === user.id
  const isSpecialistViewingUnassigned = userProfile?.role === "specialist" && caseData.specialist_id === null

  if (!isGP && !isAssignedSpecialist && !isSpecialistViewingUnassigned) {
    return { error: "Unauthorized" }
  }

  // Get all files from this uploader for this case
  let query = supabase
    .from("case_files")
    .select("file_name, storage_object_path")
    .eq("case_id", caseId)
    .eq("uploader_id", uploaderId)

  if (storagePaths && storagePaths.length > 0) {
    query = query.in("storage_object_path", storagePaths)
  }

  const { data: files, error: filesError } = await query

  if (filesError || !files || files.length === 0) {
    return { error: "No files found" }
  }

  // Create zip file
  const zip = new JSZip()

  // OPTIMIZATION: Process all files in parallel
  const downloadPromises = files.map(async (file) => {
    try {
      // 1. Get signed URL (Short expiry is fine for immediate server-side fetch)
      const { data: signedUrlData } = await supabase.storage
        .from("case-bucket")
        .createSignedUrl(file.storage_object_path, 60)

      if (!signedUrlData?.signedUrl) {
        console.error(`Failed to get signed URL for ${file.file_name}`)
        return null
      }

      // 2. Download file content
      const response = await fetch(signedUrlData.signedUrl)
      if (!response.ok) {
        console.error(`Failed to download ${file.file_name}`)
        return null
      }

      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      return {
        name: file.file_name,
        data: arrayBuffer,
      }
    } catch (error) {
      console.error(`Error processing ${file.file_name}:`, error)
      return null
    }
  })

  // Wait for all concurrent downloads to complete
  const results = await Promise.all(downloadPromises)

  // Add successful downloads to zip
  let fileCount = 0
  results.forEach((result) => {
    if (result) {
      zip.file(result.name, result.data)
      fileCount++
    }
  })

  if (fileCount === 0) {
    return { error: "Failed to download any files" }
  }

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: "base64" })

  // Generate custom filename: YYYY-MM-DD_HHmmss_PatientName_Species_Case-ShortID.zip
  const now = new Date()
  const timestamp = now.toISOString().replace(/T/, "_").replace(/\..+/, "").replace(/:/g, "")
  const sanitizedPatient = (caseData?.patient_name || "Unknown").replace(/[^a-zA-Z0-9]/g, "_")
  const sanitizedSpecies = (caseData?.patient_species || "Unknown").replace(/[^a-zA-Z0-9]/g, "_")
  const shortCaseId = caseId.substring(0, 6)

  const fileName = `${timestamp}_${sanitizedPatient}_${sanitizedSpecies}_Case-${shortCaseId}.zip`

  return {
    success: true,
    zipData: zipBlob,
    fileName: fileName,
  }
}

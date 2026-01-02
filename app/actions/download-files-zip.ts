"use server"

import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

export async function downloadFilesAsZip(caseId: string, uploaderId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check case access
  const { data: caseData } = await supabase.from("cases").select("gp_id, specialist_id").eq("id", caseId).single()

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
  const { data: files, error: filesError } = await supabase
    .from("case_files")
    .select("file_name, storage_object_path")
    .eq("case_id", caseId)
    .eq("uploader_id", uploaderId)

  if (filesError || !files || files.length === 0) {
    return { error: "No files found" }
  }

  // Create zip file
  const zip = new JSZip()

  for (const file of files) {
    try {
      // Get signed URL for file
      const { data: signedUrlData } = await supabase.storage
        .from("case-bucket")
        .createSignedUrl(file.storage_object_path, 60)

      if (!signedUrlData?.signedUrl) {
        console.error(`Failed to get signed URL for ${file.file_name}`)
        continue
      }

      // Download file content
      const response = await fetch(signedUrlData.signedUrl)
      if (!response.ok) {
        console.error(`Failed to download ${file.file_name}`)
        continue
      }

      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      // Add to zip
      zip.file(file.file_name, arrayBuffer)
    } catch (error) {
      console.error(`Error processing ${file.file_name}:`, error)
    }
  }

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: "base64" })

  return {
    success: true,
    zipData: zipBlob,
    fileName: `case-${caseId}-files.zip`,
  }
}

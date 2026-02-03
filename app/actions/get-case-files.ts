"use server"

import { createClient } from "@/lib/supabase/server"

export type CaseFile = {
  id: string
  file_name: string
  storage_object_path: string
  file_type: string | null
  upload_phase: "initial_submission" | "diagnostic_results" | "specialist_report" | null
  uploaded_at: string
  uploader_id: string
  uploader_name: string
}

export async function getCaseFiles(caseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check authorization
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

  // Fetch files with uploader information
  const { data: files, error: filesError } = await supabase
    .from("case_files")
    .select(
      `
      id,
      file_name,
      storage_object_path,
      file_type,
      upload_phase,
      uploaded_at,
      uploader_id,
      profiles!uploader_id(full_name)
    `,
    )
    .eq("case_id", caseId)
    .eq("is_draft", false)
    .order("uploaded_at", { ascending: true })

  if (filesError) {
    console.error("[v0] getCaseFiles error:", filesError)
    return { error: filesError.message }
  }

  const transformedFiles: CaseFile[] = (files || []).map((file: any) => {
    const uploaderName = file.profiles?.full_name || "Unknown User"
    return {
      id: file.id,
      file_name: file.file_name,
      storage_object_path: file.storage_object_path,
      file_type: file.file_type,
      upload_phase: file.upload_phase,
      uploaded_at: file.uploaded_at,
      uploader_id: file.uploader_id,
      uploader_name: uploaderName,
    }
  })

  return { data: transformedFiles }
}

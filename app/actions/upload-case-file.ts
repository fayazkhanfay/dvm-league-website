"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadCaseFile(
  caseId: string,
  fileName: string,
  fileType: string,
  storageObjectPath: string,
  uploadPhase: "initial_submission" | "diagnostic_results" | "specialist_report" | "additional",
) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] uploadCaseFile: User not authenticated")
    return { success: false, error: "Not authenticated" }
  }

  console.log("[v0] uploadCaseFile: Attempting to insert file", {
    caseId,
    fileName,
    userId: user.id,
    uploadPhase,
  })

  // Insert file record into case_files
  const { data, error } = await supabase
    .from("case_files")
    .insert({
      case_id: caseId,
      uploader_id: user.id,
      file_name: fileName,
      file_type: fileType,
      storage_object_path: storageObjectPath,
      upload_phase: uploadPhase,
    })
    .select()

  if (error) {
    console.error("[v0] uploadCaseFile: Error saving file record", {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
    })
    return { success: false, error: error.message }
  }

  console.log("[v0] uploadCaseFile: File record saved successfully", data)

  // Revalidate the case page to show the new file in the timeline
  revalidatePath(`/gp/case/${caseId}`)
  revalidatePath(`/specialist/case/${caseId}`)

  return { success: true }
}

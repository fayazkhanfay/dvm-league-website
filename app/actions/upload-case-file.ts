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
    return { success: false, error: "Not authenticated" }
  }

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
    return { success: false, error: error.message }
  }

  // Revalidate the case page to show the new file in the timeline
  revalidatePath(`/gp/case/${caseId}`)
  revalidatePath(`/specialist/case/${caseId}`)

  return { success: true }
}

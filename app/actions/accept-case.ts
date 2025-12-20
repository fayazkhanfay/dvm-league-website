"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function acceptCase(caseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "specialist") {
    return { success: false, error: "Unauthorized" }
  }

  const { data: currentCase, error: fetchError } = await supabase
    .from("cases")
    .select("specialist_id, specialty_requested")
    .eq("id", caseId)
    .single()

  if (fetchError || !currentCase) {
    return { success: false, error: "Case not found" }
  }

  if (currentCase.specialty_requested !== profile.specialty) {
    return { success: false, error: "Specialty mismatch" }
  }

  if (currentCase.specialist_id !== null) {
    return { success: false, error: "Case already assigned to another specialist" }
  }

  const { error: updateError } = await supabase
    .from("cases")
    .update({
      specialist_id: user.id,
      status: "awaiting_phase1",
    })
    .eq("id", caseId)
    .is("specialist_id", null) // Extra safety: only update if still NULL

  if (updateError) {
    return { success: false, error: "Failed to accept case" }
  }

  revalidatePath(`/specialist-dashboard/cases/${caseId}`)
  revalidatePath("/specialist-dashboard")

  return { success: true }
}

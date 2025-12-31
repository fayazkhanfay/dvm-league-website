"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { notifyGPOfPhaseUpdate } from "@/lib/email"

export async function submitPhase1(caseId: string, phase1Plan: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("specialist_id")
    .eq("id", caseId)
    .eq("specialist_id", user.id)
    .single()

  if (!caseData) {
    return { success: false, error: "Unauthorized or case not found" }
  }

  const { error: updateError } = await supabase
    .from("cases")
    .update({
      phase1_plan: phase1Plan,
      status: "awaiting_diagnostics",
    })
    .eq("id", caseId)
    .eq("specialist_id", user.id)

  if (updateError) {
    return { success: false, error: "Failed to submit Phase 1 plan" }
  }

  await notifyGPOfPhaseUpdate(caseId, "phase1_complete")

  revalidatePath(`/specialist/case/${caseId}`)
  revalidatePath("/specialist-dashboard")
  revalidatePath(`/gp/case/${caseId}`)
  revalidatePath("/gp-dashboard")

  return { success: true }
}

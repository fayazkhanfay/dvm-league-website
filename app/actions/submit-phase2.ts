"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface Phase2Data {
  assessment: string
  treatmentPlan: string
  prognosis: string
  clientSummary: string
}

export async function submitPhase2(caseId: string, data: Phase2Data) {
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
      phase2_assessment: data.assessment,
      phase2_treatment_plan: data.treatmentPlan,
      phase2_prognosis: data.prognosis,
      phase2_client_summary: data.clientSummary,
      status: "completed",
    })
    .eq("id", caseId)
    .eq("specialist_id", user.id)

  if (updateError) {
    return { success: false, error: "Failed to submit Phase 2 report" }
  }

  revalidatePath(`/specialist-dashboard/cases/${caseId}`)
  revalidatePath("/specialist-dashboard")

  return { success: true }
}

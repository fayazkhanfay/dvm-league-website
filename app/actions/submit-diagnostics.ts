"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { notifySpecialistOfDiagnostics } from "@/lib/email"

export async function submitDiagnostics(caseId: string, diagnosticNotes?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: caseData } = await supabase.from("cases").select("gp_id").eq("id", caseId).eq("gp_id", user.id).single()

  if (!caseData) {
    return { success: false, error: "Unauthorized or case not found" }
  }

  const updateData: any = { status: "awaiting_phase2" }
  if (diagnosticNotes) {
    updateData.diagnostics_performed = diagnosticNotes
  }

  const { error: updateError } = await supabase.from("cases").update(updateData).eq("id", caseId).eq("gp_id", user.id)

  if (updateError) {
    return { success: false, error: "Failed to submit diagnostics" }
  }

  await notifySpecialistOfDiagnostics(caseId)

  revalidatePath(`/gp/case/${caseId}`)
  revalidatePath("/gp-dashboard")
  revalidatePath(`/specialist/case/${caseId}`)
  revalidatePath("/specialist-dashboard")

  return { success: true }
}

"use server"

import { createClient } from "@/lib/supabase/server"
import { notifyMatchingSpecialists } from "@/lib/email"

/**
 * Manual action to notify specialists about a case
 * Can be used for testing or if automated notification fails
 */
export async function manualNotifySpecialists(caseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Fetch case details
  const { data: caseData, error: fetchError } = await supabase
    .from("cases")
    .select(
      "id, patient_name, specialty_requested, patient_species, patient_breed, patient_age, patient_sex_status, patient_weight_kg, presenting_complaint, status",
    )
    .eq("id", caseId)
    .single()

  if (fetchError || !caseData) {
    return { success: false, error: "Case not found" }
  }

  if (caseData.status !== "pending_assignment") {
    return { success: false, error: "Case is not in pending_assignment status" }
  }

  const signalmentString = `${caseData.patient_species}, ${caseData.patient_breed}, ${caseData.patient_age}, ${caseData.patient_sex_status}, ${caseData.patient_weight_kg}kg`

  const result = await notifyMatchingSpecialists(
    caseData.specialty_requested,
    caseData.id,
    caseData.patient_name,
    signalmentString,
    caseData.presenting_complaint,
  )

  return result
}

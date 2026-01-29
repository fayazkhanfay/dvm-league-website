"use server"

import { createClient } from "@/lib/supabase/server"

export interface CaseDetails {
  id: string
  patient_name: string
  patient_species: string
  patient_breed: string
  patient_age: string
  patient_sex_status: string
  patient_weight_kg: number
  patient_vax_status: string | null
  patient_preventatives: string[] | null
  status: string
  gp_id: string
  specialist_id: string | null
  gp_questions: string
  specialty_requested: string | null
  financial_constraints: string | null
  // New Final Report Columns
  case_disposition: string | null
  final_diagnosis: string | null
  clinical_interpretation: string | null
  treatment_plan: string | null
  follow_up_instructions: string | null
  client_summary: string | null
}

export async function getCaseDetails(caseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: caseData, error } = await supabase
    .from("cases")
    .select(
      `
      id,
      patient_name,
      patient_species,
      patient_breed,
      patient_age,
      patient_sex_status,
      patient_weight_kg,
      patient_vax_status,
      patient_preventatives,
      status,
      gp_id,
      specialist_id,
      gp_questions,
      specialty_requested,
      financial_constraints,
      case_disposition,
      final_diagnosis,
      clinical_interpretation,
      treatment_plan,
      follow_up_instructions,
      client_summary
    `,
    )
    .eq("id", caseId)
    .single()

  if (error || !caseData) {
    console.error("Error fetching case details:", error)
    return { error: "Case not found" }
  }

  return { data: caseData as CaseDetails }
}

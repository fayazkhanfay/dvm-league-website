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
  final_report_path: string | null
  case_files: any[]
  updated_at: string
  completed_at: string | null
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
      client_summary,
      client_summary,
      final_report_path,
      updated_at,
      completed_at,
      case_files(*)
    `,
    )
    .eq("id", caseId)
    .single()

  if (error || !caseData) {
    console.error("Error fetching case details:", error)
    return { error: "Case not found" }
  }

  // Transform the data to match the CaseDetails interface which expects case_files
  // Since we are doing a single query with a join which might return it differently depending on how supabase-js types it,
  // we might need to cast or ensure the structure.
  // However, simpler is to let it be. But if we want to sort, we might need a separate query or an order command in the select.
  // The user prompt just says "includes case_files(*)".

  // Note: The simple select `case_files(*)` usually returns it as a property on the object.
  // We need to order them by creation if possible, but the prompt didn't specify order, just presence.

  // For better typing, we might want to define CaseFile type properly or reuse it, but `any[]` is what the user seems to expect from `report-sheet.tsx` usage (it casts to any).

  return { data: caseData as unknown as CaseDetails }
}

"use server"

import { createClient } from "@/lib/supabase/server"

export interface CaseDetails {
  id: string
  patient_name: string
  patient_signalment: {
    species: string
    breed: string
    age: string
    weight: string
    gender: string
  }
  status: string
  gp_id: string
  specialist_id: string | null
  gp_questions: string
  phase2_client_summary: string | null
  specialty_requested: string | null
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
      patient_signalment,
      status,
      gp_id,
      specialist_id,
      gp_questions,
      phase2_client_summary,
      specialty_requested
    `,
    )
    .eq("id", caseId)
    .single()

  if (error || !caseData) {
    return { error: "Case not found" }
  }

  return { data: caseData as CaseDetails }
}

"use server"

import { createClient } from "@/lib/supabase/server"

export async function fetchGPCases(userId: string) {
  const supabase = await createClient()

  const { data: allCases, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      specialist:specialist_id(full_name, specialty),
      last_message:case_messages(sender_id, created_at)
    `,
    )
    .eq("gp_id", userId)
    .order("created_at", { foreignTable: "case_messages", ascending: false })
    .limit(1, { foreignTable: "case_messages" })
    .order("created_at", { ascending: false })

  if (error) throw error
  return allCases || []
}

export async function fetchSpecialistCases(userId: string, specialty: string) {
  const supabase = await createClient()

  // Fetch assigned cases
  const { data: assignedCases, error: assignedError } = await supabase
    .from("cases")
    .select(
      `
      *,
      gp:gp_id(full_name, clinic_name),
      last_message:case_messages(sender_id, created_at)
    `,
    )
    .eq("specialist_id", userId)
    .order("created_at", { foreignTable: "case_messages", ascending: false })
    .limit(1, { foreignTable: "case_messages" })
    .order("created_at", { ascending: false })

  // Fetch available cases
  const { data: availableCases, error: availableError } = await supabase
    .from("cases")
    .select(
      `
      *,
      gp:gp_id(full_name, clinic_name)
    `,
    )
    .eq("status", "pending_assignment")
    .is("specialist_id", null)
    .eq("specialty_requested", specialty)
    .order("created_at", { ascending: false })

  if (assignedError) throw assignedError

  return {
    assignedCases: assignedCases || [],
    availableCases: availableCases || [],
  }
}

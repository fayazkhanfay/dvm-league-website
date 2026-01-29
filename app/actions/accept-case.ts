"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function acceptCase(caseId: string) {
  console.log("[v0] acceptCase called with caseId:", caseId)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Current user:", user?.id)

  if (!user) {
    console.log("[v0] No authenticated user")
    return { success: false, error: "Not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  console.log("[v0] User profile:", profile?.role, "specialty:", profile?.specialty)

  if (!profile || profile.role !== "specialist") {
    console.log("[v0] User is not a specialist")
    return { success: false, error: "Unauthorized" }
  }

  const { data: currentCase, error: fetchError } = await supabase
    .from("cases")
    .select("specialist_id, specialty_requested, status")
    .eq("id", caseId)
    .single()

  console.log("[v0] Current case data:", currentCase, "error:", fetchError)

  if (fetchError || !currentCase) {
    console.log("[v0] Case not found")
    return { success: false, error: "Case not found" }
  }

  if (currentCase.specialty_requested !== profile.specialty) {
    console.log("[v0] Specialty mismatch:", currentCase.specialty_requested, "vs", profile.specialty)
    return { success: false, error: "Specialty mismatch" }
  }

  if (currentCase.specialist_id !== null) {
    console.log("[v0] Case already assigned to:", currentCase.specialist_id)
    return { success: false, error: "Case already assigned to another specialist" }
  }

  console.log("[v0] Attempting to update case...")
  const { data: updateData, error: updateError } = await supabase
    .from("cases")
    .update({
      specialist_id: user.id,
      status: "in_progress",
    })
    .eq("id", caseId)
    .is("specialist_id", null) // Extra safety: only update if still NULL
    .select()

  console.log("[v0] Update result:", updateData, "error:", updateError)

  if (updateError) {
    console.log("[v0] Failed to update case:", updateError.message)
    return { success: false, error: "Failed to accept case: " + updateError.message }
  }

  if (!updateData || updateData.length === 0) {
    console.log("[v0] No rows updated - case may have been claimed by another specialist")
    return { success: false, error: "Case already assigned to another specialist" }
  }

  console.log("[v0] Case accepted successfully!")
  revalidatePath(`/specialist/case/${caseId}`)
  revalidatePath("/specialist-dashboard")

  return { success: true }
}

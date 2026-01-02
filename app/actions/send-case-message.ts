"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendCaseMessage(caseId: string, content: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Insert message into case_messages
  const { error } = await supabase.from("case_messages").insert({
    case_id: caseId,
    sender_id: user.id,
    content: content,
    message_type: "text",
    is_internal: false,
  })

  if (error) {
    console.error("[v0] Error sending message:", error)
    return { success: false, error: error.message }
  }

  // Revalidate the case page to show the new message in the timeline
  revalidatePath(`/gp/case/${caseId}`)
  revalidatePath(`/specialist/case/${caseId}`)

  return { success: true }
}

"use server"

import { createClient } from "@/lib/supabase/server"

export type TimelineEvent =
  | {
      type: "message"
      id: string
      case_id: string
      sender_id: string
      sender_name: string
      sender_role: "gp" | "specialist"
      content: string | null
      message_type: "text" | "system" | "report_phase1" | "report_phase2"
      is_internal: boolean
      created_at: string
    }
  | {
      type: "case_submission"
      id: string
      presenting_complaint: string
      brief_history: string
      pe_findings: string
      medications: string
      diagnostics_performed: string | null
      treatments_attempted: string | null
      gp_questions: string
      created_at: string
    }

export async function getCaseTimeline(caseId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] getCaseTimeline: User not authenticated")
    return { error: "Not authenticated" }
  }

  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select(
      "gp_id, specialist_id, presenting_complaint, brief_history, pe_findings, medications, diagnostics_performed, treatments_attempted, gp_questions, created_at",
    )
    .eq("id", caseId)
    .single()

  if (caseError || !caseData) {
    console.log("[v0] getCaseTimeline: Case not found", caseError)
    return { error: "Case not found" }
  }

  // Check authorization: GP owner, assigned specialist, OR specialist viewing unassigned case
  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const isGP = caseData.gp_id === user.id
  const isAssignedSpecialist = caseData.specialist_id === user.id
  const isSpecialistViewingUnassigned = userProfile?.role === "specialist" && caseData.specialist_id === null

  if (!isGP && !isAssignedSpecialist && !isSpecialistViewingUnassigned) {
    console.log("[v0] getCaseTimeline: Unauthorized", {
      userId: user.id,
      caseData,
      userProfile,
    })
    return { error: "Unauthorized" }
  }

  console.log("[v0] getCaseTimeline: Authorization check passed", {
    caseId,
    userId: user.id,
    isGP,
    isAssignedSpecialist,
    isSpecialistViewingUnassigned,
  })

  // Fetch messages with sender profile information
  const { data: messages, error: messagesError } = await supabase
    .from("case_messages")
    .select(
      `
      id,
      case_id,
      sender_id,
      content,
      message_type,
      is_internal,
      created_at,
      sender:sender_id(full_name, role)
    `,
    )
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (messagesError) {
    console.log("[v0] getCaseTimeline: Messages error", messagesError)
    return { error: messagesError.message }
  }

  console.log("[v0] getCaseTimeline: Fetched messages", messages?.length || 0)

  // Transform messages into TimelineEvent format
  const messageEvents: TimelineEvent[] = (messages || []).map((msg: any) => ({
    type: "message" as const,
    id: msg.id,
    case_id: msg.case_id,
    sender_id: msg.sender_id,
    sender_name: msg.sender?.full_name || "Unknown User",
    sender_role: msg.sender?.role || "gp",
    content: msg.content,
    message_type: msg.message_type,
    is_internal: msg.is_internal,
    created_at: msg.created_at,
  }))

  const caseSubmissionEvent: TimelineEvent = {
    type: "case_submission" as const,
    id: caseId,
    presenting_complaint: caseData.presenting_complaint,
    brief_history: caseData.brief_history,
    pe_findings: caseData.pe_findings,
    medications: caseData.medications,
    diagnostics_performed: caseData.diagnostics_performed,
    treatments_attempted: caseData.treatments_attempted,
    gp_questions: caseData.gp_questions,
    created_at: caseData.created_at,
  }

  const timeline = [caseSubmissionEvent, ...messageEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return { data: timeline }
}

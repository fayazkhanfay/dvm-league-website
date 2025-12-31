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
      type: "file"
      id: string
      case_id: string
      uploader_id: string
      uploader_name: string
      uploader_role: "gp" | "specialist"
      file_name: string
      storage_object_path: string
      file_type: string | null
      upload_phase: string | null
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
    .select("gp_id, specialist_id")
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

  // Fetch files with uploader profile information
  const { data: files, error: filesError } = await supabase
    .from("case_files")
    .select(
      `
      id,
      case_id,
      uploader_id,
      file_name,
      storage_object_path,
      file_type,
      upload_phase,
      uploaded_at,
      uploader:uploader_id(full_name, role)
    `,
    )
    .eq("case_id", caseId)
    .order("uploaded_at", { ascending: true })

  if (filesError) {
    console.log("[v0] getCaseTimeline: Files error", filesError)
    return { error: filesError.message }
  }

  console.log("[v0] getCaseTimeline: Fetched files", files?.length || 0)

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

  // Transform files into TimelineEvent format
  const fileEvents: TimelineEvent[] = (files || []).map((file: any) => ({
    type: "file" as const,
    id: file.id,
    case_id: file.case_id,
    uploader_id: file.uploader_id,
    uploader_name: file.uploader?.full_name || "Unknown User",
    uploader_role: file.uploader?.role || "gp",
    file_name: file.file_name,
    storage_object_path: file.storage_object_path,
    file_type: file.file_type,
    upload_phase: file.upload_phase,
    created_at: file.uploaded_at,
  }))

  // Merge and sort by created_at timestamp
  const timeline = [...messageEvents, ...fileEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return { data: timeline }
}

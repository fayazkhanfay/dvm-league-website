import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UnifiedCaseView } from "@/components/case/unified-case-view"

export default async function SpecialistCaseViewPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "specialist") {
    redirect("/login")
  }

  const { data: caseData, error } = await supabase
    .from("cases")
    .select("id, specialist_id, status")
    .eq("id", caseId)
    .single()

  if (error || !caseData) {
    redirect("/specialist-dashboard")
  }

  console.log("[v0] Specialist case access check:", {
    caseId,
    userId: user.id,
    specialistId: caseData.specialist_id,
    status: caseData.status,
    isAssignedToCurrentUser: caseData.specialist_id === user.id,
    isUnassigned: caseData.specialist_id === null,
  })

  const isAssignedToCurrentUser = caseData.specialist_id === user.id
  // Allow access if specialist_id is null, regardless of status (more permissive for claiming)
  const isUnassigned = caseData.specialist_id === null

  if (!isAssignedToCurrentUser && !isUnassigned) {
    // Case is assigned to another specialist
    console.log("[v0] Access denied: case assigned to different specialist")
    redirect("/specialist-dashboard")
  }

  return (
    <UnifiedCaseView
      caseId={caseId}
      viewerRole="specialist"
      userId={user.id}
      userProfile={{
        full_name: profile.full_name,
        is_demo: profile.is_demo,
      }}
    />
  )
}

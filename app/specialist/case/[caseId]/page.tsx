import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UnifiedCaseView } from "@/components/case/unified-case-view"
import { getCaseDetails } from "@/app/actions/get-case-details"
import { getCaseTimeline } from "@/app/actions/get-case-timeline"
import { getCaseFiles } from "@/app/actions/get-case-files"

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
  const isUnassigned = caseData.specialist_id === null

  if (!isAssignedToCurrentUser && !isUnassigned) {
    console.log("[v0] Access denied: case assigned to different specialist")
    redirect("/specialist-dashboard")
  }

  const [caseDetailsResult, timelineResult, filesResult] = await Promise.all([
    getCaseDetails(caseId),
    getCaseTimeline(caseId),
    getCaseFiles(caseId),
  ])

  return (
    <UnifiedCaseView
      caseId={caseId}
      viewerRole="specialist"
      userId={user.id}
      userProfile={{
        full_name: profile.full_name,
        is_demo: profile.is_demo,
      }}
      caseDetailsResult={caseDetailsResult}
      timelineResult={timelineResult}
      filesResult={filesResult}
    />
  )
}

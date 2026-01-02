import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UnifiedCaseView } from "@/components/case/unified-case-view"
import { getCaseDetails } from "@/app/actions/get-case-details"
import { getCaseTimeline } from "@/app/actions/get-case-timeline"
import { getCaseFiles } from "@/app/actions/get-case-files"

export default async function GPCaseViewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "gp") {
    redirect("/login")
  }

  const { data: caseData, error } = await supabase
    .from("cases")
    .select("id, gp_id")
    .eq("id", caseId)
    .eq("gp_id", user.id)
    .single()

  if (error || !caseData) {
    redirect("/gp-dashboard")
  }

  const [caseDetailsResult, timelineResult, filesResult] = await Promise.all([
    getCaseDetails(caseId),
    getCaseTimeline(caseId),
    getCaseFiles(caseId),
  ])

  return (
    <UnifiedCaseView
      caseId={caseId}
      viewerRole="gp"
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

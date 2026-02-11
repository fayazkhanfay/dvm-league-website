import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UnifiedCaseView } from "@/components/case/unified-case-view"
import { getCaseDetails } from "@/app/actions/get-case-details"
import { getCaseTimeline } from "@/app/actions/get-case-timeline"
import { getCaseFiles } from "@/app/actions/get-case-files"

import { getReportMetadata } from "@/app/actions/get-report-metadata"

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

  let finalReportUrl = null
  let specialistName = "Specialist"
  let submittedAt = undefined

  if (caseDetailsResult.data) {
    const metadata = await getReportMetadata(caseDetailsResult.data)
    finalReportUrl = metadata.finalReportUrl
    if (metadata.specialistName) specialistName = metadata.specialistName
    submittedAt = metadata.submittedAt
  }

  const { data: rawFiles } = await supabase
    .from('case_files')
    .select('*')
    .eq('case_id', caseId)
    .eq('upload_phase', 'specialist_report')

  // Prepare Signed Links for Attachments via parallel requests
  const reportAttachments = await Promise.all(
    (rawFiles || []).map(async (file) => {
      const { data } = await supabase.storage.from("case-bucket").createSignedUrl(file.storage_object_path, 3600)
      return { ...file, url: data?.signedUrl }
    })
  )

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
      finalReportUrl={finalReportUrl}
      specialistName={specialistName}
      submittedAt={submittedAt}
      finalReportFiles={reportAttachments}
    />
  )
}

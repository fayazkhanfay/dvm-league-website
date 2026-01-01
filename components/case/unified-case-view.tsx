"use client"

import { useState } from "react"
import type { getCaseDetails } from "@/app/actions/get-case-details"
import type { getCaseTimeline } from "@/app/actions/get-case-timeline"
import type { getCaseFiles } from "@/app/actions/get-case-files"
import { CaseHeader } from "./case-header"
import { CaseTimeline } from "./case-timeline"
import { CommandCenter } from "./command-center"
import { ReportSheet } from "./report-sheet"
import { AppLayout } from "@/components/app-layout"

interface UnifiedCaseViewProps {
  caseId: string
  viewerRole: "gp" | "specialist"
  userId: string
  userProfile: {
    full_name: string
    is_demo?: boolean
  }
  caseDetailsResult: Awaited<ReturnType<typeof getCaseDetails>>
  timelineResult: Awaited<ReturnType<typeof getCaseTimeline>>
  filesResult: Awaited<ReturnType<typeof getCaseFiles>>
}

export function UnifiedCaseView({
  caseId,
  viewerRole,
  userId,
  userProfile,
  caseDetailsResult,
  timelineResult,
  filesResult,
}: UnifiedCaseViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<"phase1" | "phase2" | "diagnostics">("phase1")

  if (caseDetailsResult.error || !caseDetailsResult.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Case Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The case you are looking for does not exist or you do not have access to it.
          </p>
        </div>
      </div>
    )
  }

  if (timelineResult.error || !timelineResult.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error Loading Timeline</h1>
          <p className="text-muted-foreground mt-2">There was an error loading the case timeline.</p>
        </div>
      </div>
    )
  }

  const caseData = caseDetailsResult.data
  const timelineEvents = timelineResult.data
  const caseFiles = filesResult.data || []

  const isAssignedToMe = viewerRole === "specialist" && caseData.specialist_id === userId

  return (
    <AppLayout
      activePage="myCases"
      userRole={viewerRole}
      userName={userProfile.full_name}
      isDemoUser={userProfile.is_demo}
    >
      <div className="container mx-auto py-8 px-4 pb-32">
        <div className="max-w-3xl mx-auto">
          {/* Header - Pinned at top */}
          <CaseHeader caseData={caseData} />

          {/* Body - Full width timeline with clinical history and file batches */}
          <div className="mt-6">
            <CaseTimeline
              events={timelineEvents}
              caseId={caseId}
              currentUserRole={viewerRole}
              files={caseFiles}
              caseData={caseData}
              userId={userId}
            />
          </div>
        </div>
      </div>

      <CommandCenter
        status={caseData.status}
        userRole={viewerRole}
        caseId={caseId}
        isAssignedToMe={isAssignedToMe}
        onOpenPhase1={() => {
          setSheetMode("phase1")
          setSheetOpen(true)
        }}
        onOpenPhase2={() => {
          setSheetMode("phase2")
          setSheetOpen(true)
        }}
        onOpenFileUpload={() => {
          setSheetMode("diagnostics")
          setSheetOpen(true)
        }}
      />

      <ReportSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        caseId={caseId}
        currentUserId={userId}
      />
    </AppLayout>
  )
}

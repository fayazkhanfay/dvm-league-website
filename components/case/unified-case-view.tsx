"use client"

import { useState } from "react"
import useSWR from "swr"
import type { getCaseDetails } from "@/app/actions/get-case-details"
import type { getCaseTimeline } from "@/app/actions/get-case-timeline"
import type { getCaseFiles } from "@/app/actions/get-case-files"
import { getCaseTimeline as fetchTimeline } from "@/app/actions/get-case-timeline"
import { getCaseFiles as fetchFiles } from "@/app/actions/get-case-files"
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
  const [showFinalReportSplit, setShowFinalReportSplit] = useState(false)

  const {
    data: timelineData,
    mutate: mutateTimeline,
    isLoading: isLoadingTimeline,
  } = useSWR(
    `timeline-${caseId}`,
    async () => {
      const result = await fetchTimeline(caseId)
      return result.data || []
    },
    {
      fallbackData: timelineResult.data || [],
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )

  const {
    data: filesData,
    mutate: mutateFiles,
    isLoading: isLoadingFiles,
  } = useSWR(
    `files-${caseId}`,
    async () => {
      const result = await fetchFiles(caseId)
      return result.data || []
    },
    {
      fallbackData: filesResult.data || [],
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )

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
  const timelineEvents = timelineData || []
  const caseFiles = filesData || []

  const isAssignedToMe = viewerRole === "specialist" && caseData.specialist_id === userId

  return (
    <AppLayout
      activePage="myCases"
      userRole={viewerRole}
      userName={userProfile.full_name}
      isDemoUser={userProfile.is_demo}
    >
      <div className={showFinalReportSplit ? "flex h-[calc(100vh-64px)] overflow-hidden" : ""}>
        {/* Left side - Main case view */}
        <div
          className={`transition-all duration-300 ${
            showFinalReportSplit ? "w-1/2 border-r overflow-y-auto" : "w-full"
          }`}
        >
          <div className={`py-8 pb-32 ${showFinalReportSplit ? "px-6" : "container mx-auto px-4"}`}>
            <div className={showFinalReportSplit ? "max-w-full mx-auto" : "max-w-3xl mx-auto"}>
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
                  isLoading={isLoadingTimeline || isLoadingFiles}
                />
              </div>
            </div>
          </div>
        </div>

        {showFinalReportSplit && (
          <div className="w-1/2 overflow-y-auto bg-white px-6">
            <ReportSheet
              open={showFinalReportSplit}
              onOpenChange={(open) => setShowFinalReportSplit(open)}
              mode="phase2"
              caseId={caseId}
              currentUserId={userId}
              splitMode={true}
            />
          </div>
        )}
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
        onOpenFinalReport={() => {
          setShowFinalReportSplit(true)
        }}
        onMessageSent={() => {
          mutateTimeline()
          mutateFiles()
        }}
      />

      <ReportSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        caseId={caseId}
        currentUserId={userId}
        splitMode={false}
      />
    </AppLayout>
  )
}

import { getCaseDetails } from "@/app/actions/get-case-details"
import { getCaseTimeline } from "@/app/actions/get-case-timeline"
import { getCaseFiles } from "@/app/actions/get-case-files"
import { CaseHeader } from "./case-header"
import { CaseTimeline } from "./case-timeline"
import { AppLayout } from "@/components/app-layout"

interface UnifiedCaseViewProps {
  caseId: string
  viewerRole: "gp" | "specialist"
  userId: string
  userProfile: {
    full_name: string
    is_demo?: boolean
  }
}

export async function UnifiedCaseView({ caseId, viewerRole, userId, userProfile }: UnifiedCaseViewProps) {
  const [caseDetailsResult, timelineResult, filesResult] = await Promise.all([
    getCaseDetails(caseId),
    getCaseTimeline(caseId),
    getCaseFiles(caseId),
  ])

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

  return (
    <AppLayout
      activePage="myCases"
      userRole={viewerRole}
      userName={userProfile.full_name}
      isDemoUser={userProfile.is_demo}
    >
      <div className="container mx-auto py-8 px-4">
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

          {/* Footer - Placeholder for future Command Center */}
          <div className="h-24" />
        </div>
      </div>
    </AppLayout>
  )
}

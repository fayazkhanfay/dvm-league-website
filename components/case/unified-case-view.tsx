import { getCaseDetails } from "@/app/actions/get-case-details"
import { getCaseTimeline } from "@/app/actions/get-case-timeline"
import { getCaseFiles } from "@/app/actions/get-case-files"
import { CaseHeader } from "./case-header"
import { CaseTimeline } from "./case-timeline"
import { ActionPanel } from "./action-panel"
import { FileGallery } from "./file-gallery"
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

  // Calculate if the case is assigned to the current user
  const isAssignedToMe = viewerRole === "gp" ? caseData.gp_id === userId : caseData.specialist_id === userId

  return (
    <AppLayout
      activePage="myCases"
      userRole={viewerRole}
      userName={userProfile.full_name}
      isDemoUser={userProfile.is_demo}
    >
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <CaseHeader caseData={caseData} />

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Timeline (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <CaseTimeline events={timelineEvents} caseId={caseId} currentUserRole={viewerRole} />
          </div>

          {/* Right: Sticky Sidebar (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <ActionPanel
                status={caseData.status}
                userRole={viewerRole}
                caseId={caseId}
                currentUserId={userId}
                isAssignedToMe={isAssignedToMe}
                gpId={caseData.gp_id}
                specialistId={caseData.specialist_id}
                clientSummary={caseData.phase2_client_summary}
              />
              <FileGallery caseId={caseId} files={caseFiles} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { CaseDetails } from "@/app/actions/get-case-details"

interface CaseHeaderProps {
  caseData: CaseDetails
}

const STATUS_LABELS: Record<string, string> = {
  pending_assignment: "Pending Assignment",
  awaiting_phase1: "Awaiting Phase 1",
  awaiting_diagnostics: "Awaiting Diagnostics",
  awaiting_phase2: "Awaiting Phase 2",
  completed: "Completed",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_assignment: "outline",
  awaiting_phase1: "secondary",
  awaiting_diagnostics: "secondary",
  awaiting_phase2: "secondary",
  completed: "default",
}

export function CaseHeader({ caseData }: CaseHeaderProps) {
  const statusLabel = STATUS_LABELS[caseData.status] || caseData.status
  const statusVariant = STATUS_VARIANTS[caseData.status] || "default"

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left: Patient Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-balance">{caseData.patient_name}</h1>
          <p className="text-muted-foreground text-lg mt-1">
            {caseData.patient_species} • {caseData.patient_breed}
          </p>

          {/* Details Row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Age:</span>{" "}
              <span className="font-medium">{caseData.patient_age}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Weight:</span>{" "}
              <span className="font-medium">{caseData.patient_weight_kg} kg</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gender:</span>{" "}
              <span className="font-medium">{caseData.patient_sex_status}</span>
            </div>
          </div>

          {/* Referral Reason */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Referral Reason</p>
            <p className="text-sm line-clamp-2">{caseData.gp_questions}</p>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div>
          <Badge variant={statusVariant} className="text-sm px-3 py-1.5">
            {statusLabel}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { CaseDetails } from "@/app/actions/get-case-details"

interface CaseHeaderProps {
  caseData: CaseDetails
}

const STATUS_LABELS: Record<string, string> = {
  pending_assignment: "Pending Assignment",
  in_progress: "Active Case",
  completed: "Completed",
  cancelled: "Cancelled",
  draft: "Draft",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_assignment: "outline",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
  draft: "secondary",
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
            {caseData.patient_vax_status && (
              <div>
                <span className="text-muted-foreground">Vaccination Status:</span>{" "}
                <span className="font-medium">{caseData.patient_vax_status}</span>
              </div>
            )}
          </div>

          {caseData.patient_preventatives && caseData.patient_preventatives.length > 0 && (
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">Preventatives:</span>{" "}
              <span className="font-medium">{caseData.patient_preventatives.join(", ")}</span>
            </div>
          )}

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

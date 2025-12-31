"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Stethoscope, Clock } from "lucide-react"
import { acceptCase } from "@/app/actions/accept-case"
import { useRouter } from "next/navigation"

type ActionPanelProps = {
  caseId: string
  status: string
  userRole: "gp" | "specialist"
  isAssignedToMe: boolean
}

export function ActionPanel({ caseId, status, userRole, isAssignedToMe }: ActionPanelProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClaimCase = async () => {
    setIsLoading(true)
    console.log("[v0] Claiming case:", caseId)

    const result = await acceptCase(caseId)

    if (result.success) {
      console.log("[v0] Case claimed successfully")
      router.refresh()
    } else {
      console.error("[v0] Failed to claim case:", result.error)
      alert(result.error || "Failed to claim case")
    }

    setIsLoading(false)
  }

  const handleWritePhase1Report = () => {
    console.log("[v0] Open Modal - Write Phase 1 Report")
  }

  const handleUploadDiagnostics = () => {
    console.log("[v0] Open Upload Modal - Upload Diagnostics")
  }

  // Scenario 1: Specialist + Pending Assignment
  if (userRole === "specialist" && status === "pending_assignment") {
    return (
      <Card className="border-amber-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-5 text-amber-600" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">This case is available and matches your specialty.</p>
          <Button className="w-full" onClick={handleClaimCase} disabled={isLoading}>
            {isLoading ? "Claiming..." : "Claim Case"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Scenario 2: Specialist + Assigned to Me + Awaiting Phase 1
  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase1") {
    return (
      <Card className="border-blue-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Review the case and write your Phase 1 diagnostic plan.</p>
          <Button className="w-full" onClick={handleWritePhase1Report}>
            <FileText className="size-4" />
            Write Phase 1 Report
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Scenario 3: GP + Awaiting Diagnostics
  if (userRole === "gp" && status === "awaiting_diagnostics") {
    return (
      <Card className="border-green-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5 text-green-600" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Upload the diagnostic results as requested by the specialist.</p>
          <Button className="w-full" onClick={handleUploadDiagnostics}>
            <Upload className="size-4" />
            Upload Diagnostics
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Scenario 4: Default/Waiting State
  const getStatusMessage = () => {
    switch (status) {
      case "pending_assignment":
        return "Waiting for a specialist to claim this case"
      case "awaiting_phase1":
        return "Specialist is reviewing the case"
      case "awaiting_diagnostics":
        return "Waiting for diagnostic results to be uploaded"
      case "awaiting_phase2":
        return "Specialist is preparing the final report"
      case "completed":
        return "Case has been completed"
      default:
        return "Case is in progress"
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "pending_assignment":
        return "text-amber-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <Alert>
      <Clock className="size-4" />
      <AlertTitle>Status Update</AlertTitle>
      <AlertDescription>
        <span className={getStatusColor()}>{getStatusMessage()}</span>
      </AlertDescription>
    </Alert>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, ImageIcon } from "lucide-react"

interface SpecialistCaseViewProps {
  caseData: any
  userProfile: any
}

export default function SpecialistCaseView({ caseData, userProfile }: SpecialistCaseViewProps) {
  const router = useRouter()
  const [phase1Plan, setPhase1Plan] = useState(caseData.phase1_plan || "")
  const [phase2Assessment, setPhase2Assessment] = useState(caseData.phase2_assessment || "")
  const [phase2TreatmentPlan, setPhase2TreatmentPlan] = useState(caseData.phase2_treatment_plan || "")
  const [phase2Prognosis, setPhase2Prognosis] = useState(caseData.phase2_prognosis || "")
  const [phase2ClientSummary, setPhase2ClientSummary] = useState(caseData.phase2_client_summary || "")

  const signalment = caseData.patient_signalment
  const initialFiles = caseData.case_files?.filter((f: any) => f.upload_phase === "initial_submission") || []
  const diagnosticFiles = caseData.case_files?.filter((f: any) => f.upload_phase === "diagnostic_results") || []

  const handleSubmitPhase1 = () => {
    // TODO: Implement Supabase update
    console.log("[v0] Submitting Phase 1 Plan:", phase1Plan)
    router.push("/specialist-dashboard")
  }

  const handleSubmitPhase2 = () => {
    // TODO: Implement Supabase update
    console.log("[v0] Submitting Phase 2 Report")
    router.push("/specialist-dashboard")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_phase1":
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            Awaiting Phase 1 Report
          </Badge>
        )
      case "awaiting_diagnostics":
        return <Badge variant="secondary">Awaiting Diagnostics Upload</Badge>
      case "awaiting_phase2":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            Awaiting Phase 2 Report
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Completed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const isAwaitingPhase1 = caseData.status === "awaiting_phase1"
  const isAwaitingDiagnostics = caseData.status === "awaiting_diagnostics"
  const isAwaitingPhase2 = caseData.status === "awaiting_phase2"
  const isCompleted = caseData.status === "completed"

  return (
    <AppLayout activePage="myCases" userName={userProfile.full_name}>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Case Information */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <Card className="border-brand-stone shadow-md">
                <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                  <CardTitle className="text-lg font-bold text-brand-navy">Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* GP Information */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Referring GP</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Name</p>
                        <p className="text-sm text-brand-navy/80">{caseData.gp?.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Clinic</p>
                        <p className="text-sm text-brand-navy/80">{caseData.gp?.clinic_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Patient Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Name</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Signalment</p>
                        <p className="text-sm text-brand-navy/80">
                          {signalment.species}, {signalment.breed}, {signalment.age}, {signalment.sex_status},{" "}
                          {signalment.weight_kg} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Case Details */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Case Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Presenting Complaint</p>
                        <p className="text-sm text-brand-navy/80">{caseData.presenting_complaint}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Brief History</p>
                        <p className="text-sm text-brand-navy/80">{caseData.brief_history}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">PE Findings</p>
                        <p className="text-sm text-brand-navy/80">{caseData.pe_findings}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Current Medications</p>
                        <p className="text-sm text-brand-navy/80">{caseData.medications}</p>
                      </div>
                      {caseData.diagnostics_performed && (
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">Diagnostics Performed</p>
                          <p className="text-sm text-brand-navy/80">{caseData.diagnostics_performed}</p>
                        </div>
                      )}
                      {caseData.treatments_attempted && (
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">Treatments Attempted</p>
                          <p className="text-sm text-brand-navy/80">{caseData.treatments_attempted}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">GP's Questions</p>
                        <div className="mt-1 rounded-md bg-brand-offwhite p-3">
                          <p className="text-sm text-brand-navy/90">{caseData.gp_questions}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  {initialFiles.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-base font-bold text-brand-navy">Initial Files</h3>
                      <div className="space-y-2">
                        {initialFiles.map((file: any) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 rounded-md bg-white p-2 text-xs shadow-sm"
                          >
                            {file.file_type?.includes("image") || file.file_name.endsWith(".dcm") ? (
                              <ImageIcon className="h-3 w-3 text-brand-navy/60" />
                            ) : (
                              <FileText className="h-3 w-3 text-brand-navy/60" />
                            )}
                            <span className="text-brand-navy/80">{file.file_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagnosticFiles.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-base font-bold text-brand-navy">Diagnostic Files</h3>
                      <div className="space-y-2">
                        {diagnosticFiles.map((file: any) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 rounded-md bg-white p-2 text-xs shadow-sm"
                          >
                            <FileText className="h-3 w-3 text-brand-navy/60" />
                            <span className="text-brand-navy/80">{file.file_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Report Forms */}
          <div className="lg:col-span-2">
            <Link
              href="/specialist-dashboard"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold text-brand-navy">
                Case: {caseData.patient_name} ({caseData.id.slice(0, 8).toUpperCase()})
              </h1>
              <div className="mt-3">{getStatusBadge(caseData.status)}</div>
            </div>

            {/* Phase 1 Form */}
            {isAwaitingPhase1 && (
              <Card className="mb-6 border-2 border-brand-gold shadow-md">
                <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                  <CardTitle className="text-xl font-bold text-brand-navy">Submit Phase 1 Diagnostic Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="phase1-plan" className="text-sm font-medium text-brand-navy">
                      Diagnostic Plan & Recommendations
                    </Label>
                    <Textarea
                      id="phase1-plan"
                      value={phase1Plan}
                      onChange={(e) => setPhase1Plan(e.target.value)}
                      placeholder="Provide your diagnostic plan and recommendations..."
                      rows={12}
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitPhase1}
                    className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
                  >
                    Submit Phase 1 Plan
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Awaiting Diagnostics Message */}
            {isAwaitingDiagnostics && (
              <Card className="mb-6 border-brand-stone shadow-sm">
                <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                  <CardTitle className="text-xl font-bold text-brand-navy">Phase 1 Plan Submitted</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6 whitespace-pre-line text-brand-navy/90">{caseData.phase1_plan}</div>
                  <div className="rounded-md bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                      Awaiting diagnostic results from GP. You will be notified when they upload the results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Phase 2 Form */}
            {isAwaitingPhase2 && (
              <>
                {caseData.phase1_plan && (
                  <Card className="mb-6 border-brand-stone shadow-sm">
                    <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                      <CardTitle className="text-lg font-bold text-brand-navy">Your Phase 1 Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="whitespace-pre-line text-sm text-brand-navy/90">{caseData.phase1_plan}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="mb-6 border-2 border-brand-gold shadow-md">
                  <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                    <CardTitle className="text-xl font-bold text-brand-navy">Submit Phase 2 Final Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <Label htmlFor="phase2-assessment" className="text-sm font-medium text-brand-navy">
                        Assessment
                      </Label>
                      <Textarea
                        id="phase2-assessment"
                        value={phase2Assessment}
                        onChange={(e) => setPhase2Assessment(e.target.value)}
                        placeholder="Provide your assessment based on diagnostic results..."
                        rows={6}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phase2-treatment" className="text-sm font-medium text-brand-navy">
                        Treatment Plan
                      </Label>
                      <Textarea
                        id="phase2-treatment"
                        value={phase2TreatmentPlan}
                        onChange={(e) => setPhase2TreatmentPlan(e.target.value)}
                        placeholder="Provide detailed treatment recommendations..."
                        rows={8}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phase2-prognosis" className="text-sm font-medium text-brand-navy">
                        Prognosis
                      </Label>
                      <Textarea
                        id="phase2-prognosis"
                        value={phase2Prognosis}
                        onChange={(e) => setPhase2Prognosis(e.target.value)}
                        placeholder="Provide prognosis information..."
                        rows={4}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phase2-client-summary" className="text-sm font-medium text-brand-navy">
                        Client-Friendly Summary
                      </Label>
                      <p className="mt-1 text-xs text-brand-navy/70">
                        Write a summary that the GP can share directly with the pet owner
                      </p>
                      <Textarea
                        id="phase2-client-summary"
                        value={phase2ClientSummary}
                        onChange={(e) => setPhase2ClientSummary(e.target.value)}
                        placeholder="Provide a client-friendly summary..."
                        rows={6}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitPhase2}
                      className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
                    >
                      Submit Final Report
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Completed View */}
            {isCompleted && (
              <>
                <Card className="mb-6 border-brand-stone shadow-sm">
                  <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                    <CardTitle className="text-xl font-bold text-brand-navy">Phase 1 Diagnostic Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase1_plan}</p>
                  </CardContent>
                </Card>

                <Card className="mb-6 border-brand-stone shadow-sm">
                  <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                    <CardTitle className="text-xl font-bold text-brand-navy">Phase 2 Final Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {caseData.phase2_assessment && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Assessment</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_assessment}</p>
                      </div>
                    )}
                    {caseData.phase2_treatment_plan && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Treatment Plan</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_treatment_plan}</p>
                      </div>
                    )}
                    {caseData.phase2_prognosis && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Prognosis</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_prognosis}</p>
                      </div>
                    )}
                    {caseData.phase2_client_summary && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Client-Friendly Summary</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_client_summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}

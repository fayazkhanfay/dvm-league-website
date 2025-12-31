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
import { ArrowLeft, FileText, ImageIcon, Lock, Loader2 } from "lucide-react"
import { acceptCase } from "@/app/actions/accept-case"
import { submitPhase1 } from "@/app/actions/submit-phase1"
import { submitPhase2 } from "@/app/actions/submit-phase2"

interface SmartCaseViewProps {
  caseData: any
  userProfile: any
  caseState: "unassigned" | "accepted" | "taken"
}

export default function SmartCaseView({ caseData, userProfile, caseState }: SmartCaseViewProps) {
  const router = useRouter()
  const [phase1Plan, setPhase1Plan] = useState(caseData.phase1_plan || "")
  const [phase2Assessment, setPhase2Assessment] = useState(caseData.phase2_assessment || "")
  const [phase2TreatmentPlan, setPhase2TreatmentPlan] = useState(caseData.phase2_treatment_plan || "")
  const [phase2Prognosis, setPhase2Prognosis] = useState(caseData.phase2_prognosis || "")
  const [phase2ClientSummary, setPhase2ClientSummary] = useState(caseData.phase2_client_summary || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const signalment = caseData.patient_signalment
  const initialFiles = caseData.case_files?.filter((f: any) => f.upload_phase === "initial_submission") || []
  const diagnosticFiles = caseData.case_files?.filter((f: any) => f.upload_phase === "diagnostic_results") || []

  const handleAcceptCase = async () => {
    setIsSubmitting(true)
    setError("")

    const result = await acceptCase(caseData.id)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Failed to accept case")
      setIsSubmitting(false)
    }
  }

  const handleSubmitPhase1 = async () => {
    if (!phase1Plan.trim()) {
      setError("Please provide a diagnostic plan")
      return
    }

    setIsSubmitting(true)
    setError("")

    const result = await submitPhase1(caseData.id, phase1Plan)

    if (result.success) {
      router.push("/specialist-dashboard")
    } else {
      setError(result.error || "Failed to submit Phase 1 plan")
      setIsSubmitting(false)
    }
  }

  const handleSubmitPhase2 = async () => {
    if (
      !phase2Assessment.trim() ||
      !phase2TreatmentPlan.trim() ||
      !phase2Prognosis.trim() ||
      !phase2ClientSummary.trim()
    ) {
      setError("Please fill in all Phase 2 report fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    const result = await submitPhase2(caseData.id, {
      assessment: phase2Assessment,
      treatmentPlan: phase2TreatmentPlan,
      prognosis: phase2Prognosis,
      clientSummary: phase2ClientSummary,
    })

    if (result.success) {
      router.push("/specialist-dashboard")
    } else {
      setError(result.error || "Failed to submit Phase 2 report")
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_assignment":
        return (
          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
            Available Opportunity
          </Badge>
        )
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

  const isAwaitingPhase1 = caseData.status === "awaiting_phase1" && caseState === "accepted"
  const isAwaitingDiagnostics = caseData.status === "awaiting_diagnostics" && caseState === "accepted"
  const isAwaitingPhase2 = caseData.status === "awaiting_phase2" && caseState === "accepted"
  const isCompleted = caseData.status === "completed"

  return (
    <AppLayout
      activePage="myCases"
      userName={userProfile.full_name}
      userRole="specialist"
      isDemoUser={userProfile.is_demo}
    >
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {caseState === "taken" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="max-w-2xl border-2 border-brand-red shadow-lg">
              <CardHeader className="border-b border-brand-red bg-brand-red/10">
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-brand-red" />
                  <CardTitle className="text-2xl font-bold text-brand-navy">Case No Longer Available</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-lg text-brand-navy/80 leading-relaxed">
                  This case has already been accepted by another specialist and is no longer available.
                </p>
                <p className="text-brand-navy/70">
                  Case ID: <span className="font-mono font-semibold">{caseData.id.slice(0, 8).toUpperCase()}</span>
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => router.push("/specialist-dashboard")}
                    className="w-full bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-white"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(caseState === "unassigned" || caseState === "accepted") && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Case Information (Read-Only) */}
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

                    {diagnosticFiles.length > 0 && caseState === "accepted" && (
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

            {/* Right Column: Action Area */}
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

              {caseState === "unassigned" && (
                <Card className="mb-6 border-2 border-brand-gold shadow-lg">
                  <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                    <CardTitle className="text-2xl font-bold text-brand-navy">Case Opportunity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                      <h3 className="font-bold text-brand-navy mb-2">This case is available!</h3>
                      <p className="text-sm text-brand-navy/80 leading-relaxed">
                        This {caseData.specialty_requested} case is currently unassigned. Review the case details on the
                        left, and if you'd like to accept it, click the button below.
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red border border-brand-red/30">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleAcceptCase}
                      disabled={isSubmitting}
                      className="w-full transform rounded-md bg-brand-gold px-8 py-6 text-xl font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                          Accepting Case...
                        </>
                      ) : (
                        "ACCEPT CASE"
                      )}
                    </Button>

                    <p className="text-xs text-center text-brand-navy/60">
                      By accepting this case, you commit to providing Phase 1 diagnostic recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}

              {caseState === "accepted" && (
                <>
                  {/* Phase 1 Form */}
                  {isAwaitingPhase1 && (
                    <Card className="mb-6 border-2 border-brand-gold shadow-md">
                      <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                        <CardTitle className="text-xl font-bold text-brand-navy">
                          Submit Phase 1 Diagnostic Plan
                        </CardTitle>
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
                            disabled={isSubmitting}
                            className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                          />
                        </div>

                        {error && <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red">{error}</div>}

                        <Button
                          onClick={handleSubmitPhase1}
                          disabled={isSubmitting}
                          className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Phase 1 Plan"
                          )}
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
                        <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
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
                          <CardTitle className="text-xl font-bold text-brand-navy">
                            Submit Phase 2 Final Report
                          </CardTitle>
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
                              disabled={isSubmitting}
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
                              disabled={isSubmitting}
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
                              disabled={isSubmitting}
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
                              disabled={isSubmitting}
                              className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                            />
                          </div>

                          {error && (
                            <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red">{error}</div>
                          )}

                          <Button
                            onClick={handleSubmitPhase2}
                            disabled={isSubmitting}
                            className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Final Report"
                            )}
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
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  )
}

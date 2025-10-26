"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, UploadCloud, FileText, ImageIcon, Copy, CheckCircle } from "lucide-react"

export default function GPCaseViewPage() {
  const router = useRouter()

  // Change this to test different scenarios: "Phase 1 Plan Ready", "Awaiting Diagnostics Upload", "Phase 2 Plan Ready", "Completed"
  const [caseStatus] = useState<string>("Phase 1 Plan Ready")
  const [copied, setCopied] = useState(false)

  // Hardcoded case data
  const caseData = {
    caseId: "DVML-001",
    patientName: "Buddy Smith",
    specialty: "Internal Medicine",
    specialistName: "Dr. Jane Smith",
    submittedDate: "2025-01-15",

    // GP's original submission
    presentingComplaint: "Chronic vomiting and weight loss over the past 3 weeks",
    briefHistory:
      "8-year-old Golden Retriever with a 3-week history of intermittent vomiting (2-3x daily) and progressive weight loss (2kg). Appetite decreased. No diarrhea. Current diet: Premium dry food. No known toxin exposure.",
    peFindings:
      "BCS 4/9, mild dehydration (5%), abdominal palpation reveals mild cranial abdominal discomfort, no masses palpated. Otherwise unremarkable PE.",
    currentMedications: "Metronidazole 250mg PO BID (started 5 days ago), Cerenia 16mg PO SID PRN",
    diagnostics:
      "CBC: Mild leukocytosis (18,000). Chemistry: Mild hypoalbuminemia (2.2 g/dL). Fecal: Negative for parasites.",
    specificQuestions:
      "What additional diagnostics would you recommend? Could this be IBD or something more serious like lymphoma?",

    // Phase 1 Plan from specialist
    phase1Plan:
      "Based on the clinical presentation and initial diagnostics, I recommend the following diagnostic workup:\n\n1. Abdominal ultrasound to evaluate GI tract thickness, lymph nodes, and rule out masses\n2. Complete thyroid panel (T4, fT4, TSH)\n3. Cobalamin and folate levels\n4. Fecal alpha-1 proteinase inhibitor (if available)\n5. Consider endoscopy with biopsies if ultrasound findings are suggestive of inflammatory or neoplastic disease\n\nThe combination of weight loss, hypoalbuminemia, and GI signs is concerning for protein-losing enteropathy, IBD, or alimentary lymphoma. The ultrasound will help guide our next steps.",

    // Phase 2 Final Report (for Scenario B)
    phase2Assessment:
      "Ultrasound revealed diffuse thickening of the small intestinal wall (>5mm) with loss of normal layering, consistent with infiltrative disease. Mesenteric lymphadenopathy present. Endoscopic biopsies confirmed small cell lymphoma (T-cell immunophenotype).",
    treatmentPlan:
      "1. Initiate COP chemotherapy protocol (Cyclophosphamide, Vincristine, Prednisone)\n2. Start prednisone 2mg/kg PO daily, taper after 2 weeks\n3. Cyclophosphamide 200mg/m² PO on days 1, 8, 15, 22 (first cycle)\n4. Vincristine 0.5mg/m² IV on days 8 and 15\n5. Nutritional support: High-quality, easily digestible protein diet\n6. Monitor CBC weekly during initial treatment phase\n7. Recheck ultrasound in 8-12 weeks to assess response",
    prognosis:
      "Small cell lymphoma in dogs generally carries a favorable prognosis with treatment. Median survival time with COP protocol is 12-24 months, with many dogs achieving good quality of life. Response rates are typically 70-80%. Regular monitoring and client communication will be essential.",
    clientSummary:
      "Buddy has been diagnosed with small cell lymphoma, a type of cancer affecting the intestines. While this is serious, this form of lymphoma typically responds well to treatment. We'll be starting a chemotherapy protocol that uses three medications given over several weeks. Most dogs tolerate this treatment well with minimal side effects. With treatment, we expect Buddy to feel much better and have 1-2 good quality years ahead. We'll monitor him closely with regular check-ups and blood tests.",

    // Uploaded diagnostic files (for Scenario B)
    diagnosticFiles: ["Ultrasound_Report.pdf", "Endoscopy_Images.jpg", "Biopsy_Results.pdf"],
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(caseData.clientSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitDiagnostics = () => {
    router.push("/gp-dashboard")
  }

  const isPhase1OrAwaiting = caseStatus === "Phase 1 Plan Ready" || caseStatus === "Awaiting Diagnostics Upload"
  const isPhase2OrCompleted = caseStatus === "Phase 2 Plan Ready" || caseStatus === "Completed"

  return (
    <AppLayout activePage="myCases" userRole="gp" userName="Dr. Sarah Chen">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to Dashboard Link */}
        <Link
          href="/gp-dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Page Title & Status */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-brand-navy">
            View Case: {caseData.patientName} ({caseData.caseId})
          </h1>
          <div className="mt-3">
            <Badge
              variant={
                caseStatus === "Completed"
                  ? "default"
                  : caseStatus === "Phase 2 Plan Ready"
                    ? "default"
                    : caseStatus === "Awaiting Diagnostics Upload"
                      ? "secondary"
                      : "outline"
              }
              className={
                caseStatus === "Completed"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : caseStatus === "Phase 2 Plan Ready"
                    ? "bg-brand-gold/20 text-brand-navy hover:bg-brand-gold/20"
                    : caseStatus === "Awaiting Diagnostics Upload"
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-100"
              }
            >
              {caseStatus}
            </Badge>
          </div>
        </div>

        {/* Specialist Info Card */}
        <Card className="mb-6 border-brand-stone shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
              <span className="font-semibold text-brand-navy">JS</span>
            </div>
            <div>
              <p className="font-semibold text-brand-navy">{caseData.specialistName}</p>
              <p className="text-sm text-brand-navy/70">{caseData.specialty}</p>
            </div>
          </CardContent>
        </Card>

        {/* Conditional Content Based on Status */}
        {isPhase1OrAwaiting && (
          <>
            {/* Phase 1 Report Card */}
            <Card className="mb-6 border-brand-stone shadow-sm">
              <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                <CardTitle className="text-xl font-bold text-brand-navy">Phase 1: Diagnostic Plan Received</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="whitespace-pre-line text-brand-navy/90">{caseData.phase1Plan}</div>
              </CardContent>
            </Card>

            {/* Action Required Section */}
            <Card className="mb-6 border-2 border-brand-gold shadow-md">
              <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                <CardTitle className="text-xl font-bold text-brand-navy">Next Step: Upload Diagnostics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-6 text-brand-navy/90">
                  Please perform the recommended diagnostics. Once complete, upload the results (e.g., lab reports,
                  imaging reports/DICOMs) below to receive the Phase 2 Treatment Plan from {caseData.specialistName}.
                </p>

                {/* File Upload Area */}
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-semibold text-brand-navy">Upload Diagnostic Results</h3>
                    <div className="rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-8 text-center transition-colors hover:border-brand-gold">
                      <UploadCloud className="mx-auto h-12 w-12 text-brand-navy/40" />
                      <p className="mt-2 text-sm text-brand-navy/70">Click to upload or drag and drop</p>
                      <p className="mt-1 text-xs text-brand-navy/50">PDF, DICOM, JPG, PNG up to 50MB</p>
                      <input type="file" className="hidden" />
                    </div>
                  </div>

                  {/* Hardcoded Uploaded Files */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-brand-navy">Uploaded Files:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                        <FileText className="h-4 w-4 text-brand-navy/60" />
                        <span className="text-brand-navy">Ultrasound_Report.pdf</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                        <ImageIcon className="h-4 w-4 text-brand-navy/60" />
                        <span className="text-brand-navy">Endoscopy_Images.jpg</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitDiagnostics}
                    className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
                  >
                    Confirm & Submit Diagnostic Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isPhase2OrCompleted && (
          <>
            {/* Phase 2 Final Report Card */}
            <Card className="mb-6 border-brand-stone shadow-sm">
              <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                <CardTitle className="text-xl font-bold text-brand-navy">Phase 2: Final Report Received</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="mb-2 font-semibold text-brand-navy">Assessment</h3>
                  <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2Assessment}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-brand-navy">Treatment Plan</h3>
                  <p className="whitespace-pre-line text-brand-navy/90">{caseData.treatmentPlan}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-brand-navy">Prognosis</h3>
                  <p className="whitespace-pre-line text-brand-navy/90">{caseData.prognosis}</p>
                </div>
              </CardContent>
            </Card>

            {/* Client-Friendly Summary Card */}
            <Card className="mb-6 border-2 border-brand-gold bg-brand-gold/10 shadow-md">
              <CardHeader className="border-b border-brand-gold">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-brand-navy">
                  Client-Friendly Summary
                  <Button
                    onClick={handleCopySummary}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white bg-transparent"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Summary for Client
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-brand-navy/90">{caseData.clientSummary}</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Case History & Files Accordion */}
        <Accordion type="single" collapsible className="rounded-lg border border-brand-stone bg-white shadow-sm">
          <AccordionItem value="case-history" className="border-none">
            <AccordionTrigger className="px-6 py-4 font-semibold text-brand-navy hover:no-underline">
              View Case History & Files
            </AccordionTrigger>
            <AccordionContent className="space-y-6 px-6 pb-6">
              {/* Original GP Submission */}
              <div>
                <h3 className="mb-3 font-semibold text-brand-navy">Original Case Submission</h3>
                <div className="space-y-3 rounded-lg bg-brand-offwhite p-4">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Presenting Complaint:</p>
                    <p className="text-sm text-brand-navy/80">{caseData.presentingComplaint}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Brief History:</p>
                    <p className="text-sm text-brand-navy/80">{caseData.briefHistory}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">PE Findings:</p>
                    <p className="text-sm text-brand-navy/80">{caseData.peFindings}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Current Medications:</p>
                    <p className="text-sm text-brand-navy/80">{caseData.currentMedications}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Diagnostics Performed:</p>
                    <p className="text-sm text-brand-navy/80">{caseData.diagnostics}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Specific Questions:</p>
                    <p className="text-sm text-brand-navy/80">{caseData.specificQuestions}</p>
                  </div>
                </div>
              </div>

              {/* Phase 1 Plan */}
              <div>
                <h3 className="mb-3 font-semibold text-brand-navy">Phase 1 Diagnostic Plan</h3>
                <div className="rounded-lg bg-brand-offwhite p-4">
                  <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase1Plan}</p>
                </div>
              </div>

              {/* All Files */}
              <div>
                <h3 className="mb-3 font-semibold text-brand-navy">All Attached Files</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                    <ImageIcon className="h-4 w-4 text-brand-navy/60" />
                    <span className="text-brand-navy">Radiograph_Lateral.dcm</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                    <FileText className="h-4 w-4 text-brand-navy/60" />
                    <span className="text-brand-navy">Lab_Results.pdf</span>
                  </div>
                  {isPhase2OrCompleted &&
                    caseData.diagnosticFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                        <FileText className="h-4 w-4 text-brand-navy/60" />
                        <span className="text-brand-navy">{file}</span>
                      </div>
                    ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    </AppLayout>
  )
}

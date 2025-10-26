"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, FileText, ImageIcon, Copy, CheckCircle } from "lucide-react"

export default function GPCaseViewDVML002Page() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const caseStatus = "Completed"

  const caseData = {
    caseId: "DVML-002",
    patientName: "Bella",
    specialty: "Dermatology",
    specialistName: "Dr. Emily Carter",
    submittedDate: "2025-01-10",

    // GP's original submission - detailed patient info
    species: "Feline",
    breed: "Domestic Shorthair",
    age: "12 years",
    sex: "Female Spayed",
    weight: "5 kg",
    vaccinationStatus: "Overdue",
    preventativeStatus: "None",

    presentingComplaint: "Severe pruritus and progressive alopecia on head and neck for 6 weeks",
    briefHistory:
      "12-year-old DSH with 6-week history of intense scratching and hair loss primarily affecting the head, neck, and ears. Owner reports constant scratching, especially at night. No recent diet changes. Indoor only cat. No other pets in household. Previous flea treatment 3 months ago.",
    peFindings:
      "Extensive excoriations and crusting on head, neck, and pinnae. Bilateral alopecia in preauricular regions. Erythema and lichenification present. No ectoparasites visualized on exam. Mild cervical lymphadenopathy. Otherwise unremarkable PE.",
    currentMedications: "Prednisolone 5mg PO SID (started 2 weeks ago - minimal improvement)",
    diagnosticsPerformed:
      "Skin scraping: Negative for mites. Flea comb: Negative. Cytology from crusts: Mixed bacterial population with neutrophils. Fungal culture: Pending (sent 1 week ago).",
    treatmentsAttempted:
      "Revolution Plus applied 3 weeks ago, Prednisolone 5mg daily for 2 weeks - minimal response, Cephalexin 50mg BID for 10 days - slight improvement in crusting",
    specificQuestions:
      "Could this be food allergy, atopy, or something else? The steroids aren't helping much. What's the best diagnostic approach?",
    initialFiles: ["Bella_Photos.zip", "Cytology_Report.pdf"],

    // Phase 1 Plan from specialist
    phase1Plan:
      "Based on the clinical presentation and initial diagnostics, I recommend the following diagnostic workup:\n\n1. Complete dermatology panel: IgE allergy testing (environmental and food allergens)\n2. Skin biopsy from affected areas (head/neck) - looking for eosinophilic dermatitis, pemphigus, or neoplasia\n3. Complete fungal culture results review\n4. Consider FeLV/FIV testing if not current\n5. Thyroid panel (T4) given age\n\nThe poor response to steroids and the distribution pattern (head/neck) raises concern for pemphigus foliaceus or food allergy. The skin biopsy will be most diagnostic. In the meantime, continue antibiotics and consider Elizabethan collar to prevent self-trauma.",

    // Phase 2 Final Report
    phase2Assessment:
      "Skin biopsy results confirmed pemphigus foliaceus with characteristic acantholytic keratinocytes and subcorneal pustules. Fungal culture was negative. Allergy testing showed mild environmental sensitivities but not consistent with primary diagnosis. This is an immune-mediated skin disease requiring immunosuppressive therapy.",
    treatmentPlan:
      "1. Increase prednisolone to 2mg/kg PO BID (10mg BID for Bella) for 2-4 weeks until remission\n2. Add chlorambucil 2mg PO every other day as steroid-sparing agent\n3. Continue cephalexin 50mg BID for secondary bacterial infection (2 more weeks)\n4. Elizabethan collar until lesions heal\n5. Recheck in 2 weeks: assess response, monitor for side effects\n6. Once in remission, gradually taper prednisolone over 8-12 weeks\n7. Long-term maintenance: aim for lowest effective dose of prednisolone (ideally every other day) with chlorambucil\n8. Monitor CBC and chemistry every 4-6 weeks initially, then every 3 months\n9. Watch for PU/PD, polyphagia, and GI upset from steroids",
    prognosis:
      "Pemphigus foliaceus in cats generally carries a good to fair prognosis with appropriate immunosuppressive therapy. Most cats achieve remission within 4-8 weeks. Long-term management is required, but many cats can be maintained on low-dose therapy with good quality of life. Approximately 70-80% of cats respond well to treatment. Close monitoring for side effects and disease flares is essential.",
    clientSummary:
      "Bella has been diagnosed with pemphigus foliaceus, an autoimmune skin condition where her immune system is attacking her own skin cells. This is why the itching and hair loss have been so severe and why regular treatments haven't helped much. The good news is that this condition responds well to treatment with immune-suppressing medications. We'll be starting Bella on a higher dose of steroids along with another medication to help control her immune system. Most cats feel much better within a few weeks. Bella will need lifelong medication, but we'll work to find the lowest dose that keeps her comfortable. With treatment, she should have a good quality of life.",

    // Uploaded diagnostic files
    diagnosticFiles: ["Skin_Biopsy_Results.pdf"],
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(caseData.clientSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppLayout activePage="myCases" userRole="gp" userName="Dr. Sarah Chen">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Complete Submission Summary (Scrollable) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <Card className="border-brand-stone shadow-md">
                <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                  <CardTitle className="text-lg font-bold text-brand-navy">Your Submission Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Patient Information Section */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Patient Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Name</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patientName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Species</p>
                        <p className="text-sm text-brand-navy/80">{caseData.species}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Breed</p>
                        <p className="text-sm text-brand-navy/80">{caseData.breed}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Age</p>
                        <p className="text-sm text-brand-navy/80">{caseData.age}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Sex</p>
                        <p className="text-sm text-brand-navy/80">{caseData.sex}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Weight</p>
                        <p className="text-sm text-brand-navy/80">{caseData.weight}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Vaccination Status</p>
                        <p className="text-sm text-brand-navy/80">{caseData.vaccinationStatus}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Preventative Status</p>
                        <p className="text-sm text-brand-navy/80">{caseData.preventativeStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Case Details Section */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Case Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Specialty Selected</p>
                        <p className="text-sm text-brand-navy/80">{caseData.specialty}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Presenting Complaint</p>
                        <p className="text-sm text-brand-navy/80">{caseData.presentingComplaint}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Brief History</p>
                        <p className="text-sm text-brand-navy/80">{caseData.briefHistory}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Relevant PE Findings</p>
                        <p className="text-sm text-brand-navy/80">{caseData.peFindings}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Current Medications</p>
                        <p className="text-sm text-brand-navy/80">{caseData.currentMedications}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Diagnostics Performed So Far</p>
                        <p className="text-sm text-brand-navy/80">{caseData.diagnosticsPerformed}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Treatments Attempted So Far</p>
                        <p className="text-sm text-brand-navy/80">{caseData.treatmentsAttempted}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Your Specific Question(s)</p>
                        <div className="mt-1 rounded-md bg-brand-offwhite p-3">
                          <p className="text-sm text-brand-navy/90">{caseData.specificQuestions}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Initially Submitted Files Section */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Initially Submitted Files</h3>
                    <div className="space-y-2">
                      {caseData.initialFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-md bg-white p-2 text-xs shadow-sm">
                          {file.endsWith(".zip") ? (
                            <ImageIcon className="h-3 w-3 text-brand-navy/60" />
                          ) : (
                            <FileText className="h-3 w-3 text-brand-navy/60" />
                          )}
                          <span className="text-brand-navy/80">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Specialist Report & Actions */}
          <div className="lg:col-span-2">
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
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {caseStatus}
                </Badge>
              </div>
            </div>

            {/* Specialist Info Card */}
            <Card className="mb-6 border-brand-stone shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
                  <span className="font-semibold text-brand-navy">EC</span>
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">{caseData.specialistName}</p>
                  <p className="text-sm text-brand-navy/70">{caseData.specialty}</p>
                </div>
              </CardContent>
            </Card>

            {/* Phase 1 Diagnostic Plan Card */}
            <Card className="mb-6 border-brand-stone shadow-sm">
              <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                <CardTitle className="text-xl font-bold text-brand-navy">Phase 1: Diagnostic Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase1Plan}</p>
              </CardContent>
            </Card>

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
                    className="gap-2 border-brand-navy bg-transparent text-brand-navy hover:bg-brand-navy hover:text-white"
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

            {/* Case History & Files Accordion */}
            <Accordion type="single" collapsible className="rounded-lg border border-brand-stone bg-white shadow-sm">
              <AccordionItem value="case-history" className="border-none">
                <AccordionTrigger className="px-6 py-4 font-semibold text-brand-navy hover:no-underline">
                  View Specialist Reports & All Files
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-6 pb-6">
                  {/* Phase 1 Plan */}
                  <div>
                    <h3 className="mb-3 font-semibold text-brand-navy">Phase 1 Diagnostic Plan</h3>
                    <div className="rounded-lg bg-brand-offwhite p-4">
                      <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase1Plan}</p>
                    </div>
                  </div>

                  {/* Phase 2 Report */}
                  <div>
                    <h3 className="mb-3 font-semibold text-brand-navy">Phase 2 Final Report</h3>
                    <div className="space-y-3 rounded-lg bg-brand-offwhite p-4">
                      <div>
                        <p className="text-sm font-medium text-brand-navy">Assessment:</p>
                        <p className="text-sm text-brand-navy/80">{caseData.phase2Assessment}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-navy">Treatment Plan:</p>
                        <p className="text-sm text-brand-navy/80">{caseData.treatmentPlan}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-navy">Prognosis:</p>
                        <p className="text-sm text-brand-navy/80">{caseData.prognosis}</p>
                      </div>
                    </div>
                  </div>

                  {/* All Files */}
                  <div>
                    <h3 className="mb-3 font-semibold text-brand-navy">All Attached Files</h3>
                    <div className="space-y-2">
                      {/* Initial Files */}
                      {caseData.initialFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                          {file.endsWith(".zip") ? (
                            <ImageIcon className="h-4 w-4 text-brand-navy/60" />
                          ) : (
                            <FileText className="h-4 w-4 text-brand-navy/60" />
                          )}
                          <span className="text-brand-navy">{file}</span>
                          <span className="ml-auto text-xs text-brand-navy/50">(Initial)</span>
                        </div>
                      ))}
                      {/* Diagnostic Files */}
                      {caseData.diagnosticFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm">
                          <FileText className="h-4 w-4 text-brand-navy/60" />
                          <span className="text-brand-navy">{file}</span>
                          <span className="ml-auto text-xs text-brand-navy/50">(Diagnostic)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, ImageIcon, ArrowLeft } from "lucide-react"

export default function SpecialistPhase2Page() {
  const router = useRouter()
  const [phase2Assessment, setPhase2Assessment] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [prognosis, setPrognosis] = useState("")
  const [clientSummary, setClientSummary] = useState("")

  const handleSubmit = () => {
    // For demo purposes, just navigate back to dashboard
    router.push("/specialist-dashboard")
  }

  return (
    <AppLayout activePage="myCases" userRole="specialist" userName="Dr. Jane Smith">
      {/* Back Link */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/specialist-dashboard"
            className="inline-flex items-center gap-2 text-sm text-brand-navy/70 hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - GP Submitted Info (Read Only) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-navy">Case Details (Submitted by GP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Signalment */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Patient Signalment</h3>
                  <p className="text-sm text-muted-foreground">Canine, Golden Retriever, 8y Male Neutered, 35kg</p>
                </div>

                <Separator />

                {/* GP Clinic */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">GP Clinic</h3>
                  <p className="text-sm text-muted-foreground">Main Street Animal Hospital</p>
                </div>

                <Separator />

                {/* Presenting Complaint */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Presenting Complaint</h3>
                  <p className="text-sm text-muted-foreground">
                    Chronic intermittent vomiting for 3 months, progressive weight loss despite good appetite.
                  </p>
                </div>

                <Separator />

                {/* Brief History */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Brief History</h3>
                  <p className="text-sm text-muted-foreground">
                    Patient presented with a 3-month history of intermittent vomiting (2-3x/week), typically 4-6 hours
                    post-prandial. Owner reports 4kg weight loss over this period. No diarrhea, normal urination. Diet:
                    Premium dry kibble, no recent changes.
                  </p>
                </div>

                <Separator />

                {/* Relevant PE Findings */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Relevant PE Findings</h3>
                  <p className="text-sm text-muted-foreground">
                    BCS 4/9, mild abdominal discomfort on deep palpation (cranial abdomen). No masses palpated.
                    Otherwise unremarkable physical exam.
                  </p>
                </div>

                <Separator />

                {/* Current Medications */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Current Medications</h3>
                  <p className="text-sm text-muted-foreground">
                    • Cerenia 60mg PO q24h (discontinued after 5 days - no improvement)
                    <br />• Metronidazole 500mg PO q12h (7-day course completed - no response)
                  </p>
                </div>

                <Separator />

                {/* Diagnostics Performed */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Diagnostics Performed</h3>
                  <p className="text-sm text-muted-foreground">
                    CBC/Chemistry panel, Abdominal Radiographs (2-view) - see attached files
                  </p>
                </div>

                <Separator />

                {/* Treatments Attempted */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">Treatments Attempted</h3>
                  <p className="text-sm text-muted-foreground">
                    Cerenia for 5 days - no improvement. Metronidazole 7-day course - no response. Bland diet trial
                    (boiled chicken/rice) for 2 weeks - vomiting persisted.
                  </p>
                </div>

                <Separator />

                {/* GP's Specific Questions */}
                <div className="bg-brand-gold/10 p-3 rounded-md border border-brand-gold/30">
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">GP's Specific Question(s)</h3>
                  <p className="text-sm text-brand-navy">
                    What is the most appropriate next diagnostic step? Should I pursue abdominal ultrasound, endoscopy,
                    or other advanced imaging? Are there additional bloodwork panels I should consider?
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Attached Files */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-navy">Attached Files</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-brand-navy" />
                    Buddy_Smith_Labwork.pdf
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4 text-brand-navy" />
                    Abdo_Rads_Lateral.dcm
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4 text-brand-navy" />
                    Abdo_Rads_VD.dcm
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Specialist Phase 2 Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submitted Phase 1 Plan (Read-Only) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-navy">Submitted Phase 1 Plan:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md border border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {`1. Abdominal Ultrasound - Priority diagnostic to evaluate for:
   • Gastric or intestinal masses/thickening
   • Lymphadenopathy
   • Hepatobiliary abnormalities
   • Pancreatic changes

2. Pre-anesthetic Bile Acids Test - To rule out hepatic dysfunction given chronic GI signs

3. If ultrasound reveals gastric/intestinal abnormalities, consider endoscopy with biopsies

Rationale: The chronic nature, weight loss despite appetite, and lack of response to empirical treatment suggest a structural or infiltrative process rather than simple gastroenteritis. Ultrasound is the most cost-effective next step to guide further diagnostics.`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* New GP Diagnostics (Read-Only) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-navy">
                  New Diagnostic Results Uploaded by GP:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-brand-navy" />
                    Ultrasound_Report.pdf
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-brand-navy" />
                    Bile_Acids_Results.pdf
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Phase 2 Final Report Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-brand-navy">Submit Phase 2 Final Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phase 2 Assessment */}
                <div className="space-y-2">
                  <Label htmlFor="phase2Assessment" className="text-sm font-semibold text-brand-navy">
                    Phase 2 Assessment <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="phase2Assessment"
                    name="phase2Assessment"
                    value={phase2Assessment}
                    onChange={(e) => setPhase2Assessment(e.target.value)}
                    placeholder="Your final assessment incorporating the new diagnostic results..."
                    rows={4}
                    className="resize-none border-brand-navy/20 focus:border-brand-navy focus:ring-brand-navy"
                  />
                </div>

                {/* Treatment Plan */}
                <div className="space-y-2">
                  <Label htmlFor="treatmentPlan" className="text-sm font-semibold text-brand-navy">
                    Treatment Plan <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="treatmentPlan"
                    name="treatmentPlan"
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Detail your recommended long-term treatment protocols, medications, dosages, monitoring..."
                    rows={6}
                    className="resize-none border-brand-navy/20 focus:border-brand-navy focus:ring-brand-navy"
                  />
                </div>

                {/* Prognosis */}
                <div className="space-y-2">
                  <Label htmlFor="prognosis" className="text-sm font-semibold text-brand-navy">
                    Prognosis <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="prognosis"
                    name="prognosis"
                    value={prognosis}
                    onChange={(e) => setPrognosis(e.target.value)}
                    placeholder="Provide your professional opinion on the patient's prognosis..."
                    rows={3}
                    className="resize-none border-brand-navy/20 focus:border-brand-navy focus:ring-brand-navy"
                  />
                </div>

                {/* Client-Friendly Summary (Highlighted) */}
                <div className="space-y-2">
                  <Label htmlFor="clientSummary" className="text-sm font-semibold text-brand-navy">
                    Client-Friendly Summary <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This will be formatted separately for the GP to share with the client.
                  </p>
                  <div className="bg-brand-gold/10 border border-brand-gold p-4 rounded-md">
                    <Textarea
                      id="clientSummary"
                      name="clientSummary"
                      value={clientSummary}
                      onChange={(e) => setClientSummary(e.target.value)}
                      placeholder="Explain the final diagnosis, plan, and prognosis in simple terms suitable for the pet owner..."
                      rows={5}
                      className="resize-none border-brand-gold/30 focus:border-brand-gold focus:ring-brand-gold bg-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto bg-brand-gold text-brand-navy hover:bg-brand-gold/90 font-semibold shadow-sm"
                  size="lg"
                >
                  Submit Final Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}

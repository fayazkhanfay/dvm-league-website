"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, ImageIcon, Download, UploadCloud, X } from "lucide-react"
import { acceptCase } from "@/app/actions/accept-case"
import { submitFinalReport } from "@/app/actions/submit-final-report"
import { CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SpecialistCaseViewProps {
  caseData: any
  userProfile: any
}

export default function SpecialistCaseView({ caseData, userProfile }: SpecialistCaseViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isSubmittingPhase1, setIsSubmittingPhase1] = useState(false)
  const [isSubmittingPhase2, setIsSubmittingPhase2] = useState(false)
  const [phase1Plan, setPhase1Plan] = useState(caseData.phase1_plan || "")
  const [phase2Assessment, setPhase2Assessment] = useState(caseData.phase2_assessment || "")
  const [phase2TreatmentPlan, setPhase2TreatmentPlan] = useState(caseData.phase2_treatment_plan || "")
  const [phase2Prognosis, setPhase2Prognosis] = useState(caseData.phase2_prognosis || "")
  const [phase2ClientSummary, setPhase2ClientSummary] = useState(caseData.phase2_client_summary || "")

  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [phase1Files, setPhase1Files] = useState<File[]>([])
  const [phase2Files, setPhase2Files] = useState<File[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  const allCaseFiles = useMemo(() => caseData.case_files || [], [caseData.case_files])

  useEffect(() => {
    console.log("[v0] Case Files Debug:")
    console.log("[v0] Total case_files from props:", caseData.case_files?.length || 0)
    console.log("[v0] All case files count:", allCaseFiles.length)
    console.log("[v0] All files data:", caseData.case_files)

    const generateSignedUrls = async () => {
      const allFiles = allCaseFiles
      const urls: Record<string, string> = {}

      for (const file of allFiles) {
        const { data, error } = await supabase.storage
          .from("case-bucket")
          .createSignedUrl(file.storage_object_path, 3600)

        if (!error && data) {
          urls[file.id] = data.signedUrl
        } else {
          console.error("[v0] Error generating signed URL for file:", file.file_name, error)
        }
      }

      setFileUrls(urls)
    }

    generateSignedUrls()
  }, [caseData.case_files, supabase])

  const handleFileDownload = async (storagePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("case-bucket").download(storagePath)

    if (error) {
      console.error("[v0] Error downloading file:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      })
      return
    }

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handlePhase1FileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhase1Files((prev) => [...prev, ...newFiles])
    }
  }

  const handlePhase2FileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhase2Files((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemovePhase1File = (index: number) => {
    setPhase1Files((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemovePhase2File = (index: number) => {
    setPhase2Files((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (files: File[], uploadPhase: "specialist_report") => {
    const uploadedFileRecords: any[] = []

    for (const file of files) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${caseData.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage.from("case-bucket").upload(filePath, file)

      if (uploadError) {
        console.error("[v0] Error uploading file:", file.name, uploadError)
        throw new Error(`Failed to upload ${file.name}`)
      }

      const { data: fileRecord, error: fileRecordError } = await supabase
        .from("case_files")
        .insert({
          case_id: caseData.id,
          uploader_id: userProfile.id,
          file_name: file.name,
          file_type: file.type,
          storage_object_path: uploadData.path,
          upload_phase: uploadPhase,
        })
        .select()
        .single()

      if (fileRecordError) {
        console.error("[v0] Error creating file record:", fileRecordError)
        throw new Error(`Failed to save file record for ${file.name}`)
      }

      uploadedFileRecords.push(fileRecord)
    }

    return uploadedFileRecords
  }

  const handleAcceptCase = async () => {
    console.log("[v0] handleAcceptCase clicked")
    setIsAccepting(true)
    const result = await acceptCase(caseData.id)
    console.log("[v0] acceptCase result:", result)

    if (result.success) {
      console.log("[v0] Case accepted successfully, showing toast and refreshing")
      toast({
        title: "Case Accepted",
        description: "You have successfully claimed this case. You can now begin working on it.",
      })
      router.refresh()
    } else {
      console.log("[v0] Failed to accept case:", result.error)
      toast({
        title: "Failed to Accept Case",
        description: result.error || "Another specialist may have already claimed this case.",
        variant: "destructive",
      })
      setIsAccepting(false)
      if (result.error?.includes("already assigned")) {
        setTimeout(() => router.push("/specialist-dashboard"), 2000)
      }
    }
  }

  /*
   * Phase 1 is deprecated
   */
  const handleSubmitPhase1 = async () => {
    toast({
      title: "Deprecated",
      description: "Phase 1 submission is no longer supported.",
      variant: "destructive"
    })
    return
  }

  const handleSubmitPhase2 = async () => {
    if (
      !phase2Assessment.trim() ||
      !phase2TreatmentPlan.trim() ||
      !phase2Prognosis.trim() ||
      !phase2ClientSummary.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields before submitting the Phase 2 report.",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingPhase2(true)

    try {
      if (phase2Files.length > 0) {
        setIsUploadingFiles(true)
        await uploadFiles(phase2Files, "specialist_report")
      }

      const result = await submitFinalReport(caseData.id, {
        caseDisposition: "managed", // Default
        finalDiagnosis: "See Assessment", // Default
        clinicalInterpretation: phase2Assessment,
        treatmentPlan: phase2TreatmentPlan,
        followUpInstructions: phase2Prognosis,
        clientSummary: phase2ClientSummary,
      })

      if (result.success) {
        toast({
          title: "Phase 2 Submitted",
          description: "Your final report has been submitted successfully. The case is now complete.",
        })
        router.push("/specialist-dashboard")
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit Phase 2 report. Please try again.",
          variant: "destructive",
        })
        setIsSubmittingPhase2(false)
      }
    } catch (error: any) {
      console.error("[v0] Error uploading files:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      })
      setIsSubmittingPhase2(false)
    } finally {
      setIsUploadingFiles(false)
    }
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
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Awaiting Phase 2 Report
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="bg-brand-navy hover:bg-brand-navy/90">
            Completed
          </Badge>
        )
      case "pending_assignment":
        return <Badge variant="secondary">Pending Assignment</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const isAwaitingPhase1 = caseData.status === "awaiting_phase1"
  const isAwaitingDiagnostics = caseData.status === "awaiting_diagnostics"
  const isAwaitingPhase2 = caseData.status === "awaiting_phase2"
  const isCompleted = caseData.status === "completed"
  const isPendingAssignment = caseData.status === "pending_assignment"
  const isUnassigned = !caseData.specialist_id

  const getFileUrl = (fileId: string) => {
    return fileUrls[fileId] || "#"
  }

  return (
    <AppLayout activePage="myCases" userRole="specialist" userName={userProfile.full_name}>
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
                        <p className="text-xs font-semibold text-brand-navy">Species</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patient_species}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Breed</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patient_breed}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Age</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patient_age}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Sex Status</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patient_sex_status}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Weight (kg)</p>
                        <p className="text-sm text-brand-navy/80">{caseData.patient_weight_kg}</p>
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

                  {allCaseFiles.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-base font-bold text-brand-navy">All Submitted Files</h3>
                      <div className="space-y-2">
                        {allCaseFiles.map((file: any) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm transition-colors hover:bg-brand-offwhite"
                          >
                            {file.file_type?.includes("image") || file.file_name.endsWith(".dcm") ? (
                              <ImageIcon className="h-3 w-3 flex-shrink-0 text-brand-navy/60" />
                            ) : (
                              <FileText className="h-3 w-3 flex-shrink-0 text-brand-navy/60" />
                            )}
                            <a
                              href={getFileUrl(file.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 truncate text-brand-navy/80 hover:text-brand-navy hover:underline"
                            >
                              {file.file_name}
                            </a>
                            <button
                              onClick={() => handleFileDownload(file.storage_object_path, file.file_name)}
                              className="flex-shrink-0 text-brand-navy/60 transition-colors hover:text-brand-navy"
                              title="Download file"
                            >
                              <Download className="h-3 w-3" />
                            </button>
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

            {caseData.phase1_plan && !isAwaitingPhase1 && (
              <Card className="mb-6 border-brand-stone shadow-sm">
                <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                  <CardTitle className="text-xl font-bold text-brand-navy">Phase 1: Diagnostic Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="whitespace-pre-line text-brand-navy/80">{caseData.phase1_plan}</p>
                </CardContent>
              </Card>
            )}

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

                  <div>
                    <Label className="text-sm font-medium text-brand-navy">Supporting Files (Optional)</Label>
                    <label
                      htmlFor="phase1-file-upload"
                      className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-6 text-center transition-colors hover:border-brand-gold"
                    >
                      <UploadCloud className="mx-auto h-10 w-10 text-brand-navy/40" />
                      <p className="mt-2 text-sm text-brand-navy/70">Click to upload supporting files</p>
                      <p className="mt-1 text-xs text-brand-navy/50">PDF, images, or other relevant documents</p>
                      <input
                        id="phase1-file-upload"
                        type="file"
                        multiple
                        onChange={handlePhase1FileSelect}
                        className="hidden"
                        disabled={isUploadingFiles}
                      />
                    </label>

                    {phase1Files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-brand-navy">Selected Files:</p>
                        {phase1Files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm">
                            <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                            <span className="flex-1 truncate text-sm text-brand-navy">{file.name}</span>
                            <button
                              onClick={() => handleRemovePhase1File(index)}
                              className="flex-shrink-0 text-red-500 transition-colors hover:text-red-700"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmitPhase1}
                    disabled={isSubmittingPhase1 || isUploadingFiles || !phase1Plan.trim()}
                    className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isUploadingFiles
                      ? "Uploading Files..."
                      : isSubmittingPhase1
                        ? "Submitting..."
                        : "Submit Phase 1 Plan"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isPendingAssignment && isUnassigned && (
              <Card className="mb-6 border-2 border-brand-gold bg-brand-gold/10 shadow-md">
                <CardHeader className="border-b border-brand-gold">
                  <CardTitle className="text-xl font-bold text-brand-navy">Accept & Claim This Case</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="mb-6 text-brand-navy/90">
                    This case is currently unassigned. Click below to accept and claim this case to begin working on it.
                  </p>
                  <Button
                    onClick={handleAcceptCase}
                    disabled={isAccepting}
                    className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isAccepting ? "Accepting Case..." : "Accept & Claim This Case"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAwaitingDiagnostics && (
              <Card className="mb-6 border-brand-stone shadow-sm">
                <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                  <CardTitle className="text-xl font-bold text-brand-navy">Awaiting GP Diagnostic Results</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-brand-navy/80">
                    Your Phase 1 diagnostic plan has been submitted to the GP. You will be notified when the GP uploads
                    the diagnostic results so you can proceed with Phase 2.
                  </p>
                  {caseData.phase1_plan && (
                    <div className="mt-6">
                      <h3 className="mb-2 font-semibold text-brand-navy">Your Phase 1 Plan:</h3>
                      <div className="rounded-lg bg-brand-offwhite p-4">
                        <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase1_plan}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {caseData.diagnostics_performed && !isAwaitingPhase2 && (
              <Card className="mb-6 border-brand-stone bg-blue-50 shadow-sm">
                <CardHeader className="border-b border-blue-200 bg-blue-100">
                  <CardTitle className="text-xl font-bold text-brand-navy">GP Diagnostic Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="whitespace-pre-line text-brand-navy">{caseData.diagnostics_performed}</p>
                </CardContent>
              </Card>
            )}

            {isAwaitingPhase2 && (
              <>
                {caseData.diagnostics_performed && (
                  <Card className="mb-6 border-2 border-blue-500 bg-blue-50 shadow-md">
                    <CardHeader className="border-b border-blue-500 bg-blue-100">
                      <CardTitle className="text-xl font-bold text-brand-navy">GP Diagnostic Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="whitespace-pre-line text-brand-navy">{caseData.diagnostics_performed}</p>
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
                        placeholder="Provide your assessment based on the diagnostic results..."
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
                        placeholder="Detail your recommended treatment plan..."
                        rows={6}
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
                        placeholder="Provide your prognosis..."
                        rows={4}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phase2-client-summary" className="text-sm font-medium text-brand-navy">
                        Client-Friendly Summary
                      </Label>
                      <Textarea
                        id="phase2-client-summary"
                        value={phase2ClientSummary}
                        onChange={(e) => setPhase2ClientSummary(e.target.value)}
                        placeholder="Provide a client-friendly summary that the GP can share with the pet owner..."
                        rows={6}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-brand-navy">Supporting Files (Optional)</Label>
                      <label
                        htmlFor="phase2-file-upload"
                        className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-6 text-center transition-colors hover:border-brand-gold"
                      >
                        <UploadCloud className="mx-auto h-10 w-10 text-brand-navy/40" />
                        <p className="mt-2 text-sm text-brand-navy/70">Click to upload supporting files</p>
                        <p className="mt-1 text-xs text-brand-navy/50">PDF, images, or other relevant documents</p>
                        <input
                          id="phase2-file-upload"
                          type="file"
                          multiple
                          onChange={handlePhase2FileSelect}
                          className="hidden"
                          disabled={isUploadingFiles}
                        />
                      </label>

                      {phase2Files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-brand-navy">Selected Files:</p>
                          {phase2Files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm">
                              <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                              <span className="flex-1 truncate text-sm text-brand-navy">{file.name}</span>
                              <button
                                onClick={() => handleRemovePhase2File(index)}
                                className="flex-shrink-0 text-red-500 transition-colors hover:text-red-700"
                                title="Remove file"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitPhase2}
                      disabled={
                        isSubmittingPhase2 ||
                        isUploadingFiles ||
                        !phase2Assessment.trim() ||
                        !phase2TreatmentPlan.trim() ||
                        !phase2Prognosis.trim() ||
                        !phase2ClientSummary.trim()
                      }
                      className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isUploadingFiles
                        ? "Uploading Files..."
                        : isSubmittingPhase2
                          ? "Submitting..."
                          : "Submit Final Report"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {isCompleted && (
              <>
                {caseData.phase1_plan && (
                  <Card className="mb-6 border-brand-stone shadow-sm">
                    <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                      <CardTitle className="text-xl font-bold text-brand-navy">Phase 1: Diagnostic Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="whitespace-pre-line text-brand-navy/80">{caseData.phase1_plan}</p>
                    </CardContent>
                  </Card>
                )}

                {caseData.diagnostics_performed && (
                  <Card className="mb-6 border-brand-stone bg-blue-50 shadow-sm">
                    <CardHeader className="border-b border-blue-200 bg-blue-100">
                      <CardTitle className="text-xl font-bold text-brand-navy">GP Diagnostic Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="whitespace-pre-line text-brand-navy">{caseData.diagnostics_performed}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="mb-6 border-brand-stone shadow-sm">
                  <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                    <CardTitle className="text-xl font-bold text-brand-navy">Phase 2: Final Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <p className="text-sm font-medium text-brand-navy">Assessment</p>
                      <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase2_assessment}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-brand-navy">Treatment Plan</p>
                      <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase2_treatment_plan}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-brand-navy">Prognosis</p>
                      <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase2_prognosis}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-brand-navy">Client-Friendly Summary</p>
                      <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase2_client_summary}</p>
                    </div>
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

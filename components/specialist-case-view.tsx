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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Final Report State
  const [caseDisposition, setCaseDisposition] = useState(caseData.case_disposition || "")
  const [finalDiagnosis, setFinalDiagnosis] = useState(caseData.final_diagnosis || "")
  const [clinicalInterpretation, setClinicalInterpretation] = useState(caseData.clinical_interpretation || "")
  const [treatmentPlan, setTreatmentPlan] = useState(caseData.treatment_plan || "")
  const [followUpInstructions, setFollowUpInstructions] = useState(caseData.follow_up_instructions || "")
  const [clientSummary, setClientSummary] = useState(caseData.client_summary || "")

  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [finalReportFiles, setFinalReportFiles] = useState<File[]>([])
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFinalReportFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFinalReportFiles((prev) => prev.filter((_, i) => i !== index))
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
  // Removed deprecated handleSubmitPhase1

  const handleSubmitFinalReport = async () => {
    if (
      !caseDisposition.trim() ||
      !finalDiagnosis.trim() ||
      !clinicalInterpretation.trim() ||
      !treatmentPlan.trim() ||
      !followUpInstructions.trim() ||
      !clientSummary.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields before submitting the report.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (finalReportFiles.length > 0) {
        setIsUploadingFiles(true)
        await uploadFiles(finalReportFiles, "specialist_report")
      }

      const result = await submitFinalReport(caseData.id, {
        caseDisposition,
        finalDiagnosis,
        clinicalInterpretation,
        treatmentPlan,
        followUpInstructions,
        clientSummary,
      })

      if (result.success) {
        toast({
          title: "Report Submitted",
          description: "Your final report has been submitted successfully. The case is now complete.",
        })
        router.push("/specialist-dashboard")
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit report. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error("[v0] Error uploading files:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-brand-navy hover:bg-brand-navy/90">
            Completed
          </Badge>
        )
      case "pending_assignment":
        return <Badge variant="secondary">Pending Assignment</Badge>
      default:
        return <Badge variant="secondary">In Progress</Badge>
    }
  }

  const isCompleted = caseData.status === "completed"
  const isPendingAssignment = caseData.status === "pending_assignment"
  const isUnassigned = !caseData.specialist_id
  const isAssignedToMe = caseData.specialist_id === userProfile.id

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

            {/* Phase 1 Plan (Removed) */}

            {/* Phase 1 Form (Removed) */}

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

            {/* GP Diagnostics Display logic simplified */}
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

            {isAssignedToMe && !isCompleted && (
              <>
                <Card className="mb-6 border-2 border-brand-gold shadow-md">
                  <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                    <CardTitle className="text-xl font-bold text-brand-navy">Submit Final Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Case Disposition */}
                    <div className="space-y-2">
                      <Label htmlFor="case-disposition" className="text-sm font-medium text-brand-navy">Case Disposition</Label>
                      <select
                        id="case-disposition"
                        value={caseDisposition}
                        onChange={(e) => setCaseDisposition(e.target.value)}
                        className="w-full rounded-md border border-brand-stone p-2"
                      >
                        <option value="">Select Disposition</option>
                        <option value="managed">Managed</option>
                        <option value="referred">Referred</option>
                      </select>
                    </div>

                    {/* Final Diagnosis */}
                    <div>
                      <Label htmlFor="final-diagnosis" className="text-sm font-medium text-brand-navy">
                        Final Diagnosis
                      </Label>
                      <Textarea
                        id="final-diagnosis"
                        value={finalDiagnosis}
                        onChange={(e) => setFinalDiagnosis(e.target.value)}
                        placeholder="Enter the final diagnosis..."
                        rows={2}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clinical-interpretation" className="text-sm font-medium text-brand-navy">
                        Clinical Interpretation
                      </Label>
                      <Textarea
                        id="clinical-interpretation"
                        value={clinicalInterpretation}
                        onChange={(e) => setClinicalInterpretation(e.target.value)}
                        placeholder="Provide your assessment and interpretation..."
                        rows={6}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="treatment-plan" className="text-sm font-medium text-brand-navy">
                        Treatment Plan
                      </Label>
                      <Textarea
                        id="treatment-plan"
                        value={treatmentPlan}
                        onChange={(e) => setTreatmentPlan(e.target.value)}
                        placeholder="Detail your recommended treatment plan..."
                        rows={6}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="follow-up-instructions" className="text-sm font-medium text-brand-navy">
                        Follow-up Instructions
                      </Label>
                      <Textarea
                        id="follow-up-instructions"
                        value={followUpInstructions}
                        onChange={(e) => setFollowUpInstructions(e.target.value)}
                        placeholder="Provide follow-up instructions or prognosis..."
                        rows={4}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="client-summary" className="text-sm font-medium text-brand-navy">
                        Client-Friendly Summary
                      </Label>
                      <Textarea
                        id="client-summary"
                        value={clientSummary}
                        onChange={(e) => setClientSummary(e.target.value)}
                        placeholder="Provide a client-friendly summary that the GP can share with the pet owner..."
                        rows={6}
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-brand-navy">Supporting Files (Optional)</Label>
                      <label
                        htmlFor="final-report-file-upload"
                        className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-6 text-center transition-colors hover:border-brand-gold"
                      >
                        <UploadCloud className="mx-auto h-10 w-10 text-brand-navy/40" />
                        <p className="mt-2 text-sm text-brand-navy/70">Click to upload supporting files</p>
                        <p className="mt-1 text-xs text-brand-navy/50">PDF, images, or other relevant documents</p>
                        <input
                          id="final-report-file-upload"
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploadingFiles}
                        />
                      </label>

                      {finalReportFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-brand-navy">Selected Files:</p>
                          {finalReportFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm">
                              <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                              <span className="flex-1 truncate text-sm text-brand-navy">{file.name}</span>
                              <button
                                onClick={() => handleRemoveFile(index)}
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
                      onClick={handleSubmitFinalReport}
                      disabled={
                        isSubmitting ||
                        isUploadingFiles ||
                        !clinicalInterpretation.trim() ||
                        !treatmentPlan.trim() ||
                        !followUpInstructions.trim() ||
                        !clientSummary.trim()
                      }
                      className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isUploadingFiles
                        ? "Uploading Files..."
                        : isSubmitting
                          ? "Submitting..."
                          : "Submit Final Report"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {isCompleted && (
              <Card className="mb-6 border-brand-stone shadow-sm">
                <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                  <CardTitle className="text-xl font-bold text-brand-navy">Final Specialist Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Diagnosis</p>
                    <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.final_diagnosis}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-brand-navy">Clinical Interpretation</p>
                    <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.clinical_interpretation}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-brand-navy">Treatment Plan</p>
                    <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.treatment_plan}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-brand-navy">Follow-up Instructions</p>
                    <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.follow_up_instructions}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-brand-navy">Client-Friendly Summary</p>
                    <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.client_summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </AppLayout >
  )
}

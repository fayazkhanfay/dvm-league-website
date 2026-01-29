"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Upload, Stethoscope, Clock, Copy, CheckCircle, X, UploadCloud } from "lucide-react"
import { acceptCase } from "@/app/actions/accept-case"
import { submitDiagnostics } from "@/app/actions/submit-diagnostics"
import { submitFinalReport } from "@/app/actions/submit-final-report"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type ActionPanelProps = {
  caseId: string
  status: string
  userRole: "gp" | "specialist"
  isAssignedToMe: boolean
  currentUserId: string
  gpId: string
  specialistId: string | null
  clientSummary?: string | null
}

export function ActionPanel({
  caseId,
  status,
  userRole,
  isAssignedToMe,
  currentUserId,
  gpId,
  specialistId,
  clientSummary,
}: ActionPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [diagnosticFiles, setDiagnosticFiles] = useState<File[]>([])
  const [diagnosticNotes, setDiagnosticNotes] = useState("")
  const [isUploadingDiagnostics, setIsUploadingDiagnostics] = useState(false)
  const [uploadedDiagnosticFiles, setUploadedDiagnosticFiles] = useState<any[]>([])

  // Final Report State
  const [caseDisposition, setCaseDisposition] = useState("")
  const [finalDiagnosis, setFinalDiagnosis] = useState("")
  const [clinicalInterpretation, setClinicalInterpretation] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [followUpInstructions, setFollowUpInstructions] = useState("")
  const [clientSummaryState, setClientSummaryState] = useState("")
  const [finalReportFiles, setFinalReportFiles] = useState<File[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  const uploadFilesToStorage = async (files: File[], uploadPhase: "diagnostic_results" | "specialist_report") => {
    const uploadedFileRecords: any[] = []

    for (const file of files) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${caseId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage.from("case-bucket").upload(filePath, file)

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
      }

      const { data: fileRecord, error: fileRecordError } = await supabase
        .from("case_files")
        .insert({
          case_id: caseId,
          uploader_id: currentUserId,
          file_name: file.name,
          file_type: file.type,
          storage_object_path: uploadData.path,
          upload_phase: uploadPhase,
        })
        .select()
        .single()

      if (fileRecordError) {
        throw new Error(`Failed to save file record for ${file.name}`)
      }

      uploadedFileRecords.push(fileRecord)
    }

    return uploadedFileRecords
  }

  const handleDiagnosticFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDiagnosticFiles((prev) => [...prev, ...files])
  }

  const handleRemoveDiagnosticFile = (index: number) => {
    setDiagnosticFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadDiagnostics = async () => {
    if (diagnosticFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploadingDiagnostics(true)

    try {
      const uploadedFiles = await uploadFilesToStorage(diagnosticFiles, "diagnostic_results")
      setUploadedDiagnosticFiles((prev) => [...prev, ...uploadedFiles])
      setDiagnosticFiles([])
      toast({
        title: "Files uploaded",
        description: "Diagnostic files uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingDiagnostics(false)
    }
  }

  const handleSubmitDiagnostics = async () => {
    if (uploadedDiagnosticFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one diagnostic file before submitting",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await submitDiagnostics(caseId, diagnosticNotes.trim())

      if (result.success) {
        toast({
          title: "Diagnostics submitted",
          description: "Your diagnostic results have been submitted successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit diagnostics. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit diagnostics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Removed Phase 1 handlers

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFinalReportFiles((prev) => [...prev, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setFinalReportFiles((prev) => prev.filter((_, i) => i !== index))
  }

  interface FinalReportPayload {
    caseDisposition: string
    finalDiagnosis: string
    clinicalInterpretation: string
    treatmentPlan: string
    followUpInstructions: string
    clientSummary: string
  }

  const handleSubmitFinalReport = async () => {
    if (
      !caseDisposition.trim() ||
      !finalDiagnosis.trim() ||
      !clinicalInterpretation.trim() ||
      !treatmentPlan.trim() ||
      !followUpInstructions.trim() ||
      !clientSummaryState.trim()
    ) {
      toast({
        title: "Missing information",
        description: "Please complete all fields before submitting the report",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (finalReportFiles.length > 0) {
        setIsUploadingFiles(true)
        await uploadFilesToStorage(finalReportFiles, "specialist_report")
      }

      const reportData: FinalReportPayload = {
        caseDisposition,
        finalDiagnosis,
        clinicalInterpretation,
        treatmentPlan,
        followUpInstructions,
        clientSummary: clientSummaryState,
      }

      const result = await submitFinalReport(caseId, reportData)

      if (result.success) {
        toast({
          title: "Report submitted",
          description: "Your final report has been submitted successfully. The case is now complete.",
        })
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit report. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsUploadingFiles(false)
    }
  }

  const handleClaimCase = async () => {
    setIsLoading(true)

    const result = await acceptCase(caseId)

    if (result.success) {
      toast({
        title: "Case claimed",
        description: "You have successfully claimed this case",
      })
      router.refresh()
    } else {
      toast({
        title: "Failed to claim case",
        description: result.error || "Failed to claim case",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleCopySummary = () => {
    if (clientSummary) {
      navigator.clipboard.writeText(clientSummary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Client summary copied to clipboard",
      })
    }
  }

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

  // Phase 1 UI removed
  const isAwaitingReport = userRole === "specialist" && isAssignedToMe && status === "in_progress"

  if (userRole === "gp" && status === "in_progress") {
    return (
      <Card className="border-blue-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-5 text-blue-600" />
            Specialist is Working on Your Case
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-brand-navy">
            Your case has been assigned to a specialist. They are currently reviewing the details and will provide a final report soon.
          </p>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold mb-2 text-brand-navy">Upload Additional Files (Optional)</h4>
            <p className="text-xs text-muted-foreground mb-3">If you have additional files or diagnostics to share, you can upload them here.</p>

            <Label>Select Files</Label>
            <label
              htmlFor="diagnostic-upload-additional"
              className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:border-primary"
            >
              <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Click to upload or drag and drop</p>
              <input
                id="diagnostic-upload-additional"
                type="file"
                multiple
                accept=".pdf,.dcm,.jpg,.jpeg,.png"
                onChange={handleDiagnosticFileSelect}
                className="hidden"
                disabled={isUploadingDiagnostics}
              />
            </label>

            {diagnosticFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Selected Files:</p>
                {diagnosticFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-2">
                    <FileText className="h-3 w-3 flex-shrink-0" />
                    <span className="flex-1 truncate text-xs">{file.name}</span>
                    <button
                      onClick={() => handleRemoveDiagnosticFile(index)}
                      className="flex-shrink-0 text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Button
                  onClick={handleUploadDiagnostics}
                  disabled={isUploadingDiagnostics}
                  className="w-full mt-2"
                  size="sm"
                  variant="secondary"
                >
                  {isUploadingDiagnostics ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            )}

            {uploadedDiagnosticFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-green-600">Uploaded Files:</p>
                {uploadedDiagnosticFiles.map((file: any) => (
                  <div key={file.id} className="flex items-center gap-2 rounded-md bg-green-50 p-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-600" />
                    <span className="flex-1 truncate text-xs">{file.file_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAwaitingReport) {
    return (
      <Card className="border-purple-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-purple-600" />
            Submit Final Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Case Disposition */}
          <div>
            <Label htmlFor="case-disposition">Case Disposition</Label>
            <select
              id="case-disposition"
              value={caseDisposition}
              onChange={(e) => setCaseDisposition(e.target.value)}
              className="mt-2 w-full rounded-md border border-input p-2 bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Disposition</option>
              <option value="managed">Managed</option>
              <option value="referred">Referred</option>
            </select>
          </div>

          {/* Final Diagnosis */}
          <div>
            <Label htmlFor="final-diagnosis">Final Diagnosis</Label>
            <Textarea
              id="final-diagnosis"
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Enter the final diagnosis..."
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="clinical-interpretation">Clinical Interpretation</Label>
            <Textarea
              id="clinical-interpretation"
              value={clinicalInterpretation}
              onChange={(e) => setClinicalInterpretation(e.target.value)}
              placeholder="Provide your assessment based on the diagnostic results..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="treatment-plan">Treatment Plan</Label>
            <Textarea
              id="treatment-plan"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Detail your recommended treatment plan..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="follow-up-instructions">Follow-up Instructions</Label>
            <Textarea
              id="follow-up-instructions"
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Provide your prognosis and follow-up instructions..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="client-summary">Client-Friendly Summary</Label>
            <Textarea
              id="client-summary"
              value={clientSummaryState}
              onChange={(e) => setClientSummaryState(e.target.value)}
              placeholder="Provide a client-friendly summary that the GP can share with the pet owner..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Supporting Files (Optional)</Label>
            <label
              htmlFor="final-report-file-upload"
              className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
            >
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Click to upload supporting files</p>
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
                {finalReportFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-3">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <button onClick={() => handleRemoveFile(index)} className="flex-shrink-0 text-destructive">
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
              !clientSummaryState.trim()
            }
            className="w-full"
          >
            {isUploadingFiles
              ? "Uploading Files..."
              : isSubmitting
                ? "Submitting..."
                : "Submit Final Report"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "completed" && clientSummary) {
    return (
      <Card className="border-green-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            Case Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertTitle>Client Summary</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap mt-2">{clientSummary}</AlertDescription>
          </Alert>
          <Button onClick={handleCopySummary} variant="outline" className="w-full bg-transparent">
            {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy Summary"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {!["in_progress", "pending_assignment", "completed"].includes(status) &&
            "Case status unknown or action not required"}
          {status === "in_progress" && !isAwaitingReport && userRole === "specialist" && !isAssignedToMe &&
            "Case is being handled by another specialist"}
        </p>
      </CardContent>
    </Card>
  )
}

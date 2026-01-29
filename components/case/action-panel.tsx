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

  const [phase2Assessment, setPhase2Assessment] = useState("")
  const [phase2TreatmentPlan, setPhase2TreatmentPlan] = useState("")
  const [phase2Prognosis, setPhase2Prognosis] = useState("")
  const [phase2ClientSummary, setPhase2ClientSummary] = useState("")
  const [phase2Files, setPhase2Files] = useState<File[]>([])
  const [isSubmittingPhase2, setIsSubmittingPhase2] = useState(false)
  const [isUploadingPhase2Files, setIsUploadingPhase2Files] = useState(false)

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

  const handlePhase2FileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhase2Files((prev) => [...prev, ...files])
  }

  const handleRemovePhase2File = (index: number) => {
    setPhase2Files((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitFinalReport = async () => {
    if (
      !phase2Assessment.trim() ||
      !phase2TreatmentPlan.trim() ||
      !phase2Prognosis.trim() ||
      !phase2ClientSummary.trim()
    ) {
      toast({
        title: "Missing information",
        description: "Please complete all fields before submitting the Phase 2 report",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingPhase2(true)

    try {
      if (phase2Files.length > 0) {
        setIsUploadingPhase2Files(true)
        await uploadFilesToStorage(phase2Files, "specialist_report")
      }

      const result = await submitFinalReport(caseId, {
        caseDisposition: "managed", // Default
        finalDiagnosis: "See Assessment", // Default
        clinicalInterpretation: phase2Assessment,
        treatmentPlan: phase2TreatmentPlan,
        followUpInstructions: phase2Prognosis,
        clientSummary: phase2ClientSummary,
      })

      if (result.success) {
        toast({
          title: "Phase 2 submitted", // Updated Title
          description: "Your final report has been submitted successfully. The case is now complete.",
        })
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit Phase 2 report. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit Phase 2. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPhase2(false)
      setIsUploadingPhase2Files(false)
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

  if (userRole === "gp" && status === "awaiting_diagnostics") {
    return (
      <Card className="border-green-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5 text-green-600" />
            Upload Diagnostic Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diagnostic-notes">Diagnostic Notes (Optional)</Label>
            <Textarea
              id="diagnostic-notes"
              value={diagnosticNotes}
              onChange={(e) => setDiagnosticNotes(e.target.value)}
              placeholder="Add any notes, observations, or context about the diagnostic results..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Upload Diagnostic Files</Label>
            <label
              htmlFor="diagnostic-upload"
              className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
            >
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DICOM, JPG, PNG up to 50MB</p>
              <input
                id="diagnostic-upload"
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
                  <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-3">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <button
                      onClick={() => handleRemoveDiagnosticFile(index)}
                      className="flex-shrink-0 text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  onClick={handleUploadDiagnostics}
                  disabled={isUploadingDiagnostics}
                  className="w-full"
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
                  <div key={file.id} className="flex items-center gap-2 rounded-md bg-green-50 p-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="flex-1 truncate text-sm">{file.file_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmitDiagnostics}
            disabled={isLoading || uploadedDiagnosticFiles.length === 0}
            className="w-full"
          >
            {isLoading ? "Submitting..." : "Confirm & Submit Diagnostic Results"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase2") {
    return (
      <Card className="border-purple-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-purple-600" />
            Submit Phase 2 Final Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phase2-assessment">Assessment</Label>
            <Textarea
              id="phase2-assessment"
              value={phase2Assessment}
              onChange={(e) => setPhase2Assessment(e.target.value)}
              placeholder="Provide your assessment based on the diagnostic results..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phase2-treatment">Treatment Plan</Label>
            <Textarea
              id="phase2-treatment"
              value={phase2TreatmentPlan}
              onChange={(e) => setPhase2TreatmentPlan(e.target.value)}
              placeholder="Detail your recommended treatment plan..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phase2-prognosis">Prognosis</Label>
            <Textarea
              id="phase2-prognosis"
              value={phase2Prognosis}
              onChange={(e) => setPhase2Prognosis(e.target.value)}
              placeholder="Provide your prognosis..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phase2-client-summary">Client-Friendly Summary</Label>
            <Textarea
              id="phase2-client-summary"
              value={phase2ClientSummary}
              onChange={(e) => setPhase2ClientSummary(e.target.value)}
              placeholder="Provide a client-friendly summary that the GP can share with the pet owner..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Supporting Files (Optional)</Label>
            <label
              htmlFor="phase2-file-upload"
              className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
            >
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Click to upload supporting files</p>
              <input
                id="phase2-file-upload"
                type="file"
                multiple
                onChange={handlePhase2FileSelect}
                className="hidden"
                disabled={isUploadingPhase2Files}
              />
            </label>

            {phase2Files.length > 0 && (
              <div className="mt-4 space-y-2">
                {phase2Files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-3">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <button onClick={() => handleRemovePhase2File(index)} className="flex-shrink-0 text-destructive">
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
              isSubmittingPhase2 ||
              isUploadingPhase2Files ||
              !phase2Assessment.trim() ||
              !phase2TreatmentPlan.trim() ||
              !phase2Prognosis.trim() ||
              !phase2ClientSummary.trim()
            }
            className="w-full"
          >
            {isUploadingPhase2Files
              ? "Uploading Files..."
              : isSubmittingPhase2
                ? "Submitting..."
                : "Submit Phase 2 Report"}
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
          {status === "awaiting_diagnostics" &&
            userRole === "specialist" &&
            "Waiting for GP to upload diagnostic results"}
          {status === "awaiting_phase2" &&
            userRole === "gp" &&
            "Waiting for specialist to provide Phase 2 final report"}
          {!["awaiting_phase1", "awaiting_diagnostics", "awaiting_phase2"].includes(status) &&
            "No actions available at this time"}
        </p>
      </CardContent>
    </Card>
  )
}

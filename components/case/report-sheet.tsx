"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { submitPhase1 } from "@/app/actions/submit-phase1"
import { submitPhase2 } from "@/app/actions/submit-phase2"
import { submitDiagnostics } from "@/app/actions/submit-diagnostics"
import { createClient } from "@/lib/supabase/client"
import { UploadCloud, FileText, X, CheckCircle } from "lucide-react"

interface ReportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "phase1" | "phase2" | "diagnostics"
  caseId: string
  currentUserId: string
}

export function ReportSheet({ open, onOpenChange, mode, caseId, currentUserId }: ReportSheetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Phase 1 state
  const [phase1Plan, setPhase1Plan] = useState("")
  const [phase1Files, setPhase1Files] = useState<File[]>([])
  const [isSubmittingPhase1, setIsSubmittingPhase1] = useState(false)
  const [isUploadingPhase1Files, setIsUploadingPhase1Files] = useState(false)

  // Phase 2 state
  const [phase2Assessment, setPhase2Assessment] = useState("")
  const [phase2TreatmentPlan, setPhase2TreatmentPlan] = useState("")
  const [phase2Prognosis, setPhase2Prognosis] = useState("")
  const [phase2ClientSummary, setPhase2ClientSummary] = useState("")
  const [phase2Files, setPhase2Files] = useState<File[]>([])
  const [isSubmittingPhase2, setIsSubmittingPhase2] = useState(false)
  const [isUploadingPhase2Files, setIsUploadingPhase2Files] = useState(false)

  // Diagnostics state
  const [diagnosticFiles, setDiagnosticFiles] = useState<File[]>([])
  const [diagnosticNotes, setDiagnosticNotes] = useState("")
  const [isUploadingDiagnostics, setIsUploadingDiagnostics] = useState(false)
  const [uploadedDiagnosticFiles, setUploadedDiagnosticFiles] = useState<any[]>([])
  const [isSubmittingDiagnostics, setIsSubmittingDiagnostics] = useState(false)

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

  const handleSubmitPhase1 = async () => {
    if (!phase1Plan.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a diagnostic plan before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingPhase1(true)

    try {
      if (phase1Files.length > 0) {
        setIsUploadingPhase1Files(true)
        await uploadFilesToStorage(phase1Files, "specialist_report")
      }

      const result = await submitPhase1(caseId, phase1Plan)

      if (result.success) {
        toast({
          title: "Phase 1 submitted",
          description: "Your diagnostic plan has been submitted successfully.",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit Phase 1 plan.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit Phase 1.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPhase1(false)
      setIsUploadingPhase1Files(false)
    }
  }

  const handleSubmitPhase2 = async () => {
    if (
      !phase2Assessment.trim() ||
      !phase2TreatmentPlan.trim() ||
      !phase2Prognosis.trim() ||
      !phase2ClientSummary.trim()
    ) {
      toast({
        title: "Missing information",
        description: "Please complete all fields before submitting",
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

      const result = await submitPhase2(caseId, {
        assessment: phase2Assessment,
        treatmentPlan: phase2TreatmentPlan,
        prognosis: phase2Prognosis,
        clientSummary: phase2ClientSummary,
      })

      if (result.success) {
        toast({
          title: "Phase 2 submitted",
          description: "Your final report has been submitted successfully.",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit Phase 2 report.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit Phase 2.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPhase2(false)
      setIsUploadingPhase2Files(false)
    }
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
        description: error.message || "Failed to upload files.",
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

    setIsSubmittingDiagnostics(true)

    try {
      const result = await submitDiagnostics(caseId, diagnosticNotes.trim())

      if (result.success) {
        toast({
          title: "Diagnostics submitted",
          description: "Your diagnostic results have been submitted successfully",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit diagnostics.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit diagnostics.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingDiagnostics(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {mode === "phase1" && (
          <>
            <SheetHeader>
              <SheetTitle>Phase 1 Diagnostic Plan</SheetTitle>
              <SheetDescription>
                Provide your diagnostic plan based on the case history. You can scroll the timeline while typing.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="phase1-plan">Diagnostic Plan *</Label>
                <Textarea
                  id="phase1-plan"
                  value={phase1Plan}
                  onChange={(e) => setPhase1Plan(e.target.value)}
                  placeholder="Detail the diagnostic tests and procedures you recommend..."
                  rows={12}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Supporting Files (Optional)</Label>
                <label
                  htmlFor="phase1-file-upload"
                  className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
                >
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload files</p>
                  <input
                    id="phase1-file-upload"
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setPhase1Files((prev) => [...prev, ...files])
                    }}
                    className="hidden"
                  />
                </label>

                {phase1Files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {phase1Files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-3">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate text-sm">{file.name}</span>
                        <button
                          onClick={() => setPhase1Files((prev) => prev.filter((_, i) => i !== index))}
                          className="flex-shrink-0 text-destructive"
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
                disabled={isSubmittingPhase1 || isUploadingPhase1Files || !phase1Plan.trim()}
                className="w-full"
                size="lg"
              >
                {isUploadingPhase1Files
                  ? "Uploading Files..."
                  : isSubmittingPhase1
                    ? "Submitting..."
                    : "Submit Phase 1"}
              </Button>
            </div>
          </>
        )}

        {mode === "phase2" && (
          <>
            <SheetHeader>
              <SheetTitle>Phase 2 Final Report</SheetTitle>
              <SheetDescription>
                Complete the final report based on diagnostic results. Scroll the timeline to review findings.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="phase2-assessment">Assessment *</Label>
                <Textarea
                  id="phase2-assessment"
                  value={phase2Assessment}
                  onChange={(e) => setPhase2Assessment(e.target.value)}
                  placeholder="Provide your assessment..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phase2-treatment">Treatment Plan *</Label>
                <Textarea
                  id="phase2-treatment"
                  value={phase2TreatmentPlan}
                  onChange={(e) => setPhase2TreatmentPlan(e.target.value)}
                  placeholder="Detail your recommended treatment..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phase2-prognosis">Prognosis *</Label>
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
                <Label htmlFor="phase2-client-summary">Client-Friendly Summary *</Label>
                <Textarea
                  id="phase2-client-summary"
                  value={phase2ClientSummary}
                  onChange={(e) => setPhase2ClientSummary(e.target.value)}
                  placeholder="Summary for the pet owner..."
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
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload files</p>
                  <input
                    id="phase2-file-upload"
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setPhase2Files((prev) => [...prev, ...files])
                    }}
                    className="hidden"
                  />
                </label>

                {phase2Files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {phase2Files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-3">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate text-sm">{file.name}</span>
                        <button
                          onClick={() => setPhase2Files((prev) => prev.filter((_, i) => i !== index))}
                          className="flex-shrink-0 text-destructive"
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
                  isUploadingPhase2Files ||
                  !phase2Assessment.trim() ||
                  !phase2TreatmentPlan.trim() ||
                  !phase2Prognosis.trim() ||
                  !phase2ClientSummary.trim()
                }
                className="w-full"
                size="lg"
              >
                {isUploadingPhase2Files
                  ? "Uploading Files..."
                  : isSubmittingPhase2
                    ? "Submitting..."
                    : "Submit Phase 2"}
              </Button>
            </div>
          </>
        )}

        {mode === "diagnostics" && (
          <>
            <SheetHeader>
              <SheetTitle>Upload Diagnostic Results</SheetTitle>
              <SheetDescription>
                Upload the diagnostic test results and any relevant notes for the specialist to review.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="diagnostic-notes">Notes (Optional)</Label>
                <Textarea
                  id="diagnostic-notes"
                  value={diagnosticNotes}
                  onChange={(e) => setDiagnosticNotes(e.target.value)}
                  placeholder="Add any notes about the diagnostic results..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Diagnostic Files *</Label>
                <label
                  htmlFor="diagnostic-upload"
                  className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
                >
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload diagnostic files</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF, DICOM, JPG, PNG up to 50MB</p>
                  <input
                    id="diagnostic-upload"
                    type="file"
                    multiple
                    accept=".pdf,.dcm,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setDiagnosticFiles((prev) => [...prev, ...files])
                    }}
                    className="hidden"
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
                          onClick={() => setDiagnosticFiles((prev) => prev.filter((_, i) => i !== index))}
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
                disabled={isSubmittingDiagnostics || uploadedDiagnosticFiles.length === 0}
                className="w-full"
                size="lg"
              >
                {isSubmittingDiagnostics ? "Submitting..." : "Submit Diagnostic Results"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

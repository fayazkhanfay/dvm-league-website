"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { submitFinalReport } from "@/app/actions/submit-final-report"
import { saveReportDraft } from "@/app/actions/save-report-draft"
import { submitDiagnostics } from "@/app/actions/submit-diagnostics"
import { createClient } from "@/lib/supabase/client"
import { CaseDetails } from "@/app/actions/get-case-details"
import { UploadCloud, FileText, X, CheckCircle, Trash2 } from "lucide-react"
import { deleteCaseFile } from "@/app/actions/delete-case-file"
import { Badge } from "@/components/ui/badge"

interface ReportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "final_report" | "diagnostics"
  caseId: string
  currentUserId: string
  splitMode?: boolean
  initialData?: CaseDetails
}

export function ReportSheet({ open, onOpenChange, mode, caseId, currentUserId, splitMode = false, initialData }: ReportSheetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Final Report state
  const [caseDisposition, setCaseDisposition] = useState(initialData?.case_disposition || "")
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState(initialData?.final_diagnosis || "")
  const [clinicalInterpretation, setClinicalInterpretation] = useState(initialData?.clinical_interpretation || "")
  const [treatmentProtocol, setTreatmentProtocol] = useState(initialData?.treatment_plan || "")
  const [monitoringPlan, setMonitoringPlan] = useState(initialData?.follow_up_instructions || "")
  const [clientExplanation, setClientExplanation] = useState(initialData?.client_summary || "")
  const [finalReportFiles, setFinalReportFiles] = useState<File[]>([])
  const [isSubmittingFinalReport, setIsSubmittingFinalReport] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isUploadingFinalReportFiles, setIsUploadingFinalReportFiles] = useState(false)

  // Initialize from initialData, filtering for specialist report files
  const [uploadedReportFiles, setUploadedReportFiles] = useState<any[]>(
    (initialData as any)?.case_files?.filter((f: any) => f.upload_phase === 'specialist_report') || []
  )

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

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    // Optimistic update
    const previousFiles = uploadedReportFiles
    setUploadedReportFiles((prev) => prev.filter((f) => f.id !== fileId))

    try {
      const result = await deleteCaseFile(fileId, storagePath)
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      // Revert
      setUploadedReportFiles(previousFiles)
      toast({
        title: "Error deleting file",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)

    try {
      let newUploadedFiles: any[] = []
      if (finalReportFiles.length > 0) {
        setIsUploadingFinalReportFiles(true)
        newUploadedFiles = await uploadFilesToStorage(finalReportFiles, "specialist_report")
      }

      const result = await saveReportDraft(caseId, {
        caseDisposition: caseDisposition,
        finalDiagnosis: primaryDiagnosis,
        clinicalInterpretation: clinicalInterpretation,
        treatmentPlan: treatmentProtocol,
        followUpInstructions: monitoringPlan,
        clientSummary: clientExplanation,
      })

      if (result.success) {
        setUploadedReportFiles((prev) => [...prev, ...newUploadedFiles])
        setFinalReportFiles([])

        toast({
          title: "Draft saved",
          description: "Your report draft has been saved successfully.",
        })
        router.refresh()
      } else {
        toast({
          title: "Save failed",
          description: result.error || "Failed to save draft.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save draft.",
        variant: "destructive",
      })
    } finally {
      setIsSavingDraft(false)
      setIsUploadingFinalReportFiles(false)
    }
  }

  const handleSubmitFinalReport = async () => {
    if (
      !caseDisposition.trim() ||
      !primaryDiagnosis.trim() ||
      !clinicalInterpretation.trim() ||
      !treatmentProtocol.trim() ||
      !monitoringPlan.trim() ||
      !clientExplanation.trim()
    ) {
      toast({
        title: "Missing information",
        description: "Please complete all fields before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingFinalReport(true)

    try {
      if (finalReportFiles.length > 0) {
        setIsUploadingFinalReportFiles(true)
        await uploadFilesToStorage(finalReportFiles, "specialist_report")
      }

      const result = await submitFinalReport(caseId, {
        caseDisposition: caseDisposition,
        finalDiagnosis: primaryDiagnosis,
        clinicalInterpretation: clinicalInterpretation,
        treatmentPlan: treatmentProtocol,
        followUpInstructions: monitoringPlan,
        clientSummary: clientExplanation,
      })

      if (result.success) {
        toast({
          title: "Final report submitted",
          description: "Your final report has been submitted successfully.",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit final report.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit final report.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingFinalReport(false)
      setIsUploadingFinalReportFiles(false)
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

  const renderContent = () => {
    if (mode === "final_report") {
      return (
        <>
          {splitMode && (
            <div className="p-6 pb-4 border-b flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Final Case Report</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete the final report based on diagnostic results. Scroll the timeline to review findings.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="flex-shrink-0 ml-4">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!splitMode && (
            <SheetHeader>
              <SheetTitle>Final Case Report</SheetTitle>
              <SheetDescription>
                Complete the final report based on diagnostic results. Scroll the timeline to review findings.
              </SheetDescription>
            </SheetHeader>
          )}

          <div className={splitMode ? "p-6 space-y-6" : "mt-6 space-y-6"}>
            <div>
              <Label htmlFor="case-disposition">Case Disposition *</Label>
              <Select value={caseDisposition} onValueChange={setCaseDisposition}>
                <SelectTrigger id="case-disposition" className="mt-2">
                  <SelectValue placeholder="Select case disposition..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="managed">Manage In-House (Medical Management)</SelectItem>
                  <SelectItem value="referral">Referral Advised (Specialty Procedure)</SelectItem>
                  <SelectItem value="er_transfer">Immediate ER Transfer (Critical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="primary-diagnosis">Primary Diagnosis & Confidence Level *</Label>
              <Input
                id="primary-diagnosis"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="e.g., ACVIM Stage C Mitral Valve Disease with acute pulmonary edema. (High Confidence)"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="clinical-interpretation">Clinical Interpretation & Findings *</Label>
              <Textarea
                id="clinical-interpretation"
                value={clinicalInterpretation}
                onChange={(e) => setClinicalInterpretation(e.target.value)}
                placeholder="Explain your reasoning. Reference specific findings in the uploaded labs or radiographs (e.g., 'The VHS is 11.8 and the alveolar pattern in the caudodorsal lung field confirms edema...')."
                rows={8}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="treatment-protocol">Treatment Protocol (Drugs & Dosages) *</Label>
              <p className="text-xs text-muted-foreground mt-1">Please include specific mg/kg dosages.</p>
              <Textarea
                id="treatment-protocol"
                value={treatmentProtocol}
                onChange={(e) => setTreatmentProtocol(e.target.value)}
                placeholder={
                  "List specific drugs, dosages, and frequencies. \n• Furosemide: 2mg/kg IV NOW, then...\n• Pimobendan: 0.25mg/kg PO BID...\n• Diet: Switch to Cardiac diet..."
                }
                rows={8}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="monitoring-plan">Monitoring & Recheck Plan *</Label>
              <Textarea
                id="monitoring-plan"
                value={monitoringPlan}
                onChange={(e) => setMonitoringPlan(e.target.value)}
                placeholder="When should the GP recheck labs or imaging? What are the 'Red Flags' for the owner to watch for? (e.g., 'Recheck BUN/Creatinine in 3 days. If RR > 40 at rest, go to ER.')"
                rows={6}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="client-explanation">Client-Friendly Explanation *</Label>
              <Textarea
                id="client-explanation"
                value={clientExplanation}
                onChange={(e) => setClientExplanation(e.target.value)}
                placeholder="Write a simple paragraph the GP can copy/paste to the pet owner. Avoid jargon. (e.g., 'Charlie has a leaky heart valve which caused fluid in his lungs. The medications will help clear the fluid...')"
                rows={6}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Supporting Files (Optional)</Label>
              <label
                htmlFor="final-report-upload"
                className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
              >
                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload files</p>
                <input
                  id="final-report-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setFinalReportFiles((prev) => [...prev, ...files])
                  }}
                  className="hidden"
                />
              </label>

              {/* New Files (Pending Upload) */}
              {finalReportFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    New Files (Unsaved)
                  </p>
                  {finalReportFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md bg-secondary p-3 border border-dashed border-muted-foreground/30">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{file.name}</span>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                      <button
                        onClick={() => setFinalReportFiles((prev) => prev.filter((_, i) => i !== index))}
                        className="flex-shrink-0 text-destructive hover:bg-destructive/10 p-1 rounded"
                        title="Remove from list"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Already Uploaded Files */}
              {uploadedReportFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Saved Files
                  </p>
                  {uploadedReportFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 rounded-md bg-secondary p-3 border border-transparent">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{file.file_name}</span>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.storage_object_path)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                size="lg"
                disabled={isSubmittingFinalReport || isSavingDraft || isUploadingFinalReportFiles}
                onClick={handleSaveDraft}
              >
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                onClick={handleSubmitFinalReport}
                disabled={
                  isSubmittingFinalReport ||
                  isUploadingFinalReportFiles ||
                  !caseDisposition.trim() ||
                  !primaryDiagnosis.trim() ||
                  !clinicalInterpretation.trim() ||
                  !treatmentProtocol.trim() ||
                  !monitoringPlan.trim() ||
                  !clientExplanation.trim()
                }
                className="flex-1"
                size="lg"
              >
                {isUploadingFinalReportFiles
                  ? "Uploading Files..."
                  : isSubmittingFinalReport
                    ? "Submitting..."
                    : "SUBMIT FINAL REPORT"}
              </Button>
            </div>
          </div>
        </>
      )
    }

    if (mode === "diagnostics") {
      return (
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
      )
    }

    return null
  }

  if (splitMode) {
    return <div className="h-full">{renderContent()}</div>
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">{renderContent()}</SheetContent>
    </Sheet>
  )
}

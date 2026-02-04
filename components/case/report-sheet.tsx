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
import { UploadCloud, FileText, X, CheckCircle, Trash2, Loader2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"
// import { pdf } from '@react-pdf/renderer'
// import { FinalReportPDF } from '@/components/pdf/FinalReportPDF'

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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

  const uploadFilesToStorage = async (files: File[], uploadPhase: "diagnostic_results" | "specialist_report", isDraft: boolean) => {
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
          is_draft: isDraft,
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
    try {
      // 1. Delete from Storage first (Clean Code principle)
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("case-bucket")
          .remove([storagePath])

        if (storageError) {
          console.error("Error removing file from storage:", storageError)
          // We continue to DB deletion even if storage fails to avoid "zombie" records
        }
      }

      // 2. Delete from Database (Matches case-submission-form.tsx pattern)
      const { error: dbError } = await supabase
        .from("case_files")
        .delete()
        .eq("id", fileId)

      if (dbError) throw dbError

      // 3. Update State (Post-action update, no optimistic revert needed)
      setUploadedReportFiles((prev) => prev.filter((f) => f.id !== fileId))

      toast({
        title: "File removed",
        description: "The draft file has been deleted.",
      })
    } catch (err) {
      console.error("Error deleting file:", err)
      toast({
        title: "Error deleting file",
        description: "Failed to remove the file. Please try again.",
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
        newUploadedFiles = await uploadFilesToStorage(finalReportFiles, "specialist_report", true)
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

  const getReportData = () => ({
    patientName: initialData?.patient_name || 'Unknown Patient',
    caseId: caseId,
    specialistName: 'DVM League Specialist', // TODO: Pass specialist profile or name
    date: new Date().toLocaleDateString(),
    finalDiagnosis: primaryDiagnosis,
    clinicalInterpretation: clinicalInterpretation,
    treatmentPlan: treatmentProtocol,
    followUp: monitoringPlan,
    clientSummary: clientExplanation
  })

  const handlePreview = async () => {
    try {
      // Dynamic import to avoid SSR/Initial load issues
      const { pdf } = await import('@react-pdf/renderer')
      const { FinalReportPDF } = await import('@/components/pdf/FinalReportPDF')

      // Client-side generation (No server cost)
      const blob = await pdf(<FinalReportPDF data={getReportData()} />).toBlob()

      const url = URL.createObjectURL(blob)

      // Open in new tab
      window.open(url, '_blank')
    } catch (error: any) {
      console.error("PDF Generation failed:", error)
      toast({
        title: "Preview Failed",
        description: `Could not generate PDF: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const executeFinalSubmission = async () => {
    // Validation is now done before opening the modal, or we can keep it here as a safeguard
    // but the main button usually does the validation check before opening the modal.
    // However, keeping it here is safe.

    setIsSubmittingFinalReport(true)

    try {
      // 1. Generate PDF
      const { pdf } = await import('@react-pdf/renderer')
      const { FinalReportPDF } = await import('@/components/pdf/FinalReportPDF')

      const blob = await pdf(<FinalReportPDF data={getReportData()} />).toBlob()
      const fileName = `${caseId}_FINAL.pdf`

      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('final_reports')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) throw uploadError

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('final_reports')
        .getPublicUrl(fileName)

      // 4. Update Database
      if (finalReportFiles.length > 0) {
        setIsUploadingFinalReportFiles(true)
        await uploadFilesToStorage(finalReportFiles, "specialist_report", false)
      }

      const result = await submitFinalReport(caseId, {
        caseDisposition: caseDisposition,
        finalDiagnosis: primaryDiagnosis,
        clinicalInterpretation: clinicalInterpretation,
        treatmentPlan: treatmentProtocol,
        followUpInstructions: monitoringPlan,
        clientSummary: clientExplanation,
        finalReportPath: publicUrl
      })

      if (result.success) {
        toast({
          title: "Final Report submitted",
          description: "Your report has been generated and submitted successfully.",
        })
        setShowConfirmModal(false) // Close the confirmation modal
        onOpenChange(false)
        router.push('/specialist-dashboard')
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Failed to submit final report.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to generate or upload report",
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
      const uploadedFiles = await uploadFilesToStorage(diagnosticFiles, "diagnostic_results", false)
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

              {/* Already Uploaded Files (Drafts from DB) */}
              {uploadedReportFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Saved Draft Files
                  </p>
                  {uploadedReportFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded-md bg-secondary p-3 border border-transparent"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{file.file_name}</span>

                      {/* Delete Button */}
                      <button
                        type="button" // Explicit type to prevent form submission
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
                variant="outline"
                onClick={handlePreview}
                disabled={isSubmittingFinalReport}
                type="button"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Preview PDF
              </Button>

              <Button
                onClick={() => setShowConfirmModal(true)}
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Sign & Submit Final Report
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
    return (
      <div className="h-full">
        {renderContent()}
        {/* Confirmation Modal for Split Mode */}
        {/* We need to render this here as well because in splitMode the component returns early */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md border-2 border-brand-navy">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-brand-navy flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Confirm Final Report
              </DialogTitle>
              <DialogDescription className="text-sm text-brand-navy/70">
                You are about to submit the official medical record for this case.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2 text-sm">

                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-brand-navy">Patient:</span>
                  <span className="text-brand-navy/80">
                    {initialData?.patient_name || 'Unknown Patient'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="font-semibold text-brand-navy">Diagnosis:</span>
                  <span className={primaryDiagnosis ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                    {primaryDiagnosis ? "Included" : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="font-semibold text-brand-navy">Treatment Plan:</span>
                  <span className={treatmentProtocol ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                    {treatmentProtocol ? "Included" : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="font-semibold text-brand-navy">Client Summary:</span>
                  <span className={clientExplanation ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                    {clientExplanation ? "Included" : "Missing"}
                  </span>
                </div>

                {/* The Warning Box */}
                <div className="mt-4 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-900 text-xs uppercase tracking-wide">
                        Irreversible Action
                      </p>
                      <p className="text-xs text-red-800">
                        Once submitted, this PDF becomes the permanent legal record. It cannot be edited or deleted without administrative override.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="border-2 border-brand-stone bg-transparent text-brand-navy hover:bg-brand-stone"
              >
                Go Back & Edit
              </Button>
              <Button
                type="button"
                onClick={executeFinalSubmission}
                disabled={isSubmittingFinalReport}
                className="bg-brand-gold font-bold text-brand-navy hover:bg-brand-navy hover:text-white"
              >
                {isSubmittingFinalReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  "Confirm & Submit Record"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="h-full">
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        {!splitMode && (
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            {renderContent()}
          </SheetContent>
        )}
        {/* Render content directly if split mode is handled by parent, 
            but here it seems splitMode just changes specific internal rendering.
            Wait, looking at the code, if splitMode is true, it returns early with just renderContent().
            So I should place the Dialog OUTSIDE that return or ensure it's included.
            The best place is probably inside renderContent or wrapping the return.
            However, Dialog needs to be at the root of the component or portaled correctly. 
            Since Radix Dialog uses Portal, placement isn't super critical for layout, but needs to be rendered.
         */}
      </Sheet>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md border-2 border-brand-navy">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-brand-navy flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Confirm Final Report
            </DialogTitle>
            <DialogDescription className="text-sm text-brand-navy/70">
              You are about to submit the official medical record for this case.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 text-sm">

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-brand-navy">Patient:</span>
                <span className="text-brand-navy/80">
                  {initialData?.patient_name || 'Unknown Patient'}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="font-semibold text-brand-navy">Diagnosis:</span>
                <span className={primaryDiagnosis ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                  {primaryDiagnosis ? "Included" : "Missing"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="font-semibold text-brand-navy">Treatment Plan:</span>
                <span className={treatmentProtocol ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                  {treatmentProtocol ? "Included" : "Missing"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="font-semibold text-brand-navy">Client Summary:</span>
                <span className={clientExplanation ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                  {clientExplanation ? "Included" : "Missing"}
                </span>
              </div>

              {/* The Warning Box */}
              <div className="mt-4 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-red-900 text-xs uppercase tracking-wide">
                      Irreversible Action
                    </p>
                    <p className="text-xs text-red-800">
                      Once submitted, this PDF becomes the permanent legal record. It cannot be edited or deleted without administrative override.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="border-2 border-brand-stone bg-transparent text-brand-navy hover:bg-brand-stone"
            >
              Go Back & Edit
            </Button>
            <Button
              type="button"
              onClick={executeFinalSubmission}
              disabled={isSubmittingFinalReport}
              className="bg-brand-gold font-bold text-brand-navy hover:bg-brand-navy hover:text-white"
            >
              {isSubmittingFinalReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                "Confirm & Submit Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

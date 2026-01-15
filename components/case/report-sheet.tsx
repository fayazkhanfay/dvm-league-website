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
  splitMode?: boolean
}

export function ReportSheet({ open, onOpenChange, mode, caseId, currentUserId, splitMode = false }: ReportSheetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Phase 1 state
  const [phase1Plan, setPhase1Plan] = useState("")
  const [phase1Files, setPhase1Files] = useState<File[]>([])
  const [isSubmittingPhase1, setIsSubmittingPhase1] = useState(false)
  const [isUploadingPhase1Files, setIsUploadingPhase1Files] = useState(false)

  // Phase 2 state
  const [caseDisposition, setCaseDisposition] = useState("")
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("")
  const [clinicalInterpretation, setClinicalInterpretation] = useState("")
  const [treatmentProtocol, setTreatmentProtocol] = useState("")
  const [monitoringPlan, setMonitoringPlan] = useState("")
  const [clientExplanation, setClientExplanation] = useState("")
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

    setIsSubmittingPhase2(true)

    try {
      if (phase2Files.length > 0) {
        setIsUploadingPhase2Files(true)
        await uploadFilesToStorage(phase2Files, "specialist_report")
      }

      const result = await submitPhase2(caseId, {
        assessment: `Disposition: ${caseDisposition}\n\nPrimary Diagnosis: ${primaryDiagnosis}\n\nClinical Interpretation: ${clinicalInterpretation}`,
        treatmentPlan: treatmentProtocol,
        prognosis: monitoringPlan,
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

  const renderContent = () => {
    if (mode === "phase1") {
      return (
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
              {isUploadingPhase1Files ? "Uploading Files..." : isSubmittingPhase1 ? "Submitting..." : "Submit Phase 1"}
            </Button>
          </div>
        </>
      )
    }

    if (mode === "phase2") {
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

            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1" size="lg" disabled={isSubmittingPhase2}>
                Save Draft
              </Button>
              <Button
                onClick={handleSubmitPhase2}
                disabled={
                  isSubmittingPhase2 ||
                  isUploadingPhase2Files ||
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
                {isUploadingPhase2Files
                  ? "Uploading Files..."
                  : isSubmittingPhase2
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

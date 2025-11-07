"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, UploadCloud, FileText, ImageIcon, Copy, CheckCircle, Download, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface GPCaseViewProps {
  caseData: any
  userProfile: any
}

export default function GPCaseView({ caseData, userProfile }: GPCaseViewProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [diagnosticFiles, setDiagnosticFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedDiagnosticFiles, setUploadedDiagnosticFiles] = useState<any[]>([])
  const supabase = createClient()

  const signalment = caseData.patient_signalment
  const initialFiles = caseData.case_files?.filter((f: any) => f.upload_phase === "initial_submission") || []
  const existingDiagnosticFiles = caseData.case_files?.filter((f: any) => f.upload_phase === "diagnostic_results") || []

  const allDiagnosticFiles = [...existingDiagnosticFiles, ...uploadedDiagnosticFiles]

  useEffect(() => {
    const generateSignedUrls = async () => {
      const allFiles = [...initialFiles, ...allDiagnosticFiles]
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
  }, [initialFiles, uploadedDiagnosticFiles, supabase])

  const getFileUrl = (fileId: string) => {
    return fileUrls[fileId] || "#"
  }

  const handleFileDownload = async (storagePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("case-bucket").download(storagePath)

    if (error) {
      console.error("[v0] Error downloading file:", error)
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

  const handleCopySummary = () => {
    if (caseData.phase2_client_summary) {
      navigator.clipboard.writeText(caseData.phase2_client_summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDiagnosticFiles((prev) => [...prev, ...files])
    setUploadError(null)
  }

  const handleRemoveFile = (index: number) => {
    setDiagnosticFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadDiagnostics = async () => {
    if (diagnosticFiles.length === 0) {
      setUploadError("Please select at least one file to upload")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      console.log("[v0] Uploading diagnostic files...")

      const uploadedFiles: any[] = []

      for (const file of diagnosticFiles) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${caseData.id}/${fileName}`

        console.log("[v0] Uploading file:", file.name, "to", filePath)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("case-bucket")
          .upload(filePath, file)

        if (uploadError) {
          console.error("[v0] Error uploading file:", file.name, uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        console.log("[v0] File uploaded successfully:", uploadData.path)

        const { data: fileRecord, error: fileRecordError } = await supabase
          .from("case_files")
          .insert({
            case_id: caseData.id,
            uploader_id: userProfile.id,
            file_name: file.name,
            file_type: file.type,
            storage_object_path: uploadData.path,
            upload_phase: "diagnostic_results",
          })
          .select()
          .single()

        if (fileRecordError) {
          console.error("[v0] Error creating file record:", fileRecordError)
          throw new Error(`Failed to save file record for ${file.name}`)
        }

        console.log("[v0] File record created:", fileRecord)
        uploadedFiles.push(fileRecord)
      }

      setUploadedDiagnosticFiles((prev) => [...prev, ...uploadedFiles])
      setDiagnosticFiles([])
      console.log("[v0] All diagnostic files uploaded successfully")
    } catch (error: any) {
      console.error("[v0] Error uploading diagnostics:", error)
      setUploadError(error.message || "Failed to upload files. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitDiagnostics = async () => {
    if (allDiagnosticFiles.length === 0) {
      setUploadError("Please upload at least one diagnostic file before submitting")
      return
    }

    try {
      const { error } = await supabase.from("cases").update({ status: "awaiting_phase2" }).eq("id", caseData.id)

      if (error) {
        console.error("[v0] Error updating case status:", error)
        setUploadError("Failed to submit diagnostics. Please try again.")
        return
      }

      router.push("/gp-dashboard")
    } catch (error) {
      console.error("[v0] Error submitting diagnostics:", error)
      setUploadError("Failed to submit diagnostics. Please try again.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_assignment":
        return (
          <Badge variant="secondary" className="bg-brand-stone text-brand-navy">
            Pending Assignment
          </Badge>
        )
      case "awaiting_phase1":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Phase 1 Plan Ready
          </Badge>
        )
      case "awaiting_diagnostics":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Awaiting Diagnostics
          </Badge>
        )
      case "awaiting_phase2":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Phase 2 Plan Ready
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="bg-brand-navy text-white hover:bg-brand-navy">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const isPhase1OrAwaiting = caseData.status === "awaiting_phase1" || caseData.status === "awaiting_diagnostics"
  const isPhase2OrCompleted = caseData.status === "awaiting_phase2" || caseData.status === "completed"
  const isPendingAssignment = caseData.status === "pending_assignment"

  return (
    <AppLayout activePage="myCases" userRole="gp" userName={userProfile.full_name}>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Complete Submission Summary */}
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
                        <p className="text-sm text-brand-navy/80">{caseData.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Species</p>
                        <p className="text-sm text-brand-navy/80">{signalment.species}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Breed</p>
                        <p className="text-sm text-brand-navy/80">{signalment.breed}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Age</p>
                        <p className="text-sm text-brand-navy/80">{signalment.age}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Sex</p>
                        <p className="text-sm text-brand-navy/80">{signalment.sex_status}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Weight</p>
                        <p className="text-sm text-brand-navy/80">{signalment.weight_kg} kg</p>
                      </div>
                      {signalment.vax_status && (
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">Vaccination Status</p>
                          <p className="text-sm text-brand-navy/80">{signalment.vax_status}</p>
                        </div>
                      )}
                      {signalment.preventatives && signalment.preventatives.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">Preventative Status</p>
                          <p className="text-sm text-brand-navy/80">{signalment.preventatives.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Case Details Section */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-brand-navy">Case Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Specialty Selected</p>
                        <p className="text-sm text-brand-navy/80">{caseData.specialty_requested}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Presenting Complaint</p>
                        <p className="text-sm text-brand-navy/80">{caseData.presenting_complaint}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Brief History</p>
                        <p className="text-sm text-brand-navy/80">{caseData.brief_history}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Relevant PE Findings</p>
                        <p className="text-sm text-brand-navy/80">{caseData.pe_findings}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Current Medications</p>
                        <p className="text-sm text-brand-navy/80">{caseData.medications}</p>
                      </div>
                      {caseData.diagnostics_performed && (
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">Diagnostics Performed So Far</p>
                          <p className="text-sm text-brand-navy/80">{caseData.diagnostics_performed}</p>
                        </div>
                      )}
                      {caseData.treatments_attempted && (
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">Treatments Attempted So Far</p>
                          <p className="text-sm text-brand-navy/80">{caseData.treatments_attempted}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">Your Specific Question(s)</p>
                        <div className="mt-1 rounded-md bg-brand-offwhite p-3">
                          <p className="text-sm text-brand-navy/90">{caseData.gp_questions}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Initially Submitted Files Section */}
                  {initialFiles.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-base font-bold text-brand-navy">Initially Submitted Files</h3>
                      <div className="space-y-2">
                        {initialFiles.map((file: any) => (
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

          {/* Right Column: Specialist Report & Actions */}
          <div className="lg:col-span-2">
            <Link
              href="/gp-dashboard"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold text-brand-navy">
                View Case: {caseData.patient_name} ({caseData.id.slice(0, 8).toUpperCase()})
              </h1>
              <div className="mt-3">{getStatusBadge(caseData.status)}</div>
            </div>

            {caseData.specialist && (
              <Card className="mb-6 border-brand-stone shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
                    <span className="font-semibold text-brand-navy">
                      {caseData.specialist.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">{caseData.specialist.full_name}</p>
                    <p className="text-sm text-brand-navy/70">{caseData.specialist.specialty}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {isPendingAssignment && (
              <Card className="mb-6 border-2 border-brand-gold bg-brand-gold/10 shadow-md">
                <CardHeader className="border-b border-brand-gold">
                  <CardTitle className="text-xl font-bold text-brand-navy">Case Submitted Successfully</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-brand-navy/90">
                    Your case has been submitted and is awaiting assignment to a specialist. You will be notified once a
                    specialist has been assigned and begins reviewing your case.
                  </p>
                  <p className="mt-4 text-sm text-brand-navy/70">
                    You can review all the information you submitted in the summary panel on the left.
                  </p>
                </CardContent>
              </Card>
            )}

            {isPhase1OrAwaiting && caseData.phase1_plan && (
              <>
                <Card className="mb-6 border-brand-stone shadow-sm">
                  <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                    <CardTitle className="text-xl font-bold text-brand-navy">
                      Phase 1: Diagnostic Plan Received
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="whitespace-pre-line text-brand-navy/90">{caseData.phase1_plan}</div>
                  </CardContent>
                </Card>

                <Card className="mb-6 border-2 border-brand-gold shadow-md">
                  <CardHeader className="border-b border-brand-gold bg-brand-gold/10">
                    <CardTitle className="text-xl font-bold text-brand-navy">Next Step: Upload Diagnostics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="mb-6 text-brand-navy/90">
                      Please perform the recommended diagnostics. Once complete, upload the results below to receive the
                      Phase 2 Treatment Plan.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 font-semibold text-brand-navy">Upload Diagnostic Results</h3>
                        <label
                          htmlFor="diagnostic-upload"
                          className="block cursor-pointer rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-8 text-center transition-colors hover:border-brand-gold"
                        >
                          <UploadCloud className="mx-auto h-12 w-12 text-brand-navy/40" />
                          <p className="mt-2 text-sm text-brand-navy/70">Click to upload or drag and drop</p>
                          <p className="mt-1 text-xs text-brand-navy/50">PDF, DICOM, JPG, PNG up to 50MB</p>
                          <input
                            id="diagnostic-upload"
                            type="file"
                            multiple
                            accept=".pdf,.dcm,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {diagnosticFiles.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-brand-navy">Selected Files:</h4>
                          <div className="space-y-2">
                            {diagnosticFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm"
                              >
                                <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                                <span className="flex-1 truncate text-brand-navy">{file.name}</span>
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
                          <Button
                            onClick={handleUploadDiagnostics}
                            disabled={isUploading}
                            className="mt-3 w-full bg-brand-navy text-white hover:bg-brand-navy/90"
                          >
                            {isUploading ? "Uploading..." : "Upload Files"}
                          </Button>
                        </div>
                      )}

                      {uploadError && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{uploadError}</div>
                      )}

                      {allDiagnosticFiles.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-brand-navy">Uploaded Files:</h4>
                          <div className="space-y-2">
                            {allDiagnosticFiles.map((file: any) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm transition-colors hover:bg-brand-offwhite"
                              >
                                <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                                <a
                                  href={getFileUrl(file.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 truncate text-brand-navy hover:text-brand-navy hover:underline"
                                >
                                  {file.file_name}
                                </a>
                                <button
                                  onClick={() => handleFileDownload(file.storage_object_path, file.file_name)}
                                  className="flex-shrink-0 text-brand-navy/60 transition-colors hover:text-brand-navy"
                                  title="Download file"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleSubmitDiagnostics}
                        disabled={allDiagnosticFiles.length === 0}
                        className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:hover:scale-100"
                      >
                        Confirm & Submit Diagnostic Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {isPhase2OrCompleted && (
              <>
                <Card className="mb-6 border-brand-stone shadow-sm">
                  <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
                    <CardTitle className="text-xl font-bold text-brand-navy">Phase 2: Final Report Received</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {caseData.phase2_assessment && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Assessment</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_assessment}</p>
                      </div>
                    )}
                    {caseData.phase2_treatment_plan && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Treatment Plan</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_treatment_plan}</p>
                      </div>
                    )}
                    {caseData.phase2_prognosis && (
                      <div>
                        <h3 className="mb-2 font-semibold text-brand-navy">Prognosis</h3>
                        <p className="whitespace-pre-line text-brand-navy/90">{caseData.phase2_prognosis}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {caseData.phase2_client_summary && (
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
                      <p className="text-brand-navy/90">{caseData.phase2_client_summary}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Accordion type="single" collapsible className="rounded-lg border border-brand-stone bg-white shadow-sm">
              <AccordionItem value="case-history" className="border-none">
                <AccordionTrigger className="px-6 py-4 font-semibold text-brand-navy hover:no-underline">
                  View Specialist Reports & All Files
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-6 pb-6">
                  {caseData.phase1_plan && (
                    <div>
                      <h3 className="mb-3 font-semibold text-brand-navy">Phase 1 Diagnostic Plan</h3>
                      <div className="rounded-lg bg-brand-offwhite p-4">
                        <p className="whitespace-pre-line text-sm text-brand-navy/80">{caseData.phase1_plan}</p>
                      </div>
                    </div>
                  )}

                  {isPhase2OrCompleted && (
                    <div>
                      <h3 className="mb-3 font-semibold text-brand-navy">Phase 2 Final Report</h3>
                      <div className="space-y-3 rounded-lg bg-brand-offwhite p-4">
                        {caseData.phase2_assessment && (
                          <div>
                            <p className="text-sm font-medium text-brand-navy">Assessment:</p>
                            <p className="text-sm text-brand-navy/80">{caseData.phase2_assessment}</p>
                          </div>
                        )}
                        {caseData.phase2_treatment_plan && (
                          <div>
                            <p className="text-sm font-medium text-brand-navy">Treatment Plan:</p>
                            <p className="text-sm text-brand-navy/80">{caseData.phase2_treatment_plan}</p>
                          </div>
                        )}
                        {caseData.phase2_prognosis && (
                          <div>
                            <p className="text-sm font-medium text-brand-navy">Prognosis:</p>
                            <p className="text-sm text-brand-navy/80">{caseData.phase2_prognosis}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-3 font-semibold text-brand-navy">All Attached Files</h3>
                    <div className="space-y-2">
                      {initialFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm transition-colors hover:bg-brand-offwhite"
                        >
                          {file.file_type?.includes("image") || file.file_name.endsWith(".dcm") ? (
                            <ImageIcon className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                          ) : (
                            <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                          )}
                          <a
                            href={getFileUrl(file.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 truncate text-brand-navy hover:underline"
                          >
                            {file.file_name}
                          </a>
                          <button
                            onClick={() => handleFileDownload(file.storage_object_path, file.file_name)}
                            className="flex-shrink-0 text-brand-navy/60 transition-colors hover:text-brand-navy"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <span className="ml-2 text-xs text-brand-navy/50">(Initial)</span>
                        </div>
                      ))}
                      {allDiagnosticFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 rounded-md bg-white p-3 text-sm shadow-sm transition-colors hover:bg-brand-offwhite"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0 text-brand-navy/60" />
                          <a
                            href={getFileUrl(file.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 truncate text-brand-navy hover:underline"
                          >
                            {file.file_name}
                          </a>
                          <button
                            onClick={() => handleFileDownload(file.storage_object_path, file.file_name)}
                            className="flex-shrink-0 text-brand-navy/60 transition-colors hover:text-brand-navy"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <span className="ml-2 text-xs text-brand-navy/50">(Diagnostic)</span>
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

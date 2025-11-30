"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, AlertTriangle, X } from "lucide-react"

interface CaseSubmissionFormProps {
  userProfile: any
}

export default function CaseSubmissionForm({ userProfile }: CaseSubmissionFormProps) {
  const router = useRouter()
  const supabase = createClient()

  // Patient Signalment
  const [patientName, setPatientName] = useState("")
  const [species, setSpecies] = useState("")
  const [breed, setBreed] = useState("")
  const [age, setAge] = useState("")
  const [sexStatus, setSexStatus] = useState("")
  const [weightKg, setWeightKg] = useState("")

  // Case Details
  const [presentingComplaint, setPresentingComplaint] = useState("")
  const [briefHistory, setBriefHistory] = useState("")
  const [peFindings, setPeFindings] = useState("")
  const [medications, setMedications] = useState("")
  const [diagnosticsPerformed, setDiagnosticsPerformed] = useState("")
  const [treatmentsAttempted, setTreatmentsAttempted] = useState("")
  const [gpQuestions, setGpQuestions] = useState("")
  const [financialConstraints, setFinancialConstraints] = useState("")

  // Specialty & Files
  const [specialtyRequested, setSpecialtyRequested] = useState("")
  const [preferredSpecialist, setPreferredSpecialist] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadWarning, setUploadWarning] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      setFiles((prevFiles) => {
        // Check total file count limit
        if (prevFiles.length + newFiles.length > 25) {
          setUploadWarning(
            `Limit reached: Cannot add ${newFiles.length} file(s). You already have ${prevFiles.length}. Max 25 total.`,
          )
          return prevFiles
        }

        // Check individual file sizes
        for (const file of newFiles) {
          if (file.size > 1024 * 1024 * 1024) {
            // 1GB in bytes
            setUploadWarning(`File ${file.name} is too large (Max 1GB).`)
            return prevFiles
          }
        }

        setUploadWarning(null)
        setError(null)
        return [...prevFiles, ...newFiles]
      })
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("[v0] Starting case submission...")

      const patientSignalment = {
        species,
        breed,
        age,
        sex_status: sexStatus,
        weight_kg: Number.parseFloat(weightKg),
      }

      const { data: newCase, error: caseError } = await supabase
        .from("cases")
        .insert({
          gp_id: userProfile.id,
          patient_name: patientName,
          patient_signalment: patientSignalment,
          presenting_complaint: presentingComplaint,
          brief_history: briefHistory,
          pe_findings: peFindings,
          medications,
          diagnostics_performed: diagnosticsPerformed || null,
          treatments_attempted: treatmentsAttempted || null,
          gp_questions: gpQuestions,
          specialty_requested: specialtyRequested,
          preferred_specialist: preferredSpecialist || null,
          financial_constraints: financialConstraints || null,
          status: "pending_assignment",
        })
        .select()
        .single()

      if (caseError) {
        console.error("[v0] Error creating case:", caseError)
        throw new Error(`Failed to create case: ${caseError.message}`)
      }

      console.log("[v0] Case created successfully:", newCase.id)

      if (files.length > 0) {
        console.log("[v0] Uploading", files.length, "files...")

        let uploadedCount = 0
        const uploadErrors: string[] = []

        for (const file of files) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${newCase.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          console.log("[v0] Uploading file:", file.name, "to path:", fileName)
          const { error: uploadError } = await supabase.storage.from("case-bucket").upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

          if (uploadError) {
            console.error("[v0] Error uploading file:", file.name, uploadError)
            uploadErrors.push(`${file.name}: ${uploadError.message}`)
            continue
          }

          console.log("[v0] File uploaded, creating database record...")
          const { error: fileRecordError } = await supabase.from("case_files").insert({
            case_id: newCase.id,
            uploader_id: userProfile.id,
            file_name: file.name,
            file_type: file.type,
            storage_object_path: fileName,
            upload_phase: "initial_submission",
          })

          if (fileRecordError) {
            console.error("[v0] Error creating file record:", fileRecordError)
            uploadErrors.push(`${file.name} record: ${fileRecordError.message}`)
          } else {
            uploadedCount++
            console.log("[v0] File record created successfully")
          }
        }

        if (uploadErrors.length > 0) {
          console.error("[v0] Some files failed to upload:", uploadErrors)
          throw new Error(
            `Case created but ${uploadErrors.length} file(s) failed to upload: ${uploadErrors.join(", ")}`,
          )
        }

        console.log("[v0] All files uploaded successfully:", uploadedCount)
      }

      console.log("[v0] Case submission complete, redirecting...")
      router.push("/gp-dashboard")
    } catch (err) {
      console.error("[v0] Submission error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit case. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout activePage="submitCase" userName={userProfile.full_name} userRole="gp">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-brand-navy">Submit New Case</h1>

        {error && (
          <div className="mb-6 rounded-md border-2 border-red-500 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information */}
          <Card className="border-brand-stone shadow-md">
            <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
              <CardTitle className="text-xl font-bold text-brand-navy">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="patient-name" className="text-sm font-medium text-brand-navy">
                  Patient Name *
                </Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="species" className="text-sm font-medium text-brand-navy">
                    Species *
                  </Label>
                  <Select value={species} onValueChange={setSpecies} required>
                    <SelectTrigger
                      id="species"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    >
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Canine">Canine</SelectItem>
                      <SelectItem value="Feline">Feline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="breed" className="text-sm font-medium text-brand-navy">
                    Breed *
                  </Label>
                  <Input
                    id="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    required
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-brand-navy">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 5 years"
                    required
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="sex-status" className="text-sm font-medium text-brand-navy">
                    Sex/Status *
                  </Label>
                  <Select value={sexStatus} onValueChange={setSexStatus} required>
                    <SelectTrigger
                      id="sex-status"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male Neutered">Male Neutered</SelectItem>
                      <SelectItem value="Male Intact">Male Intact</SelectItem>
                      <SelectItem value="Female Spayed">Female Spayed</SelectItem>
                      <SelectItem value="Female Intact">Female Intact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight" className="text-sm font-medium text-brand-navy">
                    Weight (kg) *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    required
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card className="border-brand-stone shadow-md">
            <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
              <CardTitle className="text-xl font-bold text-brand-navy">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="presenting-complaint" className="text-sm font-medium text-brand-navy">
                  Presenting Complaint *
                </Label>
                <Textarea
                  id="presenting-complaint"
                  value={presentingComplaint}
                  onChange={(e) => setPresentingComplaint(e.target.value)}
                  placeholder="Brief description of the main issue..."
                  rows={3}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="brief-history" className="text-sm font-medium text-brand-navy">
                  Brief History *
                </Label>
                <Textarea
                  id="brief-history"
                  value={briefHistory}
                  onChange={(e) => setBriefHistory(e.target.value)}
                  placeholder="Relevant medical history..."
                  rows={4}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="pe-findings" className="text-sm font-medium text-brand-navy">
                  Physical Examination Findings *
                </Label>
                <Textarea
                  id="pe-findings"
                  value={peFindings}
                  onChange={(e) => setPeFindings(e.target.value)}
                  placeholder="Key physical examination findings..."
                  rows={4}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="medications" className="text-sm font-medium text-brand-navy">
                  Current Medications *
                </Label>
                <Textarea
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="List current medications and dosages..."
                  rows={3}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="financial-constraints" className="text-sm font-medium text-brand-navy">
                  Client Financial Constraints (Optional)
                </Label>
                <Input
                  id="financial-constraints"
                  value={financialConstraints}
                  onChange={(e) => setFinancialConstraints(e.target.value)}
                  placeholder="e.g., Hard cap of $1,500, or 'No constraints'"
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="diagnostics-performed" className="text-sm font-medium text-brand-navy">
                  Diagnostics Performed
                </Label>
                <Textarea
                  id="diagnostics-performed"
                  value={diagnosticsPerformed}
                  onChange={(e) => setDiagnosticsPerformed(e.target.value)}
                  placeholder="List any diagnostics already performed..."
                  rows={3}
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="treatments-attempted" className="text-sm font-medium text-brand-navy">
                  Treatments Attempted
                </Label>
                <Textarea
                  id="treatments-attempted"
                  value={treatmentsAttempted}
                  onChange={(e) => setTreatmentsAttempted(e.target.value)}
                  placeholder="List any treatments already attempted..."
                  rows={3}
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="gp-questions" className="text-sm font-medium text-brand-navy">
                  Your Questions for the Specialist *
                </Label>
                <Textarea
                  id="gp-questions"
                  value={gpQuestions}
                  onChange={(e) => setGpQuestions(e.target.value)}
                  placeholder="What specific questions do you have for the specialist?"
                  rows={4}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialty & Files */}
          <Card className="border-brand-stone shadow-md">
            <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
              <CardTitle className="text-xl font-bold text-brand-navy">Specialty & Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="specialty" className="text-sm font-medium text-brand-navy">
                  Specialty Requested *
                </Label>
                <Select value={specialtyRequested} onValueChange={setSpecialtyRequested} required>
                  <SelectTrigger
                    id="specialty"
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  >
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferred-specialist" className="text-sm font-medium text-brand-navy">
                  Preferred Specialist (Optional)
                </Label>
                <Input
                  id="preferred-specialist"
                  value={preferredSpecialist}
                  onChange={(e) => setPreferredSpecialist(e.target.value)}
                  placeholder="Enter name if you have a specific doctor in mind"
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="files" className="text-sm font-medium text-brand-navy">
                  Upload Clinical Data Only
                </Label>
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">Strict Upload Exclusions</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        To maintain Client Confidentiality and efficient triage, <strong>do not upload</strong>:
                      </p>
                      <ul className="list-disc list-outside ml-4 mt-2 text-xs text-amber-800 space-y-1">
                        <li>
                          <strong>Financial Documents:</strong> No invoices, estimates, receipts, or billing statements.
                        </li>
                        <li>
                          <strong>Client Financial Data:</strong> No payment histories or insurance claims.
                        </li>
                        <li>
                          <strong>Non-Medical Communications:</strong> No email chains regarding scheduling or admin.
                        </li>
                        <li>
                          <strong>Excessive Identifying Data:</strong> Focus strictly on the patient's signalment and
                          medical diagnostics.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-brand-navy/70">
                  Upload PDFs individually for instant viewing. Please ZIP large image series (DICOMs) and other non-viewable files into a single
                  file. Supported: Images, PDF, Audio (MP3/M4A/WAV), Video. Max 25 files per submission.
                </p>
                <div className="mt-2">
                  <label
                    htmlFor="files"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-brand-stone bg-brand-offwhite px-6 py-8 transition-all hover:border-brand-gold hover:bg-brand-gold/5"
                  >
                    <Upload className="h-6 w-6 text-brand-navy/60" />
                    <span className="text-sm font-medium text-brand-navy/80">
                      {files.length > 0 ? `${files.length} file(s) selected` : "Click to upload files"}
                    </span>
                  </label>
                  <input
                    id="files"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf,.zip,.mp4,.mov,.avi,.xlsx,.csv,.doc,.docx,.mp3,.wav,.m4a"
                  />
                </div>
                {uploadWarning && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <p className="text-sm text-amber-800">{uploadWarning}</p>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded bg-brand-offwhite p-2">
                        <p className="text-xs text-brand-navy/70">{file.name}</p>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Case...
              </>
            ) : (
              "Submit Case"
            )}
          </Button>
        </form>
      </main>
    </AppLayout>
  )
}

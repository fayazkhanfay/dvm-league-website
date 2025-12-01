"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Upload, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface CaseSubmissionFormProps {
  userProfile: any
  initialData?: any
}

export function CaseSubmissionForm({ userProfile, initialData }: CaseSubmissionFormProps) {
  const router = useRouter()
  const supabase = createClient()

  // Patient Signalment
  const [patientName, setPatientName] = useState(initialData?.patient_name || "")
  const [species, setSpecies] = useState(initialData?.patient_signalment?.species || "")
  const [breed, setBreed] = useState(initialData?.patient_signalment?.breed || "")
  const [age, setAge] = useState(initialData?.patient_signalment?.age || "")
  const [sexStatus, setSexStatus] = useState(initialData?.patient_signalment?.sex_status || "")
  const [weightKg, setWeightKg] = useState(initialData?.patient_signalment?.weight_kg?.toString() || "")

  // Case Details
  const [presentingComplaint, setPresentingComplaint] = useState(initialData?.presenting_complaint || "")
  const [briefHistory, setBriefHistory] = useState(initialData?.brief_history || "")
  const [peFindings, setPeFindings] = useState(initialData?.pe_findings || "")
  const [medications, setMedications] = useState(initialData?.medications || "")
  const [diagnosticsPerformed, setDiagnosticsPerformed] = useState(initialData?.diagnostics_performed || "")
  const [treatmentsAttempted, setTreatmentsAttempted] = useState(initialData?.treatments_attempted || "")
  const [gpQuestions, setGpQuestions] = useState(initialData?.gp_questions || "")
  const [financialConstraints, setFinancialConstraints] = useState(initialData?.financial_constraints || "")

  // Specialty & Files
  const [specialtyRequested, setSpecialtyRequested] = useState(initialData?.specialty_requested || "")
  const [preferredSpecialist, setPreferredSpecialist] = useState(initialData?.preferred_specialist || "")
  const [files, setFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<any[]>(initialData?.case_files || [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [caseId, setCaseId] = useState<string | null>(initialData?.id || null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [previousCaseCount, setPreviousCaseCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchCaseCount = async () => {
      try {
        const { count, error } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("gp_id", userProfile.id)
          .neq("status", "draft")

        if (error) throw error
        setPreviousCaseCount(count || 0)
      } catch (err) {
        console.error("[v0] Error fetching case count:", err)
      }
    }

    fetchCaseCount()
  }, [userProfile.id, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      setFiles((prevFiles) => {
        const totalFiles = prevFiles.length + existingFiles.length + newFiles.length
        if (totalFiles > 25) {
          toast.warning("Limit reached: Max 25 files per submission.", {
            description: "Please zip larger sets of files.",
          })
          return prevFiles
        }

        // Check individual file sizes
        for (const file of newFiles) {
          if (file.size > 1024 * 1024 * 1024) {
            // 1GB in bytes
            toast.warning(`File too large: ${file.name}`, {
              description: "Maximum file size is 1GB.",
            })
            return prevFiles
          }
        }

        return [...prevFiles, ...newFiles]
      })
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const removeExistingFile = async (fileId: string) => {
    try {
      const { error } = await supabase.from("case_files").delete().eq("id", fileId)

      if (error) throw error

      setExistingFiles(existingFiles.filter((f) => f.id !== fileId))
      toast.success("File removed successfully")
    } catch (err) {
      console.error("[v0] Error removing file:", err)
      toast.error("Failed to remove file")
    }
  }

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingDraft(true)

    try {
      const patientSignalment = {
        species,
        breed,
        age,
        sex_status: sexStatus,
        weight_kg: weightKg ? Number.parseFloat(weightKg) : null,
      }

      const caseData = {
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
        status: "draft",
      }

      let activeCaseId = caseId

      if (activeCaseId) {
        const { error: updateError } = await supabase.from("cases").update(caseData).eq("id", activeCaseId)

        if (updateError) throw updateError
      } else {
        const { data: newCase, error: insertError } = await supabase.from("cases").insert(caseData).select().single()

        if (insertError) throw insertError

        activeCaseId = newCase.id
        setCaseId(activeCaseId)
      }

      // Upload new files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${activeCaseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("case-bucket").upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

          if (uploadError) {
            console.error("[v0] Error uploading file:", file.name, uploadError)
            continue
          }

          await supabase.from("case_files").insert({
            case_id: activeCaseId,
            uploader_id: userProfile.id,
            file_name: file.name,
            file_type: file.type,
            storage_object_path: fileName,
            upload_phase: "initial_submission",
          })
        }

        setFiles([])
      }

      toast.success("Draft saved successfully", {
        description: "You can resume this case anytime from your dashboard.",
      })

      router.push("/gp-dashboard")
    } catch (err) {
      console.error("[v0] Draft save error:", err)
      toast.error("Failed to save draft", {
        description: err instanceof Error ? err.message : "Please try again.",
        duration: 8000,
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const executeSubmission = async () => {
    setIsSubmitting(true)
    setShowConfirmModal(false)

    try {
      const patientSignalment = {
        species,
        breed,
        age,
        sex_status: sexStatus,
        weight_kg: Number.parseFloat(weightKg),
      }

      const caseData = {
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
        status: "draft",
      }

      let activeCaseId = caseId

      if (activeCaseId) {
        const { error: updateError } = await supabase.from("cases").update(caseData).eq("id", activeCaseId)

        if (updateError) throw updateError
      } else {
        const { data: newCase, error: caseError } = await supabase.from("cases").insert(caseData).select().single()

        if (caseError) throw caseError
        activeCaseId = newCase.id
        setCaseId(activeCaseId)
      }

      // Upload new files if any
      if (files.length > 0) {
        let uploadedCount = 0
        const uploadErrors: string[] = []

        for (const file of files) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${activeCaseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("case-bucket").upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

          if (uploadError) {
            console.error("[v0] Error uploading file:", file.name, uploadError)
            uploadErrors.push(`${file.name}: ${uploadError.message}`)
            continue
          }

          const { error: fileRecordError } = await supabase.from("case_files").insert({
            case_id: activeCaseId,
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
          }
        }

        if (uploadErrors.length > 0) {
          console.error("[v0] Some files failed to upload:", uploadErrors)
          throw new Error(
            `Case created but ${uploadErrors.length} file(s) failed to upload: ${uploadErrors.join(", ")}`,
          )
        }
      }

      if (previousCaseCount === 0) {
        // First case - Founder's Circle freebie
        await supabase.from("cases").update({ status: "pending_assignment" }).eq("id", activeCaseId)
        router.push(`/submit-success?case_id=${activeCaseId}`)
      } else {
        // Subsequent cases - requires payment
        router.push(`/api/stripe/checkout?case_id=${activeCaseId}`)
      }
    } catch (err) {
      console.error("[v0] Submission error:", err)
      toast.error("Failed to submit case", {
        description: err instanceof Error ? err.message : "Please try again.",
        duration: 8000,
      })
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Manual validation for required fields
    const missingFields = []
    if (!patientName) missingFields.push("Patient Name")
    if (!species) missingFields.push("Species")
    if (!breed) missingFields.push("Breed")
    if (!age) missingFields.push("Age")
    if (!sexStatus) missingFields.push("Sex/Status")
    if (!weightKg) missingFields.push("Weight")
    if (!presentingComplaint) missingFields.push("Presenting Complaint")
    if (!specialtyRequested) missingFields.push("Specialty Requested")

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    // Show confirmation modal
    setShowConfirmModal(true)
  }

  return (
    <AppLayout activePage="submitCase" userName={userProfile.full_name} userRole="gp">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-brand-navy">
          {initialData ? "Resume Case Submission" : "Submit New Case"}
        </h1>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="species" className="required-field">
                    Species
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

                <div className="space-y-2">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="space-y-2">
                  <Label htmlFor="sex-status" className="required-field">
                    Sex/Status
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
                  required
                  rows={4}
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="brief-history" className="text-sm font-medium text-brand-navy">
                  Brief History
                </Label>
                <Textarea
                  id="brief-history"
                  value={briefHistory}
                  onChange={(e) => setBriefHistory(e.target.value)}
                  rows={4}
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="pe-findings" className="text-sm font-medium text-brand-navy">
                  Physical Exam Findings
                </Label>
                <Textarea
                  id="pe-findings"
                  value={peFindings}
                  onChange={(e) => setPeFindings(e.target.value)}
                  rows={4}
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="medications" className="text-sm font-medium text-brand-navy">
                  Current Medications
                </Label>
                <Textarea
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  rows={3}
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="diagnostics-performed" className="text-sm font-medium text-brand-navy">
                  Diagnostics Already Performed
                </Label>
                <Textarea
                  id="diagnostics-performed"
                  value={diagnosticsPerformed}
                  onChange={(e) => setDiagnosticsPerformed(e.target.value)}
                  rows={3}
                  placeholder="e.g., CBC, Chemistry, Urinalysis, Radiographs, etc."
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="treatments-attempted" className="text-sm font-medium text-brand-navy">
                  Treatments Already Attempted
                </Label>
                <Textarea
                  id="treatments-attempted"
                  value={treatmentsAttempted}
                  onChange={(e) => setTreatmentsAttempted(e.target.value)}
                  rows={3}
                  placeholder="e.g., Antibiotics, Fluids, Pain management, etc."
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="gp-questions" className="text-sm font-medium text-brand-navy">
                  Your Specific Questions
                </Label>
                <Textarea
                  id="gp-questions"
                  value={gpQuestions}
                  onChange={(e) => setGpQuestions(e.target.value)}
                  rows={3}
                  placeholder="What do you need help with?"
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="financial-constraints" className="text-sm font-medium text-brand-navy">
                  Financial Constraints
                </Label>
                <Textarea
                  id="financial-constraints"
                  value={financialConstraints}
                  onChange={(e) => setFinancialConstraints(e.target.value)}
                  rows={2}
                  placeholder="Any budgetary considerations we should know about?"
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialty & Files */}
          <Card className="border-brand-stone shadow-md">
            <CardHeader className="border-b border-brand-stone bg-brand-offwhite">
              <CardTitle className="text-xl font-bold text-brand-navy">Specialty & Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="specialty" className="required-field">
                  Specialty Requested
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
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Oncology">Oncology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                    <SelectItem value="Emergency & Critical Care">Emergency & Critical Care</SelectItem>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                  placeholder="Leave blank for auto-assignment"
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium text-brand-navy">
                    Upload Clinical Data (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload PDFs individually for instant viewing. Please ZIP large image series (DICOMs) into a single
                    file. Max 25 files per submission.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="border-2 border-brand-stone text-brand-navy hover:bg-brand-offwhite transition-colors"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,application/pdf,.dcm,.zip,.mp4,.mov,.avi,.xlsx,.csv,.doc,.docx"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Existing Files */}
                {existingFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-brand-navy">Existing Files</Label>
                    <div className="space-y-2">
                      {existingFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-lg border border-brand-stone bg-white p-3"
                        >
                          <span className="text-sm text-brand-navy">{file.file_name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingFile(file.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Files */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-brand-navy">New Files to Upload</Label>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-brand-stone bg-white p-3"
                        >
                          <span className="text-sm text-brand-navy">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="border-2 border-brand-stone text-brand-navy hover:bg-brand-offwhite transition-colors bg-transparent"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSavingDraft}
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-colors font-semibold shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Case"
              )}
            </Button>
          </div>
        </form>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-navy">Confirm Case Submission</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Please review your case details before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-brand-navy">Patient Name</p>
                  <p className="text-sm text-muted-foreground">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-navy">Species</p>
                  <p className="text-sm text-muted-foreground">{species}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-navy">Breed</p>
                  <p className="text-sm text-muted-foreground">{breed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-navy">Specialty</p>
                  <p className="text-sm text-muted-foreground">{specialtyRequested}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-brand-navy">Files Attached</p>
                <p className="text-sm text-muted-foreground">
                  {files.length + existingFiles.length} file{files.length + existingFiles.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-lg border border-brand-gold bg-brand-gold/10 p-4">
                <p className="text-sm font-medium text-brand-navy mb-2">Payment</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {previousCaseCount === 0 ? (
                    <span className="text-green-600">Founder's Circle Credit (Free)</span>
                  ) : (
                    "$395.00"
                  )}
                </p>
                {previousCaseCount === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Your first case is complimentary. Subsequent cases are $395 each.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="border-2 border-brand-stone"
              >
                Go Back
              </Button>
              <Button
                type="button"
                onClick={executeSubmission}
                disabled={isSubmitting}
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  )
}

export default CaseSubmissionForm

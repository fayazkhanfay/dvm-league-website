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
  const [existingFiles, setExistingFiles] = useState<any[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [caseId, setCaseId] = useState<string | null>(initialData?.id || null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [previousCaseCount, setPreviousCaseCount] = useState<number | null>(null)

  useEffect(() => {
    if (initialData) {
      console.log("[v0] Loading initial data:", initialData)
      console.log("[v0] Patient signalment:", initialData.patient_signalment)
      console.log("[v0] Specialty requested:", initialData.specialty_requested)

      setCaseId(initialData.id)
      setPatientName(initialData.patient_name || "")
      setSpecies(initialData.patient_signalment?.species || "")
      setBreed(initialData.patient_signalment?.breed || "")
      setAge(initialData.patient_signalment?.age || "")
      setSexStatus(initialData.patient_signalment?.sex_status || "")
      setWeightKg(initialData.patient_signalment?.weight_kg?.toString() || "")
      setPresentingComplaint(initialData.presenting_complaint || "")
      setBriefHistory(initialData.brief_history || "")
      setPeFindings(initialData.pe_findings || "")
      setMedications(initialData.medications || "")
      setDiagnosticsPerformed(initialData.diagnostics_performed || "")
      setTreatmentsAttempted(initialData.treatments_attempted || "")
      setGpQuestions(initialData.gp_questions || "")
      setFinancialConstraints(initialData.financial_constraints || "")
      setSpecialtyRequested(initialData.specialty_requested || "")
      setPreferredSpecialist(initialData.preferred_specialist || "")
      setExistingFiles(initialData.case_files || [])
    }
  }, [initialData])

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
      console.log("[v0] Saving draft...")
      console.log("[v0] Dropdown values being saved:", {
        species,
        sexStatus,
        specialtyRequested,
      })

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

      console.log("[v0] Complete case data being saved:", caseData)

      let activeCaseId = caseId

      if (activeCaseId) {
        console.log("[v0] Updating existing draft:", activeCaseId)
        const { error: updateError } = await supabase.from("cases").update(caseData).eq("id", activeCaseId)

        if (updateError) throw updateError
      } else {
        console.log("[v0] Creating new draft case")
        const { data: newCase, error: insertError } = await supabase.from("cases").insert(caseData).select().single()

        if (insertError) throw insertError

        activeCaseId = newCase.id
        setCaseId(activeCaseId)
        console.log("[v0] Draft created with ID:", activeCaseId)
      }

      // Upload new files if any
      if (files.length > 0) {
        console.log("[v0] Uploading", files.length, "files to draft...")

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
      console.log("[v0] Starting case submission...")

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
        console.log("[v0] Updating existing case:", activeCaseId)
        const { error: updateError } = await supabase.from("cases").update(caseData).eq("id", activeCaseId)

        if (updateError) throw updateError
        console.log("[v0] Case updated successfully:", activeCaseId)
      } else {
        console.log("[v0] Creating new case")
        const { data: newCase, error: caseError } = await supabase.from("cases").insert(caseData).select().single()

        if (caseError) throw caseError
        activeCaseId = newCase.id
        setCaseId(activeCaseId)
        console.log("[v0] Case created successfully:", activeCaseId)
      }

      // Upload new files if any
      if (files.length > 0) {
        console.log("[v0] Uploading", files.length, "files...")

        let uploadedCount = 0
        const uploadErrors: string[] = []

        for (const file of files) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${activeCaseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

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

      console.log("[v0] Case submission complete, routing to payment or success...")

      if (previousCaseCount === 0) {
        // First case - Founder's Circle freebie
        // Update status to pending_assignment
        await supabase.from("cases").update({ status: "pending_assignment" }).eq("id", activeCaseId)

        console.log("[v0] First case detected - redirecting to success page (free case)")
        router.push(`/submit-success?case_id=${activeCaseId}`)
      } else {
        // Subsequent cases - requires payment
        console.log("[v0] Subsequent case detected - redirecting to Stripe checkout")
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
                  Diagnostics Performed *
                </Label>
                <Textarea
                  id="diagnostics-performed"
                  value={diagnosticsPerformed}
                  onChange={(e) => setDiagnosticsPerformed(e.target.value)}
                  placeholder="List any diagnostics already performed..."
                  rows={3}
                  required
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="treatments-attempted" className="text-sm font-medium text-brand-navy">
                  Treatments Attempted *
                </Label>
                <Textarea
                  id="treatments-attempted"
                  value={treatmentsAttempted}
                  onChange={(e) => setTreatmentsAttempted(e.target.value)}
                  placeholder="List any treatments already attempted..."
                  rows={3}
                  required
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
                  placeholder="Leave blank for automatic assignment"
                  className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="file-upload" className="text-sm font-medium text-brand-navy">
                  Upload Clinical Data Only
                </Label>
                <p className="mb-3 mt-1 text-sm text-brand-navy/70">
                  Upload PDFs individually for instant viewing. Please ZIP large image series (DICOMs) into a single
                  file. Max 25 files per submission.
                </p>

                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" className="relative bg-transparent" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Files
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.dcm,.zip,.mp4,.mov,.avi,.xlsx,.csv,.doc,.docx,audio/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </Button>
                  <span className="text-sm text-brand-navy/70">
                    {files.length + existingFiles.length} file(s) selected
                  </span>
                </div>

                {existingFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-brand-navy">Previously uploaded files:</p>
                    {existingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-md border border-brand-stone bg-brand-offwhite p-3"
                      >
                        <span className="text-sm text-brand-navy">{file.file_name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingFile(file.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-brand-navy">New files to upload:</p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-brand-stone bg-brand-offwhite p-3"
                      >
                        <span className="text-sm text-brand-navy">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="flex-1 border-2 border-brand-stone px-6 py-3 font-semibold text-brand-navy transition-all hover:bg-brand-stone bg-transparent"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Draft...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isSavingDraft}
              className="flex-1 transform rounded-md bg-brand-gold px-6 py-3 font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:hover:scale-100"
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
          </div>
        </form>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-brand-navy">Confirm Case Submission</DialogTitle>
              <DialogDescription className="text-sm text-brand-navy/70">
                Please review the case details before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-navy">Patient:</span>
                  <span className="text-brand-navy/80">
                    {patientName} ({species}, {breed})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold text-brand-navy">Specialty:</span>
                  <span className="text-brand-navy/80">{specialtyRequested}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold text-brand-navy">Files Attached:</span>
                  <span className="text-brand-navy/80">{files.length + existingFiles.length} file(s)</span>
                </div>

                <div className="mt-4 rounded-md border-2 border-brand-gold bg-brand-offwhite p-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-brand-navy">Payment Status:</span>
                    <span className="font-bold text-brand-gold">
                      {previousCaseCount === 0 ? "Founder's Circle Credit (Free)" : "$395.00 (Complete Case Consult)"}
                    </span>
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
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeSubmission}
                disabled={isSubmitting}
                className="bg-brand-gold font-bold text-brand-navy hover:bg-brand-navy hover:text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
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

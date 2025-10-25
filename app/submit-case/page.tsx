"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { UploadCloud, FileText, ImageIcon, AlertCircle } from "lucide-react"

export default function SubmitCasePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])

  // Form state
  const [specialty, setSpecialty] = useState("")
  const [presentingComplaint, setPresentingComplaint] = useState("")
  const [briefHistory, setBriefHistory] = useState("")
  const [peFindings, setPeFindings] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [diagnostics, setDiagnostics] = useState("")
  const [treatments, setTreatments] = useState("")
  const [specificQuestions, setSpecificQuestions] = useState("")

  const [patientName, setPatientName] = useState("")
  const [breed, setBreed] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [species, setSpecies] = useState("")
  const [sexStatus, setSexStatus] = useState("")
  const [vaccinationStatus, setVaccinationStatus] = useState("")
  const [isOnFleaTick, setIsOnFleaTick] = useState(false)
  const [isOnHeartworm, setIsOnHeartworm] = useState(false)

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = []

    if (step === 1) {
      if (!specialty) newErrors.push("Specialty is required")
      if (!presentingComplaint) newErrors.push("Presenting Complaint is required")
      if (!briefHistory) newErrors.push("Brief History is required")
      if (!peFindings) newErrors.push("Relevant PE Findings is required")
      if (!currentMedications) newErrors.push("Current Medications is required")
      if (!specificQuestions) newErrors.push("Specific Questions for the Specialist is required")
    } else if (step === 2) {
      if (!patientName) newErrors.push("Patient Name is required")
      if (!breed) newErrors.push("Breed is required")
      if (!age) newErrors.push("Age is required")
      if (!weight) newErrors.push("Weight is required")
      if (!species) newErrors.push("Species is required")
      if (!sexStatus) newErrors.push("Sex / Neuter Status is required")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setErrors([])
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    setErrors([])
  }

  const handleSubmit = () => {
    // Fake submission - navigate to GP dashboard
    router.push("/gp-dashboard")
  }

  const steps = [
    { number: 1, title: "Case Details" },
    { number: 2, title: "Patient Info" },
    { number: 3, title: "Upload Files" },
    { number: 4, title: "Review & Submit" },
  ]

  return (
    <AppLayout activePage="submitCase" userRole="gp">
      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-brand-navy">Submit New Case</h1>
          <p className="mt-2 text-brand-navy/70">
            Fill out the details below to submit your case for specialist consultation.
          </p>
        </div>

        {/* Main Card with Multi-Step Form */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {/* Step Indicator Tabs */}
          <div className="mb-8 flex gap-2 border-b border-brand-stone">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => {
                  if (step.number < currentStep || validateStep(currentStep)) {
                    setCurrentStep(step.number)
                    setErrors([])
                  }
                }}
                className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  currentStep === step.number
                    ? "border-brand-navy text-brand-navy"
                    : "border-transparent text-brand-navy/70 hover:text-brand-navy"
                }`}
              >
                Step {step.number}: {step.title}
              </button>
            ))}
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-6 rounded-md border border-brand-red/20 bg-brand-red/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-brand-red" />
                <div>
                  <h3 className="font-semibold text-brand-red">Please fix the following errors:</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-brand-red">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Case Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="specialty" className="text-sm font-medium text-brand-navy">
                    Select Specialty <span className="text-brand-red">*</span>
                  </Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger
                      id="specialty"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    >
                      <SelectValue placeholder="Choose a specialty..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="presenting-complaint" className="text-sm font-medium text-brand-navy">
                    Presenting Complaint <span className="text-brand-red">*</span>
                  </Label>
                  <Textarea
                    id="presenting-complaint"
                    value={presentingComplaint}
                    onChange={(e) => setPresentingComplaint(e.target.value)}
                    placeholder="Describe the main complaint..."
                    rows={3}
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="brief-history" className="text-sm font-medium text-brand-navy">
                    Brief History <span className="text-brand-red">*</span>
                  </Label>
                  <Textarea
                    id="brief-history"
                    value={briefHistory}
                    onChange={(e) => setBriefHistory(e.target.value)}
                    placeholder="Chronological history, relevant past issues, current diet, response to any previous treatments..."
                    rows={4}
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="pe-findings" className="text-sm font-medium text-brand-navy">
                    Relevant PE Findings <span className="text-brand-red">*</span>
                  </Label>
                  <Textarea
                    id="pe-findings"
                    value={peFindings}
                    onChange={(e) => setPeFindings(e.target.value)}
                    placeholder="Physical examination findings..."
                    rows={3}
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="current-medications" className="text-sm font-medium text-brand-navy">
                    Current Medications (Drug, Dose, Frequency) <span className="text-brand-red">*</span>
                  </Label>
                  <Textarea
                    id="current-medications"
                    name="currentMedications"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="List all current medications, including dosage and frequency..."
                    rows={3}
                    required
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="diagnostics" className="text-sm font-medium text-brand-navy">
                    Diagnostics Performed So Far
                  </Label>
                  <Textarea
                    id="diagnostics"
                    value={diagnostics}
                    onChange={(e) => setDiagnostics(e.target.value)}
                    placeholder="List any tests or diagnostics performed..."
                    rows={3}
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div>
                  <Label htmlFor="treatments" className="text-sm font-medium text-brand-navy">
                    Treatments Attempted So Far
                  </Label>
                  <Textarea
                    id="treatments"
                    value={treatments}
                    onChange={(e) => setTreatments(e.target.value)}
                    placeholder="Describe any treatments tried..."
                    rows={3}
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>

                <div className="rounded-md border border-brand-gold bg-brand-gold/10 p-4">
                  <Label htmlFor="specific-questions" className="text-sm font-medium text-brand-navy">
                    Your Specific Question(s) for the Specialist <span className="text-brand-red">*</span>
                  </Label>
                  <p className="mt-1 text-xs text-brand-navy/70">
                    Be as specific as possible. What do you need help with?
                  </p>
                  <Textarea
                    id="specific-questions"
                    value={specificQuestions}
                    onChange={(e) => setSpecificQuestions(e.target.value)}
                    placeholder="What specific questions do you have for the specialist?"
                    rows={4}
                    className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Patient Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="patient-name" className="text-sm font-medium text-brand-navy">
                      Patient Name <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="patient-name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="breed" className="text-sm font-medium text-brand-navy">
                      Breed <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="breed"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      placeholder="Enter breed"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="species" className="text-sm font-medium text-brand-navy">
                      Species <span className="text-brand-red">*</span>
                    </Label>
                    <Select value={species} onValueChange={setSpecies}>
                      <SelectTrigger
                        id="species"
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      >
                        <SelectValue placeholder="Select species..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="canine">Canine</SelectItem>
                        <SelectItem value="feline">Feline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sex-status" className="text-sm font-medium text-brand-navy">
                      Sex / Neuter Status <span className="text-brand-red">*</span>
                    </Label>
                    <Select value={sexStatus} onValueChange={setSexStatus}>
                      <SelectTrigger
                        id="sex-status"
                        className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                      >
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male-intact">Male Intact</SelectItem>
                        <SelectItem value="male-neutered">Male Neutered</SelectItem>
                        <SelectItem value="female-intact">Female Intact</SelectItem>
                        <SelectItem value="female-spayed">Female Spayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-brand-navy">
                      Age <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 5 years"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight" className="text-sm font-medium text-brand-navy">
                      Weight (kg) <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter weight"
                      className="mt-2 border-2 border-brand-stone px-4 py-3 shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-brand-navy">Vaccination Status (Optional)</Label>
                  <RadioGroup value={vaccinationStatus} onValueChange={setVaccinationStatus} className="mt-3">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="up-to-date" id="vax-up-to-date" />
                        <Label htmlFor="vax-up-to-date" className="font-normal cursor-pointer">
                          Up-to-Date
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="overdue" id="vax-overdue" />
                        <Label htmlFor="vax-overdue" className="font-normal cursor-pointer">
                          Overdue
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unknown" id="vax-unknown" />
                        <Label htmlFor="vax-unknown" className="font-normal cursor-pointer">
                          Unknown
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium text-brand-navy">Preventative Status (Optional)</Label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fleaTickPreventative"
                        checked={isOnFleaTick}
                        onCheckedChange={(checked) => setIsOnFleaTick(checked as boolean)}
                      />
                      <Label htmlFor="fleaTickPreventative" className="font-normal cursor-pointer">
                        On Flea/Tick Preventative
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="heartwormPreventative"
                        checked={isOnHeartworm}
                        onCheckedChange={(checked) => setIsOnHeartworm(checked as boolean)}
                      />
                      <Label htmlFor="heartwormPreventative" className="font-normal cursor-pointer">
                        On Heartworm Preventative
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Upload Files */}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Radiographs / DICOMs */}
                <div>
                  <h3 className="mb-3 font-semibold text-brand-navy">Radiographs / DICOMs</h3>
                  <div className="rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-8 text-center transition-colors hover:border-brand-gold">
                    <UploadCloud className="mx-auto h-12 w-12 text-brand-navy/40" />
                    <p className="mt-2 text-sm text-brand-navy/70">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-brand-navy/50">DICOM, JPG, PNG up to 50MB</p>
                    <input type="file" className="hidden" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm">
                      <ImageIcon className="h-4 w-4 text-brand-navy/60" />
                      <span className="text-brand-navy">Radiograph_Lateral.dcm</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm">
                      <ImageIcon className="h-4 w-4 text-brand-navy/60" />
                      <span className="text-brand-navy">Radiograph_VD.dcm</span>
                    </div>
                  </div>
                </div>

                {/* Lab Reports */}
                <div>
                  <h3 className="mb-3 font-semibold text-brand-navy">Lab Reports</h3>
                  <div className="rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-8 text-center transition-colors hover:border-brand-gold">
                    <UploadCloud className="mx-auto h-12 w-12 text-brand-navy/40" />
                    <p className="mt-2 text-sm text-brand-navy/70">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-brand-navy/50">PDF, DOC, JPG up to 20MB</p>
                    <input type="file" className="hidden" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 rounded-md bg-white p-3 text-sm">
                      <FileText className="h-4 w-4 text-brand-navy/60" />
                      <span className="text-brand-navy">Lab_Results.pdf</span>
                    </div>
                  </div>
                </div>

                {/* Cytology/Histology Images */}
                <div>
                  <h3 className="mb-3 font-semibold text-brand-navy">Cytology/Histology Images</h3>
                  <div className="rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-8 text-center transition-colors hover:border-brand-gold">
                    <UploadCloud className="mx-auto h-12 w-12 text-brand-navy/40" />
                    <p className="mt-2 text-sm text-brand-navy/70">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-brand-navy/50">JPG, PNG up to 20MB</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>

                {/* Other Files */}
                <div>
                  <h3 className="mb-3 font-semibold text-brand-navy">Other Files</h3>
                  <div className="rounded-lg border-2 border-dashed border-brand-stone bg-brand-offwhite p-8 text-center transition-colors hover:border-brand-gold">
                    <UploadCloud className="mx-auto h-12 w-12 text-brand-navy/40" />
                    <p className="mt-2 text-sm text-brand-navy/70">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-brand-navy/50">Any file type up to 50MB</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Founder's Circle Banner */}
                <div className="rounded-md border-l-4 border-brand-gold bg-brand-gold/10 p-4">
                  <p className="text-sm font-medium text-brand-navy">
                    As part of the Founder's Circle, your first Complete Case Consult is complimentary ($395 value).
                  </p>
                </div>

                {/* Review Summary */}
                <div>
                  <h3 className="mb-4 font-serif text-xl font-bold text-brand-navy">Review Summary</h3>
                  <div className="space-y-4 rounded-lg bg-brand-offwhite p-6">
                    <div>
                      <h4 className="font-semibold text-brand-navy">Case Details</h4>
                      <p className="mt-1 text-sm text-brand-navy/70">
                        <strong>Specialty:</strong> {specialty || "Not specified"}
                      </p>
                      <p className="mt-1 text-sm text-brand-navy/70">
                        <strong>Presenting Complaint:</strong> {presentingComplaint || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-brand-navy">Patient Information</h4>
                      <p className="mt-1 text-sm text-brand-navy/70">
                        <strong>Name:</strong> {patientName || "Not specified"}
                      </p>
                      <p className="mt-1 text-sm text-brand-navy/70">
                        <strong>Species:</strong> {species || "Not specified"} | <strong>Breed:</strong>{" "}
                        {breed || "Not specified"}
                      </p>
                      <p className="mt-1 text-sm text-brand-navy/70">
                        <strong>Age:</strong> {age || "Not specified"} | <strong>Weight:</strong>{" "}
                        {weight ? `${weight} kg` : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-brand-navy">Files Uploaded</h4>
                      <p className="mt-1 text-sm text-brand-navy/70">2 radiographs, 1 lab report (example data)</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
                >
                  Submit Case
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-brand-stone pt-6">
            {currentStep > 1 && (
              <Button onClick={handlePrevious} variant="outline" className="px-6 py-2 bg-transparent">
                Previous
              </Button>
            )}
            {currentStep < 4 && (
              <Button
                onClick={handleNext}
                className="ml-auto bg-brand-navy px-6 py-2 text-white hover:bg-brand-navy/90"
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}

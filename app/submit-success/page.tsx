import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { sendCaseConfirmation, notifyMatchingSpecialists } from "@/lib/email"
import { notifySlack } from "@/lib/notifications"
import Link from "next/link"

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ case_id?: string }>
}) {
  let user = null
  let profile = null
  let caseId: string | undefined
  let paymentConfirmed = false
  let caseData = null
  let shouldRedirectToLogin = false
  let emailSent = false

  try {
    const supabase = await createClient()

    // Get user
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      user = authUser
      console.log("[v0] User fetched:", user?.id)
    } catch (error) {
      console.error("[v0] Error getting user:", error)
    }

    // Get profile if user exists
    if (user) {
      try {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        profile = profileData
        console.log("[v0] Profile fetched:", profile?.id, profile?.role)
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      }
    }

    // Check if we should redirect (but don't throw, just set flag)
    if (!user || !profile || profile.role !== "gp") {
      shouldRedirectToLogin = true
      console.log("[v0] Auth check failed - will show redirect message")
    }

    // Only proceed with case logic if auth is valid
    if (!shouldRedirectToLogin) {
      // Parse searchParams
      try {
        const params = await searchParams
        caseId = params.case_id
        console.log("[v0] Submit Success - Case ID from URL:", caseId)
      } catch (error) {
        console.error("[v0] Error parsing searchParams:", error)
      }

      // Update case status if case_id is present
      if (caseId) {
        try {
          const { error: updateError } = await supabase
            .from("cases")
            .update({ status: "pending_assignment" })
            .eq("id", caseId)
            .eq("gp_id", user.id)
            .eq("status", "draft")

          if (updateError) {
            console.error("[v0] Error updating case status:", updateError)
          } else {
            console.log("[v0] Case status updated from draft to pending_assignment")
            paymentConfirmed = true

            try {
              revalidatePath("/gp-dashboard")
              revalidatePath("/specialist-dashboard")
              console.log("[v0] Dashboard paths revalidated")
            } catch (error) {
              console.error("[v0] Error revalidating paths:", error)
            }
          }
        } catch (error) {
          console.error("[v0] Exception while updating case status:", error)
        }

        // Fetch case data
        try {
          const { data, error } = await supabase
            .from("cases")
            .select("id, patient_name, created_at, specialty_requested, patient_signalment, presenting_complaint")
            .eq("id", caseId)
            .single()

          if (!error && data) {
            console.log("[v0] Case data fetched successfully:", data)
            caseData = data

            if (profile?.email && profile?.full_name && data.patient_name) {
              console.log("[v0] Sending confirmation email to GP:", profile.email)
              const emailResult = await sendCaseConfirmation(
                profile.email,
                profile.full_name,
                data.patient_name,
                data.id,
              )

              if (emailResult.success) {
                emailSent = true
                console.log("[v0] Confirmation email sent successfully to GP")

                await notifySlack(
                  `💰 PAYMENT SUCCESS ($395): Case Confirmed for Patient: ${data.patient_name} (Ref: ${data.id.slice(0, 8).toUpperCase()}). Email sent to GP.`,
                  "money",
                )
              } else {
                console.error("[v0] Failed to send confirmation email:", emailResult.error)
              }

              if (data.specialty_requested && paymentConfirmed) {
                console.log("[v0] Notifying specialists for specialty:", data.specialty_requested)

                const signalment = data.patient_signalment
                const signalmentString = `${signalment.species}, ${signalment.breed}, ${signalment.age}, ${signalment.sex_status}, ${signalment.weight_kg}kg`

                const specialistNotifResult = await notifyMatchingSpecialists(
                  data.specialty_requested,
                  data.id,
                  data.patient_name,
                  signalmentString,
                  data.presenting_complaint,
                )

                if (specialistNotifResult.success) {
                  console.log(
                    `[v0] Specialist notifications sent: ${specialistNotifResult.sent} sent, ${specialistNotifResult.failed} failed`,
                  )

                  await notifySlack(
                    `📧 SPECIALIST NOTIFIED: ${specialistNotifResult.sent} ${data.specialty_requested} specialist(s) notified about case ${data.id.slice(0, 8).toUpperCase()}`,
                    "email",
                  )
                } else {
                  console.error("[v0] Failed to notify specialists:", specialistNotifResult.error)
                }
              }
            }
          } else {
            console.error("[v0] Error fetching case data:", error)
          }
        } catch (error) {
          console.error("[v0] Exception while fetching case data:", error)
        }
      }
    }
  } catch (error) {
    console.error("[v0] Unexpected error in submit-success page:", error)
    // Continue rendering with safe defaults
  }

  if (shouldRedirectToLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Required</h1>
          <p className="mt-4 text-gray-600">Please log in to view this page.</p>
          <Button asChild className="mt-6">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    )
  }

  const patientName = caseData?.patient_name || "Unknown Patient"
  const caseIdDisplay = caseId || "N/A"
  const userName = profile?.full_name || "User"
  const userEmail = profile?.email || ""

  console.log("[v0] Rendering success page - Patient:", patientName, "Case ID:", caseIdDisplay)

  return (
    <AppLayout activePage="submitCase" userRole="gp" userName={userName} isDemoUser={profile?.is_demo}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border-2 border-brand-gold bg-white p-8 text-center shadow-2xl md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/20">
            <Trophy className="h-12 w-12 text-brand-gold" />
          </div>

          <h1 className="mt-6 font-serif text-4xl font-bold text-brand-navy">Payment Successful!</h1>
          <h2 className="mt-2 text-2xl font-semibold text-brand-gold">Case Submitted</h2>

          <div className="mt-6 rounded-lg bg-brand-navy/5 p-6">
            <p className="text-lg text-brand-navy">
              {emailSent && (
                <>
                  We have sent a confirmation email to{" "}
                  <span className="font-semibold text-brand-gold">{userEmail}</span>.
                </>
              )}
              {!emailSent && <>Your case has been received.</>}
            </p>
            <p className="mt-2 text-base text-brand-navy/80">
              A specialist will review <strong>{patientName}</strong>'s case shortly.
            </p>
          </div>

          {paymentConfirmed && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Payment confirmed. Case ID: <strong>{caseIdDisplay}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 border-t-2 border-brand-stone pt-8">
            <h2 className="text-left text-xl font-semibold text-brand-navy">What Happens Next?</h2>

            <div className="mt-6 space-y-6 text-left">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Specialist Assignment</h3>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    Your case will be assigned to a dedicated specialist who will begin review immediately.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Phase 1: Diagnostic Plan</h3>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    You will receive an email notification when the Phase 1 Diagnostic Plan is ready for review (within
                    1-2 business days).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Phase 2: Treatment Plan</h3>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    After you perform the diagnostics and upload the results, your specialist will deliver the Phase 2
                    Complete Treatment Plan (by 9:00 AM ET the next business day).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
            >
              <Link href="/gp-dashboard">Return to Dashboard</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-md border-2 border-brand-navy px-8 py-4 text-lg font-bold text-brand-navy transition-all duration-300 hover:bg-brand-navy hover:text-white bg-transparent"
            >
              <Link href="/settings">View Receipt</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

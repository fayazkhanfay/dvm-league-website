import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { AppLayout } from "@/components/app-layout"

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

          if (updateError) {
            console.error("[v0] Error updating case status:", updateError)
          } else {
            console.log("[v0] Case status updated to pending_assignment")
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
            .select("id, patient_name, created_at")
            .eq("id", caseId)
            .single()

          if (!error && data) {
            console.log("[v0] Case data fetched successfully:", data)
            caseData = data
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

  console.log("[v0] Rendering success page - Patient:", patientName, "Case ID:", caseIdDisplay)

  return (
    <AppLayout activePage="submitCase" userRole="gp" userName={userName}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-brand-stone bg-white p-8 text-center shadow-lg md:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10">
            <CheckCircle className="h-7 w-7 text-brand-gold" />
          </div>

          <h1 className="mt-6 font-serif text-3xl font-bold text-brand-navy">Case Submitted Successfully!</h1>

          <p className="mt-4 text-lg text-brand-navy/80">
            Your case for <strong>{patientName}</strong> (Case ID: <strong>{caseIdDisplay}</strong>) has been received.
            You will receive Phase 1 (The Diagnostic Plan) within 1-2 business days.
          </p>

          {paymentConfirmed && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Payment confirmed. Your case is now active and has been sent to the specialist network.
              </p>
            </div>
          )}

          <div className="mt-8 border-t border-brand-stone pt-8">
            <h2 className="text-left text-xl font-semibold text-brand-navy">What Happens Next?</h2>

            <div className="mt-6 space-y-6 text-left">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Confirmation Email</h3>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    You will receive an email confirmation shortly with your Case ID ({caseIdDisplay}).
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
                    Our team will assign your case to a dedicated specialist. You will receive an email notification
                    when the Phase 1 Diagnostic Plan is ready for review (within 1-2 business days).
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
                    After you perform the diagnostics and upload the results to the case, your specialist will deliver
                    the Phase 2 Complete Treatment Plan (by 9:00 AM ET the next business day).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Button
              asChild
              className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white sm:w-auto"
            >
              <a href="/gp-dashboard">Return to Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

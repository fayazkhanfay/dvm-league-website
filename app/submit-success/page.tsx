"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldCheck, PlusCircle, LayoutList, CheckCircle } from "lucide-react"

export default function SubmitSuccessPage() {
  const router = useRouter()

  const handleReturnToDashboard = () => {
    router.push("/gp-dashboard")
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Simplified App Header */}
      <header className="border-b border-brand-stone bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-brand-navy" />
            <h1 className="font-serif text-2xl font-bold text-brand-navy">DVM League</h1>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-brand-navy/80">Logged in as Dr. Demo GP</span>
            <a href="#" className="text-sm text-brand-navy/60 underline hover:text-brand-red">
              Logout
            </a>
          </div>
        </div>
      </header>

      {/* Minimal App Top Navigation Bar */}
      <nav className="border-b border-brand-stone bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <a
              href="/submit-case"
              className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm text-brand-navy/70 hover:text-brand-navy"
            >
              <PlusCircle className="h-4 w-4" />
              Submit New Case
            </a>
            <a
              href="/gp-dashboard"
              className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm text-brand-navy/70 hover:text-brand-navy"
            >
              <LayoutList className="h-4 w-4" />
              My Cases
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Confirmation Card */}
        <div className="rounded-lg border border-brand-stone bg-white p-8 text-center shadow-lg md:p-12">
          {/* Success Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10">
            <CheckCircle className="h-7 w-7 text-brand-gold" />
          </div>

          {/* Title */}
          <h1 className="mt-6 font-serif text-3xl font-bold text-brand-navy">Case Submitted Successfully!</h1>

          {/* Subtitle */}
          <p className="mt-4 text-lg text-brand-navy/80">
            Your case for <strong>Buddy Smith</strong> (Case ID: <strong>DVML-001</strong>) has been received. You will
            receive Phase 1 (The Diagnostic Plan) within 1-2 business days.
          </p>

          {/* What Happens Next Section */}
          <div className="mt-8 border-t border-brand-stone pt-8">
            <h2 className="text-left text-xl font-semibold text-brand-navy">What Happens Next?</h2>

            <div className="mt-6 space-y-6 text-left">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Confirmation Email</h3>
                  <p className="mt-1 text-sm text-brand-navy/70">
                    You will receive an email confirmation shortly with your Case ID (DVML-001).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
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

              {/* Step 3 */}
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

          {/* Action Button */}
          <div className="mt-10">
            <Button
              onClick={handleReturnToDashboard}
              className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white sm:w-auto"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"
import type { Metadata } from "next"
// import { RequestInvitationForm } from "@/components/request-invitation-form";
import { RequestInvitationFormGoogle } from "@/components/request-invitation-form-google"
export const metadata: Metadata = {
  title: "Request Invitation | Founder's Circle | DVM League",
  description:
    "Join the DVM League Founder's Circle. Get priority access and your first $395 Complete Case Consult free. Request your invitation today.",
  robots: {
    // Discourage indexing of this specific page if desired, otherwise omit this line
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/request-invitation",
  },
}

export default function RequestInvitationPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <Header />
      <main className="px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Value Propositions */}
            <div className="space-y-8 md:pr-8">
              {/* Logo and Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-10 w-10 text-brand-navy" strokeWidth={1.5} />
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">DVM League</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy leading-tight">
                  You're One Step Away from Elite Veterinary Support
                </h1>
              </div>

              {/* Value Propositions */}
              <div className="space-y-6">
                {/* Point 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <span className="text-xl font-serif font-bold text-brand-navy">1</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-brand-navy">Your First Consult is Free</h3>
                    <p className="text-brand-navy/70 leading-relaxed">
                      As a Founder's Circle member, receive your first Complete Case Consult ($395 value) at no cost.
                      Experience the difference board-certified specialists make.
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <span className="text-xl font-serif font-bold text-brand-navy">2</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-brand-navy">Keep Your Cases, Keep Your Clients</h3>
                    <p className="text-brand-navy/70 leading-relaxed">
                      No referrals required. Get expert guidance while maintaining the doctor-client relationship and
                      continuing care at your practice.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <span className="text-xl font-serif font-bold text-brand-navy">3</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-brand-navy">Access to an Elite Network</h3>
                    <p className="text-brand-navy/70 leading-relaxed">
                      Connect with board-certified specialists across multiple disciplines. American specialists.
                      American standards. Available when you need them.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="pt-4 border-t border-brand-navy/10">
                <p className="text-sm font-semibold text-brand-navy/60 tracking-wide uppercase">
                  American Specialists. American Standards.
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex items-center justify-center">
              <RequestInvitationFormGoogle />
            </div>
          </div>
        </div>
      </main>
      {/* </CHANGE> */}
      <Footer />
    </div>
  )
}

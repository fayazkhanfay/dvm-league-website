"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function ROISection() {
  const sectionRef = useScrollAnimation()

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 bg-gradient-to-b from-brand-offwhite to-white border-y border-brand-stone"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="scroll-animate">
              <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-navy text-balance">
                How a $395 Consult Unlocked a $4,200 Case.
              </h2>
              <p className="mt-6 text-lg text-brand-navy/90 leading-relaxed text-pretty">
                This is not a cost center; it is a profit engine. See how one practice used our Complete Case Consult to
                turn a complex referral into a profitable, in-house success story.
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <div
                className="scroll-animate p-6 bg-white rounded-xl border border-brand-stone shadow-sm hover-lift transition-all duration-300"
                style={{ animationDelay: "200ms" }}
              >
                <p className="text-sm font-semibold text-brand-navy/70">The Investment</p>
                <p className="text-3xl font-bold text-brand-navy">$395 for the Complete Case Consult</p>
              </div>
              <div
                className="scroll-animate p-6 bg-white rounded-xl border border-brand-stone shadow-sm hover-lift transition-all duration-300"
                style={{ animationDelay: "400ms" }}
              >
                <p className="text-sm font-semibold text-brand-navy/70">In-House Revenue Captured</p>
                <p className="text-3xl font-bold text-brand-navy">$1,200+ (Advanced Diagnostics)</p>
              </div>
              <div
                className="scroll-animate p-6 bg-white rounded-xl border border-brand-stone shadow-sm hover-lift transition-all duration-300"
                style={{ animationDelay: "600ms" }}
              >
                <p className="text-sm font-semibold text-brand-navy/70">Long-Term In-House Revenue Retained</p>
                <p className="text-3xl font-bold text-brand-navy">$3,000+ (Chronic Meds & Rechecks)</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div
              className="scroll-animate bg-white p-8 rounded-2xl shadow-xl border border-brand-stone hover-lift transition-all duration-500"
              style={{ animationDelay: "800ms" }}
            >
              <img
                className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                src="/placeholder.svg?height=400&width=400&text=Healthy+Patient"
                alt="A healthy and happy golden retriever, representing a successful medical outcome."
              />
              <p className="mt-8 font-serif font-bold text-8xl tracking-tighter text-brand-navy animate-pulse-glow">
                10x+
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-navy/80">Return on Investment</p>
              <p className="mt-4 text-sm text-brand-navy/80 text-pretty">
                Our service is designed to be the single most profitable investment you can make in a complex case.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

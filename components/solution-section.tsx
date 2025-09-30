"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function SolutionSection() {
  const sectionRef = useScrollAnimation()

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <div className="scroll-animate">
          <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-navy sm:text-6xl text-balance">
            One Product. A Complete Solution.
          </h2>
          <p className="mt-6 text-lg text-brand-navy/90 leading-relaxed max-w-3xl mx-auto text-pretty">
            {
              "We've eliminated the confusion of multiple services. We offer one premium, all-inclusive consult that provides a dedicated specialist for the entire journey of your case."
            }
          </p>
        </div>
        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-8 relative">
            <div
              className="absolute left-6 top-6 bottom-6 w-0.5 bg-brand-stone border-l-2 border-dashed border-brand-navy/30 hidden sm:block scroll-animate"
              style={{ animationDelay: "400ms" }}
            ></div>

            <div
              className="scroll-animate flex items-start gap-6 relative hover-lift group"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-brand-navy text-white font-bold text-2xl font-serif rounded-full z-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-navy">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy group-hover:text-brand-gold transition-colors duration-300">
                  Phase 1: The Diagnostic Plan
                </h3>
                <p className="mt-2 text-brand-navy/80">
                  Your dedicated specialist reviews the initial case files and delivers a clear, actionable plan for the
                  highest-yield next diagnostic step. The case is placed on hold while you perform the workup.
                </p>
              </div>
            </div>
            <div
              className="scroll-animate flex items-start gap-6 relative hover-lift group"
              style={{ animationDelay: "800ms" }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-brand-navy text-white font-bold text-2xl font-serif rounded-full z-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-navy">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy group-hover:text-brand-gold transition-colors duration-300">
                  Phase 2: The Complete Treatment Plan
                </h3>
                <p className="mt-2 text-brand-navy/80">
                  Once you upload the new diagnostic results, the same specialist is notified and delivers the final,
                  comprehensive Specialist Action Plan, including long-term treatment protocols, prognosis, and the
                  co-branded Client-Friendly Summary.
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block scroll-animate" style={{ animationDelay: "1000ms" }}>
            <img
              src="/advanced-care-in-house.png"
              alt="A general practice veterinarian confidently performing an ultrasound in their own clinic, empowered by specialist guidance."
              className="rounded-lg shadow-xl border-4 border-white w-full h-auto hover-lift transition-all duration-500"
            />
          </div>
        </div>
        <div className="mt-12 scroll-animate" style={{ animationDelay: "1200ms" }}>
          <div className="inline-block bg-brand-red/10 border-2 border-dashed border-brand-red rounded-lg p-4 hover-glow transition-all duration-300">
            <p className="text-lg font-bold text-brand-red text-balance">
              The Continuity Guarantee: The same specialist is your dedicated partner for the entire case. No hand-offs.
              No loss of context. Ever.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

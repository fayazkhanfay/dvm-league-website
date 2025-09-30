"use client"

import { Clock, DollarSign, UserCheck } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function ProblemSection() {
  const sectionRef = useScrollAnimation()

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-brand-navy text-brand-offwhite">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <div className="scroll-animate">
          <h2 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl text-balance">
            {"Referring a Case Isn't Just Lost Revenue."}
            <br />
            {"It's a Loss of Control."}
          </h2>
          <p className="mt-6 text-lg text-brand-offwhite/80 leading-relaxed max-w-3xl mx-auto text-pretty">
            {
              "You're a great doctor. But the current referral process forces you to give away your patient, your client, and your professional authority."
            }
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className="scroll-animate hover-lift bg-brand-navy/50 p-6 rounded-xl border border-brand-gold/30 transition-all duration-300 group"
            style={{ animationDelay: "200ms" }}
          >
            <Clock className="text-brand-gold mx-auto w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:text-brand-offwhite" />
            <h3 className="mt-4 text-xl font-bold group-hover:text-brand-gold transition-colors duration-300">
              The 8-Week Wait
            </h3>
            <p className="mt-2 text-sm text-brand-offwhite/70">
              {
                "The client's anxiety grows, the patient's condition can worsen, and your reputation is on the line for a delay you can't control."
              }
            </p>
          </div>
          <div
            className="scroll-animate hover-lift bg-brand-navy/50 p-6 rounded-xl border border-brand-gold/30 transition-all duration-300 group"
            style={{ animationDelay: "400ms" }}
          >
            <DollarSign className="text-brand-gold mx-auto w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:text-brand-offwhite" />
            <h3 className="mt-4 text-xl font-bold group-hover:text-brand-gold transition-colors duration-300">
              The Black Hole of Revenue
            </h3>
            <p className="mt-2 text-sm text-brand-offwhite/70">
              You lose thousands in high-value diagnostics, treatments, and long-term medication refills to the
              specialty center.
            </p>
          </div>
          <div
            className="scroll-animate hover-lift bg-brand-navy/50 p-6 rounded-xl border border-brand-gold/30 transition-all duration-300 group"
            style={{ animationDelay: "600ms" }}
          >
            <UserCheck className="text-brand-gold mx-auto w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:text-brand-offwhite" />
            <h3 className="mt-4 text-xl font-bold group-hover:text-brand-gold transition-colors duration-300">
              The Loss of Continuity
            </h3>
            <p className="mt-2 text-sm text-brand-offwhite/70">
              The specialty hospital becomes the hero, and your practice risks becoming a simple satellite for vaccines and routine care in the client's mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

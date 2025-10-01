"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-32 sm:pt-48 pb-16 sm:pb-24 flex items-center overflow-hidden bg-brand-offwhite min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[1200px] h-[1200px] rounded-full animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, var(--brand-gold) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="animate-fade-in-rise">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-brand-navy leading-tight text-balance">
            Stop Referring Your Profit. <br />
            Keep Cases In-House.
          </h1>
        </div>
        <div className="animate-fade-in-rise animate-delay-200">
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl leading-relaxed text-brand-navy/90 max-w-3xl mx-auto text-pretty px-2">
            DVM League is a text-based platform that gives you a dedicated, board-certified specialist to guide you through your most complex cases, empowering you to keep them 100% in-house.
          </p>
        </div>
        <div className="animate-fade-in-rise animate-delay-500">
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4 sm:gap-6 px-4">
            <Link href="/request-invitation" className="w-full sm:w-auto">
              <Button className="group w-full rounded-md bg-brand-gold px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold text-brand-navy shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden border-2 border-brand-gold/20">
                <span className="relative z-10">Request an Invitation</span>
              </Button>
            </Link>
            <div className="p-3 sm:p-4 bg-brand-gold/10 border-2 border-dashed border-brand-gold rounded-lg max-w-md">
              <p className="text-base sm:text-lg font-bold text-brand-navy text-balance">
                {"Founder's Circle Offer: Your first Complete Case Consult—a $395 value—is on us."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

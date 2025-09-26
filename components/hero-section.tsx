"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InvitationModal } from "@/components/invitation-modal"

export function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false)

  const handleRequestInvitation = () => {
    setModalOpen(true)
  }

  return (
    <>
      <section className="relative pt-32 sm:pt-48 pb-16 sm:pb-24 flex items-center overflow-hidden bg-brand-offwhite min-h-screen">
        <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="animate-fade-in-rise">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-brand-navy leading-tight text-balance">
              The Standard for Every Case. <br />
              The Confidence of a Specialist.
            </h1>
          </div>
          <div className="animate-fade-in-rise animate-delay-200">
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl leading-relaxed text-brand-navy/90 max-w-3xl mx-auto text-pretty px-2">
              The DVM League provides a dedicated, board-certified specialist to guide you through your most complex
              cases—from the initial diagnostic plan to the final treatment strategy—for one all-inclusive price.
            </p>
          </div>
          <div className="animate-fade-in-rise animate-delay-500">
            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4 sm:gap-6 px-4">
              <Button
                onClick={handleRequestInvitation}
                className="group w-full sm:w-auto rounded-md bg-brand-gold px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold text-brand-navy shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden border-2 border-brand-gold/20"
              >
                <span className="relative z-10">Request an Invitation</span>
              </Button>
              <div className="p-3 sm:p-4 bg-brand-gold/10 border-2 border-dashed border-brand-gold rounded-lg max-w-md">
                <p className="text-base sm:text-lg font-bold text-brand-navy text-balance">
                  {"Founder's Circle Offer: Your first Complete Case Consult—a $395 value—is on us."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InvitationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

"use client"

import { Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function SpecialistValuePropsSection() {
  const [payoutCount, setPayoutCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const payoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          const duration = 2000
          const targetValue = 276.5
          const startTime = Date.now()

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentValue = targetValue * easeOutQuart

            setPayoutCount(currentValue)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          animate()
        }
      },
      { threshold: 0.5 },
    )

    if (payoutRef.current) {
      observer.observe(payoutRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <section className="py-24 sm:py-32 bg-white border-y border-brand-stone">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-24">
        {/* Value Prop 1: Compensation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center animate-fade-in-rise">
          <div>
            <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-navy text-balance">
              Unmatched Compensation.
            </h2>
            <p className="mt-6 text-lg text-brand-navy/90 leading-relaxed text-pretty">
              Our model is designed to be the most profitable work you do. With a transparent 70% revenue split and zero
              overhead, you are paid what you're worth for every single case.
            </p>
            <ul className="mt-8 space-y-3 text-left">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand-navy flex-shrink-0 mt-1" />
                <span>
                  Industry-leading <strong>70/30 revenue split.</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand-navy flex-shrink-0 mt-1" />
                <span>No platform fees, no hidden costs. Ever.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand-navy flex-shrink-0 mt-1" />
                <span>Simple, bi-weekly direct deposits and an automated 1099.</span>
              </li>
            </ul>
          </div>
          <div className="bg-brand-offwhite p-8 rounded-xl shadow-xl border-2 border-brand-navy/10" ref={payoutRef}>
            <p className="text-sm font-semibold text-brand-navy/70 text-center">
              Example Payout: Complete Case Consult
            </p>
            <div className="mt-4 space-y-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-brand-navy/70">Price Paid by GP</p>
                <p className="text-4xl font-bold text-brand-navy">$395.00</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center items-end">
                <div>
                  <p className="text-sm font-semibold text-brand-navy/70">Platform Fee (30%)</p>
                  <p className="text-2xl font-bold text-brand-navy/80">($118.50)</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-gold">Your Payout (70%)</p>
                  <p className="font-serif text-5xl font-bold text-brand-gold">${payoutCount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-page CTA */}
        <div className="text-center pt-12 animate-fade-in-rise">
          <a
            href="#apply"
            className="inline-block rounded-md bg-brand-gold px-12 py-4 text-lg font-bold text-brand-navy shadow-xl hover:bg-brand-navy hover:text-white transition-all transform hover:scale-105"
          >
            Learn More & See The Offer
          </a>
        </div>

        {/* Value Prop 2: Flexibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center animate-fade-in-rise">
          <div className="md:order-2">
            <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-navy text-balance">
              Radical Flexibility.
            </h2>
            <p className="mt-6 text-lg text-brand-navy/90 leading-relaxed text-pretty">
              This is a truly asynchronous platform built for a specialist's lifestyle. Our "Founder-Led Concierge"
              model for our launch means no frantic race to claim cases. Work when and where you want.
            </p>
            <div className="mt-8 space-y-8 max-w-md">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-brand-navy text-white font-bold text-2xl font-serif rounded-full">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold">Receive a Personal Invitation</h3>
                  <p className="mt-1 text-brand-navy/80">
                    Our founder will contact you directly with a new case that aligns with your specialty and expertise.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-brand-navy text-white font-bold text-2xl font-serif rounded-full">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold">Review & Accept on Your Time</h3>
                  <p className="mt-1 text-brand-navy/80">
                    If it's a good fit, you accept and the case is formally assigned to you in our platform.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-brand-navy text-white font-bold text-2xl font-serif rounded-full">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold">Deliver Your Report with Ease</h3>
                  <p className="mt-1 text-brand-navy/80">
                    Use our simple, templated interface to deliver your two-phase report.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:order-1">
            <img
              src="/vet-on-couch.png"
              alt="A veterinary specialist enjoying a flexible work-life balance, working comfortably from her quiet home office with her pet nearby."
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

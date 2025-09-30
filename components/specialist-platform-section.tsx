"use client"

import { MapPin, DollarSign, CheckCircle } from "lucide-react"

export function SpecialistPlatformSection() {
  return (
    <section className="py-24 sm:py-32 bg-brand-navy text-brand-offwhite">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <h2 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl animate-fade-in-rise text-balance">
          This is What "On Your Terms" Actually Means.
        </h2>
        <p className="mt-6 text-lg text-brand-offwhite/80 leading-relaxed max-w-3xl mx-auto animate-fade-in-rise animate-delay-200 text-pretty">
          DVM League was founded by a tech expert with a single mission: to listen to the best specialists in the
          country and build the exact platform they designed. This is our promise to you.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-brand-navy/50 p-6 rounded-xl border border-brand-gold/30 animate-fade-in-rise animate-delay-400">
            <MapPin className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="mt-4 text-xl font-bold">Absolute Autonomy</h3>
            <p className="mt-2 text-sm text-brand-offwhite/70">
              Zero on-call. Zero emergencies. Our platform is 100% asynchronous to provide you with maximum flexibility.
            </p>
          </div>
          <div className="bg-brand-navy/50 p-6 rounded-xl border border-brand-gold/30 animate-fade-in-rise animate-delay-400">
            <DollarSign className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="mt-4 text-xl font-bold">High-Value Work</h3>
            <p className="mt-2 text-sm text-brand-offwhite/70">
              Every case is a comprehensive "Complete Case Consult" with a substantial payout of over $275. No
              "screener" cases.
            </p>
          </div>
          <div className="bg-brand-navy/50 p-6 rounded-xl border border-brand-gold/30 animate-fade-in-rise animate-delay-400">
            <CheckCircle className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="mt-4 text-xl font-bold">Zero Friction</h3>
            <p className="mt-2 text-sm text-brand-offwhite/70">
              We handle all GP communication, billing, and payment processing. You do the medicine; we do the rest.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

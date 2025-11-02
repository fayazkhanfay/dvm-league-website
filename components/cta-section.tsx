"use client"

import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function CTASection() {
  return (
    <section id="cta" className="py-24 sm:py-32 bg-brand-navy text-white">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-offwhite sm:text-6xl text-balance">
          Your First Consult is Our Investment in Your Practice.
        </h2>

        {/* Founder Message & Headshot */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center text-left">
          <div className="sm:col-span-1 flex justify-center">
            <a
              href="https://www.linkedin.com/in/fayazkhanfay/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-300 hover:scale-105"
            >
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-brand-gold/50 shadow-lg">
                <Image
                  src="/fayaz-khan-profile.png"
                  alt="Fayaz Khan, Founder of DVM League"
                  fill
                  sizes="(min-width: 640px) 9rem, 8rem"
                  className="object-cover"
                  priority
                />
              </div>
            </a>
          </div>
          <div className="sm:col-span-3 text-center sm:text-left">
            <p className="text-lg text-brand-offwhite/80 leading-relaxed text-pretty">
              {
                "\"We don't need to tell you our value; we will prove it. I'm Fayaz Khan, the founder, and I am so confident that this service will be a profit engine for your practice that I will personally pay the specialist's fee for your first Complete Case Consult.\""
              }
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-gold/20 pt-10">
          <h3 className="font-serif text-2xl text-brand-offwhite/90">An Exclusive Offer for our Founding Members.</h3>
          <p className="mt-4 text-sm font-semibold text-brand-offwhite/80">The DVM League Complete Case Consult</p>
          <h3 className="mt-2 text-4xl font-serif text-brand-offwhite/70">
            <s>$395</s>
          </h3>
          <h2 className="mt-1 text-8xl font-serif font-bold text-brand-gold">FREE</h2>
          <p className="mt-2 text-lg font-semibold text-brand-offwhite/80">(Your Founder's Circle Offer)</p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link href="/request-invitation" className="w-full sm:w-auto">
            <Button className="group w-full rounded-md bg-brand-gold px-12 py-5 text-xl font-bold text-brand-navy shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden border-2 border-brand-gold/20">
              <span className="relative z-10">Request Your Invitation</span>
            </Button>
          </Link>
          <p className="text-sm font-semibold text-brand-offwhite/80 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Your first consult is on us. No risk. No credit card required. Only upside.
          </p>
        </div>
      </div>
    </section>
  )
}

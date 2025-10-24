"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-navy/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex-shrink-0 group">
              <div className="transition-transform duration-200 group-hover:scale-[1.02]">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy tracking-tight">
                  DVM League
                </span>
                <p className="text-[10px] sm:text-xs font-semibold text-brand-navy/60 tracking-[0.08em] uppercase -mt-0.5 hidden sm:block">
                  American Specialists. American Standards.
                </p>
              </div>
            </a>

            <nav className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex text-brand-navy hover:text-brand-navy hover:bg-brand-navy/5 font-semibold transition-all duration-200"
              >
                <a href="https://app.dvmleague.com/login">Login</a>
              </Button>

              <Link
                href="/specialists"
                className="hidden md:inline-flex text-sm font-semibold text-brand-navy/80 hover:text-brand-red transition-colors duration-200 px-3 py-2 rounded-md hover:bg-brand-navy/5"
              >
                For Specialists
              </Link>

              <Button
                asChild
                className="hidden md:inline-flex bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 border border-brand-gold hover:border-brand-navy"
                size="default"
              >
                <Link href="/request-invitation">Request an Invitation</Link>
              </Button>

              <Button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-brand-navy text-white hover:bg-brand-navy/90 transition-all duration-200 shadow-sm"
                size="sm"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </nav>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-navy/10 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-6 space-y-3 max-w-7xl mx-auto">
              <p className="text-xs font-semibold text-brand-navy/60 tracking-[0.08em] uppercase text-center pb-2">
                American Specialists. American Standards.
              </p>

              <Button
                asChild
                variant="outline"
                size="default"
                className="w-full border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white font-semibold transition-all duration-200 bg-transparent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <a href="https://app.dvmleague.com/login">Login</a>
              </Button>

              <Link
                href="/specialists"
                className="block text-center text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors py-3 px-4 rounded-md hover:bg-brand-navy/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Specialists
              </Link>

              <Button
                asChild
                className="w-full bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-white font-semibold shadow-sm transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/request-invitation">Request an Invitation</Link>
              </Button>
            </div>
          </div>
        )}
      </header>
      <div className="h-20" />
    </>
  )
}

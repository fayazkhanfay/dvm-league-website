"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export function SpecialistHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-navy/10">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="group">
            <div>
              <span className="text-2xl font-serif font-bold text-brand-navy group-hover:text-brand-red transition-colors">
                DVM League
              </span>
              <p className="text-xs font-semibold text-brand-navy/70 tracking-wider -mt-0.5">
                American Specialists. American Standards.
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-sm bg-transparent"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Link
              href="/"
              className="text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors tracking-wide"
            >
              For General Practices →
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-navy hover:text-brand-red transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-brand-navy/10 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
            <Link
              href="/"
              className="text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              For General Practices →
            </Link>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 w-full justify-center bg-transparent"
            >
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InvitationModal } from "@/components/invitation-modal"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [modalOpen, setModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleRequestInvitation = () => {
    setModalOpen(true)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 p-4 sm:p-6 transition-all duration-300 ease-in-out",
          isScrolled ? "bg-brand-offwhite/80 backdrop-blur-sm shadow-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <Link href="/" className="flex-shrink-0">
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">DVM League</span>
              <p className="text-xs sm:text-sm font-semibold text-brand-navy/70 tracking-wide -mt-1 hidden sm:block">
                American Specialists. American Standards.
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="rounded-md border-brand-navy/30 bg-transparent px-6 py-3 text-sm font-bold text-brand-navy shadow-sm hover:bg-brand-navy/5 hover:text-brand-red hover:border-brand-red/50 transition-all duration-300"
              >
                <Link href="/specialists">Specialists: Apply to The League →</Link>
              </Button>
              <Button
                onClick={handleRequestInvitation}
                className="rounded-md bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy shadow-md hover:bg-brand-navy hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Request an Invitation
              </Button>
            </nav>

            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300"
              size="sm"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-brand-offwhite border-t border-brand-stone shadow-lg">
            <div className="p-6 text-center space-y-4">
              <p className="text-sm font-semibold text-brand-navy/70 tracking-wide sm:hidden">
                American Specialists. American Standards.
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-md border-brand-navy/30 bg-transparent px-6 py-3 text-sm font-bold text-brand-navy shadow-sm hover:bg-brand-navy/5 hover:text-brand-red transition-all duration-300"
              >
                <Link href="/specialists" onClick={() => setMobileMenuOpen(false)}>
                  Specialists: Apply to The League →
                </Link>
              </Button>
              <Button
                onClick={handleRequestInvitation}
                className="w-full rounded-md bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy shadow-md hover:bg-brand-navy hover:text-white transition-all duration-300"
              >
                Request an Invitation
              </Button>
            </div>
          </div>
        )}
      </header>

      <InvitationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}


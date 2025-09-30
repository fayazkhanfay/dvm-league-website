"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InvitationModal } from "@/components/invitation-modal"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [modalOpen, setModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleRequestInvitation = () => {
    setModalOpen(true)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <a href="/" className="flex-shrink-0">
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">DVM League</span>
              <p className="text-xs sm:text-sm font-semibold text-brand-navy/70 tracking-wide -mt-1 hidden sm:block">
                American Specialists. American Standards.
              </p>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <Link
              href="/specialists"
              className="hidden md:inline-flex text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors"
            >
              Are you a Specialist?
            </Link>

            <Button
              onClick={handleRequestInvitation}
              className="hidden md:inline-flex rounded-md bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy shadow-md hover:bg-brand-navy hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Request an Invitation
            </Button>

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
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-brand-navy/70 tracking-wide mb-4">
                American Specialists. American Standards.
              </p>
              <Link
                href="/specialists"
                className="block mb-4 text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Are you a Specialist?
              </Link>
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

"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Shield, CheckCircle } from "lucide-react"

interface InvitationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvitationModal({ open, onOpenChange }: InvitationModalProps) {
  const [showThankYou, setShowThankYou] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    clinic: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: This will be connected to Supabase in the next task
    console.log("Form submitted:", formData)

    // Show thank you state
    setShowThankYou(true)

    // Auto-close modal after 4 seconds
    setTimeout(() => {
      onOpenChange(false)
      // Reset form for next time
      setTimeout(() => {
        setShowThankYou(false)
        setFormData({ name: "", clinic: "", email: "" })
      }, 300)
    }, 4000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form state when closing
    setTimeout(() => {
      setShowThankYou(false)
      setFormData({ name: "", clinic: "", email: "" })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-0 gap-0 bg-white rounded-xl shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-navy hover:bg-brand-red hover:text-white transition-all z-50"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {!showThankYou ? (
          // Form View
          <div className="p-4 sm:p-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy text-center">
              {"Join the Founder's Circle"}
            </h2>
            <p className="mt-2 text-center text-brand-navy/80 text-pretty text-sm sm:text-base">
              Request your invitation below. Founding members get priority access and their first Complete Case Consult,
              a $395 value, is on us.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-bold text-brand-navy">
                  Your Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1 border-brand-stone focus:border-brand-navy focus:ring-brand-navy focus:ring-opacity-50 text-base"
                />
              </div>
              <div>
                <Label htmlFor="clinic" className="text-sm font-bold text-brand-navy">
                  Clinic Name
                </Label>
                <Input
                  type="text"
                  id="clinic"
                  name="clinic"
                  required
                  value={formData.clinic}
                  onChange={(e) => handleInputChange("clinic", e.target.value)}
                  className="mt-1 border-brand-stone focus:border-brand-navy focus:ring-brand-navy focus:ring-opacity-50 text-base"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-bold text-brand-navy">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1 border-brand-stone focus:border-brand-navy focus:ring-brand-navy focus:ring-opacity-50 text-base"
                />
              </div>
              <div className="pt-2 sm:pt-4">
                <Button
                  type="submit"
                  className="w-full rounded-md bg-brand-navy px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-md hover:bg-brand-red transition-all duration-300 transform hover:scale-105"
                >
                  Request My Invitation
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Thank You View
          <div className="p-4 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto">
              <Shield className="text-brand-gold w-7 h-7 sm:w-9 sm:h-9" />
              <CheckCircle className="text-brand-gold w-4 h-4 sm:w-6 sm:h-6 absolute translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2" />
            </div>
            <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-brand-navy">Welcome to the League.</h2>
            <p className="mt-2 text-brand-navy/80 text-pretty text-sm sm:text-base">
              Thank you. Your invitation request has been received. We are finalizing our elite specialist roster and
              will personally reach out to {"Founder's Circle"} members in the coming weeks.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

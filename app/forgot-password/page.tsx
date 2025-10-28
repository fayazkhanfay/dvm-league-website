"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setIsLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-offwhite px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-lg border-2 border-brand-stone border-t-4 border-t-brand-gold bg-white p-8 shadow-xl">
            {/* Logo and Brand */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <ShieldCheck className="h-8 w-8 text-brand-navy" />
              <h1 className="font-serif text-3xl font-bold text-brand-navy">DVM League</h1>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h2 className="mb-4 font-serif text-2xl font-bold text-brand-navy">Check your email</h2>
              <p className="mb-6 text-brand-navy/70">
                We've sent password reset instructions to <strong>{email}</strong>. Please check your email and follow
                the link to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-gold"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border-2 border-brand-stone border-t-4 border-t-brand-gold bg-white p-8 shadow-xl">
          {/* Logo and Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <ShieldCheck className="h-8 w-8 text-brand-navy" />
            <h1 className="font-serif text-3xl font-bold text-brand-navy">DVM League</h1>
          </div>

          {/* Headline */}
          <h2 className="mb-2 text-center font-serif text-2xl font-bold text-brand-navy">Forgot your password?</h2>
          <p className="mb-8 text-center text-sm text-brand-navy/70">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-brand-navy">
                Email address
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                placeholder="your@email.com"
              />
            </div>

            {/* Error Message */}
            {error && <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red">{error}</div>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()

      // Check if we have a valid session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError("Auth session missing!")
        setHasValidSession(false)
        return
      }

      setHasValidSession(true)
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!hasValidSession) {
      setError("Auth session missing! Please request a new password reset link.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      // Redirect to login after successful reset
      router.push("/login")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
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
          <h2 className="mb-2 text-center font-serif text-2xl font-bold text-brand-navy">Reset your password</h2>
          <p className="mb-8 text-center text-sm text-brand-navy/70">Enter your new password below.</p>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-brand-navy">
                New Password
              </Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !hasValidSession}
                  className="border-2 border-brand-stone px-4 py-3 pr-12 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || !hasValidSession}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-stone hover:text-brand-navy transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirm-password" className="text-sm font-medium text-brand-navy">
                Confirm New Password
              </Label>
              <div className="relative mt-2">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !hasValidSession}
                  className="border-2 border-brand-stone px-4 py-3 pr-12 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || !hasValidSession}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-stone hover:text-brand-navy transition-colors disabled:opacity-50"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red">{error}</div>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !hasValidSession}
              className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

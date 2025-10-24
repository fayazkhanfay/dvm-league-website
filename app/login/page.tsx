"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Demo login logic based on email
    if (email === "specialist@dvmleague.com") {
      router.push("/specialist-dashboard")
    } else if (email === "gp@dvmleague.com") {
      router.push("/gp-dashboard")
    } else if (email === "admin@dvmleague.com") {
      router.push("/")
    } else {
      setError("Invalid demo credentials. Please use specialist@dvmleague.com or gp@dvmleague.com.")
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
          <h2 className="mb-8 text-center font-serif text-2xl font-bold text-brand-navy">Sign in to your account</h2>

          {/* Login Form */}
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
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-brand-navy">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>

            {/* Remember Me and Forgot Password Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-medium text-brand-navy">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm font-semibold text-brand-red hover:text-brand-red/80">
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red">{error}</div>}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://dvmleague.com"
            className="text-sm text-brand-navy/70 transition-colors hover:text-brand-navy hover:underline"
          >
            ← Back to dvmleague.com
          </a>
        </div>
      </div>
    </div>
  )
}

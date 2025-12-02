"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      setCheckingSession(true)

      const sessionTimeout = setTimeout(() => {
        console.log("[v0] Login: Session check timeout, showing login form")
        setCheckingSession(false)
      }, 3000) // 3 second timeout

      try {
        const supabase = createClient()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 2500),
        )

        const userPromise = supabase.auth.getUser()

        const {
          data: { user },
        } = (await Promise.race([userPromise, timeoutPromise]).catch((err) => {
          console.error("[v0] Login: Session check failed:", err)
          return { data: { user: null } }
        })) as any

        if (!user) {
          clearTimeout(sessionTimeout)
          setCheckingSession(false)
          return
        }

        // User found, fetch their profile to get role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (!profile) {
          clearTimeout(sessionTimeout)
          setCheckingSession(false)
          return
        }

        // Redirect based on role
        clearTimeout(sessionTimeout)
        if (profile.role === "specialist") {
          router.push("/specialist-dashboard")
        } else if (profile.role === "gp") {
          router.push("/gp-dashboard")
        } else {
          router.push("/")
        }
      } catch (err) {
        console.error("[v0] Login page: Session check error:", err)
        clearTimeout(sessionTimeout)
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  useEffect(() => {
    const savedEmail = localStorage.getItem("dvmleague_remember_email")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem("dvmleague_remember_email", email)
      } else {
        localStorage.removeItem("dvmleague_remember_email")
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        setError("Failed to load user profile")
        setIsLoading(false)
        return
      }

      if (profile.role === "specialist") {
        router.push("/specialist-dashboard")
      } else if (profile.role === "gp") {
        router.push("/gp-dashboard")
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-brand-offwhite px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
          <p className="text-brand-navy font-medium">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg border-2 border-brand-stone border-t-4 border-t-brand-gold bg-white p-8 shadow-xl">
          <div className="mb-8 flex items-center justify-center gap-3">
            <ShieldCheck className="h-8 w-8 text-brand-navy" />
            <h1 className="font-serif text-3xl font-bold text-brand-navy">DVM League</h1>
          </div>

          <h2 className="mb-8 text-center font-serif text-2xl font-bold text-brand-navy">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-brand-navy">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-2 border-brand-stone px-4 py-3 pr-12 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-stone hover:text-brand-navy transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-medium text-brand-navy">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm font-semibold text-brand-red hover:text-brand-red/80">
                Forgot password?
              </Link>
            </div>

            {error && <div className="rounded-md bg-brand-red/10 p-3 text-sm text-brand-red">{error}</div>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-brand-navy/70 transition-colors hover:text-brand-navy hover:underline">
            ← Back to dvmleague.com
          </Link>
        </div>
      </div>
    </div>
  )
}

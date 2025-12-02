"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  role: "gp" | "specialist"
  full_name: string
}

export function SpecialistHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("[v0] Specialist header initial auth check, user:", user ? "authenticated" : "not authenticated")

        if (user) {
          setIsAuthenticated(true)
          const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

          if (profile) {
            setUserProfile(profile as UserProfile)
            console.log("[v0] Specialist header profile loaded, role:", profile.role)
          }
        } else {
          setIsAuthenticated(false)
          setUserProfile(null)
        }
      } catch (error) {
        console.error("[v0] Specialist header auth check error:", error)
        setIsAuthenticated(false)
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Specialist header auth state changed:", event, session ? "has session" : "no session")

      if (session?.user) {
        setIsAuthenticated(true)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single()
        if (profile) {
          setUserProfile(profile as UserProfile)
          console.log("[v0] Specialist header profile updated, role:", profile.role)
        }
      } else {
        setIsAuthenticated(false)
        setUserProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const dashboardUrl = userProfile?.role === "specialist" ? "/specialist-dashboard" : "/gp-dashboard"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setTimeout(() => {
      window.location.href = "/login"
    }, 100)
  }

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
            {!isLoading && isAuthenticated ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-sm bg-transparent"
                >
                  <Link href={dashboardUrl}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Dashboard
                  </Link>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-brand-navy hover:bg-red-50 hover:text-brand-red transition-all duration-300 shadow-sm bg-transparent"
                >
                  Logout
                </Button>
              </>
            ) : !isLoading ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-sm bg-transparent"
              >
                <Link href="/login">Login</Link>
              </Button>
            ) : null}
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
            {!isLoading && isAuthenticated ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 w-full justify-center bg-transparent"
                >
                  <Link href={dashboardUrl} onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Dashboard
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-brand-navy hover:bg-red-50 hover:text-brand-red transition-all duration-300 w-full justify-center bg-transparent"
                >
                  Logout
                </Button>
              </>
            ) : !isLoading ? (
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
            ) : null}
          </nav>
        )}
      </div>
    </header>
  )
}

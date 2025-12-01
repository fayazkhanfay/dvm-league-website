"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
        // Fetch user profile to get role
        const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

        if (profile) {
          setUserProfile(profile as UserProfile)
        }
      } else {
        setIsAuthenticated(false)
        setUserProfile(null)
      }
      setIsLoading(false)
    }

    // Run initial check
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Specialist header auth state changed:", event)

      if (session?.user) {
        setIsAuthenticated(true)
        // Re-fetch profile to ensure role is correct
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single()
        if (profile) setUserProfile(profile as UserProfile)
      } else {
        // Handle logout or session expiration
        setIsAuthenticated(false)
        setUserProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const dashboardUrl = userProfile?.role === "specialist" ? "/specialist-dashboard" : "/gp-dashboard"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // The onAuthStateChange listener will handle the state update
    // Redirect after a brief delay to allow state to update
    setTimeout(() => {
      window.location.href = "/login"
    }, 100)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-navy/10">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="group">
            <div>
              <span className="text-2xl font-serif font-bold text-brand-navy group-hover:text-brand-red transition-colors">
                DVM League
              </span>
              <p className="text-xs font-semibold text-brand-navy/70 tracking-wider -mt-0.5">
                American Specialists. American Standards.
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-sm bg-transparent"
                    >
                      <a href={dashboardUrl}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Dashboard
                      </a>
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
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-sm bg-transparent"
                  >
                    <a href="/login">Login</a>
                  </Button>
                )}
              </>
            )}
            <a
              href="/"
              className="text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors tracking-wide"
            >
              For General Practices →
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-navy hover:text-brand-red transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-brand-navy/10 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
            <a
              href="/"
              className="text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              For General Practices →
            </a>
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 w-full justify-center bg-transparent"
                    >
                      <a href={dashboardUrl} onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Dashboard
                      </a>
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
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300 w-full justify-center bg-transparent"
                  >
                    <a href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </a>
                  </Button>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

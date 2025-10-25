import type React from "react"
import Link from "next/link"
import { ShieldCheck, PlusCircle, LayoutList, Settings } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  activePage: "submitCase" | "myCases" | "settings"
  userName?: string
  userRole: "gp" | "specialist" // Pages using this layout must pass userRole="gp" or userRole="specialist"
}

export function AppLayout({ children, activePage, userName = "Dr. Demo GP", userRole }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Simplified App Header */}
      <header className="border-b border-brand-stone bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-brand-navy" />
            <h1 className="font-serif text-2xl font-bold text-brand-navy">DVM League</h1>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-brand-navy/80">Logged in as {userName}</span>
            <a href="#" className="text-sm text-brand-navy/60 underline hover:text-brand-red">
              Logout
            </a>
          </div>
        </div>
      </header>

      {/* Minimal App Top Navigation Bar */}
      <nav className="border-b border-brand-stone bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {userRole === "gp" && (
              <Link
                href="/submit-case"
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm ${
                  activePage === "submitCase"
                    ? "border-brand-navy font-semibold text-brand-navy"
                    : "border-transparent text-brand-navy/70 hover:text-brand-navy"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Submit New Case
              </Link>
            )}
            <Link
              href="/gp-dashboard"
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm ${
                activePage === "myCases"
                  ? "border-brand-navy font-semibold text-brand-navy"
                  : "border-transparent text-brand-navy/70 hover:text-brand-navy"
              }`}
            >
              <LayoutList className="h-4 w-4" />
              My Cases
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm ${
                activePage === "settings"
                  ? "border-brand-navy font-semibold text-brand-navy"
                  : "border-transparent text-brand-navy/70 hover:text-brand-navy"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

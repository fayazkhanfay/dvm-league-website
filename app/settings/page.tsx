"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, PlusCircle, LayoutList, Settings, ExternalLink } from "lucide-react"

export default function SettingsPage() {
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
            <span className="text-sm text-brand-navy/80">Logged in as Dr. Sarah Chen</span>
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
            <a
              href="/submit-case"
              className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm text-brand-navy/70 hover:text-brand-navy"
            >
              <PlusCircle className="h-4 w-4" />
              Submit New Case
            </a>
            <a
              href="/gp-dashboard"
              className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm text-brand-navy/70 hover:text-brand-navy"
            >
              <LayoutList className="h-4 w-4" />
              My Cases
            </a>
            <a
              href="/settings"
              className="flex items-center gap-2 border-b-2 border-brand-navy px-1 py-4 text-sm font-semibold text-brand-navy"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-brand-navy">Account Settings</h1>

        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-brand-navy">User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-brand-navy/70">Name</p>
                <p className="text-base text-brand-navy">Dr. Sarah Chen</p>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-navy/70">Email</p>
                <p className="text-base text-brand-navy">gp@dvmleague.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-navy/70">Clinic Name</p>
                <p className="text-base text-brand-navy">Demo Animal Hospital</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Management Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-brand-navy">Billing Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-brand-navy/80">
                Manage your saved payment methods and view your complete invoice history securely through our payment
                partner, Stripe.
              </p>
              <Button variant="outline" asChild>
                <a href="#" className="flex items-center gap-2">
                  Manage Billing & View Invoices
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

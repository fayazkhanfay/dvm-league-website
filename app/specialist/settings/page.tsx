"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

export default function SpecialistSettingsPage() {
  return (
    <AppLayout activePage="settings" userRole="specialist" userName="Dr. Jane Smith">
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
              <p className="text-base text-brand-navy">Dr. Jane Smith</p>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-navy/70">Email</p>
              <p className="text-base text-brand-navy">specialist@dvmleague.com</p>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-navy/70">Specialty</p>
              <p className="text-base text-brand-navy">Internal Medicine</p>
            </div>
          </CardContent>
        </Card>

        {/* Payout Management Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-brand-navy">Payout Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-brand-navy/80">
              Manage your payout details and view payment history securely through our partner, Stripe Connect.
            </p>
            <Button variant="outline" asChild>
              <a href="#" className="flex items-center gap-2">
                Manage Payouts via Stripe
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

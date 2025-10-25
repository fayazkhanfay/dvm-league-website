"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

export default function SettingsPage() {
  return (
    <AppLayout activePage="settings">
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
    </AppLayout>
  )
}

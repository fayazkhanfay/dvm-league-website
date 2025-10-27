import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "gp") {
    redirect("/login")
  }

  return (
    <AppLayout activePage="settings" userRole="gp" userName={profile.full_name}>
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
              <p className="text-base text-brand-navy">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-navy/70">Email</p>
              <p className="text-base text-brand-navy">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-navy/70">Clinic Name</p>
              <p className="text-base text-brand-navy">{profile.clinic_name || "Not specified"}</p>
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

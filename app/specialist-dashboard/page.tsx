import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { LiveSpecialistCaseList } from "@/components/dashboard/live-specialist-case-list"

export default async function SpecialistDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "specialist") {
    redirect("/login")
  }

  const { data: allCases } = await supabase
    .from("cases")
    .select(
      `
      *,
      gp:gp_id(full_name, clinic_name)
    `,
    )
    .eq("specialist_id", user.id)
    .order("created_at", { ascending: false })

  const { data: availableCases } = await supabase
    .from("cases")
    .select(
      `
      *,
      gp:gp_id(full_name, clinic_name)
    `,
    )
    .eq("status", "pending_assignment")
    .is("specialist_id", null)
    .eq("specialty_requested", profile.specialty)
    .order("created_at", { ascending: false })

  return (
    <AppLayout activePage="myCases" userRole="specialist" userName={profile.full_name} isDemoUser={profile.is_demo}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold text-brand-navy mb-8">Specialist Dashboard</h1>

        <LiveSpecialistCaseList
          userId={user.id}
          specialty={profile.specialty}
          initialAssignedCases={allCases || []}
          initialAvailableCases={availableCases || []}
        />
      </div>
    </AppLayout>
  )
}

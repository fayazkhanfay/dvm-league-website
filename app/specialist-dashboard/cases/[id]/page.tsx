import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SmartCaseView from "@/components/smart-case-view"

export default async function SmartCaseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: caseData, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      gp:gp_id(full_name, clinic_name, email),
      case_files(*)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !caseData) {
    redirect("/specialist-dashboard")
  }

  if (caseData.specialty_requested !== profile.specialty) {
    redirect("/specialist-dashboard")
  }

  let caseState: "unassigned" | "accepted" | "taken"

  if (!caseData.specialist_id) {
    // State A: Unassigned (Opportunity)
    caseState = "unassigned"
  } else if (caseData.specialist_id === user.id) {
    // State B: Accepted (Work Mode)
    caseState = "accepted"
  } else {
    // State C: Taken (Locked)
    caseState = "taken"
  }

  return <SmartCaseView caseData={caseData} userProfile={profile} caseState={caseState} />
}

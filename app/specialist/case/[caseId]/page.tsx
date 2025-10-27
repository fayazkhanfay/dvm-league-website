import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SpecialistCaseView from "@/components/specialist-case-view"

export default async function SpecialistCaseViewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
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
    .eq("id", caseId)
    .eq("specialist_id", user.id)
    .single()

  if (error || !caseData) {
    redirect("/specialist-dashboard")
  }

  return <SpecialistCaseView caseData={caseData} userProfile={profile} />
}

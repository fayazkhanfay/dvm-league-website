import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CaseSubmissionForm from "@/components/case-submission-form"

export default async function SubmitCasePage() {
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

  return <CaseSubmissionForm userProfile={profile} />
}

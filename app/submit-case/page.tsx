import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CaseSubmissionForm from "@/components/case-submission-form"

export default async function SubmitCasePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
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

  const params = await searchParams
  let initialData = null

  if (params.id) {
    const { data: existingCase } = await supabase
      .from("cases")
      .select(
        `
        *,
        case_files (
          id,
          file_name,
          file_type,
          storage_object_path,
          uploaded_at
        )
      `,
      )
      .eq("id", params.id)
      .eq("gp_id", user.id)
      .single()

    if (existingCase) {
      initialData = existingCase
    }
  }

  return <CaseSubmissionForm userProfile={profile} initialData={initialData} isDemoUser={profile.is_demo} />
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LiveGPCaseList } from "@/components/dashboard/live-gp-case-list"

export default async function GPDashboardPage() {
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

  const { data: allCases } = await supabase
    .from("cases")
    .select(
      `
      *,
      specialist:specialist_id(full_name, specialty)
    `,
    )
    .eq("gp_id", user.id)
    .order("created_at", { ascending: false })

  async function deleteDraft(caseId: string) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data: caseFiles } = await supabase.from("case_files").select("storage_object_path").eq("case_id", caseId)

    if (caseFiles && caseFiles.length > 0) {
      const filePaths = caseFiles.map((file) => file.storage_object_path)
      await supabase.storage.from("case-files").remove(filePaths)
    }

    const { error } = await supabase.from("cases").delete().eq("id", caseId).eq("gp_id", user.id)

    if (error) {
      throw error
    }
  }

  return (
    <AppLayout activePage="myCases" userRole="gp" userName={profile.full_name} isDemoUser={profile.is_demo}>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-brand-navy">Case Dashboard</h1>
          <Button
            asChild
            className="transform rounded-md bg-brand-gold px-6 py-3 font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
          >
            <Link href="/submit-case">Submit a New Case</Link>
          </Button>
        </div>

        <LiveGPCaseList userId={user.id} initialCases={allCases || []} onDeleteDraft={deleteDraft} />
      </main>
    </AppLayout>
  )
}

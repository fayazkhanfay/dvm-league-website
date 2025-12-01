import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Trash2 } from "lucide-react"

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

  const draftCases = allCases?.filter((c) => c.status === "draft") || []
  const activeCases =
    allCases?.filter(
      (c) =>
        c.status === "pending_assignment" ||
        c.status === "awaiting_phase1" ||
        c.status === "awaiting_diagnostics" ||
        c.status === "awaiting_phase2",
    ) || []
  const completedCases = allCases?.filter((c) => c.status === "completed") || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Draft
          </Badge>
        )
      case "pending_assignment":
        return (
          <Badge variant="secondary" className="bg-brand-stone text-brand-navy">
            Pending Assignment
          </Badge>
        )
      case "awaiting_phase1":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Phase 1 Plan Ready
          </Badge>
        )
      case "awaiting_diagnostics":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Awaiting Diagnostics
          </Badge>
        )
      case "awaiting_phase2":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Phase 2 Plan Ready
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="bg-brand-navy text-white hover:bg-brand-navy">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getActionButton = (caseItem: any) => {
    if (caseItem.status === "draft") {
      return (
        <Button
          variant="default"
          size="sm"
          className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-white"
          asChild
        >
          <Link href={`/submit-case?id=${caseItem.id}`}>Resume Case</Link>
        </Button>
      )
    }

    switch (caseItem.status) {
      case "pending_assignment":
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gp/case/${caseItem.id}`}>View Case</Link>
          </Button>
        )
      case "awaiting_phase1":
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gp/case/${caseItem.id}`}>View Phase 1 Plan</Link>
          </Button>
        )
      case "awaiting_diagnostics":
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gp/case/${caseItem.id}`}>Upload Diagnostics</Link>
          </Button>
        )
      case "awaiting_phase2":
      case "completed":
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gp/case/${caseItem.id}`}>View Final Report</Link>
          </Button>
        )
      default:
        return null
    }
  }

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: "Draft",
      pending_assignment: "Pending Assignment",
      awaiting_phase1: "Phase 1 Plan Ready",
      awaiting_diagnostics: "Awaiting Diagnostics",
      awaiting_phase2: "Phase 2 Plan Ready",
      completed: "Completed",
    }
    return statusMap[status] || status
  }

  async function deleteDraft(formData: FormData) {
    "use server"
    const caseId = formData.get("caseId") as string

    console.log("[v0] Deleting draft case:", caseId)

    const supabase = await createClient()

    // Delete the case
    const { error } = await supabase.from("cases").delete().eq("id", caseId)

    if (error) {
      console.error("[v0] Error deleting draft:", error)
    } else {
      console.log("[v0] Draft deleted successfully")
    }

    // Revalidate the dashboard page to show updated data
    revalidatePath("/gp-dashboard")
  }

  return (
    <AppLayout activePage="myCases" userRole="gp" userName={profile.full_name}>
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

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="drafts" className="relative">
              Drafts
              {draftCases.length > 0 && (
                <Badge className="ml-2 bg-brand-gold text-brand-navy hover:bg-brand-gold">{draftCases.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active Cases</TabsTrigger>
            <TabsTrigger value="completed">Completed Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts">
            <div className="overflow-x-auto rounded-lg bg-white shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-brand-navy">Patient Name</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Case ID</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Specialty</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Last Updated</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Status</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.patient_name || "Untitled"}</TableCell>
                      <TableCell>{caseItem.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{caseItem.specialty_requested || "Not specified"}</TableCell>
                      <TableCell>{new Date(caseItem.updated_at || caseItem.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-white"
                            asChild
                          >
                            <Link href={`/submit-case?id=${caseItem.id}`}>Resume Case</Link>
                          </Button>
                          <form action={deleteDraft}>
                            <input type="hidden" name="caseId" value={caseItem.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Delete draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {draftCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-brand-navy/60">
                        No draft cases
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="overflow-x-auto rounded-lg bg-white shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-brand-navy">Patient Name</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Case ID</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Specialty</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Submitted Date</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Status</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.patient_name}</TableCell>
                      <TableCell>{caseItem.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{caseItem.specialty_requested}</TableCell>
                      <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{getActionButton(caseItem)}</TableCell>
                    </TableRow>
                  ))}
                  {activeCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-brand-navy/60">
                        No active cases
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="overflow-x-auto rounded-lg bg-white shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-brand-navy">Patient Name</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Case ID</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Specialty</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Submitted Date</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Status</TableHead>
                    <TableHead className="font-semibold text-brand-navy">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.patient_name}</TableCell>
                      <TableCell>{caseItem.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{caseItem.specialty_requested}</TableCell>
                      <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{getActionButton(caseItem)}</TableCell>
                    </TableRow>
                  ))}
                  {completedCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-brand-navy/60">
                        No completed cases
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  )
}

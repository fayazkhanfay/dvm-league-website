import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

  const activeCases = allCases?.filter((c) => c.status !== "completed") || []
  const completedCases = allCases?.filter((c) => c.status === "completed") || []

  const getStatusBadge = (status: string) => {
    switch (status) {
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
    switch (caseItem.status) {
      case "pending_assignment":
        return <span className="text-sm text-brand-navy/60">Awaiting Assignment</span>
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
      pending_assignment: "Pending Assignment",
      awaiting_phase1: "Phase 1 Plan Ready",
      awaiting_diagnostics: "Awaiting Diagnostics",
      awaiting_phase2: "Phase 2 Plan Ready",
      completed: "Completed",
    }
    return statusMap[status] || status
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
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active Cases</TabsTrigger>
            <TabsTrigger value="completed">Completed Cases</TabsTrigger>
          </TabsList>

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

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

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

  const activeCases = allCases?.filter((c) => c.status !== "completed") || []
  const completedCases = allCases?.filter((c) => c.status === "completed") || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_phase1":
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            Awaiting Phase 1 Report
          </Badge>
        )
      case "awaiting_diagnostics":
        return <Badge variant="secondary">Awaiting Diagnostics Upload</Badge>
      case "awaiting_phase2":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            Awaiting Phase 2 Report
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getActionButton = (caseItem: any) => {
    switch (caseItem.status) {
      case "awaiting_phase1":
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/specialist/case/${caseItem.id}`}>Submit Phase 1 Plan</Link>
          </Button>
        )
      case "awaiting_diagnostics":
        return <span className="text-sm text-brand-navy/60">Awaiting GP Diagnostics</span>
      case "awaiting_phase2":
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/specialist/case/${caseItem.id}`}>Submit Final Report</Link>
          </Button>
        )
      default:
        return null
    }
  }

  const formatSignalment = (signalment: any) => {
    return `${signalment.species}, ${signalment.breed}, ${signalment.age} ${signalment.sex_status}`
  }

  return (
    <AppLayout activePage="myCases" userName={profile.full_name}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold text-brand-navy mb-8">Specialist Dashboard</h1>

        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active Cases</TabsTrigger>
            <TabsTrigger value="completed">Completed Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Case ID</TableHead>
                        <TableHead className="font-semibold">GP Clinic Name</TableHead>
                        <TableHead className="font-semibold">Patient Signalment</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Report Due</TableHead>
                        <TableHead className="font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">{caseItem.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell>{caseItem.gp?.clinic_name || "N/A"}</TableCell>
                          <TableCell>{formatSignalment(caseItem.patient_signalment)}</TableCell>
                          <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                          <TableCell>{caseItem.report_due_description || "1-2 Business Days"}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Case ID</TableHead>
                        <TableHead className="font-semibold">GP Clinic Name</TableHead>
                        <TableHead className="font-semibold">Patient Signalment</TableHead>
                        <TableHead className="font-semibold">Specialty</TableHead>
                        <TableHead className="font-semibold">Completed Date</TableHead>
                        <TableHead className="font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">{caseItem.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell>{caseItem.gp?.clinic_name || "N/A"}</TableCell>
                          <TableCell>{formatSignalment(caseItem.patient_signalment)}</TableCell>
                          <TableCell>{caseItem.specialty_requested}</TableCell>
                          <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/specialist/case/${caseItem.id}`}>View Final Report</Link>
                            </Button>
                          </TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-brand-navy">Available Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-brand-navy/80 py-8 px-4 leading-relaxed">
              No available cases at this time. DVM League operates on a concierge model; we will personally contact you
              via email when a new case matching your expertise and availability is ready for your review. There is no
              need to monitor a queue.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

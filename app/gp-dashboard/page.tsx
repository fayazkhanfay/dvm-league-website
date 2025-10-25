"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function GPDashboardPage() {
  // Hardcoded demo data for Active Cases
  const activeCases = [
    {
      patientName: "Max",
      caseId: "DVML-001",
      specialty: "Cardiology",
      submittedDate: "2025-01-15",
      status: "Phase 1 Plan Ready",
    },
    {
      patientName: "Bella",
      caseId: "DVML-002",
      specialty: "Dermatology",
      submittedDate: "2025-01-18",
      status: "Pending Assignment",
    },
    {
      patientName: "Charlie",
      caseId: "DVML-003",
      specialty: "Internal Medicine",
      submittedDate: "2025-01-20",
      status: "Awaiting Diagnostics",
    },
  ]

  // Hardcoded demo data for Completed Cases
  const completedCases = [
    {
      patientName: "Luna",
      caseId: "DVML-004",
      specialty: "Cardiology",
      submittedDate: "2024-12-10",
      status: "Completed",
    },
    {
      patientName: "Rocky",
      caseId: "DVML-005",
      specialty: "Internal Medicine",
      submittedDate: "2024-12-15",
      status: "Completed",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Assignment":
        return (
          <Badge variant="secondary" className="bg-brand-stone text-brand-navy">
            Pending Assignment
          </Badge>
        )
      case "Phase 1 Plan Ready":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Phase 1 Plan Ready
          </Badge>
        )
      case "Awaiting Diagnostics":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Awaiting Diagnostics
          </Badge>
        )
      case "Phase 2 Plan Ready":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Phase 2 Plan Ready
          </Badge>
        )
      case "Completed":
        return (
          <Badge variant="default" className="bg-brand-navy text-white hover:bg-brand-navy">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getActionButton = (status: string) => {
    switch (status) {
      case "Pending Assignment":
        return <span className="text-sm text-brand-navy/60">Awaiting Assignment</span>
      case "Phase 1 Plan Ready":
        return (
          <Button variant="outline" size="sm" asChild>
            <a href="#">View Phase 1 Plan</a>
          </Button>
        )
      case "Awaiting Diagnostics":
        return (
          <Button variant="outline" size="sm" asChild>
            <a href="#">Upload Diagnostics</a>
          </Button>
        )
      case "Phase 2 Plan Ready":
        return (
          <Button variant="outline" size="sm" asChild>
            <a href="#">View Final Report</a>
          </Button>
        )
      case "Completed":
        return (
          <Button variant="outline" size="sm" asChild>
            <a href="#">View Final Report</a>
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <AppLayout activePage="myCases">
      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-brand-navy">Case Dashboard</h1>
          <Button
            asChild
            className="transform rounded-md bg-brand-gold px-6 py-3 font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
          >
            <a href="/submit-case">Submit a New Case</a>
          </Button>
        </div>

        {/* Tabs for Case Status Filtering */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active Cases</TabsTrigger>
            <TabsTrigger value="completed">Completed Cases</TabsTrigger>
          </TabsList>

          {/* Active Cases Tab */}
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
                    <TableRow key={caseItem.caseId}>
                      <TableCell className="font-medium">{caseItem.patientName}</TableCell>
                      <TableCell>{caseItem.caseId}</TableCell>
                      <TableCell>{caseItem.specialty}</TableCell>
                      <TableCell>{caseItem.submittedDate}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{getActionButton(caseItem.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Completed Cases Tab */}
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
                    <TableRow key={caseItem.caseId}>
                      <TableCell className="font-medium">{caseItem.patientName}</TableCell>
                      <TableCell>{caseItem.caseId}</TableCell>
                      <TableCell>{caseItem.specialty}</TableCell>
                      <TableCell>{caseItem.submittedDate}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{getActionButton(caseItem.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  )
}

"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SpecialistDashboard() {
  // Hardcoded demo data for active cases
  const activeCases = [
    {
      caseId: "DVML-001",
      clinicName: "Main Street Animal Hospital",
      signalment: "Canine, Golden Retriever, 8y MN",
      status: "Awaiting Phase 1 Report",
      reportDue: "ASAP / Next AM",
      action: "submit-phase-1",
    },
    {
      caseId: "DVML-003",
      clinicName: "Riverside Veterinary Clinic",
      signalment: "Feline, DSH, 12y FS",
      status: "Awaiting Diagnostics Upload",
      reportDue: "1-2 Business Days",
      action: "awaiting-diagnostics",
    },
    {
      caseId: "DVML-005",
      clinicName: "Oakwood Pet Care",
      signalment: "Canine, Labrador, 5y MN",
      status: "Awaiting Phase 2 Report",
      reportDue: "ASAP / Next AM",
      action: "submit-phase-2",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Awaiting Phase 1 Report":
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            {status}
          </Badge>
        )
      case "Awaiting Diagnostics Upload":
        return <Badge variant="secondary">{status}</Badge>
      case "Awaiting Phase 2 Report":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            {status}
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getActionButton = (action: string) => {
    switch (action) {
      case "submit-phase-1":
        return (
          <Button variant="outline" size="sm" asChild>
            <a href="#">Submit Phase 1 Plan</a>
          </Button>
        )
      case "awaiting-diagnostics":
        return <span className="text-sm text-brand-navy/60">Awaiting GP Diagnostics</span>
      case "submit-phase-2":
        return (
          <Button variant="outline" size="sm" asChild>
            <a href="#">Submit Final Report</a>
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <AppLayout activePage="myCases">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <h1 className="font-serif text-3xl font-bold text-brand-navy mb-8">Specialist Dashboard</h1>

        {/* My Active Cases Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-brand-navy">My Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableRow key={caseItem.caseId}>
                      <TableCell className="font-medium">{caseItem.caseId}</TableCell>
                      <TableCell>{caseItem.clinicName}</TableCell>
                      <TableCell>{caseItem.signalment}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{caseItem.reportDue}</TableCell>
                      <TableCell>{getActionButton(caseItem.action)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Available Cases Section - Concierge Model Explanation */}
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

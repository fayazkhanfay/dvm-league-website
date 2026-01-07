"use client"

import useSWR from "swr"
import { fetchSpecialistCases } from "@/lib/fetchers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface LiveSpecialistCaseListProps {
  userId: string
  specialty: string
  initialAssignedCases: any[]
  initialAvailableCases: any[]
}

export function LiveSpecialistCaseList({
  userId,
  specialty,
  initialAssignedCases,
  initialAvailableCases,
}: LiveSpecialistCaseListProps) {
  const { data } = useSWR(`specialist-cases-${userId}`, () => fetchSpecialistCases(userId, specialty), {
    fallbackData: {
      assignedCases: initialAssignedCases,
      availableCases: initialAvailableCases,
    },
    refreshInterval: 30000, // Poll every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  const allCases = data?.assignedCases || []
  const availableCases = data?.availableCases || []

  const activeCases = allCases.filter((c) => c.status !== "completed")
  const completedCases = allCases.filter((c) => c.status === "completed")

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
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/specialist/case/${caseItem.id}`}>View Case</Link>
          </Button>
        )
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

  const formatSignalment = (caseItem: any) => {
    return `${caseItem.patient_species}, ${caseItem.patient_breed}, ${caseItem.patient_age} ${caseItem.patient_sex_status}`
  }

  return (
    <Tabs defaultValue="active" className="mb-8">
      <TabsList className="grid w-full max-w-3xl grid-cols-3">
        <TabsTrigger value="active">
          Active Cases {activeCases.length > 0 && <span className="ml-1.5 text-xs">({activeCases.length})</span>}
        </TabsTrigger>
        <TabsTrigger value="available">
          Available Cases{" "}
          {availableCases && availableCases.length > 0 && (
            <span className="ml-1.5 text-xs">({availableCases.length})</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed Cases{" "}
          {completedCases.length > 0 && <span className="ml-1.5 text-xs">({completedCases.length})</span>}
        </TabsTrigger>
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
                      <TableCell>{formatSignalment(caseItem)}</TableCell>
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

      <TabsContent value="available">
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
                    <TableHead className="font-semibold">Submitted Date</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableCases && availableCases.length > 0 ? (
                    availableCases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-medium">{caseItem.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell>{caseItem.gp?.clinic_name || "N/A"}</TableCell>
                        <TableCell>{formatSignalment(caseItem)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{caseItem.specialty_requested}</Badge>
                        </TableCell>
                        <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/specialist/case/${caseItem.id}`}>View Case</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-brand-navy/60 py-8">
                        No available cases at this time
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
                      <TableCell>{formatSignalment(caseItem)}</TableCell>
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
  )
}

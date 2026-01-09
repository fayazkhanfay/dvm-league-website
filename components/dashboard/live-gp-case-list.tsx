"use client"

import useSWR from "swr"
import { fetchGPCases } from "@/lib/fetchers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabCountBadge } from "@/components/ui/tab-count-badge"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useTransition } from "react"

interface LiveGPCaseListProps {
  userId: string
  initialCases: any[]
  onDeleteDraft: (caseId: string) => Promise<void>
}

export function LiveGPCaseList({ userId, initialCases, onDeleteDraft }: LiveGPCaseListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: allCases, mutate } = useSWR(`gp-cases-${userId}`, () => fetchGPCases(userId), {
    fallbackData: initialCases,
    refreshInterval: 30000, // Poll every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

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

  const handleDelete = async (caseId: string) => {
    setDeletingId(caseId)
    try {
      await onDeleteDraft(caseId)
      toast.success("Draft deleted successfully")
      mutate() // Refresh the list
    } catch (error) {
      toast.error("Failed to delete draft")
      console.error("[v0] Error deleting draft:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-3">
        <TabsTrigger value="drafts" className="flex items-center">
          Drafts <TabCountBadge count={draftCases.length} variant="gold" />
        </TabsTrigger>
        <TabsTrigger value="active" className="flex items-center">
          Active Cases <TabCountBadge count={activeCases.length} variant="blue" />
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center">
          Completed Cases <TabCountBadge count={completedCases.length} variant="neutral" />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="drafts">
        <div className="overflow-x-auto rounded-lg bg-white shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-brand-navy">Patient Name</TableHead>
                <TableHead className="font-semibold text-brand-navy">Case ID</TableHead>
                <TableHead className="font-semibold text-brand-navy">Specialty</TableHead>
                <TableHead className="font-semibold text-brand-navy">Date Started</TableHead>
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
                  <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Delete draft"
                        onClick={() => handleDelete(caseItem.id)}
                        disabled={deletingId === caseItem.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
  )
}

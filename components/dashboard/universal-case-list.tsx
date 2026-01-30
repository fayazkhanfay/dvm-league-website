"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface Case {
    id: string
    patient_name: string
    patient_species?: string
    patient_breed?: string
    patient_age?: string
    patient_gender?: string
    patient_sex_status?: string
    status: string
    submitted_at?: string
    created_at: string
    last_message_sender?: string
    last_message?: { sender_id: string }[]
    specialist_id?: string
}

interface UniversalCaseListProps {
    cases: Case[]
    role: "gp" | "specialist"
    userId?: string
}

export function UniversalCaseList({ cases, role }: UniversalCaseListProps) {
    const router = useRouter()

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
            case "in_progress":
                return (
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                        Active Case
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="default" className="bg-brand-navy text-white hover:bg-brand-navy">
                        Completed
                    </Badge>
                )
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>
            default:
                return <Badge variant="secondary">{status.replace("_", " ")}</Badge>
        }
    }

    const formatPatientDetails = (c: Case) => {
        const parts = [
            c.patient_species,
            c.patient_breed,
            c.patient_age,
            c.patient_gender || c.patient_sex_status,
        ].filter(Boolean)

        if (parts.length === 0) return ""
        return parts.join(", ")
    }

    const shouldShowBlueDot = (c: Case) => {
        if (c.last_message_sender) {
            if (c.last_message_sender !== role) return true
        }

        const lastMsg = c.last_message?.[0]
        if (lastMsg) {
            if (role === 'gp' && c.specialist_id && lastMsg.sender_id === c.specialist_id) return true
            if (role === 'specialist' && c.specialist_id && lastMsg.sender_id !== c.specialist_id) return true
        }

        return false
    }

    const handleRowClick = (caseId: string) => {
        router.push(`/${role}/case/${caseId}`)
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Patient</TableHead>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cases.map((c) => (
                        <TableRow
                            key={c.id}
                            onClick={() => handleRowClick(c.id)}
                            className="cursor-pointer hover:bg-muted/50"
                        >
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                            {c.patient_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatPatientDetails(c)}
                                        </span>
                                    </div>
                                    {shouldShowBlueDot(c) && (
                                        <span className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                                {c.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                                {new Date(c.submitted_at || c.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(c.status)}</TableCell>
                        </TableRow>
                    ))}
                    {cases.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No cases found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

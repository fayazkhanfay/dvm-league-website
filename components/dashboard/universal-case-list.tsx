"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface Case {
    id: string
    patient_name: string
    patient_species?: string
    patient_breed?: string
    patient_age?: string
    patient_gender?: string
    patient_sex_status?: string // Handling mismatch from prompt/code
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
    userId?: string // Optional, to check for blue dot logic if needed, but the prompt says "last_message_sender exists and != current user's role"
}

export function UniversalCaseList({ cases, role }: UniversalCaseListProps) {
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
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                        Awaiting Phase 1 Report
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
                    <Badge variant="default" className="bg-brand-blue/80 text-white hover:bg-brand-blue">
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
        // "If last_message_sender exists and != current user's role"
        // We assume the data passed includes 'last_message_sender' or we derive it from 'last_message' array as seen in other files
        // In live-gp-case-list.tsx: caseItem.last_message?.[0]?.sender_id === caseItem.specialist_id
        // In live-specialist-case-list.tsx: caseItem.last_message?.[0]?.sender_id !== userId

        // We can infer the "sender role" logic:
        // If role is GP, we want to know if Specialist sent the last message.
        // If role is Specialist, we want to know if GP (or System?) sent the last message.

        // Since we don't have the current User ID passed in explicitly in the prompt requirements for props, 
        // but the prompt says "!= current user's role", we might need to rely on the `last_message_sender` field if it exists directly,
        // or infer from `last_message[0].sender_id`.

        // However, the prompt says "Props: cases ... role ...".
        // And "Blue Dot Logic: If last_message_sender exists and != current user's role".
        // This implies `case` object has a `last_message_sender` property which might be a role string like 'gp' or 'specialist'?
        // OR it means we compare IDs.

        // Let's look at live-gp-case-list.tsx again.
        // It compares `sender_id === specialist_id`.

        // Let's try to handle `last_message_sender` if it's a role string, or fallback to the array check.

        if (c.last_message_sender) {
            // user prompt implies this field exists or we should use it.
            // If it's a role string:
            if (c.last_message_sender !== role) return true
        }

        // Fallback based on existing code logic if `last_message` array exists
        // But we don't have `userId` prop required by prompt... 
        // Ideally we should rely on the `last_message_sender` logic requested. 
        // I will assume `last_message_sender` will be populated or I'll check `last_message`.

        // UPDATE: The prompt says "Reuse the logic: If last_message_sender exists and != current user's role".
        // "last_message_sender" usually implies the FIELD name. 

        const lastMsg = c.last_message?.[0]
        if (lastMsg) {
            // If I am GP, and sender is Specialist -> Blue Dot
            if (role === 'gp' && c.specialist_id && lastMsg.sender_id === c.specialist_id) return true

            // If I am Specialist, and sender is NOT me (so likely GP) -> Blue Dot. 
            // But I don't know "me" (userId).
            // However, usually checking if sender_id != specialist_id works if I am the specialist?
            // Wait, if I am the specialist, my ID is `specialist_id` on the case?
            // Let's assume so.
            if (role === 'specialist' && c.specialist_id && lastMsg.sender_id !== c.specialist_id) return true
        }

        return false
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
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cases.map((c) => (
                        <TableRow key={c.id}>
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
                                {/* submitted_at or created_at */}
                                {new Date(c.submitted_at || c.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(c.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/${role}/case/${c.id}`}>View Case</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {cases.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No cases found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

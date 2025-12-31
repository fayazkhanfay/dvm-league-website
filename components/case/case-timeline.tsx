"use client"

import { useEffect, useRef } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { MessageSquare, FileText, Stethoscope, ClipboardList } from "lucide-react"
import type { TimelineEvent } from "@/app/actions/get-case-timeline"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CaseTimelineProps {
  caseId: string
  events: TimelineEvent[]
  currentUserRole: "gp" | "specialist"
}

export function CaseTimeline({ caseId, events, currentUserRole }: CaseTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on initial load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a")
    }
  }

  const renderEvent = (event: TimelineEvent) => {
    if (event.type === "message") {
      return renderMessage(event)
    } else if (event.type === "case_submission") {
      return renderCaseSubmission(event)
    }
  }

  const renderCaseSubmission = (event: Extract<TimelineEvent, { type: "case_submission" }>) => {
    return (
      <div key={event.id} className="mb-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Case Submitted</h3>
            <span className="text-sm text-blue-600 ml-auto">{formatTimestamp(event.created_at)}</span>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Presenting Complaint</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{event.presenting_complaint}</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Brief History</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{event.brief_history}</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Physical Exam Findings</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{event.pe_findings}</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Current Medications</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{event.medications}</p>
            </div>

            {event.diagnostics_performed && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Diagnostics Performed</h4>
                <p className="text-blue-800 whitespace-pre-wrap">{event.diagnostics_performed}</p>
              </div>
            )}

            {event.treatments_attempted && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Treatments Attempted</h4>
                <p className="text-blue-800 whitespace-pre-wrap">{event.treatments_attempted}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Questions for Specialist</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{event.gp_questions}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderMessage = (event: Extract<TimelineEvent, { type: "message" }>) => {
    // Handle different message types
    if (event.message_type === "report_phase1") {
      return (
        <div key={event.id} className="flex justify-center mb-4">
          <div className="max-w-md w-full border-2 border-amber-500 rounded-lg p-4 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Phase 1 Diagnostic Plan</h4>
            </div>
            <p className="text-sm text-amber-800 mb-3">{event.content || "Diagnostic plan submitted"}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-amber-600 text-amber-700 hover:bg-amber-100 bg-transparent"
            >
              View Report
            </Button>
          </div>
        </div>
      )
    }

    if (event.message_type === "report_phase2") {
      return (
        <div key={event.id} className="flex justify-center mb-4">
          <div className="max-w-md w-full border-2 border-green-500 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Phase 2 Final Report</h4>
            </div>
            <p className="text-sm text-green-800 mb-3">{event.content || "Final report submitted"}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-green-600 text-green-700 hover:bg-green-100 bg-transparent"
            >
              View Report
            </Button>
          </div>
        </div>
      )
    }

    if (event.message_type === "system") {
      return (
        <div key={event.id} className="flex justify-center mb-4">
          <div className="bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">{event.content}</div>
        </div>
      )
    }

    const isSpecialist = event.sender_role === "specialist"
    return (
      <div key={event.id} className={`flex mb-4 ${isSpecialist ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[70%] ${isSpecialist ? "items-end" : "items-start"} flex flex-col gap-1`}>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground">{event.sender_name}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</span>
          </div>
          <div
            className={`rounded-lg px-4 py-2 ${isSpecialist ? "bg-blue-500 text-white" : "bg-muted text-foreground"}`}
          >
            <p className="text-sm">{event.content}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation or upload files</p>
          </div>
        ) : (
          <div className="space-y-1">{events.map((event) => renderEvent(event))}</div>
        )}
      </ScrollArea>
    </div>
  )
}

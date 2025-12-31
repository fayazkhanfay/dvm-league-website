"use client"

import { useEffect, useRef } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { MessageSquare, FileText, Stethoscope, Paperclip } from "lucide-react"
import type { TimelineEvent } from "@/app/actions/get-case-timeline"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface CaseTimelineProps {
  caseId: string
  initialEvents: TimelineEvent[]
  currentUserId: string
  currentUserRole: "gp" | "specialist"
}

export default function CaseTimeline({ caseId, initialEvents, currentUserId, currentUserRole }: CaseTimelineProps) {
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
    } else {
      return renderFile(event)
    }
  }

  const renderMessage = (event: Extract<TimelineEvent, { type: "message" }>) => {
    const isCurrentUser = event.sender_id === currentUserId

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

    // Regular text message - chat bubble style
    return (
      <div key={event.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground">{event.sender_name}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</span>
          </div>
          <div
            className={`rounded-lg px-4 py-2 ${isCurrentUser ? "bg-blue-500 text-white" : "bg-muted text-foreground"}`}
          >
            <p className="text-sm">{event.content}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderFile = (event: Extract<TimelineEvent, { type: "file" }>) => {
    return (
      <div key={event.id} className="flex justify-center mb-4">
        <div className="max-w-md w-full border rounded-lg p-3 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-semibold">{event.uploader_name}</span> uploaded a file
              </p>
              <p className="text-sm text-muted-foreground truncate">{event.file_name}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</p>
            </div>
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              Download
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {initialEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation or upload files</p>
          </div>
        ) : (
          <div className="space-y-1">{initialEvents.map((event) => renderEvent(event))}</div>
        )}
      </ScrollArea>
    </div>
  )
}

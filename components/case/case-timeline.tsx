"use client"

import { useEffect, useRef } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { MessageSquare, FileText, Stethoscope, ClipboardList, Files, ImageIcon } from "lucide-react"
import type { TimelineEvent } from "@/app/actions/get-case-timeline"
import type { CaseDetails } from "@/app/actions/get-case-details"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ClinicalHistory } from "./clinical-history"

type CaseFile = {
  id: string
  file_name: string
  storage_object_path: string
  file_type: string | null
  upload_phase: "initial_submission" | "diagnostic_results" | "specialist_report" | null
  uploaded_at: string
  uploader_id: string
  uploader_name: string
}

interface CaseTimelineProps {
  caseId: string
  events: TimelineEvent[]
  currentUserRole: "gp" | "specialist"
  files: CaseFile[]
  caseData: CaseDetails
  userId: string
}

type FileBatch = {
  uploader_id: string
  uploader_name: string
  uploaded_at: string
  files: CaseFile[]
}

export function CaseTimeline({ caseId, events, currentUserRole, files, caseData, userId }: CaseTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const createFileBatches = (): FileBatch[] => {
    const batches: FileBatch[] = []
    const sortedFiles = [...files].sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())

    let currentBatch: FileBatch | null = null

    for (const file of sortedFiles) {
      if (!currentBatch || currentBatch.uploader_id !== file.uploader_id) {
        if (currentBatch) {
          batches.push(currentBatch)
        }
        currentBatch = {
          uploader_id: file.uploader_id,
          uploader_name: file.uploader_name,
          uploaded_at: file.uploaded_at,
          files: [file],
        }
      } else {
        currentBatch.files.push(file)
      }
    }

    if (currentBatch) {
      batches.push(currentBatch)
    }

    return batches
  }

  const fileBatches = createFileBatches()

  const isImageFile = (fileName: string, fileType: string | null) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const type = fileType?.toLowerCase()

    if (ext === "dcm") return false

    return type?.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")
  }

  const renderFileBatch = (batch: FileBatch) => {
    const imageFiles = batch.files.filter((f) => isImageFile(f.file_name, f.file_type))
    const docFiles = batch.files.filter((f) => !isImageFile(f.file_name, f.file_type))

    return (
      <div key={batch.uploader_id + batch.uploaded_at} className="mb-6">
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Files className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">
              {batch.uploader_name} uploaded {batch.files.length} file{batch.files.length > 1 ? "s" : ""}
            </p>
            <span className="text-xs text-muted-foreground ml-auto">{formatTimestamp(batch.uploaded_at)}</span>
          </div>

          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {imageFiles.slice(0, 4).map((file) => (
                <div key={file.id} className="relative aspect-square rounded-md overflow-hidden bg-muted border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {file.file_name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {docFiles.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-background border">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {docFiles.length} document{docFiles.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </Card>
      </div>
    )
  }

  const mergedTimeline = [
    ...events.map((e) => ({ type: "event" as const, data: e, timestamp: new Date(e.created_at).getTime() })),
    ...fileBatches.map((b) => ({ type: "batch" as const, data: b, timestamp: new Date(b.uploaded_at).getTime() })),
  ].sort((a, b) => a.timestamp - b.timestamp)

  const renderEvent = (event: TimelineEvent) => {
    if (event.type === "message") {
      return renderMessage(event)
    } else if (event.type === "case_submission") {
      return (
        <div key={event.id} className="mb-6">
          <ClinicalHistory
            presenting_complaint={event.presenting_complaint}
            brief_history={event.brief_history}
            pe_findings={event.pe_findings}
            medications={event.medications}
            diagnostics_performed={event.diagnostics_performed}
            treatments_attempted={event.treatments_attempted}
            gp_questions={event.gp_questions}
            created_at={event.created_at}
          />
        </div>
      )
    }
  }

  const renderMessage = (event: Extract<TimelineEvent, { type: "message" }>) => {
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

  const isAssignedToMe = currentUserRole === "gp" ? caseData.gp_id === userId : caseData.specialist_id === userId

  return (
    <div className="space-y-6">
      {mergedTimeline.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
          <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
          <p>No activity yet</p>
          <p className="text-sm">The case timeline will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {mergedTimeline.map((item) => (item.type === "event" ? renderEvent(item.data) : renderFileBatch(item.data)))}
        </div>
      )}
    </div>
  )
}

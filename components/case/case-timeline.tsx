"use client"

import { useEffect, useRef, useState } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { MessageSquare, FileText, Stethoscope, ClipboardList, Files, ImageIcon, Download } from "lucide-react"
import type { TimelineEvent } from "@/app/actions/get-case-timeline"
import type { CaseDetails } from "@/app/actions/get-case-details"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ClinicalHistory } from "./clinical-history"
import { ImageLightbox } from "./image-lightbox"
import { getSignedFileUrl } from "@/app/actions/storage"
import { useToast } from "@/hooks/use-toast"
import JSZip from "jszip"
import { saveAs } from "file-saver"

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

type TimelineItem = {
  type: "event" | "file_batch"
  data: TimelineEvent | FileBatch
}

export function CaseTimeline({ caseId, events, currentUserRole, files, caseData, userId }: CaseTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)
  const { toast } = useToast()
  const [mergedTimeline, setMergedTimeline] = useState<TimelineItem[]>([])
  const [zippingBatchId, setZippingBatchId] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const createMergedTimeline = (): TimelineItem[] => {
      const timelineItems: TimelineItem[] = []
      const fileBatches = createFileBatches()

      fileBatches.forEach((batch) => {
        timelineItems.push({ type: "file_batch", data: batch })
      })

      events.forEach((event) => {
        timelineItems.push({ type: "event", data: event })
      })

      return timelineItems.sort(
        (a, b) =>
          new Date(a.data.created_at || a.data.uploaded_at).getTime() -
          new Date(b.data.created_at || b.data.uploaded_at).getTime(),
      )
    }

    setMergedTimeline(createMergedTimeline())

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, files])

  useEffect(() => {
    const loadImageUrls = async () => {
      const imageFiles = files.filter((f) => isImageFile(f.file_name, f.file_type))
      const urls: Record<string, string> = {}

      await Promise.all(
        imageFiles.map(async (file) => {
          const result = await getSignedFileUrl(file.storage_object_path)
          if (result.success && result.signedUrl) {
            urls[file.id] = result.signedUrl
          }
        }),
      )

      setImageUrls(urls)
    }

    loadImageUrls()
  }, [files])

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
      const shouldCreateNewBatch =
        !currentBatch ||
        currentBatch.uploader_id !== file.uploader_id ||
        Math.abs(new Date(file.uploaded_at).getTime() - new Date(currentBatch.uploaded_at).getTime()) > 60000

      if (shouldCreateNewBatch) {
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

  const handleFileClick = async (file: CaseFile) => {
    const ext = file.file_name.split(".").pop()?.toLowerCase()

    const result = await getSignedFileUrl(file.storage_object_path)
    if (!result.success || !result.signedUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access file",
      })
      return
    }

    const signedUrl = result.signedUrl

    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
      setSelectedImage({ src: signedUrl, alt: file.file_name })
    } else if (ext === "pdf") {
      window.open(signedUrl, "_blank")
    } else {
      const link = document.createElement("a")
      link.href = signedUrl
      link.download = file.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadBatch = async (batch: FileBatch) => {
    const batchId = `${batch.uploader_id}-${batch.uploaded_at}`
    setZippingBatchId(batchId)

    toast({
      title: "Compressing files",
      description: `Creating zip archive with ${batch.files.length} file(s)...`,
    })

    try {
      const zip = new JSZip()

      for (const file of batch.files) {
        const result = await getSignedFileUrl(file.storage_object_path)

        if (result.success && result.signedUrl) {
          try {
            const response = await fetch(result.signedUrl)
            const blob = await response.blob()
            zip.file(file.file_name, blob)
          } catch (error) {
            console.error(`[v0] Failed to fetch file: ${file.file_name}`, error)
            toast({
              variant: "destructive",
              title: "Warning",
              description: `Failed to add ${file.file_name} to archive`,
            })
          }
        }
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      })

      const currentDateTime = format(new Date(), "yyyy-MM-dd_HHmmss")
      const sanitizedPetName = (caseData.patient_name || "Unknown").replace(/[^a-zA-Z0-9]/g, "_")
      const sanitizedSpecies = (caseData.patient_species || "Unknown").replace(/[^a-zA-Z0-9]/g, "_")
      const shortCaseId = caseId.substring(0, 6)
      const zipFileName = `${currentDateTime}_${sanitizedPetName}_${sanitizedSpecies}_Case-${shortCaseId}.zip`

      saveAs(zipBlob, zipFileName)

      toast({
        title: "Download complete",
        description: `${zipFileName} has been downloaded`,
      })
    } catch (error) {
      console.error("[v0] Error creating zip file:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create zip archive",
      })
    } finally {
      setZippingBatchId(null)
    }
  }

  const renderFileBatch = (batch: FileBatch) => {
    const imageFiles = batch.files.filter((f) => isImageFile(f.file_name, f.file_type))
    const docFiles = batch.files.filter((f) => !isImageFile(f.file_name, f.file_type))
    const batchId = `${batch.uploader_id}-${batch.uploaded_at}`
    const isZipping = zippingBatchId === batchId

    return (
      <div key={batchId} className="mb-6">
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Files className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">
              {batch.uploader_name} uploaded {batch.files.length} file{batch.files.length > 1 ? "s" : ""}
            </p>
            <span className="text-xs text-muted-foreground ml-auto">{formatTimestamp(batch.uploaded_at)}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs bg-transparent"
              onClick={() => handleDownloadBatch(batch)}
              disabled={isZipping}
            >
              <Download className="h-3 w-3" />
              {isZipping ? "Compressing..." : "Download All"}
            </Button>
          </div>

          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
              {imageFiles.map((file) => {
                const signedUrl = imageUrls[file.id]

                return (
                  <button
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="relative aspect-square rounded-md overflow-hidden bg-muted border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                  >
                    {signedUrl ? (
                      <img
                        src={signedUrl || "/placeholder.svg"}
                        alt={file.file_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover aspect-square rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            const fallback = document.createElement("div")
                            fallback.className = "absolute inset-0 flex items-center justify-center bg-muted"
                            fallback.innerHTML =
                              '<svg class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {file.file_name}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {docFiles.length > 0 && (
            <div className="space-y-1">
              {docFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="w-full flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{file.file_name}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

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
    <>
      <ImageLightbox
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        src={selectedImage?.src || ""}
        alt={selectedImage?.alt || ""}
      />

      <div className="space-y-6">
        {mergedTimeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
            <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">The case timeline will appear here</p>
          </div>
        ) : (
          <div className="space-y-1" ref={scrollRef}>
            {mergedTimeline.map((item) =>
              item.type === "event" ? renderEvent(item.data) : renderFileBatch(item.data),
            )}
          </div>
        )}
      </div>
    </>
  )
}

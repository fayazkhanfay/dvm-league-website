"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileImage, FileText, File } from "lucide-react"
import { getSignedFileUrl } from "@/app/actions/storage"

type CaseFile = {
  id: string
  file_name: string
  storage_object_path: string
  file_type: string | null
  upload_phase: "initial_submission" | "diagnostic_results" | "specialist_report" | null
  uploaded_at: string
}

type FileGalleryProps = {
  files: CaseFile[]
}

export function FileGallery({ files }: FileGalleryProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  // Group files by phase
  const initialFiles = files.filter((f) => f.upload_phase === "initial_submission" || f.upload_phase === null)
  const diagnosticFiles = files.filter((f) => f.upload_phase === "diagnostic_results")
  const reportFiles = files.filter((f) => f.upload_phase === "specialist_report")

  const handleDownload = async (file: CaseFile) => {
    setDownloading(file.id)

    try {
      const result = await getSignedFileUrl(file.storage_object_path)

      if (!result.success || !result.signedUrl) {
        console.error("[v0] Failed to get signed URL:", result.error)
        return
      }

      // Open in new tab to trigger download
      window.open(result.signedUrl, "_blank")
    } catch (error) {
      console.error("[v0] Error downloading file:", error)
    } finally {
      setDownloading(null)
    }
  }

  const getFileIcon = (fileName: string, fileType: string | null) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const type = fileType?.toLowerCase()

    if (type?.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <FileImage className="size-4 text-blue-500" />
    }

    if (type?.includes("pdf") || ext === "pdf") {
      return <FileText className="size-4 text-red-500" />
    }

    // DICOM, ZIP, or other files
    return <File className="size-4 text-gray-500" />
  }

  const truncateFileName = (name: string, maxLength = 25) => {
    if (name.length <= maxLength) return name
    const ext = name.split(".").pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."))
    return `${nameWithoutExt.substring(0, maxLength - ext!.length - 4)}...${ext}`
  }

  const FileItem = ({ file }: { file: CaseFile }) => (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(file.file_name, file.file_type)}
        <span className="text-sm font-medium truncate" title={file.file_name}>
          {truncateFileName(file.file_name)}
        </span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleDownload(file)}
        disabled={downloading === file.id}
        className="shrink-0"
      >
        <Download className="size-4" />
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial Submission Files */}
        {initialFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Initial Submission</h3>
            <div className="space-y-2">
              {initialFiles.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Files */}
        {diagnosticFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Diagnostics</h3>
            <div className="space-y-2">
              {diagnosticFiles.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Report Files */}
        {reportFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Reports</h3>
            <div className="space-y-2">
              {reportFiles.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No files uploaded yet</div>
        )}
      </CardContent>
    </Card>
  )
}

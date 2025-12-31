"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileImage, FileText, File, PackageOpen } from "lucide-react"
import { getSignedFileUrl } from "@/app/actions/storage"
import { downloadFilesAsZip } from "@/app/actions/download-files-zip"

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

type FileGalleryProps = {
  caseId: string
  files: CaseFile[]
}

export function FileGallery({ caseId, files }: FileGalleryProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null)

  const filesByUploader = files.reduce(
    (acc, file) => {
      const key = file.uploader_id
      if (!acc[key]) {
        acc[key] = {
          uploaderName: file.uploader_name,
          uploaderId: file.uploader_id,
          files: [],
        }
      }
      acc[key].files.push(file)
      return acc
    },
    {} as Record<
      string,
      {
        uploaderName: string
        uploaderId: string
        files: CaseFile[]
      }
    >,
  )

  const handleDownload = async (file: CaseFile) => {
    setDownloading(file.id)

    try {
      const result = await getSignedFileUrl(file.storage_object_path)

      if (!result.success || !result.signedUrl) {
        console.error("[v0] Failed to get signed URL:", result.error)
        return
      }

      window.open(result.signedUrl, "_blank")
    } catch (error) {
      console.error("[v0] Error downloading file:", error)
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAll = async (uploaderId: string, uploaderName: string) => {
    setDownloadingZip(uploaderId)

    try {
      const result = await downloadFilesAsZip(caseId, uploaderId)

      if (!result.success || !result.zipData) {
        console.error("[v0] Failed to create zip:", result.error)
        return
      }

      // Create download link for zip
      const link = document.createElement("a")
      link.href = `data:application/zip;base64,${result.zipData}`
      link.download = result.fileName || `${uploaderName}-files.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("[v0] Error downloading zip:", error)
    } finally {
      setDownloadingZip(null)
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
        {Object.values(filesByUploader).map((group) => (
          <div key={group.uploaderId} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">{group.uploaderName}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadAll(group.uploaderId, group.uploaderName)}
                disabled={downloadingZip === group.uploaderId}
                className="h-7 text-xs"
              >
                <PackageOpen className="size-3 mr-1" />
                {downloadingZip === group.uploaderId ? "Creating..." : "Download All"}
              </Button>
            </div>
            <div className="space-y-2">
              {group.files.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No files uploaded yet</div>
        )}
      </CardContent>
    </Card>
  )
}

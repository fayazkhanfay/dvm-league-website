"use client"

import { useState } from "react"
import { saveAs } from "file-saver"
import { Button } from "@/components/ui/button"
import { PackageOpen, Loader2 } from "lucide-react"
import { downloadFilesAsZip } from "@/app/actions/download-files-zip"
import { toast } from "sonner"

interface DownloadAllButtonProps {
    caseId: string
    uploaderId: string
    uploaderName: string
    label?: string
    filePaths?: string[]
}

export function DownloadAllButton({
    caseId,
    uploaderId,
    uploaderName,
    label = "Download All",
    filePaths,
}: DownloadAllButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async (e: React.MouseEvent) => {
        // 1. Stop form submission and bubbling immediately
        e.preventDefault()
        e.stopPropagation()

        if (isDownloading) return

        setIsDownloading(true)

        try {
            const result = await downloadFilesAsZip(caseId, uploaderId, filePaths)

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.success && result.zipData && result.fileName) {
                // 2. Decode Base64 from Server Action to Blob
                const byteCharacters = atob(result.zipData)
                const byteNumbers = new Array(byteCharacters.length)
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)
                const blob = new Blob([byteArray], { type: "application/zip" })

                // 3. Trigger download
                saveAs(blob, result.fileName)
                toast.success("Files downloaded successfully")
            }
        } catch (error) {
            console.error("Download error:", error)
            toast.error("Failed to download files")
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            type="button" // CRITICAL: Prevents form submission
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-7 text-xs gap-2"
        >
            {isDownloading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <PackageOpen className="h-3 w-3" />
            )}
            {isDownloading ? "Creating..." : label}
        </Button>
    )
}

"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { acceptCase } from "@/app/actions/accept-case"
import { sendCaseMessage } from "@/app/actions/send-case-message"
import { createClient } from "@/lib/supabase/client"
import { uploadCaseFile } from "@/app/actions/upload-case-file"

interface CommandCenterProps {
  status: string
  userRole: "gp" | "specialist"
  caseId: string
  isAssignedToMe: boolean
  onOpenPhase1: () => void
  onOpenPhase2: () => void
  onOpenFileUpload: () => void
}

export function CommandCenter({
  status,
  userRole,
  caseId,
  isAssignedToMe,
  onOpenPhase1,
  onOpenPhase2,
  onOpenFileUpload,
}: CommandCenterProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleClaimCase = async () => {
    setIsLoading(true)
    const result = await acceptCase(caseId)

    if (result.success) {
      toast({
        title: "Case claimed",
        description: "You have successfully claimed this case",
      })
      router.refresh()
    } else {
      toast({
        title: "Failed to claim case",
        description: result.error || "Failed to claim case",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsSendingMessage(true)
    const result = await sendCaseMessage(caseId, message.trim())

    if (result.success) {
      setMessage("")
      router.refresh()
    } else {
      toast({
        title: "Failed to send message",
        description: result.error || "Could not send message",
        variant: "destructive",
      })
    }
    setIsSendingMessage(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingFile(true)

    try {
      for (const file of Array.from(files)) {
        console.log("[v0] Starting upload for file:", file.name)

        // Upload to storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${caseId}/${fileName}`

        console.log("[v0] Uploading to storage:", filePath)
        const { error: uploadError } = await supabase.storage.from("case-bucket").upload(filePath, file)

        if (uploadError) {
          console.error("[v0] Storage upload error:", uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        console.log("[v0] Storage upload successful, saving file record")
        // Save file record to database
        const result = await uploadCaseFile(caseId, file.name, file.type, filePath, "additional")

        if (!result.success) {
          console.error("[v0] File record save failed:", result.error)
          throw new Error(`Failed to save file record: ${result.error}`)
        }

        console.log("[v0] File upload complete:", file.name)
      }

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${files.length} file(s)`,
      })
      router.refresh()
    } catch (error: any) {
      console.error("[v0] File upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setIsUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Scenario A: Unassigned Specialist
  if (userRole === "specialist" && status === "pending_assignment") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
        <div className="container mx-auto max-w-3xl">
          <Button className="w-full" size="lg" onClick={handleClaimCase} disabled={isLoading}>
            {isLoading ? "Claiming..." : "Claim Case"}
          </Button>
        </div>
      </div>
    )
  }

  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase1") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
        <div className="container mx-auto max-w-3xl">
          {/* Mobile: Stack action button above chat */}
          <div className="block p-2 md:hidden">
            <Button className="w-full bg-transparent" variant="outline" onClick={onOpenPhase1}>
              Write Phase 1 Diagnostic Plan
            </Button>
          </div>
          {/* Chat bar with desktop action button */}
          <div className="flex gap-2 p-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.dcm,.jpg,.jpeg,.png"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isSendingMessage}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim() || isSendingMessage}>
              <Send className="h-4 w-4" />
            </Button>
            {/* Desktop: Show action button inline */}
            <Button className="hidden md:flex" onClick={onOpenPhase1}>
              Write Phase 1 Plan
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase2") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
        <div className="container mx-auto max-w-3xl">
          {/* Mobile: Stack action button above chat */}
          <div className="block p-2 md:hidden">
            <Button className="w-full bg-transparent" variant="outline" onClick={onOpenPhase2}>
              Write Final Report
            </Button>
          </div>
          {/* Chat bar with desktop action button */}
          <div className="flex gap-2 p-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.dcm,.jpg,.jpeg,.png"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isSendingMessage}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim() || isSendingMessage}>
              <Send className="h-4 w-4" />
            </Button>
            {/* Desktop: Show action button inline */}
            <Button className="hidden md:flex" onClick={onOpenPhase2}>
              Write Final Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (
    (userRole === "gp" &&
      (status === "awaiting_phase1" || status === "awaiting_diagnostics" || status === "awaiting_phase2")) ||
    (userRole === "specialist" && isAssignedToMe && status === "awaiting_diagnostics")
  ) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.dcm,.jpg,.jpeg,.png"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isSendingMessage}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim() || isSendingMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No action available
  return null
}

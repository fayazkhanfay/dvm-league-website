"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, X, FileIcon, ImageIcon } from "lucide-react"
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
  onMessageSent?: () => void // Added callback for SWR optimistic updates
}

interface ChatBarProps {
  message: string
  setMessage: (msg: string) => void
  stagedFiles: File[]
  handleSendMessage: () => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
  isSendingMessage: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  showActionButton?: boolean
  actionLabel?: string
  onAction?: () => void
}

function ChatBar({
  message,
  setMessage,
  stagedFiles,
  handleSendMessage,
  handleFileSelect,
  removeFile,
  isSendingMessage,
  fileInputRef,
  showActionButton,
  actionLabel,
  onAction,
}: ChatBarProps) {
  const isImageFile = (file: File) => {
    return file.type.startsWith("image/")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
      <div className="container mx-auto max-w-3xl">
        {showActionButton && (
          <div className="block p-2 md:hidden">
            <Button className="w-full bg-transparent" variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}

        {stagedFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b bg-gray-50 p-2">
            {stagedFiles.map((file, index) => (
              <div key={index} className="relative flex items-center gap-1 rounded bg-white border px-2 py-1 text-sm">
                {isImageFile(file) ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileIcon className="h-4 w-4 text-gray-500" />
                )}
                <span className="max-w-[100px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 rounded hover:bg-gray-100 p-0.5"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 p-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.dcm,.jpg,.jpeg,.png"
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
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
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && stagedFiles.length === 0) || isSendingMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
          {showActionButton && (
            <Button className="hidden md:flex" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function CommandCenter({
  status,
  userRole,
  caseId,
  isAssignedToMe,
  onOpenPhase1,
  onOpenPhase2,
  onOpenFileUpload,
  onMessageSent, // Accept the new callback prop
}: CommandCenterProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
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
    if (!message.trim() && stagedFiles.length === 0) return

    setIsSendingMessage(true)

    try {
      if (message.trim()) {
        const result = await sendCaseMessage(caseId, message.trim())
        if (!result.success) {
          throw new Error(result.error || "Could not send message")
        }
      }

      if (stagedFiles.length > 0) {
        for (const file of stagedFiles) {
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${caseId}/${fileName}`

          const { error: uploadError } = await supabase.storage.from("case-bucket").upload(filePath, file)

          if (uploadError) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
          }

          const result = await uploadCaseFile(caseId, file.name, file.type, filePath, "additional")

          if (!result.success) {
            throw new Error(`Failed to save file record: ${result.error}`)
          }
        }
      }

      setMessage("")
      setStagedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onMessageSent?.()

      toast({
        title: "Sent successfully",
        description: stagedFiles.length > 0 ? `Message and ${stagedFiles.length} file(s) sent` : "Message sent",
      })
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error.message || "Could not send message and files",
        variant: "destructive",
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setStagedFiles((prev) => [...prev, ...Array.from(files)])
  }

  const removeFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index))
  }

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
      <ChatBar
        message={message}
        setMessage={setMessage}
        stagedFiles={stagedFiles}
        handleSendMessage={handleSendMessage}
        handleFileSelect={handleFileSelect}
        removeFile={removeFile}
        isSendingMessage={isSendingMessage}
        fileInputRef={fileInputRef}
        showActionButton
        actionLabel="Write Phase 1 Diagnostic Plan"
        onAction={onOpenPhase1}
      />
    )
  }

  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase2") {
    return (
      <ChatBar
        message={message}
        setMessage={setMessage}
        stagedFiles={stagedFiles}
        handleSendMessage={handleSendMessage}
        handleFileSelect={handleFileSelect}
        removeFile={removeFile}
        isSendingMessage={isSendingMessage}
        fileInputRef={fileInputRef}
        showActionButton
        actionLabel="Write Final Report"
        onAction={onOpenPhase2}
      />
    )
  }

  if (
    (userRole === "gp" &&
      (status === "pending_assignment" || status === "awaiting_phase1" || status === "awaiting_diagnostics" || status === "awaiting_phase2")) ||
    (userRole === "specialist" && isAssignedToMe && status === "awaiting_diagnostics")
  ) {
    return (
      <ChatBar
        message={message}
        setMessage={setMessage}
        stagedFiles={stagedFiles}
        handleSendMessage={handleSendMessage}
        handleFileSelect={handleFileSelect}
        removeFile={removeFile}
        isSendingMessage={isSendingMessage}
        fileInputRef={fileInputRef}
      />
    )
  }

  return null
}

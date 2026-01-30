"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, X, FileIcon, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { acceptCase } from "@/app/actions/accept-case"
import { sendCaseMessage } from "@/app/actions/send-case-message"
import { createClient } from "@/lib/supabase/client"
import { uploadCaseFile } from "@/app/actions/upload-case-file"

interface CommandCenterProps {
  status: string
  userRole: "gp" | "specialist"
  caseId: string
  isAssignedToMe: boolean
  onOpenFileUpload: () => void
  onOpenFinalReport?: () => void
  onMessageSent?: () => void
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

        <form
          className="flex gap-2 p-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.dcm,.jpg,.jpeg,.png"
          />
          <Button variant="outline" size="icon" type="button" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Add clinical update, clarification, or upload files..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSendingMessage}
            className="flex-1 border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
          />
          <Button
            type="submit"
            disabled={(!message.trim() && stagedFiles.length === 0) || isSendingMessage}
            className="min-w-[100px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium"
          >
            {isSendingMessage ? "Posting..." : "Post Update"}
          </Button>
          {showActionButton && (
            <Button className="hidden md:flex" type="button" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}

export function CommandCenter({
  status,
  userRole,
  caseId,
  isAssignedToMe,
  onOpenFileUpload,
  onOpenFinalReport,
  onMessageSent,
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                Claim Case
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Case Assignment</DialogTitle>
                <DialogDescription>Please review the terms below before accepting this case.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <span className="font-semibold">Compensation:</span> Estimated Payout:{" "}
                    <span className="font-bold">$275.00+</span>
                  </li>
                  <li>
                    <span className="font-semibold">Timeline:</span> Report Due:{" "}
                    <span className="font-bold">Within 24 Hours</span>
                  </li>
                  <li>
                    <span className="font-semibold">Commitment:</span> I agree to manage this case from Diagnosis
                    through Treatment (Continuity of Care).
                  </li>
                </ul>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Review Case Files
                  </Button>
                </DialogClose>
                <Button onClick={handleClaimCase} disabled={isLoading}>
                  {isLoading ? "Accepting..." : "Accept & Claim"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  if (userRole === "specialist" && isAssignedToMe && status === "in_progress") {
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
        onAction={onOpenFinalReport}
      />
    )
  }

  if (
    userRole === "gp" &&
    (status === "pending_assignment" || status === "in_progress")
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

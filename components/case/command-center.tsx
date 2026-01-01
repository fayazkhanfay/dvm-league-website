"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { acceptCase } from "@/app/actions/accept-case"

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

  const handleSendMessage = () => {
    if (!message.trim()) return
    // TODO: Implement send message functionality
    toast({
      title: "Message sent",
      description: "Your message has been sent",
    })
    setMessage("")
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

  // Scenario B: Assigned Specialist - Awaiting Phase 1
  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase1") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
        <div className="container mx-auto max-w-3xl">
          <Button className="w-full" size="lg" onClick={onOpenPhase1}>
            Write Phase 1 Diagnostic Plan
          </Button>
        </div>
      </div>
    )
  }

  // Scenario C: Assigned Specialist - Awaiting Phase 2
  if (userRole === "specialist" && isAssignedToMe && status === "awaiting_phase2") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
        <div className="container mx-auto max-w-3xl">
          <Button className="w-full" size="lg" onClick={onOpenPhase2}>
            Write Final Report
          </Button>
        </div>
      </div>
    )
  }

  // Scenario D: General - Message Input & File Upload (for both GP and Specialist when case is active)
  if (
    (userRole === "gp" &&
      (status === "awaiting_phase1" || status === "awaiting_diagnostics" || status === "awaiting_phase2")) ||
    (userRole === "specialist" && isAssignedToMe && status === "awaiting_diagnostics")
  ) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onOpenFileUpload}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage()
              }}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No action available
  return null
}

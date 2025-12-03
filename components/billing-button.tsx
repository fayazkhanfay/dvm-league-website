"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function BillingButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleManageBilling = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error === "No billing history found.") {
          toast({
            title: "No Billing History",
            description: "You have no billing history yet. Submit a paid case to activate your billing portal.",
            variant: "destructive",
          })
          return
        }

        throw new Error(data.error || "Failed to open billing portal")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("[v0] Error opening billing portal:", error)
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleManageBilling}
      disabled={isLoading}
      className="flex items-center gap-2 bg-transparent"
    >
      {isLoading ? "Loading..." : "Manage Billing & View Invoices"}
      <ExternalLink className="h-4 w-4" />
    </Button>
  )
}

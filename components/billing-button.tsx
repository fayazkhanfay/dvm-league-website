"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function BillingButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageBilling = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        alert("Failed to open billing portal. Please try again.")
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
      alert("Failed to open billing portal. Please try again.")
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

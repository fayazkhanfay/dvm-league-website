"use server"

import { notifySlack } from "@/lib/notifications"
import { headers } from "next/headers"

/**
 * Server Action to securely report client-side errors to Slack
 * This keeps the webhook URL server-side while allowing client error reporting
 */
export async function reportClientError(errorMessage: string, errorDigest?: string): Promise<void> {
  try {
    // Get user agent from request headers
    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || "Unknown"

    // Format error details for Slack
    const message = [
      "**CRITICAL CLIENT CRASH**",
      `Error: ${errorMessage}`,
      errorDigest ? `Digest: ${errorDigest}` : null,
      `User Agent: ${userAgent}`,
    ]
      .filter(Boolean)
      .join("\n")

    // Send to Slack (with error emoji)
    await notifySlack(message, "error")
  } catch (reportError) {
    // Log locally but don't throw - we don't want error reporting to crash
    console.error("[v0] Failed to report client error to Slack:", reportError)
  }
}

export default reportClientError

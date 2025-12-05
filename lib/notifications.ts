/**
 * Slack Notification Helper
 * Sends messages to Slack webhook with environment tags and emojis
 */

type NotificationType = "info" | "error" | "money"

export async function notifySlack(message: string, type: NotificationType = "info"): Promise<void> {
  // Check if webhook URL is configured
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.log("[v0] Slack webhook not configured, skipping notification:", message)
    return
  }

  try {
    // Detect environment
    const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || "development"
    const envTag = environment === "production" ? "[PROD]" : "[DEV]"

    // Map notification types to emojis
    const emojiMap: Record<NotificationType, string> = {
      money: "💰",
      error: "🚨",
      info: "ℹ️",
    }
    const emoji = emojiMap[type]

    // Format the final message
    const formattedMessage = `${emoji} ${envTag} ${message}`

    // Send to Slack webhook
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: formattedMessage }),
      cache: "no-store", // Ensure it fires instantly
    })

    console.log("[v0] Slack notification sent:", type, message)
  } catch (error) {
    // Log but don't throw - we don't want notifications to break the app
    console.error("[v0] Failed to send Slack notification:", error)
  }
}

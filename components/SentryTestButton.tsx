"use client"

import * as Sentry from "@sentry/nextjs"

export function SentryTestButton() {
  async function handleClick() {
    const error = new Error("Sentry Test Error: Button clicked")
    Sentry.captureException(error)
    // Flush to ensure event is sent immediately during testing
    await Sentry.flush(2000)
    console.log("Triggered Sentry.captureException and flushed")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      Send Sentry Test Error
    </button>
  )
}



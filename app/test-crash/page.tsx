"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function TestCrashPage() {
  const [shouldCrash, setShouldCrash] = useState(false)

  // The Crash: Throw error when shouldCrash is true
  if (shouldCrash) {
    throw new Error("🔥 TEST CRASH: This is a deliberate error to test global-error.tsx")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-6 rounded-lg bg-white p-12 shadow-xl">
        <AlertTriangle className="h-16 w-16 text-amber-500" />

        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Test Crash Handler</h1>
          <p className="mt-2 text-slate-600">This will trigger a client-side error to test the global error boundary</p>
        </div>

        <Button
          onClick={() => setShouldCrash(true)}
          className="bg-red-600 px-8 py-6 text-lg font-semibold hover:bg-red-700"
        >
          TRIGGER CRASH
        </Button>

        <p className="max-w-md text-center text-sm text-amber-600">
          ⚠️ Clicking this will crash the app and test the Slack alert. You should see the global error page and receive
          a notification.
        </p>
      </div>
    </div>
  )
}

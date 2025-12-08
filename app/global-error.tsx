"use client"

import { useEffect } from "react"
import { reportClientError } from "@/app/actions/report-error"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportClientError(error.message, error.digest)
  }, [error])

  const handleReturnToDashboard = () => {
    window.location.href = "/gp-dashboard"
  }

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
          <div className="max-w-md text-center">
            <h1 className="mb-2 text-4xl font-bold text-slate-100">Something went wrong</h1>
            <p className="mb-8 text-lg text-slate-400">Our team has been notified.</p>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => reset()} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                Try Again
              </Button>
              <Button
                onClick={handleReturnToDashboard}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 bg-transparent"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

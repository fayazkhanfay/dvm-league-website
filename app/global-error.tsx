"use client"

import { useEffect } from "react"
import { reportClientError } from "@/app/actions/report-error"

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

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">Something went wrong!</h1>
            <p className="mb-8 text-slate-300">We've been notified and are looking into it.</p>
            <button
              onClick={() => reset()}
              className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-900 transition-all hover:bg-amber-400 hover:shadow-lg active:scale-95"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <button onClick={() => reset()} style={{ marginTop: 12 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

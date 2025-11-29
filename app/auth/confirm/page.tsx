"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        // Get the session from the hash fragment (invitation/reset password flow)
        const { data } = await supabase.auth.getSession()

        if (data?.session) {
          // Session was successfully established from hash fragment
          const nextUrl = searchParams?.next || "/gp-dashboard"
          router.push(nextUrl)
        } else {
          // No session found in hash fragment
          setError("Authentication failed. Please try again.")
          router.push(`/login?error=auth_failed`)
        }
      } catch (err) {
        console.error("Auth confirmation error:", err)
        setError("An unexpected error occurred")
        router.push(`/login?error=auth_error`)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/login" className="text-blue-600 hover:underline">
            Return to login
          </a>
        </div>
      </div>
    )
  }

  return null
}

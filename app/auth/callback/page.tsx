"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Verifying invitation...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 1. Check if we have a session (handled automatically by Supabase client parsing the URL hash)
      const { data } = await supabase.auth.getSession()

      if (data?.session) {
        // SUCCESS: User is logged in.
        // Check if there is a 'next' param, otherwise default to reset-password
        const next = searchParams.get('next') || '/reset-password'
        router.push(next)
      } else {
        // 2. If no session yet, listen for the SIGNED_IN event (sometimes the hash processing takes a millisecond)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const next = searchParams.get('next') || '/reset-password'
            router.push(next)
          }
        })

        // 3. Fallback: If nothing happens after 3 seconds, redirect to login error
        setTimeout(() => {
            if (!data.session) { // Only redirect if we still don't have a session
                 setStatus("Redirecting to login...")
                 // router.push('/login?error=auth_timeout') // Optional: Uncomment if you want strict timeouts
            }
        }, 3000)

        return () => {
          subscription.unsubscribe()
        }
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e7e5e4] border-t-[#0A2240] mx-auto mb-4"></div>
        <p className="text-[#0A2240] font-medium">{status}</p>
      </div>
    </div>
  )
}

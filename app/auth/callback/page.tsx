"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Verifying invitation...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      // 1. Try standard detection first
      const { data } = await supabase.auth.getSession()

      if (data?.session) {
        setStatus("Session found. Redirecting...")
        router.replace('/reset-password')
        return
      }

      // 2. If no session, FORCE parse the hash (The "Launch Day" Hammer)
      // The dashboard invite sends tokens in the hash: #access_token=xyz&refresh_token=abc
      if (typeof window !== 'undefined' && window.location.hash) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1)) // Remove the '#'
          const access_token = hashParams.get("access_token")
          const refresh_token = hashParams.get("refresh_token")

          if (access_token && refresh_token) {
            setStatus("Token detected. Setting session...")
            
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            })

            if (!error) {
              router.replace('/reset-password')
              return
            } else {
              console.error("Manual session set failed:", error)
            }
          }
        } catch (e) {
          console.error("Error parsing hash:", e)
        }
      }

      // 3. Fallback Listener (If the SDK processes it late)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/reset-password')
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e7e5e4] border-t-[#0A2240] mx-auto mb-4"></div>
        <p className="text-[#0A2240] font-medium">{status}</p>
        <p className="text-xs text-gray-400 mt-4">Securely verifying credentials...</p>
      </div>
    </div>
  )
}

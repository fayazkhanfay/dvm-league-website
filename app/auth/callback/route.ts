import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  // Extract code and next from query parameters
  const code = request.nextUrl.searchParams.get("code")
  const next = request.nextUrl.searchParams.get("next") ?? "/gp-dashboard"

  if (code) {
    // Initialize the Supabase client
    const supabase = await createClient()

    // Exchange the authorization code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // Check for errors during session exchange
    if (!error) {
      return NextResponse.redirect(`${request.nextUrl.origin}${next}`)
    }
  }

  // Hash fragments (#access_token=...) are not sent to the server, so we redirect
  // to a client page that can read the fragment and complete the auth flow
  return NextResponse.redirect(`${request.nextUrl.origin}/auth/confirm?next=${encodeURIComponent(next)}`)
}

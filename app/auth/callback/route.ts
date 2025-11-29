import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  // Extract code and next from query parameters
  const code = request.nextUrl.searchParams.get("code")
  const next = request.nextUrl.searchParams.get("next") ?? "/reset-password"

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

  if (!code) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=no_code`)
  }

  return NextResponse.redirect(`${request.nextUrl.origin}/login?error=auth_code_error`)
}

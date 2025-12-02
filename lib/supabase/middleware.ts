import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase credentials are not configured, skip auth checks and return response
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()

    // If there's an auth error (invalid token, expired session, etc), clear cookies
    if (error) {
      console.log("[v0] Auth error in middleware:", error.message)
      // Clear all Supabase auth cookies
      const response = NextResponse.next({ request })
      const cookiesToClear = request.cookies
        .getAll()
        .filter((cookie) => cookie.name.includes("supabase") || cookie.name.includes("auth"))
      cookiesToClear.forEach(({ name }) => {
        response.cookies.delete(name)
      })
      supabaseResponse = response
    } else {
      user = data.user
    }
  } catch (error) {
    console.error("[v0] Unexpected error checking session:", error)
    // Clear cookies on unexpected errors too
    const response = NextResponse.next({ request })
    const cookiesToClear = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.includes("supabase") || cookie.name.includes("auth"))
    cookiesToClear.forEach(({ name }) => {
      response.cookies.delete(name)
    })
    supabaseResponse = response
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/gp-dashboard") ||
      request.nextUrl.pathname.startsWith("/specialist-dashboard") ||
      request.nextUrl.pathname.startsWith("/submit-case") ||
      request.nextUrl.pathname.startsWith("/gp/case") ||
      request.nextUrl.pathname.startsWith("/specialist/case"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

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
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          }),
        )
      },
    },
  })

  let user = null
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth check timeout")), 2000))
    const userPromise = supabase.auth.getUser()

    const result = (await Promise.race([userPromise, timeoutPromise]).catch((err) => {
      console.error("[v0] Middleware: Auth check failed, session may be corrupted:", err)
      return { data: { user: null }, error: err }
    })) as any

    user = result?.data?.user || null

    // If there's an error but cookies exist, clear them (corrupted session)
    if (!user && result?.error) {
      const hasCookies = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"))
      if (hasCookies) {
        console.log("[v0] Middleware: Detected corrupted session, clearing cookies")
        // Clear all Supabase cookies
        request.cookies.getAll().forEach((cookie) => {
          if (cookie.name.startsWith("sb-")) {
            supabaseResponse.cookies.delete(cookie.name)
          }
        })
      }
    }
  } catch (error) {
    console.error("[v0] Middleware: Error checking session:", error)
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/gp-dashboard") ||
      request.nextUrl.pathname.startsWith("/specialist-dashboard") ||
      request.nextUrl.pathname.startsWith("/submit-case") ||
      request.nextUrl.pathname.startsWith("/gp/case") ||
      request.nextUrl.pathname.startsWith("/specialist/case") ||
      request.nextUrl.pathname.startsWith("/settings"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

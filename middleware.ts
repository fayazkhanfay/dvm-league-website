import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Extract subdomain
  const subdomain = hostname.split(".")[0]

  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1")
  const isPreview = hostname.includes(".v0.app") || hostname.includes(".vercel.app")

  // Bypass subdomain routing in development and preview environments
  if (isLocalhost || isPreview) {
    return NextResponse.next()
  }

  // Define marketing pages (accessible on main domain dvmleague.com)
  const marketingPages = ["/", "/specialists", "/privacy-policy", "/terms-of-service"]

  const appPagePrefixes = [
    "/login",
    "/submit-case",
    "/submit-success",
    "/gp-dashboard",
    "/gp/case",
    "/specialist-dashboard",
    "/specialist/case",
    "/specialist/settings",
    "/settings",
    "/request-invitation",
  ]

  // Check if we're on the app subdomain
  const isAppSubdomain = subdomain === "app" || hostname.startsWith("app.")

  // Check if current path is an app page
  const isAppPage = appPagePrefixes.some((prefix) => url.pathname.startsWith(prefix))

  // Check if current path is a marketing page
  const isMarketingPage = marketingPages.includes(url.pathname)

  // If on app subdomain
  if (isAppSubdomain) {
    // Allow app pages
    if (isAppPage) {
      return NextResponse.next()
    }

    // Redirect marketing pages to main domain when accessed from app subdomain
    if (isMarketingPage) {
      url.hostname = "dvmleague.com"
      return NextResponse.redirect(url)
    }
  } else {
    // On main domain - allow marketing pages
    if (isMarketingPage) {
      return NextResponse.next()
    }

    // Redirect app pages to app subdomain when accessed from main domain
    if (isAppPage) {
      url.hostname = "app.dvmleague.com"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|monitoring).*)",
  ],
}

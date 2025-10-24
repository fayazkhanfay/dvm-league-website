import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Extract subdomain
  const subdomain = hostname.split(".")[0]

  // Define marketing pages (accessible on main domain)
  const marketingPages = ["/", "/specialists", "/privacy-policy", "/terms-of-service"]

  // Define app pages (accessible on app subdomain)
  const appPages = ["/request-invitation", "/standings"]

  // Check if we're on the app subdomain
  const isAppSubdomain = subdomain === "app" || hostname.startsWith("app.")

  // Check if we're on localhost (for development)
  const isLocalhost = hostname.includes("localhost")

  // If on app subdomain or localhost with app path
  if (isAppSubdomain || (isLocalhost && appPages.some((page) => url.pathname.startsWith(page)))) {
    // Allow app pages
    if (appPages.some((page) => url.pathname.startsWith(page))) {
      return NextResponse.next()
    }

    // Redirect marketing pages to main domain when accessed from app subdomain
    if (marketingPages.includes(url.pathname)) {
      if (!isLocalhost) {
        url.hostname = "dvmleague.com"
        return NextResponse.redirect(url)
      }
    }
  } else {
    // On main domain - allow marketing pages
    if (marketingPages.includes(url.pathname)) {
      return NextResponse.next()
    }

    // Redirect app pages to app subdomain when accessed from main domain
    if (appPages.some((page) => url.pathname.startsWith(page))) {
      if (!isLocalhost) {
        url.hostname = "app.dvmleague.com"
        return NextResponse.redirect(url)
      }
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

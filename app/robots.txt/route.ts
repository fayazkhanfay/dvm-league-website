import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const headers = request.headers
  const host = headers.get("host") // Get the domain the request came to

  let robotsContent = ""

  const isAppSubdomain = host?.startsWith("app.") || host?.includes("app.dvmleague.com")

  if (isAppSubdomain) {
    // App subdomain - Disallow everything
    robotsContent = `User-agent: *
Disallow: /
`
  } else {
    // Default (www.dvmleague.com or dvmleague.com) - Allow all, point to sitemap
    robotsContent = `User-agent: *
Disallow:

User-agent: Googlebot
Disallow:

User-agent: Bingbot
Disallow:

Sitemap: https://dvmleague.com/sitemap.xml
`
  }

  return new Response(robotsContent, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}

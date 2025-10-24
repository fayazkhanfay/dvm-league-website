import type { NextRequest } from "next/server"
import { globSync } from "glob"

const BASE_URL = "https://dvmleague.com"

interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?: "yearly" | "monthly" | "weekly" | "always" | "hourly" | "daily" | "never"
  priority?: number
}

export async function GET(request: NextRequest) {
  const staticPageFiles = globSync("app/**/page.tsx", {
    ignore: [
      "app/api/**",
      "app/sitemap.xml/**",
      "app/robots.txt/**",
      "app/request-invitation/**", // App subdomain page
      "app/standings/**", // App subdomain page
    ],
  })

  const staticUrls: SitemapEntry[] = staticPageFiles.map((pagePath) => {
    let route = pagePath.replace(/^app/, "").replace(/\/page\.tsx$/, "")
    if (route === "") route = "/"
    if (route !== "/" && route.endsWith("/")) route = route.slice(0, -1)

    let priority = 0.7
    let changefreq: SitemapEntry["changeFrequency"] = "monthly"

    if (route === "/") {
      priority = 1.0
      changefreq = "weekly"
    } else if (route === "/specialists") {
      priority = 0.8
    } else if (route === "/privacy-policy" || route === "/terms-of-service") {
      priority = 0.3
      changefreq = "yearly"
    }

    return {
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: changefreq,
      priority: priority,
    }
  })

  const allUrls = [...staticUrls]

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map((item) => {
      const lastMod =
        item.lastModified instanceof Date
          ? item.lastModified.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]

      return `
    <url>
      <loc>${item.url}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>${item.changeFrequency}</changefreq>
      <priority>${item.priority}</priority>
    </url>`
    })
    .join("")}
  </urlset>`

  return new Response(sitemapContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'; // Import NextResponse
import { globSync } from 'glob';

// Your website's base URL
const BASE_URL = 'https://www.dvmleague.com';

// Define the structure for Sitemap entry for clarity
interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'yearly' | 'monthly' | 'weekly' | 'always' | 'hourly' | 'daily' | 'never';
  priority?: number;
}

// Named export GET for the route handler
export async function GET(request: NextRequest) {
  // 1. Get static routes from the 'app' directory
  const staticPageFiles = globSync('app/**/page.tsx', {
    ignore: [
      'app/api/**', // Exclude API routes
      'app/sitemap.xml/**', // Exclude the sitemap file itself
      'app/robots.txt/**', // Exclude the robots.txt handler file
      'app/request-invitation/**', // Exclude the invitation page as decided
    ],
  });

  const staticUrls: SitemapEntry[] = staticPageFiles.map((pagePath) => { // Use the interface
    let route = pagePath
      .replace(/^app/, '')
      .replace(/\/page\.tsx$/, '');
    if (route === '') route = '/';
    if (route !== '/' && route.endsWith('/')) route = route.slice(0, -1);

    let priority = 0.7;
    let changefreq: SitemapEntry['changeFrequency'] = 'monthly'; // Type from interface

    if (route === '/') {
      priority = 1.0;
      changefreq = 'weekly';
    } else if (route === '/specialists') {
      priority = 0.8;
    } else if (route === '/privacy-policy' || route === '/terms-of-service') {
      priority = 0.3;
      changefreq = 'yearly';
    }

    return {
      url: `${BASE_URL}${route}`,
      lastModified: new Date(), // Using current date as a fallback
      changeFrequency: changefreq,
      priority: priority,
    };
  });

  // 2. Placeholder for dynamic routes (Blog Posts, Case Studies, etc.)
  //    const blogUrls: SitemapEntry[] = []; // Add logic here later

  // 3. Combine static and dynamic routes
  const allUrls = [
    ...staticUrls,
    // ...blogUrls, // Add dynamic URLs here when ready
  ];

  // 4. Generate the XML content
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map((item) => {
      // Format lastModified correctly
      const lastMod = item.lastModified instanceof Date
        ? item.lastModified.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]; // Fallback if not Date

      return `
    <url>
      <loc>${item.url}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>${item.changeFrequency}</changefreq>
      <priority>${item.priority}</priority>
    </url>`;
    })
    .join('')}
  </urlset>`;

  // 5. Return the Response object
  return new Response(sitemapContent, {
    status: 200, // Explicitly set success status
    headers: {
      'Content-Type': 'application/xml', // Use the correct XML content type
    },
  });
}
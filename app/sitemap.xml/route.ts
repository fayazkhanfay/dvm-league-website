import { MetadataRoute } from 'next';
import { globSync } from 'glob';

// Your website's base URL
const BASE_URL = 'https://www.dvmleague.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Get static routes from the 'app' directory
  const staticPageFiles = globSync('app/**/page.tsx', {
    ignore: [
      'app/api/**', // Exclude API routes
      'app/sitemap.xml/**', // Exclude the sitemap file itself
      'app/robots.txt/**', // Exclude the robots.txt handler file
      'app/request-invitation/**' // Exclude the invitation page as decided
    ],
  });

  const staticUrls = staticPageFiles.map((pagePath) => {
    let route = pagePath
      .replace(/^app/, '')
      .replace(/\/page\.tsx$/, '');
    if (route === '') route = '/';
     if (route !== '/' && route.endsWith('/')) route = route.slice(0, -1);

    let priority = 0.7;
    let changefreq: 'yearly' | 'monthly' | 'weekly' | 'always' | 'hourly' | 'daily' | 'never' = 'monthly';

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
  //    const blogUrls = []; // Add logic here later

  // 3. Combine static and dynamic routes
  return [
    ...staticUrls,
    // ...blogUrls, // Add dynamic URLs here when ready
  ];
}

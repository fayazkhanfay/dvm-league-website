import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const headers = request.headers;
  const host = headers.get('host'); // Get the domain the request came to

  let robotsContent = '';

  // Check if the request is for the 'app' subdomain
  if (host === 'app.dvmleague.com') {
    // App subdomain - Disallow everything
    robotsContent = `User-agent: *
Disallow: /
`;
  } else {
    // Default (www.dvmleague.com or other non-app domains) - Allow all, point to sitemap
    robotsContent = `User-agent: *
Disallow:

User-agent: Googlebot
Disallow:

User-agent: Bingbot
Disallow:

Sitemap: https://www.dvmleague.com/sitemap.xml
`;
  }

  return new Response(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

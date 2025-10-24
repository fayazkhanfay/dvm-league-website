# DVM League website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/fayazkhanfay-gmailcoms-projects/v0-dvm-league-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/XgPdFjSccze)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Architecture

The DVM League website uses a subdomain-based architecture to separate marketing and application experiences:

### Marketing Site (dvmleague.com)
- **Main Landing Page** (`/`) - Primary marketing page for general practitioners
- **Specialists Page** (`/specialists`) - Marketing page for specialists
- **Privacy Policy** (`/privacy-policy`) - Legal documentation
- **Terms of Service** (`/terms-of-service`) - Legal documentation

### Application Site (app.dvmleague.com)
- **Request Invitation** (`/request-invitation`) - Founder's Circle invitation form
- **Standings** (`/standings`) - Application feature for tracking league standings

### Routing Logic

The `middleware.ts` file handles automatic routing between domains:
- Marketing pages accessed on `app.dvmleague.com` redirect to `dvmleague.com`
- Application pages accessed on `dvmleague.com` redirect to `app.dvmleague.com`
- In development (localhost), all pages are accessible directly without redirects

### SEO Configuration

- **robots.txt**: Dynamically generated based on subdomain
  - Marketing site: Allows all crawlers, includes sitemap
  - App subdomain: Disallows all crawlers (private application)
- **sitemap.xml**: Only includes marketing pages for search engine indexing

## Local Development

To test subdomain routing locally:

1. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Access pages directly:
   - Marketing: `http://localhost:3000/`
   - Application: `http://localhost:3000/request-invitation`

3. To test actual subdomain behavior, add to your `/etc/hosts`:
   \`\`\`
   127.0.0.1 dvmleague.local
   127.0.0.1 app.dvmleague.local
   \`\`\`
   Then access `http://dvmleague.local:3000` and `http://app.dvmleague.local:3000`

## Deployment

Your project is live at:

**[https://vercel.com/fayazkhanfay-gmailcoms-projects/v0-dvm-league-website](https://vercel.com/fayazkhanfay-gmailcoms-projects/v0-dvm-league-website)**

### Vercel Domain Configuration

To enable subdomain routing in production:

1. Add both domains in Vercel project settings:
   - `dvmleague.com` (or `www.dvmleague.com`)
   - `app.dvmleague.com`

2. Configure DNS records:
   - `A` or `CNAME` record for `dvmleague.com` → Vercel
   - `CNAME` record for `app` subdomain → Vercel

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/XgPdFjSccze](https://v0.app/chat/projects/XgPdFjSccze)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

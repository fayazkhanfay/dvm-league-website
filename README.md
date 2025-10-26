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
- **Login** (`/login`) - User authentication
- **GP Dashboard** (`/gp-dashboard`) - General practitioner case management
- **Submit Case** (`/submit-case`) - Case submission form
- **Submit Success** (`/submit-success`) - Case submission confirmation
- **GP Case View** (`/gp/case/*`) - View case details and specialist reports
- **Specialist Dashboard** (`/specialist-dashboard`) - Specialist case management
- **Specialist Case View** (`/specialist/case/*`) - Review cases and submit reports
- **Settings** (`/settings`, `/specialist/settings`) - Account settings
- **Request Invitation** (`/request-invitation`) - Founder's Circle invitation form

### Routing Logic

The `middleware.ts` file handles automatic routing between domains:
- **Production**: Marketing pages accessed on `app.dvmleague.com` redirect to `dvmleague.com`, and application pages accessed on `dvmleague.com` redirect to `app.dvmleague.com`
- **Development (localhost)**: All pages are accessible directly without redirects for easier local testing

## Local Development

To develop locally:

1. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Access all pages directly on localhost:
   - Marketing pages: `http://localhost:3000/`, `http://localhost:3000/specialists`
   - Application pages: `http://localhost:3000/login`, `http://localhost:3000/gp-dashboard`, etc.

**Note**: In local development, subdomain routing is disabled. All pages are accessible via direct paths on `localhost:3000`. Subdomain separation only applies in production.

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

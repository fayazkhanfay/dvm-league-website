import type React from "react"
import type { Metadata } from "next"
import * as Sentry from "@sentry/nextjs"
import { EB_Garamond, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export function generateMetadata(): Metadata {
  return {
    title: "DVM League | Elite Specialist Consults for Veterinary Practices",
    description:
      "The B2B platform that empowers independent veterinarians to keep their most complex cases in-house with one dedicated specialist, from diagnosis to treatment.",
    generator: "Next.js",
    keywords: ["veterinary", "specialist", "consultation", "DVM", "veterinarian"],
    authors: [{ name: "DVM League" }],
    creator: "DVM League",
    publisher: "DVM League",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://dvmleague.com"),
    openGraph: {
      title: "DVM League | Elite Specialist Consults for Veterinary Practices",
      description:
        "The B2B platform that empowers independent veterinarians to keep their most complex cases in-house with one dedicated specialist, from diagnosis to treatment.",
      url: "https://dvmleague.com",
      siteName: "DVM League",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "DVM League | Elite Specialist Consults for Veterinary Practices",
      description:
        "The B2B platform that empowers independent veterinarians to keep their most complex cases in-house with one dedicated specialist, from diagnosis to treatment.",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      viewportFit: "cover",
    },
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#0A2240" },
      { media: "(prefers-color-scheme: dark)", color: "#0A2240" },
    ],
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "DVM League",
    },
    other: {
      ...Sentry.getTraceData(),
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable} antialiased`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DVM League" />
        <meta name="application-name" content="DVM League" />
        <meta name="msapplication-TileColor" content="#0A2240" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

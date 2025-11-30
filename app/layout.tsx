import type React from "react"
import type { Metadata, Viewport } from "next"
import { EB_Garamond, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "sonner"

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

export const metadata: Metadata = {
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://dvmleague.com",
  ),
  openGraph: {
    title: "DVM League | Elite Specialist Consults for Veterinary Practices",
    description:
      "The B2B platform that empowers independent veterinarians to keep their most complex cases in-house with one dedicated specialist, from diagnosis to treatment.",
    url: "https://dvmleague.com",
    siteName: "DVM League",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/dvm-league-logo.png",
        width: 1200,
        height: 630,
        alt: "DVM League",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DVM League | Elite Specialist Consults for Veterinary Practices",
    description:
      "The B2B platform that empowers independent veterinarians to keep their most complex cases in-house with one dedicated specialist, from diagnosis to treatment.",
    images: [
      {
        url: "/dvm-league-logo.png",
        width: 1200,
        height: 630,
        alt: "DVM League",
      },
    ],
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96" },
    ],
    apple: "/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/favicon.svg", color: "#0A2240" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DVM League",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A2240" },
    { media: "(prefers-color-scheme: dark)", color: "#0A2240" },
  ],
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
        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-4L5KQ0Y3KW" strategy="afterInteractive" />
        <Script id="ga-gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', 'G-4L5KQ0Y3KW');
          `}
        </Script>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DVM League, LLC",
              url: "https://dvmleague.com",
              logo: "https://dvmleague.com/dvm-league-logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                email: "khan@dvmleague.com",
                contactType: "Customer Service",
              },
              sameAs: [
                "https://www.linkedin.com/company/dvmleague",
                "https://www.instagram.com/dvmleague/",
                "https://www.facebook.com/DVMLeague/",
                "https://x.com/DvmLeague",
                "https://www.youtube.com/@DVMLeague",
              ],
            }),
          }}
        />
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
        <Toaster position="top-center" expand={true} richColors={true} duration={6000} closeButton={true} />
      </body>
    </html>
  )
}

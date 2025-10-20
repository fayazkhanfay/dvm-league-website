import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { SolutionSection } from "@/components/solution-section"
import { ROISection } from "@/components/roi-section"
import { TrustSection } from "@/components/trust-section"
import { CTASection } from "@/components/cta-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: "Keep Cases In-House: Veterinary Specialist Consult Platform | DVM League",
  description: "Stop losing revenue to referrals. DVM League connects GPs with elite specialists via text to manage complex cases in-house. Request your Founder's Circle invite.",
  keywords: ["veterinary specialist consultation", "keep vet cases in-house", "veterinary practice revenue", "veterinary referral alternative", "B2B veterinary services"], // More specific keywords
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
    <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Veterinary Specialist Consultation",
            "provider": {
              "@type": "Organization",
              "name": "DVM League, LLC",
              "url": "https://dvmleague.com"
            },
            "description": "B2B platform connecting General Practice veterinarians with board-certified specialists for text-based case consultations, enabling GPs to keep complex cases in-house.",
            "audience": {
              "@type": "Audience",
              "audienceType": "Veterinarians",
              "geographicArea": {
                 "@type": "Country",
                 "name": "USA"
              }
            },
            "areaServed": {
               "@type": "Country",
               "name": "USA"
            },
            "name": "DVM League Complete Case Consult",
            "url": "https://dvmleague.com/",
            "offers": [ 
              {
                "@type": "Offer",
                "name": "Introductory Offer: First Consult Free",
                "description": "Your first Complete Case Consult is free for any new GP clinic (Standard $395 value).",
                "price": "0",
                "priceCurrency": "USD",
                "category": "IntroductoryOffer",
                "url": "https://dvmleague.com/request-invitation" 
              },
              {
                "@type": "Offer",
                "name": "Standard Complete Case Consult",
                "description": "Comprehensive two-phase specialist consultation for returning clinics.",
                "price": "395.00",
                "priceCurrency": "USD",
                "availability": "https://schema.org/Online",
                "category": "Standard",
                "url": "https://dvmleague.com/" 
              }
            ]
          }),
        }}
      />
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ROISection />
        <TrustSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

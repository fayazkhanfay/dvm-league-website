import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { SolutionSection } from "@/components/solution-section"
import { ROISection } from "@/components/roi-section"
import { TrustSection } from "@/components/trust-section"
import { CTASection } from "@/components/cta-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { SentryTestButton } from "@/components/SentryTestButton"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
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
      {/* {process.env.NODE_ENV !== "production" ? <SentryTestButton /> : null} */}
      <SentryTestButton />
    </div>
  )
}

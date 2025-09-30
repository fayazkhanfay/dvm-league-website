import { SpecialistHeader } from "@/components/specialist-header"
import { SpecialistHeroSection } from "@/components/specialist-hero-section"
import { SpecialistPlatformSection } from "@/components/specialist-platform-section"
import { SpecialistValuePropsSection } from "@/components/specialist-value-props-section"
import { SpecialistFounderSection } from "@/components/specialist-founder-section"
import { SpecialistFAQSection } from "@/components/specialist-faq-section"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Join The League | DVM League",
  description:
    "A professional network for elite, board-certified veterinary specialists seeking a flexible, high-payout, and low-stress way to practice medicine.",
}

export default function SpecialistsPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <SpecialistHeader />
      <main>
        <SpecialistHeroSection />
        <SpecialistPlatformSection />
        <SpecialistValuePropsSection />
        <SpecialistFounderSection />
        <SpecialistFAQSection />
      </main>
      <Footer />
    </div>
  )
}

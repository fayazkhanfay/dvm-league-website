import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <Header />

      <main className="px-4 py-24 sm:py-32">
        <article className="mx-auto max-w-4xl animate-fade-in-rise">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="font-serif text-5xl font-bold text-brand-navy sm:text-6xl lg:text-7xl text-balance">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-brand-navy/60">Last Updated: September 26, 2025</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <div className="space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Welcome to DVM League. These Terms of Service ("Terms") govern your access to and use of the DVM
                  League website, platform, and consultation services (collectively, the "Services"), provided by DVM
                  League, LLC ("we," "us," or "our").
                </p>
                <p>
                  By creating an account or using our Services, you agree to be bound by these Terms and our Privacy
                  Policy. Please read them carefully.
                </p>
              </div>
            </section>

            {/* Section 1 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">1. Description of Services</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  DVM League provides a technology platform that connects licensed General Practice veterinarians
                  ("GPs") with a network of board-certified veterinary specialists ("Specialists") to facilitate
                  professional case consultations.
                </p>
                <p>
                  <strong className="font-bold text-brand-navy">IMPORTANT:</strong> DVM League is not a provider of
                  veterinary medicine or medical advice. We do not practice veterinary medicine. Our platform is a
                  conduit for communication and information sharing between licensed professionals. The responsibility
                  for all diagnoses, treatments, and patient care remains at all times with the treating veterinarian
                  (the GP), who may use the information from a consultation in their sole professional discretion.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                2. User Accounts and Eligibility
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  To use our Services, you must be a licensed veterinarian in good standing in at least one U.S. state.
                  By creating an account, you represent and warrant that:
                </p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>You hold a valid, active license to practice veterinary medicine.</li>
                  <li>All information you provide is accurate and complete.</li>
                  <li>
                    You will keep your account password confidential and are responsible for all activities that occur
                    under your account.
                  </li>
                  <li>
                    You will use the Services in a professional manner and in accordance with all applicable laws.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 - Founder's Promise */}
            <section className="rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-8 shadow-lg hover-glow sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                3. The Founder's Promise: First Consult Free
              </h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  For new, verified GP accounts, DVM League will cover the full cost of your first Complete Case Consult
                  as a professional courtesy to demonstrate the value of our Services. This offer is limited to one per
                  clinic, is subject to change, and may have certain restrictions.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                4. Scope of Consultations & Professional Responsibility
              </h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <ul className="ml-6 space-y-4 list-disc">
                  <li>
                    <strong className="font-bold text-brand-navy">For GPs:</strong> You are the primary veterinarian
                    responsible for your patient. Information and opinions provided by a Specialist through the Services
                    are for educational and informational purposes to support your own case management. You are solely
                    responsible for exercising your independent professional medical judgment in determining the best
                    course of treatment for your patient.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">For Specialists:</strong> You agree to provide your
                    professional insights and opinions based on the information provided by the GP. You acknowledge that
                    you are acting as a consultant and are not establishing a formal Veterinarian-Client-Patient
                    Relationship (VCPR) with the patient or pet owner.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">5. User Conduct and Content</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  You are solely responsible for the content you upload to the Services, including case files, medical
                  records, and communications ("User Content"). You agree not to upload any User Content that:
                </p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>Violates any applicable law or regulation.</li>
                  <li>Infringes on any third party's intellectual property or privacy rights.</li>
                  <li>Is unlawful, defamatory, or fraudulent.</li>
                </ul>
                <p>
                  You retain ownership of your User Content. However, you grant DVM League a limited, non-exclusive
                  license to use, store, and display your User Content solely for the purpose of providing and improving
                  the Services.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">6. Confidentiality</h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  All patient and case information shared through the Services is considered confidential. Both GPs and
                  Specialists agree to maintain the confidentiality of this information and use it only for the purpose
                  of the consultation.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                7. Disclaimers and Limitation of Liability
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                  IMPLIED.
                </p>
                <p>
                  TO THE FULLEST EXTENT PERMITTED BY LAW, DVM LEAGUE, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                  INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
                  RESULTING FROM (A) YOUR USE OF THE SERVICES; (B) THE PROFESSIONAL OPINIONS OR CONDUCT OF ANY GP OR
                  SPECIALIST USING THE SERVICES; (C) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS.
                </p>
                <p>
                  IN NO EVENT SHALL DVM LEAGUE'S AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES EXCEED THE
                  GREATER OF ONE HUNDRED U.S. DOLLARS ($100.00) OR THE AMOUNTS PAID BY YOU TO DVM LEAGUE IN THE 12
                  MONTHS PRIOR TO THE CLAIM.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">8. Indemnification</h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  You agree to defend, indemnify, and hold harmless DVM League, LLC and its team from and against any
                  claims, liabilities, damages, and costs (including reasonable attorney's fees) arising from your use
                  of the Services or your violation of these Terms.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                9. Governing Law and Dispute Resolution
              </h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  These Terms shall be governed by the laws of the State in which DVM League, LLC is registered, without
                  regard to its conflict of law principles. Any dispute arising from these Terms will be resolved
                  through binding arbitration in that state, rather than in court.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">10. Termination</h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  You may close your account at any time. We reserve the right to suspend or terminate your account if
                  you violate these Terms or use the Services in a way that creates legal or operational risk for us.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">11. Changes to These Terms</h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  We may modify these Terms from time to time. We will provide notice of any material changes by posting
                  the new Terms on our site. Your continued use of the Services after such changes constitutes your
                  acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Section 12 - Contact */}
            <section className="rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-8 shadow-lg hover-glow sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">12. Contact Us</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>If you have any questions about these Terms of Service, please contact us.</p>
                <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
                  <p className="font-bold text-brand-navy">Khan</p>
                  <p className="text-brand-navy/80">Founder, DVM League</p>
                  <a
                    href="mailto:khan@dvmleague.com"
                    className="mt-2 inline-block font-bold text-brand-red transition-colors hover:text-brand-navy hover:underline"
                  >
                    khan@dvmleague.com
                  </a>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
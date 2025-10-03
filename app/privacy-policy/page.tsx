import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <Header />

      <main className="px-4 py-24 sm:py-32">
        <article className="mx-auto max-w-4xl animate-fade-in-rise">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="font-serif text-5xl font-bold text-brand-navy sm:text-6xl lg:text-7xl text-balance">
              Platform Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-brand-navy/60">Last Updated: October 3, 2025</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">1. Introduction</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Welcome to DVM League. This Privacy Policy explains how DVM League, LLC ("we," "us," or "our")
                  collects, uses, shares, and protects information in connection with our website, platform, and
                  services (collectively, the "Services").
                </p>
                <p>
                  This policy is designed to be clear and transparent, whether you are a visitor to our site, a General
                  Practitioner (GP) creating an account, or a board-certified Specialist applying to join our network.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                2. Information We Collect
              </h2>
              <div className="mt-6 space-y-6 text-lg leading-relaxed text-brand-navy/90">
                <p>We collect information necessary to provide our specialized, professional Services:</p>

                <div>
                  <h3 className="text-xl font-bold text-brand-navy">A. Information You Provide to Us Directly</h3>
                  <ul className="ml-6 mt-3 space-y-3 list-disc">
                    <li>
                      <strong className="font-bold text-brand-navy">GP Account Information:</strong> When you
                      create an account, we collect your full name, clinic name, professional email address, state(s)
                      of licensure, and a password you create.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Specialist Application Information:</strong> When
                      you apply to join our network, we collect your professional contact information, Curriculum Vitae
                      (CV), specialty, states of licensure, and professional credentials for verification purposes.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Case Data:</strong> To facilitate a consult, GPs
                      upload case-specific information, which includes patient medical records, diagnostic images, and
                      other clinical data ("Case Data"). This may incidentally include pet owner information provided by the GP.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Payment Information:</strong> When a GP makes a
                      purchase, payment details are collected and processed directly by our third-party payment
                      processor, Stripe. We do not store your credit card information on our servers.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-brand-navy">
                    B. Information We Collect Automatically
                  </h3>
                  <p className="mt-3">
                    When you use our Services, we automatically collect certain technical information from your device,
                    including log and usage data (e.g., IP address, browser type) and use essential cookies to maintain
                    session information and secure your account. We do not use third-party tracking or advertising
                    cookies.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                3. How We Use Your Information
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>Our use of your information is strictly for professional purposes:</p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>
                    <strong className="font-bold text-brand-navy">To Provide and Secure the Services:</strong> To
                    create and manage accounts, facilitate consultations, process payments, and monitor for security
                    threats.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">To Evaluate Specialist Applicants:</strong> To review
                    applications and verify credentials.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">To Communicate With You:</strong> To send essential
                    service-related notifications and respond to your inquiries.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">To Improve Our Services:</strong> To analyze usage
                    trends internally to improve platform functionality. Case Data may be de-identified and used for
                    internal research and training purposes.
                  </li>
                </ul>
                <p className="pt-2">
                  <strong className="font-bold text-brand-red">
                    We will never sell your personal or professional information to third parties.
                  </strong>
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                4. How We Share Your Information
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>We only share information under the following limited circumstances:</p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>
                    <strong className="font-bold text-brand-navy">Between GPs and Specialists:</strong> The core function
                    of our platform is to share Case Data provided by a GP with the engaged Specialist to facilitate the
                    consultation.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">Service Providers:</strong> We use trusted third-party
                    vendors who perform essential services on our behalf. These include Vercel (web hosting), Supabase
                    (database and storage), Stripe (payment and payout processing), and Google Workspace (for Specialist
                    application intake). These providers are contractually obligated to protect your information.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">Legal Compliance and Protection:</strong> We may
                    disclose information if required by law or to protect the rights, property, or safety of DVM League,
                    our users, or the public.
                  </li>
                </ul>
              </div>
            </section>
            {/* Section 5 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                5. Data Security and Retention
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  We employ robust technical and administrative security measures, including database encryption and
                  row-level security, to protect your information. However, no method of transmission over the internet
                  is 100% secure.
                </p>
                <p>
                  We retain your account information for as long as your account is active. Case Data is retained in
                  accordance with professional record-keeping standards. Application data for Specialists who are not
                  onboarded is retained for 24 months for consideration in future opportunities, unless deletion is
                  requested sooner.
                </p>
              </div>
            </section>
            
            {/* Section 6 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">6. HIPAA Non-Applicability</h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                    <p>
                        The Health Insurance Portability and Accountability Act (HIPAA) applies to human health information. It does not apply to veterinary medical records. While we are not a HIPAA-covered entity, we are committed to upholding a high standard of confidentiality and security for all data on our platform, consistent with our professional and ethical obligations.
                    </p>
                </div>
            </section>

            {/* Section 7 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">7. Your U.S. Privacy Rights</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Depending on your state of residence (e.g., California, Colorado, Virginia), you may have certain
                  rights regarding your personal information, such as the right to access, correct, or delete your
                  data, subject to certain exceptions (such as our need to retain records for legal or professional
                  reasons).
                </p>
                <p>
                  To exercise any of these rights, please contact us. We will not discriminate against you for
                  exercising your privacy rights.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">8. Children's Privacy</h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Our Services are intended exclusively for a licensed professional audience and are not directed to
                  children under the age of 16. We do not knowingly collect personal information from children.
                </p>
              </div>
            </section>

            {/* NEW Section 9 - International Data Transfers */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                9. International Data Transfers
              </h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Our Services are hosted and operated in the United States. If you are using the Services from outside
                  the U.S., please be aware that your information will be transferred to, stored, and processed in the
                  United States, where our servers are located and our central database is operated. The data protection
                  laws of the U.S. may differ from those in your country of residence.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                10. Changes to This Privacy Policy
              </h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  We may update this Privacy Policy from time to time. The "Last Updated" date at the top of this policy
                  will indicate when it was last revised. For material changes, we will notify you through the platform
                  or via email.
                </p>
              </div>
            </section>

            {/* Section 11 - Contact */}
            <section className="rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-8 shadow-lg hover-glow sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">11. Contact Us</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us.
                </p>
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
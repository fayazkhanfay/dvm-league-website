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
            <p className="mt-4 text-lg text-brand-navy/60">Last Updated: September 26, 2025</p>
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
                  Our brand is built on a foundation of professional trust. This policy is designed to be clear and
                  transparent, whether you are a visitor to our site, a General Practitioner (GP) creating an account,
                  or a board-certified Specialist applying to join our network.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">2. Scope of This Policy</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>This policy applies to all users of our Services, including:</p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>
                    <strong className="font-bold text-brand-navy">Website Visitors:</strong> Individuals who browse our
                    website.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">General Practitioners ("GPs"):</strong> Licensed
                    veterinarians who register for an account to use our consultation services.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">Specialist Applicants:</strong> Board-certified
                    veterinary specialists who apply for a paid advisory role or to join our network.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                3. The Information We Collect
              </h2>
              <div className="mt-6 space-y-6 text-lg leading-relaxed text-brand-navy/90">
                <p>We collect information in a few different ways:</p>

                <div>
                  <h3 className="text-xl font-bold text-brand-navy">A. Information You Provide to Us Directly</h3>
                  <ul className="ml-6 mt-3 space-y-3 list-disc">
                    <li>
                      <strong className="font-bold text-brand-navy">For General Practitioners (GPs):</strong> When you
                      create an account, we collect your full name, clinic name, work email address, and a password you
                      create. To provide the Services, we may also collect case-specific information you choose to
                      upload, which may include patient medical records.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">For Specialist Applicants:</strong> When you apply
                      to join our network, we collect your professional contact information (name, email, phone), your
                      Curriculum Vitae (CV), your specialty, states of licensure and license number, and your answers to
                      our qualitative "mindset" questions.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-brand-navy">
                    B. Information We Collect Automatically (Technical Data)
                  </h3>
                  <p className="mt-3">
                    Like most websites, when you visit our site or use our platform, we automatically collect certain
                    information from your device. This includes:
                  </p>
                  <ul className="ml-6 mt-3 space-y-3 list-disc">
                    <li>
                      <strong className="font-bold text-brand-navy">Log and Usage Data:</strong> Information such as
                      your IP address, browser type, operating system, pages viewed, and the dates/times of your visits.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Cookies and Similar Technologies:</strong> We use
                      cookies, which are small text files stored on your device, to help our website function, remember
                      your preferences, and understand how visitors use our site. We use this data to improve the user
                      experience. You can typically control the use of cookies at the browser level.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                4. How We Use Your Information
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>Our use of your information is tied to the service you are receiving:</p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>
                    <strong className="font-bold text-brand-navy">To Provide and Operate the Services:</strong> To
                    create and manage user accounts, facilitate consultations between GPs and Specialists, and process
                    payments.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">To Evaluate Specialist Candidacy:</strong> To review
                    applications from specialists, verify credentials, and assess their fit for our platform.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">To Communicate With You:</strong> To respond to your
                    inquiries, send you service-related announcements, and provide customer support.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">To Improve Our Platform:</strong> To analyze usage
                    trends and improve the design, functionality, and security of our Services.
                  </li>
                </ul>
                <p className="pt-2">
                  <strong className="font-bold text-brand-red">
                    We will never sell your personal information to third parties.
                  </strong>
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                5. How We Share Your Information
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>We only share information in the following limited circumstances:</p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>
                    <strong className="font-bold text-brand-navy">Service Providers:</strong> We may share information
                    with trusted third-party vendors who perform services on our behalf, such as web hosting, data
                    storage (e.g., Google Workspace, Amazon Web Services), and analytics. These providers are
                    contractually obligated to protect your information and use it only for the services we request.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">Business Operations:</strong> The core function of our
                    platform is to connect GPs with Specialists. As such, information necessary to facilitate a
                    consultation (such as case files and professional contact information) will be shared between the
                    engaged parties.
                  </li>
                  <li>
                    <strong className="font-bold text-brand-navy">Legal Compliance:</strong> We may disclose information
                    if required to do so by law or in the good-faith belief that such action is necessary to comply with
                    a legal obligation, protect our rights, or defend against legal liability.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                6. Data Security and Retention
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  We employ reasonable administrative and technical security measures to protect your information from
                  loss, misuse, and unauthorized access.
                </p>
                <p>
                  We retain your information for as long as necessary to fulfill the purposes outlined in this policy.
                  For account holders, this means we retain your data as long as your account is active or as needed to
                  provide you with Services. For specialist applicants not selected, we will retain application data for
                  a maximum of 24 months for consideration in future opportunities, unless you request its deletion
                  sooner.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">7. Your U.S. Privacy Rights</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Depending on your state of residence (e.g., California), you may have certain rights regarding your
                  personal information. These rights may include:
                </p>
                <ul className="ml-6 space-y-3 list-disc">
                  <li>The right to know what personal information we have collected about you.</li>
                  <li>The right to delete your personal information, subject to certain exceptions.</li>
                  <li>The right to correct inaccurate information.</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the information in the "Contact Us" section
                  below. We will not discriminate against you for exercising your privacy rights.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">8. Children's Privacy</h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  Our Services are intended for a professional audience and are not directed to children under the age
                  of 16. We do not knowingly collect personal information from children.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                9. Changes to This Privacy Policy
              </h2>
              <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  We may update this Privacy Policy from time to time. The "Last Updated" date at the top of this policy
                  will indicate when it was last revised. We encourage you to review this policy periodically.
                </p>
              </div>
            </section>

            {/* Section 10 - Contact */}
            <section className="rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-8 shadow-lg hover-glow sm:p-10">
              <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">10. Contact Us</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please do not hesitate to
                  contact our founder directly.
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

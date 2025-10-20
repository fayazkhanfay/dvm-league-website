import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service | DVM League",
  description: "Read the DVM League Terms of Service governing the use of our veterinary specialist consultation platform for General Practitioners and Specialists.",
  robots: { 
    index: true,
    follow: true,
  },
   alternates: {
    canonical: '/terms-of-service',
  },
};

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
              <p className="mt-4 text-lg text-brand-navy/60">Last Updated: October 3, 2025</p>
            </div>
  
            {/* Content Sections */}
            <div className="space-y-12">
              {/* Introduction */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <div className="space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    Welcome to DVM League. These Terms of Service ("Terms") govern your access to and use of the DVM
                    League website, platform, and consultation services (collectively, the "Services"), provided by DVM
                    League, LLC, a Pennsylvania Limited Liability Company ("we," "us," or "our").
                  </p>
                  <p>
                    By creating an account or using our Services, you agree to be bound by these Terms and our Privacy
                    Policy. If you do not agree to these Terms, you may not use the Services.
                  </p>
                </div>
              </section>
  
              {/* Section 1 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">1. Description of Services</h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    DVM League provides a business-to-business technology platform that connects licensed General
                    Practice veterinarians ("GPs," "you," or "User") with a network of independent, U.S.-based,
                    board-certified veterinary specialists ("Specialists") to facilitate professional case consultations.
                  </p>
                  <p>
                    <strong className="font-bold text-brand-navy underline">IMPORTANT ACKNOWLEDGEMENT:</strong> DVM
                    League is not a provider of veterinary medical services. We do not practice veterinary medicine or
                    maintain any Veterinarian-Client-Patient Relationship (VCPR). Our platform is solely a conduit for
                    communication and information sharing between licensed professionals.{" "}
                    <strong className="font-bold text-brand-navy">
                      The legal and professional responsibility for all diagnoses, treatments, procedures, and patient
                      care remains at all times with the treating veterinarian (the GP).
                    </strong>
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
                    <li>
                      You hold a valid, unencumbered license to practice veterinary medicine and will maintain this
                      status for the duration of your use of the Services.
                    </li>
                    <li>All information you provide during registration and thereafter is accurate and complete.</li>
                    <li>
                      You will maintain the confidentiality of your account credentials and are solely responsible for
                      all activities that occur under your account.
                    </li>
                    <li>
                      You will use the Services in a professional manner and in accordance with all applicable federal,
                      state, and local laws and regulations.
                    </li>
                  </ul>
                </div>
              </section>
  
              {/* Section 3 - Service Levels */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  3. Service Levels and Guarantees
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    DVM League is committed to providing a reliable and professional service. The following terms apply
                    to our service commitments:
                  </p>
                  <ul className="ml-6 space-y-4 list-disc">
                    <li>
                      <strong className="font-bold text-brand-navy">Service Level Agreement (SLA):</strong> We will make
                      commercially reasonable efforts to meet the following timelines for paid consults: Phase 1 (The
                      Diagnostic Plan) will be delivered within one to two (1-2) business days of your complete case
                      submission. Phase 2 (The Complete Treatment Plan) will be delivered by 9:00 AM Eastern Time on the
                      next business morning following your upload of complete diagnostic results. These timelines are our
                      goal and not a binding guarantee; delays may occur due to circumstances outside of our control.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Continuity Guarantee:</strong> We guarantee that the
                      same Specialist will be your dedicated partner for both phases of a single Complete Case Consult
                      under all normal circumstances. In the rare event of a Specialist's unforeseen emergency or
                      unavailability, we reserve the right to assign a new, equally qualified Specialist to complete the
                      case after providing you with notification.
                    </li>
                  </ul>
                </div>
              </section>
  
              {/* Section 4 - Fees and Promotions */}
              <section className="rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-8 shadow-lg hover-glow sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  4. Fees, Payments, and Promotions
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <ul className="ml-6 space-y-4 list-disc">
                    <li>
                      <strong className="font-bold text-brand-navy">Fees:</strong> Fees for paid Services will be as
                      stated on the platform at the time of purchase. You agree to pay all applicable fees for the
                      Services you select.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Introductory Offer (First Consult Free):</strong> DVM
                      League may, at its sole discretion, offer a complimentary first Complete Case Consult to new
                      clinics ("Introductory Offer"). This offer is limited to one (1) per clinic or practice entity, has
                      no cash value, and is intended for you to evaluate the Services. We reserve the right to modify or
                      terminate this offer at any time.
                    </li>
                    <li>
                      <strong className="font-bold text-brand-navy">Satisfaction Guarantee for Paid Consults:</strong> For
                      all paid consults after the Introductory Offer, we provide a satisfaction guarantee. If you are not
                      100% satisfied with the quality, professionalism, or timeliness of our service, you may request a
                      full refund of that consult's fee. Refund requests must be submitted in writing to us within seven
                      (7) calendar days of receiving the final Phase 2 report.{" "}
                      <strong className="underline">
                        This guarantee applies exclusively to the quality of the consultation service and does not, under
                        any circumstances, warrant or guarantee a specific clinical outcome for the patient.
                      </strong>
                    </li>
                  </ul>
                </div>
              </section>
  
              {/* Section 5 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  5. VCPR and Professional Responsibility
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <p>By using the Services, you expressly acknowledge, agree, and warrant that:</p>
                  <ul className="ml-6 space-y-4 list-disc">
                    <li>
                      You, the GP, are the primary veterinarian and at all times maintain the VCPR with the patient and
                      client. You are the sole doctor of record.
                    </li>
                    <li>
                      The information and opinions provided by a Specialist are for educational and informational
                      purposes only and constitute B2B consultation between licensed professionals. This information is
                      intended to support, not replace, your own professional medical judgment.
                    </li>
                    <li>
                      You are solely responsible for all clinical decisions, diagnoses, treatments, procedures, and
                      outcomes for your patient. You are also solely responsible for all communications with the pet
                      owner.
                    </li>
                    <li>
                      You acknowledge that Specialists are acting as independent contractors providing consultation to
                      you, not practicing medicine on your patient or establishing a VCPR.
                    </li>
                  </ul>
                </div>
              </section>
  
              {/* Section 6 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">6. User Content</h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    You are solely responsible for the case files, medical records, and communications ("User Content")
                    you upload. You agree not to upload any User Content that violates any law or infringes on any third
                    party's rights. As a best practice, you should take reasonable steps to de-identify personal client
                    information from User Content where not clinically necessary. You retain ownership of your User
                    Content but grant DVM League a limited, non-exclusive license to use it solely for the purpose of
                    providing and improving the Services.
                  </p>
                </div>
              </section>
  
              {/* Section 7 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">7. Confidentiality</h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    All patient and case information shared through the Services is considered confidential. Both GPs and
                    Specialists agree to maintain the confidentiality of this information and use it only for the purpose
                    of the consultation.
                  </p>
                </div>
              </section>
  
              {/* Section 8 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  8. Disclaimers and Limitation of Liability
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                    IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A
                    PARTICULAR PURPOSE.
                  </p>
                  <p className="font-bold text-brand-navy">
                    DVM LEAGUE IS A TECHNOLOGY PLATFORM, NOT A MEDICAL PROVIDER. WE ARE NOT ENGAGED IN THE PRACTICE OF
                    VETERINARY MEDICINE AND SHALL NOT BE HELD LIABLE FOR THE VETERINARY MALPRACTICE OF ANY GP OR SPECIALIST
                    USING OUR SERVICES.
                  </p>
                  <p>
                    TO THE FULLEST EXTENT PERMITTED BY LAW, DVM LEAGUE, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
                  </p>
                  <p>
                    IN NO EVENT SHALL DVM LEAGUE'S AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES EXCEED THE
                    GREATER OF ONE HUNDRED U.S. DOLLARS ($100.00) OR THE AMOUNTS PAID BY YOU TO DVM LEAGUE IN THE 12 MONTHS
                    PRIOR TO THE CLAIM.
                  </p>
                </div>
              </section>
  
              {/* Section 9 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">9. Indemnification</h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    You agree to defend, indemnify, and hold harmless DVM League, LLC, its officers, directors,
                    employees, and agents, from and against any claims, liabilities, damages, losses, and expenses,
                    including, without limitation, reasonable legal and accounting fees, arising out of or in any way
                    connected with (i) your access to or use of the Services, (ii) your violation of these Terms, or (iii)
                    any claim of veterinary malpractice or professional negligence arising from your clinical decisions,
                    procedures, or patient outcomes, regardless of whether such decisions were based in part on
                    information received through the Services.
                  </p>
                </div>
              </section>
  
              {/* Section 10 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  10. Governing Law and Dispute Resolution
                </h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    These Terms shall be governed by the laws of the{" "}
                    <strong className="font-bold text-brand-navy">Commonwealth of Pennsylvania</strong>, without regard
                    to its conflict of law principles. Any dispute, claim or controversy arising out of or relating to
                    these Terms will be resolved exclusively through final and binding arbitration administered in{" "}
                    <strong className="font-bold text-brand-navy">Philadelphia, Pennsylvania</strong>.
                  </p>
                </div>
              </section>
  
              {/* Section 11 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">11. Termination</h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    You may close your account at any time. We reserve the right to suspend or terminate your access to
                    the Services at any time, with or without cause or notice to you, particularly if you violate these
                    Terms.
                  </p>
                </div>
              </section>
  
              {/* Section 12 */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">12. Changes to These Terms</h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    We may modify these Terms from time to time. If we make material changes, we will provide you with
                    notice through the Services or by other means. Your continued use of the Services after the effective
                    date of the changes constitutes your acceptance of the new Terms.
                  </p>
                </div>
              </section>
  
              {/* Section 13 - Intellectual Property */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  13. Intellectual Property Rights
                </h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    All rights, title, and interest in and to the Services, including our website, branding, logos,
                    and software, are and will remain the exclusive property of DVM League, LLC. The Services are
                    protected by copyright, trademark, and other laws of the United States. You may not use our name
                    or trademarks without our prior written consent. We grant you a limited, non-exclusive, non-transferable,
                    revocable license to use the Services for their intended professional purpose.
                  </p>
                </div>
              </section>
  
              {/* Section 14 - Entire Agreement */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  14. Entire Agreement
                </h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    These Terms constitute the entire and exclusive understanding and agreement between DVM League and
                    you regarding the Services, and these Terms supersede and replace any and all prior oral or written
                    understandings or agreements between DVM League and you regarding the Services.
                  </p>
                </div>
              </section>
  
              {/* Section 15 - Severability */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  15. Severability
                </h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    If any provision of these Terms is held to be invalid or unenforceable by a court of competent
                    jurisdiction, then that provision will be enforced to the maximum extent permissible and the other
                    provisions of these Terms will remain in full force and effect.
                  </p>
                </div>
              </section>
  
              {/* Section 16 - Force Majeure */}
              <section className="rounded-lg border-2 border-brand-stone bg-white p-8 shadow-lg hover-lift sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
                  16. Force Majeure
                </h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>
                    DVM League shall not be liable for any delay or failure to perform resulting from causes outside its
                    reasonable control, including, but not limited to, acts of God, war, terrorism, riots, embargos, acts
                    of civil or military authorities, fire, floods, accidents, or failures of telecommunications or
                    internet service providers.
                  </p>
                </div>
              </section>
  
              {/* Section 17 - Contact */}
              <section className="rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-8 shadow-lg hover-glow sm:p-10">
                <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">17. Contact Us</h2>
                <div className="mt-6 text-lg leading-relaxed text-brand-navy/90">
                  <p>If you have any questions about these Terms, please contact us at khan@dvmleague.com.</p>
                </div>
              </section>
            </div>
          </article>
        </main>
  
        <Footer />
      </div>
    )
  }

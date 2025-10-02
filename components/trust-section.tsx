export function TrustSection() {
  return (
    <section id="specialists" className="py-24 sm:py-32 bg-brand-offwhite">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl text-brand-navy text-balance">
          The American Standard of Care.
        </h2>
        <p className="mt-6 text-lg text-brand-navy/90 leading-relaxed text-pretty">
          Our entire model is built on professional trust and legal clarity. We only partner with seasoned, U.S.-based,
          board-certified clinicians.
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <img
            src="/vet-lab-coat.png"
            alt="A veterinarian looking intently at a microscope."
            className="rounded-lg shadow-md w-full h-auto object-cover aspect-square"
          />
          <img
            src="/placeholder.svg?height=400&width=400&text=Surgical+Precision"
            alt="A close-up of a surgeon's gloved hands in a sterile environment."
            className="rounded-lg shadow-md w-full h-auto object-cover aspect-square"
          />
          <img
            src="/insurance-badge-v3.png"
            alt="A modern shield icon verifying that DVM League specialists are professionally insured."
            className="rounded-lg shadow-md w-full h-auto object-cover aspect-square"
          />
          <img
            src="/dvm-experience.png"
            alt="A professional seal verifying 5-7+ Years Post-Residency Experience' for DVM League specialists."
            className="rounded-lg shadow-md w-full h-auto object-cover aspect-square"
          />
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-stone">
            <h3 className="font-bold text-brand-navy">Board-Certified Diplomates</h3>
            <p className="mt-2 text-sm text-brand-navy/80">
              Every specialist is an active diplomate of their respective AVMA-recognized specialty college.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-stone">
            <h3 className="font-bold text-brand-navy">5-7+ Years Clinical Experience</h3>
            <p className="mt-2 text-sm text-brand-navy/80">
              We partner with seasoned clinicians, not recent graduates. You get real-world, practical expertise.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-stone">
            <h3 className="font-bold text-brand-navy">GP is Doctor of Record</h3>
            <p className="mt-2 text-sm text-brand-navy/80">
            You always maintain the VCPR and the case never leaves your building. Our service is a documented, expert consultation that empowers your in-house decisions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-stone">
            <h3 className="font-bold text-brand-navy">Exclusively U.S.-Based & Insured</h3>
            <p className="mt-2 text-sm text-brand-navy/80">
              All specialists are U.S.-based and carry their own professional liability insurance.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <a
            href="/specialists"
            className="text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors"
          >
            Specialists: Apply to The League →
          </a>
        </div>
      </div>
    </section>
  )
}

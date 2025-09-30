"use client"

export function SpecialistFAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-white border-t border-brand-stone">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 animate-fade-in-rise">
        <h2 className="text-center font-serif text-5xl font-bold tracking-tight text-brand-navy text-balance">
          Your Questions, Answered
        </h2>
        <div className="mt-12 space-y-4">
          <div className="p-6 bg-brand-offwhite/80 rounded-lg border border-brand-stone hover:border-brand-navy/20 hover:shadow-sm transition-all">
            <h3 className="font-bold text-brand-navy">What is the typical case volume I can expect?</h3>
            <p className="mt-2 text-sm text-brand-navy/90">
              Think of this as a private practice, not a public emergency room. Our concierge model means we only bring
              you a curated stream of high-quality, interesting cases. We prioritize our founding partners, so you will
              always have the first opportunity to take on the best work.
            </p>
          </div>
          <div className="p-6 bg-brand-offwhite/80 rounded-lg border border-brand-stone hover:border-brand-navy/20 hover:shadow-sm transition-all">
            <h3 className="font-bold text-brand-navy">What are the tax implications?</h3>
            <p className="mt-2 text-sm text-brand-navy/90">
              Simple. You operate as an independent contractor. We handle all GP billing and provide a single, automated
              Form 1099 at the end of the year.
            </p>
          </div>
          <div className="p-6 bg-brand-offwhite/80 rounded-lg border border-brand-stone hover:border-brand-navy/20 hover:shadow-sm transition-all">
            <h3 className="font-bold text-brand-navy">What happens if a GP complains about my report?</h3>
            <p className="mt-2 text-sm text-brand-navy/90">
              We have your back. Any concern is handled personally and confidentially by our founder. We understand the
              crucial difference between a simple difference of medical opinion and a true lapse in quality, and we will
              never penalize you for the former.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

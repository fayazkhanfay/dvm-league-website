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
            <h3 className="font-bold text-brand-navy">What exactly is the "Paid Advisory Role" and what is expected of me?</h3>
            <p className="mt-2 text-sm text-brand-navy/90">
            The Paid Advisory Role is a professional, <strong>paid engagement</strong> on our Founding Advisory Board. We are a founder-led company, and we believe the only way to build a world-class platform is to get direct feedback from the experts who will use it.
            <br/><br/>
            The core of this <strong>engagement</strong> is a single 60-minute advisory video call. This is a structured conversation with our founder to get your expert opinion on our workflow and business model. There is no sales pitch. At the end of the call, you will be invited to join the DVM League as a founding specialist, but there is absolutely no obligation to do so.
            </p>
          </div>
          <div className="p-6 bg-brand-offwhite/80 rounded-lg border border-brand-stone hover:border-brand-navy/20 hover:shadow-sm transition-all">
            <h3 className="font-bold text-brand-navy">What is the purpose of the initial questionnaire?</h3>
            <p className="mt-2 text-sm text-brand-navy/90">
            Our questionnaire is designed to do one thing: respect your time. It is a tool to ensure we are only speaking with 
            board-certified specialists whose professional goals (flexibility, autonomy, high-value work) are a perfect match 
            for the unique model we have built. It allows us to have a highly productive, relevant conversation with the right 
            group of experts from the very start.
            </p>
          </div>
          <div className="p-6 bg-brand-offwhite/80 rounded-lg border border-brand-stone hover:border-brand-navy/20 hover:shadow-sm transition-all">
            <h3 className="font-bold text-brand-navy">What is the typical case volume I can expect?</h3>
            <p className="mt-2 text-sm text-brand-navy/90">
            Think of this as a private practice, not a public emergency room. Our model is built on quality, so we only accept high-value, interesting
            cases onto the platform. When a new case is approved, it's announced to all specialists in that field. This gives you the opportunity to 
            claim the work that fits your schedule and interests on a first-come, first-served basis.
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

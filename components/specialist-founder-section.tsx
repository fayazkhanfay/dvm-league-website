"use client"

export function SpecialistFounderSection() {
  return (
    <section id="apply" className="py-24 sm:py-32 bg-brand-stone">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 animate-fade-in-rise">
        <div className="text-center">
          <h2 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl text-brand-navy text-balance">
            A Personal Invitation from Our Founder.
          </h2>
          <p className="mt-6 text-lg text-brand-navy/90 leading-relaxed max-w-3xl mx-auto text-pretty">
            "We aren't just building another platform; we are building a true professional league. That's why our
            recruitment process begins with a paid, professional conversation. I want to invest in your expertise to
            help us build a service you will actually love to use."
          </p>
        </div>
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Founder Headshot */}
          <div className="text-center flex-shrink-0">
            <img
              src="/fayaz-khan-profile.png"
              alt="Headshot of Fayaz Khan, Founder of DVM League"
              className="rounded-full w-48 h-48 mx-auto shadow-xl border-4 border-white"
            />
            <h3 className="mt-4 text-xl font-bold text-brand-navy">Fayaz Khan</h3>
            <p className="text-sm font-semibold text-brand-navy/80">Founder, DVM League</p>
          </div>
          {/* The Offer Card */}
          <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-brand-navy/10 text-center">
            <h3 className="text-2xl font-bold text-brand-navy">The Offer:</h3>
            <p className="mt-4 font-serif text-7xl font-bold text-brand-gold">$500</p>
            <p className="mt-2 text-lg font-semibold text-brand-navy">For a single, 30-minute consultation call.</p>
            <p className="mt-4 text-sm text-brand-navy/80">
              We are seeking board-certified specialists in{" "}
              <strong>Internal Medicine, Dermatology, and Cardiology</strong> for our Founding Advisory Board.
            </p>
            <div className="mt-8">
              <a
                href="#"
                target="_blank"
                className="inline-block rounded-md bg-brand-gold px-12 py-4 text-lg font-bold text-brand-navy shadow-lg hover:bg-brand-navy hover:text-white transition-all transform hover:scale-105"
                rel="noreferrer"
              >
                Apply for the Paid Advisory Role
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

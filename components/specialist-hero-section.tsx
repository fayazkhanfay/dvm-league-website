"use client"

export function SpecialistHeroSection() {
  return (
    <section className="relative pt-48 pb-24 flex items-center bg-brand-offwhite">
      <div className="mx-auto max-w-4xl w-full px-6 lg:px-8 relative z-10 text-center">
        <div className="animate-fade-in-rise">
          <h1 className="font-serif text-6xl font-bold tracking-tight text-brand-navy sm:text-8xl leading-tight text-balance">
            Practice Medicine On Your Terms. Not Theirs.
          </h1>
        </div>
        <div className="animate-fade-in-rise animate-delay-200">
          <p className="mt-6 text-xl leading-relaxed text-brand-navy/90 max-w-3xl mx-auto text-pretty">
          We connect America's best specialists with independent clinics through a simple, text-based platform, giving you the freedom to practice from anywhere and earn over $275 per consult—all with zero on-call, zero emergencies, and zero administrative friction.
          </p>
        </div>
        <div className="mt-10 flex justify-center animate-fade-in-rise animate-delay-400">
          <a
            href="#apply"
            className="inline-block rounded-md bg-brand-gold px-12 py-4 text-lg font-bold text-brand-navy shadow-lg hover:bg-brand-navy hover:text-white transition-all transform hover:scale-105"
          >
            Learn More & See The Offer
          </a>
        </div>
      </div>
    </section>
  )
}

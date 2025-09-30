"use client"

export function SpecialistHeader() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 p-6">
      <div className="mx-auto max-w-7xl flex justify-between items-center">
        <a href="/">
          <div>
            <span className="text-3xl font-serif font-bold text-brand-navy">DVM League</span>
            <p className="text-sm font-semibold text-brand-navy/70 tracking-wide -mt-1">
              American Specialists. American Standards.
            </p>
          </div>
        </a>
        <a
          href="/"
          className="hidden md:inline-block text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors"
        >
          For General Practices →
        </a>
      </div>
    </header>
  )
}

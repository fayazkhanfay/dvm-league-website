"use client"

interface DemoModeBannerProps {
  userName?: string
}

export function DemoModeBanner({ userName }: DemoModeBannerProps) {
  return (
    <div className="bg-brand-gold border-b-2 border-brand-navy/20">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-navy">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-navy opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-navy"></span>
            </span>
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-brand-navy/70">• Test payments only • No real charges</span>
        </div>
      </div>
    </div>
  )
}

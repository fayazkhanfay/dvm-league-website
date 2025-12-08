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
            <span className="hidden sm:inline">⚠️</span> DEMO MODE
          </span>
          <span className="text-brand-navy/70">•</span>
          <span className="text-brand-navy/80">
            Use Test Card:{" "}
            <span className="font-mono font-bold select-all bg-brand-navy/10 px-1.5 py-0.5 rounded">
              4242 4242 4242 4242
            </span>
          </span>
          <span className="hidden md:inline text-brand-navy/70">• Any Date/CVC</span>
        </div>
      </div>
    </div>
  )
}

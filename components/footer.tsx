import { socialLinks } from "@/lib/social-links"

export function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-center gap-4 mb-6">
          {socialLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Icon size={24} />
              </a>
            )
          })}
        </div>

        <div className="text-center text-sm">
          <p>&copy; 2025 DVM League, LLC. All Rights Reserved.</p>
          <p className="mt-2 space-x-4">
            <a href="/login" className="hover:text-white transition-colors">
              Login
            </a>
            <span className="text-white/20">|</span>
            <a href="/specialists" className="hover:text-white transition-colors">
              For Specialists: Join The League
            </a>
            <span className="text-white/20">|</span>
            <a href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span className="text-white/20">|</span>
            <a href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <span className="text-white/20">|</span>
            <a href="mailto:khan@DVMLeague.com" className="hover:text-white transition-colors">
              khan@DVMLeague.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

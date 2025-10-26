export function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300 p-6">
      <div className="mx-auto max-w-7xl text-center text-sm">
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
    </footer>
  )
}

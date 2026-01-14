export default function Footer() {
  return (
    <footer className="bg-primary-900 text-gray-300 py-8 md:py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          {/* Agent Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div>
              <p className="text-white font-bold">[Agent Name]</p>
              <p className="text-sm">[Brokerage Name] | License #[License Number]</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="tel:+17044533914"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (704) 453-3914
              </a>
              <a
                href="mailto:agent@example.com"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                agent@example.com
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-700 pt-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            This site is not intended to solicit currently listed properties. Information deemed reliable but not guaranteed. Equal Housing Opportunity. &copy; {new Date().getFullYear()} [Agent Name].
          </p>
        </div>
      </div>
    </footer>
  );
}

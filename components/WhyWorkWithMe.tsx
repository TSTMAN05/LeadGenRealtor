export default function WhyWorkWithMe() {
  const credentials = [
    "15+ years of real estate experience",
    "Charlotte native with deep local expertise",
    "200+ homes sold in the Charlotte area",
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Your Local Real Estate Expert"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Why Work With Me?
            </h2>
            <p className="text-gray-600 mb-4 max-w-lg">
              You get more than just a home valuation — you get a trusted partner who knows Charlotte inside and out.
            </p>
            <ul className="space-y-2">
              {credentials.map((credential, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{credential}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

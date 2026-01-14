import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Home Value Expert",
  description:
    "Learn about our mission to provide accurate, personalized home valuations to Charlotte homeowners.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Local Real Estate Expert
            </h1>
            <p className="text-lg text-gray-600">
              Helping Charlotte homeowners make informed decisions with accurate,
              personalized property valuations.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <svg className="w-32 h-32 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Choose a Personal Valuation?
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Online home value estimates can be off by tens of thousands of dollars.
                  They can&apos;t see your new kitchen, don&apos;t know about the water damage
                  next door, and miss the nuances that make your neighborhood special.
                </p>
                <p>
                  That&apos;s why I provide personalized valuations. As a local real estate
                  professional with deep knowledge of the Charlotte market, I analyze
                  recent comparable sales, current market conditions, and your property&apos;s
                  unique features to give you an accurate picture of what your home is worth.
                </p>
                <p>
                  Whether you&apos;re thinking about selling, refinancing, or just curious,
                  you deserve to know your home&apos;s true value&mdash;not a computer&apos;s best guess.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            What Sets Me Apart
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Accuracy First</h3>
              <p className="text-gray-600 text-sm">
                I analyze real comparable sales and current market data&mdash;not just algorithms.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Local Expertise</h3>
              <p className="text-gray-600 text-sm">
                Deep knowledge of Charlotte neighborhoods and micro-markets.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Response</h3>
              <p className="text-gray-600 text-sm">
                Receive your personalized valuation within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-primary-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Find Out What Your Home Is Worth?
            </h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Get a free, no-obligation home value estimate from a real expert&mdash;not a computer.
            </p>
            <Link
              href="/#lead-form"
              className="inline-block bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get My Free Estimate
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

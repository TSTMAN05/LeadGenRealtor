"use client";

import { useState, useCallback, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { PlaceResult } from "@/hooks/useGoogleMaps";

interface GeoLocation {
  city: string;
  region: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
}

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Fetch geo location on mount
  useEffect(() => {
    fetch('/api/geo')
      .then(res => res.json())
      .then((data: GeoLocation) => {
        setLocation(data);
        setLocationLoaded(true);
      })
      .catch(() => {
        setLocationLoaded(true);
      });
  }, []);

  // Auto-redirect when address is selected from autocomplete
  const handlePlaceSelect = useCallback((place: PlaceResult) => {
    setIsSubmitting(true);
    const url = `/estimate?address=${encodeURIComponent(place.formattedAddress)}&lat=${place.lat}&lng=${place.lng}`;
    router.push(url);
  }, [router]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);
    const url = `/estimate?address=${encodeURIComponent(address)}`;
    router.push(url);
  };

  // Build personalized headline
  const cityName = location?.city || '';
  const headlineCity = cityName ? `${cityName} ` : '';

  return (
    <>
      {/* Hero Section */}
      <div
        className="relative flex flex-col"
        style={{
          backgroundImage: `url('/Clemson.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          height: 'calc((100vh - 64px) * 0.67)',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content - positioned in upper portion */}
        <div className="relative z-10 w-full text-center pt-16 md:pt-24 px-4">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" style={{ fontStyle: 'italic' }}>
            Find Out What Your{' '}
            <span className={`transition-opacity duration-500 ${locationLoaded ? 'opacity-100' : 'opacity-0'}`}>
              {headlineCity}
            </span>
            Home Is Worth
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-white/90 mb-16 md:mb-20 drop-shadow">
            Get a free estimate from a local expert
          </p>

          {/* Compact Search Bar */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
            <div className="relative bg-white rounded shadow-xl overflow-hidden flex items-center" style={{ height: '40px' }}>
              <div className="flex-1">
                <AddressAutocomplete
                  value={address}
                  onChange={handleAddressChange}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Enter your home address"
                  id="home-address"
                  variant="compact"
                />
              </div>
              <button
                type="submit"
                disabled={!address || isSubmitting}
                className="px-4 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center border-l border-gray-200"
                aria-label="Search"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feature Cards - positioned at bottom */}
        <div className="absolute bottom-12 left-0 right-0 z-10 px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 flex items-center gap-3">
              <div className="text-2xl grayscale opacity-70">📊</div>
              <div>
                <div className="text-white font-semibold text-sm">Free Report</div>
                <div className="text-white/70 text-xs">Detailed market analysis</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 flex items-center gap-3">
              <div className="text-2xl grayscale opacity-70">🏠</div>
              <div>
                <div className="text-white font-semibold text-sm">Local Expert</div>
                <div className="text-white/70 text-xs">Clemson area specialist</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 flex items-center gap-3">
              <div className="text-2xl grayscale opacity-70">⚡</div>
              <div>
                <div className="text-white font-semibold text-sm">Fast Results</div>
                <div className="text-white/70 text-xs">Response within 24 hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Me Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* LEFT SIDE - Image with Floating Badges (40%) */}
            <div className="lg:col-span-2 relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/Clemson.jpg"
                  alt="Clemson neighborhood"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Badge - Top Right */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-[200px]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EBF4FF' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a5f' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary-600">FREE</div>
                  <div className="text-xs text-gray-700 leading-tight">No Obligation Report</div>
                </div>
              </div>

              {/* Floating Badge - Bottom Left */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-[200px]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EBF4FF' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a5f' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary-600">Clemson Area</div>
                  <div className="text-xs text-gray-700 leading-tight">Local Market Expert</div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Content (60%) */}
            <div className="lg:col-span-3">
              {/* Headline */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose a Personalized Home Value Report?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Skip the algorithm. Get a real market analysis from someone who knows Clemson.
              </p>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Feature 1 - Detailed Analysis */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a5f' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Detailed Analysis</h3>
                    <p className="text-sm text-gray-600">I review recent sales, active listings, and market trends specific to your neighborhood.</p>
                  </div>
                </div>

                {/* Feature 2 - Fast Response */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a5f' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Fast Response</h3>
                    <p className="text-sm text-gray-600">Receive your personalized report within 24 hours of submitting your address.</p>
                  </div>
                </div>

                {/* Feature 3 - Personal Touch */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a5f' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Personal Touch</h3>
                    <p className="text-sm text-gray-600">No call centers or automated emails. You'll hear directly from me.</p>
                  </div>
                </div>

                {/* Feature 4 - 100% Free */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e3a5f' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">100% Free</h3>
                    <p className="text-sm text-gray-600">No cost, no obligation. Just valuable information to help you make informed decisions.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

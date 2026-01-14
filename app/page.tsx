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
    <div
      className="min-h-[calc(100vh-64px)] relative flex flex-col"
      style={{
        backgroundImage: `url('/Clemson.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
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
        <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow">
          Get a free estimate from a local expert
        </p>

        {/* Compact Search Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden flex">
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
  );
}

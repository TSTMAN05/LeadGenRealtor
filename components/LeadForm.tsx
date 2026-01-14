"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import Link from "next/link";
import AddressAutocomplete from "./AddressAutocomplete";
import PropertyPreview from "./PropertyPreview";
import { PlaceResult } from "@/hooks/useGoogleMaps";

interface FormData {
  address: string;
  firstName: string;
  email: string;
  phone: string;
  sellingTimeline: string;
  propertyType: string;
  relationship: string;
  website: string; // honeypot field
  lat: number | null;
  lng: number | null;
}

interface PropertyDetails {
  beds?: number;
  baths?: number;
  sqft?: number;
  year_built?: number;
  lot_sqft?: number;
  property_type?: string;
  estimated_value?: number;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export default function LeadForm() {
  const [formData, setFormData] = useState<FormData>({
    address: "",
    firstName: "",
    email: "",
    phone: "",
    sellingTimeline: "",
    propertyType: "",
    relationship: "",
    website: "", // honeypot - should remain empty
    lat: null,
    lng: null,
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState<{
    address: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({ ...prev, address: value }));
    // Clear the selected place if user manually edits the address
    if (selectedPlace && value !== selectedPlace.formattedAddress) {
      setSelectedPlace(null);
      setPropertyDetails(null);
      setFormData((prev) => ({ ...prev, lat: null, lng: null }));
    }
  };

  const handlePlaceSelect = useCallback((place: PlaceResult) => {
    setSelectedPlace(place);
    setFormData((prev) => ({
      ...prev,
      address: place.formattedAddress,
      lat: place.lat,
      lng: place.lng,
    }));
  }, []);

  // Fetch property details when address is selected
  useEffect(() => {
    if (!selectedPlace?.formattedAddress) {
      setPropertyDetails(null);
      return;
    }

    const fetchPropertyDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const response = await fetch("/api/property", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: selectedPlace.formattedAddress }),
        });

        if (response.ok) {
          const result = await response.json();
          // DEBUG: Log what property data we received
          console.log("Frontend received property data:", result);
          setPropertyDetails(result.data);
        } else {
          console.error("Failed to fetch property details");
          setPropertyDetails(null);
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        setPropertyDetails(null);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchPropertyDetails();
  }, [selectedPlace?.formattedAddress]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Save the submitted address before clearing the form
        setSubmittedAddress({
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng,
        });
        setStatus("success");
        setFormData({
          address: "",
          firstName: "",
          email: "",
          phone: "",
          sellingTimeline: "",
          propertyType: "",
          relationship: "",
          website: "",
          lat: null,
          lng: null,
        });
        setSelectedPlace(null);
        setPropertyDetails(null);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section id="lead-form" className="bg-white py-6 md:py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center border border-gray-100 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              I&apos;ll be in touch within 24 hours with your personalized home value estimate.
            </p>

            {/* Mortgage Calculator CTA */}
            {submittedAddress?.address && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600 mb-4">
                  Want to estimate your monthly payment?
                </p>
                <Link
                  href={`/mortgage-calculator?address=${encodeURIComponent(submittedAddress.address)}${submittedAddress.lat ? `&lat=${submittedAddress.lat}` : ""}${submittedAddress.lng ? `&lng=${submittedAddress.lng}` : ""}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculate Mortgage for This Home
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="bg-white py-4 md:py-6">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column: Form (55%) */}
          <div className="w-full lg:w-[55%]">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Get Your Free Home Value
                </h2>
                <p className="text-gray-500 text-sm">
                  No algorithms. A real expert reviews your property.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Property Address
                  </label>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={handleAddressChange}
                    onPlaceSelect={handlePlaceSelect}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(704) 555-1234"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 placeholder:text-gray-400"
                  />
                </div>

                {/* Qualifying Questions */}
                <div>
                  <label
                    htmlFor="sellingTimeline"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    When are you thinking of selling?
                  </label>
                  <div className="relative">
                    <select
                      id="sellingTimeline"
                      name="sellingTimeline"
                      value={formData.sellingTimeline}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                    >
                      <option value="" disabled>Select timeline...</option>
                      <option value="asap">ASAP - Ready now</option>
                      <option value="1-3months">1-3 months</option>
                      <option value="3-6months">3-6 months</option>
                      <option value="6-12months">6-12 months</option>
                      <option value="curious">Just curious about my value</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="propertyType"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Property Type
                    </label>
                    <div className="relative">
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                      >
                        <option value="" disabled>Select type...</option>
                        <option value="single-family">Single Family Home</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="condo">Condo</option>
                        <option value="multi-family">Multi-Family</option>
                        <option value="land">Land</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="relationship"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      I am the...
                    </label>
                    <div className="relative">
                      <select
                        id="relationship"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                      >
                        <option value="" disabled>Select one...</option>
                        <option value="homeowner">Homeowner</option>
                        <option value="co-owner">Co-owner</option>
                        <option value="family-member">Family member of owner</option>
                        <option value="agent">Real estate agent</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Honeypot field - hidden from users, visible to bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Hidden fields for lat/lng */}
                <input type="hidden" name="lat" value={formData.lat || ""} />
                <input type="hidden" name="lng" value={formData.lng || ""} />

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Get My Free Estimate"
                  )}
                </button>

                <p className="text-center text-gray-400 text-xs flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Your info is secure and never shared.
                </p>

                {status === "error" && (
                  <p className="text-red-600 text-center text-sm bg-red-50 py-2 px-3 rounded-lg">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Property Preview (45%) */}
          <div className="w-full lg:w-[45%] min-h-[400px] lg:min-h-0">
            <PropertyPreview
              lat={formData.lat}
              lng={formData.lng}
              address={formData.address}
              propertyDetails={propertyDetails}
              isLoadingDetails={isLoadingDetails}
            />
            {/* Mortgage Calculator Link - shows after address is selected */}
            {selectedPlace && formData.lat && formData.lng && (
              <Link
                href={`/mortgage-calculator?address=${encodeURIComponent(formData.address)}&lat=${formData.lat}&lng=${formData.lng}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-6 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate Mortgage for This Home
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

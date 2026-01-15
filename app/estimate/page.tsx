"use client";

import { useState, FormEvent, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface FormData {
  address: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  unitNumber: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  lotSize: string;
  website: string; // honeypot field
  lat: number | null;
  lng: number | null;
}

interface GeoLocation {
  city: string;
  region: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
}

interface ParsedAddress {
  street: string;
  cityStateZip: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

function parseAddress(fullAddress: string): ParsedAddress {
  // Try to parse address into street and city/state/zip
  const parts = fullAddress.split(",").map(p => p.trim());

  if (parts.length >= 2) {
    const street = parts[0];
    const cityStateZip = parts.slice(1).join(", ");
    return { street, cityStateZip };
  }

  return { street: fullAddress, cityStateZip: "" };
}

function EstimateContent() {
  const searchParams = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const loaded = useGoogleMaps();

  const [formData, setFormData] = useState<FormData>({
    address: "",
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    unitNumber: "",
    bedrooms: "",
    bathrooms: "",
    squareFootage: "",
    lotSize: "",
    website: "", // honeypot
    lat: null,
    lng: null,
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submittedAddress, setSubmittedAddress] = useState<{
    address: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch geo location on mount
  useEffect(() => {
    fetch('/api/geo')
      .then(res => res.json())
      .then((data: GeoLocation) => {
        setLocation(data);
      })
      .catch(() => {
        // Silently fail - location is optional
      });
  }, []);

  // Read URL parameters on mount
  useEffect(() => {
    const addressParam = searchParams.get("address");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    if (addressParam) {
      setFormData(prev => ({
        ...prev,
        address: decodeURIComponent(addressParam),
        lat: latParam ? parseFloat(latParam) : null,
        lng: lngParam ? parseFloat(lngParam) : null,
      }));
    }
  }, [searchParams]);

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google || !formData.lat || !formData.lng) return;

    const position = { lat: formData.lat, lng: formData.lng };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: formData.address,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      mapInstanceRef.current.setCenter(position);
      markerRef.current?.setPosition(position);
    }
  }, [loaded, formData.lat, formData.lng, formData.address]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "This field is required";
        break;
      case "email":
        if (!value.trim()) return "This field is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        break;
      case "phone":
        if (!value.trim()) return "This field is required";
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) return "Please enter a valid phone number";
        break;
      case "address":
        if (!value.trim()) return "This field is required";
        break;
    }
    return undefined;
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);

    // Format based on length
    if (limitedDigits.length <= 3) {
      return limitedDigits ? `(${limitedDigits}` : "";
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Special handling for phone field
    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: FormErrors = {};
    const nameError = validateField("name", formData.name);
    const emailError = validateField("email", formData.email);
    const phoneError = validateField("phone", formData.phone);
    const addressError = validateField("address", formData.address);

    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;
    if (addressError) newErrors.address = addressError;

    // If there are errors, set them and scroll to first error
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Find first error field and scroll to it
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    setStatus("loading");

    try {
      // Strip formatting from phone before submitting
      const phoneDigits = formData.phone.replace(/\D/g, "");

      console.log("Submitting form data:", {
        address: formData.address,
        firstName: formData.name,
        email: formData.email,
        phone: phoneDigits,
        propertyType: formData.propertyType,
      });

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: formData.address,
          firstName: formData.name,
          email: formData.email,
          phone: phoneDigits,
          sellingTimeline: "curious", // Default for estimate form
          propertyType: formData.propertyType,
          unitNumber: formData.unitNumber,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          squareFootage: formData.squareFootage,
          lotSize: formData.lotSize,
          website: formData.website,
          lat: formData.lat,
          lng: formData.lng,
          relationship: "homeowner",
          // Include geo location data
          visitorCity: location?.city || null,
          visitorRegion: location?.region || null,
          visitorCountry: location?.country || null,
          visitorLatitude: location?.latitude || null,
          visitorLongitude: location?.longitude || null,
        }),
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        console.log("Form submitted successfully");
        setSubmittedAddress({
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng,
        });
        setStatus("success");
      } else {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  };

  const parsedAddress = parseAddress(formData.address);

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center border border-gray-100">
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

            <Link
              href="/"
              className="inline-block mt-6 text-primary-600 hover:text-primary-700 font-medium"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column: Form (45%) */}
      <div className="w-full lg:w-[45%] bg-white p-6 md:p-8 overflow-y-auto flex-shrink-0 lg:h-full">
        {/* Address Header Card */}
        {formData.address && (
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-8 text-center">
            <p className="text-xl md:text-2xl font-semibold text-blue-500">
              {parsedAddress.street}
            </p>
            {parsedAddress.cityStateZip && (
              <p className="text-gray-500 mt-1">
                {parsedAddress.cityStateZip}
              </p>
            )}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 text-gray-900 transition-colors duration-200 placeholder:text-gray-400 ${
                    errors.name
                      ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 text-gray-900 transition-colors duration-200 placeholder:text-gray-400 ${
                    errors.email
                      ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 text-gray-900 transition-colors duration-200 placeholder:text-gray-400 ${
                    errors.phone
                      ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Information Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Property Information</h2>
            <p className="text-sm text-gray-500 mb-4">
              To more accurately estimate your home, we need a few more details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1 */}
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Type of Property
                </label>
                <div className="relative">
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                  >
                    <option value="">Select type...</option>
                    <option value="single-family">Single Family</option>
                    <option value="condo-townhouse">Condo/Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                    <option value="land">Land</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="unitNumber" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Unit #
                </label>
                <input
                  type="text"
                  id="unitNumber"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Row 2 */}
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Bedrooms
                </label>
                <div className="relative">
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6+">6+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Bathrooms
                </label>
                <div className="relative">
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3</option>
                    <option value="3.5">3.5</option>
                    <option value="4+">4+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label htmlFor="squareFootage" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Approx. Square Footage
                </label>
                <input
                  type="number"
                  id="squareFootage"
                  name="squareFootage"
                  value={formData.squareFootage}
                  onChange={handleChange}
                  placeholder="e.g., 2000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors duration-200 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="lotSize" className="block text-sm font-medium text-blue-500 mb-1.5">
                  Lot Size / Acreage
                </label>
                <div className="relative">
                  <select
                    id="lotSize"
                    name="lotSize"
                    value={formData.lotSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors duration-200 appearance-none bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="under-0.25">Under 0.25 acres</option>
                    <option value="0.25-0.5">0.25-0.5 acres</option>
                    <option value="0.5-1">0.5-1 acre</option>
                    <option value="1-5">1-5 acres</option>
                    <option value="5+">5+ acres</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Honeypot field */}
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

          {/* Hidden fields */}
          <input type="hidden" name="lat" value={formData.lat || ""} />
          <input type="hidden" name="lng" value={formData.lng || ""} />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 px-8 rounded-md text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
              "Submit"
            )}
          </button>

          {/* Footer Text */}
          <p className="text-center text-gray-400 text-sm">
            Your request will be forwarded to a Licensed Real Estate Professional in your area who will provide you with a customized property market report.
          </p>

          {status === "error" && (
            <p className="text-red-600 text-center text-sm bg-red-50 py-2 px-3 rounded-lg">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>

      {/* Right Column: Map Only (55%) */}
      <div className="w-full lg:w-[55%] h-[300px] lg:h-full bg-gray-100 relative flex-shrink-0">
        {formData.lat && formData.lng ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Property Location</p>
              <p className="text-gray-400 text-sm mt-1">Map will appear when address is provided</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EstimatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    }>
      <EstimateContent />
    </Suspense>
  );
}

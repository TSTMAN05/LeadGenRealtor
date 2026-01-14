"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface MortgageResult {
  monthly_payment: {
    mortgage: number;
    property_tax: number;
    hoa: number;
    home_insurance: number;
    total: number;
  };
  annual_payment: {
    mortgage: number;
    property_tax: number;
    hoa: number;
    home_insurance: number;
    total: number;
  };
  total_interest_paid: number;
}

interface PropertyContext {
  address: string;
  lat: number;
  lng: number;
}

function MortgageCalculatorContent() {
  const searchParams = useSearchParams();
  const [propertyContext, setPropertyContext] = useState<PropertyContext | null>(null);

  const [formData, setFormData] = useState({
    home_value: "",
    downpayment: "",
    interest_rate: "",
    duration_years: "30",
    monthly_hoa: "",
    annual_property_tax: "",
    annual_home_insurance: "",
  });
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRate, setCurrentRate] = useState<{ frm_30: number | null; frm_15: number | null } | null>(null);
  const [rateLoading, setRateLoading] = useState(true);

  // Read URL parameters on mount
  useEffect(() => {
    const address = searchParams.get("address");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (address && lat && lng) {
      setPropertyContext({
        address: decodeURIComponent(address),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });
    }
  }, [searchParams]);

  // Fetch current mortgage rate on mount
  useEffect(() => {
    fetch('/api/mortgage-rate')
      .then(res => res.json())
      .then(data => {
        if (data.frm_30 || data.frm_15) {
          setCurrentRate({ frm_30: data.frm_30, frm_15: data.frm_15 });
        }
        setRateLoading(false);
      })
      .catch(() => setRateLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const useCurrentRate = () => {
    if (!currentRate) return;
    // Use 15-year rate for 15-year term, 30-year rate for everything else
    const rate = formData.duration_years === "15" ? currentRate.frm_15 : currentRate.frm_30;
    if (rate) {
      setFormData((prev) => ({ ...prev, interest_rate: rate.toString() }));
    }
  };

  // Get the display rate based on selected loan term
  const displayRate = currentRate
    ? (formData.duration_years === "15" ? currentRate.frm_15 : currentRate.frm_30)
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mortgage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          home_value: parseFloat(formData.home_value),
          downpayment: parseFloat(formData.downpayment) || 0,
          interest_rate: parseFloat(formData.interest_rate),
          duration_years: parseInt(formData.duration_years),
          monthly_hoa: parseFloat(formData.monthly_hoa) || 0,
          annual_property_tax: parseFloat(formData.annual_property_tax) || undefined,
          annual_home_insurance: parseFloat(formData.annual_home_insurance) || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate mortgage");
      }

      const data = await response.json();
      setResult(data.data);
    } catch {
      setError("Failed to calculate. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-8 md:py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {propertyContext
                ? "Mortgage Calculator"
                : "Mortgage Calculator"}
            </h1>
            <p className="text-lg text-gray-600">
              {propertyContext
                ? "Calculate your estimated monthly payment for this property."
                : "Calculate your estimated monthly mortgage payment including taxes, insurance, and HOA fees."}
            </p>
          </div>
        </div>
      </section>

      {/* Property Context Section - Only shows when address is provided */}
      {propertyContext && (
        <section className="py-6 bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="bg-primary-50 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Street View */}
                <div className="w-full md:w-1/2">
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
                    {googleMapsApiKey ? (
                      <img
                        src={`https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${propertyContext.lat},${propertyContext.lng}&fov=90&heading=0&pitch=0&key=${googleMapsApiKey}`}
                        alt={`Street view of ${propertyContext.address}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Street view unavailable</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="w-full md:w-1/2">
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
                    {googleMapsApiKey ? (
                      <img
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${propertyContext.lat},${propertyContext.lng}&zoom=17&size=600x400&maptype=roadmap&markers=color:red%7C${propertyContext.lat},${propertyContext.lng}&key=${googleMapsApiKey}`}
                        alt={`Map of ${propertyContext.address}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Map unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Display */}
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-primary-600 font-medium">Calculating mortgage for:</p>
                  <p className="text-lg font-semibold text-gray-900">{propertyContext.address}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Calculator Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Enter Your Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="home_value"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    {propertyContext ? "Estimated Home Value / Asking Price *" : "Home Value *"}
                  </label>
                  {propertyContext && (
                    <p className="text-xs text-gray-500 mb-2">
                      Enter your estimated home value or the asking price
                    </p>
                  )}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="home_value"
                      name="home_value"
                      value={formData.home_value}
                      onChange={handleChange}
                      required
                      placeholder="350,000"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="downpayment"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Down Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="downpayment"
                      name="downpayment"
                      value={formData.downpayment}
                      onChange={handleChange}
                      placeholder="70,000"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="interest_rate"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Interest Rate (%) *
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        id="interest_rate"
                        name="interest_rate"
                        value={formData.interest_rate}
                        onChange={handleChange}
                        required
                        step="0.01"
                        placeholder="6.5"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={useCurrentRate}
                        disabled={!displayRate || rateLoading}
                        className="px-3 py-2 text-xs bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border border-teal-200"
                        title="Use current market rate"
                      >
                        {rateLoading ? '...' : displayRate ? `Use ${displayRate}%` : 'N/A'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="duration_years"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Loan Term *
                    </label>
                    <select
                      id="duration_years"
                      name="duration_years"
                      value={formData.duration_years}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    >
                      <option value="30">30 years</option>
                      <option value="20">20 years</option>
                      <option value="15">15 years</option>
                      <option value="10">10 years</option>
                    </select>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <p className="text-sm text-gray-500">Optional fields for more accurate estimate:</p>

                <div>
                  <label
                    htmlFor="annual_property_tax"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Annual Property Tax
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="annual_property_tax"
                      name="annual_property_tax"
                      value={formData.annual_property_tax}
                      onChange={handleChange}
                      placeholder="3,500"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="annual_home_insurance"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Annual Insurance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="annual_home_insurance"
                        name="annual_home_insurance"
                        value={formData.annual_home_insurance}
                        onChange={handleChange}
                        placeholder="1,800"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="monthly_hoa"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Monthly HOA
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="monthly_hoa"
                        name="monthly_hoa"
                        value={formData.monthly_hoa}
                        onChange={handleChange}
                        placeholder="150"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isLoading ? (
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
                      Calculating...
                    </span>
                  ) : (
                    "Calculate Payment"
                  )}
                </button>

                {error && (
                  <p className="text-red-600 text-center text-sm bg-red-50 py-2 px-3 rounded-lg">
                    {error}
                  </p>
                )}
              </form>
            </div>

            {/* Results */}
            <div>
              {result ? (
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Your Estimated Payment
                  </h2>

                  {/* Monthly Total */}
                  <div className="bg-primary-50 rounded-xl p-6 mb-6">
                    <p className="text-sm text-primary-600 font-medium mb-1">Monthly Payment</p>
                    <p className="text-4xl font-bold text-primary-900">
                      {formatCurrency(result.monthly_payment.total)}
                    </p>
                  </div>

                  {/* Monthly Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Principal & Interest</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.monthly_payment.mortgage)}
                      </span>
                    </div>
                    {result.monthly_payment.property_tax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Property Tax</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(result.monthly_payment.property_tax)}
                        </span>
                      </div>
                    )}
                    {result.monthly_payment.home_insurance > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Home Insurance</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(result.monthly_payment.home_insurance)}
                        </span>
                      </div>
                    )}
                    {result.monthly_payment.hoa > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">HOA</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(result.monthly_payment.hoa)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total Interest */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Interest Over Loan</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.total_interest_paid)}
                      </span>
                    </div>
                  </div>

                  {/* Annual Payment */}
                  <div className="text-center text-sm text-gray-500">
                    Annual payment: {formatCurrency(result.annual_payment.total)}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Enter Your Details
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Fill out the form to see your estimated monthly mortgage payment.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 bg-primary-600 rounded-xl p-6 text-center">
                <p className="text-primary-100 text-sm mb-3">
                  {propertyContext
                    ? "Ready to sell? Get your free home value estimate."
                    : "Thinking about buying? Get a free home value estimate first."}
                </p>
                <Link
                  href="/#lead-form"
                  className="inline-block bg-white hover:bg-gray-50 text-primary-600 font-semibold py-2 px-6 rounded-lg text-sm transition-colors"
                >
                  Get Free Home Value
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function MortgageCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    }>
      <MortgageCalculatorContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface PropertyDetails {
  beds?: number;
  baths?: number;
  sqft?: number;
  year_built?: number;
  lot_sqft?: number;
  property_type?: string;
  estimated_value?: number;
}

interface PropertyPreviewProps {
  lat: number | null;
  lng: number | null;
  address: string;
  propertyDetails: PropertyDetails | null;
  isLoadingDetails: boolean;
}

export default function PropertyPreview({
  lat,
  lng,
  address,
  propertyDetails,
  isLoadingDetails
}: PropertyPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const loaded = useGoogleMaps();

  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);
  const [streetViewError, setStreetViewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google || !lat || !lng) return;

    const position = { lat, lng };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 17,
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
        title: address,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      mapInstanceRef.current.setCenter(position);
      markerRef.current?.setPosition(position);
    }

    setIsLoading(false);
  }, [loaded, lat, lng, address]);

  // Check and set Street View
  useEffect(() => {
    if (!loaded || !window.google || !lat || !lng) return;

    const streetViewService = new window.google.maps.StreetViewService();
    const position = { lat, lng };

    streetViewService.getPanorama(
      { location: position, radius: 50 },
      (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&heading=0&pitch=0&key=${apiKey}`;
          setStreetViewUrl(url);
          setStreetViewError(false);
        } else {
          setStreetViewUrl(null);
          setStreetViewError(true);
        }
      }
    );
  }, [loaded, lat, lng]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Placeholder state - no address selected yet
  if (!lat || !lng) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200 p-8">
        <div className="w-24 h-24 mb-6 text-gray-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-gray-500 text-center text-lg font-medium mb-2">
          See Your Property
        </p>
        <p className="text-gray-400 text-center text-sm">
          Enter your address to view Street View and map of your home
        </p>
      </div>
    );
  }

  // Property selected - show details, Street View and Map
  return (
    <div className="h-full flex flex-col gap-3 animate-fadeIn">
      {/* Property Details Card */}
      {isLoadingDetails ? (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading property details...</p>
          </div>
        </div>
      ) : propertyDetails && Object.keys(propertyDetails).length > 0 ? (
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border border-primary-100">
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-3">
            Property Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            {propertyDetails.beds !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{propertyDetails.beds}</p>
                  <p className="text-xs text-gray-500">Beds</p>
                </div>
              </div>
            )}
            {propertyDetails.baths !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{propertyDetails.baths}</p>
                  <p className="text-xs text-gray-500">Baths</p>
                </div>
              </div>
            )}
            {propertyDetails.sqft !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(propertyDetails.sqft)}</p>
                  <p className="text-xs text-gray-500">Sq Ft</p>
                </div>
              </div>
            )}
            {propertyDetails.year_built !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{propertyDetails.year_built}</p>
                  <p className="text-xs text-gray-500">Year Built</p>
                </div>
              </div>
            )}
            {propertyDetails.lot_sqft !== undefined && (
              <div className="flex items-center gap-2 col-span-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(propertyDetails.lot_sqft)}</p>
                  <p className="text-xs text-gray-500">Lot Sq Ft</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Full details coming in your personalized report</span>
          </p>
        </div>
      )}

      {/* Street View - takes more space */}
      {streetViewUrl && !streetViewError ? (
        <div className="relative flex-1 min-h-[160px] overflow-hidden rounded-xl shadow-lg border border-gray-100">
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm z-10">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Street View
            </p>
          </div>
          <img
            src={streetViewUrl}
            alt={`Street view of ${address}`}
            className="w-full h-full object-cover"
            onError={() => setStreetViewError(true)}
          />
        </div>
      ) : null}

      {/* Map - takes remaining space, or full space if no street view */}
      <div className={`relative overflow-hidden rounded-xl shadow-lg border border-gray-100 ${streetViewUrl && !streetViewError ? 'h-[120px]' : 'flex-1 min-h-[200px]'}`}>
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm z-10">
          <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Map
          </p>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
        />
      </div>

      {/* Address confirmation */}
      <div className="bg-primary-50 rounded-xl p-2.5 flex items-center gap-2">
        <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-xs text-primary-800 font-medium truncate">{address}</p>
      </div>
    </div>
  );
}

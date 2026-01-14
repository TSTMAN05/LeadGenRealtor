"use client";

import { useEffect, useState, useCallback, useRef } from "react";

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

let isLoading = false;
let isLoaded = false;
const callbacks: (() => void)[] = [];

function checkGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!(window.google && window.google.maps && window.google.maps.places);
}

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded
    if (checkGoogleMapsLoaded()) {
      isLoaded = true;
      setLoaded(true);
      return;
    }

    if (isLoaded) {
      setLoaded(true);
      return;
    }

    if (isLoading) {
      callbacks.push(() => setLoaded(true));
      return;
    }

    isLoading = true;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is not configured");
      return;
    }

    window.initGoogleMaps = () => {
      isLoaded = true;
      isLoading = false;
      setLoaded(true);
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed for script tag
    };
  }, []);

  return loaded;
}

export interface PlaceResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
}

export function useAddressAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onPlaceSelect: (place: PlaceResult) => void
) {
  const loaded = useGoogleMaps();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const initializedRef = useRef(false);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return null;
    if (initializedRef.current && autocompleteRef.current) return autocompleteRef.current;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: "us" },
        types: ["address"],
        fields: ["formatted_address", "geometry", "place_id"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (place.geometry?.location && place.formatted_address) {
        onPlaceSelect({
          formattedAddress: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || "",
        });
      }
    });

    autocompleteRef.current = autocomplete;
    initializedRef.current = true;
    return autocomplete;
  }, [inputRef, onPlaceSelect]);

  useEffect(() => {
    // If already loaded, initialize immediately
    if (checkGoogleMapsLoaded() && inputRef.current && !initializedRef.current) {
      initAutocomplete();
      return;
    }

    // If not loaded yet, poll until it's ready
    if (!initializedRef.current) {
      const checkInterval = setInterval(() => {
        if (checkGoogleMapsLoaded() && inputRef.current) {
          clearInterval(checkInterval);
          initAutocomplete();
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite polling
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [loaded, inputRef, initAutocomplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return loaded;
}

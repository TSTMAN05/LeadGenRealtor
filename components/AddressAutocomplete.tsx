"use client";

import { useRef } from "react";
import { useAddressAutocomplete, PlaceResult } from "@/hooks/useGoogleMaps";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  variant?: "default" | "compact";
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "123 Main St, Charlotte, NC 28202",
  required = false,
  id = "address",
  variant = "default",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useAddressAutocomplete(inputRef, onPlaceSelect);

  const inputClasses = variant === "compact"
    ? "w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
    : "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 transition-colors duration-200 placeholder:text-gray-400";

  return (
    <div className="relative" data-form-type="other">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name="property-address-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete="new-password"
        data-form-type="other"
        data-lpignore="true"
        data-1p-ignore="true"
        className={inputClasses}
      />
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Country {
    name: string;
    code: string;
    iso: string;
    flag: string;
}

const countries: Country[] = [
    { name: "United States", code: "+1", iso: "US", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧" },
    { name: "India", code: "+91", iso: "IN", flag: "🇮🇳" },
    { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦" },
    { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺" },
    { name: "Germany", code: "+49", iso: "DE", flag: "🇩🇪" },
    { name: "France", code: "+33", iso: "FR", flag: "🇫🇷" },
    { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵" },
    { name: "China", code: "+86", iso: "CN", flag: "🇨🇳" },
    { name: "Brazil", code: "+55", iso: "BR", flag: "🇧🇷" },
    { name: "United Arab Emirates", code: "+971", iso: "AE", flag: "🇦🇪" },
    { name: "Singapore", code: "+65", iso: "SG", flag: "🇸🇬" },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export function PhoneInput({ value, onChange, id, placeholder, required, className }: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initial separation of code and number if value exists
    const initialCode = countries.find(c => value.startsWith(c.code))?.code || "+1";
    const [countryCode, setCountryCode] = useState(initialCode);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCountrySelect = (country: Country) => {
        setCountryCode(country.code);
        setIsOpen(false);
        // If there's an existing number, replace the old code with the new one
        const currentNumberWithoutCode = value.startsWith(countryCode)
            ? value.slice(countryCode.length).trim()
            : value.replace(/^\+\d+/, "").trim();

        onChange(`${country.code}${currentNumberWithoutCode}`);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // Ensure it starts with +
        if (val && !val.startsWith("+")) {
            val = "+" + val.replace(/\D/g, "");
        }

        onChange(val);

        // Try to detect country code to update flag
        const detectedCountry = countries.find(c => val.startsWith(c.code));
        if (detectedCountry) {
            setCountryCode(detectedCountry.code);
        }
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.includes(searchTerm)
    );

    const currentCountry = countries.find(c => c.code === countryCode);

    return (
        <div
            className={`flex items-center rounded-xl bg-surface-input-dark ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary transition-all duration-300 ${className}`}
            ref={dropdownRef}
        >
            {/* Country Selector Dropdown */}
            <div className="relative pl-1">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 h-[46px] px-2 text-white hover:bg-white/5 transition-colors focus:outline-none rounded-l-xl"
                    aria-label="Select Country"
                >
                    <span className="text-xs font-semibold text-gray-400">
                        {currentCountry?.iso || "🌐"}
                    </span>
                    <ChevronDown size={10} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-[50px] left-0 w-64 max-h-72 overflow-hidden bg-background-dark border border-white/10 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-200">
                        <div className="p-2 border-b border-white/10 bg-white/5">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    className="w-full bg-surface-input-dark border-0 rounded-lg py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-primary outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-56 custom-scrollbar">
                            {filteredCountries.map((country, idx) => (
                                <button
                                    key={`${country.iso}-${idx}`}
                                    type="button"
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-white transition-colors text-left"
                                    onClick={() => handleCountrySelect(country)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base">{country.flag}</span>
                                        <span>{country.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-xs">{country.code}</span>
                                        {countryCode === country.code && <Check size={14} className="text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Combined Phone Number Input */}
            <div className="flex-grow">
                <input
                    id={id}
                    type="tel"
                    placeholder={placeholder || "+1 (555) 000-0000"}
                    value={value}
                    onChange={handlePhoneChange}
                    className="w-full h-[46px] bg-transparent py-3 px-2 text-white text-sm focus:outline-none placeholder:text-gray-500"
                    required={required}
                />
            </div>
        </div>
    );
}

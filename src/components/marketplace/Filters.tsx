'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownProps {
    label: string;
    options: string[];
    paramName: string;
    currentValue: string | null;
    onSelect: (name: string, value: string) => void;
}

function FilterDropdown({ label, options, paramName, currentValue, onSelect }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1 transition-colors whitespace-nowrap",
                    isOpen || currentValue ? "text-[#19e66b]" : "hover:text-[#19e66b]"
                )}
            >
                {label} <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-[#1a2f23] border border-white/10 rounded-xl shadow-2xl p-2 z-[100] max-h-64 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onSelect(paramName, option);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors",
                                currentValue === option ? "text-[#19e66b] bg-[#19e66b]/10" : "text-white/70"
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface FiltersProps {
    materials: string[];
    regions: string[];
    grades: string[];
    tiers: string[];
    view: 'listings' | 'bounties' | 'credits';
}

export default function Filters({ materials, regions, grades, tiers, view }: FiltersProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');

    // Prefix for URL parameters based on current view
    const prefix = view === 'listings' ? 'l_' : (view === 'bounties' ? 'b_' : 'c_');

    // Initialize search query from URL on mount or view change
    useEffect(() => {
        setSearchQuery(searchParams.get(`${prefix}q`) || '');
    }, [searchParams, prefix]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            // Map generic name to view-specific prefixed name
            const prefixedName = `${prefix}${name}`;

            if (value === 'All' || value === '') {
                params.delete(prefixedName);
            } else {
                params.set(prefixedName, value);
            }
            return params.toString();
        },
        [searchParams, prefix]
    );

    const handleFilterChange = (name: string, value: string) => {
        router.push(pathname + '?' + createQueryString(name, value), { scroll: false });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('q', searchQuery);
    };

    return (
        <div className="sticky top-20 border-b border-white/5 bg-[#112117]/80 backdrop-blur-md z-40 w-full mb-6 py-4">
            <div className="max-w-[1600px] mx-auto px-6 flex flex-col gap-4">

                {/* Search Bar Row */}
                <div className="flex items-center gap-4 w-full">
                    <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder={view === 'listings' ? "Search listings..." : (view === 'credits' ? "Search EPR credits..." : "Search bounties...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#19e66b]/50 transition-all placeholder:text-white/30"
                        />
                    </form>
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-6 flex-wrap text-xs font-medium text-white/60">
                    <div className="flex items-center gap-2 text-white shrink-0">
                        <Filter size={18} />
                        <span>Filters:</span>
                    </div>

                    <FilterDropdown
                        label="Material Type"
                        options={materials}
                        paramName="materialType"
                        currentValue={searchParams.get(`${prefix}materialType`)}
                        onSelect={handleFilterChange}
                    />

                    <FilterDropdown
                        label="Region"
                        options={regions}
                        paramName="region"
                        currentValue={searchParams.get(`${prefix}region`)}
                        onSelect={handleFilterChange}
                    />

                    <FilterDropdown
                        label="Purity Grade"
                        options={grades}
                        paramName="purityGrade"
                        currentValue={searchParams.get(`${prefix}purityGrade`)}
                        onSelect={handleFilterChange}
                    />

                    <FilterDropdown
                        label="Verification Level"
                        options={tiers}
                        paramName="verificationLevel"
                        currentValue={searchParams.get(`${prefix}verificationLevel`)}
                        onSelect={handleFilterChange}
                    />

                    <div className="h-4 w-[1px] bg-white/10 mx-2 shrink-0"></div>

                    {searchParams.get(`${prefix}q`) && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                handleFilterChange('q', '');
                            }}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#19e66b]/50 transition-colors flex items-center gap-1 text-[#19e66b]/80 shrink-0"
                        >
                            Search: {searchParams.get(`${prefix}q`)} <X size={12} />
                        </button>
                    )}

                    {searchParams.get(`${prefix}materialType`) && searchParams.get(`${prefix}materialType`) !== 'All' && (
                        <button
                            onClick={() => handleFilterChange('materialType', 'All')}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#19e66b]/50 transition-colors flex items-center gap-1 text-[#19e66b]/80 shrink-0"
                        >
                            {searchParams.get(`${prefix}materialType`)} <X size={12} />
                        </button>
                    )}
                    {searchParams.get(`${prefix}region`) && searchParams.get(`${prefix}region`) !== 'All' && (
                        <button
                            onClick={() => handleFilterChange('region', 'All')}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#19e66b]/50 transition-colors flex items-center gap-1 text-[#19e66b]/80 shrink-0"
                        >
                            {searchParams.get(`${prefix}region`)} <X size={12} />
                        </button>
                    )}
                    {searchParams.get(`${prefix}purityGrade`) && searchParams.get(`${prefix}purityGrade`) !== 'All' && (
                        <button
                            onClick={() => handleFilterChange('purityGrade', 'All')}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#19e66b]/50 transition-colors flex items-center gap-1 text-[#19e66b]/80 shrink-0"
                        >
                            Grade: {searchParams.get(`${prefix}purityGrade`)} <X size={12} />
                        </button>
                    )}
                    {searchParams.get(`${prefix}verificationLevel`) && searchParams.get(`${prefix}verificationLevel`) !== 'All' && (
                        <button
                            onClick={() => handleFilterChange('verificationLevel', 'All')}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#19e66b]/50 transition-colors flex items-center gap-1 text-[#19e66b]/80 shrink-0"
                        >
                            Tier: {searchParams.get(`${prefix}verificationLevel`)} <X size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

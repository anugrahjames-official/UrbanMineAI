'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Highest Value', value: 'price_high' },
    { label: 'Lowest Value', value: 'price_low' },
];

export default function SortDropdown() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentSort = searchParams.get('sort') || 'newest';
    const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const handleSortChange = (value: string) => {
        router.push(pathname + '?' + createQueryString('sort', value));
        setIsOpen(false);
    };

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
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <span className="text-sm text-white/40">Sort by:</span>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#1a2f23] text-sm text-white font-medium focus:outline-none cursor-pointer border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 min-w-[140px] justify-between"
            >
                {currentOption.label}
                <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-[#1a2f23] border border-white/10 rounded-xl shadow-2xl p-2 z-[100]">
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors",
                                currentSort === option.value ? "text-[#19e66b] bg-[#19e66b]/10" : "text-white/70"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

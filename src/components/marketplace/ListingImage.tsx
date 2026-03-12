'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingImageProps {
    title: string;
    mainImage: string;
    additionalImages?: string[];
}

export default function ListingImage({ title, mainImage, additionalImages = [] }: ListingImageProps) {
    const [imageError, setImageError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Combine main image and additional images into a single array
    // Filter out empty strings just in case
    const allImages = [mainImage, ...additionalImages].filter(Boolean);
    const hasMultipleImages = allImages.length > 1;

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        if (currentIndex < allImages.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(0); // Loop back to start
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setCurrentIndex(allImages.length - 1); // Loop to end
        }
    };

    const currentImage = allImages[currentIndex];

    // If no images at all or error loading primary, show fallback
    // Note: If additional images exist but main fails, we might still want to show them?
    // For now, if current image fails, we show fallback for that specific view.
    // If main image is missing initially, `allImages` might be empty if filter(Boolean) removes it.

    if (allImages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-white/20 h-full w-full bg-[#1a2f23]">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center mb-2">
                    <span className="text-xl font-bold">{title.charAt(0)}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider">No Image</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group/image">
            {/* Image */}
            <img
                src={currentImage}
                alt={`${title} - View ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => {
                    // If complex error handling needed (e.g. remove from array), can do here
                    // For now, just show error state for this specific render
                    setImageError(true);
                }}
            />

            {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 bg-[#1a2f23]">
                    <span className="text-[10px] uppercase tracking-wider">Image Error</span>
                </div>
            )}


            {/* Navigation Controls */}
            {hasMultipleImages && (
                <>
                    {/* Arrows - visible on hover */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/10 z-10"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/10 z-10"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {allImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm",
                                    idx === currentIndex
                                        ? "bg-white scale-125"
                                        : "bg-white/40 hover:bg-white/60"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

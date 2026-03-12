'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#112117] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#19e66b]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#19e66b]/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-8 h-8 text-[#19e66b]"
                        >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
                    <p className="text-white/60">
                        You need to be logged in to interact with the marketplace. Please sign in or create an account to continue.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link href="/login" className="w-full">
                        <button className="w-full bg-[#19e66b] hover:bg-[#16cc5f] text-[#112117] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(25,230,107,0.3)] hover:shadow-[0_0_20px_rgba(25,230,107,0.5)]">
                            Log In
                        </button>
                    </Link>
                    <Link href="/register" className="w-full">
                        <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl border border-white/10 transition-all">
                            Create Account
                        </button>
                    </Link>
                </div>
            </div>
        </div>,
        document.body
    );
}

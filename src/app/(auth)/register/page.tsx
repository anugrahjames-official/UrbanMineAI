"use client";

import { Button } from "@/components/ui/button";
import { Recycle, Mail, Lock, Smartphone as Phone, User, Building, MapPin, ArrowRight, Zap as ZapIcon, Globe as PublicIcon } from "lucide-react";
import Link from "next/link";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { PhoneInput } from "@/components/ui/phone-input";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);



    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error: signUpErr } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        first_name: firstName.trim(),
                        middle_name: middleName.trim(),
                        last_name: lastName.trim(),
                        business_name: businessName.trim(),
                        phone: phone.trim(),
                        location: location.trim(),
                    }
                },


            });

            if (signUpErr) {
                if (signUpErr.message.includes("rate limit")) {
                    setError("Too many registration attempts. Please wait a while or check your email.");
                } else {
                    setError(signUpErr.message);
                }
                return;
            }

            if (data.user && data.user.identities && data.user.identities.length === 0) {
                setError("An account with this email already exists. Please sign in.");
                return;
            }

            // If session exists, email confirmation is disabled or not required
            if (data.session) {
                setSuccess("Registration successful! Redirecting...");
                router.refresh(); // Refresh router cache
                router.push("/role-selection");
                return;
            }

            setSuccess("Registration successful! Please check your email to confirm your account.");
            // Optional: redirect to login after a delay or show a specific success view
            setTimeout(() => {
                router.push("/login?verified=false");
            }, 3000);

        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex h-screen w-full flex-row bg-background-dark overflow-hidden selection:bg-primary selection:text-black">
            {/* Left side - Branding (Desktop) - Same as Login for consistency */}
            <div className="hidden lg:flex w-5/12 relative flex-col justify-between p-12 bg-gray-900 border-r border-white/5 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-background-dark/90 to-background-dark z-10" />
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqElLJ_qkJqcNoODQhaScnUASIw6tVQ304K8rqT5DhK0X3eZoQGWDDUH8QWwtOVp1c_dl2kigTddKdcUN782fYZG5IRDfxwpGSsvhlHYYPy2C6MipvAkjipE16lhviC79aPqGlYhc9t9AXgFLxetsrnFLM0QmBfVp7KVzYvdrlRMauk47xFbwvtLD7ILmQtSdGLT-ShaVzmakdJ8aYSup_y-RuuKJqJ00bUD_0ebE4l_p7fKWxW_mdNrjD6_f73egY_OGPp1HiLYlW"
                        alt="Circuit background"
                        className="h-full w-full object-cover opacity-40 mix-blend-overlay grayscale"
                    />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-background-dark font-bold">
                            <Recycle size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">UrbanMineAI</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight text-white">
                        Join the <span className="text-primary">Circular Economy</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-light leading-relaxed">
                        Create an account to start trading electronic scrap globally with AI-powered grading and instant valuations.
                    </p>
                    <div className="pt-8 grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <ZapSVG className="text-primary" />
                            <span className="font-semibold text-white">Fast Setup</span>
                            <span className="text-xs text-gray-400">Get started in minutes</span>
                        </div>
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <PublicSVG className="text-primary" />
                            <span className="font-semibold text-white">Verified Network</span>
                            <span className="text-xs text-gray-400">Trusted global partners</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm text-gray-500">
                    <span>© 2026 UrbanMineAI Inc.</span>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-7/12 h-full bg-background-dark relative overflow-y-auto custom-scrollbar flex flex-col">
                {/* Mobile logo header */}
                <div className="lg:hidden p-6 pb-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-background-dark font-bold">
                            <Recycle size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">UrbanMineAI</span>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-md space-y-8 py-12 lg:py-24">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
                        <p className="text-gray-400">Enter your details to register.</p>
                    </div>

                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="space-y-4">
                            {/* Name breakdown grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300" htmlFor="firstName">First Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <User size={18} />
                                        </div>
                                        <input
                                            id="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300" htmlFor="middleName">Middle Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <User size={18} />
                                        </div>
                                        <input
                                            id="middleName"
                                            type="text"
                                            placeholder="Quincy"
                                            value={middleName}
                                            onChange={(e) => setMiddleName(e.target.value)}
                                            className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300" htmlFor="lastName">Last Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <User size={18} />
                                        </div>
                                        <input
                                            id="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300" htmlFor="businessName">Business Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <Building size={18} />
                                    </div>
                                    <input
                                        id="businessName"
                                        type="text"
                                        placeholder="Eco Corp"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300" htmlFor="phone">Phone Number</label>
                                <PhoneInput
                                    id="phone"
                                    value={phone}
                                    onChange={setPhone}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300" htmlFor="location">Location</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        id="location"
                                        type="text"
                                        placeholder="City, Country"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300" htmlFor="email">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300" htmlFor="password">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm autofocus-dark"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                        </div>

                        {error && (
                            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                                {success}
                            </div>
                        )}

                        <Button className="w-full py-6 text-base shadow-glow-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Creating account..." : "Create account"}
                            {!isSubmitting && <ArrowRight size={18} />}
                        </Button>
                    </form>



                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:text-primary/80">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Simple icons to avoid extra dependencies for now
function ZapSVG({ className }: { className?: string }) {
    return <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}

function PublicSVG({ className }: { className?: string }) {
    return <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
        </svg>
    );
}

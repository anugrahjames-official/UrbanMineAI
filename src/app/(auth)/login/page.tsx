"use client";

import { Button } from "@/components/ui/button";
import { Recycle, Mail, Lock, Smartphone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function routeAfterLogin() {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData.user) {
      setError(authErr?.message ?? "Unable to load session. Please try again.");
      return;
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email ?? email;

    // Try to read existing profile/role.
    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    // If the row doesn't exist yet, create it with null role.
    if ((!userRow || userRow.role == null) && !userErr) {
      const { error: insertErr } = await supabase.from("users").insert({
        id: userId,
        email: userEmail,
        role: null,
      });
      // If insert fails due to RLS, we still continue to role selection.
      if (insertErr) {
        // keep silent; role-selection will guide user and retry update
      }
    }

    const role = userRow?.role as "dealer" | "recycler" | "oem" | null | undefined;
    if (!role) {
      router.push("/role-selection");
      return;
    }

    if (role === "dealer") router.push("/dealer/dashboard");
    else if (role === "recycler") router.push("/recycler/procurement");
    else router.push("/oem/compliance");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) {
        setError(signInErr.message);
        return;
      }
      await routeAfterLogin();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen w-full flex-row bg-background-dark overflow-hidden selection:bg-primary selection:text-black">
      {/* Left side - Branding (Desktop) */}
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
            Global E-Waste Trading <span className="text-primary">Powered by AI</span>
          </h1>
          <p className="text-lg text-gray-400 font-light leading-relaxed">
            Connect directly with verified recyclers and dealers worldwide. Leverage our AI grading system to get fair, instant valuations for your electronic scrap.
          </p>
          <div className="pt-8 grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ZapIcon className="text-primary" />
              <span className="font-semibold text-white">AI Grading</span>
              <span className="text-xs text-gray-400">Instant quality assessment</span>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <PublicIcon className="text-primary" />
              <span className="font-semibold text-white">Global Trade</span>
              <span className="text-xs text-gray-400">Zero cross-border friction</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-gray-500">
          <span>© 2026 UrbanMineAI Inc.</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-7/12 h-full bg-background-dark relative overflow-y-auto custom-scrollbar flex flex-col justify-center">
        {/* Mobile logo header (matches Stitch) */}
        <div className="lg:hidden p-6 pb-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-background-dark font-bold">
              <Recycle size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">UrbanMineAI</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="text-gray-400">Enter your credentials to access your global dashboard.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
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
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300" htmlFor="password">Password</label>
                  <Link href="#" className="text-sm font-medium text-primary hover:text-primary/80">Forgot password?</Link>
                </div>
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
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 bg-surface-input-dark placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                    autoComplete="current-password"
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

            <Button className="w-full py-6 text-base shadow-glow-primary" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>



          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple icons to avoid extra dependencies for now
function ZapIcon({ className }: { className?: string }) {
  return <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}

function PublicIcon({ className }: { className?: string }) {
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

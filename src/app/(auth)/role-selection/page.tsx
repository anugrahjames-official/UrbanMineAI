"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Smartphone, Factory, Building2, Check, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function RoleSelectionPage() {
  const [role, setRole] = useState<'dealer' | 'recycler' | 'oem'>('dealer');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getRedirectPath = useCallback((selectedRole: string) => {
    if (selectedRole === "dealer") return "/dealer/dashboard";
    if (selectedRole === "recycler") return "/recycler/procurement";
    if (selectedRole === "oem") return "/oem/compliance";
    return null;
  }, []);

  useEffect(() => {
    async function checkExistingRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role) {
        const path = getRedirectPath(userData.role);
        if (path) {
          router.replace(path);
          return;
        }
      }
      setLoading(false);
    }

    checkExistingRole();
  }, [router, getRedirectPath]);

  const handleContinue = async () => {
    const supabase = createClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData.user) {
      router.push("/login");
      return;
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email ?? "";
    const metadata = authData.user.user_metadata;

    // Ensure user row exists, then set role and sync metadata.
    await supabase.from("users").upsert({
      id: userId,
      email: userEmail,
      role,
      first_name: metadata?.first_name || null,
      middle_name: metadata?.middle_name || null,
      last_name: metadata?.last_name || null,
      trust_score: 30, // Use schema-defined default of 30 for new role selection
    });

    if (role === "dealer") router.replace("/dealer/dashboard");
    else if (role === "recycler") router.replace("/recycler/procurement");
    else router.replace("/oem/compliance");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-dark">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Choose Your Role</h1>
          <p className="text-gray-400 text-lg">Select how you want to use the UrbanMineAI platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <RoleOption
            active={role === 'dealer'}
            onClick={() => setRole('dealer')}
            icon={<Smartphone size={32} />}
            title="Dealer / Collector"
            description="Informal aggregators, Kabadiwalas, or New Innings entrepreneurs."
          />
          <RoleOption
            active={role === 'recycler'}
            onClick={() => setRole('recycler')}
            icon={<Factory size={32} />}
            title="Recycler"
            description="Processors looking for high-quality, pre-sorted e-waste feedstock."
          />
          <RoleOption
            active={role === 'oem'}
            onClick={() => setRole('oem')}
            icon={<Building2 size={32} />}
            title="Electronics OEM"
            description="Manufacturers needing EPR credits and compliance traceability."
          />
        </div>

        <div className="pt-8">
          <Button
            size="lg"
            className="w-full md:w-64 py-7 text-lg shadow-glow-primary gap-3"
            onClick={handleContinue}
          >
            Complete Setup <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RoleOption({ active, onClick, icon, title, description }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, description: string }) {
  return (
    <GlassCard
      onClick={onClick}
      className={`relative flex flex-col items-center p-8 gap-4 cursor-pointer transition-all duration-300 border-2 ${active
        ? "border-primary bg-primary/5 scale-105"
        : "border-white/5 hover:border-white/20"
        }`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors ${active ? "bg-primary text-background-dark" : "bg-white/5 text-gray-500"
        }`}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className={`text-xl font-bold transition-colors ${active ? "text-primary" : "text-white"}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
      {active && (
        <div className="absolute top-4 right-4 bg-primary text-background-dark rounded-full p-1 shadow-lg">
          <Check size={16} strokeWidth={3} />
        </div>
      )}
    </GlassCard>
  );
}

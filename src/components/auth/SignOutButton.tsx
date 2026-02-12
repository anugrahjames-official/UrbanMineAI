"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "@/components/icons";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    async function signOut() {
        setIsSigningOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setIsSigningOut(false);
        }
    }

    return (
        <button
            onClick={signOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all text-sm font-semibold w-full sm:w-auto justify-center group disabled:opacity-50"
        >
            <LogOut size={18} className="transition-transform group-hover:scale-110" />
            {isSigningOut ? "Signing out..." : "Sign Out"}
        </button>
    );
}

import { Button } from "@/components/ui/button";
import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Recycle, Camera, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen p-8 space-y-12">
      <header className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow-primary">
          <Recycle className="text-background-dark" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">UrbanMine<span className="text-primary">AI</span></h1>
      </header>

      <main className="max-w-4xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Global E-Waste Trading <br />
            <span className="text-primary">Powered by Agentic AI</span>
          </h2>
          <p className="text-text-secondary-dark text-lg max-w-2xl">
            Formalizing the informal e-waste supply chain. Connect with verified recyclers,
            get instant AI-driven valuations, and automate your compliance.
          </p>
          <div className="flex gap-4 pt-4">
            <Button size="lg">Get Started</Button>
            <Button variant="secondary" size="lg">Learn More</Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI Sorter Agent</h3>
            <p className="text-text-secondary-dark">
              Point your camera at any e-waste to identify components and get instant REE yield estimates.
            </p>
            <StatusBadge variant="success">Live Grading</StatusBadge>
          </GlassCard>

          <Card className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ShieldCheck className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold">Compliance Vault</h3>
            <p className="text-text-secondary-dark">
              Automated Form-6 and EPR certificate generation for every transaction. Verified and secure.
            </p>
            <div className="flex gap-2">
              <StatusBadge variant="primary">Verified</StatusBadge>
              <StatusBadge variant="info">EPR Ready</StatusBadge>
            </div>
          </Card>
        </section>

        <section className="pt-8">
          <Card className="bg-surface-darker border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Live Market Rate</p>
              <h4 className="text-2xl font-bold">Copper (Mixed Grade)</h4>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">$10<span className="text-lg text-text-secondary-dark">/kg</span></p>
              <p className="text-success text-sm flex items-center gap-1">
                <Zap size={14} fill="currentColor" /> +2.4% today
              </p>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
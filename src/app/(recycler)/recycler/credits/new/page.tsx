"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { listEprCredit } from "@/app/actions/recycler";

export default function NewEprCreditPage() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      listEprCredit(formData);
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">List EPR Credit</h1>
        <p className="text-sm text-gray-400">Offer your verified EPR credits to OEMs on the Global Marketplace.</p>
      </header>

      <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 sm:p-8">
        <form action={handleSubmit} className="space-y-6 flex flex-col">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Title</label>
            <input 
              name="title" 
              required 
              placeholder="e.g., Q3 Battery Recycling Credits" 
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Waste Category</label>
              <select name="category" className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-gray-300 focus:ring-1 focus:ring-primary outline-none">
                <option value="Li-ion Batteries">Li-ion Batteries</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Solar Panels">Solar Panels</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Total Weight (kg)</label>
              <input 
                name="weight" 
                type="number" 
                required 
                placeholder="5000" 
                min="1"
                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Estimated Value / kg (USD)</label>
            <input 
              name="estimatedValue" 
              type="text" 
              required 
              placeholder="$0.15" 
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Description & Verification Details</label>
            <textarea 
              name="description" 
              rows={4} 
              placeholder="Describe the source of these credits and any certification links..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none resize-none" 
            />
          </div>

          <Button 
            disabled={isPending} 
            type="submit" 
            className="w-full py-6 font-bold shadow-glow-primary mt-4"
          >
            {isPending ? "Listing..." : "Post to Marketplace"}
          </Button>
        </form>
      </div>
    </div>
  );
}

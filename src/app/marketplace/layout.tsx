import { icons } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'UrbanMineAI | Marketplace',
    description: 'Global E-Waste Marketplace',
};

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#112117] text-white selection:bg-[#19e66b] selection:text-[#112117]">
            {children}
        </div>
    );
}

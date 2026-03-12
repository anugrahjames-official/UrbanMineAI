import { getUserProfile } from "@/app/actions/user";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { RecyclerSidebar, MobileNav } from "@/components/recycler/Sidebar";
import { requireRole } from "@/lib/auth";

export default async function RecyclerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user has recycler role, redirect if not
  await requireRole(['recycler']);

  const profile = await getUserProfile();

  return (
    <div className="flex min-h-screen bg-background-dark text-white font-sans overflow-hidden">
      <RecyclerSidebar profile={profile} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <DashboardHeader title="Recycler Dashboard" profile={profile} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 lg:pb-6">
          {children}
        </div>

        <MobileNav />
      </main>
    </div>
  );
}


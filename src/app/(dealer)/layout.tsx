import { getUserProfile } from "@/app/actions/user";
import { DealerSidebar, MobileNav } from "@/components/dealer/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user profile on the server
  const profile = await getUserProfile();

  return (
    <div className="flex min-h-screen bg-background-dark text-white font-sans overflow-hidden">
      <DealerSidebar profile={profile} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <DashboardHeader title="Dashboard" profile={profile} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        <MobileNav />
      </main>
    </div>
  );
}


import { getUserProfile } from "@/app/actions/user";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OEMSidebar } from "@/components/oem/Sidebar";
import { requireRole } from "@/lib/auth";

export default async function OEMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user has oem role, redirect if not
  await requireRole(['oem']);

  const profile = await getUserProfile();

  return (
    <div className="flex min-h-screen bg-background-dark text-white font-sans overflow-hidden">
      <OEMSidebar profile={profile} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        <DashboardHeader title="OEM Dashboard" profile={profile} />
        {children}
      </main>
    </div>
  );
}


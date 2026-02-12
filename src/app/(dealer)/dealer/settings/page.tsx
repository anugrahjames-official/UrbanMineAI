import { Card, GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  User,
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  MapPin,
  Smartphone,
  LogOut,
  Info,
  History,
  Recycle,
  Copy,
  Mail,
  Business,
  CheckCircle,
  ChevronRight,
  Search,
  Download,
  Trash2,
  Lock
} from "@/components/icons";
import { getDealerProfile, getDealerAnalytics } from "@/app/actions/dealer";
import { getUserProfile } from "@/app/actions/user";
import Link from "next/link";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function DealerSettingsPage() {
  const profile = await getDealerProfile();
  const stats = await getDealerAnalytics();
  const userFullProfile = await getUserProfile();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 py-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings & Profile</h1>
        <p className="text-gray-400 text-sm">Manage your account details, trust score, and app preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 relative overflow-hidden border-white/5 bg-surface-dark/40">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full p-1 border-2 border-primary/50 relative">
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-dark flex items-center justify-center">
                    {profile.name ? (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=19e66b&color=112117&bold=true&size=128`}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-primary/50" size={40} />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-background-dark text-primary p-1.5 rounded-full shadow-lg border border-primary/20 hover:bg-primary hover:text-background-dark transition-all transform hover:scale-110">
                    <SettingsIcon size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{userFullProfile.name}</h2>
                  {userFullProfile.isVerified && <ShieldCheck size={20} className="text-primary" fill="currentColor" />}
                </div>
                <div className="flex items-center justify-center gap-2">
                  {userFullProfile.isVerified ? (
                    <StatusBadge variant="primary">
                      <CheckCircle size={12} className="mr-1" />
                      Verified {userFullProfile.role || 'Dealer'}
                    </StatusBadge>
                  ) : (
                    <StatusBadge variant={null} className="bg-white/5 text-gray-500 border-white/10">
                      Not Verified {userFullProfile.role || 'Dealer'}
                    </StatusBadge>
                  )}
                </div>
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2 font-medium">
                  <MapPin size={12} className="text-primary" />
                  {userFullProfile.location || 'Location Not Set'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-400">Trust Score</span>
                <Info size={14} className="text-gray-600 hover:text-primary cursor-help transition-colors" />
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                    <circle className="text-white/5" cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="4" />
                    <circle
                      className="text-primary"
                      cx="28"
                      cy="28"
                      r="24"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 * (1 - (userFullProfile.trust_score || 0) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                    {userFullProfile.trust_score || 0}
                  </span>
                </div>
                <div>
                  <div className="text-md font-bold text-primary">{userFullProfile.tier || 'Excellent'}</div>
                  <div className="text-[10px] text-gray-500 font-medium">Top {userFullProfile.percentile || 100}% of global users</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-surface-dark/40 border-white/5 p-4 text-center hover:border-primary/20 transition-all cursor-pointer group">
              <div className="flex justify-center mb-2">
                <History size={20} className="text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl font-bold text-white">{stats?.transactionsCount || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Transactions</div>
            </Card>
            <Card className="bg-surface-dark/40 border-white/5 p-4 text-center hover:border-primary/20 transition-all cursor-pointer group">
              <div className="flex justify-center mb-2">
                <Recycle size={20} className="text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl font-bold text-white">{(stats?.totalEwasteWeight || 0).toFixed(1)}kg</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">E-Waste Processed</div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-surface-dark/40 border-white/5 p-6 space-y-8">
            <ProfileForm user={userFullProfile} />
          </Card>
        </div>
      </div>
    </div>
  );
}


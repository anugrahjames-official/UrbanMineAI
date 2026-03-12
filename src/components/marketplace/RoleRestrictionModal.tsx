'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Lock, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/user';

interface RoleRestrictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredRole: 'recycler' | 'dealer';
    action: string;
}

export default function RoleRestrictionModal({
    isOpen,
    onClose,
    requiredRole,
    action
}: RoleRestrictionModalProps) {

    const handleSwitchAccount = async () => {
        await signOut();
    };

    const roleName = requiredRole === 'recycler' ? 'Recycler' : 'Dealer';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#112117] border border-white/10 text-white max-w-md w-[95vw] rounded-2xl p-8">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <Lock className="w-10 h-10 text-amber-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold mb-2">
                        {roleName} Access Required
                    </DialogTitle>
                    <DialogDescription className="text-white/60 text-base leading-relaxed">
                        Only <span className="text-amber-500 font-semibold">{roleName}s</span> can {action}.
                        Your current account role does not have permission for this action.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={handleSwitchAccount}
                        className="w-full bg-white hover:bg-gray-100 text-[#112117] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        <LogOut size={18} />
                        Switch to {roleName} Account
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 text-white/40 hover:text-white transition-colors text-sm font-medium"
                    >
                        Maybe later
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
            </DialogContent>
        </Dialog>
    );
}

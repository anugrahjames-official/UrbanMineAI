import { User } from "@/components/icons";
import { UserProfile } from "@/app/actions/user";

interface UserAvatarProps {
    user: Pick<UserProfile, 'avatar_url' | 'email' | 'name'>;
    className?: string;
    fallbackClassName?: string;
}

export function UserAvatar({ user, className = "w-10 h-10", fallbackClassName }: UserAvatarProps) {
    // Generate dealer name for fallback if needed
    // Prefer name, then email prefix
    const displayName = user.name || user.email?.split('@')[0] || 'User';

    // Check if it's the default "User" fallback or meaningful name for ui-avatars
    // If exact match 'User' or just email prefix might be considered generic, but let's stick to simple logic:
    // Any non-empty name that isn't just 'User' probably deserves initials.
    const showInitials = displayName && displayName !== 'User';

    if (user.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt={displayName}
                className={`${className} rounded-full object-cover border-2 border-primary/20`}
            />
        );
    }

    if (showInitials) {
        return (
            <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=19e66b&color=112117&bold=true&size=128`}
                alt={displayName}
                className={`${className} rounded-full object-cover border-2 border-primary/20`}
            />
        );
    }

    return (
        <div className={`${className} rounded-full bg-surface-dark flex items-center justify-center border-2 border-primary/20`}>
            <User className={fallbackClassName || "text-primary/50"} size={20} />
        </div>
    );
}

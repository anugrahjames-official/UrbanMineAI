
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full overflow-hidden">
            <ChatSidebar />
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {children}
            </div>
        </div>
    );
}

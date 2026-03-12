
import { MessageSquare } from "lucide-react";

export default function ChatIndexPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-background-dark/50">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                <MessageSquare size={32} className="opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">UrbanMine AI Broker</h2>
            <p className="text-sm max-w-sm leading-relaxed text-gray-500">
                Select an active negotiation from the sidebar to continue chatting with the AI agent, or wait for new buy requests.
            </p>
        </div>
    );
}

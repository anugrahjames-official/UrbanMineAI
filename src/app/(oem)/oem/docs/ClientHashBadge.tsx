"use client";

import { Copy } from "lucide-react";

export default function ClientHashBadge({ shortHash, fullHash }: { shortHash: string; fullHash?: string }) {
  const handleCopy = () => {
    if (fullHash) {
      navigator.clipboard.writeText(fullHash);
    }
  };

  return (
    <div className="flex items-center gap-2 cursor-pointer group/hash" onClick={handleCopy}>
      <span className="font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
        {shortHash}
      </span>
      <Copy size={12} className="text-gray-600 opacity-0 group-hover/hash:opacity-100 transition-opacity" />
    </div>
  );
}

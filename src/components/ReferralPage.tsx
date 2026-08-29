import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Share2, Copy } from "lucide-react";

export function ReferralPage() {
  const player = useQuery(api.game.getPlayer);
  const [copied, setCopied] = useState(false);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const code = player.nickname ? `SHADOW-${player.nickname.toUpperCase()}-${player._id?.slice(-6)}` : "UNKNOWN";
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Share2 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Referral System</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-4xl">🔗</div>
        <div className="text-sm text-muted-foreground">Share your referral code with friends</div>
        <div className="bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm">{code}</div>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold">
          {copied ? "✅ Copied!" : <><Copy className="size-4 inline mr-1" />Copy Code</>}
        </button>
        <div className="text-xs text-muted-foreground">Earn $500 for each friend who signs up!</div>
      </div>
    </div>
  );
}

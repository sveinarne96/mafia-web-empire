import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CommunityHubPage } from "./CommunityHubPage";

function CommunityPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sections = [
    { id: "general", icon: "📜", title: "General Conduct", rules: [
      { s: "critical" as const, t: "Be respectful to all players. Toxicity, hate speech, racism, sexism, or discrimination = immediate ban." },
      { s: "critical" as const, t: "No personal attacks, threats, doxxing, or sharing real-life personal information of other players." },
      { s: "warning" as const, t: "Keep chat appropriate. No excessive profanity, sexual content, or spam in public channels." },
      { s: "warning" as const, t: "Respect staff decisions. If you disagree, use Live Support to appeal." },
      { s: "info" as const, t: "No advertising other games, services, or external links without staff approval." },
    ]},
    { id: "gameplay", icon: "🎮", title: "Gameplay Fairness", rules: [
      { s: "critical" as const, t: "No exploiting bugs, glitches, or unintended mechanics. Report bugs via Support -- exploiting = ban." },
      { s: "critical" as const, t: "No bots, auto-clickers, scripts, macros, or any automated tools." },
      { s: "critical" as const, t: "VPN abuse for multiple accounts, ban bypass, or manipulation is prohibited." },
      { s: "warning" as const, t: "Do not intentionally lag or disconnect to gain advantages." },
      { s: "critical" as const, t: "Alt accounts must not be used for farming, market manipulation, self-boosting, or ban circumvention." },
    ]},
    { id: "economy", icon: "💰", title: "Economy & Trading", rules: [
      { s: "critical" as const, t: "Real-money trading (RMT) of in-game items, currency, or accounts is strictly prohibited." },
      { s: "warning" as const, t: "Scamming through in-game mechanics IS part of the game -- but social engineering for real-world info is not." },
      { s: "critical" as const, t: "Do not duplicate items or currency. Report duplication methods immediately." },
      { s: "warning" as const, t: "Market price fixing through coordinated multi-account effort is prohibited." },
    ]},
    { id: "social", icon: "💬", title: "Social & Communication", rules: [
      { s: "critical" as const, t: "Doxxing (sharing real identity, address, phone) = instant permanent ban." },
      { s: "critical" as const, t: "Impersonating staff or other players is prohibited." },
      { s: "critical" as const, t: "No NSFW content in profile pictures, usernames, or public messages." },
      { s: "warning" as const, t: "Betrayal and deception are valid in-game tactics. Real-world retaliation is not tolerated." },
    ]},
    { id: "punishments", icon: "⚖️", title: "Punishments", rules: [
      { s: "info" as const, t: "First offense (minor): Warning + temporary mute (1-24 hours)." },
      { s: "warning" as const, t: "Second offense: 24-72 hour suspension + in-game asset seizure." },
      { s: "warning" as const, t: "Third offense or major violation: 7-30 day suspension or permanent ban." },
      { s: "critical" as const, t: "Critical violations (doxxing, threats, RMT, hacking): Immediate permanent ban with no appeal." },
    ]},
    { id: "security", icon: "🔒", title: "Account Security", rules: [
      { s: "warning" as const, t: "You are responsible for your account security. Use a strong, unique password." },
      { s: "warning" as const, t: "Do not share account credentials. Account sharing is at your own risk." },
      { s: "info" as const, t: "Staff will never ask for your password or authentication details." },
    ]},
  ];
  const colorMap: Record<string, string> = { critical: "border-red-500/30 text-red-300 bg-red-500/10", warning: "border-amber-500/30 text-amber-300 bg-amber-500/10", info: "border-blue-500/30 text-blue-300 bg-blue-500/10" };
  return (
    <div className="animate-fade-in space-y-4">
      <CommunityHubPage />
      <div className="flex items-center gap-3"><span className="text-3xl">📜</span><h2 className="text-2xl font-bold">Community Guidelines</h2></div>
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs text-slate-400">
        <span className="font-bold text-red-300">These rules are binding.</span> Violating any rule may result in warnings, suspensions, asset seizures, or permanent bans. You accepted these rules when you first entered the game.
      </div>
      <div className="space-y-2">
        {sections.map(s => (
          <div key={s.id} className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="w-full p-3 flex items-center justify-between hover:bg-slate-800/30">
              <div className="flex items-center gap-2"><span>{s.icon}</span><span className="text-sm font-bold text-white">{s.title}</span><span className="text-[10px] text-slate-500">({s.rules.length} rules)</span></div>
              <ChevronDown className={`size-4 text-slate-500 transition-transform ${expanded === s.id ? "rotate-180" : ""}`} />
            </button>
            {expanded === s.id && (
              <div className="px-3 pb-3 space-y-2 border-t border-slate-700/30 pt-2">
                {s.rules.map((r, i) => (
                  <div key={i} className={`${colorMap[r.s]} border rounded-lg p-2.5 flex items-start gap-2`}>
                    <span className="text-[9px]">{r.s === "critical" ? "🚫" : r.s === "warning" ? "⚠️" : "ℹ️"}</span>
                    <p className="text-[11px] leading-relaxed">{r.t}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export { CommunityPage };

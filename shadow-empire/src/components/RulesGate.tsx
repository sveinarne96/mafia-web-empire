import { useState, useEffect, useRef } from "react";
import { 
  Shield, AlertTriangle, Ban, Skull, Scale, Eye, Lock, 
  CheckCircle2, ChevronDown, ChevronRight, Clock, 
  MessageSquare, UserX, Bomb, Gavel, FileWarning, 
  ShieldCheck, ShieldAlert, Coins, Swords, Heart,
  ScrollText, BookOpen, AlertCircle
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// RULES DATA
// ═══════════════════════════════════════════════════════════════════

interface RuleSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  rules: { text: string; severity: "info" | "warning" | "critical" }[];
}

const RULE_SECTIONS: RuleSection[] = [
  {
    id: "general",
    title: "General Conduct",
    icon: "📜",
    color: "blue",
    rules: [
      { text: "Be respectful to all players. Toxicity, hate speech, racism, sexism, or any form of discrimination will result in an immediate ban.", severity: "critical" },
      { text: "No personal attacks, threats, doxxing, or sharing real-life personal information of other players.", severity: "critical" },
      { text: "Keep chat appropriate. No excessive profanity, sexual content, or spam in public channels.", severity: "warning" },
      { text: "English is the primary language in public channels. Use private messages for other languages.", severity: "info" },
      { text: "Respect staff decisions. If you disagree with a moderation action, use the Support system to appeal — not public chat.", severity: "warning" },
      { text: "No advertising other games, services, or external links without staff approval.", severity: "warning" },
    ],
  },
  {
    id: "gameplay",
    title: "Gameplay Fairness",
    icon: "🎮",
    color: "green",
    rules: [
      { text: "No exploiting bugs, glitches, or unintended mechanics. If you find a bug, report it via Support — exploiting it will result in a ban.", severity: "critical" },
      { text: "No using bots, auto-clickers, scripts, macros, or any automated tools to play the game.", severity: "critical" },
      { text: "NoVPN abuse. Using VPNs to create multiple accounts, bypass bans, or manipulate server mechanics is prohibited.", severity: "critical" },
      { text: "Do not intentionally lag, disconnect, or manipulate your connection to gain advantages in PvP or heists.", severity: "warning" },
      { text: "Alt accounts are allowed but must not be used to: farm resources, manipulate markets, self-boost, or circumvent bans.", severity: "critical" },
      { text: "Market manipulation through coordinated buyouts to artificially inflate prices is prohibited.", severity: "warning" },
    ],
  },
  {
    id: "economy",
    title: "Economy & Trading",
    icon: "💰",
    color: "amber",
    rules: [
      { text: "Real-money trading (RMT) of in-game items, currency, or accounts is strictly prohibited.", severity: "critical" },
      { text: "Scamming other players through in-game mechanics (fake trades, deception) IS part of the game — but social engineering to obtain real-world information is not.", severity: "warning" },
      { text: "Do not duplicate items or currency through any means. If you discover a duplication method, report it immediately.", severity: "critical" },
      { text: "Market prices are player-driven. Price fixing through coordinated effort with multiple accounts is prohibited.", severity: "warning" },
      { text: "Do not offer real-world rewards (gift cards, money, etc.) for in-game services or items.", severity: "critical" },
      { text: "In-game debt is binding. If you take a loan from another player or system, you are expected to repay it. Defaulting repeatedly will result in penalties.", severity: "warning" },
    ],
  },
  {
    id: "social",
    title: "Social & Communication",
    icon: "💬",
    color: "purple",
    rules: [
      { text: "Doxxing (sharing another player's real identity, address, phone number, etc.) is an instant permanent ban.", severity: "critical" },
      { text: "Impersonating staff members, other players, or claiming to be a developer is prohibited.", severity: "critical" },
      { text: "No NSFW content in profile pictures, usernames, or public messages.", severity: "critical" },
      { text: "Crews and families are player-organized groups. Staff does not intervene in crew disputes unless rules are broken.", severity: "info" },
      { text: "Betrayal, snitching, and deception are valid gameplay tactics within the game's systems. However, doxxing or real-world retaliation for in-game betrayals is not tolerated.", severity: "warning" },
      { text: "Public forums are moderated. Off-topic spam, flame wars, or deliberately inflammatory posts may be removed.", severity: "info" },
    ],
  },
  {
    id: "punishments",
    title: "Punishments & Enforcement",
    icon: "⚖️",
    color: "red",
    rules: [
      { text: "First offense (minor): Warning + temporary mute (1-24 hours).", severity: "info" },
      { text: "Second offense: 24-72 hour account suspension + in-game asset seizure.", severity: "warning" },
      { text: "Third offense or major violation: 7-30 day suspension or permanent ban.", severity: "warning" },
      { text: "Critical violations (doxxing, real threats, RMT, RMT, hacking): Immediate permanent ban with no appeal.", severity: "critical" },
      { text: "All moderation actions are logged. Repeated bans escalate to permanent.", severity: "info" },
      { text: "Ban appeals can be submitted through the Live Support system. Average review time: 48 hours.", severity: "info" },
    ],
  },
  {
    id: "security",
    title: "Account Security",
    icon: "🔒",
    color: "cyan",
    rules: [
      { text: "You are responsible for your account security. Use a strong, unique password.", severity: "warning" },
      { text: "Do not share your account credentials with anyone. Account sharing is at your own risk.", severity: "warning" },
      { text: "If your account is compromised, contact support immediately via Critical priority ticket.", severity: "info" },
      { text: "Staff will never ask for your password or authentication details.", severity: "info" },
      { text: "Any items or progress lost due to account compromise may not be recoverable. Enable all security features.", severity: "warning" },
    ],
  },
];

const TOTAL_RULES = RULE_SECTIONS.reduce((sum, s) => sum + s.rules.length, 0);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function RulesGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean>(() => {
    try { return localStorage.getItem("rules_accepted") === "true"; } catch { return false; }
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(60);
  const [checkboxes, setCheckboxes] = useState({
    conduct: false,
    gameplay: false,
    economy: false,
    social: false,
    punishments: false,
    security: false,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (accepted) return;
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [accepted]);

  const allRead = readSections.size >= RULE_SECTIONS.length;
  const allChecked = Object.values(checkboxes).every(Boolean);
  const canAccept = timer === 0 && allRead && allChecked;

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
    const newRead = new Set(readSections);
    newRead.add(id);
    setReadSections(newRead);
  };

  const handleAccept = () => {
    if (!canAccept) return;
    localStorage.setItem("rules_accepted", "true");
    setAccepted(true);
  };

  const handleReset = () => {
    localStorage.removeItem("rules_accepted");
    setAccepted(false);
    setTimer(60);
    setReadSections(new Set());
    setCheckboxes({ conduct: false, gameplay: false, economy: false, social: false, punishments: false, security: false });
    setExpandedSection(null);
  };

  if (accepted) return <>{children}</>;

  const checkboxKeys = ["conduct", "gameplay", "economy", "social", "punishments", "security"] as const;
  const sectionIds = ["general", "gameplay", "economy", "social", "punishments", "security"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-red-500/20 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
        {/* ─── HEADER ─── */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-900/40 via-amber-900/30 to-red-900/40 p-6 border-b border-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <ShieldAlert className="size-10 text-red-400" />
              <AlertCircle className="size-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-red-300 tracking-wider">⚠️ TERMS OF SERVICE & RULES</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">You must read and accept ALL rules before playing</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Read {readSections.size}/{RULE_SECTIONS.length} sections • {TOTAL_RULES} rules total</span>
              <span className={`font-bold ${allRead ? "text-green-400" : "text-amber-400"}`}>
                {allRead ? "✅ All sections read" : `${RULE_SECTIONS.length - readSections.size} sections remaining`}
              </span>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${allRead ? "bg-green-500" : "bg-amber-500"}`}
                style={{ width: `${(readSections.size / RULE_SECTIONS.length) * 100}%` }} />
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-amber-400" />
                <span className={`text-xs font-bold ${timer > 0 ? "text-amber-300" : "text-green-400"}`}>
                  {timer > 0 ? `Wait ${timer}s before accepting` : "✅ Ready to accept"}
                </span>
              </div>
              {timer > 0 && (
                <div className="text-[10px] text-slate-500">
                  Please take time to read all sections
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RULE SECTIONS ─── */}
        <div className="p-4 space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-red-400" />
              <span className="text-sm font-bold text-red-300">IMPORTANT — READ CAREFULLY</span>
            </div>
            <p className="text-[11px] text-slate-400">
              These rules are binding. Violating any rule may result in warnings, suspensions, asset seizures, 
              or permanent bans. Ignorance of the rules is not an excuse. By accepting, you agree to abide by 
              all rules and acknowledge that moderation decisions are final (appeals go through Support).
            </p>
          </div>

          {RULE_SECTIONS.map((section, si) => {
            const isExpanded = expandedSection === section.id;
            const isRead = readSections.has(section.id);
            const checkboxKey = checkboxKeys[si];

            return (
              <div key={section.id} className={`rounded-xl border overflow-hidden transition-all ${
                isRead ? "border-green-500/20 bg-green-500/5" : "border-slate-700/50 bg-slate-900/50"
              }`}>
                {/* Section Header */}
                <button onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{section.title}</span>
                        {isRead && <CheckCircle2 className="size-3.5 text-green-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500">{section.rules.length} rules</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="size-4 text-slate-500" /> : <ChevronRight className="size-4 text-slate-500" />}
                </button>

                {/* Expanded Rules */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-slate-700/30 pt-3">
                    {section.rules.map((rule, ri) => {
                      const severityConfig = {
                        info: { bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-300", badge: "bg-blue-500/20 text-blue-300", label: "INFO" },
                        warning: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300", label: "WARNING" },
                        critical: { bg: "bg-red-500/5", border: "border-red-500/20", text: "text-red-300", badge: "bg-red-500/20 text-red-300", label: "CRITICAL" },
                      };
                      const sc = severityConfig[rule.severity];
                      return (
                        <div key={ri} className={`${sc.bg} ${sc.border} border rounded-lg p-3 flex items-start gap-3`}>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${sc.badge}`}>
                            {rule.severity === "critical" ? "🚫" : rule.severity === "warning" ? "⚠️" : "ℹ️"} {sc.label}
                          </span>
                          <p className={`text-[11px] ${sc.text} leading-relaxed`}>{rule.text}</p>
                        </div>
                      );
                    })}

                    {/* Section Acknowledgment */}
                    <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checkboxes[checkboxKey]}
                        onChange={e => setCheckboxes(prev => ({ ...prev, [checkboxKey]: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        I have read and understood the {section.title} rules
                      </span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}

          {/* ─── ACCEPT SECTION ─── */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 mt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Scale className="size-4 text-amber-400" />
                Final Acknowledgment
              </div>

              {/* Individual checkboxes status */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {RULE_SECTIONS.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-1.5 text-[10px] ${checkboxes[checkboxKeys[i]] ? "text-green-400" : "text-slate-600"}`}>
                    {checkboxes[checkboxKeys[i]] ? <CheckCircle2 className="size-3" /> : <div className="w-3 h-3 rounded border border-slate-700" />}
                    {s.title}
                  </div>
                ))}
              </div>

              {/* Final checkbox */}
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={allChecked}
                  disabled={!allRead || timer > 0}
                  onChange={() => {}}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300">
                  I confirm that I have read, understood, and agree to abide by ALL {TOTAL_RULES} rules 
                  across all {RULE_SECTIONS.length} sections. I understand that violating these rules 
                  may result in warnings, suspensions, or permanent bans.
                </span>
              </label>

              {/* Accept Button */}
              <button onClick={handleAccept} disabled={!canAccept}
                className={`w-full py-3 rounded-xl text-sm font-black tracking-wider transition-all ${
                  canAccept
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20"
                    : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                }`}>
                {canAccept ? "✅ ACCEPT RULES & ENTER GAME" : 
                 timer > 0 ? `⏳ Wait ${timer}s to accept...` :
                 !allRead ? `📖 Read all ${RULE_SECTIONS.length} sections first` :
                 "☑️ Check all acknowledgment boxes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a way to reset (for testing / account support)
export function resetRules() {
  localStorage.removeItem("rules_accepted");
}

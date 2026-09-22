import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, Flame, Zap, ChevronRight, Star, Trophy, Swords, MapPin, Bomb, Crown, Moon, Skull, Banknote, Eye } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// EVENT DATA
// ═══════════════════════════════════════════════════════════════════

interface GameEvent {
  name: string;
  icon: string;
  desc: string;
  category: "seasonal" | "server" | "random";
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;
  dayOfWeek?: number;
  bonuses: string;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const ALL_EVENTS: GameEvent[] = [
  // ═══ SEASONAL ═══
  { name: "New Year's Heist", icon: "🎆", desc: "Special New Year event! Fireworks + heists! Double cash for 24h.", category: "seasonal", startMonth: 1, startDay: 1, endMonth: 1, endDay: 2, bonuses: "2x Cash • Fireworks Loot • NY themed crimes", color: "amber", rarity: "epic" },
  { name: "Valentine's Crime", icon: "❤️", desc: "Crime of passion! Romance scams +5x payout! Love is in the air...", category: "seasonal", startMonth: 2, startDay: 14, endMonth: 2, endDay: 14, bonuses: "5x Romance Scam • Heart Loot Boxes", color: "pink", rarity: "rare" },
  { name: "St. Patrick's Gold", icon: "☘️", desc: "Gold rush! All rewards have gold bonus +100%! Find the pot of gold.", category: "seasonal", startMonth: 3, startDay: 17, endMonth: 3, endDay: 17, bonuses: "2x Gold Rewards • Lucky Gambling • Green Loot", color: "emerald", rarity: "rare" },
  { name: "Spring Break Crime", icon: "🌸", desc: "College town crime wave! Easy targets everywhere! Tourists = money.", category: "seasonal", startMonth: 3, startDay: 2, endMonth: 3, endDay: 13, bonuses: "2x Pickpocket • Tourist Crime Boost", color: "pink", rarity: "common" },
  { name: "Easter Egg Hunt", icon: "🥚", desc: "Find hidden eggs across cities for prizes! Easter bunny has the loot.", category: "seasonal", startMonth: 3, startDay: 28, endMonth: 4, endDay: 6, bonuses: "Hidden Eggs • 2x Crafting • Rare Drops", color: "pink", rarity: "rare" },
  { name: "Summer Crime Wave", icon: "☀️", desc: "Summer heat brings crime heat! All crimes boosted +25%!", category: "seasonal", startMonth: 6, startDay: 21, endMonth: 6, endDay: 21, bonuses: "25% All Crime • Reduced Police • Heat Loot", color: "amber", rarity: "common" },
  { name: "Halloween Horror", icon: "🎃", desc: "Spooky crimes pay 3x! Ghost mode free! Horror loot everywhere.", category: "seasonal", startMonth: 10, startDay: 31, endMonth: 10, endDay: 31, bonuses: "3x Crime XP • Free Ghost Mode • Horror Loot", color: "orange", rarity: "epic" },
  { name: "Christmas Heist", icon: "🎄", desc: "Steal presents from Santa! Legendary loot! Holiday heists.", category: "seasonal", startMonth: 12, startDay: 25, endMonth: 12, endDay: 25, bonuses: "Gift Box Raids • Legendary Drops • Holiday Crimes", color: "red", rarity: "legendary" },
  { name: "Cyber Monday", icon: "💻", desc: "Hacking skills +5x. Digital crimes boosted! Tech heaven.", category: "seasonal", startMonth: 5, startDay: 2, endMonth: 5, endDay: 6, bonuses: "5x Hacking • 50% Tech Deals • Digital Loot", color: "cyan", rarity: "epic" },
  { name: "Black Friday Heist", icon: "🛒", desc: "Everything on sale! Crime costs reduced 50%! Mall robberies 3x.", category: "seasonal", startMonth: 11, startDay: 27, endMonth: 11, endDay: 27, bonuses: "50% Crime Costs • 3x Mall Robbery • Free Getaway", color: "red", rarity: "epic" },
  { name: "Tax Season Scam", icon: "📋", desc: "Tax evasion +10x rewards! IRS is busy! Fraud is profitable.", category: "seasonal", startMonth: 5, startDay: 8, endMonth: 5, endDay: 10, bonuses: "10x Fraud Income • Money Laundering Boost", color: "yellow", rarity: "rare" },
  { name: "Winter Wonderland", icon: "❄️", desc: "Blizzard = easy heists! Reduced patrols! Stealth +30%.", category: "seasonal", startMonth: 11, startDay: 10, endMonth: 11, endDay: 15, bonuses: "30% Stealth • Reduced Police • Holiday Heists", color: "blue", rarity: "common" },

  // ═══ SERVER EVENTS ═══
  { name: "Purge Night", icon: "💀", desc: "24 hours of lawlessness. No police. Maximum chaos! All crimes legal.", category: "server", startMonth: 1, startDay: 2, endMonth: 1, endDay: 6, bonuses: "No Police • 2x All Crime • No Arrests", color: "red", rarity: "legendary" },
  { name: "Blood Moon", icon: "🌑", desc: "All combat damage doubled. Kills give 5x XP! Bounties doubled.", category: "server", startMonth: 3, startDay: 1, endMonth: 3, endDay: 5, bonuses: "2x Combat Damage • 5x Kill XP • 2x Bounties", color: "red", rarity: "epic" },
  { name: "Robber's Moon", icon: "🌙", desc: "Full moon = all crimes have 20% better success! Perfect night.", category: "server", startMonth: 1, startDay: 10, endMonth: 1, endDay: 12, bonuses: "20% Crime Success • 2x Heist Rewards • Stealth +25%", color: "blue", rarity: "rare" },
  { name: "Full Moon", icon: "🌕", desc: "ALL boosts active! Crime + Combat + Gambling! Every ~29.5 days.", category: "server", bonuses: "2x Stealth • 50% Crime XP • Gambling Boost", color: "slate", rarity: "epic" },
  { name: "Grand Heist", icon: "🏦", desc: "Special heist event. 10x rewards on bank heists! New vaults.", category: "server", startMonth: 1, startDay: 20, endMonth: 1, endDay: 24, bonuses: "10x Bank Robbery • New Vaults • Elite Guards", color: "amber", rarity: "legendary" },
  { name: "Tournament Championship", icon: "🏆", desc: "Server-wide PvP tournament. Winner takes $500K! Every weekend.", category: "server", dayOfWeek: 5, bonuses: "Fight XP 3x • Title Rewards • Prize Pools", color: "amber", rarity: "epic" },
  { name: "Family War Week", icon: "⚔️", desc: "Family wars give 5x reputation! All-out faction warfare.", category: "server", startMonth: 2, startDay: 10, endMonth: 2, endDay: 20, bonuses: "5x Crew War Points • Territory +3x • Rep Boost", color: "red", rarity: "legendary" },
  { name: "Territory Takeover", icon: "📍", desc: "Fight for territory! +300% income! Every Wednesday.", category: "server", dayOfWeek: 3, bonuses: "3x Territory Points • Income Boost • Control Blocks", color: "blue", rarity: "rare" },
  { name: "Underground Championship", icon: "💣", desc: "Underground tournament. Best fighter wins! Massive prizes.", category: "server", startMonth: 2, startDay: 21, endMonth: 2, endDay: 25, bonuses: "Fight Tournament • Prize Pools • Underground Loot", color: "orange", rarity: "epic" },
  { name: "Crime Empire Week", icon: "👑", desc: "All empire operations +5x reward! Every Monday.", category: "server", dayOfWeek: 1, bonuses: "5x Empire Earnings • Business Boost • CEO Loot", color: "purple", rarity: "rare" },

  // ═══ RANDOM EVENTS ═══
  { name: "Double XP Weekend", icon: "⭐", desc: "Every weekend — all XP earned doubled across everything.", category: "random", bonuses: "2x All XP", color: "blue", rarity: "common" },
  { name: "Triple XP Weekend", icon: "🌟", desc: "Every weekend — rare triple XP event. Massive gains.", category: "random", bonuses: "3x All XP", color: "purple", rarity: "rare" },
  { name: "Cash Rain", icon: "💵", desc: "Weekend bonus — free cash drops across the city. Collect fast!", category: "random", bonuses: "Free Cash Drops • Limited Time", color: "green", rarity: "rare" },
  { name: "Lucky Hour", icon: "🍀", desc: "Gambling odds improved by 15%. Lucky streak active.", category: "random", bonuses: "+15% Win Rate • Gambling Boost", color: "green", rarity: "common" },
  { name: "Jackpot Hour", icon: "💫", desc: "1-hour window. Slot jackpots 5x more likely!", category: "random", bonuses: "5x Jackpot Chance • Roulette Boost", color: "yellow", rarity: "rare" },
  { name: "Diamond Rush", icon: "💎", desc: "Rare gems flood the market. Jewel heists pay 5x!", category: "random", bonuses: "5x Jewel Heist • Gem Loot", color: "cyan", rarity: "epic" },
  { name: "Manhunt", icon: "🔫", desc: "Wanted criminals get bounty boosts. Hunters earn extra.", category: "random", bonuses: "2x Bounties • Hunter XP", color: "red", rarity: "common" },
  { name: "Chaos Hour", icon: "🌀", desc: "Total chaos. Everything randomized. Highest risk, highest reward.", category: "random", bonuses: "Random Multipliers • All-or-Nothing", color: "red", rarity: "legendary" },
  { name: "Golden Hour", icon: "🌅", desc: "Everything pays gold. All earnings +100% for 1 hour.", category: "random", bonuses: "+100% All Earnings • Golden Loot", color: "amber", rarity: "epic" },
  { name: "Cargo Drop", icon: "📦", desc: "Supply drops across the map. Rare weapons, armor, cash.", category: "random", bonuses: "Rare Loot Drops • Supply Crates", color: "blue", rarity: "rare" },
];

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function isEventActive(evt: GameEvent): boolean {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const dow = now.getDay();
  if (evt.startMonth && evt.startDay && evt.endMonth && evt.endDay) {
    const val = m * 100 + d;
    const s = evt.startMonth * 100 + evt.startDay;
    const e = evt.endMonth * 100 + evt.endDay;
    if (s <= e) return val >= s && val <= e;
    return val >= s || val <= e;
  }
  if (evt.dayOfWeek !== undefined) {
    if (evt.name === "Tournament Championship") return dow === 0 || dow === 5 || dow === 6;
    return dow === evt.dayOfWeek;
  }
  return false; // random events are random
}

function isWeekend(): boolean {
  const dow = new Date().getDay();
  return dow === 0 || dow === 5 || dow === 6;
}

function getDaysUntil(evt: GameEvent): number {
  const now = new Date();
  if (!evt.startMonth || !evt.startDay) return -1;
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, evt.startMonth - 1, evt.startDay);
  if (next < now) next = new Date(thisYear + 1, evt.startMonth - 1, evt.startDay);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  common: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-300", badge: "bg-slate-500/20 text-slate-300" },
  rare: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-300", badge: "bg-blue-500/20 text-blue-300" },
  epic: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300", badge: "bg-purple-500/20 text-purple-300" },
  legendary: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300" },
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-300" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-300" },
  green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-300" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-300" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-300" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-300" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300" },
  slate: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-300" },
  brown: { bg: "bg-amber-700/10", border: "border-amber-700/30", text: "text-amber-400" },
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function EventsHubPage() {
  const [tab, setTab] = useState<"seasonal" | "server" | "random">("seasonal");
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const activeNow = useMemo(() => ALL_EVENTS.filter(isEventActive), []);
  const seasonalEvents = useMemo(() => ALL_EVENTS.filter(e => e.category === "seasonal"), []);
  const serverEvents = useMemo(() => ALL_EVENTS.filter(e => e.category === "server"), []);
  const randomEvents = useMemo(() => ALL_EVENTS.filter(e => e.category === "random"), []);

  const currentEvents = tab === "seasonal" ? seasonalEvents : tab === "server" ? serverEvents : randomEvents;
  const isWeekendNow = isWeekend();

  return (
    <div className="animate-fade-in space-y-4">
      {/* ─── HEADER ─── */}
      <div className="bg-gradient-to-r from-amber-900/30 via-red-900/20 to-purple-900/30 rounded-2xl p-4 md:p-6 border border-amber-500/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎆</div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-amber-300 tracking-wider">EVENTS HUB</h1>
              <p className="text-[10px] text-slate-500">{ALL_EVENTS.length} events tracked • {isLeapYear(now.getFullYear()) ? "Leap Year ✅" : "Standard Year"}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500">SERVER TIME</div>
            <div className="text-sm font-mono text-amber-300">{now.toLocaleTimeString()}</div>
            {activeNow.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1 justify-end">
                {activeNow.map(e => {
                  const c = COLOR_MAP[e.color] || COLOR_MAP.amber;
                  return (
                    <span key={e.name} className={`${c.bg} ${c.border} border text-[9px] px-2 py-0.5 rounded-full font-bold ${c.text} animate-pulse`}>
                      {e.icon} {e.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── WEEKEND BOOST BANNER ─── */}
      {isWeekendNow && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 rounded-xl p-3 border border-green-500/30 flex items-center gap-3">
          <Zap className="size-4 text-green-400 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-green-300">WEEKEND BOOST ACTIVE</span>
            <span className="text-[10px] text-green-400/70 ml-2">All XP +25% • All Cash +25% • Double XP Weekend • Cash Rain</span>
          </div>
        </div>
      )}

      {/* ─── TABS ─── */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: "seasonal" as const, label: "🎆 Seasonal Events", count: seasonalEvents.length, color: "amber" },
          { id: "server" as const, label: "⚡ Server Events", count: serverEvents.length, color: "blue" },
          { id: "random" as const, label: "🎲 Random Events", count: randomEvents.length, color: "purple" },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? `bg-${t.color}-600/30 border border-${t.color}-500/40 text-${t.color}-300` : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ─── EVENT CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentEvents.map(evt => {
          const active = isEventActive(evt);
          const isExp = expanded === evt.name;
          const c = COLOR_MAP[evt.color] || COLOR_MAP.amber;
          const r = RARITY_COLORS[evt.rarity] || RARITY_COLORS.common;
          const daysUntil = getDaysUntil(evt);

          return (
            <div key={evt.name}
              onClick={() => setExpanded(isExp ? null : evt.name)}
              className={`${c.bg} ${c.border} border rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01] ${active ? "ring-1 ring-green-500/40" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{evt.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${c.text}`}>{evt.name}</span>
                      {active && <span className="text-[8px] bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-0.5">
                      <span className={`${r.badge} px-1.5 py-0.5 rounded-full`}>{evt.rarity.toUpperCase()}</span>
                      {evt.startDay && (
                        <span>{MONTH_NAMES[(evt.startMonth || 1) - 1]} {evt.startDay}{evt.endDay && evt.endDay !== evt.startDay ? `-${evt.endDay}` : ""}</span>
                      )}
                      {evt.dayOfWeek !== undefined && !active && (
                        <span>Every {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][evt.dayOfWeek]}</span>
                      )}
                      {!active && daysUntil > 0 && (
                        <span className="text-amber-400 font-bold">in {daysUntil} days</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`size-4 text-slate-600 transition-transform ${isExp ? "rotate-90" : ""}`} />
              </div>

              {isExp && (
                <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-2">
                  <p className="text-xs text-slate-300">{evt.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {evt.bonuses.split(" • ").map((b, i) => (
                      <span key={i} className="text-[9px] bg-slate-800/50 text-slate-300 px-2 py-0.5 rounded-full">✨ {b}</span>
                    ))}
                  </div>
                  {evt.dayOfWeek !== undefined && (
                    <div className="flex gap-1">
                      {["S","M","T","W","T","F","S"].map((d, di) => {
                        const active = evt.name === "Tournament Championship" ? (di === 0 || di === 5 || di === 6) : di === evt.dayOfWeek;
                        return (
                          <span key={di} className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center font-bold ${
                            active ? `${c.bg} ${c.border} border ${c.text}` : "bg-slate-800/30 text-slate-700"
                          }`}>{d}</span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="text-center text-[10px] text-slate-600 py-2">
        📅 {isLeapYear(now.getFullYear()) ? "Leap Year — Feb has 29 days" : "Standard Year — Feb has 28 days"} •
        Tracking {ALL_EVENTS.length} events • {activeNow.length > 0 ? `${activeNow.length} active now` : "No events active"}
      </div>
    </div>
  );
}

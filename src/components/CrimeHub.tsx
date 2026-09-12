import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skull, Car, Home, Shield, Clock, ChevronRight, Zap, AlertTriangle, Lock, MapPin, SkullIcon } from "lucide-react";
import { ActionCard, ActionHero, ActionStat, ExecuteButton, SafetyNote } from "@/components/ActionVisuals";

// ═══════════════════════════════════════════════════════════════════
// CRIME CATEGORIES WITH LEVEL-BASED SUB-PAGES
// ═══════════════════════════════════════════════════════════════════

interface CrimeItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  level: number;
  reward: number;
  xp: number;
  risk: number;
  cooldown: number; // seconds
  category: string;
}

const STREET_CRIMES: CrimeItem[] = [
  { id: "pickpocket", name: "Pickpocket", icon: "🪙", desc: "Lift wallets from distracted pedestrians", level: 1, reward: 50, xp: 10, risk: 20, cooldown: 5, category: "street" },
  { id: "mug", name: "Mugging", icon: "👊", desc: "Rob someone on the street at knifepoint", level: 3, reward: 200, xp: 25, risk: 35, cooldown: 8, category: "street" },
  { id: "shoplift", name: "Shoplifting", icon: "🛍️", desc: "Steal goods from stores", level: 5, reward: 300, xp: 30, risk: 25, cooldown: 10, category: "street" },
  { id: "snatch", name: "Phone Snatch", icon: "📱", desc: "Grab phones and run", level: 2, reward: 100, xp: 15, risk: 15, cooldown: 5, category: "street" },
  { id: "bike_theft", name: "Bicycle Theft", icon: "🚲", desc: "Steal unlocked bikes", level: 1, reward: 75, xp: 8, risk: 10, cooldown: 5, category: "street" },
  { id: "dumpster", name: "Dumpster Diving", icon: "🗑️", desc: "Find valuables in trash", level: 1, reward: 30, xp: 5, risk: 5, cooldown: 3, category: "street" },
  { id: "package", name: "Package Theft", icon: "📦", desc: "Steal delivered packages", level: 4, reward: 250, xp: 20, risk: 20, cooldown: 8, category: "street" },
  { id: "atm_skim", name: "ATM Skimming", icon: "💳", desc: "Install skimmers on ATMs", level: 8, reward: 1500, xp: 60, risk: 45, cooldown: 15, category: "street" },
  { id: "carjack", name: "Carjacking", icon: "🚗", desc: "Steal a car at gunpoint", level: 12, reward: 3000, xp: 80, risk: 55, cooldown: 20, category: "street" },
  { id: "armed_robbery", name: "Armed Robbery", icon: "🔫", desc: "Hold up a convenience store", level: 15, reward: 5000, xp: 100, risk: 60, cooldown: 25, category: "street" },
  { id: "mail_theft", name: "Mail Theft", icon: "📬", desc: "Steal from mailboxes", level: 6, reward: 400, xp: 35, risk: 30, cooldown: 10, category: "street" },
  { id: "coin_push", name: "Coin Laundry Theft", icon: "🧺", desc: "Steal from laundromat machines", level: 2, reward: 150, xp: 12, risk: 15, cooldown: 5, category: "street" },
];

const CAR_CRIMES: CrimeItem[] = [
  { id: "car_theft_easy", name: "Old Sedan", icon: "🚗", desc: "Steal an older car from a parking lot", level: 1, reward: 500, xp: 20, risk: 25, cooldown: 10, category: "car" },
  { id: "car_theft_medium", name: "Sports Car", icon: "🏎️", desc: "Hotwire a sports car", level: 5, reward: 2000, xp: 50, risk: 40, cooldown: 15, category: "car" },
  { id: "car_theft_luxury", name: "Luxury SUV", icon: "🚙", desc: "Steal a high-end SUV with key fob relay", level: 10, reward: 5000, xp: 80, risk: 50, cooldown: 20, category: "car" },
  { id: "car_theft_exotic", name: "Exotic Supercar", icon: "🏁", desc: "Steal a Ferrari or Lamborghini", level: 20, reward: 15000, xp: 150, risk: 65, cooldown: 30, category: "car" },
  { id: "car_theft_truck", name: "Delivery Truck", icon: "🚛", desc: "Hijack a delivery truck", level: 8, reward: 3000, xp: 60, risk: 45, cooldown: 15, category: "car" },
  { id: "car_theft_bus", name: "Tour Bus", icon: "🚌", desc: "Steal a tour bus full of valuables", level: 15, reward: 8000, xp: 100, risk: 55, cooldown: 25, category: "car" },
  { id: "car_theft_armored", name: "Armored Truck", icon: "🛡️", desc: "Rob an armored money transport", level: 25, reward: 25000, xp: 200, risk: 75, cooldown: 35, category: "car" },
  { id: "car_theft_helicopter", name: "Helicopter", icon: "🚁", desc: "Steal a helicopter from the helipad", level: 35, reward: 50000, xp: 300, risk: 80, cooldown: 45, category: "car" },
  { id: "chop_shop", name: "Chop Shop", icon: "🔧", desc: "Strip stolen cars for parts", level: 12, reward: 4000, xp: 70, risk: 35, cooldown: 20, category: "car" },
  { id: "joyride", name: "Joyride", icon: "🎡", desc: "Take a car for a spin, abandon it", level: 1, reward: 100, xp: 10, risk: 15, cooldown: 5, category: "car" },
  { id: "car_bomb", name: "Car Bomb", icon: "💣", desc: "Plant an explosive on a rival's vehicle", level: 30, reward: 20000, xp: 250, risk: 70, cooldown: 40, category: "car" },
  { id: "race_rig", name: "Race Rigging", icon: "🏁", desc: "Rig underground races for profit", level: 18, reward: 10000, xp: 120, risk: 40, cooldown: 25, category: "car" },
];

const BURGLARY_CRIMES: CrimeItem[] = [
  { id: "house_easy", name: "Suburban House", icon: "🏠", desc: "Break into a quiet suburban home", level: 1, reward: 800, xp: 25, risk: 30, cooldown: 10, category: "burglary" },
  { id: "house_medium", name: "Family Home", icon: "🏘️", desc: "Burglarize a family residence", level: 5, reward: 2500, xp: 50, risk: 40, cooldown: 15, category: "burglary" },
  { id: "house_hard", name: "Luxury Villa", icon: "🏰", desc: "Infiltrate a gated mansion", level: 12, reward: 8000, xp: 100, risk: 55, cooldown: 25, category: "burglary" },
  { id: "house_mega", name: "Mega Mansion", icon: "🏯", desc: "Rob a celebrity mansion with guards", level: 20, reward: 20000, xp: 180, risk: 70, cooldown: 35, category: "burglary" },
  { id: "warehouse", name: "Warehouse", icon: "🏭", desc: "Break into a storage warehouse", level: 8, reward: 5000, xp: 70, risk: 45, cooldown: 15, category: "burglary" },
  { id: "office", name: "Office Building", icon: "🏢", desc: "Rob a corporate office after hours", level: 10, reward: 6000, xp: 80, risk: 50, cooldown: 20, category: "burglary" },
  { id: "bank_vault", name: "Bank Vault", icon: "🏦", desc: "Crack open a bank vault", level: 30, reward: 100000, xp: 500, risk: 85, cooldown: 60, category: "burglary" },
  { id: "museum", name: "Art Museum", icon: "🖼️", desc: "Steal priceless art", level: 25, reward: 50000, xp: 300, risk: 75, cooldown: 45, category: "burglary" },
  { id: "jewelry_store", name: "Jewelry Store", icon: "💎", desc: "Smash and grab from a jeweler", level: 15, reward: 12000, xp: 130, risk: 60, cooldown: 25, category: "burglary" },
  { id: "pharmacy", name: "Pharmacy", icon: "💊", desc: "Steal prescription drugs", level: 6, reward: 3000, xp: 55, risk: 40, cooldown: 12, category: "burglary" },
  { id: "electronics", name: "Electronics Store", icon: "💻", desc: "Raid an electronics shop", level: 7, reward: 4000, xp: 60, risk: 42, cooldown: 15, category: "burglary" },
  { id: "airport_cargo", name: "Airport Cargo", icon: "✈️", desc: "Steal from airport cargo terminal", level: 22, reward: 30000, xp: 220, risk: 70, cooldown: 40, category: "burglary" },
];

const ORGANIZED_CRIMES: CrimeItem[] = [
  { id: "smuggling", name: "Smuggling Run", icon: "🚢", desc: "Move contraband across borders", level: 10, reward: 10000, xp: 100, risk: 50, cooldown: 30, category: "organized" },
  { id: "extortion", name: "Extortion", icon: "💰", desc: "Collect protection money from businesses", level: 8, reward: 5000, xp: 70, risk: 35, cooldown: 20, category: "organized" },
  { id: "racket", name: "Racketeering", icon: "🎰", desc: "Run an illegal gambling ring", level: 15, reward: 15000, xp: 120, risk: 45, cooldown: 25, category: "organized" },
  { id: "forgery", name: "Forgery Ring", icon: "📄", desc: "Print counterfeit documents", level: 12, reward: 8000, xp: 90, risk: 40, cooldown: 20, category: "organized" },
  { id: "money_launder", name: "Money Laundering", icon: "🧺", desc: "Clean dirty money through businesses", level: 20, reward: 25000, xp: 180, risk: 55, cooldown: 35, category: "organized" },
  { id: "arms_deal", name: "Arms Deal", icon: "🔫", desc: "Buy and sell illegal weapons", level: 25, reward: 40000, xp: 250, risk: 70, cooldown: 40, category: "organized" },
  { id: "heist_plan", name: "Heist Planning", icon: "📋", desc: "Plan a major bank heist", level: 30, reward: 80000, xp: 400, risk: 80, cooldown: 60, category: "organized" },
  { id: "hitman", name: "Contract Killing", icon: "🎯", desc: "Accept a contract on a target", level: 35, reward: 100000, xp: 500, risk: 85, cooldown: 60, category: "organized" },
  { id: "kidnap", name: "Kidnapping", icon: "绑架", desc: "Kidnap a high-value target", level: 28, reward: 60000, xp: 350, risk: 75, cooldown: 50, category: "organized" },
  { id: "cartel", name: "Cartel Operation", icon: "🕸️", desc: "Run a major drug operation", level: 40, reward: 200000, xp: 800, risk: 90, cooldown: 90, category: "organized" },
  { id: "cybercrime", name: "Cybercrime", icon: "💻", desc: "Hack into financial systems", level: 18, reward: 18000, xp: 140, risk: 50, cooldown: 30, category: "organized" },
  { id: "tax_evasion", name: "Tax Evasion", icon: "📋", desc: "Hide income from the IRS", level: 14, reward: 12000, xp: 110, risk: 40, cooldown: 25, category: "organized" },
];

const MURDER_CRIMES: CrimeItem[] = [
  { id: "hit_easy", name: "Street Hit", icon: "🔪", desc: "Quick and dirty street assassination", level: 10, reward: 5000, xp: 80, risk: 60, cooldown: 30, category: "murder" },
  { id: "hit_medium", name: "Targeted Kill", icon: "🎯", desc: "Eliminate a specific target", level: 20, reward: 15000, xp: 150, risk: 70, cooldown: 40, category: "murder" },
  { id: "hit_hard", name: "Professional Hit", icon: "🕵️", desc: "Clean, professional assassination", level: 30, reward: 50000, xp: 300, risk: 80, cooldown: 60, category: "murder" },
  { id: "hit_expert", name: "Snipe Mission", icon: "🔭", desc: "Long-range sniper elimination", level: 35, reward: 80000, xp: 400, risk: 85, cooldown: 60, category: "murder" },
  { id: "poison", name: "Poisoning", icon: "☠️", desc: "Silently poison your target", level: 25, reward: 30000, xp: 200, risk: 55, cooldown: 45, category: "murder" },
  { id: "car_bomb_kill", name: "Car Bomb", icon: "💣", desc: "Explode target's vehicle", level: 28, reward: 40000, xp: 250, risk: 75, cooldown: 50, category: "murder" },
  { id: "arson_kill", name: "Arson", icon: "🔥", desc: "Burn down a building with target inside", level: 22, reward: 25000, xp: 180, risk: 70, cooldown: 40, category: "murder" },
  { id: "hit_squad", name: "Hit Squad", icon: "👥", desc: "Send a team to handle it", level: 40, reward: 150000, xp: 600, risk: 90, cooldown: 90, category: "murder" },
];

const ALL_CRIMES = [...STREET_CRIMES, ...CAR_CRIMES, ...BURGLARY_CRIMES, ...ORGANIZED_CRIMES, ...MURDER_CRIMES];

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function CrimeHub() {
  const player = useQuery(api.game.getPlayer);
  const commitCrime = useMutation(api.game.commitCategoryCrime);
  const [activeTab, setActiveTab] = useState<"street" | "car" | "burglary" | "organized" | "murder">("street");
  const [selectedCrime, setSelectedCrime] = useState<CrimeItem | null>(null);
  const [result, setResult] = useState<{ success: boolean; money: number; xp: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Tick cooldowns
  useEffect(() => {
    const iv = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        for (const k in next) {
          if (next[k] > 0) { next[k]--; changed = true; }
          if (next[k] <= 0) delete next[k];
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading crimes...</div>;

  const tabs = [
    { id: "street" as const, label: "Street", icon: "🔪", count: STREET_CRIMES.length, color: "green" },
    { id: "car" as const, label: "Car Theft", icon: "🚗", count: CAR_CRIMES.length, color: "blue" },
    { id: "burglary" as const, label: "Burglary", icon: "🏠", count: BURGLARY_CRIMES.length, color: "orange" },
    { id: "organized" as const, label: "Organized", icon: "🕵️", count: ORGANIZED_CRIMES.length, color: "purple" },
    { id: "murder" as const, label: "Murder", icon: "💀", count: MURDER_CRIMES.length, color: "red" },
  ];

  const categoryCrimes = ALL_CRIMES.filter(c => c.category === activeTab);
  const filtered = searchQuery
    ? ALL_CRIMES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : categoryCrimes;
  const sorted = [...filtered].sort((a, b) => a.level - b.level);

  const getCrimesForTab = (tab: string) => ALL_CRIMES.filter(c => c.category === tab).sort((a, b) => a.level - b.level);

  const executeCrime = async (crime: CrimeItem) => {
    if ((player.level ?? 0) < crime.level) return;
    if (cooldowns[crime.id] > 0) return;
    setLoading(true); setResult(null);
    try {
      const res = await commitCrime({ crimeId: crime.id, reward: crime.reward, risk: crime.risk, xp: crime.xp });
      setResult({ success: res.success, money: res.moneyEarned, xp: res.xpEarned });
      setCooldowns(prev => ({ ...prev, [crime.id]: crime.cooldown }));
    } catch { setResult({ success: false, money: 0, xp: 0 }); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <ActionHero eyebrow="Citywide criminal network" title="Crime Hub" description={`${ALL_CRIMES.length} operations across five districts. Pick a lane, manage your exposure, and build a reputation that lasts.`} icon="🔪" accent="red" right={<div className="rounded-xl border border-red-400/25 bg-black/30 px-3 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-red-200/60">Operator level</div><div className="text-lg font-black text-red-300">LV.{player.level ?? 1}</div></div>} />
      <div className="grid grid-cols-3 gap-2"><ActionStat icon="🎯" label="Unlocked" value={`${ALL_CRIMES.filter((crime) => (player.level ?? 0) >= crime.level).length}/${ALL_CRIMES.length}`} tone="red" /><ActionStat icon="💰" label="Best score" value={`$${Math.max(...ALL_CRIMES.map((crime) => crime.reward)).toLocaleString()}`} tone="green" /><ActionStat icon="⚡" label="Momentum" value={`${(player as any).crimeMomentum ?? 0}%`} tone="amber" /></div>

      {/* Search */}
      <div className="relative">
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Search crimes..."
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none" />
        {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white">✕</button>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map(t => {
          const crimes = getCrimesForTab(t.id);
          const unlocked = crimes.filter(c => (player.level ?? 0) >= c.level).length;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedCrime(null); setSearchQuery(""); }}
              className={`flex flex-col items-center px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all min-w-[70px] ${
                activeTab === t.id ? `bg-${t.color}-600/30 border border-${t.color}-500/40 text-${t.color}-300` : "bg-slate-800/50 text-slate-500 hover:bg-slate-700/50"
              }`}>
              <span className="text-lg mb-0.5">{t.icon}</span>
              <span>{t.label}</span>
              <span className="text-[8px] text-slate-600">{unlocked}/{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Active Cooldown Banner */}
      {Object.keys(cooldowns).length > 0 && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
          <Clock className="size-4 text-red-400 animate-pulse" />
          <span className="text-xs text-red-300">Cooldown active — {Object.keys(cooldowns).length} crimes on cooldown</span>
        </div>
      )}

      {/* Crime Cards */}
      <div className="space-y-2">
        {sorted.map(crime => {
          const playerLevel = player.level ?? 0;
          const locked = playerLevel < crime.level;
          const onCooldown = (cooldowns[crime.id] ?? 0) > 0;
          const cdTime = cooldowns[crime.id] ?? 0;
          const isSelected = selectedCrime?.id === crime.id;
          const levelGap = crime.level - playerLevel;

          return (
            <div key={crime.id} onClick={() => !locked && setSelectedCrime(isSelected ? null : crime)}
              className={`rounded-xl border p-3 transition-all ${
                locked ? "bg-slate-900/30 border-slate-800/50 opacity-50" :
                onCooldown ? "bg-slate-900/30 border-slate-700/30 opacity-60" :
                isSelected ? "bg-red-950/30 border-red-500/40" :
                "bg-slate-900/50 border-slate-700/50 hover:border-red-500/30 cursor-pointer"
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{crime.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{crime.name}</span>
                    {locked && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">🔒 Lv.{crime.level}</span>}
                    {onCooldown && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">⏳ {cdTime}s</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{crime.desc}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                  <span className="text-green-400 font-bold">${crime.reward.toLocaleString()}</span>
                  <span className="text-blue-400">+{crime.xp}xp</span>
                  <span className="text-red-400">{crime.risk}%</span>
                </div>
              </div>

              {/* Expanded — Execute Button */}
              {isSelected && !locked && (
                <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-2">
                  <div className="grid grid-cols-4 gap-1 text-center text-[9px]">
                    <div className="bg-green-500/10 rounded p-1"><div className="text-green-400 font-bold">💰 ${crime.reward.toLocaleString()}</div><div className="text-slate-600">Reward</div></div>
                    <div className="bg-blue-500/10 rounded p-1"><div className="text-blue-400 font-bold">⭐ +{crime.xp}</div><div className="text-slate-600">XP</div></div>
                    <div className="bg-red-500/10 rounded p-1"><div className="text-red-400 font-bold">⚠️ {crime.risk}%</div><div className="text-slate-600">Risk</div></div>
                    <div className="bg-amber-500/10 rounded p-1"><div className="text-amber-400 font-bold">⏱ {crime.cooldown}s</div><div className="text-slate-600">Cooldown</div></div>
                  </div>
                  {onCooldown ? (
                    <div className="w-full py-2.5 bg-slate-800/50 text-slate-500 rounded-xl text-xs font-bold text-center">
                      ⏳ Cooldown: {cdTime}s remaining
                    </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); executeCrime(crime); }}
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl text-xs hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50">
                      {loading ? "Executing..." : `🔪 Execute ${crime.name}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-4 border ${result.success ? "bg-green-950/30 border-green-500/40" : "bg-red-950/30 border-red-500/40"}`}>
          <div className={`text-lg font-bold ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "✅ SUCCESS!" : "❌ CAUGHT!"}
          </div>
          {result.success && <div className="text-sm text-green-300 mt-1">💰 +${result.money.toLocaleString()} &nbsp; ⭐ +{result.xp} XP</div>}
          {!result.success && <div className="text-sm text-red-300 mt-1">You were caught! Better luck next time.</div>}
        </div>
      )}
    </div>
  );
}

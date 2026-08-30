import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock, Lock, ShieldAlert, Sparkles } from "lucide-react";

const STREET_CRIMES = [
  { id: "pickpocket", name: "Pickpocket", icon: "🪙", level: 1, reward: 200, xp: 150, risk: 10, cooldown: 5, energy: 5, focus: 3, description: "Lift a wallet in a crowded market." },
  { id: "phone_snatch", name: "Phone Snatch", icon: "📱", level: 1, reward: 250, xp: 150, risk: 12, cooldown: 6, energy: 6, stamina: 5, description: "Take a phone and disappear into the crowd." },
  { id: "shoplifting", name: "Shoplifting", icon: "🛍️", level: 2, reward: 300, xp: 150, risk: 15, cooldown: 8, energy: 5, stamina: 2, focus: 3, description: "Slip merchandise past a distracted cashier." },
  { id: "bicycle_theft", name: "Bicycle Theft", icon: "🚲", level: 2, reward: 150, xp: 150, risk: 8, cooldown: 5, energy: 4, stamina: 3, description: "Find an unsecured bike and move it quickly." },
  { id: "purse_snatch", name: "Purse Snatch", icon: "👜", level: 3, reward: 350, xp: 150, risk: 18, cooldown: 8, energy: 7, stamina: 6, description: "Grab a bag and escape before anyone reacts." },
  { id: "car_breakin", name: "Car Break-In", icon: "🚘", level: 4, reward: 500, xp: 175, risk: 25, cooldown: 10, energy: 8, stamina: 5, focus: 5, description: "Search a parked vehicle for valuables." },
  { id: "ticket_scalp", name: "Ticket Scalping", icon: "🎟️", level: 5, reward: 450, xp: 150, risk: 10, cooldown: 10, energy: 4, focus: 5, description: "Turn scarce tickets into a quick margin." },
  { id: "atm_skim", name: "ATM Skimming", icon: "💳", level: 8, reward: 800, xp: 200, risk: 20, cooldown: 15, energy: 8, stamina: 3, focus: 10, description: "Run a careful technical operation overnight." },
  { id: "carjacking", name: "Carjacking", icon: "🚗", level: 12, reward: 3000, xp: 250, risk: 35, cooldown: 20, energy: 18, stamina: 14, focus: 8, description: "Take a high-value vehicle under pressure." },
  { id: "armed_robbery", name: "Armed Robbery", icon: "🔫", level: 15, reward: 5000, xp: 300, risk: 45, cooldown: 25, energy: 22, stamina: 18, morale: 5, description: "A serious operation with serious consequences." },
] as const;

type Crime = (typeof STREET_CRIMES)[number];

export function StreetCrimesPage() {
  const player = useQuery(api.game.getPlayer);
  const resources = useQuery(api.resourceSystem.getResources);
  const commitCrime = useMutation(api.game.commitCategoryCrime);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string>(STREET_CRIMES[0].id);
  const [result, setResult] = useState<{ success: boolean; money: number; xp: number; text?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setCooldowns((current) => {
      const next = { ...current };
      Object.keys(next).forEach((id) => next[id] <= 1 ? delete next[id] : next[id]--);
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeCrime = useMemo(() => STREET_CRIMES.find((crime) => crime.id === selected) ?? STREET_CRIMES[0], [selected]);
  const level = player?.level ?? 1;
  const locked = level < activeCrime.level;
  const cooldown = cooldowns[activeCrime.id] ?? 0;

  const execute = async (crime: Crime) => {
    if (busy || level < crime.level || cooldowns[crime.id]) return;
    setBusy(true); setResult(null);
    try {
      const response = await commitCrime({ crimeId: crime.id, reward: crime.reward, risk: crime.risk, xp: crime.xp });
      setResult({ success: Boolean(response.success), money: response.moneyEarned ?? 0, xp: response.xpEarned ?? 0 });
      setCooldowns((current) => ({ ...current, [crime.id]: crime.cooldown }));
    } catch (error) {
      setResult({ success: false, money: 0, xp: 0, text: error instanceof Error ? error.message : "The operation could not be completed." });
    } finally { setBusy(false); }
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading street operations...</div>;

  return <div className="animate-fade-in space-y-4">
    <header className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/60 via-slate-950/80 to-orange-950/30 p-5">
      <div className="absolute -right-8 -top-10 text-9xl opacity-10">🔪</div>
      <div className="relative flex items-center justify-between gap-4">
        <div><div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-red-300"><Sparkles className="size-3" /> Street Operations</div><h1 className="text-2xl font-black text-white">The pavement pays.</h1><p className="mt-1 max-w-xl text-xs text-slate-400">Choose your angle, watch your resources, and build a reputation one calculated move at a time.</p></div>
        <div className="rounded-xl border border-red-500/20 bg-black/30 px-4 py-3 text-center"><div className="text-[9px] text-slate-500">CURRENT RANK</div><div className="text-xl font-black text-red-300">Lv.{level}</div></div>
      </div>
    </header>

    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.65fr)]">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Available operations</div><div className="text-[10px] text-slate-600">{STREET_CRIMES.filter((crime) => level >= crime.level).length}/{STREET_CRIMES.length} unlocked</div></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {STREET_CRIMES.map((crime) => { const isLocked = level < crime.level; const isActive = crime.id === activeCrime.id; return <button key={crime.id} onClick={() => !isLocked && setSelected(crime.id)} className={`group rounded-xl border p-3 text-left transition-all ${isLocked ? "cursor-not-allowed border-slate-800/60 bg-slate-950/40 opacity-50" : isActive ? "border-red-400/50 bg-red-950/35 shadow-lg shadow-red-950/30" : "border-slate-700/50 bg-slate-900/50 hover:border-red-400/30 hover:bg-red-950/20"}`}><div className="flex items-start gap-3"><span className="text-2xl transition-transform group-hover:scale-110">{crime.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-1 text-sm font-bold text-white">{crime.name}{isLocked && <Lock className="size-3 text-slate-500" />}</span><span className="mt-1 block text-[10px] leading-4 text-slate-400">{crime.description}</span></span></div><div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-green-400">${crime.reward.toLocaleString()}</span><span className="text-blue-400">+{crime.xp} XP</span><span className="text-yellow-300">-{crime.energy} ⚡</span><span className="text-red-400">{crime.risk}% risk</span></div></button>; })}
        </div>
      </div>

      <section className="h-fit rounded-2xl border border-orange-500/25 bg-gradient-to-b from-orange-950/25 to-slate-950/70 p-4 shadow-xl shadow-black/20"><div className="mb-4 flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-widest text-orange-300">Operation brief</div>{resources && <div className="text-[10px] font-bold text-yellow-300">Energy now {resources.energy}/{resources.maxEnergy}</div>}<h2 className="mt-1 text-xl font-black text-white">{activeCrime.icon} {activeCrime.name}</h2></div><div className="rounded-full bg-red-500/15 px-2 py-1 text-[10px] font-bold text-red-300">{activeCrime.risk}% risk</div></div><p className="mb-4 text-xs leading-5 text-slate-400">{activeCrime.description} Success is never guaranteed. A failed attempt can cost health, money, and freedom.</p><div className="grid grid-cols-2 gap-2 text-center text-[10px]"><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Reward</div><div className="font-bold text-green-400">${activeCrime.reward.toLocaleString()}</div></div><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Cooldown</div><div className="font-bold text-amber-300">{cooldown ? `${cooldown}s` : `${activeCrime.cooldown}s`}</div></div><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Energy used</div><div className="font-bold text-yellow-300">-{activeCrime.energy} ⚡</div></div><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Unlock</div><div className="font-bold text-purple-300">Level {activeCrime.level}</div></div></div>{locked ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/70 p-3 text-xs text-slate-400"><Lock className="size-4" /> Reach level {activeCrime.level} to unlock this operation.</div> : <button onClick={() => execute(activeCrime)} disabled={busy || cooldown > 0} className="mt-4 w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-950/30 transition hover:from-red-500 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Executing operation..." : cooldown ? `Cooldown active · ${cooldown}s` : `Execute ${activeCrime.name}`}</button>}{result && <div className={`mt-3 rounded-xl border p-3 text-xs ${result.success ? "border-green-500/30 bg-green-950/30 text-green-300" : "border-red-500/30 bg-red-950/30 text-red-300"}`}><div className="flex items-center gap-2 font-bold">{result.success ? "✅ Operation successful" : "⚠️ Operation failed"}</div>{result.success ? <div className="mt-1">+${result.money.toLocaleString()} · +{result.xp} XP</div> : <div className="mt-1">{result.text ?? "You were caught. Recover and try a different angle."}</div>}</div>}<div className="mt-4 flex items-start gap-2 text-[9px] leading-4 text-slate-600"><ShieldAlert className="mt-0.5 size-3 shrink-0" /> Costs are checked server-side so every operation stays consistent with the global resource system.</div></section>
    </div>
  </div>;
}

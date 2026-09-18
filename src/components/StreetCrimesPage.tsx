import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActionCard, ActionHero, ActionStat, SafetyNote } from "@/components/ActionVisuals";
import { Lock, Megaphone, Sprout, Truck, Warehouse, Zap } from "lucide-react";

type StreetOperation = {
  id: string;
  name: string;
  icon: string;
  level: number;
  reward: number;
  xp: number;
  risk: number;
  cooldown: number;
  energy: number;
  description: string;
};

const STREET_OPERATIONS: StreetOperation[] = [
  { id: "rob_mcdonalds", name: "Rob McDonald's", icon: "🍔", level: 1, reward: 900, xp: 120, risk: 16, cooldown: 45, energy: 5, description: "Hit the late shift, keep it fast, and leave before the cameras finish their sweep." },
  { id: "rob_elkjoep", name: "Rob Elkjøp", icon: "📺", level: 3, reward: 2_400, xp: 180, risk: 25, cooldown: 90, energy: 7, description: "Move high-value electronics through a quiet exit while the floor is distracted." },
  { id: "rob_rema_1000", name: "Rob Rema 1000", icon: "🛒", level: 5, reward: 4_000, xp: 240, risk: 32, cooldown: 120, energy: 9, description: "Take the register route during the closing rush. More cash, more witnesses." },
  { id: "steal_pub", name: "Steal from a Pub", icon: "🍺", level: 8, reward: 7_500, xp: 320, risk: 40, cooldown: 180, energy: 11, description: "Work the back room after last call and avoid the regulars who know every face." },
  { id: "steal_fbi", name: "Steal from the FBI", icon: "🕵️", level: 15, reward: 18_000, xp: 520, risk: 58, cooldown: 300, energy: 15, description: "A high-exposure intelligence grab. The payout is strong, but the response is immediate." },
  { id: "rob_bank", name: "Rob a Bank", icon: "🏦", level: 22, reward: 65_000, xp: 850, risk: 72, cooldown: 600, energy: 20, description: "Coordinate timing, exits, and a clean split before touching the vault." },
  { id: "rob_armored_truck", name: "Rob an Armored Truck", icon: "🚚", level: 30, reward: 125_000, xp: 1_200, risk: 84, cooldown: 900, energy: 25, description: "The biggest street score: heavy security, a narrow window, and no second attempt." },
];

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "READY";
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${String(seconds % 60).padStart(2, "0")}s` : `${seconds}s`;
};

const GREENHOUSE_TABS = ["Overview", "Marketing", "Work", "Contracts", "Shipments"] as const;
type GreenhouseTab = (typeof GREENHOUSE_TABS)[number];

export function StreetCrimesPage() {
  const player = useQuery(api.game.getPlayer);
  const resources = useQuery(api.resourceSystem.getResources);
  const commitCrime = useMutation(api.game.commitCategoryCrime);
  const [selectedId, setSelectedId] = useState(STREET_OPERATIONS[0].id);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [greenhouseTab, setGreenhouseTab] = useState<GreenhouseTab>("Overview");
  const [hasGreenhouse, setHasGreenhouse] = useState(false);
  const [demand, setDemand] = useState(0);
  const [cannabis, setCannabis] = useState(0);
  const [talent, setTalent] = useState(1);
  const [rating, setRating] = useState(3.2);
  const [campaign, setCampaign] = useState<string | null>(null);
  const [contracts, setContracts] = useState([{ id: 1, owner: "Northside Crew", grams: 120, pay: 85, private: false }]);

  useEffect(() => {
    const timer = window.setInterval(() => setCooldowns((current) => {
      const next = { ...current };
      Object.keys(next).forEach((id) => next[id] <= 1 ? delete next[id] : next[id]--);
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selected = useMemo(() => STREET_OPERATIONS.find((operation) => operation.id === selectedId) ?? STREET_OPERATIONS[0], [selectedId]);
  const level = player?.level ?? 1;
  const energy = resources?.energy ?? (player as any)?.energy ?? 100;
  const cooldown = cooldowns[selected.id] ?? 0;
  const unlocked = STREET_OPERATIONS.filter((operation) => level >= operation.level).length;

  const runOperation = async () => {
    if (busy || cooldown > 0 || level < selected.level || energy < selected.energy) return;
    setBusy(true); setResult(null);
    try {
      const response = await commitCrime({ crimeId: selected.id, reward: selected.reward, risk: selected.risk, xp: selected.xp });
      setResult(response.success ? `✅ ${selected.name} succeeded: +$${(response.moneyEarned ?? 0).toLocaleString()} and +${response.xpEarned ?? 0} XP.` : `⚠️ ${selected.name} failed. The heat is rising.`);
      setCooldowns((current) => ({ ...current, [selected.id]: selected.cooldown }));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "The operation could not be completed.");
    } finally { setBusy(false); }
  };

  const buildGreenhouse = () => {
    setHasGreenhouse(true);
    setResult("🌱 Greenhouse built. Start a marketing campaign to create demand.");
  };

  const market = (type: string, boost: number) => {
    setCampaign(type);
    setDemand((value) => Math.min(100, value + boost));
    setResult(`📣 ${type} campaign launched. Demand is now ${Math.min(100, demand + boost)}%.`);
    setGreenhouseTab("Overview");
  };

  const workGreenhouse = () => {
    if (!hasGreenhouse || demand <= 0) return;
    const produced = 10 + talent * 4;
    setCannabis((value) => value + produced);
    setTalent((value) => Math.min(100, value + 1));
    setResult(`🌿 You produced ${produced}g. Talent increased to level ${talent + 1}.`);
  };

  const createContract = () => {
    setContracts((items) => [...items, { id: Date.now(), owner: "Your Greenhouse", grams: 100, pay: 100, private: false }]);
    setResult("📋 Public contract posted: 100g at 100 NOK per gram.");
  };

  const ship = () => {
    if (cannabis < Math.max(10, demand)) return setResult("A shipment needs enough stock to cover at least 10% of demand.");
    setCannabis((value) => Math.max(0, value - Math.max(10, demand)));
    setDemand((value) => Math.max(0, value - 5));
    setRating((value) => Math.min(5, value + 0.1));
    setResult("🚚 Shipment sent. Customer rating improved and the daily shipment slot was used.");
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading Street Operations...</div>;

  return (
    <div className="animate-fade-in space-y-5">
      <ActionHero eyebrow="Street operations network" title="Own the block." description="Start with local scores, build your reputation, then turn your street income into a greenhouse business." icon="🔪" accent="red" right={<div className="rounded-xl border border-red-400/25 bg-black/30 px-3 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-red-200/60">Operator level</div><div className="text-lg font-black text-red-300">LV.{level}</div></div>} />
      <div className="grid grid-cols-3 gap-2"><ActionStat icon="🎯" label="Unlocked" value={`${unlocked}/${STREET_OPERATIONS.length}`} tone="red" /><ActionStat icon="💰" label="Top score" value={`$${STREET_OPERATIONS[STREET_OPERATIONS.length - 1].reward.toLocaleString()}`} tone="green" /><ActionStat icon="⚡" label="Energy" value={`${energy}`} tone="amber" /></div>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Street Operations</div><div className="text-xs text-slate-500">Choose the score. Read the risk. Commit only when the timing is right.</div></div><span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-1 text-[9px] font-bold text-red-300">{unlocked} unlocked</span></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STREET_OPERATIONS.map((operation) => {
            const locked = level < operation.level;
            const active = selected.id === operation.id;
            const onCooldown = cooldowns[operation.id] ?? 0;
            return <ActionCard key={operation.id} active={active} className={locked ? "cursor-not-allowed opacity-45" : ""}><button type="button" onClick={() => !locked && setSelectedId(operation.id)} disabled={locked} className="w-full text-left"><div className="flex items-start gap-3"><span className="text-2xl">{locked ? "🔒" : operation.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-1 text-sm font-bold text-white">{operation.name}{locked && <Lock className="size-3 text-slate-500" />}</span><span className="mt-1 block text-[10px] leading-4 text-slate-400">{operation.description}</span></span></div><div className="mt-3 flex items-center justify-between text-[9px]"><span className="font-bold text-green-400">${operation.reward.toLocaleString()}</span><span className="text-blue-300">+{operation.xp} XP</span><span className="text-red-300">{operation.risk}% risk</span></div>{onCooldown > 0 && <div className="mt-2"><div className="flex justify-between text-[8px] text-amber-300"><span>Recovering</span><span>{formatTime(onCooldown)}</span></div><div className="mt-1 h-1 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-1000" style={{ width: `${(onCooldown / operation.cooldown) * 100}%` }} /></div></div>}</button></ActionCard>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/25 via-slate-950/80 to-orange-950/20 p-4 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-widest text-orange-300">Operation brief</div><h2 className="mt-1 text-xl font-black text-white">{selected.icon} {selected.name}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">{selected.description}</p></div><div className="rounded-full bg-red-500/15 px-2 py-1 text-[10px] font-bold text-red-300">{selected.risk}% risk</div></div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px] sm:grid-cols-4"><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Reward</div><div className="font-bold text-green-400">${selected.reward.toLocaleString()}</div></div><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">XP</div><div className="font-bold text-blue-400">+{selected.xp}</div></div><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Energy</div><div className="font-bold text-yellow-300">-{selected.energy} ⚡</div></div><div className="rounded-lg bg-black/25 p-2"><div className="text-slate-500">Cooldown</div><div className="font-bold text-amber-300">{cooldown ? formatTime(cooldown) : `${formatTime(selected.cooldown)}`}</div></div></div>
        <button type="button" onClick={runOperation} disabled={busy || cooldown > 0 || level < selected.level || energy < selected.energy} className="mt-4 w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Executing operation..." : cooldown ? `Recovering · ${formatTime(cooldown)}` : energy < selected.energy ? `Need ${selected.energy} ⚡ energy` : `Execute ${selected.name}`}</button>
        {result && <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-100">{result}</div>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/25 via-slate-950/90 to-green-950/20 shadow-xl shadow-black/20">
        <div className="border-b border-emerald-500/15 p-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10"><Sprout className="size-5 text-emerald-300" /></div><div><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Business expansion</div><h2 className="text-xl font-black text-white">Greenhouse</h2><p className="text-[10px] text-slate-500">Market demand, produce cannabis, manage contracts, and ship once per day.</p></div>{hasGreenhouse && <span className="ml-auto rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">ACTIVE</span>}</div></div>
        <div className="flex gap-1 overflow-x-auto border-b border-white/5 p-2">{GREENHOUSE_TABS.map((tab) => <button key={tab} type="button" onClick={() => setGreenhouseTab(tab)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition ${greenhouseTab === tab ? "bg-emerald-400/15 text-emerald-300" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>{tab}</button>)}</div>
        <div className="p-4">
          {!hasGreenhouse ? <div className="grid items-center gap-4 md:grid-cols-[1fr_auto]"><div><h3 className="text-lg font-black text-white">Build your first greenhouse</h3><p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">Own the production line: create demand with marketing, work when demand is active, and build a reputation through reliable shipments.</p><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px]"><div className="rounded-lg bg-black/25 p-2"><Megaphone className="mx-auto mb-1 size-4 text-emerald-300" />Market</div><div className="rounded-lg bg-black/25 p-2"><Sprout className="mx-auto mb-1 size-4 text-emerald-300" />Produce</div><div className="rounded-lg bg-black/25 p-2"><Truck className="mx-auto mb-1 size-4 text-emerald-300" />Ship</div></div></div><button type="button" onClick={buildGreenhouse} className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-950/30 hover:brightness-110">Build Greenhouse</button></div> : <GreenhouseWorkspace tab={greenhouseTab} demand={demand} cannabis={cannabis} talent={talent} rating={rating} campaign={campaign} contracts={contracts} onMarket={market} onWork={workGreenhouse} onContract={createContract} onShip={ship} />}
        </div>
      </section>
      <SafetyNote>Street scores create immediate cash. The greenhouse is a longer economy loop: demand drives production, talent improves output, contracts create player-to-player work, and customer ratings determine shipment value.</SafetyNote>
    </div>
  );
}

function GreenhouseWorkspace({ tab, demand, cannabis, talent, rating, campaign, contracts, onMarket, onWork, onContract, onShip }: { tab: GreenhouseTab; demand: number; cannabis: number; talent: number; rating: number; campaign: string | null; contracts: { id: number; owner: string; grams: number; pay: number; private: boolean }[]; onMarket: (type: string, boost: number) => void; onWork: () => void; onContract: () => void; onShip: () => void }) {
  if (tab === "Marketing") return <div className="grid gap-2 md:grid-cols-3">{[{ name: "Search marketing", icon: "🔎", desc: "Predictable, average demand growth.", boost: 15 }, { name: "Display ads", icon: "🖥️", desc: "Higher upside with a greater chance of underperforming.", boost: 25 }, { name: "Social media", icon: "📱", desc: "Viral potential, but inconsistent results.", boost: 35 }].map((item) => <button key={item.name} type="button" onClick={() => onMarket(item.name, item.boost)} className="rounded-xl border border-emerald-500/20 bg-black/20 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/50"><div className="text-2xl">{item.icon}</div><div className="mt-2 text-sm font-black text-white">{item.name}</div><div className="mt-1 text-[10px] leading-4 text-slate-400">{item.desc}</div><div className="mt-3 text-[10px] font-bold text-emerald-300">Launch campaign →</div></button>)}</div>;
  if (tab === "Work") return <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-white">Work the greenhouse</h3><p className="mt-1 text-xs text-slate-400">Production depends on talent. Current output is {10 + talent * 4}g per shift.</p></div><button type="button" onClick={onWork} disabled={demand <= 0} className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{demand <= 0 ? "Need active demand" : "Work shift · produce cannabis"}</button></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]"><div className="rounded-lg bg-black/25 p-3"><div className="text-slate-500">Talent</div><div className="font-black text-emerald-300">Lv.{talent}</div></div><div className="rounded-lg bg-black/25 p-3"><div className="text-slate-500">Output</div><div className="font-black text-green-300">{10 + talent * 4}g</div></div><div className="rounded-lg bg-black/25 p-3"><div className="text-slate-500">Demand gate</div><div className="font-black text-amber-300">{demand}%</div></div></div></div>;
  if (tab === "Contracts") return <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-black text-white">Player contracts</h3><p className="text-xs text-slate-400">Public contracts are open to everyone; private contracts can pay more for a named producer.</p></div><button type="button" onClick={onContract} className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black text-white">Post public contract</button></div>{contracts.map((contract) => <div key={contract.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><Warehouse className="size-5 text-emerald-300" /><div className="flex-1"><div className="text-xs font-bold text-white">{contract.owner}</div><div className="text-[10px] text-slate-500">{contract.grams}g · {contract.pay} NOK/g · {contract.private ? "Private" : "Public"}</div></div><span className="text-[10px] font-bold text-emerald-300">Accept →</span></div>)}</div>;
  if (tab === "Shipments") return <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-black text-white">Send a shipment</h3><p className="mt-1 text-xs text-slate-400">You can ship once per day when stock reaches at least 10% of current demand.</p></div><button type="button" onClick={onShip} disabled={cannabis < Math.max(10, demand)} className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Send shipment</button></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]"><div className="rounded-lg bg-black/25 p-3"><div className="text-slate-500">Stock</div><div className="font-black text-green-300">{cannabis}g</div></div><div className="rounded-lg bg-black/25 p-3"><div className="text-slate-500">Required</div><div className="font-black text-amber-300">{Math.max(10, demand)}g</div></div><div className="rounded-lg bg-black/25 p-3"><div className="text-slate-500">Rating</div><div className="font-black text-yellow-300">{rating.toFixed(1)} ★</div></div></div></div>;
  return <div className="grid gap-3 md:grid-cols-4"><div className="rounded-xl border border-emerald-500/20 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Demand</div><div className="mt-1 text-2xl font-black text-emerald-300">{demand}%</div><div className="mt-2 h-1.5 rounded-full bg-black/40"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${demand}%` }} /></div></div><div className="rounded-xl border border-emerald-500/20 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Cannabis stock</div><div className="mt-1 text-2xl font-black text-green-300">{cannabis}g</div><div className="text-[9px] text-slate-500">Produced on shifts</div></div><div className="rounded-xl border border-emerald-500/20 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Talent</div><div className="mt-1 text-2xl font-black text-cyan-300">Lv.{talent}</div><div className="text-[9px] text-slate-500">Improves output</div></div><div className="rounded-xl border border-emerald-500/20 bg-black/20 p-3"><div className="text-[10px] text-slate-500">Customer rating</div><div className="mt-1 text-2xl font-black text-yellow-300">{rating.toFixed(1)} ★</div><div className="text-[9px] text-slate-500">{campaign ? `${campaign} active` : "No campaign active"}</div></div></div>;
}

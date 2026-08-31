import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Lock, ShieldAlert, Sparkles } from "lucide-react";
import { crimeCategories } from "@/data/crimes";
import { RESOURCE_COSTS } from "@/data/resourceCosts";

const categoryMeta: Record<string, { title: string; icon: string; tone: string; tagline: string }> = {
  street: { title: "Street Operations", icon: "🔪", tone: "red", tagline: "Fast moves, small targets, clean exits." },
  robbery: { title: "Robbery Desk", icon: "💰", tone: "amber", tagline: "Plan the score before you touch the door." },
  fraud: { title: "Fraud Bureau", icon: "🃏", tone: "yellow", tagline: "Information is leverage. Leverage is money." },
  burglary: { title: "Burglary Board", icon: "🏠", tone: "orange", tagline: "Every property has a weakness." },
  drugs: { title: "Distribution Network", icon: "💊", tone: "purple", tagline: "Routes, contacts, and controlled risk." },
  organized: { title: "Organized Crime", icon: "🕵️", tone: "blue", tagline: "Bigger crews. Bigger exposure. Bigger returns." },
  underground: { title: "Underground Desk", icon: "🕳️", tone: "slate", tagline: "The jobs nobody puts on a ledger." },
  gta_theft: { title: "GTA Car Theft", icon: "🚗", tone: "red", tagline: "Steal anything with wheels. The bigger the engine, the bigger the score." },
  steal_house: { title: "House Infiltration", icon: "🏠", tone: "rose", tagline: "Every home has a weakness. Find it, exploit it, vanish." },
  murder: { title: "Contract Killings", icon: "💀", tone: "red", tagline: "No witnesses. No evidence. No mercy." },
};

export function CriminalOperationsPage({ category }: { category: string }) {
  const player = useQuery(api.game.getPlayer);
  const resources = useQuery(api.resourceSystem.getResources);
  const store = useQuery(api.storeSystem.getStoreState);
  const executeCrime = useMutation(api.game.commitCategoryCrime);
  const recordCrime = useMutation(api.storeSystem.recordCrime);
  const getTarget = useMutation(api.storeSystem.getAssassinationTarget);
  const finishTarget = useMutation(api.storeSystem.completeAssassination);
  const [selectedId, setSelectedId] = useState<string>();
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ success: boolean; money: number; xp: number; coins?: number; message?: string }>();
  const [targetMsg, setTargetMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [targetBusy, setTargetBusy] = useState(false);
  const definition = crimeCategories.find((item) => item.id === category) ?? crimeCategories[0];
  const meta = categoryMeta[definition.id] ?? categoryMeta.street;
  const crimes = useMemo(() => [...definition.crimes].sort((a, b) => a.levelRequired - b.levelRequired), [definition.crimes]);
  const selected = crimes.find((crime) => crime.id === selectedId) ?? crimes[0];

  useEffect(() => {
    if (!selectedId && crimes[0]) setSelectedId(crimes[0].id);
  }, [crimes, selectedId]);
  useEffect(() => {
    const timer = window.setInterval(() => setCooldowns((current) => {
      const next = { ...current };
      Object.keys(next).forEach((id) => next[id] <= 1 ? delete next[id] : next[id]--);
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!player || !selected) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading operations...</div>;
  const level = player.level ?? 1;
  const unlocked = crimes.filter((crime) => level >= crime.levelRequired).length;
  const selectedLocked = level < selected.levelRequired;
  const energy = resources?.energy ?? player.energy ?? 100;
  const cost = RESOURCE_COSTS[selected.id]?.energy ?? 5;
  const energyBlocked = energy < Math.max(5, cost);
  const cooldown = cooldowns[selected.id] ?? 0;
  const run = async () => {
    if (busy || selectedLocked || energyBlocked || cooldown > 0) return;
    setBusy(true); setResult(undefined);
    try {
      const response = await executeCrime({ crimeId: selected.id, reward: selected.reward, risk: selected.risk, xp: selected.xp });
      setResult({ success: Boolean(response.success), money: response.moneyEarned ?? 0, xp: response.xpEarned ?? 0 });
      const rec = await recordCrime({ category: definition.id, reward: Math.max(0, response.moneyEarned ?? 0), xp: response.xpEarned ?? 0 }).catch(() => null);
      if (rec && rec.coinDrop) setResult((r) => (r ? { ...r, coins: rec.coinDrop } : r));
      setCooldowns((current) => ({ ...current, [selected.id]: Math.max(3, Math.round(selected.risk / 3)) }));
    } catch (error) {
      setResult({ success: false, money: 0, xp: 0, message: error instanceof Error ? error.message : "Operation unavailable." });
    } finally { setBusy(false); }
  };

  return <div className="animate-fade-in space-y-4">
    <header className={`relative overflow-hidden rounded-2xl border border-${meta.tone}-500/25 bg-gradient-to-br from-${meta.tone}-950/50 via-slate-950/80 to-slate-900/60 p-5`}>
      <div className="absolute -right-6 -top-10 text-9xl opacity-10">{meta.icon}</div>
      <div className="relative flex items-end justify-between gap-4"><div><div className={`mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-${meta.tone}-300`}><Sparkles className="size-3" /> {meta.title}</div><h1 className="text-2xl font-black text-white">{meta.tagline}</h1><p className="mt-1 text-xs text-slate-400">{unlocked} of {crimes.length} operations available at your current rank.</p></div><div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center"><div className="text-[9px] text-slate-500">RANK</div><div className={`text-xl font-black text-${meta.tone}-300`}>Lv.{level}</div></div></div>
    </header>
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.65fr)]">
      <div className="grid gap-2 sm:grid-cols-2">
        {crimes.map((crime) => { const locked = level < crime.levelRequired; const active = crime.id === selected.id; return <button key={crime.id} onClick={() => !locked && setSelectedId(crime.id)} className={`rounded-xl border p-3 text-left transition-all ${locked ? "cursor-not-allowed border-slate-800/60 bg-slate-950/40 opacity-50" : active ? `border-${meta.tone}-400/50 bg-${meta.tone}-950/30 shadow-lg` : "border-slate-700/50 bg-slate-900/50 hover:border-white/20"}`}><div className="flex items-start gap-3"><span className="text-2xl">{locked ? "🔒" : meta.icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-white">{crime.name}</span><span className="mt-1 block text-[10px] leading-4 text-slate-400">{crime.description}</span></span></div><div className="mt-3 flex justify-between text-[10px]"><span className="text-green-400">${crime.reward.toLocaleString()}</span><span className="text-blue-400">+{crime.xp} XP</span><span className="text-yellow-300">-{RESOURCE_COSTS[crime.id]?.energy ?? 5} ⚡</span><span className="text-red-400">{crime.risk}% risk</span></div></button>; })}
      </div>
      <section className="h-fit rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-xl"><div className="mb-4 flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selected operation</div>{resources && <div className="text-[10px] font-bold text-yellow-300">Energy now {energy}/{resources.maxEnergy}</div>}<h2 className="mt-1 text-xl font-black text-white">{meta.icon} {selected.name}</h2></div><div className="rounded-full bg-red-500/15 px-2 py-1 text-[10px] font-bold text-red-300">{selected.risk}% risk</div></div><p className="text-xs leading-5 text-slate-400">{selected.description}</p><div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-[10px] leading-4 text-yellow-100/80"><span className="font-bold text-yellow-300">⚡ Energy briefing:</span> this operation uses {RESOURCE_COSTS[selected.id]?.energy ?? 5} energy when started. Energy regenerates by 5 every minute, and if your energy reaches 0, actions unlock again as soon as you recover to 5 energy.</div><div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px]"><div className="rounded-lg bg-white/5 p-2"><div className="text-slate-500">Reward</div><div className="font-bold text-green-400">${selected.reward.toLocaleString()}</div></div><div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2"><div className="text-slate-500">Energy per attempt</div><div className="font-bold text-yellow-300">-{RESOURCE_COSTS[selected.id]?.energy ?? 5} ⚡</div></div><div className="rounded-lg bg-white/5 p-2"><div className="text-slate-500">XP</div><div className="font-bold text-blue-400">+{selected.xp}</div></div><div className="rounded-lg bg-white/5 p-2"><div className="text-slate-500">Unlock</div><div className="font-bold text-purple-300">Lv.{selected.levelRequired}</div></div><div className="rounded-lg bg-white/5 p-2"><div className="text-slate-500">Cooldown</div><div className="font-bold text-amber-300">{cooldown ? `${cooldown}s` : "Ready"}</div></div></div>{selectedLocked ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/70 p-3 text-xs text-slate-400"><Lock className="size-4" /> Reach level {selected.levelRequired} to unlock this operation.</div> : <button onClick={run} disabled={busy || energyBlocked || cooldown > 0} className="mt-4 w-full rounded-xl px-4 py-3 text-xs font-black animate-execute-light relative overflow-hidden disabled:opacity-40">{energyBlocked ? (energy < 5 ? "Recovering to 5 ⚡" : `Need ${Math.max(5, cost)} ⚡ energy`) : busy ? "Executing..." : cooldown ? `Cooldown · ${cooldown}s` : `Execute ${selected.name} · -${cost} ⚡`}</button>}      {result && <div className={`mt-3 rounded-xl border p-3 text-xs ${result.success ? "border-green-500/30 bg-green-950/30 text-green-300" : "border-red-500/30 bg-red-950/30 text-red-300"}`}>{result.success ? `✅ Success · +$${result.money.toLocaleString()} · +${result.xp} XP${result.coins ? ` · +${result.coins} 🪙` : ""}${definition.id === "gta_theft" ? " · 🚗 Stolen vehicle sent to your Garage" : ""}${definition.id === "steal_house" ? " · 🎒 Loot added to My Items" : ""}` : `⚠️ Failed · ${result.message ?? "The operation went wrong."}`}</div>}<div className="mt-4 flex gap-2 text-[9px] leading-4 text-slate-600"><ShieldAlert className="size-3 shrink-0" /> Every top-bar operation uses its listed energy cost. Energy regenerates by 5 every minute; below 5 energy, actions unlock again at 5 energy.</div></section>
    </div>
    {definition.id === "murder" && (
      <AssassinationModule store={store} targetMsg={targetMsg} setTargetMsg={setTargetMsg} targetBusy={targetBusy} setTargetBusy={setTargetBusy} getTarget={getTarget} finishTarget={finishTarget} />
    )}
  </div>;
}

function AssassinationModule({ store, targetMsg, setTargetMsg, targetBusy, setTargetBusy, getTarget, finishTarget }: any) {
  const target = store?.assassinationTarget ?? null;
  const kills = store?.assassinationKills ?? 0;
  const profit = store?.assassinationProfit ?? 0;
  const cooldownUntil = store?.assassinationCooldownUntil ?? 0;
  const now = Date.now();
  const cooldownLeft = Math.max(0, cooldownUntil - now);
  const cooldownText = cooldownLeft > 0 ? `${Math.ceil(cooldownLeft / 60000)}m` : "";

  const act = async (fn: () => Promise<any>, ok: (r: any) => string) => {
    setTargetBusy(true); setTargetMsg(null);
    try { setTargetMsg({ ok: true, text: ok(await fn()) }); }
    catch (e: any) { setTargetMsg({ ok: false, text: e.message || "Failed" }); }
    setTargetBusy(false);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-slate-950/80 to-slate-900/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Assassination Statistics</div>
        </div>
        <div className="text-[10px] text-muted-foreground mb-3">Your assassination performance</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Assassination Kills</div><div className="text-lg font-black text-red-400">{kills}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Assassination Profit</div><div className="text-lg font-black text-green-400">${profit.toLocaleString()}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Action</div><div className="text-[10px] font-bold text-slate-300">Get a new target</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Cooldown</div><div className="text-[10px] font-bold text-amber-300">{cooldownText || "Ready"}</div></div>
        </div>
        {targetMsg && (
          <div className={`mt-3 rounded-xl border p-2.5 text-xs font-bold ${targetMsg.ok ? "border-green-500/30 bg-green-950/30 text-green-300" : "border-red-500/30 bg-red-950/30 text-red-300"}`}>
            {targetMsg.ok ? "✅ " : "⚠️ "}{targetMsg.text}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Your Target(s)</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Your current targets</div>
          </div>
          <button
            disabled={targetBusy || !!target || (cooldownUntil > now)}
            onClick={() => act(() => getTarget(), (r) => `Contract acquired: ${r.target.name} (${r.target.rank}) — bounty $${r.target.bounty.toLocaleString()}`)}
            className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${!target && cooldownUntil <= now ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110" : "bg-slate-800 text-slate-500"}`}>
            {target ? "Contract Active" : cooldownUntil > now ? `Broker cooling · ${cooldownText}` : "Get Target"}
          </button>
        </div>
        {target ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/15 p-4 flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/30 to-slate-900/60 border border-red-500/40 flex items-center justify-center text-2xl">☠️</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white">{target.name}</div>
              <div className="text-[10px] text-red-300 font-bold">{target.rank}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Bounty <span className="text-green-400 font-black">${target.bounty.toLocaleString()}</span> · Expires {new Date(target.expiresAt).toLocaleDateString()}</div>
            </div>
            <button
              disabled={targetBusy}
              onClick={() => act(() => finishTarget(), (r) => r.killed ? `☠️ ${r.targetName} eliminated — collected $${r.bounty.toLocaleString()} + ${r.coinDrop} 🪙!` : `${r.targetName} escaped... contract failed`)}
              className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all disabled:opacity-40 ${targetBusy ? "bg-slate-800 text-slate-500" : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110"}`}>
              {targetBusy ? "Executing..." : "Complete Contract"}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-6 text-center text-[11px] text-muted-foreground">
            Currently No Targets! — hit <span className="text-red-300 font-bold">Get Target</span> and the broker will find you a contract.
          </div>
        )}
      </section>
    </div>
  );
}

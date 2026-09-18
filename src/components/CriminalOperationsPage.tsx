import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock, Lock, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { ActionCard, ActionHero, ActionStat, ExecuteButton, SafetyNote } from "@/components/ActionVisuals";
import { crimeCategories } from "@/data/crimes";
import { RESOURCE_COSTS } from "@/data/resourceCosts";

// Per-category accent palettes (static classes so Tailwind can see them).
const TONE: Record<string, { text: string; border: string; selected: string; hover: string; btn: string; chip: string }> = {
  street: { text: "text-emerald-300", border: "border-emerald-500/30", selected: "border-emerald-400/60 bg-emerald-950/25 shadow-lg shadow-emerald-900/20", hover: "hover:border-emerald-500/30", btn: "from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 shadow-emerald-900/30", chip: "bg-emerald-500/15 text-emerald-300" },
  robbery: { text: "text-red-300", border: "border-red-500/30", selected: "border-red-400/60 bg-red-950/25 shadow-lg shadow-red-900/20", hover: "hover:border-red-500/30", btn: "from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-red-900/30", chip: "bg-red-500/15 text-red-300" },
  fraud: { text: "text-yellow-300", border: "border-yellow-500/30", selected: "border-yellow-400/60 bg-yellow-950/25 shadow-lg shadow-yellow-900/20", hover: "hover:border-yellow-500/30", btn: "from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 shadow-yellow-900/30", chip: "bg-yellow-500/15 text-yellow-300" },
  burglary: { text: "text-orange-300", border: "border-orange-500/30", selected: "border-orange-400/60 bg-orange-950/25 shadow-lg shadow-orange-900/20", hover: "hover:border-orange-500/30", btn: "from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-orange-900/30", chip: "bg-orange-500/15 text-orange-300" },
  drugs: { text: "text-purple-300", border: "border-purple-500/30", selected: "border-purple-400/60 bg-purple-950/25 shadow-lg shadow-purple-900/20", hover: "hover:border-purple-500/30", btn: "from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 shadow-purple-900/30", chip: "bg-purple-500/15 text-purple-300" },
  organized: { text: "text-blue-300", border: "border-blue-500/30", selected: "border-blue-400/60 bg-blue-950/25 shadow-lg shadow-blue-900/20", hover: "hover:border-blue-500/30", btn: "from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-900/30", chip: "bg-blue-500/15 text-blue-300" },
  underground: { text: "text-slate-300", border: "border-slate-500/30", selected: "border-slate-400/60 bg-slate-950/40 shadow-lg shadow-slate-900/20", hover: "hover:border-slate-500/30", btn: "from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 shadow-slate-900/30", chip: "bg-slate-500/15 text-slate-300" },
  gta_theft: { text: "text-cyan-300", border: "border-cyan-500/30", selected: "border-cyan-400/60 bg-cyan-950/25 shadow-lg shadow-cyan-900/20", hover: "hover:border-cyan-500/30", btn: "from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 shadow-cyan-900/30", chip: "bg-cyan-500/15 text-cyan-300" },
  steal_house: { text: "text-rose-300", border: "border-rose-500/30", selected: "border-rose-400/60 bg-rose-950/25 shadow-lg shadow-rose-900/20", hover: "hover:border-rose-500/30", btn: "from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-900/30", chip: "bg-rose-500/15 text-rose-300" },
  murder: { text: "text-red-300", border: "border-red-500/30", selected: "border-red-400/60 bg-red-950/30 shadow-lg shadow-red-900/20", hover: "hover:border-red-500/30", btn: "from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 shadow-red-900/30", chip: "bg-red-500/15 text-red-300" },
};
const FALLBACK_TONE = TONE.street;

const GTA_MISSIONS = [
  "Street Keys — recover a Volvo 240 or Volkswagen Golf",
  "Glasshuset Sweep — deliver an executive sedan to the Garage",
  "Charging Station Run — extract an e-Golf without triggering the immobiliser",
  "City Nord Score — move a Tesla Model S before the heat closes in",
];
const HOUSE_MISSIONS = [
  "Gammelt hus — recover a keycard, watch or gold ring",
  "Nytt hus — extract a tablet, camera, passport or diamond",
  "Villa — secure the laptop, bank card, painting or diamond loot",
];

const categoryMeta: Record<string, { title: string; icon: string; tagline: string }> = {
  street: { title: "Street Operations", icon: "🔪", tagline: "Fast moves, small targets, clean exits." },
  robbery: { title: "Robbery Desk", icon: "💰", tagline: "Plan the score before you touch the door." },
  fraud: { title: "Fraud Bureau", icon: "🃏", tagline: "Information is leverage. Leverage is money." },
  burglary: { title: "Burglary Board", icon: "🏠", tagline: "Every property has a weakness." },
  drugs: { title: "Distribution Network", icon: "💊", tagline: "Routes, contacts, and controlled risk." },
  organized: { title: "Organized Crime", icon: "🕵️", tagline: "Bigger crews. Bigger exposure. Bigger returns." },
  underground: { title: "Underground Desk", icon: "🕳️", tagline: "The jobs nobody puts on a ledger." },
  gta_theft: { title: "GTA Car Theft", icon: "🚗", tagline: "Steal anything with wheels. The bigger the engine, the bigger the score." },
  steal_house: { title: "House Infiltration", icon: "🏠", tagline: "Every home has a weakness. Find it, exploit it, vanish." },
  murder: { title: "Contract Killings", icon: "💀", tagline: "No witnesses. No evidence. No mercy." },
};

const riskTier = (risk: number) =>
  risk < 20 ? { label: "Low Risk", cls: "text-green-400" }
  : risk < 40 ? { label: "Moderate Risk", cls: "text-yellow-400" }
  : risk < 60 ? { label: "High Risk", cls: "text-orange-400" }
  : { label: "Extreme Risk", cls: "text-red-400" };

const shortCash = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
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
  const tone = TONE[definition.id] ?? FALLBACK_TONE;
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
  const energy = resources?.energy ?? (player as any).energy ?? 100;
  const maxEnergy = resources?.maxEnergy ?? 100;
  const cost = RESOURCE_COSTS[selected.id]?.energy ?? 5;
  const energyBlocked = energy < Math.max(5, cost);
  const cooldown = cooldowns[selected.id] ?? 0;
  const cdTotal = Math.max(3, Math.round(selected.risk / 3));
  const rewardRange = `${shortCash(Math.min(...crimes.map((c) => c.reward)))} – ${shortCash(Math.max(...crimes.map((c) => c.reward)))}`;

  const run = async () => {
    if (busy || selectedLocked || energyBlocked || cooldown > 0) return;
    setBusy(true); setResult(undefined);
    try {
      const response = await executeCrime({ crimeId: selected.id, reward: selected.reward, risk: selected.risk, xp: selected.xp });
      setResult({ success: Boolean(response.success), money: response.moneyEarned ?? 0, xp: response.xpEarned ?? 0 });
      const rec = await recordCrime({ category: definition.id, reward: Math.max(0, response.moneyEarned ?? 0), xp: response.xpEarned ?? 0 }).catch(() => null);
      if (rec && rec.coinDrop) setResult((r) => (r ? { ...r, coins: rec.coinDrop } : r));
      setCooldowns((current) => ({ ...current, [selected.id]: cdTotal }));
    } catch (error) {
      setResult({ success: false, money: 0, xp: 0, message: error instanceof Error ? error.message : "Operation unavailable." });
    } finally { setBusy(false); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <ActionHero eyebrow="Live operations network" title={meta.title} description={meta.tagline} icon={meta.icon} accent={definition.id === "organized" ? "purple" : definition.id === "drugs" ? "purple" : definition.id === "gta_theft" ? "cyan" : "red"} right={<div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-slate-500">Your rank</div><div className={`text-lg font-black ${tone.text}`}>Lv.{level}</div></div>} />

      {/* ── Result (GTA style: animated slide-in) ── */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 border-2 ${
            result.success ? "bg-green-950/30 border-green-500/50" : "bg-red-950/30 border-red-500/50"
          }`}
        >
          <div className={`text-xl font-bold ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "✅ SUCCESS!" : "❌ FAILED!"}
          </div>
          {result.success ? (
            <div className="text-sm text-green-300 mt-1">
              💰 +${result.money.toLocaleString()} &nbsp; ⭐ +{result.xp} XP
              {result.coins ? ` &nbsp; 🪙 +${result.coins}` : ""}
              {definition.id === "gta_theft" ? " &nbsp; 🚗 Stolen vehicle sent to your Garage" : ""}
              {definition.id === "steal_house" ? " &nbsp; 🎒 Loot added to My Items" : ""}
            </div>
          ) : (
            <div className="text-sm text-red-300 mt-1">{result.message ?? "The operation went wrong. Better luck next time."}</div>
          )}
        </motion.div>
      )}

      {/* ── Info strip ── */}
      <div className="grid grid-cols-3 gap-2"><ActionStat icon="🎯" label="Operations" value={`${unlocked}/${crimes.length} unlocked`} tone="blue" /><ActionStat icon="💰" label="Payout range" value={rewardRange} tone="green" /><ActionStat icon="⚡" label="Energy" value={`${energy}/${maxEnergy}`} tone="amber" /></div>

      {/* ── Crime category grid (GTA Car Theft layout) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {crimes.map((crime) => {
          const locked = level < crime.levelRequired;
          const active = crime.id === selected.id;
          const tier = riskTier(crime.risk);
          const onCd = (cooldowns[crime.id] ?? 0) > 0;
          return (
            <ActionCard key={crime.id} active={active} className={locked ? "opacity-40 cursor-not-allowed" : ""}>
              <button onClick={() => !locked && setSelectedId(crime.id)} disabled={locked} className="w-full text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg">{locked ? "🔒" : meta.icon}</span>
                <div className="min-w-0">
                  <div className={`text-xs font-bold ${locked ? "text-muted-foreground" : tone.text} truncate`}>{crime.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{crime.description}</div>
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[8px] text-muted-foreground">{locked ? `Lv.${crime.levelRequired}` : shortCash(crime.reward)}</span>
                <span className={`text-[8px] font-bold ${tier.cls}`}>{tier.label}</span>
              </div>
              {onCd && (
                <div className="mt-1 h-1 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-amber-500/70 rounded-full transition-all duration-1000" style={{ width: `${((cooldowns[crime.id] ?? 0) / Math.max(3, Math.round(crime.risk / 3))) * 100}%` }} />
                </div>
              )}
            </button></ActionCard>
          );
        })}
      </div>

      {/* ── Execute panel (GTA-style big button + cooldown bar) ── */}
      {selectedLocked ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-4" /> Reach level {selected.levelRequired} to unlock {selected.name}.
        </div>
      ) : cooldown > 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center">
          <Clock className="size-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <div className="text-sm font-bold">Laying low... {cooldown}s</div>
          <div className="h-2 bg-background/60 rounded-full mt-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${tone.btn.split(" ").filter((c) => c.startsWith("from-") || c.startsWith("to-")).join(" ")}`}
              animate={{ width: `${(cooldown / cdTotal) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      ) : (
        <ExecuteButton onClick={run} disabled={busy || energyBlocked}>{busy ? "Executing..." : energyBlocked ? (energy < 5 ? "Recovering to 5 ⚡" : `Need ${Math.max(5, cost)} ⚡ Energy`) : `${meta.icon} Execute ${selected.name} · -${cost} ⚡`}</ExecuteButton>
      )}

      {/* ── Selected op detail ── */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className={`size-3.5 ${tone.text}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Selected operation</span>
            </div>
            <h3 className="mt-1 text-lg font-black text-white">{meta.icon} {selected.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{selected.description}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${tone.chip}`}>{riskTier(selected.risk).label} · {selected.risk}%</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px] sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-2"><div className="text-muted-foreground">Reward</div><div className="font-bold text-green-400">${selected.reward.toLocaleString()}</div></div>
          <div className="rounded-lg bg-white/5 p-2"><div className="text-muted-foreground">XP</div><div className="font-bold text-blue-400">+{selected.xp}</div></div>
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2"><div className="text-muted-foreground">Energy</div><div className="font-bold text-yellow-300">-{cost} ⚡</div></div>
          <div className="rounded-lg bg-white/5 p-2"><div className="text-muted-foreground">Unlock</div><div className="font-bold text-purple-300">Lv.{selected.levelRequired}</div></div>
        </div>
        <SafetyNote>Energy regenerates by 5 every minute. If you hit 0, actions unlock again once you recover to 5 energy.</SafetyNote>
      </div>

      {definition.id === "murder" && (
        <AssassinationModule store={store} targetMsg={targetMsg} setTargetMsg={setTargetMsg} targetBusy={targetBusy} setTargetBusy={setTargetBusy} getTarget={getTarget} finishTarget={finishTarget} />
      )}
    </div>
  );
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

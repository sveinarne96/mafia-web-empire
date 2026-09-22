import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HEIST_JOBS, HEIST_CREWS, HEIST_EQUIPMENT, computeHeistChance } from "@/data/heist";

const fmt = (n: number) => "$" + Math.floor(n).toLocaleString();
const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return fmt(n);
};

const STYLE_BADGE: Record<string, { label: string; cls: string; icon: string }> = {
  loud: { label: "Loud", cls: "bg-red-500/15 text-red-300 border-red-500/30", icon: "💥" },
  stealth: { label: "Stealth", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30", icon: "👻" },
  either: { label: "Flexible", cls: "bg-slate-500/15 text-slate-300 border-slate-500/30", icon: "🔀" },
};

const oddsColor = (c: number) =>
  c >= 0.7 ? "text-green-400" : c >= 0.5 ? "text-amber-400" : c >= 0.35 ? "text-orange-400" : "text-red-400";

function Card({ children, selected, onClick, disabled, className = "" }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full text-left rounded-xl border p-3 transition-all ${selected ? "border-amber-500/60 bg-amber-950/20 shadow-lg" : "border-slate-700/40 bg-slate-900/30 hover:border-white/20"} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  );
}

function StyleBadge({ style }: { style: "loud" | "stealth" | "either" }) {
  const b = STYLE_BADGE[style];
  return <span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${b.cls}`}>{b.icon} {b.label}</span>;
}

export function HeistPage() {
  const state = useQuery(api.empireSystem.getHeistState);
  const player = useQuery(api.game.getPlayer);
  const execute = useMutation(api.empireSystem.executeHeist);
  const [job, setJob] = useState(HEIST_JOBS[0].id);
  const [crew, setCrew] = useState(HEIST_CREWS[0].id);
  const [equip, setEquip] = useState(HEIST_EQUIPMENT[0].id);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!state) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading heist network...</div>;

  const selJob = HEIST_JOBS.find((j) => j.id === job)!;
  const selCrew = HEIST_CREWS.find((c) => c.id === crew)!;
  const selEquip = HEIST_EQUIPMENT.find((e) => e.id === equip)!;
  const cost = selCrew.cost + selEquip.cost;
  const cooldownLeft = state.lastHeistAt ? Math.max(0, (state.lastHeistAt + selEquip.cooldown * 60000) - Date.now()) : 0;
  const energy = state.energy ?? 100;
  const level = player?.level ?? 1;
  const chanceBoost = Date.now() < ((player as any)?.heistChanceUntil ?? 0);
  const odds = computeHeistChance(selJob, selCrew, selEquip, level, chanceBoost);
  const crewSynergy = selJob.style !== "either" && selCrew.style === selJob.style;
  const gearSynergy = selJob.style !== "either" && selEquip.style === selJob.style;
  const crewMismatch = selJob.style !== "either" && selCrew.style !== "either" && selCrew.style !== selJob.style;
  const gearMismatch = selJob.style !== "either" && selEquip.style !== "either" && selEquip.style !== selJob.style;

  const go = async () => {
    setBusy(true); setResult(null);
    try { setResult(await execute({ jobId: job, crewId: crew, equipmentId: equip })); }
    catch (e: any) { setResult({ error: e.message || "Heist failed to start" }); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">💰</span>
        <div>
          <h2 className="text-2xl font-bold mafia-gold">Heist</h2>
          <p className="text-xs text-muted-foreground">Match the crew and gear to the job's style — synergy raises the odds, mismatch sinks them.</p>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`mafia-card rounded-xl p-4 text-xs font-bold ${result.error ? "text-red-400 border-red-500/30" : (result.success ? "border-green-500/30" : "border-red-500/30")}`}>
          {result.error ? `⚠️ ${result.error}` : result.success
            ? `✅ Heist COMPLETE — ${result.job} netted ${fmt(result.payout)} (cost ${fmt(result.cost)}) · +${nf(result.xp)} XP · ${Math.round(result.chance * 100)}% crew success`
            : `❌ The ${result.job} went bad — ${result.crew} got caught. Lost ${fmt(result.cost)} · +${nf(result.xp)} XP`}
        </motion.div>
      )}

      {/* Stats */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-3">🎯 Heist Statistics <span className="text-[10px] text-muted-foreground font-normal">— your heist performance overview</span></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Total Heists</div><div className="text-lg font-black text-white">{nf(state.heistsTotal)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Successful Heists</div><div className="text-lg font-black text-green-400">{nf(state.heistsSuccess)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Failed Heists</div><div className="text-lg font-black text-red-400">{nf(state.heistsFailed)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Total Profit</div><div className="text-lg font-black text-amber-400">{short(state.heistProfit)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Balance / Energy</div><div className="text-lg font-black text-cyan-400">{short(state.money)} / {nf(energy)}⚡</div></div>
        </div>
      </div>

      {/* Select Job */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-1">🔒 Select Job</div>
        <div className="text-[10px] text-muted-foreground mb-3">Every job has a style — plan your loadout around it.</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="text-[9px] uppercase text-muted-foreground border-b border-slate-700/40"><th className="py-2 pr-2">Job</th><th className="py-2 pr-2">Style</th><th className="py-2 pr-2">Min Payout</th><th className="py-2 pr-2">Max Payout</th></tr></thead>
            <tbody>
              {HEIST_JOBS.map((j) => (
                <tr key={j.id} onClick={() => setJob(j.id)} className={`border-b border-slate-800/40 cursor-pointer ${job === j.id ? "bg-amber-950/20" : ""}`}>
                  <td className="py-2 pr-2 font-bold"><button onClick={() => setJob(j.id)} className="px-1.5 py-0.5 rounded mr-2 text-[9px] font-black bg-slate-800 text-amber-400">{job === j.id ? "●" : "○"} Select</button>{j.icon} {j.name}</td>
                  <td className="py-2 pr-2"><StyleBadge style={j.style} /></td>
                  <td className="py-2 pr-2 text-green-400">{short(j.min)}</td>
                  <td className="py-2 pr-2 text-green-400">{short(j.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Select Crew */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-1">🤝 Select Crew</div>
        <div className="text-[10px] text-muted-foreground mb-3">Base success chance — boosted when the crew's style matches the job.</div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {HEIST_CREWS.map((c) => (
            <Card key={c.id} selected={crew === c.id} onClick={() => setCrew(c.id)} disabled={state.money < c.cost}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-black">{c.icon} {c.name}</div>
                <StyleBadge style={c.style} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{c.blurb}</div>
              <div className="text-[10px] mt-1 flex justify-between">
                <span className={crewSynergy && c.style === selJob.style ? "text-green-400 font-bold" : crewMismatch && c.style !== "either" && c.style !== selJob.style ? "text-red-400 font-bold" : ""}>
                  {selJob.style !== "either" && c.style === selJob.style ? "★ Style match +5%" : selJob.style !== "either" && c.style !== "either" && c.style !== selJob.style ? "✗ Mismatch −4%" : "No style bonus"}
                </span>
                <span className="text-amber-400 font-bold">{fmt(c.cost)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Select Equipment */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-1">🧰 Select Equipment</div>
        <div className="text-[10px] text-muted-foreground mb-3">Sets the heist cooldown — matching gear adds odds, wrong gear costs them.</div>
        <div className="grid gap-2 md:grid-cols-3">
          {HEIST_EQUIPMENT.map((e) => (
            <Card key={e.id} selected={equip === e.id} onClick={() => setEquip(e.id)} disabled={state.money < e.cost}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-black">{e.icon} {e.name}</div>
                <StyleBadge style={e.style} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{e.blurb}</div>
              <div className="text-[10px] mt-1 flex justify-between">
                <span>Cooldown · {e.cooldown} min</span>
                <span className="text-amber-400 font-bold">{fmt(e.cost)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Odds briefing */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-3">📊 Odds Briefing</div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-center">
            <div className={`text-4xl font-black ${oddsColor(odds)}`}>{Math.round(odds * 100)}%</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">estimated success</div>
          </div>
          <div className="flex-1 min-w-[220px] space-y-1.5 text-[10px]">
            <div className="flex justify-between border-b border-slate-800 pb-1"><span className="text-slate-500">Crew base ({selCrew.name})</span><span className="font-bold text-slate-300">{Math.round(selCrew.chance * 100)}%</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-1"><span className="text-slate-500">Your level ({nf(level)})</span><span className="font-bold text-slate-300">+{Math.round(level * 0.4)}%</span></div>
            <div className={`flex justify-between border-b border-slate-800 pb-1 ${crewSynergy ? "text-green-400" : crewMismatch ? "text-red-400" : "text-slate-500"}`}>
              <span>Crew style vs {STYLE_BADGE[selJob.style].label.toLowerCase()} job</span>
              <span className="font-bold">{crewSynergy ? "+5%" : crewMismatch ? "−4%" : "±0%"}</span>
            </div>
            <div className={`flex justify-between border-b border-slate-800 pb-1 ${gearSynergy ? "text-green-400" : gearMismatch ? "text-red-400" : "text-slate-500"}`}>
              <span>Gear style vs job</span>
              <span className="font-bold">{gearSynergy ? "+3%" : gearMismatch ? "−2.5%" : "±0%"}</span>
            </div>
            {chanceBoost && (
              <div className="flex justify-between border-b border-slate-800 pb-1 text-green-400"><span>Heist Chance boost active</span><span className="font-bold">+10%</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Start */}
      <div className="mafia-card rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground">
          <span className="text-white font-bold">{selJob.icon} {selJob.name}</span> · {selCrew.name} ({Math.round(odds * 100)}%) · {selEquip.name}<br />
          <span className="text-amber-400 font-black">Cost {fmt(cost)}</span> {cooldownLeft > 0 ? `· ${Math.ceil(cooldownLeft / 60000)}m cooldown` : "· Ready"}
        </div>
        <button
          disabled={busy || state.money < cost || energy < 30 || cooldownLeft > 0}
          onClick={go}
          className="px-8 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed animate-execute-light">
          {busy ? "Planning heist..." : state.money < cost ? "Not enough money" : energy < 30 ? "Need 30 ⚡" : cooldownLeft > 0 ? `Cooling · ${Math.ceil(cooldownLeft / 60000)}m` : `Start Heist · ${fmt(cost)}`}
        </button>
      </div>
    </div>
  );
}

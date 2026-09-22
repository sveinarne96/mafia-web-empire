import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Gift, Megaphone, RefreshCw, Sparkles, Trophy, Vote, Users, Clock } from "lucide-react";

const prizeMeta: Record<string, { icon: string; label: string; color: string }> = {
  perk: { icon: "🚀", label: "Random Perk", color: "text-fuchsia-300" },
  cash: { icon: "💵", label: "Cash", color: "text-emerald-300" },
  xp: { icon: "⭐", label: "XP", color: "text-sky-300" },
  points: { icon: "🏆", label: "Points", color: "text-amber-300" },
  bullets: { icon: "💀", label: "Bullets", color: "text-red-300" },
  freeBet: { icon: "🎰", label: "Free Bet Token", color: "text-violet-300" },
};

const perkLabels: Record<string, string> = {
  doubleXp: "Double XP", doublePay: "Double Pay", jailImmunity: "Jail Immune",
  bustBoost: "Bust Boost", autoRank: "Auto Ranks", heistChance: "Heist Chance", heistTimer: "Heist Timer",
};

function formatCooldown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function CommunityHubPage() {
  const votes = useQuery(api.communitySystem.getVoteCenter);
  const missions = useQuery(api.communitySystem.getCommunityMissions);
  const matcher = useQuery(api.communitySystem.getPrizeMatcher);
  const claimVote = useMutation(api.communitySystem.claimVoteReward);
  const claimMission = useMutation(api.communitySystem.claimCommunityMission);
  const claimDaily = useMutation(api.gameExtended.claimDailyReward);
  const reveal = useMutation(api.communitySystem.revealPrizeMatcher);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const revealCooldown = Math.max(0, (matcher?.cooldownMs ?? 0) - tick * 0);
  const revealed = (matcher?.revealed ?? {}) as Record<string, string>;
  const counts = (matcher?.counts ?? {}) as Record<string, number>;
  const completed = (matcher?.completed ?? {}) as Record<string, number>;
  const prizes = useMemo(() => Object.keys(prizeMeta), []);

  const run = async (key: string, task: () => Promise<any>) => {
    setBusy(key); setMessage(null);
    try {
      const result = await task();
      if (result?.reward) {
        const r = result.reward;
        setMessage(`🎉 ${r.label}: ${r.perk ? perkLabels[r.perk] ?? r.perk : r.value.toLocaleString()}`);
      } else if (result?.message) setMessage(result.message);
      else setMessage("✅ Reward claimed successfully.");
    } catch (error: any) {
      setMessage(error?.message ?? "That action is unavailable right now.");
    } finally { setBusy(null); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-950 via-fuchsia-950/30 to-amber-950/20 p-6">
        <div className="absolute -right-8 -top-10 text-[150px] opacity-10">🎁</div>
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 p-3"><Users className="size-7 text-fuchsia-300" /></div>
          <div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-300">The City Board</div><h1 className="text-3xl font-black text-white">Community Center</h1><p className="mt-1 text-xs text-slate-400">Vote, collaborate, collect daily gifts, and keep the whole underworld moving.</p></div>
          <div className="ml-auto rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-amber-300/70">Your votes</div><div className="text-xl font-black text-amber-200">{votes?.totalVotes ?? 0}</div></div>
        </div>
      </div>

      {message && <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">{message}</div>}

      <section className="space-y-3">
        <div className="flex items-center gap-2"><Vote className="size-5 text-cyan-300" /><div><h2 className="text-lg font-black text-white">Vote for Shadow Empire</h2><p className="text-[10px] text-slate-500">Every vote helps new players discover the city. Each partner refreshes every 12 hours.</p></div></div>
        <div className="grid gap-3 md:grid-cols-3">
          {(votes?.sites ?? []).map((site) => (
            <motion.div key={site.id} whileHover={{ y: -2 }} className="rounded-xl border border-cyan-500/20 bg-slate-950/70 p-4">
              <div className="flex items-start gap-3"><span className="text-3xl">{site.icon}</span><div className="min-w-0 flex-1"><div className="font-black text-cyan-200">{site.name}</div><div className="mt-1 text-[10px] leading-4 text-slate-500">{site.description}</div></div></div>
              <div className="mt-4 flex items-center justify-between text-[10px]"><span className="font-bold text-emerald-300">+$ {site.reward.toLocaleString()} · +{site.points} pts</span><span className="text-slate-500">{site.ready ? "READY" : formatCooldown(site.cooldownMs)}</span></div>
              <button disabled={!site.ready || busy === `vote-${site.id}`} onClick={() => run(`vote-${site.id}`, () => claimVote({ siteId: site.id }))} className="mt-3 w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2 text-xs font-black text-white transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{busy === `vote-${site.id}` ? "VERIFYING…" : site.ready ? "CAST VOTE & CLAIM" : "VOTE COOLDOWN"}</button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2"><Megaphone className="size-5 text-amber-300" /><div><h2 className="text-lg font-black text-white">Community Missions</h2><p className="text-[10px] text-slate-500">Everyone contributes. Once the city hits a target, every player can claim once.</p></div></div>
        <div className="grid gap-3 md:grid-cols-2">
          {(missions ?? []).map((mission) => (
            <div key={mission.id} className="rounded-xl border border-amber-500/20 bg-slate-950/70 p-4">
              <div className="flex items-center gap-3"><span className="text-3xl">{mission.icon}</span><div className="flex-1"><div className="font-black text-amber-200">{mission.title}</div><div className="text-[10px] text-slate-500">{mission.description}</div></div><div className="text-right text-[10px] text-slate-400">{mission.current.toLocaleString()} / {mission.target.toLocaleString()}</div></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all" style={{ width: `${mission.percent}%` }} /></div>
              <div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-bold text-emerald-300">${mission.reward.toLocaleString()} + {mission.points.toLocaleString()} pts</span><button disabled={!mission.completed || mission.claimed || busy === `mission-${mission.id}`} onClick={() => run(`mission-${mission.id}`, () => claimMission({ missionId: mission.id }))} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black text-amber-200 disabled:cursor-not-allowed disabled:opacity-35">{mission.claimed ? "CLAIMED" : mission.completed ? "CLAIM REWARD" : `${mission.percent}% COMPLETE`}</button></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 to-slate-950/80 p-5">
        <div className="flex flex-wrap items-center gap-3"><Gift className="size-6 text-emerald-300" /><div className="flex-1"><h2 className="text-lg font-black text-emerald-200">Daily Gifts & Rewards</h2><p className="text-[10px] text-slate-500">Keep your login streak alive. The seventh day pays the biggest bonus.</p></div><button onClick={() => run("daily", () => claimDaily({}))} disabled={busy === "daily"} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-40">{busy === "daily" ? "CLAIMING…" : "CLAIM DAILY GIFT"}</button></div>
      </section>

      <section className="space-y-3 rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/20 to-slate-950/80 p-5">
        <div className="flex flex-wrap items-center gap-3"><Sparkles className="size-6 text-fuchsia-300" /><div className="flex-1"><h2 className="text-lg font-black text-fuchsia-200">Prize Matcher</h2><p className="text-[10px] text-slate-500">15 reveals each day · one reveal every 15 minutes · collect symbols to complete prizes.</p></div><div className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-2 text-right"><div className="text-[9px] uppercase text-fuchsia-300/60">Reveals left today</div><div className="text-xl font-black text-fuchsia-200">{matcher?.revealsLeft ?? 15}</div></div></div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {Array.from({ length: matcher?.boardSize ?? 48 }, (_, index) => {
            const value = revealed[index];
            const meta = value && value !== "x" ? prizeMeta[value] : null;
            const locked = value !== undefined;
            const disabled = locked || (matcher?.revealsLeft ?? 0) <= 0 || (matcher?.cooldownMs ?? 0) > 0 || busy === `tile-${index}`;
            return <button key={index} disabled={disabled} onClick={() => run(`tile-${index}`, () => reveal({ tile: index }))} className={`aspect-square rounded-lg border text-lg transition-all sm:text-xl ${locked ? meta ? `border-fuchsia-400/50 bg-fuchsia-500/15 ${meta.color}` : "border-slate-700 bg-slate-900/80 text-slate-500" : "border-slate-700/50 bg-slate-900/60 text-slate-700 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10"}`}>{locked ? meta?.icon ?? "✕" : "?"}</button>;
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400"><Clock className="size-3.5 text-fuchsia-300" />{(matcher?.cooldownMs ?? 0) > 0 ? `Next reveal in ${formatCooldown(matcher?.cooldownMs ?? 0)}` : "A reveal is ready now"}<span className="text-slate-700">•</span><RefreshCw className="size-3.5 text-fuchsia-300" />Board resets at midnight.</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {prizes.map((symbol) => { const meta = prizeMeta[symbol]; const target = matcher?.targets?.[symbol] ?? 0; const count = counts[symbol] ?? 0; const rounds = completed[symbol] ?? 0; return <div key={symbol} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"><div className="flex items-center justify-between"><span className={`text-xs font-black ${meta.color}`}>{meta.icon} {meta.label}</span><span className="text-[10px] text-slate-500">{count}/{target} · completed {rounds}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400" style={{ width: `${target ? Math.min(100, (count / target) * 100) : 0}%` }} /></div></div>; })}
        </div>
      </section>

      <div className="flex items-center gap-2 text-[10px] text-slate-600"><Trophy className="size-3.5" />Rewards are granted server-side and can’t be duplicated by refreshing or opening multiple tabs.</div>
    </div>
  );
}

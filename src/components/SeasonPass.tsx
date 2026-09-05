import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Gift, Lock, Trophy, Crown, Star, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { FREE_TRACK, VIP_LEVELS, VIP_XP_PER_LEVEL, vipRewardForLevel } from "../data/objectives";

const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
};

const REWARD_META: Record<string, { icon: string; color: string }> = {
  bullets: { icon: "💀", color: "text-orange-400" },
  autoRank: { icon: "⭐", color: "text-yellow-400" },
  commonPack: { icon: "🎁", color: "text-slate-300" },
  epicPack: { icon: "✨", color: "text-purple-400" },
  doubleXp: { icon: "🚀", color: "text-cyan-400" },
  doublePay: { icon: "💰", color: "text-green-400" },
  goldBar: { icon: "🪙", color: "text-amber-400" },
  heistTimer: { icon: "⏳", color: "text-blue-400" },
  heistChance: { icon: "🎰", color: "text-pink-400" },
  points: { icon: "🏆", color: "text-yellow-300" },
  cash: { icon: "💵", color: "text-green-400" },
  bustBoost: { icon: "💥", color: "text-red-400" },
  commonScrap: { icon: "🧩", color: "text-slate-400" },
  legendaryPack: { icon: "💎", color: "text-amber-400" },
  coins: { icon: "🪙", color: "text-amber-300" },
  car: { icon: "🚗", color: "text-cyan-400" },
};

function rewardRow(type: string, amount: number, cash: number) {
  const meta = REWARD_META[type] ?? { icon: "🎁", color: "text-slate-300" };
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold ${meta.color}`}>
      <span>{meta.icon}</span>
      {type === "cash" ? `$${nf(cash)}` : `${nf(amount)} ${type.replace(/([A-Z])/g, " $1").toLowerCase()}`}
    </span>
  );
}

export function SeasonPassPage() {
  const store = useQuery(api.storeSystem.getStoreState);
  const claimTier = useMutation(api.storeSystem.claimSeasonTier);
  const claimVip = useMutation(api.storeSystem.claimVipLevel);
  const buyVip = useMutation(api.storeSystem.purchasePointItem);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showVip, setShowVip] = useState(false);
  const [freePage, setFreePage] = useState(0);

  // 500+ tiers render in pages — never materialize all rows at once.
  const FREE_PER_PAGE = 25;
  const freePages = Math.max(1, Math.ceil(FREE_TRACK.length / FREE_PER_PAGE));
  const clampedPage = Math.min(freePages - 1, Math.max(0, freePage));
  const pageStart = clampedPage * FREE_PER_PAGE;
  const pageTiers = FREE_TRACK.slice(pageStart, pageStart + FREE_PER_PAGE);
  const currentTierPage = Math.min(freePages - 1, Math.max(0, Math.floor((store?.freeTrackProgress ?? 0) / FREE_PER_PAGE)));
  const PageControls = ({ compact }: { compact?: boolean }) => (
    <div className={`flex items-center justify-between gap-2 ${compact ? "pt-1" : "pt-3"}`}>
      <button
        onClick={() => setFreePage(0)}
        disabled={clampedPage === 0}
        className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold disabled:opacity-30 hover:bg-white/10 transition">
        ⏮ First
      </button>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setFreePage(clampedPage - 1)}
          disabled={clampedPage === 0}
          className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold disabled:opacity-30 hover:bg-white/10 transition">
          ◀
        </button>
        <span className="text-[10px] font-black text-muted-foreground">Tiers {pageStart + 1}–{Math.min(FREE_TRACK.length, pageStart + FREE_PER_PAGE)} / {FREE_TRACK.length}</span>
        <button
          onClick={() => setFreePage(clampedPage + 1)}
          disabled={clampedPage >= freePages - 1}
          className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold disabled:opacity-30 hover:bg-white/10 transition">
          ▶
        </button>
      </div>
      <button
        onClick={() => setFreePage(currentTierPage)}
        disabled={clampedPage === currentTierPage}
        className="px-2 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/25 transition disabled:opacity-30">
        📍 Your tier
      </button>
    </div>
  );

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading Season Pass...</div>;

  const seasonXp = store.seasonXp ?? 0;
  const freePct = store.freeTrackProgress >= FREE_TRACK.length
    ? 100
    : Math.min(100, Math.round((seasonXp / FREE_TRACK[store.freeTrackProgress].xp) * 10000) / 100);
  const vipLevel = store.vipActive ? store.vipLevel : 0;
  const vipClaimed: number[] = store.vipLevelsClaimed ?? [];
  const vipNext = vipLevel < VIP_LEVELS ? vipLevel + 1 : null;
  const vipNeed = vipNext ? (() => {
    let total = 0;
    for (let i = 1; i <= vipNext; i++) total += VIP_XP_PER_LEVEL(i);
    return total;
  })() : 0;
  const vipPct = vipNext ? Math.min(100, Math.round((seasonXp / vipNeed) * 10000) / 100) : 100;
  const endDate = new Date(store.seasonEndsAt ?? Date.now() + 1000 * 60 * 60 * 24 * 30).toLocaleDateString();

  const run = async (key: string, fn: () => Promise<any>) => {
    setBusy(key);
    setMsg(null);
    try {
      const r = await fn();
      setMsg({ ok: true, text: `✅ Claimed: ${r.reward}` });
    } catch (e: any) {
      setMsg({ ok: false, text: `⚠️ ${e.message || "Failed"}` });
    }
    setBusy(null);
  };

  const cumulativeVip = (level: number) => {
    let t = 0;
    for (let i = 1; i <= level; i++) t += VIP_XP_PER_LEVEL(i);
    return t;
  };

  const claimedSet = new Set(store.seasonTiersClaimed ?? []);
  const claimedBullets = FREE_TRACK.filter((t) => claimedSet.has(t.tier) && t.type === "bullets").reduce((s, t) => s + t.amount, 0);
  const claimedPoints = FREE_TRACK.filter((t) => claimedSet.has(t.tier) && t.type === "points").reduce((s, t) => s + t.amount, 0);
  const claimedPerks = FREE_TRACK.filter((t) => claimedSet.has(t.tier) && (t.type === "autoRank" || t.type === "doubleXp" || t.type === "heistTimer" || t.type === "heistChance")).reduce((s, t) => s + t.amount, 0);
  const claimedPacks = FREE_TRACK.filter((t) => claimedSet.has(t.tier) && (t.type === "commonPack" || t.type === "epicPack" || t.type === "legendaryPack")).reduce((s, t) => s + t.amount, 0);
  const claimedGold = FREE_TRACK.filter((t) => claimedSet.has(t.tier) && t.type === "goldBar").reduce((s, t) => s + t.amount, 0);
  // Full-track totals for the Rewards Bank (500 tiers).
  const TOTAL_BULLETS = FREE_TRACK.filter((t) => t.type === "bullets").reduce((s, t) => s + t.amount, 0);
  const TOTAL_PERKS = FREE_TRACK.filter((t) => t.type === "autoRank" || t.type === "doubleXp" || t.type === "heistTimer" || t.type === "heistChance").reduce((s, t) => s + t.amount, 0);
  const TOTAL_PACKS = FREE_TRACK.filter((t) => t.type === "commonPack" || t.type === "epicPack" || t.type === "legendaryPack").reduce((s, t) => s + t.amount, 0);
  const TOTAL_POINTS = FREE_TRACK.filter((t) => t.type === "points").reduce((s, t) => s + t.amount, 0);
  const TOTAL_GOLD = FREE_TRACK.filter((t) => t.type === "goldBar").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎫</span>
        <div>
          <h2 className="text-2xl font-bold mafia-gold">Season Pass</h2>
          <p className="text-xs text-muted-foreground">Every top-bar criminal action feeds Season XP. Climb the tracks and bank the rewards.</p>
        </div>
      </div>

      {msg && (
        <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>{msg.text}</div>
      )}

      {/* Season header */}
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold">🎫 Season Progress — <span className="text-purple-400">({freePct.toFixed(2)}%)</span></div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Ends {endDate}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${store.vipActive ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-slate-800 border-slate-600/40 text-slate-400"}`}>
            {store.vipActive ? "👑 VIP Membership" : "Membership: Free"}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Free Tier</div>
            <div className="text-lg font-black text-cyan-400">{store.freeTrackProgress} / {FREE_TRACK.length}</div>
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">VIP Level</div>
            <div className="text-lg font-black text-amber-400">Lv.{vipLevel} / {VIP_LEVELS}</div>
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Season XP</div>
            <div className="text-lg font-black text-purple-400">{short(seasonXp)}</div>
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Actions to Progress</div>
            <div className="text-lg font-black text-green-400">Every action counts</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Free Track</span>
            <span>{store.freeTrackProgress >= FREE_TRACK.length ? "MAXED" : `${short(FREE_TRACK[store.freeTrackProgress].xp - seasonXp)} XP to Tier ${store.freeTrackProgress + 1}`}</span>
          </div>
          <div className="h-2 bg-background/60 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${freePct}%` }} />
          </div>
        </div>
        {vipNext && (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>👑 VIP Track</span>
              <span>{vipPct}% to Lv.{vipNext}</span>
            </div>
            <div className="h-2 bg-background/60 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 rounded-full transition-all" style={{ width: `${vipPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Reward / Earned summary */}
      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-3">📦 Rewards Bank</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
          <div className="rounded-lg bg-background/40 p-2"><div className="text-[9px] text-muted-foreground">💀 Bullets</div><div className="text-xs font-black text-orange-400">{nf(claimedBullets)} / {nf(TOTAL_BULLETS)}</div></div>
          <div className="rounded-lg bg-background/40 p-2"><div className="text-[9px] text-muted-foreground">⭐ Rank Perks</div><div className="text-xs font-black text-yellow-400">{nf(claimedPerks)} / {nf(TOTAL_PERKS)}</div></div>
          <div className="rounded-lg bg-background/40 p-2"><div className="text-[9px] text-muted-foreground">🎁 Packs</div><div className="text-xs font-black text-slate-300">{nf(claimedPacks)} / {nf(TOTAL_PACKS)}</div></div>
          <div className="rounded-lg bg-background/40 p-2"><div className="text-[9px] text-muted-foreground">🏆 Points</div><div className="text-xs font-black text-yellow-300">{nf(claimedPoints)} / {nf(TOTAL_POINTS)}</div></div>
          <div className="rounded-lg bg-background/40 p-2"><div className="text-[9px] text-muted-foreground">🪙 Gold Bars</div><div className="text-xs font-black text-amber-400">{nf(claimedGold)} / {nf(TOTAL_GOLD)}</div></div>
        </div>
      </div>

      {/* Free Track */}
      <div className="mafia-card rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 mb-2"><Gift className="size-5 text-cyan-400" /><h3 className="font-bold text-sm">🎁 Free Track — available to all players <span className="text-[10px] text-muted-foreground font-normal">({FREE_TRACK.length} tiers)</span></h3></div>
        {pageTiers.map((t) => {
          const claimed = (store.seasonTiersClaimed ?? []).includes(t.tier);
          const ready = !claimed && seasonXp >= t.xp;
          const isCurrent = !claimed && seasonXp < t.xp && t.tier === store.freeTrackProgress + 1;
          return (
            <motion.div key={t.tier} whileHover={{ scale: 1.005 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${claimed ? "border-green-500/30 bg-green-950/10" : ready ? "border-amber-500/50 bg-amber-950/20 animate-border-glow" : isCurrent ? "border-cyan-500/30 bg-cyan-950/10" : "border-slate-700/40 bg-slate-900/30 opacity-70"}`}>
              <div className="w-9 h-9 rounded-lg bg-background/60 flex items-center justify-center text-lg shrink-0">
                {claimed ? <CheckCircle2 className="size-5 text-green-400" /> : isCurrent ? <Star className="size-4 text-cyan-400" /> : <Lock className="size-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Tier {t.tier}</span>
                  {rewardRow(t.type, t.amount, 0)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {claimed ? "Claimed" : ready ? `Ready — ${nf(t.xp)} XP` : isCurrent ? `${short(t.xp - seasonXp)} XP to unlock` : `${short(t.xp)} XP required`}
                </div>
              </div>
              <button
                disabled={!ready || busy === `f${t.tier}`}
                onClick={() => run(`f${t.tier}`, () => claimTier({ tier: t.tier }))}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${ready ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}`}>
                {claimed ? "Done" : ready ? "Claim" : `${short(Math.max(0, t.xp - seasonXp))} XP`}
              </button>
            </motion.div>
          );
        })}
        <PageControls />
      </div>

      {/* VIP Track */}
      <div className="mafia-card rounded-xl p-5 space-y-2">
        <button onClick={() => setShowVip(!showVip)} className="w-full flex items-center gap-2">
          <Crown className="size-5 text-amber-400" />
          <h3 className="font-bold text-sm flex-1 text-left">👑 VIP Track — requires VIP membership</h3>
          {showVip ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </button>
        {store.vipActive ? (
          <div className="text-[10px] text-green-400 font-bold">✅ VIP active — Lv.{vipLevel} of {VIP_LEVELS} · {vipNext ? `${short(vipNeed - seasonXp)} XP to Lv.${vipNext}` : "Max level reached!"}</div>
        ) : (
          <div className="mafia-card rounded-xl p-3 flex flex-wrap items-center gap-3 border-amber-500/20">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-amber-400">👑 VIP Membership (30 days)</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Unlocks the VIP track and every claimable level reward. You have <span className="text-yellow-300 font-bold">{nf(store.points ?? 0)}</span> points.</div>
            </div>
            <button
              disabled={busy === "vipbuy" || (store.points ?? 0) < 2500}
              onClick={async () => {
                setBusy("vipbuy"); setMsg(null);
                try { const r = await buyVip({ itemId: "vip" }); setMsg({ ok: true, text: `✅ ${r.item} activated — VIP track unlocked for 30 days!` }); }
                catch (e: any) { setMsg({ ok: false, text: `⚠️ ${e.message || "Failed"}` }); }
                setBusy(null);
              }}
              className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${(store.points ?? 0) >= 2500 ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110" : "bg-slate-800 text-slate-500"}`}>
              Get VIP · 2,500 pts
            </button>
          </div>
        )}
        {showVip && store.vipActive && (
          <div className="space-y-1.5 pt-2">
            {Array.from({ length: Math.min(10, VIP_LEVELS) }, (_, i) => {
              const level = vipLevel + 1 + i;
              if (level > VIP_LEVELS) return null;
              const reward = vipRewardForLevel(level);
              const need = cumulativeVip(level);
              const claimed = vipClaimed.includes(level);
              const ready = !claimed && seasonXp >= need;
              return (
                <div key={level} className={`flex items-center gap-3 p-2.5 rounded-lg border ${claimed ? "border-green-500/30 bg-green-950/10" : ready ? "border-amber-500/50 bg-amber-950/20" : "border-slate-700/40 bg-slate-900/30 opacity-70"}`}>
                  <div className="w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center text-xs font-black shrink-0">
                    {claimed ? <CheckCircle2 className="size-4 text-green-400" /> : <Trophy className="size-3.5 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold">Lv.{level}</div>
                    <div className="text-[10px]">{rewardRow(reward.type, reward.amount, reward.cash)}</div>
                  </div>
                  <div className="text-[9px] text-muted-foreground">{claimed ? "Claimed" : ready ? `Ready · ${short(need)} XP` : `${short(need - seasonXp)} XP`}</div>
                  <button
                    disabled={!ready || busy === `v${level}`}
                    onClick={() => run(`v${level}`, () => claimVip({ level }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${ready ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}`}>
                    {claimed ? "Done" : ready ? "Claim" : "Locked"}
                  </button>
                </div>
              );
            })}
            <div className="text-[9px] text-muted-foreground pt-1">Showing next 10 levels — every level has a claimable reward, scaling every 10 levels.</div>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-3">🏁 Season Milestones</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[9px] uppercase text-muted-foreground border-b border-slate-700/40">
                <th className="py-2 pr-2">Milestone</th>
                <th className="py-2 pr-2">Reward</th>
                <th className="py-2 pr-2">XP</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageTiers.map((t) => {
                const claimed = (store.seasonTiersClaimed ?? []).includes(t.tier);
                const isCurrent = !claimed && t.tier === store.freeTrackProgress + 1;
                return (
                  <tr key={t.tier} className={`border-b border-slate-800/40 ${isCurrent ? "bg-cyan-950/10" : ""}`}>
                    <td className="py-2 pr-2 font-bold">Free Tier {t.tier}</td>
                    <td className="py-2 pr-2">{rewardRow(t.type, t.amount, 0)}</td>
                    <td className="py-2 pr-2 text-slate-400">{nf(t.xp)}</td>
                    <td className="py-2">
                      {claimed ? <span className="text-green-400 font-bold">Claimed</span>
                        : isCurrent ? <span className="text-cyan-400 font-bold">Current</span>
                        : <span className="text-slate-500">Locked</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PageControls compact />
      </div>
    </div>
  );
}

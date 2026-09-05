import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CATEGORY_OBJECTIVES, MILESTONE_OBJECTIVES, FREE_TRACK, VIP_LEVELS,
  VIP_XP_PER_LEVEL, vipRewardForLevel,
  ROBOT_BODYGUARDS, ACCOUNT_UPGRADES, PERK_BUNDLES, POINT_STORE_EXTRA,
  COIN_STORE_ITEMS,
} from "@/data/objectives";
import { getRarityColor, rarityLabel } from "@/data/carMarket";

const fmt = (n: number) => "$" + Math.floor(n).toLocaleString();
const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
};

function PageHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-2xl font-bold mafia-gold">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "text-slate-200" }: { label: string; value: string; color?: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}

function ActionButton({ onClick, disabled, children, color = "bg-amber-600 hover:bg-amber-500" }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
    >
      {children}
    </button>
  );
}

// ═══════════════ GAME OBJECTIVES ═══════════════
export function ObjectivesPage() {
  const store = useQuery(api.storeSystem.getStoreState);
  const claimObjective = useMutation(api.storeSystem.claimObjective);
  const claimMilestone = useMutation(api.storeSystem.claimMilestone);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const progress = (store?.objectiveProgress as Record<string, number>) ?? {};
  const claimed = (store?.objectivesClaimed as Record<string, number[]>) ?? {};
  const mClaimed = (store?.milestonesClaimed as Record<string, boolean>) ?? {};

  const doClaim = async (categoryId: string, idx: number) => {
    try {
      const res = await claimObjective({ categoryId, milestoneIndex: idx });
      setMsg({ ok: true, text: `Claimed ${fmt(res.reward)} from ${CATEGORY_OBJECTIVES.find(c => c.categoryId === categoryId)?.name}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
  };
  const doClaimMs = async (id: string) => {
    try {
      const res = await claimMilestone({ milestoneId: id });
      setMsg({ ok: true, text: `Claimed ${fmt(res.reward)}${res.points ? ` + ${nf(res.points)} pts` : ""}${res.coins ? ` + ${res.coins} 🪙` : ""}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
  };

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading objectives...</div>;

  const dailyObjectives: any[] = store.objectives ?? [];
  const dayLabel = store.objectivesDay || "today";
  const dayDate = new Date();
  const nextMidnight = new Date(dayDate);
  nextMidnight.setHours(24, 0, 0, 0);
  const resetIn = Math.max(0, nextMidnight.getTime() - dayDate.getTime());
  const resetClock = `${String(Math.floor(resetIn / 3600000)).padStart(2, "0")}:${String(Math.floor((resetIn % 3600000) / 60000)).padStart(2, "0")}:${String(Math.floor((resetIn % 60000) / 1000)).padStart(2, "0")}`;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader icon="🎯" title="Game Objectives Overview" sub="Complete criminal actions to unlock milestone rewards in every category." />
      <div className="mafia-card rounded-xl p-3 flex flex-wrap items-center gap-2 border-amber-500/20">
        <span className="text-lg">🌙</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-amber-300">Daily objectives — reset at midnight</div>
          <div className="text-[10px] text-muted-foreground">Progress started {dayLabel}. New milestones appear automatically once the required ones are finished.</div>
        </div>
        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/40 text-xs font-black text-cyan-400">⏳ {resetClock}</div>
      </div>
      {msg && (
        <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
          {msg.ok ? "✅ " : "⚠️ "}{msg.text}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Total Actions" value={nf(store.totalActions)} color="text-cyan-400" />
        <StatPill label="Total Earned" value={short(store.totalEarned)} color="text-green-400" />
        <StatPill label="Milestones Done" value={`${MILESTONE_OBJECTIVES.filter(m => mClaimed[m.id]).length}/${MILESTONE_OBJECTIVES.length}`} color="text-amber-400" />
        <StatPill label="Season XP" value={nf(store.seasonXp)} color="text-purple-400" />
      </div>

      <div className="space-y-4">
        {dailyObjectives.map((cat) => {
          const count = cat.progress ?? 0;
          return (
            <div key={cat.categoryId} className="mafia-card rounded-xl p-4 border-l-4" style={{ borderLeftColor: cat.color }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{cat.name}</div>
                  <div className="text-[10px] text-muted-foreground">{cat.tagline}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: cat.color }}>{nf(count)}</div>
                  <div className="text-[9px] text-muted-foreground">actions today</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {cat.milestones.map((m: any, idx: number) => {
                  const done = m.claimed;
                  const ready = !done && count >= m.count;
                  return (
                    <div key={m.count} className={`rounded-lg border p-2.5 ${done ? "border-green-500/40 bg-green-950/20" : ready ? "border-amber-500/50 bg-amber-950/20 animate-border-glow" : "border-slate-700/40 bg-slate-900/30"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{nf(m.count)} actions</span>
                        {done ? <span className="text-[10px] text-green-400 font-bold">✅</span> : ready ? <span className="text-[10px] text-amber-400 font-bold">READY</span> : <span className="text-[10px] text-slate-600">🔒</span>}
                      </div>
                      <div className="text-sm font-black text-green-400 mt-0.5">{fmt(m.reward)}</div>
                      {!done && (
                        <ActionButton onClick={() => doClaim(cat.categoryId, idx)} disabled={!ready} color={ready ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                          {ready ? "Claim" : `${count >= m.count ? "" : nf(m.count - count) + " left"}`}
                        </ActionButton>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-3">🏅 Milestone Objectives <span className="text-[10px] text-muted-foreground font-normal">— lifetime goals with escalating rewards</span></div>
        <div className="space-y-2">
          {MILESTONE_OBJECTIVES.map((m) => {
            const done = !!mClaimed[m.id];
            const value = m.kind === "actions" ? store.totalActions : store.totalEarned;
            const ready = !done && value >= m.target;
            const pct = Math.min(100, Math.round((value / m.target) * 100));
            return (
              <div key={m.id} className={`rounded-lg border p-3 ${done ? "border-green-500/40 bg-green-950/10" : "border-slate-700/40 bg-slate-900/30"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{m.name}</span>
                      {done && <span className="text-[9px] text-green-400 font-bold">COMPLETE</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                    <div className="flex items-center gap-1 text-[10px] mt-1">
                      <span className="text-green-400 font-bold">{fmt(m.reward)}</span>
                      {m.points > 0 && <span className="text-yellow-400 font-bold">· {nf(m.points)} 🏆</span>}
                      {m.coins > 0 && <span className="text-cyan-400 font-bold">· {m.coins} 🪙</span>}
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                      <div className={`h-full rounded-full ${done ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{nf(value)} / {nf(m.target)} ({pct}%)</div>
                  </div>
                  {!done && (
                    <ActionButton onClick={() => doClaimMs(m.id)} disabled={!ready} color={ready ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                      {ready ? "Claim" : "Locked"}
                    </ActionButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ SEASON XP ═══════════════
function SeasonXpPanel({ store, setMsg }: { store: any; setMsg: (m: { ok: boolean; text: string } | null) => void }) {
  const claimTier = useMutation(api.storeSystem.claimSeasonTier);
  const claimVip = useMutation(api.storeSystem.claimVipLevel);
  const buyVip = useMutation(api.storeSystem.purchasePointItem);
  const [busy, setBusy] = useState<string | null>(null);
  const [freePage, setFreePage] = useState(0);

  const doClaimTier = async (tier: number) => {
    setBusy(`t${tier}`);
    try {
      const res = await claimTier({ tier });
      setMsg({ ok: true, text: `Claimed Free Tier ${tier}: ${res.reward}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };
  const doClaimVip = async (level: number) => {
    setBusy(`v${level}`);
    try {
      const res = await claimVip({ level });
      setMsg({ ok: true, text: `Claimed VIP Level ${level}: ${res.reward}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };
  const doBuyVip = async () => {
    setBusy("vip");
    try {
      await buyVip({ itemId: "vip" });
      setMsg({ ok: true, text: "VIP Membership activated for 30 days!" });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };

  const freeProgress = store.freeTrackProgress;
  const nextFree = FREE_TRACK[freeProgress];
  // 500+ tiers render in pages — never materialize all rows at once.
  const FREE_PER_PAGE = 20;
  const freePages = Math.max(1, Math.ceil(FREE_TRACK.length / FREE_PER_PAGE));
  const clampedFreePage = Math.min(freePages - 1, Math.max(0, freePage));
  const pageFree = FREE_TRACK.slice(clampedFreePage * FREE_PER_PAGE, (clampedFreePage + 1) * FREE_PER_PAGE);
  const currentFreePage = Math.min(freePages - 1, Math.max(0, Math.floor(freeProgress / FREE_PER_PAGE)));
  const freePct = nextFree ? Math.min(100, Math.round((store.seasonXp / nextFree.xp) * 100)) : 100;
  const vipLevel = store.vipLevel;
  const vipNext = vipLevel >= VIP_LEVELS ? null : vipLevel + 1;
  const vipNeed = vipNext ? VIP_XP_PER_LEVEL(vipNext) : 0;
  const vipCum = vipNext ? vipNeedForLevel(vipNext) : 0;
  const vipPct = vipNext ? Math.min(100, Math.round(((store.seasonXp - vipCum + vipNeed) / vipNeed) * 100)) : 100;
  const endDate = new Date(store.seasonEndsAt).toLocaleDateString();

  return (
    <div className="space-y-4">
      <div className="mafia-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold">🎫 Season Progress — <span className="text-purple-400">({freePct.toFixed(2)}%)</span></div>
          <div className="text-[10px] text-muted-foreground">Ends {endDate}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <StatPill label="Membership" value={store.vipActive ? "👑 VIP" : "Free"} color={store.vipActive ? "text-amber-400" : "text-slate-300"} />
          <StatPill label="Free Tier" value={`${freeProgress} / ${FREE_TRACK.length}`} color="text-cyan-400" />
          <StatPill label="VIP Level" value={store.vipActive ? `${vipLevel} / ${VIP_LEVELS}` : "Locked"} color={store.vipActive ? "text-amber-400" : "text-slate-500"} />
          <StatPill label="Season XP" value={short(store.seasonXp)} color="text-purple-400" />
        </div>
        {nextFree ? (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Next Free Tier {nextFree.tier}: {nextFree.reward}</span>
              <span>{nf(store.seasonXp)} / {nf(nextFree.xp)} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all" style={{ width: `${freePct}%` }} />
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-green-400 font-bold mt-2">🎉 Free track fully claimed!</div>
        )}
      </div>

      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-3">🆓 Free Track — available to all players <span className="text-[10px] text-muted-foreground font-normal">({FREE_TRACK.length} tiers)</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {pageFree.map((t) => {
            const done = (store.seasonTiersClaimed ?? []).includes(t.tier);
            const ready = !done && store.seasonXp >= t.xp;
            return (
              <div key={t.tier} className={`rounded-lg border p-3 ${done ? "border-green-500/40 bg-green-950/10" : ready ? "border-amber-500/50 bg-amber-950/10" : "border-slate-700/40 bg-slate-900/30"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Tier {t.tier}</div>
                    <div className="text-[10px] text-muted-foreground">{nf(t.xp)} XP</div>
                  </div>
                  {done ? <span className="text-[10px] text-green-400 font-bold">✅ CLAIMED</span> : (
                    <ActionButton onClick={() => doClaimTier(t.tier)} disabled={!ready || busy === `t${t.tier}`} color={ready ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-slate-800 text-slate-500"}>
                      {ready ? "Claim" : `${nf(Math.max(0, t.xp - store.seasonXp))} XP`}
                    </ActionButton>
                  )}
                </div>
                <div className="text-[11px] text-amber-300 font-bold mt-1">🎁 {t.reward}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-3">
          <button
            onClick={() => setFreePage(clampedFreePage - 1)}
            disabled={clampedFreePage === 0}
            className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold disabled:opacity-30 hover:bg-white/10 transition">
            ◀ Prev
          </button>
          <span className="text-[10px] font-black text-muted-foreground">Tiers {clampedFreePage * FREE_PER_PAGE + 1}–{Math.min(FREE_TRACK.length, (clampedFreePage + 1) * FREE_PER_PAGE)} / {FREE_TRACK.length}</span>
          <button
            onClick={() => setFreePage(clampedFreePage + 1)}
            disabled={clampedFreePage >= freePages - 1}
            className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold disabled:opacity-30 hover:bg-white/10 transition">
            Next ▶
          </button>
        </div>
        <button
          onClick={() => setFreePage(currentFreePage)}
          className="mt-1 w-full px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/20 transition">
          📍 Jump to your current tier
        </button>
      </div>

      <div className="mafia-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold">👑 VIP Track <span className="text-[10px] text-muted-foreground font-normal">— requires VIP membership</span></div>
          {!store.vipActive && (
            <ActionButton onClick={doBuyVip} disabled={busy === "vip"} color="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
              {busy === "vip" ? "Buying..." : "Buy VIP · 2,500 pts"}
            </ActionButton>
          )}
        </div>
        {!store.vipActive ? (
          <div className="text-[11px] text-muted-foreground text-center py-4">VIP membership unlocks 100 reward levels with cash, bullets, packs and perk drops.</div>
        ) : (
          <div className="space-y-2">
            {vipNext && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Next: Level {vipNext} · {vipRewardForLevel(vipNext).label} {vipRewardForLevel(vipNext).type === "cash" ? fmt(vipRewardForLevel(vipNext).cash) : `${nf(vipRewardForLevel(vipNext).amount)} ${vipRewardForLevel(vipNext).label}`}</span>
                  <span>{nf(vipNeed)} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${vipPct}%` }} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ActionButton
                    onClick={() => doClaimVip(vipNext)}
                    disabled={store.seasonXp < vipCum || busy === `v${vipNext}`}
                    color={store.seasonXp >= vipCum ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}
                  >
                    {store.seasonXp >= vipCum ? `Claim Level ${vipNext}` : `${nf(Math.max(0, vipCum - store.seasonXp))} XP to go`}
                  </ActionButton>
                </div>
              </div>
            )}
            <div className="text-[9px] text-slate-500">VIP expires {new Date(store.vipUntil).toLocaleDateString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function vipNeedForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) total += VIP_XP_PER_LEVEL(i);
  return total;
}

// ═══════════════ SPECIAL POINT STORE ═══════════════
export function PointStorePage() {
  const store = useQuery(api.storeSystem.getStoreState);
  const buy = useMutation(api.storeSystem.purchasePointItem);
  const send = useMutation(api.storeSystem.sendPoints);
  const [tab, setTab] = useState<"store" | "season">("store");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [sendUser, setSendUser] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const doBuy = async (itemId: string, name: string, cost: number) => {
    if ((store?.points ?? 0) < cost) { setMsg({ ok: false, text: `Need ${nf(cost)} points for ${name}` }); return; }
    setBusy(itemId);
    try {
      const res = await buy({ itemId });
      setMsg({ ok: true, text: `Purchased ${res.item}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };

  const doSend = async () => {
    const amount = parseInt(sendAmt || "0", 10);
    if (!sendUser.trim() || !amount || amount < 1) { setSendMsg({ ok: false, text: "Enter a username and amount" }); return; }
    try {
      const res = await send({ username: sendUser.trim(), amount });
      setSendMsg({ ok: true, text: `Sent ${res.amount} points (fee ${res.fee}) to ${sendUser.trim()}!` });
      setSendAmt("");
    } catch (e: any) {
      setSendMsg({ ok: false, text: e.message || "Failed" });
    }
  };

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading store...</div>;
  const perks = (store.perks ?? {}) as Record<string, number>;
  const upgrades = (store.accountUpgrades ?? {}) as Record<string, boolean>;
  const bodyguards = store.robotBodyguards ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader icon="💎" title="Special Point Store" sub="Spend your hard-earned points on permanent power." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Points" value={nf(store.points)} color="text-yellow-400" />
        <StatPill label="Coins" value={nf(store.coins)} color="text-cyan-400" />
        <StatPill label="Bullets" value={nf(store.bullets)} color="text-orange-400" />
        <StatPill label="Defense" value={nf(store.defense)} color="text-green-400" />
      </div>

      <div className="flex items-center gap-2">
        {(["store", "season"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${tab === t ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-border-glow" : "border-slate-700/40 text-slate-500 hover:text-slate-300"}`}>
            {t === "store" ? "🛍️ Store" : "🎫 Season XP"}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
          {msg.ok ? "✅ " : "⚠️ "}{msg.text}
        </div>
      )}

      {tab === "season" ? (
        <SeasonXpPanel store={store} setMsg={setMsg} />
      ) : (
        <>
          {/* ROBOT BODYGUARDS */}
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-1">🤖 Robot Bodyguards <span className="text-[10px] text-muted-foreground font-normal">({bodyguards.length}/4 owned)</span></div>
            <div className="text-[10px] text-muted-foreground mb-3">Each bodyguard permanently adds defense to your profile.</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ROBOT_BODYGUARDS.map((bg) => {
                const owned = bodyguards.some((b: any) => b.id === bg.id);
                return (
                  <div key={bg.id} className={`rounded-lg border p-3 ${owned ? "border-green-500/40 bg-green-950/10" : "border-slate-700/40 bg-slate-900/30"}`}>
                    <div className="text-2xl">{bg.icon}</div>
                    <div className="text-xs font-bold mt-1">{bg.name}</div>
                    <div className="text-[10px] text-green-400 font-bold">+{bg.defenseBonus} DEF</div>
                    <div className="text-[9px] text-muted-foreground mt-1">{bg.desc}</div>
                    {owned ? (
                      <div className="text-[10px] text-green-400 font-bold mt-2">✅ OWNED</div>
                    ) : (
                      <ActionButton onClick={() => doBuy(bg.id, bg.name, bg.cost)} disabled={busy === bg.id} color={store.points >= bg.cost ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                        {nf(bg.cost)} 🏆
                      </ActionButton>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACCOUNT UPGRADES */}
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">⚙️ Account Upgrades</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ACCOUNT_UPGRADES.map((up) => {
                const owned = !!upgrades[up.upgradeId!];
                return (
                  <div key={up.id} className={`rounded-lg border p-3 flex items-center gap-3 ${owned ? "border-green-500/40 bg-green-950/10" : "border-slate-700/40 bg-slate-900/30"}`}>
                    <span className="text-xl">{up.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{up.name}</div>
                      <div className="text-[9px] text-muted-foreground">{up.desc}</div>
                    </div>
                    {owned ? <span className="text-[10px] text-green-400 font-bold">✅</span> : (
                      <ActionButton onClick={() => doBuy(up.id, up.name, up.cost)} disabled={busy === up.id} color={store.points >= up.cost ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                        {nf(up.cost)} 🏆
                      </ActionButton>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PERKS */}
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">🎁 Perks & Bundles</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {PERK_BUNDLES.map((pk) => (
                <div key={pk.id} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3">
                  <div className="text-xl">{pk.icon}</div>
                  <div className="text-xs font-bold mt-1">{pk.name}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{pk.desc}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <ActionButton onClick={() => doBuy(pk.id, pk.name, pk.cost)} disabled={busy === pk.id} color={store.points >= pk.cost ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                      {nf(pk.cost)} 🏆
                    </ActionButton>
                    {pk.perkId && <span className="text-[9px] text-cyan-400 font-bold">have {perks[pk.perkId!] ?? 0}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {POINT_STORE_EXTRA.map((ex) => (
                <div key={ex.id} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 flex items-center gap-3">
                  <span className="text-xl">{ex.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{ex.name}</div>
                    <div className="text-[9px] text-muted-foreground">{ex.desc}</div>
                  </div>
                  {ex.id === "vip" ? (
                    <ActionButton onClick={() => doBuy(ex.id, ex.name, ex.cost)} disabled={busy === ex.id || store.vipActive} color={store.vipActive ? "bg-green-700 text-white" : store.points >= ex.cost ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                      {store.vipActive ? "Active" : `${nf(ex.cost)} 🏆`}
                    </ActionButton>
                  ) : (
                    <ActionButton onClick={() => doBuy(ex.id, ex.name, ex.cost)} disabled={busy === ex.id} color={store.points >= ex.cost ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}>
                      {nf(ex.cost)} 🏆
                    </ActionButton>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* MY BODYGUARDS */}
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">🛡️ Bodyguards</div>
            {bodyguards.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-4">No bodyguards purchased yet — buy Robot Bodyguards above.</div>
            ) : (
              <div className="space-y-2">
                {bodyguards.map((b: any, i: number) => (
                  <div key={b.id} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{b.name}</div>
                      <div className="text-[9px] text-muted-foreground">{store.nickname}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] text-slate-500">BG Armour</div>
                      <div className="text-xs font-black text-green-400">{b.defense}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] text-slate-500">BG Rank</div>
                      <div className="text-xs font-black text-amber-400">#{i + 1}</div>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <StatPill label="Total BG Armour" value={`+${bodyguards.reduce((s: number, b: any) => s + (b.defense ?? 0), 0)}`} color="text-green-400" />
                  <StatPill label="Max Armour" value={`+${ROBOT_BODYGUARDS.reduce((s, b) => s + (b.defenseBonus ?? 0), 0)}`} color="text-amber-400" />
                </div>
              </div>
            )}
          </div>

          {/* SEND POINTS */}
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-1">📤 Send Points</div>
            <div className="text-[10px] text-muted-foreground mb-3">Transfer points to another player. Fee: 1 point.</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={sendUser} onChange={(e) => setSendUser(e.target.value)} placeholder="Enter Username..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <input value={sendAmt} onChange={(e) => setSendAmt(e.target.value)} type="number" placeholder="Amount..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <ActionButton onClick={doSend} color="bg-gradient-to-r from-amber-500 to-yellow-500 text-black" disabled={!sendUser.trim() || !parseInt(sendAmt || "0", 10)}>
                Send Points
              </ActionButton>
            </div>
            {sendAmt && parseInt(sendAmt || "0", 10) > 0 && (
              <div className="text-[10px] text-slate-500 mt-2">Fee: 1 point (Total: {parseInt(sendAmt, 10) + 1} points)</div>
            )}
            {sendMsg && <div className={`text-xs font-bold mt-2 ${sendMsg.ok ? "text-green-400" : "text-red-400"}`}>{sendMsg.ok ? "✅ " : "⚠️ "}{sendMsg.text}</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════ COIN STORE ═══════════════
export function CoinStorePage() {
  const store = useQuery(api.storeSystem.getStoreState);
  const buy = useMutation(api.storeSystem.purchaseCoinItem);
  const starter = useMutation(api.storeSystem.claimStarterPack);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [prize, setPrize] = useState<any>(null);

  const doBuy = async (itemId: string, name: string, cost: number) => {
    if ((store?.coins ?? 0) < cost) { setMsg({ ok: false, text: `Need ${cost} 🪙 for ${name}` }); return; }
    setBusy(itemId);
    try {
      const res = await buy({ itemId });
      if (res.scratchPrize) setPrize(res.scratchPrize);
      if (res.carName) setMsg({ ok: true, text: `🚗 ${res.carName} delivered to your Garage!` });
      else setMsg({ ok: true, text: `Purchased ${res.item}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };

  const doStarter = async () => {
    try {
      const res = await starter();
      setMsg({ ok: true, text: `Starter pack claimed: ${res.coins} 🪙 + ${res.bullets} 💀 bullets!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
  };

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading store...</div>;
  const upgrades = (store.accountUpgrades ?? {}) as Record<string, boolean>;

  const groups: { title: string; ids: string[] }[] = [
    { title: "🎁 Packs & Perks", ids: ["legendaryPack", "epicPack", "randomPerks100", "scratchCard", "targetAssassin", "missionSkip", "dailyRewardTimer", "missionRetrieval"] },
    { title: "⚙️ Account Upgrades", ids: ["userRaidCoin", "meltLimitCoin", "crewOCXp", "ocTimer6h", "realEstateUpgrade", "sportsBettingCoin", "swissBankLimit", "supplyRunLimit"] },
    { title: "🚗 Cars & Bullets", ids: ["exoticCar", "customCar20", "bullets250k"] },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader icon="🪙" title="Coin Store" sub="Purchase premium items with your hard-earned coins." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Coins" value={nf(store.coins)} color="text-cyan-400" />
        <StatPill label="Points" value={nf(store.points)} color="text-yellow-400" />
        <StatPill label="Bullets" value={nf(store.bullets)} color="text-orange-400" />
        <StatPill label="Cash" value={short(store.money)} color="text-green-400" />
      </div>

      {!store.starterClaimed && (
        <div className="mafia-card rounded-xl p-4 border-cyan-500/30 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">🎁 Starter Pack</div>
            <div className="text-[10px] text-muted-foreground">2 🪙 coins + 100 💀 bullets — free, one time only</div>
          </div>
          <ActionButton onClick={doStarter} color="bg-gradient-to-r from-cyan-500 to-blue-500">Claim Free</ActionButton>
        </div>
      )}

      {msg && (
        <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
          {msg.ok ? "✅ " : "⚠️ "}{msg.text}
        </div>
      )}

      {prize && (
        <div className="mafia-card rounded-xl p-4 text-center border-amber-500/40 animate-border-glow">
          <div className="text-4xl mb-1">{prize.icon}</div>
          <div className="text-sm font-black mafia-gold">🎟️ SCRATCH CARD RESULT</div>
          <div className={`text-xl font-black mt-1 ${prize.type === "none" ? "text-slate-500" : "text-green-400"}`}>{prize.label}</div>
          <button onClick={() => setPrize(null)} className="mt-2 text-[10px] text-slate-400 hover:text-slate-200">Close</button>
        </div>
      )}

      {groups.map((g) => (
        <div key={g.title} className="mafia-card rounded-xl p-4">
          <div className="text-sm font-bold mb-3">{g.title}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {g.ids.map((id) => {
              const item = COIN_STORE_ITEMS.find((i) => i.id === id);
              if (!item) return null;
              const owned = item.kind === "upgrade" && upgrades[item.upgradeId!];
              return (
                <div key={item.id} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{item.name}</div>
                    <div className="text-[9px] text-muted-foreground">{item.desc}</div>
                  </div>
                  {owned ? <span className="text-[10px] text-green-400 font-bold">✅</span> : (
                    <ActionButton onClick={() => doBuy(item.id, item.name, item.cost)} disabled={busy === item.id} color={store.coins >= item.cost ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-slate-800 text-slate-500"}>
                      {item.cost} 🪙
                    </ActionButton>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════ HQ OBJECTIVES PANEL (with claim timers) ═══════════════
function useMidnightCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const mid = new Date();
  mid.setHours(24, 0, 0, 0);
  const ms = Math.max(0, mid.getTime() - now);
  const hh = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return { clock: `${hh}:${mm}:${ss}`, ready: ms <= 0 };
}

// Compact panel shown on the Headquarters page. For every claimed (used)
// objective milestone it shows a live countdown to the next midnight reset,
// when that objective can be claimed again.
export function ObjectivesPanel() {
  const store = useQuery(api.storeSystem.getStoreState);
  const { clock } = useMidnightCountdown();
  if (!store) return (
    <div className="mafia-card rounded-xl p-4 animate-pulse">
      <div className="text-sm font-bold text-amber-300">🎯 Daily Objectives</div>
      <div className="text-[11px] text-muted-foreground mt-1">Loading...</div>
    </div>
  );
  const cats: any[] = store.objectives ?? [];
  const claimedCount = cats.reduce((s, c) => s + (c.milestones || []).filter((m: any) => m.claimed).length, 0);
  const totalCount = cats.reduce((s, c) => s + (c.milestones || []).length, 0);

  return (
    <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-bold text-amber-300">🎯 Daily Objectives</div>
        <div className="px-2 py-0.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-[10px] font-black text-cyan-400">🔄 {clock} to reset</div>
      </div>
      <div className="text-[10px] text-muted-foreground mb-3">Complete actions to claim cash. Claimed objectives refresh at midnight ({claimedCount}/{totalCount} claimed today).</div>
      {cats.length === 0 && <div className="text-[11px] text-muted-foreground">No objectives yet — go commit crimes!</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {cats.map((cat) => {
          const count = cat.progress ?? 0;
          const milestones: any[] = cat.milestones ?? [];
          const used = milestones.filter((m: any) => m.claimed);
          const ready = milestones.filter((m: any) => !m.claimed && count >= m.count).length;
          return (
            <div key={cat.categoryId} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-bold flex-1">{cat.name}</span>
                <span className="text-[11px] font-black" style={{ color: cat.color }}>{nf(count)}</span>
                {ready > 0 && <span className="text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">{ready} READY</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {used.length === 0 && <span className="text-[9px] text-muted-foreground">Nothing used yet</span>}
                {used.map((m: any) => (
                  <span key={m.count} className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-[9px] text-green-400 font-bold">
                    {nf(m.count)} · {short(m.reward)} · <span className="text-cyan-300">🔄 {clock}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

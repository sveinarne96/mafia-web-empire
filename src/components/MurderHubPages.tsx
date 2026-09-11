import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Scroll, Store, Trophy } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();
const timeAgo = (t: number) => {
  const d = Math.max(0, Date.now() - t);
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
};

function Banner({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`rounded-xl border p-3 text-center text-xs font-bold ${ok ? "border-green-500/30 bg-green-950/30 text-green-400" : "border-red-500/30 bg-red-950/30 text-red-400"}`}>
      {text}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HITLIST — live bounty board + place your own contracts
// ═══════════════════════════════════════════════════════════
export function HitlistPage() {
  const player = useQuery(api.game.getPlayer);
  const bounties = useQuery(api.crimeExtras.getActiveBounties);
  const targets = useQuery(api.hitSystem.getTargets);
  const placeBounty = useMutation(api.hitSystem.placeBounty);

  const [targetId, setTargetId] = useState<string | null>(null);
  const [amount, setAmount] = useState("50000");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !bounties || !targets) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Pulling the contracts…</div>;

  const filtered = targets
    .filter((t: any) => (t.nickname || "").toLowerCase().includes(search.toLowerCase()))
    .slice(0, 30);
  const selected = targets.find((t: any) => t._id === targetId);
  const amt = Math.max(0, Math.floor(Number(amount) || 0));
  const minOk = amt >= 10000;
  const affordable = amt <= (player.money ?? 0);

  const place = async () => {
    if (!targetId || busy) return;
    setBusy(true); setMsg(null);
    try {
      await placeBounty({ targetId: targetId as any, amount: amt });
      setMsg({ ok: true, text: `📜 $${nf(amt)} bounty posted on ${selected?.nickname ?? "target"} — the streets are listening.` });
      setTargetId(null);
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message ?? "Could not post the bounty" });
    }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Scroll className="size-7 text-red-400" />
        <h2 className="text-2xl font-black text-red-300">Hitlist</h2>
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">BOUNTY BOARD</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Active bounties */}
        <div className="mafia-card space-y-3 rounded-xl p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">🎯 Active Contracts ({bounties.length})</div>
            <div className="text-[10px] text-slate-500">Whoever finishes the mark claims the purse</div>
          </div>
          {bounties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700/50 p-6 text-center text-xs text-slate-500">
              No open contracts. Post one and let the hunters come.
            </div>
          ) : (
            <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
              {bounties.map((b: any) => (
                <div key={b._id} className="flex items-center justify-between rounded-lg border border-red-500/15 bg-red-950/10 p-2.5">
                  <div>
                    <div className="text-xs font-black text-white">
                      {b.targetName} <span className="text-[10px] font-bold text-slate-500">Lv.{b.targetLevel}{b.targetWanted > 0 ? " · 🔴 WANTED" : ""}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Posted by {b.placedBy} · {timeAgo(b.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-green-400">${nf(b.reward)}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-600">Reward</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post a bounty */}
        <div className="mafia-card space-y-3 rounded-xl p-4 lg:col-span-2">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🖊️ Post a Contract</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search targets…" className="w-full rounded-lg border border-red-500/20 bg-black/30 px-3 py-2 text-xs" />
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {filtered.map((t: any) => (
              <div key={t._id} onClick={() => setTargetId(t._id)}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition ${targetId === t._id ? "border border-red-500/40 bg-red-950/30" : "border border-transparent hover:bg-white/5"}`}>
                <span className="font-bold">{t.nickname} <span className="text-slate-500">Lv.{t.level}{t.isOnline ? " 🟢" : ""}</span></span>
                <span className="text-[10px] text-slate-500">DEF {t.defense}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 text-[10px] font-bold text-slate-500">BOUNTY AMOUNT (min $10,000)</div>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric"
              className="w-full rounded-lg border border-red-500/20 bg-black/30 px-3 py-2 text-xs font-black text-green-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded-lg bg-slate-900/60 p-2 text-center">
              <div className="text-slate-500">Your cash</div>
              <div className="font-black text-green-400">${nf(player.money ?? 0)}</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2 text-center">
              <div className="text-slate-500">Status</div>
              <div className={`font-black ${!minOk ? "text-red-400" : affordable ? "text-green-400" : "text-red-400"}`}>
                {!minOk ? "Below min" : affordable ? "Ready" : "Too rich"}
              </div>
            </div>
          </div>
          <button onClick={place} disabled={!targetId || !minOk || !affordable || busy}
            className="w-full rounded-xl bg-gradient-to-r from-red-700 to-red-900 py-2.5 text-xs font-black text-white transition hover:from-red-600 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? "Posting…" : selected ? `Post $${nf(amt)} on ${selected.nickname}` : "Select a target first"}
          </button>
        </div>
      </div>

      {msg && <Banner ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// UNDERGROUND MARKET — rotating contraband shop
// ═══════════════════════════════════════════════════════════
export function UndergroundMarketPage() {
  const player = useQuery(api.game.getPlayer);
  const items = useQuery(api.underground.getBlackMarketItems);
  const buy = useMutation(api.underground.buyBlackMarketItem);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !items) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Sliding open the back door…</div>;

  const buyItem = async (item: any) => {
    setBusyId(item._id); setMsg(null);
    try {
      await buy({ itemId: item._id });
      setMsg({ ok: true, text: `🖤 Acquired ${item.name} for $${nf(item.price)}. Keep it quiet.` });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message ?? "Deal fell through" });
    }
    setBusyId(null);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Store className="size-7 text-emerald-400" />
        <h2 className="text-2xl font-black text-emerald-300">Underground Market</h2>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400">CONTRABAND</span>
      </div>

      {msg && <Banner ok={msg.ok} text={msg.text} />}

      <div className="mafia-card rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">Today's Stock</div>
          <div className="text-[10px] text-slate-500">Cash on hand: <span className="font-black text-green-400">${nf(player.money ?? 0)}</span></div>
        </div>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700/50 p-6 text-center text-xs text-slate-500">
            Shelves are bare. Check back after the next shipment.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item: any) => (
              <div key={item._id} className="rounded-xl border border-emerald-500/15 bg-emerald-950/10 p-3">
                <div className="mb-1 flex items-start justify-between">
                  <div className="text-sm font-black text-white">{item.icon ?? "📦"} {item.name}</div>
                  {item.rarity && <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-400">{item.rarity}</span>}
                </div>
                <div className="mb-2 text-[10px] text-slate-500">{item.description ?? "No questions asked."}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-green-400">${nf(item.price)}</span>
                  <button onClick={() => buyItem(item)} disabled={busyId === item._id || (player.money ?? 0) < (item.price ?? 0)}
                    className="rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-900 px-3 py-1.5 text-[10px] font-black text-white transition hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-40">
                    {busyId === item._id ? "…" : "Buy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CRIME ACHIEVEMENTS — personal record board
// ═══════════════════════════════════════════════════════════
export function CrimeAchievementsPage() {
  const player = useQuery(api.game.getPlayer);
  const stats = useQuery(api.crimeExtras.getCrimeAchievements);
  const badges = useQuery(api.retentionSystem.getBadges);

  if (!player || !stats) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Tallying the record…</div>;

  const successRate = stats.totalCrimes > 0 ? Math.floor((stats.successful / stats.totalCrimes) * 100) : 0;
  const typeEntries = Object.entries(stats.byType ?? {}) as [string, { total: number; won: number }][];
  typeEntries.sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Trophy className="size-7 text-amber-400" />
        <h2 className="text-2xl font-black text-amber-300">Crime Achievements</h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400">RECORD BOARD</span>
      </div>

      {/* Tier progress */}
      <div className="mafia-card rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">Career Tier</div>
          {stats.tier && <div className="text-sm font-black text-amber-300">{stats.tier.icon} {stats.tier.name}</div>}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {stats.tiers.map((t: any) => {
            const reached = stats.totalCrimes >= t.need;
            return (
              <div key={t.id} className={`rounded-xl border p-2 text-center ${reached ? "border-amber-500/40 bg-amber-950/20" : "border-slate-700/40 bg-slate-900/40 opacity-50"}`}>
                <div className="text-lg">{t.icon}</div>
                <div className="text-[9px] font-black uppercase text-slate-400">{t.name}</div>
                <div className="text-[9px] text-slate-600">{nf(t.need)} crimes</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-slate-500">
            <span>Next tier progress</span>
            <span>{nf(stats.totalCrimes)} crimes committed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all" style={{ width: `${Math.min(100, (stats.totalCrimes / 5000) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🔪 Total Crimes</div><div className="text-lg font-black text-amber-300">{nf(stats.totalCrimes)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">✅ Success Rate</div><div className="text-lg font-black text-green-400">{successRate}%</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💰 Total Stolen</div><div className="text-lg font-black text-purple-400">${nf(stats.stolenTotal)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🔥 Best Streak</div><div className="text-lg font-black text-red-400">{stats.streakBest}</div></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Per-type breakdown */}
        <div className="mafia-card rounded-xl p-4">
          <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">📋 By Crime Type</div>
          {typeEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700/50 p-6 text-center text-xs text-slate-500">Go commit some crimes first.</div>
          ) : (
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {typeEntries.map(([type, s]) => {
                const rate = s.total > 0 ? Math.floor((s.won / s.total) * 100) : 0;
                return (
                  <div key={type} className="rounded-lg bg-slate-900/50 p-2.5">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-bold capitalize text-slate-200">{type}</span>
                      <span className="text-[10px] text-slate-500">{s.won}/{s.total} won · {rate}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${rate >= 60 ? "bg-green-500" : rate >= 35 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mafia-card rounded-xl p-4">
          <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">🏅 Badges Earned</div>
          {badges && (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 md:grid-cols-4">
              {badges.badges.map((b: any) => (
                <div key={b.id} className={`rounded-xl border p-2 text-center ${b.earned ? "border-amber-500/40 bg-amber-950/20" : "border-slate-700/40 bg-slate-900/40 opacity-45"}`}>
                  <div className="text-lg">{b.icon}</div>
                  <div className="text-[9px] font-black text-slate-300">{b.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

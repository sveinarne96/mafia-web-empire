import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DISTRICTS } from "@/data/missionsCatalog";
import { DISTRICT_CASH } from "@/data/empire";

const nf = (v: number) => Math.floor(v).toLocaleString();
const fmt = (v: number) => "$" + Math.floor(v).toLocaleString();

// ═══════════════════════════════════════════════════════════════
// YOUR EMPIRE — rebuilt on top of the missions board.
// Conquest = 3 different mission types completed in a district.
// ═══════════════════════════════════════════════════════════════

export function EmpirePanelNew() {
  const board = useQuery(api.missionsBoard.getBoard);
  const sell = useMutation(api.missionsBoard.sellEmpire);
  const collect = useMutation(api.empireSystem.collectEmpireIncome);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [payout, setPayout] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    collect().then((r) => {
      if (!alive || !r.collected || !r.periods) return;
      setPayout(`Collected ${r.periods}d income — ${fmt(r.cash ?? 0)} + ${nf(r.points ?? 0)} pts + ${nf(r.bullets ?? 0)} 💀`);
    }).catch(() => {});
    return () => { alive = false; };
  }, [collect]);

  if (!board) return <div className="mafia-card animate-pulse rounded-xl p-6 text-center text-muted-foreground">Loading empire…</div>;

  const e = board.empire;
  const nextIn = e.nextPayoutIn ?? 0;
  const nextClock = nextIn > 0
    ? `${String(Math.floor(nextIn / 3600000)).padStart(2, "0")}h ${String(Math.floor((nextIn % 3600000) / 60000)).padStart(2, "0")}m`
    : "Ready";

  const doSell = async () => {
    try {
      const r = await sell({});
      setMsg({ ok: true, text: `🏆 Empire SOLD for ${nf(r.points)} points! The city forgets you — fresh districts await.` });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message || "Sale failed" });
    }
    setConfirming(false);
  };

  return (
    <div className="mafia-card space-y-4 rounded-xl border border-green-500/20 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-bold">🏙️ Your Empire</div>
        <span className="text-[10px] text-muted-foreground">
          daily income from conquered districts · next payout <span className={nextIn > 0 ? "text-cyan-400" : "text-green-400 font-bold"}>{nextClock}</span>
        </span>
        {e.sold && <span className="rounded-full border border-slate-600/40 bg-slate-800/50 px-2 py-0.5 text-[9px] font-bold text-slate-400">EMPIRE SOLD — fresh start</span>}
      </div>

      {payout && <div className="rounded-xl border border-green-500/40 bg-green-950/20 p-2.5 text-xs font-bold text-green-400">💰 {payout}</div>}
      {msg && <div className={`rounded-xl p-2.5 text-xs font-bold ${msg.ok ? "border border-green-500/30 bg-green-950/20 text-green-400" : "border border-rose-500/30 bg-rose-950/20 text-rose-400"}`}>{msg.text}</div>}

      {/* Income streams */}
      <div className="grid grid-cols-3 gap-2 text-center md:grid-cols-7">
        {[
          ["Cash", fmt(e.cashPerDay) + "/day", "text-green-400", "border-green-500/30 bg-green-950/10"],
          ["Points", nf(e.pointsPerDay) + "/day", "text-yellow-400", "border-slate-700/40 bg-slate-900/30"],
          ["Bullets", nf(e.bulletsPerDay) + "/day", "text-orange-400", "border-slate-700/40 bg-slate-900/30"],
          ["Auto Ranks", "0/day", "text-cyan-400", "border-slate-700/40 bg-slate-900/30"],
          ["Common ⚙️", (e.districtsCompleted * 1) + "/day", "text-slate-300", "border-slate-700/40 bg-slate-900/30"],
          ["Rare ⚙️", Math.floor(e.districtsCompleted / 2) + "/day", "text-blue-400", "border-slate-700/40 bg-slate-900/30"],
          ["Epic ⚙️", Math.floor(e.districtsCompleted / 4) + "/day", "text-purple-400", "border-slate-700/40 bg-slate-900/30"],
        ].map(([label, val, color, bg]) => (
          <div key={label as string} className={`rounded-lg border p-2 ${bg}`}>
            <div className="text-[8px] text-muted-foreground">{label}</div>
            <div className={`text-xs font-black ${color}`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Headline stats + sell */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-3">
          <div className="text-[9px] text-muted-foreground">Current Empire Value</div>
          <div className="text-base font-black text-amber-400">{nf(e.empireValue)} Points</div>
        </div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3">
          <div className="text-[9px] text-muted-foreground">Districts Conquered</div>
          <div className="text-base font-black text-green-400">{e.districtsCompleted} / {DISTRICTS.length}</div>
        </div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3">
          <div className="text-[9px] text-muted-foreground">Tasks Completed</div>
          <div className="text-base font-black text-cyan-400">{nf(e.totalTasks)}</div>
        </div>
        <div className={`rounded-lg border p-3 text-center ${e.districtsCompleted >= 10 ? "border-amber-500/50 bg-gradient-to-br from-amber-950/40 to-yellow-950/20" : "border-slate-700/40 bg-slate-900/30"}`}>
          {e.sold ? (
            <>
              <div className="text-[9px] text-slate-500">Status</div>
              <div className="text-xs font-black text-slate-400">Sold</div>
            </>
          ) : confirming ? (
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-rose-400">Sell for {nf(e.empireValue)} pts? Income stops.</div>
              <div className="flex justify-center gap-1">
                <button onClick={doSell} className="rounded bg-rose-600 px-2 py-1 text-[9px] font-black text-white hover:bg-rose-500">SELL</button>
                <button onClick={() => setConfirming(false)} className="rounded bg-slate-700 px-2 py-1 text-[9px] font-black text-slate-200">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} disabled={e.districtsCompleted < 10}
              className="h-full w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-1.5 text-[10px] font-black text-black transition-all hover:brightness-110 disabled:opacity-30">
              🏆 SELL EMPIRE{e.districtsCompleted < 10 ? ` (${e.districtsCompleted}/10)` : ""}
            </button>
          )}
        </div>
      </div>

      {/* Per-district conquest progress */}
      <div>
        <div className="mb-2 text-[10px] font-bold text-muted-foreground">Districts — finish 3 different mission types to conquer</div>
        <div className="grid gap-2 md:grid-cols-2">
          {DISTRICTS.map((d, i) => {
            const done = e.conquestPerDistrict?.[i] ?? 0;
            const conquered = done >= 3;
            return (
              <div key={d.name} className={`rounded-xl border p-3 ${conquered ? "border-green-500/40 bg-green-950/20" : "border-slate-700/40 bg-slate-900/30"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{conquered ? "🏆" : "🏙️"} {d.name}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {conquered ? "Conquered — pays daily income" : `${done}/3 conquest tasks · unlocks Lv.${d.lockLevel}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-muted-foreground">Daily</div>
                    <div className="text-xs font-black text-green-400">{fmt(DISTRICT_CASH[i] ?? 15000)}</div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500" style={{ width: `${(done / 3) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MISSION GUIDE — rewritten for the new system
// ═══════════════════════════════════════════════════════════════

export function MissionGuideNew() {
  return (
    <div className="mafia-card rounded-xl border border-amber-500/20 p-5">
      <div className="mb-2 text-sm font-bold">📜 Mission Guide</div>
      <div className="grid gap-3 text-[11px] leading-5 text-muted-foreground md:grid-cols-4">
        <div className="space-y-1">
          <div className="font-bold text-white">🗺️ Every mission on the map</div>
          <p>Each district shows <span className="text-cyan-400 font-bold">all 16 mission types</span> as its own pin. Run any mission 3 times to complete it.</p>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white">🏆 Conquer districts</div>
          <p>Complete <span className="text-amber-400 font-bold">3 different mission types</span> in a district to conquer it — conquered districts pay <span className="text-green-400 font-bold">daily empire income</span>.</p>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white">💰 Sell your empire</div>
          <p>With <span className="text-amber-400 font-bold">10+ districts</span> conquered, sell the whole empire for a large points reward. Selling stops daily income and clears all progress.</p>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white">⚠️ Mission Retrieval</div>
          <p>Your mission progress is <span className="text-red-400 font-bold">not protected</span> in the event of death.</p>
        </div>
      </div>
    </div>
  );
}

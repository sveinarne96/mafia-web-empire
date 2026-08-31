import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EMPIRE_DISTRICTS } from "@/data/empire";

const nf = (n: number) => Math.floor(n).toLocaleString();
const fmt = (n: number) => "$" + Math.floor(n).toLocaleString();

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return <div className={`rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 bg-green-950/20 border border-green-500/30" : "text-red-400 bg-red-950/20 border border-red-500/30"}`}>{msg.ok ? "✅ " : "⚠️ "}{msg.text}</div>;
}

// ═══════════ YOUR EMPIRE (missions income) ═══════════
export function EmpirePanel() {
  const empire = useQuery(api.empireSystem.getEmpire);
  const doTask = useMutation(api.empireSystem.completeDistrictTask);
  const collect = useMutation(api.empireSystem.collectEmpireIncome);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [payout, setPayout] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    collect().then((r) => {
      if (!alive || !r.collected) return;
      if (r.periods > 0) setPayout(`🏙️ Collected ${r.periods}d of empire income — ` + (r.cash ? "$" + Math.floor(r.cash).toLocaleString() : "") + ` +${Math.floor(r.points ?? 0)} pts +${Math.floor(r.bullets ?? 0)} 💀`);
    }).catch(() => {});
    return () => { alive = false; };
  }, [collect]);

  if (!empire) return <div className="animate-pulse py-6 text-center text-muted-foreground">Loading your empire...</div>;

  const nextIn = empire.nextPayoutIn ?? 0;
  const nextClock = nextIn > 0 ? `${String(Math.floor(nextIn / 3600000)).padStart(2, "0")}h ${String(Math.floor((nextIn % 3600000) / 60000)).padStart(2, "0")}m` : "Ready";

  const run = async (d: string) => {
    setBusy(d); setMsg(null);
    try { const r = await doTask({ district: d }); setMsg({ ok: true, text: r.conquered ? `🏆 District CONQUERED — ${d} now pays daily income!` : `✔ Task ${r.task}/3 done in ${d} · +${fmt(r.reward)}` }); }
    catch (e: any) { setMsg({ ok: false, text: e.message || "Failed" }); }
    setBusy(null);
  };

  return (
    <div className="mafia-card rounded-xl border border-green-500/20 p-5 space-y-4">
      <div className="text-sm font-bold">🏙️ Your Empire <span className="text-[10px] text-muted-foreground font-normal">— daily income from completed districts · next payout in <span className={nextIn > 0 ? "text-cyan-400" : "text-green-400"}>{nextClock}</span></span></div>
      {payout && <div className="rounded-xl border border-green-500/40 bg-green-950/20 p-3 text-xs font-bold text-green-400">{payout}</div>}
      {msg && <Msg msg={msg} />}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 text-center">
        <div className="rounded-lg border border-green-500/30 bg-green-950/10 p-2"><div className="text-[8px] text-muted-foreground">Cash</div><div className="text-xs font-black text-green-400">{fmt(empire.cashPerDay)}<span className="text-[8px]">/day</span></div></div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[8px] text-muted-foreground">Points</div><div className="text-xs font-black text-yellow-400">{nf(empire.pointsPerDay)}<span className="text-[8px]">/day</span></div></div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[8px] text-muted-foreground">Bullets</div><div className="text-xs font-black text-orange-400">{nf(empire.bulletsPerDay)}<span className="text-[8px]">/day</span></div></div>
        {[["Common Scraps", empire.scrapCommon, "text-slate-300"], ["Rare Scraps", empire.scrapRare, "text-blue-400"], ["Epic Scraps", empire.scrapEpic, "text-purple-400"]].map(([l, v, c]) => (
          <div key={l as string} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[8px] text-muted-foreground">{l}</div><div className={`text-xs font-black ${c}`}>{v}<span className="text-[8px]">/day</span></div></div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-3"><div className="text-[9px] text-muted-foreground">Current Empire Value</div><div className="text-base font-black text-amber-400">{nf(empire.empireValue)} Points</div></div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Districts Completed</div><div className="text-base font-black text-green-400">{empire.districtsCompleted} / {EMPIRE_DISTRICTS.length}</div></div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3"><div className="text-[9px] text-muted-foreground">Total Tasks Completed</div><div className="text-base font-black text-cyan-400">{nf(empire.totalTasks)}</div></div>
      </div>
      <div>
        <div className="text-[10px] font-bold text-muted-foreground mb-2">Districts — complete all 3 tasks to conquer and earn daily income</div>
        <div className="grid gap-2 md:grid-cols-2">
          {empire.districts.map((d: any) => (
            <div key={d.name} className={`rounded-xl border p-3 ${d.conquered ? "border-green-500/40 bg-green-950/20" : "border-slate-700/40 bg-slate-900/30"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold">{d.conquered ? "🏆" : "🏙️"} {d.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{d.conquered ? "Conquered — pays daily income" : `${d.tasks}/3 tasks complete`}</div>
                </div>
                <button disabled={busy === d.name || d.conquered} onClick={() => run(d.name)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${d.conquered ? "bg-green-900/40 text-green-400" : "bg-gradient-to-r from-cyan-500 to-blue-500 text-black"}`}>
                  {d.conquered ? "✅" : busy === d.name ? "..." : `Task ${d.tasks + 1}`}
                </button>
              </div>
              <div className="mt-2 h-1.5 bg-background/60 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" style={{ width: `${(d.tasks / 3) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════ MISSION GUIDE ═══════════
export function MissionGuidePanel() {
  return (
    <div className="mafia-card rounded-xl border border-amber-500/20 p-5">
      <div className="text-sm font-bold mb-2">📜 Mission Guide</div>
      <div className="grid gap-3 md:grid-cols-3 text-[11px] leading-5 text-muted-foreground">
        <div className="space-y-1">
          <div className="font-bold text-white">🗺️ How it works</div>
          <p>Navigate the map and take over each district one by one. Each district has <span className="text-amber-400 font-bold">3 tasks</span> to complete, and once finished you receive <span className="text-green-400 font-bold">daily income</span> from that district (Empire).</p>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white">🏆 Sell your empire</div>
          <p>Once you've completed <span className="text-amber-400 font-bold">10+ districts</span>, you can sell your empire for a large points reward. Note: selling stops daily income and prevents completing more districts.</p>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white">⚠️ Mission Retrieval</div>
          <p>Your mission progress is <span className="text-red-400 font-bold">not protected</span> in the event of death.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════ PRISON BUST ═══════════
export function PrisonBustPanel() {
  const state = useQuery(api.empireSystem.getPrisonBust);
  const bustBot = useMutation(api.empireSystem.bustBot);
  const genBots = useMutation(api.empireSystem.generateBustBots);
  const setReward = useMutation(api.empireSystem.setBustReward);
  const leave = useMutation(api.empireSystem.prisonLeave);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [rewardAmt, setRewardAmt] = useState(0);

  if (!state) return <div className="animate-pulse py-6 text-center text-muted-foreground">Loading prison data...</div>;

  const act = async (fn: () => Promise<any>, ok: (r: any) => string) => {
    setBusy(true); setMsg(null);
    try { setMsg({ ok: true, text: ok(await fn()) }); }
    catch (e: any) { setMsg({ ok: false, text: e.message || "Failed" }); }
    setBusy(false);
  };

  return (
    <div className="mafia-card rounded-xl border border-red-500/20 p-5 space-y-4">
      <div className="text-sm font-bold">⛓️ Prison Bust</div>
      {msg && <Msg msg={msg} />}

      {/* Bust stats */}
      <div>
        <div className="text-[10px] font-bold text-muted-foreground mb-2">Bust Statistics — your prison bust performance</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[9px] text-muted-foreground">Total Attempts</div><div className="text-base font-black text-white">{nf(state.attempts)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[9px] text-muted-foreground">Successful</div><div className="text-base font-black text-green-400">{nf(state.success)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[9px] text-muted-foreground">Failed</div><div className="text-base font-black text-red-400">{nf(state.failed)}</div></div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[9px] text-muted-foreground">Total Profit</div><div className="text-base font-black text-amber-400">{fmt(state.profit)}</div></div>
        </div>
      </div>

      {/* Inmates */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-muted-foreground">Prison Inmates — sort by reward (high to low)</div>
          <button disabled={busy} onClick={() => act(() => genBots(), (r) => `Generated ${r.count} new inmates`)} className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-700 text-white disabled:opacity-40">Generate Bots</button>
        </div>
        <div className="space-y-1.5">
          {state.bots.length === 0 ? (
            <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-4 text-center text-[11px] text-muted-foreground">No inmates available — press <span className="text-white font-bold">Generate Bots</span></div>
          ) : (
            [...state.bots].sort((a: any, b: any) => b.reward - a.reward).map((b: any) => (
              <div key={b._id} className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-900/30 p-2.5">
                <button disabled={busy} onClick={() => act(() => bustBot({ botId: b._id }), (r) => r.success ? `🎉 Busted ${b.name} out — collected ${fmt(b.reward)}!` : `❌ Failed to bust ${b.name}`)}
                  className="px-2 py-1 rounded-lg text-[9px] font-black bg-slate-800 text-amber-400 disabled:opacity-40">Select</button>
                <span className="flex-1 text-xs font-bold">{b.name}</span>
                <span className="text-[10px] text-muted-foreground">{Math.floor(b.sentence)}s</span>
                <span className="text-[11px] font-black text-green-400">{fmt(b.reward)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leave + Set reward */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
          <div className="text-[10px] font-bold text-muted-foreground mb-2">Leave (2p)</div>
          {state.inPrison ? (
            <button disabled={busy} onClick={() => act(() => leave(), () => "You walked out of prison early (2 points)")} className="px-4 py-2 rounded-lg text-[10px] font-black bg-gradient-to-r from-red-500 to-rose-600 text-white disabled:opacity-40">Leave Prison</button>
          ) : <div className="text-[10px] text-slate-500">You're not currently in prison.</div>}
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
          <div className="text-[10px] font-bold text-muted-foreground mb-2">Set Your Reward — reward for someone to bust you out</div>
          <div className="flex items-center gap-2">
            <input type="number" value={rewardAmt} onChange={(e) => setRewardAmt(Math.max(0, parseInt(e.target.value || "0", 10)))} placeholder="$" className="w-28 bg-background border border-border rounded-lg px-3 py-2 text-xs" />
            <button disabled={busy} onClick={() => act(() => setReward({ amount: rewardAmt }), (r) => `Bust reward set to ${fmt(r.amount)}`)} className="px-3 py-2 rounded-lg text-[10px] font-black bg-slate-700 text-white disabled:opacity-40">Set Reward</button>
          </div>
          <div className="text-[9px] text-slate-500 mt-1">Current: {fmt(state.bustReward)}</div>
        </div>
      </div>
    </div>
  );
}
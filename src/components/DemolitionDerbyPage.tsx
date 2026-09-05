import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Flame, Trophy, Siren, Timer, Car, CircleDollarSign } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();
const ROUND_MS = 5 * 60 * 1000;

// Local formatting helpers shared with the backend schedule.
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const p2 = (n: number) => String(n).padStart(2, "0");

export function DemolitionDerbyPage() {
  const player = useQuery(api.game.getPlayer);
  const derby = useQuery(api.demolitionDerby.getDerbyState);
  const enter = useMutation(api.demolitionDerby.enterDerby);
  const claim = useMutation(api.demolitionDerby.claimDerbyPrize);

  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [carName, setCarName] = useState("");
  const [dmg, setDmg] = useState(15);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sound, setSound] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Auto-refresh the event board every 10s (live rounds) + smooth countdown.
  useEffect(() => {
    const iv = setInterval(() => {
      setNow(Date.now());
      setTick((t) => t + 1);
    }, 1000);
    const heavy = setInterval(() => setTick((t) => t + 1), 10000);
    return () => { clearInterval(iv); clearInterval(heavy); };
  }, []);

  void tick;

  if (!player || !derby) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Revving engines…</div>;

  const eventDate = new Date(derby.start);
  const roundMs = ROUND_MS;
  const elapsed = now - derby.start;
  const displayRound = Math.min(derby.roundsTotal, Math.floor(elapsed / roundMs) + 1);
  const roundClosesAt = derby.start + displayRound * roundMs;
  const roundLeft = derby.active ? roundClosesAt - now : 0;
  const roundProgress = Math.min(1, (elapsed % roundMs) / roundMs);

  const isWinner = derby.prizeWinner && player._id === derby.prizeWinner.id;

  const standings = derby.entrants ?? [];
  const bySurvival = [...standings].sort((a: any, b: any) =>
    (b.alive ? 1 : 0) - (a.alive ? 1 : 0) ||
    a.damage - b.damage);

  const canAfford = (player.money ?? 0) >= derby.entryFee;

  // Ambient derby colours / cars for entrants without one.
  const derbyCars = ["Umbrix Eclipse", "Voiture Noire", "Zentaro Bloodrush", "Iron Maiden", "Rust Bucket", "The Judge", "Hellhound", "Tombstone"];
  const entriesWithCar = standings.map((e: any, i: number) => ({
    ...e,
    carName: e.carName || derbyCars[i % derbyCars.length],
  }));

  const activity = useMemo(() => {
    if (!derby) return [];
    const lines: { at: string; text: string }[] = [];
    const d = new Date(derby.start);
    lines.push({ at: `${p2(d.getHours())}:${p2(d.getMinutes())}`, text: `Steel derby #${derby.eventId.split("#")[1]} — the arena opens its gates.` });
    for (let r = 1; r <= Math.max(1, derby.round); r++) {
      const eliminated = standings.filter((e: any) => e.eliminatedRound === r);
      if (eliminated.length > 0)
        lines.push({ at: `R${r}`, text: `${eliminated.map((e: any) => e.name).slice(0, 3).join(", ")}${eliminated.length > 3 ? ` +${eliminated.length - 3} more` : ""} wrecked in round ${r}.` });
    }
    const alive = standings.filter((e: any) => e.alive);
    if (derby.active && alive.length > 0)
      lines.push({ at: "LIVE", text: `${alive.length} ${alive.length === 1 ? "car is" : "cars are"} still taking hits — ${alive[0].name} leads at ${alive[0].damage}% damage.` });
    if (!derby.active && derby.prizeWinner)
      lines.push({ at: "FINAL", text: `${derby.prizeWinner.name} survives the derby with ${derby.prizeWinner.damage}% damage and takes the whole pool!` });
    return lines.slice(-8).reverse();
  }, [derby, standings]);

  const doEnter = async () => {
    setMsg(null); setBusy(true);
    try {
      const res = await enter({ carName: carName.trim() || "No-Name Beater", entryDamage: dmg });
      setMsg({ ok: true, text: `You're in! ${res.eventId} — pool is now $${nf(res.pool)}.` });
      setCarName("");
    } catch (e: any) {
      setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Could not enter the derby" });
    }
    setBusy(false);
  };

  const doClaim = async () => {
    setMsg(null); setBusy(true);
    try {
      const res = await claim();
      setMsg({ ok: true, text: `💥 Victory payday: $${nf(res.prize)} wired to your account.` });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Claim failed" });
    }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-950/40 via-slate-950 to-red-950/30 p-5">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #f9731622 0, transparent 45%), radial-gradient(circle at 80% 70%, #ef444426 0, transparent 40%)" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.span animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-5xl">🚗</motion.span>
            <div>
              <h1 className="text-xl font-black tracking-widest text-orange-300">DEMOLITION DERBY</h1>
              <p className="text-[10px] text-slate-400">Scheduled event · Enter undamaged beaters, survive rounds, winner takes all. Derby damage is capped at 90%.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest text-slate-500">Event</div>
            <div className="text-sm font-black text-orange-300">{derby.eventId}</div>
            <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-[9px] font-black text-green-300">
              <span className={`size-1.5 rounded-full ${derby.active ? "animate-pulse bg-green-400" : "bg-slate-500"}`} />
              {derby.active ? "ACTIVE" : "CLOSED"}
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <div className="rounded-xl border border-amber-500/25 bg-slate-950/60 p-3">
            <Trophy className="mx-auto size-4 text-amber-400" />
            <div className="mt-1 text-sm font-black text-amber-300">${nf(derby.pool)}</div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500">Full prize pool</div>
          </div>
          <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 p-3">
            <CircleDollarSign className="mx-auto size-4 text-green-400" />
            <div className="mt-1 text-sm font-black text-green-300">${nf(derby.entryFee)}</div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500">Entry fee</div>
          </div>
          <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 p-3">
            <Car className="mx-auto size-4 text-sky-400" />
            <div className="mt-1 text-sm font-black text-sky-300">{standings.length}</div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500">Entrants</div>
          </div>
          <div className="rounded-xl border border-slate-700/40 bg-slate-950/60 p-3">
            <Flame className="mx-auto size-4 text-orange-400" />
            <div className="mt-1 text-sm font-black text-orange-300">{standings.filter((e: any) => e.alive).length}</div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500">Still rolling</div>
          </div>
        </div>
        <div className="relative mt-3 flex items-center justify-between text-[9px] text-slate-500">
          <span>Auto-refresh every 10s</span>
          <span>Next derby window: every 4 hours</span>
        </div>
      </div>

      {/* Live round progress */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Siren className="size-4 animate-pulse text-red-400" />
            <h2 className="text-xs font-black tracking-wider text-white">LIVE ROUND PROGRESS</h2>
            <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[9px] font-black text-orange-300">
              Round {Math.min(displayRound, derby.roundsTotal)}/{derby.roundsTotal}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Timer className="size-3.5 text-amber-400" />
            {derby.active ? (
              <span className="font-black text-amber-300 tabular-nums">Round {Math.min(displayRound, derby.roundsTotal)} closes in {mmss(roundLeft)}</span>
            ) : (
              <span className="font-bold text-slate-400">Final — payouts open until {mmss(derby.windowEnd - now)}</span>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: derby.roundsTotal }).map((_, i) => {
            const done = i < Math.min(displayRound - 1, derby.roundsTotal);
            const current = i === Math.min(displayRound - 1, derby.roundsTotal) && derby.active;
            return (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${done ? "bg-orange-500" : current ? "bg-orange-500/60 animate-pulse" : "bg-slate-800"}`} />
            );
          })}
        </div>
        {derby.active && (
          <div className="mt-2 h-1 overflow-hidden rounded bg-slate-800">
            <div className="h-full rounded bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${roundProgress * 100}%` }} />
          </div>
        )}
      </div>

      {/* Grid: standings + entry */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standings</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-700/60 text-[9px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-2">Player</th>
                  <th className="pb-2 pr-2">Car</th>
                  <th className="pb-2 pr-2">Damage</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bySurvival.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-600">The arena is empty — be the first to enter.</td></tr>
                )}
                {bySurvival.map((e: any, idx: number) => (
                  <tr key={e.id} className={`border-b border-slate-800/50 ${e.id === player._id ? "bg-amber-500/10" : ""}`}>
                    <td className="py-2 pr-2 font-black text-slate-500">{idx + 1}</td>
                    <td className="py-2 pr-2 font-bold text-slate-200">
                      {e.name}{e.id === player._id && <span className="ml-1 text-[8px] font-black text-amber-400">(YOU)</span>}
                    </td>
                    <td className="py-2 pr-2 text-slate-400">{e.carName || "—"}</td>
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 overflow-hidden rounded bg-slate-800">
                          <div className={`h-full rounded ${e.alive ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${e.damage}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-slate-400">{e.damage}%</span>
                      </div>
                    </td>
                    <td className="py-2">
                      {e.alive ? (
                        <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[9px] font-black text-green-300">COMPETING</span>
                      ) : (
                        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[9px] font-black text-red-400">R{e.eliminatedRound} — WRECKED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Winner banner */}
          {!derby.active && derby.prizeWinner && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-orange-950/30 p-4 text-center">
              <div className="text-3xl">🏆</div>
              <div className="mt-1 text-sm font-black text-amber-300">{derby.prizeWinner.name} WINS THE DERBY!</div>
              <div className="text-[10px] text-slate-400">Survived at {derby.prizeWinner.damage}% damage with {derby.prizeWinner.carName}</div>
              {isWinner && !derby.myEntry?.claimed && (
                <button onClick={doClaim} disabled={busy}
                  className="mt-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 text-xs font-black tracking-wider text-slate-950 hover:from-amber-500 hover:to-amber-400">
                  💰 CLAIM ${nf(derby.pool)}
                </button>
              )}
              {isWinner && derby.myEntry?.claimed && (
                <div className="mt-2 text-[10px] font-bold text-green-400">✅ Prize claimed</div>
              )}
            </motion.div>
          )}
        </div>

        {/* Entry / my state */}
        <div className="lg:col-span-2 space-y-3">
          {derby.active ? (
            derby.canEnter ? (
              <div className="rounded-2xl border border-orange-500/30 bg-slate-900/50 p-4">
                <h3 className="text-xs font-black tracking-wider text-orange-300">ENTER THE DERBY</h3>
                <p className="mt-1 text-[10px] text-slate-500">Bring a beater. Lower damage = better odds. Damage is capped at 90%.</p>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">Car name</label>
                    <input value={carName} onChange={(e) => setCarName(e.target.value)} maxLength={40} placeholder="e.g. Umbrix Eclipse"
                      className="mt-1 w-full rounded-xl border border-slate-700/70 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/60" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Starting damage</span>
                      <span className="text-orange-300">{dmg}%</span>
                    </div>
                    <input type="range" min={0} max={90} value={dmg} onChange={(e) => setDmg(Number(e.target.value))}
                      className="mt-2 w-full accent-orange-500" />
                    <div className="flex justify-between text-[8px] text-slate-600"><span>0% — mint</span><span>90% — rolling wreck</span></div>
                  </div>
                  <div className={`rounded-xl border p-3 text-[10px] ${canAfford ? "border-green-500/30 bg-green-500/5 text-green-300" : "border-red-500/30 bg-red-500/5 text-red-300"}`}>
                    Entry fee <b>${nf(derby.entryFee)}</b> · {canAfford ? "Funds OK" : "Not enough cash"}
                  </div>
                  <button onClick={doEnter} disabled={busy || !canAfford}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-red-600 py-3 text-xs font-black tracking-wider text-white hover:from-orange-500 hover:to-red-500 disabled:opacity-40 transition-all">
                    {busy ? "ENTERING…" : "💥 ENTER THE DERBY"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-green-500/30 bg-slate-900/50 p-4">
                <div className="text-xs font-black text-green-300">YOU'RE IN THE FIGHT</div>
                {derby.myEntry && (
                  <div className="mt-3 space-y-2 text-[11px] text-slate-300">
                    <div>Car: <b className="text-white">{derby.myEntry.carName}</b></div>
                    <div>Starting damage: <b className="text-orange-300">{derby.myEntry.entryDamage}%</b></div>
                    {standings.find((e: any) => e.id === player._id)?.alive ? (
                      <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 font-black text-green-300 animate-pulse">STILL ALIVE — KEEP ROLLING</div>
                    ) : (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 font-black text-red-400">WRECKED — better luck next derby</div>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 text-center">
              <Trophy className="mx-auto size-6 text-amber-500/60" />
              <div className="mt-2 text-xs font-black text-slate-300">DERBY CLOSED</div>
              <p className="mt-1 text-[10px] text-slate-500">A new Steel Derby opens every 4 hours. Enter early — the pool fills as players join.</p>
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left">
                <div className="text-[9px] uppercase tracking-widest text-slate-500">Next window opens in</div>
                <div className="text-lg font-black text-orange-300 tabular-nums">{mmss(derby.windowEnd - now)}</div>
              </div>
            </div>
          )}

          {/* Activity */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Arena feed</h3>
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-2 text-[10px]">
                  <span className="shrink-0 font-black text-slate-600 tabular-nums">{a.at}</span>
                  <span className="text-slate-400">{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Playback (ambient) */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Round playback</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setSound((s) => !s)} className="rounded-md bg-slate-800 px-2 py-1 text-[9px] text-slate-300">{sound ? "🔊 Sound on" : "🔇 Muted"}</button>
                <button onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))} className="rounded-md bg-slate-800 px-2 py-1 text-[9px] text-slate-300">Speed {speed}x</button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              <button className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-black text-red-300">▶ PLAY</button>
              <span className="tabular-nums">R{derby.round}</span>
              <div className="flex-1 overflow-hidden">
                <div className="relative h-6 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                  {entriesWithCar.slice(0, 4).map((e: any, i: number) => (
                    <motion.span key={e.id} animate={{ x: [0, i * 30] }}
                      className="absolute top-1/2 -translate-y-1/2 text-base" style={{ left: `${i * 22}%` }}>🚙</motion.span>
                  ))}
                </div>
              </div>
              <span className="rounded-lg bg-slate-800 px-2 py-1 text-[9px] text-slate-400">CRASH CAM</span>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl border p-3 text-xs ${msg.ok ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ActionCard, ActionHero, ActionStat, ExecuteButton, SafetyNote,
} from "@/components/ActionVisuals";

/* ══════════════════════════════════════════════════════════════
   ULTIMATE ARSENAL PAGES — Underground Arena · Street Trainer ·
   Gun Range · Race Stakes · Safehouse Hotel · Tipsy Informant
   ══════════════════════════════════════════════════════════════ */

const money = (v: number) => `$${Math.floor(v).toLocaleString()}`;

function ResultBanner({ res }: { res: { ok: boolean; text: string } | null }) {
  if (!res) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mafia-card rounded-xl p-4 text-sm font-bold ${res.ok ? "border-emerald-500/40 text-emerald-300" : "border-red-500/40 text-red-400"}`}
    >
      {res.ok ? "✅ " : "⚠️ "}{res.text}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. UNDERGROUND ARENA
   ───────────────────────────────────────────────────────────── */
export function ArenaPage() {
  const state = useQuery(api.arsenal.getArenaState);
  const bet = useMutation(api.arsenal.betArenaFight);
  const player = useQuery(api.game.getPlayer);
  const [pick, setPick] = useState<string | null>(null);
  const [rival, setRival] = useState<string | null>(null);
  const [wager, setWager] = useState(10_000);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const [commentary, setCommentary] = useState<string[]>([]);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Booking the arena…</div>;

  const fighter = state.fighters.find((f: any) => f.id === pick);
  const rivalF = state.rivals.find((r: any) => r.id === rival);
  const canBet = !!fighter && !!rivalF && wager >= 100 && (player?.money ?? 0) >= wager;

  const go = async () => {
    if (!fighter || !rivalF) return;
    setBusy(true); setRes(null); setCommentary([]);
    try {
      const r = await bet({ fighterId: fighter.id, rivalId: rivalF.id, wager });
      setRes({ ok: r.won, text: r.won ? `${fighter.name} WINS — you cash ${money(r.payout)} on ${money(wager)}!` : `${rivalF.name} destroyed ${fighter.name}. ${money(wager)} gone.` });
      setCommentary(r.commentary ?? []);
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "Bet failed." });
    }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        eyebrow="Blood, sweat & bookmakers" icon="🥊"
        title="Underground Arena"
        description="Pick a fighter, pick their rival, stack your cash. Odds are live — the crowd is hungry."
       
        accent="red"
        right={<div className="rounded-xl border border-red-400/25 bg-black/30 px-3 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-red-200/60">Your cash</div><div className="text-lg font-black text-emerald-300">{money(player?.money ?? 0)}</div></div>}
      />

      <ResultBanner res={res} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fighter card list */}
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-3">🥊 Pick your fighter</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {state.fighters.map((f: any) => (
              <button
                key={f.id}
                onClick={() => setPick(f.id)}
                className={`action-card !p-3 text-left ${pick === f.id ? "action-card-active" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{f.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{f.name}</div>
                    <div className="text-[9px] text-slate-400">{f.style} · Power {f.power}</div>
                  </div>
                  <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                    {f.odds.toFixed(2)}×
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rival list */}
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-3">⚔️ Against</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {state.rivals.map((r: any) => (
              <button
                key={r.id}
                onClick={() => setRival(r.id)}
                className={`action-card !p-3 text-left ${rival === r.id ? "action-card-active" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{r.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{r.name}</div>
                    <div className="text-[9px] text-slate-400">{r.style} · Power {r.power}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bet slip */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Wager</div>
            <input
              type="number"
              min={100}
              step={100}
              value={wager}
              onChange={(e) => setWager(Math.max(100, Math.floor(Number(e.target.value) || 0)))}
              className="w-full rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-sm font-bold text-white focus:border-amber-500/50 outline-none"
            />
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-black/30 px-3 py-2 text-center">
            <div className="text-[9px] uppercase tracking-widest text-slate-500">Potential payout</div>
            <div className="text-base font-black text-emerald-300">{fighter ? money(wager * fighter.odds) : "—"}</div>
          </div>
          <ExecuteButton disabled={!canBet || busy} onClick={go}>
            {busy ? "Fighting…" : fighter && rivalF ? `Send ${fighter.name.split(" ")[0]} vs ${rivalF.name}` : "Pick both fighters"}
          </ExecuteButton>
        </div>
        <SafetyNote>
          Arena bets are final. The house takes no prisoners and gives no refunds.
        </SafetyNote>
      </div>

      {/* Commentary */}
      {commentary.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">🎙️ Round-by-round</div>
          <div className="space-y-1.5">
            {commentary.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="pulse-row !py-1.5 text-[11px] text-amber-100/80">
                {c}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {state.history.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Your betting slip history</div>
          <div className="space-y-1">
            {state.history.slice(0, 6).map((h: any) => (
              <div key={h._id} className="pulse-row !py-1.5">
                <span className="text-sm">{h.won ? "🏆" : "💀"}</span>
                <span className="text-[10px] font-bold text-amber-100/85 flex-1 truncate">{h.pickName} vs {h.rivalName}</span>
                <span className={`text-[10px] font-black ${h.won ? "text-emerald-400" : "text-red-400"}`}>{h.won ? `+${money((h.payout ?? 0) - h.wager)}` : `-${money(h.wager)}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. STREET TRAINER
   ───────────────────────────────────────────────────────────── */
export function TrainerPage() {
  const state = useQuery(api.arsenal.getTrainerState);
  const hire = useMutation(api.arsenal.hireTrainer);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Wrapping hands…</div>;

  const go = async (id: string) => {
    setBusy(id); setRes(null);
    try {
      const t = state.trainers.find((x: any) => x.id === id);
      const r = await hire({ trainerId: id });
      setRes({ ok: true, text: `${r.name} signed! +${r.atk} ATK / +${r.def} DEF for ${r.hours}h.` });
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "Signing failed." });
    }
    setBusy(null);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        eyebrow="Train hard · fight harder" icon="🥋"
        title="Street Trainer"
        description="Sign elite coaches for temporary combat buffs. Buffs stack while active — keep the pipeline full."
       
        accent="amber"
      />
      <ResultBanner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {state.trainers.map((t: any) => (
          <ActionCard key={t.id} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="action-hero-icon !size-11 !text-xl">{t.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate">{t.name}</div>
                <div className="text-[9px] text-slate-400">+{t.atk} ATK · +{t.def} DEF · {t.hours}h session</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-amber-300">{money(t.cost)}</span>
              <button
                onClick={() => go(t.id)}
                disabled={busy === t.id}
                className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
              >
                {busy === t.id ? "Signing…" : "Sign coach"}
              </button>
            </div>
          </ActionCard>
        ))}
      </div>
      {state.sessions.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">⚡ Active coaching</div>
          <div className="space-y-1">
            {state.sessions.map((s: any) => (
              <div key={s._id} className="pulse-row !py-1.5">
                <span className="text-sm">💪</span>
                <span className="text-[10px] font-bold text-amber-100/85 flex-1">{s.kind} · +{s.buffAttack} ATK / +{s.buffDefense} DEF</span>
                <span className="text-[9px] text-slate-500">{Math.max(0, Math.ceil((s.expiresAt - Date.now()) / 3600_000))}h left</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <SafetyNote>Trainer buffs add straight to your attack & defense stats for the session duration.</SafetyNote>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. GUN RANGE
   ───────────────────────────────────────────────────────────── */
export function RangePage() {
  const state = useQuery(api.arsenal.getRangeState);
  const practice = useMutation(api.arsenal.practiceRange);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Loading targets…</div>;

  const go = async (id: string) => {
    setBusy(id); setRes(null);
    try {
      const r = await practice({ packageId: id });
      setRes({ ok: true, text: `Drill complete — +${r.gain} accuracy for ${r.hours}h. Bullets well spent.` });
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "Practice failed." });
    }
    setBusy(null);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        eyebrow="Aim small · miss small" icon="🎯"
        title="Gun Range"
        description="Burn rounds on the range to sharpen your aim. Higher accuracy means stronger attacks for the session."
       
        accent="cyan"
        right={<div className="rounded-xl border border-cyan-400/25 bg-black/30 px-3 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-cyan-200/60">Bullets</div><div className="text-lg font-black text-orange-300">{(state.bullets ?? 0).toLocaleString()}</div></div>}
      />
      <ResultBanner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {state.packages.map((p: any) => (
          <ActionCard key={p.id} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="action-hero-icon !size-11 !text-xl">{p.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate">{p.name}</div>
                <div className="text-[9px] text-slate-400">{p.bullets} rounds · +{p.gain} accuracy · {p.hours}h</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-amber-300">{money(p.cost)}</span>
              <button
                onClick={() => go(p.id)}
                disabled={busy === p.id}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 transition-colors disabled:opacity-50"
              >
                {busy === p.id ? "Shooting…" : "Train"}
              </button>
            </div>
          </ActionCard>
        ))}
      </div>
      {state.sessions.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">🎯 Active drills</div>
          <div className="space-y-1">
            {state.sessions.map((s: any) => (
              <div key={s._id} className="pulse-row !py-1.5">
                <span className="text-sm">🎯</span>
                <span className="text-[10px] font-bold text-cyan-100/85 flex-1">+{s.accuracyGain} accuracy</span>
                <span className="text-[9px] text-slate-500">{Math.max(0, Math.ceil((s.expiresAt - Date.now()) / 3600_000))}h left</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <SafetyNote>Range sessions consume real bullets and boost your attack stat temporarily.</SafetyNote>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. RACE STAKES
   ───────────────────────────────────────────────────────────── */
export function RaceStakesPage() {
  const state = useQuery(api.arsenal.getRaceStakesState);
  const race = useMutation(api.arsenal.raceStakes);
  const player = useQuery(api.game.getPlayer);
  const [crew, setCrew] = useState(0);
  const [carId, setCarId] = useState<string>("");
  const [wager, setWager] = useState(5_000);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Warming tires…</div>;

  const go = async () => {
    setBusy(true); setRes(null);
    try {
      const r = await race({ crewIndex: crew, vehicleId: (carId || undefined) as any, wager });
      setRes({ ok: r.won, text: r.won ? `You smoked ${r.crew} in the ${r.carName} — +${money(r.payout)}!` : `${r.crew} took the win. "${r.taunt}"` });
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "Race failed." });
    }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        eyebrow="Midnight · illegal · loud" icon="🏁"
        title="Race Stakes"
        description="Put your garage where your mouth is. Faster cars beat tougher crews — and the money gets real."
       
        accent="purple"
      />
      <ResultBanner res={res} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-3">🏁 Choose your rival crew</div>
          <div className="space-y-2">
            {state.crews.map((c: any, i: number) => (
              <button key={c.name} onClick={() => setCrew(i)} className={`w-full action-card !p-3 text-left ${crew === i ? "action-card-active" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚗</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-white">{c.name}</div>
                    <div className="text-[9px] text-slate-400 italic">{c.taunt}</div>
                  </div>
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-black text-purple-300">Skill {c.skill}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mafia-card rounded-xl p-4 space-y-3">
          <div className="eyebrow">🚗 Your ride</div>
          <select
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            className="w-full rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
          >
            <option value="">Rental Beater (speed 45)</option>
            {(state.cars ?? []).map((c: any) => (
              <option key={c._id} value={c._id}>{c.name} · speed {c.speed}</option>
            ))}
          </select>
          <div className="eyebrow">💵 Stake</div>
          <input
            type="number"
            min={500}
            step={500}
            value={wager}
            onChange={(e) => setWager(Math.max(500, Math.floor(Number(e.target.value) || 0)))}
            className="w-full rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-sm font-bold text-white focus:border-amber-500/50 outline-none"
          />
          <ExecuteButton disabled={busy || (player?.money ?? 0) < wager} onClick={go}>
            {busy ? "Racing…" : "Light 'em up"}
          </ExecuteButton>
          <SafetyNote>Higher-crew stakes pay bigger multipliers — but they drive like demons.</SafetyNote>
        </div>
      </div>
      {state.history.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Race history</div>
          <div className="space-y-1">
            {state.history.slice(0, 6).map((h: any) => (
              <div key={h._id} className="pulse-row !py-1.5">
                <span className="text-sm">{h.status === "won" ? "🏆" : "💀"}</span>
                <span className="text-[10px] font-bold text-amber-100/85 flex-1 truncate">vs {h.opponentName}</span>
                <span className={`text-[10px] font-black ${h.status === "won" ? "text-emerald-400" : "text-red-400"}`}>{h.status === "won" ? `+${money(h.payout ?? 0)}` : `-${money(h.wager)}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. SAFEHOUSE HOTEL
   ───────────────────────────────────────────────────────────── */
export function HotelPage() {
  const state = useQuery(api.arsenal.getHotelState);
  const book = useMutation(api.arsenal.bookHotel);
  const collect = useMutation(api.arsenal.collectHotelIncome);
  const player = useQuery(api.game.getPlayer);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Checking vacancies…</div>;

  const go = async (id: string) => {
    setBusy(id); setRes(null);
    try {
      const s = state.suites.find((x: any) => x.id === id);
      const r = await book({ suiteId: id });
      setRes({ ok: true, text: `${r.suite} booked — ${money(r.perHour)}/h accruing for ${r.hours}h.` });
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "Booking failed." });
    }
    setBusy(null);
  };

  const collectNow = async () => {
    setBusy("collect"); setRes(null);
    try {
      const r = await collect({});
      setRes({ ok: r.total > 0, text: r.total > 0 ? `Collected ${money(r.total)} from your stays.` : "Nothing to collect yet — let the clock run." });
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "Collect failed." });
    }
    setBusy(null);
  };

  const pending = (state.stays ?? []).filter((s: any) => !s.claimed);
  const pendingTotal = pending.reduce((sum: number, s: any) => {
    const elapsedH = Math.max(0, Math.min(Date.now(), s.endsAt) - s.startedAt) / 3600_000;
    return sum + Math.floor(elapsedH * s.perHour);
  }, 0);

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        eyebrow="Ghost the city · keep the cash flowing" icon="🏨"
        title="Safehouse Hotel"
        description="Check out of the spotlight. While you lay low, your safehouse quietly launders cash by the hour."
       
        accent="emerald"
      />
      <ResultBanner res={res} />

      {pending.length > 0 && (
        <div className="mafia-card rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="text-[9px] uppercase tracking-widest text-slate-500">Accruing right now</div>
            <div className="text-xl font-black text-emerald-300">{money(pendingTotal)}</div>
            <div className="text-[9px] text-slate-500">{pending.length} active stay{pending.length > 1 ? "s" : ""}</div>
          </div>
          <button
            onClick={collectNow}
            disabled={busy === "collect"}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
          >
            {busy === "collect" ? "Collecting…" : "Collect income"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {state.suites.map((s: any) => (
          <ActionCard key={s.id} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="action-hero-icon !size-11 !text-xl">{s.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate">{s.name}</div>
                <div className="text-[9px] text-slate-400">{money(s.perHour)}/h · {s.hours}h stay</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-black text-amber-300">{money(s.cost)}</span>
                <div className="text-[9px] text-emerald-400/70 font-bold">Earns {money(s.perHour * s.hours)} back</div>
              </div>
              <button
                onClick={() => go(s.id)}
                disabled={busy === s.id || (player?.money ?? 0) < s.cost}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
              >
                {busy === s.id ? "Booking…" : "Book stay"}
              </button>
            </div>
          </ActionCard>
        ))}
      </div>

      {state.stays.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Stay history</div>
          <div className="space-y-1">
            {state.stays.slice(0, 6).map((s: any) => (
              <div key={s._id} className="pulse-row !py-1.5">
                <span className="text-sm">{s.claimed ? "✅" : "🏨"}</span>
                <span className="text-[10px] font-bold text-amber-100/85 flex-1">{s.suite}</span>
                <span className="text-[9px] text-slate-500">{s.claimed ? `collected ${money(s.claimedAmount ?? 0)}` : `ends ${new Date(s.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <SafetyNote>Every stay pays out more than it costs — the tradeoff is you must wait for the full window.</SafetyNote>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. TIPSY INFORMANT
   ───────────────────────────────────────────────────────────── */
export function TipsyInformantPage() {
  const state = useQuery(api.arsenal.getInformantState);
  const buy = useMutation(api.arsenal.buyInformantTip);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">The bar is quiet…</div>;

  const go = async () => {
    setBusy(true); setRes(null);
    try {
      const r = await buy({});
      setRes({ ok: true, text: `🍺 "${r.tip}"` });
    } catch (e: any) {
      setRes({ ok: false, text: e.message ?? "The informant walked away." });
    }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        eyebrow="Everyone talks after three drinks" icon="🍺"
        title="Tipsy Informant"
        description="Buy a round for the right drunk and get a rumor. Each tip keeps your next crimes safer for 2 hours."
       
        accent="amber"
      />
      <ResultBanner res={res} />
      <div className="mafia-card rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[9px] uppercase tracking-widest text-slate-500">The deal</div>
          <div className="text-sm font-bold text-amber-100/85">$75,000 per rumor · 2h of cooler streets · stack up to a few</div>
        </div>
        <button
          onClick={go}
          disabled={busy}
          className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
        >
          {busy ? "Buying a round…" : "Buy a round 🍺"}
        </button>
      </div>
      {state.tips.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">👂 Active rumors</div>
          <div className="space-y-1">
            {state.tips.map((t: any) => (
              <div key={t._id} className="pulse-row !py-2">
                <span className="text-sm">🍺</span>
                <span className="text-[11px] text-amber-100/85 flex-1 italic">"{t.tip}"</span>
                <span className="text-[9px] text-slate-500">{Math.max(0, Math.ceil((t.expiresAt - Date.now()) / 60000))}m left</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <SafetyNote>Tips are flavor + heat reduction — the streets stay colder while a rumor is active.</SafetyNote>
    </div>
  );
}

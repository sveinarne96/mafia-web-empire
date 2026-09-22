import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ActionCard, ActionHero, ExecuteButton, SafetyNote,
} from "@/components/ActionVisuals";

/* ══════════════════════════════════════════════════════════════
   EXPANSION PACK PAGES — 12 street-racket systems, styled with
   the game's ActionHero / mafia-card / pulse-row visual language.
   ══════════════════════════════════════════════════════════════ */

const money = (v: number) => `$${Math.floor(v).toLocaleString()}`;

function Banner({ res }: { res: { ok: boolean; text: string } | null }) {
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

type Res = { ok: boolean; text: string } | null;

/* ───────────── 1. DOCKWORKER HUSTLE ───────────── */
export function DockPage() {
  const state = useQuery(api.expansion.getDockState);
  const work = useMutation(api.expansion.workDockShift);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Clocking in…</div>;
  const go = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await work({ shiftId: id }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="⚓" eyebrow="Honest work, dishonest hours" title="Dockworker Hustle" description="Unload crates at the harbor. The union asks no questions and pays no benefits — just cash per crate." accent="cyan" />
      <Banner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {state.shifts.map((s: any) => (
          <ActionCard key={s.id} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="action-hero-icon !size-11 !text-xl">{s.icon}</span>
              <div>
                <div className="text-sm font-black text-white">{s.name}</div>
                <div className="text-[9px] text-slate-400">Up to {s.crates} crates · ~{money(s.pay)}</div>
              </div>
            </div>
            <button onClick={() => go(s.id)} disabled={busy === s.id}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 transition-colors disabled:opacity-50">
              {busy === s.id ? "Working…" : "Take shift"}
            </button>
          </ActionCard>
        ))}
      </div>
      {state.history.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Shift log</div>
          {state.history.map((h: any) => (
            <div key={h._id} className="pulse-row !py-1.5">
              <span className="text-sm">📦</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{h.shiftType}</span>
              <span className="text-[9px] text-slate-500">{h.crates} crates</span>
              <span className="text-[10px] font-black text-emerald-400">{money(h.earned)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 2. CHOP-SHOP PARTS ───────────── */
export function ChopShopPage() {
  const state = useQuery(api.expansion.getChopState);
  const strip = useMutation(api.expansion.stripCar);
  const sell = useMutation(api.expansion.sellChopPart);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Rolling up the door…</div>;
  const doStrip = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await strip({ vehicleId: id as any }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  const doSell = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await sell({ partId: id as any }); setRes({ ok: true, text: `Sold ${r.partName} for ${money(r.soldFor)}.` }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🔧" eyebrow="Every car is just parts waiting" title="Chop-Shop Parts" description="Strip cars from your garage into gray-market parts, then sell each piece to the highest bidder." accent="amber" />
      <Banner res={res} />
      <div className="mafia-card rounded-xl p-4">
        <div className="eyebrow mb-2">🚗 Your garage</div>
        {(state.cars ?? []).length === 0 && <div className="text-[10px] text-slate-600">No cars to strip. Go steal some first.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(state.cars ?? []).map((c: any) => (
            <div key={c._id} className="pulse-row">
              <span className="text-sm">🚙</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1 truncate">{c.name}</span>
              <span className="text-[9px] text-slate-500">spd {c.speed}</span>
              <button onClick={() => doStrip(c._id)} disabled={busy === c._id}
                className="rounded-md border border-red-500/40 bg-red-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-red-300 hover:bg-red-500/25 disabled:opacity-50">
                {busy === c._id ? "…" : "Strip"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {(state.parts ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">⚙️ Parts on the rack</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {state.parts.map((p: any) => (
              <div key={p._id} className="pulse-row">
                <span className="text-sm">🔩</span>
                <span className="text-[10px] font-bold text-amber-100/85 flex-1 truncate">{p.partName}</span>
                <span className="text-[9px] text-emerald-400">{money(p.value)}</span>
                <button onClick={() => doSell(p._id)} disabled={busy === p._id}
                  className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50">
                  {busy === p._id ? "…" : "Sell"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <SafetyNote>Stripping is permanent — the car is gone. Parts sell for 85–125% of appraised value.</SafetyNote>
    </div>
  );
}

/* ───────────── 3. GRAFFITI CREW ───────────── */
export function GraffitiPage() {
  const state = useQuery(api.expansion.getGraffitiState);
  const spray = useMutation(api.expansion.sprayTag);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Shaking the can…</div>;
  const go = async (spot: string) => {
    setBusy(true); setRes(null);
    try { const r = await spray({ spot }); setRes({ ok: !r.caught, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🎨" eyebrow="Reputation in spray paint" title="Graffiti Crew" description="Bomb the city with your crew's tag. Fame raises your name — cops raise your wanted level." accent="purple" />
      <Banner res={res} />
      <div className="mafia-card rounded-xl p-4">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-purple-300">{state.totalFame ?? 0}</span>
          <span className="text-[10px] text-slate-500">career fame</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {state.spots.map((s: string) => (
            <button key={s} onClick={() => go(s)} disabled={busy}
              className="action-card !p-3 text-center disabled:opacity-50">
              <div className="text-lg mb-1">🎯</div>
              <div className="text-[10px] font-black text-white">{s}</div>
            </button>
          ))}
        </div>
      </div>
      {(state.tags ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Tag history</div>
          {state.tags.map((t: any) => (
            <div key={t._id} className="pulse-row !py-1.5">
              <span className="text-sm">{t.caught ? "🚨" : "🎨"}</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{t.spot}</span>
              <span className={`text-[10px] font-black ${t.caught ? "text-red-400" : "text-purple-300"}`}>{t.caught ? "CAUGHT" : `+${t.fame} fame`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 4. PAWN SHOP FLIPS ───────────── */
export function PawnPage() {
  const state = useQuery(api.expansion.getPawnState);
  const flip = useMutation(api.expansion.pawnFlip);
  const [busy, setBusy] = useState<number | null>(null);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Opening the case…</div>;
  const go = async (i: number) => {
    setBusy(i); setRes(null);
    try { const r = await flip({ goodIndex: i }); setRes({ ok: r.profit > 0, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🏗️" eyebrow="Buy low · sell high · no receipts" title="Pawn Shop Flips" description="The fence has fresh goods every hour. Buy, flip, profit — or eat the loss when he lowballs you." accent="amber" />
      <Banner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {state.goods.map((g: any, i: number) => (
          <ActionCard key={g.name} className="!p-3">
            <div className="text-sm font-black text-white mb-0.5">{g.name}</div>
            <div className="text-[9px] text-slate-400 mb-2">{money(g.min)} – {money(g.max)}</div>
            <button onClick={() => go(i)} disabled={busy === i}
              className="w-full rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[9px] font-black uppercase text-amber-300 hover:bg-amber-500/25 disabled:opacity-50">
              {busy === i ? "…" : "Flip it"}
            </button>
          </ActionCard>
        ))}
      </div>
      {(state.flips ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Flip log</div>
          {state.flips.map((f: any) => (
            <div key={f._id} className="pulse-row !py-1.5">
              <span className="text-sm">{f.profit > 0 ? "📈" : "📉"}</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{f.itemName}</span>
              <span className={`text-[10px] font-black ${f.profit > 0 ? "text-emerald-400" : "text-red-400"}`}>{f.profit > 0 ? "+" : ""}{money(f.profit)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 5. CAB COMPANY ───────────── */
export function CabPage() {
  const state = useQuery(api.expansion.getCabState);
  const drive = useMutation(api.expansion.driveCabShift);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Polishing the hood…</div>;
  const go = async () => {
    setBusy(true); setRes(null);
    try { const r = await drive({}); setRes({ ok: true, text: r.text + (r.intel ? ` 🕵️ INTEL: ${r.intel}` : "") }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🚕" eyebrow="The city talks in the back seat" title="Cab Company" description="Drive fares, pocket tips, and overhear the city's secrets. Some rides come with intel worth more than the fare." accent="cyan" />
      <Banner res={res} />
      <div className="mafia-card rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[9px] uppercase tracking-widest text-slate-500">Shift</div>
          <div className="text-sm font-bold text-amber-100/85">4–12 fares · costs 8 energy · 35% chance of street intel</div>
        </div>
        <button onClick={go} disabled={busy}
          className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50">
          {busy ? "Driving…" : "Start shift 🚕"}
        </button>
      </div>
      {(state.shifts ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Shift log</div>
          {state.shifts.map((s: any) => (
            <div key={s._id} className="pulse-row !py-1.5">
              <span className="text-sm">🚕</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{s.fares} fares</span>
              {s.intel && <span className="text-[9px] text-cyan-300 italic max-w-[200px] truncate">🕵️ {s.intel}</span>}
              <span className="text-[10px] font-black text-emerald-400">{money(s.earned)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 6. JUNKYARD DOGS ───────────── */
export function DogsPage() {
  const state = useQuery(api.expansion.getDogState);
  const buy = useMutation(api.expansion.buyDog);
  const train = useMutation(api.expansion.trainDog);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">The kennel stirs…</div>;
  const doBuy = async (i: number) => {
    setBusy(`b${i}`); setRes(null);
    try { const r = await buy({ breedIndex: i }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  const doTrain = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await train({ dogId: id as any }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🐕" eyebrow="Loyal · lethal · leashed" title="Junkyard Dogs" description="Raise attack dogs that guard your empire permanently. Every breed adds raw defense — training levels them further." accent="emerald" />
      <Banner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {state.breeds.map((b: any, i: number) => (
          <ActionCard key={b.breed} className="!p-3">
            <div className="text-2xl mb-1">{b.icon}</div>
            <div className="text-sm font-black text-white">{b.breed}</div>
            <div className="text-[9px] text-slate-400 mb-2">+{b.power} DEF permanent</div>
            <button onClick={() => doBuy(i)} disabled={busy === `b${i}`}
              className="w-full rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[9px] font-black uppercase text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50">
              {busy === `b${i}` ? "…" : `${money(b.cost)}`}
            </button>
          </ActionCard>
        ))}
      </div>
      {(state.dogs ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">🐾 Your pack</div>
          {state.dogs.map((d: any) => (
            <div key={d._id} className="pulse-row !py-1.5">
              <span className="text-sm">🐕</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{d.name} · {d.breed}</span>
              <span className="text-[9px] text-slate-500">Lv.{d.level} · ♥{d.loyalty}%</span>
              <button onClick={() => doTrain(d._id)} disabled={busy === d._id}
                className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-amber-300 hover:bg-amber-500/25 disabled:opacity-50">
                {busy === d._id ? "…" : "Train $25k"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 7. NIGHT MARKET STALLS ───────────── */
export function NightMarketPage() {
  const state = useQuery(api.expansion.getNightMarketState);
  const open = useMutation(api.expansion.openNightStall);
  const collect = useMutation(api.expansion.collectNightStall);
  const close = useMutation(api.expansion.closeNightStall);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<Res>(null);
  const [name, setName] = useState("");
  const [good, setGood] = useState(0);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground"> stringing the fairy lights…</div>;
  const doOpen = async () => {
    setBusy("open"); setRes(null);
    try { const r = await open({ goodIndex: good, stallName: name }); setRes({ ok: true, text: r.text }); setName(""); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  const doCollect = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await collect({ stallId: id as any }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  const doClose = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await close({ stallId: id as any }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🏮" eyebrow="The bazaar never sleeps" title="Night Market Stalls" description="Rent a stall in the black-market bazaar (up to 3), stock it with gray-market goods, and collect earnings hourly." accent="purple" />
      <Banner res={res} />
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="eyebrow">🏪 Open a stall · $90,000</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Stall name…"
            className="rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          <select value={good} onChange={(e) => setGood(Number(e.target.value))}
            className="rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
            {state.goods.map((g: string, i: number) => <option key={g} value={i}>{g}</option>)}
          </select>
          <button onClick={doOpen} disabled={busy === "open"}
            className="rounded-lg border border-purple-500/40 bg-purple-500/15 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-purple-300 hover:bg-purple-500/25 disabled:opacity-50">
            {busy === "open" ? "Opening…" : "Open stall"}
          </button>
        </div>
      </div>
      {(state.stalls ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">🏮 Your stalls</div>
          {state.stalls.map((s: any) => (
            <div key={s._id} className="pulse-row !py-1.5">
              <span className="text-sm">🏮</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{s.stallName} <span className="text-slate-500">· {s.goods}</span></span>
              <button onClick={() => doCollect(s._id)} disabled={busy === s._id}
                className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50">Collect</button>
              <button onClick={() => doClose(s._id)} disabled={busy === s._id}
                className="rounded-md border border-red-500/40 bg-red-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-red-300 hover:bg-red-500/25 disabled:opacity-50">Close</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 8. CABLE PIRACY RING ───────────── */
export function CablePage() {
  const state = useQuery(api.expansion.getCableState);
  const tap = useMutation(api.expansion.tapCable);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Splicing wires…</div>;
  const go = async (district: string) => {
    setBusy(true); setRes(null);
    try { const r = await tap({ district }); setRes({ ok: !r.raided, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="📺" eyebrow="Free TV for everyone (for a fee)" title="Cable Piracy Ring" description="Tap into district cable lines and sell subscriptions. 25% chance the utility company sends enforcement." accent="red" />
      <Banner res={res} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {state.districts.map((d: string) => (
          <button key={d} onClick={() => go(d)} disabled={busy} className="action-card !p-3 text-center disabled:opacity-50">
            <div className="text-lg mb-1">🔌</div>
            <div className="text-[10px] font-black text-white">{d}</div>
          </button>
        ))}
      </div>
      {(state.taps ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Tap history</div>
          {state.taps.map((t: any) => (
            <div key={t._id} className="pulse-row !py-1.5">
              <span className="text-sm">{t.raided ? "🚨" : "📺"}</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{t.district}</span>
              <span className={`text-[10px] font-black ${t.raided ? "text-red-400" : "text-emerald-400"}`}>{t.raided ? "RAIDED" : money(t.earned)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 9. NUMBERS RACKET ───────────── */
export function NumbersPage() {
  const state = useQuery(api.expansion.getNumbersState);
  const play = useMutation(api.expansion.playNumbers);
  const player = useQuery(api.game.getPlayer);
  const [digits, setDigits] = useState("");
  const [bet, setBet] = useState(1_000);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Chalking the board…</div>;
  const go = async () => {
    setBusy(true); setRes(null);
    try { const r = await play({ numbers: digits, bet }); setRes({ ok: r.won, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🎱" eyebrow="Straight off the corner" title="Numbers Racket" description="Pick three digits. Exact hit pays 600×, two digits pay 20×, one digit pays 3×. The runner rounds at midnight." accent="amber" />
      <Banner res={res} />
      <div className="mafia-card rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Your 3 digits</div>
            <input value={digits} onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 777"
              className="w-full rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-center text-xl font-black tracking-[0.5em] text-amber-300 outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Bet</div>
            <input type="number" min={100} step={100} value={bet} onChange={(e) => setBet(Math.max(100, Math.floor(Number(e.target.value) || 0)))}
              className="w-full rounded-lg border border-slate-700/50 bg-black/40 px-3 py-2 text-sm font-bold text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex items-end">
            <ExecuteButton disabled={busy || digits.length !== 3 || (player?.money ?? 0) < bet} onClick={go}>
              {busy ? "Drawing…" : "Play the number"}
            </ExecuteButton>
          </div>
        </div>
      </div>
      {(state.bets ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Past draws</div>
          {state.bets.map((b: any) => (
            <div key={b._id} className="pulse-row !py-1.5">
              <span className="text-sm">{b.won ? "💥" : "🎱"}</span>
              <span className="text-[10px] font-black text-amber-300 tracking-widest">{b.numbers}</span>
              <span className="text-[9px] text-slate-500">drew {b.drawn}</span>
              <span className={`ml-auto text-[10px] font-black ${b.won ? "text-emerald-400" : (b.payout ?? 0) > 0 ? "text-amber-300" : "text-red-400"}`}>
                {(b.payout ?? 0) > 0 ? `+${money(b.payout)}` : `-${money(b.bet)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 10. VALET HUSTLE ───────────── */
export function ValetPage() {
  const state = useQuery(api.expansion.getValetState);
  const work = useMutation(api.expansion.workValet);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">White gloves on…</div>;
  const go = async () => {
    setBusy(true); setRes(null);
    try { const r = await work({}); setRes({ ok: !r.stole, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🅿️" eyebrow="Tips, keys, and temptation" title="Valet Hustle" description="Park exotics at the city's finest restaurants. Tips are decent — and 12% of the time, a key card ends up in your pocket." accent="purple" />
      <Banner res={res} />
      <div className="mafia-card rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[9px] uppercase tracking-widest text-slate-500">Shift</div>
          <div className="text-sm font-bold text-amber-100/85">Park an exotic · 12% chance it "disappears" into your garage (+2 wanted)</div>
        </div>
        <button onClick={go} disabled={busy}
          className="rounded-xl border border-purple-500/40 bg-purple-500/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-purple-300 hover:bg-purple-500/25 disabled:opacity-50">
          {busy ? "Parking…" : "Work the stand 🅿️"}
        </button>
      </div>
      {(state.runs ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📜 Shift log</div>
          {state.runs.map((r: any) => (
            <div key={r._id} className="pulse-row !py-1.5">
              <span className="text-sm">{r.stole ? "🚨" : "🅿️"}</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{r.carName}</span>
              <span className={`text-[10px] font-black ${r.stole ? "text-purple-300" : "text-emerald-400"}`}>{r.stole ? "ACQUIRED" : money(r.earned)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── 11. BATHHOUSE ───────────── */
export function BathhousePage() {
  const state = useQuery(api.expansion.getBathhouseState);
  const visit = useMutation(api.expansion.visitBathhouse);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Filling the steam room…</div>;
  const go = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await visit({ serviceId: id }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="♨️" eyebrow="Scrub the blood off · literally" title="Bathhouse" description="Steam, massage, and the royal treatment. Restore energy and life instantly — no waiting for regen." accent="cyan"
        right={<div className="rounded-xl border border-cyan-400/25 bg-black/30 px-3 py-2 text-right"><div className="text-[9px] uppercase tracking-widest text-cyan-200/60">You</div><div className="text-sm font-black text-emerald-300">❤️ {state.life} · ⚡ {state.energy}</div></div>} />
      <Banner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {state.services.map((s: any) => (
          <ActionCard key={s.id} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="action-hero-icon !size-11 !text-xl">{s.icon}</span>
              <div>
                <div className="text-sm font-black text-white">{s.name}</div>
                <div className="text-[9px] text-slate-400">+{s.energy} energy · +{s.life} life</div>
              </div>
            </div>
            <button onClick={() => go(s.id)} disabled={busy === s.id}
              className="w-full rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50">
              {busy === s.id ? "Relaxing…" : `${money(s.cost)}`}
            </button>
          </ActionCard>
        ))}
      </div>
    </div>
  );
}

/* ───────────── 12. SKYLINE BILLBOARDS ───────────── */
export function BillboardPage() {
  const state = useQuery(api.expansion.getBillboardState);
  const rent = useMutation(api.expansion.rentBillboard);
  const launder = useMutation(api.expansion.launderBillboard);
  const [busy, setBusy] = useState<string | null>(null);
  const [res, setRes] = useState<Res>(null);

  if (!state) return <div className="animate-pulse text-center py-10 text-muted-foreground">Booking airtime…</div>;
  const doRent = async (i: number) => {
    setBusy(`r${i}`); setRes(null);
    try { const r = await rent({ spotIndex: i }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  const doWash = async (id: string) => {
    setBusy(id); setRes(null);
    try { const r = await launder({ boardId: id as any }); setRes({ ok: true, text: r.text }); }
    catch (e: any) { setRes({ ok: false, text: e.message }); }
    setBusy(null);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero icon="🌆" eyebrow="Your ad agency (wink)" title="Skyline Billboards" description="Lease premium ad space, then 'bill' fictional clients daily. The dirtiest money in the city comes out spotless." accent="amber" />
      <Banner res={res} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {state.spots.map((s: any, i: number) => (
          <ActionCard key={s.location} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="action-hero-icon !size-11 !text-xl">📸</span>
              <div>
                <div className="text-sm font-black text-white">{s.location}</div>
                <div className="text-[9px] text-slate-400">{s.tier} · washes {money(s.perDay)}/day</div>
              </div>
            </div>
            <button onClick={() => doRent(i)} disabled={busy === `r${i}`}
              className="w-full rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 disabled:opacity-50">
              {busy === `r${i}` ? "Leasing…" : `Lease ${money(s.cost)}`}
            </button>
          </ActionCard>
        ))}
      </div>
      {(state.boards ?? []).length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="eyebrow mb-2">📢 Your leases</div>
          {state.boards.map((b: any) => (
            <div key={b._id} className="pulse-row !py-1.5">
              <span className="text-sm">🌆</span>
              <span className="text-[10px] font-bold text-amber-100/85 flex-1">{b.location}</span>
              <span className="text-[9px] text-slate-500">{money(b.launderedPerDay)}/day</span>
              <button onClick={() => doWash(b._id)} disabled={busy === b._id}
                className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50">
                {busy === b._id ? "…" : "Launder"}
              </button>
            </div>
          ))}
        </div>
      )}
      <SafetyNote>Laundering converts dirty money into clean cash based on hours elapsed since the last cycle.</SafetyNote>
    </div>
  );
}

/* eslint-disable */
// @ts-nocheck
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import {
  ACTIONS, CATEGORY_META, ACTIONS_BY_CAT, EVENT_LABEL,
  type ActionDef, type CatKey,
} from "../game/actionCatalog";

/* ═══════════════════════════════════════════════════════════════
   THE 500 — full action compendium page, game visual language
   ═══════════════════════════════════════════════════════════════ */

const GOLD = "#ffd700";
const AMBER = "#fbbf24";
const DIM = "rgba(255,214,140,0.55)";

const CARD: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(197,140,64,0.22)",
  background: "linear-gradient(160deg, rgba(26,15,6,0.92), rgba(12,6,2,0.97))",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,224,165,0.05)",
};

const run = (m: any, args?: any) => m(args).catch((e: any) => toast.error(String(e?.message ?? e).replace("Uncaught Error: ", "")));

function cdLabel(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.ceil((s % 3600) / 60)}m`;
  if (s >= 60) return `${Math.ceil(s / 60)}m`;
  return `${s}s`;
}

const CAT_ACCENT: Record<CatKey, string> = {
  street: "245,158,11", heists: "239,68,68", vehicles: "59,130,246",
  muscle: "156,39,39", social: "16,185,129", fronts: "168,85,247",
  economy: "234,179,8", gambling: "244,63,94", smuggling: "14,165,233",
  corruption: "148,163,184", crew: "217,119,6", prison: "100,116,139",
  espionage: "139,92,246", turf: "34,197,94", lore: "192,132,252", wild: "236,72,153",
};

/* ── One action row ── */
function ActionRow({ a, cd, onDo, busy }: { a: ActionDef; cd?: number; onDo: () => void; busy: boolean }) {
  const now = Date.now();
  const cooling = cd && cd > now;
  const locked = a.when && !window24(a.when);
  const accent = CAT_ACCENT[a.cat];
  return (
    <div
      className="rounded-xl px-3 py-2.5 transition-all hover:-translate-y-0.5"
      style={{
        border: `1px solid rgba(${accent},${cooling ? 0.1 : 0.28})`,
        background: cooling ? "rgba(0,0,0,0.35)" : `radial-gradient(ellipse 90% 70% at 20% 0%, rgba(${accent},0.08), rgba(0,0,0,0.4))`,
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl w-9 text-center" style={{ filter: cooling ? "grayscale(1)" : "none" }}>{a.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black" style={{ color: "#fde68a" }}>{a.name}</span>
            {a.cost > 0 && <span className="text-[10px] font-bold" style={{ color: "#f87171" }}>−${a.cost.toLocaleString()}</span>}
            {a.energy > 0 && <span className="text-[10px] font-bold" style={{ color: DIM }}>⚡{a.energy}</span>}
            {a.pvp && <span className="text-[9px] font-black px-1.5 rounded" style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>PVP</span>}
            {a.car && <span className="text-[9px] font-black px-1.5 rounded" style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>CAR</span>}
            {a.when && (
              <span className="text-[9px] font-black px-1.5 rounded"
                style={{ background: locked ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.2)", color: locked ? "#fca5a5" : "#86efac" }}>
                {locked ? `⏳ ${EVENT_LABEL[a.when]}` : `● LIVE ${EVENT_LABEL[a.when]}`}
              </span>
            )}
          </div>
          <div className="text-[10px] truncate" style={{ color: DIM }}>{a.desc}</div>
        </div>
        <div className="text-right shrink-0 w-24">
          <div className="text-[10px] font-bold" style={{ color: AMBER }}>
            {a.lo > 0 ? `$${a.lo.toLocaleString()}–${a.hi.toLocaleString()}` : a.heat < 0 ? "−heat" : "effect"}
          </div>
          <div className="text-[9px]" style={{ color: DIM }}>
            {cooling ? `⏱ ${cdLabel(cd! - now)}` : `${a.cd >= 3600 ? `${Math.round(a.cd / 3600)}h` : a.cd >= 60 ? `${Math.round(a.cd / 60)}m` : `${a.cd}s`} · ${100 - a.risk}%`}
          </div>
        </div>
        <button
          disabled={!!cooling || locked || busy}
          onClick={onDo}
          className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          style={{
            border: `1px solid rgba(${accent},0.5)`,
            background: `linear-gradient(160deg, rgba(${accent},0.25), rgba(0,0,0,0.6))`,
            color: GOLD,
          }}
        >
          {cooling ? "⏱" : locked ? "—" : "Do it"}
        </button>
      </div>
    </div>
  );
}

function window24(when: ActionDef["when"]): boolean {
  const d = new Date();
  switch (when) {
    case "rush": return (d.getHours() >= 7 && d.getHours() < 9) || (d.getHours() >= 16 && d.getHours() < 18);
    case "concert": return d.getMinutes() < 20;
    case "wedding": return d.getDay() === 0;
    case "grid": return d.getMinutes() >= 30 && d.getMinutes() < 50;
    default: return true;
  }
}

/* ── The page ── */
export default function Actions500Page() {
  const cooldowns = useQuery(api.actions500.getMyCooldowns) ?? {};
  const history = useQuery(api.actions500.getHistory, { limit: 15 });
  const cityFeed = useQuery(api.actions500.getCityFeed);
  const perform = useMutation(api.actions500.performAction);
  const [busy, setBusy] = useState(false);
  const [cat, setCat] = useState<CatKey>("street");
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);

  // re-render every second for countdown labels
  useMemo(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const doAction = async (key: string) => {
    setBusy(true);
    try {
      const r = await perform({ actionKey: key });
      if (r?.success) toast.success(r.text);
      else if (r) toast.error(r.text);
      setTick((x) => x + 1);
    } catch (e: any) {
      toast.error(String(e?.message ?? e).replace("Uncaught Error: ", ""));
    } finally {
      setBusy(false);
    }
  };

  const cats = Object.keys(CATEGORY_META) as CatKey[];
  const list = useMemo(() => {
    if (q.trim()) {
      const needle = q.toLowerCase();
      return ACTIONS.filter((a) => a.name.toLowerCase().includes(needle) || a.desc.toLowerCase().includes(needle)).slice(0, 40);
    }
    return ACTIONS_BY_CAT[cat] ?? [];
  }, [cat, q]);

  const meta = CATEGORY_META[cat];
  const accent = CAT_ACCENT[cat];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div style={CARD} className="p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-black tracking-wide" style={{ color: GOLD }}>
              📖 THE 500 <span style={{ color: DIM, fontSize: 12 }}>· every racket in the city</span>
            </h2>
            <div className="text-[11px]" style={{ color: DIM }}>
              500 actions · 16 trades · real cooldowns, heat, reputation and level-scaled payouts
            </div>
          </div>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search all 500…"
            className="rounded-lg px-3 py-2 text-xs font-bold w-56"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }}
          />
        </div>
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {cats.map((c) => {
            const m = CATEGORY_META[c];
            const on = c === cat && !q;
            return (
              <button key={c} onClick={() => { setCat(c); setQ(""); }}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-black transition-all hover:-translate-y-0.5"
                style={{
                  border: `1px solid rgba(${CAT_ACCENT[c]},${on ? 0.7 : 0.25})`,
                  background: on ? `rgba(${CAT_ACCENT[c]},0.18)` : "rgba(0,0,0,0.3)",
                  color: on ? GOLD : DIM,
                }}>
                {m.icon} {m.label} <span style={{ opacity: 0.6 }}>{ACTIONS_BY_CAT[c]?.length ?? 0}</span>
              </button>
            );
          })}
        </div>
        {meta && (
          <div className="mt-2 text-[11px] italic" style={{ color: `rgba(${accent},0.9)` }}>
            {meta.icon} {meta.label} — {meta.blurb}
          </div>
        )}
      </div>

      {/* Action list */}
      <div style={CARD} className="p-4">
        <div className="space-y-2">
          {list.map((a) => (
            <ActionRow key={a.key} a={a} cd={cooldowns[a.key]} onDo={() => doAction(a.key)} busy={busy} />
          ))}
          {list.length === 0 && <div className="text-xs italic p-4" style={{ color: DIM }}>Nothing matches that search.</div>}
        </div>
      </div>

      {/* Bottom: my history + city feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={CARD} className="p-4">
          <h3 className="text-sm font-black tracking-widest uppercase mb-3" style={{ color: AMBER }}>📜 My Latest Moves</h3>
          <div className="space-y-1.5">
            {(history ?? []).map((h: any) => (
              <div key={h._id} className="flex items-center gap-2 text-[11px] rounded-lg px-2.5 py-1.5"
                style={{ background: "rgba(0,0,0,0.3)", borderLeft: `3px solid ${h.success ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"}` }}>
                <span style={{ color: h.success ? "#86efac" : "#fca5a5" }}>{h.success ? "✓" : "✗"}</span>
                <span className="flex-1 truncate" style={{ color: DIM }}>{h.text}</span>
              </div>
            ))}
            {(history ?? []).length === 0 && <div className="text-[11px] italic" style={{ color: DIM }}>No moves yet. The streets are waiting.</div>}
          </div>
        </div>
        <div style={CARD} className="p-4">
          <h3 className="text-sm font-black tracking-widest uppercase mb-3" style={{ color: AMBER }}>📡 City Wire — The 500</h3>
          <div className="space-y-1.5">
            {(cityFeed ?? []).slice(0, 12).map((h: any) => (
              <div key={h._id} className="text-[11px] rounded-lg px-2.5 py-1.5 truncate" style={{ background: "rgba(0,0,0,0.3)" }}>
                <span className="font-black" style={{ color: AMBER }}>{h.playerName}</span>
                <span style={{ color: DIM }}> — {h.text}</span>
              </div>
            ))}
            {(cityFeed ?? []).length === 0 && <div className="text-[11px] italic" style={{ color: DIM }}>Quiet night in the city.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

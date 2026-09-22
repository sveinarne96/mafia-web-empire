/* eslint-disable */
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

/* ═══════════════════════════════════════════════════════════════
   ONLINE PLAYERS — full presence roster (online + offline)
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

function seen(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function PlayerRow({ p }: { p: any }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-amber-500/5"
      style={{ borderBottom: "1px solid rgba(197,140,64,0.07)" }}
    >
      {/* presence */}
      {p.online ? (
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <span className="size-2.5 shrink-0 rounded-full bg-slate-600" style={{ boxShadow: "inset 0 0 3px rgba(0,0,0,0.8)" }} />
      )}
      {/* name + level */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-black truncate" style={{ color: p.online ? "#fde68a" : "rgba(253,230,138,0.55)" }}>
          {p.name}
        </span>
        <span className="text-[9px] font-bold ml-2" style={{ color: DIM }}>Lv.{p.level}</span>
      </div>
      {/* rank */}
      <span className="hidden md:inline text-[10px] font-bold w-28 text-right" style={{ color: DIM }}>{p.rank}</span>
      {/* status chips */}
      <div className="flex justify-end gap-1 shrink-0">
        {p.inPrison && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-sky-500/15 text-sky-300">🔒 JAIL</span>}
        {p.wanted > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-red-500/15 text-red-300">🚨 {p.wanted}</span>}
        {p.family && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-amber-500/15 text-amber-300">{p.family}</span>}
      </div>
      {/* last seen */}
      <span
        className="text-[10px] font-bold w-20 text-right tabular-nums shrink-0"
        style={{ color: p.online ? "#86efac" : DIM }}
      >
        {seen(p.lastActive)}
      </span>
    </div>
  );
}

export default function PresencePage() {
  const roster = useQuery(api.statistics.getPresenceRoster);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"online" | "offline">("online");

  const online = roster?.onlinePlayers ?? [];
  const offline = roster?.offlinePlayers ?? [];
  const list = tab === "online" ? online : offline;
  const shown = q.trim()
    ? list.filter((p: any) => p.name?.toLowerCase().includes(q.toLowerCase()))
    : list;

  return (
    <div className="space-y-4">
      {/* Header + counters */}
      <div style={CARD} className="p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-black tracking-wide" style={{ color: GOLD }}>
            📡 ONLINE PLAYERS <span style={{ color: DIM, fontSize: 12 }}>· who's on the streets</span>
          </h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players…"
            className="rounded-lg px-3 py-2 text-xs font-bold w-48"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg px-3 py-2 text-center" style={{ border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.08)" }}>
            <div className="text-lg font-black text-emerald-400 tabular-nums">{roster?.onlineCount ?? "…"}</div>
            <div className="text-[9px] uppercase tracking-widest text-emerald-300/70">Online now</div>
          </div>
          <div className="rounded-lg px-3 py-2 text-center" style={{ border: "1px solid rgba(100,116,139,0.3)", background: "rgba(0,0,0,0.3)" }}>
            <div className="text-lg font-black tabular-nums" style={{ color: DIM }}>{roster ? roster.total - roster.onlineCount : "…"}</div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: DIM }}>Offline</div>
          </div>
          <div className="rounded-lg px-3 py-2 text-center" style={{ border: "1px solid rgba(197,140,64,0.25)", background: "rgba(0,0,0,0.3)" }}>
            <div className="text-lg font-black tabular-nums" style={{ color: AMBER }}>{roster?.total ?? "…"}</div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: DIM }}>Total players</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={CARD} className="p-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTab("online")}
            className="rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
            style={{
              border: `1px solid ${tab === "online" ? "rgba(34,197,94,0.6)" : "rgba(197,140,64,0.2)"}`,
              background: tab === "online" ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.3)",
              color: tab === "online" ? "#86efac" : DIM,
            }}
          >
            🟢 Online ({online.length})
          </button>
          <button
            onClick={() => setTab("offline")}
            className="rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
            style={{
              border: `1px solid ${tab === "offline" ? "rgba(197,140,64,0.6)" : "rgba(197,140,64,0.2)"}`,
              background: tab === "offline" ? "rgba(197,140,64,0.15)" : "rgba(0,0,0,0.3)",
              color: tab === "offline" ? GOLD : DIM,
            }}
          >
            ⚫ Offline ({offline.length}{roster && roster.total - roster.onlineCount > 100 ? "+" : ""})
          </button>
        </div>

        {/* Column header */}
        <div className="flex items-center gap-3 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: DIM, borderBottom: "1px solid rgba(197,140,64,0.18)" }}>
          <span className="w-2.5" />
          <span className="flex-1">Player</span>
          <span className="hidden md:inline w-28 text-right">Rank</span>
          <span className="w-20 text-right">Status</span>
          <span className="w-20 text-right">Seen</span>
        </div>

        {/* List */}
        {!roster ? (
          <div className="py-10 text-center text-sm animate-pulse" style={{ color: DIM }}>Scanning the streets…</div>
        ) : shown.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: DIM }}>
            {q ? `No players match "${q}".` : tab === "online" ? "Nobody's online right now." : "No offline players — everyone's here."}
          </div>
        ) : (
          <div>
            {shown.map((p: any) => <PlayerRow key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

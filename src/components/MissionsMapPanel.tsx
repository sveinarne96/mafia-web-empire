import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Minus, Plus, Map as MapIcon, List, X, Search, Trophy, Zap } from "lucide-react";
import {
  MISSION_TYPES, MISSION_TYPE_MAP, DISTRICTS, buildMissions,
  type MissionTypeId,
} from "@/data/missionsCatalog";
import { DISTRICT_CASH } from "@/data/empire";

// ═══════════════════════════════════════════════════════════════
// MISSIONS — full remake. Every mission type × district has its own
// live pin on the city map. Filters highlight matching missions.
// ═══════════════════════════════════════════════════════════════

const nf = (v: number) => Math.floor(v).toLocaleString();
function rewardLabel(currency: string, amount: number): string {
  switch (currency) {
    case "cash": return `$${nf(amount)}`;
    case "points": return `${nf(amount)} pts`;
    case "bullets": return `${nf(amount)} 💀`;
    case "coins": return `${nf(amount)} 🪙`;
    case "scrap": return `${nf(amount)} ⚙️`;
    case "xp": return `${nf(amount)} XP`;
    default: return nf(amount);
  }
}
function fmtClock(ms: number): string {
  if (ms <= 0) return "Ready";
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

const CURRENCY_FILTERS: [string, string][] = [
  ["all", "All rewards"], ["cash", "💵 Cash"], ["points", "⭐ Points"],
  ["bullets", "💀 Bullets"], ["coins", "🪙 Coins"], ["xp", "⚡ XP"], ["scrap", "⚙️ Scraps"],
];

type Tab = "active" | "completed";

export function MissionsMapPanel() {
  const board = useQuery(api.missionsBoard.getBoard);
  const startMission = useMutation(api.missionsBoard.startMission);
  const claimMission = useMutation(api.missionsBoard.claimMission);
  const abandonMission = useMutation(api.missionsBoard.abandonMission);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);   // district name
  const [selType, setSelType] = useState<MissionTypeId | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [view, setView] = useState<"map" | "list">("map");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rewardFilter, setRewardFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("active");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const progress = (board?.progress ?? {}) as Record<string, number>;
  const cooldowns = (board?.cooldowns ?? {}) as Record<string, number>;
  const started = (board?.started ?? {}) as Record<string, number>;
  const actionValues = (board?.actionValues ?? {}) as Record<string, number>;
  const level = board?.level ?? 1;
  const energy = board?.energy ?? 100;

  const allMissions = useMemo(() => buildMissions(progress, level), [progress, level]);

  const matchesFilter = (m: { type: string; typeDef: { currency: string; label: string }; name: string; district: string }) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (rewardFilter !== "all" && m.typeDef.currency !== rewardFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.district.toLowerCase().includes(q) && !m.typeDef.label.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const visibleMissions = allMissions.filter((m) => (tab === "completed" ? m.done : !m.done));
  const listMissions = visibleMissions.filter(matchesFilter);

  const districtStatus = useMemo(() => {
    return DISTRICTS.map((d, i) => {
      const inDistrict = allMissions.filter((m) => m.districtIdx === i);
      const doneCount = inDistrict.filter((m) => m.done).length;
      const conquered = inDistrict.length > 0 && doneCount >= 3 && d.lockLevel <= level;
      return { ...d, idx: i, missions: inDistrict, doneCount, conquered };
    });
  }, [allMissions, level]);

  if (!board) {
    return <div className="mafia-card animate-pulse rounded-2xl p-8 text-center text-muted-foreground">Loading mission board…</div>;
  }

  const sel = districtStatus.find((d) => d.name === selected) ?? null;
  const selMissions = sel ? sel.missions.filter(matchesFilter) : [];

  const start = async (key: string) => {
    setBusy(key); setMsg(null);
    try {
      const r = await startMission({ key });
      setMsg({ ok: true, text: `🎯 ${r.mission} accepted in ${r.district}! Do ${r.required}× now: ${r.hint} — then press CLAIM.` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed to start" });
    }
    setBusy(null);
  };

  const claim = async (key: string) => {
    setBusy(key); setMsg(null);
    try {
      const r = await claimMission({ key });
      if (r.conquered) setMsg({ ok: true, text: `🏆 ${r.district} CONQUERED! Empire income online!` });
      else if (r.missionDone) setMsg({ ok: true, text: `✅ Mission complete in ${r.district}! +${rewardLabel(r.currency, r.reward)} · +${nf(r.xp)} XP` });
      else setMsg({ ok: true, text: `✔ Task ${r.task}/3 — ${r.typeLabel} · +${rewardLabel(r.currency, r.reward)} · START again for task ${r.task + 1}.` });
      if (r.levelUp) setMsg({ ok: true, text: `⭐ LEVEL UP! You are now level ${r.levelUp}!` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Claim failed" });
    }
    setBusy(null);
  };

  const abandon = async (key: string) => {
    setBusy(key); setMsg(null);
    try {
      await abandonMission({ key });
      setMsg({ ok: true, text: "Mission dropped — energy is not refunded." });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };

  const pinDots = (done: number, total: number) => {
    const dots: string[] = [];
    for (let i = 0; i < 3; i++) dots.push(i < done ? "●" : "○");
    return dots.join("");
  };

  return (
    <div className="mafia-card space-y-0 overflow-hidden rounded-2xl border border-cyan-500/20">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/40 via-slate-950/60 to-fuchsia-950/30 px-4 py-3">
        <span className="text-lg">🗺️</span>
        <span className="text-sm font-black tracking-wide text-cyan-300">SHADOW CITY OPERATIONS MAP</span>
        <span className="hidden text-[9px] font-bold uppercase tracking-widest text-cyan-400/50 md:inline">
          {allMissions.filter((m) => !m.done).length} active missions · {MISSION_TYPES.length} types × {DISTRICTS.length} districts
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search missions…"
              className="w-36 rounded-lg border border-slate-700/50 bg-slate-900/60 py-1 pl-7 pr-2 text-[10px] text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none md:w-48" />
          </div>
          <button onClick={() => setView("map")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black ${view === "map" ? "border border-cyan-400/40 bg-cyan-500/25 text-cyan-300" : "text-slate-400 hover:text-white"}`}><MapIcon className="size-3" /> Map</button>
          <button onClick={() => setView("list")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black ${view === "list" ? "border border-cyan-400/40 bg-cyan-500/25 text-cyan-300" : "text-slate-400 hover:text-white"}`}><List className="size-3" /> List</button>
          <div className="mx-1 h-4 w-px bg-slate-700/60" />
          <button onClick={() => setZoom((z) => Math.max(0.7, Math.round((z - 0.15) * 100) / 100))} className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-1.5 text-slate-300 hover:text-white"><Minus className="size-3" /></button>
          <span className="w-9 text-center font-mono text-[9px] text-slate-500">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.15) * 100) / 100))} className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-1.5 text-slate-300 hover:text-white"><Plus className="size-3" /></button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-2 border-b border-cyan-500/10 bg-slate-950/50 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Type:</span>
          <button onClick={() => setTypeFilter("all")} className={`rounded px-2 py-0.5 text-[9px] font-bold ${typeFilter === "all" ? "bg-cyan-500/25 text-cyan-300" : "text-slate-500 hover:text-slate-300"}`}>All</button>
          {MISSION_TYPES.map((t) => (
            <button key={t.id} onClick={() => setTypeFilter(typeFilter === t.id ? "all" : t.id)}
              className={`rounded px-2 py-0.5 text-[9px] font-bold transition-all ${typeFilter === t.id ? "scale-105 text-white" : "text-slate-500 hover:text-slate-300"}`}
              style={typeFilter === t.id ? { background: `${t.color}30`, border: `1px solid ${t.color}90`, boxShadow: `0 0 8px ${t.color}40` } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Reward:</span>
          {CURRENCY_FILTERS.map(([id, label]) => (
            <button key={id} onClick={() => setRewardFilter(id)}
              className={`rounded px-2 py-0.5 text-[9px] font-bold ${rewardFilter === id ? "border border-amber-400/40 bg-amber-500/25 text-amber-300" : "text-slate-500 hover:text-slate-300"}`}>{label}</button>
          ))}
          {(typeFilter !== "all" || rewardFilter !== "all" || search) && (
            <button onClick={() => { setTypeFilter("all"); setRewardFilter("all"); setSearch(""); }} className="flex items-center gap-0.5 rounded px-2 py-0.5 text-[9px] font-bold text-rose-400 hover:text-rose-300"><X className="size-2.5" /> Clear</button>
          )}
        </div>
      </div>

      {/* ── Tabs + player stats ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/60 px-4 py-2">
        <button onClick={() => setTab("active")} className={`rounded-t-lg border-x border-t px-3 py-1 text-[10px] font-black ${tab === "active" ? "border-cyan-400/30 bg-cyan-500/20 text-cyan-300" : "text-slate-500"}`}>Active</button>
        <button onClick={() => setTab("completed")} className={`rounded-t-lg border-x border-t px-3 py-1 text-[10px] font-black ${tab === "completed" ? "border-green-400/30 bg-green-500/20 text-green-300" : "text-slate-500"}`}>Completed ({allMissions.filter((m) => m.done).length})</button>
        <div className="ml-auto flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2 py-1 font-bold text-cyan-300"><Zap className="size-3" /> {Math.floor(energy)} energy</span>
          <span className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/30 px-2 py-1 font-bold text-amber-300"><Trophy className="size-3" /> {board.stats.completed} done</span>
          <span className="rounded-lg border border-slate-700/50 bg-slate-900/50 px-2 py-1 font-bold text-slate-400">Lv.{level}</span>
        </div>
      </div>

      {view === "map" && (
        <div className="relative overflow-hidden" style={{ height: 480 }}>
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              const startX = e.clientX - pan.x, startY = e.clientY - pan.y;
              const move = (ev: MouseEvent) => setPan({ x: ev.clientX - startX, y: ev.clientY - startY });
              const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
            }}
          >
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s" }} className="relative size-full bg-gradient-to-br from-[#071018] via-[#0a1628] to-[#05080f]">
              {/* grid + roads */}
              <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
                {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1="0" y1={`${(i + 1) * 8.3}%`} x2="100%" y2={`${(i + 1) * 8.3}%`} stroke="rgba(34,211,238,0.05)" />)}
                {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={`${(i + 1) * 7.1}%`} y1="0" x2={`${(i + 1) * 7.1}%`} y2="100%" stroke="rgba(34,211,238,0.05)" />)}
                {districtStatus.map((d, i) => {
                  const next = districtStatus[(i + 1) % districtStatus.length];
                  return <line key={`r${i}`} x1={`${d.x}%`} y1={`${d.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke="rgba(251,191,36,0.08)" strokeWidth="2" strokeDasharray="6 5" />;
                })}
              </svg>

              {/* district labels */}
              {districtStatus.map((d) => (
                <div key={d.name} className="absolute -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/70 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-slate-400"
                  style={{ left: `${d.x}%`, top: `${d.y - 9.5}%` }}>
                  {d.name.toUpperCase()} <span className={d.conquered ? "text-green-400" : "text-slate-600"}>{d.conquered ? "🏆" : `🔒Lv.${d.lockLevel}`}</span>
                </div>
              ))}

              {/* ── EVERY MISSION IS A PIN (2 rings of 8) ── */}
              {visibleMissions.map((m) => {
                const d = DISTRICTS[m.districtIdx];
                const ti = MISSION_TYPES.findIndex((t) => t.id === m.type);
                const ring = ti < 8 ? 0 : 1;
                const angle = ((ti % 8) / 8) * Math.PI * 2 + (ring ? Math.PI / 8 : 0);
                const orbit = ring === 0 ? 2.6 : 4.4;
                const px = d.x + Math.cos(angle) * orbit;
                const py = d.y + Math.sin(angle) * orbit * 0.85;
                const isHl = matchesFilter(m);
                const isSel = selected === m.district && selType === m.type;
                const cdLeft = (cooldowns[m.key] ?? 0) - now;
                const onCd = cdLeft > 0;
                return (
                  <button key={m.key}
                    onClick={() => { setSelected(m.district); setSelType(m.type); }}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${px}%`, top: `${py}%`, opacity: isHl ? 1 : 0.22 }}
                    title={`${m.name} — ${m.district}`}>
                    <motion.div whileHover={{ scale: 1.25 }} className="relative flex flex-col items-center">
                      {isSel && <span className="absolute -inset-1.5 animate-ping rounded-full border-2" style={{ borderColor: m.typeDef.color }} />}
                      <div className={`flex size-6 items-center justify-center rounded-full border text-[11px] leading-none transition-all ${m.done ? "border-green-400 bg-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.6)]" : onCd ? "border-slate-600 bg-slate-800/90 opacity-70" : "border-slate-500/60 bg-slate-900/90 hover:scale-110"}`}
                        style={!m.done && !onCd ? { borderColor: `${m.typeDef.color}aa`, boxShadow: isHl ? `0 0 9px ${m.typeDef.color}80` : undefined } : {}}>
                        {m.done ? "✓" : m.typeDef.icon}
                      </div>
                    </motion.div>
                  </button>
                );
              })}

              {/* legend */}
              <div className="absolute bottom-2 left-2 flex max-w-[60%] flex-wrap gap-x-2 gap-y-0.5 rounded-lg bg-black/50 p-1.5 backdrop-blur">
                {MISSION_TYPES.map((t) => (
                  <span key={t.id} className="flex items-center gap-1 text-[7.5px] font-bold text-slate-400">
                    <span className="inline-block size-1.5 rounded-full" style={{ background: t.color }} />{t.label}
                  </span>
                ))}
              </div>

              {!selected && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="rounded-2xl border border-cyan-400/20 bg-black/70 px-6 py-4 text-center backdrop-blur">
                    <div className="text-base font-black text-cyan-300">Welcome to Strategy</div>
                    <div className="mt-1 text-[10px] text-cyan-100/60">160 missions live — click any pin to start</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Selection panel ── */}
          {sel && (
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="absolute bottom-2 right-2 top-2 z-20 w-80 overflow-y-auto rounded-xl border border-cyan-400/30 bg-slate-950/95 p-4 backdrop-blur">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-black text-white">🏙️ {sel.name}</div>
                  <div className="text-[9px] text-slate-500">{sel.tagline} · Police: {sel.police}</div>
                </div>
                <button onClick={() => { setSelected(null); setSelType(null); }} className="text-slate-500 hover:text-white"><X className="size-4" /></button>
              </div>
              <div className="mb-3 flex items-center gap-2 text-[10px]">
                <span className="rounded bg-green-950/40 px-1.5 py-0.5 font-bold text-green-400">✓ {sel.doneCount}/16 missions done</span>
                {sel.conquered ? <span className="rounded bg-amber-950/40 px-1.5 py-0.5 font-bold text-amber-300">🏆 District conquered</span> : <span className="text-slate-500">Conquer: finish 3 different mission types</span>}
                <span className="ml-auto text-slate-500">{nf(DISTRICT_CASH[sel.idx] ?? 15000)}/day</span>
              </div>
              <div className="space-y-1.5">
                {selMissions.map((m) => {
                  const cdLeft = (cooldowns[m.key] ?? 0) - now;
                  const onCd = cdLeft > 0;
                  const locked = level < m.lockLevel && !m.done;
                  const noEnergy = energy < m.typeDef.energy;
                  const isSel = selType === m.type;
                  const isStarted = !!started[m.key];
                  const base = board?.actions?.[m.key] ?? 0;
                  const current = actionValues[m.typeDef.action] ?? 0;
                  const delta = Math.max(0, current - base);
                  const ready = isStarted && delta >= m.typeDef.required;
                  const pct = Math.min(100, Math.round((delta / m.typeDef.required) * 100));
                  return (
                    <div key={m.key} className={`rounded-lg border p-2.5 transition-all ${isSel ? "border-cyan-400/50 bg-cyan-950/20" : m.done ? "border-green-500/30 bg-green-950/10" : isStarted ? "border-amber-500/40 bg-amber-950/10" : "border-slate-700/50 bg-slate-900/50"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.done ? "✅" : isStarted ? "🎯" : m.typeDef.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-bold text-white">{m.name}</div>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                            <span style={{ color: m.typeDef.color }}>{m.typeDef.label}</span>
                            <span>·</span>
                            <span className={m.done ? "text-green-400" : "text-amber-400"}>+{rewardLabel(m.typeDef.currency, m.reward)}</span>
                            <span>·</span>
                            <span>{m.typeDef.energy}⚡</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!m.done && !isStarted && (
                            <button disabled={busy === m.key || locked || onCd || noEnergy} onClick={() => start(m.key)}
                              className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black disabled:opacity-40 ${locked || onCd || noEnergy ? "bg-slate-700 text-slate-400" : "bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:brightness-110"}`}>
                              {locked ? `🔒Lv${m.lockLevel}` : onCd ? fmtClock(cdLeft) : noEnergy ? "NO ⚡" : busy === m.key ? "…" : "▶ START"}
                            </button>
                          )}
                          {isStarted && !m.done && (
                            <button disabled={busy === m.key} onClick={() => claim(m.key)}
                              className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black disabled:opacity-40 ${ready ? "bg-green-500 text-black hover:brightness-110" : "bg-slate-700 text-slate-300"}`}>
                              {ready ? "✓ CLAIM" : `${delta}/${m.typeDef.required}`}
                            </button>
                          )}
                          {m.done && <span className="rounded bg-green-900/40 px-2 py-1 text-[9px] font-black text-green-400">DONE</span>}
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full" style={{ width: `${(m.progress / 3) * 100}%`, background: m.typeDef.color }} />
                        </div>
                        <span className="text-[8px] font-bold text-slate-500">{m.progress}/3 {pinDots(m.progress, 3)}</span>
                      </div>
                    </div>
                  );
                })}
                {selMissions.length === 0 && <div className="py-6 text-center text-[10px] text-slate-500">No missions match your filters in this district.</div>}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div className="grid max-h-[560px] gap-2 overflow-y-auto p-4 md:grid-cols-2 xl:grid-cols-3">
          {listMissions.map((m) => {
            const cdLeft = (cooldowns[m.key] ?? 0) - now;
            const onCd = cdLeft > 0;
            const locked = level < m.lockLevel && !m.done;
            const isStarted = !!started[m.key];
            const base = board?.actions?.[m.key] ?? 0;
            const current = actionValues[m.typeDef.action] ?? 0;
            const delta = Math.max(0, current - base);
            const ready = isStarted && delta >= m.typeDef.required;
            return (
              <div key={m.key} className={`rounded-xl border p-3 ${m.done ? "border-green-500/30 bg-green-950/10" : isStarted ? "border-amber-500/40 bg-amber-950/10" : "border-slate-700/50 bg-slate-900/40"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.done ? "✅" : isStarted ? "🎯" : m.typeDef.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-black text-white">{m.name}</div>
                    <div className="text-[9px] text-slate-500">{m.district} · <span style={{ color: m.typeDef.color }}>{m.typeDef.label}</span></div>
                  </div>
                  {!m.done && !isStarted && (
                    <button disabled={busy === m.key || locked || onCd || energy < m.typeDef.energy} onClick={() => start(m.key)}
                      className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black disabled:opacity-40 ${locked || onCd ? "bg-slate-700 text-slate-400" : "bg-gradient-to-r from-cyan-500 to-blue-500 text-black"}`}>
                      {locked ? `🔒Lv${m.lockLevel}` : onCd ? fmtClock(cdLeft) : "▶ START"}
                    </button>
                  )}
                  {isStarted && !m.done && (
                    <button disabled={busy === m.key} onClick={() => claim(m.key)}
                      className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black ${ready ? "bg-green-500 text-black" : "bg-slate-700 text-slate-300"}`}>
                      {ready ? "✓ CLAIM" : `${delta}/${m.typeDef.required}`}
                    </button>
                  )}
                  {m.done && <span className="text-[9px] font-black text-green-400">DONE</span>}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-500">
                  <span className="font-bold text-amber-400">+{rewardLabel(m.typeDef.currency, m.reward)}</span>
                  <span>· {m.typeDef.energy}⚡</span>
                  <span>· {m.typeDef.cooldownMin}m cd</span>
                  <span>· needs {m.typeDef.required}× {m.typeDef.where}</span>
                  <span className="ml-auto">{m.progress}/3</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full" style={{ width: `${(m.progress / 3) * 100}%`, background: m.typeDef.color }} />
                </div>
              </div>
            );
          })}
          {listMissions.length === 0 && <div className="col-span-full py-8 text-center text-xs text-slate-500">No missions match — clear your filters.</div>}
        </div>
      )}

      {msg && (
        <div className={`mx-4 mb-3 rounded-xl border px-3 py-2 text-xs font-bold ${msg.ok ? "border-green-500/30 bg-green-950/30 text-green-400" : "border-rose-500/30 bg-rose-950/30 text-rose-400"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}

// Re-export type for consumers
export type { MissionTypeId };

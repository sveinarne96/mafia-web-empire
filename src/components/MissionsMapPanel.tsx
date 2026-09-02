import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Minus, Plus, Map as MapIcon, List, X } from "lucide-react";
import { EMPIRE_DISTRICTS, DISTRICT_CASH } from "@/data/empire";

// ═══════════════════════════════════════════════════════════════
// MISSIONS MAP — interactive city map with districts & task types
// ═══════════════════════════════════════════════════════════════

const DISTRICT_POS: Record<string, { x: number; y: number }> = {
  "Little Italy": { x: 28, y: 62 },
  "Chinatown": { x: 52, y: 74 },
  "Industrial Docks": { x: 14, y: 86 },
  "Downtown Core": { x: 46, y: 44 },
  "Harbor Point": { x: 74, y: 82 },
  "The Strip": { x: 78, y: 26 },
  "Garment District": { x: 24, y: 30 },
  "Old Town": { x: 62, y: 58 },
  "Financial Quarter": { x: 40, y: 18 },
  "Nightlife Row": { x: 88, y: 52 },
};

const TASK_TYPES = [
  { id: "crime", label: "Commit Crimes", icon: "🔪", color: "#ef4444", desc: "Run street-level crimes in the district" },
  { id: "heist", label: "Commit Heists", icon: "🎯", color: "#a855f7", desc: "Pull high-value heists with your crew" },
  { id: "melt", label: "Melt Bullets", icon: "🔥", color: "#f97316", desc: "Melt bullets for XP and rewards" },
  { id: "buybullets", label: "Buy Bullets", icon: "🔫", color: "#eab308", desc: "Stock up on ammo from the dealer" },
  { id: "gta", label: "Steal Cars", icon: "🚗", color: "#22d3ee", desc: "Boost vehicles off the street" },
  { id: "rarecar", label: "Steal Rare Cars", icon: "💎", color: "#38bdf8", desc: "Hunt legendary rides" },
  { id: "repair", label: "Repair Rare Cars", icon: "🔧", color: "#34d399", desc: "Restore wrecks to showroom state" },
  { id: "bank", label: "Earn Bank Interest", icon: "🏦", color: "#4ade80", desc: "Let your bank balance work for you" },
  { id: "casino", label: "Casino Grind", icon: "🎰", color: "#fbbf24", desc: "Play the tables in the district" },
  { id: "smuggle", label: "Run Supplies", icon: "📦", color: "#f472b6", desc: "Move contraband between cities" },
  { id: "assassin", label: "Contract Kills", icon: "💀", color: "#f43f5e", desc: "Take out marked targets" },
  { id: "empire", label: "Empire Expansion", icon: "👑", color: "#fbbf24", desc: "Buy property and extend influence" },
];

const TYPE_FILTERS = TASK_TYPES.map((t) => t.id);

// Deterministic per-district task mix (3 tasks per district)
function districtTasks(districtIdx: number, progress: number) {
  const seed = districtIdx * 7 + progress;
  const a = (seed * 9301 + 49297) % 233280;
  const t1 = TASK_TYPES[Math.floor((a / 233280) * TASK_TYPES.length)];
  const b = (seed * 4243 + 12345) % 233280;
  const t2 = TASK_TYPES[(TASK_TYPES.indexOf(t1) + 1 + Math.floor((b / 233280) * (TASK_TYPES.length - 1))) % TASK_TYPES.length];
  return [t1, t2, TASK_TYPES[(TASK_TYPES.indexOf(t2) + 3) % TASK_TYPES.length]];
}

function fmt(n: number) {
  return "$" + Math.floor(n).toLocaleString();
}

export function MissionsMapPanel() {
  const empire = useQuery(api.empireSystem.getEmpire);
  const player = useQuery(api.game.getPlayer);
  const doTask = useMutation(api.empireSystem.completeDistrictTask);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [view, setView] = useState<"map" | "list">("map");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rewardFilter, setRewardFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const progress = (empire?.progress ?? {}) as Record<string, number>;
  const districtsCompleted = empire?.districtsCompleted ?? 0;
  const level = player?.level ?? 1;

  const highlighted = useMemo(() => {
    if (typeFilter === "all") return null;
    return EMPIRE_DISTRICTS.filter((_, i) => districtTasks(i, progress[EMPIRE_DISTRICTS[i]] ?? 0).some((t) => t.id === typeFilter));
  }, [typeFilter, progress]);

  const run = async (district: string) => {
    setBusy(district); setMsg(null);
    try {
      const r = await doTask({ district });
      setMsg({ ok: true, text: r.conquered ? `🏆 ${district} CONQUERED! It now pays daily empire income!` : `✔ Task ${r.task}/3 complete in ${district} · +${fmt(r.reward)}` });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Task failed" });
    }
    setBusy(null);
  };

  if (!empire) return <div className="animate-pulse py-8 text-center text-muted-foreground">Loading mission map…</div>;

  const selIdx = selected ? EMPIRE_DISTRICTS.indexOf(selected) : -1;
  const selTasks = selIdx >= 0 ? districtTasks(selIdx, progress[selected!] ?? 0) : [];
  const selProg = selIdx >= 0 ? (progress[selected!] ?? 0) : 0;

  const visibleDistricts = EMPIRE_DISTRICTS.filter((d) => {
    if (activeTab === "completed") return (progress[d] ?? 0) >= 3;
    return true;
  });

  return (
    <div className="mafia-card rounded-2xl border border-cyan-500/20 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/30 via-slate-950/40 to-cyan-950/30">
        <span className="text-lg">🗺️</span>
        <span className="text-sm font-black text-cyan-300 tracking-wide">MISSIONS MAP</span>
        <span className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-widest hidden md:inline">Strategy · Shadow City</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setView("map")} className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${view === "map" ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"}`}><MapIcon className="size-3" /> Map</button>
          <button onClick={() => setView("list")} className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${view === "list" ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"}`}><List className="size-3" /> List</button>
          <div className="w-px h-4 bg-slate-700/60 mx-1" />
          <button onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))} className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white"><Minus className="size-3" /></button>
          <span className="text-[9px] font-mono text-slate-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))} className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white"><Plus className="size-3" /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2.5 border-b border-cyan-500/10 bg-slate-950/40 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Mission type:</span>
          <button onClick={() => setTypeFilter("all")} className={`px-2 py-0.5 rounded text-[9px] font-bold ${typeFilter === "all" ? "bg-cyan-500/25 text-cyan-300" : "text-slate-500 hover:text-slate-300"}`}>All types</button>
          {TASK_TYPES.slice(0, 8).map((t) => (
            <button key={t.id} onClick={() => setTypeFilter(typeFilter === t.id ? "all" : t.id)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${typeFilter === t.id ? "text-white scale-105" : "text-slate-500 hover:text-slate-300"}`}
              style={typeFilter === t.id ? { background: `${t.color}30`, border: `1px solid ${t.color}80` } : {}}>
              {t.icon} {t.label.replace("Commit ", "").replace("Earn ", "").replace("Steal ", "")}
            </button>
          ))}
          {(typeFilter !== "all" || rewardFilter !== "all") && (
            <button onClick={() => { setTypeFilter("all"); setRewardFilter("all"); }} className="px-2 py-0.5 rounded text-[9px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-0.5"><X className="size-2.5" /> Clear</button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Reward:</span>
          {[["all", "All rewards"], ["cash", "💵 Cash"], ["points", "⭐ Points"], ["bullets", "💀 Bullets"], ["xp", "⚡ XP"]].map(([id, label]) => (
            <button key={id} onClick={() => setRewardFilter(id)} className={`px-2 py-0.5 rounded text-[9px] font-bold ${rewardFilter === id ? "bg-amber-500/25 text-amber-300 border border-amber-400/40" : "text-slate-500 hover:text-slate-300"}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Active / completed tabs */}
      <div className="flex gap-1 px-4 pt-2.5">
        <button onClick={() => setActiveTab("active")} className={`px-3 py-1 rounded-t-lg text-[10px] font-black ${activeTab === "active" ? "bg-cyan-500/20 text-cyan-300 border-t border-x border-cyan-400/30" : "text-slate-500"}`}>Active</button>
        <button onClick={() => setActiveTab("completed")} className={`px-3 py-1 rounded-t-lg text-[10px] font-black ${activeTab === "completed" ? "bg-green-500/20 text-green-300 border-t border-x border-green-400/30" : "text-slate-500"}`}>Completed ({districtsCompleted})</button>
      </div>

      {/* MAP VIEW */}
      {view === "map" && (
        <div className="relative overflow-hidden" style={{ height: 420 }}>
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              const startX = e.clientX - pan.x, startY = e.clientY - pan.y;
              const move = (ev: MouseEvent) => setPan({ x: ev.clientX - startX, y: ev.clientY - startY });
              const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
            }}
          >
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", width: "100%", height: "100%", transition: "transform 0.15s" }}
              className="relative bg-gradient-to-br from-[#071018] via-[#0a1628] to-[#05080f]">
              {/* city grid */}
              <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
                {Array.from({ length: 12 }, (_, i) => (
                  <line key={`h${i}`} x1="0" y1={`${(i + 1) * 8.3}%`} x2="100%" y2={`${(i + 1) * 8.3}%`} stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
                ))}
                {Array.from({ length: 14 }, (_, i) => (
                  <line key={`v${i}`} x1={`${(i + 1) * 7.1}%`} y1="0" x2={`${(i + 1) * 7.1}%`} y2="100%" stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
                ))}
                {/* roads between districts */}
                {EMPIRE_DISTRICTS.map((d, i) => {
                  const next = EMPIRE_DISTRICTS[(i + 1) % EMPIRE_DISTRICTS.length];
                  const a = DISTRICT_POS[d], b = DISTRICT_POS[next];
                  if (!a || !b) return null;
                  return <line key={`r${i}`} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="rgba(251,191,36,0.1)" strokeWidth="2" strokeDasharray="6 4" />;
                })}
              </svg>

              {/* district pins */}
              {visibleDistricts.map((d) => {
                const pos = DISTRICT_POS[d];
                if (!pos) return null;
                const prog = progress[d] ?? 0;
                const conquered = prog >= 3;
                const idx = EMPIRE_DISTRICTS.indexOf(d);
                const tasks = districtTasks(idx, prog);
                const isHl = highlighted === null || highlighted.includes(d);
                const isSel = selected === d;
                const lockLevel = 5 + idx * 3;
                const locked = level < lockLevel && !conquered;
                return (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.15 }}
                    onClick={() => setSelected(isSel ? null : d)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: isHl ? 1 : 0.25 }}
                  >
                    <div className={`relative flex flex-col items-center ${isSel ? "z-30" : ""}`}>
                      {conquered && <span className="absolute -top-1 -right-1 text-xs">🏆</span>}
                      {locked && <span className="absolute -top-1 -right-1 text-xs">🔒</span>}
                      <div className={`size-9 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                        conquered ? "bg-green-500/30 border-green-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]"
                        : locked ? "bg-slate-800/80 border-slate-600"
                        : prog > 0 ? "bg-amber-500/25 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        : "bg-cyan-500/20 border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                      }`}>
                        {conquered ? "✅" : locked ? "—" : tasks[prog]?.icon ?? "🏙️"}
                      </div>
                      <div className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-black whitespace-nowrap ${
                        isSel ? "bg-cyan-400 text-black" : conquered ? "bg-green-900/80 text-green-300" : "bg-slate-900/85 text-slate-300"
                      }`}>{d}</div>
                    </div>
                  </motion.button>
                );
              })}

              {/* Welcome overlay when nothing selected */}
              {!selected && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="rounded-2xl bg-black/70 backdrop-blur px-6 py-4 border border-cyan-400/20 text-center">
                    <div className="text-base font-black text-cyan-300">Welcome to Strategy</div>
                    <div className="text-[10px] text-cyan-100/60 mt-1">Select a district on the map to start a mission</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selection panel */}
          {selected && selIdx >= 0 && (
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="absolute right-2 top-2 bottom-2 w-72 rounded-xl bg-slate-950/95 border border-cyan-400/30 p-4 overflow-y-auto z-20 backdrop-blur">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-black text-white">🏙️ {selected}</div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X className="size-4" /></button>
              </div>
              <div className="text-[10px] text-slate-400 mb-3">
                Daily income when conquered: <span className="text-green-400 font-bold">{fmt(DISTRICT_CASH[selIdx] ?? 15000)}/day</span>
                {selProg >= 3 && <span className="text-green-400 font-bold"> · ✅ CONQUERED</span>}
              </div>
              {selProg < 3 ? (
                <>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Task {selProg + 1} of 3</div>
                  {selTasks.slice(selProg).map((t) => (
                    <div key={t.id} className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-2.5 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{t.icon}</span>
                        <div>
                          <div className="text-[11px] font-bold text-white">{t.label}</div>
                          <div className="text-[9px] text-slate-500">{t.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button disabled={busy === selected || level < (5 + selIdx * 3)}
                    onClick={() => run(selected!)}
                    className="mt-2 w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-black hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed">
                    {level < (5 + selIdx * 3) ? `🔒 Requires Lv.${5 + selIdx * 3}` : busy === selected ? "Working…" : `Execute Task ${selProg + 1} — ${selTasks[selProg]?.label}`}
                  </button>
                  <div className="text-[9px] text-slate-500 mt-1.5 text-center">Costs 15 energy · +250 XP per task</div>
                </>
              ) : (
                <div className="rounded-lg bg-green-950/30 border border-green-500/30 p-3 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs font-black text-green-400">District Conquered</div>
                  <div className="text-[10px] text-green-300/70 mt-0.5">This district pays daily empire income</div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="p-4 grid gap-2 md:grid-cols-2">
          {visibleDistricts.map((d) => {
            const idx = EMPIRE_DISTRICTS.indexOf(d);
            const prog = progress[d] ?? 0;
            const tasks = districtTasks(idx, prog);
            const conquered = prog >= 3;
            const lockLevel = 5 + idx * 3;
            return (
              <div key={d} className={`rounded-xl border p-3 ${conquered ? "border-green-500/40 bg-green-950/20" : (highlighted === null || highlighted.includes(d)) ? "border-slate-700/50 bg-slate-900/40" : "border-slate-800/30 bg-slate-900/20 opacity-40"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-black text-white">{conquered ? "🏆" : "🏙️"} {d}</div>
                  <div className="text-[9px] text-slate-500">{fmt(DISTRICT_CASH[idx] ?? 15000)}/day</div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {tasks.map((t, i) => (
                    <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${i < prog ? "bg-green-500/20 text-green-400 line-through" : "bg-slate-800/80 text-slate-400"}`}>{t.icon} {t.label}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full" style={{ width: `${(prog / 3) * 100}%` }} />
                  </div>
                  <button disabled={conquered || busy === d || level < lockLevel} onClick={() => run(d)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[9px] font-black disabled:opacity-40">
                    {conquered ? "✅" : level < lockLevel ? `Lv.${lockLevel}` : busy === d ? "…" : "GO"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {msg && <div className={`mx-4 mb-3 rounded-xl px-3 py-2 text-xs font-bold border ${msg.ok ? "bg-green-950/30 border-green-500/30 text-green-400" : "bg-rose-950/30 border-rose-500/30 text-rose-400"}`}>{msg.ok ? "✅ " : "⚠️ "}{msg.text}</div>}
    </div>
  );
}

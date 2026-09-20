import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Command } from "cmdk";
import { Search, Sparkles, Terminal, Radio } from "lucide-react";
import { LEFT_MENU_SECTIONS, RIGHT_MENU_SECTIONS } from "@/data/menuSections";

/* ══════════════════════════════════════════════════════════════
   EMPIRE TOP BAR — cinematic HUD with:
   · gold vitals row (life / energy / xp with animated bars)
   · resource chips (cash, bank, points, coins, bullets, atk/def)
   · crime rail cards with live cooldown rings
   · scrolling live city ticker (kill feed + casino wire)
   · ambient ember layer (toggleable)
   · ⌘K command palette across every page
   ══════════════════════════════════════════════════════════════ */

const RING_C = 2 * Math.PI * 15; // circumference for r=15

type Op = {
  icon: string;
  label: string;
  desc: string;
  page: string;
  cd: number; // seconds
  rgb: string;
  section: "street" | "major";
};

const OPS: Op[] = [
  { icon: "🔪", label: "Street", desc: "Quick hit · low profile", page: "crime_street", cd: 45, rgb: "52,211,153", section: "street" },
  { icon: "💰", label: "Robbery", desc: "High payout · heat rises", page: "crime_robbery", cd: 120, rgb: "239,68,68", section: "street" },
  { icon: "🃏", label: "Fraud", desc: "Work the mark · no trail", page: "crime_fraud", cd: 180, rgb: "234,179,8", section: "street" },
  { icon: "🏠", label: "Burglary", desc: "Quiet entry · clean exit", page: "crime_burglary", cd: 240, rgb: "249,115,22", section: "street" },
  { icon: "💊", label: "Drugs", desc: "Move product · watch heat", page: "crime_drugs", cd: 300, rgb: "168,85,247", section: "street" },
  { icon: "🕵️", label: "Organized", desc: "Crew pressure · big return", page: "crime_organized", cd: 600, rgb: "59,130,246", section: "street" },
  { icon: "🕳️", label: "Underground", desc: "Off-grid · slow setup", page: "crime_underground", cd: 900, rgb: "148,163,184", section: "street" },
  { icon: "🚗", label: "GTA", desc: "Take the wheel · deliver", page: "car_theft", cd: 180, rgb: "220,38,38", section: "major" },
  { icon: "🏠", label: "Burglarize", desc: "Case the house · lift loot", page: "steal_house", cd: 240, rgb: "225,29,72", section: "major" },
  { icon: "🎭", label: "Org Crime", desc: "Coordinate · split the take", page: "organized_crime", cd: 900, rgb: "147,51,234", section: "major" },
  { icon: "💀", label: "Murder", desc: "Lethal contract · exposure", page: "murder", cd: 1800, rgb: "185,28,28", section: "major" },
  { icon: "💰", label: "Heist", desc: "Build the plan · big score", page: "heist", cd: 3600, rgb: "245,158,11", section: "major" },
];

const CD_KEY = "empireOpCooldowns";

function loadCooldowns(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(CD_KEY) || "{}"); } catch { return {}; }
}
function saveCooldowns(map: Record<string, number>) {
  try { localStorage.setItem(CD_KEY, JSON.stringify(map)); } catch {}
}

function fmtCountdown(s: number): string {
  if (s <= 0) return "READY";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}m ${String(r).padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${String(m % 60).padStart(2, "0")}m`;
}

function CooldownRing({ fraction, rgb }: { fraction: number; rgb: string }) {
  return (
    <svg className="ring" viewBox="0 0 36 36">
      <circle className="track" cx="18" cy="18" r="15" />
      <circle
        className="bar"
        cx="18" cy="18" r="15"
        stroke={`rgb(${rgb})`}
        strokeDasharray={RING_C}
        strokeDashoffset={RING_C * (1 - Math.min(1, Math.max(0, fraction)))}
        style={{ color: `rgb(${rgb})` }}
      />
    </svg>
  );
}

/* ————— Live ticker: kill feed + casino wire + city chatter ————— */
function CityTicker() {
  const deaths = useQuery(api.statistics.getRecentDeaths, { limit: 10 });
  const casinoEvents = useQuery(api.casinoSystem.getCasinoEvents);
  const onlineCount = useQuery(api.admin.getOnlineCount);

  const items = useMemo(() => {
    const out: { icon: string; text: string; cls: string }[] = [];
    for (const d of deaths ?? []) {
      out.push({ icon: "💀", text: `${d.killer} took down ${d.victim}`, cls: "text-red-300" });
    }
    for (const e of casinoEvents ?? []) {
      out.push({ icon: "🎰", text: e.message, cls: "text-amber-200" });
    }
    if (onlineCount !== undefined) {
      out.push({ icon: "🟢", text: `${onlineCount} players walking the streets right now`, cls: "text-emerald-300" });
    }
    out.push({ icon: "📣", text: "New: ⌘K command palette — jump to any page instantly", cls: "text-cyan-200" });
    out.push({ icon: "🎁", text: "Daily match game resets every 15 minutes — free prizes", cls: "text-fuchsia-200" });
    return out;
  }, [deaths, casinoEvents, onlineCount]);

  if (items.length === 0) return null;

  return (
    <div className="empire-ticker h-7 flex items-center">
      <span className="shrink-0 z-10 px-2.5 flex items-center gap-1.5 text-[8px] font-black tracking-[0.2em] uppercase text-amber-300 border-r border-amber-500/20 h-full"
        style={{ background: "rgba(0,0,0,0.4)" }}>
        <Radio className="size-2.5 animate-pulse text-red-400" /> City Wire
      </span>
      <div className="flex-1 overflow-hidden">
        <div className="empire-ticker-track text-[10px]">
          {[...items, ...items].map((it, i) => (
            <span key={i} className={`inline-flex items-center gap-1.5 font-semibold ${it.cls}`}>
              <span>{it.icon}</span>{it.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ————— Command palette (⌘K) ————— */
function CommandPalette({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (p: string) => void }) {
  const [search, setSearch] = useState("");
  const pages = useMemo(() => {
    const out: { label: string; page: string; icon: string; group: string }[] = [];
    for (const s of LEFT_MENU_SECTIONS) for (const i of s.items) out.push({ label: i.label, page: i.page, icon: i.icon, group: s.title });
    for (const s of RIGHT_MENU_SECTIONS) for (const i of s.items) out.push({ label: i.label, page: i.page, icon: i.icon, group: s.title });
    for (const o of OPS) out.push({ label: o.label, page: o.page, icon: o.icon, group: "Quick Action" });
    // dedupe by page, keep first
    const seen = new Set<string>();
    return out.filter((p) => (seen.has(p.page) ? false : (seen.add(p.page), true)));
  }, []);

  useEffect(() => { if (open) setSearch(""); }, [open]);

  if (!open) return null;
  const groups = [...new Set(pages.filter((p) => p.label.toLowerCase().includes(search.toLowerCase())).map((p) => p.group))];

  return (
    <div className="empire-cmdk-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="empire-cmdk"
      >
        <Command label="Command palette" className="bg-transparent text-amber-50">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-500/15">
            <Search className="size-4 text-amber-400/70" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, crimes, hubs…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-amber-200/30"
            />
            <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-amber-500/20 text-[9px] text-amber-300/70">ESC</kbd>
          </div>
          <Command.List className="max-h-[46vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-amber-200/40">No matching pages.</Command.Empty>
            {groups.map((g) => (
              <Command.Group key={g} heading={g} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-amber-400/50">
                {pages.filter((p) => p.group === g && p.label.toLowerCase().includes(search.toLowerCase())).map((p) => (
                  <Command.Item
                    key={`${g}-${p.page}`}
                    value={p.label}
                    onSelect={() => { onNavigate(p.page); onClose(); }}
                    className="empire-cmdk-item flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs font-semibold text-amber-100/80 data-[selected=true]:text-amber-50"
                  >
                    <span className="text-base">{p.icon}</span>
                    {p.label}
                    <span className="ml-auto text-[9px] uppercase tracking-widest text-amber-200/25">{p.group}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </motion.div>
    </div>
  );
}

/* ————— Ambient ember layer ————— */
function Ambience() {
  const embers = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      left: (i * 6.3 + (i % 5) * 4) % 100,
      delay: -(i * 1.7) % 14,
      dur: 9 + (i % 6) * 2.3,
      drift: ((i % 2 ? 1 : -1) * (14 + (i % 7) * 9)),
      size: 2 + (i % 3),
    })),
    []
  );
  return (
    <>
      <div className="empire-ambience" aria-hidden>
        {embers.map((e, i) => (
          <span key={i} className="ember" style={{
            left: `${e.left}%`,
            width: e.size, height: e.size,
            animationDuration: `${e.dur}s`,
            animationDelay: `${e.delay}s`,
            ["--drift" as any]: `${e.drift}px`,
          }} />
        ))}
      </div>
      <div className="empire-vignette" aria-hidden />
    </>
  );
}

/* ————— Vitals cluster ————— */
function Vital({ icon, label, value, max, color }: { icon: string; label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));
  return (
    <div className="min-w-[86px]">
      <div className="flex items-center justify-between text-[9px] font-bold mb-0.5">
        <span className="text-amber-200/60">{icon} {label}</span>
        <span style={{ color }} className="font-black tabular-nums">{Math.round(value)}</span>
      </div>
      <div className="vital-bar">
        <i style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
      </div>
    </div>
  );
}

/* ————— Main top bar ————— */
export function EmpireTopBar({ activePage, onNavigate }: { activePage: string; onNavigate: (p: string) => void }) {
  const player = useQuery(api.game.getPlayer);
  const [cds, setCds] = useState<Record<string, number>>(loadCooldowns);
  const [now, setNow] = useState(Date.now());
  const [ambienceOn, setAmbienceOn] = useState(() => { try { return localStorage.getItem("empireAmbience") !== "off"; } catch { return true; } });
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const cdsRef = useRef(cds);
  cdsRef.current = cds;

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const triggerCooldown = (op: Op) => {
    const next = { ...cdsRef.current, [op.label]: now + op.cd * 1000 };
    setCds(next);
    saveCooldowns(next);
  };

  const toggleAmbience = () => {
    setAmbienceOn((v) => {
      const next = !v;
      try { localStorage.setItem("empireAmbience", next ? "on" : "off"); } catch {}
      return next;
    });
  };

  const life = player?.life ?? 0;
  const maxLife = player?.maxLife ?? 100;
  const energy = (player as any)?.energy ?? 100;
  const wanted = (player as any)?.wantedLevel ?? 0;
  const xp = player?.experience ?? 0;
  const xpNeed = 2000;

  const chips = [
    { icon: "💰", label: "Cash", value: `$${(player?.money ?? 0).toLocaleString()}`, cls: "text-emerald-300" },
    { icon: "🏦", label: "Bank", value: `$${(player?.bank ?? 0).toLocaleString()}`, cls: "text-sky-300" },
    { icon: "🏆", label: "Points", value: (player?.points ?? 0).toLocaleString(), cls: "text-amber-300" },
    { icon: "🪙", label: "Coins", value: ((player as any)?.coins ?? 0).toLocaleString(), cls: "text-yellow-200" },
    { icon: "🔫", label: "Bullets", value: ((player as any)?.bullets ?? 0).toLocaleString(), cls: "text-orange-300" },
    { icon: "⚔️", label: "ATK", value: player?.attack ?? 0, cls: "text-red-300" },
    { icon: "🛡️", label: "DEF", value: player?.defense ?? 0, cls: "text-blue-300" },
  ];

  let railIndex = 0;

  return (
    <>
      {ambienceOn && <Ambience />}
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} onNavigate={onNavigate} />

      <div className="empire-topbar">
        {/* ── Row 1: identity + vitals + chips ── */}
        <div className="relative flex items-center gap-3 px-4 pt-2.5 pb-2 flex-wrap">
          {/* Identity */}
          <div className="flex items-center gap-2.5">
            <span
              className="relative inline-flex size-9 items-center justify-center rounded-xl p-[2px] shadow-lg"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.5), rgba(180,83,9,0.35))", boxShadow: "0 0 18px rgba(245,158,11,0.25)" }}
            >
              <span className="flex size-full items-center justify-center rounded-[10px] bg-black/85 text-xs font-black text-amber-300">
                {(player?.nickname || player?.username || "P").slice(0, 1).toUpperCase()}
              </span>
              {wanted > 0 && (
                <span className="absolute -top-1 -right-1 size-3 rounded-full bg-red-500 border-2 border-black animate-pulse" title={`Wanted level ${wanted}`} />
              )}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-amber-300" style={{ textShadow: "0 0 12px rgba(255,200,50,0.4)" }}>
                  {player?.nickname || player?.username || "Player"}
                </span>
                {wanted > 0 && <span className="px-1.5 py-px rounded-full bg-red-500/20 border border-red-500/40 text-[8px] font-black text-red-300 animate-pulse">WANTED</span>}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200/45">
                Lv.{player?.level ?? 1} · 📍 {player?.location ?? "New York"}
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent hidden lg:block" />

          {/* Vitals */}
          <div className="flex items-center gap-4 flex-wrap">
            <Vital icon="❤️" label="Life" value={life} max={maxLife} color="#ef4444" />
            <Vital icon="⚡" label="Energy" value={energy} max={100} color="#f59e0b" />
            <Vital icon="⭐" label="XP" value={xp} max={xpNeed} color="#38bdf8" />
          </div>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent hidden lg:block" />

          {/* Resource chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {chips.map((c) => (
              <span key={c.label} className={`empire-stat-chip ${c.cls}`}>
                <span className="text-[11px]">{c.icon}</span>{c.value}
              </span>
            ))}
          </div>

          {/* Utility buttons */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setCmdkOpen(true)}
              className="empire-stat-chip text-amber-300/80"
              title="Command palette (Ctrl+K)"
            >
              <Terminal className="size-3" />
              <span className="hidden sm:inline">Ctrl K</span>
            </button>
            <button
              onClick={toggleAmbience}
              className={`empire-stat-chip ${ambienceOn ? "text-amber-300" : "text-slate-500"}`}
              title="Toggle ambient embers"
            >
              <Sparkles className="size-3" />
            </button>
            <button
              onClick={() => onNavigate("my_profile")}
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 bg-[length:200%_100%] animate-execute-light"
            >
              Profile
            </button>
          </div>
        </div>

        {/* ── Row 2: crime rail with cooldown rings ── */}
        <div className="relative">
          <div className="crime-rail">
            {/* HQ anchor */}
            <button
              onClick={() => onNavigate("headquarters")}
              className={`crime-card ${activePage === "headquarters" ? "is-active" : ""}`}
              style={{ ["--accent" as any]: "217,119,6" }}
            >
              <div className="flex items-center gap-2">
                <span className="crime-icon">🏠</span>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-amber-200 truncate">HQ</div>
                  <div className="text-[8px] text-amber-200/40 truncate">Command center</div>
                </div>
                <span className="ml-auto ready-dot" style={{ background: "#fbbf24", boxShadow: "0 0 8px rgba(251,191,36,0.7)" }} />
              </div>
            </button>

            <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />
            <span className="eyebrow self-center px-1 hidden xl:block">Street work</span>

            {OPS.map((op) => {
              railIndex++;
              const remaining = Math.max(0, Math.ceil(((cds[op.label] ?? 0) - now) / 1000));
              const cooling = remaining > 0;
              const fraction = cooling ? remaining / op.cd : 0;
              const isActive = activePage === op.page;
              const showStreetLabel = railIndex === 8;
              return (
                <React.Fragment key={op.page}>
                  {showStreetLabel && (
                    <>
                      <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />
                      <span className="eyebrow self-center px-1 hidden xl:block">Major ops</span>
                    </>
                  )}
                  <button
                    onClick={() => { triggerCooldown(op); onNavigate(op.page); }}
                    className={`crime-card ${isActive ? "is-active" : ""} ${cooling ? "is-cooling" : ""}`}
                    style={{ ["--accent" as any]: op.rgb }}
                    title={`${op.desc} · ${Math.round(op.cd / 60) || 1}m recovery cycle`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`cooldown-ring ${cooling ? "" : ""}`} style={{ width: 30, height: 30 }}>
                        <span className="crime-icon" style={{ width: 30, height: 30, border: "none", background: "transparent", fontSize: "0.95rem" }}>
                          {op.icon}
                        </span>
                        {cooling ? <CooldownRing fraction={fraction} rgb={op.rgb} /> : null}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black truncate" style={{ color: `rgb(${op.rgb})` }}>{op.label}</div>
                        <div className="text-[8px] text-amber-100/35 truncate">{op.desc}</div>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      {cooling ? (
                        <span className="text-[8px] font-black tabular-nums tracking-wide" style={{ color: `rgb(${op.rgb})` }}>
                          ⏱ {fmtCountdown(remaining)}
                        </span>
                      ) : (
                        <span className="text-[8px] font-black text-emerald-400/90 tracking-wide">✓ READY</span>
                      )}
                      <span className="text-[7px] font-bold uppercase tracking-widest text-amber-100/25">
                        {Math.round(op.cd / 60) || 1}m
                      </span>
                    </div>
                    {/* bottom recovery bar */}
                    <span
                      className="absolute left-0 bottom-0 h-[2.5px] w-full origin-left transition-transform duration-500"
                      style={{
                        background: `linear-gradient(90deg, rgb(${op.rgb}), rgba(255,220,120,0.8))`,
                        transform: cooling ? `scaleX(${fraction})` : "scaleX(0)",
                        opacity: cooling ? 0.9 : 0,
                      }}
                    />
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/50 to-transparent" />
        </div>

        {/* ── Row 3: live city wire ── */}
        <CityTicker />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   CITY PULSE — live server feed panel rendered inside HQ:
   online players, recent takedowns, casino wire, open bounties.
   ══════════════════════════════════════════════════════════════ */
export function CityPulsePanel() {
  const online = useQuery(api.admin.getOnlinePlayers);
  const deaths = useQuery(api.statistics.getRecentDeaths, { limit: 6 });
  const casinoEvents = useQuery(api.casinoSystem.getCasinoEvents);
  const bounties = useQuery(api.game.getBounties);

  const activeBounties = (bounties ?? []).filter((b: any) => b.active).length;

  const ago = (ts: number) => {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 mafia-card p-4">
      <div className="absolute -right-8 -top-10 text-[130px] opacity-[0.04] select-none">📡</div>
      <div className="relative mb-3 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10 text-base animate-pulse">📡</div>
        <div>
          <div className="text-sm font-black tracking-wide text-amber-200">City Pulse</div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500">Live from the underworld</div>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Streets */}
        <div className="rounded-xl border border-slate-700/30 bg-black/25 p-3">
          <div className="eyebrow mb-2">🚶 On the streets</div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-black text-emerald-400">{online?.length ?? 0}</span>
            <span className="text-[10px] text-slate-500">players active in the last 2 minutes</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(online ?? []).slice(0, 8).map((p: any) => (
              <span key={p._id} className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-bold text-emerald-200">
                {p.nickname} <span className="text-emerald-400/50">Lv.{p.level}</span>
              </span>
            ))}
            {(online ?? []).length > 8 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-400/60">+{(online ?? []).length - 8} more</span>
            )}
            {(online ?? []).length === 0 && <span className="text-[10px] text-slate-600">The streets are quiet…</span>}
          </div>
          {activeBounties > 0 && (
            <div className="mt-2 rounded-lg bg-red-500/10 border border-red-500/25 px-2 py-1 text-[10px] font-bold text-red-300">
              🎯 {activeBounties} open bounty{activeBounties > 1 ? "ies" : ""} on the board
            </div>
          )}
        </div>

        {/* Kill feed */}
        <div className="rounded-xl border border-slate-700/30 bg-black/25 p-3">
          <div className="eyebrow mb-2">💀 Recent takedowns</div>
          <div className="space-y-1">
            {(deaths ?? []).slice(0, 5).map((d: any, i: number) => (
              <div key={i} className="pulse-row !py-1.5">
                <span className="text-sm">☠️</span>
                <span className="text-[10px] font-bold text-red-300">{d.killer}</span>
                <span className="text-[9px] text-slate-500">eliminated</span>
                <span className="text-[10px] font-bold text-slate-300">{d.victim}</span>
                <span className="ml-auto text-[8px] text-slate-600">{ago(d.ts)}</span>
              </div>
            ))}
            {(deaths ?? []).length === 0 && (
              <div className="text-[10px] text-slate-600">No bodies dropped yet. Stay sharp.</div>
            )}
          </div>
        </div>

        {/* Casino wire */}
        <div className="rounded-xl border border-slate-700/30 bg-black/25 p-3 md:col-span-2">
          <div className="eyebrow mb-2">🎰 Casino wire</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {(casinoEvents ?? []).slice(0, 6).map((e: any) => (
              <div key={e._id} className="pulse-row !py-1.5">
                <span className="text-sm">{e.type === "seized" ? "🚨" : e.type === "purchased" ? "🎟️" : "💸"}</span>
                <span className="text-[10px] text-amber-100/80 flex-1 truncate">{e.message}</span>
                <span className="text-[8px] text-slate-600">{ago(e.timestamp)}</span>
              </div>
            ))}
            {(casinoEvents ?? []).length === 0 && (
              <div className="text-[10px] text-slate-600">The pits are calm — for now.</div>
            )}
          </div>
        </div>
      </div>

      <div className="gold-divider mt-3" />
      <div className="mt-2 text-center text-[8px] uppercase tracking-[0.3em] text-amber-200/25">
        Shadow Empire · real-time underworld feed
      </div>
    </div>
  );
}

export { AnimatePresence };

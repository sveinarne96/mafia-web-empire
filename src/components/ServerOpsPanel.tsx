import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  Radio, CalendarClock, Megaphone, Timer, Wrench, FlaskConical, Server,
  Zap, RotateCcw, Save, Plus, Trash2, Eye, EyeOff, Activity, ShieldAlert,
  Globe, Crown, Users, Building2, Ban, RefreshCcw, CheckCircle2, XCircle,
  Send, ListOrdered, Quote, Link2, Bold, Italic, Underline, Heading1,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   SERVER OPS — the admin control room.
   Sections: LIVE EVENT · SEASONAL SYSTEM · COMMUNITY · GAME BALANCE ·
             SERVER FUNCTIONS · ONLINE TEST · SERVER REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const fmtDate = (ms: number) =>
  ms
    ? new Date(ms).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "Not set";

const fmtLeft = (until: number) => {
  const diff = Math.max(0, until - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const toLocalInput = (ms: number) => {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (s: string) => (s ? new Date(s).getTime() : 0);

function Section({
  id, title, icon, subtitle, accent, children,
}: {
  id: string; title: string; icon: React.ReactNode; subtitle: string; accent: string; children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="mafia-card rounded-2xl p-5 space-y-4 border-t-2 scroll-mt-20"
      style={{ borderTopColor: accent }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-wide">{title}</h3>
          <p className="text-[11px] text-muted-foreground leading-snug">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function StatusPill({ on, onText, offText }: { on: boolean; onText: string; offText: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
      on ? "bg-green-500/15 text-green-400" : "bg-white/5 text-muted-foreground"
    }`}>
      {on ? onText : offText}
    </span>
  );
}

const CRIME_LABELS: Record<string, string> = {
  street: "🔪 Street",
  robbery: "💰 Robbery",
  fraud: "🃏 Fraud",
  burglary: "🏠 Burglary",
  drugs: "💊 Drugs",
  organized: "🕵️ Organized Crime",
  underground: "🕳️ Underground",
  gta_theft: "🚗 GTA Car Theft",
  steal_house: "🔑 Burglarize Houses",
  murder: "💀 Murder",
};

const ANN_TYPES = [
  { id: "update", label: "Update", emoji: "📣", color: "amber" },
  { id: "event", label: "Event", emoji: "🎪", color: "purple" },
  { id: "operational", label: "Operational", emoji: "🛠️", color: "cyan" },
];

const inputCls = "w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors";

export function ServerOpsPanel({ onClose }: { onClose: () => void }) {
  const ops = useQuery(api.serverOps.getServerOps);
  const announcements = useQuery(api.serverOps.listAnnouncements);
  const registry = useQuery(api.serverOps.getServerRegistry);

  // Mutations
  const setRankEvent = useMutation(api.serverOps.setRankEvent);
  const deactivateRankEvent = useMutation(api.serverOps.deactivateRankEvent);
  const startNewSeason = useMutation(api.serverOps.startNewSeason);
  const setSeasonPlannedEnd = useMutation(api.serverOps.setSeasonPlannedEnd);
  const postAnnouncementRich = useMutation(api.serverOps.postAnnouncementRich);
  const deactivateAnnouncement = useMutation(api.serverOps.deactivateAnnouncement);
  const setGameBalance = useMutation(api.serverOps.setGameBalance);
  const resetGameBalance = useMutation(api.serverOps.resetGameBalance);
  const setMurderSystem = useMutation(api.serverOps.setMurderSystem);
  const setRegistrationOpen = useMutation(api.serverOps.setRegistrationOpen);
  const setMaintenanceMode = useMutation(api.serverOps.setMaintenanceMode);
  const spawnSystemCharacter = useMutation(api.serverOps.spawnSystemCharacter);
  const removeSystemCharacter = useMutation(api.serverOps.removeSystemCharacter);
  const setSystemCharVisible = useMutation(api.serverOps.setSystemCharVisible);
  const pingSystemCharacters = useMutation(api.serverOps.pingSystemCharacters);

  /* ── LIVE EVENT state ── */
  const [evMultiplier, setEvMultiplier] = useState("2");
  const [evEndsAt, setEvEndsAt] = useState("");
  const [evLabel, setEvLabel] = useState("2x to 10x Ranking");

  /* ── SEASONAL state ── */
  const [seasonDays, setSeasonDays] = useState("100");
  const [seasonConfirm, setSeasonConfirm] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");

  /* ── COMMUNITY state ── */
  const [annTitle, setAnnTitle] = useState("");
  const [annType, setAnnType] = useState("update");
  const [annText, setAnnText] = useState("");
  const [annHours, setAnnHours] = useState("48");
  const [annPreview, setAnnPreview] = useState(false);

  /* ── GAME BALANCE state ── */
  const [globalCd, setGlobalCd] = useState("60");
  const [jailTimes, setJailTimes] = useState<Record<string, string>>({});

  /* ── SERVER FUNCTIONS state ── */
  const [maintMsg, setMaintMsg] = useState("");

  /* ── ONLINE TEST state ── */
  const [charLimit, setCharLimit] = useState(5);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Action failed" });
    }
    setBusy(false);
  };

  // Keep system characters ticking as online while this panel is open.
  useEffect(() => {
    const t = setInterval(() => { pingSystemCharacters().catch(() => {}); }, 60000);
    return () => clearInterval(t);
  }, [pingSystemCharacters]);

  // Seed balance state from server once loaded.
  useEffect(() => {
    if (!ops) return;
    setGlobalCd(String(ops.balance.globalCrimeCooldown));
    const j: Record<string, string> = {};
    for (const k of Object.keys(CRIME_LABELS)) {
      j[k] = String(ops.balance.crimeJailTimes?.[k] ?? 60);
    }
    setJailTimes(j);
    if (ops.event.active) {
      setEvMultiplier(String(ops.event.multiplier));
      setEvLabel(ops.event.label ?? "2x to 10x Ranking");
    }
    if (ops.season.plannedEndsAt) setPlannedEnd(toLocalInput(ops.season.plannedEndsAt));
  }, [ops]);

  if (ops === undefined || registry === undefined || registry === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!ops) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[40vh] text-center">
        <Server className="size-10 text-muted-foreground mb-3" />
        <h3 className="font-bold">Server Ops unavailable</h3>
        <p className="text-xs text-muted-foreground mt-1">Admin privileges required.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-xs font-bold hover:bg-white/10">✕ Close</button>
      </div>
    );
  }

  const evActive = ops.event.active;
  const nextSeason = ops.season.started ? ops.season.number + 1 : 2;
  const expectedConfirm = `SEASON ${nextSeason}`;
  const sysVisibleOnline = ops.presence.sysChars.filter((c) => c.online && c.nickname).length;
  const correctAccounts = Math.max(0, ops.presence.onlineNow);

  const wrapSelection = (marker: string, endMarker?: string) => {
    const ta = document.getElementById("ann-message") as HTMLTextAreaElement | null;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || "text";
    const close = endMarker ?? marker;
    const next = value.slice(0, s) + `${marker}${sel}${close}` + value.slice(e);
    setAnnText(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + marker.length, s + marker.length + sel.length); });
  };
  const insertLine = (prefix: string) => {
    const ta = document.getElementById("ann-message") as HTMLTextAreaElement | null;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const next = value.slice(0, s) + (s > 0 && value[s - 1] !== "\n" ? "\n" : "") + prefix + value.slice(s);
    setAnnText(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + prefix.length + (s > 0 && value[s - 1] !== "\n" ? 1 : 0), s + prefix.length + (s > 0 && value[s - 1] !== "\n" ? 1 : 0)); });
  };

  return (
    <div className="animate-fade-in space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Server className="size-7 text-primary" />
          <div>
            <h2 className="text-2xl font-black tracking-wide">🛰️ Server Ops</h2>
            <p className="text-[11px] text-muted-foreground">
              Central administration for events, seasons, community, balance, functions and the server registry.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm shrink-0">✕ Close</button>
      </div>

      {/* Section quick-nav */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ["live_event", "⚡ Live Event"], ["seasonal", "🗓️ Seasonal"], ["community", "📣 Community"],
          ["balance", "⚖️ Game Balance"], ["functions", "🔧 Functions"], ["online_test", "🧪 Online Test"],
          ["registry", "🗃️ Registry"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition">
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`text-xs font-bold rounded-lg px-3 py-2 ${msg.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {msg.ok ? "✅ " : "❌ "}{msg.text}
        </div>
      )}

      {/* ══════════ 1. LIVE EVENT ══════════ */}
      <Section
        id="live_event"
        title="LIVE EVENT"
        icon={<Radio className="size-6 text-amber-400" />}
        subtitle="Server-wide rank XP multiplier. Doubles all server-managed rank XP from crime, car theft, missions and film production."
        accent="rgb(251 191 36 / 0.6)"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status card */}
          <div className={`rounded-xl p-4 space-y-3 border ${evActive ? "border-amber-500/40 bg-amber-500/5" : "border-border/60 bg-black/20"}`}>
            <div className="flex items-center justify-between">
              <StatusPill on={evActive} onText="Active" offText="Inactive" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Rank Progression</span>
            </div>
            <div>
              <div className="text-lg font-black text-amber-300">{ops.event.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                All server-managed rank XP from crime, car theft, missions and film production.
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-black/30 p-2 text-center">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Multiplier</div>
                <div className={`text-sm font-black ${evActive ? "text-amber-300" : "text-muted-foreground"}`}>
                  {evActive ? `${ops.event.multiplier.toFixed(1)}x` : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-black/30 p-2 text-center">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Ends</div>
                <div className="text-sm font-black text-foreground">{evActive ? fmtLeft(ops.event.endsAt) : "—"}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2 text-center">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Server-managed</div>
                <div className="text-sm font-black text-green-400">{evActive ? "Yes" : "No"}</div>
              </div>
            </div>
            {evActive && (
              <div className="text-[10px] text-muted-foreground">End date and time: <span className="text-foreground font-bold">{fmtDate(ops.event.endsAt)}</span></div>
            )}
          </div>

          {/* Controls */}
          <div className="rounded-xl p-4 space-y-3 border border-border/60 bg-black/20">
            <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Activate / Update</div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">Multiplier (2x – 10x)</label>
              <input type="number" min={2} max={10} value={evMultiplier}
                onChange={(e) => setEvMultiplier(e.target.value)} className={`${inputCls} mt-1`} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">End date and time — pick a specific date</label>
              <input type="datetime-local" value={evEndsAt}
                onChange={(e) => setEvEndsAt(e.target.value)} className={`${inputCls} mt-1`} />
              <p className="text-[9px] text-muted-foreground mt-1">Leave empty to extend from now by the current setting. Max 1 year ahead.</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">Label</label>
              <input value={evLabel} onChange={(e) => setEvLabel(e.target.value)} className={`${inputCls} mt-1`} />
            </div>
            <div className="flex gap-2">
              <button disabled={busy}
                onClick={() => run(async () => {
                  const ends = fromLocalInput(evEndsAt) || (evActive ? ops.event.endsAt : Date.now() + 7 * 86400000);
                  await setRankEvent({ multiplier: Number(evMultiplier) || 2, endsAt: ends, label: evLabel.trim() || undefined });
                }, "Live event activated — rank XP is boosted for everyone")}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-xs font-black hover:bg-amber-700 disabled:opacity-40">
                {evActive ? "🔄 Update event" : "⚡ Activate"}
              </button>
              <button disabled={busy || !evActive}
                onClick={() => run(() => deactivateRankEvent(), "Live event deactivated — rank XP back to normal")}
                className="flex-1 px-4 py-2.5 bg-white/5 text-red-300 rounded-lg text-xs font-black hover:bg-white/10 disabled:opacity-40">
                ⏹ Deactivate
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ 2. SEASONAL SYSTEM ══════════ */}
      <Section
        id="seasonal"
        title="SEASONAL SYSTEM"
        icon={<CalendarClock className="size-6 text-violet-400" />}
        subtitle="A season is normally around 100 days. When a new season starts, the game world and all normal progression are reset."
        accent="rgb(167 139 250 / 0.6)"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current season */}
          <div className="rounded-xl p-4 space-y-3 border border-violet-500/30 bg-violet-950/10">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-violet-300">
                Season {String(ops.season.number || 1).padStart(2, "0")}
              </div>
              <StatusPill on={ops.season.started} onText="Running" offText="Alpha" />
            </div>
            <div className="text-xs text-muted-foreground">Current: <span className="text-foreground font-bold">{ops.season.name}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-black/30 p-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Started</div>
                <div className="text-xs font-bold">{ops.season.startedAt ? fmtDate(ops.season.startedAt) : "—"}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Planned end</div>
                <div className="text-xs font-bold">{ops.season.plannedEndsAt ? fmtDate(ops.season.plannedEndsAt) : "Not set"}</div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">Planned end — set a specific date</label>
              <div className="flex gap-2 mt-1">
                <input type="datetime-local" value={plannedEnd} onChange={(e) => setPlannedEnd(e.target.value)} className={inputCls} />
                <button disabled={busy || !plannedEnd}
                  onClick={() => run(() => setSeasonPlannedEnd({ plannedEndsAt: fromLocalInput(plannedEnd) }), "Planned end updated")}
                  className="px-3 py-2 bg-violet-600 text-white rounded-lg text-[10px] font-black hover:bg-violet-700 disabled:opacity-40 shrink-0">
                  Set
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-black/20 p-3 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-green-400">Kept between seasons</div>
              <div className="flex flex-wrap gap-1.5">
                {["Performance points", "Prestige", "Premium points", "Profile & account"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 text-[9px] font-bold">🔒 {t}</span>
                ))}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-red-400 pt-1">Restoration</div>
              <div className="flex flex-wrap gap-1.5">
                {["Rank/XP", "Money", "Bank", "Vehicles", "Company", "Property", "Skills", "Statistics", "Crews", "Territories", "Auctions"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 text-[9px] font-bold">♻️ {t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Start new season */}
          <div className="rounded-xl p-4 space-y-3 border border-border/60 bg-black/20">
            <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Start season {nextSeason}</div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">Season length (days)</label>
              <input type="number" min={1} max={730} value={seasonDays}
                onChange={(e) => setSeasonDays(e.target.value)} className={`${inputCls} mt-1`} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">Confirm by typing <span className="text-red-400">{expectedConfirm}</span></label>
              <input value={seasonConfirm} onChange={(e) => setSeasonConfirm(e.target.value)}
                placeholder={expectedConfirm} className={`${inputCls} mt-1 font-mono tracking-widest`} />
            </div>
            <p className="text-[10px] text-red-300/80 leading-snug">
              ⚠️ This wipes rank/XP, money, bank, vehicles, companies, properties, skills, statistics, crews, territories and auctions for every player.
              Points, prestige, premium points and profiles are kept. This cannot be undone.
            </p>
            <button disabled={busy || seasonConfirm.trim().toUpperCase() !== expectedConfirm}
              onClick={() => run(async () => {
                await startNewSeason({ days: Number(seasonDays) || 100, confirmName: seasonConfirm.trim() });
                setSeasonConfirm("");
              }, `${expectedConfirm} started — the world has been reset for ${seasonDays} days`)}
              className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-40 transition">
              🌅 Start season {nextSeason}
            </button>
          </div>
        </div>
      </Section>

      {/* ══════════ 3. COMMUNITY ══════════ */}
      <Section
        id="community"
        title="COMMUNITY"
        icon={<Megaphone className="size-6 text-cyan-400" />}
        subtitle="Publish updates, events and operating information directly on Overview. Appears instantly for every player."
        accent="rgb(34 211 238 / 0.6)"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 space-y-3 border border-border/60 bg-black/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground">Rubric</label>
                <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Example: Public Alpha is live"
                  className={`${inputCls} mt-1`} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground">Type</label>
                <select value={annType} onChange={(e) => setAnnType(e.target.value)} className={`${inputCls} mt-1`}>
                  {ANN_TYPES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
            </div>
            {/* Formatting toolbar (safe markers — no raw HTML) */}
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { icon: <Bold className="size-3" />, m: "**", t: "Bold" },
                { icon: <Italic className="size-3" />, m: "_", t: "Italic" },
                { icon: <Underline className="size-3" />, m: "__", t: "Underline" },
                { icon: <Heading1 className="size-3" />, m: "#", t: "Heading" },
              ].map((b) => (
                <button key={b.t} title={b.t} onClick={() => wrapSelection(b.m)}
                  className="size-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                  {b.icon}
                </button>
              ))}
              <button title="Bullet list" onClick={() => insertLine("• ")}
                className="size-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition"><ListOrdered className="size-3" /></button>
              <button title="Numbered list" onClick={() => insertLine("1. ")}
                className="size-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition"><span className="text-[9px] font-black">1.</span></button>
              <button title="Quote" onClick={() => insertLine("❝ ")}
                className="size-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition"><Quote className="size-3" /></button>
              <button title="Link" onClick={() => wrapSelection("[", "](")}
                className="size-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition"><Link2 className="size-3" /></button>
              <span className="text-[9px] text-muted-foreground ml-1">Select text and use a tool. Limited, safe formatting — raw HTML does not work.</span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground">Message — the information players will see</label>
              <textarea id="ann-message" value={annText} onChange={(e) => setAnnText(e.target.value)}
                placeholder="Write the information that the players will see…"
                className={`${inputCls} mt-1 h-24 resize-none`} />
              <div className="flex justify-between mt-1">
                <span className={`text-[9px] ${annText.length > 300 ? "text-red-400 font-bold" : "text-muted-foreground"}`}>{annText.length}/300 (banner limit)</span>
                <button onClick={() => setAnnPreview((p) => !p)} className="text-[9px] font-bold text-cyan-300 hover:text-cyan-200">
                  {annPreview ? "Hide preview" : "👁 Preview"}
                </button>
              </div>
            </div>
            {annPreview && (
              <div className="rounded-lg border border-cyan-500/25 bg-cyan-950/10 p-3">
                <div className="text-[9px] uppercase tracking-widest text-cyan-300 font-black mb-1">Preview — shown on Overview</div>
                <div className="text-xs whitespace-pre-wrap">{annText ? `${annTitle ? annTitle + "\n\n" : ""}${annText}` : "…"}</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <select value={annHours} onChange={(e) => setAnnHours(e.target.value)} className="bg-black/30 border border-border rounded-lg px-2 py-1.5 text-xs">
                {[1, 6, 12, 24, 48, 72, 168].map((h) => <option key={h} value={h}>{h === 168 ? "7 days" : `${h} hours`}</option>)}
              </select>
              <button disabled={busy || !annText.trim()}
                onClick={() => run(async () => {
                  await postAnnouncementRich({
                    title: annTitle.trim() || undefined,
                    text: annText.trim(),
                    type: annType,
                    durationHours: Number(annHours) || 48,
                  });
                  setAnnTitle(""); setAnnText("");
                }, "Announcement published — live on Overview now")}
                className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg text-xs font-black hover:bg-cyan-700 disabled:opacity-40 transition flex items-center justify-center gap-1.5">
                <Send className="size-3.5" /> Fasten at the top — Publish announcement
              </button>
            </div>
          </div>

          {/* Existing announcements */}
          <div className="rounded-xl p-4 space-y-2 border border-border/60 bg-black/20">
            <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Published ({announcements?.length ?? 0})
            </div>
            {(announcements ?? []).length === 0 && (
              <div className="text-xs text-muted-foreground py-6 text-center">No announcements published yet.</div>
            )}
            {(announcements ?? []).map((a) => (
              <div key={a._id} className={`rounded-lg px-3 py-2 border ${a.active ? "border-cyan-500/25 bg-cyan-950/10" : "border-border/40 bg-black/20 opacity-60"}`}>
                <div className="flex items-center gap-2">
                  <span>{a.emoji}</span>
                  <span className="flex-1 text-xs font-bold truncate">{a.text.split("\n")[0]}</span>
                  {a.active ? <CheckCircle2 className="size-3.5 text-green-400 shrink-0" /> : <XCircle className="size-3.5 text-muted-foreground shrink-0" />}
                  <button disabled={busy || !a.active} onClick={() => run(() => deactivateAnnouncement({ announcementId: a._id as any }), "Announcement taken down")}
                    className="text-red-400 hover:text-red-300 text-xs shrink-0 disabled:opacity-30">✕</button>
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  {a.createdByName || "Admin"} · {fmtDate(a.createdAt)} · {a.active ? `${fmtLeft(a.expiresAt)} left` : "taken down"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ 4. GAME BALANCE ══════════ */}
      <Section
        id="balance"
        title="GAME BALANCE"
        icon={<Timer className="size-6 text-orange-400" />}
        subtitle="Crime · hours. Server-managed values that apply directly to new criminal attempts and are saved permanently."
        accent="rgb(251 146 60 / 0.6)"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 space-y-3 border border-orange-500/30 bg-orange-950/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-300">⏱ Live global crime cooldown</span>
              <span className="text-xs font-black text-orange-300">{Math.round(ops.balance.globalCrimeCooldown / 60 * 10) / 10} min</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min={10} max={3600} value={globalCd}
                onChange={(e) => setGlobalCd(e.target.value)} className={inputCls} />
              <span className="text-[10px] text-muted-foreground shrink-0">seconds</span>
            </div>
            <p className="text-[9px] text-muted-foreground">Applies after every crime attempt.</p>

            <div className="border-t border-border/60 pt-3 space-y-2">
              {Object.entries(CRIME_LABELS).map(([key, label], i) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-muted-foreground w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{label}</div>
                    <div className="text-[9px] text-muted-foreground">Imprisonment upon failure</div>
                  </div>
                  <input type="number" min={0} max={3600} value={jailTimes[key] ?? "60"}
                    onChange={(e) => setJailTimes((j) => ({ ...j, [key]: e.target.value }))}
                    className="w-20 bg-black/30 border border-border rounded-lg px-2 py-1.5 text-xs text-right" />
                  <span className="text-[9px] text-muted-foreground w-8 shrink-0">sec</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-3 border border-border/60 bg-black/20">
            <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Security limits</div>
            <div className="rounded-lg bg-black/30 p-3 text-[11px] space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Cooldown</span><span className="font-bold">10 – 3600 sec</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Imprisonment per crime</span><span className="font-bold">0 – 3600 sec</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Scope</span><span className="font-bold">All criminal actions</span></div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Save to control the waiting time for all criminal actions in game. Changes apply to new attempts immediately —
              running cooldowns are not affected.
            </p>
            <div className="flex gap-2">
              <button disabled={busy}
                onClick={() => run(() => resetGameBalance(), "Game balance restored to defaults (60s cooldown, default jail times)")}
                className="flex-1 px-4 py-2.5 bg-white/5 text-muted-foreground rounded-lg text-xs font-black hover:bg-white/10 flex items-center justify-center gap-1.5 disabled:opacity-40">
                <RotateCcw className="size-3.5" /> Restore default
              </button>
              <button disabled={busy}
                onClick={() => run(async () => {
                  const jail: Record<string, number> = {};
                  for (const [k, v] of Object.entries(jailTimes)) jail[k] = Number(v) || 0;
                  await setGameBalance({ globalCrimeCooldown: Number(globalCd) || 60, crimeJailTimes: jail });
                }, "Game balance saved — new crime attempts use these timers")}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-xs font-black hover:bg-orange-700 flex items-center justify-center gap-1.5 disabled:opacity-40">
                <Save className="size-3.5" /> Save game balance
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ 5. SERVER FUNCTIONS ══════════ */}
      <Section
        id="functions"
        title="SERVER FUNCTIONS"
        icon={<Wrench className="size-6 text-red-400" />}
        subtitle="Public Alpha controls — global functions that affect the entire game server."
        accent="rgb(248 113 113 / 0.6)"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Murder system */}
          <div className={`rounded-xl p-4 space-y-3 border ${ops.functions.murderEnabled ? "border-green-500/30 bg-green-950/10" : "border-border/60 bg-black/20"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest">🔪 Murder system</span>
              <StatusPill on={ops.functions.murderEnabled} onText="Enabled" offText="Declined" />
            </div>
            <p className="text-[10px] text-muted-foreground">Allows players to kill other players. When declined, kill actions are blocked server-side.</p>
            <button disabled={busy}
              onClick={() => run(() => setMurderSystem({ enabled: !ops.functions.murderEnabled }),
                ops.functions.murderEnabled ? "Murder system declined" : "Murder system switched on")}
              className={`w-full px-4 py-2 rounded-lg text-xs font-black disabled:opacity-40 ${ops.functions.murderEnabled ? "bg-white/5 text-red-300 hover:bg-white/10" : "bg-green-600 text-white hover:bg-green-700"}`}>
              {ops.functions.murderEnabled ? "Switch off" : "Switch on"}
            </button>
          </div>

          {/* Registration */}
          <div className={`rounded-xl p-4 space-y-3 border ${ops.functions.registrationOpen ? "border-green-500/30 bg-green-950/10" : "border-red-500/30 bg-red-950/10"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest">🚪 Registration</span>
              <StatusPill on={ops.functions.registrationOpen} onText="Open" offText="Closed" />
            </div>
            <p className="text-[10px] text-muted-foreground">Controls whether new players can register a character on the server.</p>
            <div className="flex gap-2">
              <button disabled={busy || ops.functions.registrationOpen}
                onClick={() => run(() => setRegistrationOpen({ open: true }), "Registration opened")}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-[10px] font-black hover:bg-green-700 disabled:opacity-40">Open</button>
              <button disabled={busy || !ops.functions.registrationOpen}
                onClick={() => run(() => setRegistrationOpen({ open: false }), "Registration closed")}
                className="flex-1 px-3 py-2 bg-white/5 text-red-300 rounded-lg text-[10px] font-black hover:bg-white/10 disabled:opacity-40">Close</button>
            </div>
          </div>

          {/* Maintenance */}
          <div className={`rounded-xl p-4 space-y-3 border ${ops.functions.maintenanceMode ? "border-red-500/40 bg-red-950/10" : "border-border/60 bg-black/20"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest">🔧 Maintenance mode</span>
              <StatusPill on={ops.functions.maintenanceMode} onText="Active" offText="Off" />
            </div>
            <input value={maintMsg} onChange={(e) => setMaintMsg(e.target.value)}
              placeholder={ops.functions.maintenanceMessage || "Maintenance message (players see this)"} className={inputCls} />
            <button disabled={busy}
              onClick={() => run(() => setMaintenanceMode({ enabled: !ops.functions.maintenanceMode, message: maintMsg.trim() || undefined }),
                ops.functions.maintenanceMode ? "Maintenance mode deactivated" : "Maintenance mode activated")}
              className={`w-full px-4 py-2 rounded-lg text-xs font-black disabled:opacity-40 ${ops.functions.maintenanceMode ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`}>
              {ops.functions.maintenanceMode ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </Section>

      {/* ══════════ 6. ONLINE TEST ══════════ */}
      <Section
        id="online_test"
        title="ONLINE TEST"
        icon={<FlaskConical className="size-6 text-emerald-400" />}
        subtitle="Temporary server characters to test the online list and live calculator. They do not create proper sessions and do not affect player statistics or PvP."
        accent="rgb(52 211 153 / 0.6)"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-xl bg-black/20 border border-emerald-500/20 p-3 text-center">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Visible online</div>
            <div className="text-xl font-black text-emerald-400">{sysVisibleOnline}</div>
          </div>
          <div className="rounded-xl bg-black/20 border border-border/60 p-3 text-center">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Correct account</div>
            <div className="text-xl font-black text-sky-400">{correctAccounts}</div>
          </div>
          <div className="rounded-xl bg-black/20 border border-border/60 p-3 text-center">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">System characters</div>
            <div className="text-xl font-black text-violet-400">{ops.presence.sysTotal}</div>
          </div>
          <div className="rounded-xl bg-black/20 border border-border/60 p-3 text-center">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Total</div>
            <div className="text-xl font-black text-foreground">{ops.presence.onlineNow + ops.presence.sysOnline}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-bold">Of</span>
          {[5, 10, 20, 30, 40, 50].map((n) => (
            <button key={n} onClick={() => setCharLimit(n)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${charLimit === n ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>
              {n}
            </button>
          ))}
          <span className="text-[9px] text-muted-foreground">— how many system characters are listed below</span>
          <div className="flex gap-2 ml-auto">
            <button disabled={busy}
              onClick={() => run(() => spawnSystemCharacter(), "System character spawned — now visible in the online list")}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1">
              <Plus className="size-3" /> Spawn
            </button>
            <button disabled={busy}
              onClick={() => run(() => pingSystemCharacters(), "Heartbeat sent — all visible system characters are online")}
              className="px-3 py-1.5 bg-white/5 text-emerald-300 rounded-lg text-[10px] font-black hover:bg-white/10 disabled:opacity-40 flex items-center gap-1">
              <Activity className="size-3" /> Heartbeat
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-black/20 divide-y divide-border/40">
          {ops.presence.sysChars.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">No system characters yet — spawn one to test the online list.</div>
          )}
          {ops.presence.sysChars.slice(0, charLimit).map((c) => (
            <div key={c._id} className="flex items-center gap-3 px-3 py-2">
              <span className={`size-2 rounded-full shrink-0 ${c.online ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40"}`} />
              <span className="text-xs font-bold flex-1 truncate">{c.nickname}</span>
              <span className="text-[10px] text-muted-foreground">Lv.{c.level}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">{c.online ? "online" : "offline"}</span>
              <button disabled={busy} title={c.online ? "Hide from online list" : "Show on online list"}
                onClick={() => run(() => setSystemCharVisible({ charId: c._id as any, visible: !c.online }), c.online ? "Character hidden" : "Character visible")}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                {c.online ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
              <button disabled={busy} title="Remove character"
                onClick={() => run(() => removeSystemCharacter({ charId: c._id as any }), "System character removed")}
                className="text-red-400 hover:text-red-300 disabled:opacity-30">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground">
          Only the neutral status "online" is shown to the public — system characters never reveal level, stats or location to players.
        </p>
      </Section>

      {/* ══════════ 7. SERVER REGISTRY ══════════ */}
      <Section
        id="registry"
        title="SERVER REGISTRY"
        icon={<Globe className="size-6 text-sky-400" />}
        subtitle="Central administration for players and servers — live server status at a glance."
        accent="rgb(56 189 248 / 0.6)"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 space-y-3 border border-sky-500/25 bg-sky-950/10">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Login as</span>
            </div>
            <div className="text-lg font-black">{registry.admins[0] ?? "Admin"}</div>
            <div className="text-[10px] text-muted-foreground">
              Admin · {registry.version} · environment <span className="text-foreground font-bold">{registry.environment}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-lg bg-black/30 p-2.5">
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground font-bold"><Users className="size-3" /> Player account</div>
                <div className="text-lg font-black text-primary">{registry.playerAccount}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground font-bold"><Building2 className="size-3" /> Company</div>
                <div className="text-lg font-black text-amber-300">{registry.companies}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Registered ownership</div>
                <div className="text-xs font-bold">{registry.companies > 0 ? `${registry.companies} companies` : "None"}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground font-bold"><Ban className="size-3" /> Banned</div>
                <div className="text-lg font-black text-red-400">{registry.banned}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-3 border border-border/60 bg-black/20">
            <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Server status</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2.5">
                <span className="text-xs font-bold">Registration</span>
                <StatusPill on={registry.registrationOpen} onText="Open" offText="Closed" />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2.5">
                <span className="text-xs font-bold">Season</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">{registry.seasonLabel}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2.5">
                <span className="text-xs font-bold">Maintenance</span>
                <StatusPill on={registry.maintenance} onText="Active" offText="Off" />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2.5">
                <span className="text-xs font-bold flex items-center gap-1"><Activity className="size-3 text-green-400" /> Online now</span>
                <span className="text-sm font-black text-green-400">{registry.online}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2.5">
                <span className="text-xs font-bold flex items-center gap-1"><ShieldAlert className="size-3 text-yellow-400" /> Admins</span>
                <span className="text-xs font-black text-yellow-300">{registry.admins.join(", ") || "—"}</span>
              </div>
            </div>
            {ops.functions.maintenanceMode && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-300 font-bold">
                ⚠️ Maintenance mode is ON — players see: "{ops.functions.maintenanceMessage || "Server maintenance in progress"}"
              </div>
            )}
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <RefreshCcw className="size-3" /> Values update live via Convex subscriptions — no refresh needed.
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

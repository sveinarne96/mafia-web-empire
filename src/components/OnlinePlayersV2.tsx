import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Users, Search, Send, X, Eye, Crown, Bot, Flame, ShieldCheck } from "lucide-react";

const ADMIN_COLORS = ["#ff073a", "#39ff14", "#ffdd00", "#ff9500", "#ff6ec7", "#00fff7"]; // red green yellow orange pink neon-cyan
const NEON_BLUE = "#00c3ff";

function rainbowBg(name: string) {
  // stable color per name
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ADMIN_COLORS[h % ADMIN_COLORS.length];
}

function neonStyle(color: string) {
  return { color, textShadow: `0 0 6px ${color}, 0 0 14px ${color}55` } as const;
}

/* ═══════════ ONLINE PLAYERS v3 — humans above, 14,000 neon bots below ═══════════ */

type BotRosterEntry = {
  slot: number; name: string; color: string; level: number;
  location: string; playerClass: string; wanted: number; kills: number; online: boolean;
};

const PAGE = 60;

export function OnlinePlayersPage({ onViewProfile }: { onViewProfile?: (playerId: string, nickname: string) => void } = {}) {
  const me = useQuery(api.game.getPlayer);
  const onlinePlayers = useQuery(api.admin.getOnlinePlayers);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const roster = useQuery(api.empireFeatures.getBotRoster, { offset: 0, take: PAGE });
  const heartbeat = useMutation(api.admin.heartbeat);
  const populateBots = useMutation(api.empireFeatures.populateBots);
  const sendMsg = useMutation(api.game.sendMessage);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "real" | "bots" | "wanted">("all");
  const [botCount, setBotCount] = useState(PAGE);
  const [msgTarget, setMsgTarget] = useState<any | null>(null);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => heartbeat().catch(() => {}), 25000);
    heartbeat().catch(() => {});
    populateBots().catch(() => {}); // make sure bot docs + neon colors exist
    return () => clearInterval(iv);
  }, [heartbeat, populateBots]);

  const filtered = useMemo(() => {
    if (!onlinePlayers) return [];
    return onlinePlayers.filter((p: any) => {
      if (search && !(p.nickname ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "admin") return p.role === "admin";
      if (filter === "wanted") return (p.wantedLevel ?? 0) > 0;
      return true;
    });
  }, [onlinePlayers, search, filter]);

  const bots: BotRosterEntry[] = useMemo(() => {
    const all = roster?.bots ?? [];
    return all.filter((b) => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "bots") return b.online;
      if (filter === "wanted") return b.wanted > 0;
      return true;
    });
  }, [roster, search, filter]);

  const send = async () => {
    if (!msgTarget || !msgText.trim()) return;
    try {
      await sendMsg({ receiverId: msgTarget._id, subject: `📍 Message from ${me?.nickname ?? "Unknown"}`, body: msgText.trim() });
      setMsgSent(true);
      setMsgText("");
      setTimeout(() => { setMsgSent(false); setMsgTarget(null); }, 1200);
    } catch { /* ignore */ }
  };

  const humansOnline = onlinePlayers?.length ?? 0;
  const botsOnline = bots.filter((b) => b.online).length;

  return (
    <div className="animate-fade-in space-y-4">
      {/* ═══ Header ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-black p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 size-44 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="flex flex-wrap items-center gap-3">
          <Users className="size-7 text-cyan-400" />
          <h2 className="text-2xl font-black text-cyan-300" style={neonStyle("#22d3ee")}>Online Players</h2>
          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-cyan-300">LIVE</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-black text-green-300">
            <span className="size-2 rounded-full bg-green-400 animate-pulse" /> {(onlineCount ?? 0).toLocaleString()} online now
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
          <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">🧑 {humansOnline.toLocaleString()} real players</span>
          <span className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-fuchsia-300">🤖 {(roster?.total ?? 14000).toLocaleString()} bots on the grid</span>
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">⚡ {botsOnline} in view online</span>
        </div>
      </div>

      {/* ═══ Controls ═══ */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the streets…"
            className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 py-2.5 pl-9 pr-3 text-xs focus:border-cyan-500/40 focus:outline-none" />
        </div>
        {([["all", "All"], ["real", "🧑 Real"], ["bots", "🤖 Bots"], ["admin", "👑 Admins"], ["wanted", "🔴 Wanted"]] as const).map(([f, label]) => (
          <button key={f} onClick={() => { setFilter(f); setBotCount(PAGE); }}
            className={`rounded-xl px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider transition ${filter === f ? "border border-cyan-500/40 bg-cyan-500/20 text-cyan-300" : "border border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ═══ REAL PLAYERS — shown above the bots, with human sign ═══ */}
      {filter !== "bots" && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Real Players</h3>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-300">🧑 HUMAN</span>
            <span className="text-[10px] text-slate-500">{filtered.length} online</span>
            <div className="ml-2 h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
          </div>
          {!onlinePlayers ? (
            <div className="py-8 text-center text-sm animate-pulse text-slate-500">Scanning the streets…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/50 py-8 text-center text-xs text-slate-500">
              {search ? `No real player matches "${search}".` : "No real players online right now."}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((p: any, i: number) => {
                const isAdmin = p.role === "admin";
                const nameColor = isAdmin ? rainbowBg(p.nickname) : NEON_BLUE;
                const isMe = me && (p._id === (me as any)._id);
                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.07] to-slate-900/40 p-3 transition hover:border-emerald-400/50 hover:from-emerald-500/[0.12]"
                  >
                    <span className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-emerald-400 to-teal-500 shadow-[0_0_10px_#34d399]" />
                    <span className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-xl border font-black"
                      style={{ borderColor: `${nameColor}55`, background: `${nameColor}14`, ...neonStyle(nameColor) }}>
                      {(p.nickname || "?")[0].toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-black" style={neonStyle(nameColor)}>{p.nickname}</span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-emerald-300">🧑 REAL PLAYER</span>
                        {isAdmin && <Crown className="size-3.5 text-amber-400" />}
                        {(p.wantedLevel ?? 0) > 0 && <span className="rounded bg-red-500/20 px-1.5 text-[8px] font-black text-red-400">WANTED {p.wantedLevel}</span>}
                        {isMe && <span className="rounded bg-cyan-500/20 px-1.5 text-[8px] font-black text-cyan-300">YOU</span>}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Lv.{p.level} · 📍 {p.location ?? "Unknown"}{p.playerClass ? ` · ${p.playerClass}` : ""}
                      </div>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <div className="text-[10px] font-black text-green-400">⚔️ {p.attack ?? 0}</div>
                      <div className="text-[10px] font-black text-sky-400">🛡️ {p.defense ?? 0}</div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {onViewProfile && (
                        <button onClick={() => onViewProfile(p._id, p.nickname)} title="View profile"
                          className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 p-2 text-cyan-400 transition hover:bg-cyan-500/20">
                          <Eye className="size-3.5" />
                        </button>
                      )}
                      {!isMe && (
                        <button onClick={() => setMsgTarget(p)} title="Send message"
                          className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2 text-amber-400 transition hover:bg-amber-500/20">
                          <Send className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══ THE GRID — 14,000 bots, each with its own neon color ═══ */}
      {filter !== "admin" && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-fuchsia-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">The Grid — Bot Network</h3>
            <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[9px] font-black text-fuchsia-300">🤖 {roster?.total?.toLocaleString() ?? "14,000"}</span>
            <div className="ml-2 h-px flex-1 bg-gradient-to-r from-fuchsia-500/40 to-transparent" />
          </div>
          {bots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/50 py-8 text-center text-xs text-slate-500">
              {search ? `No bot matches "${search}".` : "The grid is quiet."}
            </div>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
              {bots.slice(0, botCount).map((b, i) => (
                <motion.div
                  key={b.slot}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.012, 0.3) }}
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl border bg-slate-900/40 p-2.5 transition hover:bg-slate-900/80"
                  style={{ borderColor: `${b.color}30` }}
                >
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle at 20% 50%, ${b.color}14, transparent 70%)` }} />
                  <span className={`relative flex size-8 shrink-0 items-center justify-center rounded-lg border font-black text-xs ${b.online ? "animate-pulse-soft" : "opacity-50"}`}
                    style={{
                      borderColor: `${b.color}66`,
                      background: `${b.color}12`,
                      color: b.color,
                      textShadow: `0 0 8px ${b.color}`,
                      boxShadow: b.online ? `0 0 12px ${b.color}44, inset 0 0 6px ${b.color}22` : "none",
                    }}>
                    {b.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-black" style={{ color: b.color, textShadow: `0 0 6px ${b.color}88` }}>{b.name}</span>
                      {b.online && <span className="size-1.5 shrink-0 rounded-full" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }} />}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-slate-500">
                      <span>Lv.{b.level}</span>·<span>📍 {b.location}</span>
                      {b.wanted > 0 && <span className="rounded bg-red-500/20 px-1 text-[7px] font-black text-red-400">WANTED</span>}
                    </div>
                  </div>
                  <span className="shrink-0 rounded px-1 py-0.5 text-[7px] font-black tracking-wider"
                    style={{ background: `${b.color}14`, color: b.color }}>BOT</span>
                </motion.div>
              ))}
            </div>
          )}
          {bots.length > botCount && (
            <button onClick={() => setBotCount((c) => c + PAGE)}
              className="mx-auto flex items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-300 transition hover:bg-fuchsia-500/20">
              <Flame className="size-3.5" /> Load more of the grid ({(bots.length - botCount).toLocaleString()} left)
            </button>
          )}
        </section>
      )}

      {/* ═══ Message modal (real players only — bots have no inbox) ═══ */}
      {msgTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setMsgTarget(null)}>
          <div className="mafia-card w-full max-w-md space-y-3 rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-black">✉️ Message <span style={neonStyle(NEON_BLUE)}>{msgTarget.nickname}</span></div>
              <button onClick={() => setMsgTarget(null)} className="rounded-lg p-1.5 hover:bg-slate-800"><X className="size-4" /></button>
            </div>
            {msgSent ? (
              <div className="rounded-xl border border-green-500/30 bg-green-950/30 p-3 text-center text-xs font-bold text-green-400">✅ Message delivered!</div>
            ) : (
              <>
                <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)} rows={4} placeholder="What do you want to say…"
                  className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 text-xs focus:border-cyan-500/40 focus:outline-none" />
                <button onClick={send} disabled={!msgText.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-black text-black transition hover:brightness-110 disabled:opacity-40">
                  📤 Send to {msgTarget.nickname}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

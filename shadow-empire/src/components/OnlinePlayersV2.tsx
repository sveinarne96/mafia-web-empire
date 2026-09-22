import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Users, Search, Send, X, Eye, Crown } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

const ADMIN_COLORS = ["#ff073a", "#39ff14", "#ffdd00", "#ff9500", "#ff6ec7", "#00fff7"]; // red green yellow orange pink neon-cyan
const NEON_BLUE = "#00c3ff";

function rainbowBg(name: string) {
  // stable color per name
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ADMIN_COLORS[h % ADMIN_COLORS.length];
}

function neonStyle(color: string) {
  return { color, textShadow: `0 0 6px ${color}, 0 0 14px ${color}55` };
}

/* ═══════════ ONLINE PLAYERS v2 — neon, alive, clickable ═══════════ */

export function OnlinePlayersPage({ onViewProfile }: { onViewProfile?: (playerId: string, nickname: string) => void } = {}) {
  const me = useQuery(api.game.getPlayer);
  const onlinePlayers = useQuery(api.admin.getOnlinePlayers);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const heartbeat = useMutation(api.admin.heartbeat);
  const populateBots = useMutation(api.empireFeatures.populateBots);
  const sendMsg = useMutation(api.game.sendMessage);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "real" | "wanted">("all");
  const [msgTarget, setMsgTarget] = useState<any | null>(null);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => heartbeat().catch(() => {}), 25000);
    heartbeat().catch(() => {});
    populateBots().catch(() => {}); // make sure 1500 bots exist
    return () => clearInterval(iv);
  }, [heartbeat, populateBots]);

  const filtered = useMemo(() => {
    if (!onlinePlayers) return [];
    return onlinePlayers.filter((p: any) => {
      if (search && !(p.nickname ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "admin") return p.role === "admin";
      if (filter === "real") return p.role !== "admin";
      if (filter === "wanted") return (p.wantedLevel ?? 0) > 0;
      return true;
    });
  }, [onlinePlayers, search, filter]);

  const send = async () => {
    if (!msgTarget || !msgText.trim()) return;
    try {
      await sendMsg({ receiverId: msgTarget._id, subject: `📍 Message from ${me?.nickname ?? "Unknown"}`, body: msgText.trim() });
      setMsgSent(true);
      setMsgText("");
      setTimeout(() => { setMsgSent(false); setMsgTarget(null); }, 1200);
    } catch { /* ignore */ }
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Users className="size-7 text-cyan-400" />
        <h2 className="text-2xl font-black text-cyan-300">Online Players</h2>
        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black text-cyan-400">LIVE</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-black text-green-300">
          <span className="size-2 rounded-full bg-green-400 animate-pulse" /> {onlineCount ?? "—"} online now
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…"
            className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 py-2.5 pl-9 pr-3 text-xs focus:border-cyan-500/40 focus:outline-none" />
        </div>
        {(["all", "admin", "real", "wanted"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider transition ${filter === f ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300" : "bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-300"}`}>
            {f === "all" ? "All" : f === "admin" ? "👑 Admins" : f === "real" ? "Players" : "🔴 Wanted"}
          </button>
        ))}
      </div>

      {/* List */}
      {!onlinePlayers ? (
        <div className="py-12 text-center text-sm animate-pulse text-slate-500">Scanning the streets…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/50 py-12 text-center text-xs text-slate-500">
          {search ? `Nobody matches "${search}".` : "The streets are quiet right now."}
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
                transition={{ delay: Math.min(i * 0.015, 0.5) }}
                className="group flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 transition hover:border-cyan-500/30 hover:bg-slate-900/70"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${isAdmin ? "bg-red-500" : "bg-green-500"} ${isAdmin ? "" : "animate-pulse"}`}
                  style={isAdmin ? { boxShadow: "0 0 8px #ef4444" } : { boxShadow: "0 0 8px #22c55e" }} />
                {/* Avatar initial with neon */}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border font-black"
                  style={{ borderColor: `${nameColor}55`, background: `${nameColor}11`, ...neonStyle(nameColor) }}>
                  {(p.nickname || "?")[0].toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-black" style={neonStyle(nameColor)}>{p.nickname}</span>
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
                {/* Actions */}
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

      {/* Send message modal */}
      {msgTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setMsgTarget(null)}>
          <div className="mafia-card w-full max-w-md rounded-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
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

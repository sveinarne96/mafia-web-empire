import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, WifiOff, MapPin, Swords, Shield, Skull, Users,
  Crown, ChevronDown, ChevronUp, Eye, Clock, Zap, Star,
  Send, X, MessageSquare, Search, TrendingUp,
} from "lucide-react";

const RANK_TIERS = [
  { min: 90, label: "Shadow Emperor", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/50", icon: "👑" },
  { min: 80, label: "Godfather", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/50", icon: "🔱" },
  { min: 70, label: "Don", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/50", icon: "💀" },
  { min: 60, label: "Underboss", color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/50", icon: "🗡️" },
  { min: 50, label: "Consigliere", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/50", icon: "🛡️" },
  { min: 40, label: "Captain", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/50", icon: "⚔️" },
  { min: 30, label: "Soldier", color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/50", icon: "🔫" },
  { min: 20, label: "Enforcer", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/50", icon: "👊" },
  { min: 10, label: "Thug", color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/50", icon: "⚡" },
  { min: 0, label: "Street Rat", color: "text-gray-400", bg: "bg-gray-500/20", border: "border-gray-500/50", icon: "🐀" },
];

function getRankInfo(level: number) {
  return RANK_TIERS.find((r) => level >= r.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

export function OnlineList({ onViewProfile }: { onViewProfile?: (playerId: string, nickname: string) => void } = {}) {
  const onlinePlayers = useQuery(api.admin.getOnlinePlayers);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const heartbeat = useMutation(api.admin.heartbeat);
  const sendMessage = useMutation(api.game.sendMessage);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "admins" | "highlevel" | "wanted">("all");
  const [msgTarget, setMsgTarget] = useState<string | null>(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgSent, setMsgSent] = useState<string | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => heartbeat().catch(() => {}), 30000);
    heartbeat().catch(() => {});
    return () => clearInterval(iv);
  }, [heartbeat]);

  // Time window stats
  const timeStats = useMemo(() => {
    if (!onlinePlayers) return { lastHour: 0, lastDay: 0, lastWeek: 0 };
    const now = Date.now();
    const hour = 3600000;
    const day = 86400000;
    const week = 604800000;
    return {
      lastHour: onlinePlayers.filter((p: any) => now - (p.lastActive ?? 0) < hour).length,
      lastDay: onlinePlayers.filter((p: any) => now - (p.lastActive ?? 0) < day).length,
      lastWeek: onlinePlayers.filter((p: any) => now - (p.lastActive ?? 0) < week).length,
    };
  }, [onlinePlayers]);

  if (onlinePlayers === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filtered = onlinePlayers.filter((p: any) => {
    if (filter === "admins") return p.role === "admin";
    if (filter === "highlevel") return p.level >= 10;
    if (filter === "wanted") return p.wantedLevel > 0;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const rank = getRankInfo(p.level ?? 0);
      return (p.nickname ?? "").toLowerCase().includes(q) || rank.label.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSendMsg = async (receiverId: string, nickname: string) => {
    if (!msgSubject.trim() || !msgBody.trim()) return;
    setMsgLoading(true);
    try {
      await sendMessage({ receiverId: receiverId as any, subject: msgSubject.trim(), body: msgBody.trim() });
      setMsgSent(nickname);
      setMsgTarget(null);
      setMsgSubject("");
      setMsgBody("");
      setTimeout(() => setMsgSent(null), 3000);
    } catch (e) {
      console.error("Failed to send message:", e);
    }
    setMsgLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Wifi className="size-6 text-green-400" />
          <span className="absolute -top-1 -right-1 size-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold">Online Users</h2>
      </div>

      {/* Time Window Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center border border-amber-500/20">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">In the last hour</div>
          <div className="text-2xl font-black text-amber-400">{timeStats.lastHour}</div>
          <div className="text-[10px] text-muted-foreground">Players</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center border border-blue-500/20">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">In the last day</div>
          <div className="text-2xl font-black text-blue-400">{timeStats.lastDay}</div>
          <div className="text-[10px] text-muted-foreground">Players</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center border border-purple-500/20">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">In the last week</div>
          <div className="text-2xl font-black text-purple-400">{timeStats.lastWeek}</div>
          <div className="text-[10px] text-muted-foreground">Players</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center border border-green-500/20">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Online Users</div>
          <div className="text-2xl font-black text-green-400">{onlineCount ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">Total online: {onlineCount ?? 0}</div>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by rank or username..."
          className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Online Key */}
      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1.5">
          <span>Online Key</span>
          <span className="text-slate-600">— Hover over a rank or crew status to filter.</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RANK_TIERS.map((r) => (
            <span
              key={r.label}
              onMouseEnter={() => { setHoveredKey(r.label); setFilter("all"); setSearchQuery(r.label); }}
              onMouseLeave={() => { setHoveredKey(null); setSearchQuery(""); }}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-all ${r.bg} ${r.color} border ${r.border} hover:scale-110`}
            >
              {r.icon} {r.label}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 cursor-pointer hover:scale-110"
            onMouseEnter={() => { setFilter("admins"); }}
            onMouseLeave={() => { setFilter("all"); }}
          >
            🛡️ Staff Ranks: Admin
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "admins", "highlevel", "wanted"] as const).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setSearchQuery(""); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground border border-border hover:bg-accent"
            }`}>
            {f === "all" ? "🌐 All" : f === "admins" ? "🛡️ Admins" : f === "highlevel" ? "⭐ High Level" : "🔴 Wanted"}
          </button>
        ))}
        <div className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
          <TrendingUp className="size-3" />
          {filtered.length} shown
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnimatePresence>
          {filtered.map((p: any, i: number) => {
            const rank = getRankInfo(p.level ?? 0);
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  onClick={() => {
                    setExpanded(expanded === p._id ? null : p._id);
                    if (msgTarget === p._id) setMsgTarget(null);
                  }}
                  className={`mafia-card rounded-xl p-3 cursor-pointer transition-all hover:border-primary/30 ${
                    expanded === p._id ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold ${rank.bg} border-2 ${rank.border}`}>
                        {p.role === "admin" ? <Shield className="size-4 text-yellow-400" /> :
                         p.level >= 20 ? <Crown className={`size-4 ${rank.color}`} /> :
                         <Users className={`size-4 ${rank.color}`} />}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-400 rounded-full border-2 border-background" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm truncate">{p.nickname}</span>
                        {p.role === "admin" && (
                          <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] font-bold rounded">ADMIN</span>
                        )}
                        {p.wantedLevel > 0 && (
                          <span className="px-1 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-bold rounded">WANTED</span>
                        )}
                      </div>
                      <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className={rank.color}>{rank.icon} {rank.label}</span>
                        <span>⭐ Lv.{p.level}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="size-2.5" />
                          {p.location?.split(" ")[0] ?? "?"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMsgTarget(msgTarget === p._id ? null : p._id);
                        setExpanded(null);
                        setMsgSubject("");
                        setMsgBody("");
                      }}
                      className="shrink-0 p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all"
                      title={`Send message to ${p.nickname}`}
                    >
                      <MessageSquare className="size-3.5" />
                    </button>

                    {expanded === p._id
                      ? <ChevronUp className="size-4 text-muted-foreground" />
                      : <ChevronDown className="size-4 text-muted-foreground" />
                    }
                  </div>

                  {/* Inline Message Compose */}
                  <AnimatePresence>
                    {msgTarget === p._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                              <Send className="size-3" />
                              Message {p.nickname}
                            </div>
                            <button onClick={() => setMsgTarget(null)} className="text-muted-foreground hover:text-foreground">
                              <X className="size-3" />
                            </button>
                          </div>
                          <input
                            value={msgSubject}
                            onChange={(e) => setMsgSubject(e.target.value)}
                            placeholder="Subject..."
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                            onFocus={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <textarea
                            value={msgBody}
                            onChange={(e) => setMsgBody(e.target.value)}
                            placeholder="Write your message..."
                            rows={3}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs resize-none focus:ring-1 focus:ring-primary outline-none"
                            onFocus={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={() => handleSendMsg(p._id, p.nickname)}
                            disabled={msgLoading || !msgSubject.trim() || !msgBody.trim()}
                            className="w-full px-3 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                          >
                            {msgLoading ? (
                              <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Send className="size-3" />
                                Send Message
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expanded === p._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-background/40 rounded-lg">
                              <div className="text-[9px] text-muted-foreground uppercase">Class</div>
                              <div className="text-xs font-bold capitalize">{p.playerClass ?? "None"}</div>
                            </div>
                            <div className="text-center p-2 bg-background/40 rounded-lg">
                              <div className="text-[9px] text-muted-foreground uppercase">Family</div>
                              <div className="text-xs font-bold">{p.familyId ? "Yes" : "None"}</div>
                            </div>
                            <div className="text-center p-2 bg-background/40 rounded-lg">
                              <div className="text-[9px] text-muted-foreground uppercase">Status</div>
                              <div className="text-xs font-bold flex items-center justify-center gap-1">
                                <span className="size-1.5 bg-green-400 rounded-full" />
                                Active
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <Clock className="size-2.5" />
                            Last seen: {formatTimeAgo(p.lastActive)}
                          </div>
                          {onViewProfile && (
                            <button onClick={(e) => { e.stopPropagation(); onViewProfile(p._id, p.nickname); }}
                              className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg text-xs font-bold text-primary hover:bg-primary/30 transition-all flex items-center justify-center gap-1.5">
                              <Eye className="size-3" /> View Profile
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <WifiOff className="size-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No players match this filter</p>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

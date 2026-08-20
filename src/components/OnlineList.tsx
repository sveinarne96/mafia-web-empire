import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, WifiOff, MapPin, Swords, Shield, Skull, Users,
  Crown, ChevronDown, ChevronUp, Eye, Clock, Zap, Star,
} from "lucide-react";

export function OnlineList() {
  const onlinePlayers = useQuery(api.admin.getOnlinePlayers);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const heartbeat = useMutation(api.admin.heartbeat);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "admins" | "highlevel" | "wanted">("all");

  // Send heartbeat every 30 seconds to mark self as online
  useEffect(() => {
    const iv = setInterval(() => {
      heartbeat().catch(() => {});
    }, 30000);
    heartbeat().catch(() => {});
    return () => clearInterval(iv);
  }, [heartbeat]);

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
    return true;
  });

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Wifi className="size-6 text-green-400" />
            <span className="absolute -top-1 -right-1 size-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold">Online Players</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="size-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-400">{onlineCount ?? 0} Online</span>
          </span>
          <span className="px-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-muted-foreground">
            {onlinePlayers.length} Total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "admins", "highlevel", "wanted"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground border border-border hover:bg-accent"
            }`}>
            {f === "all" ? "🌐 All" : f === "admins" ? "🛡️ Admins" : f === "highlevel" ? "⭐ High Level" : "🔴 Wanted"}
          </button>
        ))}
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnimatePresence>
          {filtered.map((p: any, i: number) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                className={`mafia-card rounded-xl p-3 cursor-pointer transition-all hover:border-primary/30 ${
                  expanded === p._id ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      p.role === "admin" ? "bg-yellow-500/20 border-2 border-yellow-500/50" :
                      p.level >= 20 ? "bg-purple-500/20 border-2 border-purple-500/50" :
                      "bg-primary/10 border-2 border-primary/30"
                    }`}>
                      {p.role === "admin" ? <Shield className="size-4 text-yellow-400" /> :
                       p.level >= 20 ? <Crown className="size-4 text-purple-400" /> :
                       <Users className="size-4 text-primary" />}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-400 rounded-full border-2 border-background" />
                  </div>

                  {/* Info */}
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
                      <span>⭐ Lv.{p.level}</span>
                      <span>⚔️ {p.attack}</span>
                      <span>🛡️ {p.defense}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="size-2.5" />
                        {p.location?.split(" ")[0] ?? "?"}
                      </span>
                    </div>
                  </div>

                  {/* Expand arrow */}
                  {expanded === p._id
                    ? <ChevronUp className="size-4 text-muted-foreground" />
                    : <ChevronDown className="size-4 text-muted-foreground" />
                  }
                </div>

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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
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

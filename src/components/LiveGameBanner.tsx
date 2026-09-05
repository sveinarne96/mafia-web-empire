import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LIVE GAME BANNER
 * Renders whatever the admin console has pushed live:
 *  - maintenance mode (big red bar)
 *  - rotating announcements (emoji + text + color)
 *  - active global boost chips (XP/cash multipliers with countdown)
 *  - news headline ticker
 * Everything is a reactive Convex subscription, so changes made in the
 * in-game Admin panel or the Convex dashboard appear instantly for every
 * connected player — no refresh, no new link.
 */

const COLOR_STYLES: Record<string, { text: string; border: string; bg: string; chip: string }> = {
  amber: { text: "text-amber-300", border: "border-amber-500/40", bg: "from-amber-950/50 via-transparent to-amber-950/50", chip: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  red: { text: "text-red-400", border: "border-red-500/40", bg: "from-red-950/50 via-transparent to-red-950/50", chip: "bg-red-500/15 text-red-400 border-red-500/30" },
  green: { text: "text-green-400", border: "border-green-500/40", bg: "from-green-950/50 via-transparent to-green-950/50", chip: "bg-green-500/15 text-green-400 border-green-500/30" },
  blue: { text: "text-blue-400", border: "border-blue-500/40", bg: "from-blue-950/50 via-transparent to-blue-950/50", chip: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  purple: { text: "text-purple-400", border: "border-purple-500/40", bg: "from-purple-950/50 via-transparent to-purple-950/50", chip: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  cyan: { text: "text-cyan-400", border: "border-cyan-500/40", bg: "from-cyan-950/50 via-transparent to-cyan-950/50", chip: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
};

function fmtLeft(until: number) {
  const diff = Math.max(0, until - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function LiveGameBanner() {
  const live = useQuery(api.gameControl.getLiveConfig);
  const [tick, setTick] = useState(0);
  const [annIdx, setAnnIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const announcements = live?.announcements ?? [];
  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setAnnIdx((i) => (i + 1) % announcements.length), 6000);
    return () => clearInterval(t);
  }, [announcements.length]);

  if (!live) return null;

  const boosts: { icon: string; label: string; until: number }[] = [];
  if (live.xpMultiplier > 1) boosts.push({ icon: "⚡", label: `XP ×${live.xpMultiplier}`, until: live.xpMultiplierUntil });
  if (live.cashMultiplier > 1) boosts.push({ icon: "💰", label: `Cash ×${live.cashMultiplier}`, until: live.cashMultiplierUntil });
  // SUPER BOOST — automatic Thursday 00:00 → Monday 00:00 (UTC)
  const sb = live.superBoost;
  if (sb?.active) boosts.push({ icon: "🔥", label: `SUPER BOOST −75% wait & energy · +75% XP/Cash/Points · 75% bullet drops`, until: sb.endsAt });

  const headline = live.headlines?.[0];

  return (
    <div className="relative z-30">
      {/* Maintenance mode */}
      {live.maintenanceMode && (
        <div className="border-b border-red-500/40 bg-gradient-to-r from-red-950/70 via-red-900/40 to-red-950/70 px-4 py-2 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-black text-red-400 animate-pulse">
            <span className="size-2 rounded-full bg-red-500 animate-ping" />
            {live.maintenanceMessage || "🔧 Server maintenance in progress — back soon!"}
          </span>
        </div>
      )}

      {/* Live announcements */}
      {announcements.length > 0 && (
        <div className={`border-b ${COLOR_STYLES[announcements[annIdx % announcements.length]?.color ?? "amber"]?.border ?? "border-amber-500/40"} bg-gradient-to-r ${COLOR_STYLES[announcements[annIdx % announcements.length]?.color ?? "amber"]?.bg ?? "from-amber-950/50 via-transparent to-amber-950/50"} px-4 py-1.5 overflow-hidden`}>
          <div className="mx-auto max-w-6xl flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-black opacity-50 shrink-0">Live</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={announcements[annIdx % announcements.length]?._id ?? annIdx}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="flex-1 min-w-0 flex items-center gap-2"
              >
                <span className="text-sm">{announcements[annIdx % announcements.length]?.emoji ?? "📣"}</span>
                <span className={`text-xs font-bold truncate ${COLOR_STYLES[announcements[annIdx % announcements.length]?.color ?? "amber"]?.text ?? "text-amber-300"}`}>
                  {announcements[annIdx % announcements.length]?.text}
                </span>
                <span className="text-[9px] opacity-40 shrink-0">
                  {Math.ceil(Math.max(0, (announcements[annIdx % announcements.length]?.expiresAt ?? 0) - Date.now()) / 3600000)}h left
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Boost chips + headline ticker */}
      {(boosts.length > 0 || headline) && (
        <div className="border-b border-amber-500/10 bg-black/30 px-4 py-1">
          <div className="mx-auto max-w-6xl flex items-center gap-2 flex-wrap">
            {boosts.map((b) => (
              <span key={b.label} className={`px-2 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1 ${COLOR_STYLES.cyan.chip}`}>
                {b.icon} {b.label} <span className="opacity-60 font-bold">⏳ {fmtLeft(b.until)}</span>
              </span>
            ))}
            {headline && (
              <span className="text-[10px] text-muted-foreground truncate flex-1 min-w-0">
                <span className="text-red-400/80 font-black mr-1">📰 {headline.crimeType === "breaking" ? "BREAKING" : headline.crimeType.toUpperCase()}:</span>
                {headline.title}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
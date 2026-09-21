import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { CalendarClock, Hourglass } from "lucide-react";

/**
 * SEASON BANNER — always-on strip at the very top of the game.
 * Shows the active season and a live DDd HHh MMm SSs countdown to its end.
 * Pulls from the server (admin Seasonal System), so it updates for everyone
 * the moment a season starts or its end date changes.
 */
export function SeasonBanner() {
  const season = useQuery(api.serverOps.getSeasonPublic);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!season) return null;

  const num = String(season.number ?? 1).padStart(2, "0");
  const hasEnd = season.hasEnd && (season.plannedEndsAt ?? 0) > now;

  // Live countdown — days / hours / minutes / seconds
  const msLeft = Math.max(0, (season.plannedEndsAt ?? 0) - now);
  const totalSec = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  // Progress across the season window (for the subtle fill bar)
  const started = season.startedAt ?? 0;
  const ends = season.plannedEndsAt ?? 0;
  const progress = started && ends && ends > started
    ? Math.min(1, Math.max(0, (now - started) / (ends - started)))
    : 0;

  // Final 72 hours = urgency styling
  const urgent = hasEnd && msLeft <= 72 * 3600 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full overflow-hidden border-b ${urgent ? "border-red-500/30" : "border-violet-500/25"}`}
      style={{
        background: urgent
          ? "linear-gradient(90deg, rgba(127,29,29,0.35), rgba(88,28,135,0.18), rgba(127,29,29,0.35))"
          : "linear-gradient(90deg, rgba(76,29,149,0.28), rgba(30,27,75,0.22), rgba(76,29,149,0.28))",
      }}
    >
      {/* shimmering edge */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: urgent
            ? "linear-gradient(90deg, transparent, rgba(248,113,113,0.8), transparent)"
            : "linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent)",
        }}
      />
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-3 py-1.5 sm:gap-3">
        <CalendarClock className={`size-3.5 shrink-0 ${urgent ? "text-red-300" : "text-violet-300"}`} />

        <span className={`text-[10px] font-black uppercase tracking-[0.18em] sm:text-[11px] ${urgent ? "text-red-200" : "text-violet-200"}`}>
          Season {num}
        </span>

        <span className="hidden text-[10px] font-bold text-violet-300/60 sm:inline">
          {season.name}
        </span>

        {hasEnd ? (
          <>
            <Hourglass className={`size-3 shrink-0 animate-pulse ${urgent ? "text-red-300" : "text-violet-300/80"}`} />
            <div className="flex items-center gap-1 tabular-nums">
              <TimeCell value={days} label="d" urgent={urgent} />
              <Sep urgent={urgent} />
              <TimeCell value={pad(hours)} label="h" urgent={urgent} />
              <Sep urgent={urgent} />
              <TimeCell value={pad(minutes)} label="m" urgent={urgent} />
              <Sep urgent={urgent} />
              <TimeCell value={pad(seconds)} label="s" urgent={urgent} />
            </div>
            <span className="hidden text-[9px] font-bold uppercase tracking-widest text-violet-300/50 md:inline">
              to season end
            </span>
          </>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300/60">
            · running — end date not set
          </span>
        )}
      </div>

      {/* season progress fill */}
      {hasEnd && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-black/30">
          <div
            className={`h-full transition-all duration-1000 ${urgent ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-violet-500 to-fuchsia-400"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

function TimeCell({ value, label, urgent }: { value: number | string; label: string; urgent: boolean }) {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className={`text-[11px] font-black sm:text-xs ${urgent ? "text-red-200" : "text-white"}`}>{value}</span>
      <span className={`text-[9px] font-bold ${urgent ? "text-red-300/70" : "text-violet-300/70"}`}>{label}</span>
    </span>
  );
}

function Sep({ urgent }: { urgent: boolean }) {
  return <span className={`text-[10px] font-black ${urgent ? "text-red-400/50" : "text-violet-400/40"}`}>:</span>;
}

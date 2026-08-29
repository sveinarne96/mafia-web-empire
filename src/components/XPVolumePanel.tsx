import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TIER_COLORS = [
  "text-slate-500",     // 0
  "text-orange-400",    // 5
  "text-orange-500",    // 15
  "text-red-400",       // 30
  "text-red-500",       // 50
  "text-pink-400",      // 75
  "text-pink-500",      // 100
  "text-purple-400",    // 150
  "text-purple-500",    // 200
  "text-amber-400",     // 300
  "text-yellow-300",    // 500
];

const TIER_BARS = ["▱▱▱▱▱", "▰▱▱▱▱", "▰▰▱▱▱", "▰▰▰▱▱", "▰▰▰▰▱", "▰▰▰▰▰"];

export function XPVolumePanel() {
  const volume = useQuery(api.xpVolume.getVolumeStatus);

  if (!volume) return null;

  const { actions, mult, label, tier, nextTierAt, nextTierMult } = volume;
  const progress = nextTierAt > 0 ? Math.min(100, (actions / nextTierAt) * 100) : 100;
  const colorClass = TIER_COLORS[Math.min(tier, TIER_COLORS.length - 1)];
  const barIndex = Math.min(Math.floor(tier / 2), TIER_BARS.length - 1);

  return (
    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-400">⚡ XP Volume</span>
        {mult > 1 && (
          <span className={`text-[10px] font-black ${colorClass}`}>
            {mult}x
          </span>
        )}
      </div>

      {/* Volume bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: tier >= 5
              ? "linear-gradient(90deg, #f97316, #ef4444, #ec4899, #a855f7)"
              : tier >= 2
              ? "linear-gradient(90deg, #f97316, #ef4444)"
              : "#f97316",
          }}
        />
      </div>

      <div className="flex justify-between text-[9px]">
        <span className="text-slate-500">
          {actions} actions/hr
        </span>
        {label ? (
          <span className={`font-bold ${colorClass}`}>{label}</span>
        ) : (
          <span className="text-slate-600">Do actions to boost XP</span>
        )}
      </div>

      {nextTierAt > 0 && actions < nextTierAt && (
        <div className="mt-1 text-[8px] text-slate-600">
          {nextTierAt - actions} more for {nextTierMult}x
        </div>
      )}

      {mult > 1 && (
        <div className="mt-1.5 text-center">
          <span className={`text-xs font-black ${colorClass} animate-pulse`}>
            {TIER_BARS[barIndex]}
          </span>
        </div>
      )}
    </div>
  );
}

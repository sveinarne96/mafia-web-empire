import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TIER_BARS = ["▱▱▱▱▱", "▰▱▱▱▱", "▰▰▱▱▱", "▰▰▰▱▱", "▰▰▰▰▱", "▰▰▰▰▰"];

export function XPVolumePanel() {
  const volume = useQuery(api.xpVolume.getVolumeStatus);

  if (!volume) return null;

  const { actions, mult, label, tier, nextTierAt, nextTierMult } = volume;
  const progress = nextTierAt > 0 ? Math.min(100, (actions / nextTierAt) * 100) : 100;
  const barIndex = Math.min(Math.floor(tier / 2), TIER_BARS.length - 1);

  return (
    <div className="animate-neon-light-glow bg-slate-900/50 rounded-xl p-3 border border-cyan-400/20">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold animate-neon-light-text drop-shadow">⚡ XP Volume</span>
        {mult > 1 && (
          <span className="text-sm font-black animate-neon-light-text drop-shadow">
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
            background: "linear-gradient(90deg, #67e8f9, #a7f3d0, #fde68a, #fbcfe8, #c4b5fd, #67e8f9)",
            backgroundSize: "300% 100%",
            animation: "neon-light-flow 4s linear infinite",
            boxShadow: "0 0 10px rgba(150,230,255,0.5)",
          }}
        />
      </div>

      <div className="flex justify-between text-[11px]">
        <span className="text-slate-300">
          {actions} actions/hr
        </span>
        {label ? (
          <span className="font-bold animate-neon-light-text drop-shadow">{label}</span>
        ) : (
          <span className="text-slate-400">Do actions to boost XP</span>
        )}
      </div>

      {nextTierAt > 0 && actions < nextTierAt && (
        <div className="mt-1 text-[10px] animate-neon-light-text drop-shadow">
          {nextTierAt - actions} more for {nextTierMult}x
        </div>
      )}

      {mult > 1 && (
        <div className="mt-1.5 text-center">
          <span className="text-base font-black animate-neon-light-text drop-shadow">
            {TIER_BARS[barIndex]}
          </span>
        </div>
      )}
    </div>
  );
}

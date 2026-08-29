import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

function ResourceBar({ label, icon, value, max, color, regen, regenLabel }: {
  label: string; icon: string; value: number; max: number; color: string; regen?: number; regenLabel?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const isLow = pct < 25;
  const isCritical = pct < 10;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1">
          <span className={isCritical ? "animate-pulse" : ""}>{icon}</span>
          <span className="font-bold text-slate-300">{label}</span>
        </span>
        <span className={`font-bold ${isLow ? "text-red-400" : "text-slate-400"}`}>{value}/{max}</span>
      </div>
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={false} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }} />
        {isLow && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-500/20 animate-pulse" />}
      </div>
      {regen !== undefined && regen > 0 && (
        <div className="text-[8px] text-slate-600">+1 in {Math.ceil(regen / 1000)}s</div>
      )}
    </div>
  );
}

export function ResourcesPanel() {
  const resources = useQuery(api.resourceSystem.getResources);
  if (!resources) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">⚡ Resources</div>
      <ResourceBar label="Energy" icon="⚡" value={resources.energy} max={resources.maxEnergy}
        color="bg-gradient-to-r from-yellow-500 to-amber-400" regen={resources.nextEnergyRegen} />
      <ResourceBar label="Stamina" icon="💪" value={resources.stamina} max={resources.maxStamina}
        color="bg-gradient-to-r from-green-500 to-emerald-400" regen={resources.nextStaminaRegen} />
      <ResourceBar label="Focus" icon="🧠" value={resources.focus} max={resources.maxFocus}
        color="bg-gradient-to-r from-blue-500 to-cyan-400" regen={resources.nextFocusRegen} />
      <ResourceBar label="Morale" icon="🔥" value={resources.morale} max={resources.maxMorale}
        color="bg-gradient-to-r from-orange-500 to-red-400" />
      <ResourceBar label="Adrenaline" icon="💉" value={resources.adrenaline} max={resources.maxAdrenaline}
        color="bg-gradient-to-r from-red-600 to-pink-500" />
      <ResourceBar label="Heat" icon="🔥" value={resources.heat} max={resources.maxHeat}
        color="bg-gradient-to-r from-red-700 to-red-500" />
    </div>
  );
}

export function ResourceCostBadge({ actionType }: { actionType: string }) {
  const resources = useQuery(api.resourceSystem.getResources);
  const canAffordQ = useQuery(api.resourceSystem.canAfford, { actionType });

  if (!resources || !canAffordQ) return null;
  if (!canAffordQ.canAfford) {
    return (
      <div className="text-[9px] text-red-400 font-bold mt-1">
        ⚠️ {canAffordQ.reason}
      </div>
    );
  }
  return null;
}

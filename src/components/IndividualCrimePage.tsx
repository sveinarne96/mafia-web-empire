import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { getCrimeByRoute } from "@/components/CrimeSubPages";
import { RESOURCE_COSTS } from "@/data/resourceCosts";

export function IndividualCrimePage({ route }: { route: string }) {
  const player = useQuery(api.game.getPlayer);
  const resources = useQuery(api.resourceSystem.getResources);
  const canAfford = useQuery(api.resourceSystem.canAfford, { actionType: "mission" });
  const commitCrime = useMutation(api.game.commitCategoryCrime);
  const consumeResources = useMutation(api.resourceSystem.consumeResources);
  const [result, setResult] = useState<{ success: boolean; money: number; xp: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const data = getCrimeByRoute(route);
  if (!data) return <div className="animate-fade-in mafia-card rounded-xl p-6 text-center"><div className="text-4xl mb-3">❓</div><div className="text-lg font-bold">Crime not found</div></div>;

  const { category, crime } = data;
  const costs = RESOURCE_COSTS.mission;
  const locked = (player?.level ?? 0) < crime.levelRequired;

  const categoryColors: Record<string, string> = {
    street: "border-green-500/30 from-green-950/30", robbery: "border-red-500/30 from-red-950/30",
    fraud: "border-yellow-500/30 from-yellow-950/30", burglary: "border-orange-500/30 from-orange-950/30",
    drugs: "border-purple-500/30 from-purple-950/30", organized: "border-blue-500/30 from-blue-950/30",
    underground: "border-gray-500/30 from-gray-950/30",
  };

  const execute = async () => {
    if (locked || (player?.money ?? 0) < 100) return;
    setLoading(true); setResult(null);
    try {
      await consumeResources({ actionType: "mission" });
      const res = await commitCrime({ crimeId: crime.id, reward: crime.reward, risk: crime.risk, xp: crime.xp });
      setResult({ success: res.success, money: res.moneyEarned, xp: res.xpEarned });
    } catch (e: any) { setResult({ success: false, money: 0, xp: 0 }); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <AnimatePresence>{result && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className={`rounded-xl p-6 text-center ${result.success ? "bg-green-950/50 border border-green-500/30" : "bg-red-950/50 border border-red-500/30"}`}>
          <div className={`text-4xl font-black mb-2 ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "🏆 SUCCESS!" : "💀 FAILED!"}
          </div>
          <div className="text-sm text-slate-300">
            {result.success ? `+$${result.money.toLocaleString()} · +${result.xp} XP` : "Got caught or failed the attempt"}
          </div>
          <button onClick={() => setResult(null)} className="mt-3 px-4 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold">Continue</button>
        </motion.div>
      )}</AnimatePresence>

      <div className={`rounded-xl p-6 border ${categoryColors[category.id] || "mafia-card"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">🔪</div>
          <div>
            <h2 className="text-xl font-black text-white">{crime.name}</h2>
            <p className="text-xs text-muted-foreground">{category.name} Crime</p>
          </div>
          {locked && <span className="ml-auto px-3 py-1 bg-red-950/60 text-red-400 text-xs font-bold rounded-full">🔒 Lv.{crime.levelRequired}</span>}
        </div>

        <p className="text-sm text-slate-300 mb-4">{crime.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-green-400 font-bold text-lg">${crime.reward.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Reward</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{crime.xp} XP</div>
            <div className="text-[10px] text-muted-foreground">Experience</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className={`font-bold text-lg ${crime.risk > 50 ? "text-red-400" : crime.risk > 25 ? "text-yellow-400" : "text-green-400"}`}>{crime.risk}%</div>
            <div className="text-[10px] text-muted-foreground">Risk</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-orange-400 font-bold text-lg">Lv.{crime.levelRequired}</div>
            <div className="text-[10px] text-muted-foreground">Required</div>
          </div>
        </div>

        {/* Resource Costs */}
        <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
          <div className="text-xs font-bold text-slate-400 mb-2">Resource Costs:</div>
          <div className="flex gap-3 text-[10px]">
            <span className="text-yellow-400">⚡ Energy: {costs.energy}</span>
            <span className="text-green-400">💪 Stamina: {costs.stamina}</span>
            <span className="text-blue-400">🧠 Focus: {costs.focus}</span>
          </div>
          {resources && (
            <div className="flex gap-3 text-[10px] mt-1">
              <span className={resources.energy >= costs.energy ? "text-green-400" : "text-red-400"}>⚡ {resources.energy}/{resources.maxEnergy}</span>
              <span className={resources.stamina >= costs.stamina ? "text-green-400" : "text-red-400"}>💪 {resources.stamina}/{resources.maxStamina}</span>
              <span className={resources.focus >= costs.focus ? "text-green-400" : "text-red-400"}>🧠 {resources.focus}/{resources.maxFocus}</span>
            </div>
          )}
        </div>

        <button onClick={execute} disabled={locked || loading || (player?.money ?? 0) < 100}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20">
          {loading ? "⏳ Executing..." : locked ? `🔒 Requires Level ${crime.levelRequired}` : `🔪 Execute ${crime.name}`}
        </button>
      </div>

      {/* Other crimes in same category */}
      <div className="mafia-card rounded-xl p-4">
        <h4 className="text-sm font-bold text-white mb-3">More {category.name} Crimes</h4>
        <div className="grid grid-cols-2 gap-2">
          {category.crimes.filter(c => c.id !== crime.id).slice(0, 6).map(c => (
            <button key={c.id} onClick={() => window.location.reload()}
              className="text-left bg-slate-800/30 rounded-lg px-3 py-2 hover:bg-slate-800/50 transition-all">
              <div className="text-xs font-bold text-white truncate">{c.name}</div>
              <div className="text-[10px] text-muted-foreground">Lv.{c.levelRequired} · ${c.reward.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ CRIME SCENE INVESTIGATION ═══════════ */
export function CrimeScenePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const cases = [
    { name: "The Diamond Heist", icon: "💎", status: "Active", difficulty: "Hard", evidence: 5, witnesses: 2, reward: 100000, type: "Robbery" },
    { name: "Warehouse Arson", icon: "🔥", status: "Active", difficulty: "Medium", evidence: 3, witnesses: 0, reward: 50000, type: "Arson" },
    { name: "Identity Theft Ring", icon: "🪪", status: "Active", difficulty: "Extreme", evidence: 8, witnesses: 4, reward: 250000, type: "Fraud" },
    { name: "Drug Pipeline", icon: "💊", status: "Active", difficulty: "Hard", evidence: 6, witnesses: 1, reward: 150000, type: "Drugs" },
    { name: "Arms Smuggling", icon: "🔫", status: "Active", difficulty: "Extreme", evidence: 7, witnesses: 3, reward: 300000, type: "Smuggling" },
  ];

  const forensicTools = [
    { name: "DNA Kit", icon: "🧬", cost: 15000, effect: "Match DNA to suspect", uses: 3 },
    { name: "Fingerprint Scanner", icon: "👆", cost: 8000, effect: "Identify prints at scene", uses: 5 },
    { name: "Blood Analysis", icon: "🩸", cost: 12000, effect: "Identify blood type + origin", uses: 4 },
    { name: "Fiber Collector", icon: "🧵", cost: 6000, effect: "Match clothing fibers", uses: 6 },
    { name: "Shell Casing ID", icon: "🔫", cost: 10000, effect: "Match bullet to weapon", uses: 5 },
    { name: "Digital Recovery", icon: "💻", cost: 20000, effect: "Recover deleted digital evidence", uses: 2 },
    { name: "Witness Recorder", icon: "🎙️", cost: 5000, effect: "Record witness statements", uses: 8 },
    { name: "Timeline Board", icon: "📋", cost: 3000, effect: "Reconstruct crime timeline", uses: 10 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔎</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Crime Scene Investigation</h2>
          <p className="text-xs text-slate-400">Collect evidence, reconstruct scenes, crack cases</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">📁 Active Cases</div>
          <div className="text-lg font-bold text-red-400">5</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🔍 Evidence Collected</div>
          <div className="text-lg font-bold text-cyan-400">29</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">✅ Cases Solved</div>
          <div className="text-lg font-bold text-green-400">12</div>
        </div>
      </div>

      {/* Active Cases */}
      <div className="text-xs font-bold text-red-400">📁 ACTIVE CASES</div>
      <div className="grid gap-3">
        {cases.map((c, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.type} • <span className={`font-bold ${c.difficulty === "Extreme" ? "text-red-400" : c.difficulty === "Hard" ? "text-orange-400" : "text-yellow-400"}`}>{c.difficulty}</span></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-green-400">${c.reward.toLocaleString()}</div>
                <div className="text-[9px] text-slate-400">{c.evidence} evidence • {c.witnesses} witnesses</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-2 py-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold">🔍 Analyze Evidence</button>
              <button className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-[10px] font-bold">🗣️ Interview Witnesses</button>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full" style={{ width: `${(c.evidence / 10) * 100}%` }} />
            </div>
            <div className="text-[9px] text-slate-400 text-center">Evidence: {c.evidence}/10 — {c.evidence >= 8 ? "Ready to solve!" : "Keep investigating..."}</div>
          </div>
        ))}
      </div>

      {/* Forensic Tools */}
      <div className="text-xs font-bold text-slate-200">🔬 FORENSIC TOOLS</div>
      <div className="grid grid-cols-2 gap-2">
        {forensicTools.map((t, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{t.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{t.name}</div>
                <div className="text-[9px] text-slate-400">{t.effect}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-cyan-400">{t.uses} uses left</span>
              <span className="text-[9px] text-green-400 font-bold">${t.cost.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

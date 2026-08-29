import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PrestigeLegacyPage() {
  const player = useQuery(api.game.getPlayer);
  const prestige = useMutation(api.allFeatures.prestige);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const currentLevel = player.level ?? 1;
  const currentPrestige = (player as any).prestige ?? 0;
  const canPrestige = currentLevel >= 100;
  const multiplier = (player as any).prestigeMultiplier ?? 1;

  async function handlePrestige() {
    if (busy || !canPrestige) return;
    if (!window.confirm("Prestige now? Your level, rank progress, health, attack, and defense will reset. Cash and inventory are kept.")) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await prestige();
      setMessage(`Prestige ${result.newPrestige} unlocked. Your permanent bonus is now ${(result.multiplier * 100).toFixed(0)}% progression.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Prestige failed");
    } finally {
      setBusy(false);
    }
  }

  const legacy = [
    ["Crime Kingpin", "👑", "Complete 1,000 crimes", "+5% permanent crime bonus"],
    ["Millionaire", "💰", "Earn $10M total", "Start with $50K"],
    ["PvP Legend", "⚔️", "Win 100 PvP fights", "+10 ATK permanent"],
    ["Gambling Pro", "🎰", "Win 500 gambling games", "+15% gambling luck"],
    ["Empire Builder", "🏢", "Own 10 businesses", "+25% income"],
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-float">⭐</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Prestige</h2>
          <p className="text-xs text-slate-400">Reset your rank for a permanent progression bonus.</p>
        </div>
      </div>

      <div className="mafia-card rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-red-900/20 p-5 text-center animate-border-glow">
        <div className="text-[10px] tracking-[0.3em] text-amber-400">CURRENT PRESTIGE</div>
        <div className="mt-1 text-4xl font-black text-amber-300">{currentPrestige}</div>
        <div className="mt-2 text-xs text-slate-300">Level {currentLevel} · Current multiplier {(multiplier * 100).toFixed(0)}%</div>
        <div className="mx-auto mt-4 max-w-md rounded-lg border border-white/10 bg-black/20 p-3 text-left text-xs text-slate-300">
          <div className="font-bold text-amber-200">What resets</div>
          <div className="mt-1">Level and XP return to 1 / 0, health returns to 1 / 100, and combat stats return to their starting values.</div>
          <div className="mt-2 font-bold text-emerald-300">What stays</div>
          <div className="mt-1">Cash, inventory, businesses, achievements, and prestige bonuses are preserved.</div>
        </div>
        <button onClick={handlePrestige} disabled={busy || !canPrestige} className="mt-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? "RESETTING..." : canPrestige ? "⭐ PRESTIGE RESET" : `🔒 REQUIRES LEVEL 100 (${currentLevel}/100)`}
        </button>
        {message && <div className="mt-3 rounded-lg border border-amber-500/30 bg-black/20 px-3 py-2 text-xs text-amber-100">{message}</div>}
      </div>

      <div className="text-xs font-bold text-slate-200">✨ PRESTIGE PERKS</div>
      <div className="grid gap-2">
        {[
          ["Double XP", "⚡", "Permanent 2x XP gain", "Unlocked"],
          ["Crime Master", "🔪", "+15% crime success rate", "Unlocked"],
          ["Fast Learner", "🧠", "+25% skill point gain", "Locked"],
          ["Thick Skin", "💪", "+50 max HP", "Locked"],
        ].map(([name, icon, desc, status]) => (
          <div key={name} className="mafia-card flex items-center gap-3 rounded-xl p-3">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1"><div className="text-sm font-bold text-slate-200">{name}</div><div className="text-[10px] text-slate-400">{desc}</div></div>
            <span className={`text-[10px] font-bold ${status === "Unlocked" ? "text-emerald-400" : "text-slate-500"}`}>{status === "Unlocked" ? "✅" : "🔒"} {status}</span>
          </div>
        ))}
      </div>

      <div className="text-xs font-bold text-slate-200">📜 LEGACY ACHIEVEMENTS</div>
      <div className="grid gap-2">
        {legacy.map(([name, icon, requirement, reward]) => (
          <div key={name} className="mafia-card flex items-center gap-3 rounded-xl p-3">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1"><div className="text-sm font-bold text-slate-200">{name}</div><div className="text-[10px] text-slate-400">{requirement}</div><div className="text-[10px] text-cyan-400">Reward: {reward}</div></div>
            <span className="text-[10px] font-bold text-slate-500">🔄 Progress</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoopGameplayPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return <div className="animate-fade-in space-y-4"><h2 className="text-2xl font-black text-amber-400">🤝 Co-op Gameplay</h2><div className="mafia-card rounded-xl p-6 text-center text-sm text-slate-400">Team up with your crew for coordinated heists and raids.</div></div>;
}

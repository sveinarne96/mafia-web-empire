import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { wealthRankFor, wealthRankIndex, gameRankForLevel, nextGameRank, GAME_RANKS, WEALTH_RANKS } from "@/data/ranks";

const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
};

export function RanksPanel() {
  const player = useQuery(api.game.getPlayer);
  const collect = useMutation(api.empireSystem.collectEmpireIncome);
  const [payout, setPayout] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    collect().then((r) => {
      if (!alive || !r.collected) return;
      if (r.periods > 0) setPayout(`🏙️ Empire income collected — ${r.periods}d · ${r.cash ? "$" + Math.floor(r.cash).toLocaleString() : ""} +${Math.floor(r.points ?? 0)} pts +${Math.floor(r.bullets ?? 0)} 💀`);
    }).catch(() => {});
    return () => { alive = false; };
  }, [collect]);

  if (!player) return <div className="animate-pulse py-6 text-center text-muted-foreground">Loading ranks...</div>;

  const total = (player.money ?? 0) + (player.bank ?? 0);
  const level = player.level ?? 1;
  const wealth = wealthRankFor(total);
  const wealthIdx = wealthRankIndex(total);
  const upper = WEALTH_RANKS[wealthIdx - 1];
  const game = gameRankForLevel(level);
  const next = nextGameRank(level);
  const nextIdx = GAME_RANKS.indexOf(game);

  const wealthNextPct = upper ? Math.min(100, Math.round(((total - wealth.min) / (upper.min - wealth.min)) * 100)) : 100;
  const gameNextPct = next ? Math.min(100, Math.round(((level - GAME_RANKS[nextIdx].level) / (next.level - GAME_RANKS[nextIdx].level)) * 100)) : 100;

  return (
    <div className="mafia-card rounded-xl p-5 space-y-4">
      <div className="text-sm font-bold">🎖️ Your Ranks</div>
      {payout && <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-3 text-xs font-bold text-green-400">{payout}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Wealth rank */}
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{wealth.icon}</span>
            <div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Wealth Rank</div>
              <div className="text-lg font-black" style={{ color: wealth.color }}>{wealth.label}</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">Cash + Bank · <span className="text-amber-300 font-bold">{short(total)}</span></div>
          <div className="h-1.5 bg-background/60 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${wealthNextPct}%`, background: wealth.color }} /></div>
          <div className="text-[10px] text-muted-foreground mt-1">{upper ? `${short(upper.min - total)} to ${upper.label}` : "Max wealth rank"}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {WEALTH_RANKS.map((r) => <span key={r.id} className={`px-1.5 py-0.5 rounded text-[8px] font-black ${total >= r.min ? "text-black" : "text-muted-foreground bg-slate-800/60"}`} style={total >= r.min ? { background: r.color } : undefined}>{r.icon}{r.label}</span>)}
          </div>
        </div>
        {/* Game rank */}
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{game.icon}</span>
            <div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Game Rank</div>
              <div className="text-lg font-black" style={{ color: game.color }}>{game.label}</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">Level <span className="text-yellow-300 font-bold">{level}</span></div>
          {next ? (
            <>
              <div className="h-1.5 bg-background/60 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${gameNextPct}%`, background: next.color }} /></div>
              <div className="text-[10px] text-muted-foreground mt-1">{next.level - level} levels to {next.label}</div>
            </>
          ) : <div className="text-[10px] text-amber-400 font-bold">Maximum rank reached</div>}
          <div className="flex flex-wrap gap-1 mt-2">
            {GAME_RANKS.map((r) => <span key={r.label} className={`px-1.5 py-0.5 rounded text-[8px] font-black ${level >= r.level ? "text-black" : "text-muted-foreground bg-slate-800/60"}`} style={level >= r.level ? { background: r.color } : undefined}>{r.icon}{r.label}</span>)}
          </div>
        </div>
      </div>
      <div className="text-[9px] text-slate-500">Wealth ranks are based on your total cash + bank balance. Game ranks unlock as you level up.</div>
    </div>
  );
}
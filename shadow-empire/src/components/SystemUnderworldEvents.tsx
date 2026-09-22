import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ UNDERWORLD ECONOMY ═══════════ */
export function UnderworldEconomyPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const operations = [
    { name: "Money Laundering", icon: "🧺", description: "Clean dirty money through fronts", efficiency: 75, cost: 10000, output: "Clean $9,000", status: "active" },
    { name: "Loan Sharking", icon: "🦈", description: "Lend money at high interest rates", efficiency: 85, cost: 50000, output: "$5K/day interest", status: "active" },
    { name: "Protection Rackets", icon: "🛡️", description: "Collect from local businesses", efficiency: 60, cost: 20000, output: "$8K/day", status: "active" },
    { name: "Drug Routes", icon: "💊", description: "Set up distribution networks", efficiency: 70, cost: 100000, output: "$25K/day", status: "locked" },
    { name: "Smuggling Network", icon: "🚛", description: "Move contraband across borders", efficiency: 65, cost: 150000, output: "$35K/day", status: "locked" },
    { name: "Counterfeiting Ring", icon: "💵", description: "Print fake currency", efficiency: 55, cost: 200000, output: "$15K/day", status: "locked" },
    { name: "Gambling Dens", icon: "🎰", description: "Run underground gambling", efficiency: 80, cost: 80000, output: "$18K/day", status: "active" },
    { name: "Fence Network", icon: "🏪", description: "Sell stolen goods through dealers", efficiency: 72, cost: 30000, output: "$10K/day", status: "active" },
  ];

  const bounties = [
    { target: "xXShadowXx", icon: "🎯", bounty: 50000, postedBy: "DarkBoss", crime: "Robbed my warehouse", timeLeft: "2d 8h" },
    { target: "CrimeKing99", icon: "🎯", bounty: 125000, postedBy: "TheDon", crime: "Killed my crew member", timeLeft: "5d 12h" },
    { target: "StreetRat01", icon: "🎯", bounty: 25000, postedBy: "MafiaQueen", crime: "Stole from my shop", timeLeft: "1d 3h" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏴‍☠️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Underworld Economy</h2>
          <p className="text-xs text-slate-400">Money laundering, loan sharking, and criminal enterprises</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💰 Daily Revenue</div>
          <div className="text-lg font-bold text-green-400">$86K</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🏢 Active Ops</div>
          <div className="text-lg font-bold text-cyan-400">5</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">📊 Efficiency</div>
          <div className="text-lg font-bold text-amber-400">74%</div>
        </div>
      </div>

      {/* Operations */}
      <div className="text-xs font-bold text-slate-200">🏴 CRIMINAL OPERATIONS</div>
      <div className="grid gap-2">
        {operations.map((op, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 flex items-center gap-3 ${op.status === "locked" ? "opacity-50" : ""}`}>
            <span className="text-2xl">{op.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{op.name}</div>
              <div className="text-[10px] text-slate-400">{op.description}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${op.efficiency}%` }} />
                </div>
                <span className="text-[9px] text-green-400 font-bold">{op.efficiency}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-green-400">{op.output}</div>
              {op.status === "locked" ? (
                <button className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-[9px] font-bold mt-1">🔒 Locked</button>
              ) : (
                <button className="px-2 py-0.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold mt-1">Manage</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bounty Board */}
      <div className="text-xs font-bold text-slate-200">🎯 BOUNTY BOARD</div>
      <div className="grid gap-2">
        {bounties.map((b, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3 border border-red-900/30">
            <span className="text-2xl">{b.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-red-400 text-sm">{b.target}</div>
              <div className="text-[10px] text-slate-400">Posted by {b.postedBy} — "{b.crime}"</div>
              <div className="text-[9px] text-slate-400">⏱️ {b.timeLeft}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-400">${b.bounty.toLocaleString()}</div>
              <button className="px-2 py-0.5 bg-red-600/20 border border-red-500/30 text-red-300 rounded text-[9px] font-bold mt-1">Accept</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ DYNAMIC WORLD EVENTS ═══════════ */
export function DynamicWorldEventsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const events = [
    { name: "City Blackout", icon: "🌑", description: "Power grid goes down — crime spike", effect: "+30% crime success", duration: "6 hours", status: "active", started: "2h ago" },
    { name: "Mass Protest", icon: "📢", description: "Civil unrest creates chaos in downtown", effect: "Downtown crimes +25%", duration: "12 hours", status: "upcoming", starts: "in 4h" },
    { name: "Heat Wave", icon: "🔥", description: "Extreme heat — NPCs stay indoors", effect: "+15% stealth crime bonus", duration: "24 hours", status: "active", started: "8h ago" },
    { name: "Police Strike", icon: "🚔", description: "Officers on strike — reduced patrols", effect: "Wanted decay +50%", duration: "8 hours", status: "upcoming", starts: "in 2 days" },
    { name: "Festival Season", icon: "🎪", description: "Street festivals everywhere — easy pickpocketing", effect: "+40% pickpocket success", duration: "48 hours", status: "upcoming", starts: "in 5 days" },
    { name: "Economic Boom", icon: "📈", description: "Markets are soaring — stock prices rise", effect: "Stock market +20%", duration: "72 hours", status: "ended", ended: "1 day ago" },
  ];

  const randomEvents = [
    { name: "Found Wallet", icon: "👛", description: "A dropped wallet on the street", reward: "$500 - $5,000", chance: "15% per crime" },
    { name: "Ambushed by Rival", icon: "⚔️", description: "Random PvP encounter", reward: "Win: +rep, Lose: -HP", chance: "10% during crimes" },
    { name: "Police Chase", icon: "🚨", description: "Cops spot you during a crime", reward: "Escape: no penalty, Caught: prison", chance: "20% without stealth" },
    { name: "Lucky Find", icon: "🍀", description: "Stumble upon valuable item", reward: "Random rare item", chance: "5% during exploration" },
    { name: "Informant Tip", icon: "🐀", description: "Anonymous tip about an opportunity", reward: "Bonus mission unlocked", chance: "8% daily" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🌍</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Dynamic World Events</h2>
          <p className="text-xs text-slate-400">The city is alive — events change the rules constantly</p>
        </div>
      </div>

      {/* Active Events */}
      <div className="text-xs font-bold text-red-400">🔴 ACTIVE EVENTS</div>
      <div className="grid gap-2">
        {events.filter(e => e.status === "active").map((e, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 border border-green-500/30 bg-green-900/10 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{e.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{e.name}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 animate-pulse">LIVE</span>
                </div>
                <div className="text-[10px] text-slate-400">{e.description}</div>
              </div>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-green-400 font-bold">✨ {e.effect}</span>
              <span className="text-slate-400">⏱️ {e.duration} • Started {e.started}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="text-xs font-bold text-yellow-400">🟡 UPCOMING EVENTS</div>
      <div className="grid gap-2">
        {events.filter(e => e.status === "upcoming").map((e, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3 border border-yellow-900/30">
            <span className="text-2xl">{e.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{e.name}</div>
              <div className="text-[10px] text-slate-400">{e.description}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-yellow-400 font-bold">⏱️ {e.starts}</div>
              <div className="text-[9px] text-green-400">{e.effect}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Random Events */}
      <div className="text-xs font-bold text-slate-200">🎲 RANDOM EVENTS (Can happen anytime)</div>
      <div className="grid gap-2">
        {randomEvents.map((r, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{r.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{r.name}</div>
              <div className="text-[10px] text-slate-400">{r.description}</div>
              <div className="text-[10px] text-cyan-400">Reward: {r.reward}</div>
            </div>
            <span className="text-[9px] text-amber-400 font-bold">{r.chance}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

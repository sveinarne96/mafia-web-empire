import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ PRESTIGE & LEGACY ═══════════ */
export function PrestigeLegacyPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const prestigePerks = [
    { name: "Double XP", icon: "⚡", desc: "Permanent 2x XP gain", cost: 1, unlocked: true },
    { name: "Crime Master", icon: "🔪", desc: "+15% crime success rate", cost: 2, unlocked: true },
    { name: "Lucky Star", icon: "🍀", desc: "+10% gambling luck", cost: 1, unlocked: false },
    { name: "Crime Immunity", icon: "🛡️", desc: "First crime of day is free", cost: 3, unlocked: false },
    { name: "Fast Learner", icon: "🧠", desc: "+25% skill point gain", cost: 2, unlocked: false },
    { name: "Thick Skin", icon: "💪", desc: "+50 max HP", cost: 2, unlocked: false },
    { name: "Silver Tongue", icon: "🗣️", desc: "+20% bribe success", cost: 3, unlocked: false },
    { name: "Ghost Protocol", icon: "👻", desc: "Ghost mode costs 50% less", cost: 4, unlocked: false },
    { name: "Crime Empire", icon: "👑", desc: "+30% business income", cost: 5, unlocked: false },
    { name: "Godfather's Blessing", icon: "✝️", desc: "All stats +10%", cost: 10, unlocked: false },
  ];

  const legacy = [
    { name: "Crime Kingpin", icon: "👑", requirement: "Complete 1000 crimes", reward: "+5% permanent crime bonus", status: "completed" },
    { name: "Millionaire", icon: "💰", requirement: "Earn $10M total", reward: "Start with $50K", status: "completed" },
    { name: "PvP Legend", icon: "⚔️", requirement: "Win 100 PvP fights", reward: "+10 ATK permanent", status: "in-progress" },
    { name: "Gambling Pro", icon: "🎰", requirement: "Win 500 gambling games", reward: "+15% gambling luck", status: "in-progress" },
    { name: "Ghost Master", icon: "👻", requirement: "Complete 50 stealth missions", reward: "Free ghost mode", status: "locked" },
    { name: "Empire Builder", icon: "🏢", requirement: "Own 10 businesses", reward: "+25% income", status: "locked" },
  ];

  const hallOfFame = [
    { rank: 1, name: "ShadowKing", level: 142, title: "Shadow Emperor", cash: "$10.2B", kills: 847 },
    { rank: 2, name: "CrimeBoss99", level: 138, title: "Godfather", cash: "$8.7B", kills: 623 },
    { rank: 3, name: "TheDon", level: 131, title: "Don", cash: "$6.1B", kills: 512 },
    { rank: 4, name: "MafiaQueen", level: 125, title: "Underboss", cash: "$4.5B", kills: 445 },
    { rank: 5, name: "StreetLegend", level: 118, title: "Consigliere", cash: "$3.2B", kills: 380 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">👑</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Prestige & Legacy</h2>
          <p className="text-xs text-slate-400">Reset for power, leave your mark on history</p>
        </div>
      </div>

      {/* Prestige Status */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/20">
        <div className="text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-[10px] text-amber-400 tracking-widest">PRESTIGE RANK</div>
          <div className="text-3xl font-black text-amber-400">{(player as any).prestige ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Prestige Points: <span className="text-amber-400 font-bold">{(player as any).prestigePoints ?? 0}</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Requirement: Level 50+ to prestige</div>
          <button className="mt-3 px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
            ⭐ PRESTIGE RESET
          </button>
        </div>
      </div>

      {/* Prestige Perks */}
      <div className="text-xs font-bold text-slate-200">✨ PRESTIGE PERKS</div>
      <div className="grid gap-2">
        {prestigePerks.map((p, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 flex items-center gap-3 ${p.unlocked ? "border border-green-500/30" : ""}`}>
            <span className="text-2xl">{p.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.desc}</div>
            </div>
            <div className="text-right">
              {p.unlocked ? (
                <span className="text-[10px] font-bold text-green-400">✅ Unlocked</span>
              ) : (
                <button className="px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">
                  {p.cost} ⭐ Points
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legacy Achievements */}
      <div className="text-xs font-bold text-slate-200">📜 LEGACY ACHIEVEMENTS</div>
      <div className="grid gap-2">
        {legacy.map((l, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 flex items-center gap-3 ${l.status === "completed" ? "border border-green-500/30" : l.status === "locked" ? "opacity-50" : ""}`}>
            <span className="text-2xl">{l.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{l.name}</div>
              <div className="text-[10px] text-slate-400">{l.requirement}</div>
              <div className="text-[10px] text-cyan-400">Reward: {l.reward}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.status === "completed" ? "bg-green-900/40 text-green-400" : l.status === "in-progress" ? "bg-yellow-900/40 text-yellow-400" : "bg-slate-800/40 text-slate-500"}`}>
              {l.status === "completed" ? "✅ Done" : l.status === "in-progress" ? "🔄 Progress" : "🔒 Locked"}
            </span>
          </div>
        ))}
      </div>

      {/* Hall of Fame */}
      <div className="text-xs font-bold text-slate-200">🏆 HALL OF FAME</div>
      <div className="mafia-card rounded-xl p-3 space-y-2">
        {hallOfFame.map((h, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20">
            <span className={`text-lg font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-slate-400"}`}>#{h.rank}</span>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-200">{h.name}</div>
              <div className="text-[9px] text-slate-400">{h.title} • Lv.{h.level}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-green-400">{h.cash}</div>
              <div className="text-[9px] text-red-400">💀 {h.kills} kills</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ CO-OP GAMEPLAY ═══════════ */
export function CoopGameplayPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const heists = [
    { name: "Bank Heist", icon: "🏦", difficulty: "Hard", players: "2-4", reward: "$500K", time: "30 min", roles: ["Hacker", "Driver", "Enforcer", "Insider"] },
    { name: "Casino Vault", icon: "🎰", difficulty: "Extreme", players: "3-5", reward: "$2M", time: "45 min", roles: ["Card Sharp", "Lookout", "Explosives", "Driver", "Hacker"] },
    { name: "Art Gallery", icon: "🖼️", difficulty: "Medium", players: "2-3", reward: "$250K", time: "20 min", roles: ["Cat Burglar", "Lookout", "Forger"] },
    { name: "Government Facility", icon: "🏛️", difficulty: "Extreme", players: "4-6", reward: "$5M", time: "60 min", roles: ["Hacker", "Infiltrator", "Driver", "Demolitions", "Insider", "Commander"] },
    { name: "Jewelry Store", icon: "💎", difficulty: "Easy", players: "2-3", reward: "$150K", time: "15 min", roles: ["Smash & Grab", "Driver", "Lookout"] },
  ];

  const raids = [
    { name: "FBI Evidence Locker", icon: "📁", difficulty: "Hard", team: "4 players", reward: "Clear wanted + $200K", status: "Looking for team" },
    { name: "Police Armory", icon: "🔫", difficulty: "Extreme", team: "5 players", reward: "Legendary weapons", status: "Full" },
    { name: "Crypto Mine", icon: "⛏️", difficulty: "Medium", team: "3 players", reward: "10 Crypto Coins", status: "Looking for team" },
  ];

  const teamRequests = [
    { name: "ProGamer420", level: 87, looking: "Heist Crew", icon: "🎮" },
    { name: "DarkKnight_X", level: 95, looking: "Raid Team", icon: "🦇" },
    { name: "ShadowQueen", level: 78, looking: "PvP Squad", icon: "👑" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🤝</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Co-op Gameplay</h2>
          <p className="text-xs text-slate-400">Team up with crew members for heists and raids</p>
        </div>
      </div>

      {/* Co-op Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🎯 Heists Done</div>
          <div className="text-lg font-bold text-green-400">12</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">⚔️ Raids Completed</div>
          <div className="text-lg font-bold text-red-400">5</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💰 Team Earnings</div>
          <div className="text-lg font-bold text-yellow-400">$3.2M</div>
        </div>
      </div>

      {/* Heists */}
      <div className="text-xs font-bold text-slate-200">🎯 HEIST PLANNING</div>
      <div className="grid gap-3">
        {heists.map((h, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{h.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{h.name}</div>
                  <div className="text-[10px] text-slate-400">{h.players} players • {h.time}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${h.difficulty === "Extreme" ? "bg-red-900/40 text-red-400" : h.difficulty === "Hard" ? "bg-orange-900/40 text-orange-400" : h.difficulty === "Medium" ? "bg-yellow-900/40 text-yellow-400" : "bg-green-900/40 text-green-400"}`}>{h.difficulty}</span>
                <div className="text-xs font-bold text-green-400 mt-1">{h.reward}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {h.roles.map((r, j) => (
                <span key={j} className="px-2 py-0.5 bg-slate-800/40 rounded text-[9px] text-slate-400 border border-slate-700/30">{r}</span>
              ))}
            </div>
            <button className="w-full px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold hover:bg-amber-600/30 transition-all">
              🎯 Plan Heist
            </button>
          </div>
        ))}
      </div>

      {/* Raids */}
      <div className="text-xs font-bold text-slate-200">⚔️ CO-OP RAIDS</div>
      <div className="grid gap-2">
        {raids.map((r, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{r.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{r.name}</div>
              <div className="text-[10px] text-slate-400">{r.team} • {r.difficulty}</div>
              <div className="text-[10px] text-cyan-400">Reward: {r.reward}</div>
            </div>
            <button className={`px-3 py-1 rounded-lg text-xs font-bold ${r.status === "Full" ? "bg-slate-700/50 text-slate-400" : "bg-green-600/20 border border-green-500/30 text-green-300"}`}>
              {r.status}
            </button>
          </div>
        ))}
      </div>

      {/* Looking for Group */}
      <div className="text-xs font-bold text-slate-200">👥 LOOKING FOR GROUP</div>
      <div className="grid gap-2">
        {teamRequests.map((t, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{t.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{t.name}</div>
              <div className="text-[10px] text-slate-400">Lv.{t.level} — {t.looking}</div>
            </div>
            <button className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-bold">Invite</button>
          </div>
        ))}
        <button className="w-full px-3 py-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-xs font-bold">
          📢 Post Looking for Group
        </button>
      </div>
    </div>
  );
}

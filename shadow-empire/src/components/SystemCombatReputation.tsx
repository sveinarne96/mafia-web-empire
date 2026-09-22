import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ ADVANCED COMBAT ═══════════ */
export function AdvancedCombatPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const styles = [
    { name: "Boxing", icon: "🥊", atk: 15, def: 10, speed: 12, special: "Upper Cut — 2x damage", level: 5 },
    { name: "Krav Maga", icon: "🥋", atk: 18, def: 12, speed: 15, special: "Counter Strike — dodge + hit", level: 10 },
    { name: "Muay Thai", icon: "🦵", atk: 22, def: 8, speed: 14, special: "Clinch — stun opponent", level: 15 },
    { name: "Brazilian Jiu-Jitsu", icon: "🤼", atk: 12, def: 20, speed: 10, special: "Submission — bypass armor", level: 20 },
    { name: "Ninjutsu", icon: "🥷", atk: 20, def: 10, speed: 25, special: "Shadow Strike — guaranteed crit", level: 25 },
    { name: "Street Fighting", icon: "👊", atk: 25, def: 5, speed: 8, special: "Dirty Move — ignore rules", level: 8 },
  ];

  const weapons = [
    { name: "Fists", icon: "✊", damage: 10, tier: "Basic", special: "None", durability: "∞" },
    { name: "Brass Knuckles", icon: "👊", damage: 20, tier: "Common", special: "+5 stun chance", durability: "50" },
    { name: "Baseball Bat", icon: "🏏", damage: 25, tier: "Common", special: "Knockback", durability: "40" },
    { name: "Knife", icon: "🔪", damage: 30, tier: "Rare", special: "Bleed DOT", durability: "30" },
    { name: "Katana", icon: "⚔️", damage: 45, tier: "Epic", special: "2x crit damage", durability: "25" },
    { name: "Combat Shotgun", icon: "🔫", damage: 60, tier: "Legendary", special: "Piercing + spread", durability: "15" },
  ];

  const combos = [
    { name: "Jab → Cross → Hook", damage: "1.5x", difficulty: "Easy", xp: 50 },
    { name: "Dodge → Uppercut → Knee", damage: "2x", difficulty: "Medium", xp: 100 },
    { name: "Block → Counter → Sweep → Strike", damage: "2.5x", difficulty: "Hard", xp: 200 },
    { name: "Stun → Grapple → Slam → Finish", damage: "3x", difficulty: "Extreme", xp: 400 },
  ];

  const statusEffects = [
    { name: "Bleed", icon: "🩸", effect: "5% HP/turn for 3 turns", source: "Knife attacks" },
    { name: "Stun", icon: "💫", effect: "Skip next turn", source: "Heavy hits" },
    { name: "Poison", icon: "☠️", effect: "3% HP/turn for 5 turns", source: "Poison weapons" },
    { name: "Burn", icon: "🔥", effect: "4% HP/turn for 3 turns", source: "Fire weapons" },
    { name: "Slow", icon: "🐌", effect: "-50% speed for 2 turns", source: "Heavy weapons" },
    { name: "Bleed", icon: "🩸", effect: "5% HP/turn for 3 turns", source: "Knife attacks" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚔️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Advanced Combat</h2>
          <p className="text-xs text-slate-400">Master fighting styles, weapons, and combo mechanics</p>
        </div>
      </div>

      {/* Combat Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">⚔️ ATK</div>
          <div className="text-lg font-bold text-red-400">{(player.attack ?? 0) + 10}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🛡️ DEF</div>
          <div className="text-lg font-bold text-blue-400">{(player.defense ?? 0) + 10}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🏃 SPD</div>
          <div className="text-lg font-bold text-green-400">25</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💀 Kills</div>
          <div className="text-lg font-bold text-orange-400">{player.kills ?? 0}</div>
        </div>
      </div>

      {/* Fighting Styles */}
      <div className="text-xs font-bold text-slate-200">🥋 FIGHTING STYLES</div>
      <div className="grid grid-cols-2 gap-2">
        {styles.map((s, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 space-y-2 ${i === 0 ? "ring-2 ring-amber-500/50" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{s.name}</div>
                <div className="text-[9px] text-slate-400">Lvl {s.level}+</div>
              </div>
            </div>
            <div className="flex gap-2 text-[9px] text-slate-400">
              <span>⚔️{s.atk}</span>
              <span>🛡️{s.def}</span>
              <span>🏃{s.speed}</span>
            </div>
            <div className="text-[9px] text-purple-400">✨ {s.special}</div>
            <button className="w-full px-2 py-0.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold">
              {i === 0 ? "✅ Mastered" : "Learn"}
            </button>
          </div>
        ))}
      </div>

      {/* Weapons */}
      <div className="text-xs font-bold text-slate-200">🔫 WEAPONS</div>
      <div className="grid grid-cols-2 gap-2">
        {weapons.map((w, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{w.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{w.name}</div>
                <span className={`text-[9px] font-bold ${w.tier === "Legendary" ? "text-yellow-400" : w.tier === "Epic" ? "text-purple-400" : w.tier === "Rare" ? "text-blue-400" : "text-slate-400"}`}>{w.tier}</span>
              </div>
            </div>
            <div className="text-[10px] text-red-400">⚔️ {w.damage} DMG</div>
            <div className="text-[9px] text-slate-400">✨ {w.special} • ⚡ {w.durability} uses</div>
          </div>
        ))}
      </div>

      {/* Combos */}
      <div className="text-xs font-bold text-slate-200">💥 COMBO SYSTEM</div>
      <div className="grid gap-2">
        {combos.map((c, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{c.name}</div>
              <div className="text-[10px] text-red-400">Damage: {c.damage}</div>
            </div>
            <div className="text-right">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${c.difficulty === "Extreme" ? "bg-red-900/40 text-red-400" : c.difficulty === "Hard" ? "bg-orange-900/40 text-orange-400" : c.difficulty === "Medium" ? "bg-yellow-900/40 text-yellow-400" : "bg-green-900/40 text-green-400"}`}>{c.difficulty}</span>
              <div className="text-[9px] text-cyan-400 mt-0.5">+{c.xp} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ REPUTATION & INFLUENCE ═══════════ */
export function ReputationInfluencePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const reputationTypes = [
    { name: "Street Cred", icon: "🔪", value: 85, max: 100, color: "red", desc: "Earned through daring crimes and PvP wins" },
    { name: "Notoriety", icon: "📰", value: 62, max: 100, color: "orange", desc: "Fame from criminal activities across the city" },
    { name: "Infamy", icon: "💀", value: 45, max: 100, color: "purple", desc: "Legendary status — feared by all" },
    { name: "Business Acumen", icon: "💼", value: 70, max: 100, color: "green", desc: "Respect in the business underworld" },
    { name: "Underworld Standing", icon: "🎭", value: 55, max: 100, color: "cyan", desc: "Your reputation among crime bosses" },
  ];

  const influenceActions = [
    { name: "Intimidate Rival", icon: "😠", cost: 50, effect: "Reduce rival's reputation by 10", type: "Aggressive" },
    { name: "Bribe Official", icon: "💰", cost: 100, effect: "Reduce wanted level by 1", type: "Political" },
    { name: "Spread Rumors", icon: "🗣️", cost: 30, effect: "Damage rival's business income", type: "Social" },
    { name: "Host Gala", icon: "🎭", cost: 200, effect: "+20 reputation gain for 24h", type: "Social" },
    { name: "Charity Donation", icon: "💝", cost: 150, effect: "+15 public reputation", type: "Political" },
    { name: "Blackmail Target", icon: "📁", cost: 80, effect: "Force rival to pay $50K", type: "Aggressive" },
    { name: "Control Media", icon: "📺", cost: 250, effect: "Reduce all heat by 20%", type: "Political" },
    { name: "Territory Demand", icon: "📍", cost: 120, effect: "Claim territory (+$10K/day)", type: "Aggressive" },
  ];

  const titles = [
    { name: "Street Rat", icon: "🐀", requirement: "0 rep", unlocked: true },
    { name: "Connected Guy", icon: "🤝", requirement: "25 rep", unlocked: true },
    { name: "Made Man", icon: "🔫", requirement: "50 rep", unlocked: true },
    { name: "Capo", icon: "👔", requirement: "100 rep", unlocked: false },
    { name: "Underboss", icon: "👔", requirement: "250 rep", unlocked: false },
    { name: "Godfather", icon: "👑", requirement: "500 rep", unlocked: false },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🌍</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Reputation & Influence</h2>
          <p className="text-xs text-slate-400">Build your reputation, wield influence, command respect</p>
        </div>
      </div>

      {/* Reputation Types */}
      <div className="text-xs font-bold text-slate-200">📊 REPUTATION TYPES</div>
      <div className="grid gap-3">
        {reputationTypes.map((r, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">{r.name}</div>
                  <div className="text-[9px] text-slate-400">{r.desc}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-amber-400">{r.value}/{r.max}</div>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-${r.color}-600 to-${r.color}-400 rounded-full`} style={{ width: `${(r.value / r.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Influence Actions */}
      <div className="text-xs font-bold text-slate-200">⚡ INFLUENCE POINTS: <span className="text-amber-400">{(player as any).influencePoints ?? 500}</span></div>
      <div className="grid grid-cols-2 gap-2">
        {influenceActions.map((a, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{a.icon}</span>
              <div className="text-xs font-bold text-slate-200">{a.name}</div>
            </div>
            <div className="text-[9px] text-slate-400">{a.effect}</div>
            <div className="flex justify-between items-center">
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${a.type === "Aggressive" ? "bg-red-900/40 text-red-400" : a.type === "Political" ? "bg-blue-900/40 text-blue-400" : "bg-green-900/40 text-green-400"}`}>{a.type}</span>
              <span className="text-[9px] text-amber-400 font-bold">{a.cost} ⚡</span>
            </div>
            <button className="w-full px-2 py-0.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold">Use</button>
          </div>
        ))}
      </div>

      {/* Titles */}
      <div className="text-xs font-bold text-slate-200">🏷️ REPUTATION TITLES</div>
      <div className="grid grid-cols-2 gap-2">
        {titles.map((t, i) => (
          <div key={i} className={`mafia-card rounded-xl p-2 flex items-center gap-2 ${t.unlocked ? "" : "opacity-40"}`}>
            <span className="text-lg">{t.icon}</span>
            <div>
              <div className="text-[10px] font-bold text-slate-200">{t.name}</div>
              <div className="text-[9px] text-slate-400">{t.requirement}</div>
            </div>
            {t.unlocked && <span className="text-[9px] text-green-400 ml-auto">✅</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

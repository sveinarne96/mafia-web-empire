import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ FACTION WARFARE ═══════════ */
export function FactionWarfarePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const factions = [
    { name: "La Cosa Nostra", icon: "🇮🇹", color: "red", members: 45, territory: 8, power: 9200, perks: "15% crime bonus, Heist crew access", rank: "Soldier" },
    { name: "Yakuza", icon: "🇯🇵", color: "purple", members: 38, territory: 6, power: 8100, perks: "10% gambling bonus, Tattoo shop", rank: "None" },
    { name: "Russian Bratva", icon: "🇷🇺", color: "blue", members: 52, territory: 10, power: 10500, perks: "20% smuggling bonus, Vodka empire", rank: "None" },
    { name: "The Cartel", icon: "🇲🇽", color: "green", members: 61, territory: 12, power: 11200, perks: "25% drug bonus, Farm network", rank: "None" },
    { name: "The Triads", icon: "🇨🇳", color: "yellow", members: 33, territory: 5, power: 7800, perks: "12% hacking bonus, Tech network", rank: "None" },
    { name: "Biker Gang", icon: "🏍️", color: "orange", members: 28, territory: 4, power: 6500, perks: "15% combat bonus, Bike crew", rank: "None" },
  ];

  const wars = [
    { attacker: "The Cartel", atkIcon: "🇲🇽", defender: "Russian Bratva", defIcon: "🇷🇺", score: "12,400 vs 11,800", timeLeft: "2d 14h", status: "active" },
    { attacker: "La Cosa Nostra", atkIcon: "🇮🇹", defender: "Yakuza", defIcon: "🇯🇵", score: "8,900 vs 7,600", timeLeft: "4d 8h", status: "active" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚔️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Faction Warfare</h2>
          <p className="text-xs text-slate-400">Choose a faction, fight for territory, dominate the city</p>
        </div>
      </div>

      {/* Active Wars */}
      {wars.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-red-400">🔥 ACTIVE WARS</div>
          {wars.map((w, i) => (
            <div key={i} className="mafia-card rounded-xl p-3 border border-red-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{w.atkIcon}</span>
                  <span className="text-xs font-bold text-red-400">{w.attacker}</span>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-200">⚔️ VS</div>
                  <div className="text-[9px] text-slate-400">{w.score}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400">{w.defender}</span>
                  <span className="text-lg">{w.defIcon}</span>
                </div>
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-1">⏱️ {w.timeLeft} remaining</div>
            </div>
          ))}
        </div>
      )}

      {/* Factions */}
      <div className="text-xs font-bold text-slate-200">🏛️ CHOOSE YOUR FACTION</div>
      <div className="grid gap-3">
        {factions.map((f, i) => (
          <div key={i} className={`mafia-card rounded-xl p-4 space-y-2 border-l-4 ${f.color === "red" ? "border-l-red-500" : f.color === "purple" ? "border-l-purple-500" : f.color === "blue" ? "border-l-blue-500" : f.color === "green" ? "border-l-green-500" : f.color === "yellow" ? "border-l-yellow-500" : "border-l-orange-500"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{f.name}</div>
                  <div className="text-[10px] text-slate-400">Rank: <span className="text-amber-400 font-bold">{f.rank}</span></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-cyan-400">{f.power.toLocaleString()}</div>
                <div className="text-[9px] text-slate-400">Power</div>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-400">
              <span>👥 {f.members} members</span>
              <span>📍 {f.territory} territories</span>
            </div>
            <div className="text-[10px] text-green-400">✨ {f.perks}</div>
            <button className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${f.rank !== "None" ? "bg-slate-700/50 text-slate-400 cursor-default" : `bg-${f.color}-600/20 border border-${f.color}-500/30 text-${f.color}-300 hover:bg-${f.color}-600/30`}`}>
              {f.rank !== "None" ? "✅ Joined" : "Join Faction"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ ADVANCED CRAFTING ═══════════ */
export function AdvancedCraftingPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const recipes = [
    { name: "Bulletproof Vest", icon: "🦺", tier: "Rare", materials: ["Kevlar x3", "Steel x2", "Leather x1"], stats: "+25 DEF", craftChance: 90 },
    { name: "Lockpick Set", icon: "🔐", tier: "Common", materials: ["Wire x5", "Steel x1"], stats: "+15% crime success", craftChance: 95 },
    { name: "Silenced Pistol", icon: "🔫", tier: "Epic", materials: ["Steel x4", "Gunpowder x3", "Spring x2"], stats: "+30 ATK, Stealth bonus", craftChance: 70 },
    { name: "Night Vision Goggles", icon: "🥽", tier: "Rare", materials: ["Electronics x3", "Glass x2", "Battery x1"], stats: "+20% night crime success", craftChance: 85 },
    { name: "Explosive Charge", icon: "💣", tier: "Epic", materials: ["Gunpowder x5", "Wire x3", "Timer x1"], stats: "+50 damage, Heist bonus", craftChance: 65 },
    { name: "Grappling Hook", icon: "🪝", tier: "Rare", materials: ["Steel x3", "Rope x2", "Hook x1"], stats: "+25% escape chance", craftChance: 80 },
    { name: "Fake Passport", icon: "🛂", tier: "Epic", materials: ["Paper x3", "Ink x2", "Photo x1", "Stamp x1"], stats: "Reduce wanted by 2", craftChance: 60 },
    { name: "EMP Device", icon: "📡", tier: "Legendary", materials: ["Electronics x8", "Battery x4", "Circuit x3", "Rare mineral x1"], stats: "Disable all security 30s", craftChance: 40 },
  ];

  const materials = [
    { name: "Steel", icon: "⚙️", amount: 12, maxAmount: 50 },
    { name: "Wire", icon: "🔌", amount: 8, maxAmount: 30 },
    { name: "Electronics", icon: "💻", amount: 5, maxAmount: 20 },
    { name: "Gunpowder", icon: "💥", amount: 3, maxAmount: 25 },
    { name: "Kevlar", icon: "🛡️", amount: 2, maxAmount: 15 },
    { name: "Leather", icon: "🟤", amount: 7, maxAmount: 20 },
    { name: "Glass", icon: "🔮", amount: 4, maxAmount: 15 },
    { name: "Battery", icon: "🔋", amount: 6, maxAmount: 20 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔨</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Advanced Crafting</h2>
          <p className="text-xs text-slate-400">Craft weapons, tools, and gear from raw materials</p>
        </div>
      </div>

      {/* Materials */}
      <div className="text-xs font-bold text-slate-200">📦 YOUR MATERIALS</div>
      <div className="grid grid-cols-4 gap-2">
        {materials.map((m, i) => (
          <div key={i} className="mafia-card rounded-lg p-2 text-center">
            <span className="text-lg">{m.icon}</span>
            <div className="text-[10px] font-bold text-slate-200">{m.name}</div>
            <div className="text-[9px] text-cyan-400">{m.amount}/{m.maxAmount}</div>
            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(m.amount / m.maxAmount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recipes */}
      <div className="text-xs font-bold text-slate-200">📋 CRAFTING RECIPES</div>
      <div className="grid gap-3">
        {recipes.map((r, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{r.name}</div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${r.tier === "Legendary" ? "bg-yellow-900/40 text-yellow-400" : r.tier === "Epic" ? "bg-purple-900/40 text-purple-400" : r.tier === "Rare" ? "bg-blue-900/40 text-blue-400" : "bg-slate-700/40 text-slate-400"}`}>{r.tier}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-green-400 font-bold">{r.stats}</div>
                <div className={`text-[10px] font-bold ${r.craftChance >= 80 ? "text-green-400" : r.craftChance >= 60 ? "text-yellow-400" : "text-red-400"}`}>{r.craftChance}% success</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {r.materials.map((m, j) => (
                <span key={j} className="px-2 py-0.5 bg-slate-800/40 rounded text-[9px] text-slate-400 border border-slate-700/30">{m}</span>
              ))}
            </div>
            <button className="w-full px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold hover:bg-amber-600/30 transition-all">
              🔨 Craft
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

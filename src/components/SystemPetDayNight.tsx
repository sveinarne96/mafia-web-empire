import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ PET COMPANION SYSTEM ═══════════ */
export function PetSystemPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const pets = [
    { name: "Shadow Wolf", icon: "🐺", rarity: "Legendary", stats: "+20 ATK, +15% Stealth", level: 1, maxLevel: 50, xp: 0, ability: "Pack Leader — boosts crew ATK" },
    { name: "Guard Dog", icon: "🐕", rarity: "Rare", stats: "+10 DEF, Alert to raids", level: 12, maxLevel: 50, xp: 450, ability: "Watchdog — 15% raid warning" },
    { name: "Attack Cat", icon: "🐈‍⬛", rarity: "Epic", stats: "+15 ATK, +20% Stealth", level: 5, maxLevel: 50, xp: 120, ability: "Night Prowler — +10% night crime" },
    { name: "Surveillance Hawk", icon: "🦅", rarity: "Rare", stats: "+10% Intel, Scout bonus", level: 8, maxLevel: 50, xp: 280, ability: "Eagle Eye — reveals hidden items" },
    { name: "Venomous Snake", icon: "🐍", rarity: "Epic", stats: "+25 ATK, Poison DOT", level: 3, maxLevel: 50, xp: 80, ability: "Venom Strike — poison 3 turns" },
    { name: "Therapy Pigeon", icon: "🕊️", rarity: "Common", stats: "+5 HP regen", level: 15, maxLevel: 50, xp: 800, ability: "Coo — small mood boost" },
  ];

  const shop = [
    { name: "Eagle", icon: "🦅", rarity: "Rare", price: 50000, stats: "+10% Loot find" },
    { name: "Rottweiler", icon: "🦮", rarity: "Epic", price: 120000, stats: "+30 ATK, Guard bonus" },
    { name: "Cobra", icon: "🐍", rarity: "Legendary", price: 500000, stats: "+40 ATK, Lethal poison" },
    { name: "Panther", icon: "🐆", rarity: "Legendary", price: 750000, stats: "+35 ATK/DEF, Stealth master" },
    { name: "Bear", icon: "🐻", rarity: "Epic", price: 200000, stats: "+50 DEF, Intimidation" },
    { name: "Raven", icon: "🐦‍⬛", rarity: "Rare", price: 75000, stats: "+15% Intel gathering" },
  ];

  const activePet = pets[1];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🐾</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Pet Companions</h2>
          <p className="text-xs text-slate-400">Collect, level up, and equip powerful animal companions</p>
        </div>
      </div>

      {/* Active Pet */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/30">
        <div className="text-[10px] text-amber-400 font-bold mb-2">⭐ ACTIVE COMPANION</div>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{activePet.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-slate-200">{activePet.name}</div>
            <div className="text-xs text-green-400">{activePet.stats}</div>
            <div className="text-[10px] text-purple-400 mt-1">✨ {activePet.ability}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400">Lvl {activePet.level}</span>
              <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${(activePet.xp / (activePet.level * 100)) * 100}%` }} />
              </div>
              <span className="text-[10px] text-slate-400">{activePet.xp}/{activePet.level * 100}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection */}
      <div className="text-xs font-bold text-slate-200">📖 YOUR PETS ({pets.length})</div>
      <div className="grid grid-cols-2 gap-2">
        {pets.map((p, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 space-y-2 ${i === 1 ? "ring-2 ring-amber-500/50" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{p.name}</div>
                <span className={`text-[9px] font-bold ${p.rarity === "Legendary" ? "text-yellow-400" : p.rarity === "Epic" ? "text-purple-400" : p.rarity === "Rare" ? "text-blue-400" : "text-slate-400"}`}>{p.rarity}</span>
              </div>
            </div>
            <div className="text-[10px] text-green-400">{p.stats}</div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400">Lvl {p.level}</span>
              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(p.xp / (p.level * 100)) * 100}%` }} />
              </div>
            </div>
            <button className="w-full px-2 py-0.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold">
              {i === 1 ? "✅ Equipped" : "Equip"}
            </button>
          </div>
        ))}
      </div>

      {/* Pet Shop */}
      <div className="text-xs font-bold text-slate-200">🛒 PET SHOP</div>
      <div className="grid grid-cols-2 gap-2">
        {shop.map((s, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{s.name}</div>
                <span className={`text-[9px] font-bold ${s.rarity === "Legendary" ? "text-yellow-400" : s.rarity === "Epic" ? "text-purple-400" : "text-blue-400"}`}>{s.rarity}</span>
              </div>
            </div>
            <div className="text-[10px] text-green-400">{s.stats}</div>
            <button className="w-full px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold">
              Buy ${s.price.toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ DAY/NIGHT CYCLE ═══════════ */
export function DayNightPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const now = new Date();
  const hour = now.getHours();
  const isNight = hour >= 20 || hour < 6;
  const isDawn = hour >= 6 && hour < 8;
  const isDusk = hour >= 18 && hour < 20;

  const timeOfDay = isNight ? "Night" : isDawn ? "Dawn" : isDusk ? "Dusk" : "Day";
  const timeIcon = isNight ? "🌙" : isDawn ? "🌅" : isDusk ? "🌇" : "☀️";

  const nightCrimes = [
    { name: "Bank Vault Break-In", icon: "🏦", bonus: "+30% success", time: "Night only", difficulty: "Hard" },
    { name: "Armed Convoy Ambush", icon: "🚛", bonus: "+25% success", time: "Night only", difficulty: "Hard" },
    { name: "Casino Heist", icon: "🎰", bonus: "+20% success", time: "Night only", difficulty: "Medium" },
    { name: "Yacht Robbery", icon: "🛥️", bonus: "+35% success", time: "Night only", difficulty: "Extreme" },
    { name: "Mansion Invasion", icon: "🏰", bonus: "+40% success", time: "Night only", difficulty: "Hard" },
    { name: "Power Grid Hack", icon: "⚡", bonus: "+25% success", time: "Night only", difficulty: "Medium" },
  ];

  const dayCrimes = [
    { name: "Street Robbery", icon: "🗡️", bonus: "+15% success", time: "Day only", difficulty: "Easy" },
    { name: "Identity Theft", icon: "🪪", bonus: "+20% success", time: "Day only", difficulty: "Medium" },
    { name: "Pickpocketing", icon: "🫳", bonus: "+25% success", time: "Day only", difficulty: "Easy" },
    { name: "Tax Evasion", icon: "📋", bonus: "+10% success", time: "Day only", difficulty: "Medium" },
  ];

  const weather = [
    { name: "Clear Sky", icon: "☀️", effect: "Normal crime rates", crimeBonus: 0 },
    { name: "Rain", icon: "🌧️", effect: "Less police patrols", crimeBonus: 10 },
    { name: "Heavy Storm", icon: "⛈️", effect: "Reduced visibility, +15% crime", crimeBonus: 15 },
    { name: "Fog", icon: "🌫️", effect: "Perfect for stealth crimes", crimeBonus: 20 },
    { name: "Snow", icon: "❄️", effect: "Slower getaway, +5% crime", crimeBonus: 5 },
    { name: "Heat Wave", icon: "🔥", effect: "NPCs stay indoors, +10%", crimeBonus: 10 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{timeIcon}</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Day/Night Cycle</h2>
          <p className="text-xs text-slate-400">Time and weather affect crime opportunities</p>
        </div>
      </div>

      {/* Current Time */}
      <div className={`rounded-xl p-4 border ${isNight ? "bg-indigo-900/20 border-indigo-500/30" : "bg-sky-900/20 border-sky-500/30"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{timeIcon}</span>
            <div>
              <div className="text-lg font-bold text-slate-200">{timeOfDay}</div>
              <div className="text-xs text-slate-400">{now.toLocaleTimeString()} — {isNight ? "Crimes are easier at night" : "Police are on patrol"}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Next Phase</div>
            <div className="text-sm font-bold text-amber-400">{isNight ? "Dawn in 6h" : isDawn ? "Day in 2h" : isDusk ? "Night in 2h" : "Dusk in 4h"}</div>
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="text-xs font-bold text-slate-200">🌤️ WEATHER</div>
      <div className="grid grid-cols-3 gap-2">
        {weather.map((w, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 text-center ${i === 1 ? "ring-2 ring-amber-500/50" : ""}`}>
            <span className="text-2xl">{w.icon}</span>
            <div className="text-[10px] font-bold text-slate-200 mt-1">{w.name}</div>
            <div className="text-[9px] text-slate-400">{w.effect}</div>
            {w.crimeBonus > 0 && <div className="text-[9px] text-green-400 font-bold mt-0.5">+{w.crimeBonus}% Crime</div>}
          </div>
        ))}
      </div>

      {/* Available Crimes by Time */}
      <div className="text-xs font-bold text-slate-200">{isNight ? "🌙 NIGHT CRIMES (BONUS)" : "☀️ DAY CRIMES (BONUS)"}</div>
      <div className="grid gap-2">
        {(isNight ? nightCrimes : dayCrimes).map((c, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">{c.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{c.name}</div>
              <div className="text-[10px] text-green-400">{c.bonus}</div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${c.difficulty === "Extreme" ? "bg-red-900/40 text-red-400" : c.difficulty === "Hard" ? "bg-orange-900/40 text-orange-400" : c.difficulty === "Medium" ? "bg-yellow-900/40 text-yellow-400" : "bg-green-900/40 text-green-400"}`}>{c.difficulty}</span>
            <button className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">Commit</button>
          </div>
        ))}
      </div>

      {!isNight && (
        <div className="text-xs text-slate-400 text-center">🌙 Night crimes unlock after 8PM — +20-40% crime bonuses at night!</div>
      )}
    </div>
  );
}

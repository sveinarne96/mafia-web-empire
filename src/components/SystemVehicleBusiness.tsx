import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ VEHICLE SYSTEM EXPANSION ═══════════ */
export function VehicleSystemPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const vehicles = [
    { name: "Honda Civic", icon: "🚗", tier: "Starter", speed: 20, armor: 5, stealth: 10, price: 15000, fuel: 80 },
    { name: "Yamaha R6", icon: "🏍️", tier: "Starter", speed: 35, armor: 2, stealth: 20, price: 12000, fuel: 60 },
    { name: "BMW M5", icon: "🏎️", tier: "Mid", speed: 50, armor: 15, stealth: 25, price: 85000, fuel: 70 },
    { name: "Humvee", icon: "🚙", tier: "Mid", speed: 25, armor: 40, stealth: 5, price: 120000, fuel: 40 },
    { name: "Lamborghini Aventador", icon: "🏎️", tier: "High", speed: 70, armor: 10, stealth: 15, price: 350000, fuel: 50 },
    { name: "Armored SUV", icon: "🚐", tier: "High", speed: 30, armor: 60, stealth: 10, price: 500000, fuel: 45 },
    { name: "Apache Helicopter", icon: "🚁", tier: "Elite", speed: 80, armor: 30, stealth: 5, price: 2000000, fuel: 30 },
    { name: "Stealth Van", icon: "🚐", tier: "Elite", speed: 35, armor: 45, stealth: 50, price: 750000, fuel: 55 },
  ];

  const owned = [
    { name: "Toyota Camry", icon: "🚗", tier: "Starter", speed: 15, armor: 5, stealth: 10, fuel: 90, maxFuel: 100, mods: 0 },
  ];

  const mods = [
    { name: "Turbo Kit", icon: "🔧", effect: "+15 Speed", cost: 25000 },
    { name: "Armor Plating", icon: "🛡️", effect: "+20 Armor", cost: 40000 },
    { name: "Tinted Windows", icon: "🪟", effect: "+10 Stealth", cost: 5000 },
    { name: "Nitrous Oxide", icon: "💨", effect: "+25 Speed (burst)", cost: 15000 },
    { name: "GPS Jammer", icon: "📡", effect: "+15 Stealth", cost: 30000 },
    { name: "Bulletproof Tires", icon: "🛞", effect: "+10 Armor", cost: 20000 },
    { name: "Engine Upgrade", icon: "⚙️", effect: "+20 Speed", cost: 50000 },
    { name: "Countermeasures", icon: "🚨", effect: "Escape +30%", cost: 75000 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚗</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Vehicle System</h2>
          <p className="text-xs text-slate-400">Buy, modify, and upgrade your vehicle fleet</p>
        </div>
      </div>

      {/* Your Vehicles */}
      <div className="text-xs font-bold text-slate-200">🚗 YOUR GARAGE ({owned.length})</div>
      <div className="grid gap-2">
        {owned.map((v, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{v.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-200">{v.name}</div>
                <span className="text-[9px] text-slate-400">{v.tier} Tier</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[{ label: "Speed", value: v.speed, max: 100, color: "cyan" }, { label: "Armor", value: v.armor, max: 100, color: "blue" }, { label: "Stealth", value: v.stealth, max: 100, color: "purple" }, { label: "Fuel", value: v.fuel, max: v.maxFuel, color: "green" }].map((s, j) => (
                <div key={j} className="text-center">
                  <div className="text-[9px] text-slate-400">{s.label}</div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-0.5">
                    <div className={`h-full bg-${s.color}-500 rounded-full`} style={{ width: `${(s.value / s.max) * 100}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-400">{s.value}/{s.max}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold">⛽ Refuel $500</button>
              <button className="px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">🔧 Modify</button>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Mods */}
      <div className="text-xs font-bold text-slate-200">🔧 VEHICLE MODIFICATIONS</div>
      <div className="grid grid-cols-2 gap-2">
        {mods.map((m, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{m.icon}</span>
              <div className="text-xs font-bold text-slate-200">{m.name}</div>
            </div>
            <div className="text-[10px] text-green-400">{m.effect}</div>
            <button className="w-full px-2 py-0.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold">
              Install ${m.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>

      {/* Dealership */}
      <div className="text-xs font-bold text-slate-200">🛒 DEALERSHIP</div>
      <div className="grid grid-cols-2 gap-2">
        {vehicles.map((v, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{v.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{v.name}</div>
                <span className={`text-[9px] font-bold ${v.tier === "Elite" ? "text-yellow-400" : v.tier === "High" ? "text-purple-400" : v.tier === "Mid" ? "text-blue-400" : "text-slate-400"}`}>{v.tier}</span>
              </div>
            </div>
            <div className="flex gap-2 text-[9px] text-slate-400">
              <span>🏎️{v.speed}</span>
              <span>🛡️{v.armor}</span>
              <span>🥷{v.stealth}</span>
            </div>
            <button className="w-full px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold">
              Buy ${v.price.toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ BUSINESS MANAGEMENT ═══════════ */
export function BusinessManagementPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const businesses = [
    { name: "Pizza Shop", icon: "🍕", cost: 50000, income: 3000, employees: 2, maxEmployees: 5, level: 1, maxLevel: 5, type: "Front" },
    { name: "Car Wash", icon: "🚿", cost: 75000, income: 5000, employees: 1, maxEmployees: 4, level: 1, maxLevel: 5, type: "Front" },
    { name: "Auto Repair Shop", icon: "🔧", cost: 120000, income: 8000, employees: 3, maxEmployees: 6, level: 2, maxLevel: 5, type: "Chop Shop" },
    { name: "Nightclub", icon: "🎆", cost: 500000, income: 25000, employees: 5, maxEmployees: 10, level: 1, maxLevel: 5, type: "Front" },
    { name: "Import/Export Company", icon: "📦", cost: 300000, income: 15000, employees: 3, maxEmployees: 8, level: 1, maxLevel: 5, type: "Smuggling" },
    { name: "Casino", icon: "🎰", cost: 1000000, income: 50000, employees: 8, maxEmployees: 15, level: 1, maxLevel: 5, type: "Gambling" },
  ];

  const shop = [
    { name: "Laundromat", icon: "🧺", cost: 60000, income: 3500, type: "Money Laundering" },
    { name: "Bar", icon: "🍺", cost: 80000, income: 4500, type: "Front" },
    { name: "Pawn Shop", icon: "🏪", cost: 100000, income: 6000, type: "Fence" },
    { name: "Taxi Company", icon: "🚕", cost: 150000, income: 7500, type: "Front" },
    { name: "Construction Firm", icon: "🏗️", cost: 200000, income: 10000, type: "Smuggling" },
    { name: "Private Security", icon: "🛡️", cost: 250000, income: 12000, type: "Protection" },
  ];

  const employees = [
    { name: "Street Dealer", icon: "🧑", cost: 5000, skill: "Sales", effectiveness: 70 },
    { name: "Lookout", icon: "👀", cost: 3000, skill: "Surveillance", effectiveness: 85 },
    { name: "Accountant", icon: "🧮", cost: 8000, skill: "Finance", effectiveness: 90 },
    { name: "Mechanic", icon: "👨‍🔧", cost: 6000, skill: "Engineering", effectiveness: 80 },
    { name: "Security Guard", icon: "💂", cost: 7000, skill: "Defense", effectiveness: 75 },
    { name: "Manager", icon: "👔", cost: 10000, skill: "Management", effectiveness: 95 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏢</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Business Management</h2>
          <p className="text-xs text-slate-400">Build your legitimate (and illegitimate) empire</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🏢 Businesses</div>
          <div className="text-lg font-bold text-green-400">{businesses.length}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💰 Daily Income</div>
          <div className="text-lg font-bold text-yellow-400">$106,000</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">👥 Employees</div>
          <div className="text-lg font-bold text-cyan-400">22</div>
        </div>
      </div>

      {/* Your Businesses */}
      <div className="text-xs font-bold text-slate-200">🏢 YOUR BUSINESSES</div>
      <div className="grid gap-3">
        {businesses.map((b, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{b.name}</div>
                  <div className="text-[10px] text-slate-400">{b.type} • Lvl {b.level}/{b.maxLevel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">+${b.income.toLocaleString()}/day</div>
                <div className="text-[9px] text-slate-400">{b.employees}/{b.maxEmployees} employees</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: b.maxLevel }).map((_, j) => (
                <div key={j} className={`flex-1 h-1.5 rounded-full ${j < b.level ? "bg-amber-400" : "bg-slate-700"}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button className="px-1 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold">Upgrade</button>
              <button className="px-1 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded text-[9px] font-bold">Hire Staff</button>
              <button className="px-1 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded text-[9px] font-bold">Manage</button>
            </div>
          </div>
        ))}
      </div>

      {/* Buy Businesses */}
      <div className="text-xs font-bold text-slate-200">🛒 BUY BUSINESS</div>
      <div className="grid grid-cols-2 gap-2">
        {shop.map((s, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{s.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{s.name}</div>
                <div className="text-[9px] text-slate-400">{s.type}</div>
              </div>
            </div>
            <div className="text-[10px] text-green-400">+${s.income.toLocaleString()}/day</div>
            <button className="w-full px-2 py-0.5 bg-green-600/20 border border-green-500/30 text-green-300 rounded text-[9px] font-bold">
              Buy ${s.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>

      {/* Hire Employees */}
      <div className="text-xs font-bold text-slate-200">👥 HIRE EMPLOYEES</div>
      <div className="grid grid-cols-2 gap-2">
        {employees.map((e, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{e.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{e.name}</div>
                <div className="text-[9px] text-slate-400">{e.skill}</div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${e.effectiveness}%` }} />
            </div>
            <button className="w-full px-2 py-0.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[9px] font-bold">
              Hire ${e.cost.toLocaleString()} ({e.effectiveness}% eff)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

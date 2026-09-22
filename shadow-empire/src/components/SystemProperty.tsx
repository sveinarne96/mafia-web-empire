import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ PROPERTY EMPIRE ═══════════ */
export function PropertyEmpirePage() {
  const player = useQuery(api.game.getPlayer);
  const [activeTab, setActiveTab] = useState("available");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const properties = {
    available: [
      { name: "Small Apartment", icon: "🏠", cost: 100000, income: 5000, type: "Residential", district: "Suburbs", security: "Low" },
      { name: "Abandoned Warehouse", icon: "🏭", cost: 250000, income: 15000, type: "Industrial", district: "Industrial Zone", security: "None" },
      { name: "Downtown Office", icon: "🏢", cost: 500000, income: 25000, type: "Commercial", district: "Downtown", security: "Medium" },
      { name: "Mansion", icon: "🏰", cost: 2000000, income: 50000, type: "Luxury", district: "Hills", security: "High" },
      { name: "Nightclub", icon: "🎆", cost: 750000, income: 35000, type: "Entertainment", district: "Neon District", security: "Medium" },
      { name: "Strip Mall", icon: "🏬", cost: 400000, income: 20000, type: "Commercial", district: "Suburbs", security: "Low" },
      { name: "Gas Station", icon: "⛽", cost: 150000, income: 8000, type: "Commercial", district: "Highway", security: "Low" },
      { name: "Parking Garage", icon: "🅿️", cost: 300000, income: 12000, type: "Commercial", district: "Downtown", security: "Low" },
      { name: "Beach House", icon: "🏖️", cost: 1500000, income: 40000, type: "Luxury", district: "Beachfront", security: "High" },
      { name: "Underground Bunker", icon: " bunker", cost: 3000000, income: 0, type: "Special", district: "Hidden", security: "Maximum" },
    ],
    special: [
      { name: "Drug Lab", icon: "⚗️", cost: 500000, income: 80000, type: "Illegal", production: "Methamphetamine", risk: "FBI Raid" },
      { name: "Weed Farm", icon: "🌿", cost: 200000, income: 30000, type: "Illegal", production: "Cannabis", risk: "Police Raid" },
      { name: "Chop Shop", icon: "🔧", cost: 350000, income: 45000, type: "Illegal", production: "Stolen Parts", risk: "Undercover" },
      { name: "Counterfeit Press", icon: "💵", cost: 800000, income: 60000, type: "Illegal", production: "Fake Currency", risk: "Secret Service" },
      { name: "Smuggling Tunnel", icon: "🕳️", cost: 1000000, income: 100000, type: "Illegal", production: "Contraband", risk: "Border Patrol" },
      { name: "Safe House", icon: "🏡", cost: 400000, income: 0, type: "Special", production: "Wanted reduction", risk: "None" },
    ],
    owned: [
      { name: "Dive Bar", icon: "🍺", cost: 100000, income: 8000, level: 3, maxLevel: 5 },
      { name: "Laundromat", icon: "🧺", cost: 75000, income: 5000, level: 2, maxLevel: 5 },
    ]
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏗️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Property Empire</h2>
          <p className="text-xs text-slate-400">Buy, manage, and upgrade properties across the city</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🏠 Properties</div>
          <div className="text-lg font-bold text-green-400">2</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💰 Daily Income</div>
          <div className="text-lg font-bold text-yellow-400">$13,000</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">📊 Total Value</div>
          <div className="text-lg font-bold text-cyan-400">$175K</div>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: "available", label: "Buy Property", icon: "🛒" },
          { id: "special", label: "Illegal Operations", icon: "⚠️" },
          { id: "owned", label: "My Properties", icon: "🏠" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${activeTab === t.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "available" && (
        <div className="grid grid-cols-2 gap-2">
          {properties.available.map((p, i) => (
            <div key={i} className="mafia-card rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">{p.name}</div>
                  <div className="text-[9px] text-slate-400">{p.district} — {p.type}</div>
                </div>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Income: <span className="text-green-400 font-bold">${p.income.toLocaleString()}/day</span></span>
                <span className="text-slate-400">Security: <span className={`font-bold ${p.security === "Maximum" || p.security === "High" ? "text-green-400" : p.security === "Medium" ? "text-yellow-400" : "text-red-400"}`}>{p.security}</span></span>
              </div>
              <button className="w-full px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold">
                Buy ${p.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "special" && (
        <div className="grid grid-cols-2 gap-2">
          {properties.special.map((p, i) => (
            <div key={i} className="mafia-card rounded-xl p-3 space-y-2 border border-red-900/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">{p.name}</div>
                  <div className="text-[9px] text-slate-400">{p.production}</div>
                </div>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-green-400 font-bold">+${p.income.toLocaleString()}/day</span>
                <span className="text-red-400 font-bold">⚠️ {p.risk}</span>
              </div>
              <button className="w-full px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold">
                Set Up ${p.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "owned" && (
        <div className="grid gap-2">
          {properties.owned.map((p, i) => (
            <div key={i} className="mafia-card rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl">{p.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-200">{p.name}</div>
                <div className="text-xs text-green-400">+${p.income.toLocaleString()}/day</div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: p.maxLevel }).map((_, j) => (
                    <div key={j} className={`w-4 h-1.5 rounded-full ${j < p.level ? "bg-amber-400" : "bg-slate-700"}`} />
                  ))}
                  <span className="text-[9px] text-slate-400 ml-1">Lvl {p.level}/{p.maxLevel}</span>
                </div>
              </div>
              <div className="space-y-1">
                <button className="w-full px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">Upgrade</button>
                <button className="w-full px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold">Sell</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ REAL-TIME MARKET ═══════════ */
export function MarketSystemPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const commodities = [
    { name: "Cocaine", icon: "❄️", price: 45000, change: +12, trend: "up", volume: "High" },
    { name: "Heroin", icon: "💉", price: 38000, change: -5, trend: "down", volume: "Medium" },
    { name: "Meth", icon: "⚗️", price: 25000, change: +23, trend: "up", volume: "Very High" },
    { name: "Weed", icon: "🌿", price: 2500, change: -2, trend: "down", volume: "High" },
    { name: "Counterfeit Electronics", icon: "📱", price: 8000, change: +8, trend: "up", volume: "Medium" },
    { name: "Stolen Art", icon: "🖼️", price: 120000, change: +45, trend: "up", volume: "Low" },
    { name: "Weapons Cache", icon: "🔫", price: 75000, change: +15, trend: "up", volume: "High" },
    { name: "Luxury Watches", icon: "⌚", price: 15000, change: -3, trend: "down", volume: "Medium" },
    { name: "ID Documents", icon: "🪪", price: 12000, change: +30, trend: "up", volume: "Very High" },
    { name: "Explosives", icon: "💣", price: 55000, change: +20, trend: "up", volume: "Low" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📈</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Underground Market</h2>
          <p className="text-xs text-slate-400">Real-time commodity prices — buy low, sell high</p>
        </div>
      </div>

      <div className="rounded-xl p-3 border border-green-500/20 bg-green-900/10">
        <div className="text-[10px] text-green-400 font-bold">📈 MARKET IS LIVE — Prices update based on player activity</div>
        <div className="text-[9px] text-slate-400 mt-1">Buy when prices are low. Sell when demand spikes. Controls your own supply.</div>
      </div>

      <div className="grid gap-2">
        {commodities.map((c, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{c.name}</div>
              <div className="text-[10px] text-slate-400">Volume: {c.volume}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-400">${c.price.toLocaleString()}</div>
              <div className={`text-[10px] font-bold flex items-center gap-0.5 justify-end ${c.change > 0 ? "text-green-400" : "text-red-400"}`}>
                {c.trend === "up" ? "📈" : "📉"} {c.change > 0 ? "+" : ""}{c.change}%
              </div>
            </div>
            <div className="space-y-1">
              <button className="w-full px-2 py-0.5 bg-green-600/20 border border-green-500/30 text-green-300 rounded text-[10px] font-bold">Buy</button>
              <button className="w-full px-2 py-0.5 bg-red-600/20 border border-red-500/30 text-red-300 rounded text-[10px] font-bold">Sell</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function EnergyDrinksPage() {
  const player = useQuery(api.game.getPlayer);
  const buyDrink = useMutation(api.gameExtended.buyEnergyDrink);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"boost" | "stim" | "extreme">("boost");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const now = Date.now();
  const energyActive = ((player as any).energyDrinkUntil ?? 0) > now;
  const energyLeft = energyActive ? Math.ceil(((player as any).energyDrinkUntil - now) / 60000) : 0;
  const energyHours = energyActive ? Math.floor(energyLeft / 60) : 0;
  const energyMins = energyActive ? energyLeft % 60 : 0;

  const boostDrinks = [
    { name: "Red Bull", icon: "🥤", boost: "+25% XP", duration: "30 min", cost: 5000, color: "blue", desc: "Quick energy spike. The classic.", effect: "25% more XP from all crimes" },
    { name: "Monster Energy", icon: "⛽", boost: "+25% XP", duration: "1 hr", cost: 15000, color: "green", desc: "Sustained energy for longer operations.", effect: "25% more XP for 1 hour" },
    { name: "Venom Shot", icon: "💉", boost: "+25% XP", duration: "2 hrs", cost: 50000, color: "purple", desc: "Underground brew. Hits hard.", effect: "25% more XP for 2 hours" },
    { name: "Liquid Gold", icon: "✨", boost: "+25% XP", duration: "4 hrs", cost: 200000, color: "amber", desc: "Premium blend. Reserved for professionals.", effect: "25% more XP for 4 hours" },
    { name: "Shadow Elixir", icon: "🧪", boost: "+25% XP", duration: "8 hrs", cost: 500000, color: "red", desc: "The strongest drink known. Extended focus.", effect: "25% more XP for 8 hours" },
  ];
  const stimDrinks = [
    { name: "Adrenaline Shot", icon: "💪", boost: "+50% ATK", duration: "1 hr", cost: 75000, color: "red", desc: "Combat boost. Hit harder.", effect: "+50% attack for 1 hour" },
    { name: "Focus Pill", icon: "🧠", boost: "+50% Stealth", duration: "1 hr", cost: 80000, color: "cyan", desc: "Mental clarity. Avoid detection.", effect: "+50% stealth for 1 hour" },
    { name: "Tough Juice", icon: "🦾", boost: "+50% DEF", duration: "1 hr", cost: 70000, color: "green", desc: "Skin like iron. Take more hits.", effect: "+50% defense for 1 hour" },
    { name: "Speed Drip", icon: "⚡", boost: "+30% Escape", duration: "1 hr", cost: 60000, color: "yellow", desc: "Legs like lightning. Never caught.", effect: "+30% escape chance for 1 hour" },
  ];
  const extremeDrinks = [
    { name: "Chaos Cocktail", icon: "💀", boost: "+100% All Stats", duration: "30 min", cost: 500000, color: "red", desc: "Extreme boost but crashes hard. +50% crime XP after.", effect: "Double all stats for 30 minutes" },
    { name: "Phantom Brew", icon: "👻", boost: "Ghost Mode", duration: "1 hr", cost: 1000000, color: "purple", desc: "Become invisible. No one sees you coming.", effect: "1 hour of ghost mode" },
    { name: "Devil's Nectar", icon: "🔥", boost: "+200% Crime XP", duration: "2 hrs", cost: 2000000, color: "orange", desc: "Triple crime XP. The ultimate criminal fuel.", effect: "200% more crime XP for 2 hours" },
  ];

  const tabs = [
    { id: "boost" as const, label: "⚡ XP Boosts", count: boostDrinks.length, color: "blue" },
    { id: "stim" as const, label: "💪 Stimulants", count: stimDrinks.length, color: "green" },
    { id: "extreme" as const, label: "💀 Extreme", count: extremeDrinks.length, color: "red" },
  ];

  const currentDrinks = selectedTab === "boost" ? boostDrinks : selectedTab === "stim" ? stimDrinks : extremeDrinks;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="bg-gradient-to-r from-orange-900/30 via-red-900/20 to-purple-900/30 rounded-2xl p-4 border border-orange-500/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            <div>
              <h2 className="text-xl font-black text-orange-300 tracking-wider">ENERGY DRINKS</h2>
              <p className="text-[10px] text-slate-500">Boost your criminal performance</p>
            </div>
          </div>
          {energyActive && (
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500/40">
              <div className="text-sm font-black text-orange-400">🥤 ACTIVE</div>
              <div className="text-xs text-orange-300/70">{energyHours > 0 ? `${energyHours}h ${energyMins}m` : `${energyMins}m`} left</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSelectedTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTab === t.id ? `bg-${t.color}-600/30 border border-${t.color}-500/40 text-${t.color}-300` : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {energyActive && (
        <div className="bg-gradient-to-r from-orange-900/30 to-red-900/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-orange-300">🥤 Energy Rush Active</div>
              <div className="text-xs text-orange-300/70">+25% XP on all criminal actions</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-orange-400">{energyHours > 0 ? `${energyHours}h ${energyMins}m` : `${energyMins}m`}</div>
              <div className="text-[9px] text-orange-400/60">remaining</div>
            </div>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" style={{ width: `${Math.max(5, energyLeft / 480 * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {currentDrinks.map((d, i) => {
          const canAfford = (player.money ?? 0) >= d.cost;
          return (
            <div key={d.name} className={`bg-slate-900/50 rounded-xl border border-${d.color}-500/20 p-4 transition-all hover:border-${d.color}-500/40`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{d.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold text-${d.color}-300`}>{d.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full bg-${d.color}-500/20 text-${d.color}-300 font-bold`}>{d.boost}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{d.desc}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">⏱ {d.duration} • 📊 {d.effect}</div>
                </div>
              </div>
              <button onClick={async () => {
                setLoading(true); setMsg("");
                try { const r = await buyDrink({ drinkIndex: selectedTab === "boost" ? i : selectedTab === "stim" ? boostDrinks.length + i : boostDrinks.length + stimDrinks.length + i }); setMsg(r.message); }
                catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
                setLoading(false);
              }} disabled={loading || !canAfford}
                className={`w-full mt-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  canAfford ? `bg-${d.color}-600/20 border border-${d.color}-500/40 text-${d.color}-300 hover:bg-${d.color}-600/30` : "bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed"
                }`}>
                {canAfford ? `Buy — $${d.cost.toLocaleString()}` : `Need $${d.cost.toLocaleString()}`}
              </button>
            </div>
          );
        })}
      </div>

      {msg && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-300 animate-fade-in">✅ {msg}</div>}

      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
        <div className="text-xs font-bold text-slate-400 mb-2">💡 Tips</div>
        <div className="space-y-1 text-[10px] text-slate-500">
          <p>• XP boosts stack with other boosts (3x XP events, etc.)</p>
          <p>• Stimulants give combat/stealth/defense bonuses — useful before fights</p>
          <p>• Extreme drinks are expensive but game-changing — save for big operations</p>
          <p>• Energy drinks don't stack — buy the longest duration you need</p>
        </div>
      </div>
    </div>
  );
}
export { EnergyDrinksPage };

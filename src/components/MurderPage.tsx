import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Crosshair, Eye, Shield, Skull, Target, Users, Zap, ChevronDown, AlertTriangle, ChevronRight, Clock } from "lucide-react";

const MURDER_WEAPONS = [
  { id: "bare_hands", name: "Bare Hands", category: "Melee", damage: 10, trace: 5, cost: 0, icon: "👊" },
  { id: "kitchen_knife", name: "Kitchen Knife", category: "Melee", damage: 25, trace: 15, cost: 500, icon: "🔪" },
  { id: "baseball_bat", name: "Baseball Bat", category: "Melee", damage: 30, trace: 10, cost: 300, icon: "🏏" },
  { id: "pistol", name: "Pistol", category: "Firearm", damage: 60, trace: 45, cost: 10000, icon: "🔫" },
  { id: "silenced_pistol", name: "Suppressed Pistol", category: "Firearm", damage: 50, trace: 15, cost: 25000, icon: "🤫" },
  { id: "sniper", name: "Sniper Rifle", category: "Firearm", damage: 90, trace: 20, cost: 50000, icon: "🎯" },
  { id: "poison_feed", name: "Cyanide", category: "Chemical", damage: 100, trace: 5, cost: 30000, icon: "☠️" },
];

const MURDER_METHODS = [
  { id: "ambush", name: "Ambush", desc: "Hide and strike when they least expect it", successMod: 0.1, icon: "🫣" },
  { id: "snipe", name: "Snipe from Distance", desc: "One shot, one kill from the rooftops", successMod: 0.15, icon: "🔭" },
  { id: "poison_feed", name: "Poisoned Drink", desc: "Slip something into their coffee", successMod: 0.2, icon: "🍸" },
  { id: "professional", name: "Professional Hit", desc: "Clean, efficient, no witnesses", successMod: 0.2, icon: "🕵️" },
  { id: "ninja", name: "Ninja Strike", desc: "In and out before anyone notices", successMod: 0.3, icon: "🥷" },
  { id: "frame", name: "Frame a Player", desc: "Kill them and frame someone else", successMod: -0.1, icon: "🎯" },
];


function MurderPage() {
  const player = useQuery(api.game.getPlayer);
  const players = useQuery(api.admin.getAllPlayers);
  const murder = useMutation(api.murderSystem.commitMurder);
  const [tab, setTab] = useState<"arsenal" | "targets" | "methods" | "stats" | "feed" | "investigations">("targets");
  const [weapon, setWeapon] = useState(MURDER_WEAPONS[0]);
  const [method, setMethod] = useState(MURDER_METHODS[0]);
  const [target, setTarget] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const opponents = (players || []).filter((p: any) => p._id !== player?._id && !p.isBanned && (p.nickname || "").toLowerCase().includes(search.toLowerCase())).slice(0, 30);

  const execute = async () => {
    if (!target || loading) return;
    setLoading(true);
    try {
      const r = await murder({ targetId: target._id, weaponId: weapon.id, methodId: method.id, useGloves: false, useAlibi: false });
      setResult(r);
    } catch (e: any) { setResult({ success: false, error: e.message }); }
    setLoading(false);
  };

  const tabs = [
    { id: "targets" as const, label: "🎯 Targets", icon: "🎯" },
    { id: "arsenal" as const, label: "🗡️ Arsenal", icon: "🗡️" },
    { id: "methods" as const, label: "📋 Methods", icon: "📋" },
    { id: "stats" as const, label: "📊 Stats", icon: "📊" },
    { id: "feed" as const, label: "💀 Kill Feed", icon: "💀" },
    { id: "investigations" as const, label: "🔍 Investigations", icon: "🔍" },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skull className="size-7 text-red-400" />
        <h2 className="text-2xl font-bold">Murder</h2>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">☠️ LETHAL</span>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-4 text-center ${result.success ? "bg-green-950/30 border border-green-500/30" : "bg-red-950/30 border border-red-500/30"}`}>
          <div className={`text-2xl font-black mb-1 ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "💀 TARGET ELIMINATED" : result.error || "💀 ATTEMPT FAILED"}
          </div>
          {result.success && (
            <div className="text-sm text-muted-foreground space-y-1">
              {result.cashStolen > 0 && <div className="text-green-400">💰 Stole: ${result.cashStolen.toLocaleString()}</div>}
              {result.xpEarned > 0 && <div className="text-blue-400">⭐ XP: +{result.xpEarned}</div>}
              {result.reputation > 0 && <div className="text-purple-400">🌍 Rep: +{result.reputation}</div>}
              {result.evidenceFound && <div className="text-red-400">🕵️ Evidence found! Detective investigating...</div>}
              {result.wantedGained > 0 && <div className="text-orange-400">🔴 Wanted: +{result.wantedGained}</div>}
            </div>
          )}
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">✕ Dismiss</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">💰 Cash</div><div className="text-sm font-bold text-green-400">${(player?.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">⚔️ ATK</div><div className="text-sm font-bold text-red-400">{player?.attack ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">🛡️ DEF</div><div className="text-sm font-bold text-blue-400">{player?.defense ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">💀 Kills</div><div className="text-sm font-bold text-purple-400">{player?.totalKills ?? 0}</div></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${tab === t.id ? "bg-red-600 text-white" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "targets" && (
        <div className="space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search players to target..." className="w-full bg-black/30 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm" />
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {opponents.map((p: any) => (
              <div key={p._id} onClick={() => setTarget(p)} className={`p-3 rounded-xl cursor-pointer transition text-sm flex justify-between items-center ${target?._id === p._id ? "bg-red-950/30 border border-red-500/30" : "hover:bg-white/5 border border-transparent"}`}>
                <div>
                  <span className="font-bold">{p.nickname || "Unknown"}</span>
                  <span className="text-muted-foreground ml-2">Lv.{p.level}</span>
                  {p.isDead && <span className="text-red-400 ml-1">💀</span>}
                </div>
                <div className="text-xs text-muted-foreground">ATK:{p.attack} | ${((p.money ?? 0) / 1000).toFixed(0)}K</div>
              </div>
            ))}
          </div>
          {target && (
            <div className="mafia-card rounded-xl p-4 border border-red-500/20">
              <div className="text-sm font-bold mb-2">🎯 Target: {target.nickname}</div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                <div>Level: {target.level}</div><div>ATK: {target.attack}</div><div>DEF: {target.defense}</div><div>HP: {target.life}/{target.maxLife}</div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">Weapon: {weapon.icon} {weapon.name} | Method: {method.icon} {method.name}</div>
              <button onClick={execute} disabled={loading} className="w-full px-4 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm">
                {loading ? "Executing..." : `💀 ELIMINATE ${target.nickname.toUpperCase()}`}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "arsenal" && (
        <div className="space-y-2">
          {["Melee", "Ranged", "Firearm", "Chemical", "Explosive"].map(cat => (
            <div key={cat}>
              <div className="text-xs font-bold text-muted-foreground mb-1 px-1">{cat}</div>
              <div className="grid grid-cols-2 gap-2">
                {MURDER_WEAPONS.filter(w => w.category === cat).map(w => (
                  <button key={w.id} onClick={() => setWeapon(w)} className={`p-3 rounded-xl text-left text-xs transition ${weapon.id === w.id ? "bg-red-950/30 border border-red-500/30" : "mafia-card hover:border-red-500/20"}`}>
                    <div className="flex items-center gap-2"><span className="text-lg">{w.icon}</span><span className="font-bold">{w.name}</span></div>
                    <div className="text-muted-foreground mt-1">DMG: {w.damage} | Trace: {w.trace}% | {w.cost > 0 ? `$${w.cost.toLocaleString()}` : "Free"}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "methods" && (
        <div className="space-y-2">
          {MURDER_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m)} className={`w-full p-3 rounded-xl text-left text-sm transition ${method.id === m.id ? "bg-red-950/30 border border-red-500/30" : "mafia-card hover:border-red-500/20"}`}>
              <div className="flex items-center gap-2"><span className="text-lg">{m.icon}</span><span className="font-bold">{m.name}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Success Modifier: {m.successMod > 0 ? "+" : ""}{(m.successMod * 100).toFixed(0)}%</div>
            </button>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="mafia-card rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><div className="text-2xl font-black text-red-400">{player?.totalKills ?? 0}</div><div className="text-xs text-muted-foreground">Total Kills</div></div>
            <div><div className="text-2xl font-black text-green-400">${(player?.totalEarned ?? 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Earned</div></div>
            <div><div className="text-2xl font-black text-purple-400">{player?.reputation ?? 0}</div><div className="text-xs text-muted-foreground">Reputation</div></div>
            <div><div className="text-2xl font-black text-orange-400">{player?.wantedLevel ?? 0}</div><div className="text-xs text-muted-foreground">Wanted Level</div></div>
          </div>
        </div>
      )}

      {tab === "feed" && (
        <div className="mafia-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          <div className="text-2xl mb-2">💀</div>
          Kill feed shows recent murders across the city.
          <div className="text-xs mt-2">Commit murders to see activity here!</div>
        </div>
      )}

      {tab === "investigations" && (
        <div className="mafia-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          <div className="text-2xl mb-2">🔍</div>
          Active investigations by law enforcement.
          <div className="text-xs mt-2">The more evidence you leave, the more investigations open.</div>
        </div>
      )}
    </div>
  );
}

export { MurderPage };

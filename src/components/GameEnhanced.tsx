import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Shield, Skull, Star, Zap, Clock, Trophy, Lock, Car, AlertTriangle, Users, Ban, Heart, Target, Coins, ChevronRight, Gift, ShieldCheck, Crosshair, Swords, Bomb, Eye, LockKeyhole, MapPin } from "lucide-react";

function LoadingPage() {
  return <div className="flex items-center justify-center h-64"><div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
}

// ===== STEAL FROM HOUSE =====
export function StealFromHousePage() {
  const player = useQuery(api.game.getPlayer);
  const stealFromHouse = useMutation(api.gameEnhanced.stealFromHouse);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!player) return <LoadingPage />;

  const difficulties = [
    { id: "easy", name: "Easy House", emoji: "🏠", desc: "Suburban home, low security", reward: "Low", risk: "40%", color: "text-green-400" },
    { id: "medium", name: "Average Home", emoji: "🏘️", desc: "Family house, standard alarm", reward: "Medium", risk: "40%", color: "text-yellow-400" },
    { id: "hard", name: "Luxury Villa", emoji: "🏰", desc: "Gated community, armed guards", reward: "High", risk: "40%", color: "text-orange-400" },
    { id: "extreme", name: "Mansion", emoji: "🏯", desc: "Mega mansion, private security", reward: "Extreme", risk: "40%", color: "text-red-400" },
  ];

  const doSteal = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await stealFromHouse({ difficulty: selectedDifficulty });
      setResult(res);
      setCooldown(10);
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Error" });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Home className="size-7 text-amber-400" />
        <div>
          <h2 className="text-2xl font-bold">🏚️ Steal From House</h2>
          <p className="text-sm text-muted-foreground">Break into homes and steal valuables. 60% success rate.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {difficulties.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDifficulty(d.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedDifficulty === d.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border/50 bg-background/40 hover:border-primary/30"
            }`}
          >
            <div className="text-2xl mb-1">{d.emoji}</div>
            <div className="font-bold text-sm">{d.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</div>
            <div className="flex justify-between mt-2 text-[10px]">
              <span className={d.color}>💰 {d.reward}</span>
              <span className="text-red-400">⚠️ {d.risk}</span>
            </div>
          </button>
        ))}
      </div>

      {cooldown > 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center">
          <Clock className="size-8 text-yellow-400 mx-auto mb-2 animate-pulse" />
          <div className="text-sm font-bold">Cooldown: {cooldown}s</div>
          <div className="h-2 bg-background/60 rounded-full mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
              animate={{ width: `${(cooldown / 10) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={doSteal}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold text-lg rounded-xl hover:from-amber-500 hover:to-orange-400 transition-all disabled:opacity-50 shadow-lg shadow-amber-900/30"
        >
          {loading ? "🔍 Breaking In..." : "🏚️ Break Into House"}
        </button>
      )}

      {result && !result.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 border-2 ${
            result.success
              ? "bg-green-950/30 border-green-500/50"
              : "bg-red-950/30 border-red-500/50"
          }`}
        >
          <div className={`text-xl font-bold ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "✅ BUSTED IN!" : "❌ CAUGHT!"}
          </div>
          {result.success && result.itemsStolen?.map((item: string, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="text-sm text-green-300 mt-1">
              📦 {item}
            </motion.div>
          ))}
          {result.success && <div className="text-green-400 mt-2 font-bold">💰 +${result.moneyEarned?.toLocaleString()} &nbsp; ⭐ +{result.xpEarned} XP</div>}
          {!result.success && result.damageTaken > 0 && <div className="text-red-400 mt-1">❤️ -{result.damageTaken} damage taken</div>}
          {result.arrested && <div className="text-red-400 font-bold mt-2">🔒 ARRESTED! 15 seconds in prison!</div>}
        </motion.div>
      )}
      {result?.error && <div className="text-destructive text-sm">{String(result.error)}</div>}
    </div>
  );
}

// ===== GTA CAR THEFT =====
export function GtaCarTheftPage() {
  const player = useQuery(api.game.getPlayer);
  const gtaCarTheft = useMutation(api.gameEnhanced.gtaCarTheft);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!player) return <LoadingPage />;

  const doTheft = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await gtaCarTheft();
      setResult(res);
      setCooldown(10);
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Error" });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Car className="size-7 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">🚗 GTA Car Theft</h2>
          <p className="text-sm text-muted-foreground">Steal vehicles from the streets. Stolen cars go to your Garage!</p>
        </div>
      </div>

      <div className="mafia-card rounded-xl p-5">
        <div className="text-center space-y-2">
          <div className="text-6xl">🚗</div>
          <div className="text-sm text-muted-foreground">Approach a vehicle on the street</div>
          <div className="text-[10px] text-yellow-400">⚠️ 60% success rate • 40% fail chance</div>
          <div className="text-[10px] text-muted-foreground">Stolen vehicles appear in your Garage</div>
        </div>
      </div>

      {cooldown > 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center">
          <Clock className="size-8 text-cyan-400 mx-auto mb-2 animate-pulse" />
          <div className="text-sm font-bold">Stealing... {cooldown}s</div>
          <div className="h-2 bg-background/60 rounded-full mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
              animate={{ width: `${(cooldown / 10) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={doTheft}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-bold text-lg rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all disabled:opacity-50 shadow-lg shadow-cyan-900/30"
        >
          {loading ? "🚗 Hot-wiring..." : "🚗 Steal Vehicle"}
        </button>
      )}

      {result && !result.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 border-2 ${
            result.success ? "bg-green-950/30 border-green-500/50" : "bg-red-950/30 border-red-500/50"
          }`}
        >
          <div className={`text-xl font-bold ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "✅ VEHICLE STOLEN!" : "❌ CAUGHT!"}
          </div>
          {result.success && (
            <div className="mt-2 space-y-1">
              <div className="text-green-300 text-sm">🚗 Vehicle added to your Garage!</div>
              <div className="text-green-400 font-bold">💰 +${result.moneyEarned?.toLocaleString()} &nbsp; ⭐ +{result.xpEarned} XP</div>
            </div>
          )}
          {!result.success && result.damageTaken > 0 && <div className="text-red-400 mt-1">❤️ -{result.damageTaken} damage taken</div>}
          {result.arrested && <div className="text-red-400 font-bold mt-2">🔒 ARRESTED! 15 seconds in prison!</div>}
        </motion.div>
      )}
      {result?.error && <div className="text-destructive text-sm">{String(result.error)}</div>}
    </div>
  );
}

// ===== BODYGUARDS =====
export function BodyguardsPage() {
  const player = useQuery(api.game.getPlayer);
  const bodyguardInfo = useQuery(api.gameEnhanced.getBodyguardInfo);
  const buyBodyguard = useMutation(api.gameEnhanced.buyBodyguard);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!player || !bodyguardInfo) return <LoadingPage />;

  const costs = [0, 0, 10000000, 35000000, 95000000, 125000000];
  const count = bodyguardInfo.bodyguardCount;
  const died = (player.totalDeaths ?? 0) > 0;

  const buyGuard = async (nextCount: number) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await buyBodyguard({ count: nextCount });
      setMsg(`✅ Hired bodyguard #${res.newCount}! Cost: $${res.cost.toLocaleString()}`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="size-7 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold">🛡️ Bodyguards</h2>
          <p className="text-sm text-muted-foreground">Hire protection. Bodyguards die protecting you — buy new ones!</p>
        </div>
      </div>

      <div className="mafia-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold">Active Bodyguards</div>
            <div className="text-3xl font-bold text-blue-400">{count}/5</div>
          </div>
          {died && (
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-bold text-yellow-400">
              💀 Half Price (Died Before)
            </div>
          )}
        </div>
        <div className="h-2 bg-background/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all" style={{ width: `${(count / 5) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isHired = n <= count;
          const isNext = n === count + 1;
          const price = died ? Math.floor(costs[n] / 2) : costs[n];
          return (
            <div key={n} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isHired ? "bg-blue-950/20 border-blue-500/30" : isNext ? "bg-background/40 border-primary/30" : "bg-background/20 border-border/30 opacity-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg flex items-center justify-center ${isHired ? "bg-blue-500/20" : "bg-background/60"}`}>
                  <Shield className={`size-5 ${isHired ? "text-blue-400" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="text-sm font-bold">Bodyguard #{n}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {isHired ? "✅ Active & Protecting" : isNext ? "Available to hire" : "Locked"}
                  </div>
                </div>
              </div>
              {isNext && (
                <button
                  onClick={() => buyGuard(n)}
                  disabled={loading || (player.money ?? 0) < price}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-40"
                >
                  {price === 0 ? "FREE" : `$${price.toLocaleString()}`}
                </button>
              )}
              {isHired && <span className="text-xs text-blue-400">Active</span>}
            </div>
          );
        })}
      </div>

      {msg && <div className={`text-sm rounded-lg p-3 ${msg.includes("✅") ? "bg-green-950/30 text-green-400" : "bg-red-950/30 text-red-400"}`}>{msg}</div>}

      <div className="mafia-card rounded-xl p-4 text-xs text-muted-foreground space-y-1">
        <div>🛡️ Bodyguards protect you in PvP fights — absorbing 30% of incoming damage</div>
        <div>💀 When they die, you must buy new ones</div>
        <div>💰 If your character dies, all future bodyguards cost 50% less</div>
        <div>👑 Max 5 bodyguards at a time</div>
      </div>
    </div>
  );
}

// ===== SECRET CHALLENGES =====
export function SecretChallengesPage() {
  const player = useQuery(api.game.getPlayer);
  const [filter, setFilter] = useState("all");

  const challengeCategories = [
    { id: "crime_streak", name: "Crime Streak", emoji: "🔥", color: "from-red-600 to-orange-500" },
    { id: "speed_run", name: "Speed Run", emoji: "⚡", color: "from-yellow-600 to-amber-500" },
    { id: "survival", name: "Survival", emoji: "💀", color: "from-gray-600 to-slate-500" },
    { id: "gambling", name: "Gambling", emoji: "🎰", color: "from-purple-600 to-violet-500" },
    { id: "combat", name: "Combat", emoji: "⚔️", color: "from-red-700 to-rose-500" },
    { id: "exploration", name: "Exploration", emoji: "🗺️", color: "from-blue-600 to-cyan-500" },
    { id: "economy", name: "Economy", emoji: "💰", color: "from-green-600 to-emerald-500" },
    { id: "smuggling", name: "Smuggling", emoji: "🚛", color: "from-amber-600 to-yellow-500" },
    { id: "heist", name: "Heist", emoji: "🏦", color: "from-indigo-600 to-blue-500" },
    { id: "bounty", name: "Bounty", emoji: "🎯", color: "from-rose-600 to-pink-500" },
  ];

  // Generate 75,000+ challenges
  const allChallenges = challengeCategories.flatMap((cat, ci) =>
    Array.from({ length: 7500 }, (_, i) => {
      const diff = Math.random() < 0.1 ? "legendary" : Math.random() < 0.3 ? "hard" : Math.random() < 0.6 ? "medium" : "easy";
      const diffColor = diff === "legendary" ? "text-yellow-400" : diff === "hard" ? "text-red-400" : diff === "medium" ? "text-orange-400" : "text-green-400";
      const reward = diff === "legendary" ? 5000000 : diff === "hard" ? 1000000 : diff === "medium" ? 250000 : 50000;
      const xp = diff === "legendary" ? 1000 : diff === "hard" ? 500 : diff === "medium" ? 200 : 50;
      return { id: `sc_${ci}_${i}`, category: cat.id, catName: cat.name, catEmoji: cat.emoji, catColor: cat.color, name: `${cat.name} #${i + 1}`, diff, diffColor, reward, xp, index: i };
    })
  );

  const filtered = filter === "all" ? allChallenges.slice(0, 200) : allChallenges.filter(c => c.category === filter).slice(0, 200);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <LockKeyhole className="size-7 text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold">🗝️ Secret Challenges</h2>
          <p className="text-sm text-muted-foreground">75,000+ hidden challenges across {challengeCategories.length} categories</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {challengeCategories.map((cat) => (
          <button key={cat.id} onClick={() => setFilter(filter === cat.id ? "all" : cat.id)}
            className={`p-2 rounded-lg text-center transition-all ${filter === cat.id ? `bg-gradient-to-br ${cat.color} text-white` : "bg-background/50 text-muted-foreground hover:text-foreground"}`}>
            <div className="text-lg">{cat.emoji}</div>
            <div className="text-[9px] font-bold truncate">{cat.name}</div>
            <div className="text-[8px] opacity-70">7,500</div>
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/30 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">{c.catEmoji}</div>
              <div>
                <div className="text-sm font-bold">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{c.catName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold capitalize" style={{ color: c.diff === "legendary" ? "#facc15" : c.diff === "hard" ? "#f87171" : c.diff === "medium" ? "#fb923c" : "#4ade80" }}>{c.diff}</div>
              <div className="text-[10px] text-green-400">💰 ${c.reward.toLocaleString()}</div>
              <div className="text-[10px] text-blue-400">⭐ {c.xp} XP</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===== BOOSTS & EVENTS =====
export function BoostsPage() {
  const boostInfo = useQuery(api.gameEnhanced.getBoostInfo);
  const randomEvent = useQuery(api.gameEnhanced.getRandomEvent);
  const xpBoostInfo = useQuery(api.gameEnhanced.getXpBoostInfo);
    const player = useQuery(api.game.getPlayer);
  
  if (!boostInfo) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="size-7 text-yellow-400" />
        <div>
          <h2 className="text-2xl font-bold">⚡ Boosts & Events</h2>
          <p className="text-sm text-muted-foreground">Active boosts, events, and special time-limited bonuses</p>
        </div>
      </div>

      {/* Active Random Event */}
      {randomEvent && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl p-5 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30"
        >
          <div className="text-[10px] uppercase tracking-widest text-purple-400 mb-2">🔴 LIVE RANDOM EVENT</div>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{randomEvent.emoji}</div>
            <div>
              <div className="text-lg font-bold">{randomEvent.name}</div>
              <div className="text-sm text-muted-foreground">{randomEvent.description}</div>
              <div className="text-[10px] text-yellow-400 mt-1">⏱️ {randomEvent.duration} minutes</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Boost Cards */}
      <div className="space-y-3">
        {/* Weekend Boost */}
        <div className={`rounded-xl p-5 border-2 transition-all ${boostInfo.weekendBoost.active ? "bg-orange-950/30 border-orange-500/50" : "bg-background/40 border-border/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <div className="font-bold">Weekend Boost</div>
                <div className="text-xs text-muted-foreground">{boostInfo.weekendBoost.description}</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${boostInfo.weekendBoost.active ? "bg-orange-500/20 text-orange-400" : "bg-background/60 text-muted-foreground"}`}>
              {boostInfo.weekendBoost.active ? "ACTIVE" : "Fri-Sun"}
            </div>
          </div>
          {boostInfo.weekendBoost.active && (
            <div className="mt-3 text-xs text-orange-300">💰 2x Money & XP on all actions • ⚔️ Kill Free Zone active!</div>
          )}
        </div>

        {/* Kill Free Zone */}
        <div className={`rounded-xl p-5 border-2 transition-all ${boostInfo.killFreeZone.active ? "bg-red-950/30 border-red-500/50" : "bg-background/40 border-border/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚔️</div>
              <div>
                <div className="font-bold">Kill Free Zone</div>
                <div className="text-xs text-muted-foreground">{boostInfo.killFreeZone.description}</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${boostInfo.killFreeZone.active ? "bg-red-500/20 text-red-400" : "bg-background/60 text-muted-foreground"}`}>
              {boostInfo.killFreeZone.active ? "ACTIVE" : "Mon-Wed 20:00-22:00"}
            </div>
          </div>
          {boostInfo.killFreeZone.active && (
            <div className="mt-3 text-xs text-red-300">🚫 PvP kills disabled! Safety zone active for 2 hours.</div>
          )}
        </div>

        {/* Golden Hour */}
        <div className={`rounded-xl p-5 border-2 transition-all ${boostInfo.goldenHour.active ? "bg-yellow-950/30 border-yellow-500/50" : "bg-background/40 border-border/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <div>
                <div className="font-bold">Golden Hour</div>
                <div className="text-xs text-muted-foreground">{boostInfo.goldenHour.description}</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${boostInfo.goldenHour.active ? "bg-yellow-500/20 text-yellow-400" : "bg-background/60 text-muted-foreground"}`}>
              {boostInfo.goldenHour.active ? "ACTIVE" : "Daily 12:00-13:00"}
            </div>
          </div>
          {boostInfo.goldenHour.active && (
            <div className="mt-3 text-xs text-yellow-300">✨ ALL rewards x3! Every action is amplified!</div>
          )}
        </div>
      </div>

      {/* Hourly XP Boost (Automatic) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">⚡ Hourly XP Boost — Automatic</h3>
        <div className="rounded-xl p-5 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚡</span>
              <div>
                <div className="text-2xl font-black text-green-400">{xpBoostInfo?.multiplier ?? 5}x XP</div>
                <div className="text-xs text-muted-foreground">Current boost — {xpBoostInfo?.hoursPlayed ?? 0} hours played</div>
              </div>
            </div>
            {xpBoostInfo?.nextTierMultiplier && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Next tier</div>
                <div className="text-sm font-bold text-primary">{xpBoostInfo.nextTierMultiplier}x at {xpBoostInfo.nextTierHours}h</div>
              </div>
            )}
          </div>
          {xpBoostInfo?.nextTierHours && (
            <div className="h-2 bg-background/60 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((xpBoostInfo.hoursPlayed - xpBoostInfo.currentTierHours) / (xpBoostInfo.nextTierHours - xpBoostInfo.currentTierHours)) * 100)}%` }} />
            </div>
          )}
          <div className="text-[10px] text-green-300/70 mt-2">Free! Boosts increase automatically as you play more hours.</div>
        </div>
        {/* All tiers */}
        <div className="grid grid-cols-3 gap-2">
          {(xpBoostInfo?.allTiers ?? []).map((t: any) => {
            const isCurrent = (xpBoostInfo?.multiplier ?? 5) === t.multiplier;
            const isUnlocked = (xpBoostInfo?.hoursPlayed ?? 0) >= t.hours;
            return (
              <div key={t.multiplier} className={`p-3 rounded-xl border text-center transition-all ${isCurrent ? "bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/10" : isUnlocked ? "bg-background/40 border-border/30" : "bg-background/10 border-border/10 opacity-40"}`}>
                <div className={`text-lg font-black ${isCurrent ? "text-green-400" : isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>{t.multiplier}x</div>
                <div className="text-[10px] text-muted-foreground mt-1">{t.hours}h played</div>
                {isCurrent && <div className="text-[10px] text-green-400 font-bold mt-1">✓ YOU</div>}
                {isUnlocked && !isCurrent && <div className="text-[10px] text-muted-foreground mt-1">✓ Unlocked</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <div className="mafia-card rounded-xl p-5">
        <div className="text-sm font-bold mb-3">📅 Boost Schedule</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span>🔥 Weekend Boost</span><span className="text-orange-400">Fri 00:00 → Sun 00:00</span></div>
          <div className="flex justify-between"><span>⚔️ Kill Free Zone</span><span className="text-red-400">Mon-Wed 20:00-22:00</span></div>
          <div className="flex justify-between"><span>✨ Golden Hour</span><span className="text-yellow-400">Every Day 12:00-13:00</span></div>
          <div className="flex justify-between"><span>⚡ Energy Drinks</span><span className="text-cyan-400">5% drop in any crime</span></div>
        </div>
      </div>
    </div>
  );
}

// ===== ENHANCED ADMIN PANEL =====
export function EnhancedAdminPage() {
  const player = useQuery(api.game.getPlayer);
  const allPlayers = useQuery(api.gameEnhanced.adminGetAllPlayers);
  const events = useQuery(api.gameEnhanced.adminGetEvents);
  const giveMoney = useMutation(api.gameEnhanced.adminGiveMoney);
  const banPlayer = useMutation(api.gameEnhanced.adminBan);
  const unbanPlayer = useMutation(api.gameEnhanced.adminUnban);
  const setLevel = useMutation(api.gameEnhanced.adminSetLevel);
  const killPlayer = useMutation(api.gameEnhanced.adminKillPlayer);
  const healPlayer = useMutation(api.gameEnhanced.adminHealPlayer);
  const jailPlayer = useMutation(api.gameEnhanced.adminJailPlayer);
  const wipePlayer = useMutation(api.gameEnhanced.adminWipePlayer);
  const resetMoney = useMutation(api.gameEnhanced.adminResetMoney);

  const [selectedTab, setSelectedTab] = useState("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");

  if (!player || player.role !== "admin") {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="size-16 text-red-400/40 mb-4" />
        <h2 className="text-xl font-bold">🔒 Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mt-2">You need admin privileges to access this panel.</p>
      </div>
    );
  }

  const doAction = async (action: string, params: any) => {
    setMsg("");
    try {
      switch (action) {
        case "giveMoney": { const r = await giveMoney(params); setMsg(`✅ Given $${amount.toLocaleString()} to player`); break; }
        case "ban": { await banPlayer({ targetId: params.targetId, reason: "Admin ban" }); setMsg("✅ Player banned!"); break; }
        case "unban": { await unbanPlayer({ targetId: params.targetId }); setMsg("✅ Player unbanned!"); break; }
        case "setLevel": { await setLevel({ targetId: params.targetId, level: params.level }); setMsg(`✅ Set level to ${params.level}`); break; }
        case "kill": { await killPlayer({ targetId: params.targetId }); setMsg("✅ Player killed!"); break; }
        case "heal": { await healPlayer({ targetId: params.targetId }); setMsg("✅ Player healed!"); break; }
        case "jail": { await jailPlayer({ targetId: params.targetId, seconds: 300 }); setMsg("✅ Player jailed for 5 min!"); break; }
        case "wipe": { await wipePlayer({ targetId: params.targetId }); setMsg("✅ Player wiped!"); break; }
        case "resetMoney": { await resetMoney({ targetId: params.targetId, amount: params.amount }); setMsg(`✅ Money reset to $${params.amount.toLocaleString()}!`); break; }
      }
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
  };

  const tabs = [
    { id: "players", label: "👥 Players", icon: Users },
    { id: "tools", label: "🔧 Tools", icon: Shield },
    { id: "events", label: "📅 Events", icon: Clock },
    { id: "competitions", label: "🏆 Competitions", icon: Trophy },
    { id: "weather", label: "🌍 Weather", icon: Shield },
    { id: "broadcasts", label: "📢 Broadcasts", icon: Users },
    { id: "stats", label: "📊 Stats", icon: Trophy },
  ];

  const filteredPlayers = (allPlayers ?? []).filter((p: any) =>
    p.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="size-7 text-red-400" />
        <div>
          <h2 className="text-2xl font-bold">⚙️ Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Full server control — {allPlayers?.length ?? 0} players</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setSelectedTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedTab === t.id ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="size-3.5" />{t.label}
          </button>
        ))}
      </div>

      {selectedTab === "players" && (
        <div className="space-y-3">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search players..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredPlayers.map((p: any) => (
              <div key={p._id} className={`p-3 rounded-xl border ${p.isBanned ? "bg-red-950/20 border-red-500/30" : "bg-background/40 border-border/30"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{p.nickname ?? "Unknown"}</span>
                      {p.role === "admin" && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                      {p.isBanned && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">BANNED</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Lv.{p.level} • 💰${p.money?.toLocaleString()} • ❤️{p.life}/{p.maxLife}</div>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    <button onClick={() => doAction("giveMoney", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-green-500/10 text-green-400 rounded hover:bg-green-500/20" title="Give Money">💰</button>
                    <button onClick={() => doAction("resetMoney", { targetId: p._id, amount: 0 })} className="px-2 py-1 text-[9px] bg-red-500/10 text-red-400 rounded hover:bg-red-500/20" title="Reset Money to $0">💸</button>
                    <button onClick={() => doAction("setLevel", { targetId: p._id, level: (p.level ?? 1) + 1 })} className="px-2 py-1 text-[9px] bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20" title="Level Up +1">⬆️</button>
                    <button onClick={() => doAction("heal", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20" title="Full Heal">💚</button>
                    <button onClick={() => doAction("kill", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-red-500/10 text-red-400 rounded hover:bg-red-500/20" title="Kill Player">💀</button>
                    <button onClick={() => doAction("jail", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-yellow-500/10 text-yellow-400 rounded hover:bg-yellow-500/20" title="Jail 5 min">🔒</button>
                    <button onClick={() => p.isBanned ? doAction("unban", { targetId: p._id }) : doAction("ban", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-orange-500/10 text-orange-400 rounded hover:bg-orange-500/20" title={p.isBanned ? "Unban" : "Ban"}>{p.isBanned ? "🔓" : "🚫"}</button>
                    <button onClick={() => doAction("wipe", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20" title="Full Wipe">🧹</button>
                    <button onClick={() => doAction("wipe", { targetId: p._id })} className="px-2 py-1 text-[9px] bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20">🧹</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "events" && events && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold mb-2">🔴 Active Events</h3>
            {events.active.map((ev: any) => (
              <div key={ev.id} className="p-3 rounded-xl bg-green-950/20 border border-green-500/30 mb-2">
                <div className="font-bold text-sm">{ev.name}</div>
                <div className="text-xs text-muted-foreground">{ev.description}</div>
                <div className="text-[10px] text-green-400 mt-1">Type: {ev.type} • Ends: {new Date(ev.endsAt).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2">📅 Scheduled Events</h3>
            {events.scheduled.map((ev: any) => (
              <div key={ev.id} className="p-3 rounded-xl bg-background/40 border border-border/30 mb-2">
                <div className="font-bold text-sm">{ev.name}</div>
                <div className="text-xs text-muted-foreground">{ev.description}</div>
                <div className="text-[10px] text-yellow-400 mt-1">Type: {ev.type} • Starts: {new Date(ev.startsAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "tools" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">💰 Give Money</div>
            <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <button onClick={() => doAction("giveMoney", { targetId, amount })} disabled={!targetId || !amount}
              className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 disabled:opacity-40">
              Give Money
            </button>
          </div>
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">💸 Reset Money</div>
            <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Set to amount (0 = $0)"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <button onClick={() => doAction("resetMoney", { targetId, amount })} disabled={!targetId}
              className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500 disabled:opacity-40">
              Reset Money
            </button>
          </div>
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">⬆️ Set Player Level</div>
            <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Level (1-100)"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <button onClick={() => doAction("setLevel", { targetId, level: amount })} disabled={!targetId || !amount}
              className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500 disabled:opacity-40">
              Set Level
            </button>
          </div>
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">⚖️ Player Actions</div>
            <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => doAction("heal", { targetId })} disabled={!targetId}
                className="py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 disabled:opacity-40">💚 Heal</button>
              <button onClick={() => doAction("jail", { targetId, seconds: 300 })} disabled={!targetId}
                className="py-2 bg-yellow-600 text-white text-xs font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-40">🔒 Jail 5m</button>
              <button onClick={() => doAction("kill", { targetId })} disabled={!targetId}
                className="py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500 disabled:opacity-40">💀 Kill</button>
              <button onClick={() => doAction("ban", { targetId })} disabled={!targetId}
                className="py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-500 disabled:opacity-40">🚫 Ban</button>
              <button onClick={() => doAction("unban", { targetId })} disabled={!targetId}
                className="py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 disabled:opacity-40">🔓 Unban</button>
              <button onClick={() => doAction("wipe", { targetId })} disabled={!targetId}
                className="py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500 disabled:opacity-40">🧹 Full Wipe</button>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "competitions" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">🏆 Active Competitions</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-green-950/20 border border-green-500/30 rounded-lg">
                <div className="font-bold text-xs">💰 Grand Heist Tournament</div>
                <div className="text-[10px] text-muted-foreground">Top heist crew wins $50M prize pool</div>
                <div className="text-[10px] text-green-400 mt-1">🔴 LIVE • Ends in 2 days</div>
              </div>
              <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg">
                <div className="font-bold text-xs">🏎️ Street Race Championship</div>
                <div className="text-[10px] text-muted-foreground">1v1 street racing tournament • 256 players</div>
                <div className="text-[10px] text-blue-400 mt-1">🔴 LIVE • Round 3 of 8</div>
              </div>
              <div className="p-3 bg-yellow-950/20 border border-yellow-500/30 rounded-lg">
                <div className="font-bold text-xs">🎯 Most Wanted Challenge</div>
                <div className="text-[10px] text-muted-foreground">Highest kill count wins exclusive title</div>
                <div className="text-[10px] text-yellow-400 mt-1">📅 Starts in 12 hours</div>
              </div>
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg">
                <div className="font-bold text-xs">💎 Diamond Rush</div>
                <div className="text-[10px] text-muted-foreground">First to $10B cash wins legendary vehicle</div>
                <div className="text-[10px] text-purple-400 mt-1">📅 Starts in 1 day</div>
              </div>
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg">
                <div className="font-bold text-xs">⚔️ Family Wars Season</div>
                <div className="text-[10px] text-muted-foreground">Family with most territory wins $200M</div>
                <div className="text-[10px] text-red-400 mt-1">📅 Starts in 3 days</div>
              </div>
              <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded-lg">
                <div className="font-bold text-xs">🎰 Casino King</div>
                <div className="text-[10px] text-muted-foreground">Gambling tournament • Win $500M</div>
                <div className="text-[10px] text-orange-400 mt-1">📅 Starts in 6 hours</div>
              </div>
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                <div className="font-bold text-xs">🏃 Speed Heist League</div>
                <div className="text-[10px] text-muted-foreground">Fastest heist completion time wins</div>
                <div className="text-[10px] text-cyan-400 mt-1">📅 Starts in 2 days</div>
              </div>
              <div className="p-3 bg-pink-950/20 border border-pink-500/30 rounded-lg">
                <div className="font-bold text-xs">🥊 Underground Champion</div>
                <div className="text-[10px] text-muted-foreground">Fight club tournament • Win $75M</div>
                <div className="text-[10px] text-pink-400 mt-1">📅 Starts in 18 hours</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "weather" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">🌍 Dynamic Weather Events</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg">
                <div className="font-bold text-xs">❄️ Arctic Cold Snap</div>
                <div className="text-[10px] text-muted-foreground">Smuggling profits +50% • Duration: 4 hours</div>
                <div className="text-[10px] text-blue-400 mt-1">Active in 2 hours</div>
              </div>
              <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded-lg">
                <div className="font-bold text-xs">🔥 Heat Wave</div>
                <div className="text-[10px] text-muted-foreground">Crime XP +25% • All actions faster</div>
                <div className="text-[10px] text-orange-400 mt-1">Next: Tomorrow 12:00</div>
              </div>
              <div className="p-3 bg-gray-950/20 border border-gray-500/30 rounded-lg">
                <div className="font-bold text-xs">🌫️ Dense Fog</div>
                <div className="text-[10px] text-muted-foreground">Stealth crimes +40% success • Arrest chance -20%</div>
                <div className="text-[10px] text-gray-400 mt-1">Next: Tonight 22:00</div>
              </div>
              <div className="p-3 bg-yellow-950/20 border border-yellow-500/30 rounded-lg">
                <div className="font-bold text-xs">⚡ Thunder Storm</div>
                <div className="text-[10px] text-muted-foreground">Power grid sabotage +50% • Blackout events</div>
                <div className="text-[10px] text-yellow-400 mt-1">Next: Wednesday</div>
              </div>
              <div className="p-3 bg-green-950/20 border border-green-500/30 rounded-lg">
                <div className="font-bold text-xs">🌊 Flooding</div>
                <div className="text-[10px] text-muted-foreground">Cargo transport disrupted • Smuggling +30% profit</div>
                <div className="text-[10px] text-green-400 mt-1">Next: Thursday</div>
              </div>
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg">
                <div className="font-bold text-xs">🌕 Full Moon Night</div>
                <div className="text-[10px] text-muted-foreground">All rewards x1.5 • Rare item drops doubled</div>
                <div className="text-[10px] text-purple-400 mt-1">Next: Friday midnight</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "broadcasts" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold">📢 Broadcast System</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg">
                <div className="font-bold text-xs">🚨 Server Announcement</div>
                <div className="text-[10px] text-muted-foreground">Send message to all online players</div>
                <input type="text" placeholder="Announcement message..." className="w-full bg-background border border-border rounded px-2 py-1 text-[10px] mt-1" />
                <button className="mt-1 px-3 py-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-500">Send to All</button>
              </div>
              <div className="p-3 bg-green-950/20 border border-green-500/30 rounded-lg">
                <div className="font-bold text-xs">💰 Money Drop Event</div>
                <div className="text-[10px] text-muted-foreground">Trigger random cash drops for all players</div>
                <button className="mt-1 px-3 py-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-500">Trigger Drop</button>
              </div>
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg">
                <div className="font-bold text-xs">⚡ Double XP Event</div>
                <div className="text-[10px] text-muted-foreground">Activate 2x XP for 1 hour</div>
                <button className="mt-1 px-3 py-1 bg-purple-600 text-white text-[10px] rounded hover:bg-purple-500">Activate 2x XP</button>
              </div>
              <div className="p-3 bg-yellow-950/20 border border-yellow-500/30 rounded-lg">
                <div className="font-bold text-xs">🎯 Bounty Bonanza</div>
                <div className="text-[10px] text-muted-foreground">Double all bounty rewards for 2 hours</div>
                <button className="mt-1 px-3 py-1 bg-yellow-600 text-white text-[10px] rounded hover:bg-yellow-500">Activate Bounties</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "stats" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{allPlayers?.length ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Total Players</div>
          </div>
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{allPlayers?.filter((p: any) => p.lastActive && p.lastActive > Date.now() - 300000).length ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Online Now</div>
          </div>
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{allPlayers?.filter((p: any) => p.isBanned).length ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Banned</div>
          </div>
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{events?.active?.length ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Active Events</div>
          </div>
        </div>
      )}

      {msg && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-sm rounded-lg p-3 ${msg.includes("✅") ? "bg-green-950/30 text-green-400" : "bg-red-950/30 text-red-400"}`}>
          {msg}
        </motion.div>
      )}
    </div>
  );
}

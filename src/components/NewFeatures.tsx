import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gift, Calendar, Star, Shield, Users, Trophy, Zap, Clock,
  ChevronRight, Crown, Swords, Target, TrendingUp, Flame, Award, ShieldCheck,
} from "lucide-react";


// ===== DAILY LOGIN REWARDS =====
const DAILY_REWARDS = [
  { day: 1, reward: 100000, type: "money" as const, label: "$100K", icon: "💰" },
  { day: 2, reward: 350000, type: "money" as const, label: "$350K", icon: "💰" },
  { day: 3, reward: 700000, type: "money" as const, label: "$700K", icon: "💎" },
  { day: 4, reward: 1400000, type: "money" as const, label: "$1.4M", icon: "💎" },
  { day: 5, reward: 2800000, type: "money" as const, label: "$2.8M", icon: "🏆" },
  { day: 6, reward: 6000000, type: "money" as const, label: "$6M", icon: "🏆" },
  { day: 7, reward: 12000000, type: "bonus" as const, label: "$12M + Legendary Item", icon: "👑" },
];

export function DailyLoginPage() {
  const player = useQuery(api.game.getPlayer);
  const claimReward = useMutation(api.gameExtended.claimDailyReward);
  const [claimed, setClaimed] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Calculate streak based on player data
  const currentStreak = player?.dailyStreak ?? 0;
  const lastClaim = player?.lastDailyClaim ?? 0;
  const now = Date.now();
  const oneDayMs = 86400000;
  const canClaim = !lastClaim || (now - lastClaim) >= oneDayMs;
  const todayBonus = DAILY_REWARDS[(currentStreak % 7)];

  const handleClaim = async () => {
    if (!canClaim || claimed) return;
    try {
      const res = await claimReward({});
      if (res.success) {
        setClaimed(true);
        setResult(res.message);
      } else {
        setResult(res.message);
      }
    } catch {
      setResult("Failed to claim reward. Try again later.");
    }
  };

  // Timer until next claim
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (canClaim || !lastClaim) { setTimeLeft("Ready to claim!"); return; }
    const interval = setInterval(() => {
      const diff = oneDayMs - (now - (lastClaim || 0));
      if (diff <= 0) { setTimeLeft("Ready to claim!"); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [canClaim, lastClaim]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-green-500/30 bg-gradient-to-r from-gray-900 via-green-950 to-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-green-400">🎁 DAILY LOGIN REWARDS</h2>
            <p className="text-sm text-green-200/60">Log in every day for massive bonuses. Streak bonus at Day 7!</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-green-200/40 uppercase tracking-widest">Next reward in</div>
            <div className="font-mono text-xl font-black text-green-400">{timeLeft}</div>
          </div>
        </div>
      </motion.div>

      {/* Streak Display */}
      <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-300">🔥 Login Streak</span>
          <span className="text-lg font-black text-orange-400">{currentStreak} days</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(((currentStreak % 7) / 7) * 100, 100)}%` }} />
        </div>
        <div className="text-xs text-gray-500 mt-1">{7 - (currentStreak % 7)} days until Day 7 bonus</div>
      </div>

      {/* Reward Cards */}
      <div className="grid grid-cols-7 gap-3">
        {DAILY_REWARDS.map((r, i) => {
          const dayInStreak = (currentStreak % 7);
          const isToday = i === dayInStreak && canClaim;
          const isClaimed = i < dayInStreak;
          const isLocked = i > dayInStreak && !isToday;
          return (
            <motion.div key={r.day} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={`relative rounded-xl border-2 p-3 text-center transition-all ${isToday ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20 cursor-pointer' : isClaimed ? 'border-gray-600 bg-gray-800/50' : 'border-gray-700 bg-gray-900/50'} ${isLocked ? 'opacity-40' : ''}`}>
              {i === 6 && <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">MEGA</div>}
              <div className="text-2xl mb-1">{r.icon}</div>
              <div className="text-xs text-gray-500">Day {r.day}</div>
              <div className={`text-sm font-black ${i === 6 ? 'text-yellow-400' : 'text-white'}`}>{r.label}</div>
              {isClaimed && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"><span className="text-green-400 text-xl">✓</span></div>}
              {isToday && (
                <button onClick={handleClaim}
                  className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 rounded-lg transition-colors">
                  CLAIM
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-green-500/30 bg-green-900/20 p-4 text-center">
          <div className="text-green-400 font-bold">{result}</div>
        </motion.div>
      )}
    </div>
  );
}

// ===== CREW SYSTEM =====
interface CrewMember {
  id: string;
  name: string;
  role: string;
  level: number;
  joinedAt: string;
 贡献: number;
}

const CREW_ROLES = [
  { name: "El Jefe", color: "text-yellow-400", icon: "👑", permissions: ["All"] },
  { name: "Consigliere", color: "text-purple-400", icon: "🎭", permissions: ["Manage", "Invite", "War"] },
  { name: "Caporegime", color: "text-blue-400", icon: "⚔️", permissions: ["Invite", "War"] },
  { name: "Soldier", color: "text-green-400", icon: "🔫", permissions: ["Crime"] },
  { name: "Associate", color: "text-gray-400", icon: "🤝", permissions: ["Basic"] },
];

export function CrewSystemPage() {
  const player = useQuery(api.game.getPlayer);
  const [view, setView] = useState<"home" | "create" | "browse" | "my_crew">("home");
  const [crewName, setCrewName] = useState("");
  const [crewTag, setCrewTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const hasCrew = false; // TODO: from player data

  const mockCrews = [
    { name: "The Commission", tag: "COM", members: 12, level: 45, territory: "Downtown", power: 9800 },
    { name: "Sinaloa Cartel", tag: "SIN", members: 8, level: 38, territory: "South Side", power: 7200 },
    { name: "The Triads", tag: "TRI", members: 15, level: 52, territory: "Chinatown", power: 11500 },
    { name: "La Cosa Nostra", tag: "LCN", members: 10, level: 41, territory: "Little Italy", power: 8900 },
    { name: "The Yakuza", tag: "YKZ", members: 9, level: 36, territory: "Japantown", power: 6700 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 p-6">
        <h2 className="text-2xl font-black text-purple-400">👥 CREW SYSTEM</h2>
        <p className="text-sm text-purple-200/60">Create or join a crew. Fight together, earn together, rule together.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["home", "create", "browse", "my_crew"] as const).map((tab) => (
          <button key={tab} onClick={() => setView(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === tab ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {tab === "home" ? "Overview" : tab === "create" ? "Create Crew" : tab === "browse" ? "Browse Crews" : "My Crew"}
          </button>
        ))}
      </div>

      {view === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 text-center">
            <div className="text-4xl mb-3">👑</div>
            <h3 className="text-lg font-black text-white mb-2">Create a Crew</h3>
            <p className="text-sm text-gray-400 mb-4">Start your own criminal empire</p>
            <div className="text-xs text-yellow-400">Cost: $50,000</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-black text-white mb-2">Join a Crew</h3>
            <p className="text-sm text-gray-400 mb-4">Find allies to fight with</p>
            <div className="text-xs text-green-400">Free to join</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="text-lg font-black text-white mb-2">Crew Wars</h3>
            <p className="text-sm text-gray-400 mb-4">Battle other crews for territory</p>
            <div className="text-xs text-red-400">Requires Lv. 10+</div>
          </motion.div>
        </div>
      )}

      {view === "create" && (
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 space-y-4">
          <h3 className="text-lg font-black text-white">Create Your Crew</h3>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Crew Name</label>
            <input value={crewName} onChange={e => setCrewName(e.target.value)} placeholder="e.g. The Shadow Syndicate"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Crew Tag (3 letters)</label>
            <input value={crewTag} onChange={e => setCrewTag(e.target.value.toUpperCase().slice(0, 3))} placeholder="e.g. SHS"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none" maxLength={3} />
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Crew Features:</div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Shared treasury for crew funds</li>
              <li>• Crew-only chat channel</li>
              <li>• Crew vs Crew wars</li>
              <li>• Shared territory income</li>
              <li>• Crew rankings on leaderboards</li>
            </ul>
          </div>
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">
            Create Crew — $50,000
          </button>
        </div>
      )}

      {view === "browse" && (
        <div className="space-y-4">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search crews..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none" />
          <div className="space-y-3">
            {mockCrews.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((crew, i) => (
              <motion.div key={crew.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🏴</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{crew.name}</span>
                      <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">[{crew.tag}]</span>
                    </div>
                    <div className="text-xs text-gray-400">Territory: {crew.territory} • Lv. {crew.level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-400">{crew.power.toLocaleString()} ⚔️</div>
                    <div className="text-xs text-gray-500">{crew.members}/15 members</div>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {view === "my_crew" && (
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          {!hasCrew ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🏴</div>
              <h3 className="text-lg font-bold text-white mb-2">Not in a crew</h3>
              <p className="text-sm text-gray-400">Create or join a crew to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">My Crew</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== RANKED PVP =====
const PVP_RANKS = [
  { name: "Bronze", minRating: 0, color: "text-orange-600", bg: "bg-orange-900/30", border: "border-orange-600", icon: "🥉" },
  { name: "Silver", minRating: 1000, color: "text-gray-300", bg: "bg-gray-700/30", border: "border-gray-400", icon: "🥈" },
  { name: "Gold", minRating: 2000, color: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-500", icon: "🥇" },
  { name: "Platinum", minRating: 3500, color: "text-cyan-400", bg: "bg-cyan-900/30", border: "border-cyan-500", icon: "💠" },
  { name: "Diamond", minRating: 5000, color: "text-purple-400", bg: "bg-purple-900/30", border: "border-purple-500", icon: "💎" },
  { name: "Crime King", minRating: 7500, color: "text-yellow-300", bg: "bg-gradient-to-r from-yellow-900/30 to-red-900/30", border: "border-yellow-400", icon: "👑" },
];

export function RankedPvpPage() {
  const player = useQuery(api.game.getPlayer);
  const [view, setView] = useState<"ranked" | "leaderboard" | "history">("ranked");

  const pvpRating = 1250; // TODO: from player data
  const currentRank = PVP_RANKS.filter(r => pvpRating >= r.minRating).pop() || PVP_RANKS[0];
  const nextRank = PVP_RANKS[PVP_RANKS.indexOf(currentRank) + 1];

  const mockLeaderboard = [
    { pos: 1, name: "ShadowKing", rating: 8200, wins: 342, losses: 28, rankName: "Crime King", streak: 15 },
    { pos: 2, name: "TheButcher", rating: 7800, wins: 298, losses: 45, rankName: "Crime King", streak: 8 },
    { pos: 3, name: "NightWolf", rating: 6500, wins: 267, losses: 52, rankName: "Diamond", streak: 5 },
    { pos: 4, name: "IronFist", rating: 5800, wins: 234, losses: 67, rankName: "Diamond", streak: 3 },
    { pos: 5, name: "Ghost", rating: 5200, wins: 201, losses: 43, rankName: "Diamond", streak: 7 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-500/30 bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 p-6">
        <h2 className="text-2xl font-black text-red-400">⚔️ RANKED PVP</h2>
        <p className="text-sm text-red-200/60">Fight your way to the top. Monthly seasons with exclusive rewards.</p>
      </motion.div>

      {/* Current Rank */}
      <div className={`rounded-xl border-2 ${currentRank.border} ${currentRank.bg} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{currentRank.icon}</div>
            <div>
              <div className={`text-2xl font-black ${currentRank.color}`}>{currentRank.name}</div>
              <div className="text-sm text-gray-400">Rating: {pvpRating.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Season 1 — Ends in</div>
            <div className="font-mono text-xl font-black text-red-400">14d 6h 32m</div>
          </div>
        </div>
        {nextRank && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{currentRank.name}</span>
              <span>{nextRank.name} ({nextRank.minRating})</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div className="bg-gradient-to-r from-red-500 to-yellow-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(((pvpRating - currentRank.minRating) / (nextRank.minRating - currentRank.minRating)) * 100, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["ranked", "leaderboard", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setView(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === tab ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {tab === "ranked" ? "Find Match" : tab === "leaderboard" ? "Leaderboard" : "Match History"}
          </button>
        ))}
      </div>

      {view === "ranked" && (
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-8 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-xl font-black text-white mb-2">Ready to Fight?</h3>
          <p className="text-sm text-gray-400 mb-6">You'll be matched with players of similar rating</p>
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">247</div>
              <div className="text-xs text-gray-500">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">53</div>
              <div className="text-xs text-gray-500">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">82%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-red-500/20">
            ⚔️ FIND MATCH
          </button>
        </div>
      )}

      {view === "leaderboard" && (
        <div className="space-y-2">
          {PVP_RANKS.map((rank) => (
            <div key={rank.name} className={`rounded-lg border ${rank.border} ${rank.bg} p-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rank.icon}</span>
                <span className={`font-black ${rank.color}`}>{rank.name}</span>
              </div>
              <span className="text-sm text-gray-400">{rank.minRating}+ rating</span>
            </div>
          ))}
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-black text-white">Top Players</h3>
            {mockLeaderboard.map((p) => (
              <div key={p.name} className="rounded-xl border border-gray-700 bg-gray-900/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-500">#{p.pos}</span>
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">🔥 {p.streak} streak</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-400">{p.rating.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{p.wins}W / {p.losses}L</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "history" && (
        <div className="space-y-2">
          {[
            { opponent: "NightWolf", result: "win", rating: "+25", time: "2h ago" },
            { opponent: "IronFist", result: "win", rating: "+30", time: "5h ago" },
            { opponent: "Ghost", result: "loss", rating: "-20", time: "1d ago" },
            { opponent: "TheButcher", result: "win", rating: "+35", time: "1d ago" },
          ].map((m, i) => (
            <div key={i} className={`rounded-xl border p-3 flex items-center justify-between ${m.result === 'win' ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-black ${m.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {m.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                </span>
                <span className="text-white font-bold">vs {m.opponent}</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${m.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{m.rating}</div>
                <div className="text-xs text-gray-500">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

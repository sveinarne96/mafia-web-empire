import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Shield, Gift, Clock, Zap, Lock, Star, Trophy, Crown, Skull, AlertTriangle, Loader2 } from "lucide-react";

// Season pass config
const SEASON_DURATION_MS = 60 * 24 * 60 * 60 * 1000; // ~60 days (2 months)
const PURGE_BEFORE_END_MS = 5 * 24 * 60 * 60 * 1000; // 5 days before end
const WIPE_COUNTDOWN_MS = 60 * 1000; // 1 minute countdown

interface SeasonConfig {
  seasonNumber: number;
  startDate: number;
  endDate: number;
  isPurgeActive: boolean;
  isWiping: boolean;
}

function getSeasonConfig(): SeasonConfig {
  const stored = typeof window !== "undefined" ? localStorage.getItem("shadowempire_season") : null;
  if (stored) {
    const config = JSON.parse(stored) as SeasonConfig;
    const now = Date.now();
    // Check if season expired
    if (now > config.endDate + WIPE_COUNTDOWN_MS) {
      // Start new season
      const newConfig: SeasonConfig = {
        seasonNumber: config.seasonNumber + 1,
        startDate: now,
        endDate: now + SEASON_DURATION_MS,
        isPurgeActive: false,
        isWiping: false,
      };
      localStorage.setItem("shadowempire_season", JSON.stringify(newConfig));
      return newConfig;
    }
    // Check if purge should be active
    const purgeStart = config.endDate - PURGE_BEFORE_END_MS;
    if (now >= purgeStart && now < config.endDate && !config.isPurgeActive) {
      config.isPurgeActive = true;
      localStorage.setItem("shadowempire_season", JSON.stringify(config));
    }
    return config;
  }
  // First time - create season
  const now = Date.now();
  const config: SeasonConfig = {
    seasonNumber: 1,
    startDate: now,
    endDate: now + SEASON_DURATION_MS,
    isPurgeActive: false,
    isWiping: false,
  };
  localStorage.setItem("shadowempire_season", JSON.stringify(config));
  return config;
}

const seasonRewards = [
  { level: 1, reward: "Bronze Starter Pack", icon: "🎁", desc: "$5,000 + 50 pts" },
  { level: 5, reward: "Street Cred Badge", icon: "🏅", desc: "+500 XP" },
  { level: 10, reward: "Crime Kit", icon: "🧰", desc: "Free weapon + armor" },
  { level: 15, reward: "Vault Access", icon: "🔐", desc: "+$25,000 bonus" },
  { level: 20, reward: "Elite Title", icon: "👑", desc: "\"Seasoned Criminal\" title" },
  { level: 25, reward: "Vehicle Key", icon: "🔑", desc: "Free sports car" },
  { level: 30, reward: "Don's Briefcase", icon: "💼", desc: "+$100,000 cash" },
  { level: 35, reward: "Golden Weapon", icon: "⚔️", desc: "+15 ATK weapon" },
  { level: 40, reward: "Safe House Key", icon: "🏠", desc: "Free safe house" },
  { level: 45, reward: "Legend Status", icon: "🌟", desc: "+5000 XP + title" },
  { level: 50, reward: "Season Champion", icon: "🏆", desc: "+$500,000 + Prestige" },
];

export function SeasonPassPage() {
  const player = useQuery(api.game.getPlayer);
  const [season, setSeason] = useState<SeasonConfig>(getSeasonConfig);
  const [wipeCountdown, setWipeCountdown] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, season.endDate - now);
      setWipeCountdown(timeLeft);
      if (timeLeft <= 0 && !season.isWiping) {
        setSeason(prev => ({ ...prev, isWiping: true }));
        localStorage.setItem("shadowempire_season", JSON.stringify({ ...season, isWiping: true }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [season.endDate, season.isWiping]);

  // Wipe screen
  if (season.isWiping) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md">
          <div className="text-6xl animate-pulse">⚠️</div>
          <h1 className="text-3xl font-bold text-destructive">WIPE IN PROGRESS</h1>
          <p className="text-muted-foreground">All players are being reset to Level 0. Your account is safe.</p>
          <p className="text-sm text-muted-foreground">Please wait while the world resets...</p>
          <div className="mafia-card rounded-xl p-6">
            <div className="text-4xl font-bold text-primary animate-pulse">{Math.ceil(wipeCountdown / 1000)}s</div>
            <div className="text-xs text-muted-foreground mt-2">Until game reload</div>
          </div>
          {wipeCountdown <= 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-primary font-bold animate-pulse">🎮 Season {season.seasonNumber + 1} is starting...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!player) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }

  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((season.endDate - now) / (24 * 60 * 60 * 1000)));
  const hoursLeft = Math.max(0, Math.ceil((season.endDate - now) / (60 * 60 * 1000)));
  const progress = Math.min(100, ((now - season.startDate) / (season.endDate - season.startDate)) * 100);
  const purgeStart = season.endDate - PURGE_BEFORE_END_MS;
  const isPurgePhase = now >= purgeStart;
  const playerLevel = player.level ?? 1;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="size-7 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">🛡️ Season {season.seasonNumber}</h2>
            <p className="text-xs text-muted-foreground">Season Pass & Wipe System</p>
          </div>
        </div>
        {isPurgePhase && (
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }}
            className="px-3 py-1 bg-red-950/50 border border-red-800/50 rounded-full text-xs font-bold text-red-400">
            🔥 PURGE ACTIVE
          </motion.div>
        )}
      </div>

      {/* Season Timer */}
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Clock className="size-4 text-primary" /><span className="text-sm font-semibold">Season Timer</span></div>
          <span className={`text-sm font-bold ${daysLeft <= 5 ? "text-destructive" : "text-primary"}`}>{daysLeft} days left</span>
        </div>
        <div className="h-3 rounded-full bg-background/60 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Started {new Date(season.startDate).toLocaleDateString()}</span>
          <span>Ends {new Date(season.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Purge Warning */}
      {isPurgePhase && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mafia-card rounded-xl p-5 border-red-800/50 border space-y-2">
          <div className="flex items-center gap-2">
            <Skull className="size-5 text-red-400" />
            <h3 className="font-bold text-red-400">⚠️ PURGE PHASE</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            The Purge is active! All players will be reset to <span className="text-destructive font-bold">Level 0</span> when the season ends.
            Your account will NOT be deleted — only your progress resets.
          </p>
          <p className="text-xs text-red-400 font-bold">
            ⏰ Wipe begins in {Math.max(0, Math.ceil((season.endDate - now) / (60 * 60 * 1000)))} hours
          </p>
        </motion.div>
      )}

      {/* Active Boost */}
      {isPurgePhase && (
        <div className="mafia-card rounded-xl p-4 bg-gradient-to-r from-red-950/30 to-orange-950/30 border border-red-800/30">
          <div className="flex items-center gap-3">
            <Zap className="size-5 text-yellow-400" />
            <div>
              <div className="font-bold text-sm">🔥 Purge Bonus Active</div>
              <div className="text-xs text-muted-foreground">+50% XP and money on ALL actions during Purge phase!</div>
            </div>
          </div>
        </div>
      )}

      {/* Season Rewards Track */}
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2"><Gift className="size-5 text-yellow-400" /><h3 className="font-bold text-sm">🎁 Season Reward Track</h3></div>
        <div className="space-y-2">
          {seasonRewards.map((r) => {
            const unlocked = playerLevel >= r.level;
            return (
              <motion.div key={r.level} whileHover={{ scale: 1.005 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${unlocked ? "bg-primary/5 border border-primary/20" : "bg-background/30 border border-border/30 opacity-60"}`}>
                <div className="w-10 h-10 rounded-lg bg-background/60 flex items-center justify-center text-lg shrink-0">
                  {unlocked ? r.icon : <Lock className="size-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Lv.{r.level}</span>
                    <span className={`text-xs ${unlocked ? "text-primary" : "text-muted-foreground"}`}>{r.reward}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                </div>
                {unlocked && <Trophy className="size-4 text-yellow-400 shrink-0" />}
                {!unlocked && <span className="text-[10px] text-muted-foreground shrink-0">Lv.{r.level} needed</span>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Season Stats */}
      <div className="mafia-card rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-background/30 rounded-lg p-3"><div className="text-muted-foreground mb-1">Your Level</div><div className="text-lg font-bold text-primary">{playerLevel}</div></div>
          <div className="bg-background/30 rounded-lg p-3"><div className="text-muted-foreground mb-1">Rewards Unlocked</div><div className="text-lg font-bold text-yellow-400">{seasonRewards.filter(r => playerLevel >= r.level).length}/{seasonRewards.length}</div></div>
          <div className="bg-background/30 rounded-lg p-3"><div className="text-muted-foreground mb-1">Days Remaining</div><div className={`text-lg font-bold ${daysLeft <= 5 ? "text-destructive" : "text-green-400"}`}>{daysLeft}</div></div>
          <div className="bg-background/30 rounded-lg p-3"><div className="text-muted-foreground mb-1">Season #</div><div className="text-lg font-bold">{season.seasonNumber}</div></div>
        </div>
      </div>
    </div>
  );
}

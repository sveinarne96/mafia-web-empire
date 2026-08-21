import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, Flame, Shield, Skull, Trophy, Star, Swords, Target, Bomb, Crown, Gift, Heart, AlertTriangle } from "lucide-react";

interface GameEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: "boost" | "danger" | "pvp" | "crime" | "social" | "seasonal" | "raid" | "competition";
  color: string;
  bgColor: string;
  borderColor: string;
  multiplier?: number;
  duration: number; // in seconds
  startTime: number;
}

const ALL_EVENTS: Omit<GameEvent, "startTime">[] = [
  // BOOST EVENTS
  { id: "double_xp", name: "Double XP Weekend", emoji: "🔥", description: "2x XP on all actions!", type: "boost", color: "text-orange-400", bgColor: "bg-orange-950/40", borderColor: "border-orange-500/50", multiplier: 2, duration: 7200 },
  { id: "triple_money", name: "Triple Money Rush", emoji: "💰", description: "3x money on all crimes!", type: "boost", color: "text-green-400", bgColor: "bg-green-950/40", borderColor: "border-green-500/50", multiplier: 3, duration: 3600 },
  { id: "weekend_boost", name: "Weekend Boost", emoji: "⚡", description: "1.5x everything all weekend!", type: "boost", color: "text-yellow-400", bgColor: "bg-yellow-950/40", borderColor: "border-yellow-500/50", multiplier: 1.5, duration: 14400 },
  { id: "golden_hour", name: "Golden Hour", emoji: "✨", description: "3x rewards for 1 hour!", type: "boost", color: "text-yellow-300", bgColor: "bg-yellow-950/30", borderColor: "border-yellow-400/50", multiplier: 3, duration: 3600 },
  { id: "energy_surge", name: "Energy Surge", emoji: "⚡", description: "Free energy refills for 30 min!", type: "boost", color: "text-cyan-400", bgColor: "bg-cyan-950/40", borderColor: "border-cyan-500/50", duration: 1800 },
  { id: "crime_frenzy", name: "Crime Frenzy", emoji: "🔥", description: "Crime success rate +25%!", type: "crime", color: "text-red-400", bgColor: "bg-red-950/40", borderColor: "border-red-500/50", duration: 5400 },

  // DANGER EVENTS
  { id: "arctic_freeze", name: "Arctic Cold Snap", emoji: "❄️", description: "Smuggling profits +50% but arrest risk doubled!", type: "danger", color: "text-blue-300", bgColor: "bg-blue-950/40", borderColor: "border-blue-400/50", multiplier: 1.5, duration: 7200 },
  { id: "police_crackdown", name: "Police Crackdown", emoji: "🚔", description: "Wanted levels rise 2x faster!", type: "danger", color: "text-red-300", bgColor: "bg-red-950/30", borderColor: "border-red-400/40", duration: 3600 },
  { id: "power_outage", name: "City Power Outage", emoji: "🔌", description: "Blackout! Stealth crimes +30% success!", type: "crime", color: "text-purple-300", bgColor: "bg-purple-950/40", borderColor: "border-purple-500/50", duration: 2400 },
  { id: "earthquake", name: "Earthquake Alert", emoji: "🌋", description: "Construction sites collapse! Double salvage!", type: "danger", color: "text-orange-300", bgColor: "bg-orange-950/30", borderColor: "border-orange-400/40", duration: 1800 },
  { id: "tornado_warning", name: "Tornado Warning", emoji: "🌪️", description: "Safe houses fortified! Defense +50%!", type: "danger", color: "text-gray-300", bgColor: "bg-gray-950/40", borderColor: "border-gray-400/50", duration: 2700 },

  // PVP EVENTS
  { id: "kill_free_zone", name: "Kill Free Zone", emoji: "⚔️", description: "PvP kills disabled for 2 hours!", type: "pvp", color: "text-red-400", bgColor: "bg-red-950/40", borderColor: "border-red-500/50", duration: 7200 },
  { id: "bounty_blitz", name: "Bounty Blitz", emoji: "🎯", description: "All bounty rewards x3!", type: "pvp", color: "text-yellow-400", bgColor: "bg-yellow-950/40", borderColor: "border-yellow-500/50", multiplier: 3, duration: 5400 },
  { id: "arena_madness", name: "Arena Madness", emoji: "🏟️", description: "Arena prizes doubled!", type: "pvp", color: "text-purple-400", bgColor: "bg-purple-950/40", borderColor: "border-purple-500/50", multiplier: 2, duration: 3600 },
  { id: "duel_frenzy", name: "Duel Frenzy", emoji: "🗡️", description: "Duel stakes doubled, winners get 4x!", type: "pvp", color: "text-orange-400", bgColor: "bg-orange-950/40", borderColor: "border-orange-500/50", multiplier: 4, duration: 5400 },

  // CRIME EVENTS
  { id: "diamond_heist", name: "Diamond District Heist", emoji: "💎", description: "Diamond store robbery available! $10M reward!", type: "raid", color: "text-cyan-300", bgColor: "bg-cyan-950/40", borderColor: "border-cyan-500/50", duration: 1800 },
  { id: "bank_vault", name: "Bank Vault Open", emoji: "🏦", description: "Bank vault cracked! Grab cash!", type: "raid", color: "text-green-300", bgColor: "bg-green-950/40", borderColor: "border-green-500/50", duration: 1200 },
  { id: "casino_robbery", name: "Casino Robbery", emoji: "🎰", description: "Casino vault exposed! Maximum loot!", type: "raid", color: "text-yellow-300", bgColor: "bg-yellow-950/40", borderColor: "border-yellow-500/50", duration: 1500 },
  { id: "museum_heist", name: "Museum Heist", emoji: "🏛️", description: "Priceless artifacts exposed! Steal them!", type: "raid", color: "text-amber-300", bgColor: "bg-amber-950/40", borderColor: "border-amber-500/50", duration: 2400 },
  { id: "train_robbery", name: "Express Train Robbery", emoji: "🚂", description: "Gold train passing through! Stop it!", type: "raid", color: "text-yellow-200", bgColor: "bg-yellow-950/30", borderColor: "border-yellow-400/50", duration: 900 },

  // COMPETITION EVENTS
  { id: "heist_tournament", name: "Grand Heist Tournament", emoji: "🏆", description: "Top heist crew wins $50M!", type: "competition", color: "text-yellow-400", bgColor: "bg-yellow-950/40", borderColor: "border-yellow-500/50", duration: 14400 },
  { id: "street_race", name: "Street Race Championship", emoji: "🏁", description: "1v1 street racing tournament!", type: "competition", color: "text-red-400", bgColor: "bg-red-950/40", borderColor: "border-red-500/50", duration: 7200 },
  { id: "crime_king", name: "Crime King Competition", emoji: "👑", description: "Most crimes in 1 hour wins $100M!", type: "competition", color: "text-yellow-300", bgColor: "bg-yellow-950/30", borderColor: "border-yellow-400/50", duration: 3600 },
  { id: "fight_championship", name: "Underground Fight Championship", emoji: "🥊", description: "Fighters compete for $25M prize!", type: "competition", color: "text-red-300", bgColor: "bg-red-950/30", borderColor: "border-red-400/50", duration: 5400 },
  { id: "smuggling_race", name: "Smuggling Speed Run", emoji: "🚛", description: "Fastest smuggler wins $30M!", type: "competition", color: "text-green-300", bgColor: "bg-green-950/30", borderColor: "border-green-400/50", duration: 3600 },

  // SOCIAL EVENTS
  { id: "family_war", name: "Family War Declaration", emoji: "⚔️", description: "Families go to war! Territory control active!", type: "social", color: "text-red-400", bgColor: "bg-red-950/40", borderColor: "border-red-500/50", duration: 10800 },
  { id: "black_market_sale", name: "Black Market Flash Sale", emoji: "🏷️", description: "Items 50% off in black market!", type: "boost", color: "text-purple-300", bgColor: "bg-purple-950/30", borderColor: "border-purple-400/50", duration: 2400 },
  { id: "donation_drive", name: "Family Donation Drive", emoji: "🎁", description: "Donations to family treasury doubled!", type: "social", color: "text-green-300", bgColor: "bg-green-950/30", borderColor: "border-green-400/50", multiplier: 2, duration: 5400 },

  // SEASONAL
  { id: "halloween", name: "Halloween Spookfest", emoji: "🎃", description: "Spooky crimes give double rewards!", type: "seasonal", color: "text-orange-400", bgColor: "bg-orange-950/40", borderColor: "border-orange-500/50", multiplier: 2, duration: 86400 },
  { id: "new_years", name: "New Year's Celebration", emoji: "🎆", description: "Fireworks! All actions +3x!", type: "seasonal", color: "text-yellow-300", bgColor: "bg-yellow-950/30", borderColor: "border-yellow-400/50", multiplier: 3, duration: 14400 },
  { id: "valentines", name: "Valentine's Day", emoji: "💕", description: "Gifting costs halved, reputation +50%!", type: "seasonal", color: "text-pink-400", bgColor: "bg-pink-950/40", borderColor: "border-pink-500/50", duration: 43200 },
];

function getTimeRemaining(endTime: number) {
  const now = Date.now();
  const diff = Math.max(0, endTime - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, total: diff };
}

export function LiveEventBanner() {
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Initialize with random active events
    const now = Date.now();
    const numActive = 3 + Math.floor(Math.random() * 4); // 3-6 active events
    const shuffled = [...ALL_EVENTS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numActive).map((e) => ({
      ...e,
      startTime: now - Math.floor(Math.random() * e.duration * 0.5), // Started sometime during duration
    }));
    setActiveEvents(selected);

    // Cycle through events
    const cycleTimer = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % selected.length);
    }, 5000);

    // Tick timer
    const tickTimer = setInterval(() => setTick((t) => t + 1), 1000);

    // Replace expired events with new ones
    const expireTimer = setInterval(() => {
      const now2 = Date.now();
      setActiveEvents((prev) => {
        const stillActive = prev.filter((e) => now2 < e.startTime + e.duration * 1000);
        if (stillActive.length < 3) {
          const used = new Set(stillActive.map((e) => e.id));
          const available = ALL_EVENTS.filter((e) => !used.has(e.id));
          if (available.length > 0) {
            const newEvent = available[Math.floor(Math.random() * available.length)];
            stillActive.push({ ...newEvent, startTime: now2 });
          }
        }
        return stillActive;
      });
    }, 30000);

    return () => { clearInterval(cycleTimer); clearInterval(tickTimer); clearInterval(expireTimer); };
  }, []);

  const currentEvent = activeEvents[currentEventIndex % activeEvents.length];
  if (!currentEvent) return null;

  const timeLeft = getTimeRemaining(currentEvent.startTime + currentEvent.duration * 1000);
  const progress = 1 - timeLeft.total / (currentEvent.duration * 1000);

  return (
    <div className="space-y-2">
      {/* Active Events Ticker */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${currentEvent.bgColor} ${currentEvent.borderColor} overflow-hidden`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg animate-pulse">{currentEvent.emoji}</span>
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={currentEvent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                <span className={`text-xs font-bold ${currentEvent.color}`}>{currentEvent.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">{currentEvent.description}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {currentEvent.multiplier && (
            <span className="text-[10px] font-bold text-yellow-400 bg-yellow-950/50 px-1.5 py-0.5 rounded">{currentEvent.multiplier}x</span>
          )}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="size-3" />
            <span>{timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ""}{timeLeft.minutes}m {timeLeft.seconds}s</span>
          </div>
          <div className="w-16 h-1.5 bg-background/50 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${currentEvent.type === "boost" ? "bg-green-500" : currentEvent.type === "danger" ? "bg-red-500" : currentEvent.type === "raid" ? "bg-yellow-500" : "bg-blue-500"}`} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Event Dots */}
      <div className="flex justify-center gap-1">
        {activeEvents.map((e, i) => (
          <button key={e.id} onClick={() => setCurrentEventIndex(i)}
            className={`size-1.5 rounded-full transition-all ${i === currentEventIndex ? "bg-primary w-4" : "bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
}

// Full event list for the Events page
export function EventsList() {
  const [filter, setFilter] = useState<string>("all");
  const types = ["all", "boost", "danger", "pvp", "crime", "raid", "competition", "social", "seasonal"];
  const filtered = filter === "all" ? ALL_EVENTS : ALL_EVENTS.filter((e) => e.type === filter);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="size-7 text-yellow-400" />
        <div>
          <h2 className="text-2xl font-bold">⚡ Events & Competitions</h2>
          <p className="text-sm text-muted-foreground">{ALL_EVENTS.length} events rotate through the city. Act fast!</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${filter === t ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "🌍 All" : t === "boost" ? "🔥 Boosts" : t === "danger" ? "⚠️ Danger" : t === "pvp" ? "⚔️ PvP" : t === "crime" ? "🔫 Crime" : t === "raid" ? "💰 Raids" : t === "competition" ? "🏆 Competitions" : t === "social" ? "👥 Social" : "🎄 Seasonal"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((event, i) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`rounded-xl p-4 border ${event.bgColor} ${event.borderColor} transition-all hover:shadow-lg`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{event.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${event.color}`}>{event.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-background/50 text-muted-foreground uppercase">{event.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  {event.multiplier && <span className="text-[10px] font-bold text-yellow-400">🔥 {event.multiplier}x rewards</span>}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{Math.floor(event.duration / 3600)}h {Math.floor((event.duration % 3600) / 60)}m</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

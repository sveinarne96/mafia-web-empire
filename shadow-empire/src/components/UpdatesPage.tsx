import { motion } from "framer-motion";
import { useState } from "react";
import {
  ScrollText, Zap, Shield, Flame, Skull, MapPinned, Target,
  Gift, Users, Globe, Car, Plane, Building2, Landmark, Trophy,
  Dices, Swords, MessageSquare, Bell, HelpCircle, Wifi, Key,
  Crown, Package, Brain, Calendar, SwordsIcon, Truck, AlertTriangle,
  Home, Banknote, BarChart3, MapPin, Search, Inbox, User, Heart,
  Wrench, Clock, Star, ChevronDown, ChevronRight, Sparkles,
  Gamepad2, Bug, Rocket, Eye, Lock, Crosshair, Radio, Satellite,
  ShieldCheck, Coins, Hash, Ticket, Wallet, BookOpen, Swords as SwordsIcon2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UpdateEntry {
  version: string;
  date: string;
  type: "major" | "feature" | "fix" | "balance" | "event";
  title: string;
  description: string;
  changes: string[];
}

const updates: UpdateEntry[] = [
  {
    version: "2.0.0",
    date: "2026-08-20",
    type: "major",
    title: "🎮 Season 2 — The Purge Rises",
    description: "Massive game overhaul with 100+ new features, Season Pass system, and the Purge event.",
    changes: [
      "🛡️ Season Pass system with 60-day cycles and 11 reward tiers",
      "💀 Purge event activates 5 days before season end — +50% XP & money bonus",
      "🔄 Season wipe resets levels but keeps accounts intact",
      "⏰ Live countdown during wipe with auto-reload when complete",
      "👑 Admin accounts are exempt from seasonal wipes",
    ],
  },
  {
    version: "1.9.0",
    date: "2026-08-20",
    type: "feature",
    title: "👤 Profile System",
    description: "Express yourself with avatars, badges, roles, and language settings.",
    changes: [
      "🎨 12 unique avatar options (Skull, Ghost, Vampire, Ninja, Detective, Devil, King, etc.)",
      "🏅 20 animated color roles (Shadow, Crimson, Phantom, Golden, Frost, Inferno, etc.)",
      "⭐ 8 achievement badges (Founder, Killer, Millionaire, Speedrunner, Survivor, etc.)",
      "🌍 33 supported languages — Scandinavian & European collections with toggle selection",
      "📊 Full player stats display with level, XP, money, crimes committed",
    ],
  },
  {
    version: "1.8.0",
    date: "2026-08-20",
    type: "feature",
    title: "🔒 Prison Overhaul",
    description: "Rebuilt prison system with 15-second sentences and auto-reload on release.",
    changes: [
      "⏱️ Prison sentence reduced to 15 seconds for faster gameplay loop",
      "🔄 Auto-reload when prison sentence expires — back in action instantly",
      "📋 Prison events and escape mechanics",
      "💰 Contraband smuggling in prison for reduced sentence",
    ],
  },
  {
    version: "1.7.0",
    date: "2026-08-20",
    type: "feature",
    title: "✈️ Airport & Travel System",
    description: "Travel between 12 realistic American cities with unique activities.",
    changes: [
      "🗽 12 cities: New York, LA, Chicago, Miami, Las Vegas, Detroit, Houston, Phoenix, Philadelphia, Boston, Atlanta, Dallas",
      "🔥 24/7 Murder zones in NYC, LA, Chicago — +50% XP bonus",
      "💊 Drug run missions available in 6 cities",
      "📋 Tax fraud operations in Miami, Phoenix, Boston",
      "📊 Each city has unique crime level and XP boost multiplier",
    ],
  },
  {
    version: "1.6.0",
    date: "2026-08-20",
    type: "feature",
    title: "📋 Mission System",
    description: "25 structured missions covering every game category with progress tracking.",
    changes: [
      "🔥 Crime missions: Complete street crimes, car thefts, and burglaries",
      "🎯 Heist missions: Execute bank robberies and warehouse raids",
      "🚛 Transport missions: Illegal transport across cities",
      "🎰 Gambling missions: Win big in casinos and lottery",
      "🌍 Explore missions: Visit different cities and facilities",
      "💼 Business missions: Own corner stores and companies",
      "🤝 Social missions: Create families and crews",
      "⚔️ PvP missions: Defeat opponents in ranked matches",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-08-20",
    type: "feature",
    title: "🧠 Skill Tree & Progression",
    description: "Deep character progression with skill trees and daily challenges.",
    changes: [
      "🧠 Skill Tree with 3 branches: Combat, Criminal, Social",
      "📅 Daily Challenges with bonus rewards for streak completion",
      "🏟️ Colosseum arena fights for massive XP and money",
      "🏠 Safe Houses — buy, upgrade, and collect passive income",
      "🤝 Cartel system for crew-level operations",
      "🌍 Reputation system across all cities",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-08-20",
    type: "feature",
    title: "⚔️ PvP & Combat",
    description: "Full competitive PvP system with rankings, duels, and tournaments.",
    changes: [
      "⚔️ Ranked PvP with ELO-based matchmaking",
      "🗡️ 1v1 Duels with weapon selection and betting",
      "🥊 Spar mode for skill practice without consequences",
      "🏆 Weekly tournaments with massive prize pools",
      "☠️ Death Match — last criminal standing wins",
      "📝 Combat Log to review all your fights",
      "🥋 Fighting Styles — learn Muay Thai, Boxing, Krav Maga, etc.",
      "🛡️ Armor system for defense boosts",
      "🎯 Hit List — place bounties on rival players",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-08-20",
    type: "feature",
    title: "🎲 Gambling Expansion",
    description: "12 different gambling games from dice to street racing.",
    changes: [
      "🎲 Dice — classic high/low with multiplier",
      "🎟️ Lotto — pick numbers, win jackpots",
      "🃏 Blackjack — beat the dealer",
      "🪙 Coin toss — heads or tails",
      "🐴 Horse Racing — bet on AI horses",
      "🔢 Number Game — guess the number",
      "🎲 Gambling Dens — underground high-stakes games",
      "🔴 Roulette — red or black",
      "🎰 Slots — spin to win",
      "💀 Russian Roulette — extreme risk, extreme reward",
      "🐕 Dog Fighting — bet on AI fighters",
      "🏎️ Street Racing — wager on street races",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-08-20",
    type: "feature",
    title: "🌍 Underground Economy",
    description: "Black market, smuggling, and territory control.",
    changes: [
      "🖤 Black Market — buy rare weapons, drugs, and gear",
      "🔴 Wanted Board — see who has bounties on their head",
      "🚛 Smuggling Routes — high-risk, high-reward transport missions",
      "🔥 Crime Spree — chain crimes for bonus multipliers",
      "💰 Stock Market — invest in companies",
      "🏠 Real Estate — buy and flip properties",
      "🏪 Businesses — own and manage criminal enterprises",
      "🏷️ Auction House — trade rare items with other players",
      "🛡️ Insurance — protect your assets",
      "💳 Loans — borrow money (with interest)",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-08-20",
    type: "feature",
    title: "🏗️ Empire Building",
    description: "Build your criminal empire with headquarters, companies, and crew management.",
    changes: [
      "🏢 Headquarters — upgrade your base of operations",
      "🏦 Bank — store money, earn interest",
      "🏥 Hospital — heal and revive",
      "🚗 Garage — store and upgrade stolen vehicles",
      "🎒 My Items — manage your inventory",
      "👥 Organized Crime — plan and execute multi-stage heists",
      "💼 Company — run legitimate front businesses",
      "👨‍👩‍👦 Family — create and manage your crime family",
      "🤝 Crew System — team up with other players",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-08-20",
    type: "major",
    title: "🚀 ShadowEmpire — Launch Day",
    description: "The criminal underworld awaits. Welcome to ShadowEmpire.",
    changes: [
      "🔥 Street crimes: Mugging, pickpocketing, shoplifting, breaking & entering",
      "🚗 Car theft and chop shop operations",
      "💰 Bank robbery, armored truck heists, casino heists",
      "📊 Full criminal progression system with XP and levels",
      "🗡️ Kill system with weapon selection",
      "💬 Forums: General, Sales, Off-Topic, and Shadows",
      "📬 In-game messaging and notifications",
      "🟢 Real-time online player list",
      "📊 City-wide statistics and leaderboards",
      "❓ FAQ and support system",
      "⭐ Daily Login Rewards for returning players",
      "🏆 Achievement system with unlockable badges",
      "🎭 Legendary Crimes — daily ultra-rare events with massive rewards",
    ],
  },
  {
    version: "1.0.1",
    date: "2026-08-20",
    type: "fix",
    title: "🔧 Quick Hotfixes",
    description: "Critical fixes applied shortly after launch.",
    changes: [
      "🐛 Fixed admin panel server errors on non-admin users",
      "🐛 Fixed becomeAdmin mutation error messages",
      "🐛 Fixed giveMoney notification crash",
      "🐛 Fixed all crime action click handlers not responding",
      "🐛 Fixed prison auto-reload after sentence expires",
      "🐛 Fixed Convex index errors for user authentication",
      "🐛 Fixed 502 proxy errors on page load",
    ],
  },
  {
    version: "1.0.2",
    date: "2026-08-20",
    type: "balance",
    title: "⚖️ Game Balance Pass",
    description: "Adjustments to keep the economy and combat balanced.",
    changes: [
      "💰 Starting money increased to $5,000 for new players",
      "⏱️ Prison sentence reduced from 30s to 15s",
      "📊 XP rewards scaled across all crime categories",
      "🎯 Crime success rates rebalanced based on level",
      "🛡️ Defense stat now properly reduces incoming damage",
      "💰 Tax rates adjusted for city-specific operations",
      "📈 Stock market returns balanced",
    ],
  },
];

const typeConfig = {
  major: { color: "from-yellow-500 to-orange-500", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Sparkles, label: "MAJOR" },
  feature: { color: "from-blue-500 to-cyan-500", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Rocket, label: "FEATURE" },
  fix: { color: "from-green-500 to-emerald-500", badge: "bg-green-500/20 text-green-400 border-green-500/30", icon: Bug, label: "FIX" },
  balance: { color: "from-purple-500 to-pink-500", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Shield, label: "BALANCE" },
  event: { color: "from-red-500 to-rose-500", badge: "bg-red-500/20 text-red-400 border-red-500/30", icon: Zap, label: "EVENT" },
};

export function UpdatesPage() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = filterType === "all" ? updates : updates.filter(u => u.type === filterType);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-3 mb-2">
          <ScrollText className="size-8 text-primary" />
          <h2 className="text-3xl font-bold">📜 Game Updates</h2>
        </div>
        <p className="text-sm text-muted-foreground">All patch notes and feature updates — auto-posted with every game change.</p>
        <div className="flex gap-2 mt-3">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono">v{updates[0].version}</span>
          <span className="text-xs text-muted-foreground">{updates.length} updates released</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "major", "feature", "fix", "balance"].map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${filterType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/30 text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "📋 All" : t === "major" ? "⭐ Major" : t === "feature" ? "🆕 Features" : t === "fix" ? "🐛 Fixes" : "⚖️ Balance"}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/30 to-transparent" />

        <div className="space-y-4">
          {filtered.map((update, i) => {
            const cfg = typeConfig[update.type];
            const Icon = cfg.icon;
            const isExpanded = expandedIdx === i;

            return (
              <motion.div key={update.version + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}>
                <div className={`relative pl-14 ${isExpanded ? "" : "pb-0"}`}>
                  {/* Timeline dot */}
                  <div className={`absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br ${cfg.color} flex items-center justify-center z-10 shadow-lg`}>
                    <Icon className="size-3 text-white" />
                  </div>

                  {/* Card */}
                  <motion.div layout
                    className={`rounded-xl border transition-all cursor-pointer ${isExpanded ? "bg-card border-primary/30 shadow-lg shadow-primary/5" : "bg-card/50 border-border/20 hover:border-border/40"}`}
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">v{update.version}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">{update.date}</span>
                          </div>
                          <h3 className="font-bold text-sm">{update.title}</h3>
                          {!isExpanded && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{update.description}</p>
                          )}
                        </div>
                        {isExpanded ? <ChevronDown className="size-4 text-muted-foreground shrink-0" /> : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
                      </div>

                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                          <p className="text-xs text-muted-foreground mb-3">{update.description}</p>
                          <div className="space-y-1.5">
                            {update.changes.map((change, ci) => (
                              <motion.div key={ci}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ci * 0.03 }}
                                className="flex items-start gap-2 text-xs py-1 px-2 rounded-lg bg-muted/30">
                                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span className="text-foreground/80">{change}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground border-t border-border/20">
        <p>📋 Updates are automatically posted as new features are released.</p>
        <p className="mt-1 font-mono text-[10px]">ShadowEmpire v{updates[0].version} • {updates.length} patches • {updates.reduce((sum, u) => sum + u.changes.length, 0)} changes</p>
      </div>
    </div>
  );
}

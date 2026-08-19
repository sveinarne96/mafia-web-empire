import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Swords, Shield, Zap, DollarSign, Skull, Lock, Eye,
  MapPin, Clock, Award, Flame, Heart, TrendingUp, Users, Crown,
  Target, Bomb, Crosshair, AlertTriangle, CheckCircle, XCircle,
  Truck, Package, Globe, Star, Coins, ShieldCheck, ChevronRight,
  RefreshCw, Timer, Swords as SwordsIcon,
} from "lucide-react";

// ====================================================================
// 🧠 SKILL TREE SYSTEM
// ====================================================================

interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  branch: "combat" | "criminal" | "social" | "business";
  tier: number;
  cost: number;
  requires?: string[];
  effect: string;
  bonus: { attack?: number; defense?: number; money?: number; xp?: number; crimeSuccess?: number };
}

const skillTree: SkillNode[] = [
  // COMBAT BRANCH
  { id: "brawler", name: "Brawler", description: "Street fighting basics. You hit harder.", icon: "👊", branch: "combat", tier: 1, cost: 1000, effect: "+3 ATK", bonus: { attack: 3 } },
  { id: "iron_fist", name: "Iron Fist", description: "Your fists are like steel.", icon: "🥊", branch: "combat", tier: 2, cost: 3000, effect: "+6 ATK", bonus: { attack: 6 }, requires: ["brawler"] },
  { id: "chain_combo", name: "Chain Combo", description: "Rapid-fire attacks that overwhelm enemies.", icon: "⚡", branch: "combat", tier: 2, cost: 2500, effect: "+4 ATK, +2% crit", bonus: { attack: 4 }, requires: ["brawler"] },
  { id: "berserker", name: "Berserker", description: "When low HP, deal double damage.", icon: "🔴", branch: "combat", tier: 3, cost: 8000, effect: "+12 ATK", bonus: { attack: 12 }, requires: ["iron_fist"] },
  { id: "parry_master", name: "Parry Master", description: "Deflect incoming attacks.", icon: "🛡️", branch: "combat", tier: 3, cost: 7000, effect: "+10 DEF", bonus: { defense: 10 }, requires: ["chain_combo"] },
  { id: "deathblow", name: "Deathblow", description: "One-hit kill chance on weaker enemies.", icon: "💀", branch: "combat", tier: 4, cost: 15000, effect: "+18 ATK, +5% instakill", bonus: { attack: 18 }, requires: ["berserker"] },
  { id: "iron_wall", name: "Iron Wall", description: "Near-invincible defense for 5 turns.", icon: "🏰", branch: "combat", tier: 4, cost: 14000, effect: "+20 DEF", bonus: { defense: 20 }, requires: ["parry_master"] },

  // CRIMINAL BRANCH
  { id: "pickpocket", name: "Pickpocket", description: "Steal small amounts from NPCs.", icon: "🤏", branch: "criminal", tier: 1, cost: 800, effect: "+5% crime success", bonus: { crimeSuccess: 5 } },
  { id: "locksmith", name: "Locksmith", description: "Open any lock with ease.", icon: "🔐", branch: "criminal", tier: 1, cost: 900, effect: "+5% crime success", bonus: { crimeSuccess: 5 } },
  { id: "master_thief", name: "Master Thief", description: "Advanced robbery techniques.", icon: "🦹", branch: "criminal", tier: 2, cost: 4000, effect: "+12% crime success, +20% steal", bonus: { crimeSuccess: 12 }, requires: ["pickpocket"] },
  { id: "safe_cracker", name: "Safe Cracker", description: "Bust open any safe.", icon: "🔓", branch: "criminal", tier: 2, cost: 4500, effect: "+10% crime success, +$500/bank", bonus: { crimeSuccess: 10, money: 500 }, requires: ["locksmith"] },
  { id: "cat_burglar", name: "Cat Burglar", description: "Invisible in the night. Stealth expert.", icon: "🐱", branch: "criminal", tier: 3, cost: 10000, effect: "+20% crime success, -50% arrest chance", bonus: { crimeSuccess: 20 }, requires: ["master_thief"] },
  { id: "vault_breaker", name: "Vault Breaker", description: "The last wall standing can't stop you.", icon: "💎", branch: "criminal", tier: 3, cost: 12000, effect: "+18% crime success, 3x bank robbery", bonus: { crimeSuccess: 18, money: 2000 }, requires: ["safe_cracker"] },
  { id: "phantom", name: "The Phantom", description: "A ghost. Nobody can catch you.", icon: "👻", branch: "criminal", tier: 4, cost: 25000, effect: "+30% crime success, immune to arrest", bonus: { crimeSuccess: 30 }, requires: ["cat_burglar"] },
  { id: "crime_genius", name: "Crime Genius", description: "Every crime yields double rewards.", icon: "🧠", branch: "criminal", tier: 4, cost: 30000, effect: "+25% crime success, 2x crime income", bonus: { crimeSuccess: 25, money: 5000 }, requires: ["vault_breaker"] },

  // SOCIAL BRANCH
  { id: "smooth_talker", name: "Smooth Talker", description: "Silver tongue opens doors.", icon: "🗣️", branch: "social", tier: 1, cost: 700, effect: "+100 XP/interaction", bonus: { xp: 10 } },
  { id: "intimidation", name: "Intimidation", description: "Fear is power.", icon: "😠", branch: "social", tier: 1, cost: 800, effect: "+5 DEF from fear", bonus: { defense: 5 } },
  { id: "gang_leader", name: "Gang Leader", description: "Lead your crew with authority.", icon: "👥", branch: "social", tier: 2, cost: 5000, effect: "+15% family bonus", bonus: { xp: 25, money: 1000 }, requires: ["smooth_talker"] },
  { id: "blackmailer", name: "Blackmailer", description: "Everyone has secrets. Profit from them.", icon: "📨", branch: "social", tier: 2, cost: 4000, effect: "+$2,000/blackmail", bonus: { money: 2000 }, requires: ["intimidation"] },
  { id: "diplomat", name: "Diplomat", description: "Forge alliances and broker peace.", icon: "🤝", branch: "social", tier: 3, cost: 10000, effect: "+30% alliance bonus", bonus: { xp: 50, money: 3000 }, requires: ["gang_leader"] },
  { id: "puppet_master", name: "Puppet Master", description: "Pull strings from the shadows.", icon: "🎭", branch: "social", tier: 3, cost: 12000, effect: "+5 ATK from manipulation, +$3,000", bonus: { attack: 5, money: 3000 }, requires: ["blackmailer"] },
  { id: "crime_king", name: "Crime King", description: "Everyone bows to you.", icon: "👑", branch: "social", tier: 4, cost: 30000, effect: "+15 ATK, +15 DEF, +$10,000/day", bonus: { attack: 15, defense: 15, money: 10000 }, requires: ["diplomat"] },

  // BUSINESS BRANCH
  { id: "street_vendor", name: "Street Vendor", description: "Sell goods on the corner.", icon: "🏪", branch: "business", tier: 1, cost: 500, effect: "+$200/day passive", bonus: { money: 200 } },
  { id: "hustler", name: "Hustler", description: "Multiple income streams.", icon: "💼", branch: "business", tier: 1, cost: 600, effect: "+$300/day passive", bonus: { money: 300 } },
  { id: "real_estate_pro", name: "Real Estate Pro", description: "Property investments yield more.", icon: "🏠", branch: "business", tier: 2, cost: 3000, effect: "+40% property income", bonus: { money: 1500 }, requires: ["street_vendor"] },
  { id: "investor", name: "Investor", description: "Smart investments, bigger returns.", icon: "📈", branch: "business", tier: 2, cost: 3500, effect: "+30% stock returns", bonus: { money: 1200 }, requires: ["hustler"] },
  { id: "tycoon", name: "Tycoon", description: "Business magnate of the underworld.", icon: "🏦", branch: "business", tier: 3, cost: 12000, effect: "+$5,000/day, +50% business income", bonus: { money: 5000 }, requires: ["real_estate_pro"] },
  { id: "market_manipulator", name: "Market Manipulator", description: "Rig the stock market in your favor.", icon: "📊", branch: "business", tier: 3, cost: 10000, effect: "+60% stock returns, -10% crash risk", bonus: { money: 4000 }, requires: ["investor"] },
  { id: "empire_builder", name: "Empire Builder", description: "Build a criminal empire of businesses.", icon: "🏰", branch: "business", tier: 4, cost: 30000, effect: "+$15,000/day passive income", bonus: { money: 15000 }, requires: ["tycoon"] },
];

const branchColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  combat: { bg: "bg-red-950/30", text: "text-red-400", border: "border-red-800/50", icon: "⚔️" },
  criminal: { bg: "bg-purple-950/30", text: "text-purple-400", border: "border-purple-800/50", icon: "🦹" },
  social: { bg: "bg-blue-950/30", text: "text-blue-400", border: "border-blue-800/50", icon: "👥" },
  business: { bg: "bg-green-950/30", text: "text-green-400", border: "border-green-800/50", icon: "💰" },
};

export function SkillTreePage() {
  const player = useQuery(api.game.getPlayer);
  const [activeBranch, setActiveBranch] = useState<string>("combat");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [learnedSkills] = useState<Set<string>>(new Set()); // Would come from backend

  const branch = branchColors[activeBranch];
  const branchSkills = skillTree.filter(s => s.branch === activeBranch);
  const tiers = [1, 2, 3, 4];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="size-7 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Skill Tree</h2>
          <p className="text-sm text-muted-foreground">Unlock powerful abilities across 4 branches.</p>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(branchColors).map(([key, bc]) => (
          <button key={key} onClick={() => { setActiveBranch(key); setSelectedSkill(null); }}
            className={`p-3 rounded-xl text-center transition-all border ${activeBranch === key ? `${bc.bg} ${bc.border}` : "bg-background/50 border-border hover:border-border/80"}`}>
            <div className="text-2xl mb-1">{bc.icon}</div>
            <div className={`text-xs font-bold capitalize ${activeBranch === key ? bc.text : "text-muted-foreground"}`}>{key}</div>
          </button>
        ))}
      </div>

      {/* Skill Grid */}
      <div className={`rounded-xl border p-4 ${branch.border} ${branch.bg}`}>
        <div className="space-y-4">
          {tiers.map(tier => {
            const tierSkills = branchSkills.filter(s => s.tier === tier);
            return (
              <div key={tier}>
                <div className={`text-[10px] uppercase tracking-wider font-bold ${branch.text} mb-2`}>Tier {tier}</div>
                <div className="grid grid-cols-2 gap-2">
                  {tierSkills.map(skill => {
                    const canLearn = (player?.money ?? 0) >= skill.cost && !learnedSkills.has(skill.id);
                    return (
                      <motion.button key={skill.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                        className={`p-3 rounded-lg text-left border transition-all ${selectedSkill === skill.id ? `${branch.border} ring-2 ring-primary/30` : "border-border/30 hover:border-border/60"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{skill.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">{skill.name}</div>
                            <div className="text-[10px] text-muted-foreground">{skill.effect}</div>
                          </div>
                        </div>
                        {learnedSkills.has(skill.id) ? (
                          <div className="mt-1 text-[10px] text-green-400">✅ Learned</div>
                        ) : (
                          <div className="mt-1 text-[10px] text-yellow-400">${skill.cost.toLocaleString()}</div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Detail */}
      <AnimatePresence>
        {selectedSkill && (() => {
          const skill = skillTree.find(s => s.id === selectedSkill);
          if (!skill) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className={`rounded-xl p-5 border ${branch.border} ${branch.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{skill.icon}</span>
                <div>
                  <div className="font-bold text-lg">{skill.name}</div>
                  <div className="text-sm text-muted-foreground">{skill.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {skill.bonus.attack && <span className="text-xs bg-red-950/50 text-red-400 px-2 py-1 rounded">⚔️ +{skill.bonus.attack} ATK</span>}
                {skill.bonus.defense && <span className="text-xs bg-blue-950/50 text-blue-400 px-2 py-1 rounded">🛡️ +{skill.bonus.defense} DEF</span>}
                {skill.bonus.money && <span className="text-xs bg-green-950/50 text-green-400 px-2 py-1 rounded">💰 +${skill.bonus.money.toLocaleString()}</span>}
                {skill.bonus.xp && <span className="text-xs bg-purple-950/50 text-purple-400 px-2 py-1 rounded">⭐ +{skill.bonus.xp} XP</span>}
                {skill.bonus.crimeSuccess && <span className="text-xs bg-orange-950/50 text-orange-400 px-2 py-1 rounded">🔓 +{skill.bonus.crimeSuccess}% Crime</span>}
              </div>
              {skill.requires && skill.requires.length > 0 && (
                <div className="text-[10px] text-muted-foreground mb-2">Requires: {skill.requires.map(r => skillTree.find(s => s.id === r)?.name).join(", ")}</div>
              )}
              <button disabled={learnedSkills.has(skill.id) || (player?.money ?? 0) < skill.cost}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${learnedSkills.has(skill.id) ? "bg-green-900/30 text-green-400" : (player?.money ?? 0) >= skill.cost ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                {learnedSkills.has(skill.id) ? "✅ Learned" : `Learn for $${skill.cost.toLocaleString()}`}
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ====================================================================
// ⏰ DAILY CHALLENGES
// ====================================================================

interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "crime" | "fight" | "gamble" | "social" | "explore";
  target: number;
  reward: { money: number; xp: number; item?: string };
  difficulty: "easy" | "medium" | "hard" | "extreme";
}

const dailyChallenges: DailyChallenge[] = [
  { id: "dc_crime_5", name: "Small Time Crook", description: "Commit 5 crimes today", icon: "🔓", type: "crime", target: 5, reward: { money: 2000, xp: 50 }, difficulty: "easy" },
  { id: "dc_crime_20", name: "Crime Spree", description: "Commit 20 crimes today", icon: "🔥", type: "crime", target: 20, reward: { money: 8000, xp: 200 }, difficulty: "medium" },
  { id: "dc_crime_50", name: "Crime Lord", description: "Commit 50 crimes today", icon: "👑", type: "crime", target: 50, reward: { money: 25000, xp: 500, item: "Shadow Mask" }, difficulty: "hard" },
  { id: "dc_fight_3", name: "Brawler", description: "Win 3 PvP fights today", icon: "👊", type: "fight", target: 3, reward: { money: 3000, xp: 75 }, difficulty: "easy" },
  { id: "dc_fight_10", name: "Arena Champion", description: "Win 10 PvP fights today", icon: "🏆", type: "fight", target: 10, reward: { money: 12000, xp: 300, item: "Champion Belt" }, difficulty: "hard" },
  { id: "dc_gamble_win5", name: "Lucky Streak", description: "Win 5 gambling games today", icon: "🎰", type: "gamble", target: 5, reward: { money: 5000, xp: 100 }, difficulty: "medium" },
  { id: "dc_gamble_win20", name: "High Roller", description: "Win 20 gambling games today", icon: "🃏", type: "gamble", target: 20, reward: { money: 20000, xp: 400, item: "Lucky Charm" }, difficulty: "hard" },
  { id: "dc_social_3", name: "People Person", description: "Send 3 gifts to other players", icon: "🎁", type: "social", target: 3, reward: { money: 4000, xp: 80 }, difficulty: "easy" },
  { id: "dc_explore_5", name: "Explorer", description: "Visit 5 different locations", icon: "🗺️", type: "explore", target: 5, reward: { money: 3000, xp: 100 }, difficulty: "easy" },
  { id: "dc_boss_1", name: "Boss Slayer", description: "Defeat 1 legendary boss", icon: "⚔️", type: "fight", target: 1, reward: { money: 15000, xp: 500, item: "Boss Trophy" }, difficulty: "extreme" },
  { id: "dc_no_arrest", name: "Clean Record", description: "Commit 15 crimes without getting arrested", icon: "✨", type: "crime", target: 15, reward: { money: 10000, xp: 250, item: "Ghost Title" }, difficulty: "hard" },
  { id: "dc_earn_50k", name: "Money Maker", description: "Earn $50,000 in a single day", icon: "💰", type: "explore", target: 50000, reward: { money: 10000, xp: 300, item: "Golden Briefcase" }, difficulty: "extreme" },
];

const difficultyColors: Record<string, string> = {
  easy: "text-green-400 bg-green-950/50 border-green-800/50",
  medium: "text-yellow-400 bg-yellow-950/50 border-yellow-800/50",
  hard: "text-orange-400 bg-orange-950/50 border-orange-800/50",
  extreme: "text-red-400 bg-red-950/50 border-red-800/50",
};

const typeIcons: Record<string, string> = { crime: "🔓", fight: "⚔️", gamble: "🎰", social: "🎁", explore: "🗺️" };

export function DailyChallengesPage() {
  const player = useQuery(api.game.getPlayer);
  const [completedIds] = useState<Set<string>>(new Set());
  const [progress] = useState<Record<string, number>>({});

  const now = new Date();
  const hoursLeft = 24 - now.getHours();
  const minutesLeft = 59 - now.getMinutes();

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timer className="size-7 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold">Daily Challenges</h2>
            <p className="text-sm text-muted-foreground">Complete challenges for bonus rewards!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border">
          <Clock className="size-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{hoursLeft}h {minutesLeft}m</span>
          <RefreshCw className="size-3 text-muted-foreground" />
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-400">{completedIds.size}</div>
          <div className="text-[10px] text-muted-foreground">Completed</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">{dailyChallenges.length - completedIds.size}</div>
          <div className="text-[10px] text-muted-foreground">Remaining</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary">{Math.round((completedIds.size / dailyChallenges.length) * 100)}%</div>
          <div className="text-[10px] text-muted-foreground">Progress</div>
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-2">
        {dailyChallenges.map(ch => {
          const currentProgress = progress[ch.id] ?? 0;
          const isComplete = completedIds.has(ch.id);
          const pct = Math.min(100, Math.round((currentProgress / ch.target) * 100));

          return (
            <motion.div key={ch.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className={`rounded-xl p-4 border transition-all ${isComplete ? "bg-green-950/20 border-green-800/30" : "bg-card border-border hover:border-border/80"}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{ch.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{ch.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${difficultyColors[ch.difficulty]}`}>{ch.difficulty}</span>
                    <span className="text-[10px] text-muted-foreground">{typeIcons[ch.type]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-background/60 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{currentProgress}/{ch.target}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-green-400">+${ch.reward.money.toLocaleString()}</div>
                  <div className="text-[10px] text-blue-400">+{ch.reward.xp} XP</div>
                  {ch.reward.item && <div className="text-[10px] text-purple-400">🎁 {ch.reward.item}</div>}
                </div>
                {isComplete && <CheckCircle className="size-5 text-green-400 shrink-0" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// 🏟️ UNDERGROUND COLOSSEUM
// ====================================================================

interface ColosseumFighter {
  id: string;
  name: string;
  icon: string;
  level: number;
  attack: number;
  defense: number;
  hp: number;
  style: string;
  reward: number;
}

const colosseumFighters: ColosseumFighter[] = [
  { id: "c_fighter_1", name: "Iron Mike", icon: "🥊", level: 5, attack: 15, defense: 10, hp: 120, style: "Boxing", reward: 3000 },
  { id: "c_fighter_2", name: "Shadow Fang", icon: "🥷", level: 10, attack: 22, defense: 15, hp: 180, style: "Ninjutsu", reward: 6000 },
  { id: "c_fighter_3", name: "The Crusher", icon: "🦾", level: 15, attack: 30, defense: 20, hp: 250, style: "Wrestling", reward: 10000 },
  { id: "c_fighter_4", name: "Dragon Fist", icon: "🐉", level: 20, attack: 38, defense: 25, hp: 320, style: "Kung Fu", reward: 18000 },
  { id: "c_fighter_5", name: "Death Touch", icon: "☠️", level: 25, attack: 45, defense: 30, hp: 400, style: "Muay Thai", reward: 30000 },
  { id: "c_fighter_6", name: "The Legend", icon: "⭐", level: 35, attack: 60, defense: 40, hp: 550, style: "Mixed", reward: 50000 },
];

export function ColosseumPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);
  const [fightLog, setFightLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [inCombat, setInCombat] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [streak, setStreak] = useState(0);

  const fighter = colosseumFighters.find(f => f.id === selectedFighter);

  const startFight = (fid: string) => {
    const f = colosseumFighters.find(x => x.id === fid);
    if (!f || !player) return;
    setSelectedFighter(fid);
    setPlayerHp(player.maxLife ?? 100);
    setEnemyHp(f.hp);
    setFightLog([`🏟️ ${f.name} enters the arena!`]);
    setInCombat(true);
    setResult(null);
  };

  const attack = () => {
    if (!fighter || !inCombat || result) return;
    const pDmg = Math.max(1, (player?.attack ?? 10) + Math.floor(Math.random() * 15) - Math.floor(fighter.defense * 0.2));
    const eDmg = Math.max(1, fighter.attack + Math.floor(Math.random() * 10) - Math.floor((player?.defense ?? 10) * 0.3));
    const nEhp = Math.max(0, enemyHp - pDmg);
    const nPhp = Math.max(0, playerHp - eDmg);
    setEnemyHp(nEhp);
    setPlayerHp(nPhp);
    setFightLog(prev => [...prev, `You deal ${pDmg} damage!`, `${fighter.name} hits for ${eDmg}!`]);
    if (nEhp <= 0) {
      setResult("win");
      setStreak(s => s + 1);
      setFightLog(prev => [...prev, `🎉 ${fighter.name} is defeated!`]);
    } else if (nPhp <= 0) {
      setResult("lose");
      setStreak(0);
      setFightLog(prev => [...prev, `💀 You have been knocked out!`]);
    }
  };

  if (fighter && inCombat) {
    return (
      <div className="animate-fade-in space-y-6">
        <button onClick={() => { setSelectedFighter(null); setInCombat(false); }}
          className="text-sm text-muted-foreground hover:text-foreground">← Back to Arena</button>

        {/* Arena Banner */}
        <div className="text-center py-4">
          <div className="text-5xl mb-2">🏟️</div>
          <h2 className="text-xl font-bold">UNDERGROUND COLOSSEUM</h2>
          <div className="text-xs text-yellow-400 mt-1">🔥 Win Streak: {streak}</div>
        </div>

        {/* Health Bars */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">👤</div>
            <div className="text-xs font-bold mb-1">You</div>
            <div className="h-3 rounded-full bg-background/60 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                style={{ width: `${(playerHp / (player?.maxLife ?? 100)) * 100}%` }} />
            </div>
            <div className="text-sm font-bold mt-1">{playerHp}/{player?.maxLife ?? 100}</div>
          </div>
          <div className="mafia-card rounded-xl p-4 text-center border-red-900/30">
            <div className="text-2xl mb-1">{fighter.icon}</div>
            <div className="text-xs font-bold mb-1">{fighter.name}</div>
            <div className="h-3 rounded-full bg-background/60 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all"
                style={{ width: `${(enemyHp / fighter.hp) * 100}%` }} />
            </div>
            <div className="text-sm font-bold mt-1">{enemyHp}/{fighter.hp}</div>
          </div>
        </div>

        {!result && (
          <button onClick={attack}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg rounded-xl hover:from-red-500 hover:to-orange-400 transition-all shadow-lg shadow-red-900/20">
            ⚔️ FIGHT!
          </button>
        )}

        {result && (
          <div className={`p-5 rounded-xl text-center border ${result === "win" ? "bg-green-950/30 border-green-800/50" : "bg-red-950/30 border-red-800/50"}`}>
            <div className={`text-3xl font-bold ${result === "win" ? "text-green-400" : "text-red-400"}`}>
              {result === "win" ? "🏆 VICTORY!" : "💀 DEFEATED"}
            </div>
            {result === "win" && <div className="mt-2 text-green-400">💰 +${fighter.reward.toLocaleString()}</div>}
          </div>
        )}

        {/* Battle Log */}
        <div className="mafia-card rounded-xl p-4">
          <h3 className="text-xs font-bold mb-2">Battle Log</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {fightLog.map((log, i) => <div key={i} className="text-xs text-muted-foreground">{log}</div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏟️</span>
          <div>
            <h2 className="text-2xl font-bold">Underground Colosseum</h2>
            <p className="text-sm text-muted-foreground">Fight opponents in the underground arena. Win streak = bonus rewards!</p>
          </div>
        </div>
        <div className="bg-yellow-950/50 border border-yellow-800/50 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-bold text-yellow-400">🔥 Streak: {streak}</span>
        </div>
      </div>

      <div className="space-y-3">
        {colosseumFighters.map(f => {
          const canFight = (player?.level ?? 0) >= f.level;
          return (
            <motion.div key={f.id} whileHover={canFight ? { scale: 1.01 } : {}}
              className={`mafia-card rounded-xl p-4 border transition-all ${canFight ? "hover:border-red-500/30 cursor-pointer" : "opacity-50"}`}
              onClick={() => canFight && startFight(f.id)}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{f.icon}</div>
                <div className="flex-1">
                  <div className="font-bold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">Lv.{f.level} • {f.style}</div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-red-400">ATK {f.attack}</span>
                    <span className="text-[10px] text-blue-400">DEF {f.defense}</span>
                    <span className="text-[10px] text-green-400">HP {f.hp}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">${f.reward.toLocaleString()}</div>
                  {!canFight && <div className="text-[10px] text-red-400">Lv.{f.level} required</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// 🏠 SAFE HOUSES
// ====================================================================

interface SafeHouse {
  id: string;
  name: string;
  location: string;
  icon: string;
  price: number;
  dailyIncome: number;
  defenseBonus: number;
  hiddenBonus: number;
  tier: "shack" | "apartment" | "penthouse" | "mansion" | "fortress";
}

const safeHouses: SafeHouse[] = [
  { id: "sh_1", name: "Abandoned Shack", location: "Industrial District", icon: "🏚️", price: 5000, dailyIncome: 100, defenseBonus: 2, hiddenBonus: 5, tier: "shack" },
  { id: "sh_2", name: "Basement Hideout", location: "Underground", icon: "🕳️", price: 15000, dailyIncome: 300, defenseBonus: 5, hiddenBonus: 10, tier: "shack" },
  { id: "sh_3", name: "Downtown Apartment", location: "Midtown", icon: "🏢", price: 50000, dailyIncome: 800, defenseBonus: 8, hiddenBonus: 15, tier: "apartment" },
  { id: "sh_4", name: "Warehouse Loft", location: "Dockside", icon: "🏭", price: 80000, dailyIncome: 1200, defenseBonus: 12, hiddenBonus: 20, tier: "apartment" },
  { id: "sh_5", name: "Rooftop Penthouse", location: "Financial District", icon: "🌆", price: 200000, dailyIncome: 3000, defenseBonus: 15, hiddenBonus: 25, tier: "penthouse" },
  { id: "sh_6", name: "Vegas Penthouse Suite", location: "Las Vegas Strip", icon: "🎰", price: 500000, dailyIncome: 8000, defenseBonus: 20, hiddenBonus: 30, tier: "penthouse" },
  { id: "sh_7", name: "Country Mansion", location: "Upstate", icon: "🏰", price: 1000000, dailyIncome: 15000, defenseBonus: 30, hiddenBonus: 40, tier: "mansion" },
  { id: "sh_8", name: "Underground Bunker", location: "Deep Below City", icon: "🔫", price: 2500000, dailyIncome: 30000, defenseBonus: 50, hiddenBonus: 60, tier: "fortress" },
];

const tierBadgeColors: Record<string, string> = {
  shack: "text-gray-400 bg-gray-950/50",
  apartment: "text-green-400 bg-green-950/50",
  penthouse: "text-blue-400 bg-blue-950/50",
  mansion: "text-purple-400 bg-purple-950/50",
  fortress: "text-yellow-400 bg-yellow-950/50",
};

export function SafeHousesPage() {
  const player = useQuery(api.game.getPlayer);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏠</span>
        <div>
          <h2 className="text-2xl font-bold">Safe Houses</h2>
          <p className="text-sm text-muted-foreground">Properties that provide income, defense, and hiding spots.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-400">0</div>
          <div className="text-[10px] text-muted-foreground">Owned</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary">$0</div>
          <div className="text-[10px] text-muted-foreground">Daily Income</div>
        </div>
      </div>

      <div className="space-y-3">
        {safeHouses.map(sh => {
          const canBuy = (player?.money ?? 0) >= sh.price;
          return (
            <motion.div key={sh.id} whileHover={canBuy ? { scale: 1.01 } : {}}
              className={`mafia-card rounded-xl p-4 border transition-all ${canBuy ? "hover:border-primary/30 cursor-pointer" : "opacity-60"}`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{sh.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{sh.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${tierBadgeColors[sh.tier]}`}>{sh.tier}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">📍 {sh.location}</div>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[10px] text-green-400">💰 +${sh.dailyIncome.toLocaleString()}/day</span>
                    <span className="text-[10px] text-blue-400">🛡️ +{sh.defenseBonus} DEF</span>
                    <span className="text-[10px] text-purple-400">👁️ +{sh.hiddenBonus} Hidden</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">${sh.price.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// 🔥 CRIME SPREE
// ====================================================================

interface SpreeTier {
  name: string;
  icon: string;
  crimes: number;
  multiplier: number;
  color: string;
  bonusReward: number;
}

const spreeTiers: SpreeTier[] = [
  { name: "Petty Thief", icon: "🐀", crimes: 5, multiplier: 1.2, color: "text-gray-400", bonusReward: 500 },
  { name: "Professional", icon: "💼", crimes: 15, multiplier: 1.5, color: "text-green-400", bonusReward: 2000 },
  { name: "Notorious", icon: "🔥", crimes: 30, multiplier: 2.0, color: "text-yellow-400", bonusReward: 5000 },
  { name: "Infamous", icon: "💀", crimes: 50, multiplier: 2.5, color: "text-orange-400", bonusReward: 15000 },
  { name: "Legendary", icon: "👑", crimes: 100, multiplier: 3.0, color: "text-red-400", bonusReward: 50000 },
  { name: "Mythical", icon: "🌟", crimes: 200, multiplier: 5.0, color: "text-purple-400", bonusReward: 200000 },
];

export function CrimeSpreePage() {
  const player = useQuery(api.game.getPlayer);
  const [currentSpree] = useState(0);
  const [totalSpreeEarnings] = useState(0);

  const currentTier = [...spreeTiers].reverse().find(t => currentSpree >= t.crimes);
  const nextTier = spreeTiers.find(t => currentSpree < t.crimes);
  const progressPct = nextTier ? Math.round((currentSpree / nextTier.crimes) * 100) : 100;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="size-7 text-orange-400" />
        <div>
          <h2 className="text-2xl font-bold">Crime Spree</h2>
          <p className="text-sm text-muted-foreground">Chain crimes without stopping for massive multiplier bonuses!</p>
        </div>
      </div>

      {/* Current Spree */}
      <div className="mafia-card rounded-xl p-6 border border-orange-900/30 bg-gradient-to-br from-orange-950/20 to-red-950/20">
        <div className="text-center">
          <div className="text-6xl font-bold text-orange-400">{currentSpree}</div>
          <div className="text-sm text-muted-foreground mt-1">Current Spree</div>
          {currentTier && (
            <div className={`mt-2 text-lg font-bold ${currentTier.color}`}>
              {currentTier.icon} {currentTier.name}
            </div>
          )}
          <div className="text-sm text-green-400 mt-1">Total earned: ${totalSpreeEarnings.toLocaleString()}</div>
        </div>

        {nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{currentTier?.name ?? "None"}</span>
              <span>{nextTier.name}</span>
            </div>
            <div className="h-3 rounded-full bg-background/60 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-400 transition-all"
                style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-center text-xs text-muted-foreground mt-1">
              {nextTier.crimes - currentSpree} crimes to next tier
            </div>
          </div>
        )}
      </div>

      {/* Spree Tiers */}
      <div className="space-y-2">
        {spreeTiers.map((tier, i) => {
          const isActive = currentTier?.name === tier.name;
          const isPast = currentSpree >= tier.crimes;
          return (
            <div key={tier.name} className={`rounded-xl p-3 border transition-all ${isPast ? "bg-green-950/20 border-green-800/30" : isActive ? "bg-orange-950/20 border-orange-800/30" : "bg-background/30 border-border/30 opacity-60"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tier.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isPast ? "text-green-400" : isActive ? tier.color : "text-muted-foreground"}`}>{tier.name}</span>
                    {isPast && <span className="text-[10px] text-green-400">✅</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{tier.crimes} crimes • {tier.multiplier}x multiplier</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-yellow-400">${tier.bonusReward.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">bonus</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// 📋 WANTED BOARD
// ====================================================================

interface WantedCriminal {
  id: string;
  nickname: string;
  level: number;
  bounty: number;
  crimes: number;
  lastSeen: string;
  threat: "low" | "medium" | "high" | "extreme";
}

export function WantedBoardPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedTab, setSelectedTab] = useState<"board" | "my_bounty">("board");

  const criminals: WantedCriminal[] = [
    { id: "wc1", nickname: "Shadow Reaper", level: 35, bounty: 500000, crimes: 847, lastSeen: "New York", threat: "extreme" },
    { id: "wc2", nickname: "The Ghost", level: 28, bounty: 250000, crimes: 523, lastSeen: "Chicago", threat: "high" },
    { id: "wc3", nickname: "Iron Fang", level: 22, bounty: 120000, crimes: 312, lastSeen: "Las Vegas", threat: "high" },
    { id: "wc4", nickname: "Black Widow", level: 19, bounty: 80000, crimes: 198, lastSeen: "Miami", threat: "medium" },
    { id: "wc5", nickname: "Viper", level: 15, bounty: 45000, crimes: 156, lastSeen: "Los Angeles", threat: "medium" },
    { id: "wc6", nickname: "Rat King", level: 10, bounty: 20000, crimes: 89, lastSeen: "Detroit", threat: "low" },
  ];

  const threatColors: Record<string, string> = {
    low: "text-green-400 bg-green-950/50 border-green-800/50",
    medium: "text-yellow-400 bg-yellow-950/50 border-yellow-800/50",
    high: "text-orange-400 bg-orange-950/50 border-orange-800/50",
    extreme: "text-red-400 bg-red-950/50 border-red-800/50",
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📋</span>
        <div>
          <h2 className="text-2xl font-bold">Wanted Board</h2>
          <p className="text-sm text-muted-foreground">Active bounties and most wanted criminals.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSelectedTab("board")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === "board" ? "bg-red-600 text-white" : "bg-background/50 text-muted-foreground"}`}>
          🔴 Most Wanted
        </button>
        <button onClick={() => setSelectedTab("my_bounty")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTab === "my_bounty" ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}>
          👤 My Bounty Status
        </button>
      </div>

      {selectedTab === "board" && (
        <div className="space-y-2">
          {criminals.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="mafia-card rounded-xl p-4 border hover:border-red-900/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? "bg-red-950/50 text-red-400" : i === 1 ? "bg-orange-950/50 text-orange-400" : i === 2 ? "bg-yellow-950/50 text-yellow-400" : "bg-background/50 text-muted-foreground"}`}>
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{c.nickname}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${threatColors[c.threat]}`}>
                      {c.threat.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Lv.{c.level} • {c.crimes} crimes • Last seen: {c.lastSeen}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-400">${c.bounty.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Bounty</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTab === "my_bounty" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-6 text-center border border-yellow-900/30">
            <div className="text-4xl mb-2">{(player?.wantedLevel ?? 0) > 0 ? "🔴" : "🟢"}</div>
            <div className="text-lg font-bold">{(player?.wantedLevel ?? 0) > 0 ? `WANTED - Level ${player?.wantedLevel}` : "Clean Record"}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {(player?.wantedLevel ?? 0) > 0
                ? `Police are actively searching for you. Avoid crimes or serve your sentence.`
                : `No active bounties. Keep a low profile.`}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <div className="text-lg font-bold text-yellow-400">{(player?.totalCrimes ?? 0)}</div>
                <div className="text-[10px] text-muted-foreground">Crimes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{(player?.totalArrests ?? 0)}</div>
                <div className="text-[10px] text-muted-foreground">Arrests</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{(player?.totalPrisonEscapes ?? 0)}</div>
                <div className="text-[10px] text-muted-foreground">Escapes</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================================
// 🗺️ SMUGGLING ROUTES
// ====================================================================

interface SmugglingRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  icon: string;
  profit: number;
  risk: number;
  time: number; // minutes
  levelRequired: number;
  cargoType: string;
}

const smugglingRoutes: SmugglingRoute[] = [
  { id: "sr1", name: "The Coastal Run", from: "Miami", to: "New York", icon: "🚢", profit: 5000, risk: 20, time: 30, levelRequired: 5, cargoType: "Electronics" },
  { id: "sr2", name: "Desert Highway", from: "Las Vegas", to: "Los Angeles", icon: "🚗", profit: 8000, risk: 30, time: 45, levelRequired: 10, cargoType: "Luxury Goods" },
  { id: "sr3", name: "The Underground Railroad", from: "Chicago", to: "Detroit", icon: "🚂", profit: 6000, risk: 25, time: 35, levelRequired: 8, cargoType: "Firearms" },
  { id: "sr4", name: "Northern Pipeline", from: "Boston", to: "Philadelphia", icon: "✈️", profit: 12000, risk: 40, time: 60, levelRequired: 15, cargoType: "Contraband" },
  { id: "sr5", name: "Southern Express", from: "Atlanta", to: "Miami", icon: "🚛", profit: 10000, risk: 35, time: 50, levelRequired: 12, cargoType: "Narcotics" },
  { id: "sr6", name: "Cross-Country", from: "Los Angeles", to: "New York", icon: "🛩️", profit: 50000, risk: 60, time: 120, levelRequired: 25, cargoType: "Mixed" },
  { id: "sr7", name: "The Ghost Route", from: "Dallas", to: "Chicago", icon: "👻", profit: 30000, risk: 50, time: 90, levelRequired: 20, cargoType: "Weapons" },
];

export function SmugglingRoutesPage() {
  const player = useQuery(api.game.getPlayer);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [smuggling, setSmuggling] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="size-7 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Smuggling Routes</h2>
          <p className="text-sm text-muted-foreground">Transport goods between cities. Higher risk = bigger profit.</p>
        </div>
      </div>

      <div className="space-y-3">
        {smugglingRoutes.map(route => {
          const canRun = (player?.level ?? 0) >= route.levelRequired;
          const isActive = activeRoute === route.id;
          return (
            <motion.div key={route.id} whileHover={canRun ? { scale: 1.01 } : {}}
              className={`mafia-card rounded-xl p-4 border transition-all ${isActive ? "border-primary/50 ring-1 ring-primary/20" : canRun ? "hover:border-primary/30 cursor-pointer" : "opacity-50"}`}
              onClick={() => canRun && setActiveRoute(isActive ? null : route.id)}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{route.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{route.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{route.from}</span>
                    <ChevronRight className="size-3" />
                    <span>{route.to}</span>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-green-400">💰 ${route.profit.toLocaleString()}</span>
                    <span className={`text-[10px] ${route.risk > 40 ? "text-red-400" : route.risk > 25 ? "text-orange-400" : "text-yellow-400"}`}>⚠️ {route.risk}% risk</span>
                    <span className="text-[10px] text-blue-400">⏱️ {route.time}min</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">📦 {route.cargoType}</div>
                  {!canRun && <div className="text-[10px] text-red-400">Lv.{route.levelRequired}</div>}
                </div>
              </div>
              {isActive && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="mt-4 pt-4 border-t border-border/30">
                  <button disabled={smuggling}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${smuggling ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
                    {smuggling ? "🚛 Smuggling in progress..." : `🚀 Start Smuggling ($${route.profit.toLocaleString()} potential)`}
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// 👥 CRIMINAL CARTEL
// ====================================================================

interface CartelMember {
  role: string;
  icon: string;
  description: string;
  bonus: string;
}

const cartelStructure: CartelMember[] = [
  { role: "El Jefe", icon: "👑", description: "The supreme leader. Controls all operations.", bonus: "+20% all income, +15 ATK/DEF" },
  { role: "Consigliere", icon: "🧠", description: "The advisor. Makes strategic decisions.", bonus: "+15% family bonus, +10 XP/mission" },
  { role: "Capo", icon: "🎩", description: "Division boss. Manages a crew of soldiers.", bonus: "+10% crew income, +8 ATK" },
  { role: "Enforcer", icon: "👊", description: "The muscle. Handles dirty work.", bonus: "+12 ATK, +5% intimidation" },
  { role: "Smuggler", icon: "🚛", description: "Moves goods across borders.", bonus: "+25% smuggling profit, -15% risk" },
  { role: "Fixer", icon: "🔧", description: "Makes problems disappear.", bonus: "-30% wanted level, -20% arrest chance" },
  { role: "Soldier", icon: "🗡️", description: "The backbone of the operation.", bonus: "+5 ATK, +5 DEF" },
  { role: "Associate", icon: "🤝", description: "New recruit. Prove your worth.", bonus: "+10% crime success" },
];

export function CartelPage() {
  const player = useQuery(api.game.getPlayer);
  const [activeTab, setActiveTab] = useState<"structure" | "operations" | "treasury">("structure");

  const operations = [
    { name: "Drug Pipeline", icon: "💊", status: "active", income: "$15,000/day", risk: "High" },
    { name: "Arms Smuggling", icon: "🔫", status: "active", income: "$22,000/day", risk: "Extreme" },
    { name: "Money Laundering", icon: "💰", status: "active", income: "$8,000/day", risk: "Medium" },
    { name: "Human Trafficking", icon: "📦", status: "planned", income: "$35,000/day", risk: "Extreme" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Users className="size-7 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Criminal Cartel</h2>
          <p className="text-sm text-muted-foreground">Build and manage your criminal organization.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["structure", "operations", "treasury"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "structure" && (
        <div className="space-y-2">
          {cartelStructure.map((member, i) => (
            <motion.div key={member.role} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`mafia-card rounded-xl p-4 border transition-all ${i === 0 ? "border-yellow-900/30 bg-gradient-to-r from-yellow-950/10 to-transparent" : ""}`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">{member.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{member.role}</div>
                  <div className="text-xs text-muted-foreground">{member.description}</div>
                  <div className="text-[10px] text-primary mt-1">✨ {member.bonus}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">Open</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "operations" && (
        <div className="space-y-3">
          {operations.map(op => (
            <div key={op.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{op.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm">{op.name}</div>
                  <div className="text-xs text-muted-foreground">{op.income} • {op.risk} risk</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${op.status === "active" ? "bg-green-950/50 text-green-400" : "bg-yellow-950/50 text-yellow-400"}`}>
                  {op.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "treasury" && (
        <div className="mafia-card rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-2xl font-bold text-primary">$0</div>
          <div className="text-sm text-muted-foreground">Cartel Treasury</div>
          <div className="text-xs text-muted-foreground mt-4">Pool money from operations and share with members.</div>
        </div>
      )}
    </div>
  );
}

// ====================================================================
// 👁️ UNDERWORLD REPUTATION
// ====================================================================

interface ReputationFaction {
  id: string;
  name: string;
  icon: string;
  description: string;
  repLevel: number;
  maxRep: number;
  perks: string[];
  color: string;
  bgColor: string;
}

const factions: ReputationFaction[] = [
  { id: "mafia", name: "The Commission", icon: "🎩", description: "The traditional Italian mafia families.", repLevel: 0, maxRep: 100, perks: ["Access to high-end weapons", "5% protection discount", "Family tribute bonus"], color: "text-red-400", bgColor: "bg-red-950/30 border-red-800/50" },
  { id: "yakuza", name: "The Yakuza", icon: "🐉", description: "Japanese crime syndicate. Honor and tradition.", repLevel: 0, maxRep: 100, perks: ["Samurai sword access", "Gambling bonus", "Stealth bonus"], color: "text-purple-400", bgColor: "bg-purple-950/30 border-purple-800/50" },
  { id: "cartel", name: "Sinaloa Cartel", icon: "💀", description: "Mexican drug cartel. Ruthless and powerful.", repLevel: 0, maxRep: 100, perks: ["Drug profit bonus", "Smuggling discount", "Enforcer hire"], color: "text-green-400", bgColor: "bg-green-950/30 border-green-800/50" },
  { id: "triad", name: "The Triads", icon: "🐉", description: "Chinese criminal organization. Ancient and secretive.", repLevel: 0, maxRep: 100, perks: ["Gambling master", "Black market access", "Counterfeit bonus"], color: "text-yellow-400", bgColor: "bg-yellow-950/30 border-yellow-800/50" },
  { id: "bikers", name: "The Outlaws", icon: "🏍️", description: "Outlaw motorcycle gang. Loyal and violent.", repLevel: 0, maxRep: 100, perks: ["Street racing bonus", "Biker bar access", "Intimidation bonus"], color: "text-orange-400", bgColor: "bg-orange-950/30 border-orange-800/50" },
  { id: "hackers", name: "The Collective", icon: "💻", description: "Elite hacker collective. Digital underworld.", repLevel: 0, maxRep: 100, perks: ["Identity theft bonus", "Security bypass", "Digital heist access"], color: "text-cyan-400", bgColor: "bg-cyan-950/30 border-cyan-800/50" },
];

export function ReputationPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="size-7 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Underworld Reputation</h2>
          <p className="text-sm text-muted-foreground">Build reputation with criminal factions to unlock exclusive perks.</p>
        </div>
      </div>

      <div className="space-y-3">
        {factions.map(f => {
          const pct = Math.round((f.repLevel / f.maxRep) * 100);
          const isSelected = selectedFaction === f.id;
          return (
            <motion.div key={f.id} layout
              className={`rounded-xl p-4 border cursor-pointer transition-all ${f.bgColor} ${isSelected ? "ring-2 ring-primary/30" : "hover:shadow-lg"}`}
              onClick={() => setSelectedFaction(isSelected ? null : f.id)}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{f.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className={f.color}>Rep: {f.repLevel}/{f.maxRep}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                      <div className={`h-full rounded-full transition-all`} style={{ width: `${pct}%`, background: `linear-gradient(to right, currentColor, currentColor)` }} />
                    </div>
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-border/30">
                    <div className="text-xs font-bold mb-2">Perks:</div>
                    {f.perks.map((perk, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="text-green-400">✓</span> {perk}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// 🔓 PRISON BREAK
// ====================================================================

interface PrisonBreakAttempt {
  method: string;
  icon: string;
  difficulty: string;
  successRate: number;
  timeReduction: string;
  cost: number;
}

const breakMethods: PrisonBreakAttempt[] = [
  { method: "Dig Tunnel", icon: "🕳️", difficulty: "Hard", successRate: 35, timeReduction: "100%", cost: 10000 },
  { method: "Bribe Guard", icon: "💰", difficulty: "Medium", successRate: 60, timeReduction: "50%", cost: 25000 },
  { method: "Create Distraction", icon: "🔥", difficulty: "Easy", successRate: 45, timeReduction: "25%", cost: 5000 },
  { method: "Sewer Escape", icon: "🐀", difficulty: "Hard", successRate: 30, timeReduction: "100%", cost: 15000 },
  { method: "Fake Parole", icon: "📄", difficulty: "Medium", successRate: 50, timeReduction: "75%", cost: 20000 },
  { method: "Helicopter Extraction", icon: "🚁", difficulty: "Extreme", successRate: 20, timeReduction: "100%", cost: 100000 },
];

export function PrisonBreakPage() {
  const player = useQuery(api.game.getPlayer);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const executeBreak = async (method: PrisonBreakAttempt) => {
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1000));
    const roll = Math.random() * 100;
    if (roll < method.successRate) {
      setResult({ success: true, message: `Successfully escaped via ${method.method}! Sentence reduced by ${method.timeReduction}.` });
    } else {
      setResult({ success: false, message: `${method.method} failed! You've been put in solitary confinement for 2 extra hours.` });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Lock className="size-7 text-red-400" />
        <div>
          <h2 className="text-2xl font-bold">Prison Break</h2>
          <p className="text-sm text-muted-foreground">Plan your escape. Each method has different risks and rewards.</p>
        </div>
      </div>

      {/* Prison Status */}
      <div className="mafia-card rounded-xl p-4 border border-red-900/30">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-red-400">🔒</div>
            <div className="text-xs text-muted-foreground">Security Level</div>
            <div className="text-sm font-bold">Medium</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">⏰</div>
            <div className="text-xs text-muted-foreground">Time Left</div>
            <div className="text-sm font-bold">4h 23m</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400">👥</div>
            <div className="text-xs text-muted-foreground">Guards</div>
            <div className="text-sm font-bold">12</div>
          </div>
        </div>
      </div>

      {/* Break Methods */}
      <div className="space-y-3">
        {breakMethods.map(method => (
          <motion.div key={method.method} whileHover={{ scale: 1.01 }}
            className="mafia-card rounded-xl p-4 border hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{method.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{method.method}</div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground">📊 {method.difficulty}</span>
                  <span className="text-[10px] text-green-400">✅ {method.successRate}% success</span>
                  <span className="text-[10px] text-blue-400">⏰ -{method.timeReduction} time</span>
                </div>
              </div>
              <button disabled={loading || (player?.money ?? 0) < method.cost}
                onClick={() => executeBreak(method)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  loading ? "bg-muted text-muted-foreground" : (player?.money ?? 0) >= method.cost
                    ? "bg-red-600 text-white hover:bg-red-700" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                ${method.cost.toLocaleString()}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${result.success ? "bg-green-950/30 border-green-800/50" : "bg-red-950/30 border-red-800/50"}`}>
          <div className={`font-bold ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "✅ Escape Successful!" : "❌ Escape Failed!"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{result.message}</div>
        </motion.div>
      )}
    </div>
  );
}

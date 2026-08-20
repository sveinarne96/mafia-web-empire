import { mutation } from "./_generated/server";

// ============================================================
// SHADOWEMPIRE — 5000+ MISSIONS SEED
// 8 Storyline Arcs + General Missions
// Mix of easy/hard with time limits
// ============================================================

type MissionData = {
  title: string;
  description: string;
  reward: number;
  pointsReward: number;
  levelRequired: number;
  type: string;
  location?: string;
  storyline?: string;
  storyOrder?: number;
  timeLimitMinutes?: number;
  difficulty: string;
  xpReward: number;
};

// ===== STORYLINE DEFINITIONS =====

const STORYLINES: Record<string, { emoji: string; name: string; intro: string; missions: Array<Omit<MissionData, "storyline" | "storyOrder">> }> = {

  // ===== 1. STORYLINE — MAIN STORY ARC =====
  storyline: {
    emoji: "🎭",
    name: "The Shadow Empire",
    intro: "Rise from nobody to the most feared crime lord in the city.",
    missions: [
      // Act 1: Origins (1-10)
      { title: "🎭 Chapter 1: First Steps", description: "Complete your first street crime.", reward: 500, pointsReward: 10, levelRequired: 1, type: "crime", difficulty: "easy", xpReward: 25, timeLimitMinutes: 30 },
      { title: "🎭 Chapter 2: Getting Your Hands Dirty", description: "Commit 5 street crimes.", reward: 1000, pointsReward: 20, levelRequired: 1, type: "crime", difficulty: "easy", xpReward: 50, timeLimitMinutes: 45 },
      { title: "🎭 Chapter 3: A Reputation Built", description: "Reach level 3.", reward: 2000, pointsReward: 30, levelRequired: 1, type: "progression", difficulty: "easy", xpReward: 75, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 4: The First Heist", description: "Complete your first heist planning mission.", reward: 5000, pointsReward: 50, levelRequired: 3, type: "heist", difficulty: "easy", xpReward: 100, timeLimitMinutes: 30 },
      { title: "🎭 Chapter 5: Arms Dealer", description: "Buy your first weapon from the Black Market.", reward: 3000, pointsReward: 40, levelRequired: 5, type: "underworld", difficulty: "easy", xpReward: 80, timeLimitMinutes: 15 },
      { title: "🎭 Chapter 6: Street Fighter", description: "Win 3 PvP fights.", reward: 4000, pointsReward: 45, levelRequired: 5, type: "combat", difficulty: "medium", xpReward: 90, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 7: Running with the Pack", description: "Join a crew or family.", reward: 5000, pointsReward: 50, levelRequired: 5, type: "social", difficulty: "easy", xpReward: 100, timeLimitMinutes: 30 },
      { title: "🎭 Chapter 8: The Bank Job", description: "Complete a bank robbery.", reward: 15000, pointsReward: 100, levelRequired: 8, type: "heist", difficulty: "medium", xpReward: 200, timeLimitMinutes: 45 },
      { title: "🎭 Chapter 9: Wanted Man", description: "Reach wanted level 3.", reward: 8000, pointsReward: 60, levelRequired: 8, type: "crime", difficulty: "medium", xpReward: 150, timeLimitMinutes: 30 },
      { title: "🎭 Chapter 10: The Commission", description: "Complete 50 total crimes.", reward: 25000, pointsReward: 150, levelRequired: 10, type: "crime", difficulty: "medium", xpReward: 300, timeLimitMinutes: 120 },
      // Act 2: Rise (11-20)
      { title: "🎭 Chapter 11: Building an Empire", description: "Buy your first safe house.", reward: 20000, pointsReward: 120, levelRequired: 10, type: "empire", difficulty: "medium", xpReward: 250, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 12: Territorial Dispute", description: "Claim a territory in Territory Control.", reward: 15000, pointsReward: 100, levelRequired: 12, type: "territory", difficulty: "medium", xpReward: 200, timeLimitMinutes: 45 },
      { title: "🎭 Chapter 13: The Smuggler's Route", description: "Complete 3 smuggling runs.", reward: 30000, pointsReward: 180, levelRequired: 12, type: "transport", difficulty: "medium", xpReward: 350, timeLimitMinutes: 90 },
      { title: "🎭 Chapter 14: Deep Cover", description: "Infiltrate a rival crew's operation.", reward: 25000, pointsReward: 150, levelRequired: 15, type: "espionage", difficulty: "hard", xpReward: 300, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 15: The Hit", description: "Successfully eliminate 5 targets.", reward: 50000, pointsReward: 250, levelRequired: 15, type: "combat", difficulty: "hard", xpReward: 500, timeLimitMinutes: 90 },
      { title: "🎭 Chapter 16: Casino Heist", description: "Pull off a casino heist.", reward: 100000, pointsReward: 400, levelRequired: 18, type: "heist", difficulty: "hard", xpReward: 600, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 17: Drug Kingpin", description: "Complete 20 drug operations.", reward: 75000, pointsReward: 350, levelRequired: 18, type: "crime", difficulty: "hard", xpReward: 500, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 18: The Underworld War", description: "Defeat 10 rivals in combat.", reward: 80000, pointsReward: 400, levelRequired: 20, type: "combat", difficulty: "hard", xpReward: 600, timeLimitMinutes: 90 },
      { title: "🎭 Chapter 19: Money Laundering", description: "Launder $500,000 through businesses.", reward: 60000, pointsReward: 300, levelRequired: 20, type: "business", difficulty: "hard", xpReward: 500, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 20: The Don's Mantle", description: "Reach level 25 and own 3 businesses.", reward: 150000, pointsReward: 600, levelRequired: 25, type: "progression", difficulty: "hard", xpReward: 800, timeLimitMinutes: 180 },
      // Act 3: Dominance (21-30)
      { title: "🎭 Chapter 21: Continental Operations", description: "Operate in 5 different cities simultaneously.", reward: 100000, pointsReward: 500, levelRequired: 25, type: "travel", difficulty: "hard", xpReward: 700, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 22: The Arsenal", description: "Own every weapon type.", reward: 80000, pointsReward: 400, levelRequired: 28, type: "underworld", difficulty: "hard", xpReward: 600, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 23: Betrayal", description: "Double-cross a rival crew leader.", reward: 120000, pointsReward: 600, levelRequired: 30, type: "espionage", difficulty: "hard", xpReward: 800, timeLimitMinutes: 45 },
      { title: "🎭 Chapter 24: The Syndicate", description: "Create a family with 10+ members.", reward: 200000, pointsReward: 800, levelRequired: 30, type: "social", difficulty: "hard", xpReward: 1000, timeLimitMinutes: 180 },
      { title: "🎭 Chapter 25: Full Scale War", description: "Win 50 PvP matches.", reward: 150000, pointsReward: 700, levelRequired: 35, type: "combat", difficulty: "legendary", xpReward: 900, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 26: The Vault", description: "Rob the federal reserve vault.", reward: 500000, pointsReward: 1500, levelRequired: 40, type: "heist", difficulty: "legendary", xpReward: 2000, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 27: Global Domination", description: "Own territory in every city.", reward: 300000, pointsReward: 1000, levelRequired: 40, type: "territory", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 180 },
      { title: "🎭 Chapter 28: The Shadow Council", description: "Reach the Shadow Council rank.", reward: 400000, pointsReward: 1200, levelRequired: 45, type: "progression", difficulty: "legendary", xpReward: 1800, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 29: Empire Eternal", description: "Accumulate $10 million in total earnings.", reward: 500000, pointsReward: 1500, levelRequired: 50, type: "progression", difficulty: "legendary", xpReward: 2000, timeLimitMinutes: 180 },
      { title: "🎭 Chapter 30: The Shadow Emperor", description: "Complete all previous chapters. You are the empire.", reward: 1000000, pointsReward: 5000, levelRequired: 50, type: "legendary", difficulty: "legendary", xpReward: 5000, timeLimitMinutes: 60 },
      // Act 4: Legacy (31-40)
      { title: "🎭 Chapter 31: Old Friends", description: "Recruit 5 former rivals to your cause.", reward: 200000, pointsReward: 800, levelRequired: 35, type: "social", difficulty: "hard", xpReward: 1000, timeLimitMinutes: 90 },
      { title: "🎭 Chapter 32: Counter Intelligence", description: "Discover and remove 5 bugs planted by rivals.", reward: 150000, pointsReward: 700, levelRequired: 30, type: "espionage", difficulty: "hard", xpReward: 800, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 33: The Vault of Shadows", description: "Open the legendary vault with 3 crew members.", reward: 750000, pointsReward: 2000, levelRequired: 45, type: "heist", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 45 },
      { title: "🎭 Chapter 34: Neural Network", description: "Hack into 10 corporate servers.", reward: 300000, pointsReward: 1000, levelRequired: 35, type: "cyber", difficulty: "hard", xpReward: 1200, timeLimitMinutes: 90 },
      { title: "🎭 Chapter 35: The Ghost Protocol", description: "Complete 20 missions without being detected.", reward: 250000, pointsReward: 900, levelRequired: 30, type: "stealth", difficulty: "hard", xpReward: 1100, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 36: Art of War", description: "Win 100 PvP matches total.", reward: 350000, pointsReward: 1100, levelRequired: 40, type: "combat", difficulty: "legendary", xpReward: 1400, timeLimitMinutes: 90 },
      { title: "🎭 Chapter 37: Underground Railroad", description: "Smuggle 50 contraband items.", reward: 280000, pointsReward: 950, levelRequired: 35, type: "transport", difficulty: "hard", xpReward: 1100, timeLimitMinutes: 120 },
      { title: "🎭 Chapter 38: The Casino Crown", description: "Win $1 million in casino games.", reward: 400000, pointsReward: 1200, levelRequired: 40, type: "gambling", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 60 },
      { title: "🎭 Chapter 39: Final Stand", description: "Defeat the Shadow Council in a boss fight.", reward: 800000, pointsReward: 3000, levelRequired: 50, type: "combat", difficulty: "legendary", xpReward: 4000, timeLimitMinutes: 30 },
      { title: "🎭 Chapter 40: Legend", description: "You've become a living legend of the underworld.", reward: 2000000, pointsReward: 10000, levelRequired: 50, type: "legendary", difficulty: "legendary", xpReward: 10000, timeLimitMinutes: 30 },
    ],
  },

  // ===== 2. LOVE STORY — CRIMINAL ROMANCE =====
  love_story: {
    emoji: "💕",
    name: "Criminal Hearts",
    intro: "A tale of two outlaws who found love in the underworld.",
    missions: [
      { title: "💕 Chapter 1: The Meet-Cute", description: "Complete a mission in the same city as another player.", reward: 1000, pointsReward: 15, levelRequired: 3, type: "social", difficulty: "easy", xpReward: 30, timeLimitMinutes: 30 },
      { title: "💕 Chapter 2: Flowers & Ammo", description: "Send a gift to another player.", reward: 2000, pointsReward: 20, levelRequired: 5, type: "social", difficulty: "easy", xpReward: 40, timeLimitMinutes: 15 },
      { title: "💕 Chapter 3: Partners in Crime", description: "Complete a crew mission with a partner.", reward: 5000, pointsReward: 40, levelRequired: 8, type: "social", difficulty: "easy", xpReward: 80, timeLimitMinutes: 45 },
      { title: "💕 Chapter 4: The Heist Date", description: "Complete a heist while having 10+ gifts sent.", reward: 10000, pointsReward: 60, levelRequired: 10, type: "heist", difficulty: "medium", xpReward: 120, timeLimitMinutes: 30 },
      { title: "💕 Chapter 5: Jealous Rival", description: "Defeat a player who tried to rob your partner.", reward: 15000, pointsReward: 80, levelRequired: 12, type: "combat", difficulty: "medium", xpReward: 160, timeLimitMinutes: 45 },
      { title: "💕 Chapter 6: Safe House Together", description: "Own a safe house with a crew member.", reward: 20000, pointsReward: 100, levelRequired: 15, type: "empire", difficulty: "medium", xpReward: 200, timeLimitMinutes: 60 },
      { title: "💕 Chapter 7: Romantic Getaway", description: "Travel to a luxury city together.", reward: 25000, pointsReward: 120, levelRequired: 15, type: "travel", difficulty: "medium", xpReward: 250, timeLimitMinutes: 30 },
      { title: "💕 Chapter 8: Ring of Gold", description: "Buy an expensive item worth $50,000+.", reward: 30000, pointsReward: 150, levelRequired: 18, type: "business", difficulty: "hard", xpReward: 300, timeLimitMinutes: 15 },
      { title: "💕 Chapter 9: War for Love", description: "Win 10 PvP fights in a row.", reward: 50000, pointsReward: 250, levelRequired: 20, type: "combat", difficulty: "hard", xpReward: 500, timeLimitMinutes: 90 },
      { title: "💕 Chapter 10: Forever After", description: "Reach level 30 and complete the love story.", reward: 100000, pointsReward: 500, levelRequired: 30, type: "social", difficulty: "hard", xpReward: 800, timeLimitMinutes: 120 },
      { title: "💕 Chapter 11: Anniversary Heist", description: "Complete 100 crimes together as a crew.", reward: 75000, pointsReward: 400, levelRequired: 25, type: "crime", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "💕 Chapter 12: Double Date", description: "Two crew pairs complete a heist simultaneously.", reward: 120000, pointsReward: 600, levelRequired: 30, type: "heist", difficulty: "hard", xpReward: 900, timeLimitMinutes: 60 },
      { title: "💕 Chapter 13: Vow of Silence", description: "Complete 5 stealth missions.", reward: 80000, pointsReward: 450, levelRequired: 28, type: "stealth", difficulty: "hard", xpReward: 700, timeLimitMinutes: 90 },
      { title: "💕 Chapter 14: Burning Passion", description: "Accumulate 1 million XP total.", reward: 200000, pointsReward: 800, levelRequired: 40, type: "progression", difficulty: "legendary", xpReward: 1200, timeLimitMinutes: 180 },
      { title: "💕 Chapter 15: Love Never Dies", description: "Complete all love story chapters.", reward: 500000, pointsReward: 2000, levelRequired: 40, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },

  // ===== 3. ARCTIC FREEZE =====
  arctic_freeze: {
    emoji: "❄️",
    name: "Arctic Freeze",
    intro: "A frozen underworld emerges. Only the cold-blooded survive.",
    missions: [
      { title: "❄️ Chapter 1: Cold Snap", description: "Survive your first arrest.", reward: 800, pointsReward: 10, levelRequired: 1, type: "crime", difficulty: "easy", xpReward: 20, timeLimitMinutes: 30 },
      { title: "❄️ Chapter 2: Ice Pick", description: "Complete 5 ice-themed crimes (burglaries in winter).", reward: 2000, pointsReward: 25, levelRequired: 3, type: "crime", difficulty: "easy", xpReward: 40, timeLimitMinutes: 45 },
      { title: "❄️ Chapter 3: Frozen Assets", description: "Deposit $10,000 in the bank.", reward: 3000, pointsReward: 30, levelRequired: 5, type: "business", difficulty: "easy", xpReward: 50, timeLimitMinutes: 15 },
      { title: "❄️ Chapter 4: Blizzard Heist", description: "Complete a heist during a storm event.", reward: 10000, pointsReward: 60, levelRequired: 8, type: "heist", difficulty: "medium", xpReward: 120, timeLimitMinutes: 45 },
      { title: "❄️ Chapter 5: Frostbite", description: "Defeat 10 enemies in combat.", reward: 8000, pointsReward: 50, levelRequired: 8, type: "combat", difficulty: "medium", xpReward: 100, timeLimitMinutes: 60 },
      { title: "❄️ Chapter 6: Snow Blind", description: "Complete 3 missions without taking damage.", reward: 12000, pointsReward: 70, levelRequired: 10, type: "stealth", difficulty: "medium", xpReward: 140, timeLimitMinutes: 45 },
      { title: "❄️ Chapter 7: Sub-Zero Smuggling", description: "Complete 10 smuggling runs.", reward: 25000, pointsReward: 120, levelRequired: 12, type: "transport", difficulty: "hard", xpReward: 250, timeLimitMinutes: 90 },
      { title: "❄️ Chapter 8: Cold War", description: "Win a territory war.", reward: 30000, pointsReward: 150, levelRequired: 15, type: "territory", difficulty: "hard", xpReward: 300, timeLimitMinutes: 60 },
      { title: "❄️ Chapter 9: Frozen Heart", description: "Eliminate 5 targets in one day.", reward: 50000, pointsReward: 250, levelRequired: 18, type: "combat", difficulty: "hard", xpReward: 500, timeLimitMinutes: 60 },
      { title: "❄️ Chapter 10: Ice Palace", description: "Own 3 safe houses.", reward: 40000, pointsReward: 200, levelRequired: 20, type: "empire", difficulty: "hard", xpReward: 400, timeLimitMinutes: 90 },
      { title: "❄️ Chapter 11: Avalanche", description: "Complete 50 crimes total.", reward: 60000, pointsReward: 300, levelRequired: 22, type: "crime", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "❄️ Chapter 12: Polar Vortex", description: "Win 20 PvP fights.", reward: 80000, pointsReward: 400, levelRequired: 25, type: "combat", difficulty: "legendary", xpReward: 800, timeLimitMinutes: 90 },
      { title: "❄️ Chapter 13: Permafrost", description: "Reach level 30.", reward: 100000, pointsReward: 500, levelRequired: 28, type: "progression", difficulty: "legendary", xpReward: 1000, timeLimitMinutes: 180 },
      { title: "❄️ Chapter 14: Absolute Zero", description: "Accumulate $5 million in earnings.", reward: 200000, pointsReward: 800, levelRequired: 35, type: "progression", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 180 },
      { title: "❄️ Chapter 15: The Frozen Throne", description: "Complete all Arctic Freeze chapters.", reward: 500000, pointsReward: 2500, levelRequired: 40, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },

  // ===== 4. GOLDEN RUSH =====
  golden_rush: {
    emoji: "🏆",
    name: "Golden Rush",
    intro: "A massive gold shipment has arrived. Everyone wants a piece.",
    missions: [
      { title: "🏆 Chapter 1: Finding Gold", description: "Earn your first $1,000.", reward: 500, pointsReward: 10, levelRequired: 1, type: "business", difficulty: "easy", xpReward: 20, timeLimitMinutes: 30 },
      { title: "🏆 Chapter 2: Panning for Riches", description: "Complete 5 business operations.", reward: 2000, pointsReward: 20, levelRequired: 3, type: "business", difficulty: "easy", xpReward: 40, timeLimitMinutes: 45 },
      { title: "🏆 Chapter 3: Gold Dust", description: "Earn $10,000 in one session.", reward: 5000, pointsReward: 40, levelRequired: 5, type: "business", difficulty: "easy", xpReward: 80, timeLimitMinutes: 30 },
      { title: "🏆 Chapter 4: The Nugget", description: "Find a rare item worth $5,000+.", reward: 8000, pointsReward: 50, levelRequired: 8, type: "underworld", difficulty: "medium", xpReward: 100, timeLimitMinutes: 30 },
      { title: "🏆 Chapter 5: Gold Rush Express", description: "Complete 5 transport missions.", reward: 12000, pointsReward: 60, levelRequired: 8, type: "transport", difficulty: "medium", xpReward: 120, timeLimitMinutes: 60 },
      { title: "🏆 Chapter 6: Claim Jumper", description: "Win a territory dispute.", reward: 15000, pointsReward: 80, levelRequired: 10, type: "territory", difficulty: "medium", xpReward: 160, timeLimitMinutes: 45 },
      { title: "🏆 Chapter 7: Golden Handshake", description: "Complete 10 business deals.", reward: 25000, pointsReward: 120, levelRequired: 12, type: "business", difficulty: "medium", xpReward: 240, timeLimitMinutes: 90 },
      { title: "🏆 Chapter 8: Prospectors' Gambit", description: "Win $50,000 in gambling.", reward: 30000, pointsReward: 150, levelRequired: 15, type: "gambling", difficulty: "hard", xpReward: 300, timeLimitMinutes: 60 },
      { title: "🏆 Chapter 9: The Motherlode", description: "Complete a heist worth $100,000+.", reward: 50000, pointsReward: 250, levelRequired: 18, type: "heist", difficulty: "hard", xpReward: 500, timeLimitMinutes: 45 },
      { title: "🏆 Chapter 10: Gold Fever", description: "Earn $500,000 total.", reward: 60000, pointsReward: 300, levelRequired: 20, type: "progression", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "🏆 Chapter 11: Mine Cart Mayhem", description: "Smuggle 20 items.", reward: 40000, pointsReward: 200, levelRequired: 20, type: "transport", difficulty: "hard", xpReward: 400, timeLimitMinutes: 90 },
      { title: "🏆 Chapter 12: Bullion Baron", description: "Own 5 businesses.", reward: 80000, pointsReward: 400, levelRequired: 25, type: "business", difficulty: "hard", xpReward: 800, timeLimitMinutes: 90 },
      { title: "🏆 Chapter 13: Fool's Gold", description: "Survive a failed heist and still profit.", reward: 100000, pointsReward: 500, levelRequired: 30, type: "heist", difficulty: "legendary", xpReward: 1000, timeLimitMinutes: 60 },
      { title: "🏆 Chapter 14: Golden Empire", description: "Accumulate $10 million total.", reward: 200000, pointsReward: 800, levelRequired: 35, type: "progression", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 180 },
      { title: "🏆 Chapter 15: King Midas", description: "Complete all Golden Rush chapters.", reward: 500000, pointsReward: 2500, levelRequired: 40, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },

  // ===== 5. DELTA RUN =====
  delta_run: {
    emoji: "🏃",
    name: "Delta Run",
    intro: "The clock is ticking. Run the gauntlet across every city.",
    missions: [
      { title: "🏃 Chapter 1: First Mile", description: "Travel to a new city.", reward: 500, pointsReward: 10, levelRequired: 1, type: "travel", difficulty: "easy", xpReward: 20, timeLimitMinutes: 15 },
      { title: "🏃 Chapter 2: Quick Dash", description: "Complete 3 crimes in under 5 minutes.", reward: 2000, pointsReward: 25, levelRequired: 3, type: "crime", difficulty: "easy", xpReward: 40, timeLimitMinutes: 10 },
      { title: "🏃 Chapter 3: City Hopper", description: "Visit 3 different cities.", reward: 5000, pointsReward: 40, levelRequired: 5, type: "travel", difficulty: "easy", xpReward: 80, timeLimitMinutes: 30 },
      { title: "🏃 Chapter 4: Speed Runner", description: "Complete a heist in under 3 minutes.", reward: 10000, pointsReward: 60, levelRequired: 8, type: "heist", difficulty: "medium", xpReward: 120, timeLimitMinutes: 10 },
      { title: "🏃 Chapter 5: Marathon Man", description: "Travel to 5 cities in one session.", reward: 15000, pointsReward: 80, levelRequired: 10, type: "travel", difficulty: "medium", xpReward: 160, timeLimitMinutes: 45 },
      { title: "🏃 Chapter 6: Sprint Criminal", description: "Complete 10 crimes in 15 minutes.", reward: 20000, pointsReward: 100, levelRequired: 12, type: "crime", difficulty: "medium", xpReward: 200, timeLimitMinutes: 15 },
      { title: "🏃 Chapter 7: Cross Country", description: "Visit all 12 cities.", reward: 30000, pointsReward: 150, levelRequired: 15, type: "travel", difficulty: "hard", xpReward: 300, timeLimitMinutes: 120 },
      { title: "🏃 Chapter 8: The Chase", description: "Escape from prison 3 times.", reward: 40000, pointsReward: 200, levelRequired: 18, type: "crime", difficulty: "hard", xpReward: 400, timeLimitMinutes: 60 },
      { title: "🏃 Chapter 9: Relentless", description: "Complete 50 crimes total.", reward: 50000, pointsReward: 250, levelRequired: 20, type: "crime", difficulty: "hard", xpReward: 500, timeLimitMinutes: 120 },
      { title: "🏃 Chapter 10: Endurance Run", description: "Play for 2 hours straight.", reward: 60000, pointsReward: 300, levelRequired: 22, type: "progression", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "🏃 Chapter 11: Ultra Marathon", description: "Complete 100 crimes total.", reward: 80000, pointsReward: 400, levelRequired: 25, type: "crime", difficulty: "legendary", xpReward: 800, timeLimitMinutes: 120 },
      { title: "🏃 Chapter 12: Speed Blitz", description: "Complete 20 missions in one hour.", reward: 100000, pointsReward: 500, levelRequired: 30, type: "progression", difficulty: "legendary", xpReward: 1000, timeLimitMinutes: 60 },
      { title: "🏃 Chapter 13: Terminal Velocity", description: "Win 30 PvP fights.", reward: 120000, pointsReward: 600, levelRequired: 35, type: "combat", difficulty: "legendary", xpReward: 1200, timeLimitMinutes: 90 },
      { title: "🏃 Chapter 14: Infinite Loop", description: "Reach level 50.", reward: 200000, pointsReward: 800, levelRequired: 40, type: "progression", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 180 },
      { title: "🏃 Chapter 15: The Delta Legend", description: "Complete all Delta Run chapters.", reward: 500000, pointsReward: 2500, levelRequired: 45, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },

  // ===== 6. DEEP GLOW =====
  deep_glow: {
    emoji: "💎",
    name: "Deep Glow",
    intro: "Deep beneath the city, a mysterious glow pulses. What secrets lie below?",
    missions: [
      { title: "💎 Chapter 1: Flickering Light", description: "Discover the underground by visiting the Underground page.", reward: 1000, pointsReward: 15, levelRequired: 3, type: "underworld", difficulty: "easy", xpReward: 25, timeLimitMinutes: 15 },
      { title: "💎 Chapter 2: Crystal Hunting", description: "Complete 3 underground operations.", reward: 3000, pointsReward: 30, levelRequired: 5, type: "underworld", difficulty: "easy", xpReward: 50, timeLimitMinutes: 30 },
      { title: "💎 Chapter 3: Gem Dealer", description: "Sell 5 rare items on the black market.", reward: 8000, pointsReward: 50, levelRequired: 8, type: "underworld", difficulty: "medium", xpReward: 100, timeLimitMinutes: 45 },
      { title: "💎 Chapter 4: Cave In", description: "Survive a failed smuggling run.", reward: 5000, pointsReward: 40, levelRequired: 8, type: "transport", difficulty: "medium", xpReward: 80, timeLimitMinutes: 30 },
      { title: "💎 Chapter 5: Bioluminescent", description: "Earn $25,000 from underground dealings.", reward: 15000, pointsReward: 80, levelRequired: 10, type: "underworld", difficulty: "medium", xpReward: 160, timeLimitMinutes: 60 },
      { title: "💎 Chapter 6: Obsidian Dagger", description: "Buy a legendary weapon from the black market.", reward: 20000, pointsReward: 100, levelRequired: 12, type: "underworld", difficulty: "medium", xpReward: 200, timeLimitMinutes: 15 },
      { title: "💎 Chapter 7: Stalactite", description: "Complete 15 underground crimes.", reward: 25000, pointsReward: 120, levelRequired: 15, type: "underworld", difficulty: "hard", xpReward: 250, timeLimitMinutes: 90 },
      { title: "💎 Chapter 8: Cave System", description: "Own 2 safe houses in different cities.", reward: 30000, pointsReward: 150, levelRequired: 18, type: "empire", difficulty: "hard", xpReward: 300, timeLimitMinutes: 60 },
      { title: "💎 Chapter 9: Fossil Record", description: "Accumulate 100,000 XP.", reward: 40000, pointsReward: 200, levelRequired: 20, type: "progression", difficulty: "hard", xpReward: 400, timeLimitMinutes: 120 },
      { title: "💎 Chapter 10: Radiant Core", description: "Complete 5 organized crime operations.", reward: 50000, pointsReward: 250, levelRequired: 22, type: "crime", difficulty: "hard", xpReward: 500, timeLimitMinutes: 90 },
      { title: "💎 Chapter 11: Crystal Cavern", description: "Smuggle 30 contraband items.", reward: 60000, pointsReward: 300, levelRequired: 25, type: "transport", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "💎 Chapter 12: Diamond Heist", description: "Rob the diamond district.", reward: 100000, pointsReward: 500, levelRequired: 30, type: "heist", difficulty: "legendary", xpReward: 1000, timeLimitMinutes: 45 },
      { title: "💎 Chapter 13: Gem Encrusted", description: "Own every type of asset.", reward: 80000, pointsReward: 400, levelRequired: 30, type: "empire", difficulty: "hard", xpReward: 800, timeLimitMinutes: 120 },
      { title: "💎 Chapter 14: Abyssal Depths", description: "Reach the deepest level of the underground.", reward: 150000, pointsReward: 700, levelRequired: 40, type: "underworld", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 90 },
      { title: "💎 Chapter 15: Deep Glow Ascendant", description: "Complete all Deep Glow chapters.", reward: 500000, pointsReward: 2500, levelRequired: 45, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },

  // ===== 7. FIRE BRAIN =====
  fire_brain: {
    emoji: "🔥",
    name: "Fire Brain",
    intro: "A genius arsonist is setting the city ablaze. Stop them — or join them.",
    missions: [
      { title: "🔥 Chapter 1: First Spark", description: "Commit an arson crime.", reward: 1000, pointsReward: 15, levelRequired: 3, type: "crime", difficulty: "easy", xpReward: 25, timeLimitMinutes: 30 },
      { title: "🔥 Chapter 2: Matchstick", description: "Complete 5 fire-related crimes.", reward: 3000, pointsReward: 30, levelRequired: 5, type: "crime", difficulty: "easy", xpReward: 50, timeLimitMinutes: 45 },
      { title: "🔥 Chapter 3: Smoke Signal", description: "Use the World Events system.", reward: 2000, pointsReward: 20, levelRequired: 5, type: "explore", difficulty: "easy", xpReward: 35, timeLimitMinutes: 15 },
      { title: "🔥 Chapter 4: Controlled Burn", description: "Complete 10 arson operations.", reward: 10000, pointsReward: 60, levelRequired: 8, type: "crime", difficulty: "medium", xpReward: 120, timeLimitMinutes: 60 },
      { title: "🔥 Chapter 5: Wildfire", description: "Cause $100,000 in damage.", reward: 15000, pointsReward: 80, levelRequired: 10, type: "crime", difficulty: "medium", xpReward: 160, timeLimitMinutes: 60 },
      { title: "🔥 Chapter 6: Inferno", description: "Win 10 PvP fights with fire-themed weapons.", reward: 20000, pointsReward: 100, levelRequired: 12, type: "combat", difficulty: "medium", xpReward: 200, timeLimitMinutes: 60 },
      { title: "🔥 Chapter 7: Arson Ring", description: "Coordinate 5 arson attacks.", reward: 30000, pointsReward: 150, levelRequired: 15, type: "crime", difficulty: "hard", xpReward: 300, timeLimitMinutes: 90 },
      { title: "🔥 Chapter 8: Firestarter", description: "Reach wanted level 5.", reward: 40000, pointsReward: 200, levelRequired: 18, type: "crime", difficulty: "hard", xpReward: 400, timeLimitMinutes: 45 },
      { title: "🔥 Chapter 9: Blaze Runner", description: "Complete 5 transport missions during events.", reward: 35000, pointsReward: 175, levelRequired: 18, type: "transport", difficulty: "hard", xpReward: 350, timeLimitMinutes: 60 },
      { title: "🔥 Chapter 10: Firestorm", description: "Defeat 25 enemies.", reward: 50000, pointsReward: 250, levelRequired: 20, type: "combat", difficulty: "hard", xpReward: 500, timeLimitMinutes: 90 },
      { title: "🔥 Chapter 11: Hellfire", description: "Complete 100 crimes total.", reward: 60000, pointsReward: 300, levelRequired: 25, type: "crime", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "🔥 Chapter 12: Phoenix Rising", description: "Die and respawn with more money than before.", reward: 75000, pointsReward: 375, levelRequired: 25, type: "progression", difficulty: "legendary", xpReward: 750, timeLimitMinutes: 60 },
      { title: "🔥 Chapter 13: Solar Flare", description: "Earn $1 million total.", reward: 100000, pointsReward: 500, levelRequired: 30, type: "progression", difficulty: "legendary", xpReward: 1000, timeLimitMinutes: 180 },
      { title: "🔥 Chapter 14: Supernova", description: "Reach level 50.", reward: 200000, pointsReward: 800, levelRequired: 40, type: "progression", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 180 },
      { title: "🔥 Chapter 15: Fire Brain Ascendant", description: "Complete all Fire Brain chapters.", reward: 500000, pointsReward: 2500, levelRequired: 45, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },

  // ===== 8. DARK RUSH =====
  dark_rush: {
    emoji: "🌑",
    name: "Dark Rush",
    intro: "The shadows are alive. A dark force moves through the underworld.",
    missions: [
      { title: "🌑 Chapter 1: Into Darkness", description: "Complete your first assassination.", reward: 1500, pointsReward: 20, levelRequired: 5, type: "combat", difficulty: "easy", xpReward: 30, timeLimitMinutes: 30 },
      { title: "🌑 Chapter 2: Shadow Step", description: "Complete 5 stealth crimes.", reward: 3000, pointsReward: 30, levelRequired: 5, type: "stealth", difficulty: "easy", xpReward: 50, timeLimitMinutes: 45 },
      { title: "🌑 Chapter 3: Night Vision", description: "Play 3 missions at night (late hours).", reward: 4000, pointsReward: 35, levelRequired: 8, type: "crime", difficulty: "easy", xpReward: 60, timeLimitMinutes: 60 },
      { title: "🌑 Chapter 4: Dark Deal", description: "Complete 10 black market transactions.", reward: 10000, pointsReward: 60, levelRequired: 10, type: "underworld", difficulty: "medium", xpReward: 120, timeLimitMinutes: 60 },
      { title: "🌑 Chapter 5: Phantom", description: "Eliminate 3 targets without taking damage.", reward: 15000, pointsReward: 80, levelRequired: 12, type: "combat", difficulty: "medium", xpReward: 160, timeLimitMinutes: 45 },
      { title: "🌑 Chapter 6: Occultist", description: "Complete 5 organized crime operations.", reward: 20000, pointsReward: 100, levelRequired: 15, type: "crime", difficulty: "medium", xpReward: 200, timeLimitMinutes: 90 },
      { title: "🌑 Chapter 7: Nightmare", description: "Win 15 PvP fights.", reward: 30000, pointsReward: 150, levelRequired: 18, type: "combat", difficulty: "hard", xpReward: 300, timeLimitMinutes: 60 },
      { title: "🌑 Chapter 8: Abyss Walker", description: "Travel to all cities and complete a crime in each.", reward: 40000, pointsReward: 200, levelRequired: 20, type: "travel", difficulty: "hard", xpReward: 400, timeLimitMinutes: 120 },
      { title: "🌑 Chapter 9: Dark Matter", description: "Accumulate 500,000 XP.", reward: 50000, pointsReward: 250, levelRequired: 22, type: "progression", difficulty: "hard", xpReward: 500, timeLimitMinutes: 120 },
      { title: "🌑 Chapter 10: Void Runner", description: "Complete 30 smuggling missions.", reward: 60000, pointsReward: 300, levelRequired: 25, type: "transport", difficulty: "hard", xpReward: 600, timeLimitMinutes: 120 },
      { title: "🌑 Chapter 11: Eclipse", description: "Defeat 50 enemies total.", reward: 75000, pointsReward: 375, levelRequired: 28, type: "combat", difficulty: "hard", xpReward: 750, timeLimitMinutes: 90 },
      { title: "🌑 Chapter 12: Black Hole", description: "Earn $3 million total.", reward: 100000, pointsReward: 500, levelRequired: 30, type: "progression", difficulty: "legendary", xpReward: 1000, timeLimitMinutes: 180 },
      { title: "🌑 Chapter 13: Event Horizon", description: "Win 50 PvP fights.", reward: 120000, pointsReward: 600, levelRequired: 35, type: "combat", difficulty: "legendary", xpReward: 1200, timeLimitMinutes: 90 },
      { title: "🌑 Chapter 14: Singularity", description: "Reach level 50 and own 10 businesses.", reward: 200000, pointsReward: 800, levelRequired: 40, type: "progression", difficulty: "legendary", xpReward: 1500, timeLimitMinutes: 180 },
      { title: "🌑 Chapter 15: Dark Rush Sovereign", description: "Complete all Dark Rush chapters.", reward: 500000, pointsReward: 2500, levelRequired: 45, type: "legendary", difficulty: "legendary", xpReward: 3000, timeLimitMinutes: 120 },
    ],
  },
};

// ===== GENERAL MISSION GENERATORS =====

const CRIME_ACTIONS = [
  "mugging", "pickpocketing", "shoplifting", "breaking & entering", "car theft", "burglary",
  "armed robbery", "identity theft", "fraud", "extortion", "counterfeiting", "arson",
  "drug dealing", "weapons trafficking", "smuggling", "kidnapping", "bribery", "racketeering",
  "cybercrime", "tax evasion", "witness intimidation", "loan sharking", "bootlegging",
  "illegal gambling", "prostitution ring", "cargo theft", "paint theft", "copper wiring theft",
  "package theft", "scam operations", "smash and grab", "chop shop", "dock piracy",
];

const HEIST_TARGETS = [
  "bank vault", "jewelry store", "casino", "museum", "armored truck", "airport cargo",
  "warehouse", "federal reserve", "diamond district", "art gallery", "pharmaceutical lab",
  "data center", "construction site", "train", "yacht", "penthouse", "embassy",
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Miami", "Las Vegas",
  "Detroit", "Houston", "Phoenix", "Philadelphia", "Boston", "Atlanta", "Dallas",
];

const GAMBLING_GAMES = [
  "dice", "blackjack", "roulette", "slots", "poker", "horse racing",
  "coin toss", "number game", "craps", "baccarat", "lottery", "keno",
];

const COMBAT_ACTIONS = [
  "assassination", "duel", "death match", "spar", "tournament", "hit",
  "ambush", "counter-attack", "mass elimination", "boss fight",
];

const TRANSPORT_ITEMS = [
  "contraband", "weapons", "drugs", "stolen goods", "counterfeit bills",
  "explosives", "rare artifacts", "electronics", "chemicals", "human cargo",
];

const BUSINESS_TYPES = [
  "restaurant", "bar", "club", "laundromat", "car wash", "tattoo parlor",
  "auto repair", "warehouse", "strip club", "casino", "hotel", "casino resort",
];

function generateGeneralMissions(): MissionData[] {
  const missions: MissionData[] = [];
  let id = 0;

  // Helper to create a mission
  const m = (
    title: string, desc: string, reward: number, pts: number, lvl: number,
    type: string, diff: string, xp: number, time?: number, loc?: string
  ): MissionData => ({
    title, description: desc, reward, pointsReward: pts, levelRequired: lvl,
    type, difficulty: diff, xpReward: xp, timeLimitMinutes: time, location: loc,
  });

  // ===== STREET CRIMES (500 missions) =====
  const diffLevels = ["easy", "medium", "hard", "legendary"] as const;
  for (let i = 0; i < 500; i++) {
    const action = CRIME_ACTIONS[i % CRIME_ACTIONS.length];
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 125));
    const diff = diffLevels[diffIdx];
    const lvl = 1 + Math.floor(i / 40);
    const reward = [500, 2000, 8000, 25000][diffIdx] + Math.floor(Math.random() * 1000);
    const xp = [20, 50, 120, 300][diffIdx];
    const time = [30, 20, 15, 10][diffIdx];
    const names = ["Quick", "Masterful", "Elite", "Legendary"];
    const num = Math.floor(i / CRIME_ACTIONS.length) + 1;
    missions.push(m(
      `🔪 ${names[diffIdx]} ${action.charAt(0).toUpperCase() + action.slice(1)} #${num}`,
      `Complete ${Math.ceil((i + 1) / 50)} ${action} operations in ${city}.`,
      reward, 10 + diffIdx * 15, lvl, "crime", diff, xp, time, city
    ));
    id++;
  }

  // ===== HEIST MISSIONS (500 missions) =====
  for (let i = 0; i < 500; i++) {
    const target = HEIST_TARGETS[i % HEIST_TARGETS.length];
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 125));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 35);
    const reward = [3000, 10000, 30000, 80000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [45, 30, 20, 15][diffIdx];
    const prefixes = ["Amateur", "Professional", "Master", "Legendary"];
    const num = Math.floor(i / HEIST_TARGETS.length) + 1;
    missions.push(m(
      `🏦 ${prefixes[diffIdx]} ${target.charAt(0).toUpperCase() + target.slice(1)} Heist #${num}`,
      `Plan and execute a ${target} heist in ${city}. ${diff === "legendary" ? "Maximum security expected." : ""}`,
      reward, 20 + diffIdx * 20, lvl, "heist", diff, xp, time, city
    ));
    id++;
  }

  // ===== GAMBLING MISSIONS (500 missions) =====
  for (let i = 0; i < 500; i++) {
    const game = GAMBLING_GAMES[i % GAMBLING_GAMES.length];
    const diffIdx = Math.min(3, Math.floor(i / 125));
    const diff = diffLevels[diffIdx];
    const lvl = 1 + Math.floor(i / 40);
    const reward = [1000, 5000, 15000, 50000][diffIdx] + Math.floor(Math.random() * 2000);
    const xp = [25, 70, 180, 450][diffIdx];
    const time = [30, 20, 10, 5][diffIdx];
    const amounts = ["$500", "$5,000", "$25,000", "$100,000"];
    const num = Math.floor(i / GAMBLING_GAMES.length) + 1;
    missions.push(m(
      `🎰 ${game.charAt(0).toUpperCase() + game.slice(1)} Challenge #${num}`,
      `Win ${amounts[diffIdx]} playing ${game}. ${diff === "legendary" ? "Go all in." : "Bet smart."}`,
      reward, 15 + diffIdx * 15, lvl, "gambling", diff, xp, time, "Las Vegas"
    ));
    id++;
  }

  // ===== COMBAT MISSIONS (500 missions) =====
  for (let i = 0; i < 500; i++) {
    const action = COMBAT_ACTIONS[i % COMBAT_ACTIONS.length];
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 125));
    const diff = diffLevels[diffIdx];
    const lvl = 3 + Math.floor(i / 35);
    const reward = [2000, 8000, 25000, 75000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [30, 80, 200, 500][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const targets = [1, 5, 15, 50];
    const num = Math.floor(i / COMBAT_ACTIONS.length) + 1;
    missions.push(m(
      `⚔️ ${action.charAt(0).toUpperCase() + action.slice(1)} #${num}`,
      `Complete ${targets[diffIdx]} ${action} operations in ${city}.`,
      reward, 20 + diffIdx * 20, lvl, "combat", diff, xp, time, city
    ));
    id++;
  }

  // ===== TRANSPORT MISSIONS (500 missions) =====
  for (let i = 0; i < 500; i++) {
    const item = TRANSPORT_ITEMS[i % TRANSPORT_ITEMS.length];
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 125));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 35);
    const reward = [3000, 12000, 35000, 90000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [35, 90, 220, 550][diffIdx];
    const time = [60, 45, 30, 20][diffIdx];
    const quants = [3, 10, 25, 100];
    const num = Math.floor(i / TRANSPORT_ITEMS.length) + 1;
    missions.push(m(
      `🚛 ${item.charAt(0).toUpperCase() + item.slice(1)} Run #${num}`,
      `Transport ${quants[diffIdx]} units of ${item} through ${city}.`,
      reward, 20 + diffIdx * 20, lvl, "transport", diff, xp, time, city
    ));
    id++;
  }

  // ===== EMPIRE MISSIONS (400 missions) =====
  const empireTypes = ["safe house", "business", "territory", "family", "crew", "company"];
  for (let i = 0; i < 400; i++) {
    const etype = empireTypes[i % empireTypes.length];
    const diffIdx = Math.min(3, Math.floor(i / 100));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 30);
    const reward = [2000, 10000, 30000, 100000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [30, 80, 200, 500][diffIdx];
    const time = [120, 90, 60, 30][diffIdx];
    const counts = [1, 3, 5, 10];
    const num = Math.floor(i / empireTypes.length) + 1;
    missions.push(m(
      `🏗️ ${etype.charAt(0).toUpperCase() + etype.slice(1)} Expansion #${num}`,
      `Own or manage ${counts[diffIdx]} ${etype}(s). Build your criminal empire.`,
      reward, 15 + diffIdx * 20, lvl, "empire", diff, xp, time
    ));
    id++;
  }

  // ===== BUSINESS MISSIONS (300 missions) =====
  for (let i = 0; i < 300; i++) {
    const biz = BUSINESS_TYPES[i % BUSINESS_TYPES.length];
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 25);
    const reward = [5000, 15000, 40000, 120000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [120, 90, 60, 30][diffIdx];
    const amounts = ["$10,000", "$50,000", "$200,000", "$1,000,000"];
    const num = Math.floor(i / BUSINESS_TYPES.length) + 1;
    missions.push(m(
      `🏪 ${biz.charAt(0).toUpperCase() + biz.slice(1)} Mogul #${num}`,
      `Run a successful ${biz} in ${city} and earn ${amounts[diffIdx]}.`,
      reward, 20 + diffIdx * 20, lvl, "business", diff, xp, time, city
    ));
    id++;
  }

  // ===== TRAVEL MISSIONS (300 missions) =====
  for (let i = 0; i < 300; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 1 + Math.floor(i / 30);
    const reward = [1000, 5000, 20000, 60000][diffIdx] + Math.floor(Math.random() * 2000);
    const xp = [20, 60, 160, 400][diffIdx];
    const time = [60, 45, 30, 20][diffIdx];
    const cityCounts = [2, 5, 8, 12];
    const num = i + 1;
    missions.push(m(
      `✈️ City Explorer #${num}`,
      `Visit ${cityCounts[diffIdx]} different cities and complete operations in each.`,
      reward, 15 + diffIdx * 15, lvl, "travel", diff, xp, time
    ));
    id++;
  }

  // ===== SOCIAL MISSIONS (200 missions) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 3 + Math.floor(i / 20);
    const reward = [1500, 8000, 25000, 75000][diffIdx] + Math.floor(Math.random() * 2000);
    const xp = [25, 70, 180, 450][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const socialActions = [
      "Send gifts to crew members",
      "Create and manage a family",
      "Recruit new crew members",
      "Participate in community events",
      "Trade items with other players",
    ];
    const action = socialActions[i % socialActions.length];
    const num = Math.floor(i / socialActions.length) + 1;
    missions.push(m(
      `👥 Social Butterfly #${num}`,
      `${action}. Build connections in the underworld.`,
      reward, 15 + diffIdx * 15, lvl, "social", diff, xp, time
    ));
    id++;
  }

  // ===== PROGRESSION MISSIONS (200 missions) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 1 + Math.floor(i / 15);
    const reward = [1000, 5000, 20000, 80000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [25, 70, 200, 500][diffIdx];
    const time = [120, 90, 60, 30][diffIdx];
    const lvlTargets = [5, 15, 30, 50];
    const num = i + 1;
    missions.push(m(
      `📊 Level Up #${num}`,
      `Reach level ${lvlTargets[diffIdx]}. Continue your rise to power.`,
      reward, 20 + diffIdx * 20, lvl, "progression", diff, xp, time
    ));
    id++;
  }

  // ===== LEGENDARY MISSIONS (200 missions) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 15 + Math.floor(i / 15);
    const reward = [20000, 75000, 200000, 1000000][diffIdx] + Math.floor(Math.random() * 10000);
    const xp = [200, 500, 1200, 3000][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const legendaryOps = [
      "The Big Score", "Shadow Protocol", "Underworld King", "Crime Lord's Gambit",
      "The Final Job", "Midnight Operation", "Ghost Protocol", "Iron Fist",
      "Crimson Tide", "Blackout Mission", "Venom Strike", "Titan's Heist",
    ];
    const op = legendaryOps[i % legendaryOps.length];
    const num = Math.floor(i / legendaryOps.length) + 1;
    missions.push(m(
      `⭐ ${op} #${num}`,
      `Execute one of the most dangerous operations in criminal history.`,
      reward, 50 + diffIdx * 50, lvl, "legendary", diff, xp, time
    ));
    id++;
  }

  // ===== UNDERWORLD MISSIONS (300 missions) =====
  for (let i = 0; i < 300; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 25);
    const reward = [3000, 12000, 35000, 100000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [35, 90, 220, 550][diffIdx];
    const time = [60, 45, 30, 20][diffIdx];
    const undergroundOps = [
      "Black market deal", "Contraband smuggling", "Weapons trade",
      "Drug distribution", "Counterfeit operation", "Money laundering",
    ];
    const op = undergroundOps[i % undergroundOps.length];
    const num = Math.floor(i / undergroundOps.length) + 1;
    missions.push(m(
      `🌐 ${op.charAt(0).toUpperCase() + op.slice(1)} #${num}`,
      `Operate deep in the underworld. Complete the ${op.toLowerCase()} successfully.`,
      reward, 20 + diffIdx * 20, lvl, "underworld", diff, xp, time
    ));
    id++;
  }

  // ===== CYBER MISSIONS (200 missions) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 20);
    const reward = [5000, 15000, 45000, 120000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [40, 110, 270, 650][diffIdx];
    const time = [45, 30, 20, 10][diffIdx];
    const cyberOps = [
      "Data breach", "Server hack", "Digital theft", "Identity swap",
      "System crack", "Network invasion",
    ];
    const op = cyberOps[i % cyberOps.length];
    const num = Math.floor(i / cyberOps.length) + 1;
    missions.push(m(
      `💻 ${op.charAt(0).toUpperCase() + op.slice(1)} #${num}`,
      `Infiltrate and compromise digital systems. Complete the ${op.toLowerCase()}.`,
      reward, 25 + diffIdx * 20, lvl, "cyber", diff, xp, time
    ));
    id++;
  }


  // ===== PRISON MISSIONS (300) =====
  for (let i = 0; i < 300; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 3 + Math.floor(i / 25);
    const reward = [1500, 6000, 20000, 60000][diffIdx] + Math.floor(Math.random() * 2000);
    const xp = [25, 70, 180, 450][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const prisonOps = ["Cell Block Riot", "Contraband Smuggle", "Guard Bribe", "Tunnel Dig", "Prison Job", "Gang Alliance", "Solitary Escape", "Prison Fight"];
    const op = prisonOps[i % prisonOps.length];
    const num = Math.floor(i / prisonOps.length) + 1;
    missions.push(m(
      `🔒 ${op} #${num}`,
      `Execute "${op.toLowerCase()}" operations from inside prison.`,
      reward, 15 + diffIdx * 15, lvl, "crime", diff, xp, time, "Prison"
    ));
  }

  // ===== HEIST CHAINS (300) =====
  for (let i = 0; i < 300; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 10 + Math.floor(i / 25);
    const reward = [8000, 25000, 75000, 250000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [60, 150, 400, 1000][diffIdx];
    const time = [90, 60, 45, 20][diffIdx];
    const chainOps = ["Setup Phase", "Infiltration", "The Grab", "Escape Route", "Fencing Goods", "Laundering", "Clean Getaway"];
    const op = chainOps[i % chainOps.length];
    const chain = Math.floor(i / chainOps.length) + 1;
    missions.push(m(
      `🔗 Chain ${chain}: ${op}`,
      `Complete the "${op.toLowerCase()}" phase of heist chain #${chain}.`,
      reward, 25 + diffIdx * 25, lvl, "heist", diff, xp, time
    ));
  }

  // ===== TERRITORY WARS (300) =====
  for (let i = 0; i < 300; i++) {
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 25);
    const reward = [4000, 15000, 45000, 120000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const warOps = ["Claim District", "Defend Turf", "Raid Enemy", "Patrol Route", "Set Ambush", "Sabotage Op"];
    const op = warOps[i % warOps.length];
    const num = Math.floor(i / warOps.length) + 1;
    missions.push(m(
      `⚔️ ${op} #${num}`,
      `Execute "${op.toLowerCase()}" in ${city}. Control the territory.`,
      reward, 20 + diffIdx * 20, lvl, "territory", diff, xp, time, city
    ));
  }

  // ===== ESPIONAGE MISSIONS (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 10 + Math.floor(i / 20);
    const reward = [5000, 18000, 50000, 150000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [50, 120, 300, 700][diffIdx];
    const time = [45, 30, 20, 10][diffIdx];
    const spyOps = ["Plant Wiretap", "Extract Intel", "Double Agent", "Disinformation", "Surveillance", "Code Breaker"];
    const op = spyOps[i % spyOps.length];
    const num = Math.floor(i / spyOps.length) + 1;
    missions.push(m(
      `🕵️ ${op} #${num}`,
      `Execute "${op.toLowerCase()}" espionage operations.`,
      reward, 25 + diffIdx * 25, lvl, "espionage", diff, xp, time
    ));
  }

  // ===== TOURNAMENT MISSIONS (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 20);
    const reward = [3000, 10000, 30000, 80000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [35, 90, 220, 550][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const tourneyOps = ["Qualifying Round", "Quarterfinal", "Semifinal", "Finals", "Championship"];
    const op = tourneyOps[i % tourneyOps.length];
    const num = Math.floor(i / tourneyOps.length) + 1;
    missions.push(m(
      `🏆 Tournament: ${op} #${num}`,
      `Win the ${op.toLowerCase()} of a fighting tournament.`,
      reward, 20 + diffIdx * 20, lvl, "combat", diff, xp, time
    ));
  }

  // ===== DRUG OPERATIONS (300) =====
  for (let i = 0; i < 300; i++) {
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 25);
    const reward = [4000, 14000, 40000, 100000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const drugOps = ["Street Distribution", "Lab Production", "Supply Chain", "Warehouse Raid", "Deal Gone Wrong", "Corner Hustle"];
    const op = drugOps[i % drugOps.length];
    const num = Math.floor(i / drugOps.length) + 1;
    missions.push(m(
      `💊 ${op} #${num}`,
      `Run "${op.toLowerCase()}" operations in ${city}.`,
      reward, 20 + diffIdx * 20, lvl, "crime", diff, xp, time, city
    ));
  }

  // ===== POLICE Evasion (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 3 + Math.floor(i / 20);
    const reward = [2000, 8000, 25000, 70000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [30, 80, 200, 500][diffIdx];
    const time = [30, 20, 15, 10][diffIdx];
    const copOps = ["Cop Chase", "Bribe Officer", "Evidence Destruction", "Alibi Setup", "Fake ID", "Witness Tampering"];
    const op = copOps[i % copOps.length];
    const num = Math.floor(i / copOps.length) + 1;
    missions.push(m(
      `👮 ${op} #${num}`,
      `Evade law enforcement: ${op.toLowerCase()} operation.`,
      reward, 15 + diffIdx * 15, lvl, "crime", diff, xp, time
    ));
  }

  // ===== HEIST CREWS (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 12 + Math.floor(i / 20);
    const reward = [10000, 30000, 80000, 250000][diffIdx] + Math.floor(Math.random() * 10000);
    const xp = [80, 200, 500, 1200][diffIdx];
    const time = [120, 90, 60, 30][diffIdx];
    const crewOps = ["Recruit Specialist", "Plan Layout", "Scout Target", "Get Equipment", "Execute Job", "Split Loot"];
    const op = crewOps[i % crewOps.length];
    const num = Math.floor(i / crewOps.length) + 1;
    missions.push(m(
      `👥 Crew: ${op} #${num}`,
      `Lead your crew through "${op.toLowerCase()}".`,
      reward, 30 + diffIdx * 25, lvl, "social", diff, xp, time
    ));
  }

  // ===== SMUGGLING ROUTES (300) =====
  for (let i = 0; i < 300; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 6 + Math.floor(i / 25);
    const reward = [3000, 12000, 35000, 90000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [35, 90, 220, 550][diffIdx];
    const time = [60, 45, 30, 20][diffIdx];
    const smugRoutes = ["Coastal Run", "Mountain Pass", "Tunnel Route", "River Delta", "Air Drop", "Border Crossing"];
    const route = smugRoutes[i % smugRoutes.length];
    const num = Math.floor(i / smugRoutes.length) + 1;
    missions.push(m(
      `🚛 Route: ${route} #${num}`,
      `Complete the "${route.toLowerCase()}" smuggling route.`,
      reward, 20 + diffIdx * 20, lvl, "transport", diff, xp, time
    ));
  }


  // ===== BLACK MARKET DEALS (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 20);
    const reward = [2000, 8000, 25000, 70000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [30, 80, 200, 500][diffIdx];
    const time = [45, 30, 20, 10][diffIdx];
    const bmOps = ["Buy Weapons", "Sell Contraband", "Trade Intel", "Exchange Goods", "Black Market Buy"];
    const op = bmOps[i % bmOps.length];
    const num = Math.floor(i / bmOps.length) + 1;
    missions.push(m(`🖤 ${op} #${num}`, `Complete "${op.toLowerCase()}" at the black market.`, reward, 15 + diffIdx * 15, lvl, "underworld", diff, xp, time));
  }

  // ===== NIGHT OPS (200) =====
  for (let i = 0; i < 200; i++) {
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 20);
    const reward = [3000, 12000, 35000, 90000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [35, 90, 220, 550][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const nightOps = ["Night Raid", "Midnight Heist", "Dark Infiltration", "Shadow Operation", "Nocturnal Strike"];
    const op = nightOps[i % nightOps.length];
    const num = Math.floor(i / nightOps.length) + 1;
    missions.push(m(`🌙 ${op} #${num}`, `Execute "${op.toLowerCase()}" in ${city} under cover of darkness.`, reward, 20 + diffIdx * 20, lvl, "crime", diff, xp, time, city));
  }

  // ===== VIP BODYGUARD (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 10 + Math.floor(i / 20);
    const reward = [5000, 15000, 40000, 100000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const bodyOps = ["Protect VIP", "Defend Shipment", "Escort Mission", "Guard Safehouse", "Security Detail"];
    const op = bodyOps[i % bodyOps.length];
    const num = Math.floor(i / bodyOps.length) + 1;
    missions.push(m(`🛡️ ${op} #${num}`, `Complete "${op.toLowerCase()}" protection operations.`, reward, 20 + diffIdx * 20, lvl, "combat", diff, xp, time));
  }

  // ===== FRAUD OPERATIONS (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 20);
    const reward = [2000, 8000, 25000, 70000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [30, 80, 200, 500][diffIdx];
    const time = [45, 30, 20, 10][diffIdx];
    const fraudOps = ["ID Theft Ring", "Credit Card Clone", "Tax Evasion Op", "Insurance Scam", "Fake Documents"];
    const op = fraudOps[i % fraudOps.length];
    const num = Math.floor(i / fraudOps.length) + 1;
    missions.push(m(`📋 ${op} #${num}`, `Execute "${op.toLowerCase()}" fraud operations.`, reward, 15 + diffIdx * 15, lvl, "crime", diff, xp, time));
  }

  // ===== ARMS TRADE (200) =====
  for (let i = 0; i < 200; i++) {
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 20);
    const reward = [4000, 14000, 40000, 100000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const armsOps = ["Weapons Smuggle", "Ammo Run", "Heavy Weapons", "Explosives Deal", "Sniper Acquisition"];
    const op = armsOps[i % armsOps.length];
    const num = Math.floor(i / armsOps.length) + 1;
    missions.push(m(`🔫 ${op} #${num}`, `Complete "${op.toLowerCase()}" operations in ${city}.`, reward, 20 + diffIdx * 20, lvl, "crime", diff, xp, time, city));
  }

  // ===== CORPORATE CRIME (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 12 + Math.floor(i / 20);
    const reward = [6000, 20000, 60000, 180000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [50, 120, 300, 700][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const corpOps = ["Insider Trading", "Data Theft", "Corporate Espionage", "Trade Secret Leak", "Stock Manipulation"];
    const op = corpOps[i % corpOps.length];
    const num = Math.floor(i / corpOps.length) + 1;
    missions.push(m(`🏢 ${op} #${num}`, `Execute "${op.toLowerCase()}" corporate crime operations.`, reward, 25 + diffIdx * 25, lvl, "crime", diff, xp, time));
  }

  // ===== STREET RACES (200) =====
  for (let i = 0; i < 200; i++) {
    const city = CITIES[i % CITIES.length];
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 3 + Math.floor(i / 20);
    const reward = [1500, 6000, 18000, 50000][diffIdx] + Math.floor(Math.random() * 2000);
    const xp = [25, 70, 180, 450][diffIdx];
    const time = [30, 20, 15, 10][diffIdx];
    const raceOps = ["Sprint Race", "Drift Challenge", "Circuit Race", "Drag Race", "Endurance Run"];
    const op = raceOps[i % raceOps.length];
    const num = Math.floor(i / raceOps.length) + 1;
    missions.push(m(`🏎️ ${op} #${num}`, `Win "${op.toLowerCase()}" events in ${city}.`, reward, 15 + diffIdx * 15, lvl, "crime", diff, xp, time, city));
  }

  // ===== UNDERGROUND ARENA (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 20);
    const reward = [3000, 10000, 30000, 80000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [35, 90, 220, 550][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const arenaOps = ["Arena Fight", "Tournament Entry", "Champion Bout", "Survival Round", "Exhibition Match"];
    const op = arenaOps[i % arenaOps.length];
    const num = Math.floor(i / arenaOps.length) + 1;
    missions.push(m(`🏟️ ${op} #${num}`, `Win "${op.toLowerCase()}" in the underground arena.`, reward, 20 + diffIdx * 20, lvl, "combat", diff, xp, time));
  }

  // ===== LEGENDARY HEISTS (300) =====
  for (let i = 0; i < 300; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 75));
    const diff = diffLevels[diffIdx];
    const lvl = 20 + Math.floor(i / 25);
    const reward = [20000, 75000, 200000, 1000000][diffIdx] + Math.floor(Math.random() * 10000);
    const xp = [200, 500, 1200, 3000][diffIdx];
    const time = [120, 90, 60, 30][diffIdx];
    const legendaryOps = ["The Big Score", "Shadow Protocol", "Midnight Raid", "Ghost Heist", "The Grand Larceny", "Final Score"];
    const op = legendaryOps[i % legendaryOps.length];
    const num = Math.floor(i / legendaryOps.length) + 1;
    missions.push(m(`⭐ ${op} #${num}`, `Execute the legendary "${op.toLowerCase()}" operation.`, reward, 50 + diffIdx * 50, lvl, "legendary", diff, xp, time));
  }


  // ===== REAL ESTATE (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 5 + Math.floor(i / 20);
    const reward = [2000, 8000, 25000, 70000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [30, 80, 200, 500][diffIdx];
    const time = [120, 90, 60, 30][diffIdx];
    const reOps = ["Buy Property", "Flip House", "Rent Collection", "Property Upgrade", "Land Grab"];
    const op = reOps[i % reOps.length];
    const num = Math.floor(i / reOps.length) + 1;
    missions.push(m(`🏠 ${op} #${num}`, `Complete "${op.toLowerCase()}" real estate operations.`, reward, 15 + diffIdx * 15, lvl, "business", diff, xp, time));
  }

  // ===== INVESTMENT (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 8 + Math.floor(i / 20);
    const reward = [4000, 14000, 40000, 100000][diffIdx] + Math.floor(Math.random() * 3000);
    const xp = [40, 100, 250, 600][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const invOps = ["Stock Buy", "Market Manipulation", "Insider Trade", "Portfolio Diversify", "Short Sell"];
    const op = invOps[i % invOps.length];
    const num = Math.floor(i / invOps.length) + 1;
    missions.push(m(`📈 ${op} #${num}`, `Execute "${op.toLowerCase()}" investment operations.`, reward, 20 + diffIdx * 20, lvl, "business", diff, xp, time));
  }

  // ===== BOUNTY HUNTING (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 10 + Math.floor(i / 20);
    const reward = [5000, 18000, 50000, 150000][diffIdx] + Math.floor(Math.random() * 5000);
    const xp = [50, 120, 300, 700][diffIdx];
    const time = [60, 45, 30, 15][diffIdx];
    const bountyOps = ["Track Target", "Ambush Bounty", "Interrogate", "Collect Bounty", "Bounty Streak"];
    const op = bountyOps[i % bountyOps.length];
    const num = Math.floor(i / bountyOps.length) + 1;
    missions.push(m(`🎯 ${op} #${num}`, `Execute bounty hunting: "${op.toLowerCase()}".`, reward, 25 + diffIdx * 25, lvl, "combat", diff, xp, time));
  }

  // ===== FORUM ACTIVITY (150) =====
  for (let i = 0; i < 150; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 38));
    const diff = diffLevels[diffIdx];
    const lvl = 1 + Math.floor(i / 15);
    const reward = [500, 2000, 6000, 15000][diffIdx] + Math.floor(Math.random() * 1000);
    const xp = [15, 40, 100, 250][diffIdx];
    const time = [30, 20, 15, 10][diffIdx];
    const forumOps = ["Write Post", "Sell on Forum", "Recruit on Forum", "Trade Deal", "Intel Post"];
    const op = forumOps[i % forumOps.length];
    const num = Math.floor(i / forumOps.length) + 1;
    missions.push(m(`💬 ${op} #${num}`, `Active on forums: "${op.toLowerCase()}" community engagement.`, reward, 10 + diffIdx * 10, lvl, "social", diff, xp, time));
  }

  // ===== DAILY CHALLENGES (200) =====
  for (let i = 0; i < 200; i++) {
    const diffIdx = Math.min(3, Math.floor(i / 50));
    const diff = diffLevels[diffIdx];
    const lvl = 1 + Math.floor(i / 20);
    const reward = [1000, 4000, 12000, 35000][diffIdx] + Math.floor(Math.random() * 2000);
    const xp = [20, 50, 130, 320][diffIdx];
    const time = [120, 60, 45, 30][diffIdx];
    const dailyOps = ["Daily Crime Streak", "Quick Cash", "Combat Training", "Stealth Challenge", "Speed Run"];
    const op = dailyOps[i % dailyOps.length];
    const num = Math.floor(i / dailyOps.length) + 1;
    missions.push(m(`📅 ${op} #${num}`, `Complete the daily challenge: "${op.toLowerCase()}".`, reward, 15 + diffIdx * 15, lvl, "progression", diff, xp, time));
  }

  return missions;
}

// ===== SEED MUTATION =====
export const seedMissions = mutation({
  args: {},
  handler: async (ctx) => {
    // Check existing
    const existing = await ctx.db.query("missions").collect();
    const existingTitles = new Set(existing.map((e: any) => e.title));

    let seeded = 0;

    // Seed storylines
    for (const [storyKey, storyline] of Object.entries(STORYLINES)) {
      for (let i = 0; i < storyline.missions.length; i++) {
        const mis = storyline.missions[i];
        if (!existingTitles.has(mis.title)) {
          await ctx.db.insert("missions", {
            ...mis,
            storyline: storyKey,
            storyOrder: i + 1,
            location: mis.location || "any",
          });
          seeded++;
        }
      }
    }

    // Seed general missions (batch insert)
    const generalMissions = generateGeneralMissions();
    for (const mis of generalMissions) {
      if (!existingTitles.has(mis.title)) {
        await ctx.db.insert("missions", mis);
        seeded++;
      }
    }

    const totalAfter = existing.length + seeded;
    return {
      message: `Seeded ${seeded} new missions! Total: ${totalAfter}`,
      storylines: Object.keys(STORYLINES).length,
      generalCount: generalMissions.length,
      totalSeeded: seeded,
    };
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_FIELDS: Record<string, unknown> = {
  money: 0, bank: 0, points: 0, life: 100, maxLife: 100,
  defense: 10, attack: 10, level: 0, experience: 0,
  location: "New York", inPrison: false, prisonTime: 0, isDead: false,
  totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
  dailyRaidUsed: 0, lastDailyRaid: 0,
  lastRegenAt: 0, wantedLevel: 0, reputation: 0,
  reputationAlignment: "neutral", prestige: 0, prestigeMultiplier: 1,
  levelUpPending: false, skillPoints: 0,
  cellLevel: 1, solitaryTime: 0, contraband: 0, prisonCurrency: 0,
  paroleEligible: false, totalPrisonEscapes: 0, totalPrisonJobs: 0,
  totalEarned: 0, highestLevel: 0, totalPlaytime: 0,
  insuranceActive: false, loanAmount: 0, loanDueAt: 0,
  dirtyMoney: 0, counterfeitSkill: 0, smugglingRuns: 0, drugDeals: 0,
  racketeeringIncome: 0, loanSharkDebts: 0, witnessIntimidations: 0,
  identityThefts: 0, kidnappings: 0, arsons: 0, cargoThefts: 0,
  armsDeals: 0, illegalBoxingEvents: 0, pirateRadioBoost: 0,
  prostitutionRings: 0, gamblingDens: 0, protectionRackets: 0,
  lastBlackMarketRefresh: 0, totalLaundered: 0,
  armorDurability: 0, weaponProficiency: 0,
  killsThisSeason: 0, deathsThisSeason: 0, retaliationUntil: 0,
  lastDeathAt: 0, isKidnapped: false,
  betrayalCount: 0, totalGifting: 0, totalMentoring: 0,
  lastActive: 0, lastCrimeAt: 0, isBanned: false,
  energy: 100, maxEnergy: 100, stamina: 100, maxStamina: 100,
  focus: 100, maxFocus: 100, morale: 80, maxMorale: 100,
  adrenaline: 0, maxAdrenaline: 100, heat: 0, maxHeat: 100,
  lastEnergyRegen: 0, lastStaminaRegen: 0, lastFocusRegen: 0,
  // Clear all progress
  kills: 0, familyId: undefined, crewId: undefined,
  crimeCooldowns: {}, crimeCompleted: {},
  unlockedSkills: [], crimeMomentum: 0,
  xpBoostUntil: 0, cashBoostUntil: 0, rankBoostUntil: 0,
  dailyStreak: 0, lastDailyClaim: 0,
  dailyLoginStreak: 0, lastDailyLogin: 0,
  referralCode: undefined, referredBy: undefined,
  referralEarnings: 0, referralCommission: 0,
  bodyguardId: undefined, avatarId: undefined,
  activeRole: undefined, activeTitle: undefined,
  activeBadge: undefined, activeLanguage: undefined,
  profilePictureUrl: undefined, bio: undefined,
  armorEquipped: undefined, fightingStyle: undefined,
  familyRole: undefined, familyRank: undefined,
  prisonJob: undefined, prisonGang: undefined,
  marriedTo: undefined, deadMansSwitch: undefined,
  mentorId: undefined,
  personalityRuthless: 0, personalityLoyal: 50,
  personalitySnake: 0, personalityLegend: 0,
};

// Only admins can wipe
export const wipeAllPlayers = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check caller is admin
    const caller = await ctx.db
      .query("users")
      .withIndex("by_nickname")
      .first();
    
    // Find the caller by their auth id
    const allUsers = await ctx.db.query("users").collect();
    const callerDoc = allUsers.find((u: any) => u._id === identity.subject);
    if (!callerDoc || (callerDoc as any).role !== "admin") {
      throw new Error("Only admins can wipe players!");
    }

    let wiped = 0;
    let skipped = 0;

    for (const user of allUsers) {
      // Skip admins
      if ((user as any).role === "admin") {
        skipped++;
        continue;
      }

      // Reset to defaults, keep identity fields
      await ctx.db.patch(user._id, {
        ...DEFAULT_FIELDS,
        name: user.name,
        email: user.email,
        image: user.image,
        nickname: user.nickname,
        username: user.username,
        isAnonymous: user.isAnonymous,
        registeredAt: user.registeredAt,
        playerClass: user.playerClass,
      } as any);
      wiped++;
    }

    // Also clear related tables
    const tablesToClear = [
      "vehicles", "inventory", "playerItems", "playerAchievements",
      "playerMissions", "completedMissions", "playerStocks",
      "bounties", "duels", "contracts", "gifts", "hitLists",
      "rivalries", "bodyguards", "ambushes", "loans", "referrals",
      "smugglingRuns", "kidnappings", "illegalBusinesses",
      "dailyRaids", "sales", "combatLogs", "familyWars",
      "familyAlliances", "pokerGames", "dogFights", "streetRaces",
      "familyElections", "ambassadors", "lastManStanding", "lmsParticipants",
      "lmsEvents", "timeCapsules",
    ] as const;

    let tablesCleared = 0;
    for (const tableName of tablesToClear) {
      try {
        const docs = await ctx.db.query(tableName).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
        tablesCleared++;
      } catch {
        // Table might not exist, skip
      }
    }

    // Clear families
    try {
      const families = await ctx.db.query("families").collect();
      for (const fam of families) {
        await ctx.db.delete(fam._id);
      }
    } catch {}

    // Clear crews
    try {
      const crews = await ctx.db.query("crews").collect();
      for (const crew of crews) {
        await ctx.db.delete(crew._id);
      }
    } catch {}

    return { wiped, skipped, tablesCleared };
  },
});

export const getWipePreview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const allUsers = await ctx.db.query("users").collect();
    const admins = allUsers.filter((u: any) => u.role === "admin");
    const nonAdmins = allUsers.filter((u: any) => u.role !== "admin");

    return {
      total: allUsers.length,
      admins: admins.length,
      willWipe: nonAdmins.length,
      adminNames: admins.map((a: any) => a.nickname || a.username || a.name || "Unknown"),
    };
  },
});

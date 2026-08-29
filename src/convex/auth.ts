import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { emailOtp } from "./auth/emailOtp";

// Default values for all required game fields when a new user is created by auth.
// This ensures the user document matches the schema immediately.
const DEFAULT_GAME_FIELDS = {
  money: 0, bank: 0, points: 0, life: 100, maxLife: 100,
  defense: 10, attack: 10, level: 0, experience: 0,
  location: "New York", inPrison: false, prisonTime: 0, isDead: false,
  totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
  dailyRaidUsed: 0, lastDailyRaid: 0, registeredAt: 0,
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
  // Resources
  energy: 100, maxEnergy: 100, stamina: 100, maxStamina: 100,
  focus: 100, maxFocus: 100, morale: 80, maxMorale: 100,
  adrenaline: 0, maxAdrenaline: 100, heat: 0, maxHeat: 100,
  lastEnergyRegen: 0, lastStaminaRegen: 0, lastFocusRegen: 0,
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp, Anonymous],
  callbacks: {
    createOrUpdateUser: async (ctx, { existingUserId, ...args }) => {
      // If user already exists, just return their ID (profile already set)
      if (existingUserId) {
        // Update email if missing
        const existing = await ctx.db.get(existingUserId);
        if (existing && args.profile?.email && !(existing as any).email) {
          await ctx.db.patch(existingUserId, { email: args.profile.email } as any);
        }
        return existingUserId;
      }
      // Only pick known-safe fields from the auth profile
      const profile = args.profile ?? {};
      const safeProfile: Record<string, unknown> = {};
      if (profile.name) safeProfile.name = profile.name;
      if (profile.image) safeProfile.image = profile.image;
      if (profile.email) safeProfile.email = profile.email;
      if (profile.isAnonymous !== undefined) safeProfile.isAnonymous = profile.isAnonymous;
      if (profile.emailVerificationTime) safeProfile.emailVerificationTime = profile.emailVerificationTime;

      try {
        const userId = await ctx.db.insert("users", {
          ...DEFAULT_GAME_FIELDS,
          ...safeProfile,
        } as any);
        return userId;
      } catch (e: any) {
        // If insert fails (e.g. duplicate), try to find existing user by email
        if (profile.email) {
          const all = await ctx.db.query("users").collect();
          const existing = all.find((u: any) => u.email === profile.email);
          if (existing) return existing._id;
        }
        throw e;
      }
    },
  },
});

// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { emailOtp } from "./auth/emailOtp";


export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp, Anonymous],
  callbacks: {
    createOrUpdateUser: async (ctx, args) => {
      const existingUserId = args.existingUserId;
      if (existingUserId) {
        // Just update profile fields on existing user
        await ctx.db.patch(existingUserId, { ...args.profile });
        return existingUserId;
      }
      // Create new user with all required schema fields as defaults
      const userId = await ctx.db.insert("users", {
        ...args.profile,
        money: 0,
        bank: 0,
        points: 0,
        life: 100,
        maxLife: 100,
        defense: 10,
        attack: 10,
        level: 0,
        experience: 0,
        location: "New York",
        inPrison: false,
        prisonTime: 0,
        isDead: false,
        totalCrimes: 0,
        totalFights: 0,
        totalKills: 0,
        totalDeaths: 0,
        dailyRaidUsed: 0,
        lastDailyRaid: Date.now(),
        registeredAt: 0,
        lastRegenAt: Date.now(),
        wantedLevel: 0,
        reputation: 0,
        reputationAlignment: "neutral",
        prestige: 0,
        prestigeMultiplier: 1,
        levelUpPending: false,
        skillPoints: 0,
        cellLevel: 1,
        solitaryTime: 0,
        contraband: 0,
        prisonCurrency: 0,
        paroleEligible: false,
        totalPrisonEscapes: 0,
        totalPrisonJobs: 0,
        totalEarned: 0,
        highestLevel: 0,
        totalPlaytime: 0,
        insuranceActive: false,
        loanAmount: 0,
        loanDueAt: 0,
        dirtyMoney: 0,
        counterfeitSkill: 0,
        smugglingRuns: 0,
        drugDeals: 0,
        racketeeringIncome: 0,
        loanSharkDebts: 0,
        witnessIntimidations: 0,
        identityThefts: 0,
        kidnappings: 0,
        arsons: 0,
        cargoThefts: 0,
        armsDeals: 0,
        illegalBoxingEvents: 0,
        pirateRadioBoost: 0,
        prostitutionRings: 0,
        gamblingDens: 0,
        protectionRackets: 0,
        lastBlackMarketRefresh: 0,
        totalLaundered: 0,
        armorDurability: 0,
        weaponProficiency: 0,
        killsThisSeason: 0,
        deathsThisSeason: 0,
        retaliationUntil: 0,
        lastDeathAt: 0,
        isKidnapped: false,
        betrayalCount: 0,
        totalGifting: 0,
        totalMentoring: 0,
        lastActive: Date.now(),
        lastCrimeAt: 0,
        isBanned: false,
      });
      return userId;
    },
  },
});

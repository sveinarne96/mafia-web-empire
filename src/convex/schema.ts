import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Location types
export const locations = [
  "New York",
  "Chicago",
  "Las Vegas",
  "Miami",
  "Los Angeles",
  "Detroit",
  "Philadelphia",
  "Boston",
  "Atlanta",
  "Dallas",
] as const;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),

      // Game stats
      nickname: v.optional(v.string()),
      money: v.number(),
      bank: v.number(),
      points: v.number(),
      life: v.number(),
      maxLife: v.number(),
      energy: v.optional(v.number()),
      maxEnergy: v.optional(v.number()),
      defense: v.number(),
      attack: v.number(),
      level: v.number(),
      experience: v.number(),
      location: v.string(),
      familyId: v.optional(v.id("families")),
      inPrison: v.boolean(),
      prisonTime: v.number(),
      isDead: v.boolean(),
      totalCrimes: v.number(),
      totalFights: v.number(),
      totalKills: v.number(),
      totalDeaths: v.number(),
      dailyRaidUsed: v.number(),
      lastDailyRaid: v.number(),
      registeredAt: v.number(),

      // Core Gameplay features
      lastRegenAt: v.number(),
      wantedLevel: v.number(),
      reputation: v.number(),
      reputationAlignment: v.string(),
      prestige: v.number(),
      prestigeMultiplier: v.number(),
      levelUpPending: v.boolean(),
      skillPoints: v.number(),
      playerClass: v.optional(v.string()),

      // Prison features
      prisonJob: v.optional(v.string()),
      prisonGang: v.optional(v.string()),
      cellLevel: v.number(),
      solitaryTime: v.number(),
      contraband: v.number(),
      prisonCurrency: v.number(),
      paroleEligible: v.boolean(),
      totalPrisonEscapes: v.number(),
      totalPrisonJobs: v.number(),

      // Legacy & Titles
      activeTitle: v.optional(v.string()),
      totalEarned: v.number(),
      highestLevel: v.number(),
      totalPlaytime: v.number(),

      // Economy
      insuranceActive: v.boolean(),
      loanAmount: v.number(),

      // Underground economy
      dirtyMoney: v.number(),
      counterfeitSkill: v.number(),
      smugglingRuns: v.number(),
      drugDeals: v.number(),
      racketeeringIncome: v.number(),
      loanSharkDebts: v.number(),
      witnessIntimidations: v.number(),
      identityThefts: v.number(),
      kidnappings: v.number(),
      arsons: v.number(),
      cargoThefts: v.number(),
      armsDeals: v.number(),
      illegalBoxingEvents: v.number(),
      pirateRadioBoost: v.number(),
      prostitutionRings: v.number(),
      gamblingDens: v.number(),
      protectionRackets: v.number(),
      lastBlackMarketRefresh: v.number(),
      totalLaundered: v.number(),
      loanDueAt: v.number(),
    })
      .index("by_email", ["email"])
      .index("by_nickname", ["nickname"])
      .index("by_location", ["location"])
      .index("by_family", ["familyId"])
      .index("by_level", ["level"]),

    bounties: defineTable({
      placerId: v.id("users"),
      targetId: v.id("users"),
      reward: v.number(),
      active: v.boolean(),
      claimedBy: v.optional(v.id("users")),
      createdAt: v.number(),
    })
      .index("by_active", ["active"])
      .index("by_target", ["targetId"]),

    duels: defineTable({
      challengerId: v.id("users"),
      defenderId: v.id("users"),
      stake: v.number(),
      status: v.string(),
      winnerId: v.optional(v.id("users")),
      createdAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_defender", ["defenderId"]),

    // Tournament system
    tournaments: defineTable({
      name: v.string(),
      status: v.string(),
      maxParticipants: v.number(),
      participants: v.array(v.id("users")),
      brackets: v.optional(v.string()),
      prizePool: v.number(),
      winnerId: v.optional(v.id("users")),
      startTime: v.number(),
      endTime: v.number(),
    })
      .index("by_status", ["status"]),

    // Achievement system
    achievements: defineTable({
      name: v.string(),
      description: v.string(),
      icon: v.string(),
      category: v.string(),
      requirement: v.number(),
      reward: v.number(),
    }),

    playerAchievements: defineTable({
      playerId: v.id("users"),
      achievementId: v.id("achievements"),
      unlockedAt: v.number(),
    })
      .index("by_player", ["playerId"]),

    // Title system
    playerTitles: defineTable({
      playerId: v.id("users"),
      title: v.string(),
      active: v.boolean(),
      unlockedAt: v.number(),
    })
      .index("by_player", ["playerId"]),

    // Stock market
    stocks: defineTable({
      name: v.string(),
      symbol: v.string(),
      price: v.number(),
      change: v.number(),
      history: v.array(v.number()),
    })
      .index("by_symbol", ["symbol"]),

    playerStocks: defineTable({
      playerId: v.id("users"),
      stockId: v.id("stocks"),
      shares: v.number(),
      buyPrice: v.number(),
    })
      .index("by_player", ["playerId"]),

    // Real estate
    properties: defineTable({
      name: v.string(),
      type: v.string(),
      city: v.string(),
      price: v.number(),
      income: v.number(),
      ownerId: v.optional(v.id("users")),
    })
      .index("by_city", ["city"])
      .index("by_owner", ["ownerId"]),

    // Businesses
    businesses: defineTable({
      name: v.string(),
      type: v.string(),
      city: v.string(),
      price: v.number(),
      income: v.number(),
      level: v.number(),
      ownerId: v.id("users"),
    })
      .index("by_owner", ["ownerId"]),

    // Auction house
    auctions: defineTable({
      sellerId: v.id("users"),
      itemName: v.string(),
      description: v.string(),
      startingBid: v.number(),
      currentBid: v.number(),
      currentBidder: v.optional(v.id("users")),
      endTime: v.number(),
      active: v.boolean(),
    })
      .index("by_active", ["active"]),

    // Insurance
    playerInsurance: defineTable({
      playerId: v.id("users"),
      type: v.string(),
      expiresAt: v.number(),
      premium: v.number(),
    })
      .index("by_player", ["playerId"]),

    // Loans
    loans: defineTable({
      borrowerId: v.id("users"),
      amount: v.number(),
      interest: v.number(),
      dueAt: v.number(),
      paid: v.boolean(),
    })
      .index("by_borrower", ["borrowerId"]),

    families: defineTable({
      name: v.string(),
      tag: v.string(),
      description: v.string(),
      leaderId: v.id("users"),
      level: v.number(),
      experience: v.number(),
      treasury: v.number(),
      memberCount: v.number(),
      maxMembers: v.number(),
      createdAt: v.number(),
      rank: v.number(),
    })
      .index("by_leader", ["leaderId"])
      .index("by_level", ["level"])
      .index("by_rank", ["rank"]),

    inventory: defineTable({
      userId: v.id("users"),
      itemId: v.id("items"),
      quantity: v.number(),
      equipped: v.boolean(),
    })
      .index("by_user", ["userId"])
      .index("by_user_item", ["userId", "itemId"]),

    items: defineTable({
      name: v.string(),
      description: v.string(),
      type: v.string(),
      rarity: v.string(),
      attack: v.number(),
      defense: v.number(),
      price: v.number(),
      levelRequired: v.number(),
    })
      .index("by_type", ["type"])
      .index("by_rarity", ["rarity"]),

    vehicles: defineTable({
      userId: v.id("users"),
      name: v.string(),
      type: v.string(),
      speed: v.number(),
      storage: v.number(),
      armored: v.boolean(),
      stolen: v.boolean(),
      purchasePrice: v.number(),
    })
      .index("by_user", ["userId"]),

    crimes: defineTable({
      userId: v.id("users"),
      type: v.string(),
      target: v.string(),
      success: v.boolean(),
      moneyEarned: v.number(),
      pointsEarned: v.number(),
      damageTaken: v.number(),
      timestamp: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_type", ["type"])
      .index("by_timestamp", ["timestamp"]),

    fights: defineTable({
      attackerId: v.id("users"),
      defenderId: v.id("users"),
      attackerDamage: v.number(),
      defenderDamage: v.number(),
      winnerId: v.id("users"),
      moneyStolen: v.number(),
      timestamp: v.number(),
    })
      .index("by_attacker", ["attackerId"])
      .index("by_defender", ["defenderId"])
      .index("by_timestamp", ["timestamp"]),

    messages: defineTable({
      senderId: v.id("users"),
      receiverId: v.id("users"),
      subject: v.string(),
      body: v.string(),
      read: v.boolean(),
      timestamp: v.number(),
    })
      .index("by_receiver", ["receiverId"])
      .index("by_sender", ["senderId"])
      .index("by_timestamp", ["timestamp"]),

    notifications: defineTable({
      userId: v.id("users"),
      type: v.string(),
      message: v.string(),
      read: v.boolean(),
      timestamp: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_read", ["userId", "read"]),

    forumPosts: defineTable({
      authorId: v.id("users"),
      forum: v.string(),
      title: v.string(),
      body: v.string(),
      replies: v.number(),
      lastReplyAt: v.number(),
      pinned: v.boolean(),
      timestamp: v.number(),
    })
      .index("by_forum", ["forum"])
      .index("by_author", ["authorId"])
      .index("by_timestamp", ["timestamp"]),

    forumReplies: defineTable({
      postId: v.id("forumPosts"),
      authorId: v.id("users"),
      body: v.string(),
      timestamp: v.number(),
    })
      .index("by_post", ["postId"])
      .index("by_author", ["authorId"]),

    missions: defineTable({
      title: v.string(),
      description: v.string(),
      reward: v.number(),
      pointsReward: v.number(),
      levelRequired: v.number(),
      type: v.string(),
      location: v.optional(v.string()),
    })
      .index("by_type", ["type"])
      .index("by_level", ["levelRequired"]),

    playerMissions: defineTable({
      userId: v.id("users"),
      missionId: v.id("missions"),
      progress: v.number(),
      completed: v.boolean(),
      claimed: v.boolean(),
      startedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_mission", ["userId", "missionId"]),

    organizedCrimes: defineTable({
      familyId: v.id("families"),
      title: v.string(),
      description: v.string(),
      reward: v.number(),
      participantsRequired: v.number(),
      levelRequired: v.number(),
      successRate: v.number(),
    })
      .index("by_family", ["familyId"]),

    lotteries: defineTable({
      type: v.string(),
      prize: v.number(),
      ticketPrice: v.number(),
      participants: v.array(v.id("users")),
      winnerId: v.optional(v.id("users")),
      endTime: v.number(),
      active: v.boolean(),
    })
      .index("by_type", ["type"])
      .index("by_active", ["active"]),

    dailyRaids: defineTable({
      userId: v.id("users"),
      targetUserId: v.id("users"),
      moneyStolen: v.number(),
      damage: v.number(),
      timestamp: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_timestamp", ["timestamp"]),

    sales: defineTable({
      sellerId: v.id("users"),
      itemName: v.string(),
      description: v.string(),
      price: v.number(),
      type: v.string(),
      active: v.boolean(),
      timestamp: v.number(),
    })
      .index("by_seller", ["sellerId"])
      .index("by_active", ["active"]),

    // Smuggling runs
    smugglingRuns: defineTable({
      runnerId: v.id("users"),
      originCity: v.string(),
      destCity: v.string(),
      contrabandType: v.string(),
      quantity: v.number(),
      buyPrice: v.number(),
      sellPrice: v.number(),
      profit: v.number(),
      riskLevel: v.number(),
      success: v.boolean(),
      timestamp: v.number(),
    })
      .index("by_runner", ["runnerId"])
      .index("by_timestamp", ["timestamp"]),

    // Kidnappings
    kidnappings: defineTable({
      kidnapperId: v.id("users"),
      victimId: v.id("users"),
      ransom: v.number(),
      ransomPaid: v.boolean(),
      released: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_victim", ["victimId"])
      .index("by_kidnapper", ["kidnapperId"]),

    // Illegal businesses (gambling dens, prostitution, arms dealing)
    illegalBusinesses: defineTable({
      ownerId: v.id("users"),
      type: v.string(),
      name: v.string(),
      city: v.string(),
      level: v.number(),
      income: v.number(),
      riskLevel: v.number(),
      raided: v.boolean(),
      lastCollected: v.number(),
    })
      .index("by_owner", ["ownerId"])
      .index("by_city", ["city"]),

    // Black market items
    blackMarketItems: defineTable({
      name: v.string(),
      type: v.string(),
      price: v.number(),
      rarity: v.string(),
      statBonus: v.number(),
      available: v.boolean(),
      expiresAt: v.number(),
    })
      .index("by_type", ["type"])
      .index("by_available", ["available"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

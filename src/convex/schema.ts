import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// schemaValidation is disabled because the game has evolved for years on top of
// live players: rows created by earlier versions are missing fields that later
// became "required", and Convex re-validates the whole document on every patch,
// which made ALL actions fail for legacy players with a generic Server Error.
// Field types are still declared (used for TypeScript types + indexes); only the
// runtime write rejection is relaxed. Game code reads defensively (n()/?? 0).
const schema = defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    image: v.optional(v.string()),
    nickname: v.optional(v.string()),
    username: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    xpBoostUntil: v.optional(v.number()),
    cashBoostUntil: v.optional(v.number()),
    rankBoostUntil: v.optional(v.number()),
    lastOilCollect: v.optional(v.number()),
    playerClass: v.optional(v.string()),
    registeredAt: v.optional(v.number()),
    money: v.number(),
    bank: v.number(),
    points: v.number(),
    life: v.number(),
    maxLife: v.number(),
    defense: v.number(),
    attack: v.number(),
    level: v.number(),
    experience: v.number(),
    location: v.string(),
    inPrison: v.boolean(),
    prisonTime: v.number(),
    isDead: v.boolean(),
    totalCrimes: v.number(),
    totalFights: v.number(),
    totalKills: v.number(),
    totalDeaths: v.number(),
    dailyRaidUsed: v.number(),
    lastDailyRaid: v.number(),
    lastRegenAt: v.number(),
    wantedLevel: v.number(),

    marriedTo: v.optional(v.id("users")),
    deadMansSwitch: v.optional(v.id("users")),
    personalityRuthless: v.optional(v.number()),
    personalityLoyal: v.optional(v.number()),
    personalitySnake: v.optional(v.number()),
    personalityLegend: v.optional(v.number()),
    reputation: v.number(),
    reputationAlignment: v.string(),
    prestige: v.number(),
    prestigeMultiplier: v.number(),
    levelUpPending: v.boolean(),
    skillPoints: v.number(),
    cellLevel: v.number(),
    solitaryTime: v.number(),
    contraband: v.number(),
    prisonCurrency: v.number(),
    paroleEligible: v.boolean(),
    totalPrisonEscapes: v.number(),
    totalPrisonJobs: v.number(),
    totalEarned: v.number(),
    highestLevel: v.number(),
    totalPlaytime: v.number(),
    insuranceActive: v.boolean(),
    loanAmount: v.number(),
    loanDueAt: v.number(),
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
    armorDurability: v.number(),
    weaponProficiency: v.number(),
    killsThisSeason: v.number(),
    deathsThisSeason: v.number(),
    retaliationUntil: v.number(),
    lastDeathAt: v.number(),
    isKidnapped: v.boolean(),
    betrayalCount: v.number(),
    totalGifting: v.number(),
    totalMentoring: v.number(),
    lastActive: v.number(),
    mentorId: v.optional(v.string()),
    familyRole: v.optional(v.string()),
    armorEquipped: v.optional(v.string()),
    fightingStyle: v.optional(v.string()),
    bodyguardId: v.optional(v.string()),
    familyRank: v.optional(v.string()),
    lastCrimeAt: v.optional(v.number()),
    dailyStreak: v.optional(v.number()),
    lastDailyClaim: v.optional(v.number()),
    isBanned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    role: v.optional(v.string()),
    familyId: v.optional(v.id("families")),
    crewId: v.optional(v.string()),
    avatarId: v.optional(v.string()),
    bio: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    activeRole: v.optional(v.string()),
    activeTitle: v.optional(v.string()),
    activeLanguage: v.optional(v.string()),
    activeBadge: v.optional(v.string()),
    crimeMomentum: v.optional(v.number()),
    crimeCooldowns: v.optional(v.any()),
    crimeCompleted: v.optional(v.any()),
    prisonJob: v.optional(v.string()),
    deathTimerAt: v.optional(v.number()),
    lastStreetCrimeAt: v.optional(v.number()),
    prisonGang: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    referredBy: v.optional(v.id("users")),
    referralEarnings: v.optional(v.number()),
    referralCommission: v.optional(v.number()),
    lastReferralCommissionAt: v.optional(v.number()),
    energy: v.number(),
    maxEnergy: v.number(),
    stamina: v.number(),
    maxStamina: v.number(),
    focus: v.number(),
    maxFocus: v.number(),
    morale: v.number(),
    maxMorale: v.number(),
    adrenaline: v.number(),
    maxAdrenaline: v.number(),
    heat: v.number(),
    maxHeat: v.number(),
    lastEnergyRegen: v.number(),
    lastStaminaRegen: v.number(),
    lastFocusRegen: v.number(),
    referralMilestones: v.optional(v.any()),
    // ═══ STORES & OBJECTIVES (added later) ═══
    coins: v.optional(v.number()),
    bullets: v.optional(v.number()),
    robotBodyguards: v.optional(v.array(v.any())),
    accountUpgrades: v.optional(v.any()),
    perks: v.optional(v.any()),
    seasonXp: v.optional(v.number()),
    seasonTiersClaimed: v.optional(v.array(v.number())),
    vipUntil: v.optional(v.number()),
    objectiveProgress: v.optional(v.any()),
    objectivesClaimed: v.optional(v.any()),
    milestonesClaimed: v.optional(v.any()),
    totalActions: v.optional(v.number()),
    carsMelted: v.optional(v.number()),
    carsRepaired: v.optional(v.number()),
    legendaryRepaired: v.optional(v.number()),
    epicRepaired: v.optional(v.number()),
    rareRepaired: v.optional(v.number()),
    commonRepaired: v.optional(v.number()),
    totalRepairSpent: v.optional(v.number()),
    lastAutoMelt: v.optional(v.number()),
    meltLimitLevel: v.optional(v.number()),
    starterClaimed: v.optional(v.boolean()),
    pointsSent: v.optional(v.number()),
    pointsReceived: v.optional(v.number()),
    packsOpened: v.optional(v.number()),
    scratchCards: v.optional(v.number()),
    packs: v.optional(v.any()),
    scraps: v.optional(v.any()),
    carKeys: v.optional(v.any()),
    autoConvertScraps: v.optional(v.boolean()),
    // ═══ SEASON TOKENS / STORE / INVENTORY ═══
    seasonTokens: v.optional(v.number()),
    vipTokens: v.optional(v.number()),
    vipTokensSeason: v.optional(v.string()),
    seasonStoreBought: v.optional(v.any()), // { season: string, counts: Record<string, number> }
    seasonInventory: v.optional(v.array(v.any())), // owned cosmetics { id, name, category, acquiredAt }
    equippedCosmetics: v.optional(v.any()), // { avatar?: string, cards?: string, relic?: string }
    // ═══ DAILY REWARD MATCH GAME ═══
    dailyRewardState: v.optional(v.any()), // { board: number[], revealed: number[], matched: number[], chances: number, active: boolean, startedAt: number }
    dailyRewardLastPlayed: v.optional(v.number()),
    dailyRewardHistory: v.optional(v.array(v.any())),
    perkActiveUntil: v.optional(v.any()),
    meltValueUntil: v.optional(v.number()),
    meltLimitUntil: v.optional(v.number()),
    gtaRarityUntil: v.optional(v.number()),
    bustBoostUntil: v.optional(v.number()),
    heistChanceUntil: v.optional(v.number()),
    heistTimerUntil: v.optional(v.number()),
    jailImmunityCount: v.optional(v.number()),
    objectivesDay: v.optional(v.string()),
    assassinationKills: v.optional(v.number()),
    assassinationProfit: v.optional(v.number()),
    assassinationTarget: v.optional(v.any()),
    assassinationCooldownUntil: v.optional(v.number()),
    // ═══ HEIST, EMPIRE, PRISON BUST, PROMO ═══
    heistsTotal: v.optional(v.number()),
    heistsSuccess: v.optional(v.number()),
    heistsFailed: v.optional(v.number()),
    heistProfit: v.optional(v.number()),
    lastHeistAt: v.optional(v.number()),
    empireProgress: v.optional(v.any()),
    empireValue: v.optional(v.number()),
    lastEmpirePayout: v.optional(v.number()),
    empireSoldAt: v.optional(v.number()),
    missionBoard: v.optional(v.any()),
    missionWave: v.optional(v.number()),
    missionWavesCleared: v.optional(v.number()),
    missionActions: v.optional(v.any()),
    missionStarted: v.optional(v.any()),
    missionCooldowns: v.optional(v.any()),
    missionAttempted: v.optional(v.number()),
    missionCompleted: v.optional(v.number()),
    missionFailed: v.optional(v.number()),
    missionProfit: v.optional(v.number()),
    missionTypeCounts: v.optional(v.any()),
    bustStats: v.optional(v.any()),
    bustReward: v.optional(v.number()),
    prisonBailoutAt: v.optional(v.number()),
    redeemedPromos: v.optional(v.array(v.string())),
    promoHistory: v.optional(v.array(v.object({
      code: v.string(),
      message: v.string(),
      rewardLabel: v.string(),
      at: v.number(),
    }))),
    currentPromo: v.optional(v.string()),
    // ═══ WORLD SYSTEMS (bank, safe, stocks, supply, estate) ═══
    interestBank: v.optional(v.number()),
    swissBank: v.optional(v.number()),
    lastInterestApplied: v.optional(v.number()),
    bankStats: v.optional(v.any()),
    transferHistory: v.optional(v.any()),
    swissLimit: v.optional(v.number()),
    worldState: v.optional(v.any()),
    worldRentAt: v.optional(v.number()),
    // ═══ NEW FRONTIERS (business, retention, cosmetics) ═══
    loginStreak: v.optional(v.number()),
    lastLoginDay: v.optional(v.string()),
    lastPlaytimeTick: v.optional(v.number()),
    lastIdleClaimAt: v.optional(v.number()),
    lastReturnBonusAt: v.optional(v.number()),
    fuelStock: v.optional(v.number()),
    ownedCosmetics: v.optional(v.array(v.any())), // { id, category, name, icon, acquiredAt }
    vipTier: v.optional(v.string()),
    adFreeUntil: v.optional(v.number()),
    starterPacksClaimed: v.optional(v.array(v.string())),
    badges: v.optional(v.array(v.any())), // { id, name, icon, at }
    claimedFlashDeals: v.optional(v.array(v.string())),
    totalStallSales: v.optional(v.number()),
    totalTreasuresDug: v.optional(v.number()),
    totalRaceBets: v.optional(v.number()),
    casinoHostProfit: v.optional(v.number()),
    totalDividends: v.optional(v.number()),
    xpMilestoneClaimed: v.optional(v.number()),
    totalIdleEarned: v.optional(v.number()),
    totalPlaytimeRewards: v.optional(v.number()),
    totalReturnBonuses: v.optional(v.number()),
    bossDamageDone: v.optional(v.number()),
    playerOfWeekWins: v.optional(v.number()),
    bugBountiesClaimed: v.optional(v.number()),
    fuelProfit: v.optional(v.number()),
    escrowTradesDone: v.optional(v.number()),
    stallItemsSold: v.optional(v.number()),
  })
    .index("by_location", ["location"])
    .index("by_family", ["familyId"])
    .index("by_nickname", ["nickname"])
    .index("email", ["email"])
    .index("by_username", ["username"])
    .index("by_referral_code", ["referralCode"]),

  // ===== Convex Auth tables (required by @convex-dev/auth) =====
  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId"]),

  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("userIdAndProvider", ["userId", "provider"])
    .index("providerAndAccountId", ["provider", "providerAccountId"]),

  authRefreshTokens: defineTable({
    sessionId: v.id("authSessions"),
    expirationTime: v.number(),
    firstUsedTime: v.optional(v.number()),
    parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
  })
    .index("sessionId", ["sessionId"])
    .index("sessionIdAndParentRefreshTokenId", ["sessionId", "parentRefreshTokenId"]),

  authVerificationCodes: defineTable({
    accountId: v.id("authAccounts"),
    provider: v.string(),
    code: v.string(),
    expirationTime: v.number(),
    target: v.string(),
    used: v.boolean(),
  }).index("by_target", ["target"]),

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
    infamy: v.number(),
    territories: v.array(v.string()),
    electionActive: v.boolean(),
    electionEndAt: v.number(),
    electionCandidateIds: v.array(v.id("users")),
    allianceId: v.optional(v.string()),
    warTargetId: v.optional(v.id("families")),
    warStartedAt: v.optional(v.number()),
  })
    .index("by_leader", ["leaderId"])
    .index("by_level", ["level"]),

  vehicles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    speed: v.number(),
    storage: v.number(),
    armored: v.boolean(),
    stolen: v.boolean(),
    purchasePrice: v.number(),
    neon: v.optional(v.boolean()),
    ultraNeon: v.optional(v.boolean()),
    neonColor: v.optional(v.string()),
    damage: v.optional(v.number()),
    rarity: v.optional(v.string()),
    forSale: v.optional(v.boolean()),
    salePrice: v.optional(v.number()),
    isWreck: v.optional(v.boolean()),
    desc: v.optional(v.string()),
  }).index("by_user", ["userId"]),

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
    winnerId: v.optional(v.id("users")),
    moneyStolen: v.number(),
    timestamp: v.number(),
  })
    .index("by_attacker", ["attackerId"])
    .index("by_defender", ["defenderId"])
    .index("by_timestamp", ["timestamp"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    read: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
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
    .index("by_sender", ["senderId"]),

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
    .index("by_status", ["status"]),

  tournaments: defineTable({
    name: v.string(),
    entryFee: v.number(),
    prize: v.number(),
    participants: v.array(v.id("users")),
    status: v.string(),
    winnerId: v.optional(v.id("users")),
    startTime: v.number(),
    endTime: v.number(),
  }),

  stocks: defineTable({
    name: v.string(),
    symbol: v.string(),
    price: v.number(),
    change: v.number(),
    history: v.optional(v.array(v.number())),
  }),

  playerStocks: defineTable({
    userId: v.id("users"),
    stockId: v.id("stocks"),
    shares: v.number(),
    buyPrice: v.number(),
  }).index("by_user", ["userId"]),

  properties: defineTable({
    name: v.string(),
    type: v.string(),
    city: v.string(),
    price: v.number(),
    income: v.number(),
    ownerId: v.optional(v.id("users")),
  }).index("by_owner", ["ownerId"]).index("by_city", ["city"]),

  businesses: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    type: v.string(),
    city: v.string(),
    price: v.number(),
    income: v.number(),
    level: v.number(),
  }).index("by_owner", ["ownerId"]),

  items: defineTable({
    name: v.string(),
    type: v.string(),
    attack: v.number(),
    defense: v.number(),
    price: v.number(),
    rarity: v.string(),
  })
    .index("by_type", ["type"])
    .index("by_rarity", ["rarity"]),

  playerItems: defineTable({
    userId: v.id("users"),
    itemId: v.id("items"),
    equipped: v.boolean(),
  }).index("by_user", ["userId"]),

  inventory: defineTable({
    userId: v.id("users"),
    itemId: v.string(),
    name: v.string(),
    type: v.string(),
    equipped: v.boolean(),
    quantity: v.number(),
    attack: v.optional(v.number()),
    defense: v.optional(v.number()),
    rarity: v.optional(v.string()),
    price: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  playerAchievements: defineTable({
    playerId: v.id("users"),
    achievementId: v.string(),
    unlockedAt: v.number(),
  }).index("by_player", ["playerId"]),

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
    location: v.string(),
    storyline: v.optional(v.string()),
    storyOrder: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    xpReward: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_level", ["levelRequired"])
    .index("by_storyline", ["storyline"]),

  playerMissions: defineTable({
    userId: v.id("users"),
    missionId: v.id("missions"),
    progress: v.number(),
    completed: v.boolean(),
    claimed: v.boolean(),
    startedAt: v.number(),
    expiresAt: v.optional(v.number()),
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
  }).index("by_family", ["familyId"]),

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

  // Player-to-player Quicktrade listings (points/cash). Currency is held in
  // escrow on the seller's account for the lifetime of the offer.
  quicktradeOffers: defineTable({
    sellerId: v.id("users"),
    sellerName: v.string(),
    kind: v.string(), // "points" | "cash"
    amount: v.number(), // quantity offered of `kind`
    unitPrice: v.number(), // price per unit in the other currency
    total: v.number(), // amount * unitPrice (other currency)
    anonymous: v.boolean(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["active", "createdAt"])
    .index("by_seller", ["sellerId"]),

  // Organized-crime squads: a host opens a job, up to 3 players fill the crew,
  // the host starts and the crew splits the take on success.
  ocTeams: defineTable({
    hostId: v.id("users"),
    hostName: v.string(),
    memberIds: v.array(v.id("users")),
    names: v.array(v.string()),
    jobId: v.string(),
    jobName: v.string(),
    jobIcon: v.string(),
    levelReq: v.number(),
    cost: v.number(),
    rewardMin: v.number(),
    rewardMax: v.number(),
    successBase: v.number(),
    started: v.boolean(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    // Crew lobby extras: rolling chat log + per-member readiness + last ping.
    chat: v.optional(
      v.array(
        v.object({
          fromId: v.id("users"),
          fromName: v.string(),
          text: v.string(),
          system: v.optional(v.boolean()),
          at: v.number(),
        }),
      ),
    ),
    memberReadyIds: v.optional(v.array(v.id("users"))),
    lastPingAt: v.optional(v.number()),
    // Per-member last-activity stamps (aligned to memberIds) for idle sweeps.
    seen: v.optional(v.array(v.number())),
    // Host-armed auto-launch: launchAt = epoch ms when the job fires itself.
    autoLaunch: v.optional(v.boolean()),
    launchAt: v.optional(v.number()),
    // Role phase: each member picks a specialist role; synergy with the job's
    // favored roles boosts the crew's success odds.
    roles: v.optional(v.array(v.string())),
    jobPhase: v.optional(v.string()), // "prep" | "execute" | "done"
    executesAt: v.optional(v.number()),
    jobResult: v.optional(
      v.object({
        win: v.boolean(),
        rewardEach: v.number(),
        xpEach: v.number(),
        jobName: v.string(),
        at: v.number(),
      }),
    ),
  })
    .index("by_created", ["createdAt"]),

  // Witness statements — generated when someone is murdered. The holder can
  // list theirs for sale; a buyer pays to learn who killed the victim.
  witnessStatements: defineTable({
    killerId: v.id("users"),
    killerName: v.string(),
    victimId: v.id("users"),
    victimName: v.string(),
    code: v.string(),
    text: v.string(),
    ownerId: v.id("users"),
    listed: v.boolean(),
    price: v.number(),
    createdAt: v.number(),
    soldAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_victim", ["victimName"])
    .index("by_listed", ["listed", "createdAt"]),

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

  territories: defineTable({
    name: v.string(),
    city: v.string(),
    ownerId: v.optional(v.id("families")),
    income: v.number(),
    defenseLevel: v.number(),
    contestedBy: v.optional(v.id("families")),
    lastAttackedAt: v.number(),
  })
    .index("by_city", ["city"])
    .index("by_owner", ["ownerId"]),

  contracts: defineTable({
    posterId: v.id("users"),
    targetId: v.id("users"),
    reward: v.number(),
    status: v.string(),
    acceptedBy: v.optional(v.id("users")),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_target", ["targetId"]),

  bodyguards: defineTable({
    employerId: v.id("users"),
    guardId: v.id("users"),
    payPerDay: v.number(),
    active: v.boolean(),
    hiredAt: v.number(),
  })
    .index("by_employer", ["employerId"])
    .index("by_guard", ["guardId"]),

  ambushes: defineTable({
    ambusherId: v.id("users"),
    location: v.string(),
    reward: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_location", ["location"]),

  combatLogs: defineTable({
    attackerId: v.id("users"),
    defenderId: v.id("users"),
    type: v.string(),
    attackerDamage: v.number(),
    defenderDamage: v.number(),
    winnerId: v.optional(v.id("users")),
    moneyStolen: v.number(),
    location: v.string(),
    timestamp: v.number(),
  })
    .index("by_attacker", ["attackerId"])
    .index("by_defender", ["defenderId"])
    .index("by_timestamp", ["timestamp"]),

  familyWars: defineTable({
    attackerFamilyId: v.id("families"),
    defenderFamilyId: v.id("families"),
    status: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    attackerKills: v.number(),
    defenderKills: v.number(),
    winnerId: v.optional(v.id("families")),
  }).index("by_status", ["status"]),

  familyAlliances: defineTable({
    family1Id: v.id("families"),
    family2Id: v.id("families"),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_family1", ["family1Id"])
    .index("by_family2", ["family2Id"]),

  rivalries: defineTable({
    player1Id: v.id("users"),
    player2Id: v.id("users"),
    p1Kills: v.number(),
    p2Kills: v.number(),
    startedAt: v.number(),
    active: v.boolean(),
  })
    .index("by_player1", ["player1Id"])
    .index("by_player2", ["player2Id"]),

  gifts: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    type: v.string(),
    amount: v.number(),
    itemId: v.optional(v.id("items")),
    message: v.string(),
    timestamp: v.number(),
    claimed: v.boolean(),
  }).index("by_receiver", ["receiverId"]),

  hitLists: defineTable({
    posterId: v.id("users"),
    targetId: v.id("users"),
    reward: v.number(),
    status: v.string(),
    claimedBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  pokerGames: defineTable({
    creatorId: v.id("users"),
    players: v.array(v.id("users")),
    pot: v.number(),
    blind: v.number(),
    status: v.string(),
    currentRound: v.number(),
    communityCards: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  dogFights: defineTable({
    player1Id: v.id("users"),
    player2Id: v.id("users"),
    bet: v.number(),
    winnerId: v.optional(v.id("users")),
    dog1Name: v.string(),
    dog2Name: v.string(),
    dog1Stats: v.number(),
    dog2Stats: v.number(),
    status: v.string(),
    timestamp: v.number(),
  }).index("by_status", ["status"]),

  streetRaces: defineTable({
    creatorId: v.id("users"),
    participants: v.array(v.id("users")),
    entryFee: v.number(),
    prizePool: v.number(),
    status: v.string(),
    winnerId: v.optional(v.id("users")),
    track: v.string(),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  familyElections: defineTable({
    familyId: v.id("families"),
    candidates: v.array(v.id("users")),
    votes: v.array(v.object({ voterId: v.id("users"), candidateId: v.id("users") })),
    status: v.string(),
    startedAt: v.number(),
    endsAt: v.number(),
  }).index("by_family", ["familyId"]),

  ambassadors: defineTable({
    familyId: v.id("families"),
    ambassadorId: v.id("users"),
    targetFamilyId: v.id("families"),
    message: v.string(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_family", ["familyId"])
    .index("by_target", ["targetFamilyId"]),

  loans: defineTable({
    borrowerId: v.id("users"),
    amount: v.number(),
    interest: v.number(),
    dueAt: v.number(),
    paid: v.boolean(),
    lenderId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["borrowerId"]).index("by_active", ["paid"]),

  completedMissions: defineTable({
    playerId: v.id("users"),
    missionId: v.string(),
    completedAt: v.number(),
    reward: v.number(),
  })
    .index("by_player", ["playerId"])
    .index("by_player_mission", ["playerId", "missionId"]),

  aiGangs: defineTable({
    name: v.string(),
    strength: v.number(),
    territory: v.string(),
    income: v.number(),
    level: v.number(),
    lastAttack: v.number(),
    defeated: v.number(),
  }),
  districts: defineTable({
    name: v.string(),
    city: v.string(),
    price: v.number(),
    income: v.number(),
    security: v.number(),
    ownerId: v.optional(v.id("users")),
  }).index("by_owner", ["ownerId"]),
  auctions: defineTable({
    itemName: v.string(),
    description: v.string(),
    startingBid: v.number(),
    currentBid: v.number(),
    highestBidder: v.optional(v.id("users")),
    endsAt: v.number(),
    rarity: v.string(),
  }),
  headlines: defineTable({
    title: v.string(),
    playerName: v.string(),
    crimeType: v.string(),
    timestamp: v.number(),
  }),
  radioMessages: defineTable({
    senderId: v.id("users"),
    senderName: v.string(),
    message: v.string(),
    timestamp: v.number(),
  }),
  timeCapsules: defineTable({
    userId: v.id("users"),
    itemId: v.id("inventory"),
    itemName: v.string(),
    buriedAt: v.number(),
    diggableAt: v.number(),
    dug: v.boolean(),
  }),
  gameUpdates: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),
    icon: v.optional(v.string()),
    timestamp: v.number(),
    pinned: v.optional(v.boolean()),
  }),
  lastManStanding: defineTable({
    seasonId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    totalPlayers: v.number(),
    eliminatedPlayers: v.number(),
    currentRound: v.number(),
    totalRounds: v.number(),
    prizePool: v.number(),
    winnerId: v.optional(v.id("users")),
  }),
  lmsParticipants: defineTable({
    userId: v.id("users"),
    nickname: v.string(),
    level: v.number(),
    alive: v.boolean(),
    kills: v.number(),
    deaths: v.number(),
    score: v.number(),
    eliminationRound: v.optional(v.number()),
    joinedAt: v.number(),
    lastKillAt: v.optional(v.number()),
    bountyPlaced: v.number(),
    streak: v.number(),
    title: v.optional(v.string()),
  }).index("by_active", ["alive"]).index("by_user", ["userId"]),
  lmsEvents: defineTable({
    seasonId: v.string(),
    eventType: v.string(),
    message: v.string(),
    playerId: v.optional(v.id("users")),
    playerName: v.optional(v.string()),
    targetId: v.optional(v.id("users")),
    targetName: v.optional(v.string()),
    timestamp: v.number(),
    round: v.number(),
  }).index("by_season", ["seasonId"]).index("by_time", ["timestamp"]),
  referrals: defineTable({
    referrerId: v.id("users"),
    referredId: v.id("users"),
    code: v.string(),
    createdAt: v.number(),
  }).index("by_referrer", ["referrerId"]).index("by_referred", ["referredId"]),
  crews: defineTable({
    name: v.string(),
    tag: v.string(),
    description: v.string(),
    leaderId: v.id("users"),
    level: v.number(),
    experience: v.number(),
    treasury: v.number(),
    memberCount: v.number(),
    maxMembers: v.number(),
    territory: v.string(),
    power: v.number(),
    createdAt: v.number(),
  }).index("by_leader", ["leaderId"]),
  prisonBots: defineTable({
    name: v.string(),
    sentence: v.number(),
    reward: v.number(),
    active: v.boolean(),
  }).index("by_active", ["active"]),
  promoCodes: defineTable({
    code: v.string(),
    message: v.string(),
    rewardLabel: v.string(),
    expiresAt: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    active: v.boolean(),
    claimed: v.number(),
    perks: v.optional(v.any()),
  }).index("by_code", ["code"]),
  drugTrades: defineTable({
    userId: v.id("users"),
    cannabisStock: v.number(),
    thcContent: v.number(),
    pricePerGram: v.number(),
    demand: v.number(),
    totalDelivered: v.number(),
    totalRevenue: v.number(),
    marketingBudget: v.number(),
    marketingChannels: v.any(),
    activeCampaigns: v.any(),
    contracts: v.any(),
    customerRating: v.number(),
    totalReviews: v.number(),
    lastRestock: v.number(),
    lastDelivery: v.number(),
    crimeStock: v.number(),
    lastCrimeDrugTime: v.number(),
    originalThc: v.number(),
    drugType: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  qsOffers: defineTable({
    userId: v.id("users"),
    offerId: v.string(),
    type: v.string(),
    drug: v.string(),
    quantity: v.number(),
    price: v.number(),
    thcContent: v.number(),
    expiresAt: v.number(),
    accepted: v.boolean(),
    day: v.string(),
    rarity: v.optional(v.string()),
    name: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_user_day", ["userId", "day"]),

  // ═══════════ CASINO OWNERSHIP ═══════════
  casinos: defineTable({
    gameId: v.string(), // blackjack | dice | roulette | racetrack | videopoker
    name: v.string(),
    icon: v.string(),
    ownerId: v.optional(v.id("users")),
    ownerName: v.optional(v.string()),
    city: v.string(),
    purchasePrice: v.number(),
    casinoBank: v.number(),
    totalRevenue: v.number(),
    playersServed: v.number(),
    lostByUserId: v.optional(v.id("users")),
    lostByName: v.optional(v.string()),
    lostAt: v.optional(v.number()),
    boughtBackPrice: v.optional(v.number()),
    seized: v.boolean(),
    createdAt: v.number(),
  }).index("by_game", ["gameId"]),

  casinoRounds: defineTable({
    userId: v.id("users"),
    gameId: v.string(),
    wager: v.number(),
    payout: v.number(),
    net: v.number(), // payout - wager (negative = player lost -> casino bank gained)
    currency: v.string(), // "cash" | "coins"
    timestamp: v.number(),
  }).index("by_game", ["gameId"]),

  casinoEvents: defineTable({
    gameId: v.string(),
    casinoName: v.string(),
    type: v.string(), // "seized" | "bought_back" | "purchased"
    message: v.string(),
    timestamp: v.number(),
  }).index("by_time", ["timestamp"]),

  // ═══════════ HOSPITAL ═══════════
  hospitalVisits: defineTable({
    userId: v.id("users"),
    playerName: v.string(),
    condition: v.string(),
    conditionIcon: v.string(),
    severity: v.string(), // critical | serious | moderate
    emergencyType: v.string(), // ambulance | helicopter | medivac
    admittedAt: v.number(),
    dischargedAt: v.optional(v.number()),
    invoice: v.number(),
    paid: v.boolean(),
  }).index("by_user", ["userId"]).index("by_active", ["paid"]),

  // ═══════════ LIVE GAME CONTROL ═══════════
  // Single-document config store (key: "main") — every admin-panel/console
  // change lands here and every connected player's UI + reward math reacts
  // instantly through reactive Convex queries. No redeploys, no new links.
  gameConfig: defineTable({
    key: v.string(),
    xpMultiplier: v.number(),
    xpMultiplierUntil: v.number(),
    cashMultiplier: v.number(),
    cashMultiplierUntil: v.number(),
    crimeSuccessBonus: v.number(),
    energyRegenPerMinute: v.number(),
    maintenanceMode: v.boolean(),
    maintenanceMessage: v.string(),
    ghostMode: v.boolean(),
    lottoJackpot: v.number(),
    superBoostEnabled: v.boolean(),
    superBoostOverrideUntil: v.optional(v.number()),
    // ═══ NEW FRONTIERS live knobs ═══
    blackFridayUntil: v.optional(v.number()),
    lockdownUntil: v.optional(v.number()),
    gasPrice: v.optional(v.number()),
    gasUpdatedAt: v.optional(v.number()),
    lotteryRolloverPct: v.optional(v.number()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["key"]),
  announcements: defineTable({
    text: v.string(),
    emoji: v.string(),
    color: v.string(),
    createdBy: v.id("users"),
    createdByName: v.string(),
    expiresAt: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["active"]),
  // Season-store per-item stock (fresh every season via seasonStoreReset admin action)
  seasonStoreStock: defineTable({
    season: v.string(),
    itemId: v.string(),
    stock: v.number(),
  }).index("by_season_item", ["season", "itemId"]).index("by_season", ["season"]),

  // ═══════════ NEW FRONTIERS: ECONOMY ═══════════
  // Market stalls — players rent a stall, list inventory items for sale while offline.
  vendorStalls: defineTable({
    ownerId: v.id("users"),
    ownerName: v.string(),
    city: v.string(),
    stallName: v.string(),
    itemName: v.string(),
    itemId: v.string(), // inventory row id (kept in escrow while listed)
    rarity: v.string(),
    price: v.number(),
    qty: v.number(),
    earnings: v.number(),
    rentPaidUntil: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["active", "city"]).index("by_owner", ["ownerId"]),

  // Player-to-player escrow trades: cash ⇄ points ⇄ items. Offerer's side is
  // held in escrow until accepted or cancelled.
  escrowTrades: defineTable({
    offererId: v.id("users"),
    offererName: v.string(),
    offeredType: v.string(), // "cash" | "points" | "item"
    offeredAmount: v.number(), // cash/points value; item: 1
    offeredItemId: v.optional(v.string()),
    offeredItemName: v.optional(v.string()),
    requestedType: v.string(), // "cash" | "points" | "item"
    requestedAmount: v.number(),
    requestedItemId: v.optional(v.string()),
    requestedItemName: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["active", "createdAt"]).index("by_offerer", ["offererId"]),

  // Shares in player-owned businesses — buy/sell, dividends every 24h.
  businessShares: defineTable({
    businessId: v.id("businesses"),
    userId: v.id("users"),
    shares: v.number(),
    boughtAt: v.number(),
  }).index("by_business", ["businessId"]).index("by_user", ["userId"]),

  // Player-to-player gambling debts with interest.
  gamblingDebts: defineTable({
    creditorId: v.id("users"),
    creditorName: v.string(),
    debtorId: v.id("users"),
    debtorName: v.string(),
    amount: v.number(),
    interestPct: v.number(), // per 24h
    dueAt: v.number(),
    paid: v.boolean(),
    createdAt: v.number(),
  }).index("by_debtor", ["debtorId"]).index("by_creditor", ["creditorId"]).index("by_active", ["paid"]),

  // Underground player-hosted casino tables — host takes a rake on every hand.
  casinoTables: defineTable({
    hostId: v.id("users"),
    hostName: v.string(),
    game: v.string(), // "blackjack" | "dice"
    minBet: v.number(),
    maxBet: v.number(),
    rakePct: v.number(),
    city: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["active"]).index("by_host", ["hostId"]),

  // Player races with open betting — creator hosts, racers join, everyone bets.
  playerRaces: defineTable({
    creatorId: v.id("users"),
    creatorName: v.string(),
    track: v.string(),
    racerIds: v.array(v.id("users")),
    racerNames: v.array(v.string()),
    entryFee: v.number(),
    prizePool: v.number(),
    status: v.string(), // "open" | "racing" | "finished" | "cancelled"
    winnerId: v.optional(v.id("users")),
    winnerName: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
  }).index("by_status", ["status"]).index("by_creator", ["creatorId"]),

  raceBets: defineTable({
    raceId: v.id("playerRaces"),
    userId: v.id("users"),
    targetId: v.id("users"),
    targetName: v.string(),
    amount: v.number(),
    odds: v.number(),
    paidOut: v.boolean(),
    createdAt: v.number(),
  }).index("by_race", ["raceId"]).index("by_user", ["userId"]),

  // Treasure hunting — buy a map, dig for loot, risk an ambush.
  treasureMaps: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    rarity: v.string(), // common | rare | epic | legendary
    cost: v.number(),
    region: v.string(),
    boughtAt: v.number(),
    dugAt: v.optional(v.number()),
    dug: v.boolean(),
  }).index("by_owner", ["ownerId"]),

  // ═══════════ NEW FRONTIERS: EVENTS & FAME ═══════════
  // City boss invasions — a roaming boss players can attack for rewards.
  bossInvasions: defineTable({
    bossId: v.string(),
    name: v.string(),
    icon: v.string(),
    hp: v.number(),
    maxHp: v.number(),
    attack: v.number(),
    rewardMin: v.number(),
    rewardMax: v.number(),
    pointsReward: v.number(),
    city: v.string(),
    active: v.boolean(),
    startedAt: v.number(),
    expiresAt: v.number(),
    lastHitAt: v.optional(v.number()),
  }).index("by_active", ["active"]),

  hallOfFame: defineTable({
    category: v.string(), // networth | level | kills | crimes | bettor | boss
    rank: v.number(),
    playerId: v.id("users"),
    playerName: v.string(),
    value: v.number(),
    season: v.string(),
    updatedAt: v.number(),
  }).index("by_category", ["category", "rank"]),

  playerOfWeek: defineTable({
    playerId: v.id("users"),
    playerName: v.string(),
    weekStart: v.string(),
    votes: v.number(),
    resolved: v.boolean(),
    rewardGiven: v.boolean(),
    updatedAt: v.number(),
  }).index("by_week", ["weekStart"]),

  povVotes: defineTable({
    voterId: v.id("users"),
    candidateId: v.id("users"),
    weekStart: v.string(),
    createdAt: v.number(),
  }).index("by_voter_week", ["voterId", "weekStart"]),

  // ═══════════ NEW FRONTIERS: COMMUNITY ═══════════
  bugReports: defineTable({
    playerId: v.id("users"),
    playerName: v.string(),
    title: v.string(),
    body: v.string(),
    status: v.string(), // open | confirmed | resolved | rewarded
    reward: v.number(),
    createdAt: v.number(),
  }).index("by_status", ["status", "createdAt"]),

  feedbackPosts: defineTable({
    playerId: v.id("users"),
    playerName: v.string(),
    title: v.string(),
    body: v.string(),
    votes: v.number(),
    status: v.string(), // open | planned | shipped | declined
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  feedbackVotes: defineTable({
    playerId: v.id("users"),
    postId: v.id("feedbackPosts"),
    createdAt: v.number(),
  }).index("by_player", ["playerId"]).index("by_post", ["postId"]),

  // Limited-time point deals refreshed by the admin.
  flashDeals: defineTable({
    title: v.string(),
    icon: v.string(),
    desc: v.string(),
    cost: v.number(), // points
    rewardLabel: v.string(),
    rewardType: v.string(), // cash | points | bullets | scrap | perk | cosmetic
    rewardValue: v.number(),
    expiresAt: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["active", "expiresAt"]),
}, {
  schemaValidation: false,
});

export default schema;

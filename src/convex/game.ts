import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ===== HELPER: find current auth user =====
async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

// ===== PLAYER QUERIES =====

export const getPlayer = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    // Only return fully registered game players.
    // Auth-only rows lack required game fields and would fail client validation.
    if (!player.nickname || player.money === undefined) return null;
    return player;
  },
});

export const getPlayerById = query({
  args: { playerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.playerId);
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players
      .sort((a, b) => b.level - a.level || b.experience - a.experience)
      .slice(0, 50);
  },
});

export const getPlayersInLocation = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .collect();
  },
});

// ===== PLAYER MUTATIONS =====

export const checkNickname = query({
  args: { nickname: v.string() },
  handler: async (ctx, args) => {
    const taken = await ctx.db
      .query("users")
      .withIndex("by_nickname", (q) => q.eq("nickname", args.nickname))
      .unique();
    return { taken: !!taken };
  },
});

const classStats: Record<string, { attack: number; defense: number; life: number; money: number }>= {
  hitter:    { attack: 18, defense: 6,  life: 80,  money: 800 },
  thief:     { attack: 10, defense: 8,  life: 90,  money: 1500 },
  enforcer:  { attack: 12, defense: 16, life: 120, money: 700 },
  hustler:   { attack: 8,  defense: 10, life: 90,  money: 2500 },
};

export const registerPlayer = mutation({
  args: {
    nickname: v.string(),
    playerClass: v.union(
      v.literal("hitter"),
      v.literal("thief"),
      v.literal("enforcer"),
      v.literal("hustler"),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await getCurrentUser(ctx);
    if (!existing) throw new Error("Not authenticated");
    if (existing.nickname) throw new Error("Already registered");

    // Check nickname uniqueness
    const nicknameTaken = await ctx.db
      .query("users")
      .withIndex("by_nickname", (q) => q.eq("nickname", args.nickname))
      .unique();
    if (nicknameTaken) throw new Error("Nickname already taken!");

    const stats = classStats[args.playerClass];

    await ctx.db.patch(existing._id, {
      nickname: args.nickname,
      money: stats.money,
      bank: 0,
      points: 0,
      life: stats.life,
      maxLife: stats.life,
      defense: stats.defense,
      attack: stats.attack,
      level: 1,
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
      registeredAt: Date.now(),
      lastRegenAt: Date.now(),
      wantedLevel: 0,
      reputation: 0,
      reputationAlignment: "neutral",
      prestige: 0,
      prestigeMultiplier: 1,
      levelUpPending: false,
      skillPoints: 0,
      playerClass: args.playerClass,
      prisonJob: undefined,
      prisonGang: undefined,
      cellLevel: 1,
      solitaryTime: 0,
      contraband: 0,
      prisonCurrency: 0,
      paroleEligible: false,
      totalPrisonEscapes: 0,
      totalPrisonJobs: 0,
      activeTitle: undefined,
      totalEarned: stats.money,
      highestLevel: 1,
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
      isBanned: false,
      lastCrimeAt: 0,
      avatarId: undefined,
      bio: undefined,
      profilePictureUrl: undefined,
      activeRole: undefined,
    });
  },
});

export const changeLocation = mutation({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.location === args.location) throw new Error("Already there!");

    await ctx.db.patch(player._id, {
      location: args.location,
    });
  },
});

// ===== CRIME MUTATIONS =====

export const commitCrime = mutation({
  args: {
    type: v.union(
      v.literal("car_theft"),
      v.literal("burglarize"),
      v.literal("rob_player"),
    ),
    targetId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    let moneyEarned = 0;
    let pointsEarned = 0;
    let damageTaken = 0;
    // 60% success rate, 40% fail
    const success = Math.random() < 0.6;

    switch (args.type) {
      case "car_theft":
        if (success) {
          moneyEarned = Math.floor(Math.random() * 5000) + 500;
          pointsEarned = 5;
        } else {
          damageTaken = Math.floor(Math.random() * 20) + 5;
        }
        break;
      case "burglarize":
        if (success) {
          moneyEarned = Math.floor(Math.random() * 3000) + 200;
          pointsEarned = 3;
        } else {
          damageTaken = Math.floor(Math.random() * 15) + 5;
        }
        break;
      case "rob_player":
        if (!args.targetId) throw new Error("Target required");
        const target = await ctx.db.get(args.targetId);
        if (!target) throw new Error("Target not found");
        if (success) {
          moneyEarned = Math.floor(target.money * 0.1);
          pointsEarned = 8;
        } else {
          damageTaken = Math.floor(Math.random() * 30) + 10;
        }
        break;
    }

    // Check for arrest
    const arrested = !success && Math.random() > 0.5;

    await ctx.db.insert("crimes", {
      userId: player._id,
      type: args.type,
      target: args.type === "rob_player" ? (args.targetId ?? "unknown") : "environment",
      success,
      moneyEarned,
      pointsEarned,
      damageTaken,
      timestamp: Date.now(),
    });

    const newLife = Math.max(0, player.life - damageTaken);

    const xpGain = success ? 10 : 3;
    const newXP = (player.experience ?? 0) + xpGain;
    const xpNeeded = (player.level ?? 1) * 100;
    const levelUpNow = newXP >= xpNeeded && !arrested;
    const newWanted = Math.min(10, (player.wantedLevel ?? 0) + (success ? 1 : 0));

    await ctx.db.patch(player._id, {
      money: success ? player.money + moneyEarned : player.money,
      points: player.points + pointsEarned,
      life: newLife,
      totalCrimes: player.totalCrimes + 1,
      experience: levelUpNow ? 0 : newXP,
      levelUpPending: levelUpNow ? true : player.levelUpPending,
      inPrison: arrested,
      prisonTime: arrested ? 15000 : player.prisonTime,
      wantedLevel: arrested ? 0 : newWanted,
    });

    if (arrested) {
      await ctx.db.insert("notifications", {
        userId: player._id,
        type: "prison",
        message: "You were arrested during a crime!",
        read: false,
        timestamp: Date.now(),
      });
    }

    return { success, moneyEarned, pointsEarned, damageTaken, arrested };
  },
});

// ===== BANK =====

export const deposit = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (args.amount > player.money) throw new Error("Not enough cash!");
    if (args.amount <= 0) throw new Error("Invalid amount!");

    await ctx.db.patch(player._id, {
      money: player.money - args.amount,
      bank: player.bank + args.amount,
    });
  },
});

export const withdraw = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (args.amount > player.bank) throw new Error("Not enough in bank!");
    if (args.amount <= 0) throw new Error("Invalid amount!");

    await ctx.db.patch(player._id, {
      money: player.money + args.amount,
      bank: player.bank - args.amount,
    });
  },
});

// ===== FIGHT CLUB =====

export const fightPlayer = mutation({
  args: { defenderId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const attacker = await getCurrentUser(ctx);
    if (!attacker) throw new Error("Player not found");
    if (attacker.isDead) throw new Error("You are dead!");
    if (attacker.inPrison) throw new Error("You are in prison!");
    if (attacker._id === args.defenderId) throw new Error("Can't fight yourself!");

    const defender = await ctx.db.get(args.defenderId);
    if (!defender) throw new Error("Defender not found");

    const attackerDmg = Math.floor(
      attacker.attack * (0.8 + Math.random() * 0.4) -
        defender.defense * 0.3,
    );
    const defenderDmg = Math.floor(
      defender.attack * (0.8 + Math.random() * 0.4) -
        attacker.defense * 0.3,
    );

    const aDmg = Math.max(1, attackerDmg);
    const dDmg = Math.max(1, defenderDmg);

    const attackerWins = aDmg > dDmg;
    const winnerId = attackerWins ? attacker._id : defender._id;
    const loser = attackerWins ? defender : attacker;
    const moneyStolen = Math.floor(loser.money * 0.05);

    await ctx.db.insert("fights", {
      attackerId: attacker._id,
      defenderId: args.defenderId,
      attackerDamage: aDmg,
      defenderDamage: dDmg,
      winnerId,
      moneyStolen,
      timestamp: Date.now(),
    });

    await ctx.db.patch(attacker._id, {
      life: Math.max(0, attacker.life - dDmg),

      totalFights: attacker.totalFights + 1,
      totalKills: attackerWins ? attacker.totalKills + 1 : attacker.totalKills,
      money: attackerWins
        ? attacker.money + moneyStolen
        : Math.max(0, attacker.money - moneyStolen),
      experience: attacker.experience + 15,
    });

    if (!attackerWins) {
      await ctx.db.patch(args.defenderId, {
        money: defender.money + moneyStolen,
        totalKills: defender.totalKills + 1,
      });
    }

    return { attackerDamage: aDmg, defenderDamage: dDmg, attackerWins, moneyStolen };
  },
});

// ===== GAMBLING =====

export const gambleDice = mutation({
  args: { amount: v.number(), guess: v.union(v.literal("high"), v.literal("low"), v.literal("seven")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (args.amount > player.money) throw new Error("Not enough money!");
    if (args.amount <= 0) throw new Error("Invalid amount!");

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    let won = false;
    let multiplier = 0;

    if (args.guess === "high" && total > 7) { won = true; multiplier = 2; }
    else if (args.guess === "low" && total < 7) { won = true; multiplier = 2; }
    else if (args.guess === "seven" && total === 7) { won = true; multiplier = 5; }

    const winnings = won ? args.amount * multiplier : 0;

    await ctx.db.patch(player._id, {
      money: won ? player.money + winnings - args.amount : player.money - args.amount,
      experience: player.experience + 2,
    });

    return { die1, die2, total, won, winnings };
  },
});

export const gambleCoinToss = mutation({
  args: { amount: v.number(), guess: v.union(v.literal("heads"), v.literal("tails")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (args.amount > player.money) throw new Error("Not enough money!");
    if (args.amount <= 0) throw new Error("Invalid amount!");

    const result = Math.random() > 0.5 ? "heads" : "tails";
    const won = args.guess === result;

    await ctx.db.patch(player._id, {
      money: won ? player.money + args.amount : player.money - args.amount,
      experience: player.experience + 2,
    });

    return { result, won };
  },
});

// ===== MESSAGES =====

export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const sender = await getCurrentUser(ctx);
    if (!sender) throw new Error("Sender not found");

    await ctx.db.insert("messages", {
      senderId: sender._id,
      receiverId: args.receiverId,
      subject: args.subject,
      body: args.body,
      read: false,
      timestamp: Date.now(),
    });
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", player._id))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const player = await getCurrentUser(ctx);
    if (!player) return 0;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", player._id))
      .collect();
    return messages.filter((m) => !m.read).length;
  },
});

// ===== NOTIFICATIONS =====

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .order("desc")
      .take(20);
  },
});

// ===== FORUM =====

export const getForumPosts = query({
  args: { forum: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forumPosts")
      .withIndex("by_forum", (q) => q.eq("forum", args.forum))
      .order("desc")
      .take(30);
  },
});

export const createForumPost = mutation({
  args: { forum: v.string(), title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    await ctx.db.insert("forumPosts", {
      authorId: player._id,
      forum: args.forum,
      title: args.title,
      body: args.body,
      replies: 0,
      lastReplyAt: Date.now(),
      pinned: false,
      timestamp: Date.now(),
    });
  },
});

// ===== FAMILY =====

export const createFamily = mutation({
  args: { name: v.string(), tag: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.familyId) throw new Error("Already in a family!");
    if (player.money < 50000) throw new Error("Need $50,000 to create a family!");

    const familyId = await ctx.db.insert("families", {
      name: args.name,
      tag: args.tag,
      description: args.description,
      leaderId: player._id,
      level: 1,
      experience: 0,
      treasury: 50000,
      memberCount: 1,
      maxMembers: 10,
      createdAt: Date.now(),
      rank: 0,
      infamy: 0,
      territories: [],
      allianceId: undefined,
      warTargetId: undefined,
      warStartedAt: undefined,
      electionActive: false,
      electionEndAt: 0,
      electionCandidateIds: [],
    });

    await ctx.db.patch(player._id, {
      familyId,
      money: player.money - 50000,
    });

    return familyId;
  },
});

export const getFamily = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const player = await getCurrentUser(ctx);
    if (!player || !player.familyId) return null;
    return await ctx.db.get(player.familyId);
  },
});

export const getFamilyMembers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player || !player.familyId) return [];
    return await ctx.db
      .query("users")
      .withIndex("by_family", (q) => q.eq("familyId", player.familyId))
      .collect();
  },
});

// ===== DAILY RAID =====

export const dailyRaid = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.isDead) throw new Error("You are dead!");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.dailyRaidUsed >= 5) throw new Error("No raids left today!");

    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");

    const success = Math.random() > 0.4;
    const moneyStolen = success ? Math.floor(target.money * 0.08) : 0;
    const damage = Math.floor(Math.random() * 20) + 10;

    await ctx.db.insert("dailyRaids", {
      userId: player._id,
      targetUserId: args.targetId,
      moneyStolen,
      damage,
      timestamp: Date.now(),
    });

    await ctx.db.patch(player._id, {
      money: success ? player.money + moneyStolen : player.money,
      dailyRaidUsed: player.dailyRaidUsed + 1,
      experience: player.experience + (success ? 20 : 5),
    });

    if (success) {
      await ctx.db.patch(args.targetId, {
        money: Math.max(0, target.money - moneyStolen),
        life: Math.max(0, target.life - damage),
      });
    }

    return { success, moneyStolen, damage };
  },
});

// ===== SHOP =====

export const getShopItems = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("items")
        .withIndex("by_type", (ix) => ix.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("items").collect();
  },
});

// ===== STATISTICS =====

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    const crimes = await ctx.db.query("crimes").collect();
    const fights = await ctx.db.query("fights").collect();
    const families = await ctx.db.query("families").collect();

    return {
      totalPlayers: players.length,
      totalCrimes: crimes.length,
      totalFights: fights.length,
      totalFamilies: families.length,
      topPlayers: players
        .sort((a, b) => b.level - a.level)
        .slice(0, 10)
        .map((p) => ({
          nickname: p.nickname ?? "Unknown",
          level: p.level,
          kills: p.totalKills,
        })),
    };
  },
});

// ===== SEARCH USERS =====

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("users").collect();
    return all
      .filter((u) =>
        u.nickname?.toLowerCase().includes(args.query.toLowerCase()),
      )
      .slice(0, 20);
  },
});

// ===== KILL =====

export const killPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");
    if (player._id === args.targetId) throw new Error("Can't kill yourself!");

    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");

    const success = player.attack > target.defense + Math.random() * 30;

    if (success) {
      await ctx.db.patch(args.targetId, {
        isDead: true,
        life: 0,
      });
      await ctx.db.patch(player._id, {
        totalKills: player.totalKills + 1,
        experience: player.experience + 50,
      });
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "death",
        message: `You were killed by ${player.nickname}!`,
        read: false,
        timestamp: Date.now(),
      });
    } else {
      const damage = Math.floor(Math.random() * 40) + 10;
      await ctx.db.patch(player._id, {
        life: Math.max(0, player.life - damage),
        experience: player.experience + 10,
      });
    }

    return { success };
  },
});

// ===== CORE GAMEPLAY FEATURES =====

// 1. Permadeath - Respawn after death
export const respawn = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!player.isDead) throw new Error("You are not dead!");

    const keepMoney = Math.floor(player.money * 0.1);
    await ctx.db.patch(player._id, {
      isDead: false,
      life: 100,
      maxLife: 100,
      money: keepMoney,
      bank: 0,
      attack: 10,
      defense: 10,
      level: 1,
      experience: 0,
      location: "New York",
      inPrison: false,
      totalDeaths: (player.totalDeaths ?? 0) + 1,
      wantedLevel: 0,
      reputation: 0,
      reputationAlignment: "neutral",
    });
    return { keptMoney: keepMoney };
  },
});

// 3. Health Regeneration
export const regenHealth = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.isDead) throw new Error("You are dead!");
    if (player.inPrison) throw new Error("You are in prison!");

    const now = Date.now();
    const lastRegen = player.lastRegenAt ?? now;
    const elapsed = now - lastRegen;
    const minutesPassed = Math.floor(elapsed / 300000); // 5 minutes per HP
    if (minutesPassed < 1) throw new Error("No health to regenerate yet!");

    const hpToHeal = Math.min(minutesPassed, (player.maxLife ?? 100) - player.life);
    if (hpToHeal <= 0) throw new Error("Already at full health!");

    await ctx.db.patch(player._id, {
      life: Math.min(player.maxLife ?? 100, player.life + hpToHeal),
      lastRegenAt: now,
    });
    return { healed: hpToHeal };
  },
});

// 4. Hospital
export const healAtHospital = mutation({
  args: { speed: v.union(v.literal("standard"), v.literal("premium")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.isDead) throw new Error("You are dead!");

    const cost = args.speed === "premium" ? 500 : 100;
    const healAmount = args.speed === "premium" ? 50 : 20;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money!");

    const healed = Math.min(healAmount, (player.maxLife ?? 100) - player.life);
    if (healed <= 0) throw new Error("Already at full health!");

    await ctx.db.patch(player._id, {
      life: player.life + healed,
      money: player.money - cost,
    });
    return { healed, cost };
  },
});

// 5. Level Up - Choose stat bonus
export const levelUp = mutation({
  args: { stat: v.union(v.literal("attack"), v.literal("defense"), v.literal("maxLife")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!player.levelUpPending) throw new Error("No level up pending!");

    const updates: Record<string, unknown> = {
      levelUpPending: false,
      level: (player.level ?? 1) + 1,
    };
    if (args.stat === "attack") updates.attack = (player.attack ?? 10) + 3;
    else if (args.stat === "defense") updates.defense = (player.defense ?? 10) + 3;
    else updates.maxLife = (player.maxLife ?? 100) + 20;

    await ctx.db.patch(player._id, updates);
    return { newLevel: (player.level ?? 1) + 1, stat: args.stat };
  },
});

// 7. Reputation System
export const updateReputation = mutation({
  args: { action: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    let repChange = 0;
    switch (args.action) {
      case "crime_success": repChange = -1; break;
      case "crime_fail": repChange = 1; break;
      case "fight_win": repChange = -1; break;
      case "fight_lose": repChange = 1; break;
      case "help_player": repChange = 5; break;
      case "kill_player": repChange = -10; break;
      default: repChange = 0;
    }

    const newRep = Math.max(-100, Math.min(100, (player.reputation ?? 0) + repChange));
    let alignment = "neutral";
    if (newRep < -30) alignment = "evil";
    else if (newRep > 30) alignment = "good";

    await ctx.db.patch(player._id, {
      reputation: newRep,
      reputationAlignment: alignment,
    });
    return { reputation: newRep, alignment };
  },
});

// 8. Wanted Level
export const getWantedLevel = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { wantedLevel: 0 };
    const player = await getCurrentUser(ctx);
    if (!player) return { wantedLevel: 0 };
    return { wantedLevel: player.wantedLevel ?? 0 };
  },
});

// ===== PRISON FEATURES =====

// 1. Bail - pay to get out of prison early
export const payBail = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const bailCost = 2000 + (player.level ?? 1) * 200;
    if ((player.money ?? 0) < bailCost) throw new Error(`Need $${bailCost.toLocaleString()} for bail!`);
    await ctx.db.patch(player._id, { inPrison: false, prisonTime: 0, money: player.money - bailCost });
    return { paid: bailCost };
  },
});

// 2. Prison Escape
export const prisonEscape = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const successChance = 0.2 + ((player.attack ?? 10) / 100) * 0.3;
    const success = Math.random() < successChance;
    if (success) {
      await ctx.db.patch(player._id, { inPrison: false, prisonTime: 0, totalPrisonEscapes: (player.totalPrisonEscapes ?? 0) + 1, experience: (player.experience ?? 0) + 30 });
    } else {
      const solitary = Math.floor(Math.random() * 3) + 1;
      await ctx.db.patch(player._id, { solitaryTime: (player.solitaryTime ?? 0) + solitary * 600000 });
    }
    return { success, solitaryAdded: success ? 0 : Math.floor(Math.random() * 3) + 1 };
  },
});

// 3. Parole Hearing
export const paroleHearing = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    if (player.solitaryTime > 0) throw new Error("Can't get parole while in solitary!");
    const goodBehavior = (player.totalCrimes ?? 0) < 20;
    if (goodBehavior) {
      const reduction = Math.floor(player.prisonTime * 0.5);
      await ctx.db.patch(player._id, { prisonTime: Math.max(0, player.prisonTime - reduction), paroleEligible: true });
      return { granted: true, reduced: reduction };
    }
    return { granted: false, reduced: 0 };
  },
});

// 4. Prison Jobs
export const prisonJob = mutation({
  args: { job: v.union(v.literal("kitchen"), v.literal("laundry"), v.literal("library"), v.literal("workshop")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const rewards: Record<string, { money: number; timeReduced: number }> = {
      kitchen: { money: 100, timeReduced: 600000 },
      laundry: { money: 75, timeReduced: 300000 },
      library: { money: 50, timeReduced: 1800000 },
      workshop: { money: 150, timeReduced: 450000 },
    };
    const r = rewards[args.job];
    await ctx.db.patch(player._id, {
      prisonJob: args.job,
      money: (player.money ?? 0) + r.money,
      prisonTime: Math.max(0, (player.prisonTime ?? 0) - r.timeReduced),
      prisonCurrency: (player.prisonCurrency ?? 0) + 5,
      totalPrisonJobs: (player.totalPrisonJobs ?? 0) + 1,
    });
    return { money: r.money, timeReduced: r.timeReduced, prisonCurrency: 5 };
  },
});

// 5. Prison Fight
export const prisonFight = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    if (!target.inPrison) throw new Error("Target not in prison!");
    const dmg = Math.floor((player.attack ?? 10) * (0.8 + Math.random() * 0.4));
    const tDmg = Math.floor((target.attack ?? 10) * (0.8 + Math.random() * 0.4));
    const won = dmg > tDmg;
    if (won) {
      await ctx.db.patch(player._id, { reputation: (player.reputation ?? 0) - 2, prisonCurrency: (player.prisonCurrency ?? 0) + 10 });
    }
    return { won, damage: dmg, taken: tDmg };
  },
});

// 6. Prison Gang
export const joinPrisonGang = mutation({
  args: { gang: v.union(v.literal("Aryan Brotherhood"), v.literal("Mexican Mafia"), v.literal("Black Guerrilla"), v.literal("Italian Mafia"), v.literal("None")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    await ctx.db.patch(player._id, { prisonGang: args.gang === "None" ? undefined : args.gang });
    return { gang: args.gang };
  },
});

// 7. Contraband
export const smuggleContraband = mutation({
  args: { type: v.union(v.literal("shank"), v.literal("phone"), v.literal("drugs"), v.literal("lockpick")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const costs: Record<string, number> = { shank: 500, phone: 300, drugs: 200, lockpick: 400 };
    const cost = costs[args.type];
    if ((player.money ?? 0) < cost) throw new Error(`Need $${cost}!`);
    const caught = Math.random() < 0.3;
    if (caught) {
      await ctx.db.patch(player._id, { money: player.money - cost, solitaryTime: (player.solitaryTime ?? 0) + 1800000 });
      return { caught: true };
    }
    await ctx.db.patch(player._id, { money: player.money - cost, contraband: (player.contraband ?? 0) + 1 });
    return { caught: false };
  },
});

// 8. Cell Upgrade
export const upgradeCell = mutation({
  args: { level: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const cost = args.level * 1000;
    if ((player.money ?? 0) < cost) throw new Error(`Need $${cost}!`);
    if (args.level <= (player.cellLevel ?? 1)) throw new Error("Already at this level!");
    await ctx.db.patch(player._id, { money: player.money - cost, cellLevel: args.level });
    return { level: args.level };
  },
});

// 9. Prison Transfer
export const prisonTransfer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("Not in prison!");
    const cost = 500;
    if ((player.money ?? 0) < cost) throw new Error(`Need $${cost}!`);
    const prisons = ["Rikers Island", "ADX Florence", "Sing Sing", "Alcatraz"];
    const newPrison = prisons[Math.floor(Math.random() * prisons.length)];
    await ctx.db.patch(player._id, { money: player.money - cost, prisonTime: Math.floor(player.prisonTime * 0.8) });
    return { prison: newPrison, timeReduced: Math.floor(player.prisonTime * 0.2) };
  },
});

// 10. Solitary
export const getPrisonStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    return {
      inPrison: player.inPrison,
      prisonTime: player.prisonTime ?? 0,
      solitaryTime: player.solitaryTime ?? 0,
      cellLevel: player.cellLevel ?? 1,
      prisonJob: player.prisonJob,
      prisonGang: player.prisonGang,
      contraband: player.contraband ?? 0,
      prisonCurrency: player.prisonCurrency ?? 0,
      paroleEligible: player.paroleEligible ?? false,
    };
  },
});

// ===== BOUNTY SYSTEM =====

export const placeBounty = mutation({
  args: { targetId: v.id("users"), reward: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.money ?? 0) < args.reward) throw new Error("Not enough money!");
    if (args.reward < 500) throw new Error("Minimum bounty is $500!");
    if (player._id === args.targetId) throw new Error("Can't bounty yourself!");
    await ctx.db.insert("bounties", { placerId: player._id, targetId: args.targetId, reward: args.reward, active: true, createdAt: Date.now() });
    await ctx.db.patch(player._id, { money: player.money - args.reward });
    return { placed: true };
  },
});

export const getActiveBounties = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bounties").withIndex("by_active", (q) => q.eq("active", true)).collect();
  },
});

export const claimBounty = mutation({
  args: { bountyId: v.id("bounties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const bounty = await ctx.db.get(args.bountyId);
    if (!bounty || !bounty.active) throw new Error("Bounty not available!");
    const target = await ctx.db.get(bounty.targetId);
    if (!target) throw new Error("Target not found");
    if (target.isDead) throw new Error("Target already dead!");
    if (player._id === bounty.placerId) throw new Error("Can't claim your own bounty!");
    const success = (player.attack ?? 10) > (target.defense ?? 10) + Math.random() * 20;
    if (success) {
      await ctx.db.patch(bounty.targetId, { isDead: true, life: 0 });
      await ctx.db.patch(player._id, { money: (player.money ?? 0) + bounty.reward, totalKills: (player.totalKills ?? 0) + 1, experience: (player.experience ?? 0) + 50 });
      await ctx.db.patch(args.bountyId, { active: false, claimedBy: player._id });
    }
    return { success, reward: success ? bounty.reward : 0 };
  },
});

// ===== DUEL SYSTEM =====

export const challengeDuel = mutation({
  args: { targetId: v.id("users"), stake: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.money ?? 0) < args.stake) throw new Error("Not enough money!");
    if (player._id === args.targetId) throw new Error("Can't duel yourself!");
    const duelId = await ctx.db.insert("duels", { challengerId: player._id, defenderId: args.targetId, stake: args.stake, status: "pending", createdAt: Date.now() });
    await ctx.db.patch(player._id, { money: player.money - args.stake });
    return { duelId };
  },
});

export const acceptDuel = mutation({
  args: { duelId: v.id("duels") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const duel = await ctx.db.get(args.duelId);
    if (!duel || duel.status !== "pending") throw new Error("Duel not available!");
    if (duel.defenderId !== player._id) throw new Error("Not your duel!");
    if ((player.money ?? 0) < duel.stake) throw new Error("Not enough money for stake!");
    await ctx.db.patch(player._id, { money: player.money - duel.stake });
    const challenger = await ctx.db.get(duel.challengerId);
    if (!challenger) throw new Error("Challenger not found");
    const cDmg = Math.floor((challenger.attack ?? 10) * (0.8 + Math.random() * 0.4));
    const dDmg = Math.floor((player.attack ?? 10) * (0.8 + Math.random() * 0.4));
    const challengerWins = cDmg > dDmg;
    const winnerId = challengerWins ? duel.challengerId : player._id;
    const winner = challengerWins ? challenger : player;
    await ctx.db.patch(args.duelId, { status: "completed", winnerId });
    await ctx.db.patch(winnerId, { money: (winner.money ?? 0) + duel.stake * 2, experience: (winner.experience ?? 0) + 25 });
    return { winnerId, challengerWins, cDmg, dDmg };
  },
});

export const getPendingDuels = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("duels").withIndex("by_status", (q) => q.eq("status", "pending")).collect();
  },
});

// ===== SPAR MODE =====

export const sparPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player._id === args.targetId) throw new Error("Can't spar yourself!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    const dmg = Math.floor((player.attack ?? 10) * (0.8 + Math.random() * 0.4));
    const tDmg = Math.floor((target.attack ?? 10) * (0.8 + Math.random() * 0.4));
    const won = dmg > tDmg;
    await ctx.db.patch(player._id, { experience: (player.experience ?? 0) + 10, life: Math.max(0, (player.life ?? 100) - tDmg) });
    return { won, damage: dmg, taken: tDmg };
  },
});

// ===== ACHIEVEMENT SYSTEM =====

export const getAchievements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("achievements").collect();
  },
});

export const getPlayerAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("playerAchievements").withIndex("by_player", (q) => q.eq("playerId", player._id)).collect();
  },
});

export const checkAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    const achievements = await ctx.db.query("achievements").collect();
    const unlocked = await ctx.db.query("playerAchievements").withIndex("by_player", (q) => q.eq("playerId", player._id)).collect();
    const unlockedIds = new Set(unlocked.map(u => u.achievementId));
    const newUnlocks: string[] = [];
    for (const a of achievements) {
      if (unlockedIds.has(a._id)) continue;
      let met = false;
      if (a.category === "crimes" && (player.totalCrimes ?? 0) >= a.requirement) met = true;
      if (a.category === "fights" && (player.totalFights ?? 0) >= a.requirement) met = true;
      if (a.category === "kills" && (player.totalKills ?? 0) >= a.requirement) met = true;
      if (a.category === "level" && (player.level ?? 0) >= a.requirement) met = true;
      if (a.category === "money" && (player.totalEarned ?? 0) >= a.requirement) met = true;
      if (met) {
        await ctx.db.insert("playerAchievements", { playerId: player._id, achievementId: a._id, unlockedAt: Date.now() });
        await ctx.db.patch(player._id, { money: (player.money ?? 0) + a.reward });
        newUnlocks.push(a.name);
      }
    }
    return { unlocked: newUnlocks };
  },
});

// ===== TITLE SYSTEM =====

export const getTitles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("playerTitles").withIndex("by_player", (q) => q.eq("playerId", player._id)).collect();
  },
});

export const checkTitles = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    const existing = await ctx.db.query("playerTitles").withIndex("by_player", (q) => q.eq("playerId", player._id)).collect();
    const have = new Set(existing.map(t => t.title));
    const newTitles: string[] = [];
    const titleChecks: { title: string; check: boolean }[] = [
      { title: "The Butcher", check: (player.totalKills ?? 0) >= 50 },
      { title: "Ghost", check: (player.totalPrisonEscapes ?? 0) >= 3 },
      { title: "The Kingpin", check: (player.level ?? 0) >= 25 },
      { title: "Street Rat", check: (player.totalCrimes ?? 0) >= 100 },
      { title: "Iron Fist", check: (player.totalFights ?? 0) >= 200 },
      { title: "Untouchable", check: (player.totalKills ?? 0) >= 100 && (player.totalDeaths ?? 0) < 5 },
      { title: "The Don", check: (player.level ?? 0) >= 50 },
      { title: "Snake", check: (player.totalCrimes ?? 0) >= 500 },
      { title: "Warlord", check: (player.totalKills ?? 0) >= 250 },
      { title: "Prestige I", check: (player.prestige ?? 0) >= 1 },
    ];
    for (const t of titleChecks) {
      if (t.check && !have.has(t.title)) {
        await ctx.db.insert("playerTitles", { playerId: player._id, title: t.title, active: false, unlockedAt: Date.now() });
        newTitles.push(t.title);
      }
    }
    return { newTitles };
  },
});

export const setActiveTitle = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    await ctx.db.patch(player._id, { activeTitle: args.title === "none" ? undefined : args.title });
    return { title: args.title };
  },
});

// ===== STOCK MARKET =====

export const getStocks = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("stocks").collect(),
});

export const buyStock = mutation({
  args: { stockId: v.id("stocks"), shares: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const stock = await ctx.db.get(args.stockId);
    if (!stock) throw new Error("Stock not found");
    const cost = stock.price * args.shares;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money!");
    await ctx.db.insert("playerStocks", { playerId: player._id, stockId: args.stockId, shares: args.shares, buyPrice: stock.price });
    await ctx.db.patch(player._id, { money: player.money - cost });
    return { bought: args.shares, cost };
  },
});

export const sellStock = mutation({
  args: { holdingId: v.id("playerStocks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const holding = await ctx.db.get(args.holdingId);
    if (!holding || holding.playerId !== player._id) throw new Error("Not your stock!");
    const stock = await ctx.db.get(holding.stockId);
    if (!stock) throw new Error("Stock not found");
    const payout = stock.price * holding.shares;
    await ctx.db.delete(args.holdingId);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + payout });
    return { payout };
  },
});

export const tickStockMarket = mutation({
  args: {},
  handler: async (ctx) => {
    const stocks = await ctx.db.query("stocks").collect();
    for (const s of stocks) {
      const change = (Math.random() - 0.48) * s.price * 0.1;
      const newPrice = Math.max(1, Math.round(s.price + change));
      const history = [...(s.history ?? []).slice(-29), newPrice];
      await ctx.db.patch(s._id, { price: newPrice, change: newPrice - s.price, history });
    }
    return { updated: stocks.length };
  },
});

// ===== REAL ESTATE =====

export const getProperties = query({
  args: { city: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.city) return await ctx.db.query("properties").withIndex("by_city", (q) => q.eq("city", args.city!)).collect();
    return await ctx.db.query("properties").collect();
  },
});

export const buyProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new Error("Property not found");
    if (prop.ownerId) throw new Error("Already owned!");
    if ((player.money ?? 0) < prop.price) throw new Error("Not enough money!");
    await ctx.db.patch(args.propertyId, { ownerId: player._id });
    await ctx.db.patch(player._id, { money: player.money - prop.price });
    return { bought: prop.name };
  },
});

export const collectPropertyIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const props = await ctx.db.query("properties").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
    const totalIncome = props.reduce((sum, p) => sum + p.income, 0);
    if (totalIncome > 0) await ctx.db.patch(player._id, { money: (player.money ?? 0) + totalIncome });
    return { income: totalIncome, properties: props.length };
  },
});

// ===== BUSINESSES =====

export const getBusinesses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
  },
});

export const buyBusiness = mutation({
  args: { name: v.string(), type: v.string(), city: v.string(), price: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.money ?? 0) < args.price) throw new Error("Not enough money!");
    const income = Math.floor(args.price * 0.05);
    await ctx.db.insert("businesses", { name: args.name, type: args.type, city: args.city, price: args.price, income, level: 1, ownerId: player._id });
    await ctx.db.patch(player._id, { money: player.money - args.price });
    return { bought: args.name };
  },
});

export const upgradeBusiness = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const biz = await ctx.db.get(args.businessId);
    if (!biz || biz.ownerId !== player._id) throw new Error("Not your business!");
    const cost = biz.price * (biz.level + 1);
    if ((player.money ?? 0) < cost) throw new Error("Not enough money!");
    await ctx.db.patch(args.businessId, { level: biz.level + 1, income: Math.floor(biz.income * 1.5) });
    await ctx.db.patch(player._id, { money: player.money - cost });
    return { level: biz.level + 1 };
  },
});

export const collectBusinessIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const bizs = await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
    const totalIncome = bizs.reduce((sum, b) => sum + b.income, 0);
    if (totalIncome > 0) await ctx.db.patch(player._id, { money: (player.money ?? 0) + totalIncome });
    return { income: totalIncome, businesses: bizs.length };
  },
});

// ===== INSURANCE =====

export const buyInsurance = mutation({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const costs: Record<string, number> = { basic: 500, premium: 2000 };
    const cost = costs[args.type] ?? 500;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money!");
    await ctx.db.insert("playerInsurance", { playerId: player._id, type: args.type, expiresAt: Date.now() + 86400000 * 7, premium: cost });
    await ctx.db.patch(player._id, { money: player.money - cost, insuranceActive: true });
    return { type: args.type };
  },
});

// ===== LOANS =====

export const takeLoan = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.loanAmount ?? 0) > 0) throw new Error("Already have a loan!");
    if (args.amount <= 0 || args.amount > 100000) throw new Error("Invalid amount!");
    const interest = Math.floor(args.amount * 0.1);
    await ctx.db.insert("loans", { borrowerId: player._id, amount: args.amount, interest, dueAt: Date.now() + 86400000 * 7, paid: false });
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + args.amount, loanAmount: args.amount + interest, loanDueAt: Date.now() + 86400000 * 7 });
    return { amount: args.amount, interest };
  },
});

export const repayLoan = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.loanAmount ?? 0) <= 0) throw new Error("No loan to repay!");
    if ((player.money ?? 0) < (player.loanAmount ?? 0)) throw new Error("Not enough money!");
    await ctx.db.patch(player._id, { money: player.money - (player.loanAmount ?? 0), loanAmount: 0, loanDueAt: 0 });
    return { repaid: player.loanAmount };
  },
});

// ===== AUCTION HOUSE =====

export const getAuctions = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("auctions").withIndex("by_active", (q) => q.eq("active", true)).collect(),
});

export const createAuction = mutation({
  args: { itemName: v.string(), description: v.string(), startingBid: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    await ctx.db.insert("auctions", { sellerId: player._id, itemName: args.itemName, description: args.description, startingBid: args.startingBid, currentBid: args.startingBid, endTime: Date.now() + 3600000, active: true });
    return { listed: args.itemName };
  },
});

export const placeBid = mutation({
  args: { auctionId: v.id("auctions"), amount: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const auction = await ctx.db.get(args.auctionId);
    if (!auction || !auction.active) throw new Error("Auction not active!");
    if (auction.sellerId === player._id) throw new Error("Can't bid on your own item!");
    if (args.amount <= auction.currentBid) throw new Error("Bid must be higher!");
    if ((player.money ?? 0) < args.amount) throw new Error("Not enough money!");
    await ctx.db.patch(args.auctionId, { currentBid: args.amount, currentBidder: player._id });
    await ctx.db.patch(player._id, { money: player.money - args.amount });
    if (auction.currentBidder) {
      const prev = await ctx.db.get(auction.currentBidder);
      if (prev) await ctx.db.patch(auction.currentBidder, { money: (prev.money ?? 0) + auction.currentBid });
    }
    return { bid: args.amount };
  },
});

// ===== GENERIC CATEGORY CRIME COMMIT =====
// Used by the CrimeCategoryPage - awards money/xp server-side
export const commitCategoryCrime = mutation({
  args: {
    crimeId: v.string(),
    reward: v.number(),
    risk: v.number(),
    xp: v.number(),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    // 60% success rate, 40% fail - consistent across all crimes
    const succeeded = Math.random() < 0.6;
    const moneyEarned = succeeded
      ? args.reward + Math.floor(Math.random() * args.reward * 0.2)
      : -Math.floor(Math.random() * 500 + 100);
    const xpEarned = succeeded ? args.xp : Math.floor(args.xp * 0.1);
    const lifeDamage = succeeded ? 0 : Math.floor(Math.random() * 20 + 5);
    const newLife = Math.max(0, player.life - lifeDamage);

    const currentXP = player.experience ?? 0;
    const newXP = currentXP + xpEarned;
    const xpNeeded = (player.level ?? 1) * 100;
    const levelUpNow = newXP >= xpNeeded && succeeded;
    const arrested = !succeeded && Math.random() > 0.6;

    const newMoney = Math.max(0, (player.money ?? 0) + moneyEarned);
    const newWanted = Math.min(10, (player.wantedLevel ?? 0) + (succeeded ? 1 : 0));

    await ctx.db.patch(player._id, {
      money: newMoney,
      life: newLife,
      totalCrimes: (player.totalCrimes ?? 0) + 1,
      experience: levelUpNow ? 0 : newXP,
      levelUpPending: levelUpNow ? true : player.levelUpPending,
      inPrison: arrested,
      prisonTime: arrested ? 15000 : player.prisonTime,
      wantedLevel: arrested ? 0 : newWanted,
    });

    await ctx.db.insert("crimes", {
      userId: player._id,
      type: args.crimeId,
      target: "environment",
      success: succeeded,
      moneyEarned: succeeded ? moneyEarned : 0,
      pointsEarned: xpEarned,
      damageTaken: lifeDamage,
      timestamp: Date.now(),
    });

    if (arrested) {
      await ctx.db.insert("notifications", {
        userId: player._id,
        type: "prison",
        message: "You were arrested during a crime!",
        read: false,
        timestamp: Date.now(),
      });
    }

    return {
      success: succeeded,
      moneyEarned,
      xpEarned,
      damageTaken: lifeDamage,
      arrested,
      newMoney,
      newLife,
      newXP: levelUpNow ? 0 : newXP,
      levelUp: levelUpNow,
    };
  },
});

// ===== BOSS FIGHT =====
export const defeatBoss = mutation({
  args: {
    bossId: v.string(),
    reward: v.number(),
    xp: v.number(),
    won: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.isDead) throw new Error("You are dead!");

    if (args.won) {
      const xpNeeded = (player.level ?? 1) * 100;
      const newXP = (player.experience ?? 0) + args.xp;
      const levelUpNow = newXP >= xpNeeded;

      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) + args.reward,
        experience: levelUpNow ? 0 : newXP,
        levelUpPending: levelUpNow ? true : player.levelUpPending,
        totalCrimes: (player.totalCrimes ?? 0) + 1,
      });
      return { moneyEarned: args.reward, xpEarned: args.xp, levelUp: levelUpNow };
    }
    const damage = Math.floor(Math.random() * 30 + 10);
    const newLife = Math.max(0, player.life - damage);
    await ctx.db.patch(player._id, { life: newLife, isDead: newLife <= 0 });
    return { moneyEarned: 0, xpEarned: 0, damageTaken: damage };
  },
});

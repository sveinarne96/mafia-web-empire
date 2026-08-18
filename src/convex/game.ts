import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== PLAYER QUERIES =====

export const getPlayer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!existing) throw new Error("User not found");
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
    });
  },
});

export const changeLocation = mutation({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    let moneyEarned = 0;
    let pointsEarned = 0;
    let damageTaken = 0;
    const success = Math.random() > 0.3 + (args.type === "rob_player" ? 0.1 : 0);

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
      prisonTime: arrested ? 3600000 : player.prisonTime,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const attacker = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const sender = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player || !player.familyId) return null;
    return await ctx.db.get(player.familyId);
  },
});

export const getFamilyMembers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) throw new Error("Player not found");

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
    const player = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!player) return { wantedLevel: 0 };
    return { wantedLevel: player.wantedLevel ?? 0 };
  },
});

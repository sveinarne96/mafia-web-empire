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

export const registerPlayer = mutation({
  args: { nickname: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
    if (!existing) throw new Error("User not found");
    if (existing.nickname) throw new Error("Already registered");

    await ctx.db.patch(existing._id, {
      nickname: args.nickname,
      money: 1000,
      bank: 0,
      points: 0,
      life: 100,
      maxLife: 100,
      energy: 100,
      maxEnergy: 100,
      defense: 10,
      attack: 10,
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
    if (player.energy < 10) throw new Error("Not enough energy to travel!");
    if (player.location === args.location) throw new Error("Already there!");

    await ctx.db.patch(player._id, {
      location: args.location,
      energy: player.energy - 10,
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
    if (player.energy < 15) throw new Error("Not enough energy!");

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

    await ctx.db.patch(player._id, {
      money: success ? player.money + moneyEarned : player.money,
      points: player.points + pointsEarned,
      life: newLife,
      energy: player.energy - 15,
      totalCrimes: player.totalCrimes + 1,
      experience: player.experience + (success ? 10 : 3),
      inPrison: arrested,
      prisonTime: arrested ? 3600000 : player.prisonTime,
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
    if (attacker.energy < 20) throw new Error("Not enough energy!");
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
      energy: attacker.energy - 20,
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
    if (player.energy < 25) throw new Error("Not enough energy!");

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
      energy: player.energy - 25,
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
    if (player.energy < 50) throw new Error("Not enough energy (50)!");
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
        energy: player.energy - 50,
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
        energy: player.energy - 50,
        experience: player.experience + 10,
      });
    }

    return { success };
  },
});

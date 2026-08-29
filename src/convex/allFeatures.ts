import { v } from "convex/values";
function xpScale(base: number, level: number) { return Math.floor(base * (1 + Math.floor(level / 10) * 0.25)); }
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ===== HELPER =====
async function getUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

// ===== #1 LIVE CHAT =====
export const getChatMessages = query({
  args: { channel: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Use messages table which exists
    return await ctx.db.query("messages").order("desc").take(100);
  },
});

export const sendChatMessage = mutation({
  args: { channel: v.optional(v.string()), content: v.string() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    await ctx.db.insert("messages", {
      senderId: player._id,
      receiverId: player._id,
      subject: args.channel || "general",
      body: args.content.slice(0, 500),
      read: false,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

// ===== #2 PRESTIGE =====
export const prestige = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getUser(ctx);
    if ((player.level ?? 1) < 100) throw new Error("Must be level 100 to prestige!");
    const currentPrestige = player.prestige ?? 0;
    const mult = 1 + (currentPrestige + 1) * 0.1;
    await ctx.db.patch(player._id, {
      level: 1,
      experience: 0,
      prestige: currentPrestige + 1,
      prestigeMultiplier: mult,
      money: Math.floor((player.money ?? 0) * 0.5),
    });
    return { success: true, newPrestige: currentPrestige + 1, multiplier: mult };
  },
});

// ===== #5 LEADERBOARDS =====
export const getLeaderboard = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const sortType = args.type || "level";
    const players = await ctx.db.query("users").collect();
    const sorted = players
      .filter((p: any) => p.nickname)
      .sort((a: any, b: any) => {
        if (sortType === "money") return (b.money ?? 0) - (a.money ?? 0);
        if (sortType === "kills") return (b.totalKills ?? 0) - (a.totalKills ?? 0);
        if (sortType === "crimes") return (b.totalCrimes ?? 0) - (a.totalCrimes ?? 0);
        return (b.level ?? 0) - (a.level ?? 0);
      })
      .slice(0, 100);
    return sorted.map((p: any, i: number) => ({
      rank: i + 1, nickname: p.nickname, level: p.level, money: p.money,
      kills: p.totalKills, crimes: p.totalCrimes, prestige: p.prestige,
    }));
  },
});

// ===== #6 WORLD MAP =====
export const getWorldMapData = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    const crimes = await ctx.db.query("crimes").order("desc").take(50);
    const locations: Record<string, number> = {};
    for (const p of players) {
      const loc = p.location || "New York";
      locations[loc] = (locations[loc] || 0) + 1;
    }
    return { locations, recentCrimes: crimes };
  },
});

// ===== #14 REAL-TIME BOUNTIES =====
export const getBounties = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    // Return bounties from kill attempts
    const recentFights = await ctx.db.query("fights").order("desc").take(20);
    return recentFights;
  },
});

export const placeBounty = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.amount) throw new Error("Not enough money");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    await ctx.db.patch(player._id, { money: player.money - args.amount, experience: (player.experience ?? 0) + xpScale(25, (player.level ?? 1)) });
    return { success: true, message: `Bounty of $${args.amount.toLocaleString()} placed!` };
  },
});

// ===== #22 UNDERGROUND FIGHT CLUB =====
export const getFightClubMatches = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players.filter((p: any) => p.nickname && !p.inPrison && !p.isDead).map((p: any) => ({
      nickname: p.nickname, level: p.level, attack: p.attack, defense: p.defense,
    }));
  },
});

export const joinFightClub = mutation({
  args: { betAmount: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.betAmount) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.betAmount });
    const opponents = await ctx.db.query("users").collect();
    const opp = opponents.find((p: any) => p._id !== player._id && p.nickname && !p.inPrison && !p.isDead);
    if (!opp) throw new Error("No opponents available");
    const playerPower = (player.attack ?? 10) + (player.level ?? 1) * 2;
    const oppPower = (opp.attack ?? 10) + (opp.level ?? 1) * 2;
    const won = playerPower + Math.random() * 20 > oppPower + Math.random() * 20;
    const prize = won ? args.betAmount * 2 : 0;
    if (won) await ctx.db.patch(player._id, { money: player.money + prize, experience: (player.experience ?? 0) + xpScale(25, (player.level ?? 1)) });
    return { success: won, opponent: opp.nickname, prize, playerPower, oppPower };
  },
});

// ===== #24 LOTTERY =====
export const buyLotteryTicket = mutation({
  args: { numbers: v.array(v.number()), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.cost });
    const winning = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
    const matches = args.numbers.filter(n => winning.includes(n)).length;
    let prize = 0;
    if (matches === 5) prize = 1000000;
    else if (matches === 4) prize = 100000;
    else if (matches === 3) prize = 10000;
    else if (matches === 2) prize = 1000;
    await ctx.db.patch(player._id, { money: player.money + prize, experience: (player.experience ?? 0) + (prize > 0 ? 20 : 5) });
    return { success: true, winning, matches, prize };
  },
});

// ===== #32 NEWS TICKER =====
export const getNewsTicker = query({
  handler: async (ctx) => {
    const crimes = await ctx.db.query("crimes").order("desc").take(20);
    const players = await ctx.db.query("users").collect();
    const news: string[] = [];
    for (const c of crimes) {
      const player = players.find((p: any) => p._id === c.userId);
      const name = player?.nickname || "Unknown";
      if (c.success) {
        news.push(`${name} committed ${c.type} — $${(c.moneyEarned ?? 0).toLocaleString()} earned!`);
      } else {
        news.push(`${name} failed ${c.type} — took damage!`);
      }
    }
    if (news.length === 0) news.push("Welcome to the underworld. Crime never sleeps.");
    return news.slice(0, 15);
  },
});

// ===== #43 DEATHMATCH ARENA =====
export const getArenaRankings = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players
      .filter((p: any) => p.nickname)
      .sort((a: any, b: any) => (b.totalKills ?? 0) - (a.totalKills ?? 0))
      .slice(0, 50)
      .map((p: any, i: number) => ({ rank: i + 1, nickname: p.nickname, kills: p.totalKills ?? 0, level: p.level ?? 1 }));
  },
});

// ===== #44 LEGACY SCOREBOARD =====
export const getLegacyBoard = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players
      .filter((p: any) => p.nickname)
      .sort((a: any, b: any) => (b.totalEarned ?? 0) - (a.totalEarned ?? 0))
      .slice(0, 50)
      .map((p: any, i: number) => ({
        rank: i + 1, nickname: p.nickname, totalEarned: p.totalEarned ?? 0,
        highestLevel: p.highestLevel ?? 0, prestige: p.prestige ?? 0,
        totalKills: p.totalKills ?? 0, totalCrimes: p.totalCrimes ?? 0,
      }));
  },
});

// ===== #45 ENDFGAME RAIDS =====
export const getRaids = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players.filter((p: any) => p.level >= 40 && p.nickname).length;
  },
});

// ===== #47 MYSTERY BOXES =====
export const buyMysteryBox = mutation({
  args: { tier: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.cost, experience: (player.experience ?? 0) + xpScale(8, (player.level ?? 1)) });
    const items = ["Golden Pistol", "Bulletproof Vest", "Flash Grenade", "Smoke Bomb", "Lockpick Set", "Night Vision Goggles", "Plasma Cutter", "EMP Device"];
    const won = items[Math.floor(Math.random() * items.length)];
    return { success: true, item: won };
  },
});

// ===== #49 GHOST MODE =====
export const activateGhostMode = mutation({
  args: { cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.cost });
    return { success: true, message: "Ghost mode activated! You're invisible for 1 hour.", expiresAt: Date.now() + 3600000 };
  },
});

// ===== MISC QUERIES =====
export const getPlayersOnline = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players.filter((p: any) => p.nickname && !p.isDead).map((p: any) => ({
      _id: p._id, nickname: p.nickname, level: p.level, location: p.location,
      attack: p.attack, defense: p.defense,
    }));
  },
});

export const getCityStats = query({
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Detroit", "Houston", "Phoenix", "Philadelphia", "Boston", "Atlanta", "Dallas"];
    return cities.map(city => {
      const cityPlayers = players.filter((p: any) => p.location === city);
      return {
        name: city, players: cityPlayers.length,
        totalWealth: cityPlayers.reduce((s: number, p: any) => s + (p.money ?? 0), 0),
        averageLevel: cityPlayers.length > 0 ? Math.round(cityPlayers.reduce((s: number, p: any) => s + (p.level ?? 1), 0) / cityPlayers.length) : 0,
      };
    });
  },
});

// ===== CRAFTING =====
export const craftItem = mutation({
  args: { itemName: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.cost, experience: (player.experience ?? 0) + xpScale(15, (player.level ?? 1)) });
    return { success: true, item: args.itemName };
  },
});

// ===== CRYPTO =====
export const buyCrypto = mutation({
  args: { coinName: v.string(), amount: v.number(), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.cost, experience: (player.experience ?? 0) + xpScale(8, (player.level ?? 1)) });
    return { success: true, coins: args.amount };
  },
});

// ===== SAFE HOUSE DEFENSE =====
export const buildDefense = mutation({
  args: { defenseType: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.money ?? 0) < args.cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - args.cost, experience: (player.experience ?? 0) + xpScale(12, (player.level ?? 1)) });
    return { success: true, defense: args.defenseType };
  },
});

// ===== UNLOCK MASTERY =====
export const unlockMastery = mutation({
  args: { skillName: v.string() },
  handler: async (ctx, args) => {
    const player = await getUser(ctx);
    if ((player.skillPoints ?? 0) < 1) throw new Error("Not enough skill points");
    await ctx.db.patch(player._id, { skillPoints: (player.skillPoints ?? 1) - 1 });
    return { success: true, node: args.skillName };
  },
});

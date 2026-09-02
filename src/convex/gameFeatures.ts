import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper: get authenticated player by auth userId (works with all auth providers)
async function getAuthPlayer(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

// ===== #23 DEATH MATCH MODE =====
// Helper: add XP and check for level-up
async function addXpAndCheckLevel(ctx: any, player: any, xpAmount: number) {
  // XP Volume Bonus: more actions in the last hour = higher multiplier
  const now = Date.now();
  const timestamps: number[] = (player as any).actionTimestamps ?? [];
  const recent = timestamps.filter((t: number) => now - t < 3600000);
  const actionCount = recent.length;
  let volMult = 1.0;
  if (actionCount >= 500) volMult = 8.0;
  else if (actionCount >= 300) volMult = 6.0;
  else if (actionCount >= 200) volMult = 5.0;
  else if (actionCount >= 150) volMult = 4.0;
  else if (actionCount >= 100) volMult = 3.5;
  else if (actionCount >= 75) volMult = 3.0;
  else if (actionCount >= 50) volMult = 2.5;
  else if (actionCount >= 30) volMult = 2.0;
  else if (actionCount >= 15) volMult = 1.5;
  else if (actionCount >= 5) volMult = 1.25;
  const finalXP = Math.floor(xpAmount * volMult);
  const newXP = (player.experience ?? 0) + finalXP;
  const xpNeeded = 2000;
  const levelUpNow = newXP >= xpNeeded;
  if (!levelUpNow) {
    return { experience: newXP };
  }
  // Level up! Apply all stats immediately
  return {
    experience: 0,
    level: (player.level ?? 1) + 1,
    levelUpPending: false,
    attack: (player.attack ?? 10) + 10,
    defense: (player.defense ?? 10) + 10,
    maxLife: (player.maxLife ?? 100) + 75,
    life: (player.maxLife ?? 100) + 75,
    skillPoints: (player.skillPoints ?? 0) + 1,
    highestLevel: Math.max(player.highestLevel ?? 0, (player.level ?? 1) + 1),
  };
}

export const deathMatchJoin = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");
    const alive = await ctx.db.query("users").collect();
    const living = alive.filter(u => !u.isDead && !u.inPrison && u._id !== player._id);
    if (living.length === 0) throw new Error("No opponents available!");
    const target = living[Math.floor(Math.random() * living.length)];
    const dmg = Math.floor(player.attack * (0.8 + Math.random() * 0.4));
    const tDmg = Math.floor(target.attack * (0.8 + Math.random() * 0.4));
    const won = dmg > tDmg;
    if (won) {
      await ctx.db.patch(target._id, { isDead: true, life: 0 });
      await ctx.db.patch(player._id, {
        totalKills: player.totalKills + 1,
        ...(await addXpAndCheckLevel(ctx, player, 60)),
        money: player.money + Math.floor(target.money * 0.15),
      });
    } else {
      await ctx.db.patch(player._id, {
        life: Math.max(0, player.life - tDmg),
        totalDeaths: player.totalDeaths + 1,
      });
    }
    await ctx.db.insert("combatLogs", {
      attackerId: player._id, defenderId: target._id, type: "deathmatch",
      attackerDamage: dmg, defenderDamage: tDmg, winnerId: won ? player._id : target._id,
      moneyStolen: won ? Math.floor(target.money * 0.15) : 0,
      location: player.location, timestamp: Date.now(),
    });
    return { won, opponent: target.nickname, damage: dmg, taken: tDmg };
  },
});

// ===== #27 SEASON RANKINGS =====
export const getSeasonRankings = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players
      .sort((a, b) => (b.killsThisSeason ?? 0) - (a.killsThisSeason ?? 0) || b.level - a.level)
      .slice(0, 50)
      .map(p => ({
        nickname: p.nickname ?? "Unknown",
        level: p.level,
        kills: p.killsThisSeason ?? 0,
        deaths: p.deathsThisSeason ?? 0,
        rank: p.familyRank ?? "None",
      }));
  },
});

// ===== #30 LEGACY SYSTEM =====
export const getLegacyStats = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    return {
      totalEarned: player.totalEarned ?? 0,
      highestLevel: player.highestLevel ?? player.level,
      totalKills: player.totalKills,
      totalDeaths: player.totalDeaths,
      totalCrimes: player.totalCrimes,
      totalFights: player.totalFights,
      prestige: player.prestige ?? 0,
      totalPrisonEscapes: player.totalPrisonEscapes ?? 0,
      titles: player.activeTitle ?? "None",
      heirWealth: Math.floor((player.money + player.bank) * 0.1),
    };
  },
});

// ===== #31 GANG WARS / #32 TERRITORY CONTROL =====
export const declareWar = mutation({
  args: { targetFamilyId: v.id("families") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("You need a family!");
    const family = await ctx.db.get(player.familyId);
    if (!family) throw new Error("Family not found!");
    if ((family as any).leaderId !== player._id) throw new Error("Only the Don can declare war!");
    if (player.familyId === args.targetFamilyId) throw new Error("Can't war yourself!");
    const target = await ctx.db.get(args.targetFamilyId);
    if (!target) throw new Error("Target family not found!");

    await ctx.db.insert("familyWars", {
      attackerFamilyId: player.familyId,
      defenderFamilyId: args.targetFamilyId,
      status: "active", startedAt: Date.now(),
      attackerKills: 0, defenderKills: 0,
    });
    await ctx.db.patch(player.familyId, {
      warTargetId: args.targetFamilyId,
      warStartedAt: Date.now(),
    });
    return { warDeclared: true, target: target.name };
  },
});

export const claimTerritory = mutation({
  args: { territoryName: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("You need a family!");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.money < 10000) throw new Error("Need $10,000 to claim territory!");
    const success = Math.random() < 0.3;
    await ctx.db.patch(player._id, { money: player.money - 10000 });
    if (success) {
      const territories = await ctx.db.query("territories").collect();
      const territory = territories.find(t => t.name === args.territoryName);
      if (territory) {
        await ctx.db.patch(territory._id, {
          ownerId: player.familyId, lastAttackedAt: Date.now(),
        });
      }
    }
    return { success, message: success ? "Territory claimed!" : "Failed to claim!" };
  },
});

export const getTerritories = query({
  args: { city: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.city) {
      return await ctx.db.query("territories")
        .withIndex("by_city", (q) => q.eq("city", args.city!))
        .collect();
    }
    return await ctx.db.query("territories").collect();
  },
});

// ===== #33 ASSASSINATION CONTRACTS =====
export const postContract = mutation({
  args: { targetId: v.id("users"), reward: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (args.reward < 5000) throw new Error("Min contract: $5,000!");
    if (player.money < args.reward) throw new Error("Not enough money!");
    if (player._id === args.targetId) throw new Error("Can't contract yourself!");
    await ctx.db.patch(player._id, { money: player.money - args.reward });
    await ctx.db.insert("contracts", {
      posterId: player._id, targetId: args.targetId,
      reward: args.reward, status: "open",
      expiresAt: Date.now() + 86400000, createdAt: Date.now(),
    });
    return { posted: true };
  },
});

export const acceptContract = mutation({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const contract = await ctx.db.get(args.contractId);
    if (!contract || contract.status !== "open") throw new Error("Contract not available!");
    if (contract.acceptedBy) throw new Error("Already taken!");
    if (player._id === contract.posterId) throw new Error("Can't take your own contract!");
    await ctx.db.patch(args.contractId, { status: "accepted", acceptedBy: player._id });
    return { accepted: true, reward: contract.reward };
  },
});

export const getOpenContracts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contracts")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
  },
});

// ===== #34 BODYGUARD =====
export const hireBodyguard = mutation({
  args: { guardId: v.id("users"), payPerDay: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (args.payPerDay < 500) throw new Error("Min pay: $500/day!");
    if (player.money < args.payPerDay * 7) throw new Error("Need 7 days upfront!");
    const guard = await ctx.db.get(args.guardId);
    if (!guard) throw new Error("Guard not found!");
    if (player._id === args.guardId) throw new Error("Can't hire yourself!");
    await ctx.db.patch(player._id, {
      bodyguardId: args.guardId, money: player.money - args.payPerDay * 7,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
    });
    return { hired: true };
  },
});

// ===== #35 AMBUSHES =====
export const setAmbush = mutation({
  args: { reward: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.money < 2000) throw new Error("Need $2,000 to set ambush!");
    await ctx.db.patch(player._id, { money: player.money - 2000 });
    await ctx.db.insert("ambushes", {
      ambusherId: player._id, location: player.location,
      reward: args.reward, active: true, createdAt: Date.now(),
    });
    return { set: true, location: player.location };
  },
});

export const checkAmbush = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("ambushes")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .collect();
  },
});

// ===== #36 RETALIATION TIMER =====
export const checkRetaliation = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    const now = Date.now();
    return {
      canBeAttacked: (player.retaliationUntil ?? 0) < now,
      retaliationEndsAt: player.retaliationUntil ?? 0,
    };
  },
});

// ===== #37 COMBAT LOG =====
export const getCombatLog = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    const asAttacker = await ctx.db.query("combatLogs")
      .withIndex("by_attacker", (q) => q.eq("attackerId", player._id))
      .order("desc").take(10);
    const asDefender = await ctx.db.query("combatLogs")
      .withIndex("by_defender", (q) => q.eq("defenderId", player._id))
      .order("desc").take(10);
    return [...asAttacker, ...asDefender]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  },
});

// ===== #38 FIGHTING STYLES =====
export const learnFightingStyle = mutation({
  args: { style: v.union(v.literal("boxing"), v.literal("jiu_jitsu"), v.literal("street")) },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const costs: Record<string, number> = { boxing: 5000, jiu_jitsu: 8000, street: 3000 };
    const cost = costs[args.style];
    if (player.money < cost) throw new Error(`Need $${cost}!`);
    await ctx.db.patch(player._id, { fightingStyle: args.style, money: player.money - cost });
    return { learned: args.style };
  },
});

// ===== #39 ARMOR SYSTEM =====
export const buyArmor = mutation({
  args: { name: v.string(), defense: v.number(), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.cost) throw new Error("Not enough money!");
    await ctx.db.patch(player._id, {
      armorEquipped: args.name, armorDurability: 100,
      money: player.money - args.cost,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
    });
    return { equipped: args.name };
  },
});

export const repairArmor = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (!(player as any).armorEquipped) throw new Error("No armor equipped!");
    const cost = Math.floor((100 - (player.armorDurability ?? 0)) * 10);
    if (player.money < cost) throw new Error(`Need $${cost} to repair!`);
    await ctx.db.patch(player._id, { armorDurability: 100, money: player.money - cost });
    return { repaired: true, cost };
  },
});

// ===== #40 WEAPON PROFICIENCY =====
export const getProficiency = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    return {
      level: player.weaponProficiency ?? 0,
      bonus: Math.floor((player.weaponProficiency ?? 0) / 10),
      nextLevelAt: ((player.weaponProficiency ?? 0) + 1) * 50,
    };
  },
});

// ===== #42 STOCK MARKET =====
export const seedStocks = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stocks").collect();
    if (existing.length > 0) return { seeded: false };
    const defaults = [
      { name: "Shadow Corp", symbol: "SHDW", price: 100, change: 0, history: [100] },
      { name: "Underground Inc", symbol: "UNDR", price: 75, change: 0, history: [75] },
      { name: "Night Industries", symbol: "NGHT", price: 150, change: 0, history: [150] },
      { name: "Crime Syndicate", symbol: "CRIM", price: 200, change: 0, history: [200] },
      { name: "Street Holdings", symbol: "STRT", price: 50, change: 0, history: [50] },
    ];
    for (const s of defaults) await ctx.db.insert("stocks", s);
    return { seeded: true };
  },
});

export const updateStockPrices = mutation({
  args: {},
  handler: async (ctx) => {
    const stocks = await ctx.db.query("stocks").collect();
    for (const stock of stocks) {
      const ch = (Math.random() - 0.48) * stock.price * 0.1;
      const newPrice = Math.max(1, Math.round(stock.price + ch));
      const hist = [...(stock.history || []), newPrice].slice(-30);
      await ctx.db.patch(stock._id, {
        price: newPrice, change: Math.round(ch * 100) / 100, history: hist,
      });
    }
    return { updated: stocks.length };
  },
});

export const getStocks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stocks").collect();
  },
});

export const buyStock = mutation({
  args: { stockId: v.id("stocks"), shares: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const stock = await ctx.db.get(args.stockId);
    if (!stock) throw new Error("Stock not found!");
    const cost = stock.price * args.shares;
    if (player.money < cost) throw new Error("Not enough money!");
    const existing = await ctx.db.query("playerStocks")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
    const held = existing.find(s => s.stockId === args.stockId);
    if (held) {
      const newShares = held.shares + args.shares;
      const newAvg = ((held.buyPrice * held.shares) + cost) / newShares;
      await ctx.db.patch(held._id, { shares: newShares, buyPrice: Math.round(newAvg) });
    } else {
      await ctx.db.insert("playerStocks", {
        userId: player._id, stockId: args.stockId,
        shares: args.shares, buyPrice: stock.price,
      });
    }
    await ctx.db.patch(player._id, { money: player.money - cost });
    return { bought: args.shares, at: stock.price };
  },
});

export const sellStock = mutation({
  args: { stockId: v.id("stocks"), shares: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const stock = await ctx.db.get(args.stockId);
    if (!stock) throw new Error("Stock not found!");
    const holdings = await ctx.db.query("playerStocks")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
    const held = holdings.find(s => s.stockId === args.stockId);
    if (!held || held.shares < args.shares) throw new Error("Not enough shares!");
    const revenue = stock.price * args.shares;
    const newShares = held.shares - args.shares;
    if (newShares <= 0) await ctx.db.delete(held._id);
    else await ctx.db.patch(held._id, { shares: newShares });
    await ctx.db.patch(player._id, { money: player.money + revenue });
    return { sold: args.shares, at: stock.price, revenue };
  },
});

export const getMyStocks = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    const holdings = await ctx.db.query("playerStocks")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
    const result = [];
    for (const h of holdings) {
      const stock = await ctx.db.get(h.stockId);
      if (stock) result.push({ ...h, stock });
    }
    return result;
  },
});

// ===== #43 REAL ESTATE =====
export const getProperties = query({
  args: { city: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.city) {
      return await ctx.db.query("properties")
        .withIndex("by_city", (q) => q.eq("city", args.city!))
        .collect();
    }
    return await ctx.db.query("properties").collect();
  },
});

export const buyProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new Error("Property not found!");
    if (prop.ownerId) throw new Error("Already owned!");
    if (player.money < prop.price) throw new Error("Not enough money!");
    await ctx.db.patch(args.propertyId, { ownerId: player._id });
    await ctx.db.patch(player._id, { money: player.money - prop.price, propertiesBought: ((player as any).propertiesBought ?? 0) + 1 } as any);
    return { bought: prop.name };
  },
});

export const collectPropertyIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    const props = await ctx.db.query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", player._id))
      .collect();
    let totalIncome = 0;
    for (const p of props) totalIncome += p.income;
    if (totalIncome > 0) {
      await ctx.db.patch(player._id, { money: player.money + totalIncome });
    }
    return { collected: totalIncome, properties: props.length };
  },
});

// ===== #44-45 BUSINESSES =====
export const getMyBusinesses = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    return await ctx.db.query("businesses")
      .withIndex("by_owner", (q) => q.eq("ownerId", player._id))
      .collect();
  },
});

export const buyBusiness = mutation({
  args: { name: v.string(), type: v.string(), city: v.string(), price: v.number(), income: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.price) throw new Error("Not enough money!");
    await ctx.db.insert("businesses", {
      name: args.name, type: args.type, city: args.city,
      price: args.price, income: args.income, level: 1, ownerId: player._id,
    });
    await ctx.db.patch(player._id, { money: player.money - args.price });
    return { bought: args.name };
  },
});

export const upgradeBusiness = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const biz = await ctx.db.get(args.businessId);
    if (!biz || biz.ownerId !== player._id) throw new Error("Not your business!");
    const cost = biz.level * 10000;
    if (player.money < cost) throw new Error(`Need $${cost}!`);
    await ctx.db.patch(args.businessId, { level: biz.level + 1, income: Math.floor(biz.income * 1.5) });
    await ctx.db.patch(player._id, { money: player.money - cost, experience: (player.experience ?? 0) + 3 });
    return { level: biz.level + 1 };
  },
});

// ===== #53 COUNTERFEITING =====
export const counterfeitMoney = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.money < 500) throw new Error("Need $500 for supplies!");
    const skill = player.counterfeitSkill ?? 0;
    const successChance = 0.3 + skill * 0.05;
    const success = Math.random() < successChance;
    if (success) {
      const amount = Math.floor(1000 + Math.random() * 3000);
      await ctx.db.patch(player._id, {
        money: player.money - 500 + amount,
        ...(await addXpAndCheckLevel(ctx, player, 25)),
        counterfeitSkill: Math.min(20, skill + 1),
        dirtyMoney: (player.dirtyMoney ?? 0) + amount,
      });
      return { success, earned: amount };
    }
    const arrested = Math.random() > 0.25;
    if (arrested) {
      await ctx.db.patch(player._id, {
        money: player.money - 500, inPrison: true, prisonTime: 7200000,
        wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 3),
      });
      return { success: false, arrested: true };
    }
    return { success: false, arrested: false };
  },
});

// ===== #55 DRUG TRAFFICKING =====
export const drugDeal = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    const costPerUnit = 100;
    const totalCost = costPerUnit * args.quantity;
    if (player.money < totalCost) throw new Error("Not enough money!");
    const success = Math.random() > 0.3;
    if (success) {
      const sellPrice = Math.floor(totalCost * (1.5 + Math.random()));
      await ctx.db.patch(player._id, {
        money: player.money - totalCost + sellPrice,
        ...(await addXpAndCheckLevel(ctx, player, 25)),
        drugDeals: (player.drugDeals ?? 0) + 1,
        dirtyMoney: (player.dirtyMoney ?? 0) + sellPrice,
      });
      return { success, profit: sellPrice - totalCost };
    }
    await ctx.db.patch(player._id, {
      money: player.money - totalCost,
      life: Math.max(0, player.life - 15),
      wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 2),
    });
    return { success: false };
  },
});

// ===== #56 ARSON =====
export const commitArson = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    const success = Math.random() > 0.25;
    if (success) {
      const payout = Math.floor(5000 + Math.random() * 15000);
      await ctx.db.patch(player._id, {
        money: player.money + payout, arsons: (player.arsons ?? 0) + 1,
        ...(await addXpAndCheckLevel(ctx, player, 25)),
      });
      return { success, payout };
    }
    const arrested = Math.random() > 0.4;
    await ctx.db.patch(player._id, {
      life: Math.max(0, player.life - 20),
      wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 4),
      inPrison: arrested, prisonTime: arrested ? 10800000 : player.prisonTime,
    });
    return { success: false, arrested };
  },
});

// ===== #57 IDENTITY THEFT =====
export const commitIdentityTheft = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found!");
    if (player._id === args.targetId) throw new Error("Can't steal your own identity!");
    const success = Math.random() > 0.25;
    if (success) {
      const stolen = Math.floor(target.bank * 0.1);
      await ctx.db.patch(player._id, {
        money: player.money + stolen, identityThefts: (player.identityThefts ?? 0) + 1,
        ...(await addXpAndCheckLevel(ctx, player, 25)),
      });
      await ctx.db.patch(args.targetId, { bank: Math.max(0, target.bank - stolen) });
      return { success, stolen };
    }
    await ctx.db.patch(player._id, {
      wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 3),
    });
    return { success: false };
  },
});

// ===== #59 ARMS DEALING =====
export const armsDeal = mutation({
  args: { weaponType: v.string(), action: v.union(v.literal("buy"), v.literal("sell")) },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const prices: Record<string, { buy: number; sell: number }> = {
      pistol: { buy: 3000, sell: 2000 }, shotgun: { buy: 8000, sell: 5000 },
      rifle: { buy: 15000, sell: 10000 }, knife: { buy: 500, sell: 300 },
    };
    const p = prices[args.weaponType];
    if (!p) throw new Error("Invalid weapon!");
    if (args.action === "buy") {
      if (player.money < p.buy) throw new Error("Not enough money!");
      const buyXp = await addXpAndCheckLevel(ctx, player, 40);
      await ctx.db.patch(player._id, {
        money: player.money - p.buy,
        attack: (buyXp.attack ?? player.attack ?? 10) + 3,
        ...buyXp,
        armsDeals: (player.armsDeals ?? 0) + 1,
      });
    } else {
      await ctx.db.patch(player._id, {
        money: player.money + p.sell, attack: Math.max(1, player.attack - 3),
        armsDeals: (player.armsDeals ?? 0) + 1,
      });
    }
    return { action: args.action, weapon: args.weaponType };
  },
});

// ===== #60 WITNESS INTIMIDATION =====
export const intimidateWitness = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if ((player.wantedLevel ?? 0) <= 0) throw new Error("No wanted level!");
    const success = Math.random() > 0.25;
    if (success) {
      await ctx.db.patch(player._id, {
        wantedLevel: Math.max(0, player.wantedLevel - 2),
        witnessIntimidations: (player.witnessIntimidations ?? 0) + 1,
        ...(await addXpAndCheckLevel(ctx, player, 20)),
      });
      return { success, reduction: 2 };
    }
    await ctx.db.patch(player._id, { wantedLevel: Math.min(20, player.wantedLevel + 1) });
    return { success: false, message: "Witness reported you!" };
  },
});

// ===== #61 TAX EVASION =====
export const evadeTaxes = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    const income = player.money + player.bank;
    const tax = Math.floor(income * 0.1);
    const success = Math.random() > 0.3;
    if (success) return { success, savedTax: tax };
    const fine = Math.floor(tax * 2);
    await ctx.db.patch(player._id, {
      money: Math.max(0, player.money - fine),
      ...(await addXpAndCheckLevel(ctx, player, 20)),
      wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 2),
    });
    return { success: false, fine };
  },
});

// ===== #62 RACKETEERING =====
export const collectRacket = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    const income = Math.floor(500 + Math.random() * 2000);
    const risk = Math.random() < 0.15;
    await ctx.db.patch(player._id, {
      money: player.money + income,
      ...(await addXpAndCheckLevel(ctx, player, 20)),
      racketeeringIncome: (player.racketeeringIncome ?? 0) + income,
    });
    if (risk) await ctx.db.patch(player._id, { wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 1) });
    return { income, reported: risk };
  },
});

// ===== #63 GAMBLING DENS =====
export const openGamblingDen = mutation({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < 50000) throw new Error("Need $50,000!");
    await ctx.db.insert("illegalBusinesses", {
      ownerId: player._id, type: "gambling_den",
      name: `${player.nickname}'s Casino`, city: args.city,
      level: 1, income: 2000, riskLevel: 30,
      raided: false, lastCollected: Date.now(),
    });
    await ctx.db.patch(player._id, { money: player.money - 50000, ...(await addXpAndCheckLevel(ctx, player, 20)) });
    return { opened: true };
  },
});

// ===== #64 LOAN SHARKING =====
export const lendMoney = mutation({
  args: { borrowerId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.amount) throw new Error("Not enough money!");
    if (player._id === args.borrowerId) throw new Error("Can't lend to yourself!");
    await ctx.db.patch(player._id, { money: player.money - args.amount, ...(await addXpAndCheckLevel(ctx, player, 20)) });
    const borrower = await ctx.db.get(args.borrowerId);
    if (borrower) {
      await ctx.db.patch(args.borrowerId, {
        money: borrower.money + args.amount,
        loanSharkDebts: (borrower.loanSharkDebts ?? 0) + args.amount,
      });
    }
    return { lent: args.amount };
  },
});

// ===== #65 CARGO THEFT =====
export const hijackCargo = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    const success = Math.random() > 0.35;
    if (success) {
      const loot = Math.floor(3000 + Math.random() * 10000);
      await ctx.db.patch(player._id, {
        money: player.money + loot, cargoThefts: (player.cargoThefts ?? 0) + 1,
        ...(await addXpAndCheckLevel(ctx, player, 25)),
      });
      return { success, loot };
    }
    const arrested = Math.random() > 0.25;
    await ctx.db.patch(player._id, {
      life: Math.max(0, player.life - 15),
      wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 2),
      inPrison: arrested, prisonTime: arrested ? 7200000 : player.prisonTime,
    });
    return { success: false, arrested };
  },
});

// ===== #66 POKER =====
export const createPokerGame = mutation({
  args: { blind: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.blind * 10) throw new Error("Need 10x blind!");
    const gameId = await ctx.db.insert("pokerGames", {
      creatorId: player._id, players: [player._id],
      pot: 0, blind: args.blind, status: "waiting",
      currentRound: 0, communityCards: [], createdAt: Date.now(),
    });
    return { gameId };
  },
});

export const joinPokerGame = mutation({
  args: { gameId: v.id("pokerGames") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "waiting") throw new Error("Game not available!");
    if (game.players.includes(player._id)) throw new Error("Already in!");
    const ante = game.blind;
    if (player.money < ante) throw new Error("Not enough money!");
    await ctx.db.patch(args.gameId, {
      players: [...game.players, player._id], pot: game.pot + ante,
    });
    await ctx.db.patch(player._id, { money: player.money - ante });
    return { joined: true, pot: game.pot + ante };
  },
});

// ===== #67 ROULETTE =====
export const rouletteSpin = mutation({
  args: { bet: v.number(), choice: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.bet) throw new Error("Not enough money!");
    if (args.bet < 10) throw new Error("Min bet: $10!");
    const result = Math.floor(Math.random() * 37);
    const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(result);
    const isBlack = result > 0 && !isRed;
    let won = false;
    let multiplier = 0;
    if (args.choice === "red" && isRed) { won = true; multiplier = 2; }
    else if (args.choice === "black" && isBlack) { won = true; multiplier = 2; }
    else if (args.choice === "green" && result === 0) { won = true; multiplier = 36; }
    else if (args.choice === "odd" && result > 0 && result % 2 === 1) { won = true; multiplier = 2; }
    else if (args.choice === "even" && result > 0 && result % 2 === 0) { won = true; multiplier = 2; }
    else if (args.choice === String(result)) { won = true; multiplier = 36; }
    const winnings = won ? args.bet * multiplier : 0;
    await ctx.db.patch(player._id, {
      money: won ? player.money + winnings - args.bet : player.money - args.bet,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
    });
    return { result, color: isRed ? "red" : isBlack ? "black" : "green", won, winnings };
  },
});

// ===== #68 SLOT MACHINES =====
export const playSlots = mutation({
  args: { bet: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.bet) throw new Error("Not enough money!");
    if (args.bet < 5) throw new Error("Min bet: $5!");
    const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];
    const reels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    let multiplier = 0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      multiplier = reels[0] === "💎" ? 50 : reels[0] === "7️⃣" ? 25 : 10;
    } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
      multiplier = 2;
    }
    const winnings = multiplier > 0 ? args.bet * multiplier : 0;
    await ctx.db.patch(player._id, {
      money: winnings > 0 ? player.money + winnings - args.bet : player.money - args.bet,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
    });
    return { reels, multiplier, won: winnings > 0, winnings };
  },
});

// ===== #69 BETTING ON FIGHTS =====
export const betOnFight = mutation({
  args: { fightId: v.id("fights"), betAmount: v.number(), betOn: v.union(v.literal("attacker"), v.literal("defender")) },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.betAmount) throw new Error("Not enough money!");
    const fight = await ctx.db.get(args.fightId);
    if (!fight) throw new Error("Fight not found!");
    const won = (args.betOn === "attacker" && fight.winnerId === fight.attackerId) ||
                (args.betOn === "defender" && fight.winnerId === fight.defenderId);
    const payout = won ? args.betAmount * 2 : 0;
    await ctx.db.patch(player._id, {
      money: won ? player.money + payout - args.betAmount : player.money - args.betAmount,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
    });
    return { won, payout };
  },
});

// ===== #77 RUSSIAN ROULETTE =====
export const russianRoulette = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.isDead) throw new Error("You are dead!");
    const survived = Math.random() >= (1 / 6);
    if (survived) {
      await ctx.db.patch(player._id, { money: player.money + 50000 });
      return { survived: true, prize: 50000 };
    }
    await ctx.db.patch(player._id, { isDead: true, life: 0, totalDeaths: player.totalDeaths + 1 });
    return { survived: false, prize: 0 };
  },
});

// ===== #78 DOG FIGHTING =====
export const dogFight = mutation({
  args: { opponentId: v.id("users"), bet: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.bet) throw new Error("Not enough money!");
    if (player._id === args.opponentId) throw new Error("Can't fight yourself!");
    const opponent = await ctx.db.get(args.opponentId);
    if (!opponent) throw new Error("Opponent not found!");
    const myDog = 10 + Math.floor(Math.random() * 20);
    const theirDog = 10 + Math.floor(Math.random() * 20);
    const won = myDog > theirDog;
    await ctx.db.patch(player._id, { money: won ? player.money + args.bet : player.money - args.bet, ...(await addXpAndCheckLevel(ctx, player, 20)) });
    await ctx.db.patch(args.opponentId, { money: won ? opponent.money - args.bet : opponent.money + args.bet });
    await ctx.db.insert("dogFights", {
      player1Id: player._id, player2Id: args.opponentId,
      bet: args.bet, winnerId: won ? player._id : args.opponentId,
      dog1Name: "Rex", dog2Name: "Spike",
      dog1Stats: myDog, dog2Stats: theirDog,
      status: "finished", timestamp: Date.now(),
    });
    return { won, myDog, theirDog };
  },
});

// ===== #79 STREET RACING =====
export const createStreetRace = mutation({
  args: { entryFee: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.entryFee) throw new Error("Not enough money!");
    const tracks = ["Downtown Sprint", "Highway Run", "Airport Circuit", "Harbor Loop"];
    const raceId = await ctx.db.insert("streetRaces", {
      creatorId: player._id, participants: [player._id],
      entryFee: args.entryFee, prizePool: args.entryFee, status: "waiting",
      track: tracks[Math.floor(Math.random() * tracks.length)],
      createdAt: Date.now(),
    });
    await ctx.db.patch(player._id, { money: player.money - args.entryFee });
    return { raceId };
  },
});

export const joinStreetRace = mutation({
  args: { raceId: v.id("streetRaces") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "waiting") throw new Error("Race not available!");
    if (race.participants.includes(player._id)) throw new Error("Already joined!");
    if (player.money < race.entryFee) throw new Error("Not enough money!");
    await ctx.db.patch(args.raceId, {
      participants: [...race.participants, player._id],
      prizePool: race.prizePool + race.entryFee,
    });
    await ctx.db.patch(player._id, { money: player.money - race.entryFee });
    return { joined: true };
  },
});

export const finishStreetRace = mutation({
  args: { raceId: v.id("streetRaces") },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "waiting") throw new Error("Race not ready!");
    const winnerIdx = Math.floor(Math.random() * race.participants.length);
    const winnerId = race.participants[winnerIdx];
    await ctx.db.patch(args.raceId, { status: "finished", winnerId });
    const winner = await ctx.db.get(winnerId);
    if (winner) await ctx.db.patch(winnerId, { money: winner.money + race.prizePool, racesWon: ((winner as any).racesWon ?? 0) + 1 } as any);
    return { winnerId, prizePool: race.prizePool };
  },
});

export const getWaitingRaces = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("streetRaces")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
  },
});

// ===== #81 FAMILY RANKS =====
export const setFamilyRank = mutation({
  args: { memberId: v.id("users"), rank: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("No family!");
    const family = await ctx.db.get(player.familyId);
    if (!family || (family as any).leaderId !== player._id) throw new Error("Only Don can set ranks!");
    const member = await ctx.db.get(args.memberId);
    if (!member || member.familyId !== player.familyId) throw new Error("Not in your family!");
    await ctx.db.patch(args.memberId, { familyRank: args.rank, familyRole: args.rank });
    return { rank: args.rank, member: member.nickname };
  },
});

// ===== #84 FAMILY WARS =====
export const getActiveFamilyWars = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("familyWars")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// ===== #85 FAMILY ALLIANCES =====
export const proposeAlliance = mutation({
  args: { targetFamilyId: v.id("families") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("No family!");
    if (player.familyId === args.targetFamilyId) throw new Error("Can't ally yourself!");
    await ctx.db.insert("familyAlliances", {
      family1Id: player.familyId, family2Id: args.targetFamilyId,
      status: "pending", createdAt: Date.now(),
    });
    return { proposed: true };
  },
});

export const acceptAlliance = mutation({
  args: { allianceId: v.id("familyAlliances") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("No family!");
    const alliance = await ctx.db.get(args.allianceId);
    if (!alliance || alliance.status !== "pending") throw new Error("Not available!");
    if (alliance.family2Id !== player.familyId) throw new Error("Not for your family!");
    await ctx.db.patch(args.allianceId, { status: "active" });
    return { accepted: true };
  },
});

// ===== #86 SPY SYSTEM =====
export const sendSpy = mutation({
  args: { targetFamilyId: v.id("families") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < 10000) throw new Error("Need $10,000 for spy!");
    await ctx.db.patch(player._id, { money: player.money - 10000 });
    const target = await ctx.db.get(args.targetFamilyId);
    if (!target) throw new Error("Family not found!");
    return {
      intelligence: {
        members: target.memberCount, treasury: target.treasury,
        level: target.level, territories: (target.territories ?? []).length,
      },
    };
  },
});

// ===== #87 BETRAYAL =====
export const betrayFamily = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("No family!");
    const family = await ctx.db.get(player.familyId);
    if (!family) throw new Error("Family not found!");
    if ((family as any).leaderId === player._id) throw new Error("Don can't betray!");
    const stolen = Math.floor((family as any).treasury * 0.1);
    const fid = player.familyId;
    await ctx.db.patch(player._id, {
      familyId: undefined, money: player.money + stolen,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
      betrayalCount: (player.betrayalCount ?? 0) + 1,
      reputation: Math.max(-100, player.reputation - 20), reputationAlignment: "evil",
    });
    await ctx.db.patch(fid, {
      memberCount: Math.max(0, (family as any).memberCount - 1),
      treasury: Math.max(0, (family as any).treasury - stolen),
    });
    return { stolen, family: family.name };
  },
});

// ===== #88 MENTOR SYSTEM =====
export const mentorPlayer = mutation({
  args: { menteeId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.level < 10) throw new Error("Must be level 10+ to mentor!");
    const mentee = await ctx.db.get(args.menteeId);
    if (!mentee) throw new Error("Mentee not found!");
    await ctx.db.patch(args.menteeId, { mentorId: player._id });
    await ctx.db.patch(player._id, {
      totalMentoring: (player.totalMentoring ?? 0) + 1, ...(await addXpAndCheckLevel(ctx, player, 75)),
    });
    return { mentored: mentee.nickname };
  },
});

// ===== #90 FACTION REPUTATION =====
export const getFactionReputation = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    return {
      reputation: player.reputation, alignment: player.reputationAlignment,
      infamy: (player.totalKills ?? 0) * 5 + (player.totalCrimes ?? 0) * 2,
    };
  },
});

// ===== #92 RIVALRIES =====
export const startRivalry = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player._id === args.targetId) throw new Error("Can't rival yourself!");
    await ctx.db.insert("rivalries", {
      player1Id: player._id, player2Id: args.targetId,
      p1Kills: 0, p2Kills: 0, startedAt: Date.now(), active: true,
    });
    return { started: true };
  },
});

// ===== #93 GIFTING =====
export const sendGift = mutation({
  args: { receiverId: v.id("users"), amount: v.number(), message: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.money < args.amount) throw new Error("Not enough money!");
    if (player._id === args.receiverId) throw new Error("Can't gift yourself!");
    await ctx.db.patch(player._id, { money: player.money - args.amount, ...(await addXpAndCheckLevel(ctx, player, 20)) });
    await ctx.db.insert("gifts", {
      senderId: player._id, receiverId: args.receiverId,
      type: "money", amount: args.amount,
      message: args.message ?? "", timestamp: Date.now(), claimed: false,
    });
    await ctx.db.insert("notifications", {
      userId: args.receiverId, type: "gift",
      message: `${player.nickname} sent you $${args.amount.toLocaleString()}!`,
      read: false, timestamp: Date.now(),
    });
    return { sent: true };
  },
});

export const getMyGifts = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    return await ctx.db.query("gifts")
      .withIndex("by_receiver", (q) => q.eq("receiverId", player._id))
      .order("desc").take(20);
  },
});

// ===== #96 HIT LIST =====
export const postHitList = mutation({
  args: { targetId: v.id("users"), reward: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (args.reward < 2000) throw new Error("Min hit: $2,000!");
    if (player.money < args.reward) throw new Error("Not enough money!");
    await ctx.db.patch(player._id, { money: player.money - args.reward });
    await ctx.db.insert("hitLists", {
      posterId: player._id, targetId: args.targetId,
      reward: args.reward, status: "active", createdAt: Date.now(),
    });
    return { posted: true };
  },
});

export const getActiveHitLists = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("hitLists")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// ===== #98 FAMILY ELECTIONS =====
export const startElection = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("No family!");
    const family = await ctx.db.get(player.familyId);
    if (!family) throw new Error("Family not found!");
    if ((family as any).leaderId !== player._id) throw new Error("Only Don can start election!");
    const members = await ctx.db.query("users")
      .withIndex("by_family", (q) => q.eq("familyId", player.familyId))
      .collect();
    const candidates = members.filter(m => (m.level ?? 0) >= 5).map(m => m._id);
    if (candidates.length < 2) throw new Error("Need at least 2 eligible candidates!");
    await ctx.db.insert("familyElections", {
      familyId: player.familyId, candidates, votes: [],
      status: "active", startedAt: Date.now(), endsAt: Date.now() + 86400000,
    });
    await ctx.db.patch(player.familyId, { electionActive: true });
    return { started: true, candidates: candidates.length };
  },
});

// ===== #100 AMBASSADOR SYSTEM =====
export const sendAmbassador = mutation({
  args: { targetFamilyId: v.id("families"), message: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!player.familyId) throw new Error("No family!");
    if (player.familyId === args.targetFamilyId) throw new Error("Can't send to yourself!");
    await ctx.db.insert("ambassadors", {
      familyId: player.familyId, ambassadorId: player._id,
      targetFamilyId: args.targetFamilyId,
      message: args.message, status: "pending", createdAt: Date.now(),
    });
    return { sent: true };
  },
});

// ===== #20 TIME SERVED DISPLAY =====
export const getPrisonTimeDisplay = query({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (!player.inPrison) return null;
    const prisonTimeMs = player.prisonTime ?? 15000;
    const timeSinceArrest = Date.now() - (player.lastCrimeAt ?? Date.now());
    const remaining = Math.max(0, prisonTimeMs - timeSinceArrest);
    const totalSeconds = Math.ceil(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      remaining, hours, minutes, seconds,
      totalSeconds,
      cellLevel: player.cellLevel,
      job: player.prisonJob,
      gang: player.prisonGang,
      solitary: (player.solitaryTime ?? 0) > 0,
    };
  },
});

// ===== ADMIN: SEED DATA =====
export const seedTerritories = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("territories").collect();
    if (existing.length > 0) return { seeded: false };
    const cities = ["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles",
      "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"];
    const areas = ["Downtown", "Harbor", "Industrial", "Suburbs", "Strip"];
    for (const city of cities) {
      for (const area of areas) {
        await ctx.db.insert("territories", {
          name: `${city} ${area}`, city,
          income: Math.floor(500 + Math.random() * 2000),
          defenseLevel: 1, lastAttackedAt: 0,
        });
      }
    }
    return { seeded: true };
  },
});

export const seedProperties = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("properties").collect();
    if (existing.length > 0) return { seeded: false };
    const props = [
      { name: "Dive Bar", type: "bar", city: "New York", price: 50000, income: 1000 },
      { name: "Nightclub", type: "nightclub", city: "Miami", price: 200000, income: 5000 },
      { name: "Warehouse", type: "warehouse", city: "Chicago", price: 100000, income: 2500 },
      { name: "Restaurant", type: "restaurant", city: "Las Vegas", price: 150000, income: 3500 },
      { name: "Penthouse", type: "penthouse", city: "New York", price: 500000, income: 10000 },
      { name: "Casino", type: "casino", city: "Las Vegas", price: 1000000, income: 25000 },
      { name: "Hotel", type: "hotel", city: "Atlanta", price: 300000, income: 7000 },
      { name: "Marina", type: "marina", city: "Miami", price: 250000, income: 6000 },
    ];
    for (const p of props) {
      await ctx.db.insert("properties", { ...p, ownerId: undefined });
    }
    return { seeded: true };
  },
});

// ===== SKILL TREE SYSTEM =====
const SKILL_TREE = {
  combat: {
    name: "Combat",
    skills: [
      { id: "combat_1", name: "Street Fighter", desc: "+5 ATK", cost: 1, stat: "attack", bonus: 5 },
      { id: "combat_2", name: "Iron Fist", desc: "+10 ATK", cost: 2, stat: "attack", bonus: 10 },
      { id: "combat_3", name: "Killer Instinct", desc: "+15 ATK", cost: 3, stat: "attack", bonus: 15 },
      { id: "combat_4", name: "Death Strike", desc: "+25 ATK", cost: 5, stat: "attack", bonus: 25 },
    ],
  },
  defense: {
    name: "Defense",
    skills: [
      { id: "def_1", name: "Iron Skin", desc: "+5 DEF", cost: 1, stat: "defense", bonus: 5 },
      { id: "def_2", name: "Body Armor", desc: "+10 DEF", cost: 2, stat: "defense", bonus: 10 },
      { id: "def_3", name: "Tank", desc: "+15 DEF", cost: 3, stat: "defense", bonus: 15 },
      { id: "def_4", name: "Unbreakable", desc: "+25 DEF", cost: 5, stat: "defense", bonus: 25 },
    ],
  },
  health: {
    name: "Vitality",
    skills: [
      { id: "hp_1", name: "Thick Blood", desc: "+20 Max HP", cost: 1, stat: "maxLife", bonus: 20 },
      { id: "hp_2", name: "Adrenaline", desc: "+40 Max HP", cost: 2, stat: "maxLife", bonus: 40 },
      { id: "hp_3", name: "Rage", desc: "+60 Max HP", cost: 3, stat: "maxLife", bonus: 60 },
      { id: "hp_4", name: "Undying", desc: "+100 Max HP", cost: 5, stat: "maxLife", bonus: 100 },
    ],
  },
  criminal: {
    name: "Criminal",
    skills: [
      { id: "crime_1", name: "Pickpocket Master", desc: "+10% crime success", cost: 1, stat: "crimeBonus", bonus: 10 },
      { id: "crime_2", name: "Safe Cracker", desc: "+15% crime success", cost: 2, stat: "crimeBonus", bonus: 15 },
      { id: "crime_3", name: "Phantom", desc: "+20% crime success", cost: 3, stat: "crimeBonus", bonus: 20 },
      { id: "crime_4", name: "Ghost", desc: "+30% crime success", cost: 5, stat: "crimeBonus", bonus: 30 },
    ],
  },
};

export const getSkillTree = query({
  args: {},
  handler: async (ctx) => {
    return SKILL_TREE;
  },
});

export const getPlayerSkills = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { skillPoints: 0, unlockedSkills: [] as string[] };
    const player = await ctx.db.get(userId);
    if (!player) return { skillPoints: 0, unlockedSkills: [] as string[] };
    return {
      skillPoints: player.skillPoints ?? 0,
      unlockedSkills: (player as any).unlockedSkills ?? [],
    };
  },
});

export const unlockSkill = mutation({
  args: { skillId: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");

    const allSkills = Object.values(SKILL_TREE).flatMap(branch => branch.skills);
    const skill = allSkills.find(s => s.id === args.skillId);
    if (!skill) throw new Error("Skill not found!");

    const unlocked = (player as any).unlockedSkills ?? [];
    if (unlocked.includes(args.skillId)) throw new Error("Already unlocked!");
    if ((player.skillPoints ?? 0) < skill.cost) throw new Error("Not enough skill points!");

    const updates: Record<string, unknown> = {
      skillPoints: (player.skillPoints ?? 0) - skill.cost,
      unlockedSkills: [...unlocked, args.skillId],
    };

    // Apply stat bonus
    if (skill.stat === "attack") updates.attack = (player.attack ?? 10) + skill.bonus;
    else if (skill.stat === "defense") updates.defense = (player.defense ?? 10) + skill.bonus;
    else if (skill.stat === "maxLife") updates.maxLife = (player.maxLife ?? 100) + skill.bonus;

    await ctx.db.patch(player._id, updates);
    return { skill: skill.name, bonus: skill.bonus };
  },
});

// ===== DAILY LOGIN REWARDS =====
const DAILY_REWARDS = [
  { day: 1, money: 500, xp: 10, bonus: null },
  { day: 2, money: 1000, xp: 20, bonus: "Small Health Pack" },
  { day: 3, money: 1500, xp: 30, bonus: null },
  { day: 4, money: 2000, xp: 50, bonus: "Copper Key" },
  { day: 5, money: 3000, xp: 75, bonus: null },
  { day: 6, money: 5000, xp: 100, bonus: "Silver Key" },
  { day: 7, money: 10000, xp: 250, bonus: "Gold Key + Loot Box" },
];

export const getDailyLoginStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const player = await ctx.db.get(userId);
    if (!player) return null;
    const lastLogin = (player as any).lastDailyLogin ?? 0;
    const streak = (player as any).dailyLoginStreak ?? 0;
    const now = Date.now();
    const lastDay = new Date(lastLogin).toDateString();
    const today = new Date(now).toDateString();
    const claimed = lastDay === today;
    const lastMidnight = new Date(now).setHours(0, 0, 0, 0);
    const missedDay = lastLogin < lastMidnight && lastLogin > 0;
    const resetStreak = missedDay && (now - lastLogin > 172800000); // 48 hours
    const currentDay = resetStreak ? 1 : (claimed ? streak : streak + 1);
    return {
      streak: claimed ? streak : currentDay,
      claimed,
      rewards: DAILY_REWARDS,
      nextReward: DAILY_REWARDS[(resetStreak ? 0 : streak) % 7],
    };
  },
});

export const claimDailyLogin = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");

    const now = Date.now();
    const lastLogin = (player as any).lastDailyLogin ?? 0;
    const today = new Date(now).toDateString();
    const lastDay = new Date(lastLogin).toDateString();
    if (lastDay === today) throw new Error("Already claimed today!");

    const lastMidnight = new Date(now).setHours(0, 0, 0, 0);
    const missedDay = lastLogin < lastMidnight && lastLogin > 0;
    const resetStreak = missedDay && (now - lastLogin > 172800000);

    let streak = resetStreak ? 1 : ((player as any).dailyLoginStreak ?? 0) + 1;
    if (streak > 7) streak = 1;
    const reward = DAILY_REWARDS[(streak - 1) % 7];

    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + reward.money,
      experience: (player.experience ?? 0) + reward.xp,
      lastDailyLogin: now,
      dailyLoginStreak: streak,
      skillPoints: (player.skillPoints ?? 0) + 1,
    } as any);

    return {
      day: streak,
      money: reward.money,
      ...(await addXpAndCheckLevel(ctx, player, 25)),
      xp: reward.xp,
      bonus: reward.bonus,
      skillPoints: 1,
    };
  },
});

// ===== CRAFTING SYSTEM =====
const CRAFTING_RECIPES = [
  { id: "craft_knife", name: "Shiv", ingredients: ["Scrap Metal x2"], result: { attack: 5 }, cost: 500 },
  { id: "craft_armor", name: "Makeshift Armor", ingredients: ["Leather x3"], result: { defense: 5 }, cost: 800 },
  { id: "craft_gun", name: "Street Revolver", ingredients: ["Scrap Metal x3", "Wire x1"], result: { attack: 15 }, cost: 3000 },
  { id: "craft_vest", name: "Ballistic Vest", ingredients: ["Kevlar x2", "Leather x2"], result: { defense: 15 }, cost: 3500 },
  { id: "craft_explosive", name: "Pipe Bomb", ingredients: ["Gunpowder x3", "Scrap Metal x1"], result: { attack: 25 }, cost: 5000 },
  { id: "craft_tactical", name: "Tactical Helmet", ingredients: ["Kevlar x1", "Wire x2"], result: { defense: 10, maxLife: 20 }, cost: 4000 },
];

export const getCraftingRecipes = query({
  args: {},
  handler: async () => CRAFTING_RECIPES,
});

export const craftItem = mutation({
  args: { recipeId: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (player.inPrison) throw new Error("You are in prison!");

    const recipe = CRAFTING_RECIPES.find(r => r.id === args.recipeId);
    if (!recipe) throw new Error("Recipe not found!");
    if ((player.money ?? 0) < recipe.cost) throw new Error("Not enough money!");

    const updates: Record<string, unknown> = {
      money: player.money - recipe.cost,
      ...(await addXpAndCheckLevel(ctx, player, 40)),
      skillPoints: (player.skillPoints ?? 0) + 1,
    };

    if (recipe.result.attack) updates.attack = (player.attack ?? 10) + recipe.result.attack;
    if (recipe.result.defense) updates.defense = (player.defense ?? 10) + recipe.result.defense;
    if (recipe.result.maxLife) updates.maxLife = (player.maxLife ?? 100) + recipe.result.maxLife;

    await ctx.db.patch(player._id, updates);
    return { crafted: recipe.name, cost: recipe.cost };
  },
});

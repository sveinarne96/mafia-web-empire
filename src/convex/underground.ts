import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper: get current auth user
async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

export const getBlackMarketItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("blackMarketItems").withIndex("by_available", (q) => q.eq("available", true)).collect();
  },
});

export const refreshBlackMarket = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (Date.now() - (player.lastBlackMarketRefresh ?? 0) < 3600000) throw new Error("Black market refreshes every hour.");
    await ctx.db.patch(player._id, { lastBlackMarketRefresh: Date.now() });
    return { success: true };
  },
});

export const buyBlackMarketItem = mutation({
  args: { itemId: v.id("blackMarketItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const item = await ctx.db.get(args.itemId);
    if (!item || !item.available) throw new Error("Item not available");
    if (player.money < item.price) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: player.money - item.price });
    await ctx.db.patch(args.itemId, { available: false });
    return { success: true, item: item.name };
  },
});

export const launderMoney = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const dirty = player.dirtyMoney ?? 0;
    if (dirty < args.amount) throw new Error("Not enough dirty money");
    const cleanAmount = Math.floor(args.amount * 0.7);
    await ctx.db.patch(player._id, {
      dirtyMoney: dirty - args.amount,
      money: player.money + cleanAmount,
      totalLaundered: (player.totalLaundered ?? 0) + cleanAmount,
      reputation: player.reputation - 2,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "money_laundering", target: "self", success: true,
      moneyEarned: cleanAmount, pointsEarned: 5, damageTaken: 0, timestamp: Date.now(),
    });
    return { cleanAmount, fee: args.amount - cleanAmount };
  },
});

export const counterfeiting = mutation({
  args: { quality: v.union(v.literal("low"), v.literal("medium"), v.literal("high")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const costs: Record<string, number> = { low: 500, medium: 1500, high: 4000 };
    const rewards: Record<string, number> = { low: 800, medium: 3000, high: 8000 };
    const arrestChances: Record<string, number> = { low: 0.05, medium: 0.15, high: 0.30 };
    const cost = costs[args.quality];
    const reward = rewards[args.quality];
    if ((player.money ?? 0) < cost) throw new Error("Not enough money");
    if (Math.random() < arrestChances[args.quality]) {
      const prisonTime = 60 + Math.floor(Math.random() * 120);
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) - cost, inPrison: true, prisonTime,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1), reputation: (player.reputation ?? 0) - 5,
      });
      return { success: false, message: "Caught counterfeiting!", prisonTime };
    }
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost + reward,
      counterfeitSkill: (player.counterfeitSkill ?? 0) + 1,
      dirtyMoney: (player.dirtyMoney ?? 0) + Math.floor(reward * 0.5),
      reputation: (player.reputation ?? 0) - 1,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "counterfeiting", target: "self", success: true,
      moneyEarned: reward, pointsEarned: 10, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, earned: reward, dirty: Math.floor(reward * 0.5) };
  },
});

export const runSmuggling = mutation({
  args: { destCity: v.string(), contrabandType: v.string(), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player.location === args.destCity) throw new Error("Already in that city");
    const baseCost: Record<string, number> = { drugs: 200, weapons: 500, electronics: 150, luxury: 300 };
    const cost = (baseCost[args.contrabandType] ?? 200) * args.quantity;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money");
    const riskChance = 0.15 + (player.wantedLevel * 0.05);
    if (Math.random() < riskChance) {
      const prisonTime = 120 + Math.floor(Math.random() * 240);
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) - cost, inPrison: true, prisonTime,
        wantedLevel: Math.min(5, player.wantedLevel + 2),
      });
      await ctx.db.insert("crimes", {
        userId: player._id, type: "smuggling", target: args.destCity, success: false,
        moneyEarned: 0, pointsEarned: 0, damageTaken: 0, timestamp: Date.now(),
      });
      return { success: false, message: "Caught smuggling!", prisonTime };
    }
    const sellMultiplier = 1.8 + Math.random() * 0.5;
    const profit = Math.floor(cost * sellMultiplier);
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost + profit,
      smugglingRuns: (player.smugglingRuns ?? 0) + 1,
      dirtyMoney: (player.dirtyMoney ?? 0) + Math.floor(profit * 0.3),
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "smuggling", target: args.destCity, success: true,
      moneyEarned: profit, pointsEarned: 15, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, profit, destination: args.destCity };
  },
});

export const drugTrafficking = mutation({
  args: { destCity: v.string(), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const cost = 150 * args.quantity;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money");
    const riskChance = 0.2 + (player.wantedLevel * 0.08);
    if (Math.random() < riskChance) {
      const prisonTime = 180 + Math.floor(Math.random() * 360);
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) - cost, inPrison: true, prisonTime,
        wantedLevel: Math.min(5, player.wantedLevel + 2), reputation: player.reputation - 8,
      });
      return { success: false, message: "Drug bust!", prisonTime };
    }
    const priceVariation = 0.8 + Math.random() * 0.8;
    const profit = Math.floor(cost * 2.5 * priceVariation);
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost + profit,
      drugDeals: (player.drugDeals ?? 0) + 1,
      dirtyMoney: (player.dirtyMoney ?? 0) + Math.floor(profit * 0.5),
      reputation: player.reputation - 3,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "drug_trafficking", target: args.destCity, success: true,
      moneyEarned: profit, pointsEarned: 20, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, profit };
  },
});

export const commitArson = mutation({
  args: { targetName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const cost = 5000;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money");
    const insurancePayout = 10000 + Math.floor(Math.random() * 15000);
    if (Math.random() < 0.25) {
      const prisonTime = 300 + Math.floor(Math.random() * 300);
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) - cost, inPrison: true, prisonTime,
        wantedLevel: Math.min(5, player.wantedLevel + 2), reputation: (player.reputation ?? 0) - 10,
      });
      return { success: false, message: "Arson investigation caught you!", prisonTime };
    }
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost + insurancePayout,
      arsons: (player.arsons ?? 0) + 1, reputation: (player.reputation ?? 0) - 5,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "arson", target: args.targetName, success: true,
      moneyEarned: insurancePayout, pointsEarned: 25, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, insurancePayout };
  },
});

export const commitIdentityTheft = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    if (target._id === player._id) throw new Error("Cannot steal your own identity");
    const skillBonus = (player.counterfeitSkill ?? 0) * 2;
    const successChance = 0.3 + skillBonus / 100;
    if (Math.random() > successChance) {
      const prisonTime = 120 + Math.floor(Math.random() * 180);
      await ctx.db.patch(player._id, {
        inPrison: true, prisonTime,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1), reputation: (player.reputation ?? 0) - 5,
      });
      return { success: false, message: "Identity theft failed!", prisonTime };
    }
    const stolen = Math.floor((target.bank ?? 0) * 0.15);
    await ctx.db.patch(args.targetId, { bank: (target.bank ?? 0) - stolen });
    await ctx.db.patch(player._id, {
      identityThefts: (player.identityThefts ?? 0) + 1,
      dirtyMoney: (player.dirtyMoney ?? 0) + stolen,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "identity_theft", target: target.nickname ?? "unknown", success: true,
      moneyEarned: stolen, pointsEarned: 30, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, stolen };
  },
});

export const kidnapPlayer = mutation({
  args: { victimId: v.id("users"), ransom: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const victim = await ctx.db.get(args.victimId);
    if (!victim) throw new Error("Victim not found");
    if (victim._id === player._id) throw new Error("Cannot kidnap yourself");
    if (victim.inPrison || victim.isDead) throw new Error("Target unavailable");
    if (player.location !== victim.location) throw new Error("Must be in same city");
    if (Math.random() < 0.2) {
      const prisonTime = 240 + Math.floor(Math.random() * 240);
      await ctx.db.patch(player._id, {
        inPrison: true, prisonTime,
        wantedLevel: Math.min(5, player.wantedLevel + 2), reputation: (player.reputation ?? 0) - 10,
      });
      return { success: false, message: "Police intercepted!", prisonTime };
    }
    await ctx.db.insert("kidnappings", {
      kidnapperId: player._id, victimId: args.victimId, ransom: args.ransom,
      ransomPaid: false, released: false, createdAt: Date.now(),
    });
    await ctx.db.patch(player._id, { kidnappings: (player.kidnappings ?? 0) + 1 });
    return { success: true, message: `Kidnapped ${victim.nickname}! Ransom: $${args.ransom.toLocaleString()}` };
  },
});

export const payRansom = mutation({
  args: { kidnappingId: v.id("kidnappings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const k = await ctx.db.get(args.kidnappingId);
    if (!k || k.victimId !== player._id) throw new Error("Not your kidnapping");
    if (k.ransomPaid || k.released) throw new Error("Already resolved");
    if ((player.money ?? 0) < k.ransom) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - k.ransom });
    const kidnapper = await ctx.db.get(k.kidnapperId);
    if (kidnapper) await ctx.db.patch(k.kidnapperId, { money: (kidnapper.money ?? 0) + k.ransom });
    await ctx.db.patch(args.kidnappingId, { ransomPaid: true, released: true });
    return { success: true, paid: k.ransom };
  },
});

export const commitCargoTheft = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const dockCities = ["Miami", "New York", "Los Angeles", "Chicago", "Dallas"];
    if (!dockCities.includes(player.location)) throw new Error("Must be in a dock city");
    if (Math.random() < 0.2) {
      const prisonTime = 180 + Math.floor(Math.random() * 180);
      await ctx.db.patch(player._id, {
        inPrison: true, prisonTime,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1),
      });
      return { success: false, message: "Security caught you!", prisonTime };
    }
    const profit = 3000 + Math.floor(Math.random() * 7000);
    await ctx.db.patch(player._id, {
      money: player.money + profit,
      cargoThefts: (player.cargoThefts ?? 0) + 1,
      dirtyMoney: (player.dirtyMoney ?? 0) + Math.floor(profit * 0.4),
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "cargo_theft", target: "docks", success: true,
      moneyEarned: profit, pointsEarned: 15, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, profit };
  },
});

export const commitArmsDeal = mutation({
  args: { action: v.union(v.literal("buy"), v.literal("sell")), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (args.action === "buy") {
      const cost = 800 * args.quantity;
      if ((player.money ?? 0) < cost) throw new Error("Not enough money");
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) - cost,
        attack: player.attack + args.quantity * 2,
        armsDeals: (player.armsDeals ?? 0) + args.quantity,
      });
      return { success: true, message: `Bought ${args.quantity} weapons (+${args.quantity * 2} ATK)` };
    }
    const profit = 1200 * args.quantity;
    await ctx.db.patch(player._id, {
      money: player.money + profit,
      armsDeals: (player.armsDeals ?? 0) + args.quantity,
      dirtyMoney: (player.dirtyMoney ?? 0) + Math.floor(profit * 0.3),
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "arms_dealing", target: "market", success: true,
      moneyEarned: profit, pointsEarned: 10, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, profit };
  },
});

export const witnessIntimidation = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.wantedLevel ?? 0) <= 0) throw new Error("No wanted level");
    const cost = player.wantedLevel * 1000;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money");
    if (Math.random() < 0.6) {
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) - cost,
        wantedLevel: Math.max(0, player.wantedLevel - 1),
        witnessIntimidations: (player.witnessIntimidations ?? 0) + 1,
        reputation: player.reputation - 2,
      });
      return { success: true, message: "Witnesses intimidated!", cost };
    }
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost,
      wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1),
      reputation: player.reputation - 3,
    });
    return { success: false, message: "Intimidation backfired!", cost };
  },
});

export const commitTaxEvasion = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player.money < args.amount) throw new Error("Not enough money");
    const auditChance = 0.1 + (args.amount / 100000) * 0.3;
    if (Math.random() < auditChance) {
      const fine = args.amount * 2;
      await ctx.db.patch(player._id, {
        money: Math.max(0, player.money - fine),
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1),
        reputation: player.reputation - 3,
      });
      return { success: false, message: "Audited! Fine imposed.", fine };
    }
    const saved = Math.floor(args.amount * 0.3);
    await ctx.db.patch(player._id, {
      money: player.money + saved,
      dirtyMoney: (player.dirtyMoney ?? 0) + saved,
    });
    return { success: true, saved };
  },
});

export const runRacketeering = mutation({
  args: { targetBusiness: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (Math.random() < 0.15) {
      const prisonTime = 120;
      await ctx.db.patch(player._id, {
        inPrison: true, prisonTime,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1), reputation: (player.reputation ?? 0) - 5,
      });
      return { success: false, message: "Business owner called police!", prisonTime };
    }
    const pay = 500 + Math.floor(Math.random() * 1500);
    await ctx.db.patch(player._id, {
      money: player.money + pay,
      racketeeringIncome: (player.racketeeringIncome ?? 0) + pay,
      reputation: player.reputation - 2,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "racketeering", target: args.targetBusiness, success: true,
      moneyEarned: pay, pointsEarned: 10, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, protectionPay: pay };
  },
});

export const runGamblingDen = mutation({
  args: { betPool: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player.money < args.betPool) throw new Error("Not enough money");
    const revenue = Math.floor(args.betPool * (0.1 + Math.random() * 0.2));
    if (Math.random() < 0.1) {
      await ctx.db.patch(player._id, {
        money: player.money - args.betPool,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1),
      });
      return { success: false, message: "Police raided your den!", lost: args.betPool };
    }
    await ctx.db.patch(player._id, {
      money: player.money + revenue,
      gamblingDens: (player.gamblingDens ?? 0) + 1,
      dirtyMoney: (player.dirtyMoney ?? 0) + Math.floor(revenue * 0.5),
    });
    return { success: true, revenue };
  },
});

export const runProtectionRacket = mutation({
  args: { targetName: v.string(), weeklyFee: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (Math.random() < 0.12) {
      const prisonTime = 180;
      await ctx.db.patch(player._id, {
        inPrison: true, prisonTime,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1), reputation: (player.reputation ?? 0) - 5,
      });
      return { success: false, message: "Victim reported extortion!", prisonTime };
    }
    await ctx.db.patch(player._id, {
      money: player.money + args.weeklyFee,
      protectionRackets: (player.protectionRackets ?? 0) + 1,
      reputation: player.reputation - 2,
    });
    await ctx.db.insert("crimes", {
      userId: player._id, type: "protection_racket", target: args.targetName, success: true,
      moneyEarned: args.weeklyFee, pointsEarned: 8, damageTaken: 0, timestamp: Date.now(),
    });
    return { success: true, collected: args.weeklyFee };
  },
});

export const runLoanSharking = mutation({
  args: { borrowerId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player.money < args.amount) throw new Error("Not enough money");
    await ctx.db.patch(player._id, {
      money: player.money - args.amount,
      loanSharkDebts: (player.loanSharkDebts ?? 0) + args.amount,
    });
    await ctx.db.insert("loans", {
      borrowerId: args.borrowerId, amount: args.amount, interest: 0.3,
      dueAt: Date.now() + 86400000 * 7, paid: false,
    });
    return { success: true, lent: args.amount, expectedReturn: Math.floor(args.amount * 1.3) };
  },
});

export const runPirateRadio = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player.money < 1000) throw new Error("Not enough money");
    if (Math.random() < 0.1) {
      await ctx.db.patch(player._id, {
        money: player.money - 1000,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1),
      });
      return { success: false, message: "FCC shut down your broadcast!" };
    }
    const boost = 3 + Math.floor(Math.random() * 5);
    await ctx.db.patch(player._id, {
      money: player.money - 1000,
      reputation: Math.min(100, player.reputation + boost),
      pirateRadioBoost: (player.pirateRadioBoost ?? 0) + 1,
    });
    return { success: true, reputationBoost: boost };
  },
});

export const runIllegalBoxing = mutation({
  args: { entryFee: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (player.money < args.entryFee) throw new Error("Not enough money");
    if (Math.random() < 0.08) {
      const prisonTime = 90;
      await ctx.db.patch(player._id, {
        inPrison: true, prisonTime,
        wantedLevel: Math.min(5, (player.wantedLevel ?? 0) + 1),
      });
      return { success: false, message: "Police raided the ring!", prisonTime };
    }
    const houseCut = Math.floor(args.entryFee * 0.4);
    const win = Math.random() < 0.6 + (player.attack / 200);
    if (win) {
      const prize = args.entryFee * 3;
      await ctx.db.patch(player._id, {
        money: player.money - args.entryFee + prize + houseCut,
        illegalBoxingEvents: (player.illegalBoxingEvents ?? 0) + 1,
        experience: player.experience + 20,
      });
      return { success: true, won: true, prize, houseCut };
    }
    await ctx.db.patch(player._id, {
      money: player.money - args.entryFee + houseCut,
      life: Math.max(1, player.life - 20),
      illegalBoxingEvents: (player.illegalBoxingEvents ?? 0) + 1,
      experience: player.experience + 10,
    });
    return { success: true, won: false, houseCut, damage: 20 };
  },
});

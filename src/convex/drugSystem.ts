import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

function n(val: any, fallback: number): number {
  return typeof val === "number" && Number.isFinite(val) ? val : fallback;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// THC degrades 2% per day after 5 days without delivery
const THC_DEGRADATION_RATE = 0.02;
const THC_GRACE_PERIOD_MS = 5 * 24 * 3600000; // 5 days

// Crime categories that produce drugs, with base yield per crime
const CRIME_DRUG_YIELDS: Record<string, { drug: string; baseYield: number }> = {
  street: { drug: "cannabis", baseYield: 50 },
  robbery: { drug: "cannabis", baseYield: 100 },
  fraud: { drug: "mdma", baseYield: 30 },
  burglary: { drug: "cannabis", baseYield: 75 },
  drugs: { drug: "cocaine", baseYield: 150 },
  organized: { drug: "meth", baseYield: 200 },
  underground: { drug: "heroin", baseYield: 120 },
  gta_theft: { drug: "cannabis", baseYield: 80 },
  steal_house: { drug: "cannabis", baseYield: 60 },
  murder: { drug: "cocaine", baseYield: 250 },
};

const DRUG_NAMES: Record<string, string> = {
  cannabis: "Cannabis",
  cocaine: "Cocaine",
  meth: "Methamphetamine",
  mdma: "MDMA",
  heroin: "Heroin",
};

const MARKETING_CHANNELS = [
  { id: "website", name: "Websites", cost: 50000, demandBoost: 200 },
  { id: "social", name: "Social Media", cost: 25000, demandBoost: 100 },
  { id: "street", name: "Street Marketing", cost: 10000, demandBoost: 50 },
  { id: "dealer", name: "Dealer Network", cost: 100000, demandBoost: 500 },
  { id: "darkweb", name: "Dark Web", cost: 200000, demandBoost: 1000 },
];

function randomOffer(drugId: string, level: number) {
  const basePrice = drugId === "cannabis" ? 100 : drugId === "cocaine" ? 500 : drugId === "meth" ? 350 : drugId === "mdma" ? 250 : 400;
  const qty = Math.floor(Math.random() * 50000 * level) + 1000;
  const discount = 0.7 + Math.random() * 0.3;
  const price = Math.floor(basePrice * qty * discount);
  return {
    offerId: `${drugId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: Math.random() < 0.5 ? "buy" : "contract",
    drug: drugId,
    quantity: qty,
    price,
    thcContent: drugId === "cannabis" ? Math.floor(15 + Math.random() * 25) : 0,
    expiresAt: Date.now() + 24 * 3600000,
  };
}

// Calculate degraded THC based on time since last delivery
function calculateDegradedThc(originalThc: number, lastDelivery: number, now: number): number {
  if (lastDelivery === 0) return originalThc;
  const elapsed = now - lastDelivery;
  if (elapsed <= THC_GRACE_PERIOD_MS) return originalThc;
  const daysOverdue = Math.floor((elapsed - THC_GRACE_PERIOD_MS) / (24 * 3600000));
  const degradation = daysOverdue * THC_DEGRADATION_RATE;
  return Math.max(1, Math.floor(originalThc * (1 - degradation)));
}

// ===== DRUG TRADE STATE =====
export const getDrugTrade = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const player = await ctx.db.get(userId);
    if (!player) return null;
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) return null;
    const level = player.level ?? 1;
    const maxStock = 100000 + level * 10000;
    const now = Date.now();
    const demandGrowth = n(trade.marketingBudget, 0) * 0.001 + n(trade.totalDelivered, 0) * 0.01;
    const demand = Math.min(maxStock * 2, Math.floor(n(trade.demand, 1000) + demandGrowth));
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);
    const daysSinceDelivery = trade.lastDelivery > 0 ? Math.floor((now - trade.lastDelivery) / (24 * 3600000)) : 0;
    const thcDegrading = daysSinceDelivery > 5;
    const daysUntilDegradation = thcDegrading ? 0 : Math.max(0, 5 - daysSinceDelivery);
    const totalStock = n(trade.cannabisStock, 0) + n(trade.crimeStock, 0);
    return {
      cannabisStock: n(trade.cannabisStock, 0),
      crimeStock: n(trade.crimeStock, 0),
      totalStock,
      thcContent: currentThc,
      originalThc: n(trade.originalThc, 30),
      thcDegrading,
      daysUntilDegradation,
      pricePerGram: n(trade.pricePerGram, 100),
      demand,
      totalDelivered: n(trade.totalDelivered, 0),
      totalRevenue: n(trade.totalRevenue, 0),
      marketingBudget: n(trade.marketingBudget, 0),
      marketingChannels: trade.marketingChannels ?? [],
      activeCampaigns: trade.activeCampaigns ?? [],
      contracts: trade.contracts ?? [],
      customerRating: n(trade.customerRating, 1.0),
      totalReviews: n(trade.totalReviews, 0),
      lastRestock: n(trade.lastRestock, 0),
      lastDelivery: n(trade.lastDelivery, 0),
      daysSinceDelivery,
      maxStock,
      level,
      marketingChannelsDef: MARKETING_CHANNELS,
    };
  },
});

// ===== INITIALIZE DRUG TRADE =====
export const initDrugTrade = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return { success: true, alreadyInit: true };
    await ctx.db.insert("drugTrades", {
      userId,
      cannabisStock: 0,
      thcContent: 30,
      pricePerGram: 100,
      demand: 1000,
      totalDelivered: 0,
      totalRevenue: 0,
      marketingBudget: 0,
      marketingChannels: [],
      activeCampaigns: [],
      contracts: [],
      customerRating: 1.0,
      totalReviews: 0,
      lastRestock: Date.now(),
      lastDelivery: Date.now(),
      crimeStock: 0,
      lastCrimeDrugTime: 0,
      originalThc: 30,
    });
    return { success: true };
  },
});

// ===== ACCRUE DRUGS FROM CRIME (called by recordCrime) =====
export const accrueCrimeDrugs = mutation({
  args: { category: v.string(), reward: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const player = await ctx.db.get(userId);
    if (!player) return null;
    const yieldDef = CRIME_DRUG_YIELDS[args.category];
    if (!yieldDef) return null;
    const level = player.level ?? 1;
    const rewardBonus = 1 + Math.min(2, args.reward / 50000);
    const levelBonus = 1 + (level - 1) * 0.05;
    const yield_ = Math.floor(yieldDef.baseYield * rewardBonus * levelBonus * (0.8 + Math.random() * 0.4));
    if (yield_ <= 0) return null;
    let trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) {
      await ctx.db.insert("drugTrades", {
        userId,
        cannabisStock: 0,
        thcContent: 30,
        pricePerGram: 100,
        demand: 1000,
        totalDelivered: 0,
        totalRevenue: 0,
        marketingBudget: 0,
        marketingChannels: [],
        activeCampaigns: [],
        contracts: [],
        customerRating: 1.0,
        totalReviews: 0,
        lastRestock: Date.now(),
        lastDelivery: Date.now(),
        crimeStock: yield_,
        lastCrimeDrugTime: Date.now(),
        originalThc: 30,
      });
    } else {
      await ctx.db.patch(trade._id, {
        crimeStock: n(trade.crimeStock, 0) + yield_,
        lastCrimeDrugTime: Date.now(),
      });
    }
    return { success: true, drug: yieldDef.drug, quantity: yield_ };
  },
});

// ===== BUY STOCK (with money) =====
export const buyStock = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const qty = Math.max(100, Math.floor(args.quantity));
    const pricePerGram = n(trade.pricePerGram, 100);
    const cost = qty * pricePerGram;
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()}`);
    const maxStock = 100000 + (player.level ?? 1) * 10000;
    const totalStock = n(trade.cannabisStock, 0) + n(trade.crimeStock, 0) + qty;
    if (totalStock > maxStock) throw new Error(`Max stock ${maxStock.toLocaleString()}g`);
    await ctx.db.patch(trade._id, {
      cannabisStock: n(trade.cannabisStock, 0) + qty,
      lastRestock: Date.now(),
    });
    await ctx.db.patch(userId, { money: n(player.money, 0) - cost });
    return { success: true, stock: totalStock, cost };
  },
});

// ===== DELIVER =====
export const deliver = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const crimeStock = n(trade.crimeStock, 0);
    const buyStock = n(trade.cannabisStock, 0);
    const totalAvail = crimeStock + buyStock;
    const qty = Math.max(100, Math.floor(args.quantity));
    if (totalAvail < qty) throw new Error(`Not enough stock (${totalAvail.toLocaleString()}g available)`);
    const now = Date.now();
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);
    const thcMultiplier = 1 + (currentThc - 20) * 0.01;
    const pricePerGram = n(trade.pricePerGram, 100);
    const demand = n(trade.demand, 1000);
    const delivered = Math.min(qty, demand);
    const revenue = Math.floor(delivered * pricePerGram * thcMultiplier);
    const rating = Math.min(5.0, n(trade.customerRating, 1.0) + (delivered >= qty ? 0.01 : -0.02));
    const newDemand = Math.max(0, demand - delivered + Math.floor(delivered * 0.1));
    // Deduct from crime stock first, then bought stock
    let newCrimeStock = crimeStock;
    let newBuyStock = buyStock;
    let remaining = qty;
    if (newCrimeStock >= remaining) {
      newCrimeStock -= remaining;
      remaining = 0;
    } else {
      remaining -= newCrimeStock;
      newCrimeStock = 0;
      newBuyStock -= remaining;
      remaining = 0;
    }
    await ctx.db.patch(trade._id, {
      crimeStock: newCrimeStock,
      cannabisStock: newBuyStock,
      demand: newDemand,
      totalDelivered: n(trade.totalDelivered, 0) + delivered,
      totalRevenue: n(trade.totalRevenue, 0) + revenue,
      customerRating: rating,
      totalReviews: n(trade.totalReviews, 0) + 1,
      lastDelivery: now,
      thcContent: currentThc,
      originalThc: currentThc,
    });
    await ctx.db.patch(userId, { money: n(player.money, 0) + revenue });
    return { success: true, delivered, revenue, demand: newDemand, rating, thcUsed: currentThc };
  },
});

// ===== SET THC CONTENT =====
export const setThcContent = mutation({
  args: { thc: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const thc = Math.max(5, Math.min(90, Math.floor(args.thc)));
    const priceBoost = 1 + (thc - 20) * 0.02;
    await ctx.db.patch(trade._id, {
      thcContent: thc,
      originalThc: thc,
      pricePerGram: Math.floor(100 * priceBoost),
    });
    return { success: true, thc, pricePerGram: Math.floor(100 * priceBoost) };
  },
});

// ===== SET MARKETING BUDGET =====
export const setMarketingBudget = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const amount = Math.max(0, Math.floor(args.amount));
    if (n(player.money, 0) < amount) throw new Error("Not enough money");
    await ctx.db.patch(trade._id, { marketingBudget: amount });
    if (amount > 0) await ctx.db.patch(userId, { money: n(player.money, 0) - amount });
    return { success: true, budget: amount };
  },
});

// ===== BUY MARKETING CHANNEL =====
export const buyMarketingChannel = mutation({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const channel = MARKETING_CHANNELS.find((c) => c.id === args.channelId);
    if (!channel) throw new Error("Unknown channel");
    const owned: string[] = trade.marketingChannels ?? [];
    if (owned.includes(args.channelId)) throw new Error("Already owned");
    if (n(player.money, 0) < channel.cost) throw new Error(`Need $${channel.cost.toLocaleString()}`);
    await ctx.db.patch(trade._id, { marketingChannels: [...owned, args.channelId] });
    await ctx.db.patch(userId, { money: n(player.money, 0) - channel.cost });
    return { success: true, channel: channel.name };
  },
});

// ===== ACCEPT CONTRACT =====
export const acceptContract = mutation({
  args: { offerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const offers: any[] = trade.contracts ?? [];
    const offer = offers.find((o: any) => o.offerId === args.offerId && !o.accepted);
    if (!offer) throw new Error("Contract not found");
    const totalAvail = n(trade.cannabisStock, 0) + n(trade.crimeStock, 0);
    if (totalAvail < offer.quantity) throw new Error("Not enough stock");
    const revenue = Math.floor(offer.quantity * n(trade.pricePerGram, 100) * 1.5);
    const updatedOffers = offers.map((o: any) => (o.offerId === args.offerId ? { ...o, accepted: true } : o));
    let remaining = offer.quantity;
    let newCrimeStock = n(trade.crimeStock, 0);
    let newBuyStock = n(trade.cannabisStock, 0);
    if (newCrimeStock >= remaining) { newCrimeStock -= remaining; remaining = 0; } else { remaining -= newCrimeStock; newCrimeStock = 0; newBuyStock -= remaining; remaining = 0; }
    await ctx.db.patch(trade._id, { contracts: updatedOffers, crimeStock: newCrimeStock, cannabisStock: newBuyStock, totalDelivered: n(trade.totalDelivered, 0) + offer.quantity, totalRevenue: n(trade.totalRevenue, 0) + revenue });
    const player = await ctx.db.get(userId);
    if (player) await ctx.db.patch(userId, { money: n(player.money, 0) + revenue });
    return { success: true, revenue };
  },
});

// ===== Q'S MARKET =====
export const getQsOffers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const today = todayStr();
    const existing = await ctx.db
      .query("qsOffers")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", today))
      .collect();
    return { day: today, offers: existing.map((o) => ({ offerId: o.offerId, type: o.type, drug: o.drug, quantity: o.quantity, price: o.price, thcContent: o.thcContent, expiresAt: o.expiresAt, accepted: o.accepted })) };
  },
});

export const generateQsOffers = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const today = todayStr();
    const level = player.level ?? 1;
    const existing = await ctx.db.query("qsOffers").withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", today)).collect();
    if (existing.length > 0) return { success: true, count: existing.length };
    const old = await ctx.db.query("qsOffers").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const weekAgo = Date.now() - 7 * 24 * 3600000;
    for (const o of old) { if (o.expiresAt < weekAgo || o.day !== today) await ctx.db.delete(o._id); }
    const numOffers = 3 + Math.floor(Math.random() * 3);
    const drugIds = ["cannabis", "cocaine", "meth", "mdma", "heroin"];
    const offers: any[] = [];
    for (let i = 0; i < numOffers; i++) { const drugId = drugIds[Math.floor(Math.random() * drugIds.length)]; offers.push(randomOffer(drugId, level)); }
    for (const offer of offers) {
      await ctx.db.insert("qsOffers", { userId, offerId: offer.offerId, type: offer.type, drug: offer.drug, quantity: offer.quantity, price: offer.price, thcContent: offer.thcContent, expiresAt: offer.expiresAt, accepted: false, day: today });
    }
    return { success: true, count: offers.length };
  },
});

export const acceptQsOffer = mutation({
  args: { offerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const today = todayStr();
    const allOffers = await ctx.db.query("qsOffers").withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", today)).collect();
    const match = allOffers.find((o) => o.offerId === args.offerId);
    if (!match) throw new Error("Offer not found");
    if (match.accepted) throw new Error("Already accepted");
    if (match.expiresAt <= Date.now()) throw new Error("Expired");
    if (n(player.money, 0) < match.price) throw new Error("Not enough money");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) {
      await ctx.db.insert("drugTrades", { userId, cannabisStock: match.quantity, thcContent: match.thcContent, pricePerGram: Math.floor(match.price / match.quantity), demand: 1000, totalDelivered: 0, totalRevenue: 0, marketingBudget: 0, marketingChannels: [], activeCampaigns: [], contracts: [], customerRating: 1.0, totalReviews: 0, lastRestock: Date.now(), lastDelivery: Date.now(), crimeStock: 0, lastCrimeDrugTime: 0, originalThc: match.thcContent });
    } else {
      await ctx.db.patch(trade._id, { cannabisStock: n(trade.cannabisStock, 0) + match.quantity, lastRestock: Date.now() });
    }
    await ctx.db.patch(match._id, { accepted: true });
    await ctx.db.patch(userId, { money: n(player.money, 0) - match.price });
    return { success: true, drug: match.drug, quantity: match.quantity, cost: match.price };
  },
});

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

const DRUGS = [
  { id: "cannabis", name: "Cannabis", basePrice: 100, baseThc: 20, icon: "🌿" },
  { id: "cocaine", name: "Cocaine", basePrice: 500, baseThc: 0, icon: "❄️" },
  { id: "meth", name: "Methamphetamine", basePrice: 350, baseThc: 0, icon: "🧪" },
  { id: "mdma", name: "MDMA", basePrice: 250, baseThc: 0, icon: "💊" },
  { id: "heroin", name: "Heroin", basePrice: 400, baseThc: 0, icon: "💉" },
];

const MARKETING_CHANNELS = [
  { id: "website", name: "Websites", cost: 50000, demandBoost: 200 },
  { id: "social", name: "Social Media", cost: 25000, demandBoost: 100 },
  { id: "street", name: "Street Marketing", cost: 10000, demandBoost: 50 },
  { id: "dealer", name: "Dealer Network", cost: 100000, demandBoost: 500 },
  { id: "darkweb", name: "Dark Web", cost: 200000, demandBoost: 1000 },
];

function randomOffer(drugId: string, level: number) {
  const drug = DRUGS.find((d) => d.id === drugId) ?? DRUGS[0];
  const qty = Math.floor(Math.random() * 50000 * level) + 1000;
  const discount = 0.7 + Math.random() * 0.3;
  const price = Math.floor(drug.basePrice * qty * discount);
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
    const demandGrowth = n(trade.marketingBudget, 0) * 0.001 + n(trade.totalDelivered, 0) * 0.01;
    const demand = Math.min(maxStock * 2, Math.floor(n(trade.demand, 1000) + demandGrowth));
    return {
      cannabisStock: n(trade.cannabisStock, 0),
      thcContent: n(trade.thcContent, 30),
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
      maxStock,
      level,
      drugs: DRUGS,
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
      cannabisStock: 1000,
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
      lastDelivery: 0,
    });
    return { success: true };
  },
});

// ===== BUY STOCK =====
export const buyStock = mutation({
  args: { quantity: v.number(), drugId: v.optional(v.string()) },
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
    const drugId = args.drugId ?? "cannabis";
    const drug = DRUGS.find((d) => d.id === drugId) ?? DRUGS[0];
    const qty = Math.max(100, Math.floor(args.quantity));
    const cost = drug.basePrice * qty;
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()} to buy ${qty}g of ${drug.name}`);
    const maxStock = 100000 + (player.level ?? 1) * 10000;
    const newStock = n(trade.cannabisStock, 0) + qty;
    if (newStock > maxStock) throw new Error(`Max stock is ${maxStock.toLocaleString()}g. You have ${n(trade.cannabisStock, 0).toLocaleString()}g`);
    await ctx.db.patch(trade._id, {
      cannabisStock: newStock,
      pricePerGram: drugId === "cannabis" ? n(trade.pricePerGram, 100) : drug.basePrice,
      thcContent: drugId === "cannabis" ? n(trade.thcContent, 30) : drug.baseThc,
      lastRestock: Date.now(),
    });
    await ctx.db.patch(userId, { money: n(player.money, 0) - cost });
    return { success: true, stock: newStock, cost };
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
    const stock = n(trade.cannabisStock, 0);
    const qty = Math.max(100, Math.floor(args.quantity));
    if (stock < qty) throw new Error(`Not enough stock. You have ${stock.toLocaleString()}g`);
    const demand = n(trade.demand, 1000);
    const delivered = Math.min(qty, demand);
    const pricePerGram = n(trade.pricePerGram, 100);
    const revenue = delivered * pricePerGram;
    const rating = Math.min(5.0, n(trade.customerRating, 1.0) + (delivered >= qty ? 0.01 : -0.02));
    const newDemand = Math.max(0, demand - delivered + Math.floor(delivered * 0.1));
    await ctx.db.patch(trade._id, {
      cannabisStock: stock - qty,
      demand: newDemand,
      totalDelivered: n(trade.totalDelivered, 0) + delivered,
      totalRevenue: n(trade.totalRevenue, 0) + revenue,
      customerRating: rating,
      totalReviews: n(trade.totalReviews, 0) + 1,
      lastDelivery: Date.now(),
    });
    await ctx.db.patch(userId, { money: n(player.money, 0) + revenue });
    return { success: true, delivered, revenue, demand: newDemand, rating };
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
    if (n(player.money, 0) < amount) throw new Error("Not enough money for marketing");
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
    if (!channel) throw new Error("Unknown marketing channel");
    const owned: string[] = trade.marketingChannels ?? [];
    if (owned.includes(args.channelId)) throw new Error("Already own this channel");
    if (n(player.money, 0) < channel.cost) throw new Error(`Need $${channel.cost.toLocaleString()}`);
    await ctx.db.patch(trade._id, { marketingChannels: [...owned, args.channelId] });
    await ctx.db.patch(userId, { money: n(player.money, 0) - channel.cost });
    return { success: true, channel: channel.name };
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
      pricePerGram: Math.floor(100 * priceBoost),
    });
    return { success: true, thc, pricePerGram: Math.floor(100 * priceBoost) };
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
    if (!offer) throw new Error("Contract not found or already accepted");
    if (n(trade.cannabisStock, 0) < offer.quantity) throw new Error("Not enough stock for this contract");
    const revenue = offer.quantity * n(trade.pricePerGram, 100) * 1.5;
    const updatedOffers = offers.map((o: any) => (o.offerId === args.offerId ? { ...o, accepted: true } : o));
    await ctx.db.patch(trade._id, {
      contracts: updatedOffers,
      cannabisStock: n(trade.cannabisStock, 0) - offer.quantity,
      totalDelivered: n(trade.totalDelivered, 0) + offer.quantity,
      totalRevenue: n(trade.totalRevenue, 0) + revenue,
    });
    const player = await ctx.db.get(userId);
    if (player) await ctx.db.patch(userId, { money: n(player.money, 0) + revenue });
    return { success: true, revenue };
  },
});

// ===== Q'S MARKET - READ OFFERS =====
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
    return {
      day: today,
      offers: existing.map((o) => ({
        offerId: o.offerId,
        type: o.type,
        drug: o.drug,
        quantity: o.quantity,
        price: o.price,
        thcContent: o.thcContent,
        expiresAt: o.expiresAt,
        accepted: o.accepted,
      })),
    };
  },
});

// ===== Q'S MARKET - GENERATE DAILY OFFERS =====
export const generateQsOffers = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const today = todayStr();
    const level = player.level ?? 1;
    // Check if today's offers already exist
    const existing = await ctx.db
      .query("qsOffers")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", today))
      .collect();
    if (existing.length > 0) return { success: true, count: existing.length };
    // Delete old offers (keep last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 3600000;
    const old = await ctx.db.query("qsOffers").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    for (const o of old) {
      if (o.expiresAt < weekAgo || o.day !== today) await ctx.db.delete(o._id);
    }
    const numOffers = 3 + Math.floor(Math.random() * 3);
    const drugIds = DRUGS.map((d) => d.id);
    const offers: any[] = [];
    for (let i = 0; i < numOffers; i++) {
      const drugId = drugIds[Math.floor(Math.random() * drugIds.length)];
      offers.push(randomOffer(drugId, level));
    }
    for (const offer of offers) {
      await ctx.db.insert("qsOffers", {
        userId,
        offerId: offer.offerId,
        type: offer.type,
        drug: offer.drug,
        quantity: offer.quantity,
        price: offer.price,
        thcContent: offer.thcContent,
        expiresAt: offer.expiresAt,
        accepted: false,
        day: today,
      });
    }
    return { success: true, count: offers.length };
  },
});

// ===== ACCEPT Q'S MARKET OFFER =====
export const acceptQsOffer = mutation({
  args: { offerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const today = todayStr();
    const allOffers = await ctx.db
      .query("qsOffers")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", today))
      .collect();
    const match = allOffers.find((o) => o.offerId === args.offerId);
    if (!match) throw new Error("Offer not found");
    if (match.accepted) throw new Error("Already accepted");
    if (match.expiresAt <= Date.now()) throw new Error("Offer expired");
    if (n(player.money, 0) < match.price) throw new Error("Not enough money");
    // Add stock to drug trade
    const trade = await ctx.db
      .query("drugTrades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!trade) {
      await ctx.db.insert("drugTrades", {
        userId,
        cannabisStock: match.quantity,
        thcContent: match.thcContent,
        pricePerGram: Math.floor(match.price / match.quantity),
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
        lastDelivery: 0,
      });
    } else {
      await ctx.db.patch(trade._id, {
        cannabisStock: n(trade.cannabisStock, 0) + match.quantity,
        lastRestock: Date.now(),
      });
    }
    await ctx.db.patch(match._id, { accepted: true });
    await ctx.db.patch(userId, { money: n(player.money, 0) - match.price });
    return { success: true, drug: match.drug, quantity: match.quantity, cost: match.price };
  },
});

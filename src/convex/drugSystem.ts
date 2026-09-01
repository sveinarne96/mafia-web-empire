import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { CAR_MARKET } from "../data/carMarket";
import { PACK_ITEMS } from "../data/objectives";

function n(val: any, fallback: number): number {
  return typeof val === "number" && Number.isFinite(val) ? val : fallback;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const THC_DEGRADATION_RATE = 0.02; // 2% per day after grace period
const THC_GRACE_PERIOD_MS = 5 * 24 * 3600000; // 5 days

// Crime categories yield specific drug types
const CRIME_DRUG_YIELDS: Record<string, { drug: string; baseYield: number; emoji: string }> = {
  street: { drug: "cannabis", baseYield: 50, emoji: "🌿" },
  robbery: { drug: "cannabis", baseYield: 100, emoji: "🌿" },
  fraud: { drug: "mdma", baseYield: 30, emoji: "💊" },
  burglary: { drug: "cannabis", baseYield: 75, emoji: "🌿" },
  drugs: { drug: "cocaine", baseYield: 150, emoji: "❄️" },
  organized: { drug: "meth", baseYield: 200, emoji: "🧪" },
  underground: { drug: "heroin", baseYield: 120, emoji: "💉" },
  gta_theft: { drug: "cannabis", baseYield: 80, emoji: "🌿" },
  steal_house: { drug: "cannabis", baseYield: 60, emoji: "🌿" },
  murder: { drug: "cocaine", baseYield: 250, emoji: "❄️" },
  heist: { drug: "meth", baseYield: 300, emoji: "🧪" },
};

// Marketing channels (websites, social media, street, etc.)
const MARKETING_CHANNELS = [
  { id: "basic_site", name: "Basic Website", cost: 50000, demandBoost: 200, searchBonus: 0.05, desc: "Simple landing page" },
  { id: "social_insta", name: "Instagram", cost: 25000, demandBoost: 150, searchBonus: 0.03, desc: "Social media presence" },
  { id: "social_tiktok", name: "TikTok Marketing", cost: 30000, demandBoost: 200, searchBonus: 0.04, desc: "Viral video reach" },
  { id: "social_twitter", name: "Twitter/X", cost: 20000, demandBoost: 100, searchBonus: 0.02, desc: "Tweet your product" },
  { id: "street_marketing", name: "Street Marketing", cost: 10000, demandBoost: 80, searchBonus: 0.01, desc: "Flyers and word of mouth" },
  { id: "dealer_network", name: "Dealer Network", cost: 100000, demandBoost: 500, searchBonus: 0.08, desc: "Reliable distribution" },
  { id: "dark_web", name: "Dark Web", cost: 200000, demandBoost: 1000, searchBonus: 0.12, desc: "Hidden marketplace" },
  { id: "premium_site", name: "Premium Website", cost: 500000, demandBoost: 2000, searchBonus: 0.20, desc: "Professional operation" },
  { id: "viral_campaign", name: "Viral Campaign", cost: 300000, demandBoost: 1500, searchBonus: 0.15, desc: "Internet-breaking campaign" },
  { id: "celebrity_endorse", name: "Celebrity Endorsement", cost: 1000000, demandBoost: 5000, searchBonus: 0.30, desc: "Famous faces sell" },
];

// Helper: calculate degraded THC
function calculateDegradedThc(originalThc: number, lastDelivery: number, now: number): number {
  if (lastDelivery === 0) return originalThc;
  const elapsed = now - lastDelivery;
  if (elapsed <= THC_GRACE_PERIOD_MS) return originalThc;
  const daysOverdue = Math.floor((elapsed - THC_GRACE_PERIOD_MS) / (24 * 3600000));
  const degradation = daysOverdue * THC_DEGRADATION_RATE;
  return Math.max(1, Math.floor(originalThc * (1 - degradation)));
}

// Price per gram based on drug type and THC
const DRUG_BASE_PRICES: Record<string, number> = {
  cannabis: 100,
  cocaine: 500,
  meth: 350,
  heroin: 400,
  mdma: 250,
};

// ===== GET DRUG TRADE STATE =====
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

    // Calculate current THC with degradation
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);
    const daysSinceDelivery = trade.lastDelivery > 0 ? Math.floor((now - trade.lastDelivery) / (24 * 3600000)) : 0;
    const thcDegrading = daysSinceDelivery > 5;
    const daysUntilDegradation = thcDegrading ? 0 : Math.max(0, 5 - daysSinceDelivery);

    const crimeStock = n(trade.crimeStock, 0);
    const boughtStock = n(trade.cannabisStock, 0);
    const totalStock = crimeStock + boughtStock;

    // Calculate price per gram based on THC and drug type
    const basePrice = DRUG_BASE_PRICES[trade.drugType || "cannabis"] ?? 100;
    const thcMultiplier = 1 + (currentThc - 20) * 0.015; // Higher THC = higher price
    const demandMultiplier = Math.min(3, 1 + n(trade.demand, 1000) / 5000); // High demand = price boost
    const pricePerGram = Math.floor(basePrice * thcMultiplier * demandMultiplier);

    // Calculate search capacity from marketing channels
    const ownedChannels: string[] = trade.marketingChannels ?? [];
    let totalSearchBonus = 0;
    let totalDemandBoost = 0;
    for (const ch of MARKETING_CHANNELS) {
      if (ownedChannels.includes(ch.id)) {
        totalSearchBonus += ch.searchBonus;
        totalDemandBoost += ch.demandBoost;
      }
    }

    // Effective demand (grows from marketing + deliveries)
    const demandGrowth = totalDemandBoost * 0.001 + n(trade.totalDelivered, 0) * 0.01 + n(trade.marketingBudget, 0) * 0.0005;
    const demand = Math.min(maxStock * 3, Math.floor(n(trade.demand, 1000) + demandGrowth));

    // Revenue preview for full stock delivery
    const estimatedRevenue = Math.floor(totalStock * pricePerGram * (1 + totalSearchBonus));

    return {
      // Stock
      crimeStock,
      boughtStock,
      totalStock,
      maxStock,
      drugType: trade.drugType || "cannabis",
      drugEmoji: Object.values(CRIME_DRUG_YIELDS).find(v => v.drug === (trade.drugType || "cannabis"))?.emoji || "🌿",

      // THC
      thcContent: currentThc,
      originalThc: n(trade.originalThc, 30),
      thcDegrading,
      daysUntilDegradation,
      daysSinceDelivery,

      // Pricing
      pricePerGram,
      estimatedRevenue,
      shipmentValue: Math.floor(totalStock * pricePerGram),

      // Demand & Marketing
      demand,
      marketingBudget: n(trade.marketingBudget, 0),
      marketingChannels: ownedChannels,
      marketingChannelsDef: MARKETING_CHANNELS,
      activeCampaigns: trade.activeCampaigns ?? [],
      totalSearchBonus,
      totalDemandBoost,

      // Stats
      totalDelivered: n(trade.totalDelivered, 0),
      totalRevenue: n(trade.totalRevenue, 0),
      customerRating: n(trade.customerRating, 1.0),
      totalReviews: n(trade.totalReviews, 0),

      // Contracts
      contracts: trade.contracts ?? [],

      // Timestamps
      lastRestock: n(trade.lastRestock, 0),
      lastDelivery: n(trade.lastDelivery, 0),
      level,
    };
  },
});

// ===== INITIALIZE DRUG TRADE =====
export const initDrugTrade = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
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
      drugType: "cannabis",
    });
    return { success: true };
  },
});

// ===== ACCRUE CRIME DRUGS (called from recordCrime) =====
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

    let trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
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
        drugType: yieldDef.drug,
      });
    } else {
      await ctx.db.patch(trade._id, {
        crimeStock: n(trade.crimeStock, 0) + yield_,
        lastCrimeDrugTime: Date.now(),
        drugType: yieldDef.drug,
      });
    }
    return { success: true, drug: yieldDef.drug, quantity: yield_, emoji: yieldDef.emoji };
  },
});

// ===== BUY STOCK (with cash) =====
export const buyStock = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const qty = Math.max(100, Math.floor(args.quantity));
    const maxStock = 100000 + (player.level ?? 1) * 10000;
    const totalStock = n(trade.cannabisStock, 0) + n(trade.crimeStock, 0) + qty;
    if (totalStock > maxStock) throw new Error(`Max stock ${maxStock.toLocaleString()}g`);

    const basePrice = DRUG_BASE_PRICES[trade.drugType || "cannabis"] ?? 100;
    const cost = qty * basePrice;
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()}`);

    await ctx.db.patch(trade._id, { cannabisStock: n(trade.cannabisStock, 0) + qty, lastRestock: Date.now() });
    await ctx.db.patch(userId, { money: n(player.money, 0) - cost });
    return { success: true, stock: totalStock, cost, quantity: qty };
  },
});

// ===== SET THC CONTENT =====
export const setThcContent = mutation({
  args: { thc: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your drug trade first");
    const thc = Math.max(5, Math.min(90, Math.floor(args.thc)));
    await ctx.db.patch(trade._id, { thcContent: thc, originalThc: thc });
    return { success: true, thc };
  },
});

// ===== DELIVER (single amount) =====
export const deliver = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your drug trade first");

    const crimeStock = n(trade.crimeStock, 0);
    const buyStockVal = n(trade.cannabisStock, 0);
    const totalAvail = crimeStock + buyStockVal;
    const qty = Math.max(1, Math.floor(args.quantity));
    if (totalAvail < qty) throw new Error(`Not enough stock (${totalAvail.toLocaleString()}g available)`);

    const now = Date.now();
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);

    // Calculate price
    const basePrice = DRUG_BASE_PRICES[trade.drugType || "cannabis"] ?? 100;
    const thcMultiplier = 1 + (currentThc - 20) * 0.015;

    // Search bonus from marketing channels
    const ownedChannels: string[] = trade.marketingChannels ?? [];
    let totalSearchBonus = 0;
    for (const ch of MARKETING_CHANNELS) {
      if (ownedChannels.includes(ch.id)) totalSearchBonus += ch.searchBonus;
    }

    const demand = n(trade.demand, 1000);
    const demandMultiplier = Math.min(3, 1 + demand / 5000);
    const pricePerGram = Math.floor(basePrice * thcMultiplier * demandMultiplier);

    // Deliver min of qty and demand
    const delivered = Math.min(qty, Math.max(demand, qty));
    const revenue = Math.floor(delivered * pricePerGram * (1 + totalSearchBonus));
    const rating = Math.min(5.0, n(trade.customerRating, 1.0) + (delivered >= qty ? 0.01 : -0.02));
    const newDemand = Math.max(0, demand - delivered + Math.floor(delivered * 0.1));

    // Deduct stock (crime first)
    let newCrimeStock = crimeStock;
    let newBuyStock = buyStockVal;
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

    return { success: true, delivered, revenue, demand: newDemand, rating, thcUsed: currentThc, pricePerGram, searchBonus: totalSearchBonus };
  },
});

// ===== DELIVER ALL =====
export const deliverAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your drug trade first");

    const crimeStock = n(trade.crimeStock, 0);
    const buyStockVal = n(trade.cannabisStock, 0);
    const totalAvail = crimeStock + buyStockVal;
    if (totalAvail <= 0) throw new Error("No stock to deliver");

    const now = Date.now();
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);

    const basePrice = DRUG_BASE_PRICES[trade.drugType || "cannabis"] ?? 100;
    const thcMultiplier = 1 + (currentThc - 20) * 0.015;

    const ownedChannels: string[] = trade.marketingChannels ?? [];
    let totalSearchBonus = 0;
    for (const ch of MARKETING_CHANNELS) {
      if (ownedChannels.includes(ch.id)) totalSearchBonus += ch.searchBonus;
    }

    const demand = n(trade.demand, 1000);
    const demandMultiplier = Math.min(3, 1 + demand / 5000);
    const pricePerGram = Math.floor(basePrice * thcMultiplier * demandMultiplier);

    const delivered = totalAvail;
    const revenue = Math.floor(delivered * pricePerGram * (1 + totalSearchBonus));
    const rating = Math.min(5.0, n(trade.customerRating, 1.0) + 0.01);
    const newDemand = Math.max(0, demand - delivered + Math.floor(delivered * 0.1));

    await ctx.db.patch(trade._id, {
      crimeStock: 0,
      cannabisStock: 0,
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

    return { success: true, delivered, revenue, demand: newDemand, rating, thcUsed: currentThc, pricePerGram, searchBonus: totalSearchBonus };
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
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
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
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
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
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
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

// ===== Q'S MARKET OFFERS =====
function randomDrugOffer(drugId: string, level: number) {
  const basePrices: Record<string, number> = { cannabis: 100, cocaine: 500, meth: 350, mdma: 250, heroin: 400 };
  const qty = Math.floor(Math.random() * 50000 * level) + 1000;
  const discount = 0.7 + Math.random() * 0.3;
  const price = Math.floor((basePrices[drugId] ?? 100) * qty * discount);
  return {
    offerId: `${drugId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "drug",
    itemType: drugId,
    name: drugId.charAt(0).toUpperCase() + drugId.slice(1),
    quantity: qty,
    price,
    thcContent: drugId === "cannabis" ? Math.floor(15 + Math.random() * 25) : 0,
    rarity: "common",
    icon: drugId === "cannabis" ? "🌿" : drugId === "cocaine" ? "❄️" : drugId === "meth" ? "🧪" : drugId === "mdma" ? "💊" : "💉",
    expiresAt: Date.now() + 24 * 3600000,
  };
}

function randomCarOffer(level: number) {
  let rarity = "common";
  const roll = Math.random() * 100;
  if (level >= 20 && roll < 3) rarity = "legendary";
  else if (level >= 15 && roll < 10) rarity = "epic";
  else if (level >= 8 && roll < 25) rarity = "rare";
  else if (level >= 5 && roll < 45) rarity = "rare";
  const carsOfRarity = CAR_MARKET.filter((c) => c.rarity === rarity);
  if (carsOfRarity.length === 0) return null;
  const car = carsOfRarity[Math.floor(Math.random() * carsOfRarity.length)];
  const discountPct = 0.4 + Math.random() * 0.3;
  const price = Math.floor(car.price * discountPct);
  return {
    offerId: `car_${car.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "car", itemType: car.id, name: car.name, quantity: 1, price,
    thcContent: 0, rarity: car.rarity, icon: "🚗",
    speed: car.speed, storage: car.storage,
    expiresAt: Date.now() + 24 * 3600000,
  };
}

function randomItemOffer(level: number) {
  let rarity = "common";
  const roll = Math.random() * 100;
  if (level >= 15 && roll < 5) rarity = "legendary";
  else if (level >= 10 && roll < 15) rarity = "epic";
  else if (level >= 5 && roll < 35) rarity = "rare";
  const itemsOfRarity = PACK_ITEMS[rarity] ?? PACK_ITEMS.common;
  if (!itemsOfRarity || itemsOfRarity.length === 0) return null;
  const item = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  const discountPct = 0.5 + Math.random() * 0.3;
  const price = Math.floor(item.price * discountPct);
  return {
    offerId: `item_${rarity}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "item", itemType: rarity, name: item.name, quantity: 1, price,
    thcContent: 0, rarity: item.rarity,
    icon: rarity === "legendary" ? "👑" : rarity === "epic" ? "💎" : rarity === "rare" ? "🔵" : "⚪",
    attack: item.attack, defense: item.defense,
    expiresAt: Date.now() + 24 * 3600000,
  };
}

function randomPackOffer(level: number) {
  let rarity = "common";
  const roll = Math.random() * 100;
  if (level >= 15 && roll < 5) rarity = "legendary";
  else if (level >= 10 && roll < 15) rarity = "epic";
  else if (level >= 5 && roll < 30) rarity = "rare";
  const packPrices: Record<string, number> = { common: 5_000, rare: 25_000, epic: 100_000, legendary: 500_000 };
  const packPrice = packPrices[rarity] ?? 5_000;
  const discountPct = 0.5 + Math.random() * 0.3;
  const price = Math.floor(packPrice * discountPct);
  const qty = rarity === "legendary" ? 1 : rarity === "epic" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1;
  return {
    offerId: `pack_${rarity}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "pack", itemType: rarity,
    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Pack${qty > 1 ? ` x${qty}` : ""}`,
    quantity: qty, price, thcContent: 0, rarity, icon: "📦",
    expiresAt: Date.now() + 24 * 3600000,
  };
}

export const getQsOffers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const today = todayStr();
    const existing = await ctx.db.query("qsOffers").withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", today)).collect();
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
    // Clean old
    const old = await ctx.db.query("qsOffers").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const weekAgo = Date.now() - 7 * 24 * 3600000;
    for (const o of old) { if (o.expiresAt < weekAgo || o.day !== today) await ctx.db.delete(o._id); }
    // Generate mixed offers
    const offers: any[] = [];
    const drugIds = ["cannabis", "cocaine", "meth", "mdma", "heroin"];
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) offers.push(randomDrugOffer(drugIds[Math.floor(Math.random() * drugIds.length)], level));
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) { const co = randomCarOffer(level); if (co) offers.push(co); }
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) { const io = randomItemOffer(level); if (io) offers.push(io); }
    offers.push(randomPackOffer(level));
    for (let i = offers.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [offers[i], offers[j]] = [offers[j], offers[i]]; }
    for (const offer of offers) {
      await ctx.db.insert("qsOffers", {
        userId, offerId: offer.offerId, type: offer.type, drug: offer.itemType,
        quantity: offer.quantity, price: offer.price, thcContent: offer.thcContent,
        expiresAt: offer.expiresAt, accepted: false, day: today,
      });
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
    const offerType = match.type;
    if (offerType === "drug") {
      let trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
      if (!trade) {
        await ctx.db.insert("drugTrades", {
          userId, cannabisStock: match.quantity, thcContent: match.thcContent || 30,
          pricePerGram: Math.floor(match.price / match.quantity), demand: 1000, totalDelivered: 0, totalRevenue: 0,
          marketingBudget: 0, marketingChannels: [], activeCampaigns: [], contracts: [], customerRating: 1.0,
          totalReviews: 0, lastRestock: Date.now(), lastDelivery: Date.now(), crimeStock: 0, lastCrimeDrugTime: 0, originalThc: match.thcContent || 30,
          drugType: match.drug || "cannabis",
        });
      } else {
        await ctx.db.patch(trade._id, { cannabisStock: n(trade.cannabisStock, 0) + match.quantity, lastRestock: Date.now() });
      }
    } else if (offerType === "car") {
      const car = CAR_MARKET.find((c) => c.id === match.drug);
      if (car) {
        await ctx.db.insert("vehicles", {
          userId, name: car.name, type: car.rarity, speed: car.speed, storage: car.storage,
          armored: car.armored ?? false, stolen: false, purchasePrice: car.price, rarity: car.rarity, damage: 0, desc: car.desc,
        });
      }
    } else if (offerType === "item") {
      const itemsByRarity = PACK_ITEMS[match.drug] ?? PACK_ITEMS.common;
      const randomItem = itemsByRarity[Math.floor(Math.random() * itemsByRarity.length)];
      if (randomItem) {
        await ctx.db.insert("inventory", {
          userId, itemId: `qs_${match.drug}_${Date.now()}`, name: randomItem.name, type: "loot",
          equipped: false, quantity: 1, attack: randomItem.attack, defense: randomItem.defense,
          rarity: randomItem.rarity, price: randomItem.price,
        });
      }
    } else if (offerType === "pack") {
      const qty = match.quantity;
      let packs = player.packs && typeof player.packs === "object" ? { ...player.packs } : { common: 0, rare: 0, epic: 0, legendary: 0 };
      const rarity = match.drug;
      if (rarity === "legendary") packs.legendary = n(packs.legendary, 0) + qty;
      else if (rarity === "epic") packs.epic = n(packs.epic, 0) + qty;
      else if (rarity === "rare") packs.rare = n(packs.rare, 0) + qty;
      else packs.common = n(packs.common, 0) + qty;
      await ctx.db.patch(userId, { packs });
    }
    await ctx.db.patch(match._id, { accepted: true });
    await ctx.db.patch(userId, { money: n(player.money, 0) - match.price });
    return { success: true, type: offerType, name: match.drug, quantity: match.quantity, cost: match.price, drug: match.drug };
  },
});

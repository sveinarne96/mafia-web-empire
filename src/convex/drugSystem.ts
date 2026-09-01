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

const THC_GRACE_PERIOD_MS = 5 * 24 * 3600000;

// ===== GREENHOUSE TIERS =====
const GREENHOUSE_TIERS = [
  { id: "basic", name: "Basic Greenhouse", cost: 0, slots: 2, yieldMultiplier: 1.0, thcCap: 40, icon: "🏠", desc: "Small backyard setup" },
  { id: "advanced", name: "Advanced Greenhouse", cost: 500_000, slots: 4, yieldMultiplier: 1.3, thcCap: 55, icon: "🏗️", desc: "Temperature-controlled" },
  { id: "professional", name: "Professional Grow Lab", cost: 2_000_000, slots: 6, yieldMultiplier: 1.6, thcCap: 70, icon: "🔬", desc: "Hydroponic systems" },
  { id: "elite", name: "Elite Underground Farm", cost: 10_000_000, slots: 8, yieldMultiplier: 2.0, thcCap: 85, icon: "🧬", desc: "Genetic engineering" },
  { id: "mythic", name: "Mythic Mega Farm", cost: 50_000_000, slots: 12, yieldMultiplier: 3.0, thcCap: 95, icon: "🌟", desc: "Unlimited potential" },
];

// ===== STRAIN LIBRARY =====
const STRAINS = [
  { id: "og_kush", name: "OG Kush", type: "cannabis", baseYield: 50, growTime: 30000, baseThc: 25, basePrice: 120, rarity: "common", icon: "🌿" },
  { id: "blue_dream", name: "Blue Dream", type: "cannabis", baseYield: 40, growTime: 35000, baseThc: 30, basePrice: 150, rarity: "common", icon: "🫐" },
  { id: "sour_diesel", name: "Sour Diesel", type: "cannabis", baseYield: 60, growTime: 40000, baseThc: 35, basePrice: 180, rarity: "rare", icon: "⛽" },
  { id: "girl_scout", name: "Girl Scout Cookies", type: "cannabis", baseYield: 45, growTime: 45000, baseThc: 40, basePrice: 220, rarity: "rare", icon: "🍪" },
  { id: "northern_lights", name: "Northern Lights", type: "cannabis", baseYield: 70, growTime: 50000, baseThc: 45, basePrice: 260, rarity: "epic", icon: "🌌" },
  { id: "white_widow", name: "White Widow", type: "cannabis", baseYield: 55, growTime: 55000, baseThc: 50, basePrice: 300, rarity: "epic", icon: "🕸️" },
  { id: "amnesia_haze", name: "Amnesia Haze", type: "cannabis", baseYield: 35, growTime: 60000, baseThc: 55, basePrice: 350, rarity: "epic", icon: "🌫️" },
  { id: "super_lemon", name: "Super Lemon Haze", type: "cannabis", baseYield: 40, growTime: 65000, baseThc: 60, basePrice: 400, rarity: "legendary", icon: "🍋" },
  { id: "gelato", name: "Gelato", type: "cannabis", baseYield: 30, growTime: 70000, baseThc: 70, basePrice: 500, rarity: "legendary", icon: "🍨" },
  { id: "godfather_og", name: "Godfather OG", type: "cannabis", baseYield: 25, growTime: 80000, baseThc: 80, basePrice: 650, rarity: "legendary", icon: "👑" },
  // Non-cannabis strains
  { id: "cocaine_basic", name: "Cocaine Press", type: "cocaine", baseYield: 30, growTime: 45000, baseThc: 0, basePrice: 500, rarity: "rare", icon: "❄️" },
  { id: "meth_kitchen", name: "Meth Kitchen", type: "meth", baseYield: 40, growTime: 40000, baseThc: 0, basePrice: 350, rarity: "rare", icon: "🧪" },
  { id: "heroin_lab", name: "Heroin Lab", type: "heroin", baseYield: 25, growTime: 50000, baseThc: 0, basePrice: 400, rarity: "epic", icon: "💉" },
];

// ===== GROWING UPGRADES =====
const GROWING_UPGRADES = [
  { id: "grow_lights", name: "Grow Lights", cost: 100_000, effect: "yield", bonus: 0.15, icon: "💡", desc: "+15% yield per cycle", maxLevel: 5 },
  { id: "irrigation", name: "Auto Irrigation", cost: 75_000, effect: "speed", bonus: 0.10, icon: "💧", desc: "-10% grow time", maxLevel: 5 },
  { id: "soil_mix", name: "Premium Soil", cost: 50_000, effect: "thc", bonus: 3, icon: "🪴", desc: "+3% base THC", maxLevel: 5 },
  { id: "ventilation", name: "Ventilation System", cost: 60_000, effect: "yield", bonus: 0.10, icon: "🌀", desc: "+10% yield", maxLevel: 3 },
  { id: "nutrients", name: "Nutrient Mix", cost: 40_000, effect: "speed", bonus: 0.08, icon: "🧪", desc: "-8% grow time", maxLevel: 5 },
  { id: "genetics_lab", name: "Genetics Lab", cost: 500_000, effect: "thc", bonus: 5, icon: "🧬", desc: "+5% base THC", maxLevel: 3 },
  { id: "security_cam", name: "Security Cameras", cost: 200_000, effect: "security", bonus: 0.10, icon: "📹", desc: "-10% raid chance", maxLevel: 3 },
  { id: "auto_trim", name: "Auto Trim Machine", cost: 150_000, effect: "yield", bonus: 0.20, icon: "✂️", desc: "+20% yield", maxLevel: 3 },
  { id: "climate_ctrl", name: "Climate Control", cost: 300_000, effect: "quality", bonus: 0.05, icon: "🌡️", desc: "+5% quality rating", maxLevel: 5 },
  { id: "hydroponics", name: "Hydroponics System", cost: 800_000, effect: "yield", bonus: 0.25, icon: "🌊", desc: "+25% yield", maxLevel: 2 },
];

// ===== AUTO-GROW WORKERS =====
const GROW_WORKERS = [
  { id: "apprentice", name: "Apprentice Grower", cost: 50_000, speed: 1.0, reliability: 0.85, icon: "🧑‍🌾", desc: "Basic auto-harvest" },
  { id: "journeyman", name: "Journeyman Grower", cost: 200_000, speed: 1.3, reliability: 0.90, icon: "👨‍🌾", desc: "Faster, more reliable" },
  { id: "master", name: "Master Grower", cost: 500_000, speed: 1.6, reliability: 0.95, icon: "🧓", desc: "Expert cultivator" },
  { id: "legend", name: "Legendary Botanist", cost: 2_000_000, speed: 2.0, reliability: 0.99, icon: "🌟", desc: "Perfect every time" },
];

// ===== MARKETING / SEARCH CHANNELS =====
const MARKETING_CHANNELS = [
  { id: "basic_site", name: "Basic Website", cost: 50_000, demandBoost: 200, searchBonus: 0.05, desc: "Simple landing page" },
  { id: "social_insta", name: "Instagram", cost: 25_000, demandBoost: 150, searchBonus: 0.03, desc: "Social media presence" },
  { id: "social_tiktok", name: "TikTok Marketing", cost: 30_000, demandBoost: 200, searchBonus: 0.04, desc: "Viral video reach" },
  { id: "social_twitter", name: "Twitter/X", cost: 20_000, demandBoost: 100, searchBonus: 0.02, desc: "Tweet your product" },
  { id: "street_marketing", name: "Street Marketing", cost: 10_000, demandBoost: 80, searchBonus: 0.01, desc: "Flyers and word of mouth" },
  { id: "dealer_network", name: "Dealer Network", cost: 100_000, demandBoost: 500, searchBonus: 0.08, desc: "Reliable distribution" },
  { id: "dark_web", name: "Dark Web", cost: 200_000, demandBoost: 1000, searchBonus: 0.12, desc: "Hidden marketplace" },
  { id: "premium_site", name: "Premium Website", cost: 500_000, demandBoost: 2000, searchBonus: 0.20, desc: "Professional operation" },
  { id: "viral_campaign", name: "Viral Campaign", cost: 300_000, demandBoost: 1500, searchBonus: 0.15, desc: "Internet-breaking campaign" },
  { id: "celebrity_endorse", name: "Celebrity Endorsement", cost: 1_000_000, demandBoost: 5000, searchBonus: 0.30, desc: "Famous faces sell" },
];

// ===== CRIME DRUG YIELDS =====
const CRIME_DRUG_YIELDS: Record<string, { drug: string; baseYield: number; emoji: string }> = {
  street: { drug: "cocaine", baseYield: 50, emoji: "❄️" },
  robbery: { drug: "cocaine", baseYield: 100, emoji: "❄️" },
  fraud: { drug: "cocaine", baseYield: 80, emoji: "❄️" },
  burglary: { drug: "cocaine", baseYield: 75, emoji: "❄️" },
  drugs: { drug: "cocaine", baseYield: 150, emoji: "❄️" },
  organized: { drug: "cocaine", baseYield: 200, emoji: "❄️" },
  underground: { drug: "cocaine", baseYield: 120, emoji: "❄️" },
  gta_theft: { drug: "cocaine", baseYield: 80, emoji: "❄️" },
  steal_house: { drug: "cocaine", baseYield: 60, emoji: "❄️" },
  murder: { drug: "cocaine", baseYield: 250, emoji: "❄️" },
  heist: { drug: "cocaine", baseYield: 300, emoji: "❄️" },
};

// ===== HELPER: calculate degraded THC =====
function calculateDegradedThc(originalThc: number, lastDelivery: number, now: number): number {
  if (lastDelivery === 0) return originalThc;
  const elapsed = now - lastDelivery;
  if (elapsed <= THC_GRACE_PERIOD_MS) return originalThc;
  const daysOverdue = Math.floor((elapsed - THC_GRACE_PERIOD_MS) / (24 * 3600000));
  const degradation = daysOverdue * 0.03;
  return Math.max(1, Math.floor(originalThc * (1 - degradation)));
}

// ===== GET GREENHOUSE STATE =====
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
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);
    const daysSinceDelivery = trade.lastDelivery > 0 ? Math.floor((now - trade.lastDelivery) / (24 * 3600000)) : 0;
    const thcDegrading = daysSinceDelivery > 5;
    const daysUntilDegradation = thcDegrading ? 0 : Math.max(0, 5 - daysSinceDelivery);
    const crimeStock = n(trade.crimeStock, 0);
    const boughtStock = n(trade.cannabisStock, 0);
    const totalStock = crimeStock + boughtStock;

    // Calculate tier bonuses
    const currentTierId = (trade as any).greenhouseTier || "basic";
    const tier = GREENHOUSE_TIERS.find(t => t.id === currentTierId) || GREENHOUSE_TIERS[0];

    // Calculate upgrade bonuses
    const upgrades: Record<string, number> = (trade as any).upgrades || {};
    let yieldBonus = 0;
    let speedBonus = 0;
    let thcBonus = 0;
    for (const upg of GROWING_UPGRADES) {
      const lvl = upgrades[upg.id] || 0;
      if (upg.effect === "yield") yieldBonus += upg.bonus * lvl;
      else if (upg.effect === "speed") speedBonus += upg.bonus * lvl;
      else if (upg.effect === "thc" || upg.effect === "quality") thcBonus += upg.bonus * lvl;
    }

    // Growing slots with active plants
    const growingSlots: any[] = (trade as any).growingSlots || [];
    const activeSlots = growingSlots.filter((s: any) => s && !s.harvestedAt);
    const readySlots = activeSlots.filter((s: any) => s.readyAt <= now);
    const totalGrowYield = activeSlots.reduce((sum: number, s: any) => sum + (s.yield || 0), 0);

    // Workers
    const workers: any[] = (trade as any).workers || [];

    // Price calculation
    const drugType = trade.drugType || "cannabis";
    const basePrices: Record<string, number> = { cannabis: 120, cocaine: 500, meth: 350, heroin: 400, mdma: 250 };
    const basePrice = basePrices[drugType] ?? 120;
    const thcMultiplier = 1 + (currentThc - 20) * 0.015;
    const ownedChannels: string[] = trade.marketingChannels ?? [];
    let totalSearchBonus = 0;
    let totalDemandBoost = 0;
    for (const ch of MARKETING_CHANNELS) {
      if (ownedChannels.includes(ch.id)) {
        totalSearchBonus += ch.searchBonus;
        totalDemandBoost += ch.demandBoost;
      }
    }
    const demand = Math.min(maxStock * 3, Math.floor(n(trade.demand, 1000) + totalDemandBoost * 0.001 + n(trade.totalDelivered, 0) * 0.01 + n(trade.marketingBudget, 0) * 0.0005));
    const demandMultiplier = Math.min(3, 1 + demand / 5000);
    const pricePerGram = Math.floor(basePrice * thcMultiplier * demandMultiplier * (1 + yieldBonus));

    return {
      // Stock
      crimeStock,
      boughtStock,
      totalStock,
      maxStock,
      drugType,
      drugEmoji: Object.values(CRIME_DRUG_YIELDS).find(v => v.drug === drugType)?.emoji || "🌿",

      // THC
      thcContent: currentThc,
      originalThc: n(trade.originalThc, 30),
      thcDegrading,
      daysUntilDegradation,
      daysSinceDelivery,

      // Pricing
      pricePerGram,
      shipmentValue: Math.floor(totalStock * pricePerGram),

      // Demand & Marketing
      demand,
      marketingBudget: n(trade.marketingBudget, 0),
      marketingChannels: ownedChannels,
      marketingChannelsDef: MARKETING_CHANNELS,
      totalSearchBonus,
      totalDemandBoost,

      // Stats
      totalDelivered: n(trade.totalDelivered, 0),
      totalRevenue: n(trade.totalRevenue, 0),
      customerRating: n(trade.customerRating, 1.0),
      totalReviews: n(trade.totalReviews, 0),

      // Contracts
      contracts: trade.contracts ?? [],

      // Greenhouse
      tier,
      allTiers: GREENHOUSE_TIERS,
      strains: STRAINS,
      upgrades: GROWING_UPGRADES,
      upgradeLevels: upgrades,
      growingSlots: growingSlots.map((s: any) => ({
        ...s,
        strain: STRAINS.find(st => st.id === s.strainId),
        isReady: s.readyAt <= now && !s.harvestedAt,
        timeLeft: s.readyAt > now ? s.readyAt - now : 0,
      })),
      activeSlotCount: activeSlots.length,
      maxSlots: tier.slots,
      readyCount: readySlots.length,
      totalGrowYield,
      yieldBonus,
      speedBonus,
      thcBonus,

      // Workers
      workers,
      workerDefs: GROW_WORKERS,

      // Timestamps
      lastRestock: n(trade.lastRestock, 0),
      lastDelivery: n(trade.lastDelivery, 0),
      level,
    };
  },
});

// ===== INITIALIZE GREENHOUSE =====
export const initDrugTrade = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (existing) return { success: true, alreadyInit: true };
    await ctx.db.insert("drugTrades", {
      userId, cannabisStock: 0, thcContent: 30, pricePerGram: 100, demand: 1000,
      totalDelivered: 0, totalRevenue: 0, marketingBudget: 0, marketingChannels: [],
      activeCampaigns: [], contracts: [], customerRating: 1.0, totalReviews: 0,
      lastRestock: Date.now(), lastDelivery: Date.now(), crimeStock: 0,
      lastCrimeDrugTime: 0, originalThc: 30, drugType: "cocaine",
      ...( { greenhouseTier: "basic", upgrades: {}, growingSlots: [], workers: [] } as any ),
    });
    return { success: true };
  },
});

// ===== UPGRADE GREENHOUSE TIER =====
export const upgradeTier = mutation({
  args: { tierId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const tier = GREENHOUSE_TIERS.find(t => t.id === args.tierId);
    if (!tier) throw new Error("Unknown tier");
    const currentTierId = (trade as any).greenhouseTier || "basic";
    const currentIdx = GREENHOUSE_TIERS.findIndex(t => t.id === currentTierId);
    const newIdx = GREENHOUSE_TIERS.findIndex(t => t.id === args.tierId);
    if (newIdx <= currentIdx) throw new Error("Can only upgrade to a higher tier");
    if (n(player.money, 0) < tier.cost) throw new Error(`Need $${tier.cost.toLocaleString()}`);
    await ctx.db.patch(trade._id, { greenhouseTier: args.tierId } as any);
    await ctx.db.patch(userId, { money: n(player.money, 0) - tier.cost });
    return { success: true, tier: tier.name };
  },
});

// ===== BUY UPGRADE =====
export const buyUpgrade = mutation({
  args: { upgradeId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const upg = GROWING_UPGRADES.find(u => u.id === args.upgradeId);
    if (!upg) throw new Error("Unknown upgrade");
    const upgrades: Record<string, number> = (trade as any).upgrades || {};
    const currentLvl = upgrades[upg.id] || 0;
    if (currentLvl >= upg.maxLevel) throw new Error("Already max level");
    const cost = upg.cost * (1 + currentLvl * 0.5);
    if (n(player.money, 0) < cost) throw new Error(`Need $${Math.floor(cost).toLocaleString()}`);
    const newUpgrades = { ...upgrades, [upg.id]: currentLvl + 1 };
    await ctx.db.patch(trade._id, { upgrades: newUpgrades } as any);
    await ctx.db.patch(userId, { money: n(player.money, 0) - cost });
    return { success: true, upgrade: upg.name, level: currentLvl + 1, cost: Math.floor(cost) };
  },
});

// ===== PLANT STRAIN (Start Growing) =====
export const plantStrain = mutation({
  args: { strainId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const strain = STRAINS.find(s => s.id === args.strainId);
    if (!strain) throw new Error("Unknown strain");
    const currentTierId = (trade as any).greenhouseTier || "basic";
    const tier = GREENHOUSE_TIERS.find(t => t.id === currentTierId) || GREENHOUSE_TIERS[0];
    const slots: any[] = (trade as any).growingSlots || [];
    const activeSlots = slots.filter(s => s && !s.harvestedAt);
    if (activeSlots.length >= tier.slots) throw new Error(`All ${tier.slots} slots are full! Upgrade your greenhouse.`);
    const upgrades: Record<string, number> = (trade as any).upgrades || {};
    let yieldBonus = 0;
    let speedBonus = 0;
    let thcBonus = 0;
    for (const upg of GROWING_UPGRADES) {
      const lvl = upgrades[upg.id] || 0;
      if (upg.effect === "yield") yieldBonus += upg.bonus * lvl;
      else if (upg.effect === "speed") speedBonus += upg.bonus * lvl;
      else if (upg.effect === "thc" || upg.effect === "quality") thcBonus += upg.bonus * lvl;
    }
    const yield_ = Math.floor(strain.baseYield * tier.yieldMultiplier * (1 + yieldBonus) * (0.9 + Math.random() * 0.2));
    const thc = Math.min(tier.thcCap, Math.floor(strain.baseThc + thcBonus + Math.random() * 5));
    const growTime = Math.floor(strain.growTime * (1 - speedBonus));
    const cost = Math.floor(strain.basePrice * yield_ * 0.1);
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()} to plant`);
    const newSlot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      strainId: strain.id,
      plantedAt: Date.now(),
      readyAt: Date.now() + growTime,
      yield: yield_,
      thc,
      harvestedAt: 0,
    };
    await ctx.db.patch(trade._id, { growingSlots: [...slots, newSlot] } as any);
    await ctx.db.patch(userId, { money: n(player.money, 0) - cost });
    return { success: true, strain: strain.name, yield: yield_, thc, cost };
  },
});

// ===== HARVEST READY PLANT =====
export const harvestPlant = mutation({
  args: { slotId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const slots: any[] = (trade as any).growingSlots || [];
    const slot = slots.find((s: any) => s.id === args.slotId);
    if (!slot) throw new Error("Slot not found");
    if (slot.harvestedAt) throw new Error("Already harvested");
    const now = Date.now();
    if (slot.readyAt > now) throw new Error("Not ready yet");
    const updatedSlots = slots.map((s: any) => s.id === args.slotId ? { ...s, harvestedAt: now } : s);
    await ctx.db.patch(trade._id, {
      growingSlots: updatedSlots,
      crimeStock: n(trade.crimeStock, 0) + slot.yield,
      originalThc: Math.max(n(trade.originalThc, 30), slot.thc),
      drugType: "cocaine",
    } as any);
    return { success: true, yield: slot.yield, thc: slot.thc };
  },
});

// ===== HARVEST ALL READY =====
export const harvestAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const slots: any[] = (trade as any).growingSlots || [];
    const now = Date.now();
    const ready = slots.filter((s: any) => !s.harvestedAt && s.readyAt <= now);
    if (ready.length === 0) throw new Error("Nothing ready to harvest");
    let totalYield = 0;
    let maxThc = n(trade.originalThc, 30);
    const updatedSlots = slots.map((s: any) => {
      if (!s.harvestedAt && s.readyAt <= now) {
        totalYield += s.yield;
        maxThc = Math.max(maxThc, s.thc);
        return { ...s, harvestedAt: now };
      }
      return s;
    });
    await ctx.db.patch(trade._id, {
      growingSlots: updatedSlots,
      crimeStock: n(trade.crimeStock, 0) + totalYield,
      originalThc: maxThc,
      drugType: "cocaine",
    } as any);
    return { success: true, harvested: ready.length, totalYield, thc: maxThc };
  },
});

// ===== HIRE WORKER =====
export const hireWorker = mutation({
  args: { workerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const workerDef = GROW_WORKERS.find(w => w.id === args.workerId);
    if (!workerDef) throw new Error("Unknown worker");
    const workers: any[] = (trade as any).workers || [];
    const sameWorker = workers.find((w: any) => w.workerId === args.workerId);
    if (sameWorker) throw new Error("Already hired");
    if (n(player.money, 0) < workerDef.cost) throw new Error(`Need $${workerDef.cost.toLocaleString()}`);
    const newWorker = {
      workerId: workerDef.id,
      name: workerDef.name,
      hiredAt: Date.now(),
      autoHarvests: 0,
      lastAutoHarvest: 0,
    };
    await ctx.db.patch(trade._id, { workers: [...workers, newWorker] } as any);
    await ctx.db.patch(userId, { money: n(player.money, 0) - workerDef.cost });
    return { success: true, worker: workerDef.name };
  },
});

// ===== AUTO-HARVEST (Worker) =====
export const autoHarvest = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const slots: any[] = (trade as any).growingSlots || [];
    const workers: any[] = (trade as any).workers || [];
    if (workers.length === 0) throw new Error("No workers hired");
    const now = Date.now();
    const ready = slots.filter((s: any) => !s.harvestedAt && s.readyAt <= now);
    if (ready.length === 0) throw new Error("Nothing ready to harvest");
    let totalYield = 0;
    let maxThc = n(trade.originalThc, 30);
    let harvested = 0;
    const updatedSlots = slots.map((s: any) => {
      if (!s.harvestedAt && s.readyAt <= now && harvested < workers.length) {
        totalYield += s.yield;
        maxThc = Math.max(maxThc, s.thc);
        harvested++;
        return { ...s, harvestedAt: now };
      }
      return s;
    });
    const updatedWorkers = workers.map((w: any, i: number) => {
      if (i < harvested) {
        return { ...w, autoHarvests: (w.autoHarvests || 0) + 1, lastAutoHarvest: now };
      }
      return w;
    });
    await ctx.db.patch(trade._id, {
      growingSlots: updatedSlots,
      workers: updatedWorkers,
      crimeStock: n(trade.crimeStock, 0) + totalYield,
      originalThc: maxThc,
      drugType: "cocaine",
    } as any);
    return { success: true, harvested, totalYield };
  },
});

// ===== ACCRUE CRIME DRUGS =====
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
        userId, cannabisStock: 0, thcContent: 30, pricePerGram: 100, demand: 1000,
        totalDelivered: 0, totalRevenue: 0, marketingBudget: 0, marketingChannels: [],
        activeCampaigns: [], contracts: [], customerRating: 1.0, totalReviews: 0,
        lastRestock: Date.now(), lastDelivery: Date.now(), crimeStock: yield_,
        lastCrimeDrugTime: Date.now(), originalThc: 30, drugType: yieldDef.drug,
        ...( { greenhouseTier: "basic", upgrades: {}, growingSlots: [], workers: [] } as any ),
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

// ===== DELIVER =====
export const deliver = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const crimeStock = n(trade.crimeStock, 0);
    const buyStockVal = n(trade.cannabisStock, 0);
    const totalAvail = crimeStock + buyStockVal;
    const qty = Math.max(1, Math.floor(args.quantity));
    if (totalAvail < qty) throw new Error(`Not enough stock (${totalAvail.toLocaleString()}g available)`);
    const now = Date.now();
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);
    const basePrices: Record<string, number> = { cannabis: 120, cocaine: 500, meth: 350, heroin: 400, mdma: 250 };
    const basePrice = basePrices[trade.drugType || "cannabis"] ?? 120;
    const thcMultiplier = 1 + (currentThc - 20) * 0.015;
    const ownedChannels: string[] = trade.marketingChannels ?? [];
    let totalSearchBonus = 0;
    for (const ch of MARKETING_CHANNELS) {
      if (ownedChannels.includes(ch.id)) totalSearchBonus += ch.searchBonus;
    }
    const demand = n(trade.demand, 1000);
    const demandMultiplier = Math.min(3, 1 + demand / 5000);
    const pricePerGram = Math.floor(basePrice * thcMultiplier * demandMultiplier);
    const delivered = qty;
    const revenue = Math.floor(delivered * pricePerGram * (1 + totalSearchBonus));
    const rating = Math.min(5.0, n(trade.customerRating, 1.0) + 0.01);
    const newDemand = Math.max(0, demand - delivered + Math.floor(delivered * 0.1));
    let newCrimeStock = crimeStock;
    let newBuyStock = buyStockVal;
    let remaining = qty;
    if (newCrimeStock >= remaining) { newCrimeStock -= remaining; remaining = 0; } else { remaining -= newCrimeStock; newCrimeStock = 0; newBuyStock -= remaining; remaining = 0; }
    await ctx.db.patch(trade._id, {
      crimeStock: newCrimeStock, cannabisStock: newBuyStock, demand: newDemand,
      totalDelivered: n(trade.totalDelivered, 0) + delivered,
      totalRevenue: n(trade.totalRevenue, 0) + revenue,
      customerRating: rating, totalReviews: n(trade.totalReviews, 0) + 1,
      lastDelivery: now, thcContent: currentThc, originalThc: Math.min(99, Math.floor(currentThc * 1.02) + 1),
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
    if (!trade) throw new Error("Initialize your greenhouse first");
    const crimeStock = n(trade.crimeStock, 0);
    const buyStockVal = n(trade.cannabisStock, 0);
    const totalAvail = crimeStock + buyStockVal;
    if (totalAvail <= 0) throw new Error("No stock to deliver");
    const now = Date.now();
    const currentThc = calculateDegradedThc(n(trade.originalThc, 30), n(trade.lastDelivery, 0), now);
    const basePrices: Record<string, number> = { cannabis: 120, cocaine: 500, meth: 350, heroin: 400, mdma: 250 };
    const basePrice = basePrices[trade.drugType || "cannabis"] ?? 120;
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
      crimeStock: 0, cannabisStock: 0, demand: newDemand,
      totalDelivered: n(trade.totalDelivered, 0) + delivered,
      totalRevenue: n(trade.totalRevenue, 0) + revenue,
      customerRating: rating, totalReviews: n(trade.totalReviews, 0) + 1,
      lastDelivery: now, thcContent: currentThc, originalThc: Math.min(99, Math.floor(currentThc * 1.02) + 1),
    });
    await ctx.db.patch(userId, { money: n(player.money, 0) + revenue });
    return { success: true, delivered, revenue, demand: newDemand, rating, thcUsed: currentThc, pricePerGram, searchBonus: totalSearchBonus };
  },
});

// ===== SET THC CONTENT =====
export const setThcContent = mutation({
  args: { thc: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const trade = await ctx.db.query("drugTrades").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!trade) throw new Error("Initialize your greenhouse first");
    const thc = Math.max(5, Math.min(90, Math.floor(args.thc)));
    await ctx.db.patch(trade._id, { thcContent: thc, originalThc: thc });
    return { success: true, thc };
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
    if (!trade) throw new Error("Initialize your greenhouse first");
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
    if (!trade) throw new Error("Initialize your greenhouse first");
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
    if (!trade) throw new Error("Initialize your greenhouse first");
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
function randomDrugOffer(drugId: string, level: number) {
  const basePrices: Record<string, number> = { cannabis: 120, cocaine: 500, meth: 350, mdma: 250, heroin: 400 };
  const qty = Math.floor(Math.random() * 50000 * level) + 1000;
  const discount = 0.7 + Math.random() * 0.3;
  const price = Math.floor((basePrices[drugId] ?? 120) * qty * discount);
  return { offerId: `${drugId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: "drug", itemType: drugId, name: drugId.charAt(0).toUpperCase() + drugId.slice(1), quantity: qty, price, thcContent: drugId === "cannabis" ? Math.floor(15 + Math.random() * 25) : 0, rarity: "common", icon: drugId === "cannabis" ? "🌿" : drugId === "cocaine" ? "❄️" : drugId === "meth" ? "🧪" : drugId === "mdma" ? "💊" : "💉", expiresAt: Date.now() + 24 * 3600000 };
}
function randomCarOffer(level: number) {
  let rarity = "common"; const roll = Math.random() * 100;
  if (level >= 20 && roll < 3) rarity = "legendary"; else if (level >= 15 && roll < 10) rarity = "epic"; else if (level >= 8 && roll < 25) rarity = "rare"; else if (level >= 5 && roll < 45) rarity = "rare";
  const cars = CAR_MARKET.filter((c) => c.rarity === rarity);
  if (cars.length === 0) return null;
  const car = cars[Math.floor(Math.random() * cars.length)];
  const price = Math.floor(car.price * (0.4 + Math.random() * 0.3));
  return { offerId: `car_${car.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: "car", itemType: car.id, name: car.name, quantity: 1, price, thcContent: 0, rarity: car.rarity, icon: "🚗", speed: car.speed, storage: car.storage, expiresAt: Date.now() + 24 * 3600000 };
}
function randomItemOffer(level: number) {
  let rarity = "common"; const roll = Math.random() * 100;
  if (level >= 15 && roll < 5) rarity = "legendary"; else if (level >= 10 && roll < 15) rarity = "epic"; else if (level >= 5 && roll < 35) rarity = "rare";
  const items = PACK_ITEMS[rarity] ?? PACK_ITEMS.common;
  if (!items || items.length === 0) return null;
  const item = items[Math.floor(Math.random() * items.length)];
  const price = Math.floor(item.price * (0.5 + Math.random() * 0.3));
  return { offerId: `item_${rarity}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: "item", itemType: rarity, name: item.name, quantity: 1, price, thcContent: 0, rarity: item.rarity, icon: rarity === "legendary" ? "👑" : rarity === "epic" ? "💎" : rarity === "rare" ? "🔵" : "⚪", attack: item.attack, defense: item.defense, expiresAt: Date.now() + 24 * 3600000 };
}
function randomPackOffer(level: number) {
  let rarity = "common"; const roll = Math.random() * 100;
  if (level >= 15 && roll < 5) rarity = "legendary"; else if (level >= 10 && roll < 15) rarity = "epic"; else if (level >= 5 && roll < 30) rarity = "rare";
  const packPrices: Record<string, number> = { common: 5_000, rare: 25_000, epic: 100_000, legendary: 500_000 };
  const price = Math.floor((packPrices[rarity] ?? 5_000) * (0.5 + Math.random() * 0.3));
  const qty = rarity === "legendary" ? 1 : rarity === "epic" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1;
  return { offerId: `pack_${rarity}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: "pack", itemType: rarity, name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Pack${qty > 1 ? ` x${qty}` : ""}`, quantity: qty, price, thcContent: 0, rarity, icon: "📦", expiresAt: Date.now() + 24 * 3600000 };
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
    const old = await ctx.db.query("qsOffers").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const weekAgo = Date.now() - 7 * 24 * 3600000;
    for (const o of old) { if (o.expiresAt < weekAgo || o.day !== today) await ctx.db.delete(o._id); }
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
          ...( { greenhouseTier: "basic", upgrades: {}, growingSlots: [], workers: [] } as any ),
        });
      } else {
        await ctx.db.patch(trade._id, { cannabisStock: n(trade.cannabisStock, 0) + match.quantity, lastRestock: Date.now() });
      }
    } else if (offerType === "car") {
      const car = CAR_MARKET.find((c) => c.id === match.drug);
      if (car) await ctx.db.insert("vehicles", { userId, name: car.name, type: car.rarity, speed: car.speed, storage: car.storage, armored: car.armored ?? false, stolen: false, purchasePrice: car.price, rarity: car.rarity, damage: 0, desc: car.desc });
    } else if (offerType === "item") {
      const itemsByRarity = PACK_ITEMS[match.drug] ?? PACK_ITEMS.common;
      const randomItem = itemsByRarity[Math.floor(Math.random() * itemsByRarity.length)];
      if (randomItem) await ctx.db.insert("inventory", { userId, itemId: `qs_${match.drug}_${Date.now()}`, name: randomItem.name, type: "loot", equipped: false, quantity: 1, attack: randomItem.attack, defense: randomItem.defense, rarity: randomItem.rarity, price: randomItem.price });
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

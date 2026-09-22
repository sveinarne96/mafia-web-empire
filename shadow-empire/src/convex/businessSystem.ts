import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// =====================================================================
// NEW FRONTIERS — ECONOMY SYSTEMS
// ---------------------------------------------------------------------
// Player businesses + staff, property flipping & rentals, vendor stalls,
// escrow trades, shares in player companies, gambling debts, underground
// player-hosted casino tables, player races with open betting, treasure
// hunting and a fluctuating fuel market.
// =====================================================================

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const nowMs = () => Date.now();

async function getPlayer(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

async function requireAdmin(ctx: any) {
  const player = await getPlayer(ctx);
  if (player.role !== "admin") throw new Error("Admin only!");
  return player;
}

function notify(ctx: any, userId: any, message: string) {
  return ctx.db.insert("notifications", { userId, type: "system", message, read: false, timestamp: nowMs() });
}

// ===== CONFIG (gas prices + events) =====
async function getConfigDoc(ctx: any): Promise<any | null> {
  return ctx.db
    .query("gameConfig")
    .filter((q: any) => q.eq(q.field("key"), "main"))
    .first();
}

async function patchConfig(ctx: any, patch: Record<string, unknown>) {
  const existing = await getConfigDoc(ctx);
  if (existing) {
    await ctx.db.patch(existing._id, { ...existing, ...patch, updatedAt: nowMs() });
  }
}

export const getFuelMarket = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const cfg = await getConfigDoc(ctx);
    const base = n(cfg?.gasPrice, 2.4);
    const updatedAt = n(cfg?.gasUpdatedAt, 0);
    // Price rotates every 6h; derive current price deterministically so it
    // drifts over time without a cron.
    const elapsed = Math.floor((nowMs() - updatedAt) / (6 * 3600 * 1000));
    const drift = elapsed > 0 ? (Math.sin(elapsed * 1.7) * 0.35 + Math.sin(elapsed * 0.9) * 0.2) * base : 0;
    const price = Math.max(0.8, Math.round((base + drift) * 100) / 100);
    const nextRotate = updatedAt + (elapsed + 1) * 6 * 3600 * 1000;
    return {
      price,
      basePrice: base,
      updatedAt,
      nextRotate,
      myStock: n(player.fuelStock, 0),
      fuelProfit: n(player.fuelProfit, 0),
      stockValue: Math.round(n(player.fuelStock, 0) * price * 100) / 100,
    };
  },
});

export const buyFuel = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const qty = Math.floor(args.amount);
    if (qty < 1 || qty > 100000) throw new Error("Amount must be between 1 and 100,000");
    const cfg = await getConfigDoc(ctx);
    const fuelPrice = n(cfg?.gasPrice, 2.4);
    const cost = Math.round(qty * fuelPrice);
    if (n(player.money, 0) < cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - cost,
      fuelStock: n(player.fuelStock, 0) + qty,
    } as any);
    return { bought: qty, cost, price: fuelPrice };
  },
});

export const sellFuel = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const qty = Math.floor(args.amount);
    if (qty < 1) throw new Error("Invalid amount");
    if (n(player.fuelStock, 0) < qty) throw new Error("You don't have that much fuel");
    const cfg = await getConfigDoc(ctx);
    const fuelPrice = n(cfg?.gasPrice, 2.4);
    const payout = Math.round(qty * fuelPrice * 0.92); // 8% market fee
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) + payout,
      fuelStock: n(player.fuelStock, 0) - qty,
      fuelProfit: n(player.fuelProfit, 0) + payout,
    } as any);
    return { sold: qty, payout, price: fuelPrice };
  },
});

// Admin: set a gas price directly (or 0 → auto).
export const setGasPrice = mutation({
  args: { price: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.price < 0 || args.price > 100) throw new Error("Price out of range");
    await patchConfig(ctx, { gasPrice: args.price || 2.4, gasUpdatedAt: args.price ? nowMs() : 0 });
    return { set: true };
  },
});

// ===== BUSINESS CATALOG =====
export const BUSINESS_CATALOG = [
  { id: "b_laundromat", name: "Laundromat", icon: "🧺", price: 250_000, income: 6_000, desc: "Front business — washes cash and sheets." },
  { id: "b_bodega", name: "Corner Bodega", icon: "🏪", price: 500_000, income: 12_000, desc: "Open 24/7, zero questions asked." },
  { id: "b_garage", name: "Chop Garage", icon: "🔧", price: 1_200_000, income: 28_000, desc: "Cars go in, parts come out." },
  { id: "b_bar", name: "Speakeasy Bar", icon: "🍸", price: 2_500_000, income: 55_000, desc: "Best martinis on the block." },
  { id: "b_nightclub", name: "Nightclub", icon: "🪩", price: 6_000_000, income: 130_000, desc: "Loud music, loud money." },
  { id: "b_restaurant", name: "Steakhouse", icon: "🥩", price: 4_000_000, income: 90_000, desc: "Front-of-house legit, back-room not so much." },
  { id: "b_casino", name: "Casino", icon: "🎰", price: 25_000_000, income: 520_000, desc: "The house always wins." },
  { id: "b_hotel", name: "Grand Hotel", icon: "🏨", price: 12_000_000, income: 260_000, desc: "Suites for dignitaries, basements for bodies." },
  { id: "b_warehouse", name: "Warehouse", icon: "📦", price: 3_000_000, income: 65_000, desc: "Everything moves through here." },
  { id: "b_shipping", name: "Shipping Fleet", icon: "🚢", price: 50_000_000, income: 1_100_000, desc: "Containers, customs, and cargo." },
];

export const getBusinessCatalog = query({ args: {}, handler: () => BUSINESS_CATALOG });

// ===== BUSINESSES =====
export const getBusinessEmpire = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const [owned, allBiz, props, shares, debts] = await Promise.all([
      ctx.db.query("businesses").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect(),
      ctx.db.query("businesses").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("businessShares").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect(),
      ctx.db.query("gamblingDebts").filter((q: any) => q.or(q.eq(q.field("debtorId"), player._id), q.eq(q.field("creditorId"), player._id))).collect(),
    ]);
    // My shares → business lookup
    const shareBiz = await Promise.all(shares.map(async (s: any) => ({ ...s, business: await ctx.db.get(s.businessId) })));
    const myProps = props.filter((p: any) => p.ownerId === player._id);
    const forSale = props.filter((p: any) => !p.ownerId);
    const idleSince = n(player.lastIdleClaimAt, nowMs());
    return {
      catalog: BUSINESS_CATALOG,
      owned,
      allBiz: allBiz.slice(0, 60),
      myProps,
      forSale: forSale.slice(0, 40),
      myShares: shareBiz,
      debts,
      idleMs: Math.max(0, nowMs() - idleSince),
      idleCapMs: 24 * 3600 * 1000,
    };
  },
});

export const openBusiness = mutation({
  args: { catalogId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const biz = BUSINESS_CATALOG.find((b) => b.id === args.catalogId);
    if (!biz) throw new Error("Business not found");
    if (n(player.money, 0) < biz.price) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - biz.price } as any);
    const id = await ctx.db.insert("businesses", {
      ownerId: player._id, name: biz.name, type: biz.id, city: player.location ?? "New York",
      price: biz.price, income: biz.income, level: 1,
    });
    return { id, name: biz.name };
  },
});

export const upgradeBusiness = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const biz = await ctx.db.get(args.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== player._id) throw new Error("Not your business");
    const level = n(biz.level, 1);
    const cost = Math.round(n(biz.price, 0) * level * 0.45);
    if (n(player.money, 0) < cost) throw new Error(`Upgrade costs $${cost.toLocaleString()}`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost } as any);
    await ctx.db.patch(args.businessId, {
      level: level + 1,
      income: Math.round(n(biz.income, 0) * 1.45),
      price: Math.round(n(biz.price, 0) * 1.3),
    } as any);
    return { level: level + 1, newIncome: Math.round(n(biz.income, 0) * 1.45) };
  },
});

export const collectBusinessIncome = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const biz = await ctx.db.get(args.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== player._id) throw new Error("Not your business");
    const last = n((biz as any).lastCollected, nowMs());
    const hours = Math.min(48, Math.max(0, (nowMs() - last) / 3600000));
    if (hours < 1) throw new Error("Income available once per hour");
    const amount = Math.round(n(biz.income, 0) * Math.min(hours, 12) / 12);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + amount, totalEarned: n(player.totalEarned, 0) + amount } as any);
    await ctx.db.patch(args.businessId, { lastCollected: nowMs() } as any);
    return { amount };
  },
});

// ===== PROPERTIES & RENTALS (flipping) =====
export const PROPERTY_CATALOG = [
  { id: "p_condo", name: "Fixer Condo", icon: "🏚️", price: 400_000, rent: 9_000 },
  { id: "p_brownstone", name: "Brownstone", icon: "🏠", price: 1_500_000, rent: 32_000 },
  { id: "p_villa", name: "Villa", icon: "🏡", price: 6_000_000, rent: 120_000 },
  { id: "p_penthouse", name: "Penthouse", icon: "🏙️", price: 18_000_000, rent: 350_000 },
  { id: "p_estate", name: "Estate", icon: "🏰", price: 45_000_000, rent: 900_000 },
  { id: "p_island", name: "Private Island", icon: "🏝️", price: 120_000_000, rent: 2_400_000 },
];

export const getPropertyCatalog = query({ args: {}, handler: () => PROPERTY_CATALOG });

export const buyProperty = mutation({
  args: { catalogId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const p = PROPERTY_CATALOG.find((x) => x.id === args.catalogId);
    if (!p) throw new Error("Property not found");
    if (n(player.money, 0) < p.price) throw new Error("Not enough money");
    const has = await ctx.db.query("properties").filter((q: any) => q.and(q.eq(q.field("ownerId"), player._id), q.eq(q.field("name"), p.name))).first();
    if (has) throw new Error("You already own this property");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - p.price } as any);
    await ctx.db.insert("properties", {
      name: p.name, type: p.id, city: player.location ?? "New York",
      price: p.price, income: p.rent, ownerId: player._id,
      renovationLevel: 0, rentedTo: null, lastRentAt: nowMs(),
    } as any);
    return { name: p.name };
  },
});

export const renovateProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const prop = await ctx.db.get(args.propertyId);
    if (!prop || prop.ownerId !== player._id) throw new Error("Not your property");
    const level = n((prop as any).renovationLevel, 0);
    const cost = Math.round(n(prop.price, 0) * (level + 1) * 0.2);
    if (n(player.money, 0) < cost) throw new Error(`Renovation costs $${cost.toLocaleString()}`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost } as any);
    await ctx.db.patch(args.propertyId, {
      renovationLevel: level + 1,
      income: Math.round(n(prop.income, 0) * 1.5),
      price: Math.round(n(prop.price, 0) * (1 + 0.22 * (level + 1))),
    } as any);
    return { level: level + 1 };
  },
});

export const setRent = mutation({
  args: { propertyId: v.id("properties"), tenantName: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const prop = await ctx.db.get(args.propertyId);
    if (!prop || prop.ownerId !== player._id) throw new Error("Not your property");
    if (args.tenantName.trim().length < 2 || args.tenantName.trim().length > 20) throw new Error("Tenant name 2-20 chars");
    await ctx.db.patch(args.propertyId, { rentedTo: args.tenantName.trim(), lastRentAt: nowMs() } as any);
    return { tenant: args.tenantName.trim() };
  },
});

export const evictTenant = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const prop = await ctx.db.get(args.propertyId);
    if (!prop || prop.ownerId !== player._id) throw new Error("Not your property");
    const evicted = (prop as any).rentedTo;
    await ctx.db.patch(args.propertyId, { rentedTo: null } as any);
    return { evicted };
  },
});

export const claimRent = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const prop = await ctx.db.get(args.propertyId);
    if (!prop || prop.ownerId !== player._id) throw new Error("Not your property");
    const rented = (prop as any).rentedTo;
    if (!rented) throw new Error("Property has no tenants — set a tenant first");
    const last = n((prop as any).lastRentAt, nowMs());
    const days = Math.min(14, (nowMs() - last) / 86400000);
    if (days < 1) throw new Error("Rent collected once per day");
    const amount = Math.round(n(prop.income, 0) * days);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + amount, totalEarned: n(player.totalEarned, 0) + amount } as any);
    await ctx.db.patch(args.propertyId, { lastRentAt: nowMs() } as any);
    return { amount, days: Math.floor(days) };
  },
});

export const sellProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const prop = await ctx.db.get(args.propertyId);
    if (!prop || prop.ownerId !== player._id) throw new Error("Not your property");
    const value = Math.round(n(prop.price, 0) * 0.92);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + value } as any);
    await ctx.db.delete(args.propertyId);
    return { soldFor: value };
  },
});

// ===== VENDOR STALLS =====
export const STALL_CITIES = ["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles"];

export const rentStall = mutation({
  args: { city: v.string(), stallName: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!STALL_CITIES.includes(args.city)) throw new Error("Invalid city");
    const cost = 250_000;
    if (n(player.money, 0) < cost) throw new Error("Stall rent costs $250,000 (7 days)");
    const existing = await ctx.db.query("vendorStalls").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect();
    if (existing.length >= 3) throw new Error("Max 3 stalls per player");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost } as any);
    await ctx.db.insert("vendorStalls", {
      ownerId: player._id, ownerName: player.nickname || player.username || "Unknown",
      city: args.city, stallName: args.stallName.trim() || `${args.city} Stall #${existing.length + 1}`,
      itemName: "", itemId: "", rarity: "common", price: 0, qty: 0, earnings: 0,
      rentPaidUntil: nowMs() + 7 * 86400000, active: true, createdAt: nowMs(),
    });
    return { ok: true };
  },
});

export const listStallItem = mutation({
  args: { stallId: v.id("vendorStalls"), inventoryId: v.id("inventory"), price: v.number(), qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const stall = await ctx.db.get(args.stallId);
    if (!stall || stall.ownerId !== player._id) throw new Error("Not your stall");
    if (args.price < 1 || args.qty < 1 || args.qty > 999) throw new Error("Invalid listing");
    const inv = await ctx.db.get(args.inventoryId);
    if (!inv || inv.userId !== player._id) throw new Error("Item not found in your inventory");
    if (n(inv.quantity, 1) < args.qty) throw new Error("Not enough of that item");
    if (n(inv.quantity, 1) - args.qty <= 0) {
      await ctx.db.delete(args.inventoryId);
    } else {
      await ctx.db.patch(args.inventoryId, { quantity: n(inv.quantity, 1) - args.qty } as any);
    }
    await ctx.db.patch(args.stallId, {
      itemName: inv.name, itemId: args.inventoryId, rarity: inv.rarity ?? "common",
      price: args.price, qty: args.qty,
    } as any);
    return { listed: inv.name, qty: args.qty };
  },
});

export const buyFromStall = mutation({
  args: { stallId: v.id("vendorStalls"), qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const stall = await ctx.db.get(args.stallId);
    if (!stall || !stall.active) throw new Error("Stall not found");
    if (stall.ownerId === player._id) throw new Error("Can't buy from your own stall");
    const qty = Math.min(args.qty, n(stall.qty, 0));
    if (qty < 1) throw new Error("Stall is out of stock");
    const cost = Math.round(n(stall.price, 0) * qty);
    if (n(player.money, 0) < cost) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost } as any);
    const stallOwner = await ctx.db.get(stall.ownerId);
    if (stallOwner) {
      await ctx.db.patch(stall.ownerId, { money: n(stallOwner.money, 0) + cost, totalEarned: n(stallOwner.totalEarned, 0) + cost } as any);
    }
    const remaining = n(stall.qty, 0) - qty;
    await ctx.db.patch(args.stallId, {
      qty: remaining,
      earnings: n(stall.earnings, 0) + cost,
    } as any);
    if (remaining <= 0) {
      await ctx.db.patch(args.stallId, { itemName: "", itemId: "", qty: 0, price: 0 } as any);
    }
    // Give buyer the item(s)
    await ctx.db.insert("inventory", {
      userId: player._id, itemId: stall.itemId, name: stall.itemName, type: "item",
      equipped: false, quantity: qty, rarity: stall.rarity,
    });
    return { bought: qty, cost, item: stall.itemName };
  },
});

export const collectStallEarnings = mutation({
  args: { stallId: v.id("vendorStalls") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const stall = await ctx.db.get(args.stallId);
    if (!stall || stall.ownerId !== player._id) throw new Error("Not your stall");
    const earned = n(stall.earnings, 0);
    if (earned <= 0) throw new Error("No earnings to collect");
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, totalStallSales: n(player.totalStallSales, 0) + earned } as any);
    await ctx.db.patch(args.stallId, { earnings: 0 } as any);
    return { collected: earned };
  },
});

export const closeStall = mutation({
  args: { stallId: v.id("vendorStalls") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const stall = await ctx.db.get(args.stallId);
    if (!stall || stall.ownerId !== player._id) throw new Error("Not your stall");
    // Refund remaining stock
    if (n(stall.qty, 0) > 0 && stall.itemId) {
      const existing = await ctx.db.query("inventory")
        .filter((q: any) => q.and(q.eq(q.field("userId"), player._id), q.eq(q.field("itemId"), stall.itemId), q.eq(q.field("name"), stall.itemName)))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { quantity: n(existing.quantity, 1) + n(stall.qty, 0) } as any);
      } else {
        await ctx.db.insert("inventory", {
          userId: player._id, itemId: stall.itemId, name: stall.itemName, type: "item",
          equipped: false, quantity: n(stall.qty, 0), rarity: stall.rarity,
        });
      }
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) + n(stall.earnings, 0) } as any);
    await ctx.db.delete(args.stallId);
    return { closed: true };
  },
});

export const getStallMarket = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const active = await ctx.db.query("vendorStalls").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    const mine = active.filter((s: any) => s.ownerId === player._id);
    const others = active.filter((s: any) => s.ownerId !== player._id && n(s.qty, 0) > 0);
    const inv = await ctx.db.query("inventory").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect();
    return { mine, others: others.slice(0, 40), myInventory: inv.slice(0, 60), cities: STALL_CITIES };
  },
});

// ===== ESCROW TRADES =====
export const getEscrowMarket = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const active = await ctx.db.query("escrowTrades").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    return {
      offers: active.filter((t: any) => t.offererId !== player._id).slice(0, 50),
      mine: active.filter((t: any) => t.offererId === player._id),
      myInventory: await ctx.db.query("inventory").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect(),
      myPoints: n(player.points, 0),
      myMoney: n(player.money, 0),
    };
  },
});

export const createEscrow = mutation({
  args: {
    offeredType: v.string(), offeredAmount: v.number(),
    requestedType: v.string(), requestedAmount: v.number(),
    offeredItemId: v.optional(v.id("inventory")), requestedItemId: v.optional(v.id("inventory")),
  },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (args.offeredType === args.requestedType) throw new Error("Offer and request must differ");
    if (args.offeredAmount < 1 || args.requestedAmount < 1) throw new Error("Invalid amounts");
    // Hold the offerer's side in escrow
    if (args.offeredType === "cash") {
      if (n(player.money, 0) < args.offeredAmount) throw new Error("Not enough cash");
      await ctx.db.patch(player._id, { money: n(player.money, 0) - args.offeredAmount } as any);
    } else if (args.offeredType === "points") {
      if (n(player.points, 0) < args.offeredAmount) throw new Error("Not enough points");
      await ctx.db.patch(player._id, { points: n(player.points, 0) - args.offeredAmount } as any);
    } else if (args.offeredType === "item") {
      const inv = args.offeredItemId ? await ctx.db.get(args.offeredItemId) : null;
      if (!inv || inv.userId !== player._id) throw new Error("Item not found");
      await ctx.db.patch(args.offeredItemId!, { quantity: Math.max(0, n(inv.quantity, 1) - 1) } as any);
    } else throw new Error("Invalid offered type");
    const offeredItem = args.offeredItemId ? await ctx.db.get(args.offeredItemId) : null;
    const requestedItem = args.requestedItemId ? await ctx.db.get(args.requestedItemId) : null;
    await ctx.db.insert("escrowTrades", {
      offererId: player._id, offererName: player.nickname || player.username || "Unknown",
      offeredType: args.offeredType, offeredAmount: args.offeredAmount,
      offeredItemId: args.offeredItemId ?? undefined,
      offeredItemName: offeredItem?.name,
      requestedType: args.requestedType, requestedAmount: args.requestedAmount,
      requestedItemId: args.requestedItemId ?? undefined,
      requestedItemName: requestedItem?.name,
      active: true, createdAt: nowMs(),
    });
    return { ok: true };
  },
});

export const cancelEscrow = mutation({
  args: { tradeId: v.id("escrowTrades") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const trade = await ctx.db.get(args.tradeId);
    if (!trade || trade.offererId !== player._id || !trade.active) throw new Error("Trade not found");
    await ctx.db.patch(args.tradeId, { active: false } as any);
    // Refund escrowed side
    if (trade.offeredType === "cash") await ctx.db.patch(player._id, { money: n(player.money, 0) + trade.offeredAmount } as any);
    else if (trade.offeredType === "points") await ctx.db.patch(player._id, { points: n(player.points, 0) + trade.offeredAmount } as any);
    else if (trade.offeredType === "item" && trade.offeredItemId) {
      const inv: any = await ctx.db.get(trade.offeredItemId as any);
      if (inv) await ctx.db.patch(inv._id, { quantity: n(inv.quantity, 1) + 1 } as any);
    }
    return { cancelled: true };
  },
});

export const acceptEscrow = mutation({
  args: { tradeId: v.id("escrowTrades") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const trade = await ctx.db.get(args.tradeId);
    if (!trade || !trade.active) throw new Error("Trade not found");
    if (trade.offererId === player._id) throw new Error("Can't accept your own trade");
    // Buyer pays requested side
    if (trade.requestedType === "cash") {
      if (n(player.money, 0) < trade.requestedAmount) throw new Error("Not enough cash");
      await ctx.db.patch(player._id, { money: n(player.money, 0) - trade.requestedAmount } as any);
    } else if (trade.requestedType === "points") {
      if (n(player.points, 0) < trade.requestedAmount) throw new Error("Not enough points");
      await ctx.db.patch(player._id, { points: n(player.points, 0) - trade.requestedAmount } as any);
    } else if (trade.requestedType === "item") {
      // find any matching item in buyer's inventory by itemId snapshot name
      const candidates = await ctx.db.query("inventory").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect();
      const match = candidates.find((i: any) => i.itemId === trade.requestedItemId && n(i.quantity, 1) > 0);
      if (!match) throw new Error("You don't have the requested item");
      await ctx.db.patch(match._id, { quantity: n(match.quantity, 1) - 1 } as any);
    } else throw new Error("Invalid request type");
    // Deliver offered side to buyer
    if (trade.offeredType === "cash") await ctx.db.patch(player._id, { money: n(player.money, 0) + trade.offeredAmount, escrowTradesDone: n(player.escrowTradesDone, 0) + 1 } as any);
    else if (trade.offeredType === "points") await ctx.db.patch(player._id, { points: n(player.points, 0) + trade.offeredAmount, escrowTradesDone: n(player.escrowTradesDone, 0) + 1 } as any);
    else if (trade.offeredType === "item") {
      await ctx.db.insert("inventory", {
        userId: player._id, itemId: trade.offeredItemId ?? "item", name: trade.offeredItemName ?? "Item",
        type: "item", equipped: false, quantity: 1, rarity: "common",
      });
      await ctx.db.patch(player._id, { escrowTradesDone: n(player.escrowTradesDone, 0) + 1 } as any);
    }
    // Pay offerer their requested side
    const offerer = await ctx.db.get(trade.offererId);
    if (offerer) {
      if (trade.requestedType === "cash") await ctx.db.patch(offerer._id, { money: n(offerer.money, 0) + trade.requestedAmount } as any);
      else if (trade.requestedType === "points") await ctx.db.patch(offerer._id, { points: n(offerer.points, 0) + trade.requestedAmount } as any);
      else if (trade.requestedType === "item" && trade.requestedItemId) {
        const candidates = await ctx.db.query("inventory").withIndex("by_user", (q: any) => q.eq("userId", offerer._id)).collect();
        const match = candidates.find((i: any) => i.itemId === trade.requestedItemId && n(i.quantity, 1) > 0);
        if (match) await ctx.db.patch(match._id, { quantity: n(match.quantity, 1) + 1 } as any);
      }
    }
    await ctx.db.patch(args.tradeId, { active: false } as any);
    await notify(ctx, trade.offererId, `✅ Trade accepted by ${player.nickname || player.username || "someone"} — escrow released.`);
    return { done: true };
  },
});

// ===== BUSINESS SHARES =====
export const buyShares = mutation({
  args: { businessId: v.id("businesses"), shares: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const biz = await ctx.db.get(args.businessId);
    if (!biz) throw new Error("Business not found");
    const pricePerShare = Math.max(1, Math.round(n(biz.price, 0) / 1000));
    const qty = Math.floor(args.shares);
    if (qty < 1 || qty > 1000) throw new Error("Shares 1-1000");
    const cost = pricePerShare * qty;
    if (n(player.money, 0) < cost) throw new Error(`Costs $${cost.toLocaleString()}`);
    const existing = await ctx.db.query("businessShares")
      .filter((q: any) => q.and(q.eq(q.field("businessId"), args.businessId), q.eq(q.field("userId"), player._id)))
      .first();
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost } as any);
    if (existing) {
      await ctx.db.patch(existing._id, { shares: n(existing.shares, 0) + qty } as any);
    } else {
      await ctx.db.insert("businessShares", { businessId: args.businessId, userId: player._id, shares: qty, boughtAt: nowMs() });
    }
    return { shares: qty, cost };
  },
});

export const sellShares = mutation({
  args: { businessId: v.id("businesses"), shares: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const biz = await ctx.db.get(args.businessId);
    if (!biz) throw new Error("Business not found");
    const pricePerShare = Math.max(1, Math.round(n(biz.price, 0) / 1000));
    const qty = Math.floor(args.shares);
    const holding = await ctx.db.query("businessShares")
      .filter((q: any) => q.and(q.eq(q.field("businessId"), args.businessId), q.eq(q.field("userId"), player._id)))
      .first();
    if (!holding || n(holding.shares, 0) < qty) throw new Error("Not enough shares");
    const payout = Math.round(pricePerShare * qty * 0.95);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + payout } as any);
    const left = n(holding.shares, 0) - qty;
    if (left <= 0) await ctx.db.delete(holding._id);
    else await ctx.db.patch(holding._id, { shares: left } as any);
    return { sold: qty, payout };
  },
});

export const claimDividends = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const biz = await ctx.db.get(args.businessId);
    if (!biz) throw new Error("Business not found");
    const holding = await ctx.db.query("businessShares")
      .filter((q: any) => q.and(q.eq(q.field("businessId"), args.businessId), q.eq(q.field("userId"), player._id)))
      .first();
    if (!holding || n(holding.shares, 0) < 1) throw new Error("You own no shares here");
    const last = n((holding as any).lastDividendAt ?? (holding as any).boughtAt, nowMs());
    const hours = (nowMs() - last) / 3600000;
    if (hours < 24) throw new Error("Dividends available once per 24h");
    const perSharePerDay = n(biz.income, 0) / 1000;
    const amount = Math.round(perSharePerDay * n(holding.shares, 0) * Math.min(hours, 72) / 24);
    if (amount <= 0) throw new Error("No dividends yet");
    await ctx.db.patch(player._id, { money: n(player.money, 0) + amount, totalDividends: n(player.totalDividends, 0) + amount } as any);
    await ctx.db.patch(holding._id, { lastDividendAt: nowMs() } as any);
    return { amount, shares: n(holding.shares, 0) };
  },
});

// ===== GAMBLING DEBTS =====
export const getLendTargets = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u: any) => u._id !== player._id)
      .sort((a: any, b: any) => n(b.level, 1) - n(a.level, 1))
      .slice(0, 30)
      .map((u: any) => ({ id: u._id, name: u.nickname || u.username || "Unknown", level: n(u.level, 1), money: n(u.money, 0) }));
  },
});

export const extendDebt = mutation({
  args: { debtorId: v.id("users"), amount: v.number(), interestPct: v.number() },
  handler: async (ctx, args) => {
    const creditor = await getPlayer(ctx);
    const amount = Math.floor(args.amount);
    const interest = Math.min(50, Math.max(5, Math.floor(args.interestPct)));
    if (amount < 1000 || amount > 500_000_000) throw new Error("Debt 1k - 500M");
    if (n(creditor.money, 0) < amount) throw new Error("Not enough money");
    if (creditor._id === args.debtorId) throw new Error("Can't lend to yourself");
    const debtor = await ctx.db.get(args.debtorId);
    if (!debtor) throw new Error("Debtor not found");
    await ctx.db.patch(creditor._id, { money: n(creditor.money, 0) - amount } as any);
    await ctx.db.patch(args.debtorId, { money: n(debtor.money, 0) + amount } as any);
    await ctx.db.insert("gamblingDebts", {
      creditorId: creditor._id, creditorName: creditor.nickname || creditor.username || "Unknown",
      debtorId: args.debtorId, debtorName: debtor.nickname || debtor.username || "Unknown",
      amount, interestPct: interest, dueAt: nowMs() + 24 * 3600 * 1000, paid: false, createdAt: nowMs(),
    });
    await notify(ctx, args.debtorId, `💸 ${creditor.nickname || creditor.username} lent you $${amount.toLocaleString()} at ${interest}%/24h. Repay before the collectors visit.`);
    return { ok: true };
  },
});

export const repayDebt = mutation({
  args: { debtId: v.id("gamblingDebts") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const debt = await ctx.db.get(args.debtId);
    if (!debt || debt.paid) throw new Error("Debt not found");
    if (debt.debtorId !== player._id && debt.creditorId !== player._id) throw new Error("Not your debt");
    const days = Math.max(0, (nowMs() - debt.createdAt) / 86400000);
    const total = Math.round(debt.amount * (1 + (n(debt.interestPct, 10) / 100) * days));
    if (n(player.money, 0) < total) throw new Error(`You owe $${total.toLocaleString()} (with interest)`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - total } as any);
    await ctx.db.patch(debt.creditorId, { money: n((await ctx.db.get(debt.creditorId))?.money, 0) + total } as any);
    await ctx.db.patch(args.debtId, { paid: true } as any);
    await notify(ctx, debt.creditorId, `💰 ${player.nickname || player.username} repaid their debt: $${total.toLocaleString()}.`);
    return { paid: total };
  },
});

export const collectDebt = mutation({
  args: { debtId: v.id("gamblingDebts") },
  handler: async (ctx, args) => {
    const creditor = await getPlayer(ctx);
    const debt = await ctx.db.get(args.debtId);
    if (!debt || debt.paid) throw new Error("Debt not found");
    if (debt.creditorId !== creditor._id) throw new Error("Not your debt");
    const days = Math.max(0, (nowMs() - debt.createdAt) / 86400000);
    const total = Math.round(debt.amount * (1 + (n(debt.interestPct, 10) / 100) * days));
    const debtor = await ctx.db.get(debt.debtorId);
    const take = Math.min(n(debtor?.money, 0), total);
    if (take <= 0) throw new Error("Debtor is broke — send the enforcers (they have nothing)");
    await ctx.db.patch(debt.debtorId, { money: n(debtor?.money, 0) - take } as any);
    await ctx.db.patch(creditor._id, { money: n(creditor.money, 0) + take } as any);
    const settled = take >= total;
    await ctx.db.patch(args.debtId, { paid: settled } as any);
    if (!settled) await ctx.db.patch(args.debtId, { amount: total - take } as any);
    await notify(ctx, debt.debtorId, `🦵 ${creditor.nickname || creditor.username} sent collectors — they took $${take.toLocaleString()}.`);
    return { collected: take, settled };
  },
});

// ===== UNDERGROUND CASINO TABLES =====
export const getCasinoTables = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const active = await ctx.db.query("casinoTables").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    return { tables: active.slice(0, 30), myProfit: n(player.casinoHostProfit, 0) };
  },
});

export const openCasinoTable = mutation({
  args: { game: v.string(), minBet: v.number(), maxBet: v.number(), rakePct: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!["blackjack", "dice"].includes(args.game)) throw new Error("Invalid game");
    const rake = Math.min(15, Math.max(1, Math.floor(args.rakePct)));
    if (args.minBet < 1000 || args.maxBet > 100_000_000 || args.maxBet < args.minBet) throw new Error("Invalid bet range");
    const existing = await ctx.db.query("casinoTables").withIndex("by_host", (q: any) => q.eq("hostId", player._id)).collect();
    if (existing.some((t: any) => t.active)) throw new Error("You already host a table — close it first");
    await ctx.db.insert("casinoTables", {
      hostId: player._id, hostName: player.nickname || player.username || "Unknown",
      game: args.game, minBet: args.minBet, maxBet: args.maxBet, rakePct: rake,
      city: player.location ?? "New York", active: true, createdAt: nowMs(),
    });
    return { ok: true };
  },
});

export const closeCasinoTable = mutation({
  args: { tableId: v.id("casinoTables") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const table = await ctx.db.get(args.tableId);
    if (!table || table.hostId !== player._id) throw new Error("Not your table");
    await ctx.db.patch(args.tableId, { active: false } as any);
    return { closed: true };
  },
});

export const playCasinoTable = mutation({
  args: { tableId: v.id("casinoTables"), bet: v.number(), guess: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const table = await ctx.db.get(args.tableId);
    if (!table || !table.active) throw new Error("Table not found");
    if (args.bet < table.minBet || args.bet > table.maxBet) throw new Error(`Bet between $${table.minBet.toLocaleString()} and $${table.maxBet.toLocaleString()}`);
    if (n(player.money, 0) < args.bet) throw new Error("Not enough money");
    if (table.hostId === player._id) throw new Error("You can't play at your own table");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - args.bet } as any);
    let won = false;
    let multiplier = 0;
    let detail = "";
    if (table.game === "blackjack") {
      const playerTotal = 17 + Math.floor(Math.random() * 5); // 17-21
      const dealerTotal = 16 + Math.floor(Math.random() * 7); // 16-22
      won = playerTotal > 21 ? false : dealerTotal > 21 || playerTotal > dealerTotal;
      multiplier = won ? 1.9 : 0;
      detail = `${playerTotal} vs dealer ${dealerTotal}`;
    } else {
      const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2-12
      const g = args.guess ?? "high";
      won = g === "seven" ? roll === 7 : g === "high" ? roll >= 8 : roll <= 6;
      multiplier = g === "seven" ? 5 : 1.9;
      detail = `Rolled ${roll}`;
    }
    const payout = won ? Math.round(args.bet * multiplier) : 0;
    const rake = won ? Math.round(payout * (table.rakePct / 100)) : 0;
    const net = payout - rake;
    await ctx.db.patch(player._id, { money: n(player.money, 0) + net } as any);
    // Host takes the rake
    const host = await ctx.db.get(table.hostId);
    if (host) {
      await ctx.db.patch(table.hostId, { money: n(host.money, 0) + rake, casinoHostProfit: n(host.casinoHostProfit, 0) + rake } as any);
    }
    return { won, detail, payout: net, rake };
  },
});

// ===== PLAYER RACES WITH BETTING =====
export const getRaceBetting = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const [open, racing, finished] = await Promise.all([
      ctx.db.query("playerRaces").withIndex("by_status", (q: any) => q.eq("status", "open")).collect(),
      ctx.db.query("playerRaces").withIndex("by_status", (q: any) => q.eq("status", "racing")).collect(),
      ctx.db.query("playerRaces").withIndex("by_status", (q: any) => q.eq("status", "finished")).collect(),
    ]);
    const recent = [...finished].sort((a: any, b: any) => b.createdAt - a.createdAt).slice(0, 10);
    const myBets = await ctx.db.query("raceBets").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect();
    return { open, racing, recent, myBets: myBets.slice(-15), myWins: n(player.totalRaceBets, 0) };
  },
});

export const hostRace = mutation({
  args: { track: v.string(), entryFee: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const fee = Math.min(10_000_000, Math.max(10_000, Math.floor(args.entryFee)));
    const tracks = ["Downtown Circuit", "Harbor Run", "Desert Mile", "Strip Drag", "Coastal Sprint"];
    if (!tracks.includes(args.track)) throw new Error("Invalid track");
    await ctx.db.insert("playerRaces", {
      creatorId: player._id, creatorName: player.nickname || player.username || "Unknown",
      track: args.track, racerIds: [player._id], racerNames: [player.nickname || player.username || "Unknown"],
      entryFee: fee, prizePool: 0, status: "open", createdAt: nowMs(),
    });
    return { ok: true };
  },
});

export const joinRace = mutation({
  args: { raceId: v.id("playerRaces") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "open") throw new Error("Race not found or closed");
    if (race.racerIds.includes(player._id)) throw new Error("Already in this race");
    if (n(player.money, 0) < race.entryFee) throw new Error(`Entry fee $${race.entryFee.toLocaleString()}`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - race.entryFee } as any);
    await ctx.db.patch(args.raceId, {
      racerIds: [...race.racerIds, player._id],
      racerNames: [...race.racerNames, player.nickname || player.username || "Unknown"],
      prizePool: n(race.prizePool, 0) + race.entryFee,
    } as any);
    return { joined: true };
  },
});

export const startRace = mutation({
  args: { raceId: v.id("playerRaces") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "open") throw new Error("Race not found");
    if (race.creatorId !== player._id) throw new Error("Only the host can start");
    if (race.racerIds.length < 2) throw new Error("Need at least 2 racers");
    const prizePool = n(race.prizePool, 0) + race.entryFee * race.racerIds.length;
    // Winner weighted by attack + level
    const weights: { id: any; w: number }[] = [];
    for (const rid of race.racerIds) {
      const u = await ctx.db.get(rid);
      weights.push({ id: rid, w: 1 + (n(u?.attack, 10) / 50) + (n(u?.level, 1) / 10) });
    }
    const totalW = weights.reduce((s, x) => s + x.w, 0);
    let roll = Math.random() * totalW;
    let winnerId = weights[0].id;
    for (const x of weights) { roll -= x.w; if (roll <= 0) { winnerId = x.id; break; } }
    const winner: any = await ctx.db.get(winnerId);
    const winnerName = winner?.nickname || winner?.username || "Unknown";
    await ctx.db.patch(args.raceId, { status: "finished", winnerId, winnerName, startedAt: nowMs() } as any);
    // Winner takes 90% of pool
    const take = Math.round(prizePool * 0.9);
    if (winner) await ctx.db.patch(winner._id, { money: n(winner.money, 0) + take } as any);
    // Payout bets (95% of bet pool split among winning-backers)
    const bets = await ctx.db.query("raceBets").withIndex("by_race", (q: any) => q.eq("raceId", args.raceId)).collect();
    const winBets = bets.filter((b: any) => b.targetId === winnerId);
    const winPool = winBets.reduce((s, b) => s + n(b.amount, 0), 0);
    if (winPool > 0) {
      const payoutPool = Math.round(winPool * 0.95);
      for (const b of winBets) {
        const share = Math.round((n(b.amount, 0) / winPool) * payoutPool);
        const better = await ctx.db.get(b.userId);
        if (better) await ctx.db.patch(better._id, { money: n(better.money, 0) + share, totalRaceBets: n(better.totalRaceBets, 0) + share } as any);
        await ctx.db.patch(b._id, { paidOut: true } as any);
      }
    }
    return { winner: winnerName, prizePool };
  },
});

export const resolveStaleRaces = mutation({
  args: {},
  handler: async (ctx) => {
    const racing = await ctx.db.query("playerRaces").withIndex("by_status", (q: any) => q.eq("status", "racing")).collect();
    let resolved = 0;
    for (const r of racing) {
      if (nowMs() - n(r.startedAt, nowMs()) > 5 * 60000) {
        await ctx.db.patch(r._id, { status: "finished", winnerId: r.racerIds[0], winnerName: r.racerNames[0] } as any);
        resolved++;
      }
    }
    return { resolved };
  },
});

export const placeRaceBet = mutation({
  args: { raceId: v.id("playerRaces"), targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "open") throw new Error("Race not open for betting");
    if (!race.racerIds.includes(args.targetId)) throw new Error("Target isn't racing");
    const amount = Math.min(5_000_000, Math.max(1000, Math.floor(args.amount)));
    if (n(player.money, 0) < amount) throw new Error("Not enough money");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - amount } as any);
    const totalBet = (await ctx.db.query("raceBets").withIndex("by_race", (q: any) => q.eq("raceId", args.raceId)).collect())
      .reduce((s, b) => s + n(b.amount, 0), 0) + amount;
    const odds = Math.round((totalBet / amount) * 100) / 100;
    await ctx.db.insert("raceBets", {
      raceId: args.raceId, userId: player._id, targetId: args.targetId,
      targetName: race.racerNames[race.racerIds.indexOf(args.targetId)] ?? "Racer",
      amount, odds, paidOut: false, createdAt: nowMs(),
    });
    return { placed: amount, odds };
  },
});

// ===== TREASURE HUNTING =====
export const TREASURE_MAPS = [
  { id: "t_old", name: "Faded Harbor Map", rarity: "common", cost: 25_000, region: "Harbor", icon: "🗺️" },
  { id: "t_warehouse", name: "Warehouse Blueprint", rarity: "rare", cost: 120_000, region: "Industrial District", icon: "📜" },
  { id: "t_vault", name: "Bank Vault Schematic", rarity: "epic", cost: 650_000, region: "Downtown", icon: "💼" },
  { id: "t_don", name: "Don's Ledger", rarity: "legendary", cost: 2_500_000, region: "Unknown", icon: "📖" },
];

export const getTreasureHunt = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const maps = await ctx.db.query("treasureMaps").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect();
    return { catalog: TREASURE_MAPS, maps, dugTotal: n(player.totalTreasuresDug, 0) };
  },
});

export const buyTreasureMap = mutation({
  args: { mapId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const map = TREASURE_MAPS.find((m) => m.id === args.mapId);
    if (!map) throw new Error("Map not found");
    if (n(player.money, 0) < map.cost) throw new Error("Not enough money");
    const owned = await ctx.db.query("treasureMaps").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect();
    if (owned.length >= 5) throw new Error("Max 5 maps at a time");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - map.cost } as any);
    await ctx.db.insert("treasureMaps", {
      ownerId: player._id, name: map.name, rarity: map.rarity, cost: map.cost,
      region: map.region, boughtAt: nowMs(), dug: false,
    });
    return { name: map.name };
  },
});

export const digTreasure = mutation({
  args: { mapId: v.id("treasureMaps") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const map = await ctx.db.get(args.mapId);
    if (!map || map.ownerId !== player._id) throw new Error("Map not found");
    if (map.dug) throw new Error("Already dug");
    const roll = Math.random();
    let outcome: string;
    let reward = 0;
    let pointsReward = 0;
    let scrap: { common: number; rare: number; epic: number } = { common: 0, rare: 0, epic: 0 };
    let damage = 0;
    if (roll < 0.55) {
      outcome = "loot";
      const base = { common: 40_000, rare: 220_000, epic: 1_200_000, legendary: 5_000_000 }[map.rarity] ?? 40_000;
      reward = Math.round(base * (0.7 + Math.random() * 0.9));
      pointsReward = map.rarity === "legendary" ? 500 : map.rarity === "epic" ? 120 : map.rarity === "rare" ? 30 : 5;
      if (Math.random() < 0.4) {
        scrap = { common: map.rarity === "legendary" ? 10 : map.rarity === "epic" ? 5 : map.rarity === "rare" ? 2 : 1, rare: 0, epic: 0 };
        if (map.rarity === "epic") scrap.rare = 2;
        if (map.rarity === "legendary") { scrap.rare = 4; scrap.epic = 1; }
      }
    } else if (roll < 0.85) {
      outcome = "ambush";
      damage = Math.round((n(player.maxLife, 100) * (map.rarity === "legendary" ? 0.35 : map.rarity === "epic" ? 0.25 : 0.15)));
      if (n(player.life, 100) <= damage) damage = Math.max(1, n(player.life, 100) - 1);
    } else {
      outcome = "empty";
    }
    const scraps = { ...(player.scraps && typeof player.scraps === "object" ? player.scraps : { common: 0, rare: 0, epic: 0 }) };
    scraps.common = (scraps.common ?? 0) + scrap.common;
    scraps.rare = (scraps.rare ?? 0) + scrap.rare;
    scraps.epic = (scraps.epic ?? 0) + scrap.epic;
    const patch: any = {
      money: n(player.money, 0) + reward,
      points: n(player.points, 0) + pointsReward,
      life: Math.max(1, n(player.life, 100) - damage),
      totalTreasuresDug: n(player.totalTreasuresDug, 0) + 1,
      scraps,
    };
    await ctx.db.patch(player._id, patch);
    await ctx.db.patch(args.mapId, { dug: true, dugAt: nowMs() } as any);
    return { outcome, reward, pointsReward, scrap, damage };
  },
});

// ===== CAR TUNING (customization) =====
export const TUNING_PARTS = [
  { id: "paint_crimson", part: "paint", name: "Crimson Paint", icon: "🔴", cost: 500_000 },
  { id: "paint_blue", part: "paint", name: "Midnight Blue", icon: "🔵", cost: 500_000 },
  { id: "paint_green", part: "paint", name: "Mafia Green", icon: "🟢", cost: 800_000 },
  { id: "paint_gold", part: "paint", name: "Gold Flake", icon: "🟡", cost: 1_500_000 },
  { id: "paint_chrome", part: "paint", name: "Chrome", icon: "⚪", cost: 3_000_000 },
  { id: "rims_street", part: "rims", name: "Street Rims", icon: "🛞", cost: 400_000 },
  { id: "rims_spinner", part: "rims", name: "Spinners", icon: "✨", cost: 1_200_000 },
  { id: "rims_gold", part: "rims", name: "Gold Rims", icon: "🌟", cost: 2_500_000 },
  { id: "spoiler_gt", part: "spoiler", name: "GT Wing", icon: "🪽", cost: 600_000 },
  { id: "plate_vip", part: "plate", name: "VIP Plate", icon: "🔢", cost: 300_000 },
  { id: "plate_boss", part: "plate", name: "BOSS Plate", icon: "💯", cost: 1_000_000 },
  { id: "nitro_1", part: "nitro", name: "Nitro Kit", icon: "🔥", cost: 2_000_000 },
];

export const getTuningShop = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const vehicles = await ctx.db.query("vehicles").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect();
    return { parts: TUNING_PARTS, vehicles: vehicles.slice(0, 30), money: n(player.money, 0) };
  },
});

export const buyCarCustomization = mutation({
  args: { vehicleId: v.id("vehicles"), partId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const part = TUNING_PARTS.find((p) => p.id === args.partId);
    if (!part) throw new Error("Part not found");
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle || vehicle.userId !== player._id) throw new Error("Vehicle not found");
    if (n(player.money, 0) < part.cost) throw new Error(`Costs $${part.cost.toLocaleString()}`);
    const field = part.part === "nitro" ? "nitro" : part.part === "paint" ? "paintColor" : part.part === "rims" ? "rims" : part.part === "spoiler" ? "spoiler" : "plate";
    await ctx.db.patch(player._id, { money: n(player.money, 0) - part.cost } as any);
    await ctx.db.patch(args.vehicleId, { [field]: part.id } as any);
    return { part: part.name, vehicle: vehicle.name };
  },
});

// ===== SEEDING (admin) =====
export const seedNewFrontiers = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const props = await ctx.db.query("properties").collect();
    if (props.length === 0) {
      for (const p of PROPERTY_CATALOG) {
        await ctx.db.insert("properties", {
          name: p.name, type: p.id, city: "New York", price: p.price, income: p.rent,
          ownerId: undefined, renovationLevel: 0, rentedTo: null, lastRentAt: nowMs(),
        } as any);
      }
    }
    const biz = await ctx.db.query("businesses").collect();
    if (biz.length === 0) {
      for (const b of BUSINESS_CATALOG) {
        await ctx.db.insert("businesses", {
          ownerId: undefined, name: b.name, type: b.id, city: "New York",
          price: b.price, income: b.income, level: 1, lastCollected: nowMs(),
        } as any);
      }
    }
    return { seeded: true };
  },
});
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getPlayer(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

// Get player inventory
export const getInventory = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) return [];
    return await ctx.db
      .query("inventory")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
  },
});

// Equip item
export const equipItem = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const item = await ctx.db.query("inventory").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const found = item.find((i: any) => i.itemId === args.itemId);
    if (!found) throw new Error("Item not found");
    await ctx.db.patch(found._id, { equipped: !found.equipped });
    return { success: true, equipped: !found.equipped };
  },
});

// Buy item from shop
export const buyItem = mutation({
  args: { name: v.string(), type: v.string(), price: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player.money ?? 0) < args.price) throw new Error("Not enough money!");
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.price });
    await ctx.db.insert("inventory", {
      userId: player._id,
      itemId: `item_${Date.now()}`,
      name: args.name,
      type: args.type,
      equipped: false,
      quantity: 1,
    });
    return { success: true };
  },
});

// Sell item
export const sellItem = mutation({
  args: { itemId: v.id("inventory") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item || (item as any).userId !== player._id) throw new Error("Not your item");
    const sellPrice = 100;
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + sellPrice });
    await ctx.db.delete(args.itemId);
    return { money: sellPrice };
  },
});

// Sell garage space
export const sellCapacity = mutation({
  args: { type: v.union(v.literal("inventory"), v.literal("garage")), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const price = Math.min(500000, args.amount * 5000);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + price });
    return { price };
  },
});

// Prestige
export const prestige = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player.level ?? 1) < 50) throw new Error("Need level 50!");
    const newPrestige = (player.prestige ?? 0) + 1;
    const multiplier = 1 + newPrestige * 0.15;
    await ctx.db.patch(player._id, {
      prestige: newPrestige,
      prestigeMultiplier: multiplier,
      level: 1,
      experience: 0,
      skillPoints: (player.skillPoints ?? 0) + 10,
      money: (player.money ?? 0) + 1000000 * newPrestige,
    });
    return { prestige: newPrestige, multiplier, bonus: 1000000 * newPrestige };
  },
});

// ===== STUB FUNCTIONS FOR EXISTING FRONTEND CALLS =====
export const buyItemWithPoints = mutation({ args: { itemId: v.optional(v.string()), price: v.optional(v.number()), itemName: v.optional(v.string()), type: v.optional(v.string()), rarity: v.optional(v.string()), cost: v.optional(v.number()), attack: v.optional(v.number()), defense: v.optional(v.number()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); await ctx.db.patch(p._id, { points: (p.points ?? 0) - ((args.cost ?? args.price ?? 0) as number) }); await ctx.db.insert("inventory", { userId: p._id, itemId: args.itemId ?? `item_${Date.now()}`, name: args.itemName ?? "Item", type: args.type ?? "item", equipped: false, quantity: 1, attack: args.attack, defense: args.defense, rarity: args.rarity }); return { success: true }; } });
export const getGarage = query({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) return []; return await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", p._id)).collect(); } });
export const getVehicleShop = query({ args: {}, handler: async () => { return [{ name: "Sedan", type: "car", speed: 50, storage: 20, price: 10000, armored: false, emoji: "🚗" }, { name: "Sports Car", type: "sports", speed: 80, storage: 10, price: 50000, armored: false, emoji: "🏎️" }, { name: "Armored SUV", type: "suv", speed: 60, storage: 40, price: 100000, armored: true, emoji: "🚙" }]; } });
export const buyVehicle = mutation({ args: { name: v.string(), type: v.string(), speed: v.number(), storage: v.number(), price: v.number(), armored: v.boolean() }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); if ((p.money ?? 0) < args.price) throw new Error("Not enough money!"); await ctx.db.patch(p._id, { money: (p.money ?? 0) - args.price }); await ctx.db.insert("vehicles", { userId: p._id, name: args.name, type: args.type, speed: args.speed, storage: args.storage, armored: args.armored, stolen: false, purchasePrice: args.price }); return { success: true }; } });
export const sellVehicle = mutation({ args: { vehicleId: v.id("vehicles") }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const veh = await ctx.db.get(args.vehicleId); if (!veh || veh.userId !== p._id) throw new Error("Not your vehicle"); const price = Math.floor((veh.purchasePrice ?? 0) * 0.6); await ctx.db.patch(p._id, { money: (p.money ?? 0) + price }); await ctx.db.delete(args.vehicleId); return { price, money: price }; } });
export const stealVehicle = mutation({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const success = Math.random() < 0.5; let vehicle: any = null; let arrested = false; if (success) { vehicle = await ctx.db.insert("vehicles", { userId: p._id, name: "Stolen Car", type: "stolen", speed: 40, storage: 15, armored: false, stolen: true, purchasePrice: 0 }); } else { arrested = Math.random() > 0.6; } return { success, vehicle, arrested }; } });
export const commitLegendaryCrime = mutation({ args: { crimeId: v.string(), reward: v.optional(v.number()), xp: v.optional(v.number()), risk: v.optional(v.number()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const success = Math.random() < 0.3; const rw = success ? (args.reward ?? 100000) : 0; if (success) await ctx.db.patch(p._id, { money: (p.money ?? 0) + rw, experience: (p.experience ?? 0) + 500 }); return { success, reward: rw, message: success ? "Success!" : "Failed!" }; } });
export const getMissions = query({ args: {}, handler: async (ctx) => { return await ctx.db.query("missions").collect(); } });
export const getPlayerMissions = query({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) return []; return await ctx.db.query("playerMissions").withIndex("by_user", (q) => q.eq("userId", p._id)).collect(); } });
export const acceptMission = mutation({ args: { missionId: v.id("missions") }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); await ctx.db.insert("playerMissions", { userId: p._id, missionId: args.missionId, progress: 0, completed: false, claimed: false, startedAt: Date.now() }); return { success: true }; } });
export const completeMission = mutation({ args: { missionId: v.optional(v.string()), playerMissionId: v.optional(v.string()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const reward = Math.floor(Math.random() * 50000) + 5000; const points = Math.floor(Math.random() * 200) + 50; if (p) await ctx.db.patch(p._id, { money: (p.money ?? 0) + reward, points: (p.points ?? 0) + points }); return { success: true, reward, points }; } });
export const getOrganizedCrimes = query({ args: {}, handler: async (ctx) => { return await ctx.db.query("organizedCrimes").collect(); } });
export const joinOrganizedCrime = mutation({ args: { crimeId: v.id("organizedCrimes") }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const success = Math.random() < 0.6; const reward = success ? Math.floor(Math.random() * 100000) + 10000 : 0; if (success && p) await ctx.db.patch(p._id, { money: (p.money ?? 0) + reward }); return { success, reward }; } });
export const getMyBusinesses = query({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) return []; return await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", p._id)).collect(); } });
export const getBusinessShop = query({ args: {}, handler: async () => { return [{ name: "Corner Store", type: "shop", city: "New York", price: 50000, income: 500 }, { name: "Nightclub", type: "nightlife", city: "Miami", price: 200000, income: 2000 }, { name: "Casino", type: "gambling", city: "Las Vegas", price: 500000, income: 5000 }]; } });
export const buyLottoTicket = mutation({ args: { type: v.string(), numbers: v.array(v.number()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const winning = Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 1); const matches = args.numbers.filter(n => winning.includes(n)).length; const prize = matches >= 3 ? matches * 10000 : 0; if (prize > 0 && p) await ctx.db.patch(p._id, { money: (p.money ?? 0) + prize }); return { winning, matches, prize }; } });
export const blackjackDeal = mutation({ args: { bet: v.number() }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); return { playerHand: ['A', 'K'], dealerHand: ['10', '7'], playerCards: ['A', 'K'], dealerCards: ['10', '7'], gameOver: false, result: '', winnings: 0 }; } });
export const blackjackHit = mutation({ args: { hand: v.optional(v.array(v.string())), bet: v.optional(v.number()) }, handler: async () => { return { card: '5', bust: false, playerHand: ['A', 'K', '5'], result: '', winnings: 0 }; } });
export const blackjackStand = mutation({ args: { hand: v.optional(v.array(v.string())), bet: v.optional(v.number()) }, handler: async () => { return { dealerFinal: 19, won: true, dealerHand: ['10', '7', '2'], result: 'win', winnings: 100 }; } });
export const searchForumPosts = query({ args: { query: v.string() }, handler: async (ctx, args) => { return await ctx.db.query("forumPosts").collect(); } });
export const submitSupportTicket = mutation({ args: { subject: v.string(), body: v.string() }, handler: async (ctx, args) => { return { success: true }; } });
export const claimDailyReward = mutation({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); await ctx.db.patch(p._id, { money: (p.money ?? 0) + 100000 }); return { success: true, reward: 100000, message: "Claimed!" }; } });

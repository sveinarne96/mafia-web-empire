import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { rollEggPoolItem } from "./easterEggItems";

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

// ===== EASTER EGG SYSTEM =====
// Grant an Easter Egg drop (only called by client when the Easter Egg Hunt event is active)
// Eggs STACK up to 100 in a single inventory slot
export const grantEasterEgg = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const MAX_STACK = 100;
    const items = await ctx.db.query("inventory").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const stack = items.find((i: any) => i.type === "easter_egg" && (i.quantity ?? 1) < MAX_STACK);
    if (stack) {
      await ctx.db.patch(stack._id, { quantity: (stack.quantity ?? 1) + 1 });
      return { success: true, stacked: true, quantity: (stack.quantity ?? 1) + 1 };
    }
    await ctx.db.insert("inventory", {
      userId: player._id,
      itemId: `easter_egg_${Date.now()}`,
      name: "🥚 Easter Egg",
      type: "easter_egg",
      equipped: false,
      quantity: 1,
      rarity: "legendary",
      price: 25000000,
    });
    return { success: true, stacked: false, quantity: 1 };
  },
});

// Open an Easter Egg — rolls one of the best rewards in the game
export const openEasterEgg = mutation({
  args: { itemId: v.id("inventory") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item || (item as any).userId !== player._id) throw new Error("Not your item");
    if ((item as any).type !== "easter_egg") throw new Error("Not an Easter Egg");
    // Consume ONE egg from the stack (up to 100 per stack)
    const qty = (item as any).quantity ?? 1;
    if (qty <= 1) {
      await ctx.db.delete(args.itemId);
    } else {
      await ctx.db.patch(args.itemId, { quantity: qty - 1 });
    }

    const roll = Math.random();
    const twoHours = Date.now() + 2 * 60 * 60 * 1000;

    // 🐲 MYTHIC: Dragon Egg (3%) — permanent massive stat boost
    if (roll < 0.03) {
      await ctx.db.patch(player._id, {
        attack: (player.attack ?? 10) + 150,
        defense: (player.defense ?? 10) + 150,
        money: (player.money ?? 0) + 10000000,
      });
      return { prize: "DRAGON EGG!", icon: "🐲", message: "🐲 MYTHIC DRAGON EGG! +150 ATK, +150 DEF PERMANENTLY + $10,000,000! You are blessed by the Egg Gods!", cash: 10000000 };
    }
    // 🏆 JACKPOT: Golden Egg (5%)
    if (roll < 0.08) {
      const cash = 5000000;
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) + cash,
        xpBoostUntil: Math.max(player.xpBoostUntil ?? 0, twoHours),
        cashBoostUntil: Math.max(player.cashBoostUntil ?? 0, twoHours),
      });
      return { prize: "GOLDEN EGG!", icon: "🌟", message: `🌟 GOLDEN EGG! $${cash.toLocaleString()} + 3x XP & Cash Boost for 2 hours!`, cash };
    }
    // ⚡ Triple XP Boost 2h (7%)
    if (roll < 0.10) {
      await ctx.db.patch(player._id, { xpBoostUntil: Math.max(player.xpBoostUntil ?? 0, twoHours) });
      return { prize: "Triple XP Boost", icon: "⚡", message: "⚡ Triple XP Boost activated for 2 HOURS! All crimes earn 3x XP!", cash: 0 };
    }
    // 💰 Triple Cash Boost 2h (7%)
    if (roll < 0.17) {
      await ctx.db.patch(player._id, { cashBoostUntil: Math.max(player.cashBoostUntil ?? 0, twoHours) });
      return { prize: "Triple Cash Boost", icon: "💰", message: "💰 Triple Cash Boost activated for 2 HOURS! All crimes pay 3x cash!", cash: 0 };
    }
    // ⚔️ Legendary Weapon (6%)
    if (roll < 0.23) {
      const atk = 50 + Math.floor(Math.random() * 100);
      await ctx.db.insert("inventory", { userId: player._id, itemId: `egg_weapon_${Date.now()}`, name: `⚔️ Egg-Forged Blade (+${atk} ATK)`, type: "weapon", equipped: false, quantity: 1, attack: atk, rarity: "legendary", price: atk * 20000 });
      return { prize: "Legendary Weapon", icon: "⚔️", message: `⚔️ Legendary weapon found! Egg-Forged Blade (+${atk} ATK) added to your items!`, cash: 0 };
    }
    // 🛡️ Legendary Armor (6%)
    if (roll < 0.29) {
      const def = 50 + Math.floor(Math.random() * 100);
      await ctx.db.insert("inventory", { userId: player._id, itemId: `egg_armor_${Date.now()}`, name: `🛡️ Egg-Plated Vest (+${def} DEF)`, type: "armor", equipped: false, quantity: 1, defense: def, rarity: "legendary", price: def * 20000 });
      return { prize: "Legendary Armor", icon: "🛡️", message: `🛡️ Legendary armor found! Egg-Plated Vest (+${def} DEF) added to your items!`, cash: 0 };
    }
    // 💵 Instant Cash (13%)
    if (roll < 0.42) {
      const cash = (1000000 + Math.floor(Math.random() * 40) * 100000);
      await ctx.db.patch(player._id, { money: (player.money ?? 0) + cash });
      return { prize: "Cash Stash", icon: "💵", message: `💵 Cash stash inside! $${cash.toLocaleString()} added!`, cash };
    }
    // 🏆 Points (5%)
    if (roll < 0.47) {
      const pts = 200 + Math.floor(Math.random() * 800);
      await ctx.db.patch(player._id, { points: (player.points ?? 0) + pts });
      return { prize: "Point Cache", icon: "🏆", message: `🏆 Point cache! ${pts} points added to your score!`, cash: 0 };
    }
    // 🎁 EGG VAULT (53%) — one of 560 unique random items, sellable
    const drop = rollEggPoolItem();
    await ctx.db.insert("inventory", { userId: player._id, itemId: `egg_item_${Date.now()}`, name: drop.name, type: drop.type, equipped: false, quantity: 1, rarity: drop.rarity, price: drop.price });
    return { prize: drop.name, icon: drop.icon, message: `${drop.name} hatched from the egg! ${drop.rarity.toUpperCase()} — worth $${drop.price.toLocaleString()} — sell it in My Items!`, cash: 0 };
  },
});

// Activate a boost item from inventory (xp_boost / cash_boost)
export const activateBoostItem = mutation({
  args: { itemId: v.id("inventory") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item || (item as any).userId !== player._id) throw new Error("Not your item");
    const type = (item as any).type;
    if (type !== "xp_boost" && type !== "cash_boost") throw new Error("Not a boost item");
    const durationMs = ((item as any).quantity ?? 2) * 60 * 60 * 1000; // quantity = hours
    await ctx.db.delete(args.itemId);
    if (type === "xp_boost") {
      await ctx.db.patch(player._id, { xpBoostUntil: Math.max(player.xpBoostUntil ?? 0, Date.now() + durationMs) });
      return { success: true, message: `⚡ XP Boost activated for ${(item as any).quantity ?? 2} hours!` };
    }
    await ctx.db.patch(player._id, { cashBoostUntil: Math.max(player.cashBoostUntil ?? 0, Date.now() + durationMs) });
    return { success: true, message: `💰 Cash Boost activated for ${(item as any).quantity ?? 2} hours!` };
  },
});

// Get active boosts
export const getActiveBoosts = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) return { xpBoost: 0, cashBoost: 0 };
    const now = Date.now();
    return {
      xpBoost: (player.xpBoostUntil ?? 0) > now ? (player.xpBoostUntil as number) : 0,
      cashBoost: (player.cashBoostUntil ?? 0) > now ? (player.cashBoostUntil as number) : 0,
    };
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
    // Get real value from the item's price field or use name-based lookup
    let sellPrice = (item as any).price ?? 0;
    if ((item as any).type === "easter_egg") sellPrice = 25000000 * ((item as any).quantity ?? 1);
    if (sellPrice <= 0) {
      // Fallback: use rarity-based value but much higher
      const rarity = (item as any).rarity ?? "common";
      const rarityMult: Record<string, number> = { common: 500, uncommon: 2000, rare: 8000, epic: 25000, legendary: 100000 };
      sellPrice = rarityMult[rarity] ?? 500;
    }
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + sellPrice });
    await ctx.db.delete(args.itemId);
    return { money: sellPrice };
  },
});

// Sell ALL items at once
export const sellAllItems = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const items = await ctx.db.query("inventory").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect();
    let totalEarned = 0;
    for (const item of items) {
      if ((item as any).equipped) continue;
      let price = (item as any).price ?? 0;
      if ((item as any).type === "easter_egg") price = 25000000 * ((item as any).quantity ?? 1);
      if (price <= 0) {
        const rarity = (item as any).rarity ?? "common";
        const rarityMult: Record<string, number> = { common: 500, uncommon: 2000, rare: 8000, epic: 25000, legendary: 100000 };
        price = rarityMult[rarity] ?? 500;
      }
      totalEarned += price;
      await ctx.db.delete(item._id);
    }
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + totalEarned });
    return { totalEarned, count: items.length };
  },
});

// Sell ALL vehicles at once
export const sellAllVehicles = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const vehicles = await ctx.db.query("vehicles").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect();
    let totalEarned = 0;
    for (const veh of vehicles) {
      const basePrice = (veh.purchasePrice ?? 0) > 0 ? (veh.purchasePrice ?? 0) : (veh.speed ?? 50) * 1000;
      const price = basePrice;
      totalEarned += price;
      await ctx.db.delete(veh._id);
    }
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + totalEarned });
    return { totalEarned, count: vehicles.length };
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
export const getVehicleShop = query({ args: {}, handler: async () => { return [{ name: "2021 Honda Accord", type: "sedan", speed: 58, storage: 26, price: 28000, armored: false, emoji: "🚗" }, { name: "2022 Toyota Tacoma", type: "truck", speed: 55, storage: 45, price: 42000, armored: false, emoji: "🛻" }, { name: "2021 BMW X5", type: "suv", speed: 70, storage: 40, price: 75000, armored: false, emoji: "🚙" }, { name: "2022 Mercedes G-Wagon", type: "suv", speed: 72, storage: 35, price: 180000, armored: true, emoji: "🛡️" }, { name: "2021 Porsche Cayenne", type: "suv", speed: 78, storage: 30, price: 95000, armored: false, emoji: "🏎️" }, { name: "2022 Tesla Model X", type: "electric", speed: 80, storage: 35, price: 110000, armored: false, emoji: "⚡" }]; } });
export const buyVehicle = mutation({ args: { name: v.string(), type: v.string(), speed: v.number(), storage: v.number(), price: v.number(), armored: v.boolean() }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); if ((p.money ?? 0) < args.price) throw new Error("Not enough money!"); await ctx.db.patch(p._id, { money: (p.money ?? 0) - args.price }); await ctx.db.insert("vehicles", { userId: p._id, name: args.name, type: args.type, speed: args.speed, storage: args.storage, armored: args.armored, stolen: false, purchasePrice: args.price }); return { success: true }; } });
export const sellVehicle = mutation({ args: { vehicleId: v.id("vehicles") }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const veh = await ctx.db.get(args.vehicleId); if (!veh || veh.userId !== p._id) throw new Error("Not your vehicle"); const basePrice = (veh.purchasePrice ?? 0) > 0 ? (veh.purchasePrice ?? 0) : (veh.speed ?? 50) * 1000;
    const price = basePrice; await ctx.db.patch(p._id, { money: (p.money ?? 0) + price }); await ctx.db.delete(args.vehicleId); return { price, money: price }; } });
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
export const claimDailyReward = mutation({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const now = Date.now(); const lastClaim = (p as any).lastDailyClaim ?? 0; const TWELVE_HOURS = 43200000; if (lastClaim && (now - lastClaim) < TWELVE_HOURS) { const remaining = Math.ceil((TWELVE_HOURS - (now - lastClaim)) / 1000); const h = Math.floor(remaining / 3600); const m = Math.floor((remaining % 3600) / 60); const s = remaining % 60; return { success: false, message: `Locked! Wait ${h}h ${m}m ${s}s` }; } const streak = ((p as any).dailyStreak ?? 0) + 1; const rewards = [100000, 350000, 700000, 1400000, 2800000, 6000000, 12000000]; const dayIdx = ((streak - 1) % 7); const reward = rewards[dayIdx]; const isBonusDay = streak % 7 === 0; const xpBonus = isBonusDay ? 500 : 50; await ctx.db.patch(p._id, { money: (p.money ?? 0) + reward, dailyStreak: streak, lastDailyClaim: now, experience: ((p as any).experience ?? 0) + xpBonus }); return { success: true, reward, streak, day: dayIdx + 1, message: isBonusDay ? `🎁 DAY 7 BONUS! $${reward.toLocaleString()} + 500 XP! Streak resets!` : `🎁 Day ${dayIdx + 1}! $${reward.toLocaleString()} + ${xpBonus} XP! Come back in 12 hours!` }; } });

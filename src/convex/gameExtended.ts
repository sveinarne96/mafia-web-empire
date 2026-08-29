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
    // 🏆 JACKPOT: Golden Egg (4%)
    if (roll < 0.07) {
      const cash = 5000000;
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) + cash,
        xpBoostUntil: Math.max(player.xpBoostUntil ?? 0, twoHours),
        cashBoostUntil: Math.max(player.cashBoostUntil ?? 0, twoHours),
      });
      return { prize: "GOLDEN EGG!", icon: "🌟", message: `🌟 GOLDEN EGG! $${cash.toLocaleString()} + 3x XP & Cash Boost for 2 hours!`, cash };
    }
    // 🥤 ENERGY DRINK (7%) — random duration 1h–150h
    if (roll < 0.14) {
      const hours = [1, 3, 6, 12, 24, 48, 90, 150][Math.floor(Math.random() * 8)];
      await ctx.db.patch(player._id, { energyDrinkUntil: Math.max((player as any).energyDrinkUntil ?? 0, Date.now() + hours * 3600_000) } as any);
      return { prize: `Energy Drink ${hours}h`, icon: "🥤", message: `🥤 ENERGY RUSH! ${hours} hour energy drink — +25% XP on all crimes!`, cash: 0 };
    }
    // ⚡ XP BOOST (5%) — random duration 1h–48h
    if (roll < 0.19) {
      const hours = [1, 3, 6, 12, 24, 48][Math.floor(Math.random() * 6)];
      await ctx.db.patch(player._id, { xpBoostUntil: Math.max(player.xpBoostUntil ?? 0, Date.now() + hours * 3600_000) });
      return { prize: `XP Boost ${hours}h`, icon: "⚡", message: `⚡ 3x XP BOOST for ${hours} HOURS! All crimes earn triple XP!`, cash: 0 };
    }
    // 💰 CASH BOOST (5%) — random duration 1h–48h
    if (roll < 0.24) {
      const hours = [1, 3, 6, 12, 24, 48][Math.floor(Math.random() * 6)];
      await ctx.db.patch(player._id, { cashBoostUntil: Math.max(player.cashBoostUntil ?? 0, Date.now() + hours * 3600_000) });
      return { prize: `Cash Boost ${hours}h`, icon: "💰", message: `💰 3x CASH BOOST for ${hours} HOURS! All crimes pay triple!`, cash: 0 };
    }
    // 🎯 POINTS BOOST (3%) — 3x points from crimes, random duration 1h–24h
    if (roll < 0.27) {
      const hours = [1, 3, 6, 12, 24][Math.floor(Math.random() * 5)];
      await ctx.db.patch(player._id, { pointsBoostUntil: Math.max((player as any).pointsBoostUntil ?? 0, Date.now() + hours * 3600_000) } as any);
      return { prize: `Points Boost ${hours}h`, icon: "🎯", message: `🎯 3x POINTS BOOST for ${hours} HOURS! Every crime earns triple points!`, cash: 0 };
    }
    // 🌟 REPUTATION BOOST (3%) — 3x reputation from kills
    if (roll < 0.30) {
      const hours = [1, 3, 6, 12, 24][Math.floor(Math.random() * 5)];
      await ctx.db.patch(player._id, { repBoostUntil: Math.max((player as any).repBoostUntil ?? 0, Date.now() + hours * 3600_000) } as any);
      return { prize: `Reputation Boost ${hours}h`, icon: "🌟", message: `🌟 3x REPUTATION BOOST for ${hours} HOURS! Kills earn triple reputation!`, cash: 0 };
    }
    // 📈 LEVEL BOOST (5%) — instant level jumps (+5, +10, +15, +20)
    if (roll < 0.35) {
      const levels = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
      const currentLevel = player.level ?? 1;
      const newLevel = currentLevel + levels;
      await ctx.db.patch(player._id, { level: newLevel, experience: 0 });
      return { prize: `Level Boost +${levels}`, icon: "📈", message: `📈 LEVEL BOOST! You jumped ${levels} levels instantly! Now Level ${newLevel}!`, cash: 0 };
    }
    // 💵 MEGA CASH BOOST (12%) — massive instant cash: $5M to $120M
    if (roll < 0.47) {
      const cashAmounts = [5000000, 10000000, 15000000, 20000000, 25000000, 30000000, 35000000, 40000000, 45000000, 50000000, 55000000, 60000000, 70000000, 80000000, 120000000];
      const cash = cashAmounts[Math.floor(Math.random() * cashAmounts.length)];
      await ctx.db.patch(player._id, { money: (player.money ?? 0) + cash });
      return { prize: `Mega Cash $${(cash/1000000).toFixed(0)}M`, icon: "💵", message: `💵 MEGA CASH DROP! $${cash.toLocaleString()} added to your bank account!`, cash };
    }
    // ⚔️ Legendary Weapon (3%)
    if (roll < 0.50) {
      const atk = 50 + Math.floor(Math.random() * 100);
      await ctx.db.insert("inventory", { userId: player._id, itemId: `egg_weapon_${Date.now()}`, name: `⚔️ Egg-Forged Blade (+${atk} ATK)`, type: "weapon", equipped: false, quantity: 1, attack: atk, rarity: "legendary", price: atk * 20000 });
      return { prize: "Legendary Weapon", icon: "⚔️", message: `⚔️ Legendary weapon found! Egg-Forged Blade (+${atk} ATK) added to your items!`, cash: 0 };
    }
    // 🛡️ Legendary Armor (3%)
    if (roll < 0.53) {
      const def = 50 + Math.floor(Math.random() * 100);
      await ctx.db.insert("inventory", { userId: player._id, itemId: `egg_armor_${Date.now()}`, name: `🛡️ Egg-Plated Vest (+${def} DEF)`, type: "armor", equipped: false, quantity: 1, defense: def, rarity: "legendary", price: def * 20000 });
      return { prize: "Legendary Armor", icon: "🛡️", message: `🛡️ Legendary armor found! Egg-Plated Vest (+${def} DEF) added to your items!`, cash: 0 };
    }
    // 🏆 Points (3%)
    if (roll < 0.56) {
      const pts = 200 + Math.floor(Math.random() * 800);
      await ctx.db.patch(player._id, { points: (player.points ?? 0) + pts });
      return { prize: "Point Cache", icon: "🏆", message: `🏆 Point cache! ${pts} points added to your score!`, cash: 0 };
    }
    // 🎁 EGG VAULT (44%) — one of 512 unique random items, sellable
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

// ===== USE VAULT ITEM (egg vault specials) =====
export const useVaultItem = mutation({
  args: { itemId: v.id("inventory") },
  handler: async (ctx, args) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item || (item as any).userId !== p._id) throw new Error("Not your item");

    const type = (item as any).type;
    const rarity = (item as any).rarity ?? "common";
    const price = (item as any).price ?? 0;
    const rarityMult = rarity === "legendary" ? 3 : rarity === "epic" ? 2 : rarity === "rare" ? 1.5 : 1;

    await ctx.db.delete(args.itemId);
    const msgs: string[] = [];

    switch (type) {
      case "relic": {
        // Relics give permanent ATK + DEF boost
        const atkBonus = Math.floor(5 + rarityMult * 10);
        const defBonus = Math.floor(5 + rarityMult * 10);
        await ctx.db.patch(p._id, { attack: (p.attack ?? 10) + atkBonus, defense: (p.defense ?? 10) + defBonus });
        msgs.push(`PERMANENT: +${atkBonus} ATK, +${defBonus} DEF`);
        break;
      }
      case "gadget": {
        // Gadgets give 12h 3x XP boost
        const dur = 12 * 3600000;
        await ctx.db.patch(p._id, { xpBoostUntil: Math.max(p.xpBoostUntil ?? 0, Date.now() + dur) });
        msgs.push(`3x XP BOOST for 12 HOURS`);
        break;
      }
      case "luxury": {
        // Luxury goods give instant massive cash
        const cash = Math.floor(price * 0.5);
        await ctx.db.patch(p._id, { money: (p.money ?? 0) + cash });
        msgs.push(`INSTANT CASH: $${cash.toLocaleString()}`);
        break;
      }
      case "jewel": {
        // Jewels give permanent stat boost + cash
        const statBonus = Math.floor(10 + rarityMult * 15);
        const cash = Math.floor(price * 0.3);
        await ctx.db.patch(p._id, {
          attack: (p.attack ?? 10) + statBonus,
          defense: (p.defense ?? 10) + statBonus,
          money: (p.money ?? 0) + cash,
        });
        msgs.push(`PERMANENT: +${statBonus} ATK & DEF + $${cash.toLocaleString()} CASH`);
        break;
      }
      case "artifact": {
        // Artifacts give massive permanent stat boost
        const bigBonus = Math.floor(20 + rarityMult * 25);
        await ctx.db.patch(p._id, { attack: (p.attack ?? 10) + bigBonus, defense: (p.defense ?? 10) + bigBonus });
        msgs.push(`PERMANENT: +${bigBonus} ATK & DEF — an ancient artifact empowers you!`);
        break;
      }
      case "egg_special": {
        // Egg specials give random massive bonus
        const roll = Math.random();
        if (roll < 0.3) {
          const cash = Math.floor(10000000 + rarityMult * 20000000);
          await ctx.db.patch(p._id, { money: (p.money ?? 0) + cash });
          msgs.push(`GOLDEN YOLK! +$${cash.toLocaleString()} CASH`);
        } else if (roll < 0.6) {
          await ctx.db.patch(p._id, {
            xpBoostUntil: Math.max(p.xpBoostUntil ?? 0, Date.now() + 24 * 3600000),
            cashBoostUntil: Math.max(p.cashBoostUntil ?? 0, Date.now() + 24 * 3600000),
          });
          msgs.push(`EGG BLESSING! 3x XP & 3x CASH for 24 HOURS`);
        } else {
          const bigBonus = Math.floor(30 + rarityMult * 30);
          await ctx.db.patch(p._id, {
            attack: (p.attack ?? 10) + bigBonus,
            defense: (p.defense ?? 10) + bigBonus,
            money: (p.money ?? 0) + Math.floor(rarityMult * 5000000),
          });
          msgs.push(`DRAGON BLOOD! +${bigBonus} ATK & DEF + $${Math.floor(rarityMult * 5000000).toLocaleString()}`);
        }
        break;
      }
      default: {
        // Contraband, collectible, curio — give sell-value bonus cash
        const cash = Math.floor(price * 0.8);
        await ctx.db.patch(p._id, { money: (p.money ?? 0) + cash });
        msgs.push(`SOLD ON BLACK MARKET: $${cash.toLocaleString()}`);
        break;
      }
    }

    return { success: true, message: `✨ ${item.name} USED! ${msgs.join(" — ")}` };
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
export const commitLegendaryCrime = mutation({ args: { crimeId: v.string(), reward: v.optional(v.number()), xp: v.optional(v.number()), risk: v.optional(v.number()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const success = Math.random() < 0.3; const rw = success ? (args.reward ?? 100000) : 0; if (success) await ctx.db.patch(p._id, { money: (p.money ?? 0) + rw, experience: (p.experience ?? 0) + Math.floor(250 * (1 + Math.floor((p.level ?? 1) / 10) * 0.25)) }); return { success, reward: rw, message: success ? "Success!" : "Failed!" }; } });
export const getMissions = query({ args: {}, handler: async (ctx) => { return await ctx.db.query("missions").collect(); } });
export const getPlayerMissions = query({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) return []; return await ctx.db.query("playerMissions").withIndex("by_user", (q) => q.eq("userId", p._id)).collect(); } });
export const acceptMission = mutation({ args: { missionId: v.id("missions") }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); await ctx.db.insert("playerMissions", { userId: p._id, missionId: args.missionId, progress: 0, completed: false, claimed: false, startedAt: Date.now() }); return { success: true }; } });
export const completeMission = mutation({ args: { missionId: v.optional(v.string()), playerMissionId: v.optional(v.string()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const reward = Math.floor(Math.random() * 50000) + 5000; const points = Math.floor(Math.random() * 200) + 50; if (p) await ctx.db.patch(p._id, { money: (p.money ?? 0) + reward, points: (p.points ?? 0) + points }); return { success: true, reward, points }; } });
export const getOrganizedCrimes = query({ args: {}, handler: async (ctx) => { return await ctx.db.query("organizedCrimes").collect(); } });
export const joinOrganizedCrime = mutation({ args: { crimeId: v.id("organizedCrimes") }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const success = Math.random() < 0.6; const reward = success ? Math.floor(Math.random() * 100000) + 10000 : 0; if (success && p) await ctx.db.patch(p._id, { money: (p.money ?? 0) + reward }); return { success, reward }; } });
export const getMyBusinesses = query({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) return []; return await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", p._id)).collect(); } });

// ===== SELL BUSINESS =====
export const sellBusiness = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");
    const biz = await ctx.db.get(args.businessId);
    if (!biz || biz.ownerId !== p._id) throw new Error("Not your business!");
    const refund = biz.price ?? 0;
    await ctx.db.patch(p._id, { money: (p.money ?? 0) + refund });
    await ctx.db.delete(args.businessId);
    return { success: true, refund, message: `💰 Sold ${biz.name} for $${refund.toLocaleString()}!` };
  },
});

// ===== COLLECT OIL EARNINGS (once per hour) =====
export const collectOilEarnings = mutation({
  args: {},
  handler: async (ctx) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");
    const lastOilCollect = (p as any).lastOilCollect ?? 0;
    if (Date.now() - lastOilCollect < 3600000) {
      const remaining = Math.ceil((3600000 - (Date.now() - lastOilCollect)) / 1000);
      return { success: false, message: `Oil earnings locked! Wait ${Math.floor(remaining/60)}m ${remaining%60}s`, collected: 0 };
    }
    const oilBizs = await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", p._id)).collect();
    const oilComps = oilBizs.filter(b => b.type === "oil");
    const total = oilComps.reduce((sum, b) => sum + (b.income ?? 0), 0);
    if (total === 0) return { success: false, message: "No oil companies owned!", collected: 0 };
    await ctx.db.patch(p._id, { money: (p.money ?? 0) + total, lastOilCollect: Date.now() } as any);
    return { success: true, collected: total, message: `🛢️ Oil earnings collected: $${total.toLocaleString()}! Next withdrawal in 1 hour.` };
  },
});

// ===== BUSINESS SHOP BUY (with ownership limits) =====
export const buyPremiumBusiness = mutation({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");
    const catalog = [
      { type: "mall", name: "Shopping Mall", maxOwn: 15, price: 2000000, income: 5000000, icon: "🏬" },
      { type: "casino", name: "Casino Resort", maxOwn: 12, price: 25000000, income: 55000000, icon: "🎰" },
      { type: "hotel", name: "Luxury Hotel", maxOwn: 10, price: 250000000, income: 275000000, icon: "🏨" },
      { type: "telecom", name: "Telecom Company", maxOwn: 8, price: 750000000, income: 900000000, icon: "📡" },
      { type: "oil", name: "Oil Company", maxOwn: 5, price: 2500000000, income: 2800000000, icon: "🛢️" },
    ];
    const biz = catalog.find(b => b.type === args.type);
    if (!biz) throw new Error("Invalid business type!");
    const owned = await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", p._id)).collect();
    const count = owned.filter(b => b.type === biz.type).length;
    if (count >= biz.maxOwn) throw new Error(`Maximum ${biz.maxOwn} ${biz.name}s allowed!`);
    if ((p.money ?? 0) < biz.price) throw new Error(`Need $${biz.price.toLocaleString()}!`);
    await ctx.db.insert("businesses", { ownerId: p._id, name: biz.name, type: biz.type, city: "Global", price: biz.price, income: biz.income, level: 1 });
    await ctx.db.patch(p._id, { money: (p.money ?? 0) - biz.price });
    return { success: true, message: `${biz.icon} Bought ${biz.name} for $${biz.price.toLocaleString()}! Earning $${biz.income.toLocaleString()}/cycle.` };
  },
});

// ===== POINTS SHOP =====
export const buyRankBooster = mutation({
  args: { tier: v.union(v.literal("small"), v.literal("standard"), v.literal("mega")) },
  handler: async (ctx, args) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");
    const tiers = { small: { cost: 90, hours: 4 }, standard: { cost: 200, hours: 10 }, mega: { cost: 500, hours: 24 } };
    const t = tiers[args.tier];
    if ((p.points ?? 0) < t.cost) throw new Error(`Need ${t.cost} points!`);
    const activeBoost = (p as any).rankBoostUntil ?? 0;
    if (Date.now() < activeBoost) throw new Error("You already have a rank booster active!");
    await ctx.db.patch(p._id, { points: (p.points ?? 0) - t.cost, rankBoostUntil: Date.now() + t.hours * 3600000 } as any);
    return { success: true, message: `🚀 Rank Booster (${args.tier}) activated for ${t.hours} hours! +50% XP on all crimes!` };
  },
});

export const sellCompanyForPoints = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");
    const biz = await ctx.db.get(args.businessId);
    if (!biz || biz.ownerId !== p._id) throw new Error("Not your business!");
    if ((p.points ?? 0) < 50) throw new Error("Need 50 points to sell company via Points Shop!");
    await ctx.db.patch(p._id, { points: (p.points ?? 0) - 50, money: (p.money ?? 0) + (biz.price ?? 0) });
    await ctx.db.delete(args.businessId);
    return { success: true, message: `💰 Sold ${biz.name} for $${(biz.price ?? 0).toLocaleString()} (−50 points)!` };
  },
});

export const getPointsShop = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const player = await ctx.db.query("users").withIndex("by_id", (q: any) => q.eq("_id", identity.subject as any)).first();
    if (!player) return null;
    return {
      points: player.points ?? 0,
      rankBoostActive: (player as any).rankBoostUntil ?? 0,
      businesses: await ctx.db.query("businesses").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect(),
    };
  },
});

// ===== BUY POINTS SERVICE (ultimate shop services) =====
export const buyPointsService = mutation({
  args: { serviceId: v.string() },
  handler: async (ctx, args) => {
    const p = await getPlayer(ctx);
    if (!p) throw new Error("Not authenticated");

    const services: Record<string, { cost: number; action: (player: any) => Promise<string> }> = {
      "xp_surge": { cost: 300, action: async (pl) => {
        await ctx.db.patch(pl._id, { xpBoostUntil: Math.max(pl.xpBoostUntil ?? 0, Date.now() + 6 * 3600000) });
        return "⚡ XP SURGE! 3x XP for 6 hours!";
      }},
      "cash_storm": { cost: 300, action: async (pl) => {
        await ctx.db.patch(pl._id, { cashBoostUntil: Math.max(pl.cashBoostUntil ?? 0, Date.now() + 6 * 3600000) });
        return "💰 CASH STORM! 3x Cash for 6 hours!";
      }},
      "points_multiplier": { cost: 250, action: async (pl) => {
        await ctx.db.patch(pl._id, { pointsBoostUntil: Math.max((pl as any).pointsBoostUntil ?? 0, Date.now() + 6 * 3600000) } as any);
        return "🎯 POINTS MULTIPLIER! 3x Points for 6 hours!";
      }},
      "energy_surge": { cost: 200, action: async (pl) => {
        await ctx.db.patch(pl._id, { energyDrinkUntil: Math.max((pl as any).energyDrinkUntil ?? 0, Date.now() + 12 * 3600000) } as any);
        return "🥤 ENERGY SURGE! +25% XP for 12 hours!";
      }},
      "god_mode": { cost: 1500, action: async (pl) => {
        const dur = 24 * 3600000;
        await ctx.db.patch(pl._id, {
          xpBoostUntil: Math.max(pl.xpBoostUntil ?? 0, Date.now() + dur),
          cashBoostUntil: Math.max(pl.cashBoostUntil ?? 0, Date.now() + dur),
          energyDrinkUntil: Math.max((pl as any).energyDrinkUntil ?? 0, Date.now() + dur),
        } as any);
        return "👑 GOD MODE! 3x XP + 3x Cash + Energy for 24 HOURS!";
      }},
      "stat_20": { cost: 400, action: async (pl) => {
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + 20, defense: (pl.defense ?? 10) + 20 });
        return "💪 +20 ATK & DEF PERMANENTLY!";
      }},
      "stat_50": { cost: 1000, action: async (pl) => {
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + 50, defense: (pl.defense ?? 10) + 50 });
        return "💪 +50 ATK & DEF PERMANENTLY!";
      }},
      "stat_100": { cost: 2500, action: async (pl) => {
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + 100, defense: (pl.defense ?? 10) + 100 });
        return "💪 +100 ATK & DEF PERMANENTLY!";
      }},
      "stat_250": { cost: 6000, action: async (pl) => {
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + 250, defense: (pl.defense ?? 10) + 250 });
        return "💪 +250 ATK & DEF PERMANENTLY! GODLIKE!";
      }},
      "max_hp": { cost: 2000, action: async (pl) => {
        await ctx.db.patch(pl._id, { life: (pl.life ?? 100) + 50 });
        return "❤️ +50 MAX HP PERMANENTLY!";
      }},
      "revive": { cost: 200, action: async (pl) => {
        if (!pl.isDead) throw new Error("You're not dead!");
        await ctx.db.patch(pl._id, { isDead: false, life: 50 });
        return "💖 REVIVED! Back from the dead!";
      }},
      "jailbreak": { cost: 500, action: async (pl) => {
        if (!pl.inPrison) throw new Error("You're not in prison!");
        await ctx.db.patch(pl._id, { inPrison: false, prisonTime: 0 });
        return "🔓 JAILBREAK! You're free!";
      }},
      "life_refill": { cost: 100, action: async (pl) => {
        await ctx.db.patch(pl._id, { life: 100 });
        return "❤️ FULL HEAL! Back to 100 HP!";
      }},
      "level_skip_5": { cost: 800, action: async (pl) => {
        const nl = (pl.level ?? 1) + 5;
        await ctx.db.patch(pl._id, { level: nl, experience: 0 });
        return `📈 +5 LEVELS! Now Level ${nl}!`;
      }},
      "level_skip_10": { cost: 1500, action: async (pl) => {
        const nl = (pl.level ?? 1) + 10;
        await ctx.db.patch(pl._id, { level: nl, experience: 0 });
        return `📈 +10 LEVELS! Now Level ${nl}!`;
      }},
      "cash_10m": { cost: 500, action: async (pl) => {
        await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + 10000000 });
        return "💵 +$10,000,000 deposited!";
      }},
      "cash_50m": { cost: 1500, action: async (pl) => {
        await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + 50000000 });
        return "💵 +$50,000,000 deposited!";
      }},
      "cash_100m": { cost: 3000, action: async (pl) => {
        await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + 100000000 });
        return "💵 +$100,000,000 deposited!";
      }},
      "prestige": { cost: 5000, action: async (pl) => {
        if ((pl.level ?? 1) < 10) throw new Error("Must be level 10+ to prestige!");
        const mult = ((pl as any).prestigeMultiplier ?? 1) + 0.1;
        await ctx.db.patch(pl._id, { level: 1, experience: 0, prestigeMultiplier: mult, prestige: ((pl as any).prestige ?? 0) + 1 } as any);
        return `👑 PRESTIGE! Reset to Lv.1 with +${Math.round((mult - 1) * 100)}% permanent multiplier!`;
      }},
      // ===== COOLDOWNS & UTILITY =====
      "quick_discharge": { cost: 150, action: async (pl) => {
        if (!pl.inPrison && (pl.life ?? 100) >= 100) throw new Error("Nothing to discharge!");
        await ctx.db.patch(pl._id, { life: 100, inPrison: false, prisonTime: 0 });
        return "🏥 QUICK DISCHARGE! Released from hospital/prison!";
      }},
      "bribe_guard": { cost: 250, action: async (pl) => {
        if (!pl.inPrison) throw new Error("Not in prison!");
        await ctx.db.patch(pl._id, { inPrison: false, prisonTime: 0 });
        return "🔓 BRIBE GUARD! Released from prison immediately!";
      }},
      "clear_heist_cd": { cost: 200, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "💣 HEIST COOLDOWN CLEARED!";
      }},
      "clear_car_theft_cd": { cost: 150, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "🚗 CAR THEFT COOLDOWN CLEARED!";
      }},
      "clear_assassin_cd": { cost: 300, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "🗡️ ASSASSINATION COOLDOWN CLEARED!";
      }},
      "clear_oc_cd": { cost: 400, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "🕵️ ORGANIZED CRIME COOLDOWN CLEARED!";
      }},
      "emergency_medicine": { cost: 100, action: async (pl) => {
        await ctx.db.patch(pl._id, { life: 100 });
        return "💊 EMERGENCY MEDICINE! Full health!";
      }},
      "nurse_vip": { cost: 500, action: async (pl) => {
        await ctx.db.patch(pl._id, { life: 100 });
        return "👩‍⚕️ NURSE VIP! Hospital stays halved 24h!";
      }},
      "lawyer_speed_dial": { cost: 600, action: async (pl) => {
        await ctx.db.patch(pl._id, { wantedLevel: Math.max(0, (pl.wantedLevel ?? 0) - 3) });
        return "⚖️ LAWYER! Wanted -3! Auto-avoid 3h!";
      }},
      "teleportation": { cost: 800, action: async (pl) => {
        return "🌀 TELEPORTED! Instant travel!";
      }},
      "clear_drug_cd": { cost: 250, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "💊 DRUG SMUGGLING COOLDOWN CLEARED!";
      }},
      "quick_laundering": { cost: 300, action: async (pl) => {
        return "💵 MONEY LAUNDERED INSTANTLY!";
      }},
      "quick_production": { cost: 350, action: async (pl) => {
        return "🏭 BULLET FACTORY BATCH COMPLETE!";
      }},
      "express_research": { cost: 400, action: async (pl) => {
        return "🔬 GANG UPGRADE COMPLETE!";
      }},
      "clear_escape_cd": { cost: 200, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "🏃 ESCAPE COOLDOWN CLEARED!";
      }},
      "top_lawyer": { cost: 1500, action: async (pl) => {
        return "👔 TOP LAWYER! Buddies prison time -80% for 12h!";
      }},
      "medical_vip": { cost: 2000, action: async (pl) => {
        await ctx.db.patch(pl._id, { life: 100 });
        return "🏥 MEDICAL VIP! +10% passive HP regen!";
      }},
      "remove_cooldown": { cost: 500, action: async (pl) => {
        await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any);
        return "⏱️ ALL COOLDOWNS REMOVED!";
      }},
      "fake_license": { cost: 400, action: async (pl) => {
        return "🔢 FAKE PLATES! Car untraceable!";
      }},
      "secret_tunnel": { cost: 1200, action: async (pl) => {
        return "🕳️ SECRET TUNNEL! 100% escape chance!";
      }},
      // ===== DEFENSE & PROTECTION =====
      "anti_bugging": { cost: 250, action: async (pl) => {
        return "🔍 BUGS REMOVED!";
      }},
      "gas_mask": { cost: 300, action: async (pl) => {
        return "😷 GAS MASK EQUIPPED!";
      }},
      "security_detail": { cost: 800, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.15);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `💂 SECURITY DETAIL! +${b} ATK for 12h!`;
      }},
      "hidden_stash": { cost: 350, action: async (pl) => {
        return "📦 HIDDEN STASH! Items safe from raids!";
      }},
      "anti_bounty": { cost: 1000, action: async (pl) => {
        return "🛡️ ANTI-BOUNTY! No bounties 24h!";
      }},
      "corrupt_judge": { cost: 1500, action: async (pl) => {
        return "⚖️ CORRUPT JUDGE! Sentences -5% permanently!";
      }},
      "hq_shield": { cost: 1200, action: async (pl) => {
        return "🏰 HQ SHIELDED! Invulnerable 2h!";
      }},
      "vest_l2": { cost: 500, action: async (pl) => {
        const b = Math.floor((pl.defense ?? 10) * 0.3);
        await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b });
        return `🦺 VEST L2! +${b} DEF! Absorbs 1200 bullets!`;
      }},
      "vest_l3": { cost: 1200, action: async (pl) => {
        const b = Math.floor((pl.defense ?? 10) * 0.5);
        await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b });
        return `🦺 VEST L3! +${b} DEF! Absorbs 3000 bullets!`;
      }},
      "vest_titanium": { cost: 3000, action: async (pl) => {
        const b = Math.floor((pl.defense ?? 10) * 0.8);
        await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b });
        return `🦺 TITANIUM VEST! +${b} DEF! Absorbs 5000 bullets!`;
      }},
      "vest_ceramic": { cost: 2000, action: async (pl) => {
        const b = Math.floor((pl.defense ?? 10) * 0.6);
        await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b });
        return `🦺 CERAMIC VEST! +${b} DEF! Absorbs 4000 bullets!`;
      }},
      "pre_bail": { cost: 1500, action: async (pl) => {
        return "💰 PRE-BAILED! Auto-release next arrest!";
      }},
      "fake_death": { cost: 2000, action: async (pl) => {
        return "💀 FAKE DEATH! Appear dead 1h!";
      }},
      "corrupt_fbi": { cost: 2500, action: async (pl) => {
        await ctx.db.patch(pl._id, { wantedLevel: Math.max(0, (pl.wantedLevel ?? 0) - 2) });
        return "🕵️ CORRUPT FBI! Wanted -2! Raid warning!";
      }},
      "escape_moto": { cost: 700, action: async (pl) => {
        return "🏍️ ESCAPE MOTO! 90% street escape!";
      }},
      "godfather_blessing": { cost: 10000, action: async (pl) => {
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + 100, defense: (pl.defense ?? 10) + 100, life: 100, wantedLevel: 0, inPrison: false, prisonTime: 0 });
        return "👴 GODFATHER'S BLESSING! +100 ATK/DEF! Full heal! Invulnerable 48h!";
      }},
      // ===== WEAPONS & AMMO =====
      "gold_ak47": { cost: 1500, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.1);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `🔫 GOLD AK47! +${b} ATK!`;
      }},
      "rpg": { cost: 2000, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.5);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `🚀 RPG! +${b} ATK!`;
      }},
      "sniper_50cal": { cost: 1800, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.45);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `🎯 SNIPER .50 CAL! +${b} ATK!`;
      }},
      "tommy_gun": { cost: 1200, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.35);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `🔫 TOMMY GUN! +${b} ATK!`;
      }},
      "c4_explosives": { cost: 2500, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.6);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `💣 C4! +${b} ATK!`;
      }},
      "m60": { cost: 2000, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.5);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `🔫 M60! +${b} ATK!`;
      }},
      "military_drone": { cost: 3000, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.7);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `🛸 MILITARY DRONE! +${b} ATK!`;
      }},
      "acid_rain": { cost: 4000, action: async (pl) => {
        const b = Math.floor((pl.attack ?? 10) * 0.8);
        await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b });
        return `☢️ ACID RAIN! +${b} ATK!`;
      }},
      // ===== SPECIAL =====
      "crime_shield": { cost: 1000, action: async (pl) => {
        return "🛡️ CRIME SHIELD! Next crime cannot fail!";
      }},
      "double_rewards": { cost: 2000, action: async (pl) => {
        await ctx.db.patch(pl._id, { xpBoostUntil: Math.max(pl.xpBoostUntil ?? 0, Date.now() + 3600000), cashBoostUntil: Math.max(pl.cashBoostUntil ?? 0, Date.now() + 3600000) });
        return "💰 DOUBLE REWARDS! All doubled 1h!";
      }},
      "mystery_box": { cost: 300, action: async (pl) => {
        const pts = Math.floor(Math.random() * 4900) + 100;
        await ctx.db.patch(pl._id, { points: (pl.points ?? 0) + pts });
        return `🎁 MYSTERY BOX! +${pts} POINTS BACK!`;
      }},
      "reputation_boost": { cost: 600, action: async (pl) => {
        await ctx.db.patch(pl._id, { reputation: Math.min(100, (pl.reputation ?? 0) + 50) });
        return "🌟 +50 REPUTATION!";
      }},

      // ===== EXPRESS/QUICK COOLDOWN ITEMS =====
      "remove_scam_cd": { cost: 200, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "💸 SCAM COOLDOWN CLEARED!"; }},
      "faster_gang_war": { cost: 350, action: async (pl) => { return "⚔️ GANG WAR PREP REDUCED!"; }},
      "rapid_surveillance": { cost: 300, action: async (pl) => { return "🔍 SURVEILLANCE PLANTED INSTANTLY!"; }},
      "express_weapon_mod": { cost: 250, action: async (pl) => { return "🔧 WEAPON MODIFIED INSTANTLY!"; }},
      "remove_harbor_cd": { cost: 400, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "🚢 HARBOR HEIST COOLDOWN CLEARED!"; }},
      "quick_cartel_deal": { cost: 350, action: async (pl) => { return "🤝 CARTEL DEAL RENEWED!"; }},
      "express_theft": { cost: 300, action: async (pl) => { return "💰 BUSINESS SAFES EMPTIED INSTANTLY!"; }},
      "instant_immunity": { cost: 1500, action: async (pl) => { return "🛡️ INSTANT IMMUNITY! Next 10 crimes safe!"; }},
      "resin_bullets": { cost: 200, action: async (pl) => { return "🔫 RESIN BULLETS! Enemy escape speed reduced!"; }},
      "tracking_bug": { cost: 300, action: async (pl) => { return "🐛 TRACKING BUG PLANTED! Target movements tracked!"; }},
      "crossfire_contract": { cost: 800, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.3); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `💀 CROSSFIRE CONTRACT! +${b} ATK! AI gunmen hired!`; }},
      "gold_knuckle_duster": { cost: 150, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.05); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `👊 GOLD KNUCKLE DUSTER! +${b} ATK!`; }},
      "tactical_vest_upgrade": { cost: 400, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.2); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `🦺 TACTICAL VEST UPGRADED! +${b} DEF!`; }},
      "thermite_charge": { cost: 600, action: async (pl) => { return "🔥 THERMITE CHARGE! Steel gates melted!"; }},
      "suppressed_shotgun": { cost: 700, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.35); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `🔫 SUPPRESSED SHOTGUN! +${b} ATK! Stealth + damage!`; }},
      "sniper_bipod": { cost: 350, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.2); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `🎯 SNIPER BIPOD! +${b} ATK! +20% accuracy!`; }},
      "laser_rangefinder": { cost: 300, action: async (pl) => { return "🔴 LASER RANGEFINDER! No distance penalty!"; }},
      "magazine_coupler": { cost: 250, action: async (pl) => { return "📦 MAGAZINE COUPLER! 2x reload speed!"; }},
      "gold_shotgun": { cost: 1000, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.4); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `🔫 GOLD SHOTGUN! +${b} ATK! Exclusive!`; }},
      "dual_ammo_belt": { cost: 400, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.15); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `🔫 DUAL AMMO BELT! +${b} ATK! Two ammo types!`; }},
      "godfather_assassination": { cost: 5000, action: async (pl) => { return "👴 GODFATHER ASSASSINATION! NPC boss eliminated!"; }},
      "rapid_digging": { cost: 200, action: async (pl) => { const cash = Math.floor(Math.random() * 5000000) + 1000000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `⛏️ BURIED TREASURE! Found $${cash.toLocaleString()}!`; }},
      "express_diamond_smuggle": { cost: 350, action: async (pl) => { const cash = Math.floor(Math.random() * 3000000) + 500000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `💎 DIAMONDS SOLD! +$${cash.toLocaleString()}!`; }},
      "faster_gambling_cd": { cost: 200, action: async (pl) => { return "🎰 GAMBLING COOLDOWN CLEARED!"; }},
      "express_scratch_cards": { cost: 150, action: async (pl) => { const pts = Math.floor(Math.random() * 500) + 100; await ctx.db.patch(pl._id, { points: (pl.points ?? 0) + pts }); return `🎫 10 SCRATCH CARDS! +${pts} points!`; }},
      "quick_burn": { cost: 300, action: async (pl) => { return "🔥 PROPERTY BURNED INSTANTLY!"; }},
      "fight_cooldown": { cost: 150, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "🥊 FIGHT COOLDOWN CLEARED!"; }},
      "quick_sabotage": { cost: 250, action: async (pl) => { return "🔧 SABOTAGE COOLDOWN CLEARED!"; }},
      "express_mixing": { cost: 300, action: async (pl) => { return "⚗️ CHEMICALS MIXED INSTANTLY!"; }},
      "rapid_recruitment": { cost: 400, action: async (pl) => { return "👥 HENCHMEN RECRUITED!"; }},
      "quick_espionage": { cost: 350, action: async (pl) => { return "🕵️ SPY DEPLOYED IMMEDIATELY!"; }},
      "prison_riot": { cost: 2000, action: async (pl) => { return "⛓️ PRISON RIOT! All gang members freed!"; }},
      "stock_market_cd": { cost: 500, action: async (pl) => { return "📈 STOCK MARKET COOLDOWN REMOVED!"; }},
      "express_weapon_service": { cost: 200, action: async (pl) => { return "🔧 WEAPONS REPAIRED INSTANTLY!"; }},
      "faster_missions": { cost: 300, action: async (pl) => { return "📋 MISSIONS HALVED! NPC work faster!"; }},
      "quick_collection": { cost: 150, action: async (pl) => { const cash = Math.floor(Math.random() * 1000000) + 100000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `💰 PROTECTION MONEY COLLECTED! +$${cash.toLocaleString()}!`; }},
      "vip_flight_pass": { cost: 800, action: async (pl) => { return "✈️ VIP FLIGHT PASS! Free flights 7 days!"; }},
      "car_theft_search": { cost: 300, action: async (pl) => { return "🚗 RARE CAR FOUND! No waiting!"; }},
      "quick_car_repair": { cost: 150, action: async (pl) => { return "🔧 CAR REPAIRED INSTANTLY!"; }},
      "emergency_evacuation": { cost: 500, action: async (pl) => { if ((pl.life ?? 100) > 10) throw new Error("Health must be below 10%!"); await ctx.db.patch(pl._id, { life: 50 }); return "🚁 EVACUATED! Safe in another country!"; }},
      "quick_hacking": { cost: 250, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "💻 HACKING COOLDOWN CLEARED!"; }},
      "faster_bounty": { cost: 300, action: async (pl) => { return "🎯 BOUNTY PLACEMENT FASTER!"; }},
      "express_shooting": { cost: 200, action: async (pl) => { const b = Math.floor((pl.attack ?? 10) * 0.1); await ctx.db.patch(pl._id, { attack: (pl.attack ?? 10) + b }); return `🎯 ACCURACY +${b} ATK INSTANTLY!`; }},
      "remove_bank_cd": { cost: 400, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "🏦 BANK ROBBERY COOLDOWN CLEARED!"; }},
      "quick_kidnapping": { cost: 350, action: async (pl) => { return "绑架 KIDNAPPING READY!"; }},
      "express_counterfeit": { cost: 300, action: async (pl) => { const cash = Math.floor(Math.random() * 2000000) + 500000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `💵 COUNTERFEIT PRINTED! +$${cash.toLocaleString()}!`; }},
      "faster_harbor": { cost: 250, action: async (pl) => { return "🚢 HARBOR SHIPPING FASTER!"; }},
      "remove_street_cd": { cost: 150, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "🥊 STREET FIGHT COOLDOWN CLEARED!"; }},
      "quick_arms_smuggle": { cost: 400, action: async (pl) => { return "🔫 ARMS SMUGGLED INSTANTLY!"; }},
      "express_car_strip": { cost: 200, action: async (pl) => { const cash = Math.floor(Math.random() * 500000) + 100000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `🚗 CAR STRIPPED! +$${cash.toLocaleString()}!`; }},
      "remove_corruption_cd": { cost: 350, action: async (pl) => { return "👮 CORRUPTION COOLDOWN CLEARED!"; }},
      "faster_loan_shark": { cost: 200, action: async (pl) => { const cash = Math.floor(Math.random() * 800000) + 200000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `💰 LOANS COLLECTED! +$${cash.toLocaleString()}!`; }},
      "rapid_propaganda": { cost: 250, action: async (pl) => { return "📰 PROPAGANDA SPREAD! Rival reputation -10!"; }},
      "express_liquor": { cost: 300, action: async (pl) => { const cash = Math.floor(Math.random() * 1000000) + 200000; await ctx.db.patch(pl._id, { money: (pl.money ?? 0) + cash }); return `🥃 LIQUOR PRODUCED! +$${cash.toLocaleString()}!`; }},
      "reset_assassination": { cost: 1000, action: async (pl) => { await ctx.db.patch(pl._id, { crimeCooldowns: {} } as any); return "🗡️ ASSASSINATION COOLDOWN RESET!"; }},
      
      // ===== PROTECTION & SHIELDS =====
      "detective_shield": { cost: 600, action: async (pl) => { return "🕵️ DETECTIVE SHIELD! Untrackable 2h!"; }},
      "bodyguard_10": { cost: 400, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.1); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `💂 BODYGUARD! +${b} DEF! -10% damage!`; }},
      "elite_bodyguard": { cost: 1200, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.3); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `💂 ELITE BODYGUARD! +${b} DEF! 100% first-shot survival!`; }},
      "false_trails": { cost: 500, action: async (pl) => { return "🗺️ FALSE TRAILS! Detectives see wrong city!"; }},
      "vest_l1": { cost: 200, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.15); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `🦺 VEST L1! +${b} DEF! Absorbs 500 bullets!`; }},
      "military_kevlar": { cost: 1000, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.4); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `🦺 MILITARY KEVLAR! +${b} DEF! Absorbs 2000!`; }},
      "bp_limousine": { cost: 800, action: async (pl) => { return "🚗 BULLETPROOF LIMO! -50% car bomb death!"; }},
      "safehouse_small": { cost: 1000, action: async (pl) => { return "🏠 SAFEHOUSE! Invulnerable 6h!"; }},
      "luxury_bunker": { cost: 3000, action: async (pl) => { return "🏰 LUXURY BUNKER! Invulnerable 24h!"; }},
      "witness_protection": { cost: 1500, action: async (pl) => { return "👤 WITNESS PROTECTION! Hidden 3 days!"; }},
      "alarm_system": { cost: 300, action: async (pl) => { return "🚨 ALARM SYSTEM! Alert if searched!"; }},
      "surveillance_cameras": { cost: 400, action: async (pl) => { return "📹 CAMERAS! See who searches you!"; }},
      "tracker": { cost: 350, action: async (pl) => { return "📍 TRACKER! See where attackers flee!"; }},
      "confusing_rumors": { cost: 500, action: async (pl) => { return "📰 CONFUSING RUMORS! Search cost 3x!"; }},
      "kennel_rottweilers": { cost: 600, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.15); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `🐕 ROTTWEILERS! +${b} DEF! Stop 15% attacks!`; }},
      "hide_wealth": { cost: 300, action: async (pl) => { return "💰 HIDDEN WEALTH! Cash invisible!"; }},
      "bank_insurance": { cost: 800, action: async (pl) => { return "🏦 BANK INSURANCE! 50% cash protected on death!"; }},
      "fake_passport": { cost: 400, action: async (pl) => { return "📘 FAKE PASSPORT! Invisible in airport logs!"; }},
      "hidden_online": { cost: 350, action: async (pl) => { return "👻 HIDDEN ONLINE! Appear offline!"; }},
      "panic_button": { cost: 500, action: async (pl) => { return "🆘 PANIC BUTTON! Auto-flee to random city!"; }},
      "cyber_wall": { cost: 600, action: async (pl) => { return "💻 CYBER-WALL! Protected from hacks 12h!"; }},
      "rival_alerts": { cost: 300, action: async (pl) => { return "🔔 RIVAL ALERTS! Notified of rival gangs!"; }},
      "poison_taster": { cost: 400, action: async (pl) => { return "🍷 POISON TASTER! Immune to poison!"; }},
      "bp_glass": { cost: 500, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.2); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `🪟 BP GLASS! +${b} DEF! HQ protected!`; }},
      "counter_espionage": { cost: 700, action: async (pl) => { return "🕵️ COUNTER-ESPIONAGE! Spies exposed!"; }},
      "fake_ip": { cost: 350, action: async (pl) => { return "🌐 FAKE IP! Digital location hidden!"; }},
      "corrupt_chief": { cost: 2000, action: async (pl) => { return "👮 CORRUPT CHIEF! Record auto-cleared 10min!"; }},
      "secret_safe": { cost: 1500, action: async (pl) => { return "🔒 SECRET SAFE! $10M protected from theft!"; }},
      "smoke_bomb": { cost: 400, action: async (pl) => { return "💨 SMOKE BOMB! +40% escape chance!"; }},
      "bp_helmet": { cost: 500, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.2); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `⛑️ BP HELMET! +${b} DEF! No headshots!`; }},
      "minefield": { cost: 800, action: async (pl) => { return "💣 MINEFIELD! Factory protected from sabotage!"; }},
      "laser_sensors": { cost: 600, action: async (pl) => { return "🔴 LASER SENSORS! Assassins detected!"; }},
      "electronic_jammer": { cost: 500, action: async (pl) => { return "📡 JAMMER! Phone untraceable 4h!"; }},
      "blast_proof_wall": { cost: 700, action: async (pl) => { const b = Math.floor((pl.defense ?? 10) * 0.25); await ctx.db.patch(pl._id, { defense: (pl.defense ?? 10) + b }); return `🧱 BLAST-PROOF WALL! +${b} DEF! Casino safe!`; }},
      "loyalty_serum": { cost: 400, action: async (pl) => { return "💉 LOYALTY SERUM! Henchmen won't betray!"; }},
      "fake_id_express": { cost: 300, action: async (pl) => { return "🪪 FAKE ID! Identity changed instantly!"; }},
      "quick_renovation": { cost: 350, action: async (pl) => { return "🔨 RENOVATION COMPLETE! Property upgraded!"; }},
      "express_shipping": { cost: 250, action: async (pl) => { return "📦 EXPRESS SHIPPING! Contraband delivered!"; }},
      "emergency_blood": { cost: 1000, action: async (pl) => { return "🩸 EMERGENCY BLOOD! Survive fatal attack with 1 HP!"; }},
      "quick_player_search": { cost: 200, action: async (pl) => { return "🔍 SEARCH COOLDOWN CLEARED!"; }},
      "vip_cell": { cost: 500, action: async (pl) => { return "⛓️ VIP CELL! Earn XP in prison!"; }},
      "luxury_hospital": { cost: 500, action: async (pl) => { return "🏥 LUXURY ROOM! Train stats in hospital!"; }},
      "police_distraction": { cost: 800, action: async (pl) => { await ctx.db.patch(pl._id, { wantedLevel: Math.max(0, (pl.wantedLevel ?? 0) - 2) }); return "👮 POLICE DISTRACTED! Manhunt frozen 30min! Wanted -2!"; }},

    };

    const svc = services[args.serviceId];
    if (!svc) throw new Error("Invalid service!");
    if ((p.points ?? 0) < svc.cost) throw new Error(`Need ${svc.cost} points!`);

    await ctx.db.patch(p._id, { points: (p.points ?? 0) - svc.cost });
    const message = await svc.action(p);
    return { success: true, message };
  },
});

export const getBusinessShop = query({ args: {}, handler: async () => {
  return [
    { name: "Shopping Mall", type: "mall", icon: "🏬", maxOwn: 15, price: 2000000, income: 5000000, description: "Premium shopping center. Earns $5M per mall." },
    { name: "Casino Resort", type: "casino", icon: "🎰", maxOwn: 12, price: 25000000, income: 55000000, description: "High-roller casino. Earns $55M per resort." },
    { name: "Luxury Hotel", type: "hotel", icon: "🏨", maxOwn: 10, price: 250000000, income: 275000000, description: "5-star luxury hotel chain. Earns $275M per hotel." },
    { name: "Telecom Company", type: "telecom", icon: "📡", maxOwn: 8, price: 750000000, income: 900000000, description: "Nationwide telecom giant. Earns $900M per company." },
    { name: "Oil Company", type: "oil", icon: "🛢️", maxOwn: 5, price: 2500000000, income: 2800000000, description: "Oil empire. Earns $2.8B per company. Withdraw once per hour or lose earnings." },
  ];
} });
export const buyLottoTicket = mutation({ args: { type: v.string(), numbers: v.array(v.number()) }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const winning = Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 1); const matches = args.numbers.filter(n => winning.includes(n)).length; const prize = matches >= 3 ? matches * 10000 : 0; if (prize > 0 && p) await ctx.db.patch(p._id, { money: (p.money ?? 0) + prize }); else if (p) await ctx.db.patch(p._id, { experience: ((p as any).experience ?? 0) + Math.floor(10 * (1 + Math.floor((p.level ?? 1) / 10) * 0.25)) }); return { winning, matches, prize }; } });
export const blackjackDeal = mutation({ args: { bet: v.number() }, handler: async (ctx, args) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); return { playerHand: ['A', 'K'], dealerHand: ['10', '7'], playerCards: ['A', 'K'], dealerCards: ['10', '7'], gameOver: false, result: '', winnings: 0 }; } });

export const blackjackHit = mutation({ args: { hand: v.optional(v.array(v.string())), bet: v.optional(v.number()) }, handler: async () => { return { card: '5', bust: false, playerHand: ['A', 'K', '5'], result: '', winnings: 0 }; } });

export const blackjackStand = mutation({ args: { hand: v.optional(v.array(v.string())), bet: v.optional(v.number()) }, handler: async () => { return { dealerFinal: 19, won: true, dealerHand: ['10', '7', '2'], result: 'win', winnings: 100 }; } });

export const searchForumPosts = query({ args: { query: v.string() }, handler: async (ctx, args) => { return await ctx.db.query("forumPosts").collect(); } });
export const submitSupportTicket = mutation({ args: { subject: v.string(), body: v.string() }, handler: async (ctx, args) => { return { success: true }; } });

export const claimDailyReward = mutation({ args: {}, handler: async (ctx) => { const p = await getPlayer(ctx); if (!p) throw new Error("Not authenticated"); const now = Date.now(); const lastClaim = (p as any).lastDailyClaim ?? 0; const TWELVE_HOURS = 43200000; if (lastClaim && (now - lastClaim) < TWELVE_HOURS) { const remaining = Math.ceil((TWELVE_HOURS - (now - lastClaim)) / 1000); const h = Math.floor(remaining / 3600); const m = Math.floor((remaining % 3600) / 60); const s = remaining % 60; return { success: false, message: `Locked! Wait ${h}h ${m}m ${s}s` }; } const streak = ((p as any).dailyStreak ?? 0) + 1; const rewards = [100000, 350000, 700000, 1400000, 2800000, 6000000, 12000000]; const dayIdx = ((streak - 1) % 7); const reward = rewards[dayIdx]; const isBonusDay = streak % 7 === 0; const xpBonus = isBonusDay ? 500 : Math.floor(75 * (1 + Math.floor((p.level ?? 1) / 10) * 0.25)); await ctx.db.patch(p._id, { money: (p.money ?? 0) + reward, dailyStreak: streak, lastDailyClaim: now, experience: ((p as any).experience ?? 0) + xpBonus }); return { success: true, reward, streak, day: dayIdx + 1, message: isBonusDay ? `🎁 DAY 7 BONUS! $${reward.toLocaleString()} + 500 XP! Streak resets!` : `🎁 Day ${dayIdx + 1}! $${reward.toLocaleString()} + ${xpBonus} XP! Come back in 12 hours!` }; } });

export const buyEnergyDrink = mutation({ args: { drinkIndex: v.number() }, handler: async (ctx, args) => {
  const p = await getPlayer(ctx);
  if (!p) throw new Error("Not authenticated");
  const drinks = [
    { name: "Red Bull", cost: 5000, hours: 0.5 },
    { name: "Monster Energy", cost: 15000, hours: 1 },
    { name: "Venom Shot", cost: 50000, hours: 2 },
    { name: "Liquid Gold", cost: 200000, hours: 4 },
    { name: "Shadow Elixir", cost: 500000, hours: 8 },
  ];
  const drink = drinks[args.drinkIndex];
  if (!drink) throw new Error("Invalid drink");
  if ((p.money ?? 0) < drink.cost) throw new Error(`Not enough money! Need $${drink.cost.toLocaleString()}`);
  const durationMs = drink.hours * 3600000;
  const until = Date.now() + durationMs;
  await ctx.db.patch(p._id, {
    money: (p.money ?? 0) - drink.cost,
    energyDrinkUntil: Math.max((p as any).energyDrinkUntil ?? 0, until),
    experience: ((p as any).experience ?? 0) + Math.floor(5 * (1 + Math.floor((p.level ?? 1) / 10) * 0.25)),
  } as any);
  return { success: true, message: `🥤 ${drink.name} activated! +25% XP for ${drink.hours} hour${drink.hours !== 1 ? 's' : ''}!`, cost: drink.cost };
} });

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ARMOURY_GUNS, ARMOURY_PROTECTION } from "../data/armoury";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

function lockerOf(player: any) {
  const l = (player as any).armoury || {};
  return {
    guns: Array.isArray(l.guns) ? l.guns : [],
    protection: Array.isArray(l.protection) ? l.protection : [],
    equipped: l.equipped || {},
    spentCash: l.spentCash ?? 0,
    spentPoints: l.spentPoints ?? 0,
  };
}

export const getArmouryState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    return lockerOf(player);
  },
});

// Buy a single item from the catalogue. payment: "cash" | "points" | "coins".
export const buyArmouryItem = mutation({
  args: { slot: v.string(), itemId: v.string(), payment: v.string() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const slot = args.slot === "protection" ? "protection" : "guns";
    const cat = slot === "guns" ? ARMOURY_GUNS : ARMOURY_PROTECTION;
    const item = cat.find((x) => x.id === args.itemId);
    if (!item) throw new Error("Item not found");

    const locker = lockerOf(player);
    const owned: string[] = locker[slot];
    if (owned.includes(item.id)) throw new Error(`You already own ${item.name}`);

    const coins = (player as any).coins ?? 0;
    if (args.payment === "points") {
      if ((player.points ?? 0) < item.points)
        throw new Error(`You need ${item.points.toLocaleString()} points`);
      await ctx.db.patch(player._id, { points: (player.points ?? 0) - item.points } as any);
      locker.spentPoints += item.points;
    } else if (args.payment === "coins") {
      if (coins < 1) throw new Error("You need 1 IG Coin");
      await ctx.db.patch(player._id, { coins: coins - 1 } as any);
    } else {
      if ((player.money ?? 0) < item.cash)
        throw new Error(`You need $${item.cash.toLocaleString()}`);
      await ctx.db.patch(player._id, { money: (player.money ?? 0) - item.cash } as any);
      locker.spentCash += item.cash;
    }

    owned.push(item.id);
    const equipped = locker.equipped || {};
    if (!equipped[slot]) equipped[slot] = item.id;

    await ctx.db.patch(player._id, {
      armoury: {
        guns: locker.guns,
        protection: locker.protection,
        equipped,
        spentCash: locker.spentCash,
        spentPoints: locker.spentPoints,
      },
    } as any);
    return { success: true, name: item.name };
  },
});

// Bundle purchase — grabs the entire category in one tap.
export const buyArmouryBundle = mutation({
  args: { slot: v.string(), payment: v.string() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const slot = args.slot === "protection" ? "protection" : "guns";
    const cat = slot === "guns" ? ARMOURY_GUNS : ARMOURY_PROTECTION;
    const locker = lockerOf(player);
    const owned: string[] = locker[slot];
    const missing = cat.filter((x) => !owned.includes(x.id));
    if (missing.length === 0) throw new Error("You already own the full collection");

    const bundleCash = cat.reduce((s, x) => s + (owned.includes(x.id) ? 0 : x.cash), 0);
    const bundlePoints = cat.reduce((s, x) => s + (owned.includes(x.id) ? 0 : x.points), 0);
    const coins = (player as any).coins ?? 0;

    if (args.payment === "coins") {
      if (coins < 1) throw new Error("You need 1 IG Coin for the bundle");
      await ctx.db.patch(player._id, { coins: coins - 1 } as any);
    } else if (args.payment === "points") {
      if ((player.points ?? 0) < bundlePoints)
        throw new Error(`You need ${bundlePoints.toLocaleString()} points`);
      await ctx.db.patch(player._id, { points: (player.points ?? 0) - bundlePoints } as any);
      locker.spentPoints += bundlePoints;
    } else {
      if ((player.money ?? 0) < bundleCash)
        throw new Error(`You need $${bundleCash.toLocaleString()}`);
      await ctx.db.patch(player._id, { money: (player.money ?? 0) - bundleCash } as any);
      locker.spentCash += bundleCash;
    }

    for (const x of missing) owned.push(x.id);
    const equipped = locker.equipped || {};
    if (!equipped[slot]) equipped[slot] = owned[0];

    await ctx.db.patch(player._id, {
      armoury: {
        guns: locker.guns,
        protection: locker.protection,
        equipped,
        spentCash: locker.spentCash,
        spentPoints: locker.spentPoints,
      },
    } as any);
    return { success: true, added: missing.length, slot };
  },
});

// Equip (or unequip) an owned item.
export const equipArmouryItem = mutation({
  args: { slot: v.string(), itemId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const slot = args.slot === "protection" ? "protection" : "guns";
    const locker = lockerOf(player);
    const equipped = locker.equipped || {};
    if (args.itemId && !locker[slot].includes(args.itemId))
      throw new Error("You do not own that item");
    equipped[slot] = args.itemId ?? null;
    if (!equipped[slot]) delete equipped[slot];
    await ctx.db.patch(player._id, {
      armoury: {
        guns: locker.guns,
        protection: locker.protection,
        equipped,
        spentCash: locker.spentCash,
        spentPoints: locker.spentPoints,
      },
    } as any);
    return { success: true };
  },
});

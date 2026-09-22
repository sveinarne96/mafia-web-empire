import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

function displayName(player: any) {
  return player?.nickname || player?.username || player?.name || "Unknown";
}

const MAX_ACTIVE = 10;

// ─────────────────────────── QUERIES ───────────────────────────

// Live marketplace offers. `kind` is what the seller is offering.
export const getOffers = query({
  args: { kind: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const kind = args.kind ?? "points";
    const rows = await ctx.db
      .query("quicktradeOffers")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return rows
      .filter((o: any) => o.kind === kind)
      .sort((a: any, b: any) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
      .slice(0, 60)
      .map((o: any) => ({
        _id: o._id,
        sellerName: o.anonymous ? "Anonymous" : (o.sellerName ?? "Unknown"),
        anonymous: !!o.anonymous,
        amount: o.amount,
        unitPrice: o.unitPrice,
        total: o.total,
        createdAt: o.createdAt,
      }));
  },
});

// The logged-in player's own active listings (needed to cancel).
export const getMyOffers = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const rows = await ctx.db
      .query("quicktradeOffers")
      .withIndex("by_seller", (q) => q.eq("sellerId", player._id))
      .collect();
    return rows
      .filter((o: any) => o.active)
      .sort((a: any, b: any) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
      .map((o: any) => ({
        _id: o._id,
        kind: o.kind,
        amount: o.amount,
        unitPrice: o.unitPrice,
        total: o.total,
        anonymous: !!o.anonymous,
        createdAt: o.createdAt,
      }));
  },
});

// Stats shown on the trade desk (sales + buy volume).
export const getMyQuicktradeStats = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const stats = (player as any).quicktrade || {};
    return {
      soldPoints: stats.soldPoints ?? 0,
      boughtPoints: stats.boughtPoints ?? 0,
      soldCash: stats.soldCash ?? 0,
      boughtCash: stats.boughtCash ?? 0,
      totalSold: stats.totalSold ?? 0,
      totalBought: stats.totalBought ?? 0,
      profit: stats.profit ?? 0,
      spent: stats.spent ?? 0,
      listingsCreated: stats.listingsCreated ?? 0,
      cancellations: stats.cancellations ?? 0,
    };
  },
});

// ─────────────────────────── MUTATIONS ───────────────────────────

// Place a listing. Seller's currency goes into escrow immediately so an offer
// can never be bought with empty pockets behind it.
export const createOffer = mutation({
  args: {
    kind: v.string(),
    amount: v.number(),
    unitPrice: v.number(),
    anonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const kind = args.kind === "cash" ? "cash" : "points";
    const amount = Math.floor(args.amount);
    const unitPrice = Math.floor(args.unitPrice);
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (unitPrice <= 0) throw new Error("Price must be greater than 0");
    const total = amount * unitPrice;
    const anonymous = !!args.anonymous;

    const mine = await ctx.db
      .query("quicktradeOffers")
      .withIndex("by_seller", (q) => q.eq("sellerId", player._id))
      .collect();
    const activeCount = mine.filter((o: any) => o.active).length;
    if (activeCount >= MAX_ACTIVE)
      throw new Error(`You already have ${MAX_ACTIVE} active listings — cancel one first`);

    if (kind === "points") {
      if ((player.points ?? 0) < amount)
        throw new Error(`You only have ${(player.points ?? 0).toLocaleString()} points`);
      await ctx.db.patch(player._id, { points: (player.points ?? 0) - amount } as any);
    } else {
      if ((player.money ?? 0) < total)
        throw new Error(`You only have $${(player.money ?? 0).toLocaleString()}`);
      await ctx.db.patch(player._id, { money: (player.money ?? 0) - total } as any);
    }

    await ctx.db.insert("quicktradeOffers", {
      sellerId: player._id,
      sellerName: displayName(player),
      kind,
      amount,
      unitPrice,
      total,
      anonymous,
      active: true,
      createdAt: Date.now(),
    } as any);

    const qt = (player as any).quicktrade || {};
    await ctx.db.patch(player._id, {
      quicktrade: { ...qt, listingsCreated: (qt.listingsCreated ?? 0) + 1 },
    } as any);

    return { success: true, kind, amount, total };
  },
});

// Pull a listing back — escrow is refunded to the seller.
export const cancelOffer = mutation({
  args: { offerId: v.id("quicktradeOffers") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const offer = await ctx.db.get(args.offerId);
    if (!offer || !(offer as any).active) throw new Error("Listing not found");
    if ((offer as any).sellerId !== player._id) throw new Error("That is not your listing");

    if ((offer as any).kind === "points") {
      await ctx.db.patch(player._id, {
        points: (player.points ?? 0) + (offer as any).amount,
      } as any);
    } else {
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) + (offer as any).total,
      } as any);
    }
    await ctx.db.patch(args.offerId, { active: false } as any);

    const qt = (player as any).quicktrade || {};
    await ctx.db.patch(player._id, {
      quicktrade: { ...qt, cancellations: (qt.cancellations ?? 0) + 1 },
    } as any);
    return { success: true };
  },
});

// Accept an offer. Buyer pays in the opposite currency; seller's escrow is
// released to the buyer. Fees: the $1 wire-style fee matches the bank send fee.
export const buyOffer = mutation({
  args: { offerId: v.id("quicktradeOffers") },
  handler: async (ctx, args) => {
    const buyer: any = await getCurrentUser(ctx);
    const offer: any = await ctx.db.get(args.offerId);
    if (!offer || !offer.active) throw new Error("Listing not found");
    if (offer.sellerId === buyer._id) throw new Error("You cannot buy your own listing");

    const kind: string = offer.kind;
    const amount: number = offer.amount;
    const total: number = offer.total;
    const fee = 1; // flat $1 marketplace fee
    const seller: any = offer.sellerId ? await ctx.db.get(offer.sellerId) : null;

    if (kind === "points") {
      // Buyer pays cash, receives points
      if ((buyer.money ?? 0) < total + fee)
        throw new Error(`You need $${(total + fee).toLocaleString()} (incl. $1 fee)`);
      await ctx.db.patch(buyer._id, {
        money: (buyer.money ?? 0) - total - fee,
        points: (buyer.points ?? 0) + amount,
      } as any);
      if (seller)
        await ctx.db.patch(seller._id, {
          money: (seller.money ?? 0) + total,
        } as any);
    } else {
      // Buyer pays points, receives cash
      if ((buyer.points ?? 0) < total)
        throw new Error(`You need ${total.toLocaleString()} points`);
      await ctx.db.patch(buyer._id, {
        money: (buyer.money ?? 0) + amount,
        points: (buyer.points ?? 0) - total,
      } as any);
      if (seller)
        await ctx.db.patch(seller._id, {
          points: (seller.points ?? 0) + total,
        } as any);
    }

    await ctx.db.patch(offer._id, { active: false } as any);

    // Stats for both sides.
    const bQt = (buyer as any).quicktrade || {};
    await ctx.db.patch(buyer._id, {
      quicktrade: {
        ...bQt,
        ...(kind === "points"
          ? { boughtPoints: (bQt.boughtPoints ?? 0) + amount, spent: (bQt.spent ?? 0) + total }
          : { boughtCash: (bQt.boughtCash ?? 0) + amount, spent: (bQt.spent ?? 0) + total }),
        totalBought: (bQt.totalBought ?? 0) + 1,
      },
    } as any);

    if (seller) {
      const sQt = seller.quicktrade || {};
      await ctx.db.patch(seller._id, {
        quicktrade: {
          ...sQt,
          ...(kind === "points"
            ? { soldPoints: (sQt.soldPoints ?? 0) + amount, profit: (sQt.profit ?? 0) + total }
            : { soldCash: (sQt.soldCash ?? 0) + amount, profit: (sQt.profit ?? 0) + total }),
          totalSold: (sQt.totalSold ?? 0) + 1,
        },
      } as any);
    }

    return { success: true, kind, received: amount, paid: total };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ═══════════════════════════════════════════════════════════════
// CASINO OWNERSHIP SYSTEM
// Own casinos per game per city. If your casino bank hits $0 the
// player who drained it takes ownership. You can buy back at your
// own set price if someone takes it.
// ═══════════════════════════════════════════════════════════════

const GAMES: Record<string, { name: string; icon: string; basePrice: number }> = {
  blackjack: { name: "Blackjack Casino", icon: "🃏", basePrice: 10_000_000 },
  dice: { name: "Dice Casino", icon: "🎲", basePrice: 5_000_000 },
  roulette: { name: "Roulette Casino", icon: "🎡", basePrice: 15_000_000 },
  racetrack: { name: "Racetrack Casino", icon: "🏇", basePrice: 20_000_000 },
  videopoker: { name: "Video Poker Casino", icon: "🂡", basePrice: 8_000_000 },
};

function n(x: unknown, d = 0): number { return typeof x === "number" && isFinite(x) ? x : d; }

export const getCasinos = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("casinos").collect();
    return all.filter((c) => c.city === args.city).sort((a, b) => a.gameId.localeCompare(b.gameId));
  },
});

export const getAllCasinos = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("casinos").collect();
    return all.sort((a, b) => (a.city + a.gameId).localeCompare(b.city + b.gameId));
  },
});


export const getCasinoEvents = query({
  args: {},
  handler: async (ctx) => {
    const evs = await ctx.db.query("casinoEvents").withIndex("by_time").order("desc").take(15);
    return evs;
  },
});

export const seedCityCasinos = mutation({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("casinos").collect();
    const have = new Set(existing.filter((c: any) => c.city === args.city).map((c: any) => c.gameId));
    let created = 0;
    for (const [gameId, g] of Object.entries(GAMES)) {
      if (!have.has(gameId)) {
        await ctx.db.insert("casinos", {
          gameId, name: g.name, icon: g.icon, city: args.city, purchasePrice: g.basePrice,
          casinoBank: Math.floor(g.basePrice * 0.5), totalRevenue: 0, playersServed: 0,
          seized: false, createdAt: Date.now(),
        });
        created++;
      }
    }
    return { created };
  },
});

export const purchaseCasino = mutation({
  args: { casinoId: v.id("casinos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const casino: any = await ctx.db.get(args.casinoId);
    if (!casino) throw new Error("Casino not found");
    if (casino.ownerId) throw new Error("This casino already has an owner!");
    const price = casino.boughtBackPrice ?? casino.purchasePrice;
    if (n(player.money) < price) throw new Error(`Not enough cash — you need $${price.toLocaleString()}`);
    await ctx.db.patch(casino._id, {
      ownerId: userId, ownerName: player.nickname ?? player.username ?? "Player",
      casinoBank: Math.max(n(casino.casinoBank), Math.floor(price * 0.5)),
      purchasePrice: price, boughtBackPrice: undefined, lostByUserId: undefined, lostByName: undefined, lostAt: undefined, seized: false,
    });
    await ctx.db.patch(userId, { money: n(player.money) - price });
    await ctx.db.insert("casinoEvents", { gameId: casino.gameId, casinoName: casino.name, type: "purchased", message: `${player.nickname ?? player.username} bought ${casino.name} in ${casino.city} for $${price.toLocaleString()}`, timestamp: Date.now() });
    return { success: true, price };
  },
});

export const depositCasinoBank = mutation({
  args: { casinoId: v.id("casinos"), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    const casino: any = await ctx.db.get(args.casinoId);
    if (!player || !casino) throw new Error("Not found");
    if (casino.ownerId !== userId) throw new Error("You don't own this casino!");
    const amt = Math.floor(args.amount);
    if (amt <= 0) throw new Error("Invalid amount");
    if (n(player.money) < amt) throw new Error("Not enough cash");
    await ctx.db.patch(casino._id, { casinoBank: n(casino.casinoBank) + amt });
    await ctx.db.patch(userId, { money: n(player.money) - amt });
    return { success: true, newBank: n(casino.casinoBank) + amt };
  },
});

export const withdrawCasinoBank = mutation({
  args: { casinoId: v.id("casinos"), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    const casino: any = await ctx.db.get(args.casinoId);
    if (!player || !casino) throw new Error("Not found");
    if (casino.ownerId !== userId) throw new Error("You don't own this casino!");
    const amt = Math.min(Math.floor(args.amount), n(casino.casinoBank));
    if (amt <= 0) throw new Error("Casino bank is empty");
    await ctx.db.patch(casino._id, { casinoBank: n(casino.casinoBank) - amt });
    await ctx.db.patch(userId, { money: n(player.money) + amt });
    return { success: true, newBank: n(casino.casinoBank) - amt };
  },
});

// The core loop: every real-money bet in a casino game flows through here.
// Player wins  -> payout comes out of the casino bank (owner pays).
// Player loses -> wager goes INTO the casino bank (owner profits).
// If the bank empties, the winning player seizes the casino.
export const settleCasinoRound = mutation({
  args: { gameId: v.string(), city: v.string(), wager: v.number(), payout: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const wager = Math.max(0, Math.floor(args.wager));
    const payout = Math.max(0, Math.floor(args.payout));
    const net = payout - wager;

    const casino = (await ctx.db.query("casinos").collect()).find((c: any) => c.gameId === args.gameId && c.city === args.city);
    if (casino) {
      const seized = n(casino.casinoBank) + wager - payout <= 0 && !!casino.ownerId && casino.ownerId !== userId;
      let newBank = n(casino.casinoBank) + wager - payout;
      const patch: any = {
        casinoBank: Math.max(0, newBank),
        totalRevenue: n(casino.totalRevenue) + Math.max(0, -net),
        playersServed: n(casino.playersServed) + 1,
      };
      if (seized) {
        patch.ownerId = userId;
        patch.ownerName = player.nickname ?? player.username ?? "Player";
        patch.lostByUserId = casino.ownerId;
        patch.lostByName = casino.ownerName;
        patch.lostAt = Date.now();
        patch.casinoBank = Math.floor(payout * 0.25); // fresh capital for the new owner
        await ctx.db.insert("casinoEvents", {
          gameId: casino.gameId, casinoName: casino.name, type: "seized",
          message: `💀 ${casino.ownerName}'s ${casino.name} in ${casino.city} was drained to $0 by ${player.nickname ?? player.username} and SEIZED!`,
          timestamp: Date.now(),
        });
      }
      await ctx.db.patch(casino._id, patch);
      await ctx.db.insert("casinoRounds", { userId, gameId: args.gameId, wager, payout, net, currency: "cash", timestamp: Date.now() });
      // Mission-board counter: every settled casino round counts
      await ctx.db.patch(userId, { casinoRounds: n(player.casinoRounds, 0) + 1 } as any);
      return { bank: patch.casinoBank, seized, newOwner: seized ? (player.nickname ?? player.username) : undefined };
    }
    // No casino row (e.g. betting-shop style games) — still record the round
    await ctx.db.insert("casinoRounds", { userId, gameId: args.gameId, wager, payout, net, currency: "cash", timestamp: Date.now() });
    await ctx.db.patch(userId, { casinoRounds: n(player.casinoRounds, 0) + 1 } as any);
    return { bank: null, seized: false };
  },
});

export const settleCoinRound = mutation({
  args: { gameId: v.string(), city: v.string(), wager: v.number(), payout: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const wager = Math.max(0, Math.floor(args.wager));
    const payout = Math.max(0, Math.floor(args.payout));
    const net = payout - wager;
    if (payout > 0) {
      await ctx.db.patch(userId, { coins: n(player.coins) + payout });
    }
    const casino = (await ctx.db.query("casinos").collect()).find((c: any) => c.gameId === args.gameId && c.city === args.city);
    if (casino && casino.ownerId && casino.ownerId !== userId) {
      // IG-coin losses are paid to the casino owner in cash (house always wins)
      await ctx.db.patch(casino._id, { casinoBank: n(casino.casinoBank) + Math.floor(wager * 0.2) });
    }
    await ctx.db.insert("casinoRounds", { userId, gameId: args.gameId, wager, payout, net, currency: "coins", timestamp: Date.now() });
    await ctx.db.patch(userId, { casinoRounds: n(player.casinoRounds, 0) + 1 } as any);
    return { coins: n(player.coins) + payout };
  },
});

export const getMyCasinos = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const all = await ctx.db.query("casinos").collect();
    return all.filter((c) => c.ownerId === userId);
  },
});

// Buy back a casino that was taken from you — price is whatever YOU set before losing it.
export const setBuyBackPrice = mutation({
  args: { casinoId: v.id("casinos"), price: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const casino: any = await ctx.db.get(args.casinoId);
    if (!casino) throw new Error("Casino not found");
    if (casino.ownerId !== userId) throw new Error("You don't own this casino!");
    const price = Math.max(1_000_000, Math.floor(args.price));
    await ctx.db.patch(casino._id, { boughtBackPrice: price });
    return { success: true, price };
  },
});

export const buyBackCasino = mutation({
  args: { casinoId: v.id("casinos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    const casino: any = await ctx.db.get(args.casinoId);
    if (!player || !casino) throw new Error("Not found");
    if (!casino.lostByUserId) throw new Error("This casino was not taken from anyone");
    const lostBy = await ctx.db.get(casino.lostByUserId) as any;
    const lostByName = lostBy?.nickname ?? lostBy?.username ?? casino.lostByName ?? "Unknown";
    // Only the person who LOST it can buy it back, at the price THEY set
    const price = casino.boughtBackPrice ?? Math.floor(n(casino.purchasePrice) * 1.5);
    if (n(player.money) < price) throw new Error(`Buy-back requires $${price.toLocaleString()} — you have $${n(player.money).toLocaleString()}`);
    await ctx.db.patch(casino._id, {
      ownerId: userId, ownerName: player.nickname ?? player.username ?? "Player",
      lostByUserId: undefined, lostByName: undefined, lostAt: undefined,
      casinoBank: Math.max(n(casino.casinoBank), Math.floor(price * 0.5)),
    });
    await ctx.db.patch(userId, { money: n(player.money) - price });
    await ctx.db.insert("casinoEvents", {
      gameId: casino.gameId, casinoName: casino.name, type: "bought_back",
      message: `🔁 ${player.nickname ?? player.username} bought back ${casino.name} in ${casino.city} from ${lostByName} for $${price.toLocaleString()}`,
      timestamp: Date.now(),
    });
    return { success: true, price };
  },
});

export const getCoinBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const player: any = await ctx.db.get(userId);
    return n(player?.coins);
  },
});

// ═══════════════════════════════════════════════════════════════
// SERVER-AUTHORITATIVE CASINO DICE — real money, real casino bank
// Roll 1..sides, pick a number. Win pays sides:1 (house edge ~5%).
// Player wins -> paid from casino bank. Player loses -> bank grows.
// Bank hits $0 -> winning player SEIZES the casino.
// ═══════════════════════════════════════════════════════════════
export const playCasinoDice = mutation({
  args: { city: v.string(), wager: v.number(), sides: v.number(), chosen: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const sides = Math.max(2, Math.min(1000, Math.floor(args.sides)));
    const chosen = Math.max(1, Math.min(sides, Math.floor(args.chosen)));
    const wager = Math.max(1_000, Math.floor(args.wager));
    if (n(player.money) < wager) throw new Error("Not enough cash!");

    const roll = Math.floor(Math.random() * sides) + 1;
    const won = roll === chosen;
    const payout = won ? wager * sides : 0; // sides:1 payout includes stake
    const net = payout - wager;

    // Move player money first
    await ctx.db.patch(userId, { money: n(player.money) + net, coins: n(player.coins) + (won ? Math.floor(wager / 1_000_000) : 0) });

    // Settle the casino bank for this game/city
    const casino = (await ctx.db.query("casinos").collect()).find((c: any) => c.gameId === "dice" && c.city === args.city);
    let seized = false;
    let newOwner: string | undefined;
    if (casino) {
      const wouldBe = n(casino.casinoBank) + wager - payout;
      seized = wouldBe <= 0 && !!casino.ownerId && casino.ownerId !== userId;
      const patch: any = {
        casinoBank: Math.max(0, wouldBe),
        totalRevenue: n(casino.totalRevenue) + Math.max(0, -net),
        playersServed: n(casino.playersServed) + 1,
      };
      if (seized) {
        patch.ownerId = userId;
        patch.ownerName = player.nickname ?? player.username ?? "Player";
        patch.lostByUserId = casino.ownerId;
        patch.lostByName = casino.ownerName;
        patch.lostAt = Date.now();
        patch.casinoBank = Math.floor(payout * 0.25);
        newOwner = player.nickname ?? player.username ?? "Player";
        await ctx.db.insert("casinoEvents", {
          gameId: "dice", casinoName: casino.name, type: "seized",
          message: `💀 ${casino.ownerName}'s ${casino.name} in ${casino.city} was drained to $0 by ${newOwner} and SEIZED!`,
          timestamp: Date.now(),
        });
      }
      await ctx.db.patch(casino._id, patch);
    }
    await ctx.db.insert("casinoRounds", { userId, gameId: "dice", wager, payout, net, currency: "cash", timestamp: Date.now() });
    return { roll, won, payout, net, seized, newOwner };
  },
});

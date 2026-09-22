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
      // Game Records counters: bets, wins/losses, betting profit, casino wins.
      await ctx.db.patch(userId, {
        casinoRounds: n(player.casinoRounds, 0) + 1,
        totalBets: n((player as any).totalBets, 0) + 1,
        betsWon: n((player as any).betsWon, 0) + (payout > wager ? 1 : 0),
        betsLost: n((player as any).betsLost, 0) + (payout <= wager ? 1 : 0),
        totalBettingProfit: n((player as any).totalBettingProfit, 0) + net,
        ...(payout > wager ? { totalCasinoWins: n((player as any).totalCasinoWins, 0) + 1 } : {}),
      } as any);
      return { bank: patch.casinoBank, seized, newOwner: seized ? (player.nickname ?? player.username) : undefined };
    }
    // No casino row (e.g. betting-shop style games) — still record the round
    await ctx.db.insert("casinoRounds", { userId, gameId: args.gameId, wager, payout, net, currency: "cash", timestamp: Date.now() });
    await ctx.db.patch(userId, {
      casinoRounds: n(player.casinoRounds, 0) + 1,
      totalBets: n((player as any).totalBets, 0) + 1,
      betsWon: n((player as any).betsWon, 0) + (payout > wager ? 1 : 0),
      betsLost: n((player as any).betsLost, 0) + (payout <= wager ? 1 : 0),
      totalBettingProfit: n((player as any).totalBettingProfit, 0) + net,
      ...(payout > wager ? { totalCasinoWins: n((player as any).totalCasinoWins, 0) + 1 } : {}),
    } as any);
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
    await ctx.db.patch(userId, {
      coins: n(player.coins) + payout,
      casinoRounds: n(player.casinoRounds, 0) + 1,
      totalBets: n((player as any).totalBets, 0) + 1,
      betsWon: n((player as any).betsWon, 0) + (payout > wager ? 1 : 0),
      betsLost: n((player as any).betsLost, 0) + (payout <= wager ? 1 : 0),
      totalBettingProfit: n((player as any).totalBettingProfit, 0) + net,
      ...(payout > wager ? { totalCasinoWins: n((player as any).totalCasinoWins, 0) + 1 } : {}),
    } as any);
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
// ───────────────────────── SERVER-AUTHORITATIVE TABLE GAMES ─────────────────────────
// Roulette / Racetrack / Video Poker previously resolved on the CLIENT only:
// no money ever moved. These mutations draw the outcome server-side, move real
// cash, settle the city casino bank, and record betting stats. Client only
// animates what the server returns.

const ROULETTE_RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
function rouletteColor(num: number): string { return num === 0 ? "green" : ROULETTE_RED.has(num) ? "red" : "black"; }

export const playRoulette = mutation({
  args: { city: v.string(), bet: v.number(), betType: v.union(v.string(), v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const bet = Math.floor(args.bet);
    if (!Number.isFinite(bet) || bet < 10000) throw new Error("Minimum bet is $10,000");
    if (n(player.money) < bet) throw new Error("Not enough cash!");
    if (typeof args.betType !== "string" && typeof args.betType !== "number") throw new Error("Invalid bet type");
    if (typeof args.betType === "string" && !["red", "black", "green"].includes(args.betType)) throw new Error("Invalid bet type");

    const num = Math.floor(Math.random() * 37);
    const color = rouletteColor(num);
    const bt: any = args.betType;
    const won = typeof bt === "number" ? bt === num : bt === color;
    const payout = won ? (typeof bt === "number" ? bet * 35 : bet * (bt === "green" ? 14 : 2)) : 0;
    const net = payout - bet;

    await ctx.db.patch(userId, { money: n(player.money) + net } as any);
    await ctx.db.insert("casinoRounds", { userId, gameId: "roulette", wager: bet, payout, net, currency: "cash", timestamp: Date.now() });
    await ctx.db.patch(userId, {
      casinoRounds: n(player.casinoRounds, 0) + 1,
      totalBets: n(player.totalBets, 0) + 1,
      betsWon: n(player.betsWon, 0) + (won ? 1 : 0),
      betsLost: n(player.betsLost, 0) + (won ? 0 : 1),
      totalBettingProfit: n(player.totalBettingProfit, 0) + net,
      ...(won ? { totalCasinoWins: n(player.totalCasinoWins, 0) + 1 } : {}),
    } as any);

    const casino = (await ctx.db.query("casinos").collect()).find((c: any) => c.gameId === "roulette" && c.city === args.city);
    if (casino) {
      const wouldBe = n(casino.casinoBank) + bet - payout;
      const seized = wouldBe <= 0 && !!casino.ownerId && casino.ownerId !== userId;
      const patch: any = { casinoBank: Math.max(0, wouldBe), totalRevenue: n(casino.totalRevenue) + Math.max(0, -net), playersServed: n(casino.playersServed) + 1 };
      if (seized) {
        patch.ownerId = userId; patch.ownerName = player.nickname ?? "Player";
        patch.lostByUserId = casino.ownerId; patch.lostByName = casino.ownerName; patch.lostAt = Date.now();
        patch.casinoBank = Math.floor(payout * 0.25);
        await ctx.db.insert("casinoEvents", { gameId: casino.gameId, casinoName: casino.name, type: "seized", message: `💀 ${casino.ownerName}'s ${casino.name} in ${casino.city} was drained to $0 by ${player.nickname ?? "Player"} and SEIZED!`, timestamp: Date.now() });
      }
      await ctx.db.patch(casino._id, patch);
    }
    return { number: num, color, won, net };
  },
});

const HORSES = [
  { name: "Red Baron", odds: "EVENS", chance: 35 },
  { name: "Blue Thunder", odds: "2/1", chance: 25 },
  { name: "Green Storm", odds: "4/1", chance: 15 },
  { name: "Gold Rush", odds: "6/1", chance: 10 },
  { name: "White Lightning", odds: "12/1", chance: 6 },
  { name: "Pink Phantom", odds: "20/1", chance: 5 },
  { name: "Black Shadow", odds: "40/1", chance: 4 },
];
const HORSE_MULT = [2, 3, 5, 7, 13, 21, 41];

export const playHorseRace = mutation({
  args: { city: v.string(), bet: v.number(), horse: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const bet = Math.floor(args.bet);
    if (!Number.isFinite(bet) || bet < 10000) throw new Error("Minimum bet is $10,000");
    if (args.horse < 0 || args.horse >= HORSES.length) throw new Error("Invalid horse");
    if (n(player.money) < bet) throw new Error("Not enough cash!");

    const rand = Math.random() * 100;
    let cumulative = 0, winnerIdx = 0;
    for (let i = 0; i < HORSES.length; i++) { cumulative += HORSES[i].chance; if (rand < cumulative) { winnerIdx = i; break; } }
    const won = args.horse === winnerIdx;
    const payout = won ? bet * HORSE_MULT[args.horse] : 0;
    const net = payout - bet;

    await ctx.db.patch(userId, { money: n(player.money) + net } as any);
    await ctx.db.insert("casinoRounds", { userId, gameId: "racetrack", wager: bet, payout, net, currency: "cash", timestamp: Date.now() });
    await ctx.db.patch(userId, {
      casinoRounds: n(player.casinoRounds, 0) + 1,
      totalBets: n(player.totalBets, 0) + 1,
      betsWon: n(player.betsWon, 0) + (won ? 1 : 0),
      betsLost: n(player.betsLost, 0) + (won ? 0 : 1),
      totalBettingProfit: n(player.totalBettingProfit, 0) + net,
      ...(won ? { totalCasinoWins: n(player.totalCasinoWins, 0) + 1 } : {}),
    } as any);

    const casino = (await ctx.db.query("casinos").collect()).find((c: any) => c.gameId === "racetrack" && c.city === args.city);
    if (casino) {
      const wouldBe = n(casino.casinoBank) + bet - payout;
      const seized = wouldBe <= 0 && !!casino.ownerId && casino.ownerId !== userId;
      const patch: any = { casinoBank: Math.max(0, wouldBe), totalRevenue: n(casino.totalRevenue) + Math.max(0, -net), playersServed: n(casino.playersServed) + 1 };
      if (seized) {
        patch.ownerId = userId; patch.ownerName = player.nickname ?? "Player";
        patch.lostByUserId = casino.ownerId; patch.lostByName = casino.ownerName; patch.lostAt = Date.now();
        patch.casinoBank = Math.floor(payout * 0.25);
        await ctx.db.insert("casinoEvents", { gameId: casino.gameId, casinoName: casino.name, type: "seized", message: `💀 ${casino.ownerName}'s ${casino.name} in ${casino.city} was drained to $0 by ${player.nickname ?? "Player"} and SEIZED!`, timestamp: Date.now() });
      }
      await ctx.db.patch(casino._id, patch);
    }
    return { winnerIdx, won, net, payout };
  },
});

// Video poker: server deals, evaluates, and settles. Client sends holds on draw.
const VP_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const VP_SUITS = ["h", "d", "c", "s"];
type VpCard = { rank: string; suit: string; value: number };
function vpDeck(): VpCard[] {
  const d: VpCard[] = [];
  for (const s of VP_SUITS) for (const r of VP_RANKS) d.push({ rank: r, suit: s, value: r === "A" ? 1 : VP_RANKS.indexOf(r) + 1 });
  return d;
}
const VP_PAYTABLE: { name: string; mult: number }[] = [
  { name: "Royal Flush", mult: 100 }, { name: "Straight Flush", mult: 22 }, { name: "Four of a Kind", mult: 15 },
  { name: "Full House", mult: 7 }, { name: "Flush", mult: 4.5 }, { name: "Straight", mult: 3.5 },
  { name: "Three of a Kind", mult: 2.5 }, { name: "Two Pair", mult: 1.75 }, { name: "Jacks or Better", mult: 1.25 },
  { name: "Nothing", mult: 0 },
];
function vpEvaluate(hand: VpCard[]): string {
  const ranks = hand.map((c) => c.rank);
  const counts: Record<string, number> = {};
  for (const r of ranks) counts[r] = (counts[r] ?? 0) + 1;
  const vals = Object.values(counts).sort((a, b) => b - a);
  const suits = new Set(hand.map((c) => c.suit));
  const isFlush = suits.size === 1;
  const idxs = ranks.map((r) => VP_RANKS.indexOf(r)).sort((a, b) => a - b);
  const uniq = [...new Set(idxs)];
  const isStraight = (uniq.length === 5 && uniq[4] - uniq[0] === 4) || (uniq.join(",") === [0, 1, 2, 3, 12].join(","));
  const isRoyal = isFlush && uniq.join(",") === [0, 9, 10, 11, 12].join(",");
  if (isRoyal && isFlush) return "Royal Flush";
  if (isStraight && isFlush) return "Straight Flush";
  if (vals[0] === 4) return "Four of a Kind";
  if (vals[0] === 3 && vals[1] === 2) return "Full House";
  if (isFlush) return "Flush";
  if (isStraight) return "Straight";
  if (vals[0] === 3) return "Three of a Kind";
  if (vals[0] === 2 && vals[1] === 2) return "Two Pair";
  const pairRanks = Object.entries(counts).filter(([, c]) => c === 2).map(([r]) => VP_RANKS.indexOf(r));
  if (pairRanks.some((r) => r >= 9)) return "Jacks or Better";
  return "Nothing";
}

export const videoPokerDeal = mutation({
  args: { city: v.string(), bet: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const bet = Math.floor(args.bet);
    if (!Number.isFinite(bet) || bet < 50000) throw new Error("Minimum bet is $50,000");
    if (n(player.money) < bet) throw new Error("Not enough cash!");
    const d = vpDeck().sort(() => Math.random() - 0.5);
    const hand = d.splice(0, 5);
    await ctx.db.patch(userId, { money: n(player.money) - bet, pokerState: { bet, hand, city: args.city, active: true } } as any);
    return { hand };
  },
});

export const videoPokerDraw = mutation({
  args: { holds: v.array(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const st = (player as any).pokerState;
    if (!st || !st.active) throw new Error("No active poker hand — deal first!");
    const d = vpDeck().sort(() => Math.random() - 0.5);
    const hand = [...st.hand] as VpCard[];
    let di = 0;
    for (let i = 0; i < 5; i++) if (!args.holds[i]) hand[i] = d[di++];
    const handName = vpEvaluate(hand);
    const mult = VP_PAYTABLE.find((p) => p.name === handName)?.mult ?? 0;
    const payout = Math.floor(st.bet * mult);
    const net = payout - st.bet;
    if (payout > 0) await ctx.db.patch(userId, { money: n(player.money) + payout } as any);
    await ctx.db.insert("casinoRounds", { userId, gameId: "videopoker", wager: st.bet, payout, net, currency: "cash", timestamp: Date.now() });
    await ctx.db.patch(userId, {
      pokerState: undefined,
      casinoRounds: n(player.casinoRounds, 0) + 1,
      totalBets: n(player.totalBets, 0) + 1,
      betsWon: n(player.betsWon, 0) + (mult > 0 ? 1 : 0),
      betsLost: n(player.betsLost, 0) + (mult > 0 ? 0 : 1),
      totalBettingProfit: n(player.totalBettingProfit, 0) + net,
      ...(mult > 0 ? { totalCasinoWins: n(player.totalCasinoWins, 0) + 1 } : {}),
    } as any);
    const casino = (await ctx.db.query("casinos").collect()).find((c: any) => c.gameId === "videopoker" && c.city === st.city);
    if (casino) {
      const wouldBe = n(casino.casinoBank) + st.bet - payout;
      await ctx.db.patch(casino._id, { casinoBank: Math.max(0, wouldBe), totalRevenue: n(casino.totalRevenue) + Math.max(0, -net), playersServed: n(casino.playersServed) + 1 } as any);
    }
    return { hand: hand.map((c) => ({ rank: c.rank, suit: c.suit, value: c.value })), handName, mult, net, payout };
  },
});

// ───────────────────────── SCRATCHCARDS ─────────────────────────
// Previously pure client fiction: no cost, no payout. Now server-drawn,
// paid in cash with real stats. Cost is cash-based (10k per card, $100k card).
const SC_CARDS: Record<string, { name: string; cost: number; prizes: { symbol: string; label: string; prize: number; chance: number }[] }> = {
  cash: { name: "Cash Scratchcard", cost: 100_000, prizes: [
    { symbol: "💎", label: "Jackpot", prize: 6_000_000, chance: 0.8 },
    { symbol: "🏆", label: "Gold", prize: 1_200_000, chance: 5 },
    { symbol: "💰", label: "Cash", prize: 600_000, chance: 17.5 },
    { symbol: "🪙", label: "Coin", prize: 500_000, chance: 3.8 },
    { symbol: "📦", label: "Small", prize: 250_000, chance: 20 },
    { symbol: "💀", label: "Tiny", prize: 18_000_000, chance: 1.8 },
    { symbol: "❌", label: "Nothing", prize: 0, chance: 51.1 },
  ]},
  points: { name: "Points Scratchcard", cost: 200_000, prizes: [
    { symbol: "⭐", label: "Grand", prize: 60, chance: 0.8 },
    { symbol: "⭐", label: "Star", prize: 45, chance: 1.8 },
    { symbol: "⭐", label: "Medium", prize: 30, chance: 5 },
    { symbol: "⭐", label: "Small", prize: 20, chance: 17.5 },
    { symbol: "❌", label: "Nothing", prize: 0, chance: 74.9 },
  ]},
  lucky: { name: "Lucky Dip", cost: 1_000_000, prizes: [
    { symbol: "💎", label: "Legendary Car", prize: 0, chance: 0.2 },
    { symbol: "📦", label: "Common Pack", prize: 0, chance: 0.2 },
    { symbol: "⭐", label: "100 Points", prize: 100, chance: 0.3 },
    { symbol: "💰", label: "$30M", prize: 30_000_000, chance: 8.6 },
    { symbol: "🪙", label: "5 IG Coins", prize: 5, chance: 1.7 },
    { symbol: "❌", label: "Nothing", prize: 0, chance: 89.0 },
  ]},
};

export const scratchCardPlay = mutation({
  args: { cardType: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const def = SC_CARDS[args.cardType];
    if (!def) throw new Error("Unknown scratchcard");

    if (n(player.money) < def.cost) throw new Error(`Not enough cash — card costs $${def.cost.toLocaleString()}`);

    // Draw 9 weighted symbols server-side.
    const deck: { symbol: string; label: string; prize: number }[] = [];
    for (const p of def.prizes) {
      const count = Math.round(p.chance * 10);
      for (let i = 0; i < count; i++) deck.push({ symbol: p.symbol, label: p.label, prize: p.prize });
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const symbols = deck.slice(0, 9);

    // Evaluate: 3+ of a winning symbol (not ❌) pays.
    const counts: Record<string, number> = {};
    for (const s of symbols) counts[s.symbol] = (counts[s.symbol] ?? 0) + 1;
    let winSymbol: string | null = null;
    for (const [sym, cnt] of Object.entries(counts)) {
      if (sym !== "❌" && cnt >= 3) { winSymbol = sym; break; }
    }
    let total = 0;
    if (winSymbol) {
      total = symbols.filter((s) => s.symbol === winSymbol && s.symbol !== "❌").reduce((sum, s) => sum + s.prize, 0);
    }

    const patch: any = { money: n(player.money) - def.cost + total };
    if (winSymbol && args.cardType === "points") patch.points = n(player.points) + total;
    if (winSymbol && args.cardType === "lucky" && total > 0) { /* points via points field handled above only for points card */ }
    if (winSymbol && args.cardType === "lucky") patch.points = n(player.points) + (symbols.find((s) => s.symbol === "⭐")?.prize ?? 0);
    await ctx.db.patch(userId, patch as any);
    await ctx.db.insert("casinoRounds", { userId, gameId: `scratch_${args.cardType}`, wager: def.cost, payout: total, net: total - def.cost, currency: "cash", timestamp: Date.now() });
    await ctx.db.patch(userId, {
      totalBets: n(player.totalBets, 0) + 1,
      betsWon: n(player.betsWon, 0) + (total > 0 ? 1 : 0),
      betsLost: n(player.betsLost, 0) + (total > 0 ? 0 : 1),
      totalBettingProfit: n(player.totalBettingProfit, 0) + total - def.cost,
    } as any);
    return { symbols, won: total > 0, total };
  },
});

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
    await ctx.db.patch(userId, { money: n(player.money) + net, coins: n(player.coins) + (won ? Math.floor(wager / 1_000_000) : 0), totalBets: n((player as any).totalBets, 0) + 1, betsWon: n((player as any).betsWon, 0) + (won ? 1 : 0), betsLost: n((player as any).betsLost, 0) + (won ? 0 : 1), totalBettingProfit: n((player as any).totalBettingProfit, 0) + net, ...(won ? { totalCasinoWins: n((player as any).totalCasinoWins, 0) + 1 } : {}) } as any);

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

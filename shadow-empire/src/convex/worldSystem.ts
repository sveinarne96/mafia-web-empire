import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { STOCKS, SUPPLIES, SUPPLY_CITIES, SUPPLY_MAX_RETURN_RUNS, SUPPLY_PRICE_ROTATION_MS, ESTATE_LOCATIONS, ESTATE_PRICES, ESTATE_BASE_RENT, ESTATE_MAX_UPGRADES, ESTATE_CONSTRUCTION_DAYS, SAFE_JACKPOT_BASE, SAFE_GUESS_COST, SAFE_DIGITS, SAFE_MAX_ATTEMPTS_PER_DAY } from "../data/world";

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const DAY = 86400000;
const HOUR = 3600000;

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

function worldState(player: any) {
  return player.worldState && typeof player.worldState === "object" ? player.worldState : {};
}

const DAY_STR = () => new Date().toISOString().slice(0, 10);

// ═══════════ BANK (Interest + Swiss) ═══════════
const INTEREST_RATE = 0.0404; // 4.04% per 12h compound
const INTEREST_MS = 12 * HOUR;
const SWISS_LIMIT = 2_500_000_000;

export const getBankState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const ws = worldState(player);
    return {
      money: n(player.money, 0),
      interestBank: n(player.interestBank, 0),
      swissBank: n(player.swissBank, 0),
      swissLimit: SWISS_LIMIT,
      lastInterestApplied: n(player.lastInterestApplied, 0),
      interestRatePct: INTEREST_RATE * 100,
      bankStats: player.bankStats && typeof player.bankStats === "object" ? player.bankStats : { interestProfit: 0, swissLimit: SWISS_LIMIT, totalSent: 0, totalReceived: 0, sent: 0, received: 0 },
      transfers: Array.isArray(player.transferHistory) ? player.transferHistory.slice(0, 25) : [],
    };
  },
});

// Applies any accrued compound interest on the interest bank balance.
export const applyInterest = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const ib = n(player.interestBank, 0);
    if (ib <= 0) return { success: true, applied: 0, interest: 0 };
    const last = n(player.lastInterestApplied, Date.now());
    const now = Date.now();
    const periods = Math.floor(Math.max(0, now - last) / INTEREST_MS);
    if (periods < 1) return { success: true, applied: 0, interest: 0 };
    const capped = Math.min(periods, 30);
    let balance = ib;
    let interest = 0;
    for (let i = 0; i < capped; i++) {
      const gain = balance * INTEREST_RATE;
      balance += gain;
      interest += gain;
    }
    const stats = { ...(player.bankStats || {}), interestProfit: n(player.bankStats?.interestProfit, 0) + Math.floor(interest) };
    await ctx.db.patch(player._id, { interestBank: balance, lastInterestApplied: now, bankStats: stats });
    return { success: true, applied: capped, interest: Math.floor(interest) };
  },
});

export const depositInterest = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(1, Math.floor(args.amount));
    if (n(player.money, 0) < amount) throw new Error("Not enough cash");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - amount, interestBank: n(player.interestBank, 0) + amount } as any);
    return { success: true, amount };
  },
});

export const withdrawInterest = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(1, Math.floor(args.amount));
    if (n(player.interestBank, 0) < amount) throw new Error("Not enough in interest bank");
    await ctx.db.patch(player._id, { money: n(player.money, 0) + amount, interestBank: n(player.interestBank, 0) - amount });
    return { success: true, amount };
  },
});

export const depositSwiss = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(1, Math.floor(args.amount));
    if (n(player.money, 0) < amount) throw new Error("Not enough cash");
    const current = n(player.swissBank, 0);
    if (current + amount > SWISS_LIMIT) throw new Error(`Swiss bank limit is $${SWISS_LIMIT.toLocaleString()}`);
    const bankStats = { ...(player.bankStats || {}), swissLimit: SWISS_LIMIT };
    await ctx.db.patch(player._id, { money: n(player.money, 0) - amount, swissBank: current + amount, bankStats } as any);
    return { success: true, swissBank: current + amount, amount };
  },
});

export const withdrawSwiss = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(1, Math.floor(args.amount));
    if (n(player.swissBank, 0) < amount) throw new Error("Not enough in swiss bank");
    await ctx.db.patch(player._id, { money: n(player.money, 0) + amount, swissBank: n(player.swissBank, 0) - amount });
    return { success: true, amount };
  },
});

export const sendMoney = mutation({
  args: { username: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(1, Math.floor(args.amount));
    const user = (player.username || player.name || "").toLowerCase();
    const targetUsername = args.username.trim();
    if (!targetUsername) throw new Error("Enter a username");
    if (targetUsername.toLowerCase() === user.toLowerCase()) throw new Error("You cannot send money to yourself");
    const users = await ctx.db.query("users").collect();
    const target = users.find((u: any) => (u.username || u.name || "").toLowerCase() === targetUsername.toLowerCase());
    if (!target) throw new Error("User not found");
    const fee = 1;
    const total = amount + fee;
    if (n(player.money, 0) < total) throw new Error(`Need $${total.toLocaleString()} (includes $${fee} fee)`);
    const stats = { ...(player.bankStats || {}), totalSent: n(player.bankStats?.totalSent, 0) + amount, sent: n(player.bankStats?.sent, 0) + 1 };
    const tStats = { ...(target.bankStats || {}), totalReceived: n(target.bankStats?.totalReceived, 0) + amount, received: n(target.bankStats?.received, 0) + 1 };
    const history = Array.isArray(player.transferHistory) ? player.transferHistory : [];
    const tHistory = Array.isArray(target.transferHistory) ? target.transferHistory : [];
    history.unshift({ type: "sent", username: target.username || target.name, amount, ts: Date.now() });
    tHistory.unshift({ type: "received", username: player.username || player.name, amount, ts: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) - total, bankStats: stats, transferHistory: history.slice(0, 25) });
    await ctx.db.patch(target._id, { money: n(target.money, 0) + amount, bankStats: tStats, transferHistory: tHistory.slice(0, 25) });
    return { success: true, amount, fee };
  },
});

// ═══════════ CRACK THE SAFE ═══════════
function randomCombo() {
  return Array.from({ length: SAFE_DIGITS }, () => randInt(1, 9));
}
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

export const getSafeState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) {
      return null;
    }
    const ws = worldState(player);
    const s = ws.safe;
    const today = DAY_STR();
    const current = s && s.day === today ? s : { day: today, combo: randomCombo(), attempts: 0, cracked: false };
    const evenCount = current.combo.filter((d: number) => d % 2 === 0).length;
    return {
      today,
      combo: current.combo,
      attempts: current.attempts,
      attemptsRemaining: Math.max(0, SAFE_MAX_ATTEMPTS_PER_DAY - current.attempts),
      crackedToday: current.cracked,
      guessCost: SAFE_GUESS_COST,
      jackpot: SAFE_JACKPOT_BASE + current.attempts * 0,
      totalWinnings: n(player.worldState?.safe?.totalWinnings, 0),
      evenCount,
      safeStats: {
        safesCracked: n(player.worldState?.safeStats?.safesCracked, 0),
        crackedToday: current.cracked ? 1 : 0,
        totalWinnings: n(player.worldState?.safeStats?.totalWinnings, 0),
      },
    };
  },
});

export const guessSafe = mutation({
  args: { combo: v.array(v.number()) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!Array.isArray(args.combo) || args.combo.length !== SAFE_DIGITS || args.combo.some((d) => !Number.isInteger(d) || d < 1 || d > 9)) throw new Error("Enter 5 numbers between 1 and 9");
    if (n(player.money, 0) < SAFE_GUESS_COST) throw new Error(`Guess costs $${SAFE_GUESS_COST.toLocaleString()}`);
    const ws = worldState(player);
    const today = DAY_STR();
    const s = ws.safe && ws.safe.day === today ? ws.safe : { day: today, combo: randomCombo(), attempts: 0, cracked: false };
    if (s.combo.length !== SAFE_DIGITS) s.combo = randomCombo();
    s.attempts += 1;
    const correct = args.combo.every((d, i) => d === s.combo[i]) && s.combo.length === SAFE_DIGITS;
    const patch: any = { money: n(player.money, 0) - SAFE_GUESS_COST };
    const safeStats: any = { ...(ws.safeStats || { safesCracked: 0, totalWinnings: 0 }) };
    let jackpot = 0;
    if (correct) {
      s.cracked = true;
      jackpot = SAFE_JACKPOT_BASE;
      safeStats.safesCracked = n(safeStats.safesCracked, 0) + 1;
      safeStats.totalWinnings = n(safeStats.totalWinnings, 0) + jackpot;
      patch.money = n(player.money, 0) - SAFE_GUESS_COST + jackpot;
    }
    ws.safe = s;
    ws.safeStats = safeStats;
    patch.worldState = ws;
    await ctx.db.patch(player._id, patch);
    const evenCount = s.combo.filter((d: number) => d % 2 === 0).length;
    const hints = args.combo.map((g, i) => ({ pos: i + 1, guess: g, correct: s.combo[i] === g }));
    return { success: true, correct, jackpot, clues: { evenCount }, hints, combo: s.combo };
  },
});

// ═══════════ STOCK MARKET (points) ═══════════
function priceAt(sym: string, base: number, vol: number, t: number) {
  const h = Math.sin(sym.length * 127.1 + Math.floor(t / 600000) * 311.7) * 43758.5453;
  const noise = (h - Math.floor(h) - 0.5) * 2 * vol;
  return Math.max(0.0001, base * (1 + noise));
}
function stockPrice(index: number, t: number) {
  const def = STOCKS[index];
  return priceAt(def.symbol, def.base, def.vol, t);
}

export const getStockState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const ws = worldState(player);
    const now = Date.now();
    const stocks = STOCKS.map((s, i) => {
      const p = stockPrice(i, now);
      const p3h = stockPrice(i, now - 3 * HOUR);
      const p1d = stockPrice(i, now - DAY);
      const p3d = stockPrice(i, now - 3 * DAY);
      const p1w = stockPrice(i, now - 7 * DAY);
      return { id: s.id, symbol: s.symbol, name: s.name, price: p, changes: { "3h": (p / p3h - 1) * 100, "1d": (p / p1d - 1) * 100, "3d": (p / p3d - 1) * 100, "1w": (p / p1w - 1) * 100 } };
    });
    const holdings = Array.isArray(ws.stocks) ? ws.stocks : [];
    const stats: any = ws.stockStats || { trades: 0, totalProfit: 0, currentProfit: 0, history: [] };
    return { stocks, holdings, stats, overallProfit: n(stats.totalProfit, 0), currentProfit: n(stats.currentProfit, 0) };
  },
});

function settlePrice(hold: any, price: number) {
  return hold.type === "long" ? (price - hold.entry) * hold.qty : (hold.entry - price) * hold.qty;
}

function autoSettleHoldings(ws: any, now: number) {
  const holdings = Array.isArray(ws.stocks) ? ws.stocks : [];
  let trades = n(ws.stockStats?.trades, 0);
  let total = n(ws.stockStats?.totalProfit, 0);
  let current = n(ws.stockStats?.currentProfit, 0);
  const remaining: any[] = [];
  let settledProfit = 0;
  for (const h of holdings) {
    const pr = priceAt(symById(h.pid), h.base, h.vol, now);
    let closeReason: string | null = null;
    if (h.stopLoss) closeReason = pr <= h.entry * (1 - h.stopLoss / 100) ? "stop-loss" : null;
    if (h.takeProfit && !closeReason) closeReason = pr >= h.entry * (1 + h.takeProfit / 100) ? "take-profit" : null;
    if (closeReason) {
      const profit = settlePrice(h, pr);
      settledProfit += profit;
      trades += 1;
      total += profit;
      remaining.push({ ...h, closed: closeReason, closePrice: pr, profit });
    } else remaining.push(h);
  }
  ws.stocks = remaining;
  ws.stockStats = { trades, totalProfit: total, currentProfit: current + settledProfit, settledProfit };
  return { settledProfit, count: remaining.filter((h: any) => h.closed).length };
}

const symById = (pid: string) => ({ id: "btc" }).id;
const idIndex = (id: string) => STOCKS.findIndex((s) => s.id === id);

export const settleStocks = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const ws = worldState(player);
    const res = autoSettleHoldings(ws, Date.now());
    await ctx.db.patch(player._id, { worldState: ws });
    if (res.settledProfit !== 0) {
      await ctx.db.patch(player._id, { points: Math.max(0, n(player.points, 0) + res.settledProfit) });
    }
    return { success: true, ...res };
  },
});

export const buyStock = mutation({
  args: { id: v.string(), qty: v.number(), stopLoss: v.number(), takeProfit: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const idx = idIndex(args.id);
    if (idx < 0) throw new Error("Unknown stock");
    const qty = Math.max(1, Math.floor(args.qty));
    const price = stockPrice(idx, Date.now());
    const cost = price * qty;
    if (n(player.points, 0) < cost) throw new Error(`Need ${Math.ceil(cost)} points`);
    const ws = worldState(player);
    const holdings = Array.isArray(ws.stocks) ? ws.stocks : [];
    holdings.push({ pid: args.id, base: STOCKS[idx].base, vol: STOCKS[idx].vol, qty, type: "long", entry: price, stopLoss: clamp(args.stopLoss || 0, 0, 99), takeProfit: clamp(args.takeProfit || 0, 0, 500), at: Date.now() });
    ws.stocks = holdings;
    ws.stockStats = { ...(ws.stockStats || {}), trades: n(ws.stockStats?.trades, 0) + 1 };
    (ws.stockStats.history = ws.stockStats.history || []).unshift({ kind: "buy", stock: STOCKS[idx].name, qty, price, ts: Date.now() });
    await ctx.db.patch(player._id, { points: n(player.points, 0) - cost, worldState: ws });
    return { success: true, qty, cost: Math.ceil(cost) };
  },
});

export const shortStock = mutation({
  args: { id: v.string(), qty: v.number(), stopLoss: v.number(), takeProfit: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const idx = idIndex(args.id);
    if (idx < 0) throw new Error("Unknown stock");
    const qty = Math.max(1, Math.floor(args.qty));
    const price = stockPrice(idx, Date.now());
    const margin = price * qty;
    if (n(player.points, 0) < margin) throw new Error(`Need ${Math.ceil(margin)} points margin`);
    const ws = worldState(player);
    const holdings = Array.isArray(ws.stocks) ? ws.stocks : [];
    holdings.push({ pid: args.id, base: STOCKS[idx].base, vol: STOCKS[idx].vol, qty, type: "short", entry: price, stopLoss: clamp(args.stopLoss || 0, 0, 99), takeProfit: clamp(args.takeProfit || 0, 0, 500), at: Date.now() });
    ws.stocks = holdings;
    ws.stockStats = { ...(ws.stockStats || {}), trades: n(ws.stockStats?.trades, 0) + 1 };
    (ws.stockStats.history = ws.stockStats.history || []).unshift({ kind: "short", stock: STOCKS[idx].name, qty, price, ts: Date.now() });
    await ctx.db.patch(player._id, { points: n(player.points, 0) - margin, worldState: ws });
    return { success: true, qty, margin: Math.ceil(margin) };
  },
});

export const sellStock = mutation({
  args: { holdId: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const ws = worldState(player);
    const holdings = Array.isArray(ws.stocks) ? ws.stocks : [];
    const h = holdings[args.holdId];
    if (!h) throw new Error("Investment not found");
    const price = priceAt(symById(h.pid), h.base, h.vol, Date.now());
    const profit = settlePrice(h, price);
    holdings.splice(args.holdId, 1);
    ws.stocks = holdings;
    ws.stockStats = { ...(ws.stockStats || {}), trades: n(ws.stockStats?.trades, 0) + 1, totalProfit: n(ws.stockStats?.totalProfit, 0) + profit };
    (ws.stockStats.history = ws.stockStats.history || []).unshift({ kind: h.type === "long" ? "sell" : "cover", stock: STOCKS[idIndex(h.pid)].name, qty: h.qty, price, profit, ts: Date.now() });
    await ctx.db.patch(player._id, { points: Math.max(0, n(player.points, 0) + profit), worldState: ws });
    return { success: true, profit };
  },
});

// ═══════════ SUPPLY RUNNING ═══════════
export const getSupplyState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const ws = worldState(player);
    const sp = ws.supply || { city: "Zenith", carried: { gun: 0, drug: 0, booze: 0, ammo: 0 }, returnRunsToday: 0, day: DAY_STR(), profitToday: 0, profitWeek: 0, runsWeek: 0, runsAll: 0 };
    const now = Date.now();
    const rotation = Math.max(0, SUPPLY_PRICE_ROTATION_MS - (now % SUPPLY_PRICE_ROTATION_MS));
    const mult = 1 + 0.6 * (Math.floor(now / SUPPLY_PRICE_ROTATION_MS) % 3);
    const rates = SUPPLIES.map((s) => ({ ...s, sell: Math.round(s.price * mult) }));
    const stats = ws.supplyStats || { profitToday: 0, profitWeek: 0, runsWeek: 0, runsAll: 0 };
    const unitsAllowed = 56 + Math.floor((player.level ?? 1) / 5);
    return {
      city: sp.city, carried: sp.carried, day: sp.day,
      unitsAllowed,
      returnRunsToday: sp.returnRunsToday ?? 0,
      rates,
      priceRotation: rotation,
      stats: { profitToday: n(stats.profitToday, 0), profitWeek: n(stats.profitWeek, 0), runsWeek: n(stats.runsWeek, 0), runsAll: n(stats.runsAll, 0) },
    };
  },
});

export const buySupplies = mutation({
  args: { id: v.string(), qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const def = SUPPLIES.find((s) => s.id === args.id);
    if (!def) throw new Error("Unknown supply");
    const qty = Math.max(1, Math.floor(args.qty));
    const ws = worldState(player);
    const sp = ws.supply || { city: "Zenith", carried: { gun: 0, drug: 0, booze: 0, ammo: 0 }, returnRunsToday: 0, day: DAY_STR(), profitToday: 0, profitWeek: 0, runsWeek: 0, runsAll: 0 };
    const now = Date.now();
    const mult = 1 + 0.6 * (Math.floor(now / SUPPLY_PRICE_ROTATION_MS) % 3);
    const rate = Math.round(def.price * mult);
    const cost = rate * qty;
    const carriedTotal = Object.values(sp.carried).reduce((s: number, x) => s + n(x, 0), 0);
    const unitsAllowed = 56 + Math.floor((player.level ?? 1) / 5);
    if (carriedTotal + qty > unitsAllowed) throw new Error(`Carrying capacity is ${unitsAllowed} units`);
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()}`);
    sp.carried[def.id] = n(sp.carried[def.id], 0) + qty;
    ws.supply = sp;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, worldState: ws });
    return { success: true, qty, cost };
  },
});

export const sellSupplies = mutation({
  args: { id: v.string(), qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const def = SUPPLIES.find((s) => s.id === args.id);
    if (!def) throw new Error("Unknown supply");
    const ws = worldState(player);
    const sp = ws.supply || { city: "Zenith", carried: { gun: 0, drug: 0, booze: 0, ammo: 0 }, returnRunsToday: 0, day: DAY_STR(), profitToday: 0, profitWeek: 0, runsWeek: 0, runsAll: 0 };
    const qty = Math.max(1, Math.min(Math.floor(args.qty), n(sp.carried[def.id], 0)));
    if (qty < 1) throw new Error("No supplies of that type to sell");
    const now = Date.now();
    const mult = 1 + 0.6 * (Math.floor(now / SUPPLY_PRICE_ROTATION_MS) % 3);
    const sell = Math.round(def.price * mult * 1.25); // ~25% margin
    const revenue = sell * qty;
    sp.carried[def.id] = n(sp.carried[def.id], 0) - qty;
    sp.returnRunsToday = (sp.returnRunsToday ?? 0) + qty;
    const day = DAY_STR();
    const profitToday = day === sp.day ? n(sp.profitToday, 0) : 0;
    sp.profitToday = profitToday + revenue;
    sp.profitWeek = n(sp.profitWeek, 0) + revenue;
    sp.runsWeek = n(sp.runsWeek, 0) + 1;
    sp.runsAll = n(sp.runsAll, 0) + 1;
    sp.day = day;
    ws.supply = sp;
    ws.supplyStats = sp;
    await ctx.db.patch(player._id, { money: n(player.money, 0) + revenue, worldState: ws, supplyRuns: n((player as any).supplyRuns, 0) + 1, totalSupplyProfit: n((player as any).totalSupplyProfit, 0) + revenue } as any);
    return { success: true, qty, revenue };
  },
});

// ═══════════ REAL ESTATE ═══════════
export const getEstateState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const ws = worldState(player);
    const est = ws.estate || { owned: [] };
    const now = Date.now();
    const owned = (est.owned as any[]).map((p) => {
      const constructed = n(p.constructStart, 0) === 0 || now - n(p.constructStart, 0) >= ESTATE_CONSTRUCTION_DAYS * DAY;
      return { ...p, constructed, rent: ESTATE_BASE_RENT[p.location] * (1 + 0.5 * n(p.upgrades, 0)) };
    });
    return { owned, locations: ESTATE_LOCATIONS.map((l) => ({ ...l, price: ESTATE_PRICES[l.name], baseRent: ESTATE_BASE_RENT[l.name] })), maxUpgrades: ESTATE_MAX_UPGRADES, constructionDays: ESTATE_CONSTRUCTION_DAYS };
  },
});

export const buyProperty = mutation({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const loc = ESTATE_PRICES[args.location];
    if (!loc) throw new Error("Unknown location");
    const ws = worldState(player);
    const est = ws.estate || { owned: [] };
    if (est.owned.some((p: any) => p.location === args.location)) throw new Error("You already own a property here");
    if (n(player.money, 0) < loc) throw new Error(`Need $${loc.toLocaleString()}`);
    est.owned.push({ location: args.location, upgrades: 0, constructStart: Date.now() });
    ws.estate = est;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - loc, worldState: ws, propertiesBought: n((player as any).propertiesBought, 0) + 1 } as any);
    return { success: true, location: args.location, cost: loc };
  },
});

export const upgradeProperty = mutation({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const ws = worldState(player);
    const est = ws.estate || { owned: [] };
    const p = est.owned.find((x: any) => x.location === args.location);
    if (!p) throw new Error("Property not found");
    if (n(p.upgrades, 0) >= ESTATE_MAX_UPGRADES) throw new Error("Max upgrades reached");
    const cost = Math.floor(ESTATE_PRICES[args.location] * 0.25 * (n(p.upgrades, 0) + 1));
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()}`);
    p.upgrades = n(p.upgrades, 0) + 1;
    ws.estate = est;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, worldState: ws });
    return { success: true, upgrades: p.upgrades, cost };
  },
});
export const sellProperty = mutation({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const ws = worldState(player);
    const est = ws.estate || { owned: [] };
    const idx = est.owned.findIndex((x: any) => x.location === args.location);
    if (idx === -1) throw new Error("Property not found");
    const p = est.owned[idx];
    const resale = Math.floor(ESTATE_PRICES[args.location] * 0.7 * (1 + 0.15 * n(p.upgrades, 0)));
    est.owned.splice(idx, 1);
    ws.estate = est;
    await ctx.db.patch(player._id, { money: n(player.money, 0) + resale, worldState: ws });
    return { success: true, location: args.location, resale };
  },
});


// Collects daily rent from constructed properties (lazy, stacks up to 30 days).
export const collectEstateRent = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const ws = worldState(player);
    const est = ws.estate || { owned: [] };
    if (est.owned.length === 0) return { success: true, collected: false, rent: 0 };
    const last = n(player.worldRentAt, Date.now());
    const periods = Math.floor(Math.max(0, Date.now() - last) / DAY);
    if (periods < 1) return { success: true, collected: false, rent: 0 };
    const capped = Math.min(periods, 30);
    const now = Date.now();
    let rent = 0;
    for (const p of est.owned as any[]) {
      if (n(p.constructStart, 0) === 0 || now - n(p.constructStart, 0) < ESTATE_CONSTRUCTION_DAYS * DAY) continue;
      rent += ESTATE_BASE_RENT[p.location] * (1 + 0.5 * n(p.upgrades, 0)) * capped;
    }
    await ctx.db.patch(player._id, { worldRentAt: Date.now(), money: n(player.money, 0) + Math.floor(rent) });
    return { success: true, collected: rent > 0, rent: Math.floor(rent), days: capped };
  },
});

// ═══════════ DEAD / ALIVE TRANSFER ═══════════
export const getLinkedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const email = player.email;
    if (!email) return { accounts: [] };
    const users = await ctx.db.query("users").collect();
    const accounts = users.filter((u: any) => u.email === email).map((u: any) => ({ username: u.username || u.name, alive: !u.isDead, points: n(u.points, 0), bank: n(u.money, 0) }));
    return { accounts };
  },
});

export const deadAliveTransfer = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!player.email) throw new Error("Link accounts via the same email first");
    const users = await ctx.db.query("users").collect();
    const dead = users.find((u: any) => (u.username || u.name || "").toLowerCase() === args.username.toLowerCase() && u.email === player.email && u._id !== player._id);
    if (!dead) throw new Error("Dead account not found or not linked to this email");
    const results: string[] = [];
    // Points 5% tax
    const points = Math.floor(n(dead.points, 0) * 0.95);
    if (points > 0) { await ctx.db.patch(dead._id, { points: 0 }); await ctx.db.patch(player._id, { points: n(player.points, 0) + points }); results.push(`Points ($5% tax) → +${points.toLocaleString()} pts`); }
    // Swiss bank 5% tax
    const swiss = Math.floor(n(dead.swissBank, 0) * 0.95);
    if (swiss > 0) { await ctx.db.patch(dead._id, { swissBank: 0 }); await ctx.db.patch(player._id, { swissBank: n(player.swissBank, 0) + swiss }); results.push(`Swiss Bank (5% tax) → +$${swiss.toLocaleString()}`); }
    // Coins full
    const coins = n(dead.coins, 0);
    if (coins > 0) { await ctx.db.patch(dead._id, { coins: 0 }); await ctx.db.patch(player._id, { coins: n(player.coins, 0) + coins }); results.push(`Coins (free) → +${coins} 🪙`); }
    // Bullets 25% tax
    const bullets = Math.floor(n(dead.bullets, 0) * 0.75);
    if (bullets > 0) { await ctx.db.patch(dead._id, { bullets: 0 }); await ctx.db.patch(player._id, { bullets: n(player.bullets, 0) + bullets }); results.push(`Bullets (25% tax) → +${bullets.toLocaleString()}`); }
    return { success: true, results, empty: results.length === 0 };
  },
});
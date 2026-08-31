import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { CATEGORY_OBJECTIVES } from "../data/objectives";
import { HEIST_JOBS, HEIST_CREWS, HEIST_EQUIPMENT } from "../data/heist";
import { EMPIRE_DISTRICTS, DISTRICT_CASH } from "../data/empire";

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

// ===== HEISTS =====
// (HEIST_JOBS / HEIST_CREWS / HEIST_EQUIPMENT live in ../data/heist.ts)

const HEIST_COOLDOWN_BOOSTS: Record<string, number> = { heistTimer: 0.5 }; // -50% cooldown while active

export const getHeistState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    return {
      heistsTotal: n(player.heistsTotal, 0),
      heistsSuccess: n(player.heistsSuccess, 0),
      heistsFailed: n(player.heistsFailed, 0),
      heistProfit: n(player.heistProfit, 0),
      lastHeistAt: n(player.lastHeistAt, 0),
      money: n(player.money, 0),
      energy: n((player as any).energy, 100),
    };
  },
});

export const executeHeist = mutation({
  args: { jobId: v.string(), crewId: v.string(), equipmentId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const job = HEIST_JOBS.find((j) => j.id === args.jobId);
    const crew = HEIST_CREWS.find((c) => c.id === args.crewId);
    const equip = HEIST_EQUIPMENT.find((e) => e.id === args.equipmentId);
    if (!job || !crew || !equip) throw new Error("Invalid heist selection");

    const energy = n((player as any).energy, 100);
    const energyCost = 30;
    if (energy < energyCost) throw new Error(`Need ${energyCost} energy for a heist`);

    const now = Date.now();
    const timerBoost = HEIST_COOLDOWN_BOOSTS.heistTimer && Date.now() < n(player.heistTimerUntil, 0) ? HEIST_COOLDOWN_BOOSTS.heistTimer : 0;
    const cooldownMs = equip.cooldown * 60000 * (1 - timerBoost);
    const last = n(player.lastHeistAt, 0);
    if (now - last < cooldownMs) {
      const mins = Math.ceil((cooldownMs - (now - last)) / 60000);
      throw new Error(`Equipment cooling down — ${mins}m until next heist`);
    }

    const cost = crew.cost + equip.cost;
    if (n(player.money, 0) < cost) throw new Error(`Need $${cost.toLocaleString()} to assemble this crew + equipment`);

    const chance = Math.min(0.85, crew.chance + (player.level ?? 1) * 0.004 + (Date.now() < n(player.heistChanceUntil, 0) ? 0.1 : 0));
    const success = Math.random() < chance;
    const cashBoost = Date.now() < n(player.cashBoostUntil, 0) ? 3 : 1;
    const payout = success ? Math.floor(randInt(job.min, job.max) * cashBoost) : 0;
    const xp = success ? Math.floor(randInt(800, 1600)) : Math.floor(randInt(150, 350));

    const patch: any = {
      heistsTotal: n(player.heistsTotal, 0) + 1,
      heistsFailed: success ? n(player.heistsFailed, 0) : n(player.heistsFailed, 0) + 1,
      heistProfit: n(player.heistProfit, 0) + payout,
      lastHeistAt: now,
      energy: Math.max(0, energy - energyCost),
      money: n(player.money, 0) - cost + payout,
    };
    if (success) patch.heistsSuccess = n(player.heistsSuccess, 0) + 1;
    const xpUpd: any = await addXpAndCheckLevel(ctx, player, xp);
    patch.experience = xpUpd.experience;
    if (xpUpd.level !== undefined) {
      patch.level = xpUpd.level; patch.highestLevel = xpUpd.highestLevel; patch.energy = 100;
      if (xpUpd.attack !== undefined) patch.attack = xpUpd.attack;
      if (xpUpd.defense !== undefined) patch.defense = xpUpd.defense;
      if (xpUpd.maxLife !== undefined) patch.maxLife = xpUpd.maxLife;
      if (xpUpd.life !== undefined) patch.life = xpUpd.life;
    }
    await ctx.db.patch(player._id, patch);
    return { success, payout, cost, xp, chance, job: job.name, crew: crew.name };
  },
});

// ===== MISSION EMPIRE =====
// (EMPIRE_DISTRICTS + DISTRICT_CASH live in ../data/empire.ts)

export const getEmpire = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const progress: Record<string, number> = player.empireProgress && typeof player.empireProgress === "object" ? player.empireProgress : {};
    const districtsCompleted = EMPIRE_DISTRICTS.filter((d) => n(progress[d], 0) >= 3).length;
    const totalTasks = EMPIRE_DISTRICTS.reduce((sum, d) => sum + n(progress[d], 0), 0);
    const cashPerDay = EMPIRE_DISTRICTS.slice(0, districtsCompleted).reduce((sum, _, i) => sum + DISTRICT_CASH[i], 0);
    const pointsPerDay = districtsCompleted * 25;
    const bulletsPerDay = districtsCompleted * 150;
    const scrapCommon = districtsCompleted * 1;
    const scrapRare = Math.floor(districtsCompleted / 2);
    const scrapEpic = Math.floor(districtsCompleted / 4);
    const empireValue = districtsCompleted * 50_000 + totalTasks * 2_000;
    const PAYOUT_MS = 24 * 3600000;
    const lastPayout = n(player.lastEmpirePayout, 0);
    // Paid-out so far factor for display (payout happens lazily via collectEmpireIncome)
    const nextPayoutIn = lastPayout > 0 ? Math.max(0, lastPayout + PAYOUT_MS - Date.now()) : 0;
    return {
      lastEmpirePayout: lastPayout,
      nextPayoutIn,
      districtsCompleted,
      totalTasks,
      cashPerDay,
      pointsPerDay,
      bulletsPerDay,
      scrapCommon, scrapRare, scrapEpic,
      empireValue: n(player.empireValue, 0) + empireValue,
      progress,
      districts: EMPIRE_DISTRICTS.map((name) => ({
        name, tasks: n(progress[name], 0),
        conquered: n(progress[name], 0) >= 3,
      })),
    };
  },
});

// Lazily collects empire income: pays out for every full 24h period elapsed since
// the last collection (stacking), capped at 30 days. Called on login/HQ and missions.
export const collectEmpireIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const now = Date.now();
    const PAYOUT_MS = 24 * 3600000;
    const last = n(player.lastEmpirePayout, now);
    const elapsed = Math.max(0, now - last);
    const periods = Math.floor(elapsed / PAYOUT_MS);
    if (periods < 1) return { success: true, collected: false, periods: 0 };
    const capped = Math.min(periods, 30);

    const progress: Record<string, number> = player.empireProgress && typeof player.empireProgress === "object" ? player.empireProgress : {};
    const districtsCompleted = EMPIRE_DISTRICTS.filter((d) => n(progress[d], 0) >= 3).length;
    if (districtsCompleted < 1) {
      await ctx.db.patch(player._id, { lastEmpirePayout: now });
      return { success: true, collected: true, periods: 0, districtsCompleted: 0 };
    }

    const cashPerDay = EMPIRE_DISTRICTS.slice(0, districtsCompleted).reduce((s, _, i) => s + DISTRICT_CASH[i], 0);
    const patch: any = {
      lastEmpirePayout: now,
      money: n(player.money, 0) + cashPerDay * capped,
      points: n(player.points, 0) + districtsCompleted * 25 * capped,
      bullets: n(player.bullets, 0) + districtsCompleted * 150 * capped,
    };
    let scraps = player.scraps && typeof player.scraps === "object" ? { ...player.scraps } : { common: 0, rare: 0, epic: 0 };
    scraps.common = n(scraps.common, 0) + districtsCompleted * capped;
    scraps.rare = n(scraps.rare, 0) + Math.floor(districtsCompleted / 2) * capped;
    scraps.epic = n(scraps.epic, 0) + Math.floor(districtsCompleted / 4) * capped;
    patch.scraps = scraps;
    await ctx.db.patch(player._id, patch);
    return { success: true, collected: true, periods: capped, cash: cashPerDay * capped, points: districtsCompleted * 25 * capped, bullets: districtsCompleted * 150 * capped, districtsCompleted };
  },
});

// Payout helper exposed so the UI's "next payout" can be derived via getEmpire.
export const empirePayoutWindowMs = 24 * 3600000;

export const completeDistrictTask = mutation({
  args: { district: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!EMPIRE_DISTRICTS.includes(args.district)) throw new Error("Unknown district");
    const progress: Record<string, number> = player.empireProgress && typeof player.empireProgress === "object" ? { ...player.empireProgress } : {};
    const idx = EMPIRE_DISTRICTS.indexOf(args.district);
    if (n(progress[args.district], 0) >= 3) throw new Error("District already conquered");
    const task = n(progress[args.district], 0) + 1;
    progress[args.district] = task;
    const energy = n((player as any).energy, 100);
    if (energy < 15) throw new Error("Need 15 energy for a district task");
    const reward = Math.floor((DISTRICT_CASH[idx] ?? 15000) * (task / 3));
    const xpUpd: any = await addXpAndCheckLevel(ctx, player, 250);
    const patch: any = {
      empireProgress: progress,
      energy: Math.max(0, energy - 15),
      money: n(player.money, 0) + reward,
      empireValue: n(player.empireValue, 0) + reward,
      experience: xpUpd.experience,
    };
    if (xpUpd.level !== undefined) { patch.level = xpUpd.level; patch.highestLevel = xpUpd.highestLevel; patch.energy = 100; if (xpUpd.attack !== undefined) patch.attack = xpUpd.attack; if (xpUpd.defense !== undefined) patch.defense = xpUpd.defense; if (xpUpd.maxLife !== undefined) patch.maxLife = xpUpd.maxLife; if (xpUpd.life !== undefined) patch.life = xpUpd.life; }
    await ctx.db.patch(player._id, patch);
    return { success: true, task, reward, district: args.district, conquered: task >= 3 };
  },
});

// ===== PRISON BUST =====
export const BOT_NAMES = ["butchie2", "LOL", "Franco", "Diesel", "Rico", "Tony Two-Tone", "Mugsy", "Crash"];

export const getPrisonBust = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const bots = await ctx.db.query("prisonBots").filter((q) => q.eq(q.field("active"), true)).collect();
    return {
      attempts: n(player.bustStats?.attempts, 0),
      success: n(player.bustStats?.success, 0),
      failed: n(player.bustStats?.failed, 0),
      profit: n(player.bustStats?.profit, 0),
      bustReward: n(player.bustReward, 0),
      inPrison: !!player.inPrison,
      bailoutAt: n(player.prisonBailoutAt, 0),
      bots,
    };
  },
});

export const setBustReward = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(0, Math.floor(args.amount));
    await ctx.db.patch(player._id, { bustReward: amount });
    return { success: true, amount };
  },
});

export const generateBustBots = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const old = await ctx.db.query("prisonBots").filter((q) => q.eq(q.field("active"), true)).collect();
    for (const b of old) await ctx.db.patch(b._id, { active: false });
    const count = randInt(3, 5);
    for (let i = 0; i < count; i++) {
      const sentence = randInt(10, 130);
      const reward = sentence * 800;
      await ctx.db.insert("prisonBots", {
        name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
        sentence,
        reward,
        active: true,
      });
    }
    return { success: true, count };
  },
});

export const bustBot = mutation({
  args: { botId: v.id("prisonBots") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const bot = await ctx.db.get(args.botId);
    if (!bot || !bot.active) throw new Error("Inmate no longer available");
    const energy = n((player as any).energy, 100);
    if (energy < 10) throw new Error("Need 10 energy to bust out an inmate");
    const stats: any = { ...(player.bustStats || {}), attempts: n(player.bustStats?.attempts, 0) + 1 };
    const chance = Math.min(0.9, 0.5 + n(player.bustReward, 0) / 20_000_000 + (player.level ?? 1) * 0.002);
    const success = Math.random() < chance;
    let profit = n(player.bustStats?.profit, 0);
    let reward = 0;
    const patch: any = { energy: Math.max(0, energy - 10) };
    if (success) {
      reward = bot.reward;
      profit += reward;
      stats.success = n(player.bustStats?.success, 0) + 1;
      patch.money = n(player.money, 0) + reward;
      await ctx.db.patch(bot._id, { active: false });
      const xpUpd: any = await addXpAndCheckLevel(ctx, player, 150);
      patch.experience = xpUpd.experience;
      if (xpUpd.level !== undefined) { patch.level = xpUpd.level; patch.highestLevel = xpUpd.highestLevel; patch.energy = 100; }
    } else {
      stats.failed = n(player.bustStats?.failed, 0) + 1;
    }
    stats.profit = profit;
    patch.bustStats = stats;
    await ctx.db.patch(player._id, patch);
    return { success, reward, stats };
  },
});

export const prisonLeave = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!player.inPrison) throw new Error("You are not in prison");
    const cost = 2;
    if (n(player.points, 0) < cost) throw new Error(`Need ${cost} points to leave early`);
    const releaseAt = Date.now();
    await ctx.db.patch(player._id, {
      prisonBailoutAt: releaseAt,
      points: n(player.points, 0) - cost,
      inPrison: false,
    });
    return { success: true };
  },
});

// ===== PROMO CODES =====
export const createPromoCode = mutation({
  args: { code: v.string(), message: v.string(), rewardLabel: v.string(), expiresHours: v.number(), perks: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const role = player.role ?? player.isAdmin;
    if (role !== "admin" && role !== true && role !== "Admin") throw new Error("Admins only");
    const code = (args.code || "").toUpperCase().trim();
    if (!code) throw new Error("Code required");
    const existing = await ctx.db.query("promoCodes").filter((q) => q.eq(q.field("code"), code)).first();
    const now = Date.now();
    const expiresAt = now + Math.max(1, Math.floor(args.expiresHours)) * 3600000;
    // Clean perk amounts: remove zero/negative entries
    const perks: Record<string, number> = {};
    if (args.perks && typeof args.perks === "object") {
      for (const [k, v] of Object.entries(args.perks)) {
        if (typeof v === "number" && v > 0) perks[k] = Math.floor(v);
      }
    }
    // Deactivate any currently active code so the status message updates
    const active = await ctx.db.query("promoCodes").filter((q) => q.eq(q.field("active"), true)).collect();
    for (const a of active) await ctx.db.patch(a._id, { active: false });
    if (existing) {
      await ctx.db.patch(existing._id, { message: args.message, rewardLabel: args.rewardLabel, expiresAt, active: true, createdBy: player._id, createdAt: now, perks });
      return { success: true, code };
    }
    await ctx.db.insert("promoCodes", {
      code, message: args.message, rewardLabel: args.rewardLabel, expiresAt, createdBy: player._id, createdAt: now, active: true, claimed: 0, perks,
    });
    return { success: true, code };
  },
});

export const getActivePromo = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const active = await ctx.db.query("promoCodes").filter((q) => q.eq(q.field("active"), true)).collect();
    const curr = active.find((a: any) => a.expiresAt > now) ?? null;
    if (curr) return { code: curr.code, message: curr.message, rewardLabel: curr.rewardLabel, expiresAt: curr.expiresAt, perks: curr.perks ?? {} };
    return null;
  },
});

export const redeemPromoCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const code = (args.code || "").toUpperCase().trim();
    if (!code) throw new Error("Enter a promo code");
    const promo = await ctx.db.query("promoCodes").filter((q) => q.eq(q.field("code"), code)).first() as any;
    if (!promo || !promo.active) throw new Error("Invalid or inactive code");
    if (promo.expiresAt <= Date.now()) throw new Error("This code has expired");
    const redeemed: string[] = Array.isArray(player.redeemedPromos) ? player.redeemedPromos : [];
    if (redeemed.includes(promo._id)) throw new Error("You already redeemed this code");

    // Prize: completes all Game Objectives + a coin/points/skill bonus + perks.
    let money = n(player.money, 0);
    const claimed: Record<string, number[]> = {};
    const now = Date.now();
    const progress: Record<string, number> = {};
    for (const def of CATEGORY_OBJECTIVES) {
      const counts = def.milestones.map((m) => m.count);
      claimed[def.categoryId] = counts;
      progress[def.categoryId] = Math.max(def.milestones[def.milestones.length - 1].count, n(player.objectiveProgress?.[def.categoryId], 0));
      money += def.milestones.reduce((s, m) => s + m.reward, 0);
    }
    const coinBonus = 25;

    // Grant perks included in the promo code
    const promoPerks: Record<string, number> = (promo.perks && typeof promo.perks === "object") ? promo.perks : {};
    const existingPerks: Record<string, number> = (player.perks && typeof player.perks === "object") ? player.perks as any : {};
    const mergedPerks: Record<string, number> = { ...existingPerks };
    for (const [k, v] of Object.entries(promoPerks)) {
      if (typeof v === "number" && v > 0) mergedPerks[k] = (mergedPerks[k] ?? 0) + v;
    }

    const patch: any = {
      money,
      coins: n(player.coins, 0) + coinBonus,
      points: n(player.points, 0) + 250,
      skillPoints: n(player.skillPoints, 0) + 10,
      objectiveProgress: progress,
      objectivesClaimed: claimed,
      objectivesDay: "manual",
      redeemedPromos: [...redeemed, promo._id],
      currentPromo: promo.message,
      cashBoostUntil: Math.max(n(player.cashBoostUntil, 0), now + 3600000),
      perks: mergedPerks,
    };
    const xpUpd: any = await addXpAndCheckLevel(ctx, player, 5000);
    patch.experience = xpUpd.experience;
    if (xpUpd.level !== undefined) { patch.level = xpUpd.level; patch.highestLevel = xpUpd.highestLevel; patch.energy = 100; if (xpUpd.attack !== undefined) patch.attack = xpUpd.attack; if (xpUpd.defense !== undefined) patch.defense = xpUpd.defense; }
    await ctx.db.patch(player._id, patch);
    // Record the claim so the player's Overview > Promotional Codes page can
    // show their recent claimed codes.
    const history = Array.isArray((player as any).promoHistory)
      ? [...(player as any).promoHistory]
      : [];
    history.push({ code: promo.code, message: promo.message, rewardLabel: promo.rewardLabel, at: now, perks: promo.perks ?? {} });
    await ctx.db.patch(player._id, { promoHistory: history.slice(-25) });
    await ctx.db.patch(promo._id, { claimed: promo.claimed + 1 });
    return { success: true, money, coinBonus, promo: promo.message, rewardLabel: promo.rewardLabel, perks: promoPerks };
  },
});

// Player-facing state for the Overview > Promotional Codes page.
export const getMyPromos = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const now = Date.now();
    const activeList = await ctx.db.query("promoCodes").filter((q) => q.eq(q.field("active"), true)).collect();
    const activeCurr = activeList.find((a: any) => a.expiresAt > now) ?? null;
    const active = activeCurr ? { code: activeCurr.code, message: activeCurr.message, rewardLabel: activeCurr.rewardLabel, expiresAt: activeCurr.expiresAt, perks: activeCurr.perks ?? {} } : null;
    return {
      active,
      history: Array.isArray((player as any).promoHistory)
        ? [...(player as any).promoHistory].sort((a: any, b: any) => b.at - a.at)
        : [],
    };
  },
});
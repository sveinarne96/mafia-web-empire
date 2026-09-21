import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { HEIST_JOBS, HEIST_CREWS, HEIST_EQUIPMENT, computeHeistChance } from "../data/heist";
import { EMPIRE_DISTRICTS, DISTRICT_CASH } from "../data/empire";

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

// ═══════════════════════ TALENTS ═══════════════════════
// City talents: permanent per-city upgrades. Global talents: shared upgrades.
// Kept between seasons (performance points / prestige territory).

export const CITY_TALENT_DEFS = [
  { id: "influential", name: "Influential", icon: "🗣️", desc: "+3% crime cash per level in this city", max: 10 },
  { id: "distance", name: "Distance Adjustment", icon: "📍", desc: "−2% crime cooldown per level in this city", max: 10 },
  { id: "bumper", name: "Bumper Crop", icon: "🌱", desc: "+5% mission XP per level in this city", max: 10 },
] as const;

export const GLOBAL_TALENT_DEFS = [
  { id: "warehouse", name: "Warehouse", icon: "🏭", desc: "+10% item storage value per level (all cities)", max: 10 },
  { id: "hardy", name: "Hardy", icon: "💪", desc: "+2 max life per level (all cities)", max: 10 },
  { id: "bulk", name: "Bulk Trade", icon: "📦", desc: "+3% market sell value per level (all cities)", max: 10 },
] as const;

export const TALENTS = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const city = player.location ?? "Little Italy";
    const cityTalents = ((player as any).cityTalents ?? {}) as Record<string, number>;
    const globalTalents = ((player as any).globalTalents ?? {}) as Record<string, number>;
    const cityKey = `city:${city}`;
    return {
      city,
      cityPoints: n((player as any).talentPoints, 0),
      globalPoints: n((player as any).globalTalentPoints, 0),
      cityLevels: cityTalents[cityKey] ?? {},
      globalLevels: globalTalents ?? {},
      cityDefs: CITY_TALENT_DEFS,
      globalDefs: GLOBAL_TALENT_DEFS,
    };
  },
});

export const spendTalentPoint = mutation({
  args: { scope: v.union(v.literal("city"), v.literal("global")), talentId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const now = Date.now();
    const patch: any = {};

    if (args.scope === "city") {
      const def = CITY_TALENT_DEFS.find((t) => t.id === args.talentId);
      if (!def) throw new Error("Unknown talent");
      const city = player.location ?? "Little Italy";
      const cityKey = `city:${city}`;
      const cityTalents = { ...(((player as any).cityTalents ?? {}) as Record<string, Record<string, number>>) };
      const levels = { ...(cityTalents[cityKey] ?? {}) };
      const cur = n(levels[def.id], 0);
      if (cur >= def.max) throw new Error(`${def.name} is already maxed (Lv.${def.max})`);
      if (n((player as any).talentPoints, 0) < 1) throw new Error("No city talent points — earn them from missions and packs");
      levels[def.id] = cur + 1;
      cityTalents[cityKey] = levels;
      patch.cityTalents = cityTalents;
      patch.talentPoints = n((player as any).talentPoints, 0) - 1;
    } else {
      const def = GLOBAL_TALENT_DEFS.find((t) => t.id === args.talentId);
      if (!def) throw new Error("Unknown talent");
      const globalTalents = { ...(((player as any).globalTalents ?? {}) as Record<string, number>) };
      const cur = n(globalTalents[def.id], 0);
      if (cur >= def.max) throw new Error(`${def.name} is already maxed (Lv.${def.max})`);
      if (n((player as any).globalTalentPoints, 0) < 1) throw new Error("No global talent points — convert 5 city points into 1 global point");
      globalTalents[def.id] = cur + 1;
      patch.globalTalents = globalTalents;
      patch.globalTalentPoints = n((player as any).globalTalentPoints, 0) - 1;
      // Hardy applies instantly: +2 max life per level, healing the same amount.
      if (def.id === "hardy") {
        const newMax = n((player as any).maxLife, 100) + 2;
        patch.maxLife = newMax;
        patch.life = Math.min(newMax, n((player as any).life, 100) + 2);
      }
    }

    await ctx.db.patch(player._id, patch);
    return { success: true };
  },
});

export const convertTalentPoints = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.floor(args.amount);
    if (amount < 1) throw new Error("Convert at least 1 global point (costs 5 city points each)");
    const cost = amount * 5;
    if (n((player as any).talentPoints, 0) < cost) {
      throw new Error(`Needs ${cost} city talent points (5 per global point)`);
    }
    await ctx.db.patch(player._id, {
      talentPoints: n((player as any).talentPoints, 0) - cost,
      globalTalentPoints: n((player as any).globalTalentPoints, 0) + amount,
    });
    return { success: true, globalPoints: amount };
  },
});

// ═══════════════════════ EMPIRE (missions income) ═══════════════════════

export const getEmpire = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const progress = ((player as any).empireProgress ?? {}) as Record<string, number>;
    const now = Date.now();

    const districts = EMPIRE_DISTRICTS.map((name, i) => ({
      name,
      tasks: Math.min(3, Math.floor(progress[name] ?? 0)),
      conquered: (progress[name] ?? 0) >= 3,
    }));
    const districtsCompleted = districts.filter((d) => d.conquered).length;
    const cashPerDay = Array.from({ length: districtsCompleted }, (_, i) => DISTRICT_CASH[i] ?? 15_000).reduce((a, b) => a + b, 0);
    const totalTasks = Object.values(progress).reduce((s: number, v: any) => s + n(v, 0), 0);
    const lastPayout = n((player as any).lastEmpirePayout, 0);
    const nextPayoutIn = lastPayout > 0 ? Math.max(0, lastPayout + 24 * 3600000 - now) : 0;

    return {
      districts,
      districtsCompleted,
      totalTasks,
      cashPerDay,
      pointsPerDay: districtsCompleted * 25,
      bulletsPerDay: districtsCompleted * 150,
      scrapCommon: districtsCompleted * 1,
      scrapRare: Math.floor(districtsCompleted / 2),
      scrapEpic: Math.floor(districtsCompleted / 4),
      empireValue: districtsCompleted * 50_000 + totalTasks * 2_000,
      nextPayoutIn,
      sold: n((player as any).empireSoldAt, 0) > 0,
    };
  },
});

export const completeDistrictTask = mutation({
  args: { district: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (n((player as any).empireSoldAt, 0) > 0) throw new Error("Your empire was sold — districts can no longer be completed");
    if ((player as any).inPrison) throw new Error("You cannot run districts from prison");
    const progress = { ...(((player as any).empireProgress ?? {}) as Record<string, number>) };
    const cur = Math.min(3, Math.floor(progress[args.district] ?? 0));
    if (cur >= 3) throw new Error("District already conquered");
    const districtIdx = EMPIRE_DISTRICTS.indexOf(args.district);
    if (districtIdx < 0) throw new Error("Unknown district");
    const lockLevel = [1, 4, 7, 10, 13, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 110, 120, 130][districtIdx] ?? 1;
    if (n(player.level, 1) < lockLevel) throw new Error(`Requires level ${lockLevel}`);

    // Cost scales with district tier — a real investment, not a free click.
    const cost = 10_000 * (districtIdx + 1);
    if (n(player.money, 0) < cost) throw new Error(`Needs $${cost.toLocaleString()} to run this task`);
    progress[args.district] = cur + 1;
    const conquered = cur + 1 >= 3;
    const reward = Math.floor((DISTRICT_CASH[districtIdx] ?? 15_000) * 0.1);

    const patch: any = {
      money: n(player.money, 0) - cost + reward,
      empireProgress: progress,
      lastEmpirePayout: n((player as any).lastEmpirePayout, 0),
      energy: Math.max(0, n((player as any).energy, 100) - 5),
    };
    const xp = await addXpAndCheckLevel(ctx, player, 150 + districtIdx * 40);
    Object.assign(patch, xp);
    if (conquered) {
      patch.lastEmpirePayout = now24hAnchor();
      patch.empireValue = n((player as any).empireValue, 0) + 50_000;
    }
    await ctx.db.patch(player._id, patch);
    return { success: true, task: cur + 1, reward, conquered };
  },
});

function now24hAnchor() {
  // Anchor the next daily payout 24h from conquest.
  return Date.now();
}

export const collectEmpireIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return { collected: false, periods: 0, cash: 0, points: 0, bullets: 0 };
    const progress = ((player as any).empireProgress ?? {}) as Record<string, number>;
    const districtsCompleted = EMPIRE_DISTRICTS.reduce((s, name) => s + ((progress[name] ?? 0) >= 3 ? 1 : 0), 0);
    if (districtsCompleted === 0 || n((player as any).empireSoldAt, 0) > 0) {
      return { collected: false, periods: 0, cash: 0, points: 0, bullets: 0 };
    }
    const now = Date.now();
    const last = n((player as any).lastEmpirePayout, 0);
    // First call just starts the clock (no double-pay on mount).
    if (last <= 0) {
      await ctx.db.patch(player._id, { lastEmpirePayout: now });
      return { collected: false, periods: 0, cash: 0, points: 0, bullets: 0 };
    }
    const periods = Math.floor((now - last) / (24 * 3600000));
    if (periods < 1) return { collected: false, periods: 0, cash: 0, points: 0, bullets: 0 };
    // Cap accrual at 7 days so long absences don't dump infinite wealth.
    const capped = Math.min(periods, 7);
    const cash = Array.from({ length: districtsCompleted }, (_, i) => DISTRICT_CASH[i] ?? 15_000).reduce((a, b) => a + b, 0) * capped;
    const points = districtsCompleted * 25 * capped;
    const bullets = districtsCompleted * 150 * capped;

    const patch: any = {
      money: n(player.money, 0) + cash,
      points: n(player.points, 0) + points,
      bullets: n(player.bullets, 0) + bullets,
      lastEmpirePayout: last + capped * 24 * 3600000,
    };
    // Empire income also feeds talent points (1 city point per district per day).
    patch.talentPoints = n((player as any).talentPoints, 0) + districtsCompleted * capped;
    await ctx.db.patch(player._id, patch);
    return { collected: true, periods: capped, cash, points, bullets };
  },
});

// ═══════════════════════ HEIST ═══════════════════════

export const getHeistState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    return {
      money: n(player.money, 0),
      energy: n((player as any).energy, 100),
      lastHeistAt: n((player as any).lastHeistAt, 0),
      heistsTotal: n((player as any).heistsTotal, 0),
      heistsSuccess: n((player as any).heistsSuccess, 0),
      heistsFailed: n((player as any).heistsFailed, 0),
      heistProfit: n((player as any).heistProfit, 0),
    };
  },
});

export const executeHeist = mutation({
  args: { jobId: v.string(), crewId: v.string(), equipmentId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player as any).inPrison) throw new Error("You cannot plan heists from prison");
    if ((player as any).isDead) throw new Error("Dead players cannot heist");

    const job = HEIST_JOBS.find((j) => j.id === args.jobId);
    const crew = HEIST_CREWS.find((c) => c.id === args.crewId);
    const equip = HEIST_EQUIPMENT.find((e) => e.id === args.equipmentId);
    if (!job || !crew || !equip) throw new Error("Invalid heist setup");

    const now = Date.now();
    const cooldownMs = n((player as any).heistTimerUntil, 0) > now ? Math.floor(equip.cooldown * 60000 * 0.5) : equip.cooldown * 60000;
    const lastHeist = n((player as any).lastHeistAt, 0);
    if (now - lastHeist < cooldownMs) {
      throw new Error(`Crew is still laying low — ${Math.ceil((cooldownMs - (now - lastHeist)) / 60000)}m left`);
    }
    const energyCost = 30;
    if (n((player as any).energy, 100) < energyCost) throw new Error("Not enough energy (need 30⚡)");
    const cost = crew.cost + equip.cost;
    if (n(player.money, 0) < cost) throw new Error("Not enough money for crew + equipment");

    const chanceBoost = n((player as any).heistChanceUntil, 0) > now;
    const chance = computeHeistChance(job, crew, equip, n(player.level, 1), chanceBoost);
    const success = Math.random() < chance;
    const payout = success ? Math.floor(job.min + Math.random() * (job.max - job.min)) : 0;
    const xpEarned = success ? Math.floor(payout / 50_000) + 200 : 60;

    const patch: any = {
      money: n(player.money, 0) - cost + payout,
      energy: Math.max(0, n((player as any).energy, 100) - energyCost),
      lastHeistAt: now,
      heistsTotal: n((player as any).heistsTotal, 0) + 1,
      heistProfit: n((player as any).heistProfit, 0) + payout - cost,
      totalCrimes: n(player.totalCrimes, 0) + 1,
      ...(await addXpAndCheckLevel(ctx, player, xpEarned)),
    };
    if (success) {
      patch.heistsSuccess = n((player as any).heistsSuccess, 0) + 1;
      // Cash boost perk (Double Pay) multiplies heist take.
      if (n((player as any).cashBoostUntil, 0) > now) {
        const bonus = payout; // Double Pay doubles it: pay the bonus on top.
        patch.money = n(player.money, 0) - cost + payout + bonus;
      }
    } else {
      patch.heistsFailed = n((player as any).heistsFailed, 0) + 1;
      // Small chance to get caught on a failed heist.
      if (Math.random() < 0.15) {
        patch.inPrison = true;
        patch.prisonTime = 45_000 + Math.floor(Math.random() * 30_000);
      }
    }
    await ctx.db.patch(player._id, patch);
    return {
      success,
      job: job.name,
      crew: crew.name,
      payout,
      cost,
      xp: xpEarned,
      chance,
      arrested: patch.inPrison === true,
    };
  },
});

// ═══════════════════════ PRISON BUST ═══════════════════════

export const getPrisonBust = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const bots = await ctx.db.query("prisonBots").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    const stats = ((player as any).bustStats ?? {}) as { attempts?: number; success?: number; failed?: number; profit?: number };
    return {
      attempts: n(stats.attempts, 0),
      success: n(stats.success, 0),
      failed: n(stats.failed, 0),
      profit: n(stats.profit, 0),
      bustReward: n((player as any).bustReward, 0),
      inPrison: !!(player as any).inPrison,
      bots: bots.map((b: any) => ({ _id: b._id, name: b.name, sentence: b.sentence, reward: b.reward })),
    };
  },
});

export const generateBustBots = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const existing = await ctx.db.query("prisonBots").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    // Refresh the board: deactivate old bots and create a fresh set of 6–9.
    for (const b of existing) await ctx.db.patch(b._id, { active: false });
    const count = 6 + Math.floor(Math.random() * 4);
    const FIRST = ["Rico", "Tony", "Vinnie", "Sal", "Frank", "Luca", "Mickey", "Angelo", "Bruno", "Carmine", "Nicky", "Paulie"];
    const LAST = ["Moretti", "Banana Nose", "The Ox", "Two-Times", "Fish", "The Whale", "Knuckles", "Cheeks", "Lips", "The Priest", "Shaky", "Glasses"];
    const level = n(player.level, 1);
    for (let i = 0; i < count; i++) {
      const sentence = 20_000 + Math.floor(Math.random() * 40_000);
      const scale = 1 + level * 0.05;
      const reward = Math.floor((5_000 + Math.random() * 25_000) * scale);
      await ctx.db.insert("prisonBots", {
        name: `${FIRST[Math.floor(Math.random() * FIRST.length)]} "${LAST[Math.floor(Math.random() * LAST.length)]}"`,
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
    if ((player as any).inPrison) throw new Error("You're in prison — you can't bust others out");
    const bot = await ctx.db.get(args.botId);
    if (!bot || !bot.active) throw new Error("This inmate is gone");
    const now = Date.now();
    const boost = n((player as any).bustBoostUntil, 0) > now ? 0.15 : 0;
    const successChance = Math.min(0.85, 0.55 + boost + n(player.level, 1) * 0.002);
    const success = Math.random() < successChance;

    const stats = { ...(((player as any).bustStats ?? {}) as any) };
    stats.attempts = n(stats.attempts, 0) + 1;
    const patch: any = { bustStats: stats, energy: Math.max(0, n((player as any).energy, 100) - 8) };

    if (success) {
      const reward = Math.floor(bot.reward * (1 + (n((player as any).cashBoostUntil, 0) > now ? 1 : 0)));
      stats.success = n(stats.success, 0) + 1;
      stats.profit = n(stats.profit, 0) + reward;
      patch.money = n(player.money, 0) + reward;
      patch.bustStats = stats;
      await ctx.db.patch(bot._id, { active: false });
      const xp = await addXpAndCheckLevel(ctx, player, 100 + Math.floor(reward / 10_000));
      Object.assign(patch, xp);
      await ctx.db.patch(player._id, patch);
      return { success: true, reward };
    }
    stats.failed = n(stats.failed, 0) + 1;
    patch.bustStats = stats;
    // Getting caught attempting a bust risks jail time.
    if (Math.random() < 0.2) {
      patch.inPrison = true;
      patch.prisonTime = 30_000 + Math.floor(Math.random() * 20_000);
    }
    await ctx.db.patch(player._id, patch);
    return { success: false, reward: 0 };
  },
});

export const setBustReward = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.max(0, Math.floor(args.amount));
    if (amount > n(player.money, 0)) throw new Error("You can't set a reward larger than your cash");
    await ctx.db.patch(player._id, { bustReward: amount });
    return { success: true, amount };
  },
});

export const prisonLeave = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (!(player as any).inPrison) throw new Error("You're not in prison");
    // Jail Immunity perk: a stocked immunity covers the 2-point walk-out fee.
    if (n((player as any).jailImmunityCount, 0) > 0) {
      await ctx.db.patch(player._id, { inPrison: false, prisonTime: 0, jailImmunityCount: n((player as any).jailImmunityCount, 0) - 1 });
      return { success: true, usedImmunity: true };
    }
    if (n(player.points, 0) < 2) throw new Error("Leaving prison costs 2 points");
    await ctx.db.patch(player._id, { inPrison: false, prisonTime: 0, points: n(player.points, 0) - 2 });
    return { success: true, usedImmunity: false };
  },
});

// ═══════════════════════ PROMO CODES ═══════════════════════

export const getActivePromo = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const now = Date.now();
    // promoCodes is tiny — full scan + JS filter (the by_code index only covers
    // the code field, so it cannot filter on expiresAt).
    const promos = await ctx.db.query("promoCodes").collect();
    const active = promos
      .filter((p: any) => p.active && p.expiresAt > now)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
    if (!active) return null;
    // Hide the code from players who already redeemed it.
    if (player && Array.isArray((player as any).redeemedPromos) && (player as any).redeemedPromos.includes(active.code)) {
      return { ...active, code: "", redeemed: true };
    }
    return { ...active, redeemed: false };
  },
});

export const getMyPromos = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const now = Date.now();
    const promos = await ctx.db.query("promoCodes").collect();
    const active = promos.filter((p: any) => p.active && p.expiresAt > now).sort((a: any, b: any) => b.createdAt - a.createdAt)[0] ?? null;
    const history = player ? ((player as any).promoHistory ?? []) : [];
    return { active, history };
  },
});

export const redeemPromoCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const code = args.code.trim().toUpperCase();
    if (!code) throw new Error("Enter a code");
    // collect + find (NOT .unique(): unique() throws a raw Convex error when no
    // row matches, which would mask the friendly "Invalid code" message).
    const all = await ctx.db.query("promoCodes").withIndex("by_code", (q: any) => q.eq("code", code)).collect();
    const promo = all[0];
    if (!promo || !promo.active) throw new Error("Invalid code");
    if (promo.expiresAt < Date.now()) throw new Error("This code has expired");

    const redeemed = Array.isArray((player as any).redeemedPromos) ? (player as any).redeemedPromos : [];
    if (redeemed.includes(code)) throw new Error("You already claimed this code");

    const now = Date.now();
    const patch: any = {
      money: n(player.money, 0) + 250_000,
      points: n(player.points, 0) + 250,
      coins: n(player.coins, 0) + 25,
      redeemedPromos: [...redeemed, code],
      promoHistory: [{ code, message: promo.message, rewardLabel: promo.rewardLabel, at: now }, ...(((player as any).promoHistory ?? []) as any[])].slice(0, 25),
    };

    // Perks attached to the code: timed perks stack, instant perks add stock.
    const perks = (promo.perks ?? {}) as Record<string, number>;
    const perkStock = { ...(((player as any).perks ?? {}) as Record<string, number>) };
    for (const [perkId, qtyRaw] of Object.entries(perks)) {
      const qty = Math.max(0, Math.floor(Number(qtyRaw) || 0));
      if (qty < 1) continue;
      const hourMs = 3600000;
      switch (perkId) {
        case "doubleXp": patch.xpBoostUntil = Math.max(n((player as any).xpBoostUntil, 0), now) + hourMs * qty; break;
        case "doublePay": patch.cashBoostUntil = Math.max(n((player as any).cashBoostUntil, 0), now) + hourMs * qty; break;
        case "heistChance": patch.heistChanceUntil = Math.max(n((player as any).heistChanceUntil, 0), now) + hourMs * qty; break;
        case "heistTimer": patch.heistTimerUntil = Math.max(n((player as any).heistTimerUntil, 0), now) + hourMs * qty; break;
        case "bustBoost": patch.bustBoostUntil = Math.max(n((player as any).bustBoostUntil, 0), now) + hourMs * qty; break;
        case "gtaRarity": patch.gtaRarityUntil = Math.max(n((player as any).gtaRarityUntil, 0), now) + hourMs * qty; break;
        case "meltValue": patch.meltValueUntil = Math.max(n((player as any).meltValueUntil, 0), now) + 24 * 3600000 * qty; break;
        case "meltLimit": patch.meltLimitUntil = Math.max(n((player as any).meltLimitUntil, 0), now) + 24 * 3600000 * qty; break;
        case "jailImmunity": patch.jailImmunityCount = n((player as any).jailImmunityCount, 0) + qty; break;
        case "autoRank": {
          const prevUntil = Math.max(n((player as any).autoRankUntil, 0), now);
          patch.autoRankUntil = prevUntil + hourMs * qty;
          patch.autoRankAppliedAt = Math.max(n((player as any).autoRankAppliedAt, 0), now);
          break;
        }
        case "supplyUnit":
          patch.bullets = n(player.bullets, 0) + 100 * qty;
          patch.energy = Math.min(100, n((player as any).energy, 100) + 25 * qty);
          break;
        default:
          perkStock[perkId] = (perkStock[perkId] ?? 0) + qty;
      }
    }
    if (Object.keys(perkStock).length > 0 || (player as any).perks) patch.perks = perkStock;

    // Claimed objectives + a small talent point gift.
    patch.objectivesClaimed = (() => {
      const claimed = { ...(((player as any).objectivesClaimed ?? {}) as Record<string, boolean>) };
      for (const k of Object.keys(claimed)) claimed[k] = true;
      return claimed;
    })();
    patch.talentPoints = n((player as any).talentPoints, 0) + 2;

    await ctx.db.patch(player._id, patch);
    await ctx.db.patch(promo._id, { claimed: n(promo.claimed, 0) + 1 });
    return { success: true, promo: code, rewardLabel: promo.rewardLabel, money: 250_000, coinBonus: 25, perks };
  },
});

export const createPromoCode = mutation({
  args: {
    code: v.string(),
    message: v.string(),
    rewardLabel: v.string(),
    expiresHours: v.number(),
    perks: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.role !== "admin") throw new Error("Admin only!");
    const code = args.code.trim().toUpperCase();
    if (code.length < 3) throw new Error("Code must be at least 3 characters");
    const hours = Math.max(1, Math.min(24 * 30, Math.floor(args.expiresHours)));
    const existing = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q: any) => q.eq("code", code))
      .collect();
    if (existing.length > 0) throw new Error(`Code ${code} already exists`);
    await ctx.db.insert("promoCodes", {
      code,
      message: args.message || `Redeem ${code} for free rewards!`,
      rewardLabel: args.rewardLabel || "Bonus rewards",
      expiresAt: Date.now() + hours * 3600000,
      createdBy: player._id,
      createdAt: Date.now(),
      active: true,
      claimed: 0,
      perks: args.perks ?? {},
    });
    return { success: true, code };
  },
});

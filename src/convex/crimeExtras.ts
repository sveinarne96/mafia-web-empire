import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { applyIntelligence, trainingWage } from "./intelligence";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

function notify(ctx: any, userId: any, message: string) {
  return ctx.db
    .insert("notifications", { userId, type: "crime", message, read: false, timestamp: Date.now() })
    .catch(() => {});
}

// ═══════════════════════════════════════════════════════════
// BULLET FACTORY — craft bullets from lead + cash
// ═══════════════════════════════════════════════════════════
export const getBulletFactoryState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    return {
      bullets: player.bullets ?? 0,
      lead: (player as any).lead ?? 0,
      factoryLevel: (player as any).bulletFactoryLevel ?? 1,
      totalCrafted: (player as any).bulletsCrafted ?? 0,
      // Lead cost per bullet decreases with factory level
      leadPerBullet: Math.max(1, 3 - Math.floor(((player as any).bulletFactoryLevel ?? 1) / 2)),
      cashPerBullet: Math.max(50, 250 - (((player as any).bulletFactoryLevel ?? 1) - 1) * 25),
      upgradeCost: 25000 * ((player as any).bulletFactoryLevel ?? 1),
    };
  },
});

export const buyLead = mutation({
  args: { qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const qty = Math.max(1, Math.min(10000, Math.floor(args.qty)));
    const pricePerUnit = 75;
    const cost = qty * pricePerUnit;
    if ((player.money ?? 0) < cost) throw new Error(`Not enough cash — need $${cost.toLocaleString()}`);
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost,
      lead: ((player as any).lead ?? 0) + qty,
    } as any);
    return { bought: qty, cost, lead: ((player as any).lead ?? 0) + qty };
  },
});

export const craftBullets = mutation({
  args: { qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const qty = Math.max(1, Math.min(10000, Math.floor(args.qty)));
    const level = (player as any).bulletFactoryLevel ?? 1;
    const leadPer = Math.max(1, 3 - Math.floor(level / 2));
    const cashPer = Math.max(50, 250 - (level - 1) * 25);
    const leadNeeded = qty * leadPer;
    const cashNeeded = qty * cashPer;
    if (((player as any).lead ?? 0) < leadNeeded) throw new Error(`Not enough lead — need ${leadNeeded.toLocaleString()}`);
    if ((player.money ?? 0) < cashNeeded) throw new Error(`Not enough cash — need $${cashNeeded.toLocaleString()}`);
    await ctx.db.patch(player._id, {
      lead: ((player as any).lead ?? 0) - leadNeeded,
      money: (player.money ?? 0) - cashNeeded,
      bullets: (player.bullets ?? 0) + qty,
      bulletsCrafted: ((player as any).bulletsCrafted ?? 0) + qty,
    } as any);
    return { crafted: qty, leadUsed: leadNeeded, cashUsed: cashNeeded, bullets: (player.bullets ?? 0) + qty };
  },
});

export const upgradeBulletFactory = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const level = (player as any).bulletFactoryLevel ?? 1;
    const cost = 25000 * level;
    if ((player.money ?? 0) < cost) throw new Error(`Upgrade costs $${cost.toLocaleString()}`);
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - cost,
      bulletFactoryLevel: level + 1,
    } as any);
    return { level: level + 1, cost };
  },
});

// ═══════════════════════════════════════════════════════════
// SHOOTING RANGE — spend bullets + cash for accuracy (attack) XP
// ═══════════════════════════════════════════════════════════
export const getRangeState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const acc = (player as any).accuracy ?? 0;
    return {
      accuracy: acc,
      accuracyLevel: Math.floor(acc / 10),
      bullets: player.bullets ?? 0,
      attack: player.attack ?? 10,
      totalShots: (player as any).rangeShots ?? 0,
      drillsToday: (player as any).rangeDrillsToday ?? 0,
      nextDrillCost: 10,
    };
  },
});

export const runRangeDrill = mutation({
  args: { drill: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const drills: Record<string, { bullets: number; cost: number; accGain: [number, number]; atkChance: number }> = {
      target_practice: { bullets: 10, cost: 1000, accGain: [1, 3], atkChance: 0.3 },
      moving_targets: { bullets: 25, cost: 5000, accGain: [2, 5], atkChance: 0.5 },
    };
    const d = drills[args.drill];
    if (!d) throw new Error("Unknown drill!");
    if ((player.bullets ?? 0) < d.bullets) throw new Error(`Need ${d.bullets} bullets for this drill`);
    if ((player.money ?? 0) < d.cost) throw new Error(`Need $${d.cost.toLocaleString()} for range fees`);
    const accGain = d.accGain[0] + Math.floor(Math.random() * (d.accGain[1] - d.accGain[0] + 1));
    const newAcc = Math.min(100, ((player as any).accuracy ?? 0) + accGain);
    const atkUp = Math.random() < d.atkChance;
    await ctx.db.patch(player._id, {
      bullets: (player.bullets ?? 0) - d.bullets,
      money: (player.money ?? 0) - d.cost,
      accuracy: newAcc,
      attack: atkUp ? (player.attack ?? 10) + 1 : (player.attack ?? 10),
      rangeShots: ((player as any).rangeShots ?? 0) + d.bullets,
      rangeDrillsToday: ((player as any).rangeDrillsToday ?? 0) + 1,
    } as any);
    return {
      accGain,
      accuracy: newAcc,
      attackUp: atkUp,
      shotsFired: d.bullets,
      bullseye: Math.random() < 0.25,
    };
  },
});

// ═══════════════════════════════════════════════════════════
// DETECTIVES — hire investigators to hunt a rival
// ═══════════════════════════════════════════════════════════
export const getDetectiveState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const cases = await ctx.db
      .query("detectiveCases")
      .withIndex("by_hirer", (q: any) => q.eq("hirerId", player._id))
      .order("desc")
      .take(10);
    return {
      detectivesHired: (player as any).detectivesHired ?? 0,
      cases,
      money: player.money ?? 0,
    };
  },
});

export const hireDetective = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (args.targetId === player._id) throw new Error("You can't investigate yourself!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    const cost = 15000;
    if ((player.money ?? 0) < cost) throw new Error("Hiring a detective costs $15,000");
    const found = Math.random() < 0.55;
    const intel: string[] = [];
    if (found) {
      intel.push(`Location: ${target.location ?? "Unknown"}`);
      intel.push(`Cash on hand: ~$${Math.max(0, (target.money ?? 0) + Math.floor(Math.random() * 5000) - 2500).toLocaleString()}`);
      if ((target.wantedLevel ?? 0) > 0) intel.push(`Wanted level: ${target.wantedLevel}`);
      if (target.inPrison) intel.push("Currently in prison");
      if ((target.familyId ?? null) !== null) intel.push("Member of a family");
      intel.push(`Last seen online recently`);
    }
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost, detectivesHired: ((player as any).detectivesHired ?? 0) + 1 } as any);
    await ctx.db.insert("detectiveCases", {
      hirerId: player._id,
      targetId: args.targetId,
      targetName: target.nickname ?? "Unknown",
      result: found ? "intel" : "cold_trail",
      intel,
      createdAt: Date.now(),
    });
    if (found) {
      await notify(ctx, args.targetId, `🕵️ A detective was spotted asking around about you...`);
    }
    return { found, intel };
  },
});

// ═══════════════════════════════════════════════════════════
// BOXING / GYM — train stats with energy cost
// ═══════════════════════════════════════════════════════════
export const trainGym = mutation({
  args: { stat: v.union(v.literal("attack"), v.literal("defense")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const energyCost = 10;
    const energy = typeof (player as any).energy === "number" ? (player as any).energy : 100;
    if (energy < energyCost) throw new Error("Not enough energy — rest a bit first!");
    const gain = 1 + Math.floor(Math.random() * 2);
    // INTELLIGENCE: +1% XP & cash bonus per 5 levels applies to all training.
    const intelXP = applyIntelligence(5, (player as any).level ?? 1, 1);
    const wage = trainingWage((player as any).level ?? 1, 1);
    const xp = await addXpAndCheckLevel(ctx, player, intelXP);
    const patch: any = { energy: energy - energyCost, money: (player.money ?? 0) + wage };
    if (args.stat === "attack") patch.attack = (player.attack ?? 10) + gain;
    else patch.defense = (player.defense ?? 10) + gain;
    await ctx.db.patch(player._id, { ...patch, ...xp });
    return { stat: args.stat, gain, energyCost, wage, intelBonusPct: Math.floor(((player as any).level ?? 1) / 5), levelUp: (xp as any)?.levelUp ?? false };
  },
});

// ═══════════════════════════════════════════════════════════
// POLICE CHASE — escape with dirty money or get busted
// ═════════════════════════════════════════════════
export const policeChase = mutation({
  args: { stake: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const stake = Math.max(0, Math.floor(args.stake));
    if ((player.money ?? 0) < stake) throw new Error("Not enough cash to put on the line!");
    // Higher stakes = bigger payoff but cops bring more units
    const escapeChance = Math.max(0.35, 0.75 - (stake / 2_000_000) * 0.4);
    const escaped = Math.random() < escapeChance;
    if (escaped) {
      const payout = Math.floor(stake * (1.5 + Math.random() * 1.5)); // 1.5x–3x
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) + payout,
        chasesWon: ((player as any).chasesWon ?? 0) + 1,
        wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 1),
        lastCrimeAt: Date.now(),
      } as any);
      return { escaped: true, payout, wantedGained: 1, chance: escapeChance };
    }
    // Busted: lose the stake, possible jail time
    const jailTime = Math.random() < 0.4 ? 30000 : 0;
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - stake,
      chasesLost: ((player as any).chasesLost ?? 0) + 1,
      inPrison: jailTime > 0,
      prisonTime: jailTime,
      lastCrimeAt: Date.now(),
    } as any);
    return { escaped: false, lost: stake, jailTime, chance: escapeChance };
  },
});

// ═══════════════════════════════════════════════════════════
// SCRAPYARD — buy wrecks, strip for scrap, sell or salvage parts
// ═══════════════════════════════════════════════════════════
export const getScrapyardState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const wrecks = await ctx.db
      .query("scrapWrecks")
      .withIndex("by_owner", (q: any) => q.eq("ownerId", player._id))
      .collect();
    return {
      scrap: (player as any).scrapMetal ?? 0,
      rareParts: (player as any).rareParts ?? 0,
      wrecks,
      money: player.money ?? 0,
    };
  },
});

export const buyWreck = mutation({
  args: { tier: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const tiers: Record<string, { cost: number; name: string; scrap: [number, number]; rareChance: number }> = {
      sedan: { cost: 5000, name: "Rusted Sedan", scrap: [10, 30], rareChance: 0.05 },
      suv: { cost: 25000, name: "Wrecked SUV", scrap: [30, 80], rareChance: 0.12 },
      luxury: { cost: 100000, name: "Crashed Luxury", scrap: [80, 200], rareChance: 0.25 },
      exotic: { cost: 500000, name: "Totaled Exotic", scrap: [200, 500], rareChance: 0.45 },
    };
    const t = tiers[args.tier];
    if (!t) throw new Error("Unknown wreck tier!");
    if ((player.money ?? 0) < t.cost) throw new Error(`That wreck costs $${t.cost.toLocaleString()}`);
    const scrap = t.scrap[0] + Math.floor(Math.random() * (t.scrap[1] - t.scrap[0] + 1));
    const rare = Math.random() < t.rareChance;
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - t.cost,
      scrapMetal: ((player as any).scrapMetal ?? 0) + scrap,
      rareParts: rare ? ((player as any).rareParts ?? 0) + 1 : ((player as any).rareParts ?? 0),
      wrecksStripped: ((player as any).wrecksStripped ?? 0) + 1,
    } as any);
    await ctx.db.insert("scrapWrecks", {
      ownerId: player._id,
      tier: args.tier,
      name: t.name,
      scrapYield: scrap,
      rareFound: rare,
      createdAt: Date.now(),
    });
    return { name: t.name, scrap, rare };
  },
});

export const sellScrap = mutation({
  args: { qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const qty = Math.max(1, Math.floor(args.qty));
    if (((player as any).scrapMetal ?? 0) < qty) throw new Error("Not enough scrap!");
    const pricePerUnit = 350;
    const payout = qty * pricePerUnit;
    await ctx.db.patch(player._id, {
      scrapMetal: ((player as any).scrapMetal ?? 0) - qty,
      money: (player.money ?? 0) + payout,
    } as any);
    return { sold: qty, payout };
  },
});

// ═══════════════════════════════════════════════════════════
// VAULT — deposit cash into a protected vault (immune to robbery)
// ═══════════════════════════════════════════════════════════
export const getVaultState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    return {
      vaulted: (player as any).vaultCash ?? 0,
      vaultLevel: (player as any).vaultLevel ?? 1,
      capacity: 1_000_000 * ((player as any).vaultLevel ?? 1),
      money: player.money ?? 0,
      bank: player.bank ?? 0,
      upgradeCost: 100_000 * ((player as any).vaultLevel ?? 1),
    };
  },
});

export const vaultDeposit = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const amt = Math.max(0, Math.floor(args.amount));
    if ((player.money ?? 0) < amt) throw new Error("Not enough cash!");
    const cap = 1_000_000 * ((player as any).vaultLevel ?? 1);
    if (((player as any).vaultCash ?? 0) + amt > cap) throw new Error(`Vault is full — capacity $${cap.toLocaleString()}`);
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) - amt,
      vaultCash: ((player as any).vaultCash ?? 0) + amt,
    } as any);
    return { vaulted: ((player as any).vaultCash ?? 0) + amt };
  },
});

export const vaultWithdraw = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const amt = Math.max(0, Math.floor(args.amount));
    if (((player as any).vaultCash ?? 0) < amt) throw new Error("Not enough in vault!");
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + amt,
      vaultCash: ((player as any).vaultCash ?? 0) - amt,
    } as any);
    return { vaulted: ((player as any).vaultCash ?? 0) - amt };
  },
});

export const upgradeVault = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const level = (player as any).vaultLevel ?? 1;
    const cost = 100_000 * level;
    if ((player.money ?? 0) < cost) throw new Error(`Upgrade costs $${cost.toLocaleString()}`);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost, vaultLevel: level + 1 } as any);
    return { level: level + 1, cost };
  },
});

// ═══════════════════════════════════════════════════════════
// HITLIST — active bounties other players can hunt
// ═══════════════════════════════════════════════════════════
export const getActiveBounties = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("bounties")
      .withIndex("by_active", (q) => q.eq("active", true))
      .order("desc")
      .take(50);
    const out: any[] = [];
    for (const b of rows) {
      const target: any = b.targetId ? await ctx.db.get(b.targetId) : null;
      const placer: any = b.placerId ? await ctx.db.get(b.placerId) : null;
      if (!target || target.isDead) continue;
      out.push({
        _id: b._id,
        reward: b.reward ?? 0,
        createdAt: b.createdAt,
        targetId: b.targetId,
        targetName: target.nickname ?? target.username ?? "Unknown",
        targetLevel: target.level ?? 1,
        targetWanted: target.wantedLevel ?? 0,
        placedBy: placer?.nickname ?? "Anonymous",
      });
    }
    return out.sort((a, b) => b.reward - a.reward);
  },
});

// ═══════════════════════════════════════════════════════════
// CRIME ACHIEVEMENTS — personal record board for the crime hub
// ═══════════════════════════════════════════════════════════
export const getCrimeAchievements = query({
  args: {},
  handler: async (ctx) => {
    const player: any = await getCurrentUser(ctx);
    const crimes = await ctx.db
      .query("crimes")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
    const byType: Record<string, { total: number; won: number }> = {};
    for (const c of crimes) {
      const t = c.type ?? "other";
      byType[t] = byType[t] ?? { total: 0, won: 0 };
      byType[t].total++;
      if (c.success) byType[t].won++;
    }
    const stolenTotal = crimes.reduce((s: number, c: any) => s + (c.success ? c.moneyEarned ?? 0 : 0), 0);
    const streakBest = Math.max(0, (player as any).bestCrimeStreak ?? 0);
    const tiers = [
      { id: "rookie", name: "Rookie", icon: "🥚", need: 10 },
      { id: "hustler", name: "Hustler", icon: "🧢", need: 100 },
      { id: "operator", name: "Operator", icon: "🎩", need: 500 },
      { id: "kingpin", name: "Kingpin", icon: "👑", need: 2000 },
      { id: "legend", name: "Living Legend", icon: "🏆", need: 5000 },
    ];
    const total = crimes.length;
    const tier = [...tiers].reverse().find((t) => total >= t.need) ?? null;
    return {
      totalCrimes: total,
      successful: crimes.filter((c: any) => c.success).length,
      stolenTotal,
      streakBest,
      byType,
      tier,
      tiers,
    };
  },
});

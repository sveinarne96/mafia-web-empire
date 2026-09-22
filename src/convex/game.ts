import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { RESOURCE_COSTS } from "../data/resourceCosts"; // costs
import { GTA_LOOT, SH_LOOT } from "../data/crimes"; // specific vehicles/loot per job
import { getLiveModifiers } from "./gameControl"; // live admin console multipliers

// ===== SUPER BOOST WEEKEND LOOT HELPERS =====
// While the weekend boost is live every successful crime can drop extra cash,
// points, bullets, item packs and scraps on top of the doubled base rewards.
const _normPacks = (p: any) => {
  const o = p && typeof p === "object" ? { ...p } : {};
  return { common: o.common ?? 0, rare: o.rare ?? 0, epic: o.epic ?? 0, legendary: o.legendary ?? 0 };
};
const _normScraps = (s2: any) => {
  const o = s2 && typeof s2 === "object" ? { ...s2 } : {};
  return { common: o.common ?? 0, rare: o.rare ?? 0, epic: o.epic ?? 0 };
};
function rollWeekendLoot(sbActive: boolean, succeeded: boolean, moneyEarned: number, pointsEarned: number, baseReward: number) {
  if (!sbActive || !succeeded) return { bonusCash: 0, bonusPoints: 0, packs: [] as string[], scraps: [] as string[] };
  const bonusCash = Math.random() < 0.75 ? Math.max(1, Math.floor(moneyEarned * 0.25)) : 0;
  const bonusPoints = Math.random() < 0.75 ? Math.max(1, Math.floor((pointsEarned || baseReward * 0.1) * 0.2)) : 0;
  const packs: string[] = [];
  const pr = Math.random();
  if (pr < 0.008) packs.push("legendary");
  else if (pr < 0.033) packs.push("epic");
  else if (pr < 0.09) packs.push("rare");
  else if (pr < 0.2) packs.push("common");
  const scraps: string[] = [];
  const sr = Math.random();
  if (sr < 0.045) scraps.push("epic");
  else if (sr < 0.15) scraps.push("rare");
  else if (sr < 0.4) scraps.push("common", ...(Math.random() < 0.5 ? ["common"] : []));
  return { bonusCash, bonusPoints, packs, scraps };
}
async function applyWeekendDrops(ctx: any, player: any, roll: any) {
  if (!roll.bonusCash && !roll.bonusPoints && roll.packs.length === 0 && roll.scraps.length === 0) return;
  try {
    const fresh = await ctx.db.get(player._id);
    if (!fresh) return;
    const patch: Record<string, unknown> = {};
    if (roll.bonusCash) patch.money = (fresh.money ?? 0) + roll.bonusCash;
    if (roll.bonusPoints) patch.points = (fresh.points ?? 0) + roll.bonusPoints;
    if (roll.packs.length > 0) {
      const pp = _normPacks(fresh.packs);
      roll.packs.forEach((rk: string) => { pp[rk as keyof typeof pp] = (pp[rk as keyof typeof pp] ?? 0) + 1; });
      patch.packs = pp;
    }
    if (roll.scraps.length > 0) {
      const sp = _normScraps(fresh.scraps);
      roll.scraps.forEach((sk: string) => { sp[sk as keyof typeof sp] = (sp[sk as keyof typeof sp] ?? 0) + 1; });
      patch.scraps = sp;
    }
    await ctx.db.patch(fresh._id, patch as any);
  } catch (_sbErr) { /* bonus drop must never cancel the crime */ }
}

// ===== ENSURE PLAYER HAS ALL REQUIRED FIELDS (read-only defaults, no patch) =====
function ensurePlayerDefaults(player: any) {
  // NaN-safe helper
  const n = (v: any, d: number) => (typeof v === "number" && !isNaN(v)) ? v : d;
  return {
    ...player,
    money: n(player.money, 1000),
    bank: n(player.bank, 0),
    points: n(player.points, 0),
    life: n(player.life, 100),
    maxLife: n(player.maxLife, 100),
    level: n(player.level, 1),
    experience: n(player.experience, 0),
    attack: n(player.attack, 10),
    defense: n(player.defense, 10),
    inPrison: player.inPrison ?? false,
    isDead: player.isDead ?? false,
    totalCrimes: n(player.totalCrimes, 0),
    totalKills: n(player.totalKills, 0),
    totalDeaths: n(player.totalDeaths, 0),
    wantedLevel: n(player.wantedLevel, 0),
    prisonTime: n(player.prisonTime, 0),
    skillPoints: n(player.skillPoints, 0),
    levelUpPending: player.levelUpPending ?? false,
    crimeMomentum: n(player.crimeMomentum, 0),
    reputation: n(player.reputation, 0),
    prestige: n(player.prestige, 0),
    prestigeMultiplier: n(player.prestigeMultiplier, 1),
  };
}

// ===== PATCH MISSING FIELDS (mutation only) =====
async function ensurePlayerReady(ctx: { db: any }, player: any) {
  const patches: Record<string, unknown> = {};
  if (player.money === undefined) patches.money = 1000;
  if (player.life === undefined) patches.life = 100;
  if (player.maxLife === undefined) patches.maxLife = 100;
  if (player.level === undefined) patches.level = 1;
  if (player.experience === undefined) patches.experience = 0;
  if (player.attack === undefined) patches.attack = 10;
  if (player.defense === undefined) patches.defense = 10;
  if (player.inPrison === undefined) patches.inPrison = false;
  if (player.isDead === undefined) patches.isDead = false;
  if (player.totalCrimes === undefined) patches.totalCrimes = 0;
  if (player.totalKills === undefined) patches.totalKills = 0;
  if (player.totalDeaths === undefined) patches.totalDeaths = 0;
  if (player.wantedLevel === undefined) patches.wantedLevel = 0;
  if (player.prisonTime === undefined) patches.prisonTime = 0;
  if (player.skillPoints === undefined) patches.skillPoints = 0;
  if (player.levelUpPending === undefined) patches.levelUpPending = false;
  if (player.crimeMomentum === undefined) patches.crimeMomentum = 0;
  if (Object.keys(patches).length > 0) {
    await ctx.db.patch(player._id, patches);
    return { ...player, ...patches };
  }
  return player;
}

const XP_PER_LEVEL = 2000;

async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return ensurePlayerDefaults(user);
}

// Auto-release from prison when time is up (called by frontend timer)
export const releaseFromPrison = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { released: false };
    const player = await ctx.db.get(userId);
    if (!player) return { released: false };
    if (!player.inPrison) return { released: false };
    const prisonTimeMs = player.prisonTime ?? 15000;
    const timeSinceArrest = Date.now() - (player.lastCrimeAt ?? Date.now());
    if (timeSinceArrest >= prisonTimeMs) {
      await ctx.db.patch(userId, { inPrison: false, prisonTime: 0 });
      return { released: true };
    }
    return { released: false, remaining: prisonTimeMs - timeSinceArrest };
  },
});

export const getPlayer = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    // Allow through if registered via username/password OR via nickname
    if (!player.nickname && !player.username) return null;
    return player;
  },
});

export const getPlayerById = query({
  args: { playerId: v.id("users") },
  handler: async (ctx, args) => await ctx.db.get(args.playerId),
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    return players.filter((p: any) => p.nickname).sort((a: any, b: any) => (b.level ?? 0) - (a.level ?? 0)).slice(0, 50);
  },
});

export const getPlayersInLocation = query({
  args: { location: v.string() },
  handler: async (ctx, args) => await ctx.db.query("users").withIndex("by_location", (q) => q.eq("location", args.location)).collect(),
});

export const checkNickname = query({
  args: { nickname: v.string() },
  handler: async (ctx, args) => {
    const taken = (await ctx.db.query("users").withIndex("by_nickname", (q) => q.eq("nickname", args.nickname)).collect())[0];
    return { taken: !!taken };
  },
});

const classStats: Record<string, { attack: number; defense: number; life: number; money: number }> = {
  hitter:    { attack: 18, defense: 6,  life: 80,  money: 800 },
  thief:     { attack: 10, defense: 8,  life: 90,  money: 1500 },
  enforcer:  { attack: 12, defense: 16, life: 120, money: 700 },
  hustler:   { attack: 8,  defense: 10, life: 90,  money: 2500 },
};

export const registerPlayer = mutation({
  args: { nickname: v.string(), playerClass: v.union(v.literal("hitter"), v.literal("thief"), v.literal("enforcer"), v.literal("hustler")) },
  handler: async (ctx, args) => {
    try {
      const existing = await getCurrentUser(ctx);
      if (!existing) throw new Error("Not authenticated");
      if (existing.nickname) return { success: true, alreadyRegistered: true };
      // SERVER OPS: registration gate (admins always pass).
      const { isRegistrationOpen } = await import("./serverOps");
      if (!(await isRegistrationOpen(ctx)) && existing.role !== "admin") {
        throw new Error("🚫 Registration is currently closed by the administration.");
      }
      // If user already has username (registered via Auth page), just set nickname and class
      const stats = classStats[args.playerClass];
      const nicknameTaken = (await ctx.db.query("users").withIndex("by_nickname", (q) => q.eq("nickname", args.nickname)).collect())[0];
      if (nicknameTaken) throw new Error("Nickname already taken!");
      await ctx.db.patch(existing._id, {
        nickname: args.nickname, playerClass: args.playerClass,
        money: stats.money, bank: 0, points: 0, life: stats.life, maxLife: stats.life,
        defense: stats.defense, attack: stats.attack, level: 1, experience: 0, location: "New York",
        inPrison: false, prisonTime: 0, isDead: false, totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
        dailyRaidUsed: 0, lastDailyRaid: Date.now(), registeredAt: Date.now(), lastRegenAt: Date.now(),
        wantedLevel: 0, reputation: 0, reputationAlignment: "neutral", prestige: 0, prestigeMultiplier: 1,
        levelUpPending: false, skillPoints: 0,
        cellLevel: 1, solitaryTime: 0, contraband: 0, prisonCurrency: 0, paroleEligible: false,
        totalPrisonEscapes: 0, totalPrisonJobs: 0, totalEarned: stats.money, highestLevel: 1, totalPlaytime: 0,
        insuranceActive: false, loanAmount: 0, loanDueAt: 0, dirtyMoney: 0, counterfeitSkill: 0,
        smugglingRuns: 0, drugDeals: 0, racketeeringIncome: 0, loanSharkDebts: 0,
        witnessIntimidations: 0, identityThefts: 0, kidnappings: 0, arsons: 0, cargoThefts: 0,
        armsDeals: 0, illegalBoxingEvents: 0, pirateRadioBoost: 0, prostitutionRings: 0,
        gamblingDens: 0, protectionRackets: 0, lastBlackMarketRefresh: 0, totalLaundered: 0,
        armorDurability: 0, weaponProficiency: 0, killsThisSeason: 0, deathsThisSeason: 0,
        retaliationUntil: 0, lastDeathAt: 0, isKidnapped: false, betrayalCount: 0,
        totalGifting: 0, totalMentoring: 0, lastActive: Date.now(), lastCrimeAt: 0, isBanned: false,
        coins: 2, bullets: 0, robotBodyguards: [], accountUpgrades: {}, perks: {},
        seasonXp: 0, seasonTiersClaimed: [], vipUntil: 0, objectiveProgress: {},
        objectivesClaimed: {}, milestonesClaimed: {}, totalActions: 0,
        carsMelted: 0, carsRepaired: 0, legendaryRepaired: 0, epicRepaired: 0,
        rareRepaired: 0, commonRepaired: 0, totalRepairSpent: 0, lastAutoMelt: 0,
        meltLimitLevel: 0, starterClaimed: false, pointsSent: 0, pointsReceived: 0,
        packsOpened: 0, scratchCards: 0,
      });
      return { success: true };
    } catch (e) {
      // Never crash — return success so the user can proceed
      console.error("registerPlayer error:", e);
      return { success: true };
    }
  },
});

// ===== ACCOUNT RECOVERY =====
// A player signs in with a fresh auth identity (new anonymous/email session) but
// their old criminal is still alive in the database. Instead of forcing a brand
// new character, let them claim their existing one by nickname — this moves the
// old profile onto the current session and frees its old auth email.
export const claimExistingAccount = mutation({
  args: { nickname: v.string() },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    const name = args.nickname.trim();
    if (!name) throw new Error("Type your nickname to continue.");
    const existing = (await ctx.db
      .query("users")
      .withIndex("by_nickname", (q) => q.eq("nickname", name))
      .collect())[0];
    if (!existing) throw new Error(`No criminal named "${name}" was found. Check the spelling.`);
    if ((existing as any).isBotPlayer) throw new Error("That name belongs to a street contact, not a player account.");
    if (existing.isBanned) throw new Error("That account is banned and cannot be recovered here.");
    if ((existing as any)._id === (me as any)._id) return { success: true, alreadyYours: true };
    // Guard: someone else may already be signed in on that profile (session link).
    // Only ACTIVE (non-expired) sessions count — expired rows must not block recovery.
    const now = Date.now();
    const sessions = (await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", (existing as any)._id))
      .collect()).filter((s: any) => (s.expirationTime ?? 0) > now);
    if (sessions.length > 1) throw new Error("That account is currently linked to another active session.");
    // Merge the old character ONTO this session's profile row (keeps the auth
    // session valid) and delete the old shell row so nickname uniqueness holds.
    // ALL progression — money, bank, level, items, vehicles, perks — carries over.
    const old = existing as any;
    const cur = me as any;
    const carry = { ...old } as Record<string, unknown>;
    for (const k of ["_id", "_creationTime", "email", "emailVerificationTime", "tokenIdentifier", "isAnonymous", "authAccountIds", "sessions"]) delete carry[k];
    // Robust merge: old rows may contain fields that no longer exist in the
    // current schema — Convex rejects the whole patch if even one field is
    // invalid. Try the full patch first; on failure, merge field-by-field and
    // skip anything the schema no longer accepts. The claim must never fail.
    try {
      await ctx.db.patch(cur._id, carry as any);
    } catch {
      for (const [k, v] of Object.entries(carry)) {
        try { await ctx.db.patch(cur._id, { [k]: v } as any); } catch { /* stale field — skip */ }
      }
    }
    // Re-point the old row's inbox and alerts at the surviving profile so
    // nothing the player received is orphaned when the shell row is removed.
    const oldMsgs = await ctx.db.query("messages").withIndex("by_receiver", (q) => q.eq("receiverId", old._id)).collect();
    for (const m of oldMsgs) await ctx.db.patch(m._id, { receiverId: cur._id } as any);
    const sentMsgs = await ctx.db.query("messages").withIndex("by_sender", (q) => q.eq("senderId", old._id)).collect();
    for (const m of sentMsgs) await ctx.db.patch(m._id, { senderId: cur._id } as any);
    const oldAlerts = await ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", old._id)).collect();
    for (const n of oldAlerts) await ctx.db.patch(n._id, { userId: cur._id } as any);
    await ctx.db.delete(old._id);
    return { success: true, playerId: cur._id };
  },
});

export const awardActionXp = mutation({
  args: { amount: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const xp = await addXpAndCheckLevel(ctx, player, Math.max(1, Math.floor(args.amount ?? 10)));
    await ctx.db.patch(player._id, xp);
    return { success: true, ...xp };
  },
});

export const changeLocation = mutation({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.location === args.location) throw new Error("Already there!");
    await ctx.db.patch(player._id, { location: args.location });
  },
});


export const acknowledgeLevelUp = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    // Actually apply the level up: level+1, +10 ATK, +10 DEF, +75 HP
    if ((player.experience ?? 0) < XP_PER_LEVEL) throw new Error(`Need ${XP_PER_LEVEL} XP to rank up!`);
    const newLevel = (player.level ?? 1) + 1;
    const newMaxLife = (player.maxLife ?? 100) + 75;
    // Resource boost on rankup
    const maxE = (player as any).maxEnergy ?? 100;
    const maxS = (player as any).maxStamina ?? 100;
    const maxF = (player as any).maxFocus ?? 100;
    const maxM = (player as any).maxMorale ?? 100;
    await ctx.db.patch(userId, {
      level: newLevel,
      levelUpPending: false,
      skillPoints: (player.skillPoints ?? 0) + 1,
      attack: (player.attack ?? 10) + 10,
      defense: (player.defense ?? 10) + 10,
      maxLife: newMaxLife,
      life: newMaxLife,
      highestLevel: Math.max(player.highestLevel ?? 0, newLevel),
      experience: Math.max(0, (player.experience ?? 0) - XP_PER_LEVEL),
      energy: maxE,
      stamina: maxS,
      focus: maxF,
      morale: maxM,
    } as any);
    return { success: true, newLevel };
  },
});

// Helper: record a player action for the XP Volume system (rolling 1h window).
// Called by addXpAndCheckLevel, so every action that grants XP counts toward volume.
export async function recordPlayerAction(ctx: any, player: any): Promise<number[]> {
  const now = Date.now();
  const timestamps: number[] = Array.isArray((player as any).actionTimestamps)
    ? ((player as any).actionTimestamps as unknown[]).filter((t): t is number => typeof t === "number" && Number.isFinite(t) && now - t < 3600000)
    : [];
  const trimmed = [...timestamps, now].slice(-1000);
  (player as any).actionTimestamps = trimmed;
  return trimmed;
}

// Helper: add XP and check for level-up
export async function addXpAndCheckLevel(ctx: any, player: any, xpAmount: number) {
  // SERVER OPS: LIVE EVENT — 2x to 10x Ranking. Doubles-to-10xs all
  // server-managed rank XP from crime, car theft, missions, and film production.
  const { getRankEventMultiplier } = await import("./serverOps");
  const rankEventMult = await getRankEventMultiplier(ctx);
  // XP Volume Bonus: more actions in the last hour = higher multiplier.
  // This call also RECORDS the action (pushes now into the rolling window), so
  // every XP-granting action across all modules automatically counts toward volume.
  const recent = await recordPlayerAction(ctx, player);
  const actionCount = recent.length - 1; // exclude the action being recorded right now
  let volMult = 1.0;
  if (actionCount >= 500) volMult = 8.0;
  else if (actionCount >= 300) volMult = 6.0;
  else if (actionCount >= 200) volMult = 5.0;
  else if (actionCount >= 150) volMult = 4.0;
  else if (actionCount >= 100) volMult = 3.5;
  else if (actionCount >= 75) volMult = 3.0;
  else if (actionCount >= 50) volMult = 2.5;
  else if (actionCount >= 30) volMult = 2.0;
  else if (actionCount >= 15) volMult = 1.5;
  else if (actionCount >= 5) volMult = 1.25;
  const finalXP = Math.floor(xpAmount * volMult * rankEventMult);
  let remaining = (player.experience ?? 0) + finalXP;
  let lvl = player.level ?? 1;
  const updates: Record<string, any> = {};
  // O(1) rank-up math: compute levels in one step (no per-level loop) so huge XP can never time out.
  const levels = Math.floor(remaining / XP_PER_LEVEL);
  let leveled = false;
  if (levels > 0) {
    remaining = remaining % XP_PER_LEVEL;
    lvl += levels;
    leveled = true;
    updates.attack = (player.attack ?? 10) + 10 * levels;
    updates.defense = (player.defense ?? 10) + 10 * levels;
    updates.maxLife = (player.maxLife ?? 100) + 75 * levels;
    updates.life = updates.maxLife;
    updates.skillPoints = (player.skillPoints ?? 0) + levels;
    updates.energy = 100;
  }
  if (leveled) {
    return { experience: remaining, level: lvl, levelUpPending: false, highestLevel: Math.max(player.highestLevel ?? 0, lvl), actionTimestamps: (player as any).actionTimestamps, ...updates };
  }
  return { experience: remaining, life: (player.life ?? 100), actionTimestamps: (player as any).actionTimestamps };
}

export const commitCrime = mutation({
  args: { type: v.union(v.literal("car_theft"), v.literal("burglarize"), v.literal("rob_player")), targetId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");
    const liveCfg = await getLiveModifiers(ctx);
    if (liveCfg.maintenanceMode) throw new Error(liveCfg.maintenanceMessage);
    const storedEnergy = typeof (player as any).energy === "number" && Number.isFinite((player as any).energy) ? (player as any).energy : 100;
    const lastEnergyRegen = typeof (player as any).lastEnergyRegen === "number" ? (player as any).lastEnergyRegen : Date.now();
    const regeneratedEnergy = Math.min(100, storedEnergy + Math.floor(Math.max(0, Date.now() - lastEnergyRegen) / 60000) * (liveCfg.energyRegenPerMinute ?? 5));
    let moneyEarned = 0, pointsEarned = 0, damageTaken = 0;
    // Base success chance + any live crime-success bonus from the admin console
    const success = Math.random() < 0.95 + (liveCfg.crimeSuccessBonus ?? 0);
    // Mission-board action counters for street ops (GTA / burglary)
    const missionCounters: Record<string, number> = success
      ? args.type === "car_theft"
        ? { totalGta: ((player as any).totalGta ?? 0) + 1 }
        : args.type === "burglarize"
          ? { burglaries: ((player as any).burglaries ?? 0) + 1 }
          : {}
      : {};
    switch (args.type) {
      case "car_theft": moneyEarned = success ? Math.floor((Math.floor(Math.random() * 5000) + 500) * liveCfg.cashMultiplier) : 0; pointsEarned = success ? Math.floor((Math.floor(Math.random() * 151) + 50) * liveCfg.xpMultiplier) : 0; damageTaken = success ? 0 : Math.floor(Math.random() * 20) + 5; break;
      case "burglarize": moneyEarned = success ? Math.floor((Math.floor(Math.random() * 3000) + 200) * liveCfg.cashMultiplier) : 0; pointsEarned = success ? Math.floor((Math.floor(Math.random() * 151) + 50) * liveCfg.xpMultiplier) : 0; damageTaken = success ? 0 : Math.floor(Math.random() * 15) + 5; break;
      case "rob_player": if (!args.targetId) throw new Error("Target required"); const target = await ctx.db.get(args.targetId); if (!target) throw new Error("Target not found"); moneyEarned = success ? Math.floor((target.money ?? 0) * 0.1 * liveCfg.cashMultiplier) : 0; pointsEarned = success ? Math.floor((Math.floor(Math.random() * 151) + 50) * liveCfg.xpMultiplier) : 0; damageTaken = success ? 0 : Math.floor(Math.random() * 30) + 10; break;
    }
    // SUPER BOOST: 75% chance for criminal actions to drop bullets (scaled to the haul)
    const bulletDrop = liveCfg.superBoostActive && success && Math.random() < 0.75
      ? Math.min(10000, Math.max(1, Math.floor(moneyEarned / 25)))
      : 0;
    const _sbRoll = rollWeekendLoot(liveCfg.superBoostActive, success, moneyEarned, pointsEarned, 0);
        // Arrest is separate from crime success; only 10% of failed attempts lead to arrest.
    const arrested = !success && Math.random() < 0.10;
    await ctx.db.insert("crimes", { userId: player._id, type: args.type, target: args.type === "rob_player" ? (args.targetId ?? "unknown") : "environment", success, moneyEarned, pointsEarned, damageTaken, timestamp: Date.now() });
    const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
        const xpUpdate = await addXpAndCheckLevel(ctx, player, Math.floor((success ? 75 : 15) * liveCfg.xpMultiplier));
    await ctx.db.patch(player._id, { money: success ? (player.money ?? 0) + moneyEarned : (player.money ?? 0), points: (player.points ?? 0) + pointsEarned * (Date.now() < ((player as any).pointsBoostUntil ?? 0) ? 3 : 1), life: newLife, totalCrimes: (player.totalCrimes ?? 0) + 1, ...missionCounters, ...xpUpdate, levelUpPending: false, inPrison: arrested, prisonTime: arrested ? 15000 : (player.prisonTime ?? 0), wantedLevel: arrested ? 0 : Math.min(20, (player.wantedLevel ?? 0) + (success ? 1 : 0)), lastCrimeAt: Date.now(), lastStreetCrimeAt: Date.now(), energy: Math.max(0, regeneratedEnergy - (liveCfg.superBoostActive ? 2 : 5)), bullets: (player.bullets ?? 0) + bulletDrop, lastEnergyRegen: Date.now(), crimeMomentum: Math.min(100, (player.crimeMomentum ?? 0) + 5), actionTimestamps: [...(Array.isArray((player as any).actionTimestamps) ? ((player as any).actionTimestamps as number[]).filter((t: number) => typeof t === "number" && Number.isFinite(t) && Date.now() - t < 3600000).slice(-999) : []), Date.now()] } as any);
    await applyWeekendDrops(ctx, player, _sbRoll);
    if (arrested) await ctx.db.insert("notifications", { userId: player._id, type: "prison", message: "You were arrested during a crime!", read: false, timestamp: Date.now() });
    return { success, moneyEarned, pointsEarned, damageTaken, arrested, bulletDrop, bonusCash: _sbRoll.bonusCash, bonusPoints: _sbRoll.bonusPoints, packsDropped: _sbRoll.packs, scrapsDropped: _sbRoll.scraps };
  },
});

export const deposit = mutation({ args: { amount: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (args.amount > (player.money ?? 0)) throw new Error("Not enough cash!"); await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.amount, bank: (player.bank ?? 0) + args.amount }); } });
export const withdraw = mutation({ args: { amount: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (args.amount > (player.bank ?? 0)) throw new Error("Not enough in bank!"); await ctx.db.patch(player._id, { money: (player.money ?? 0) + args.amount, bank: (player.bank ?? 0) - args.amount }); } });

export const fightPlayer = mutation({ args: { defenderId: v.id("users") }, handler: async (ctx, args) => {
    const attacker = await getCurrentUser(ctx); if (!attacker) throw new Error("Not authenticated"); if (attacker.isDead) throw new Error("You are dead!"); if (attacker.inPrison) throw new Error("You are in prison!"); if (attacker._id === args.defenderId) throw new Error("Can't fight yourself!");
    const defender = await ctx.db.get(args.defenderId); if (!defender) throw new Error("Defender not found");
    const aDmg = Math.max(1, Math.floor((attacker.attack ?? 10) * (0.8 + Math.random() * 0.4) - (defender.defense ?? 10) * 0.3));
    const dDmg = Math.max(1, Math.floor((defender.attack ?? 10) * (0.8 + Math.random() * 0.4) - (attacker.defense ?? 10) * 0.3));
    const attackerWins = Math.random() < 0.95 || aDmg > dDmg; const moneyStolen = Math.floor(((attackerWins ? defender : attacker).money ?? 0) * 0.05);
    await ctx.db.insert("fights", { attackerId: attacker._id, defenderId: args.defenderId, attackerDamage: aDmg, defenderDamage: dDmg, winnerId: attackerWins ? attacker._id : args.defenderId, moneyStolen, timestamp: Date.now() });
    const fightXp = await addXpAndCheckLevel(ctx, attacker, 35); await ctx.db.patch(attacker._id, { energy: Math.max(0, ((attacker as any).energy ?? 100) - 15), life: fightXp.life ?? Math.max(0, (attacker.life ?? 100) - dDmg), totalFights: (attacker.totalFights ?? 0) + 1, totalKills: attackerWins ? (attacker.totalKills ?? 0) + 1 : (attacker.totalKills ?? 0), money: attackerWins ? (attacker.money ?? 0) + moneyStolen : Math.max(0, (attacker.money ?? 0) - moneyStolen), ...fightXp });
    if (!attackerWins) { 
      await ctx.db.patch(args.defenderId, { money: (defender.money ?? 0) + moneyStolen, totalKills: (defender.totalKills ?? 0) + 1 }); 
    }
    // Check if life hit 0 - start death timer
    if (Math.max(0, (attacker.life ?? 100) - dDmg) <= 0) {
      await ctx.db.patch(attacker._id, { isDead: true, life: 0, deathTimerAt: Date.now() });
      await ctx.db.insert("notifications", { userId: attacker._id, type: "death", message: "⚠️ You are dying! You have 1 HOUR to heal or your account will be reset!", read: false, timestamp: Date.now() });
    }
    return { attackerDamage: aDmg, defenderDamage: dDmg, attackerWins, moneyStolen };
  },
});

export const gambleDice = mutation({ args: { amount: v.number(), guess: v.union(v.literal("high"), v.literal("low"), v.literal("seven")) }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (args.amount > (player.money ?? 0)) throw new Error("Not enough money!");
    const die1 = Math.floor(Math.random() * 6) + 1; const die2 = Math.floor(Math.random() * 6) + 1; const total = die1 + die2;
    let won = false, multiplier = 0;
    if (args.guess === "high" && total > 7) { won = true; multiplier = 2; } else if (args.guess === "low" && total < 7) { won = true; multiplier = 2; } else if (args.guess === "seven" && total === 7) { won = true; multiplier = 5; }
    const winnings = won ? args.amount * multiplier : 0;
    await ctx.db.patch(player._id, { money: won ? (player.money ?? 0) + winnings - args.amount : (player.money ?? 0) - args.amount, ...(await addXpAndCheckLevel(ctx, player, 8)) });
    return { die1, die2, total, won, winnings };
  },
});

export const gambleCoinToss = mutation({ args: { amount: v.number(), guess: v.union(v.literal("heads"), v.literal("tails")) }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (args.amount > (player.money ?? 0)) throw new Error("Not enough money!");
    const result = Math.random() > 0.5 ? "heads" : "tails"; const won = args.guess === result;
    await ctx.db.patch(player._id, { money: won ? (player.money ?? 0) + args.amount : (player.money ?? 0) - args.amount, ...(await addXpAndCheckLevel(ctx, player, 8)) });
    return { result, won };
  },
});

export const sendMessage = mutation({ args: { receiverId: v.id("users"), subject: v.string(), body: v.string() }, handler: async (ctx, args) => {
    const sender = await getCurrentUser(ctx); if (!sender) throw new Error("Not authenticated");
    await ctx.db.insert("messages", { senderId: sender._id, receiverId: args.receiverId, subject: args.subject, body: args.body, read: false, timestamp: Date.now() });
  },
});

/** Reply to a message in your inbox. If the sender is a street contact (bot) and you reply within 25 min, you get a random reward. */
export const replyToMessage = mutation({ args: { messageId: v.id("messages"), body: v.string() }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
    const text = args.body.trim(); if (!text) throw new Error("Reply cannot be empty");
    const msg = await ctx.db.get(args.messageId); if (!msg) throw new Error("Message not found");
    if (msg.receiverId !== player._id) throw new Error("Not your message");

    const originalSender = await ctx.db.get(msg.senderId);
    if (!originalSender) throw new Error("Sender no longer exists");

    // Deliver the reply to the original sender
    await ctx.db.insert("messages", {
      senderId: player._id,
      receiverId: msg.senderId,
      subject: msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
      body: text,
      read: false,
      timestamp: Date.now(),
      replyToId: args.messageId,
    });

    const patch: any = { read: true };
    let rewardText: string | null = null;

    // Street contact (bot) reward: reply within 25 minutes → random reward, once per message
    if ((originalSender as any).isBotPlayer && !(msg as any).rewardClaimed) {
      patch.rewardClaimed = true;
      const age = Date.now() - msg.timestamp;
      if (age <= 25 * 60 * 1000) {
        const REWARDS: { type: string; label: string; amount: number }[] = [
          { type: "money", label: "$50,000 cash", amount: 50000 },
          { type: "money", label: "$150,000 cash", amount: 150000 },
          { type: "money", label: "$500,000 cash", amount: 500000 },
          { type: "points", label: "25 points", amount: 25 },
          { type: "points", label: "100 points", amount: 100 },
          { type: "bullets", label: "50 bullets", amount: 50 },
          { type: "coins", label: "10 casino coins", amount: 10 },
          { type: "xp", label: "5,000 XP", amount: 5000 },
          { type: "xp", label: "25,000 XP", amount: 25000 },
        ];
        const fastBonus = age < 5 * 60 * 1000 ? 2 : 1;
        const pool = REWARDS.concat(REWARDS.slice(0, fastBonus * 2));
        const reward = pool[Math.floor(Math.random() * pool.length)];
        const p2: any = {};
        switch (reward.type) {
          case "money": p2.money = (player.money ?? 0) + reward.amount; break;
          case "points": p2.points = (player.points ?? 0) + reward.amount; break;
          case "bullets": p2.bullets = (player.bullets ?? 0) + reward.amount; break;
          case "coins": p2.coins = (player.coins ?? 0) + reward.amount; break;
          case "xp": p2.experience = (player.experience ?? 0) + reward.amount; break;
        }
        await ctx.db.patch(player._id, p2);
        await ctx.db.insert("notifications", { userId: player._id, type: "reward", message: `🎁 Street contact rewarded you: ${reward.label}!`, read: false, timestamp: Date.now() });
        rewardText = reward.label;
      }
    }

    await ctx.db.patch(args.messageId, patch);
    return { success: true, reward: rewardText };
  },
});

/** Mark a single message as read. */
export const markMessageRead = mutation({ args: { messageId: v.id("messages") }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId); if (!msg) throw new Error("Message not found");
    if (msg.receiverId !== player._id) throw new Error("Not your message");
    if (!msg.read) await ctx.db.patch(args.messageId, { read: true });
  },
});

export const getMessages = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) return []; const msgs = await ctx.db.query("messages").withIndex("by_receiver", (q) => q.eq("receiverId", player._id)).order("desc").take(50); return await Promise.all(msgs.map(async (m: any) => { const sender: any = await ctx.db.get(m.senderId); return { ...m, senderName: sender?.nickname ?? "Unknown", senderLevel: sender?.level ?? 1, senderIsBot: sender?.isBotPlayer ?? false }; })); } });
export const getUnreadCount = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) return 0; const messages = await ctx.db.query("messages").withIndex("by_receiver", (q) => q.eq("receiverId", player._id)).collect(); return messages.filter((m: any) => !m.read).length; } });
export const getNotifications = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) return []; return await ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(20); } });
export const getForumPosts = query({ args: { forum: v.string() }, handler: async (ctx, args) => await ctx.db.query("forumPosts").withIndex("by_forum", (q) => q.eq("forum", args.forum)).order("desc").take(30) });
export const createForumPost = mutation({ args: { forum: v.string(), title: v.string(), body: v.string() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); await ctx.db.insert("forumPosts", { authorId: player._id, forum: args.forum, title: args.title, body: args.body, replies: 0, lastReplyAt: Date.now(), pinned: false, timestamp: Date.now() }); } });

export const createFamily = mutation({ args: { name: v.string(), tag: v.string(), description: v.string() }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (player.familyId) throw new Error("Already in a family!"); if ((player.money ?? 0) < 50000) throw new Error("Need $50,000!");
    const familyId = await ctx.db.insert("families", { name: args.name, tag: args.tag, description: args.description, leaderId: player._id, level: 1, experience: 0, treasury: 50000, memberCount: 1, maxMembers: 10, createdAt: Date.now(), rank: 0, infamy: 0, territories: [], electionActive: false, electionEndAt: 0, electionCandidateIds: [] });
    await ctx.db.patch(player._id, { familyId, money: (player.money ?? 0) - 50000 });
    return familyId;
  },
});
export const getFamily = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player || !player.familyId) return null; return await ctx.db.get(player.familyId); } });
export const getFamilyMembers = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player || !player.familyId) return []; return await ctx.db.query("users").withIndex("by_family", (q) => q.eq("familyId", player.familyId)).collect(); } });

export const getAllFamilies = query({ args: {}, handler: async (ctx) => {
  return await ctx.db.query("families").collect();
}});

export const joinFamily = mutation({ args: { familyId: v.id("families") }, handler: async (ctx, args) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if (player.familyId) throw new Error("Already in a family!");
  const family = await ctx.db.get(args.familyId) as any; if (!family) throw new Error("Family not found");
  if ((family.memberCount ?? 0) >= (family.maxMembers ?? 10)) throw new Error("Family is full!");
  await ctx.db.patch(args.familyId, { memberCount: (family.memberCount ?? 0) + 1 });
  await ctx.db.patch(player._id, { familyId: args.familyId });
  return { success: true };
}});

export const leaveFamily = mutation({ args: {}, handler: async (ctx) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if (!player.familyId) throw new Error("Not in a family!");
  const family = await ctx.db.get(player.familyId) as any; if (!family) { await ctx.db.patch(player._id, { familyId: undefined }); return { success: true }; }
  if (family.leaderId === player._id) throw new Error("Leader cannot leave! Disband the family first.");
  await ctx.db.patch(player.familyId, { memberCount: Math.max(0, (family.memberCount ?? 1) - 1) });
  await ctx.db.patch(player._id, { familyId: undefined });
  return { success: true };
}});

export const disbandFamily = mutation({ args: {}, handler: async (ctx) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if (!player.familyId) throw new Error("Not in a family!");
  const family = await ctx.db.get(player.familyId) as any; if (!family) { await ctx.db.patch(player._id, { familyId: undefined }); return { success: true }; }
  if (family.leaderId !== player._id) throw new Error("Only the leader can disband!");
  const members = await ctx.db.query("users").withIndex("by_family", (q: any) => q.eq("familyId", player.familyId!)).collect();
  for (const m of members) { await ctx.db.patch(m._id, { familyId: undefined }); }
  await ctx.db.delete(player.familyId);
  return { success: true };
}});

// === CREW SYSTEM ===
export const getAllCrews = query({ args: {}, handler: async (ctx) => {
  return await ctx.db.query("crews").collect();
}});

export const getCrew = query({ args: {}, handler: async (ctx) => {
  const player = await getCurrentUser(ctx);
  if (!player || !(player as any).crewId) return null;
  const crews = await ctx.db.query("crews").collect();
  return crews.find((c: any) => c._id === (player as any).crewId) ?? null;
}});

export const getCrewMembers = query({ args: {}, handler: async (ctx) => {
  const player = await getCurrentUser(ctx);
  if (!player || !(player as any).crewId) return [];
  return await ctx.db.query("users").filter((q: any) => q.eq(q.field("crewId"), (player as any).crewId)).collect();
}});

export const createCrew = mutation({ args: { name: v.string(), tag: v.string(), description: v.string(), territory: v.string() }, handler: async (ctx, args) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if ((player as any).crewId) throw new Error("Already in a crew!");
  if ((player.money ?? 0) < 100000) throw new Error("Need $100,000!");
  const crewId = await ctx.db.insert("crews", {
    name: args.name, tag: args.tag, description: args.description,
    leaderId: player._id, level: 1, experience: 0, treasury: 100000,
    memberCount: 1, maxMembers: 15, territory: args.territory,
    power: 100, createdAt: Date.now(),
  });
  await ctx.db.patch(player._id, { crewId: crewId as any, money: (player.money ?? 0) - 100000 });
  return crewId;
}});

export const joinCrew = mutation({ args: { crewId: v.id("crews") }, handler: async (ctx, args) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if ((player as any).crewId) throw new Error("Already in a crew!");
  const crew = await ctx.db.get(args.crewId) as any; if (!crew) throw new Error("Crew not found");
  if ((crew.memberCount ?? 0) >= (crew.maxMembers ?? 15)) throw new Error("Crew is full!");
  await ctx.db.patch(args.crewId, { memberCount: (crew.memberCount ?? 0) + 1 });
  await ctx.db.patch(player._id, { crewId: args.crewId as any });
  return { success: true };
}});

export const leaveCrew = mutation({ args: {}, handler: async (ctx) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if (!(player as any).crewId) throw new Error("Not in a crew!");
  const crew = await ctx.db.get((player as any).crewId) as any;
  if (crew && crew.leaderId === player._id) throw new Error("Leader cannot leave! Disband first.");
  if (crew) await ctx.db.patch((player as any).crewId, { memberCount: Math.max(0, (crew.memberCount ?? 1) - 1) });
  await ctx.db.patch(player._id, { crewId: undefined });
  return { success: true };
}});

export const disbandCrew = mutation({ args: {}, handler: async (ctx) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if (!(player as any).crewId) throw new Error("Not in a crew!");
  const crew = await ctx.db.get((player as any).crewId) as any;
  if (!crew) { await ctx.db.patch(player._id, { crewId: undefined }); return { success: true }; }
  if (crew.leaderId !== player._id) throw new Error("Only the leader can disband!");
  const members = await ctx.db.query("users").filter((q: any) => q.eq(q.field("crewId"), (player as any).crewId)).collect();
  for (const m of members) { await ctx.db.patch(m._id, { crewId: undefined }); }
  await ctx.db.delete((player as any).crewId);
  return { success: true };
}});

export const dailyRaid = mutation({ args: { targetId: v.id("users") }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (player.isDead) throw new Error("You are dead!");
    if (player.inPrison) throw new Error("You are in prison!"); if ((player.dailyRaidUsed ?? 0) >= 5) throw new Error("No raids left today!");
    const target = await ctx.db.get(args.targetId); if (!target) throw new Error("Target not found");
    const success = Math.random() < 0.95; const moneyStolen = success ? Math.floor((target.money ?? 0) * 0.08) : 0; const damage = Math.floor(Math.random() * 20) + 10;
    await ctx.db.insert("dailyRaids", { userId: player._id, targetUserId: args.targetId, moneyStolen, damage, timestamp: Date.now() });
    await ctx.db.patch(player._id, { money: success ? (player.money ?? 0) + moneyStolen : (player.money ?? 0), energy: Math.max(0, ((player as any).energy ?? 100) - 25), dailyRaidUsed: (player.dailyRaidUsed ?? 0) + 1, ...(await addXpAndCheckLevel(ctx, player, success ? 50 : 15)) });
    if (success) await ctx.db.patch(args.targetId, { money: Math.max(0, (target.money ?? 0) - moneyStolen), life: Math.max(0, (target.life ?? 100) - damage) });
    return { success, moneyStolen, damage };
  },
});

export const regenHealth = mutation({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const elapsed = Date.now() - (player.lastRegenAt ?? 0); const regenAmount = Math.floor(elapsed / 300000); if (regenAmount <= 0) return { healed: 0 }; const healed = Math.min(regenAmount, (player.maxLife ?? 100) - (player.life ?? 0)); await ctx.db.patch(player._id, { life: (player.life ?? 0) + healed, lastRegenAt: Date.now() }); return { healed }; } });
export const healAtHospital = mutation({ args: { speed: v.union(v.literal("standard"), v.literal("premium")) }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const cost = args.speed === "premium" ? 500 : 100; if ((player.money ?? 0) < cost) throw new Error("Not enough money!"); const healed = Math.min(args.speed === "premium" ? 50 : 20, (player.maxLife ?? 100) - (player.life ?? 0)); await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost, life: (player.life ?? 0) + healed }); return { healed, cost }; } });

export const defeatBoss = mutation({ args: { bossId: v.string(), reward: v.number(), xp: v.number(), won: v.boolean() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (args.won) { const bossXp = await addXpAndCheckLevel(ctx, player, args.xp); await ctx.db.patch(player._id, { money: (player.money ?? 0) + args.reward, ...bossXp, totalCrimes: (player.totalCrimes ?? 0) + 1 }); } return { won: args.won, reward: args.won ? args.reward : 0 }; } });

export const getProperties = query({ args: {}, handler: async (ctx) => await ctx.db.query("properties").collect() });
export const collectPropertyIncome = mutation({ args: {}, handler: async (ctx) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
    const props = await ctx.db.query("properties").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
    let totalIncome = 0; for (const p of props) totalIncome += (p.income ?? 0);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + totalIncome });
    return { income: totalIncome };
  },
});
export const buyProperty = mutation({ args: { propertyId: v.id("properties") }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const prop = await ctx.db.get(args.propertyId); if (!prop || prop.ownerId) throw new Error("Not available!"); if ((player.money ?? 0) < (prop.price ?? 0)) throw new Error("Not enough money!"); await ctx.db.patch(args.propertyId, { ownerId: player._id }); await ctx.db.patch(player._id, { money: (player.money ?? 0) - (prop.price ?? 0), propertiesBought: ((player as any).propertiesBought ?? 0) + 1 } as any); return { success: true }; } });

export const buyBusiness = mutation({ args: { name: v.string(), type: v.string(), city: v.string(), price: v.number(), income: v.optional(v.number()) }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if ((player.money ?? 0) < args.price) throw new Error("Not enough money!"); await ctx.db.insert("businesses", { ownerId: player._id, name: args.name, type: args.type, city: args.city, price: args.price, income: args.income ?? Math.floor(args.price * 0.1), level: 1 }); await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.price }); return { success: true }; } });
export const upgradeBusiness = mutation({ args: { businessId: v.id("businesses") }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const biz = await ctx.db.get(args.businessId); if (!biz || biz.ownerId !== player._id) throw new Error("Not your business!"); const cost = Math.floor((biz.price ?? 10000) * 0.2); if ((player.money ?? 0) < cost) throw new Error("Not enough money!"); await ctx.db.patch(args.businessId, { level: (biz.level ?? 1) + 1, income: Math.floor((biz.income ?? 0) * 1.5) }); await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost }); return { success: true }; } });
export const collectBusinessIncome = mutation({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const bizList = await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect(); let total = 0; for (const b of bizList) total += Math.floor((b.income ?? 0) * (b.level ?? 1)); await ctx.db.patch(player._id, { money: (player.money ?? 0) + total }); return { income: total }; } });

export const levelUp = mutation({ args: { stat: v.optional(v.union(v.literal("attack"), v.literal("defense"), v.literal("maxLife"))) }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
    const xpNeeded = XP_PER_LEVEL;
    // A rank-up is earned only at the full threshold; never depend on a stale pending flag.
    if ((player.experience ?? 0) < xpNeeded) throw new Error(`Need ${xpNeeded} XP to rank up!`);
    const newLevel = (player.level ?? 1) + 1;
    const patch: Record<string, unknown> = { level: newLevel, levelUpPending: false, skillPoints: (player.skillPoints ?? 0) + 1, maxLife: (player.maxLife ?? 100) + 75, life: (player.maxLife ?? 100) + 75, attack: (player.attack ?? 10) + 10, defense: (player.defense ?? 10) + 10, highestLevel: Math.max(player.highestLevel ?? 0, newLevel) };
        // +10 ATK, +10 DEF, +75HP on EVERY level up
    patch.attack = (player.attack ?? 10) + 10;
    patch.defense = (player.defense ?? 10) + 10;
    patch.maxLife = (player.maxLife ?? 100) + 75;
    patch.life = (player.maxLife ?? 100) + 75;
    patch.energy = 100;
    // Extra bonus for stat choice
    if (args.stat === "maxLife") { patch.maxLife = (player.maxLife ?? 100) + 75 + 15; patch.life = patch.maxLife; } else if (args.stat === "attack") { patch.attack = (player.attack ?? 10) + 10 + 5; } else if (args.stat === "defense") { patch.defense = (player.defense ?? 10) + 10 + 5; }
    await ctx.db.patch(player._id, patch);
    return { newLevel };
  },
});

export const killPlayer = mutation({ args: { targetId: v.id("users") }, handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (player.inPrison) throw new Error("You are in prison!");
    const target = await ctx.db.get(args.targetId); if (!target) throw new Error("Target not found");
    const success = Math.random() < 0.95;
    if (success) { await ctx.db.patch(args.targetId, { life: 0, isDead: true }); await ctx.db.patch(player._id, { energy: Math.max(0, ((player as any).energy ?? 100) - 40), totalKills: (player.totalKills ?? 0) + 1, wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 3), money: (player.money ?? 0) + Math.floor((target.money ?? 0) * 0.05), ...(await addXpAndCheckLevel(ctx, player, 100)) }); }
    else { const killFailXp = await addXpAndCheckLevel(ctx, player, 20); await ctx.db.patch(player._id, { energy: Math.max(0, ((player as any).energy ?? 100) - 40), life: killFailXp.life ?? Math.max(0, (player.life ?? 100) - 30), wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + 1), ...killFailXp }); }
    return { success };
  },
});

export const respawn = mutation({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (!(player.isDead ?? false)) throw new Error("Not dead!"); const cost = 1000; if ((player.money ?? 0) < cost) throw new Error("Need $1,000 to respawn!"); await ctx.db.patch(player._id, { isDead: false, life: Math.floor((player.maxLife ?? 100) / 2), money: (player.money ?? 0) - cost }); return { success: true }; } });

export const getPrisonStatus = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) return null; return { inPrison: player.inPrison ?? false, prisonTime: player.prisonTime ?? 0, cellLevel: player.cellLevel ?? 1, solitaryTime: player.solitaryTime ?? 0, contraband: player.contraband ?? 0, prisonCurrency: player.prisonCurrency ?? 0, paroleEligible: player.paroleEligible ?? false, prisonJob: player.prisonJob ?? null, prisonGang: player.prisonGang ?? null }; } });
export const smuggleContraband = mutation({ args: { type: v.string() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const success = Math.random() < 0.95; const reward = success ? Math.floor(Math.random() * 5000) + 1000 : 0; const solTime = success ? 0 : 30000; await ctx.db.patch(player._id, { money: (player.money ?? 0) + reward, contraband: (player.contraband ?? 0) + (success ? 1 : 0), solitaryTime: solTime, inPrison: !success, prisonTime: solTime, smugglingRuns: ((player as any).smugglingRuns ?? 0) + (success ? 1 : 0) } as any); return { success, reward, caught: !success }; } });
export const upgradeCell = mutation({ args: { level: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const cost = args.level * 1000; if ((player.money ?? 0) < cost) throw new Error("Not enough money!"); await ctx.db.patch(player._id, { cellLevel: args.level, money: (player.money ?? 0) - cost }); return { success: true }; } });
export const payBail = mutation({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const cost = 10000; if ((player.money ?? 0) < cost) throw new Error("Not enough money!"); await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost, inPrison: false, prisonTime: 0 }); return { cost }; } });
export const prisonEscape = mutation({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if (!(player.inPrison ?? false)) throw new Error("Not in prison!"); const success = Math.random() > 0.7; if (success) await ctx.db.patch(player._id, { inPrison: false, prisonTime: 0, totalPrisonEscapes: (player.totalPrisonEscapes ?? 0) + 1 }); else await ctx.db.patch(player._id, { solitaryTime: 60000 }); return { success }; } });
export const paroleHearing = mutation({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const success = Math.random() < 0.95; if (success) await ctx.db.patch(player._id, { inPrison: false, prisonTime: 0, paroleEligible: false }); return { success }; } });
export const prisonJob = mutation({ args: { job: v.string() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const reward = Math.floor(Math.random() * 500) + 100; await ctx.db.patch(player._id, { prisonJob: args.job, money: (player.money ?? 0) + reward, prisonCurrency: (player.prisonCurrency ?? 0) + reward }); return { reward }; } });
export const prisonFight = mutation({ args: { targetId: v.optional(v.id("users")) }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const success = Math.random() < 0.95; const reward = success ? Math.floor(Math.random() * 1000) + 200 : 0; if (success) await ctx.db.patch(player._id, { prisonCurrency: (player.prisonCurrency ?? 0) + reward }); return { success, reward }; } });
export const joinPrisonGang = mutation({ args: { gang: v.string() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); await ctx.db.patch(player._id, { prisonGang: args.gang }); return { success: true }; } });

export const placeBounty = mutation({ args: { targetId: v.id("users"), reward: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if ((player.money ?? 0) < args.reward) throw new Error("Not enough money!"); await ctx.db.insert("bounties", { placerId: player._id, targetId: args.targetId, reward: args.reward, active: true, createdAt: Date.now() }); await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.reward }); return { success: true }; } });
export const getBounties = query({ args: {}, handler: async (ctx) => await ctx.db.query("bounties").withIndex("by_active", (q) => q.eq("active", true)).collect() });
export const getActiveBounties = query({ args: {}, handler: async (ctx) => await ctx.db.query("bounties").withIndex("by_active", (q) => q.eq("active", true)).collect() });
export const claimBounty = mutation({ args: { bountyId: v.id("bounties") }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const bounty = await ctx.db.get(args.bountyId); if (!bounty || !bounty.active) throw new Error("Bounty not available"); await ctx.db.patch(args.bountyId, { active: false, claimedBy: player._id }); await ctx.db.patch(player._id, { money: (player.money ?? 0) + bounty.reward, totalKills: (player.totalKills ?? 0) + 1 }); return { success: true, reward: bounty.reward }; } });

export const challengeDuel = mutation({ args: { targetId: v.id("users"), stake: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if ((player.money ?? 0) < args.stake) throw new Error("Not enough money!"); await ctx.db.insert("duels", { challengerId: player._id, defenderId: args.targetId, stake: args.stake, status: "pending", createdAt: Date.now() }); await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.stake }); return { success: true }; } });
export const getDuels = query({ args: {}, handler: async (ctx) => await ctx.db.query("duels").withIndex("by_status", (q) => q.eq("status", "pending")).collect() });
export const getPendingDuels = query({ args: {}, handler: async (ctx) => await ctx.db.query("duels").collect() });
export const acceptDuel = mutation({ args: { duelId: v.id("duels") }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const duel = await ctx.db.get(args.duelId); if (!duel) throw new Error("Duel not found"); const won = Math.random() < 0.95; await ctx.db.patch(args.duelId, { status: "finished", winnerId: won ? player._id : duel.challengerId }); if (won) await ctx.db.patch(player._id, { money: (player.money ?? 0) + (duel.stake ?? 0) * 2 }); return { won }; } });

export const sparPlayer = mutation({ args: { targetId: v.id("users") }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); const target = await ctx.db.get(args.targetId); if (!target) throw new Error("Target not found"); const won = (player.attack ?? 10) + Math.random() * 10 > (target.attack ?? 10) + Math.random() * 10; await ctx.db.patch(player._id, { energy: Math.max(0, ((player as any).energy ?? 100) - 10), ...(await addXpAndCheckLevel(ctx, player, won ? 25 : 8)), totalFights: (player.totalFights ?? 0) + 1 }); return { won }; } });

export const getTournaments = query({ args: {}, handler: async (ctx) => await ctx.db.query("tournaments").collect() });
export const getStats = query({ args: {}, handler: async (ctx) => { const players = await ctx.db.query("users").collect(); const registered = players.filter((p: any) => p.nickname); const families = await ctx.db.query("families").collect(); return { totalPlayers: registered.length, totalMoney: registered.reduce((s: number, p: any) => s + (p.money ?? 0), 0), totalCrimes: registered.reduce((s: number, p: any) => s + (p.totalCrimes ?? 0), 0), totalKills: registered.reduce((s: number, p: any) => s + (p.totalKills ?? 0), 0), totalFights: registered.reduce((s: number, p: any) => s + (p.totalFights ?? 0), 0), totalFamilies: families.length, topPlayers: registered.sort((a: any, b: any) => (b.level ?? 0) - (a.level ?? 0)).slice(0, 10).map((p: any) => ({ nickname: p.nickname, level: p.level ?? 0, kills: p.totalKills ?? 0, money: p.money ?? 0 })) }; } });
export const getAllPlayers = query({ args: {}, handler: async (ctx) => await ctx.db.query("users").collect() });
export const getPlayerAchievements = query({ args: {}, handler: async (ctx) => { const player = await getCurrentUser(ctx); if (!player) return []; return await ctx.db.query("playerAchievements").withIndex("by_player", (q) => q.eq("playerId", player._id)).collect(); } });
export const unlockSkill = mutation({ args: { skillId: v.string(), cost: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if ((player.skillPoints ?? 0) < args.cost) throw new Error("Not enough skill points!"); await ctx.db.patch(player._id, { skillPoints: (player.skillPoints ?? 0) - args.cost }); return { success: true }; } });
export const giveMoney = mutation({ args: { receiverId: v.id("users"), amount: v.number() }, handler: async (ctx, args) => { const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated"); if ((player.money ?? 0) < args.amount) throw new Error("Not enough money!"); const receiver = await ctx.db.get(args.receiverId); if (!receiver) throw new Error("Player not found"); await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.amount }); await ctx.db.patch(args.receiverId, { money: (receiver.money ?? 0) + args.amount }); return { success: true }; } });export const commitCategoryCrime = mutation({ args: { crimeId: v.string(), reward: v.number(), risk: v.number(), xp: v.number() }, handler: async (ctx, args) => {
  const player = await getCurrentUser(ctx); if (!player) throw new Error("Not authenticated");
  if (player.inPrison) throw new Error("You are in prison!");
  if (player.isDead) throw new Error("You are dead!");
  // Clamp and validate every numeric input so the endpoint NEVER rejects any
  // Realistic ∞ shouted by bodyguardprotein JSX (bump, but explicit error).
  // When crimes ts are the current ntheft/steal_house/murder calls live, ending as
  // gta_theft would fire the GTA car theft branch.
  let reward = args.reward, risk = args.risk, xp = args.xp;
  if (!Number.isFinite(reward) || reward < 0) reward = 0;
  if (!Number.isFinite(risk) || risk < 0) risk = 0;
  if (!Number.isFinite(xp) || xp < 0) xp = 0;
  // Clamp to sane bounds for crashes.
  reward = Math.min(1_000_000_000, reward);
  risk = Math.min(100, risk);
  xp = Math.min(100000, xp);
  const liveCfg = await getLiveModifiers(ctx);
  if (liveCfg.maintenanceMode) throw new Error(liveCfg.maintenanceMessage);
  // Check energy before executing
  const _rawEnergy = (player as any).energy;
  const _storedEnergy = typeof _rawEnergy === "number" && Number.isFinite(_rawEnergy) ? _rawEnergy : 100;
  const _regenStart = typeof (player as any).lastEnergyRegen === "number" ? (player as any).lastEnergyRegen : Date.now();
  const _regenEnergy = Math.min(100, _storedEnergy + Math.floor(Math.max(0, Date.now() - _regenStart) / 60000) * (liveCfg.energyRegenPerMinute ?? 5));
  const _sbCostMult = liveCfg.superBoostActive ? 0.25 : 1; // SUPER BOOST: 75% less energy
  const _energyCost = Math.max(1, Math.ceil(Math.max(5, RESOURCE_COSTS[args.crimeId]?.energy ?? 5) * _sbCostMult));
  if (_regenEnergy < _energyCost) throw new Error(`Not enough energy (${Math.floor(_regenEnergy)}/${_energyCost}). Wait for it to regenerate.`); const levelBonus = 1; const succeeded = Math.random() < 0.95 + (liveCfg.crimeSuccessBonus ?? 0); let lootVehicle: string | null = null; let lootItem: string | null = null; const titleCase = (id: string) => id.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); if (succeeded && args.crimeId.startsWith('gta_')) { const spec = GTA_LOOT[args.crimeId]; const speed = spec ? spec.speed : Math.min(120, Math.max(30, Math.round(30 + (args.reward / 40000) * 90))); const storage = spec ? spec.storage : Math.min(60, Math.max(10, Math.round(10 + (args.reward / 40000) * 50))); const armored = spec ? !!spec.armored : args.risk >= 60; lootVehicle = spec ? spec.name : ('Stolen ' + titleCase(args.crimeId.slice(4))); try { await ctx.db.insert('vehicles', { userId: player._id, name: lootVehicle, type: 'stolen', speed, storage, armored, stolen: true, purchasePrice: spec ? spec.price : 0 }); } catch (_lootErr) { /* loot write must never cancel the crime */ } } else if (succeeded && args.crimeId.startsWith('sh_')) { const spec = SH_LOOT[args.crimeId]; const rarity = spec ? spec.rarity : (args.reward >= 20000 ? 'legendary' : args.reward >= 5000 ? 'rare' : args.reward >= 1000 ? 'uncommon' : 'common'); lootItem = spec ? spec.name : (titleCase(args.crimeId.slice(3)) + ' Loot'); try { await ctx.db.insert('inventory', { userId: player._id, itemId: 'loot_' + args.crimeId, name: lootItem, type: 'loot', equipped: false, quantity: 1, attack: spec ? (spec.attack ?? 0) : Math.floor(Math.random() * 5) + 1, defense: spec ? (spec.defense ?? 0) : Math.floor(Math.random() * 5) + 1, rarity, price: spec ? spec.price : args.reward }); } catch (_lootErr2) { /* loot write must never cancel the crime */ } }
  const rawEnergy = (player as any).energy;
  const storedEnergy = typeof rawEnergy === "number" && Number.isFinite(rawEnergy) ? rawEnergy : 100;
  const regenStartedAt = typeof (player as any).lastEnergyRegen === "number" ? (player as any).lastEnergyRegen : Date.now();
  const regeneratedEnergy = Math.min(100, storedEnergy + Math.floor(Math.max(0, Date.now() - regenStartedAt) / 60000) * (liveCfg.energyRegenPerMinute ?? 5));
  const energyCost = Math.max(1, Math.ceil(Math.max(5, RESOURCE_COSTS[args.crimeId]?.energy ?? 5) * _sbCostMult));
  const effectiveEnergy = Math.max(0, regeneratedEnergy - energyCost);
  const _now = Date.now();
  const riskRoll = Math.random() * 100;
  const arrested = succeeded && riskRoll < (100 - args.risk);
  const lifeDamage = succeeded ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 40) + 10;
  const newLife = Math.max(0, (player.life ?? 100) - lifeDamage);
  const moneyEarned = succeeded ? Math.floor(args.reward * (1 + 0.1) * liveCfg.cashMultiplier) : 0;
  // SUPER BOOST: 75% chance to loot bullets on every criminal action (scaled to the crime, capped)
  const bulletDrop = succeeded && liveCfg.superBoostActive && Math.random() < 0.75
    ? Math.min(10000, Math.max(1, Math.floor(args.reward / 25)))
    : 0;
  const _missionGta = succeeded && args.crimeId.startsWith('gta_');
  const missionCounters: Record<string, number> = _missionGta ? { totalGta: ((player as any).totalGta ?? 0) + 1 } : {};
  if (_missionGta && (GTA_LOOT[args.crimeId]?.price ?? args.reward) >= 500000) missionCounters.totalGtaRare = ((player as any).totalGtaRare ?? 0) + 1;
  const xpEarned = succeeded ? Math.floor(args.xp * liveCfg.xpMultiplier) : Math.floor(args.xp * 0.3);
  const pointsEarned = succeeded ? Math.floor(args.xp * 0.1 * liveCfg.pointsMultiplier) : 0;
  const _sbRoll = rollWeekendLoot(liveCfg.superBoostActive, succeeded, moneyEarned, pointsEarned, args.reward);
  const xpUpdate = await addXpAndCheckLevel(ctx, player, xpEarned);
  const levelUpNow = (player as any).levelUpPending === true || ((player.experience ?? 0) + xpEarned >= 2000);
  const oldCooldowns: Record<string, number> = ((player as any).crimeCooldowns ?? {}) as Record<string, number>;
    // SERVER OPS GAME BALANCE: global crime cooldown (10–3600s) applies after every
  // crime attempt; super-boost still shortens it (25%).
  const { getGlobalCrimeCooldown, getJailMs } = await import("./serverOps");
  const globalCd = await getGlobalCrimeCooldown(ctx);
  const cdMs = globalCd * 1000;
  // Jail times come from the admin GAME BALANCE panel (per real category:
  // street/robbery/fraud/burglary/drugs/organized/underground/gta_theft/steal_house/murder).
  const jailForMs = await getJailMs(ctx, args.crimeId, 15000);
  const jailFor = (_id: string, fallbackMs: number): number => jailForMs || fallbackMs;
  const cooldowns: Record<string, number> = { ...oldCooldowns, [args.crimeId]: _now + (liveCfg.superBoostActive ? Math.ceil(cdMs * 0.25) : cdMs), ["__global"]: _now + (liveCfg.superBoostActive ? Math.ceil(cdMs * 0.25) : cdMs) };
  const categoryId = args.crimeId.split('_')[0];
  const oldCompleted: Record<string, string[]> = ((player as any).crimeCompleted ?? {}) as Record<string, string[]>;
  const categoryCompleted: string[] = (oldCompleted[categoryId || ''] ?? []).concat(succeeded ? [args.crimeId] : []);
  const allDone = categoryCompleted.length >= 5;
  const newCompleted: Record<string, string[]> = { ...oldCompleted, [categoryId || '']: categoryCompleted };
  const existingTs: number[] = Array.isArray((player as any).actionTimestamps)
    ? ((player as any).actionTimestamps as number[]).filter((t: unknown): t is number => typeof t === "number" && Number.isFinite(t))
    : [];
  const _newTs = await recordPlayerAction(ctx, player);
  void existingTs;
  await ctx.db.patch(player._id, { money: Math.max(0, (player.money ?? 0) + moneyEarned), life: newLife, totalCrimes: (player.totalCrimes ?? 0) + 1, ...missionCounters, ...xpUpdate, levelUpPending: false, energy: levelUpNow ? 100 : effectiveEnergy, inPrison: arrested, prisonTime: arrested ? jailFor(args.crimeId, 15000) : (player.prisonTime ?? 0), wantedLevel: arrested ? 0 : Math.min(20, (player.wantedLevel ?? 0) + (succeeded ? 1 : 0)), lastCrimeAt: _now, crimeMomentum: Math.min(100, (player.crimeMomentum ?? 0) + 3), crimeCooldowns: cooldowns, crimeCompleted: allDone ? { ...newCompleted, [categoryId || '']: [] } : newCompleted, points: (player.points ?? 0) + pointsEarned, bullets: (player.bullets ?? 0) + bulletDrop, lastEnergyRegen: _now, actionTimestamps: _newTs } as any);
  await applyWeekendDrops(ctx, player, _sbRoll);
  try { await ctx.db.insert('crimes', { userId: player._id, type: args.crimeId, target: 'environment', success: succeeded, moneyEarned: succeeded ? moneyEarned : 0, pointsEarned: xpEarned, damageTaken: lifeDamage, timestamp: Date.now() }); } catch (_logErr) { /* log must never cancel the crime */ }
  try { if (arrested) await ctx.db.insert('notifications', { userId: player._id, type: 'prison', message: 'Arrested!', read: false, timestamp: Date.now() }); } catch (_notifErr) { /* notification must never cancel the crime */ }
  return { success: succeeded, moneyEarned, xpEarned, pointsEarned, damageTaken: lifeDamage, arrested, levelUp: levelUpNow, bulletDrop, bonusCash: _sbRoll.bonusCash, bonusPoints: _sbRoll.bonusPoints, packsDropped: _sbRoll.packs, scrapsDropped: _sbRoll.scraps };
} });
 
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { MISSION_TYPE_MAP, DISTRICTS, buildMissions, waveMultiplier } from "../data/missionsCatalog";
import { DISTRICT_CASH } from "../data/empire";

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

function boardMap(player: any): Record<string, number> {
  const m = (player as any).missionBoard;
  return m && typeof m === "object" ? m : {};
}
function actionsMap(player: any): Record<string, number> {
  const m = (player as any).missionActions;
  return m && typeof m === "object" ? m : {};
}
function startedMap(player: any): Record<string, number> {
  const m = (player as any).missionStarted;
  return m && typeof m === "object" ? m : {};
}
function cooldownMap(player: any): Record<string, number> {
  const m = (player as any).missionCooldowns;
  return m && typeof m === "object" ? m : {};
}
function legacyEmpireProgress(player: any): Record<string, number> {
  const m = player.empireProgress;
  return m && typeof m === "object" ? m : {};
}

const MISSION_TYPE_LIST = Object.keys(MISSION_TYPE_MAP);

/** conquestCount = max(legacy empireProgress, distinct mission types done). Kept
 *  in lockstep with legacy empireProgress for daily income, value and selling. */
function conquestCount(progress: Record<string, number>, legacy: Record<string, number>, districtIdx: number): number {
  const legacyCount = Math.min(3, Math.max(0, Math.floor(legacy[DISTRICTS[districtIdx].name] ?? 0)));
  let distinct = 0;
  for (const t of MISSION_TYPE_LIST) {
    if (Math.floor(progress[`${districtIdx}:${t}`] ?? 0) >= 3) distinct++;
  }
  return Math.max(legacyCount, Math.min(3, distinct));
}

/** Live counters on the player row that each mission type's progress derives from. */
function actionValue(player: any, action: string): number {
  switch (action) {
    case "crime":      return n(player.totalCrimes, 0);
    case "heist":      return n(player.heistsSuccess, 0);
    case "melt":       return n(player.carsMelted, 0);
    case "buybullets": return n(player.bulletsBought, 0);
    case "gta":        return n(player.totalGta, 0);
    case "rarecar":    return n(player.totalGtaRare, 0);
    case "repair":     return n(player.carsRepaired, 0);
    case "interest":   return n(player.interestCollections, 0);
    case "casino":     return n(player.casinoRounds, 0);
    case "smuggle":    return n(player.smugglingRuns, 0);
    case "assassin":   return n(player.assassinationKills, 0);
    case "property":   return n(player.propertiesBought, 0);
    case "fraud":      return n(player.counterfeitSkill, 0) + n(player.identityThefts, 0);
    case "burglary":   return n(player.burglaries, 0);
    case "supply":     return n(player.supplyRuns, 0);
    case "race":       return n(player.racesWon, 0);
    default:           return 0;
  }
}

const BASE_CHANCE: Record<number, number> = { 1: 0.92, 2: 0.85, 3: 0.78, 4: 0.70, 5: 0.60 };

export const getBoard = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
  const progress = boardMap(player);
  const started = startedMap(player);
  const actions = actionsMap(player);
  const cooldowns = cooldownMap(player);
  const legacy = legacyEmpireProgress(player);
  const now = Date.now();
  const wave = Math.max(0, Math.floor(n((player as any).missionWave, 0)));
  const wavesCleared = Math.max(0, Math.floor(n((player as any).missionWavesCleared, 0)));

  // Auto-generation: when every mission on the current board is complete, a new
  // wave is generated 24/7 — rewards scale +60% and names rotate. The player
  // (or the hourly Auto Rank pulse) can also trigger it manually via generateNextWave.
  const missionList = buildMissions(progress, n(player.level, 1), wave);
  const allDone = missionList.length > 0 && missionList.every((m) => m.done);

  const districtsCompleted = DISTRICTS.reduce((s, _, i) => s + (conquestCount(progress, legacy, i) >= 3 ? 1 : 0), 0);
    const conquestPerDistrict = DISTRICTS.map((_, i) => conquestCount(progress, legacy, i));
    const cashPerDay = Array.from({ length: districtsCompleted }, (_, i) => DISTRICT_CASH[i] ?? 15_000).reduce((a, b) => a + b, 0);
    const totalTasks = Object.values(progress).reduce((s: number, v: any) => s + n(v, 0), 0);
    const empireValue = districtsCompleted * 50_000 + totalTasks * 2_000 + n(player.empireValue, 0);
    const lastPayout = n(player.lastEmpirePayout, 0);
    const nextPayoutIn = lastPayout > 0 ? Math.max(0, lastPayout + 24 * 3600000 - now) : 0;

    return {
      level: n(player.level, 1),
      energy: n((player as any).energy, 100),
      maxEnergy: n((player as any).maxEnergy, 100),
      money: n(player.money, 0),
      progress,
      started,
      actions,
      cooldowns,
      wave,
      wavesCleared,
      allDone,
      actionValues: Object.fromEntries(
        Object.values(MISSION_TYPE_MAP).map((t) => [t.action, actionValue(player, t.action)]),
      ),
      stats: {
        attempted: n((player as any).missionAttempted, 0),
        completed: n((player as any).missionCompleted, 0),
        failed: n((player as any).missionFailed, 0),
        profit: n((player as any).missionProfit, 0),
      },
      empire: {
        districtsCompleted,
        conquestPerDistrict,
        cashPerDay,
        pointsPerDay: districtsCompleted * 25,
        bulletsPerDay: districtsCompleted * 150,
        empireValue,
        totalTasks,
        nextPayoutIn,
        sold: n((player as any).empireSoldAt, 0) > 0,
      },
      serverNow: now,
    };
  },
});

// ═══════════ START — take the mission and snapshot your counters ═══════════
export const startMission = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    const [diStr, typeId] = args.key.split(":");
    const di = parseInt(diStr, 10);
    const type = MISSION_TYPE_MAP[typeId];
    if (isNaN(di) || di < 0 || di >= DISTRICTS.length || !type) throw new Error("Unknown mission");

    const district = DISTRICTS[di];
    const progress = boardMap(player);
    const key = args.key;
    const task = Math.min(3, Math.floor(progress[key] ?? 0));
    if (task >= 3) throw new Error("Mission already completed");

    // Level lock: new missions require the district level; in-progress ones stay open.
    if (task === 0 && n(player.level, 1) < district.lockLevel) {
      throw new Error(`🔒 ${district.name} unlocks at level ${district.lockLevel}`);
    }
    if (n((player as any).empireSoldAt, 0) > 0) throw new Error("Your empire was sold — mission progress cleared");

    const now = Date.now();
    const energy = n((player as any).energy, 100);
    if (energy < type.energy) throw new Error(`Need ${type.energy} energy to take this mission — you have ${Math.floor(energy)}`);

    const cooldowns = cooldownMap(player);
    const cdUntil = n(cooldowns[key], 0);
    if (cdUntil > now) throw new Error(`Mission cooling down — ${Math.ceil((cdUntil - now) / 1000)}s remaining`);
    const started = startedMap(player);
    if (started[key]) throw new Error("Mission already started — go do the actions, then come back to claim");

    const actions = actionsMap(player);
    const baseline = actionValue(player, type.action);

    await ctx.db.patch(player._id, {
      energy: Math.max(0, energy - type.energy),
      missionStarted: { ...started, [key]: now },
      missionActions: { ...actions, [key]: baseline },
      missionCooldowns: { ...cooldowns, [key]: now + type.cooldownMin * 60_000 },
      missionAttempted: n((player as any).missionAttempted, 0) + 1,
    } as any);

    return {
      success: true,
      key,
      mission: `${type.icon} ${type.label}`,
      district: district.name,
      action: type.action,
      required: type.required,
      baseline,
      hint: type.where,
    };
  },
});

// ═══════════ CLAIM — server verifies you actually did the actions ═══════════
export const claimMission = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    const [diStr, typeId] = args.key.split(":");
    const di = parseInt(diStr, 10);
    const type = MISSION_TYPE_MAP[typeId];
    if (isNaN(di) || di < 0 || di >= DISTRICTS.length || !type) throw new Error("Unknown mission");

    const progress = boardMap(player);
    const key = args.key;
    const task = Math.min(3, Math.floor(progress[key] ?? 0));
    if (task >= 3) throw new Error("Mission already completed");
    const started = startedMap(player);
    const startedAt = n(started[key], 0);
    if (!startedAt) throw new Error("Press START first — take the mission, then do the actions in-game");

    const actions = actionsMap(player);
    const baseline = n(actions[key], 0);
    const current = actionValue(player, type.action);
    const delta = current - baseline;
    if (delta < type.required) {
      throw new Error(`Not done yet — ${delta}/${type.required} ${type.label.toLowerCase()} since you started. ${type.where}`);
    }

    const now = Date.now();
    const district = DISTRICTS[di];
    // Wave-scaled rewards: every auto-generated wave pays +60% more
    const wave = Math.max(0, Math.floor(n((player as any).missionWave, 0)));
    const reward = Math.floor(type.rewards[Math.min(2, task)] * waveMultiplier(wave));
    const cashBoost = now < n(player.cashBoostUntil, 0) ? 2 : 1;
    const newProgress = { ...progress, [key]: task + 1 };
    const newStarted = { ...started };
    delete newStarted[key];

    // 24/7 auto-generation: the instant the full board is cleared, the next
    // wave rolls out — fresh contract names, +60% rewards. It never stops.
    const boardCleared = buildMissions(newProgress, n(player.level, 1), wave).every((m) => m.done);

    const patch: any = {
      missionBoard: boardCleared ? {} : newProgress,
      missionStarted: newStarted,
      missionCompleted: n((player as any).missionCompleted, 0) + 1,
      missionProfit: n((player as any).missionProfit, 0) + reward,
    };
    if (boardCleared) {
      patch.missionWave = wave + 1;
      patch.missionWavesCleared = Math.max(0, Math.floor(n((player as any).missionWavesCleared, 0))) + 1;
    }

    switch (type.currency) {
      case "cash":
        patch.money = n(player.money, 0) + Math.floor(reward * cashBoost);
        break;
      case "points":
        patch.points = n(player.points, 0) + reward;
        break;
      case "bullets":
        patch.bullets = n(player.bullets, 0) + reward;
        break;
      case "coins":
        patch.coins = n(player.coins, 0) + reward;
        break;
      case "scrap": {
        const scraps = player.scraps && typeof player.scraps === "object" ? { ...player.scraps } : { common: 0, rare: 0, epic: 0 };
        scraps.common = n(scraps.common, 0) + reward;
        if (task >= 2) scraps.rare = n(scraps.rare, 0) + reward;
        patch.scraps = scraps;
        break;
      }
      case "xp":
        patch.xpReward = reward; // applied below via addXpAndCheckLevel
        break;
    }

    // Empire conquest: completing a mission that makes this the 1st/2nd/3rd distinct
    // completed type in the district bumps legacy empireProgress (income + selling).
    const legacy = legacyEmpireProgress(player);
    const dName = district.name;
    const legacyCount = Math.min(3, Math.max(0, Math.floor(legacy[dName] ?? 0)));
    const distinctBefore = MISSION_TYPE_LIST.filter((t) => Math.floor(progress[`${di}:${t}`] ?? 0) >= 3).length;
    const distinctAfter = MISSION_TYPE_LIST.filter((t) => Math.floor(newProgress[`${di}:${t}`] ?? 0) >= 3).length;
    if (legacyCount < 3 && distinctAfter > distinctBefore && n((player as any).empireSoldAt, 0) === 0) {
      const next = Math.min(3, legacyCount + (distinctAfter - distinctBefore));
      patch.empireProgress = { ...legacy, [dName]: next };
    }

    let xp = 150 + task * 100;
    const xpReward = patch.xpReward;
    if (xpReward) { xp += xpReward; delete patch.xpReward; }
    const xpUpd: any = await addXpAndCheckLevel(ctx, player, xp);
    patch.experience = xpUpd.experience;
    if (xpUpd.level !== undefined) {
      patch.level = xpUpd.level;
      patch.highestLevel = xpUpd.highestLevel;
      patch.energy = 100;
      if (xpUpd.attack !== undefined) patch.attack = xpUpd.attack;
      if (xpUpd.defense !== undefined) patch.defense = xpUpd.defense;
      if (xpUpd.maxLife !== undefined) patch.maxLife = xpUpd.maxLife;
      if (xpUpd.life !== undefined) patch.life = xpUpd.life;
    }
    await ctx.db.patch(player._id, patch);

    return {
      success: true,
      won: true,
      reward,
      currency: type.currency,
      district: district.name,
      typeLabel: type.label,
      task: task + 1,
      missionDone: task + 1 >= 3,
      conquered: distinctAfter >= 3 && distinctBefore < 3,
      waveAdvanced: boardCleared ? wave + 1 : undefined,
      delta,
      xp,
      levelUp: xpUpd.level !== undefined ? xpUpd.level : undefined,
    };
  },
});

// ═══════════ ABANDON — drop a started mission (no refund of energy) ═══════════
export const abandonMission = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const started = startedMap(player);
    if (!started[args.key]) throw new Error("Mission is not started");
    const newStarted = { ...started };
    delete newStarted[args.key];
    await ctx.db.patch(player._id, { missionStarted: newStarted } as any);
    return { success: true };
  },
});

// ═══════════ AUTO-GENERATION — roll out the next wave on demand ═══════════
// The board also self-advances the moment its final mission is claimed (24/7),
// this mutation is the manual trigger shown on the map banner.
export const generateNextWave = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const progress = boardMap(player);
    const wave = Math.max(0, Math.floor(n((player as any).missionWave, 0)));
    const list = buildMissions(progress, n(player.level, 1), wave);
    const remaining = list.filter((m) => !m.done).length;
    if (remaining > 0) throw new Error(`Not yet — ${remaining} missions still open. The next wave generates automatically 24/7 the moment the map is cleared.`);
    const nextWave = wave + 1;
    await ctx.db.patch(player._id, {
      missionWave: nextWave,
      missionWavesCleared: Math.max(0, Math.floor(n((player as any).missionWavesCleared, 0))) + 1,
      missionBoard: {},
    } as any);
    return { success: true, wave: nextWave };
  },
});

export const sellEmpire = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (n((player as any).empireSoldAt, 0) > 0) throw new Error("You already sold your empire");

    const progress = boardMap(player);
    const legacy = legacyEmpireProgress(player);
    const districtsCompleted = DISTRICTS.reduce((s, _, i) => s + (conquestCount(progress, legacy, i) >= 3 ? 1 : 0), 0);
    if (districtsCompleted < 10) throw new Error(`You need 10 districts to sell — you have ${districtsCompleted}`);

    const totalTasks = Object.values(progress).reduce((s: number, v: any) => s + n(v, 0), 0);
    const value = districtsCompleted * 50_000 + totalTasks * 2_000 + n(player.empireValue, 0);

    await ctx.db.patch(player._id, {
      points: n(player.points, 0) + value,
      empireProgress: {},
      missionBoard: {},
      missionStarted: {},
      empireSoldAt: Date.now(),
    } as any);
    return { success: true, points: value, districts: districtsCompleted };
  },
});

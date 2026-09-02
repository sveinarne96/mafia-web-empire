import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { MISSION_TYPE_MAP, DISTRICTS, DISTRICT_MAP } from "../data/missionsCatalog";
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

function cooldownMap(player: any): Record<string, number> {
  const m = (player as any).missionCooldowns;
  return m && typeof m === "object" ? m : {};
}

function legacyEmpireProgress(player: any): Record<string, number> {
  const m = player.empireProgress;
  return m && typeof m === "object" ? m : {};
}

/** Conquest = 3 distinct mission types completed (>=1 task) in a district.
 *  Kept in lockstep with the legacy empireProgress[district] = 0..3 so
 *  daily empire income, value and sell all keep working. */
function conquestCount(progress: Record<string, number>, legacy: Record<string, number>, districtIdx: number): number {
  const legacyCount = Math.min(3, Math.max(0, Math.floor(legacy[DISTRICTS[districtIdx].name] ?? 0)));
  let distinct = 0;
  for (const t of MISSION_TYPE_LIST) {
    if (Math.floor(progress[`${districtIdx}:${t}`] ?? 0) >= 1) distinct++;
  }
  return Math.max(legacyCount, Math.min(3, distinct));
}

const MISSION_TYPE_LIST = Object.keys(MISSION_TYPE_MAP);

const BASE_CHANCE: Record<number, number> = { 1: 0.92, 2: 0.85, 3: 0.78, 4: 0.70, 5: 0.60 };

export const getBoard = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const progress = boardMap(player);
    const cooldowns = cooldownMap(player);
    const legacy = legacyEmpireProgress(player);

    const districtsCompleted = DISTRICTS.reduce((s, _, i) => s + (conquestCount(progress, legacy, i) >= 3 ? 1 : 0), 0);
    const conquestPerDistrict = DISTRICTS.map((_, i) => conquestCount(progress, legacy, i));
    const cashPerDay = Array.from({ length: districtsCompleted }, (_, i) => DISTRICT_CASH[i] ?? 15_000).reduce((a, b) => a + b, 0);
    const totalTasks = Object.values(progress).reduce((s: number, v: any) => s + n(v, 0), 0);
    const empireValue = districtsCompleted * 50_000 + totalTasks * 2_000 + n(player.empireValue, 0);
    const lastPayout = n(player.lastEmpirePayout, 0);
    const nextPayoutIn = lastPayout > 0 ? Math.max(0, lastPayout + 24 * 3600000 - Date.now()) : 0;

    return {
      level: n(player.level, 1),
      energy: n((player as any).energy, 100),
      maxEnergy: n((player as any).maxEnergy, 100),
      money: n(player.money, 0),
      points: n(player.points, 0),
      bullets: n(player.bullets, 0),
      coins: n(player.coins, 0),
      progress,
      cooldowns,
      stats: {
        attempted: n((player as any).missionAttempted, 0),
        completed: n((player as any).missionCompleted, 0),
        failed: n((player as any).missionFailed, 0),
        profit: n((player as any).missionProfit, 0),
        typeCounts: (player as any).missionTypeCounts ?? {},
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
      serverNow: Date.now(),
    };
  },
});

export const runMission = mutation({
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
    const key = `${di}:${typeId}`;
    const task = Math.min(3, Math.floor(progress[key] ?? 0));
    if (task >= 3) throw new Error("Mission already completed — it resets when you sell the empire");

    // Level lock: new missions require the district level; in-progress ones stay open.
    if (task === 0 && n(player.level, 1) < district.lockLevel) {
      throw new Error(`🔒 ${district.name} unlocks at level ${district.lockLevel}`);
    }

    const now = Date.now();
    const energy = n((player as any).energy, 100);
    if (energy < type.energy) throw new Error(`Need ${type.energy} energy — you have ${Math.floor(energy)}`);

    const cooldowns = cooldownMap(player);
    const cdUntil = n(cooldowns[key], 0);
    if (cdUntil > now) {
      const s = Math.ceil((cdUntil - now) / 1000);
      throw new Error(`${type.label} cooling down — ${s}s remaining`);
    }

    // Success roll
    const chance = Math.min(0.95, BASE_CHANCE[type.difficulty] - district.hazard + Math.min(0.15, n(player.level, 1) * 0.003));
    const won = Math.random() < chance;

    const patch: any = { energy: Math.max(0, energy - type.energy) };
    const newCooldowns = { ...cooldowns, [key]: now + type.cooldownMin * 60_000 };
    patch.missionCooldowns = newCooldowns;
    patch.missionAttempted = n((player as any).missionAttempted, 0) + 1;

    let xp = 0;
    let reward = 0;
    let conquered = false;

    if (won) {
      reward = type.rewards[Math.min(2, task)];
      const cashBoost = now < n(player.cashBoostUntil, 0) ? 2 : 1;
      const newProgress = { ...progress, [key]: task + 1 };
      patch.missionBoard = newProgress;

      switch (type.currency) {
        case "cash":
          patch.money = n(player.money, 0) + Math.floor(reward * cashBoost);
          patch.missionProfit = n((player as any).missionProfit, 0) + Math.floor(reward * cashBoost);
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
          xp = reward;
          break;
      }

      patch.missionCompleted = n((player as any).missionCompleted, 0) + 1;
      const tc = { ...((player as any).missionTypeCounts ?? {}) };
      tc[typeId] = n(tc[typeId], 0) + 1;
      patch.missionTypeCounts = tc;

      // Empire conquest: first completion of a new mission type in this district
      const legacy = legacyEmpireProgress(player);
      const dName = district.name;
      const legacyCount = Math.min(3, Math.max(0, Math.floor(legacy[dName] ?? 0)));
      const beforeDistinct = MISSION_TYPE_LIST.filter((t) => Math.floor(progress[`${di}:${t}`] ?? 0) >= 1).length;
      const afterDistinct = MISSION_TYPE_LIST.filter((t) => Math.floor(newProgress[`${di}:${t}`] ?? 0) >= 1).length;
      if (legacyCount < 3 && beforeDistinct === 0 && afterDistinct === 1 && n((player as any).empireSoldAt, 0) === 0) {
        const next = Math.min(3, legacyCount + 1);
        patch.empireProgress = { ...legacy, [dName]: next };
        conquered = next >= 3;
      }

      xp += 150 + task * 100; // baseline XP per successful mission
    } else {
      patch.missionFailed = n((player as any).missionFailed, 0) + 1;
      xp = 40; // consolation XP
    }

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

    const name = `${type.icon} ${type.label}`;
    return {
      success: true,
      won,
      chance: Math.round(chance * 100),
      reward: won ? reward : 0,
      currency: type.currency,
      district: district.name,
      typeLabel: type.label,
      task: won ? task + 1 : task,
      missionDone: won && task + 1 >= 3,
      conquered,
      xp,
      levelUp: xpUpd.level !== undefined ? xpUpd.level : undefined,
    };
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
      empireSoldAt: Date.now(),
    });
    return { success: true, points: value, districts: districtsCompleted };
  },
});

export { DISTRICT_MAP };

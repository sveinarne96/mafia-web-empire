import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { CAR_MARKET, getRarityColor } from "../data/carMarket";
import {
  ROBOT_BODYGUARDS, ACCOUNT_UPGRADES, PERK_BUNDLES, POINT_STORE_EXTRA,
  COIN_STORE_ITEMS, SCRATCH_PRIZES, PACK_ITEMS,
  CATEGORY_OBJECTIVES, MILESTONE_OBJECTIVES, FREE_TRACK, VIP_LEVELS,
  VIP_XP_PER_LEVEL, vipRewardForLevel,
  PACK_CONFIG, PACK_RARITY_ORDER, SCRAP_TO_PACK, PERK_DEFS, ASSASSIN_TARGETS,
} from "../data/objectives";
import { addXpAndCheckLevel } from "./game";

// ===== HELPERS =====
async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);

function ensureDefaults(player: any) {
  return {
    coins: n(player.coins, 0),
    bullets: n(player.bullets, 0),
    robotBodyguards: Array.isArray(player.robotBodyguards) ? player.robotBodyguards : [],
    accountUpgrades: player.accountUpgrades && typeof player.accountUpgrades === "object" ? player.accountUpgrades : {},
    perks: player.perks && typeof player.perks === "object" ? player.perks : {},
    seasonXp: n(player.seasonXp, 0),
    seasonTiersClaimed: Array.isArray(player.seasonTiersClaimed) ? player.seasonTiersClaimed : [],
    vipLevelsClaimed: Array.isArray(player.vipLevelsClaimed) ? player.vipLevelsClaimed : [],
    vipUntil: n(player.vipUntil, 0),
    objectiveProgress: player.objectiveProgress && typeof player.objectiveProgress === "object" ? player.objectiveProgress : {},
    objectivesClaimed: player.objectivesClaimed && typeof player.objectivesClaimed === "object" ? player.objectivesClaimed : {},
    milestonesClaimed: player.milestonesClaimed && typeof player.milestonesClaimed === "object" ? player.milestonesClaimed : {},
    totalActions: n(player.totalActions, 0),
    totalEarned: n(player.totalEarned, 0),
    carsMelted: n(player.carsMelted, 0),
    carsRepaired: n(player.carsRepaired, 0),
    legendaryRepaired: n(player.legendaryRepaired, 0),
    epicRepaired: n(player.epicRepaired, 0),
    rareRepaired: n(player.rareRepaired, 0),
    commonRepaired: n(player.commonRepaired, 0),
    totalRepairSpent: n(player.totalRepairSpent, 0),
    lastAutoMelt: n(player.lastAutoMelt, 0),
    meltLimitLevel: n(player.meltLimitLevel, 0),
    starterClaimed: !!player.starterClaimed,
    pointsSent: n(player.pointsSent, 0),
    pointsReceived: n(player.pointsReceived, 0),
    packsOpened: n(player.packsOpened, 0),
    scratchCards: n(player.scratchCards, 0),
    packs: player.packs && typeof player.packs === "object" ? { common: n(player.packs.common, 0), rare: n(player.packs.rare, 0), epic: n(player.packs.epic, 0), legendary: n(player.packs.legendary, 0) } : { common: 0, rare: 0, epic: 0, legendary: 0 },
    scraps: player.scraps && typeof player.scraps === "object" ? { common: n(player.scraps.common, 0), rare: n(player.scraps.rare, 0), epic: n(player.scraps.epic, 0) } : { common: 0, rare: 0, epic: 0 },
    autoConvertScraps: !!player.autoConvertScraps,
    perkActiveUntil: player.perkActiveUntil && typeof player.perkActiveUntil === "object" ? player.perkActiveUntil : {},
    meltValueUntil: n(player.meltValueUntil, 0),
    meltLimitUntil: n(player.meltLimitUntil, 0),
    gtaRarityUntil: n(player.gtaRarityUntil, 0),
    bustBoostUntil: n(player.bustBoostUntil, 0),
    heistChanceUntil: n(player.heistChanceUntil, 0),
    heistTimerUntil: n(player.heistTimerUntil, 0),
    jailImmunityCount: n(player.jailImmunityCount, 0),
    objectivesDay: player.objectivesDay ?? "",
    assassinationKills: n(player.assassinationKills, 0),
    assassinationProfit: n(player.assassinationProfit, 0),
    assassinationTarget: player.assassinationTarget ?? null,
    assassinationCooldownUntil: n(player.assassinationCooldownUntil, 0),
  };
}

function addPacks(packs: any, rarity: string, count: number) {
  const p = { ...(packs || {}), common: n(packs?.common, 0), rare: n(packs?.rare, 0), epic: n(packs?.epic, 0), legendary: n(packs?.legendary, 0) };
  p[rarity] = n(p[rarity], 0) + count;
  return p;
}

function addScraps(scraps: any, rarity: string, count: number) {
  const s = { ...(scraps || {}), common: n(scraps?.common, 0), rare: n(scraps?.rare, 0), epic: n(scraps?.epic, 0) };
  s[rarity] = n(s[rarity], 0) + count;
  return s;
}

// Auto-convert: every 10 scraps of a rarity become 1 pack of that rarity.
function autoConvertScraps(packs: any, scraps: any): { packs: any; scraps: any; converted: number } {
  let converted = 0;
  const p = { ...packs };
  const s = { ...scraps };
  for (const rarity of ["common", "rare", "epic"] as const) {
    while (n(s[rarity], 0) >= SCRAP_TO_PACK) {
      s[rarity] = n(s[rarity], 0) - SCRAP_TO_PACK;
      p[rarity] = n(p[rarity], 0) + 1;
      converted++;
    }
  }
  return { packs: p, scraps: s, converted };
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Daily objectives: base 4 milestones per category, then auto-extend with more
// (scaled) milestones once the original set has been fully claimed.
function extendedMilestonesFor(def: any, claimedCount: number) {
  const base = def.milestones as { count: number; reward: number }[];
  const milestones = [...base];
  const baseCount = base[base.length - 1]?.count ?? 300;
  const baseReward = base[base.length - 1]?.reward ?? 5_000_000;
  const blocks = Math.max(0, Math.ceil((claimedCount - base.length) / 4));
  for (let b = 1; b <= blocks + 1; b++) {
    for (let i = 0; i < 4; i++) {
      const count = baseCount + (b - 1) * 50 + (i + 1) * 50;
      const reward = Math.round(baseReward * (1 + b * 0.5));
      milestones.push({ count, reward });
    }
  }
  return milestones;
}

function rollRarity(drops: Record<string, number>): string {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const rarity of PACK_RARITY_ORDER) {
    acc += drops[rarity] ?? 0;
    if (roll <= acc) return rarity;
  }
  return "common";
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function meltLimitFor(player: any): number {
  return 2 + (n(player.meltLimitLevel, 0) * 3);
}

const PERK_IDS = ["autoRank", "doubleXp", "doublePay", "jailImmunity", "bustBoost", "heistChance", "heistTimer", "meltValue", "meltLimit", "gtaRarity", "supplyUnit"];

async function grantPerks(player: any, perkId: string, amount: number) {
  const perks = { ...(player.perks || {}) };
  perks[perkId] = (perks[perkId] ?? 0) + amount;
  return perks;
}

async function grantBullets(player: any, amount: number) {
  return n(player.bullets, 0) + amount;
}

// ===== QUERY: FULL STORE STATE =====
export const getStoreState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const d = ensureDefaults(player);
    const vehicles = await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const ownedCars = vehicles.map((veh: any) => ({
      ...veh,
      rarity: veh.rarity ?? (veh.stolen ? "common" : "rare"),
      damage: n(veh.damage, 0),
      forSale: !!veh.forSale,
      salePrice: n(veh.salePrice, 0),
      isWreck: !!veh.isWreck,
    }));
    // Season progress
    const currentFree = FREE_TRACK.filter((t) => d.seasonXp >= t.xp).length;
    const currentVip = d.vipUntil > Date.now()
      ? Math.min(VIP_LEVELS, Math.max(0, vipLevelForXp(d.seasonXp)))
      : 0;
    return {
      ...d,
      playerId: player._id,
      nickname: player.nickname || player.username || "Player",
      level: n(player.level, 1),
      defense: n(player.defense, 0),
      points: n(player.points, 0),
      money: n(player.money, 0),
      meltLimit: meltLimitFor(player),
      ownedCars,
      freeTrackProgress: currentFree,
      vipLevel: currentVip,
      vipActive: d.vipUntil > Date.now(),
      vipLevelsClaimed: d.vipLevelsClaimed,
      seasonEndsAt: seasonEnd(),
      nextAutoMeltAt: n(player.lastAutoMelt, 0) + 5 * 60 * 1000,
      carCount: ownedCars.length,
      meltableCount: ownedCars.filter((v: any) => v.isWreck || v.damage >= 40).length,
      packs: d.packs,
      scraps: d.scraps,
      autoConvertScraps: d.autoConvertScraps,
      perkActiveUntil: d.perkActiveUntil,
      meltValueUntil: d.meltValueUntil,
      meltLimitUntil: d.meltLimitUntil,
      gtaRarityUntil: d.gtaRarityUntil,
      bustBoostUntil: d.bustBoostUntil,
      heistChanceUntil: d.heistChanceUntil,
      heistTimerUntil: d.heistTimerUntil,
      jailImmunityCount: d.jailImmunityCount,
      objectivesDay: d.objectivesDay,
      objectives: CATEGORY_OBJECTIVES.map((def) => {
        const claimedList: number[] = (d.objectivesClaimed[def.categoryId] ?? []);
        const milestones = extendedMilestonesFor(def, claimedList.length);
        return {
          categoryId: def.categoryId, name: def.name, icon: def.icon, color: def.color, tagline: def.tagline,
          progress: d.objectiveProgress[def.categoryId] ?? 0,
          milestones: milestones.map((m) => ({
            count: m.count, reward: m.reward,
            claimed: claimedList.includes(m.count),
          })),
        };
      }),
      assassinationKills: d.assassinationKills,
      assassinationProfit: d.assassinationProfit,
      assassinationTarget: d.assassinationTarget,
      assassinationCooldownUntil: d.assassinationCooldownUntil,
      xpBoostUntil: n(player.xpBoostUntil, 0),
      cashBoostUntil: n(player.cashBoostUntil, 0),
    };
  },
});

function seasonEnd(): number {
  // Season ends 25-09-2026 (per the UI spec). Recompute dynamically:
  const now = Date.now();
  const end = new Date("2026-09-25T23:59:59Z").getTime();
  return Math.max(end, now + 1000 * 60 * 60 * 24 * 30);
}

function vipLevelForXp(xp: number): number {
  let level = 0;
  let remaining = xp;
  for (let i = 1; i <= VIP_LEVELS; i++) {
    const need = VIP_XP_PER_LEVEL(i);
    if (remaining >= need) {
      remaining -= need;
      level = i;
    } else break;
  }
  return level;
}

// ===== STARTER PACK =====
export const claimStarterPack = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.starterClaimed) throw new Error("Starter pack already claimed!");
    const patch: any = {
      starterClaimed: true,
      coins: n(player.coins, 0) + 2,
      bullets: n(player.bullets, 0) + 100,
    };
    await ctx.db.patch(player._id, patch);
    return { success: true, coins: 2, bullets: 100 };
  },
});

// ===== POINT STORE =====
export const purchasePointItem = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    let item: any = null;
    let group = "";
    // find item
    const bg = ROBOT_BODYGUARDS.find((i) => i.id === args.itemId);
    const up = ACCOUNT_UPGRADES.find((i) => i.id === args.itemId);
    const pk = PERK_BUNDLES.find((i) => i.id === args.itemId);
    const ex = POINT_STORE_EXTRA.find((i) => i.id === args.itemId);
    if (bg) { item = bg; group = "bodyguard"; }
    else if (up) { item = up; group = "upgrade"; }
    else if (pk) { item = pk; group = "perks"; }
    else if (ex) { item = ex; group = ex.group; }
    if (!item) throw new Error("Item not found");
    if (n(player.points, 0) < item.cost) throw new Error(`Need ${item.cost} points`);

    const patch: any = { points: n(player.points, 0) - item.cost };
    const bodyguards = [...d.robotBodyguards];
    const upgrades = { ...d.accountUpgrades };
    let perks = { ...d.perks };
    let bullets = d.bullets;

    if (group === "bodyguard") {
      if (bodyguards.length >= 4) throw new Error("You already own 4 Robot Bodyguards!");
      if (bodyguards.some((b: any) => b.id === item.id)) throw new Error("You already own this bodyguard!");
      bodyguards.push({ id: item.id, name: item.name, defense: item.defenseBonus ?? 0, purchasedAt: Date.now() });
      patch.robotBodyguards = bodyguards;
      patch.defense = n(player.defense, 0) + (item.defenseBonus ?? 0);
    } else if (group === "upgrade") {
      if (upgrades[item.upgradeId!]) throw new Error("You already own this upgrade!");
      upgrades[item.upgradeId!] = true;
      patch.accountUpgrades = upgrades;
      if (item.upgradeId === "meltLimit") patch.meltLimitLevel = n(player.meltLimitLevel, 0) + 1;
    } else if (group === "perks") {
      if (item.id === "random5") {
        for (let i = 0; i < 5; i++) {
          const pid = PERK_IDS[Math.floor(Math.random() * PERK_IDS.length)];
          perks[pid] = (perks[pid] ?? 0) + 1;
        }
      } else if (item.id === "random25") {
        for (let i = 0; i < 25; i++) {
          const pid = PERK_IDS[Math.floor(Math.random() * PERK_IDS.length)];
          perks[pid] = (perks[pid] ?? 0) + 1;
        }
      } else {
        perks = await grantPerks(player, item.perkId!, item.perkAmount ?? 1);
      }
      patch.perks = perks;
    } else if (group === "bullets") {
      bullets += 10000;
      patch.bullets = bullets;
    } else if (group === "silencer") {
      perks = await grantPerks(player, "silencer", 1);
      patch.perks = perks;
    } else if (group === "vip") {
      patch.vipUntil = Math.max(n(player.vipUntil, 0), Date.now()) + 30 * 24 * 60 * 60 * 1000;
    }

    await ctx.db.patch(player._id, patch);
    return { success: true, item: item.name, group };
  },
});

// ===== UPGRADE BODYGUARD =====
export const upgradeBodyguard = mutation({
  args: { bodyguardId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const list = d.robotBodyguards.map((b: any) => ({ ...b }));
    const bg = list.find((b: any) => b.id === args.bodyguardId);
    if (!bg) throw new Error("Bodyguard not found");
    const rank = n(bg.rank, 1);
    if (rank >= 5) throw new Error("Already at max rank (5)");
    const cost = rank * 200;
    if (n(player.points, 0) < cost) throw new Error(`Need ${cost} points to upgrade`);
    bg.rank = rank + 1;
    bg.defense = Math.round(n(bg.defense, 0) * 1.4);
    bg.maxRank = 5;
    await ctx.db.patch(player._id, {
      robotBodyguards: list,
      points: n(player.points, 0) - cost,
    });
    return { success: true, rank: bg.rank, defense: bg.defense };
  },
});

// ===== SEND POINTS =====
export const sendPoints = mutation({
  args: { username: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.floor(args.amount);
    if (amount < 1) throw new Error("Minimum 1 point");
    const fee = 1;
    const total = amount + fee;
    if (n(player.points, 0) < total) throw new Error(`Need ${total} points (${amount} + ${fee} fee)`);
    const target = await ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", args.username.trim())).unique()
      ?? await ctx.db.query("users").withIndex("by_nickname", (q) => q.eq("nickname", args.username.trim())).unique();
    if (!target) throw new Error("Player not found");
    if (target._id === player._id) throw new Error("Cannot send points to yourself");
    await ctx.db.patch(player._id, { points: n(player.points, 0) - total, pointsSent: n(player.pointsSent, 0) + amount });
    await ctx.db.patch(target._id, { points: n(target.points, 0) + amount, pointsReceived: n(target.pointsReceived, 0) + amount });
    await ctx.db.insert("notifications", { userId: target._id, type: "points", message: `${player.nickname || player.username || "Someone"} sent you ${amount} points!`, read: false, timestamp: Date.now() });
    return { success: true, amount, fee };
  },
});

// ===== COIN STORE =====
export const purchaseCoinItem = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const item = COIN_STORE_ITEMS.find((i) => i.id === args.itemId);
    if (!item) throw new Error("Item not found");
    if (d.coins < item.cost) throw new Error(`Need ${item.cost} 🪙 coins`);

    const patch: any = { coins: d.coins - item.cost };
    const perks = { ...d.perks };
    const upgrades = { ...d.accountUpgrades };
    let bullets = d.bullets;

    if (item.kind === "pack") {
      await openPackInto(ctx, player._id, item.packType ?? "common", item.id === "legendaryPack" ? 1 : item.id === "epicPack" ? 1 : 1, 0);
      patch.packsOpened = d.packsOpened + 1;
    } else if (item.kind === "perk") {
      perks[item.perkId!] = (perks[item.perkId!] ?? 0) + (item.perkAmount ?? 1);
      patch.perks = perks;
    } else if (item.kind === "upgrade") {
      if (upgrades[item.upgradeId!]) throw new Error("You already own this upgrade!");
      upgrades[item.upgradeId!] = true;
      patch.accountUpgrades = upgrades;
      if (item.upgradeId === "meltLimit") patch.meltLimitLevel = n(player.meltLimitLevel, 0) + 1;
    } else if (item.kind === "bullets") {
      bullets += item.bullets ?? 0;
      patch.bullets = bullets;
    } else if (item.kind === "scratch") {
      const prize = SCRATCH_PRIZES[Math.floor(Math.random() * SCRATCH_PRIZES.length)];
      patch.scratchCards = d.scratchCards + 1;
      if (prize.type === "money") patch.money = n(player.money, 0) + prize.amount;
      if (prize.type === "points") patch.points = n(player.points, 0) + prize.amount;
      if (prize.type === "bullets") { bullets += prize.amount; patch.bullets = bullets; }
      if (prize.type === "coins") patch.coins = d.coins - item.cost + prize.amount;
      if (prize.type === "commonPack") await openPackInto(ctx, player._id, "common", 1, 0);
      patch._scratchPrize = prize;
    } else if (item.kind === "car") {
      const cars = CAR_MARKET.filter((c) => c.rarity === item.carRarity);
      if (cars.length === 0) throw new Error("No cars available");
      const car = cars[Math.floor(Math.random() * cars.length)];
      await ctx.db.insert("vehicles", {
        userId: player._id, name: car.name, type: car.rarity, speed: car.speed, storage: car.storage,
        armored: car.armored ?? false, stolen: false, purchasePrice: car.price,
        rarity: car.rarity, damage: 0, desc: car.desc,
      });
      patch._carName = car.name;
    }

    await ctx.db.patch(player._id, patch);
    const out: any = { success: true, item: item.name };
    if (patch._scratchPrize) out.scratchPrize = patch._scratchPrize;
    if (patch._carName) out.carName = patch._carName;
    return out;
  },
});

async function openPackInto(ctx: any, userId: any, packType: string, count: number, _ignore: number) {
  const table = PACK_ITEMS[packType] ?? PACK_ITEMS.common;
  for (let i = 0; i < Math.max(1, count); i++) {
    const entry = table[Math.floor(Math.random() * table.length)];
    await ctx.db.insert("inventory", {
      userId, itemId: `pack_${packType}_${entry.name}`, name: entry.name, type: "item",
      equipped: false, quantity: 1, attack: entry.attack, defense: entry.defense,
      rarity: entry.rarity, price: entry.price,
    });
  }
}

// ===== SEASON =====
export const claimSeasonTier = mutation({
  args: { tier: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const tier = FREE_TRACK.find((t) => t.tier === args.tier);
    if (!tier) throw new Error("Tier not found");
    if (d.seasonXp < tier.xp) throw new Error("Not enough season XP yet");
    if (d.seasonTiersClaimed.includes(tier.tier)) throw new Error("Already claimed");

    const perks = { ...d.perks };
    let bullets = d.bullets;
    const patch: any = {
      seasonTiersClaimed: [...d.seasonTiersClaimed, tier.tier],
      bullets,
    };
    if (tier.type === "bullets") { bullets += tier.amount; patch.bullets = bullets; }
    else if (tier.type === "autoRank") { perks.autoRank = (perks.autoRank ?? 0) + tier.amount; patch.perks = perks; }
    else if (tier.type === "commonPack") { patch.packs = addPacks(d.packs, "common", tier.amount); }
    else if (tier.type === "epicPack") { patch.packs = addPacks(d.packs, "epic", tier.amount); }
    else if (tier.type === "doubleXp") { perks.doubleXp = (perks.doubleXp ?? 0) + tier.amount; patch.perks = perks; }
    else if (tier.type === "goldBar") {
      await ctx.db.insert("inventory", { userId: player._id, itemId: "gold_bar", name: "Gold Bar", type: "valuable", equipped: false, quantity: tier.amount, rarity: "legendary", price: 100_000 });
    } else if (tier.type === "heistTimer") { perks.heistTimer = (perks.heistTimer ?? 0) + tier.amount; patch.perks = perks; }
    else if (tier.type === "heistChance") { perks.heistChance = (perks.heistChance ?? 0) + tier.amount; patch.perks = perks; }
    else if (tier.type === "points") { patch.points = n(player.points, 0) + tier.amount; }
    else if (tier.type === "legendaryPack") { patch.packs = addPacks(d.packs, "legendary", tier.amount); }
    else if (tier.type === "cash") { patch.money = n(player.money, 0) + tier.amount; }
    else if (tier.type === "coins") { patch.coins = n(player.coins, 0) + tier.amount; }
    else if (tier.type === "car") {
      await ctx.db.insert("vehicles", {
        userId: player._id, name: "Hired Limo", type: "car", armored: false, speed: 88, storage: 24, stolen: true, purchasePrice: 150_000,
        damage: 0, rarity: "rare", forSale: false, salePrice: 0, isWreck: false,
      });
    }

    await ctx.db.patch(player._id, patch);
    return { success: true, reward: tier.reward };
  },
});

export const claimVipLevel = mutation({
  args: { level: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    if (d.vipUntil <= Date.now()) throw new Error("VIP membership required");
    const level = Math.floor(args.level);
    if (level < 1 || level > VIP_LEVELS) throw new Error("Invalid level");
    const claimed = (player.vipLevelsClaimed as number[]) ?? [];
    if (claimed.includes(level)) throw new Error("Already claimed");
    const reward = vipRewardForLevel(level);
    const needed = VIP_XP_PER_LEVEL(level);
    if (d.seasonXp < cumulativeVipXp(level)) throw new Error("Not enough season XP yet");

    const perks = { ...d.perks };
    let bullets = d.bullets;
    const patch: any = { vipLevelsClaimed: [...claimed, level] };
    if (reward.type === "cash") patch.money = n(player.money, 0) + reward.cash;
    else if (reward.type === "bullets") { bullets += reward.amount; patch.bullets = bullets; }
    else if (reward.type === "bustBoost") { perks.bustBoost = (perks.bustBoost ?? 0) + reward.amount; patch.perks = perks; }
    else if (reward.type === "autoRank") { perks.autoRank = (perks.autoRank ?? 0) + reward.amount; patch.perks = perks; }
    else if (reward.type === "commonScrap") { perks.commonScrap = (perks.commonScrap ?? 0) + reward.amount; patch.perks = perks; }
    else if (reward.type === "commonPack") { patch.packs = addPacks(d.packs, "common", reward.amount); }
    else if (reward.type === "doublePay") { perks.doublePay = (perks.doublePay ?? 0) + reward.amount; patch.perks = perks; }
    else if (reward.type === "epicPack") { patch.packs = addPacks(d.packs, "epic", reward.amount); }

    await ctx.db.patch(player._id, patch);
    return { success: true, reward: `${reward.label} +${reward.type === "cash" ? "$" + reward.cash.toLocaleString() : reward.amount}` };
  },
});

function cumulativeVipXp(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) total += VIP_XP_PER_LEVEL(i);
  return total;
}

// Called by the criminal operations page after each action so objectives,
// season XP and lifetime stats stay in sync (handles every top-bar category).
export const recordCrime = mutation({
  args: { category: v.string(), reward: v.number(), xp: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) return { success: true };

    // Daily objectives: reset progress & claims every day at midnight (local server day).
    const today = todayStr();
    let progress = { ...((player.objectiveProgress as any) || {}) };
    let claimed = { ...((player.objectivesClaimed as any) || {}) };
    const patch: any = { objectivesDay: today };
    if ((player.objectivesDay ?? "") !== today) {
      progress = {};
      claimed = {};
      patch.objectiveProgress = progress;
      patch.objectivesClaimed = claimed;
    }

    progress[args.category] = (progress[args.category] ?? 0) + 1;

    // Random coin drop: ~35% of actions drop 1-30 IG coins.
    let coinDrop = 0;
    if (Math.random() < 0.35) {
      coinDrop = randInt(1, 30);
    }

    // Auto-convert scraps -> packs when the toggle is on.
    let packs = (player.packs && typeof player.packs === "object" ? player.packs : { common: 0, rare: 0, epic: 0, legendary: 0 });
    let scraps = (player.scraps && typeof player.scraps === "object" ? player.scraps : { common: 0, rare: 0, epic: 0 });
    let autoConverted = 0;
    if (player.autoConvertScraps) {
      const res = autoConvertScraps(packs, scraps);
      packs = res.packs; scraps = res.scraps; autoConverted = res.converted;
    }
    if (autoConverted > 0) { patch.packs = packs; patch.scraps = scraps; }

    patch.totalActions = ((player.totalActions as any) ?? 0) + 1;
    patch.seasonXp = ((player.seasonXp as any) ?? 0) + Math.max(1, Math.floor(args.xp || 0));
    patch.totalEarned = ((player.totalEarned as any) ?? 0) + Math.max(0, Math.floor(args.reward || 0));
    patch.objectiveProgress = progress;
    if (coinDrop > 0) patch.coins = n(player.coins, 0) + coinDrop;

    await ctx.db.patch(player._id, patch);
    return { success: true, coinDrop, autoConverted };
  },
});

// ===== PACKS =====
function rollItem(rarity: string) {
  const table = PACK_ITEMS[rarity] ?? PACK_ITEMS.common;
  return { ...table[Math.floor(Math.random() * table.length)] };
}

export const buyPack = mutation({
  args: { packType: v.string(), qty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const cfg = PACK_CONFIG[args.packType];
    if (!cfg) throw new Error("Unknown pack type");
    const qty = Math.max(1, Math.floor(args.qty));
    const cost = cfg.coinCost * qty;
    if (cost < 1) throw new Error("This pack cannot be purchased with coins");
    if (d.coins < cost) throw new Error(`Need ${cost} coins (you have ${d.coins})`);
    await ctx.db.patch(player._id, {
      coins: d.coins - cost,
      packs: addPacks(d.packs, cfg.key, qty),
    });
    return { success: true, cost, qty };
  },
});

export const openPack = mutation({
  args: { packType: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const cfg = PACK_CONFIG[args.packType];
    if (!cfg) throw new Error("Unknown pack type");
    if (n((d.packs as any)[cfg.key], 0) < 1) throw new Error("You don't own this pack");

    const rewards: { name: string; rarity: string; attack: number; defense: number; price: number }[] = [];
    for (const g of cfg.guarantee) {
      for (let i = 0; i < g.qty; i++) rewards.push(rollItem(g.rarity));
    }
    const remaining = cfg.rewards - rewards.length;
    for (let i = 0; i < remaining; i++) {
      rewards.push(rollItem(rollRarity(cfg.drops)));
    }
    for (const r of rewards) {
      await ctx.db.insert("inventory", {
        userId: player._id, itemId: `pack_${cfg.key}_${r.name.replace(/\s+/g, "_")}`, name: r.name, type: "item",
        equipped: false, quantity: 1, attack: r.attack, defense: r.defense, rarity: r.rarity, price: r.price,
      });
    }
    const scrapAmt = randInt(cfg.scrapYield[0], cfg.scrapYield[1]);
    let packs = addPacks(d.packs, cfg.key, -1);
    let scraps = addScraps(d.scraps, cfg.key, scrapAmt);
    const patch: any = { packs, scraps, packsOpened: d.packsOpened + 1 };
    if (d.autoConvertScraps) {
      const res = autoConvertScraps(packs, scraps);
      packs = res.packs; scraps = res.scraps;
      patch.packs = packs; patch.scraps = scraps;
    }
    await ctx.db.patch(player._id, patch);
    return { success: true, rewards, scraps: scrapAmt };
  },
});

export const convertScraps = mutation({
  args: { rarity: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    if (!["common", "rare", "epic"].includes(args.rarity)) throw new Error("Invalid rarity");
    if (n((d.scraps as any)[args.rarity], 0) < SCRAP_TO_PACK) throw new Error(`Need ${SCRAP_TO_PACK} ${args.rarity} scraps`);
    await ctx.db.patch(player._id, {
      scraps: addScraps(d.scraps, args.rarity, -SCRAP_TO_PACK),
      packs: addPacks(d.packs, args.rarity, 1),
    });
    return { success: true };
  },
});

export const toggleAutoConvert = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const next = !player.autoConvertScraps;
    const d = ensureDefaults(player);
    const patch: any = { autoConvertScraps: next };
    if (next) {
      const res = autoConvertScraps(d.packs, d.scraps);
      patch.packs = res.packs; patch.scraps = res.scraps;
    }
    await ctx.db.patch(player._id, patch);
    return { success: true, enabled: next };
  },
});

// ===== PERKS =====
export const usePerk = mutation({
  args: { perkId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const stock = n(d.perks[args.perkId], 0);
    if (stock < 1) throw new Error("No stock of this perk");
    const perks = { ...d.perks };
    perks[args.perkId] = stock - 1;
    const patch: any = { perks };
    const now = Date.now();
    switch (args.perkId) {
      case "doubleXp": patch.xpBoostUntil = now + 3600000; break;
      case "doublePay": patch.cashBoostUntil = now + 3600000; break;
      case "heistChance": patch.heistChanceUntil = now + 3600000; break;
      case "heistTimer": patch.heistTimerUntil = now + 3600000; break;
      case "bustBoost": patch.bustBoostUntil = now + 3600000; break;
      case "gtaRarity": patch.gtaRarityUntil = now + 3600000; break;
      case "meltValue": patch.meltValueUntil = now + 24 * 3600000; break;
      case "meltLimit": patch.meltLimitUntil = now + 24 * 3600000; break;
      case "jailImmunity": patch.jailImmunityCount = d.jailImmunityCount + 1; break;
      case "supplyUnit":
        patch.bullets = n(player.bullets, 0) + 100;
        patch.energy = Math.min(100, n((player as any).energy, 100) + 25);
        break;
      case "autoRank": {
        const xpUpd: any = await addXpAndCheckLevel(ctx, player, 2000);
        if (typeof xpUpd.level === "number" && xpUpd.level > (player.level ?? 1)) {
          patch.level = xpUpd.level;
          patch.experience = xpUpd.experience;
          patch.highestLevel = xpUpd.highestLevel;
          patch.energy = 100;
          if (xpUpd.attack !== undefined) patch.attack = xpUpd.attack;
          if (xpUpd.defense !== undefined) patch.defense = xpUpd.defense;
          if (xpUpd.maxLife !== undefined) patch.maxLife = xpUpd.maxLife;
          if (xpUpd.life !== undefined) patch.life = xpUpd.life;
          if (xpUpd.skillPoints !== undefined) patch.skillPoints = xpUpd.skillPoints;
        } else {
          patch.experience = xpUpd.experience ?? player.experience;
        }
        break;
      }
      default: throw new Error("Unknown perk");
    }
    await ctx.db.patch(player._id, patch);
    return { success: true, perkId: args.perkId };
  },
});

// ===== ASSASSINATION =====
export const getAssassinationTarget = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const now = Date.now();
    if (d.assassinationTarget) throw new Error("You already have an active target");
    if (d.assassinationCooldownUntil > now) {
      const mins = Math.ceil((d.assassinationCooldownUntil - now) / 60000);
      throw new Error(`Contract broker cooling down — ${mins}m until next target`);
    }
    const t = ASSASSIN_TARGETS[Math.floor(Math.random() * ASSASSIN_TARGETS.length)];
    await ctx.db.patch(player._id, {
      assassinationTarget: { name: t.name, rank: t.rank, bounty: t.bounty, difficulty: t.difficulty, issuedAt: now, expiresAt: now + 24 * 3600000 },
    });
    return { success: true, target: t };
  },
});

export const completeAssassination = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    if (!d.assassinationTarget) throw new Error("No active target — get one first");
    const t = d.assassinationTarget;
    const level = player.level ?? 1;
    const chance = Math.min(0.95, (t.difficulty ?? 0.5) + level * 0.004);
    const success = Math.random() < chance;
    const patch: any = {
      assassinationTarget: null,
      assassinationCooldownUntil: Date.now() + 30 * 60000,
    };
    let bounty = 0;
    if (success) {
      bounty = Math.round((t.bounty ?? 0) * (1 + level * 0.01));
      const coinDrop = randInt(1, 10);
      patch.money = n(player.money, 0) + bounty;
      patch.coins = n(player.coins, 0) + coinDrop;
      patch.assassinationKills = d.assassinationKills + 1;
      patch.assassinationProfit = d.assassinationProfit + bounty;
      patch.wantedLevel = Math.min(20, n(player.wantedLevel, 0) + 2);
      const xpUpd: any = await addXpAndCheckLevel(ctx, player, Math.max(50, Math.floor((t.bounty ?? 0) / 100000)));
      patch.experience = xpUpd.experience;
      if (xpUpd.level !== undefined) { patch.level = xpUpd.level; patch.highestLevel = xpUpd.highestLevel; if (xpUpd.attack !== undefined) patch.attack = xpUpd.attack; if (xpUpd.defense !== undefined) patch.defense = xpUpd.defense; if (xpUpd.maxLife !== undefined) patch.maxLife = xpUpd.maxLife; if (xpUpd.life !== undefined) patch.life = xpUpd.life; }
      await ctx.db.patch(player._id, patch);
      return { success: true, bounty, coinDrop, killed: true, targetName: t.name };
    }
    await ctx.db.patch(player._id, patch);
    return { success: false, killed: false, targetName: t.name };
  },
});

// ===== OBJECTIVES =====
export const claimObjective = mutation({
  args: { categoryId: v.string(), milestoneIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const def = CATEGORY_OBJECTIVES.find((c) => c.categoryId === args.categoryId);
    if (!def) throw new Error("Category not found");
    const claimedList: number[] = d.objectivesClaimed[args.categoryId] ?? [];
    const extended = extendedMilestonesFor(def, claimedList.length);
    const milestone = extended[args.milestoneIndex];
    if (!milestone) throw new Error("Milestone not found");
    const progress = d.objectiveProgress[args.categoryId] ?? 0;
    if (progress < milestone.count) throw new Error(`Need ${milestone.count} actions in ${def.name}`);
    const claimed: Record<string, number[]> = { ...d.objectivesClaimed };
    const list = claimed[args.categoryId] ?? [];
    if (list.includes(milestone.count)) throw new Error("Already claimed");
    claimed[args.categoryId] = [...list, milestone.count];
    await ctx.db.patch(player._id, {
      objectivesClaimed: claimed,
      money: n(player.money, 0) + milestone.reward,
      totalEarned: n(player.totalEarned, 0) + milestone.reward,
    });
    return { success: true, reward: milestone.reward };
  },
});

export const claimMilestone = mutation({
  args: { milestoneId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const ms = MILESTONE_OBJECTIVES.find((m) => m.id === args.milestoneId);
    if (!ms) throw new Error("Milestone not found");
    if (d.milestonesClaimed[ms.id]) throw new Error("Already claimed");
    const value = ms.kind === "actions" ? d.totalActions : d.totalEarned;
    if (value < ms.target) throw new Error(`Requirement not met (${value.toLocaleString()} / ${ms.target.toLocaleString()})`);
    await ctx.db.patch(player._id, {
      milestonesClaimed: { ...d.milestonesClaimed, [ms.id]: true },
      money: n(player.money, 0) + ms.reward,
      points: n(player.points, 0) + ms.points,
      coins: d.coins + ms.coins,
      totalEarned: n(player.totalEarned, 0) + ms.reward,
    });
    return { success: true, reward: ms.reward, points: ms.points, coins: ms.coins };
  },
});

// ===== CAR MARKET =====
export const buyCar = mutation({
  args: { carId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const car = CAR_MARKET.find((c) => c.id === args.carId);
    if (!car) throw new Error("Car not found");
    if (n(player.money, 0) < car.price) throw new Error("Not enough money!");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - car.price });
    await ctx.db.insert("vehicles", {
      userId: player._id, name: car.name, type: car.rarity, speed: car.speed, storage: car.storage,
      armored: car.armored ?? false, stolen: false, purchasePrice: car.price,
      rarity: car.rarity, damage: 0, desc: car.desc,
    });
    return { success: true, car: car.name, exclusive: car.rarity === "exclusive" };
  },
});

export const sellCar = mutation({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const veh = await ctx.db.get(args.vehicleId);
    if (!veh || veh.userId !== player._id) throw new Error("Not your vehicle");
    if (veh.forSale) throw new Error("Stop the listing before selling");
    const basePrice = (veh.purchasePrice ?? 0) > 0 ? veh.purchasePrice : (veh.speed ?? 50) * 1000;
    const damageFactor = 1 - (n(veh.damage, 0) / 100) * 0.7;
    const price = Math.max(500, Math.floor(basePrice * damageFactor * 0.6));
    await ctx.db.delete(args.vehicleId);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + price });
    return { success: true, price };
  },
});

export const listCarForSale = mutation({
  args: { vehicleId: v.id("vehicles"), price: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const veh = await ctx.db.get(args.vehicleId);
    if (!veh || veh.userId !== player._id) throw new Error("Not your vehicle");
    if (args.price < 1000) throw new Error("Minimum listing price $1,000");
    await ctx.db.patch(args.vehicleId, { forSale: true, salePrice: Math.floor(args.price) });
    return { success: true };
  },
});

export const unlistCar = mutation({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const veh = await ctx.db.get(args.vehicleId);
    if (!veh || veh.userId !== player._id) throw new Error("Not your vehicle");
    await ctx.db.patch(args.vehicleId, { forSale: false, salePrice: 0 });
    return { success: true };
  },
});

export const sellAllCars = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const vehicles = await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    let total = 0;
    for (const veh of vehicles) {
      const basePrice = (veh.purchasePrice ?? 0) > 0 ? veh.purchasePrice : (veh.speed ?? 50) * 1000;
      const damageFactor = 1 - (n(veh.damage, 0) / 100) * 0.7;
      total += Math.max(500, Math.floor(basePrice * damageFactor * 0.6));
      await ctx.db.delete(veh._id);
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) + total });
    return { success: true, total, count: vehicles.length };
  },
});

// ===== SCRAPYARD =====
export const meltCars = mutation({
  args: { vehicleIds: v.array(v.id("vehicles")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const limit = meltLimitFor(player);
    if (args.vehicleIds.length < 1) throw new Error("Select at least one car to melt");
    if (args.vehicleIds.length > limit) throw new Error(`Your melt limit is ${limit} cars`);
    let bullets = d.bullets;
    let count = 0;
    for (const id of args.vehicleIds) {
      const veh = await ctx.db.get(id);
      if (!veh || veh.userId !== player._id) continue;
      const basePrice = (veh.purchasePrice ?? 0) > 0 ? veh.purchasePrice : (veh.speed ?? 50) * 1000;
      const bulletYield = Math.max(5, Math.floor(basePrice / 100) * (1 - (n(veh.damage, 0) / 100) * 0.5));
      bullets += bulletYield;
      count++;
      await ctx.db.delete(id);
    }
    await ctx.db.patch(player._id, {
      bullets,
      carsMelted: d.carsMelted + count,
      lastAutoMelt: Date.now(),
    });
    return { success: true, bullets, count };
  },
});

export const autoMelt = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const now = Date.now();
    if (now - d.lastAutoMelt < 5 * 60 * 1000) {
      const remaining = Math.ceil((5 * 60 * 1000 - (now - d.lastAutoMelt)) / 1000);
      throw new Error(`Scrapyard furnace cooling — ${remaining}s until next auto-melt`);
    }
    const vehicles = await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const meltable = vehicles.filter((v: any) => v.isWreck || n(v.damage, 0) >= 40);
    if (vehicles.length < 10) throw new Error("Auto-melt requires at least 10 cars in the scrapyard");
    if (meltable.length === 0) throw new Error("No wrecked/damaged cars to melt");
    const limit = meltLimitFor(player);
    const chosen = meltable.slice(0, limit);
    let bullets = d.bullets;
    let count = 0;
    for (const veh of chosen) {
      const basePrice = (veh.purchasePrice ?? 0) > 0 ? veh.purchasePrice : (veh.speed ?? 50) * 1000;
      bullets += Math.max(5, Math.floor(basePrice / 100) * (1 - (n(veh.damage, 0) / 100) * 0.5));
      count++;
      await ctx.db.delete(veh._id);
    }
    await ctx.db.patch(player._id, { bullets, carsMelted: d.carsMelted + count, lastAutoMelt: now });
    return { success: true, count, bullets, limit };
  },
});

export const buyBullets = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const amount = Math.floor(args.amount);
    if (amount < 1 || amount > 1000) throw new Error("Purchase between 1 and 1,000 bullets");
    const pricePer = 17_250;
    const cost = amount * pricePer;
    if (n(player.money, 0) < cost) throw new Error("Not enough money!");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, bullets: n(player.bullets, 0) + amount });
    return { success: true, amount, cost };
  },
});

// ===== REPAIR =====
export const repairCar = mutation({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const veh = await ctx.db.get(args.vehicleId);
    if (!veh || veh.userId !== player._id) throw new Error("Not your vehicle");
    const damage = n(veh.damage, 0);
    if (damage <= 0) throw new Error("Car is already in perfect condition");
    const basePrice = (veh.purchasePrice ?? 0) > 0 ? veh.purchasePrice : (veh.speed ?? 50) * 1000;
    const cost = Math.max(100, Math.floor((damage / 100) * basePrice * 0.05));
    if (n(player.money, 0) < cost) throw new Error("Not enough money for repairs!");
    const rarity = (veh.rarity as string) ?? "common";
    await ctx.db.patch(args.vehicleId, { damage: 0 });
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - cost,
      carsRepaired: d.carsRepaired + 1,
      totalRepairSpent: d.totalRepairSpent + cost,
      legendaryRepaired: d.legendaryRepaired + (rarity === "legendary" ? 1 : 0),
      epicRepaired: d.epicRepaired + (rarity === "epic" ? 1 : 0),
      rareRepaired: d.rareRepaired + (rarity === "rare" ? 1 : 0),
      commonRepaired: d.commonRepaired + (rarity === "common" || rarity === "20s" || rarity === "custom" || rarity === "exclusive" || rarity === "exotic" ? 1 : 0),
    });
    return { success: true, cost };
  },
});

export const repairAllCars = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const d = ensureDefaults(player);
    const vehicles = await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    let totalCost = 0;
    let count = 0;
    for (const veh of vehicles) {
      const damage = n(veh.damage, 0);
      if (damage <= 0) continue;
      const basePrice = (veh.purchasePrice ?? 0) > 0 ? veh.purchasePrice : (veh.speed ?? 50) * 1000;
      totalCost += Math.max(100, Math.floor((damage / 100) * basePrice * 0.05));
      count++;
      await ctx.db.patch(veh._id, { damage: 0 });
    }
    if (count === 0) throw new Error("No cars need repair");
    if (n(player.money, 0) < totalCost) throw new Error("Not enough money for repairs!");
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - totalCost,
      carsRepaired: d.carsRepaired + count,
      totalRepairSpent: d.totalRepairSpent + totalCost,
    });
    return { success: true, cost: totalCost, count };
  },
});

export const damageCar = mutation({
  args: { vehicleId: v.id("vehicles"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const veh = await ctx.db.get(args.vehicleId);
    if (!veh || veh.userId !== player._id) throw new Error("Not your vehicle");
    const damage = Math.min(100, n(veh.damage, 0) + args.amount);
    await ctx.db.patch(args.vehicleId, { damage, isWreck: damage >= 95 });
    return { success: true, damage };
  },
});

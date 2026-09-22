import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { applyIntelligence, trainingWage, intelligencePct, TEAM_TRAINING_MULTIPLIER } from "./intelligence";

/* ══════════════════════════════════════════════════════════════
   ULTIMATE ARSENAL — six brand-new game systems:
   1. Underground Arena   — bet on AI vs AI fights, watch round-by-round
   2. Street Trainer      — pay coaches for temporary atk/def buffs
   3. Gun Range           — burn bullets for temporary accuracy buffs
   4. Street Race Stakes  — wager on your car's speed vs rival crews
   5. Safehouse Hotel     — check out of the city, cash accrues per hour
   6. Tipsy Informant     — buy rumors that make your next crime safer
   ══════════════════════════════════════════════════════════════ */

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

/* ───────────── 1. UNDERGROUND ARENA ───────────── */

const ARENA_FIGHTERS = [
  { id: "golden_jab", name: "Golden Jab Eddie", power: 42, odds: 1.55, style: "Boxer", icon: "🥊" },
  { id: "iron_latin", name: "Iron Ivan", power: 58, odds: 1.85, style: "Slugger", icon: "🧊" },
  { id: "miko_fast", name: "Miko Fasthands", power: 49, odds: 1.7, style: "Counter", icon: "🤾" },
  { id: "steel_bella", name: "Steel Bella", power: 66, odds: 2.1, style: "All-round", icon: "💪" },
  { id: "ghost_kim", name: "Ghostface Kim", power: 74, odds: 2.4, style: "Brawler", icon: "👻" },
  { id: "tank_orlov", name: "Tank Orlov", power: 83, odds: 2.8, style: "Tank", icon: "🛡️" },
  { id: "venom_rosa", name: "Venom Rosa", power: 91, odds: 3.2, style: "Precision", icon: "🐍" },
  { id: "death_sinha", name: "Deathrow Sinha", power: 99, odds: 3.6, style: "Legend", icon: "☠️" },
];

const ARENA_RIVALS = [
  { id: "boulder", name: "The Boulder", power: 40, style: "Slugger", icon: "🪨" },
  { id: "whisper", name: "Whisper", power: 52, style: "Counter", icon: "🤫" },
  { id: "mayhem", name: "Miss Mayhem", power: 60, style: "Brawler", icon: "🌀" },
  { id: "coffin", name: "Coffin Ed", power: 70, style: "Tank", icon: "⚰️" },
  { id: "razor", name: "Razor Ramone", power: 80, style: "Precision", icon: "🪒" },
  { id: "hyena", name: "The Hyena", power: 88, style: "Wild", icon: "🦴" },
  { id: "dread", name: "Dreadnought", power: 96, style: "Legend", icon: "⚓" },
];

const ROUND_LINES = [
  "jabs twice and slips a counter",
  "eats a body shot and grins",
  "goes down but beats the count",
  "lands a crushing liver shot",
  "bites down on the mouthpiece and swings wild",
  " clinches and resets",
  "dances out of range to boos from the crowd",
  "lands the overhand right of the night",
];

export const getArenaState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const history = await ctx.db
      .query("arenaFights")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .order("desc")
      .take(12);
    return { fighters: ARENA_FIGHTERS, rivals: ARENA_RIVALS, history };
  },
});

export const betArenaFight = mutation({
  args: { fighterId: v.string(), rivalId: v.string(), wager: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const wager = Math.floor(n(args.wager, 0));
    if (wager < 100) throw new Error("Minimum wager is $100.");
    if (n(player.money, 0) < wager) throw new Error("Not enough money.");

    const fighter = ARENA_FIGHTERS.find((f) => f.id === args.fighterId);
    const rival = ARENA_RIVALS.find((r) => r.id === args.rivalId);
    if (!fighter || !rival) throw new Error("Unknown fighter.");

    // Score = power roll + crowd-favorite edge for cheaper odds.
    const pRoll = fighter.power + randInt(-12, 18);
    const rRoll = rival.power + randInt(-10, 22);
    const won = pRoll >= rRoll;
    const payout = won ? Math.floor(wager * fighter.odds) : 0;

    const rounds = randInt(1, 5);
    const commentary: string[] = [];
    for (let r = 1; r <= rounds; r++) {
      const a = ROUND_LINES[randInt(0, ROUND_LINES.length - 1)];
      const b = ROUND_LINES[randInt(0, ROUND_LINES.length - 1)];
      commentary.push(`R${r}: ${fighter.name.split(" ")[0]} ${a}, ${rival.name} ${b}.`);
    }
    commentary.push(won ? `🏆 ${fighter.name} wins by ${won && rounds >= 4 ? "knockout" : "decision"}!` : `💀 ${rival.name} takes it. Brutal.`);

    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - wager + payout,
      points: n(player.points, 0) + (won ? 2 : 0),
      ...(await addXpAndCheckLevel(ctx, player, won ? 30 : 10)),
    });

    const id = await ctx.db.insert("arenaFights", {
      playerId: player._id,
      pickId: fighter.id,
      pickName: fighter.name,
      rivalId: rival.id,
      rivalName: rival.name,
      wager,
      oddsPick: fighter.odds,
      oddsRival: 1 + (1 / Math.max(0.2, fighter.odds - 1)),
      status: "finished",
      winnerId: won ? fighter.id : rival.id,
      rounds,
      won,
      payout,
      commentary,
      createdAt: Date.now(),
      resolvedAt: Date.now(),
    });
    return { won, payout, rounds, commentary, fightId: id };
  },
});

/* ───────────── 2. STREET TRAINER ───────────── */

const TRAINERS = [
  { id: "boxing", name: "Rocky's Boxing Gym", icon: "🥊", hours: 12, atk: 6, def: 2, cost: 45_000 },
  { id: "mma", name: "Cage Warriors MMA", icon: "🤼", hours: 24, atk: 10, def: 6, cost: 120_000 },
  { id: "weapons", name: "Tac-Fire Weapons Camp", icon: "🎯", hours: 24, atk: 14, def: 3, cost: 200_000 },
  { id: "survival", name: "Ghost Protocol Survival", icon: "🏕️", hours: 48, atk: 8, def: 14, cost: 260_000 },
];

export const getTrainerState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const sessions = await ctx.db
      .query("trainerSessions")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .order("desc")
      .take(6);
    return { trainers: TRAINERS, sessions: sessions.filter((s) => s.expiresAt > Date.now()) };
  },
});

export const hireTrainer = mutation({
  args: { trainerId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const t = TRAINERS.find((x) => x.id === args.trainerId);
    if (!t) throw new Error("Unknown trainer.");
    if (n(player.money, 0) < t.cost) throw new Error("Not enough money.");

    const expiresAt = Date.now() + t.hours * 3600_000;
    // INTELLIGENCE: team training enjoys superior percentage-based benefits (2× the bonus)
    // — extra XP + a cash wage scaled by the +1%-per-5-levels advantage.
    const teamXP = applyIntelligence(40, (player as any).level ?? 1, TEAM_TRAINING_MULTIPLIER);
    const wage = trainingWage((player as any).level ?? 1, TEAM_TRAINING_MULTIPLIER);
    const xp = await addXpAndCheckLevel(ctx, player, teamXP);
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - t.cost + wage,
      attack: n(player.attack, 10) + t.atk,
      defense: n(player.defense, 10) + t.def,
      ...xp,
    });
    await ctx.db.insert("trainerSessions", {
      userId: player._id,
      kind: t.id,
      buffAttack: t.atk,
      buffDefense: t.def,
      expiresAt,
      createdAt: Date.now(),
    });
    return { ok: true, name: t.name, atk: t.atk, def: t.def, hours: t.hours, wage, intelBonusPct: intelligencePct((player as any).level ?? 1) * TEAM_TRAINING_MULTIPLIER };
  },
});

/* ───────────── 3. GUN RANGE ───────────── */

const RANGE_PACKAGES = [
  { id: "basic", name: "Paper Targets", icon: "🎯", bullets: 50, hours: 6, gain: 3, cost: 20_000 },
  { id: "advanced", name: "Moving Targets", icon: "🎪", bullets: 150, hours: 12, gain: 6, cost: 60_000 },
  { id: "elite", name: "Night Ops Drill", icon: "🌙", bullets: 400, hours: 24, gain: 10, cost: 180_000 },
];

export const getRangeState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const sessions = await ctx.db
      .query("rangeSessions")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .order("desc")
      .take(6);
    return {
      packages: RANGE_PACKAGES,
      sessions: sessions.filter((s) => s.expiresAt > Date.now()),
      bullets: n((player as any).bullets, 0),
    };
  },
});

export const practiceRange = mutation({
  args: { packageId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const p = RANGE_PACKAGES.find((x) => x.id === args.packageId);
    if (!p) throw new Error("Unknown package.");
    if (n((player as any).bullets, 0) < p.bullets) throw new Error(`Need ${p.bullets} bullets.`);
    if (n(player.money, 0) < p.cost) throw new Error("Not enough money.");

    const expiresAt = Date.now() + p.hours * 3600_000;
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - p.cost,
      bullets: n((player as any).bullets, 0) - p.bullets,
      attack: n(player.attack, 10) + p.gain,
    });
    await ctx.db.insert("rangeSessions", {
      userId: player._id,
      bulletsUsed: p.bullets,
      accuracyGain: p.gain,
      expiresAt,
      createdAt: Date.now(),
    });
    return { ok: true, gain: p.gain, hours: p.hours };
  },
});

/* ───────────── 4. STREET RACE STAKES ───────────── */

const RACE_CREWS = [
  { name: "Midnight Titans", skill: 62, taunt: "\"Your ride is a shopping cart.\"" },
  { name: "Redline Devils", skill: 70, taunt: "\"We own the tunnel after dark.\"" },
  { name: "Neon Syndicate", skill: 78, taunt: "\"Bring a compass — you'll get lost.\"" },
  { name: "Ghost Circuit", skill: 86, taunt: "\"Nobody beats the Ghost. Nobody.\"" },
];

export const getRaceStakesState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const cars = await ctx.db
      .query("vehicles")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
    const history = await ctx.db
      .query("streetRaceStakes")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .order("desc")
      .take(10);
    return { crews: RACE_CREWS, cars, history };
  },
});

export const raceStakes = mutation({
  args: { crewIndex: v.number(), vehicleId: v.optional(v.id("vehicles")), wager: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const wager = Math.floor(n(args.wager, 0));
    if (wager < 500) throw new Error("Minimum stake is $500.");
    if (n(player.money, 0) < wager) throw new Error("Not enough money.");

    let speed = 45; // beater car default
    let carName = "Rental Beater";
    if (args.vehicleId) {
      const car = await ctx.db.get(args.vehicleId);
      if (car && (car as any).userId === player._id) {
        speed = n((car as any).speed, 45);
        carName = (car as any).name ?? carName;
      }
    }

    const crew = RACE_CREWS[Math.max(0, Math.min(RACE_CREWS.length - 1, args.crewIndex))];
    // Player edge: car speed dominates, random slip decides close races.
    const pRoll = speed + randInt(-8, 14);
    const cRoll = crew.skill + randInt(-6, 16);
    const won = pRoll >= cRoll;
    const payout = won ? Math.floor(wager * (1.45 + (crew.skill - 60) * 0.012)) : 0;

    await ctx.db.patch(player._id, {
      money: n(player.money, 0) - wager + payout,
      points: n(player.points, 0) + (won ? 3 : 0),
      ...(await addXpAndCheckLevel(ctx, player, won ? 40 : 12)),
    });
    await ctx.db.insert("streetRaceStakes", {
      playerId: player._id,
      opponentName: crew.name,
      opponentSkill: crew.skill,
      carSpeed: speed,
      wager,
      status: won ? "won" : "lost",
      payout,
      createdAt: Date.now(),
      resolvedAt: Date.now(),
    });
    return { won, payout, crew: crew.name, taunt: crew.taunt, carName, speed, crewRoll: cRoll, yourRoll: pRoll };
  },
});

/* ───────────── 5. SAFEHOUSE HOTEL ───────────── */

const HOTEL_SUITES = [
  { id: "motel", name: "Dockside Motel", icon: "🛏️", hours: 12, perHour: 25_000, cost: 50_000 },
  { id: "loft", name: "Warehouse Loft", icon: "🏢", hours: 24, perHour: 45_000, cost: 150_000 },
  { id: "penthouse", name: "Skyline Penthouse", icon: "🌆", hours: 48, perHour: 80_000, cost: 400_000 },
  { id: "bunker", name: "Blackout Bunker", icon: "🕳️", hours: 72, perHour: 120_000, cost: 900_000 },
];

export const getHotelState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const stays = await ctx.db
      .query("hotelStays")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .order("desc")
      .take(8);
    return { suites: HOTEL_SUITES, stays };
  },
});

export const bookHotel = mutation({
  args: { suiteId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const s = HOTEL_SUITES.find((x) => x.id === args.suiteId);
    if (!s) throw new Error("Unknown suite.");
    if (n(player.money, 0) < s.cost) throw new Error("Not enough money.");

    await ctx.db.patch(player._id, { money: n(player.money, 0) - s.cost });
    await ctx.db.insert("hotelStays", {
      userId: player._id,
      suite: s.name,
      cost: s.cost,
      perHour: s.perHour,
      startedAt: Date.now(),
      endsAt: Date.now() + s.hours * 3600_000,
      claimed: false,
    });
    return { ok: true, suite: s.name, perHour: s.perHour, hours: s.hours };
  },
});

export const collectHotelIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const now = Date.now();
    const stays = await ctx.db
      .query("hotelStays")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .collect();
    let total = 0;
    for (const stay of stays) {
      if (stay.claimed) continue;
      const elapsedH = Math.max(0, Math.min(now, stay.endsAt) - stay.startedAt) / 3600_000;
      total += Math.floor(elapsedH * stay.perHour);
      await ctx.db.patch(stay._id, { claimed: true, claimedAmount: Math.floor(elapsedH * stay.perHour) });
    }
    if (total > 0) {
      await ctx.db.patch(player._id, { money: n(player.money, 0) + total });
    }
    return { total };
  },
});

/* ───────────── 6. TIPSY INFORMANT ───────────── */

const TIP_POOL = [
  "Cops are shifting patrol routes downtown — heat runs cold tonight.",
  "A mark on 5th flashes cash every Friday. No bodyguards seen.",
  "The pawnshop owner eyes his safe during lunch. Alone.",
  "The docks get fog thick as soup at 3am. Cameras useless.",
  "Rival crew is drunk at the racecourse. warehouses unwatched.",
  "A judge got greedy — courthouse security is looking elsewhere.",
  "Alarm company went bankrupt. Half the district runs silent alarms.",
  "The night porter sells master keys. Cheap.",
];

export const getInformantState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const tips = await ctx.db
      .query("informantTips")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .order("desc")
      .take(6);
    return { tips: tips.filter((t) => t.expiresAt > Date.now()) };
  },
});

export const buyInformantTip = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 75_000;
    if (n(player.money, 0) < cost) throw new Error("Not enough money. A tip costs $75,000.");

    const tip = TIP_POOL[randInt(0, TIP_POOL.length - 1)];
    const expiresAt = Date.now() + 2 * 3600_000; // 2 hours of safer crimes
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("informantTips", { userId: player._id, tip, cost, expiresAt, createdAt: Date.now() });
    return { tip };
  },
});

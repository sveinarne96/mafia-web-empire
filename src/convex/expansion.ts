import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";

/* ══════════════════════════════════════════════════════════════
   EXPANSION PACK — 12 street-racket systems:
   1. Dockworker Hustle   7. Night Market Stalls
   2. Chop-Shop Parts     8. Cable Piracy Ring
   3. Graffiti Crew       9. Numbers Racket
   4. Pawn Shop Flips    10. Valet Hustle
   5. Cab Company        11. Bathhouse
   6. Junkyard Dogs      12. Skyline Billboards
   ══════════════════════════════════════════════════════════════ */

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

/* ───────────── 1. DOCKWORKER HUSTLE ───────────── */
const DOCK_SHIFTS = [
  { id: "day", name: "Day Shift", icon: "☀️", crates: 8, pay: 14_000, xp: 12 },
  { id: "night", name: "Night Shift", icon: "🌙", crates: 10, pay: 22_000, xp: 18 },
  { id: "ghost", name: "Ghost Manifest", icon: "👻", crates: 14, pay: 41_000, xp: 30 },
];

export const getDockState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const history = await ctx.db.query("dockShifts").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(8);
    return { shifts: DOCK_SHIFTS, history };
  },
});

export const workDockShift = mutation({
  args: { shiftId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const s = DOCK_SHIFTS.find((x) => x.id === args.shiftId);
    if (!s) throw new Error("Unknown shift.");
    const crates = randInt(Math.floor(s.crates * 0.6), s.crates);
    const earned = crates * Math.floor(s.pay / s.crates);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, totalCrimes: n(player.totalCrimes, 0) + 1, ...(await addXpAndCheckLevel(ctx, player, s.xp)) });
    await ctx.db.insert("dockShifts", { userId: player._id, shiftType: s.name, earned, crates, createdAt: Date.now() });
    return { earned, crates, text: `Unloaded ${crates} crates — ${"$" + earned.toLocaleString()} cash in hand.` };
  },
});

/* ───────────── 2. CHOP-SHOP PARTS ───────────── */
const CAR_PARTS = ["Turbocharger", "BBS Rims", "Leather Seats", "Nitrous Kit", "V8 Engine Block", "Bulletproof Glass", "Sport Exhaust", "GPS Jammer"];

export const getChopState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const parts = await ctx.db.query("chopParts").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(20);
    const unsold = parts.filter((p) => !p.sold);
    const cars = await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { parts: unsold, history: parts.filter((p) => p.sold).slice(0, 8), cars };
  },
});

export const stripCar = mutation({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const car = await ctx.db.get(args.vehicleId);
    if (!car || (car as any).userId !== player._id) throw new Error("That car is not in your garage.");
    const carName = (car as any).name ?? "Unknown car";
    await ctx.db.delete(args.vehicleId);
    const partsMade = randInt(2, 4);
    let totalValue = 0;
    for (let i = 0; i < partsMade; i++) {
      const partName = pick(CAR_PARTS);
      const value = randInt(8_000, 45_000);
      totalValue += value;
      await ctx.db.insert("chopParts", { userId: player._id, partName, value, source: carName, sold: false, createdAt: Date.now() });
    }
    return { partsMade, totalValue, carName, text: `Stripped ${carName} into ${partsMade} parts worth ${"$" + totalValue.toLocaleString()}.` };
  },
});

export const sellChopPart = mutation({
  args: { partId: v.id("chopParts") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const part = await ctx.db.get(args.partId);
    if (!part || (part as any).userId !== player._id) throw new Error("Part not found.");
    if ((part as any).sold) throw new Error("Already sold.");
    const soldFor = Math.floor(n((part as any).value, 0) * (0.85 + Math.random() * 0.4));
    await ctx.db.patch(args.partId, { sold: true, soldFor, soldAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + soldFor });
    return { soldFor, partName: (part as any).partName };
  },
});

/* ───────────── 3. GRAFFITI CREW ───────────── */
const TAG_SPOTS = ["Overpass", "Train Yard", "Court Wall", "Club Backstreet", "Police Precinct", "Rival turf", "Highway Pillar", "Rooftop Water Tower"];
const TAG_FAME = ["🔥 Respect earned", "💥 Crew noticed", "📸 Went viral", "👑 Legendary piece"];

export const getGraffitiState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const tags = await ctx.db.query("graffitiTags").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(10);
    const totalFame = tags.reduce((s, t) => s + n(t.fame, 0), 0);
    return { spots: TAG_SPOTS, tags, totalFame };
  },
});

export const sprayTag = mutation({
  args: { spot: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const caught = Math.random() < 0.22;
    const fame = caught ? 0 : randInt(3, 18);
    await ctx.db.insert("graffitiTags", { userId: player._id, spot: args.spot, fame, caught, createdAt: Date.now() });
    if (caught) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1), points: Math.max(0, n(player.points, 0) - 3) });
      return { caught, fame: 0, text: `Caught tagging ${args.spot}! +1 wanted level, -3 points.` };
    }
    const headline = pick(TAG_FAME);
    await ctx.db.patch(player._id, { points: n(player.points, 0) + 4, ...(await addXpAndCheckLevel(ctx, player, 15)) });
    return { caught, fame, text: `Tagged ${args.spot} — +${fame} fame. ${headline}` };
  },
});

/* ───────────── 4. PAWN SHOP FLIPS ───────────── */
const PAWN_GOODS = [
  { name: "Gold Watch", min: 2_000, max: 6_000 },
  { name: "Silver Necklace", min: 900, max: 3_000 },
  { name: "Antique Pistol", min: 5_000, max: 14_000 },
  { name: "Signed Baseball", min: 500, max: 2_500 },
  { name: "Diamond Ring", min: 8_000, max: 22_000 },
  { name: "Rare Vinyl", min: 300, max: 1_800 },
  { name: "Rolex Submariner", min: 12_000, max: 31_000 },
  { name: "Hot Laptop", min: 1_500, max: 4_500 },
];

export const getPawnState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const flips = await ctx.db.query("pawnFlips").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(10);
    return { goods: PAWN_GOODS, flips };
  },
});

export const pawnFlip = mutation({
  args: { goodIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const good = PAWN_GOODS[Math.max(0, Math.min(PAWN_GOODS.length - 1, args.goodIndex))];
    const boughtFor = randInt(good.min, good.max);
    if (n(player.money, 0) < boughtFor) throw new Error(`Need ${"$" + boughtFor.toLocaleString()} to buy the ${good.name}.`);
    const soldFor = Math.floor(boughtFor * (0.7 + Math.random() * 1.1));
    const profit = soldFor - boughtFor;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - boughtFor + soldFor, ...(await addXpAndCheckLevel(ctx, player, profit > 0 ? 14 : 6)) });
    await ctx.db.insert("pawnFlips", { userId: player._id, itemName: good.name, boughtFor, soldFor, profit, createdAt: Date.now() });
    return { boughtFor, soldFor, profit, itemName: good.name, text: profit > 0 ? `Flipped ${good.name} for ${"$" + profit.toLocaleString()} profit!` : `Lost ${"$" + Math.abs(profit).toLocaleString()} on the ${good.name}. The fence lowballed you.` };
  },
});

/* ───────────── 5. CAB COMPANY ───────────── */
const CAB_INTEL = [
  "A whale dropped $40k at the roulette table tonight.",
  "Two suitcases changed hands at the bus depot.",
  "The mayor's driver drinks on duty. Every night.",
  "Cargo ship Meridian docks Thursday. No manifest.",
  "Rival crew is meeting at the old cannery.",
  "The diamonds moved through the flower market.",
];

export const getCabState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const shifts = await ctx.db.query("cabShifts").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(8);
    return { shifts };
  },
});

export const driveCabShift = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const fares = randInt(4, 12);
    const earned = fares * randInt(900, 2_600);
    const intel = Math.random() < 0.35 ? pick(CAB_INTEL) : undefined;
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, energy: Math.max(0, n((player as any).energy, 100) - 8), ...(await addXpAndCheckLevel(ctx, player, 16)) });
    await ctx.db.insert("cabShifts", { userId: player._id, fares, earned, intel, createdAt: Date.now() });
    return { fares, earned, intel, text: `${fares} fares — ${"$" + earned.toLocaleString()} tips included.` };
  },
});

/* ───────────── 6. JUNKYARD DOGS ───────────── */
const DOG_BREEDS = [
  { breed: "Pit Bull", icon: "🐕", cost: 60_000, power: 8 },
  { breed: "Rottweiler", icon: "🐕‍🦺", cost: 110_000, power: 12 },
  { breed: "Cane Corso", icon: "🐺", cost: 190_000, power: 16 },
  { breed: "Wolf Hybrid", icon: "🐺", cost: 340_000, power: 22 },
];

export const getDogState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const dogs = await ctx.db.query("junkyardDogs").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { breeds: DOG_BREEDS, dogs };
  },
});

export const buyDog = mutation({
  args: { breedIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const b = DOG_BREEDS[Math.max(0, Math.min(DOG_BREEDS.length - 1, args.breedIndex))];
    if (n(player.money, 0) < b.cost) throw new Error("Not enough money.");
    const names = ["Bruiser", "Fang", "Duke", "Mayhem", "Bullet", "Sable", "Tank", "Ghost"];
    await ctx.db.patch(player._id, { money: n(player.money, 0) - b.cost, defense: n(player.defense, 10) + b.power });
    await ctx.db.insert("junkyardDogs", { userId: player._id, name: pick(names), breed: b.breed, level: 1, loyalty: randInt(40, 70), boughtAt: Date.now() });
    return { text: `${b.breed} trained & chained — +${b.power} DEF permanently.`, power: b.power };
  },
});

export const trainDog = mutation({
  args: { dogId: v.id("junkyardDogs") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const dog = await ctx.db.get(args.dogId);
    if (!dog || (dog as any).userId !== player._id) throw new Error("Dog not found.");
    const cost = 25_000;
    if (n(player.money, 0) < cost) throw new Error("Training costs $25,000.");
    const gain = randInt(1, 3);
    await ctx.db.patch(args.dogId, { level: n((dog as any).level, 1) + 1, loyalty: Math.min(100, n((dog as any).loyalty, 50) + randInt(4, 10)), trainedAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, defense: n(player.defense, 10) + gain });
    return { text: `${(dog as any).name} leveled up — +${gain} DEF.`, gain };
  },
});

/* ───────────── 7. NIGHT MARKET STALLS ───────────── */
const STALL_GOODS = ["Counterfeit Sneakers", "Grey-market Cigs", "Bootleg DVDs", "Hot Perfume", "Fake IDs", "Untaxed Liquor", "Stolen Phones", "Replica Watches"];

export const getNightMarketState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const stalls = await ctx.db.query("nightStalls").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { goods: STALL_GOODS, stalls: stalls.filter((s) => s.active) };
  },
});

export const openNightStall = mutation({
  args: { goodIndex: v.number(), stallName: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 90_000;
    if (n(player.money, 0) < cost) throw new Error("Renting a stall costs $90,000.");
    if (args.stallName.trim().length < 2) throw new Error("Give your stall a name.");
    const active = await ctx.db.query("nightStalls").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (active.filter((s) => s.active).length >= 3) throw new Error("You already run 3 stalls — that's the market cap.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("nightStalls", {
      userId: player._id,
      stallName: args.stallName.trim().slice(0, 32),
      goods: STALL_GOODS[Math.max(0, Math.min(STALL_GOODS.length - 1, args.goodIndex))],
      earned: 0,
      lastCollectAt: Date.now(),
      active: true,
      createdAt: Date.now(),
    });
    return { text: `"${args.stallName.trim()}" is open for business in the night bazaar.` };
  },
});

export const collectNightStall = mutation({
  args: { stallId: v.id("nightStalls") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const stall = await ctx.db.get(args.stallId);
    if (!stall || (stall as any).userId !== player._id) throw new Error("Stall not found.");
    const hours = Math.max(0, (Date.now() - n((stall as any).lastCollectAt, Date.now())) / 3600_000);
    const earned = Math.floor(hours * randInt(9_000, 15_000));
    if (earned <= 0) return { text: "Give it an hour — nothing on the mat yet." };
    await ctx.db.patch(args.stallId, { earned: n((stall as any).earned, 0) + earned, lastCollectAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned });
    return { text: `Collected ${"$" + earned.toLocaleString()} from "${(stall as any).stallName}".` };
  },
});

export const closeNightStall = mutation({
  args: { stallId: v.id("nightStalls") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const stall = await ctx.db.get(args.stallId);
    if (!stall || (stall as any).userId !== player._id) throw new Error("Stall not found.");
    await ctx.db.patch(args.stallId, { active: false });
    return { text: `"${(stall as any).stallName}" shut down.` };
  },
});

/* ───────────── 8. CABLE PIRACY RING ───────────── */
const DISTRICTS = ["Docklands", "Uptown", "Old Quarter", "Steel Row", "The Heights", "Harbor Side"];

export const getCableState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const taps = await ctx.db.query("cableTaps").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(10);
    return { districts: DISTRICTS, taps };
  },
});

export const tapCable = mutation({
  args: { district: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const raided = Math.random() < 0.25;
    if (raided) {
      const fine = randInt(20_000, 60_000);
      await ctx.db.patch(player._id, { money: Math.max(0, n(player.money, 0) - fine), wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1) });
      await ctx.db.insert("cableTaps", { userId: player._id, district: args.district, earned: 0, raided: true, createdAt: Date.now() });
      return { raided: true, earned: 0, text: `Raided in ${args.district}! Fined ${"$" + fine.toLocaleString()} and +1 wanted.` };
    }
    const earned = randInt(12_000, 38_000);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, ...(await addXpAndCheckLevel(ctx, player, 14)) });
    await ctx.db.insert("cableTaps", { userId: player._id, district: args.district, earned, raided: false, createdAt: Date.now() });
    return { raided: false, earned, text: `Tapped ${args.district} — ${"$" + earned.toLocaleString()} in subscriptions this week.` };
  },
});

/* ───────────── 9. NUMBERS RACKET ───────────── */
export const getNumbersState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const bets = await ctx.db.query("numbersBets").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(12);
    return { bets };
  },
});

export const playNumbers = mutation({
  args: { numbers: v.string(), bet: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const clean = args.numbers.replace(/\D/g, "").slice(0, 3);
    if (clean.length !== 3) throw new Error("Pick exactly 3 digits (0-9).");
    const bet = Math.floor(n(args.bet, 0));
    if (bet < 100) throw new Error("Minimum bet is $100.");
    if (n(player.money, 0) < bet) throw new Error("Not enough money.");
    const drawn = String(randInt(0, 999)).padStart(3, "0");
    const won = drawn === clean;
    // Exact pays 600x, one-off (2 digits right) pays 20x
    let payout = 0;
    let label = "clean miss";
    if (won) { payout = bet * 600; label = "JACKPOT — exact hit!"; }
    else {
      const digitsRight = [...drawn].filter((d, i) => d === clean[i]).length;
      if (digitsRight === 2) { payout = bet * 20; label = "Two digits — solid hit!"; }
      else if (digitsRight === 1) { payout = bet * 3; label = "One digit — small return."; }
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) - bet + payout, points: won ? n(player.points, 0) + 15 : n(player.points, 0), ...(await addXpAndCheckLevel(ctx, player, won ? 60 : 8)) });
    await ctx.db.insert("numbersBets", { userId: player._id, numbers: clean, bet, payout: payout || undefined, won, drawn, createdAt: Date.now() });
    return { won, payout, drawn, label, text: `Draw: ${drawn}. ${won ? "💥 " + label : digitsRightMsg(clean, drawn)}` };
  },
});

function digitsRightMsg(pick3: string, drawn: string): string {
  const right = [...drawn].filter((d, i) => d === pick3[i]).length;
  if (right === 2) return "🎯 Two digits right — 20x!";
  if (right === 1) return "One digit right — 3x back.";
  return "No hits. The wheel owes you nothing.";
}

/* ───────────── 10. VALET HUSTLE ───────────── */
const VALET_CARS = ["Bugatti Chiron", "Rolls Phantom", "Ferrari Roma", "McLaren 720S", "Lambo Urus", "Bentley GT", "Maybach S580", "Porsche 918"];

export const getValetState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const runs = await ctx.db.query("valetRuns").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(10);
    return { runs };
  },
});

export const workValet = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const car = pick(VALET_CARS);
    const earned = randInt(1_200, 4_800);
    const stole = Math.random() < 0.12;
    if (stole) {
      const hotValue = randInt(90_000, 260_000);
      try {
        await ctx.db.insert("vehicles", { userId: player._id, name: `Stolen ${car}`, type: "stolen", speed: randInt(70, 95), storage: randInt(6, 14), armored: false, stolen: true, purchasePrice: hotValue });
      } catch {}
      await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2) });
      await ctx.db.insert("valetRuns", { userId: player._id, carName: car, earned, stole: true, createdAt: Date.now() });
      return { stole: true, earned, text: `You "lost" the ${car}. It's in your garage now — but +2 wanted level.` };
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, energy: Math.max(0, n((player as any).energy, 100) - 5), ...(await addXpAndCheckLevel(ctx, player, 12)) });
    await ctx.db.insert("valetRuns", { userId: player._id, carName: car, earned, stole: false, createdAt: Date.now() });
    return { stole: false, earned, text: `Parked the ${car} without a scratch — ${"$" + earned.toLocaleString()}.` };
  },
});

/* ───────────── 11. BATHHOUSE ───────────── */
const BATH_SERVICES = [
  { id: "steam", name: "Steam & Scrub", icon: "♨️", cost: 5_000, energy: 40, life: 15 },
  { id: "massage", name: "Deep Massage", icon: "💆", cost: 14_000, energy: 70, life: 35 },
  { id: "royal", name: "Royal Treatment", icon: "👑", cost: 40_000, energy: 100, life: 70 },
];

export const getBathhouseState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    return {
      services: BATH_SERVICES,
      energy: n((player as any).energy, 100),
      life: n(player.life, 100),
      money: n(player.money, 0),
    };
  },
});

export const visitBathhouse = mutation({
  args: { serviceId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const s = BATH_SERVICES.find((x) => x.id === args.serviceId);
    if (!s) throw new Error("Unknown service.");
    if (n(player.money, 0) < s.cost) throw new Error("Not enough money.");
    const energy = Math.min(n((player as any).maxEnergy, 100), n((player as any).energy, 100) + s.energy);
    const life = Math.min(n(player.maxLife, 100), n(player.life, 100) + s.life);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - s.cost, energy, life });
    await ctx.db.insert("bathhouseVisits", { userId: player._id, service: s.name, cost: s.cost, energyRestored: energy, lifeRestored: life, createdAt: Date.now() });
    return { text: `${s.name} — restored to ${energy} energy and ${life} life.` };
  },
});

/* ───────────── 12. SKYLINE BILLBOARDS ───────────── */
const BILLBOARD_SPOTS = [
  { location: "Ring Road Billboard", tier: "Bronze", cost: 120_000, perDay: 60_000 },
  { location: "Downtown Mega-Screen", tier: "Silver", cost: 320_000, perDay: 170_000 },
  { location: "Airport Sky Banner", tier: "Gold", cost: 750_000, perDay: 420_000 },
];

export const getBillboardState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const boards = await ctx.db.query("billboards").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { spots: BILLBOARD_SPOTS, boards: boards.filter((b) => b.active) };
  },
});

export const rentBillboard = mutation({
  args: { spotIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const spot = BILLBOARD_SPOTS[Math.max(0, Math.min(BILLBOARD_SPOTS.length - 1, args.spotIndex))];
    if (n(player.money, 0) < spot.cost) throw new Error("Not enough money.");
    const existing = await ctx.db.query("billboards").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (existing.filter((b) => b.active).length >= 3) throw new Error("You already lease 3 billboards.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - spot.cost });
    await ctx.db.insert("billboards", { userId: player._id, location: spot.location, tier: spot.tier, cost: spot.cost, launderedPerDay: spot.perDay, lastLaunderAt: Date.now(), active: true, createdAt: Date.now() });
    return { text: `${spot.location} leased — your "ad agency" can wash ${"$" + spot.perDay.toLocaleString()}/day.` };
  },
});

export const launderBillboard = mutation({
  args: { boardId: v.id("billboards") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const board = await ctx.db.get(args.boardId);
    if (!board || (board as any).userId !== player._id) throw new Error("Billboard not found.");
    const days = Math.max(0, (Date.now() - n((board as any).lastLaunderAt, Date.now())) / 86_400_000);
    if (n(player.dirtyMoney, 0) <= 0) throw new Error("You have no dirty money to clean.");
    const washable = Math.min(n(player.dirtyMoney, 0), Math.floor(days * n((board as any).launderedPerDay, 0)));
    if (washable <= 0) return { text: "The cycle needs more time — come back tomorrow." };
    await ctx.db.patch(args.boardId, { lastLaunderAt: Date.now() });
    await ctx.db.patch(player._id, { dirtyMoney: Math.max(0, n(player.dirtyMoney, 0) - washable), money: n(player.money, 0) + washable });
    return { text: `Cleaned ${"$" + washable.toLocaleString()} through "${(board as any).location}". Squeaky.` };
  },
});

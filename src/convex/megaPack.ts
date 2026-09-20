import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { racketLevelScale } from "./rackets";

/* ══════════════════════════════════════════════════════════════
   MEGA PACK — player-selected features (numbers = original list):
   1,2,3,4,6 · 10-15 · 23-27 · 28-40 · 46-52 · 56-60 · 69-73 · 78-80
   ══════════════════════════════════════════════════════════════ */

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const money = (v: number) => "$" + Math.floor(v).toLocaleString();

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

/* ════════════ 1. PICKPOCKET TOURISTS ════════════ */
export const pickTourist = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const hour = new Date().getHours();
    const touristHour = hour >= 10 && hour <= 22;
    const base = touristHour ? randInt(900, 2_400) : randInt(300, 900);
    const earned = Math.floor(base * racketLevelScale(player.level ?? 1));
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, ...(await addXpAndCheckLevel(ctx, player, 10)) });
    await ctx.db.insert("touristPockets", { userId: player._id, earned, timeOfDay: touristHour ? "day" : "night", createdAt: Date.now() });
    return { earned, text: touristHour ? `Lifted a wallet in the crowds — ${money(earned)}. Peak tourist season pays.` : `Night streets are thin — only ${money(earned)}.` };
  },
});

/* ════════════ 2. VENDING MACHINES ════════════ */
export const hitVending = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const machines = randInt(3, 9);
    const earned = machines * randInt(40, 160);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, energy: Math.max(0, n((player as any).energy, 100) - 3), ...(await addXpAndCheckLevel(ctx, player, 6)) });
    await ctx.db.insert("vendingHits", { userId: player._id, earned, machines, createdAt: Date.now() });
    return { earned, text: `Shook ${machines} machines loose — ${money(earned)} in coins and snack cash.` };
  },
});

/* ════════════ 3. FOOD TRUCK HIJACK ════════════ */
export const hijackTruck = mutation({
  args: { choice: v.string() }, // truck | till
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const success = Math.random() < 0.6;
    if (!success) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1), life: Math.max(0, n(player.life, 100) - 8) });
      await ctx.db.insert("truckHijacks", { userId: player._id, choice: args.choice, earned: 0, success: false, createdAt: Date.now() });
      return { success: false, earned: 0, text: "The cook pulled a shotgun from under the grill. You left hungry and bleeding." };
    }
    let earned = 0; let text = "";
    if (args.choice === "truck") {
      try {
        await ctx.db.insert("vehicles", { userId: player._id, name: pick(["Taco Titan", "Pasta Truck", "Curry Cruiser", "Wagon of Wings"]), type: "stolen", speed: randInt(30, 45), storage: randInt(24, 40), armored: false, stolen: true, purchasePrice: randInt(15_000, 30_000) });
      } catch {}
      earned = randInt(2_000, 5_000); // till as bonus
      text = `Truck jacked and flipped the till — ${money(earned)}, plus a truck delivered to your garage.`;
    } else {
      earned = Math.floor(randInt(4_000, 9_000) * racketLevelScale(player.level ?? 1));
      text = `Clean till grab — ${money(earned)}. Truck left untouched.`;
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1), ...(await addXpAndCheckLevel(ctx, player, 18)) });
    await ctx.db.insert("truckHijacks", { userId: player._id, choice: args.choice, earned, success: true, createdAt: Date.now() });
    return { success: true, earned, text };
  },
});

/* ════════════ 4. MAIL KEYS + MAILBOX RAID CHAIN ════════════ */
export const stealMailKeys = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 12_000;
    if (n(player.money, 0) < cost) throw new Error(`A copy of the master keys costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    const expiresAt = Date.now() + 24 * 3600_000;
    await ctx.db.insert("mailKeyState", { userId: player._id, hasKeys: true, raidsLeft: 10, expiresAt, createdAt: Date.now() });
    return { text: "Master mail keys copied — 10 mailbox raids unlocked for 24 hours." };
  },
});

export const getMailState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const rows = await ctx.db.query("mailKeyState").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(1);
    const state = rows[0];
    if (!state || state.expiresAt < Date.now() || state.raidsLeft <= 0) return { hasKeys: false, raidsLeft: 0 };
    return { hasKeys: true, raidsLeft: state.raidsLeft };
  },
});

export const raidMailboxes = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("mailKeyState").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(1);
    const state = rows[0];
    if (!state || state.expiresAt < Date.now() || state.raidsLeft <= 0) throw new Error("No valid mail keys. Steal a copy first.");
    const caught = Math.random() < 0.15;
    if (caught) {
      await ctx.db.patch(state._id, { raidsLeft: 0, hasKeys: false });
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1) });
      return { earned: 0, text: "A postal inspector caught you mid-raid. Keys confiscated, +1 wanted." };
    }
    const earned = Math.floor(randInt(600, 1_800) * racketLevelScale(player.level ?? 1));
    const giftCard = Math.random() < 0.2;
    await ctx.db.patch(state._id, { raidsLeft: state.raidsLeft - 1 });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, ...(await addXpAndCheckLevel(ctx, player, 8)) });
    return { earned, text: `Mailbox raid — ${money(earned)}${giftCard ? " and somebody's birthday cash" : ""}. ${state.raidsLeft - 1} raids left.` };
  },
});

/* ════════════ 6. ATM EXPLOSION ════════════ */
export const getDemolitionStock = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return { dynamite: 0 };
    try {
      const items = await ctx.db.query("inventory").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
      const dynamite = items.filter((i: any) => i.name === "Dynamite").reduce((s: number, i: any) => s + n(i.quantity, 1), 0);
      return { dynamite };
    } catch { return { dynamite: 0 }; }
  },
});

export const blastAtm = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    // Consume a dynamite unit from inventory if present
    let hadDynamite = false;
    try {
      const items = await ctx.db.query("inventory").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
      const dyn = items.find((i: any) => i.name === "Dynamite" && n(i.quantity, 1) > 0);
      if (dyn) {
        hadDynamite = true;
        if (n(dyn.quantity, 1) > 1) await ctx.db.patch(dyn._id, { quantity: n(dyn.quantity, 1) - 1 });
        else await ctx.db.delete(dyn._id);
      }
    } catch {}
    const failed = Math.random() < (hadDynamite ? 0.2 : 0.55);
    if (failed) {
      const dmg = hadDynamite ? randInt(5, 15) : randInt(15, 30);
      await ctx.db.patch(player._id, { life: Math.max(0, n(player.life, 100) - dmg), wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2) });
      await ctx.db.insert("atmBlasts", { userId: player._id, earned: 0, wantedGain: 2, createdAt: Date.now() });
      return { success: false, earned: 0, text: hadDynamite ? "The charge cracked the safe but the dye pack ruined the haul. You limp away." : "No dynamite — you tried to pry it open with a crowbar and the alarm screamed. Guards jumped you." };
    }
    const earned = Math.floor(randInt(60_000, 160_000) * racketLevelScale(player.level ?? 1));
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 3), ...(await addXpAndCheckLevel(ctx, player, 60)) });
    await ctx.db.insert("atmBlasts", { userId: player._id, earned, wantedGain: 3, createdAt: Date.now() });
    return { success: true, earned, text: `BOOM. The ATM split open — ${money(earned)}. Every cop in the district heard it (+3 wanted).` };
  },
});

/* ════════════ 10. MUSEUM NIGHT LIFT (art appreciates) ════════════ */
const MUSEUM_PIECES = [
  { name: "Sunset Over Harbor", artist: "M. Castellano", base: 40_000 },
  { name: "The Blue Violinist", artist: "A. Moreau", base: 75_000 },
  { name: "Portrait of a Smuggler", artist: "Unknown", base: 120_000 },
  { name: "Winter in Gold", artist: "E. Vasquez", base: 200_000 },
  { name: "The Cardinal's Secret", artist: "G. d'Onofrio", base: 350_000 },
  { name: "La Mer Perdue", artist: "H. Lindqvist", base: 500_000 },
];
export const getMuseumState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const loot = await ctx.db.query("museumLoot").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { targets: MUSEUM_PIECES, collection: loot.filter((l) => !l.sold), sold: loot.filter((l) => l.sold).slice(0, 8) };
  },
});
export const liftPainting = mutation({
  args: { pieceIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const piece = MUSEUM_PIECES[Math.max(0, Math.min(MUSEUM_PIECES.length - 1, args.pieceIndex))];
    const success = Math.random() < 0.55;
    if (!success) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2), life: Math.max(0, n(player.life, 100) - 10) });
      return { success: false, text: `Lasers, guards, and a very loud dog. You left the ${piece.name} on the wall.` };
    }
    const paid = Math.floor(piece.base * (0.8 + Math.random() * 0.4));
    await ctx.db.insert("museumLoot", { userId: player._id, pieceName: piece.name, artist: piece.artist, paid, sold: false, stolenAt: Date.now() });
    await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2), ...(await addXpAndCheckLevel(ctx, player, 50)) });
    return { success: true, text: `The ${piece.name} by ${piece.artist} is yours. Street value ~${money(paid)} — it appreciates 1%/day until sold.` };
  },
});
export const sellPainting = mutation({
  args: { lootId: v.id("museumLoot") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const loot = await ctx.db.get(args.lootId);
    if (!loot || (loot as any).userId !== player._id) throw new Error("Painting not found.");
    if ((loot as any).sold) throw new Error("Already sold.");
    const daysHeld = Math.max(0, (Date.now() - (loot as any).stolenAt) / 86_400_000);
    const salePrice = Math.floor(n((loot as any).paid, 0) * (1 + 0.01 * daysHeld) * (0.9 + Math.random() * 0.25));
    await ctx.db.patch(args.lootId, { sold: true, soldFor: salePrice, soldAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + salePrice });
    return { salePrice, text: `Sold "${(loot as any).pieceName}" after ${Math.floor(daysHeld)} day(s) — ${money(salePrice)}.` };
  },
});

/* ════════════ 11. GRAVE ROBBERY ════════════ */
const GRAVES = ["Old Pauper's Field", "St. Marion's Cemetery", "The Family Plot", "Potter's Hill", "Sunken Crypt Row"];
const GRAVE_LOOT = [
  { name: "Tarnished Locket", value: 400, artifact: false },
  { name: "Gold Tooth", value: 900, artifact: false },
  { name: "Corsair's Ring", value: 3_500, artifact: false },
  { name: "Masonic Medallion", value: 6_200, artifact: false },
  { name: "Ancient Coin Cache", value: 12_000, artifact: true },
  { name: "Cursed Sabbath Candlestick", value: 24_000, artifact: true },
];
export const robGrave = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const spooked = Math.random() < 0.15;
    if (spooked) {
      await ctx.db.patch(player._id, { life: Math.max(0, n(player.life, 100) - 6) });
      return { success: false, text: "Something moved in the dark and you ran. Lost a shoe and some dignity." };
    }
    const item = pick(GRAVE_LOOT);
    const grave = pick(GRAVES);
    const value = Math.floor(item.value * racketLevelScale(player.level ?? 1));
    await ctx.db.insert("graveLoot", { userId: player._id, graveName: grave, itemName: item.name, value, isArtifact: item.artifact, createdAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + value, ...(await addXpAndCheckLevel(ctx, player, 14)) });
    return { success: true, earned: value, text: `${grave}: unearthed ${item.artifact ? "an ARTIFACT" : "a curiosity"} — ${item.name} worth ${money(value)}.` };
  },
});

/* ════════════ 12. HEARSE SMUGGLING ════════════ */
export const runHearse = mutation({
  args: { cargoValue: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cargo = Math.max(10_000, Math.floor(args.cargoValue));
    if (n(player.money, 0) < cargo) throw new Error(`You need ${money(cargo)} of contraband to load.`);
    const inspected = Math.random() < 0.3;
    if (inspected) {
      await ctx.db.patch(player._id, { money: Math.max(0, n(player.money, 0) - cargo), wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2) });
      await ctx.db.insert("hearseRuns", { userId: player._id, cargoValue: cargo, inspected: true, success: false, earned: 0, createdAt: Date.now() });
      return { success: false, earned: 0, text: `Checkpoint K-9 didn't buy the mourning widow act. Cargo seized (${money(cargo)} gone), +2 wanted.` };
    }
    const profit = Math.floor(cargo * (0.35 + Math.random() * 0.3));
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cargo + cargo + profit, ...(await addXpAndCheckLevel(ctx, player, 30)) });
    await ctx.db.insert("hearseRuns", { userId: player._id, cargoValue: cargo, inspected: false, success: true, earned: profit, createdAt: Date.now() });
    return { success: true, earned: profit, text: `The coffin cleared the checkpoint. Contraband delivered — ${money(profit)} profit, and the client sent flowers.` };
  },
});

/* ════════════ 13. SUNKEN CARGO SALVAGE ════════════ */
const SALVAGE_FINDS = [
  { find: "Barrel of Rum", value: 5_500 }, { find: "Rusted Strongbox", value: 9_000 },
  { find: "Brass Ship Bell", value: 14_000 }, { find: "Waterlogged Opal", value: 22_000 },
  { find: "Captain's Chest", value: 40_000 }, { find: "Spanish Doubloons", value: 65_000 },
];
export const diveSalvage = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 18_000; // boat + dive gear rental
    if (n(player.money, 0) < cost) throw new Error(`Boat + gear rental costs ${money(cost)}.`);
    const currents = Math.random() < 0.2;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, energy: Math.max(0, n((player as any).energy, 100) - 15) });
    if (currents) {
      return { success: false, text: "Riptide dragged you two miles off the mark. Empty net, empty lungs, rental due back by six." };
    }
    const f = pick(SALVAGE_FINDS);
    const value = Math.floor(f.value * racketLevelScale(player.level ?? 1));
    await ctx.db.insert("salvageFinds", { userId: player._id, find: f.find, value, createdAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + value, ...(await addXpAndCheckLevel(ctx, player, 26)) });
    return { success: true, earned: value, text: `Hauled up a ${f.find} — ${money(value)}. The sea keeps its secrets.` };
  },
});

/* ════════════ 14. CATTLE RUSTLING ════════════ */
export const rustleCattle = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const head = randInt(2, 8);
    const caught = Math.random() < 0.18;
    if (caught) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1) });
      return { success: false, text: `The rancher's spotlight swept the pen. You left with nothing but hoof prints on your coat.` };
    }
    const earned = Math.floor(head * randInt(1_800, 3_600) * racketLevelScale(player.level ?? 1));
    await ctx.db.insert("cattleRaids", { userId: player._id, head, earned, createdAt: Date.now() });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, ...(await addXpAndCheckLevel(ctx, player, 20)) });
    return { success: true, earned, text: `${head} head walked onto the truck. The butcher paid ${money(earned)} cash, no questions.` };
  },
});

/* ════════════ 15. SHIP BOTTOM LOADING ════════════ */
const SHIPS = ["MV Meridian", "SS Aldgate", "Corvina Star", "Hanseatic Dawn", "MV Calypso"];
export const loadShip = mutation({
  args: { invested: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const invested = Math.max(25_000, Math.floor(args.invested));
    if (n(player.money, 0) < invested) throw new Error("Not enough money to buy the contraband.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - invested });
    await ctx.db.insert("shipLoads", { userId: player._id, ship: pick(SHIPS), invested, customsRisk: Math.random() < 0.25, resolved: false, createdAt: Date.now(), resolvesAt: Date.now() + 12 * 3600_000 });
    return { text: `${money(invested)} of product welded into the hull. The ship docks in 12 hours — customs decides your fate.` };
  },
});
export const resolveShipLoads = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const now = Date.now();
    const loads = await ctx.db.query("shipLoads").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    let total = 0; let results: string[] = [];
    for (const load of loads) {
      if (load.resolved || load.resolvesAt > now) continue;
      if (load.customsRisk) {
        results.push(`${load.ship}: customs found the welds. Cargo gone.`);
        await ctx.db.patch(load._id, { resolved: true });
      } else {
        const payout = Math.floor(load.invested * (1.5 + Math.random() * 0.6));
        total += payout;
        results.push(`${load.ship}: cleared the docks — ${money(payout)}.`);
        await ctx.db.patch(load._id, { resolved: true, payout });
      }
    }
    if (total > 0) await ctx.db.patch(player._id, { money: n(player.money, 0) + total });
    if (results.length === 0) return { text: "No ships have docked yet. The hulls are still at sea." };
    return { text: results.join(" ") + (total > 0 ? ` Total: ${money(total)}.` : "") };
  },
});

/* ════════════ 23. BOUNTY AUCTIONS ════════════ */
export const getBountyAuctions = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("bountyAuctionBids").withIndex("by_active", (q) => q.eq("active", true)).collect();
    const byTarget = new Map<string, any>();
    for (const b of rows) {
      const k = String(b.targetId);
      if (!byTarget.has(k) || (byTarget.get(k).amount < b.amount)) byTarget.set(k, b);
    }
    return [...byTarget.values()];
  },
});
export const bidBounty = mutation({
  args: { targetId: v.id("users"), targetName: v.string(), amount: v.number(), method: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (args.targetId === player._id) throw new Error("You can't auction your own head.");
    const amount = Math.max(50_000, Math.floor(args.amount));
    if (n(player.money, 0) < amount) throw new Error("Not enough money to back that bid.");
    const rows = await ctx.db.query("bountyAuctionBids").withIndex("by_target", (q) => q.eq("targetId", args.targetId)).collect();
    const top = rows.filter((r) => r.active).sort((a, b) => b.amount - a.amount)[0];
    if (top && top.amount >= amount) throw new Error(`Current top bid is ${money(top.amount)} — outbid it or go home.`);
    // Escrow the bid
    await ctx.db.patch(player._id, { money: n(player.money, 0) - amount });
    if (top) await ctx.db.patch(top._id, { active: false }); // refund previous top bidder
    if (top) {
      const prev = await ctx.db.get(top.bidderId);
      if (prev) await ctx.db.patch(top.bidderId, { money: n((prev as any).money, 0) + top.amount });
    }
    await ctx.db.insert("bountyAuctionBids", { targetId: args.targetId, targetName: args.targetName, bidderId: player._id, bidderName: player.nickname ?? "Anonymous", amount, method: args.method, active: true, createdAt: Date.now() });
    return { text: `Your ${money(amount)} is escrowed on ${args.targetName}'s head — method: ${args.method}. Outbid them or the contract stands.` };
  },
});

/* ════════════ 24. DUELS AT DAWN ════════════ */
export const getDawnDuels = query({
  args: {},
  handler: async (ctx) => {
    const open = await ctx.db.query("dawnDuels").withIndex("by_status", (q) => q.eq("status", "open")).collect();
    return open;
  },
});
export const challengeDawn = mutation({
  args: { stake: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const stake = Math.max(10_000, Math.floor(args.stake));
    if (n(player.money, 0) < stake) throw new Error("Not enough money for that stake.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - stake });
    await ctx.db.insert("dawnDuels", { challengerId: player._id, challengerName: player.nickname ?? "Challenger", stake, scheduledAt: Date.now() + 60_000, status: "open", createdAt: Date.now() });
    return { text: `${money(stake)} escrowed. Your challenge is posted — first rival to accept fights at dawn.` };
  },
});
export const acceptDawn = mutation({
  args: { duelId: v.id("dawnDuels") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const duel = await ctx.db.get(args.duelId);
    if (!duel || (duel as any).status !== "open") throw new Error("Duel no longer open.");
    if ((duel as any).challengerId === player._id) throw new Error("That's your own challenge.");
    const stake = n((duel as any).stake, 0);
    if (n(player.money, 0) < stake) throw new Error(`You need ${money(stake)} to match the stake.`);
    // Fight math: attack + random
    const challenger = await ctx.db.get((duel as any).challengerId);
    const cAtk = n((challenger as any)?.attack, 10) + randInt(0, 25);
    const dAtk = n(player.attack, 10) + randInt(0, 25);
    const defenderWon = dAtk >= cAtk;
    const winnerId = defenderWon ? player._id : (duel as any).challengerId;
    await ctx.db.patch(args.duelId, { status: "finished", defenderId: player._id, defenderName: player.nickname ?? "Defender", winnerId });
    await ctx.db.patch(player._id, { money: n(player.money, 0) - stake + (defenderWon ? stake * 2 : 0), ...(await addXpAndCheckLevel(ctx, player, defenderWon ? 45 : 15)) });
    if (challenger && defenderWon) await ctx.db.patch((duel as any).challengerId, { money: Math.max(0, n((challenger as any).money, 0)) });
    return { won: defenderWon, stake, text: defenderWon ? `You outgunned ${(duel as any).challengerName} at dawn — ${money(stake * 2)} is yours.` : `${(duel as any).challengerName} was faster on the draw. ${money(stake)} gone.` };
  },
});

/* ════════════ 25. PRISON BUST RAIDS ════════════ */
export const getPrisonRaids = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prisonRaids").withIndex("by_status", (q) => q.eq("status", "gathering")).collect();
  },
});
export const startPrisonRaid = mutation({
  args: { targetId: v.id("users"), targetName: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 150_000;
    if (n(player.money, 0) < cost) throw new Error(`A raid plan, lookouts and a getaway van costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("prisonRaids", { raiderId: player._id, raiderName: player.nickname ?? "Raider", targetId: args.targetId, targetName: args.targetName, helpers: [], status: "gathering", createdAt: Date.now() });
    return { text: `Raid on ${args.targetName}'s block is forming. Other players can join the crew before it kicks off.` };
  },
});
export const joinPrisonRaid = mutation({
  args: { raidId: v.id("prisonRaids") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const raid = await ctx.db.get(args.raidId);
    if (!raid || (raid as any).status !== "gathering") throw new Error("Raid not open.");
    if ((raid as any).raiderId === player._id) throw new Error("You started this raid.");
    const helpers = [...((raid as any).helpers ?? []), player._id];
    await ctx.db.patch(args.raidId, { helpers });
    // Resolve when 3+ helpers
    if (helpers.length >= 3) {
      const success = Math.random() < 0.65 + Math.min(0.2, helpers.length * 0.05);
      await ctx.db.patch(args.raidId, { status: "resolved", success, resolvedAt: Date.now() });
      if (success) {
        const target = await ctx.db.get((raid as any).targetId);
        if (target) await ctx.db.patch((raid as any).targetId, { inPrison: false, prisonTime: 0 });
        for (const h of helpers) {
          const hp = await ctx.db.get(h);
          if (hp) await ctx.db.patch(h, { reputation: n((hp as any).reputation, 0) + 5, ...(await addXpAndCheckLevel(ctx, hp, 40)) });
        }
      }
      return { text: success ? `The walls shook and ${ (raid as any).targetName } walked free. Every raider earns reputation.` : "Sirens, spotlights, tear gas. The raid failed and everyone scattered." };
    }
    return { text: `You're in. ${3 - helpers.length} more raider(s) needed before the van rolls.` };
  },
});

/* ════════════ 26. CARAVAN ESCORT ════════════ */
export const getEscortJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("escortJobs").withIndex("by_status", (q) => q.eq("status", "active")).collect();
  },
});
export const postEscortJob = mutation({
  args: { pay: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const pay = Math.max(50_000, Math.floor(args.pay));
    if (n(player.money, 0) < pay) throw new Error("You must escrow the full pay.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - pay });
    await ctx.db.insert("escortJobs", { clientId: player._id, clientName: player.nickname ?? "Client", guardId: player._id, guardName: "(open)", pay, status: "active", createdAt: Date.now() });
    return { text: `Escort job posted at ${money(pay)} — waiting for a bodyguard to take the wheel.` };
  },
});
export const takeEscortJob = mutation({
  args: { jobId: v.id("escortJobs") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const job = await ctx.db.get(args.jobId);
    if (!job || (job as any).status !== "active" || (job as any).guardName !== "(open)") throw new Error("Job already taken.");
    if ((job as any).clientId === player._id) throw new Error("You can't escort your own caravan.");
    const success = Math.random() < 0.75;
    await ctx.db.patch(args.jobId, { guardId: player._id, guardName: player.nickname ?? "Guard", status: success ? "completed" : "betrayed", completedAt: Date.now() });
    if (success) {
      await ctx.db.patch(player._id, { money: n(player.money, 0) + n((job as any).pay, 0), reputation: n(player.reputation, 0) + 3, ...(await addXpAndCheckLevel(ctx, player, 35)) });
      return { text: `Convoy delivered intact — ${money((job as any).pay)} escrow released to you. Reputation +3.` };
    }
    return { text: "Ambush on the ridge road. The cargo burned; the client wants answers, not excuses." };
  },
});

/* ════════════ 27. KIDNAP & INTERROGATION ════════════ */
export const getKidnapState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const holding = await ctx.db.query("kidnappings2").withIndex("by_status", (q) => q.eq("status", "holding")).collect();
    return { mine: holding.filter((k) => k.kidnapperId === player._id), victimOf: holding.filter((k) => k.victimId === player._id) };
  },
});
export const kidnapPlayer = mutation({
  args: { targetId: v.id("users"), targetName: v.string(), ransom: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (args.targetId === player._id) throw new Error("You can't kidnap yourself.");
    const cost = 80_000;
    if (n(player.money, 0) < cost) throw new Error(`Vans, masks and a safehouse cost ${money(cost)} up front.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2) });
    await ctx.db.insert("kidnappings2", {
      kidnapperId: player._id, kidnapperName: player.nickname ?? "Kidnapper",
      victimId: args.targetId, victimName: args.targetName,
      ransom: Math.max(50_000, Math.floor(args.ransom)), status: "holding",
      createdAt: Date.now(), endsAt: Date.now() + 48 * 3600_000,
    });
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "kidnap", message: `🚨 You've been grabbed off the street! ${player.nickname ?? "Someone"} is holding you for ransom.`, read: false, timestamp: Date.now() }); } catch {}
    return { text: `${args.targetName} is in the trunk and on the way to the safehouse. Ransom set at ${money(args.ransom)} — 48h before the heat gets unbearable.` };
  },
});
export const payRansom = mutation({
  args: { kidnapId: v.id("kidnappings2") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const k = await ctx.db.get(args.kidnapId);
    if (!k || (k as any).status !== "holding") throw new Error("No active kidnapping.");
    if ((k as any).victimId !== player._id) throw new Error("You're not the one in the trunk.");
    const ransom = n((k as any).ransom, 0);
    if (n(player.money, 0) < ransom) throw new Error(`You can't cover the ${money(ransom)} ransom.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - ransom });
    await ctx.db.patch(args.kidnapId, { status: "ransomed" });
    const kidnapper = await ctx.db.get((k as any).kidnapperId);
    if (kidnapper) await ctx.db.patch((k as any).kidnapperId, { money: n((kidnapper as any).money, 0) + ransom });
    return { text: `Wire sent. A door opens and daylight hurts. ${money(ransom)} poorer, but breathing.` };
  },
});
export const interrogateCaptive = mutation({
  args: { kidnapId: v.id("kidnappings2") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const k = await ctx.db.get(args.kidnapId);
    if (!k || (k as any).status !== "holding") throw new Error("No captive.");
    if ((k as any).kidnapperId !== player._id) throw new Error("Not your captive.");
    const intel = pick([
      "Their bank pin and a stash address downtown.",
      "Names of two cops on their payroll.",
      "The route their next supply run takes.",
      "Where they buried the last guy who talked.",
      "Their second safehouse on the coast.",
    ]);
    await ctx.db.patch(args.kidnapId, { status: "released", intel });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + 25_000, wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1) });
    return { intel, text: `The captive talked: ${intel} You let them go — police said it was a mugging gone wrong.` };
  },
});

/* ════════════ 28. SHOE SHINE STAND ════════════ */
const RUMORS = [
  "A shipment of untaxed cigars lands Thursday.",
  "The police captain is paying off his own bookie.",
  "Somebody's laundering through the car wash on 5th.",
  "The casino owner's wife gambles with stolen money.",
  "The harbor master takes bribes in whisky.",
];
export const getShoeShineState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const stands = await ctx.db.query("shoeShineStands").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const stand = stands[0];
    if (!stand) return { hasStand: false, level: 0, pending: 0, rumor: null as string | null };
    const hours = Math.max(0, (Date.now() - stand.lastCollectAt) / 3600_000);
    const pending = Math.floor(Math.min(hours, 24) * stand.level * 450);
    return { hasStand: true, level: stand.level, pending, rumor: stand.rumor ?? null };
  },
});
export const buyShoeShineStand = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 35_000;
    if (n(player.money, 0) < cost) throw new Error(`A stand, a stool and polish costs ${money(cost)}.`);
    const existing = await ctx.db.query("shoeShineStands").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (existing.length > 0) throw new Error("You already run a stand.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("shoeShineStands", { userId: player._id, level: 1, earned: 0, lastCollectAt: Date.now(), createdAt: Date.now() });
    return { text: "Stand open. Every shine is a conversation; every conversation is a rumor." };
  },
});
export const collectShoeShine = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const stands = await ctx.db.query("shoeShineStands").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const stand = stands[0];
    if (!stand) throw new Error("You don't run a stand.");
    const hours = Math.max(0, (Date.now() - stand.lastCollectAt) / 3600_000);
    const earned = Math.floor(Math.min(hours, 24) * stand.level * 450 * racketLevelScale(player.level ?? 1));
    if (earned <= 0) return { text: "Not enough shine yet — give it an hour." };
    const rumor = Math.random() < 0.35 ? pick(RUMORS) : null;
    await ctx.db.patch(stand._id, { lastCollectAt: Date.now(), earned: n(stand.earned, 0) + earned, rumor: rumor ?? stand.rumor });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned });
    return { text: `Tips jar: ${money(earned)}.${rumor ? ` 👂 Rumor overheard: "${rumor}"` : ""}` };
  },
});

/* ════════════ 29. CINEMA BACKROOM ════════════ */
const FILMS = ["Midnight Reel", "The Godfather (Unlicensed)", "Cage Fight Anthology", "Spaghetti Western Marathon", "Film Noir Classics"];
export const openCinema = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 120_000;
    if (n(player.money, 0) < cost) throw new Error(`Projector, seats and a locked back door cost ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("cinemaScreens", { userId: player._id, film: pick(FILMS), earned: 0, lastCollectAt: Date.now(), active: true, createdAt: Date.now() });
    return { text: "Backroom open. The projector hums, the memberships sell, nobody remembers buying a ticket." };
  },
});
export const collectCinema = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("cinemaScreens").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const room = rows.find((r) => r.active);
    if (!room) throw new Error("You don't run a backroom.");
    const hours = Math.max(0, (Date.now() - room.lastCollectAt) / 3600_000);
    const earned = Math.floor(Math.min(hours, 24) * 2_800 * racketLevelScale(player.level ?? 1));
    if (earned <= 0) return { text: "Empty seats so far — check back later." };
    await ctx.db.patch(room._id, { lastCollectAt: Date.now(), earned: n(room.earned, 0) + earned });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned });
    return { text: `Ticket tin: ${money(earned)} in mixed bills.` };
  },
});

/* ════════════ 30. FUNERAL HOME (heat reduction) ════════════ */
export const getFuneralState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return { owned: false, wanted: n(player?.wantedLevel, 0) };
    const rows = await ctx.db.query("funeralHome").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { owned: rows.length > 0, wanted: n(player.wantedLevel, 0) };
  },
});
export const buyFuneralHome = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 400_000;
    if (n(player.money, 0) < cost) throw new Error(`A parlor on the quiet side of town costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("funeralHome", { userId: player._id, level: 1, clientsServed: 0, earned: 0, createdAt: Date.now() });
    return { text: "Restful Meadows Funeral Home is yours. Business is dying to meet you." };
  },
});
export const disposeHeat = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("funeralHome").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const home = rows[0];
    if (!home) throw new Error("You need to own the funeral home first.");
    const wanted = n(player.wantedLevel, 0);
    if (wanted <= 0) return { text: "You're squeaky clean — the parlor has nothing to sanitize." };
    const cost = wanted * 20_000;
    if (n(player.money, 0) < cost) throw new Error(`Sanitizing ${wanted} wanted level(s) costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, wantedLevel: 0 });
    await ctx.db.patch(home._id, { clientsServed: n(home.clientsServed, 0) + 1 });
    return { text: `Paperwork filed, stories aligned, witnesses uncertain. Your record reads spotless (${money(cost)} in "donations").` };
  },
});

/* ════════════ 31. FISH MARKET STALL ════════════ */
export const castNets = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const crate = Math.random() < 0.22;
    const catchName = pick(["Cod", "Halibut", "Langoustines", "Mackerel", "Monkfish", "Sea Trout"]);
    const fishEarned = Math.floor(randInt(2_000, 6_000) * racketLevelScale(player.level ?? 1));
    let text = `${catchName} sold at the morning auction — ${money(fishEarned)}.`;
    if (crate) {
      const crateValue = randInt(30_000, 70_000);
      await ctx.db.patch(player._id, { money: n(player.money, 0) + fishEarned + crateValue });
      text += ` 📦 One crate was packed with something other than fish — ${money(crateValue)} unmarked bills.`;
    } else {
      await ctx.db.patch(player._id, { money: n(player.money, 0) + fishEarned });
    }
    await ctx.db.insert("fishStalls", { userId: player._id, catch: catchName, earned: fishEarned, suspiciousCrate: crate, createdAt: Date.now() });
    await ctx.db.patch(player._id, {}); // touch for reactivity
    await addXpAndCheckLevel(ctx, player, 12);
    return { earned: fishEarned, crate, text };
  },
});

/* ════════════ 32. TAXI MEDALLIONS ════════════ */
export const getMedallionState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const rows = await ctx.db.query("taxiMedallions").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const med = rows[0];
    if (!med) return { owned: false, count: 0, pending: 0 };
    const hours = Math.max(0, (Date.now() - med.lastCollectAt) / 3600_000);
    return { owned: true, count: med.count, pending: Math.floor(Math.min(hours, 24) * med.count * 900) };
  },
});
export const buyMedallion = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 250_000;
    if (n(player.money, 0) < cost) throw new Error(`A city medallion license costs ${money(cost)}.`);
    const rows = await ctx.db.query("taxiMedallions").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const med = rows[0];
    if (med) {
      if (med.count >= 5) throw new Error("You hold the city's medallion cap (5).");
      await ctx.db.patch(med._id, { count: med.count + 1 });
    } else {
      await ctx.db.insert("taxiMedallions", { userId: player._id, count: 1, earned: 0, lastCollectAt: Date.now(), createdAt: Date.now() });
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    return { text: `Medallion secured. Your cabbie pays you 900/hour in lease fees — collect anytime.` };
  },
});
export const collectMedallion = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("taxiMedallions").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const med = rows[0];
    if (!med) throw new Error("You don't own medallions.");
    const hours = Math.max(0, (Date.now() - med.lastCollectAt) / 3600_000);
    const earned = Math.floor(Math.min(hours, 24) * med.count * 900 * racketLevelScale(player.level ?? 1));
    if (earned <= 0) return { text: "Lease fees haven't accumulated yet." };
    await ctx.db.patch(med._id, { lastCollectAt: Date.now(), earned: n(med.earned, 0) + earned });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned });
    return { text: `Lease fees collected: ${money(earned)}.` };
  },
});

/* ════════════ 33. LAUNDROMAT CHAIN ════════════ */
const LAUNDRY_SPOTS = ["Elbow Street", "Riverside", "Dock Lane", "9th & Main", "The Narrows"];
export const buyLaundromat = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 180_000;
    if (n(player.money, 0) < cost) throw new Error(`Each location costs ${money(cost)}.`);
    const rows = await ctx.db.query("laundromats").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    let chain = rows[0];
    if (!chain) {
      await ctx.db.insert("laundromats", { userId: player._id, locations: [pick(LAUNDRY_SPOTS)], washCapacity: 100_000, earned: 0, lastCollectAt: Date.now(), createdAt: Date.now() });
    } else {
      if (chain.locations.length >= 5) throw new Error("Five locations is a full chain — the neighborhood can't support more.");
      const spot = pick(LAUNDRY_SPOTS.filter((s) => !chain!.locations.includes(s)));
      await ctx.db.patch(chain._id, { locations: [...chain.locations, spot], washCapacity: chain.washCapacity + 100_000 });
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    return { text: `New location opened. Daily wash capacity now ${(((rows[0]?.locations.length ?? 0) + 1) * 100_000).toLocaleString()} — every wash is a story.` };
  },
});
export const collectLaundromat = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("laundromats").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const chain = rows[0];
    if (!chain) throw new Error("You don't own a laundromat.");
    const hours = Math.max(0, (Date.now() - chain.lastCollectAt) / 3600_000);
    const earned = Math.floor(Math.min(hours, 24) * chain.locations.length * 1_400 * racketLevelScale(player.level ?? 1));
    if (earned <= 0) return { text: "Machines are still spinning." };
    await ctx.db.patch(chain._id, { lastCollectAt: Date.now(), earned: n(chain.earned, 0) + earned });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned });
    return { text: `Quarters counted: ${money(earned)} across ${chain.locations.length} location(s).` };
  },
});

/* ════════════ 34. FUEL TANKER SPECULATION ════════════ */
export const getFuelMarket = query({
  args: {},
  handler: async (ctx) => {
    // Price oscillates hourly
    const hour = Math.floor(Date.now() / 3600_000);
    const price = 2.2 + Math.sin(hour / 7) * 0.8 + (Math.sin(hour / 23) * 0.4);
    const user = await getCurrentUser(ctx);
    const rows = user
      ? await ctx.db.query("fuelSpeculation").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
      : [];
    const holding = rows.find((r) => r.status === "holding");
    return { pricePerGallon: Math.round(price * 100) / 100, holding: holding ?? null, history: rows.filter((r) => r.status === "sold").slice(0, 8) };
  },
});

export const buyFuel = mutation({
  args: { gallons: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const hour = Math.floor(Date.now() / 3600_000);
    const price = 2.2 + Math.sin(hour / 7) * 0.8 + (Math.sin(hour / 23) * 0.4);
    const gallons = Math.max(100, Math.floor(args.gallons));
    const cost = Math.floor(gallons * price);
    if (n(player.money, 0) < cost) throw new Error(`${gallons} gallons costs ${money(cost)} at ${price.toFixed(2)}/gal.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("fuelSpeculation", { userId: player._id, gallons, boughtAtPrice: Math.round(price * 100) / 100, status: "holding", createdAt: Date.now() });
    return { text: `Bought ${gallons.toLocaleString()} gallons at ${price.toFixed(2)}/gal (${money(cost)}). Watch the price — sell high.` };
  },
});
export const sellFuel = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("fuelSpeculation").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const holding = rows.find((r) => r.status === "holding");
    if (!holding) throw new Error("You're not holding any fuel.");
    const hour = Math.floor(Date.now() / 3600_000);
    const price = 2.2 + Math.sin(hour / 7) * 0.8 + (Math.sin(hour / 23) * 0.4);
    const revenue = Math.floor(holding.gallons * price);
    const profit = revenue - Math.floor(holding.gallons * holding.boughtAtPrice);
    await ctx.db.patch(holding._id, { status: "sold", soldAtPrice: Math.round(price * 100) / 100, profit });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + revenue });
    return { text: `Sold ${holding.gallons.toLocaleString()} gallons at ${price.toFixed(2)}/gal — ${profit >= 0 ? "profit" : "loss"}: ${money(Math.abs(profit))}.` };
  },
});

/* ════════════ 35. POWER GRID TAP ════════════ */
export const tapPowerGrid = mutation({
  args: { district: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 60_000;
    if (n(player.money, 0) < cost) throw new Error(`Crew + equipment costs ${money(cost)}.`);
    const blackout = Math.random() < 0.3;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    if (blackout) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1) });
      await ctx.db.insert("powerTaps", { userId: player._id, district: args.district, discountPct: 0, blackoutRisk: true, active: false, createdAt: Date.now() });
      return { success: false, text: `You fried a substation. ${args.district} went dark for six hours — the utility is asking questions (+1 wanted).` };
    }
    const discount = randInt(15, 40);
    await ctx.db.insert("powerTaps", { userId: player._id, district: args.district, discountPct: discount, blackoutRisk: false, active: true, createdAt: Date.now() });
    return { success: true, text: `Illicit line spliced into ${args.district}. Your grow-ops now run ${discount}% cheaper on utilities.` };
  },
});

/* ════════════ 36. UNION DESK ════════════ */
export const bribeUnion = mutation({
  args: { tier: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const tiers: Record<string, { cost: number; hours: number; label: string }> = {
      steward: { cost: 45_000, hours: 12, label: "Shop Steward" },
      business_agent: { cost: 110_000, hours: 24, label: "Business Agent" },
      president: { cost: 260_000, hours: 48, label: "Local President" },
    };
    const t = tiers[args.tier];
    if (!t) throw new Error("Unknown union tier.");
    if (n(player.money, 0) < t.cost) throw new Error(`${t.label} costs ${money(t.cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - t.cost });
    await ctx.db.insert("unionBribes", { userId: player._id, tier: t.label, cost: t.cost, expiresAt: Date.now() + t.hours * 3600_000, createdAt: Date.now() });
    return { text: `${t.label} is on the payroll for ${t.hours}h — dock actions cost 30% less and move twice as fast.` };
  },
});

/* ════════════ 37. CIGARETTE RUN ════════════ */
export const runCigarettes = mutation({
  args: { distance: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const distances: Record<string, { inv: number; mult: number; risk: number; label: string }> = {
      county: { inv: 20_000, mult: 1.4, risk: 0.12, label: "County line (200 cartons)" },
      state: { inv: 80_000, mult: 1.8, risk: 0.28, label: "Cross-state (900 cartons)" },
      coast: { inv: 200_000, mult: 2.4, risk: 0.42, label: "Coastal run (2,500 cartons)" },
    };
    const d = distances[args.distance];
    if (!d) throw new Error("Unknown route.");
    if (n(player.money, 0) < d.inv) throw new Error(`${d.label} requires ${money(d.inv)} in product.`);
    const busted = Math.random() < d.risk;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - d.inv });
    if (busted) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 1) });
      return { success: false, text: `Excise agents had the ${args.distance} route staked out. Cartons seized, ${money(d.inv)} up in smoke.` };
    }
    const earned = Math.floor(d.inv * d.mult * racketLevelScale(player.level ?? 1) * (0.9 + Math.random() * 0.25));
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, ...(await addXpAndCheckLevel(ctx, player, 22)) });
    await ctx.db.insert("cigaretteRuns", { userId: player._id, distance: d.label, invested: d.inv, earned, busted: false, createdAt: Date.now() });
    return { success: true, earned, text: `${d.label} delivered — ${money(earned)}. The bodega owners are happy to see you.` };
  },
});

/* ════════════ 38. ART FORGING STUDIO ════════════ */
const FORGE_TARGETS = [
  { painting: "A 'Castellano' Harbor Scene", cost: 60_000 },
  { painting: "A 'Moreau' Blue Period", cost: 120_000 },
  { painting: "A 'Vasquez' Winter", cost: 220_000 },
];
export const forgePainting = mutation({
  args: { targetIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const t = FORGE_TARGETS[Math.max(0, Math.min(FORGE_TARGETS.length - 1, args.targetIndex))];
    if (n(player.money, 0) < t.cost) throw new Error(`Canvas, oils and an aging oven cost ${money(t.cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - t.cost });
    const detected = Math.random() < 0.25;
    await ctx.db.insert("forgedPaintings", { userId: player._id, painting: t.painting, cost: t.cost, detected, sold: false, createdAt: Date.now() });
    if (detected) return { success: false, text: `Your brushwork fooled the buyer — until the UV lamp didn't. The gallery is asking for their money and their lawyer.` };
    return { success: true, text: `${t.painting} is drying in the back room. List it with the fence when ready — greed has deep pockets.` };
  },
});
export const sellForged = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("forgedPaintings").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const ready = rows.filter((r) => !r.sold && !r.detected);
    if (ready.length === 0) throw new Error("No clean forgeries to sell.");
    let total = 0;
    for (const f of ready) {
      const sale = Math.floor(f.cost * (1.6 + Math.random() * 1.2));
      total += sale;
      await ctx.db.patch(f._id, { sold: true, soldFor: sale });
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) + total });
    return { text: `${ready.length} forgery(ies) placed with collectors — ${money(total)} in "old money."` };
  },
});

/* ════════════ 39. VENDING ROUTE ════════════ */
export const buyVendingSpot = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 45_000;
    if (n(player.money, 0) < cost) throw new Error(`Machine + placement fee costs ${money(cost)}.`);
    const rows = await ctx.db.query("vendingRoutes").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const spots = ["Station Concourse", "Bus Depot", "Court House", "Beach Boardwalk", "Stadium Gate", "Night Market"];
    const route = rows[0];
    if (route) {
      if (route.spots.length >= 6) throw new Error("All six prime spots are yours.");
      const next = pick(spots.filter((s) => !route!.spots.includes(s)));
      await ctx.db.patch(route._id, { spots: [...route.spots, next], lastRestockAt: route.lastRestockAt });
    } else {
      await ctx.db.insert("vendingRoutes", { userId: player._id, spots: [pick(spots)], earned: 0, lastRestockAt: Date.now(), createdAt: Date.now() });
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    return { text: "Machine placed. Restock daily — some compartments carry more than candy." };
  },
});
export const restockVending = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const rows = await ctx.db.query("vendingRoutes").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const route = rows[0];
    if (!route) throw new Error("You don't run a route.");
    const hours = Math.max(0, (Date.now() - route.lastRestockAt) / 3600_000);
    const earned = Math.floor(Math.min(hours, 24) * route.spots.length * 650 * racketLevelScale(player.level ?? 1));
    if (earned <= 0) return { text: "Machines are still full." };
    const contraband = Math.random() < 0.25;
    await ctx.db.patch(route._id, { lastRestockAt: Date.now(), earned: n(route.earned, 0) + earned });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned });
    return { text: `Coin boxes emptied: ${money(earned)}.${contraband ? " One machine's false back held a surprise drop — handled." : ""}` };
  },
});

/* ════════════ 40. BAIL BONDSMAN ════════════ */
export const getPrisoners = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all.filter((u: any) => u.inPrison && u.nickname).map((u: any) => ({ id: u._id, name: u.nickname, level: u.level }));
  },
});
export const postBail = mutation({
  args: { defendantId: v.id("users"), defendantName: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const defendant = await ctx.db.get(args.defendantId);
    if (!defendant || !(defendant as any).inPrison) throw new Error("That player isn't inside.");
    const amount = Math.max(50_000, 25_000 * n((defendant as any).level, 1));
    if (n(player.money, 0) < amount) throw new Error(`Bail for a Lv.${n((defendant as any).level, 1)} prisoner costs ${money(amount)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - amount });
    await ctx.db.patch(args.defendantId, { inPrison: false, prisonTime: 0 });
    await ctx.db.insert("bailBonds", { bondsmanId: player._id, bondsmanName: player.nickname ?? "Bondsman", defendantId: args.defendantId, defendantName: args.defendantName, amount, repaid: false, createdAt: Date.now() });
    try { await ctx.db.insert("notifications", { userId: args.defendantId, type: "bail", message: `⚖️ ${player.nickname ?? "A bondsman"} posted your bail (${money(amount)}). You owe them — with interest.`, read: false, timestamp: Date.now() }); } catch {}
    return { text: `${args.defendantName} walked. They owe you ${money(Math.floor(amount * 1.25))} — collect when they're flush.` };
  },
});
export const collectBailDebt = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const bonds = await ctx.db.query("bailBonds").withIndex("by_bondsman", (q) => q.eq("bondsmanId", player._id)).collect();
    let total = 0; let forgiven = 0;
    for (const b of bonds) {
      if (b.repaid) continue;
      const defendant: any = await ctx.db.get(b.defendantId);
      const owed = Math.floor(b.amount * 1.25);
      if (defendant && n(defendant.money, 0) >= owed) {
        await ctx.db.patch(defendant._id, { money: n(defendant.money, 0) - owed });
        await ctx.db.patch(b._id, { repaid: true });
        total += owed;
      } else if (defendant && Date.now() - b.createdAt > 3 * 86_400_000) {
        // Broke + 3 days: the debt becomes muscle work (reputation) instead
        forgiven++;
        await ctx.db.patch(b._id, { repaid: true });
        if (defendant) await ctx.db.patch(defendant._id, { money: Math.max(0, n(defendant.money, 0) - Math.floor(owed * 0.5)) });
      }
    }
    if (total > 0) await ctx.db.patch(player._id, { money: n(player.money, 0) + total });
    return { text: total > 0 ? `Collected ${money(total)} in bail debts (+25% interest).` : forgiven > 0 ? `${forgiven} deadbeat(s) — they'll owe you favors instead.` : "Nobody owes you bail money right now." };
  },
});

/* ════════════ 46. COFFIN SHOP ROULETTE ════════════ */
const CREWS_FOR_ROULETTE = ["The Kirin Boys", "Westgate Syndicate", "Red Hook Clique", "The Undertakers", "Vinewood Mob"];
export const betCoffin = mutation({
  args: { crew: v.string(), wager: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const wager = Math.max(1_000, Math.floor(args.wager));
    if (n(player.money, 0) < wager) throw new Error("Not enough money.");
    const week = String(Math.floor(Date.now() / (7 * 86_400_000)));
    const resolved = await ctx.db.query("coffinBets").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const alreadyThisWeek = resolved.some((b) => b.week === week && b.resolved);
    if (alreadyThisWeek) return { text: "This week's shipment already got seized or didn't. One bet per week." };
    await ctx.db.patch(player._id, { money: n(player.money, 0) - wager });
    await ctx.db.insert("coffinBets", { userId: player._id, crew: args.crew, wager, resolved: true, won: Math.random() < 0.3, payout: 0, week, createdAt: Date.now() });
    // resolve immediately for simplicity
    const won = Math.random() < 0.3;
    const payout = won ? Math.floor(wager * 4.5) : 0;
    await ctx.db.patch(player._id, { money: n(player.money, 0) + payout });
    const latest = await ctx.db.query("coffinBets").withIndex("by_user", (q) => q.eq("userId", player._id)).order("desc").take(1);
    if (latest[0]) await ctx.db.patch(latest[0]._id, { won, payout });
    return { won, payout, text: won ? `Word from the docks: ${args.crew}'s shipment got seized! Your ${money(wager)} returned ${money(payout)}.` : `${args.crew} slipped theirs through clean. ${money(wager)} in the coffin.` };
  },
});

/* ════════════ 47. DOUBLE-OR-NOTHING EXITS ════════════ */
export const doubleOrNothing = mutation({
  args: { stake: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const stake = Math.max(1_000, Math.floor(args.stake));
    if (n(player.money, 0) < stake) throw new Error("Stake more than you have.");
    const won = Math.random() < 0.47; // house edge
    const payout = won ? stake * 2 : 0;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - stake + payout });
    await ctx.db.insert("donGambles", { userId: player._id, staked: stake, won, payout, createdAt: Date.now() });
    return { won, payout, text: won ? `The coin hangs… lands gold. ${money(stake)} becomes ${money(payout)}.` : `The coin lands grey. ${money(stake)} walks away without you.` };
  },
});

/* ════════════ 48. INSURANCE FRAUD ════════════ */
export const fileFraudClaim = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 30_000; // "premium" + arranging the fire
    if (n(player.money, 0) < cost) throw new Error(`Setting the scene costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    const investigated = Math.random() < 0.3;
    const property = pick(["your loft", "your storage unit", "your boat", "your corner store"]);
    await ctx.db.insert("fraudClaims", { userId: player._id, property, claimed: 0, investigated, paidOut: 0, createdAt: Date.now() });
    if (investigated) {
      await ctx.db.patch(player._id, { wantedLevel: Math.min(20, n(player.wantedLevel, 0) + 2) });
      return { success: false, text: `The adjuster found accelerant traces in ${property}. Claim denied, investigation opened (+2 wanted).` };
    }
    const payout = Math.floor(randInt(90_000, 220_000) * racketLevelScale(player.level ?? 1));
    await ctx.db.patch(player._id, { money: n(player.money, 0) + payout });
    await ctx.db.insert("fraudClaims", { userId: player._id, property, claimed: payout, investigated: false, paidOut: payout, createdAt: Date.now() });
    return { success: true, earned: payout, text: `Tragic fire in ${property}. The insurer paid ${money(payout)} — grief is expensive, apparently.` };
  },
});

/* ════════════ 49. PONZI DESK ════════════ */
export const offerPonzi = mutation({
  args: { yieldPct: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const yieldPct = Math.max(5, Math.min(50, Math.floor(args.yieldPct)));
    await ctx.db.insert("ponziDesk", { ownerId: player._id, ownerName: player.nickname ?? "Financier", investorId: player._id, investorName: "(desk open)", amount: 0, status: "active", createdAt: Date.now(), yieldPct } as any);
    return { text: `Your desk promises ${yieldPct}% daily returns. The desperate and the greedy will come. When the music stops, you decide who's left standing.` };
  },
});
export const investInPonzi = mutation({
  args: { deskId: v.id("ponziDesk"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const desk = await ctx.db.get(args.deskId);
    if (!desk || (desk as any).ownerId === player._id) throw new Error("Desk not available to you.");
    const amount = Math.max(10_000, Math.floor(args.amount));
    if (n(player.money, 0) < amount) throw new Error("Not enough money.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - amount });
    await ctx.db.patch(args.deskId, { amount: n((desk as any).amount, 0) + amount, investorId: player._id, investorName: player.nickname ?? "Investor" });
    try { await ctx.db.insert("notifications", { userId: (desk as any).ownerId, type: "ponzi", message: `💼 ${player.nickname ?? "An investor"} put ${money(amount)} into your desk.`, read: false, timestamp: Date.now() }); } catch {}
    return { text: `${money(amount)} wired to ${(desk as any).ownerName}'s desk. Promised ${money(Math.floor(amount * 0.2))} back "soon."` };
  },
});
export const ponziResolve = mutation({
  args: { deskId: v.id("ponziDesk"), honor: v.boolean() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const desk = await ctx.db.get(args.deskId);
    if (!desk || (desk as any).ownerId !== player._id) throw new Error("Not your desk.");
    const pot = n((desk as any).amount, 0);
    if (pot <= 0) throw new Error("No investor money in the desk.");
    const investor = await ctx.db.get((desk as any).investorId);
    if (args.honor) {
      const payout = Math.floor(pot * 1.2);
      if (n(player.money, 0) < payout) throw new Error(`Honoring the promise costs ${money(payout)} — you're short.`);
      await ctx.db.patch(player._id, { money: n(player.money, 0) - payout, reputation: n(player.reputation, 0) + 8 });
      if (investor) await ctx.db.patch((desk as any).investorId, { money: n((investor as any).money, 0) + payout });
      await ctx.db.patch(args.deskId, { status: "paid", amount: 0 });
      return { text: `You paid out ${money(payout)} — 20% return as promised. Your name means something on the street now.` };
    }
    await ctx.db.patch(player._id, { money: n(player.money, 0) + pot, reputation: Math.max(-100, n(player.reputation, 0) - 15) });
    await ctx.db.patch(args.deskId, { status: "collapsed", amount: 0 });
    if (investor) {
      try { await ctx.db.insert("notifications", { userId: (desk as any).investorId, type: "ponzi", message: `💔 ${(desk as any).ownerName}'s desk collapsed with your ${money(pot)}.`, read: false, timestamp: Date.now() }); } catch {}
    }
    return { text: `The desk "burned down in a fire." ${money(pot)} is yours; your reputation is ${money(pot)} lighter too.` };
  },
});

/* ════════════ 50. WHALE HUNTING ════════════ */
export const whaleTable = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const netWorth = n(player.money, 0) + n(player.bank, 0);
    const buyIn = Math.floor(netWorth * 0.05);
    if (buyIn < 100_000) throw new Error("The whale table opens at a 5% net-worth buy-in (min $100,000 net worth).");
    if (n(player.money, 0) < buyIn) throw new Error(`Buy-in is ${money(buyIn)} (5% of your net worth).`);
    const won = Math.random() < 0.42;
    const payout = won ? buyIn * 2 : 0;
    await ctx.db.patch(player._id, { money: n(player.money, 0) - buyIn + payout, points: won ? n(player.points, 0) + 10 : n(player.points, 0) });
    await ctx.db.insert("whaleGames", { playerId: player._id, playerName: player.nickname ?? "Whale", buyIn, won, payout, createdAt: Date.now() });
    return { won, payout, text: won ? `You out-bluffed the table's resident shark — ${money(payout)} pushed your way.` : `The shark smelled fear. ${money(buyIn)} gone in one hand.` };
  },
});

/* ════════════ 51. FIGHT FIXING ════════════ */
export const fixFight = mutation({
  args: { wager: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const bribe = 70_000;
    const wager = Math.max(5_000, Math.floor(args.wager));
    if (n(player.money, 0) < bribe + wager) throw new Error(`You need ${money(bribe)} for the boxer plus your ${money(wager)} wager.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - bribe - wager });
    const boxerRan = Math.random() < 0.2; // boxer takes the money and vanishes
    if (boxerRan) {
      await ctx.db.insert("fightFixes", { userId: player._id, match: pick(["Vargas vs Ortiz", "Dempsey Jr. vs Kowalski", "Silva vs Brandt"]), bribe, wager, boxerRan: true, resolved: true, createdAt: Date.now() });
      return { success: false, text: `The boxer took your ${money(bribe)} and caught the midnight bus to Mexico. Wager void.` };
    }
    const won = true; // fixed fight — as long as the boxer shows
    const payout = Math.floor(wager * 1.9);
    await ctx.db.patch(player._id, { money: n(player.money, 0) + payout, ...(await addXpAndCheckLevel(ctx, player, 25)) });
    await ctx.db.insert("fightFixes", { userId: player._id, match: pick(["Vargas vs Ortiz", "Dempsey Jr. vs Kowalski", "Silva vs Brandt"]), bribe, wager, won, payout, boxerRan: false, resolved: true, createdAt: Date.now() });
    return { success: true, earned: payout - bribe, text: `The fix was in — "accidental" low blow in round 3. Your ${money(wager)} paid ${money(payout)}. Net after bribe: ${money(payout - bribe)}.` };
  },
});

/* ════════════ 52. LOTTO SYNDICATE ════════════ */
export const openSyndicate = mutation({
  args: { tickets: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const tickets = Math.max(1, Math.min(20, Math.floor(args.tickets)));
    const cost = tickets * 50_000;
    if (n(player.money, 0) < cost) throw new Error(`${tickets} ticket(s) cost ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.insert("syndicatePools", { leaderId: player._id, leaderName: player.nickname ?? "Leader", members: [player._id], tickets, pot: 0, status: "open", createdAt: Date.now() });
    return { text: `Syndicate open with ${tickets} ticket(s). Crew members can buy in; any win splits by share.` };
  },
});
export const joinSyndicate = mutation({
  args: { poolId: v.id("syndicatePools"), buyIn: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const pool = await ctx.db.get(args.poolId);
    if (!pool || (pool as any).status !== "open") throw new Error("Syndicate closed.");
    const buyIn = Math.max(25_000, Math.floor(args.buyIn));
    if (n(player.money, 0) < buyIn) throw new Error("Not enough money to buy in.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - buyIn });
    await ctx.db.patch(args.poolId, { members: [...((pool as any).members ?? []), player._id], pot: n((pool as any).pot, 0) + buyIn });
    return { text: `You're in the syndicate. ${((pool as any).members ?? []).length + 1} members strong.` };
  },
});
export const drawSyndicate = mutation({
  args: { poolId: v.id("syndicatePools") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const pool = await ctx.db.get(args.poolId);
    if (!pool || (pool as any).leaderId !== player._id) throw new Error("Only the leader draws.");
    if ((pool as any).status !== "open") throw new Error("Already drawn.");
    const won = Math.random() < 0.15;
    await ctx.db.patch(args.poolId, { status: "drawn", win: won });
    if (!won) return { text: "Numbers came up empty. The tickets go in the drawer of failed dreams." };
    const jackpot = n((pool as any).tickets, 1) * 400_000;
    const members: any[] = (pool as any).members ?? [];
    const share = Math.floor(jackpot / Math.max(1, members.length));
    for (const m of members) {
      const mp = await ctx.db.get(m);
      if (mp) await ctx.db.patch(m, { money: n((mp as any).money, 0) + share });
    }
    return { text: `💥 JACKPOT! ${money(jackpot)} split ${ways(members.length)} — ${money(share)} each!` };
  },
});
function ways(x: number) { return x === 1 ? "one way" : `${x} ways`; }

/* ════════════ 56. BLACKOUT HEISTS ════════════ */
export const getBlackoutState = query({
  args: {},
  handler: async (ctx) => {
    // A blackout window opens 20 minutes of every in-game hour cycle (simulated)
    const inWindow = (Date.now() / 60000) % 60 < 20;
    return { blackoutActive: inWindow };
  },
});
export const runBlackoutHeist = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const inWindow = (Date.now() / 60000) % 60 < 20;
    if (!inWindow) throw new Error("The grid is up — blackout targets are locked down. Wait for the next outage window.");
    const target = pick(["Jewelry Exchange", "Records Office", "Security Depot", "Pawn Vault"]);
    const success = Math.random() < 0.7;
    if (!success) {
      await ctx.db.patch(player._id, { life: Math.max(0, n(player.life, 100) - 12) });
      return { success: false, text: `Backup generators kicked in mid-job at the ${target}. You left with nothing but a taser scar.` };
    }
    const earned = Math.floor(randInt(80_000, 200_000) * racketLevelScale(player.level ?? 1));
    await ctx.db.patch(player._id, { money: n(player.money, 0) + earned, ...(await addXpAndCheckLevel(ctx, player, 55)) });
    await ctx.db.insert("blackoutRuns", { userId: player._id, target, earned, success: true, createdAt: Date.now() });
    return { success: true, earned, text: `Lights out, cameras blind — the ${target} yielded ${money(earned)}.` };
  },
});

/* ════════════ 57. WEATHER DAMAGE ════════════ */
export const getWeatherState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const damages = await ctx.db.query("weatherDamage").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const outstanding = damages.filter((d) => !d.repaired);
    const totalCost = outstanding.reduce((s, d) => s + d.repairCost, 0);
    return { outstanding, totalCost, forecast: pickSafe(["Clear", "Clear", "Clear", "Storms coming", "High winds"]) };
  },
});
function pickSafe(arr: string[]): string { return pick(arr); }
export const repairDamage = mutation({
  args: { damageId: v.id("weatherDamage") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const dmg = await ctx.db.get(args.damageId);
    if (!dmg || (dmg as any).userId !== player._id) throw new Error("Damage report not found.");
    if ((dmg as any).repaired) throw new Error("Already repaired.");
    const cost = n((dmg as any).repairCost, 0);
    if (n(player.money, 0) < cost) throw new Error(`Repairs cost ${money(cost)}.`);
    await ctx.db.patch(args.damageId, { repaired: true });
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    return { text: `${(dmg as any).asset} back in service — ${money(cost)} to the contractors.` };
  },
});
export const rollWeather = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const storm = Math.random() < 0.4;
    if (!storm) return { text: "Skies hold. No damage today." };
    const assets: Record<string, number> = { "Billboard": 40_000, "Night Stall": 15_000, "Laundromat": 60_000, "Vending Route": 12_000 };
    const asset = pick(Object.keys(assets));
    const cost = Math.floor(assets[asset] * (0.5 + Math.random() * 0.8));
    await ctx.db.insert("weatherDamage", { userId: player._id, asset, assetType: asset, repairCost: cost, repaired: false, createdAt: Date.now() });
    return { storm: true, text: `⛈️ Storm cell rolled through — your ${asset} took damage. Repair bill: ${money(cost)} (see Weather Desk).` };
  },
});

/* ════════════ 58. SEWER CACHES ════════════ */
export const stashCache = mutation({
  args: { contentsValue: v.number(), label: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const value = Math.max(10_000, Math.floor(args.contentsValue));
    if (n(player.money, 0) < value) throw new Error("You can't stash more than you have.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - value });
    await ctx.db.insert("sewerCaches", { ownerId: player._id, ownerName: player.nickname ?? "Stasher", contentsValue: value, label: args.label.slice(0, 40) || "unnamed cache", found: false, createdAt: Date.now() });
    return { text: `${money(value)} sealed in a rusted box and slid into the tunnels. Finders keepers — if they can find it.` };
  },
});
export const huntCaches = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 25_000; // boots, lamp, and a map
    if (n(player.money, 0) < cost) throw new Error(`A tunnel map and gear costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    const caches = await ctx.db.query("sewerCaches").withIndex("by_found", (q) => q.eq("found", false)).collect();
    const targets = caches.filter((c) => c.ownerId !== player._id);
    if (targets.length === 0) return { text: "The tunnels are picked clean. Check back after the next stasher." };
    const hit = targets[randInt(0, targets.length - 1)];
    const found = Math.random() < 0.5;
    if (!found) return { text: "Three hours of wading and nothing but rats. The city keeps its secrets." };
    await ctx.db.patch(hit._id, { found: true, foundBy: player._id });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + hit.contentsValue });
    try { await ctx.db.insert("notifications", { userId: hit.ownerId, type: "cache", message: `🐀 Your cache "${hit.label}" (${money(hit.contentsValue)}) was found in the tunnels.`, read: false, timestamp: Date.now() }); } catch {}
    return { earned: hit.contentsValue, text: `Torchlight on rusted tin — "${hit.label}" with ${money(hit.contentsValue)} inside. Yours now.` };
  },
});

/* ════════════ 59. CITY CENSUS (unique crimes) ════════════ */
export const getCensus = query({
  args: {},
  handler: async (ctx) => {
    const week = String(Math.floor(Date.now() / (7 * 86_400_000)));
    const entries = await ctx.db.query("censusEntries").withIndex("by_week", (q) => q.eq("week", week)).collect();
    return entries.sort((a, b) => b.uniqueCrimes - a.uniqueCrimes).slice(0, 10);
  },
});
export const fileCensus = mutation({
  args: { uniqueCount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const week = String(Math.floor(Date.now() / (7 * 86_400_000)));
    const existing = await ctx.db.query("censusEntries").withIndex("by_week", (q) => q.eq("week", week)).collect();
    const mine = existing.find((e) => e.userId === player._id);
    if (mine) {
      if (args.uniqueCount > mine.uniqueCrimes) await ctx.db.patch(mine._id, { uniqueCrimes: args.uniqueCount });
    } else {
      await ctx.db.insert("censusEntries", { userId: player._id, userName: player.nickname ?? "Player", week, uniqueCrimes: args.uniqueCount, createdAt: Date.now() });
    }
    return { text: `Census filed: ${args.uniqueCount} distinct rackets this week. Most versatile operator takes the prize Sunday.` };
  },
});

/* ════════════ 60. HARBOR MANIFESTS ════════════ */
export const getManifests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("harborManifests").withIndex("by_sold", (q) => q.eq("sold", false)).collect();
  },
});
export const listManifest = mutation({
  args: { price: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cargo = pick(["Unmarked crates", "Reefer containers", "Autoparts (allegedly)", "Machinery", "Textiles"]);
    const ship = pick(SHIPS);
    const price = Math.max(5_000, Math.floor(args.price));
    await ctx.db.insert("harborManifests", { sellerId: player._id, ship, cargo, eta: Date.now() + randInt(6, 48) * 3600_000, price, sold: false, createdAt: Date.now() });
    return { text: `Manifest listed: ${ship} carrying ${cargo}. Asking ${money(price)} — another player will bite if it's good intel.` };
  },
});
export const buyManifest = mutation({
  args: { manifestId: v.id("harborManifests") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const m = await ctx.db.get(args.manifestId);
    if (!m || (m as any).sold) throw new Error("Manifest already sold.");
    if ((m as any).sellerId === player._id) throw new Error("That's your own listing.");
    const price = n((m as any).price, 0);
    if (n(player.money, 0) < price) throw new Error(`The seller wants ${money(price)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - price });
    await ctx.db.patch(args.manifestId, { sold: true, buyerId: player._id });
    const seller = await ctx.db.get((m as any).sellerId);
    if (seller) await ctx.db.patch((m as any).sellerId, { money: n((seller as any).money, 0) + price });
    return { intel: `${(m as any).ship} docking with ${(m as any).cargo} at ${new Date((m as any).eta).toLocaleTimeString()}`, text: `Manifest bought for ${money(price)}: ${(m as any).ship}, ${(m as any).cargo}, ETA ${new Date((m as any).eta).toLocaleString()}.` };
  },
});

/* ════════════ 69. BLOOD OATH RANKS ════════════ */
const OATHS = [
  { oath: "Oath of Iron", title: "Ironblood", sacrifice: "attack", cost: 5, grants: "defense" },
  { oath: "Oath of Silence", title: "The Unspoken", sacrifice: "money", cost: 500_000, grants: "reputation" },
  { oath: "Oath of the Knife", title: "Knivesworn", sacrifice: "defense", cost: 5, grants: "attack" },
  { oath: "Oath of Ash", title: "Ashwalker", sacrifice: "points", cost: 200, grants: "attack" },
];
export const getOaths = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const taken = await ctx.db.query("bloodOaths").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { oaths: OATHS, taken: taken.map((t) => t.title) };
  },
});
export const takeOath = mutation({
  args: { oathIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const o = OATHS[Math.max(0, Math.min(OATHS.length - 1, args.oathIndex))];
    const taken = await ctx.db.query("bloodOaths").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (taken.some((t) => t.oath === o.oath)) throw new Error("An oath is forever — you've sworn this one.");
    if (o.sacrifice === "money" && n(player.money, 0) < o.cost) throw new Error(`The oath demands ${money(o.cost)} burned.`);
    if (o.sacrifice === "points" && n(player.points, 0) < o.cost) throw new Error(`The oath demands ${o.cost} points sacrificed.`);
    if (o.sacrifice === "attack" && n(player.attack, 0) <= o.cost) throw new Error(`The oath demands ${o.cost} permanent attack. You can't afford to lose it.`);
    if (o.sacrifice === "defense" && n(player.defense, 0) <= o.cost) throw new Error(`The oath demands ${o.cost} permanent defense. You can't afford to lose it.`);
    const patch: any = {};
    if (o.sacrifice === "money") patch.money = n(player.money, 0) - o.cost;
    if (o.sacrifice === "points") patch.points = n(player.points, 0) - o.cost;
    if (o.sacrifice === "attack") patch.attack = n(player.attack, 0) - o.cost;
    if (o.sacrifice === "defense") patch.defense = n(player.defense, 0) - o.cost;
    if (o.grants === "attack") patch.attack = n(patch.attack ?? player.attack, 0) + o.cost * 2;
    if (o.grants === "defense") patch.defense = n(patch.defense ?? player.defense, 0) + o.cost * 2;
    if (o.grants === "reputation") patch.reputation = n(player.reputation, 0) + 25;
    await ctx.db.patch(player._id, patch);
    await ctx.db.insert("bloodOaths", { userId: player._id, oath: o.oath, title: o.title, sacrificed: o.sacrifice, createdAt: Date.now() });
    try { await ctx.db.insert("notifications", { userId: player._id, type: "oath", message: `🩸 You swore the ${o.oath}. You are now "${o.title}".`, read: false, timestamp: Date.now() }); } catch {}
    return { text: `🩸 The ${o.oath} is sworn — sacrificed ${o.sacrifice}, granted ${o.grants}. You walk as "${o.title}" now, and forever.` };
  },
});

/* ════════════ 70. OLD-TIMER'S TALES ════════════ */
export const getTales = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const unlocked = await ctx.db.query("loreUnlocks").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const have = new Set(unlocked.map((u) => u.tale));
    const all = [
      { tale: "The Man Who Died Twice", trigger: "die_10_times", text: "Old Doc Meggs swears he buried the same man in '61 and '63. Both times the coffin came back empty." },
      { tale: "The One-Dollar Don", trigger: "win_broke", text: "Rumor says a boy walked into the dice hall with a single dollar and walked out owning half of Red Hook." },
      { tale: "The Mayor's Ghost", trigger: "wanted_20", text: "They say the mayor's been dead for years and the syndicate runs a body double. The votes keep coming anyway." },
      { tale: "The Rat King", trigger: "betray_5", text: "Five crews trusted him. Five crews burned. He sleeps in the sewer now, they say, with the rats he commands." },
    ];
    return { all: all.map((a) => ({ ...a, unlocked: have.has(a.tale) })), unlockedCount: have.size };
  },
});
export const unlockTale = mutation({
  args: { trigger: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const already = await ctx.db.query("loreUnlocks").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (already.some((u) => u.trigger === args.trigger)) return { text: "That story's already in your book." };
    // simple checks for a couple of triggers
    if (args.trigger === "die_10_times" && n(player.totalDeaths, 0) < 10) throw new Error("You haven't earned that story yet (die 10 times).");
    if (args.trigger === "wanted_20" && n(player.wantedLevel, 0) < 20) throw new Error("You haven't earned that story yet (reach wanted level 20).");
    await ctx.db.insert("loreUnlocks", { userId: player._id, tale: args.trigger, trigger: args.trigger, createdAt: Date.now() });
    return { text: "A new page inked into your Old-Timer's book." };
  },
});

/* ════════════ 71. HEIRLOOMS ════════════ */
export const claimHeirloom = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const existing = await ctx.db.query("heirlooms").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (existing.length >= 2) throw new Error("Two heirlooms is all a person can carry.");
    const names = ["Grandfather's Zippo", "Mother's Locket", "The First Knife", "Prayer Card of St. Lucky"];
    const history = [`Received at level ${n(player.level, 1)}`, "Carried through the streets"];
    await ctx.db.insert("heirlooms", { userId: player._id, name: pick(names), tier: 1, history, acquiredAt: Date.now() });
    return { text: "Heirloom claimed. It grows with you — every milestone, every scar adds to its story." };
  },
});
export const engraveHeirloom = mutation({
  args: { heirloomId: v.id("heirlooms"), line: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const h = await ctx.db.get(args.heirloomId);
    if (!h || (h as any).userId !== player._id) throw new Error("Heirloom not found.");
    const cost = 50_000;
    if (n(player.money, 0) < cost) throw new Error(`The engraver charges ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    await ctx.db.patch(args.heirloomId, { history: [...((h as any).history ?? []), args.line.slice(0, 80)], tier: n((h as any).tier, 1) + 1 });
    return { text: `Engraved: "${args.line.slice(0, 80)}". The piece remembers.` };
  },
});

/* ════════════ 72. STREET NAME LEGACY ════════════ */
export const getStreetNames = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const names = await ctx.db.query("streetNames").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { names, active: names.find((x) => x.active)?.name ?? null };
  },
});
export const earnStreetName = mutation({
  args: { name: v.string(), milestone: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const level = n(player.level, 1);
    if (level < 10) throw new Error("Street names are earned — reach level 10 first.");
    const cost = level * 10_000;
    if (n(player.money, 0) < cost) throw new Error(`Getting the streets to say it costs ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    const existing = await ctx.db.query("streetNames").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    for (const e of existing) await ctx.db.patch(e._id, { active: false });
    await ctx.db.insert("streetNames", { userId: player._id, name: args.name.slice(0, 24), milestone: args.milestone.slice(0, 40), active: true, createdAt: Date.now() });
    return { text: `The streets will call you "${args.name.slice(0, 24)}" — and the reason: ${args.milestone.slice(0, 40)}.` };
  },
});

/* ════════════ 73. CREW BANNER FORGE ════════════ */
export const getBanner = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const rows = await ctx.db.query("crewBanners").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
    return { banner: rows[0] ?? null };
  },
});
export const forgeBanner = mutation({
  args: { emblem: v.string(), colorPrimary: v.string(), colorSecondary: v.string(), motto: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 100_000;
    if (n(player.money, 0) < cost) throw new Error(`The forge charges ${money(cost)} per banner.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    const rows = await ctx.db.query("crewBanners").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
    const banner = { emblem: args.emblem.slice(0, 8), colorPrimary: args.colorPrimary.slice(0, 24), colorSecondary: args.colorSecondary.slice(0, 24), motto: args.motto.slice(0, 60) };
    if (rows[0]) await ctx.db.patch(rows[0]._id, { ...banner, createdAt: Date.now() });
    else await ctx.db.insert("crewBanners", { ownerId: player._id, ...banner, createdAt: Date.now() });
    return { text: `Banner forged: ${banner.emblem} — "${banner.motto}". It flies over everything you hold.` };
  },
});

/* ════════════ 78. WITNESS ELIMINATION ════════════ */
export const getWitnessThreats = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return { wanted: 0, witnesses: [] as any[] };
    const wanted = n(player.wantedLevel, 0);
    const witnesses = Array.from({ length: Math.min(3, Math.ceil(wanted / 4)) }, (_, i) => ({
      name: pick(["grocery clerk", "night porter", "cab driver", "beat cop", "janitor", "hot dog vendor"]) + ` #${i + 1}`,
      cost: (i + 1) * 120_000,
    }));
    return { wanted, witnesses };
  },
});
export const eliminateWitness = mutation({
  args: { witnessName: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = Math.max(50_000, Math.floor(args.cost));
    if (n(player.money, 0) < cost) throw new Error(`The cleaner wants ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost, wantedLevel: Math.max(0, n(player.wantedLevel, 0) - 2) });
    const success = Math.random() < 0.8;
    await ctx.db.insert("witnessHits", { userId: player._id, witnessName: args.witnessName, cost, success, createdAt: Date.now() });
    return { success, text: success ? `The ${args.witnessName} "moved away suddenly." Case files thinning (-2 wanted).` : `The ${args.witnessName} got protection and a book deal. Money wasted, heat unchanged.` };
  },
});

/* ════════════ 79. DEAD MAN'S SWITCH ════════════ */
export const getDeadSwitch = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const rows = await ctx.db.query("deadSwitches").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { switch: rows[0] ?? null };
  },
});
export const armDeadSwitch = mutation({
  args: { targetName: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const cost = 200_000;
    if (n(player.money, 0) < cost) throw new Error(`Sealed envelopes and a lawyer cost ${money(cost)}.`);
    await ctx.db.patch(player._id, { money: n(player.money, 0) - cost });
    const rows = await ctx.db.query("deadSwitches").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (rows[0]) await ctx.db.patch(rows[0]._id, { targetName: args.targetName.slice(0, 40), armed: true, triggered: false });
    else await ctx.db.insert("deadSwitches", { userId: player._id, targetName: args.targetName.slice(0, 40), armed: true, triggered: false, createdAt: Date.now() });
    return { text: `Switch armed on ${args.targetName}. If they ever put you inside, everything you have on them goes public within the hour.` };
  },
});

/* ════════════ 80. CARTEL INTRODUCTION ════════════ */
const CARTEL_ROUTES = [
  { route: "Coastal Pipeline", months: 3, invested: 1_000_000, monthly: 750_000 },
  { route: "Desert Corridor", months: 6, invested: 2_500_000, monthly: 1_900_000 },
  { route: "Continental Line", months: 12, invested: 6_000_000, monthly: 4_800_000 },
];
export const getCartelState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const contracts = await ctx.db.query("cartelContracts").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    return { routes: CARTEL_ROUTES, contracts: contracts.filter((c) => c.active), eligible: n(player.level, 1) >= 50 };
  },
});
export const signCartelContract = mutation({
  args: { routeIndex: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (n(player.level, 1) < 50) throw new Error("The cartel only deals with established operators (level 50+).");
    const r = CARTEL_ROUTES[Math.max(0, Math.min(CARTEL_ROUTES.length - 1, args.routeIndex))];
    if (n(player.money, 0) < r.invested) throw new Error(`${r.route} requires ${money(r.invested)} up front.`);
    const active = await ctx.db.query("cartelContracts").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    if (active.filter((c) => c.active).length >= 2) throw new Error("Two routes maximum — even for you.");
    await ctx.db.patch(player._id, { money: n(player.money, 0) - r.invested });
    await ctx.db.insert("cartelContracts", { userId: player._id, route: r.route, invested: r.invested, months: r.months, monthlyReturn: r.monthly, collectedMonths: 0, active: true, createdAt: Date.now() });
    return { text: `${r.route} signed — ${money(r.invested)} in, ${money(r.monthly)}/month for ${r.months} months. Don't miss a payment and don't ask what's inside.` };
  },
});
export const collectCartelPayout = mutation({
  args: { contractId: v.id("cartelContracts") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const c = await ctx.db.get(args.contractId);
    if (!c || (c as any).userId !== player._id || !(c as any).active) throw new Error("Contract not found.");
    const elapsedMonths = Math.min(n((c as any).months, 1), Math.floor((Date.now() - n((c as any).createdAt, Date.now())) / (30 * 86_400_000)));
    const due = elapsedMonths - n((c as any).collectedMonths, 0);
    if (due <= 0) return { text: "Next payout hasn't matured — the product moves slow and steady." };
    const total = due * n((c as any).monthlyReturn, 0);
    const seized = Math.random() < 0.08; // small seizure risk each collection
    if (seized) {
      await ctx.db.patch(args.contractId, { collectedMonths: elapsedMonths });
      return { text: `A task force pinned the exchange. This month's ${money(total)} walked into an evidence locker. The cartel is "disappointed."` };
    }
    await ctx.db.patch(args.contractId, { collectedMonths: elapsedMonths });
    await ctx.db.patch(player._id, { money: n(player.money, 0) + total });
    if (elapsedMonths >= n((c as any).months, 1)) await ctx.db.patch(args.contractId, { active: false });
    return { earned: total, text: `${due} month(s) of product money: ${money(total)}. Clean envelopes, no fingerprints.` };
  },
});

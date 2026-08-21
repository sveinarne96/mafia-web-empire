import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper: get current auth user
async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

// ===== BLACKJACK =====

function bjCardValue(card: string): number {
  const rank = card.split("-")[0];
  if (rank === "A") return 11;
  if (["K", "Q", "J"].includes(rank)) return 10;
  return parseInt(rank) || 10;
}

function bjHandTotal(hand: string[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += bjCardValue(c);
    if (c.startsWith("A")) aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

const BJ_SUITS = ["h", "d", "c", "s"];
const BJ_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function shuffleDeck(): string[] {
  const deck: string[] = [];
  for (const s of BJ_SUITS) for (const r of BJ_RANKS) deck.push(`${r}-${s}`);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealerPlay(h: string[]): string[] {
  const deck = shuffleDeck();
  const hand = [...h];
  while (bjHandTotal(hand) < 17) hand.push(deck.pop()!);
  return hand;
}

export const blackjackDeal = mutation({
  args: { bet: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.inPrison ?? false)) throw new Error("You are in prison!");
    if ((player.isDead ?? false)) throw new Error("You are dead!");
    if (args.bet < 10) throw new Error("Minimum bet is $10!");
    if ((player.money ?? 0) < args.bet) throw new Error("Not enough money!");

    const deck = shuffleDeck();
    const playerHand: string[] = [deck.pop()!, deck.pop()!];
    const dealerHand: string[] = [deck.pop()!, deck.pop()!];
    const pTotal = bjHandTotal(playerHand);
    const dTotal = bjHandTotal(dealerHand);

    await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.bet });

    if (pTotal === 21 && dTotal !== 21) {
      const winnings = Math.floor(args.bet * 1.5);
      await ctx.db.patch(player._id, { money: (player.money ?? 0) + args.bet + winnings, experience: (player.experience ?? 0) + 15 });
      return { playerHand, dealerHand, playerTotal: 21, dealerTotal: dTotal, result: "blackjack", winnings };
    }
    if (pTotal > 21) {
      return { playerHand, dealerHand, playerTotal: pTotal, dealerTotal: dTotal, result: "bust", winnings: 0 };
    }
    return { playerHand, dealerHand, playerTotal: pTotal, dealerTotal: dTotal, result: "playing", winnings: 0, bet: args.bet };
  },
});

export const blackjackHit = mutation({
  args: { hand: v.array(v.string()), bet: v.number() },
  handler: async (_ctx, args) => {
    const deck = shuffleDeck();
    const hand = [...args.hand, deck.pop()!];
    const total = bjHandTotal(hand);
    if (total > 21) return { playerHand: hand, playerTotal: total, result: "bust", winnings: 0 };
    return { playerHand: hand, playerTotal: total, result: "playing", winnings: 0 };
  },
});

export const blackjackStand = mutation({
  args: { hand: v.array(v.string()), bet: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");

    const dHand = dealerPlay([shuffleDeck().pop()!, shuffleDeck().pop()!]);
    const pTotal = bjHandTotal(args.hand);
    const dTotal = bjHandTotal(dHand);

    let result = "push";
    let winnings = 0;
    if (dTotal > 21 || pTotal > dTotal) { result = "win"; winnings = args.bet; }
    else if (pTotal < dTotal) { result = "lose"; winnings = -args.bet; }

    if (winnings > 0) {
      await ctx.db.patch(player._id, { money: (player.money ?? 0) + winnings, experience: (player.experience ?? 0) + 10 });
    }
    return { playerHand: args.hand, dealerHand: dHand, playerTotal: pTotal, dealerTotal: dTotal, result, winnings };
  },
});

// ===== LOTTO =====

export const buyLottoTicket = mutation({
  args: { type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("mega")), numbers: v.array(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.inPrison ?? false)) throw new Error("You are in prison!");
    const costs: Record<string, number> = { daily: 100, weekly: 500, mega: 5000 };
    const multipliers: Record<string, number> = { daily: 50, weekly: 200, mega: 5000 };
    const cost = costs[args.type];
    const maxNum = args.type === "mega" ? 50 : 30;
    const count = args.type === "mega" ? 6 : 5;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money!");
    if (args.numbers.length !== count) throw new Error(`Pick exactly ${count} numbers!`);
    if (args.numbers.some((n) => n < 1 || n > maxNum)) throw new Error(`Numbers must be 1-${maxNum}!`);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost });
    const winning: number[] = [];
    while (winning.length < count) { const n = Math.floor(Math.random() * maxNum) + 1; if (!winning.includes(n)) winning.push(n); }
    const matches = args.numbers.filter((n) => winning.includes(n)).length;
    let prize = 0;
    if (matches === count) prize = cost * multipliers[args.type];
    else if (matches === count - 1) prize = cost * 10;
    else if (matches === count - 2) prize = cost * 3;
    if (prize > 0) await ctx.db.patch(player._id, { money: (player.money ?? 0) + prize, experience: (player.experience ?? 0) + 20 });
    return { winning, matches, prize, cost };
  },
});

// ===== VEHICLES / GARAGE =====

const vehicleShopItems = [
  { name: "Beater Sedan", type: "sedan", speed: 20, storage: 10, armored: false, price: 5000 },
  { name: "Stolen Civic", type: "sedan", speed: 25, storage: 8, armored: false, price: 3000 },
  { name: "Muscle Car", type: "sports", speed: 40, storage: 6, armored: false, price: 25000 },
  { name: "Getaway Van", type: "van", speed: 15, storage: 30, armored: false, price: 15000 },
  { name: "Armored SUV", type: "suv", speed: 30, storage: 20, armored: true, price: 75000 },
  { name: "Sports Car", type: "sports", speed: 55, storage: 4, armored: false, price: 100000 },
  { name: "Armored Truck", type: "truck", speed: 12, storage: 50, armored: true, price: 200000 },
  { name: "Supercar", type: "supercar", speed: 65, storage: 3, armored: false, price: 500000 },
];

export const getVehicleShop = query({ args: {}, handler: async () => vehicleShopItems });

export const getGarage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
  },
});

export const buyVehicle = mutation({
  args: { name: v.string(), type: v.string(), speed: v.number(), storage: v.number(), armored: v.boolean(), price: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.money ?? 0) < args.price) throw new Error("Not enough money!");
    await ctx.db.insert("vehicles", { userId: player._id, name: args.name, type: args.type, speed: args.speed, storage: args.storage, armored: args.armored, stolen: false, purchasePrice: args.price });
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.price });
    return { bought: args.name };
  },
});

export const sellVehicle = mutation({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle || vehicle.userId !== player._id) throw new Error("Not your vehicle!");
    const sellPrice = Math.floor(vehicle.purchasePrice * 0.6);
    await ctx.db.delete(args.vehicleId);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + sellPrice });
    return { sold: vehicle.name, price: sellPrice };
  },
});

export const stealVehicle = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.inPrison ?? false)) throw new Error("You are in prison!");
    if ((player.isDead ?? false)) throw new Error("You are dead!");
    const success = Math.random() > 0.25;
    if (!success) {
      const arrested = Math.random() > 0.25;
      await ctx.db.patch(player._id, {
        wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + 2),
        experience: (player.experience ?? 0) + 5,
        ...(arrested ? { inPrison: true, prisonTime: 1800000 } : { life: Math.max(0, (player.life ?? 100) - 15) }),
      });
      return { success: false, arrested };
    }
    const stolen = vehicleShopItems[Math.floor(Math.random() * vehicleShopItems.length)];
    await ctx.db.insert("vehicles", { userId: player._id, name: `Stolen ${stolen.name}`, type: stolen.type, speed: stolen.speed, storage: stolen.storage, armored: stolen.armored, stolen: true, purchasePrice: 0 });
    await ctx.db.patch(player._id, { wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + 3), experience: (player.experience ?? 0) + 20, totalCrimes: (player.totalCrimes ?? 0) + 1 });
    return { success: true, vehicle: stolen.name };
  },
});

// ===== INVENTORY =====

export const getInventory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    const inv = await ctx.db.query("inventory").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
    const result = [];
    for (const entry of inv) {
      const item = await ctx.db.get(entry.itemId);
      if (item) result.push({ ...entry, item });
    }
    return result;
  },
});

export const buyItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    if ((player.level ?? 1) < item.levelRequired) throw new Error(`Need level ${item.levelRequired}!`);
    if ((player.money ?? 0) < item.price) throw new Error("Not enough money!");
    const existing = await ctx.db.query("inventory").withIndex("by_user_item", (q) => q.eq("userId", player._id).eq("itemId", args.itemId)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { quantity: existing.quantity + 1 });
    } else {
      await ctx.db.insert("inventory", { userId: player._id, itemId: args.itemId, quantity: 1, equipped: false });
    }
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - item.price });
    return { bought: item.name };
  },
});

export const equipItem = mutation({
  args: { inventoryId: v.id("inventory") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const entry = await ctx.db.get(args.inventoryId);
    if (!entry || entry.userId !== player._id) throw new Error("Not your item!");
    const item = await ctx.db.get(entry.itemId);
    if (!item) throw new Error("Item not found");
    const wasEquipped = entry.equipped;
    await ctx.db.patch(args.inventoryId, { equipped: !wasEquipped });
    if (item.type === "weapon" || item.type === "armor") {
      const atkChange = wasEquipped ? -item.attack : item.attack;
      const defChange = wasEquipped ? -item.defense : item.defense;
      await ctx.db.patch(player._id, { attack: Math.max(1, (player.attack ?? 10) + atkChange), defense: Math.max(1, (player.defense ?? 10) + defChange) });
    }
    return { equipped: !wasEquipped };
  },
});

export const buyItemWithPoints = mutation({
  args: { itemName: v.string(), type: v.string(), rarity: v.string(), cost: v.number(), attack: v.number(), defense: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if ((player.points ?? 0) < args.cost) throw new Error("Not enough points!");
    const itemId = await ctx.db.insert("items", {
      name: args.itemName, description: `A ${args.rarity} ${args.type}`, type: args.type,
      rarity: args.rarity, attack: args.attack, defense: args.defense, price: 0, levelRequired: Math.max(1, Math.floor(args.cost / 100)),
    });
    await ctx.db.insert("inventory", { userId: player._id, itemId, quantity: 1, equipped: false });
    await ctx.db.patch(player._id, { points: player.points - args.cost });
    return { bought: args.itemName };
  },
});

// ===== MISSIONS =====

export const getMissions = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("missions").collect(),
});

export const getPlayerMissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("playerMissions").withIndex("by_user", (q) => q.eq("userId", player._id)).collect();
  },
});

export const acceptMission = mutation({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const mission = await ctx.db.get(args.missionId);
    if (!mission) throw new Error("Mission not found");
    if ((player.level ?? 1) < mission.levelRequired) throw new Error(`Need level ${mission.levelRequired}!`);
    const existing = await ctx.db.query("playerMissions").withIndex("by_user_mission", (q) => q.eq("userId", player._id).eq("missionId", args.missionId)).unique();
    if (existing && existing.completed) throw new Error("Already completed!");
    if (existing) throw new Error("Already accepted!");
    await ctx.db.insert("playerMissions", { userId: player._id, missionId: args.missionId, progress: 0, completed: false, claimed: false, startedAt: Date.now() });
    return { accepted: mission.title };
  },
});

export const completeMission = mutation({
  args: { playerMissionId: v.id("playerMissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    const pm = await ctx.db.get(args.playerMissionId);
    if (!pm || pm.userId !== player._id) throw new Error("Not your mission!");
    if (pm.completed) throw new Error("Already completed!");
    const mission = await ctx.db.get(pm.missionId);
    if (!mission) throw new Error("Mission not found");
    await ctx.db.patch(args.playerMissionId, { completed: true, claimed: true });
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + mission.reward, points: (player.points ?? 0) + mission.pointsReward, experience: (player.experience ?? 0) + 15 });
    return { reward: mission.reward, points: mission.pointsReward };
  },
});

// ===== ORGANIZED CRIME =====

export const getOrganizedCrimes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player || !player.familyId) return [];
    return await ctx.db.query("organizedCrimes").withIndex("by_family", (q) => q.eq("familyId", player.familyId!)).collect();
  },
});

export const joinOrganizedCrime = mutation({
  args: { crimeId: v.id("organizedCrimes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    if (!player.familyId) throw new Error("Join a family first!");
    const crime = await ctx.db.get(args.crimeId);
    if (!crime) throw new Error("Crime not found!");
    if (crime.familyId !== player.familyId) throw new Error("Not your family's crime!");
    if ((player.level ?? 1) < crime.levelRequired) throw new Error(`Need level ${crime.levelRequired}!`);
    const success = Math.random() < crime.successRate + ((player.attack ?? 10) / 100) * 0.15;
    if (success) {
      await ctx.db.patch(player._id, { money: (player.money ?? 0) + crime.reward, experience: (player.experience ?? 0) + 30 });
    } else {
      await ctx.db.patch(player._id, { life: Math.max(0, (player.life ?? 100) - 30), wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + 3) });
    }
    return { success, reward: success ? crime.reward : 0 };
  },
});

// ===== COMPANY =====

export const getMyBusinesses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    return await ctx.db.query("businesses").withIndex("by_owner", (q) => q.eq("ownerId", player._id)).collect();
  },
});

export const getBusinessShop = query({
  args: {},
  handler: async () => [
    { name: "Corner Store", type: "retail", city: "New York", price: 10000 },
    { name: "Pizza Shop", type: "food", city: "Chicago", price: 15000 },
    { name: "Auto Repair", type: "service", city: "Detroit", price: 25000 },
    { name: "Nightclub", type: "entertainment", city: "Miami", price: 75000 },
    { name: "Import/Export", type: "trade", city: "Los Angeles", price: 150000 },
    { name: "Strip Club", type: "entertainment", city: "Las Vegas", price: 200000 },
  ],
});

// ===== FORUM SEARCH =====

export const searchForumPosts = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (args.query.length < 2) return [];
    const all = await ctx.db.query("forumPosts").order("desc").take(200);
    return all.filter((p) => p.title.toLowerCase().includes(args.query.toLowerCase()) || p.body.toLowerCase().includes(args.query.toLowerCase()));
  },
});

// ===== SUPPORT =====

export const submitSupportTicket = mutation({
  args: { subject: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Player not found");
    await ctx.db.insert("messages", { senderId: player._id, receiverId: player._id, subject: `[SUPPORT] ${args.subject}`, body: args.body, read: false, timestamp: Date.now() });
    return { submitted: true };
  },
});

// ===== ONLINE PLAYERS =====

export const getOnlinePlayers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const player = await getCurrentUser(ctx);
    if (!player) return [];
    const players = await ctx.db.query("users").withIndex("by_location", (q) => q.eq("location", player.location ?? "New York")).collect();
    return players.map((p) => ({ _id: p._id, nickname: p.nickname, level: p.level, location: p.location }));
  },
});

export const commitLegendaryCrime = mutation({
  args: {
    crimeId: v.string(),
    reward: v.number(),
    xp: v.number(),
    risk: v.number(),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player.inPrison ?? false)) throw new Error("You are in prison!");
    if ((player.isDead ?? false)) throw new Error("You are dead!");

    const success = Math.random() * 100 > args.risk;
    if (success) {
      await ctx.db.patch(player._id, {
        money: (player.money ?? 0) + args.reward,
        experience: (player.experience ?? 0) + args.xp,
      });
      return { success: true, message: `SUCCESS! You earned $${args.reward.toLocaleString()} and ${args.xp.toLocaleString()} XP!` };
    } else {
      const penalty = Math.floor(args.reward * 0.3);
      await ctx.db.patch(player._id, {
        money: Math.max(0, (player.money ?? 0) - penalty),
        life: Math.max(0, (player.life ?? 100) - 30),
      });
      return { success: false, message: `FAILED! You lost $${penalty.toLocaleString()} and took 30 damage.` };
    }
  },
});

export const claimDailyReward = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    const now = Date.now();
    const oneDayMs = 86400000;
    const lastClaim = (player as any).lastDailyClaim ?? 0;
    const streak = (player as any).dailyStreak ?? 0;

    if (lastClaim && (now - lastClaim) < oneDayMs) {
      return { success: false, message: "You already claimed today's reward! Come back tomorrow." };
    }

    const newStreak = (lastClaim && (now - lastClaim) < oneDayMs * 2) ? streak + 1 : 1;
    const dayIndex = ((newStreak - 1) % 7);
    const rewards = [100000, 350000, 700000, 1400000, 2800000, 6000000, 12000000];
    const reward = rewards[dayIndex];
    const isBonusDay = dayIndex === 6;

    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + reward,
      lastDailyClaim: now,
      dailyStreak: newStreak,
    } as any);

    return {
      success: true,
      message: isBonusDay
        ? `🎁 DAY 7 BONUS! You earned $${reward.toLocaleString()} + a Legendary Item! Streak resets!`
        : `🎁 Day ${newStreak}! You earned $${reward.toLocaleString()}! Come back tomorrow for more!`,
    };
  },
});

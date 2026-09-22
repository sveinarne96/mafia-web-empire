import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== RIVAL AI GANGS =====
export const getAIGangs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aiGangs").collect();
  },
});

export const initAIGangs = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("aiGangs").collect();
    if (existing.length > 0) return { message: "Gangs already exist" };
    const gangs = [
      { name: "Los Diablos", strength: 150, territory: "Miami", income: 50000, level: 10 },
      { name: "The Syndicate", strength: 200, territory: "New York", income: 75000, level: 15 },
      { name: "Yakuza Rising", strength: 180, territory: "Los Angeles", income: 60000, level: 12 },
      { name: "Iron Wolves", strength: 220, territory: "Chicago", income: 80000, level: 18 },
      { name: "Cobra Cartel", strength: 170, territory: "Houston", income: 55000, level: 11 },
      { name: "Shadow Collective", strength: 250, territory: "Las Vegas", income: 100000, level: 20 },
    ];
    for (const g of gangs) {
      await ctx.db.insert("aiGangs", { ...g, lastAttack: 0, defeated: 0 });
    }
    return { message: "AI gangs initialized", count: gangs.length };
  },
});

export const attackAIGang = mutation({
  args: { gangId: v.id("aiGangs") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const gang = await ctx.db.get(args.gangId);
    if (!gang) throw new Error("Gang not found");
    const playerPower = ((player as any).attack ?? 10) + ((player as any).defense ?? 10);
    const winChance = Math.min(0.9, 0.3 + (playerPower / gang.strength) * 0.3);
    const won = Math.random() < winChance;
    if (won) {
      const reward = gang.income * 2;
      await ctx.db.patch(userId, { money: ((player as any).money ?? 0) + reward });
      await ctx.db.patch(args.gangId, { strength: Math.max(50, gang.strength - 20), defeated: (gang.defeated ?? 0) + 1 });
      return { won, reward, message: `You defeated ${gang.name}! Earned $${reward.toLocaleString()}` };
    } else {
      const damage = Math.floor(Math.random() * 30) + 10;
      await ctx.db.patch(userId, { life: Math.max(0, ((player as any).life ?? 100) - damage) });
      return { won, damage, message: `${gang.name} ambushed you! Lost ${damage} HP` };
    }
  },
});

// ===== INFORMANT SYSTEM =====
export const hireInformant = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const cost = 100000;
    if (((player as any).money ?? 0) < cost) throw new Error("Need $100K to hire informant");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) - cost });
    const intel = {
      location: (target as any).location ?? "Unknown",
      level: (target as any).level ?? 1,
      money: Math.floor(((target as any).money ?? 0) * 0.8),
      attack: (target as any).attack ?? 10,
    };
    return { success: true, intel, message: `Informant reports: ${(target as any).nickname} is in ${intel.location}, Level ${intel.level}, ~$${intel.money.toLocaleString()} cash` };
  },
});

// ===== WITNESS SYSTEM =====
export const witnessCrime = mutation({
  args: { crimeType: v.string() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const witnessChance = 0.25;
    const witnessed = Math.random() < witnessChance;
    if (witnessed) {
      const wantedIncrease = 1;
      const newWanted = Math.min(5, ((player as any).wantedLevel ?? 0) + wantedIncrease);
      await ctx.db.patch(userId, { wantedLevel: newWanted });
      return { witnessed: true, wantedLevel: newWanted, message: `A witness saw you committing ${args.crimeType}! Wanted level increased to ${newWanted}!` };
    }
    return { witnessed: false, message: "No witnesses. Clean getaway!" };
  },
});

// ===== DISTRICT OWNERSHIP =====
export const getDistricts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("districts").collect();
  },
});

export const buyDistrict = mutation({
  args: { districtId: v.id("districts") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const district = await ctx.db.get(args.districtId);
    if (!district) throw new Error("District not found");
    if ((district as any).ownerId) throw new Error("District already owned");
    if (((player as any).money ?? 0) < (district as any).price) throw new Error("Not enough money");
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) - (district as any).price });
    await ctx.db.patch(args.districtId, { ownerId: userId });
    return { success: true, message: `You now own ${(district as any).name}! Earning $${(district as any).income.toLocaleString()}/hour` };
  },
});

export const collectDistrictIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const districts = await ctx.db.query("districts").withIndex("by_owner", (q) => q.eq("ownerId", userId)).collect();
    let totalIncome = 0;
    for (const d of districts) {
      totalIncome += (d as any).income ?? 0;
    }
    if (totalIncome > 0) {
      await ctx.db.patch(userId, { money: ((player as any).money ?? 0) + totalIncome });
    }
    return { totalIncome, count: districts.length };
  },
});

export const initDistricts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("districts").collect();
    if (existing.length > 0) return { message: "Districts exist" };
    const districts = [
      { name: "Downtown Core", city: "New York", price: 5000000, income: 25000, security: 80 },
      { name: "Harbor District", city: "New York", price: 3000000, income: 15000, security: 50 },
      { name: "Neon Strip", city: "Las Vegas", price: 8000000, income: 40000, security: 90 },
      { name: "South Beach", city: "Miami", price: 4000000, income: 20000, security: 60 },
      { name: "Riverside", city: "Chicago", price: 2000000, income: 10000, security: 40 },
      { name: "Hollywood Hills", city: "Los Angeles", price: 6000000, income: 30000, security: 75 },
      { name: "Chinatown", city: "San Francisco", price: 3500000, income: 18000, security: 55 },
      { name: "Midtown", city: "New York", price: 7000000, income: 35000, security: 85 },
    ];
    for (const d of districts) {
      await ctx.db.insert("districts", { ...d, ownerId: undefined });
    }
    return { message: "Districts initialized" };
  },
});

// ===== BLACK MARKET AUCTIONS =====
export const getAuctions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auctions").collect();
  },
});

export const bidOnAuction = mutation({
  args: { auctionId: v.id("auctions"), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const auction = await ctx.db.get(args.auctionId);
    if (!auction) throw new Error("Auction not found");
    if (args.amount <= ((auction as any).currentBid ?? 0)) throw new Error("Bid must be higher than current bid");
    if (((player as any).money ?? 0) < args.amount) throw new Error("Not enough money");
    await ctx.db.patch(args.auctionId, { currentBid: args.amount, highestBidder: userId });
    return { success: true, message: `Bid of $${args.amount.toLocaleString()} placed!` };
  },
});

// ===== MARRIAGE SYSTEM =====
export const proposeMarriage = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found");
    if ((target as any).marriedTo) throw new Error("They are already married!");
    await ctx.db.patch(args.targetId, { marriedTo: userId } as any);
    await ctx.db.patch(userId, { marriedTo: args.targetId } as any);
    return { success: true, message: `You are now married to ${(target as any).nickname}! 💍` };
  },
});

export const divorce = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const spouseId = (player as any).marriedTo;
    if (!spouseId) throw new Error("Not married!");
    const spouse = await ctx.db.get(spouseId);
    if (spouse) {
      const sharedMoney = Math.floor((((player as any).money ?? 0) + ((spouse as any).money ?? 0)) / 2);
      await ctx.db.patch(userId, { money: sharedMoney, marriedTo: null } as any);
      await ctx.db.patch(spouseId, { money: sharedMoney, marriedTo: null } as any);
      return { success: true, message: `Divorced! You each received $${sharedMoney.toLocaleString()}` };
    }
    await ctx.db.patch(userId, { marriedTo: null } as any);
    return { success: true, message: "Divorce finalized." };
  },
});

// ===== ITEM CRAFTING =====
export const craftItem = mutation({
  args: { recipe: v.string() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const recipes: Record<string, { cost: number; result: string; attack: number; defense: number }> = {
      "lockpick_set": { cost: 5000, result: "Lockpick Set", attack: 5, defense: 0 },
      "kevlar_vest": { cost: 50000, result: "Kevlar Vest", attack: 0, defense: 25 },
      "silencer": { cost: 25000, result: "Silencer", attack: 15, defense: 0 },
      "bat_signal": { cost: 100000, result: "Bat Signal", attack: 30, defense: 20 },
      "diamond_blade": { cost: 500000, result: "Diamond Blade", attack: 50, defense: 10 },
      "nano_armor": { cost: 2000000, result: "Nano Armor", attack: 20, defense: 80 },
    };
    const recipe = recipes[args.recipe];
    if (!recipe) throw new Error("Unknown recipe");
    if (((player as any).money ?? 0) < recipe.cost) throw new Error(`Need $${recipe.cost.toLocaleString()}`);
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) - recipe.cost });
    await ctx.db.insert("inventory", {
      userId, itemId: `craft_${Date.now()}`, name: recipe.result, type: "crafted",
      equipped: false, quantity: 1, attack: recipe.attack, defense: recipe.defense, rarity: "epic",
    });
    return { success: true, message: `Crafted ${recipe.result}! +${recipe.attack} ATK, +${recipe.defense} DEF` };
  },
});

// ===== PERSONALITY SYSTEM =====
export const getPersonality = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) return null;
    const player = await ctx.db.get(userId);
    if (!player) return null;
    return {
      ruthless: ((player as any).personalityRuthless ?? 0),
      loyal: ((player as any).personalityLoyal ?? 0),
      snake: ((player as any).personalitySnake ?? 0),
      legend: ((player as any).personalityLegend ?? 0),
    };
  },
});

// ===== CRIME PHOTOGRAPHY =====
export const takePhoto = mutation({
  args: { crimeType: v.string() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const rarity = Math.random();
    let quality = "Common";
    let value = 1000;
    if (rarity > 0.95) { quality = "Legendary"; value = 500000; }
    else if (rarity > 0.85) { quality = "Epic"; value = 50000; }
    else if (rarity > 0.70) { quality = "Rare"; value = 10000; }
    else if (rarity > 0.50) { quality = "Uncommon"; value = 3000; }
    await ctx.db.insert("inventory", {
      userId, itemId: `photo_${Date.now()}`, name: `${quality} Photo: ${args.crimeType}`, type: "photo",
      equipped: false, quantity: 1, rarity: quality.toLowerCase(), price: value,
    });
    return { quality, value, message: `📸 ${quality} photo captured! Worth $${value.toLocaleString()}` };
  },
});

export const sellPhoto = mutation({
  args: { itemId: v.id("inventory") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) throw new Error("Not your photo");
    const value = (item as any).price ?? 1000;
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) + value });
    await ctx.db.delete(args.itemId);
    return { success: true, value, message: `Sold photo for $${value.toLocaleString()}` };
  },
});

// ===== TIME CAPSULES =====
export const buryTimeCapsule = mutation({
  args: { itemId: v.id("inventory"), days: v.number() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) throw new Error("Not your item");
    const digTime = Date.now() + args.days * 86400000;
    await ctx.db.insert("timeCapsules", {
      userId, itemId: args.itemId, itemName: (item as any).name,
      buriedAt: Date.now(), diggableAt: digTime, dug: false,
    });
    await ctx.db.patch(args.itemId, { equipped: false } as any);
    return { success: true, message: `Buried ${(item as any).name}. Diggable in ${args.days} days` };
  },
});

export const digTimeCapsule = mutation({
  args: { capsuleId: v.id("timeCapsules") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const capsule = await ctx.db.get(args.capsuleId);
    if (!capsule || capsule.userId !== userId) throw new Error("Not your capsule");
    if ((capsule as any).dug) throw new Error("Already dug");
    if (Date.now() < (capsule as any).diggableAt) throw new Error("Not ready yet!");
    await ctx.db.patch(args.capsuleId, { dug: true });
    return { success: true, message: `Dug up ${(capsule as any).itemName}! 💎` };
  },
});

// ===== RANSOMWARE =====
export const deployRansomware = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    const cost = 50000;
    if (((player as any).money ?? 0) < cost) throw new Error("Need $50K for ransomware");
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) - cost });
    const ransomAmount = Math.floor(((target as any).money ?? 0) * 0.15);
    await ctx.db.patch(args.targetId, { money: Math.max(0, ((target as any).money ?? 0) - ransomAmount) });
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) + ransomAmount });
    return { success: true, stolen: ransomAmount, message: `Ransomware deployed! Stole $${ransomAmount.toLocaleString()} from ${(target as any).nickname}` };
  },
});

// ===== NEWSPAPER HEADLINES =====
export const getHeadlines = query({
  args: {},
  handler: async (ctx) => {
    const headlines = await ctx.db.query("headlines").order("desc").take(20);
    return headlines;
  },
});

export const createHeadline = mutation({
  args: { title: v.string(), playerId: v.id("users"), crimeType: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    await ctx.db.insert("headlines", {
      title: args.title,
      playerName: (player as any)?.nickname ?? "Unknown",
      crimeType: args.crimeType,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

// ===== COCKROACH RACING =====
export const betCockroach = mutation({
  args: { cockroachIndex: v.number(), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (((player as any).money ?? 0) < args.amount) throw new Error("Not enough money");
    await ctx.db.patch(userId, { money: ((player as any).money ?? 0) - args.amount });
    const winner = Math.floor(Math.random() * 6);
    const won = winner === args.cockroachIndex;
    if (won) {
      const prize = args.amount * 5;
      await ctx.db.patch(userId, { money: ((player as any).money ?? 0) + prize });
      return { won, winner, prize, message: `🪳 Cockroach #${winner + 1} wins! You won $${prize.toLocaleString()}!` };
    }
    return { won, winner, message: `🪳 Cockroach #${winner + 1} wins. You lost $${args.amount.toLocaleString()}.` };
  },
});

// ===== DEAD MAN'S SWITCH =====
export const setDeadMansSwitch = mutation({
  args: { beneficiaryId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { deadMansSwitch: args.beneficiaryId } as any);
    return { success: true, message: "Dead Man's Switch armed. Your items will transfer on death." };
  },
});

// ===== UNDERGROUND RADIO =====
export const radioMessage = mutation({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const userId = (await ctx.db.query("users").first())?._id;
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (((player as any).level ?? 1) < 30) throw new Error("Need level 30 for Underground Radio");
    await ctx.db.insert("radioMessages", {
      senderId: userId,
      senderName: (player as any).nickname ?? "Unknown",
      message: args.message,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const getRadioMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("radioMessages").order("desc").take(50);
  },
});

// ===== SERVER PURGE =====
export const getPurgeStatus = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const purgeDay = new Date(monthStart);
    purgeDay.setDate(purgeDay.getDate() + 28);
    const purgeEnd = new Date(purgeDay);
    purgeEnd.setDate(purgeEnd.getDate() + 1);
    const isPurge = now >= purgeDay.getTime() && now < purgeEnd.getTime();
    const nextPurge = purgeDay.getTime();
    const timeUntil = Math.max(0, nextPurge - now);
    return { isPurge, nextPurge, timeUntil, purgeStart: purgeDay.getTime(), purgeEnd: purgeEnd.getTime() };
  },
});

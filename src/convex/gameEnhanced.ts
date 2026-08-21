import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


// ===== ENSURE PLAYER HAS ALL REQUIRED FIELDS =====
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
  if (Object.keys(patches).length > 0) {
    await ctx.db.patch(player._id, patches);
    return { ...player, ...patches };
  }
  return player;
}

async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return await ensurePlayerReady(ctx, user);
}

// ===== SAVE PROFILE (fix save button) =====
export const saveProfile = mutation({
  args: {
    nickname: v.optional(v.string()),
    avatarId: v.optional(v.string()),
    activeRole: v.optional(v.string()),
    activeTitle: v.optional(v.string()),
    bio: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const patch: Record<string, unknown> = {};
    if (args.nickname !== undefined) patch.nickname = args.nickname;
    if (args.avatarId !== undefined) patch.avatarId = args.avatarId;
    if (args.activeRole !== undefined) patch.activeRole = args.activeRole;
    if (args.activeTitle !== undefined) patch.activeTitle = args.activeTitle;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.profilePictureUrl !== undefined) patch.profilePictureUrl = args.profilePictureUrl;
    await ctx.db.patch(player._id, patch);
    return { success: true };
  },
});

// ===== STEAL FROM HOUSE =====
export const stealFromHouse = mutation({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    try {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison ?? false) throw new Error("You are in prison!");
    if (player.isDead ?? false) throw new Error("You are dead!");

    // 75% base success rate with level bonus
    const baseRate = 0.75;
    const levelBonus = Math.min(0.20, ((player.level ?? 1) * 0.004));
    const successRate = Math.min(0.95, baseRate + levelBonus);
    const succeeded = Math.random() < successRate;

    const difficultyMultipliers: Record<string, number> = {
      easy: 0.5, medium: 1.0, hard: 1.5, extreme: 2.5,
    };
    const mult = difficultyMultipliers[args.difficulty] ?? 1.0;

    const stolenItems = [
      { name: "Cash Stash", emoji: "💵", value: 100, type: "cash" },
      { name: "Gold Watch", emoji: "⌚", value: 500, type: "jewelry" },
      { name: "Laptop", emoji: "💻", value: 800, type: "electronics" },
      { name: "Jewelry Box", emoji: "💎", value: 1500, type: "jewelry" },
      { name: "Painting", emoji: "🖼️", value: 3000, type: "art" },
      { name: "TV", emoji: "📺", value: 600, type: "electronics" },
      { name: "Safe Contents", emoji: "🔐", value: 2000, type: "cash" },
      { name: "Designer Bag", emoji: "👜", value: 1200, type: "fashion" },
      { name: "Rare Coins", emoji: "🪙", value: 900, type: "collectible" },
      { name: "Medicine", emoji: "💊", value: 400, type: "medical" },
      { name: "Weapon", emoji: "🔫", value: 2500, type: "weapon" },
      { name: "Cash Register", emoji: "Register", value: 700, type: "cash" },
    ];

    let moneyEarned = 0;
    let itemsStolen: string[] = [];
    let damageTaken = 0;
    let arrested = false;

    if (succeeded) {
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numItems; i++) {
        const item = stolenItems[Math.floor(Math.random() * stolenItems.length)];
        const itemValue = Math.floor(item.value * mult);
        moneyEarned += itemValue;
        itemsStolen.push(`${item.emoji} ${item.name} ($${itemValue.toLocaleString()})`);
      }
      // Energy drink drop (5% chance)
      if (Math.random() < 0.05) {
        itemsStolen.push("⚡ Energy Drink");
      }
      // Secret chest drop (2.5% chance)
      if (Math.random() < 0.025) {
        itemsStolen.push("🗝️ SECRET CHEST FOUND!");
      }
    } else {
      damageTaken = Math.floor(Math.random() * 25 + 5);
      arrested = Math.random() > 0.25;
    }

    const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
    const xpEarned = succeeded ? 15 : 3;
    const currentXP = player.experience ?? 0;
    const newXP = currentXP + xpEarned;
    const xpNeeded = (player.level ?? 1) * 100;
    const levelUpNow = newXP >= xpNeeded && succeeded;

    await ctx.db.patch(player._id, {
      money: Math.max(0, (player.money ?? 0) + moneyEarned),
      life: newLife,
      totalCrimes: (player.totalCrimes ?? 0) + 1,
      experience: levelUpNow ? 0 : newXP,
      levelUpPending: levelUpNow ? true : (player.levelUpPending ?? false),
      inPrison: arrested,
      prisonTime: arrested ? 15000 : (player.prisonTime ?? 0),
      wantedLevel: arrested ? 0 : Math.min(10, (player.wantedLevel ?? 0) + (succeeded ? 1 : 0)),
    });

    return { success: succeeded, moneyEarned, itemsStolen, damageTaken, arrested, xpEarned };
    } catch (e: any) {
      throw new Error(e?.message ?? "stealFromHouse failed");
    }
  },
});

// ===== GTA CAR THEFT (cars show in garage) =====
export const gtaCarTheft = mutation({
  args: {},
  handler: async (ctx, args) => {
    try {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if (player.inPrison ?? false) throw new Error("You are in prison!");
    if (player.isDead ?? false) throw new Error("You are dead!");

    // 75% base success rate with level bonus
    const baseRate = 0.75;
    const levelBonus = Math.min(0.20, ((player.level ?? 1) * 0.004));
    const successRate = Math.min(0.95, baseRate + levelBonus);
    const succeeded = Math.random() < successRate;

    const carTypes = [
      { name: "Beater Sedan", speed: 40, storage: 10, price: 500, emoji: "🚗" },
      { name: "Stolen Pickup", speed: 45, storage: 20, price: 1200, emoji: "🛻" },
      { name: "Hot Hatch", speed: 65, storage: 8, price: 2500, emoji: "🏎️" },
      { name: "Muscle Car", speed: 75, storage: 6, price: 4000, emoji: "🏁" },
      { name: "Luxury Sedan", speed: 70, storage: 12, price: 8000, emoji: "🚗" },
      { name: "Sports Coupe", speed: 85, storage: 5, price: 12000, emoji: "🏎️" },
      { name: "Super Car", speed: 95, storage: 4, price: 25000, emoji: "🚀" },
    ];

    let vehicleId = null;
    let moneyEarned = 0;
    let damageTaken = 0;
    let arrested = false;

    if (succeeded) {
      const car = carTypes[Math.floor(Math.random() * carTypes.length)];
      vehicleId = await ctx.db.insert("vehicles", {
        userId: player._id,
        name: car.name,
        type: "stolen",
        speed: car.speed,
        storage: car.storage,
        armored: false,
        stolen: true,
        purchasePrice: 0,
      });
      moneyEarned = car.price;
    } else {
      damageTaken = Math.floor(Math.random() * 20 + 5);
      arrested = Math.random() > 0.25;
    }

    const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
    const xpEarned = succeeded ? 12 : 2;

    await ctx.db.patch(player._id, {
      money: Math.max(0, (player.money ?? 0) + moneyEarned),
      life: newLife,
      totalCrimes: (player.totalCrimes ?? 0) + 1,
      experience: (player.experience ?? 0) + xpEarned,
      inPrison: arrested,
      prisonTime: arrested ? 15000 : (player.prisonTime ?? 0),
      wantedLevel: arrested ? 0 : Math.min(10, (player.wantedLevel ?? 0) + (succeeded ? 2 : 0)),
    });

    return { success: succeeded, vehicleId, moneyEarned, damageTaken, arrested, xpEarned };
    } catch (e: any) {
      throw new Error(e?.message ?? "gtaCarTheft failed");
    }
  },
});

// ===== BODYGUARD SYSTEM =====
export const getBodyguardInfo = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const bodyguards = await ctx.db
      .query("bodyguards")
      .withIndex("by_employer", (q) => q.eq("employerId", player._id))
      .collect();
    return {
      active: bodyguards.filter((b: any) => b.active),
      bodyguardCount: bodyguards.filter((b: any) => b.active).length,
    };
  },
});

export const buyBodyguard = mutation({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    const costs: Record<number, number> = {
      1: 0, // free
      2: 10000000,
      3: 35000000,
      4: 95000000,
      5: 125000000,
    };

    // Check current bodyguard count
    const existing = await ctx.db
      .query("bodyguards")
      .withIndex("by_employer", (q) => q.eq("employerId", player._id))
      .collect();
    const activeCount = existing.filter((b: any) => b.active).length;

    if (args.count <= activeCount) throw new Error("Already have that many bodyguards!");
    if (args.count > 5) throw new Error("Max 5 bodyguards!");

    // Check if died - half price for new account
    const died = (player.totalDeaths ?? 0) > 0;
    const cost = died ? Math.floor((costs[args.count] ?? 0) / 2) : (costs[args.count] ?? 0);

    if ((player.money ?? 0) < cost) throw new Error(`Need $${cost.toLocaleString()}!`);
    if (args.count !== activeCount + 1) throw new Error(`Must buy one at a time! Next: bodyguard #${activeCount + 1}`);

    await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost });
    await ctx.db.insert("bodyguards", {
      employerId: player._id,
      guardId: player._id, // NPC guard, use employer as placeholder
      payPerDay: 0,
      active: true,
      hiredAt: Date.now(),
    });

    return { success: true, newCount: activeCount + 1, cost };
  },
});

// ===== SELL INVENTORY/GARAGE SPACE =====
export const sellCapacity = mutation({
  args: { type: v.union(v.literal("inventory"), v.literal("garage")), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const price = Math.min(500000, args.amount * 5000);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + price });
    return { price };
  },
});

// ===== PRESTIGE SYSTEM =====
export const prestige = mutation({
  args: {},
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player.level ?? 1) < 50) throw new Error("Need level 50 to prestige!");

    const newPrestige = (player.prestige ?? 0) + 1;
    const multiplier = 1 + (newPrestige * 0.15);

    await ctx.db.patch(player._id, {
      prestige: newPrestige,
      prestigeMultiplier: multiplier,
      level: 1,
      experience: 0,
      skillPoints: (player.skillPoints ?? 0) + 10,
      money: (player.money ?? 0) + 1000000 * newPrestige,
    });

    return { prestige: newPrestige, multiplier, bonus: 1000000 * newPrestige };
  },
});

// ===== SECRET CHALLENGES =====
export const getSecretChallenges = query({
  args: {},
  handler: async (ctx) => {
    const challenges = [];
    const categories = [
      "Crime Streak", "Speed Run", "Survival", "Gambling", "Combat",
      "Exploration", "Economy", "Social", "Smuggling", "Heist",
      "Stealth", "Bounty", "Boss", "Daily", "Weekly",
    ];
    for (const cat of categories) {
      for (let i = 0; i < 50; i++) {
        const difficulty = Math.random() < 0.3 ? "legendary" : Math.random() < 0.5 ? "hard" : "medium";
        challenges.push({
          id: `sc_${cat.toLowerCase().replace(/\s/g, "_")}_${i}`,
          name: `${cat} Challenge #${i + 1}`,
          category: cat,
          difficulty,
          reward: difficulty === "legendary" ? 1000000 : difficulty === "hard" ? 500000 : 100000,
          xpReward: difficulty === "legendary" ? 500 : difficulty === "hard" ? 250 : 100,
          description: `Complete a ${difficulty} ${cat.toLowerCase()} challenge`,
        });
      }
    }
    return challenges;
  },
});

// ===== BOOST SYSTEM =====
export const getBoostInfo = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const date = new Date(now);
    const day = date.getDay(); // 0=Sun, 1=Mon, etc.
    const hour = date.getHours();

    // Weekend boost: Fri 00:00 to Sun 00:00
    const isWeekendBoost = day === 5 || day === 6;
    const weekendBoostActive = isWeekendBoost;

    // Kill free zone: Mon-Wed 2 hours (let's say 20:00-22:00)
    const isKillFreeZone = (day >= 1 && day <= 3) && (hour >= 20 && hour < 22);

    // Golden hour: 1 hour each day (12:00-13:00)
    const isGoldenHour = hour === 12;

    // Next random event (every 30 min)
    const minutesSinceHour = date.getMinutes();
    const nextEventMinutes = 30 - (minutesSinceHour % 30);
    const nextEventAt = now + nextEventMinutes * 60 * 1000;

    return {
      weekendBoost: { active: weekendBoostActive, multiplier: 2.0, description: weekendBoostActive ? "🔥 WEEKEND BOOST ACTIVE! 2x rewards!" : `Next: Friday ${nextEventMinutes} min` },
      killFreeZone: { active: isKillFreeZone, description: isKillFreeZone ? "⚔️ KILL FREE ZONE! No PvP!" : "Next: Mon-Wed 20:00-22:00" },
      goldenHour: { active: isGoldenHour, multiplier: 3.0, description: isGoldenHour ? "✨ GOLDEN HOUR! 3x rewards!" : `Next in: ${nextEventMinutes} min` },
      nextRandomEventAt: nextEventAt,
      energyDrinkActive: false,
    };
  },
});

// ===== ADMIN FEATURES =====
export const adminGetAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") return [];
    return await ctx.db.query("users").collect();
  },
});

export const adminGiveMoney = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found");
    await ctx.db.patch(args.targetId, { money: (target.money ?? 0) + args.amount });
    return { success: true };
  },
});

export const adminBan = mutation({
  args: { targetId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { isBanned: true, banReason: args.reason });
    return { success: true };
  },
});

export const adminUnban = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { isBanned: false, banReason: undefined });
    return { success: true };
  },
});

export const adminSetLevel = mutation({
  args: { targetId: v.id("users"), level: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { level: args.level, experience: 0 });
    return { success: true };
  },
});

export const adminKillPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { life: 0, isDead: true });
    return { success: true };
  },
});

export const adminHealPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found");
    await ctx.db.patch(args.targetId, { life: target.maxLife ?? 100, isDead: false });
    return { success: true };
  },
});

export const adminJailPlayer = mutation({
  args: { targetId: v.id("users"), seconds: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { inPrison: true, prisonTime: args.seconds * 1000 });
    return { success: true };
  },
});

export const adminWipePlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, {
      money: 0, bank: 0, points: 0, level: 1, experience: 0,
      totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
      wantedLevel: 0, reputation: 0, prestige: 0,
    });
    return { success: true };
  },
});

// ===== ADMIN: GET EVENTS =====
export const adminGetEvents = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return {
      active: [
        { id: "ev1", name: "Double XP Weekend", type: "boost", endsAt: now + 86400000, description: "2x XP on all actions" },
        { id: "ev2", name: "Arctic Cold Snap", type: "weather", endsAt: now + 43200000, description: "Smuggling profits +50%" },
      ],
      scheduled: [
        { id: "ev3", name: "Grand Heist Tournament", type: "competition", startsAt: now + 172800000, description: "Top heist crew wins $50M" },
        { id: "ev4", name: "Street Race Championship", type: "competition", startsAt: now + 259200000, description: "1v1 street racing tournament" },
      ],
    };
  },
});

// ===== RANDOM EVENTS =====
export const getRandomEvent = query({
  args: {},
  handler: async (ctx) => {
    const events = [
      { name: "Police Chase!", emoji: "🚔", description: "Police spotted nearby! +50% arrest chance for 5 min", duration: 5, type: "danger" },
      { name: "Lucky Find!", emoji: "🍀", description: "Found cash on the ground! +$10,000", duration: 2, type: "bonus" },
      { name: "Rival Gang Attack!", emoji: "⚔️", description: "Rivals spotted! Defense +20% for 10 min", duration: 10, type: "combat" },
      { name: "Informant Tip!", emoji: "🕵️", description: "Someone leaked info! Crime success +15% for 5 min", duration: 5, type: "crime" },
      { name: "Black Market Sale!", emoji: "🏷️", description: "Items 30% off in the black market!", duration: 15, type: "shop" },
      { name: "Full Moon!", emoji: "🌕", description: "All crime rewards x1.5 for 10 min", duration: 10, type: "bonus" },
      { name: "Power Outage!", emoji: "🔌", description: "City in darkness! Stealth crimes +25% for 8 min", duration: 8, type: "crime" },
      { name: "Gang War!", emoji: "💥", description: "Active gang warfare! Combat XP x2 for 5 min", duration: 5, type: "combat" },
      { name: "VIP Target!", emoji: "🎯", description: "High-value target spotted! Rob rewards x3 for 3 min", duration: 3, type: "bonus" },
      { name: "Customs Crackdown!", emoji: "🚧", description: "Border tightened! Smuggling risk +30% for 10 min", duration: 10, type: "danger" },
    ];
    const idx = Math.floor(Math.random() * events.length);
    return events[idx];
  },
});

// ===== WEEKEND BOOST CHECK (for criminal actions) =====
export const isWeekendBoostActive = query({
  args: {},
  handler: async () => {
    const day = new Date().getDay();
    return day === 5 || day === 6;
  },
});

// ===== KILL FREE ZONE CHECK =====
export const isKillFreeZoneActive = query({
  args: {},
  handler: async () => {
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    return (day >= 1 && day <= 3) && (hour >= 20 && hour < 22);
  },
});

// ===== GOLDEN HOUR CHECK =====
export const isGoldenHourActive = query({
  args: {},
  handler: async () => {
    const hour = new Date().getHours();
    return hour === 12;
  },
});

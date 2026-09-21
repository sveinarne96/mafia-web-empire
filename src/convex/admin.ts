import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { processAutoRank } from "./storeSystem";

// Helper: get authenticated player
async function getAuthPlayer(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

// Helper: check if player is admin
function isAdmin(player: any) {
  return player.role === "admin";
}

// ===== ONLINE TRACKING =====

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getAuthPlayer(ctx);
    const patch: any = { lastActive: Date.now() };
    // Self-heal: if actionTimestamps is ever a legacy non-array (old bugs
    // wrote a bare number), rewrite it to a clean array so every action that
    // reads it stops throwing a generic Server Error. The next successful
    // action then keeps it healthy permanently.
    if (!Array.isArray((player as any).actionTimestamps)) {
      patch.actionTimestamps = [];
    }
    await ctx.db.patch(player._id, patch);
    // Accrue any pending Auto Rank ranks every heartbeat (runs ~30s) so the
    // perk keeps ranking the player on any page, not just crime/HQ screens.
    try { await processAutoRank(ctx); } catch {}
  },
});

export const getOnlinePlayers = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twoMinutesAgo = now - 120000;
    const all = await ctx.db.query("users").collect();
    return all
      .filter((u: any) => (u.lastActive ?? 0) > twoMinutesAgo && u.nickname && !u.isBanned)
      .map((u: any) => ({
        _id: u._id,
        nickname: u.nickname ?? "Unknown",
        level: u.level ?? 1,
        location: u.location ?? "Unknown",
        role: u.role ?? "user",
        wantedLevel: u.wantedLevel ?? 0,
        lastActive: u.lastActive ?? 0,
        attack: u.attack ?? 0,
        defense: u.defense ?? 0,
        familyId: u.familyId,
        playerClass: u.playerClass,
      }))
      .sort((a: any, b: any) => b.lastActive - a.lastActive);
  },
});

export const getOnlineCount = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twoMinutesAgo = now - 120000;
    const all = await ctx.db.query("users").collect();
    return all.filter((u: any) => (u.lastActive ?? 0) > twoMinutesAgo && u.nickname && !u.isBanned).length;
  },
});

// ===== ADMIN ROLE =====

export const grantAdmin = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    // First admin is auto-granted (if no admins exist yet)
    const all = await ctx.db.query("users").collect();
    const adminCount = all.filter((u: any) => u.role === "admin").length;
    if (adminCount > 0 && !isAdmin(player)) {
      throw new Error("Only admins can grant admin!");
    }
    await ctx.db.patch(args.targetId, { role: "admin" } as any);
    return { granted: true };
  },
});

export const becomeAdmin = mutation({
  args: { secretKey: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in to become an admin.");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player profile not found. Please register first.");
    if ((player as any).role === "admin") return { success: true, message: "You are already an admin!" };
    
    const all = await ctx.db.query("users").collect();
    const adminCount = all.filter((u: any) => u.role === "admin").length;
    
    // Allow first admin with either key, or anyone with the master key
    if (args.secretKey === "shadowempire_admin_2024" || (adminCount === 0 && args.secretKey === "firstadmin")) {
      await ctx.db.patch(userId, { role: "admin" } as any);
      return { success: true, message: "You are now an admin!" };
    }
    throw new Error("Invalid admin key!");
  },
});

// ===== ADMIN QUERIES =====

export const isAdminCheck = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const player = await ctx.db.get(userId);
    return player?.role === "admin";
  },
});

export const getAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const player = await ctx.db.get(userId);
    if (!player || !isAdmin(player)) return [];
    const all = await ctx.db.query("users").collect();
    return all
      .filter((u: any) => u.nickname)
      .map((u: any) => ({
        _id: u._id,
        nickname: u.nickname ?? "Unknown",
        level: u.level ?? 1,
        money: u.money ?? 0,
        bank: u.bank ?? 0,
        life: u.life ?? 0,
        maxLife: u.maxLife ?? 100,
        attack: u.attack ?? 0,
        defense: u.defense ?? 0,
        experience: u.experience ?? 0,
        location: u.location ?? "Unknown",
        role: u.role ?? "user",
        wantedLevel: u.wantedLevel ?? 0,
        reputation: u.reputation ?? 0,
        totalCrimes: u.totalCrimes ?? 0,
        totalFights: u.totalFights ?? 0,
        totalKills: u.totalKills ?? 0,
        totalDeaths: u.totalDeaths ?? 0,
        inPrison: u.inPrison ?? false,
        isDead: u.isDead ?? false,
        isBanned: u.isBanned ?? false,
        banReason: u.banReason,
        lastActive: u.lastActive ?? 0,
        familyId: u.familyId,
        playerClass: u.playerClass,
        registeredAt: u.registeredAt ?? 0,
      }))
      .sort((a: any, b: any) => b.level - a.level || b.experience - a.experience);
  },
});

// ===== ADMIN MUTATIONS =====

export const giveMoney = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (args.amount < -1000000 || args.amount > 10000000) throw new Error("Amount must be between -$1M and $10M!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found!");
    await ctx.db.patch(args.targetId, { money: (target.money ?? 0) + args.amount } as any);
    try {
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "admin",
        message: `Admin ${player.nickname} ${args.amount >= 0 ? "gave you" : "took"} $${Math.abs(args.amount).toLocaleString()}`,
        read: false,
        timestamp: Date.now(),
      });
    } catch { /* notification insert is optional */ }
    return { success: true, amount: args.amount };
  },
});

export const setLevel = mutation({
  args: { targetId: v.id("users"), level: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (args.level < 1 || args.level > 500) throw new Error("Level must be 1-500!");
    await ctx.db.patch(args.targetId, { level: args.level, experience: 0 } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} set your level to ${args.level}`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true, level: args.level };
  },
});

export const setStats = mutation({
  args: { targetId: v.id("users"), attack: v.number(), defense: v.number(), maxLife: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (args.attack > 9999 || args.defense > 9999 || args.maxLife > 99999) throw new Error("Stats too high!");
    await ctx.db.patch(args.targetId, {
      attack: args.attack, defense: args.defense, maxLife: args.maxLife, life: args.maxLife,
    } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} modified your stats`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const teleportPlayer = mutation({
  args: { targetId: v.id("users"), location: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    const validLocations = ["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"];
    if (!validLocations.includes(args.location)) throw new Error("Invalid location!");
    await ctx.db.patch(args.targetId, { location: args.location } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} teleported you to ${args.location}`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true, location: args.location };
  },
});

export const healPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found!");
    await ctx.db.patch(args.targetId, { life: target.maxLife ?? 100, isDead: false } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} fully healed you`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const revivePlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    await ctx.db.patch(args.targetId, {
      isDead: false, life: 100, maxLife: 100, money: 1000, bank: 0,
      level: 1, experience: 0, attack: 10, defense: 10,
      location: "New York", inPrison: false, wantedLevel: 0,
    } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} revived you`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const freeFromPrison = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    await ctx.db.patch(args.targetId, { inPrison: false, prisonTime: 0, solitaryTime: 0 } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} released you from prison`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const banPlayer = mutation({
  args: { targetId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (player._id === args.targetId) throw new Error("Can't ban yourself!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found!");
    if (target.role === "admin") throw new Error("Can't ban another admin!");
    await ctx.db.patch(args.targetId, { isBanned: true, banReason: args.reason } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `You have been banned by Admin ${player.nickname}. Reason: ${args.reason}`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true, banned: target.nickname };
  },
});

export const unbanPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    await ctx.db.patch(args.targetId, { isBanned: false, banReason: undefined } as any);
    return { success: true };
  },
});

export const killPlayerAdmin = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    await ctx.db.patch(args.targetId, { isDead: true, life: 0 } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} eliminated you`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const resetPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found!");
    if (target.role === "admin") throw new Error("Can't reset another admin!");
    await ctx.db.patch(args.targetId, {
      nickname: target.nickname, // keep nickname
      money: 1000, bank: 0, points: 0,
      life: 100, maxLife: 100, attack: 10, defense: 10,
      level: 1, experience: 0, location: "New York",
      inPrison: false, prisonTime: 0, isDead: false,
      totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
      wantedLevel: 0, reputation: 0, reputationAlignment: "neutral",
      skillPoints: 0, prestige: 0, prestigeMultiplier: 1,
      levelUpPending: false, totalPrisonEscapes: 0, totalPrisonJobs: 0,
      dirtyMoney: 0, counterfeitSkill: 0, smugglingRuns: 0, drugDeals: 0,
      racketeeringIncome: 0, loanSharkDebts: 0, witnessIntimidations: 0,
      identityThefts: 0, kidnappings: 0, arsons: 0, cargoThefts: 0,
      armsDeals: 0, illegalBoxingEvents: 0, pirateRadioBoost: 0,
      prostitutionRings: 0, gamblingDens: 0, protectionRackets: 0,
      totalLaundered: 0, armorDurability: 0, weaponProficiency: 0,
      killsThisSeason: 0, deathsThisSeason: 0, totalEarned: 1000,
      betrayalCount: 0, totalGifting: 0, totalMentoring: 0,
    } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} has reset your account`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true, reset: target.nickname };
  },
});

export const giveSkillPoints = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (args.amount > 100) throw new Error("Max 100 skill points at once!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found!");
    await ctx.db.patch(args.targetId, { skillPoints: ((target as any).skillPoints ?? 0) + args.amount } as any);
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `Admin ${player.nickname} gave you ${args.amount} skill points`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const sendAdminMessage = mutation({
  args: { targetId: v.id("users"), message: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (args.message.length > 500) throw new Error("Message too long!");
    try { await ctx.db.insert("notifications", { userId: args.targetId, type: "admin", message: `📢 [ADMIN] ${args.message}`, read: false, timestamp: Date.now() }); } catch {}
    return { success: true };
  },
});

export const broadcastMessage = mutation({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const player = await getAuthPlayer(ctx);
    if (!isAdmin(player)) throw new Error("Admin only!");
    if (args.message.length > 500) throw new Error("Message too long!");
    const all = await ctx.db.query("users").collect();
    for (const u of all) {
      if (u.nickname) {
        await ctx.db.insert("notifications", {
          userId: u._id,
          type: "admin",
          message: `📢 [BROADCAST] ${args.message}`,
          read: false,
          timestamp: Date.now(),
        });
      }
    }
    return { success: true, sentTo: all.length };
  },
});

export const getGameStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    const registered = all.filter((u: any) => u.nickname && !u.isSystemChar);
    const now = Date.now();
    const online = registered.filter((u: any) => (u.lastActive ?? 0) > now - 120000);
    return {
      totalPlayers: registered.length,
      onlinePlayers: online.length,
      admins: registered.filter((u: any) => u.role === "admin").length,
      bannedPlayers: registered.filter((u: any) => u.isBanned).length,
      deadPlayers: registered.filter((u: any) => u.isDead).length,
      inPrison: registered.filter((u: any) => u.inPrison).length,
      totalCrimes: registered.reduce((s: number, u: any) => s + (u.totalCrimes ?? 0), 0),
      totalFights: registered.reduce((s: number, u: any) => s + (u.totalFights ?? 0), 0),
      totalKills: registered.reduce((s: number, u: any) => s + (u.totalKills ?? 0), 0),
      totalWealth: registered.reduce((s: number, u: any) => s + (u.money ?? 0) + (u.bank ?? 0), 0),
      avgLevel: registered.length > 0 ? Math.round(registered.reduce((s: number, u: any) => s + (u.level ?? 1), 0) / registered.length) : 0,
      highestLevel: registered.length > 0 ? Math.max(...registered.map((u: any) => u.level ?? 1)) : 0,
      byClass: {
        hitter: registered.filter((u: any) => u.playerClass === "hitter").length,
        thief: registered.filter((u: any) => u.playerClass === "thief").length,
        enforcer: registered.filter((u: any) => u.playerClass === "enforcer").length,
        hustler: registered.filter((u: any) => u.playerClass === "hustler").length,
      },
    };
  },
});

// ===== PERKS & TALENTS ADMIN =====

/** Full perk + talent overview for one player (admin view). */
export const getPlayerPerks = query({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getAuthPlayer(ctx);
    if (!isAdmin(admin)) throw new Error("Admin only!");
    const t: any = await ctx.db.get(args.targetId);
    if (!t) throw new Error("Player not found");
    const now = Date.now();
    const activeFields: Record<string, string> = {
      heistTimer: "heistTimerUntil",
      heistChance: "heistChanceUntil",
      doublePay: "cashBoostUntil",
      doubleXp: "xpBoostUntil",
      bustBoost: "bustBoostUntil",
      autoRank: "autoRankUntil",
      meltValue: "meltValueUntil",
      meltLimit: "meltLimitUntil",
      gtaRarity: "gtaRarityUntil",
    };
    const status: Record<string, { stock: number; active: boolean; until: number }> = {};
    for (const [perkId, field] of Object.entries(activeFields)) {
      const until = (t as any)[field] ?? 0;
      status[perkId] = { stock: (t.perks ?? {})[perkId] ?? 0, active: until > now, until };
    }
    for (const p of ["jailImmunity", "supplyUnit"]) {
      status[p] = { stock: (t.perks ?? {})[p] ?? 0, active: false, until: 0 };
    }
    return {
      nickname: t.nickname ?? t.username ?? "Unknown",
      perks: (t.perks ?? {}) as Record<string, number>,
      status,
      jailImmunityCount: t.jailImmunityCount ?? 0,
      autoRankUntil: t.autoRankUntil ?? 0,
      coins: t.coins ?? 0,
      talentPoints: t.talentPoints ?? 0,
      globalTalentPoints: t.globalTalentPoints ?? 0,
      cityTalents: (t.cityTalents ?? {}) as Record<string, number>,
      globalTalents: (t.globalTalents ?? {}) as Record<string, number>,
    };
  },
});

/** Grant (or remove with negative) perk stock for a player. */
export const grantPerkStock = mutation({
  args: { targetId: v.id("users"), perkId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const admin = await getAuthPlayer(ctx);
    if (!isAdmin(admin)) throw new Error("Admin only!");
    if (!Number.isFinite(args.amount) || args.amount === 0) throw new Error("Amount must be non-zero");
    if (Math.abs(args.amount) > 1000) throw new Error("Max 1000 per grant");
    const t: any = await ctx.db.get(args.targetId);
    if (!t) throw new Error("Player not found");
    const perks = { ...((t.perks ?? {}) as Record<string, number>) };
    const next = Math.max(0, (perks[args.perkId] ?? 0) + args.amount);
    perks[args.perkId] = next;
    await ctx.db.patch(args.targetId, { perks } as any);
    try {
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "admin",
        message: `Admin ${admin.nickname} ${args.amount > 0 ? "granted you" : "removed"} ${Math.abs(args.amount)}x perk (${args.perkId})`,
        read: false,
        timestamp: Date.now(),
      });
    } catch {}
    return { success: true, perkId: args.perkId, stock: next };
  },
});

/** Grant all perks in stock (handy "give full perk bar" button). */
export const grantAllPerks = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const admin = await getAuthPlayer(ctx);
    if (!isAdmin(admin)) throw new Error("Admin only!");
    if (args.amount < 1 || args.amount > 100) throw new Error("Amount must be 1-100");
    const t: any = await ctx.db.get(args.targetId);
    if (!t) throw new Error("Player not found");
    const perks = { ...((t.perks ?? {}) as Record<string, number>) };
    for (const id of ["heistTimer", "heistChance", "doublePay", "doubleXp", "jailImmunity", "bustBoost", "autoRank", "meltValue", "meltLimit", "gtaRarity", "supplyUnit"]) {
      perks[id] = Math.max(0, (perks[id] ?? 0) + args.amount);
    }
    await ctx.db.patch(args.targetId, { perks } as any);
    try {
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "admin",
        message: `Admin ${admin.nickname} granted you ${args.amount}x of every perk!`,
        read: false,
        timestamp: Date.now(),
      });
    } catch {}
    return { success: true };
  },
});

/** Set a perk's active timer directly (activate / extend / clear with 0). */
export const setPerkTimer = mutation({
  args: { targetId: v.id("users"), perkId: v.string(), hours: v.number() },
  handler: async (ctx, args) => {
    const admin = await getAuthPlayer(ctx);
    if (!isAdmin(admin)) throw new Error("Admin only!");
    if (args.hours < 0 || args.hours > 720) throw new Error("Hours must be 0-720");
    const t: any = await ctx.db.get(args.targetId);
    if (!t) throw new Error("Player not found");
    const now = Date.now();
    const fieldMap: Record<string, string> = {
      heistTimer: "heistTimerUntil",
      heistChance: "heistChanceUntil",
      doublePay: "cashBoostUntil",
      doubleXp: "xpBoostUntil",
      bustBoost: "bustBoostUntil",
      autoRank: "autoRankUntil",
      meltValue: "meltValueUntil",
      meltLimit: "meltLimitUntil",
      gtaRarity: "gtaRarityUntil",
    };
    const field = fieldMap[args.perkId];
    if (!field) throw new Error("Perk has no timer (instant perks activate on use)");
    const base = Math.max(now, (t as any)[field] ?? 0);
    const patch: any = {};
    patch[field] = args.hours === 0 ? 0 : base + args.hours * 3600000;
    await ctx.db.patch(args.targetId, patch);
    try {
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "admin",
        message: args.hours === 0
          ? `Admin ${admin.nickname} deactivated your ${args.perkId} boost`
          : `Admin ${admin.nickname} activated/extended ${args.perkId} for ${args.hours}h`,
        read: false,
        timestamp: Date.now(),
      });
    } catch {}
    return { success: true };
  },
});

/** Grant or remove talent points (city + global). */
export const setTalentPoints = mutation({
  args: { targetId: v.id("users"), cityPoints: v.number(), globalPoints: v.number() },
  handler: async (ctx, args) => {
    const admin = await getAuthPlayer(ctx);
    if (!isAdmin(admin)) throw new Error("Admin only!");
    const t: any = await ctx.db.get(args.targetId);
    if (!t) throw new Error("Player not found");
    const patch: any = {};
    if (args.cityPoints !== 0) {
      patch.talentPoints = Math.max(0, (t.talentPoints ?? 0) + args.cityPoints);
    }
    if (args.globalPoints !== 0) {
      patch.globalTalentPoints = Math.max(0, (t.globalTalentPoints ?? 0) + args.globalPoints);
    }
    if (Object.keys(patch).length === 0) return { success: true };
    await ctx.db.patch(args.targetId, patch);
    try {
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "admin",
        message: `Admin ${admin.nickname} adjusted your talent points`,
        read: false,
        timestamp: Date.now(),
      });
    } catch {}
    return { success: true };
  },
});

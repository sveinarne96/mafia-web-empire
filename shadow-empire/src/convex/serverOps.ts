import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ════════════════════════════════════════════════════════════════════
   SERVER OPS — the admin control room.
   Sections: LIVE EVENT · SEASONAL SYSTEM · COMMUNITY · GAME BALANCE ·
             SERVER FUNCTIONS · ONLINE TEST · SERVER REGISTRY
   Everything writes to `gameConfig` (key: "main") or dedicated tables
   and applies to live gameplay instantly via reactive subscriptions.
   ════════════════════════════════════════════════════════════════════ */

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const admin = await ctx.db.get(userId);
  if (!admin || admin.role !== "admin") throw new Error("Admin only!");
  return admin;
}

async function getConfigDoc(ctx: any): Promise<any | null> {
  return ctx.db
    .query("gameConfig")
    .filter((q: any) => q.eq(q.field("key"), "main"))
    .first();
}

async function patchConfig(ctx: any, patch: Record<string, unknown>) {
  const existing = await getConfigDoc(ctx);
  const base: Record<string, unknown> = { key: "main", xpMultiplier: 1, xpMultiplierUntil: 0, cashMultiplier: 1, cashMultiplierUntil: 0, crimeSuccessBonus: 0, energyRegenPerMinute: 5, maintenanceMode: false, maintenanceMessage: "", ghostMode: false, lottoJackpot: 0, superBoostEnabled: true, updatedAt: Date.now() };
  const values = { ...base, ...(existing ?? {}), ...patch, updatedAt: Date.now() };
  if (existing) await ctx.db.patch(existing._id, values);
  else await ctx.db.insert("gameConfig", values as any);
  return values;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const finite = (n: unknown, d: number) => (typeof n === "number" && Number.isFinite(n) ? n : d);

/* ══════════════════ READ: one query feeds the whole panel ══════════════════ */

export const getServerOps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") return null;

    const doc = await getConfigDoc(ctx);
    const now = Date.now();

    // Season state: latest started season, or alpha placeholder.
    const seasons = await ctx.db
      .query("seasonState")
      .withIndex("by_number", (q: any) => q.gte("seasonNumber", 0))
      .order("desc")
      .take(1);
    const current = seasons[0] ?? null;

    // System test characters.
    const sysChars = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("isSystemChar"), true))
      .collect();

    // Registration stats.
    const all = await ctx.db.query("users").collect();
    const registered = all.filter((u: any) => u.nickname);
    const onlineNow = registered.filter((u: any) => (u.lastActive ?? 0) > now - 120000 && !u.isSystemChar);
    const sysOnline = registered.filter((u: any) => (u.lastActive ?? 0) > now - 120000 && u.isSystemChar);

    // Companies registered ownership.
    let companies = 0;
    try { companies = (await ctx.db.query("businesses").collect()).length; } catch { companies = 0; }

    const eventActive = finite(doc?.rankEventMultiplier, 0) >= 2 && now < finite(doc?.rankEventEndsAt, 0);

    return {
      // LIVE EVENT
      event: {
        active: eventActive,
        multiplier: eventActive ? finite(doc?.rankEventMultiplier, 2) : 0,
        endsAt: finite(doc?.rankEventEndsAt, 0),
        label: doc?.rankEventLabel ?? "2x to 10x Ranking",
      },
      // SEASONAL SYSTEM
      season: {
        number: current?.seasonNumber ?? 0,
        name: current?.name ?? "Public Alpha",
        startedAt: current?.startedAt ?? 0,
        plannedEndsAt: current?.plannedEndsAt ?? 0,
        days: current?.days ?? 100,
        started: !!current,
      },
      // SERVER FUNCTIONS
      functions: {
        murderEnabled: doc?.murderSystemEnabled ?? true,
        registrationOpen: doc?.registrationOpen ?? true,
        maintenanceMode: doc?.maintenanceMode ?? false,
        maintenanceMessage: doc?.maintenanceMessage ?? "",
      },
      // GAME BALANCE (read view)
      balance: {
        globalCrimeCooldown: clamp(finite(doc?.globalCrimeCooldown, 60), 10, 3600),
        crimeJailTimes: (doc?.crimeJailTimes ?? {}) as Record<string, number>,
      },
      // ONLINE TEST + REGISTRY
      presence: {
        onlineNow: onlineNow.length,
        sysOnline: sysOnline.length,
        sysTotal: sysChars.length,
        total: registered.length,
        sysChars: sysChars.map((s: any) => ({
          _id: s._id as string,
          nickname: s.nickname ?? "",
          level: s.level ?? 1,
          online: (s.lastActive ?? 0) > now - 120000,
          createdAt: s.registeredAt ?? s._creationTime,
        })),
        companies,
        admins: registered.filter((u: any) => u.role === "admin").length,
        banned: registered.filter((u: any) => u.isBanned).length,
      },
      now,
    };
  },
});

/* ══════════════════ 1. LIVE EVENT — 2x to 10x Ranking ══════════════════ */

export const setRankEvent = mutation({
  args: {
    multiplier: v.number(),
    endsAt: v.number(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const mult = clamp(finite(args.multiplier, 2), 2, 10);
    const endsAt = finite(args.endsAt, 0);
    if (!endsAt || endsAt <= Date.now()) throw new Error("End date must be in the future");
    if (endsAt > Date.now() + 1000 * 60 * 60 * 24 * 365) throw new Error("Event cannot run longer than 1 year");
    await patchConfig(ctx, {
      rankEventMultiplier: mult,
      rankEventEndsAt: endsAt,
      rankEventLabel: (args.label ?? "2x to 10x Ranking").slice(0, 120),
    });
    return { success: true, multiplier: mult, endsAt };
  },
});

export const deactivateRankEvent = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await patchConfig(ctx, { rankEventMultiplier: 0, rankEventEndsAt: 0 });
    return { success: true };
  },
});

/** Server-side helper: the live rank-XP multiplier for any player right now. */
export async function getRankEventMultiplier(ctx: any): Promise<number> {
  try {
    const doc = await getConfigDoc(ctx);
    if (!doc) return 1;
    const mult = finite(doc.rankEventMultiplier, 0);
    if (mult >= 2 && Date.now() < finite(doc.rankEventEndsAt, 0)) return clamp(mult, 1, 10);
    return 1;
  } catch {
    return 1;
  }
}

/* ══════════════════ 2. SEASONAL SYSTEM ══════════════════ */

const SEASON_RESET_TABLES = [
  "vehicles", "inventory", "playerItems", "playerAchievements", "playerMissions",
  "completedMissions", "playerStocks", "bounties", "duels", "contracts", "gifts",
  "hitLists", "rivalries", "bodyguards", "ambushes", "loans", "referrals",
  "smugglingRuns", "dailyRaids", "sales", "combatLogs", "familyWars",
  "familyAlliances", "pokerGames", "dogFights", "streetRaces", "familyElections",
  "actionHistory", "crimes", "notifications", "auctions", "properties",
] as const;

export const startNewSeason = mutation({
  args: {
    days: v.number(),
    confirmName: v.string(), // must equal "SEASON <n>"
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const seasons = await ctx.db
      .query("seasonState")
      .withIndex("by_number", (q: any) => q.gte("seasonNumber", 0))
      .order("desc")
      .take(1);
    const prev = seasons[0] ?? null;
    const nextNumber = (prev?.seasonNumber ?? 1) + 1;
    const expected = `SEASON ${nextNumber}`;
    if (args.confirmName.trim().toUpperCase() !== expected) {
      throw new Error(`Type "${expected}" to confirm the reset.`);
    }
    const days = clamp(Math.round(finite(args.days, 100)), 1, 730);
    const now = Date.now();
    const plannedEndsAt = now + days * 24 * 3600 * 1000;

    // ── RESTORATION: wipe per-season progression from every player. ──
    // KEPT BETWEEN SEASONS: performance points, prestige, premium points
    // (vipTokens/coins), profile & account (nickname, class, role).
    const players = await ctx.db.query("users").collect();
    for (const p of players) {
      await ctx.db.patch(p._id, {
        money: 500, bank: 0, life: 100, maxLife: 100,
        level: 1, experience: 0, highestLevel: 1,
        attack: 10, defense: 10,
        totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
        wantedLevel: 0, inPrison: false, prisonTime: 0, isDead: false,
        skillPoints: 0, reputation: 0,
        seasonXp: 0, seasonTiersClaimed: [],
        killsThisSeason: 0, deathsThisSeason: 0,
        lastCrimeAt: 0, crimeMomentum: 0, crimeCooldowns: {}, crimeCompleted: {},
        lastActive: p.role === "admin" ? (p.lastActive ?? now) : 0,
      });
    }

    // Clear per-season tables (best-effort; unknown tables are skipped).
    for (const t of SEASON_RESET_TABLES) {
      try {
        const rows = await ctx.db.query(t as any).collect();
        for (const r of rows) await ctx.db.delete(r._id);
      } catch { /* table may not exist in this build */ }
    }

    await ctx.db.insert("seasonState", {
      seasonNumber: nextNumber,
      name: `Season ${String(nextNumber).padStart(2, "0")}`,
      startedAt: now,
      plannedEndsAt,
      days,
      createdAt: now,
      startedBy: admin.nickname ?? admin.username ?? "Admin",
    });

    // Announce the new season to everyone.
    await ctx.db.insert("announcements", {
      text: `🌅 ${expected} has begun! The city resets — a new era starts now. Runs for ${days} days.`,
      emoji: "🌅",
      color: "amber",
      createdBy: admin._id,
      createdByName: admin.nickname ?? "Admin",
      expiresAt: now + 7 * 24 * 3600 * 1000,
      active: true,
      createdAt: now,
    });

    return { success: true, seasonNumber: nextNumber, plannedEndsAt, days };
  },
});

export const setSeasonPlannedEnd = mutation({
  args: { plannedEndsAt: v.number() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    const seasons = await ctx.db
      .query("seasonState")
      .withIndex("by_number", (q: any) => q.gte("seasonNumber", 0))
      .order("desc")
      .take(1);
    let current = seasons[0];
    // No season row yet (Public Alpha state): auto-create Season 01 so admins
    // can still set its planned end instead of hitting a dead end.
    if (!current) {
      await ctx.db.insert("seasonState", {
        seasonNumber: 1,
        name: "Season 01",
        startedAt: now,
        plannedEndsAt: now + 100 * 86400000,
        days: 100,
        createdAt: now,
        startedBy: admin.nickname ?? admin.username ?? "Admin",
      });
      current = (await ctx.db
        .query("seasonState")
        .withIndex("by_number", (q: any) => q.gte("seasonNumber", 0))
        .order("desc")
        .take(1))[0];
    }
    const end = finite(args.plannedEndsAt, 0);
    if (!end || end <= now) throw new Error("Planned end must be in the future");
    await ctx.db.patch(current._id, { plannedEndsAt: end, days: Math.max(1, Math.round((end - current.startedAt) / 86400000)) });
    return { success: true };
  },
});

/* ══════════════════ 3. COMMUNITY — announcements ══════════════════ */

export const listAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") return [];
    const rows = await ctx.db.query("announcements").order("desc").take(25);
    const now = Date.now();
    return rows.map((a: any) => ({
      _id: a._id as string,
      text: a.text,
      emoji: a.emoji ?? "📣",
      color: a.color ?? "amber",
      active: !!a.active && a.expiresAt > now,
      expiresAt: a.expiresAt,
      createdByName: a.createdByName ?? "",
      createdAt: a.createdAt,
    }));
  },
});

export const postAnnouncementRich = mutation({
  args: {
    title: v.optional(v.string()),
    text: v.string(),
    type: v.optional(v.string()), // event | operational | update
    pinned: v.optional(v.boolean()),
    durationHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const text = (args.title ? `${args.title}\n\n${args.text}` : args.text).trim();
    if (!text) throw new Error("Message is required");
    if (text.length > 300) throw new Error("Message too long for the live banner (max 300 chars) — shorten it.");
    const hours = clamp(finite(args.durationHours, 48), 1, 24 * 30);
    const id = await ctx.db.insert("announcements", {
      text,
      emoji: args.type === "event" ? "🎪" : args.type === "operational" ? "🛠️" : "📣",
      color: args.type === "event" ? "purple" : args.type === "operational" ? "cyan" : "amber",
      createdBy: admin._id,
      createdByName: admin.nickname ?? admin.username ?? "Admin",
      expiresAt: Date.now() + hours * 3600000,
      active: true,
      createdAt: Date.now(),
    });
    return { success: true, id };
  },
});

export const deactivateAnnouncement = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(args.announcementId);
    if (!doc) throw new Error("Announcement not found");
    await ctx.db.patch(args.announcementId, { active: false });
    return { success: true };
  },
});

/* ══════════════════ 4. GAME BALANCE ══════════════════ */

/** The REAL crime categories in the game — the admin GAME BALANCE panel
 *  controls global cooldown + per-category imprisonment for exactly these.
 *  Keys match: crimeCategory ids, crimeCooldowns prefixes and the crime engine. */
export const GAME_CRIME_CATEGORIES = [
  "street", "robbery", "fraud", "burglary", "drugs",
  "organized", "underground", "gta_theft", "steal_house", "murder",
] as const;

export const setGameBalance = mutation({
  args: {
    globalCrimeCooldown: v.optional(v.number()),
    crimeJailTimes: v.optional(v.record(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    if (args.globalCrimeCooldown !== undefined) {
      const cd = clamp(Math.round(finite(args.globalCrimeCooldown, 60)), 10, 3600);
      patch.globalCrimeCooldown = cd;
    }
    if (args.crimeJailTimes !== undefined) {
      const clean: Record<string, number> = {};
      for (const [k, v] of Object.entries(args.crimeJailTimes)) {
        const n = clamp(Math.round(finite(v, 60)), 0, 3600);
        clean[k.slice(0, 40)] = n;
      }
      patch.crimeJailTimes = clean;
    }
    await patchConfig(ctx, patch);
    return { success: true };
  },
});

export const resetGameBalance = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await patchConfig(ctx, { globalCrimeCooldown: 60, crimeJailTimes: {} });
    return { success: true };
  },
});

/** Server-side helpers used by the crime engine. */
export async function getGlobalCrimeCooldown(ctx: any): Promise<number> {
  try {
    const doc = await getConfigDoc(ctx);
    return clamp(finite(doc?.globalCrimeCooldown, 60), 10, 3600);
  } catch { return 60; }
}
export async function getCrimeJailTimes(ctx: any): Promise<Record<string, number>> {
  try {
    const doc = await getConfigDoc(ctx);
    return (doc?.crimeJailTimes ?? {}) as Record<string, number>;
  } catch { return {}; }
}

/** Public (any signed-in player): live game-balance timers for the top bar /
 *  crime pages. Only exposes the two timer values — nothing sensitive. */
export const getGameBalancePublic = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { globalCrimeCooldown: 60, crimeJailTimes: {} as Record<string, number> };
    const doc = await getConfigDoc(ctx);
    return {
      globalCrimeCooldown: clamp(finite(doc?.globalCrimeCooldown, 60), 10, 3600),
      crimeJailTimes: (doc?.crimeJailTimes ?? {}) as Record<string, number>,
    };
  },
});

/** Public (any signed-in player): the server-managed LIVE EVENT banner data.
 *  Returns active:false when no event runs so the UI can hide the banner. */
export const getLiveEventPublic = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { active: false, multiplier: 0, endsAt: 0, label: "" };
    const doc = await getConfigDoc(ctx);
    const mult = finite(doc?.rankEventMultiplier, 0);
    const endsAt = finite(doc?.rankEventEndsAt, 0);
    const active = mult >= 2 && Date.now() < endsAt;
    return {
      active,
      multiplier: active ? clamp(mult, 2, 10) : 0,
      endsAt: active ? endsAt : 0,
      label: active ? (doc?.rankEventLabel ?? "Ranking Event") : "",
    };
  },
});

/** Public (any signed-in player): current season + live countdown to its end.
 *  Drives the always-on season banner at the top of the game. */
export const getSeasonPublic = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const seasons = await ctx.db
      .query("seasonState")
      .withIndex("by_number", (q: any) => q.gte("seasonNumber", 0))
      .order("desc")
      .take(1);
    const s = seasons[0];
    if (!s) {
      return { number: 1, name: "Public Alpha", startedAt: 0, plannedEndsAt: 0, days: 0, hasEnd: false };
    }
    return {
      number: s.seasonNumber ?? 1,
      name: s.name ?? `Season ${s.seasonNumber ?? 1}`,
      startedAt: s.startedAt ?? 0,
      plannedEndsAt: s.plannedEndsAt ?? 0,
      days: s.days ?? 0,
      hasEnd: (s.plannedEndsAt ?? 0) > Date.now(),
    };
  },
});

/** Server-side helper: prison sentence (ms) for a crime id or category.
 *  Reads the admin GAME BALANCE panel — falls back to fallbackMs when unset. */
export async function getJailMs(ctx: any, crimeIdOrCategory: string, fallbackMs: number): Promise<number> {
  try {
    const times = await getCrimeJailTimes(ctx);
    const id = String(crimeIdOrCategory || "");
    const cat = GAME_CRIME_CATEGORIES.find((c) => id === c || id.startsWith(c + "_"));
    const t = (cat ? times[cat] : undefined) ?? times[id];
    if (typeof t === "number" && Number.isFinite(t) && t > 0) return Math.max(1000, t * 1000);
    return fallbackMs;
  } catch { return fallbackMs; }
}

/* ══════════════════ 5. SERVER FUNCTIONS ══════════════════ */

export const setMurderSystem = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await patchConfig(ctx, { murderSystemEnabled: args.enabled });
    return { success: true, enabled: args.enabled };
  },
});

export const setRegistrationOpen = mutation({
  args: { open: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await patchConfig(ctx, { registrationOpen: args.open });
    return { success: true, open: args.open };
  },
});

export const setMaintenanceMode = mutation({
  args: { enabled: v.boolean(), message: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await patchConfig(ctx, {
      maintenanceMode: args.enabled,
      maintenanceMessage: (args.message ?? "🔧 Server maintenance in progress — back soon!").slice(0, 200),
    });
    return { success: true, enabled: args.enabled };
  },
});

/** Public: is registration currently open? (used by registerPlayer) */
export async function isRegistrationOpen(ctx: any): Promise<boolean> {
  try {
    const doc = await getConfigDoc(ctx);
    return doc?.registrationOpen ?? true;
  } catch { return true; }
}

/** Public: is the murder system enabled? (used by commitMurder) */
export async function isMurderEnabled(ctx: any): Promise<boolean> {
  try {
    const doc = await getConfigDoc(ctx);
    return doc?.murderSystemEnabled ?? true;
  } catch { return true; }
}

/* ══════════════════ 6. ONLINE TEST — system characters ══════════════════ */

const SYS_NAMES = ["Test Pilot", "Ghost Tester", "QA Runner", "Debug Dave", "Spec Sentry"];
const SYS_LIMIT = 50;

export const spawnSystemCharacter = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("isSystemChar"), true))
      .collect();
    if (existing.length >= SYS_LIMIT) throw new Error(`System character limit reached (${SYS_LIMIT}).`);
    const used = new Set(existing.map((e: any) => e.nickname));
    const name = SYS_NAMES.find((n) => !used.has(n)) ?? `System Char ${existing.length + 1}`;
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      nickname: name,
      playerClass: "hustler",
      role: "user",
      isSystemChar: true,
      systemVisible: true,
      money: 10000, bank: 0, points: 0,
      life: 100, maxLife: 100, attack: 10, defense: 10,
      level: 1, experience: 0,
      location: "New York",
      inPrison: false, prisonTime: 0, isDead: false,
      totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
      dailyRaidUsed: 0, lastDailyRaid: now, lastRegenAt: now,
      wantedLevel: 0, reputation: 0, reputationAlignment: "neutral",
      prestige: 0, prestigeMultiplier: 1, levelUpPending: false, skillPoints: 0,
      registeredAt: now, lastActive: now, lastCrimeAt: 0, isBanned: false,
      coins: 0, bullets: 0, totalPlaytime: 0, highestLevel: 1, totalEarned: 10000,
    } as any);
    return { success: true, id, name };
  },
});

export const removeSystemCharacter = mutation({
  args: { charId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(args.charId);
    if (!doc || !doc.isSystemChar) throw new Error("Not a system character");
    await ctx.db.delete(args.charId);
    return { success: true };
  },
});

/** Heartbeat: keeps a system char visible as "online". */
export const pingSystemCharacters = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { pinged: 0 };
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") return { pinged: 0 };
    const chars = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("isSystemChar"), true))
      .collect();
    const now = Date.now();
    for (const c of chars) {
      if (c.systemVisible) await ctx.db.patch(c._id, { lastActive: now });
    }
    return { pinged: chars.length };
  },
});

export const setSystemCharVisible = mutation({
  args: { charId: v.id("users"), visible: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(args.charId);
    if (!doc || !doc.isSystemChar) throw new Error("Not a system character");
    await ctx.db.patch(args.charId, { systemVisible: args.visible, lastActive: args.visible ? Date.now() : 0 });
    return { success: true };
  },
});

/* ══════════════════ 7. SERVER REGISTRY ══════════════════ */

export const getServerRegistry = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") return null;
    const doc = await getConfigDoc(ctx);
    const all = await ctx.db.query("users").collect();
    const registered = all.filter((u: any) => u.nickname);
    let companies = 0;
    try { companies = (await ctx.db.query("businesses").collect()).length; } catch { companies = 0; }
    return {
      environment: process.env.CONVEX_DEPLOYMENT ? String(process.env.CONVEX_DEPLOYMENT) : "production",
      version: "V8.59.0",
      registrationOpen: doc?.registrationOpen ?? true,
      maintenance: doc?.maintenanceMode ?? false,
      seasonLabel: "Public Alpha",
      playerAccount: registered.length,
      companies,
      admins: registered.filter((u: any) => u.role === "admin").map((u: any) => u.nickname ?? "Admin"),
      banned: registered.filter((u: any) => u.isBanned).length,
      online: registered.filter((u: any) => (u.lastActive ?? 0) > Date.now() - 120000 && !u.isSystemChar).length,
    };
  },
});

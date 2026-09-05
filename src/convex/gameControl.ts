import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// =====================================================================
// LIVE GAME CONTROL
// ---------------------------------------------------------------------
// One document in `gameConfig` (key: "main") holds every server-wide knob
// the admin console can twist: XP/cash multipliers, crime success bonus,
// energy regen, maintenance mode, ghost mode, lotto jackpot. `announcements`
// holds live banners shown to every connected player instantly.
//
// Because Convex queries are reactive subscriptions, a change made in the
// in-game Admin panel OR directly in the Convex dashboard shows up in every
// open game client within milliseconds — no redeploy, no new link.
// =====================================================================

export const DEFAULT_CONFIG = {
  key: "main",
  xpMultiplier: 1,
  xpMultiplierUntil: 0,
  cashMultiplier: 1,
  cashMultiplierUntil: 0,
  crimeSuccessBonus: 0, // 0..0.25 added to base success chance
  energyRegenPerMinute: 5,
  maintenanceMode: false,
  maintenanceMessage: "🔧 Server maintenance in progress — back soon!",
  ghostMode: false,
  lottoJackpot: 0,
  updatedAt: 0,
  updatedBy: undefined as string | undefined,
};

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  if (player.role !== "admin") throw new Error("Admin only!");
  return player;
}

async function getConfigDoc(ctx: any): Promise<any | null> {
  return ctx.db
    .query("gameConfig")
    .filter((q: any) => q.eq(q.field("key"), "main"))
    .first();
}

/** Upsert the config document with the given patch (admin-guarded). */
async function patchConfig(ctx: any, patch: Record<string, unknown>) {
  const existing = await getConfigDoc(ctx);
  const values = { ...DEFAULT_CONFIG, ...(existing ? { ...existing } : {}), ...patch, updatedAt: Date.now() };
  if (existing) {
    await ctx.db.patch(existing._id, values);
  } else {
    await ctx.db.insert("gameConfig", values);
  }
  return values;
}

// ===== PUBLIC REACTIVE QUERY (used by the whole game shell) =====
export const getLiveConfig = query({
  args: {},
  handler: async (ctx) => {
    const doc = await getConfigDoc(ctx);
    const cfg = { ...DEFAULT_CONFIG, ...(doc ?? {}) };
    const now = Date.now();
    // Effective multipliers: expire automatically when the deadline passes.
    const xpMultiplier = now < cfg.xpMultiplierUntil ? cfg.xpMultiplier : 1;
    const cashMultiplier = now < cfg.cashMultiplierUntil ? cfg.cashMultiplier : 1;
    const activeAnnouncements = await ctx.db
      .query("announcements")
      .filter((q: any) => q.eq(q.field("active"), true))
      .collect();
    const visible = activeAnnouncements
      .filter((a: any) => a.expiresAt > now)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .map((a: any) => ({
        _id: a._id,
        text: a.text,
        emoji: a.emoji ?? "📣",
        color: a.color ?? "amber",
        createdByName: a.createdByName ?? "Staff",
        expiresAt: a.expiresAt,
      }));
    const headlines = await ctx.db.query("headlines").order("desc").take(8);
    return {
      xpMultiplier,
      cashMultiplier,
      xpMultiplierUntil: cfg.xpMultiplierUntil,
      cashMultiplierUntil: cfg.cashMultiplierUntil,
      crimeSuccessBonus: cfg.crimeSuccessBonus ?? 0,
      energyRegenPerMinute: cfg.energyRegenPerMinute ?? 5,
      maintenanceMode: cfg.maintenanceMode ?? false,
      maintenanceMessage: cfg.maintenanceMessage ?? DEFAULT_CONFIG.maintenanceMessage,
      ghostMode: cfg.ghostMode ?? false,
      lottoJackpot: cfg.lottoJackpot ?? 0,
      announcements: visible,
      headlines: headlines.map((h: any) => ({ title: h.title, playerName: h.playerName ?? "", crimeType: h.crimeType ?? "", timestamp: h.timestamp })),
    };
  },
});

/**
 * Lightweight server-side helper for game actions: reads the live config and
 * returns the effective multipliers. Uses a try/catch so game actions NEVER
 * break if the config table is somehow unavailable — defaults keep the game
 * running exactly as before.
 */
export async function getLiveModifiers(ctx: any): Promise<{
  cashMultiplier: number;
  xpMultiplier: number;
  crimeSuccessBonus: number;
  energyRegenPerMinute: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  ghostMode: boolean;
}> {
  try {
    const doc = await getConfigDoc(ctx);
    const cfg = { ...DEFAULT_CONFIG, ...(doc ?? {}) };
    const now = Date.now();
    return {
      cashMultiplier: now < cfg.cashMultiplierUntil ? cfg.cashMultiplier : 1,
      xpMultiplier: now < cfg.xpMultiplierUntil ? cfg.xpMultiplier : 1,
      crimeSuccessBonus: cfg.crimeSuccessBonus ?? 0,
      energyRegenPerMinute: cfg.energyRegenPerMinute ?? 5,
      maintenanceMode: cfg.maintenanceMode ?? false,
      maintenanceMessage: cfg.maintenanceMessage ?? DEFAULT_CONFIG.maintenanceMessage,
      ghostMode: cfg.ghostMode ?? false,
    };
  } catch {
    return {
      cashMultiplier: 1,
      xpMultiplier: 1,
      crimeSuccessBonus: 0,
      energyRegenPerMinute: 5,
      maintenanceMode: false,
      maintenanceMessage: DEFAULT_CONFIG.maintenanceMessage,
      ghostMode: false,
    };
  }
}

// ===== ADMIN MUTATIONS =====

export const updateConfig = mutation({
  args: {
    xpMultiplier: v.optional(v.number()),
    xpDurationHours: v.optional(v.number()),
    cashMultiplier: v.optional(v.number()),
    cashDurationHours: v.optional(v.number()),
    crimeSuccessBonus: v.optional(v.number()),
    energyRegenPerMinute: v.optional(v.number()),
    maintenanceMode: v.optional(v.boolean()),
    maintenanceMessage: v.optional(v.string()),
    ghostMode: v.optional(v.boolean()),
    lottoJackpot: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const patch: Record<string, unknown> = { updatedBy: admin.nickname ?? admin.username ?? "admin" };
    const now = Date.now();
    if (args.xpMultiplier !== undefined) {
      if (args.xpMultiplier < 0.1 || args.xpMultiplier > 1000) throw new Error("XP multiplier must be 0.1–1000");
      patch.xpMultiplier = args.xpMultiplier;
      patch.xpMultiplierUntil = args.xpMultiplier === 1 ? 0 : now + (args.xpDurationHours ?? 24) * 3600000;
    }
    if (args.cashMultiplier !== undefined) {
      if (args.cashMultiplier < 0.1 || args.cashMultiplier > 1000) throw new Error("Cash multiplier must be 0.1–1000");
      patch.cashMultiplier = args.cashMultiplier;
      patch.cashMultiplierUntil = args.cashMultiplier === 1 ? 0 : now + (args.cashDurationHours ?? 24) * 3600000;
    }
    if (args.crimeSuccessBonus !== undefined) {
      if (args.crimeSuccessBonus < -0.25 || args.crimeSuccessBonus > 0.25) throw new Error("Crime bonus must be between -25% and +25%");
      patch.crimeSuccessBonus = args.crimeSuccessBonus;
    }
    if (args.energyRegenPerMinute !== undefined) {
      if (args.energyRegenPerMinute < 1 || args.energyRegenPerMinute > 100) throw new Error("Energy regen must be 1–100/min");
      patch.energyRegenPerMinute = args.energyRegenPerMinute;
    }
    if (args.maintenanceMode !== undefined) patch.maintenanceMode = args.maintenanceMode;
    if (args.maintenanceMessage !== undefined) {
      if (args.maintenanceMessage.length > 300) throw new Error("Message too long");
      patch.maintenanceMessage = args.maintenanceMessage;
    }
    if (args.ghostMode !== undefined) patch.ghostMode = args.ghostMode;
    if (args.lottoJackpot !== undefined) {
      if (args.lottoJackpot < 0 || args.lottoJackpot > 1_000_000_000_000) throw new Error("Jackpot out of range");
      patch.lottoJackpot = args.lottoJackpot;
    }
    await patchConfig(ctx, patch);
    return { success: true, ...patch };
  },
});

export const setMaintenance = mutation({
  args: { enabled: v.boolean(), message: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await patchConfig(ctx, {
      maintenanceMode: args.enabled,
      maintenanceMessage: args.message ?? DEFAULT_CONFIG.maintenanceMessage,
    });
    return { success: true, enabled: args.enabled };
  },
});

export const postAnnouncement = mutation({
  args: {
    text: v.string(),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),
    durationHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!args.text.trim()) throw new Error("Announcement text is required");
    if (args.text.length > 300) throw new Error("Announcement too long (max 300 chars)");
    const id = await ctx.db.insert("announcements", {
      text: args.text.trim(),
      emoji: args.emoji ?? "📣",
      color: args.color ?? "amber",
      createdBy: admin._id,
      createdByName: admin.nickname ?? admin.username ?? "Admin",
      expiresAt: Date.now() + (args.durationHours ?? 24) * 3600000,
      active: true,
      createdAt: Date.now(),
    });
    return { success: true, id };
  },
});

export const removeAnnouncement = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(args.announcementId);
    if (!doc) throw new Error("Announcement not found");
    await ctx.db.patch(args.announcementId, { active: false });
    return { success: true };
  },
});

export const postHeadline = mutation({
  args: { title: v.string(), crimeType: v.optional(v.string()), playerName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!args.title.trim()) throw new Error("Headline is required");
    if (args.title.length > 200) throw new Error("Headline too long");
    await ctx.db.insert("headlines", {
      title: args.title.trim(),
      playerName: args.playerName ?? admin.nickname ?? "Shadow Empire",
      crimeType: args.crimeType ?? "breaking",
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const getAdminConfig = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const doc = await getConfigDoc(ctx);
    return { ...DEFAULT_CONFIG, ...(doc ?? {}) };
  },
});
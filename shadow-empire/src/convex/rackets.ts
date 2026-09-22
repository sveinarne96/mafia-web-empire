import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";

/* ══════════════════════════════════════════════════════════════
   RACKETS CONTROL — live admin switches + level-scaled payouts
   for the 12-street-racket Expansion Pack.

   · racketConfig: single-document store (key "main") with one
     boolean per racket. Reactive — flipping a switch hides the
     racket from every player instantly, no redeploy.
   · getRacketPayoutScale: level scaling curve shared by every
     racket mutation — payouts grow with operator level.
   ══════════════════════════════════════════════════════════════ */

export const RACKET_KEYS = [
  "dock", "chop", "graffiti", "pawn", "cab", "dogs",
  "nightmarket", "cable", "numbers", "valet", "bath", "billboards",
] as const;

/* ─────────── CONFIG (admin toggles) ─────────── */

export const getRacketConfig = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("racketConfig")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!doc) {
      // Default: everything on
      const out: Record<string, boolean> = {};
      for (const k of RACKET_KEYS) out[k] = true;
      return out;
    }
    const out: Record<string, boolean> = {};
    for (const k of RACKET_KEYS) out[k] = (doc as any)[k] !== false;
    return out;
  },
});

export const setRacketEnabled = mutation({
  args: { key: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const me: any = await ctx.db.get(userId);
    if (me?.role !== "admin") throw new Error("Admin only.");
    if (!(RACKET_KEYS as readonly string[]).includes(args.key)) throw new Error("Unknown racket key.");

    const doc = await ctx.db
      .query("racketConfig")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (doc) {
      await ctx.db.patch(doc._id, { [args.key]: args.enabled, updatedAt: Date.now(), updatedBy: me.nickname ?? "admin" });
    } else {
      const init: any = { key: "main", updatedAt: Date.now(), updatedBy: me.nickname ?? "admin" };
      for (const k of RACKET_KEYS) init[k] = true;
      init[args.key] = args.enabled;
      await ctx.db.insert("racketConfig", init);
    }
    return { ok: true, key: args.key, enabled: args.enabled };
  },
});

/* ─────────── GUARD (used by every racket mutation) ─────────── */

export async function ensureRacket(ctx: any, key: string) {
  const doc = await ctx.db
    .query("racketConfig")
    .withIndex("by_key", (q: any) => q.eq("key", "main"))
    .first();
  if (doc && (doc as any)[key] === false) {
    throw new Error("This racket is currently closed by the administration.");
  }
}

/* ─────────── LEVEL SCALING ───────────
   Payout multiplier by operator level:
   Lv 1-9   ×1.0
   Lv 10-19 ×1.25
   Lv 20-29 ×1.6
   Lv 30-39 ×2.1
   Lv 40-49 ×2.8
   Lv 50-59 ×3.6
   Lv 60-69 ×4.6
   Lv 70-79 ×6.0
   Lv 80+   ×8.0
   Also exported as a helper so every racket mutation applies the
   same curve — one place to tune economy-wide payout growth.      */

export function racketLevelScale(level: number): number {
  const l = Math.max(1, Math.floor(level || 1));
  if (l >= 80) return 8.0;
  if (l >= 70) return 6.0;
  if (l >= 60) return 4.6;
  if (l >= 50) return 3.6;
  if (l >= 40) return 2.8;
  if (l >= 30) return 2.1;
  if (l >= 20) return 1.6;
  if (l >= 10) return 1.25;
  return 1.0;
}

export const getRacketScale = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { level: 1, scale: 1.0 };
    const me: any = await ctx.db.get(userId);
    const level = me?.level ?? 1;
    return { level, scale: racketLevelScale(level) };
  },
});

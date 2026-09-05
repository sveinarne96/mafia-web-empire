import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

const nameOf = (p: any) => p?.nickname || p?.username || p?.name || "Unknown";

export const STATEMENT_LINES = [
  "I saw it happen from the fire escape. [KILLER] pulled the trigger and walked away like nothing.",
  "Streetlight caught [KILLER]'s face clear as day. I can still see it when I close my eyes.",
  "The shooter was [KILLER]. Tall, calm, and gone before the sirens started.",
  "I was parked right there. [KILLER] did it — no question, I'd swear it in court.",
  "Window was open upstairs. Heard the shots, saw [KILLER] run.",
  "Paid me no mind. [KILLER] stood over the body for a second, then vanished into the alley.",
];

function makeCode(victimId: string, ts: number) {
  const seed = (victimId + ts).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  let s = seed;
  for (let i = 0; i < 6; i++) {
    s = (s * 9301 + 49297) % 233280;
    code += chars[Math.floor((s / 233280) * chars.length)];
  }
  return code;
}

// Generated automatically by the murder system; exposed so the panel can seed
// statements for older kills made before this feature shipped.
export const ensureStatements = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const mine = await ctx.db
      .query("witnessStatements")
      .withIndex("by_owner", (q) => q.eq("ownerId", player._id))
      .collect();
    if (mine.length >= 100) return { success: true, added: 0 };
    const crimes = await ctx.db
      .query("crimes")
      .withIndex("by_user", (q) => q.eq("userId", player._id))
      .order("desc")
      .collect();
    const murders = crimes.filter((c: any) => (c.type ?? "") === "murder");
    let added = 0;
    for (const m of murders.slice(0, 60)) {
      const targetName = (m as any).target;
      if (!targetName) continue;
      const exists = await ctx.db
        .query("witnessStatements")
        .withIndex("by_victim", (q) => q.eq("victimName", targetName))
        .collect();
      if (exists.some((w: any) => w.ownerId === player._id)) continue;
      await ctx.db.insert("witnessStatements", {
        killerId: player._id,
        killerName: nameOf(player),
        victimId: (m as any).targetUserId ?? player._id,
        victimName: targetName,
        code: makeCode(player._id + targetName, (m as any).timestamp ?? Date.now()),
        text: STATEMENT_LINES[(Math.abs(Math.floor(Math.random() * 31)) % 6)],
        ownerId: player._id,
        listed: false,
        price: 0,
        createdAt: (m as any).timestamp ?? Date.now(),
      } as any);
      added++;
    }
    return { success: true, added };
  },
});

// ─────────────────────────── QUERIES ───────────────────────────
export const getMyStatements = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const rows = await ctx.db
      .query("witnessStatements")
      .withIndex("by_owner", (q) => q.eq("ownerId", player._id))
      .order("desc")
      .collect();
    return rows.slice(0, 100).map((s: any) => ({
      _id: s._id,
      killerName: s.killerName,
      victimName: s.victimName,
      code: s.code,
      text: s.text,
      listed: s.listed,
      price: s.price,
      createdAt: s.createdAt,
    }));
  },
});

export const listStatementsForSale = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("witnessStatements")
      .withIndex("by_listed", (q) => q.eq("listed", true))
      .order("desc")
      .collect();
    const want = (args.search ?? "").trim().toLowerCase();
    return rows
      .filter((s: any) => !want || (s.victimName ?? "").toLowerCase().includes(want) || (s.killerName ?? "").toLowerCase().includes(want))
      .slice(0, 60)
      .map((s: any) => ({
        _id: s._id,
        killerName: s.killerName,
        victimName: s.victimName,
        price: s.price,
        createdAt: s.createdAt,
      }));
  },
});

// Reveal a statement when you have its code (also works for codes you own).
export const checkStatementCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = (args.code ?? "").trim().toUpperCase();
    if (code.length < 4) return { found: false };
    const rows = await ctx.db.query("witnessStatements").collect();
    const hit = rows.find((s: any) => s.code === code);
    if (!hit) return { found: false };
    return {
      found: true,
      killerName: hit.killerName,
      victimName: hit.victimName,
      text: hit.text.replace("[KILLER]", hit.killerName),
      at: hit.createdAt,
    };
  },
});

export const revealByCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = (args.code ?? "").trim().toUpperCase();
    if (code.length < 4) return { found: false };
    const rows = await ctx.db.query("witnessStatements").collect();
    const hit = rows.find((s: any) => s.code === code);
    if (!hit) return { found: false };
    return {
      found: true,
      killerName: hit.killerName,
      victimName: hit.victimName,
      text: hit.text.replace("[KILLER]", hit.killerName),
      at: hit.createdAt,
    };
  },
});

// Dead-user lookup: every statement about that victim (names only).
export const searchByVictim = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const want = (args.username ?? "").trim().toLowerCase();
    if (!want) return [];
    const rows = await ctx.db
      .query("witnessStatements")
      .withIndex("by_victim", (q) => q.eq("victimName", want))
      .order("desc")
      .collect();
    return rows.slice(0, 40).map((s: any) => ({
      _id: s._id,
      killerName: s.killerName,
      victimName: s.victimName,
      listed: s.listed,
      price: s.price,
      createdAt: s.createdAt,
    }));
  },
});

// ─────────────────────────── MUTATIONS ───────────────────────────
export const listStatement = mutation({
  args: { statementId: v.id("witnessStatements"), price: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const s: any = await ctx.db.get(args.statementId);
    if (!s || s.ownerId !== player._id) throw new Error("You do not own that statement");
    const price = Math.max(1_000_000, Math.floor(args.price));
    await ctx.db.patch(args.statementId, { listed: true, price } as any);
    return { success: true };
  },
});

export const unlistStatement = mutation({
  args: { statementId: v.id("witnessStatements") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const s: any = await ctx.db.get(args.statementId);
    if (!s || s.ownerId !== player._id) throw new Error("You do not own that statement");
    await ctx.db.patch(args.statementId, { listed: false, price: 0 } as any);
    return { success: true };
  },
});

export const buyStatement = mutation({
  args: { statementId: v.id("witnessStatements") },
  handler: async (ctx, args) => {
    const buyer: any = await getCurrentUser(ctx);
    const s: any = await ctx.db.get(args.statementId);
    if (!s || !s.listed) throw new Error("Statement not for sale");
    if (s.ownerId === buyer._id) throw new Error("You already own this statement");
    const price = s.price ?? 0;
    if ((buyer.money ?? 0) < price) throw new Error(`You need $${price.toLocaleString()}`);
    const seller: any = s.ownerId ? await ctx.db.get(s.ownerId) : null;
    await ctx.db.patch(buyer._id, { money: (buyer.money ?? 0) - price } as any);
    if (seller)
      await ctx.db.patch(seller._id, { money: (seller.money ?? 0) + price } as any);
    await ctx.db.patch(args.statementId, {
      ownerId: buyer._id,
      listed: false,
      price: 0,
      soldAt: Date.now(),
    } as any);
    return { success: true, code: s.code, text: s.text.replace("[KILLER]", s.killerName) };
  },
});

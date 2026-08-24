import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ===== MILESTONE LADDER — escalating prizes for recruiting =====
export const REFERRAL_MILESTONES = [
  { refs: 1, cash: 1_000_000, points: 100, prize: "🔗 First Blood Bonus", desc: "$1M + 100 points" },
  { refs: 3, cash: 5_000_000, points: 250, prize: "🤝 Crew Builder", desc: "$5M + 250 points" },
  { refs: 5, cash: 15_000_000, points: 500, prize: "⭐ Street Legend (24h 3x XP boost)", desc: "$15M + 500 pts + XP boost" },
  { refs: 10, cash: 40_000_000, points: 1000, prize: "⚔️ Kingmaker's Chain (+100 ATK item)", desc: "$40M + legendary weapon" },
  { refs: 25, cash: 120_000_000, points: 2500, prize: "🛡️ Golden Don Badge (+250 DEF item)", desc: "$120M + legendary armor" },
  { refs: 50, cash: 400_000_000, points: 5000, prize: "👑 Crown of Recruitment (+500 ATK/DEF)", desc: "$400M + mythic gear" },
  { refs: 100, cash: 1_000_000_000, points: 10000, prize: "🏆 RECRUITER GOD title + $1B", desc: "The ultimate honor" },
];

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

async function getPlayer(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

async function ensureCode(ctx: any, player: any) {
  if (player.referralCode) return player.referralCode;
  for (let tries = 0; tries < 10; tries++) {
    const code = `SHADOW-${generateCode()}`;
    const existing = await ctx.db.query("users").withIndex("by_referral_code", (q: any) => q.eq("referralCode", code)).first();
    if (!existing) {
      await ctx.db.patch(player._id, { referralCode: code });
      return code;
    }
  }
  return `SHADOW-${player._id.toString().slice(-6).toUpperCase()}`;
}

function milestoneFor(count: number) {
  return REFERRAL_MILESTONES.find((m) => m.refs === count);
}

// ===== QUERY: full referral dashboard data =====
export const getMyReferral = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) return null;
    const recruits = await ctx.db.query("referrals").withIndex("by_referrer", (q: any) => q.eq("referrerId", player._id)).collect();
    const recruitInfos = await Promise.all(recruits.map(async (r: any) => {
      const u: any = await ctx.db.get(r.referredId);
      return u ? { name: String(u.username ?? u.nickname ?? "Recruit"), level: Number(u.level ?? 1), joinedAt: r.createdAt } : null;
    }));
    const claimedMs = ((player as any).referralMilestones ?? []) as number[];
    return {
      code: (player as any).referralCode ?? null,
      referredBy: !!(player as any).referredBy,
      count: recruits.length,
      totalEarned: (player as any).referralEarnings ?? 0,
      commission: (player as any).referralCommission ?? 0,
      lastCommissionAt: (player as any).lastReferralCommissionAt ?? 0,
      milestonesClaimed: claimedMs,
      recruits: recruitInfos.filter(Boolean),
      nextMilestone: REFERRAL_MILESTONES.find((m) => m.refs > recruits.length) ?? null,
      allMilestones: REFERRAL_MILESTONES,
    };
  },
});

// Ensure the caller has a code (safe to call on page load)
export const ensureMyReferralCode = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    return { code: await ensureCode(ctx, player) };
  },
});

// Apply someone's referral code
export const applyReferralCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player as any).referredBy) throw new Error("You already used a referral code!");
    const code = args.code.trim().toUpperCase();
    const referrer = await ctx.db.query("users").withIndex("by_referral_code", (q: any) => q.eq("referralCode", code)).first();
    if (!referrer) throw new Error("Invalid referral code!");
    if (referrer._id === player._id) throw new Error("You can't refer yourself!");
    // Only newer/smaller players can be recruited
    if ((player.level ?? 1) > (referrer.level ?? 1) + 20) throw new Error("You're too experienced to use this code (max +20 levels above referrer)!");

    await ctx.db.patch(player._id, { referredBy: referrer._id });
    await ctx.db.insert("referrals", { referrerId: referrer._id, referredId: player._id, code, createdAt: Date.now() });

    // Welcome bonus for the new recruit
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + 500_000,
      points: (player.points ?? 0) + 250,
      xpBoostUntil: Math.max((player as any).xpBoostUntil ?? 0, Date.now() + 2 * 3600_000),
    });

    // Reward the referrer
    const refCount = (await ctx.db.query("referrals").withIndex("by_referrer", (q: any) => q.eq("referrerId", referrer._id)).collect()).length;
    const claimed = ((referrer as any).referralMilestones ?? []) as number[];
    const ms = milestoneFor(refCount);
    let cash = 1_000_000;
    let points = 100;
    let milestoneMsg = "";
    const updates: Record<string, unknown> = {};
    if (ms && !claimed.includes(ms.refs)) {
      updates.referralMilestones = [...claimed, ms.refs];
      cash += ms.cash;
      points += ms.points;
      if (ms.refs >= 5) updates.xpBoostUntil = Math.max((referrer as any).xpBoostUntil ?? 0, Date.now() + 24 * 3600_000);
      if (ms.refs === 10) {
        await ctx.db.insert("inventory", { userId: referrer._id, itemId: `ref_weapon_${Date.now()}`, name: "⚔️ Kingmaker's Chain (+100 ATK)", type: "weapon", equipped: false, quantity: 1, attack: 100, rarity: "legendary", price: 50_000_000 });
      }
      if (ms.refs === 25) {
        await ctx.db.insert("inventory", { userId: referrer._id, itemId: `ref_armor_${Date.now()}`, name: "🛡️ Golden Don Badge (+250 DEF)", type: "armor", equipped: false, quantity: 1, defense: 250, rarity: "legendary", price: 100_000_000 });
      }
      if (ms.refs === 50) {
        await ctx.db.insert("inventory", { userId: referrer._id, itemId: `ref_mythic_${Date.now()}`, name: "👑 Crown of Recruitment (+500 ATK/DEF)", type: "artifact", equipped: false, quantity: 1, attack: 500, defense: 500, rarity: "legendary", price: 250_000_000 });
      }
      if (ms.refs === 100) updates.title = "Recruiter God";
      milestoneMsg = ` MILESTONE UNLOCKED: ${ms.prize}!`;
    }
    await ctx.db.patch(referrer._id, {
      ...updates,
      money: (referrer.money ?? 0) + cash,
      points: (referrer.points ?? 0) + points,
      referralEarnings: ((referrer as any).referralEarnings ?? 0) + cash,
    });
    return { success: true, message: `🎉 Code applied! You got $500K + 250 points + 2h XP boost. Your recruiter got $${cash.toLocaleString()}${milestoneMsg}` };
  },
});

// Daily commission: $100K per active recruit per day
export const claimReferralCommission = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");
    const now = Date.now();
    const last = (player as any).lastReferralCommissionAt ?? 0;
    if (now - last < 24 * 3600_000) throw new Error(`Come back in ${Math.ceil((24 * 3600_000 - (now - last)) / 3600_000)}h!`);
    const recruits = await ctx.db.query("referrals").withIndex("by_referrer", (q: any) => q.eq("referrerId", player._id)).collect();
    if (recruits.length === 0) throw new Error("You need at least 1 recruit first!");
    const perHead = 100_000;
    const total = recruits.length * perHead;
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + total,
      referralEarnings: ((player as any).referralEarnings ?? 0) + total,
      lastReferralCommissionAt: now,
      referralCommission: 0,
    });
    return { earned: total, recruits: recruits.length };
  },
});

// Leaderboard: top recruiters server-wide
export const getTopReferrers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const rows = await ctx.db.query("referrals").collect();
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.referrerId.toString(), (counts.get(r.referrerId.toString()) ?? 0) + 1);
    const top = users
      .map((u: any) => ({ id: u._id.toString(), name: u.username ?? u.nickname ?? "Unknown", level: u.level ?? 1, count: counts.get(u._id.toString()) ?? 0 }))
      .filter((u: any) => u.count > 0)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 20);
    return top.map((u: any, i: number) => ({ ...u, rank: i + 1 }));
  },
});

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// =====================================================================
// NEW FRONTIERS — RETENTION, EVENTS & SHOP SYSTEMS
// ---------------------------------------------------------------------
// Login streaks, return-player bonuses, playtime rewards, idle income,
// XP milestone notifications, personal badges, player of the week,
// hall of fame, VIP tiers (points), cosmetic shop, starter packs,
// flash deals, ad-free pass, Black Friday, city lockdowns, lottery
// jackpot rollovers, city boss invasions, bug bounties, a player
// feedback board and an admin economy heat-map.
// =====================================================================

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const nowMs = () => Date.now();
const DAY = 86400000;

async function getPlayer(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

async function requireAdmin(ctx: any) {
  const player = await getPlayer(ctx);
  if (player.role !== "admin") throw new Error("Admin only!");
  return player;
}

function notify(ctx: any, userId: any, message: string) {
  return ctx.db.insert("notifications", { userId, type: "system", message, read: false, timestamp: nowMs() });
}

async function getConfigDoc(ctx: any): Promise<any | null> {
  return ctx.db
    .query("gameConfig")
    .filter((q: any) => q.eq(q.field("key"), "main"))
    .first();
}

async function patchConfig(ctx: any, patch: Record<string, unknown>) {
  const existing = await getConfigDoc(ctx);
  if (existing) {
    await ctx.db.patch(existing._id, { ...existing, ...patch, updatedAt: nowMs() });
  }
}

// ===== 1. LOGIN STREAKS =====
export const getStreakStatus = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const lastDay = (player as any).lastLoginDay ?? "";
    const streak = n((player as any).loginStreak, 0);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(nowMs() - DAY).toISOString().slice(0, 10);
    const claimed = lastDay === today;
    const broken = lastDay !== "" && lastDay !== today && lastDay !== yesterday;
    const current = broken ? 0 : claimed ? streak : streak + 1;
    // Streak rewards ladder (escalating)
    const ladder = [
      { day: 1, label: "$50k", money: 50_000 },
      { day: 2, label: "$120k", money: 120_000 },
      { day: 3, label: "$250k", money: 250_000 },
      { day: 4, label: "$500k", money: 500_000 },
      { day: 5, label: "$1M + 25 pts", money: 1_000_000, points: 25 },
      { day: 6, label: "$2.5M + 60 pts", money: 2_500_000, points: 60 },
      { day: 7, label: "$5M + 150 pts", money: 5_000_000, points: 150 },
    ];
    return { streak: current, claimed, broken, today, ladder, nextReward: ladder[(current % 7)] };
  },
});

export const claimLoginStreak = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const lastDay = (player as any).lastLoginDay ?? "";
    const streak = n((player as any).loginStreak, 0);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(nowMs() - DAY).toISOString().slice(0, 10);
    if (lastDay === today) throw new Error("Already claimed today's streak reward!");
    const broken = lastDay !== "" && lastDay !== today && lastDay !== yesterday;
    const next = broken ? 1 : streak + 1;
    const ladder = [
      { money: 50_000 }, { money: 120_000 }, { money: 250_000 }, { money: 500_000 },
      { money: 1_000_000, points: 25 }, { money: 2_500_000, points: 60 }, { money: 5_000_000, points: 150 },
    ];
    const reward = ladder[(next - 1) % 7];
    await ctx.db.patch(player._id, {
      loginStreak: next,
      lastLoginDay: today,
      money: n(player.money, 0) + reward.money,
      points: n(player.points, 0) + (reward.points ?? 0),
    } as any);
    return { day: next, money: reward.money, points: reward.points ?? 0, streakBroken: broken };
  },
});

// ===== 2. RETURN-PLAYER BONUS =====
export const getReturnBonus = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const lastActive = n(player.lastActive, nowMs());
    const lastBonus = n((player as any).lastReturnBonusAt, 0);
    const daysAway = Math.floor((nowMs() - lastActive) / DAY);
    const eligible = daysAway >= 3 && nowMs() - lastBonus > 3 * DAY;
    return {
      daysAway,
      eligible,
      tiers: [
        { days: 3, money: 1_000_000, points: 100, label: "Short Vacation" },
        { days: 7, money: 5_000_000, points: 400, label: "Weekend Away" },
        { days: 14, money: 15_000_000, points: 1000, label: "Long Trip" },
        { days: 30, money: 50_000_000, points: 3000, label: "Coming Home Legend" },
      ],
    };
  },
});

export const claimReturnBonus = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const lastActive = n(player.lastActive, nowMs());
    const lastBonus = n((player as any).lastReturnBonusAt, 0);
    const daysAway = Math.floor((nowMs() - lastActive) / DAY);
    if (daysAway < 3) throw new Error("You haven't been away long enough (3+ days)");
    if (nowMs() - lastBonus < 3 * DAY) throw new Error("Return bonus available every 3 days");
    const tiers = [
      { days: 3, money: 1_000_000, points: 100 },
      { days: 7, money: 5_000_000, points: 400 },
      { days: 14, money: 15_000_000, points: 1000 },
      { days: 30, money: 50_000_000, points: 3000 },
    ];
    let tier = tiers[0];
    for (const t of tiers) if (daysAway >= t.days) tier = t;
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) + tier.money,
      points: n(player.points, 0) + tier.points,
      lastReturnBonusAt: nowMs(),
      totalReturnBonuses: n((player as any).totalReturnBonuses, 0) + 1,
    } as any);
    return { daysAway, money: tier.money, points: tier.points };
  },
});

// ===== 3. PLAYTIME REWARDS =====
export const getPlaytimeStatus = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const lastTick = n((player as any).lastPlaytimeTick, nowMs());
    const minutes = Math.max(0, Math.floor((nowMs() - lastTick) / 60000));
    return { minutesOnline: Math.min(minutes, 600), nextRewardAt: lastTick + 60000, rewardsGiven: n((player as any).totalPlaytimeRewards, 0) };
  },
});

export const claimPlaytimeReward = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const lastTick = n((player as any).lastPlaytimeTick, nowMs());
    const minutes = Math.floor((nowMs() - lastTick) / 60000);
    if (minutes < 30) throw new Error(`Play ${30 - minutes} more minutes to earn your next hourly gift`);
    const hours = Math.min(12, Math.floor(minutes / 60));
    const money = 100_000 * hours;
    const points = 10 * hours;
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) + money,
      points: n(player.points, 0) + points,
      lastPlaytimeTick: nowMs(),
      totalPlaytimeRewards: n((player as any).totalPlaytimeRewards, 0) + 1,
    } as any);
    return { hours, money, points };
  },
});

// ===== 4. IDLE INCOME (businesses & properties pay while away) =====
export const getIdleIncome = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const since = n((player as any).lastIdleClaimAt, nowMs());
    const ms = Math.min(24 * 3600 * 1000, Math.max(0, nowMs() - since));
    const [biz, props] = await Promise.all([
      ctx.db.query("businesses").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect(),
      ctx.db.query("properties").collect(),
    ]);
    const bizIncome = biz.reduce((s, b: any) => s + n(b.income, 0), 0);
    const propIncome = props.filter((p: any) => p.ownerId === player._id && (p as any).rentedTo).reduce((s, p: any) => s + n(p.income, 0), 0);
    const hourly = Math.round((bizIncome + propIncome) / 24);
    return { msAway: ms, hourly, estPayout: Math.round(hourly * (ms / 3600000)), businesses: biz.length, rentedProps: props.filter((p: any) => p.ownerId === player._id && (p as any).rentedTo).length };
  },
});

export const claimIdleIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const since = n((player as any).lastIdleClaimAt, nowMs());
    const ms = Math.min(24 * 3600 * 1000, Math.max(0, nowMs() - since));
    if (ms < 3600000) throw new Error("Idle income accrues after 1 hour away");
    const [biz, props] = await Promise.all([
      ctx.db.query("businesses").withIndex("by_owner", (q: any) => q.eq("ownerId", player._id)).collect(),
      ctx.db.query("properties").collect(),
    ]);
    const bizIncome = biz.reduce((s, b: any) => s + n(b.income, 0), 0);
    const propIncome = props.filter((p: any) => p.ownerId === player._id && (p as any).rentedTo).reduce((s, p: any) => s + n(p.income, 0), 0);
    const hourly = Math.round((bizIncome + propIncome) / 24);
    const payout = Math.round(hourly * (ms / 3600000));
    if (payout <= 0) throw new Error("Own businesses or rented properties to earn idle income");
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) + payout,
      lastIdleClaimAt: nowMs(),
      totalIdleEarned: n((player as any).totalIdleEarned, 0) + payout,
    } as any);
    return { payout, hours: Math.round((ms / 3600000) * 10) / 10 };
  },
});

// ===== 5. XP MILESTONE NOTIFICATIONS =====
export const XP_MILESTONES = [
  { level: 10, label: "Soldier", reward: 50_000 },
  { level: 25, label: "Enforcer", reward: 250_000 },
  { level: 50, label: "Capo", reward: 1_000_000, points: 50 },
  { level: 100, label: "Underboss", reward: 5_000_000, points: 200 },
  { level: 150, label: "Consigliere", reward: 15_000_000, points: 500 },
  { level: 200, label: "Don", reward: 50_000_000, points: 1200 },
  { level: 300, label: "Godfather", reward: 150_000_000, points: 3000 },
  { level: 500, label: "Legend", reward: 500_000_000, points: 7500 },
];

export const getXpMilestones = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const claimed = n((player as any).xpMilestoneClaimed, 0);
    const next = XP_MILESTONES.filter((m) => m.level > claimed);
    const claimable = next.filter((m) => n(player.level, 1) >= m.level);
    return { milestones: XP_MILESTONES, claimable, nextUp: next[0] ?? null, claimedUpTo: claimed };
  },
});

export const claimXpMilestone = mutation({
  args: { level: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const ms = XP_MILESTONES.find((m) => m.level === args.level);
    if (!ms) throw new Error("Milestone not found");
    if (n(player.level, 1) < ms.level) throw new Error(`Reach level ${ms.level} first`);
    if (n((player as any).xpMilestoneClaimed, 0) >= ms.level) throw new Error("Already claimed");
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) + ms.reward,
      points: n(player.points, 0) + (ms.points ?? 0),
      xpMilestoneClaimed: ms.level,
    } as any);
    return { label: ms.label, reward: ms.reward, points: ms.points ?? 0 };
  },
});

// ===== 6. PERSONAL BADGES (firsts) =====
export const BADGES = [
  { id: "first_crime", name: "First Blood", icon: "🔪", check: (p: any) => n(p.totalCrimes, 0) >= 1 },
  { id: "first_million", name: "First Million", icon: "💰", check: (p: any) => n(p.totalEarned, 0) >= 1_000_000 },
  { id: "first_kill", name: "Wet Work", icon: "💀", check: (p: any) => n(p.totalKills, 0) >= 1 },
  { id: "first_gta", name: "Grand Theft", icon: "🚗", check: (p: any) => n((p as any).carsStolen ?? p.totalCrimes, 0) >= 1 && n((p as any).carsStolen ?? 0, 0) >= 1 },
  { id: "level_25", name: "Rising Star", icon: "⭐", check: (p: any) => n(p.level, 1) >= 25 },
  { id: "level_50", name: "Made Man", icon: "🎖️", check: (p: any) => n(p.level, 1) >= 50 },
  { id: "level_100", name: "Shot Caller", icon: "👑", check: (p: any) => n(p.level, 1) >= 100 },
  { id: "net_10m", name: "Ten Millionaire", icon: "🤑", check: (p: any) => n(p.money, 0) + n(p.bank, 0) >= 10_000_000 },
  { id: "net_100m", name: "Hundred Mil Club", icon: "🏦", check: (p: any) => n(p.money, 0) + n(p.bank, 0) >= 100_000_000 },
  { id: "net_1b", name: "Billionaire", icon: "💎", check: (p: any) => n(p.money, 0) + n(p.bank, 0) >= 1_000_000_000 },
  { id: "streak_7", name: "Weekly Habit", icon: "📅", check: (p: any) => n((p as any).loginStreak, 0) >= 7 },
  { id: "boss_slayer", name: "Boss Slayer", icon: "🐉", check: (p: any) => n((p as any).bossDamageDone, 0) >= 100_000 },
  { id: "bettor", name: "High Roller", icon: "🎲", check: (p: any) => n((p as any).totalRaceBets, 0) >= 100_000 },
  { id: "shark", name: "Loan Shark", icon: "🦈", check: (p: any) => n(p.loanSharkDebts ?? 0, 0) >= 1 },
  { id: "digger", name: "Treasure Hunter", icon: "🗺️", check: (p: any) => n((p as any).totalTreasuresDug, 0) >= 5 },
];

export const getBadges = query({
  args: {},
  handler: async (ctx) => {
    // Never throw on this read-only endpoint: badge data is cosmetic, so the
    // worst case is an empty board. (Also keep `check` out of the result —
    // functions are not serializable and Convex rejects the query otherwise.)
    try {
      const player = await getPlayer(ctx);
      const owned = Array.isArray((player as any).badges) ? (player as any).badges : [];
      return {
        badges: BADGES.map((b) => ({
          id: b.id,
          name: b.name,
          icon: b.icon,
          earned: owned.some((x: any) => x && typeof x === "object" && x.id === b.id),
        })),
        myBadges: owned,
      };
    } catch {
      return { badges: BADGES.map((b) => ({ id: b.id, name: b.name, icon: b.icon, earned: false })), myBadges: [] };
    }
  },
});

export const checkBadges = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const earned = (player as any).badges ?? [];
    const newly: any[] = [];
    for (const b of BADGES) {
      if (!earned.some((x: any) => x.id === b.id) && b.check(player)) {
        earned.push({ id: b.id, name: b.name, icon: b.icon, at: nowMs() });
        newly.push(b);
      }
    }
    if (newly.length > 0) {
      await ctx.db.patch(player._id, { badges: earned } as any);
    }
    return { newly };
  },
});

// ===== 7. PLAYER OF THE WEEK =====
const weekKey = (t: number) => {
  const d = new Date(t);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));
  return start.toISOString().slice(0, 10);
};

export const getPlayerOfWeek = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const wk = weekKey(nowMs());
    const current = await ctx.db.query("playerOfWeek").withIndex("by_week", (q: any) => q.eq("weekStart", wk)).collect();
    const candidates = await ctx.db.query("users").collect();
    const ranked = candidates
      .map((u: any) => ({ id: u._id, name: u.nickname || u.username || "Unknown", level: n(u.level, 1), net: n(u.money, 0) + n(u.bank, 0) + n(u.interestBank, 0), votes: current.find((c: any) => c.playerId === u._id)?.votes ?? 0 }))
      .sort((a: any, b: any) => b.votes - a.votes || b.net - a.net)
      .slice(0, 10);
    const myVote = await ctx.db.query("povVotes").withIndex("by_voter_week", (q: any) => q.eq("voterId", player._id).eq("weekStart", wk)).first();
    const winner = current.find((c: any) => c.resolved);
    return { week: wk, candidates: ranked, myVote: myVote?.candidateId ?? null, winner: winner ?? null, myWins: n((player as any).playerOfWeekWins, 0) };
  },
});

export const votePlayerOfWeek = mutation({
  args: { candidateId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (args.candidateId === player._id) throw new Error("Can't vote for yourself");
    const wk = weekKey(nowMs());
    const existing = await ctx.db.query("povVotes").withIndex("by_voter_week", (q: any) => q.eq("voterId", player._id).eq("weekStart", wk)).first();
    if (existing) throw new Error("You already voted this week");
    await ctx.db.insert("povVotes", { voterId: player._id, candidateId: args.candidateId, weekStart: wk, createdAt: nowMs() });
    const row = await ctx.db.query("playerOfWeek").withIndex("by_week", (q: any) => q.eq("weekStart", wk)).filter((q: any) => q.eq(q.field("playerId"), args.candidateId)).first();
    if (row) await ctx.db.patch(row._id, { votes: n(row.votes, 0) + 1, updatedAt: nowMs() } as any);
    else {
      const cand = await ctx.db.get(args.candidateId);
      await ctx.db.insert("playerOfWeek", {
        playerId: args.candidateId, playerName: cand?.nickname || cand?.username || "Unknown",
        weekStart: wk, votes: 1, resolved: false, rewardGiven: false, updatedAt: nowMs(),
      });
    }
    return { voted: true };
  },
});

export const resolvePlayerOfWeek = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const wk = weekKey(nowMs() - DAY);
    const rows = await ctx.db.query("playerOfWeek").withIndex("by_week", (q: any) => q.eq("weekStart", wk)).collect();
    if (rows.length === 0) throw new Error("No votes for last week");
    const top = [...rows].sort((a: any, b: any) => n(b.votes, 0) - n(a.votes, 0))[0];
    if (top.resolved) return { already: true, winner: top.playerName };
    await ctx.db.patch(top._id, { resolved: true } as any);
    const winner = await ctx.db.get(top.playerId);
    if (winner) {
      await ctx.db.patch(top.playerId, {
        money: n(winner.money, 0) + 25_000_000,
        points: n(winner.points, 0) + 1000,
        playerOfWeekWins: n((winner as any).playerOfWeekWins, 0) + 1,
      } as any);
      await notify(ctx, top.playerId, `🏆 You are Player of the Week (${wk})! +$25M, +1,000 points.`);
    }
    return { winner: top.playerName, votes: n(top.votes, 0) };
  },
});

// ===== 8. HALL OF FAME =====
export const getHallOfFame = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("users").collect();
    const season = new Date().toISOString().slice(0, 7);
    const boards: Record<string, any[]> = {};
    const mk = (category: string, valueFn: (p: any) => number) => {
      const ranked = players
        .map((p: any) => ({ playerId: p._id, playerName: p.nickname || p.username || "Unknown", value: valueFn(p) }))
        .filter((x) => x.value > 0)
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 10)
        .map((x, i) => ({ ...x, rank: i + 1 }));
      boards[category] = ranked;
    };
    mk("networth", (p) => n(p.money, 0) + n(p.bank, 0) + n(p.interestBank, 0) + n(p.swissBank, 0));
    mk("level", (p) => n(p.level, 1));
    mk("kills", (p) => n(p.totalKills, 0));
    mk("crimes", (p) => n(p.totalCrimes, 0));
    mk("heists", (p) => n(p.heistsTotal, 0));
    mk("boss", (p) => n((p as any).bossDamageDone, 0));
    return { boards, season };
  },
});

export const recalcHallOfFame = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const data: any = await ctx.runQuery(api.retentionSystem.getHallOfFame);
    await ctx.db.query("hallOfFame").collect().then((rows: any[]) => rows.forEach((r) => ctx.db.delete(r._id)));
    for (const [category, list] of Object.entries(data.boards as Record<string, any[]>)) {
      for (const entry of list as any[]) {
        await ctx.db.insert("hallOfFame", {
          category, rank: entry.rank, playerId: entry.playerId, playerName: entry.playerName,
          value: entry.value, season: data.season, updatedAt: nowMs(),
        });
      }
    }
    return { ok: true };
  },
});

// ===== 9. VIP TIERS (buy with points) =====
export const VIP_TIERS = [
  { id: "silver", name: "Silver VIP", icon: "🥈", cost: 5_000, days: 7, perks: ["+10% XP", "+10% cash", "VIP badge in chat", "Priority support"] },
  { id: "gold", name: "Gold VIP", icon: "🥇", cost: 14_000, days: 7, perks: ["+25% XP", "+25% cash", "Gold badge", "1 free jailbreak/week", "Double daily rewards"] },
  { id: "platinum", name: "Platinum VIP", icon: "💎", cost: 35_000, days: 14, perks: ["+50% XP", "+50% cash", "Platinum badge", "Free jailbreak x3/week", "Idle income +50%", "Exclusive cosmetics"] },
];

export const getVipLounge = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const tier = (player as any).vipTier ?? null;
    const until = n((player as any).vipUntil, 0);
    return { tiers: VIP_TIERS, current: tier, until, active: until > nowMs(), adFreeUntil: n((player as any).adFreeUntil, 0), points: n(player.points, 0) };
  },
});

export const buyVip = mutation({
  args: { tierId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const tier = VIP_TIERS.find((t) => t.id === args.tierId);
    if (!tier) throw new Error("Tier not found");
    if (n(player.points, 0) < tier.cost) throw new Error(`Needs ${tier.cost.toLocaleString()} points`);
    const existingUntil = n((player as any).vipUntil, 0);
    const newUntil = Math.max(nowMs(), existingUntil) + tier.days * DAY;
    await ctx.db.patch(player._id, {
      points: n(player.points, 0) - tier.cost,
      vipTier: tier.id,
      vipUntil: newUntil,
    } as any);
    await notify(ctx, player._id, `👑 ${tier.name} activated for ${tier.days} days!`);
    return { tier: tier.name, until: newUntil };
  },
});

export const buyAdFree = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const cost = 1_500;
    if (n(player.points, 0) < cost) throw new Error("Needs 1,500 points");
    const until = Math.max(nowMs(), n((player as any).adFreeUntil, 0)) + 30 * DAY;
    await ctx.db.patch(player._id, { points: n(player.points, 0) - cost, adFreeUntil: until } as any);
    return { until };
  },
});

// ===== 10. COSMETIC SHOP =====
export const COSMETICS = [
  // Avatars (outfits shown around your name)
  { id: "av_zebra", category: "avatar", name: "Zebra Suit", icon: "🦓", cost: 800, tier: "rare" },
  { id: "av_pinstripe", category: "avatar", name: "Pinstripe Power", icon: "🤵", cost: 1500, tier: "rare" },
  { id: "av_goldchain", category: "avatar", name: "Gold Chain", icon: "📿", cost: 3000, tier: "epic" },
  { id: "av_shadow", category: "avatar", name: "Shadow Hood", icon: "🥷", cost: 5000, tier: "epic" },
  { id: "av_don", category: "avatar", name: "Don's Crown", icon: "👑", cost: 12000, tier: "legendary" },
  // Profile cards
  { id: "card_classic", category: "card", name: "Classic File", icon: "📇", cost: 1000, tier: "common" },
  { id: "card_crimson", category: "card", name: "Crimson Ledger", icon: "📕", cost: 2500, tier: "rare" },
  { id: "card_neon", category: "card", name: "Neon Vice", icon: "🌃", cost: 6000, tier: "epic" },
  { id: "card_gold", category: "card", name: "Gilded Portrait", icon: "🖼️", cost: 15000, tier: "legendary" },
  // Chat titles
  { id: "title_boss", category: "title", name: "Title: The Boss", icon: "💼", cost: 2000, tier: "rare" },
  { id: "title_phantom", category: "title", name: "Title: The Phantom", icon: "👻", cost: 5000, tier: "epic" },
  { id: "title_untouchable", category: "title", name: "Title: Untouchable", icon: "🧊", cost: 12000, tier: "legendary" },
];

export const getCosmeticShop = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const owned = (player as any).ownedCosmetics ?? [];
    const equipped = (player as any).equippedCosmetics ?? {};
    return { catalog: COSMETICS, owned, equipped, points: n(player.points, 0) };
  },
});

export const buyCosmetic = mutation({
  args: { cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const item = COSMETICS.find((c) => c.id === args.cosmeticId);
    if (!item) throw new Error("Cosmetic not found");
    const owned = (player as any).ownedCosmetics ?? [];
    if (owned.some((x: any) => x.id === item.id)) throw new Error("Already owned");
    if (n(player.points, 0) < item.cost) throw new Error(`Needs ${item.cost.toLocaleString()} points`);
    await ctx.db.patch(player._id, {
      points: n(player.points, 0) - item.cost,
      ownedCosmetics: [...owned, { id: item.id, category: item.category, name: item.name, icon: item.icon, acquiredAt: nowMs() }],
    } as any);
    return { name: item.name };
  },
});

export const equipCosmetic = mutation({
  args: { cosmeticId: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const owned = (player as any).ownedCosmetics ?? [];
    if (!owned.some((x: any) => x.id === args.cosmeticId)) throw new Error("Not owned");
    const equipped = { ...((player as any).equippedCosmetics ?? {}) };
    equipped[args.category] = args.cosmeticId;
    await ctx.db.patch(player._id, { equippedCosmetics: equipped } as any);
    return { equipped };
  },
});

// ===== 11. STARTER PACKS =====
export const STARTER_PACKS = [
  { id: "new_blood", name: "New Blood Pack", icon: "🩸", cost: 0, levelReq: 0, once: true, rewardLabel: "$2M + 500 bullets + 50 points", reward: { money: 2_000_000, bullets: 500, points: 50 } },
  { id: "rookie", name: "Rookie Booster", icon: "🧢", cost: 300, levelReq: 25, rewardLabel: "$20M + 2,000 bullets + 200 points", reward: { money: 20_000_000, bullets: 2_000, points: 200 } },
  { id: "boss_bundle", name: "Boss Bundle", icon: "🕶️", cost: 1500, levelReq: 50, rewardLabel: "$100M + 10,000 bullets + 1,000 points", reward: { money: 100_000_000, bullets: 10_000, points: 1_000 } },
  { id: "don_pack", name: "Don's Kit", icon: "🎩", cost: 5000, levelReq: 100, rewardLabel: "$500M + 50,000 bullets + 5,000 points", reward: { money: 500_000_000, bullets: 50_000, points: 5_000 } },
];

export const getStarterPacks = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const claimed = (player as any).starterPacksClaimed ?? [];
    return { packs: STARTER_PACKS.map((p) => ({ ...p, claimed: claimed.includes(p.id) })), points: n(player.points, 0), level: n(player.level, 1) };
  },
});

export const claimStarterPack = mutation({
  args: { packId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const pack = STARTER_PACKS.find((p) => p.id === args.packId);
    if (!pack) throw new Error("Pack not found");
    const claimed = (player as any).starterPacksClaimed ?? [];
    if (claimed.includes(pack.id)) throw new Error("Already claimed");
    if (pack.once && pack.cost === 0 && n((player as any).starterClaimed, 0)) throw new Error("New Blood claimed already");
    if (n(player.level, 1) < pack.levelReq) throw new Error(`Requires level ${pack.levelReq}`);
    if (n(player.points, 0) < pack.cost) throw new Error(`Needs ${pack.cost.toLocaleString()} points`);
    await ctx.db.patch(player._id, {
      points: n(player.points, 0) - pack.cost + (pack.reward.points ?? 0),
      money: n(player.money, 0) + (pack.reward.money ?? 0),
      bullets: n(player.bullets, 0) + (pack.reward.bullets ?? 0),
      starterPacksClaimed: [...claimed, pack.id],
      starterClaimed: pack.id === "new_blood" ? true : n((player as any).starterClaimed, 0),
    } as any);
    return { pack: pack.name, label: pack.rewardLabel };
  },
});

// ===== 12. FLASH DEALS =====
export const getFlashDeals = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const deals = await ctx.db.query("flashDeals").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    const now = nowMs();
    const live = deals.filter((d: any) => d.expiresAt > now);
    const claimed = (player as any).claimedFlashDeals ?? [];
    return { deals: live.map((d) => ({ ...d, claimed: claimed.includes(d._id) })), points: n(player.points, 0) };
  },
});

export const buyFlashDeal = mutation({
  args: { dealId: v.id("flashDeals") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const deal = await ctx.db.get(args.dealId);
    if (!deal || !deal.active || deal.expiresAt < nowMs()) throw new Error("Deal not found or expired");
    const claimed = (player as any).claimedFlashDeals ?? [];
    if (claimed.includes(args.dealId)) throw new Error("Already claimed this deal");
    if (n(player.points, 0) < deal.cost) throw new Error(`Needs ${deal.cost.toLocaleString()} points`);
    const patch: any = { points: n(player.points, 0) - deal.cost, claimedFlashDeals: [...claimed, args.dealId] };
    if (deal.rewardType === "cash") patch.money = n(player.money, 0) + deal.rewardValue;
    else if (deal.rewardType === "points") patch.points = n(player.points, 0) + deal.rewardValue;
    else if (deal.rewardType === "bullets") patch.bullets = n(player.bullets, 0) + deal.rewardValue;
    await ctx.db.patch(player._id, patch);
    return { title: deal.title, label: deal.rewardLabel };
  },
});

export const addFlashDeal = mutation({
  args: { title: v.string(), icon: v.string(), desc: v.string(), cost: v.number(), rewardLabel: v.string(), rewardType: v.string(), rewardValue: v.number(), hours: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("flashDeals", {
      title: args.title, icon: args.icon, desc: args.desc, cost: args.cost,
      rewardLabel: args.rewardLabel, rewardType: args.rewardType, rewardValue: args.rewardValue,
      expiresAt: nowMs() + Math.min(168, Math.max(1, args.hours)) * 3600 * 1000,
      active: true, createdAt: nowMs(),
    });
    return { ok: true };
  },
});

// ===== 13. BLACK FRIDAY & CITY LOCKDOWN =====
export const getCityEvents = query({
  args: {},
  handler: async (ctx) => {
    const cfg = await getConfigDoc(ctx);
    const now = nowMs();
    const bf = n(cfg?.blackFridayUntil, 0);
    const ld = n(cfg?.lockdownUntil, 0);
    return {
      blackFriday: { active: bf > now, until: bf, discount: 30 },
      lockdown: { active: ld > now, until: ld },
    };
  },
});

export const setBlackFriday = mutation({
  args: { hours: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const until = nowMs() + Math.min(72, Math.max(0, args.hours)) * 3600 * 1000;
    await patchConfig(ctx, { blackFridayUntil: until });
    return { until };
  },
});

export const setLockdown = mutation({
  args: { hours: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const until = nowMs() + Math.min(48, Math.max(0, args.hours)) * 3600 * 1000;
    await patchConfig(ctx, { lockdownUntil: until });
    return { until };
  },
});

// ===== 14. LOTTERY JACKPOT ROLLOVER =====
export const getLotteryRollover = query({
  args: {},
  handler: async (ctx) => {
    const cfg = await getConfigDoc(ctx);
    const lotteries = await ctx.db.query("lotteries").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    const now = nowMs();
    const overdue = lotteries.filter((l: any) => l.endTime < now);
    const pct = n(cfg?.lotteryRolloverPct, 20);
    return {
      jackpot: n(cfg?.lottoJackpot, 0),
      rolloverPct: pct,
      pendingDraws: overdue.length,
      nextDraw: lotteries.length ? Math.min(...lotteries.map((l: any) => n(l.endTime, now))) : 0,
    };
  },
});

export const processLotteryRollover = mutation({
  args: {},
  handler: async (ctx) => {
    const cfg = await getConfigDoc(ctx);
    const lotteries = await ctx.db.query("lotteries").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    const now = nowMs();
    const pct = n(cfg?.lotteryRolloverPct, 20) / 100;
    let rolled = 0;
    let added = 0;
    for (const l of lotteries) {
      if (l.endTime < now) {
        // Winnerless draw → roll prize into the global jackpot
        const prize = n(l.prize, 0);
        const hasWinner = !!l.winnerId;
        await ctx.db.patch(l._id, { active: false } as any);
        if (!hasWinner && prize > 0) {
          added += Math.round(prize * pct);
          rolled++;
        }
      }
    }
    if (added > 0) {
      await patchConfig(ctx, { lottoJackpot: n(cfg?.lottoJackpot, 0) + added });
    }
    return { drawsProcessed: rolled + (lotteries.length - rolled), rolled, added };
  },
});

// ===== 15. CITY BOSS INVASIONS =====
export const BOSSES = [
  { bossId: "boss_thug", name: "Brutus 'The Tank' Malone", icon: "💪", hp: 500_000, attack: 60, rewardMin: 2_000_000, rewardMax: 6_000_000, pointsReward: 100 },
  { bossId: "boss_don", name: "Don Salvatore", icon: "🎩", hp: 2_000_000, attack: 140, rewardMin: 10_000_000, rewardMax: 30_000_000, pointsReward: 500 },
  { bossId: "boss_kingpin", name: "El Patrón", icon: "🥃", hp: 8_000_000, attack: 320, rewardMin: 50_000_000, rewardMax: 150_000_000, pointsReward: 1500 },
  { bossId: "boss_ghost", name: "The Ghost", icon: "👻", hp: 25_000_000, attack: 700, rewardMin: 200_000_000, rewardMax: 600_000_000, pointsReward: 4000 },
];

export const getBossInvasions = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const active = await ctx.db.query("bossInvasions").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    return { bosses: BOSSES, active: active.filter((b: any) => b.expiresAt > nowMs()), myDamage: n((player as any).bossDamageDone, 0) };
  },
});

export const spawnBoss = mutation({
  args: { bossId: v.string(), city: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const boss = BOSSES.find((b) => b.bossId === args.bossId);
    if (!boss) throw new Error("Boss not found");
    const existing = await ctx.db.query("bossInvasions").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    if (existing.some((b: any) => b.expiresAt > nowMs())) throw new Error("A boss is already invading — clear it first");
    await ctx.db.insert("bossInvasions", {
      ...boss, maxHp: boss.hp, city: args.city || "New York", active: true, startedAt: nowMs(),
      expiresAt: nowMs() + 24 * 3600 * 1000, lastHitAt: 0,
    });
    return { name: boss.name };
  },
});

export const maybeSpawnBoss = mutation({
  args: {},
  handler: async (ctx) => {
    const cfg = await getConfigDoc(ctx);
    if (nowMs() < n(cfg?.bossSpawnCooldownUntil, 0)) return { spawned: false };
    const existing = await ctx.db.query("bossInvasions").withIndex("by_active", (q: any) => q.eq("active", true)).collect();
    if (existing.some((b: any) => b.expiresAt > nowMs())) return { spawned: false };
    // 10% chance per check, min every 6h
    if (Math.random() > 0.1) return { spawned: false };
    const boss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
    const cities = ["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles"];
    await ctx.db.insert("bossInvasions", {
      ...boss, maxHp: boss.hp, city: cities[Math.floor(Math.random() * cities.length)], active: true,
      startedAt: nowMs(), expiresAt: nowMs() + 24 * 3600 * 1000, lastHitAt: 0,
    });
    await patchConfig(ctx, { bossSpawnCooldownUntil: nowMs() + 6 * 3600 * 1000 } as any);
    return { spawned: true, name: boss.name };
  },
});

export const attackBoss = mutation({
  args: { invasionId: v.id("bossInvasions") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const boss = await ctx.db.get(args.invasionId);
    if (!boss || !boss.active || boss.expiresAt < nowMs()) throw new Error("Boss not found");
    const lastHit = n(boss.lastHitAt, 0);
    if (nowMs() - lastHit < 15_000) throw new Error("Boss is recovering — attack again in a few seconds");
    const attack = n(player.attack, 10) + Math.floor(Math.random() * 40);
    const dmg = Math.min(boss.hp, Math.round(attack * (0.8 + Math.random() * 0.6)));
    // Boss counterattacks
    const counter = Math.round(n(boss.attack, 100) * (0.5 + Math.random() * 0.6));
    const life = Math.max(1, n(player.life, 100) - counter);
    await ctx.db.patch(player._id, {
      life,
      bossDamageDone: n((player as any).bossDamageDone, 0) + dmg,
    } as any);
    const remaining = n(boss.hp, 0) - dmg;
    await ctx.db.patch(args.invasionId, { hp: Math.max(0, remaining), lastHitAt: nowMs() } as any);
    let slain = false;
    let reward = 0;
    let pointsReward = 0;
    if (remaining <= 0) {
      slain = true;
      await ctx.db.patch(args.invasionId, { active: false } as any);
      reward = Math.round(n(boss.rewardMin, 0) + Math.random() * (n(boss.rewardMax, 0) - n(boss.rewardMin, 0)));
      pointsReward = n(boss.pointsReward, 0);
      await ctx.db.patch(player._id, {
        money: n(player.money, 0) + reward,
        points: n(player.points, 0) + pointsReward,
      } as any);
      await notify(ctx, player._id, `🐉 ${boss.name} slain! You land the killing blow: +$${reward.toLocaleString()}, +${pointsReward} points.`);
    }
    return { dmg, counter, bossHpLeft: Math.max(0, remaining), slain, reward, pointsReward };
  },
});

// ===== 16. BUG BOUNTY =====
export const submitBugReport = mutation({
  args: { title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (args.title.trim().length < 5 || args.body.trim().length < 10) throw new Error("Give us more detail (title 5+, body 10+ chars)");
    const recent = await ctx.db.query("bugReports").filter((q: any) => q.eq(q.field("playerId"), player._id)).collect();
    const last = recent.sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
    if (last && nowMs() - last.createdAt < 60_000) throw new Error("Please wait a minute between reports");
    await ctx.db.insert("bugReports", {
      playerId: player._id, playerName: player.nickname || player.username || "Unknown",
      title: args.title.trim(), body: args.body.trim(), status: "open", reward: 0, createdAt: nowMs(),
    });
    return { ok: true };
  },
});

export const claimBugReward = mutation({
  args: { reportId: v.id("bugReports"), reward: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report || report.playerId !== player._id) throw new Error("Report not found");
    if (report.status !== "resolved") throw new Error("Only resolved reports pay out");
    const reward = Math.min(5_000_000, Math.max(0, Math.floor(args.reward)));
    await ctx.db.patch(player._id, {
      money: n(player.money, 0) + reward,
      bugBountiesClaimed: n((player as any).bugBountiesClaimed, 0) + 1,
    } as any);
    await ctx.db.patch(args.reportId, { status: "rewarded", reward } as any);
    return { reward };
  },
});

export const getBugReports = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const mine = await ctx.db.query("bugReports").filter((q: any) => q.eq(q.field("playerId"), player._id)).collect();
    return { mine: mine.sort((a: any, b: any) => b.createdAt - a.createdAt) };
  },
});

export const setBugStatus = mutation({
  args: { reportId: v.id("bugReports"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.reportId, { status: args.status } as any);
    return { ok: true };
  },
});

export const getAllBugReports = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("bugReports").collect();
    return all.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// ===== 17. FEEDBACK BOARD =====
export const submitFeedback = mutation({
  args: { title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (args.title.trim().length < 5 || args.body.trim().length < 10) throw new Error("Title 5+ chars, description 10+ chars");
    const recent = await ctx.db.query("feedbackPosts").filter((q: any) => q.eq(q.field("playerId"), player._id)).collect();
    const last = recent.sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
    if (last && nowMs() - last.createdAt < 60_000) throw new Error("Please wait a minute between posts");
    await ctx.db.insert("feedbackPosts", {
      playerId: player._id, playerName: player.nickname || player.username || "Unknown",
      title: args.title.trim(), body: args.body.trim(), votes: 0, status: "open", createdAt: nowMs(),
    });
    return { ok: true };
  },
});

export const getFeedbackBoard = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    const posts = await ctx.db.query("feedbackPosts").collect();
    const votes = await ctx.db.query("feedbackVotes").withIndex("by_player", (q: any) => q.eq("playerId", player._id)).collect();
    const votedIds = new Set(votes.map((v) => v.postId));
    return {
      posts: posts
        .sort((a: any, b: any) => n(b.votes, 0) - n(a.votes, 0) || b.createdAt - a.createdAt)
        .slice(0, 50)
        .map((p: any) => ({ ...p, voted: votedIds.has(p._id) })),
      myVotes: votes.length,
    };
  },
});

export const upvoteFeedback = mutation({
  args: { postId: v.id("feedbackPosts") },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    const existing = await ctx.db.query("feedbackVotes").withIndex("by_player", (q: any) => q.eq("playerId", player._id)).collect();
    if (existing.some((v) => v.postId === args.postId)) throw new Error("Already voted");
    if (existing.length >= 10) throw new Error("Max 10 votes");
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    await ctx.db.insert("feedbackVotes", { playerId: player._id, postId: args.postId, createdAt: nowMs() });
    await ctx.db.patch(args.postId, { votes: n(post.votes, 0) + 1 } as any);
    return { votes: n(post.votes, 0) + 1 };
  },
});

export const setFeedbackStatus = mutation({
  args: { postId: v.id("feedbackPosts"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.postId, { status: args.status } as any);
    return { ok: true };
  },
});

// ===== 18. ADMIN ECONOMY HEAT-MAP =====
export const getEconomyHeatmap = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = nowMs();
    const dayAgo = now - DAY;
    const [users, crimes, fights, casinoRounds] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("crimes").withIndex("by_timestamp", (q: any) => q.gte("timestamp", dayAgo)).collect(),
      ctx.db.query("fights").withIndex("by_timestamp", (q: any) => q.gte("timestamp", dayAgo)).collect(),
      ctx.db.query("casinoRounds").collect(),
    ]);
    const totalMoney = users.reduce((s, u: any) => s + n(u.money, 0), 0);
    const totalBank = users.reduce((s, u: any) => s + n(u.bank, 0) + n(u.interestBank, 0) + n(u.swissBank, 0), 0);
    const totalPoints = users.reduce((s, u: any) => s + n(u.points, 0), 0);
    const moneyCreated24h = crimes.reduce((s, c: any) => s + n(c.moneyEarned, 0), 0) + fights.reduce((s, f: any) => s + n(f.moneyStolen, 0), 0);
    const casinoFlow = casinoRounds.filter((r: any) => r.timestamp > dayAgo).reduce((s, r: any) => s + n(r.net, 0), 0);
    // Suspicious accounts: enormous cash relative to level
    const flagged = users
      .filter((u: any) => n(u.money, 0) > 500_000_000_000 || (n(u.money, 0) + n(u.bank, 0) > 1_000_000_000_000))
      .map((u: any) => ({ name: u.nickname || u.username || "Unknown", level: n(u.level, 1), money: n(u.money, 0), bank: n(u.bank, 0), points: n(u.points, 0) }))
      .slice(0, 25);
    const topGainers = [...users]
      .map((u: any) => ({ name: u.nickname || u.username || "Unknown", gained24h: n((u as any).totalEarned, 0), money: n(u.money, 0), level: n(u.level, 1) }))
      .sort((a: any, b: any) => b.gained24h - a.gained24h)
      .slice(0, 15);
    const avgMoney = users.length ? Math.round(totalMoney / users.length) : 0;
    return {
      totals: { players: users.length, money: totalMoney, bank: totalBank, points: totalPoints, avgMoney },
      flows: { moneyCreated24h, casinoFlow24h: casinoFlow, crimes24h: crimes.length, fights24h: fights.length },
      flagged,
      topGainers,
      generatedAt: now,
    };
  },
});
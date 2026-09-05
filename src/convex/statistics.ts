import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const n = (x: any) => (typeof x === "number" && isFinite(x) ? x : 0);

// Rank ladder used across the game (level → rank name).
export const RANKS: { min: number; name: string }[] = [
  { min: 90, name: "Shadow Emperor" }, { min: 80, name: "Godfather" },
  { min: 70, name: "Don" }, { min: 60, name: "Underboss" },
  { min: 50, name: "Capo" }, { min: 40, name: "Made Man" },
  { min: 30, name: "Soldier" }, { min: 20, name: "Associate" },
  { min: 10, name: "Street Thug" }, { min: 5, name: "Hustler" },
  { min: 1, name: "Hobo" },
];
export function rankName(level: number): string {
  const hit = RANKS.find((r) => (level ?? 0) >= r.min);
  return hit ? hit.name : "Hobo";
}

function sum(list: any[], field: string) {
  return list.reduce((s: number, p: any) => s + n(p[field]), 0);
}

// ───────────────────────── GLOBAL STATISTICS ─────────────────────────
export const getGlobalStatistics = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const reg = users.filter((u: any) => u.nickname || u.username || u.name);
    const alive = reg.filter((u: any) => !u.isDead);
    const dead = reg.filter((u: any) => u.isDead);
    const vehicles = await ctx.db.query("vehicles").collect();

    const countRarity = (r: string) => vehicles.filter((x: any) => (x.rarity ?? "") === r).length;
    const swiss = sum(reg, "swissBank");
    const banked = sum(reg, "bank") + sum(reg, "interestBank");

    return {
      updatedAt: Date.now(),
      global: {
        totalUsers: reg.length,
        aliveUsers: alive.length,
        deadUsers: dead.length,
        totalMoney: sum(reg, "money"),
        swissedMoney: swiss,
        bankedMoney: banked,
      },
      wealth: {
        totalMoney: sum(reg, "money"),
        bankedMoney: banked,
        swissedMoney: swiss,
        points: sum(reg, "points"),
        igCoins: sum(reg, "coins"),
        bullets: sum(reg, "bullets"),
      },
      vehicle: {
        total: vehicles.length,
        rares: countRarity("rare"),
        epics: countRarity("epic"),
        legendaries: countRarity("legendary"),
        commons: countRarity("common"),
        stolen: vehicles.filter((x: any) => x.stolen).length,
        totalBulletsMelted: sum(reg, "totalBulletsMelted"),
      },
      ranking: {
        totalCrimes: sum(reg, "totalCrimes"),
        carsStolen: sum(reg, "totalGta"),
        totalHeists: sum(reg, "totalHeists"),
        totalOCs: sum(reg, "totalOC"),
        totalBusts: sum(reg, "totalBusts"),
        totalAssassinations: sum(reg, "totalAssassinations"),
        packsOpened: sum(reg, "packsOpened"),
        totalLevels: sum(reg, "level"),
      },
      gambling: {
        bettingProfit: sum(reg, "totalBettingProfit"),
        stockProfit: sum(reg, "totalStockProfit"),
        supplyProfit: sum(reg, "totalSupplyProfit"),
        casinoWins: sum(reg, "totalCasinoWins"),
        betsPlaced: sum(reg, "totalBets"),
      },
      offence: {
        usersKilled: sum(reg, "totalKills"),
        bodyguardsKilled: sum(reg, "bodyguardKills"),
        bodyguardsBought: sum(reg, "totalBodyguards"),
        bulletsFired: sum(reg, "bulletsFired"),
        timesTravelled: sum(reg, "timesTravelled"),
      },
    };
  },
});

// ───────────────────────── DEATH LIST ─────────────────────────
export const getRecentDeaths = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(60, args.limit ?? 30);
    const logs = await ctx.db
      .query("combatLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", Date.now() - 7 * 86400000))
      .order("desc")
      .collect();
    const byId = new Map<string, any>();
    for (const log of logs) {
      if (!byId.has(log.attackerId)) {
        const u = await ctx.db.get(log.attackerId);
        if (u) byId.set(log.attackerId, u);
      }
      if (!byId.has(log.defenderId)) {
        const u = await ctx.db.get(log.defenderId);
        if (u) byId.set(log.defenderId, u);
      }
    }
    const out = logs
      .filter((l: any) => l.winnerId)
      .slice(0, limit)
      .map((l: any) => {
        const killer = byId.get(l.attackerId);
        const victim = byId.get(l.defenderId);
        return {
          ts: l.timestamp ?? 0,
          type: l.type ?? "attack",
          killer: killer?.nickname || killer?.username || killer?.name || "Unknown",
          killerLv: n(killer?.level),
          victim: victim?.nickname || victim?.username || victim?.name || "Unknown",
          victimLv: n(victim?.level),
          damage: n(l.attackerDamage),
        };
      });
    return out;
  },
});

// ───────────────────────── PERSONAL STATISTICS ─────────────────────────
export const getPersonalStatistics = query({
  args: { username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    let target: any = await ctx.db.get(userId);
    const want = (args.username ?? "").trim().toLowerCase();
    if (want) {
      const users = await ctx.db.query("users").collect();
      target =
        users.find(
          (u: any) =>
            String(u.nickname ?? u.username ?? u.name ?? "")
              .toLowerCase()
              .includes(want),
        ) ?? target;
    }
    if (!target) return null;
    const p = target;
    const lv = n(p.level);
    const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

    const rows: { label: string; value: string }[] = [
      { label: "Username", value: p.nickname || p.username || p.name || "Unknown" },
      { label: "Rank", value: rankName(lv) },
      { label: "Rank XP", value: `${n(p.experience).toLocaleString()}` },
      { label: "Prestige", value: `${n(p.prestige)}` },
      { label: "Location", value: p.location || "Zenith" },
      { label: "Cash", value: `$${n(p.money).toLocaleString()}` },
      { label: "Bank", value: `$${(n(p.bank) + n(p.interestBank)).toLocaleString()}` },
      { label: "Swiss", value: `$${n(p.swissBank).toLocaleString()}` },
      { label: "Points", value: `${n(p.points).toLocaleString()} Points` },
      { label: "Points Spent", value: `${n(p.pointsSent).toLocaleString()} Points` },
      { label: "IG Coins", value: `${n(p.coins)}` },
      { label: "Bullets", value: `${n(p.bullets).toLocaleString()}` },
      { label: "Membership", value: p.membership ?? "Free" },
      { label: "Gun", value: `⚔️ ${n(p.attack)}` },
      { label: "Protection", value: `🛡️ ${n(p.defense)}` },
      { label: "Interest Bank Profit", value: `$${n(p.interestCollections).toLocaleString()}` },
      { label: "Total Crimes", value: `${n(p.totalCrimes).toLocaleString()}` },
      { label: "Crimes Earnings", value: `$${n(p.crimesEarnings ?? p.totalEarned).toLocaleString()}` },
      { label: "Total GTAs", value: `${n(p.totalGta).toLocaleString()}` },
      { label: "Total Heists", value: `${n(p.totalHeists).toLocaleString()}` },
      { label: "Total OCs", value: `${n(p.totalOC).toLocaleString()}` },
      { label: "Total Busts", value: `${n(p.totalBusts).toLocaleString()}` },
      { label: "Total Kills", value: `💀 ${n(p.totalKills).toLocaleString()}` },
      { label: "Assassination Kills", value: `${n(p.totalAssassinations).toLocaleString()}` },
      { label: "Total Bodyguards Purchased", value: `${n(p.totalBodyguards).toLocaleString()}` },
      { label: "Times Traveled", value: `${n(p.timesTravelled).toLocaleString()}` },
      { label: "Total Melted", value: `${n(p.totalBulletsMelted).toLocaleString()}` },
      { label: "Casino Wins", value: `${n(p.totalCasinoWins).toLocaleString()}` },
      { label: "Packs Opened", value: `${n(p.packsOpened).toLocaleString()}` },
      { label: "Supply Running Profit", value: `$${n(p.totalSupplyProfit).toLocaleString()}` },
      { label: "Stock market profit", value: `$${(n(p.totalStockProfit) + n(p.currentStockProfit)).toLocaleString()}` },
      { label: "Betting profit", value: `$${n(p.totalBettingProfit).toLocaleString()}` },
      { label: "Total Bets", value: `${n(p.totalBets).toLocaleString()}` },
      { label: "Bets Won", value: `${n(p.betsWon).toLocaleString()}` },
      { label: "Bets Lost", value: `${n(p.betsLost).toLocaleString()}` },
      { label: "Success rate", value: `${pct(n(p.totalCrimes), n(p.totalCrimes) + n(p.failedCrimes))}%` },
    ];
    return { rows, isSelf: target._id === userId };
  },
});

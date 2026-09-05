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

// OC job board — each crew slots in behind one job.
export const OC_JOBS = [
  { id: "job_grocery_heist", icon: "🛒", name: "Grocery Depot Heist", level: 5, cost: 3_000_000, min: 4_500_000, max: 6_500_000, base: 0.62 },
  { id: "job_armored_truck", icon: "🚛", name: "Armored Truck Ambush", level: 10, cost: 8_000_000, min: 12_000_000, max: 18_000_000, base: 0.55 },
  { id: "job_casino_floor", icon: "🎰", name: "Casino Floor Sweep", level: 15, cost: 18_000_000, min: 26_000_000, max: 40_000_000, base: 0.50 },
  { id: "job_port_raid", icon: "⚓", name: "Port Container Raid", level: 20, cost: 35_000_000, min: 52_000_000, max: 78_000_000, base: 0.45 },
  { id: "job_bank_branch", icon: "🏦", name: "Federal Bank Branch", level: 25, cost: 60_000_000, min: 90_000_000, max: 135_000_000, base: 0.42 },
  { id: "job_art_vault", icon: "🖼️", name: "Art Vault Job", level: 30, cost: 95_000_000, min: 145_000_000, max: 220_000_000, base: 0.38 },
  { id: "job_central_vault", icon: "💎", name: "Central Vault Cracking", level: 40, cost: 160_000_000, min: 250_000_000, max: 380_000_000, base: 0.34 },
  { id: "job_empire_reserve", icon: "👑", name: "Empire Reserve Job", level: 55, cost: 280_000_000, min: 440_000_000, max: 680_000_000, base: 0.30 },
];

const TEAM_MAX = 3;
const TTL_MS = 12 * 60 * 60 * 1000;

async function findPlayerTeam(ctx: any, player: any): Promise<any | null> {
  const rows = await ctx.db.query("ocTeams").collect();
  const mine = rows.find(
    (t: any) =>
      !t.started &&
      t.createdAt > Date.now() - TTL_MS &&
      ((t as any).memberIds ?? []).includes(player._id),
  );
  return mine ?? null;
}

// ─────────────────────────── QUERIES ───────────────────────────
export const getMyOcTeam = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const team = await findPlayerTeam(ctx, player);
    if (!team) return null;
    const ids: string[] = team.memberIds ?? [];
    const members = [];
    for (const id of ids) {
      const u: any = await ctx.db.get(id as any);
      members.push({ id, name: u ? nameOf(u) : "?", level: u?.level ?? 0 });
    }
    return {
      _id: team._id,
      jobIcon: team.jobIcon,
      jobName: team.jobName,
      cost: team.cost,
      rewardMin: team.rewardMin,
      rewardMax: team.rewardMax,
      successBase: team.successBase,
      members,
      isHost: team.hostId === player._id,
      hostName: team.hostName,
      createdAt: team.createdAt,
    };
  },
});

export const listOpenOcTeams = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const rows = await ctx.db.query("ocTeams").collect();
    return rows
      .filter(
        (t: any) =>
          !t.started &&
          t.createdAt > Date.now() - TTL_MS &&
          ((t as any).memberIds ?? []).length < TEAM_MAX &&
          t.hostId !== player._id,
      )
      .sort((a: any, b: any) => a.createdAt - b.createdAt)
      .map((t: any) => ({
        _id: t._id,
        jobIcon: t.jobIcon,
        jobName: t.jobName,
        hostName: t.hostName,
        levelReq: t.levelReq,
        cost: t.cost,
        count: (t.memberIds ?? []).length,
        max: TEAM_MAX,
        createdAt: t.createdAt,
      }));
  },
});

// ─────────────────────────── MUTATIONS ───────────────────────────
export const createOcTeam = mutation({
  args: { jobId: v.string() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const job = OC_JOBS.find((j) => j.id === args.jobId);
    if (!job) throw new Error("Unknown job");
    if ((player.level ?? 0) < job.level)
      throw new Error(`Requires level ${job.level}`);
    if (await findPlayerTeam(ctx, player)) throw new Error("You are already in a crew — leave it first");
    if ((player.money ?? 0) < job.cost)
      throw new Error(`You need $${job.cost.toLocaleString()} to open this job`);

    await ctx.db.insert("ocTeams", {
      hostId: player._id,
      hostName: nameOf(player),
      memberIds: [player._id],
      names: [nameOf(player)],
      jobId: job.id,
      jobName: job.name,
      jobIcon: job.icon,
      levelReq: job.level,
      cost: job.cost,
      rewardMin: job.min,
      rewardMax: job.max,
      successBase: job.base,
      started: false,
      createdAt: Date.now(),
    } as any);
    return { success: true };
  },
});

export const joinOcTeam = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if ((team.memberIds ?? []).length >= TEAM_MAX) throw new Error("Crew is full");
    if (team.hostId === player._id) throw new Error("You host this crew");
    if ((team.memberIds ?? []).includes(player._id)) throw new Error("Already in this crew");
    if ((player.level ?? 0) < team.levelReq) throw new Error(`Requires level ${team.levelReq}`);
    if (await findPlayerTeam(ctx, player)) throw new Error("You are already in a crew — leave it first");

    await ctx.db.patch(args.teamId, {
      memberIds: [...(team.memberIds ?? []), player._id],
      names: [...(team.names ?? []), nameOf(player)],
    } as any);
    return { success: true };
  },
});

export const leaveOcTeam = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    const ids = team.memberIds ?? [];
    const idx = ids.indexOf(player._id);
    if (idx === -1) throw new Error("You are not in this crew");
    if (team.hostId === player._id) {
      await ctx.db.delete(args.teamId);
    } else {
      await ctx.db.patch(args.teamId, {
        memberIds: ids.filter((_: any, i: number) => i !== idx),
        names: (team.names ?? []).filter((_: any, i: number) => i !== idx),
      } as any);
    }
    return { success: true };
  },
});

// Host kicks the crew into action once all three seats are filled.
export const startOcTeam = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (team.hostId !== player._id) throw new Error("Only the host can start the job");
    const ids: string[] = team.memberIds ?? [];
    if (ids.length < TEAM_MAX)
      throw new Error(`Need ${TEAM_MAX - ids.length} more member${TEAM_MAX - ids.length === 1 ? "" : "s"}`);

    // Charge every member their stake.
    const members: any[] = [];
    for (const id of ids) {
      const u: any = await ctx.db.get(id as any);
      if (!u) throw new Error("A crew member no longer exists");
      if ((u.money ?? 0) < team.cost)
        throw new Error(`${nameOf(u)} cannot cover the $${team.cost.toLocaleString()} stake`);
      members.push(u);
    }
    for (const u of members)
      await ctx.db.patch(u._id, { money: (u.money ?? 0) - team.cost } as any);

    // Success chance scales with the crew's combined muscle.
    const avgLevel = members.reduce((s, m) => s + (m.level ?? 0), 0) / members.length;
    const chance = Math.min(0.85, (team.successBase ?? 0.5) + avgLevel * 0.0025 + members.length * 0.02);
    const win = Math.random() < chance;
    const rewardEach = win
      ? Math.floor((team.rewardMin + Math.random() * (team.rewardMax - team.rewardMin)) / TEAM_MAX)
      : 0;
    const xpEach = win ? 40 + Math.floor(avgLevel * 0.4) : Math.floor(20 + avgLevel * 0.15);

    for (const u of members) {
      const patch: any = {
        totalOC: (u.totalOC ?? 0) + 1,
        ocWins: ((u as any).ocWins ?? 0) + (win ? 1 : 0),
        experience: (u.experience ?? 0) + xpEach,
      };
      if (win) patch.money = (u.money ?? 0) + rewardEach;
      await ctx.db.patch(u._id, patch as any);
    }

    await ctx.db.patch(args.teamId, { started: true, startedAt: Date.now() } as any);
    return {
      success: true,
      win,
      chance,
      rewardEach,
      xpEach,
      teamName: `${team.jobIcon} ${team.jobName}`,
    };
  },
});

// Crew hosts & members can check what their seat is worth.
export const getOcStats = query({
  args: {},
  handler: async (ctx) => {
    const player: any = await getCurrentUser(ctx);
    return {
      totalOC: player.totalOC ?? 0,
      ocWins: (player as any).ocWins ?? 0,
      ocProfit: (player as any).ocProfit ?? 0,
      hostRank: "Crew Leader",
    };
  },
});

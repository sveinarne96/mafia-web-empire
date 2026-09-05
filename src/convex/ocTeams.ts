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
const CHAT_MAX = 60;
const CHAT_MAX_LEN = 160;
const IDLE_KICK_MS = 5 * 60 * 1000; // seated member silent this long gets auto-kicked on a ping
const AUTO_LAUNCH_SECONDS = 45;

// Keep a rolling log on the team doc so every member's reactive query refreshes.
function pushChat(team: any, entry: any): any[] {
  const chat = Array.isArray(team.chat) ? [...team.chat] : [];
  chat.push(entry);
  return chat.slice(-CHAT_MAX);
}

// Aligned per-member activity stamps (same order as memberIds).
function seenAt(team: any, memberId: any, ts: number): number[] {
  const ids: any[] = team.memberIds ?? [];
  const seen = alignSeen(team);
  const idx = ids.indexOf(memberId);
  if (idx === -1) return seen;
  seen[idx] = ts;
  return seen;
}

function alignSeen(team: any): number[] {
  const ids: any[] = team.memberIds ?? [];
  const seen = Array.isArray(team.seen) ? [...team.seen] : [];
  const base = team.createdAt ?? Date.now();
  while (seen.length < ids.length) seen.push(base);
  return seen.slice(0, ids.length);
}

// Remove seated members who went idle (silent + not ready) past the threshold.
// Host and the acting player are never swept. Kicks are index-safe (ordered
// removals), disarm any armed auto-launch, and log a system line each.
function sweepIdle(team: any, actorId: any): number {
  const ids: any[] = [...(team.memberIds ?? [])];
  const seen = alignSeen(team);
  const names: any[] = [...(team.names ?? [])];
  const ready: any[] = [...(team.memberReadyIds ?? [])];
  const chat: any[] = Array.isArray(team.chat) ? [...team.chat] : [];
  const now = Date.now();
  const kickIdx: number[] = [];
  ids.forEach((id, i) => {
    if (id !== team.hostId && id !== actorId && !ready.includes(id) && now - seen[i] > IDLE_KICK_MS) {
      kickIdx.push(i);
    }
  });
  if (kickIdx.length === 0) return 0;
  const keep = ids.filter((_, i) => !kickIdx.includes(i));
  team.memberIds = keep;
  team.names = names.filter((_, i) => !kickIdx.includes(i));
  team.seen = seen.filter((_, i) => !kickIdx.includes(i));
  team.memberReadyIds = ready.filter((id) => keep.includes(id));
  team.launchAt = undefined;
  team.autoLaunch = false;
  for (const i of kickIdx) {
    const nm = names[i] ?? "A member";
    chat.push({
      fromId: ids[i],
      fromName: nm,
      text: `🚫 ${nm} was idle too long and was auto-kicked.`,
      system: true,
      at: Date.now(),
    });
  }
  team.chat = chat.slice(-CHAT_MAX);
  return kickIdx.length;
}

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
    const readyIds: string[] = team.memberReadyIds ?? [];
    const seen = alignSeen(team);
    return {
      _id: team._id,
      jobIcon: team.jobIcon,
      jobName: team.jobName,
      cost: team.cost,
      rewardMin: team.rewardMin,
      rewardMax: team.rewardMax,
      successBase: team.successBase,
      members: members.map((m, i) => ({ ...m, seenAt: seen[i] ?? team.createdAt ?? 0 })),
      isHost: team.hostId === player._id,
      hostId: team.hostId,
      hostName: team.hostName,
      createdAt: team.createdAt,
      // Lobby extras
      readyIds,
      chat: (team.chat ?? []).slice(-CHAT_MAX),
      lastPingAt: team.lastPingAt ?? 0,
      autoLaunch: !!team.autoLaunch,
      launchAt: team.launchAt ?? 0,
      idleKickMs: IDLE_KICK_MS,
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
      memberReadyIds: [player._id],
      seen: [Date.now()],
      chat: [],
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
      seen: [...alignSeen(team), Date.now()],
      launchAt: undefined,
      autoLaunch: false,
      chat: pushChat(team, {
        fromId: player._id,
        fromName: nameOf(player),
        text: `${nameOf(player)} joined the crew.`,
        system: true,
        at: Date.now(),
      }),
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
      const keep = ids.filter((_: any, i: number) => i !== idx);
      const seenBefore = alignSeen(team);
      await ctx.db.patch(args.teamId, {
        memberIds: keep,
        names: (team.names ?? []).filter((_: any, i: number) => i !== idx),
        memberReadyIds: (team.memberReadyIds ?? []).filter((id: any) => id !== player._id),
        seen: seenBefore.filter((_: number, i: number) => i !== idx),
        launchAt: undefined,
        autoLaunch: false,
        chat: pushChat(team, {
          fromId: player._id,
          fromName: nameOf(player),
          text: `${nameOf(player)} left the crew.`,
          system: true,
          at: Date.now(),
        }),
      } as any);
    }
    return { success: true };
  },
});

// Toggle your own readiness for the upcoming job.
export const setOcReady = mutation({
  args: { teamId: v.id("ocTeams"), ready: v.boolean() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (!(team.memberIds ?? []).includes(player._id)) throw new Error("You are not in this crew");
    if (team.hostId === player._id) throw new Error("The host is always ready — you launch the job");
    const readyIds: string[] = team.memberReadyIds ?? [];
    const has = readyIds.includes(player._id);
    if (args.ready === has) return { success: true, ready: has };

    const next = args.ready ? [...readyIds, player._id] : readyIds.filter((id) => id !== player._id);
    await ctx.db.patch(args.teamId, {
      memberReadyIds: next,
      seen: seenAt(team, player._id, Date.now()),
      // Readiness changed → any armed auto-launch is void; host re-arms.
      launchAt: undefined,
      autoLaunch: false,
      chat: pushChat(team, {
        fromId: player._id,
        fromName: nameOf(player),
        text: args.ready ? `${nameOf(player)} is READY to roll. ✅` : `${nameOf(player)} is standing by — not ready yet.`,
        system: true,
        at: Date.now(),
      }),
    } as any);
    return { success: true, ready: args.ready };
  },
});

// Loud "sound off" ping that every member sees in the crew chat.
export const pingOcCrew = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (!(team.memberIds ?? []).includes(player._id)) throw new Error("You are not in this crew");

    // Auto-kick seated members who have been idle (silent + not ready).
    const kicked = sweepIdle(team, player._id);

    await ctx.db.patch(args.teamId, {
      memberIds: team.memberIds,
      names: team.names,
      seen: team.seen,
      memberReadyIds: team.memberReadyIds,
      launchAt: undefined,
      autoLaunch: false,
      lastPingAt: Date.now(),
      chat: [
        ...(team.chat ?? []),
        {
          fromId: player._id,
          fromName: nameOf(player),
          text: `🔔 ${nameOf(player)} pings the crew — sound off if you're ready!`,
          system: true,
          at: Date.now(),
        },
      ].slice(-CHAT_MAX),
    } as any);
    return { success: true, kicked };
  },
});

// Crew chat: only current members can talk while the lobby is open.
export const sendOcChat = mutation({
  args: { teamId: v.id("ocTeams"), text: v.string() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew chat is closed");
    if (!(team.memberIds ?? []).includes(player._id)) throw new Error("You are not in this crew");
    const text = args.text.trim().slice(0, CHAT_MAX_LEN);
    if (!text) throw new Error("Say something first");

    await ctx.db.patch(args.teamId, {
      seen: seenAt(team, player._id, Date.now()),
      chat: pushChat(team, {
        fromId: player._id,
        fromName: nameOf(player),
        text,
        system: false,
        at: Date.now(),
      }),
    } as any);
    return { success: true };
  },
});

// Host arms the countdown: when every seat is full AND ready, the job fires
// itself AUTO_LAUNCH_SECONDS later. Any roster/readiness change disarms it.
export const armAutoLaunch = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (team.hostId !== player._id) throw new Error("Only the host can arm auto-launch");
    const ids: string[] = team.memberIds ?? [];
    if (ids.length < TEAM_MAX)
      throw new Error(`Need ${TEAM_MAX - ids.length} more member${TEAM_MAX - ids.length === 1 ? "" : "s"}`);
    const readyIds: string[] = team.memberReadyIds ?? [];
    const notReady = ids.filter((id) => id !== team.hostId && !readyIds.includes(id));
    if (notReady.length > 0) throw new Error("Everyone must mark READY before arming auto-launch");

    await ctx.db.patch(args.teamId, {
      autoLaunch: true,
      launchAt: Date.now() + AUTO_LAUNCH_SECONDS * 1000,
      seen: seenAt(team, player._id, Date.now()),
      chat: pushChat(team, {
        fromId: player._id,
        fromName: nameOf(player),
        text: `⏱️ Auto-launch armed — ${AUTO_LAUNCH_SECONDS}s countdown starts now. Nobody backs out!`,
        system: true,
        at: Date.now(),
      }),
    } as any);
    return { success: true, launchAt: Date.now() + AUTO_LAUNCH_SECONDS * 1000 };
  },
});

export const disarmAutoLaunch = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (!(team.memberIds ?? []).includes(player._id)) throw new Error("You are not in this crew");
    await ctx.db.patch(args.teamId, {
      autoLaunch: false,
      launchAt: undefined,
      seen: seenAt(team, player._id, Date.now()),
    } as any);
    return { success: true };
  },
});

// Host kicks the crew into action once all three seats are filled AND ready.
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

    // Every filled seat must have sounded ready before the job launches.
    const readyIds: string[] = team.memberReadyIds ?? [];
    const notReady = ids.filter((id) => id !== team.hostId && !readyIds.includes(id));
    if (notReady.length > 0) {
      const names = notReady.map((id) => {
        const m = (team.names ?? [])[ids.indexOf(id)];
        return m ?? "a member";
      });
      throw new Error(`Waiting on ${names.join(", ")} — they need to mark READY`);
    }

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

    await ctx.db.patch(args.teamId, {
      started: true,
      startedAt: Date.now(),
      autoLaunch: false,
      launchAt: undefined,
    } as any);
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

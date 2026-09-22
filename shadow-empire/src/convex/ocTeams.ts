import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { OC_JOBS, OC_ROLES, EXECUTE_PHASE_SECONDS, computeOcChance } from "../data/ocJobs";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

const nameOf = (p: any) => p?.nickname || p?.username || p?.name || "Unknown";

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
    // Live odds preview with the roles as picked right now.
    let odds: number | null = null;
    if (members.length > 0) {
      try { odds = computeOcChance(team, members); } catch { odds = null; }
    }
    return {
      _id: team._id,
      jobIcon: team.jobIcon,
      jobName: team.jobName,
      jobId: team.jobId,
      cost: team.cost,
      rewardMin: team.rewardMin,
      rewardMax: team.rewardMax,
      successBase: team.successBase,
      members: members.map((m, i) => ({ ...m, seenAt: seen[i] ?? team.createdAt ?? 0, role: (team.roles ?? [])[i] ?? null })),
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
      // Role phase + execute phase
      roles: team.roles ?? [],
      jobPhase: team.jobPhase ?? "prep",
      executesAt: team.executesAt ?? 0,
      odds,
      jobResult: team.jobResult ?? null,
      executeSeconds: EXECUTE_PHASE_SECONDS,
    };
  },
});

// Recent resolved scores for the OC board.
export const getOcHistory = query({
  args: {},
  handler: async (ctx) => {
    const player: any = await getCurrentUser(ctx);
    const rows = await ctx.db
      .query("ocTeams")
      .withIndex("by_created", (q: any) => q.gt("createdAt", Date.now() - 24 * 3600_000))
      .collect();
    return rows
      .filter((t: any) => t.started && t.jobResult)
      .sort((a: any, b: any) => (b.jobResult?.at ?? 0) - (a.jobResult?.at ?? 0))
      .slice(0, 12)
      .map((t: any) => ({
        _id: t._id,
        jobIcon: t.jobIcon,
        jobName: t.jobName,
        win: t.jobResult.win,
        rewardEach: t.jobResult.rewardEach,
        crewSize: (t.memberIds ?? []).length,
        at: t.jobResult.at,
        iWasIn: (t.memberIds ?? []).includes(player?._id),
      }));
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

// Pick (or change) your specialist role for the current job.
export const setOcRole = mutation({
  args: { teamId: v.id("ocTeams"), role: v.string() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (!(team.memberIds ?? []).includes(player._id)) throw new Error("You are not in this crew");
    if (team.jobPhase === "execute") throw new Error("Too late — the job is already going down");
    if (!OC_ROLES[args.role]) throw new Error("Unknown role");

    const ids: string[] = team.memberIds ?? [];
    const idx = ids.indexOf(player._id);
    const roles: string[] = [...((team.roles ?? []) as string[])];
    while (roles.length < ids.length) roles.push("");
    const previous = roles[idx] || "None";
    roles[idx] = args.role;

    await ctx.db.patch(args.teamId, {
      roles,
      seen: seenAt(team, player._id, Date.now()),
      chat: pushChat(team, {
        fromId: player._id,
        fromName: nameOf(player),
        text: `${nameOf(player)} took the ${OC_ROLES[args.role].name} role. ${OC_ROLES[args.role].icon}`,
        system: true,
        at: Date.now(),
      }),
    } as any);
    return { success: true, role: args.role, previous };
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

// Host arms the countdown: when every seat is full AND ready, the job moves
// into the execute phase. Any roster/readiness change disarms it.
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

// Begin the execute phase: a short synchronized window every member rides
// out together — then anyone (not just the host) can resolve the score.
export const beginOcExecute = mutation({
  args: { teamId: v.id("ocTeams") },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const team: any = await ctx.db.get(args.teamId);
    if (!team || team.started) throw new Error("Crew not found");
    if (!(team.memberIds ?? []).includes(player._id)) throw new Error("You are not in this crew");
    if (team.jobPhase === "execute") return { success: true };
    const ids: string[] = team.memberIds ?? [];
    if (ids.length < TEAM_MAX)
      throw new Error(`Need ${TEAM_MAX - ids.length} more member${TEAM_MAX - ids.length === 1 ? "" : "s"}`);
    const readyIds: string[] = team.memberReadyIds ?? [];
    const notReady = ids.filter((id) => id !== team.hostId && !readyIds.includes(id));
    if (notReady.length > 0) throw new Error("Everyone must be READY before the job goes down");

    await ctx.db.patch(args.teamId, {
      jobPhase: "execute",
      executesAt: Date.now() + EXECUTE_PHASE_SECONDS * 1000,
      seen: seenAt(team, player._id, Date.now()),
      chat: pushChat(team, {
        fromId: player._id,
        fromName: nameOf(player),
        text: `🚨 THE JOB IS ON — masks on, ${EXECUTE_PHASE_SECONDS}s. Resolve it when the timer dies.`,
        system: true,
        at: Date.now(),
      }),
    } as any);
    return { success: true, executesAt: Date.now() + EXECUTE_PHASE_SECONDS * 1000 };
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
    // During the execute phase any crew member can resolve the score; before
    // that, only the host can launch.
    const inExecute = team.jobPhase === "execute";
    if (team.hostId !== player._id && !inExecute)
      throw new Error("Only the host can start the job");
    const ids: string[] = team.memberIds ?? [];
    if (ids.length < TEAM_MAX)
      throw new Error(`Need ${TEAM_MAX - ids.length} more member${TEAM_MAX - ids.length === 1 ? "" : "s"}`);

    // Every filled seat must have sounded ready before the job launches
    // (skipped during the execute phase — readiness was checked at go-time).
    if (!inExecute) {
      const readyIds: string[] = team.memberReadyIds ?? [];
      const notReady = ids.filter((id) => id !== team.hostId && !readyIds.includes(id));
      if (notReady.length > 0) {
        const names = notReady.map((id) => {
          const m = (team.names ?? [])[ids.indexOf(id)];
          return m ?? "a member";
        });
        throw new Error(`Waiting on ${names.join(", ")} — they need to mark READY`);
      }
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

    // Success chance: crew muscle + role synergy (shared with the lobby preview).
    const chance = computeOcChance(team, members);
    const win = Math.random() < chance;
    const rewardEach = win
      ? Math.floor((team.rewardMin + Math.random() * (team.rewardMax - team.rewardMin)) / TEAM_MAX)
      : 0;
    const avgLevel = members.reduce((s, m) => s + (m.level ?? 0), 0) / Math.max(1, members.length);
    const xpEach = win ? 40 + Math.floor(avgLevel * 0.4) : Math.floor(20 + avgLevel * 0.15);

    for (const u of members) {
      const patch: any = {
        totalOC: (u.totalOC ?? 0) + 1,
        ocWins: ((u as any).ocWins ?? 0) + (win ? 1 : 0),
        experience: (u.experience ?? 0) + xpEach,
      };
      if (win) {
        patch.money = (u.money ?? 0) + rewardEach;
        patch.ocProfit = ((u as any).ocProfit ?? 0) + rewardEach - team.cost;
      } else {
        patch.ocProfit = ((u as any).ocProfit ?? 0) - team.cost;
      }
      await ctx.db.patch(u._id, patch as any);
    }

    const jobResult = { win, rewardEach, xpEach, jobName: team.jobName, at: Date.now() };
    await ctx.db.patch(args.teamId, {
      started: true,
      startedAt: Date.now(),
      autoLaunch: false,
      launchAt: undefined,
      jobPhase: "done",
      jobResult,
    } as any);
    return {
      success: true,
      win,
      chance,
      rewardEach,
      xpEach,
      teamName: `${team.jobIcon} ${team.jobName}`,
      favoredRoles: (OC_JOBS.find((j) => j.id === team.jobId) ?? ({} as any)).roles ?? [],
      roles: team.roles ?? [],
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

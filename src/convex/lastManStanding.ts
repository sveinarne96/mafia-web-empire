import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Player not found");
  return { userId, user };
}

async function getActiveEvent(ctx: any) {
  const events = await ctx.db.query("lastManStanding").collect();
  const active = events.find((e: any) => e.isActive);
  return active ?? null;
}

export const getCurrentEvent = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("lastManStanding").collect();
    events.sort((a: any, b: any) => b.startDate - a.startDate);
    return events[0] ?? null;
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const participants = await ctx.db.query("lmsParticipants").collect();
    participants.sort((a: any, b: any) => b.score - a.score || b.kills - a.kills);
    return participants.slice(0, 50);
  },
});

export const getMyStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const users = await ctx.db.query("users").collect();
    const user = users.find((u: any) => u.tokenIdentifier === identity.tokenIdentifier || u.username === identity.name);
    if (!user) return null;
    const participant = await ctx.db
      .query("lmsParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .unique();
    return participant ?? null;
  },
});

export const getRecentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("lmsEvents").order("desc").take(args.limit ?? 30);
  },
});

export const getAliveCount = query({
  args: {},
  handler: async (ctx) => {
    const alive = await ctx.db
      .query("lmsParticipants")
      .withIndex("by_active", (q: any) => q.eq("alive", true))
      .collect();
    return alive.length;
  },
});

export const startEvent = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await getCurrentUser(ctx);
    if ((user as any).role !== "admin") throw new Error("Admin only!");

    const existing = await ctx.db.query("lastManStanding").collect();
    const active = existing.find((e: any) => e.isActive);
    if (active) throw new Error("An event is already active!");

    const now = Date.now();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

    const eventId = await ctx.db.insert("lastManStanding", {
      seasonId: `lms_${now}`,
      startDate: now,
      endDate: now + TWO_DAYS,
      isActive: true,
      totalPlayers: 0,
      eliminatedPlayers: 0,
      currentRound: 1,
      totalRounds: 10,
      prizePool: 0,
    });

    await ctx.db.insert("lmsEvents", {
      seasonId: `lms_${now}`,
      eventType: "event_start",
      message: "🏆 LAST MAN STANDING has begun! The purge lasts 2 days! Enter if you dare!",
      timestamp: now,
      round: 1,
    });

    return { eventId, endDate: now + TWO_DAYS };
  },
});

export const joinEvent = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await getCurrentUser(ctx);

    const active = await getActiveEvent(ctx);
    if (!active) throw new Error("No active LMS event!");
    if (user.inPrison) throw new Error("You can't join from prison!");
    if (user.isDead) throw new Error("You're dead! Respawn first.");

    const existing = await ctx.db
      .query("lmsParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();

    if (existing) {
      if (existing.alive) throw new Error("You're already in the fight!");
      await ctx.db.patch(existing._id, {
        alive: true,
        deaths: existing.deaths + 1,
        eliminationRound: undefined,
        score: 0,
        kills: 0,
        streak: 0,
      });
    } else {
      await ctx.db.insert("lmsParticipants", {
        userId,
        nickname: user.nickname || "Unknown",
        level: user.level || 1,
        alive: true,
        kills: 0,
        deaths: 0,
        score: 0,
        joinedAt: Date.now(),
        bountyPlaced: 0,
        streak: 0,
      });
    }

    await ctx.db.patch(active._id, { totalPlayers: active.totalPlayers + 1 });
    await ctx.db.insert("lmsEvents", {
      seasonId: active.seasonId,
      eventType: "join",
      message: `${user.nickname || "Unknown"} has entered the arena!`,
      playerId: userId,
      playerName: user.nickname || "Unknown",
      timestamp: Date.now(),
      round: active.currentRound,
    });

    return { success: true };
  },
});

export const attack = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId, user } = await getCurrentUser(ctx);

    const active = await getActiveEvent(ctx);
    if (!active) throw new Error("No active LMS event!");
    if (user.inPrison) throw new Error("You can't fight from prison!");
    if (user.isDead) throw new Error("You're dead!");

    const attackerParticipant = await ctx.db
      .query("lmsParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
    if (!attackerParticipant || !attackerParticipant.alive) throw new Error("You're eliminated!");

    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found!");

    const targetParticipant = await ctx.db
      .query("lmsParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", args.targetId))
      .unique();
    if (!targetParticipant || !targetParticipant.alive) throw new Error("Target already eliminated!");

    // Combat
    const attackerATK = user.attack || 10;
    const attackerDEF = user.defense || 10;
    const targetATK = target.attack || 10;
    const targetDEF = target.defense || 10;

    const levelBonus = (user.level || 1) * 0.5;
    const targetLevelBonus = (target.level || 1) * 0.5;

    const attackerRoll = (attackerATK + levelBonus) * (0.8 + Math.random() * 0.4);
    const defenderRoll = (targetDEF + targetLevelBonus) * (0.7 + Math.random() * 0.5);

    const attackerWins = attackerRoll > defenderRoll;

    const cashReward = 10000 + (target.level || 1) * 5000;
    const xpReward = 50 + (target.level || 1) * 5;
    const scoreReward = 100 + (target.level || 1) * 10;
    const killRepReward = Math.min(100, 10 + Math.floor((target.level || 1) / 5) * 5);

    if (attackerWins) {
      // Kill the target
      await ctx.db.patch(args.targetId, { isDead: true, life: 0 });
      await ctx.db.patch(targetParticipant._id, {
        alive: false,
        deaths: targetParticipant.deaths + 1,
        eliminationRound: active.currentRound,
      });

      const newStreak = (attackerParticipant.streak || 0) + 1;
      const streakMultiplier = Math.min(5, 1 + Math.floor(newStreak / 2));
      const totalScore = scoreReward * streakMultiplier;

      // Update attacker user
      await ctx.db.patch(userId, {
        totalKills: (user.totalKills || 0) + 1,
        reputation: Math.min(100, (user.reputation || 0) + killRepReward),
        money: (user.money || 0) + cashReward,
        experience: (user.experience || 0) + xpReward,
        killsThisSeason: (user.killsThisSeason || 0) + 1,
      });

      // Update participant
      await ctx.db.patch(attackerParticipant._id, {
        kills: attackerParticipant.kills + 1,
        score: attackerParticipant.score + totalScore,
        streak: newStreak,
        lastKillAt: Date.now(),
        title: newStreak >= 10 ? "UNSTOPPABLE" : newStreak >= 7 ? "LEGENDARY" : newStreak >= 5 ? "DOMINATOR" : newStreak >= 3 ? "SLAYER" : undefined,
      });

      // Update event
      await ctx.db.patch(active._id, {
        eliminatedPlayers: active.eliminatedPlayers + 1,
        prizePool: active.prizePool + cashReward,
      });

      // Check winner
      const alivePlayers = await ctx.db
        .query("lmsParticipants")
        .withIndex("by_active", (q: any) => q.eq("alive", true))
        .collect();

      if (alivePlayers.length <= 1) {
        await ctx.db.patch(active._id, { isActive: false, winnerId: alivePlayers[0]?.userId });
        if (alivePlayers[0]) {
          const winnerUser = await ctx.db.get(alivePlayers[0].userId);
          if (winnerUser) {
            const grandPrize = active.prizePool + 50000000;
            await ctx.db.patch(alivePlayers[0].userId, {
              money: (winnerUser.money || 0) + grandPrize,
              reputation: Math.min(100, (winnerUser.reputation || 0) + 100),
            });
          }
          await ctx.db.patch(alivePlayers[0]._id, { title: "LAST MAN STANDING" });
          await ctx.db.insert("lmsEvents", {
            seasonId: active.seasonId,
            eventType: "winner",
            message: `👑 ${alivePlayers[0].nickname} IS THE LAST MAN STANDING! Grand prize: $${(active.prizePool + 50000000).toLocaleString()}!`,
            playerId: alivePlayers[0].userId,
            playerName: alivePlayers[0].nickname,
            timestamp: Date.now(),
            round: active.currentRound,
          });
        }
      }

      // Log kill
      await ctx.db.insert("lmsEvents", {
        seasonId: active.seasonId,
        eventType: "kill",
        message: `💀 ${user.nickname} eliminated ${target.nickname}! Streak: ${newStreak}x`,
        playerId: userId,
        playerName: user.nickname || "Unknown",
        targetId: args.targetId,
        targetName: target.nickname || "Unknown",
        timestamp: Date.now(),
        round: active.currentRound,
      });

      // Level up check
      const freshUser = await ctx.db.get(userId);
      if (freshUser) {
        const xpNeeded = (freshUser.level || 1) * 100;
        if ((freshUser.experience || 0) >= xpNeeded && !freshUser.levelUpPending) {
          await ctx.db.patch(userId, { levelUpPending: true });
        }
      }

      return {
        won: true,
        message: `ELIMINATED ${target.nickname}! +$${cashReward.toLocaleString()} | +${xpReward} XP | Streak: ${newStreak}x`,
        xp: xpReward, cash: cashReward, reputation: killRepReward, score: totalScore, streak: newStreak,
      };
    } else {
      const damage = Math.max(1, Math.floor((targetATK + targetLevelBonus - attackerDEF) * 0.3));
      const newLife = Math.max(0, (user.life || 100) - damage);

      await ctx.db.patch(userId, { life: newLife, totalDeaths: (user.totalDeaths || 0) + 1, experience: (user.experience || 0) + 10 });

      if (newLife <= 0) {
        await ctx.db.patch(userId, { isDead: true });
        await ctx.db.patch(attackerParticipant._id, {
          alive: false, deaths: attackerParticipant.deaths + 1, eliminationRound: active.currentRound, streak: 0,
        });
        await ctx.db.patch(active._id, { eliminatedPlayers: active.eliminatedPlayers + 1 });
        await ctx.db.insert("lmsEvents", {
          seasonId: active.seasonId, eventType: "elimination",
          message: `☠️ ${user.nickname} was eliminated by ${target.nickname}!`,
          playerId: args.targetId, playerName: target.nickname || "Unknown",
          targetId: userId, targetName: user.nickname || "Unknown",
          timestamp: Date.now(), round: active.currentRound,
        });
      }

      return { won: false, message: `${target.nickname} survived! You took ${damage} damage. ${newLife <= 0 ? "ELIMINATED!" : `HP: ${newLife}`}`, xp: 10, damage, newLife };
    }
  },
});

export const advanceRound = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await getCurrentUser(ctx);
    if ((user as any).role !== "admin") throw new Error("Admin only!");

    const active = await getActiveEvent(ctx);
    if (!active) throw new Error("No active event!");
    if (active.currentRound >= active.totalRounds) {
      await ctx.db.patch(active._id, { isActive: false });
      return { message: "Event ended!" };
    }

    const newRound = active.currentRound + 1;
    const roundEvents = [
      "🔥 The arena catches fire! All players lose 10 HP!",
      "📦 Supply drop! All alive players gain a buff!",
      "⚡ Lightning strikes! Random player gets eliminated!",
      "💀 Death zone shrinks! Fight or die!",
      "🏥 Medical supplies found! Players heal 25 HP!",
      "💰 Cash bounty doubled for this round!",
      "🎖️ Military lockdown! Extra XP this round!",
      "🌪️ Toxic storm! Low-level players take damage!",
      "💎 Diamond reward! Top scorer gets $10M!",
      "🏴 Zone collapse! No hiding now!",
    ];

    await ctx.db.patch(active._id, { currentRound: newRound });
    await ctx.db.insert("lmsEvents", {
      seasonId: active.seasonId, eventType: "round_advance",
      message: `Round ${newRound}: ${roundEvents[(newRound - 1) % roundEvents.length]}`,
      timestamp: Date.now(), round: newRound,
    });

    return { round: newRound };
  },
});

export const endEvent = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await getCurrentUser(ctx);
    if ((user as any).role !== "admin") throw new Error("Admin only!");

    const active = await getActiveEvent(ctx);
    if (!active) throw new Error("No active event!");

    await ctx.db.patch(active._id, { isActive: false });

    const alive = await ctx.db
      .query("lmsParticipants")
      .withIndex("by_active", (q: any) => q.eq("alive", true))
      .collect();

    if (alive.length > 0) {
      const share = Math.floor(active.prizePool / alive.length);
      for (const p of alive) {
        const pUser = await ctx.db.get(p.userId);
        if (pUser) {
          await ctx.db.patch(p.userId, { money: (pUser.money || 0) + share, reputation: Math.min(100, (pUser.reputation || 0) + 50) });
          await ctx.db.patch(p._id, { title: "SURVIVOR" });
        }
      }
    }

    await ctx.db.insert("lmsEvents", {
      seasonId: active.seasonId, eventType: "event_end",
      message: `🏁 Last Man Standing ended! ${alive.length} survivor(s)!`,
      timestamp: Date.now(), round: active.currentRound,
    });

    return { survivors: alive.length };
  },
});

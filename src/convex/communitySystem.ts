import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";

const DAY = 24 * 60 * 60 * 1000;
const VOTE_COOLDOWN = 12 * 60 * 60 * 1000;
const PRIZE_COOLDOWN = 15 * 60 * 1000;

const VOTE_SITES = [
  { id: "crime-list", name: "Crime Game List", icon: "🗳️", reward: 750, points: 50, description: "Vote once every 12 hours and bring a new player into the city." },
  { id: "underworld-index", name: "Underworld Index", icon: "🌐", reward: 1000, points: 75, description: "Support Shadow Empire's discovery ranking." },
  { id: "crew-network", name: "Crew Network", icon: "🤝", reward: 1250, points: 100, description: "Promote the city and earn a larger loyalty bonus." },
];

const PRIZE_SYMBOLS = ["perk", "cash", "xp", "points", "bullets", "freeBet", "x"] as const;
const PRIZE_TARGETS: Record<string, number> = { perk: 3, cash: 3, xp: 4, points: 5, bullets: 6, freeBet: 7 };
const PERKS = ["doubleXp", "doublePay", "jailImmunity", "bustBoost", "autoRank", "heistChance", "heistTimer"];
const PERK_VALUES = [5, 10, 20, 40, 50];

function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

async function playerFor(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

function makeBoard(day: string) {
  let seed = [...day].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const board = Array.from({ length: 48 }, () => {
    const roll = random();
    if (roll < 0.22) return "x";
    return PRIZE_SYMBOLS[1 + Math.floor(random() * (PRIZE_SYMBOLS.length - 1))];
  });
  return { day, board, revealed: {}, counts: {}, revealsLeft: 15, completed: {}, createdAt: Date.now() };
}

function prizeLabel(symbol: string) {
  return ({ perk: "Random Perk", cash: "Cash", xp: "XP", points: "Points", bullets: "Bullets", freeBet: "Free Bet Token" } as Record<string, string>)[symbol] ?? symbol;
}

function randomReward(symbol: string) {
  if (symbol === "perk") return { label: "Random Perk", value: PERK_VALUES[Math.floor(Math.random() * PERK_VALUES.length)] };
  if (symbol === "cash") return { label: "Cash", value: [5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000, 250_000_000, 500_000_000][Math.floor(Math.random() * 7)] };
  if (symbol === "xp") return { label: "XP", value: [250, 500, 1000, 2500][Math.floor(Math.random() * 4)] };
  if (symbol === "points") return { label: "Points", value: 2_500 };
  if (symbol === "bullets") return { label: "Bullets", value: [2_500, 5_000, 10_000, 25_000][Math.floor(Math.random() * 4)] };
  return { label: "Free Bet Token", value: 1 };
}

export const getVoteCenter = query({
  args: {},
  handler: async (ctx) => {
    const player = await playerFor(ctx);
    const claims = ((player as any).voteClaims ?? {}) as Record<string, number>;
    const now = Date.now();
    return {
      sites: VOTE_SITES.map((site) => ({ ...site, cooldownMs: Math.max(0, (claims[site.id] ?? 0) + VOTE_COOLDOWN - now), ready: now >= (claims[site.id] ?? 0) + VOTE_COOLDOWN })),
      totalVotes: (player as any).totalVotes ?? 0,
      totalEarned: (player as any).voteEarnings ?? 0,
      referralCode: (player as any).referralCode ?? null,
    };
  },
});

export const claimVoteReward = mutation({
  args: { siteId: v.string() },
  handler: async (ctx, args) => {
    const player = await playerFor(ctx);
    const site = VOTE_SITES.find((item) => item.id === args.siteId);
    if (!site) throw new Error("Unknown voting partner");
    const now = Date.now();
    const claims = ((player as any).voteClaims ?? {}) as Record<string, number>;
    if (now < (claims[site.id] ?? 0) + VOTE_COOLDOWN) throw new Error("That vote is cooling down — check back later");
    claims[site.id] = now;
    await ctx.db.patch(player._id, {
      voteClaims: claims,
      totalVotes: ((player as any).totalVotes ?? 0) + 1,
      voteEarnings: ((player as any).voteEarnings ?? 0) + site.reward,
      money: (player.money ?? 0) + site.reward,
      points: (player.points ?? 0) + site.points,
    } as any);
    return { success: true, reward: site.reward, points: site.points, site: site.name };
  },
});

const COMMUNITY_MISSIONS = [
  { id: "city-crimes", icon: "🔪", title: "Fill the Streets", description: "The whole city commits crimes together.", action: "totalCrimes", target: 500, reward: 250_000, points: 250 },
  { id: "city-fights", icon: "⚔️", title: "Crew Rivalry", description: "Win fights and make the city react.", action: "totalFights", target: 150, reward: 400_000, points: 400 },
  { id: "city-kills", icon: "💀", title: "Wanted: Alive", description: "The community reaches a combined kill milestone.", action: "totalKills", target: 75, reward: 750_000, points: 750 },
  { id: "city-gta", icon: "🚗", title: "Grand Theft City", description: "Steal enough cars to flood the chop shops.", action: "totalGta", target: 250, reward: 500_000, points: 500 },
];

export const getCommunityMissions = query({
  args: {},
  handler: async (ctx) => {
    const player = await playerFor(ctx);
    const users = await ctx.db.query("users").collect();
    const claims = await ctx.db.query("communityMissionClaims").withIndex("by_player", (q: any) => q.eq("playerId", player._id)).collect();
    const claimed = new Set(claims.map((claim: any) => claim.missionId));
    return COMMUNITY_MISSIONS.map((mission) => {
      const current = users.reduce((sum: number, user: any) => sum + (typeof user[mission.action] === "number" ? user[mission.action] : 0), 0);
      return { ...mission, current: Math.min(mission.target, current), percent: Math.min(100, Math.round((current / mission.target) * 100)), completed: current >= mission.target, claimed: claimed.has(mission.id) };
    });
  },
});

export const claimCommunityMission = mutation({
  args: { missionId: v.string() },
  handler: async (ctx, args) => {
    const player = await playerFor(ctx);
    const mission = COMMUNITY_MISSIONS.find((item) => item.id === args.missionId);
    if (!mission) throw new Error("Mission not found");
    const users = await ctx.db.query("users").collect();
    const current = users.reduce((sum: number, user: any) => sum + (typeof user[mission.action] === "number" ? user[mission.action] : 0), 0);
    if (current < mission.target) throw new Error("The city has not completed this mission yet");
    const existing = await ctx.db.query("communityMissionClaims").withIndex("by_player_mission", (q: any) => q.eq("playerId", player._id).eq("missionId", mission.id)).first();
    if (existing) throw new Error("Reward already claimed");
    await ctx.db.insert("communityMissionClaims", { playerId: player._id, missionId: mission.id, claimedAt: Date.now() });
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + mission.reward, points: (player.points ?? 0) + mission.points } as any);
    return { success: true, reward: mission.reward, points: mission.points };
  },
});

export const getPrizeMatcher = query({
  args: {},
  handler: async (ctx) => {
    const player = await playerFor(ctx);
    const today = dayKey();
    const existing = (player as any).prizeMatcherState;
    const state = existing?.day === today ? existing : { ...makeBoard(today), board: undefined };
    const counts = (state.counts ?? {}) as Record<string, number>;
    return {
      day: today,
      boardSize: 48,
      revealsLeft: state.revealsLeft ?? 15,
      revealed: state.revealed ?? {},
      counts,
      targets: PRIZE_TARGETS,
      completed: state.completed ?? {},
      cooldownMs: Math.max(0, ((player as any).prizeMatcherLastReveal ?? 0) + PRIZE_COOLDOWN - Date.now()),
      history: ((player as any).prizeMatcherHistory ?? []).slice(0, 10),
    };
  },
});

export const revealPrizeMatcher = mutation({
  args: { tile: v.number() },
  handler: async (ctx, args) => {
    const player = await playerFor(ctx);
    if (args.tile < 0 || args.tile >= 48 || !Number.isInteger(args.tile)) throw new Error("Invalid tile");
    const today = dayKey();
    let state = (player as any).prizeMatcherState;
    if (!state || state.day !== today) state = makeBoard(today);
    if ((state.revealsLeft ?? 0) <= 0) throw new Error("No reveals left today — come back tomorrow");
    if (state.revealed?.[args.tile] !== undefined) throw new Error("That tile is already revealed");
    const last = (player as any).prizeMatcherLastReveal ?? 0;
    if (Date.now() < last + PRIZE_COOLDOWN) throw new Error(`Prize Matcher cooldown — ${Math.ceil((last + PRIZE_COOLDOWN - Date.now()) / 1000)}s remaining`);
    const symbol = state.board[args.tile];
    const revealed = { ...(state.revealed ?? {}), [args.tile]: symbol };
    const counts = { ...(state.counts ?? {}) };
    const completed = { ...(state.completed ?? {}) };
    let reward: any = null;
    if (symbol !== "x") {
      counts[symbol] = (counts[symbol] ?? 0) + 1;
      if (counts[symbol] >= (PRIZE_TARGETS[symbol] ?? 999) && !completed[symbol]) {
        const rolled = randomReward(symbol);
        reward = { symbol, ...rolled };
        completed[symbol] = (completed[symbol] ?? 0) + 1;
      }
    }
    const patch: any = { prizeMatcherState: { ...state, revealed, counts, completed, revealsLeft: (state.revealsLeft ?? 15) - 1 }, prizeMatcherLastReveal: Date.now() };
    if (reward?.symbol === "cash") patch.money = (player.money ?? 0) + reward.value;
    if (reward?.symbol === "points") patch.points = (player.points ?? 0) + reward.value;
    if (reward?.symbol === "bullets") patch.bullets = ((player as any).bullets ?? 0) + reward.value;
    if (reward?.symbol === "freeBet") patch.perks = { ...((player as any).perks ?? {}), freeBetToken: ((player as any).perks?.freeBetToken ?? 0) + reward.value };
    if (reward?.symbol === "perk") {
      const perk = PERKS[Math.floor(Math.random() * PERKS.length)];
      patch.perks = { ...((player as any).perks ?? {}), [perk]: ((player as any).perks?.[perk] ?? 0) + reward.value };
      reward.perk = perk;
    }
    if (reward?.symbol === "xp") {
      const xpPatch = await addXpAndCheckLevel(ctx, player, reward.value);
      Object.assign(patch, xpPatch);
    }
    if (reward) {
      const history = Array.isArray((player as any).prizeMatcherHistory) ? [...(player as any).prizeMatcherHistory] : [];
      history.unshift({ at: Date.now(), symbol: reward.symbol, label: reward.label, value: reward.value, perk: reward.perk });
      patch.prizeMatcherHistory = history.slice(0, 10);
    }
    await ctx.db.patch(player._id, patch);
    return { success: true, tile: args.tile, symbol, counts, revealsLeft: patch.prizeMatcherState.revealsLeft, reward };
  },
});

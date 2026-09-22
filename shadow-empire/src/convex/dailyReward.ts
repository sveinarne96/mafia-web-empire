import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// =====================================================================
// DAILY REWARD — 16-tile match game (every 15 minutes)
// 16 face-down tiles hide 8 prize pairs. Start → 4 tiles are revealed.
// Pick two tiles: match → pair locks in (up to 8 pairs = x8 prizes).
// 3 mismatch chances per board. Fail early → still keep matched pairs.
// Cooldown starts on the FIRST reveal, so refreshes can't dodge it.
// =====================================================================

const COOLDOWN_MS = 15 * 60 * 1000;

// 12 prize types (values scale with the pair multiplier).
const PRIZES: { id: string; label: string; base: number; kind: "perk" | "cash" | "points" | "bullets" | "scrap" }[] = [
  { id: "doubleXp", label: "Double XP", base: 5, kind: "perk" },
  { id: "doublePay", label: "Double Pay", base: 5, kind: "perk" },
  { id: "jailImmune", label: "Jail Immune", base: 5, kind: "perk" },
  { id: "bustBoost", label: "Bust Boost", base: 5, kind: "perk" },
  { id: "autoRanks", label: "Auto Ranks", base: 5, kind: "perk" },
  { id: "heistChance", label: "Heist Chance", base: 5, kind: "perk" },
  { id: "heistTimer", label: "Heist Timer", base: 5, kind: "perk" },
  { id: "commonScrap", label: "Common Scrap", base: 10, kind: "scrap" },
  { id: "rareScrap", label: "Rare Scrap", base: 10, kind: "scrap" },
  { id: "cash", label: "Cash", base: 5_000_000, kind: "cash" },
  { id: "points", label: "Points", base: 2_500, kind: "points" },
  { id: "bullets", label: "Bullets", base: 2_500, kind: "bullets" },
];

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function freshBoard(): any {
  // 8 pairs from the 12 prize types
  const picks = shuffle(PRIZES).slice(0, 8);
  const tiles = shuffle([...picks, ...picks].map((p, i) => ({ prize: p.id })));
  return {
    board: tiles, // 16 entries: { prize }
    revealed: [], // tile indexes currently face-up (unmatched)
    matched: [] as number[], // tile indexes locked in
    matchedPairs: 0,
    chances: 3,
    active: true,
    startedAt: Date.now(),
  };
}

interface DailyRewardState {
  board: { prize: string }[];
  revealed: number[];
  matched: number[];
  matchedPairs: number;
  chances: number;
  active: boolean;
  startedAt: number;
}

async function getState(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const player = await ctx.db.get(userId);
  if (!player) return null;
  const state = (player.dailyRewardState && player.dailyRewardState.active ? player.dailyRewardState : null) as DailyRewardState | null;
  const last = n(player.dailyRewardLastPlayed, 0);
  const now = Date.now();
  const cdLeft = Math.max(0, COOLDOWN_MS - (now - last));
  return {
    state,
    cooldownMsLeft: cdLeft,
    readyIn: Math.ceil(cdLeft / 1000),
    canStart: cdLeft <= 0,
    history: (Array.isArray(player.dailyRewardHistory) ? player.dailyRewardHistory : []).slice(0, 10),
  };
}

export const getDailyRewardState = query({
  args: {},
  handler: async (ctx) => await getState(ctx),
});

// Prize → user patch (shared by finish paths)
async function grantPrizes(ctx: any, player: any, pairs: { prizeId: string; count: number }[], mult: number) {
  const patch: any = {};
  const lines: string[] = [];
  const perks = player.perks && typeof player.perks === "object" ? { ...player.perks } : {};
  const scraps = player.scraps && typeof player.scraps === "object" ? { ...player.scraps } : { common: 0, rare: 0, epic: 0 };
  for (const { prizeId, count } of pairs) {
    const p = PRIZES.find((x) => x.id === prizeId);
    if (!p) continue;
    const amount = p.base * count * mult; // mult: 1..8 pairs → x1..x8
    switch (p.kind) {
      case "perk": {
        const map: Record<string, string> = { doubleXp: "doubleXp", doublePay: "doublePay", jailImmune: "jailImmunity", bustBoost: "bustBoost", autoRanks: "autoRank", heistChance: "heistChance", heistTimer: "heistTimer" };
        const pid = map[prizeId];
        if (pid) { perks[pid] = (perks[pid] ?? 0) + amount; patch.perks = perks; }
        lines.push(`${p.label} x${amount}`);
        break;
      }
      case "scrap": {
        const key = prizeId === "rareScrap" ? "rare" : "common";
        scraps[key] = (scraps[key] ?? 0) + amount;
        patch.scraps = scraps;
        lines.push(`${p.label} x${amount}`);
        break;
      }
      case "cash": patch.money = n(player.money, 0) + amount; lines.push(`$${amount.toLocaleString()}`); break;
      case "points": patch.points = n(player.points, 0) + amount; lines.push(`${amount.toLocaleString()} points`); break;
      case "bullets": patch.bullets = n(player.bullets, 0) + amount; lines.push(`${amount.toLocaleString()} bullets`); break;
    }
  }
  return { patch, lines };
}

function pushHistory(player: any, pairs: { prizeId: string; count: number }[], mult: number) {
  const entry = { at: Date.now(), mult, prizes: pairs.map((p) => { const pr = PRIZES.find((x) => x.id === p.prizeId); return pr ? `${pr.label} x${(pr.base * p.count * mult).toLocaleString()}` : ""; }).filter(Boolean) };
  const hist = Array.isArray(player.dailyRewardHistory) ? [...player.dailyRewardHistory] : [];
  hist.unshift(entry);
  return hist.slice(0, 10);
}

// ===== START: pays nothing, reveals 4 tiles, sets nothing on cooldown yet =====
export const startGame = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const st = await getState(ctx);
    if (!st?.canStart) throw new Error(`Game on cooldown — ${st?.readyIn ?? 0}s remaining`);
    const board = freshBoard();
    // Reveal 4 random tiles as the starting hint (they stay face-up).
    const idx = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).slice(0, 4);
    board.revealed = idx;
    await ctx.db.patch(player._id, { dailyRewardState: board } as any);
    return { success: true, revealed: idx, board };
  },
});

// ===== CONTINUE: resume a board after a refresh (no new reveal) =====
export const resumeGame = query({
  args: {},
  handler: async (ctx) => await getState(ctx),
});

// ===== REVEAL: pick a tile — the cooldown starts on the first reveal =====
export const revealTile = mutation({
  args: { tile: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    let state = player.dailyRewardState as DailyRewardState | null;
    if (!state || !state.active) throw new Error("No active game — press Start Game");
    const tile = Math.floor(args.tile);
    if (!(tile >= 0 && tile < 16)) throw new Error("Invalid tile");
    if (state.matched.includes(tile) || state.revealed.includes(tile)) throw new Error("Tile already face-up");
    const now = Date.now();

    // Cooldown anchor: first reveal of the board.
    const last = n(player.dailyRewardLastPlayed, 0);
    if (now - last >= COOLDOWN_MS) {
      await ctx.db.patch(player._id, { dailyRewardLastPlayed: now } as any);
    }

    const revealed = [...state.revealed, tile];
    if (revealed.length < 2) {
      await ctx.db.patch(player._id, { dailyRewardState: { ...state, revealed } } as any);
      return { success: true, matched: false, prize: null, state: { ...state, revealed } };
    }

    // Two tiles up — resolve the pair.
    const [a, b] = revealed;
    const prizeA = state.board[a]?.prize;
    const prizeB = state.board[b]?.prize;
    let newState: any = { ...state, revealed: [] as number[] };
    let matched = false;
    let pairs = (state.matchedPairs ?? 0);
    if (prizeA && prizeA === prizeB) {
      matched = true;
      pairs += 1;
      newState = {
        ...state,
        revealed: [],
        matched: [...state.matched, a, b],
        matchedPairs: pairs,
      };
      if (pairs >= 8) newState.active = false; // perfect board
    } else {
      newState.chances = (state.chances ?? 3) - 1;
      if (newState.chances <= 0) newState.active = false;
    }
    await ctx.db.patch(player._id, { dailyRewardState: newState } as any);
    return {
      success: true,
      matched,
      prize: matched ? prizeA : null,
      matchedPairs: newState.matchedPairs ?? pairs,
      chances: newState.chances,
      boardOver: newState.active === false,
      state: newState,
    };
  },
});

// ===== FINISH: claim what you matched (auto after board over or on demand) =====
export const finishGame = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const state = player.dailyRewardState as DailyRewardState | null;
    if (!state) throw new Error("No game to finish");
    if (state.active) throw new Error("Board still active — keep matching or use your chances first");
    const pairsCount = state.matchedPairs ?? 0;
    // Tally matched PAIRS by prize (two matched tiles = one banked prize).
    const tally: Record<string, number> = {};
    for (let i = 0; i + 1 < state.matched.length; i += 2) {
      const prize = state.board[state.matched[i]]?.prize;
      if (prize) tally[prize] = (tally[prize] ?? 0) + 1;
    }
    const pairs = Object.entries(tally).map(([prizeId, count]) => ({ prizeId, count }));
    const mult = Math.max(1, pairsCount);
    const { patch, lines } = await grantPrizes(ctx, player, pairs, 1);
    // History
    const hist = pushHistory(player, pairs, mult);
    await ctx.db.patch(player._id, { ...patch, dailyRewardState: null, dailyRewardHistory: hist } as any);
    return { success: true, pairs: pairsCount, rewards: lines, mult };
  },
});

// ===== ABANDON: forfeit and clear the board (used by admin/dev only) =====
export const abandonGame = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    await ctx.db.patch(player._id, { dailyRewardState: null } as any);
    return { success: true };
  },
});

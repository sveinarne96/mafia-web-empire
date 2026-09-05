import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ───────────────────────── EVENT SCHEDULE ─────────────────────────
// Every 4 hours a new derby opens. 45 minutes of rounds (9 × 5 min), then a
// 15-minute payout window inside the same slot, after which the next derby
// starts building.
const WINDOW_MS = 4 * 60 * 60 * 1000; // 4 h slots
const ROUND_MS = 5 * 60 * 1000; // rounds every 5 min
const ROUNDS = 9;
const ACTIVE_MS = ROUNDS * ROUND_MS; // 45 min of combat
const ENTRY_FEE = 75_000_000;

function slotStart(now: number) {
  const dayStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  return dayStart;
}
function eventIdFor(start: number) {
  const d = new Date(start);
  const p = (n: number) => String(n).padStart(2, "0");
  return `Steel Derby #${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}`;
}
// Stable pseudo-random from a string.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

interface Entrant {
  id: string;
  name: string;
  carName: string;
  entryDamage: number; // 0-90, entered with
  damage: number; // accumulated
  alive: boolean;
  eliminatedRound: number | null;
  enteredAt: number;
}

// Derby winner: last survivor standing; if the whole field is wrecked, the
// entrant who survived the most rounds (least damage) takes the pool.
function pickWinner(entrants: Entrant[]): Entrant | null {
  if (entrants.length === 0) return null;
  const alive = entrants.filter((e) => e.alive);
  if (alive.length > 0) return alive.sort((a, b) => a.damage - b.damage)[0];
  return entrants
    .filter((e) => e.eliminatedRound !== null)
    .sort((a, b) => (b.eliminatedRound ?? 0) - (a.eliminatedRound ?? 0) || a.damage - b.damage)[0] ?? null;
}

function resolveEntrant(ent: any, round: number): number {
  // Cumulative damage growth per round for this entrant.
  const base = (ent.entryDamage ?? 30) / 100;
  let dmg = base;
  for (let r = 1; r <= round; r++) {
    const jolt = 0.08 + hash(ent.id + ":" + r) * 0.5;
    dmg = Math.min(0.9, dmg + jolt * (0.35 + base));
    if (dmg >= 0.9) break;
  }
  return Math.round(dmg * 100);
}

function simulate(entries: any[], round: number): Entrant[] {
  return entries.map((e) => {
    const damage = resolveEntrant(e, round);
    const eliminatedRound = damage >= 90 ? round : null;
    return {
      id: e._id,
      name: e.name,
      carName: e.carName ?? "Unknown Beater",
      entryDamage: e.entryDamage ?? 30,
      damage,
      alive: damage < 90,
      eliminatedRound,
      enteredAt: e.enteredAt ?? 0,
    };
  });
}

// Scan players for entries into the current + previous event window.
async function collectEntries(ctx: any, start: number) {
  const users = await ctx.db.query("users").collect();
  const all = users
    .filter((u: any) => u.derby && (u.derby as any).eventId === eventIdFor(start))
    .map((u: any) => ({
      _id: u._id,
      name: u.nickname || u.username || u.name || "Unknown",
      carName: (u.derby as any).carName,
      entryDamage: (u.derby as any).entryDamage ?? 30,
      enteredAt: (u.derby as any).enteredAt ?? 0,
      claimed: !!(u.derby as any).claimed,
    }));
  return all.sort((a: any, b: any) => a.enteredAt - b.enteredAt);
}

export const getDerbyState = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const now = Date.now();
    const start = slotStart(now);
    const elapsed = now - start;
    const round = Math.min(ROUNDS, Math.floor(elapsed / ROUND_MS) + 1);
    const active = elapsed < ACTIVE_MS;
    const entries = await collectEntries(ctx, start);
    const entrants = simulate(entries, active ? Math.max(1, round - 1) : ROUNDS);
    const aliveCount = entrants.filter((e) => e.alive).length;
    const pool = entries.length * ENTRY_FEE;
    const my = (player as any).derby;
    const myEntry = my && my.eventId === eventIdFor(start) ? my : null;

    return {
      eventId: eventIdFor(start),
      start,
      now,
      round: active ? round : ROUNDS,
      roundsTotal: ROUNDS,
      active,
      activeMsLeft: active ? ACTIVE_MS - elapsed : 0,
      windowEnd: start + WINDOW_MS,
      entryFee: ENTRY_FEE,
      entrants: entrants.slice(0, 24),
      aliveCount,
      pool,
      canEnter: active && entries.length < 100 && !myEntry,
      myEntry,
      prizeWinner: !active ? pickWinner(entrants) : null,
    };
  },
});

export const enterDerby = mutation({
  args: { carName: v.string(), entryDamage: v.number() },
  handler: async (ctx, args) => {
    const player: any = await getCurrentUser(ctx);
    const now = Date.now();
    const start = slotStart(now);
    if (now - start >= ACTIVE_MS) throw new Error("This derby has already closed");
    const entryDamage = Math.min(90, Math.max(0, Math.floor(args.entryDamage)));
    const carName = (args.carName || "Beater").slice(0, 40);

    const my = (player as any).derby;
    if (my && my.eventId === eventIdFor(start)) throw new Error("You already entered this derby");
    if ((player.money ?? 0) < ENTRY_FEE)
      throw new Error(`Entry costs $${ENTRY_FEE.toLocaleString()}`);

    const entries = await collectEntries(ctx, start);
    if (entries.length >= 100) throw new Error("This derby is full");

    await ctx.db.patch(player._id, { money: (player.money ?? 0) - ENTRY_FEE } as any);
    const stats = (player as any).derbyStats || { entered: 0, paid: 0, won: 0, prize: 0 };
    await ctx.db.patch(player._id, {
      derby: {
        eventId: eventIdFor(start),
        enteredAt: now,
        carName,
        entryDamage,
        claimed: false,
      },
      derbyStats: { ...stats, entered: (stats.entered ?? 0) + 1, paid: (stats.paid ?? 0) + ENTRY_FEE },
    } as any);

    return { success: true, eventId: eventIdFor(start), pool: (entries.length + 1) * ENTRY_FEE };
  },
});

// Payout window: winner of a finished derby collects the full pool once.
export const claimDerbyPrize = mutation({
  args: {},
  handler: async (ctx) => {
    const player: any = await getCurrentUser(ctx);
    const now = Date.now();
    const start = slotStart(now);
    const my = (player as any).derby;
    if (!my || my.eventId !== eventIdFor(start) || now - start < ACTIVE_MS)
      throw new Error("No finished derby to claim");
    if (my.claimed) throw new Error("You already claimed this prize");

    const entries = await collectEntries(ctx, start);
    const entrants = simulate(entries, ROUNDS);
    const winner = pickWinner(entrants);
    if (!winner || winner.id !== player._id) throw new Error("You did not win this derby");

    const pool = entries.length * ENTRY_FEE;
    const stats = (player as any).derbyStats || { entered: 0, paid: 0, won: 0, prize: 0 };
    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + pool,
      derby: { ...my, claimed: true },
      derbyStats: {
        ...stats,
        won: (stats.won ?? 0) + 1,
        prize: (stats.prize ?? 0) + pool,
      },
    } as any);
    return { success: true, prize: pool };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addXpAndCheckLevel } from "./game";
import { racketLevelScale } from "./rackets";
import {
  ACTIONS_BY_KEY, eventWindowNow, EVENT_LABEL,
  type ActionDef,
} from "../game/actionCatalog";

/* ══════════════════════════════════════════════════════════════
   THE 500 — one backend engine for all 500 catalog actions.
   Single generic mutation + queries for UI state and history.
   ══════════════════════════════════════════════════════════════ */

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const money = (v: number) => "$" + Math.floor(v).toLocaleString();

async function me(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return await ctx.db.get(userId);
}

/* Cooldown key: per-player per-action timestamp table */
export const performAction = mutation({
  args: { actionKey: v.string() },
  handler: async (ctx, args) => {
    const player = await me(ctx);
    const def: ActionDef | undefined = ACTIONS_BY_KEY[args.actionKey];
    if (!def) throw new Error("Unknown action.");

    /* ── requirements ── */
    if (def.cost > 0 && n(player.money, 0) < def.cost)
      throw new Error(`You need ${money(def.cost)} up front.`);
    if (n(player.energy, 100) < def.energy)
      throw new Error(`Not enough energy (${def.energy} needed).`);
    if (def.car) {
      try {
        const cars = await ctx.db.query("vehicles").withIndex("by_user", (q) => q.eq("userId", player._id)).take(1);
        if (cars.length === 0) throw new Error("This job needs a car in your garage.");
      } catch (e: any) { if (String(e.message).includes("car in your garage")) throw e; }
    }
    if (def.when && !eventWindowNow(def.when))
      throw new Error(`Only during ${EVENT_LABEL[def.when]}.`);

    /* ── cooldown ── */
    const cdTable = (ctx.db.query as any)("actionCooldowns");
    const prior = (await cdTable
      .withIndex("by_player_action", (q: any) => q.eq("playerId", player._id).eq("actionKey", args.actionKey))
      .collect())[0];
    const now = Date.now();
    if (prior && prior.readyAt > now) {
      const secs = Math.ceil((prior.readyAt - now) / 1000);
      const label = secs >= 3600 ? `${Math.floor(secs / 3600)}h ${Math.ceil((secs % 3600) / 60)}m`
        : secs >= 60 ? `${Math.ceil(secs / 60)}m` : `${secs}s`;
      throw new Error(`${def.name} is recovering — ${label} left.`);
    }

    /* ── pay costs ── */
    let delta = -def.cost;
    const patch: any = { energy: Math.max(0, n(player.energy, 100) - def.energy) };

    /* ── resolve ── */
    const scale = racketLevelScale(n(player.level, 1));
    const success = Math.random() * 100 >= def.risk;
    let text = "";
    let earned = 0;

    if (success) {
      earned = Math.floor(randInt(def.lo, Math.max(def.lo, def.hi)) * scale);
      delta += earned;
      const flavor = pickFlavor(def.cat, true);
      text = `${flavor} ${def.name}: ${money(earned)}.`;
      if (def.heat > 0) patch.wantedLevel = Math.min(20, n(player.wantedLevel, 0) + def.heat);
      if (def.heat < 0) patch.wantedLevel = Math.max(0, n(player.wantedLevel, 0) + def.heat);
      if (def.rep) patch.reputation = Math.max(-100, n(player.reputation, 0) + def.rep);
    } else {
      const flavor = pickFlavor(def.cat, false);
      const lost = def.cost > 0 && Math.random() < 0.4 ? Math.floor(def.cost * 0.5) : 0;
      delta += lost; // already paid cost above; on fail sometimes half back
      text = `${flavor} ${def.name} fell apart.${lost ? ` ${money(lost)} salvaged from the mess.` : ""}`;
      if (def.heat > 0 && Math.random() < 0.5) patch.wantedLevel = Math.min(20, n(player.wantedLevel, 0) + 1);
      if (Math.random() < 0.3) patch.life = Math.max(0, n(player.life, 100) - randInt(2, 8));
    }

    patch.money = n(player.money, 0) + delta;
    const xp = await addXpAndCheckLevel(ctx, player, success ? def.xp : Math.ceil(def.xp * 0.3));
    Object.assign(patch, xp);

    await ctx.db.patch(player._id, patch);
    await (ctx.db.insert as any)("actionHistory", {
      playerId: player._id, playerName: player.nickname ?? "Player",
      actionKey: def.key, actionName: def.name, category: def.cat,
      success, earned: success ? earned : -Math.max(0, def.cost - (delta + def.cost === 0 ? 0 : delta)), spent: def.cost,
      text, createdAt: now,
    });
    await (ctx.db.insert as any)("actionCooldowns", { playerId: player._id, actionKey: args.actionKey, readyAt: now + def.cd * 1000 });

    return {
      success, earned: success ? earned : 0, text,
      cooldownUntil: now + def.cd * 1000,
      wanted: patch.wantedLevel ?? player.wantedLevel ?? 0,
    };
  },
});

function pickFlavor(cat: string, ok: boolean): string {
  const tables: Record<string, { ok: string[]; bad: string[] }> = {
    street: { ok: ["Light fingers,", "Smooth moves —", "Nobody saw a thing:"], bad: ["The mark turned:", "A dog barked. You ran.", "Wrong pocket, wrong day."] },
    heists: { ok: ["The plan held:", "Textbook execution —", "Vault cracked:"], bad: ["Alarms, everywhere:", "The crew scattered.", "The blueprint lied."] },
    vehicles: { ok: ["Keys in the ignition:", "Engine purring —", "Clean boost:"], bad: ["The dealer flagged you.", "Steering lock won.", "A witness wrote plates."] },
    muscle: { ok: ["Message delivered:", "They understood immediately —", "Hands do the talking:"], bad: ["They fought back.", "Wrong block, wrong night.", "The target had friends."] },
    social: { ok: ["Charm offensive:", "Trust extended —", "The room warmed:"], bad: ["Word got around.", "They saw through you.", "Cold shoulders everywhere."] },
    fronts: { ok: ["Register's humming:", "The books balance —", "Another quiet day:"], bad: ["A health inspector came.", "The till ran dry.", "The landlord wants a word."] },
    economy: { ok: ["The angle worked:", "Markets moved your way —", "Ledgers fattened:"], bad: ["The market soured.", "Someone shorted YOU.", "The mark was a fed."] },
    gambling: { ok: ["The house collected:", "Dice landed kind —", "Pots raked:"], bad: ["A player flipped the table.", "The raid came early.", "Luck left the building."] },
    smuggling: { ok: ["Nothing declared:", "Clean checkpoint —", "Cargo vanished into walls:"], bad: ["A K-9 got curious.", "Manifest mismatch.", "The ship was watched."] },
    corruption: { ok: ["Stamps, signatures, silence:", "The file went missing —", "Favors repaid:"], bad: ["A reporter got curious.", "The committee recoiled.", "Bribe refused, loudly."] },
    crew: { ok: ["The family gathered:", "Loyalty deepened —", "Tradition held:"], bad: ["Attendance was thin.", "An old grudge flared.", "The food ran out."] },
    prison: { ok: ["Inside connections:", "The yard understood —", "Bars bend for money:"], bad: ["A shakedown found it.", "The guard got suspicious.", "Solitary for the night."] },
    espionage: { ok: ["Ears everywhere:", "The file copied itself —", "Nobody suspected the clock:"], bad: ["You were made.", "The line was cold.", "Someone swept the room first."] },
    turf: { ok: ["The block respects you:", "Corners held —", "Turfs widen:"], bad: ["A rival crew pushed back.", "The locals complained.", "The map has to be redrawn."] },
    lore: { ok: ["Tradition honored:", "The old ones approve —", "Legacy grows:"], bad: ["The ritual felt hollow.", "Attendance was poor.", "The elders frowned."] },
    wild: { ok: ["Absolutely absurd, and it worked:", "Nobody will believe this —", "The city will gossip:"], bad: ["Even the raccoon judged you.", "It got weird. Then worse.", "The flamingo fought back."] },
  };
  const t = tables[cat] ?? tables.street;
  return (ok ? t.ok : t.bad)[randInt(0, (ok ? t.ok : t.bad).length - 1)];
}

/* ── queries ── */
export const getMyCooldowns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};
    const rows = await (ctx.db.query as any)("actionCooldowns").withIndex("by_player", (q: any) => q.eq("playerId", userId)).collect();
    const now = Date.now();
    const out: Record<string, number> = {};
    for (const r of rows) if (r.readyAt > now) out[r.actionKey] = r.readyAt;
    return out;
  },
});

export const getHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await (ctx.db.query as any)("actionHistory").withIndex("by_player", (q: any) => q.eq("playerId", userId)).order("desc").take(Math.min(60, args.limit ?? 20));
    return rows;
  },
});

export const getCityFeed = query({
  args: {},
  handler: async (ctx) => {
    return await (ctx.db.query as any)("actionHistory").withIndex("by_time").order("desc").take(25);
  },
});

export const getCategoryLeaderboard = query({
  args: { cat: v.string() },
  handler: async (ctx, args) => {
    const since = Date.now() - 7 * 86_400_000;
    const rows = await (ctx.db.query as any)("actionHistory").withIndex("by_category", (q: any) => q.eq("category", args.cat)).collect();
    const recent = rows.filter((r: any) => r.createdAt > since && r.success);
    const byPlayer = new Map<string, { name: string; earned: number; count: number }>();
    for (const r of recent) {
      const k = String(r.playerId);
      const cur = byPlayer.get(k) ?? { name: r.playerName, earned: 0, count: 0 };
      cur.earned += Math.max(0, r.earned);
      cur.count += 1;
      byPlayer.set(k, cur);
    }
    return [...byPlayer.values()].sort((a, b) => b.earned - a.earned).slice(0, 10);
  },
});

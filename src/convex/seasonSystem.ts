import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { seasonEnd } from "./storeSystem";

// =====================================================================
// SEASON TOKENS — exchange XP, spend on exclusive cosmetics, equip them.
// Tokens and stock are season-scoped: reset when the season turns over.
// =====================================================================

const n = (val: any, d: number) => (typeof val === "number" && Number.isFinite(val) ? val : d);

const TOKEN_XP_RATE = 1; // 1 season XP = 1 token

// Which season we're currently in (based on the shared season end date).
function currentSeason(): string {
  return `S-${new Date(seasonEnd()).toISOString().slice(0, 10)}`;
}

// ===== SEASON STORE CATALOG (exclusive items) =====
export interface SeasonStoreItem {
  id: string;
  name: string;
  category: "relic" | "pack" | "cosmetic" | "avatar" | "cards" | "upgrade";
  price: number; // season tokens
  initialStock: number;
  emoji: string;
  desc: string;
}

export const SEASON_STORE: SeasonStoreItem[] = [
  { id: "aurelian_sovereign", name: "Aurelian Sovereign", category: "relic", price: 100, initialStock: 200, emoji: "👑", desc: "Legendary imperial relic — flex the rarest crown in the empire." },
  { id: "caligo_thresher", name: "Caligo Thresher", category: "relic", price: 50, initialStock: 100, emoji: "🗡️", desc: "Shadow-forged thresher blade of the Caligo dynasty." },
  { id: "chronos_shroud", name: "Chronos Shroud", category: "relic", price: 50, initialStock: 100, emoji: "🧿", desc: "Cloak woven from stolen time itself." },
  { id: "common_pack", name: "Common Pack", category: "pack", price: 15, initialStock: 100, emoji: "🎁", desc: "A standard reward pack." },
  { id: "epic_pack", name: "Epic Pack", category: "pack", price: 60, initialStock: 50, emoji: "✨", desc: "Contains epic-tier loot." },
  { id: "legendary_pack", name: "Legendary Pack", category: "pack", price: 150, initialStock: 20, emoji: "💎", desc: "Contains legendary-tier loot." },
  { id: "aurora_outline", name: "Aurora Avatar Outline", category: "avatar", price: 40, initialStock: 300, emoji: "🌌", desc: "Animated aurora gradient outline around your profile avatar for this season." },
  { id: "inferno_outline", name: "Inferno Avatar Outline", category: "avatar", price: 40, initialStock: 300, emoji: "🔥", desc: "Animated inferno gradient outline around your profile avatar for this season." },
  { id: "royal_outline", name: "Royal Avatar Outline", category: "avatar", price: 40, initialStock: 300, emoji: "🟡", desc: "Animated royal gradient outline around your profile avatar for this season." },
  { id: "toxic_outline", name: "Toxic Avatar Outline", category: "avatar", price: 40, initialStock: 300, emoji: "☣️", desc: "Animated toxic gradient outline around your profile avatar for this season." },
  { id: "prohibition_cards", name: "Prohibition Card Set", category: "cards", price: 45, initialStock: 150, emoji: "🃏", desc: "Prohibition-themed card set for Poker, Blackjack, MP Blackjack and MP Poker." },
  { id: "cyber_cards", name: "Cyber Card Set", category: "cards", price: 45, initialStock: 150, emoji: "🤖", desc: "Cyber-themed card set for Poker, Blackjack, MP Blackjack and MP Poker." },
];

// ===== VIP STORE (VIP tokens only — 3 granted per VIP purchase per season) =====
export const VIP_TOKENS_PER_PURCHASE = 3;
export const VIP_STORE: { id: string; name: string; price: number; emoji: string; desc: string; perks?: Record<string, number>; bullets?: number; points?: number }[] = [
  { id: "vip_golden_touch", name: "Golden Touch Crate", price: 1, emoji: "🪙", desc: "+25,000 points dropped straight into your account.", points: 25000 },
  { id: "vip_bullet_vault", name: "Bullet Vault Key", price: 1, emoji: "💀", desc: "A vault of 100,000 bullets.", bullets: 100000 },
  { id: "vip_lotte_potion", name: "Lottery Potion", price: 2, emoji: "🧪", desc: "2 Epic Packs + 1 Legendary Pack.", perks: {}, },
  { id: "vip_crown_crate", name: "Crown Crate", price: 3, emoji: "👑", desc: "The VIP-exclusive Aurelian Sovereign relic.", },
];

const VIP_SEASON_KEY = () => `vip-${currentSeason()}`;

async function ensureStockRow(ctx: any, season: string, item: SeasonStoreItem) {
  const row = await ctx.db
    .query("seasonStoreStock")
    .withIndex("by_season_item", (q: any) => q.eq("season", season).eq("itemId", item.id))
    .first();
  if (row) return row;
  const id = await ctx.db.insert("seasonStoreStock", { season, itemId: item.id, stock: item.initialStock });
  return (await ctx.db.get(id)) as any;
}

async function getStockMap(ctx: any, season: string): Promise<Record<string, number>> {
  const rows = await ctx.db.query("seasonStoreStock").withIndex("by_season", (q: any) => q.eq("season", season)).collect();
  const map: Record<string, number> = {};
  for (const r of rows) map[r.itemId] = r.stock;
  return map;
}

async function getStoreState(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const player = await ctx.db.get(userId);
  if (!player) return null;
  const season = currentSeason();
  const stock = await getStockMap(ctx, season);
  // Lazily backfill stock rows for any catalog item that has no row yet this season.
  const missing = SEASON_STORE.filter((i) => stock[i.id] === undefined);
  if (missing.length > 0) {
    for (const item of missing) await ensureStockRow(ctx, season, item);
    Object.assign(stock, Object.fromEntries(missing.map((i) => [i.id, i.initialStock])));
  }
  const inv = Array.isArray(player.seasonInventory) ? player.seasonInventory : [];
  const bought = player.seasonStoreBought && player.seasonStoreBought.season === season ? player.seasonStoreBought.counts ?? {} : {};
  const vipSeasonKey = VIP_SEASON_KEY();
  return {
    season,
    seasonEndsAt: seasonEnd(),
    seasonXp: n(player.seasonXp, 0),
    seasonTokens: n(player.seasonTokens, 0),
    vipTokens: player.vipTokensSeason === vipSeasonKey ? n(player.vipTokens, 0) : 0,
    vipMaxPerSeason: VIP_TOKENS_PER_PURCHASE,
    exchangeRate: TOKEN_XP_RATE,
    items: SEASON_STORE.map((i) => ({ ...i, stock: stock[i.id] ?? 0, bought: bought[i.id] ?? 0 })),
    vipStore: VIP_STORE.map((i) => ({ ...i, bought: bought[i.id] ?? 0 })),
    inventory: inv,
    equipped: player.equippedCosmetics && typeof player.equippedCosmetics === "object" ? player.equippedCosmetics : {},
  };
}

// ===== QUERIES =====
export const getSeasonStoreState = query({
  args: {},
  handler: async (ctx) => await getStoreState(ctx),
});

// ===== EXCHANGE: season XP → tokens =====
export const exchangeXpForTokens = mutation({
  args: { xpAmount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const amount = Math.floor(args.xpAmount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid XP amount");
    const have = n(player.seasonXp, 0);
    if (amount > have) throw new Error(`You only have ${have.toLocaleString()} season XP`);
    await ctx.db.patch(player._id, {
      seasonXp: have - amount,
      seasonTokens: n(player.seasonTokens, 0) + amount * TOKEN_XP_RATE,
    } as any);
    return { success: true, tokens: amount * TOKEN_XP_RATE };
  },
});

// ===== BUY from the season store (tokens) =====
export const buySeasonItem = mutation({
  args: { itemId: v.string(), quantity: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const item = SEASON_STORE.find((i) => i.id === args.itemId);
    if (!item) throw new Error("Item not found");
    const qty = Math.max(1, Math.min(10, Math.floor(args.quantity ?? 1)));
    const season = currentSeason();
    const stockRow = await ensureStockRow(ctx, season, item);
    if (stockRow.stock < qty) throw new Error(`Out of stock — only ${stockRow.stock} left`);
    const cost = item.price * qty;
    if (n(player.seasonTokens, 0) < cost) throw new Error(`Need ${cost} tokens — you have ${n(player.seasonTokens, 0)}`);
    await ctx.db.patch(stockRow._id, { stock: stockRow.stock - qty });
    const patch: any = { seasonTokens: n(player.seasonTokens, 0) - cost };
    const inv = Array.isArray(player.seasonInventory) ? [...player.seasonInventory] : [];
    const bought = player.seasonStoreBought && player.seasonStoreBought.season === season ? { ...player.seasonStoreBought.counts } : {};
    for (let k = 0; k < qty; k++) {
      if (item.category === "pack") {
        // Packs drop into the normal packs inventory instead of cosmetics.
        const packs = player.packs && typeof player.packs === "object" ? { ...player.packs } : { common: 0, rare: 0, epic: 0, legendary: 0 };
        const kind = item.id === "common_pack" ? "common" : item.id === "epic_pack" ? "epic" : "legendary";
        packs[kind] = (packs[kind] ?? 0) + 1;
        patch.packs = packs;
      } else {
        inv.push({ id: item.id, name: item.name, category: item.category, emoji: item.emoji, acquiredAt: Date.now() });
      }
      bought[item.id] = (bought[item.id] ?? 0) + 1;
    }
    if (inv.length > (Array.isArray(player.seasonInventory) ? player.seasonInventory.length : 0)) patch.seasonInventory = inv;
    patch.seasonStoreBought = { season, counts: bought };
    await ctx.db.patch(player._id, patch);
    return { success: true, name: item.name, qty };
  },
});

// ===== BUY from the VIP store (VIP tokens) =====
export const buyVipStoreItem = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const item = VIP_STORE.find((i) => i.id === args.itemId);
    if (!item) throw new Error("Item not found");
    const season = currentSeason();
    const vipSeasonKey = VIP_SEASON_KEY();
    const tokens = player.vipTokensSeason === vipSeasonKey ? n(player.vipTokens, 0) : 0;
    if (tokens < item.price) throw new Error(`Need ${item.price} VIP tokens — you have ${tokens}`);
    const bought = player.seasonStoreBought && player.seasonStoreBought.season === season ? { ...player.seasonStoreBought.counts } : {};
    bought[item.id] = (bought[item.id] ?? 0) + 1;
    const patch: any = { vipTokens: tokens - item.price, vipTokensSeason: vipSeasonKey, seasonStoreBought: { season, counts: bought } };
    if (item.points) patch.points = n(player.points, 0) + item.points;
    if (item.bullets) patch.bullets = n(player.bullets, 0) + item.bullets;
    if (item.perks) {
      const packs = player.packs && typeof player.packs === "object" ? { ...player.packs } : { common: 0, rare: 0, epic: 0, legendary: 0 };
      packs.epic = (packs.epic ?? 0) + 2;
      packs.legendary = (packs.legendary ?? 0) + 1;
      patch.packs = packs;
    }
    if (item.id === "vip_crown_crate") {
      const inv = Array.isArray(player.seasonInventory) ? [...player.seasonInventory] : [];
      inv.push({ id: "aurelian_sovereign", name: "Aurelian Sovereign", category: "relic", emoji: "👑", acquiredAt: Date.now() });
      patch.seasonInventory = inv;
    }
    await ctx.db.patch(player._id, patch);
    return { success: true, name: item.name };
  },
});

// ===== EQUIP / UNEQUIP cosmetics =====
export const equipCosmetic = mutation({
  args: { itemId: v.string(), equip: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    const inv = Array.isArray(player.seasonInventory) ? player.seasonInventory : [];
    const owned = inv.find((x: any) => x.id === args.itemId);
    if (!owned) throw new Error("You do not own this cosmetic");
    const equipped = player.equippedCosmetics && typeof player.equippedCosmetics === "object" ? { ...player.equippedCosmetics } : {};
    if (args.equip) {
      equipped[owned.category] = owned.id;
    } else if (equipped[owned.category] === args.itemId) {
      delete equipped[owned.category];
    }
    await ctx.db.patch(player._id, { equippedCosmetics: equipped } as any);
    return { success: true, equipped };
  },
});

// ===== ADMIN: reset the season (stock, tokens, bought counts; keeps XP) =====
export const resetSeason = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") throw new Error("Admin only!");
    const season = currentSeason();
    for (const item of SEASON_STORE) {
      const row = await ctx.db
        .query("seasonStoreStock")
        .withIndex("by_season_item", (q: any) => q.eq("season", season).eq("itemId", item.id))
        .first();
      if (row) await ctx.db.patch(row._id, { stock: item.initialStock });
      else await ctx.db.insert("seasonStoreStock", { season, itemId: item.id, stock: item.initialStock });
    }
    const players = await ctx.db.query("users").collect();
    for (const p of players) {
      const newSeasonKey = VIP_SEASON_KEY();
      const patch: any = { seasonTokens: 0, seasonStoreBought: { season, counts: {} } };
      if (p.vipTokensSeason !== newSeasonKey) { patch.vipTokens = 0; patch.vipTokensSeason = newSeasonKey; }
      await ctx.db.patch(p._id, patch);
    }
    return { success: true, season };
  },
});

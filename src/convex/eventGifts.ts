import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ===== EVENT GIFT VAULT — 448 unique themed items, dropped during ANY active event =====
// Each theme contributes 56 named items (8 bases x 7 tiers).

interface Theme { id: string; icon: string; label: string; bases: string[] }

const THEMES: Theme[] = [
  {
    id: "purge", icon: "🔪", label: "Purge Night",
    bases: ["Purge Mask", "Lawless Blade", "Anarchy Vest", "Siren Breaker", "Chaos Charm", "Night Marauder", "Unrestricted Pass", "Judgment Token"],
  },
  {
    id: "blood_moon", icon: "🌑", label: "Blood Moon",
    bases: ["Bloodmoon Fang", "Crimson Talisman", "Lunar Shard", "Eclipse Cloak", "Werewolf Bane", "Red Mist Vial", "Moonlit Edge", "Tide of Blood"],
  },
  {
    id: "double_xp", icon: "⭐", label: "Double XP",
    bases: ["Scholar's Insignia", "Mentor's Seal", "Wisdom Bead", "Ascension Coin", "Enlightened Band", "Veteran Badge", "Prodigy Emblem", "Master's Sigil"],
  },
  {
    id: "cash_rain", icon: "🌧️", label: "Cash Rain",
    bases: ["Raincheck Bundle", "Golden Droplet", "Tycoon Cufflink", "Money Clip Royale", "Vault Keychain", "Banker's Pen", "Fortune Umbrella", "Storm of Bills"],
  },
  {
    id: "diamond_rush", icon: "💎", label: "Diamond Rush",
    bases: ["Rush Diamond", "Miner's Pick Charm", "Karat Crown", "Gemstone Geode", "Brilliance Pendant", "Faceted Star", "Carbon Heart", "Prism of Wealth"],
  },
  {
    id: "halloween", icon: "🎃", label: "Halloween Horror",
    bases: ["Haunted Lantern", "Witch's Hex Bag", "Phantom Veil", "Grave Dust Jar", "Screaming Soul Jar", "Jack-O Sigil", "Reaper's Coupon", "Ghoulish Grin"],
  },
  {
    id: "christmas", icon: "🎄", label: "Christmas Heist",
    bases: ["Frosty Locket", "Santa's Sleigh Bell", "Icicle Dagger", "Gift-Wrapped Bounty", "Elven Craft Token", "Snow Globe Vault", "Mistletoe Charm", "Yuletide Star"],
  },
  {
    id: "golden_hour", icon: "✨", label: "Golden Hour",
    bases: ["Sunset Ingot", "Gilded Feather", "Amber Ray Prism", "Dawn Chalice", "Radiant Coin", "Hour of Gold Watch", "Lightbender Lens", "Aurora Thread"],
  },
];

const TIERS = ["Common", "Polished", "Fine", "Rare", "Exquisite", "Epic", "Legendary"];

const TIER_RANGE: Record<string, [number, number]> = {
  Common: [50_000, 250_000],
  Polished: [250_000, 750_000],
  Fine: [750_000, 2_000_000],
  Rare: [2_000_000, 6_000_000],
  Exquisite: [6_000_000, 15_000_000],
  Epic: [15_000_000, 40_000_000],
  Legendary: [40_000_000, 120_000_000],
};

export const EVENT_GIFT_COUNT = THEMES.length * THEMES[0].bases.length * TIERS.length; // 8*8*7 = 448

/** Roll one random themed gift item. */
function rollGift(eventId?: string) {
  const theme = eventId ? (THEMES.find((t) => t.id === eventId) ?? THEMES[Math.floor(Math.random() * THEMES.length)]) : THEMES[Math.floor(Math.random() * THEMES.length)];
  const base = theme.bases[Math.floor(Math.random() * theme.bases.length)];
  const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
  const [min, max] = TIER_RANGE[tier];
  const price = min + Math.floor(Math.random() * ((max - min) / 25_000)) * 25_000;
  return {
    name: `${theme.icon} ${theme.label} ${base} (${tier})`,
    type: "event_gift",
    rarity: tier.toLowerCase() === "common" ? "common" : tier.toLowerCase(),
    price,
    icon: theme.icon,
  };
}

// Grant a gift drop from an active event (called by client after successful crimes)
export const grantEventGift = mutation({
  args: { eventId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const gift = rollGift(args.eventId);
    await ctx.db.insert("inventory", {
      userId,
      itemId: `event_gift_${Date.now()}`,
      name: gift.name,
      type: gift.type,
      equipped: false,
      quantity: 1,
      rarity: gift.rarity,
      price: gift.price,
    });
    return { success: true, message: `${gift.name} found! Worth $${gift.price.toLocaleString()} — sell it in My Items!` };
  },
});

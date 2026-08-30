import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// XP Volume System: More actions = higher XP multiplier
// Tracks actions in a rolling window and applies a stacking bonus

export const XP_VOLUME_TIERS = [
  { min: 0,   mult: 1.0,  label: "" },
  { min: 3,   mult: 1.25, label: "🔥 Warming Up" },
  { min: 8,   mult: 1.5,  label: "🔥🔥 On Fire" },
  { min: 15,  mult: 2.0,  label: "🔥🔥🔥 Burning Bright" },
  { min: 25,  mult: 2.5,  label: "💥 Rampage" },
  { min: 40,  mult: 3.0,  label: "💥💥 Frenzy" },
  { min: 60,  mult: 4.0,  label: "💀 Bloodlust" },
  { min: 85,  mult: 5.0,  label: "💀💀 Rampage Mode" },
  { min: 115, mult: 6.0,  label: "☠️ RELENTLESS" },
  { min: 150, mult: 8.0,  label: "☠️☠️ UNSTOPPABLE" },
  { min: 190, mult: 10.0, label: "👹 LEGENDARY GRIND" },
  { min: 230, mult: 12.0, label: "👑 GODLIKE GRIND" },
  { min: 270, mult: 15.0, label: "⚡ OVERDRIVE" },
  { min: 320, mult: 20.0, label: "🌋 MAXIMUM OVERDRIVE" },
];

const WINDOW_MS = 3600000; // 1 hour rolling window

export function getVolumeMult(actionCount: number): { mult: number; label: string; tier: number } {
  let tier = 0;
  for (let i = XP_VOLUME_TIERS.length - 1; i >= 0; i--) {
    if (actionCount >= XP_VOLUME_TIERS[i].min) {
      tier = i;
      break;
    }
  }
  return {
    mult: XP_VOLUME_TIERS[tier].mult,
    label: XP_VOLUME_TIERS[tier].label,
    tier,
  };
}

// Call this after every action to track volume
export const recordAction = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { volumeActions: 0, volumeMult: 1, volumeLabel: "" };

    const userId = await getAuthUserId(ctx);
    if (!userId) return { volumeActions: 0, volumeMult: 1, volumeLabel: "" };
    const player = await ctx.db.get(userId);
    if (!player) return { volumeActions: 0, volumeMult: 1, volumeLabel: "" };

    const now = Date.now();
    const timestamps: number[] = (player as any).actionTimestamps ?? [];
    
    // Add current action and filter to last hour
    const recent = [...timestamps, now].filter(t => now - t < WINDOW_MS);
    
    // Keep max 1000 timestamps
    const trimmed = recent.slice(-1000);
    
    const { mult, label, tier } = getVolumeMult(trimmed.length);
    
    await ctx.db.patch(userId, {
      actionTimestamps: trimmed,
    } as any);

    return { volumeActions: trimmed.length, volumeMult: mult, volumeLabel: label, tier };
  },
});

export const getVolumeStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { actions: 0, mult: 1, label: "", tier: 0, nextTierAt: 3, nextTierMult: 1.25 };

    const userId = await getAuthUserId(ctx);
    if (!userId) return { actions: 0, mult: 1, label: "", tier: 0, nextTierAt: 3, nextTierMult: 1.25 };
    const player = await ctx.db.get(userId);
    if (!player) return { actions: 0, mult: 1, label: "", tier: 0, nextTierAt: 3, nextTierMult: 1.25 };

    const now = Date.now();
    const timestamps: number[] = Array.isArray((player as any).actionTimestamps)
      ? (player as any).actionTimestamps.filter((timestamp: unknown): timestamp is number => typeof timestamp === "number" && Number.isFinite(timestamp))
      : [];
    const recent = timestamps.filter((t: number) => now - t >= 0 && now - t < WINDOW_MS);
    
    const { mult, label, tier } = getVolumeMult(recent.length);
    
    // Find next tier
    let nextTierAt = 0;
    let nextTierMult = 1;
    for (const t of XP_VOLUME_TIERS) {
      if (t.min > recent.length) {
        nextTierAt = t.min;
        nextTierMult = t.mult;
        break;
      }
    }
    
    return {
      actions: recent.length,
      mult,
      label,
      tier,
      nextTierAt,
      nextTierMult,
    };
  },
});

import { api } from "@/convex/_generated/api";

/** True when the admin-activated Easter Egg Hunt event is live */
export function isEasterEventActive(): boolean {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem("activeEventIds") || "[]");
    return ids.includes("evt_easter");
  } catch {
    return false;
  }
}

function activeEventIds(): string[] {
  try { return JSON.parse(localStorage.getItem("activeEventIds") || "[]"); } catch { return []; }
}

/**
 * Call right after a successful crime.
 * During ANY active non-Easter event: 30% chance to drop a themed gift item (448-item vault).
 * Returns a message to show the player, or null.
 */
export async function maybeDropEventGift(
  grantGift: (args: { eventId?: string }) => Promise<{ success: boolean; message?: string }>,
  success: boolean,
): Promise<string | null> {
  if (!success) return null;
  const events = activeEventIds().filter((id) => id && id !== "evt_easter");
  if (events.length === 0) return null;
  if (Math.random() > 0.3) return null;
  const pick = events[Math.floor(Math.random() * events.length)];
  try {
    const r = await grantGift({ eventId: pick });
    return r?.message ? `🎁 EVENT GIFT! ${r.message}` : null;
  } catch {
    return null;
  }
}

/**
 * Call right after a successful crime.
 * Only drops when the Easter Egg Hunt event is active — 100% guaranteed drop.
 * Returns a message to show the player, or null.
 */
export async function maybeDropEasterEgg(
  grantEgg: (args: Record<string, never>) => Promise<{ success: boolean }>,
  success: boolean,
): Promise<string | null> {
  if (!success || !isEasterEventActive()) return null;
  try {
    await grantEgg({});
    return "🥚 EASTER EGG FOUND! Open it in My Items for a legendary prize!";
  } catch {
    return null;
  }
}

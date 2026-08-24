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

import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";

// SHA-256 hash identical to the one used by authCustom.ts so legacy accounts
// (passwordHash written by the old custom login) still verify.
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Fields a brand-new player needs. Kept in one place because both "upgrade
// anonymous account" and "create fresh account" paths need the same baseline.
function newPlayerFields(username: string, passwordHash: string) {
  const now = Date.now();
  return {
    username,
    passwordHash,
    nickname: username,
    money: 50000,
    bank: 0,
    points: 0,
    coins: 0,
    bullets: 0,
    life: 100,
    maxLife: 100,
    defense: 10,
    attack: 10,
    level: 1,
    experience: 0,
    location: "New York",
    inPrison: false,
    prisonTime: 0,
    isDead: false,
    totalCrimes: 0,
    totalFights: 0,
    totalKills: 0,
    totalDeaths: 0,
    dailyRaidUsed: 0,
    lastDailyRaid: 0,
    registeredAt: now,
    lastRegenAt: now,
    lastActive: now,
    wantedLevel: 0,
    reputation: 0,
    reputationAlignment: "neutral",
    prestige: 0,
    prestigeMultiplier: 1,
    levelUpPending: false,
    skillPoints: 0,
    energy: 100, maxEnergy: 100, stamina: 100, maxStamina: 100,
    focus: 100, maxFocus: 100, morale: 80, maxMorale: 100,
    adrenaline: 0, maxAdrenaline: 100, heat: 0, maxHeat: 100,
    lastEnergyRegen: 0, lastStaminaRegen: 0, lastFocusRegen: 0,
    schoolLevel: 0,
    schoolXp: 0,
    schoolStreak: 0,
    schoolLastLessonAt: 0,
    perks: {},
  };
}

/**
 * Username + password sign-in that actually creates a persistent Convex Auth
 * session. The client calls:
 *   signIn("password", { username, password, flow: "signIn" })   → login
 *   signIn("password", { username, password, flow: "signUp" })   → register
 * Both flows return the SAME player row for the same username, so a returning
 * player always lands back on their old criminal — never a new one.
 */
export const credentialsProvider = ConvexCredentials({
  id: "password",
  authorize: async (credentials, ctx) => {
    // The generic data model can't type this project's schema (schemaValidation
    // is disabled), so reach for the db through a loose alias.
    const db = (ctx as unknown as { db: any }).db;
    const rawUsername = String(credentials?.username ?? "").trim().toLowerCase();
    const password = String(credentials?.password ?? "");
    const flow = String(credentials?.flow ?? "signIn");

    if (rawUsername.length < 3 || rawUsername.length > 20) {
      throw new Error("Username must be 3-20 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(rawUsername)) {
      throw new Error("Username can only contain letters, numbers, and underscores");
    }
    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }

    const existing = await db
      .query("users")
      .withIndex("by_username", (q: any) => q.eq("username", rawUsername))
      .first();

    if (existing) {
      // ── Returning player ──────────────────────────────────────────────
      if (!existing.passwordHash) {
        throw new Error("This account was created as a guest. Use Continue as Guest, then recover your character by nickname.");
      }
      const passwordHash = await hashPassword(password);
      if (passwordHash !== existing.passwordHash) {
        throw new Error("Incorrect password");
      }
      await db.patch(existing._id, { lastActive: Date.now() } as any);
      return { userId: existing._id };
    }

    // ── New account (signUp flow only) ────────────────────────────────
    if (flow !== "signUp") {
      throw new Error("No account with that username. Create one first!");
    }
    const passwordHash = await hashPassword(password);
    const fields = newPlayerFields(rawUsername, passwordHash);
    const userId = await db.insert("users", fields as any);
    return { userId };
  },
});

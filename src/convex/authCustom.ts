import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Simple hash for password (SHA-256 via Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Register with username + password
export const register = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    const password = args.password;

    // Validate
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be 3-20 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error("Username can only contain letters, numbers, and underscores");
    }
    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }

    // Check if username already taken
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (existing) {
      throw new Error("Username is already taken");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get current auth user if logged in (anonymous)
    const currentUserId = await getAuthUserId(ctx);

    if (currentUserId) {
      // Upgrade anonymous account to username/password
      await ctx.db.patch(currentUserId, {
        username,
        passwordHash,
        nickname: args.username.trim(),
        registeredAt: Date.now(),
      });
      return { success: true, message: "Account upgraded!", userId: currentUserId };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      money: 50000,
      bank: 0,
      points: 0,
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
      lastRegenAt: Date.now(),
      wantedLevel: 0,
      reputation: 0,
      reputationAlignment: "neutral",
      prestige: 0,
      prestigeMultiplier: 1,
      levelUpPending: false,
      skillPoints: 0,
      cellLevel: 1,
      solitaryTime: 0,
      contraband: 0,
      prisonCurrency: 0,
      paroleEligible: false,
      totalPrisonEscapes: 0,
      totalPrisonJobs: 0,
      totalEarned: 0,
      highestLevel: 1,
      totalPlaytime: 0,
      insuranceActive: false,
      loanAmount: 0,
      loanDueAt: 0,
      dirtyMoney: 0,
      counterfeitSkill: 0,
      smugglingRuns: 0,
      drugDeals: 0,
      racketeeringIncome: 0,
      loanSharkDebts: 0,
      witnessIntimidations: 0,
      identityThefts: 0,
      kidnappings: 0,
      arsons: 0,
      cargoThefts: 0,
      armsDeals: 0,
      illegalBoxingEvents: 0,
      pirateRadioBoost: 0,
      prostitutionRings: 0,
      gamblingDens: 0,
      protectionRackets: 0,
      lastBlackMarketRefresh: 0,
      totalLaundered: 0,
      armorDurability: 0,
      weaponProficiency: 0,
      killsThisSeason: 0,
      deathsThisSeason: 0,
      retaliationUntil: 0,
      lastDeathAt: 0,
      isKidnapped: false,
      betrayalCount: 0,
      totalGifting: 0,
      totalMentoring: 0,
      lastActive: Date.now(),
      username,
      passwordHash,
      nickname: args.username.trim(),
      registeredAt: Date.now(),
    });

    return { success: true, message: "Account created!", userId };
  },
});

// Login with username + password
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();

    // Find user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (!user) {
      throw new Error("Username not found");
    }

    if (!user.passwordHash) {
      throw new Error("This account uses a different login method");
    }

    // Verify password
    const passwordHash = await hashPassword(args.password);
    if (passwordHash !== user.passwordHash) {
      throw new Error("Incorrect password");
    }

    // Update last active
    await ctx.db.patch(user._id, { lastActive: Date.now() });

    // Create a session for this user via Convex Auth
    // We'll use a custom session approach - patch the current auth session
    const currentUserId = await getAuthUserId(ctx);
    if (currentUserId && currentUserId !== user._id) {
      // User is logged in as someone else - they need to log out first
      throw new Error("Please log out first before logging in with a different account");
    }

    return { success: true, message: "Login successful!", userId: user._id, username: user.username };
  },
});

// Check if user is registered (by username)
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim().toLowerCase()))
      .first();
    return { exists: !!user, hasPassword: !!user?.passwordHash };
  },
});

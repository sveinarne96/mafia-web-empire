import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";

// THE ONE LOGIN: username + password.
//  - Existing account -> verify password and sign the player back in.
//  - New username     -> creates the account and the full game profile.
//  - Guest adoption   -> the guest's current character becomes the account.
// Hashes use the same SHA-256 scheme as earlier versions, so all legacy
// accounts still sign in.

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function newPlayerFields(username: string, passwordHash: string) {
  const now = Date.now();
  return {
    username,
    passwordHash,
    nickname: username,
    money: 50000,
    bank: 0,
    points: 0,
    coins: 2,
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
    cellLevel: 1,
    solitaryTime: 0,
    contraband: 0,
    prisonCurrency: 0,
    paroleEligible: false,
    totalPrisonEscapes: 0,
    totalPrisonJobs: 0,
    totalEarned: 50000,
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
    lastCrimeAt: 0,
    isBanned: false,
    energy: 100,
    maxEnergy: 100,
    stamina: 100,
    maxStamina: 100,
    focus: 100,
    maxFocus: 100,
    morale: 80,
    maxMorale: 100,
    adrenaline: 0,
    maxAdrenaline: 100,
    heat: 0,
    maxHeat: 100,
    lastEnergyRegen: 0,
    lastStaminaRegen: 0,
    lastFocusRegen: 0,
    schoolLevel: 0,
    schoolXp: 0,
    schoolStreak: 0,
    schoolLastLessonAt: 0,
    perks: {},
    robotBodyguards: [],
    accountUpgrades: {},
    seasonXp: 0,
    seasonTiersClaimed: [],
    vipUntil: 0,
    objectiveProgress: {},
    objectivesClaimed: {},
    milestonesClaimed: {},
    totalActions: 0,
    packsOpened: 0,
    scratchCards: 0,
  };
}

export const credentialsProvider = ConvexCredentials({
  id: "password",
  authorize: async (credentials, ctx) => {
    const db = (ctx as unknown as { db: any }).db;
      const username = String(credentials?.username ?? "").trim();
      const password = String(credentials?.password ?? "");
      const flow = String(credentials?.flow ?? "signIn");
      const adoptGuest = credentials?.adoptGuest === true;

      if (username.length < 3 || username.length > 20) {
        throw new Error("Username must be 3-20 characters");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("Only letters, numbers and underscores");
      }
      if (password.length < 4) {
        throw new Error("Password must be at least 4 characters");
      }

      const lower = username.toLowerCase();
      const passwordHash = await hashPassword(password);

      // Case-insensitive lookup so "Medusa" and "medusa" are the same account.
      const byExact = await db
        .query("users")
        .withIndex("by_username", (q: any) => q.eq("username", lower))
        .first();
      let existing = byExact as any;
      if (!existing) {
        const all = (await db.query("users").collect()) as any[];
        existing = all.find(
          (u) =>
            !u.isBotPlayer &&
            !u.isSystemChar &&
            typeof u.username === "string" &&
            u.username.trim().toLowerCase() === lower,
        );
      }

      if (existing) {
        if (existing.isBanned) throw new Error("This account is banned");
        if (!existing.passwordHash) {
          // Guest shell or legacy row: adopt it into this account when asked.
          if (adoptGuest || flow === "signUp") {
            await db.patch(existing._id, {
              username: lower,
              passwordHash,
              nickname: existing.nickname || username,
              isAnonymous: false,
              lastActive: Date.now(),
            });
            return { userId: existing._id };
          }
          throw new Error("This character has no password set yet. Create the account with the same name to claim it.");
        }
        if ((await hashPassword(password)) !== existing.passwordHash) {
          throw new Error("Incorrect password");
        }
        await db.patch(existing._id, { lastActive: Date.now() });
        return { userId: existing._id };
      }

      // New account. In signUp flow we also adopt the current guest character
      // so guests never lose their progress when creating an account.
      const currentUserId = await (ctx as any).auth?.getUserId?.();
      if (flow === "signUp" && currentUserId && adoptGuest) {
        const guest = await db.get(currentUserId);
        if (guest) {
          await db.patch(currentUserId, {
            username: lower,
            passwordHash,
            isAnonymous: false,
            registeredAt: (guest as any).registeredAt || Date.now(),
            lastActive: Date.now(),
          });
          return { userId: currentUserId };
        }
      }

      if (flow !== "signUp") {
        throw new Error("No account with that name yet — pick Create Account");
      }

      const userId = await db.insert("users", newPlayerFields(lower, passwordHash));
      return { userId };
  },
});

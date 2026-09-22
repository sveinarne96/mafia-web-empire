import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getPlayer(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

// ===== MISSION GENERATION =====
// 100+ categories × 100,000 variations each = 10M+ missions

const CATEGORIES = [
  { id: "street", name: "Street Crime", emoji: "🔪", color: "red" },
  { id: "heist", name: "Heist", emoji: "🏦", color: "yellow" },
  { id: "smuggle", name: "Smuggling", emoji: "🚛", color: "purple" },
  { id: "hack", name: "Cyber Crime", emoji: "💻", color: "cyan" },
  { id: "drug", name: "Drug Ops", emoji: "💊", color: "green" },
  { id: "assassinate", name: "Assassination", emoji: "💀", color: "red" },
  { id: "fraud", name: "Fraud", emoji: "🎭", color: "orange" },
  { id: "gamble", name: "Gambling", emoji: "🎰", color: "yellow" },
  { id: "extort", name: "Extortion", emoji: "💰", color: "green" },
  { id: "arson", name: "Arson", emoji: "🔥", color: "orange" },
  { id: "kidnap", name: "Kidnapping", emoji: "🪢", color: "red" },
  { id: "bribe", name: "Bribery", emoji: "🤝", color: "green" },
  { id: "data", name: "Data Theft", emoji: "📊", color: "cyan" },
  { id: "race", name: "Street Racing", emoji: "🏎️", color: "blue" },
  { id: "fence", name: "Fencing", emoji: "🏪", color: "yellow" },
  { id: "counterfeit", name: "Counterfeiting", emoji: "💵", color: "green" },
  { id: "blackmail", name: "Blackmail", emoji: "📸", color: "purple" },
  { id: "bounty", name: "Bounty Hunt", emoji: "🎯", color: "red" },
  { id: "escape", name: "Prison Escape", emoji: "🏃", color: "orange" },
  { id: "sabotage", name: "Sabotage", emoji: "💣", color: "red" },
  { id: "infiltrate", name: "Infiltration", emoji: "🕵️", color: "blue" },
  { id: "smuggle_weapons", name: "Arms Smuggling", emoji: "🔫", color: "red" },
  { id: "territory", name: "Territory War", emoji: "🗺️", color: "orange" },
  { id: "diamond", name: "Diamond Heist", emoji: "💎", color: "cyan" },
  { id: "art", name: "Art Theft", emoji: "🖼️", color: "purple" },
  { id: "cargo", name: "Cargo Raid", emoji: "📦", color: "yellow" },
  { id: "cyber_heist", name: "Cyber Heist", emoji: "🌐", color: "cyan" },
  { id: "witness", name: "Witness Tampering", emoji: "🤐", color: "gray" },
  { id: "smuggle_art", name: "Art Smuggling", emoji: "🎭", color: "purple" },
  { id: "bank", name: "Bank Robbery", emoji: "🏦", color: "yellow" },
];

const CITIES = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Boston", "Detroit", "Houston", "Phoenix", "Seattle"];

const TARGETS = [
  "convenience store", "jewelry shop", "bank vault", "armored truck", "warehouse",
  "casino", "museum", "private yacht", "penthouse suite", "embassy",
  "police evidence room", "government building", "ferry terminal", "airport cargo",
  "construction site", "pharmacy", "electronics store", "art gallery", "diamond exchange",
  "stock exchange", "data center", "power plant", "water treatment", "prison transport",
  "VIP hotel suite", "rival crew hideout", "underground casino", "narco stash house",
  "offshore accounts", "political fundraiser", "charity gala", "tech company HQ",
];

const WEAPONS = [
  "silenced pistol", "combat knife", "molotov cocktail", "sawed-off shotgun",
  "C4 explosive", "taser", "baton", "crossbow", "poison", "wire",
];

const DIFFICULTY_NAMES = {
  easy: { label: "Easy", emoji: "🟢", color: "text-green-400" },
  medium: { label: "Medium", emoji: "🟡", color: "text-yellow-400" },
  hard: { label: "Hard", emoji: "🟠", color: "text-orange-400" },
  brutal: { label: "Brutal", emoji: "🔴", color: "text-red-400" },
  impossible: { label: "Impossible", emoji: "💀", color: "text-red-500" },
  legendary: { label: "Legendary", emoji: "👑", color: "text-yellow-300" },
};

const STORY_PREFIXES = [
  "The Silent", "Operation", "Project", "The Great", "Midnight", "Shadow",
  "Crimson", "Iron", "Phantom", "Ghost", "Blood", "Steel", "Black",
  "Golden", "Silver", "Copper", "Neon", "Velvet", "Diamond", "Emerald",
];

const STORY_SUFFIXES = [
  "Coup", "Heist", "Raid", "Storm", "Strike", "Reckoning", "Conquest",
  "Blitz", "Assault", "Siege", "Collapse", "Redemption", "Revenge",
  "Uprising", "Downfall", "Empire", "Legacy", "Requiem", "Whisper", "Thunder",
];

// Deterministic hash from string to number
function hashStr(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

// Seeded pseudo-random from seed
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface GeneratedMission {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryEmoji: string;
  categoryColor: string;
  difficulty: string;
  difficultyLabel: string;
  difficultyEmoji: string;
  difficultyColor: string;
  city: string;
  xpReward: number;
  moneyReward: number;
  timeLimit: number; // minutes
  levelRequired: number;
  storyArc?: string;
  chapter?: number;
}

// Generate a single mission from a seed
function generateMission(seed: number, playerLevel: number): GeneratedMission {
  const rng = seededRandom(seed);

  const catIdx = Math.floor(rng() * CATEGORIES.length);
  const cat = CATEGORIES[catIdx];

  const diffRoll = rng();
  let diffKey: string;
  let diffMultiplier: number;
  let levelReq: number;
  if (diffRoll < 0.15) { diffKey = "easy"; diffMultiplier = 1; levelReq = 1; }
  else if (diffRoll < 0.35) { diffKey = "medium"; diffMultiplier = 2; levelReq = 5; }
  else if (diffRoll < 0.55) { diffKey = "hard"; diffMultiplier = 4; levelReq = 10; }
  else if (diffRoll < 0.72) { diffKey = "brutal"; diffMultiplier = 7; levelReq = 20; }
  else if (diffRoll < 0.88) { diffKey = "impossible"; diffMultiplier = 12; levelReq = 35; }
  else { diffKey = "legendary"; diffMultiplier = 20; levelReq = 50; }

  const diff = DIFFICULTY_NAMES[diffKey as keyof typeof DIFFICULTY_NAMES];
  const cityIdx = Math.floor(rng() * CITIES.length);
  const targetIdx = Math.floor(rng() * TARGETS.length);
  const weaponIdx = Math.floor(rng() * WEAPONS.length);
  const prefixIdx = Math.floor(rng() * STORY_PREFIXES.length);
  const suffixIdx = Math.floor(rng() * STORY_SUFFIXES.length);

  const moneyReward = Math.floor((500 + rng() * 50000) * diffMultiplier);
  const xpReward = Math.floor((10 + rng() * 200) * diffMultiplier);
  const timeLimit = Math.floor(15 + rng() * 105); // 15-120 minutes

  // Determine if this is part of a story arc
  const isStory = rng() < 0.05;
  const storyArc = isStory ? `${STORY_PREFIXES[prefixIdx]} ${STORY_SUFFIXES[suffixIdx]}` : undefined;
  const chapter = isStory ? Math.floor(rng() * 15) + 1 : undefined;

  const name = isStory
    ? `${storyArc} - Chapter ${chapter}`
    : `${cat.emoji} ${STORY_PREFIXES[prefixIdx]} ${TARGETS[targetIdx].split(" ")[0]}`;

  // Category-specific descriptions with detailed what-to-do instructions
  const actionVerbs = ["Execute", "Complete", "Pull off", "Carry out", "Perform", "Run", "Orchestrate"];
  const stealthTips = ["Use stealth", "Stay in the shadows", "Avoid cameras", "Wear a mask", "Disable alarms first"];
  const exitStrategies = ["Escape through the back", "Have a getaway car ready", "Blend into the crowd", "Use the sewers", "Helicopter extraction"];
  const va = actionVerbs[Math.floor(rng() * actionVerbs.length)];
  const st = stealthTips[Math.floor(rng() * stealthTips.length)].toLowerCase();
  const ex = exitStrategies[Math.floor(rng() * exitStrategies.length)];
  const t = TARGETS[targetIdx];
  const c = CITIES[cityIdx];
  const w = WEAPONS[weaponIdx];

  // Build description based on category with specific instructions
  const categoryActions: Record<string, string> = {
    street: `${va} a street crime at ${t} in ${c}. Approach your target, choose your weapon (${w}), and strike when the moment is right. Steal valuables and ${ex}. Warning: police response time is fast in this area.`,
    heist: `${va} a heist on ${t} in ${c}. First, scout the location and plan your entry. Bring a crew if possible — you'll need a hacker, a driver, and muscle. ${st}, crack the vault, grab the loot, and ${ex}. The reward is massive but so is the risk.`,
    smuggle: `Smuggle contraband through ${c} via ${t}. Load up your vehicle with the goods, avoid police checkpoints, and deliver to the drop-off point. ${st} — one wrong move and you lose everything. Use decoy shipments if needed.`,
    hack: `Hack into ${t} in ${c}. Access the network, bypass firewalls, and extract valuable data. You'll need to ${st} while downloading files. Watch for intrusion detection systems. Download speed: slow = safe, fast = risky. Sell the data on the black market after.`,
    drug: `Run a drug operation at ${t} in ${c}. Set up your distribution network, negotiate with suppliers, and move product through the streets. ${st} — undercover cops are everywhere. Use encrypted communication and dead drops. Pay off local contacts for protection.`,
    assassinate: `Carry out an assassination contract at ${t} in ${c}. Study your target's routine, pick the perfect moment, and use a ${w}. ${st} and have an escape plan ready. Confirm the kill and collect your payment from the contract board.`,
    fraud: `Execute a fraud scheme at ${t} in ${c}. Create fake documents, set up shell companies, and launder the money through multiple accounts. ${st} — the IRS doesn't forgive. Use multiple identities and rotate your methods.`,
    gamble: `Place your bets at ${t} in ${c}. Study the odds, manage your bankroll, and know when to walk away. Set a loss limit of $${Math.floor(moneyReward * 0.5).toLocaleString()} and a win target of $${moneyReward.toLocaleString()}. Don't chase losses.`,
    extort: `Extort protection money from ${t} in ${c}. Approach the owner, make your demands clear, and enforce your territory. Use a ${w} for intimidation if needed. Collect weekly payments or face consequences. Keep the operation low-key to avoid police attention.`,
    arson: `Set fire to ${t} in ${c}. Pour accelerant, light the fuse, and ${ex}. Use a ${w} to cover your tracks. Make sure no one is inside before you start. Watch the fire spread from a safe distance and disappear before firefighters arrive.`,
    kidnap: `Kidnap a high-value target at ${t} in ${c}. Grab the target, secure them in a safe house, and demand ransom. ${st} during the abduction — use a van and a ${w}. Negotiate hard and collect the payment. Release the target once paid.`,
    bribe: `Bribe officials at ${t} in ${c}. Slip a $${Math.floor(moneyReward * 0.3).toLocaleString()} envelope to the right person, get the favor you need, and walk away clean. Keep the paper trail minimal — cash only. Establish a long-term relationship for future deals.`,
    data: `Steal data from ${t} in ${c}. Plant a keylogger, access the server room, and copy everything to an encrypted drive. ${st} — security cameras are everywhere. Delete your logs and ${ex}. The data sells for a fortune on the dark web.`,
    race: `Win an illegal street race through ${c} starting near ${t}. Pick your fastest car, tune the engine, and race against rival drivers. Use nitrous at the right moment, take shortcuts through alleyways, and cross the finish line first. Avoid police roadblocks.`,
    fence: `Fence stolen goods at ${t} in ${c}. Bring your hot items to the buyer, negotiate the best price (expect 40-70% of market value), and wash the money clean. Build a reputation for quality goods and reliable delivery.`,
    counterfeit: `Operate a counterfeiting ring at ${t} in ${c}. Set up a printing press, produce fake bills or designer goods, and distribute through your network. ${st} — Secret Service watches for fakes. Rotate your printing plates and vary the serial numbers.`,
    blackmail: `Gather blackmail material on someone at ${t} in ${c}. Plant surveillance devices, photograph incriminating evidence, and compile a dossier. Contact the target with your demands. $${moneyReward.toLocaleString()} or the photos go public. Pay up or else.`,
    bounty: `Hunt a bounty target at ${t} in ${c}. Study the target's profile, track their movements, and close in for the capture. Use a ${w} if they resist. Bring them in alive for full reward, dead for half. Check the bounty board for new contracts.`,
    escape: `Plan a prison escape from ${t} in ${c}. Bribe a guard, dig a tunnel, or create a distraction. ${st} during your escape. Have a getaway car waiting outside the walls. Change your appearance immediately after escaping. Lay low for 48 hours.`,
    sabotage: `Sabotage ${t} in ${c}. Plant explosives, cut power lines, or poison the water supply. Use a ${w} and set timed charges. ${ex} before the damage is discovered. The target won't know what hit them until it's too late.`,
    infiltrate: `Infiltrate ${t} in ${c}. Create a fake identity, get hired, and access restricted areas from the inside. ${st} — don't blow your cover. Copy files, plant bugs, and gather intelligence. Leave no trace of your real identity when you exit.`,
    smuggle_weapons: `Smuggle weapons through ${t} in ${c}. Conceal firearms in shipping containers, bribe customs officials, and move the arsenal to your distribution point. ${st} — weapons charges carry life sentences. Use encrypted radios and avoid repeated routes.`,
    territory: `Claim territory at ${t} in ${c}. Rally your crew, secure the perimeter, and establish control. Fight off rival gangs using ${w} tactics. Set up lookouts, mark your turf, and collect tribute from local businesses. Hold the ground or lose it all.`,
    diamond: `Steal diamonds from ${t} in ${c}. This is a high-security target — you'll need laser cutters, a replica to swap, and perfect timing. ${st} through the laser grid, grab the gems, and ${ex}. Each diamond is worth $${Math.floor(moneyReward / 5).toLocaleString()}.`,
    art: `Steal art from ${t} in ${c}. Study the security layout, create a replica to swap, and ${st} past the guards. Remove the painting carefully — one scratch and it's worthless. ${ex} with the art hidden in a vehicle. Sell to a private collector.`,
    cargo: `Raid cargo at ${t} in ${c}. Intercept the shipment during transfer, overpower the guards, and load the goods into your vehicle. Use a ${w} if resistance is met. ${ex} before backup arrives. Check the cargo manifest — some items are worth more than others.`,
    cyber_heist: `Execute a cyber heist on ${t} in ${c}. Deploy ransomware, encrypt their systems, and demand payment in cryptocurrency. Set up a dead drop for the decryption key exchange. ${st} — don't leave your IP exposed. Launder the crypto through mixers.`,
    witness: `Tamper with a witness at ${t} in ${c}. Approach them, make an offer they can't refuse, or apply pressure through their family. Destroy any evidence they might have. ${st} — the prosecutor is watching. Once silenced, the case falls apart.`,
    smuggle_art: `Smuggle art through ${t} in ${c}. Conceal paintings in fake frames, ship through customs with forged provenance documents, and deliver to the buyer. ${st} — art theft Interpol agents patrol this route. Vary your shipping schedule.`,
    bank: `Rob ${t} in ${c}. Enter with a ${w}, take control of the lobby, and force the manager to open the vault. Grab cash, jewelry, and safety deposit contents. Set a 3-minute timer and ${ex} when the alarm triggers. Split the take with your crew.`,
  };

  const desc = categoryActions[cat.id] || `${va} a ${cat.name} operation at ${t} in ${c}. Use a ${w}, ${st.toLowerCase()}, and ${ex.toLowerCase()}. The reward is $${moneyReward.toLocaleString()} — don't mess this up.`;

  return {
    id: `m_${seed}`,
    name,
    description: desc,
    category: cat.id,
    categoryEmoji: cat.emoji,
    categoryColor: cat.color,
    difficulty: diffKey,
    difficultyLabel: diff.label,
    difficultyEmoji: diff.emoji,
    difficultyColor: diff.color,
    city: CITIES[cityIdx],
    xpReward,
    moneyReward,
    timeLimit,
    levelRequired: Math.min(levelReq, 50),
    storyArc,
    chapter,
  };
}

// ===== QUERIES =====

// Get missions for a player (paginated, filtered)
export const getMissions = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) return { missions: [], total: 0, completedIds: [] };

    const level = player.level ?? 1;

    // Get completed mission IDs for this player
    const completed = await ctx.db
      .query("completedMissions")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();
    const completedSet = new Set(completed.map((c: any) => c.missionId));
    const completedCount = completedSet.size;

    // Generate missions procedurally - skip completed ones
    const pageSize = args.pageSize;
    const startSeed = args.page * 10000; // Each page starts at a different seed block
    const missions: GeneratedMission[] = [];
    let generated = 0;
    let attempts = 0;
    const maxAttempts = pageSize * 20; // Safety limit

    while (missions.length < pageSize && attempts < maxAttempts) {
      const seed = startSeed + attempts;
      const mission = generateMission(seed, level);

      // Filter by category
      if (args.category && args.category !== "all" && mission.category !== args.category) {
        attempts++;
        continue;
      }
      // Filter by difficulty
      if (args.difficulty && args.difficulty !== "all" && mission.difficulty !== args.difficulty) {
        attempts++;
        continue;
      }
      // Filter by search
      if (args.searchQuery) {
        const q = args.searchQuery.toLowerCase();
        if (!mission.name.toLowerCase().includes(q) && !mission.description.toLowerCase().includes(q)) {
          attempts++;
          continue;
        }
      }
      // Skip completed
      if (completedSet.has(mission.id)) {
        attempts++;
        continue;
      }

      missions.push(mission);
      attempts++;
      generated++;
    }

    // Total possible missions: CATEGORIES.length * 100,000 per category = ~3M+, 
    // but we use a huge range so effectively infinite
    const total = 10000000;

    // Sort by level required (lowest first - level 1 shown first)
    missions.sort((a, b) => (a.levelRequired ?? 1) - (b.levelRequired ?? 1));

    return {
      missions,
      total,
      completedIds: Array.from(completedSet),
      completedCount,
      categories: CATEGORIES,
    };
  },
});

// Get story arc missions (special storyline)
export const getStoryMissions = query({
  args: { storyId: v.string() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) return [];

    const completed = await ctx.db
      .query("completedMissions")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();
    const completedSet = new Set(completed.map((c: any) => c.missionId));

    const chapters: GeneratedMission[] = [];
    for (let ch = 1; ch <= 15; ch++) {
      const seed = hashStr(`${args.storyId}_ch${ch}`);
      const mission = generateMission(seed, player.level ?? 1);
      mission.storyArc = args.storyId;
      mission.chapter = ch;
      mission.id = `story_${args.storyId}_${ch}`;
      chapters.push(mission);
    }

    return chapters.map((m) => ({
      ...m,
      completed: completedSet.has(m.id),
    }));
  },
});

// Get available story arcs
export const getStoryArcs = query({
  args: {},
  handler: async (ctx) => {
    return [
      { id: "shadow_empire_rises", name: "Shadow Empire Rises", emoji: "👑", chapters: 15, description: "Rise from nothing to rule the underworld.", difficulty: "hard" },
      { id: "crimson_heist", name: "The Crimson Heist", emoji: "🩸", chapters: 15, description: "Plan and execute the biggest heist in history.", difficulty: "legendary" },
      { id: "ghost_protocol", name: "Ghost Protocol", emoji: "👻", chapters: 15, description: "Become invisible. Erase all traces. Strike.", difficulty: "impossible" },
      { id: "neon_dynasty", name: "Neon Dynasty", emoji: "🌃", chapters: 15, description: "Take over the cybercrime world.", difficulty: "hard" },
      { id: "iron_crown", name: "Iron Crown", emoji: "⚔️", chapters: 15, description: "War of the families. Only one dynasty survives.", difficulty: "brutal" },
      { id: "blood_oath", name: "Blood Oath", emoji: "🩸", chapters: 15, description: "An oath of blood. A debt of honor.", difficulty: "medium" },
      { id: "phantom_network", name: "Phantom Network", emoji: "🕸️", chapters: 15, description: "Build a global crime network from the shadows.", difficulty: "legendary" },
      { id: "kingpin_chronicles", name: "Kingpin Chronicles", emoji: "🏆", chapters: 15, description: "Chronicle of a true crime kingpin.", difficulty: "hard" },
      { id: "dark_matter", name: "Dark Matter", emoji: "🌑", chapters: 15, description: "The darkest operations. No limits.", difficulty: "impossible" },
      { id: "street_legends", name: "Street Legends", emoji: "🌟", chapters: 15, description: "From street rat to street legend.", difficulty: "easy" },
      { id: "double_cross", name: "Double Cross", emoji: "🎭", chapters: 15, description: "Trust no one. Betray everyone.", difficulty: "brutal" },
      { id: "arctic_smuggler", name: "Arctic Smuggler", emoji: "❄️", chapters: 15, description: "Run goods through frozen wastelands.", difficulty: "hard" },
      { id: "silicon_empire", name: "Silicon Empire", emoji: "🖥️", chapters: 15, description: "Hack the planet. Own the future.", difficulty: "legendary" },
      { id: "fire_and_ice", name: "Fire & Ice", emoji: "🔥", chapters: 15, description: "Opposites attract. Destruction follows.", difficulty: "impossible" },
      { id: "the_last_job", name: "The Last Job", emoji: "🎬", chapters: 15, description: "One final job. Then you're out. Right?", difficulty: "legendary" },
    ];
  },
});

// ===== MUTATIONS =====

// Complete a mission
export const completeMission = mutation({
  args: { missionId: v.string(), reward: v.number(), xpReward: v.number() },
  handler: async (ctx, args) => {
    const player = await getPlayer(ctx);
    if (!player) throw new Error("Not authenticated");

    // Check if already completed
    const existing = await ctx.db
      .query("completedMissions")
      .withIndex("by_player_mission", (q) =>
        q.eq("playerId", player._id).eq("missionId", args.missionId)
      )
      .first();
    if (existing) throw new Error("Mission already completed!");

    await ctx.db.insert("completedMissions", {
      playerId: player._id,
      missionId: args.missionId,
      completedAt: Date.now(),
      reward: args.reward,
    });

    const currentXP = player.experience ?? 0;
    const newXP = currentXP + args.xpReward;
    const xpNeeded = (player.level ?? 1) * 100;
    const levelUp = newXP >= xpNeeded;

    await ctx.db.patch(player._id, {
      money: (player.money ?? 0) + args.reward,
      experience: levelUp ? 0 : newXP,
      levelUpPending: levelUp ? true : (player.levelUpPending ?? false),
      totalCrimes: (player.totalCrimes ?? 0) + 1,
    });

    return { success: true, money: args.reward, xp: args.xpReward, levelUp };
  },
});

// Get player mission stats
export const getMissionStats = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) return null;

    const completed = await ctx.db
      .query("completedMissions")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    const totalMoney = completed.reduce((s: number, c: any) => s + (c.reward ?? 0), 0);

    return {
      totalCompleted: completed.length,
      totalMoneyEarned: totalMoney,
      streak: Math.min(completed.length, 50),
      favoriteCategory: CATEGORIES[completed.length % CATEGORIES.length]?.name ?? "None",
    };
  },
});

// Get daily challenges
export const getDailyChallenges = query({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayer(ctx);
    if (!player) return [];

    const today = new Date();
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rng = seededRandom(daySeed);

    const challenges = [];
    for (let i = 0; i < 10; i++) {
      const cat = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
      const count = Math.floor(rng() * 20) + 3;
      const reward = Math.floor(rng() * 50000) + 5000;
      const xpReward = Math.floor(rng() * 200) + 50;
      challenges.push({
        id: `daily_${daySeed}_${i}`,
        name: `Complete ${count} ${cat.name} missions`,
        category: cat.id,
        emoji: cat.emoji,
        required: count,
        reward,
        xpReward,
        difficulty: rng() < 0.3 ? "hard" : rng() < 0.6 ? "medium" : "easy",
      });
    }
    return challenges;
  },
});

// Get weekly story missions
export const getWeeklyStory = query({
  args: {},
  handler: async () => {
    const now = Date.now();
    const week = Math.floor(now / (7 * 24 * 60 * 60 * 1000));
    const rng = seededRandom(week);

    const storyIdx = Math.floor(rng() * 10);
    const stories = [
      { name: "The Midnight Raid", desc: "A coordinated midnight raid across 3 cities.", reward: 500000 },
      { name: "Ghost Protocol", desc: "Infiltrate a maximum security facility undetected.", reward: 1000000 },
      { name: "Blood in the Streets", desc: "Territorial war erupts. Fight for dominance.", reward: 750000 },
      { name: "The Long Con", desc: "A 6-month infiltration plan comes to fruition.", reward: 2000000 },
      { name: "Firestorm", desc: "Burn it all down. Start fresh.", reward: 300000 },
      { name: "Arctic Express", desc: "Smuggle contraband through frozen territory.", reward: 800000 },
      { name: "Digital Siege", desc: "Hack into the mainframe. Steal everything.", reward: 1500000 },
      { name: "Crown of Thorns", desc: "Dethrone the current crime lord.", reward: 2500000 },
      { name: "The Italian Job", desc: "Classic heist with a modern twist.", reward: 1200000 },
      { name: "Endgame", desc: "The final operation. Everything on the line.", reward: 5000000 },
    ];
    return stories[storyIdx];
  },
});

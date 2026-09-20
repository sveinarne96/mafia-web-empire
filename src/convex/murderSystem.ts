import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getRankEventMultiplier } from "./serverOps";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

// ===== WEAPONS =====
export const getWeapons = query({ args: {}, handler: async () => {
  return [
    { id: "bare_hands", name: "Bare Hands", icon: "👊", damage: 10, cost: 0, successBase: 0.40, traceChance: 0.10, description: "Raw fists. No weapon needed. High risk, low reward. DNA evidence likely.", type: "melee", unlockLevel: 1 },
    { id: "kitchen_knife", name: "Kitchen Knife", icon: "🔪", damage: 18, cost: 2000, successBase: 0.50, traceChance: 0.15, description: "Common blade. Easy to obtain, hard to trace back to you.", type: "melee", unlockLevel: 1 },
    { id: "baseball_bat", name: "Baseball Bat", icon: "🏏", damage: 22, cost: 5000, successBase: 0.48, traceChance: 0.08, description: "Blunt force. No shell casings. Just broken bones.", type: "melee", unlockLevel: 2 },
    { id: "steel_pipe", name: "Steel Pipe", icon: "🔧", damage: 20, cost: 1500, successBase: 0.45, traceChance: 0.05, description: "Found anywhere. Leave it at the scene. Impossible to trace.", type: "melee", unlockLevel: 1 },
    { id: "throwing_knife", name: "Throwing Knife", icon: "🗡️", damage: 25, cost: 8000, successBase: 0.55, traceChance: 0.03, description: "Silent. Deadly. Professional. No fingerprints if handled right.", type: "ranged", unlockLevel: 5 },
    { id: "pistol", name: "9mm Pistol", icon: "🔫", damage: 35, cost: 25000, successBase: 0.60, traceChance: 0.30, description: "Standard sidearm. Loud. Shell casings left behind. Ballistics can trace it.", type: "firearm", unlockLevel: 5 },
    { id: "revolver", name: "Snub Nose Revolver", icon: "🔫", damage: 30, cost: 20000, successBase: 0.58, traceChance: 0.12, description: "No shell casings ejected. Compact. Classic underworld weapon.", type: "firearm", unlockLevel: 7 },
    { id: "silenced_pistol", name: "Suppressed Pistol", icon: "🤫", damage: 32, cost: 50000, successBase: 0.70, traceChance: 0.20, description: "Quiet execution. Professional tool. Reduced witness chance.", type: "firearm", unlockLevel: 10 },
    { id: "shotgun", name: "Pump Shotgun", icon: "💥", damage: 50, cost: 40000, successBase: 0.55, traceChance: 0.35, description: "Devastating close range. Extremely loud. Hard to miss.", type: "firearm", unlockLevel: 10 },
    { id: "sniper", name: "Remington 700", icon: "🎯", damage: 65, cost: 90000, successBase: 0.72, traceChance: 0.10, description: "Long range precision. Professional assassin's choice. Minimal trace.", type: "firearm", unlockLevel: 15 },
    { id: "poison", name: "Cyanide Capsule", icon: "☠️", damage: 40, cost: 35000, successBase: 0.78, traceChance: 0.05, description: "Untraceable. Slow acting. Looks like natural causes if done right.", type: "chemical", unlockLevel: 8 },
    { id: "strangulation", name: "Wire Garrote", icon: "🪢", damage: 28, cost: 3000, successBase: 0.62, traceChance: 0.02, description: "Silent kill. No weapon left behind. Just... pressure.", type: "melee", unlockLevel: 6 },
    { id: "explosive", name: "C4 Plastic Explosive", icon: "💣", damage: 90, cost: 200000, successBase: 0.80, traceChance: 0.08, description: "Maximum destruction. Collateral damage guaranteed. No witnesses if done right.", type: "explosive", unlockLevel: 25 },
    { id: "car_bomb", name: "Car Bomb", icon: "🚗", damage: 75, cost: 120000, successBase: 0.75, traceChance: 0.06, description: "Remote detonation. Target never sees it coming. Classic mob hit.", type: "explosive", unlockLevel: 20 },
  ];
}});

// ===== MURDER METHODS =====
export const getMethods = query({ args: {}, handler: async () => {
  return [
    { id: "ambush", name: "Ambush", icon: "🪤", description: "Wait in the shadows. Strike when least expected.", bonusSuccess: 0.15, bonusCost: 0, witnessReduction: 0.20, bonusXP: 0 },
    { id: "driveby", name: "Drive-By Shooting", icon: "🚗", description: "Roll up, fire, roll out. Fast and brutal.", bonusSuccess: 0.05, bonusCost: 5000, witnessReduction: -0.10, bonusXP: 10, requiresType: "firearm" },
    { id: "snipe", name: "Snipe from Distance", icon: "🔭", description: "High ground. Long range. One shot, one kill.", bonusSuccess: 0.25, bonusCost: 15000, witnessReduction: 0.30, bonusXP: 20, requiresType: "firearm", requiresWeapon: ["sniper"] },
    { id: "poison_feed", name: "Poisoned Food/Drink", icon: "🍸", description: "Slip it in their drink. They'll never know until it's too late.", bonusSuccess: 0.30, bonusCost: 10000, witnessReduction: 0.40, bonusXP: 25, requiresType: "chemical", requiresWeapon: ["poison"] },
    { id: "home_invasion", name: "Home Invasion", icon: "🏚️", description: "Break in at 3AM. They're sleeping. You're not.", bonusSuccess: 0.20, bonusCost: 3000, witnessReduction: 0.25, bonusXP: 15 },
    { id: "strangle", name: "Silent Strangulation", icon: "🫥", description: "From behind. No sound. No witnesses. Just darkness.", bonusSuccess: 0.18, bonusCost: 0, witnessReduction: 0.35, bonusXP: 10, requiresType: "melee", requiresWeapon: ["strangulation"] },
    { id: "staged_robbery", name: "Staged Robbery Gone Wrong", icon: "🎭", description: "Make it look like a robbery. Plant evidence. Create an alibi.", bonusSuccess: 0.10, bonusCost: 8000, witnessReduction: 0.15, bonusXP: 15 },
    { id: "car_crash", name: "Staged Car Accident", icon: "💥", description: "Cut the brakes. Or cause a 'freak accident'. Natural causes.", bonusSuccess: 0.22, bonusCost: 20000, witnessReduction: 0.45, bonusXP: 30, requiresType: "explosive", requiresWeapon: ["car_bomb"] },
    { id: "professional", name: "Professional Hit", icon: "📋", description: "Hire the best. Clean. Efficient. Expensive. No loose ends.", bonusSuccess: 0.35, bonusCost: 50000, witnessReduction: 0.50, bonusXP: 30 },
    { id: "gang_squad", name: "Hit Squad Execution", icon: "👥", description: "Bring the crew. Overwhelming force. Nobody walks away.", bonusSuccess: 0.25, bonusCost: 30000, witnessReduction: 0.10, bonusXP: 15 },
    { id: "ninja", name: "Ninja Strike", icon: "🥷", description: "In and out before anyone notices. Silent. Deadly.", bonusSuccess: 0.38, bonusCost: 25000, witnessReduction: 0.55, bonusXP: 35, requiresTypeAny: ["melee", "ranged"] },
    { id: "frame", name: "Frame Another Player", icon: "🎭", description: "Plant evidence on a rival. Let the detective arrest THEM.", bonusSuccess: 0.15, bonusCost: 40000, witnessReduction: 0.30, bonusXP: 25 },
  ];
}});

// ===== EVIDENCE TYPES =====
export const getEvidenceTypes = query({ args: {}, handler: async () => {
  return [
    { id: "fingerprints", name: "Fingerprints", icon: "🖐️", description: "Left at the crime scene. Can be cleaned with gloves.", preventable: true },
    { id: "shell_casings", name: "Shell Casings", icon: "🔫", description: "Ballistics can match to your weapon.", preventable: true, requiresType: "firearm" },
    { id: "dna", name: "DNA Evidence", icon: "🧬", description: "Hair, blood, skin cells. Hard to prevent.", preventable: false },
    { id: "witness", name: "Witness Testimony", icon: "👁️", description: "Someone saw you. Or thinks they did.", preventable: true },
    { id: "cctv", name: "CCTV Footage", icon: "📹", description: "Security cameras caught your face.", preventable: true },
    { id: "phone_records", name: "Phone Records", icon: "📱", description: "Your phone was near the scene.", preventable: true },
    { id: "financial", name: "Financial Trail", icon: "💳", description: "Money transfers, weapon purchases.", preventable: true },
  ];
}});

// ===== COMMIT MURDER =====
export const commitMurder = mutation({
  args: {
    targetId: v.id("users"),
    weaponId: v.string(),
    methodId: v.string(),
    useGloves: v.boolean(),
    useAlibi: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (player.inPrison) throw new Error("You are in prison! Can't commit murder.");
    if (player.isDead) throw new Error("You are dead!");

    // SERVER OPS: murder system master switch.
    const { isMurderEnabled } = await import("./serverOps");
    if (!(await isMurderEnabled(ctx))) throw new Error("🔪 The murder system is currently disabled by the administration.");

    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found!");
    if (args.targetId === player._id) throw new Error("Can't murder yourself!");

    // Weapon data
    const weapons: Record<string, { damage: number; cost: number; successBase: number; traceChance: number; type: string }> = {
      bare_hands: { damage: 10, cost: 0, successBase: 0.40, traceChance: 0.10, type: "melee" },
      kitchen_knife: { damage: 18, cost: 2000, successBase: 0.50, traceChance: 0.15, type: "melee" },
      baseball_bat: { damage: 22, cost: 5000, successBase: 0.48, traceChance: 0.08, type: "melee" },
      steel_pipe: { damage: 20, cost: 1500, successBase: 0.45, traceChance: 0.05, type: "melee" },
      throwing_knife: { damage: 25, cost: 8000, successBase: 0.55, traceChance: 0.03, type: "ranged" },
      pistol: { damage: 35, cost: 25000, successBase: 0.60, traceChance: 0.30, type: "firearm" },
      revolver: { damage: 30, cost: 20000, successBase: 0.58, traceChance: 0.12, type: "firearm" },
      silenced_pistol: { damage: 32, cost: 50000, successBase: 0.70, traceChance: 0.20, type: "firearm" },
      shotgun: { damage: 50, cost: 40000, successBase: 0.55, traceChance: 0.35, type: "firearm" },
      sniper: { damage: 65, cost: 90000, successBase: 0.72, traceChance: 0.10, type: "firearm" },
      poison: { damage: 40, cost: 35000, successBase: 0.78, traceChance: 0.05, type: "chemical" },
      strangulation: { damage: 28, cost: 3000, successBase: 0.62, traceChance: 0.02, type: "melee" },
      explosive: { damage: 90, cost: 200000, successBase: 0.80, traceChance: 0.08, type: "explosive" },
      car_bomb: { damage: 75, cost: 120000, successBase: 0.75, traceChance: 0.06, type: "explosive" },
    };

    const weapon = weapons[args.weaponId];
    if (!weapon) throw new Error("Invalid weapon!");

    // Method data
    const methods: Record<string, { bonusSuccess: number; bonusCost: number; witnessReduction: number; bonusXP: number }> = {
      ambush: { bonusSuccess: 0.15, bonusCost: 0, witnessReduction: 0.20, bonusXP: 0 },
      driveby: { bonusSuccess: 0.05, bonusCost: 5000, witnessReduction: -0.10, bonusXP: 10 },
      snipe: { bonusSuccess: 0.25, bonusCost: 15000, witnessReduction: 0.30, bonusXP: 20 },
      poison_feed: { bonusSuccess: 0.30, bonusCost: 10000, witnessReduction: 0.40, bonusXP: 25 },
      home_invasion: { bonusSuccess: 0.20, bonusCost: 3000, witnessReduction: 0.25, bonusXP: 15 },
      strangle: { bonusSuccess: 0.18, bonusCost: 0, witnessReduction: 0.35, bonusXP: 10 },
      staged_robbery: { bonusSuccess: 0.10, bonusCost: 8000, witnessReduction: 0.15, bonusXP: 15 },
      car_crash: { bonusSuccess: 0.22, bonusCost: 20000, witnessReduction: 0.45, bonusXP: 30 },
      professional: { bonusSuccess: 0.35, bonusCost: 50000, witnessReduction: 0.50, bonusXP: 30 },
      gang_squad: { bonusSuccess: 0.25, bonusCost: 30000, witnessReduction: 0.10, bonusXP: 15 },
      ninja: { bonusSuccess: 0.38, bonusCost: 25000, witnessReduction: 0.55, bonusXP: 35 },
      frame: { bonusSuccess: 0.15, bonusCost: 40000, witnessReduction: 0.30, bonusXP: 25 },
    };

    const method = methods[args.methodId];
    if (!method) throw new Error("Invalid method!");

    const totalCost = weapon.cost + method.bonusCost;
    if ((player.money ?? 0) < totalCost) throw new Error(`Need $${totalCost.toLocaleString()} for this operation!`);

    // Calculate success chance
    const levelDiff = Math.max(0, (player.level ?? 1) - (target.level ?? 1));
    const atkBonus = Math.min(0.2, ((player.attack ?? 10) - (target.defense ?? 10)) / 200);
    const glovesReduction = args.useGloves ? -0.05 : 0; // reduces trace
    const alibiBonus = args.useAlibi ? 0.05 : 0;
    const totalSuccess = Math.min(0.95, weapon.successBase + method.bonusSuccess + atkBonus + alibiBonus + (levelDiff * 0.01));

    // Calculate trace/evidence
    const baseTrace = weapon.traceChance + glovesReduction;
    const witnessChance = Math.max(0.05, 0.30 - method.witnessReduction + (args.useGloves ? -0.05 : 0));
    const evidenceCollected: string[] = [];

    // Spend money
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - totalCost });

    const succeeded = Math.random() < totalSuccess;

    if (succeeded) {
      // MURDER SUCCESS
      const stolenCash = Math.floor((target.money ?? 0) * 0.05);
      const rankEventMult = await getRankEventMultiplier(ctx);
      const xpGained = Math.floor((20 + weapon.damage / 2 + method.bonusXP) * (1 + levelDiff * 0.02) * rankEventMult);

      // Auto-level-up via addXpAndCheckLevel pattern
      const newXP = (player.experience ?? 0) + xpGained;
      const xpNeeded = (player.level ?? 1) * 100;
      const levelUpNow = newXP >= xpNeeded;

      // Evidence check
      const traceFound = Math.random() < baseTrace;
      const witnessFound = Math.random() < witnessChance;
      const cctvFound = Math.random() < 0.15;

      if (traceFound) evidenceCollected.push("fingerprints");
      if (weapon.type === "firearm" && Math.random() < 0.25) evidenceCollected.push("shell_casings");
      if (witnessFound) evidenceCollected.push("witness");
      if (cctvFound) evidenceCollected.push("cctv");
      if (Math.random() < 0.10) evidenceCollected.push("dna");

      // Wanted level based on evidence
      const evidenceCount = evidenceCollected.length;
      const wantedGain = evidenceCount >= 3 ? 4 : evidenceCount >= 2 ? 3 : evidenceCount >= 1 ? 2 : 1;

      // Detective investigation
      const detectiveChance = Math.min(0.8, 0.2 + (evidenceCount * 0.15));
      const detectiveFound = Math.random() < detectiveChance;
      const investigationTime = detectiveFound ? Math.floor(Math.random() * 3600000) + 600000 : 0; // 10-70 min

      // Kill the target
      await ctx.db.patch(args.targetId, { life: 0, isDead: true });

      // Update killer
      const patches: Record<string, unknown> = {
        totalKills: (player.totalKills ?? 0) + 1,
        wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + wantedGain),
        money: (player.money ?? 0) + stolenCash,
        reputation: Math.min(100, (player.reputation ?? 0) + Math.floor((target.level ?? 1) / 2) * (Date.now() < ((player as any).repBoostUntil ?? 0) ? 3 : 1)),
        experience: levelUpNow ? 0 : newXP,
        levelUpPending: levelUpNow ? true : (player.levelUpPending ?? false),
        lastCrimeAt: Date.now(),
      };
      await ctx.db.patch(player._id, patches);

      // Log the murder
      await ctx.db.insert("crimes", {
        userId: player._id,
        type: "murder",
        target: target.nickname ?? "Unknown",
        success: true,
        moneyEarned: stolenCash,
        pointsEarned: xpGained,
        damageTaken: 0,
        timestamp: Date.now(),
      });

      // Witness statement — a coded record of the hit. The killer holds it and
      // may list it for sale on the witness marketplace.
      try {
        const victimName = target.nickname ?? target.username ?? "Unknown";
        const seed = (player._id + victimName + Date.now()).split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        let code = "";
        let s = seed;
        for (let i = 0; i < 6; i++) {
          s = (s * 9301 + 49297) % 233280;
          code += chars[Math.floor((s / 233280) * chars.length)];
        }
        const lines = [
          "I saw it happen from the fire escape. [KILLER] pulled the trigger and walked away like nothing.",
          "Streetlight caught [KILLER]'s face clear as day. I can still see it when I close my eyes.",
          "The shooter was [KILLER]. Tall, calm, and gone before the sirens started.",
          "I was parked right there. [KILLER] did it — no question, I'd swear it in court.",
        ];
        await ctx.db.insert("witnessStatements", {
          killerId: player._id,
          killerName: player.nickname ?? player.username ?? "Unknown",
          victimId: target._id,
          victimName,
          code,
          text: lines[Math.floor(Math.random() * lines.length)],
          ownerId: player._id,
          listed: false,
          price: 0,
          createdAt: Date.now(),
        } as any);
      } catch (_wsErr) {
        // Statement write must never cancel the murder.
      }

      // Notification to victim
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "death",
        message: `You were murdered by ${player.nickname}!`,
        read: false,
        timestamp: Date.now(),
      });

      // Detective notification
      if (detectiveFound) {
        await ctx.db.insert("notifications", {
          userId: player._id,
          type: "detective",
          message: `🕵️ A detective is investigating a murder you committed! Evidence: ${evidenceCollected.join(", ")}`,
          read: false,
          timestamp: Date.now(),
        });
      }

      return {
        success: true,
        killed: target.nickname,
        stolenCash,
        xpGained,
        wantedGain,
        reputationGain: Math.floor((target.level ?? 1) / 2),
        levelUp: levelUpNow,
        evidence: evidenceCollected,
        detectiveInvestigating: detectiveFound,
        investigationTime,
        witnessFound,
        totalSuccess: Math.floor(totalSuccess * 100),
      };
    } else {
      // MURDER FAILED
      const damageTaken = Math.floor(10 + Math.random() * 40);
      const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
      const rankEventMult = await getRankEventMultiplier(ctx);
      const xpGained = Math.floor(5 + method.bonusXP * 0.2) * rankEventMult > 0 ? Math.floor((5 + method.bonusXP * 0.2) * rankEventMult) : Math.floor(5 + method.bonusXP * 0.2);
      const newXP = (player.experience ?? 0) + xpGained;
      const xpNeeded = (player.level ?? 1) * 100;
      const levelUpNow = newXP >= xpNeeded;

      const goesToPrison = Math.random() > 0.4;
      const evidenceOnFail = ["fingerprints", "dna"];
      if (weapon.type === "firearm") evidenceOnFail.push("shell_casings");
      if (Math.random() < 0.3) evidenceOnFail.push("witness");

      const wantedGain = evidenceOnFail.length >= 3 ? 3 : 2;

      const failPatches: Record<string, unknown> = {
        life: newLife,
        wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + wantedGain),
        experience: levelUpNow ? 0 : newXP,
        levelUpPending: levelUpNow ? true : (player.levelUpPending ?? false),
        inPrison: goesToPrison,
        prisonTime: goesToPrison ? 15000 : (player.prisonTime ?? 0),
        lastCrimeAt: Date.now(),
      };
      if (newLife <= 0) {
        failPatches.isDead = true;
        failPatches.life = 0;
      }
      await ctx.db.patch(player._id, failPatches);

      return {
        success: false,
        damageTaken,
        xpGained,
        wantedGain,
        arrested: goesToPrison,
        evidence: evidenceOnFail,
        targetDodged: target.nickname,
        totalSuccess: Math.floor(totalSuccess * 100),
        killedSelf: newLife <= 0,
      };
    }
  },
});

// ===== TARGET BOARD =====
export const getTargets = query({ args: {}, handler: async (ctx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return [];
  const allPlayers = await ctx.db.query("users").collect();
  return allPlayers
    .filter((p: any) => p._id !== userId && !p.isDead && !p.inPrison)
    .map((p: any) => ({
      _id: p._id,
      nickname: p.nickname ?? "Unknown",
      level: p.level ?? 1,
      money: p.money ?? 0,
      life: p.life ?? 100,
      maxLife: p.maxLife ?? 100,
      attack: p.attack ?? 10,
      defense: p.defense ?? 10,
      wantedLevel: p.wantedLevel ?? 0,
      location: p.location ?? "New York",
      totalKills: p.totalKills ?? 0,
      reputation: p.reputation ?? 0,
      isOnline: (Date.now() - (p.lastActive ?? 0)) < 300000,
    }))
    .sort((a: any, b: any) => b.level - a.level);
}});

// ===== MURDER STATS =====
export const getMurderStats = query({ args: {}, handler: async (ctx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const player = await ctx.db.get(userId);
  if (!player) return null;

  const allCrimes = await ctx.db.query("crimes")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();
  const murders = allCrimes.filter((c: any) => c.type === "murder" || c.type === "assassination");
  const successful = murders.filter((c: any) => c.success);
  const totalEarnings = murders.reduce((sum: number, c: any) => sum + (c.moneyEarned ?? 0), 0);

  return {
    totalMurders: murders.length,
    successful: successful.length,
    failed: murders.length - successful.length,
    killRate: murders.length > 0 ? Math.floor((successful.length / murders.length) * 100) : 0,
    totalEarnings,
    reputation: (player.reputation ?? 0),
    totalKills: (player.totalKills ?? 0),
    level: (player.level ?? 1),
  };
}});

// ===== MURDER FEED =====
export const getMurderFeed = query({ args: {}, handler: async (ctx) => {
  const crimes = await ctx.db.query("crimes")
    .filter((q) => q.or(q.eq(q.field("type"), "murder"), q.eq(q.field("type"), "assassination")))
    .order("desc")
    .take(15);

  const results = [];
  for (const crime of crimes) {
    const killer = await ctx.db.get(crime.userId);
    results.push({
      killer: killer?.nickname ?? "Unknown",
      killerLevel: killer?.level ?? 1,
      target: crime.target,
      success: crime.success,
      money: crime.moneyEarned ?? 0,
      xp: crime.pointsEarned ?? 0,
      timestamp: crime.timestamp,
    });
  }
  return results;
}});

// ===== DETECTIVE INVESTIGATION =====
export const getInvestigations = query({ args: {}, handler: async (ctx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return [];
  // Get recent murders where the killer was detected
  const crimes = await ctx.db.query("crimes")
    .filter((q) => q.or(q.eq(q.field("type"), "murder"), q.eq(q.field("type"), "assassination")))
    .filter((q) => q.eq(q.field("success"), true))
    .order("desc")
    .take(10);

  return crimes.map((c: any) => ({
    crimeId: c._id,
    target: c.target,
    timestamp: c.timestamp,
    status: Math.random() > 0.5 ? "investigating" : "cold_case",
    evidence: ["fingerprints", "witness"].slice(0, Math.floor(Math.random() * 3)),
  }));
}});

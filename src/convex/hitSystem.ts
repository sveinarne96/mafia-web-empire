import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

// ===== WEAPON ARSENAL =====
export const getWeapons = query({ args: {}, handler: async (ctx) => {
  return [
    { id: "fists", name: "Bare Fists", icon: "👊", damage: 10, cost: 0, successBase: 0.40, description: "Raw knuckles. No weapon needed. High risk, low reward.", unlockLevel: 1 },
    { id: "knife", name: "Combat Knife", icon: "🔪", damage: 20, cost: 5000, successBase: 0.55, description: "Silent and deadly. Close range only.", unlockLevel: 1 },
    { id: "bat", name: "Steel Baseball Bat", icon: "🏏", damage: 25, cost: 8000, successBase: 0.50, description: "Blunt force trauma. Messy but effective.", unlockLevel: 3 },
    { id: "pistol", name: "9mm Pistol", icon: "🔫", damage: 35, cost: 25000, successBase: 0.65, description: "Standard sidearm. Reliable in any situation.", unlockLevel: 5 },
    { id: "shotgun", name: "Pump Shotgun", icon: "💥", damage: 50, cost: 45000, successBase: 0.60, description: "Close range devastation. Terrifying presence.", unlockLevel: 8 },
    { id: "sniper", name: "Sniper Rifle", icon: "🎯", damage: 60, cost: 80000, successBase: 0.70, description: "Long range precision. One shot, one kill.", unlockLevel: 12 },
    { id: "rifle", name: "Assault Rifle", icon: "⚔️", damage: 45, cost: 60000, successBase: 0.68, description: "Full auto spray. Overwhelm any defense.", unlockLevel: 10 },
    { id: "explosive", name: "C4 Explosive", icon: "💣", damage: 80, cost: 150000, successBase: 0.75, description: "Maximum destruction. Collateral damage guaranteed.", unlockLevel: 20 },
    { id: "poison", name: "Lethal Poison", icon: "☠️", damage: 40, cost: 35000, successBase: 0.80, description: "Silent kill. Death comes slowly. Hard to trace.", unlockLevel: 7 },
    { id: "silencer", name: "Suppressed Pistol", icon: "🤫", damage: 30, cost: 50000, successBase: 0.78, description: "Professional silence. No witnesses. No evidence.", unlockLevel: 15 },
    { id: "crossbow", name: "Tactical Crossbow", icon: "🏹", damage: 55, cost: 70000, successBase: 0.72, description: "Silent projectile. Deadly accuracy.", unlockLevel: 18 },
    { id: "minigun", name: "Minigun", icon: "🔥", damage: 100, cost: 500000, successBase: 0.85, description: "Absolute overkill. War-zone level firepower.", unlockLevel: 30 },
  ];
}});

// ===== HIT STYLES =====
export const getHitStyles = query({ args: {}, handler: async () => {
  return [
    { id: "ambush", name: "Ambush", icon: "🪤", description: "Wait in the shadows. +15% success, costs patience.", bonusSuccess: 0.15, bonusCost: 0, bonusXP: 0 },
    { id: "driveby", name: "Drive-By", icon: "🚗", description: "Roll up, fire, roll out. Fast but noisy.", bonusSuccess: 0.05, bonusCost: 5000, bonusXP: 10 },
    { id: "snipe", name: "Snipe from Distance", icon: "🔭", description: "High ground advantage. +25% success with sniper weapons.", bonusSuccess: 0.25, bonusCost: 10000, bonusXP: 15, requiresWeapon: "sniper" },
    { id: "poison", name: "Poisoned Drink", icon: "🍸", description: "Slip something in their drink. +30% success with poison.", bonusSuccess: 0.30, bonusCost: 15000, bonusXP: 20, requiresWeapon: "poison" },
    { id: "car_bomb", name: "Car Bomb", icon: "💣", description: "Rig their vehicle. Maximum carnage.", bonusSuccess: 0.20, bonusCost: 25000, bonusXP: 25, requiresWeapon: "explosive" },
    { id: "stealth", name: "Stealth Kill", icon: "🌑", description: "No witnesses, no noise. +20% success, higher reward.", bonusSuccess: 0.20, bonusCost: 8000, bonusXP: 20 },
    { id: "torture", name: "Interrogation Gone Wrong", icon: "🪑", description: "Things escalated. +10% success, +50% cash from target.", bonusSuccess: 0.10, bonusCost: 0, bonusXP: 5, cashMultiplier: 1.5 },
    { id: "contract", name: "Professional Hit", icon: "📋", description: "Clean, efficient, expensive. +35% success.", bonusSuccess: 0.35, bonusCost: 50000, bonusXP: 30 },
    { id: "gang", name: "Gang Hit Squad", icon: "👥", description: "Bring the crew. Overwhelming force.", bonusSuccess: 0.25, bonusCost: 30000, bonusXP: 15 },
    { id: "ninja", name: "Ninja Strike", icon: "🥷", description: "In and out before anyone notices. +40% success with knife/silencer.", bonusSuccess: 0.40, bonusCost: 20000, bonusXP: 35, requiresWeaponAny: ["knife", "silencer"] },
  ];
}});

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
      isOnline: (Date.now() - (p.lastActive ?? 0)) < 300000,
    }))
    .sort((a: any, b: any) => b.level - a.level);
}});

// ===== KILL CONTRACT =====
export const executeHit = mutation({
  args: {
    targetId: v.id("users"),
    weaponId: v.string(),
    hitStyleId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (player.inPrison) throw new Error("You are in prison! Can't execute hits.");
    if (player.isDead) throw new Error("You are dead!");

    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found!");
    if (args.targetId === player._id) throw new Error("Can't kill yourself!");

    // Weapon data
    const weapons: Record<string, { damage: number; cost: number; successBase: number }> = {
      fists: { damage: 10, cost: 0, successBase: 0.40 },
      knife: { damage: 20, cost: 5000, successBase: 0.55 },
      bat: { damage: 25, cost: 8000, successBase: 0.50 },
      pistol: { damage: 35, cost: 25000, successBase: 0.65 },
      shotgun: { damage: 50, cost: 45000, successBase: 0.60 },
      sniper: { damage: 60, cost: 80000, successBase: 0.70 },
      rifle: { damage: 45, cost: 60000, successBase: 0.68 },
      explosive: { damage: 80, cost: 150000, successBase: 0.75 },
      poison: { damage: 40, cost: 35000, successBase: 0.80 },
      silencer: { damage: 30, cost: 50000, successBase: 0.78 },
      crossbow: { damage: 55, cost: 70000, successBase: 0.72 },
      minigun: { damage: 100, cost: 500000, successBase: 0.85 },
    };

    // Hit styles
    const styles: Record<string, { bonusSuccess: number; bonusCost: number; bonusXP: number; cashMultiplier?: number }> = {
      ambush: { bonusSuccess: 0.15, bonusCost: 0, bonusXP: 0 },
      driveby: { bonusSuccess: 0.05, bonusCost: 5000, bonusXP: 10 },
      snipe: { bonusSuccess: 0.25, bonusCost: 10000, bonusXP: 15 },
      poison: { bonusSuccess: 0.30, bonusCost: 15000, bonusXP: 20 },
      car_bomb: { bonusSuccess: 0.20, bonusCost: 25000, bonusXP: 25 },
      stealth: { bonusSuccess: 0.20, bonusCost: 8000, bonusXP: 20 },
      torture: { bonusSuccess: 0.10, bonusCost: 0, bonusXP: 5, cashMultiplier: 1.5 },
      contract: { bonusSuccess: 0.35, bonusCost: 50000, bonusXP: 30 },
      gang: { bonusSuccess: 0.25, bonusCost: 30000, bonusXP: 15 },
      ninja: { bonusSuccess: 0.40, bonusCost: 20000, bonusXP: 35 },
    };

    const weapon = weapons[args.weaponId];
    const style = styles[args.hitStyleId];
    if (!weapon) throw new Error("Invalid weapon!");
    if (!style) throw new Error("Invalid hit style!");
    if ((player.money ?? 0) < weapon.cost + style.bonusCost) throw new Error("Not enough money! Need $" + (weapon.cost + style.bonusCost).toLocaleString());

    // Calculate success chance
    const levelDiff = Math.max(0, (player.level ?? 1) - (target.level ?? 1));
    const atkBonus = Math.min(0.2, ((player.attack ?? 10) - (target.defense ?? 10)) / 200);
    const totalSuccess = Math.min(0.95, weapon.successBase + style.bonusSuccess + atkBonus + (levelDiff * 0.01));
    const succeeded = Math.random() < totalSuccess;

    // Total cost
    const totalCost = weapon.cost + style.bonusCost;
    await ctx.db.patch(player._id, { money: (player.money ?? 0) - totalCost });

    const cashMult = style.cashMultiplier ?? 1;

    if (succeeded) {
      // Kill success
      const stolenCash = Math.floor((target.money ?? 0) * 0.05 * cashMult);
      const xpGained = Math.floor((25 + weapon.damage + style.bonusXP) * (1 + levelDiff * 0.02));

      // Level up XP check
      const newXP = (player.experience ?? 0) + xpGained;
      const xpNeeded = (player.level ?? 1) * 100;
      const levelUpNow = newXP >= xpNeeded;

      await ctx.db.patch(args.targetId, { life: 0, isDead: true });
      await ctx.db.patch(player._id, {
        totalKills: (player.totalKills ?? 0) + 1,
        wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + 3),
        money: (player.money ?? 0) + stolenCash,
        reputation: Math.min(100, (player.reputation ?? 0) + Math.floor((target.level ?? 1) / 2)),
        experience: levelUpNow ? 0 : newXP,
        levelUpPending: levelUpNow ? true : (player.levelUpPending ?? false),
        lastCrimeAt: Date.now(),
      });

      // Log the kill
      await ctx.db.insert("crimes", {
        userId: player._id,
        type: "assassination",
        target: target.nickname ?? "Unknown",
        success: true,
        moneyEarned: stolenCash,
        pointsEarned: xpGained,
        damageTaken: 0,
        timestamp: Date.now(),
      });

      // Notification
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "death",
        message: `You were assassinated by ${player.nickname}!`,
        read: false,
        timestamp: Date.now(),
      });

      return {
        success: true,
        killed: target.nickname,
        stolenCash,
        xpGained,
        wantedGain: 3,
        reputationGain: Math.floor((target.level ?? 1) / 2),
        levelUp: levelUpNow,
        totalSuccess: Math.floor(totalSuccess * 100),
      };
    } else {
      // Kill failed
      const damageTaken = Math.floor(10 + Math.random() * 30);
      const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
      const xpGained = Math.floor(5 + style.bonusXP * 0.2);
      const newXP = (player.experience ?? 0) + xpGained;
      const xpNeeded = (player.level ?? 1) * 100;
      const levelUpNow = newXP >= xpNeeded;

      const goesToPrison = !succeeded && Math.random() > 0.5;

      await ctx.db.patch(player._id, {
        life: newLife,
        wantedLevel: Math.min(10, (player.wantedLevel ?? 0) + 1),
        experience: levelUpNow ? 0 : newXP,
        levelUpPending: levelUpNow ? true : (player.levelUpPending ?? false),
        inPrison: goesToPrison,
        prisonTime: goesToPrison ? 15000 : (player.prisonTime ?? 0),
        lastCrimeAt: Date.now(),
      });

      if (newLife <= 0) {
        await ctx.db.patch(player._id, { isDead: true, life: 0 });
      }

      return {
        success: false,
        damageTaken,
        xpGained,
        wantedGain: 1,
        arrested: goesToPrison,
        totalSuccess: Math.floor(totalSuccess * 100),
        targetDodged: target.nickname,
      };
    }
  },
});

// ===== KILL FEED =====
export const getKillFeed = query({ args: {}, handler: async (ctx) => {
  const crimes = await ctx.db.query("crimes")
    .filter((q) => q.eq(q.field("type"), "assassination"))
    .order("desc")
    .take(20);

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

// ===== HITMAN STATS =====
export const getHitmanStats = query({ args: {}, handler: async (ctx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const player = await ctx.db.get(userId);
  if (!player) return null;

  const allCrimes = await ctx.db.query("crimes")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();
  const hits = allCrimes.filter((c: any) => c.type === "assassination");
  const successfulHits = hits.filter((c: any) => c.success);
  const totalEarnings = hits.reduce((sum: number, c: any) => sum + (c.moneyEarned ?? 0), 0);

  return {
    totalHits: hits.length,
    successfulHits: successfulHits.length,
    failedHits: hits.length - successfulHits.length,
    killRate: hits.length > 0 ? Math.floor((successfulHits.length / hits.length) * 100) : 0,
    totalEarnings,
    reputation: (player.reputation ?? 0),
    totalKills: (player.totalKills ?? 0),
    level: (player.level ?? 1),
  };
}});

// ===== BOUNTY BOARD =====
export const placeBounty = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (args.amount < 10000) throw new Error("Minimum bounty is $10,000");
    if ((player.money ?? 0) < args.amount) throw new Error("Not enough money!");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found!");

    await ctx.db.patch(player._id, { money: (player.money ?? 0) - args.amount });
    await ctx.db.insert("bounties", {
      targetId: args.targetId,
      placerId: player._id,
      reward: args.amount,
      active: true,
      createdAt: Date.now(),
    });
    await ctx.db.insert("notifications", {
      userId: args.targetId,
      type: "bounty",
      message: `A bounty of $${args.amount.toLocaleString()} has been placed on your head!`,
      read: false,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

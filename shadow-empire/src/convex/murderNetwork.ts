import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getJailMs, getRankEventMultiplier } from "./serverOps";

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return { ...player, _id: userId };
}

const n = (x: any, d = 0) => (typeof x === "number" && Number.isFinite(x) ? x : d);

// ===== STATIC DATA (server truth) =====
export const KILL_WEAPONS = [
  { id: "bare_hands", name: "Bare Hands", icon: "👊", type: "melee", cost: 0, energy: 10, successBase: 0.32, damage: 12, trace: 0.14, unlockLevel: 1, desc: "Raw fists. High risk, no purchase trail, heavy DNA." },
  { id: "kitchen_knife", name: "Kitchen Knife", icon: "🔪", type: "melee", cost: 2000, energy: 12, successBase: 0.46, damage: 20, trace: 0.16, unlockLevel: 1, desc: "Common blade. Cheap, deniable, messy." },
  { id: "steel_pipe", name: "Steel Pipe", icon: "🔧", type: "melee", cost: 1500, energy: 12, successBase: 0.42, damage: 22, trace: 0.06, unlockLevel: 2, desc: "Blunt, disposable, impossible to trace." },
  { id: "strangulation", name: "Wire Garrote", icon: "🪢", type: "melee", cost: 3000, energy: 14, successBase: 0.58, damage: 26, trace: 0.03, unlockLevel: 6, desc: "Silent. No weapon left behind." },
  { id: "throwing_knife", name: "Throwing Knife", icon: "🗡️", type: "ranged", cost: 8000, energy: 12, successBase: 0.52, damage: 27, trace: 0.04, unlockLevel: 5, desc: "Professional. Quiet. Precision." },
  { id: "pistol", name: "9mm Pistol", icon: "🔫", type: "firearm", cost: 25000, energy: 15, successBase: 0.58, damage: 36, trace: 0.30, unlockLevel: 5, desc: "Loud. Shell casings. Ballistics." },
  { id: "revolver", name: "Snub Nose Revolver", icon: "🔫", type: "firearm", cost: 20000, energy: 14, successBase: 0.55, damage: 31, trace: 0.12, unlockLevel: 7, desc: "No casings ejected. Classic underworld." },
  { id: "silenced_pistol", name: "Suppressed Pistol", icon: "🤫", type: "firearm", cost: 50000, energy: 15, successBase: 0.68, damage: 33, trace: 0.18, unlockLevel: 10, desc: "Quiet execution. Fewer witnesses." },
  { id: "shotgun", name: "Pump Shotgun", icon: "💥", type: "firearm", cost: 40000, energy: 18, successBase: 0.52, damage: 52, trace: 0.36, unlockLevel: 10, desc: "Devastating. Impossible to be subtle." },
  { id: "sniper", name: "Remington 700", icon: "🎯", type: "firearm", cost: 90000, energy: 18, successBase: 0.70, damage: 66, trace: 0.10, unlockLevel: 15, desc: "One shot, one kill, from nowhere." },
  { id: "poison", name: "Cyanide Capsule", icon: "☠️", type: "chemical", cost: 35000, energy: 10, successBase: 0.74, damage: 42, trace: 0.05, unlockLevel: 8, desc: "Untraceable. Looks like natural causes." },
  { id: "car_bomb", name: "Car Bomb", icon: "🚗", type: "explosive", cost: 120000, energy: 20, successBase: 0.72, damage: 78, trace: 0.07, unlockLevel: 20, desc: "Remote detonation. They never see it." },
  { id: "explosive", name: "C4 Plastic Explosive", icon: "💣", type: "explosive", cost: 200000, energy: 22, successBase: 0.78, damage: 92, trace: 0.09, unlockLevel: 25, desc: "Maximum destruction. Collateral guaranteed." },
];

export const KILL_METHODS = [
  { id: "ambush", name: "Ambush", icon: "🪤", cost: 0, bonusSuccess: 0.12, witnessReduction: 0.20, bonusXP: 0, unlockLevel: 1, desc: "Wait in the shadows. Strike when least expected." },
  { id: "driveby", name: "Drive-By", icon: "🚗", cost: 5000, bonusSuccess: 0.05, witnessReduction: -0.12, bonusXP: 12, unlockLevel: 5, desc: "Roll up, fire, roll out. Fast and loud." },
  { id: "home_invasion", name: "Home Invasion", icon: "🏚️", cost: 3000, bonusSuccess: 0.18, witnessReduction: 0.22, bonusXP: 15, unlockLevel: 3, desc: "3AM. They're sleeping. You're not." },
  { id: "strangle", name: "Silent Strangulation", icon: "🫥", cost: 0, bonusSuccess: 0.15, witnessReduction: 0.38, bonusXP: 12, unlockLevel: 6, desc: "From behind. No sound. No witnesses." },
  { id: "poison_feed", name: "Poisoned Drink", icon: "🍸", cost: 10000, bonusSuccess: 0.26, witnessReduction: 0.42, bonusXP: 25, unlockLevel: 8, desc: "Slip it in their glass. Too late when they know." },
  { id: "snipe", name: "Snipe from Distance", icon: "🔭", cost: 15000, bonusSuccess: 0.24, witnessReduction: 0.30, bonusXP: 22, unlockLevel: 15, desc: "High ground. One shot. Gone before sirens." },
  { id: "professional", name: "Professional Hit", icon: "📋", cost: 50000, bonusSuccess: 0.32, witnessReduction: 0.50, bonusXP: 35, unlockLevel: 12, desc: "Clean. Efficient. Expensive. No loose ends." },
  { id: "gang_squad", name: "Hit Squad", icon: "👥", cost: 30000, bonusSuccess: 0.22, witnessReduction: 0.08, bonusXP: 18, unlockLevel: 10, desc: "Overwhelming force. Nobody walks away." },
  { id: "staged_robbery", name: "Staged Robbery", icon: "🎭", cost: 8000, bonusSuccess: 0.10, witnessReduction: 0.28, bonusXP: 16, unlockLevel: 4, desc: "Make it look like a robbery gone wrong." },
  { id: "car_crash", name: "Staged Accident", icon: "💥", cost: 20000, bonusSuccess: 0.20, witnessReduction: 0.46, bonusXP: 30, unlockLevel: 20, desc: "Cut the brakes. A tragic accident." },
  { id: "ninja", name: "Ninja Strike", icon: "🥷", cost: 25000, bonusSuccess: 0.34, witnessReduction: 0.55, bonusXP: 38, unlockLevel: 18, desc: "In and out before anyone notices." },
];

const EVIDENCE_NAMES: Record<string, string> = {
  fingerprints: "Fingerprints", dna: "DNA Evidence", witness: "Witness", cctv: "CCTV Footage",
  shell_casings: "Shell Casings", phone_records: "Phone Records", financial: "Financial Trail",
};

export const getKillWeapons = query({ args: {}, handler: async () => KILL_WEAPONS });
export const getKillMethods = query({ args: {}, handler: async () => KILL_METHODS });

// ===== HELPERS =====
async function refund(ctx: any, posterId: any, amount: number) {
  const p = await ctx.db.get(posterId);
  if (p) await ctx.db.patch(posterId, { money: n(p.money) + amount });
}

async function expireStaleContracts(ctx: any) {
  const now = Date.now();
  const open = await ctx.db.query("murderContracts").withIndex("by_status", (q: any) => q.eq("status", "open")).collect();
  for (const c of open) {
    if (now - c.createdAt > 72 * 3600000) {
      await ctx.db.patch(c._id, { status: "expired" });
      await refund(ctx, c.posterId, Math.floor(c.bounty * 0.9));
    }
  }
  const assigned = await ctx.db.query("murderContracts").withIndex("by_status", (q: any) => q.eq("status", "assigned")).collect();
  for (const c of assigned) {
    if (c.deadline && now > c.deadline) {
      await ctx.db.patch(c._id, { status: "expired" });
      await refund(ctx, c.posterId, Math.floor(c.bounty * 0.9));
      if (c.killerId) await ctx.db.insert("notifications", { userId: c.killerId, type: "contract", message: `Your contract on ${c.targetName} expired. Reputation damaged.`, read: false, timestamp: now });
    }
  }
}

// Registers a death: morgue row, cash steal, contract payout. Used by kill ops
// AND any other system that kills a player — one death pipeline for the game.
export async function registerDeath(ctx: any, killerId: any, targetId: any, cause: string) {
  const now = Date.now();
  const target = await ctx.db.get(targetId);
  if (!target) return { cashStolen: 0, contractPaid: 0 };
  const cashStolen = killerId ? Math.floor(n(target.money) * 0.05) : 0;
  const level = n(target.level, 1);
  const reviveAt = now + 5 * 60000;
  await ctx.db.patch(targetId, { life: 0, isDead: true, money: n(target.money) - cashStolen });
  const victimName = target.nickname ?? target.username ?? "Unknown";
  await ctx.db.insert("morgueDeaths", {
    userId: targetId,
    victimName,
    killerId,
    killerName: killerId ? ((await ctx.db.get(killerId))?.nickname ?? "Unknown") : "The street",
    cause,
    deathAt: now,
    reviveAt,
    revived: false,
    cashLost: cashStolen,
    contractPaid: 0,
  });
  let contractPaid = 0;
  if (killerId) {
    const contracts = await ctx.db.query("murderContracts").withIndex("by_target", (q: any) => q.eq("targetId", targetId)).collect();
    for (const c of contracts) {
      if (c.status !== "open" && c.status !== "assigned") continue;
      if (c.posterId === killerId) continue; // can't claim your own bounty
      if (c.status === "assigned" && c.killerId !== killerId) continue; // assigned belongs to its killer
      await ctx.db.patch(c._id, { status: "fulfilled", fulfilledAt: now, fulfilledBy: killerId });
      const killer = await ctx.db.get(killerId);
      if (killer) {
        await ctx.db.patch(killerId, { money: n(killer.money) + c.bounty, reputation: Math.min(100, n(killer.reputation) + Math.ceil(level / 2)) });
        await ctx.db.insert("notifications", { userId: killerId, type: "contract", message: `💰 Contract fulfilled: ${c.targetName} is dead. Bounty paid: $${c.bounty.toLocaleString()}`, read: false, timestamp: now });
      }
      if (c.posterId) await ctx.db.insert("notifications", { userId: c.posterId, type: "contract", message: `📥 The target on your contract (${c.targetName}) was eliminated.`, read: false, timestamp: now });
      contractPaid += c.bounty;
      break; // one contract pays per death
    }
  }
  return { cashStolen, contractPaid };
}

// ===== CONTRACT BOARD (darknet) =====
export const placeContract = mutation({
  args: { targetId: v.id("users"), bounty: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (player.inPrison) throw new Error("You're in prison.");
    if (player.isDead) throw new Error("Dead men don't post contracts. Visit the morgue first.");
    if (args.targetId === player._id) throw new Error("You can't put a hit on yourself.");
    if (args.bounty < 10000) throw new Error("Minimum bounty is $10,000 — nobody works for less.");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found.");
    if (target.isDead) throw new Error("That player is already in the morgue.");
    const fee = Math.floor(args.bounty * 0.05);
    const total = args.bounty + fee;
    if (n(player.money) < total) throw new Error(`You need $${total.toLocaleString()} (bounty + 5% darknet fee).`);
    const myOpen = await ctx.db.query("murderContracts").withIndex("by_poster", (q: any) => q.eq("posterId", player._id)).collect();
    if (myOpen.some((c: any) => c.status === "open" && c.targetId === args.targetId)) throw new Error("You already have an open contract on this target.");
    await ctx.db.patch(player._id, { money: n(player.money) - total });
    await ctx.db.insert("murderContracts", {
      posterId: player._id,
      posterName: player.nickname ?? "Anonymous",
      targetId: args.targetId,
      targetName: target.nickname ?? "Unknown",
      bounty: args.bounty,
      fee,
      status: "open",
      createdAt: Date.now(),
    });
    return { success: true, message: `🕸️ Contract posted on ${target.nickname}. Bounty $${args.bounty.toLocaleString()} escrowed on the darknet.` };
  },
});

export const cancelContract = mutation({
  args: { contractId: v.id("murderContracts") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const c = await ctx.db.get(args.contractId);
    if (!c) throw new Error("Contract not found.");
    if (c.posterId !== player._id) throw new Error("Not your contract.");
    if (c.status === "assigned") throw new Error("A killer already took this contract. Too late.");
    if (c.status !== "open") throw new Error("Contract already closed.");
    await ctx.db.patch(c._id, { status: "cancelled" });
    const refundAmt = Math.floor(c.bounty * 0.9);
    await ctx.db.patch(player._id, { money: n(player.money) + refundAmt });
    return { success: true, message: `Contract withdrawn. $${refundAmt.toLocaleString()} refunded (10% penalty).` };
  },
});

export const acceptContract = mutation({
  args: { contractId: v.id("murderContracts") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (player.inPrison) throw new Error("You're in prison.");
    if (player.isDead) throw new Error("You're dead. Morgue first.");
    const c = await ctx.db.get(args.contractId);
    if (!c || c.status !== "open") throw new Error("Contract no longer available.");
    if (c.posterId === player._id) throw new Error("You can't claim your own contract.");
    if (c.targetId === player._id) throw new Error("That's you. Walk away.");
    await ctx.db.patch(c._id, { status: "assigned", killerId: player._id, killerName: player.nickname ?? "Unknown", assignedAt: Date.now(), deadline: Date.now() + 24 * 3600000 });
    if (c.posterId) await ctx.db.insert("notifications", { userId: c.posterId, type: "contract", message: `🕸️ A killer has taken your contract on ${c.targetName}.`, read: false, timestamp: Date.now() });
    return { success: true, message: `🕸️ Contract accepted. Kill ${c.targetName} within 24h to claim $${c.bounty.toLocaleString()}.` };
  },
});

export const claimOpenBounty = mutation({
  args: { contractId: v.id("murderContracts") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const c = await ctx.db.get(args.contractId);
    if (!c) throw new Error("Contract not found.");
    if (c.status !== "open") throw new Error("This bounty can't be claimed.");
    if (c.posterId === player._id) throw new Error("You can't claim your own bounty.");
    const target = await ctx.db.get(c.targetId);
    if (!target || !target.isDead) throw new Error("The target is still breathing. Finish the job first.");
    await ctx.db.patch(c._id, { status: "fulfilled", fulfilledAt: Date.now(), fulfilledBy: player._id });
    await ctx.db.patch(player._id, { money: n(player.money) + c.bounty });
    return { success: true, message: `💰 Bounty claimed: $${c.bounty.toLocaleString()} for the hit on ${c.targetName}.` };
  },
});

export const getContractBoard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { open: [], mine: [], taken: [] };
    await expireStaleContracts(ctx);
    const now = Date.now();
    const open = (await ctx.db.query("murderContracts").withIndex("by_status", (q: any) => q.eq("status", "open")).collect())
      .filter((c: any) => c.posterId !== userId)
      .sort((a: any, b: any) => b.bounty - a.bounty)
      .slice(0, 25)
      .map((c: any) => ({
        _id: c._id, bounty: c.bounty, targetName: c.targetName, targetId: c.targetId,
        posterHint: (c.posterName ?? "?").slice(0, 1) + "•••", ageMin: Math.floor((now - c.createdAt) / 60000),
        targetAlive: true,
      }));
    const all = await ctx.db.query("murderContracts").collect();
    const mine = all.filter((c: any) => c.posterId === userId && (c.status === "open" || c.status === "assigned"))
      .map((c: any) => ({ _id: c._id, bounty: c.bounty, targetName: c.targetName, status: c.status, killerName: c.killerName, deadline: c.deadline }));
    const taken = all.filter((c: any) => c.killerId === userId && c.status === "assigned")
      .map((c: any) => ({ _id: c._id, bounty: c.bounty, targetName: c.targetName, deadline: c.deadline, hoursLeft: Math.max(0, ((c.deadline ?? now) - now) / 3600000) }));
    return { open, mine, taken };
  },
});

// ===== KILL OPS (plan → surveil → execute → cleanup) =====
export const beginKillOp = mutation({
  args: { targetId: v.id("users"), weaponId: v.string(), methodId: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (player.inPrison) throw new Error("You're in prison.");
    if (player.isDead) throw new Error("You're dead. Morgue first.");
    const myOps = await ctx.db.query("killOps").withIndex("by_killer", (q: any) => q.eq("killerId", player._id)).collect();
    if (myOps.some((o: any) => o.status === "planning" || o.status === "surveilling" || o.status === "ready")) {
      throw new Error("You already have an active operation. Finish or abort it first.");
    }
    const cdLeft = n(player.killOpCooldownUntil) - Date.now();
    if (cdLeft > 0) throw new Error(`Hands still shaking from the last hit — wait ${Math.ceil(cdLeft / 1000)}s.`);
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found.");
    if (args.targetId === player._id) throw new Error("You can't be your own target.");
    if (target.isDead) throw new Error("Target is already in the morgue.");
    if (target.inPrison) throw new Error("Target is behind bars — untouchable while locked up.");
    const protLeft = n(target.reviveProtectionUntil) - Date.now();
    if (protLeft > 0) throw new Error(`${target.nickname} just left the morgue — protected for ${Math.ceil(protLeft / 60000)} more minutes.`);
    const level = n(player.level, 1);
    if (n(target.level, 1) < Math.max(3, Math.floor(level * 0.3))) throw new Error("Too easy — pick on someone closer to your level. (Contracts bypass this rule.)");
    const weapon = KILL_WEAPONS.find((w) => w.id === args.weaponId);
    const method = KILL_METHODS.find((m) => m.id === args.methodId);
    if (!weapon || !method) throw new Error("Invalid loadout.");
    if (level < weapon.unlockLevel) throw new Error(`${weapon.name} unlocks at level ${weapon.unlockLevel}.`);
    if (level < method.unlockLevel) throw new Error(`${method.name} unlocks at level ${method.unlockLevel}.`);
    const cost = weapon.cost + method.cost;
    const energy = weapon.energy + 5;
    if (n(player.money) < cost) throw new Error(`Need $${cost.toLocaleString()} for this loadout.`);
    if (n(player.energy, 100) < energy) throw new Error(`Need ${energy} energy. Rest up.`);
    const opId = await ctx.db.insert("killOps", {
      killerId: player._id,
      targetId: args.targetId,
      targetName: target.nickname ?? "Unknown",
      weaponId: weapon.id,
      methodId: method.id,
      status: "planning",
      surveillanceBonus: 0,
      plannedAt: Date.now(),
      evidenceStrength: 0,
      cleaned: false,
    });
    await ctx.db.patch(player._id, { money: n(player.money) - cost, energy: Math.max(0, n(player.energy, 100) - energy) });
    return { success: true, opId, message: `🗂️ Operation opened on ${target.nickname}. Surveil them, then execute.` };
  },
});

export const runSurveillance = mutation({
  args: { opId: v.id("killOps") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const op = await ctx.db.get(args.opId);
    if (!op) throw new Error("Operation not found.");
    if (op.killerId !== player._id) throw new Error("Not your operation.");
    if (op.status !== "planning") throw new Error("Surveillance already done or not available.");
    if (n(player.energy, 100) < 10) throw new Error("Need 10 energy to stake out.");
    const target = await ctx.db.get(op.targetId);
    if (!target || target.isDead) throw new Error("Target vanished. Abort the op.");
    const readyAt = Date.now() + 60_000; // 60s stakeout
    await ctx.db.patch(player._id, { energy: Math.max(0, n(player.energy, 100) - 10) });
    await ctx.db.patch(op._id, { status: "surveilling", surveillanceReadyAt: readyAt });
    return { success: true, readyAt, message: `🔭 Surveillance drone planted on ${op.targetName}. Intel in 60 seconds.` };
  },
});

export const collectSurveillance = mutation({
  args: { opId: v.id("killOps") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const op = await ctx.db.get(args.opId);
    if (!op) throw new Error("Operation not found.");
    if (op.killerId !== player._id) throw new Error("Not your operation.");
    if (op.status !== "surveilling") throw new Error("No surveillance running.");
    if (Date.now() < n(op.surveillanceReadyAt)) throw new Error("Drone still streaming — hold on.");
    const target = await ctx.db.get(op.targetId);
    if (!target) throw new Error("Target vanished.");
    const isOnline = Date.now() - n(target.lastActive) < 300000;
    const bonus = isOnline ? 0.08 : 0.13; // offline targets are easier after surveillance
    const intel = `HP ${Math.round((n(target.life) / Math.max(1, n(target.maxLife, 100))) * 100)}% · DEF ${n(target.defense, 10)} · ${isOnline ? "ONLINE now" : "offline"} · wanted ${n(target.wantedLevel)}/10`;
    await ctx.db.patch(op._id, { status: "ready", surveillanceBonus: bonus, intel });
    return { success: true, intel, bonus, message: `📡 Intel secured (+${Math.round(bonus * 100)}% success): ${intel}` };
  },
});

function estimateSuccess(player: any, target: any, weapon: any, method: any, surveillanceBonus: number) {
  const levelDiff = Math.max(-0.10, Math.min(0.15, (n(player.level, 1) - n(target.level, 1)) * 0.01));
  const statEdge = Math.max(-0.10, Math.min(0.15, (n(player.attack, 10) - n(target.defense, 10)) / 500));
  const isOnline = Date.now() - n(target.lastActive) < 300000;
  const onlinePenalty = isOnline ? -0.08 : 0;
  const wantedPenalty = -0.02 * n(player.wantedLevel);
  const chance = weapon.successBase + method.bonusSuccess + surveillanceBonus + levelDiff + statEdge + onlinePenalty + wantedPenalty;
  return Math.max(0.05, Math.min(0.92, chance));
}

export const executeKillOp = mutation({
  args: { opId: v.id("killOps") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const op = await ctx.db.get(args.opId);
    if (!op) throw new Error("Operation not found.");
    if (op.killerId !== player._id) throw new Error("Not your operation.");
    if (op.status === "surveilling") throw new Error("Surveillance still running.");
    if (op.status !== "planning" && op.status !== "ready") throw new Error("Operation not executable.");
    const target = await ctx.db.get(op.targetId);
    if (!target) throw new Error("Target not found.");
    if (target.isDead) throw new Error("Target already dead — someone beat you to it.");
    if (target.inPrison) throw new Error("Target got locked up. Abort.");
    if (n(target.reviveProtectionUntil) > Date.now()) throw new Error("Target is under morgue protection.");
    const weapon = KILL_WEAPONS.find((w) => w.id === op.weaponId)!;
    const method = KILL_METHODS.find((m) => m.id === op.methodId)!;
    const now = Date.now();
    const chance = estimateSuccess(player, target, weapon, method, n(op.surveillanceBonus));
    const success = Math.random() < chance;
    const rankEventMult = await getRankEventMultiplier(ctx);
    const detectiveResolvesAt = now + (20 + Math.floor(Math.random() * 25)) * 60000;

    if (success) {
      const stolen = Math.floor(n(target.money) * 0.05);
      const hitPay = 25000 + n(target.level, 1) * 5000;
      const xpGained = Math.floor((40 + weapon.damage / 2 + method.bonusXP + n(target.level, 1) * 2) * rankEventMult);
      const deathResult = await registerDeath(ctx, player._id, op.targetId, `${method.name} with ${weapon.name}`);

      // Evidence generation — every trace is a real row the detective can use
      const evidence: { id: string; strength: number }[] = [];
      if (Math.random() < weapon.trace) evidence.push({ id: "shell_casings", strength: 1.5 });
      if (Math.random() < Math.max(0.04, 0.30 - method.witnessReduction)) evidence.push({ id: "witness", strength: 2.5 });
      if (Math.random() < 0.18) evidence.push({ id: "cctv", strength: 2 });
      if (Math.random() < 0.12) evidence.push({ id: "dna", strength: 2 });
      if (Math.random() < 0.10) evidence.push({ id: "fingerprints", strength: 1.5 });
      if (Math.random() < 0.08) evidence.push({ id: "phone_records", strength: 1 });
      if (Math.random() < 0.06) evidence.push({ id: "financial", strength: 1 });
      const strength = evidence.reduce((s, e) => s + e.strength, 0);
      for (const e of evidence) {
        await ctx.db.insert("forensics", { opId: op._id, killerId: player._id, scene: `${method.name} · ${op.targetName}`, evidenceType: e.id, strength: e.strength, resolved: false, createdAt: now });
      }
      const wantedGain = Math.max(1, Math.min(4, Math.ceil(strength / 2)));
      await ctx.db.patch(player._id, {
        totalKills: n(player.totalKills) + 1,
        wantedLevel: Math.min(10, n(player.wantedLevel) + wantedGain),
        money: n(player.money) + stolen + hitPay + deathResult.contractPaid,
        reputation: Math.min(100, n(player.reputation) + Math.ceil(n(target.level, 1) / 2)),
        experience: n(player.experience) + xpGained,
        killOpCooldownUntil: now + 3 * 60000,
        lastCrimeAt: now,
      });
      await ctx.db.patch(op._id, { status: "executed", executedAt: now, success: true, evidenceStrength: strength, detectiveResolvesAt });
      await ctx.db.insert("crimes", { userId: player._id, type: "murder", target: op.targetName, success: true, moneyEarned: stolen + hitPay + deathResult.contractPaid, pointsEarned: xpGained, damageTaken: 0, timestamp: now });

      // Witness statement — coded proof of the hit, sellable on the marketplace
      try {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        let code = ""; let s = Math.floor(Math.random() * 1e9);
        for (let i = 0; i < 6; i++) { s = (s * 9301 + 49297) % 233280; code += chars[Math.floor((s / 233280) * chars.length)]; }
        const lines = [
          `I saw it happen. [KILLER] used a ${weapon.name.toLowerCase()} and walked away like nothing.`,
          `[KILLER] did it — clean, calm, gone before the sirens started.`,
          `Streetlight caught [KILLER]'s face. I'd swear it in court.`,
        ];
        await ctx.db.insert("witnessStatements", { killerId: player._id, killerName: player.nickname ?? "Unknown", victimId: op.targetId, victimName: op.targetName, code, text: lines[Math.floor(Math.random() * lines.length)], ownerId: player._id, listed: false, price: 0, createdAt: now } as any);
      } catch {}

      if (op.targetId) await ctx.db.insert("notifications", { userId: op.targetId, type: "death", message: `💀 You were murdered — ${method.name} with ${weapon.name}. $${stolen.toLocaleString()} taken from your pocket.`, read: false, timestamp: now });

      const narratives = [
        `The city held its breath. ${op.targetName} never saw the ${weapon.name.toLowerCase()} coming.`,
        `One clean move. ${op.targetName} dropped where they stood.`,
        `Professional work. ${op.targetName}'s story ends here, and yours gets a new chapter.`,
      ];
      return {
        success: true, killed: op.targetName, narrative: narratives[Math.floor(Math.random() * narratives.length)],
        cash: stolen, hitPay, contractPaid: deathResult.contractPaid, xpGained, wantedGain,
        evidence: evidence.map((e) => EVIDENCE_NAMES[e.id] ?? e.id),
        evidenceStrength: strength, detectiveResolvesAt, chance: Math.round(chance * 100),
      };
    }

    // FAILURE
    const damageTaken = Math.floor(15 + Math.random() * 45);
    const newLife = Math.max(0, n(player.life, 100) - damageTaken);
    const goesToPrison = Math.random() < 0.35;
    const xpGained = Math.floor(8 * Math.max(1, rankEventMult));
    const learned = Math.random() < 0.5;
    await ctx.db.patch(op._id, { status: "failed", executedAt: now, success: false, evidenceStrength: 1, detectiveResolvesAt });
    const failPatch: any = {
      life: newLife,
      wantedLevel: Math.min(10, n(player.wantedLevel) + 2),
      experience: n(player.experience) + xpGained,
      killOpCooldownUntil: now + 2 * 60000,
      lastCrimeAt: now,
    };
    if (goesToPrison) { failPatch.inPrison = true; failPatch.prisonTime = await getJailMs(ctx, "murder", 60000); }
    if (newLife <= 0) {
      failPatch.isDead = true; failPatch.life = 0;
      await registerDeath(ctx, null, player._id, "Killed during a failed hit on " + op.targetName);
    }
    await ctx.db.patch(player._id, failPatch);
    await ctx.db.insert("crimes", { userId: player._id, type: "murder", target: op.targetName, success: false, moneyEarned: 0, pointsEarned: xpGained, damageTaken, timestamp: now });
    await ctx.db.insert("forensics", { opId: op._id, killerId: player._id, scene: `Failed hit · ${op.targetName}`, evidenceType: "dna", strength: 1, resolved: false, createdAt: now });
    if (op.targetId) {
      await ctx.db.insert("notifications", {
        userId: op.targetId, type: "alert", read: false, timestamp: now,
        message: learned ? `🚨 Someone tried to kill you — ${method.name}! You caught a glimpse: ${player.nickname ?? "a stranger"}.` : `🚨 Someone just tried to kill you. You don't know who.`,
      });
    }
    return {
      success: false, narrative: `The plan fell apart. ${op.targetName} fought back hard.`, damageTaken, xpGained,
      arrested: goesToPrison, targetDodged: op.targetName, learnedIdentity: learned, chance: Math.round(chance * 100), killedSelf: newLife <= 0,
    };
  },
});

export const abortKillOp = mutation({
  args: { opId: v.id("killOps") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const op = await ctx.db.get(args.opId);
    if (!op || op.killerId !== player._id) throw new Error("Not your operation.");
    if (op.status !== "planning" && op.status !== "surveilling" && op.status !== "ready") throw new Error("Nothing to abort.");
    await ctx.db.patch(op._id, { status: "aborted" });
    return { success: true, message: "Operation aborted. No traces." };
  },
});

// ===== FORENSICS & CLEANERS =====
export const getMyHeat = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const player = await ctx.db.get(userId);
    if (!player) return null;
    const now = Date.now();
    const scenes = await ctx.db.query("forensics").withIndex("by_killer", (q: any) => q.eq("killerId", userId)).collect();
    const open = scenes.filter((f: any) => !f.resolved);
    const ops = await ctx.db.query("killOps").withIndex("by_killer", (q: any) => q.eq("killerId", userId)).collect();
    const openOps = ops.filter((o: any) => o.status === "executed" && n(o.detectiveResolvesAt) > now);
    const sceneList = openOps.map((o: any) => {
      const ev = open.filter((f: any) => f.opId === o._id);
      const strength = ev.reduce((s: number, f: any) => s + n(f.strength), 0);
      return { opId: o._id, scene: `${o.methodId} · ${o.targetName}`, strength, evidence: ev.map((f: any) => f.evidenceType), resolvesAt: o.detectiveResolvesAt, cleaned: !!o.cleaned };
    });
    return { wantedLevel: n(player.wantedLevel), openScenes: sceneList, closed: scenes.filter((f: any) => f.resolved).length };
  },
});

export const hireCleaner = mutation({
  args: { opId: v.id("killOps") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const op = await ctx.db.get(args.opId);
    if (!op || op.killerId !== player._id) throw new Error("Not your operation.");
    if (op.cleaned) throw new Error("Cleaners already worked this scene.");
    if (op.status !== "executed") throw new Error("Nothing to clean.");
    if (Date.now() > n(op.detectiveResolvesAt)) throw new Error("Too late — the detective already has the file.");
    const evidence = await ctx.db.query("forensics").withIndex("by_op", (q: any) => q.eq("opId", op._id)).collect();
    const openEv = evidence.filter((e: any) => !e.resolved);
    if (openEv.length === 0) throw new Error("The scene is already spotless.");
    const cost = 20000 * openEv.length;
    if (n(player.money) < cost) throw new Error(`Cleaner wants $${cost.toLocaleString()} for ${openEv.length} traces.`);
    for (const e of openEv) {
      if (Math.random() < 0.8) await ctx.db.patch(e._id, { resolved: true, resolvedAt: Date.now(), outcome: "cleaned" });
    }
    await ctx.db.patch(op._id, { cleaned: true, evidenceStrength: Math.max(0, n(op.evidenceStrength) * 0.2) });
    await ctx.db.patch(player._id, { money: n(player.money) - cost });
    return { success: true, message: `🧹 Cleaners scrubbed the scene ($${cost.toLocaleString()}). Most traces are gone.` };
  },
});

// Detective resolution — 20-45 min after every successful hit, evidence decides
// whether the killer walks, heats up, or goes to prison.
export async function resolveInvestigations(ctx: any, userId: any) {
  const now = Date.now();
  const ops = await ctx.db.query("killOps").withIndex("by_killer", (q: any) => q.eq("killerId", userId)).collect();
  for (const op of ops) {
    if (op.status !== "executed" || !op.detectiveResolvesAt || op.detectiveResolvesAt > now) continue;
    const evidence = (await ctx.db.query("forensics").withIndex("by_op", (q: any) => q.eq("opId", op._id)).collect()).filter((e: any) => !e.resolved);
    const strength = evidence.reduce((s: number, e: any) => s + n(e.strength), 0);
    const player = await ctx.db.get(userId);
    if (!player) continue;
    for (const e of evidence) await ctx.db.patch(e._id, { resolved: true, resolvedAt: now, outcome: "investigated" });
    if (strength >= 5) {
      const jail = await getJailMs(ctx, "murder", 60000);
      await ctx.db.patch(userId, { inPrison: true, prisonTime: jail * 3, wantedLevel: Math.min(10, n(player.wantedLevel) + 4) });
      await ctx.db.insert("notifications", { userId, type: "detective", message: `🚔 Detective closed the case on ${op.targetName}: CHARGED. You're going to prison.`, read: false, timestamp: now });
    } else if (strength >= 2.5) {
      await ctx.db.patch(userId, { wantedLevel: Math.min(10, n(player.wantedLevel) + 2) });
      await ctx.db.insert("notifications", { userId, type: "detective", message: `🕵️ Detective couldn't pin ${op.targetName} on you, but your name is hot. Wanted +2.`, read: false, timestamp: now });
    } else {
      await ctx.db.insert("notifications", { userId, type: "detective", message: `❄️ The ${op.targetName} case went cold. No evidence held up.`, read: false, timestamp: now });
    }
    await ctx.db.patch(op._id, { status: "resolved" });
  }
}

export const resolveInvestigationsTick = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    await resolveInvestigations(ctx, player._id);
    return { success: true };
  },
});

// ===== MORGUE =====
export const getMorgue = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { me: null, recent: [] };
    const player = await ctx.db.get(userId);
    const deaths = await ctx.db.query("morgueDeaths").withIndex("by_revived", (q: any) => q.eq("revived", false)).collect();
    const recent = deaths.sort((a: any, b: any) => b.deathAt - a.deathAt).slice(0, 12).map((d: any) => ({
      victimName: d.victimName ?? "Unknown", killerName: d.killerName, cause: d.cause, deathAt: d.deathAt, reviveAt: d.reviveAt, cashLost: d.cashLost,
    }));
    let me: any = null;
    if (player?.isDead) {
      const mine = (await ctx.db.query("morgueDeaths").withIndex("by_user", (q: any) => q.eq("userId", userId)).collect()).sort((a: any, b: any) => b.deathAt - a.deathAt);
      const myDeath = mine.find((d: any) => !d.revived) ?? mine[0];
      if (myDeath) {
        me = {
          deathAt: myDeath.deathAt, reviveAt: myDeath.reviveAt, killerName: myDeath.killerName, cause: myDeath.cause,
          cashLost: myDeath.cashLost, secondsLeft: Math.max(0, Math.ceil((myDeath.reviveAt - Date.now()) / 1000)),
          medicCost: 50000 * (1 + Math.floor(n(player.level, 1) / 20)), medicCoins: 25,
        };
      }
    }
    return { me, recent };
  },
});

export const leaveMorgue = mutation({
  args: { method: v.union(v.literal("wait"), v.literal("medic"), v.literal("coins")) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player.isDead) throw new Error("You're not dead.");
    const mine = (await ctx.db.query("morgueDeaths").withIndex("by_user", (q: any) => q.eq("userId", player._id)).collect()).sort((a: any, b: any) => b.deathAt - a.deathAt);
    const death = mine.find((d: any) => !d.revived) ?? mine[0];
    if (!death) throw new Error("No morgue record found.");
    const now = Date.now();
    const maxLife = Math.max(100, n(player.maxLife, 100));
    if (args.method === "wait") {
      if (now < death.reviveAt) throw new Error(`The coroner hasn't signed off — ${Math.ceil((death.reviveAt - now) / 1000)}s left.`);
      await ctx.db.patch(player._id, { isDead: false, life: Math.floor(maxLife * 0.3), reviveProtectionUntil: now + 10 * 60000 });
    } else if (args.method === "medic") {
      const cost = 50000 * (1 + Math.floor(n(player.level, 1) / 20));
      if (n(player.money) < cost) throw new Error(`The street medic wants $${cost.toLocaleString()} up front.`);
      await ctx.db.patch(player._id, { isDead: false, life: Math.floor(maxLife * 0.6), money: n(player.money) - cost, reviveProtectionUntil: now + 10 * 60000 });
    } else {
      if (n(player.coins) < 25) throw new Error("You need 25 coins for the VIP clinic.");
      await ctx.db.patch(player._id, { isDead: false, life: maxLife, coins: n(player.coins) - 25, reviveProtectionUntil: now + 10 * 60000 });
    }
    await ctx.db.patch(death._id, { revived: true });
    return { success: true, message: "🏥 You're back among the living. 10 minutes of morgue protection active." };
  },
});

// ===== BOARDS =====
export const getMostWanted = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all
      .filter((p: any) => n(p.wantedLevel) > 0 || n(p.totalKills) > 0)
      .sort((a: any, b: any) => (n(b.wantedLevel) * 1000 + n(b.totalKills)) - (n(a.wantedLevel) * 1000 + n(a.totalKills)))
      .slice(0, 15)
      .map((p: any) => ({ nickname: p.nickname ?? "Unknown", level: n(p.level, 1), kills: n(p.totalKills), wanted: n(p.wantedLevel), reputation: n(p.reputation), isDead: !!p.isDead }));
  },
});

export const getKillFeed = query({
  args: {},
  handler: async (ctx) => {
    const crimes = await ctx.db.query("crimes")
      .filter((q: any) => q.eq(q.field("type"), "murder"))
      .order("desc")
      .take(20);
    const results = [];
    for (const c of crimes) {
      const killer = await ctx.db.get(c.userId);
      results.push({ killer: killer?.nickname ?? "Unknown", killerLevel: n(killer?.level, 1), target: c.target, success: c.success, money: n(c.moneyEarned), timestamp: c.timestamp });
    }
    return results;
  },
});

export const getKillTargets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const me = await ctx.db.get(userId);
    const myLevel = n(me?.level, 1);
    const all = await ctx.db.query("users").collect();
    const now = Date.now();
    return all
      .filter((p: any) => p._id !== userId && !p.isDead && !p.inPrison)
      .map((p: any) => ({
        _id: p._id,
        nickname: p.nickname ?? "Unknown",
        level: n(p.level, 1),
        money: n(p.money),
        attack: n(p.attack, 10),
        defense: n(p.defense, 10),
        wantedLevel: n(p.wantedLevel),
        isOnline: now - n(p.lastActive) < 300000,
        morgueProtected: n(p.reviveProtectionUntil) > now,
        tooWeak: n(p.level, 1) < Math.max(3, Math.floor(myLevel * 0.3)),
      }))
      .sort((a: any, b: any) => b.level - a.level)
      .slice(0, 40);
  },
});

export const getMyActiveOp = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const ops = await ctx.db.query("killOps").withIndex("by_killer", (q: any) => q.eq("killerId", userId)).collect();
    const active = ops.find((o: any) => o.status === "planning" || o.status === "surveilling" || o.status === "ready");
    if (!active) return null;
    const target = await ctx.db.get(active.targetId);
    if (!target) return { op: active, target: null, estimatedSuccess: 0 };
    const weapon = KILL_WEAPONS.find((w) => w.id === active.weaponId);
    const method = KILL_METHODS.find((m) => m.id === active.methodId);
    const me = await ctx.db.get(userId);
    const chance = weapon && method ? estimateSuccess(me, target, weapon, method, n(active.surveillanceBonus)) : 0;
    const isOnline = Date.now() - n(target.lastActive) < 300000;
    return {
      op: active,
      target: { nickname: target.nickname, level: n(target.level, 1), life: n(target.life), maxLife: n(target.maxLife, 100), defense: n(target.defense, 10), isOnline },
      estimatedSuccess: Math.round(chance * 100),
    };
  },
});

import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

const REGEN_INTERVALS = { energy: 60000, stamina: 90000, focus: 120000 };
const REGEN_AMOUNTS = { energy: 5, stamina: 3, focus: 2 };

import { RESOURCE_COSTS } from "../data/resourceCosts";

function getPlayerResources(p: any) {
  const now = Date.now();
  let energy = p.energy ?? 100, maxEnergy = p.maxEnergy ?? 100;
  let stamina = p.stamina ?? 100, maxStamina = p.maxStamina ?? 100;
  let focus = p.focus ?? 100, maxFocus = p.maxFocus ?? 100;
  let morale = p.morale ?? 80, maxMorale = p.maxMorale ?? 100;
  let adrenaline = p.adrenaline ?? 0, maxAdrenaline = p.maxAdrenaline ?? 100;
  let heat = p.heat ?? 0, maxHeat = p.maxHeat ?? 100;

  if (p.lastEnergyRegen) { const t = Math.floor((now - p.lastEnergyRegen) / REGEN_INTERVALS.energy); if (t > 0) energy = Math.min(maxEnergy, energy + t * REGEN_AMOUNTS.energy); }
  if (p.lastStaminaRegen) { const t = Math.floor((now - p.lastStaminaRegen) / REGEN_INTERVALS.stamina); if (t > 0) stamina = Math.min(maxStamina, stamina + t * REGEN_AMOUNTS.stamina); }
  if (p.lastFocusRegen) { const t = Math.floor((now - p.lastFocusRegen) / REGEN_INTERVALS.focus); if (t > 0) focus = Math.min(maxFocus, focus + t * REGEN_AMOUNTS.focus); }

  heat = Math.max(0, heat - 1);
  if (adrenaline > 0) adrenaline = Math.max(0, adrenaline - 2);
  if (morale < maxMorale) morale = Math.min(maxMorale, morale + 1);

  return { energy: Math.floor(energy), maxEnergy, stamina: Math.floor(stamina), maxStamina, focus: Math.floor(focus), maxFocus, morale: Math.floor(morale), maxMorale, adrenaline: Math.floor(adrenaline), maxAdrenaline, heat: Math.floor(heat), maxHeat };
}

function checkMissing(r: any, costs: { energy: number; stamina: number; focus: number; morale: number; heat: number }) {
  const missing: string[] = [];
  if (costs.energy > 0 && r.energy < costs.energy) missing.push(`Energy (${r.energy}/${costs.energy})`);
  if (costs.stamina > 0 && r.stamina < costs.stamina) missing.push(`Stamina (${r.stamina}/${costs.stamina})`);
  if (costs.focus > 0 && r.focus < costs.focus) missing.push(`Focus (${r.focus}/${costs.focus})`);
  if (costs.morale > 0 && r.morale < costs.morale) missing.push(`Morale (${r.morale}/${costs.morale})`);
  return missing;
}

export const getResources = query({ args: {}, handler: async (ctx) => {
  const userId = await getAuthUserId(ctx); if (!userId) return null;
  const player = await ctx.db.get(userId); if (!player) return null;
  const now = Date.now();
  const r = getPlayerResources(player);
  return { ...r,
    nextEnergyRegen: ((player as any).lastEnergyRegen ?? now) + REGEN_INTERVALS.energy - now,
    nextStaminaRegen: ((player as any).lastStaminaRegen ?? now) + REGEN_INTERVALS.stamina - now,
    nextFocusRegen: ((player as any).lastFocusRegen ?? now) + REGEN_INTERVALS.focus - now,
  };
}});

export const canAfford = query({ args: { actionType: v.string() }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) return { canAfford: false, reason: "Not authenticated" };
  const player = await ctx.db.get(userId); if (!player) return { canAfford: false, reason: "Player not found" };
  const costs = RESOURCE_COSTS[args.actionType]; if (!costs) return { canAfford: true, reason: "No resource cost" };
  const r = getPlayerResources(player);
  const missing = checkMissing(r, costs);
  if (missing.length > 0) return { canAfford: false, reason: `Need: ${missing.join(", ")}` };
  return { canAfford: true, reason: "OK" };
}});

export const consumeResources = mutation({ args: { actionType: v.string() }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId); if (!player) throw new Error("Player not found");
  const costs = RESOURCE_COSTS[args.actionType];
  if (!costs) return { success: true, message: "No resources consumed" };
  const now = Date.now();
  const r = getPlayerResources(player);
  const missing = checkMissing(r, costs);
  if (missing.length > 0) throw new Error(`Not enough resources: ${missing.join(", ")}. Wait for them to regenerate.`);

  let energy = Math.max(0, r.energy - costs.energy);
  let stamina = Math.max(0, r.stamina - costs.stamina);
  let focus = Math.max(0, r.focus - costs.focus);
  let morale = Math.max(0, r.morale - costs.morale);
  let heat = Math.min(r.maxHeat, r.heat + costs.heat);
  let adrenaline = r.adrenaline;
  if (["fight", "duel", "arena", "murder"].includes(args.actionType)) adrenaline = Math.min(r.maxAdrenaline, adrenaline + 15);

  await ctx.db.patch(userId, { energy, stamina, focus, morale, heat, adrenaline, lastEnergyRegen: now, lastStaminaRegen: now, lastFocusRegen: now } as any);
  return { success: true, energy, stamina, focus, morale, heat, adrenaline };
}});

export const useRecovery = mutation({ args: { recoveryType: v.string() }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId); if (!player) throw new Error("Player not found");
  const costs = RESOURCE_COSTS[args.recoveryType]; if (!costs) throw new Error("Unknown recovery type");
  const now = Date.now();
  const r = getPlayerResources(player);
  const energy = Math.min(r.maxEnergy, r.energy + Math.abs(costs.energy));
  const stamina = Math.min(r.maxStamina, r.stamina + Math.abs(costs.stamina));
  const focus = Math.min(r.maxFocus, r.focus + Math.abs(costs.focus));
  const morale = Math.min(r.maxMorale, r.morale + Math.abs(costs.morale));
  const heat = Math.max(0, r.heat + costs.heat);
  await ctx.db.patch(userId, { energy, stamina, focus, morale, heat, lastEnergyRegen: now, lastStaminaRegen: now, lastFocusRegen: now } as any);
  return { success: true, energy, stamina, focus, morale, heat };
}});

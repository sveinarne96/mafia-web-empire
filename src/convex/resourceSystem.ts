import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Each resource refills from empty to full in five minutes.
const REGEN_INTERVALS = { energy: 3000, stamina: 3000, focus: 3000 };
const REGEN_AMOUNTS = { energy: 1, stamina: 1, focus: 1 };
const DEFAULT_MAX = 100;

type ResourceCost = { energy: number; stamina: number; focus: number; morale: number; heat: number };

function finite(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizedCost(value: Partial<ResourceCost> | undefined): ResourceCost {
  return {
    energy: Math.max(0, finite(value?.energy, 0)),
    stamina: Math.max(0, finite(value?.stamina, 0)),
    focus: Math.max(0, finite(value?.focus, 0)),
    morale: Math.max(0, finite(value?.morale, 0)),
    heat: finite(value?.heat, 0),
  };
}

import { RESOURCE_COSTS } from "../data/resourceCosts";

function getPlayerResources(p: any) {
  const now = Date.now();
  const maxEnergy = Math.max(1, finite(p.maxEnergy, DEFAULT_MAX));
  const maxStamina = Math.max(1, finite(p.maxStamina, DEFAULT_MAX));
  const maxFocus = Math.max(1, finite(p.maxFocus, DEFAULT_MAX));
  const maxMorale = Math.max(1, finite(p.maxMorale, DEFAULT_MAX));
  const maxAdrenaline = Math.max(1, finite(p.maxAdrenaline, DEFAULT_MAX));
  const maxHeat = Math.max(1, finite(p.maxHeat, DEFAULT_MAX));
  let energy = Math.min(maxEnergy, Math.max(0, finite(p.energy, maxEnergy)));
  let stamina = Math.min(maxStamina, Math.max(0, finite(p.stamina, maxStamina)));
  let focus = Math.min(maxFocus, Math.max(0, finite(p.focus, maxFocus)));
  let morale = Math.min(maxMorale, Math.max(0, finite(p.morale, 80)));
  let adrenaline = Math.min(maxAdrenaline, Math.max(0, finite(p.adrenaline, 0)));
  let heat = Math.min(maxHeat, Math.max(0, finite(p.heat, 0)));

  if (p.lastEnergyRegen) { const t = Math.floor((now - p.lastEnergyRegen) / REGEN_INTERVALS.energy); if (t > 0) energy = Math.min(maxEnergy, energy + t * REGEN_AMOUNTS.energy); }
  if (p.lastStaminaRegen) { const t = Math.floor((now - p.lastStaminaRegen) / REGEN_INTERVALS.stamina); if (t > 0) stamina = Math.min(maxStamina, stamina + t * REGEN_AMOUNTS.stamina); }
  if (p.lastFocusRegen) { const t = Math.floor((now - p.lastFocusRegen) / REGEN_INTERVALS.focus); if (t > 0) focus = Math.min(maxFocus, focus + t * REGEN_AMOUNTS.focus); }

  // Passive values decay slowly and deterministically; queries never write data.
  heat = Math.max(0, heat - Math.floor(Math.max(0, now - (p.lastHeatUpdate ?? now)) / 300000));
  adrenaline = Math.max(0, adrenaline - Math.floor(Math.max(0, now - (p.lastAdrenalineUpdate ?? now)) / 300000));
  morale = Math.min(maxMorale, morale + Math.floor(Math.max(0, now - (p.lastMoraleUpdate ?? now)) / 300000));

  return { energy: Math.floor(energy), maxEnergy, stamina: Math.floor(stamina), maxStamina, focus: Math.floor(focus), maxFocus, morale: Math.floor(morale), maxMorale, adrenaline: Math.floor(adrenaline), maxAdrenaline, heat: Math.floor(heat), maxHeat };
}

function checkMissing(r: any, costs: ResourceCost) {
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
    nextEnergyRegen: Math.max(0, ((player as any).lastEnergyRegen ?? now) + REGEN_INTERVALS.energy - now),
    nextStaminaRegen: Math.max(0, ((player as any).lastStaminaRegen ?? now) + REGEN_INTERVALS.stamina - now),
    nextFocusRegen: Math.max(0, ((player as any).lastFocusRegen ?? now) + REGEN_INTERVALS.focus - now),
    regenIntervalMs: REGEN_INTERVALS.energy,
    generatedAt: now,
  };
}});

export const canAfford = query({ args: { actionType: v.string() }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) return { canAfford: false, reason: "Not authenticated" };
  const player = await ctx.db.get(userId); if (!player) return { canAfford: false, reason: "Player not found" };
  const costs = normalizedCost(RESOURCE_COSTS[args.actionType] ?? RESOURCE_COSTS.default);
  const r = getPlayerResources(player);
  const missing = checkMissing(r, costs);
  if (missing.length > 0) return { canAfford: false, reason: `Need: ${missing.join(", ")}` };
  return { canAfford: true, reason: "OK" };
}});

export const consumeResources = mutation({ args: { actionType: v.string() }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId); if (!player) throw new Error("Player not found");
  const costs = normalizedCost(RESOURCE_COSTS[args.actionType] ?? RESOURCE_COSTS.default);
  const now = Date.now();
  const r = getPlayerResources(player);
  const missing = checkMissing(r, costs);
  if (missing.length > 0) throw new Error(`Not enough resources: ${missing.join(", ")}. Wait for them to regenerate.`);

  let energy = Math.max(0, r.energy - costs.energy);
  let stamina = Math.max(0, r.stamina - costs.stamina);
  let focus = Math.max(0, r.focus - costs.focus);
  let morale = Math.max(0, r.morale - costs.morale);
  let heat = Math.min(r.maxHeat, Math.max(0, r.heat + costs.heat));
  let adrenaline = r.adrenaline;
  if (["fight", "duel", "arena", "murder"].includes(args.actionType)) adrenaline = Math.min(r.maxAdrenaline, adrenaline + 15);

  await ctx.db.patch(userId, { energy, stamina, focus, morale, heat, adrenaline, lastEnergyRegen: now, lastStaminaRegen: now, lastFocusRegen: now, lastHeatUpdate: now, lastAdrenalineUpdate: now, lastMoraleUpdate: now } as any);
  return { success: true, energy, stamina, focus, morale, heat, adrenaline };
}});

export const useRecovery = mutation({ args: { recoveryType: v.string() }, handler: async (ctx, args) => {
  const userId = await getAuthUserId(ctx); if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId); if (!player) throw new Error("Player not found");
  const costs = RESOURCE_COSTS[args.recoveryType]; if (!costs) throw new Error("Unknown recovery type");
  const recovery = normalizedCost(costs);
  const now = Date.now();
  const r = getPlayerResources(player);
  const energy = Math.min(r.maxEnergy, r.energy + Math.abs(recovery.energy));
  const stamina = Math.min(r.maxStamina, r.stamina + Math.abs(recovery.stamina));
  const focus = Math.min(r.maxFocus, r.focus + Math.abs(recovery.focus));
  const morale = Math.min(r.maxMorale, r.morale + Math.abs(recovery.morale));
  const heat = Math.max(0, Math.min(r.maxHeat, r.heat + recovery.heat));
  await ctx.db.patch(userId, { energy, stamina, focus, morale, heat, lastEnergyRegen: now, lastStaminaRegen: now, lastFocusRegen: now } as any);
  return { success: true, energy, stamina, focus, morale, heat };
}});

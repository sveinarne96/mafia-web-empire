import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ═══════════════════════════════════════════════════════════════
// REALISTIC HOSPITAL SYSTEM
// Patients arrive by ambulance, air-ambulance helicopter or
// medivac plane depending on severity. Invoices are paid before
// treatment. Live dispatch feed shows vehicles en route.
// ═══════════════════════════════════════════════════════════════

function n(x: unknown, d = 0): number { return typeof x === "number" && isFinite(x) ? x : d; }

const CONDITIONS: { name: string; icon: string; severity: "critical" | "serious" | "moderate"; base: number }[] = [
  { name: "Gunshot Wound", icon: "🔫", severity: "critical", base: 25_000 },
  { name: "Stab Wound", icon: "🔪", severity: "serious", base: 8_000 },
  { name: "Blunt Force Trauma", icon: "🥊", severity: "serious", base: 12_000 },
  { name: "Internal Bleeding", icon: "🩸", severity: "critical", base: 40_000 },
  { name: "Fractured Skull", icon: "🤕", severity: "critical", base: 35_000 },
  { name: "Broken Ribs", icon: "🦴", severity: "moderate", base: 4_000 },
  { name: "Concussion", icon: "😵‍💫", severity: "moderate", base: 3_000 },
  { name: "Drug Overdose", icon: "💊", severity: "critical", base: 30_000 },
  { name: "Severe Burns", icon: "🔥", severity: "critical", base: 45_000 },
  { name: "Shrapnel Wounds", icon: "💥", severity: "serious", base: 18_000 },
  { name: "Nerve Damage", icon: "⚡", severity: "serious", base: 15_000 },
  { name: "Blood Loss", icon: "🩹", severity: "serious", base: 9_000 },
  { name: "Fractured Leg", icon: "🦵", severity: "moderate", base: 3_500 },
  { name: "Fractured Arm", icon: "🦾", severity: "moderate", base: 3_200 },
  { name: "Poisoning", icon: "🧪", severity: "critical", base: 28_000 },
];

const TRANSPORT: Record<string, { name: string; icon: string; eta: number; cost: number }> = {
  ambulance: { name: "Ground Ambulance", icon: "🚑", eta: 45_000, cost: 2_500 },
  helicopter: { name: "Air Ambulance Helicopter", icon: "🚁", eta: 25_000, cost: 15_000 },
  medivac: { name: "Medivac Jet Plane", icon: "🛩️", eta: 15_000, cost: 60_000 },
};

export const getHospitalData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const player: any = await ctx.db.get(userId);
    const visits = await ctx.db.query("hospitalVisits").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const active = visits.filter((v) => !v.paid).sort((a, b) => b.admittedAt - a.admittedAt)[0] ?? null;
    const history = visits.filter((v) => v.paid).sort((a, b) => b.admittedAt - a.admittedAt).slice(0, 10);
    // Global live dispatch feed (any player, last 5 minutes)
    const allRecent = await ctx.db.query("hospitalVisits").withIndex("by_active", (q) => q.eq("paid", false)).collect();
    const liveDispatch = allRecent.filter((v) => Date.now() - v.admittedAt < 5 * 60_000).sort((a, b) => b.admittedAt - a.admittedAt).slice(0, 8);
    return {
      life: n(player?.life), maxLife: n(player?.maxLife, 100),
      money: n(player?.money), isDead: !!player?.isDead,
      activeVisit: active, history, liveDispatch,
    };
  },
});

export const admitToHospital = mutation({
  args: { lifePercent: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const existing = (await ctx.db.query("hospitalVisits").withIndex("by_user", (q) => q.eq("userId", userId)).collect()).find((v) => !v.paid);
    if (existing) return { alreadyAdmitted: true, visit: existing };
    const deficitPct = Math.max(0.05, 1 - Math.min(1, args.lifePercent / 100));
    const cond = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    const emergencyType = cond.severity === "critical" ? (deficitPct > 0.7 ? "medivac" : "helicopter") : cond.severity === "serious" ? "helicopter" : "ambulance";
    const transport = TRANSPORT[emergencyType];
    const invoice = Math.floor((cond.base + transport.cost) * (0.8 + Math.random() * 0.5));
    const visit: any = {
      userId, playerName: player.nickname ?? player.username ?? "Patient",
      condition: cond.name, conditionIcon: cond.icon, severity: cond.severity,
      emergencyType, admittedAt: Date.now(), invoice, paid: false,
    };
    const id = await ctx.db.insert("hospitalVisits", visit);
    return { admitted: true, visit: { _id: id, ...visit } };
  },
});

export const payInvoice = mutation({
  args: { visitId: v.optional(v.id("hospitalVisits")), paymentMethod: v.union(v.literal("cash"), v.literal("insurance")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    let visit: any = null;
    if (args.visitId) visit = await ctx.db.get(args.visitId);
    if (!visit) visit = (await ctx.db.query("hospitalVisits").withIndex("by_user", (q) => q.eq("userId", userId)).collect()).find((v) => !v.paid);
    if (!visit || visit.userId !== userId) throw new Error("No open invoice found");
    if (visit.paid) throw new Error("Invoice already paid");
    let cost = n(visit.invoice);
    if (args.paymentMethod === "insurance") {
      if (!player.insuranceActive) throw new Error("You don't have health insurance!");
      cost = Math.floor(cost * 0.15); // insurance covers 85%
    }
    if (n(player.money) < cost) throw new Error(`Invoice is $${cost.toLocaleString()} — you only have $${n(player.money).toLocaleString()}`);
    const healTo = Math.min(n(player.maxLife, 100), n(player.life) + Math.ceil(cost / 250));
    await ctx.db.patch(visit._id, { paid: true, dischargedAt: Date.now() });
    await ctx.db.patch(userId, { money: n(player.money) - cost, life: healTo });
    return { success: true, cost, healed: healTo - n(player.life) };
  },
});

// Quick walk-in treatment (the classic heal) — now with realistic triage
export const walkInTreatment = mutation({
  args: { tier: v.union(v.literal("triage"), v.literal("surgery"), v.literal("full_recovery")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player: any = await ctx.db.get(userId);
    if (!player) throw new Error("Not authenticated");
    const tiers: Record<string, { name: string; cost: number; healPct: number; icon: string }> = {
      triage: { name: "ER Triage & Stitches", cost: 5_000, healPct: 0.25, icon: "🩹" },
      surgery: { name: "Emergency Surgery", cost: 45_000, healPct: 0.6, icon: "🏥" },
      full_recovery: { name: "Full Recovery Program", cost: 150_000, healPct: 1, icon: "💉" },
    };
    const t = tiers[args.tier];
    if (!t) throw new Error("Unknown treatment");
    let cost = t.cost;
    if (player.insuranceActive) cost = Math.floor(cost * 0.15);
    if (n(player.money) < cost) throw new Error(`${t.name} costs $${cost.toLocaleString()} — not enough cash`);
    const deficit = n(player.maxLife, 100) - n(player.life);
    if (deficit <= 0) throw new Error("You are already at full health");
    const healed = Math.min(deficit, Math.ceil(deficit * t.healPct));
    await ctx.db.patch(userId, { money: n(player.money) - cost, life: n(player.life) + healed });
    await ctx.db.insert("hospitalVisits", {
      userId, playerName: player.nickname ?? player.username ?? "Patient",
      condition: t.name, conditionIcon: t.icon, severity: args.tier === "full_recovery" ? "serious" : "moderate",
      emergencyType: "walk_in", admittedAt: Date.now(), dischargedAt: Date.now(), invoice: cost, paid: true,
    });
    return { success: true, cost, healed };
  },
});

export const getHospitalStats = query({
  args: {},
  handler: async (ctx) => {
    const visits = await ctx.db.query("hospitalVisits").collect();
    const byType: Record<string, number> = { ambulance: 0, helicopter: 0, medivac: 0, walk_in: 0 };
    for (const v of visits) byType[v.emergencyType] = (byType[v.emergencyType] ?? 0) + 1;
    return { totalVisits: visits.length, byType, revenue: visits.reduce((s, v) => s + (v.paid ? n(v.invoice) : 0), 0) };
  },
});

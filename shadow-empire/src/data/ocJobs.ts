// Shared OC job board + specialist crew roles.
// Consumed by both the Convex backend (ocTeams.ts) and the client
// (OrganizedCrimeTeamsPage.tsx) so odds math and labels never drift apart.

export interface OcJobDef {
  id: string;
  icon: string;
  name: string;
  level: number;
  cost: number;
  min: number;
  max: number;
  base: number;
  /** Roles that synergize with this job — each matching pick boosts odds. */
  roles: string[];
}

export const OC_JOBS: OcJobDef[] = [
  { id: "job_grocery_heist", icon: "🛒", name: "Grocery Depot Heist", level: 5, cost: 3_000_000, min: 4_500_000, max: 6_500_000, base: 0.62, roles: ["muscle", "wheelman"] },
  { id: "job_armored_truck", icon: "🚛", name: "Armored Truck Ambush", level: 10, cost: 8_000_000, min: 12_000_000, max: 18_000_000, base: 0.55, roles: ["muscle", "wheelman", "hacker"] },
  { id: "job_casino_floor", icon: "🎰", name: "Casino Floor Sweep", level: 15, cost: 18_000_000, min: 26_000_000, max: 40_000_000, base: 0.5, roles: ["hacker", "con", "wheelman"] },
  { id: "job_port_raid", icon: "⚓", name: "Port Container Raid", level: 20, cost: 35_000_000, min: 52_000_000, max: 78_000_000, base: 0.45, roles: ["muscle", "smuggler", "wheelman"] },
  { id: "job_bank_branch", icon: "🏦", name: "Federal Bank Branch", level: 25, cost: 60_000_000, min: 90_000_000, max: 135_000_000, base: 0.42, roles: ["mastermind", "hacker", "muscle"] },
  { id: "job_art_vault", icon: "🖼️", name: "Art Vault Job", level: 30, cost: 95_000_000, min: 145_000_000, max: 220_000_000, base: 0.38, roles: ["mastermind", "ghost", "con"] },
  { id: "job_central_vault", icon: "💎", name: "Central Vault Cracking", level: 40, cost: 160_000_000, min: 250_000_000, max: 380_000_000, base: 0.34, roles: ["mastermind", "hacker", "ghost"] },
  { id: "job_empire_reserve", icon: "👑", name: "Empire Reserve Job", level: 55, cost: 280_000_000, min: 440_000_000, max: 680_000_000, base: 0.3, roles: ["mastermind", "hacker", "ghost"] },
];

export interface OcRoleDef {
  icon: string;
  name: string;
  blurb: string;
}

export const OC_ROLES: Record<string, OcRoleDef> = {
  mastermind: { icon: "🧠", name: "Mastermind", blurb: "Plans the job. Boosts odds most on vault-tier scores." },
  muscle: { icon: "💪", name: "Muscle", blurb: "Front-door heavy. Carries jobs with guards or rivals around." },
  hacker: { icon: "💻", name: "Hacker", blurb: "Kills the cameras, cracks the systems. Gold on anything electronic." },
  wheelman: { icon: "🏎️", name: "Wheelman", blurb: "Keeps the getaway clean. Best when the score is mobile." },
  ghost: { icon: "👻", name: "Ghost", blurb: "In and out unseen. Excels on infiltration scores." },
  con: { icon: "🎭", name: "Con Artist", blurb: "Talks the crew past security. Shines on public-facing scores." },
  smuggler: { icon: "📦", name: "Smuggler", blurb: "Moves contraband quietly. Master of ports and borders." },
};

export const OC_ROLE_SYNERGY = 0.045;
export const OC_ROLE_DUPE_PENALTY = 0.03;

/** Crew odds: base + muscle + role synergy − duplicate-role penalty. */
export function computeOcChance(
  team: { successBase?: number; jobId?: string; roles?: string[] },
  members: { level?: number }[],
): number {
  const avgLevel = members.reduce((s, m) => s + (m.level ?? 0), 0) / Math.max(1, members.length);
  let chance = (team.successBase ?? 0.5) + avgLevel * 0.0025 + members.length * 0.02;
  const favored = OC_JOBS.find((j) => j.id === team.jobId)?.roles ?? [];
  const roles = team.roles ?? [];
  chance += roles.filter((r) => favored.includes(r)).length * OC_ROLE_SYNERGY;
  const dupes = roles.length - new Set(roles).size;
  chance -= dupes * OC_ROLE_DUPE_PENALTY;
  return Math.max(0.05, Math.min(0.92, chance));
}

export const EXECUTE_PHASE_SECONDS = 20;

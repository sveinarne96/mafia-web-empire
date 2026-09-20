/* ══════════════════════════════════════════════════════════════
   INTELLIGENCE — "Your current advantage"
   The calculated bonus percentage increases by 1% every 5 levels,
   providing more XP and cash bonuses for ALL training — including
   team training, which offers superior percentage-based benefits.
   ══════════════════════════════════════════════════════════════ */

/** Intelligence bonus in percent: +1% per 5 levels (Lv.255 → +51%). */
export function intelligencePct(level: number): number {
  return Math.floor(Math.max(0, level) / 5);
}

/** Team training enjoys superior percentage-based benefits (2× the bonus). */
export const TEAM_TRAINING_MULTIPLIER = 2;

/**
 * Scale a base amount (XP or cash) by the intelligence bonus.
 * multiplier 1 = personal training, 2 = team training.
 */
export function applyIntelligence(base: number, level: number, multiplier = 1): number {
  const pct = intelligencePct(level) * multiplier;
  return Math.floor(base * (1 + pct / 100));
}

/** Cash wages paid out per training session, boosted by intelligence. */
export function trainingWage(level: number, multiplier = 1): number {
  const base = 250 * Math.max(1, level);
  return applyIntelligence(base, level, multiplier);
}

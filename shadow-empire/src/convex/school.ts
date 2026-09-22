import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ═══════════════════════════════════════════════════════════════════
// HIGH SCHOOL — learn the trade, graduate, unlock permanent bonuses.
//
// • Every lesson (60s cooldown) teaches a random subject and grants
//   School XP toward your next graduation.
// • Every graduation = permanent +2% Crime XP (stacks, cap +100%).
// • 30% of lessons surprise you with a bonus: sometimes permanent,
//   sometimes a timed buff (2x cash hour, reduced risk hour...).
// • Reaching new grades unlocks bigger bonus tables.
// ═══════════════════════════════════════════════════════════════════

const LESSON_COOLDOWN_MS = 60_000;
const XP_PER_GRADE = 500;
const MAX_GRADE = 50; // +100% crime XP at grade 50
const SURPRISE_CHANCE = 0.3;

export const SCHOOL_SUBJECTS = [
  { id: "getaway", name: "Getaway Driving", emoji: "🏎️", flavor: "Handbrake turns in the school parking lot." },
  { id: "lockpicking", name: "Advanced Lockpicking", emoji: "🔓", flavor: "Practice on the janitor's cabinet." },
  { id: "economics", name: "Street Economics", emoji: "📈", flavor: "How to flip a stolen bike for profit." },
  { id: "chem", name: "Backyard Chemistry", emoji: "🧪", flavor: "The periodic table, extended edition." },
  { id: "negotiation", name: "Tough Negotiation", emoji: "🤝", flavor: "Argue your way out of detention — and ransom deals." },
  { id: "history", name: "Crime History", emoji: "📜", flavor: "Learn from the legends who got caught." },
  { id: "gym", name: "Gym Class", emoji: "🏋️", flavor: "Rope climbing builds getaway shoulders." },
  { id: "alibi", name: "Alibi Building", emoji: "🎭", flavor: "Essay: where I definitely was last night." },
  { id: "hacking", name: "Intro to Cybercrime", emoji: "💻", flavor: "Changed your grade, could change yours too." },
  { id: "law", name: "Know The Law", emoji: "⚖️", flavor: "Loopholes are just doors with better locks." },
  { id: "firearms", name: "Firearm Safety", emoji: "🔫", flavor: "Safety first. Obviously." },
  { id: "surveillance", name: "Surveillance 101", emoji: "👁️", flavor: "Watching the watchers watch you." },
];

// Surprise bonuses. `schoolLevel` scales with your grade; `schoolBuffUntil`
// and `schoolBuffKind` are the timed ones. Permanent surprises go straight
// onto the player row so they survive every session.
const PERMANENT_SURPRISES = [
  { key: "schoolLevel", label: "🎓 Valedictorian — permanent +1% crime XP (grade up!)", apply: (p: any) => ({ schoolLevel: Math.min(MAX_GRADE, (p.schoolLevel ?? 0) + 1) }) },
  { key: "schoolCashFlat", label: "💵 Scholarship fund — permanent +$25,000 cash", apply: (p: any) => ({ money: (p.money ?? 0) + 25000 }) },
  { key: "schoolPointsFlat", label: "⭐ Dean's list — permanent +50 points", apply: (p: any) => ({ points: (p.points ?? 0) + 50 }) },
  { key: "schoolMaxLife", label: "❤️ Health class paid off — permanent +10 max life", apply: (p: any) => ({ maxLife: (p.maxLife ?? 100) + 10, life: (p.maxLife ?? 100) + 10 }) },
  { key: "schoolAttack", label: "🥊 Gym legend — permanent +2 attack", apply: (p: any) => ({ attack: (p.attack ?? 10) + 2 }) },
  { key: "schoolDefense", label: "🛡️ Hall monitor instinct — permanent +2 defense", apply: (p: any) => ({ defense: (p.defense ?? 10) + 2 }) },
  { key: "schoolStreak", label: "🔥 Perfect attendance — permanent streak point", apply: (p: any) => ({ schoolStreak: (p.schoolStreak ?? 0) + 1 }) },
];

const TIMED_SURPRISES: { kind: string; label: string; minutes: number }[] = [
  { kind: "double_cash", label: "💰 2x CASH for 1 hour!", minutes: 60 },
  { kind: "double_xp", label: "⚡ 2x Crime XP for 1 hour!", minutes: 60 },
  { kind: "halve_risk", label: "🛡️ Half arrest risk for 45 minutes!", minutes: 45 },
  { kind: "triple_points", label: "🎯 3x points for 30 minutes!", minutes: 30 },
];

function pickPermanent(p: any) {
  return PERMANENT_SURPRISES[Math.floor(Math.random() * PERMANENT_SURPRISES.length)];
}
function pickTimed() {
  return TIMED_SURPRISES[Math.floor(Math.random() * TIMED_SURPRISES.length)];
}

// ── Public: current school state for the UI ─────────────────────────
export const getSchool = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const p: any = await ctx.db.get(userId);
    if (!p) return null;
    const now = Date.now();
    const level = p.schoolLevel ?? 0;
    const xp = p.schoolXp ?? 0;
    return {
      level,
      xp,
      xpIntoGrade: xp % XP_PER_GRADE,
      xpForGrade: XP_PER_GRADE,
      streak: p.schoolStreak ?? 0,
      nextLessonAt: p.schoolLastLessonAt ? p.schoolLastLessonAt + LESSON_COOLDOWN_MS : 0,
      cooldownRemainingMs: Math.max(0, (p.schoolLastLessonAt ?? 0) + LESSON_COOLDOWN_MS - now),
      buff: p.schoolBuffUntil && p.schoolBuffUntil > now ? { kind: p.schoolBuffKind ?? "", until: p.schoolBuffUntil } : null,
      totalLessons: p.schoolLessonsTaken ?? 0,
      maxGrade: MAX_GRADE,
      crimeXpBonusPct: Math.min(100, level * 2),
      subjects: SCHOOL_SUBJECTS,
      recentLesson: p.schoolRecentLesson ?? null,
    };
  },
});

// ── Take a lesson ───────────────────────────────────────────────────
export const takeLesson = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const p: any = await ctx.db.get(userId);
    if (!p) throw new Error("Player not found");
    if (p.inPrison) throw new Error("You can't study in a cell — bribe a guard first!");
    if (p.isDead) throw new Error("Dead students learn nothing.");

    const now = Date.now();
    const ready = (p.schoolLastLessonAt ?? 0) + LESSON_COOLDOWN_MS;
    if (now < ready) {
      throw new Error(`Class is on break — next lesson in ${Math.ceil((ready - now) / 1000)}s`);
    }

    const subject = SCHOOL_SUBJECTS[Math.floor(Math.random() * SCHOOL_SUBJECTS.length)];
    const oldLevel = p.schoolLevel ?? 0;
    const oldXp = p.schoolXp ?? 0;
    const newXp = oldXp + 100;
    let newLevel = oldLevel;
    let graduated = false;
    let gradeLabel: string | null = null;

    if (newXp >= XP_PER_GRADE * (oldLevel + 1) && oldLevel < MAX_GRADE) {
      newLevel = Math.min(MAX_GRADE, Math.floor(newXp / XP_PER_GRADE));
      graduated = true;
      gradeLabel = ["Freshman", "Sophomore", "Junior", "Senior", "Valedictorian"][Math.min(4, Math.floor(newLevel / 10))];
    }

    const patch: any = {
      schoolXp: newXp,
      schoolLevel: newLevel,
      schoolLastLessonAt: now,
      schoolLessonsTaken: (p.schoolLessonsTaken ?? 0) + 1,
      schoolRecentLesson: {
        subjectId: subject.id,
        name: subject.name,
        emoji: subject.emoji,
        flavor: subject.flavor,
        at: now,
      },
    };

    // Surprise roll — 30% of lessons hide something extra.
    let surprise: { kind: "permanent" | "timed" | "graduation"; label: string } | null = null;
    if (graduated) {
      const bonusPct = newLevel * 2;
      surprise = { kind: "graduation", label: `🎓 GRADUATED to grade ${newLevel}! Permanent +${bonusPct}% crime XP${gradeLabel ? ` — ${gradeLabel}` : ""}` };
    } else if (Math.random() < SURPRISE_CHANCE) {
      if (Math.random() < 0.55) {
        const perm = pickPermanent(p);
        Object.assign(patch, perm.apply(p));
        surprise = { kind: "permanent", label: perm.label };
      } else {
        const timed = pickTimed();
        patch.schoolBuffKind = timed.kind;
        patch.schoolBuffUntil = now + timed.minutes * 60_000;
        surprise = { kind: "timed", label: timed.label };
      }
    }

    await ctx.db.patch(userId, patch);
    return {
      subject,
      schoolLevel: newLevel,
      graduated,
      crimeXpBonusPct: Math.min(100, newLevel * 2),
      surprise,
    };
  },
});

// ── Crime-payout helpers (imported by game.ts & friends) ────────────
export type SchoolBonus = {
  crimeXpMult: number;   // e.g. 1.24 = +24%
  cashMult: number;      // e.g. 2 = 2x cash
  pointsMult: number;
  riskFactor: number;    // multiplier applied to arrest-risk roll (0.5 = half)
};

export function getSchoolBonuses(player: any): SchoolBonus {
  const now = Date.now();
  const level = player?.schoolLevel ?? 0;
  const buffActive = player?.schoolBuffUntil && player.schoolBuffUntil > now;
  const kind = buffActive ? player.schoolBuffKind : "";
  return {
    crimeXpMult: 1 + Math.min(100, level * 2) / 100 + (kind === "double_xp" ? 1 : 0),
    cashMult: kind === "double_cash" ? 2 : 1,
    pointsMult: kind === "triple_points" ? 3 : 1,
    riskFactor: kind === "halve_risk" ? 0.5 : 1,
  };
}

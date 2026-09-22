import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { GraduationCap, Sparkles, Clock } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   HIGH SCHOOL — Overview panel (sits under Points in HQ).
   Lessons every 60s → School XP → graduations = permanent +2% crime XP.
   30% of lessons hide a surprise: permanent stat/cash/points gifts or
   timed 2x cash / 2x XP / 3x points / half-arrest-risk buffs.
   ═══════════════════════════════════════════════════════════════ */

const GRADE_TITLES = ["Freshman", "Sophomore", "Junior", "Senior", "Valedictorian"];

export function HighSchoolPanel() {
  const school = useQuery(api.school.getSchool);
  const takeLesson = useMutation(api.school.takeLesson);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (school === undefined) {
    return (
      <div className="mafia-card rounded-xl p-4 border border-violet-500/20 animate-pulse">
        <div className="text-sm font-bold text-violet-300">🏫 Loading High School…</div>
      </div>
    );
  }
  if (!school) return null;

  const cooldownLeft = Math.max(0, school.nextLessonAt - now);
  const ready = cooldownLeft <= 0;
  const gradePct = Math.min(100, (school.xpIntoGrade / school.xpForGrade) * 100);
  const gradeTitle = GRADE_TITLES[Math.min(4, Math.floor(school.level / 10))];

  const go = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await takeLesson({});
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? "Lesson failed");
    }
    setBusy(false);
  };

  const buffLabel: Record<string, string> = {
    double_cash: "💰 2x CASH",
    double_xp: "⚡ 2x Crime XP",
    halve_risk: "🛡️ Half arrest risk",
    triple_points: "🎯 3x points",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-slate-950/60 to-indigo-950/30 p-4 space-y-3">
      <div className="pointer-events-none absolute -right-8 -top-10 text-[120px] opacity-[0.05]">🎓</div>

      {/* Header */}
      <div className="relative flex items-center gap-3 flex-wrap">
        <div className="flex size-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10">
          <GraduationCap className="size-5 text-violet-300" />
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wide text-violet-200">🏫 High School</span>
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-violet-300">
              Grade {school.level} · {gradeTitle}
            </span>
          </div>
          <div className="text-[9px] text-violet-300/70">
            Permanent <span className="font-black text-emerald-300">+{school.crimeXpBonusPct}% Crime XP</span> ·
            surprise bonuses every class
          </div>
        </div>
        {school.streak > 0 && (
          <div className="text-right">
            <div className="text-lg font-black text-amber-300">🔥 {school.streak}</div>
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground">perfect days</div>
          </div>
        )}
      </div>

      {/* Grade progress */}
      <div className="relative space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-violet-300 font-bold">📚 School XP</span>
          <span className="text-muted-foreground">{school.xpIntoGrade} / {school.xpForGrade} to grade {Math.min(school.maxGrade, school.level + 1)}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-indigo-400 transition-all duration-500"
            style={{ width: `${gradePct}%` }}
          />
        </div>
        <div className="text-[9px] text-muted-foreground">{school.totalLessons} lessons attended</div>
      </div>

      {/* Active timed buff */}
      {school.buff && (
        <div className="relative flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <span className="text-xs font-black text-emerald-300 animate-pulse">
            ACTIVE: {buffLabel[school.buff.kind] ?? school.buff.kind}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-200/80">
            <Clock className="size-3" />
            {Math.max(0, Math.ceil((school.buff.until - now) / 60000))}m left
          </span>
        </div>
      )}

      {/* Take lesson */}
      <div className="relative flex items-center gap-2">
        <button
          onClick={go}
          disabled={busy || !ready}
          className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40"
        >
          {busy ? "In class…" : ready ? "🎓 Attend class (60s)" : `⏱️ Next class in ${Math.ceil(cooldownLeft / 1000)}s`}
        </button>
        <Sparkles className="size-4 shrink-0 text-violet-400/50" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300">
          {error}
        </div>
      )}

      {/* Lesson result / surprise reveal */}
      {result && (
        <div className="relative space-y-2 rounded-lg border border-violet-500/30 bg-slate-900/70 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-200">
            <span className="text-lg">{result.subject.emoji}</span>
            <span>{result.subject.name}</span>
            <span className="text-[9px] font-normal italic text-muted-foreground">“{result.subject.flavor}”</span>
          </div>
          {result.graduated ? (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-300">
              🎓 GRADUATED! Grade {result.schoolLevel} — permanent +{result.crimeXpBonusPct}% crime XP
            </div>
          ) : result.surprise ? (
            <div className={`rounded-md px-3 py-2 text-xs font-black ${
              result.surprise.kind === "timed"
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border border-gold-500/40 bg-amber-500/10 text-amber-300"
            }`}>
              🎁 SURPRISE! {result.surprise.label}
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground">No surprise this time — +100 school XP earned.</div>
          )}
        </div>
      )}

      {/* Bonus cheat-sheet */}
      <div className="relative grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground md:grid-cols-4">
        <div className="rounded-md bg-slate-900/50 px-2 py-1">📈 Every grade: <span className="font-bold text-violet-300">+2% Crime XP</span></div>
        <div className="rounded-md bg-slate-900/50 px-2 py-1">🎁 Surprise chance: <span className="font-bold text-emerald-300">30%</span></div>
        <div className="rounded-md bg-slate-900/50 px-2 py-1">💰 Timed: <span className="font-bold text-amber-300">2x cash</span></div>
        <div className="rounded-md bg-slate-900/50 px-2 py-1">🛡️ Timed: <span className="font-bold text-sky-300">half risk</span></div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

type CrimeOperationsDeckProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

type Operation = {
  icon: string;
  label: string;
  page: string;
  description: string;
  cooldown: number;
  tone: string;
};

const OPERATIONS: Operation[] = [
  { icon: "🔪", label: "Street", page: "crime_street", description: "Fast cash · low profile", cooldown: 45, tone: "emerald" },
  { icon: "💰", label: "Robbery", page: "crime_robbery", description: "High payout · raises heat", cooldown: 120, tone: "red" },
  { icon: "🃏", label: "Fraud", page: "crime_fraud", description: "Work the mark · watch the trail", cooldown: 180, tone: "amber" },
  { icon: "🏠", label: "Burglary", page: "crime_burglary", description: "Quiet entry · careful exit", cooldown: 240, tone: "orange" },
  { icon: "💊", label: "Drugs", page: "crime_drugs", description: "Move product · manage risk", cooldown: 300, tone: "purple" },
  { icon: "🕵️", label: "Organized", page: "crime_organized", description: "Crew pressure · serious return", cooldown: 600, tone: "blue" },
  { icon: "🕳️", label: "Underground", page: "crime_underground", description: "Off-grid work · long setup", cooldown: 900, tone: "slate" },
  { icon: "🚗", label: "GTA", page: "car_theft", description: "Take a vehicle · garage delivery", cooldown: 180, tone: "red" },
  { icon: "🏠", label: "Burglarize", page: "steal_house", description: "Case the property · lift the loot", cooldown: 240, tone: "rose" },
  { icon: "🕵️", label: "Org Crime", page: "organized_crime", description: "Coordinate the crew · split the take", cooldown: 900, tone: "violet" },
  { icon: "💀", label: "Murder", page: "murder", description: "Lethal contract · extreme exposure", cooldown: 1800, tone: "red" },
  { icon: "💰", label: "Heist", page: "heist", description: "Build the plan · chase the big score", cooldown: 3600, tone: "amber" },
];

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "READY";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes ? `${minutes}m ${String(remaining).padStart(2, "0")}s` : `${remaining}s`;
};

export function CrimeOperationsDeck({ activePage, onNavigate }: CrimeOperationsDeckProps) {
  const [now, setNow] = useState(() => Date.now());
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = useMemo(() => {
    return Object.fromEntries(
      OPERATIONS.map((operation) => [operation.page, Math.max(0, Math.ceil(((cooldowns[operation.page] ?? 0) - now) / 1000))]),
    ) as Record<string, number>;
  }, [cooldowns, now]);

  const handleNavigate = (operation: Operation) => {
    onNavigate(operation.page);
    setCooldowns((current) => ({
      ...current,
      [operation.page]: Math.max(current[operation.page] ?? 0, Date.now() + operation.cooldown * 1000),
    }));
  };

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-amber-500/20 bg-[linear-gradient(135deg,rgba(15,10,7,.96),rgba(28,15,9,.92),rgba(8,10,14,.98))] shadow-[0_18px_55px_rgba(0,0,0,.28)]" aria-label="Crime operations">
      <div className="border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-lg">◈</span>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">Operations control</h2>
            <p className="text-[9px] text-slate-500">Choose a route. Every move has a realistic recovery window.</p>
          </div>
          <span className="ml-auto hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-300 sm:block">Live city network</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {OPERATIONS.map((operation) => {
          const seconds = remaining[operation.page] ?? 0;
          const isActive = activePage === operation.page;
          const progress = seconds > 0 ? Math.max(0, Math.min(100, (seconds / operation.cooldown) * 100)) : 0;
          return (
            <button
              key={operation.page}
              type="button"
              onClick={() => handleNavigate(operation)}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:brightness-125 ${isActive ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_22px_rgba(245,158,11,.12)]" : "border-white/10 bg-black/20 hover:border-white/25"}`}
              aria-label={`${operation.label}: ${operation.description}. ${seconds > 0 ? `Cooldown ${formatTime(seconds)}` : "Ready"}`}
            >
              <div className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-${operation.tone}-400/70 transition-transform duration-300`} style={{ transform: `scaleX(${progress / 100})` }} />
              <div className="flex items-start justify-between gap-2">
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">{operation.icon}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-wide ${seconds > 0 ? "bg-orange-400/10 text-orange-300" : "bg-emerald-400/10 text-emerald-300"}`}>
                  {seconds > 0 ? `⏱ ${formatTime(seconds)}` : "✓ READY"}
                </span>
              </div>
              <div className="mt-2 text-[11px] font-black text-slate-100">{operation.label}</div>
              <div className="mt-0.5 min-h-7 text-[9px] leading-3 text-slate-500">{operation.description}</div>
              <div className="mt-2 flex items-center justify-between text-[8px] uppercase tracking-wider text-slate-600">
                <span>{seconds > 0 ? "Recovering" : "Available"}</span>
                <span>{Math.floor(operation.cooldown / 60)}m cycle</span>
              </div>
              {seconds > 0 && <div className="pointer-events-none absolute inset-0 animate-pulse bg-orange-400/[0.02]" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

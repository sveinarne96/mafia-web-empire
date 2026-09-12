import { Fragment } from "react";

type CrimeNavItem = {
  icon: string;
  label: string;
  page: string;
  sub: string;
  count?: number;
};

type CrimeNavGroup = {
  label: string;
  accent: string;
  items: CrimeNavItem[];
};

const CRIME_NAV_GROUPS: CrimeNavGroup[] = [
  {
    label: "Command",
    accent: "217,119,6",
    items: [{ icon: "🏠", label: "HQ", page: "headquarters", sub: "Your base" }],
  },
  {
    label: "Street work",
    accent: "34,197,94",
    items: [
      { icon: "🔪", label: "Street", page: "crime_street", count: 20, sub: "Quick hits" },
      { icon: "💰", label: "Robbery", page: "crime_robbery", count: 30, sub: "High stakes" },
      { icon: "🃏", label: "Fraud", page: "crime_fraud", count: 14, sub: "Play the mark" },
      { icon: "🏠", label: "Burglary", page: "crime_burglary", count: 8, sub: "Silent entry" },
      { icon: "💊", label: "Drugs", page: "crime_drugs", count: 12, sub: "Move product" },
      { icon: "🕵️", label: "Organized", page: "crime_organized", count: 20, sub: "Build a crew" },
      { icon: "🕳️", label: "Underground", page: "crime_underground", count: 24, sub: "Off the grid" },
    ],
  },
  {
    label: "Major operations",
    accent: "220,38,38",
    items: [
      { icon: "🚗", label: "GTA", page: "car_theft", sub: "Take the wheel" },
      { icon: "🏠", label: "Burglarize", page: "steal_house", sub: "Case a house" },
      { icon: "🕵️", label: "Org Crime", page: "organized_crime", sub: "Crew heists" },
      { icon: "💀", label: "Murder", page: "murder", sub: "Make a mark" },
      { icon: "💰", label: "Heist", page: "heist", sub: "Big score" },
    ],
  },
];

export function CrimeOperationsDeck({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  return (
    <div className="relative border-t border-white/[0.04] bg-black/20 px-2 pb-2 pt-2 sm:px-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className="flex size-6 items-center justify-center rounded-md border border-red-400/30 bg-red-500/10 text-xs shadow-[0_0_16px_rgba(239,68,68,0.12)]">🔪</div>
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-red-300/90">Operations deck</div>
          <div className="truncate text-[10px] text-slate-500">Choose your angle. Own the night.</div>
        </div>
        <div className="ml-auto hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-600 sm:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live city routes
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CRIME_NAV_GROUPS.map((group) => (
          <div key={group.label} className="shrink-0 rounded-xl border border-white/[0.06] bg-slate-950/55 p-1.5 shadow-inner shadow-black/30">
            <div className="flex items-center gap-1.5 px-1.5 pb-1.5">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: `rgb(${group.accent})`, boxShadow: `0 0 8px rgba(${group.accent},0.8)` }} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{group.label}</span>
            </div>
            <div className="flex gap-1">
              {group.items.map((tab) => {
                const isActive = activePage === tab.page;
                return (
                  <Fragment key={tab.page}>
                    <button
                      onClick={() => onNavigate(tab.page)}
                      aria-current={isActive ? "page" : undefined}
                      title={`${tab.label} · ${tab.sub}`}
                      className={`group relative min-w-[68px] rounded-lg border px-2 py-2 text-left transition-all duration-200 sm:min-w-[78px] ${isActive ? "-translate-y-0.5 text-white shadow-lg" : "border-transparent text-slate-500 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"}`}
                      style={isActive ? { borderColor: `rgba(${group.accent},0.65)`, background: `linear-gradient(145deg, rgba(${group.accent},0.24), rgba(${group.accent},0.06))`, boxShadow: `0 8px 24px rgba(${group.accent},0.12), inset 0 1px 0 rgba(255,255,255,0.08)` } : undefined}
                    >
                      {isActive && <span className="absolute inset-x-2 -top-px h-px rounded-full" style={{ background: `rgb(${group.accent})`, boxShadow: `0 0 10px rgba(${group.accent},0.9)` }} />}
                      <span className="flex items-center justify-between gap-1">
                        <span className={`text-lg leading-none transition-transform duration-200 ${isActive ? "scale-110" : "grayscale-[0.35] group-hover:scale-105 group-hover:grayscale-0"}`}>{tab.icon}</span>
                        {tab.count !== undefined && <span className="rounded-full bg-black/30 px-1 py-0.5 text-[8px] font-black tabular-nums text-slate-400">{tab.count}</span>}
                      </span>
                      <span className="mt-1 block truncate text-[9px] font-black tracking-tight">{tab.label}</span>
                      <span className="mt-0.5 block truncate text-[8px] text-slate-600 transition-colors group-hover:text-slate-500">{tab.sub}</span>
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

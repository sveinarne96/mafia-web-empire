import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarItem = { label: string; page: string; icon: string };
export type SidebarSectionDef = { title: string; icon: LucideIcon; items: SidebarItem[] };

// Per-section accent (rgb triplet) — gives every group its own identity color.
const ACCENTS: Record<string, string> = {
  Overview: "251, 191, 36",      // amber
  Daily: "52, 211, 153",         // emerald
  Crime: "248, 113, 113",        // red
  Murder: "239, 68, 68",         // dark red
  Combat: "244, 114, 182",       // pink
  "Casino & Betting": "250, 204, 21", // yellow
  "Markets & Stores": "96, 165, 250", // blue
  "Assets & Property": "251, 146, 60", // orange
  "Money & Law": "110, 231, 183",      // mint
  Crew: "134, 239, 172",         // light green
  Progression: "196, 181, 253",  // violet
  World: "125, 211, 252",        // sky
  Underworld: "167, 139, 250",   // purple
  Special: "252, 211, 77",       // gold
  "My Profile": "214, 211, 209", // silver
  Firearms: "251, 146, 60",
  Communication: "96, 165, 250",
  Chat: "52, 211, 153",
  Forums: "196, 181, 253",
  "Game Records": "250, 204, 21",
  "Quick Info": "125, 211, 252",
  "Live Events": "251, 113, 133",
  "Help & Support": "110, 231, 183",
  System: "148, 163, 184",
};

export function SidebarSection({
  section,
  expanded,
  onToggle,
  activePage,
  onNavigate,
}: {
  section: SidebarSectionDef;
  expanded: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (p: string) => void;
}) {
  const accent = ACCENTS[section.title] ?? "251, 191, 36";
  const Icon = section.icon;
  const activeItem = section.items.find((i) => i.page === activePage);
  const dimmed = !expanded && !!activeItem; // collapsed but contains active page

  return (
    <div className="sb-section">
      <button
        onClick={onToggle}
        className={`group relative w-full flex items-center gap-2.5 px-3 py-2 transition-all duration-200 ${
          expanded ? "text-slate-200" : dimmed ? "text-amber-300" : "text-slate-400 hover:text-amber-200"
        }`}
      >
        {/* accent edge */}
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full transition-all duration-300"
          style={{
            background: `rgb(${accent})`,
            opacity: expanded ? 0.9 : dimmed ? 0.9 : 0,
            boxShadow: expanded || dimmed ? `0 0 8px rgba(${accent},0.55)` : "none",
          }}
        />
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md border transition-all duration-300 group-hover:scale-110"
          style={{
            borderColor: `rgba(${accent}, ${expanded ? 0.5 : 0.25})`,
            background: `rgba(${accent}, ${expanded ? 0.14 : 0.07})`,
            boxShadow: expanded ? `0 0 12px rgba(${accent},0.25)` : "none",
          }}
        >
          <Icon className="size-3.5" style={{ color: `rgb(${accent})` }} />
        </span>
        <span className="flex-1 text-left text-[10.5px] font-black uppercase tracking-[0.14em] truncate">
          {section.title}
        </span>
        <span
          className="px-1.5 py-px rounded-full text-[8px] font-black tabular-nums"
          style={{ background: `rgba(${accent},0.12)`, color: `rgba(${accent},0.85)` }}
        >
          {section.items.length}
        </span>
        <ChevronDown
          className={`size-3 shrink-0 transition-transform duration-300 ${expanded ? "" : "-rotate-90"}`}
          style={{ color: `rgba(${accent},0.7)` }}
        />
      </button>

      {/* items — grid-rows animation keeps it smooth without JS measurement */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-1.5 pl-3 pr-2 pt-0.5 space-y-0.5">
            {section.items.map((item) => {
              const active = activePage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`sb-item group/item relative w-full flex items-center gap-2 rounded-lg px-2 py-[5px] text-[11px] transition-all duration-200 ${
                    active
                      ? "font-black text-amber-200"
                      : "font-bold text-slate-400 hover:text-slate-100 hover:translate-x-0.5"
                  }`}
                  style={
                    active
                      ? {
                          background: "linear-gradient(90deg, rgba(251,191,36,0.16), rgba(251,191,36,0.04))",
                          boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.25), 0 0 14px rgba(251,191,36,0.10)",
                        }
                      : undefined
                  }
                >
                  {/* active left pip */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[2.5px] rounded-full transition-all duration-200"
                    style={{
                      background: "rgb(251,191,36)",
                      boxShadow: "0 0 6px rgba(251,191,36,0.8)",
                      opacity: active ? 1 : 0,
                    }}
                  />
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] transition-transform duration-200 group-hover/item:scale-110 ${
                      active ? "bg-amber-400/20" : "bg-slate-800/60 group-hover/item:bg-slate-700/50"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span className="ml-auto size-1.5 shrink-0 rounded-full bg-amber-300 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

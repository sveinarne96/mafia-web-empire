import { useState, useEffect } from "react";
import { ALL_GAME_EVENTS, EVENT_CATEGORIES, getActiveEvents, formatTimeLeft } from "../data/events";

export function EventsPage() {
  const [activeEvents, setActiveEvents] = useState<{ eventId: string; endTime: number }[]>(getActiveEvents);
  const [filter, setFilter] = useState("all");
  const [, forceTick] = useState(0);

  // Live sync + countdown tick
  useEffect(() => {
    const sync = () => setActiveEvents(getActiveEvents());
    window.addEventListener("eventsChanged", sync);
    const tick = setInterval(() => { sync(); forceTick(t => t + 1); }, 5000);
    return () => { window.removeEventListener("eventsChanged", sync); clearInterval(tick); };
  }, []);

  const activeMap = new Map(activeEvents.map(e => [e.eventId, e.endTime]));
  const filtered = filter === "all"
    ? ALL_GAME_EVENTS
    : ALL_GAME_EVENTS.filter(e => e.category === filter);

  const activeList = ALL_GAME_EVENTS.filter(e => activeMap.has(e.id));

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="mafia-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center text-[140px]">🎪</div>
        <div className="relative">
          <h1 className="text-2xl font-black gold-shimmer-text tracking-wide">🎪 LIVE EVENTS</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {activeList.length} event{activeList.length === 1 ? "" : "s"} running right now · {ALL_GAME_EVENTS.length} total in rotation
          </p>
        </div>
      </div>

      {/* Active Events — big cards */}
      {activeList.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">🟢 Active Now</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeList.map(evt => {
              const end = activeMap.get(evt.id)!;
              return (
                <div key={evt.id} className="mafia-card rounded-xl p-4 relative overflow-hidden animate-glow-pulse"
                  style={{ borderColor: `${evt.color}55` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl shrink-0" style={{ animation: "event-pulse 1.5s ease-in-out infinite" }}>{evt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm truncate" style={{ color: evt.color }}>{evt.name}</div>
                      <div className="text-[11px] text-muted-foreground">{evt.desc}</div>
                      <div className="text-[11px] font-bold mt-0.5" style={{ color: evt.color }}>⚡ {evt.boost}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9px] uppercase tracking-wider text-green-400 font-bold">Ends in</div>
                      <div className="text-sm font-black text-green-400">{formatTimeLeft(end)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mafia-card rounded-xl p-8 text-center space-y-2">
          <div className="text-4xl opacity-40">😴</div>
          <div className="text-sm font-bold text-muted-foreground">No events are live right now</div>
          <div className="text-xs text-muted-foreground/60">Check back soon — admins launch events regularly!</div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {EVENT_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              filter === cat.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground border border-border/50"
            }`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* All events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map(evt => {
          const active = activeMap.has(evt.id);
          return (
            <div key={evt.id}
              className={`mafia-card rounded-xl p-3 transition-all ${active ? "" : "opacity-60 hover:opacity-100"}`}
              style={active ? { borderColor: `${evt.color}66`, boxShadow: `0 0 12px ${evt.color}22` } : undefined}>
              <div className="flex items-start gap-2.5">
                <span className={`text-2xl shrink-0 ${active ? "" : "grayscale"}`}>{evt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate" style={{ color: active ? evt.color : undefined }}>{evt.name}</span>
                    {active && (
                      <span className="text-[8px] font-black bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full shrink-0">LIVE</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-snug">{evt.desc}</div>
                  <div className="text-[10px] font-bold mt-0.5" style={{ color: active ? evt.color : "#a16207" }}>{evt.boost}</div>
                  <div className="text-[9px] mt-1 font-bold">
                    {active ? (
                      <span className="text-green-400">⏱️ {formatTimeLeft(activeMap.get(evt.id)!)}</span>
                    ) : (
                      <span className="text-muted-foreground/50">⚪ Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes event-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>
    </div>
  );
}

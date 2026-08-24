import { useState, useEffect } from "react";
import { ALL_GAME_EVENTS, EVENT_CATEGORIES, formatTimeLeft, type GameEvent } from "../data/events";

interface EventDuration {
  eventId: string;
  endTime: number;
  durationMs: number;
}

export function EventsManager({ onClose }: { onClose: () => void }) {
  const [activeEvents, setActiveEvents] = useState<EventDuration[]>(() => {
    try { return JSON.parse(localStorage.getItem("activeEvents") || "[]"); } catch { return []; }
  });
  const [filter, setFilter] = useState("all");
  const [popup, setPopup] = useState<GameEvent | null>(null);
  const [customMinutes, setCustomMinutes] = useState(60);

  useEffect(() => {
    localStorage.setItem("activeEvents", JSON.stringify(activeEvents));
    const ids = activeEvents.filter(e => Date.now() < e.endTime).map(e => e.eventId);
    localStorage.setItem("activeEventIds", JSON.stringify(ids));
    window.dispatchEvent(new Event("eventsChanged"));
  }, [activeEvents]);

  // Clean expired events every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvents(prev => prev.filter(e => Date.now() < e.endTime));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "all" ? ALL_GAME_EVENTS : ALL_GAME_EVENTS.filter(e => e.category === filter);

  const activateEvent = (evt: GameEvent, minutes: number) => {
    const durationMs = minutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    setActiveEvents(prev => {
      const without = prev.filter(e => e.eventId !== evt.id);
      return [...without, { eventId: evt.id, endTime, durationMs }];
    });
    setPopup(null);
  };

  const stopEvent = (id: string) => {
    setActiveEvents(prev => prev.filter(e => e.eventId !== id));
  };

  const activateAll = () => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    setActiveEvents(ALL_GAME_EVENTS.map(e => ({ eventId: e.id, endTime: now + hour, durationMs: hour })));
  };

  const deactivateAll = () => {
    setActiveEvents([]);
    localStorage.removeItem("activeEventIds");
  };

  const isActive = (id: string) => activeEvents.find(e => e.eventId === id && Date.now() < e.endTime);

  const durations = [
    { label: "5 min", value: 5 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "6 hours", value: 360 },
    { label: "12 hours", value: 720 },
    { label: "24 hours", value: 1440 },
    { label: "3 days", value: 4320 },
    { label: "7 days", value: 10080 },
    { label: "30 days", value: 43200 },
  ];

  return (
    <div className="space-y-4">
      {/* Duration Popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="mafia-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl block mb-2">{popup.icon}</span>
              <h3 className="text-lg font-bold">{popup.name}</h3>
              <p className="text-xs text-muted-foreground">{popup.desc}</p>
              <p className="text-xs text-primary font-bold mt-1">{popup.boost}</p>
            </div>
            <div className="text-sm font-bold text-center">Set Duration</div>
            <div className="grid grid-cols-3 gap-2">
              {durations.map(d => (
                <button key={d.value} onClick={() => activateEvent(popup, d.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all border ${
                    customMinutes === d.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/5 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Custom (minutes)</label>
              <div className="flex gap-2">
                <input type="number" value={customMinutes} onChange={e => setCustomMinutes(Number(e.target.value) || 1)}
                  min={1} max={43200}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                <button onClick={() => activateEvent(popup, customMinutes)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                  Activate
                </button>
              </div>
            </div>
            <button onClick={() => setPopup(null)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <h2 className="text-xl font-bold">🎪 Event Manager</h2>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">{activeEvents.length} Active</span>
        </div>
        <div className="flex gap-2">
          <button onClick={activateAll} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Activate All (1h)</button>
          <button onClick={deactivateAll} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Stop All</button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {EVENT_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === cat.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
        {filtered.map(evt => {
          const active = isActive(evt.id);
          return (
            <div key={evt.id} className={`mafia-card rounded-xl p-3 flex items-center gap-3 transition-all ${active ? "border-green-500/30 bg-green-500/5" : ""}`}>
              <span className="text-2xl">{evt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{evt.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{evt.desc}</div>
                <div className="text-[10px] font-bold" style={{ color: evt.color }}>{evt.boost}</div>
                {active && (
                  <div className="text-[10px] text-green-400 font-bold mt-0.5">
                    ⏱️ {formatTimeLeft(active.endTime)}
                  </div>
                )}
              </div>
              <button onClick={() => active ? stopEvent(evt.id) : setPopup(evt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${active ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
                {active ? "Stop" : "Activate"}
              </button>
            </div>
          );
        })}
      </div>

      {activeEvents.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-bold text-muted-foreground mb-2">🟢 Currently Active ({activeEvents.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {activeEvents.filter(e => Date.now() < e.endTime).map(evt => {
              const evtData = ALL_GAME_EVENTS.find(e => e.id === evt.eventId);
              return evtData ? (
                <span key={evt.eventId} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400">
                  {evtData.icon} {evtData.name} <span className="opacity-60">({formatTimeLeft(evt.endTime)})</span>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

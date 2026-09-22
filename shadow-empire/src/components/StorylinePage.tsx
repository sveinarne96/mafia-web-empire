import { useState } from "react";
import { Target, ChevronRight } from "lucide-react";

const storylines = [
  { id: "rise", name: "Rise to Power", desc: "From street rat to boss", icon: "👑", chapters: 10, reward: "$10M + Title" },
  { id: "heist", name: "The Big Heist", desc: "Plan and execute the ultimate bank robbery", icon: "🏦", chapters: 8, reward: "$50M" },
  { id: "betrayal", name: "Blood & Betrayal", desc: "Navigate family politics and treachery", icon: "🗡️", chapters: 12, reward: "Legendary Title" },
  { id: "underworld", name: "Underworld King", desc: "Build a criminal empire from scratch", icon: "🌍", chapters: 15, reward: "Unique Abilities" },
];

export function StorylinePage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Target className="size-7 text-primary" /><h2 className="text-2xl font-bold">Storyline Missions</h2></div>
      <div className="space-y-2">
        {storylines.map(s => (
          <div key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)}
            className="mafia-card rounded-xl p-4 cursor-pointer hover:border-primary/30 transition">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.icon}</span>
              <div className="flex-1"><div className="font-bold">{s.name}</div><div className="text-xs text-muted-foreground">{s.desc}</div></div>
              <ChevronRight className={`size-4 text-muted-foreground transition-transform ${selected === s.id ? "rotate-90" : ""}`} />
            </div>
            {selected === s.id && (
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                <div>📖 {s.chapters} chapters</div>
                <div>🎁 Reward: {s.reward}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

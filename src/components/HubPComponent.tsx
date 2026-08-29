import { useState } from "react";

function HubP({ title, icon, tabs }: { title: string; icon: string; tabs: { id: string; l: string; ic: string; d: string }[] }) {
  const [tab, setTab] = useState(tabs[0]?.id || "");
  const [msg, setMsg] = useState("");
  const t = tabs.find(x => x.id === tab);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-black text-amber-400">{title}</h2>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(x => (
          <button key={x.id} onClick={() => { setTab(x.id); setMsg(""); }}
            className={"px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 " + (tab === x.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
            <span className="mr-1">{x.ic}</span>{x.l}
          </button>
        ))}
      </div>
      {msg && <div className="px-4 py-2 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-bold animate-fade-in">✅ {msg}</div>}
      {t && (
        <div className="mafia-card rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{t.ic}</span>
            <div>
              <div className="text-lg font-black text-slate-200">{t.l}</div>
              <div className="text-xs text-slate-400">{t.d}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-[10px] text-slate-400">Status</div><div className="text-xs font-bold text-green-400">Active</div></div>
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-[10px] text-slate-400">Level</div><div className="text-xs font-bold text-amber-400">Lv.1</div></div>
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-[10px] text-slate-400">Bonus</div><div className="text-xs font-bold text-purple-400">+10%</div></div>
          </div>
          <button onClick={() => setMsg(t.l + " feature activated!")} className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-sm font-black hover:from-amber-500 hover:to-amber-600 active:scale-95 transition-all shadow-lg">
            🔥 Activate {t.l}
          </button>
        </div>
      )}
    </div>
  );
}
export { HubP };

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Crown, Swords, Users, Wifi, Search, Send, Eye } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

function Banner({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`rounded-xl border p-3 text-center text-xs font-bold animate-fade-in ${ok ? "border-green-500/30 bg-green-950/30 text-green-400" : "border-red-500/30 bg-red-950/30 text-red-400"}`}>
      {text}
    </div>
  );
}

/* ═══════════════ RANK TRIALS — never seen before rank-up ═══════════════ */

const TRIAL_TYPES = [
  { id: "crime", label: "🔪 Crime Spree", desc: "Commit street crimes" },
  { id: "kill", label: "💀 Assassination", desc: "Take out a target" },
  { id: "gta", label: "🚗 Grand Theft", desc: "Steal a vehicle" },
  { id: "heist", label: "💰 Bank Heist", desc: "Crack a vault" },
  { id: "hack", label: "🏦 Bank Hack", desc: "Breach a player's account" },
  { id: "fight", label: "⚔️ Street Fight", desc: "Win a duel" },
];

export function RankTrialsPage() {
  const player = useQuery(api.game.getPlayer);
  const trials = useQuery(api.empireFeatures.getRankTrials);
  const advance = useMutation(api.empireFeatures.advanceRankTrial);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const doTrial = async (type: string) => {
    setBusy(type); setMsg(null);
    try {
      const r = await advance({ trialType: type });
      setMsg({ ok: r.success, text: r.text });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    }
    setBusy(null);
  };

  if (!player || !trials) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Reading the ancient laws…</div>;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Crown className="size-7 text-amber-400" />
        <h2 className="text-2xl font-black text-amber-300">Rank Trials</h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400">ASCENSION PATH</span>
        <span className="ml-auto text-[10px] font-bold text-slate-500">Lv.{trials.level} · {trials.completedCount} trials complete</span>
      </div>

      <div className="mafia-card rounded-xl p-4 border-amber-500/20">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">How it works</div>
        <div className="text-[11px] text-slate-400 leading-relaxed">
          Ranks are no longer just XP. Every 10-15 levels unlocks a <b className="text-amber-300">Trial</b> —
          complete enough <b className="text-amber-300">Trials actions</b> (any mix below) to prove yourself and earn the next rank title permanently.
          Complete a full trial: <b className="text-green-400">+500 points, +2,500 XP</b>.
        </div>
      </div>

      {msg && <Banner ok={msg.ok} text={msg.text} />}

      {/* Trial ladder */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {trials.trials.map((t: any) => {
          const pct = Math.min(100, (t.progress / t.trials) * 100);
          return (
            <div key={t.id} className={`mafia-card rounded-xl p-4 space-y-2 ${t.completed ? "border-green-500/40 bg-green-950/10" : "border-amber-500/20"}`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black">{t.name}</div>
                  <div className="text-[9px] text-slate-500">{t.desc} · needs Lv.{t.needLevel}</div>
                </div>
                {t.completed && <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[8px] font-black text-green-400">DONE</span>}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Progress</span>
                <span className="font-black text-amber-300">{t.progress}/{t.trials}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full transition-all duration-500 ${t.completed ? "bg-green-500" : "bg-gradient-to-r from-amber-600 to-amber-400"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Trial actions */}
      <div className="mafia-card rounded-xl p-4">
        <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">Perform Trial Actions</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TRIAL_TYPES.map((t) => (
            <button key={t.id} onClick={() => doTrial(t.id)} disabled={busy === t.id}
              className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 text-left transition hover:border-amber-500/40 hover:bg-amber-950/20 disabled:opacity-50">
              <div className="text-xs font-black">{t.label}</div>
              <div className="text-[9px] text-slate-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ BANK HACK — never seen before ═══════════════ */

const HACK_TOOLS = [
  { id: "standard", name: "Standard Exploit", icon: "💾", bonus: 0, cost: 0, desc: "Your bread-and-butter breach kit." },
  { id: "ghost", name: "Ghost Protocol", icon: "👻", bonus: 0.10, cost: 25000, desc: "+10% success. Leaves fewer traces." },
  { id: "quantum", name: "Quantum Decryption", icon: "⚛️", bonus: 0.15, cost: 75000, desc: "+15% success. Cutting edge." },
];

export function BankHackPage() {
  const player = useQuery(api.game.getPlayer);
  const targets = useQuery(api.empireFeatures.getHackTargets);
  const hack = useMutation(api.empireFeatures.hackPlayerBank);
  const advance = useMutation(api.empireFeatures.advanceRankTrial);

  const [targetId, setTargetId] = useState<string | null>(null);
  const [tool, setTool] = useState("standard");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [stage, setStage] = useState("");

  if (!player || !targets) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Booting the terminal…</div>;

  const filtered = targets.filter((t: any) => t.nickname?.toLowerCase().includes(search.toLowerCase()));
  const target = targets.find((t: any) => t._id === targetId);
  const toolDef = HACK_TOOLS.find((t) => t.id === tool)!;

  const doHack = async () => {
    if (!target || busy) return;
    setBusy(true); setResult(null);
    try {
      const stages = ["🔍 Scanning ports…", "🔑 Bypassing firewall…", "💥 Injecting payload…", "🏦 Draining vault…"];
      for (const s of stages) { setStage(s); await new Promise((r) => setTimeout(r, 350)); }
      setStage("");
      const r = await hack({ targetId: target._id as any, tool });
      setResult({ ok: r.success, text: r.message });
      if (r.success) advance({ trialType: "hack" }).catch(() => {});
    } catch (e: any) {
      setStage("");
      setResult({ ok: false, text: e.message || "Hack failed" });
    }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl">🏦</span>
        <h2 className="text-2xl font-black text-cyan-300">Bank Hack</h2>
        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black text-cyan-400">CYBER CRIME</span>
      </div>

      {/* Terminal */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-black p-6 font-mono min-h-[180px]">
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 40%, #06b6d4 0%, transparent 60%)" }} />
        <div className="relative z-10 space-y-1 text-[11px]">
          <div className="text-cyan-500">root@shadowempire:~$ hack --target {target?.nickname ?? "select_target"}</div>
          {stage ? (
            <div className="text-green-400 animate-pulse">{stage}</div>
          ) : target ? (
            <>
              <div className="text-slate-500">// Target locked: {target.nickname} (Lv.{target.level})</div>
              <div className="text-slate-500">// Tool: {toolDef.name} ({toolDef.bonus > 0 ? `+${toolDef.bonus * 100}%` : "standard"})</div>
              <div className="text-slate-500">// Press EXECUTE to breach the vault</div>
            </>
          ) : (
            <div className="text-slate-600">// Select a target below to begin reconnaissance</div>
          )}
        </div>
      </div>

      {result && <Banner ok={result.ok} text={result.text} />}

      {/* Tool select */}
      <div className="mafia-card rounded-xl p-4">
        <div className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">🛠️ Exploit Kit</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {HACK_TOOLS.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`rounded-xl p-3 text-left transition ${tool === t.id ? "border border-cyan-500/50 bg-cyan-950/30" : "border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50"}`}>
              <div className="flex items-center gap-2 text-xs font-black">{t.icon} {t.name}</div>
              <div className="text-[9px] text-slate-500">{t.desc}</div>
              {t.cost > 0 && <div className="text-[9px] font-bold text-amber-500">${nf(t.cost)}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Targets */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🎯 Vault Targets</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="rounded-lg border border-cyan-500/20 bg-black/30 px-3 py-1.5 text-xs" />
        </div>
        <div className="grid max-h-64 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t: any) => (
            <button key={t._id} onClick={() => setTargetId(t._id)}
              className={`flex items-center justify-between rounded-lg p-2.5 text-xs transition ${targetId === t._id ? "border border-cyan-500/50 bg-cyan-950/40" : "border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60"}`}>
              <span className="flex items-center gap-1.5 font-bold truncate">
                <span className={`h-1.5 w-1.5 rounded-full ${t.online ? "bg-green-500" : "bg-slate-700"}`} />
                {t.nickname}
              </span>
              <span className="text-[10px] text-slate-500">Lv.{t.level}{t.isBot ? "" : " 👤"}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={doHack} disabled={!target || busy}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-700 py-4 text-base font-black tracking-widest text-white uppercase shadow-lg shadow-cyan-950/50 transition hover:brightness-125 disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "⏳ BREACHING…" : target ? `⚛️ BREACH ${target.nickname.toUpperCase()}'S VAULT` : "SELECT A TARGET"}
      </button>
    </div>
  );
}

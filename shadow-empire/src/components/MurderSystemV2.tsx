import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skull, Crosshair, Syringe, Trophy, Shield, Eye, Zap, Timer } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

function Banner({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`rounded-xl border p-3 text-center text-xs font-bold animate-fade-in ${ok ? "border-green-500/30 bg-green-950/30 text-green-400" : "border-red-500/30 bg-red-950/30 text-red-400"}`}>
      {text}
    </div>
  );
}

/* ═══════════════ KILL EXECUTION SUITE ═══════════════ */

const WEAPONS = [
  { id: "garrote", name: "Wire Garrote", icon: "🪢", dmg: 28, silent: 95, trace: 2, desc: "Silent. Intimate. No trace." },
  { id: "poison", name: "Neuro-Toxin", icon: "☠️", dmg: 40, silent: 80, trace: 5, desc: "Looks like a heart attack." },
  { id: "throwing_knife", name: "Shadow Blade", icon: "🗡️", dmg: 32, silent: 85, trace: 8, desc: "One throw. One kill." },
  { id: "sniper", name: "Ghost Rifle", icon: "🎯", dmg: 65, silent: 70, trace: 10, desc: "They never hear the shot." },
  { id: "silenced", name: "Whisper 9mm", icon: "🤫", dmg: 38, silent: 75, trace: 15, desc: "Suppressed. Professional." },
  { id: "shotgun", name: "Devastator", icon: "💥", dmg: 75, silent: 25, trace: 35, desc: "Loud. Brutal. Effective." },
  { id: "car_bomb", name: "Phantom Bomb", icon: "🚗", dmg: 85, silent: 40, trace: 20, desc: "A message. Loud and clear." },
  { id: "c4", name: "Demolition Pack", icon: "💣", dmg: 95, silent: 20, trace: 30, desc: "Nothing left to identify." },
];

const METHODS = [
  { id: "shadow_strike", name: "Shadow Strike", icon: "🌑", bonus: 20, cost: 0, desc: "Strike from darkness." },
  { id: "staged_accident", name: "Staged Accident", icon: "🎭", bonus: 25, cost: 20000, desc: "No evidence. Just tragedy." },
  { id: "professional", name: "Professional Hit", icon: "📋", bonus: 35, cost: 80000, desc: "Hire the clean-up crew." },
  { id: "poison_gift", name: "Poisoned Gift", icon: "🎁", bonus: 30, cost: 40000, desc: "It's the thought that kills." },
  { id: "gang_ambush", name: "Gang Ambush", icon: "👥", bonus: 15, cost: 25000, desc: "Bring everyone. Leave nobody." },
  { id: "public_execution", name: "Public Execution", icon: "🏟️", bonus: 5, cost: 100000, desc: "Send a message to everyone." },
];

const PERFECT_EVIDENCE = ["fingerprints_wiped", "dna_burned", "no_witnesses", "cctv_loop", "phone_burner", "cash_trail"];

export function KillExecutionPage() {
  const player = useQuery(api.game.getPlayer);
  const targets = useQuery(api.statistics.getPlayerDirectory, { limit: 200 });
  const murderStats = useQuery(api.murderSystem.getMurderStats);
  const hack = useMutation(api.empireFeatures.hackPlayerBank);
  const advanceTrial = useMutation(api.empireFeatures.advanceRankTrial);
  const commitMurder = useMutation(api.murderSystem.commitMurder);

  const [targetId, setTargetId] = useState<string | null>(null);
  const [weaponId, setWeaponId] = useState("garrote");
  const [methodId, setMethodId] = useState("shadow_strike");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; detail?: string[] } | null>(null);
  const [animate, setAnimate] = useState<"idle" | "aiming" | "strike" | "kill" | "miss">("idle");

  if (!player || !targets) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Loading the execution suite…</div>;

  const filtered = targets
    .filter((t: any) => t._id !== player._id && (t.nickname || "").toLowerCase().includes(search.toLowerCase()))
    .slice(0, 40);
  const target = targets.find((t: any) => t._id === targetId);
  const weapon = WEAPONS.find((w) => w.id === weaponId)!;
  const method = METHODS.find((m) => m.id === methodId)!;

  const strike = async () => {
    if (!target || busy) return;
    setBusy(true);
    setResult(null);
    setAnimate("aiming");
    await new Promise((r) => setTimeout(r, 800));
    setAnimate("strike");
    await new Promise((r) => setTimeout(r, 400));
    try {
      const r = await commitMurder({
        targetId: target._id as any,
        weaponId: weapon.id === "garrote" ? "strangulation" : weapon.id === "poison" ? "poison" : weapon.id === "throwing_knife" ? "throwing_knife" : weapon.id === "sniper" ? "sniper" : weapon.id === "silenced" ? "silenced_pistol" : weapon.id === "shotgun" ? "shotgun" : weapon.id === "car_bomb" ? "car_bomb" : "explosive",
        methodId: method.id === "shadow_strike" ? "ambush" : method.id === "professional" ? "professional" : method.id === "gang_ambush" ? "gang_squad" : "staged_robbery",
        useGloves: weapon.trace < 15,
        useAlibi: method.cost > 0,
      });
      setAnimate("kill");
      setResult({
        ok: true,
        text: `☠️ ${target.nickname} ELIMINATED`,
        detail: [method.name, weapon.name, `Total success: ${r.totalSuccess ?? 95}%`],
      });
      advanceTrial({ trialType: "kill" }).catch(() => {});
    } catch (e: any) {
      setAnimate("miss");
      setResult({ ok: false, text: e.message || "The hit failed." });
    }
    await new Promise((r) => setTimeout(r, 600));
    setAnimate("idle");
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Skull className="size-7 text-red-400" />
        <h2 className="text-2xl font-black text-red-300">Kill Execution Suite</h2>
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">ASSASSIN MODE</span>
        {murderStats && (
          <span className="ml-auto text-[10px] font-bold text-slate-500">
            {murderStats.successful} kills · {murderStats.killRate}% rate
          </span>
        )}
      </div>

      {/* Execution stage */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-black via-red-950/20 to-black p-8 text-center min-h-[220px] flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 30%, #ef4444 0%, transparent 60%)" }} />
        {target ? (
          <>
            <div className={`relative z-10 text-5xl mb-2 transition-transform duration-300 ${animate === "aiming" ? "scale-110" : animate === "strike" ? "scale-90 blur-sm" : animate === "kill" ? "scale-75 opacity-40 grayscale" : ""}`}>
              🎯
            </div>
            <div className={`relative z-10 text-lg font-black transition-all ${animate === "kill" ? "text-red-500 line-through" : "text-white"}`}>
              {target.nickname}
            </div>
            <div className="relative z-10 text-[10px] text-slate-500">
              Lv.{target.level} · DEF {target.defense ?? 10} · {(target as any).isBotPlayer ? "🤖" : "🟢 online"}
            </div>
            {(animate === "strike" || animate === "kill") && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-6xl animate-ping">{animate === "kill" ? "☠️" : "🩸"}</div>
              </div>
            )}
          </>
        ) : (
          <div className="relative z-10 text-sm text-slate-500">Select a target from the list below…</div>
        )}
      </div>

      {result && <Banner ok={result.ok} text={result.text} />}

      {/* Target select */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🎯 Target List</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="rounded-lg border border-red-500/20 bg-black/30 px-3 py-1.5 text-xs" />
        </div>
        <div className="grid max-h-56 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t: any) => (
            <button key={t._id} onClick={() => { setTargetId(t._id); setResult(null); }}
              className={`flex items-center justify-between rounded-lg p-2 text-xs transition ${targetId === t._id ? "border border-red-500/50 bg-red-950/40" : "border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60"}`}>
              <span className="font-bold truncate">{t.nickname}</span>
              <span className="text-[10px] text-slate-500">Lv.{t.level}{t.wantedLevel > 0 ? " 🔴" : ""}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weapon + Method */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="mafia-card rounded-xl p-4 space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🔪 Weapon</div>
          <div className="grid max-h-64 gap-1.5 overflow-y-auto pr-1">
            {WEAPONS.map((w) => (
              <button key={w.id} onClick={() => setWeaponId(w.id)}
                className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left transition ${weaponId === w.id ? "border border-red-500/50 bg-red-950/30" : "border border-transparent bg-slate-900/40 hover:bg-slate-800/50"}`}>
                <span className="text-xl">{w.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-black">
                    {w.name}
                    <span className="rounded bg-slate-800 px-1.5 text-[9px] text-red-300">DMG {w.dmg}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">{w.desc}</div>
                  <div className="mt-1 flex gap-3 text-[8px]">
                    <span className={w.silent > 60 ? "text-green-500" : "text-amber-500"}>🔇 {w.silent}% silent</span>
                    <span className={w.trace < 12 ? "text-green-500" : "text-red-500"}>🔍 {w.trace}% trace</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mafia-card rounded-xl p-4 space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🎭 Method</div>
          <div className="grid max-h-64 gap-1.5 overflow-y-auto pr-1">
            {METHODS.map((m) => (
              <button key={m.id} onClick={() => setMethodId(m.id)}
                className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left transition ${methodId === m.id ? "border border-red-500/50 bg-red-950/30" : "border border-transparent bg-slate-900/40 hover:bg-slate-800/50"}`}>
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-black">
                    {m.name}
                    <span className="rounded bg-green-900/40 px-1.5 text-[9px] text-green-400">+{m.bonus}%</span>
                  </div>
                  <div className="text-[9px] text-slate-500">{m.desc}</div>
                  {m.cost > 0 && <div className="text-[9px] font-bold text-amber-500">${nf(m.cost)}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execute button */}
      <button onClick={strike} disabled={!target || busy}
        className="w-full rounded-2xl bg-gradient-to-r from-red-900 via-red-700 to-red-900 py-4 text-base font-black tracking-widest text-white uppercase shadow-lg shadow-red-950/50 transition hover:brightness-125 disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "⏳ EXECUTING…" : target ? `☠️ EXECUTE ${target.nickname.toUpperCase()}` : "SELECT A TARGET"}
      </button>
    </div>
  );
}

/* ═══════════════ MURDER LEADERBOARD ═══════════════ */

export function MurderLeaderboardPage() {
  const board = useQuery(api.empireFeatures.getMurderLeaderboard);
  if (!board) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Counting the bodies…</div>;
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Trophy className="size-7 text-amber-400" />
        <h2 className="text-2xl font-black text-amber-300">Killer Leaderboard</h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400">TOP 20</span>
      </div>
      <div className="mafia-card rounded-xl p-4">
        {board.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No killers yet. Be the first.</div>
        ) : (
          <div className="space-y-1.5">
            {board.map((k: any, i: number) => (
              <div key={k._id} className={`flex items-center gap-3 rounded-lg p-2.5 ${i === 0 ? "border border-amber-500/40 bg-amber-950/20" : i < 3 ? "border border-slate-700/50 bg-slate-900/50" : "bg-slate-900/30"}`}>
                <span className={`w-7 text-center text-sm font-black ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-slate-600"}`}>#{k.rank}</span>
                <span className={`h-2 w-2 rounded-full ${k.online ? "bg-green-500" : "bg-slate-700"}`} />
                <span className="flex-1 truncate text-xs font-bold">{k.nickname}</span>
                {k.isBot && <span className="rounded bg-slate-800 px-1.5 text-[8px] text-slate-500">BOT</span>}
                <span className="text-[10px] text-slate-500">Lv.{k.level}</span>
                <span className="w-16 text-right text-sm font-black text-red-400">{k.kills} 💀</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

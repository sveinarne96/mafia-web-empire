import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skull, Radar, FileWarning, ShowerHead, Crosshair, Wifi, WifiOff, Lock } from "lucide-react";

// ===== small helpers =====
const fmtMoney = (v: any) => `$${(v ?? 0).toLocaleString()}`;
const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const pad = (x: number) => String(x).padStart(2, "0");

function useCountdown(target: number | undefined | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return { left: 0, text: "" };
  const left = Math.max(0, Math.floor((target - now) / 1000));
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const text = d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
  return { left, text };
}

// ===== Morgue gate — shown when the player is dead =====
export function MorgueGate() {
  const morgue = useQuery(api.murderNetwork.getMorgue);
  const leave = useMutation(api.murderNetwork.leaveMorgue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const me = morgue?.me;
  const { text } = useCountdown(me?.reviveAt);

  if (!me) return null;

  const go = async (method: "wait" | "medic" | "coins") => {
    setBusy(true); setErr("");
    try { await leave({ method }); } catch (e: any) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at center, oklch(0.09 0.02 25) 0%, black 70%)" }}>
      <div className="max-w-lg w-full space-y-4 text-center">
        <div className="text-6xl animate-pulse">⚰️</div>
        <h1 className="text-3xl font-black text-red-500 tracking-widest" style={{ textShadow: "0 0 30px oklch(0.55 0.22 25)" }}>YOU ARE DEAD</h1>
        <div className="rounded-xl border border-red-900/40 bg-black/60 p-4 space-y-1 text-sm">
          <div className="text-red-300/80">Killed by <span className="font-bold text-red-400">{me.killerName}</span></div>
          <div className="text-slate-400 text-xs">{me.cause}</div>
          <div className="text-orange-400/80 text-xs pt-1">💸 {fmtMoney(me.cashLost)} was taken from your pocket</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">Coroner release in</div>
          <div className="font-mono text-4xl font-black text-slate-100 tabular-nums">{text || "00:00:00"}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button disabled={busy} onClick={() => go("wait")} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs font-bold text-slate-300 hover:border-slate-500 disabled:opacity-40">
            ⏳ Wait it out<div className="text-[9px] text-slate-500 font-normal mt-1">30% HP · free</div>
          </button>
          <button disabled={busy} onClick={() => go("medic")} className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-300 hover:border-emerald-500 disabled:opacity-40">
            💉 Street medic<div className="text-[9px] text-emerald-600/80 font-normal mt-1">{fmtMoney(me.medicCost)} · 60% HP</div>
          </button>
          <button disabled={busy} onClick={() => go("coins")} className="rounded-xl border border-yellow-700 bg-yellow-950/30 p-3 text-xs font-bold text-yellow-300 hover:border-yellow-500 disabled:opacity-40">
            👑 VIP clinic<div className="text-[9px] text-yellow-600/80 font-normal mt-1">25 coins · full HP</div>
          </button>
        </div>
        {err && <div className="text-xs text-red-400">{err}</div>}
        <div className="text-[10px] text-slate-600">🛡️ You'll get 10 minutes of morgue protection after revival.</div>
      </div>
    </div>
  );
}

// ===== Kill Ops tab =====
function KillOpsTab() {
  const player = useQuery(api.game.getPlayer);
  const targets = useQuery(api.murderNetwork.getKillTargets);
  const active = useQuery(api.murderNetwork.getMyActiveOp);
  const weaponsQ = useQuery(api.murderNetwork.getKillWeapons);
  const methodsQ = useQuery(api.murderNetwork.getKillMethods);
  const weapons = weaponsQ ?? [];
  const methods = methodsQ ?? [];

  const begin = useMutation(api.murderNetwork.beginKillOp);
  const surveil = useMutation(api.murderNetwork.runSurveillance);
  const collect = useMutation(api.murderNetwork.collectSurveillance);
  const execute = useMutation(api.murderNetwork.executeKillOp);
  const abort = useMutation(api.murderNetwork.abortKillOp);

  const [selected, setSelected] = useState<any>(null);
  const [weaponId, setWeaponId] = useState("kitchen_knife");
  const [methodId, setMethodId] = useState("ambush");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const { text: survText } = useCountdown(active?.op?.status === "surveilling" ? active.op.surveillanceReadyAt : null);

  useEffect(() => { if (selected && targets) { const fresh = targets.find((t: any) => t._id === selected._id); if (fresh) setSelected(fresh); } }, [targets]);

  if (!player) return <Loading />;
  const level = player.level ?? 1;
  const filtered = (targets ?? []).filter((t: any) => (t.nickname ?? "").toLowerCase().includes(search.toLowerCase()));

  const run = async (fn: () => Promise<any>) => { setBusy(true); setMsg(""); try { return await fn(); } catch (e: any) { setMsg(e.message); } finally { setBusy(false); } };

  // ===== ACTIVE OP PIPELINE =====
  if (active?.op && active.op.status !== "executed" && active.op.status !== "failed" && active.op.status !== "aborted" && active.op.status !== "resolved") {
    const op = active.op;
    return (
      <div className="space-y-4">
        <div className="mafia-card rounded-2xl border border-red-900/40 p-5" style={{ background: "linear-gradient(135deg, oklch(0.12 0.03 25), oklch(0.07 0.015 25))" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70">Active operation</div>
            <div className="rounded-full bg-red-950/60 border border-red-800/50 px-3 py-1 text-[10px] font-black text-red-300">{op.status.toUpperCase()}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-xl border border-red-800/50 bg-black/50 text-2xl">🎯</div>
            <div>
              <div className="text-xl font-black text-slate-100">{op.targetName}</div>
              <div className="text-xs text-slate-400">{active.target ? `Lv.${active.target.level} · DEF ${active.target.defense} · ${active.target.isOnline ? "🟢 online" : "⚫ offline"}` : "target intel pending"}</div>
            </div>
          </div>

          {op.status === "planning" && (
            <div className="mt-4 space-y-3">
              <div className="text-xs text-slate-400">Phase 2 — run a 60-second stakeout to gather intel and boost your odds, or strike blind right now.</div>
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => run(async () => { const r = await surveil({ opId: op._id }); setMsg(r.message); })} className="flex-1 rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-3 text-sm font-bold text-cyan-300 hover:border-cyan-500">🔭 Run surveillance<div className="text-[9px] font-normal text-cyan-600">-10 energy · +8-13% success</div></button>
                <button disabled={busy} onClick={() => run(async () => { const r = await execute({ opId: op._id }); if (r) setResult(r); })} className="flex-1 rounded-xl border border-red-700 bg-red-950/40 p-3 text-sm font-black text-red-200 hover:border-red-500">💀 Strike blind<div className="text-[9px] font-normal text-red-500/80">no intel bonus</div></button>
              </div>
            </div>
          )}

          {op.status === "surveilling" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-cyan-300"><Radar className="size-4 animate-spin" /> Drone streaming… intel ready in <span className="font-mono font-black tabular-nums">{survText}</span></div>
              <button disabled={busy} onClick={() => run(async () => { const r = await collect({ opId: op._id }); setMsg(r.message); })} className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm font-bold text-slate-300 disabled:opacity-40">📡 Collect intel (ready in {survText})</button>
            </div>
          )}

          {op.status === "ready" && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-3">
                <div className="text-[10px] uppercase tracking-widest text-cyan-500/70 mb-1">Surveillance report</div>
                <div className="font-mono text-xs text-cyan-200">{op.intel}</div>
                <div className="text-[10px] text-cyan-500 mt-1">+{Math.round((op.surveillanceBonus ?? 0) * 100)}% success bonus applied</div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/20 p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-red-400/70">Estimated success</div>
                  <div className="text-2xl font-black text-red-300">{active.estimatedSuccess}%</div>
                </div>
                <div className="text-right text-[10px] text-slate-500">⚔️ {player.attack ?? 10} vs 🛡️ {active.target?.defense}<br/>{active.target?.isOnline ? "target is online" : "target is offline"}</div>
              </div>
              <button disabled={busy} onClick={() => run(async () => { const r = await execute({ opId: op._id }); if (r) setResult(r); })} className="w-full rounded-xl border border-red-600 bg-gradient-to-b from-red-800 to-red-950 p-4 text-base font-black tracking-widest text-white hover:from-red-700 active:scale-[0.98] transition" style={{ boxShadow: "0 0 25px oklch(0.45 0.19 25 / 0.4)" }}>💀 EXECUTE THE HIT</button>
            </div>
          )}

          <button disabled={busy} onClick={() => run(async () => { await abort({ opId: op._id }); })} className="mt-3 w-full text-[11px] text-slate-600 hover:text-slate-400">✕ Abort operation (loadout cost is not refunded)</button>
        </div>
        {msg && <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">{msg}</div>}
        {result && <KillResult result={result} onClose={() => setResult(null)} />}
      </div>
    );
  }

  // ===== RESULT PANEL =====
  if (result) {
    return (
      <div className="space-y-4">
        <KillResult result={result} onClose={() => setResult(null)} />
        <LoadoutPicker weapons={weapons} methods={methods} level={level} weaponId={weaponId} methodId={methodId} setWeaponId={setWeaponId} setMethodId={setMethodId} money={player.money ?? 0} />
        <TargetList filtered={filtered} selected={selected} setSelected={setSelected} search={search} setSearch={setSearch} />
      </div>
    );
  }

  // ===== PLAN NEW OP =====
  const weapon = weapons.find((w: any) => w.id === weaponId);
  const method = methods.find((m: any) => m.id === methodId);
  const loadoutCost = (weapon?.cost ?? 0) + (method?.cost ?? 0);

  return (
    <div className="space-y-4">
      {msg && <div className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-3 text-xs text-amber-200">{msg}</div>}
      <LoadoutPicker weapons={weapons} methods={methods} level={level} weaponId={weaponId} methodId={methodId} setWeaponId={setWeaponId} setMethodId={setMethodId} money={player.money ?? 0} />
      <TargetList filtered={filtered} selected={selected} setSelected={setSelected} search={search} setSearch={setSearch} />
      {selected && weapon && method && (
        <div className="mafia-card sticky bottom-16 rounded-2xl border border-red-800/50 p-4" style={{ background: "linear-gradient(135deg, oklch(0.13 0.04 25), oklch(0.07 0.015 25))", boxShadow: "0 -8px 30px rgba(0,0,0,0.6)" }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Operation: <b className="text-slate-200">{selected.nickname}</b></span>
            <span className="text-slate-400">Cost: <b className={loadoutCost > (player.money ?? 0) ? "text-red-400" : "text-emerald-400"}>{fmtMoney(loadoutCost)}</b> · ⚡{weapon.energy + 5}</span>
          </div>
          <button
            disabled={busy || selected.tooWeak || selected.morgueProtected || loadoutCost > (player.money ?? 0)}
            onClick={() => run(async () => {
              const r = await begin({ targetId: selected._id, weaponId, methodId });
              setMsg(r.message); if (r.message) setSelected(null);
            })}
            className="w-full rounded-xl border border-red-600 bg-gradient-to-b from-red-800 to-red-950 p-3.5 text-sm font-black tracking-wider text-white disabled:opacity-40 active:scale-[0.98] transition"
          >
            {selected.tooWeak ? `🔒 ${selected.nickname} is below your kill threshold` : selected.morgueProtected ? `🛡️ ${selected.nickname} has morgue protection` : `🗂️ OPEN OPERATION ON ${selected.nickname.toUpperCase()}`}
          </button>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return <div className="mafia-card rounded-xl p-8 text-center text-sm text-slate-500">Loading…</div>;
}

function LoadoutPicker({ weapons, methods, level, weaponId, methodId, setWeaponId, setMethodId, money }: any) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 mb-2 px-1">1 · Choose your weapon</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {weapons.map((w: any) => {
            const locked = level < w.unlockLevel;
            return (
              <button key={w.id} disabled={locked} onClick={() => setWeaponId(w.id)} className={`relative rounded-xl border p-3 text-left transition ${weaponId === w.id ? "border-red-500 bg-red-950/30" : "border-slate-800 bg-slate-950/60 hover:border-red-800/50"} ${locked ? "opacity-40" : ""}`}>
                {locked && <Lock className="absolute right-2 top-2 size-3 text-slate-500" />}
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200"><span className="text-lg">{w.icon}</span>{w.name}</div>
                <div className="mt-1 text-[10px] text-slate-500">{locked ? `Unlocks at Lv.${w.unlockLevel}` : `${fmtMoney(w.cost)} · ⚡${w.energy} · trace ${Math.round(w.trace * 100)}%`}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 mb-2 px-1">2 · Choose your method</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {methods.map((m: any) => {
            const locked = level < m.unlockLevel;
            return (
              <button key={m.id} disabled={locked} onClick={() => setMethodId(m.id)} className={`relative rounded-xl border p-3 text-left transition ${methodId === m.id ? "border-red-500 bg-red-950/30" : "border-slate-800 bg-slate-950/60 hover:border-red-800/50"} ${locked ? "opacity-40" : ""}`}>
                {locked && <Lock className="absolute right-2 top-2 size-3 text-slate-500" />}
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200"><span>{m.icon}</span>{m.name}</div>
                <div className="mt-1 text-[10px] text-slate-500">{locked ? `Unlocks at Lv.${m.unlockLevel}` : `${m.cost ? fmtMoney(m.cost) : "free"} · +${Math.round(m.bonusSuccess * 100)}% · ghost ${Math.round(m.witnessReduction * 100)}%`}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TargetList({ filtered, selected, setSelected, search, setSearch }: any) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 px-1">3 · Pick your target</div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search the streets…" className="w-full rounded-lg border border-red-900/30 bg-black/40 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600" />
      <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
        {filtered.map((p: any) => (
          <button key={p._id} onClick={() => setSelected(p)} className={`w-full rounded-xl border p-3 text-left transition ${selected?._id === p._id ? "border-red-500 bg-red-950/25" : "border-slate-800/70 bg-slate-950/50 hover:border-red-900/50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{p.nickname}</span>
                <span className="text-[10px] text-slate-500">Lv.{p.level}</span>
                {p.isOnline ? <Wifi className="size-3 text-emerald-400" /> : <WifiOff className="size-3 text-slate-600" />}
                {p.morgueProtected && <span className="text-[9px] text-yellow-500">🛡️ protected</span>}
              </div>
              <div className="text-[10px] text-slate-500">⚔️{p.attack} 🛡️{p.defense} · {fmtMoney(p.money)}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-600">No players found</div>}
      </div>
    </div>
  );
}

function KillResult({ result, onClose }: any) {
  const success = result.success;
  return (
    <div className={`rounded-2xl border p-5 space-y-3 ${success ? "border-red-700/60" : "border-slate-700/60"}`} style={{ background: success ? "linear-gradient(135deg, oklch(0.14 0.06 25), oklch(0.05 0.01 25))" : "linear-gradient(135deg, oklch(0.1 0.02 260), oklch(0.05 0.01 260))" }}>
      <div className="flex items-center justify-between">
        <div className={`text-2xl font-black tracking-wider ${success ? "text-red-400" : "text-slate-300"}`} style={success ? { textShadow: "0 0 25px oklch(0.55 0.22 25)" } : {}}>
          {success ? "💀 TARGET ELIMINATED" : "🩸 THE HIT FAILED"}
        </div>
        <button onClick={onClose} className="text-xs text-slate-600 hover:text-slate-300">✕</button>
      </div>
      <div className="text-sm italic text-slate-300">{result.narrative}</div>
      {success ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">POCKETED</div><div className="text-sm font-black text-emerald-400">{fmtMoney(result.cash)}</div></div>
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">HIT PAY</div><div className="text-sm font-black text-emerald-400">{fmtMoney(result.hitPay)}</div></div>
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">CONTRACT</div><div className="text-sm font-black text-yellow-400">{result.contractPaid ? fmtMoney(result.contractPaid) : "—"}</div></div>
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">XP</div><div className="text-sm font-black text-sky-400">+{result.xpGained}</div></div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className={`rounded-full border px-2 py-0.5 ${result.evidence?.length ? "border-red-800 text-red-300" : "border-emerald-800 text-emerald-300"}`}>🕵️ Evidence: {result.evidence?.length ? result.evidence.join(", ") : "NONE — clean kill"}</span>
            <span className="rounded-full border border-orange-900 px-2 py-0.5 text-orange-300">🔴 Wanted +{result.wantedGain}</span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">rolled {result.chance}%</span>
          </div>
          {result.detectiveResolvesAt && <div className="text-[10px] text-slate-500">🔍 A detective picks up the case in 20-45 minutes. Scrub the scene in the Heat tab before then…</div>}
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">DAMAGE</div><div className="text-sm font-black text-red-400">-{result.damageTaken} HP</div></div>
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">XP</div><div className="text-sm font-black text-sky-400">+{result.xpGained}</div></div>
            <div className="rounded-lg bg-black/40 p-2"><div className="text-[9px] text-slate-500">ROLLED</div><div className="text-sm font-black text-slate-300">{result.chance}%</div></div>
          </div>
          <div className="space-y-1 text-[11px]">
            {result.arrested && <div className="text-red-400">🚔 The cops grabbed you on the way out — you're going to prison.</div>}
            {result.killedSelf && <div className="text-red-500 font-bold">⚰️ They fought back and killed you. Welcome to the morgue.</div>}
            {result.learnedIdentity && !result.killedSelf && <div className="text-amber-400">👁️ {result.targetDodged} saw your face. They know it was you.</div>}
            {!result.learnedIdentity && !result.killedSelf && <div className="text-slate-400">🌫️ {result.targetDodged} has no idea who it was.</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ===== Darknet contracts tab =====
function DarknetTab() {
  const board = useQuery(api.murderNetwork.getContractBoard);
  const targets = useQuery(api.murderNetwork.getKillTargets);
  const player = useQuery(api.game.getPlayer);
  const place = useMutation(api.murderNetwork.placeContract);
  const accept = useMutation(api.murderNetwork.acceptContract);
  const cancel = useMutation(api.murderNetwork.cancelContract);

  const [targetId, setTargetId] = useState("");
  const [bounty, setBounty] = useState(50000);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async (fn: () => Promise<any>) => { setBusy(true); setMsg(""); try { const r = await fn(); if (r?.message) setMsg(r.message); } catch (e: any) { setMsg(e.message); } finally { setBusy(false); } };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-900/40 bg-black/70 p-4 font-mono" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(16,185,129,0.03) 0 1px, transparent 1px 3px)" }}>
        <div className="mb-2 flex items-center gap-2 text-[10px] text-emerald-500/80"><span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> onion://shadowmarket/contracts — anonymous escrow</div>
        {/* Post a contract */}
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="rounded-lg border border-emerald-900/60 bg-black/60 px-3 py-2 text-xs text-emerald-100">
            <option value="">— select target —</option>
            {(targets ?? []).map((t: any) => <option key={t._id} value={t._id}>{t.nickname} · Lv.{t.level}</option>)}
          </select>
          <input type="number" min={10000} step={10000} value={bounty} onChange={(e) => setBounty(Number(e.target.value))} className="w-28 rounded-lg border border-emerald-900/60 bg-black/60 px-3 py-2 text-xs text-emerald-100" />
          <button disabled={busy || !targetId || bounty < 10000} onClick={() => run(() => place({ targetId: targetId as any, bounty }))} className="rounded-lg border border-emerald-600 bg-emerald-950/50 px-4 py-2 text-xs font-black text-emerald-200 disabled:opacity-40">POST HIT</button>
        </div>
        <div className="mt-1 text-[9px] text-emerald-700">min $10,000 · 5% escrow fee · anyone can claim · contracts bypass the level rule</div>
        {msg && <div className="mt-2 rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-2 text-[11px] text-emerald-200">{msg}</div>}
      </div>

      {/* Open contracts */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 px-1">Open contracts</div>
        {(board?.open ?? []).map((c: any) => <ContractRow key={c._id} c={c} onAccept={() => run(() => accept({ contractId: c._id }))} />)}
        {(board?.open ?? []).length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-600">The board is empty. Post the first hit.</div>}
      </div>

      {/* My contracts */}
      {(board?.mine ?? []).length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 px-1">My posted contracts</div>
          {(board?.mine ?? []).map((c: any) => (
            <div key={c._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs">
              <div><b className="text-slate-200">{c.targetName}</b> <span className="text-slate-500">· {fmtMoney(c.bounty)}</span> <span className={`ml-1 rounded px-1.5 py-0.5 text-[9px] ${c.status === "assigned" ? "bg-cyan-950 text-cyan-300" : "bg-slate-800 text-slate-400"}`}>{c.status === "assigned" ? `taken by ${c.killerName ?? "killer"}` : "open"}</span></div>
              {c.status === "open" && <button disabled={busy} onClick={() => run(() => cancel({ contractId: c._id }))} className="text-[10px] text-slate-500 hover:text-red-400">withdraw</button>}
            </div>
          ))}
        </div>
      )}

      {/* Contracts I took */}
      {(board?.taken ?? []).length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-500/70 px-1">My jobs — kill the target before the deadline</div>
          {(board?.taken ?? []).map((c: any) => (
            <div key={c._id} className="flex items-center justify-between rounded-xl border border-amber-900/50 bg-amber-950/10 p-3 text-xs">
              <div><b className="text-amber-200">{c.targetName}</b> <span className="text-amber-500/70">· {fmtMoney(c.bounty)}</span></div>
              <CountdownLabel deadline={c.deadline} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CountdownLabel({ deadline }: { deadline?: number }) {
  const { text, left } = useCountdown(deadline);
  return <span className={`font-mono font-black tabular-nums ${left < 3600 ? "text-red-400" : "text-amber-300"}`}>⏳ {text}</span>;
}

function ContractRow({ c, onAccept }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-3">
      <div>
        <div className="text-sm font-black text-emerald-200">🎯 {c.targetName} <span className="ml-1 rounded bg-emerald-900/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">{fmtMoney(c.bounty)}</span></div>
        <div className="text-[10px] text-emerald-700">posted by {c.posterHint} · {c.ageMin < 1 ? "just now" : timeAgo(Date.now() - c.ageMin * 60000)}</div>
      </div>
      <button onClick={onAccept} className="rounded-lg border border-emerald-600 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:border-emerald-400">TAKE JOB</button>
    </div>
  );
}

// ===== Heat & forensics tab =====
function HeatTab() {
  const heat = useQuery(api.murderNetwork.getMyHeat);
  const hire = useMutation(api.murderNetwork.hireCleaner);
  const tick = useMutation(api.murderNetwork.resolveInvestigationsTick);
  const player = useQuery(api.game.getPlayer);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // resolve finished investigations whenever the tab is open
  useEffect(() => { const t = setInterval(() => { tick().catch(() => {}); }, 15000); tick().catch(() => {}); return () => clearInterval(t); }, []);

  if (!heat) return <Loading />;
  const wanted = heat.wantedLevel ?? 0;

  const clean = async (opId: any) => { setBusy(true); setMsg(""); try { const r = await hire({ opId }); setMsg(r.message); } catch (e: any) { setMsg(e.message); } finally { setBusy(false); } };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${wanted >= 7 ? "border-red-600/60" : wanted >= 4 ? "border-orange-700/50" : "border-slate-800"}`} style={{ background: wanted >= 7 ? "linear-gradient(135deg, oklch(0.15 0.06 25), black)" : undefined }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black text-slate-200"><FileWarning className="size-4 text-orange-400" /> POLICE HEAT</div>
          <div className="flex gap-1">{Array.from({ length: 10 }).map((_, i) => <span key={i} className={`size-3 rounded-sm ${i < wanted ? (wanted >= 7 ? "bg-red-500 animate-pulse" : "bg-orange-400") : "bg-slate-800"}`} />)}</div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">{wanted >= 9 ? "You're the most wanted man in the city. Cops shoot first." : wanted >= 7 ? "Roadblocks are looking for your face." : wanted >= 4 ? "Detectives know your name." : wanted >= 1 ? "Small-time trouble. It'll blow over." : "Clean record. Stay sharp."}</div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 px-1">Active crime scenes</div>
        {(heat.openScenes ?? []).map((s: any) => <SceneRow key={s.opId} s={s} onClean={() => clean(s.opId)} busy={busy} />)}
        {(heat.openScenes ?? []).length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-600">🧼 No active scenes. Either you're innocent or you're smart.</div>}
        {msg && <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">{msg}</div>}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-500">
        🔍 Detectives resolve every scene 20–45 minutes after the hit. Evidence strength ≥ 5 → <b className="text-red-400">prison</b>. ≥ 2.5 → wanted +2. Below that, the case goes cold. Cleaners remove ~80% of traces for $20K each.
      </div>
    </div>
  );
}

function SceneRow({ s, onClean, busy }: any) {
  const { text } = useCountdown(s.resolvesAt);
  const danger = s.strength >= 5;
  return (
    <div className={`rounded-xl border p-3 ${danger ? "border-red-700/60 bg-red-950/20" : "border-slate-800 bg-slate-950/50"}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-200">🔪 {s.scene}</div>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${danger ? "bg-red-950 text-red-300" : "bg-slate-800 text-slate-300"}`}>STRENGTH {s.strength.toFixed(1)}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">{(s.evidence ?? []).map((e: string, i: number) => <span key={i} className="rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-slate-400">{e}</span>)}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-500">detective closes case in {text}</span>
        {!s.cleaned && <button disabled={busy} onClick={onClean} className="rounded-lg border border-cyan-800 bg-cyan-950/30 px-3 py-1 text-[11px] font-bold text-cyan-300 disabled:opacity-40">🧹 Hire cleaner</button>}
        {s.cleaned && <span className="text-[10px] text-cyan-500">cleaned ✓</span>}
      </div>
    </div>
  );
}

// ===== Kill feed + most wanted tab =====
function FeedTab() {
  const feed = useQuery(api.murderNetwork.getKillFeed);
  const wanted = useQuery(api.murderNetwork.getMostWanted);
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 px-1">Live kill feed</div>
        <div className="space-y-1">
          {(feed ?? []).map((f: any, i: number) => (
            <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${f.success ? "border-red-900/40 bg-red-950/10" : "border-slate-800/60 bg-slate-950/40"}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{f.killer}</span>
                <span className="text-slate-500">Lv.{f.killerLevel}</span>
                <span className="text-slate-600">{f.success ? "💀" : "❌"}</span>
                <span className={f.success ? "text-red-300" : "text-slate-500"}>{f.target}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                {f.success && f.money > 0 && <span className="text-emerald-500">{fmtMoney(f.money)}</span>}
                {timeAgo(f.timestamp)}
              </div>
            </div>
          ))}
          {(feed ?? []).length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-600">💀 No bodies yet. The city sleeps… for now.</div>}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.3em] text-orange-400/70 px-1">Most wanted</div>
        {(wanted ?? []).map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-orange-900/30 bg-slate-950/50 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-orange-400">#{i + 1}</span>
              <span className="font-bold text-slate-200">{p.nickname}</span>
              {p.isDead && <span className="text-red-500">⚰️</span>}
              <span className="text-[10px] text-slate-500">Lv.{p.level}</span>
            </div>
            <div className="text-[10px] text-slate-500">💀 {p.kills} kills · 🔴 wanted {p.wanted}/10</div>
          </div>
        ))}
        {(wanted ?? []).length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-600">Nobody has blood on their hands yet.</div>}
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
function MurderPage() {
  const player = useQuery(api.game.getPlayer);
  const [tab, setTab] = useState<"ops" | "darknet" | "heat" | "feed">("ops");

  if (!player) return <Loading />;

  const tabs = [
    { id: "ops" as const, label: "💀 Kill Ops", icon: Skull },
    { id: "darknet" as const, label: "🕸️ Darknet", icon: Crosshair },
    { id: "heat" as const, label: "🧹 Heat", icon: ShowerHead },
    { id: "feed" as const, label: "📡 The Wire", icon: Radar },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      {player.isDead && <MorgueGate />}

      {/* Cinematic header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-900/40 p-5" style={{ background: "linear-gradient(120deg, oklch(0.13 0.05 25) 0%, oklch(0.07 0.02 20) 60%, black 100%)" }}>
        <div className="absolute -right-6 -top-8 text-[120px] opacity-10 select-none">🔫</div>
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.4em] text-red-400/60">Shadow division · lethal force authorized</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-100">THE KILL FLOOR</h1>
          <p className="mt-1 max-w-xl text-xs text-slate-400">Plan the op. Watch the target. Pull the trigger. Scrub the scene. Every kill leaves traces — every trace is a countdown.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <span className="rounded-full border border-red-900/50 bg-black/40 px-2.5 py-1 text-red-300">💀 {player.totalKills ?? 0} confirmed kills</span>
            <span className="rounded-full border border-orange-900/50 bg-black/40 px-2.5 py-1 text-orange-300">🔴 wanted {player.wantedLevel ?? 0}/10</span>
            <span className="rounded-full border border-slate-800 bg-black/40 px-2.5 py-1 text-slate-400">⚔️ {player.attack ?? 10} atk</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${tab === t.id ? "bg-red-700 text-white shadow-lg" : "bg-white/5 text-slate-400 hover:text-slate-200"}`}>
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "ops" && <KillOpsTab />}
      {tab === "darknet" && <DarknetTab />}
      {tab === "heat" && <HeatTab />}
      {tab === "feed" && <FeedTab />}
    </div>
  );
}

export { MurderPage };

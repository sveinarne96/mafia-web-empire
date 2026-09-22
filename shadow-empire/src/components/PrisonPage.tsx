import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PrisonBustPanel } from "./EmpireAndBust";

export function PrisonPage() {
  const player = useQuery(api.game.getPlayer);
  const prisonStatus = useQuery(api.game.getPrisonStatus);
  const prisonTime = useQuery(api.gameFeatures.getPrisonTimeDisplay);
  const releaseFromPrison = useMutation(api.game.releaseFromPrison);
  const payBail = useMutation(api.game.payBail);
  const prisonEscape = useMutation(api.game.prisonEscape);
  const paroleHearing = useMutation(api.game.paroleHearing);
  const prisonJobMut = useMutation(api.game.prisonJob);
  const smuggleMut = useMutation(api.game.smuggleContraband);

  const [selectedTab, setSelectedTab] = useState<"overview"|"activities"|"smuggle"|"escape">("overview");
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  const [result, setResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [escaping, setEscaping] = useState(false);

  const inPrison = player?.inPrison ?? false;
  const prisonTimeMs = player?.prisonTime ?? 0;
  const lastCrimeAt = player?.lastCrimeAt ?? 0;

  useEffect(() => {
    if (!inPrison) return;
    const iv = setInterval(() => {
      const elapsed = Date.now() - lastCrimeAt;
      const remaining = Math.max(0, prisonTimeMs - elapsed);
      const totalSec = Math.ceil(remaining / 1000);
      setCountdown({
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      });
      if (remaining <= 0) {
        releaseFromPrison({}).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [inPrison, prisonTimeMs, lastCrimeAt, releaseFromPrison]);

  const handleBail = useCallback(async () => {
    try {
      const r = await payBail({});
      setResult({ msg: `Paid $${r.cost.toLocaleString()} bail. You are free!`, ok: true });
    } catch (e: any) { setResult({ msg: e.message || "Failed", ok: false }); }
  }, [payBail]);

  const handleEscape = useCallback(async () => {
    setEscaping(true);
    setResult(null);
    try {
      const r = await prisonEscape({});
      if (r.success) {
        setResult({ msg: "You escaped prison! The guards didn't see you.", ok: true });
      } else {
        setResult({ msg: "Escape failed! You were sent to solitary confinement.", ok: false });
      }
    } catch (e: any) { setResult({ msg: e.message || "Failed", ok: false }); }
    setEscaping(false);
  }, [prisonEscape]);

  const handleParole = useCallback(async () => {
    try {
      const r = await paroleHearing({});
      setResult(r.success
        ? { msg: "Parole granted! You are a free man.", ok: true }
        : { msg: "Parole denied. Good behavior next time.", ok: false });
    } catch (e: any) { setResult({ msg: e.message || "Failed", ok: false }); }
  }, [paroleHearing]);

  const handleJob = useCallback(async (job: string) => {
    try {
      const r = await prisonJobMut({ job });
      setResult({ msg: `Worked as ${job}. Earned $${r.reward}`, ok: true });
    } catch (e: any) { setResult({ msg: e.message || "Failed", ok: false }); }
  }, [prisonJobMut]);

  const handleSmuggle = useCallback(async (type: string) => {
    try {
      const r = await smuggleMut({ type });
      if (r.success) {
        setResult({ msg: `Smuggled ${type}! Earned $${r.reward.toLocaleString()}`, ok: true });
      } else {
        setResult({ msg: `Caught smuggling ${type}! Sent to solitary.`, ok: false });
      }
    } catch (e: any) { setResult({ msg: e.message || "Failed", ok: false }); }
  }, [smuggleMut]);

  // NOT IN PRISON - Show arrest screen
  if (!inPrison) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔓</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Not In Prison</h2>
        </div>
        <div className="mafia-card rounded-xl p-6 text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-muted-foreground">You are a free man. Stay out of trouble!</p>
          <p className="text-xs text-muted-foreground">Commit crimes to gain XP and money. Get caught and you'll end up here.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="mafia-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">0</div>
            <div className="text-xs text-muted-foreground">Prison Escapes</div>
          </div>
          <div className="mafia-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{prisonStatus?.prisonCurrency ?? 0}</div>
            <div className="text-xs text-muted-foreground">Prison Currency</div>
          </div>
        </div>
        <PrisonBustPanel />
      </div>
    );
  }

  // IN PRISON
  const jobs = [
    { id: "kitchen", name: "Kitchen Duty", icon: "🍳", desc: "Wash dishes, earn commissary", reward: "$100-500" },
    { id: "laundry", name: "Laundry", icon: "👕", desc: "Wash inmate clothes", reward: "$100-500" },
    { id: "library", name: "Library", icon: "📚", desc: "Shelve books, gain knowledge", reward: "$100-500" },
    { id: "yard", name: "Yard Work", icon: "🌿", desc: "Maintain the yard", reward: "$100-500" },
    { id: "workshop", name: "Workshop", icon: "🔧", desc: "Fix things around prison", reward: "$100-500" },
    { id: "cleaning", name: "Cleaning", icon: "🧹", desc: "Clean the cells", reward: "$100-500" },
  ];

  const smuggleItems = [
    { id: "phone", name: "Burner Phone", icon: "📱", risk: "High", desc: "Secret communication device" },
    { id: "drugs", name: "Contraband", icon: "💊", risk: "Very High", desc: "Sellable on the yard" },
    { id: "tools", name: "Lockpick Tools", icon: "🔑", risk: "Extreme", desc: "Helps with escape attempts" },
    { id: "weapon", name: "Shiv", icon: "🔪", risk: "Extreme", desc: "Protection in the yard" },
    { id: "drugs2", name: "Pills", icon: "💉", risk: "High", desc: "Painkillers for resale" },
    { id: "papers", name: "Fake Documents", icon: "📄", risk: "Very High", desc: "Parole paperwork" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔒</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">Prison</h2>
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold animate-pulse">INCARCERATED</span>
      </div>

      {/* Timer */}
      <div className="bg-gradient-to-r from-red-900/40 via-orange-900/30 to-yellow-900/20 border border-red-500/30 rounded-xl p-4 text-center">
        <div className="text-xs text-red-300 mb-1">Time Remaining</div>
        <div className="flex items-center justify-center gap-2">
          <div className="bg-black/40 rounded-lg px-3 py-2 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400 font-mono animate-pulse">{String(countdown.h).padStart(2, "0")}</div>
            <div className="text-[9px] text-red-300/60">HRS</div>
          </div>
          <span className="text-xl text-red-400/50">:</span>
          <div className="bg-black/40 rounded-lg px-3 py-2 border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-400 font-mono animate-pulse">{String(countdown.m).padStart(2, "0")}</div>
            <div className="text-[9px] text-orange-300/60">MIN</div>
          </div>
          <span className="text-xl text-orange-400/50">:</span>
          <div className="bg-black/40 rounded-lg px-3 py-2 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400 font-mono animate-pulse">{String(countdown.s).padStart(2, "0")}</div>
            <div className="text-[9px] text-yellow-300/60">SEC</div>
          </div>
        </div>
        {prisonTime?.hours != null && (
          <div className="text-[10px] text-red-300/50 mt-2">
            Cell Level: {prisonTime.cellLevel} | Gang: {prisonTime.gang || "None"} | Job: {prisonTime.job || "None"}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="mafia-card rounded-xl p-2 text-center">
          <div className="text-lg">🏠</div>
          <div className="text-sm font-bold text-orange-400">Lvl {prisonStatus?.cellLevel ?? 1}</div>
          <div className="text-[9px] text-muted-foreground">Cell</div>
        </div>
        <div className="mafia-card rounded-xl p-2 text-center">
          <div className="text-lg">💰</div>
          <div className="text-sm font-bold text-yellow-400">${prisonStatus?.prisonCurrency ?? 0}</div>
          <div className="text-[9px] text-muted-foreground">Currency</div>
        </div>
        <div className="mafia-card rounded-xl p-2 text-center">
          <div className="text-lg">📦</div>
          <div className="text-sm font-bold text-purple-400">{prisonStatus?.contraband ?? 0}</div>
          <div className="text-[9px] text-muted-foreground">Contraband</div>
        </div>
        <div className="mafia-card rounded-xl p-2 text-center">
          <div className="text-lg">{prisonStatus?.solitaryTime ? " solitary" : "👥"}</div>
          <div className="text-sm font-bold text-red-400">{prisonStatus?.solitaryTime ? "Yes" : "No"}</div>
          <div className="text-[9px] text-muted-foreground">Solitary</div>
        </div>
      </div>

      {/* Result message */}
      {result && (
        <div className={`rounded-xl p-3 text-sm font-bold text-center animate-fade-in ${
          result.ok
            ? "bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-500/30 text-emerald-400"
            : "bg-gradient-to-r from-red-500/20 to-rose-500/10 border border-red-500/30 text-red-400"
        }`}>
          {result.ok ? "✅" : "❌"} {result.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "overview" as const, label: "Overview", icon: "🏠" },
          { id: "activities" as const, label: "Jobs", icon: "🔨" },
          { id: "smuggle" as const, label: "Smuggle", icon: "📦" },
          { id: "escape" as const, label: "Escape", icon: "🏃" },
        ]).map(t => (
          <button key={t.id} onClick={() => setSelectedTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedTab === t.id
                ? "bg-gradient-to-r from-red-500/30 to-orange-500/20 border border-red-500/40 text-red-300"
                : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Prison Life</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Serve your sentence or find ways to reduce it</p>
              <p>• Work jobs to earn prison currency</p>
              <p>• Smuggle contraband for extra income (risky!)</p>
              <p>• Attempt an escape (very risky!)</p>
              <p>• Request a parole hearing when eligible</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleParole}
              className="bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 text-center hover:scale-[1.02] transition-all">
              <div className="text-2xl mb-1">⚖️</div>
              <div className="text-xs font-bold text-emerald-400">Parole Hearing</div>
              <div className="text-[9px] text-emerald-300/60">75% success rate</div>
            </button>
            <button onClick={handleBail}
              className="bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-[1.02] transition-all">
              <div className="text-2xl mb-1">💵</div>
              <div className="text-xs font-bold text-yellow-400">Pay Bail</div>
              <div className="text-[9px] text-yellow-300/60">$10,000</div>
            </button>
          </div>
        </div>
      )}

      {selectedTab === "activities" && (
        <div className="grid grid-cols-2 gap-2">
          {jobs.map(job => (
            <button key={job.id} onClick={() => handleJob(job.name)}
              className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-3 text-left hover:scale-[1.02] transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl group-hover:scale-110 transition-transform">{job.icon}</span>
                <span className="text-xs font-bold text-amber-300">{job.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{job.desc}</div>
              <div className="text-[10px] text-amber-400/60 mt-1">Reward: {job.reward}</div>
            </button>
          ))}
        </div>
      )}

      {selectedTab === "smuggle" && (
        <div className="space-y-2">
          <div className="text-xs text-yellow-400 text-center bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
            Warning: 25% chance of being caught. Getting caught means solitary confinement!
          </div>
          {smuggleItems.map(item => (
            <button key={item.id} onClick={() => handleSmuggle(item.id)}
              className="w-full bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20 rounded-xl p-3 text-left hover:scale-[1.01] transition-all group flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-purple-300">{item.name}</div>
                <div className="text-[10px] text-muted-foreground">{item.desc}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                item.risk === "Extreme" ? "bg-red-500/20 text-red-400" :
                item.risk === "Very High" ? "bg-orange-500/20 text-orange-400" :
                "bg-yellow-500/20 text-yellow-400"
              }`}>{item.risk}</span>
            </button>
          ))}
        </div>
      )}

      {selectedTab === "escape" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-red-900/30 via-red-800/20 to-orange-900/10 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">{escaping ? "🏃" : "🏯"}</div>
            <div className="text-sm font-bold text-red-300 mb-1">
              {escaping ? "Escaping..." : "Prison Break"}
            </div>
            <div className="text-[10px] text-red-300/60 mb-3">
              Only 30% chance of success. Failure means solitary confinement!
            </div>
            <button onClick={handleEscape} disabled={escaping}
              className={`w-full px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                escaping
                  ? "bg-red-500/30 text-red-300 animate-pulse cursor-wait"
                  : "bg-gradient-to-r from-red-500/30 to-orange-500/20 border border-red-500/40 text-red-300 hover:scale-[1.02]"
              }`}>
              {escaping ? "Breaking out..." : "🏃 Attempt Escape"}
            </button>
          </div>
          <div className="mafia-card rounded-xl p-3">
            <div className="text-xs font-bold mb-2">Escape Methods</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px]">
                <span>🚪</span>
                <span className="text-muted-foreground">Tunnel through the walls</span>
                <span className="ml-auto text-red-400">30% chance</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span>📦</span>
                <span className="text-muted-foreground">Hide in laundry cart</span>
                <span className="ml-auto text-red-400">30% chance</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span>🪟</span>
                <span className="text-muted-foreground">Break through window</span>
                <span className="ml-auto text-red-400">30% chance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PrisonBustPanel />
    </div>
  );
}

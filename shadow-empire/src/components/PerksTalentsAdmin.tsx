import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PERK_DEFS } from "@/data/objectives";

// City talent tracks shown in the Points > Talents page.
const CITY_TALENTS = ["Influential", "Distance Adjustment", "Bumper Crop"];
const GLOBAL_TALENTS = ["Warehouse", "Hardy", "Bulk Trade"];

const nf = (n: number) => Math.floor(n).toLocaleString();
const remain = (until: number) => {
  const t = until - Date.now();
  if (t <= 0) return "";
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`rounded-lg px-3 py-2 text-xs font-bold border ${msg.ok ? "text-green-400 border-green-500/30 bg-green-950/20" : "text-red-400 border-red-500/30 bg-red-950/20"}`}>
      {msg.ok ? "✅ " : "⚠️ "}{msg.text}
    </div>
  );
}

/**
 * ADMIN — Perks & Talents manager.
 * Shows every perk in stock + live timer status for any player, and lets the
 * admin grant stock, activate/extend/clear timers, and hand out talent points.
 */
export function PerksTalentsAdmin({ players, onClose }: { players: any[]; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(players[0]?._id ?? null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [grantQty, setGrantQty] = useState(10);
  const [timerHours, setTimerHours] = useState(1);

  const selected = players.find((p) => p._id === selectedId) ?? null;
  const detail = useQuery(
    api.admin.getPlayerPerks,
    selectedId ? ({ targetId: selectedId } as any) : "skip"
  );

  const grantPerkStock = useMutation(api.admin.grantPerkStock);
  const grantAllPerks = useMutation(api.admin.grantAllPerks);
  const setPerkTimer = useMutation(api.admin.setPerkTimer);
  const setTalentPoints = useMutation(api.admin.setTalentPoints);

  const filtered = (players || []).filter((p) =>
    (p.nickname || p.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const run = async (fn: () => Promise<any>, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(false);
  };

  const status = (detail as any)?.status ?? {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">⚡ Perks & Talents Manager</h3>
          <p className="text-[10px] text-muted-foreground">Grant perk stock, activate/extend timers, and adjust talent points for any player.</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕ Close</button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players..."
        className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        {/* Player list */}
        <div className="max-h-[480px] overflow-y-auto space-y-1 pr-1">
          {filtered.slice(0, 60).map((p: any) => (
            <button key={p._id} onClick={() => { setSelectedId(p._id); setMsg(null); }}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${selectedId === p._id ? "bg-fuchsia-500/15 border-fuchsia-500/40" : "hover:bg-white/5 border-transparent"}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold">{p.nickname || p.username || "Unknown"}</span>
                <span className="text-muted-foreground">Lv.{p.level}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-xs text-muted-foreground p-3 text-center">No players found.</div>}
        </div>

        {/* Detail */}
        <div className="space-y-3">
          {!selected || !detail ? (
            <div className="mafia-card rounded-xl p-8 text-center text-sm text-muted-foreground">
              {selected ? "Loading perk data…" : "Select a player to manage their perks."}
            </div>
          ) : (
            <>
              <Msg msg={msg} />

              {/* Player header */}
              <div className="mafia-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">{detail.nickname}</div>
                  <div className="text-[10px] text-muted-foreground">
                    🪙 {nf(detail.coins)} coins · 🛡️ {detail.jailImmunityCount} jail skips banked
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={100} value={grantQty} onChange={(e) => setGrantQty(Math.min(100, Math.max(1, parseInt(e.target.value || "1", 10))))}
                    className="w-16 bg-black/30 border border-border rounded-lg px-2 py-1.5 text-xs text-center" />
                  <button disabled={busy}
                    onClick={() => run(() => grantAllPerks({ targetId: selected._id, amount: grantQty }), `Granted ${grantQty}x of ALL perks to ${detail.nickname}`)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 disabled:opacity-40">
                    🎁 Grant ALL perks
                  </button>
                </div>
              </div>

              {/* Perk table */}
              <div className="mafia-card rounded-xl p-4 overflow-x-auto">
                <div className="text-sm font-bold mb-2">⚡ Perk stock & timers</div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[9px] uppercase text-muted-foreground border-b border-slate-700/40">
                      <th className="py-2 pr-2">Perk</th>
                      <th className="py-2 pr-2">Stock</th>
                      <th className="py-2 pr-2">Timer</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERK_DEFS.map((p) => {
                      const st = status[p.id] ?? { stock: 0, active: false, until: 0 };
                      const hasTimer = !("jailImmunity supplyUnit".split(" ").includes(p.id));
                      const timed = p.duration !== "instant" && p.id !== "jailImmunity" && p.id !== "supplyUnit";
                      return (
                        <tr key={p.id} className="border-b border-slate-800/40">
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <span>{p.icon}</span>
                              <div>
                                <div className="font-bold text-[11px]">{p.label}</div>
                                <div className="text-[9px] text-muted-foreground">{p.desc}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 pr-2 text-center">
                            <span className="text-amber-400 font-black">{st.stock}</span>
                            <div className="flex gap-0.5 justify-center mt-1">
                              <button disabled={busy} title="+10 stock"
                                onClick={() => run(() => grantPerkStock({ targetId: selected._id, perkId: p.id, amount: grantQty }), `+${grantQty} ${p.label} stock`)}
                                className="px-1.5 rounded bg-green-600/80 text-[9px] font-black text-white hover:bg-green-500 disabled:opacity-40">+</button>
                              <button disabled={busy} title="-10 stock"
                                onClick={() => run(() => grantPerkStock({ targetId: selected._id, perkId: p.id, amount: -grantQty }), `-${grantQty} ${p.label} stock`)}
                                className="px-1.5 rounded bg-red-600/80 text-[9px] font-black text-white hover:bg-red-500 disabled:opacity-40">−</button>
                            </div>
                          </td>
                          <td className="py-2 pr-2">
                            {timed ? (
                              st.active ? (
                                <span className="text-[10px] font-bold text-green-400 animate-pulse">● Active · {remain(st.until)}</span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Inactive</span>
                              )
                            ) : (
                              <span className="text-[10px] text-slate-600">on-use</span>
                            )}
                          </td>
                          <td className="py-2">
                            {timed && (
                              <div className="flex items-center gap-1">
                                <button disabled={busy}
                                  onClick={() => run(() => setPerkTimer({ targetId: selected._id, perkId: p.id, hours: timerHours }), `${p.label} activated/extended ${timerHours}h`)}
                                  className="px-2 py-1 rounded bg-emerald-600 text-[9px] font-black text-white hover:bg-emerald-500 disabled:opacity-40">
                                  +{timerHours}h
                                </button>
                                <button disabled={busy}
                                  onClick={() => run(() => setPerkTimer({ targetId: selected._id, perkId: p.id, hours: 0 }), `${p.label} deactivated`)}
                                  className="px-2 py-1 rounded bg-slate-700 text-[9px] font-black text-slate-300 hover:bg-slate-600 disabled:opacity-40">
                                  Clear
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Timer hours:</span>
                  <input type="number" min={1} max={720} value={timerHours} onChange={(e) => setTimerHours(Math.min(720, Math.max(1, parseInt(e.target.value || "1", 10))))}
                    className="w-16 bg-black/30 border border-border rounded px-2 py-1 text-center" />
                  <span>(0 = deactivate · max 720h)</span>
                </div>
              </div>

              {/* Talents */}
              <div className="mafia-card rounded-xl p-4">
                <div className="text-sm font-bold mb-2">🌟 Talents</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">City talent points</div>
                    <div className="text-xl font-black text-cyan-300">{nf(detail.talentPoints)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Global talent points</div>
                    <div className="text-xl font-black text-violet-300">{nf(detail.globalTalentPoints)}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button disabled={busy}
                    onClick={() => run(() => setTalentPoints({ targetId: selected._id, cityPoints: 10, globalPoints: 0 }), "+10 city talent points")}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 text-[10px] font-black text-white hover:bg-cyan-500 disabled:opacity-40">+10 City TP</button>
                  <button disabled={busy}
                    onClick={() => run(() => setTalentPoints({ targetId: selected._id, cityPoints: -10, globalPoints: 0 }), "-10 city talent points")}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-[10px] font-black text-slate-300 hover:bg-slate-600 disabled:opacity-40">−10 City TP</button>
                  <button disabled={busy}
                    onClick={() => run(() => setTalentPoints({ targetId: selected._id, cityPoints: 0, globalPoints: 5 }), "+5 global talent points")}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 text-[10px] font-black text-white hover:bg-violet-500 disabled:opacity-40">+5 Global TP</button>
                  <button disabled={busy}
                    onClick={() => run(() => setTalentPoints({ targetId: selected._id, cityPoints: 0, globalPoints: -5 }), "-5 global talent points")}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-[10px] font-black text-slate-300 hover:bg-slate-600 disabled:opacity-40">−5 Global TP</button>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <div className="font-bold text-slate-400 mb-1">City tracks</div>
                    {CITY_TALENTS.map((t) => (
                      <div key={t} className="flex justify-between border-b border-slate-800/40 py-0.5">
                        <span className="text-slate-300">{t}</span>
                        <span className="text-muted-foreground">Lv. {(detail.cityTalents as any)?.[t] ?? 0} / 10</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-slate-400 mb-1">Global tracks</div>
                    {GLOBAL_TALENTS.map((t) => (
                      <div key={t} className="flex justify-between border-b border-slate-800/40 py-0.5">
                        <span className="text-slate-300">{t}</span>
                        <span className="text-muted-foreground">Lv. {(detail.globalTalents as any)?.[t] ?? 0} / 10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

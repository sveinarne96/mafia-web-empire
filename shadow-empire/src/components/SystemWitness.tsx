import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const nf = (n: number) => Math.floor(n).toLocaleString();
const money = (n: number) => `$${nf(n)}`;

/* ═══════════ WITNESS STATEMENTS MARKETPLACE ═══════════ */
export function WitnessStatementsPage() {
  const player = useQuery(api.game.getPlayer);
  const mine = useQuery(api.witnessMarket.getMyStatements);
  const forSale = useQuery(api.witnessMarket.listStatementsForSale, { search: "" });
  const seedOld = useMutation(api.witnessMarket.ensureStatements);

  const [deadUser, setDeadUser] = useState("");
  const [deadResult, setDeadResult] = useState<any[] | null>(null);
  const [code, setCode] = useState("");
  const [codeResult, setCodeResult] = useState<any | null>(null);
  const [saleSearch, setSaleSearch] = useState("");
  const [sellPrice, setSellPrice] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const listStatement = useMutation(api.witnessMarket.listStatement);
  const unlistStatement = useMutation(api.witnessMarket.unlistStatement);
  const buyStatement = useMutation(api.witnessMarket.buyStatement);
  const revealByCode = useMutation(api.witnessMarket.revealByCode);
  const searchByVictim = useQuery(api.witnessMarket.searchByVictim, { username: deadUser.trim() || "__none__" });

  // Back-fill statements for murders committed before this system shipped.
  useEffect(() => {
    if (mine !== undefined && mine.length === 0) seedOld().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine === undefined]);

  if (!player || mine === undefined || forSale === undefined)
    return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Contacting witnesses…</div>;

  const run = async (fn: () => Promise<any>, ok: string) => {
    setMsg(null); setBusy(true);
    try { const r = await fn(); setMsg({ ok: true, text: r?.message ?? ok }); }
    catch (e: any) { setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Action failed" }); }
    setBusy(false);
  };

  const doSearch = () => {
    setDeadResult(searchByVictim ?? []);
  };

  const rows = deadResult ?? [];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-950 to-slate-950 p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-10 select-none">🗣️</div>
        <h1 className="text-2xl font-black tracking-widest text-sky-300">WITNESS STATEMENTS</h1>
        <p className="mt-1 max-w-xl text-xs text-slate-400">
          Every murder leaves a coded witness statement. Holders can sell them — a buyer learns exactly who
          pulled the trigger on the victim. Silence is a commodity in this city.
        </p>
      </div>

      {msg && (
        <div className={`rounded-xl border p-3 text-xs font-semibold ${msg.ok ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>{msg.text}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Search my statements */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <h2 className="text-xs font-black tracking-wider text-white">🔎 Search my statements</h2>
          <p className="mt-1 text-[10px] text-slate-500">Enter the exact name of a dead user to see statements about them.</p>
          <div className="mt-3 flex gap-2">
            <input value={deadUser} onChange={(e) => setDeadUser(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Dead user"
              className="flex-1 rounded-xl border border-slate-700/70 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-sky-500/50" />
            <button onClick={doSearch} className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-black text-white hover:bg-sky-500">CHECK</button>
          </div>
          <div className="mt-3 space-y-1.5">
            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-6 text-center text-[10px] text-slate-600">No statements found for that user.</div>
            ) : rows.map((s: any) => (
              <div key={s._id} className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2">
                <div>
                  <div className="text-xs font-bold text-slate-200">Victim: <b className="text-red-400">{s.victimName}</b></div>
                  <div className="text-[10px] text-slate-500">Statement on file {s.listed ? `· listed ${money(s.price)}` : ""}</div>
                </div>
                <span className="text-lg">🕵️ {s.killerName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Check code */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <h2 className="text-xs font-black tracking-wider text-white">🔑 Check code</h2>
          <p className="mt-1 text-[10px] text-slate-500">Enter a statement code to reveal it. Codes are 6 characters, e.g. <code className="text-amber-300">K7QX2M</code>.</p>
          <div className="mt-3 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="Enter Code..."
              className="flex-1 rounded-xl border border-slate-700/70 bg-slate-950 px-3 py-2 font-mono text-sm uppercase tracking-[0.3em] text-amber-300 placeholder:tracking-normal placeholder:text-slate-600 outline-none focus:border-amber-500/50" />
            <button onClick={async () => { setMsg(null); setBusy(true); try { const r = await revealByCode({ code }); setCodeResult(r); } catch (e: any) { setMsg({ ok: false, text: e?.data?.message ?? "Check failed" }); } setBusy(false); }}
              disabled={busy}
              className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-black text-slate-950 hover:bg-amber-500 disabled:opacity-50">CHECK</button>
          </div>
          {codeResult && (
            codeResult.found ? (
              <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="text-[10px] text-slate-500">Statement about <b className="text-red-400">{codeResult.victimName}</b></div>
                <div className="mt-1 text-xs text-slate-300">“{codeResult.text}”</div>
                <div className="mt-2 inline-block rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-[10px] font-black text-red-400">KILLER: {codeResult.killerName}</div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">No statement matches that code.</div>
            )
          )}
        </div>
      </div>

      {/* For sale */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
        <h2 className="text-xs font-black tracking-wider text-white">🛒 Witness statements for sale</h2>
        <p className="mt-1 text-[10px] text-slate-500">Statements currently listed by all users. Purchase instantly reveals the killer in your locker.</p>
        <input value={saleSearch} onChange={(e) => setSaleSearch(e.target.value)} placeholder="Search listings…"
          className="mt-3 w-full rounded-xl border border-slate-700/70 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-sky-500/50" />
        <div className="mt-2 space-y-1.5">
          {forSale.filter((s: any) => !saleSearch || s.victimName.toLowerCase().includes(saleSearch.toLowerCase()) || s.killerName.toLowerCase().includes(saleSearch.toLowerCase())).length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-[11px] text-slate-600">No statements listed for sale right now. Kill someone and sell the proof.</div>
          ) : forSale.filter((s: any) => !saleSearch || s.victimName.toLowerCase().includes(saleSearch.toLowerCase()) || s.killerName.toLowerCase().includes(saleSearch.toLowerCase())).map((s: any) => (
            <div key={s._id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2.5">
              <span className="text-xl">📜</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200">Hit on <b className="text-red-400">{s.victimName}</b></div>
                <div className="text-[9px] text-slate-600">Killer identity sealed · listed {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <span className="text-sm font-black text-green-400">{money(s.price)}</span>
              <button onClick={() => run(() => buyStatement({ statementId: s._id }).then((r: any) => ({ message: `Statement purchased — killer is ${r.code ? `: code ${r.code}` : ""} ${r.text ?? ""}` })), "Statement purchased")}
                disabled={busy}
                className="rounded-xl bg-green-600 px-4 py-2 text-[10px] font-black text-white hover:bg-green-500 disabled:opacity-50">PURCHASE</button>
            </div>
          ))}
        </div>
      </div>

      {/* My statements */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
        <h2 className="text-xs font-black tracking-wider text-white">🗂️ My statements <span className="text-[9px] text-slate-500">(last {mine.length})</span></h2>
        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-[11px] text-slate-600">You have no witness statements. Statements appear when you commit murders.</div>
        ) : (
          <div className="mt-2 max-h-96 space-y-1.5 overflow-y-auto pr-1">
            {mine.map((s: any) => (
              <div key={s._id} className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-300">Victim <b className="text-red-400">{s.victimName}</b> · Killer <b className="text-amber-300">{s.killerName}</b></div>
                    <div className="mt-0.5 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.25em] text-amber-400/90">CODE {s.code}</div>
                  </div>
                  {s.listed ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-[9px] font-bold text-green-400">FOR SALE · {money(s.price)}</span>
                      <button onClick={() => run(() => unlistStatement({ statementId: s._id }), "Listing removed.")} disabled={busy}
                        className="rounded-lg border border-slate-700 px-2 py-1 text-[9px] text-slate-400 hover:bg-slate-800">UNLIST</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input value={sellPrice[s._id] ?? "100000000"} onChange={(e) => setSellPrice({ ...sellPrice, [s._id]: e.target.value.replace(/[^0-9]/g, "") })}
                        className="w-28 rounded-lg border border-slate-700/70 bg-slate-950 px-2 py-1.5 text-[10px] text-green-400 outline-none" placeholder="Price $" />
                      <button onClick={() => run(() => listStatement({ statementId: s._id, price: Number(sellPrice[s._id]) || 100000000 }), "Listed for sale.")} disabled={busy}
                        className="rounded-lg bg-sky-600 px-2.5 py-1.5 text-[9px] font-black text-white hover:bg-sky-500 disabled:opacity-50">LIST</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ WITNESS & EVIDENCE SYSTEM ═══════════ */
export function WitnessSystemPage() {
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const evidence = [
    { type: "Fingerprints", icon: "👆", level: "Low", decay: "72h", actions: ["Bribe witness $10K", "Intimidate $5K", "Eliminate $50K"] },
    { type: "DNA Sample", icon: "🧬", level: "Critical", decay: "168h", actions: ["Destroy lab $25K", "Plant fake DNA $30K", "Flee jurisdiction $100K"] },
    { type: "Security Footage", icon: "📹", level: "Medium", decay: "48h", actions: ["Hack footage $15K", "Bribe guard $8K", "Steal DVR $20K"] },
    { type: "Witness Testimony", icon: "🗣️", level: "High", decay: "96h", actions: ["Bribe $20K", "Intimidate $12K", "Discredit $18K"] },
    { type: "CCTV Traces", icon: "🎥", level: "Low", decay: "24h", actions: ["Hack system $10K", "Destroy cameras $5K", "Fake alibi $15K"] },
    { type: "Phone Records", icon: "📱", level: "Medium", decay: "120h", actions: ["Spoof number $8K", "Burn phone $3K", "Hack tower $20K"] },
    { type: "Vehicle Tracks", icon: "🚗", level: "Low", decay: "36h", actions: ["Chop vehicle $25K", "Fake plates $5K", "GPS jammer $10K"] },
    { type: "Financial Trail", icon: "💳", level: "Critical", decay: "240h", actions: ["Launder money $30K", "Create shell $40K", "Destroy records $20K"] },
  ];

  const evidenceLevel = evidence.filter(e => e.level === "Critical").length * 30 + evidence.filter(e => e.level === "High").length * 20 + evidence.filter(e => e.level === "Medium").length * 10;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔍</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Witness & Evidence System</h2>
          <p className="text-xs text-slate-400">Manage evidence against you before the FBI connects the dots</p>
        </div>
      </div>

      {/* Evidence Threat Level */}
      <div className={`rounded-xl p-4 border ${evidenceLevel > 60 ? "bg-red-900/20 border-red-500/40" : evidenceLevel > 30 ? "bg-yellow-900/20 border-yellow-500/40" : "bg-green-900/20 border-green-500/40"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-200">⚖️ Evidence Threat Level</span>
          <span className={`text-sm font-black ${evidenceLevel > 60 ? "text-red-400" : evidenceLevel > 30 ? "text-yellow-400" : "text-green-400"}`}>{evidenceLevel}%</span>
        </div>
        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${evidenceLevel > 60 ? "bg-gradient-to-r from-red-600 to-red-400" : evidenceLevel > 30 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-green-600 to-green-400"}`} style={{ width: `${Math.min(100, evidenceLevel)}%` }} />
        </div>
        <div className="text-[10px] text-slate-400 mt-1">{evidenceLevel > 60 ? "⚠️ FBI is closing in! Destroy evidence NOW!" : evidenceLevel > 30 ? "⚡ Investigation heating up. Act soon." : "✅ You're relatively clean."}</div>
      </div>

      {msg && <div className="px-4 py-2 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-bold animate-fade-in">✅ {msg}</div>}

      <div className="grid gap-3">
        {evidence.map((e, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{e.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{e.type}</div>
                  <div className={`text-[10px] font-bold ${e.level === "Critical" ? "text-red-400" : e.level === "High" ? "text-orange-400" : e.level === "Medium" ? "text-yellow-400" : "text-green-400"}`}>{e.level} Threat</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Decays in</div>
                <div className="text-xs font-bold text-cyan-400">{e.decay}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {e.actions.map((a, j) => (
                <button key={j} onClick={() => setMsg(`Evidence "${e.type}" handled! Threat reduced.`)} className="px-2 py-1.5 bg-amber-600/20 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-300 hover:bg-amber-600/30 transition-all">
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ FORENSICS LAB ═══════════ */
export function ForensicsLabPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const analyses = [
    { name: "DNA Analysis", icon: "🧬", cost: 15000, time: "2h", result: "Identifies killer from blood sample", status: "available" },
    { name: "Ballistics Report", icon: "🔫", cost: 10000, time: "1h", result: "Matches bullet to weapon type", status: "available" },
    { name: "Fingerprint Database", icon: "👆", cost: 8000, time: "30m", result: "Cross-reference prints with criminal DB", status: "available" },
    { name: "Toxicology Screen", icon: "⚗️", cost: 12000, time: "4h", result: "Detects poisons and drugs in system", status: "available" },
    { name: "Digital Forensics", icon: "💻", cost: 20000, time: "6h", result: "Recover deleted files and messages", status: "available" },
    { name: "Crime Scene Reconstruction", icon: "🗺️", cost: 30000, time: "12h", result: "Full 3D recreation of crime scene", status: "locked" },
    { name: "Facial Recognition", icon: "👤", cost: 25000, time: "3h", result: "Match suspect to security footage", status: "available" },
    { name: "Voice Analysis", icon: "🎙️", cost: 18000, time: "5h", result: "Identify caller from recordings", status: "available" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔬</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Forensics Lab</h2>
          <p className="text-xs text-slate-400">Advanced forensic analysis to solve (or cover up) crimes</p>
        </div>
      </div>

      <div className="grid gap-3">
        {analyses.map((a, i) => (
          <div key={i} className={`mafia-card rounded-xl p-4 flex items-center gap-4 ${a.status === "locked" ? "opacity-50" : ""}`}>
            <span className="text-3xl">{a.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200">{a.name}</div>
              <div className="text-[10px] text-slate-400">{a.result}</div>
              <div className="text-[10px] text-cyan-400 mt-0.5">⏱️ {a.time}</div>
            </div>
            {a.status === "locked" ? (
              <span className="px-3 py-1 bg-slate-800/50 text-slate-500 rounded-lg text-[10px] font-bold">🔒 Level 50+</span>
            ) : (
              <button className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold hover:bg-cyan-600/30 transition-all">${a.cost.toLocaleString()}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ COURT & LEGAL SYSTEM ═══════════ */
export function CourtSystemPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const cases = [
    { crime: "Armed Robbery", charges: 3, severity: "Felony", penalty: "5-15 years", bail: 250000, lawyer: 50000 },
    { crime: "Grand Theft Auto", charges: 2, severity: "Felony", penalty: "3-8 years", bail: 150000, lawyer: 30000 },
    { crime: "Drug Trafficking", charges: 5, severity: "Federal", penalty: "10-25 years", bail: 500000, lawyer: 75000 },
    { crime: "Money Laundering", charges: 4, severity: "Felony", penalty: "5-20 years", bail: 300000, lawyer: 60000 },
    { crime: "Identity Theft", charges: 2, severity: "Misdemeanor", penalty: "1-3 years", bail: 50000, lawyer: 15000 },
    { crime: "Tax Evasion", charges: 6, severity: "Federal", penalty: "8-20 years", bail: 400000, lawyer: 80000 },
  ];

  const totalCharges = cases.reduce((a, c) => a + c.charges, 0);
  const acquitChance = Math.max(5, 40 - totalCharges * 3);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚖️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Court & Legal System</h2>
          <p className="text-xs text-slate-400">Navigate the justice system — or buy your way out</p>
        </div>
      </div>

      {/* Court Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-[10px] text-slate-400">Active Cases</div>
          <div className="text-lg font-bold text-red-400">{cases.length}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">⚖️</div>
          <div className="text-[10px] text-slate-400">Total Charges</div>
          <div className="text-lg font-bold text-orange-400">{totalCharges}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">🎰</div>
          <div className="text-[10px] text-slate-400">Acquit Chance</div>
          <div className="text-lg font-bold text-green-400">{acquitChance}%</div>
        </div>
      </div>

      <div className="grid gap-3">
        {cases.map((c, i) => (
          <div key={i} className="mafia-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">{c.crime}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.severity === "Federal" ? "bg-red-900/40 text-red-400" : c.severity === "Felony" ? "bg-orange-900/40 text-orange-400" : "bg-yellow-900/40 text-yellow-400"}`}>{c.severity}</span>
                  <span className="text-[10px] text-slate-400">{c.charges} charges</span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>Penalty: <span className="text-red-400 font-bold">{c.penalty}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button className="px-2 py-1.5 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold hover:bg-green-600/30 transition-all">
                💰 Post Bail ${c.bail.toLocaleString()}
              </button>
              <button className="px-2 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-[10px] font-bold hover:bg-blue-600/30 transition-all">
                👨‍⚖️ Hire Lawyer ${c.lawyer.toLocaleString()}
              </button>
              <button className="px-2 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold hover:bg-purple-600/30 transition-all">
                ⚖️ Go To Trial
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

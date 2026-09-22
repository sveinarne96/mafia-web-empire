import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Landmark, Lock, TrendingUp, TrendingDown, Package, Building2,
  Skull, Send, Coins, BarChart3, ArrowDownToLine, ArrowUpFromLine,
  Upload, RefreshCw, Wrench, Boxes,
} from "lucide-react";

// Reusable animated page header
function PageHeader({
  icon, title, tint = "amber",
}: { icon: React.ReactNode; title: string; tint?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl" style={{ filter: "drop-shadow(0 0 8px rgba(255,200,80,0.35))" }}>{icon}</span>
      <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400">{title}</h2>
    </div>
  );
}

const fmtInt = (n: number) => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtMoney = (n: number) => "$" + (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtPts = (n: number) => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

function Stat({ label, value, cls = "text-primary" }: { label: string; value: React.ReactNode; cls?: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-black ${cls}`}>{value}</div>
    </div>
  );
}

function Card({ title, icon, children, accent = "border-amber-500/20" }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`mafia-card rounded-xl p-4 border ${accent}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <div className="text-sm font-black text-amber-300">{title}</div>
      </div>
      {children}
    </div>
  );
}

/* ═════════════════ BANK ── INTEREST + SWISS ═════════════════ */
export function BankPage() {
  const s = useQuery(api.worldSystem.getBankState) as any;
  const depI = useMutation(api.worldSystem.depositInterest);
  const wdI = useMutation(api.worldSystem.withdrawInterest);
  const depS = useMutation(api.worldSystem.depositSwiss);
  const wdS = useMutation(api.worldSystem.withdrawSwiss);
  const send = useMutation(api.worldSystem.sendMoney);
  const applyInt = useMutation(api.worldSystem.applyInterest);
  const [iAmt, setIAmt] = useState(0);
  const [sAmt, setSAmt] = useState(0);
  const [uName, setUName] = useState("");
  const [sndAmt, setSndAmt] = useState(0);
  const [msg, setMsg] = useState<{ t: string; c: string } | null>(null);

  if (!s) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const run = async (fn: any, ok: string) => {
    try { const r = await fn(); setMsg({ t: ok, c: "text-green-400" }); }
    catch (e: any) { setMsg({ t: e.message || "Error", c: "text-red-400" }); }
  };
  const bs = s.bankStats || {};

  return (
    <div className="animate-fade-in space-y-4 animate-gradient p-1">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="💵 Cash" value={fmtMoney(s.money)} cls="text-green-400" />
        <Stat label="🏛️ Interest Bank" value={fmtMoney(s.interestBank)} cls="text-blue-400" />
        <Stat label="🏝️ Swiss Bank" value={fmtMoney(s.swissBank)} cls="text-teal-400" />
        <Stat label="🔒 Swiss Limit" value={fmtMoney(s.swissLimit)} cls="text-slate-300" />
      </div>

      {msg && <div className={`text-xs font-semibold ${msg.c}`}>{msg.t}</div>}

      <Card title="Interest Bank" icon={<Landmark className="size-4 text-blue-400" />}>
        <div className="text-[11px] text-muted-foreground mb-2">Balance: <span className="font-black text-blue-300">${fmtInt(s.interestBank)}</span></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
            <div className="flex items-center gap-1.5 mb-1"><RefreshCw className="size-3 text-blue-400" /><span className="text-[10px] font-black text-blue-300">12 Hours</span></div>
            <div className="text-sm font-black text-blue-400">4.04%</div>
            <div className="text-[9px] text-muted-foreground">Daily Compound</div>
          </div>
          <div className="rounded-lg border border-green-500/20 bg-green-950/20 p-3">
            <div className="flex items-center gap-1.5 mb-1"><RefreshCw className="size-3 text-green-400" /><span className="text-[10px] font-black text-green-300">24 Hours</span></div>
            <div className="text-sm font-black text-green-400">4.20%</div>
            <div className="text-[9px] text-muted-foreground">Daily Compound</div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <input type="number" value={iAmt} min={1} onChange={e => setIAmt(Number(e.target.value))} placeholder="Amount..." className="w-40 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => run(() => depI({ amount: iAmt }), `Deposited $${fmtInt(iAmt)} into interest bank`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">↓ Deposit</button>
          <button onClick={() => run(() => wdI({ amount: iAmt }), `Withdrew $${fmtInt(iAmt)}`)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition">↑ Withdraw</button>
          <button onClick={() => run(() => applyInt({}), "Interest applied ✅")} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition">⟳ Compound Interest</button>
        </div>
      </Card>

      <Card title="Swiss Bank" icon={<ArrowUpFromLine className="size-4 text-teal-400" />}>
        <div className="text-[11px] text-muted-foreground mb-2">Balance: <span className="font-black text-teal-300">${fmtInt(s.swissBank)}</span> · Limit: <span className="font-black text-slate-300">${fmtInt(s.swissLimit)}</span></div>
        <div className="text-[11px] text-muted-foreground mb-2">Hidden offshore vault. Protected from busts and raids.</div>
        <div className="flex flex-wrap items-end gap-2">
          <input type="number" value={sAmt} min={1} onChange={e => setSAmt(Number(e.target.value))} placeholder="Amount..." className="w-40 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => run(() => depS({ amount: sAmt }), `Deposited $${fmtInt(sAmt)} to swiss`)} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition">↓ Deposit</button>
          <button onClick={() => run(() => wdS({ amount: sAmt }), `Withdrew $${fmtInt(sAmt)}`)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition">↑ Withdraw</button>
        </div>
      </Card>

      <Card title="Send Money" icon={<Send className="size-4 text-orange-400" />}>
        <div className="flex flex-wrap items-end gap-2">
          <input value={uName} onChange={e => setUName(e.target.value)} placeholder="Username" className="w-40 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <input type="number" value={sndAmt} min={1} onChange={e => setSndAmt(Number(e.target.value))} placeholder="Amount" className="w-40 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => run(() => send({ username: uName, amount: sndAmt }), `Sent $${fmtInt(sndAmt)} to ${uName}`)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition">Send</button>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Fee: $1 per transfer</div>
      </Card>

      <Card title="Bank Statistics" icon={<BarChart3 className="size-4 text-purple-400" />}>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="Interest Profit" value={fmtMoney(bs.interestProfit ?? 0)} cls="text-blue-400" />
          <Stat label="Swiss Limit" value={fmtMoney(bs.swissLimit ?? s.swissLimit)} cls="text-teal-400" />
          <Stat label="Money Sent" value={fmtMoney(bs.totalSent ?? 0)} cls="text-orange-400" />
          <Stat label="Money Received" value={fmtMoney(bs.totalReceived ?? 0)} cls="text-green-400" />
          <Stat label="Transfers Sent" value={bs.sent ?? 0} cls="text-slate-200" />
          <Stat label="Transfers Received" value={bs.received ?? 0} cls="text-slate-200" />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Money Sent — view your last 25 sent transactions</div>
        {(s.transfers || []).filter((t: any) => t.type === "sent").length === 0 && <div className="text-[11px] text-muted-foreground mt-1">No transfers sent yet</div>}
        <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
          {(s.transfers || []).filter((t: any) => t.type === "sent").map((t: any, i: number) => (
            <div key={i} className="flex justify-between text-[11px] bg-muted/30 rounded px-2 py-1">
              <span className="text-orange-400">→ Sent</span>
              <span className="text-slate-300">{t.username}</span>
              <span className="font-mono">{fmtMoney(t.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Money Received — view your last 25 received transactions</div>
        {(s.transfers || []).filter((t: any) => t.type === "received").length === 0 && <div className="text-[11px] text-muted-foreground mt-1">No transfers received yet</div>}
        <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
          {(s.transfers || []).filter((t: any) => t.type === "received").map((t: any, i: number) => (
            <div key={i} className="flex justify-between text-[11px] bg-muted/30 rounded px-2 py-1">
              <span className="text-green-400">← Received</span>
              <span className="text-slate-300">{t.username}</span>
              <span className="font-mono">{fmtMoney(t.amount)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═════════════════ CRACK THE SAFE ═════════════════ */
export function CrackSafePage() {
  const st = useQuery(api.worldSystem.getSafeState) as any;
  const guess = useMutation(api.worldSystem.guessSafe);
  const [combo, setCombo] = useState([1, 1, 1, 1, 1]);
  const [msg, setMsg] = useState<{ t: string; c: string } | null>(null);

  if (!st) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const setDigit = (i: number, v: number) => setCombo(combo.map((d, x) => (x === i ? ((v % 9) + 1) : d)));
  const submit = async () => {
    try {
      const r = await guess({ combo });
      if (r.correct) setMsg({ t: `🎉 CRACKED! Jackpot $${fmtInt(r.jackpot)}!`, c: "text-green-400" });
      else setMsg({ t: `❌ Wrong combination. Clue: exactly ${r.clues.evenCount} even numbers.`, c: "text-amber-400" });
    } catch (e: any) { setMsg({ t: e.message || "Error", c: "text-red-400" }); }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon={<Lock className="size-7 text-amber-400" />} title="Crack the Safe" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="🔐 Safes Cracked" value={st.safeStats?.safesCracked ?? 0} cls="text-green-400" />
        <Stat label="🎯 Cracks Today" value={st.safeStats?.crackedToday ?? 0} cls="text-blue-400" />
        <Stat label="🔁 Attempts Left Today" value={st.attemptsRemaining ?? 0} cls="text-amber-400" />
        <Stat label="💰 Total Winnings" value={fmtMoney(st.safeStats?.totalWinnings ?? 0)} cls="text-yellow-400" />
      </div>

      <Card title="Enter Combination" icon={<Lock className="size-4 text-amber-400" />}>
        <div className="text-[11px] text-muted-foreground mb-2">Enter 5 numbers between 1 and 9. Guess costs {fmtMoney(st.guessCost)}.</div>
        <div className="flex items-center gap-2 flex-wrap">
          {combo.map((d, i) => (
            <input key={i} type="number" min={1} max={9} value={d}
              onChange={e => setDigit(i, Number(e.target.value))}
              className="w-14 h-14 text-center text-xl font-black bg-background border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-500/40" />
          ))}
          <button onClick={submit} disabled={st.attemptsRemaining <= 0 || st.crackedToday}
            className="px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-xs font-black hover:brightness-110 disabled:opacity-40 transition">
            🔓 Guess ({fmtMoney(st.guessCost)})
          </button>
        </div>
        {msg && <div className={`mt-2 text-xs font-semibold ${msg.c}`}>{msg.t}</div>}
        {st.crackedToday && <div className="mt-2 text-xs text-green-400 font-bold">✅ Already cracked today. Come back tomorrow!</div>}
      </Card>

      <Card title="Safe Information" icon={<BarChart3 className="size-4 text-purple-400" />}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground text-xs">Enter 5 numbers between 1 and 9 to crack the safe.</div>
          <div className="text-muted-foreground text-xs">You can only crack the safe 1 time per day.</div>
          <div><span className="text-muted-foreground text-xs">Current Jackpot: </span><span className="text-yellow-400 font-black">{fmtMoney(st.jackpot)}</span></div>
          <div><span className="text-muted-foreground text-xs">Number of attempts: </span><span className="text-blue-400 font-black">{st.attempts}</span></div>
        </div>
        <div className="mt-3 text-xs text-amber-400/80 bg-amber-500/5 rounded p-2 border border-amber-500/10">
          💡 Clue #1 — There are exactly <b className="text-amber-300">{st.evenCount}</b> even numbers today.
        </div>
      </Card>
    </div>
  );
}

/* ═════════════════ STOCK MARKET ═════════════════ */
export function StockMarketPage() {
  const st = useQuery(api.worldSystem.getStockState) as any;
  const buy = useMutation(api.worldSystem.buyStock);
  const sell = useMutation(api.worldSystem.sellStock);
  const short = useMutation(api.worldSystem.shortStock);
  const [show, setShow] = useState(6);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [sl, setSl] = useState(0);
  const [tp, setTp] = useState(0);
  const [qSearch, setQSearch] = useState("");
  const [msg, setMsg] = useState<{ t: string; c: string } | null>(null);

  if (!st) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const run = async (fn: any, ok: string) => {
    try { await fn(); setMsg({ t: ok, c: "text-green-400" }); } catch (e: any) { setMsg({ t: e.message || "Error", c: "text-red-400" }); }
  };
  const q = (id: string) => Math.max(1, Number(qty[id] || 1));

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon={<BarChart3 className="size-7 text-green-400" />} title="Stock Market" />
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total Trades" value={st.stats?.trades ?? 0} cls="text-blue-400" />
        <Stat label="Total Profit" value={fmtPts(st.overallProfit ?? 0) + " pts"} cls={st.overallProfit >= 0 ? "text-green-400" : "text-red-400"} />
        <Stat label="Current Profit" value={fmtPts(st.currentProfit ?? 0) + " pts"} cls={st.currentProfit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      <Card title="Market Ticker" icon={<TrendingUp className="size-4 text-green-400" />}>
        <div className="mb-2 flex items-center gap-2">
          <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="Search stocks…"
            className="w-56 bg-background border border-border rounded-lg px-3 py-1.5 text-xs placeholder:text-muted-foreground outline-none focus:border-green-500/40" />
          <span className="text-[9px] text-muted-foreground">Updated continuously · prices in points</span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-muted-foreground pb-1 border-b border-border">
          <span>Stock</span><span className="text-right">3 Hours</span><span className="text-right">1 Day</span><span className="text-right">3 Days</span><span className="text-right">1 Week</span>
        </div>
        <div className="space-y-1.5 mt-1.5">
          {st.stocks
            .filter((s: any) => !qSearch || `${s.name} ${s.symbol}`.toLowerCase().includes(qSearch.toLowerCase()))
            .slice(0, show).map((s: any) => {
              const w1 = s.changes?.["1w"] ?? 0;
              return (
                <div key={s.id} className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg p-2 hover:bg-muted/40 transition-colors">
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm ${w1 >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>{s.symbol?.charAt(0) ?? "₿"}</span>
                  <div className="w-40 min-w-0"><span className="font-bold text-foreground truncate block">{s.name}</span></div>
                  <div className="hidden sm:block flex-1 overflow-hidden"><span className="font-mono text-white">${fmtPts(s.price)}</span></div>
                  {["3h", "1d", "3d", "1w"].map(k => {
                    const c = s.changes[k];
                    const up = c >= 0;
                    return (
                      <div key={k} className={`flex-1 text-right font-mono ${up ? "text-green-400" : "text-red-400"}`}>
                        <span className="mr-1 text-[8px]">{up ? "▲" : "▼"}</span>{up ? "+" : ""}{c.toFixed(2)}%
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
        {st.stocks.length > show && (
          <button onClick={() => setShow(show + 6)} className="mt-2 text-xs text-primary underline">Show More</button>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <input type="number" min={1} value={qty["_"] || 1} onChange={e => setQty({ ...qty, _: Number(e.target.value) })} placeholder="Qty" className="w-20 bg-background border border-border rounded px-2 py-1 text-xs" />
          <input type="number" min={0} value={sl} onChange={e => setSl(Number(e.target.value))} placeholder="Stop Loss %" className="w-28 bg-background border border-border rounded px-2 py-1 text-xs" />
          <input type="number" min={0} value={tp} onChange={e => setTp(Number(e.target.value))} placeholder="Take Profit %" className="w-28 bg-background border border-border rounded px-2 py-1 text-xs" />
          <span className="text-[10px] text-muted-foreground">Pick a stock below then Buy / Short.</span>
        </div>
      </Card>

      <Card title="Purchase Stocks · Active Investments" icon={<Coins className="size-4 text-yellow-400" />}>
        {msg && <div className={`text-xs font-semibold mb-2 ${msg.c}`}>{msg.t}</div>}
        <div className="space-y-2">
          {st.stocks.slice(0, Math.min(6, st.stocks.length)).map((s: any) => (
            <div key={s.id} className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg p-2">
              <span className="font-black text-foreground">{s.symbol}</span>
              <span className="text-muted-foreground flex-1">{s.name}</span>
              <span className="font-mono text-green-400">${fmtPts(s.price)}</span>
              <button onClick={() => run(() => buy({ id: s.id, qty: q("_"), stopLoss: sl, takeProfit: tp }), `Bought ${q("_")}x ${s.symbol}`)} className="px-3 py-1 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700">Buy</button>
              <button onClick={() => run(() => short({ id: s.id, qty: q("_"), stopLoss: sl, takeProfit: tp }), `Shorted ${q("_")}x ${s.symbol}`)} className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700">Short</button>
            </div>
          ))}
        </div>

        <div className="text-xs font-bold text-amber-300 mt-3">Sell Stocks</div>
        {(st.holdings && st.holdings.length) ? (
          <div className="space-y-1.5 mt-1">
            {st.holdings.map((h: any, i: number) => {
              const def = st.stocks.find((s: any) => s.id === h.pid);
              const pnl = h.type === "long" ? (def?.price - h.entry) * h.qty : (h.entry - def?.price) * h.qty;
              return (
                <div key={i} className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg p-2">
                  <span className="font-bold">{def?.symbol ?? "?"}</span>
                  <span className="text-muted-foreground">{h.type === "long" ? "Long" : "Short"} ×{h.qty}</span>
                  <span className="flex-1 font-mono">@ {fmtPts(h.entry)}</span>
                  <span className={`font-mono ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{pnl >= 0 ? "+" : ""}{fmtPts(pnl)}</span>
                  <button onClick={() => run(() => sell({ holdId: i }), "Position closed")} className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">Sell</button>
                </div>
              );
            })}
          </div>
        ) : <div className="text-[11px] text-muted-foreground mt-1">You currently have no active investments!</div>}
      </Card>

      <Card title="Transaction History" icon={<RefreshCw className="size-4 text-slate-300" />}>
        {(st.stats?.history && st.stats.history.length) ? (
          <div className="space-y-1">
            {st.stats.history.slice(0, 10).map((h: any, i: number) => (
              <div key={i} className="flex justify-between text-[11px] bg-muted/20 rounded px-2 py-1">
                <span className="text-slate-300">{h.kind} {h.stock} ×{h.qty}</span>
                <span className="font-mono text-green-400">@ {fmtPts(h.price)}</span>
                {h.profit !== undefined && <span className={`font-mono ${h.profit >= 0 ? "text-green-400" : "text-red-400"}`}>{h.profit >= 0 ? "+" : ""}{fmtPts(h.profit)}</span>}
              </div>
            ))}
          </div>
        ) : <div className="text-[11px] text-muted-foreground">No trades yet.</div>}
      </Card>
    </div>
  );
}

/* ═════════════════ SUPPLY RUNNING ═════════════════ */
export function SupplyRunningPage() {
  const st = useQuery(api.worldSystem.getSupplyState) as any;
  const buy = useMutation(api.worldSystem.buySupplies);
  const sell = useMutation(api.worldSystem.sellSupplies);
  const [amt, setAmt] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ t: string; c: string } | null>(null);

  if (!st) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const run = async (fn: any, ok: string) => {
    try { await fn(); setMsg({ t: ok, c: "text-green-400" }); } catch (e: any) { setMsg({ t: e.message || "Error", c: "text-red-400" }); }
  };
  const rotMs = st.priceRotation ?? 0;
  const hh = Math.floor(rotMs / 3600000), mm = Math.floor((rotMs % 3600000) / 60000), ss = Math.floor((rotMs % 60000) / 1000);

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon={<Boxes className="size-7 text-orange-400" />} title="Supply Running" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Profit Today" value={fmtMoney(st.stats?.profitToday ?? 0)} cls="text-green-400" />
        <Stat label="Profit This Week" value={fmtMoney(st.stats?.profitWeek ?? 0)} cls="text-blue-400" />
        <Stat label="Runs This Week" value={st.stats?.runsWeek ?? 0} cls="text-amber-400" />
        <Stat label="Runs All Time" value={st.stats?.runsAll ?? 0} cls="text-purple-400" />
      </div>

      <div className="flex items-center gap-3 text-xs flex-wrap">
        <span className={`px-2 py-1 rounded-full border ${new Date().getHours() % 2 === 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}`}>🌡️ Car Travel</span>
        <span className="text-muted-foreground">⏳ Price rotation in <b className="text-amber-400">{hh}h {mm}m {ss}s</b> · Units Allowed: <b className="text-blue-400">{st.unitsAllowed}</b> · Return runs today: <b className="text-green-400">{st.returnRunsToday ?? 0}/500</b></span>
      </div>

      <Card title={`Supply Runs — ${st.city}`} icon={<Package className="size-4 text-orange-400" />}>
        {msg && <div className={`text-xs font-semibold mb-2 ${msg.c}`}>{msg.t}</div>}
        <div className="space-y-2">
          {(st.rates || []).map((r: any) => (
            <div key={r.id} className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg p-2">
              <span>{r.icon}</span>
              <span className="font-bold text-foreground w-32">{r.name}</span>
              <span className="text-muted-foreground">Buy ${fmtInt(r.price)} / Sell ${fmtInt(r.sell)}</span>
              <span className="text-muted-foreground flex-1">Carrying: <b className="text-amber-400">{st.carried?.[r.id] ?? 0}</b> crates</span>
              <input type="number" min={1} value={amt[r.id] || 1} onChange={e => setAmt({ ...amt, [r.id]: Number(e.target.value) })} className="w-16 bg-background border border-border rounded px-2 py-1 text-xs" />
              <button onClick={() => run(() => buy({ id: r.id, qty: amt[r.id] || 1 }), `Purchased ${amt[r.id] || 1} ${r.name}`)} className="px-3 py-1 bg-orange-600 text-white rounded text-[10px] font-bold">Buy</button>
              <button onClick={() => run(() => sell({ id: r.id, qty: amt[r.id] || 1 }), `Sold ${amt[r.id] || 1} ${r.name}`)} className="px-3 py-1 bg-green-600 text-white rounded text-[10px] font-bold">Sell</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═════════════════ REAL ESTATE ═════════════════ */
export function RealEstatePage() {
  const st = useQuery(api.worldSystem.getEstateState) as any;
  const buyProp = useMutation(api.worldSystem.buyProperty);
  const upgrade = useMutation(api.worldSystem.upgradeProperty);
  const collect = useMutation(api.worldSystem.collectEstateRent);
  const sellProp = useMutation(api.worldSystem.sellProperty);
  const [tab, setTab] = useState<"buy" | "portfolio">("buy");
  const [confirmSell, setConfirmSell] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: string; c: string } | null>(null);

  if (!st) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const run = async (fn: any, ok: string) => {
    try { await fn(); setMsg({ t: ok, c: "text-green-400" }); } catch (e: any) { setMsg({ t: e.message || "Error", c: "text-red-400" }); }
  };
  const priceOf = (loc: string) => (st.locations || []).find((l: any) => l.name === loc)?.price ?? 0;
  const owned: any[] = st.owned ?? [];
  const portValue = owned.reduce((sum, p) => sum + priceOf(p.location) * (1 + 0.15 * (p.upgrades ?? 0)), 0);
  const rentOf = (loc: string) => (st.locations || []).find((l: any) => l.name === loc)?.baseRent ?? 0;
  const dailyIncome = owned.filter((p) => p.constructed).reduce((sum, p) => sum + rentOf(p.location) * (1 + 0.5 * (p.upgrades ?? 0)), 0);
  const resaleOf = (p: any) => Math.floor(priceOf(p.location) * 0.7 * (1 + 0.15 * (p.upgrades ?? 0)));
  const estateName = ["Seaside Estate", "High-Rise Penthouse", "Downtown Office Block", "Warehouse District", "Villa District", "Skyline Tower", "Old Town Court", "Industrial Park", "Riverside Lofts", "Boulevard Plaza"];
  const mood = (n: number) => estateName[n % estateName.length];

  return (
    <div className="animate-fade-in space-y-4">
      {/* Agency header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 p-5">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, #3b82f622 0, transparent 45%), radial-gradient(circle at 85% 75%, #0ea5e926 0, transparent 40%)" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Building2 className="size-9 text-blue-400" />
            <div>
              <h1 className="text-2xl font-black tracking-widest text-blue-300">ESTATE AGENCY</h1>
              <p className="text-[11px] text-slate-400">Property management & high-value flipping. Buy low, build up, sell higher — rent pays while you wait.</p>
            </div>
          </div>
          <div className="flex gap-2 text-center">
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
              <div className="text-sm font-black text-emerald-400">{fmtMoney(portValue)}</div>
              <div className="text-[8px] uppercase tracking-wider text-slate-500">Portfolio value</div>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
              <div className="text-sm font-black text-green-400">{fmtMoney(dailyIncome)}/day</div>
              <div className="text-[8px] uppercase tracking-wider text-slate-500">Rental income</div>
            </div>
          </div>
        </div>
      </div>

      {msg && <div className={`text-xs font-semibold ${msg.c}`}>{msg.t}</div>}

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-3">
        <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-950/70 p-1">
          {([["buy", "Buy Properties"], ["portfolio", "My Portfolio"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-[10px] font-black tracking-wide transition-all ${tab === id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>{label}</button>
          ))}
        </div>
        <button onClick={() => run(() => collect({}), owned.filter(p => p.constructed).length ? `Rent collected — +${fmtMoney(st.lastRent ?? 0)}` : "Rent collected")}
          className="rounded-xl bg-emerald-600 px-5 py-2 text-[11px] font-black text-white hover:bg-emerald-500 transition-all">💰 Collect Property Rent</button>
        <span className="text-[10px] text-slate-500">Construction {st.constructionDays}d · max upgrades {st.maxUpgrades}</span>
      </div>

      {tab === "buy" ? (
        <div className="grid gap-2 md:grid-cols-2">
          {(st.locations || []).map((l: any, i: number) => {
            const ownedHere = owned.some((p: any) => p.location === l.name);
            return (
              <div key={l.name} className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 hover:border-blue-500/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-white">{i % 3 === 0 ? "🏘️ " : i % 3 === 1 ? "🏢 " : "🏡 "}{l.name}</div>
                    <div className="text-[10px] text-slate-500">{mood(i)} · {l.propertyType}</div>
                    <div className="mt-1 text-[9px] text-purple-300/80">{l.perk}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase text-slate-500">Price</div>
                    <div className="text-sm font-black text-yellow-400">{fmtMoney(l.price)}</div>
                    <div className="text-[9px] text-green-400">rent {fmtMoney(l.baseRent)}/day</div>
                  </div>
                </div>
                {ownedHere ? (
                  <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-center text-[10px] font-black text-green-400">OWNED — view in portfolio</div>
                ) : (
                  <button onClick={() => run(() => buyProp({ location: l.name }), `Bought ${l.name}! Construction starts immediately.`)}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 py-2.5 text-[10px] font-black tracking-wider text-white hover:from-blue-500 hover:to-sky-500 transition-all">BUY — {fmtMoney(l.price)}</button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {owned.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/60 py-14 text-center">
              <div className="text-4xl">🏗️</div>
              <div className="mt-2 text-sm font-bold text-slate-400">Your portfolio is empty</div>
              <p className="text-[10px] text-slate-600">Buy your first location and start building an empire — land only appreciates with upgrades.</p>
            </div>
          ) : owned.map((p: any) => (
            <div key={p.location} className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white">{p.location}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[9px]">
                    <span className={`rounded-full px-2 py-0.5 font-bold ${p.constructed ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                      {p.constructed ? "✅ Built" : "🚧 Under construction"}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-400">Upgrades {p.upgrades}/{st.maxUpgrades}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-400">Resale {fmtMoney(resaleOf(p))}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-500">Rental income</div>
                  <div className="text-sm font-black text-green-400">+{fmtMoney(rentOf(p.location) * (1 + 0.5 * (p.upgrades ?? 0)))}/day</div>
                </div>
                <div className="flex gap-2">
                  {p.constructed && (p.upgrades ?? 0) < st.maxUpgrades && (
                    <button onClick={() => run(() => upgrade({ location: p.location }), `Upgraded ${p.location}!`)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-[10px] font-black text-white hover:bg-blue-500">UPGRADE</button>
                  )}
                  {confirmSell === p.location ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => run(() => sellProp({ location: p.location }).then((r: any) => ({ t: `Sold ${p.location} for ${fmtMoney(r.resale)}`, c: "text-green-400" })), `Flipped ${p.location}!`)}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white hover:bg-emerald-500">SELL ${fmtMoney(resaleOf(p))}</button>
                      <button onClick={() => setConfirmSell(null)} className="rounded-xl bg-slate-800 px-3 py-2 text-[10px] text-slate-300">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmSell(p.location)}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-[10px] font-black text-red-400 hover:bg-red-500/20">FLIP</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {owned.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[10px] text-amber-200/70">
              💡 Flipping tip: each upgrade adds <b>15%</b> to your resale value and <b>50%</b> to rent. Build, upgrade, then sell high for a tidy profit — construction takes {st.constructionDays} days.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════ DEAD / ALIVE ═════════════════ */
export function DeadAlivePage() {
  const st = useQuery(api.worldSystem.getLinkedAccounts) as any;
  const transfer = useMutation(api.worldSystem.deadAliveTransfer);
  const [uName, setUName] = useState("");
  const [msg, setMsg] = useState<{ t: string; c: string } | null>(null);

  if (!st) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const run = async () => {
    try {
      const r = await transfer({ username: uName });
      setMsg({ t: r.empty ? "No retrievable items on that account." : r.results.join(" · "), c: r.empty ? "text-amber-400" : "text-green-400" });
    } catch (e: any) { setMsg({ t: e.message || "Error", c: "text-red-400" }); }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon={<Skull className="size-7 text-red-400" />} title="Dead / Alive Transfer" />
      <div className="text-[11px] text-muted-foreground bg-red-500/5 border border-red-500/20 rounded-lg p-2">
        ⚠️ Upon using Dead/Alive you will lose civilian protection. Transfer valuables from your dead characters to your main account (taxes apply).
      </div>
      {msg && <div className={`text-xs font-semibold ${msg.c}`}>{msg.t}</div>}

      <Card title="Transfer" icon={<Upload className="size-4 text-red-400" />}>
        <div className="flex flex-wrap items-end gap-2">
          <input value={uName} onChange={e => setUName(e.target.value)} placeholder="Dead account username" className="w-56 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <button onClick={run} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition">Transfer → </button>
        </div>
        <div className="mt-3 text-[11px] text-muted-foreground space-y-0.5">
          <div>Points · Swiss Bank · Scraps · Packs · Stocks — <b className="text-red-400">5% tax</b></div>
          <div>Bullets · Perks — <b className="text-red-400">25% tax</b></div>
          <div>Coins · Mission Skips · Exotic Cars · Notepad — <b className="text-green-400">free</b></div>
        </div>
      </Card>

      <Card title="Linked Accounts" icon={<RefreshCw className="size-4 text-blue-400" />}>
        {(st.accounts && st.accounts.length) ? (
          <div className="space-y-1.5">
            {st.accounts.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg p-2">
                <span className={a.alive ? "text-green-400" : "text-red-400"}>{a.alive ? "● Alive" : "💀 Dead"}</span>
                <span className="font-bold flex-1">{a.username}</span>
                <span className="text-yellow-400">{fmtPts(a.points)} pts</span>
                <span className="text-green-400">{fmtMoney(a.bank)}</span>
              </div>
            ))}
          </div>
        ) : <div className="text-[11px] text-muted-foreground">No other accounts found linked to your email.</div>}
      </Card>
    </div>
  );
}
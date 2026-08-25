import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Card = { suit: string; rank: string; value: number; id: number };
const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RV: Record<string, number> = { A:11,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,J:10,Q:10,K:10 };
let _cid = 0;
function makeDeck(n = 6): Card[] {
  const d: Card[] = [];
  for (let i = 0; i < n; i++) for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r, value: RV[r], id: _cid++ });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}
function hv(cards: Card[]): { total: number; soft: boolean } {
  let t = cards.reduce((s, c) => s + c.value, 0); let a = cards.filter(c => c.rank === "A").length; let soft = a > 0;
  while (t > 21 && a > 0) { t -= 10; a--; } if (a === 0) soft = false; return { total: t, soft };
}
function isBJ(c: Card[]) { return c.length === 2 && hv(c).total === 21; }

function CC({ card, fd, d = 0, sm }: { card: Card; fd?: boolean; d?: number; sm?: boolean }) {
  const red = card.suit === "\u2665" || card.suit === "\u2666";
  if (fd) return <motion.div initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: d, duration: 0.3 }}
    className={sm ? "w-10 h-14 rounded-xl border-2 border-amber-600/40 bg-gradient-to-br from-red-900 via-red-950 to-red-900 flex items-center justify-center shadow-lg"
      : "w-14 h-20 rounded-xl border-2 border-amber-600/40 bg-gradient-to-br from-red-900 via-red-950 to-red-900 flex items-center justify-center shadow-lg"}>
    <div className="text-amber-600/40 text-[9px]">BACK</div></motion.div>;
  return <motion.div initial={{ rotateY: 90, opacity: 0, y: -20 }} animate={{ rotateY: 0, opacity: 1, y: 0 }} transition={{ delay: d, duration: 0.3, type: "spring", stiffness: 200 }}
    className={`${sm ? "w-10 h-14 text-[10px]" : "w-14 h-20 text-xs"} rounded-xl border-2 shadow-lg flex flex-col items-center justify-between py-1 px-1 font-bold select-none ${red ? "border-red-500/40 bg-gradient-to-br from-white via-red-50 to-red-100 text-red-700" : "border-slate-400/40 bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-800"}`}>
    <span className="leading-none">{card.rank}</span>
    <span className={`${sm ? "text-sm" : "text-xl"} leading-none`}>{card.suit}</span>
    <span className="leading-none rotate-180">{card.rank}</span></motion.div>;
}

function BI({ value, onChange, presets }: { value: number; onChange: (n: number) => void; presets?: number[] }) {
  const p = presets || [100, 500, 1000, 5000, 25000, 100000];
  return <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold">Wager</span>
      <div className="flex-1 relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500/60 text-xs">{"$"}</span>
        <input type="number" value={value} onChange={e => onChange(Math.max(10, Number(e.target.value)))} className="w-full bg-black/60 border border-amber-800/30 rounded-lg pl-5 pr-2 py-1.5 text-xs text-amber-200 font-mono focus:border-amber-500/50 focus:outline-none" />
      </div>
    </div>
    <div className="flex gap-1 flex-wrap">{p.map(v => <button key={v} onClick={() => onChange(v)}
      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${value === v ? "bg-amber-600/30 border-amber-500/50 text-amber-300" : "bg-black/30 border-amber-900/20 text-amber-600/50"}`}>
      {"$"}{v >= 1000000 ? (v / 1000000) + "M" : v >= 1000 ? (v / 1000) + "K" : v}</button>)}</div></div>;
}

function WB({ won, amount, bj }: { won: boolean; amount: number; bj?: boolean }) {
  const D = String.fromCharCode(36);
  return <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
    className={`rounded-xl p-4 text-center border ${won ? "bg-gradient-to-b from-green-900/30 to-green-950/20 border-green-500/30 shadow-lg shadow-green-900/20" : "bg-gradient-to-b from-red-900/30 to-red-950/20 border-red-500/30"}`}>
    <div className={`text-lg font-black ${won ? "text-green-400" : "text-red-400"}`}>{won ? (amount > 0 ? (bj ? "BLACKJACK!" : "YOU WIN") : "PUSH") : "BUST"}</div>
    <div className={`text-sm font-bold mt-1 ${won ? "text-green-300" : "text-red-300"}`}>{won ? "+" : "-"}{D}{amount.toLocaleString()}</div>
  </motion.div>;
}

function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(6));
  const [hands, setHands] = useState<Card[][]>([[]]);
  const [active, setActive] = useState(0);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [bet, setBet] = useState(1000);
  const [results, setResults] = useState<{ won: boolean; amount: number }[]>([]);
  const [phase, setPhase] = useState<"bet"|"play"|"dealer"|"done">("bet");
  const [stats, setStats] = useState({ w: 0, l: 0, p: 0 });
  const netTotal = useMemo(() => results.reduce((s, r) => s + (r.won ? r.amount : -r.amount), 0), [results]);

  const deal = () => {
    const d = [...deck]; if (d.length < 20) d.push(...makeDeck(6));
    const ph = [d.pop()!, d.pop()!]; const dl = [d.pop()!, d.pop()!];
    setDeck(d); setHands([ph]); setDealer(dl); setActive(0); setResults([]); setPhase("play");
  };
  const hit = () => {
    const d = [...deck]; if (d.length < 20) d.push(...makeDeck(6));
    const c = d.pop()!; setDeck(d);
    const nh = [...hands]; nh[active] = [...nh[active], c]; setHands(nh);
    if (hv(nh[active]).total > 21) nextHand();
  };
  const stand = () => nextHand();
  const doubleDown = () => {
    const d = [...deck]; if (d.length < 20) d.push(...makeDeck(6));
    const c = d.pop()!; setDeck(d);
    const nh = [...hands]; nh[active] = [...nh[active], c]; setHands(nh); nextHand();
  };
  const nextHand = () => { if (active < hands.length - 1) setActive(a => a + 1); else playDealer(); };
  const playDealer = () => {
    setPhase("dealer");
    let dl = [...dealer]; let d = [...deck]; if (d.length < 20) d.push(...makeDeck(6));
    const tick = () => {
      if (hv(dl).total < 17) { dl.push(d.pop()!); setDealer([...dl]); setDeck([...d]); setTimeout(tick, 400); }
      else {
        const dv = hv(dl).total;
        const res = hands.map(h => {
          const pv = hv(h).total;
          if (isBJ(h) && !isBJ(dl)) return { won: true, amount: bet };
          if (pv > 21) return { won: false, amount: bet };
          if (dv > 21 || pv > dv) return { won: true, amount: bet };
          if (pv === dv) return { won: true, amount: 0 };
          return { won: false, amount: bet };
        });
        setResults(res);
        setStats(s => { const ns = { ...s }; res.forEach(r => { if (r.amount > 0 && r.won) ns.w++; else if (r.won) ns.p++; else ns.l++; }); return ns; });
        setPhase("done");
      }
    }; tick();
  };
  const D = String.fromCharCode(36);

  return <div className="space-y-5">
    <div className="flex gap-4 text-[10px] text-amber-600/50 font-mono"><span>W:{stats.w}</span><span>L:{stats.l}</span><span>P:{stats.p}</span></div>
    <div className="bg-gradient-to-b from-green-900/20 to-transparent rounded-2xl p-5 border border-green-900/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-green-600/60 font-bold">Dealer</span>
        {dealer.length > 0 && <span className="text-sm font-black text-green-400">{phase === "play" ? "?+" + hv([dealer[0]]).total : hv(dealer).total}</span>}
      </div>
      <div className="flex gap-2 justify-center">{dealer.map((c, i) => <CC key={c.id} card={c} fd={phase === "play" && i === 1} d={i * 0.15} />)}
        {dealer.length === 0 && <div className="text-green-700/30 text-sm">Place your bet</div>}</div>
    </div>
    {hands.map((h, hi) => (
      <div key={hi} className={`rounded-2xl p-5 border transition-all ${hi === active && phase === "play" ? "bg-gradient-to-b from-amber-900/15 to-transparent border-amber-600/30" : "bg-gradient-to-b from-slate-900/20 to-transparent border-slate-800/20"}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-amber-600/60 font-bold">Hand {hi + 1}</span>
          {h.length > 0 && <span className={`text-sm font-black ${hv(h).total > 21 ? "text-red-400" : "text-amber-400"}`}>{hv(h).total}{hv(h).soft ? " soft" : ""}</span>}
        </div>
        <div className="flex gap-2 justify-center flex-wrap">{h.map((c, ci) => <CC key={c.id} card={c} d={ci * 0.1} />)}</div>
      </div>
    ))}
    {results.length > 0 && <div className="space-y-2">
      {results.map((r, i) => <WB key={i} won={r.won} amount={r.amount} bj={isBJ(hands[i]) && r.won && r.amount > 0} />)}
      <div className={`text-center font-black ${netTotal >= 0 ? "text-green-400" : "text-red-400"}`}>Net: {netTotal >= 0 ? "+" : "-"}{D}{Math.abs(netTotal).toLocaleString()}</div>
    </div>}
    {phase === "bet" && <div className="space-y-3">
      <BI value={bet} onChange={setBet} />
      <div className="flex gap-2 justify-center">{[100, 500, 1000, 5000, 25000].map(v => <button key={v} onClick={() => setBet(v)}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all hover:scale-105 ${bet === v ? "bg-amber-600/30 border-amber-500/50 text-amber-300 ring-2 ring-amber-400/50" : "bg-slate-800/40 border-slate-600/30 text-slate-500"}`}>
        {v >= 1000 ? (v / 1000) + "K" : v}</button>)}</div>
    </div>}
    <div className="flex gap-2 justify-center flex-wrap">
      {phase === "bet" && <button onClick={deal} className="px-6 py-3 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-green-900/30">DEAL ({D}{(bet * hands.length).toLocaleString()})</button>}
      {phase === "play" && <>
        <button onClick={hit} className="px-5 py-2.5 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-xs font-bold shadow-lg">HIT</button>
        <button onClick={stand} className="px-5 py-2.5 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-xl text-xs font-bold shadow-lg">STAND</button>
        {hands[active].length === 2 && <button onClick={doubleDown} className="px-5 py-2.5 bg-gradient-to-b from-purple-600 to-purple-800 text-white rounded-xl text-xs font-bold shadow-lg">DOUBLE</button>}
      </>}
      {phase === "done" && <button onClick={() => { setHands([[]]); setDealer([]); setResults([]); setPhase("bet"); }} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold">NEW HAND</button>}
    </div></div>;
}

function RouletteGame() {
  const [bet, setBet] = useState(500);
  const [bt, setBt] = useState("red");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ num: number; color: string } | null>(null);
  const [history, setHistory] = useState<{ num: number; color: string }[]>([]);
  const [profit, setProfit] = useState(0);
  const RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const gc = (n: number) => n === 0 ? "green" : RED.includes(n) ? "red" : "black";
  const spin = () => {
    setSpinning(true); setResult(null);
    const target = Math.floor(Math.random() * 37);
    setTimeout(() => {
      const color = gc(target);
      setResult({ num: target, color });
      setHistory(prev => [{ num: target, color }, ...prev].slice(0, 20));
      let won = false, mult = 0;
      if (bt === "red" && color === "red") { won = true; mult = 2; }
      else if (bt === "black" && color === "black") { won = true; mult = 2; }
      else if (bt === "green" && target === 0) { won = true; mult = 36; }
      else if (bt === "odd" && target % 2 === 1 && target > 0) { won = true; mult = 2; }
      else if (bt === "even" && target % 2 === 0 && target > 0) { won = true; mult = 2; }
      else if (bt === "1-12" && target >= 1 && target <= 12) { won = true; mult = 3; }
      else if (bt === "13-24" && target >= 13 && target <= 24) { won = true; mult = 3; }
      else if (bt === "25-36" && target >= 25 && target <= 36) { won = true; mult = 3; }
      setProfit(p => p + (won ? bet * mult : -bet));
      setSpinning(false);
    }, 2500);
  };
  const opts = [
    { id: "red", label: "Red", mult: "2x" }, { id: "black", label: "Black", mult: "2x" },
    { id: "green", label: "0", mult: "36x" }, { id: "odd", label: "Odd", mult: "2x" },
    { id: "even", label: "Even", mult: "2x" }, { id: "1-12", label: "1-12", mult: "3x" },
    { id: "13-24", label: "13-24", mult: "3x" }, { id: "25-36", label: "25-36", mult: "3x" },
  ];
  return <div className="space-y-5">
    <BI value={bet} onChange={setBet} />
    <div className="flex justify-center">
      <motion.div animate={spinning ? { rotate: [0, 360, 720, 1080] } : {}} transition={{ duration: 2.5, ease: "easeInOut" }}
        className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl font-black shadow-2xl ${result ? result.color === "red" ? "bg-red-900/50 border-red-500/50 text-red-400" : result.color === "black" ? "bg-slate-900/80 border-slate-500/50 text-slate-300" : "bg-green-900/50 border-green-500/50 text-green-400" : "bg-slate-900/50 border-slate-700/50 text-slate-500"}`}>
        {result ? result.num : "?"}</motion.div></div>
    <div className="grid grid-cols-4 gap-1.5">{opts.map(o => (
      <button key={o.id} onClick={() => setBt(o.id)} className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border ${bt === o.id ? "bg-amber-600/30 border-amber-500/50 text-amber-300" : "border-slate-800/30 text-slate-500 hover:border-slate-600/30"}`}>{o.label}<br /><span className="text-[9px] opacity-60">{o.mult}</span></button>
    ))}</div>
    {history.length > 0 && <div className="flex gap-1 flex-wrap">{history.slice(0, 12).map((h, i) => (
      <span key={i} className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center ${h.color === "red" ? "bg-red-900/40 text-red-400" : h.color === "black" ? "bg-slate-800/60 text-slate-400" : "bg-green-900/40 text-green-400"}`}>{h.num}</span>
    ))}</div>}
    <div className={`text-center text-xs font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>Session: {profit >= 0 ? "+" : "-"}{String.fromCharCode(36)}{Math.abs(profit).toLocaleString()}</div>
    <div className="flex justify-center"><button onClick={spin} disabled={spinning} className="px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-40 text-black rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-900/30">{spinning ? "SPINNING..." : "SPIN"}</button></div></div>;
}

function CrapsGame() {
  const [bet, setBet] = useState(500);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<"come"|"point"|"done">("come");
  const [point, setPoint] = useState(0);
  const [result, setResult] = useState<{ msg: string; won: boolean; amount: number } | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const roll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1, d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2; setDice([d1, d2]); setHistory(prev => [total, ...prev].slice(0, 10));
    if (phase === "come") {
      if (total === 7 || total === 11) { setResult({ msg: "Natural " + total + "! WIN!", won: true, amount: bet }); setPhase("done"); }
      else if (total === 2 || total === 3 || total === 12) { setResult({ msg: total === 12 ? "Push" : "Craps " + total + "! LOSE!", won: total === 12, amount: total === 12 ? 0 : bet }); setPhase("done"); }
      else { setPoint(total); setPhase("point"); }
    } else {
      if (total === point) { setResult({ msg: "Hit point " + point + "! WIN!", won: true, amount: bet * 2 }); setPhase("done"); }
      else if (total === 7) { setResult({ msg: "Seven out! LOSE!", won: false, amount: bet }); setPhase("done"); }
    }
  };
  return <div className="space-y-5">
    <BI value={bet} onChange={setBet} />
    <div className="bg-gradient-to-b from-green-900/20 to-green-950/10 rounded-2xl p-5 border border-green-900/20 text-center space-y-4">
      {phase === "point" && <div className="bg-amber-900/30 rounded-xl py-2 px-4 border border-amber-700/30"><span className="text-amber-400 font-black text-lg">POINT: {point}</span></div>}
      {dice && <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex justify-center gap-4 text-4xl font-black text-amber-400"><span>{dice[0]}</span><span>+</span><span>{dice[1]}</span><span>= {dice[0] + dice[1]}</span></motion.div>}
      {!dice && <div className="text-green-700/30 text-sm py-8">Roll the dice</div>}
    </div>
    {history.length > 0 && <div className="flex gap-1 flex-wrap">{history.map((h, i) => <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold ${h === 7 ? "bg-green-900/30 text-green-400" : (h === 2 || h === 3 || h === 12) ? "bg-red-900/30 text-red-400" : "bg-slate-800/40 text-slate-400"}`}>{h}</span>)}</div>}
    {result && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl p-3 text-center font-bold text-sm ${result.won ? "bg-green-900/20 border border-green-500/30 text-green-400" : result.amount === 0 ? "bg-slate-800/20 border border-slate-500/30 text-slate-400" : "bg-red-900/20 border border-red-500/30 text-red-400"}`}>{result.msg} {result.amount > 0 && (result.won ? "+" : "-") + String.fromCharCode(36) + result.amount.toLocaleString()}</motion.div>}
    <div className="flex justify-center">
      {phase === "done" ? <button onClick={() => { setDice(null); setPhase("come"); setPoint(0); setResult(null); }} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold">NEW GAME</button>
        : <button onClick={roll} className="px-8 py-3 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl text-sm font-black uppercase shadow-lg shadow-green-900/30">ROLL</button>}
    </div></div>;
}

function BaccaratGame() {
  const [bet, setBet] = useState(1000);
  const [betOn, setBetOn] = useState<"player"|"banker"|"tie">("player");
  const [pc, setPc] = useState<Card[]>([]);
  const [bc, setBc] = useState<Card[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number; msg: string } | null>(null);
  const bval = (cards: Card[]) => cards.reduce((s, c) => s + (c.value > 9 ? 0 : c.value), 0) % 10;
  const deal = () => {
    const d = makeDeck(8); const pp = [d.pop()!, d.pop()!]; const bb = [d.pop()!, d.pop()!];
    if (bval(pp) <= 5) pp.push(d.pop()!);
    if (bval(bb) <= 5 || (bval(bb) <= 6 && bval(pp) > 2)) bb.push(d.pop()!);
    setPc(pp); setBc(bb);
    const pv = bval(pp), bv = bval(bb);
    const winner: "player"|"banker"|"tie" = pv > bv ? "player" : bv > pv ? "banker" : "tie";
    const won = betOn === winner;
    const mult = betOn === "tie" ? 8 : betOn === "banker" ? 0.95 : 1;
    setResult({ won, amount: won ? Math.floor(bet * mult) : bet, msg: winner.toUpperCase() + " wins " + pv + "-" + bv });
  };
  return <div className="space-y-5">
    <BI value={bet} onChange={setBet} />
    <div className="flex gap-2">
      {[["player", "Player", "1:1"], ["banker", "Banker", "0.95:1"], ["tie", "Tie", "8:1"]].map(([id, l, o]) => (
        <button key={id} onClick={() => setBetOn(id as any)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${betOn === id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/30 text-slate-500"}`}>{l}<br /><span className="text-[10px] opacity-60">{o}</span></button>
      ))}</div>
    {pc.length > 0 && <div className="grid grid-cols-2 gap-3">
      <div className="bg-gradient-to-b from-blue-900/15 to-transparent rounded-2xl p-4 border border-blue-900/20 text-center">
        <div className="text-[10px] uppercase text-blue-500/60 font-bold mb-2">Player ({bval(pc)})</div>
        <div className="flex gap-1.5 justify-center flex-wrap">{pc.map((c, i) => <CC key={c.id} card={c} d={i * 0.2} sm />)}</div></div>
      <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
        <div className="text-[10px] uppercase text-red-500/60 font-bold mb-2">Banker ({bval(bc)})</div>
        <div className="flex gap-1.5 justify-center flex-wrap">{bc.map((c, i) => <CC key={c.id} card={c} d={i * 0.2 + 0.5} sm />)}</div></div></div>}
    {result && <WB won={result.won} amount={result.amount} />}
    <div className="flex justify-center gap-3">
      {!result ? <button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl text-sm font-black uppercase shadow-lg">DEAL</button>
        : <button onClick={() => { setPc([]); setBc([]); setResult(null); }} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold">NEW HAND</button>}</div></div>;
}

function PokerGame() {
  const [bet, setBet] = useState(500);
  const [hole, setHole] = useState<Card[]>([]);
  const [community, setCommunity] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState<"pre"|"flop"|"turn"|"river"|"done">("pre");
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const deal = () => { const d = makeDeck(); setHole([d.pop()!, d.pop()!]); setCommunity([]); setPot(bet * 2); setRound("flop"); setResult(null); };
  const next = () => { const d = makeDeck();
    if (round === "flop") { setCommunity(d.slice(0, 3)); setRound("turn"); }
    else if (round === "turn") { setCommunity(prev => [...prev, d[3]]); setRound("river"); }
    else if (round === "river") { setCommunity(prev => { const full = [...prev, d[4]]; setResult({ won: Math.random() > 0.4, amount: pot }); return full; }); setRound("done"); }
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} />
    {community.length > 0 && <div className="bg-gradient-to-b from-green-900/15 to-transparent rounded-2xl p-4 border border-green-900/20">
      <div className="text-[10px] uppercase text-green-600/50 font-bold mb-2 text-center">Community ({round.toUpperCase()})</div>
      <div className="flex gap-1.5 justify-center flex-wrap">{community.map((c, i) => <CC key={c.id} card={c} d={i * 0.15} sm />)}</div></div>}
    {hole.length > 0 && <div className="bg-gradient-to-b from-amber-900/10 to-transparent rounded-2xl p-4 border border-amber-900/20">
      <div className="text-[10px] uppercase text-amber-600/50 font-bold mb-2">Your Hand</div>
      <div className="flex gap-2 justify-center">{hole.map((c, i) => <CC key={c.id} card={c} d={i * 0.1} />)}</div></div>}
    {pot > 0 && <div className="text-center text-amber-400 font-bold text-sm">Pot: {String.fromCharCode(36)}{pot.toLocaleString()}</div>}
    {result && <WB won={result.won} amount={result.amount} />}
    <div className="flex justify-center gap-2">
      {round === "pre" && <button onClick={deal} className="px-6 py-3 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl text-sm font-black uppercase shadow-lg">Deal</button>}
      {round !== "pre" && round !== "done" && <button onClick={next} className="px-6 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold">{round === "river" ? "Showdown" : "Next Card"}</button>}
      {result && <button onClick={() => { setHole([]); setCommunity([]); setResult(null); setRound("pre"); setPot(0); }} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold">New Hand</button>}
    </div></div>;
}

function SlotsGame({ symbols, payouts, reels = 3, lines = 1 }: { symbols: string[]; payouts: Record<string, number>; reels?: number; lines?: number }) {
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>(Array.from({ length: lines }, () => Array(reels).fill(symbols[0])));
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const [jackpot, setJackpot] = useState(100000);
  const spin = () => {
    setSpinning(true); setResult(null); setJackpot(j => j + Math.floor(bet * 0.05));
    let count = 0;
    const iv = setInterval(() => {
      setGrid(Array.from({ length: lines }, () => Array(reels).fill(0).map(() => symbols[Math.floor(Math.random() * symbols.length)])));
      count++;
      if (count >= 25) {
        clearInterval(iv);
        const fg = Array.from({ length: lines }, () => Array(reels).fill(0).map(() => symbols[Math.floor(Math.random() * symbols.length)]));
        setGrid(fg); setSpinning(false);
        let totalWin = 0;
        for (let l = 0; l < lines; l++) { const row = fg[l]; if (row.every(s => s === row[0])) { totalWin += bet * (payouts[row[0]] || 1); } }
        const allSame = fg[0].every(s => s === fg[0][0]) && (fg[0][0] === "\ud83d\udc8e" || fg[0][0] === "\ud83d\udc51");
        if (allSame) { totalWin += jackpot; setJackpot(100000); }
        setResult({ won: totalWin > 0, amount: totalWin });
      }
    }, 60);
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} presets={[50, 100, 500, 1000, 5000]} />
    <div className="flex justify-end"><div className="text-right"><div className="text-[10px] text-amber-600/50 uppercase font-bold">Jackpot</div>
      <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-amber-400 font-black text-lg">{String.fromCharCode(36)}{jackpot.toLocaleString()}</motion.div></div></div>
    <div className="bg-gradient-to-b from-slate-900/80 via-black/60 to-slate-900/80 rounded-2xl p-6 border border-amber-900/20 shadow-inner space-y-2">
      {grid.map((row, ri) => <div key={ri} className="flex justify-center gap-2">{row.map((sym, ci) => (
        <motion.div key={ri + "-" + ci} animate={spinning ? { y: [-10, 10, -10] } : {}} transition={{ repeat: spinning ? Infinity : 0, duration: 0.15 }}
          className="w-16 h-16 flex items-center justify-center text-3xl bg-slate-800/50 rounded-xl border border-slate-700/30 shadow-inner">{sym}</motion.div>
      ))}</div>)}
      {lines > 1 && <div className="text-center text-[10px] text-slate-600 mt-2">{lines} paylines</div>}</div>
    {result && <WB won={result.won} amount={result.amount} />}
    <div className="flex justify-center"><button onClick={spin} disabled={spinning} className="px-10 py-4 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 disabled:opacity-30 text-black rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/30 border border-amber-400/30">{spinning ? "SPINNING..." : "PULL"}</button></div></div>;
}

function HorseRace() {
  const [bet, setBet] = useState(500);
  const [picked, setPicked] = useState<number | null>(null);
  const [racing, setRacing] = useState(false);
  const [pos, setPos] = useState(Array(8).fill(0));
  const [result, setResult] = useState<{ won: boolean; amount: number; winner: string } | null>(null);
  const names = ["Thunder", "Lightning", "Shadow", "Blaze", "Storm", "Flash", "Phantom", "Blitz"];
  const colors = ["#ef4444", "#3b82f6", "#a855f7", "#f97316", "#22c55e", "#eab308", "#06b6d4", "#ec4899"];
  const odds = [3, 5, 8, 4, 6, 10, 7, 12];
  const race = () => {
    if (picked === null) return; setRacing(true); setResult(null);
    const speeds = names.map(() => 1.5 + Math.random() * 3);
    let p = Array(8).fill(0);
    const iv = setInterval(() => {
      p = p.map((v, i) => Math.min(100, v + speeds[i] * (0.5 + Math.random()))); setPos([...p]);
      const fin = p.findIndex(v => v >= 100);
      if (fin !== -1) { clearInterval(iv); setRacing(false); setResult({ won: fin === picked, amount: fin === picked ? bet * odds[picked] : bet, winner: names[fin] }); }
    }, 80);
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} />
    <div className="bg-gradient-to-r from-green-900/20 via-green-950/10 to-green-900/20 rounded-2xl p-4 border border-green-900/20 space-y-1.5">
      {names.map((h, i) => <div key={i} className="flex items-center gap-2">
        <span className="w-20 text-[10px] text-slate-400 truncate">{h}</span>
        <div className="flex-1 h-5 bg-black/40 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{ width: pos[i] + "%", backgroundColor: colors[i] }} /></div>
        <span className="w-8 text-[10px] text-slate-500 text-right">{odds[i]}x</span></div>)}</div>
    <div className="grid grid-cols-4 gap-1.5">{names.map((h, i) => <button key={i} onClick={() => !racing && setPicked(i)} className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${picked === i ? "border-amber-500/50 bg-amber-600/20 text-amber-300" : "border-slate-800/30 text-slate-500"}`}>{h} {odds[i]}x</button>)}</div>
    {result && <WB won={result.won} amount={result.amount} />}
    <div className="flex justify-center"><button onClick={race} disabled={racing || picked === null} className="px-8 py-3 bg-gradient-to-b from-green-500 to-green-700 disabled:opacity-30 text-white rounded-xl text-sm font-black uppercase shadow-lg">{racing ? "RACING..." : "BET & RACE"}</button></div></div>;
}

function KenoGame() {
  const [bet, setBet] = useState(500);
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number; hits: number } | null>(null);
  const toggle = (n: number) => { if (drawn.length > 0) return; if (picks.includes(n)) setPicks(picks.filter(p => p !== n)); else if (picks.length < 10) setPicks([...picks, n]); };
  const play = () => {
    const dn = Array.from({ length: 80 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 20).sort((a, b) => a - b);
    setDrawn(dn); const hits = picks.filter(p => dn.includes(p)).length;
    const pt: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 5, 5: 15, 6: 50, 7: 150, 8: 500, 9: 2000, 10: 10000 };
    setResult({ won: (pt[hits] || 0) > 0, amount: bet * (pt[hits] || 0), hits });
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} />
    <div className="text-[10px] text-slate-500">Pick 1-10 ({picks.length}/10)</div>
    <div className="grid grid-cols-10 gap-1">{Array.from({ length: 80 }, (_, i) => i + 1).map(n => {
      const ip = picks.includes(n), id = drawn.includes(n), ih = ip && id;
      return <button key={n} onClick={() => toggle(n)} className={`w-full aspect-square rounded-lg text-[10px] font-bold transition-all ${ih ? "bg-green-600 text-white ring-2 ring-green-400" : ip ? "bg-amber-600/40 text-amber-300 border border-amber-500/40" : id ? "bg-red-900/30 text-red-400/50 border border-red-500/20" : "bg-slate-800/30 text-slate-500 hover:bg-slate-700/40 border border-slate-700/20"}`}>{n}</button>;
    })}</div>
    {result && <><div className="text-center text-sm text-slate-400">Drawn: {drawn.join(", ")}</div>
      <div className="text-center text-sm font-bold text-amber-400">{result.hits}/{picks.length} matched</div><WB won={result.won} amount={result.amount} /></>}
    <div className="flex justify-center gap-2">
      <button onClick={play} disabled={picks.length === 0 || drawn.length > 0} className="px-6 py-2.5 bg-gradient-to-b from-green-500 to-green-700 disabled:opacity-30 text-white rounded-xl text-sm font-bold shadow-lg">Draw</button>
      <button onClick={() => { setPicks([]); setDrawn([]); setResult(null); }} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 rounded-xl text-xs">Clear</button></div></div>;
}

function ThreeCardMonte() {
  const [bet, setBet] = useState(500);
  const [phase, setPhase] = useState<"setup"|"shuffling"|"pick"|"done">("setup");
  const [cards, setCards] = useState(["Q", "K", "J"]);
  const [pick, setPick] = useState<number | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const start = () => {
    setPhase("shuffling"); setPick(null); setResult(null);
    const c = ["Q", "K", "J"]; let step = 0;
    const iv = setInterval(() => { const a = Math.floor(Math.random() * 3), b = Math.floor(Math.random() * 3);
      if (a !== b) { [c[a], c[b]] = [c[b], c[a]]; setCards([...c]); }
      step++; if (step >= 10) { clearInterval(iv); setPhase("pick"); }
    }, 200);
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} />
    <div className="text-[10px] text-amber-500/60 text-center">Find the Queen!</div>
    <div className="flex justify-center gap-6 py-4">{cards.map((c, i) => (
      <motion.button key={i} onClick={() => phase === "pick" && setPick(i)}
        animate={phase === "shuffling" ? { x: [(i - 1) * 40, 0], rotateY: [0, 360] } : {}} transition={{ duration: 0.3 }}
        className={`w-20 h-28 rounded-xl text-2xl font-black flex items-center justify-center transition-all border-2 ${phase === "done" ? (c === "Q" ? "bg-green-900/40 border-green-500/50 text-green-400" : pick === i ? "bg-red-900/40 border-red-500/50 text-red-400" : "bg-slate-800/40 border-slate-600/30 text-slate-500") : phase === "pick" ? "bg-slate-800/60 border-slate-500/30 text-slate-500 hover:border-amber-500/50 hover:scale-105 cursor-pointer" : "bg-slate-800/40 border-slate-600/30 text-slate-600"}`}>
        {phase === "done" ? c : "?"}</motion.button>))}</div>
    {phase === "shuffling" && <div className="text-center text-amber-400 text-xs animate-pulse">Shuffling...</div>}
    {result && <WB won={result.won} amount={result.amount} />}
    <div className="flex justify-center">
      {(phase === "setup" || phase === "done") && <button onClick={start} className="px-6 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold">Shuffle & Play</button>}
      {pick !== null && phase === "pick" && <button onClick={() => { setResult({ won: cards[pick] === "Q", amount: cards[pick] === "Q" ? bet * 3 : bet }); setPhase("done"); }} className="px-6 py-3 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-xl text-sm font-bold">I Pick!</button>}
    </div></div>;
}

function RussianRoulette() {
  const [bet, setBet] = useState(1000);
  const [pulled, setPulled] = useState(0);
  const [alive, setAlive] = useState(true);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const cyl = 6;
  const pull = () => {
    const p = pulled + 1; setPulled(p);
    if (Math.random() < p / cyl) { setAlive(false); setResult({ won: false, amount: bet }); }
    else if (p >= cyl) { setResult({ won: true, amount: bet * cyl }); }
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} presets={[500, 1000, 5000, 25000]} />
    <div className="bg-gradient-to-b from-red-900/10 to-black/20 rounded-2xl p-6 border border-red-900/20 text-center space-y-4">
      <motion.div animate={alive ? {} : { scale: [1, 1.5, 0] }} className="text-7xl">{alive ? "\ud83d\udd2b" : "\ud83d\udc80"}</motion.div>
      <div className="flex justify-center gap-1">{Array.from({ length: cyl }, (_, i) => (
        <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i < pulled ? (alive ? "bg-green-900/40 border-green-500/40 text-green-400" : "bg-red-900/40 border-red-500/40 text-red-400") : "bg-slate-800/40 border-slate-600/30 text-slate-500"}`}>{i < pulled ? (alive ? "\u2713" : "x") : "\u25cf"}</div>
      ))}</div>
      {alive && <div className="text-sm text-amber-400">Pull {pulled + 1}/{cyl} - Bonus: {String.fromCharCode(36)}{(pulled * bet).toLocaleString()}</div>}
    </div>
    {result && <WB won={result.won} amount={result.amount} />}
    <div className="flex justify-center gap-2">
      {alive && !result && <button onClick={pull} className="px-8 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-sm font-black uppercase shadow-lg shadow-red-900/30">PULL TRIGGER</button>}
      {result && <button onClick={() => { setPulled(0); setAlive(true); setResult(null); }} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold">NEW GAME</button>}
    </div></div>;
}

function CoinFlip() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"H" | "T">("H");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ won: boolean; amount: number; face: string } | null>(null);
  const flip = () => { setFlipping(true); setResult(null);
    setTimeout(() => { const f = Math.random() > 0.5 ? "H" : "T"; setResult({ won: f === pick, amount: f === pick ? bet * 2 : bet, face: f }); setFlipping(false); }, 1500);
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} presets={[100, 500, 1000, 5000]} />
    <div className="flex justify-center gap-4">{(["H", "T"] as const).map(f => (
      <button key={f} onClick={() => setPick(f)} className={`w-24 h-24 rounded-full text-xl font-black border-2 transition-all ${pick === f ? "bg-amber-600/20 border-amber-500/50 text-amber-300 scale-110" : "bg-slate-800/30 border-slate-600/30 text-slate-500"}`}>{f === "H" ? "Heads" : "Tails"}</button>
    ))}</div>
    {flipping && <motion.div animate={{ rotateY: [0, 720] }} transition={{ duration: 1.5 }} className="text-center text-5xl">Coin</motion.div>}
    {result && <><div className="text-center text-5xl mb-2">{result.face === "H" ? "H" : "T"}</div><WB won={result.won} amount={result.amount} /></>}
    <div className="flex justify-center"><button onClick={flip} disabled={flipping} className="px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase shadow-lg">FLIP</button></div></div>;
}

function DonsGame() {
  const [bet, setBet] = useState(10000);
  const [pc, setPc] = useState<Card[]>([]);
  const [dc, setDc] = useState<Card[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number; msg: string } | null>(null);
  const play = () => { const d = makeDeck();
    const p = Array.from({ length: 5 }, () => d.pop()!); const dn = Array.from({ length: 5 }, () => d.pop()!);
    setPc(p); setDc(dn);
    const pv = p.reduce((s, c) => s + c.value, 0); const dv = dn.reduce((s, c) => s + c.value, 0);
    setResult({ won: pv > dv, amount: pv > dv ? bet * 3 : bet, msg: pv > dv ? "You beat The Don!" : "The Don always wins." });
  };
  return <div className="space-y-4">
    <BI value={bet} onChange={setBet} presets={[5000, 10000, 50000, 100000]} />
    {pc.length > 0 && <div className="grid grid-cols-2 gap-3">
      <div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-4 border border-amber-900/20"><div className="text-[10px] text-amber-500/60 font-bold mb-2 text-center">Your Hand</div><div className="flex gap-1 flex-wrap justify-center">{pc.map((c, i) => <CC key={c.id} card={c} d={i * 0.1} sm />)}</div></div>
      <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20"><div className="text-[10px] text-red-500/60 font-bold mb-2 text-center">The Don</div><div className="flex gap-1 flex-wrap justify-center">{dc.map((c, i) => <CC key={c.id} card={c} d={i * 0.1 + 0.5} sm />)}</div></div></div>}
    {result && <div className={`rounded-xl p-4 text-center border ${result.won ? "bg-amber-900/15 border-amber-600/30" : "bg-red-900/15 border-red-600/30"}`}><div className={`text-lg font-black ${result.won ? "text-amber-400" : "text-red-400"}`}>{result.msg}</div><div className={`text-sm font-bold mt-1 ${result.won ? "text-amber-300" : "text-red-300"}`}>{result.won ? "+" : "-"}{String.fromCharCode(36)}{result.amount.toLocaleString()}</div></div>}
    <div className="flex justify-center gap-2">
      {!result ? <button onClick={play} className="px-8 py-3 bg-gradient-to-b from-red-700 to-red-900 text-white rounded-xl text-sm font-black uppercase shadow-lg">Challenge The Don</button>
        : <button onClick={() => { setPc([]); setDc([]); setResult(null); }} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">Play Again</button>}
    </div></div>;
}

// ═══ CATEGORY PAGES ═══
function CasinoPage() {
  const [g, setG] = useState("bj");
  return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Casino Floor</h3>
    <div className="flex gap-1.5 flex-wrap">{[["bj", "Blackjack"], ["bacc", "Baccarat"], ["poker", "Texas Hold'em"]].map(([k, l]) => <button key={k} onClick={() => setG(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${g === k ? "bg-amber-600 text-white" : "bg-slate-800/40 text-slate-500 border border-slate-700/30"}`}>{l}</button>)}</div>
    <div className="mafia-card rounded-2xl p-6">{g === "bj" ? <BlackjackGame /> : g === "bacc" ? <BaccaratGame /> : <PokerGame />}</div></div>;
}

function TablePage() {
  return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Table Games</h3>
    <div className="mafia-card rounded-2xl p-6"><RouletteGame /></div>
    <div className="mafia-card rounded-2xl p-6"><CrapsGame /></div></div>;
}

function SlotsPage() {
  const [type, setType] = useState("classic");
  const tabs = [["classic", "Classic"], ["video", "Video"], ["progressive", "Progressive"], ["megaways", "Megaways"]];
  return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Slot Machines</h3>
    <div className="flex gap-1.5 flex-wrap">{tabs.map(([k, l]) => <button key={k} onClick={() => setType(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${type === k ? "bg-amber-600 text-white" : "bg-slate-800/40 text-slate-500 border border-slate-700/30"}`}>{l}</button>)}</div>
    <div className="mafia-card rounded-2xl p-6">{type === "classic" ? <SlotsGame symbols={["Cherry", "Lemon", "Orange", "Grape", "Diamond", "7", "Star", "Bell"]} payouts={{ Cherry: 5, Lemon: 8, Orange: 10, Grape: 15, Diamond: 50, "7": 75, Star: 30, Bell: 20 }} /> :
      type === "video" ? <SlotsGame symbols={["Cherry", "Diamond", "Fire", "Star", "Crown", "Money", "7"]} payouts={{ Cherry: 3, Diamond: 25, Fire: 20, Star: 15, Crown: 100, Money: 40, "7": 50 }} reels={5} lines={3} /> :
      type === "progressive" ? <SlotsGame symbols={["Diamond", "Crown", "Money", "7", "Star"]} payouts={{ Diamond: 100, Crown: 200, Money: 150, "7": 500, Star: 60 }} reels={5} /> :
      <SlotsGame symbols={["Cherry", "Diamond", "Fire", "Star", "Crown", "Money", "7", "Card", "Joker"]} payouts={{ Cherry: 2, Diamond: 20, Fire: 15, Star: 10, Crown: 50, Money: 30, "7": 40, Card: 8, Joker: 35 }} reels={6} lines={5} />}</div></div>;
}

function StreetPage() {
  const [g, setG] = useState("monte");
  return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Street Gambling</h3>
    <div className="flex gap-1.5 flex-wrap">{[["monte", "Three-Card Monte"], ["roulette", "Russian Roulette"], ["coin", "Coin Flip"]].map(([k, l]) => <button key={k} onClick={() => setG(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${g === k ? "bg-amber-600 text-white" : "bg-slate-800/40 text-slate-500 border border-slate-700/30"}`}>{l}</button>)}</div>
    <div className="mafia-card rounded-2xl p-6">{g === "monte" ? <ThreeCardMonte /> : g === "roulette" ? <RussianRoulette /> : <CoinFlip />}</div></div>;
}

function SportsPage() { return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Sports Betting</h3><div className="mafia-card rounded-2xl p-6"><HorseRace /></div></div>; }
function NumbersPage() { return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Number Games</h3><div className="mafia-card rounded-2xl p-6"><KenoGame /></div></div>; }
function DicePage() { return <div className="space-y-4"><h3 className="text-lg font-black text-amber-400">Dice Games</h3><div className="mafia-card rounded-2xl p-6"><CrapsGame /></div></div>; }
function MafiaPage() { return <div className="space-y-4"><h3 className="text-lg font-black text-red-400">Mafia High Stakes</h3><div className="mafia-card rounded-2xl p-6 border-red-900/20"><DonsGame /></div></div>; }

// ═══ MAIN EXPORT ═══
export function GamblingOverviewPage() {
  const [cat, setCat] = useState("casino");
  const cats = [["casino", "Casino"], ["tables", "Tables"], ["slots", "Slots"], ["sports", "Sports"], ["numbers", "Numbers"], ["dice", "Dice"], ["street", "Street"], ["mafia", "Mafia"]];
  const pages: Record<string, React.ReactNode> = { casino: <CasinoPage />, tables: <TablePage />, slots: <SlotsPage />, sports: <SportsPage />, numbers: <NumbersPage />, dice: <DicePage />, street: <StreetPage />, mafia: <MafiaPage /> };
  return <div className="animate-fade-in space-y-4">
    <div className="flex items-center gap-3 mb-2"><span className="text-3xl">Casino</span><div><h2 className="text-xl font-black text-amber-400">The Gambling Den</h2><p className="text-[10px] text-slate-500">Underground casino - fortunes made and lost</p></div></div>
    <div className="flex gap-1.5 flex-wrap">{cats.map(([k, l]) => (<button key={k} onClick={() => setCat(k)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${cat === k ? "bg-amber-600/20 border-amber-500/40 text-amber-300 shadow-lg" : "border-slate-800/20 text-slate-500 hover:border-slate-600/30"}`}>{l}</button>))}</div>
    <AnimatePresence mode="wait"><motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{pages[cat]}</motion.div></AnimatePresence>
  </div>;
}

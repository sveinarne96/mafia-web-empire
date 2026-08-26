import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Card = { suit: string; rank: string; value: number; id: number };
const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RV: Record<string, number> = { A:11,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,J:10,Q:10,K:10 };
let _cid = 0;

function makeDeck(n = 6): Card[] {
  const d: Card[] = [];
  for (let i = 0; i < n; i++)
    for (const s of SUITS) for (const r of RANKS)
      d.push({ suit: s, rank: r, value: RV[r], id: _cid++ });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function hv(cards: Card[]): { total: number; soft: boolean } {
  let t = cards.reduce((s, c) => s + c.value, 0);
  let a = cards.filter(c => c.rank === "A").length;
  let soft = a > 0;
  while (t > 21 && a > 0) { t -= 10; a--; }
  if (a === 0) soft = false;
  return { total: t, soft };
}

function isBJ(c: Card[]) { return c.length === 2 && hv(c).total === 21; }
function isRed(suit: string) { return suit === "\u2665" || suit === "\u2666"; }
const RED_N = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
function rc(n: number) { return n === 0 ? "green" : RED_N.includes(n) ? "red" : "black"; }

function PC({ card, fd = false, d = 0, sm }: { card: Card; fd?: boolean; d?: number; sm?: boolean }) {
  const red = isRed(card.suit);
  if (fd) return (
    <motion.div initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: d, duration: 0.3 }}
      className={sm ? "w-10 h-14" : "w-14 h-20"}>
      <div className="w-full h-full rounded-xl border-2 border-amber-700/40 flex items-center justify-center shadow-xl"
        style={{ background: "repeating-linear-gradient(45deg, #1a0a0a, #1a0a0a 3px, #2a1010 3px, #2a1010 6px)" }}>
        <div className="w-[85%] h-[85%] border border-amber-800/20 rounded-lg flex items-center justify-center">
          <span className="text-amber-700/30 text-[7px] font-bold">NOIR</span>
        </div>
      </div>
    </motion.div>
  );
  return (
    <motion.div initial={{ rotateY: 90, opacity: 0, y: -30, scale: 0.7 }}
      animate={{ rotateY: 0, opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: d, duration: 0.35, type: "spring", stiffness: 180, damping: 15 }}
      className={(sm ? "w-10 h-14" : "w-14 h-20") + " rounded-xl border-2 shadow-xl flex flex-col items-center justify-between py-1 px-1 font-bold select-none " +
        (red ? "border-red-500/40 bg-gradient-to-br from-white via-red-50 to-red-100 text-red-600"
             : "border-slate-400/40 bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-800")}>
      <span className="leading-none" style={{ fontSize: sm ? "9px" : "11px" }}>{card.rank}</span>
      <span className={sm ? "text-sm" : "text-xl"}>{card.suit}</span>
      <span className="leading-none rotate-180" style={{ fontSize: sm ? "9px" : "11px" }}>{card.rank}</span>
    </motion.div>
  );
}

function BI({ value, onChange, presets, min = 10 }: { value: number; onChange: (n: number) => void; presets?: number[]; min?: number }) {
  const p = presets || [100, 500, 1000, 5000, 25000, 100000];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold">Wager</span>
        <div className="flex-1 relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500/60 text-xs">$</span>
          <input type="number" value={value} onChange={e => onChange(Math.max(min, Number(e.target.value)))}
            className="w-full bg-black/60 border border-amber-800/30 rounded-lg pl-5 pr-2 py-1.5 text-xs text-amber-200 font-mono focus:border-amber-500/50 focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">
        {p.map(v => (
          <button key={v} onClick={() => onChange(v)}
            className={"px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all " +
              (value === v ? "bg-amber-600/30 border-amber-500/50 text-amber-300" : "bg-black/30 border-amber-900/20 text-amber-600/40 hover:border-amber-700/30")}>
            {"$" + (v >= 1000000 ? (v/1000000).toFixed(0)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"K" : v)}
          </button>
        ))}
      </div>
    </div>
  );
}

function WB({ won, amount, text, bj }: { won: boolean; amount: number; text?: string; bj?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className={"rounded-xl p-4 text-center border shadow-lg " +
        (won ? "bg-gradient-to-b from-green-900/30 to-green-950/20 border-green-500/30" : "bg-gradient-to-b from-red-900/30 to-red-950/20 border-red-500/30")}>
      <div className={"text-lg font-black tracking-wide " + (won ? "text-green-400" : "text-red-400")}>
        {text || (bj ? "BLACKJACK!" : won ? (amount > 0 ? "YOU WIN" : "PUSH") : "BUST")}
      </div>
      {amount > 0 && <div className={"text-sm font-bold mt-1 " + (won ? "text-green-300" : "text-red-300")}>
        {won ? "+" : "-"}{"$"}{amount.toLocaleString()}
      </div>}
    </motion.div>
  );
}

function Die({ value, size = "lg" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "w-10 h-10" : size === "md" ? "w-12 h-12" : "w-16 h-16";
  const ds = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const dots: Record<number, string[]> = {1:["c"],2:["tl","br"],3:["tl","c","br"],4:["tl","tr","bl","br"],5:["tl","tr","c","bl","br"],6:["tl","tr","ml","mr","bl","br"] };
  const pos: Record<string,string> = {tl:"top-1.5 left-1.5",tr:"top-1.5 right-1.5",c:"top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",ml:"top-1/2 left-1.5 -translate-y-1/2",mr:"top-1/2 right-1.5 -translate-y-1/2",bl:"bottom-1.5 left-1.5",br:"bottom-1.5 right-1.5"};
  return <div className={s + " rounded-xl bg-white border-2 border-slate-300 shadow-lg relative"}>{(dots[value]||[]).map((p,i) => <div key={i} className={ds + " rounded-full bg-slate-800 absolute " + pos[p]} />)}</div>;
}

function RN({ n, hl }: { n: number; hl?: boolean }) {
  const c = rc(n);
  return <span className={"inline-flex w-7 h-7 rounded-full items-center justify-center text-[10px] font-black border " +
    (c==="red"?"bg-red-600 border-red-400 text-white":c==="black"?"bg-slate-800 border-slate-600 text-white":"bg-green-600 border-green-400 text-white") +
    (hl ? " ring-2 ring-amber-400 scale-125 shadow-lg shadow-amber-900/40" : "")}>{n}</span>;
}


/* ═══════════ BLACKJACK ═══════════ */
function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(8));
  const [playerHand, setPH] = useState<Card[]>([]);
  const [dealerHand, setDH] = useState<Card[]>([]);
  const [bet, setBet] = useState(1000);
  const [phase, setPhase] = useState<"bet"|"deal"|"play"|"insure"|"dealer"|"done">("bet");
  const [result, setResult] = useState<{ won: boolean; amount: number; msg: string } | null>(null);
  const [stats, setStats] = useState({ w: 0, l: 0, p: 0, bj: 0 });
  const [dealt, setDealt] = useState(false);
  const [insurance, setInsurance] = useState(0);
  const [splitHands, setSplitHands] = useState<Card[][]>([]);
  const [activeHand, setActiveHand] = useState(0);

  const deal = () => {
    let d = [...deck]; if (d.length < 30) d = makeDeck(8);
    const ph = [d.pop()!, d.pop()!];
    const dh = [d.pop()!, d.pop()!];
    setDeck(d); setPH(ph); setDH(dh); setResult(null); setInsurance(0);
    setSplitHands([]); setActiveHand(0); setDealt(false);

    if (isBJ(dh)) {
      setPhase("done");
      const pbj = isBJ(ph);
      const amt = pbj ? 0 : bet;
      setResult({ won: pbj, amount: amt, msg: pbj ? "Both have Blackjack - PUSH" : "Dealer has Blackjack!" });
      setStats(s => ({ ...s, p: pbj ? s.p + 1 : s.l + 1, bj: pbj ? s.bj + 1 : s.bj }));
      setDealt(true);
      return;
    }

    if (ph[0].rank === "A" || (ph[0].value === 10 && ph[1].value === 10)) {
      setPhase("insure");
    } else {
      setPhase("play");
    }
    setTimeout(() => setDealt(true), 100);
  };

  const doInsurance = (yes: boolean) => {
    if (yes) setInsurance(Math.floor(bet / 2));
    setPhase("play");
  };

  const doSplit = () => {
    if (playerHand.length !== 2 || playerHand[0].rank !== playerHand[1].rank) return;
    let d = [...deck]; if (d.length < 20) d = makeDeck(8);
    const h1 = [playerHand[0], d.pop()!];
    const h2 = [playerHand[1], d.pop()!];
    setDeck(d); setSplitHands([h1, h2]); setPH(h1); setActiveHand(0);
  };

  const hit = (handIdx?: number) => {
    let d = [...deck]; if (d.length < 20) d = makeDeck(8);
    const c = d.pop()!;
    setDeck(d);
    if (splitHands.length > 0) {
      const nh = [...splitHands]; nh[handIdx ?? activeHand] = [...nh[handIdx ?? activeHand], c];
      setSplitHands(nh);
      if (hv(nh[handIdx ?? activeHand]).total > 21) nextSplitHand(handIdx ?? activeHand);
    } else {
      const nh = [...playerHand, c];
      setPH(nh);
      if (hv(nh).total > 21) finishDealer();
    }
  };

  const stand = (handIdx?: number) => {
    if (splitHands.length > 0) nextSplitHand(handIdx ?? activeHand);
    else finishDealer();
  };

  const doubleDown = (handIdx?: number) => {
    let d = [...deck]; if (d.length < 20) d = makeDeck(8);
    const c = d.pop()!; setDeck(d);
    if (splitHands.length > 0) {
      const nh = [...splitHands]; const i = handIdx ?? activeHand;
      nh[i] = [...nh[i], c]; setSplitHands(nh);
      nextSplitHand(i);
    } else {
      setPH([...playerHand, c]);
      finishDealer();
    }
  };

  const nextSplitHand = (from: number) => {
    if (from < splitHands.length - 1) {
      const next = from + 1;
      setActiveHand(next);
      setPH(splitHands[next]);
    } else {
      finishDealer();
    }
  };

  const finishDealer = () => {
    setPhase("dealer");
    let dl = [...dealerHand]; let d = [...deck];
    if (d.length < 20) d = [...d, ...makeDeck(8)];

    const tick = () => {
      if (hv(dl).total < 17 || (hv(dl).total === 17 && hv(dl).soft)) {
        dl.push(d.pop()!); setDH([...dl]); setDeck([...d]);
        setTimeout(tick, 400);
      } else {
        resolve(dl);
      }
    };
    setTimeout(tick, 300);
  };

  const resolve = (dl: Card[]) => {
    const dv = hv(dl).total;
    if (splitHands.length > 0) {
      let totalWin = 0;
      let totalW = 0, totalL = 0, totalP = 0;
      splitHands.forEach(h => {
        const pv = hv(h).total;
        if (pv > 21) { totalWin -= bet; totalL++; }
        else if (dv > 21 || pv > dv) { totalWin += bet; totalW++; }
        else if (pv === dv) { totalP++; }
        else { totalWin -= bet; totalL++; }
      });
      setResult({ won: totalWin > 0, amount: Math.abs(totalWin), msg: totalWin > 0 ? "SPLIT WINS!" : totalWin < 0 ? "SPLIT LOSS" : "SPLIT PUSH" });
      setStats(s => ({ w: s.w + totalW, l: s.l + totalL, p: s.p + totalP, bj: s.bj }));
    } else {
      const pv = hv(playerHand).total;
      const pbj = isBJ(playerHand);
      const dbj = isBJ(dealerHand);

      if (pbj && !dbj) {
        setResult({ won: true, amount: Math.floor(bet * 1.5), msg: "BLACKJACK!" });
        setStats(s => ({ ...s, w: s.w + 1, bj: s.bj + 1 }));
      } else if (pv > 21) {
        setResult({ won: false, amount: bet, msg: "BUST!" });
        setStats(s => ({ ...s, l: s.l + 1 }));
      } else if (dv > 21) {
        setResult({ won: true, amount: bet, msg: "DEALER BUSTS!" });
        setStats(s => ({ ...s, w: s.w + 1 }));
      } else if (pv > dv) {
        setResult({ won: true, amount: bet, msg: "YOU WIN " + pv + " vs " + dv });
        setStats(s => ({ ...s, w: s.w + 1 }));
      } else if (pv === dv) {
        setResult({ won: true, amount: 0, msg: "PUSH " + pv + "-" + dv });
        setStats(s => ({ ...s, p: s.p + 1 }));
      } else {
        setResult({ won: false, amount: bet, msg: "LOSE " + pv + " vs " + dv });
        setStats(s => ({ ...s, l: s.l + 1 }));
      }
    }
    setPhase("done");
  };

  const canSplit = playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank && splitHands.length === 0;
  const canDouble = playerHand.length === 2 && splitHands.length === 0;

  return (
    <div className="space-y-5">
      {/* Session Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-[10px] font-mono">
          <span className="text-green-600/70">W:{stats.w}</span>
          <span className="text-red-600/70">L:{stats.l}</span>
          <span className="text-slate-500">P:{stats.p}</span>
          <span className="text-amber-500/70">BJ:{stats.bj}</span>
        </div>
        <div className="text-[10px] text-slate-600">8-Deck Shoe</div>
      </div>

      {/* Dealer Area */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-transparent rounded-2xl p-5 border border-emerald-900/15 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle, #22c55e 1px, transparent 1px)",backgroundSize:"16px 16px"}} />
        <div className="flex items-center justify-between mb-3 relative">
          <span className="text-[10px] uppercase tracking-widest text-emerald-600/60 font-bold">Dealer</span>
          {dealerHand.length > 0 && (
            <span className={"text-sm font-black " + (hv(dealerHand).total > 21 ? "text-red-400" : "text-emerald-400")}>
              {phase === "play" || phase === "insure" ? "?+" + hv([dealerHand[0]]).total : hv(dealerHand).total}
            </span>
          )}
        </div>
        <div className="flex gap-2 justify-center relative">
          {dealerHand.map((c, i) => (
            <PC key={c.id} card={c} fd={dealt && (phase === "play" || phase === "insure") && i === 1} d={i * 0.15} />
          ))}
          {dealerHand.length === 0 && <div className="text-emerald-700/30 text-sm py-6">Place your bet to begin</div>}
        </div>
      </div>

      {/* Player Hand */}
      {splitHands.length > 0 ? (
        <div className="space-y-3">
          {splitHands.map((h, hi) => (
            <div key={hi} className={"rounded-2xl p-4 border transition-all " +
              (hi === activeHand && phase === "play" ? "bg-gradient-to-b from-amber-900/15 to-transparent border-amber-600/30" : "bg-gradient-to-b from-slate-900/20 to-transparent border-slate-800/20")}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-amber-600/60 font-bold">Hand {hi+1}</span>
                <span className={"text-sm font-black " + (hv(h).total > 21 ? "text-red-400" : "text-amber-400")}>
                  {hv(h).total}{hv(h).soft ? " (soft)" : ""}
                </span>
              </div>
              <div className="flex gap-2 justify-center">{h.map((c, ci) => <PC key={c.id} card={c} d={ci*0.1} />)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-b from-amber-900/10 to-transparent rounded-2xl p-5 border border-amber-900/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-amber-600/60 font-bold">Your Hand</span>
            {playerHand.length > 0 && (
              <span className={"text-sm font-black " + (hv(playerHand).total > 21 ? "text-red-400" : "text-amber-400")}>
                {hv(playerHand).total}{hv(playerHand).soft ? " (soft)" : ""}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-center">
            {playerHand.map((c, i) => <PC key={c.id} card={c} d={i * 0.1} />)}
            {playerHand.length === 0 && <div className="text-amber-700/30 text-sm py-6">Your cards</div>}
          </div>
        </div>
      )}

      {/* Result */}
      {result && <WB won={result.won} amount={result.amount} text={result.msg} bj={result.msg.includes("BLACKJACK")} />}

      {/* Insurance Prompt */}
      {phase === "insure" && (
        <div className="rounded-xl p-4 border border-amber-600/30 bg-amber-900/10 text-center space-y-3">
          <div className="text-amber-400 text-sm font-bold">Insurance? Dealer shows Ace</div>
          <div className="text-[10px] text-amber-600/50">Side bet: {"$"}{Math.floor(bet/2)} (pays 2:1 if dealer has BJ)</div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => doInsurance(true)} className="px-5 py-2 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold">YES</button>
            <button onClick={() => doInsurance(false)} className="px-5 py-2 bg-slate-700/50 text-slate-400 rounded-xl text-xs font-bold">NO</button>
          </div>
        </div>
      )}

      {/* Bet Area */}
      {phase === "bet" && (
        <div className="space-y-3">
          <BI value={bet} onChange={setBet} />
          <div className="flex gap-2 justify-center">
            {[100,500,1000,5000,25000,100000].map(v => (
              <button key={v} onClick={() => setBet(v)}
                className={"w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 " +
                  (bet===v ? "bg-amber-600/30 border-amber-500/50 text-amber-300 ring-2 ring-amber-400/50 shadow-lg shadow-amber-900/20" : "bg-slate-800/40 border-slate-600/30 text-slate-500")}>
                {v >= 1000 ? (v/1000)+"K" : v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {phase === "bet" && (
          <button onClick={deal}
            className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 transition-all">
            DEAL {"$"}{bet.toLocaleString()}
          </button>
        )}
        {phase === "play" && (
          <>
            <button onClick={() => hit()} className="px-5 py-2.5 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">HIT</button>
            <button onClick={() => stand()} className="px-5 py-2.5 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">STAND</button>
            {canDouble && <button onClick={() => doubleDown()} className="px-5 py-2.5 bg-gradient-to-b from-purple-600 to-purple-800 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">DOUBLE</button>}
            {canSplit && <button onClick={doSplit} className="px-5 py-2.5 bg-gradient-to-b from-rose-600 to-rose-800 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">SPLIT</button>}
          </>
        )}
        {phase === "done" && (
          <button onClick={() => { setPH([]); setDH([]); setResult(null); setPhase("bet"); setSplitHands([]); }}
            className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">
            NEW HAND
          </button>
        )}
      </div>

      {/* Rules */}
      {phase === "bet" && (
        <div className="text-center text-[9px] text-slate-600 space-y-0.5">
          <p>Blackjack pays 3:2 &middot; Insurance pays 2:1 &middot; Dealer stands on 17</p>
          <p>Min bet: $10 &middot; Split to 4 hands &middot; Double on any 2 cards</p>
        </div>
      )}
    </div>
  );
}

/* Roulette Game */
function RouletteGame() {
  const [bet, setBet] = useState(500);
  const [bt, setBt] = useState("red");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{num:number;color:string}|null>(null);
  const [history, setHistory] = useState<{num:number;color:string}[]>([]);
  const [profit, setProfit] = useState(0);
  const RED_N = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const spin = () => {
    setSpinning(true); setResult(null);
    setTimeout(() => {
      const n = Math.floor(Math.random() * 37);
      const c = n === 0 ? "green" : RED_N.includes(n) ? "red" : "black";
      setResult({num:n,color:c});
      setHistory(prev => [{num:n,color:c},...prev].slice(0,25));
      let w = false, m = 0;
      if (bt==="red" && c==="red") { w=true; m=2; }
      else if (bt==="black" && c==="black") { w=true; m=2; }
      else if (bt==="green" && n===0) { w=true; m=36; }
      else if (bt==="odd" && n%2===1 && n>0) { w=true; m=2; }
      else if (bt==="even" && n%2===0 && n>0) { w=true; m=2; }
      else if (bt==="1-12" && n>=1 && n<=12) { w=true; m=3; }
      else if (bt==="13-24" && n>=13 && n<=24) { w=true; m=3; }
      else if (bt==="25-36" && n>=25 && n<=36) { w=true; m=3; }
      else if (bt==="low" && n>=1 && n<=18) { w=true; m=2; }
      else if (bt==="high" && n>=19 && n<=36) { w=true; m=2; }
      setProfit(p => p + (w ? bet*(m-1) : -bet));
      setSpinning(false);
    }, 3000);
  };
  const opts = [
    {id:"red",l:"Red",x:"2x",bg:"bg-red-600"},{id:"black",l:"Black",x:"2x",bg:"bg-slate-800"},
    {id:"green",l:"0",x:"36x",bg:"bg-green-600"},{id:"odd",l:"Odd",x:"2x",bg:"bg-slate-700"},
    {id:"even",l:"Even",x:"2x",bg:"bg-slate-700"},{id:"1-12",l:"1-12",x:"3x",bg:"bg-blue-900"},
    {id:"13-24",l:"13-24",x:"3x",bg:"bg-blue-800"},{id:"25-36",l:"25-36",x:"3x",bg:"bg-blue-700"},
    {id:"low",l:"1-18",x:"2x",bg:"bg-purple-900"},{id:"high",l:"19-36",x:"2x",bg:"bg-purple-800"},
  ];
  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000,25000]} />
      <div className="flex justify-center py-4">
        <div className="relative w-40 h-40">
          <motion.div animate={spinning?{rotate:[0,-1800]}:{}} transition={{duration:3,ease:[0.2,0.8,0.3,1]}}
            className="w-full h-full rounded-full border-4 border-amber-700/50 shadow-2xl flex items-center justify-center"
            style={{background:"conic-gradient(from 0deg, #dc2626, #111, #dc2626, #111, #16a34a, #dc2626, #111, #dc2626, #111)"}}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-500/50 flex items-center justify-center">
              {result ? <motion.div initial={{scale:0}} animate={{scale:1}} className={"text-2xl font-black "+(result.color==="red"?"text-red-300":result.color==="green"?"text-green-300":"text-white")}>{result.num}</motion.div> : <span className="text-amber-900 text-xl">?</span>}
            </div>
          </motion.div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-amber-400" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {opts.map(o => (
          <button key={o.id} onClick={() => !spinning && setBt(o.id)}
            className={"px-2 py-2.5 rounded-lg text-[10px] font-bold transition-all border flex flex-col items-center gap-0.5 "+(bt===o.id?"border-amber-500/50 bg-amber-600/20 text-amber-300 shadow-lg":"border-slate-800/30 text-slate-500")}>
            <div className={"w-3 h-3 rounded-full "+o.bg}/><span>{o.l}</span><span className="text-[8px] opacity-50">{o.x}</span>
          </button>
        ))}
      </div>
      {history.length > 0 && <div className="flex gap-1 flex-wrap">{history.slice(0,15).map((h,i) => <RN key={i} n={h.num} hl={i===0} />)}</div>}
      <div className={"text-center text-xs font-bold "+(profit>=0?"text-green-400":"text-red-400")}>Session: {profit>=0?"+":"-"}{String.fromCharCode(36)}{Math.abs(profit).toLocaleString()}</div>
      <div className="flex justify-center"><button onClick={spin} disabled={spinning} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase tracking-wider shadow-xl shadow-amber-900/30 hover:scale-105 transition-all">{spinning?"SPINNING...":"SPIN"}</button></div>
      <div className="text-center text-[9px] text-slate-600">European Roulette - Single Zero - La Partage</div>
    </div>
  );
}
/* Craps Game */
function CrapsGame() {
  const [bet, setBet] = useState(500);
  const [d1, setD1] = useState(0);
  const [d2, setD2] = useState(0);
  const [phase, setPhase] = useState<"come"|"point"|"done">("come");
  const [point, setPoint] = useState(0);
  const [result, setResult] = useState<{msg:string;won:boolean;amount:number}|null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [profit, setProfit] = useState(0);

  const roll = () => {
    setRolling(true); setResult(null);
    setTimeout(() => {
      const v1 = Math.floor(Math.random()*6)+1, v2 = Math.floor(Math.random()*6)+1;
      const t = v1+v2;
      setD1(v1); setD2(v2); setHistory(prev => [t,...prev].slice(0,12));
      if (phase === "come") {
        if (t===7||t===11) { setResult({msg:"Natural "+t+"! Pass WINS!",won:true,amount:bet}); setProfit(p=>p+bet); setPhase("done"); }
        else if (t===2||t===3||t===12) { setResult({msg:t===12?"Push":"Craps "+t+"!",won:t===12,amount:t===12?0:bet}); setProfit(p=>p+(t===12?0:-bet)); setPhase("done"); }
        else { setPoint(t); setPhase("point"); }
      } else {
        if (t===point) { setResult({msg:"Hit point "+point+"! WIN!",won:true,amount:bet*2}); setProfit(p=>p+bet*2); setPhase("done"); }
        else if (t===7) { setResult({msg:"Seven-out! LOSE!",won:false,amount:bet}); setProfit(p=>p-bet); setPhase("done"); }
      }
      setRolling(false);
    }, 800);
  };
  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} />
      <div className="bg-gradient-to-b from-emerald-900/20 to-emerald-950/10 rounded-2xl p-6 border border-emerald-900/20 text-center space-y-4">
        {phase==="point" && <motion.div initial={{scale:0.8}} animate={{scale:1}} className="bg-amber-900/30 rounded-xl py-2 px-6 border border-amber-700/30 inline-block"><span className="text-amber-400 font-black text-lg">POINT: {point}</span></motion.div>}
        {d1>0 ? <motion.div initial={{scale:0.5}} animate={{scale:1}} className="flex justify-center gap-4 items-center"><Die value={d1}/><span className="text-amber-500 text-xl font-black">+</span><Die value={d2}/><span className="text-amber-500 text-xl font-black">=</span><span className="text-2xl font-black text-amber-400">{d1+d2}</span></motion.div>
        : <div className="text-emerald-700/30 text-sm py-8">Roll the dice</div>}
      </div>
      {history.length>0 && <div className="flex gap-1 flex-wrap">{history.map((h,i)=><span key={i} className={"px-2 py-0.5 rounded text-[10px] font-bold "+(h===7?"bg-green-900/30 text-green-400":(h===2||h===3||h===12)?"bg-red-900/30 text-red-400":h===point?"bg-amber-900/30 text-amber-400":"bg-slate-800/40 text-slate-400")}>{h}</span>)}</div>}
      {profit!==0 && <div className={"text-center text-xs font-bold "+(profit>0?"text-green-400":"text-red-400")}>Session: {profit>0?"+":"-"}{"$"}{Math.abs(profit).toLocaleString()}</div>}
      {result && <WB won={result.won} amount={result.amount} text={result.msg} />}
      <div className="flex justify-center">
        {phase==="done" ? <button onClick={()=>{setD1(0);setD2(0);setPhase("come");setPoint(0);setResult(null);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">NEW GAME</button>
        : <button onClick={roll} disabled={rolling} className="px-10 py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-700 disabled:opacity-30 text-white rounded-xl text-sm font-black uppercase shadow-lg shadow-emerald-900/30 hover:scale-105 transition-all">{rolling?"ROLLING...":"ROLL DICE"}</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Pass Line: 7/11 wins, Craps 2/3/12 loses. Point phase: hit point before 7 (2x)</div>
    </div>
  );
}

/* Baccarat Game */
function BaccaratGame() {
  const [bet, setBet] = useState(1000);
  const [betOn, setBetOn] = useState<"player"|"banker"|"tie">("player");
  const [pc, setPc] = useState<Card[]>([]);
  const [bc, setBc] = useState<Card[]>([]);
  const [result, setResult] = useState<{won:boolean;amount:number;msg:string}|null>(null);
  const [history, setHistory] = useState<("player"|"banker"|"tie")[]>([]);
  const bval = (cards:Card[]) => cards.reduce((s,c) => s+(c.value>9?0:c.value),0)%10;
  const deal = () => {
    const d = makeDeck(8); const pp=[d.pop()!,d.pop()!]; const bb=[d.pop()!,d.pop()!];
    if (bval(pp)<=5) pp.push(d.pop()!);
    if (bval(bb)<=5 || (bval(bb)<=6 && pp.length===3 && bval(pp.slice(2))>=4 && bval(pp.slice(2))<=7)) bb.push(d.pop()!);
    else if (bval(bb)<=5 && pp.length===2) bb.push(d.pop()!);
    setPc(pp); setBc(bb);
    const pv=bval(pp),bv=bval(bb),winner:("player"|"banker"|"tie")=pv>bv?"player":bv>pv?"banker":"tie";
    const mult=betOn==="tie"?8:betOn==="banker"?0.95:1;
    setResult({won:betOn===winner,amount:betOn===winner?Math.floor(bet*mult):bet,msg:winner.toUpperCase()+" wins "+pv+"-"+bv});
    setHistory(prev=>[winner,...prev].slice(0,20));
  };
  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} />
      <div className="grid grid-cols-3 gap-2">
        {[["player","Player","1:1"],["banker","Banker","0.95:1"],["tie","Tie","8:1"]].map(([id,l,o])=>(
          <button key={id} onClick={()=>setBetOn(id as any)} className={"py-4 rounded-xl text-xs font-bold transition-all border-2 flex flex-col items-center gap-1 "+(betOn===id?"border-amber-500/50 bg-amber-900/20 text-amber-300 shadow-lg":"border-slate-800/30 text-slate-500")}>
            <span className="text-sm">{l}</span><span className="text-[10px] opacity-60">{o}</span>
          </button>
        ))}
      </div>
      {pc.length>0 && <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-blue-900/15 to-transparent rounded-2xl p-4 border border-blue-900/20 text-center">
          <div className="text-[10px] uppercase text-blue-500/60 font-bold mb-2">Player ({bval(pc)})</div>
          <div className="flex gap-1.5 justify-center flex-wrap">{pc.map((c,i)=><PC key={c.id} card={c} d={i*0.2} sm />)}</div>
        </div>
        <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
          <div className="text-[10px] uppercase text-red-500/60 font-bold mb-2">Banker ({bval(bc)})</div>
          <div className="flex gap-1.5 justify-center flex-wrap">{bc.map((c,i)=><PC key={c.id} card={c} d={i*0.2+0.5} sm />)}</div>
        </div>
      </div>}
      {history.length>0 && <div className="flex gap-1 flex-wrap">{history.slice(0,15).map((h,i)=>(
        <span key={i} className={"w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center "+(h==="player"?"bg-blue-900/40 text-blue-400":h==="banker"?"bg-red-900/40 text-red-400":"bg-amber-900/40 text-amber-400")}>{h==="player"?"P":h==="banker"?"B":"T"}</span>
      ))}</div>}
      {result && <WB won={result.won} amount={result.amount} text={result.msg} />}
      <div className="flex justify-center gap-3">
        {!result ? <button onClick={deal} className="px-10 py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">DEAL</button>
        : <button onClick={()=>{setPc([]);setBc([]);setResult(null);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">NEW HAND</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Baccarat - Player vs Banker - Natural 8/9 wins - Tie pays 8:1</div>
    </div>
  );
}

/* Texas Hold'em Poker */
function PokerGame() {
  const [bet, setBet] = useState(500);
  const [hole, setHole] = useState<Card[]>([]);
  const [community, setCommunity] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState<"preflop"|"flop"|"turn"|"river"|"showdown">("preflop");
  const [result, setResult] = useState<{won:boolean;amount:number;hand:string}|null>(null);
  const [deck, setDeck] = useState<Card[]>([]);

  const evalHand = (cards:Card[]):{rank:number;name:string} => {
    const vals = cards.map(c=>c.value).sort((a,b)=>b-a);
    const suits = cards.map(c=>c.suit);
    const isFlush = suits.filter(s=>s===suits[0]).length>=5;
    const uniq = [...new Set(vals)];
    const isStraight = uniq.length>=5 && vals[0]-vals[4]<=4;
    const counts:Record<number,number>={};
    vals.forEach(v=>counts[v]=(counts[v]||0)+1);
    const pairs=Object.values(counts).filter(c=>c===2).length;
    const trips=Object.values(counts).filter(c=>c===3).length;
    const quads=Object.values(counts).filter(c=>c===4).length;
    if (isFlush&&isStraight) return {rank:8,name:"Straight Flush"};
    if (quads>0) return {rank:7,name:"Four of a Kind"};
    if (trips>0&&pairs>0) return {rank:6,name:"Full House"};
    if (isFlush) return {rank:5,name:"Flush"};
    if (isStraight) return {rank:4,name:"Straight"};
    if (trips>0) return {rank:3,name:"Three of a Kind"};
    if (pairs>=2) return {rank:2,name:"Two Pair"};
    if (pairs===1) return {rank:1,name:"One Pair"};
    return {rank:0,name:"High Card"};
  };

  const deal = () => { const d=makeDeck(); setHole([d.pop()!,d.pop()!]); setCommunity([]); setPot(bet*2); setDeck(d); setRound("flop"); setResult(null); };
  const nextRound = () => {
    const d=[...deck]; const comm=[...community];
    if (round==="flop") { comm.push(d.pop()!,d.pop()!,d.pop()!); setRound("turn"); }
    else if (round==="turn") { comm.push(d.pop()!); setRound("river"); }
    else if (round==="river") { comm.push(d.pop()!); const all=[...hole,...comm]; const ph=evalHand(all); setResult({won:Math.random()>0.35||ph.rank>=3,amount:pot,hand:ph.name}); setRound("showdown"); }
    setCommunity(comm); setDeck(d);
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000,25000]} />
      {community.length>0 && <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20">
        <div className="text-[10px] uppercase text-emerald-600/50 font-bold mb-3 text-center">Community - {round.toUpperCase()}</div>
        <div className="flex gap-2 justify-center flex-wrap">{community.map((c,i)=><PC key={c.id} card={c} d={i*0.15} sm />)}</div>
      </div>}
      {hole.length>0 && <div className="bg-gradient-to-b from-amber-900/10 to-transparent rounded-2xl p-5 border border-amber-900/20">
        <div className="text-[10px] uppercase text-amber-600/50 font-bold mb-2">Your Hand</div>
        <div className="flex gap-2 justify-center">{hole.map((c,i)=><PC key={c.id} card={c} d={i*0.1} />)}</div>
      </div>}
      {pot>0 && <div className="text-center"><div className="text-[10px] text-slate-500 uppercase">Pot</div><div className="text-amber-400 font-black text-xl">{"$"}{pot.toLocaleString()}</div></div>}
      {result && <WB won={result.won} amount={result.amount} text={result.won?result.hand+"! YOU WIN":result.hand+" - You Lose"} />}
      <div className="flex justify-center gap-2">
        {round==="preflop" && <button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Deal</button>}
        {round!=="preflop" && round!=="showdown" && <button onClick={nextRound} className="px-8 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all">{round==="river"?"Showdown":round==="flop"?"Flop":"River"}</button>}
        {result && <button onClick={()=>{setHole([]);setCommunity([]);setResult(null);setRound("preflop");setPot(0);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">New Hand</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Texas Hold'em - 2 hole + 5 community - Best 5-card hand</div>
    </div>
  );
}
/* Slot Machine */
function SlotsGame({ symbols, payouts, reels = 3, lines = 1 }: { symbols: string[]; payouts: Record<string, number>; reels?: number; lines?: number }) {
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>(Array.from({length:lines},()=>Array(reels).fill(symbols[0])));
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const [jackpot, setJackpot] = useState(100000);
  const [autoSpins, setAutoSpins] = useState(0);

  const spin = useCallback(() => {
    if (autoSpins > 0) setAutoSpins(a => a - 1);
    setSpinning(true); setResult(null);
    setJackpot(j => j + Math.floor(bet * 0.02));
    let count = 0;
    const iv = setInterval(() => {
      setGrid(Array.from({length:lines},()=>Array(reels).fill(0).map(()=>symbols[Math.floor(Math.random()*symbols.length)])));
      count++;
      if (count >= 30) {
        clearInterval(iv);
        const fg = Array.from({length:lines},()=>Array(reels).fill(0).map(()=>symbols[Math.floor(Math.random()*symbols.length)]));
        setGrid(fg); setSpinning(false);
        let tw = 0;
        for (let l = 0; l < lines; l++) {
          const row = fg[l];
          if (row.every(s => s === row[0])) tw += bet * (payouts[row[0]] || 1);
          else {
            let consec = 1;
            for (let c = 1; c < row.length; c++) { if (row[c] === row[0]) consec++; else break; }
            if (consec >= 3) tw += bet * Math.floor((payouts[row[0]] || 1) * consec / reels);
          }
        }
        const jackpotMatch = fg[0].every(s => s === fg[0][0]) && (fg[0][0] === "\ud83d\udc8e" || fg[0][0] === "\ud83d\udc51");
        if (jackpotMatch) { tw += jackpot; setJackpot(100000); }
        setResult({won: tw > 0, amount: tw});
      }
    }, 50);
  }, [bet, lines, reels, symbols, payouts, jackpot, autoSpins]);

  useEffect(() => { if (autoSpins > 0 && !spinning) { const t = setTimeout(spin, 500); return () => clearTimeout(t); } }, [autoSpins, spinning, spin]);

  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000,5000]} />
      <div className="flex justify-end">
        <div className="text-right">
          <div className="text-[10px] text-amber-600/50 uppercase font-bold">Progressive Jackpot</div>
          <motion.div animate={{scale:[1,1.03,1]}} transition={{repeat:Infinity,duration:2}} className="text-amber-400 font-black text-xl">{"$"}{jackpot.toLocaleString()}</motion.div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-slate-900/80 via-black/60 to-slate-900/80 rounded-2xl p-6 border border-amber-900/20 shadow-inner space-y-2">
        {grid.map((row,ri) => <div key={ri} className="flex justify-center gap-2">
          {row.map((sym,ci) => (
            <motion.div key={ri+"-"+ci} animate={spinning?{y:[-10,10,-10],rotateX:[0,180,360]}:{y:0,rotateX:0}}
              transition={spinning?{repeat:Infinity,duration:0.12}:{duration:0.3}}
              className="w-16 h-16 flex items-center justify-center text-3xl bg-slate-800/50 rounded-xl border border-slate-700/30 shadow-inner">
              {sym}
            </motion.div>
          ))}
        </div>)}
        {lines > 1 && <div className="text-center text-[10px] text-slate-600 mt-2">{lines} paylines active</div>}
      </div>
      {result && <WB won={result.won} amount={result.amount} />}
      <div className="flex justify-center gap-2">
        <button onClick={spin} disabled={spinning} className="px-10 py-4 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 disabled:opacity-30 text-black rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/30 border border-amber-400/30 hover:scale-105 transition-all">
          {spinning?"SPINNING...":"PULL"}
        </button>
        {autoSpins === 0 && !spinning && (
          <button onClick={() => setAutoSpins(10)} className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-xl text-xs font-bold hover:scale-105 transition-all">Auto x10</button>
        )}
        {autoSpins > 0 && (
          <button onClick={() => setAutoSpins(0)} className="px-4 py-2 bg-red-900/40 text-red-400 rounded-xl text-xs font-bold">Stop ({autoSpins})</button>
        )}
      </div>
    </div>
  );
}

/* Horse Racing */
function HorseRace() {
  const [bet, setBet] = useState(500);
  const [picked, setPicked] = useState<number|null>(null);
  const [racing, setRacing] = useState(false);
  const [pos, setPos] = useState(Array(8).fill(0));
  const [result, setResult] = useState<{won:boolean;amount:number;winner:string}|null>(null);
  const names = ["Thunder","Lightning","Shadow","Blaze","Storm","Flash","Phantom","Blitz"];
  const colors = ["#ef4444","#3b82f6","#a855f7","#f97316","#22c55e","#eab308","#06b6d4","#ec4899"];
  const odds = [3,5,8,4,6,10,7,12];
  const race = () => {
    if (picked===null) return; setRacing(true); setResult(null);
    const speeds = names.map(()=>1.5+Math.random()*3);
    let p = Array(8).fill(0);
    const iv = setInterval(() => {
      p = p.map((v,i)=>Math.min(100,v+speeds[i]*(0.5+Math.random())));
      setPos([...p]);
      const fin = p.findIndex(v=>v>=100);
      if (fin!==-1) { clearInterval(iv); setRacing(false); setResult({won:fin===picked,amount:fin===picked?bet*odds[picked]:bet,winner:names[fin]}); }
    }, 80);
  };
  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} />
      <div className="bg-gradient-to-r from-emerald-900/20 via-emerald-950/10 to-emerald-900/20 rounded-2xl p-4 border border-emerald-900/20 space-y-1.5">
        {names.map((h,i) => <div key={i} className="flex items-center gap-2">
          <span className="w-20 text-[10px] text-slate-400 truncate font-bold">{h}</span>
          <div className="flex-1 h-5 bg-black/40 rounded-full overflow-hidden relative">
            <motion.div className="h-full rounded-full" style={{width:pos[i]+"%",backgroundColor:colors[i]}} />
            <span className="absolute right-1 top-0 text-[8px] text-white/60 font-bold leading-5">{Math.floor(pos[i])}%</span>
          </div>
          <span className="w-8 text-[10px] text-slate-500 text-right font-bold">{odds[i]}x</span>
        </div>)}
      </div>
      <div className="grid grid-cols-4 gap-1.5">{names.map((h,i) => (
        <button key={i} onClick={() => !racing && setPicked(i)}
          className={"py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1 "+(picked===i?"border-amber-500/50 bg-amber-600/20 text-amber-300":"border-slate-800/30 text-slate-500")}>
          <div className="w-2 h-2 rounded-full" style={{backgroundColor:colors[i]}} />{h} {odds[i]}x
        </button>
      ))}</div>
      {result && <WB won={result.won} amount={result.amount} text={result.won?result.winner+" WINS! You collected!":result.winner+" won. You lose."} />}
      <div className="flex justify-center"><button onClick={race} disabled={racing||picked===null} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 disabled:opacity-30 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">{racing?"RACING...":"BET & RACE"}</button></div>
    </div>
  );
}

/* Keno */
function KenoGame() {
  const [bet, setBet] = useState(500);
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amount:number;hits:number}|null>(null);
  const toggle = (n:number) => { if (drawn.length>0) return; if (picks.includes(n)) setPicks(picks.filter(p=>p!==n)); else if (picks.length<10) setPicks([...picks,n]); };
  const play = () => {
    const dn = Array.from({length:80},(_,i)=>i+1).sort(()=>Math.random()-0.5).slice(0,20).sort((a,b)=>a-b);
    setDrawn(dn); const hits = picks.filter(p=>dn.includes(p)).length;
    const pt:Record<number,number> = {0:0,1:0,2:1,3:2,4:5,5:15,6:50,7:150,8:500,9:2000,10:10000};
    setResult({won:(pt[hits]||0)>0,amount:bet*(pt[hits]||0),hits});
  };
  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} />
      <div className="text-[10px] text-slate-500">Pick 1-10 numbers ({picks.length}/10)</div>
      <div className="grid grid-cols-10 gap-1">{Array.from({length:80},(_,i)=>i+1).map(n => {
        const ip=picks.includes(n), id=drawn.includes(n), ih=ip&&id;
        return <button key={n} onClick={()=>toggle(n)} className={"w-full aspect-square rounded-lg text-[10px] font-bold transition-all "+(ih?"bg-green-600 text-white ring-2 ring-green-400":ip?"bg-amber-600/40 text-amber-300 border border-amber-500/40":id?"bg-red-900/30 text-red-400/50 border border-red-500/20":"bg-slate-800/30 text-slate-500 hover:bg-slate-700/40 border border-slate-700/20")}>{n}</button>;
      })}</div>
      {result && <><div className="text-center text-sm text-slate-400">Drawn: {drawn.join(", ")}</div>
        <div className="text-center text-sm font-bold text-amber-400">{result.hits}/{picks.length} matched</div><WB won={result.won} amount={result.amount} /></>}
      <div className="flex justify-center gap-2">
        <button onClick={play} disabled={picks.length===0||drawn.length>0} className="px-6 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-700 disabled:opacity-30 text-white rounded-xl text-sm font-bold shadow-lg">Draw</button>
        <button onClick={()=>{setPicks([]);setDrawn([]);setResult(null);}} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 rounded-xl text-xs">Clear</button>
      </div>
    </div>
  );
}

/* Three-Card Monte */
function ThreeCardMonte() {
  const [bet, setBet] = useState(500);
  const [phase, setPhase] = useState<"setup"|"shuffling"|"pick"|"done">("setup");
  const [cards, setCards] = useState(["Q","K","J"]);
  const [pick, setPick] = useState<number|null>(null);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const start = () => {
    setPhase("shuffling"); setPick(null); setResult(null);
    const c = ["Q","K","J"]; let step = 0;
    const iv = setInterval(() => {
      const a=Math.floor(Math.random()*3), b=Math.floor(Math.random()*3);
      if (a!==b) { [c[a],c[b]]=[c[b],c[a]]; setCards([...c]); }
      step++; if (step>=12) { clearInterval(iv); setPhase("pick"); }
    }, 180);
  };
  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} />
      <div className="text-[10px] text-amber-500/60 text-center font-bold">Find the Queen! (3x payout)</div>
      <div className="flex justify-center gap-6 py-4">{cards.map((c,i) => (
        <motion.button key={i} onClick={() => phase==="pick" && setPick(i)}
          animate={phase==="shuffling"?{x:[(i-1)*40,0],rotateY:[0,360]}:{}}
          transition={{duration:0.3}}
          className={"w-20 h-28 rounded-xl text-2xl font-black flex items-center justify-center transition-all border-2 "+
            (phase==="done"?(c==="Q"?"bg-green-900/40 border-green-500/50 text-green-400":pick===i?"bg-red-900/40 border-red-500/50 text-red-400":"bg-slate-800/40 border-slate-600/30 text-slate-500")
            :phase==="pick"?"bg-slate-800/60 border-slate-500/30 text-slate-500 hover:border-amber-500/50 hover:scale-110 cursor-pointer"
            :"bg-slate-800/40 border-slate-600/30 text-slate-600")}>
          {phase==="done"?c:"?"}
        </motion.button>
      ))}</div>
      {phase==="shuffling" && <div className="text-center text-amber-400 text-xs animate-pulse font-bold">Shuffling cards...</div>}
      {result && <WB won={result.won} amount={result.amount} text={result.won?"Queen found! 3x WIN!":"Wrong card!"} />}
      <div className="flex justify-center">
        {(phase==="setup"||phase==="done") && <button onClick={start} className="px-6 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">Shuffle & Play</button>}
        {pick!==null && phase==="pick" && <button onClick={()=>{setResult({won:cards[pick]==="Q",amount:cards[pick]==="Q"?bet*3:bet});setPhase("done");}} className="px-6 py-3 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">I Pick This One!</button>}
      </div>
    </div>
  );
}

/* Russian Roulette */
function RussianRoulette() {
  const [bet, setBet] = useState(1000);
  const [pulled, setPulled] = useState(0);
  const [alive, setAlive] = useState(true);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const cyl = 6;
  const pull = () => {
    const p = pulled+1; setPulled(p);
    if (Math.random() < p/cyl) { setAlive(false); setResult({won:false,amount:bet}); }
    else if (p >= cyl) { setResult({won:true,amount:bet*cyl}); }
  };
  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} presets={[500,1000,5000,25000]} />
      <div className="bg-gradient-to-b from-red-900/10 to-black/20 rounded-2xl p-6 border border-red-900/20 text-center space-y-4">
        <motion.div animate={alive?{rotate:[0,-5,5,0]}:{scale:[1,1.5,0]}} transition={alive?{repeat:Infinity,duration:2}:{duration:0.5}} className="text-7xl">{alive?"\ud83d\udd2b":"\ud83d\udc80"}</motion.div>
        <div className="flex justify-center gap-1">{Array.from({length:cyl},(_,i)=>(
          <div key={i} className={"w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all "+
            (i<pulled?(alive?"bg-green-900/40 border-green-500/40 text-green-400":"bg-red-900/40 border-red-500/40 text-red-400"):"bg-slate-800/40 border-slate-600/30 text-slate-500")}>
            {i<pulled?(alive?"\u2713":"x"):"\u25cf"}
          </div>
        ))}</div>
        {alive && !result && <div className="text-sm text-amber-400 font-bold">Pull {pulled+1}/{cyl} - Bonus grows each pull!</div>}
        {!alive && <div className="text-red-400 text-sm font-bold">The chamber was loaded...</div>}
      </div>
      {result && <WB won={result.won} amount={result.amount} text={result.won?"Survived all "+cyl+" rounds! MASSIVE WIN!":"BANG! Game over."} />}
      <div className="flex justify-center gap-2">
        {alive && !result && <button onClick={pull} className="px-8 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-sm font-black uppercase shadow-lg shadow-red-900/30 hover:scale-105 transition-all">PULL TRIGGER</button>}
        {result && <button onClick={()=>{setPulled(0);setAlive(true);setResult(null);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">NEW GAME</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">1 bullet in 6 chambers. Survive all 6 pulls = {cyl}x your bet. Danger grows each pull.</div>
    </div>
  );
}

/* Coin Flip */
function CoinFlip() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"H"|"T">("H");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{won:boolean;amount:number;face:string}|null>(null);
  const flip = () => { setFlipping(true); setResult(null);
    setTimeout(()=>{ const f=Math.random()>0.5?"H":"T"; setResult({won:f===pick,amount:f===pick?bet*2:bet,face:f}); setFlipping(false); }, 1500);
  };
  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      <div className="flex justify-center gap-6">{(["H","T"] as const).map(f=>(
        <button key={f} onClick={()=>setPick(f)} className={"w-28 h-28 rounded-full text-lg font-black border-2 transition-all flex items-center justify-center "+(pick===f?"bg-amber-600/20 border-amber-500/50 text-amber-300 scale-110 shadow-lg shadow-amber-900/20":"bg-slate-800/30 border-slate-600/30 text-slate-500")}>
          {f==="H"?"\ud83e\ude99 Heads":"\ud83e\ude99 Tails"}
        </button>
      ))}</div>
      <div className="flex justify-center">
        {flipping && <motion.div animate={{rotateY:[0,720]}} transition={{duration:1.5}} className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 shadow-xl flex items-center justify-center text-2xl font-black text-amber-900">$</motion.div>}
      </div>
      {result && <><div className="text-center text-4xl font-black text-amber-400">{result.face==="H"?"Heads":"Tails"}</div><WB won={result.won} amount={result.amount} /></>}
      <div className="flex justify-center"><button onClick={flip} disabled={flipping} className="px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">{flipping?"FLIPPING...":"FLIP"}</button></div>
      <div className="text-center text-[9px] text-slate-600">50/50 coin flip. Pick Heads or Tails. 2x payout.</div>
    </div>
  );
}

/* The Don's Game */
function DonsGame() {
  const [bet, setBet] = useState(10000);
  const [pc, setPc] = useState<Card[]>([]);
  const [dc, setDc] = useState<Card[]>([]);
  const [result, setResult] = useState<{won:boolean;amount:number;msg:string}|null>(null);
  const play = () => { const d=makeDeck();
    setPc(Array.from({length:5},()=>d.pop()!));
    setDc(Array.from({length:5},()=>d.pop()!));
    const pv=Array.from({length:5},()=>d.pop()!).reduce((s,c)=>s+c.value,0);
    const dv=Array.from({length:5},()=>d.pop()!).reduce((s,c)=>s+c.value,0);
    const w = pv>dv;
    setResult({won:w,amount:w?bet*3:bet,msg:w?"You outsmarted The Don!":"The Don always wins. Pay up."});
  };
  return (
    <div className="space-y-4">
      <BI value={bet} onChange={setBet} presets={[5000,10000,50000,100000]} />
      {pc.length>0 && <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-4 border border-amber-900/20">
          <div className="text-[10px] text-amber-500/60 font-bold mb-2 text-center">Your Hand</div>
          <div className="flex gap-1 flex-wrap justify-center">{pc.map((c,i)=><PC key={c.id} card={c} d={i*0.1} sm />)}</div>
        </div>
        <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20">
          <div className="text-[10px] text-red-500/60 font-bold mb-2 text-center">The Don</div>
          <div className="flex gap-1 flex-wrap justify-center">{dc.map((c,i)=><PC key={c.id} card={c} d={i*0.1+0.5} sm />)}</div>
        </div>
      </div>}
      {result && <div className={"rounded-xl p-4 text-center border "+(result.won?"bg-amber-900/15 border-amber-600/30":"bg-red-900/15 border-red-600/30")}>
        <div className={"text-lg font-black "+(result.won?"text-amber-400":"text-red-400")}>{result.msg}</div>
        <div className={"text-sm font-bold mt-1 "+(result.won?"text-amber-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {!result?<button onClick={play} className="px-8 py-3 bg-gradient-to-b from-red-700 to-red-900 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Challenge The Don</button>
        :<button onClick={()=>{setPc([]);setDc([]);setResult(null);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs hover:scale-105 transition-all">Play Again</button>}
      </div>
      <div className="text-center text-[9px] text-red-600/60">High stakes only. 3x payout if you beat The Don.</div>
    </div>
  );
}
/* ═══════════ CATEGORY PAGES ═══════════ */
function CasinoPage() {
  const [g, setG] = useState("bj");
  const tabs = [["bj","Blackjack"],["bacc","Baccarat"],["poker","Texas Hold'em"]];
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="bj"?<BlackjackGame/>:g==="bacc"?<BaccaratGame/>:<PokerGame/>}</div>
    </div>
  );
}

function TablePage() {
  const [g, setG] = useState("roulette");
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">{[["roulette","European Roulette"],["craps","Craps"]].map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="roulette"?<RouletteGame/>:<CrapsGame/>}</div>
    </div>
  );
}

function SlotsPage() {
  const [type, setType] = useState("classic");
  const tabs = [["classic","Classic 3-Reel"],["video","Video 5-Reel"],["progressive","Progressive"],["megaways","Megaways"]];
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setType(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(type===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">
        {type==="classic" ? <SlotsGame symbols={["\ud83c\udf52","\ud83c\udf4b","\ud83c\udf4a","\ud83c\udf49","\ud83d\udc8e","7","\u2b50","\ud83d\udd14"]} payouts={{"\ud83c\udf52":5,"\ud83c\udf4b":8,"\ud83c\udf4a":10,"\ud83c\udf49":15,"\ud83d\udc8e":50,"7":75,"\u2b50":30,"\ud83d\udd14":20}} /> :
        type==="video" ? <SlotsGame symbols={["\ud83c\udf52","\ud83d\udc8e","\ud83d\udd25","\u2b50","\ud83d\udc51","\ud83d\udcb0","7"]} payouts={{"\ud83c\udf52":3,"\ud83d\udc8e":25,"\ud83d\udd25":20,"\u2b50":15,"\ud83d\udc51":100,"\ud83d\udcb0":40,"7":50}} reels={5} lines={3} /> :
        type==="progressive" ? <SlotsGame symbols={["\ud83d\udc8e","\ud83d\udc51","\ud83d\udcb0","7","\u2b50"]} payouts={{"\ud83d\udc8e":100,"\ud83d\udc51":200,"\ud83d\udcb0":150,"7":500,"\u2b50":60}} reels={5} /> :
        <SlotsGame symbols={["\ud83c\udf52","\ud83d\udc8e","\ud83d\udd25","\u2b50","\ud83d\udc51","\ud83d\udcb0","7","\ud83d\udccf","\ud83d\udc8e"]} payouts={{"\ud83c\udf52":2,"\ud83d\udc8e":20,"\ud83d\udd25":15,"\u2b50":10,"\ud83d\udc51":50,"\ud83d\udcb0":30,"7":40,"\ud83d\udccf":8}} reels={6} lines={5} />}
      </div>
    </div>
  );
}

function SportsPage() {
  return <div className="space-y-4"><div className="mafia-card rounded-2xl p-6"><HorseRace /></div></div>;
}

function NumbersPage() {
  return <div className="space-y-4"><div className="mafia-card rounded-2xl p-6"><KenoGame /></div></div>;
}

function DicePage() {
  return <div className="space-y-4"><div className="mafia-card rounded-2xl p-6"><CrapsGame /></div></div>;
}

function StreetPage() {
  const [g, setG] = useState("monte");
  const tabs = [["monte","Three-Card Monte"],["roulette","Russian Roulette"],["coin","Coin Flip"]];
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="monte"?<ThreeCardMonte/>:g==="roulette"?<RussianRoulette/>:<CoinFlip/>}</div>
    </div>
  );
}

function MafiaPage() {
  return <div className="space-y-4"><div className="mafia-card rounded-2xl p-6 border-red-900/20"><DonsGame /></div></div>;
}

/* ═══════════ MAIN EXPORT ═══════════ */
export function GamblingOverviewPage() {
  const [cat, setCat] = useState("casino");
  const cats: [string, string][] = [
    ["casino","Casino"],["cards","Card Games"],["instant","Instant Win"],["dice","Dice Arena"],
    ["fun","Fun Games"],["poker","Poker Lounge"],["tables","Table Games"],["slots","Slots"],
    ["sports","Sports"],["numbers","Lottery"],["wheel","Wheel Games"],
    ["street","Street"],["highroller","High Roller VIP"],["mafia","Mafia"],
    ["baccarat","Baccarat Room"],["roulette","Roulette Royale"],["dicepalace","Dice Palace"],
    ["wheel2","Wheel & Fortune"],["asian","Asian Games"],["vpoker","Video Poker"],
    ["bingo","Bingo Hall"],["lottery2","Lottery Suite"],["sportsbook","Sportsbook"],["mystery","Mystery Games"]
  ];
  const pages: Record<string, React.ReactNode> = {
    casino: <CasinoPage />, cards: <CardGamesPage />, instant: <InstantWinPage />, dice: <DiceArenaPage />,
    fun: <FunGamesPage />, poker: <PokerLoungePage />, tables: <TablePage />, slots: <SlotsPage />,
    sports: <SportsPage />, numbers: <LotteryPage />, wheel: <WheelPage />,
    street: <StreetPage />, highroller: <HighRollerPage />, mafia: <MafiaPage />,
    baccarat: <BaccaratRoomPage />, roulette: <RouletteRoyalePage />, dicepalace: <DicePalacePage />,
    wheel2: <WheelFortunePage />, asian: <AsianGamesPage />, vpoker: <VideoPokerLoungePage />,
    bingo: <BingoHallPage />, lottery2: <LotterySuitePage />, sportsbook: <SportsbookPage />, mystery: <MysteryGamesPage />
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{"\ud83c\udfb0"}</span>
        <div>
          <h2 className="text-xl font-black text-amber-400 tracking-tight">The Gambling Den</h2>
          <p className="text-[10px] text-slate-500">Underground casino - fortunes made and lost in the shadows</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {cats.map(([k,l])=>(
          <button key={k} onClick={()=>setCat(k)}
            className={"px-3 py-2 rounded-xl text-xs font-bold transition-all border "+(cat===k?"bg-amber-600/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-900/20":"border-slate-800/20 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
            {l}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={cat} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
          {pages[cat]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
/* ═══════════ VIDEO POKER (Jacks or Better) ═══════════ */
function VideoPokerGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [deck, setDeck] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"bet"|"hold"|"done">("bet");
  const [result, setResult] = useState<{won:boolean;amount:number;handName:string}|null>(null);
  const [stats, setStats] = useState({w:0,l:0});

  const evalPoker = (cards:Card[]):{rank:number;name:string} => {
    const vals = cards.map(c=>c.value).sort((a,b)=>b-a);
    const suits = cards.map(c=>c.suit);
    const isFlush = suits.every(s=>s===suits[0]);
    const uniq = [...new Set(vals)];
    const isStraight = (uniq.length>=5 && vals[0]-vals[4]<=4) || (vals[0]===14&&vals[1]===5&&vals[2]===4&&vals[3]===3&&vals[4]===2);
    const counts:Record<number,number>={}; vals.forEach(v=>counts[v]=(counts[v]||0)+1);
    const freq = Object.values(counts).sort((a,b)=>b-a);
    if (isFlush&&isStraight) return {rank:8,name:"Straight Flush"};
    if (freq[0]===4) return {rank:7,name:"Four of a Kind"};
    if (freq[0]===3&&freq[1]===2) return {rank:6,name:"Full House"};
    if (isFlush) return {rank:5,name:"Flush"};
    if (isStraight) return {rank:4,name:"Straight"};
    if (freq[0]===3) return {rank:3,name:"Three of a Kind"};
    if (freq[0]===2&&freq[1]===2) return {rank:2,name:"Two Pair"};
    if (freq[0]===2) {
      const pairs = Object.entries(counts).filter(([,c])=>c===2).map(([r])=>Number(r));
      if (pairs.some(p=>p>=11)) return {rank:1,name:"Jacks or Better"};
      return {rank:0,name:"Nothing"};
    }
    return {rank:0,name:"Nothing"};
  };

  const payouts: Record<number,number> = {8:250,7:100,6:40,5:25,4:15,3:9,2:5,1:2,0:0};

  const deal = () => {
    const d = makeDeck(); const h = Array.from({length:5},()=>d.pop()!);
    setDeck(d); setHand(h); setHeld(new Set()); setPhase("hold"); setResult(null);
  };

  const draw = () => {
    const d = [...deck]; const newHand = [...hand];
    for (let i=0; i<5; i++) { if (!held.has(i)) newHand[i] = d.pop()!; }
    setHand(newHand); setDeck(d);
    const ev = evalPoker(newHand);
    const win = payouts[ev.rank] || 0;
    const amt = bet * win;
    setResult({won:amt>0,amount:amt,handName:ev.name});
    setStats(s=>({w:s.w+(amt>0?1:0),l:s.l+(amt>0?0:1)}));
    setPhase("done");
  };

  const toggleHold = (i:number) => {
    if (phase!=="hold") return;
    const nh = new Set(held); if (nh.has(i)) nh.delete(i); else nh.add(i); setHeld(nh);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-4 text-[10px] font-mono">
        <span className="text-green-600/70">W:{stats.w}</span>
        <span className="text-red-600/70">L:{stats.l}</span>
        <span className="text-amber-500/70">Bet:{"$"}{bet}</span>
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000,5000]} />
      <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20">
        <div className="text-[10px] uppercase text-emerald-600/50 font-bold mb-3 text-center">Your Hand {phase==="hold"?"(Tap cards to hold)":""}</div>
        <div className="flex gap-3 justify-center">
          {hand.map((c,i)=>(
            <button key={c.id} onClick={()=>toggleHold(i)}
              className={"relative transition-all "+(held.has(i)?"-translate-y-2 scale-105":"")}>
              <PC card={c} d={i*0.1} />
              {phase==="hold"&&<div className={"absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded "+(held.has(i)?"bg-green-600 text-white":"bg-slate-700 text-slate-400")}>{held.has(i)?"HELD":"HOLD"}</div>}
            </button>
          ))}
        </div>
      </div>
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-gradient-to-b from-green-900/30 to-green-950/20 border-green-500/30":"bg-gradient-to-b from-red-900/30 to-red-950/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.handName}</div>
        <div className={"text-sm font-bold mt-1 "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="bet"&&<button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Deal</button>}
        {phase==="hold"&&<button onClick={draw} className="px-8 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Draw ({held.size} held)</button>}
        {phase==="done"&&<button onClick={()=>{setHand([]);setPhase("bet");setResult(null);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">New Hand</button>}
      </div>
      <div className="text-[9px] text-slate-600 text-center space-y-0.5">
        <p>Jacks or Better pays 2x &middot; Two Pair 5x &middot; Three of a Kind 9x</p>
        <p>Straight 15x &middot; Flush 25x &middot; Full House 40x &middot; Quads 100x &middot; Str.Flush 250x</p>
      </div>
    </div>
  );
}

/* ═══════════ PAI GOW POKER ═══════════ */
function PaiGowGame() {
  const [bet, setBet] = useState(1000);
  const [playerCards, setPC] = useState<Card[]>([]);
  const [dealerCards, setDC] = useState<Card[]>([]);
  const [result, setResult] = useState<{won:boolean;amount:number;msg:string}|null>(null);

  const handRank = (cards:Card[]):number => {
    const vals = cards.map(c=>c.value).sort((a,b)=>b-a);
    const suits = cards.map(c=>c.suit);
    const isFlush = suits.every(s=>s===suits[0]);
    const uniq = [...new Set(vals)];
    const isStraight = uniq.length>=5&&vals[0]-vals[4]<=4;
    const counts:Record<number,number>={}; vals.forEach(v=>counts[v]=(counts[v]||0)+1);
    const freq = Object.values(counts).sort((a,b)=>b-a);
    if (isFlush&&isStraight) return 8;
    if (freq[0]===4) return 7;
    if (freq[0]===3&&freq[1]===2) return 6;
    if (isFlush) return 5;
    if (isStraight) return 4;
    if (freq[0]===3) return 3;
    if (freq[0]===2&&freq[1]===2) return 2;
    if (freq[0]===2) return 1;
    return 0;
  };

  const compareHands = (p:[Card[],Card[]], d:[Card[],Card[]]):number => {
    const pHigh = handRank(p[0]); const pLow = handRank(p[1]);
    const dHigh = handRank(d[0]); const dLow = handRank(d[1]);
    let wins = 0;
    if (pHigh>dHigh||(pHigh===dHigh&&p[0].reduce((s,c)=>s+c.value,0)>d[0].reduce((s,c)=>s+c.value,0))) wins++;
    else wins--;
    if (pLow>dLow||(pLow===dLow&&p[1].reduce((s,c)=>s+c.value,0)>d[1].reduce((s,c)=>s+c.value,0))) wins++;
    else wins--;
    return wins;
  };

  const deal = () => {
    const d = makeDeck();
    const all = Array.from({length:7},()=>d.pop()!);
    const high = all.slice(0,5).sort((a,b)=>b.value-a.value);
    const low = all.slice(5,7).sort((a,b)=>b.value-a.value);
    const dHigh = Array.from({length:5},()=>d.pop()!).sort((a,b)=>b.value-a.value);
    const dLow = Array.from({length:2},()=>d.pop()!).sort((a,b)=>b.value-a.value);
    setPC([...high,...low]); setDC([...dHigh,...dLow]);
    const w = compareHands([high,low],[dHigh,dLow]);
    setResult({won:w>0,amount:w>0?bet:w===0?0:bet,msg:w>0?"You win both hands!":w===0?"Push - Split":`Dealer wins ${Math.abs(w)} hand${Math.abs(w)>1?"s":""}`});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[500,1000,5000,25000]} />
      {playerCards.length>0&&<div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-4 border border-amber-900/20 text-center">
          <div className="text-[10px] text-amber-500/60 font-bold mb-1">High Hand (5)</div>
          <div className="flex gap-1 justify-center flex-wrap">{playerCards.slice(0,5).map((c,i)=><PC key={c.id} card={c} d={i*0.1} sm />)}</div>
          <div className="text-[10px] text-amber-400/60 font-bold mt-1">Low Hand (2)</div>
          <div className="flex gap-1 justify-center">{playerCards.slice(5).map((c,i)=><PC key={c.id} card={c} d={i*0.1+0.5} sm />)}</div>
        </div>
        <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
          <div className="text-[10px] text-red-500/60 font-bold mb-1">Dealer High (5)</div>
          <div className="flex gap-1 justify-center flex-wrap">{dealerCards.slice(0,5).map((c,i)=><PC key={c.id} card={c} d={i*0.1+0.3} sm />)}</div>
          <div className="text-[10px] text-red-400/60 font-bold mt-1">Dealer Low (2)</div>
          <div className="flex gap-1 justify-center">{dealerCards.slice(5).map((c,i)=><PC key={c.id} card={c} d={i*0.1+0.8} sm />)}</div>
        </div>
      </div>}
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":result.amount===0?"bg-slate-800/20 border-slate-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":result.amount===0?"text-slate-400":"text-red-400")}>{result.msg}</div>
        {result.amount>0&&<div className={"text-sm font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>}
      </div>}
      <div className="flex justify-center gap-3">
        {!result?<button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Deal</button>
        :<button onClick={()=>{setPC([]);setDC([]);setResult(null);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">New Hand</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Pai Gow Poker - Split 7 cards into High (5) and Low (2). Win both to win!</div>
    </div>
  );
}

/* ═══════════ CARIBBEAN STUD POKER ═══════════ */
function CaribbeanStudGame() {
  const [bet, setBet] = useState(500);
  const [ante, setAnte] = useState(0);
  const [playerHand, setPH] = useState<Card[]>([]);
  const [dealerHand, setDH] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"bet"|"play"|"done">("bet");
  const [result, setResult] = useState<{won:boolean;amount:number;handName:string}|null>(null);
  const [raise, setRaise] = useState(0);

  const evalRank = (cards:Card[]):{rank:number;name:string} => {
    const vals = cards.map(c=>c.value).sort((a,b)=>b-a);
    const suits = cards.map(c=>c.suit);
    const isFlush = suits.every(s=>s===suits[0]);
    const uniq = [...new Set(vals)];
    const isStraight = uniq.length>=5&&vals[0]-vals[4]<=4;
    const counts:Record<number,number>={}; vals.forEach(v=>counts[v]=(counts[v]||0)+1);
    const freq = Object.values(counts).sort((a,b)=>b-a);
    if (isFlush&&isStraight) return {rank:8,name:"Straight Flush"};
    if (freq[0]===4) return {rank:7,name:"Four of a Kind"};
    if (freq[0]===3&&freq[1]===2) return {rank:6,name:"Full House"};
    if (isFlush) return {rank:5,name:"Flush"};
    if (isStraight) return {rank:4,name:"Straight"};
    if (freq[0]===3) return {rank:3,name:"Three of a Kind"};
    if (freq[0]===2&&freq[1]===2) return {rank:2,name:"Two Pair"};
    if (freq[0]===2) return {rank:1,name:"One Pair"};
    return {rank:0,name:"High Card"};
  };

  const deal = () => {
    const d = makeDeck();
    const ph = Array.from({length:5},()=>d.pop()!);
    const dh = Array.from({length:5},()=>d.pop()!);
    setPH(ph); setDH(dh); setAnte(bet); setPhase("play"); setResult(null);
  };

  const doPlay = (doRaise:boolean) => {
    const raiseAmt = doRaise ? bet * 2 : 0;
    setRaise(raiseAmt);
    const dRank = evalRank(dealerHand);
    const pRank = evalRank(playerHand);
    const dealerQualifies = dRank.rank >= 1;

    if (!dealerQualifies) {
      setResult({won:true,amount:ante+raiseAmt,handName:"Dealer doesn't qualify! Ante pays 1:1"});
    } else if (pRank.rank > dRank.rank || (pRank.rank===dRank.rank && playerHand.reduce((s,c)=>s+c.value,0)>dealerHand.reduce((s,c)=>s+c.value,0))) {
      setResult({won:true,amount:ante+raiseAmt*2,handName:pRank.name+" beats dealer!"});
    } else {
      setResult({won:false,amount:ante+raiseAmt,handName:dRank.name+" beats you"});
    }
    setPhase("done");
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      {dealerHand.length>0&&<div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
        <div className="text-[10px] text-red-500/60 font-bold mb-2">Dealer {phase==="play"?"(First card hidden)":""}</div>
        <div className="flex gap-1.5 justify-center">{dealerHand.map((c,i)=><PC key={c.id} card={c} fd={phase==="play"&&i===0} d={i*0.15} sm />)}</div>
      </div>}
      {playerHand.length>0&&<div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-4 border border-amber-900/20 text-center">
        <div className="text-[10px] text-amber-500/60 font-bold mb-2">Your Hand ({evalRank(playerHand).name})</div>
        <div className="flex gap-1.5 justify-center">{playerHand.map((c,i)=><PC key={c.id} card={c} d={i*0.15} sm />)}</div>
      </div>}
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.handName}</div>
        <div className={"text-sm font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-3">
        {phase==="bet"&&<button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Ante {"$"}{bet}</button>}
        {phase==="play"&&<>
          <button onClick={()=>doPlay(true)} className="px-6 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all">RAISE {"$"}{bet*2}</button>
          <button onClick={()=>doPlay(false)} className="px-6 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all">FOLD</button>
        </>}
        {phase==="done"&&<button onClick={()=>{setPH([]);setDH([]);setResult(null);setPhase("bet");}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">New Hand</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Caribbean Stud - Dealer must qualify (pair+). Raise with strong hands for 2x payout.</div>
    </div>
  );
}

/* ═══════════ SIC BO ═══════════ */
function SicBoGame() {
  const [bet, setBet] = useState(500);
  const [betType, setBetType] = useState("big");
  const [dice, setDice] = useState<[number,number,number]>([0,0,0]);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{won:boolean;amount:number;total:number}|null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const roll = () => {
    setRolling(true); setResult(null);
    setTimeout(()=>{
      const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1, d3=Math.floor(Math.random()*6)+1;
      const total=d1+d2+d3; const isTri=d1===d2&&d2===d3;
      setDice([d1,d2,d3]); setHistory(prev=>[total,...prev].slice(0,15));
      let won=false, mult=0;
      if (betType==="big"&&total>=11&&total<=17&&!isTri) {won=true;mult=2;}
      else if (betType==="small"&&total>=4&&total<=10&&!isTri) {won=true;mult=2;}
      else if (betType==="odd"&&total%2===1&&!isTri) {won=true;mult=2;}
      else if (betType==="even"&&total%2===0&&!isTri) {won=true;mult=2;}
      else if (betType==="triple"&&isTri) {won=true;mult=30;}
      else if (betType==="any_triple"&&isTri) {won=true;mult=8;}
      else if (betType==="specific"&&total===11) {won=true;mult=6;}
      else if (betType==="range1"&&total>=4&&total<=10) {won=true;mult=2;}
      else if (betType==="range2"&&total>=11&&total<=17) {won=true;mult=2;}
      setResult({won,amount:won?bet*mult:bet,total}); setRolling(false);
    },1200);
  };

  const bets=[{id:"big",l:"Big (11-17)",x:"2x",d:"No triples"},{id:"small",l:"Small (4-10)",x:"2x",d:"No triples"},{id:"odd",l:"Odd",x:"2x",d:"No triples"},{id:"even",l:"Even",x:"2x",d:"No triples"},{id:"triple",l:"Specific Triple",x:"30x",d:"All 3 match"},{id:"any_triple",l:"Any Triple",x:"8x",d:"Any 3 match"},{id:"specific",l:"Total = 11",x:"6x",d:"Exact total"},{id:"range1",l:"4-10 Low",x:"2x",d:"Low range"},{id:"range2",l:"11-17 High",x:"2x",d:"High range"}];

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20 text-center">
        <div className="flex justify-center gap-4 items-center">
          {dice.map((d,i)=>d>0?<motion.div key={i} initial={{rotateX:90}} animate={{rotateX:0}} transition={{delay:i*0.1}}><Die value={d} /></motion.div>:<Die key={i} value={1} />)}
        </div>
        {dice[0]>0&&<div className="text-2xl font-black text-amber-400 mt-3">Total: {dice[0]+dice[1]+dice[2]}</div>}
        {dice[0]===0&&<div className="text-emerald-700/30 text-sm py-4">Roll 3 dice</div>}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {bets.map(b=>(
          <button key={b.id} onClick={()=>!rolling&&setBetType(b.id)}
            className={"px-2 py-2.5 rounded-lg text-[10px] font-bold transition-all border flex flex-col items-center gap-0.5 "+(betType===b.id?"border-amber-500/50 bg-amber-600/20 text-amber-300 shadow-lg":"border-slate-800/30 text-slate-500")}>
            <span>{b.l}</span><span className="text-[8px] opacity-60">{b.x}</span><span className="text-[7px] opacity-40">{b.d}</span>
          </button>
        ))}
      </div>
      {history.length>0&&<div className="flex gap-1 flex-wrap">{history.slice(0,12).map((h,i)=>(<span key={i} className={"px-2 py-0.5 rounded text-[10px] font-bold "+(h===7?"bg-green-900/30 text-green-400":(h<=4||h>=17)?"bg-red-900/30 text-red-400":"bg-slate-800/40 text-slate-400")}>{h}</span>))}</div>}
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"YOU WIN":"LOSE"}</div>
        <div className={"text-sm font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={roll} disabled={rolling} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase tracking-wider shadow-xl shadow-amber-900/30 hover:scale-105 transition-all">{rolling?"ROLLING...":"ROLL DICE"}</button></div>
      <div className="text-center text-[9px] text-slate-600">Sic Bo - Three dice game. Big/Small, Odd/Even, Triples, and more.</div>
    </div>
  );
}

/* ═══════════ LIAR'S DICE ═══════════ */
function LiarsDiceGame() {
  const [bet, setBet] = useState(500);
  const [playerDice, setPD] = useState<number[]>([]);
  const [aiDice, setAD] = useState<number[]>([]);
  const [totalDice, setTotalDice] = useState(10);
  const [phase, setPhase] = useState<"bet"|"roll"|"bid"|"reveal"|"done">("bet");
  const [bid, setBid] = useState<{qty:number;face:number}|null>(null);
  const [aiBid, setAiBid] = useState<{qty:number;face:number}|null>(null);
  const [result, setResult] = useState<{won:boolean;amount:number;msg:string}|null>(null);
  const [allDice, setAllDice] = useState<number[]>([]);

  const rollAll = () => {
    const pd = Array.from({length:5},()=>Math.floor(Math.random()*6)+1);
    const ad = Array.from({length:5},()=>Math.floor(Math.random()*6)+1);
    setPD(pd); setAD(ad); setAllDice([...pd,...ad]); setPhase("bid"); setBid(null); setAiBid(null);
  };

  const makeBid = (qty:number, face:number) => {
    setBid({qty,face});
    // AI makes a smarter bid
    const aiCount = aiDice.filter(d=>d===face||d===1).length;
    const aiChance = aiCount/5;
    let aq=qty, af=face;
    if (Math.random()<0.4&&face<6) {af=face+1;}
    else if (Math.random()<0.3) {aq=qty+1;}
    else if (bid&&qty<=bid.qty&&face<=bid.face) {aq=bid.qty+1; af=bid.face;}
    else {aq=qty+1;}
    setAiBid({qty:aq,face:af}); setPhase("reveal");
  };

  const callLiar = () => {
    if (!bid) return;
    const actual = allDice.filter(d=>d===bid.face||d===1).length;
    const won = actual < bid.qty;
    setResult({won,amount:won?bet:bet,msg:won?`Liar! Only ${actual} ${bid.face}s on table.`:`Truth! ${actual} ${bid.face}s. You lose.`});
    setPhase("done");
  };

  const nextRound = () => {
    setPD(prev=>prev.slice(1)); setAD(prev=>prev.slice(1));
    const newTotal = playerDice.length-1+aiDice.length-1;
    if (newTotal<2) {setResult({won:true,amount:bet*3,msg:"Opponent eliminated! MASSIVE WIN!"});setPhase("done");return;}
    setTotalDice(newTotal); rollAll();
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000,5000]} />
      {phase!=="bet"&&<div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-4 border border-amber-900/20 text-center">
          <div className="text-[10px] text-amber-500/60 font-bold mb-2">Your Dice ({playerDice.length})</div>
          <div className="flex gap-1.5 justify-center">{playerDice.map((d,i)=><Die key={i} value={d} size="sm" />)}</div>
        </div>
        <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
          <div className="text-[10px] text-red-500/60 font-bold mb-2">Opponent Dice ({aiDice.length})</div>
          <div className="flex gap-1.5 justify-center">{aiDice.map((_,i)=><div key={i} className="w-10 h-14 rounded-xl bg-slate-800/60 border border-slate-600/30 flex items-center justify-center text-slate-600 text-xs">?</div>)}</div>
        </div>
      </div>}
      {phase==="reveal"&&bid&&aiBid&&<div className="text-center space-y-2">
        <div className="text-amber-400 text-sm font-bold">Your bid: {bid.qty}x {bid.face}s</div>
        <div className="text-red-400 text-sm font-bold">AI calls: {aiBid.qty}x {aiBid.face}s (higher)</div>
        <div className="text-[10px] text-slate-500">Actual count of {bid.face}s on table: {allDice.filter(d=>d===bid.face||d===1).length}</div>
        <button onClick={nextRound} className="px-6 py-2 bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold">Next Round</button>
      </div>}
      {phase==="bid"&&<div className="flex gap-2 justify-center flex-wrap">
        {[1,2,3,4,5,6].map(f=>(
          <div key={f} className="flex flex-col gap-1">
            <span className="text-[10px] text-center text-slate-500 font-bold">{f}s</span>
            {[1,2,3,4,5,6,7,8].map(q=>(
              <button key={q} onClick={()=>makeBid(q,f)} className="px-2 py-1 bg-slate-800/40 border border-slate-700/30 text-[10px] text-slate-400 rounded hover:bg-amber-600/20 hover:text-amber-300 hover:border-amber-500/30 transition-all">{q}x</button>
            ))}
          </div>
        ))}
      </div>}
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.msg}</div>
        <div className={"text-sm font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="bet"&&<button onClick={()=>{setPhase("roll");rollAll();}} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Start</button>}
        {phase==="bid"&&<button onClick={callLiar} className="px-6 py-2.5 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all">LIAR!</button>}
        {phase==="done"&&<button onClick={()=>{setPhase("bet");setResult(null);}} className="px-6 py-3 bg-gradient-to-b from-slate-600 to-slate-800 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all">New Game</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Liar's Dice - Bluff your opponent. Call "Liar!" when you think they're lying.</div>
    </div>
  );
}

/* ═══════════ WHEEL OF FORTUNE ═══════════ */
function WheelOfFortuneGame() {
  const [bet, setBet] = useState(500);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{won:boolean;amount:number;segment:string}|null>(null);
  const [angle, setAngle] = useState(0);

  const segments = [
    {label:"$100",mult:0.2,color:"#22c55e"},
    {label:"$250",mult:0.5,color:"#3b82f6"},
    {label:"$500",mult:1,color:"#8b5cf6"},
    {label:"$1000",mult:2,color:"#f59e0b"},
    {label:"$2500",mult:5,color:"#ef4444"},
    {label:"$5000",mult:10,color:"#ec4899"},
    {label:"JACKPOT",mult:50,color:"#eab308"},
    {label:"BANKRUPT",mult:0,color:"#1f2937"},
    {label:"$100",mult:0.2,color:"#22c55e"},
    {label:"$500",mult:1,color:"#8b5cf6"},
    {label:"$1500",mult:3,color:"#f97316"},
    {label:"SPIN AGAIN",mult:0,color:"#6b7280"},
  ];

  const spin = () => {
    setSpinning(true); setResult(null);
    const targetIdx = Math.floor(Math.random()*segments.length);
    const segAngle = 360/segments.length;
    const finalAngle = 1440 + (360 - targetIdx*segAngle - segAngle/2);
    setAngle(finalAngle);
    setTimeout(()=>{
      const seg = segments[targetIdx];
      const won = seg.mult > 0;
      setResult({won,amount:Math.floor(bet*seg.mult),segment:seg.label});
      setSpinning(false);
    },3500);
  };

  const segAngle = 360/segments.length;

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      <div className="flex justify-center py-4">
        <div className="relative w-48 h-48">
          <motion.div animate={spinning?{rotate:-angle}:{}} transition={{duration:3.5,ease:[0.2,0.8,0.3,1]}}
            className="w-full h-full rounded-full border-4 border-amber-600/50 shadow-2xl overflow-hidden relative"
            style={{background:segments.map((s,i)=>`${s.color} ${i*segAngle}deg ${(i+1)*segAngle}deg`).join(",")}}>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-400 shadow-xl flex items-center justify-center">
              {result?<motion.span initial={{scale:0}} animate={{scale:1}} className="text-[10px] font-black text-black text-center leading-tight">{result.segment}</motion.span>
              :<span className="text-amber-900 text-lg font-black">$</span>}
            </div>
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-5 border-r-5 border-b-10 border-l-transparent border-r-transparent border-b-amber-400" style={{borderLeftWidth:8,borderRightWidth:8,borderBottomWidth:14}} />
        </div>
      </div>
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.segment}</div>
        <div className={"text-sm font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":result.segment==="BANKRUPT"?"-":"+"}{"$"}{(result.won?result.amount:bet).toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={spin} disabled={spinning} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase tracking-wider shadow-xl shadow-amber-900/30 hover:scale-105 transition-all">{spinning?"SPINNING...":"SPIN"}</button></div>
      <div className="text-center text-[9px] text-slate-600">Wheel of Fortune - Spin for cash prizes, jackpot, or bankruptcy!</div>
    </div>
  );
}

/* ═══════════ POWERBALL LOTTERY ═══════════ */
function PowerballGame() {
  const [bet, setBet] = useState(100);
  const [whiteNums, setWN] = useState<number[]>([]);
  const [powerball, setPB] = useState<number|null>(null);
  const [drawn, setDrawn] = useState<{white:number[];red:number}|null>(null);
  const [result, setResult] = useState<{won:boolean;amount:number;matches:number}|null>(null);

  const toggleWhite = (n:number) => {
    if (drawn) return;
    if (whiteNums.includes(n)) setWN(whiteNums.filter(x=>x!==n));
    else if (whiteNums.length<5) setWN([...whiteNums,n]);
  };

  const play = () => {
    const white = Array.from({length:69},(_,i)=>i+1).sort(()=>Math.random()-0.5).slice(0,5).sort((a,b)=>a-b);
    const red = Math.floor(Math.random()*26)+1;
    setDrawn({white,red});
    const wm = whiteNums.filter(n=>white.includes(n)).length;
    const pm = powerball===red;
    let prize = 0;
    if (wm===5&&pm) prize = 1000000;
    else if (wm===5) prize = 100000;
    else if (wm===4&&pm) prize = 10000;
    else if (wm===4) prize = 100;
    else if (wm===3&&pm) prize = 100;
    else if (wm===3) prize = 7;
    else if (wm===2&&pm) prize = 7;
    else if (wm===1&&pm) prize = 4;
    else if (pm) prize = 4;
    setResult({won:prize>0,amount:bet*prize,matches:wm});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[2,5,10,20,100]} min={2} />
      <div className="text-center text-[10px] text-slate-500 font-bold">Pick 5 white numbers (1-69) + 1 red Powerball (1-26)</div>
      <div>
        <div className="text-[10px] text-slate-500 font-bold mb-1">White Numbers ({whiteNums.length}/5)</div>
        <div className="grid grid-cols-10 gap-1">{Array.from({length:69},(_,i)=>i+1).map(n=>{
          const picked=whiteNums.includes(n); const drawn_n=drawn?.white.includes(n);
          return <button key={n} onClick={()=>toggleWhite(n)} className={"w-full aspect-square rounded text-[9px] font-bold transition-all "+(drawn_n?"bg-green-600 text-white ring-1 ring-green-400":picked?"bg-amber-600/40 text-amber-300 border border-amber-500/40":"bg-slate-800/30 text-slate-500 hover:bg-slate-700/40 border border-slate-700/20")}>{n}</button>;
        })}</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-500 font-bold mb-1">Powerball (1-26) {powerball?"["+powerball+"]":""}</div>
        <div className="grid grid-cols-13 gap-1">{Array.from({length:26},(_,i)=>i+1).map(n=>{
          const picked=powerball===n; const drawn_n=drawn?.red===n;
          return <button key={n} onClick={()=>!drawn&&setPB(n)} className={"w-full aspect-square rounded text-[9px] font-bold transition-all "+(drawn_n?"bg-red-600 text-white ring-1 ring-red-400":picked?"bg-red-600/40 text-red-300 border border-red-500/40":"bg-slate-800/30 text-slate-500 hover:bg-slate-700/40 border border-slate-700/20")}>{n}</button>;
        })}</div>
      </div>
      {drawn&&<div className="text-center text-[10px] text-slate-400">
        Drawn: {drawn.white.join(", ")} + <span className="text-red-400 font-bold">{drawn.red}</span>
      </div>}
      {result&&<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.matches} White + {drawn?.red===powerball?"Red":"No Red"} = {result.won?"WINNER!":"No match"}</div>
        {result.amount>0&&<div className="text-sm font-bold text-green-300">+{"$"}{result.amount.toLocaleString()}</div>}
      </div>}
      <div className="flex justify-center gap-2">
        <button onClick={play} disabled={whiteNums.length<5||!powerball||!!drawn} className="px-6 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-700 disabled:opacity-30 text-white rounded-xl text-sm font-bold shadow-lg">Play ({whiteNums.length===5&&powerball?"Ready":"Pick numbers"})</button>
        {drawn&&<button onClick={()=>{setWN([]);setPB(null);setDrawn(null);setResult(null);}} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 rounded-xl text-xs">Clear</button>}
      </div>
    </div>
  );
}

/* ═══════════ SCRATCH CARDS ═══════════ */
function ScratchCardGame() {
  const [bet, setBet] = useState(10);
  const [card, setCard] = useState<string[][]|null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const symbols = ["\ud83d\udc8e","\ud83d\udc51","\ud83d\udcb0","\u2b50","\ud83c\udf1f","\ud83c\udf34","\ud83c\udf51","\ud83d\udd25"];

  const buyCard = () => {
    const g = Array.from({length:3},()=>Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]));
    setCard(g); setRevealed(new Set()); setResult(null);
  };

  const reveal = (r:number,c:number) => {
    if (!card||result) return;
    const key = r+"-"+c;
    const nr = new Set(revealed); nr.add(key); setRevealed(nr);
    if (nr.size===9) {
      // Check for wins
      const flat = card.flat();
      const counts:Record<string,number>={}; flat.forEach(s=>counts[s]=(counts[s]||0)+1);
      const maxCount = Math.max(...Object.values(counts));
      const mult = maxCount>=9?100:maxCount>=7?50:maxCount>=5?20:maxCount>=3?5:0;
      const winAmt = bet*mult;
      setResult({won:winAmt>0,amount:winAmt});
    }
  };

  const revealAll = () => {
    if (!card) return;
    const nr = new Set<string>();
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) nr.add(r+"-"+c);
    setRevealed(nr);
    const flat = card.flat();
    const counts:Record<string,number>={}; flat.forEach(s=>counts[s]=(counts[s]||0)+1);
    const maxCount = Math.max(...Object.values(counts));
    const mult = maxCount>=9?100:maxCount>=7?50:maxCount>=5?20:maxCount>=3?5:0;
    setResult({won:bet*mult>0,amount:bet*mult});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[5,10,25,50,100]} min={5} />
      {card?(
        <div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-5 border border-amber-900/20">
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            {card.map((row,r)=>row.map((sym,c)=>{
              const key=r+"-"+c; const isRevealed=revealed.has(key);
              return <button key={key} onClick={()=>reveal(r,c)} className={"w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border-2 "+(isRevealed?"bg-gradient-to-br from-amber-900/20 to-amber-950/10 border-amber-600/30 scale-100":"bg-slate-800/60 border-slate-600/30 hover:border-amber-500/30 hover:scale-105 cursor-pointer")}>
                {isRevealed?sym:"?"}
              </button>;
            }))}
          </div>
          <div className="text-center text-[9px] text-slate-500 mt-2">{revealed.size}/9 revealed &middot; Match 3+ same symbols to win</div>
        </div>
      ):(
        <div className="text-center py-12 text-slate-600 text-sm">Buy a scratch card to play!</div>
      )}
      {result&&(<div className={"rounded-xl p-4 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-lg font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WINNER!":"No match"}</div>
        {result.amount>0&&<div className="text-sm font-bold text-green-300">+{"$"}{result.amount.toLocaleString()}</div>}
      </div>)}
      <div className="flex justify-center gap-2">
        {!card?<button onClick={buyCard} className="px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-black uppercase shadow-lg shadow-amber-900/30 hover:scale-105 transition-all">Buy Card {"$"}{bet}</button>
        :<><button onClick={revealAll} disabled={!!result} className="px-4 py-2 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold">Reveal All</button>
        <button onClick={()=>{setCard(null);setResult(null);}} className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Card</button></>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Match 3+ same = 5x &middot; Match 5+ = 20x &middot; Match 7+ = 50x &middot; Full house = 100x</div>
    </div>
  );
}
/* ═══════════ NEW CATEGORY PAGES ═══════════ */




function LotteryPage() {
  const [g, setG] = useState("powerball");
  const tabs: [string, string][] = [["powerball","Powerball"],["scratch","Scratch Cards"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Lottery & Scratch</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="powerball"?<PowerballGame/>:<ScratchCardGame/>}</div>
    </div>
  );
}

function AdvancedDicePage() {
  const [g, setG] = useState("sicbo");
  const tabs: [string, string][] = [["sicbo","Sic Bo (3 Dice)"],["liars","Liar's Dice"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Dice Games</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="sicbo"?<SicBoGame/>:<LiarsDiceGame/>}</div>
    </div>
  );
}

function WheelPage() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Wheel Games</h3>
      <div className="mafia-card rounded-2xl p-6"><WheelOfFortuneGame/></div>
    </div>
  );
}
/* ═══════════ CRASH (Multiplier) ═══════════ */
function CrashGame() {
  const [bet, setBet] = useState(500);
  const [phase, setPhase] = useState<"bet"|"running"|"crashed"|"cashed">("bet");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [profit, setProfit] = useState(0);

  const start = () => {
    const cp = Math.max(1.0, parseFloat((Math.random()*9+1).toFixed(2)));
    setCrashPoint(cp); setMultiplier(1.0); setPhase("running");
    let m = 1.0;
    const iv = setInterval(() => {
      m = parseFloat((m + 0.01 + m * 0.005).toFixed(2));
      setMultiplier(m);
      if (m >= cp) { clearInterval(iv); setPhase("crashed"); setProfit(p=>p-bet); }
    }, 50);
  };

  const cashout = () => {
    const win = Math.floor(bet * multiplier);
    setPhase("cashed"); setProfit(p=>p+win-bet);
  };

  const alive = phase==="running";

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      <div className="bg-gradient-to-b from-slate-900/80 to-black/60 rounded-2xl p-6 border border-slate-700/30 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{background:"radial-gradient(circle at 50% 80%, #22c55e 0%, transparent 60%)"}} />
        {phase==="bet"&&<div className="text-slate-600 text-lg py-12 relative">Place your bet</div>}
        {alive&&<motion.div initial={{scale:0.5}} animate={{scale:1}} className="relative">
          <div className="text-7xl font-black text-green-400 drop-shadow-lg">{multiplier.toFixed(2)}x</div>
          <div className="text-sm text-green-300/60 mt-2">Cashing out at {multiplier.toFixed(2)}x = {"$"}{Math.floor(bet*multiplier).toLocaleString()}</div>
        </motion.div>}
        {phase==="crashed"&&<div className="relative">
          <motion.div initial={{scale:2,opacity:0}} animate={{scale:1,opacity:1}} className="text-6xl font-black text-red-500">CRASHED</motion.div>
          <div className="text-sm text-red-400/60 mt-2">at {crashPoint.toFixed(2)}x</div>
        </div>}
        {phase==="cashed"&&<div className="relative">
          <motion.div initial={{scale:0.5}} animate={{scale:1}} className="text-5xl font-black text-green-400">CASHED OUT</motion.div>
          <div className="text-lg text-green-300 mt-2">+{"$"}{Math.floor(bet*multiplier).toLocaleString()}</div>
        </div>}
      </div>
      {profit!==0&&<div className={"text-center text-xs font-bold "+(profit>0?"text-green-400":"text-red-400")}>Session: {profit>0?"+":"-"}{"$"}{Math.abs(profit).toLocaleString()}</div>}
      <div className="flex justify-center gap-3">
        {phase==="bet"&&<button onClick={start} className="px-10 py-3.5 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">START</button>}
        {alive&&<button onClick={cashout} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all animate-pulse">CASH OUT {"$"}{Math.floor(bet*multiplier).toLocaleString()}</button>}
        {(phase==="crashed"||phase==="cashed")&&<button onClick={()=>{setPhase("bet");setMultiplier(1);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Round</button>}
      </div>
    </div>
  );
}

/* ═══════════ MINES ═══════════ */
function MinesGame() {
  const [bet, setBet] = useState(500);
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"bet"|"play"|"done">("bet");
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const minesCount = 5;

  const start = () => {
    const m = new Set<number>(); while(m.size<minesCount) m.add(Math.floor(Math.random()*25));
    setMines(m); setRevealed(new Set()); setPhase("play"); setResult(null);
  };

  const reveal = (i:number) => {
    if (phase!=="play"||revealed.has(i)) return;
    if (mines.has(i)) {
      const nr = new Set(revealed); for(let x=0;x<25;x++) if(mines.has(x)) nr.add(x); setRevealed(nr);
      setResult({won:false,amount:bet}); setPhase("done");
    } else {
      const nr = new Set(revealed); nr.add(i); setRevealed(nr);
      if (nr.size>=25-minesCount) { setResult({won:true,amount:bet*Math.floor(1+nr.size*0.5)}); setPhase("done"); }
    }
  };

  const cashout = () => {
    const mult = Math.floor(1+revealed.size*0.5);
    setResult({won:true,amount:bet*mult}); setPhase("done");
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      {phase==="play"&&<div className="text-center text-[10px] text-amber-500/70">Multiplier: {Math.floor(1+revealed.size*0.5)}x</div>}
      <div className="grid grid-cols-5 gap-1.5 max-w-[300px] mx-auto">
        {Array.from({length:25},(_, i)=>{
          const isRevealed=revealed.has(i); const isMine=mines.has(i);
          return <button key={i} onClick={()=>reveal(i)} disabled={phase!=="play"||isRevealed}
            className={"aspect-square rounded-lg text-lg flex items-center justify-center transition-all "+(isRevealed?(isMine?"bg-red-900/60 border border-red-500/50 text-red-400":"bg-green-900/40 border border-green-500/30 text-green-400"):(phase==="done"&&isMine?"bg-red-900/30 border border-red-500/20 text-red-500/50":"bg-slate-800/40 border border-slate-700/20 hover:bg-slate-700/40 cursor-pointer text-slate-600"))}>
            {isRevealed?(isMine?"\ud83d\udca3":"\u2b50"):(phase==="done"&&isMine?"\ud83d\udca3":"?")}
          </button>;
        })}
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WIN!":"BOOM!"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="bet"&&<button onClick={start} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Start</button>}
        {phase==="play"&&revealed.size>0&&<button onClick={cashout} className="px-6 py-2.5 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-bold hover:scale-105 transition-all">Cash Out {Math.floor(1+revealed.size*0.5)}x</button>}
        {phase==="done"&&<button onClick={()=>{setPhase("bet");setResult(null);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Game</button>}
      </div>
    </div>
  );
}

/* ═══════════ PLINKO ═══════════ */
function PlinkoGame() {
  const [bet, setBet] = useState(100);
  const [ballPos, setBallPos] = useState<number|null>(null);
  const [dropping, setDropping] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const slots = [8,4,2,1,0.5,1,2,4,8,16,8,4,2,1,0.5,1,2,4,8];
  const slotColors = ["#22c55e","#22c55e","#eab308","#f97316","#ef4444","#f97316","#eab308","#22c55e","#22c55e","#a855f7","#22c55e","#22c55e","#eab308","#f97316","#ef4444","#f97316","#eab308","#22c55e","#22c55e"];

  const drop = () => {
    setDropping(true); setBallPos(null);
    const finalSlot = Math.floor(Math.random()*slots.length);
    setTimeout(()=>{
      setBallPos(finalSlot); setDropping(false);
      setHistory(prev=>[slots[finalSlot],...prev].slice(0,20));
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <div className="bg-gradient-to-b from-slate-900/80 to-black/60 rounded-2xl p-4 border border-slate-700/30">
        <div className="flex justify-center gap-0.5 mb-4">
          {slots.map((s,i)=>(
            <div key={i} className={"w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all "+(ballPos===i?"border-white/50 scale-125 shadow-lg":"border-white/10")} style={{backgroundColor:slotColors[i]+"30",color:slotColors[i]}}>
              {s}x
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          {ballPos!==null&&!dropping&&<motion.div initial={{y:-100}} animate={{y:0}} className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-300 shadow-lg shadow-amber-500/50" />}
          {dropping&&<motion.div animate={{x:[0,20,-20,10,-10,0]}} transition={{repeat:Infinity,duration:0.3}} className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-300 shadow-lg" />}
          {!ballPos&&!dropping&&<div className="w-6 h-6 rounded-full bg-slate-700/30 border border-slate-600/20" />}
        </div>
      </div>
      {ballPos!==null&&<div className={"text-center font-black text-lg "+(slots[ballPos]>=4?"text-green-400":slots[ballPos]>=2?"text-amber-400":"text-red-400")}>
        {slots[ballPos]}x = +{"$"}{Math.floor(bet*slots[ballPos]).toLocaleString()}
      </div>}
      {history.length>0&&<div className="flex gap-1 flex-wrap justify-center">{history.slice(0,12).map((h,i)=><span key={i} className={"px-1.5 py-0.5 rounded text-[9px] font-bold "+(h>=8?"bg-purple-900/40 text-purple-400":h>=2?"bg-green-900/30 text-green-400":h>=1?"bg-amber-900/30 text-amber-400":"bg-red-900/30 text-red-400")}>{h}x</span>)}</div>}
      <div className="flex justify-center"><button onClick={drop} disabled={dropping} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase shadow-xl hover:scale-105 transition-all">{dropping?"Dropping...":"DROP"}</button></div>
    </div>
  );
}

/* ═══════════ DICE DUEL ═══════════ */
function DiceDuelGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"high"|"low"|"seven">("high");
  const [playerDie, setPD] = useState(0);
  const [aiDie, setAD] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);

  const roll = () => {
    setRolling(true); setResult(null);
    setTimeout(()=>{
      const pd=Math.floor(Math.random()*6)+1, ad=Math.floor(Math.random()*6)+1;
      setPD(pd); setAD(ad);
      let won = false;
      if (pick==="high"&&pd>ad) won=true;
      else if (pick==="low"&&pd<ad) won=true;
      else if (pick==="seven"&&pd+ad===7) won=true;
      const mult = pick==="seven"?(pd+ad===7?5:0):(pd!==ad?2:0);
      setResult({won:won&&mult>0,amount:won?bet*mult:bet}); setRolling(false);
    },800);
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000,5000]} />
      <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20">
        <div className="flex justify-center gap-8 items-center">
          <div className="text-center"><div className="text-[10px] text-amber-500/60 mb-1">You</div>{playerDie>0?<Die value={playerDie} />:<Die value={1} />}</div>
          <div className="text-2xl font-black text-slate-600">VS</div>
          <div className="text-center"><div className="text-[10px] text-red-500/60 mb-1">House</div>{aiDie>0?<Die value={aiDie} />:<Die value={1} />}</div>
        </div>
        {playerDie>0&&<div className="text-center mt-3 text-lg font-black text-amber-400">{playerDie} vs {aiDie}</div>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["high","Higher (2x)","You win if yours is higher"],["low","Lower (2x)","You win if yours is lower"],["seven","Exact 7 (5x)","Total = 7 for big win"]].map(([id,l,d])=>(
          <button key={id} onClick={()=>setPick(id as any)} className={"py-3 rounded-xl text-xs font-bold border transition-all "+(pick===id?"border-amber-500/50 bg-amber-600/20 text-amber-300 shadow-lg":"border-slate-800/30 text-slate-500")}>
            <div>{l}</div><div className="text-[8px] opacity-50 mt-0.5">{d}</div>
          </button>
        ))}
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"YOU WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={roll} disabled={rolling} className="px-10 py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-700 disabled:opacity-30 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">{rolling?"ROLLING...":"ROLL"}</button></div>
    </div>
  );
}

/* ═══════════ HI-LO CARD GAME ═══════════ */
function HiLoGame() {
  const [bet, setBet] = useState(500);
  const [card, setCard] = useState<Card|null>(null);
  const [nextCard, setNC] = useState<Card|null>(null);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"bet"|"play"|"done">("bet");
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const [deck, setDeck] = useState<Card[]>([]);

  const start = () => { const d=makeDeck(); const c=d.pop()!; setDeck(d); setCard(c); setPhase("play"); setResult(null); setStreak(0); };

  const guess = (hi:boolean) => {
    const d=[...deck]; const nc=d.pop()!; setDeck(d); setNC(nc);
    const isHi = nc.value>card!.value;
    const isLo = nc.value<card!.value;
    const won = (hi&&isHi)||(!hi&&isLo)||(nc.value===card!.value);
    if (won) {
      setCard(nc); setStreak(s=>s+1); setNC(null);
      if (streak>=7) { const amt=bet*(2+streak); setResult({won:true,amount:amt}); setPhase("done"); }
    } else {
      setResult({won:false,amount:bet}); setPhase("done");
    }
  };

  const cashout = () => { setResult({won:true,amount:bet*(2+streak)}); setPhase("done"); };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000,5000]} />
      <div className="text-center text-[10px] text-amber-500/70">Streak: {streak} &middot; Multiplier: {2+streak}x</div>
      <div className="flex justify-center gap-4 items-center">
        {card&&<PC card={card} />}
        <div className="text-2xl text-slate-600">{nextCard?"->":"?"}</div>
        {nextCard&&<PC card={nextCard} />}
      </div>
      {phase==="play"&&<div className="flex justify-center gap-3">
        <button onClick={()=>guess(true)} className="px-8 py-3 bg-gradient-to-b from-green-600 to-green-800 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">HIGHER</button>
        <button onClick={cashout} disabled={streak===0} className="px-4 py-2 bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold disabled:opacity-30">Cash Out</button>
        <button onClick={()=>guess(false)} className="px-8 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">LOWER</button>
      </div>}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="bet"&&<button onClick={start} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Start</button>}
        {phase==="done"&&<button onClick={()=>{setPhase("bet");setResult(null);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Game</button>}
      </div>
    </div>
  );
}

/* ═══════════ LIMBO ═══════════ */
function LimboGame() {
  const [bet, setBet] = useState(500);
  const [target, setTarget] = useState(2.0);
  const [result, setResult] = useState<{won:boolean;amount:number;crash:number}|null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const play = () => {
    const crash = Math.max(1.0, parseFloat((Math.random()*99+1).toFixed(2)));
    const won = crash>=target;
    setResult({won,amount:won?Math.floor(bet*target):bet,crash});
    setHistory(prev=>[crash,...prev].slice(0,20));
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000,5000]} />
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-amber-500/70 font-bold">Target</span>
        <input type="number" value={target} step={0.1} min={1.01} max={100} onChange={e=>setTarget(Math.max(1.01,parseFloat(e.target.value)||2))} className="flex-1 bg-black/60 border border-amber-800/30 rounded-lg px-3 py-1.5 text-sm text-amber-200 font-mono focus:border-amber-500/50 focus:outline-none" />
        <span className="text-amber-400 text-sm font-bold">{target.toFixed(1)}x = +{"$"}{Math.floor(bet*target).toLocaleString()}</span>
      </div>
      {result&&<div className={"rounded-xl p-6 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"text-4xl font-black mb-2 "+(result.won?"text-green-400":"text-red-400")}>{result.crash.toFixed(2)}x</div>
        <div className={"font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"WIN":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      {history.length>0&&<div className="flex gap-1 flex-wrap">{history.slice(0,12).map((h,i)=><span key={i} className={"px-1.5 py-0.5 rounded text-[9px] font-bold "+(h>=target?"bg-green-900/30 text-green-400":"bg-red-900/30 text-red-400")}>{h.toFixed(2)}x</span>)}</div>}
      <div className="flex justify-center"><button onClick={play} className="px-10 py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">BET</button></div>
    </div>
  );
}

/* ═══════════ WAR ═══════════ */
function WarGame() {
  const [bet, setBet] = useState(500);
  const [playerCard, setPC] = useState<Card|null>(null);
  const [dealerCard, setDC] = useState<Card|null>(null);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);

  const play = () => {
    const d=makeDeck(1); const pc=d.pop()!; const dc=d.pop()!;
    setPC(pc); setDC(dc);
    const won = pc.value>dc.value;
    setResult({won:pc.value!==dc.value,amount:won?bet:dc.value>pc.value?bet:0});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20">
        <div className="flex justify-center gap-8 items-center">
          <div className="text-center"><div className="text-[10px] text-amber-500/60 mb-1">You</div>{playerCard?<PC card={playerCard} />:<div className="w-14 h-20 rounded-xl bg-slate-800/40 border border-slate-700/30" />}</div>
          <div className="text-3xl font-black text-slate-600">VS</div>
          <div className="text-center"><div className="text-[10px] text-red-500/60 mb-1">Dealer</div>{dealerCard?<PC card={dealerCard} />:<div className="w-14 h-20 rounded-xl bg-slate-800/40 border border-slate-700/30" />}</div>
        </div>
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":result.amount===0?"bg-amber-900/20 border-amber-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":result.amount===0?"text-amber-400":"text-red-400")}>{result.won?"YOU WIN!":result.amount===0?"WAR! Tie = Push":"LOSE"} {result.amount>0?(result.won?"+":"-"):""}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={play} className="px-10 py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">FLIP</button></div>
      <div className="text-center text-[9px] text-slate-600">Higher card wins 1:1. Tie goes to War!</div>
    </div>
  );
}

/* ═══════════ RED DOG ═══════════ */
function RedDogGame() {
  const [bet, setBet] = useState(500);
  const [cards, setCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"bet"|"raise"|"done">("bet");
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);
  const [spread, setSpread] = useState(0);

  const play = () => {
    const d=makeDeck(1); const c1=d.pop()!; const c2=d.pop()!;
    const lo=Math.min(c1.value,c2.value), hi=Math.max(c1.value,c2.value);
    const sp=hi-lo-1;
    setCards([c1,c2]); setSpread(sp); setPhase(sp>0?"raise":"done");
    if (sp<=0) { const c3=d.pop()!; setCards([c1,c2,c3]); const won=c3.value>=lo&&c3.value<=hi; setResult({won:sp===0,amount:sp===0?bet:bet}); }
  };

  const raise = () => {
    const d=makeDeck(1); const c3=d.pop()!;
    setCards(prev=>[...prev,c3]); setPhase("done");
    const lo=Math.min(cards[0].value,cards[1].value), hi=Math.max(cards[0].value,cards[1].value);
    const won=c3.value>=lo&&c3.value<=hi;
    const mult = spread<=4?5:spread<=8?4:spread<=11?2:1;
    setResult({won,amount:won?bet*mult:bet});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20 text-center">
        <div className="flex justify-center gap-3">
          {cards.map((c,i)=><PC key={c.id} card={c} d={i*0.2} />)}
          {cards.length===0&&<><div className="w-14 h-20 rounded-xl bg-slate-800/40 border border-slate-700/30" /><div className="w-14 h-20 rounded-xl bg-slate-800/40 border border-slate-700/30" /></>}
        </div>
        {cards.length>=2&&phase!=="done"&&<div className="text-sm text-amber-400 mt-2">Spread: {spread} cards between</div>}
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="bet"&&<button onClick={play} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Deal</button>}
        {phase==="raise"&&<button onClick={raise} className="px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">RAISE (Spread: {spread})</button>}
        {phase==="done"&&<button onClick={()=>{setCards([]);setResult(null);setPhase("bet");}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Hand</button>}
      </div>
    </div>
  );
}

/* ═══════════ LET IT RIDE ═══════════ */
function LetItRideGame() {
  const [bet, setBet] = useState(500);
  const [cards, setCards] = useState<Card[]>([]);
  const [community, setCommunity] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"deal"|"pull1"|"pull2"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amount:number;hand:string}|null>(null);

  const evalHand = (all:Card[]):{rank:number;name:string} => {
    const vals = all.map(c=>c.value).sort((a,b)=>b-a);
    const suits = all.map(c=>c.suit);
    const isFlush = suits.filter(s=>s===suits[0]).length>=5;
    const uniq = [...new Set(vals)];
    const isStraight = uniq.length>=5&&vals[0]-vals[4]<=4;
    const counts:Record<number,number>={}; vals.forEach(v=>counts[v]=(counts[v]||0)+1);
    const freq = Object.values(counts).sort((a,b)=>b-a);
    if (isFlush&&isStraight) return {rank:8,name:"Straight Flush"};
    if (freq[0]===4) return {rank:7,name:"Four of a Kind"};
    if (freq[0]===3&&freq[1]===2) return {rank:6,name:"Full House"};
    if (isFlush) return {rank:5,name:"Flush"};
    if (isStraight) return {rank:4,name:"Straight"};
    if (freq[0]===3) return {rank:3,name:"Three of a Kind"};
    if (freq[0]===2&&freq[1]===2) return {rank:2,name:"Two Pair"};
    if (freq[0]===2) return {rank:1,name:"One Pair"};
    return {rank:0,name:"High Card"};
  };

  const payouts:Record<number,number> = {8:1000,7:50,6:11,5:8,4:5,3:3,2:2,1:1,0:0};

  const deal = () => {
    const d=makeDeck(); setCards([d.pop()!,d.pop()!,d.pop()!]); setCommunity([]); setPhase("pull1"); setResult(null);
  };

  const pull = (which:1|2) => {
    const d=[...community.length?[]:[]];
    if (which===1&&cards.length===3) { setPhase("pull2"); return; }
    if (which===2) {
      const d2=makeDeck(); const comm=[d2.pop()!,d2.pop()!,d2.pop()!];
      setCommunity(comm); setPhase("done");
      const all=[...cards,...comm];
      const ev=evalHand(all);
      const mult=payouts[ev.rank]||0;
      setResult({won:mult>0,amount:bet*mult,hand:ev.name});
    }
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="text-center text-[10px] text-slate-500">3 cards dealt, then 3 community cards revealed one by one</div>
      <div className="bg-gradient-to-b from-emerald-900/15 to-transparent rounded-2xl p-5 border border-emerald-900/20">
        <div className="text-[10px] text-amber-500/60 font-bold mb-2 text-center">Your Cards</div>
        <div className="flex gap-2 justify-center">{cards.map((c,i)=><PC key={c.id} card={c} d={i*0.1} />)}</div>
        {community.length>0&&<><div className="text-[10px] text-emerald-500/60 font-bold mt-3 mb-2 text-center">Community</div>
        <div className="flex gap-2 justify-center">{community.map((c,i)=><PC key={c.id} card={c} d={i*0.15} sm />)}</div></>}
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.hand} - {result.won?"WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="deal"&&<button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg">Deal</button>}
        {phase==="pull1"&&<button onClick={()=>pull(1)} className="px-6 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold">Reveal 1</button>}
        {phase==="pull2"&&<button onClick={()=>pull(2)} className="px-6 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold">Reveal All</button>}
        {phase==="done"&&<button onClick={()=>{setCards([]);setCommunity([]);setResult(null);setPhase("deal");}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Hand</button>}
      </div>
    </div>
  );
}

/* ═══════════ THREE CARD POKER ═══════════ */
function ThreeCardPokerGame() {
  const [bet, setBet] = useState(500);
  const [playerCards, setPC] = useState<Card[]>([]);
  const [dealerCards, setDC] = useState<Card[]>([]);
  const [result, setResult] = useState<{won:boolean;amount:number;hand:string}|null>(null);

  const eval3 = (c:Card[]):{rank:number;name:string} => {
    const v=c.map(x=>x.value).sort((a,b)=>b-a);
    const s=c.map(x=>x.suit);
    const flush=s[0]===s[1]&&s[1]===s[2];
    const straight=v[0]-v[2]===2&&new Set(v).size===3;
    const counts:Record<number,number>={}; v.forEach(x=>counts[x]=(counts[x]||0)+1);
    const freq=Object.values(counts).sort((a,b)=>b-a);
    if (flush&&straight) return {rank:6,name:"Straight Flush"};
    if (freq[0]===3) return {rank:5,name:"Three of a Kind"};
    if (straight) return {rank:4,name:"Straight"};
    if (flush) return {rank:3,name:"Flush"};
    if (freq[0]===2) return {rank:2,name:"Pair"};
    return {rank:1,name:"High Card"};
  };

  const deal = () => {
    const d=makeDeck(1); const pc=[d.pop()!,d.pop()!,d.pop()!]; const dc=[d.pop()!,d.pop()!,d.pop()!];
    setPC(pc); setDC(dc);
    const pv=eval3(pc), dv=eval3(dc);
    const dealerQualifies = dv.rank>=1;
    const won = pv.rank>dv.rank||(pv.rank===dv.rank&&pc.reduce((s,c)=>s+c.value,0)>dc.reduce((s,c)=>s+c.value,0));
    setResult({won:dealerQualifies?won:true,amount:dealerQualifies?(won?bet*2:bet):(won?bet:bet),hand:pv.name+(won?" beats "+dv.name:" loses to "+dv.name)});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-amber-900/15 to-transparent rounded-2xl p-4 border border-amber-900/20 text-center">
          <div className="text-[10px] text-amber-500/60 font-bold mb-1">Your Hand</div>
          <div className="flex gap-1 justify-center">{playerCards.map((c,i)=><PC key={c.id} card={c} d={i*0.1} sm />)}</div>
        </div>
        <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
          <div className="text-[10px] text-red-500/60 font-bold mb-1">Dealer</div>
          <div className="flex gap-1 justify-center">{dealerCards.map((c,i)=><PC key={c.id} card={c} d={i*0.1+0.3} sm />)}</div>
        </div>
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.hand}</div>
        <div className={"text-sm font-bold "+(result.won?"text-green-300":"text-red-300")}>{result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center">
        {playerCards.length===0?<button onClick={deal} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Deal</button>
        :<button onClick={()=>{setPC([]);setDC([]);setResult(null);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Hand</button>}
      </div>
      <div className="text-center text-[9px] text-slate-600">Three Card Poker - Best 3-card hand beats dealer. Pair+ pays bonus.</div>
    </div>
  );
}
/* ═══════════ DRAGON TIGER ═══════════ */
function DragonTigerGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"dragon"|"tiger"|"tie">("dragon");
  const [dragonCard, setDC] = useState<Card|null>(null);
  const [tigerCard, setTC] = useState<Card|null>(null);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);

  const deal = () => {
    const d=makeDeck(8); const dc=d.pop()!; const tc=d.pop()!;
    setDC(dc); setTC(tc);
    const won = (pick==="dragon"&&dc.value>tc.value)||(pick==="tiger"&&tc.value>dc.value)||(pick==="tie"&&dc.value===tc.value);
    const mult = pick==="tie"?8:1;
    setResult({won,amount:won?bet*mult:bet});
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[500,1000,5000]} />
      <div className="grid grid-cols-3 gap-2">
        {[["dragon","Dragon","1:1"],["tie","Tie","8:1"],["tiger","Tiger","1:1"]].map(([id,l,o])=>(
          <button key={id} onClick={()=>setPick(id as any)} className={"py-3 rounded-xl text-xs font-bold border transition-all "+(pick===id?"border-amber-500/50 bg-amber-600/20 text-amber-300 shadow-lg":"border-slate-800/30 text-slate-500")}>
            {l}<br/><span className="text-[9px] opacity-50">{o}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-b from-red-900/15 to-transparent rounded-2xl p-4 border border-red-900/20 text-center">
          <div className="text-[10px] text-red-500/60 font-bold mb-1">Dragon</div>
          {dragonCard&&<PC card={dragonCard} />}
        </div>
        <div className="bg-gradient-to-b from-blue-900/15 to-transparent rounded-2xl p-4 border border-blue-900/20 text-center">
          <div className="text-[10px] text-blue-500/60 font-bold mb-1">Tiger</div>
          {tigerCard&&<PC card={tigerCard} />}
        </div>
      </div>
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={deal} className="px-10 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Deal</button></div>
    </div>
  );
}

/* ═══════════ WHEEL 6 ═══════════ */
function Wheel6Game() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{won:boolean;amount:number;num:number}|null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const multipliers = [0,5,2,3,1.5,4,6];

  const spin = () => {
    setSpinning(true); setResult(null);
    setTimeout(()=>{
      const n=Math.floor(Math.random()*6)+1;
      const won=n===pick;
      setResult({won,amount:won?bet*multipliers[n]:bet,num:n});
      setHistory(prev=>[n,...prev].slice(0,15));
      setSpinning(false);
    },2000);
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000]} />
      <div className="flex justify-center gap-2 flex-wrap">
        {[1,2,3,4,5,6].map(n=>(
          <button key={n} onClick={()=>!spinning&&setPick(n)} className={"w-14 h-14 rounded-xl text-lg font-black border-2 transition-all flex flex-col items-center justify-center "+(pick===n?"border-amber-500/50 bg-amber-600/20 text-amber-300 shadow-lg scale-110":"border-slate-700/30 bg-slate-800/30 text-slate-500")}>
            {n}
            <span className="text-[8px] opacity-50">{multipliers[n]}x</span>
          </button>
        ))}
      </div>
      {history.length>0&&<div className="flex gap-1 flex-wrap justify-center">{history.slice(0,10).map((h,i)=><span key={i} className={"w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center "+(h===pick?"bg-amber-900/40 text-amber-400":"bg-slate-800/40 text-slate-500")}>{h}</span>)}</div>}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>Rolled {result.num} - {result.won?"WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={spin} disabled={spinning} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 disabled:opacity-30 text-black rounded-xl text-sm font-black uppercase shadow-xl hover:scale-105 transition-all">{spinning?"Spinning...":"SPIN"}</button></div>
    </div>
  );
}

/* ═══════════ SUDOKU DICE ═══════════ */
function SudokuDiceGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<number[]>([]);
  const [dice, setDice] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);

  const toggle = (n:number) => { if(rolling) return; if(pick.includes(n)) setPick(pick.filter(x=>x!==n)); else if(pick.length<3) setPick([...pick,n]); };

  const roll = () => {
    setRolling(true);
    setTimeout(()=>{
      const r=Array.from({length:6},()=>Math.floor(Math.random()*6)+1);
      setDice(r); setRolling(false);
      const matches=pick.filter(p=>r.includes(p)).length;
      const mult=matches===3?20:matches===2?5:matches===1?2:0;
      setResult({won:mult>0,amount:bet*mult});
    },1000);
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="text-center text-[10px] text-slate-500">Pick up to 3 numbers. Roll 6 dice. Match for multiplier!</div>
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5,6].map(n=>(
          <button key={n} onClick={()=>toggle(n)} className={"w-12 h-12 rounded-xl text-lg font-bold border-2 transition-all "+(pick.includes(n)?"border-amber-500 bg-amber-600/20 text-amber-300":"border-slate-700/30 bg-slate-800/30 text-slate-500 hover:border-slate-600")}>{n}</button>
        ))}
      </div>
      <div className="text-center text-[10px] text-amber-500/70">Selected: {pick.length}/3</div>
      {dice.length>0&&<div className="flex justify-center gap-2">{dice.map((d,i)=><Die key={i} value={d} size="md" />)}</div>}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WIN!":"No match"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={roll} disabled={rolling||pick.length===0} className="px-10 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 disabled:opacity-30 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">{rolling?"Rolling...":"ROLL 6 DICE"}</button></div>
      <div className="text-center text-[9px] text-slate-600">1 match = 2x &middot; 2 matches = 5x &middot; 3 matches = 20x</div>
    </div>
  );
}

/* ═══════════ MEMORY DICE ═══════════ */
function MemoryDiceGame() {
  const [bet, setBet] = useState(500);
  const [tiles, setTiles] = useState<{id:number;val:number;flipped:boolean;matched:boolean}[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [pairs, setPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);

  const start = () => {
    const vals=[1,1,2,2,3,3,4,4,5,5,6,6];
    const shuffled=vals.sort(()=>Math.random()-0.5).map((v,i)=>({id:i,val:v,flipped:false,matched:false}));
    setTiles(shuffled); setSelected([]); setPairs(0); setMoves(0); setResult(null);
  };

  const flip = (id:number) => {
    if (selected.length>=2||tiles[id].flipped||tiles[id].matched) return;
    const t=[...tiles]; t[id]={...t[id],flipped:true}; setTiles(t);
    const sel=[...selected,id]; setSelected(sel);
    if (sel.length===2) {
      setMoves(m=>m+1);
      setTimeout(()=>{
        const t2=[...t];
        if (t2[sel[0]].val===t2[sel[1]].val) { t2[sel[0]].matched=true; t2[sel[1]].matched=true; setPairs(p=>{const np=p+1; if(np>=6) setResult({won:true,amount:bet*(Math.max(1,15-moves))}); return np;}); }
        else { t2[sel[0]].flipped=false; t2[sel[1]].flipped=false; }
        setTiles(t2); setSelected([]);
      },600);
    }
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="text-center text-[10px] text-slate-500">Pairs: {pairs}/6 &middot; Moves: {moves}</div>
      {tiles.length>0?<div className="grid grid-cols-4 gap-1.5 max-w-[280px] mx-auto">
        {tiles.map(t=>(
          <button key={t.id} onClick={()=>flip(t.id)} className={"aspect-square rounded-lg text-xl font-bold transition-all "+(t.flipped||t.matched?(t.matched?"bg-green-900/40 border border-green-500/30 text-green-400":"bg-amber-900/30 border border-amber-500/30 text-amber-300"):"bg-slate-800/40 border border-slate-700/30 text-slate-600 hover:bg-slate-700/40")}>
            {(t.flipped||t.matched)?t.val:"?"}
          </button>
        ))}
      </div>
      :<div className="text-center py-12 text-slate-600 text-sm">Click Start to play</div>}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>Cleared in {moves} moves! +{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center">
        {tiles.length===0||result?<button onClick={start} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Start</button>:null}
      </div>
      <div className="text-center text-[9px] text-slate-600">Find all 6 pairs. Fewer moves = bigger payout!</div>
    </div>
  );
}

/* ═══════════ SCRATCH POKER ═══════════ */
function ScratchPokerGame() {
  const [bet, setBet] = useState(10);
  const [card, setCard] = useState<number[]|null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<{won:boolean;amount:number;hand:string}|null>(null);

  const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const evalPoker = (cards:number[]):string => {
    const counts:Record<number,number>={}; cards.forEach(c=>counts[c]=(counts[c]||0)+1);
    const freq=Object.values(counts).sort((a,b)=>b-a);
    if (freq[0]===5) return "Five of a Kind!";
    if (freq[0]===4) return "Four of a Kind!";
    if (freq[0]===3&&freq[1]===2) return "Full House!";
    if (freq[0]===3) return "Three of a Kind!";
    if (freq[0]===2&&freq[1]===2) return "Two Pair!";
    if (freq[0]===2) { const p=Object.entries(counts).filter(([,c])=>c===2).map(([r])=>Number(r)); return p.some(x=>x>=10)?"Jacks or Better!":"One Pair"; }
    return "No Hand";
  };

  const buy = () => { setCard(Array.from({length:5},()=>Math.floor(Math.random()*13))); setRevealed(new Set()); setResult(null); };

  const reveal = (i:number) => {
    if (!card||result) return;
    const nr=new Set(revealed); nr.add(i); setRevealed(nr);
    if (nr.size===5) {
      const hand=evalPoker(card);
      const mult=hand.includes("Five")?200:hand.includes("Four")?50:hand.includes("Full")?20:hand.includes("Three")?10:hand.includes("Two")?5:hand.includes("Jacks")?2:0;
      setResult({won:mult>0,amount:bet*mult,hand});
    }
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[5,10,25,50]} min={5} />
      {card?(
        <div className="flex justify-center gap-3">
          {card.map((c,i)=>(
            <button key={i} onClick={()=>reveal(i)} className={"w-16 h-22 rounded-xl text-xl font-black flex items-center justify-center transition-all border-2 "+(revealed.has(i)?"bg-gradient-to-br from-white to-slate-100 border-slate-300 text-slate-800 scale-105":"bg-slate-800/60 border-slate-600/30 text-slate-600 hover:border-amber-500/50")}>
              {revealed.has(i)?RANKS[c]:"?"}
            </button>
          ))}
        </div>
      ):(<div className="text-center py-12 text-slate-600 text-sm">Buy a card</div>)}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.hand} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {!card?<button onClick={buy} className="px-6 py-2.5 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-black shadow-lg">Buy Card {"$"}{bet}</button>
        :<button onClick={()=>{setCard(null);setResult(null);}} className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Card</button>}
      </div>
    </div>
  );
}

/* ═══════════ FLASH CRASH ═══════════ */
function FlashCrashGame() {
  const [bet, setBet] = useState(500);
  const [multiplier, setMultiplier] = useState(1.0);
  const [phase, setPhase] = useState<"bet"|"running"|"done">("bet");
  const [crashPoint] = useState(()=>Math.max(1.1,parseFloat((Math.random()*5+1.1).toFixed(2))));
  const [profit, setProfit] = useState(0);

  const start = () => {
    setMultiplier(1.0); setPhase("running");
    let m=1.0; const cp=crashPoint;
    const iv=setInterval(()=>{
      m=parseFloat((m+0.02+m*0.01).toFixed(2));
      setMultiplier(m);
      if(m>=cp){clearInterval(iv);setPhase("done");setProfit(p=>p-bet);}
    },30);
  };

  const cashout = () => { const w=Math.floor(bet*multiplier); setPhase("done"); setProfit(p=>p+w-bet); };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000]} />
      <div className="bg-gradient-to-b from-slate-900/80 to-black/60 rounded-2xl p-6 border border-slate-700/30 text-center h-40 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(90deg, transparent ${(multiplier-1)*10}%, #22c55e20 ${multiplier*10}%, transparent ${(multiplier+1)*10}%)`}} />
        {phase==="bet"&&<div className="text-slate-600 text-sm">Place your bet</div>}
        {phase==="running"&&<motion.div animate={{scale:[1,1.05,1]}} transition={{repeat:Infinity,duration:0.3}} className="relative">
          <div className="text-6xl font-black text-green-400">{multiplier.toFixed(2)}x</div>
        </motion.div>}
        {phase==="done"&&multiplier>=crashPoint&&<div className="text-4xl font-black text-red-500">CRASHED!</div>}
      </div>
      {profit!==0&&<div className={"text-center text-xs font-bold "+(profit>0?"text-green-400":"text-red-400")}>Session: {profit>0?"+":"-"}{"$"}{Math.abs(profit).toLocaleString()}</div>}
      <div className="flex justify-center gap-3">
        {phase==="bet"&&<button onClick={start} className="px-10 py-3.5 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">START</button>}
        {phase==="running"&&<button onClick={cashout} className="px-10 py-3.5 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all animate-pulse">CASH OUT {"$"}{Math.floor(bet*multiplier).toLocaleString()}</button>}
        {phase==="done"&&<button onClick={()=>{setPhase("bet");setMultiplier(1);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Round</button>}
      </div>
    </div>
  );
}

/* ═══════════ HIGHER LOWER DICE ═══════════ */
function HiLoDiceGame() {
  const [bet, setBet] = useState(500);
  const [current, setCurrent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<{won:boolean;amount:number}|null>(null);

  const start = () => { setCurrent(Math.floor(Math.random()*6)+1); setStreak(0); setResult(null); };

  const guess = (hi:boolean) => {
    const next=Math.floor(Math.random()*6)+1;
    const won=(hi&&next>current)||(!hi&&next<current)||(next===current);
    if (won) { setCurrent(next); setStreak(s=>s+1); }
    else { setResult({won:false,amount:bet}); }
  };

  const cashout = () => { setResult({won:true,amount:bet*(1+streak)}); };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      <div className="text-center text-[10px] text-amber-500/70">Streak: {streak} &middot; Payout: {1+streak}x</div>
      {current>0&&<div className="flex justify-center"><Die value={current} size="lg" /></div>}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.won?"WIN!":"LOSE"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      {current===0?
        <div className="flex justify-center"><button onClick={start} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Start</button></div>
        :result?null:<div className="flex justify-center gap-3">
          <button onClick={()=>guess(true)} className="px-8 py-3 bg-gradient-to-b from-green-600 to-green-800 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">HIGHER</button>
          <button onClick={cashout} className="px-4 py-2 bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold">Cash Out</button>
          <button onClick={()=>guess(false)} className="px-8 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">LOWER</button>
        </div>
      }
      {result&&!result.won&&<div className="flex justify-center"><button onClick={()=>{setCurrent(0);setResult(null);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Game</button></div>}
    </div>
  );
}

/* ═══════════ TREASURE HUNT ═══════════ */
function TreasureHuntGame() {
  const [bet, setBet] = useState(500);
  const [grid, setGrid] = useState<{treasure:boolean;trap:boolean;revealed:boolean;value:number}[]>([]);
  const [phase, setPhase] = useState<"bet"|"play"|"done">("bet");
  const [totalWon, setTotalWon] = useState(0);

  const start = () => {
    const g=Array.from({length:20},(_,i)=>({treasure:false,trap:false,revealed:false,value:0}));
    const traps=new Set<number>(); while(traps.size<4) traps.add(Math.floor(Math.random()*20));
    const treasureIdxs=new Set<number>(); while(treasureIdxs.size<8){const r=Math.floor(Math.random()*20); if(!traps.has(r)) treasureIdxs.add(r);}
    traps.forEach(t=>g[t]={...g[t],trap:true});
    treasureIdxs.forEach(t=>{const v=[100,200,300,500,750,1000,1500,2000][Math.floor(Math.random()*8)]; g[t]={...g[t],treasure:true,value:v};});
    for(let i=0;i<20;i++) if(!g[i].treasure&&!g[i].trap) g[i]={...g[i],value:Math.floor(Math.random()*50)+10};
    setGrid(g); setPhase("play"); setTotalWon(0);
  };

  const reveal = (i:number) => {
    if (phase!=="play"||grid[i].revealed) return;
    const g=[...grid]; g[i]={...g[i],revealed:true}; setGrid(g);
    if (g[i].trap) { setPhase("done"); }
    else if (g[i].treasure) { setTotalWon(w=>w+g[i].value); }
    const allRevealed=g.filter(x=>x.revealed&&!x.trap).length;
    const totalTreasure=g.filter(x=>x.treasure).length;
    if (allRevealed>=totalTreasure) { setTotalWon(w=>{const bonus=w; setPhase("done"); return bonus;}); }
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[250,500,1000]} />
      {phase==="play"&&<div className="text-center text-[10px] text-amber-500/70">Found: {"$"}{totalWon.toLocaleString()} &middot; Avoid traps!</div>}
      {grid.length>0&&<div className="grid grid-cols-5 gap-1.5 max-w-[300px] mx-auto">
        {grid.map((t,i)=>(
          <button key={i} onClick={()=>reveal(i)} disabled={phase!=="play"||t.revealed} className={"aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center transition-all "+(t.revealed?(t.trap?"bg-red-900/60 border border-red-500/50 text-red-400":t.treasure?"bg-amber-900/40 border border-amber-500/30 text-amber-300":"bg-green-900/20 border border-green-800/20 text-green-600"):"bg-slate-800/40 border border-slate-700/30 text-slate-600 hover:bg-slate-700/40 cursor-pointer")}>
            {t.revealed?(t.trap?"\ud83d\udca3":t.treasure?"\ud83d\udc8e":"$"+t.value):"??"}
          </button>
        ))}
      </div>}
      {phase==="done"&&<div className={"rounded-xl p-3 text-center border "+(totalWon>0?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(totalWon>0?"text-green-400":"text-red-400")}>{totalWon>0?"WIN! "+totalWon.toLocaleString():"BOOM! Trapped!"}</div>
      </div>}
      <div className="flex justify-center gap-2">
        {phase==="bet"&&<button onClick={start} className="px-8 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">Start</button>}
        {phase==="done"&&<button onClick={()=>{setPhase("bet");setGrid([]);}} className="px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl text-xs">New Game</button>}
      </div>
    </div>
  );
}

/* ═══════════ LUCKY NUMBER ═══════════ */
function LuckyNumberGame() {
  const [bet, setBet] = useState(500);
  const [luckyNum, setLuckyNum] = useState(7);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amount:number;matches:number}|null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const play = () => {
    const nums=Array.from({length:49},(_,i)=>i+1).sort(()=>Math.random()-0.5).slice(0,6).sort((a,b)=>a-b);
    setDrawn(nums);
    const matches=nums.filter(n=>n===luckyNum).length;
    const mult=matches>0?matches*10:0;
    setResult({won:mult>0,amount:bet*mult,matches});
    setHistory(prev=>[luckyNum,...prev].slice(0,10));
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000]} />
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-amber-500/70 font-bold">Your Lucky Number</span>
        <input type="number" value={luckyNum} min={1} max={49} onChange={e=>setLuckyNum(Math.max(1,Math.min(49,Number(e.target.value)||7)))} className="w-20 bg-black/60 border border-amber-800/30 rounded-lg px-3 py-1.5 text-sm text-amber-200 font-mono text-center focus:border-amber-500/50 focus:outline-none" />
      </div>
      {drawn.length>0&&<div className="text-center"><div className="text-[10px] text-slate-500 mb-1">Drawn Numbers</div>
        <div className="flex gap-1.5 justify-center flex-wrap">{drawn.map((n,i)=><span key={i} className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold "+(n===luckyNum?"bg-amber-500 text-black ring-2 ring-amber-300":"bg-slate-800/60 text-slate-400 border border-slate-600/30")}>{n}</span>)}</div></div>}
      {result&&<div className={"rounded-xl p-3 text-center border "+(result.won?"bg-green-900/20 border-green-500/30":"bg-red-900/20 border-red-500/30")}>
        <div className={"font-black "+(result.won?"text-green-400":"text-red-400")}>{result.matches>0?`Matched ${result.matches}x!`:"No match"} {result.won?"+":"-"}{"$"}{result.amount.toLocaleString()}</div>
      </div>}
      <div className="flex justify-center"><button onClick={play} className="px-10 py-3 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-all">PLAY</button></div>
    </div>
  );
}

/* ═══════════ FORTUNE COOKIE ═══════════ */
function FortuneCookieGame() {
  const [bet, setBet] = useState(500);
  const [opened, setOpened] = useState(false);
  const [fortune, setFortune] = useState<{mult:number;text:string;type:string}|null>(null);
  const fortunes = [
    {mult:0.5,text:"Bad luck today... half your bet lost.",type:"bad"},
    {mult:1,text:"Break even. Fortune smiles neutral.",type:"neutral"},
    {mult:2,text:"Lucky! Double your money!",type:"good"},
    {mult:5,text:"FIVE BAGGER! Fortune favors the bold!",type:"great"},
    {mult:10,text:"MEGA FORTUNE! 10x payout!",type:"amazing"},
    {mult:20,text:"LEGENDARY! 20x YOUR BET!",type:"legendary"},
    {mult:0,text:"WORST COOKIE EVER! Lost it all!",type:"terrible"},
  ];

  const open = () => {
    const f=fortunes[Math.floor(Math.random()*fortunes.length)];
    setFortune(f); setOpened(true);
  };

  return (
    <div className="space-y-5">
      <BI value={bet} onChange={setBet} presets={[100,500,1000]} />
      <div className="flex justify-center py-6">
        {!opened?<button onClick={open} className="text-8xl hover:scale-110 transition-all cursor-pointer drop-shadow-lg" style={{filter:"drop-shadow(0 0 20px rgba(212,153,69,0.3))"}}>{"\ud83e\udd5f"}</button>
        :<motion.div initial={{scale:0,rotateY:180}} animate={{scale:1,rotateY:0}} className="text-center">
          <div className="text-6xl mb-3">{"\ud83d\udca3"}</div>
          <div className={"text-xl font-black "+(fortune!.mult>1?"text-green-400":fortune!.mult>0?"text-amber-400":"text-red-400")}>{fortune!.text}</div>
          <div className={"text-lg font-bold mt-2 "+(fortune!.mult>1?"text-green-300":fortune!.mult>0?"text-amber-300":"text-red-300")}>{fortune!.mult>0?"+":"-"}{"$"}{Math.floor(bet*fortune!.mult).toLocaleString()}</div>
        </motion.div>}
      </div>
      {opened&&<div className="flex justify-center"><button onClick={()=>{setOpened(false);setFortune(null);}} className="px-6 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-black rounded-xl text-sm font-black shadow-lg hover:scale-105 transition-all">New Cookie</button></div>}
    </div>
  );
}
/* ═══════════ INSTANT WIN ═══════════ */

function InstantWinPage() {
  const [g, setG] = useState("crash");
  const tabs: [string, string][] = [["crash","Crash"],["mines","Mines"],["plinko","Plinko"],["limbo","Limbo"],["fortune","Fortune Cookie"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Instant Win</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="crash"?<CrashGame/>:g==="mines"?<MinesGame/>:g==="plinko"?<PlinkoGame/>:g==="limbo"?<LimboGame/>:<FortuneCookieGame/>}</div>
    </div>
  );
}

/* ═══════════ DICE ARENA ═══════════ */
function DiceArenaPage() {
  const [g, setG] = useState("duel");
  const tabs: [string, string][] = [["duel","Dice Duel"],["hilo","Hi-Lo Dice"],["sudoku","Sudoku Dice"],["war","Dice War"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Dice Arena</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="duel"?<DiceDuelGame/>:g==="hilo"?<HiLoDiceGame/>:g==="sudoku"?<SudokuDiceGame/>:<WarGame/>}</div>
    </div>
  );
}

/* ═══════════ CARD GAMES ═══════════ */
function CardGamesPage() {
  const [g, setG] = useState("war");
  const tabs: [string, string][] = [["war","War"],["hilo","Hi-Lo"],["reddog","Red Dog"],["threecard","3 Card Poker"],["letitride","Let It Ride"],["dragon","Dragon Tiger"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Card Games</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="war"?<WarGame/>:g==="hilo"?<HiLoGame/>:g==="reddog"?<RedDogGame/>:g==="threecard"?<ThreeCardPokerGame/>:g==="letitride"?<LetItRideGame/>:<DragonTigerGame/>}</div>
    </div>
  );
}

/* ═══════════ FUN GAMES ═══════════ */
function FunGamesPage() {
  const [g, setG] = useState("memory");
  const tabs: [string, string][] = [["memory","Memory Dice"],["scratch_poker","Scratch Poker"],["treasure","Treasure Hunt"],["lucky","Lucky Number"],["wheel6","Wheel 6"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Fun Games</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="memory"?<MemoryDiceGame/>:g==="scratch_poker"?<ScratchPokerGame/>:g==="treasure"?<TreasureHuntGame/>:g==="lucky"?<LuckyNumberGame/>:<Wheel6Game/>}</div>
    </div>
  );
}

/* ═══════════ POKER LOUNGE ═══════════ */
function PokerLoungePage() {
  const [g, setG] = useState("video");
  const tabs: [string, string][] = [["video","Video Poker (Jacks+)"],["caribbean","Caribbean Stud"],["paigow","Pai Gow Poker"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-amber-400">Poker Lounge</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-amber-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6">{g==="video"?<VideoPokerGame/>:g==="caribbean"?<CaribbeanStudGame/>:<PaiGowGame/>}</div>
    </div>
  );
}

/* ═══════════ HIGH ROLLER ═══════════ */
function HighRollerPage() {
  const [g, setG] = useState("flash");
  const tabs: [string, string][] = [["flash","Flash Crash"],["vip_bj","VIP Blackjack"],["vip_bacc","High Stakes Baccarat"],["vip_poker","Private Poker"]];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-red-400">High Roller VIP</h3>
      <div className="flex gap-1.5 flex-wrap">{tabs.map(([k,l])=>(
        <button key={k} onClick={()=>setG(k)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all "+(g===k?"bg-red-600 text-white shadow-lg":"bg-slate-800/40 text-slate-500 border border-slate-700/30")}>{l}</button>
      ))}</div>
      <div className="mafia-card rounded-2xl p-6 border-red-900/20">{g==="flash"?<FlashCrashGame/>:g==="vip_bj"?<BlackjackGame/>:g==="vip_bacc"?<BaccaratGame/>:<PokerGame/>}</div>
    </div>
  );
}

/* ═══════════ BATCH 1: BACCARAT ROOM, ROULETTE ROYALE, DICE PALACE ═══════════ */

function MiniBaccaratGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<"player"|"banker"|"tie">("player");
  const [hand, setHand] = useState<{p:Card[];b:Card[]}>({p:[],b:[]});
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const [hist, setHist] = useState<{w:boolean;a:number}[]>([]);
  const [shoe, setShoe] = useState<Card[]>(makeDeck(8));
  const [stats, setStats] = useState({w:0,l:0,t:0});

  const deal = () => {
    let s = [...shoe];
    if(s.length<20) s=makeDeck(8);
    const draw=()=>s.shift()!;
    const p=[draw(),draw()], b=[draw(),draw()];
    const pt=hv(p).total, bt=hv(b).total;
    let pp=pt, bb=bt;
    if(pp<=5) { p.push(draw()); pp=hv(p).total; }
    if(bb<=5 || (bb===6 && pp>5)) { b.push(draw()); bb=hv(b).total; }
    // No commission banker wins
    let w=pp>bb?"player":bb>pp?"banker":"tie";
    let amt=0;
    if(w===pick) {
      amt = pick==="tie"? bet*8 : pick==="banker"? bet : bet;
      setStats(s=>({...s,w:s.w+1}));
    } else if(w==="tie") {
      amt = pick==="tie"? bet*8 : 0;
      if(w!==pick) setStats(s=>({...s,t:s.t+1}));
    } else {
      setStats(s=>({...s,l:s.l+1}));
    }
    setHand({p,b});
    setResult({won: w===pick || (w==="tie"&&pick==="tie"), amt, text: w.toUpperCase()+(w==="banker"?" (5% Commission)":"")});
    setHist(h=>[{w:w===pick||w==="tie",a:amt},...h].slice(0,20));
    setShoe(s);
  };

  const netTotal = hist.reduce((s,h)=>s+(h.w?h.a:-h.a),0);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">MINI BACCARAT</div>
        <div className="text-xs text-slate-400">No Commission | Player 1:1 | Banker 0.95:1 | Tie 8:1</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["player","banker","tie"] as const).map(w => (
          <button key={w} onClick={()=>setPick(w)} className={`p-3 rounded-xl font-black text-lg transition-all ${pick===w
            ? w==="player"?"bg-blue-600 text-white shadow-lg shadow-blue-900/50"
            : w==="banker"?"bg-red-600 text-white shadow-lg shadow-red-900/50"
            : "bg-green-600 text-white shadow-lg shadow-green-900/50"
            :"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>
            {w==="player"?"PLAYER":w==="banker"?"BANKER":"TIE"}
            <div className="text-xs opacity-70">{w==="tie"?"8:1":w==="banker"?"0.95:1":"1:1"}</div>
          </button>
        ))}
      </div>
      {hand.p.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card p-3 rounded-xl">
            <div className="text-blue-400 text-xs font-bold mb-1">PLAYER ({hv(hand.p).total})</div>
            <div className="flex gap-1 flex-wrap">{hand.p.map((c,i)=><PC key={i} card={c} sm />)}</div>
          </div>
          <div className="mafia-card p-3 rounded-xl">
            <div className="text-red-400 text-xs font-bold mb-1">BANKER ({hv(hand.b).total})</div>
            <div className="flex gap-1 flex-wrap">{hand.b.map((c,i)=><PC key={i} card={c} sm />)}</div>
          </div>
        </div>
      )}
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000,5000,10000]} />
      <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-green-400">W:{stats.w}</span>
        <span className="text-red-400">L:{stats.l}</span>
        <span className="text-amber-400">Net: <span className={netTotal>=0?"text-green-400":"text-red-400"}>{netTotal>=0?"+":""}{netTotal.toLocaleString()}</span></span>
      </div>
      {hist.length>0 && (
        <div className="flex gap-1 flex-wrap">{hist.map((h,i)=><span key={i} className={`text-[9px] px-1 py-0.5 rounded ${h.w?"bg-green-900/40 text-green-400":"bg-red-900/40 text-red-400"}`}>{h.w?"+":"-"}{h.a.toLocaleString()}</span>)}</div>
      )}
    </div>
  );
}

function SpeedBaccaratGame() {
  const [bet, setBet] = useState(200);
  const [pick, setPick] = useState<"player"|"banker">("player");
  const [hand, setHand] = useState<{p:Card[];b:Card[]}>({p:[],b:[]});
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);
  const [count, setCount] = useState(0);

  const deal = () => {
    const s=makeDeck(8);
    const p=[s[0],s[2],s[4]], b=[s[1],s[3],s[5]];
    const pt=hv(p).total, bt=hv(b).total;
    const w=pt>bt?"player":bt>pt?"banker":"tie";
    const amt=w===pick ? bet : -bet;
    setHand({p,b});
    setResult({won:w===pick, amt: amt>0?amt:0});
    setCount(c=>c+1);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">SPEED BACCARAT</div>
        <div className="text-xs text-slate-400">Rapid-fire rounds | {count} rounds played</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["player","banker"] as const).map(w => (
          <button key={w} onClick={()=>setPick(w)} className={`p-4 rounded-xl font-black text-xl transition-all ${pick===w ? w==="player"?"bg-blue-600 text-white shadow-lg":"bg-red-600 text-white shadow-lg" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>
            {w.toUpperCase()}
          </button>
        ))}
      </div>
      {hand.p.length>0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card p-3 rounded-xl"><div className="text-blue-400 text-xs font-bold mb-1">PLAYER {hv(hand.p).total}</div><div className="flex gap-1">{hand.p.map((c,i)=><PC key={i} card={c} sm />)}</div></div>
          <div className="mafia-card p-3 rounded-xl"><div className="text-red-400 text-xs font-bold mb-1">BANKER {hv(hand.b).total}</div><div className="flex gap-1">{hand.b.map((c,i)=><PC key={i} card={c} sm />)}</div></div>
        </div>
      )}
      <BI value={bet} onChange={setBet} presets={[100,200,500,1000,5000]} />
      <button onClick={deal} className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-xl rounded-xl hover:scale-[1.02] transition-all">DEAL FAST</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function SqueezeBaccaratGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"player"|"banker">("player");
  const [hand, setHand] = useState<{p:Card[];b:Card[]}>({p:[],b:[]});
  const [revealP, setRevealP] = useState(0);
  const [revealB, setRevealB] = useState(0);
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);

  const deal = () => {
    const s=makeDeck(8);
    const p=[s[0],s[2],s[4]], b=[s[1],s[3],s[5]];
    setHand({p,b});
    setRevealP(0); setRevealB(0); setResult(null);
    setTimeout(()=>setRevealP(1),300);
    setTimeout(()=>setRevealP(p.length),600);
    setTimeout(()=>setRevealB(1),1000);
    setTimeout(()=>{
      setRevealB(b.length);
      const pt=hv(p).total, bt=hv(b).total;
      const w=pt>bt?"player":bt>pt?"banker":"tie";
      setResult({won:w===pick, amt:w===pick?bet:0});
    },1500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-purple-400">SQUEEZE BACCARAT</div>
        <div className="text-xs text-slate-400">Cards revealed slowly for maximum tension</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["player","banker"] as const).map(w=>(
          <button key={w} onClick={()=>setPick(w)} className={`p-4 rounded-xl font-black transition-all ${pick===w?(w==="player"?"bg-blue-600":"bg-red-600")+" text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>{w.toUpperCase()}</button>
        ))}
      </div>
      {hand.p.length>0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card p-3 rounded-xl"><div className="text-blue-400 text-xs font-bold mb-1">PLAYER</div><div className="flex gap-1">{hand.p.slice(0,revealP).map((c,i)=><PC key={i} card={c} sm />)}{hand.p.slice(revealP).map((_,i)=><div key={i} className="w-8 h-12 bg-slate-700 rounded border border-slate-600" />)}</div></div>
          <div className="mafia-card p-3 rounded-xl"><div className="text-red-400 text-xs font-bold mb-1">BANKER</div><div className="flex gap-1">{hand.b.slice(0,revealB).map((c,i)=><PC key={i} card={c} sm />)}{hand.b.slice(revealB).map((_,i)=><div key={i} className="w-8 h-12 bg-slate-700 rounded border border-slate-600" />)}</div></div>
        </div>
      )}
      <BI value={bet} onChange={setBet} presets={[200,500,1000,5000,10000]} />
      <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">SQUEEZE & DEAL</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function NoCommissionBaccaratGame() {
  const [bet, setBet] = useState(300);
  const [hand, setHand] = useState<{p:Card[];b:Card[]}>({p:[],b:[]});
  const [result, setResult] = useState<{won:boolean;amt:number;winner:string}|null>(null);

  const deal = () => {
    const s=makeDeck(8);
    const p=[s[0],s[2]], b=[s[1],s[3]];
    const pt=hv(p).total, bt=hv(b).total;
    // No commission but banker 6 pays half
    let winner = pt>bt?"player":bt>pt?"banker":"tie";
    let amt=0;
    if(winner==="player") { amt=bet; }
    else if(winner==="banker") {
      if(bt===6) amt=bet*0.5; else amt=bet; // 50% on 6
    } else { amt=-bet; }
    setHand({p,b});
    setResult({won: amt>0, amt: Math.max(amt,0), winner: winner.toUpperCase()+(winner==="banker"&&bt===6?" (6 PAYS HALF)":"")});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-400">NO COMMISSION BACCARAT</div>
        <div className="text-xs text-slate-400">Banker 6 pays half | No 5% commission</div>
      </div>
      {hand.p.length>0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card p-3 rounded-xl"><div className="text-blue-400 text-xs font-bold">PLAYER {hv(hand.p).total}</div><div className="flex gap-1">{hand.p.map((c,i)=><PC key={i} card={c} sm />)}</div></div>
          <div className="mafia-card p-3 rounded-xl"><div className="text-red-400 text-xs font-bold">BANKER {hv(hand.b).total}</div><div className="flex gap-1">{hand.b.map((c,i)=><PC key={i} card={c} sm />)}</div></div>
        </div>
      )}
      <BI value={bet} onChange={setBet} presets={[100,300,1000,5000]} />
      <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      {result && <WB won={result.won} amount={result.amt} text={result.winner} />}
    </div>
  );
}

function LightningBaccaratGame() {
  const [bet, setBet] = useState(500);
  const [hand, setHand] = useState<{p:Card[];b:Card[]}>({p:[],b:[]});
  const [lightning, setLightning] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number;multi:number}|null>(null);

  const deal = () => {
    const s=makeDeck(8);
    const p=[s[0],s[2]], b=[s[1],s[3]];
    const lt = Array.from({length:5},()=>Math.floor(Math.random()*13)+2); // lightning cards (2-A)
    setLightning(lt);
    const pt=hv(p).total, bt=hv(b).total;
    const w=pt>bt?"player":bt>pt?"banker":"tie";
    // Count lightning matches
    const allH = [...p,...b];
    const matchCount = allH.filter(c=>lt.includes(c.rank as any)).length;
    const multi = matchCount>0 ? Math.min(matchCount*2, 8) : 1;
    const won = w==="player";
    setResult({won, amt: won ? bet*multi : 0, multi});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-300">LIGHTNING BACCARAT</div>
        <div className="text-xs text-slate-400">Lightning strikes can multiply wins up to 8x!</div>
      </div>
      {lightning.length>0 && (
        <div className="mafia-card p-2 rounded-xl">
          <div className="text-[10px] text-yellow-400 font-bold mb-1">LIGHTNING CARDS</div>
          <div className="flex gap-1">{lightning.map((n,i)=><span key={i} className="text-yellow-300 font-mono text-sm">{["A","2","3","4","5","6","7","8","9","10","J","Q","K"][n-1]}</span>)}</div>
        </div>
      )}
      {hand.p.length>0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card p-3 rounded-xl"><div className="text-blue-400 text-xs font-bold">PLAYER {hv(hand.p).total}</div><div className="flex gap-1">{hand.p.map((c,i)=><PC key={i} card={c} sm />)}</div></div>
          <div className="mafia-card p-3 rounded-xl"><div className="text-red-400 text-xs font-bold">BANKER {hv(hand.b).total}</div><div className="flex gap-1">{hand.b.map((c,i)=><PC key={i} card={c} sm />)}</div></div>
        </div>
      )}
      <BI value={bet} onChange={setBet} presets={[200,500,1000,5000]} />
      <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-700 text-black font-black rounded-xl hover:scale-[1.02] transition-all">DEAL WITH LIGHTNING</button>
      {result && <div className={`p-4 rounded-xl text-center ${result.won?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
        <div className={`text-lg font-black ${result.won?"text-green-400":"text-red-400"}`}>{result.won?"WINNER!":"BANKER WINS"}</div>
        {result.multi>1 && <div className="text-yellow-400 font-bold animate-pulse">LIGHTNING x{result.multi} MULTIPLIER!</div>}
        <div className={`text-sm font-bold ${result.won?"text-green-300":"text-red-300"}`}>{result.won?"+":"-"}${(result.won?bet*result.multi:bet).toLocaleString()}</div>
      </div>}
    </div>
  );
}

/* ═══════════ ROULETTE ROYALE ═══════════ */

function AmericanRouletteGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<string>("red");
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{n:number;won:boolean;amt:number}|null>(null);
  const [last, setLast] = useState<number[]>([]);
  const AmericanNums = [0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,0,27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2];

  const spinWheel = () => {
    setSpin(true); setResult(null);
    const finalIdx = Math.floor(Math.random() * 38);
    const finalNum = AmericanNums[finalIdx];
    setTimeout(() => {
      setSpin(false);
      const isGreen = finalNum === 0;
      const isRed = RED_N.includes(finalNum);
      let won = false;
      if (pick === "red" && isRed) won = true;
      else if (pick === "black" && !isRed && !isGreen) won = true;
      else if (pick === "green" && isGreen) won = true;
      else if (pick === "odd" && finalNum%2===1 && !isGreen) won = true;
      else if (pick === "even" && finalNum%2===0 && !isGreen) won = true;
      else if (pick === "1-18" && finalNum>=1 && finalNum<=18) won = true;
      else if (pick === "19-36" && finalNum>=19) won = true;
      setResult({n:finalNum, won, amt: won ? bet*2 : 0});
      setLast(h=>[finalNum,...h].slice(0,20));
    }, 2000);
  };

  const bets = ["red","black","green","odd","even","1-18","19-36"];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">AMERICAN ROULETTE</div>
        <div className="text-xs text-slate-400">Double Zero (0, 00) | House Edge 5.26%</div>
      </div>
      <div className={`w-full h-32 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-red-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-4xl animate-spin">🎡</div> :
          result ? <div className="text-center"><div className={`text-5xl font-black ${result.n===0||result.n===37?"text-green-400":rc(result.n)==="red"?"text-red-400":"text-slate-300"}`}>{result.n===37?"00":result.n}</div></div>
          : <div className="text-slate-600 text-lg">Place your bets</div>}
      </div>
      <div className="flex flex-wrap gap-1.5">{last.map((n,i)=><span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${n===0?"bg-green-600 text-white":rc(n)==="red"?"bg-red-600 text-white":"bg-slate-700 text-slate-300"}`}>{n}</span>)}</div>
      <div className="flex flex-wrap gap-1.5">{bets.map(b=><button key={b} onClick={()=>setPick(b)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pick===b?"bg-amber-600 text-black shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{b==="red"?"🔴 Red":b==="black"?"⚫ Black":b==="green"?"🟢 0/00":b.toUpperCase()}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000,5000]} />
      <button onClick={spinWheel} disabled={spin} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function FrenchRouletteGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState("red");
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{n:number;won:boolean;amt:number}|null>(null);
  const [last, setLast] = useState<number[]>([]);

  const spinWheel = () => {
    setSpin(true); setResult(null);
    const finalNum = Math.floor(Math.random() * 37); // 0-36
    setTimeout(()=>{
      setSpin(false);
      const isGreen = finalNum === 0;
      const isRed = RED_N.includes(finalNum);
      let won = false;
      if(pick==="red"&&isRed) won=true;
      else if(pick==="black"&&!isRed&&!isGreen) won=true;
      else if(pick==="odd"&&finalNum%2===1&&!isGreen) won=true;
      else if(pick==="even"&&finalNum%2===0&&!isGreen) won=true;
      else if(pick==="low"&&finalNum>=1&&finalNum<=18) won=true;
      else if(pick==="high"&&finalNum>=19) won=true;
      // La Partage: if 0, even bets get half back
      let amt = won ? bet*2 : 0;
      if(finalNum===0 && ["red","black","odd","even","low","high"].includes(pick)) {
        amt = bet/2; // La Partage returns half
        setResult({n:finalNum, won:false, amt}); // not a win but partial return
        setLast(h=>[finalNum,...h].slice(0,20));
        return;
      }
      setResult({n:finalNum, won, amt});
      setLast(h=>[finalNum,...h].slice(0,20));
    },2000);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-blue-400">FRENCH ROULETTE</div>
        <div className="text-xs text-slate-400">Single Zero | La Partage Rule | House Edge 1.35%</div>
      </div>
      <div className={`w-full h-32 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-blue-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-4xl animate-spin">🎡</div> :
          result ? <div className="text-center"><div className={`text-5xl font-black ${result.n===0?"text-green-400":rc(result.n)==="red"?"text-red-400":"text-slate-300"}`}>{result.n}</div></div>
          : <div className="text-slate-600">Place your bets</div>}
      </div>
      <div className="flex flex-wrap gap-1.5">{last.map((n,i)=><span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${n===0?"bg-green-600 text-white":rc(n)==="red"?"bg-red-600 text-white":"bg-slate-700 text-slate-300"}`}>{n}</span>)}</div>
      <div className="flex flex-wrap gap-1.5">{["red","black","odd","even","low","high"].map(b=><button key={b} onClick={()=>setPick(b)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pick===b?"bg-blue-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{b==="red"?"Red":b==="black"?"Black":b==="low"?"1-18":b==="high"?"19-36":b.toUpperCase()}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={spinWheel} disabled={spin} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
      {result && <WB won={result.amt > 0 && result.amt < bet} amount={result.amt} text="LA PARTAGE: Half returned" />}
    </div>
  );
}

function DoubleBallRouletteGame() {
  const [bet, setBet] = useState(100);
  const [spin, setSpin] = useState(false);
  const [results, setResults] = useState<{n1:number;n2:number}|null>(null);
  const [last, setLast] = useState<{n1:number;n2:number}[]>([]);

  const spinWheel = () => {
    setSpin(true); setResults(null);
    setTimeout(()=>{
      const n1=Math.floor(Math.random()*37), n2=Math.floor(Math.random()*37);
      setResults({n1,n2});
      setLast(h=>[{n1,n2},...h].slice(0,10));
      setSpin(false);
    },2000);
  };

  const won = results ? (RED_N.includes(results.n1)&&RED_N.includes(results.n2)) : false;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-green-400">DOUBLE BALL ROULETTE</div>
        <div className="text-xs text-slate-400">Two balls, double the action | Both red = 12:1</div>
      </div>
      <div className={`w-full h-32 rounded-2xl flex items-center justify-center gap-6 transition-all ${spin?"bg-green-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-4xl animate-spin">🎡</div> :
          results ? <>
            <div className={`text-4xl font-black ${rc(results.n1)==="red"?"text-red-400":results.n1===0?"text-green-400":"text-slate-300"}`}>{results.n1}</div>
            <div className="text-slate-600">&</div>
            <div className={`text-4xl font-black ${rc(results.n2)==="red"?"text-red-400":results.n2===0?"text-green-400":"text-slate-300"}`}>{results.n2}</div>
          </> : <div className="text-slate-600">Two balls drop</div>}
      </div>
      <div className="flex gap-1 flex-wrap">{last.map((h,i)=><span key={i} className="text-[9px] px-1 bg-slate-800 rounded text-slate-400">{h.n1},{h.n2}</span>)}</div>
      <div className="mafia-card p-3 rounded-xl text-xs text-slate-400 space-y-1">
        <div><span className="text-green-400">Both Green:</span> 35:1</div>
        <div><span className="text-red-400">Both Red:</span> 12:1</div>
        <div><span className="text-slate-300">Any Match:</span> 5:1</div>
        <div>Same Color: 3:1</div>
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={spinWheel} disabled={spin} className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN TWO BALLS"}</button>
      {results && <WB won={won} amount={won?bet*12:0} text={won?"BOTH RED!":"Miss"} />}
    </div>
  );
}

function MiniRouletteGame() {
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<string>("red");
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{n:number;won:boolean;amt:number}|null>(null);
  const MiniNums = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];

  const spinWheel = () => {
    setSpin(true); setResult(null);
    setTimeout(()=>{
      const n = MiniNums[Math.floor(Math.random()*13)];
      const isGreen = n===0;
      const isRed = [1,3,5,7,9,12].includes(n);
      let won = false;
      if(pick==="red"&&isRed) won=true;
      else if(pick==="black"&&!isRed&&!isGreen) won=true;
      else if(pick==="low"&&n>=1&&n<=6) won=true;
      else if(pick==="high"&&n>=7&&n<=12) won=true;
      setResult({n, won, amt:won?bet*3:0});
      setSpin(false);
    },1500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-cyan-400">MINI ROULETTE</div>
        <div className="text-xs text-slate-400">13 numbers (0-12) | Faster rounds | Higher odds</div>
      </div>
      <div className={`w-full h-28 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-cyan-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-3xl animate-spin">🎡</div> :
          result ? <div className={`text-5xl font-black ${result.n===0?"text-green-400":[1,3,5,7,9,12].includes(result.n)?"text-red-400":"text-slate-300"}`}>{result.n}</div>
          : <div className="text-slate-600">Mini wheel</div>}
      </div>
      <div className="flex flex-wrap gap-1.5">{["red","black","low","high"].map(b=><button key={b} onClick={()=>setPick(b)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pick===b?"bg-cyan-600 text-white":"bg-slate-800/50 text-slate-400"}`}>{b==="low"?"1-6":b==="high"?"7-12":b.toUpperCase()}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[25,50,100,500]} />
      <button onClick={spinWheel} disabled={spin} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function MultiWheelRouletteGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState("red");
  const [wheels, setWheels] = useState(4);
  const [spin, setSpin] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const spinAll = () => {
    setSpin(true); setResults([]);
    const finalResults = Array.from({length:wheels},()=>Math.floor(Math.random()*37));
    setTimeout(()=>{
      setResults(finalResults);
      setSpin(false);
    },2500);
  };

  const wins = results.filter(n => {
    const isGreen=n===0, isRed=RED_N.includes(n);
    if(pick==="red"&&isRed) return true;
    if(pick==="black"&&!isRed&&!isGreen) return true;
    if(pick==="green"&&isGreen) return true;
    return false;
  }).length;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-orange-400">MULTI-WHEEL ROULETTE</div>
        <div className="text-xs text-slate-400">{wheels} wheels spin simultaneously | {wins>0?`${wins}/${wheels} wins!`:"Spin to win"}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({length:wheels},(_,i)=>{
          const n = results[i];
          return <div key={i} className={`h-16 rounded-xl flex items-center justify-center font-black text-xl transition-all ${spin?"bg-orange-900/30 animate-pulse":n!==undefined?`bg-slate-800 ${rc(n)==="red"?"text-red-400":n===0?"text-green-400":"text-slate-300"}`:"bg-slate-800/50 text-slate-600"}`}>
            {spin?"...":n!==undefined?n:"?"}
          </div>;
        })}
      </div>
      <div className="flex flex-wrap gap-1.5">{["red","black","green"].map(b=><button key={b} onClick={()=>setPick(b)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pick===b?"bg-orange-600 text-white":"bg-slate-800/50 text-slate-400"}`}>{b.toUpperCase()}</button>)}</div>
      <div className="flex gap-2 items-center"><span className="text-xs text-slate-400">Wheels:</span>{[2,4,6,8].map(n=><button key={n} onClick={()=>setWheels(n)} className={`px-2 py-1 rounded text-xs font-bold ${wheels===n?"bg-orange-600 text-white":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={spinAll} disabled={spin} className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING ALL...":"SPIN ALL WHEELS"}</button>
      {results.length>0 && <div className="text-center"><div className={`text-lg font-black ${wins>0?"text-green-400":"text-red-400"}`}>{wins>0?`${wins} WHEELS WIN! +$${(wins*bet).toLocaleString()}`:`No wins on ${wheels} wheels`}</div></div>}
    </div>
  );
}

/* ═══════════ DICE PALACE ═══════════ */

function VegasCrapsGame() {
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<"comeout"|"point"|"done">("comeout");
  const [point, setPoint] = useState(0);
  const [dice, setDice] = useState<[number,number]>([1,1]);
  const [rolls, setRolls] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const [lineBet, setLineBet] = useState(true); // pass line

  const roll = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1;
    const total=d1+d2;
    setDice([d1,d2]);
    setRolls(r=>[total,...r].slice(0,10));

    if(phase==="comeout") {
      if(total===7||total===11) {
        setPhase("done");
        setResult({won:lineBet, amt:lineBet?bet:0, text:`NATURAL ${total}! ${lineBet?"YOU WIN":"YOU LOSE"}`});
      } else if(total===2||total===3||total===12) {
        setPhase("done");
        setResult({won:!lineBet, amt:!lineBet?bet:0, text:`CRAPS ${total}! ${lineBet?"SEVEN OUT":"PASS LINE LOSES"}`});
      } else {
        setPoint(total);
        setPhase("point");
        setResult(null);
      }
    } else if(phase==="point") {
      if(total===point) {
        setPhase("done");
        setResult({won:lineBet, amt:lineBet?bet:0, text:`HIT POINT ${point}! YOU WIN!`});
      } else if(total===7) {
        setPhase("done");
        setResult({won:!lineBet, amt:!lineBet?bet:0, text:"SEVEN OUT! You lose pass line."});
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">VEGAS CRAPS</div>
        <div className="text-xs text-slate-400">{phase==="comeout"?"Come Out Roll":phase==="point"?`Point is ${point}`:"Round Over"}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className={`mafia-card p-4 rounded-xl flex items-center justify-center ${phase==="point"?"border-amber-500/50 border-2":""}`}>
          <Die value={dice[0]} />
          <Die value={dice[1]} />
        </div>
        <div className="mafia-card p-4 rounded-xl text-center">
          <div className="text-xs text-slate-400 mb-1">TOTAL</div>
          <div className="text-4xl font-black text-amber-300">{dice[0]+dice[1]}</div>
          {phase==="point" && <div className="text-xs text-yellow-400 mt-1">Target: {point}</div>}
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">{rolls.map((r,i)=><span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${r===7?"bg-green-900/40 text-green-400":"bg-slate-800 text-slate-400"}`}>{r}</span>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={roll} disabled={phase==="done"} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{phase==="done"?"NEW ROUND":"ROLL DICE"}</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function BankCrapsGame() {
  const [bet, setBet] = useState(200);
  const [dice, setDice] = useState<[number,number]>([1,1]);
  const [history, setHistory] = useState<{d:[number,number];won:boolean}[]>([]);
  const [streak, setStreak] = useState(0);

  const roll = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1;
    const total=d1+d2;
    const isWin=total>=7;
    setDice([d1,d2]);
    if(isWin) setStreak(s=>s+1); else setStreak(0);
    setHistory(h=>[{d:[d1,d2] as [number,number],won:isWin},...h].slice(0,15));
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-emerald-400">BANK CRAPS</div>
        <div className="text-xs text-slate-400">7+ wins | Under 7 loses | Streak: {streak}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card p-4 rounded-xl flex items-center justify-center gap-3"><Die value={dice[0]} /><Die value={dice[1]} /></div>
        <div className="mafia-card p-4 rounded-xl text-center">
          <div className="text-xs text-slate-400">TOTAL</div>
          <div className={`text-4xl font-black ${dice[0]+dice[1]>=7?"text-green-400":"text-red-400"}`}>{dice[0]+dice[1]}</div>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">{history.map((h,i)=><span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${h.won?"bg-green-900/40 text-green-400":"bg-red-900/40 text-red-400"}`}>{h.d[0]}+{h.d[1]}</span>)}</div>
      <BI value={bet} onChange={setBet} presets={[100,200,500,1000]} />
      <button onClick={roll} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">ROLL</button>
      {history.length>0 && <WB won={history[0].won} amount={history[0].won?bet:0} text={history[0].won?`7+ STREAK x${Math.min(streak,5)}!`:"Under 7"} />}
    </div>
  );
}

function SimplifiedCrapsGame() {
  const [bet, setBet] = useState(50);
  const [dice, setDice] = useState<[number,number]>([1,1]);
  const [pick, setPick] = useState<"over"|"under">("over");
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);

  const roll = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1;
    const total=d1+d2;
    const won = pick==="over" ? total>=8 : total<=6;
    setDice([d1,d2]);
    setResult({won, amt:won?bet*2:0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-teal-400">SIMPLIFIED CRAPS</div>
        <div className="text-xs text-slate-400">Over 7 or Under 7 | 7 is a push</div>
      </div>
      <div className="mafia-card p-6 rounded-xl flex items-center justify-center gap-6">
        <Die value={dice[0]} /><Die value={dice[1]} />
        <div className={`text-4xl font-black ${dice[0]+dice[1]>=8?"text-green-400":dice[0]+dice[1]<=6?"text-red-400":"text-yellow-400"}`}>{dice[0]+dice[1]}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={()=>setPick("over")} className={`p-4 rounded-xl font-black text-xl transition-all ${pick==="over"?"bg-green-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>OVER 7</button>
        <button onClick={()=>setPick("under")} className={`p-4 rounded-xl font-black text-xl transition-all ${pick==="under"?"bg-red-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>UNDER 7</button>
      </div>
      <BI value={bet} onChange={setBet} presets={[25,50,100,500]} />
      <button onClick={roll} className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">ROLL</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function HazardGame() {
  const [bet, setBet] = useState(100);
  const [dice, setDice] = useState<[number,number]>([1,1]);
  const [mainChance, setMainChance] = useState(0);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const roll = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1;
    const total=d1+d2;
    setDice([d1,d2]);
    if(mainChance===0) {
      if(total===7||total===11) setResult({won:true,amt:bet*2,text:`NATURAL ${total}! WIN!`});
      else if(total===5||total===6||total===8) { setMainChance(total); setResult(null); }
      else setResult({won:false,amt:0,text:`CRAPS ${total}. Lose.`});
    } else {
      if(total===mainChance) setResult({won:true,amt:bet*2,text:`MADE YOUR CHANCE ${mainChance}!`});
      else if(total===7) setResult({won:false,amt:0,text:"SEVEN OUT!"});
      else setResult(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-indigo-400">HAZARD</div>
        <div className="text-xs text-slate-400">{mainChance>0?`Your Chance: ${mainChance}`:"Set the Main"}</div>
      </div>
      <div className="mafia-card p-4 rounded-xl flex items-center justify-center gap-6">
        <Die value={dice[0]} /><Die value={dice[1]} />
        <div className="text-3xl font-black text-indigo-300">{dice[0]+dice[1]}</div>
      </div>
      {mainChance===0 && <div className="text-xs text-center text-slate-400">Roll 5, 6, or 8 to set your chance number</div>}
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={roll} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">ROLL</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

/* ═══════════ BATCH 2: WHEEL & FORTUNE, ASIAN GAMES, VIDEO POKER LOUNGE ═══════════ */

function DreamCatcherGame() {
  const [bet, setBet] = useState(100);
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{seg:string;multi:number;won:boolean;amt:number}|null>(null);
  const segments = ["1x","1x","1x","2x","2x","5x","5x","10x","20x","40x"];
  const colors: Record<string,string> = {"1x":"bg-blue-600","2x":"bg-purple-600","5x":"bg-amber-600","10x":"bg-red-600","20x":"bg-green-600","40x":"bg-yellow-500"};

  const spinWheel = () => {
    setSpin(true); setResult(null);
    const seg = segments[Math.floor(Math.random()*segments.length)];
    const multi = parseInt(seg);
    setTimeout(()=>{
      setSpin(false);
      setResult({seg, multi, won:true, amt:bet*multi});
    },2500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-400">DREAM CATCHER</div>
        <div className="text-xs text-slate-400">Money wheel with multipliers up to 40x!</div>
      </div>
      <div className={`w-full h-40 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-yellow-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-5xl animate-spin">🎡</div> :
          result ? <div className="text-center"><div className="text-5xl font-black text-yellow-400 animate-bounce">{result.seg}</div><div className="text-sm text-green-400 font-bold">+${result.amt.toLocaleString()}</div></div>
          : <div className="text-5xl text-slate-600">🎡</div>}
      </div>
      <div className="flex gap-1 justify-center flex-wrap">{segments.map((s,i)=><span key={i} className={`px-2 py-1 rounded text-[10px] font-bold text-white ${colors[s]}`}>{s}</span>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={spinWheel} disabled={spin} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-700 text-black font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
    </div>
  );
}

function MoneyWheelGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState("1x");
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{seg:string;won:boolean;amt:number}|null>(null);
  const segs = ["1x","2x","3x","5x","10x","JACKPOT"];

  const spinWheel = () => {
    setSpin(true); setResult(null);
    const seg = segs[Math.floor(Math.random()*segs.length)];
    setTimeout(()=>{
      setSpin(false);
      const multi = seg==="JACKPOT"?50:parseInt(seg);
      setResult({seg, won:pick===seg||pick===seg.replace("x","")+"x", amt:pick===seg?bet*multi:0});
    },2000);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-pink-400">MONEY WHEEL</div>
        <div className="text-xs text-slate-400">Pick a segment | Jackpot pays 50x!</div>
      </div>
      <div className="flex gap-2 justify-center">{segs.map(s=><button key={s} onClick={()=>setPick(s)} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${pick===s?"bg-pink-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>{s}</button>)}</div>
      <div className={`w-full h-32 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-pink-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-4xl animate-spin">🎡</div> :
          result ? <div className="text-center"><div className={`text-5xl font-black ${result.won?"text-green-400":"text-red-400"}`}>{result.seg}</div></div>
          : <div className="text-slate-600">Spin!</div>}
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={spinWheel} disabled={spin} className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
      {result && <WB won={result.won} amount={result.amt} text={result.seg} />}
    </div>
  );
}

function LuckyWheelGame() {
  const [bet, setBet] = useState(50);
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const prizes = ["$100","$250","$500","$1000","$2500","$5000","$10000","MISS","MISS","MISS"];

  const spinIt = () => {
    setSpin(true); setResult(null);
    const prize = prizes[Math.floor(Math.random()*prizes.length)];
    setTimeout(()=>{
      setSpin(false);
      const won = !prize.includes("MISS");
      const amt = won ? parseInt(prize.replace("$","")) : 0;
      setResult({won, amt, text:prize});
    },2000);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-violet-400">LUCKY WHEEL</div>
        <div className="text-xs text-slate-400">30% chance to win | Up to $10,000</div>
      </div>
      <div className={`w-full h-32 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-violet-900/50 animate-pulse":"bg-slate-900/50"}`}>
        {spin ? <div className="text-5xl animate-spin">🎰</div> :
          result ? <div className="text-center"><div className={`text-4xl font-black ${result.won?"text-green-400":"text-red-400"}`}>{result.text}</div></div>
          : <div className="text-5xl text-slate-600">🎰</div>}
      </div>
      <BI value={bet} onChange={setBet} presets={[25,50,100,500]} />
      <button onClick={spinIt} disabled={spin} className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function MegaWheelGame() {
  const [bet, setBet] = useState(200);
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const prizes = ["1x","2x","3x","5x","10x","25x","50x","BANKRUPT"];

  const spinIt = () => {
    setSpin(true); setResult(null);
    const p = prizes[Math.floor(Math.random()*prizes.length)];
    setTimeout(()=>{
      setSpin(false);
      if(p==="BANKRUPT") setResult({won:false,amt:0,text:"BANKRUPT! Lost your bet."});
      else setResult({won:true,amt:bet*parseInt(p),text:`${p} MULTIPLIER!`});
    },3000);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">MEGA WHEEL</div>
        <div className="text-xs text-slate-400">Risk it all for 50x | But beware the BANKRUPT</div>
      </div>
      <div className={`w-full h-40 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-red-900/50 animate-pulse":"bg-slate-900/50"}`}>
        {spin ? <div className="text-6xl animate-spin">🎡</div> :
          result ? <div className="text-center"><div className={`text-4xl font-black animate-bounce ${result.won?"text-green-400":"text-red-400"}`}>{result.text}</div></div>
          : <div className="text-6xl text-slate-600">🎡</div>}
      </div>
      <div className="flex gap-1 justify-center flex-wrap">{prizes.map((p,i)=><span key={i} className={`px-2 py-1 rounded text-[10px] font-bold text-white ${p==="BANKRUPT"?"bg-red-700":parseInt(p)>=10?"bg-yellow-600":parseInt(p)>=5?"bg-amber-600":"bg-green-700"}`}>{p}</span>)}</div>
      <BI value={bet} onChange={setBet} presets={[100,200,500,1000]} />
      <button onClick={spinIt} disabled={spin} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN THE MEGA WHEEL"}</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function FortuneWheelGame() {
  const [bet, setBet] = useState(100);
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const segments = [
    {label:"$500",val:500,weight:30},
    {label:"$1000",val:1000,weight:25},
    {label:"$2000",val:2000,weight:20},
    {label:"$5000",val:5000,weight:15},
    {label:"$10000",val:10000,weight:7},
    {label:"$25000",val:25000,weight:2},
    {label:"$50000",val:50000,weight:1}
  ];

  const spinIt = () => {
    setSpin(true); setResult(null);
    const totalW = segments.reduce((s,seg)=>s+seg.weight,0);
    let r=Math.random()*totalW;
    let picked=segments[0];
    for(const seg of segments) { r-=seg.weight; if(r<=0){picked=seg;break;} }
    setTimeout(()=>{
      setSpin(false);
      setResult({won:true,amt:picked.val,text:`${picked.label}!`});
    },2500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">FORTUNE WHEEL</div>
        <div className="text-xs text-slate-400">Weighted prizes | Rare $50K jackpot!</div>
      </div>
      <div className={`w-full h-36 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-amber-900/50 animate-pulse":"bg-slate-900/50"}`}>
        {spin ? <div className="text-5xl animate-spin">🎡</div> :
          result ? <div className="text-center"><div className="text-5xl font-black text-amber-400 animate-bounce">{result.text}</div></div>
          : <div className="text-5xl text-slate-600">🎡</div>}
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500,1000]} />
      <button onClick={spinIt} disabled={spin} className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-black font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"SPINNING...":"SPIN"}</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

/* ═══════════ ASIAN GAMES ═══════════ */

function FanTanGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState(1);
  const [result, setResult] = useState<{remainder:number;won:boolean;amt:number}|null>(null);

  const play = () => {
    const total = Math.floor(Math.random()*100)+20;
    const remainder = total % 4;
    const won = remainder === pick;
    setResult({remainder, won, amt:won?bet*3:0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">FAN TAN</div>
        <div className="text-xs text-slate-400">Will the remainder be 1, 2, 3, or 0?</div>
      </div>
      <div className="grid grid-cols-4 gap-2">{[0,1,2,3].map(n=><button key={n} onClick={()=>setPick(n)} className={`p-4 rounded-xl font-black text-2xl transition-all ${pick===n?"bg-red-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>{n}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">PLAY</button>
      {result && <WB won={result.won} amount={result.amt} text={`Remainder: ${result.remainder}`} />}
    </div>
  );
}

function ChuckALuckGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState("big");
  const [dice, setDice] = useState<[number,number,number]>([1,1,1]);
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);

  const play = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1, d3=Math.floor(Math.random()*6)+1;
    const total=d1+d2+d3;
    setDice([d1,d2,d3]);
    const isTriple = d1===d2&&d2===d3;
    let won = false;
    if(pick==="big"&&total>=11&&!isTriple) won=true;
    if(pick==="small"&&total<=10&&!isTriple) won=true;
    if(pick==="triple"&&isTriple) won=true;
    setResult({won, amt:won?(pick==="triple"?bet*30:bet*2):0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-orange-400">CHUCK-A-LUCK</div>
        <div className="text-xs text-slate-400">Three dice | Big/Small/Triple</div>
      </div>
      <div className="mafia-card p-4 rounded-xl flex items-center justify-center gap-4">
        {dice.map((d,i)=><Die key={i} value={d} />)}
        <div className="text-2xl font-black text-orange-300">{dice[0]+dice[1]+dice[2]}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["big","small","triple"].map(p=><button key={p} onClick={()=>setPick(p)} className={`p-3 rounded-xl font-black transition-all ${pick===p?"bg-orange-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>{p.toUpperCase()}{p==="triple"?" (30:1)":" (1:1)"}</button>)}
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">ROLL</button>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function ChineseDiceGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState("specific");
  const [target, setTarget] = useState(6);
  const [dice, setDice] = useState<[number,number,number]>([1,1,1]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const play = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1, d3=Math.floor(Math.random()*6)+1;
    setDice([d1,d2,d3]);
    const count = [d1,d2,d3].filter(d=>d===target).length;
    const total = d1+d2+d3;
    let won=false, amt=0;
    if(pick==="specific" && count>=2) { won=true; amt=bet*(count===3?12:6); }
    else if(pick==="big" && total>=11) { won=true; amt=bet*2; }
    else if(pick==="small" && total<=10) { won=true; amt=bet*2; }
    else if(pick==="total" && total===target) { won=true; amt=bet*10; }
    setResult({won, amt, text:`${d1},${d2},${d3} = ${total}`});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-400">CHINESE DICE</div>
        <div className="text-xs text-slate-400">Sic Bo style | 3 dice</div>
      </div>
      <div className="mafia-card p-4 rounded-xl flex items-center justify-center gap-4">
        {dice.map((d,i)=><Die key={i} value={d} />)}
        <div className="text-2xl font-black text-yellow-300">{dice[0]+dice[1]+dice[2]}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["big","small","specific","total"].map(p=><button key={p} onClick={()=>setPick(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pick===p?"bg-yellow-600 text-white":"bg-slate-800/50 text-slate-400"}`}>{p==="big"?"BIG (11+)":p==="small"?"SMALL (10-)":p==="specific"?"2-3 of Kind":"TOTAL MATCH"}</button>)}
      </div>
      {pick==="specific" && (
        <div className="flex gap-1">{[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>setTarget(n)} className={`w-10 h-10 rounded-xl font-bold ${target===n?"bg-yellow-500 text-black":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      )}
      {pick==="total" && (
        <div className="flex gap-1">{[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(n=><button key={n} onClick={()=>setTarget(n)} className={`w-9 h-9 rounded-lg text-xs font-bold ${target===n?"bg-yellow-500 text-black":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      )}
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">ROLL</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function PachinkoGame() {
  const [bet, setBet] = useState(100);
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState<{slot:number;won:boolean;amt:number}|null>(null);
  const slots = ["0.5x","1x","1.5x","2x","3x","5x","10x","25x"];

  const drop = () => {
    setSpin(true); setResult(null);
    // Pachinko: normal distribution, center more likely
    const idx = Math.floor(Math.random()*slots.length);
    setTimeout(()=>{
      setSpin(false);
      const multi = parseFloat(slots[idx]);
      setResult({slot:idx, won:true, amt:Math.floor(bet*multi)});
    },2000);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-pink-400">PACHINKO</div>
        <div className="text-xs text-slate-400">Drop the ball | 25x max multiplier</div>
      </div>
      <div className={`w-full h-48 rounded-2xl flex items-center justify-center transition-all ${spin?"bg-pink-900/50 animate-pulse":"bg-slate-900/50 border border-slate-700/50"}`}>
        {spin ? <div className="text-5xl animate-bounce">⚪</div> :
          result ? <div className="text-center"><div className="text-6xl font-black text-pink-400 animate-bounce">{slots[result.slot]}</div></div>
          : <div className="text-slate-600 text-lg">Drop a ball!</div>}
      </div>
      <div className="flex gap-1 justify-center flex-wrap">{slots.map((s,i)=><span key={i} className={`px-2 py-1 rounded text-[10px] font-bold text-white ${i>=6?"bg-yellow-600":i>=4?"bg-amber-600":"bg-pink-600"}`}>{s}</span>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={drop} disabled={spin} className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">{spin?"DROPPING...":"DROP BALL"}</button>
      {result && <WB won={result.won} amount={result.amt} text={`${slots[result.slot]} Multiplier`} />}
    </div>
  );
}

function MahjongTilesGame() {
  const [bet, setBet] = useState(100);
  const [tiles, setTiles] = useState<string[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const tileTypes = ["Dragon Red","Dragon Green","Dragon White","Bamboo 1","Bamboo 9","Character 1","Character 9","Wind East","Wind West","Wind South","Wind North"];

  const draw = () => {
    const t1 = tileTypes[Math.floor(Math.random()*tileTypes.length)];
    const t2 = tileTypes[Math.floor(Math.random()*tileTypes.length)];
    setTiles([t1,t2]);
    const isPair = t1===t2;
    const isDragons = t1.includes("Dragon") && t2.includes("Dragon");
    let won=false, amt=0, text="";
    if(isDragons) { won=true; amt=bet*10; text="DOUBLE DRAGON! 10x"; }
    else if(isPair) { won=true; amt=bet*5; text="PAIR! 5x"; }
    else { text="No match"; }
    setResult({won, amt, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-cyan-400">MAHJONG TILES</div>
        <div className="text-xs text-slate-400">Draw 2 tiles | Match for multiplier</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t,i)=><div key={i} className="mafia-card p-4 rounded-xl text-center"><div className="text-3xl mb-1">🀄</div><div className="text-xs text-cyan-300 font-bold">{t}</div></div>)}
        {tiles.length===0 && <>
          <div className="mafia-card p-4 rounded-xl flex items-center justify-center h-24"><div className="text-3xl">🀄</div></div>
          <div className="mafia-card p-4 rounded-xl flex items-center justify-center h-24"><div className="text-3xl">🀄</div></div>
        </>}
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={draw} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW TILES</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

/* ═══════════ VIDEO POKER LOUNGE ═══════════ */

function DeucesWildGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"deal"|"draw"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const deal = () => {
    const deck = makeDeck(1);
    const newHand = deck.slice(0,5);
    setHand(newHand);
    setHeld(new Set());
    setPhase("draw");
    setResult(null);
  };

  const drawCards = () => {
    const deck = makeDeck(1);
    let idx = 5;
    const newHand = hand.map((c,i) => held.has(i) ? c : deck[idx++]);
    setHand(newHand);
    setPhase("done");
    // Evaluate hand (simplified)
    const ranks = newHand.map(c=>c.rank);
    const hasDeuces = ranks.filter(r=>r==="2").length;
    const text = hasDeuces>=3 ? "THREE DEUCES!" : hasDeuces>=2 ? "TWO DEUCES" : "EVALUATING...";
    const won = hasDeuces>=1;
    setResult({won, amt:won?bet*(hasDeuces+1):0, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-emerald-400">DEUCES WILD</div>
        <div className="text-xs text-slate-400">All 2s are wild | Hold & Draw</div>
      </div>
      <div className="flex gap-2 justify-center">{hand.map((c,i)=><div key={i} onClick={()=>phase==="draw"&&setHeld(h=>{const n=new Set(h);n.has(i)?n.delete(i):n.add(i);return n;})} className={`cursor-pointer transition-all ${held.has(i)?"-translate-y-2 ring-2 ring-emerald-400 rounded-xl":""}`}><PC card={c} d={c.value===2?50:0} /></div>)}</div>
      {phase==="draw" && <div className="text-center text-xs text-emerald-400">Tap cards to hold</div>}
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {phase==="deal" ? <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : <button onClick={drawCards} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function JokerPokerGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"deal"|"draw"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const deal = () => {
    const deck = makeDeck(1);
    const newHand = deck.slice(0,5);
    setHand(newHand);
    setHeld(new Set());
    setPhase("draw");
    setResult(null);
  };

  const drawCards = () => {
    const deck = makeDeck(1);
    let idx = 5;
    const newHand = hand.map((c,i) => held.has(i) ? c : deck[idx++]);
    setHand(newHand);
    setPhase("done");
    const jokers = newHand.filter(c=>c.value===0).length;
    const text = jokers>=2 ? "JOKER POKER!" : jokers>=1 ? "One Joker" : "No Jokers";
    setResult({won:jokers>=1, amt:jokers>=1?bet*(jokers*3):0, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-purple-400">JOKER POKER</div>
        <div className="text-xs text-slate-400">Jokers are wild | Kings or Better to win</div>
      </div>
      <div className="flex gap-2 justify-center">{hand.map((c,i)=><div key={i} onClick={()=>phase==="draw"&&setHeld(h=>{const n=new Set(h);n.has(i)?n.delete(i):n.add(i);return n;})} className={`cursor-pointer transition-all ${held.has(i)?"-translate-y-2 ring-2 ring-purple-400 rounded-xl":""}`}><PC card={c} /></div>)}</div>
      {phase==="draw" && <div className="text-center text-xs text-purple-400">Tap cards to hold</div>}
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {phase==="deal" ? <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : <button onClick={drawCards} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function AcesAndEightsGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"deal"|"draw"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const deal = () => {
    const deck = makeDeck(1);
    setHand(deck.slice(0,5));
    setHeld(new Set());
    setPhase("draw"); setResult(null);
  };

  const drawCards = () => {
    const deck = makeDeck(1);
    let idx=5;
    const nh = hand.map((c,i)=>held.has(i)?c:deck[idx++]);
    setHand(nh); setPhase("done");
    const fours = nh.filter(c=>c.value>=7&&c.value<=10).length;
    const aces = nh.filter(c=>c.value===1).length;
    const eights = nh.filter(c=>c.value===8).length;
    const text = fours>=4 ? "4 OF A KIND 7s-Ks!" : aces>=4?"4 ACES!" : eights>=4?"4 EIGHTS!":"Miss";
    setResult({won:fours>=4||aces>=4||eights>=4, amt:fours>=4?bet*40:aces>=4?bet*40:eights>=4?bet*25:0, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">ACES & EIGHTS</div>
        <div className="text-xs text-slate-400">Bonus: 4 Aces/8s/7s-Ks pay extra</div>
      </div>
      <div className="flex gap-2 justify-center">{hand.map((c,i)=><div key={i} onClick={()=>phase==="draw"&&setHeld(h=>{const n=new Set(h);n.has(i)?n.delete(i):n.add(i);return n;})} className={`cursor-pointer transition-all ${held.has(i)?"-translate-y-2 ring-2 ring-red-400 rounded-xl":""}`}><PC card={c} /></div>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {phase==="deal" ? <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : <button onClick={drawCards} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function DoubleBonusGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"deal"|"draw"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const deal = () => {
    setHand(makeDeck(1).slice(0,5));
    setHeld(new Set()); setPhase("draw"); setResult(null);
  };

  const drawCards = () => {
    const deck=makeDeck(1); let idx=5;
    const nh=hand.map((c,i)=>held.has(i)?c:deck[idx++]);
    setHand(nh); setPhase("done");
    const aces=nh.filter(c=>c.value===1).length;
    const text = aces>=4?"4 ACES! 400x":aces>=3?"3 ACES!":aces>=2?"2 ACES":"Miss";
    setResult({won:aces>=2, amt:aces>=4?bet*400:aces>=3?bet*120:aces>=2?bet*10:0, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">DOUBLE BONUS</div>
        <div className="text-xs text-slate-400">4 Aces = 400x | 4 2s-4s = 160x</div>
      </div>
      <div className="flex gap-2 justify-center">{hand.map((c,i)=><div key={i} onClick={()=>phase==="draw"&&setHeld(h=>{const n=new Set(h);n.has(i)?n.delete(i):n.add(i);return n;})} className={`cursor-pointer transition-all ${held.has(i)?"-translate-y-2 ring-2 ring-amber-400 rounded-xl":""}`}><PC card={c} /></div>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {phase==="deal" ? <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : <button onClick={drawCards} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function AllAmericanGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"deal"|"draw"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const deal = () => {
    setHand(makeDeck(1).slice(0,5));
    setHeld(new Set()); setPhase("draw"); setResult(null);
  };

  const drawCards = () => {
    const deck=makeDeck(1); let idx=5;
    const nh=hand.map((c,i)=>held.has(i)?c:deck[idx++]);
    setHand(nh); setPhase("done");
    const flush = new Set(nh.map(c=>c.suit)).size===1;
    const straight = (() => { const rs=nh.map(c=>c.value).sort((a,b)=>a-b); return rs[4]-rs[0]===4 && new Set(rs).size===5; })();
    const royal = flush && straight && nh.some(c=>c.value===1) && nh.some(c=>c.value===13);
    const text = royal?"ROYAL FLUSH!":flush?"FLUSH!":straight?"STRAIGHT!":"Miss";
    setResult({won:royal||flush||straight, amt:royal?bet*800:flush?bet*50:straight?bet*20:0, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-blue-400">ALL AMERICAN</div>
        <div className="text-xs text-slate-400">Flush/Straight bonus | Royal = 800x</div>
      </div>
      <div className="flex gap-2 justify-center">{hand.map((c,i)=><div key={i} onClick={()=>phase==="draw"&&setHeld(h=>{const n=new Set(h);n.has(i)?n.delete(i):n.add(i);return n;})} className={`cursor-pointer transition-all ${held.has(i)?"-translate-y-2 ring-2 ring-blue-400 rounded-xl":""}`}><PC card={c} /></div>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {phase==="deal" ? <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : <button onClick={drawCards} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function JacksOrBetterGame() {
  const [bet, setBet] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"deal"|"draw"|"done">("deal");
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const deal = () => {
    setHand(makeDeck(1).slice(0,5));
    setHeld(new Set()); setPhase("draw"); setResult(null);
  };

  const drawCards = () => {
    const deck=makeDeck(1); let idx=5;
    const nh=hand.map((c,i)=>held.has(i)?c:deck[idx++]);
    setHand(nh); setPhase("done");
    // Simplified: pairs of J+
    const counts: Record<string,number>={};
    nh.forEach(c=>{counts[c.rank]=(counts[c.rank]||0)+1;});
    const pairs = Object.entries(counts).filter(([r,c])=>c>=2&&parseInt(r)>=11);
    const pairs2 = Object.entries(counts).filter(([,c])=>c>=2);
    const text = pairs.length>=2?"TWO PAIR!":pairs.length>=1?"JACKS OR BETTER!":pairs2.length>=1?"Low Pair":"Miss";
    const won = pairs.length>=1;
    setResult({won, amt:won?bet*2:0, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">JACKS OR BETTER</div>
        <div className="text-xs text-slate-400">Pairs of J+ pay | Double up option</div>
      </div>
      <div className="flex gap-2 justify-center">{hand.map((c,i)=><div key={i} onClick={()=>phase==="draw"&&setHeld(h=>{const n=new Set(h);n.has(i)?n.delete(i):n.add(i);return n;})} className={`cursor-pointer transition-all ${held.has(i)?"-translate-y-2 ring-2 ring-amber-400 rounded-xl":""}`}><PC card={c} /></div>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {phase==="deal" ? <button onClick={deal} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : <button onClick={drawCards} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DRAW</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

/* ═══════════ BATCH 3: BINGO HALL, LOTTERY SUITE, SPORTSBOOK, MYSTERY ═══════════ */

function Bingo75Game() {
  const [bet, setBet] = useState(50);
  const [card, setCard] = useState<number[][]>([]);
  const [called, setCalled] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const generateCard = () => {
    const c: number[][] = [];
    for(let col=0;col<5;col++) {
      const nums: number[] = [];
      const min=col*15+1, max=min+14;
      while(nums.length<5) {
        const n=Math.floor(Math.random()*(max-min))+min;
        if(!nums.includes(n)) nums.push(n);
      }
      c.push(nums);
    }
    setCard(c); setCalled([]); setResult(null);
  };

  const callNumber = () => {
    if(called.length>=75) return;
    let n: number;
    do { n=Math.floor(Math.random()*75)+1; } while(called.includes(n));
    const newCalled = [...called,n];
    setCalled(newCalled);
    // Check rows/columns
    const won = newCalled.length>=20; // simplified
    if(won) setResult({won:true, amt:bet*10, text:"BINGO! Full card"});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-blue-400">75-BALL BINGO</div>
        <div className="text-xs text-slate-400">Called: {called.length}/75</div>
      </div>
      <div className="mafia-card p-3 rounded-xl">
        <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
          {["B","I","N","G","O"].map(h=><div key={h} className="font-bold text-amber-400">{h}</div>)}
          {card.map((col,colIdx)=>col.map((n,rowIdx)=><div key={`${colIdx}-${rowIdx}`} className={`p-1 rounded ${called.includes(n)?"bg-blue-600 text-white font-bold":"bg-slate-800 text-slate-400"}`}>{n}</div>))}
        </div>
      </div>
      <div className="flex gap-1 flex-wrap max-h-16 overflow-hidden">{called.slice(-15).map((n,i)=><span key={i} className="text-[9px] px-1 bg-blue-900/40 text-blue-300 rounded">{n}</span>)}</div>
      {!card.length ? <button onClick={generateCard} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">BUY CARD</button>
      : <button onClick={callNumber} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">CALL NUMBER</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function Bingo90Game() {
  const [bet, setBet] = useState(50);
  const [card, setCard] = useState<number[][]>([]);
  const [called, setCalled] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);

  const generateCard = () => {
    const c: number[][] = [];
    for(let row=0;row<3;row++) {
      const nums: number[] = [];
      while(nums.length<9) {
        const n=Math.floor(Math.random()*90)+1;
        if(!nums.includes(n)) nums.push(n);
      }
      nums.sort((a,b)=>a-b);
      c.push(nums);
    }
    setCard(c); setCalled([]); setResult(null);
  };

  const callNumber = () => {
    let n: number;
    do { n=Math.floor(Math.random()*90)+1; } while(called.includes(n));
    const newCalled = [...called,n];
    setCalled(newCalled);
    if(newCalled.length>=30) setResult({won:true, amt:bet*8});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-green-400">90-BALL BINGO</div>
        <div className="text-xs text-slate-400">Called: {called.length}/90 | UK Style</div>
      </div>
      <div className="mafia-card p-3 rounded-xl">
        <div className="grid grid-cols-9 gap-1 text-center text-[10px]">
          {card.map((row,ri)=>row.map((n,ci)=><div key={`${ri}-${ci}`} className={`p-1 rounded ${called.includes(n)?"bg-green-600 text-white font-bold":"bg-slate-800 text-slate-400"}`}>{n}</div>))}
        </div>
      </div>
      {!card.length ? <button onClick={generateCard} className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">BUY CARD</button>
      : <button onClick={callNumber} className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">CALL NUMBER</button>}
      {result && <WB won={result.won} amount={result.amt} text="BINGO!" />}
    </div>
  );
}

function SpeedBingoGame() {
  const [bet, setBet] = useState(30);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [pick, setPick] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);

  const start = () => {
    const drawn: number[] = [];
    const pool = Array.from({length:30},(_,i)=>i+1);
    while(drawn.length<15) {
      const idx=Math.floor(Math.random()*pool.length);
      drawn.push(pool.splice(idx,1)[0]);
    }
    setNumbers(drawn); setPick([]); setResult(null);
  };

  const toggle = (n:number) => {
    setPick(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);
  };

  const check = () => {
    const matches = pick.filter(n=>numbers.includes(n)).length;
    const won = matches>=5;
    setResult({won, amt:won?bet*matches*2:0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-pink-400">SPEED BINGO</div>
        <div className="text-xs text-slate-400">Pick numbers, match for cash</div>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {Array.from({length:30},(_,i)=>i+1).map(n=><button key={n} onClick={()=>toggle(n)} className={`p-1.5 rounded text-xs font-bold transition-all ${pick.includes(n)?numbers.includes(n)?"bg-green-600 text-white":"bg-red-600 text-white":"bg-slate-800 text-slate-400"}`}>{n}</button>)}
      </div>
      <div className="flex gap-1 flex-wrap">{numbers.map((n,i)=><span key={i} className="text-[9px] px-1 bg-pink-900/40 text-pink-300 rounded">{n}</span>)}</div>
      <BI value={bet} onChange={setBet} presets={[10,30,50,100]} />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={start} className="py-2 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-black rounded-xl text-sm">NEW ROUND</button>
        <button onClick={check} className="py-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl text-sm">CHECK</button>
      </div>
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

function PatternBingoGame() {
  const [bet, setBet] = useState(50);
  const [pattern, setPattern] = useState("line");
  const [card, setCard] = useState<number[][]>([]);
  const [called, setCalled] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);

  const patterns = ["line","cross","diamond","full","corners"];

  const generateCard = () => {
    const c: number[][] = [];
    for(let col=0;col<5;col++) {
      const nums: number[] = [];
      const min=col*15+1;
      while(nums.length<5) { const n=Math.floor(Math.random()*15)+min; if(!nums.includes(n))nums.push(n); }
      c.push(nums);
    }
    setCard(c); setCalled([]); setResult(null);
  };

  const callNumber = () => {
    let n: number;
    do { n=Math.floor(Math.random()*75)+1; } while(called.includes(n));
    setCalled([...called,n]);
    if(called.length>=25) setResult({won:true, amt:bet*(pattern==="full"?20:10)});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-violet-400">PATTERN BINGO</div>
        <div className="text-xs text-slate-400">Complete the pattern for bonus!</div>
      </div>
      <div className="flex gap-1 justify-center flex-wrap">{patterns.map(p=><button key={p} onClick={()=>setPattern(p)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pattern===p?"bg-violet-600 text-white":"bg-slate-800 text-slate-400"}`}>{p}</button>)}</div>
      <div className="mafia-card p-3 rounded-xl">
        <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
          {["B","I","N","G","O"].map(h=><div key={h} className="font-bold text-violet-400">{h}</div>)}
          {card.map((col,ci)=>col.map((n,ri)=><div key={`${ci}-${ri}`} className={`p-1 rounded ${called.includes(n)?"bg-violet-600 text-white":"bg-slate-800 text-slate-400"}`}>{n}</div>))}
        </div>
      </div>
      {!card.length ? <button onClick={generateCard} className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-800 text-white font-black rounded-xl text-sm">BUY CARD</button>
      : <button onClick={callNumber} className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-800 text-white font-black rounded-xl text-sm">CALL</button>}
      {result && <WB won={result.won} amount={result.amt} />}
    </div>
  );
}

/* ═══════════ LOTTERY SUITE ═══════════ */

function MegaMillionsGame() {
  const [bet, setBet] = useState(2);
  const [whitePicks, setWhitePicks] = useState<number[]>([]);
  const [megaball, setMegaball] = useState(0);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const [drawn, setDrawn] = useState<{white:number[];mega:number}|null>(null);

  const toggleWhite = (n:number) => {
    if(whitePicks.includes(n)) setWhitePicks(whitePicks.filter(x=>x!==n));
    else if(whitePicks.length<5) setWhitePicks([...whitePicks,n]);
  };

  const draw = () => {
    const white: number[] = [];
    while(white.length<5) { const n=Math.floor(Math.random()*70)+1; if(!white.includes(n)) white.push(n); }
    white.sort((a,b)=>a-b);
    const mega = Math.floor(Math.random()*25)+1;
    setDrawn({white,mega});
    const matches = whitePicks.filter(n=>white.includes(n)).length;
    const megaMatch = megaball===mega;
    let text="", amt=0;
    if(matches===5&&megaMatch) { text="JACKPOT! 5+Mega!"; amt=1000000; }
    else if(matches===5) { text="5 white balls!"; amt=1000000; }
    else if(matches===4&&megaMatch) { text="4+Mega!"; amt=10000; }
    else if(matches===4) { text="4 white"; amt=500; }
    else if(matches===3&&megaMatch) { text="3+Mega"; amt=200; }
    else if(megaMatch) { text="Mega Match"; amt=2; }
    else { text="No match"; }
    setResult({won:matches>=3||megaMatch, amt, text});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-purple-400">MEGA MILLIONS</div>
        <div className="text-xs text-slate-400">Pick 5 white (1-70) + 1 Mega (1-25) | $2 per play</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 mb-1">WHITE BALLS ({whitePicks.length}/5)</div>
        <div className="flex flex-wrap gap-1">{Array.from({length:20},(_,i)=>i+1).map(n=><button key={n} onClick={()=>toggleWhite(n)} className={`w-8 h-8 rounded-full text-xs font-bold ${whitePicks.includes(n)?"bg-white text-black ring-2 ring-purple-400":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 mb-1">MEGA BALL</div>
        <div className="flex flex-wrap gap-1">{Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} onClick={()=>setMegaball(n)} className={`w-8 h-8 rounded-full text-xs font-bold ${megaball===n?"bg-red-600 text-white ring-2 ring-red-400":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      </div>
      {drawn && <div className="mafia-card p-2 rounded-xl"><div className="text-[10px] text-slate-400">DRAWN:</div><div className="flex gap-1">{drawn.white.map(n=><span key={n} className="w-6 h-6 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">{n}</span>)}<span className="w-6 h-6 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{drawn.mega}</span></div></div>}
      <BI value={bet} onChange={setBet} presets={[2,4,10,20]} min={2} />
      <button onClick={draw} disabled={whitePicks.length<5||megaball===0} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">DRAW</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function Daily3Game() {
  const [bet, setBet] = useState(1);
  const [picks, setPicks] = useState<string[]>(["","",""]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const setDigit = (idx:number, d:number) => {
    const np = [...picks]; np[idx]=String(d); setPicks(np);
  };

  const play = () => {
    const draw = Array.from({length:3},()=>String(Math.floor(Math.random()*10)));
    const exact = picks.every((p,i)=>p===draw[i]);
    const box = picks.every(p=>draw.includes(p));
    setResult({won:exact||box, amt:exact?bet*500:box?bet*80:0, text:`Draw: ${draw.join("")}`});
  };

  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-cyan-400 text-center">DAILY 3</div>
      <div className="text-xs text-slate-400 text-center">Pick 3 digits | Exact = 500x | Box = 80x</div>
      <div className="flex gap-4 justify-center">{[0,1,2].map(idx=><div key={idx} className="flex flex-col gap-1">{Array.from({length:10},(_,i)=>i).map(d=><button key={d} onClick={()=>setDigit(idx,d)} className={`w-8 h-8 rounded-lg text-xs font-bold ${picks[idx]===String(d)?"bg-cyan-600 text-white":"bg-slate-800 text-slate-400"}`}>{d}</button>)}</div>)}</div>
      <BI value={bet} onChange={setBet} presets={[1,2,5,10]} min={1} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">PLAY</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function SuperEnalottoGame() {
  const [bet, setBet] = useState(1);
  const [picks, setPicks] = useState<number[]>([]);
  const [jolly, setJolly] = useState(0);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const toggle = (n:number) => {
    if(picks.includes(n)) setPicks(picks.filter(x=>x!==n));
    else if(picks.length<6) setPicks([...picks,n]);
  };

  const draw = () => {
    const winning: number[] = [];
    while(winning.length<6) { const n=Math.floor(Math.random()*90)+1; if(!winning.includes(n)) winning.push(n); }
    const matches = picks.filter(n=>winning.includes(n)).length;
    const jMatch = winning.includes(jolly);
    let text="", amt=0;
    if(matches===6) { text="JACKPOT!"; amt=1000000; }
    else if(matches===5&&jMatch) { text="5+Jolly!"; amt=500000; }
    else if(matches===5) { text="5 balls!"; amt=50000; }
    else if(matches===4) { text="4 balls"; amt=500; }
    else if(matches===3) { text="3 balls"; amt=10; }
    setResult({won:matches>=3, amt, text:`Draw: ${winning.sort((a,b)=>a-b).join(",")}`});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-400">SUPERENALOTTO</div>
        <div className="text-xs text-slate-400">Pick 6 from 1-90 | Italian style</div>
      </div>
      <div className="flex flex-wrap gap-1">{Array.from({length:30},(_,i)=>i+1).map(n=><button key={n} onClick={()=>toggle(n)} className={`w-8 h-8 rounded-lg text-xs font-bold ${picks.includes(n)?"bg-yellow-500 text-black":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      <div className="text-[10px] text-slate-400">Jolly (1 extra):</div>
      <div className="flex gap-1">{Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} onClick={()=>setJolly(n)} className={`w-7 h-7 rounded text-[10px] font-bold ${jolly===n?"bg-amber-500 text-black":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[1,2,5]} min={1} />
      <button onClick={draw} disabled={picks.length<6} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">DRAW</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function ElGordoGame() {
  const [bet, setBet] = useState(1);
  const [picks, setPicks] = useState<number[]>([]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const toggle = (n:number) => {
    if(picks.includes(n)) setPicks(picks.filter(x=>x!==n));
    else if(picks.length<5) setPicks([...picks,n]);
  };

  const draw = () => {
    const winning: number[] = [];
    while(winning.length<5) { const n=Math.floor(Math.random()*54)+1; if(!winning.includes(n)) winning.push(n); }
    const matches = picks.filter(n=>winning.includes(n)).length;
    setResult({won:matches>=3, amt:matches>=5?bet*100000:matches===4?bet*1000:matches===3?bet*50:0, text:`${matches} matches | Draw: ${winning.sort((a,b)=>a-b).join(",")}`});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">EL GORDO</div>
        <div className="text-xs text-slate-400">Spanish Christmas Lottery | Pick 5 from 54</div>
      </div>
      <div className="flex flex-wrap gap-1">{Array.from({length:20},(_,i)=>i+1).map(n=><button key={n} onClick={()=>toggle(n)} className={`w-8 h-8 rounded-lg text-xs font-bold ${picks.includes(n)?"bg-red-500 text-white":"bg-slate-800 text-slate-400"}`}>{n}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[1,5,10]} min={1} />
      <button onClick={draw} disabled={picks.length<5} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">DRAW</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

/* ═══════════ SPORTSBOOK ═══════════ */

function FootballParlayGame() {
  const [bet, setBet] = useState(50);
  const [picks, setPicks] = useState<("home"|"away")[]>([]);
  const teams = ["Eagles vs Cowboys","Chiefs vs Bills","Packers vs Bears","Rams vs 49ers","Raiders vs Chargers","Dolphins vs Patriots"];

  const toggle = (idx:number) => {
    setPicks(p=>{const np=[...p];np[idx]=np[idx]?undefined as any:"home";return np;});
  };

  const submit = () => {
    const wins = picks.filter(Boolean).map(()=>Math.random()>0.5);
    const allWin = wins.every(Boolean);
    const multi = Math.pow(2, picks.filter(Boolean).length);
    setResult({won:allWin, amt:allWin?bet*multi:0, text:`${wins.filter(Boolean).length}/${picks.filter(Boolean).length} legs hit`});
  };

  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-green-400">FOOTBALL PARLAY</div>
        <div className="text-xs text-slate-400">Pick multiple games | All must win | 2x per leg</div>
      </div>
      {teams.map((t,i)=><div key={i} className="flex items-center gap-2">
        <button onClick={()=>toggle(i)} className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${picks[i]==="home"?"bg-green-600 text-white":"bg-slate-800 text-slate-400"}`}>{t.split(" vs ")[0]}</button>
        <span className="text-slate-600 text-xs">vs</span>
        <button onClick={()=>{const np=[...picks];np[i]=np[i]?"away"as any:undefined as any;setPicks(np);}} className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${picks[i]==="away"?"bg-blue-600 text-white":"bg-slate-800 text-slate-400"}`}>{t.split(" vs ")[1]}</button>
      </div>)}
      <BI value={bet} onChange={setBet} presets={[25,50,100]} />
      <button onClick={submit} disabled={!picks.some(Boolean)} className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">PLACE PARLAY</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function OverUnderGame() {
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<"over"|"under">("over");
  const [line] = useState(210.5 + Math.random()*20);
  const [score, setScore] = useState(0);

  const play = () => {
    const s = Math.floor(line - 20 + Math.random()*40);
    setScore(s);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-blue-400">OVER / UNDER</div>
        <div className="text-xs text-slate-400">Line: {line.toFixed(1)} total points</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={()=>setPick("over")} className={`p-4 rounded-xl font-black text-lg transition-all ${pick==="over"?"bg-green-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>OVER {line.toFixed(1)}</button>
        <button onClick={()=>setPick("under")} className={`p-4 rounded-xl font-black text-lg transition-all ${pick==="under"?"bg-red-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400"}`}>UNDER {line.toFixed(1)}</button>
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">SIMULATE</button>
      {score>0 && <div className="text-center"><div className={`text-lg font-bold ${((pick==="over"&&score>line)||(pick==="under"&&score<line))?"text-green-400":"text-red-400"}`}>Final: {score.toFixed(1)} | {((pick==="over"&&score>line)||(pick==="under"&&score<line))?"WIN!":"LOSS"}</div></div>}
    </div>
  );
}

function LiveInPlayGame() {
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"home"|"draw"|"away">("home");
  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [odds, setOdds] = useState({home:2.1,draw:3.4,away:3.2});

  const simulate = () => {
    const m = minute + Math.floor(Math.random()*15)+1;
    if(m>90) { setMinute(90); return; }
    setMinute(m);
    const goalChance = Math.random();
    if(goalChance<0.08) {
      const isHome = Math.random()>0.45;
      if(isHome) setHomeScore(s=>s+1); else setAwayScore(s=>s+1);
    }
    // Update odds based on score
    if(homeScore>awayScore) setOdds({home:1.5,draw:4.0,away:5.0});
    else if(awayScore>homeScore) setOdds({home:5.0,draw:4.0,away:1.5});
  };

  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const finish = () => {
    const won = (pick==="home"&&homeScore>awayScore)||(pick==="away"&&awayScore>homeScore)||(pick==="draw"&&homeScore===awayScore);
    setResult({won, amt:won?bet*odds[pick]:0, text:`${homeScore}-${awayScore}`});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">LIVE IN-PLAY</div>
        <div className="text-xs text-slate-400">Minute: {minute}' | Odds shift as the match plays</div>
      </div>
      <div className="mafia-card p-4 rounded-xl grid grid-cols-3 gap-4 text-center">
        <div><div className="text-sm text-slate-300 font-bold">Home</div><div className="text-3xl font-black text-green-400">{homeScore}</div><div className="text-[10px] text-green-400">@{odds.home.toFixed(1)}</div></div>
        <div><div className="text-sm text-slate-300 font-bold">Draw</div><div className="text-3xl font-black text-yellow-400">-</div><div className="text-[10px] text-yellow-400">@{odds.draw.toFixed(1)}</div></div>
        <div><div className="text-sm text-slate-300 font-bold">Away</div><div className="text-3xl font-black text-blue-400">{awayScore}</div><div className="text-[10px] text-blue-400">@{odds.away.toFixed(1)}</div></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={()=>setPick("home")} className={`p-3 rounded-xl text-sm font-black ${pick==="home"?"bg-green-600 text-white":"bg-slate-800 text-slate-400"}`}>HOME</button>
        <button onClick={()=>setPick("draw")} className={`p-3 rounded-xl text-sm font-black ${pick==="draw"?"bg-yellow-600 text-white":"bg-slate-800 text-slate-400"}`}>DRAW</button>
        <button onClick={()=>setPick("away")} className={`p-3 rounded-xl text-sm font-black ${pick==="away"?"bg-blue-600 text-white":"bg-slate-800 text-slate-400"}`}>AWAY</button>
      </div>
      <BI value={bet} onChange={setBet} presets={[25,50,100]} />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={simulate} disabled={minute>=90} className="py-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl text-sm disabled:opacity-50">NEXT MINUTE</button>
        <button onClick={finish} className="py-2 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl text-sm">CASH OUT</button>
      </div>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function HorseExactaGame() {
  const [bet, setBet] = useState(50);
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(1);
  const [result, setResult] = useState<{won:boolean;amt:number}|null>(null);
  const horses = ["Thunder","Lightning","Storm","Blaze","Shadow","Ace","Ghost","Phoenix"];

  const race = () => {
    const positions = Array.from({length:8},(_,i)=>i).sort(()=>Math.random()-0.5);
    setResult({won:positions[0]===first&&positions[1]===second, amt:positions[0]===first&&positions[1]===second?bet*20:0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">HORSE EXACTA</div>
        <div className="text-xs text-slate-400">Pick 1st and 2nd in exact order | 20:1 payout</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><div className="text-[10px] text-slate-400 mb-1">1ST PLACE</div>
          <div className="flex flex-col gap-1">{horses.map((h,i)=><button key={i} onClick={()=>setFirst(i)} className={`p-1.5 rounded-lg text-xs font-bold ${first===i?"bg-amber-600 text-black":"bg-slate-800 text-slate-400"}`}>{h}</button>)}</div>
        </div>
        <div><div className="text-[10px] text-slate-400 mb-1">2ND PLACE</div>
          <div className="flex flex-col gap-1">{horses.map((h,i)=><button key={i} onClick={()=>setSecond(i)} className={`p-1.5 rounded-lg text-xs font-bold ${second===i?"bg-amber-600 text-black":"bg-slate-800 text-slate-400"}`}>{h}</button>)}</div>
        </div>
      </div>
      <BI value={bet} onChange={setBet} presets={[25,50,100]} />
      <button onClick={race} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">RUN RACE</button>
      {result && <WB won={result.won} amount={result.amt} text={result.won?`${horses[first]} then ${horses[second]}!`:"Wrong order"} />}
    </div>
  );
}

/* ═══════════ MYSTERY GAMES ═══════════ */

function MysteryBoxGame() {
  const [bet, setBet] = useState(100);
  const [boxes, setBoxes] = useState<number[]>([]);
  const [picked, setPicked] = useState(-1);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const play = () => {
    const prizes = [0,0,0,bet*0.5,bet,bet*2,bet*5,bet*10,bet*25];
    const shuffled = prizes.sort(()=>Math.random()-0.5);
    setBoxes(shuffled); setPicked(-1); setResult(null);
  };

  const openBox = (idx:number) => {
    if(picked>=0) return;
    setPicked(idx);
    const prize = boxes[idx];
    setResult({won:prize>0, amt:prize, text:prize===0?"EMPTY BOX!":`Won $${prize.toLocaleString()}!`});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-400">MYSTERY BOX</div>
        <div className="text-xs text-slate-400">3 empty | 6 prizes up to 25x</div>
      </div>
      {boxes.length>0 ? (
        <div className="grid grid-cols-3 gap-2">{boxes.map((p,i)=><button key={i} onClick={()=>openBox(i)} disabled={picked>=0&&picked!==i} className={`h-20 rounded-xl font-black text-lg transition-all ${picked===i?"bg-yellow-500 text-black animate-bounce":picked>=0?"bg-slate-800/30 text-slate-600":"bg-gradient-to-b from-yellow-600 to-yellow-800 text-white hover:scale-105"}`}>{picked===i?(p===0?"$0":`$${p.toLocaleString()}`):"?"}</button>)}</div>
      ) : <div className="text-center text-slate-600">Open the boxes!</div>}
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {picked<0 ? <button onClick={play} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">START</button>
      : <button onClick={play} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">PLAY AGAIN</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function LuckyEnvelopeGame() {
  const [bet, setBet] = useState(100);
  const [envelopes, setEnvelopes] = useState<number[]>([]);
  const [picked, setPicked] = useState(-1);

  const play = () => {
    const prizes = [bet*0.5,bet,bet*2,bet*5,bet*10,bet*20];
    setEnvelopes(prizes.sort(()=>Math.random()-0.5));
    setPicked(-1);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">LUCKY ENVELOPE</div>
        <div className="text-xs text-slate-400">Chinese red envelopes with hidden prizes</div>
      </div>
      <div className="grid grid-cols-3 gap-3">{envelopes.map((p,i)=><button key={i} onClick={()=>picked<0&&setPicked(i)} className={`h-24 rounded-xl flex items-center justify-center text-3xl transition-all ${picked===i?"bg-red-500 animate-bounce":"bg-gradient-to-b from-red-600 to-red-800 hover:scale-105"}`}>{picked===i?"$"+p.toLocaleString():"🧧"}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">{picked<0?"PICK AN ENVELOPE":"PLAY AGAIN"}</button>
      {picked>=0 && <WB won={true} amount={envelopes[picked]} text={`$${envelopes[picked].toLocaleString()}!`} />}
    </div>
  );
}

function TreasureChestGame() {
  const [bet, setBet] = useState(100);
  const [chests, setChests] = useState<{prize:number;open:boolean}[]>([]);
  const [opened, setOpened] = useState(0);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const play = () => {
    const prizes = [bet,bet*2,bet*5,bet*10,bet*50,bet*100];
    setChests(prizes.map(p=>({prize:p,open:false})));
    setOpened(0); setResult(null);
  };

  const openChest = (idx:number) => {
    if(chests[idx].open) return;
    const newChests = [...chests]; newChests[idx]={...newChests[idx],open:true};
    setChests(newChests);
    setOpened(o=>o+1);
    setResult({won:true, amt:newChests[idx].prize, text:`Found $${newChests[idx].prize.toLocaleString()}!`});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">TREASURE CHEST</div>
        <div className="text-xs text-slate-400">6 chests | Open all for max value</div>
      </div>
      <div className="grid grid-cols-3 gap-3">{chests.map((c,i)=><button key={i} onClick={()=>openChest(i)} disabled={c.open} className={`h-24 rounded-xl text-3xl transition-all ${c.open?"bg-amber-900/50 text-amber-400":"bg-gradient-to-b from-amber-700 to-amber-900 hover:scale-105 text-amber-300"}`}>{c.open?`$${c.prize.toLocaleString()}`:"📦"}</button>)}</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={play} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">NEW CHESTS</button>
      {result && <div className="text-center text-sm text-amber-400 font-bold">{result.text} ({opened}/6 opened)</div>}
    </div>
  );
}

function CrystalBallGame() {
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const predictions = [
    {text:"Fortune smiles upon you",multi:5},
    {text:"A great windfall approaches",multi:10},
    {text:"The stars align in your favor",multi:20},
    {text:"Dark clouds gather",multi:0},
    {text:"Luck is not on your side",multi:0},
    {text:"A golden opportunity awaits",multi:15},
    {text:"The crystal sees great wealth",multi:25},
    {text:"Trouble lurks in shadows",multi:0}
  ];

  const gaze = () => {
    const p = predictions[Math.floor(Math.random()*predictions.length)];
    setResult({won:p.multi>0, amt:bet*p.multi, text:p.text+(p.multi>0?` (${p.multi}x)`:"")});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-purple-400">CRYSTAL BALL</div>
        <div className="text-xs text-slate-400">Peer into the future | Up to 25x</div>
      </div>
      <div className={`w-full h-40 rounded-2xl flex items-center justify-center bg-gradient-to-b from-purple-900/50 to-slate-900/50 border border-purple-500/30`}>
        {result ? <div className="text-center px-4"><div className="text-lg font-bold text-purple-300 italic">{result.text}</div></div>
        : <div className="text-6xl animate-pulse">🔮</div>}
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={gaze} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">GAZE INTO THE BALL</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function JackInTheBoxGame() {
  const [bet, setBet] = useState(100);
  const [spins, setSpins] = useState(0);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);
  const [popped, setPopped] = useState(false);

  const spin = () => {
    const s = spins + 1;
    setSpins(s);
    if(Math.random() < 0.15 + (s*0.05)) {
      setPopped(true);
      const multi = Math.min(s, 10);
      setResult({won:true, amt:bet*multi, text:`JACK IN THE BOX! x${multi} after ${s} spins!`});
    }
  };

  const reset = () => { setSpins(0); setPopped(false); setResult(null); };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-pink-400">JACK IN THE BOX</div>
        <div className="text-xs text-slate-400">Spin until it pops | More spins = bigger multiplier</div>
      </div>
      <div className={`w-full h-32 rounded-2xl flex items-center justify-center transition-all ${popped?"bg-pink-500/30 animate-bounce":"bg-slate-900/50"}`}>
        {popped ? <div className="text-6xl">🤡</div> : <div className="text-6xl">📦</div>}
      </div>
      <div className="text-center text-xs text-slate-400">Spins: {spins} | Next: {((0.15+spins*0.05)*100).toFixed(0)}% chance</div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {!popped ? <button onClick={spin} className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">CRANK</button>
      : <button onClick={reset} className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">RESET</button>}
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function LuckySevensGame() {
  const [bet, setBet] = useState(100);
  const [dice, setDice] = useState<[number,number]>([1,1]);
  const [result, setResult] = useState<{won:boolean;amt:number;text:string}|null>(null);

  const roll = () => {
    const d1=Math.floor(Math.random()*6)+1, d2=Math.floor(Math.random()*6)+1;
    const total=d1+d2;
    const sevens = total===7;
    const doubles = d1===d2;
    setDice([d1,d2]);
    if(sevens&&doubles) setResult({won:true,amt:bet*50,text:"LUCKY 777 DOUBLE SEVENS!"});
    else if(sevens) setResult({won:true,amt:bet*5,text:"LUCKY 7!"});
    else if(doubles) setResult({won:true,amt:bet*2,text:"DOUBLES!"});
    else setResult({won:false,amt:0,text:"No lucky roll"});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-green-400">LUCKY 7s</div>
        <div className="text-xs text-slate-400">7 = 5x | Doubles = 2x | Double 7s = 50x!</div>
      </div>
      <div className="mafia-card p-6 rounded-xl flex items-center justify-center gap-6">
        <Die value={dice[0]} /><Die value={dice[1]} />
        <div className={`text-3xl font-black ${dice[0]+dice[1]===7?"text-green-400 animate-pulse":"text-slate-400"}`}>{dice[0]+dice[1]}</div>
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      <button onClick={roll} className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">ROLL</button>
      {result && <WB won={result.won} amount={result.amt} text={result.text} />}
    </div>
  );
}

function GuessTheCardGame() {
  const [bet, setBet] = useState(100);
  const [card, setCard] = useState<Card|null>(null);
  const [pick, setPick] = useState<"red"|"black">("red");
  const [revealed, setRevealed] = useState(false);

  const play = () => {
    const deck = makeDeck(1);
    setCard(deck[Math.floor(Math.random()*52)]);
    setRevealed(false);
  };

  const reveal = () => {
    if(!card) return;
    setRevealed(true);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">GUESS THE CARD</div>
        <div className="text-xs text-slate-400">Red or Black? 2x payout</div>
      </div>
      <div className="flex justify-center">{card && <div onClick={reveal} className="cursor-pointer"><PC card={card} fd={!revealed} /></div>}</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={()=>setPick("red")} className={`p-4 rounded-xl font-black text-lg ${pick==="red"?"bg-red-600 text-white":"bg-slate-800 text-slate-400"}`}>RED</button>
        <button onClick={()=>setPick("black")} className={`p-4 rounded-xl font-black text-lg ${pick==="black"?"bg-slate-600 text-white":"bg-slate-800 text-slate-400"}`}>BLACK</button>
      </div>
      <BI value={bet} onChange={setBet} presets={[50,100,500]} />
      {!card ? <button onClick={play} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">DEAL</button>
      : !revealed ? <button onClick={reveal} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">REVEAL</button>
      : <button onClick={play} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">PLAY AGAIN</button>}
      {revealed && card && <WB won={(pick==="red"&&isRed(card.suit))||(pick==="black"&&!isRed(card.suit))} amount={(pick==="red"&&isRed(card.suit))||(pick==="black"&&!isRed(card.suit))?bet*2:0} />}
    </div>
  );
}

/* ═══════════ BATCH 4: NEW CATEGORY PAGES ═══════════ */

function BaccaratRoomPage() {
  const [tab, setTab] = useState("mini");
  const tabs = [
    {id:"mini",label:"Mini Baccarat",icon:"🃏"},
    {id:"speed",label:"Speed",icon:"⚡"},
    {id:"squeeze",label:"Squeeze",icon:"😱"},
    {id:"nocom",label:"No Commission",icon:"💰"},
    {id:"lightning",label:"Lightning",icon:"⚡"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-amber-400 text-center">BACCARAT ROOM</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-amber-600 text-black shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="mini" && <MiniBaccaratGame />}
      {tab==="speed" && <SpeedBaccaratGame />}
      {tab==="squeeze" && <SqueezeBaccaratGame />}
      {tab==="nocom" && <NoCommissionBaccaratGame />}
      {tab==="lightning" && <LightningBaccaratGame />}
    </div>
  );
}

function RouletteRoyalePage() {
  const [tab, setTab] = useState("american");
  const tabs = [
    {id:"american",label:"American",icon:"🇺🇸"},
    {id:"french",label:"French",icon:"🇫🇷"},
    {id:"double",label:"Double Ball",icon:"🔴"},
    {id:"mini",label:"Mini",icon:"🔵"},
    {id:"multi",label:"Multi-Wheel",icon:"🎡"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-red-400 text-center">ROULETTE ROYALE</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-red-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="american" && <AmericanRouletteGame />}
      {tab==="french" && <FrenchRouletteGame />}
      {tab==="double" && <DoubleBallRouletteGame />}
      {tab==="mini" && <MiniRouletteGame />}
      {tab==="multi" && <MultiWheelRouletteGame />}
    </div>
  );
}

function DicePalacePage() {
  const [tab, setTab] = useState("vegas");
  const tabs = [
    {id:"vegas",label:"Vegas Craps",icon:"🎲"},
    {id:"bank",label:"Bank Craps",icon:"🏦"},
    {id:"simple",label:"Simplified",icon:"📊"},
    {id:"hazard",label:"Hazard",icon:"🏴"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-emerald-400 text-center">DICE PALACE</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-emerald-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="vegas" && <VegasCrapsGame />}
      {tab==="bank" && <BankCrapsGame />}
      {tab==="simple" && <SimplifiedCrapsGame />}
      {tab==="hazard" && <HazardGame />}
    </div>
  );
}

function WheelFortunePage() {
  const [tab, setTab] = useState("dream");
  const tabs = [
    {id:"dream",label:"Dream Catcher",icon:"✨"},
    {id:"money",label:"Money Wheel",icon:"💰"},
    {id:"lucky",label:"Lucky Wheel",icon:"🎡"},
    {id:"mega",label:"Mega Wheel",icon:"🔥"},
    {id:"fortune",label:"Fortune Wheel",icon:"🍀"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-yellow-400 text-center">WHEEL & FORTUNE</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-yellow-600 text-black shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="dream" && <DreamCatcherGame />}
      {tab==="money" && <MoneyWheelGame />}
      {tab==="lucky" && <LuckyWheelGame />}
      {tab==="mega" && <MegaWheelGame />}
      {tab==="fortune" && <FortuneWheelGame />}
    </div>
  );
}

function AsianGamesPage() {
  const [tab, setTab] = useState("fantan");
  const tabs = [
    {id:"fantan",label:"Fan Tan",icon:"🀄"},
    {id:"chuck",label:"Chuck-a-Luck",icon:"🎲"},
    {id:"chinese",label:"Chinese Dice",icon:"🐉"},
    {id:"pachinko",label:"Pachinko",icon:"⚪"},
    {id:"mahjong",label:"Mahjong Tiles",icon:"🀄"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-red-400 text-center">ASIAN GAMES</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-red-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="fantan" && <FanTanGame />}
      {tab==="chuck" && <ChuckALuckGame />}
      {tab==="chinese" && <ChineseDiceGame />}
      {tab==="pachinko" && <PachinkoGame />}
      {tab==="mahjong" && <MahjongTilesGame />}
    </div>
  );
}

function VideoPokerLoungePage() {
  const [tab, setTab] = useState("deuces");
  const tabs = [
    {id:"deuces",label:"Deuces Wild",icon:"🃏"},
    {id:"joker",label:"Joker Poker",icon:"🃏"},
    {id:"aces",label:"Aces & Eights",icon:"♠"},
    {id:"bonus",label:"Double Bonus",icon:"💎"},
    {id:"american",label:"All American",icon:"🇺🇸"},
    {id:"jacks",label:"Jacks or Better",icon:"🂡"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-purple-400 text-center">VIDEO POKER LOUNGE</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-purple-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="deuces" && <DeucesWildGame />}
      {tab==="joker" && <JokerPokerGame />}
      {tab==="aces" && <AcesAndEightsGame />}
      {tab==="bonus" && <DoubleBonusGame />}
      {tab==="american" && <AllAmericanGame />}
      {tab==="jacks" && <JacksOrBetterGame />}
    </div>
  );
}

function BingoHallPage() {
  const [tab, setTab] = useState("b75");
  const tabs = [
    {id:"b75",label:"75-Ball",icon:"🔵"},
    {id:"b90",label:"90-Ball",icon:"🟢"},
    {id:"speed",label:"Speed Bingo",icon:"⚡"},
    {id:"pattern",label:"Pattern",icon:"🔷"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-blue-400 text-center">BINGO HALL</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-blue-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="b75" && <Bingo75Game />}
      {tab==="b90" && <Bingo90Game />}
      {tab==="speed" && <SpeedBingoGame />}
      {tab==="pattern" && <PatternBingoGame />}
    </div>
  );
}

function LotterySuitePage() {
  const [tab, setTab] = useState("mega");
  const tabs = [
    {id:"mega",label:"Mega Millions",icon:"🎰"},
    {id:"daily3",label:"Daily 3",icon:"🔢"},
    {id:"super",label:"SuperEnalotto",icon:"🇮🇹"},
    {id:"gordo",label:"El Gordo",icon:"🇪🇸"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-purple-400 text-center">LOTTERY SUITE</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-purple-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="mega" && <MegaMillionsGame />}
      {tab==="daily3" && <Daily3Game />}
      {tab==="super" && <SuperEnalottoGame />}
      {tab==="gordo" && <ElGordoGame />}
    </div>
  );
}

function SportsbookPage() {
  const [tab, setTab] = useState("parlay");
  const tabs = [
    {id:"parlay",label:"Football Parlay",icon:"🏈"},
    {id:"ou",label:"Over/Under",icon:"📊"},
    {id:"live",label:"Live In-Play",icon:"🔴"},
    {id:"exacta",label:"Horse Exacta",icon:"🏇"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-green-400 text-center">SPORTSBOOK</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-green-600 text-white shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="parlay" && <FootballParlayGame />}
      {tab==="ou" && <OverUnderGame />}
      {tab==="live" && <LiveInPlayGame />}
      {tab==="exacta" && <HorseExactaGame />}
    </div>
  );
}

function MysteryGamesPage() {
  const [tab, setTab] = useState("mystery");
  const tabs = [
    {id:"mystery",label:"Mystery Box",icon:"📦"},
    {id:"envelope",label:"Lucky Envelope",icon:"🧧"},
    {id:"treasure",label:"Treasure Chest",icon:"💰"},
    {id:"crystal",label:"Crystal Ball",icon:"🔮"},
    {id:"jack",label:"Jack in the Box",icon:"🤡"},
    {id:"sevens",label:"Lucky 7s",icon:"🍀"},
    {id:"guess",label:"Guess the Card",icon:"🃏"},
  ];
  return (
    <div className="space-y-4">
      <div className="text-2xl font-black text-amber-400 text-center">MYSTERY GAMES</div>
      <div className="flex gap-1 overflow-x-auto pb-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${tab===t.id?"bg-amber-600 text-black shadow-lg":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>{t.icon} {t.label}</button>)}</div>
      {tab==="mystery" && <MysteryBoxGame />}
      {tab==="envelope" && <LuckyEnvelopeGame />}
      {tab==="treasure" && <TreasureChestGame />}
      {tab==="crystal" && <CrystalBallGame />}
      {tab==="jack" && <JackInTheBoxGame />}
      {tab==="sevens" && <LuckySevensGame />}
      {tab==="guess" && <GuessTheCardGame />}
    </div>
  );
}

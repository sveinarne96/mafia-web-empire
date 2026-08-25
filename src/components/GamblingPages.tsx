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
    ["casino","Casino"],["tables","Tables"],["slots","Slots"],["sports","Sports"],
    ["numbers","Numbers"],["dice","Dice"],["street","Street"],["mafia","Mafia"]
  ];
  const pages: Record<string, React.ReactNode> = {
    casino: <CasinoPage />, tables: <TablePage />, slots: <SlotsPage />,
    sports: <SportsPage />, numbers: <NumbersPage />, dice: <DicePage />,
    street: <StreetPage />, mafia: <MafiaPage />
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

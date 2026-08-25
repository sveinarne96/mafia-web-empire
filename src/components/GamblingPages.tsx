import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, ChevronLeft, Coins, Trophy,
  Swords, Target, Shield, Zap, Flame, Sparkles
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function makeDeck() {
  const d: { suit: string; rank: string; value: number }[] = [];
  for (const s of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      const v = i >= 9 ? 10 : i === 0 ? 11 : i + 1;
      d.push({ suit: s, rank: RANKS[i], value: v });
    }
  }
  return d.sort(() => Math.random() - 0.5);
}

function cardDisplay(c: { suit: string; rank: string }) {
  const red = c.suit === "♥" || c.suit === "♦";
  return (
    <span className={`inline-flex flex-col items-center justify-center w-12 h-16 rounded-lg border text-xs font-bold ${red ? "bg-red-900/40 border-red-500/40 text-red-300" : "bg-slate-800/60 border-slate-500/30 text-slate-200"}`}>
      <span className="text-[10px]">{c.rank}</span>
      <span className="text-sm">{c.suit}</span>
    </span>
  );
}

function betInput(val: number, set: (n: number) => void, min = 100, max = 1000000) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Bet:</span>
      <input type="number" value={val} onChange={e => set(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-28 bg-black/40 border border-border/60 rounded-lg px-2 py-1.5 text-xs text-foreground" min={min} max={max} />
      <div className="flex gap-1">
        {[min, min * 10, min * 100].map(v => (
          <button key={v} onClick={() => set(Math.min(max, v))} className="px-1.5 py-0.5 text-[10px] rounded bg-amber-900/30 text-amber-400 border border-amber-700/30 hover:bg-amber-800/30">${v >= 1000000 ? (v / 1000000) + "M" : v >= 1000 ? (v / 1000) + "K" : v}</button>
        ))}
      </div>
    </div>
  );
}

function ResultBanner({ won, amount }: { won: boolean; amount: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-3 text-center text-sm font-bold ${won ? "bg-green-900/30 border border-green-500/40 text-green-400" : "bg-red-900/30 border border-red-500/40 text-red-400"}`}>
      {won ? `🎉 You won $${amount.toLocaleString()}!` : `💀 You lost $${amount.toLocaleString()}`}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. CASINO PAGE — Blackjack, Texas Hold'em, 7-Card Stud, Baccarat
// ═══════════════════════════════════════════════════════════════

function BlackjackGame() {
  const [deck, setDeck] = useState(makeDeck);
  const [player, setPlayer] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [dealer, setDealer] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [bet, setBet] = useState(500);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [stand, setStand] = useState(false);
  const [dDown, setDDown] = useState(false);
  const mutate = useMutation(api.game.commitCategoryCrime);

  const sum = (cards: typeof player) => {
    let s = cards.reduce((a, c) => a + c.value, 0);
    let aces = cards.filter(c => c.rank === "A").length;
    while (s > 21 && aces > 0) { s -= 10; aces--; }
    return s;
  };

  const deal = async () => {
    const d = [...deck];
    const p = [d.pop()!, d.pop()!];
    const dl = [d.pop()!, d.pop()!];
    setDeck(d);
    setPlayer(p);
    setDealer(dl);
    setResult(null);
    setPlaying(true);
    setStand(false);
    setDDown(false);
  };

  const hit = () => {
    const d = [...deck];
    const c = d.pop()!;
    setDeck(d);
    setPlayer(prev => [...prev, c]);
    if (sum([...player, c]) > 21) {
      setPlaying(false);
      setStand(true);
      setResult({ won: false, amount: bet });
    }
  };

  const doStand = () => {
    setStand(true);
    setPlaying(false);
    let dl = [...dealer];
    const d = [...deck];
    while (sum(dl) < 17 && d.length > 0) { dl.push(d.pop()!); }
    setDeck(d);
    setDealer(dl);
    const ps = sum(player), ds = sum(dl);
    const won = ds > 21 || (ps <= 21 && ps > ds);
    setResult({ won, amount: won ? Math.floor(bet * 1.5) : bet });
  };

  const doubleDown = () => {
    const d = [...deck];
    const c = d.pop()!;
    setDeck(d);
    const newP = [...player, c];
    setPlayer(newP);
    setDDown(true);
    setStand(true);
    setPlaying(false);
    let dl = [...dealer];
    while (sum(dl) < 17 && d.length > 0) { dl.push(d.pop()!); }
    setDealer(dl);
    const ps = sum(newP), ds = sum(dl);
    const won = ds > 21 || (ps <= 21 && ps > ds);
    setResult({ won, amount: won ? bet * 2 : bet * 2 });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {dealer.length > 0 && (
        <div className="mafia-card rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-muted-foreground mb-2">DEALER {stand ? `(${sum(dealer)})` : "(?)"}</div>
          <div className="flex gap-2 flex-wrap">
            {dealer.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                {i === 1 && !stand ? <span className="inline-flex items-center justify-center w-12 h-16 rounded-lg border bg-slate-700/60 border-slate-500/30 text-lg">🂠</span> : cardDisplay(c)}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {player.length > 0 && (
        <div className="mafia-card rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-amber-400 mb-2">YOUR HAND ({sum(player)})</div>
          <div className="flex gap-2 flex-wrap">
            {player.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>{cardDisplay(c)}</motion.div>
            ))}
          </div>
        </div>
      )}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2 flex-wrap">
        {!playing && !result && <button onClick={deal} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-all">Deal</button>}
        {playing && <>
          <button onClick={hit} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all">Hit</button>
          <button onClick={doStand} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-all">Stand</button>
          {!dDown && player.length === 2 && <button onClick={doubleDown} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all">Double Down</button>}
        </>}
        {result && <button onClick={() => { setResult(null); setPlaying(false); setStand(false); setPlayer([]); setDealer([]); }} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function PokerTexasGame() {
  const [pot, setPot] = useState(0);
  const [bet, setBet] = useState(500);
  const [phase, setPhase] = useState<"pre" | "flop" | "turn" | "river" | "done">("pre");
  const [community, setCommunity] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const deal = () => {
    const d = makeDeck();
    setHand([d.pop()!, d.pop()!]);
    setCommunity([]);
    setPot(bet * 2);
    setPhase("flop");
    setResult(null);
    setTimeout(() => {
      setCommunity([d.pop()!, d.pop()!, d.pop()!]);
    }, 500);
  };

  const advance = () => {
    if (phase === "flop") { setPhase("turn"); setCommunity(prev => [...prev, makeDeck().pop()!]); }
    else if (phase === "turn") { setPhase("river"); setCommunity(prev => [...prev, makeDeck().pop()!]); }
    else if (phase === "river") {
      setPhase("done");
      const won = Math.random() > 0.45;
      setResult({ won, amount: pot });
      setPot(0);
    }
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {community.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-bold text-muted-foreground mb-2">COMMUNITY ({phase.toUpperCase()})</div>
          <div className="flex gap-2 flex-wrap">{community.map((c, i) => <motion.div key={i} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }}>{cardDisplay(c)}</motion.div>)}</div>
        </div>
      )}
      {hand.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-bold text-amber-400 mb-2">YOUR HAND</div>
          <div className="flex gap-2">{hand.map((c, i) => <div key={i}>{cardDisplay(c)}</div>)}</div>
        </div>
      )}
      {pot > 0 && <div className="text-center text-amber-400 font-bold">Pot: ${pot.toLocaleString()}</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2 flex-wrap">
        {phase === "pre" && <button onClick={deal} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">Deal</button>}
        {phase !== "pre" && phase !== "done" && <button onClick={advance} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold">{phase === "river" ? "Showdown" : "Next Card"}</button>}
        {result && <button onClick={() => { setPhase("pre"); setHand([]); setCommunity([]); setResult(null); }} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function PokerStudGame() {
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [bet, setBet] = useState(500);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const deal = () => {
    const d = makeDeck();
    setHand(Array.from({ length: 7 }, () => d.pop()!));
    const won = Math.random() > 0.45;
    setResult({ won, amount: bet * 2 });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {hand.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-bold text-amber-400 mb-2">7-CARD STUD HAND</div>
          <div className="flex gap-2 flex-wrap">{hand.map((c, i) => <motion.div key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>{cardDisplay(c)}</motion.div>)}</div>
        </div>
      )}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        {!result && <button onClick={deal} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">Deal 7 Cards</button>}
        {result && <button onClick={() => { setHand([]); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function BaccaratGame() {
  const [bet, setBet] = useState(500);
  const [betType, setBetType] = useState<"player" | "banker" | "tie">("player");
  const [playerCards, setPlayerCards] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [bankerCards, setBankerCards] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const handValue = (cards: typeof playerCards) => cards.reduce((a, c) => a + (c.value > 9 ? 0 : c.value), 0) % 10;

  const deal = () => {
    const d = makeDeck();
    const pc = [d.pop()!, d.pop()!];
    const bc = [d.pop()!, d.pop()!];
    setPlayerCards(pc);
    setBankerCards(bc);
    const pv = handValue(pc), bv = handValue(bc);
    const winner: "player" | "banker" | "tie" = pv > bv ? "player" : bv > pv ? "banker" : "tie";
    const won = betType === winner;
    const mult = betType === "tie" ? 8 : betType === "banker" ? 1.95 : 2;
    setResult({ won, amount: won ? Math.floor(bet * mult) : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex gap-2">
        {(["player", "banker", "tie"] as const).map(t => (
          <button key={t} onClick={() => setBetType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${betType === t ? "bg-amber-600 text-white" : "bg-slate-800/60 text-slate-400 border border-border/60"}`}>
            {t === "player" ? "🔵 Player" : t === "banker" ? "🔴 Banker" : "🟢 Tie"} {t === "tie" ? "(8x)" : t === "banker" ? "(1.95x)" : "(2x)"}
          </button>
        ))}
      </div>
      {(playerCards.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-xs font-bold text-blue-400 mb-2">PLAYER ({handValue(playerCards)})</div>
            <div className="flex gap-2">{playerCards.map((c, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>{cardDisplay(c)}</motion.div>)}</div>
          </div>
          <div className="mafia-card rounded-xl p-4">
            <div className="text-xs font-bold text-red-400 mb-2">BANKER ({handValue(bankerCards)})</div>
            <div className="flex gap-2">{bankerCards.map((c, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>{cardDisplay(c)}</motion.div>)}</div>
          </div>
        </div>
      )}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        {!result && <button onClick={deal} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">Deal</button>}
        {result && <button onClick={() => { setPlayerCards([]); setBankerCards([]); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function CasinoPage() {
  const [game, setGame] = useState("blackjack");
  const games = [
    { id: "blackjack", label: "🃏 Blackjack", comp: <BlackjackGame /> },
    { id: "texas", label: "🂡 Texas Hold'em", comp: <PokerTexasGame /> },
    { id: "stud", label: "🂮 7-Card Stud", comp: <PokerStudGame /> },
    { id: "baccarat", label: "🎴 Baccarat", comp: <BaccaratGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🃏 Casino Games</h2>
      <div className="flex gap-2 flex-wrap">
        {games.map(g => (
          <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground hover:text-amber-400"}`}>{g.label}</button>
        ))}
      </div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. TABLE GAMES — Roulette, Craps, Sic Bo, War, Casino War
// ═══════════════════════════════════════════════════════════════

function RouletteGame() {
  const [bet, setBet] = useState(500);
  const [betType, setBetType] = useState<"red" | "black" | "green" | "odd" | "even" | "number">("red");
  const [betNumber, setBetNumber] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wheel, setWheel] = useState<number | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
  const REDS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const isRed = (n: number) => REDS.includes(n);
  const spin = () => {
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const n = NUMBERS[Math.floor(Math.random() * 37)];
      setWheel(n);
      setSpinning(false);
      let won = false, mult = 0;
      if (betType === "red" && isRed(n)) { won = true; mult = 2; }
      else if (betType === "black" && !isRed(n) && n !== 0) { won = true; mult = 2; }
      else if (betType === "green" && n === 0) { won = true; mult = 36; }
      else if (betType === "odd" && n % 2 === 1 && n !== 0) { won = true; mult = 2; }
      else if (betType === "even" && n % 2 === 0 && n !== 0) { won = true; mult = 2; }
      else if (betType === "number" && n === betNumber) { won = true; mult = 36; }
      setResult({ won, amount: won ? bet * mult : bet });
    }, 2000);
  };
  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex gap-2 flex-wrap">
        {[{ id: "red" as const, label: "🔴 Red", cls: "bg-red-900/40 border-red-500/40" },
          { id: "black" as const, label: "⚫ Black", cls: "bg-slate-800/40 border-slate-500/40" },
          { id: "green" as const, label: "🟢 0", cls: "bg-green-900/40 border-green-500/40" },
          { id: "odd" as const, label: "Odd", cls: "" }, { id: "even" as const, label: "Even", cls: "" }
        ].map(b => (
          <button key={b.id} onClick={() => setBetType(b.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${betType === b.id ? "bg-amber-600 text-white border-amber-500" : `text-muted-foreground border-border/60 ${b.cls}`}`}>{b.label}</button>
        ))}
      </div>
      {wheel !== null && (
        <motion.div initial={{ scale: 0, rotate: -360 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 1.5 }}
          className={`text-6xl font-black text-center py-6 rounded-xl ${wheel === 0 ? "bg-green-900/30 text-green-400" : isRed(wheel) ? "bg-red-900/30 text-red-400" : "bg-slate-800/40 text-slate-300"}`}>
          {wheel}
        </motion.div>
      )}
      {spinning && <div className="text-center text-amber-400 animate-pulse">🎡 Spinning...</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        <button onClick={spin} disabled={spinning} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold">Spin</button>
        <button onClick={() => { setWheel(null); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">Reset</button>
      </div>
    </div>
  );
}

function CrapsGame() {
  const [bet, setBet] = useState(500);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<"come" | "point" | "done">("come");
  const [point, setPoint] = useState(0);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const roll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    setDice([d1, d2]);
    if (phase === "come") {
      if (total === 7 || total === 11) { setResult({ won: true, amount: bet * 2 }); setPhase("done"); }
      else if (total === 2 || total === 3 || total === 12) { setResult({ won: false, amount: bet }); setPhase("done"); }
      else { setPoint(total); setPhase("point"); }
    } else {
      if (total === point) { setResult({ won: true, amount: bet * 2 }); setPhase("done"); }
      else if (total === 7) { setResult({ won: false, amount: bet }); setPhase("done"); }
    }
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {dice && (
        <div className="flex justify-center gap-4 text-5xl font-black">
          <motion.span initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>⚀⚁⚂⚃⚄⚅</motion.span>
          <span className="text-amber-400">{dice[0]}</span>
          <span className="text-amber-400">+</span>
          <span className="text-amber-400">{dice[1]}</span>
          <span className="text-amber-400">= {dice[0] + dice[1]}</span>
        </div>
      )}
      {phase === "point" && point > 0 && <div className="text-center text-amber-400 font-bold">Point: {point} — Roll {point} to win!</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        <button onClick={roll} disabled={phase === "done"} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold">🎲 Roll</button>
        {phase === "done" && <button onClick={() => { setDice(null); setPhase("come"); setPoint(0); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Game</button>}
      </div>
    </div>
  );
}

function DiceHighLowGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"high" | "low" | "seven">("high");
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const roll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    setDice([d1, d2]);
    const won = (pick === "high" && total > 7) || (pick === "low" && total < 7) || (pick === "seven" && total === 7);
    const mult = pick === "seven" ? 5 : 2;
    setResult({ won, amount: won ? bet * mult : bet });
  };
  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex gap-2">
        {(["high", "low", "seven"] as const).map(p => (
          <button key={p} onClick={() => setPick(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${pick === p ? "bg-amber-600 text-white" : "bg-slate-800/60 text-muted-foreground border border-border/60"}`}>
            {p === "high" ? "⬆️ High (8-12)" : p === "low" ? "⬇️ Low (2-6)" : "7️⃣ Seven (5x)"}
          </button>
        ))}
      </div>
      {dice && <div className="text-center text-4xl font-black text-amber-400">🎲 {dice[0]} + {dice[1]} = {dice[0] + dice[1]}</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={roll} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">🎲 Roll</button>
    </div>
  );
}

function ChuckALuckGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"big" | "small" | "triple">("big");
  const [dice, setDice] = useState<number[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const roll = () => {
    const d = [1,2,3].map(() => Math.floor(Math.random() * 6) + 1);
    setDice(d);
    const total = d.reduce((a, b) => a + b, 0);
    const hasTriple = d[0] === d[1] && d[1] === d[2];
    const won = (pick === "big" && total > 10 && !hasTriple) || (pick === "small" && total < 11 && !hasTriple) || (pick === "triple" && hasTriple);
    setResult({ won, amount: won ? bet * (pick === "triple" ? 30 : 2) : bet });
  };
  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex gap-2">
        {(["big", "small", "triple"] as const).map(p => (
          <button key={p} onClick={() => setPick(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${pick === p ? "bg-amber-600 text-white" : "bg-slate-800/60 text-muted-foreground border border-border/60"}`}>
            {p === "big" ? "⬆️ Big (11-17)" : p === "small" ? "⬇️ Small (4-10)" : "🎯 Any Triple (30x)"}
          </button>
        ))}
      </div>
      {dice.length > 0 && <div className="text-center text-4xl font-black text-amber-400">{dice.join(" · ")} = {dice.reduce((a, b) => a + b, 0)}</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={roll} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">🎲 Roll</button>
    </div>
  );
}

function WarGame() {
  const [bet, setBet] = useState(500);
  const [playerCard, setPlayerCard] = useState<{ suit: string; rank: string; value: number } | null>(null);
  const [dealerCard, setDealerCard] = useState<{ suit: string; rank: string; value: number } | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const play = () => {
    const d = makeDeck();
    const pc = d.pop()!;
    const dc = d.pop()!;
    setPlayerCard(pc);
    setDealerCard(dc);
    if (pc.value === dc.value) setResult({ won: true, amount: bet * 10 });
    else setResult({ won: pc.value > dc.value, amount: pc.value > dc.value ? bet * 2 : bet });
  };
  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="grid grid-cols-2 gap-4">
        {playerCard && <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground mb-2">YOUR CARD</div>{cardDisplay(playerCard)}</div>}
        {dealerCard && <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground mb-2">DEALER</div>{cardDisplay(dealerCard)}</div>}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={play} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">⚔️ Go to War</button>
    </div>
  );
}

function TableGamesPage() {
  const [game, setGame] = useState("roulette");
  const games = [
    { id: "roulette", label: "🎡 Roulette", comp: <RouletteGame /> },
    { id: "craps", label: "🎲 Craps", comp: <CrapsGame /> },
    { id: "sicbo", label: "🎯 Sic Bo / Chuck-a-Luck", comp: <ChuckALuckGame /> },
    { id: "war", label: "⚔️ War", comp: <WarGame /> },
    { id: "dicehl", label: "🎲 Dice High/Low", comp: <DiceHighLowGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🎰 Table Games</h2>
      <div className="flex gap-2 flex-wrap">
        {games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground hover:text-amber-400"}`}>{g.label}</button>)}
      </div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. SLOT MACHINES — Classic, Video, Progressive, Megaways, Cluster
// ═══════════════════════════════════════════════════════════════

function SlotMachine({ reels = 3, symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐", "🔔"], pays = [5, 10, 25, 50, 100, 250, 500, 1000] }: { reels?: number; symbols?: string[]; pays?: number[] }) {
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [display, setDisplay] = useState<string[]>(Array(reels).fill("🎰"));
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const [jackpot, setJackpot] = useState(50000);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    setJackpot(prev => prev + Math.floor(bet * 0.1));
    let count = 0;
    const interval = setInterval(() => {
      setDisplay(Array(reels).fill(0).map(() => symbols[Math.floor(Math.random() * symbols.length)]));
      count++;
      if (count >= 20) {
        clearInterval(interval);
        const final = Array(reels).fill(0).map(() => symbols[Math.floor(Math.random() * symbols.length)]);
        setDisplay(final);
        setSpinning(false);
        const allSame = final.every(s => s === final[0]);
        const idx = symbols.indexOf(final[0]);
        if (allSame) {
          if (final[0] === "💎" || final[0] === "7️⃣") {
            setJackpot(50000);
            setResult({ won: true, amount: jackpot });
          } else {
            setResult({ won: true, amount: bet * (pays[idx] || 10) });
          }
        } else {
          setResult({ won: false, amount: bet });
        }
      }
    }, 80);
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet, 50)}
      <div className="text-center text-amber-400 font-bold text-sm">Jackpot: ${jackpot.toLocaleString()}</div>
      <div className="flex justify-center gap-3 py-4">
        {display.map((s, i) => (
          <motion.div key={i} animate={spinning ? { rotateY: [0, 360] } : {}}
            className="w-20 h-24 flex items-center justify-center text-4xl bg-slate-900/60 rounded-xl border border-amber-700/30 shadow-inner">
            {s}
          </motion.div>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex justify-center">
        <button onClick={spin} disabled={spinning}
          className="px-6 py-3 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-50 text-black rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-900/30">
          {spinning ? "SPINNING..." : "🎰 PULL LEVER"}
        </button>
      </div>
    </div>
  );
}

function SlotMachinesPage() {
  const [type, setType] = useState("classic");
  const types = [
    { id: "classic", label: "🎰 Classic 3-Reel", comp: <SlotMachine reels={3} /> },
    { id: "video", label: "📺 Video Slots (5-Reel)", comp: <SlotMachine reels={5} /> },
    { id: "progressive", label: "💰 Progressive Jackpot", comp: <SlotMachine reels={5} symbols={["💎", "👑", "💰", "🎰", "7️⃣", "⭐", "🃏", "🔔"]} pays={[10, 25, 50, 100, 250, 500, 1000, 5000]} /> },
    { id: "megaways", label: "⚡ Megaways", comp: <SlotMachine reels={6} symbols={["🍒", "💎", "🔥", "⭐", "👑", "💰", "7️⃣", "🎰", "🃏", "🌟"]} /> },
    { id: "cluster", label: "🎯 Cluster Pays", comp: <SlotMachine reels={4} symbols={["🍓", "🍑", "🍋", "🍇", "💎", "🔔", "⭐", "🔥"]} /> },
  ];
  const active = types.find(t => t.id === type) ?? types[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🎰 Slot Machines</h2>
      <div className="flex gap-2 flex-wrap">
        {types.map(t => <button key={t.id} onClick={() => setType(t.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${type === t.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground hover:text-amber-400"}`}>{t.label}</button>)}
      </div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. CARD GAMES — Tournament, Omaha Hi-Lo, Short Deck
// ═══════════════════════════════════════════════════════════════

function TournamentPoker() {
  const [chips, setChips] = useState(10000);
  const [blind, setBlind] = useState(100);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [community, setCommunity] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const deal = () => {
    const d = makeDeck();
    setHand([d.pop()!, d.pop()!]);
    setCommunity([d.pop()!, d.pop()!, d.pop()!]);
    setRound(1);
    setResult(null);
  };

  const playHand = () => {
    const won = Math.random() > 0.4;
    const wonAmt = blind * (2 + Math.floor(Math.random() * 5));
    setChips(prev => prev + (won ? wonAmt : -blind));
    setResult({ won, amount: wonAmt });
    if (round < 5) setRound(r => r + 1);
    else {
      const finalChips = chips;
      setResult({ won: finalChips > 10000, amount: Math.abs(finalChips - 10000) });
      setBlind(b => b * 2);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span className="text-green-400 font-bold">Chips: ${chips.toLocaleString()}</span>
        <span className="text-amber-400 font-bold">Blind: ${blind}</span>
        <span className="text-muted-foreground">Round {round}/5</span>
      </div>
      {community.length > 0 && (
        <div className="mafia-card rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">Community</div>
          <div className="flex gap-2">{community.map((c, i) => <div key={i}>{cardDisplay(c)}</div>)}</div>
        </div>
      )}
      {hand.length > 0 && (
        <div className="mafia-card rounded-xl p-3">
          <div className="text-xs text-amber-400 mb-1">Your Hand</div>
          <div className="flex gap-2">{hand.map((c, i) => <div key={i}>{cardDisplay(c)}</div>)}</div>
        </div>
      )}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        {!hand.length ? <button onClick={deal} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Deal</button> :
          <button onClick={playHand} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Play Hand</button>}
      </div>
    </div>
  );
}

function OmahaHiLoGame() {
  const [bet, setBet] = useState(500);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [community, setCommunity] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const deal = () => {
    const d = makeDeck();
    setHand([d.pop()!, d.pop()!, d.pop()!, d.pop()!]);
    setCommunity([d.pop()!, d.pop()!, d.pop()!, d.pop()!, d.pop()!]);
    setResult({ won: Math.random() > 0.45, amount: bet * 3 });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {community.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-muted-foreground mb-1">Board (Hi-Lo)</div><div className="flex gap-2 flex-wrap">{community.map((c, i) => <div key={i}>{cardDisplay(c)}</div>)}</div></div>}
      {hand.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-amber-400 mb-1">4 Hole Cards</div><div className="flex gap-2 flex-wrap">{hand.map((c, i) => <div key={i}>{cardDisplay(c)}</div>)}</div></div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        {!hand.length ? <button onClick={deal} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Deal</button> :
          <button onClick={() => { setHand([]); setCommunity([]); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function ShortDeckGame() {
  const [bet, setBet] = useState(500);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const deal = () => {
    const d = makeDeck();
    setHand(Array.from({ length: 6 }, () => d.pop()!));
    setResult({ won: Math.random() > 0.4, amount: bet * 2 });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {hand.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-amber-400 mb-1">6-Card Short Deck Hand</div><div className="flex gap-2 flex-wrap">{hand.map((c, i) => <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>{cardDisplay(c)}</motion.div>)}</div></div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        {!hand.length ? <button onClick={deal} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Deal 6 Cards</button> :
          <button onClick={() => { setHand([]); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function CardGamesPage() {
  const [game, setGame] = useState("tournament");
  const games = [
    { id: "tournament", label: "🏆 Tournament Hold'em", comp: <TournamentPoker /> },
    { id: "omaha", label: "🂱 Omaha Hi-Lo Split", comp: <OmahaHiLoGame /> },
    { id: "shortdeck", label: "🂮 Short Deck Poker", comp: <ShortDeckGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🃏 Card Games</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. NUMBER GAMES — Keno, Bingo, Lottery, Powerball, Scratch, Mega
// ═══════════════════════════════════════════════════════════════

function KenoGame() {
  const [bet, setBet] = useState(500);
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const toggle = (n: number) => {
    if (picks.includes(n)) setPicks(picks.filter(p => p !== n));
    else if (picks.length < 10) setPicks([...picks, n]);
  };

  const play = () => {
    const nums = Array.from({ length: 80 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 20);
    setDrawn(nums);
    const hits = picks.filter(p => nums.includes(p)).length;
    const mult = hits >= 6 ? hits * 3 : hits >= 3 ? hits : 0;
    setResult({ won: mult > 0, amount: mult > 0 ? bet * mult : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="text-xs text-muted-foreground">Pick 1-10 numbers (click to toggle):</div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 80 }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => toggle(n)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${picks.includes(n) ? "bg-amber-600 text-white" : drawn.includes(n) ? "bg-red-900/40 text-red-400 border border-red-500/40" : "bg-slate-800/40 text-slate-400 hover:bg-slate-700/40"}`}>
            {n}
          </button>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        <button onClick={play} disabled={picks.length === 0} className="px-4 py-2 bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold">Draw</button>
        <button onClick={() => { setPicks([]); setDrawn([]); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">Clear</button>
      </div>
    </div>
  );
}

function LotteryGame({ name, price = 200, numCount = 6, maxNum = 49, jackMult = 100 }: { name?: string; price?: number; numCount?: number; maxNum?: number; jackMult?: number }) {
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const toggle = (n: number) => {
    if (picks.includes(n)) setPicks(picks.filter(p => p !== n));
    else if (picks.length < numCount) setPicks([...picks, n]);
  };
  const play = () => {
    const nums = Array.from({ length: maxNum }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, numCount);
    setDrawn(nums);
    const matches = picks.filter(p => nums.includes(p)).length;
    const mult = matches === numCount ? jackMult : matches === numCount - 1 ? 50 : matches === numCount - 2 ? 10 : matches === numCount - 3 ? 2 : 0;
    setResult({ won: mult > 0, amount: mult > 0 ? price * mult : price });
  };
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Pick {numCount} numbers from 1-{maxNum} (${price} per ticket)</div>
      <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
        {Array.from({ length: maxNum }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => toggle(n)}
            className={`w-7 h-7 rounded text-[10px] font-bold transition-all ${picks.includes(n) ? "bg-amber-600 text-white" : drawn.includes(n) ? "bg-red-900/40 text-red-400" : "bg-slate-800/40 text-slate-400 hover:bg-slate-700/40"}`}>{n}</button>
        ))}
      </div>
      {drawn.length > 0 && <div className="text-xs text-muted-foreground">Drawn: {drawn.sort((a, b) => a - b).join(", ")} — Matches: {picks.filter(p => drawn.includes(p)).length}/{numCount}</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={play} disabled={picks.length < numCount} className="px-4 py-2 bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold">🎰 Draw Numbers</button>
    </div>
  );
}

function ScratchCardGame() {
  const [bet, setBet] = useState(100);
  const [grid, setGrid] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const scratch = () => {
    const icons = ["🍒", "💎", "🍋", "7️⃣", "⭐", "🔔", "💰", "👑", "🍇"];
    const g = Array.from({ length: 9 }, () => icons[Math.floor(Math.random() * icons.length)]);
    setGrid(g);
    setRevealed(Array(9).fill(false));
    setResult(null);
  };

  const reveal = (i: number) => {
    if (revealed[i]) return;
    const newR = [...revealed];
    newR[i] = true;
    setRevealed(newR);
    if (newR.every(Boolean)) {
      const counts: Record<string, number> = {};
      grid.forEach(g => counts[g] = (counts[g] || 0) + 1);
      const maxMatch = Math.max(...Object.values(counts));
      const won = maxMatch >= 3;
      const mult = maxMatch >= 5 ? 50 : maxMatch >= 4 ? 10 : maxMatch >= 3 ? 3 : 0;
      setResult({ won, amount: won ? bet * mult : bet });
    }
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet, 50)}
      {grid.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {grid.map((icon, i) => (
            <button key={i} onClick={() => reveal(i)}
              className={`w-16 h-16 rounded-lg text-2xl flex items-center justify-center transition-all ${revealed[i] ? "bg-slate-700/40 border border-amber-600/40" : "bg-slate-800/80 border border-slate-500/30 hover:bg-slate-700/60"}`}>
              {revealed[i] ? icon : "❓"}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">Buy a scratch card to play</div>
      )}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex justify-center">
        <button onClick={scratch} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">🎫 Buy Card</button>
      </div>
    </div>
  );
}

function NumberGamesPage() {
  const [game, setGame] = useState("keno");
  const games = [
    { id: "keno", label: "🔢 Keno", comp: <KenoGame /> },
    { id: "bingo", label: "🎯 Bingo", comp: <LotteryGame name="Bingo" price={50} numCount={5} maxNum={75} jackMult={200} /> },
    { id: "lottery", label: "🎟️ Lottery 6/49", comp: <LotteryGame name="Lottery" price={200} numCount={6} maxNum={49} /> },
    { id: "powerball", label: "⚡ Powerball", comp: <LotteryGame name="Powerball" price={500} numCount={6} maxNum={69} jackMult={200} /> },
    { id: "mega", label: "💎 Mega Millions", comp: <LotteryGame name="Mega Millions" price={500} numCount={7} maxNum={70} jackMult={300} /> },
    { id: "scratch", label: "🎰 Scratch Cards", comp: <ScratchCardGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🔢 Number Games</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. SPORTS BETTING — Horse Racing & Variants
// ═══════════════════════════════════════════════════════════════

function HorseRace({ type = "win" }: { type?: string }) {
  const [bet, setBet] = useState(500);
  const [picked, setPicked] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [positions, setPositions] = useState([0, 0, 0, 0, 0, 0]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const names = ["Thunder", "Lightning", "Shadow", "Blaze", "Storm", "Flash"];

  const race = () => {
    if (picked === null) return;
    setRunning(true);
    setResult(null);
    let pos = [0, 0, 0, 0, 0, 0];
    const interval = setInterval(() => {
      pos = pos.map(p => Math.min(100, p + Math.floor(Math.random() * 8) + 1));
      setPositions([...pos]);
      if (pos.some(p => p >= 100)) {
        clearInterval(interval);
        setRunning(false);
        const sorted = [...pos].map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
        const won = sorted[0].i === picked;
        const mult = type === "exacta" ? 10 : type === "trifecta" ? 25 : type === "superfecta" ? 50 : 2;
        setResult({ won, amount: won ? bet * mult : bet });
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="space-y-1">
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-20 text-muted-foreground">{n}</span>
            <div className="flex-1 h-4 bg-black/40 rounded-full overflow-hidden relative">
              <motion.div className="h-full rounded-full" style={{ width: `${positions[i]}%`, background: `hsl(${i * 50}, 70%, 50%)` }} />
              <span className="absolute right-1 top-0 text-[9px] text-white/70">{positions[i]}%</span>
            </div>
            {positions[i] >= 100 && <span className="text-amber-400 font-bold">🏆</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {names.map((n, i) => (
          <button key={i} onClick={() => !running && setPicked(i)} className={`px-2 py-1 rounded text-xs font-bold ${picked === i ? "bg-amber-600 text-white" : "bg-slate-800/60 text-muted-foreground border border-border/60"}`}>
            {n}
          </button>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={race} disabled={running || picked === null} className="px-4 py-2 bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold">🏇 Race!</button>
    </div>
  );
}

function SportsBettingPage() {
  const [game, setGame] = useState("win");
  const games = [
    { id: "win", label: "🏇 Horse Win", comp: <HorseRace type="win" /> },
    { id: "exacta", label: "🏇 Exacta", comp: <HorseRace type="exacta" /> },
    { id: "trifecta", label: "🏇 Trifecta", comp: <HorseRace type="trifecta" /> },
    { id: "superfecta", label: "🏇 Superfecta", comp: <HorseRace type="superfecta" /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🏇 Sports Betting</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. ADVANCED BETTING — Moneyline, O/U, Parlay, Live
// ═══════════════════════════════════════════════════════════════

function MoneylineGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"team1" | "team2">("team1");
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const team1 = "Blue Eagles", team2 = "Red Wolves";
  const odds1 = -150, odds2 = 130;
  const play = () => {
    const won = pick === "team1" ? Math.random() > 0.4 : Math.random() > 0.55;
    const mult = pick === "team1" ? Math.abs(odds1) / 100 : odds2 / 100;
    setResult({ won, amount: won ? Math.floor(bet * mult) : bet });
  };
  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="grid grid-cols-2 gap-3">
        {[{ id: "team1" as const, name: team1, odds: odds1 }, { id: "team2" as const, name: team2, odds: odds2 }].map(t => (
          <button key={t.id} onClick={() => setPick(t.id)} className={`p-4 rounded-xl text-center transition-all ${pick === t.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>
            <div className="text-sm font-bold">{t.name}</div>
            <div className="text-lg font-black">{t.odds > 0 ? "+" : ""}{t.odds}</div>
          </button>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={play} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Place Bet</button>
    </div>
  );
}

function OverUnderGame() {
  const [bet, setBet] = useState(500);
  const [line] = useState(215 + Math.floor(Math.random() * 20) - 10);
  const [pick, setPick] = useState<"over" | "under">("over");
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const score = Math.floor(Math.random() * 60) + 190;
  const play = () => {
    const won = (pick === "over" && score > line) || (pick === "under" && score < line);
    setResult({ won, amount: won ? Math.floor(bet * 1.9) : bet });
  };
  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="text-center text-amber-400 font-bold">Line: {line} total points</div>
      <div className="flex gap-2 justify-center">
        {(["over", "under"] as const).map(p => (
          <button key={p} onClick={() => setPick(p)} className={`px-6 py-3 rounded-xl font-bold ${pick === p ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>
            {p === "over" ? "⬆️ Over" : "⬇️ Under"} {line}
          </button>
        ))}
      </div>
      {result && <>
        <div className="text-center text-xs text-muted-foreground">Final Score: {score} total points</div>
        <ResultBanner won={result.won} amount={result.amount} />
      </>}
      <button onClick={play} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Place Bet</button>
    </div>
  );
}

function ParlayGame() {
  const [bet, setBet] = useState(500);
  const [legs, setLegs] = useState<number>(3);
  const [picks, setPicks] = useState<("a" | "b")[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);
  const matchups = [
    ["Tigers", "Bears"], ["Eagles", "Wolves"], ["Kings", "Knights"],
    ["Lions", "Dragons"], ["Sharks", "Panthers"], ["Hawks", "Vipers"]
  ];

  const generate = () => {
    setPicks(Array.from({ length: legs }, () => Math.random() > 0.5 ? "a" : "b"));
  };

  const play = () => {
    if (picks.length === 0) generate();
    const results = picks.map(() => Math.random() > 0.5);
    const allWon = results.every(Boolean);
    const mult = Math.pow(1.9, legs);
    setResult({ won: allWon, amount: allWon ? Math.floor(bet * mult) : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Legs:</span>
        {[2, 3, 4, 5, 6].map(l => <button key={l} onClick={() => { setLegs(l); setPicks([]); }} className={`px-2 py-1 rounded text-xs font-bold ${legs === l ? "bg-amber-600 text-white" : "bg-slate-800/60 text-muted-foreground"}`}>{l}</button>)}
      </div>
      <button onClick={generate} className="px-3 py-1.5 bg-slate-700 text-white rounded text-xs">Generate Parlay</button>
      {picks.length > 0 && (
        <div className="space-y-2">
          {picks.map((p, i) => (
            <div key={i} className="flex items-center justify-between mafia-card rounded-lg px-3 py-2 text-xs">
              <span>{matchups[i % matchups.length][0]} vs {matchups[i % matchups.length][1]}</span>
              <span className="text-amber-400 font-bold">{p === "a" ? matchups[i % matchups.length][0] : matchups[i % matchups.length][1]}</span>
            </div>
          ))}
          <div className="text-xs text-muted-foreground text-center">Multiplier: x{Math.pow(1.9, legs).toFixed(1)}</div>
        </div>
      )}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={play} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Place Parlay</button>
    </div>
  );
}

function LiveBettingGame() {
  const [bet, setBet] = useState(500);
  const [quarter, setQuarter] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [liveLine, setLiveLine] = useState(-3);
  const [pick, setPick] = useState<"a" | "b">("a");
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setScore1(s => s + Math.floor(Math.random() * 5));
      setScore2(s => s + Math.floor(Math.random() * 5));
      setLiveLine(l => l + Math.floor(Math.random() * 6) - 3);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const betNow = () => {
    const diff = score1 - score2;
    const won = (pick === "a" && diff > -liveLine) || (pick === "b" && diff < -liveLine);
    setResult({ won, amount: won ? Math.floor(bet * 1.9) : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="mafia-card rounded-xl p-4">
        <div className="text-xs text-red-400 animate-pulse mb-2">🔴 LIVE — Q{quarter}</div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div><div className="text-lg font-bold">Blue Eagles</div><div className="text-3xl font-black text-amber-400">{score1}</div></div>
          <div><div className="text-lg font-bold">Red Wolves</div><div className="text-3xl font-black text-amber-400">{score2}</div></div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">Live Spread: {liveLine > 0 ? "+" : ""}{liveLine}</div>
      </div>
      <div className="flex gap-2">
        {(["a", "b"] as const).map(p => (
          <button key={p} onClick={() => setPick(p)} className={`flex-1 py-2 rounded-xl font-bold ${pick === p ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>
            {p === "a" ? "Blue Eagles" : "Red Wolves"}
          </button>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={betNow} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold w-full">🔴 Place Live Bet</button>
    </div>
  );
}

function AdvancedBettingPage() {
  const [game, setGame] = useState("moneyline");
  const games = [
    { id: "moneyline", label: "💰 Moneyline", comp: <MoneylineGame /> },
    { id: "ou", label: "📊 Over/Under", comp: <OverUnderGame /> },
    { id: "parlay", label: "🎰 Parlay", comp: <ParlayGame /> },
    { id: "live", label: "🔴 Live In-Play", comp: <LiveBettingGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">📊 Advanced Betting</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. DICE GAMES — Liar's Dice, Pig, Ship Captain Crew, Cee-lo, Mexico
// ═══════════════════════════════════════════════════════════════

function LiarsDiceGame() {
  const [bet, setBet] = useState(500);
  const [dice, setDice] = useState<number[]>([]);
  const [claim, setClaim] = useState({ qty: 1, face: 1 });
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const roll = () => {
    const d = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
    setDice(d);
    // AI calls higher or challenges
    const aiQty = claim.qty + (Math.random() > 0.3 ? 0 : 1);
    const aiFace = aiQty === claim.qty ? Math.min(6, claim.face + 1) : claim.face;
    const totalFaces = dice.filter(d => d === claim.face || d === 1).length + Math.floor(Math.random() * 3) + 1;
    const challenge = totalFaces < aiQty;
    setResult({ won: challenge, amount: challenge ? bet : Math.floor(bet * 0.5) });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {dice.length > 0 && <div className="flex justify-center gap-2 text-3xl">{dice.map((d, i) => <span key={i}>⚀⚁⚂⚃⚄⚅</span>)}</div>}
      <div className="flex gap-2 items-center">
        <select value={claim.qty} onChange={e => setClaim({ ...claim, qty: Number(e.target.value) })} className="bg-slate-800 border border-border/60 rounded px-2 py-1 text-xs text-foreground">
          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x</option>)}
        </select>
        <select value={claim.face} onChange={e => setClaim({ ...claim, face: Number(e.target.value) })} className="bg-slate-800 border border-border/60 rounded px-2 py-1 text-xs text-foreground">
          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Face {n}</option>)}
        </select>
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={roll} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">🎲 Roll & Claim</button>
    </div>
  );
}

function PigGame() {
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [current, setCurrent] = useState(0);
  const [turnTotal, setTurnTotal] = useState(0);
  const [lastDice, setLastDice] = useState(0);

  const roll = () => {
    const d = Math.floor(Math.random() * 6) + 1;
    setLastDice(d);
    if (d === 1) {
      setTurnTotal(0);
      setTurn(t => (t + 1) % 2);
    } else {
      setTurnTotal(t => t + d);
    }
  };

  const hold = () => {
    setScores(prev => {
      const n = [...prev];
      n[turn] += turnTotal;
      return n;
    });
    setTurnTotal(0);
    setTurn(t => (t + 1) % 2);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {scores.map((s, i) => (
          <div key={i} className={`mafia-card rounded-xl p-4 text-center ${turn === i ? "ring-2 ring-amber-500" : ""}`}>
            <div className="text-xs text-muted-foreground">{i === 0 ? "You" : "Opponent"}</div>
            <div className="text-2xl font-black text-amber-400">{s}</div>
          </div>
        ))}
      </div>
      {lastDice > 0 && <div className="text-center text-4xl font-black text-amber-400">🎲 {lastDice}</div>}
      <div className="text-center text-sm text-muted-foreground">Turn total: {turnTotal}</div>
      <div className="flex gap-2 justify-center">
        <button onClick={roll} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">🎲 Roll</button>
        <button onClick={hold} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold">✋ Hold</button>
      </div>
    </div>
  );
}

function CeeLoGame() {
  const [bet, setBet] = useState(500);
  const [dice, setDice] = useState<number[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const roll = () => {
    const d = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
    setDice(d);
    const sorted = [...d].sort((a, b) => a - b);
    if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) {
      setResult({ won: true, amount: bet * 5 }); // Trips
    } else if (sorted[0] === sorted[1] || sorted[1] === sorted[2]) {
      const point = sorted[0] === sorted[1] ? sorted[2] : sorted[0];
      setResult({ won: Math.random() > 0.45, amount: bet * 2 });
    } else {
      setResult({ won: false, amount: bet }); // No point
    }
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      {dice.length > 0 && <div className="text-center text-5xl font-black text-amber-400">🎲 {dice.join(" · ")}</div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={roll} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">🎲 Roll</button>
    </div>
  );
}

function DiceGamesPage() {
  const [game, setGame] = useState("liars");
  const games = [
    { id: "liars", label: "🎲 Liar's Dice", comp: <LiarsDiceGame /> },
    { id: "pig", label: "🐷 Pig", comp: <PigGame /> },
    { id: "cee-lo", label: "🎲 Cee-lo", comp: <CeeLoGame /> },
    { id: "dicehl", label: "⬆️⬇️ High/Low", comp: <DiceHighLowGame /> },
    { id: "mexico", label: "🇲🇽 Mexico", comp: <CeeLoGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🎲 Dice Games</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. STREET GAMBLING — Three-Card Monte, Shell, Russian Roulette, etc
// ═══════════════════════════════════════════════════════════════

function ThreeCardMonte() {
  const [bet, setBet] = useState(500);
  const [cards, setCards] = useState(["Q", "K", "J"]);
  const [shuffled, setShuffled] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const shuffle = () => {
    const c = ["Q", "K", "J"];
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * 3);
      const b = Math.floor(Math.random() * 3);
      [c[a], c[b]] = [c[b], c[a]];
    }
    setCards(c);
    setShuffled(true);
    setPick(null);
    setResult(null);
  };

  const choose = (i: number) => {
    setPick(i);
    const won = cards[i] === "Q";
    setResult({ won, amount: won ? bet * 3 : bet });
    setShuffled(false);
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="text-xs text-muted-foreground">Find the Queen (Q)!</div>
      <div className="flex justify-center gap-4">
        {cards.map((c, i) => (
          <button key={i} onClick={() => shuffled && choose(i)}
            className={`w-16 h-20 rounded-xl text-xl font-black flex items-center justify-center transition-all ${!shuffled ? "bg-slate-800 border border-slate-500/40 text-slate-600" : pick === i || result ? "bg-slate-700 border border-amber-500/40 text-amber-400" : "bg-slate-800 border border-slate-500/40 text-slate-600 hover:bg-slate-700"}`}>
            {result ? c : shuffled ? "?" : c}
          </button>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2 justify-center">
        <button onClick={shuffle} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">🔀 Shuffle</button>
      </div>
    </div>
  );
}

function ShellGame() {
  const [bet, setBet] = useState(500);
  const [shell, setShell] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const start = () => {
    const s = Math.floor(Math.random() * 3);
    setShell(s);
    setRevealed(false);
    setPick(null);
    setResult(null);
    setTimeout(() => setRevealed(true), 500);
  };

  const choose = (i: number) => {
    setPick(i);
    const won = i === shell;
    setResult({ won, amount: won ? bet * 3 : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex justify-center gap-6 text-5xl">
        {["🔵", "⚪", "⚪"].map((s, i) => (
          <button key={i} onClick={() => !result && choose(i)} className="transition-all hover:scale-110">{s}</button>
        ))}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex justify-center">
        <button onClick={start} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">🥚 Start</button>
      </div>
    </div>
  );
}

function RussianRouletteGame() {
  const [bet, setBet] = useState(500);
  const [chamber, setChamber] = useState(6);
  const [pulls, setPulls] = useState(0);
  const [alive, setAlive] = useState(true);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const pull = () => {
    setPulls(p => p + 1);
    const chance = 1 / (6 - pulls);
    if (Math.random() < chance) {
      setAlive(false);
      setResult({ won: false, amount: bet });
    } else if (pulls >= 4) {
      setAlive(true);
      setResult({ won: true, amount: bet * (pulls + 1) });
    }
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="text-center">
        <div className={`text-6xl mb-4 ${alive ? "" : "grayscale"}`}>{alive ? "🔫" : "💀"}</div>
        <div className="text-sm text-muted-foreground">Pulls: {pulls}/6 — Survived: {pulls}x reward</div>
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex justify-center gap-2">
        {alive && !result && <button onClick={pull} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold">🔫 Pull Trigger</button>}
        {result && <button onClick={() => { setPulls(0); setAlive(true); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Game</button>}
      </div>
    </div>
  );
}

function CoinFlipGame() {
  const [bet, setBet] = useState(500);
  const [pick, setPick] = useState<"heads" | "tails">("heads");
  const [flip, setFlip] = useState<string | null>(null);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const doFlip = () => {
    const f = Math.random() > 0.5 ? "heads" : "tails";
    setFlip(f);
    const won = f === pick;
    setResult({ won, amount: won ? bet * 2 : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet)}
      <div className="flex gap-2 justify-center">
        {(["heads", "tails"] as const).map(s => (
          <button key={s} onClick={() => setPick(s)} className={`px-4 py-2 rounded-xl font-bold ${pick === s ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>
            {s === "heads" ? "👑 Heads" : "🦅 Tails"}
          </button>
        ))}
      </div>
      {flip && <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} className="text-center text-6xl">{flip === "heads" ? "👑" : "🦅"}</motion.div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex justify-center">
        <button onClick={doFlip} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">🪙 Flip</button>
      </div>
    </div>
  );
}

function StreetGamblingPage() {
  const [game, setGame] = useState("3card");
  const games = [
    { id: "3card", label: "🃏 Three-Card Monte", comp: <ThreeCardMonte /> },
    { id: "shell", label: "🥚 Shell Game", comp: <ShellGame /> },
    { id: "roulette", label: "🎯 Russian Roulette", comp: <RussianRouletteGame /> },
    { id: "coin", label: "🪙 Coin Flip", comp: <CoinFlipGame /> },
    { id: "guess", label: "❓ Guess the Card", comp: <WarGame /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">🌆 Street Gambling</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-amber-600 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. MAFIA GAMBLING — Don's Game, Cartel Poker, Street Roulette, Backroom
// ═══════════════════════════════════════════════════════════════

function DonsGame() {
  const [bet, setBet] = useState(5000);
  const [cards, setCards] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [dons, setDons] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const play = () => {
    const d = makeDeck();
    setCards(Array.from({ length: 5 }, () => d.pop()!));
    setDons(Array.from({ length: 5 }, () => d.pop()!));
    const pSum = cards.reduce((a, c) => a + c.value, 0);
    const dSum = dons.reduce((a, c) => a + c.value, 0);
    setResult({ won: pSum >= dSum, amount: pSum >= dSum ? bet * 3 : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet, 1000)}
      <div className="text-xs text-amber-400 font-bold">⚠️ The Don always plays fair... sometimes.</div>
      <div className="grid grid-cols-2 gap-4">
        {cards.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-muted-foreground mb-1">Your Hand</div><div className="flex gap-1 flex-wrap">{cards.map((c, i) => <div key={i} className="scale-90">{cardDisplay(c)}</div>)}</div></div>}
        {dons.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-red-400 mb-1">The Don's Hand</div><div className="flex gap-1 flex-wrap">{dons.map((c, i) => <div key={i} className="scale-90">{cardDisplay(c)}</div>)}</div></div>}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={play} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-bold">👑 Challenge The Don</button>
    </div>
  );
}

function CartelPokerGame() {
  const [bet, setBet] = useState(10000);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [rival, setRival] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const play = () => {
    const d = makeDeck();
    setHand(Array.from({ length: 5 }, () => d.pop()!));
    setRival(Array.from({ length: 5 }, () => d.pop()!));
    const pH = hand.reduce((a, c) => a + c.value, 0);
    const rH = rival.reduce((a, c) => a + c.value, 0);
    setResult({ won: pH > rH, amount: pH > rH ? bet * 5 : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet, 5000)}
      <div className="grid grid-cols-2 gap-4">
        {hand.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-amber-400 mb-1">Your Cards</div><div className="flex gap-1 flex-wrap">{hand.map((c, i) => <div key={i} className="scale-90">{cardDisplay(c)}</div>)}</div></div>}
        {rival.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-red-400 mb-1">Rival Cartel</div><div className="flex gap-1 flex-wrap">{rival.map((c, i) => <div key={i} className="scale-90">{cardDisplay(c)}</div>)}</div></div>}
      </div>
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <button onClick={play} className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-bold">🏴 Cartel Showdown</button>
    </div>
  );
}

function BackroomBlackjack() {
  const [bet, setBet] = useState(5000);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [dealer, setDealer] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [result, setResult] = useState<{ won: boolean; amount: number } | null>(null);

  const sum = (c: typeof hand) => {
    let s = c.reduce((a, v) => a + v.value, 0);
    let aces = c.filter(c => c.rank === "A").length;
    while (s > 21 && aces > 0) { s -= 10; aces--; }
    return s;
  };

  const deal = () => {
    const d = makeDeck();
    setHand([d.pop()!, d.pop()!]);
    setDealer([d.pop()!, d.pop()!]);
    setResult(null);
  };

  const hit = () => {
    const d = makeDeck();
    const newHand = [...hand, d.pop()!];
    setHand(newHand);
    if (sum(newHand) > 21) setResult({ won: false, amount: bet });
  };

  const stand = () => {
    let dl = [...dealer];
    const d = makeDeck();
    while (sum(dl) < 17) dl.push(d.pop()!);
    setDealer(dl);
    const ps = sum(hand), ds = sum(dl);
    setResult({ won: ds > 21 || ps > ds, amount: (ds > 21 || ps > ds) ? bet * 2 : bet });
  };

  return (
    <div className="space-y-4">
      {betInput(bet, setBet, 1000)}
      <div className="text-xs text-red-400">⚠️ Underground backroom — no rules, just cash.</div>
      {dealer.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-muted-foreground mb-1">Dealer ({result ? sum(dealer) : "?"})</div><div className="flex gap-1 flex-wrap">{dealer.map((c, i) => <div key={i} className="scale-90">{cardDisplay(c)}</div>)}</div></div>}
      {hand.length > 0 && <div className="mafia-card rounded-xl p-3"><div className="text-xs text-amber-400 mb-1">Your Hand ({sum(hand)})</div><div className="flex gap-1 flex-wrap">{hand.map((c, i) => <div key={i} className="scale-90">{cardDisplay(c)}</div>)}</div></div>}
      {result && <ResultBanner won={result.won} amount={result.amount} />}
      <div className="flex gap-2">
        {!result && hand.length === 0 && <button onClick={deal} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Deal</button>}
        {hand.length > 0 && !result && <>
          <button onClick={hit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Hit</button>
          <button onClick={stand} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold">Stand</button>
        </>}
        {result && <button onClick={() => { setHand([]); setDealer([]); setResult(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold">New Hand</button>}
      </div>
    </div>
  );
}

function MafiaGamblingPage() {
  const [game, setGame] = useState("don");
  const games = [
    { id: "don", label: "👑 The Don's Game", comp: <DonsGame /> },
    { id: "cartel", label: "🏴 Cartel Poker", comp: <CartelPokerGame /> },
    { id: "backroom", label: "🃏 Backroom Blackjack", comp: <BackroomBlackjack /> },
  ];
  const active = games.find(g => g.id === game) ?? games[0];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2">👑 Mafia Gambling</h2>
      <div className="flex gap-2 flex-wrap">{games.map(g => <button key={g.id} onClick={() => setGame(g.id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${game === g.id ? "bg-red-700 text-white" : "mafia-card text-muted-foreground"}`}>{g.label}</button>)}</div>
      <div className="mafia-card rounded-xl p-5 border-red-900/30">{active.comp}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — Gambling Overview with category tabs
// ═══════════════════════════════════════════════════════════════

export function GamblingOverviewPage() {
  const [category, setCategory] = useState("casino");
  const categories = [
    { id: "casino", label: "🃏 Casino", icon: "🃏", comp: <CasinoPage /> },
    { id: "table", label: "🎰 Table Games", icon: "🎰", comp: <TableGamesPage /> },
    { id: "slots", label: "🎲 Slot Machines", icon: "🎲", comp: <SlotMachinesPage /> },
    { id: "cards", label: "🂡 Card Games", icon: "🂡", comp: <CardGamesPage /> },
    { id: "numbers", label: "🔢 Number Games", icon: "🔢", comp: <NumberGamesPage /> },
    { id: "sports", label: "🏇 Sports Betting", icon: "🏇", comp: <SportsBettingPage /> },
    { id: "advanced", label: "📊 Advanced Bet", icon: "📊", comp: <AdvancedBettingPage /> },
    { id: "dice", label: "🎲 Dice Games", icon: "🎲", comp: <DiceGamesPage /> },
    { id: "street", label: "🌆 Street Gambling", icon: "🌆", comp: <StreetGamblingPage /> },
    { id: "mafia", label: "👑 Mafia Gambling", icon: "👑", comp: <MafiaGamblingPage /> },
  ];
  const active = categories.find(c => c.id === category) ?? categories[0];

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">🎰 Gambling Den</h2>
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${category === c.id ? "bg-amber-600 text-white shadow-lg shadow-amber-900/30" : "mafia-card text-muted-foreground hover:text-amber-400 hover:bg-amber-900/10"}`}>
            {c.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {active.comp}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

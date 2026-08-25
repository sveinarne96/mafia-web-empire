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
  const r = card.suit === "\u2665" || card.suit === "\u2666";
  if (fd) return <motion.div initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: d, duration: 0.3 }} className={sm ? "w-10 h-14 rounded-xl border-2 border-amber-600/40 bg-gradient-to-br from-red-900 via-red-950 to-red-900 flex items-center justify-center shadow-lg" : "w-14 h-20 rounded-xl border-2 border-amber-600/40 bg-gradient-to-br from-red-900 via-red-950 to-red-900 flex items-center justify-center shadow-lg"}><div className="text-amber-600/40 text-[9px]">BACK</div></motion.div>;
  return <motion.div initial={{ rotateY: 90, opacity: 0, y: -20 }} animate={{ rotateY: 0, opacity: 1, y: 0 }} transition={{ delay: d, duration: 0.3, type: "spring", stiffness: 200 }} className={`${sm ? "w-10 h-14 text-[10px]" : "w-14 h-20 text-xs"} rounded-xl border-2 shadow-lg flex flex-col items-center justify-between py-1 px-1 font-bold select-none ${r ? "border-red-500/40 bg-gradient-to-br from-white via-red-50 to-red-100 text-red-700" : "border-slate-400/40 bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-800"}`}><span className="leading-none">{card.rank}</span><span className={`${sm ? "text-sm" : "text-xl"} leading-none`}>{card.suit}</span><span className="leading-none rotate-180">{card.rank}</span></motion.div>;
}

function BI({ value, onChange, presets }: { value: number; onChange: (n: number) => void; presets?: number[] }) {
  const p = presets || [100, 500, 1000, 5000, 25000, 100000];
  return <div className="space-y-2"><div className="flex items-center gap-2"><span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold">Wager</span><div className="flex-1 relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500/60 text-xs">$</span><input type="number" value={value} onChange={e => onChange(Math.max(10, Number(e.target.value)))} className="w-full bg-black/60 border border-amber-800/30 rounded-lg pl-5 pr-2 py-1.5 text-xs text-amber-200 font-mono focus:border-amber-500/50 focus:outline-none" /></div></div><div className="flex gap-1 flex-wrap">{p.map(v => <button key={v} onClick={() => onChange(v)} className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${value === v ? "bg-amber-600/30 border-amber-500/50 text-amber-300" : "bg-black/30 border-amber-900/20 text-amber-600/50"}`}>{String.fromCharCode(36)}{v >= 1000000 ? (v / 1000000) + "M" : v >= 1000 ? (v / 1000) + "K" : v}</button>)}</div></div>;
}

function WB({ won, amount, bj }: { won: boolean; amount: number; bj?: boolean }) {
  return <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-xl p-4 text-center border ${won ? "bg-gradient-to-b from-green-900/30 to-green-950/20 border-green-500/30 shadow-lg shadow-green-900/20" : "bg-gradient-to-b from-red-900/30 to-red-950/20 border-red-500/30"}`}><div className={`text-lg font-black ${won ? "text-green-400" : "text-red-400"}`}>{won ? (amount > 0 ? (bj ? "BLACKJACK!" : "YOU WIN") : "PUSH") : "BUST"}</div><div className={`text-sm font-bold mt-1 ${won ? "text-green-300" : "text-red-300"}`}>{won ? "+" : "-"}{String.fromCharCode(36)}{amount.toLocaleString()}</div></motion.div>;
}
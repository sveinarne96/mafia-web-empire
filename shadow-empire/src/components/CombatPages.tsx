import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════ COMBAT PAGES — 11 MAFIA COMBAT MODES ═══════════ */

function ActionBar({ hp, maxHp, armor }: { hp: number; maxHp: number; armor: number }) {
  return (
    <div className="flex gap-3 items-center text-xs">
      <div className="flex-1">
        <div className="text-[10px] text-slate-400 mb-0.5">HP</div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all" style={{ width: `${(hp/maxHp)*100}%` }} />
        </div>
      </div>
      <div className="text-center"><div className="text-[10px] text-slate-400">HP</div><div className="font-bold text-green-400">{hp}/{maxHp}</div></div>
      <div className="text-center"><div className="text-[10px] text-slate-400">Armor</div><div className="font-bold text-blue-400">{armor}</div></div>
    </div>
  );
}

/* ═══════════ 1. STREET FIGHT ═══════════ */
function StreetFightGame() {
  const [bet, setBet] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<"win"|"lose"|"fled"|null>(null);
  const [turn, setTurn] = useState(0);

  const enemies = [
    { name: "Drunk Thug", hp: 80, dmg: [5,15] },
    { name: "Street Punk", hp: 100, dmg: [8,18] },
    { name: "Local Enforcer", hp: 130, dmg: [10,22] },
    { name: "Rival Gangster", hp: 160, dmg: [12,28] },
    { name: "Hitman", hp: 200, dmg: [15,35] },
  ];
  const [enemy, setEnemy] = useState(enemies[0]);

  const fight = () => {
    if (result) return;
    const pDmg = Math.floor(Math.random() * 20) + 5;
    const eDmg = Math.floor(Math.random() * (enemy.dmg[1]-enemy.dmg[0])) + enemy.dmg[0];
    const newEHp = Math.max(0, enemy.hp - pDmg);
    const newPHp = Math.max(0, playerHp - eDmg);
    const newLog = [`You hit ${enemy.name} for ${pDmg} damage!`, `${enemy.name} hits you for ${eDmg} damage!`, ...log].slice(0, 8);
    setEnemyHp(newEHp); setPlayerHp(newPHp); setLog(newLog); setTurn(t=>t+1);
    if (newEHp <= 0) setResult("win");
    if (newPHp <= 0) setResult("lose");
  };

  const flee = () => {
    if (Math.random() > 0.4) { setResult("fled"); setLog(["You fled into the shadows!", ...log]); }
    else { const d=20; setPlayerHp(h=>Math.max(0,h-d)); setLog(["Flee failed! Took 20 damage while running.", ...log]); if(playerHp-20<=0)setResult("lose"); }
  };

  const reset = () => {
    const e = enemies[Math.floor(Math.random()*enemies.length)];
    setEnemy(e); setEnemyHp(e.hp); setPlayerHp(100); setLog([]); setResult(null); setTurn(0);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-red-400">STREET FIGHT</div>
        <div className="text-xs text-slate-400">No rules. No mercy. Just fists and fury.</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card p-3 rounded-xl">
          <div className="text-[10px] text-green-400 font-bold mb-1">YOU</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${playerHp}%`}} />
          </div>
          <div className="text-xs text-green-300 font-bold">{playerHp} HP</div>
        </div>
        <div className="mafia-card p-3 rounded-xl">
          <div className="text-[10px] text-red-400 font-bold mb-1">{enemy.name}</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-red-500 rounded-full transition-all" style={{width:`${(enemyHp/enemy.hp)*100}%`}} />
          </div>
          <div className="text-xs text-red-300 font-bold">{enemyHp} HP</div>
        </div>
      </div>
      <div className="mafia-card p-2 rounded-xl max-h-28 overflow-y-auto">
        {log.map((l,i)=><div key={i} className="text-[10px] text-slate-400 border-b border-slate-800/50 py-0.5">{l}</div>)}
        {log.length===0 && <div className="text-[10px] text-slate-600 text-center">Fight begins...</div>}
      </div>
      {!result ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={fight} className="py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">PUNCH</button>
          <button onClick={flee} className="py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">FLEE</button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`text-center text-lg font-black ${result==="win"?"text-green-400":result==="lose"?"text-red-400":"text-yellow-400"}`}>
            {result==="win"?"VICTORY!":result==="lose"?"DEFEATED!":"ESCAPED!"}
          </div>
          {result==="win" && <div className="text-center text-sm text-green-300">+${(bet*2).toLocaleString()} +50 XP</div>}
          <button onClick={reset} className="w-full py-2 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-bold">FIND NEW OPPONENT</button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Wager:</span>
        {[100,500,1000,5000].map(b=><button key={b} onClick={()=>setBet(b)} className={`px-2 py-1 rounded text-[10px] font-bold ${bet===b?"bg-amber-600 text-black":"bg-slate-800 text-slate-400"}`}>${b.toLocaleString()}</button>)}
      </div>
    </div>
  );
}

/* ═══════════ 2. BACK ALLEY AMBUSH ═══════════ */
function BackAlleyAmbushGame() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success:boolean;loot:number}|null>(null);
  const targets = ["Drunk businessman","Loaded tourist","Off-duty cop","Mob accountant","Rich gambler"];
  const [target, setTarget] = useState(targets[0]);

  const ambush = () => {
    setLoading(true);
    setTimeout(()=>{
      const success = Math.random() > 0.35;
      const loot = success ? Math.floor(Math.random()*5000) + 1000 : 0;
      setResult({success, loot});
      setLoading(false);
    },1500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-slate-400">BACK ALLEY AMBUSH</div>
        <div className="text-xs text-slate-400">Hide in the shadows. Strike when they least expect it.</div>
      </div>
      <div className="flex flex-wrap gap-1">{targets.map(t=><button key={t} onClick={()=>{setTarget(t);setResult(null);}} className={`px-2 py-1 rounded-lg text-[10px] font-bold ${target===t?"bg-slate-500 text-white":"bg-slate-800 text-slate-400"}`}>{t}</button>)}</div>
      <div className="mafia-card p-4 rounded-xl text-center">
        <div className="text-4xl mb-2">🌑</div>
        <div className="text-sm text-slate-300 font-bold">{target}</div>
        <div className="text-[10px] text-slate-500">Walking alone in a dark alley...</div>
      </div>
      {!result && !loading && <button onClick={ambush} className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">SET AMBUSH</button>}
      {loading && <div className="text-center text-slate-400 animate-pulse">Lurking in the shadows...</div>}
      {result && (
        <div className={`p-4 rounded-xl text-center ${result.success?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result.success?"text-green-400":"text-red-400"}`}>{result.success?"AMBUSH SUCCESS!":"TARGET SPOTTED YOU!"}</div>
          {result.success && <div className="text-sm text-green-300">+${result.loot.toLocaleString()} +30 XP</div>}
          {!result.success && <div className="text-sm text-red-300">Failed to steal anything. -10 HP</div>}
          <button onClick={()=>setResult(null)} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">Try Again</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 3. DRIVE-BY ═══════════ */
function DriveByGame() {
  const [speed, setSpeed] = useState(50);
  const [aim, setAim] = useState(50);
  const [result, setResult] = useState<{hits:number;cash:number}|null>(null);

  const shoot = () => {
    const accuracy = (aim*0.7 + (100-speed)*0.3) / 100;
    const bullets = Math.floor(Math.random()*6)+4;
    const hits = Math.floor(bullets * accuracy * (Math.random()*0.5+0.5));
    const cash = hits * 500;
    setResult({hits, cash});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-orange-400">DRIVE-BY</div>
        <div className="text-xs text-slate-400">Speed = escape chance. Aim = accuracy.</div>
      </div>
      <div className="mafia-card p-4 rounded-xl">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Speed: {speed}%</span><span>Slower = Better aim</span></div>
        <input type="range" min={10} max={90} value={speed} onChange={e=>setSpeed(+e.target.value)} className="w-full accent-orange-500" />
      </div>
      <div className="mafia-card p-4 rounded-xl">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Aim: {aim}%</span><span>Higher = More hits</span></div>
        <input type="range" min={10} max={90} value={aim} onChange={e=>setAim(+e.target.value)} className="w-full accent-orange-500" />
      </div>
      {!result ? (
        <button onClick={shoot} className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">🔫 OPEN FIRE</button>
      ) : (
        <div className="space-y-2">
          <div className={`p-4 rounded-xl text-center ${result.hits>0?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
            <div className="text-lg font-black text-white">{result.hits}/10 HITS!</div>
            <div className={`text-sm font-bold ${result.hits>0?"text-green-300":"text-red-300"}`}>{result.hits>0?`+${result.cash.toLocaleString()} cash +40 XP`:"Missed! Cops on your tail!"}</div>
          </div>
          <button onClick={()=>setResult(null)} className="w-full py-2 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-bold">Go Again</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 4. CAR CHASE ═══════════ */
function CarChaseGame() {
  const [phase, setPhase] = useState<"chase"|"escape"|"done">("chase");
  const [distance, setDistance] = useState(100);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<"escaped"|"caught"|"crashed"|null>(null);

  const actions = [
    { label: "Gas It", icon: "🏎️", escape: 15, risk: 0.15 },
    { label: "Brake Check", icon: "🛞", escape: 10, risk: 0.2 },
    { label: "Take Turn", icon: "↩️", escape: 20, risk: 0.25 },
    { label: "Weave Traffic", icon: "🚗", escape: 12, risk: 0.3 },
    { label: "Ram Them", icon: "💥", escape: 25, risk: 0.35 },
  ];

  const doAction = (a: typeof actions[0]) => {
    const esc = Math.random()*100;
    const crashed = Math.random() < a.risk;
    const escaped = esc < a.escape*2;
    if (crashed) { setResult("crashed"); setLog(["💥 CRASHED INTO A WALL!", ...log]); setPhase("done"); return; }
    if (escaped || distance<=0) { setResult("escaped"); setLog(["💨 ESCAPED! Lost the cops!", ...log]); setPhase("done"); return; }
    setDistance(d=>d-a.escape);
    const copDmg = Math.floor(Math.random()*15)+5;
    setLog([`${a.icon} ${a.label}! Lost ${a.escape}m. Cops ${copDmg}m closer.`, ...log].slice(0,6));
    if(distance-a.escape<=0) { setResult("escaped"); setLog(["💨 ESCAPED! Lost the cops!", ...log]); setPhase("done"); }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-cyan-400">CAR CHASE</div>
        <div className="text-xs text-slate-400">Lose the cops or get caught!</div>
      </div>
      <div className="mafia-card p-3 rounded-xl">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Distance to escape</span><span>{Math.max(0,distance)}m</span></div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all" style={{width:`${Math.max(0,(100-distance))}%`}} />
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">{log.map((l,i)=><span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400">{l}</span>)}</div>
      {phase==="chase" && (
        <div className="grid grid-cols-3 gap-2">{actions.map(a=><button key={a.label} onClick={()=>doAction(a)} className="p-2 rounded-xl bg-slate-800/50 text-slate-300 text-xs font-bold hover:bg-slate-700/50 transition-all"><div className="text-lg">{a.icon}</div>{a.label}</button>)}</div>
      )}
      {result && (
        <div className={`p-4 rounded-xl text-center ${result==="escaped"?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result==="escaped"?"text-green-400":"text-red-400"}`}>{result==="escaped"?"ESCAPED!":result==="crashed"?"CRASHED!":"CAUGHT!"}</div>
          {result==="escaped" && <div className="text-sm text-green-300">+$3,000 +60 XP</div>}
          <button onClick={()=>{setPhase("chase");setDistance(100);setLog([]);setResult(null);}} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New Chase</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 5. KIDNAP & RANSOM ═══════════ */
function KidnapRansomGame() {
  const [phase, setPhase] = useState<"pick"|"hold"|"done">("pick");
  const [target, setTarget] = useState("");
  const [demand, setDemand] = useState(50000);
  const [paid, setPaid] = useState(false);
  const targets = [
    { name: "Business Owner", maxRansom: 200000, escapeChance: 0.3 },
    { name: "Politician", maxRansom: 500000, escapeChance: 0.2 },
    { name: "Drug Lord's Wife", maxRansom: 1000000, escapeChance: 0.15 },
    { name: "Bank Manager", maxRansom: 750000, escapeChance: 0.25 },
    { name: "Celebrity", maxRansom: 2000000, escapeChance: 0.1 },
  ];
  const [victim, setVictim] = useState(targets[0]);

  const kidnap = () => {
    setVictim(targets.find(t=>t.name===target)||targets[0]);
    setPhase("hold");
    setPaid(false);
  };

  const checkRansom = () => {
    const paid = Math.random() < (demand < victim.maxRansom*0.7 ? 0.7 : 0.3);
    const escaped = Math.random() < victim.escapeChance;
    if (escaped) { setPhase("done"); return; }
    setPaid(paid);
    setPhase("done");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-purple-400">KIDNAP & RANSOM</div>
        <div className="text-xs text-slate-400">Take a hostage. Demand ransom. Hope they pay.</div>
      </div>
      {phase==="pick" && (
        <>
          <div className="flex flex-wrap gap-1">{targets.map(t=><button key={t.name} onClick={()=>setTarget(t.name)} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${target===t.name?"bg-purple-600 text-white":"bg-slate-800 text-slate-400"}`}>{t.name} (Max ${(t.maxRansom/1000).toFixed(0)}K)</button>)}</div>
          <div className="mafia-card p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 mb-1">Ransom Demand: ${demand.toLocaleString()}</div>
            <input type="range" min={10000} max={victim.maxRansom} step={5000} value={demand} onChange={e=>setDemand(+e.target.value)} className="w-full accent-purple-500" />
            <div className="text-[10px] text-slate-500 mt-1">Higher demand = lower chance of payment</div>
          </div>
          <button onClick={kidnap} disabled={!target} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">KIDNAP</button>
        </>
      )}
      {phase==="hold" && (
        <div className="space-y-3">
          <div className="mafia-card p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">🏴</div>
            <div className="text-sm font-bold text-purple-300">{target || victim.name} held captive</div>
            <div className="text-[10px] text-slate-400">Demanding ${demand.toLocaleString()}</div>
          </div>
          <div className="text-[10px] text-red-400 text-center">Each turn there's a chance they escape!</div>
          <button onClick={checkRansom} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">CHECK RANSOM</button>
        </div>
      )}
      {phase==="done" && (
        <div className={`p-4 rounded-xl text-center ${paid?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${paid?"text-green-400":"text-red-400"}`}>{paid?"RANSOM PAID!":Math.random()>0.5?"TARGET ESCAPED!":"NO PAYMENT!"}</div>
          {paid && <div className="text-sm text-green-300">+${demand.toLocaleString()} +80 XP</div>}
          <button onClick={()=>setPhase("pick")} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New Target</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 6. PROTECT YOUR TURF ═══════════ */
function ProtectTurfGame() {
  const [waves, setWaves] = useState(0);
  const [hp, setHp] = useState(100);
  const [enemies, setEnemies] = useState(0);
  const [result, setResult] = useState<"survived"|"lost"|null>(null);

  const defend = () => {
    const wave = waves + 1;
    const incoming = Math.floor(Math.random()*3)+1+Math.floor(wave/2);
    const killed = Math.floor(Math.random()*incoming)+1;
    const dmg = (incoming-killed)*Math.floor(Math.random()*15)+5;
    const newHp = hp-dmg;
    setWaves(wave); setEnemies(e=>e+incoming); setHp(newHp);
    if(newHp<=0) setResult("lost");
    if(wave>=5) setResult("survived");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-green-400">PROTECT YOUR TURF</div>
        <div className="text-xs text-slate-400">Survive 5 waves to keep your territory</div>
      </div>
      <div className="mafia-card p-3 rounded-xl">
        <div className="flex justify-between text-xs mb-1"><span className="text-green-400">Wave {waves}/5</span><span className="text-red-400">HP: {hp}</span></div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${hp}%`}} /></div>
      </div>
      {!result && (
        <>
          <div className="mafia-card p-3 rounded-xl text-center">
            <div className="text-sm text-slate-300">Defenders rallied. Rivals approaching...</div>
          </div>
          <button onClick={defend} className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">⚔️ DEFEND</button>
        </>
      )}
      {result && (
        <div className={`p-4 rounded-xl text-center ${result==="survived"?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result==="survived"?"text-green-400":"text-red-400"}`}>{result==="survived"?"TURF DEFENDED!":"TURF LOST!"}</div>
          {result==="survived" && <div className="text-sm text-green-300">+$10,000 +100 XP</div>}
          <button onClick={()=>{setWaves(0);setHp(100);setEnemies(0);setResult(null);}} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">Play Again</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 7. UNDERGROUND BOXING ═══════════ */
function UndergroundBoxingGame() {
  const [bet, setBet] = useState(200);
  const [hp, setHp] = useState(100);
  const [oppHp, setOppHp] = useState(100);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<"ko"|"decision"|"loss"|null>(null);
  const opponents = ["Iron Mike","The Crusher","Knockout King","Stone Hands","Iron Chin"];
  const [opponent] = useState(opponents[Math.floor(Math.random()*opponents.length)]);

  const punch = () => {
    const r = round+1;
    const pDmg = Math.floor(Math.random()*18)+8;
    const oDmg = Math.floor(Math.random()*14)+6;
    const newOpp = Math.max(0,oppHp-pDmg);
    const newHp = Math.max(0,hp-oDmg);
    setRound(r); setOppHp(newOpp); setHp(newHp);
    if(newOpp<=0) setResult("ko");
    if(newHp<=0) setResult("loss");
    if(r>=12 && newHp>0 && newOpp>0) setResult(newHp>newOpp?"decision":"loss");
  };

  const block = () => {
    const r = round+1;
    const oDmg = Math.floor(Math.random()*6)+1;
    const newHp = Math.max(0,hp-oDmg);
    setRound(r); setHp(newHp);
    if(newHp<=0) setResult("loss");
    if(r>=12 && newHp>0) setResult("decision");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-amber-400">UNDERGROUND BOXING</div>
        <div className="text-xs text-slate-400">12 rounds | KO or Decision | {opponent}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card p-3 rounded-xl"><div className="text-[10px] text-green-400 font-bold">YOU</div><div className="w-full h-2 bg-slate-800 rounded-full mt-1"><div className="h-full bg-green-500 rounded-full" style={{width:`${hp}%`}} /></div><div className="text-xs text-green-300 mt-1">{hp} HP</div></div>
        <div className="mafia-card p-3 rounded-xl"><div className="text-[10px] text-red-400 font-bold">{opponent}</div><div className="w-full h-2 bg-slate-800 rounded-full mt-1"><div className="h-full bg-red-500 rounded-full" style={{width:`${oppHp}%`}} /></div><div className="text-xs text-red-300 mt-1">{oppHp} HP</div></div>
      </div>
      <div className="text-center text-xs text-slate-400">Round {round}/12 | Wager: ${bet.toLocaleString()}</div>
      {!result ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={punch} className="py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">🥊 PUNCH</button>
          <button onClick={block} className="py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">🛡️ BLOCK</button>
        </div>
      ) : (
        <div className={`p-4 rounded-xl text-center ${result!=="loss"?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result!=="loss"?"text-green-400":"text-red-400"}`}>{result==="ko"?"KNOCKOUT!":result==="decision"?"DECISION WIN!":"DEFEATED!"}</div>
          {result!=="loss" && <div className="text-sm text-green-300">+${(bet*3).toLocaleString()} +75 XP</div>}
          <button onClick={()=>{setHp(100);setOppHp(100);setRound(0);setResult(null);}} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New Fight</button>
        </div>
      )}
      <div className="flex gap-1">{[100,200,500,1000,5000].map(b=><button key={b} onClick={()=>setBet(b)} className={`px-2 py-1 rounded text-[10px] font-bold ${bet===b?"bg-amber-600 text-black":"bg-slate-800 text-slate-400"}`}>${b.toLocaleString()}</button>)}</div>
    </div>
  );
}

/* ═══════════ 8. FACTION WAR ═══════════ */
function FactionWarGame() {
  const [power, setPower] = useState(50);
  const [enemyPower, setEnemyPower] = useState(50+Math.floor(Math.random()*30));
  const [result, setResult] = useState<"won"|"lost"|null>(null);

  const war = () => {
    const p = power + Math.floor(Math.random()*30)-10;
    const e = enemyPower + Math.floor(Math.random()*30)-10;
    setResult(p>=e?"won":"lost");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-indigo-400">FACTION WAR</div>
        <div className="text-xs text-slate-400">Your crew vs a rival faction</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card p-4 rounded-xl text-center">
          <div className="text-xs text-indigo-400 font-bold mb-2">YOUR CREW</div>
          <div className="text-3xl font-black text-indigo-300">{power}</div>
          <div className="text-[10px] text-slate-400">Power Level</div>
        </div>
        <div className="mafia-card p-4 rounded-xl text-center">
          <div className="text-xs text-red-400 font-bold mb-2">RIVALS</div>
          <div className="text-3xl font-black text-red-300">{enemyPower}</div>
          <div className="text-[10px] text-slate-400">Power Level</div>
        </div>
      </div>
      {!result ? (
        <div className="space-y-3">
          <div className="mafia-card p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 mb-1">Deploy more fighters: {power}</div>
            <input type="range" min={10} max={100} value={power} onChange={e=>setPower(+e.target.value)} className="w-full accent-indigo-500" />
          </div>
          <button onClick={war} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black rounded-xl hover:scale-[1.02] transition-all">⚔️ DECLARE WAR</button>
        </div>
      ) : (
        <div className={`p-4 rounded-xl text-center ${result==="won"?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result==="won"?"text-green-400":"text-red-400"}`}>{result==="won"?"FACTION VICTORY!":"FACTION DEFEATED!"}</div>
          {result==="won" && <div className="text-sm text-green-300">+$25,000 +120 XP | Territory gained</div>}
          <button onClick={()=>{setEnemyPower(50+Math.floor(Math.random()*30));setResult(null);}} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New War</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 9. BOUNTY HUNT ═══════════ */
function BountyHuntGame() {
  const [bounty, setBounty] = useState(10000);
  const [target, setTarget] = useState("");
  const [result, setResult = useState] = useState<{found:boolean;reward:number}|null>(null);

  const bounties = [
    { name: "Rat Tommy", reward: 5000, danger: 0.2 },
    { name: "Snitch Marco", reward: 15000, danger: 0.35 },
    { name: "Killer Vinnie", reward: 50000, danger: 0.5 },
    { name: "Ghost Franco", reward: 100000, danger: 0.6 },
    { name: "The Shadow", reward: 500000, danger: 0.75 },
  ];

  const hunt = () => {
    const b = bounties.find(x=>x.name===target) || bounties[0];
    const found = Math.random() > b.danger;
    setResult({found, reward:found?b.reward:0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-yellow-400">BOUNTY HUNT</div>
        <div className="text-xs text-slate-400">Track down wanted targets for cash rewards</div>
      </div>
      <div className="flex flex-col gap-1.5">
        {bounties.map(b=><button key={b.name} onClick={()=>{setTarget(b.name);setResult(null);}} className={`flex items-center justify-between p-2 rounded-lg text-xs ${target===b.name?"bg-yellow-600/20 border border-yellow-500/30 text-yellow-300":"bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>
          <span className="font-bold">{b.name}</span>
          <span className="text-green-400">${b.reward.toLocaleString()}</span>
        </button>)}
      </div>
      {!result ? (
        <button onClick={hunt} disabled={!target} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">🔍 HUNT</button>
      ) : (
        <div className={`p-4 rounded-xl text-center ${result.found?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result.found?"text-green-400":"text-red-400"}`}>{result.found?"TARGET FOUND!":"TARGET GONE!"}</div>
          {result.found && <div className="text-sm text-green-300">+${result.reward.toLocaleString()} +50 XP</div>}
          <button onClick={()=>setResult(null)} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New Hunt</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 10. INTERROGATE ═══════════ */
function InterrogateGame() {
  const [suspect, setSuspect] = useState("");
  const [result, setResult] = useState<{info:boolean;xp:number}|null>(null);
  const suspects = [
    { name: "Jailbird Pete", info: 0.6, reward: 3000 },
    { name: "Silent Rosa", info: 0.3, reward: 8000 },
    { name: "Chatty Frank", info: 0.8, reward: 1500 },
    { name: "The Boss's Aide", info: 0.2, reward: 15000 },
  ];

  const interrogate = () => {
    const s = suspects.find(x=>x.name===suspect) || suspects[0];
    const gotInfo = Math.random() < s.info;
    setResult({info:gotInfo, xp:gotInfo?s.reward:0});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-rose-400">INTERROGATE</div>
        <div className="text-xs text-slate-400">Squeeze information out of captured rivals</div>
      </div>
      <div className="flex flex-col gap-1.5">
        {suspects.map(s=><button key={s.name} onClick={()=>{setSuspect(s.name);setResult(null);}} className={`flex items-center justify-between p-2 rounded-lg text-xs ${suspect===s.name?"bg-rose-600/20 border border-rose-500/30 text-rose-300":"bg-slate-800/50 text-slate-400"}`}>
          <span className="font-bold">{s.name}</span>
          <span className="text-slate-500">Info: {(s.info*100).toFixed(0)}% | ${s.reward.toLocaleString()}</span>
        </button>)}
      </div>
      {!result ? (
        <button onClick={interrogate} disabled={!suspect} className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">🗣️ INTERROGATE</button>
      ) : (
        <div className={`p-4 rounded-xl text-center ${result.info?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result.info?"text-green-400":"text-red-400"}`}>{result.info?"INFORMATION OBTAINED!":"STAYED SILENT!"}</div>
          {result.info && <div className="text-sm text-green-300">+${result.xp.toLocaleString()} +40 XP</div>}
          <button onClick={()=>setResult(null)} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New Suspect</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 11. SABOTAGE ═══════════ */
function SabotageGame() {
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<{success:boolean;damage:number}|null>(null);
  const targets = [
    { name: "Rival Casino", hp: 100, reward: 20000 },
    { name: "Drug Lab", hp: 80, reward: 35000 },
    { name: "Weapon Factory", hp: 120, reward: 50000 },
    { name: "Money Laundering Op", hp: 60, reward: 75000 },
    { name: "Smuggling Route", hp: 90, reward: 40000 },
  ];

  const sabotage = () => {
    const t = targets.find(x=>x.name===target) || targets[0];
    const success = Math.random() > 0.4;
    const dmg = success ? Math.floor(Math.random()*t.hp*0.6)+20 : 0;
    setResult({success, damage:dmg});
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-black text-orange-400">SABOTAGE</div>
        <div className="text-xs text-slate-400">Destroy a rival's operations from within</div>
      </div>
      <div className="flex flex-col gap-1.5">
        {targets.map(t=><button key={t.name} onClick={()=>{setTarget(t.name);setResult(null);}} className={`flex items-center justify-between p-2 rounded-lg text-xs ${target===t.name?"bg-orange-600/20 border border-orange-500/30 text-orange-300":"bg-slate-800/50 text-slate-400"}`}>
          <span className="font-bold">{t.name}</span>
          <span className="text-green-400">${t.reward.toLocaleString()}</span>
        </button>)}
      </div>
      {!result ? (
        <button onClick={sabotage} disabled={!target} className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white font-black rounded-xl hover:scale-[1.02] disabled:opacity-50 transition-all">💣 SABOTAGE</button>
      ) : (
        <div className={`p-4 rounded-xl text-center ${result.success?"bg-green-900/30 border border-green-500/30":"bg-red-900/30 border border-red-500/30"}`}>
          <div className={`text-lg font-black ${result.success?"text-green-400":"text-red-400"}`}>{result.success?"SABOTAGE SUCCESSFUL!":"DETECTED! MISSION FAILED!"}</div>
          {result.success && <div className="text-sm text-green-300">Dealt {result.damage} damage | +${(result.damage*200).toLocaleString()} +60 XP</div>}
          <button onClick={()=>setResult(null)} className="mt-2 px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">New Target</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ MAIN COMBAT OVERVIEW PAGE ═══════════ */
export function CombatOverviewPage() {
  const [tab, setTab] = useState("street");

  const tabs = [
    { id: "street", label: "Street Fight", icon: "🥊" },
    { id: "alley", label: "Back Alley", icon: "🌑" },
    { id: "driveby", label: "Drive-By", icon: "🔫" },
    { id: "chase", label: "Car Chase", icon: "🏎️" },
    { id: "kidnap", label: "Kidnap", icon: "🏴" },
    { id: "turf", label: "Protect Turf", icon: "📍" },
    { id: "boxing", label: "Underground", icon: "🥊" },
    { id: "faction", label: "Faction War", icon: "⚔️" },
    { id: "bounty", label: "Bounty Hunt", icon: "🎯" },
    { id: "interrogate", label: "Interrogate", icon: "🗣️" },
    { id: "sabotage", label: "Sabotage", icon: "💣" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">⚔️</span>
        <div>
          <h2 className="text-xl font-black text-amber-400 tracking-tight">Combat Arena</h2>
          <p className="text-[10px] text-slate-500">11 ways to assert dominance in the underworld</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"px-3 py-2 rounded-xl text-xs font-bold transition-all border " + (tab === t.id ? "bg-red-600/20 border-red-500/40 text-red-300 shadow-lg shadow-red-900/20" : "border-slate-800/20 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "street" && <StreetFightGame />}
          {tab === "alley" && <BackAlleyAmbushGame />}
          {tab === "driveby" && <DriveByGame />}
          {tab === "chase" && <CarChaseGame />}
          {tab === "kidnap" && <KidnapRansomGame />}
          {tab === "turf" && <ProtectTurfGame />}
          {tab === "boxing" && <UndergroundBoxingGame />}
          {tab === "faction" && <FactionWarGame />}
          {tab === "bounty" && <BountyHuntGame />}
          {tab === "interrogate" && <InterrogateGame />}
          {tab === "sabotage" && <SabotageGame />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

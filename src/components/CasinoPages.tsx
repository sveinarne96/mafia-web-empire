import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// ═══════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════

function PageHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 p-5" style={{ background: "linear-gradient(135deg, rgba(20,10,5,0.9), rgba(40,20,10,0.8), rgba(20,10,5,0.9))" }}>
      <div className="absolute -right-6 -top-10 text-9xl opacity-10">{icon}</div>
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="text-2xl font-black text-amber-300">{title}</h2>
            {sub && <p className="text-xs text-amber-400/60">{sub}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "text-slate-200", icon }: { label: string; value: string; color?: string; icon?: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">{icon && <span>{icon}</span>}{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}

function ActionButton({ onClick, disabled, children, color = "bg-amber-600 hover:bg-amber-500" }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-[11px] font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}>
      {children}
    </button>
  );
}

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function makeDeck() {
  const deck: { suit: string; rank: string; value: number }[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      const rank = RANKS[i];
      let value = i + 1;
      if (i >= 9) value = 10; // J Q K = 10
      if (rank === "A") value = 11;
      deck.push({ suit, rank, value });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardColor(suit: string) {
  return suit === "♥" || suit === "♦" ? "text-red-400" : "text-slate-200";
}

function PlayingCard({ card, hidden, small }: { card?: { suit: string; rank: string; value: number }; hidden?: boolean; small?: boolean }) {
  const sz = small ? "w-10 h-14 text-sm" : "w-14 h-20 text-lg";
  if (!card || hidden) {
    return (
      <div className={`${sz} rounded-lg bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700/50 flex items-center justify-center text-xl shadow-lg`}>
        {hidden ? <span className="text-blue-400/40">?</span> : ""}
      </div>
    );
  }
  return (
    <div className={`${sz} rounded-lg bg-white border border-slate-300 flex flex-col items-center justify-center shadow-lg transition-all hover:scale-105`}>
      <span className={`${cardColor(card.suit)} font-black leading-none`}>{card.rank}</span>
      <span className={`${cardColor(card.suit)} text-xs leading-none`}>{card.suit}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CASINOS OVERVIEW
// ═══════════════════════════════════════════════════════════════

const CITIES = [
  { name: "New York", cost: 500000, icon: "🗽", wealth: "Billionaire", maxBet: "$500,000,000" },
  { name: "Los Angeles", cost: 400000, icon: "🌴", wealth: "Billionaire", maxBet: "$500,000,000" },
  { name: "Chicago", cost: 300000, icon: "🏙️", wealth: "M.Billionaire", maxBet: "$500,000,000" },
  { name: "Miami", cost: 600000, icon: "🏖️", wealth: "M.Billionaire", maxBet: "$1,000,000,000" },
  { name: "Las Vegas", cost: 1000000, icon: "🎰", wealth: "U.Rich", maxBet: "$500,000,000" },
  { name: "London", cost: 750000, icon: "🇬🇧", wealth: "Billionaire", maxBet: "$500,000,000" },
  { name: "Tokyo", cost: 800000, icon: "🗼", wealth: "M.Billionaire", maxBet: "$1,000,000,000" },
  { name: "Berlin", cost: 500000, icon: "🇩🇪", wealth: "Rich", maxBet: "$100,000,000" },
  { name: "Sydney", cost: 700000, icon: "🦘", wealth: "Billionaire", maxBet: "$500,000,000" },
  { name: "Dubai", cost: 1500000, icon: "🕌", wealth: "U.Rich", maxBet: "$1,000,000,000" },
];

const CASINO_GAMES = [
  { name: "Dice", icon: "🎲", desc: "Roll dice and predict the outcome", owner: null, maxBet: "$0" },
  { name: "Roulette", icon: "🎡", desc: "Spin the wheel — red, black, or green?", owner: "XMatt", maxBet: "$500,000" },
  { name: "Blackjack", icon: "🃏", desc: "Classic 21 — beat the dealer without busting", owner: "Kaiba", maxBet: "$500,000,000" },
  { name: "Racetrack", icon: "🏇", desc: "Bet on horse racing with real odds", owner: "Sinapse", maxBet: "$1,000,000,000" },
  { name: "Poker", icon: "🂡", desc: "Texas Hold'em — bluff your way to victory", owner: "Potter", maxBet: "$1,000" },
];

export function CasinosPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader icon="🎰" title="Casinos" sub="Every city has casinos — own them, play them, or lose them. Keep your casino bank funded or lose the property." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="🏦" label="Bank" value={`$${(player.bank ?? 0).toLocaleString()}`} color="text-blue-400" />
        <StatPill icon="🎰" label="Casino Bank" value={`$${((player as any).casinoBank ?? 0).toLocaleString()}`} color="text-amber-400" />
        <StatPill icon="📍" label="Location" value={player.location ?? "Unknown"} color="text-purple-400" />
      </div>

      {/* Casino Bank Warning */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💰</span>
          <span className="text-sm font-bold text-amber-300">Casino Bank Account</span>
        </div>
        <div className="text-[10px] text-muted-foreground mb-2">Casinos require a minimum balance to operate. If your casino bank drops to $0, the property is seized and sold at auction.</div>
        <div className="bg-amber-950/30 rounded-lg p-2 text-xs text-amber-300 border border-amber-500/20">
          ⚠️ Keep your casino bank funded — if it hits $0, you lose the casino!
        </div>
      </div>

      {!selectedCity ? (
        <div className="space-y-3">
          <div className="text-sm font-bold text-amber-300">🏙️ Select a City</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CITIES.map((city) => (
              <div key={city.name} onClick={() => setSelectedCity(city.name)}
                className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-700/30 rounded-xl p-4 cursor-pointer hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all">
                <div className="text-3xl mb-2">{city.icon}</div>
                <div className="text-sm font-bold text-white">{city.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Casino cost: ${city.cost.toLocaleString()}</div>
                <div className="text-[9px] text-amber-400/60 mt-0.5">5 games available</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setSelectedCity(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition">← Back to Cities</button>
          <div className="text-sm font-bold text-amber-300">🎰 Casinos in {selectedCity}</div>
          <div className="text-[10px] text-muted-foreground mb-2">Purchase, manage, and play at casinos. If no owner, purchase it to start earning revenue.</div>

          {/* Casino Properties Table */}
          <div className="mafia-card rounded-xl overflow-hidden border border-slate-700/30">
            <div className="grid grid-cols-5 gap-0 text-[9px] font-bold text-muted-foreground uppercase bg-slate-900/50 px-4 py-2 border-b border-slate-700/30">
              <span>Casino</span><span>Owner</span><span>Wealth</span><span>Max Bet</span><span>Buyback</span>
            </div>
            {CASINO_GAMES.map((game) => (
              <div key={game.name} className="grid grid-cols-5 gap-0 items-center px-4 py-3 border-b border-slate-800/30 hover:bg-slate-800/20 transition">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{game.icon}</span>
                  <span className="text-xs font-bold text-white">{game.name}</span>
                </div>
                <span className={`text-[10px] font-bold ${game.owner ? "text-green-400" : "text-muted-foreground"}`}>{game.owner ?? "No owner"}</span>
                <span className="text-[10px] text-muted-foreground">{game.owner ? "Billionaire" : "—"}</span>
                <span className="text-[10px] text-amber-400">{game.maxBet}</span>
                <span className="text-[10px] text-muted-foreground">—</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BLACKJACK — Full realistic implementation
// ═══════════════════════════════════════════════════════════════

export function CasinoBlackjackPage() {
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(100000);
  const [deck, setDeck] = useState(makeDeck());
  const [playerHand, setPlayerHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [dealerHand, setDealerHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealer" | "done">("betting");
  const [result, setResult] = useState<string>("");
  const [resultType, setResultType] = useState<"win" | "lose" | "push" | "">("");
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0, pushed: 0, biggest: 0, profit: 0 });
  const [splitAvailable, setSplitAvailable] = useState(false);
  const [doubleDownAvailable, setDoubleDownAvailable] = useState(false);
  const [insuranceAvailable, setInsuranceAvailable] = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);

  const handValue = (hand: { value: number; rank?: string }[]) => {
    let sum = hand.reduce((s, c) => s + c.value, 0);
    let aces = hand.filter(c => c.rank === "A").length;
    while (sum > 21 && aces > 0) { sum -= 10; aces--; }
    return sum;
  };

  const deal = () => {
    if ((player?.money ?? 0) < bet || bet < 10000) return;
    const d = [...deck];
    const p = [d.pop()!, d.pop()!];
    const dealer = [d.pop()!, d.pop()!];
    setDeck(d);
    setPlayerHand(p);
    setDealerHand(dealer);
    setGameState("playing");
    setResult("");
    setResultType("");
    setSplitAvailable(p[0].rank === p[1].rank && (player?.money ?? 0) >= bet);
    setDoubleDownAvailable(true);
    setInsuranceAvailable(dealer[0].rank === "A");
  };

  const hit = () => {
    const d = [...deck];
    const card = d.pop()!;
    setDeck(d);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDoubleDownAvailable(false);
    setSplitAvailable(false);
    if (handValue(newHand) > 21) {
      endRound(newHand, dealerHand, "bust");
    }
  };

  const stand = () => {
    setGameState("dealer");
    setDoubleDownAvailable(false);
    setSplitAvailable(false);
    // Dealer plays automatically
    const dh = [...dealerHand];
    let d = [...deck];
    while (handValue(dh) < 17) {
      dh.push(d.pop()!);
    }
    setDeck(d);
    setDealerHand(dh);

    const pVal = handValue(playerHand);
    const dVal = handValue(dh);
    if (dVal > 21) endRound(playerHand, dh, "dealer-bust");
    else if (pVal > dVal) endRound(playerHand, dh, "win");
    else if (pVal < dVal) endRound(playerHand, dh, "lose");
    else endRound(playerHand, dh, "push");
  };

  const doubleDown = () => {
    if ((player?.money ?? 0) < bet * 2) return;
    const d = [...deck];
    const card = d.pop()!;
    setDeck(d);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDoubleDownAvailable(false);
    setSplitAvailable(false);
    // Dealer plays after double
    const dh = [...dealerHand];
    while (handValue(dh) < 17) dh.push(d.pop()!);
    setDeck(d);
    setDealerHand(dh);

    const pVal = handValue(newHand);
    const dVal = handValue(dh);
    if (pVal > 21) endRound(newHand, dh, "bust");
    else if (dVal > 21) endRound(newHand, dh, "dealer-bust");
    else if (pVal > dVal) endRound(newHand, dh, "win");
    else if (pVal < dVal) endRound(newHand, dh, "lose");
    else endRound(newHand, dh, "push");
  };

  const buyInsurance = () => {
    setInsuranceBet(Math.floor(bet / 2));
    setInsuranceAvailable(false);
  };

  const endRound = (ph: any[], dh: any[], type: string) => {
    setGameState("done");
    const pVal = handValue(ph);
    const dVal = handValue(dh);
    let multiplier = 0;
    let label = "";
    switch (type) {
      case "bust": label = "BUST — You went over 21!"; multiplier = -1; break;
      case "dealer-bust": label = `Dealer busts with ${dVal}! You win!`; multiplier = 1; break;
      case "win": label = `You win ${pVal} vs ${dVal}!`; multiplier = 1; break;
      case "lose": label = `Dealer wins ${dVal} vs ${pVal}.`; multiplier = -1; break;
      case "push": label = `Push! Both ${pVal}.`; multiplier = 0; break;
    }
    // Natural blackjack pays 3:2
    const isBlackjack = ph.length === 2 && pVal === 21 && type !== "bust";
    if (isBlackjack && multiplier > 0) multiplier = 1.5;
    if (type === "bust") multiplier = -2; // lose doubled
    const winnings = Math.floor(bet * multiplier);
    setStats(s => ({
      ...s, played: s.played + 1, profit: s.profit + winnings,
      won: s.won + (multiplier > 0 ? 1 : 0), lost: s.lost + (multiplier < 0 ? 1 : 0), pushed: s.pushed + (multiplier === 0 ? 1 : 0),
      biggest: Math.max(s.biggest, winnings),
    }));
    setResult(`${label} ${winnings > 0 ? `+$${winnings.toLocaleString()}` : winnings < 0 ? `-$${Math.abs(winnings).toLocaleString()}` : ""}`);
    setResultType(multiplier > 0 ? "win" : multiplier < 0 ? "lose" : "push");
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;
  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🃏" title="Blackjack" sub="Beat the dealer to 21 without going over. Blackjack pays 3:2. Insurance pays 2:1." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="📊" label="Games" value={String(stats.played)} color="text-blue-400" />
        <StatPill icon="🏆" label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="text-amber-400" />
        <StatPill icon="📈" label="Profit" value={`${stats.profit >= 0 ? "+" : ""}$${stats.profit.toLocaleString()}`} color={stats.profit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      {/* Bet Controls */}
      {gameState === "betting" && (
        <div className="mafia-card rounded-xl p-4 space-y-3 border border-amber-500/20">
          <div className="text-sm font-bold text-amber-300">Place your bet</div>
          <div className="flex items-center gap-2">
            <input type="range" min={10000} max={Math.min(100000000, player.money ?? 0)} value={bet}
              onChange={(e) => setBet(Number(e.target.value))} className="flex-1" />
            <div className="w-32 bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold text-amber-300">${bet.toLocaleString()}</div>
          </div>
          <div className="flex gap-2 text-[10px] text-muted-foreground">
            <button onClick={() => setBet(10000)} className="px-2 py-1 bg-secondary rounded">Min</button>
            <button onClick={() => setBet(Math.floor((player.money ?? 0) / 4))} className="px-2 py-1 bg-secondary rounded">¼</button>
            <button onClick={() => setBet(Math.floor((player.money ?? 0) / 2))} className="px-2 py-1 bg-secondary rounded">½</button>
            <button onClick={() => setBet(player.money ?? 0)} className="px-2 py-1 bg-secondary rounded">Max</button>
          </div>
          <ActionButton onClick={deal} disabled={(player.money ?? 0) < bet || bet < 10000} color="bg-gradient-to-r from-green-600 to-emerald-600">DEAL</ActionButton>
        </div>
      )}

      {/* Dealer Hand */}
      {(gameState === "playing" || gameState === "done" || gameState === "dealer") && (
        <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-red-400">Dealer's Hand</div>
            <div className="text-sm font-black text-red-300">{gameState !== "done" && dealerHand.length < 3 ? "17+" : dealerVal}</div>
          </div>
          <div className="flex gap-2">
            {dealerHand.map((c, i) => (
              <PlayingCard key={i} card={c} hidden={i === 1 && gameState === "playing"} />
            ))}
          </div>
        </div>
      )}

      {/* Player Hand */}
      {(gameState === "playing" || gameState === "done" || gameState === "dealer") && (
        <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-amber-300">Your Hand</div>
            <div className={`text-sm font-black ${playerVal > 21 ? "text-red-400" : "text-amber-300"}`}>{playerVal}</div>
          </div>
          <div className="flex gap-2">
            {playerHand.map((c, i) => (
              <PlayingCard key={i} card={c} />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {gameState === "playing" && (
        <div className="flex gap-2">
          <ActionButton onClick={hit} color="bg-gradient-to-r from-blue-600 to-cyan-600">HIT</ActionButton>
          <ActionButton onClick={stand} color="bg-gradient-to-r from-amber-600 to-yellow-600">STAND</ActionButton>
          {doubleDownAvailable && <ActionButton onClick={doubleDown} color="bg-gradient-to-r from-purple-600 to-pink-600">DOUBLE DOWN</ActionButton>}
          {insuranceAvailable && <ActionButton onClick={buyInsurance} color="bg-gradient-to-r from-green-600 to-emerald-600">INSURANCE (${Math.floor(bet / 2).toLocaleString()})</ActionButton>}
        </div>
      )}

      {/* Result */}
      {gameState === "done" && (
        <div className={`rounded-xl border p-4 text-center transition-all ${resultType === "win" ? "border-green-500/40 bg-green-950/20" : resultType === "lose" ? "border-red-500/40 bg-red-950/20" : "border-yellow-500/40 bg-yellow-950/20"}`}>
          <div className={`text-2xl font-black mb-1 ${resultType === "win" ? "text-green-400" : resultType === "lose" ? "text-red-400" : "text-yellow-400"}`}>
            {resultType === "win" ? "🏆 BLACKJACK!" : resultType === "lose" ? "💀 BUST" : "🤝 PUSH"}
          </div>
          <div className="text-sm text-muted-foreground">{result}</div>
          <ActionButton onClick={() => setGameState("betting")} color="bg-gradient-to-r from-amber-600 to-yellow-600" >NEW HAND</ActionButton>
        </div>
      )}

      {/* Game Info */}
      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div><strong>Owner:</strong> Kaiba</div>
          <div><strong>Maxbet:</strong> $500,000,000</div>
          <div><strong>Buyback:</strong> —</div>
          <div><strong>Double Down:</strong> Available — double your bet, receive exactly one more card</div>
          <div><strong>Blackjack:</strong> Pays 3:2 (Ace + 10-value card on first two cards)</div>
          <div><strong>Insurance:</strong> Pays 2:1 if dealer shows Ace and has Blackjack</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DICE GAME — Full realistic implementation
// ═══════════════════════════════════════════════════════════════

export function CasinoDicePage() {
  const player = useQuery(api.game.getPlayer);
  const [stake, setStake] = useState(10000);
  const [sides, setSides] = useState(6);
  const [chosen, setChosen] = useState(3);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ roll: number; won: boolean } | null>(null);
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0, profit: 0, biggest: 0 });
  const [history, setHistory] = useState<{ roll: number; won: boolean; amount: number }[]>([]);
  const rollAnimRef = useRef<HTMLDivElement>(null);

  const winChance = (1 / sides) * 100;
  const payout = sides; // multiplier

  const roll = async () => {
    if ((player?.money ?? 0) < stake || rolling || stake < 1000) return;
    setRolling(true);
    setResult(null);

    // Animate dice roll
    if (rollAnimRef.current) {
      rollAnimRef.current.classList.add("animate-dice-roll");
    }

    await new Promise(r => setTimeout(r, 800));

    const r = Math.floor(Math.random() * sides) + 1;
    const won = r === chosen;
    const winnings = won ? stake * payout - stake : -stake;

    setResult({ roll: r, won });
    setStats(s => ({
      ...s, played: s.played + 1, profit: s.profit + winnings,
      won: s.won + (won ? 1 : 0), lost: s.lost + (won ? 0 : 1),
      biggest: Math.max(s.biggest, winnings),
    }));
    setHistory(h => [{ roll: r, won, amount: winnings }, ...h].slice(0, 20));
    setRolling(false);
    if (rollAnimRef.current) rollAnimRef.current.classList.remove("animate-dice-roll");
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎲" title="Dice Game" sub="Roll the dice and predict the outcome. More sides = higher payout." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="📊" label="Games" value={String(stats.played)} color="text-blue-400" />
        <StatPill icon="🏆" label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="text-amber-400" />
        <StatPill icon="📈" label="Profit" value={`${stats.profit >= 0 ? "+" : ""}$${stats.profit.toLocaleString()}`} color={stats.profit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dice Roll Area */}
        <div className="mafia-card rounded-xl p-4 space-y-3 border border-amber-500/20">
          <div className="text-sm font-bold text-amber-300">🎲 Dice Game</div>
          <div className="text-center py-4">
            <div ref={rollAnimRef} className={`text-6xl font-black ${result?.won ? "text-green-400" : result ? "text-red-400" : "text-amber-300"} transition-all`}>
              {rolling ? "🎲" : result ? result.roll : "?"}
            </div>
            {result && !rolling && (
              <div className={`text-lg font-black mt-2 ${result.won ? "text-green-400" : "text-red-400"}`}>
                {result.won ? "🏆 WIN!" : "💀 LOSS"}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Stake Amount</div>
              <input type="number" value={stake} onChange={(e) => setStake(Math.max(1000, Number(e.target.value)))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Number of Sides (+5% house edge)</div>
                <input type="number" value={sides} min={2} max={1000} onChange={(e) => setSides(Math.max(2, Math.min(1000, Number(e.target.value))))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Chosen Number</div>
                <input type="number" value={chosen} min={1} max={sides} onChange={(e) => setChosen(Math.max(1, Math.min(sides, Number(e.target.value))))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              </div>
            </div>
          </div>

          {/* Payout Info */}
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Win Chance</span>
              <span className="text-green-400 font-bold">{winChance.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Payout Multiplier</span>
              <span className="text-amber-400 font-bold">{payout}x</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Potential Win</span>
              <span className="text-green-400 font-bold">${((stake * payout) - stake).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Potential Loss</span>
              <span className="text-red-400 font-bold">-${stake.toLocaleString()}</span>
            </div>
          </div>

          <ActionButton onClick={roll} disabled={(player.money ?? 0) < stake || rolling || stake < 1000} color="bg-gradient-to-r from-green-600 to-emerald-600">
            {rolling ? "ROLLING..." : "ROLL DICE"}
          </ActionButton>
        </div>

        {/* History */}
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-xs font-bold text-slate-300 mb-2">Recent Rolls</div>
            {history.length === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-4">No rolls yet</div>
            ) : (
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-[10px] ${h.won ? "bg-green-950/20 border border-green-500/20" : "bg-red-950/20 border border-red-500/20"}`}>
                    <span className="font-bold">{h.roll}</span>
                    <span className={h.won ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                      {h.won ? `+$${h.amount.toLocaleString()}` : `-$${Math.abs(h.amount).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
            <div className="text-xs font-bold mb-1">ℹ️ Information</div>
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              <div><strong>Maxbet:</strong> Unlimited</div>
              <div><strong>Buyback:</strong> —</div>
              <div><strong>House Edge:</strong> ~5%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROULETTE — Full realistic implementation
// ═══════════════════════════════════════════════════════════════

export function CasinoRoulettePage() {
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(50000);
  const [betType, setBetType] = useState<"red" | "black" | "green" | number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ number: number; color: string } | null>(null);
  const [stats, setStats] = useState<{ played: number; won: number; lost: number; profit: number; last10: number[] }>({ played: 0, won: 0, lost: 0, profit: 0, last10: [] });
  const [history, setHistory] = useState<{ number: number; color: string; betOn: string; won: boolean; amount: number }[]>([]);
  const [rotation, setRotation] = useState(0);

  const numberColors: Record<number, string> = {};
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const greenNumbers = [0];
  for (let i = 0; i <= 36; i++) {
    numberColors[i] = greenNumbers.includes(i) ? "green" : redNumbers.includes(i) ? "red" : "black";
  }

  const spin = async () => {
    if ((player?.money ?? 0) < bet || spinning || !betType || bet < 10000) return;
    setSpinning(true);
    setResult(null);

    // Spin animation
    const num = Math.floor(Math.random() * 37);
    const color = numberColors[num];
    const targetRotation = rotation + 1440 + (num / 37) * 360; // 4 full spins + offset
    setRotation(targetRotation);

    await new Promise(r => setTimeout(r, 4000));

    let won = false;
    if (typeof betType === "string") {
      won = betType === color;
    } else {
      won = betType === num;
    }

    const winnings = won ? (typeof betType === "number" ? bet * 35 : bet * (betType === "green" ? 14 : 2)) : -bet;
    setResult({ number: num, color });
    setStats(s => ({
      ...s, played: s.played + 1, profit: s.profit + winnings,
      won: s.won + (won ? 1 : 0), lost: s.lost + (won ? 0 : 1),
      last10: [...s.last10, num].slice(-10),
    }));
    setHistory(h => [{ number: num, color, betOn: typeof betType === "string" ? betType : String(betType), won, amount: winnings }, ...h].slice(0, 30));
    setSpinning(false);
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎡" title="Roulette" sub="Choose a spot & enter amount. The wheel spins for 4 seconds." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="📊" label="Games" value={String(stats.played)} color="text-blue-400" />
        <StatPill icon="🏆" label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="text-amber-400" />
        <StatPill icon="📈" label="Profit" value={`${stats.profit >= 0 ? "+" : ""}$${stats.profit.toLocaleString()}`} color={stats.profit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      {/* Roulette Wheel */}
      <div className="mafia-card rounded-xl p-6 border border-amber-500/20">
        <div className="text-center mb-4">
          <div className="relative w-40 h-40 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 bg-slate-900" style={{ transform: `rotate(${rotation}deg)`, transition: "transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)" }}>
              {Array.from({ length: 37 }, (_, i) => (
                <div key={i} className="absolute w-2 h-6 rounded-sm" style={{
                  transform: `rotate(${(i / 37) * 360}deg) translateY(-60px)`,
                  backgroundColor: numberColors[i] === "red" ? "#ef4444" : numberColors[i] === "green" ? "#22c55e" : "#374151",
                  transformOrigin: "center 80px",
                }} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {result ? (
                <div className={`text-4xl font-black ${result.color === "red" ? "text-red-400" : result.color === "green" ? "text-green-400" : "text-slate-300"}`}>
                  {result.number}
                </div>
              ) : (
                <div className="text-2xl text-muted-foreground">🎡</div>
              )}
            </div>
          </div>
        </div>

        {/* Last 10 numbers */}
        <div className="flex justify-center gap-1 mb-4">
          {stats.last10.map((n, i) => (
            <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${numberColors[n] === "red" ? "bg-red-500/20 text-red-400 border border-red-500/30" : numberColors[n] === "green" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-slate-700/20 text-slate-300 border border-slate-600/30"}`}>
              {n}
            </div>
          ))}
        </div>

        {/* Bet Controls */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setBetType("red")} className={`py-3 rounded-xl font-bold border transition-all ${betType === "red" ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"}`}>
              🔴 Red
            </button>
            <button onClick={() => setBetType("black")} className={`py-3 rounded-xl font-bold border transition-all ${betType === "black" ? "bg-slate-800 text-white border-slate-600 shadow-lg shadow-slate-500/30" : "bg-slate-700/10 text-slate-300 border-slate-600/30 hover:bg-slate-700/20"}`}>
              ⚫ Black
            </button>
            <button onClick={() => setBetType("green")} className={`py-3 rounded-xl font-bold border transition-all ${betType === "green" ? "bg-green-600 text-white border-green-400 shadow-lg shadow-green-500/30" : "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"}`}>
              🟢 Green (35x)
            </button>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Bet Amount</div>
            <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>

          <ActionButton onClick={spin} disabled={(player.money ?? 0) < bet || spinning || !betType || bet < 10000} color="bg-gradient-to-r from-green-600 to-emerald-600">
            {spinning ? "🎡 SPINNING..." : "SPIN!"}
          </ActionButton>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
          <div className="text-xs font-bold mb-2">Bet History</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className={`flex items-center justify-between p-1.5 rounded text-[10px] ${h.won ? "bg-green-950/10" : "bg-red-950/10"}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${h.color === "red" ? "bg-red-500/30 text-red-400" : h.color === "green" ? "bg-green-500/30 text-green-400" : "bg-slate-700/30 text-slate-300"}`}>{h.number}</span>
                  <span className="text-muted-foreground">Bet on: {h.betOn}</span>
                </div>
                <span className={h.won ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {h.won ? `+$${h.amount.toLocaleString()}` : `-$${Math.abs(h.amount).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div><strong>Owner:</strong> XMatt</div>
          <div><strong>Maxbet:</strong> $500,000</div>
          <div><strong>Buyback:</strong> —</div>
          <div><strong>Red/Black:</strong> Pays 2:1</div>
          <div><strong>Green:</strong> Pays 35:1 (rare!)</div>
          <div><strong>Number:</strong> Pays 35:1</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RACETRACK — Full realistic implementation
// ═══════════════════════════════════════════════════════════════

export function CasinoRacetrackPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [bet, setBet] = useState(50000);
  const [racing, setRacing] = useState(false);
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [winner, setWinner] = useState<number | null>(null);
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0, profit: 0 });
  const [history, setHistory] = useState<{ winner: number; bet: number; won: boolean; amount: number }[]>([]);
  const raceRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const horses = [
    { name: "Red Baron", odds: "EVENS", color: "bg-red-500", chance: 35 },
    { name: "Blue Thunder", odds: "2/1", color: "bg-blue-500", chance: 25 },
    { name: "Green Storm", odds: "4/1", color: "bg-green-500", chance: 15 },
    { name: "Gold Rush", odds: "6/1", color: "bg-yellow-500", chance: 10 },
    { name: "White Lightning", odds: "12/1", color: "bg-white", chance: 6 },
    { name: "Pink Phantom", odds: "20/1", color: "bg-pink-500", chance: 5 },
    { name: "Black Shadow", odds: "40/1", color: "bg-slate-900 border border-slate-700", chance: 4 },
  ];

  const multipliers = [2, 3, 5, 7, 13, 21, 41];

  const race = () => {
    if ((player?.money ?? 0) < bet || racing || selectedHorse === null || bet < 10000) return;
    setRacing(true);
    setWinner(null);
    setPositions([0, 0, 0, 0, 0, 0, 0]);

    // Determine winner based on weighted chances
    const rand = Math.random() * 100;
    let cumulative = 0;
    let winnerIdx = 0;
    for (let i = 0; i < horses.length; i++) {
      cumulative += horses[i].chance;
      if (rand < cumulative) { winnerIdx = i; break; }
    }

    // Animate
    const pos = [0, 0, 0, 0, 0, 0, 0];
    let tick = 0;
    raceRef.current = setInterval(() => {
      tick++;
      for (let i = 0; i < 7; i++) {
        if (pos[i] < 100) {
          const speed = i === winnerIdx ? (0.8 + Math.random() * 0.6) : (0.3 + Math.random() * 0.5);
          pos[i] = Math.min(100, pos[i] + speed * (1 + Math.random() * 0.5));
        }
      }
      setPositions([...pos]);
      if (pos.every((p) => p >= 100) || tick > 200) {
        clearInterval(raceRef.current);
        pos[winnerIdx] = 100;
        setPositions([...pos]);
        setWinner(winnerIdx);
        setRacing(false);

        const won = selectedHorse === winnerIdx;
        const multiplier = multipliers[selectedHorse];
        const winnings = won ? bet * multiplier - bet : -bet;
        setStats(s => ({
          ...s, played: s.played + 1, profit: s.profit + winnings,
          won: s.won + (won ? 1 : 0), lost: s.lost + (won ? 0 : 1),
        }));
        setHistory(h => [{ winner: winnerIdx, bet, won, amount: winnings }, ...h].slice(0, 20));
      }
    }, 50);
  };

  useEffect(() => { return () => { if (raceRef.current) clearInterval(raceRef.current); }; }, []);

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🏇" title="Racetrack" sub="Pick your horse, place your bet. 7 horses, weighted odds. Race runs for ~10 seconds." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="📊" label="Races" value={String(stats.played)} color="text-blue-400" />
        <StatPill icon="🏆" label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="text-amber-400" />
        <StatPill icon="📈" label="Profit" value={`${stats.profit >= 0 ? "+" : ""}$${stats.profit.toLocaleString()}`} color={stats.profit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      {/* Race Track */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/20 space-y-2">
        <div className="text-xs font-bold text-amber-300 mb-2">🏇 Race Track</div>
        {horses.map((h, i) => (
          <div key={i} className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-20 text-[10px] font-bold ${selectedHorse === i ? "text-amber-300" : "text-muted-foreground"}`}>{h.name}</span>
              <span className={`text-[9px] font-bold ${h.color === "bg-slate-900" ? "text-slate-400" : "text-slate-300"}`}>{h.odds}</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
              <div className={`h-full ${h.color} rounded-full transition-all duration-100`} style={{ width: `${positions[i]}%` }} />
            </div>
            {winner === i && <div className="absolute right-0 top-0 text-[10px] text-green-400 font-bold">🏆</div>}
          </div>
        ))}
      </div>

      {/* Bet Controls */}
      <div className="mafia-card rounded-xl p-4 border border-slate-700/30 space-y-3">
        <div className="text-xs font-bold text-slate-300">Place Your Bet</div>
        <div className="grid grid-cols-7 gap-1">
          {horses.map((h, i) => (
            <button key={i} onClick={() => setSelectedHorse(i)}
              className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${selectedHorse === i ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-slate-900/50 border-slate-700/30 text-slate-500 hover:border-slate-600"}`}>
              <div className={`w-3 h-3 rounded-full ${h.color} mx-auto mb-0.5`} />
              {h.odds}
            </button>
          ))}
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Bet Amount</div>
          <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="flex gap-2">
          {[10000, 100000, 1000000].map(amt => (
            <button key={amt} onClick={() => setBet(amt)} className="px-3 py-1 bg-secondary rounded-lg text-[10px]">${(amt / 1000).toFixed(0)}K</button>
          ))}
        </div>
        <ActionButton onClick={race} disabled={(player.money ?? 0) < bet || racing || selectedHorse === null || bet < 10000} color="bg-gradient-to-r from-green-600 to-emerald-600">
          {racing ? "🏇 RACING..." : selectedHorse !== null ? `BET ON ${horses[selectedHorse].name.toUpperCase()} — ${horses[selectedHorse].odds}` : "SELECT A HORSE"}
        </ActionButton>
      </div>

      {/* Result */}
      {winner !== null && !racing && (
        <div className={`rounded-xl border p-4 text-center ${selectedHorse === winner ? "border-green-500/40 bg-green-950/20" : "border-red-500/40 bg-red-950/20"}`}>
          <div className={`text-xl font-black mb-1 ${selectedHorse === winner ? "text-green-400" : "text-red-400"}`}>
            {selectedHorse === winner ? "🏆 YOU WIN!" : `${horses[winner].name} wins!`}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedHorse === winner
              ? `+$${(bet * multipliers[selectedHorse] - bet).toLocaleString()} (${multipliers[selectedHorse]}x)`
              : `-$${bet.toLocaleString()}`}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
          <div className="text-xs font-bold mb-2">Race History</div>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className={`flex items-center justify-between p-1.5 rounded text-[10px] ${h.won ? "bg-green-950/10" : "bg-red-950/10"}`}>
                <span className="text-muted-foreground">{h.won ? "🏆" : "💀"} {h.won ? "Won" : "Lost"}</span>
                <span className={h.won ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {h.won ? `+$${h.amount.toLocaleString()}` : `-$${Math.abs(h.amount).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div><strong>Owner:</strong> Sinapse</div>
          <div><strong>Maxbet:</strong> $1,000,000,000</div>
          <div><strong>Buyback:</strong> —</div>
          <div><strong>House Edge:</strong> ~5%</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VIDEO POKER — Full realistic implementation
// ═══════════════════════════════════════════════════════════════

export function CasinoVideoPokerPage() {
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(50000);
  const [hand, setHand] = useState<{ suit: string; rank: string; value: number }[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [gameState, setGameState] = useState<"bet" | "dealt" | "drawn" | "done">("bet");
  const [result, setResult] = useState<string>("");
  const [resultMult, setResultMult] = useState(0);
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0, profit: 0 });

  const paytable = [
    { name: "Royal Flush", mult: 100, icon: "👑", desc: "A K Q J 10 of same suit" },
    { name: "Straight Flush", mult: 22, icon: "🃏", desc: "5 consecutive same suit" },
    { name: "Four of a Kind", mult: 15, icon: "4️⃣", desc: "4 cards same rank" },
    { name: "Full House", mult: 7, icon: "🏠", desc: "3 of a kind + pair" },
    { name: "Flush", mult: 4.5, icon: "💎", desc: "5 cards same suit" },
    { name: "Straight", mult: 3.5, icon: "📈", desc: "5 consecutive ranks" },
    { name: "Three of a Kind", mult: 2.5, icon: "3️⃣", desc: "3 cards same rank" },
    { name: "Two Pair", mult: 1.75, icon: "2️⃣", desc: "2 different pairs" },
    { name: "Jacks or Better", mult: 1.25, icon: "🂡", desc: "Pair of Jacks+" },
    { name: "Nothing", mult: 0, icon: "❌", desc: "No winning hand" },
  ];

  const evaluateHand = (cards: { rank: string; suit: string }[]) => {
    const counts: Record<string, number> = {};
    const suits: Record<string, number> = {};
    cards.forEach(c => { counts[c.rank] = (counts[c.rank] ?? 0) + 1; suits[c.suit] = (suits[c.suit] ?? 0) + 1; });
    const values = Object.values(counts).sort((a, b) => b - a);
    const uniqueSuits = Object.keys(suits).length;
    const ranks = RANKS;
    const handValues = cards.map(c => ranks.indexOf(c.rank)).sort((a, b) => a - b);
    const isSequential = handValues.every((v, i) => i === 0 || v === handValues[i - 1] + 1);
    const hasAce = cards.some(c => c.rank === "A");
    const isRoyalFlush = uniqueSuits === 1 && isSequential && hasAce && handValues[4] === ranks.indexOf("K");
    const isStraightFlush = uniqueSuits === 1 && isSequential;
    const isFlush = uniqueSuits === 1;
    const isStraight = isSequential || (isAceLow(cards));

    if (isRoyalFlush) return "Royal Flush";
    if (isStraightFlush) return "Straight Flush";
    if (values[0] === 4) return "Four of a Kind";
    if (values[0] === 3 && values[1] === 2) return "Full House";
    if (isFlush) return "Flush";
    if (isStraight) return "Straight";
    if (values[0] === 3) return "Three of a Kind";
    if (values[0] === 2 && values.filter(v => v === 2).length === 2) return "Two Pair";
    // Jacks or better check
    const pairRanks = Object.entries(counts).filter(([, c]) => c === 2).map(([r]) => ranks.indexOf(r));
    if (pairRanks.some(r => r >= 9)) return "Jacks or Better"; // J=9, Q=10, K=11, A=0
    return "Nothing";
  };

  const isAceLow = (cards: { rank: string }[]) => {
    const ranks = cards.map(c => c.rank).sort();
    return ranks.join(",") === ["A", "2", "3", "4", "5"].join(",");
  };

  const deal = () => {
    if ((player?.money ?? 0) < bet || bet < 50000) return;
    const d = makeDeck();
    const newHand = d.splice(0, 5);
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setGameState("dealt");
    setResult("");
    setResultMult(0);
  };

  const toggleHold = (idx: number) => {
    if (gameState !== "dealt") return;
    const h = [...held];
    h[idx] = !h[idx];
    setHeld(h);
  };

  const draw = () => {
    if (gameState !== "dealt") return;
    const newHand = [...hand];
    const d = makeDeck();
    let di = 0;
    for (let i = 0; i < 5; i++) {
      if (!held[i]) { newHand[i] = d[di++]; }
    }
    setHand(newHand);
    setGameState("done");

    const handName = evaluateHand(newHand);
    const pt = paytable.find(p => p.name === handName)!;
    setResultMult(pt.mult);
    setResult(handName);

    const winnings = Math.floor(bet * pt.mult) - bet;
    setStats(s => ({
      ...s, played: s.played + 1, profit: s.profit + winnings,
      won: s.won + (pt.mult > 0 ? 1 : 0), lost: s.lost + (pt.mult > 0 ? 0 : 1),
    }));
    setGameState("drawn");
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🂡" title="Video Poker" sub="Place your bet, hold your cards, and draw." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="📊" label="Games" value={String(stats.played)} color="text-blue-400" />
        <StatPill icon="🏆" label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="text-amber-400" />
        <StatPill icon="📈" label="Profit" value={`${stats.profit >= 0 ? "+" : ""}$${stats.profit.toLocaleString()}`} color={stats.profit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      {/* Hand Display */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="text-[10px] text-muted-foreground text-center mb-2">{
          gameState === "dealt" ? "Tap cards to HOLD, then DRAW" :
          gameState === "drawn" ? result : "Place your bet to play"
        }</div>
        <div className="flex justify-center gap-3 mb-4">
          {hand.map((c, i) => (
            <div key={i} className={`cursor-pointer transition-all ${held[i] ? "scale-110 -translate-y-2" : ""}`} onClick={() => toggleHold(i)}>
              <PlayingCard card={c} />
              {gameState === "dealt" && <div className={`text-center text-[8px] mt-1 font-bold ${held[i] ? "text-green-400" : "text-muted-foreground"}`}>{held[i] ? "HELD" : "HOLD"}</div>}
            </div>
          ))}
          {hand.length === 0 && [1, 2, 3, 4, 5].map(i => <div key={i} className="w-14 h-20 rounded-lg bg-slate-800 border border-slate-700" />)}
        </div>

        {/* Result */}
        {gameState === "drawn" && resultMult > 0 && (
          <div className="text-center mb-3">
            <div className="text-lg font-black text-amber-300">{paytable.find(p => p.name === result)?.icon} {result}!</div>
            <div className="text-sm text-green-400 font-bold">+${(bet * resultMult).toLocaleString()} ({resultMult}x)</div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {gameState === "bet" && (
            <div className="flex items-center gap-2">
              <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={50000} className="w-32 bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <ActionButton onClick={deal} disabled={(player.money ?? 0) < bet || bet < 50000} color="bg-gradient-to-r from-green-600 to-emerald-600">DEAL</ActionButton>
            </div>
          )}
          {gameState === "dealt" && (
            <ActionButton onClick={draw} color="bg-gradient-to-r from-amber-600 to-yellow-600">DRAW</ActionButton>
          )}
          {(gameState === "done" || gameState === "drawn") && (
            <ActionButton onClick={() => setGameState("bet")} color="bg-gradient-to-r from-amber-600 to-yellow-600">NEW HAND</ActionButton>
          )}
        </div>
      </div>

      {/* Paytable */}
      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="text-xs font-bold mb-2">Paytable</div>
        <div className="space-y-1">
          {paytable.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span>{p.icon}</span>
                <span className="text-muted-foreground">{p.name}</span>
              </div>
              <span className="font-bold text-amber-400">{p.mult > 0 ? `${p.mult}x` : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCRATCHCARDS — Full realistic implementation
// ═══════════════════════════════════════════════════════════════

export function CasinoScratchcardsPage() {
  const player = useQuery(api.game.getPlayer);
  const [cardType, setCardType] = useState<"cash" | "points" | "lucky" | "coins">("cash");
  const [card, setCard] = useState<{ symbol: string; label: string; prize: number }[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [scratching, setScratching] = useState(false);
  const [result, setResult] = useState<string>("");
  const [totalWon, setTotalWon] = useState(0);
  const [stats, setStats] = useState({ played: 0, won: 0, lost: 0, profit: 0 });

  const cardTypes = {
    cash: { name: "Cash Scratchcard", cost: "10 Laptops", costDisplay: "10 Laptops", icon: "💰", prizes: [
      { symbol: "💎", label: "Jackpot", prize: 6000000, chance: 0.8 },
      { symbol: "🏆", label: "Gold", prize: 1200000, chance: 5 },
      { symbol: "💰", label: "Cash", prize: 600000, chance: 17.5 },
      { symbol: "🪙", label: "Coin", prize: 500000, chance: 3.8 },
      { symbol: "📦", label: "Small", prize: 250000, chance: 20 },
      { symbol: "💀", label: "Tiny", prize: 18000000, chance: 1.8 },
      { symbol: "❌", label: "Nothing", prize: 0, chance: 51.9 },
    ]},
    points: { name: "Points Scratchcard", cost: "10 Stolen Art", icon: "⭐", prizes: [
      { symbol: "⭐", label: "Grand", prize: 60, chance: 0.8 },
      { symbol: "⭐", label: "Star", prize: 45, chance: 1.8 },
      { symbol: "⭐", label: "Medium", prize: 30, chance: 5 },
      { symbol: "⭐", label: "Small", prize: 20, chance: 17.5 },
      { symbol: "❌", label: "Nothing", prize: 0, chance: 74.9 },
    ]},
    lucky: { name: "Lucky Dip", cost: "10 Gold Bars", icon: "🎰", prizes: [
      { symbol: "💎", label: "Legendary Car", prize: 0, chance: 0.2 },
      { symbol: "📦", label: "Common Pack", prize: 0, chance: 0.2 },
      { symbol: "⭐", label: "100 Points", prize: 100, chance: 0.3 },
      { symbol: "💰", label: "$30M", prize: 30000000, chance: 8.6 },
      { symbol: "🪙", label: "5 IG Coins", prize: 0, chance: 1.7 },
      { symbol: "❌", label: "Nothing", prize: 0, chance: 89.0 },
    ]},
    coins: { name: "IG Coin Scratchcard", cost: "10 Coin Tokens", icon: "🪙", prizes: [
      { symbol: "🪙", label: "Jackpot", prize: 40, chance: 1.7 },
      { symbol: "🪙", label: "Gold", prize: 100, chance: 1.7 },
      { symbol: "🪙", label: "Silver", prize: 75, chance: 8.6 },
      { symbol: "🪙", label: "Bronze", prize: 50, chance: 3.4 },
      { symbol: "❌", label: "Nothing", prize: 0, chance: 84.6 },
    ]},
  };

  const scratch = () => {
    const ct = cardTypes[cardType];
    const symbols = ct.prizes.map(p => ({ ...p }));
    // Build weighted deck
    const deck: { symbol: string; label: string; prize: number }[] = [];
    for (const p of ct.prizes) {
      const count = Math.round(p.chance * 10);
      for (let i = 0; i < count; i++) deck.push({ symbol: p.symbol, label: p.label, prize: p.prize });
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const newCard = deck.slice(0, 9);
    setCard(newCard);
    setRevealed(new Array(9).fill(false));
    setScratching(false);
    setResult("");
  };

  const revealNext = async () => {
    if (!card) return;
    const idx = revealed.findIndex(r => !r);
    if (idx === -1) return;
    const newRevealed = [...revealed];
    newRevealed[idx] = true;
    setRevealed(newRevealed);

    // Check if all revealed
    if (newRevealed.every(Boolean)) {
      const revealedCards = card.filter((_, i) => newRevealed[i]);
      const matchingCount = revealedCards.filter(c => c.symbol === revealedCards[0].symbol && c.symbol !== "❌").length;
      if (matchingCount >= 3) {
        const total = revealedCards.filter(c => c.symbol !== "❌").reduce((s, c) => s + c.prize, 0);
        setResult(`Matching ${matchingCount}! You win $${total.toLocaleString()}`);
        setTotalWon(total);
      } else {
        setResult("No matching symbols. Try again!");
        setTotalWon(0);
      }
      setScratching(true);
      setStats(s => ({ ...s, played: s.played + 1, won: s.won + (totalWon > 0 ? 1 : 0), profit: s.profit + totalWon }));
    }
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎫" title="Scratchcards" sub="Scratch to reveal prizes. Match 3+ of the same symbol to win!" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon="💰" label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill icon="📊" label="Played" value={String(stats.played)} color="text-blue-400" />
        <StatPill icon="🏆" label="Won" value={String(stats.won)} color="text-amber-400" />
        <StatPill icon="📈" label="Profit" value={`${stats.profit >= 0 ? "+" : ""}$${stats.profit.toLocaleString()}`} color={stats.profit >= 0 ? "text-green-400" : "text-red-400"} />
      </div>

      {/* Card Type Selector */}
      <div className="grid grid-cols-4 gap-2">
        {(["cash", "points", "lucky", "coins"] as const).map((t) => (
          <button key={t} onClick={() => { setCardType(t); setCard(null); setRevealed([]); setResult(""); }}
            className={`p-3 rounded-xl text-center border transition-all ${cardType === t ? "border-amber-500/50 bg-amber-950/30" : "border-slate-700/30 bg-slate-900/30 hover:border-slate-600"}`}>
            <div className="text-xl">{cardTypes[t].icon}</div>
            <div className="text-[10px] font-bold capitalize">{t}</div>
          </button>
        ))}
      </div>

      {/* Scratchcard */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="text-sm font-bold text-amber-300 mb-1">{cardTypes[cardType].name}</div>
        <div className="text-[10px] text-muted-foreground mb-3">Cost: {cardTypes[cardType].cost}</div>

        {!card ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎫</div>
            <ActionButton onClick={scratch} color="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">Buy Scratchcard</ActionButton>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {card.map((c, i) => (
                <button key={i} onClick={() => { if (!revealed[i] && !scratching) revealNext(); }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${revealed[i] ? "bg-white/10 border border-amber-500/30 shadow-lg" : "bg-slate-800 border border-slate-700 cursor-pointer hover:border-amber-500/30 hover:bg-slate-700"}`}>
                  {revealed[i] ? (
                    <>
                      <span className="text-2xl">{c.symbol}</span>
                      <span className="text-[8px] text-muted-foreground">{c.label}</span>
                    </>
                  ) : (
                    <span className="text-xl text-slate-600">?</span>
                  )}
                </button>
              ))}
            </div>
            {!scratching && (
              <div className="text-center text-[10px] text-muted-foreground">
                {revealed.filter(Boolean).length}/{revealed.length} revealed — tap to scratch
              </div>
            )}
            {result && (
              <div className="text-center p-3 rounded-xl bg-amber-950/30 border border-amber-500/20">
                <div className="text-sm font-bold text-amber-300">{result}</div>
                {totalWon > 0 && <div className="text-lg font-black text-green-400">+${totalWon.toLocaleString()}</div>}
              </div>
            )}
            {scratching && (
              <div className="text-center">
                <ActionButton onClick={() => { setCard(null); setResult(""); }} color="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">New Card</ActionButton>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prize Table */}
      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="text-xs font-bold mb-2">Available Prizes — {cardTypes[cardType].name}</div>
        <div className="space-y-1 text-[10px]">
          {cardTypes[cardType].prizes.filter(p => p.prize > 0 || p.chance > 5).map((p, i) => (
            <div key={i} className="flex justify-between items-center p-1.5 rounded bg-slate-900/30">
              <div className="flex items-center gap-2">
                <span>{p.symbol}</span>
                <span className="text-muted-foreground">{p.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">{p.prize > 0 ? `$${p.prize.toLocaleString()}` : "—"}</span>
                <span className="text-slate-500">{p.chance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

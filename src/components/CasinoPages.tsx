import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const CITIES = [
  { name: "New York", cost: 500000, icon: "🗽", color: "from-rose-500/20 to-pink-600/10", border: "border-rose-500/30" },
  { name: "Los Angeles", cost: 400000, icon: "🌴", color: "from-orange-500/20 to-red-600/10", border: "border-orange-500/30" },
  { name: "Chicago", cost: 300000, icon: "🏙️", color: "from-amber-500/20 to-orange-600/10", border: "border-amber-500/30" },
  { name: "Miami", cost: 600000, icon: "🏖️", color: "from-red-500/20 to-rose-600/10", border: "border-red-500/30" },
  { name: "Las Vegas", cost: 1000000, icon: "🎰", color: "from-yellow-500/20 to-amber-600/10", border: "border-yellow-500/30" },
  { name: "London", cost: 750000, icon: "🇬🇧", color: "from-purple-500/20 to-violet-600/10", border: "border-purple-500/30" },
  { name: "Tokyo", cost: 800000, icon: "🗼", color: "from-pink-500/20 to-red-600/10", border: "border-pink-500/30" },
  { name: "Berlin", cost: 500000, icon: "🇩🇪", color: "from-blue-500/20 to-cyan-600/10", border: "border-blue-500/30" },
  { name: "Sydney", cost: 700000, icon: "🦘", color: "from-cyan-500/20 to-sky-600/10", border: "border-cyan-500/30" },
  { name: "Dubai", cost: 1500000, icon: "🕌", color: "from-indigo-500/20 to-blue-600/10", border: "border-indigo-500/30" },
];

const CASINO_GAMES = [
  { name: "Blackjack", icon: "🃏", desc: "Classic 21 - beat the dealer without busting", page: "casino_blackjack", minBet: 10000, maxBet: 500000000, owner: null },
  { name: "Dice Game", icon: "🎲", desc: "Roll dice and predict the outcome", page: "casino_dice", minBet: 1000, maxBet: 999999999, owner: null },
  { name: "Roulette", icon: "🎡", desc: "Spin the wheel - red, black, or green?", page: "casino_roulette", minBet: 50000, maxBet: 500000000, owner: null, purchaseCost: 150000000 },
  { name: "Racetrack", icon: "🏇", desc: "Bet on horse racing with real odds", page: "casino_racetrack", minBet: 10000, maxBet: 1000000000, owner: null },
  { name: "Video Poker", icon: "🂡", desc: "Play video poker with multiplier payouts", page: "casino_videopoker", minBet: 50000, maxBet: 999999999, owner: null },
];

function PageHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-2xl font-bold mafia-gold">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "text-slate-200" }: { label: string; value: string; color?: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}

function ActionButton({ onClick, disabled, children, color = "bg-amber-600 hover:bg-amber-500" }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}>
      {children}
    </button>
  );
}

// ═══ CASINOS OVERVIEW ═══
export function CasinosPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader icon="🎰" title="Casinos" sub="Every city has casinos — own them, play them, or lose them." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Your Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Bank Balance" value={`$${(player.bank ?? 0).toLocaleString()}`} color="text-blue-400" />
        <StatPill label="Casino Bank" value={`$${((player as any).casinoBank ?? 0).toLocaleString()}`} color="text-amber-400" />
        <StatPill label="Location" value={player.location ?? "Unknown"} color="text-purple-400" />
      </div>

      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="text-sm font-bold mb-1">💰 Casino Bank Account</div>
        <div className="text-[10px] text-muted-foreground mb-3">Casinos require a minimum balance. If your casino bank runs dry, you lose the casino!</div>
        <div className="text-xs text-amber-300">⚠️ Keep your casino bank funded — if it hits $0, the casino is seized.</div>
      </div>

      {!selectedCity ? (
        <div className="space-y-3">
          <div className="text-sm font-bold text-amber-300">🏙️ Select a City</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CITIES.map((city) => (
              <div key={city.name} onClick={() => setSelectedCity(city.name)}
                className={`bg-gradient-to-r ${city.color} border ${city.border} rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all`}>
                <div className="text-2xl mb-1">{city.icon}</div>
                <div className="text-sm font-bold">{city.name}</div>
                <div className="text-[10px] text-muted-foreground">Casino cost: ${(city.cost).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setSelectedCity(null)} className="px-3 py-1 bg-secondary rounded-lg text-xs hover:bg-secondary/80">← Back to Cities</button>
          <div className="text-sm font-bold text-amber-300">🎰 Casinos in {selectedCity}</div>
          <div className="space-y-2">
            {CASINO_GAMES.map((game) => (
              <div key={game.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
                <span className="text-3xl">{game.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{game.name}</div>
                  <div className="text-[10px] text-muted-foreground">{game.desc}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Min: ${game.minBet.toLocaleString()} · Max: ${game.maxBet.toLocaleString()}</div>
                </div>
                {game.purchaseCost ? (
                  <ActionButton color={(player.money ?? 0) >= game.purchaseCost ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-slate-800 text-slate-500"}>
                    Purchase ${(game.purchaseCost).toLocaleString()}
                  </ActionButton>
                ) : (
                  <ActionButton>Play</ActionButton>
                )}
                <div className="text-[9px] text-muted-foreground">Owner: {game.owner ?? "None"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ BLACKJACK ═══
export function CasinoBlackjackPage() {
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(100000);
  const [hand, setHand] = useState<{ player: number[]; dealer: number[] } | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const cardValue = (cards: number[]) => {
    let sum = cards.reduce((a, b) => a + b, 0);
    let aces = cards.filter((c) => c === 11).length;
    while (sum > 21 && aces > 0) { sum -= 10; aces--; }
    return sum;
  };

  const drawCard = () => Math.floor(Math.random() * 11) + 1;

  const deal = () => {
    if ((player?.money ?? 0) < bet) return;
    const p = [drawCard(), drawCard()];
    const d = [drawCard(), drawCard()];
    setHand({ player: p, dealer: d });
    setResult(null);
  };

  const stand = () => {
    if (!hand) return;
    let d = [...hand.dealer];
    while (cardValue(d) < 17) d.push(drawCard());
    const pVal = cardValue(hand.player);
    const dVal = cardValue(d);
    setHand({ ...hand, dealer: d });
    if (pVal > 21) setResult("BUST - You lose!");
    else if (dVal > 21) setResult(`Dealer busts! You win +$${bet.toLocaleString()}`);
    else if (pVal > dVal) setResult(`You win! +$${bet.toLocaleString()}`);
    else if (pVal < dVal) setResult("Dealer wins!");
    else setResult("Push - Tie!");
  };

  const hit = () => {
    if (!hand) return;
    const p = [...hand.player, drawCard()];
    if (cardValue(p) > 21) { setHand({ ...hand, player: p }); setResult("BUST - You lose!"); }
    else setHand({ ...hand, player: p });
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🃏" title="Blackjack" sub="Beat the dealer to 21 without going over" />
      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Win Rate" value="0%" color="text-amber-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Place your bet</div>
        <input type="range" min={1000} max={Math.min(100000000, player.money ?? 0)} value={bet}
          onChange={(e) => setBet(Number(e.target.value))} className="w-full" />
        <div className="text-center text-sm font-bold text-primary">${bet.toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton onClick={deal} disabled={(player.money ?? 0) < bet} color="bg-gradient-to-r from-green-500 to-emerald-500">Deal</ActionButton>
          <ActionButton onClick={stand} disabled={!hand || !!result}>Stand</ActionButton>
          <ActionButton onClick={hit} disabled={!hand || !!result}>Hit</ActionButton>
        </div>
      </div>
      {hand && (
        <div className="mafia-card rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-green-400 mb-2">Your Hand ({cardValue(hand.player)})</div>
              <div className="flex gap-1">
                {hand.player.map((c, i) => (
                  <div key={i} className="w-10 h-14 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-black shadow-md">{c}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-red-400 mb-2">Dealer ({cardValue(hand.dealer)})</div>
              <div className="flex gap-1">
                {hand.dealer.map((c, i) => (
                  <div key={i} className="w-10 h-14 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-black shadow-md">{c}</div>
                ))}
              </div>
            </div>
          </div>
          {result && <div className={`mt-3 text-sm font-bold text-center ${result.includes("win") || result.includes("Win") ? "text-green-400" : result.includes("Push") ? "text-yellow-400" : "text-red-400"}`}>{result}</div>}
        </div>
      )}
      <div className="mafia-card rounded-xl p-3">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div><strong>Maxbet:</strong> $100,000,000</div>
          <div><strong>Double Down:</strong> Available</div>
        </div>
      </div>
    </div>
  );
}

// ═══ DICE GAME ═══
export function CasinoDicePage() {
  const player = useQuery(api.game.getPlayer);
  const [stake, setStake] = useState(1000);
  const [sides, setSides] = useState(6);
  const [chosen, setChosen] = useState(3);
  const [result, setResult] = useState<{ roll: number; won: boolean } | null>(null);

  const roll = () => {
    if ((player?.money ?? 0) < stake) return;
    const r = Math.floor(Math.random() * sides) + 1;
    setResult({ roll: r, won: r === chosen });
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎲" title="Dice Game" sub="Roll the dice and predict the outcome" />
      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Win Rate" value="0%" color="text-amber-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Dice Game</div>
        <div>
          <div className="text-[10px] text-muted-foreground">Stake</div>
          <input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Number Of Sides (+5%) — 2–1000</div>
            <input type="number" value={sides} onChange={(e) => setSides(Math.max(2, Math.min(1000, Number(e.target.value))))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Chosen Number — 1–1050</div>
            <input type="number" value={chosen} onChange={(e) => setChosen(Math.max(1, Math.min(1050, Number(e.target.value))))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <ActionButton onClick={roll} disabled={(player.money ?? 0) < stake} color="bg-gradient-to-r from-green-500 to-emerald-500">Place Bet</ActionButton>
      </div>
      {result && (
        <div className={`mafia-card rounded-xl p-4 text-center ${result.won ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className={`text-3xl font-black ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? "🏆 WIN!" : "💀 LOSS"}</div>
          <div className="text-sm text-muted-foreground">Rolled: {result.roll} (wanted: {chosen})</div>
        </div>
      )}
      <div className="mafia-card rounded-xl p-3">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground"><strong>Maxbet:</strong> Unlimited</div>
      </div>
    </div>
  );
}

// ═══ ROULETTE ═══
export function CasinoRoulettePage() {
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(50000);
  const [betType, setBetType] = useState<"red" | "black" | "green">("red");
  const [result, setResult] = useState<{ number: number; color: string; won: boolean } | null>(null);

  const spin = () => {
    if ((player?.money ?? 0) < bet) return;
    const num = Math.floor(Math.random() * 37);
    const color = num === 0 ? "green" : num % 2 === 0 ? "black" : "red";
    setResult({ number: num, color, won: betType === color });
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎡" title="Roulette" sub="Choose a spot and enter amount" />
      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Win Rate" value="0%" color="text-amber-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Choose a spot & enter amount</div>
        <div className="flex gap-2">
          {(["red", "black", "green"] as const).map((c) => (
            <button key={c} onClick={() => setBetType(c)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                betType === c
                  ? c === "red" ? "bg-red-500 text-white border-red-400" : c === "black" ? "bg-gray-800 text-white border-gray-600" : "bg-green-600 text-white border-green-400"
                  : "bg-background border-border text-muted-foreground"
              }`}>
              {c === "red" ? "🔴 Red" : c === "black" ? "⚫ Black" : "🟢 Green"}
            </button>
          ))}
        </div>
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Bet amount..." />
        <ActionButton onClick={spin} disabled={(player.money ?? 0) < bet} color="bg-gradient-to-r from-green-500 to-emerald-500">Spin!</ActionButton>
      </div>
      {result && (
        <div className={`mafia-card rounded-xl p-4 text-center ${result.won ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className="text-4xl font-black mb-1">{result.number}</div>
          <div className={`text-lg font-bold ${result.color === "red" ? "text-red-400" : result.color === "black" ? "text-gray-300" : "text-green-400"}`}>
            {result.color.toUpperCase()}
          </div>
          <div className={`text-sm font-bold mt-1 ${result.won ? "text-green-400" : "text-red-400"}`}>
            {result.won ? `You win +$${bet.toLocaleString()}!` : "Dealer wins!"}
          </div>
        </div>
      )}
      <div className="mafia-card rounded-xl p-3">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div>This roulette has no owner. Purchase it to start playing!</div>
          <div><strong>Purchase Roulette:</strong> $150,000,000</div>
        </div>
      </div>
    </div>
  );
}

// ═══ RACETRACK ═══
export function CasinoRacetrackPage() {
  const player = useQuery(api.game.getPlayer);
  const [horse, setHorse] = useState(0);
  const [bet, setBet] = useState(10000);
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  const horses = [
    { name: "Red Horse", odds: "EVENS", color: "bg-red-500" },
    { name: "Blue Horse", odds: "2/1", color: "bg-blue-500" },
    { name: "Green Horse", odds: "4/1", color: "bg-green-500" },
    { name: "Yellow Horse", odds: "6/1", color: "bg-yellow-500" },
    { name: "White Horse", odds: "12/1", color: "bg-white" },
    { name: "Pink Horse", odds: "20/1", color: "bg-pink-500" },
    { name: "Black Horse", odds: "40/1", color: "bg-gray-900" },
  ];

  const race = () => {
    if ((player?.money ?? 0) < bet || racing) return;
    setRacing(true);
    setWinner(null);
    setTimeout(() => {
      setWinner(Math.floor(Math.random() * horses.length));
      setRacing(false);
    }, 3000);
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🏇" title="Racetrack" sub="Pick your horse and place your bet" />
      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Win Rate" value="0%" color="text-amber-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Place your bets</div>
        <div className="space-y-1.5">
          {horses.map((h, i) => (
            <button key={i} onClick={() => setHorse(i)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all ${horse === i ? "border-primary bg-primary/10" : "border-slate-700/30 hover:border-slate-600"}`}>
              <div className={`w-4 h-4 rounded-full ${h.color}`} />
              <span className="text-xs font-bold flex-1 text-left">{h.name}</span>
              <span className="text-[10px] text-muted-foreground font-bold">{h.odds}</span>
            </button>
          ))}
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Bet Amount</div>
          <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
        <ActionButton onClick={race} disabled={(player.money ?? 0) < bet || racing} color="bg-gradient-to-r from-green-500 to-emerald-500">
          {racing ? "🏇 Racing..." : "Place Bet"}
        </ActionButton>
      </div>
      {winner !== null && (
        <div className={`mafia-card rounded-xl p-4 text-center ${winner === horse ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className={`text-xl font-black ${winner === horse ? "text-green-400" : "text-red-400"}`}>
            {horses[winner].name} wins!
          </div>
          <div className={`text-sm font-bold mt-1 ${winner === horse ? "text-green-400" : "text-red-400"}`}>
            {winner === horse ? `You win +$${bet.toLocaleString()}!` : "Better luck next time!"}
          </div>
        </div>
      )}
      <div className="mafia-card rounded-xl p-3">
        <div className="text-xs font-bold mb-1">ℹ️ Information</div>
        <div className="text-[10px] text-muted-foreground"><strong>Maxbet:</strong> $1,000,000,000</div>
      </div>
    </div>
  );
}

// ═══ VIDEO POKER ═══
export function CasinoVideoPokerPage() {
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(50000);
  const [hand, setHand] = useState<number[] | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const paytable = [
    { name: "Royal Flush", mult: 100, icon: "👑" },
    { name: "Straight Flush", mult: 22, icon: "🃏" },
    { name: "Four of a Kind", mult: 15, icon: "4️⃣" },
    { name: "Full House", mult: 7, icon: "🏠" },
    { name: "Flush", mult: 4.5, icon: "💎" },
    { name: "Straight", mult: 3.5, icon: "📈" },
    { name: "Three of a Kind", mult: 2.5, icon: "3️⃣" },
    { name: "Two Pair", mult: 1.75, icon: "2️⃣" },
    { name: "Jacks or Better", mult: 1.25, icon: "🂡" },
  ];

  const deal = () => {
    if ((player?.money ?? 0) < bet) return;
    const cards = Array.from({ length: 5 }, () => Math.floor(Math.random() * 13) + 2);
    setHand(cards);
    const counts = new Map<number, number>();
    cards.forEach(c => counts.set(c, (counts.get(c) ?? 0) + 1));
    const maxCount = Math.max(...counts.values());
    if (maxCount >= 4) setResult("Four of a Kind! 15x");
    else if (maxCount >= 3) setResult("Three of a Kind! 2.5x");
    else setResult("No winning hand");
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🂡" title="Video Poker" sub="Place your bet to start playing" />
      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Win Rate" value="0%" color="text-amber-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Video Poker</div>
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Enter bet..." />
        <ActionButton onClick={deal} disabled={(player.money ?? 0) < bet} color="bg-gradient-to-r from-green-500 to-emerald-500">Play</ActionButton>
      </div>
      {hand && (
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="flex justify-center gap-2 mb-3">
            {hand.map((c, i) => (
              <div key={i} className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-black shadow-lg">{c}</div>
            ))}
          </div>
          {result && <div className="text-sm font-bold text-amber-400">{result}</div>}
        </div>
      )}
      <div className="mafia-card rounded-xl p-3">
        <div className="text-xs font-bold mb-2">Paytable</div>
        <div className="space-y-1">
          {paytable.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-[10px]">
              <span>{p.icon}</span>
              <span className="flex-1 text-muted-foreground">{p.name}</span>
              <span className="font-bold text-amber-400">{p.mult}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ SCRATCHCARDS ═══
export function CasinoScratchcardsPage() {
  const player = useQuery(api.game.getPlayer);
  const [card, setCard] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const prizeTable = [
    { symbol: "💎", label: "Diamond Jackpot", prize: 5000000 },
    { symbol: "🏆", label: "Gold Prize", prize: 1000000 },
    { symbol: "💰", label: "Cash Prize", prize: 250000 },
    { symbol: "🪙", label: "Coin Prize", prize: 100000 },
    { symbol: "📦", label: "Pack Reward", prize: 50000 },
    { symbol: "💀", label: "Bullet Bonus", prize: 25000 },
    { symbol: "⭐", label: "Star Bonus", prize: 10000 },
    { symbol: "❌", label: "Nothing", prize: 0 },
    { symbol: "❌", label: "Nothing", prize: 0 },
  ];

  const scratch = () => {
    if ((player?.money ?? 0) < 5000) return;
    const symbols = Array.from({ length: 9 }, () => prizeTable[Math.floor(Math.random() * prizeTable.length)]);
    setCard(symbols.map(s => s.symbol));
    setRevealed(0);
    setResult(null);
  };

  const reveal = () => {
    if (!card) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= card.length) {
      const matching = card.filter((s, i) => s === card[i + 1] || s === card[i - 1]).length;
      if (matching >= 2) setResult("Match! You win!");
      else setResult("No match. Try again!");
    }
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎫" title="Scratchcards" sub="Scratch to reveal prizes" />
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Buy Scratchcard — $5,000</div>
        <ActionButton onClick={scratch} disabled={(player.money ?? 0) < 5000} color="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">Buy Card</ActionButton>
      </div>
      {card && (
        <div className="mafia-card rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {card.map((s, i) => (
              <button key={i} onClick={() => i <= revealed && reveal()}
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                  i < revealed ? "bg-white/10 border border-amber-500/30" : "bg-slate-800 border border-slate-700"
                }`}>
                {i < revealed ? s : "?"}
              </button>
            ))}
          </div>
          {revealed < card.length && (
            <ActionButton onClick={reveal} color="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">Scratch!</ActionButton>
          )}
          {result && <div className="text-sm font-bold text-center text-amber-400 mt-2">{result}</div>}
        </div>
      )}
      <div className="mafia-card rounded-xl p-3">
        <div className="text-xs font-bold mb-2">Available Prizes</div>
        <div className="space-y-1 text-[10px]">
          {prizeTable.filter(p => p.prize > 0).map((p) => (
            <div key={p.label} className="flex justify-between">
              <span>{p.symbol} {p.label}</span>
              <span className="text-green-400 font-bold">${p.prize.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

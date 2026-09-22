import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

// ═══ BETTING OVERVIEW / LAST MAN STANDING ═══
export function BettingLmsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🏆" title="Last Man Standing" sub="Tournament-style elimination betting" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Tournaments Won" value="0" color="text-amber-400" />
        <StatPill label="Win Streak" value="0" color="text-purple-400" />
        <StatPill label="Best Finish" value="—" color="text-cyan-400" />
      </div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-3">
        <div className="text-4xl">🏆</div>
        <div className="text-sm font-bold">No Active Tournaments</div>
        <div className="text-[10px] text-muted-foreground">Check back soon for the next Last Man Standing event!</div>
      </div>
      <div className="mafia-card rounded-xl p-4">
        <div className="text-xs font-bold mb-1">📊 Betting Statistics</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <StatPill label="Total Bets" value="0" color="text-green-400" />
          <StatPill label="Bets Won" value="0 (0%)" color="text-amber-400" />
          <StatPill label="Bets Lost" value="0" color="text-red-400" />
          <StatPill label="Profit/Loss" value="$0" color="text-slate-200" />
        </div>
      </div>
    </div>
  );
}

// ═══ CHAMPIONS LEAGUE SWEEPSTAKE ═══
export function BettingChampionsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  const matches = [
    { home: "Real Madrid", away: "Barcelona", odds: ["2.10", "3.40", "3.10"], status: "Open" },
    { home: "Manchester City", away: "Bayern Munich", odds: ["1.90", "3.60", "3.40"], status: "Open" },
    { home: "PSG", away: "Inter Milan", odds: ["2.30", "3.20", "2.90"], status: "Open" },
    { home: "Liverpool", away: "Juventus", odds: ["2.00", "3.50", "3.20"], status: "Closed" },
    { home: "Arsenal", away: "AC Milan", odds: ["2.15", "3.30", "3.00"], status: "Closed" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="⚽" title="Champions League Sweepstake" sub="Bet on Champions League matches" />
      <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold">All</span>
          <span className="px-2 py-0.5 rounded text-[9px] bg-secondary text-muted-foreground">Closed</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Search...</span>
        </div>
        <div className="text-xs font-bold text-muted-foreground mb-2">Closed Events — 2</div>
        <div className="space-y-2">
          {matches.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg border ${m.status === "Open" ? "border-green-500/30 bg-green-950/10" : "border-slate-700/30 bg-slate-900/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold">{m.home} vs {m.away}</div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${m.status === "Open" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{m.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button disabled={m.status !== "Open"} className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-[10px] font-bold text-blue-400 disabled:opacity-40">Home {m.odds[0]}</button>
                <button disabled={m.status !== "Open"} className="px-2 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded text-[10px] font-bold text-yellow-400 disabled:opacity-40">Draw {m.odds[1]}</button>
                <button disabled={m.status !== "Open"} className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-[10px] font-bold text-purple-400 disabled:opacity-40">Away {m.odds[2]}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ SPORTS BETTING ═══
export function BettingSportsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  const events = [
    { sport: "🏈 NFL", match: "Kansas City Chiefs vs San Francisco 49ers", odds: ["1.85", "2.10"], status: "Open", time: "Today 8:20 PM" },
    { sport: "🏀 NBA", match: "LA Lakers vs Boston Celtics", odds: ["2.05", "1.75"], status: "Open", time: "Tomorrow 7:00 PM" },
    { sport: "⚽ EPL", match: "Manchester United vs Chelsea", odds: ["2.30", "3.10"], status: "Open", time: "Saturday 3:00 PM" },
    { sport: "🎾 Tennis", match: "Djokovic vs Alcaraz", odds: ["1.90", "1.85"], status: "Closed", time: "Finished" },
    { sport: "🥊 Boxing", match: "Fury vs Usyk II", odds: ["1.65", "2.20"], status: "Closed", time: "Finished" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🏈" title="Sports Betting" sub="Browse events and place bets on real sports" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Total Bets" value="0" color="text-amber-400" />
        <StatPill label="Bets Won" value="0 (0%)" color="text-cyan-400" />
        <StatPill label="Profit/Loss" value="$0" color="text-slate-200" />
      </div>
      <div className="flex items-center gap-2 text-[10px]">
        <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold">All</span>
        <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">Closed</span>
        <span className="ml-auto text-muted-foreground">🔍 Search...</span>
      </div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className={`mafia-card rounded-xl p-3 ${e.status === "Open" ? "border-green-500/20" : "border-slate-700/20"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground">{e.sport}</span>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${e.status === "Open" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{e.status}</span>
            </div>
            <div className="text-xs font-bold mb-2">{e.match}</div>
            <div className="text-[9px] text-muted-foreground mb-2">{e.time}</div>
            <div className="grid grid-cols-2 gap-1">
              {e.odds.map((o, j) => (
                <button key={j} disabled={e.status !== "Open"}
                  className="px-2 py-1.5 bg-primary/10 border border-primary/30 rounded text-[10px] font-bold text-primary disabled:opacity-30 disabled:cursor-not-allowed">
                  {j === 0 ? e.match.split(" vs ")[0].split(" ").pop() : e.match.split(" vs ")[1].split(" ").pop()} — {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ MULTIDICE ═══
export function BettingMultiDicePage() {
  const player = useQuery(api.game.getPlayer);
  const [games, setGames] = useState<{ id: number; amount: number; players: number }[]>([]);
  const [stake, setStake] = useState(1000);

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🎲" title="MultiDice" sub="Create or join dice games with other players" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Your Money" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatPill label="Games Created" value="0" color="text-amber-400" />
        <StatPill label="Games Joined" value="0" color="text-cyan-400" />
        <StatPill label="Games Won" value="0" color="text-green-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Create Game</div>
        <div className="text-[10px] text-muted-foreground">Up to 5 games at once</div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground">Amount</div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">$</span>
              <input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))}
                className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs" />
            </div>
          </div>
          <ActionButton color="bg-gradient-to-r from-green-500 to-emerald-500">Create</ActionButton>
        </div>
      </div>
      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-2">Current Games</div>
        <div className="text-[10px] text-muted-foreground">Join or roll games below</div>
        <div className="space-y-2 mt-3">
          {games.length === 0 ? (
            <div className="text-center py-4 text-[10px] text-muted-foreground">No active games — create one above!</div>
          ) : games.map((g) => (
            <div key={g.id} className="flex items-center gap-2 p-2 rounded border border-slate-700/30">
              <span className="text-xs font-bold flex-1">${g.amount.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">{g.players} players</span>
              <ActionButton>Join</ActionButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ POKER NIGHT ═══
export function BettingPokerNightPage() {
  const player = useQuery(api.game.getPlayer);
  const [tableName, setTableName] = useState("");
  const [buyIn, setBuyIn] = useState(10000000);
  const [minRaise, setMinRaise] = useState(1000000);
  const [seats, setSeats] = useState(4);
  const [inviteOnly, setInviteOnly] = useState(true);

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🂡" title="Poker Night" sub="Multiplayer Poker — host an in-game cash table with invited players" />
      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Mode" value="Player vs Player" color="text-green-400" />
        <StatPill label="Funds" value="Escrow Chips" color="text-amber-400" />
        <StatPill label="Players" value="2-6 Seats" color="text-blue-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Host Table</div>
        <div className="text-[10px] text-muted-foreground">Create a cash table and invite players.</div>
        <div>
          <div className="text-[10px] text-muted-foreground">Table name</div>
          <input value={tableName} onChange={(e) => setTableName(e.target.value)}
            placeholder={`${player.nickname ?? "Player"}'s Multiplayer Poker`}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Buy-in cash</div>
            <input type="number" value={buyIn} onChange={(e) => setBuyIn(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Minimum raise</div>
            <input type="number" value={minRaise} onChange={(e) => setMinRaise(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <div className="text-[9px] text-amber-300/80 bg-amber-950/30 rounded-lg p-2 border border-amber-500/20">
          Staging limits active: Min buy-in $25,000,000 · Max buy-in $500,000,000 · Max cash side bet $400,000,000 · Max points side bet 1,000.
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Seats</div>
            <select value={seats} onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
              {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Players</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Table cloth</div>
            <div className="px-3 py-2 bg-background border border-border rounded-lg text-xs">Classic green (free)</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Invites</div>
          <textarea placeholder="Usernames, comma or line separated" rows={2}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs resize-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={inviteOnly} onChange={(e) => setInviteOnly(e.target.checked)} className="size-3" />
          <span className="text-[10px] text-muted-foreground">Invite only</span>
        </div>
        <ActionButton color="bg-gradient-to-r from-green-500 to-emerald-500">Create Multiplayer Poker</ActionButton>
      </div>
      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-2">Poker Tables</div>
        <div className="text-[10px] text-muted-foreground">Open games, invites, and your recent results.</div>
        <div className="text-center py-4 text-[10px] text-muted-foreground">No multiplayer poker tables to show.</div>
      </div>
    </div>
  );
}

// ═══ MULTIPLAYER BLACKJACK ═══
export function BettingMpBlackjackPage() {
  const player = useQuery(api.game.getPlayer);
  const [tableName, setTableName] = useState("Blackjack Table");
  const [buyIn, setBuyIn] = useState(10000000);
  const [seats, setSeats] = useState(2);

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader icon="🃏" title="Multiplayer Blackjack" sub="Host an in-game cash table with invited players" />
      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Mode" value="Player vs Player" color="text-green-400" />
        <StatPill label="Funds" value="Cash" color="text-amber-400" />
        <StatPill label="Players" value="2-4" color="text-blue-400" />
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Host Table</div>
        <div className="text-[10px] text-muted-foreground">Create a cash table and invite players.</div>
        <div>
          <div className="text-[10px] text-muted-foreground">Name</div>
          <input value={tableName} onChange={(e) => setTableName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Buy-in</div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">$</span>
            <input type="number" value={buyIn} onChange={(e) => setBuyIn(Number(e.target.value))} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <div className="text-[9px] text-amber-300/80 bg-amber-950/30 rounded-lg p-2 border border-amber-500/20">
          Staging limits active: Min buy-in $25,000,000; Max buy-in $500,000,000; Max cash side bet $400,000,000; Max points side bet 1,000.
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Seats</div>
            <select value={seats} onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
              {[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Invites</div>
            <input placeholder="Usernames, comma or line separated" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <ActionButton color="bg-gradient-to-r from-green-500 to-emerald-500">Create</ActionButton>
      </div>
      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-2">Blackjack Tables</div>
        <div className="text-[10px] text-muted-foreground">Open games, invites, and your recent results.</div>
        <div className="text-center py-4 text-[10px] text-muted-foreground">No blackjack tables to show.</div>
      </div>
    </div>
  );
}

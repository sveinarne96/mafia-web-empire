import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, TrendingUp, TrendingDown, Building2, ShoppingBag, Gavel, ShieldCheck, Landmark, Loader2, AlertTriangle, CheckCircle, Coins, ChevronDown, ChevronUp, BarChart3, Banknote, Wallet } from "lucide-react";

function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

export function TournamentPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Trophy className="size-5 text-yellow-400" /> Tournament</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Weekly PvP tournaments with elimination brackets. Sign up and fight your way to the top!</p>
        <div className="bg-muted/50 border border-border rounded p-4 text-center">
          <Trophy className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No Active Tournament</p>
          <p className="text-xs text-muted-foreground mt-1">The next tournament starts Monday at 00:00 UTC</p>
          <p className="text-xs text-muted-foreground">Entry fee: $1,000 | Prize pool: $10,000+</p>
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">How It Works</h3>
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div className="bg-muted/30 rounded p-2 text-center"><span className="text-yellow-400 font-bold text-lg block">1</span> Sign Up</div>
            <div className="bg-muted/30 rounded p-2 text-center"><span className="text-yellow-400 font-bold text-lg block">2</span> Round 1</div>
            <div className="bg-muted/30 rounded p-2 text-center"><span className="text-yellow-400 font-bold text-lg block">3</span> Semi-Final</div>
            <div className="bg-muted/30 rounded p-2 text-center"><span className="text-yellow-400 font-bold text-lg block">4</span> Finals</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  const achievements = [
    { id: "first_kill", name: "First Blood", desc: "Get your first kill", icon: "💀", unlocked: (player.totalKills ?? 0) >= 1 },
    { id: "crime_spree", name: "Crime Spree", desc: "Commit 10 crimes", icon: "🔫", unlocked: (player.totalCrimes ?? 0) >= 10 },
    { id: "survivor", name: "Survivor", desc: "Win 10 fights", icon: "🥊", unlocked: (player.totalFights ?? 0) >= 10 },
    { id: "escape_artist", name: "Escape Artist", desc: "Escape prison", icon: "🏃", unlocked: (player.totalPrisonEscapes ?? 0) >= 1 },
    { id: "richest", name: "Rich List", desc: "Have $100,000 in cash", icon: "💰", unlocked: (player.money ?? 0) >= 100000 },
    { id: "level_10", name: "Veteran", desc: "Reach level 10", icon: "⭐", unlocked: (player.level ?? 1) >= 10 },
    { id: "level_25", name: "Legend", desc: "Reach level 25", icon: "👑", unlocked: (player.level ?? 1) >= 25 },
    { id: "level_50", name: "Godfather", desc: "Reach level 50", icon: "🏆", unlocked: (player.level ?? 1) >= 50 },
    { id: "family_man", name: "Family Man", desc: "Join a family", icon: "👨‍👩‍👧‍👦", unlocked: !!player.familyId },
    { id: "dark_reputation", name: "Feared", desc: "Reach Evil alignment", icon: "😈", unlocked: player.reputationAlignment === "evil" },
    { id: "honorable", name: "Honorable", desc: "Reach Good alignment", icon: "😇", unlocked: player.reputationAlignment === "good" },
    { id: "millionaire", name: "Millionaire", desc: "Have $1,000,000 total", icon: "🏦", unlocked: ((player.money ?? 0) + (player.bank ?? 0)) >= 1000000 },
    { id: "raider", name: "Raider", desc: "Complete 5 daily raids", icon: "⚡", unlocked: (player.totalCrimes ?? 0) >= 25 },
    { id: "killed_10", name: "The Butcher", desc: "Kill 10 players", icon: "🔪", unlocked: (player.totalKills ?? 0) >= 10 },
    { id: "killed_50", name: "Serial Killer", desc: "Kill 50 players", icon: "💀", unlocked: (player.totalKills ?? 0) >= 50 },
    { id: "killed_100", name: "Massacre", desc: "Kill 100 players", icon: "☠️", unlocked: (player.totalKills ?? 0) >= 100 },
    { id: "prison_veteran", name: "Hardened Criminal", desc: "Go to prison 10 times", icon: "🔒", unlocked: (player.totalDeaths ?? 0) >= 5 },
    { id: "heist_master", name: "Heist Master", desc: "Commit 50 crimes", icon: "🎭", unlocked: (player.totalCrimes ?? 0) >= 50 },
  ];

  const unlocked = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Trophy className="size-5 text-yellow-400" /> Achievements</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{unlocked}/{achievements.length} unlocked</p>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all" style={{ width: `${(unlocked / achievements.length) * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {achievements.map(a => (
            <div key={a.id} className={`flex items-center gap-3 p-3 rounded border ${a.unlocked ? 'bg-yellow-950/20 border-yellow-800/30' : 'bg-muted/30 border-border opacity-50'}`}>
              <span className="text-2xl">{a.icon}</span>
              <div>
                <div className={`text-sm font-semibold ${a.unlocked ? 'text-yellow-400' : 'text-muted-foreground'}`}>{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
              </div>
              {a.unlocked && <CheckCircle className="size-4 text-yellow-400 ml-auto" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TitlesPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  const titles = [
    { id: "newcomer", name: "Newcomer", requirement: "Register", icon: "🆕", unlocked: !!player.registeredAt },
    { id: "thug", name: "Thug", requirement: "Win 5 fights", icon: "🥊", unlocked: (player.totalFights ?? 0) >= 5 },
    { id: "the_butcher", name: "The Butcher", requirement: "Kill 10 players", icon: "🔪", unlocked: (player.totalKills ?? 0) >= 10 },
    { id: "ghost", name: "Ghost", requirement: "Escape prison 3 times", icon: "👻", unlocked: (player.totalPrisonEscapes ?? 0) >= 3 },
    { id: "kingpin", name: "The Kingpin", requirement: "Reach level 25", icon: "👑", unlocked: (player.level ?? 1) >= 25 },
    { id: "untouchable", name: "Untouchable", requirement: "Never die", icon: "🛡️", unlocked: (player.totalDeaths ?? 0) === 0 && (player.totalKills ?? 0) >= 5 },
    { id: "shadow", name: "Shadow", requirement: "Reach Evil alignment", icon: "🌑", unlocked: player.reputationAlignment === "evil" },
    { id: "saint", name: "Saint", requirement: "Reach Good alignment", icon: "✨", unlocked: player.reputationAlignment === "good" },
    { id: "godfather", name: "Godfather", requirement: "Reach level 50", icon: "🎩", unlocked: (player.level ?? 1) >= 50 },
    { id: "massacre", name: "Massacre", requirement: "Kill 50 players", icon: "☠️", unlocked: (player.totalKills ?? 0) >= 50 },
    { id: "tycoon", name: "Tycoon", requirement: "Have $500,000+", icon: "💼", unlocked: ((player.money ?? 0) + (player.bank ?? 0)) >= 500000 },
    { id: "lifer", name: "Lifer", requirement: "Get arrested 10 times", icon: "⛓️", unlocked: (player.totalDeaths ?? 0) >= 5 },
  ];

  const activeTitle = (player as Record<string, unknown>).activeTitle as string | undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Crown className="size-5 text-yellow-400" /> Titles</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-4">Titles are earned through specific achievements. Each title shows next to your name.</p>
        {activeTitle && <div className="mb-4 p-2 bg-yellow-950/30 border border-yellow-800/30 rounded text-sm text-yellow-400 font-semibold">Active: {activeTitle}</div>}
        <div className="space-y-2">
          {titles.map(t => (
            <div key={t.id} className={`flex items-center gap-3 p-3 rounded border ${t.unlocked ? 'bg-card border-yellow-800/30' : 'bg-muted/30 border-border opacity-40'}`}>
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${t.unlocked ? 'text-yellow-400' : 'text-muted-foreground'}`}>{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.requirement}</div>
              </div>
              {t.unlocked ? <CheckCircle className="size-4 text-yellow-400" /> : <span className="text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5">Locked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StockMarketPage() {
  const player = useQuery(api.game.getPlayer);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  if (!player) return <LoadingPage />;

  const stocks = [
    { symbol: "SHAD", name: "Shadow Corp", price: 1250 + Math.floor(Math.random() * 200 - 100), change: (Math.random() * 10 - 5) },
    { symbol: "GRIM", name: "Grim Industries", price: 890 + Math.floor(Math.random() * 150 - 75), change: (Math.random() * 12 - 6) },
    { symbol: "DARK", name: "Dark Holdings", price: 2100 + Math.floor(Math.random() * 300 - 150), change: (Math.random() * 8 - 4) },
    { symbol: "CRIM", name: "Criminal Enterprises", price: 670 + Math.floor(Math.random() * 100 - 50), change: (Math.random() * 15 - 7.5) },
    { symbol: "NOIR", name: "Noir Ventures", price: 1580 + Math.floor(Math.random() * 250 - 125), change: (Math.random() * 6 - 3) },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><BarChart3 className="size-5 text-green-400" /> Stock Market</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Invest in volatile markets. Prices fluctuate based on player activity and random events.</p>
        {msg && <div className="mb-3 p-2 bg-green-950/30 border border-green-800/30 rounded text-sm text-green-400">{msg}</div>}
        <div className="space-y-2">
          {stocks.map(s => (
            <div key={s.symbol} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded">
              <div>
                <span className="font-bold text-foreground">{s.symbol}</span>
                <span className="text-xs text-muted-foreground ml-2">{s.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-foreground">${s.price.toLocaleString()}</span>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {s.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {s.change >= 0 ? '+' : ''}{s.change.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RealEstatePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  const properties = [
    { name: "Downtown Apartment", city: "New York", price: 25000, income: 500, icon: "🏢" },
    { name: "Warehouse", city: "Chicago", price: 50000, income: 1200, icon: "🏭" },
    { name: "Nightclub", city: "Miami", price: 100000, income: 3000, icon: "🎰" },
    { name: "Penthouse", city: "New York", price: 250000, income: 8000, icon: "🏰" },
    { name: "Mansion", city: "Los Angeles", price: 500000, income: 15000, icon: "🏛️" },
    { name: "Casino", city: "Las Vegas", price: 1000000, income: 35000, icon: "🎰" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Building2 className="size-5 text-blue-400" /> Real Estate</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Buy properties for passive income. Each generates revenue based on location and type.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {properties.map((p, i) => (
            <div key={i} className="bg-muted/30 border border-border rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.city}</div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-400 font-bold">${p.price.toLocaleString()}</span>
                <span className="text-green-400">+${p.income.toLocaleString()}/day</span>
              </div>
              <button className="mt-2 w-full py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-xs text-primary font-semibold transition-colors">Buy Property</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BusinessesPage() {
  const player = useQuery(api.game.getPlayer);
  const shop = useQuery(api.gameExtended.getBusinessShop);
  const myBizs = useQuery(api.gameExtended.getMyBusinesses);
  const buyBiz = useMutation(api.gameExtended.buyPremiumBusiness);
  const sellBiz = useMutation(api.gameExtended.sellBusiness);
  const collectIncome = useMutation(api.game.collectBusinessIncome);
  const collectOil = useMutation(api.gameExtended.collectOilEarnings);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!player || !shop) return <LoadingPage />;

  const ownedCount = (type: string) => (myBizs ?? []).filter((b: any) => b.type === type).length;
  const totalIncome = (myBizs ?? []).reduce((sum: number, b: any) => sum + (b.income ?? 0), 0);

  const doBuy = async (type: string) => {
    setLoading(true); setMsg(null);
    try { const r = await buyBiz({ type }); setMsg(r.message); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };
  const doSell = async (bizId: string) => {
    setLoading(true); setMsg(null);
    try { const r = await sellBiz({ businessId: bizId as any }); setMsg(r.message); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };
  const doCollect = async () => {
    setLoading(true); setMsg(null);
    try { const r = await collectIncome({}); setMsg(`💰 Collected $${r.income.toLocaleString()} from all businesses!`); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };
  const doCollectOil = async () => {
    setLoading(true); setMsg(null);
    try { const r = await collectOil({}); setMsg(r.message); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><ShoppingBag className="size-5 text-purple-400" /><h2 className="text-lg font-bold">Business Empire</h2></div>
        <button onClick={doCollect} disabled={loading || (myBizs ?? []).length === 0}
          className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-40">
          💰 Collect All Income
        </button>
      </div>

      {/* My Businesses */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs font-bold">My Empire — {(myBizs ?? []).length} businesses</div>
          <div className="text-xs text-green-400 font-bold">+${totalIncome.toLocaleString()}/cycle</div>
        </div>
        {(myBizs ?? []).length > 0 ? (
          <div className="space-y-2">
            {(myBizs ?? []).map((b: any) => (
              <div key={b._id} className="flex items-center justify-between bg-background/30 rounded-lg p-2.5">
                <div>
                  <div className="text-xs font-bold">{b.name}</div>
                  <div className="text-[9px] text-green-400">+${(b.income ?? 0).toLocaleString()}/cycle</div>
                </div>
                <button onClick={() => doSell(b._id)} disabled={loading}
                  className="px-2 py-1 bg-red-600/20 text-red-400 text-[9px] font-bold rounded hover:bg-red-600/30">
                  Sell ${(b.price ?? 0).toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        ) : <div className="text-xs text-muted-foreground text-center py-3">No businesses yet — buy one below!</div>}
      </div>

      {/* Business Shop */}
      <div className="space-y-2">
        {shop.map((b: any) => {
          const owned = ownedCount(b.type);
          const atMax = owned >= b.maxOwn;
          const cantAfford = (player.money ?? 0) < b.price;
          const isOil = b.type === "oil";
          return (
            <div key={b.type} className="mafia-card rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{b.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-bold text-sm">{b.name}</div>
                    <div className="text-xs text-green-400 font-bold">+${b.income.toLocaleString()}/cycle</div>
                  </div>
                  <div className="text-[9px] text-muted-foreground">{b.description}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[9px]">
                      <span className="text-yellow-400">${b.price.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-2">Owned: {owned}/{b.maxOwn}</span>
                      {isOil && <span className="text-orange-400 ml-2">⚠️ 1hr withdrawal</span>}
                    </div>
                    <button onClick={() => doBuy(b.type)} disabled={loading || atMax || cantAfford}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${atMax ? "bg-muted text-muted-foreground cursor-not-allowed" : cantAfford ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                      {atMax ? "MAX OWNED" : cantAfford ? "INSUFFICIENT FUNDS" : "BUY"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Oil Earnings */}
      {(myBizs ?? []).some((b: any) => b.type === "oil") && (
        <button onClick={doCollectOil} disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-40">
          🛢️ Collect Oil Earnings (once per hour)
        </button>
      )}

      {msg && (
        <div className={`rounded-xl p-3 text-xs font-bold ${msg.includes("✅") || msg.includes("💰") || msg.includes("Bought") ? "bg-green-950/30 text-green-400 border border-green-500/30" : "bg-red-950/30 text-red-400 border border-red-500/30"}`}>{msg}</div>
      )}
    </div>
  );
}

export function AuctionHousePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Gavel className="size-5 text-orange-400" /> Auction House</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Buy and sell items with timed auctions. Place bids and compete for rare items.</p>
        <div className="bg-muted/50 border border-border rounded p-4 text-center">
          <Gavel className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No Active Auctions</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to list an item for auction!</p>
        </div>
        <button className="mt-4 w-full py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-sm text-primary font-semibold transition-colors">List Item for Auction</button>
      </div>
    </div>
  );
}

export function InsurancePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  const plans = [
    { name: "Basic Protection", cost: 500, coverage: "Protects up to $10,000 from robberies", icon: "🛡️" },
    { name: "Premium Protection", cost: 2000, coverage: "Protects up to $50,000 from robberies and kill loot", icon: "🔐" },
    { name: "Full Coverage", cost: 5000, coverage: "Protects all cash and items. Immune to theft.", icon: "🏦" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><ShieldCheck className="size-5 text-blue-400" /> Insurance</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Protect your money and items from robberies, kills, and theft.</p>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.coverage}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">${p.cost.toLocaleString()}/mo</div>
                <button className="mt-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-xs text-primary font-semibold transition-colors">Subscribe</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoansPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  const loans = [
    { name: "Small Loan", amount: 5000, interest: "10%", term: "7 days" },
    { name: "Medium Loan", amount: 25000, interest: "15%", term: "14 days" },
    { name: "Large Loan", amount: 100000, interest: "20%", term: "30 days" },
    { name: "Underground Loan", amount: 500000, interest: "30%", term: "30 days" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Landmark className="size-5 text-green-400" /> Loans</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">Borrow money from underground banks. Interest accrues daily — pay back fast or face the consequences.</p>
        <div className="bg-red-950/30 border border-red-800/30 rounded p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="size-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">Warning: Failure to repay loans will result in debt collectors hunting you down!</p>
        </div>
        <div className="space-y-3">
          {loans.map((l, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded">
              <div>
                <div className="text-sm font-semibold text-foreground">{l.name}</div>
                <div className="text-xs text-muted-foreground">Interest: {l.interest} | Term: {l.term}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">${l.amount.toLocaleString()}</div>
                <button className="mt-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-xs text-primary font-semibold transition-colors">Borrow</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

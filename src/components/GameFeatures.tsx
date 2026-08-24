import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EpicActionResult, CooldownBar, useCooldown, EpicButton } from "@/components/EpicAction";
import { Swords, FileText, Shield, Target, Timer, Scroll,
  DollarSign, Home, Store, TrendingUp,
  Flame, UserX, Crosshair, EyeOff, Receipt, Banknote,
  Coins, Truck, Trophy, Bomb, Dog, Car,
  Crown, Flag, Handshake, Brain, GraduationCap, Users, Ruler,
  Gift, Vote, Globe, Skull, Lock, ArrowUp,
  Map, Clock, Award, Briefcase, Heart, Zap,
  BarChart3, CircleDot, Landmark, Swords as SwordsIcon,
  AlertTriangle, ChevronRight, ChevronDown, ShoppingBag, Gem,
} from "lucide-react";
import { crimeCategories, getCrimeTypeColor, getCrimeTypeBg, type CrimeCategory, type Crime } from "@/data/crimes";
import { maybeDropEasterEgg, maybeDropEventGift } from "@/lib/easterEgg";
import { getDailyLegendaryCrimes, getTimeUntilReset, RARITY_CONFIG, type LegendaryCrime } from "@/data/legendaryCrimes";

// ===== #20 PRISON TIME DISPLAY =====
export function PrisonTimeDisplay() {
  const status = useQuery(api.gameFeatures.getPrisonTimeDisplay);
  const [countdown, setCountdown] = useState(status?.totalSeconds ?? 0);

  useEffect(() => {
    if (!status || status.totalSeconds <= 0) return;
    setCountdown(status.totalSeconds);
    const timer = setInterval(() => {
      setCountdown((c: number) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status?.totalSeconds]);

  if (!status) return null;

  const hrs = Math.floor(countdown / 3600);
  const mins = Math.floor((countdown % 3600) / 60);
  const secs = countdown % 60;
  const progress = status.totalSeconds > 0 ? ((status.totalSeconds - countdown) / status.totalSeconds) * 100 : 100;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 border-2 border-red-500/40 bg-red-950/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 animate-prison-bars opacity-10" />
        <div className="relative">
          <div className="text-5xl mb-3">🔒</div>
          <div className="text-xs text-red-400/60 font-mono tracking-widest mb-2">IN PRISON</div>
          <div className="text-4xl font-black text-red-400 font-mono">
            {hrs > 0 ? `${String(hrs).padStart(2, "0")}:` : ""}{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">Sentence: {Math.ceil((status.totalSeconds) / 60)} min • Auto-release when timer hits 0:00</div>
          {countdown <= 0 && <div className="text-green-400 font-bold mt-2 animate-pulse">✅ TIME SERVED — RELEASING...</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {status.job && <div className="mafia-card rounded-xl p-3 text-center"><div className="text-lg">🔨</div><div className="text-[10px] font-bold">Prison Job</div><div className="text-[9px] text-muted-foreground">{status.job}</div></div>}
        {status.gang && <div className="mafia-card rounded-xl p-3 text-center"><div className="text-lg">👊</div><div className="text-[10px] font-bold">Prison Gang</div><div className="text-[9px] text-muted-foreground">{status.gang}</div></div>}
        {status.solitary && <div className="mafia-card rounded-xl p-3 text-center border border-red-500/30"><div className="text-lg">🔒</div><div className="text-[10px] font-bold text-red-400">SOLITARY</div><div className="text-[9px] text-red-400">Locked down</div></div>}
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-lg">🏠</div><div className="text-[10px] font-bold">Cell Level</div><div className="text-[9px] text-muted-foreground">Level {status.cellLevel}</div></div>
      </div>
    </div>
  );
}

// ===== #23 DEATH MATCH =====
export function DeathMatchPage() {
  const deathMatch = useMutation(api.gameFeatures.deathMatchJoin);
  const [result, setResult] = useState<{ won?: boolean; opponent?: string; damage?: number; taken?: number; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { const r = await deathMatch({}); setResult(r as any); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Skull className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Death Match</h2></div>
      <p className="text-sm text-muted-foreground">Free-for-all. Last player standing wins the prize pot. No mercy.</p>
      <button onClick={handle} disabled={loading} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50">
        {loading ? "Fighting..." : "⚔️ Enter Death Match"}
      </button>
      {result && !result.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mafia-card rounded-xl p-4 ${result.won ? "border-green-900/30" : "border-red-900/30"}`}>
          <div className="text-lg font-bold">{result.won ? "🏆 VICTORY!" : "💀 DEFEATED"}</div>
          <div className="text-sm text-muted-foreground">vs {result.opponent}</div>
          <div className="text-sm mt-1">Damage: {result.damage} | Taken: {result.taken}</div>
        </motion.div>
      )}
      {result?.error && <div className="text-destructive text-sm">{result.error}</div>}
    </div>
  );
}

// ===== #27 SEASON RANKINGS =====
export function SeasonRankingsPage() {
  const rankings = useQuery(api.gameFeatures.getSeasonRankings);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Trophy className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Season Rankings</h2></div>
      {!rankings ? <div className="text-muted-foreground">Loading...</div> : rankings.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground">No rankings yet</div>
      ) : (
        <div className="space-y-1">
          {rankings.map((p: { nickname: string; level: number; kills: number; deaths: number; rank: string }, i: number) => (
            <div key={i} className={`mafia-card rounded-lg p-3 flex items-center gap-3 ${i < 3 ? "border-yellow-900/30" : ""}`}>
              <span className={`font-bold text-lg w-8 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>#{i + 1}</span>
              <div className="flex-1"><div className="font-medium text-sm">{p.nickname}</div><div className="text-[10px] text-muted-foreground">Lv.{p.level}</div></div>
              <div className="text-right"><div className="text-sm font-bold text-red-400">{p.kills} kills</div><div className="text-[10px] text-muted-foreground">{p.deaths} deaths</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #30 LEGACY =====
export function LegacyStatsPage() {
  const stats = useQuery(api.gameFeatures.getLegacyStats);
  if (!stats) return <div className="text-muted-foreground">Loading...</div>;
  const items = [
    { label: "Total Earned", value: `$${stats.totalEarned.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
    { label: "Highest Level", value: stats.highestLevel.toString(), icon: TrendingUp, color: "text-blue-400" },
    { label: "Total Kills", value: stats.totalKills.toString(), icon: Skull, color: "text-red-400" },
    { label: "Total Deaths", value: stats.totalDeaths.toString(), icon: Heart, color: "text-gray-400" },
    { label: "Crimes", value: stats.totalCrimes.toString(), icon: Crosshair, color: "text-orange-400" },
    { label: "Fights", value: stats.totalFights.toString(), icon: Swords, color: "text-purple-400" },
    { label: "Prestige", value: stats.prestige.toString(), icon: Crown, color: "text-yellow-400" },
    { label: "Prison Escapes", value: stats.totalPrisonEscapes.toString(), icon: Lock, color: "text-red-400" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Award className="size-7 text-primary" /><h2 className="text-2xl font-bold">Legacy</h2></div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="mafia-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><it.icon className={`size-4 ${it.color}`} /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.label}</span></div>
            <div className="text-lg font-bold">{it.value}</div>
          </div>
        ))}
      </div>
      <div className="mafia-card rounded-xl p-4 border border-yellow-900/30">
        <div className="text-sm font-bold text-yellow-400 mb-1">💡 Heir Inheritance</div>
        <div className="text-sm text-muted-foreground">On death, your heir inherits <span className="font-bold text-primary">${stats.heirWealth.toLocaleString()}</span> (10% of wealth)</div>
      </div>
    </div>
  );
}

// ===== #33 CONTRACTS =====
export function ContractsPage() {
  const contracts = useQuery(api.gameFeatures.getOpenContracts);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><FileText className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Assassination Contracts</h2></div>
      {!contracts ? <div className="text-muted-foreground">Loading...</div> : contracts.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground">No open contracts</div>
      ) : (
        <div className="space-y-2">
          {contracts.map((c: { _id: string; reward: number; expiresAt: number }) => (
            <div key={c._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
              <div><div className="text-sm font-bold">Target Contract</div><div className="text-xs text-muted-foreground">Reward: <span className="text-green-400">${c.reward.toLocaleString()}</span></div></div>
              <div className="text-[10px] text-muted-foreground">Expires: {new Date(c.expiresAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #37 COMBAT LOG =====
export function CombatLogPage() {
  const logs = useQuery(api.gameFeatures.getCombatLog);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Scroll className="size-7 text-primary" /><h2 className="text-2xl font-bold">Combat Log</h2></div>
      {!logs ? <div className="text-muted-foreground">Loading...</div> : logs.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground">No combat history</div>
      ) : (
        <div className="space-y-2">
          {logs.map((l: { _id: string; type: string; attackerDamage: number; defenderDamage: number; moneyStolen: number; timestamp: number }) => (
            <div key={l._id} className="mafia-card rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-background/50 rounded">{l.type}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm mt-1">⚔️ {l.attackerDamage} dmg vs 🛡️ {l.defenderDamage} dmg</div>
              {l.moneyStolen > 0 && <div className="text-xs text-green-400">💰 ${l.moneyStolen.toLocaleString()} stolen</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #38 FIGHTING STYLES =====
export function FightingStylesPage() {
  const learn = useMutation(api.gameFeatures.learnFightingStyle);
  const prof = useQuery(api.gameFeatures.getProficiency);
  const styles = [
    { key: "boxing", name: "Boxing", icon: "🥊", cost: 5000, desc: "+5 ATK, fast combos" },
    { key: "jiu_jitsu", name: "Jiu-Jitsu", icon: "🥋", cost: 8000, desc: "+8 DEF, counter moves" },
    { key: "street", name: "Street Fighting", icon: "👊", cost: 3000, desc: "+3 ATK, dirty tricks" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Swords className="size-7 text-primary" /><h2 className="text-2xl font-bold">Fighting Styles</h2></div>
      {prof && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-sm font-bold">Weapon Proficiency: Lv.{prof.level}</div>
          <div className="text-xs text-muted-foreground">+{prof.bonus} ATK bonus | Next level at {prof.nextLevelAt} XP</div>
        </div>
      )}
      <div className="grid gap-3">
        {styles.map((s) => (
          <motion.button key={s.key} whileTap={{ scale: 0.98 }} onClick={() => learn({ style: s.key as "boxing" | "jiu_jitsu" | "street" })} className="mafia-card rounded-xl p-5 text-left hover:border-primary/30 border border-border transition-all">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{s.icon}</div>
              <div><div className="font-bold text-lg">{s.name}</div><div className="text-xs text-muted-foreground">{s.desc}</div><div className="text-xs text-primary mt-1">${s.cost.toLocaleString()}</div></div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ===== #39 ARMOR =====
export function ArmorPage() {
  const buy = useMutation(api.gameFeatures.buyArmor);
  const repair = useMutation(api.gameFeatures.repairArmor);
  const armors = [
    { name: "Leather Vest", defense: 5, cost: 3000 },
    { name: "Kevlar Vest", defense: 12, cost: 10000 },
    { name: "Bulletproof Suit", defense: 20, cost: 25000 },
    { name: "Military Armor", defense: 30, cost: 50000 },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Shield className="size-7 text-primary" /><h2 className="text-2xl font-bold">Armor Shop</h2></div>
      <button onClick={() => repair({})} className="px-4 py-2 bg-secondary text-sm font-semibold rounded-lg border border-border">🔧 Repair Armor</button>
      <div className="grid gap-3">
        {armors.map((a) => (
          <motion.button key={a.name} whileTap={{ scale: 0.98 }} onClick={() => buy({ name: a.name, defense: a.defense, cost: a.cost })} className="mafia-card rounded-xl p-4 text-left hover:border-primary/30 border border-border transition-all">
            <div className="flex justify-between items-center"><div><div className="font-bold text-sm">{a.name}</div><div className="text-xs text-muted-foreground">🛡️ +{a.defense} DEF</div></div><div className="text-sm font-bold text-primary">${a.cost.toLocaleString()}</div></div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ===== #42 STOCK MARKET =====
export function StockMarketPage2() {
  const stocks = useQuery(api.gameFeatures.getStocks);
  const myStocks = useQuery(api.gameFeatures.getMyStocks);
  const buyStock = useMutation(api.gameFeatures.buyStock);
  const sellStock = useMutation(api.gameFeatures.sellStock);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><TrendingUp className="size-7 text-green-400" /><h2 className="text-2xl font-bold">Stock Market</h2></div>
      {stocks && stocks.length === 0 && <div className="text-sm text-muted-foreground">No stocks available. Admin needs to seed them.</div>}
      <div className="space-y-2">
        {stocks?.map((s: { _id: string; name: string; symbol: string; price: number; change: number }) => (
          <div key={s._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">{s.name} <span className="text-muted-foreground text-xs">({s.symbol})</span></div>
              <div className={`text-sm font-bold ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>${s.price} ({s.change >= 0 ? "+" : ""}{s.change})</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => buyStock({ stockId: s._id as any, shares: 1 })} className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">Buy</button>
              <button onClick={() => sellStock({ stockId: s._id as any, shares: 1 })} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">Sell</button>
            </div>
          </div>
        ))}
      </div>
      {myStocks && myStocks.length > 0 && (
        <div><h3 className="font-bold text-sm mb-2">My Holdings</h3>
          {myStocks.map((h: any) => (
            <div key={h._id} className="mafia-card rounded-lg p-3 flex justify-between text-sm">
              <span>{h.stock?.symbol} x{h.shares}</span>
              <span className="text-muted-foreground">Bought @ ${h.buyPrice}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #43 REAL ESTATE =====
export function RealEstatePage2() {
  const props = useQuery(api.gameFeatures.getProperties, {});
  const buyProp = useMutation(api.gameFeatures.buyProperty);
  const collect = useMutation(api.gameFeatures.collectPropertyIncome);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Home className="size-7 text-primary" /><h2 className="text-2xl font-bold">Real Estate</h2></div>
      <button onClick={() => collect({})} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg">💰 Collect All Income</button>
      <div className="space-y-2">
        {props?.map((p: { _id: string; name: string; city: string; type: string; income: number; price: number; ownerId?: string }) => (
          <div key={p._id} className="mafia-card rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div><div className="font-bold text-sm">{p.name}</div><div className="text-xs text-muted-foreground">{p.city} • {p.type}</div></div>
              <div className="text-right">
                <div className="text-xs text-green-400">${p.income.toLocaleString()}/day</div>
                {p.ownerId ? <div className="text-[10px] text-muted-foreground">Owned</div> : (
                  <button onClick={() => buyProp({ propertyId: p._id as any })} className="text-xs font-bold text-primary">${p.price.toLocaleString()}</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== #44-45 BUSINESSES =====
export function BusinessesPage2() {
  const biz = useQuery(api.gameFeatures.getMyBusinesses);
  const upgrade = useMutation(api.gameFeatures.upgradeBusiness);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Store className="size-7 text-primary" /><h2 className="text-2xl font-bold">Businesses</h2></div>
      {!biz || biz.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground">No businesses yet.</div>
      ) : (
        <div className="space-y-2">
          {biz.map((b: { _id: string; name: string; level: number; city: string; income: number }) => (
            <div key={b._id} className="mafia-card rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div><div className="font-bold text-sm">{b.name}</div><div className="text-xs text-muted-foreground">Lv.{b.level} • {b.city}</div></div>
                <div className="text-right">
                  <div className="text-xs text-green-400">${b.income.toLocaleString()}/day</div>
                  <button onClick={() => upgrade({ businessId: b._id as any })} className="text-xs font-bold text-primary">Upgrade ${(b.level * 10000).toLocaleString()}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #53 COUNTERFEITING =====
export function CounterfeitingPage() {
  const forge = useMutation(api.gameFeatures.counterfeitMoney);
  const [result, setResult] = useState<{ success?: boolean; earned?: number; arrested?: boolean; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Coins className="size-7 text-primary" /><h2 className="text-2xl font-bold">Counterfeiting</h2></div>
      <p className="text-sm text-muted-foreground">Print fake money. Higher skill = higher success. Risk of arrest.</p>
      <button onClick={async () => { try { setResult(await forge({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">🖨️ Print Money ($500 cost)</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : result.arrested ? "border-red-900/30" : ""}`}>
        {result.success ? <div className="text-green-400 font-bold">+${result.earned?.toLocaleString()} counterfeit!</div> : result.arrested ? <div className="text-red-400 font-bold">🚨 Arrested!</div> : <div className="text-yellow-400">Failed, but got away.</div>}
      </div>}
    </div>
  );
}

// ===== #55 DRUG TRAFFICKING =====
export function DrugTraffickingPage() {
  const deal = useMutation(api.gameFeatures.drugDeal);
  const [qty, setQty] = useState(10);
  const [result, setResult] = useState<{ success?: boolean; profit?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Zap className="size-7 text-primary" /><h2 className="text-2xl font-bold">Drug Trafficking</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Buy at $100/unit, sell for 1.5-2.5x. Risk of bust.</div>
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={async () => { try { setResult(await deal({ quantity: qty }) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">Sell {qty} units (${(qty * 100).toLocaleString()})</button>
      </div>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400 font-bold">Profit: +${result.profit?.toLocaleString()}</div> : <div className="text-red-400">Busted! Lost money and took damage.</div>}
      </div>}
    </div>
  );
}

// ===== #56 ARSON =====
export function ArsonPage() {
  const burn = useMutation(api.gameFeatures.commitArson);
  const [result, setResult] = useState<{ success?: boolean; payout?: number; arrested?: boolean; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Flame className="size-7 text-orange-400" /><h2 className="text-2xl font-bold">Arson</h2></div>
      <p className="text-sm text-muted-foreground">Burn buildings for insurance payouts. High risk of arrest and wanted level.</p>
      <button onClick={async () => { try { setResult(await burn({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700">🔥 Commit Arson</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : "border-red-900/30"}`}>
        {result.success ? <div className="text-green-400 font-bold">+${result.payout?.toLocaleString()} insurance payout!</div> : <div className="text-red-400">Failed! {result.arrested && "Arrested!"}</div>}
      </div>}
    </div>
  );
}

// ===== #57 IDENTITY THEFT =====
export function IdentityTheftPage() {
  const steal = useMutation(api.gameFeatures.commitIdentityTheft);
  const [targetId, setTargetId] = useState("");
  const [result, setResult] = useState<{ success?: boolean; stolen?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><UserX className="size-7 text-primary" /><h2 className="text-2xl font-bold">Identity Theft</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={async () => { try { setResult(await steal({ targetId: targetId as any }) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🎭 Steal Identity</button>
      </div>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400 font-bold">Stole ${result.stolen?.toLocaleString()}!</div> : <div className="text-red-400">Failed! Your wanted level increased.</div>}
      </div>}
    </div>
  );
}

// ===== #59 ARMS DEALING =====
export function ArmsDealPage() {
  const deal = useMutation(api.gameFeatures.armsDeal);
  const weapons = [
    { type: "knife", name: "Knife", icon: "🔪", atk: 3, buy: 500, sell: 300 },
    { type: "pistol", name: "Pistol", icon: "🔫", atk: 6, buy: 3000, sell: 2000 },
    { type: "shotgun", name: "Shotgun", icon: "💥", atk: 10, buy: 8000, sell: 5000 },
    { type: "rifle", name: "Rifle", icon: "🎯", atk: 15, buy: 15000, sell: 10000 },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Swords className="size-7 text-primary" /><h2 className="text-2xl font-bold">Arms Dealer</h2></div>
      <div className="space-y-2">
        {weapons.map((w) => (
          <div key={w.type} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-2xl">{w.icon}</span><div><div className="font-bold text-sm">{w.name}</div><div className="text-xs text-muted-foreground">+{w.atk} ATK</div></div></div>
            <div className="flex gap-2">
              <button onClick={() => deal({ weaponType: w.type, action: "buy" })} className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">Buy ${w.buy.toLocaleString()}</button>
              <button onClick={() => deal({ weaponType: w.type, action: "sell" })} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">Sell ${w.sell.toLocaleString()}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== #60 WITNESS INTIMIDATION =====
export function WitnessPage() {
  const scare = useMutation(api.gameFeatures.intimidateWitness);
  const [result, setResult] = useState<{ success?: boolean; reduction?: number; message?: string; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><EyeOff className="size-7 text-primary" /><h2 className="text-2xl font-bold">Witness Intimidation</h2></div>
      <p className="text-sm text-muted-foreground">Reduce your wanted level by intimidating witnesses. They might report you instead!</p>
      <button onClick={async () => { try { setResult(await scare({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">👁️ Intimidate Witnesses</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400">Wanted level reduced by {result.reduction}!</div> : <div className="text-red-400">{result.message}</div>}
      </div>}
    </div>
  );
}

// ===== #61 TAX EVASION =====
export function TaxEvasionPage() {
  const evade = useMutation(api.gameFeatures.evadeTaxes);
  const [result, setResult] = useState<{ success?: boolean; savedTax?: number; fine?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Receipt className="size-7 text-primary" /><h2 className="text-2xl font-bold">Tax Evasion</h2></div>
      <p className="text-sm text-muted-foreground">Hide your income from the government. 70% success rate. Getting caught means heavy fines.</p>
      <button onClick={async () => { try { setResult(await evade({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">📋 Evade Taxes</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400">Saved ${result.savedTax?.toLocaleString()} in taxes!</div> : <div className="text-red-400">Caught! Fine: ${result.fine?.toLocaleString()}</div>}
      </div>}
    </div>
  );
}

// ===== #62 RACKETEERING =====
export function RacketeeringPage() {
  const collect = useMutation(api.gameFeatures.collectRacket);
  const [result, setResult] = useState<{ income?: number; reported?: boolean; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Banknote className="size-7 text-primary" /><h2 className="text-2xl font-bold">Racketeering</h2></div>
      <p className="text-sm text-muted-foreground">Collect protection money from local businesses. 15% chance of being reported.</p>
      <button onClick={async () => { try { setResult(await collect({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">💰 Collect Protection Money</button>
      {result && !result.error && <div className="mafia-card rounded-xl p-4">
        <div className="text-green-400 font-bold">+${result.income?.toLocaleString()}</div>
        {result.reported && <div className="text-xs text-red-400 mt-1">⚠️ You were reported to police!</div>}
      </div>}
    </div>
  );
}

// ===== #63 GAMBLING DENS =====
export function GamblingDenPage() {
  const open = useMutation(api.gameFeatures.openGamblingDen);
  const [city, setCity] = useState("New York");
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Coins className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Gambling Dens</h2></div>
      <p className="text-sm text-muted-foreground">Open your own underground casino. Generates $2,000/day income.</p>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm">
          {["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => open({ city })} className="w-full py-2.5 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700">🎰 Open Casino ($50,000)</button>
      </div>
    </div>
  );
}

// ===== #64 LOAN SHARKING =====
export function LoanSharkPage() {
  const lend = useMutation(api.gameFeatures.lendMoney);
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState(5000);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Coins className="size-7 text-primary" /><h2 className="text-2xl font-bold">Loan Sharking</h2></div>
      <p className="text-sm text-muted-foreground">Lend money at high interest rates. If they don't pay, they owe you.</p>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Borrower Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1000} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={() => lend({ borrowerId: targetId as any, amount })} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">💰 Lend ${amount.toLocaleString()}</button>
      </div>
    </div>
  );
}

// ===== #65 CARGO THEFT =====
export function CargoTheftPage() {
  const hijack = useMutation(api.gameFeatures.hijackCargo);
  const [result, setResult] = useState<{ success?: boolean; loot?: number; arrested?: boolean; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Truck className="size-7 text-primary" /><h2 className="text-2xl font-bold">Cargo Theft</h2></div>
      <p className="text-sm text-muted-foreground">Hijack shipments at the docks for valuable loot. Risk of arrest.</p>
      <button onClick={async () => { try { setResult(await hijack({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">🚛 Hijack Cargo</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400 font-bold">Loot: +${result.loot?.toLocaleString()}</div> : <div className="text-red-400">Failed! {result.arrested && "Arrested!"}</div>}
      </div>}
    </div>
  );
}

// ===== #67 ROULETTE =====
export function RoulettePage() {
  const spin = useMutation(api.gameFeatures.rouletteSpin);
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState("red");
  const [result, setResult] = useState<{ result?: number; color?: string; won?: boolean; winnings?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><CircleDot className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Roulette</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={10} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <div className="grid grid-cols-3 gap-2">
          {(["red", "black", "green"] as const).map((c) => (
            <button key={c} onClick={() => setChoice(c)} className={`py-2 rounded-lg font-bold text-sm ${choice === c ? "ring-2 ring-primary" : ""} ${c === "red" ? "bg-red-600" : c === "black" ? "bg-gray-800" : "bg-green-600"} text-white`}>{c.toUpperCase()}</button>
          ))}
        </div>
        <button onClick={async () => { try { setResult(await spin({ bet, choice }) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg">🎡 Spin!</button>
      </div>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.won ? "border-green-900/30" : ""}`}>
        <div className="text-lg font-bold">{result.color === "red" ? "🔴" : result.color === "black" ? "⚫" : "🟢"} {result.result}</div>
        <div className={`font-bold ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? `Won $${result.winnings?.toLocaleString()}!` : "Lost!"}</div>
      </div>}
    </div>
  );
}

// ===== #68 SLOTS =====
export function SlotsPage() {
  const play = useMutation(api.gameFeatures.playSlots);
  const [bet, setBet] = useState(50);
  const [result, setResult] = useState<{ reels?: string[]; multiplier?: number; won?: boolean; winnings?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Coins className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Slot Machines</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4 text-center">
        <div className="text-4xl tracking-widest">{result?.reels ? result.reels.join("  ") : "❓  ❓  ❓"}</div>
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={5} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-center" />
        <button onClick={async () => { try { setResult(await play({ bet }) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="w-full py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700">🎰 Spin!</button>
        {result && !result.error && <div className={`font-bold text-lg ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? `Won $${result.winnings?.toLocaleString()}! (x${result.multiplier})` : "Lost!"}</div>}
      </div>
    </div>
  );
}

// ===== #77 RUSSIAN ROULETTE =====
export function RussianRoulettePage() {
  const play = useMutation(api.gameFeatures.russianRoulette);
  const [result, setResult] = useState<{ survived?: boolean; prize?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Target className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Russian Roulette</h2></div>
      <p className="text-sm text-muted-foreground">1 in 6 chance of death. Survive and win $50,000.</p>
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-6xl mb-4">🔫</div>
        <button onClick={async () => { try { setResult(await play({}) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700">Pull the Trigger</button>
      </div>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 text-center ${result.survived ? "border-green-900/30" : "border-red-900/30"}`}>
        {result.survived ? <div className="text-green-400 text-lg font-bold">💥 CLICK! You survived! +$50,000</div> : <div className="text-red-400 text-lg font-bold">💀 BANG! You're dead.</div>}
      </div>}
    </div>
  );
}

// ===== #78 DOG FIGHTING =====
export function DogFightPage() {
  const fight = useMutation(api.gameFeatures.dogFight);
  const [targetId, setTargetId] = useState("");
  const [bet, setBet] = useState(1000);
  const [result, setResult] = useState<{ won?: boolean; myDog?: number; theirDog?: number; error?: string } | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Dog className="size-7 text-primary" /><h2 className="text-2xl font-bold">Dog Fighting</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Opponent Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={100} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={async () => { try { setResult(await fight({ opponentId: targetId as any, bet }) as any); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } }} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🐕 Fight Dogs!</button>
      </div>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.won ? "border-green-900/30" : ""}`}>
        <div className="font-bold">{result.won ? "🐕 Your dog won!" : "💀 Your dog lost!"}</div>
        <div className="text-sm text-muted-foreground">Your dog: {result.myDog} vs Their dog: {result.theirDog}</div>
      </div>}
    </div>
  );
}

// ===== #79 STREET RACING =====
export function StreetRacingPage() {
  const create = useMutation(api.gameFeatures.createStreetRace);
  const join = useMutation(api.gameFeatures.joinStreetRace);
  const finish = useMutation(api.gameFeatures.finishStreetRace);
  const races = useQuery(api.gameFeatures.getWaitingRaces);
  const [fee, setFee] = useState(1000);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Car className="size-7 text-primary" /><h2 className="text-2xl font-bold">Street Racing</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} min={100} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" placeholder="Entry fee" />
        <button onClick={() => create({ entryFee: fee })} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🏁 Create Race</button>
      </div>
      {races && races.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm">Waiting Races</h3>
          {races.map((r: any) => (
            <div key={r._id} className="mafia-card rounded-lg p-3 flex justify-between items-center">
              <div><div className="font-bold text-sm">{r.track}</div><div className="text-xs text-muted-foreground">Pot: ${r.prizePool.toLocaleString()} • {r.participants.length} racers</div></div>
              <div className="flex gap-2">
                <button onClick={() => join({ raceId: r._id })} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">Join</button>
                <button onClick={() => finish({ raceId: r._id })} className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded">Go!</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #93 GIFTING =====
export function GiftingPage() {
  const send = useMutation(api.gameFeatures.sendGift);
  const gifts = useQuery(api.gameFeatures.getMyGifts);
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Gift className="size-7 text-primary" /><h2 className="text-2xl font-bold">Gifting</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Recipient Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={100} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message (optional)" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={() => send({ receiverId: targetId as any, amount, message: msg || undefined })} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🎁 Send Gift</button>
      </div>
      {gifts && gifts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm">Received Gifts</h3>
          {gifts.map((g: any) => (
            <div key={g._id} className="mafia-card rounded-lg p-3">
              <div className="text-sm">${g.amount.toLocaleString()}</div>
              {g.message && <div className="text-xs text-muted-foreground">"{g.message}"</div>}
              <div className="text-[10px] text-muted-foreground">{new Date(g.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== #96 HIT LIST =====
export function HitListPage() {
  const post = useMutation(api.gameFeatures.postHitList);
  const hits = useQuery(api.gameFeatures.getActiveHitLists);
  const [targetId, setTargetId] = useState("");
  const [reward, setReward] = useState(5000);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Target className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Hit List</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} min={2000} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={() => post({ targetId: targetId as any, reward })} className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg">🎯 Post Hit ($reward)</button>
      </div>
      {hits && hits.length > 0 && <div className="space-y-2">
        <h3 className="font-bold text-sm">Active Bounties</h3>
        {hits.map((h: any) => <div key={h._id} className="mafia-card rounded-lg p-3 flex justify-between"><span className="text-sm">Target hit</span><span className="text-green-400 font-bold">${h.reward.toLocaleString()}</span></div>)}
      </div>}
    </div>
  );
}

// ===== CRIME CATEGORY PAGE =====
export function CrimeCategoryPage({ categoryId }: { categoryId: string }) {
  const player = useQuery(api.game.getPlayer);
  const [result, setResult] = useState<{ success: boolean; money: number; xp: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const categoryCooldown = (player as any)?.crimeCooldowns?.[categoryId] ?? 0;
  const cooldown = useCooldown(15, categoryCooldown);
  const commitCrime = useMutation(api.game.commitCategoryCrime);
  const grantEgg = useMutation(api.gameExtended.grantEasterEgg);
  const grantGift = useMutation(api.eventGifts.grantEventGift);

  const category = crimeCategories.find(c => c.id === categoryId);

  if (!category) return <div className="text-center py-12 text-muted-foreground">Category not found.</div>;

  const executeCrime = async (crime: Crime) => {
    if ((player?.level ?? 0) < crime.levelRequired) return;
    if ((player?.money ?? 0) < 100) return;
    if (cooldown.onCooldown) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await commitCrime({
        crimeId: crime.id,
        reward: crime.reward,
        risk: crime.risk,
        xp: crime.xp,
      });
      const eggMsg = await maybeDropEasterEgg(grantEgg, res.success);
      const giftMsg = await maybeDropEventGift(grantGift, res.success);
      setResult({ success: res.success, money: res.moneyEarned, xp: res.xpEarned });
      const dropMsgs = [eggMsg, giftMsg].filter(Boolean).join("\n");
      if (dropMsgs) setTimeout(() => alert(dropMsgs), 400);
      cooldown.startCooldown();
    } catch (e) {
      setResult({ success: false, money: 0, xp: 0 });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* RESULT AT TOP */}
      <AnimatePresence>
        {result && (
          <EpicActionResult
            success={result.success}
            money={result.money}
            xp={result.xp}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>

      {/* COOLDOWN TIMER AT TOP */}
      <CooldownBar cooldown={cooldown} />

      <div className="flex items-center gap-3">
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {category.crimes.map((crime) => {
          const hasLevel = (player?.level ?? 0) >= crime.levelRequired;
          const isLocked = !hasLevel;

          return (
            <motion.div
              key={crime.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={!isLocked ? { scale: 1.01, borderColor: "rgba(228,130,51,0.3)" } : undefined}
              className={`mafia-card rounded-xl p-4 transition-all ${isLocked ? "opacity-40" : "hover:border-primary/30 cursor-pointer"} ${loading || cooldown.onCooldown ? "pointer-events-none opacity-60" : ""}`}
              onClick={() => !isLocked && !loading && !cooldown.onCooldown && executeCrime(crime)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{crime.name}</span>
                    {isLocked && <span className="text-[10px] bg-red-950/50 text-red-400 px-2 py-0.5 rounded-full font-bold">🔒 Lv.{crime.levelRequired}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{crime.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-[10px] font-bold ${getCrimeTypeColor("street")}`}>
                      ⚠️ Risk: {crime.risk}%
                    </span>
                    <span className="text-[10px] font-bold text-green-400">💰 ${crime.reward.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-blue-400">⭐ +{crime.xp} XP</span>
                  </div>
                </div>
                {!isLocked && (
                  <div className="ml-4">
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="size-5 border-2 border-primary border-t-transparent rounded-full"
                      />
                    ) : (
                      <ChevronRight className="size-5 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== CRIMES UNIFIED PAGE — ALL CRIMES ONE LIST =====
export function CrimesOverviewPage({ initialCategory }: { initialCategory?: string }) {
  const player = useQuery(api.game.getPlayer);
  const [result, setResult] = useState<{ success: boolean; money: number; xp: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const commitCrime = useMutation(api.game.commitCategoryCrime);
  const grantEgg = useMutation(api.gameExtended.grantEasterEgg);
  const grantGift = useMutation(api.eventGifts.grantEventGift);

  const [lastByCategory, setLastByCategory] = useState<Record<string, number>>({});
  const now = Date.now();
  const activeCdCat = Object.keys(lastByCategory).find(k => now - lastByCategory[k] < 15000);
  const cdRemaining = activeCdCat ? Math.max(0, 15 - Math.floor((now - lastByCategory[activeCdCat]) / 1000)) : 0;

  const allCrimes = crimeCategories.flatMap(c =>
    c.crimes.map(cr => ({ ...cr, categoryId: c.id, categoryName: c.name, categoryIcon: c.icon }))
  );

  const filtered = searchQuery
    ? allCrimes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()) || c.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
    : allCrimes;

  const sorted = [...filtered].sort((a, b) => b.xp - a.xp);

  const executeCrime = async (crime: any) => {
    if ((player?.level ?? 0) < crime.levelRequired) return;
    if ((player?.money ?? 0) < 100) return;
    if (cdRemaining > 0) return;
    setLoading(true); setResult(null);
    try {
      const res = await commitCrime({ crimeId: crime.id, reward: crime.reward, risk: crime.risk, xp: crime.xp });
      const eggMsg = await maybeDropEasterEgg(grantEgg, res.success);
      setResult({ success: res.success, money: res.moneyEarned, xp: res.xpEarned });
      if (eggMsg) setTimeout(() => alert(eggMsg), 400);
      setLastByCategory(prev => ({ ...prev, [crime.categoryId]: Date.now() }));
    } catch (e) { setResult({ success: false, money: 0, xp: 0 }); }
    setLoading(false);
  };

  const catBg: Record<string, string> = {
    street: "bg-green-950/30 border-green-500/20", robbery: "bg-red-950/30 border-red-500/20",
    fraud: "bg-yellow-950/30 border-yellow-500/20", burglary: "bg-orange-950/30 border-orange-500/20",
    drugs: "bg-purple-950/30 border-purple-500/20", organized: "bg-blue-950/30 border-blue-500/20",
    underground: "bg-gray-950/30 border-gray-500/20",
  };

  return (
    <div className="animate-fade-in space-y-4">
      <AnimatePresence>{result && <EpicActionResult success={result.success} money={result.money} xp={result.xp} onClose={() => setResult(null)} />}</AnimatePresence>
      {cdRemaining > 0 && (
        <div className="mafia-card rounded-xl p-3 flex items-center gap-3">
          <span className="text-sm">⏳</span>
          <div className="flex-1"><div className="w-full bg-secondary rounded-full h-2"><div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${((15 - cdRemaining) / 15) * 100}%` }} /></div></div>
          <span className="text-xs font-bold text-red-400">{cdRemaining}s</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div><h2 className="text-2xl font-bold">All Crimes</h2><p className="text-xs text-muted-foreground">{sorted.length} crimes sorted by XP</p></div>
      </div>
      <div className="relative">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search crimes..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 transition" />
        {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">✕</button>}
      </div>
      <div className="space-y-2">
        {sorted.map((crime: any) => {
          const locked = (player?.level ?? 0) < crime.levelRequired;
          return (
            <motion.div key={crime.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={!locked && cdRemaining <= 0 ? { scale: 1.01 } : undefined}
              className={`rounded-xl p-3 border transition-all ${locked ? "opacity-30" : cdRemaining > 0 || loading ? "opacity-50 pointer-events-none" : "hover:border-primary/40 cursor-pointer"} ${catBg[crime.categoryId] || "mafia-card"}`}
              onClick={() => !locked && cdRemaining <= 0 && !loading && executeCrime(crime)}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{crime.categoryIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{crime.name}</span>
                    {locked && <span className="text-[10px] bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded-full font-bold shrink-0">🔒 Lv.{crime.levelRequired}</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{crime.description}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px] font-bold">
                  <span className="text-red-400">{crime.risk}%</span>
                  <span className="text-green-400">${crime.reward.toLocaleString()}</span>
                  <span className="text-blue-400">+{crime.xp} XP</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function LegendaryCrimePage() {
  const dailyCrimes = useMemo(() => getDailyLegendaryCrimes(), []);
  const [resetTimer, setResetTimer] = useState(getTimeUntilReset());
  const [selectedCrime, setSelectedCrime] = useState<LegendaryCrime | null>(null);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; loot?: string } | null>(null);
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  const executeCrime = useMutation(api.gameExtended.commitLegendaryCrime);

  useEffect(() => {
    const interval = setInterval(() => setResetTimer(getTimeUntilReset()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = async (crime: LegendaryCrime) => {
    if (executing || !player) return;
    if (player.level < crime.levelRequired) return;
    setExecuting(true);
    setResult(null);
    try {
      const res = await executeCrime({ crimeId: crime.id, reward: crime.reward });
      if (res.success) {
        const lootDrop = crime.loot?.filter((l) => Math.random() * 100 < l.chance);
        const lootStr = lootDrop && lootDrop.length > 0 ? lootDrop.map(l => l.name).join(', ') : undefined;
        setResult({ success: true, message: `SUCCESS! You earned $${crime.reward.toLocaleString()} and ${crime.xp.toLocaleString()} XP!` + (crime.successStory ? "\n\n" + crime.successStory : ""), loot: lootStr });;
      } else {
        setResult({ success: false, message: `FAILED! You lost $${Math.floor(crime.reward * 0.3).toLocaleString()} and took damage.${crime.failStory ? "\n\n" + crime.failStory : ""}` });
      }
    } catch {
      setResult({ success: false, message: "Something went wrong. The crime failed." });
    } finally {
      setExecuting(false);
    }
  };

  const config = (r: string) => RARITY_CONFIG[r as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.epic;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyMTUsMCwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2RvdHMpIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-yellow-400">⚡ LEGENDARY CRIMES</h2>
              <p className="text-sm text-yellow-200/60">Once-per-day crimes with massive rewards. Miss today and they're gone forever.</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-yellow-200/40 uppercase tracking-widest">Resets in</div>
              <div className="font-mono text-2xl font-black text-yellow-400">{resetTimer}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Crime Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dailyCrimes.map((crime, i) => {
          const rc = config(crime.rarity);
          const canAfford = player && player.money >= crime.reward * 0.1;
          const canLevel = player && player.level >= crime.levelRequired;
          return (
            <motion.div
              key={crime.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={() => canLevel && setSelectedCrime(crime)}
              className={`relative overflow-hidden rounded-xl border-2 ${rc.border} bg-gray-900/90 backdrop-blur cursor-pointer transition-all hover:shadow-lg hover:${rc.glow} ${!canLevel ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {/* Rarity glow */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rc.gradient}`} />
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{crime.icon}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${rc.badge} uppercase tracking-wider`}>\n                    {rc.particle} {rc.label}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-white mb-1">{crime.name}</h3>
                <p className="text-xs text-gray-400 italic mb-3">"{crime.flavor}"</p>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{crime.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Reward</div>
                    <div className="text-sm font-bold text-yellow-400">${crime.reward.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">XP</div>
                    <div className="text-sm font-bold text-blue-400">+{crime.xp.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Risk</div>
                    <div className={`text-sm font-bold ${crime.risk >= 90 ? 'text-red-400' : crime.risk >= 70 ? 'text-orange-400' : 'text-yellow-400'}`}>{crime.risk}%</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Crew</div>
                    <div className="text-sm font-bold text-purple-400">{crime.crewRequired}+</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Lv. {crime.levelRequired} required</span>
                  {!canLevel && <span className="text-xs text-red-400 font-bold">LOCKED</span>}
                  {canLevel && <span className="text-xs text-green-400 font-bold">READY</span>}
                </div>

                {crime.loot && crime.loot.length > 0 && (
                  <div className="mt-3 border-t border-gray-700/50 pt-3">
                    <div className="text-xs text-gray-500 mb-1">Potential Loot:</div>
                    <div className="flex flex-wrap gap-1">
                      {crime.loot.map((l, j) => (
                        <span key={j} className="text-[10px] bg-gray-800/80 rounded-full px-2 py-0.5 text-gray-300">
                          {l.name} ({l.chance}%) - ${l.value.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Execution Modal */}
      {selectedCrime && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gray-900 border-2 border-yellow-500/50 rounded-2xl max-w-lg w-full p-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config(selectedCrime.rarity).gradient}`} />
            
            <button onClick={() => { setSelectedCrime(null); setResult(null); }} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">✕</button>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{selectedCrime.icon}</div>
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black ${config(selectedCrime.rarity).badge} mb-3`}>\n                {config(selectedCrime.rarity).particle} {config(selectedCrime.rarity).label}\n              </span>
              <h2 className="text-2xl font-black text-white">{selectedCrime.name}</h2>
              <p className="text-sm text-gray-400 italic mt-1">"{selectedCrime.flavor}"</p>
            </div>

            <p className="text-sm text-gray-300 text-center mb-6">{selectedCrime.description}</p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Reward</div>
                <div className="text-lg font-black text-yellow-400">${selectedCrime.reward.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">XP</div>
                <div className="text-lg font-black text-blue-400">+{selectedCrime.xp.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Risk</div>
                <div className="text-lg font-black text-red-400">{selectedCrime.risk}%</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Crew</div>
                <div className="text-lg font-black text-purple-400">{selectedCrime.crewRequired}</div>
              </div>
            </div>

            {selectedCrime.loot && (
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-300 mb-2">💰 Potential Loot Drops:</div>
                <div className="space-y-2">
                  {selectedCrime.loot.map((l, j) => (
                    <div key={j} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <span className="text-sm text-white">{l.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-yellow-400">${l.value.toLocaleString()}</span>
                        <span className="text-xs bg-gray-700 rounded-full px-2 py-0.5 text-gray-300">{l.chance}% chance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 mb-4 ${result.success ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                <div className={`text-center font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>{result.message}</div>
                {result.loot && <div className="text-center text-sm text-yellow-300 mt-2">🎒 Loot: {result.loot}</div>}
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setSelectedCrime(null); setResult(null); }} className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-400 font-bold hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleExecute(selectedCrime)}
                disabled={executing || (player ? player.money < selectedCrime.reward * 0.1 : true)}
                className={`flex-1 px-4 py-3 rounded-xl font-black text-lg transition-all ${executing ? 'bg-gray-700 text-gray-500 cursor-wait' : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg shadow-orange-500/20'}`}
              >
                {executing ? '⏳ Executing...' : '⚡ EXECUTE CRIME'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ===== LEGENDARY BOSS FIGHTS =====
import { legendaryBosses, getBossById } from "@/data/bosses";

export function BossFightsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(0);
  const [bossHp, setBossHp] = useState(0);
  const [inCombat, setInCombat] = useState(false);
  const [combatResult, setCombatResult] = useState<"win" | "lose" | null>(null);
  const [bossPersisted, setBossPersisted] = useState(false);
  const defeatBossMut = useMutation(api.game.defeatBoss);

  const boss = selectedBoss ? getBossById(selectedBoss) : null;

  useEffect(() => {
    if (player) {
      setPlayerHp(player.life ?? 100);
    }
  }, [player]);

  const startBattle = (bossId: string) => {
    const b = getBossById(bossId);
    if (!b || !player) return;
    setSelectedBoss(bossId);
    setPlayerHp(player.life ?? 100);
    setBossHp(b.health);
    setBattleLog(["Battle started!"]);
    setInCombat(true);
    setCombatResult(null);
    setBossPersisted(false);
  };

  const attack = async () => {
    if (!boss || !inCombat || combatResult) return;

    const playerDmg = Math.max(1, (player?.attack ?? 10) - Math.floor(boss.defense * 0.3) + Math.floor(Math.random() * 20));
    const bossDmg = Math.max(1, boss.attack - Math.floor((player?.defense ?? 10) * 0.3) + Math.floor(Math.random() * 15));

    const newBossHp = Math.max(0, bossHp - playerDmg);
    const newPlayerHp = Math.max(0, playerHp - bossDmg);

    setBossHp(newBossHp);
    setPlayerHp(newPlayerHp);

    setBattleLog(prev => [
      ...prev,
      `You dealt ${playerDmg} damage!`,
      `${boss.name} dealt ${bossDmg} damage!`,
    ]);

    if (newBossHp <= 0) {
      setCombatResult("win");
      setBattleLog(prev => [...prev, "🎉 VICTORY! You defeated the boss!"]);
      if (!bossPersisted) {
        setBossPersisted(true);
        try { await defeatBossMut({ bossId: boss.id, reward: boss.reward, xp: boss.xpReward, won: true }); } catch {}
      }
    } else if (newPlayerHp <= 0) {
      setCombatResult("lose");
      setBattleLog(prev => [...prev, "💀 DEFEAT! You were eliminated."]);
      if (!bossPersisted) {
        setBossPersisted(true);
        try { await defeatBossMut({ bossId: boss.id, reward: 0, xp: 0, won: false }); } catch {}
      }
    }
  };

  if (selectedBoss && boss) {
    return (
      <div className="animate-fade-in space-y-6">
        <button onClick={() => { setSelectedBoss(null); setInCombat(false); }}
          className="text-sm text-muted-foreground hover:text-foreground">← Back to Bosses</button>

        <div className="mafia-card rounded-xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-2">{boss.icon}</div>
            <h2 className="text-2xl font-bold">{boss.name}</h2>
            <p className="text-sm text-muted-foreground">{boss.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Your HP</div>
              <div className="h-3 rounded-full bg-background/60 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                  style={{ width: `${(playerHp / (player?.maxLife ?? 100)) * 100}%` }} />
              </div>
              <div className="text-sm font-bold mt-1">{playerHp}/{player?.maxLife ?? 100}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{boss.name} HP</div>
              <div className="h-3 rounded-full bg-background/60 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all"
                  style={{ width: `${(bossHp / boss.health) * 100}%` }} />
              </div>
              <div className="text-sm font-bold mt-1">{bossHp}/{boss.health}</div>
            </div>
          </div>

          {!combatResult && inCombat && (
            <button onClick={attack}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-lg hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-900/20">
              ⚔️ ATTACK
            </button>
          )}

          {combatResult && (
            <div className={`p-4 rounded-xl text-center ${combatResult === "win" ? "bg-green-950/50 border border-green-800/50" : "bg-red-950/50 border border-red-800/50"}`}>
              <div className={`text-2xl font-bold ${combatResult === "win" ? "text-green-400" : "text-red-400"}`}>
                {combatResult === "win" ? "🎉 VICTORY!" : "💀 DEFEAT"}
              </div>
              {combatResult === "win" && (
                <div className="mt-2 space-y-1">
                  <div className="text-green-400">💰 +${boss.reward.toLocaleString()}</div>
                  <div className="text-blue-400">⭐ +{boss.xpReward} XP</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mafia-card rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2">Battle Log</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {battleLog.map((log, i) => (
              <div key={i} className="text-xs text-muted-foreground">{log}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚔️</span>
        <div>
          <h2 className="text-2xl font-bold">Legendary Boss Fights</h2>
          <p className="text-sm text-muted-foreground">Challenge the most powerful crime bosses in the underworld.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {legendaryBosses.map(boss => {
          const canFight = (player?.level ?? 0) >= boss.levelRequired;
          return (
            <motion.div
              key={boss.id}
              whileHover={canFight ? { scale: 1.02 } : {}}
              className={`mafia-card rounded-xl p-5 transition-all ${canFight ? "hover:border-red-500/30 cursor-pointer" : "opacity-50"}`}
              onClick={() => canFight && startBattle(boss.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{boss.icon}</div>
                <div className="flex-1">
                  <div className="font-bold">{boss.name}</div>
                  <div className="text-xs text-muted-foreground">{boss.title}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-red-400">ATK {boss.attack}</span>
                    <span className="text-[10px] text-blue-400">DEF {boss.defense}</span>
                    <span className="text-[10px] text-green-400">HP {boss.health}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-400">${boss.reward.toLocaleString()}</div>
                  {!canFight && <div className="text-[10px] text-red-400">Lv.{boss.levelRequired}</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== CRIME EMPIRE MAP =====
export function CrimeEmpirePage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const cities = [
    { name: "New York", icon: "🗽", territories: 5, control: 60 },
    { name: "Chicago", icon: "🏙️", territories: 4, control: 45 },
    { name: "Las Vegas", icon: "🎰", territories: 6, control: 80 },
    { name: "Miami", icon: "🌴", territories: 3, control: 30 },
    { name: "Los Angeles", icon: "🎬", territories: 5, control: 55 },
    { name: "Detroit", icon: "🏭", territories: 4, control: 40 },
    { name: "Philadelphia", icon: "🔔", territories: 3, control: 25 },
    { name: "Boston", icon: "📚", territories: 3, control: 35 },
    { name: "Atlanta", icon: "🍑", territories: 4, control: 50 },
    { name: "Dallas", icon: "🌵", territories: 3, control: 20 },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🗺️</span>
        <div>
          <h2 className="text-2xl font-bold">Crime Empire</h2>
          <p className="text-sm text-muted-foreground">Expand your influence across the city. Control territories for passive income.</p>
        </div>
      </div>

      <div className="mafia-card rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div><div className="text-2xl font-bold text-primary">{cities.length}</div><div className="text-xs text-muted-foreground">Cities</div></div>
          <div><div className="text-2xl font-bold text-green-400">6</div><div className="text-xs text-muted-foreground">Controlled</div></div>
          <div><div className="text-2xl font-bold text-yellow-400">42%</div><div className="text-xs text-muted-foreground">Total Control</div></div>
          <div><div className="text-2xl font-bold text-blue-400">$12,500</div><div className="text-xs text-muted-foreground">Daily Income</div></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cities.map(city => (
          <motion.div
            key={city.name}
            whileHover={{ scale: 1.05 }}
            className="mafia-card rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => setSelectedCity(city.name)}
          >
            <div className="text-3xl mb-2">{city.icon}</div>
            <div className="font-bold text-sm">{city.name}</div>
            <div className="mt-2">
              <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/50 transition-all"
                  style={{ width: `${city.control}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{city.control}% control</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===== HEIST PLANNING =====
export function HeistPlanningPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedHeist, setSelectedHeist] = useState<string | null>(null);

  const heists = [
    { id: "bank_vault", name: "National Bank Vault", icon: "🏦", difficulty: "Hard", reward: 50000, time: "3 hours", members: 4, level: 20 },
    { id: "casino_royal", name: "Casino Royale", icon: "🎰", difficulty: "Extreme", reward: 100000, time: "5 hours", members: 6, level: 25 },
    { id: "diamond_mine", name: "Diamond Mine", icon: "💎", difficulty: "Medium", reward: 30000, time: "2 hours", members: 3, level: 15 },
    { id: "art_museum", name: "National Art Museum", icon: "🖼️", difficulty: "Hard", reward: 40000, time: "4 hours", members: 5, level: 18 },
    { id: "government", name: "Government Building", icon: "🏛️", difficulty: "Legendary", reward: 200000, time: "8 hours", members: 8, level: 30 },
  ];

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-orange-400";
      case "Extreme": return "text-red-400";
      case "Legendary": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📋</span>
        <div>
          <h2 className="text-2xl font-bold">Heist Planning</h2>
          <p className="text-sm text-muted-foreground">Plan and execute high-stakes heists with your crew.</p>
        </div>
      </div>

      <div className="space-y-3">
        {heists.map(h => {
          const canHeist = (player?.level ?? 0) >= h.level;
          return (
            <motion.div
              key={h.id}
              whileHover={canHeist ? { scale: 1.01 } : {}}
              className={`mafia-card rounded-xl p-5 transition-all ${canHeist ? "hover:border-primary/30 cursor-pointer" : "opacity-50"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{h.icon}</div>
                  <div>
                    <div className="font-bold">{h.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-semibold ${getDifficultyColor(h.difficulty)}`}>{h.difficulty}</span>
                      <span className="text-xs text-muted-foreground">⏱️ {h.time}</span>
                      <span className="text-xs text-muted-foreground">👥 {h.members} members</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">${h.reward.toLocaleString()}</div>
                  {!canHeist && <div className="text-[10px] text-red-400">Lv.{h.level} required</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== DYNAMIC WORLD EVENTS =====
import { worldEvents, getEventTypeColor, getEventTypeBg } from "@/data/events";

export function WorldEventsPage() {
  const player = useQuery(api.game.getPlayer);
  const [activeEvents] = useState(worldEvents.slice(0, 5)); // Simulate active events

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚡</span>
        <div>
          <h2 className="text-2xl font-bold">World Events</h2>
          <p className="text-sm text-muted-foreground">Real-time events that affect all players. Act fast!</p>
        </div>
      </div>

      <div className="space-y-3">
        {activeEvents.map(event => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl p-5 border ${getEventTypeBg(event.type)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{event.icon}</div>
                <div>
                  <div className="font-bold">{event.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-semibold ${getEventTypeColor(event.type)}`}>
                      {event.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">⏱️ {event.duration}h remaining</span>
                    {(event.multiplier ?? 0) > 1 && (
                      <span className="text-[10px] text-yellow-400">🔥 {event.multiplier}x rewards</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {event.rewards.money > 0 && <div className="text-sm text-green-400">+${event.rewards.money.toLocaleString()}</div>}
                {event.rewards.xp > 0 && <div className="text-xs text-blue-400">+{event.rewards.xp} XP</div>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===== CRIMINAL PETS =====
import { criminalPets, getPetRarityColor, getPetRarityBg } from "@/data/pets";

export function CriminalPetsPage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredPets = filter === "all" ? criminalPets : criminalPets.filter(p => p.rarity === filter);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🐾</span>
        <div>
          <h2 className="text-2xl font-bold">Criminal Pets</h2>
          <p className="text-sm text-muted-foreground">Companion animals with unique abilities to aid your crimes.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "common", "uncommon", "rare", "epic", "legendary"].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filter === r ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground hover:text-foreground"
            }`}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPets.map(pet => {
          const canBuy = (player?.level ?? 0) >= pet.levelRequired && (player?.money ?? 0) >= pet.price;
          return (
            <motion.div
              key={pet.id}
              whileHover={canBuy ? { scale: 1.02 } : {}}
              className={`rounded-xl p-4 border transition-all ${getPetRarityBg(pet.rarity)} ${canBuy ? "cursor-pointer hover:shadow-lg" : "opacity-50"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{pet.icon}</div>
                <div>
                  <div className="font-bold">{pet.name}</div>
                  <div className={`text-xs ${getPetRarityColor(pet.rarity)}`}>{pet.rarity}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{pet.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm font-bold text-green-400">${pet.price.toLocaleString()}</div>
                {!canBuy && <div className="text-[10px] text-red-400">Lv.{pet.levelRequired}</div>}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                <span className="text-red-400">+{pet.attackBonus} ATK</span> • <span className="text-blue-400">+{pet.defenseBonus} DEF</span>
              </div>
              <div className="mt-1 text-[10px] text-primary">
                ✨ {pet.specialAbility}: {pet.abilityDescription}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== BLACK MARKET DEALER =====
import { blackMarketItems, getBlackMarketRarityColor, getBlackMarketRarityBg } from "@/data/blackmarket";

export function BlackMarketPage() {
  const player = useQuery(api.game.getPlayer);
  const [filter, setFilter] = useState<string>("all");
  const [purchased, setPurchased] = useState<string | null>(null);

  const filtered = filter === "all" ? blackMarketItems : blackMarketItems.filter(i => i.rarity === filter);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏴‍☠️</span>
        <div>
          <h2 className="text-2xl font-bold">Black Market Dealer</h2>
          <p className="text-sm text-muted-foreground">Rare and powerful items from the shadows. New stock rotates every 24 hours.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "common", "uncommon", "rare", "epic", "legendary"].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filter === r ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground hover:text-foreground"
            }`}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => {
          const canBuy = (player?.money ?? 0) >= item.price;
          return (
            <motion.div
              key={item.id}
              whileHover={canBuy ? { scale: 1.01 } : {}}
              className={`rounded-xl p-4 border transition-all ${getBlackMarketRarityBg(item.rarity)} ${canBuy ? "cursor-pointer hover:shadow-lg hover:shadow-primary/10" : "opacity-60"}`}
              onClick={() => {
                if (canBuy) {
                  setPurchased(item.id);
                  setTimeout(() => setPurchased(null), 2000);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getBlackMarketRarityColor(item.rarity)}`}>{item.rarity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-primary">✨ {item.effect}</span>
                    {item.duration && <span className="text-[10px] text-yellow-400">⏱️ {item.duration}h</span>}
                    {item.stackable && <span className="text-[10px] text-muted-foreground">Stack: {item.maxStack}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">${item.price.toLocaleString()}</div>
                  {purchased === item.id && <div className="text-[10px] text-green-400">✅ Bought!</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ===== CRIME FAME SYSTEM =====
import { fameTitles, getFameTierColor, getFameTierBg } from "@/data/fame";

export function CrimeFamePage() {
  const player = useQuery(api.game.getPlayer);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? fameTitles : fameTitles.filter(t => t.tier === filter);
  const tierOrder = ["bronze", "silver", "gold", "platinum", "diamond"];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <div>
          <h2 className="text-2xl font-bold">Crime Fame</h2>
          <p className="text-sm text-muted-foreground">Earn titles based on your criminal accomplishments. Each tier grants powerful bonuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {tierOrder.map(tier => {
          const count = fameTitles.filter(t => t.tier === tier).length;
          return (
            <button key={tier} onClick={() => setFilter(tier)}
              className={`p-2 rounded-lg text-center transition-all ${
                filter === tier ? getFameTierBg(tier) : "bg-background/50"
              }`}>
              <div className={`text-xs font-bold capitalize ${filter === tier ? getFameTierColor(tier) : "text-muted-foreground"}`}>{tier}</div>
              <div className="text-[10px] text-muted-foreground">{count} titles</div>
            </button>
          );
        })}
      </div>

      {filter !== "all" && (
        <button onClick={() => setFilter("all")} className="text-xs text-muted-foreground hover:text-foreground">
          ← Show all tiers
        </button>
      )}

      <div className="space-y-3">
        {filtered.map(title => {
          const bonuses = [
            title.bonuses.attack ? `+${title.bonuses.attack} ATK` : null,
            title.bonuses.defense ? `+${title.bonuses.defense} DEF` : null,
            title.bonuses.money ? `+$${title.bonuses.money.toLocaleString()} Money` : null,
            title.bonuses.xp ? `+${title.bonuses.xp} XP` : null,
          ].filter(Boolean);

          return (
            <motion.div
              key={title.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 border transition-all ${getFameTierBg(title.tier)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{title.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{title.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getFameTierColor(title.tier)}`}>{title.tier}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{title.description}</p>
                  <div className="text-[10px] text-yellow-400 mt-1">📋 {title.requirement}</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {bonuses.map((b, i) => (
                      <span key={i} className="text-[10px] text-green-400 bg-green-950/30 px-2 py-0.5 rounded-full">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

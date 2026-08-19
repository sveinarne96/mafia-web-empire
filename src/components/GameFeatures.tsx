import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, MapPin, FileText, Shield, Crosshair, Timer, Scroll,
  SwordsIcon, Target, DollarSign, Home, Store, TrendingUp,
  Printer, Pill, Flame, UserX, Gun, EyeOff, Receipt, Banknote,
  Casino, Coins, Truck, Spade, Circle, Trophy, Bomb, Dog, Car,
  Crown, Flag, Handshake, Brain, GraduationCap, Users, Ruler,
  Gift, CrosshairIcon, Vote, Globe, Skull, Swords as SwordsIcon2,
  Map, Clock, Award, Briefcase, Heart, Zap, Lock, ArrowUp,
  SwordsIcon as SwordsIcon3, CircleDot, Target as TargetIcon,
  Crosshair as CrosshairIcon, Landmark, BarChart3, ArrowRightLeft,
} from "lucide-react";

// ===== #20 PRISON TIME DISPLAY =====
export function PrisonTimeDisplay() {
  const status = useQuery(api.gameFeatures.getPrisonTimeDisplay);
  if (!status) return null;
  return (
    <div className="mafia-card rounded-xl p-4 border border-red-900/30">
      <div className="flex items-center gap-2 mb-2"><Clock className="size-4 text-red-400" /><span className="font-bold text-sm">Time Remaining</span></div>
      <div className="text-2xl font-bold text-red-400">{status.hours}h {status.minutes}m</div>
      {status.job && <div className="text-xs text-muted-foreground mt-1">Job: {status.job}</div>}
      {status.gang && <div className="text-xs text-muted-foreground">Gang: {status.gang}</div>}
      {status.solitary && <div className="text-xs text-red-400 mt-1">🔒 In Solitary</div>}
      <div className="text-xs text-muted-foreground mt-1">Cell Level: {status.cellLevel}</div>
    </div>
  );
}

// ===== #23 DEATH MATCH =====
export function DeathMatchPage() {
  const deathMatch = useMutation(api.gameFeatures.deathMatchJoin);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { const r = await deathMatch({}); setResult(r); }
    catch (e: any) { setResult({ error: e.message }); }
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
          {rankings.map((p, i) => (
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
          {contracts.map((c) => (
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
          {logs.map((l) => (
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
    { key: "boxing", name: "Boxing", icon: "🥊", cost: 5000, desc: "+5 ATK, fast combos", atk: 5 },
    { key: "jiu_jitsu", name: "Jiu-Jitsu", icon: "🥋", cost: 8000, desc: "+8 DEF, counter moves", def: 8 },
    { key: "street", name: "Street Fighting", icon: "👊", cost: 3000, desc: "+3 ATK, dirty tricks", atk: 3 },
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
          <motion.button key={s.key} whileTap={{ scale: 0.98 }} onClick={() => learn({ style: s.key as any })} className="mafia-card rounded-xl p-5 text-left hover:border-primary/30 border border-border transition-all">
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
export function StockMarketPage() {
  const stocks = useQuery(api.gameFeatures.getStocks);
  const myStocks = useQuery(api.gameFeatures.getMyStocks);
  const buyStock = useMutation(api.gameFeatures.buyStock);
  const sellStock = useMutation(api.gameFeatures.sellStock);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><TrendingUp className="size-7 text-green-400" /><h2 className="text-2xl font-bold">Stock Market</h2></div>
      {stocks && stocks.length === 0 && <div className="text-sm text-muted-foreground">No stocks available. Admin needs to seed them.</div>}
      <div className="space-y-2">
        {stocks?.map((s) => (
          <div key={s._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">{s.name} <span className="text-muted-foreground text-xs">({s.symbol})</span></div>
              <div className={`text-sm font-bold ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>${s.price} ({s.change >= 0 ? "+" : ""}{s.change})</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => buyStock({ stockId: s._id, shares: 1 })} className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">Buy</button>
              <button onClick={() => sellStock({ stockId: s._id, shares: 1 })} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">Sell</button>
            </div>
          </div>
        ))}
      </div>
      {myStocks && myStocks.length > 0 && (
        <div><h3 className="font-bold text-sm mb-2">My Holdings</h3>
          {myStocks.map((h) => (
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
export function RealEstatePage() {
  const props = useQuery(api.gameFeatures.getProperties, {});
  const buyProp = useMutation(api.gameFeatures.buyProperty);
  const collect = useMutation(api.gameFeatures.collectPropertyIncome);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Home className="size-7 text-primary" /><h2 className="text-2xl font-bold">Real Estate</h2></div>
      <button onClick={() => collect({})} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg">💰 Collect All Income</button>
      <div className="space-y-2">
        {props?.map((p) => (
          <div key={p._id} className="mafia-card rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div><div className="font-bold text-sm">{p.name}</div><div className="text-xs text-muted-foreground">{p.city} • {p.type}</div></div>
              <div className="text-right">
                <div className="text-xs text-green-400">${p.income.toLocaleString()}/day</div>
                {p.ownerId ? <div className="text-[10px] text-muted-foreground">Owned</div> : (
                  <button onClick={() => buyProp({ propertyId: p._id })} className="text-xs font-bold text-primary">${p.price.toLocaleString()}</button>
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
export function BusinessesPage() {
  const biz = useQuery(api.gameFeatures.getMyBusinesses);
  const upgrade = useMutation(api.gameFeatures.upgradeBusiness);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Store className="size-7 text-primary" /><h2 className="text-2xl font-bold">Businesses</h2></div>
      {!biz || biz.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground">No businesses yet. Visit the Airport or use the Company page.</div>
      ) : (
        <div className="space-y-2">
          {biz.map((b) => (
            <div key={b._id} className="mafia-card rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div><div className="font-bold text-sm">{b.name}</div><div className="text-xs text-muted-foreground">Lv.{b.level} • {b.city}</div></div>
                <div className="text-right">
                  <div className="text-xs text-green-400">${b.income.toLocaleString()}/day</div>
                  <button onClick={() => upgrade({ businessId: b._id })} className="text-xs font-bold text-primary">Upgrade ${(b.level * 10000).toLocaleString()}</button>
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
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Printer className="size-7 text-primary" /><h2 className="text-2xl font-bold">Counterfeiting</h2></div>
      <p className="text-sm text-muted-foreground">Print fake money. Higher skill = higher success. Risk of arrest.</p>
      <button onClick={async () => { try { setResult(await forge({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">🖨️ Print Money ($500 cost)</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : result.arrested ? "border-red-900/30" : ""}`}>
        {result.success ? <div className="text-green-400 font-bold">+$`{result.earned.toLocaleString()}` counterfeit!</div> : result.arrested ? <div className="text-red-400 font-bold">🚨 Arrested!</div> : <div className="text-yellow-400">Failed, but got away.</div>}
      </div>}
    </div>
  );
}

// ===== #55 DRUG TRAFFICKING =====
export function DrugTraffickingPage() {
  const deal = useMutation(api.gameFeatures.drugDeal);
  const [qty, setQty] = useState(10);
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Pill className="size-7 text-primary" /><h2 className="text-2xl font-bold">Drug Trafficking</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Buy at $100/unit, sell for 1.5-2.5x. Risk of bust.</div>
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={async () => { try { setResult(await deal({ quantity: qty })); } catch (e: any) { setResult({ error: e.message }); } }} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">Sell {qty} units (${(qty * 100).toLocaleString()})</button>
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
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Flame className="size-7 text-orange-400" /><h2 className="text-2xl font-bold">Arson</h2></div>
      <p className="text-sm text-muted-foreground">Burn buildings for insurance payouts. High risk of arrest and wanted level.</p>
      <button onClick={async () => { try { setResult(await burn({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700">🔥 Commit Arson</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : "border-red-900/30"}`}>
        {result.success ? <div className="text-green-400 font-bold">+$`{result.payout.toLocaleString()}` insurance payout!</div> : <div className="text-red-400">Failed! {result.arrested && "Arrested!"}</div>}
      </div>}
    </div>
  );
}

// ===== #57 IDENTITY THEFT =====
export function IdentityTheftPage() {
  const steal = useMutation(api.gameFeatures.commitIdentityTheft);
  const [targetId, setTargetId] = useState("");
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><UserX className="size-7 text-primary" /><h2 className="text-2xl font-bold">Identity Theft</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={async () => { try { setResult(await steal({ targetId: targetId as any })); } catch (e: any) { setResult({ error: e.message }); } }} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🎭 Steal Identity</button>
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
      <div className="flex items-center gap-3"><Gun className="size-7 text-primary" /><h2 className="text-2xl font-bold">Arms Dealer</h2></div>
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
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><EyeOff className="size-7 text-primary" /><h2 className="text-2xl font-bold">Witness Intimidation</h2></div>
      <p className="text-sm text-muted-foreground">Reduce your wanted level by intimidating witnesses. They might report you instead!</p>
      <button onClick={async () => { try { setResult(await scare({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">👁️ Intimidate Witnesses</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400">Wanted level reduced by {result.reduction}!</div> : <div className="text-red-400">{result.message}</div>}
      </div>}
    </div>
  );
}

// ===== #61 TAX EVASION =====
export function TaxEvasionPage() {
  const evade = useMutation(api.gameFeatures.evadeTaxes);
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Receipt className="size-7 text-primary" /><h2 className="text-2xl font-bold">Tax Evasion</h2></div>
      <p className="text-sm text-muted-foreground">Hide your income from the government. 70% success rate. Getting caught means heavy fines.</p>
      <button onClick={async () => { try { setResult(await evade({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">📋 Evade Taxes</button>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.success ? "border-green-900/30" : ""}`}>
        {result.success ? <div className="text-green-400">Saved ${result.savedTax?.toLocaleString()} in taxes!</div> : <div className="text-red-400">Caught! Fine: ${result.fine?.toLocaleString()}</div>}
      </div>}
    </div>
  );
}

// ===== #62 RACKETEERING =====
export function RacketeeringPage() {
  const collect = useMutation(api.gameFeatures.collectRacket);
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Banknote className="size-7 text-primary" /><h2 className="text-2xl font-bold">Racketeering</h2></div>
      <p className="text-sm text-muted-foreground">Collect protection money from local businesses. 15% chance of being reported.</p>
      <button onClick={async () => { try { setResult(await collect({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">💰 Collect Protection Money</button>
      {result && !result.error && <div className="mafia-card rounded-xl p-4">
        <div className="text-green-400 font-bold">+$`{result.income?.toLocaleString()}`</div>
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
      <div className="flex items-center gap-3"><Casino className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Gambling Dens</h2></div>
      <p className="text-sm text-muted-foreground">Open your own underground casino. Generates $2,000/day income.</p>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm">
          {["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"].map(c => <option key={c}>{c}</option>)}
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
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Truck className="size-7 text-primary" /><h2 className="text-2xl font-bold">Cargo Theft</h2></div>
      <p className="text-sm text-muted-foreground">Hijack shipments at the docks for valuable loot. Risk of arrest.</p>
      <button onClick={async () => { try { setResult(await hijack({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">🚛 Hijack Cargo</button>
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
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><CircleDot className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Roulette</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={10} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <div className="grid grid-cols-3 gap-2">
          {["red", "black", "green"].map((c) => (
            <button key={c} onClick={() => setChoice(c)} className={`py-2 rounded-lg font-bold text-sm ${choice === c ? "ring-2 ring-primary" : ""} ${c === "red" ? "bg-red-600" : c === "black" ? "bg-gray-800" : "bg-green-600"} text-white`}>{c.toUpperCase()}</button>
          ))}
        </div>
        <button onClick={async () => { try { setResult(await spin({ bet, choice })); } catch (e: any) { setResult({ error: e.message }); } }} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg">🎡 Spin!</button>
      </div>
      {result && !result.error && <div className={`mafia-card rounded-xl p-4 ${result.won ? "border-green-900/30" : ""}`}>
        <div className="text-lg font-bold">{result.color === "red" ? "🔴" : result.color === "black" ? "⚫" : "🟢"} {result.result}</div>
        <div className={`font-bold ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? `Won $${result.winnings.toLocaleString()}!` : "Lost!"}</div>
      </div>}
    </div>
  );
}

// ===== #68 SLOTS =====
export function SlotsPage() {
  const play = useMutation(api.gameFeatures.playSlots);
  const [bet, setBet] = useState(50);
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Coins className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Slot Machines</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4 text-center">
        <div className="text-4xl tracking-widest">{result ? result.reels?.join("  ") : "❓  ❓  ❓"}</div>
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={5} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-center" />
        <button onClick={async () => { try { setResult(await play({ bet })); } catch (e: any) { setResult({ error: e.message }); } }} className="w-full py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700">🎰 Spin!</button>
        {result && !result.error && <div className={`font-bold text-lg ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? `Won $${result.winnings.toLocaleString()}! (x${result.multiplier})` : "Lost!"}</div>}
      </div>
    </div>
  );
}

// ===== #77 RUSSIAN ROULETTE =====
export function RussianRoulettePage() {
  const play = useMutation(api.gameFeatures.russianRoulette);
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><TargetIcon className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Russian Roulette</h2></div>
      <p className="text-sm text-muted-foreground">1 in 6 chance of death. Survive and win $50,000.</p>
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-6xl mb-4">🔫</div>
        <button onClick={async () => { try { setResult(await play({})); } catch (e: any) { setResult({ error: e.message }); } }} className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700">Pull the Trigger</button>
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
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Dog className="size-7 text-primary" /><h2 className="text-2xl font-bold">Dog Fighting</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Opponent Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={100} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={async () => { try { setResult(await fight({ opponentId: targetId as any, bet })); } catch (e: any) { setResult({ error: e.message }); } }} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🐕 Fight Dogs!</button>
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
        <button onClick={() => create({ entryFee: fee })} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg">🏁 Create Race ($fee)</button>
      </div>
      {races && races.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm">Waiting Races</h3>
          {races.map((r) => (
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
          {gifts.map((g) => (
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
      <div className="flex items-center gap-3"><CrosshairIcon className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Hit List</h2></div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} min={2000} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm" />
        <button onClick={() => post({ targetId: targetId as any, reward })} className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg">🎯 Post Hit ($reward)</button>
      </div>
      {hits && hits.length > 0 && <div className="space-y-2">
        <h3 className="font-bold text-sm">Active Bounties</h3>
        {hits.map((h) => <div key={h._id} className="mafia-card rounded-lg p-3 flex justify-between"><span className="text-sm">Target hit</span><span className="text-green-400 font-bold">${h.reward.toLocaleString()}</span></div>)}
      </div>}
    </div>
  );
}

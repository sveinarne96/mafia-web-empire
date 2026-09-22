import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Crown, MapPin, Hammer, Trophy, Globe, TrendingUp, Landmark,
  Car, Shield, Users, Eye, Target, Gavel, Swords, Handshake,
  Ticket, Building2, Banknote, Coins, ShieldAlert,
  Cloud, Newspaper, Skull, TreePine, Flame,
  Gem, Calendar, BarChart3, Bomb, Ghost, Tv, Clock, Zap, Heart,
  Send, Lock, Radio, Wifi, Loader2, Star, Award, ChevronRight, AlertTriangle,
} from "lucide-react";

function LC() {
  return <div className="flex items-center justify-center h-40"><Loader2 className="size-6 animate-spin text-primary" /></div>;
}

function MC({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

// ===== #1 LIVE CHAT =====
export function LiveChatPage() {
  const [channel, setChannel] = useState("general");
  const [msg, setMsg] = useState("");
  const messages = useQuery(api.allFeatures.getChatMessages, { channel });
  const send = useMutation(api.allFeatures.sendChatMessage);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length]);
  const channels = ["general", "crime", "trade", "pvp"];
  const handleSend = async () => { if (!msg.trim()) return; try { await send({ channel, content: msg.trim() }); setMsg(""); } catch {} };
  return (
    <div className="animate-fade-in space-y-4">
      <MC title="💬 Live Chat" icon={<MessageSquare className="size-6 text-primary" />} />
      <div className="flex gap-2 overflow-x-auto pb-1">{channels.map(c => (
        <button key={c} onClick={() => setChannel(c)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${channel === c ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{c}</button>
      ))}</div>
      <div className="mafia-card rounded-xl p-1 h-[400px] overflow-y-auto space-y-1 scrollbar-thin">
        {messages?.map((m: any) => (
          <div key={m._id} className="px-3 py-2 hover:bg-background/30 rounded-lg text-sm">
            <span className="font-bold text-primary mr-2">{m.senderId === m.receiverId ? "You" : "System"}</span>
            <span className="text-foreground/80">{m.body}</span>
            <span className="text-[10px] text-muted-foreground ml-2">{new Date(m.timestamp).toLocaleTimeString()}</span>
          </div>
        )).reverse()}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <button onClick={handleSend} className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 text-sm"><Send className="size-4" /></button>
      </div>
    </div>
  );
}

// ===== #2 PRESTIGE =====
export function PrestigePage() {
  const player = useQuery(api.game.getPlayer);
  const doPrestige = useMutation(api.allFeatures.prestige);
  const [msg, setMsg] = useState("");
  if (!player) return <LC />;
  const lvl = player.level ?? 1;
  const canPrestige = lvl >= 100;
  const prestige = player.prestige ?? 0;
  const mult = player.prestigeMultiplier ?? 1;
  const xpNeeded = lvl * 100;
  const xpPct = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="⭐ Prestige System" icon={<Crown className="size-6 text-yellow-400" />} />
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-3xl font-black text-yellow-400">{prestige}</div><div className="text-xs text-muted-foreground">Prestige</div></div>
          <div><div className="text-3xl font-black text-primary">{mult.toFixed(1)}x</div><div className="text-xs text-muted-foreground">Multiplier</div></div>
          <div><div className="text-3xl font-black text-blue-400">Lv.{lvl}</div><div className="text-xs text-muted-foreground">Level</div></div>
        </div>
        <div className="h-3 bg-background/60 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" style={{ width: `${xpPct}%` }} /></div>
        <div className="text-center text-xs text-muted-foreground">{player.experience ?? 0}/{xpNeeded} XP</div>
        {canPrestige ? (
          <button onClick={async () => { try { const r = await doPrestige({}); setMsg(`Prestige ${r.newPrestige}! Multiplier: ${r.multiplier.toFixed(1)}x`); } catch (e: any) { setMsg(e.message); } }}
            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-500 text-white font-bold rounded-lg">⭐ PRESTIGE NOW</button>
        ) : <div className="text-center text-sm text-muted-foreground">Reach level 100 ({100 - lvl} to go)</div>}
        {msg && <div className="text-center text-sm text-primary font-bold">{msg}</div>}
      </div>
    </div>
  );
}

// ===== #4 CRAFTING =====
export function CraftingPage() {
  const craft = useMutation(api.allFeatures.craftItem);
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const recipes = [
    { name: "Reinforced Knife", desc: "+15 ATK", cost: 5000, category: "weapons", icon: "🔪" },
    { name: "Bulletproof Vest", desc: "+20 DEF", cost: 10000, category: "armor", icon: "🛡️" },
    { name: "Armored Car", desc: "Faster escape", cost: 50000, category: "vehicles", icon: "🚗" },
    { name: "Hacking Device", desc: "Bypass security", cost: 25000, category: "tools", icon: "💻" },
    { name: "Flash Grenade", desc: "Stun enemies", cost: 8000, category: "weapons", icon: "💣" },
    { name: "Night Vision Goggles", desc: "See in darkness", cost: 15000, category: "tools", icon: "🌙" },
    { name: "Lockpick Set", desc: "Open any lock", cost: 3000, category: "tools", icon: "🔐" },
    { name: "Plasma Blade", desc: "+30 ATK", cost: 75000, category: "weapons", icon: "🗡️" },
    { name: "Power Armor", desc: "+40 DEF", cost: 100000, category: "armor", icon: "🦾" },
    { name: "Stealth Helicopter", desc: "Undetectable", cost: 250000, category: "vehicles", icon: "🚁" },
    { name: "EMP Device", desc: "Disable electronics", cost: 40000, category: "tools", icon: "⚡" },
    { name: "Smoke Bomb", desc: "Escape detection", cost: 5000, category: "tools", icon: "💨" },
  ];
  const cats = ["all", "weapons", "armor", "vehicles", "tools"];
  const filtered = catFilter === "all" ? recipes : recipes.filter(r => r.category === catFilter);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🔨 Crafting Station" icon={<Hammer className="size-6 text-orange-400" />} />
      <div className="flex gap-2">{cats.map(c => <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${catFilter === c ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{c}</button>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((r, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <div className="text-3xl">{r.icon}</div>
            <div className="flex-1">
              <div className="font-bold text-sm">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
              <div className="text-[10px] text-primary font-bold mt-1">${r.cost.toLocaleString()}</div>
            </div>
            <button onClick={async () => { try { await craft({ itemName: r.name, cost: r.cost }); setMsg(`Crafted ${r.name}!`); } catch (e: any) { setMsg(e.message); } }}
              disabled={(player?.money ?? 0) < r.cost}
              className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-lg disabled:opacity-40">Craft</button>
          </motion.div>
        ))}
      </div>
      {msg && <div className="text-sm text-primary text-center font-bold">{msg}</div>}
    </div>
  );
}

// ===== #5 LEADERBOARDS =====
export function LeaderboardsPage() {
  const [sortType, setSortType] = useState("level");
  const leaderboard = useQuery(api.allFeatures.getLeaderboard, { type: sortType });
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🏆 Seasonal Leaderboards" icon={<Trophy className="size-6 text-yellow-400" />} />
      <div className="flex gap-2">{["level", "money", "kills", "crimes"].map(t => (
        <button key={t} onClick={() => setSortType(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${sortType === t ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{t}</button>
      ))}</div>
      <div className="space-y-1.5">
        {leaderboard?.map((p: any) => (
          <div key={p.rank} className={`mafia-card rounded-lg p-3 flex items-center gap-3 ${p.rank <= 3 ? "border-yellow-500/30" : ""}`}>
            <span className={`text-lg w-8 text-center font-black ${p.rank <= 3 ? "text-yellow-400" : "text-muted-foreground"}`}>{p.rank <= 3 ? ["🥇", "🥈", "🥉"][p.rank - 1] : `#${p.rank}`}</span>
            <div className="flex-1"><div className="font-semibold text-sm">{p.nickname}</div><div className="text-[10px] text-muted-foreground">Lv.{p.level} • Prestige {p.prestige ?? 0}</div></div>
            <div className="text-right text-xs">
              {sortType === "money" && <div className="text-green-400 font-bold">${(p.money ?? 0).toLocaleString()}</div>}
              {sortType === "kills" && <div className="text-red-400 font-bold">{p.kills} kills</div>}
              {sortType === "crimes" && <div className="text-orange-400 font-bold">{p.crimes} crimes</div>}
              {sortType === "level" && <div className="text-blue-400 font-bold">Lv.{p.level}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== #6 WORLD MAP =====
export function WorldMapPage() {
  const data = useQuery(api.allFeatures.getWorldMapData);
  const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Detroit", "Houston", "Phoenix", "Philadelphia", "Boston", "Atlanta", "Dallas"];
  const cityEmoji: Record<string, string> = { "New York": "🗽", "Los Angeles": "🌴", "Chicago": "🌃", "Miami": "🏖️", "Las Vegas": "🎰", "Detroit": "🏭", "Houston": "🤠", "Phoenix": "🌵", "Philadelphia": "🔔", "Boston": "🏛️", "Atlanta": "🍑", "Dallas": "🐎" };
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🗺️ Live World Map" icon={<Globe className="size-6 text-cyan-400" />} />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {cities.map(city => {
          const count = data?.locations?.[city] ?? 0;
          return (
            <motion.div key={city} whileHover={{ scale: 1.05 }} className="mafia-card rounded-xl p-4 text-center cursor-pointer">
              <div className="text-3xl mb-2">{cityEmoji[city]}</div>
              <div className="font-bold text-sm">{city}</div>
              <div className="text-xs text-muted-foreground">{count} players</div>
              <div className={`h-1 rounded-full mt-2 ${count > 3 ? "bg-red-500" : count > 1 ? "bg-yellow-500" : "bg-green-500"}`} />
            </motion.div>
          );
        })}
      </div>
      <div className="mafia-card rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3">📡 Recent Activity</h3>
        <div className="space-y-1">{data?.recentCrimes?.slice(0, 10).map((c: any, i: number) => (
          <div key={i} className="text-xs text-muted-foreground py-1 border-b border-border/20 last:border-0">
            {c.success ? "✅" : "❌"} {c.type} — {c.success ? `+$${(c.moneyEarned ?? 0).toLocaleString()}` : "Failed"}
          </div>
        ))}</div>
      </div>
    </div>
  );
}

// ===== #22 FIGHT CLUB =====
export function FightClubPage() {
  const join = useMutation(api.allFeatures.joinFightClub);
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(1000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🥊 Underground Fight Club" icon={<Swords className="size-6 text-red-400" />} />
      <div className="mafia-card rounded-xl p-6 bg-gradient-to-br from-red-950/50 to-gray-900 border border-red-500/20 text-center">
        <div className="text-5xl mb-3">🥊</div>
        <h3 className="text-xl font-black text-red-400">FIGHT CLUB</h3>
        <p className="text-sm text-muted-foreground mt-1">First rule: You DO talk about Fight Club.</p>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none" />
        <button onClick={async () => { setLoading(true); try { const r = await join({ betAmount: bet }); setResult(r); } catch (e: any) { setResult({ error: e.message }); } setLoading(false); }}
          disabled={loading || (player?.money ?? 0) < bet}
          className="w-full py-3 bg-red-600 text-white font-bold rounded-lg disabled:opacity-40">{loading ? "Fighting..." : "🥊 ENTER FIGHT CLUB"}</button>
      </div>
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`mafia-card rounded-xl p-6 text-center ${result.success ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className="text-4xl mb-2">{result.success ? "🏆" : "💀"}</div>
          <div className={`text-2xl font-black ${result.success ? "text-green-400" : "text-red-400"}`}>{result.success ? "VICTORY!" : "DEFEATED"}</div>
          <div className="text-sm text-muted-foreground mt-1">vs {result.opponent} • ATK {result.playerPower} vs {result.oppPower}</div>
          {result.success && <div className="text-lg font-bold text-green-400 mt-2">+${result.prize.toLocaleString()}</div>}
        </motion.div>
      )}
      {result?.error && <div className="text-sm text-destructive text-center">{result.error}</div>}
    </div>
  );
}

// ===== #24 LOTTERY =====
export function LotteryPage() {
  const buyTicket = useMutation(api.allFeatures.buyLotteryTicket);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [result, setResult] = useState<any>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🎰 Lottery Jackpot" icon={<Ticket className="size-6 text-yellow-400" />} />
      <div className="mafia-card rounded-xl p-6 bg-gradient-to-br from-yellow-950/50 to-gray-900 border border-yellow-500/20 text-center">
        <div className="text-xs text-yellow-200/40 uppercase tracking-widest">Current Jackpot</div>
        <div className="text-5xl font-black text-yellow-400 my-2">$5,000,000</div>
        <div className="text-xs text-muted-foreground">Grows until someone wins!</div>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-sm">Pick 5 Numbers (1-50)</h3>
        <div className="grid grid-cols-5 gap-2">{numbers.map((n, i) => (
          <input key={i} type="number" min={1} max={50} value={n} onChange={e => { const nn = [...numbers]; nn[i] = Number(e.target.value); setNumbers(nn); }}
            className="bg-background border border-border rounded-lg px-2 py-3 text-center text-sm font-bold outline-none" />
        ))}</div>
        <button onClick={async () => { try { const r = await buyTicket({ numbers, cost: 1000 }); setResult(r); } catch (e: any) { setResult({ error: e.message }); } }}
          className="w-full py-3 bg-yellow-600 text-white font-bold rounded-lg">🎟️ Buy Ticket ($1,000)</button>
      </div>
      {result && !result.error && (
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-sm mb-2">Winning: {result.winning?.join(", ")}</div>
          <div className="text-lg font-black text-primary">{result.matches} matches! {result.prize > 0 ? `+$${result.prize.toLocaleString()}!` : "Try again!"}</div>
        </div>
      )}
      {result?.error && <div className="text-sm text-destructive text-center">{result.error}</div>}
    </div>
  );
}

// ===== #28 CRYPTO =====
export function CryptoPage() {
  const player = useQuery(api.game.getPlayer);
  const buyC = useMutation(api.allFeatures.buyCrypto);
  const [msg, setMsg] = useState("");
  const coins = [
    { name: "ShadowCoin", symbol: "SHC", price: 150, change: 5.2, icon: "🪙" },
    { name: "CrimeCoin", symbol: "CRC", price: 89, change: -2.1, icon: "💰" },
    { name: "UnderWorld Token", symbol: "UWT", price: 340, change: 12.5, icon: "🌐" },
    { name: "ShadowByte", symbol: "SBY", price: 45, change: -8.3, icon: "💻" },
    { name: "GhostChain", symbol: "GHC", price: 720, change: 3.7, icon: "👻" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="₿ Crypto Currency" icon={<Coins className="size-6 text-orange-400" />} />
      <div className="space-y-3">
        {coins.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <div className="text-3xl">{c.icon}</div>
            <div className="flex-1">
              <div className="font-bold text-sm">{c.name} ({c.symbol})</div>
              <div className="text-lg font-black">${c.price.toLocaleString()}</div>
              <div className={`text-xs font-bold ${c.change >= 0 ? "text-green-400" : "text-red-400"}`}>{c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change)}%</div>
            </div>
            <button onClick={async () => { try { await buyC({ coinName: c.symbol, amount: 10, cost: c.price * 10 }); setMsg(`Bought 10 ${c.symbol}!`); } catch (e: any) { setMsg(e.message); } }}
              disabled={(player?.money ?? 0) < c.price * 10}
              className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-lg disabled:opacity-40">Buy</button>
          </motion.div>
        ))}
      </div>
      {msg && <div className="text-sm text-primary text-center font-bold">{msg}</div>}
    </div>
  );
}

// ===== #31 WEATHER =====
export function WeatherPage() {
  const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Detroit", "Houston", "Phoenix", "Philadelphia", "Boston", "Atlanta", "Dallas"];
  const weatherTypes = ["clear", "storm", "heatwave", "blizzard", "fog", "rain"];
  const weatherIcons: Record<string, string> = { clear: "☀️", storm: "⛈️", heatwave: "🔥", blizzard: "❄️", fog: "🌫️", rain: "🌧️" };
  const weatherData = cities.map(city => ({ city, event: weatherTypes[Math.floor(Math.random() * weatherTypes.length)] }));
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🌦️ Dynamic Weather" icon={<Cloud className="size-6 text-blue-400" />} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {weatherData.map((w, i) => (
          <motion.div key={i} whileHover={{ scale: 1.03 }} className="mafia-card rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">{weatherIcons[w.event]}</div>
            <div className="font-bold text-sm">{w.city}</div>
            <div className="text-xs text-muted-foreground capitalize">{w.event}</div>
            {(w.event === "heatwave" || w.event === "storm") && <div className="text-[10px] text-green-400 font-bold mt-1">+15% XP Boost</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===== #32 NEWS TICKER =====
export function NewsTickerPage() {
  const news = useQuery(api.allFeatures.getNewsTicker);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="📰 News Ticker" icon={<Newspaper className="size-6 text-blue-400" />} />
      <div className="space-y-2">{news?.map((n: string, i: number) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="mafia-card rounded-xl p-3 flex items-center gap-3"><div className="text-lg">📢</div><div className="text-sm text-foreground/80">{n}</div></motion.div>
      ))}</div>
    </div>
  );
}

// ===== #39 CRIME MASTERY =====
export function CrimeMasteryPage() {
  const player = useQuery(api.game.getPlayer);
  const unlock = useMutation(api.allFeatures.unlockMastery);
  const [msg, setMsg] = useState("");
  const trees = [
    { name: "🗡️ Assault Mastery", skills: ["Power Strike", "Critical Hit", "Chain Attack", "Berserker", "One Punch"] },
    { name: "🔓 Theft Mastery", skills: ["Lockpick Pro", "Speed Thief", "Silent Hands", "Master Thief", "Ghost"] },
    { name: "💻 Cyber Mastery", skills: ["Basic Hack", "Firewall Break", "Data Mine", "System Crash", "Ghost Protocol"] },
    { name: "🚛 Transport Mastery", skills: ["Fast Driver", "Stealth Route", "Heavy Load", "Night Runner", "Phantom"] },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🌲 Crime Mastery" icon={<TreePine className="size-6 text-green-400" />} />
      <div className="text-sm text-muted-foreground mb-2">Skill Points: <span className="text-primary font-bold">{player?.skillPoints ?? 0}</span></div>
      <div className="space-y-4">{trees.map((tree, ti) => (
        <div key={ti} className="mafia-card rounded-xl p-4">
          <h3 className="font-bold text-sm mb-3">{tree.name}</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">{tree.skills.map((skill, si) => (
            <button key={si} onClick={async () => { try { await unlock({ skillName: skill }); setMsg(`Unlocked ${skill}!`); } catch (e: any) { setMsg(e.message); } }}
              className="min-w-[100px] px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-center hover:border-primary/50 transition-colors">
              <div className="text-lg mb-1">{["⚔️", "🔓", "💻", "🚛", "👑"][si]}</div>
              <div className="text-[10px] font-bold">{skill}</div>
            </button>
          ))}</div>
        </div>
      ))}</div>
      {msg && <div className="text-sm text-primary text-center font-bold">{msg}</div>}
    </div>
  );
}

// ===== #40 LEGENDARY ITEMS =====
export function LegendaryItemsPage() {
  const items = [
    { name: "The Godfather's Pistol", desc: "100 ATK. Only 1 exists.", icon: "🔫" },
    { name: "Shadow Armor", desc: "80 DEF. -50% damage.", icon: "🛡️" },
    { name: "Phantom Rolls-Royce", desc: "Undetectable. 200mph.", icon: "🚗" },
    { name: "Heart of Darkness", desc: "+500% XP for 24 hours.", icon: "💎" },
    { name: "Obsidian Blade", desc: "Guaranteed crit. +60 ATK.", icon: "🗡️" },
    { name: "Quantum Computer", desc: "Instant hacks.", icon: "💻" },
    { name: "Crown of the Underworld", desc: "3x money from operations.", icon: "👑" },
    { name: "Golden Ticket", desc: "Free heist pass. One use.", icon: "🎫" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="💎 Legendary Items" icon={<Gem className="size-6 text-yellow-400" />} />
      <div className="space-y-3">{items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02 }}
          className="mafia-card rounded-xl p-4 border border-yellow-500/30 bg-gradient-to-r from-yellow-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{item.icon}</div>
            <div className="flex-1"><div className="font-bold text-sm text-yellow-400">{item.name}</div><div className="text-xs text-muted-foreground">{item.desc}</div></div>
            <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-[10px] font-bold text-yellow-400">LEGENDARY</div>
          </div>
        </motion.div>
      ))}</div>
    </div>
  );
}

// ===== #43 DEATHMATCH ARENA =====
export function ArenaPage() {
  const rankings = useQuery(api.allFeatures.getArenaRankings);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="⚔️ Deathmatch Arena" icon={<Swords className="size-6 text-red-400" />} />
      <div className="space-y-1.5">{rankings?.map((p: any) => (
        <div key={p.rank} className={`mafia-card rounded-lg p-3 flex items-center gap-3 ${p.rank <= 3 ? "border-yellow-500/30" : ""}`}>
          <span className="font-black text-lg w-8 text-center text-muted-foreground">#{p.rank}</span>
          <div className="flex-1"><div className="font-semibold text-sm">{p.nickname}</div><div className="text-[10px] text-muted-foreground">Lv.{p.level}</div></div>
          <div className="text-right text-sm font-bold text-red-400">{p.kills} kills</div>
        </div>
      ))}</div>
    </div>
  );
}

// ===== #44 LEGACY SCOREBOARD =====
export function LegacyBoardPage() {
  const board = useQuery(api.allFeatures.getLegacyBoard);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="📜 Legacy Scoreboard" icon={<Award className="size-6 text-yellow-400" />} />
      <div className="space-y-1.5">{board?.map((p: any) => (
        <div key={p.rank} className="mafia-card rounded-lg p-3 flex items-center gap-3">
          <span className={`font-black text-lg w-8 text-center ${p.rank <= 3 ? "text-yellow-400" : "text-muted-foreground"}`}>#{p.rank}</span>
          <div className="flex-1"><div className="font-semibold text-sm">{p.nickname}</div><div className="text-[10px] text-muted-foreground">Prestige {p.prestige} • Lv.{p.highestLevel}</div></div>
          <div className="text-right"><div className="text-sm font-bold text-green-400">${p.totalEarned?.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">{p.totalKills} kills</div></div>
        </div>
      ))}</div>
    </div>
  );
}

// ===== #45 ENDFGAME RAIDS =====
export function RaidsPage() {
  const join = useMutation(api.allFeatures.joinFightClub);
  const raids = [
    { name: "🏛️ FBI Headquarters", desc: "Infiltrate the FBI. 20 players needed.", difficulty: "Legendary", reward: 1000000 },
    { name: "🏦 Federal Reserve", desc: "Rob the federal reserve.", difficulty: "Legendary", reward: 5000000 },
    { name: "🏢 DEA Black Site", desc: "Destroy evidence against your crew.", difficulty: "Hard", reward: 500000 },
    { name: "🏴 International Syndicate", desc: "Take down a global crime network.", difficulty: "Legendary", reward: 2000000 },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="💣 Endgame Raids" icon={<Bomb className="size-6 text-red-400" />} />
      <div className="space-y-3">{raids.map((r, i) => (
        <motion.div key={i} className="mafia-card rounded-xl p-5 border border-red-500/20 bg-gradient-to-r from-red-950/20 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold">{r.name}</div>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">{r.difficulty}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-green-400">💰 ${r.reward.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">0/20 players</div>
          </div>
          <button className="w-full mt-3 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-500">Join Raid</button>
        </motion.div>
      ))}</div>
    </div>
  );
}

// ===== #47 MYSTERY BOXES =====
export function MysteryBoxesPage() {
  const buy = useMutation(api.allFeatures.buyMysteryBox);
  const player = useQuery(api.game.getPlayer);
  const [result, setResult] = useState<any>(null);
  const tiers = [
    { name: "Bronze Box", cost: 10000, desc: "Common items", icon: "📦" },
    { name: "Silver Box", cost: 50000, desc: "Rare items", icon: "🎁" },
    { name: "Gold Box", cost: 200000, desc: "Epic items", icon: "🏆" },
    { name: "Diamond Box", cost: 1000000, desc: "Legendary items", icon: "💎" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="🎁 Mystery Boxes" icon={<Star className="size-6 text-purple-400" />} />
      <div className="grid grid-cols-2 gap-3">{tiers.map((t, i) => (
        <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={async () => { try { const r = await buy({ tier: t.name, cost: t.cost }); setResult({ ...r, box: t.name }); } catch (e: any) { setResult({ error: e.message }); } }}
          className="mafia-card rounded-xl p-5 text-center cursor-pointer hover:border-primary/30">
          <div className="text-4xl mb-2">{t.icon}</div>
          <div className="font-bold text-sm">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.desc}</div>
          <div className="text-primary font-bold text-sm mt-2">${t.cost.toLocaleString()}</div>
        </motion.div>
      ))}</div>
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mafia-card rounded-xl p-6 text-center border-purple-500/30">
          <div className="text-5xl mb-2">🎉</div>
          <div className="text-lg font-bold text-purple-400">{result.box}</div>
          <div className="text-sm text-foreground mt-1">You got: <span className="font-bold text-primary">{result.item}</span></div>
        </motion.div>
      )}
      {result?.error && <div className="text-sm text-destructive text-center">{result.error}</div>}
    </div>
  );
}

// ===== #49 GHOST MODE =====
export function GhostModePage() {
  const activate = useMutation(api.allFeatures.activateGhostMode);
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="👻 Ghost Mode" icon={<Ghost className="size-6 text-gray-400" />} />
      <div className="mafia-card rounded-xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-500/20 text-center">
        <div className="text-6xl mb-4">👻</div>
        <h3 className="text-xl font-black text-gray-300">Ghost Mode</h3>
        <p className="text-sm text-muted-foreground mt-2">Become invisible on the map for 1 hour.</p>
        <div className="text-2xl font-black text-gray-400 my-4">$50,000</div>
        <button onClick={async () => { try { const r = await activate({ cost: 50000 }); setMsg(r.message); } catch (e: any) { setMsg(e.message); } }}
          disabled={(player?.money ?? 0) < 50000}
          className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg disabled:opacity-40">👻 Activate Ghost Mode</button>
      </div>
      {msg && <div className="text-sm text-primary text-center font-bold">{msg}</div>}
    </div>
  );
}

// ===== #48 CRIME REALITY TV =====
export function CrimeTVPage() {
  const news = useQuery(api.allFeatures.getNewsTicker);
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="📺 Crime Reality TV" icon={<Tv className="size-6 text-red-400" />} />
      <div className="mafia-card rounded-xl p-6 bg-gradient-to-br from-red-950/50 to-gray-900 border border-red-500/20 text-center">
        <div className="text-5xl mb-3">📺</div>
        <h3 className="text-xl font-black text-red-400">CRIME TV LIVE</h3>
        <p className="text-sm text-muted-foreground mt-1">Watch players commit crimes in real-time.</p>
      </div>
      <div className="space-y-2">{news?.slice(0, 10).map((n: string, i: number) => (
        <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-red-950/50 flex items-center justify-center text-lg">🔴</div>
          <div className="flex-1 text-sm">{n}</div>
          <button className="px-2 py-1 bg-yellow-600/80 text-white text-[10px] font-semibold rounded-lg">💎 Tip</button>
        </div>
      ))}</div>
    </div>
  );
}

// ===== #50 TIME MACHINE =====
export function TimeMachinePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <MC title="⏪ Time Machine" icon={<Clock className="size-6 text-purple-400" />} />
      <div className="mafia-card rounded-xl p-6 bg-gradient-to-br from-purple-950/50 to-gray-900 border border-purple-500/20 text-center">
        <div className="text-5xl mb-3">⏪</div>
        <h3 className="text-xl font-black text-purple-400">TIME MACHINE</h3>
        <p className="text-sm text-muted-foreground mt-1">Relive your greatest heists. Watch replays of your epic moments.</p>
      </div>
      <div className="text-center py-8 text-muted-foreground text-sm">Your greatest moments will appear here as you play more.</div>
    </div>
  );
}

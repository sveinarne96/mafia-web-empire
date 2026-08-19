import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Trophy, Target, Package, Car, Group, Shield, Ticket, Wallet,
  Crown, Search, HelpCircle, Loader2,
} from "lucide-react";

function LoadingPage() {
  return <div className="flex items-center justify-center h-64"><Loader2 className="size-6 animate-spin text-primary" /></div>;
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center p-3 bg-background/40 rounded-lg border border-border/50">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${color ?? ""}`}>{value}</div>
    </div>
  );
}

// ===== POINTS / SHOP =====
const shopItems = [
  { name: "Brass Knuckles", type: "weapon", rarity: "common", cost: 50, attack: 3, defense: 0 },
  { name: "Switchblade", type: "weapon", rarity: "common", cost: 100, attack: 5, defense: 0 },
  { name: "Baseball Bat", type: "weapon", rarity: "common", cost: 75, attack: 4, defense: 0 },
  { name: "Kevlar Vest", type: "armor", rarity: "common", cost: 150, attack: 0, defense: 5 },
  { name: "Combat Knife", type: "weapon", rarity: "uncommon", cost: 300, attack: 8, defense: 0 },
  { name: "Body Armor", type: "armor", rarity: "uncommon", cost: 400, attack: 0, defense: 8 },
  { name: "Assault Rifle", type: "weapon", rarity: "rare", cost: 800, attack: 12, defense: 0 },
  { name: "Tactical Vest", type: "armor", rarity: "rare", cost: 900, attack: 0, defense: 12 },
  { name: "Sniper Rifle", type: "weapon", rarity: "epic", cost: 2000, attack: 18, defense: 0 },
  { name: "Heavy Armor", type: "armor", rarity: "epic", cost: 2500, attack: 0, defense: 18 },
  { name: "Rocket Launcher", type: "weapon", rarity: "legendary", cost: 5000, attack: 25, defense: 0 },
  { name: "Titanium Suit", type: "armor", rarity: "legendary", cost: 6000, attack: 0, defense: 25 },
];

const rarityColors: Record<string, string> = {
  common: "text-gray-400 border-gray-700",
  uncommon: "text-green-400 border-green-700",
  rare: "text-blue-400 border-blue-700",
  epic: "text-purple-400 border-purple-700",
  legendary: "text-yellow-400 border-yellow-700",
};

export function PointsShopPage() {
  const player = useQuery(api.game.getPlayer);
  const buyItemWP = useMutation(api.gameExtended.buyItemWithPoints);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<string>("all");
  if (!player) return <LoadingPage />;
  const filtered = filter === "all" ? shopItems : shopItems.filter(i => i.type === filter);
  const doBuy = async (item: typeof shopItems[0]) => {
    try { await buyItemWP({ itemName: item.name, type: item.type, rarity: item.rarity, cost: item.cost, attack: item.attack, defense: item.defense }); setMsg(`Bought ${item.name}!`); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Trophy className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Points Shop</h2></div>
        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm font-bold text-yellow-400">⭐ {player.points ?? 0} Points</div>
      </div>
      <div className="flex gap-2">
        {["all", "weapon", "armor"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{f}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((item, i) => (
          <motion.button key={i} whileHover={{ scale: 1.02 }} onClick={() => doBuy(item)} disabled={(player.points ?? 0) < item.cost}
            className={`mafia-card rounded-xl p-4 text-left border ${rarityColors[item.rarity]} disabled:opacity-40 hover:border-primary/50 transition-all`}>
            <div className="text-xs uppercase font-bold mb-1">{item.rarity}</div>
            <div className="font-bold text-sm mb-1">{item.name}</div>
            <div className="text-[10px] text-muted-foreground mb-2">{item.type === "weapon" ? `⚔️ +${item.attack}` : `🛡️ +${item.defense}`}</div>
            <div className="text-xs font-bold text-primary">{item.cost} Points</div>
          </motion.button>
        ))}
      </div>
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== GARAGE =====
export function GaragePage() {
  const player = useQuery(api.game.getPlayer);
  const vehicles = useQuery(api.gameExtended.getGarage);
  const shop = useQuery(api.gameExtended.getVehicleShop);
  const buyV = useMutation(api.gameExtended.buyVehicle);
  const sellV = useMutation(api.gameExtended.sellVehicle);
  const stealV = useMutation(api.gameExtended.stealVehicle);
  const [tab, setTab] = useState<"owned" | "shop" | "steal">("owned");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  const doSteal = async () => {
    setLoading(true); setMsg("");
    try { const r = await stealV({}); setMsg(r.success ? `Stolen ${r.vehicle}! (+3 wanted)` : r.arrested ? "Arrested!" : "Failed!"); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Car className="size-7 text-primary" /><h2 className="text-2xl font-bold">Garage</h2></div>
      <div className="flex gap-1 bg-background/50 rounded-lg p-1">
        {(["owned", "shop", "steal"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "owned" && (
        (vehicles ?? []).length === 0 ? <div className="text-center py-10 text-muted-foreground text-sm">No vehicles. Buy or steal one!</div> :
        <div className="space-y-2">{vehicles?.map(v => (
          <div key={v._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div><div className="font-semibold text-sm">{v.name}</div><div className="text-[10px] text-muted-foreground">Speed {v.speed} • Storage {v.storage} {v.armored ? "• 🛡️" : ""} {v.stolen ? "• 🔴 Stolen" : ""}</div></div>
            <button onClick={async () => { setLoading(true); try { const r = await sellV({ vehicleId: v._id }); setMsg(`Sold for $${r.price.toLocaleString()}`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 bg-secondary text-xs font-semibold rounded-lg disabled:opacity-40">Sell</button>
          </div>
        ))}</div>
      )}
      {tab === "shop" && (
        <div className="grid grid-cols-2 gap-3">{shop?.map((v, i) => (
          <button key={i} onClick={async () => { setLoading(true); try { await buyV({ name: v.name, type: v.type, speed: v.speed, storage: v.storage, armored: v.armored, price: v.price }); setMsg(`Bought ${v.name}!`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={(player.money ?? 0) < v.price || loading}
            className="mafia-card rounded-xl p-4 text-left hover:border-primary/50 disabled:opacity-40">
            <div className="font-bold text-sm mb-1">{v.name}</div><div className="text-[10px] text-muted-foreground mb-2">Speed {v.speed} • Storage {v.storage}</div>
            <div className="text-xs font-bold text-primary">${v.price.toLocaleString()}</div>
          </button>
        ))}</div>
      )}
      {tab === "steal" && (
        <div className="mafia-card rounded-xl p-6 text-center space-y-4">
          <div className="text-4xl">🚗</div><h3 className="font-bold">Steal a Vehicle</h3>
          <p className="text-sm text-muted-foreground">40% success. Failure = wanted + possible arrest.</p>
          <button onClick={doSteal} disabled={loading || player.inPrison} className="px-8 py-3 bg-destructive text-white font-bold rounded-lg disabled:opacity-50">{loading ? "Stealing..." : "🚗 Steal"}</button>
        </div>
      )}
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== MY ITEMS =====
export function MyItemsPage() {
  const player = useQuery(api.game.getPlayer);
  const inventory = useQuery(api.gameExtended.getInventory);
  const equip = useMutation(api.gameExtended.equipItem);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Package className="size-7 text-primary" /><h2 className="text-2xl font-bold">My Items</h2></div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <StatBox label="ATK" value={`⚔️ ${player.attack ?? 10}`} color="text-red-400" />
        <StatBox label="DEF" value={`🛡️ ${player.defense ?? 10}`} color="text-blue-400" />
        <StatBox label="Level" value={`⭐ ${player.level ?? 1}`} color="text-primary" />
      </div>
      {(!inventory || inventory.length === 0) ? <div className="text-center py-10 text-muted-foreground text-sm">No items. Visit the Points Shop!</div> :
        <div className="space-y-2">{inventory.map(entry => (
          <div key={entry._id} className={`mafia-card rounded-lg p-4 flex items-center justify-between border ${entry.equipped ? "border-primary/50" : ""}`}>
            <div><div className="font-semibold text-sm">{entry.item.name}</div>
              <div className="text-[10px] text-muted-foreground">{entry.item.type} • {entry.item.rarity}{entry.item.attack > 0 ? ` • ⚔️+${entry.item.attack}` : ""}{entry.item.defense > 0 ? ` • 🛡️+${entry.item.defense}` : ""}</div></div>
            <button onClick={async () => { setLoading(true); try { const r = await equip({ inventoryId: entry._id }); setMsg(r.equipped ? "Equipped!" : "Unequipped!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }}
              disabled={loading || (entry.item.type !== "weapon" && entry.item.type !== "armor")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${entry.equipped ? "bg-primary text-primary-foreground" : "bg-secondary border border-border"}`}>
              {entry.equipped ? "Equipped" : "Equip"}
            </button>
          </div>
        ))}</div>
      }
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== MISSIONS =====
export function MissionsPage() {
  const player = useQuery(api.game.getPlayer);
  const missions = useQuery(api.gameExtended.getMissions);
  const playerMissions = useQuery(api.gameExtended.getPlayerMissions);
  const acceptM = useMutation(api.gameExtended.acceptMission);
  const completeM = useMutation(api.gameExtended.completeMission);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  const pmMap = new Map((playerMissions ?? []).map(pm => [pm.missionId, pm]));
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Target className="size-7 text-primary" /><h2 className="text-2xl font-bold">Missions</h2></div>
      {(missions ?? []).length === 0 ? <div className="text-center py-10 text-muted-foreground text-sm">No missions available.</div> :
        <div className="space-y-3">{missions?.map((m) => {
          const pm = pmMap.get(m._id);
          return (
            <div key={m._id} className={`mafia-card rounded-xl p-4 ${pm?.completed ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div><div className="font-bold text-sm">{m.title}</div><div className="text-xs text-muted-foreground">{m.description}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Lv.{m.levelRequired} • 💰${m.reward.toLocaleString()} • ⭐{m.pointsReward} pts</div></div>
                <div>{!pm ? (
                  <button onClick={async () => { setLoading(true); try { await acceptM({ missionId: m._id }); setMsg("Accepted!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading || (player.level ?? 1) < m.levelRequired} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg disabled:opacity-40">Accept</button>
                ) : pm.completed ? <span className="text-xs text-green-400 font-bold">✓ Done</span> : (
                  <button onClick={async () => { setLoading(true); try { const r = await completeM({ playerMissionId: pm._id }); setMsg(`+$${r.reward} +${r.points}pts`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg disabled:opacity-40">Complete</button>
                )}</div>
              </div>
            </div>
          );
        })}</div>
      }
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== ORGANIZED CRIME =====
export function OrganizedCrimePage() {
  const player = useQuery(api.game.getPlayer);
  const family = useQuery(api.game.getFamily);
  const crimes = useQuery(api.gameExtended.getOrganizedCrimes);
  const joinCrime = useMutation(api.gameExtended.joinOrganizedCrime);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  if (!family) return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Group className="size-7 text-primary" /><h2 className="text-2xl font-bold">Organized Crime</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center"><p className="text-sm text-muted-foreground">You need a Family to participate.</p></div>
    </div>
  );
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Group className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Organized Crime</h2></div>
      <div className="mafia-card rounded-xl p-4 text-sm text-muted-foreground">Family: <span className="text-primary font-bold">{(family as any).name}</span> [{(family as any).tag}]</div>
      {(crimes ?? []).length === 0 ? <div className="text-center py-10 text-muted-foreground text-sm">No operations available.</div> :
        <div className="space-y-2">{crimes?.map(c => (
          <div key={c._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div><div className="font-bold text-sm">{c.title}</div><div className="text-xs text-muted-foreground">{c.description}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Lv.{c.levelRequired} • 💰${c.reward.toLocaleString()}</div></div>
            <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await joinCrime({ crimeId: c._id }); setMsg(r.success ? `+$${r.reward}` : "Failed!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }}
              disabled={loading || (player.level ?? 1) < c.levelRequired} className="px-3 py-1.5 bg-destructive text-white text-xs font-semibold rounded-lg disabled:opacity-40">Join</button>
          </div>
        ))}</div>
      }
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== COMPANY =====
export function CompanyPage() {
  const player = useQuery(api.game.getPlayer);
  const businesses = useQuery(api.gameExtended.getMyBusinesses);
  const shop = useQuery(api.gameExtended.getBusinessShop);
  const buyBiz = useMutation(api.game.buyBusiness);
  const upgradeBiz = useMutation(api.game.upgradeBusiness);
  const collectIncome = useMutation(api.game.collectBusinessIncome);
  const [tab, setTab] = useState<"owned" | "shop">("owned");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Shield className="size-7 text-primary" /><h2 className="text-2xl font-bold">Company</h2></div>
        <button onClick={async () => { setLoading(true); try { const r = await collectIncome(); setMsg(`+$${r.income.toLocaleString()}`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading || (businesses ?? []).length === 0} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20 disabled:opacity-40">💰 Collect</button>
      </div>
      <div className="flex gap-1 bg-background/50 rounded-lg p-1">
        {(["owned", "shop"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-semibold rounded-md capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "owned" && ((!businesses || businesses.length === 0) ? <div className="text-center py-10 text-muted-foreground text-sm">No businesses.</div> :
        <div className="space-y-2">{businesses.map(b => (
          <div key={b._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div><div className="font-bold text-sm">{b.name}</div><div className="text-[10px] text-muted-foreground">{b.type} • {b.city} • Lv.{b.level}</div></div>
            <div className="flex items-center gap-2"><span className="text-xs text-green-400 font-bold">+${b.income.toLocaleString()}/day</span>
              <button onClick={async () => { setLoading(true); try { await upgradeBiz({ businessId: b._id }); setMsg("Upgraded!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg disabled:opacity-40">Upgrade</button>
            </div>
          </div>
        ))}</div>
      )}
      {tab === "shop" && (
        <div className="grid grid-cols-2 gap-3">{shop?.map((b, i) => (
          <button key={i} onClick={async () => { setLoading(true); try { await buyBiz({ name: b.name, type: b.type, city: b.city, price: b.price }); setMsg(`Bought ${b.name}!`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={(player.money ?? 0) < b.price || loading}
            className="mafia-card rounded-xl p-4 text-left hover:border-primary/50 disabled:opacity-40">
            <div className="font-bold text-sm mb-1">{b.name}</div><div className="text-[10px] text-muted-foreground mb-2">{b.type} • {b.city}</div>
            <div className="text-xs font-bold text-primary">${b.price.toLocaleString()}</div>
          </button>
        ))}</div>
      )}
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== LOTTO =====
export function LottoPage() {
  const player = useQuery(api.game.getPlayer);
  const buyTicket = useMutation(api.gameExtended.buyLottoTicket);
  const [type, setType] = useState<"daily" | "weekly" | "mega">("daily");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [result, setResult] = useState<{ winning: number[]; matches: number; prize: number } | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  const maxNum = type === "mega" ? 50 : 30;
  const count = type === "mega" ? 6 : 5;
  const costs: Record<string, number> = { daily: 100, weekly: 500, mega: 5000 };
  const toggleNumber = (n: number) => { if (numbers.includes(n)) setNumbers(numbers.filter(x => x !== n)); else if (numbers.length < count) setNumbers([...numbers, n]); };
  const play = async () => {
    if (numbers.length !== count) { setMsg(`Pick ${count} numbers!`); return; }
    setLoading(true); setMsg(""); setResult(null);
    try { setResult(await buyTicket({ type, numbers })); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Ticket className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Lotto</h2></div>
      <div className="flex gap-2">{(["daily", "weekly", "mega"] as const).map(t => (
        <button key={t} onClick={() => { setType(t); setNumbers([]); setResult(null); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${type === t ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{t} ${costs[t].toLocaleString()}</button>
      ))}</div>
      <div className="mafia-card rounded-xl p-5 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Pick {count} numbers (1-{maxNum})</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: Math.min(maxNum, 30) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => toggleNumber(n)} className={`size-9 rounded-lg text-xs font-bold ${numbers.includes(n) ? "bg-primary text-primary-foreground scale-110" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{n}</button>
          ))}
        </div>
        <button onClick={play} disabled={loading || numbers.length !== count} className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg disabled:opacity-50">{loading ? "Drawing..." : `Buy Ticket ($${costs[type].toLocaleString()})`}</button>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mafia-card rounded-xl p-5 text-center">
          <div className="text-sm text-muted-foreground mb-2">Winning: <span className="text-primary font-bold">{result.winning.join(", ")}</span></div>
          <div className="text-lg font-bold mb-1">{result.matches} match{result.matches !== 1 ? "es" : ""}</div>
          {result.prize > 0 ? <div className="text-primary font-bold">🎉 Won ${result.prize.toLocaleString()}!</div> : <div className="text-destructive">No win.</div>}
        </motion.div>
      )}
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// ===== BLACKJACK =====
function bjValue(card: string): number { const r = card.split("-")[0]; if (r === "A") return 11; if (["K", "Q", "J"].includes(r)) return 10; return parseInt(r) || 10; }
function bjTotal(hand: string[]): number { let t = 0, a = 0; for (const c of hand) { t += bjValue(c); if (c.startsWith("A")) a++; } while (t > 21 && a > 0) { t -= 10; a--; } return t; }

function CardDisplay({ card }: { card: string }) {
  const [rank, suit] = card.split("-");
  const s = suit === "h" ? "♥" : suit === "d" ? "♦" : suit === "c" ? "♣" : "♠";
  const red = suit === "h" || suit === "d";
  return <div className={`mafia-card rounded-lg p-2 text-center w-12 h-16 flex flex-col items-center justify-center ${red ? "text-red-400" : "text-foreground"}`}><div className="text-sm font-bold">{rank}</div><div className="text-xs">{s}</div></div>;
}

export function BlackjackPage() {
  const player = useQuery(api.game.getPlayer);
  const deal = useMutation(api.gameExtended.blackjackDeal);
  const hit = useMutation(api.gameExtended.blackjackHit);
  const stand = useMutation(api.gameExtended.blackjackStand);
  const [bet, setBet] = useState(100);
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerHand, setDealerHand] = useState<string[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "done">("betting");
  const [result, setResult] = useState<{ result: string; winnings: number } | null>(null);
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  const doDeal = async () => {
    setLoading(true); setResult(null);
    try { const r = await deal({ bet }); setPlayerHand(r.playerHand); setDealerHand(r.dealerHand);
      if (r.result === "blackjack") { setResult({ result: "blackjack!", winnings: r.winnings }); setGameState("done"); }
      else if (r.result === "bust") { setResult({ result: "bust!", winnings: 0 }); setGameState("done"); }
      else setGameState("playing");
    } catch (e: unknown) { setResult({ result: e instanceof Error ? e.message : "Error", winnings: 0 }); setGameState("done"); }
    setLoading(false);
  };
  const doHit = async () => { setLoading(true);
    try { const r = await hit({ hand: playerHand, bet }); setPlayerHand(r.playerHand); if (r.result === "bust") { setResult({ result: "bust!", winnings: 0 }); setGameState("done"); }
    } catch (e: unknown) { setResult({ result: e instanceof Error ? e.message : "Error", winnings: 0 }); setGameState("done"); }
    setLoading(false);
  };
  const doStand = async () => { setLoading(true);
    try { const r = await stand({ hand: playerHand, bet }); setDealerHand(r.dealerHand); setResult({ result: r.result, winnings: r.winnings }); setGameState("done");
    } catch (e: unknown) { setResult({ result: e instanceof Error ? e.message : "Error", winnings: 0 }); setGameState("done"); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Wallet className="size-7 text-primary" /><h2 className="text-2xl font-bold">Blackjack</h2></div>
      <div className="mafia-card rounded-xl p-5 text-center space-y-4">
        {gameState === "betting" && (<>
          <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} min={10} className="w-40 text-center bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
          <button onClick={doDeal} disabled={loading || (player.money ?? 0) < bet} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50">Deal</button>
        </>)}
        {gameState !== "betting" && (<>
          <div className="space-y-2"><div className="text-xs text-muted-foreground">Dealer ({bjTotal(dealerHand)})</div><div className="flex gap-1 justify-center">{dealerHand.map((c, i) => <CardDisplay key={i} card={c} />)}</div></div>
          <div className="space-y-2"><div className="text-xs text-muted-foreground">Your Hand ({bjTotal(playerHand)})</div><div className="flex gap-1 justify-center">{playerHand.map((c, i) => <CardDisplay key={i} card={c} />)}</div></div>
        </>)}
        {gameState === "playing" && (<div className="flex gap-3">
          <button onClick={doHit} disabled={loading} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg disabled:opacity-50">Hit</button>
          <button onClick={doStand} disabled={loading} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg disabled:opacity-50">Stand</button>
        </div>)}
        {result && gameState === "done" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className={`text-xl font-bold ${result.result.includes("win") || result.result.includes("blackjack") ? "text-green-400" : "text-destructive"}`}>{result.result.toUpperCase()}</div>
            {result.winnings > 0 && <div className="text-primary text-sm">+${result.winnings.toLocaleString()}</div>}
            <button onClick={() => { setGameState("betting"); setPlayerHand([]); setDealerHand([]); setResult(null); }} className="mt-3 px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">Play Again</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ===== LEGACY =====
export function LegacyPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;
  const totalWealth = (player.money ?? 0) + (player.bank ?? 0);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Crown className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Legacy</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">👑</div><h3 className="text-lg font-bold">Your Legacy</h3>
        <p className="text-sm text-muted-foreground">When you die, your heir inherits 10% of your wealth.</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatBox label="Total Wealth" value={`$${totalWealth.toLocaleString()}`} color="text-yellow-400" />
          <StatBox label="Heir Gets" value={`$${Math.floor(totalWealth * 0.1).toLocaleString()}`} color="text-green-400" />
        </div>
        <div className="space-y-2 text-xs text-muted-foreground mt-4 text-left">
          <div className="flex justify-between"><span>Highest Level</span><span className="text-foreground font-bold">{player.highestLevel ?? player.level ?? 1}</span></div>
          <div className="flex justify-between"><span>Total Earned</span><span className="text-foreground font-bold">${(player.totalEarned ?? 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Total Deaths</span><span className="text-foreground font-bold">{player.totalDeaths ?? 0}</span></div>
          <div className="flex justify-between"><span>Total Kills</span><span className="text-foreground font-bold">{player.totalKills ?? 0}</span></div>
          <div className="flex justify-between"><span>Active Title</span><span className="text-primary font-bold">{player.activeTitle ?? "None"}</span></div>
          <div className="flex justify-between"><span>Prestige</span><span className="text-yellow-400 font-bold">{player.prestige ?? 0}</span></div>
        </div>
      </div>
    </div>
  );
}

// ===== FORUM SEARCH =====
export function ForumSearchPage() {
  const [query, setQuery] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const results = useQuery(api.gameExtended.searchForumPosts, { query: searchQ });
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Search className="size-7 text-primary" /><h2 className="text-2xl font-bold">Search Posts</h2></div>
      <div className="mafia-card rounded-xl p-4 flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search forums..." className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <button onClick={() => setSearchQ(query)} className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">Search</button>
      </div>
      {searchQ && <div className="text-xs text-muted-foreground">{results?.length ?? 0} results</div>}
      {results?.map(p => (
        <div key={p._id} className="mafia-card rounded-lg p-4">
          <div className="flex justify-between items-start mb-1"><span className="font-semibold text-sm">{p.title}</span><span className="text-[10px] text-muted-foreground">{new Date(p.timestamp).toLocaleDateString()}</span></div>
          <p className="text-xs text-muted-foreground line-clamp-2">{p.body}</p>
          <div className="text-[10px] text-muted-foreground mt-1">in {p.forum}</div>
        </div>
      ))}
    </div>
  );
}

// ===== SUPPORT =====
export function SupportPage() {
  const player = useQuery(api.game.getPlayer);
  const submitTicket = useMutation(api.gameExtended.submitSupportTicket);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  const doSubmit = async () => {
    if (!subject || !body) { setMsg("Fill all fields!"); return; }
    setLoading(true);
    try { await submitTicket({ subject, body }); setMsg("Ticket submitted!"); setSubject(""); setBody(""); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><HelpCircle className="size-7 text-primary" /><h2 className="text-2xl font-bold">Support</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe your issue..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[120px]" />
        <button onClick={doSubmit} disabled={loading || !subject || !body} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50">Submit Ticket</button>
        {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
      </div>
      <div className="mafia-card rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3">Quick Help</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>📧 <strong>Bug Report:</strong> Describe the issue and what you expected.</p>
          <p>💰 <strong>Payment Issue:</strong> Include your transaction ID.</p>
          <p>🎮 <strong>Game Question:</strong> Check the FAQ page first!</p>
        </div>
      </div>
    </div>
  );
}

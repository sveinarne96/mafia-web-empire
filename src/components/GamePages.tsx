import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Target, Package, Car, Group, Shield, Ticket, Wallet,
  Crown, Search, HelpCircle, Loader2, Flame, Clock, ChevronDown, ChevronRight, Zap, Swords,
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
  const myBizs = useQuery(api.gameExtended.getMyBusinesses);
  const buyRankBoost = useMutation(api.gameExtended.buyRankBooster);
  const sellCompany = useMutation(api.gameExtended.sellCompanyForPoints);
  const buyItemWP = useMutation(api.gameExtended.buyItemWithPoints);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"boosters" | "items" | "services">("boosters");
  if (!player) return <LoadingPage />;

  const rankBoostActive = ((player as any).rankBoostUntil ?? 0) > Date.now();
  const rankBoostRemaining = Math.max(0, Math.floor((((player as any).rankBoostUntil ?? 0) - Date.now()) / 3600000));

  const boosters = [
    { id: "rank_small", name: "Small Rank Booster", icon: "🚀", cost: 90, desc: "+50% XP for 4 hours", tier: "small" as const },
    { id: "rank_standard", name: "Standard Rank Booster", icon: "🚀", cost: 200, desc: "+50% XP for 10 hours", tier: "standard" as const },
    { id: "rank_mega", name: "Mega Rank Booster", icon: "🚀", cost: 500, desc: "+50% XP for 24 hours", tier: "mega" as const },
  ];

  const services = [
    { name: "Sell Company", icon: "🏷️", cost: 50, desc: "Sell any business at full purchase price (−50 pts fee)", action: "sell_company" },
    { name: "Wanted Clearance", icon: "🧹", cost: 300, desc: "Fully clear wanted level to zero", action: "clear_wanted" },
    { name: "XP Surprise Box", icon: "🎁", cost: 150, desc: "Random XP boost between 2-12 hours", action: "xp_box" },
    { name: "Cash Surprise Box", icon: "🎁", cost: 150, desc: "Random cash between $5M-$50M", action: "cash_box" },
    { name: "Stat Booster", icon: "💪", cost: 400, desc: "+20 ATK and +20 DEF permanently", action: "stat_boost" },
  ];

  const doBuyBooster = async (tier: "small" | "standard" | "mega") => {
    try { const r = await buyRankBoost({ tier }); setMsg(r.message); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Trophy className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Points Shop</h2></div>
        <div className="text-right">
          <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm font-bold text-yellow-400">⭐ {(player.points ?? 0).toLocaleString()} Points</div>
          {rankBoostActive && <div className="text-[9px] text-green-400 mt-1">🚀 Rank Boost Active: {rankBoostRemaining}h left</div>}
        </div>
      </div>

      <div className="flex gap-1 bg-background/50 rounded-lg p-1">
        {(["boosters", "items", "services"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors capitalize ${tab === t ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "text-muted-foreground"}`}>
            {t === "boosters" ? "🚀 Boosters" : t === "items" ? "⚔️ Items" : "🔧 Services"}
          </button>
        ))}
      </div>

      {tab === "boosters" && (
        <div className="space-y-3">
          {boosters.map(b => (
            <div key={b.id} className="mafia-card rounded-xl p-4 flex items-center justify-between hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{b.icon}</div>
                <div>
                  <div className="font-bold text-sm">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground">{b.desc}</div>
                  {rankBoostActive && <div className="text-[9px] text-orange-400">⚠️ Already active!</div>}
                </div>
              </div>
              <button onClick={() => doBuyBooster(b.tier)} disabled={(player.points ?? 0) < b.cost || rankBoostActive}
                className="px-4 py-2 bg-yellow-600 text-white text-xs font-bold rounded-lg hover:bg-yellow-700 disabled:opacity-40 transition-all">
                {b.cost} pts
              </button>
            </div>
          ))}
          <div className="mafia-card rounded-xl p-4 bg-gradient-to-r from-yellow-950/20 to-amber-950/20 border border-yellow-500/20">
            <div className="text-xs font-bold text-yellow-400 mb-1">ℹ️ How Rank Boosters Work</div>
            <div className="text-[10px] text-muted-foreground">While active, all criminal actions grant +50% bonus XP. This stacks with XP boost from easter eggs. Only one rank booster can be active at a time.</div>
          </div>
        </div>
      )}

      {tab === "items" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shopItems.map((item, i) => (
            <motion.button key={i} whileHover={{ scale: 1.02 }} onClick={async () => {
              try { await buyItemWP({ itemName: item.name, price: item.cost, itemId: item.name.replace(/\s+/g, '_').toLowerCase() }); setMsg(`Bought ${item.name}!`); }
              catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
            }} disabled={(player.points ?? 0) < item.cost}
              className={`mafia-card rounded-xl p-4 text-left border ${rarityColors[item.rarity]} disabled:opacity-40 hover:border-primary/50 transition-all`}>
              <div className="text-xs uppercase font-bold mb-1">{item.rarity}</div>
              <div className="font-bold text-sm mb-1">{item.name}</div>
              <div className="text-[10px] text-muted-foreground mb-2">{item.type === "weapon" ? `⚔️ +${item.attack} ATK` : `🛡️ +${item.defense} DEF`}</div>
              <div className="text-xs font-bold text-primary">{item.cost} Points</div>
            </motion.button>
          ))}
        </div>
      )}

      {tab === "services" && (
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={i} className="mafia-card rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{s.icon}</div>
                <div>
                  <div className="font-bold text-sm">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                </div>
              </div>
              <div className="text-xs font-bold text-yellow-400">{s.cost} pts</div>
            </div>
          ))}
          {(myBizs ?? []).length > 0 && (
            <div className="mafia-card rounded-xl p-3">
              <div className="text-xs font-bold mb-2">🏷️ Sell Your Companies (50 pts fee)</div>
              {(myBizs ?? []).map((b: any) => (
                <div key={b._id} className="flex justify-between items-center bg-background/30 rounded p-2 mb-1">
                  <div className="text-[10px]">{b.name}</div>
                  <button onClick={async () => {
                    try { const r = await sellCompany({ businessId: b._id }); setMsg(r.message); }
                    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
                  }} disabled={(player.points ?? 0) < 50}
                    className="px-2 py-1 bg-red-600/20 text-red-400 text-[9px] font-bold rounded hover:bg-red-600/30">
                    Sell ${(b.price ?? 0).toLocaleString()}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {msg && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className={`rounded-xl p-3 text-xs font-bold ${msg.includes("Bought") || msg.includes("✅") ? "bg-green-950/30 text-green-400 border border-green-500/30" : "bg-red-950/30 text-red-400 border border-red-500/30"}`}>{msg}</motion.div>}
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
  const sellAllV = useMutation(api.gameExtended.sellAllVehicles);
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
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Car className="size-7 text-primary" /><div><h2 className="text-2xl font-bold">Garage</h2>{tab === "owned" && (vehicles ?? []).length > 0 && <p className="text-[10px] text-muted-foreground">{(vehicles ?? []).length} vehicles • Total value: <span className="text-green-400 font-bold">${(vehicles ?? []).reduce((sum: number, v: any) => sum + ((v as any).purchasePrice ?? ((v.speed ?? 50) * 1000)), 0).toLocaleString()}</span> • 100% sell value</p>}</div></div>{(vehicles ?? []).length > 0 && tab === "owned" && <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await sellAllV({}); setMsg(`Sold ${r.count} vehicles for $${r.totalEarned.toLocaleString()} (100% value!)`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-bold rounded-lg hover:from-green-500 hover:to-emerald-400 disabled:opacity-50 transition-all">💰 Sell All (100%)</button>}</div>
      <div className="flex gap-1 bg-background/50 rounded-lg p-1">
        {(["owned", "shop", "steal"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "owned" && (
        (vehicles ?? []).length === 0 ? <div className="text-center py-10 text-muted-foreground text-sm">No vehicles. Buy or steal one!</div> :
        <div className="space-y-2">{vehicles?.map(v => (
          <div key={v._id} className={`mafia-card rounded-lg p-4 flex items-center justify-between ${(v as any).ultraNeon ? "border-2 border-amber-400/80 shadow-xl shadow-amber-500/30 bg-gradient-to-r from-amber-950/30 via-orange-950/20 to-red-950/10 animate-pulse" : (v as any).neon ? "border border-cyan-400/60 shadow-lg shadow-cyan-500/20" : ""}`}>
            <div><div className="font-semibold text-sm">{v.name}</div><div className="text-[10px] text-muted-foreground">Speed {v.speed} • Storage {v.storage} {v.armored ? "• 🛡️" : ""} {(v as any).stolen ? "• 🔴 Stolen" : ""} {(v as any).ultraNeon ? `• 👑✨ ${(v as any).neonColor} ULTRA NEON` : (v as any).neon ? `• 🌈 ${(v as any).neonColor?.toUpperCase()} NEON` : ""}</div></div>
            <button onClick={async () => { setLoading(true); try { const r = await sellV({ vehicleId: v._id }); setMsg(`Sold for $${r.price.toLocaleString()} (100% value!)`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 bg-secondary text-xs font-semibold rounded-lg disabled:opacity-40">Sell</button>
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
  const sellAllItems = useMutation(api.gameExtended.sellAllItems);
  const sellItem = useMutation(api.gameExtended.sellItem);
  const openEgg = useMutation(api.gameExtended.openEasterEgg);
  const activateBoost = useMutation(api.gameExtended.activateBoostItem);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;

  const now = Date.now();
  const xpBoostActive = ((player as any).xpBoostUntil ?? 0) > now;
  const cashBoostActive = ((player as any).cashBoostUntil ?? 0) > now;
  const energyActive = ((player as any).energyDrinkUntil ?? 0) > now;
  const pointsBoostActive = ((player as any).pointsBoostUntil ?? 0) > now;
  const repBoostActive = ((player as any).repBoostUntil ?? 0) > now;
  const fmtLeft = (t: number) => { const d = t - Date.now(); const h = Math.floor(d / 3600000); const m = Math.floor((d % 3600000) / 60000); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Package className="size-7 text-primary" /><div><h2 className="text-2xl font-bold">My Items</h2><p className="text-[10px] text-muted-foreground">Sell items at 100% value · Open eggs · Activate boosts</p></div></div>{(inventory ?? []).length > 0 && <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await sellAllItems({}); setMsg(`Sold ${r.count} items for $${r.totalEarned.toLocaleString()} (100% value!)`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-white text-xs font-bold rounded-lg hover:from-yellow-500 hover:to-amber-400 disabled:opacity-50 transition-all">💰 Sell All</button>}</div>
      {(xpBoostActive || cashBoostActive || energyActive || pointsBoostActive || repBoostActive) && (
        <div className="flex gap-2 flex-wrap">
          {xpBoostActive && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 animate-pulse">⚡ 3x XP Boost — {fmtLeft((player as any).xpBoostUntil)}</span>}
          {cashBoostActive && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/15 border border-green-500/30 text-green-300 animate-pulse">💰 3x Cash Boost — {fmtLeft((player as any).cashBoostUntil)}</span>}
          {energyActive && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500/15 border border-orange-500/30 text-orange-300 animate-pulse">🥤 Energy Rush (+25% XP) — {fmtLeft((player as any).energyDrinkUntil)}</span>}
          {pointsBoostActive && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 animate-pulse">🎯 3x Points Boost — {fmtLeft((player as any).pointsBoostUntil)}</span>}
          {repBoostActive && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 animate-pulse">🌟 3x Reputation Boost — {fmtLeft((player as any).repBoostUntil)}</span>}
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <StatBox label="ATK" value={`⚔️ ${player.attack ?? 10}`} color="text-red-400" />
        <StatBox label="DEF" value={`🛡️ ${player.defense ?? 10}`} color="text-blue-400" />
        <StatBox label="Level" value={`⭐ ${player.level ?? 1}`} color="text-primary" />
      </div>
      {(!inventory || inventory.length === 0) ? <div className="text-center py-10 text-muted-foreground text-sm">No items. Visit the Points Shop!</div> :
        <div className="space-y-2">{[...inventory].sort((a, b) => {
          const rank = (e: any) => e.type === "easter_egg" ? 0 : (e.type === "xp_boost" || e.type === "cash_boost") ? 1 : 2;
          return rank(a) - rank(b);
        }).map(entry => {
          const isEgg = entry.type === "easter_egg";
          const isBoost = entry.type === "xp_boost" || entry.type === "cash_boost";
          return (
          <div key={entry._id} className={`mafia-card rounded-lg p-4 flex items-center justify-between border ${entry?.equipped ? "border-primary/50" : isEgg ? "border-purple-500/40 animate-pulse" : ""}`}>
            <div><div className="font-semibold text-sm">{entry.name}{isEgg && (entry.quantity ?? 1) > 1 ? ` ×${Math.min(entry.quantity ?? 1, 100)}` : ""}</div>
              <div className="text-[10px] text-muted-foreground">{isEgg ? (entry.quantity ?? 1) > 1 ? `🎁 ${entry.quantity}/100 in stack — Open one at a time, Sell all for $${(25000000 * entry.quantity).toLocaleString()}!` : "🎁 Open for a legendary prize — or 💰 Sell for $25,000,000!" : isBoost ? "⏱️ Click ACTIVATE to start the boost" : `${entry.type} • ${entry.rarity ?? "common"}`}{entry.attack ? ` • ⚔️+${entry.attack}` : ""}{entry.defense ? ` • 🛡️+${entry.defense}` : ""}{!isEgg && entry.price ? ` • 💰 $${entry.price.toLocaleString()}` : ""}</div></div>
            <div className="flex gap-1.5 shrink-0">
              {isEgg && <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await openEgg({ itemId: entry._id }); setMsg(`${(r as any).message}`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white hover:from-purple-500 hover:to-fuchsia-400 transition-all animate-glow-pulse">🎁 Open</button>}
              {isBoost && <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await activateBoost({ itemId: entry._id }); setMsg((r as any).message); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-400 transition-all">⚡ Activate</button>}
              {!isEgg && !isBoost && <button onClick={async () => { setLoading(true); try { const r = await equip({ itemId: entry.itemId }); setMsg((r as any)?.equipped ? "Equipped!" : "Unequipped!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }}
                disabled={loading || (entry.type !== "weapon" && entry.type !== "armor")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${entry?.equipped ? "bg-primary text-primary-foreground" : "bg-secondary border border-border"}`}>
                {entry?.equipped ? "Equipped" : "Equip"}
              </button>}
              <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await sellItem({ itemId: entry._id }); setMsg(`Sold for $${r.money.toLocaleString()}!`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-600/80 text-white hover:bg-yellow-500 transition-all">Sell</button>
            </div>
          </div>
          );
        })}</div>
      }
      {msg && <div className="text-sm text-primary animate-fade-in whitespace-pre-wrap">{msg.startsWith("🌟") || msg.includes("!") ? msg : `✓ ${msg}`}</div>}
    </div>
  );
}

// ===== MISSIONS =====
const missionTypeIcons: Record<string, string> = { crime: "🔥", heist: "🎯", transport: "🚛", gambling: "🎰", explore: "🏢", travel: "✈️", business: "🏪", social: "👨‍👩‍👦", pvp: "⚔️", combat: "💀", progression: "🧠", empire: "👑" };
const missionTypeColors: Record<string, string> = { crime: "bg-red-950/30 text-red-400 border-red-800/30", heist: "bg-purple-950/30 text-purple-400 border-purple-800/30", transport: "bg-orange-950/30 text-orange-400 border-orange-800/30", gambling: "bg-yellow-950/30 text-yellow-400 border-yellow-800/30", explore: "bg-blue-950/30 text-blue-400 border-blue-800/30", travel: "bg-cyan-950/30 text-cyan-400 border-cyan-800/30", business: "bg-green-950/30 text-green-400 border-green-800/30", social: "bg-pink-950/30 text-pink-400 border-pink-800/30", pvp: "bg-red-950/30 text-red-300 border-red-700/30", combat: "bg-red-950/40 text-red-300 border-red-700/40", progression: "bg-indigo-950/30 text-indigo-400 border-indigo-800/30", empire: "bg-yellow-950/30 text-yellow-300 border-yellow-700/30" };

const STORYLINE_META: Record<string, { emoji: string; name: string; color: string; gradient: string }> = {
  storyline: { emoji: "🎭", name: "The Shadow Empire", color: "text-yellow-400", gradient: "from-yellow-500 to-orange-500" },
  love_story: { emoji: "💕", name: "Criminal Hearts", color: "text-pink-400", gradient: "from-pink-500 to-rose-500" },
  arctic_freeze: { emoji: "❄️", name: "Arctic Freeze", color: "text-cyan-400", gradient: "from-cyan-500 to-blue-500" },
  golden_rush: { emoji: "🏆", name: "Golden Rush", color: "text-yellow-300", gradient: "from-yellow-400 to-amber-500" },
  delta_run: { emoji: "🏃", name: "Delta Run", color: "text-green-400", gradient: "from-green-500 to-emerald-500" },
  deep_glow: { emoji: "💎", name: "Deep Glow", color: "text-purple-400", gradient: "from-purple-500 to-indigo-500" },
  fire_brain: { emoji: "🔥", name: "Fire Brain", color: "text-red-400", gradient: "from-red-500 to-orange-500" },
  dark_rush: { emoji: "🌑", name: "Dark Rush", color: "text-gray-400", gradient: "from-gray-500 to-slate-500" },
};

const DIFF_META: Record<string, { color: string; label: string }> = {
  easy: { color: "bg-green-500/15 text-green-400 border-green-500/25", label: "Easy" },
  medium: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", label: "Medium" },
  hard: { color: "bg-orange-500/15 text-orange-400 border-orange-500/25", label: "Hard" },
  legendary: { color: "bg-red-500/15 text-red-400 border-red-500/25", label: "Legendary" },
};

export function MissionsPage() {
  const player = useQuery(api.game.getPlayer);
  const missionData = useQuery(api.missionSystem.getMissions, { page: 0, pageSize: 50 });
  const playerMissions = useQuery(api.missionSystem.getMissionStats);
  const storyArcs = useQuery(api.missionSystem.getStoryArcs);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const PAGE_SIZE = 50;

  if (!player) return <LoadingPage />;

  const level = (player as any).level ?? 1;
  const missions = missionData?.missions ?? [];
  const total = missionData?.total ?? 50000;
  const completedIds = new Set(missionData?.completedIds ?? []);
  const completedCount = missionData?.completedCount ?? 0;
  const categories = missionData?.categories ?? [];

  // Stats
  const stats = playerMissions;

  // Daily challenges (procedural from today's date)
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyChallenges = Array.from({ length: 5 }, (_, i) => {
    const seed = daySeed * 100 + i;
    const rng = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const cats = ["street", "heist", "smuggle", "hack", "drug", "assassinate", "fraud", "gamble"];
    const cat = cats[Math.floor(rng * cats.length)];
    const rewards = [50000, 100000, 250000, 500000, 1000000];
    return { id: `daily_${daySeed}_${i}`, name: `${cat.replace(/_/g," ").replace(/\b\w/g,(c:string)=>c.toUpperCase())} Daily #${i+1}`, reward: rewards[i], completed: false };
  });

  const renderMissionCard = (m: any) => {
    const locked = level < (m.levelRequired ?? 1);
    const completed = completedIds.has(m.id);
    const diffColors: Record<string, string> = {
      easy: "text-green-400 border-green-800/50",
      medium: "text-yellow-400 border-yellow-800/50",
      hard: "text-orange-400 border-orange-800/50",
      brutal: "text-red-400 border-red-800/50",
      impossible: "text-red-500 border-red-900/50",
      legendary: "text-yellow-300 border-yellow-600/50",
    };
    const diffEmoji: Record<string, string> = {
      easy: "🟢", medium: "🟡", hard: "🟠", brutal: "🔴", impossible: "💀", legendary: "👑",
    };
    const dc = diffColors[m.difficulty ?? "easy"] ?? diffColors.easy;

    return (
      <motion.div key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`mafia-card rounded-xl p-4 transition-all ${completed ? "opacity-60" : locked ? "opacity-40" : "hover:border-primary/20"}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5 shrink-0">{m.categoryEmoji ?? "📋"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="font-bold text-sm">{m.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${dc}`}>{diffEmoji[m.difficulty ?? "easy"]} {(m.difficulty ?? "easy").toUpperCase()}</span>
              {m.storyArc && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold border bg-purple-500/10 text-purple-400 border-purple-800/50">📖 Story</span>}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{m.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
              <span>⭐ Lv.{m.levelRequired}</span>
              <span className="text-green-400 font-bold">💰 ${(m.moneyReward ?? 0).toLocaleString()}</span>
              <span className="text-blue-400 font-bold">⚡ {(m.xpReward ?? 0)} XP</span>
              <span className="text-orange-400 flex items-center gap-0.5"><Clock className="size-2.5" />{m.timeLimit ?? 30}m</span>
              {m.city && <span>📍 {m.city}</span>}
            </div>
          </div>
          <div className="shrink-0">
            {completed && <span className="text-xs text-green-400 font-bold">✅ Done</span>}
            {!completed && locked && <span className="text-[10px] text-muted-foreground">🔒 Lv.{m.levelRequired}</span>}
            {!completed && !locked && (
              <div className="text-[10px] text-primary font-semibold">Available</div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Epic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="size-8 text-primary" /><h2 className="text-3xl font-bold">📋 Missions</h2></div>
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">{completedCount}/{total.toLocaleString()} Done</div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{(storyArcs ?? []).length} storylines • {total.toLocaleString()}+ missions • Daily challenges • Time-limited</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <StatBox label="Total Done" value={completedCount.toString()} color="text-green-400" />
        <StatBox label="Total XP" value={`${((stats as any)?.totalXpEarned ?? 0).toLocaleString()}`} color="text-blue-400" />
        <StatBox label="Cash Earned" value={`$${((stats as any)?.totalMoneyEarned ?? 0).toLocaleString()}`} color="text-yellow-400" />
        <StatBox label="Streak" value={`${(stats as any)?.currentStreak ?? 0} 🔥`} color="text-orange-400" />
        <StatBox label="Daily" value={`${dailyChallenges.filter(d => d.completed).length}/${dailyChallenges.length}`} color="text-purple-400" />
        <StatBox label="Level" value={`⭐ ${level}`} />
      </div>

      {/* Daily Challenges */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2"><Zap className="size-4 text-yellow-400" /><span className="font-bold text-sm">⚡ Daily Challenges</span><span className="text-[10px] text-muted-foreground">Resets at midnight</span></div>
        <div className="space-y-2">
          {dailyChallenges.map(d => (
            <div key={d.id} className="flex items-center justify-between p-2 bg-background/30 rounded-lg">
              <span className="text-xs font-semibold">{d.name}</span>
              <span className="text-[10px] text-green-400 font-bold">${d.reward.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Arcs */}
      {(storyArcs ?? []).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">📖 Story Arcs</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(storyArcs ?? []).slice(0, 8).map((arc: any) => (
              <motion.button key={arc.id} whileHover={{ scale: 1.02 }} className="mafia-card rounded-xl p-4 text-left hover:border-primary/30 transition-all">
                <div className="text-2xl mb-2">{arc.emoji}</div>
                <div className="font-bold text-sm text-primary">{arc.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{arc.chapters} chapters • {arc.difficulty}</div>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{arc.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search 50,000+ missions..."
            className="w-full bg-background/40 border border-border/50 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(0); }}
          className="bg-background/40 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground outline-none">
          <option value="all">All Categories</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        <select value={diffFilter} onChange={e => { setDiffFilter(e.target.value); setPage(0); }}
          className="bg-background/40 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground outline-none">
          <option value="all">All Difficulties</option>
          <option value="easy">🟢 Easy</option>
          <option value="medium">🟡 Medium</option>
          <option value="hard">🟠 Hard</option>
          <option value="brutal">🔴 Brutal</option>
          <option value="impossible">💀 Impossible</option>
          <option value="legendary">👑 Legendary</option>
        </select>
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        {missions.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">Loading missions...</div>}
        {missions.map((m: any) => renderMissionCard(m))}
      </div>

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
            <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await joinCrime({ crimeId: c._id }); setMsg((r as any)?.success ? `+$${(r as any)?.reward ?? 0}` : "Failed!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }}
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
        <button onClick={async () => { setLoading(true); try { const r = await collectIncome({}); setMsg(`+$${r.income.toLocaleString()}`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading || (businesses ?? []).length === 0} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20 disabled:opacity-40">💰 Collect</button>
      </div>
      <div className="flex gap-1 bg-background/50 rounded-lg p-1">
        {(["owned", "shop"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-semibold rounded-md capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "owned" && ((!businesses || businesses.length === 0) ? <div className="text-center py-10 text-muted-foreground text-sm">No businesses.</div> :
        <div className="space-y-2">{businesses.map(b => (
          <div key={b._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div><div className="font-bold text-sm">{b.name}</div><div className="text-[10px] text-muted-foreground">{b.type} • Lv.{b.level}</div></div>
            <div className="flex items-center gap-2"><span className="text-xs text-green-400 font-bold">+${b.income.toLocaleString()}/day</span>
              <button onClick={async () => { setLoading(true); try { await upgradeBiz({ businessId: b._id }); setMsg("Upgraded!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg disabled:opacity-40">Upgrade</button>
            </div>
          </div>
        ))}</div>
      )}
      {tab === "shop" && (
        <div className="grid grid-cols-2 gap-3">{shop?.map((b, i) => (
          <button key={i} onClick={async () => { setLoading(true); try { await buyBiz({ name: b.name, type: b.type, city: "Global", price: b.price }); setMsg(`Bought ${b.name}!`); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={(player.money ?? 0) < b.price || loading}
            className="mafia-card rounded-xl p-4 text-left hover:border-primary/50 disabled:opacity-40">
            <div className="font-bold text-sm mb-1">{b.name}</div><div className="text-[10px] text-muted-foreground mb-2">{b.type}</div>
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
    try { const r = await buyTicket({ type, numbers }); setResult(r as any); }
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
          <div className="text-sm text-muted-foreground mb-2">Winning: <span className="text-primary font-bold">{(result as any)?.winning?.join(", ") ?? ""}</span></div>
          <div className="text-lg font-bold mb-1">{(result as any)?.matches ?? 0} match{((result as any)?.matches ?? 0) !== 1 ? "es" : ""}</div>
          {(result as any)?.prize > 0 ? <div className="text-primary font-bold">🎉 Won $${(result as any)?.prize?.toLocaleString() ?? 0}!</div> : <div className="text-destructive">No win.</div>}
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

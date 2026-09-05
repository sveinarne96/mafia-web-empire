import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CAR_MARKET, CAR_RARITY_ORDER, getRarityColor, rarityLabel } from "@/data/carMarket";
import { CriminalOperationsPage } from "@/components/CriminalOperationsPage";

const fmt = (n: number) => "$" + Math.floor(n).toLocaleString();
const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
};

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
      {msg.ok ? "✅ " : "⚠️ "}{msg.text}
    </div>
  );
}

function BuyBtn({ onClick, disabled, children, active = false }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${active ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>
      {children}
    </button>
  );
}

const RARITY_FILTERS = ["All", ...CAR_RARITY_ORDER];
const DAMAGE_FILTERS = ["All Damage", "Wrecked (95%+)", "Damaged", "Perfect"];

export function CarDealerPage() {
  const store = useQuery(api.storeSystem.getStoreState);
  const buyCar = useMutation(api.storeSystem.buyCar);
  const sellCar = useMutation(api.storeSystem.sellCar);
  const sellAll = useMutation(api.storeSystem.sellAllCars);
  const listForSale = useMutation(api.storeSystem.listCarForSale);
  const unlist = useMutation(api.storeSystem.unlistCar);
  const melt = useMutation(api.storeSystem.meltCars);
  const autoMelt = useMutation(api.storeSystem.autoMelt);
  const buyBullets = useMutation(api.storeSystem.buyBullets);
  const repair = useMutation(api.storeSystem.repairCar);
  const repairAll = useMutation(api.storeSystem.repairAllCars);

  const [tab, setTab] = useState<"ops" | "buy" | "sell" | "scrap" | "repair">("ops");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Buy filters
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  // Sell
  const [salePrice, setSalePrice] = useState<Record<string, string>>({});
  const [sellRarity, setSellRarity] = useState("All");
  const [sellDamage, setSellDamage] = useState("All Damage");
  const [sellForSale, setSellForSale] = useState("All");
  // Scrap
  const [meltSel, setMeltSel] = useState<Id<"vehicles">[]>([]);
  const [bulletAmt, setBulletAmt] = useState(100);

  // Auto-melt countdown — every 5 minutes the furnace runs while 10+ cars sit in the scrapyard
  const [now, setNow] = useState(() => Date.now());
  const autoFiring = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const autoCars = (store?.ownedCars ?? []).filter((v: any) => v.isWreck || (v.damage ?? 0) >= 40);
  const autoReady = (store?.ownedCars ?? []).length >= 10 && autoCars.length > 0;
  const meltRemaining = Math.max(0, (store?.nextAutoMeltAt ?? 0) - now);
  const meltClock = `${Math.floor(meltRemaining / 60000)}:${String(Math.floor((meltRemaining % 60000) / 1000)).padStart(2, "0")}`;

  useEffect(() => {
    if (meltRemaining > 0 || !autoReady || busy === "auto" || autoFiring.current) return;
    autoFiring.current = true;
    let cancelled = false;
    autoMelt()
      .then((r: any) => { if (!cancelled) setMsg({ ok: true, text: `⚙️ Auto-melted ${r.count} car(s) for ${nf(r.bullets - (store?.bullets ?? 0))} 💀 bullets!` }); })
      .catch((e: any) => { if (!cancelled) setMsg({ ok: false, text: `⚠️ ${e.message || "Auto-melt failed"}` }); })
      .finally(() => { if (!cancelled) { autoFiring.current = false; setNow(Date.now()); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meltRemaining, autoReady, busy]);

  const owned = store?.ownedCars ?? [];
  const filteredMarket = useMemo(() => {
    return CAR_MARKET.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (rarity !== "All" && c.rarity !== rarity) return false;
      if (maxPrice && c.price > parseInt(maxPrice, 10)) return false;
      return true;
    });
  }, [search, rarity, maxPrice]);

  const filteredSell = useMemo(() => {
    return owned.filter((v: any) => {
      if (sellRarity !== "All" && v.rarity !== sellRarity) return false;
      if (sellDamage === "Wrecked (95%+)" && (v.damage ?? 0) < 95) return false;
      if (sellDamage === "Damaged" && (v.damage ?? 0) <= 0) return false;
      if (sellDamage === "Perfect" && (v.damage ?? 0) > 0) return false;
      if (sellForSale === "Listed" && !v.forSale) return false;
      if (sellForSale === "Unlisted" && v.forSale) return false;
      return true;
    });
  }, [owned, sellRarity, sellDamage, sellForSale]);

  const damagedCars = owned.filter((v: any) => (v.damage ?? 0) > 0);
  // Repair rarity filter — common / rare / epic / legendary (+ All)
  const [repairRarity, setRepairRarity] = useState("All");
  const repairFiltered = damagedCars.filter((v: any) => repairRarity === "All" || v.rarity === repairRarity);
  const repairTotal = repairFiltered.reduce((sum: number, v: any) => {
    const damage = v.damage ?? 0;
    const base = (v.purchasePrice ?? 0) > 0 ? v.purchasePrice : (v.speed ?? 50) * 1000;
    return sum + Math.max(100, Math.floor((damage / 100) * base * 0.05));
  }, 0);
  const meltable = owned.filter((v: any) => v.isWreck || (v.damage ?? 0) >= 40);

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading car dealership...</div>;

  const wrap = async (id: string, fn: () => Promise<any>, okText: (r: any) => string) => {
    setBusy(id);
    try {
      const res = await fn();
      setMsg({ ok: true, text: okText(res) });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Failed" });
    }
    setBusy(null);
  };

  const doMelt = () => {
    if (meltSel.length === 0) { setMsg({ ok: false, text: "Select at least one car to melt" }); return; }
    wrap("melt", () => melt({ vehicleIds: meltSel }), (r) => `Melted ${r.count} car(s) for ${nf(r.bullets - store.bullets)} 💀 bullets!`);
  };

  const carValue = (v: any) => {
    const base = (v.purchasePrice ?? 0) > 0 ? v.purchasePrice : (v.speed ?? 50) * 1000;
    return Math.max(500, Math.floor(base * (1 - (v.damage ?? 0) / 100 * 0.7) * 0.6));
  };

  const tabs = [
    { id: "ops", label: "🚗 Crime Ops" },
    { id: "buy", label: "🛒 Purchase Cars" },
    { id: "sell", label: "💰 Sell Cars" },
    { id: "scrap", label: "♻️ Scrapyard" },
    { id: "repair", label: "🔧 Repair" },
  ] as const;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚗</span>
        <div>
          <h2 className="text-2xl font-bold mafia-gold">GTA Car Theft &amp; Dealership</h2>
          <p className="text-xs text-muted-foreground">Steal, buy, sell, melt and repair — the full car economy.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[9px] text-muted-foreground">🚗 Cars Owned</div><div className="text-base font-black text-cyan-400">{owned.length}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[9px] text-muted-foreground">💀 Bullets</div><div className="text-base font-black text-orange-400">{nf(store.bullets)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[9px] text-muted-foreground">💰 Cash</div><div className="text-base font-black text-green-400">{short(store.money)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[9px] text-muted-foreground">♻️ Melted</div><div className="text-base font-black text-amber-400">{nf(store.carsMelted)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[9px] text-muted-foreground">🔧 Repaired</div><div className="text-base font-black text-green-400">{nf(store.carsRepaired)}</div></div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${tab === t.id ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-border-glow" : "border-slate-700/40 text-slate-500 hover:text-slate-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Msg msg={msg} />

      {tab === "ops" && <CriminalOperationsPage category="gta_theft" />}

      {tab === "buy" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">🔍 Search Cars</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type the car name you want to buy..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
                {RARITY_FILTERS.map((r) => <option key={r} value={r}>{r === "All" ? "All Rarities" : rarityLabel(r)}</option>)}
              </select>
              <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" placeholder="Max Price ($)" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <BuyBtn active onClick={() => setSearch("")}>Reset</BuyBtn>
            </div>
          </div>

          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-1">🛒 Purchase Cars <span className="text-[10px] text-muted-foreground font-normal">— {filteredMarket.length} cars</span></div>
            <div className="text-[10px] text-red-400/80 mb-3">⚠️ If you purchase an Exclusive car, you will lose your Civilian Protection!</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredMarket.map((c) => {
                const affordable = (store.money ?? 0) >= c.price;
                return (
                  <div key={c.id} className="rounded-lg border p-3" style={{ borderColor: getRarityColor(c.rarity) + "44", background: "rgba(15,10,5,0.35)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase" style={{ color: getRarityColor(c.rarity) }}>{rarityLabel(c.rarity)}</span>
                      {c.armored && <span className="text-[9px] text-green-400 font-bold">🛡️ Armored</span>}
                    </div>
                    <div className="text-sm font-bold mt-0.5">{c.name}</div>
                    <div className="text-[9px] text-muted-foreground">{c.desc}</div>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                      <span>⚡ {c.speed}</span><span>·</span><span>📦 {c.storage}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-black ${affordable ? "text-green-400" : "text-red-400"}`}>{fmt(c.price)}</span>
                      <BuyBtn
                        active={affordable}
                        disabled={busy === c.id || !affordable}
                        onClick={() => wrap("buy:" + c.id, () => buyCar({ carId: c.id }), (r) => r.exclusive ? `🚗 ${r.car} purchased — Civilian Protection LOST!` : `🚗 ${r.car} delivered to your Garage!`)}
                      >
                        Buy
                      </BuyBtn>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "sell" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">💰 Sell Cars <span className="text-[10px] text-muted-foreground font-normal">— {filteredSell.length} cars</span></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <select value={sellRarity} onChange={(e) => setSellRarity(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
                {RARITY_FILTERS.map((r) => <option key={r} value={r}>{r === "All" ? "All Rarities" : rarityLabel(r)}</option>)}
              </select>
              <select value={sellDamage} onChange={(e) => setSellDamage(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
                {DAMAGE_FILTERS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={sellForSale} onChange={(e) => setSellForSale(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
                <option value="All">All listings</option>
                <option value="Listed">Currently for sale</option>
                <option value="Unlisted">Not for sale</option>
              </select>
              <BuyBtn active onClick={() => wrap("sellall", () => sellAll(), (r) => `Sold ${r.count} cars for ${fmt(r.total)}!`)}>Sell All ({owned.length})</BuyBtn>
            </div>
            {filteredSell.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-6">No cars found.</div>
            ) : (
              <div className="space-y-2">
                {filteredSell.map((v: any) => (
                  <div key={v._id} className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{v.name}</span>
                        <span className="text-[9px] font-black uppercase" style={{ color: getRarityColor(v.rarity) }}>{rarityLabel(v.rarity)}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground">⚡ {v.speed} · 📦 {v.storage} {v.armored ? "· 🛡️" : ""}</div>
                    </div>
                    <div className={`text-[10px] font-bold ${(v.damage ?? 0) >= 95 ? "text-red-400" : (v.damage ?? 0) > 0 ? "text-amber-400" : "text-green-400"}`}>
                      Damage: {v.damage ?? 0}%
                    </div>
                    <div className="text-[11px] font-black text-green-400">{fmt(carValue(v))}</div>
                    {v.forSale ? (
                      <BuyBtn onClick={() => wrap("unlist:" + v._id, () => unlist({ vehicleId: v._id }), () => "Listing removed")}>Stop selling</BuyBtn>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={salePrice[v._id] ?? ""}
                          onChange={(e) => setSalePrice((p) => ({ ...p, [v._id]: e.target.value }))}
                          type="number" placeholder="Price" className="w-24 bg-background border border-border rounded-lg px-2 py-1.5 text-[11px]" />
                        <BuyBtn
                          active={!!parseInt(salePrice[v._id] || "0", 10)}
                          onClick={() => wrap("list:" + v._id, () => listForSale({ vehicleId: v._id, price: parseInt(salePrice[v._id] || "0", 10) }), () => "Car listed for sale!")}
                        >
                          List
                        </BuyBtn>
                      </div>
                    )}
                    <BuyBtn
                      active
                      onClick={() => wrap("sell:" + v._id, () => sellCar({ vehicleId: v._id }), (r) => `Sold for ${fmt(r.price)}!`)}
                    >
                      Sell
                    </BuyBtn>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "scrap" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">♻️ Scrapyard Statistics</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Total Melted</div><div className="text-base font-black text-amber-400">{nf(store.carsMelted)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Melt Limit</div><div className="text-base font-black text-cyan-400">{store.meltLimit} cars</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Next Auto-Melt</div><div className={`text-base font-black ${meltRemaining === 0 && autoReady ? "text-green-400 animate-pulse" : meltRemaining > 0 ? "text-cyan-400" : "text-slate-500"}`}>{autoReady ? (meltRemaining > 0 ? meltClock : "MELTING...") : "—"}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Meltable Cars</div><div className="text-base font-black text-red-400">{meltable.length}</div></div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">⚙️ Cars in the scrapyard auto-melt into bullets every 5 minutes as long as you have at least 10 cars there (wrecks and 40%+ damaged cars first).</div>
          </div>

          <div className="mafia-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold">🔥 Melt Cars <span className="text-[10px] text-muted-foreground font-normal">— up to {store.meltLimit} per batch</span></div>
              <BuyBtn active onClick={() => wrap("auto", () => autoMelt(), (r) => `Auto-melted ${r.count} car(s) for ${nf(r.bullets - store.bullets)} 💀!`)}>Auto-Melt Now</BuyBtn>
            </div>
            {meltable.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-4">No cars available to melt (need wrecks or 40%+ damaged).</div>
            ) : (
              <div className="space-y-1.5">
                {meltable.map((v: any) => {
                  const sel = meltSel.includes(v._id);
                  const yieldAmt = Math.max(5, Math.floor(((v.purchasePrice ?? 0) > 0 ? v.purchasePrice : (v.speed ?? 50) * 1000) / 100) * (1 - (v.damage ?? 0) / 100 * 0.5));
                  return (
                    <button key={v._id} onClick={() => setMeltSel((s) => sel ? s.filter((x) => x !== v._id) : [...s, v._id])}
                      className={`w-full flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${sel ? "border-amber-500/60 bg-amber-950/20" : "border-slate-700/40 bg-slate-900/30"}`}>
                      <input type="checkbox" readOnly checked={sel} className="accent-amber-500" />
                      <span className="flex-1 text-xs font-bold">{v.name}</span>
                      <span className={`text-[10px] font-bold ${(v.damage ?? 0) >= 95 ? "text-red-400" : "text-amber-400"}`}>{v.damage ?? 0}%</span>
                      <span className="text-[11px] font-black text-orange-400">{nf(yieldAmt)} 💀</span>
                    </button>
                  );
                })}
                <div className="pt-2">
                  <BuyBtn active={meltSel.length > 0} disabled={meltSel.length === 0 || busy === "melt"} onClick={doMelt}>
                    Melt {meltSel.length > 0 ? `(${meltSel.length})` : ""}
                  </BuyBtn>
                </div>
              </div>
            )}
          </div>

          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-1">💀 Purchase Bullets</div>
            <div className="text-[10px] text-muted-foreground mb-3">Buy bullets from this scrapyard.</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Owner</div><div className="text-xs font-black text-amber-400">Devious</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Stock</div><div className="text-xs font-black text-cyan-400">20,206</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Price per Bullet</div><div className="text-xs font-black text-green-400">{fmt(17_250)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Your Bullets</div><div className="text-xs font-black text-orange-400">{nf(store.bullets)}</div></div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input value={bulletAmt} onChange={(e) => setBulletAmt(Math.min(1000, Math.max(1, parseInt(e.target.value || "1", 10))))} type="number" className="w-28 bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <span className="text-[10px] text-muted-foreground">Max 1,000 per purchase</span>
              <BuyBtn
                active={bulletAmt > 0 && (store.money ?? 0) >= bulletAmt * 17_250}
                disabled={busy === "bullets" || bulletAmt < 1 || bulletAmt > 1000 || (store.money ?? 0) < bulletAmt * 17_250}
                onClick={() => wrap("bullets", () => buyBullets({ amount: bulletAmt }), (r) => `Bought ${nf(r.amount)} bullets for ${fmt(r.cost)}!`)}
              >
                Buy Bullets · {fmt(bulletAmt * 17_250)}
              </BuyBtn>
            </div>
          </div>
        </div>
      )}

      {tab === "repair" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-3">🔧 Repair Statistics</div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Total Repaired</div><div className="text-base font-black text-green-400">{nf(store.carsRepaired)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Legendary</div><div className="text-base font-black text-amber-400">{nf(store.legendaryRepaired)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Epic</div><div className="text-base font-black text-purple-400">{nf(store.epicRepaired)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Rare</div><div className="text-base font-black text-blue-400">{nf(store.rareRepaired)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Common</div><div className="text-base font-black text-slate-400">{nf(store.commonRepaired)}</div></div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center"><div className="text-[9px] text-muted-foreground">Total Spent</div><div className="text-base font-black text-red-400">{short(store.totalRepairSpent)}</div></div>
            </div>
          </div>

          <div className="mafia-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold">🔧 Repair Cars <span className="text-[10px] text-muted-foreground font-normal">— for a price</span></div>
              {repairFiltered.length > 0 && (
                <BuyBtn active onClick={() => wrap("repairall", () => repairAll(), (r) => `Repaired ${r.count} car(s) for ${fmt(r.cost)}!`)}>Repair All ({repairFiltered.length}) · {fmt(repairTotal)}</BuyBtn>
              )}
            </div>
            <div className="mb-3">
              <select value={repairRarity} onChange={(e) => setRepairRarity(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs">
                <option value="All">Show Filter — All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            {repairFiltered.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-6">No cars need repair — your fleet is pristine.</div>
            ) : (
              <div className="space-y-1.5">
                {repairFiltered.map((v: any) => {
                  const damage = v.damage ?? 0;
                  const base = (v.purchasePrice ?? 0) > 0 ? v.purchasePrice : (v.speed ?? 50) * 1000;
                  const cost = Math.max(100, Math.floor((damage / 100) * base * 0.05));
                  return (
                    <div key={v._id} className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-900/30 p-2.5">
                      <span className="text-[9px] font-black uppercase shrink-0" style={{ color: getRarityColor(v.rarity) }}>{rarityLabel(v.rarity)}</span>
                      <span className="flex-1 text-xs font-bold">{v.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">Car value {fmt(base)}</span>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${damage >= 95 ? "bg-red-500" : damage > 40 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${100 - damage}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold w-16 text-right ${damage >= 95 ? "text-red-400" : "text-amber-400"}`}>{damage}%</span>
                      <span className="text-[11px] font-black text-green-400 w-20 text-right">{fmt(cost)}</span>
                      <BuyBtn active onClick={() => wrap("repair:" + v._id, () => repair({ vehicleId: v._id }), (r) => `Repaired for ${fmt(r.cost)}!`)}>Repair</BuyBtn>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

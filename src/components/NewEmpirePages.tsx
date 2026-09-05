import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// =====================================================================
// NEW FRONTIERS — UI PAGES
// Economy: businesses, property flipping, vendor stalls, escrow trades,
// shares, gambling debts, casino tables, race betting, treasure hunting,
// fuel market, car tuning. Retention: streaks, return bonus, playtime,
// idle income, milestones, badges, player of the week, hall of fame,
// VIP lounge, cosmetics, starter packs, flash deals, city events,
// lottery rollover, boss invasions, bug bounty, feedback, heatmap.
// =====================================================================

const fmt = (x: unknown, d = 0) => {
  const v = typeof x === "number" && Number.isFinite(x) ? x : d;
  return v.toLocaleString();
};

function Card({ title, icon, children, className = "" }: { title?: string; icon?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`mafia-card rounded-xl p-4 space-y-3 ${className}`}>
      {title && (
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger" | "gold";
  className?: string;
}) {
  const styles =
    variant === "ghost"
      ? "border border-slate-700/50 text-slate-300 hover:bg-slate-800/40"
      : variant === "danger"
        ? "bg-red-600/80 text-white hover:bg-red-600"
        : variant === "gold"
          ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white hover:from-amber-600 hover:to-amber-500"
          : "bg-primary text-primary-foreground hover:opacity-90";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function PageHead({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function Stat({ label, value, color = "text-slate-200" }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-2 text-center">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}

// =====================================================================
// FUEL MARKET
// =====================================================================
export function FuelMarketPage() {
  const data = useQuery(api.businessSystem.getFuelMarket);
  const player = useQuery(api.game.getPlayer);
  const buyFuel = useMutation(api.businessSystem.buyFuel);
  const sellFuel = useMutation(api.businessSystem.sellFuel);
  const setGasPrice = useMutation(api.businessSystem.setGasPrice);
  const [amt, setAmt] = useState("1000");
  const [adminPrice, setAdminPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const isAdmin = player?.role === "admin";

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="⛽" title="Fuel Market" sub="Buy low, sell high — prices rotate every 6 hours." />
      <Card title="Current Market Price" icon="🛢️">
        <div className="flex items-end gap-3">
          <div className="text-4xl font-black text-amber-400">${fmt(data?.price, 2.4)}</div>
          <div className="text-xs text-slate-500 pb-1">base ${fmt(data?.basePrice, 2.4)} / unit</div>
        </div>
        <div className="text-[11px] text-slate-500">
          Next price rotation in{" "}
          {data?.nextRotate ? new Date(Math.max(0, data.nextRotate - Date.now())).toISOString().slice(11, 19) : "—"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Your Stock" value={`${fmt(data?.myStock)} L`} color="text-blue-400" />
          <Stat label="Stock Value" value={`$${fmt(data?.stockValue)}`} color="text-green-400" />
          <Stat label="Total Fuel Profit" value={`$${fmt(data?.fuelProfit)}`} color="text-amber-400" />
        </div>
        <div className="flex gap-2">
          <input
            value={amt}
            onChange={(e) => setAmt(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Amount"
            className="flex-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm"
          />
          <Btn disabled={busy} onClick={() => run(() => buyFuel({ amount: Number(amt) || 0 }))}>Buy Fuel</Btn>
          <Btn disabled={busy} variant="gold" onClick={() => run(() => sellFuel({ amount: Number(amt) || 0 }))}>Sell Fuel</Btn>
        </div>
      </Card>
      {isAdmin && (
        <Card title="Admin — Price Override" icon="⚙️">
          <div className="flex gap-2">
            <input
              value={adminPrice}
              onChange={(e) => setAdminPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Gas price (0 = auto)"
              className="flex-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm"
            />
            <Btn disabled={busy} onClick={() => run(() => setGasPrice({ price: Number(adminPrice) || 0 }))}>Set Price</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// =====================================================================
// BUSINESS EMPIRE (businesses + shares + idle income)
// =====================================================================
export function BusinessEmpirePage() {
  const data = useQuery(api.businessSystem.getBusinessEmpire);
  const idle = useQuery(api.retentionSystem.getIdleIncome);
  const openBusiness = useMutation(api.businessSystem.openBusiness);
  const upgradeBusiness = useMutation(api.businessSystem.upgradeBusiness);
  const collectBusinessIncome = useMutation(api.businessSystem.collectBusinessIncome);
  const buyShares = useMutation(api.businessSystem.buyShares);
  const sellShares = useMutation(api.businessSystem.sellShares);
  const claimDividends = useMutation(api.businessSystem.claimDividends);
  const claimIdleIncome = useMutation(api.retentionSystem.claimIdleIncome);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  const idleHours = idle ? Math.max(0, idle.msAway / 3600000) : 0;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🏢" title="Business Empire" sub="Open storefronts, hire the streets, and let money work while you're away." />
      {idle && idle.msAway > 3600000 && (
        <Card title="Idle Income" icon="😴" className="border-amber-500/30">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Away" value={`${idleHours.toFixed(1)}h`} />
            <Stat label="Hourly Rate" value={`$${fmt(idle.hourly)}`} color="text-green-400" />
            <Stat label="Waiting Payout" value={`$${fmt(idle.estPayout)}`} color="text-amber-400" />
          </div>
          <Btn variant="gold" disabled={busy || idle.estPayout <= 0} onClick={() => run(() => claimIdleIncome({}))}>Claim Idle Income</Btn>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Buy a Business" icon="🏪">
          <div className="space-y-2">
            {data?.catalog.map((b: any) => {
              const owned = data.owned.some((o: any) => o.type === b.id);
              return (
                <div key={b.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                  <span className="text-xl">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold">{b.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{b.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">${fmt(b.price)}</div>
                    <div className="text-[10px] text-green-400">+${fmt(b.income)}/h</div>
                  </div>
                  <Btn disabled={busy || owned} onClick={() => run(() => openBusiness({ catalogId: b.id }))}>
                    {owned ? "Owned" : "Open"}
                  </Btn>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Your Businesses" icon="🏬">
            {!data?.owned.length && <div className="text-xs text-slate-500">You don't own any businesses yet.</div>}
            <div className="space-y-2">
              {data?.owned.map((b: any) => (
                <div key={b._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                  <span className="text-lg">🏬</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{b.name} <span className="text-amber-400">Lv.{fmt(b.level, 1)}</span></div>
                    <div className="text-[10px] text-green-400">+${fmt(b.income)}/h</div>
                  </div>
                  <Btn disabled={busy} onClick={() => run(() => collectBusinessIncome({ businessId: b._id }))}>Collect</Btn>
                  <Btn disabled={busy} variant="ghost" onClick={() => run(() => upgradeBusiness({ businessId: b._id }))}>Upgrade</Btn>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Shares in Other Players' Companies" icon="📈">
            <div className="text-[10px] text-slate-500 mb-2">Buy shares in businesses and claim dividends every 24h.</div>
            <div className="space-y-2">
              {data?.allBiz.map((b: any) => {
                const mine = data.myShares.find((s: any) => s.businessId === b._id);
                const price = Math.max(1, Math.round(b.price / 1000));
                return (
                  <div key={b._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                    <span className="text-lg">📊</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{b.name} <span className="text-slate-500">({b.city})</span></div>
                      <div className="text-[10px] text-slate-500">
                        ${fmt(price)}/share{mine ? ` · You hold ${fmt(mine.shares)}` : ""}
                      </div>
                    </div>
                    <Btn disabled={busy} onClick={() => run(() => buyShares({ businessId: b._id, shares: 1 }))}>+1</Btn>
                    {mine && (
                      <>
                        <Btn disabled={busy} variant="gold" onClick={() => run(() => claimDividends({ businessId: b._id }))}>Dividends</Btn>
                        <Btn disabled={busy} variant="ghost" onClick={() => run(() => sellShares({ businessId: b._id, shares: 1 }))}>Sell</Btn>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// PROPERTY FLIPPING & RENTALS
// =====================================================================
export function PropertyFlipPage() {
  const data = useQuery(api.businessSystem.getBusinessEmpire);
  const catalog = useQuery(api.businessSystem.getPropertyCatalog);
  const buyProperty = useMutation(api.businessSystem.buyProperty);
  const renovateProperty = useMutation(api.businessSystem.renovateProperty);
  const setRent = useMutation(api.businessSystem.setRent);
  const claimRent = useMutation(api.businessSystem.claimRent);
  const evictTenant = useMutation(api.businessSystem.evictTenant);
  const sellProperty = useMutation(api.businessSystem.sellProperty);
  const [tenant, setTenant] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🏘️" title="Property Flipping & Rentals" sub="Buy run-down, renovate, rent it out — or flip it for profit." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Buy & Flip" icon="🏚️">
          <div className="space-y-2">
            {catalog?.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-slate-500">${fmt(p.price)} · ${fmt(p.rent)}/day rent</div>
                </div>
                <Btn disabled={busy} onClick={() => run(() => buyProperty({ catalogId: p.id }))}>Buy</Btn>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Your Properties" icon="🔑">
          {!data?.myProps.length && <div className="text-xs text-slate-500">No properties yet. Snatch up a fixer-upper!</div>}
          <div className="space-y-2">
            {data?.myProps.map((p: any) => {
              const renLv = p.renovationLevel ?? 0;
              const rented = p.rentedTo;
              return (
                <div key={p._id} className="bg-slate-800/30 rounded-lg p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏠</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{p.name} {renLv > 0 && <span className="text-amber-400">★{renLv}</span>}</div>
                      <div className="text-[10px] text-slate-500">
                        Value ${fmt(p.price)} · Income ${fmt(p.income)}/day{rented ? ` · Tenant: ${rented}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Btn disabled={busy} onClick={() => run(() => renovateProperty({ propertyId: p._id }))}>Renovate</Btn>
                    {rented ? (
                      <>
                        <Btn disabled={busy} variant="gold" onClick={() => run(() => claimRent({ propertyId: p._id }))}>Collect Rent</Btn>
                        <Btn disabled={busy} variant="danger" onClick={() => run(() => evictTenant({ propertyId: p._id }))}>Evict</Btn>
                      </>
                    ) : (
                      <div className="flex gap-1.5">
                        <input
                          value={tenant[p._id] ?? ""}
                          onChange={(e) => setTenant((t) => ({ ...t, [p._id]: e.target.value }))}
                          placeholder="Tenant name"
                          className="w-32 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-1.5 text-xs"
                        />
                        <Btn disabled={busy || !(tenant[p._id] ?? "").trim()} onClick={() => run(() => setRent({ propertyId: p._id, tenantName: (tenant[p._id] ?? "").trim() }))}>
                          Rent Out
                        </Btn>
                      </div>
                    )}
                    <Btn disabled={busy} variant="ghost" onClick={() => run(() => sellProperty({ propertyId: p._id }))}>Sell</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// VENDOR STALLS
// =====================================================================
export function StallMarketPage() {
  const data = useQuery(api.businessSystem.getStallMarket);
  const rentStall = useMutation(api.businessSystem.rentStall);
  const listStallItem = useMutation(api.businessSystem.listStallItem);
  const buyFromStall = useMutation(api.businessSystem.buyFromStall);
  const collectStallEarnings = useMutation(api.businessSystem.collectStallEarnings);
  const closeStall = useMutation(api.businessSystem.closeStall);
  const [city, setCity] = useState("New York");
  const [stallName, setStallName] = useState("");
  const [listings, setListings] = useState<Record<string, { price: string; qty: string }>>({});
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🏪" title="Vendor Stalls" sub="Rent a stall, list inventory items, and earn while you're offline." />
      <Card title="Rent a Stall ($250k / 7 days)" icon="🛖">
        <div className="flex gap-2">
          <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm">
            {data?.cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={stallName}
            onChange={(e) => setStallName(e.target.value)}
            placeholder="Stall name (optional)"
            className="flex-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm"
          />
          <Btn disabled={busy} onClick={() => run(() => rentStall({ city, stallName }))}>Rent Stall</Btn>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Your Stalls" icon="📦">
          {!data?.mine.length && <div className="text-xs text-slate-500">You have no stalls.</div>}
          <div className="space-y-2">
            {data?.mine.map((s: any) => (
              <div key={s._id} className="bg-slate-800/30 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛖</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{s.stallName} <span className="text-slate-500">({s.city})</span></div>
                    <div className="text-[10px] text-slate-500">
                      {s.itemName ? `${s.itemName} ×${fmt(s.qty)} @ $${fmt(s.price)}` : "Empty — list an item"} · Earnings ${fmt(s.earnings)}
                    </div>
                  </div>
                </div>
                {s.itemName && (
                  <div className="flex gap-1.5">
                    <Btn disabled={busy} variant="gold" onClick={() => run(() => collectStallEarnings({ stallId: s._id }))}>Collect ${fmt(s.earnings)}</Btn>
                    <Btn disabled={busy} variant="danger" onClick={() => run(() => closeStall({ stallId: s._id }))}>Close Stall</Btn>
                  </div>
                )}
                {!s.itemName && (
                  <div className="space-y-1">
                    {data.myInventory.map((i: any) => (
                      <div key={i._id} className="flex items-center gap-1.5">
                        <span className="text-[11px] flex-1 truncate">{i.name} ×{fmt(i.quantity)}</span>
                        <input
                          value={listings[s._id]?.price ?? ""}
                          onChange={(e) => setListings((l) => ({ ...l, [s._id]: { ...l[s._id], price: e.target.value.replace(/[^0-9]/g, "") } }))}
                          placeholder="$"
                          className="w-20 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1 text-[11px]"
                        />
                        <input
                          value={listings[s._id]?.qty ?? ""}
                          onChange={(e) => setListings((l) => ({ ...l, [s._id]: { ...l[s._id], qty: e.target.value.replace(/[^0-9]/g, "") } }))}
                          placeholder="Qty"
                          className="w-14 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1 text-[11px]"
                        />
                        <Btn disabled={busy} variant="ghost" className="!px-2 !py-1" onClick={() => run(() => listStallItem({
                          stallId: s._id, inventoryId: i._id,
                          price: Number(listings[s._id]?.price) || 0,
                          qty: Number(listings[s._id]?.qty) || 1,
                        }))}>List</Btn>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Market Stalls" icon="🛒">
          {!data?.others.length && <div className="text-xs text-slate-500">No active listings from other players.</div>}
          <div className="space-y-2">
            {data?.others.map((s: any) => (
              <div key={s._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-lg">🛍️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{s.itemName} <span className="text-slate-500">×{fmt(s.qty)}</span></div>
                  <div className="text-[10px] text-slate-500 truncate">{s.stallName} · {s.city} · by {s.ownerName}</div>
                </div>
                <div className="text-xs font-bold text-green-400">${fmt(s.price)}</div>
                <Btn disabled={busy} onClick={() => run(() => buyFromStall({ stallId: s._id, qty: 1 }))}>Buy</Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// ESCROW TRADES
// =====================================================================
export function EscrowTradePage() {
  const data = useQuery(api.businessSystem.getEscrowMarket);
  const createEscrow = useMutation(api.businessSystem.createEscrow);
  const cancelEscrow = useMutation(api.businessSystem.cancelEscrow);
  const acceptEscrow = useMutation(api.businessSystem.acceptEscrow);
  const [offeredType, setOfferedType] = useState("cash");
  const [requestedType, setRequestedType] = useState("points");
  const [offeredAmt, setOfferedAmt] = useState("100000");
  const [requestedAmt, setRequestedAmt] = useState("1000");
  const [offeredItem, setOfferedItem] = useState("");
  const [requestedItem, setRequestedItem] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  const label = (t: string) => (t === "cash" ? "💵 Cash" : t === "points" ? "🏆 Points" : "📦 Item");

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🤝" title="Escrow Trades" sub="Safe player-to-player trades. Your side is held in escrow until the deal closes." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Create a Trade" icon="📝">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">You offer</div>
              <select value={offeredType} onChange={(e) => setOfferedType(e.target.value)} className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs">
                <option value="cash">Cash</option>
                <option value="points">Points</option>
                <option value="item">Item</option>
              </select>
              {offeredType === "item" ? (
                <select value={offeredItem} onChange={(e) => setOfferedItem(e.target.value)} className="w-full mt-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs">
                  <option value="">Select item…</option>
                  {data?.myInventory.map((i: any) => (
                    <option key={i._id} value={i._id}>{i.name} ×{fmt(i.quantity)}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={offeredAmt}
                  onChange={(e) => setOfferedAmt(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Amount"
                  className="w-full mt-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs"
                />
              )}
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">You want</div>
              <select value={requestedType} onChange={(e) => setRequestedType(e.target.value)} className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs">
                <option value="points">Points</option>
                <option value="cash">Cash</option>
                <option value="item">Item</option>
              </select>
              {requestedType === "item" ? (
                <select value={requestedItem} onChange={(e) => setRequestedItem(e.target.value)} className="w-full mt-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs">
                  <option value="">Select item…</option>
                  {data?.myInventory.map((i: any) => (
                    <option key={i._id} value={i._id}>{i.name} ×{fmt(i.quantity)}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={requestedAmt}
                  onChange={(e) => setRequestedAmt(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Amount"
                  className="w-full mt-1 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs"
                />
              )}
            </div>
          </div>
          <Btn disabled={busy || (offeredType === "item" && !offeredItem) || (requestedType === "item" && !requestedItem)}
            onClick={() => run(() => createEscrow({
              offeredType,
              offeredAmount: offeredType === "item" ? 1 : Number(offeredAmt) || 0,
              requestedType,
              requestedAmount: requestedType === "item" ? 1 : Number(requestedAmt) || 0,
              offeredItemId: offeredType === "item" && offeredItem ? (offeredItem as any) : undefined,
              requestedItemId: requestedType === "item" && requestedItem ? (requestedItem as any) : undefined,
            }))}>
            Post Trade
          </Btn>
          <div className="text-[10px] text-slate-500">You have ${fmt(data?.myMoney)} and {fmt(data?.myPoints)} points.</div>
        </Card>
        <div className="space-y-4">
          <Card title="Your Offers" icon="⏳">
            {!data?.mine.length && <div className="text-xs text-slate-500">No open offers.</div>}
            <div className="space-y-2">
              {data?.mine.map((t: any) => (
                <div key={t._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                  <div className="flex-1 text-[11px]">
                    Give {label(t.offeredType)} {t.offeredType === "item" ? t.offeredItemName : fmt(t.offeredAmount)} → get {label(t.requestedType)} {t.requestedType === "item" ? t.requestedItemName : fmt(t.requestedAmount)}
                  </div>
                  <Btn disabled={busy} variant="danger" onClick={() => run(() => cancelEscrow({ tradeId: t._id }))}>Cancel</Btn>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Open Offers" icon="🛒">
            {!data?.offers.length && <div className="text-xs text-slate-500">No open offers from other players.</div>}
            <div className="space-y-2">
              {data?.offers.map((t: any) => (
                <div key={t._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                  <div className="flex-1 min-w-0 text-[11px]">
                    <div className="font-bold truncate">{t.offererName}</div>
                    <div className="text-slate-500">
                      Gives {t.offeredType === "item" ? t.offeredItemName : fmt(t.offeredAmount) + " " + t.offeredType} for {t.requestedType === "item" ? t.requestedItemName : fmt(t.requestedAmount) + " " + t.requestedType}
                    </div>
                  </div>
                  <Btn disabled={busy} onClick={() => run(() => acceptEscrow({ tradeId: t._id }))}>Accept</Btn>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// GAMBLING DEBTS (loan sharking)
// =====================================================================
export function GamblingDebtsPage() {
  const data = useQuery(api.businessSystem.getBusinessEmpire);
  const player = useQuery(api.game.getPlayer);
  const targets = useQuery(api.businessSystem.getLendTargets);
  const extendDebt = useMutation(api.businessSystem.extendDebt);
  const repayDebt = useMutation(api.businessSystem.repayDebt);
  const collectDebt = useMutation(api.businessSystem.collectDebt);
  const [lend, setLend] = useState<Record<string, { amount: string; interest: string }>>({});
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="💸" title="Gambling Debts" sub="Lend money at interest. If they don't pay, send the collectors." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Extend a Loan" icon="🦈">
          <div className="text-[10px] text-slate-500 mb-2">Pick a player, set the amount and daily interest (5–50%).</div>
          <div className="space-y-2">
            {targets?.map((u: any) => (
              <div key={u.id} className="bg-slate-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-500">Lv.{fmt(u.level, 1)} · ${fmt(u.money)}</div>
                  </div>
                  <input
                    value={lend[u.id]?.amount ?? ""}
                    onChange={(e) => setLend((l) => ({ ...l, [u.id]: { ...l[u.id], amount: e.target.value.replace(/[^0-9]/g, "") } }))}
                    placeholder="Amount"
                    className="w-24 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]"
                  />
                  <input
                    value={lend[u.id]?.interest ?? ""}
                    onChange={(e) => setLend((l) => ({ ...l, [u.id]: { ...l[u.id], interest: e.target.value.replace(/[^0-9]/g, "") } }))}
                    placeholder="%/day"
                    className="w-14 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]"
                  />
                  <Btn disabled={busy} className="!px-2 !py-1" onClick={() => run(() => extendDebt({
                    debtorId: u.id as any,
                    amount: Number(lend[u.id]?.amount) || 0,
                    interestPct: Number(lend[u.id]?.interest) || 10,
                  }))}>Lend</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Your Debts" icon="📜">
          {!data?.debts.length && <div className="text-xs text-slate-500">No active debts.</div>}
          <div className="space-y-2">
            {data?.debts.map((d: any) => {
              const isCreditor = player?._id === d.creditorId;
              const days = Math.max(0, (Date.now() - d.createdAt) / 86400000);
              const total = Math.round(d.amount * (1 + (d.interestPct / 100) * days));
              return (
                <div key={d._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                  <span className="text-lg">{isCreditor ? "🧾" : "😰"}</span>
                  <div className="flex-1 min-w-0 text-[11px]">
                    <div className="font-bold truncate">
                      {isCreditor ? `${d.debtorName} owes you` : `You owe ${d.creditorName}`} ${fmt(d.amount)}
                    </div>
                    <div className="text-slate-500">Now ${fmt(total)} ({d.interestPct}%/day) · {d.paid ? "Paid" : "Outstanding"}</div>
                  </div>
                  {!d.paid && (
                    <>
                      {d.debtorId && !isCreditor && (
                        <Btn disabled={busy} variant="gold" onClick={() => run(() => repayDebt({ debtId: d._id }))}>Repay</Btn>
                      )}
                      {isCreditor && (
                        <Btn disabled={busy} variant="danger" onClick={() => run(() => collectDebt({ debtId: d._id }))}>Collect</Btn>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// UNDERGROUND CASINO TABLES
// =====================================================================
export function CasinoTablesPage() {
  const data = useQuery(api.businessSystem.getCasinoTables);
  const openCasinoTable = useMutation(api.businessSystem.openCasinoTable);
  const closeCasinoTable = useMutation(api.businessSystem.closeCasinoTable);
  const playCasinoTable = useMutation(api.businessSystem.playCasinoTable);
  const [game, setGame] = useState("blackjack");
  const [minBet, setMinBet] = useState("10000");
  const [maxBet, setMaxBet] = useState("1000000");
  const [rake, setRake] = useState("5");
  const [bets, setBets] = useState<Record<string, string>>({});
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🃏" title="Underground Casino Tables" sub="Host your own blackjack or dice table and rake in the house cut." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Host a Table" icon="🎰">
          <div className="grid grid-cols-2 gap-2">
            <select value={game} onChange={(e) => setGame(e.target.value)} className="bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs">
              <option value="blackjack">Blackjack</option>
              <option value="dice">Dice (High/Low/7)</option>
            </select>
            <input value={rake} onChange={(e) => setRake(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Rake % (1-15)" className="bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs" />
            <input value={minBet} onChange={(e) => setMinBet(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Min bet" className="bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs" />
            <input value={maxBet} onChange={(e) => setMaxBet(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Max bet" className="bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs" />
          </div>
          <Btn disabled={busy} onClick={() => run(() => openCasinoTable({
            game, minBet: Number(minBet) || 1000, maxBet: Number(maxBet) || 100000, rakePct: Number(rake) || 5,
          }))}>Open Table</Btn>
          <div className="text-[10px] text-slate-500">Your house profit: ${fmt(data?.myProfit)}</div>
        </Card>
        <Card title="Active Tables" icon="🃏">
          {!data?.tables.length && <div className="text-xs text-slate-500">No tables open right now.</div>}
          <div className="space-y-2">
            {data?.tables.map((t: any) => (
              <div key={t._id} className="bg-slate-800/30 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.game === "blackjack" ? "🂡" : "🎲"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{t.hostName}'s {t.game === "blackjack" ? "Blackjack" : "Dice"} table</div>
                    <div className="text-[10px] text-slate-500">{t.city} · ${fmt(t.minBet)}–${fmt(t.maxBet)} · {t.rakePct}% rake</div>
                  </div>
                  <Btn disabled={busy} variant="danger" className="!px-2 !py-1" onClick={() => run(() => closeCasinoTable({ tableId: t._id }))}>Close</Btn>
                </div>
                <div className="flex gap-1.5">
                  <input
                    value={bets[t._id] ?? ""}
                    onChange={(e) => setBets((b) => ({ ...b, [t._id]: e.target.value.replace(/[^0-9]/g, "") }))}
                    placeholder="Bet"
                    className="w-24 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]"
                  />
                  {t.game === "dice" && (
                    <select value={guesses[t._id] ?? "high"} onChange={(e) => setGuesses((g) => ({ ...g, [t._id]: e.target.value }))} className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]">
                      <option value="high">High (8+)</option>
                      <option value="low">Low (≤6)</option>
                      <option value="seven">7 (5x)</option>
                    </select>
                  )}
                  <Btn disabled={busy} className="!px-2 !py-1" onClick={() => run(() => playCasinoTable({
                    tableId: t._id, bet: Number(bets[t._id]) || 0,
                    guess: t.game === "dice" ? (guesses[t._id] ?? "high") : undefined,
                  }))}>Play</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// PLAYER RACES & BETTING
// =====================================================================
export function RaceBettingPage() {
  const data = useQuery(api.businessSystem.getRaceBetting);
  const hostRace = useMutation(api.businessSystem.hostRace);
  const joinRace = useMutation(api.businessSystem.joinRace);
  const startRace = useMutation(api.businessSystem.startRace);
  const placeRaceBet = useMutation(api.businessSystem.placeRaceBet);
  const [track, setTrack] = useState("Downtown Circuit");
  const [fee, setFee] = useState("100000");
  const [bets, setBets] = useState<Record<string, Record<string, string>>>({});
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  const tracks = ["Downtown Circuit", "Harbor Run", "Desert Mile", "Strip Drag", "Coastal Sprint"];

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🏁" title="Player Races & Betting" sub="Host a street race, join one, or back a racer." />
      <Card title="Host a Race" icon="🏎️">
        <div className="flex gap-2">
          <select value={track} onChange={(e) => setTrack(e.target.value)} className="bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs flex-1">
            {tracks.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={fee} onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Entry fee" className="w-28 bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-2 py-2 text-xs" />
          <Btn disabled={busy} onClick={() => run(() => hostRace({ track, entryFee: Number(fee) || 10000 }))}>Host Race</Btn>
        </div>
        <div className="text-[10px] text-slate-500">Winnings: ${fmt(data?.myWins)} · Your last {data?.myBets.length ?? 0} bets shown below.</div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Open Races" icon="🚦">
          {!data?.open.length && <div className="text-xs text-slate-500">No open races.</div>}
          <div className="space-y-2">
            {data?.open.map((r: any) => (
              <div key={r._id} className="bg-slate-800/30 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{r.track} <span className="text-slate-500">by {r.creatorName}</span></div>
                    <div className="text-[10px] text-slate-500">{r.racerNames.join(", ")} · fee ${fmt(r.entryFee)} · pool ${fmt(r.prizePool)}</div>
                  </div>
                  <Btn disabled={busy} onClick={() => run(() => joinRace({ raceId: r._id }))}>Join</Btn>
                  <Btn disabled={busy} variant="gold" onClick={() => run(() => startRace({ raceId: r._id }))}>Start</Btn>
                </div>
                <div className="text-[10px] font-bold text-slate-400">Bet on a racer:</div>
                <div className="flex flex-wrap gap-1.5">
                  {r.racerIds.map((rid: string, idx: number) => (
                    <div key={rid} className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">{r.racerNames[idx]}</span>
                      <input
                        value={bets[r._id]?.[rid] ?? ""}
                        onChange={(e) => setBets((b) => ({ ...b, [r._id]: { ...b[r._id], [rid]: e.target.value.replace(/[^0-9]/g, "") } }))}
                        placeholder="$"
                        className="w-16 bg-[oklch(0.10_0.012_35)] border border-border rounded px-1.5 py-1 text-[10px]"
                      />
                      <Btn disabled={busy} className="!px-1.5 !py-1" onClick={() => run(() => placeRaceBet({ raceId: r._id, targetId: rid as any, amount: Number(bets[r._id]?.[rid]) || 0 }))}>Bet</Btn>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Recent Results" icon="🏆">
            {!data?.recent.length && <div className="text-xs text-slate-500">No finished races yet.</div>}
            <div className="space-y-1.5">
              {data?.recent.map((r: any) => (
                <div key={r._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2 text-[11px]">
                  <span className="text-lg">🏁</span>
                  <div className="flex-1">
                    <div className="font-bold truncate">{r.winnerName} won {r.track}</div>
                    <div className="text-slate-500">Pool ${fmt(r.prizePool)} · {r.racerNames.length} racers</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Your Bets" icon="🎫">
            {!data?.myBets.length && <div className="text-xs text-slate-500">No bets placed yet.</div>}
            <div className="space-y-1.5">
              {data?.myBets.map((b: any) => (
                <div key={b._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2 text-[11px]">
                  <div className="flex-1">
                    <div className="font-bold">${fmt(b.amount)} on {b.targetName}</div>
                    <div className="text-slate-500">{b.paidOut ? "Paid out" : "Pending"} · odds {fmt(b.odds, 1)}x</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// TREASURE HUNTING
// =====================================================================
export function TreasureHuntPage() {
  const data = useQuery(api.businessSystem.getTreasureHunt);
  const buyTreasureMap = useMutation(api.businessSystem.buyTreasureMap);
  const digTreasure = useMutation(api.businessSystem.digTreasure);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🗺️" title="Treasure Hunting" sub="Buy a map, dig for loot — but watch out for ambushes." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Map Dealer" icon="🪙">
          <div className="space-y-2">
            {data?.catalog.map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold">{m.name}</div>
                  <div className={`text-[10px] ${m.rarity === "legendary" ? "text-amber-400" : m.rarity === "epic" ? "text-purple-400" : m.rarity === "rare" ? "text-blue-400" : "text-slate-500"}`}>
                    {m.rarity} · {m.region}
                  </div>
                </div>
                <div className="text-xs font-bold">${fmt(m.cost)}</div>
                <Btn disabled={busy} onClick={() => run(() => buyTreasureMap({ mapId: m.id }))}>Buy</Btn>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-500">Dug so far: {fmt(data?.dugTotal)} treasures (max 5 maps at once).</div>
        </Card>
        <Card title="Your Maps" icon="🔦">
          {!data?.maps.length && <div className="text-xs text-slate-500">No maps yet — the streets are hiding fortunes.</div>}
          <div className="space-y-2">
            {data?.maps.map((m: any) => (
              <div key={m._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-xl">🗺️</span>
                <div className="flex-1">
                  <div className="text-xs font-bold">{m.name}</div>
                  <div className="text-[10px] text-slate-500">{m.region}{m.dug ? " · dug" : ""}</div>
                </div>
                {!m.dug && <Btn disabled={busy} variant="gold" onClick={() => run(() => digTreasure({ mapId: m._id }))}>Dig!</Btn>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// CAR TUNING
// =====================================================================
export function CarTuningPage() {
  const data = useQuery(api.businessSystem.getTuningShop);
  const buyCarCustomization = useMutation(api.businessSystem.buyCarCustomization);
  const [car, setCar] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  const group = (part: string) => data?.parts.filter((p: any) => p.part === part) ?? [];
  const groupLabel: Record<string, string> = { paint: "Paint", rims: "Rims", spoiler: "Spoilers", plate: "Plates", nitro: "Nitro" };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🔧" title="Car Tuning" sub="Customize your garage — paint, rims, plates and nitro." />
      <Card title="Choose a Vehicle" icon="🚗">
        {!data?.vehicles.length && <div className="text-xs text-slate-500">You have no vehicles. Steal or buy one first.</div>}
        <div className="flex flex-wrap gap-2">
          {data?.vehicles.map((v: any) => (
            <button
              key={v._id}
              onClick={() => setCar(v._id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${car === v._id ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-700/50 text-slate-400 hover:border-slate-500"}`}
            >
              {v.name} {v.rarity && <span className="text-[10px] text-slate-500">({v.rarity})</span>}
            </button>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.keys(groupLabel).map((part) => (
          <Card key={part} title={groupLabel[part]} icon="🎨">
            <div className="space-y-2">
              {group(part).map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                  <span className="text-lg">{p.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-500">${fmt(p.cost)}</div>
                  </div>
                  <Btn disabled={busy || !car} className="!px-2 !py-1" onClick={() => run(() => buyCarCustomization({ vehicleId: car as any, partId: p.id }))}>Buy</Btn>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// LOGIN STREAKS + RETURN BONUS + PLAYTIME + IDLE
// =====================================================================
export function StreakRewardsPage() {
  const streak = useQuery(api.retentionSystem.getStreakStatus);
  const retBonus = useQuery(api.retentionSystem.getReturnBonus);
  const playtime = useQuery(api.retentionSystem.getPlaytimeStatus);
  const idle = useQuery(api.retentionSystem.getIdleIncome);
  const claimLoginStreak = useMutation(api.retentionSystem.claimLoginStreak);
  const claimReturnBonus = useMutation(api.retentionSystem.claimReturnBonus);
  const claimPlaytimeReward = useMutation(api.retentionSystem.claimPlaytimeReward);
  const claimIdleIncome = useMutation(api.retentionSystem.claimIdleIncome);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="📅" title="Daily Rewards & Streaks" sub="Log in daily, come back from trips, stay online — get paid." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`Login Streak — Day ${fmt(streak?.streak)}`} icon="🔥">
          <div className="grid grid-cols-7 gap-1.5">
            {streak?.ladder.map((d: any) => (
              <div key={d.day} className={`rounded-lg p-1.5 text-center border ${d.day <= (streak.streak % 7 || 7) ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700/40 bg-slate-800/30"}`}>
                <div className="text-[9px] text-slate-500">D{d.day}</div>
                <div className="text-[9px] font-bold text-amber-300">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            {streak?.claimed ? "✅ Claimed today — come back tomorrow!" : streak?.broken ? "💔 Streak broken — start again today." : "Claim today's reward!"}
          </div>
          <Btn variant="gold" disabled={busy || streak?.claimed} onClick={() => run(() => claimLoginStreak({}))}>Claim Daily Streak</Btn>
        </Card>
        <Card title="Return-Player Bonus" icon="✈️">
          <div className="text-[11px] text-slate-400">
            {retBonus ? (retBonus.eligible ? `You've been away ${fmt(retBonus.daysAway)} days — welcome back!` : `Days away: ${fmt(retBonus.daysAway)} (need 3+).`) : "..."}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {retBonus?.tiers.map((t: any) => (
              <div key={t.days} className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500">{t.label} ({t.days}d)</div>
                <div className="text-xs font-bold text-green-400">${fmt(t.money)}</div>
                <div className="text-[10px] text-amber-400">+{fmt(t.points)} pts</div>
              </div>
            ))}
          </div>
          <Btn variant="gold" disabled={busy || !retBonus?.eligible} onClick={() => run(() => claimReturnBonus({}))}>Claim Return Bonus</Btn>
        </Card>
        <Card title="Playtime Rewards" icon="⏱️">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Minutes Online" value={fmt(playtime?.minutesOnline)} color="text-blue-400" />
            <Stat label="Gifts Given" value={fmt(playtime?.rewardsGiven)} color="text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-400">Earn $100k + 10 pts per hour of active play (up to 12h).</div>
          <Btn disabled={busy} onClick={() => run(() => claimPlaytimeReward({}))}>Claim Playtime Gift</Btn>
        </Card>
        <Card title="Idle Income" icon="😴">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Away" value={idle ? `${(idle.msAway / 3600000).toFixed(1)}h` : "—"} />
            <Stat label="Hourly" value={`$${fmt(idle?.hourly)}`} color="text-green-400" />
            <Stat label="Pending" value={`$${fmt(idle?.estPayout)}`} color="text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-400">
            {idle ? `${idle.businesses} businesses + ${idle.rentedProps} rented properties generate income while you're away.` : "..."}
          </div>
          <Btn variant="gold" disabled={busy} onClick={() => run(() => claimIdleIncome({}))}>Claim Idle Income</Btn>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// XP MILESTONES + BADGES
// =====================================================================
export function MilestonesBadgesPage() {
  const ms = useQuery(api.retentionSystem.getXpMilestones);
  const badges = useQuery(api.retentionSystem.getBadges);
  const claimXpMilestone = useMutation(api.retentionSystem.claimXpMilestone);
  const checkBadges = useMutation(api.retentionSystem.checkBadges);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🏅" title="Milestones & Badges" sub="Level milestones pay out big. Badges track your firsts." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="XP Milestones" icon="🎖️">
          <div className="space-y-2">
            {ms?.milestones.map((m: any) => {
              const reached = m.level <= (ms.claimedUpTo ?? 0);
              const claimable = ms.claimable?.some((c: any) => c.level === m.level);
              return (
                <div key={m.level} className={`flex items-center gap-2 rounded-lg p-2 ${reached ? "bg-slate-800/20 opacity-50" : claimable ? "bg-amber-500/10 border border-amber-500/30" : "bg-slate-800/30"}`}>
                  <div className="w-10 text-center text-xs font-black text-amber-400">Lv.{m.level}</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] text-slate-500">${fmt(m.reward)}{m.points ? ` + ${fmt(m.points)} pts` : ""}</div>
                  </div>
                  {claimable && (
                    <Btn disabled={busy} variant="gold" className="!px-2 !py-1" onClick={() => run(() => claimXpMilestone({ level: m.level }))}>Claim</Btn>
                  )}
                  {reached && <span className="text-[10px] text-slate-500">✅</span>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Badges" icon="🎖️">
          <Btn disabled={busy} onClick={() => run(() => checkBadges({}))}>Scan for New Badges</Btn>
          <div className="grid grid-cols-2 gap-2">
            {badges?.badges.map((b: any) => (
              <div key={b.id} className={`rounded-lg p-2 flex items-center gap-2 border ${b.earned ? "border-amber-500/40 bg-amber-500/10" : "border-slate-700/30 bg-slate-800/30 opacity-50"}`}>
                <span className="text-xl">{b.icon}</span>
                <div>
                  <div className="text-xs font-bold">{b.name}</div>
                  <div className="text-[10px] text-slate-500">{b.earned ? "Earned" : "Locked"}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// PLAYER OF THE WEEK + HALL OF FAME
// =====================================================================
export function FamePage() {
  const pow = useQuery(api.retentionSystem.getPlayerOfWeek);
  const hof = useQuery(api.retentionSystem.getHallOfFame);
  const player = useQuery(api.game.getPlayer);
  const votePlayerOfWeek = useMutation(api.retentionSystem.votePlayerOfWeek);
  const resolvePlayerOfWeek = useMutation(api.retentionSystem.resolvePlayerOfWeek);
  const recalcHallOfFame = useMutation(api.retentionSystem.recalcHallOfFame);
  const [tab, setTab] = useState<"pow" | "hof">("pow");
  const [busy, setBusy] = useState(false);
  const isAdmin = player?.role === "admin";

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  const boardLabel: Record<string, string> = { networth: "💰 Net Worth", level: "⭐ Level", kills: "💀 Kills", crimes: "🔪 Crimes", heists: "🏦 Heists", boss: "🐉 Boss Damage" };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🏆" title="Fame" sub="Vote for Player of the Week and climb the Hall of Fame." />
      <div className="flex gap-2">
        <Btn variant={tab === "pow" ? "gold" : "ghost"} onClick={() => setTab("pow")}>Player of the Week</Btn>
        <Btn variant={tab === "hof" ? "gold" : "ghost"} onClick={() => setTab("hof")}>Hall of Fame</Btn>
      </div>
      {tab === "pow" && (
        <Card title={`This Week (${pow?.week ?? ""})`} icon="🗳️">
          {pow?.winner ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-2">👑</div>
              <div className="text-lg font-black text-amber-400">{pow.winner.playerName}</div>
              <div className="text-xs text-slate-500">This week's Player of the Week!</div>
            </div>
          ) : (
            <>
              <div className="text-[11px] text-slate-400">
                {pow?.myVote ? "You've voted this week." : "Vote for who deserves the crown — winner gets $25M + 1,000 points."}
              </div>
              <div className="space-y-2">
                {pow?.candidates.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold">{c.name}</div>
                      <div className="text-[10px] text-slate-500">Lv.{fmt(c.level, 1)} · Net ${fmt(c.net)} · {fmt(c.votes)} votes</div>
                    </div>
                    <Btn disabled={busy || !!pow.myVote} onClick={() => run(() => votePlayerOfWeek({ candidateId: c.id as any }))}>Vote</Btn>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="text-[10px] text-slate-500">Your wins: {fmt(pow?.myWins)}</div>
          {isAdmin && <Btn disabled={busy} variant="ghost" onClick={() => run(() => resolvePlayerOfWeek({}))}>Resolve Last Week (admin)</Btn>}
        </Card>
      )}
      {tab === "hof" && (
        <div className="space-y-4">
          <div className="text-[11px] text-slate-400">Season {hof?.season} — the city's all-time legends.</div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(hof?.boards ?? {}).map(([cat, rows]: [string, any[]]) => (
              <Card key={cat} title={boardLabel[cat] ?? cat} icon="🏛️">
                <div className="space-y-1">
                  {rows.map((r) => (
                    <div key={r.playerId} className="flex items-center gap-2 text-xs bg-slate-800/30 rounded-lg px-2 py-1.5">
                      <span className={`w-6 font-black ${r.rank === 1 ? "text-yellow-400" : r.rank === 2 ? "text-gray-300" : r.rank === 3 ? "text-orange-400" : "text-slate-500"}`}>#{r.rank}</span>
                      <span className="flex-1 font-bold truncate">{r.playerName}</span>
                      <span className="text-slate-400">{fmt(r.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          {isAdmin && <Btn disabled={busy} onClick={() => run(() => recalcHallOfFame({}))}>Recalculate Hall of Fame (admin)</Btn>}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// VIP LOUNGE (VIP + ad-free + cosmetics + starter packs)
// =====================================================================
export function VipLoungePage() {
  const vip = useQuery(api.retentionSystem.getVipLounge);
  const cosmetics = useQuery(api.retentionSystem.getCosmeticShop);
  const packs = useQuery(api.retentionSystem.getStarterPacks);
  const buyVip = useMutation(api.retentionSystem.buyVip);
  const buyAdFree = useMutation(api.retentionSystem.buyAdFree);
  const buyCosmetic = useMutation(api.retentionSystem.buyCosmetic);
  const equipCosmetic = useMutation(api.retentionSystem.equipCosmetic);
  const claimStarterPack = useMutation(api.retentionSystem.claimStarterPack);
  const [tab, setTab] = useState<"vip" | "packs" | "cosmetics">("vip");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="👑" title="VIP Lounge" sub="Perks, cosmetics and starter packs — all purchasable with points." />
      <div className="text-[11px] text-slate-400">You have <span className="text-amber-400 font-bold">{fmt(vip?.points ?? cosmetics?.points ?? packs?.points)}</span> points.</div>
      <div className="flex gap-2">
        <Btn variant={tab === "vip" ? "gold" : "ghost"} onClick={() => setTab("vip")}>VIP & Ad-Free</Btn>
        <Btn variant={tab === "packs" ? "gold" : "ghost"} onClick={() => setTab("packs")}>Starter Packs</Btn>
        <Btn variant={tab === "cosmetics" ? "gold" : "ghost"} onClick={() => setTab("cosmetics")}>Cosmetics</Btn>
      </div>
      {tab === "vip" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="VIP Tiers" icon="💎">
            <div className="text-[11px] text-slate-400 mb-2">
              {vip?.active ? `Active: ${vip.current} until ${new Date(vip.until).toLocaleDateString()}` : "No active VIP status."}
            </div>
            <div className="space-y-2">
              {vip?.tiers.map((t: any) => (
                <div key={t.id} className="bg-slate-800/30 rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{t.name}</div>
                    <div className="text-[10px] text-slate-500">{t.perks.join(" · ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400">{fmt(t.cost)} pts</div>
                    <div className="text-[10px] text-slate-500">{t.days} days</div>
                  </div>
                  <Btn disabled={busy} onClick={() => run(() => buyVip({ tierId: t.id }))}>Buy</Btn>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Ad-Free Pass" icon="🚫">
            <div className="text-[11px] text-slate-400">
              {vip?.adFreeUntil && vip.adFreeUntil > Date.now()
                ? `Active until ${new Date(vip.adFreeUntil).toLocaleDateString()}`
                : "Remove ads for 30 days — 1,500 points."}
            </div>
            <Btn disabled={busy} onClick={() => run(() => buyAdFree({}))}>Go Ad-Free (1,500 pts)</Btn>
          </Card>
        </div>
      )}
      {tab === "packs" && (
        <Card title="Starter & Booster Packs" icon="🎁">
          <div className="space-y-2">
            {packs?.packs.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold">{p.name} {p.levelReq > 0 && <span className="text-slate-500">(Lv.{p.levelReq}+)</span>}</div>
                  <div className="text-[10px] text-slate-500">{p.rewardLabel}</div>
                </div>
                <div className="text-xs font-bold text-amber-400">{p.cost ? `${fmt(p.cost)} pts` : "FREE"}</div>
                <Btn disabled={busy || p.claimed} onClick={() => run(() => claimStarterPack({ packId: p.id }))}>
                  {p.claimed ? "Claimed" : "Claim"}
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      )}
      {tab === "cosmetics" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Cosmetic Shop" icon="🛍️">
            <div className="space-y-2">
              {cosmetics?.catalog.map((c: any) => {
                const owned = cosmetics.owned?.some((o: any) => o.id === c.id);
                const equipped = cosmetics.equipped?.[c.category] === c.id;
                return (
                  <div key={c.id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                    <span className="text-xl">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{c.name}</div>
                      <div className={`text-[10px] ${c.tier === "legendary" ? "text-amber-400" : c.tier === "epic" ? "text-purple-400" : "text-blue-400"}`}>
                        {c.category} · {c.tier}
                      </div>
                    </div>
                    {equipped ? (
                      <span className="text-[10px] font-bold text-green-400">Equipped</span>
                    ) : owned ? (
                      <Btn disabled={busy} variant="ghost" className="!px-2 !py-1" onClick={() => run(() => equipCosmetic({ cosmeticId: c.id, category: c.category }))}>Equip</Btn>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-amber-400">{fmt(c.cost)}</div>
                        <Btn disabled={busy} className="!px-2 !py-1" onClick={() => run(() => buyCosmetic({ cosmeticId: c.id }))}>Buy</Btn>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="Your Look" icon="🪞">
            {!cosmetics?.owned?.length && <div className="text-xs text-slate-500">Nothing owned yet — dress to impress.</div>}
            <div className="grid grid-cols-2 gap-2">
              {cosmetics?.owned.map((o: any) => (
                <div key={o.id} className="bg-slate-800/30 rounded-lg p-2 text-center">
                  <div className="text-2xl mb-1">{o.icon}</div>
                  <div className="text-[10px] font-bold">{o.name}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// FLASH DEALS + CITY EVENTS
// =====================================================================
export function FlashDealsPage() {
  const deals = useQuery(api.retentionSystem.getFlashDeals);
  const events = useQuery(api.retentionSystem.getCityEvents);
  const player = useQuery(api.game.getPlayer);
  const buyFlashDeal = useMutation(api.retentionSystem.buyFlashDeal);
  const addFlashDeal = useMutation(api.retentionSystem.addFlashDeal);
  const setBlackFriday = useMutation(api.retentionSystem.setBlackFriday);
  const setLockdown = useMutation(api.retentionSystem.setLockdown);
  const [form, setForm] = useState({ title: "", icon: "⚡", desc: "", cost: "1000", rewardLabel: "", rewardType: "cash", rewardValue: "1000000", hours: "24" });
  const [busy, setBusy] = useState(false);
  const isAdmin = player?.role === "admin";

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  const left = (until: number) => until > Date.now() ? `${Math.max(1, Math.ceil((until - Date.now()) / 3600000))}h left` : "ended";

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="⚡" title="Flash Deals & City Events" sub="Limited-time point deals and live city-wide events." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Live Deals" icon="🔥">
          {!deals?.deals.length && <div className="text-xs text-slate-500">No live deals right now — check back soon.</div>}
          <div className="space-y-2">
            {deals?.deals.map((d: any) => (
              <div key={d._id} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-2xl">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold">{d.title}</div>
                  <div className="text-[10px] text-slate-500">{d.desc}</div>
                  <div className="text-[10px] text-green-400">{d.rewardLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">{fmt(d.cost)} pts</div>
                  <div className="text-[10px] text-slate-500">{left(d.expiresAt)}</div>
                </div>
                <Btn disabled={busy || d.claimed} onClick={() => run(() => buyFlashDeal({ dealId: d._id }))}>
                  {d.claimed ? "Claimed" : "Buy"}
                </Btn>
              </div>
            ))}
          </div>
        </Card>
        <Card title="City Events" icon="🌆">
          <div className={`rounded-lg p-3 border ${events?.blackFriday.active ? "border-red-500/40 bg-red-500/10" : "border-slate-700/40 bg-slate-800/30"}`}>
            <div className="text-xs font-bold">🛍️ Black Friday</div>
            <div className="text-[11px] text-slate-400">
              {events?.blackFriday.active ? `Active — ${events.blackFriday.discount}% off points deals (${left(events.blackFriday.until)})` : "Inactive"}
            </div>
          </div>
          <div className={`rounded-lg p-3 border ${events?.lockdown.active ? "border-red-500/40 bg-red-500/10" : "border-slate-700/40 bg-slate-800/30"}`}>
            <div className="text-xs font-bold">🚨 City Lockdown</div>
            <div className="text-[11px] text-slate-400">
              {events?.lockdown.active ? `Active — crime pays double (${left(events.lockdown.until)})` : "Inactive"}
            </div>
          </div>
          {isAdmin && (
            <div className="space-y-2 border-t border-slate-700/40 pt-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Admin Controls</div>
              <div className="flex gap-2">
                <Btn variant="ghost" disabled={busy} onClick={() => run(() => setBlackFriday({ hours: 24 }))}>Black Friday 24h</Btn>
                <Btn variant="danger" disabled={busy} onClick={() => run(() => setLockdown({ hours: 12 }))}>Lockdown 12h</Btn>
                <Btn variant="ghost" disabled={busy} onClick={() => run(async () => { await setBlackFriday({ hours: 0 }); await setLockdown({ hours: 0 }); })}>End Events</Btn>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Deal title" className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]" />
                <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Icon" className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]" />
                <input value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} placeholder="Description" className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px] col-span-2" />
                <input value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Cost (pts)" className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]" />
                <input value={form.rewardValue} onChange={(e) => setForm((f) => ({ ...f, rewardValue: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Reward value" className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]" />
                <input value={form.rewardLabel} onChange={(e) => setForm((f) => ({ ...f, rewardLabel: e.target.value }))} placeholder="Reward label" className="bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]" />
                <div className="flex gap-1.5">
                  <select value={form.rewardType} onChange={(e) => setForm((f) => ({ ...f, rewardType: e.target.value }))} className="flex-1 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]">
                    <option value="cash">Cash</option>
                    <option value="points">Points</option>
                    <option value="bullets">Bullets</option>
                  </select>
                  <input value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Hours" className="w-16 bg-[oklch(0.10_0.012_35)] border border-border rounded px-2 py-1.5 text-[11px]" />
                </div>
                <Btn disabled={busy || !form.title} onClick={() => run(() => addFlashDeal({
                  title: form.title, icon: form.icon || "⚡", desc: form.desc,
                  cost: Number(form.cost) || 0, rewardLabel: form.rewardLabel || form.rewardType,
                  rewardType: form.rewardType, rewardValue: Number(form.rewardValue) || 0, hours: Number(form.hours) || 24,
                }))}>Add Deal</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// LOTTERY JACKPOT ROLLOVER
// =====================================================================
export function LotteryRolloverPage() {
  const data = useQuery(api.retentionSystem.getLotteryRollover);
  const player = useQuery(api.game.getPlayer);
  const processLotteryRollover = useMutation(api.retentionSystem.processLotteryRollover);
  const [busy, setBusy] = useState(false);
  const isAdmin = player?.role === "admin";

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🎫" title="Lottery Jackpot Rollover" sub="Missed draws roll their prize into the growing city jackpot." />
      <Card title="City Jackpot" icon="🤑">
        <div className="text-center py-6">
          <div className="text-5xl font-black text-amber-400 animate-money-text">${fmt(data?.jackpot)}</div>
          <div className="text-xs text-slate-500 mt-2">{data?.rolloverPct}% of every winnerless draw rolls over</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Pending Draws" value={fmt(data?.pendingDraws)} />
          <Stat label="Next Draw" value={data?.nextDraw ? new Date(data.nextDraw).toLocaleTimeString() : "—"} color="text-blue-400" />
        </div>
        {isAdmin && <Btn disabled={busy} variant="ghost" onClick={() => run(() => processLotteryRollover({}))}>Process Rollovers (admin)</Btn>}
      </Card>
    </div>
  );
}

// =====================================================================
// CITY BOSS INVASIONS
// =====================================================================
export function BossInvasionPage() {
  const data = useQuery(api.retentionSystem.getBossInvasions);
  const player = useQuery(api.game.getPlayer);
  const attackBoss = useMutation(api.retentionSystem.attackBoss);
  const spawnBoss = useMutation(api.retentionSystem.spawnBoss);
  const [busy, setBusy] = useState(false);
  const isAdmin = player?.role === "admin";

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🐉" title="City Boss Invasion" sub="A boss is terrorizing the city — deal damage, land the kill, take the loot." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Active Boss" icon="⚠️">
          {!data?.active.length && <div className="text-xs text-slate-500">The city is quiet… for now. Bosses spawn randomly.</div>}
          {data?.active.map((b: any) => (
            <div key={b._id} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl animate-breathe">{b.icon}</span>
                <div>
                  <div className="text-base font-black text-red-400">{b.name}</div>
                  <div className="text-[11px] text-slate-500">Invading {b.city} · ends {new Date(b.expiresAt).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Boss HP</span>
                  <span>{fmt(b.hp)} / {fmt(b.maxHp)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${(b.hp / Math.max(1, b.maxHp)) * 100}%` }} />
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Reward: ${fmt(b.rewardMin)}–${fmt(b.rewardMax)} + {fmt(b.pointsReward)} pts for the killing blow. Your damage: {fmt(data?.myDamage)}.
              </div>
              <Btn variant="danger" disabled={busy} onClick={() => run(() => attackBoss({ invasionId: b._id }))}>⚔️ Attack Boss</Btn>
            </div>
          ))}
        </Card>
        <Card title="Boss Roster" icon="📖">
          <div className="space-y-2">
            {data?.bosses.map((b: any) => (
              <div key={b.bossId} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2">
                <span className="text-2xl">{b.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold">{b.name}</div>
                  <div className="text-[10px] text-slate-500">{fmt(b.hp)} HP · rewards ${fmt(b.rewardMin)}–${fmt(b.rewardMax)}</div>
                </div>
                {isAdmin && (
                  <Btn disabled={busy} variant="ghost" className="!px-2 !py-1" onClick={() => run(() => spawnBoss({ bossId: b.bossId, city: "New York" }))}>Spawn</Btn>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// BUG BOUNTY + FEEDBACK BOARD
// =====================================================================
export function BugBountyPage() {
  const reports = useQuery(api.retentionSystem.getBugReports);
  const feedback = useQuery(api.retentionSystem.getFeedbackBoard);
  const player = useQuery(api.game.getPlayer);
  const submitBugReport = useMutation(api.retentionSystem.submitBugReport);
  const claimBugReward = useMutation(api.retentionSystem.claimBugReward);
  const submitFeedback = useMutation(api.retentionSystem.submitFeedback);
  const upvoteFeedback = useMutation(api.retentionSystem.upvoteFeedback);
  const [tab, setTab] = useState<"bug" | "ideas">("bug");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const isAdmin = player?.role === "admin";

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { alert(e.message || "Something went wrong"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="🐛" title="Bug Bounty & Feedback" sub="Found a bug? Get paid. Got an idea? The city votes." />
      <div className="flex gap-2">
        <Btn variant={tab === "bug" ? "gold" : "ghost"} onClick={() => setTab("bug")}>🐛 Bug Bounty</Btn>
        <Btn variant={tab === "ideas" ? "gold" : "ghost"} onClick={() => setTab("ideas")}>💡 Feedback Board</Btn>
      </div>
      {tab === "bug" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Report a Bug" icon="🪲">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What happened? How to reproduce?" rows={4} className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm" />
            <Btn disabled={busy} onClick={() => run(() => submitBugReport({ title, body }))}>Submit Report</Btn>
          </Card>
          <Card title="Your Reports" icon="📋">
            {!reports?.mine.length && <div className="text-xs text-slate-500">No reports yet.</div>}
            <div className="space-y-2">
              {reports?.mine.map((r: any) => (
                <div key={r._id} className="bg-slate-800/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold">{r.title}</div>
                      <div className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.status === "rewarded" ? "bg-green-500/20 text-green-400" : r.status === "resolved" ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/40 text-slate-400"}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{r.body}</div>
                  {r.status === "resolved" && (
                    <Btn disabled={busy} variant="gold" className="!px-2 !py-1 mt-1" onClick={() => run(() => claimBugReward({ reportId: r._id, reward: 500000 }))}>
                      Claim Reward ($500k)
                    </Btn>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      {tab === "ideas" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Suggest a Feature" icon="💡">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Idea title" className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe your idea…" rows={4} className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm" />
            <Btn disabled={busy} onClick={() => run(() => submitFeedback({ title, body }))}>Post Idea</Btn>
          </Card>
          <Card title="Top Ideas" icon="🗳️">
            {!feedback?.posts.length && <div className="text-xs text-slate-500">No ideas yet — shape the city!</div>}
            <div className="space-y-2">
              {feedback?.posts.map((p: any) => (
                <div key={p._id} className="bg-slate-800/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold">{p.title}</div>
                      <div className="text-[10px] text-slate-500">by {p.playerName}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.status === "shipped" ? "bg-green-500/20 text-green-400" : p.status === "planned" ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/40 text-slate-400"}`}>
                      {p.status}
                    </span>
                    <Btn disabled={busy || p.voted} variant="ghost" className="!px-2 !py-1" onClick={() => run(() => upvoteFeedback({ postId: p._id }))}>
                      ▲ {fmt(p.votes)}
                    </Btn>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{p.body}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-500">You have {fmt(feedback?.myVotes)}/10 votes (max 10 per player).</div>
          </Card>
        </div>
      )}
      {isAdmin && <div className="text-[10px] text-slate-500">Admin tools for reports/ideas live in the Admin Panel.</div>}
    </div>
  );
}

// =====================================================================
// ADMIN ECONOMY HEAT-MAP
// =====================================================================
export function EconomyHeatmapPage() {
  const data = useQuery(api.retentionSystem.getEconomyHeatmap);
  const player = useQuery(api.game.getPlayer);
  const isAdmin = player?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="animate-fade-in space-y-4">
        <PageHead icon="🔒" title="Economy Heat-Map" sub="Admin only" />
        <Card title="Restricted" icon="🚫">
          <div className="text-xs text-slate-500">Only administrators can view the economy heat-map.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <PageHead icon="📊" title="Economy Heat-Map" sub={`Generated ${data ? new Date(data.generatedAt).toLocaleString() : "…"}`} />
      <Card title="Totals" icon="💰">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Stat label="Players" value={fmt(data?.totals.players)} color="text-blue-400" />
          <Stat label="Total Cash" value={`$${fmt(data?.totals.money)}`} color="text-green-400" />
          <Stat label="Total Banked" value={`$${fmt(data?.totals.bank)}`} color="text-amber-400" />
          <Stat label="Total Points" value={fmt(data?.totals.points)} color="text-yellow-400" />
          <Stat label="Avg Money" value={`$${fmt(data?.totals.avgMoney)}`} />
        </div>
      </Card>
      <Card title="24h Flows" icon="🌊">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="Money Created" value={`$${fmt(data?.flows.moneyCreated24h)}`} color="text-green-400" />
          <Stat label="Casino Flow" value={`$${fmt(data?.flows.casinoFlow24h)}`} color="text-purple-400" />
          <Stat label="Crimes 24h" value={fmt(data?.flows.crimes24h)} color="text-red-400" />
          <Stat label="Fights 24h" value={fmt(data?.flows.fights24h)} color="text-orange-400" />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Flagged Accounts" icon="🚨">
          {!data?.flagged.length && <div className="text-xs text-slate-500">No suspicious accounts detected.</div>}
          <div className="space-y-1.5">
            {data?.flagged.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[11px]">
                <span className="font-bold flex-1 truncate">{f.name}</span>
                <span className="text-slate-500">Lv.{f.level}</span>
                <span className="text-red-400 font-bold">${fmt(f.money)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Top Earners (all time)" icon="📈">
          <div className="space-y-1.5">
            {data?.topGainers.map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-2 text-[11px]">
                <span className="w-6 font-black text-slate-500">#{i + 1}</span>
                <span className="font-bold flex-1 truncate">{g.name}</span>
                <span className="text-slate-500">Lv.{g.level}</span>
                <span className="text-green-400">${fmt(g.gained24h)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DrugTradePage() {
  const trade = useQuery(api.drugSystem.getDrugTrade);
  const initTrade = useMutation(api.drugSystem.initDrugTrade);
  const buyStock = useMutation(api.drugSystem.buyStock);
  const deliverDrug = useMutation(api.drugSystem.deliver);
  const setThc = useMutation(api.drugSystem.setThcContent);
  const setBudget = useMutation(api.drugSystem.setMarketingBudget);
  const buyChannel = useMutation(api.drugSystem.buyMarketingChannel);
  const acceptContract = useMutation(api.drugSystem.acceptContract);
  const [tab, setTab] = useState<"stock" | "deliver" | "marketing" | "contracts">("stock");
  const [buyQty, setBuyQty] = useState(1000);
  const [deliverQty, setDeliverQty] = useState(1000);
  const [thcVal, setThcVal] = useState(30);
  const [budgetVal, setBudgetVal] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (trade) { setThcVal(trade.originalThc); setBudgetVal(trade.marketingBudget); } }, [trade]);

  if (trade === undefined) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading drug trade...</div>;
  if (!trade) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3"><span className="text-3xl">💊</span><h2 className="text-2xl font-bold">Drugs</h2></div>
        <div className="mafia-card rounded-xl p-6 text-center">
          <div className="text-5xl mb-3">🌿</div>
          <div className="text-lg font-bold mb-2">Start Your Drug Empire</div>
          <div className="text-xs text-muted-foreground mb-4">Commit crimes to earn drugs. Sell them for profit. Deliver within 5 days or lose THC quality.</div>
          <button onClick={async () => { setLoading(true); try { await initTrade(); } catch (e: any) { setMsg(e.message); } setLoading(false); }}
            disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50">🌿 Initialize Drug Trade</button>
          {msg && <div className="text-xs text-red-400 mt-2">{msg}</div>}
        </div>
      </div>
    );
  }

  const stockPct = Math.min(100, (trade.totalStock / trade.maxStock) * 100);
  const thcPct = Math.min(100, trade.thcContent);

  const handleBuy = async () => { setLoading(true); setMsg(""); try { const r = await buyStock({ quantity: buyQty }); setMsg(`Bought ${buyQty.toLocaleString()}g for $${r.cost.toLocaleString()}`); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  const handleDeliver = async () => { setLoading(true); setMsg(""); try { const r = await deliverDrug({ quantity: deliverQty }); setMsg(`Delivered ${r.delivered.toLocaleString()}g — +$${r.revenue.toLocaleString()} (THC: ${r.thcUsed}%)`); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  const handleThc = async () => { setLoading(true); setMsg(""); try { const r = await setThc({ thc: thcVal }); setMsg(`THC set to ${r.thc}%`); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  const handleBudget = async () => { setLoading(true); setMsg(""); try { await setBudget({ amount: budgetVal }); setMsg(`Budget $${budgetVal.toLocaleString()}`); } catch (e: any) { setMsg(e.message); } setLoading(false); };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">💊</span><h2 className="text-2xl font-bold">Drugs</h2></div>
        {trade.thcDegrading && (
          <div className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-400 animate-pulse">
            ⚠️ THC DEGRADING — Deliver now!
          </div>
        )}
      </div>

      {/* Status Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-4 border border-green-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Total stock</div>
          <div className="text-lg font-black text-green-400">{trade.totalStock.toLocaleString()}g</div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-2"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${stockPct}%` }} /></div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>🌿 Bought: {trade.boughtStock.toLocaleString()}g</span>
            <span>🔪 Crime: {trade.crimeStock.toLocaleString()}g</span>
          </div>
        </div>
        <div className={`mafia-card rounded-xl p-4 border ${trade.thcDegrading ? "border-red-500/30 bg-red-950/10" : "border-blue-500/20"}`}>
          <div className="text-[10px] text-muted-foreground uppercase">THC content</div>
          <div className={`text-lg font-black ${trade.thcDegrading ? "text-red-400" : "text-blue-400"}`}>{trade.thcContent}%</div>
          {trade.thcDegrading ? (
            <div className="text-[9px] text-red-400 mt-1 animate-pulse">⚠️ Lost quality — deliver ASAP</div>
          ) : (
            <div className="text-[9px] text-muted-foreground mt-1">⏱️ {trade.daysUntilDegradation}d until degradation</div>
          )}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5"><div className={`h-full rounded-full transition-all ${trade.thcDegrading ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${thcPct}%` }} /></div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-yellow-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Shipment value</div>
          <div className="text-lg font-black text-yellow-400">${(trade.totalStock * trade.pricePerGram).toLocaleString()}</div>
          <div className="text-[9px] text-muted-foreground mt-1">${trade.pricePerGram}/g · {trade.daysSinceDelivery}d since delivery</div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-purple-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Customer reviews</div>
          <div className="text-lg font-black text-purple-400">{"⭐".repeat(Math.min(5, Math.floor(trade.customerRating)))} ({trade.customerRating.toFixed(2)})</div>
          <div className="text-[9px] text-muted-foreground mt-1">{trade.totalReviews} reviews</div>
        </div>
      </div>

      {/* Delivery + Demand */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`mafia-card rounded-xl p-4 border ${trade.thcDegrading ? "border-red-500/20" : "border-emerald-500/20"}`}>
          <div className="text-[10px] text-muted-foreground uppercase mb-1">Ready for delivery</div>
          <div className="text-xl font-black text-emerald-400">{trade.totalStock.toLocaleString()}g</div>
          <div className="text-[9px] text-muted-foreground">{stockPct.toFixed(0)}% capacity</div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-red-500/20">
          <div className="text-[10px] text-muted-foreground uppercase mb-1">Demand</div>
          <div className="text-xl font-black text-red-400">{trade.demand.toLocaleString()}g</div>
          <div className="text-[9px] text-muted-foreground">+{Math.floor(trade.marketingBudget * 0.001 + trade.totalDelivered * 0.01)}/cycle</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
        {(["stock", "deliver", "marketing", "contracts"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-semibold rounded-md capitalize transition-all ${tab === t ? "bg-green-600 text-white" : "text-muted-foreground hover:text-white"}`}>{t}</button>
        ))}
      </div>

      {tab === "stock" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-2">🔪 Crime-Sourced Stock</div>
            <div className="text-xs text-muted-foreground mb-2">Every crime you commit adds drugs to your inventory. Higher level + higher reward = more drugs per crime.</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-900/30 rounded-lg p-2">Crime stock: <span className="text-green-400 font-bold">{trade.crimeStock.toLocaleString()}g</span></div>
              <div className="bg-slate-900/30 rounded-lg p-2">Bought stock: <span className="text-blue-400 font-bold">{trade.boughtStock.toLocaleString()}g</span></div>
            </div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-2">📦 Buy Stock (with cash)</div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><label className="text-[10px] text-muted-foreground">Quantity (grams)</label>
                <input type="number" value={buyQty} onChange={(e) => setBuyQty(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div className="text-right"><div className="text-[10px] text-muted-foreground">Cost</div><div className="text-sm font-bold text-yellow-400">${(buyQty * trade.pricePerGram).toLocaleString()}</div></div>
            </div>
            <button onClick={handleBuy} disabled={loading} className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50 mt-2">
              💰 Buy {buyQty.toLocaleString()}g · ${(buyQty * trade.pricePerGram).toLocaleString()}
            </button>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-2">🧪 THC Content</div>
            <input type="range" min={5} max={90} value={thcVal} onChange={(e) => setThcVal(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>5%</span><span className="text-blue-400 font-bold">{thcVal}%</span><span>90%</span></div>
            <button onClick={handleThc} disabled={loading} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50">Set THC to {thcVal}%</button>
          </div>
        </div>
      )}

      {tab === "deliver" && (
        <div className="space-y-3">
          {trade.thcDegrading && (
            <div className="mafia-card rounded-xl p-3 border border-red-500/30 bg-red-950/20">
              <div className="text-xs font-bold text-red-400">⚠️ THC DEGRADING</div>
              <div className="text-[10px] text-red-300/70 mt-1">Your product lost quality from sitting too long. Deliver now to sell at current THC level ({trade.thcContent}%). Each day past 5 days reduces THC by 2%.</div>
            </div>
          )}
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-2">🚚 Deliver</div>
            <div className="text-[10px] text-muted-foreground mb-2">Higher THC = higher price per gram. Crime stock is used first.</div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><label className="text-[10px] text-muted-foreground">Quantity</label>
                <input type="number" value={deliverQty} onChange={(e) => setDeliverQty(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div className="text-right"><div className="text-[10px] text-muted-foreground">Revenue</div><div className="text-sm font-bold text-green-400">${Math.floor(deliverQty * trade.pricePerGram * (1 + (trade.thcContent - 20) * 0.01)).toLocaleString()}</div></div>
            </div>
            <button onClick={handleDeliver} disabled={loading || trade.totalStock < deliverQty} className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 mt-2">
              🚚 Deliver {deliverQty.toLocaleString()}g · THC: {trade.thcContent}%
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-muted-foreground">Delivered</div><div className="text-green-400 font-bold">{trade.totalDelivered.toLocaleString()}g</div></div>
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-muted-foreground">Revenue</div><div className="text-green-400 font-bold">${trade.totalRevenue.toLocaleString()}</div></div>
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-muted-foreground">Days since</div><div className={`font-bold ${trade.daysSinceDelivery > 5 ? "text-red-400" : "text-amber-400"}`}>{trade.daysSinceDelivery}d</div></div>
          </div>
        </div>
      )}

      {tab === "marketing" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-3">📢 Marketing Budget</div>
            <div className="flex items-center gap-3">
              <input type="number" value={budgetVal} onChange={(e) => setBudgetVal(Number(e.target.value))} className="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm" />
              <button onClick={handleBudget} disabled={loading} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 disabled:opacity-50">Set</button>
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">Current: ${trade.marketingBudget.toLocaleString()}</div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-3">📡 Marketing Channels</div>
            <div className="space-y-2">
              {trade.marketingChannelsDef.map((ch: any) => {
                const owned = (trade.marketingChannels as string[]).includes(ch.id);
                return (
                  <div key={ch.id} className={`flex items-center justify-between p-3 rounded-lg border ${owned ? "border-green-500/30 bg-green-950/20" : "border-slate-700/40 bg-slate-900/30"}`}>
                    <div><div className="text-xs font-bold">{ch.name}</div><div className="text-[9px] text-muted-foreground">+{ch.demandBoost} demand · ${ch.cost.toLocaleString()}</div></div>
                    {owned ? <span className="text-[10px] text-green-400 font-bold">✓ Owned</span> :
                      <button onClick={async () => { setLoading(true); try { await buyChannel({ channelId: ch.id }); setMsg(`Bought ${ch.name}!`); } catch (e: any) { setMsg(e.message); } setLoading(false); }}
                        disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 disabled:opacity-50">Buy</button>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "contracts" && (
        <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
          <div className="text-sm font-bold mb-3">📋 Contracts</div>
          {(!trade.contracts || trade.contracts.length === 0) ? (
            <div className="text-xs text-muted-foreground text-center py-6">No active contracts.</div>
          ) : (
            <div className="space-y-2">
              {trade.contracts.map((c: any) => (
                <div key={c.offerId} className={`flex items-center justify-between p-3 rounded-lg border ${c.accepted ? "border-green-500/30 bg-green-950/20" : "border-slate-700/40 bg-slate-900/30"}`}>
                  <div><div className="text-xs font-bold">{c.drug} — {c.quantity.toLocaleString()}g</div><div className="text-[9px] text-muted-foreground">Payout: ${Math.floor(c.quantity * trade.pricePerGram * 1.5).toLocaleString()}</div></div>
                  {c.accepted ? <span className="text-[10px] text-green-400 font-bold">✓ Done</span> :
                    <button onClick={async () => { setLoading(true); try { const r = await acceptContract({ offerId: c.offerId }); setMsg(`+$${r.revenue.toLocaleString()}`); } catch (e: any) { setMsg(e.message); } setLoading(false); }}
                      disabled={loading} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 disabled:opacity-50">Accept</button>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {msg && <div className="text-xs text-primary text-center mt-2">{msg}</div>}
    </div>
  );
}

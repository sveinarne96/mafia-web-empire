import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Tab = "overview" | "grow" | "upgrades" | "deliver" | "marketing" | "contracts" | "workers";

export function DrugTradePage() {
  const trade = useQuery(api.drugSystem.getDrugTrade);
  const initTrade = useMutation(api.drugSystem.initDrugTrade);
  const deliverDrug = useMutation(api.drugSystem.deliver);
  const deliverAllMutation = useMutation(api.drugSystem.deliverAll);
  const setThc = useMutation(api.drugSystem.setThcContent);
  const setBudget = useMutation(api.drugSystem.setMarketingBudget);
  const buyChannel = useMutation(api.drugSystem.buyMarketingChannel);
  const acceptContract = useMutation(api.drugSystem.acceptContract);
  const upgradeTier = useMutation(api.drugSystem.upgradeTier);
  const buyUpgradeMut = useMutation(api.drugSystem.buyUpgrade);
  const plantStrainMut = useMutation(api.drugSystem.plantStrain);
  const harvestPlantMut = useMutation(api.drugSystem.harvestPlant);
  const harvestAllMut = useMutation(api.drugSystem.harvestAll);
  const hireWorkerMut = useMutation(api.drugSystem.hireWorker);
  const autoHarvestMut = useMutation(api.drugSystem.autoHarvest);

  const [tab, setTab] = useState<Tab>("overview");
  const [deliverQty, setDeliverQty] = useState(1000);
  const [thcVal, setThcVal] = useState(30);
  const [budgetVal, setBudgetVal] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (trade) { setThcVal(trade.originalThc); setBudgetVal(trade.marketingBudget); }
    const t = setInterval(() => setTick((v) => v + 1), 5000);
    return () => clearInterval(t);
  }, [trade]);

  if (trade === undefined) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading greenhouse...</div>;

  if (!trade) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3"><span className="text-3xl">🌿</span><h2 className="text-2xl font-bold">Greenhouse</h2></div>
        <div className="mafia-card rounded-xl p-6 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <div className="text-lg font-bold mb-2">Start Your Greenhouse</div>
          <div className="text-xs text-muted-foreground mb-4">Plant strains, grow drugs, sell for profit. Commit crimes to earn free drugs. Deliver within 5 days or lose THC quality.</div>
          <button onClick={async () => { setLoading(true); try { await initTrade(); } catch (e: any) { setMsg(e.message); } setLoading(false); }}
            disabled={loading} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">🌱 Initialize Greenhouse</button>
          {msg && <div className="text-xs text-red-400 mt-2">{msg}</div>}
        </div>
      </div>
    );
  }

  const stockPct = Math.min(100, (trade.totalStock / trade.maxStock) * 100);
  const thcPct = Math.min(100, trade.thcContent);
  const readySlots = trade.growingSlots?.filter((s: any) => s.isReady) ?? [];

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Status", icon: "📊" },
    { id: "grow", label: "Grow", icon: "🌱" },
    { id: "upgrades", label: "Upgrades", icon: "⬆️" },
    { id: "deliver", label: "Deliver", icon: "🚚" },
    { id: "marketing", label: "Marketing", icon: "📡" },
    { id: "contracts", label: "Contracts", icon: "📋" },
    { id: "workers", label: "Workers", icon: "🧑\u200D🌾" },
  ];

  const doMsg = (m: string) => { setMsg(m); setLoading(false); };
  const doErr = (e: any) => { setMsg(e.message || "Error"); setLoading(false); };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌿</span>
          <div>
            <h2 className="text-2xl font-bold">Greenhouse</h2>
            <div className="text-[10px] text-muted-foreground">{trade.tier?.icon} {trade.tier?.name} · {trade.drugEmoji} {trade.drugType}</div>
          </div>
        </div>
        {trade.thcDegrading && (
          <div className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-400 animate-pulse">
            ⚠️ THC DEGRADING — Deliver now!
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="mafia-card rounded-xl p-3 border border-emerald-500/20">
          <div className="text-[9px] text-muted-foreground uppercase">Stock</div>
          <div className="text-sm font-black text-emerald-400">{trade.totalStock.toLocaleString()}g</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stockPct}%` }} /></div>
          <div className="text-[8px] text-muted-foreground mt-0.5">🔪 {trade.crimeStock.toLocaleString()}g crime · 🛒 {trade.boughtStock.toLocaleString()}g bought</div>
        </div>
        <div className={`mafia-card rounded-xl p-3 border ${trade.thcDegrading ? "border-red-500/30 bg-red-950/10" : "border-blue-500/20"}`}>
          <div className="text-[9px] text-muted-foreground uppercase">THC</div>
          <div className={`text-sm font-black ${trade.thcDegrading ? "text-red-400" : "text-blue-400"}`}>{trade.thcContent}%</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1"><div className={`h-full rounded-full transition-all ${trade.thcDegrading ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${thcPct}%` }} /></div>
          {trade.thcDegrading ? <div className="text-[8px] text-red-400 mt-0.5 animate-pulse">⚠️ Losing quality!</div> : <div className="text-[8px] text-muted-foreground mt-0.5">⏱️ {trade.daysUntilDegradation}d left</div>}
        </div>
        <div className="mafia-card rounded-xl p-3 border border-yellow-500/20">
          <div className="text-[9px] text-muted-foreground uppercase">Value</div>
          <div className="text-sm font-black text-yellow-400">${(trade.totalStock * trade.pricePerGram).toLocaleString()}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">${trade.pricePerGram}/g</div>
        </div>
        <div className="mafia-card rounded-xl p-3 border border-purple-500/20">
          <div className="text-[9px] text-muted-foreground uppercase">Rating</div>
          <div className="text-sm font-black text-purple-400">{"⭐".repeat(Math.min(5, Math.floor(trade.customerRating)))} {trade.customerRating.toFixed(1)}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">{trade.totalReviews} reviews</div>
        </div>
        <div className="mafia-card rounded-xl p-3 border border-cyan-500/20">
          <div className="text-[9px] text-muted-foreground uppercase">Revenue</div>
          <div className="text-sm font-black text-cyan-400">${trade.totalRevenue.toLocaleString()}</div>
          <div className="text-[8px] text-muted-foreground mt-0.5">{trade.totalDelivered.toLocaleString()}g delivered</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${tab === t.id ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800/30"}`}>
            {t.icon} {t.label}
            {t.id === "grow" && readySlots.length > 0 && <span className="ml-1 text-emerald-400 animate-pulse">({readySlots.length})</span>}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">{msg}</div>}

      {/* === OVERVIEW === */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
            <div className="text-xs font-bold mb-2">📊 Delivery Stats</div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Delivered</span><span className="text-emerald-400 font-bold">{trade.totalDelivered.toLocaleString()}g</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Revenue</span><span className="text-yellow-400 font-bold">${trade.totalRevenue.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer Rating</span><span className="text-purple-400 font-bold">{trade.customerRating.toFixed(2)}/5.0</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Demand</span><span className="text-orange-400 font-bold">{trade.demand.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Search Bonus</span><span className="text-cyan-400 font-bold">+{(trade.totalSearchBonus * 100).toFixed(0)}%</span></div>
            </div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
            <div className="text-xs font-bold mb-2">🌿 Growing Slots ({trade.activeSlotCount}/{trade.maxSlots})</div>
            <div className="space-y-1.5 text-[10px]">
              {(!trade.growingSlots || trade.growingSlots.length === 0) && <div className="text-muted-foreground">No plants growing yet</div>}
              {trade.growingSlots?.filter((s: any) => !s.harvestedAt).map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span>{slot.strain?.icon || "🌿"}</span>
                    <span className="font-bold">{slot.strain?.name || slot.strainId}</span>
                    {slot.isReady ? <span className="text-emerald-400 animate-pulse">READY</span> : <span className="text-muted-foreground">Growing... {Math.ceil(slot.timeLeft / 1000)}s</span>}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-blue-400">{slot.thc}% THC</span>
                    <span className="text-emerald-400">{slot.yield}g</span>
                    {slot.isReady && <button onClick={async () => { setLoading(true); try { const r = await harvestPlantMut({ slotId: slot.id }); doMsg(`Harvested ${r.yield}g at ${r.thc}% THC!`); } catch (e: any) { doErr(e); } }} className="text-emerald-400 font-bold hover:underline text-[10px]">Harvest</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === GROW === */}
      {tab === "grow" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold">🌱 Available Strains ({trade.activeSlotCount}/{trade.maxSlots} slots)</div>
              {readySlots.length > 0 && (
                <button onClick={async () => { setLoading(true); try { const r = await harvestAllMut(); doMsg(`Harvested ${r.harvested} plants — ${r.totalYield}g at ${r.thc}% THC!`); } catch (e: any) { doErr(e); } }}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 disabled:opacity-50" disabled={loading}>
                  🌾 Harvest All ({readySlots.length})
                </button>
              )}
            </div>
            {trade.activeSlotCount >= trade.maxSlots && <div className="text-[10px] text-amber-400 mb-2">⚠️ All slots full — upgrade greenhouse or harvest plants</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {trade.strains?.map((strain: any) => {
                const cost = Math.floor(strain.basePrice * strain.baseYield * 0.1);
                return (
                  <div key={strain.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{strain.icon}</span>
                      <div>
                        <div className="text-[11px] font-bold">{strain.name}</div>
                        <div className={`text-[9px] ${strain.rarity === "legendary" ? "text-yellow-400" : strain.rarity === "epic" ? "text-purple-400" : strain.rarity === "rare" ? "text-blue-400" : "text-slate-400"}`}>{strain.rarity}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[9px] mb-2">
                      <div><span className="text-muted-foreground">Yield:</span> <span className="text-emerald-400">{strain.baseYield}g</span></div>
                      <div><span className="text-muted-foreground">THC:</span> <span className="text-blue-400">{strain.baseThc}%</span></div>
                      <div><span className="text-muted-foreground">Time:</span> <span className="text-amber-400">{Math.ceil(strain.growTime / 1000)}s</span></div>
                    </div>
                    <button onClick={async () => { setLoading(true); try { const r = await plantStrainMut({ strainId: strain.id }); doMsg(`Planted ${r.strain} — ${r.yield}g at ${r.thc}% THC for $${r.cost.toLocaleString()}`); } catch (e: any) { doErr(e); } }}
                      disabled={loading || trade.activeSlotCount >= trade.maxSlots}
                      className="w-full px-2 py-1.5 bg-emerald-600/80 text-white rounded text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      🌱 Plant — ${cost.toLocaleString()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* === UPGRADES === */}
      {tab === "upgrades" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
            <div className="text-xs font-bold mb-2">🏗️ Greenhouse Tier</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {trade.allTiers?.map((tier: any) => {
                const isCurrent = trade.tier?.id === tier.id;
                const allTiersList = trade.allTiers || [];
                const currentIdx = allTiersList.findIndex((t: any) => t.id === trade.tier?.id) ?? 0;
                const thisIdx = allTiersList.findIndex((t: any) => t.id === tier.id);
                const isUpgradeable = !isCurrent && thisIdx > currentIdx;
                return (
                  <div key={tier.id} className={`rounded-lg p-3 border text-center transition-all ${isCurrent ? "border-emerald-500/40 bg-emerald-500/10" : isUpgradeable ? "border-amber-500/20 hover:border-amber-500/40" : "border-slate-700/20 opacity-50"}`}>
                    <div className="text-xl mb-1">{tier.icon}</div>
                    <div className="text-[10px] font-bold">{tier.name}</div>
                    <div className="text-[8px] text-muted-foreground">{tier.slots} slots · {tier.yieldMultiplier}x yield · {tier.thcCap}% cap</div>
                    <div className="text-[9px] mt-1">{tier.desc}</div>
                    {isCurrent ? <div className="text-[9px] text-emerald-400 mt-1 font-bold">✓ Current</div> : isUpgradeable ? (
                      <button onClick={async () => { setLoading(true); try { const r = await upgradeTier({ tierId: tier.id }); doMsg(`Upgraded to ${r.tier}!`); } catch (e: any) { doErr(e); } }}
                        disabled={loading} className="mt-1 w-full px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-bold hover:bg-amber-700 disabled:opacity-50">
                        ${tier.cost.toLocaleString()}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
            <div className="text-xs font-bold mb-2">⬆️ Growing Upgrades</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {trade.upgrades?.map((upg: any) => {
                const lvl = trade.upgradeLevels?.[upg.id] || 0;
                const cost = Math.floor(upg.cost * (1 + lvl * 0.5));
                const maxed = lvl >= upg.maxLevel;
                return (
                  <div key={upg.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{upg.icon}</span>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold">{upg.name}</div>
                        <div className="text-[9px] text-muted-foreground">{upg.desc}</div>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">Lv.{lvl}/{upg.maxLevel}</div>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mb-1.5">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(lvl / upg.maxLevel) * 100}%` }} />
                    </div>
                    {maxed ? <div className="text-[9px] text-emerald-400 text-center font-bold">✓ MAX</div> : (
                      <button onClick={async () => { setLoading(true); try { const r = await buyUpgradeMut({ upgradeId: upg.id }); doMsg(`Upgraded ${r.upgrade} to Lv.${r.level}!`); } catch (e: any) { doErr(e); } }}
                        disabled={loading} className="w-full px-2 py-1 bg-emerald-600/80 text-white rounded text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-50 transition">
                        ⬆️ Upgrade — ${cost.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* === DELIVER === */}
      {tab === "deliver" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
            <div className="text-xs font-bold mb-3">🚚 Deliver Drugs for Cash</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-[9px] text-muted-foreground">Available</div>
                <div className="text-sm font-black text-emerald-400">{trade.totalStock.toLocaleString()}g</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-[9px] text-muted-foreground">Price/g</div>
                <div className="text-sm font-black text-yellow-400">${trade.pricePerGram}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-[9px] text-muted-foreground">THC</div>
                <div className={`text-sm font-black ${trade.thcDegrading ? "text-red-400" : "text-blue-400"}`}>{trade.thcContent}%</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-[9px] text-muted-foreground">Search Bonus</div>
                <div className="text-sm font-black text-cyan-400">+{(trade.totalSearchBonus * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-muted-foreground whitespace-nowrap">Qty (g):</label>
                <input type="number" value={deliverQty} onChange={(e) => setDeliverQty(Number(e.target.value))}
                  className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-1.5 text-xs" />
                <span className="text-[10px] text-muted-foreground">≈ ${(deliverQty * trade.pricePerGram * (1 + trade.totalSearchBonus)).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await deliverDrug({ quantity: deliverQty }); doMsg(`✅ Delivered ${r.delivered.toLocaleString()}g — +$${r.revenue.toLocaleString()} (THC: ${r.thcUsed}%)`); } catch (e: any) { doErr(e); } }}
                  disabled={loading || trade.totalStock === 0}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition">
                  🚚 Deliver
                </button>
                <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await deliverAllMutation(); doMsg(`✅ DELIVERED ALL ${r.delivered.toLocaleString()}g — +$${r.revenue.toLocaleString()} (THC: ${r.thcUsed}%)`); } catch (e: any) { doErr(e); } }}
                  disabled={loading || trade.totalStock === 0}
                  className="px-4 py-2.5 bg-yellow-600 text-white rounded-xl text-xs font-bold hover:bg-yellow-700 disabled:opacity-50 transition">
                  ⚡ Deliver ALL
                </button>
              </div>
            </div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-blue-500/20">
            <div className="text-xs font-bold mb-2">🧪 THC Content Control</div>
            <div className="flex items-center gap-3">
              <input type="range" min={5} max={90} value={thcVal} onChange={(e) => setThcVal(Number(e.target.value))} className="flex-1" />
              <span className="text-sm font-bold text-blue-400 w-12 text-right">{thcVal}%</span>
              <button onClick={async () => { setLoading(true); try { const r = await setThc({ thc: thcVal }); doMsg(`THC set to ${r.thc}%`); } catch (e: any) { doErr(e); } }}
                disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 disabled:opacity-50">Set</button>
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">Higher THC = higher price per gram. Max THC depends on your greenhouse tier.</div>
          </div>
        </div>
      )}

      {/* === MARKETING === */}
      {tab === "marketing" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-cyan-500/20">
            <div className="text-xs font-bold mb-2">📡 Marketing Budget</div>
            <div className="flex items-center gap-2">
              <input type="number" value={budgetVal} onChange={(e) => setBudgetVal(Number(e.target.value))} className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-1.5 text-xs" placeholder="Budget amount" />
              <button onClick={async () => { setLoading(true); try { await setBudget({ amount: budgetVal }); doMsg(`Budget set to $${budgetVal.toLocaleString()}`); } catch (e: any) { doErr(e); } }}
                disabled={loading} className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-[10px] font-bold hover:bg-cyan-700 disabled:opacity-50">Set Budget</button>
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">Marketing budget passively increases demand. Higher demand = higher prices.</div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-cyan-500/20">
            <div className="text-xs font-bold mb-2">🔍 Search & Marketing Channels</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {trade.marketingChannelsDef?.map((ch: any) => {
                const owned = trade.marketingChannels?.includes(ch.id);
                return (
                  <div key={ch.id} className={`rounded-lg p-3 border transition-all ${owned ? "border-cyan-500/30 bg-cyan-500/10" : "border-slate-700/30 bg-slate-800/30 hover:border-cyan-500/20"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[11px] font-bold">{ch.name}</div>
                      {owned && <span className="text-[9px] text-cyan-400 font-bold">✓ Owned</span>}
                    </div>
                    <div className="text-[9px] text-muted-foreground mb-1">{ch.desc}</div>
                    <div className="flex gap-3 text-[9px]">
                      <span className="text-cyan-400">+{(ch.searchBonus * 100).toFixed(0)}% search</span>
                      <span className="text-orange-400">+{ch.demandBoost} demand</span>
                    </div>
                    {!owned && (
                      <button onClick={async () => { setLoading(true); try { const r = await buyChannel({ channelId: ch.id }); doMsg(`Bought ${r.channel}!`); } catch (e: any) { doErr(e); } }}
                        disabled={loading} className="mt-1.5 w-full px-2 py-1 bg-cyan-600/80 text-white rounded text-[9px] font-bold hover:bg-cyan-600 disabled:opacity-50 transition">
                        💰 ${ch.cost.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* === CONTRACTS === */}
      {tab === "contracts" && (
        <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
          <div className="text-xs font-bold mb-2">📋 Bulk Contracts</div>
          <div className="text-[9px] text-muted-foreground mb-3">Accept bulk orders for 1.5× the normal price. Requires enough stock.</div>
          {(!trade.contracts || trade.contracts.length === 0) ? (
            <div className="text-center py-6 text-muted-foreground text-xs">No contracts available right now</div>
          ) : (
            <div className="space-y-2">
              {trade.contracts.map((contract: any) => (
                <div key={contract.offerId} className={`flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2 border ${contract.accepted ? "opacity-50" : "border-amber-500/20"}`}>
                  <div>
                    <div className="text-[11px] font-bold">{contract.name || "Bulk Order"}</div>
                    <div className="text-[9px] text-muted-foreground">{contract.quantity.toLocaleString()}g @ ${(trade.pricePerGram * 1.5).toFixed(0)}/g (1.5× bonus)</div>
                  </div>
                  {contract.accepted ? <span className="text-[9px] text-slate-500 font-bold">Accepted</span> : (
                    <button onClick={async () => { setLoading(true); try { const r = await acceptContract({ offerId: contract.offerId }); doMsg(`Contract accepted! +$${r.revenue.toLocaleString()}`); } catch (e: any) { doErr(e); } }}
                      disabled={loading} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 disabled:opacity-50">Accept</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === WORKERS === */}
      {tab === "workers" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold">🧑\u200D🌾 Workers (Auto-Harvest)</div>
              {trade.workers && trade.workers.length > 0 && (
                <button onClick={async () => { setLoading(true); try { const r = await autoHarvestMut(); doMsg(`Worker harvested ${r.harvested} plants — ${r.totalYield}g!`); } catch (e: any) { doErr(e); } }}
                  disabled={loading} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 disabled:opacity-50">⚡ Auto-Harvest</button>
              )}
            </div>
            {trade.workers && trade.workers.length > 0 && (
              <div className="space-y-1 mb-3">
                {trade.workers.map((w: any) => (
                  <div key={w.workerId} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-2 py-1.5 text-[10px]">
                    <span className="font-bold">{w.name}</span>
                    <span className="text-muted-foreground">{w.autoHarvests} harvests</span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {trade.workerDefs?.map((worker: any) => {
                const hired = trade.workers?.some((w: any) => w.workerId === worker.id);
                return (
                  <div key={worker.id} className={`bg-slate-800/30 rounded-lg p-3 border ${hired ? "border-emerald-500/30" : "border-slate-700/30 hover:border-emerald-500/20"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{worker.icon}</span>
                      <div>
                        <div className="text-[11px] font-bold">{worker.name}</div>
                        <div className="text-[9px] text-muted-foreground">{worker.desc}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-[9px] mb-1.5">
                      <span className="text-emerald-400">Speed: {worker.speed}×</span>
                      <span className="text-blue-400">Reliability: {(worker.reliability * 100).toFixed(0)}%</span>
                    </div>
                    {hired ? <div className="text-[9px] text-emerald-400 text-center font-bold">✓ Hired</div> : (
                      <button onClick={async () => { setLoading(true); try { const r = await hireWorkerMut({ workerId: worker.id }); doMsg(`Hired ${r.worker}!`); } catch (e: any) { doErr(e); } }}
                        disabled={loading} className="w-full px-2 py-1 bg-emerald-600/80 text-white rounded text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-50 transition">
                        💰 ${worker.cost.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

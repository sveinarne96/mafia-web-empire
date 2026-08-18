import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Flame, Eye, FileText, Package, Pill, Building, Link2,
  Crosshair, ShieldAlert, Receipt, DollarSign, Radio, Swords, Anchor,
  Loader2, CheckCircle, XCircle, Banknote, Skull, Target,
} from "lucide-react";

export function UndergroundEconomyPage() {
  const player = useQuery(api.game.getPlayer);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const [counterfeitQuality, setCounterfeitQuality] = useState<"low" | "medium" | "high">("low");
  const [smuggleCity, setSmuggleCity] = useState("Chicago");
  const [smuggleType, setSmuggleType] = useState("drugs");
  const [smuggleQty, setSmuggleQty] = useState(1);
  const [drugQty, setDrugQty] = useState(1);
  const [drugCity, setDrugCity] = useState("Chicago");
  const [arsonTarget, setArsonTarget] = useState("");
  const [armsQty, setArmsQty] = useState(1);
  const [armsAction, setArmsAction] = useState<"buy" | "sell">("buy");
  const [taxAmount, setTaxAmount] = useState(1000);
  const [racketBusiness, setRacketBusiness] = useState("Local Shop");
  const [denPool, setDenPool] = useState(1000);
  const [protTarget, setProtTarget] = useState("Downtown Store");
  const [protFee, setProtFee] = useState(500);
  const [boxingFee, setBoxingFee] = useState(500);
  const [launderAmt, setLaunderAmt] = useState(1000);

  if (!player) return <div className="flex items-center justify-center h-full"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  const show = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const withLoading = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try { await fn(); } catch (e: unknown) { show((e as Error).message, "error"); }
    setLoading(false);
  };

  const mutate = useMutation(api.underground.counterfeiting);
  const smuggleMut = useMutation(api.underground.runSmuggling);
  const drugMut = useMutation(api.underground.drugTrafficking);
  const arsonMut = useMutation(api.underground.commitArson);
  const cargoMut = useMutation(api.underground.commitCargoTheft);
  const armsMut = useMutation(api.underground.commitArmsDeal);
  const witnessMut = useMutation(api.underground.witnessIntimidation);
  const taxMut = useMutation(api.underground.commitTaxEvasion);
  const racketMut = useMutation(api.underground.runRacketeering);
  const denMut = useMutation(api.underground.runGamblingDen);
  const protMut = useMutation(api.underground.runProtectionRacket);
  const boxingMut = useMutation(api.underground.runIllegalBoxing);
  const launderMut = useMutation(api.underground.launderMoney);
  const pirateMut = useMutation(api.underground.runPirateRadio);

  const tabs = [
    { id: "overview", label: "Overview", icon: <Skull className="size-4" /> },
    { id: "counterfeit", label: "Counterfeiting", icon: <FileText className="size-4" /> },
    { id: "smuggle", label: "Smuggling", icon: <Package className="size-4" /> },
    { id: "drugs", label: "Drug Trafficking", icon: <Pill className="size-4" /> },
    { id: "arson", label: "Arson", icon: <Flame className="size-4" /> },
    { id: "identity", label: "Identity Theft", icon: <Eye className="size-4" /> },
    { id: "kidnap", label: "Kidnapping", icon: <Link2 className="size-4" /> },
    { id: "cargo", label: "Cargo Theft", icon: <Anchor className="size-4" /> },
    { id: "arms", label: "Arms Dealing", icon: <Crosshair className="size-4" /> },
    { id: "witness", label: "Witness Intimidation", icon: <ShieldAlert className="size-4" /> },
    { id: "tax", label: "Tax Evasion", icon: <Receipt className="size-4" /> },
    { id: "racket", label: "Racketeering", icon: <DollarSign className="size-4" /> },
    { id: "den", label: "Gambling Den", icon: <Banknote className="size-4" /> },
    { id: "protection", label: "Protection Racket", icon: <Target className="size-4" /> },
    { id: "loan", label: "Loan Sharking", icon: <DollarSign className="size-4" /> },
    { id: "radio", label: "Pirate Radio", icon: <Radio className="size-4" /> },
    { id: "boxing", label: "Illegal Boxing", icon: <Swords className="size-4" /> },
    { id: "launder", label: "Money Laundering", icon: <DollarSign className="size-4" /> },
  ];

  const crimeStats = [
    { label: "Counterfeit Skill", value: player.counterfeitSkill ?? 0, color: "text-blue-400" },
    { label: "Smuggling Runs", value: player.smugglingRuns ?? 0, color: "text-green-400" },
    { label: "Drug Deals", value: player.drugDeals ?? 0, color: "text-red-400" },
    { label: "Arsons", value: player.arsons ?? 0, color: "text-orange-400" },
    { label: "Identity Thefts", value: player.identityThefts ?? 0, color: "text-purple-400" },
    { label: "Kidnappings", value: player.kidnappings ?? 0, color: "text-yellow-400" },
    { label: "Cargo Thefts", value: player.cargoThefts ?? 0, color: "text-cyan-400" },
    { label: "Arms Deals", value: player.armsDeals ?? 0, color: "text-red-500" },
    { label: "Racketeering", value: player.racketeeringIncome ?? 0, color: "text-yellow-400" },
    { label: "Gambling Dens", value: player.gamblingDens ?? 0, color: "text-green-500" },
    { label: "Protection Rackets", value: player.protectionRackets ?? 0, color: "text-orange-500" },
    { label: "Boxing Events", value: player.illegalBoxingEvents ?? 0, color: "text-blue-500" },
    { label: "Dirty Money", value: player.dirtyMoney ?? 0, color: "text-red-400" },
    { label: "Laundered", value: player.totalLaundered ?? 0, color: "text-green-400" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Skull className="size-5 text-red-400" /> Underground Economy
      </h2>

      {msg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded border text-sm ${msg.type === "success" ? "bg-green-950/30 border-green-800/30 text-green-400" : "bg-red-950/30 border-red-800/30 text-red-400"}`}>
          {msg.type === "success" ? <CheckCircle className="size-4 inline mr-1" /> : <XCircle className="size-4 inline mr-1" />}
          {msg.text}
        </motion.div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your underground empire stats.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {crimeStats.map(s => (
                <div key={s.label} className="bg-muted/30 border border-border rounded p-2 text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{typeof s.value === "number" && s.label !== "Dirty Money" && s.label !== "Laundered" ? s.value : `$${(s.value as number).toLocaleString()}`}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "launder" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Money Laundering</h3>
            <p className="text-xs text-muted-foreground">Clean dirty money. 30% fee.</p>
            <div className="text-xs text-muted-foreground">Dirty money: <span className="text-red-400 font-bold">${(player.dirtyMoney ?? 0).toLocaleString()}</span></div>
            <div className="flex gap-2">
              <input type="number" value={launderAmt} onChange={e => setLaunderAmt(+e.target.value)} className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
              <button disabled={loading || (player.dirtyMoney ?? 0) < launderAmt} onClick={() => withLoading(async () => { const r = await launderMut({ amount: launderAmt }); show(`Cleaned $${r.cleanAmount.toLocaleString()} (fee: $${r.fee.toLocaleString()})`, "success"); })} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm font-semibold text-white">Launder</button>
            </div>
          </div>
        )}

        {activeTab === "counterfeit" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Counterfeiting</h3>
            <p className="text-xs text-muted-foreground">Produce fake currency. Higher quality = more profit but higher risk.</p>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map(q => (
                <button key={q} onClick={() => setCounterfeitQuality(q)} className={`p-3 rounded border text-center transition-colors ${counterfeitQuality === q ? "bg-primary/20 border-primary" : "bg-muted/30 border-border hover:border-primary/50"}`}>
                  <div className="text-sm font-semibold capitalize">{q}</div>
                  <div className="text-[10px] text-muted-foreground">Cost: ${{ low: 500, medium: 1500, high: 4000 }[q]}</div>
                  <div className="text-[10px] text-green-400">Earn: ${{ low: 800, medium: 3000, high: 8000 }[q]}</div>
                  <div className="text-[10px] text-red-400">Risk: {{ low: "5%", medium: "15%", high: "30%" }[q]}</div>
                </button>
              ))}
            </div>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await mutate({ quality: counterfeitQuality }); if (r.success) show(`Earned $${(r.earned ?? 0).toLocaleString()}`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Start Printing"}
            </button>
          </div>
        )}

        {activeTab === "smuggle" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Smuggling Runs</h3>
            <p className="text-xs text-muted-foreground">Transport contraband between cities.</p>
            <div className="grid grid-cols-2 gap-2">
              <select value={smuggleType} onChange={e => setSmuggleType(e.target.value)} className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground">
                <option value="drugs">Drugs ($200/unit)</option>
                <option value="weapons">Weapons ($500/unit)</option>
                <option value="electronics">Electronics ($150/unit)</option>
                <option value="luxury">Luxury Goods ($300/unit)</option>
              </select>
              <select value={smuggleCity} onChange={e => setSmuggleCity(e.target.value)} className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground">
                {["Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Qty:</span>
              <input type="number" min={1} max={10} value={smuggleQty} onChange={e => setSmuggleQty(+e.target.value)} className="w-20 bg-muted border border-border rounded px-2 py-1 text-sm text-foreground" />
            </div>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await smuggleMut({ destCity: smuggleCity, contrabandType: smuggleType, quantity: smuggleQty }); if (r.success) show(`Profit: $${(r.profit ?? 0).toLocaleString()}`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Run Smuggling"}
            </button>
          </div>
        )}

        {activeTab === "drugs" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Drug Trafficking</h3>
            <p className="text-xs text-muted-foreground">Buy low, sell high. High arrest risk.</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Quantity</label>
                <input type="number" min={1} value={drugQty} onChange={e => setDrugQty(+e.target.value)} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Destination</label>
                <select value={drugCity} onChange={e => setDrugCity(e.target.value)} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground">
                  {["Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await drugMut({ destCity: drugCity, quantity: drugQty }); if (r.success) show(`Profit: $${(r.profit ?? 0).toLocaleString()}`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Ship Drugs"}
            </button>
          </div>
        )}

        {activeTab === "arson" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Arson</h3>
            <p className="text-xs text-muted-foreground">Burn buildings for insurance fraud. Cost: $5,000. 25% arrest risk.</p>
            <input value={arsonTarget} onChange={e => setArsonTarget(e.target.value)} placeholder="Building name" className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
            <button disabled={loading || !arsonTarget} onClick={() => withLoading(async () => { const r = await arsonMut({ targetName: arsonTarget }); if (r.success) show(`Payout: $${(r.insurancePayout ?? 0).toLocaleString()}`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "🔥 Commit Arson"}
            </button>
          </div>
        )}

        {activeTab === "identity" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Identity Theft</h3>
            <p className="text-xs text-muted-foreground">Steal a player&apos;s identity to access their bank.</p>
            <button disabled={loading} onClick={() => show("Use the Kill page to select a target first.", "error")} className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-sm font-semibold text-white">Identity Theft</button>
          </div>
        )}

        {activeTab === "kidnap" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Kidnapping</h3>
            <p className="text-xs text-muted-foreground">Hold players for ransom. 20% arrest risk.</p>
            <button disabled={loading} onClick={() => show("Select a target from the Kill page.", "error")} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded text-sm font-semibold text-white">Kidnap Player</button>
          </div>
        )}

        {activeTab === "cargo" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Cargo Theft</h3>
            <p className="text-xs text-muted-foreground">Hijack shipments at the docks. 20% arrest risk.</p>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await cargoMut({}); if (r.success) show(`Profit: $${(r.profit ?? 0).toLocaleString()}`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "🏴‍☠️ Steal Cargo"}
            </button>
          </div>
        )}

        {activeTab === "arms" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Arms Dealing</h3>
            <p className="text-xs text-muted-foreground">Buy weapons (+2 ATK each for $800) or sell for profit ($1,200 each).</p>
            <div className="flex gap-2">
              <button onClick={() => setArmsAction("buy")} className={`flex-1 py-2 rounded text-sm font-semibold ${armsAction === "buy" ? "bg-blue-600 text-white" : "bg-muted/50 text-muted-foreground"}`}>Buy ($800/unit)</button>
              <button onClick={() => setArmsAction("sell")} className={`flex-1 py-2 rounded text-sm font-semibold ${armsAction === "sell" ? "bg-green-600 text-white" : "bg-muted/50 text-muted-foreground"}`}>Sell ($1,200/unit)</button>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Qty:</span>
              <input type="number" min={1} max={10} value={armsQty} onChange={e => setArmsQty(+e.target.value)} className="w-20 bg-muted border border-border rounded px-2 py-1 text-sm text-foreground" />
            </div>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await armsMut({ action: armsAction, quantity: armsQty }); show(r.message ?? "Done", r.success ? "success" : "error"); })} className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : armsAction === "buy" ? "Buy Weapons" : "Sell Weapons"}
            </button>
          </div>
        )}

        {activeTab === "witness" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Witness Intimidation</h3>
            <p className="text-xs text-muted-foreground">Reduce wanted level. 60% success rate.</p>
            <button disabled={loading || (player.wantedLevel ?? 0) <= 0} onClick={() => withLoading(async () => { const r = await witnessMut({}); show(r.message ?? "Done", r.success ? "success" : "error"); })} className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Intimidate Witnesses"}
            </button>
          </div>
        )}

        {activeTab === "tax" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tax Evasion</h3>
            <p className="text-xs text-muted-foreground">Hide income. 30% savings but risk of audit.</p>
            <div className="flex gap-2">
              <input type="number" min={100} step={100} value={taxAmount} onChange={e => setTaxAmount(+e.target.value)} className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
              <button disabled={loading} onClick={() => withLoading(async () => { const r = await taxMut({ amount: taxAmount }); show(r.success ? `Saved $${(r.saved ?? 0).toLocaleString()}` : r.message ?? "Failed", r.success ? "success" : "error"); })} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Evade"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "racket" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Racketeering</h3>
            <p className="text-xs text-muted-foreground">Extort businesses. 15% arrest risk.</p>
            <input value={racketBusiness} onChange={e => setRacketBusiness(e.target.value)} placeholder="Business name" className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
            <button disabled={loading || !racketBusiness} onClick={() => withLoading(async () => { const r = await racketMut({ targetBusiness: racketBusiness }); if (r.success) show(`Collected $${(r.protectionPay ?? 0).toLocaleString()}!`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Extort Business"}
            </button>
          </div>
        )}

        {activeTab === "den" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Gambling Den</h3>
            <p className="text-xs text-muted-foreground">Run an underground casino. 10% raid risk.</p>
            <div className="flex gap-2">
              <input type="number" min={100} step={100} value={denPool} onChange={e => setDenPool(+e.target.value)} className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
              <button disabled={loading} onClick={() => withLoading(async () => { const r = await denMut({ betPool: denPool }); if (r.success) show(`Revenue: $${(r.revenue ?? 0).toLocaleString()}!`, "success"); else show(r.message ?? "Failed", "error"); })} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Open Den"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "protection" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Protection Racket</h3>
            <p className="text-xs text-muted-foreground">Force businesses to pay weekly fees. 12% arrest risk.</p>
            <input value={protTarget} onChange={e => setProtTarget(e.target.value)} placeholder="Target business" className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Weekly fee: $</span>
              <input type="number" min={100} step={100} value={protFee} onChange={e => setProtFee(+e.target.value)} className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
            </div>
            <button disabled={loading || !protTarget} onClick={() => withLoading(async () => { const r = await protMut({ targetName: protTarget, weeklyFee: protFee }); if (r.success) show(`Collected $${(r.collected ?? 0).toLocaleString()}!`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Collect Protection Fee"}
            </button>
          </div>
        )}

        {activeTab === "loan" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Loan Sharking</h3>
            <p className="text-xs text-muted-foreground">Lend money at 30% interest. Visit the Loans page.</p>
          </div>
        )}

        {activeTab === "radio" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Pirate Radio</h3>
            <p className="text-xs text-muted-foreground">Broadcast propaganda to boost reputation. 10% shutdown risk.</p>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await pirateMut({}); if (r.success) show(`Reputation +${r.reputationBoost ?? 0}!`, "success"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "📻 Start Broadcast"}
            </button>
          </div>
        )}

        {activeTab === "boxing" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Illegal Boxing</h3>
            <p className="text-xs text-muted-foreground">Host underground fights. Win = 3x entry fee. 8% raid risk.</p>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Entry fee: $</span>
              <input type="number" min={100} step={100} value={boxingFee} onChange={e => setBoxingFee(+e.target.value)} className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
            </div>
            <button disabled={loading} onClick={() => withLoading(async () => { const r = await boxingMut({ entryFee: boxingFee }); if (r.won) show(`Won! Prize: $${(r.prize ?? 0).toLocaleString()}`, "success"); else if (r.success) show(`Lost. Took ${r.damage ?? 0} damage.`, "error"); else show(r.message ?? "Failed", "error"); })} className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded text-sm font-semibold text-white">
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "🥊 Start Fight"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

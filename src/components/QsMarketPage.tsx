import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

const OFFER_ICONS: Record<string, string> = {
  cannabis: "🌿", cocaine: "❄️", meth: "🧪", mdma: "💊", heroin: "💉",
};
const RARITY_STYLE: Record<string, { border: string; text: string; glow: string; label: string }> = {
  common: { border: "border-slate-500/30", text: "text-slate-300", glow: "rgba(148,163,184,0.25)", label: "COMMON" },
  rare: { border: "border-cyan-400/40", text: "text-cyan-300", glow: "rgba(34,211,238,0.45)", label: "RARE" },
  epic: { border: "border-fuchsia-400/50", text: "text-fuchsia-300", glow: "rgba(232,121,249,0.55)", label: "EPIC" },
  legendary: { border: "border-amber-400/60", text: "text-amber-300", glow: "rgba(251,191,36,0.65)", label: "LEGENDARY" },
  mythic: { border: "border-rose-400/60", text: "text-rose-300", glow: "rgba(251,113,133,0.7)", label: "MYTHIC" },
};
const TYPE_META: Record<string, { label: string; icon: string; chip: string }> = {
  drug: { label: "Drug Deal", icon: "💊", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40" },
  car: { label: "Vehicle", icon: "🚗", chip: "bg-sky-500/15 text-sky-300 border-sky-400/40" },
  item: { label: "Gear", icon: "⚔️", chip: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/40" },
  pack: { label: "Pack", icon: "📦", chip: "bg-amber-500/15 text-amber-300 border-amber-400/40" },
  bullets: { label: "Ammo", icon: "🔫", chip: "bg-orange-500/15 text-orange-300 border-orange-400/40" },
  bodyguard: { label: "Crew", icon: "🛡️", chip: "bg-violet-500/15 text-violet-300 border-violet-400/40" },
  service: { label: "Service", icon: "🧰", chip: "bg-teal-500/15 text-teal-300 border-teal-400/40" },
  mystery: { label: "Mystery", icon: "❓", chip: "bg-pink-500/15 text-pink-300 border-pink-400/40" },
};

function NeonPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-cyan-400/25 bg-[#0a0a14]/80 backdrop-blur-md ${className}`}
      style={{ boxShadow: "0 0 24px rgba(34,211,238,0.12), inset 0 0 32px rgba(168,85,247,0.06)" }}>
      {children}
    </div>
  );
}

function OfferCard({ offer, coins, cash, onBuy, busy }: {
  offer: any; coins: number; cash: number; onBuy: (currency: "coins" | "cash") => void; busy: boolean;
}) {
  const typeMeta = TYPE_META[offer.type] ?? TYPE_META.item;
  const rarity = RARITY_STYLE[offer.rarity] ?? RARITY_STYLE.common;
  const icon = OFFER_ICONS[offer.drug] ?? (offer.type === "car" ? "🚗" : offer.type === "pack" ? "📦" : offer.type === "bullets" ? "🔫" : offer.type === "bodyguard" ? "🛡️" : offer.type === "mystery" ? "🎁" : "⚔️");
  const canCoins = coins >= offer.price;
  const canCash = cash >= offer.price;
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.015 }}
      className={`relative overflow-hidden rounded-2xl border-2 ${rarity.border} bg-gradient-to-br from-[#0d0d1a] to-[#120a1f] p-4`}
      style={{ boxShadow: `0 0 18px ${rarity.glow}, inset 0 0 24px rgba(0,0,0,0.5)` }}
    >
      <div className="absolute -top-10 -right-10 size-28 rounded-full opacity-20 blur-2xl" style={{ background: rarity.glow }} />
      <div className="relative flex items-start gap-3">
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }} className="text-4xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          {icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${typeMeta.chip}`}>{typeMeta.icon} {typeMeta.label}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest ${rarity.text} animate-pulse`}>{rarity.label}</span>
          </div>
          <div className="text-sm font-black text-white truncate tracking-wide">{offer.name || offer.drug || "Mystery Crate"}</div>
          <div className="text-[10px] text-cyan-200/60 mt-0.5">
            {offer.type === "drug" && `${offer.quantity.toLocaleString()}g${offer.thcContent > 0 ? ` · THC ${offer.thcContent}%` : ""}`}
            {offer.type === "car" && "Streets-ready · armored options"}
            {offer.type === "item" && "Combat gear · equip instantly"}
            {offer.type === "pack" && `${offer.quantity}× ${offer.rarity} pack${offer.quantity > 1 ? "s" : ""}`}
            {offer.type === "bullets" && `${offer.quantity.toLocaleString()} bullets`}
            {offer.type === "bodyguard" && `${offer.quantity} guard${offer.quantity > 1 ? "s" : ""} on payroll`}
            {offer.type === "mystery" && "Contents revealed on purchase"}
            {offer.type === "service" && "Instant activation"}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-amber-300/70 font-bold uppercase">Price</span>
              <span className="text-lg font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">{offer.price.toLocaleString()}</span>
              <span className="text-[10px] text-amber-400/70 font-bold">🪙 IG</span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => onBuy("coins")} disabled={busy || !canCoins}
                title={canCoins ? "Pay with IG coins" : `Need ${offer.price.toLocaleString()} IG coins`}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                🪙 {canCoins ? "Buy" : "Low"}
              </button>
              <button onClick={() => onBuy("cash")} disabled={busy || !canCash}
                title={canCash ? "Pay with cash" : `Need $${offer.price.toLocaleString()} cash`}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-400 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                $ {canCash ? "Buy" : "Low"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function QsMarketPage() {
  const player = useQuery(api.game.getPlayer);
  const offers = useQuery(api.drugSystem.getQsOffers);
  const generateOffers = useMutation(api.drugSystem.generateQsOffers);
  const acceptOffer = useMutation(api.drugSystem.acceptQsOffer);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [nextRefresh, setNextRefresh] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "rarity">("rarity");

  const coins = (player as any)?.coins ?? 0;
  const cash = player?.money ?? 0;
  const level = player?.level ?? 1;

  useEffect(() => { if (offers && offers.offers.length === 0) generateOffers({}).catch(() => {}); }, [offers, generateOffers]);
  useEffect(() => {
    const update = () => { const now = new Date(); const mid = new Date(now); mid.setHours(24, 0, 0, 0); const d = mid.getTime() - now.getTime(); setNextRefresh(`${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m ${Math.floor((d % 60000) / 1000)}s`); };
    update(); const iv = setInterval(update, 1000); return () => clearInterval(iv);
  }, []);

  const activeOffers = useMemo(() => (offers?.offers ?? []).filter((o: any) => !o.accepted && o.expiresAt > Date.now()), [offers]);
  const acceptedOffers = (offers?.offers ?? []).filter((o: any) => o.accepted);
  const typeCounts: Record<string, number> = {};
  activeOffers.forEach((o: any) => { typeCounts[o.type] = (typeCounts[o.type] ?? 0) + 1; });

  const filtered = useMemo(() => {
    let list = filter === "all" ? [...activeOffers] : activeOffers.filter((o: any) => o.type === filter);
    const rank: Record<string, number> = { mythic: 4, legendary: 3, epic: 2, rare: 1, common: 0 };
    if (sort === "price_asc") list.sort((a: any, b: any) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a: any, b: any) => b.price - a.price);
    else list.sort((a: any, b: any) => (rank[b.rarity] ?? 0) - (rank[a.rarity] ?? 0) || b.price - a.price);
    return list;
  }, [activeOffers, filter, sort]);

  const doBuy = async (offerId: string, currency: "coins" | "cash") => {
    setBusy(true); setMsg(null);
    try {
      const r: any = await acceptOffer({ offerId, currency });
      setMsg({ text: `✅ Purchased ${r.name ?? "item"} for ${r.cost?.toLocaleString()} ${r.paidWith === "coins" ? "🪙 IG coins" : "$ cash"}!`, good: true });
    } catch (e: any) { setMsg({ text: e.message, good: false }); }
    setBusy(false);
  };

  if (player === undefined || offers === undefined) {
    return (
      <div className="py-16 text-center">
        <div className="text-4xl animate-bounce mb-3">🏪</div>
        <div className="animate-pulse text-cyan-300/70 text-sm font-bold tracking-widest uppercase">Loading Q's Market…</div>
      </div>
    );
  }
  if (!player) return <div className="py-10 text-center text-muted-foreground">Sign in to access Q's Market.</div>;

  const FILTERS = [
    { id: "all", label: "All", icon: "✨" }, { id: "drug", label: "Drugs", icon: "💊" },
    { id: "car", label: "Cars", icon: "🚗" }, { id: "item", label: "Gear", icon: "⚔️" },
    { id: "pack", label: "Packs", icon: "📦" }, { id: "bullets", label: "Ammo", icon: "🔫" },
    { id: "bodyguard", label: "Crew", icon: "🛡️" }, { id: "service", label: "Service", icon: "🧰" },
    { id: "mystery", label: "Mystery", icon: "❓" },
  ];

  return (
    <div className="animate-fade-in space-y-4 relative">
      {/* Ambient neon background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 size-96 rounded-full bg-fuchsia-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/4 size-96 rounded-full bg-amber-500/8 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <div className="relative text-center py-6">
        <motion.h2
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tight"
          style={{ textShadow: "0 0 12px rgba(34,211,238,0.8), 0 0 32px rgba(232,121,249,0.5), 0 0 60px rgba(251,191,36,0.3)" }}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">Q'S MARKET</span>
        </motion.h2>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }}
          className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300/70 mt-1">
          ⚡ The Underground Black Bazaar ⚡
        </motion.div>
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
            className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-sm font-black shadow-[0_0_16px_rgba(251,191,36,0.3)]">
            🪙 {coins.toLocaleString()} IG Coins
          </motion.div>
          <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-sm font-bold">
            ${cash.toLocaleString()}
          </div>
          <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold">
            Lv.{level} · {activeOffers.length} live offers
          </div>
          <div className="px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-300 text-[10px] font-bold">
            🔄 {nextRefresh}
          </div>
        </div>
      </div>

      {/* Daily banner */}
      <NeonPanel className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-2xl">📦</motion.span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm font-black text-cyan-300 tracking-wide">Q has new offers for you every day.</div>
            <div className="text-[10px] text-cyan-100/50 mt-0.5">Fresh stock drops at midnight — drugs, vehicles, gear, packs, ammo, muscle and mystery crates. Prices in IG coins, cash always accepted.</div>
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/30">
            Rerolls at 00:00
          </div>
        </div>
      </NeonPanel>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
              filter === f.id
                ? "bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 border-cyan-400/60 text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]"
                : "bg-[#0a0a14]/60 border-slate-700/40 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/30"
            }`}>
            {f.icon} {f.label}{f.id !== "all" ? ` (${typeCounts[f.id] ?? 0})` : ""}
          </button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="ml-auto px-2 py-1.5 rounded-lg text-[10px] font-bold bg-[#0a0a14]/80 border border-fuchsia-400/30 text-fuchsia-300 focus:outline-none">
          <option value="rarity">⭐ Sort: Rarity</option>
          <option value="price_asc">⬇️ Sort: Cheapest</option>
          <option value="price_desc">⬆️ Sort: Priciest</option>
        </select>
      </div>

      {/* Message toast */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold text-center border ${
              msg.good ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" : "bg-rose-500/15 border-rose-400/40 text-rose-300"
            }`}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers grid */}
      {filtered.length === 0 ? (
        <NeonPanel className="p-10 text-center">
          <div className="text-5xl mb-3 animate-float">💤</div>
          <div className="text-sm font-black text-cyan-300">Shelves are empty</div>
          <div className="text-[10px] text-cyan-100/40 mt-1">Q restocks at midnight — check back then!</div>
        </NeonPanel>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((offer: any) => (
              <OfferCard key={offer.offerId} offer={offer} coins={coins} cash={cash} busy={busy} onBuy={(cur) => doBuy(offer.offerId, cur)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Purchases */}
      {acceptedOffers.length > 0 && (
        <NeonPanel className="p-4">
          <div className="text-xs font-black text-cyan-300 uppercase tracking-widest mb-2">🧾 Today's purchases ({acceptedOffers.length})</div>
          <div className="space-y-1">
            {acceptedOffers.map((o: any) => (
              <div key={o.offerId} className="flex items-center justify-between text-[10px] py-1 border-b border-cyan-400/5 last:border-0">
                <span className="text-slate-300">{OFFER_ICONS[o.drug] ?? "📦"} {o.name ?? o.drug} ×{o.quantity.toLocaleString()}</span>
                <span className="text-amber-300 font-bold">{o.price.toLocaleString()} 🪙</span>
              </div>
            ))}
          </div>
        </NeonPanel>
      )}
    </div>
  );
}

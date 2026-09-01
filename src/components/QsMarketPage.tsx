import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const OFFER_ICONS: Record<string, string> = {
  cannabis: "🌿", cocaine: "❄️", meth: "🧪", mdma: "💊", heroin: "💉",
};
const RARITY_BORDER: Record<string, string> = {
  common: "border-slate-600/30 bg-slate-900/30", rare: "border-blue-500/30 bg-blue-950/20", epic: "border-purple-500/30 bg-purple-950/20", legendary: "border-amber-500/30 bg-amber-950/20",
};
const RARITY_TEXT: Record<string, string> = {
  common: "text-slate-400", rare: "text-blue-400", epic: "text-purple-400", legendary: "text-amber-400",
};
const TYPE_BADGES: Record<string, { label: string; icon: string; color: string }> = {
  drug: { label: "Drug Deal", icon: "💊", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  car: { label: "Vehicle", icon: "🚗", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  item: { label: "Gear", icon: "⚔️", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  pack: { label: "Pack", icon: "📦", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

function OfferCard({ offer, onAccept, loading }: { offer: any; onAccept: () => void; loading: boolean }) {
  const badge = TYPE_BADGES[offer.type] ?? TYPE_BADGES.drug;
  const rarityBorder = RARITY_BORDER[offer.rarity] ?? "border-slate-600/30 bg-slate-900/30";
  const rarityText = RARITY_TEXT[offer.rarity] ?? "text-slate-400";
  const icon = OFFER_ICONS[offer.drug] ?? (offer.type === "car" ? "🚗" : offer.type === "pack" ? "📦" : "⚔️");
  return (
    <div className={`rounded-xl p-4 border ${rarityBorder} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <div className="text-3xl mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.icon} {badge.label}</span>
            {offer.rarity !== "common" && <span className={`text-[9px] font-bold uppercase ${rarityText}`}>{offer.rarity}</span>}
          </div>
          <div className="text-sm font-bold text-white truncate">{offer.name || offer.drug}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {offer.type === "drug" && `${offer.quantity.toLocaleString()}g${offer.thcContent > 0 ? ` · THC ${offer.thcContent}%` : ""}`}
            {offer.type === "car" && "Speed · Storage · Armored available"}
            {offer.type === "item" && "Attack · Defense gear"}
            {offer.type === "pack" && `${offer.quantity}x ${offer.rarity} pack${offer.quantity > 1 ? "s" : ""}`}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm font-black text-green-400">${offer.price.toLocaleString()}</div>
            <button onClick={onAccept} disabled={loading}
              className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QsMarketPage() {
  const offers = useQuery(api.drugSystem.getQsOffers);
  const generateOffers = useMutation(api.drugSystem.generateQsOffers);
  const acceptOffer = useMutation(api.drugSystem.acceptQsOffer);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [nextRefresh, setNextRefresh] = useState("");

  useEffect(() => { if (offers && offers.offers.length === 0) generateOffers({}).catch(() => {}); }, [offers]);
  useEffect(() => {
    const update = () => { const now = new Date(); const mid = new Date(now); mid.setHours(24, 0, 0, 0); const d = mid.getTime() - now.getTime(); setNextRefresh(`${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m ${Math.floor((d % 60000) / 1000)}s`); };
    update(); const iv = setInterval(update, 1000); return () => clearInterval(iv);
  }, []);

  if (offers === undefined) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading Q's Market...</div>;
  if (!offers) return <div className="py-10 text-center text-muted-foreground">Sign in to access Q's Market.</div>;

  const activeOffers = offers.offers.filter((o) => !o.accepted && o.expiresAt > Date.now());
  const acceptedOffers = offers.offers.filter((o) => o.accepted);
  const filtered = filter === "all" ? activeOffers : activeOffers.filter((o) => o.type === filter);
  const typeCounts: Record<string, number> = {};
  activeOffers.forEach((o) => { typeCounts[o.type] = (typeCounts[o.type] ?? 0) + 1; });

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3"><span className="text-3xl">🏪</span><h2 className="text-2xl font-bold">Q's Market</h2></div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-slate-900/50 border border-slate-700/30 text-[10px]">
            <span className="text-muted-foreground">Offers: </span><span className="text-white font-bold">{activeOffers.length}</span>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground">Refreshes in</div>
            <div className="text-xs font-bold text-amber-400">🔄 {nextRefresh}</div>
          </div>
        </div>
      </div>

      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="text-sm font-bold text-amber-300 mb-1">📦 Q has new offers for you every day.</div>
        <div className="text-[10px] text-muted-foreground">Deals refresh at midnight. Higher level = better deals on rarer vehicles, gear, packs, and drugs.</div>
      </div>

      <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1 flex-wrap">
        {(["all", "drug", "car", "item", "pack"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-[10px] font-semibold rounded-md capitalize transition-all ${filter === f ? "bg-green-600 text-white" : "text-muted-foreground hover:text-white"}`}>
            {f === "all" ? `All (${activeOffers.length})` : f === "drug" ? `💊 Drugs (${typeCounts[f] ?? 0})` : f === "car" ? `🚗 Cars (${typeCounts[f] ?? 0})` : f === "item" ? `⚔️ Gear (${typeCounts[f] ?? 0})` : `📦 Packs (${typeCounts[f] ?? 0})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center border border-slate-700/30">
          <div className="text-3xl mb-2">💤</div>
          <div className="text-sm font-bold">No offers right now</div>
          <div className="text-[10px] text-muted-foreground mt-1">Come back after midnight!</div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((offer) => (
            <OfferCard key={offer.offerId} offer={offer} loading={loading} onAccept={async () => {
              setLoading(true); setMsg("");
              try { await acceptOffer({ offerId: offer.offerId }); setMsg("✅ Purchased!"); } catch (e: any) { setMsg(e.message); }
              setLoading(false);
            }} />
          ))}
        </div>
      )}

      {acceptedOffers.length > 0 && (
        <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
          <div className="text-sm font-bold mb-2">✅ Today's Purchases ({acceptedOffers.length})</div>
          <div className="space-y-1">
            {acceptedOffers.map((o) => (
              <div key={o.offerId} className="flex items-center justify-between text-[10px] py-1">
                <span>{OFFER_ICONS[o.drug] ?? "📦"} {o.drug} ×{o.quantity}</span>
                <span className="text-green-400 font-bold">${o.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {msg && <div className="text-xs text-primary text-center mt-2">{msg}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DRUG_NAMES: Record<string, { name: string; icon: string }> = {
  cannabis: { name: "Cannabis", icon: "🌿" },
  cocaine: { name: "Cocaine", icon: "❄️" },
  meth: { name: "Methamphetamine", icon: "🧪" },
  mdma: { name: "MDMA", icon: "💊" },
  heroin: { name: "Heroin", icon: "💉" },
};

export function QsMarketPage() {
  const offers = useQuery(api.drugSystem.getQsOffers);
  const generateOffers = useMutation(api.drugSystem.generateQsOffers);
  const acceptOffer = useMutation(api.drugSystem.acceptQsOffer);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextRefresh, setNextRefresh] = useState("");

  // Generate offers if none exist today
  useEffect(() => {
    if (offers && offers.offers.length === 0) {
      generateOffers({}).catch(() => {});
    }
  }, [offers]);

  // Countdown to midnight
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setNextRefresh(`${h}h ${m}m ${s}s`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  if (offers === undefined) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading Q's Market...</div>;
  if (!offers) return <div className="py-10 text-center text-muted-foreground">Sign in to access Q's Market.</div>;

  const activeOffers = offers.offers.filter((o) => !o.accepted && o.expiresAt > Date.now());

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-3xl">🏪</span><h2 className="text-2xl font-bold">Q's Market</h2></div>
        <div className="text-right">
          <div className="text-[9px] text-muted-foreground">Next refresh</div>
          <div className="text-xs font-bold text-amber-400">🔄 {nextRefresh}</div>
        </div>
      </div>

      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📦</span>
          <div className="text-sm font-bold text-amber-300">Q has new offers for you every day.</div>
        </div>
        <div className="text-[10px] text-muted-foreground">Accept deals to stock your drug trade. Offers refresh at midnight. Each deal includes a discount compared to market price.</div>
      </div>

      {activeOffers.length === 0 ? (
        <div className="mafia-card rounded-xl p-6 text-center border border-slate-700/30">
          <div className="text-3xl mb-2">💤</div>
          <div className="text-sm font-bold">No offers right now</div>
          <div className="text-[10px] text-muted-foreground mt-1">Come back after midnight for new deals!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {activeOffers.map((offer) => {
            const drug = DRUG_NAMES[offer.drug] ?? { name: offer.drug, icon: "💊" };
            const savings = Math.floor(offer.price * 0.3);
            const typeLabel = offer.type === "contract" ? "📋 Bulk Contract" : "🛒 Quick Buy";
            const typeColor = offer.type === "contract" ? "border-purple-500/30 bg-purple-950/20" : "border-green-500/30 bg-green-950/20";
            return (
              <div key={offer.offerId} className={`mafia-card rounded-xl p-4 border ${typeColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{drug.icon}</span>
                      <div>
                        <div className="text-sm font-bold">{drug.name} — {offer.quantity.toLocaleString()}g</div>
                        <div className="text-[10px] text-muted-foreground">{typeLabel}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                      <div className="bg-slate-900/30 rounded-lg p-1.5 text-center">
                        <div className="text-muted-foreground">Price</div>
                        <div className="font-bold text-yellow-400">${offer.price.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-900/30 rounded-lg p-1.5 text-center">
                        <div className="text-muted-foreground">Per gram</div>
                        <div className="font-bold text-green-400">${Math.ceil(offer.price / offer.quantity)}/g</div>
                      </div>
                      <div className="bg-slate-900/30 rounded-lg p-1.5 text-center">
                        <div className="text-muted-foreground">You save</div>
                        <div className="font-bold text-cyan-400">${savings.toLocaleString()}</div>
                      </div>
                    </div>
                    {offer.thcContent > 0 && <div className="text-[9px] text-blue-400 mt-1">THC: {offer.thcContent}%</div>}
                  </div>
                  <button onClick={async () => { setLoading(true); setMsg(""); try { const r = await acceptOffer({ offerId: offer.offerId }); setMsg(`Accepted ${r.quantity.toLocaleString()}g of ${r.drug} for $${r.cost.toLocaleString()}`); } catch (e: any) { setMsg(e.message); } setLoading(false); }}
                    disabled={loading} className="ml-3 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-50 shrink-0">
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      {offers.offers.some((o) => o.accepted) && (
        <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
          <div className="text-sm font-bold mb-2">✅ Today's Accepted</div>
          <div className="space-y-1">
            {offers.offers.filter((o) => o.accepted).map((o) => {
              const drug = DRUG_NAMES[o.drug] ?? { name: o.drug, icon: "💊" };
              return (
                <div key={o.offerId} className="flex items-center justify-between text-[10px] py-1">
                  <span>{drug.icon} {o.quantity.toLocaleString()}g of {drug.name}</span>
                  <span className="text-green-400 font-bold">${o.price.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {msg && <div className="text-xs text-primary text-center mt-2">{msg}</div>}
    </div>
  );
}

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrendingUp, ShieldQuestion, X, Check, Package, Banknote, Coins } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

type Tab = "points" | "cash" | "items" | "properties";

export function QuickTradePage() {
  const player = useQuery(api.game.getPlayer);
  const offers = useQuery(api.quicktrade.getOffers, { kind: "points" });
  const cashOffers = useQuery(api.quicktrade.getOffers, { kind: "cash" });
  const myOffers = useQuery(api.quicktrade.getMyOffers);
  const stats = useQuery(api.quicktrade.getMyQuicktradeStats);
  const createOffer = useMutation(api.quicktrade.createOffer);
  const cancelOffer = useMutation(api.quicktrade.cancelOffer);
  const buyOffer = useMutation(api.quicktrade.buyOffer);

  const [tab, setTab] = useState<Tab>("points");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("5000000");
  const [hide, setHide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmBuy, setConfirmBuy] = useState<string | null>(null);

  const myPoints = player?.points ?? 0;
  const myMoney = player?.money ?? 0;

  const tabList: { id: Tab; label: string; icon: string; hint: string }[] = [
    { id: "points", label: "Points", icon: "🏆", hint: "Sell or buy game points for cash" },
    { id: "cash", label: "Cash", icon: "💰", hint: "Sell or buy cash for points" },
    { id: "items", label: "Items", icon: "🎒", hint: "Player-to-player item trading" },
    { id: "properties", label: "Properties", icon: "🏘️", hint: "Property trading desks" },
  ];

  const unitLabel = tab === "points" ? "Cash per point" : "Points per $1";
  const unitSymbol = tab === "points" ? "$" : "";
  const amountLabel = tab === "points" ? "Points to sell" : "Cash to sell ($)";

  const identicalCount = useMemo(() => {
    if (!myOffers) return 0;
    const amt = Number(amount) || 0;
    const up = Number(unit) || 0;
    return myOffers.filter((o: any) => o.kind === tab && o.amount === amt && o.unitPrice === up).length;
  }, [myOffers, amount, unit, tab]);

  const doCreate = async () => {
    setMsg(null);
    const amt = Math.floor(Number(amount) || 0);
    const up = Math.floor(Number(unit) || 0);
    if (amt <= 0 || up <= 0) { setMsg({ ok: false, text: "Enter a valid amount and price." }); return; }
    setBusy(true);
    try {
      const res = await createOffer({ kind: tab === "cash" ? "cash" : "points", amount: amt, unitPrice: up, anonymous: hide });
      const kindName = res.kind === "points" ? "points" : "cash";
      setMsg({ ok: true, text: `Listing live: ${nf(res.amount)} ${kindName} for ${nf(res.total)} ${res.kind === "points" ? "cash" : "points"} (escrow held).` });
      setAmount(""); setUnit(tab === "points" ? "5000000" : "1");
    } catch (e: any) {
      setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Failed to list offer" });
    }
    setBusy(false);
  };

  const doCancel = async (id: any) => {
    setMsg(null); setBusy(true);
    try {
      await cancelOffer({ offerId: id });
      setMsg({ ok: true, text: "Listing cancelled — escrow returned." });
    } catch (e: any) { setMsg({ ok: false, text: e?.data?.message ?? "Cancel failed" }); }
    setBusy(false);
  };

  const doBuy = async (id: any) => {
    setMsg(null); setBusy(true);
    try {
      const res = await buyOffer({ offerId: id });
      setMsg({ ok: true, text: `Trade complete — received ${nf(res.received)} ${res.kind}.` });
      setConfirmBuy(null);
    } catch (e: any) { setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Purchase failed" }); }
    setBusy(false);
  };

  const rows = (tab === "points" ? offers : tab === "cash" ? cashOffers : undefined) as any[] | undefined;

  if (!player) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Loading trade desk…</div>;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 p-5">
        <div className="absolute -right-10 -top-10 text-[120px] opacity-10 select-none">💱</div>
        <h1 className="text-2xl font-black tracking-widest text-amber-300">QUICKTRADE</h1>
        <p className="mt-1 text-xs text-slate-400 max-w-xl">
          The underground exchange. List points or cash at your price — the trade desk holds your
          offer in escrow until a buyer matches it. No face-to-face, no refunds, no questions.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-300">🏆 {nf(myPoints)} points</span>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-300">💰 ${nf(myMoney)} cash</span>
          {stats && (
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-300">
              <TrendingUp className="mr-1 inline size-3" />{nf(stats.totalSold)} sold · {nf(stats.totalBought)} bought
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tabList.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setMsg(null); setConfirmBuy(null); }}
            className={`rounded-xl border p-3 text-left transition-all ${tab === t.id ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700/50 bg-slate-900/40 hover:border-slate-500/60"}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <div className={`text-sm font-black ${tab === t.id ? "text-amber-300" : "text-slate-200"}`}>{t.label}</div>
                <div className="text-[9px] text-slate-500">{t.hint}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Market / sell columns */}
      {(tab === "points" || tab === "cash") ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Buy offers */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2">
              <Banknote className="size-4 text-green-400" />
              <h2 className="text-sm font-black text-green-300 tracking-wide">
                {tab === "points" ? "Buy Points Offers" : "Buy Cash Offers"}
              </h2>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              View and buy {tab} from other players. Offers are escrowed — the seller cannot run.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700/60 text-[9px] uppercase tracking-wider text-slate-500">
                    <th className="pb-2 pr-2">Seller</th>
                    <th className="pb-2 pr-2">{tab === "points" ? "Points" : "Cash"}</th>
                    <th className="pb-2 pr-2">Cost</th>
                    <th className="pb-2 pr-2">Per unit</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {!rows || rows.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-[11px] text-slate-600">No active {tab} offers — be the first to list one.</td></tr>
                  ) : rows.map((o: any) => (
                    <tr key={o._id} className="border-b border-slate-800/60">
                      <td className="py-2 pr-2 text-slate-300">{o.anonymous ? <span className="italic text-slate-500">Anonymous</span> : o.sellerName}</td>
                      <td className="py-2 pr-2 font-bold text-white">{nf(o.amount)}</td>
                      <td className="py-2 pr-2 font-bold text-green-400">{tab === "points" ? `$${nf(o.total)}` : `${nf(o.total)} pts`}</td>
                      <td className="py-2 pr-2 text-slate-400">{tab === "points" ? `$${nf(o.unitPrice)}` : `${nf(o.unitPrice)} pts`}</td>
                      <td className="py-2 text-right">
                        {confirmBuy === o._id ? (
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => doBuy(o._id)} disabled={busy}
                              className="rounded-lg bg-green-600 px-2.5 py-1 text-[9px] font-black text-white hover:bg-green-500">CONFIRM</button>
                            <button onClick={() => setConfirmBuy(null)} className="rounded-lg bg-slate-700 px-2 py-1 text-[9px] text-slate-300 hover:bg-slate-600">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmBuy(o._id)}
                            className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1 text-[9px] font-black text-green-300 hover:bg-green-500/20">BUY</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[9px] text-slate-600">A flat $1 trade fee is charged to the buyer. Funds settle instantly into the winner's pocket.</p>
          </div>

          {/* Sell panel */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-amber-400" />
              <h2 className="text-sm font-black text-amber-300 tracking-wide">
                {tab === "points" ? "Sell Points" : "Sell Cash"}
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400">{amountLabel}</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0"
                  className="mt-1 w-full rounded-xl border border-slate-700/70 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400">{unitLabel}{tab === "points" ? " ($)" : " (points)"}</label>
                <input value={unit} onChange={(e) => setUnit(e.target.value.replace(/[^0-9]/g, ""))} placeholder={tab === "points" ? "5000000" : "1"}
                  className="mt-1 w-full rounded-xl border border-slate-700/70 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950/80 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400">
                  Total value{tab === "points" ? " in cash" : " in points"}:{" "}
                  <b className="text-green-400">{tab === "points" ? "$" : ""}{nf((Number(amount) || 0) * (Number(unit) || 0))}{tab === "cash" ? " pts" : ""}</b>
                </span>
                <span className="text-[9px] text-slate-600">Escrow held on listing</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-[10px] text-slate-400">
                  <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="accent-amber-500" />
                  Hide your name?
                </label>
                {identicalCount > 0 && <span className="text-[9px] text-slate-500">Identical listings: {identicalCount}/10</span>}
              </div>
              <button onClick={doCreate} disabled={busy || identicalCount >= 10}
                className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-3 text-xs font-black tracking-wider text-slate-950 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 transition-all">
                {busy ? "WORKING…" : "ADD OFFER"}
              </button>
            </div>

            {/* My active listings */}
            {myOffers && myOffers.filter((o: any) => o.kind === tab).length > 0 && (
              <div className="mt-5 border-t border-slate-800 pt-4">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">My active listings</h3>
                <div className="mt-2 space-y-1.5">
                  {myOffers.filter((o: any) => o.kind === tab).map((o: any) => (
                    <div key={o._id} className="flex items-center justify-between rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                      <span className="text-[11px] text-slate-300">
                        <b className="text-white">{nf(o.amount)} {o.kind === "points" ? "pts" : "$"}</b> for {o.kind === "points" ? `$${nf(o.total)}` : `${nf(o.total)} pts`} · {o.anonymous && <i className="text-slate-500">anonymous</i>}
                      </span>
                      <button onClick={() => doCancel(o._id)} disabled={busy}
                        className="flex items-center gap-1 rounded-lg bg-red-500/10 border border-red-500/30 px-2 py-1 text-[9px] font-bold text-red-400 hover:bg-red-500/20">
                        <X className="size-3" /> Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 text-center">
          <Package className="mx-auto size-10 text-slate-600" />
          <h3 className="mt-3 text-sm font-black text-slate-300">{tab === "items" ? "ITEM TRADING DESK" : "PROPERTY TRADING DESK"}</h3>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed text-slate-500">
            {tab === "items"
              ? "The item exchange is being stocked by dealers across the city. Bring your weapons, armor and loot to your crew's safe house and list them through the trading floor."
              : "Property deeds change hands through the Estate Agency. Head to Real Estate → Property Management to auction, lease or transfer your properties."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <ShieldQuestion className="size-4 text-amber-500/60" />
            <span className="text-[10px] text-slate-600">More desks unlock as the underworld expands</span>
          </div>
        </div>
      )}

      {/* Trade statistics */}
      {stats && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">My trade desk</h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
            {[
              { l: "Points sold", v: nf(stats.soldPoints), c: "text-amber-300" },
              { l: "Points bought", v: nf(stats.boughtPoints), c: "text-amber-300" },
              { l: "Cash sold", v: `$${nf(stats.soldCash)}`, c: "text-green-400" },
              { l: "Cash bought", v: `$${nf(stats.boughtCash)}`, c: "text-green-400" },
              { l: "Total profit", v: `$${nf(stats.profit)}`, c: "text-emerald-400" },
              { l: "Listings cancelled", v: `${nf(stats.cancellations)}`, c: "text-red-400" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                <div className={`text-sm font-black ${s.c}`}>{s.v}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-600">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && (
        <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${msg.ok ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {msg.ok ? <Check className="mt-0.5 size-4 shrink-0" /> : <X className="mt-0.5 size-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const nf = (n: number) => Math.floor(n).toLocaleString();

export function PromoBanner() {
  const promo = useQuery(api.empireSystem.getActivePromo);
  const redeem = useMutation(api.empireSystem.redeemPromoCode);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!promo) return null;

  const hoursLeft = Math.max(0, Math.ceil((promo.expiresAt - Date.now()) / 3600000));

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await redeem({ code });
      setMsg({ ok: true, text: `🎉 ${r.promo} — claimed ${r.rewardLabel} (${nf(r.money)} + ${r.coinBonus} coins)!` });
    } catch (e: any) { setMsg({ ok: false, text: e.message || "Invalid code" }); }
    setBusy(false);
  };

  return (
    <div className="px-3 py-2 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-amber-950/40">
      <div className="mx-auto max-w-5xl flex flex-wrap items-center gap-3">
        <span className="text-lg">🎁</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-amber-300 animate-neon-glow">{promo.message}</div>
          <div className="text-[9px] text-amber-200/60">{promo.rewardLabel} · code <span className="font-black text-white">{promo.code}</span> · expires in {hoursLeft}h</div>
        </div>
        {msg && <div className={`text-[10px] font-bold ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</div>}
        <div className="flex items-center gap-1.5">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={`Enter code`}
            className="w-36 bg-black/40 border border-amber-500/30 rounded-lg px-3 py-1.5 text-[11px] uppercase placeholder:text-amber-200/40 focus:outline-none focus:border-amber-500/60" />
          <button onClick={submit} disabled={busy || !code.trim()}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {busy ? "..." : "Redeem"}
          </button>
        </div>
      </div>
    </div>
  );
}
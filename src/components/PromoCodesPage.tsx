import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Gift, Ticket, Clock } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

export function PromoCodesPage() {
  const state = useQuery(api.empireSystem.getMyPromos);
  const redeem = useMutation(api.empireSystem.redeemPromoCode);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!code.trim()) { setMsg({ ok: false, text: "Enter a code first." }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await redeem({ code });
      setMsg({ ok: true, text: `🎉 ${r.promo} — claimed ${r.rewardLabel} ($${nf(r.money)} + ${r.coinBonus} coins)!` });
      setCode("");
    } catch (e: any) { setMsg({ ok: false, text: e.message || "Invalid or already claimed code." }); }
    setBusy(false);
  };

  const active = state?.active ?? null;
  const history = state?.history ?? [];
  const hoursLeft = active ? Math.max(0, Math.ceil((active.expiresAt - Date.now()) / 3600000)) : 0;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Gift className="size-7 text-amber-400" />
        <div>
          <h2 className="text-2xl font-bold gold-gradient">Promotional Codes</h2>
          <p className="text-[11px] text-muted-foreground">Enter a promotional code to receive a reward!</p>
        </div>
      </div>

      {/* Active promo highlight */}
      {active && (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-rose-950/20 to-amber-950/40 p-4 flex flex-wrap items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-amber-300 animate-neon-glow">{active.message}</div>
            <div className="text-[10px] text-amber-200/60">Code: <span className="font-black text-white">{active.code}</span> · {active.rewardLabel} · expires in {hoursLeft}h</div>
          </div>
        </div>
      )}

      {/* Redeem form */}
      <div className="mafia-card rounded-xl p-5 space-y-3 border border-amber-500/20">
        <div className="flex items-center gap-2">
          <Ticket className="size-4 text-amber-400" />
          <div className="text-sm font-bold">Redeem a Code</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter Code"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="px-5 py-2 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Claiming..." : "Claim Code"}
          </button>
        </div>
        {msg && (
          <div className={`rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 bg-green-950/20 border border-green-500/30" : "text-red-400 bg-red-950/20 border border-red-500/30"}`}>
            {msg.ok ? "✅ " : "⚠️ "}{msg.text}
          </div>
        )}
        {!active && (
          <div className="text-[10px] text-muted-foreground">No promo code is currently active. Check back later or watch the status banner.</div>
        )}
      </div>

      {/* Recent codes */}
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <div className="text-sm font-bold">Recent Codes</div>
          <div className="text-[10px] text-muted-foreground">Last {Math.min(10, history.length)} codes you have claimed</div>
        </div>
        {history.length === 0 ? (
          <div className="text-xs text-muted-foreground py-4 text-center">No codes claimed yet.</div>
        ) : (
          <div className="space-y-1.5">
            {history.slice(0, 10).map((h: any, i: number) => (
              <div key={`${h.code}-${h.at}-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-900/30 px-3 py-2.5">
                <span className="text-lg">🎁</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-amber-300">{h.code}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{h.rewardLabel || h.message}</div>
                </div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(h.at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
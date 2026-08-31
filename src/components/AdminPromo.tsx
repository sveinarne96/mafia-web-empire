import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PromoCodesPanel({ onClose }: { onClose: () => void }) {
  const create = useMutation(api.empireSystem.createPromoCode);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [rewardLabel, setRewardLabel] = useState("All Game Objectives + 250 points + 25 coins + 10 skill points + 1h 3x cash");
  const [expiresHours, setExpiresHours] = useState(24);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await create({ code, message, rewardLabel, expiresHours });
      setMsg({ ok: true, text: `✅ Promo code ${r.code} created. It now shows as a status banner on top of the game.` });
      setCode(""); setMessage("");
    } catch (e: any) { setMsg({ ok: false, text: e.message || "Failed" }); }
    setBusy(false);
  };

  return (
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-amber-500/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">🎁 Promo Codes</div>
          <div className="text-[10px] text-muted-foreground">Create a code — it shows as a status banner on top of the game. Redeeming gives the player all Game Objectives + a coin/points/skill bonus.</div>
        </div>
        <button onClick={onClose} className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs">Close</button>
      </div>
      {msg && <div className={`rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 bg-green-950/20 border border-green-500/30" : "text-red-400 bg-red-950/20 border border-red-500/30"}`}>{msg.text}</div>}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1"><div className="text-[10px] text-muted-foreground">Code (auto-uppercase)</div>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SHADOW2026" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs uppercase" />
        </label>
        <label className="space-y-1"><div className="text-[10px] text-muted-foreground">Expires in (hours)</div>
          <input type="number" value={expiresHours} onChange={(e) => setExpiresHours(Math.max(1, parseInt(e.target.value || "24", 10)))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
        </label>
      </div>
      <label className="space-y-1 block"><div className="text-[10px] text-muted-foreground">Status banner message</div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. SHADOW EMPIRE WEEK — redeem SHADOW2026 for free rewards!" rows={2} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
      </label>
      <label className="space-y-1 block"><div className="text-[10px] text-muted-foreground">Reward label</div>
        <input value={rewardLabel} onChange={(e) => setRewardLabel(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
      </label>
      <button onClick={submit} disabled={busy || !code.trim()}
        className="px-5 py-2 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "Creating..." : "Create Promo Code"}
      </button>
    </div>
  );
}
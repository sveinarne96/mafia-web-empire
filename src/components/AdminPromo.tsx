import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const PERK_OPTIONS = [
  { id: "heistTimer", label: "Heist Timer", icon: "⏱️", desc: "Reduce heist cooldown" },
  { id: "heistChance", label: "Heist Chance", icon: "🎲", desc: "Boost heist success rate" },
  { id: "doublePay", label: "Double Pay", icon: "💰", desc: "2x cash rewards" },
  { id: "doubleXp", label: "Double XP", icon: "⭐", desc: "2x experience points" },
  { id: "jailImmunity", label: "Jail Immune", icon: "🛡️", desc: "Skip jail sentences" },
  { id: "bustBoost", label: "Bust Boost", icon: "💥", desc: "Better bust outcomes" },
  { id: "autoRank", label: "Auto Rank", icon: "⬆️", desc: "Auto rank up over time" },
  { id: "meltValue", label: "Melt Value", icon: "♻️", desc: "Better melt returns" },
  { id: "meltLimit", label: "Melt Limit", icon: "♻️", desc: "Higher melt capacity" },
  { id: "gtaRarity", label: "GTA Rarity", icon: "🚗", desc: "Find rarer vehicles" },
  { id: "supplyUnit", label: "Supply Unit", icon: "📦", desc: "+100 bullets, +25 energy" },
];

export function PromoCodesPanel({ onClose }: { onClose: () => void }) {
  const create = useMutation(api.empireSystem.createPromoCode);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [rewardLabel, setRewardLabel] = useState("All Game Objectives + 250 points + 25 coins + 10 skill points + 1h 3x cash");
  const [expiresHours, setExpiresHours] = useState(24);
  const [perks, setPerks] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const setPerk = (id: string, delta: number) => {
    setPerks((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? 0;
      const val = Math.max(0, cur + delta);
      if (val === 0) delete next[id];
      else next[id] = val;
      return next;
    });
  };

  const perkCount = Object.values(perks).reduce((s, v) => s + v, 0);

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await create({ code, message, rewardLabel, expiresHours, perks });
      setMsg({ ok: true, text: `✅ Promo code ${r.code} created with ${perkCount} perk(s). It now shows as a status banner on top of the game.` });
      setCode(""); setMessage(""); setPerks({});
    } catch (e: any) { setMsg({ ok: false, text: e.message || "Failed" }); }
    setBusy(false);
  };

  return (
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-amber-500/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">🎁 Promo Codes</div>
          <div className="text-[10px] text-muted-foreground">Create a code — it shows as a status banner on top of the game. Redeeming gives the player all Game Objectives + perks + coin/points/skill bonus.</div>
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

      {/* Perk Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground font-bold">⚡ Perks to include</div>
          {perkCount > 0 && <div className="text-[10px] text-amber-400 font-bold">{perkCount} perk(s) selected</div>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PERK_OPTIONS.map((p) => {
            const qty = perks[p.id] ?? 0;
            return (
              <div key={p.id} className={`rounded-lg border px-2 py-1.5 flex items-center gap-2 transition-all ${qty > 0 ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700/40 bg-slate-900/30"}`}>
                <span className="text-sm">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold truncate">{p.label}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{p.desc}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => setPerk(p.id, -1)} disabled={qty === 0} className="w-5 h-5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center">−</button>
                  <span className="w-6 text-center text-[10px] font-bold text-amber-400">{qty}</span>
                  <button onClick={() => setPerk(p.id, 1)} className="w-5 h-5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold hover:bg-slate-700 flex items-center justify-center">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={submit} disabled={busy || !code.trim()}
        className="px-5 py-2 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "Creating..." : "Create Promo Code"}
      </button>
    </div>
  );
}

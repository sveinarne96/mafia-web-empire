import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PACK_CONFIG, PACK_RARITY_ORDER, SCRAP_TO_PACK, PERK_DEFS } from "@/data/objectives";

const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
};

const RARITY_STYLE: Record<string, string> = {
  legendary: "text-amber-400 border-amber-500/40 bg-amber-950/20",
  epic: "text-purple-400 border-purple-500/40 bg-purple-950/20",
  rare: "text-blue-400 border-blue-500/40 bg-blue-950/20",
  common: "text-slate-300 border-slate-600/40 bg-slate-900/40",
};

const RARITY_LABEL: Record<string, string> = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
      {msg.ok ? "✅ " : "⚠️ "}{msg.text}
    </div>
  );
}

export function PacksOverviewPanel() {
  const store = useQuery(api.storeSystem.getStoreState);
  const buyPack = useMutation(api.storeSystem.buyPack);
  const openPack = useMutation(api.storeSystem.openPack);
  const convertScraps = useMutation(api.storeSystem.convertScraps);
  const toggleAuto = useMutation(api.storeSystem.toggleAutoConvert);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [showDrops, setShowDrops] = useState(false);

  if (!store) return <div className="animate-pulse py-6 text-center text-muted-foreground">Loading packs...</div>;

  const packs: Record<string, number> = store.packs ?? { common: 0, rare: 0, epic: 0, legendary: 0 };
  const scraps: Record<string, number> = store.scraps ?? { common: 0, rare: 0, epic: 0 };
  const totalOwned = PACK_RARITY_ORDER.reduce((s, r) => s + (packs[r] ?? 0), 0);

  const run = async (key: string, fn: () => Promise<any>, okText: (r: any) => string) => {
    setBusy(key);
    setMsg(null);
    try { setMsg({ ok: true, text: okText(await fn()) }); }
    catch (e: any) { setMsg({ ok: false, text: e.message || "Failed" }); }
    setBusy(null);
  };

  return (
    <div className="mafia-card rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold">📦 Your Packs</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Open packs for gear, or buy them with IG Coins.</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">🪙 Balance: <span className="text-amber-300 font-black">{nf(store.coins ?? 0)}</span></span>
        </div>
      </div>

      {msg && <Msg msg={msg} />}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-2"><div className="text-[9px] text-muted-foreground">Total Owned</div><div className="text-base font-black text-white">{nf(totalOwned)}</div></div>
        {PACK_RARITY_ORDER.map((r) => (
          <div key={r} className={`rounded-lg border p-2 ${RARITY_STYLE[r]}`}><div className="text-[9px] opacity-80">{RARITY_LABEL[r]}</div><div className="text-base font-black">{nf(packs[r] ?? 0)}</div></div>
        ))}
      </div>

      {/* Auto-convert scraps */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold">♻️ Auto-Convert Scraps</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">When enabled, every {SCRAP_TO_PACK} common/rare/epic scraps automatically become that rarity's pack.</div>
        </div>
        <button
          onClick={() => run("auto", () => toggleAuto(), (r) => `Auto-convert ${r.enabled ? "enabled" : "disabled"}`)}
          disabled={busy === "auto"}
          className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${store.autoConvertScraps ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black" : "bg-slate-800 text-slate-400 border border-slate-600/40"}`}>
          {store.autoConvertScraps ? "● On" : "○ Off"}
        </button>
      </div>

      {/* Pack cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {PACK_RARITY_ORDER.map((key) => {
          const cfg = PACK_CONFIG[key];
          const owned = packs[key] ?? 0;
          const purchasable = cfg.coinCost > 0;
          const scrapCount = (scraps as any)[key] ?? 0;
          return (
            <div key={key} className={`rounded-xl border p-4 ${RARITY_STYLE[key]} bg-opacity-10`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">{cfg.icon} {cfg.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{cfg.rewards} rewards included!</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-muted-foreground">Owned</div>
                  <div className="text-xl font-black">{owned}</div>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                Guaranteed: {cfg.guarantee.map((g) => `${g.qty}× ${RARITY_LABEL[g.rarity]}`).join(" · ")}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  disabled={busy === `open${key}` || owned < 1}
                  onClick={() => run(`open${key}`, () => openPack({ packType: key }), (r) => `Opened ${cfg.name} — ${r.rewards.length} items (+${r.scraps} ${RARITY_LABEL[key]} scraps)!`)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${owned > 0 ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}`}>
                  Open Pack
                </button>
                {purchasable && (
                  <div className="flex items-center gap-1">
                    <input type="number" min={1} max={20} value={qty} onChange={(e) => setQty(Math.min(20, Math.max(1, parseInt(e.target.value || "1", 10))))}
                      className="w-14 bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-center" />
                    <button
                      disabled={busy === `buy${key}` || (store.coins ?? 0) < cfg.coinCost * qty}
                      onClick={() => run(`buy${key}`, () => buyPack({ packType: key, qty }), (r) => `Bought ${r.qty}× ${cfg.name} for ${r.cost} coins`)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${(store.coins ?? 0) >= cfg.coinCost * qty ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}`}>
                      Buy · {cfg.coinCost * qty} 🪙
                    </button>
                  </div>
                )}
              </div>
              {key !== "legendary" && (
                <button
                  disabled={busy === `conv${key}` || scrapCount < SCRAP_TO_PACK}
                  onClick={() => run(`conv${key}`, () => convertScraps({ rarity: key }), () => `Converted ${SCRAP_TO_PACK} ${RARITY_LABEL[key]} scraps into a ${RARITY_LABEL[key]} Pack`)}
                  className={`mt-2 px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${scrapCount >= SCRAP_TO_PACK ? "bg-slate-700 text-white" : "bg-slate-800/60 text-slate-500"}`}>
                  ♻️ Convert {scrapCount}/{SCRAP_TO_PACK} scraps → {cfg.name}
                </button>
              )}
              <button onClick={() => setShowDrops(!showDrops)} className="mt-2 text-[9px] text-muted-foreground hover:text-white">
                {showDrops ? "▾" : "▸"} Drop Probabilities
              </button>
              {showDrops && (
                <div className="mt-1 space-y-0.5 text-[9px]">
                  {PACK_RARITY_ORDER.map((r) => (
                    <div key={r} className="flex items-center justify-between"><span className="text-slate-400">{RARITY_LABEL[r]}</span><span className="font-bold">{(cfg.drops as any)[r]}%</span></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const INSTANT_COOLDOWN_MS = 10 * 60 * 1000;

export function PerksPanel() {
  const store = useQuery(api.storeSystem.getStoreState);
  const usePerk = useMutation(api.storeSystem.usePerk);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // live 1s tick to keep instant-perk cooldowns counting down
  // NOTE: must be called before any early return so hook order stays constant.
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!store) return <div className="animate-pulse py-6 text-center text-muted-foreground">Loading perks...</div>;

  const perks: Record<string, number> = store.perks ?? {};
  const until: Record<string, number> = store.perkActiveUntil ?? {};
  const now = Date.now();

  const fieldFor = (id: string): number => {
    switch (id) {
      case "doubleXp": return store.xpBoostUntil ?? 0;
      case "doublePay": return store.cashBoostUntil ?? 0;
      case "heistChance": return store.heistChanceUntil ?? 0;
      case "heistTimer": return store.heistTimerUntil ?? 0;
      case "bustBoost": return store.bustBoostUntil ?? 0;
      case "meltValue": return store.meltValueUntil ?? 0;
      case "meltLimit": return store.meltLimitUntil ?? 0;
      case "gtaRarity": return store.gtaRarityUntil ?? 0;
      default: return until[id] ?? 0;
    }
  };

  const active = (id: string) => fieldFor(id) > now;
  const remainText = (id: string) => {
    const t = fieldFor(id) - now;
    if (t <= 0) return "";
    const m = Math.floor(t / 60000);
    const s = Math.floor((t % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  // For instant (one-shot) perks: returns seconds left until usable again, or 0.
  const instantRemain = (id: string) => {
    const start = until[id] ?? 0;
    const rem = start + INSTANT_COOLDOWN_MS - now;
    return Math.max(0, rem);
  };
  const instantText = (id: string) => {
    const ms = instantRemain(id);
    if (ms <= 0) return "";
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const useIt = async (id: string) => {
    setBusy(id);
    setMsg(null);
    try {
      await usePerk({ perkId: id });
      const def = PERK_DEFS.find((p) => p.id === id)!;
      const isTimed = !(def.duration === "instant" || id === "jailImmunity" || id === "autoRank" || id === "supplyUnit");
      const stacking = isTimed && fieldFor(id) > now;
      let text = stacking ? `⚡ Extended ${def.label} by ${def.duration}!` : `⚡ Activated ${def.label}!`;
      if (id === "autoRank") text = `⭐ Auto Rank used! +1 rank (${Math.max(0, (perks[id] ?? 1) - 1)} left)`;
      if (id === "supplyUnit") text = `📦 Supply Unit used! +100 bullets, +25 energy`;
      if (id === "jailImmunity") text = `🛡️ Jail Immunity banked! +1 skip`;
      setMsg({ ok: true, text });
    }
    catch (e: any) { setMsg({ ok: false, text: e.message || "Failed" }); }
    setBusy(null);
  };

  return (
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div>
        <div className="text-sm font-bold">⚡ Your Perks</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">Below are the perks you have in stock — activate them when you need them.</div>
      </div>
      {msg && <Msg msg={msg} />}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[9px] uppercase text-muted-foreground border-b border-slate-700/40">
              <th className="py-2 pr-2">Perk</th>
              <th className="py-2 pr-2">Stock</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2">Use</th>
            </tr>
          </thead>
          <tbody>
            {PERK_DEFS.map((p) => {
              const stock = perks[p.id] ?? 0;
              const isActive = active(p.id);
              const instant = p.duration === "instant" || p.id === "jailImmunity" || p.id === "autoRank" || p.id === "supplyUnit";
              return (
                <tr key={p.id} className="border-b border-slate-800/40">
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <div>
                        <div className="font-bold text-[11px]">{p.label}</div>
                        <div className="text-[9px] text-muted-foreground">{p.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-center text-amber-400 font-black">{stock}</td>
                  <td className="py-2 pr-2">
                    {instant ? (
                      (() => {
                        const cd = instantRemain(p.id);
                        return cd > 0 ? (
                          <span className="text-[10px] font-bold text-cyan-400 animate-pulse">⏳ {instantText(p.id)}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Ready</span>
                        );
                      })()
                    ) : isActive ? (
                      <span className="text-[10px] font-bold text-green-400 animate-pulse">● Active · {remainText(p.id)}</span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Inactive</span>
                    )}
                  </td>
                  <td className="py-2">
                    <button
                      disabled={busy === p.id || stock < 1 || (instant && instantRemain(p.id) > 0)}
                      onClick={() => useIt(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${stock > 0 && !(instant && instantRemain(p.id) > 0) ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black" : "bg-slate-800 text-slate-500"}`}>
                      {stock < 1 ? "-" : instant && instantRemain(p.id) > 0 ? "⏳" : isActive && !instant ? "Extend" : "Use"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-[9px] text-slate-500">Tip: timed perks stack with the game's boost timers shown in the top bar. Auto Rank instantly levels you up and refills energy to 100.</div>
    </div>
  );
}

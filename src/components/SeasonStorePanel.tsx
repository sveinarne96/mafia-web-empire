import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Gift, Coins, Crown, Eye, RefreshCw } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

// ═══════════════════ SEASON STORE (tokens) ═══════════════════
// Buy Tokens (XP → tokens) · Season Store · VIP Store · Inventory tabs.

const AVATAR_OUTLINE_STYLES: Record<string, string> = {
  aurora_outline: "linear-gradient(135deg,#22d3ee,#a855f7,#22d3ee)",
  inferno_outline: "linear-gradient(135deg,#f97316,#ef4444,#f97316)",
  royal_outline: "linear-gradient(135deg,#facc15,#f59e0b,#facc15)",
  toxic_outline: "linear-gradient(135deg,#a3e635,#14b8a6,#a3e635)",
};

const EQUIP_CATEGORIES = ["relic", "avatar", "cards", "cosmetic", "upgrade"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  relic: "Relics", avatar: "Avatar Outlines", cards: "Card Sets", cosmetic: "Cosmetics", upgrade: "Account Upgrades",
};

export function SeasonStorePanel() {
  const store = useQuery(api.seasonSystem.getSeasonStoreState);
  const exchange = useMutation(api.seasonSystem.exchangeXpForTokens);
  const buyItem = useMutation(api.seasonSystem.buySeasonItem);
  const buyVipItem = useMutation(api.seasonSystem.buyVipStoreItem);
  const equip = useMutation(api.seasonSystem.equipCosmetic);

  const [tab, setTab] = useState<"exchange" | "store" | "vip" | "inventory">("exchange");
  const [xpAmount, setXpAmount] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [invTab, setInvTab] = useState<"rewards" | "store" | "vip" | "inventory">("inventory");
  const [showEquipped, setShowEquipped] = useState(true);
  const [showOwned, setShowOwned] = useState(true);

  const run = async (key: string, fn: () => Promise<any>, ok?: string) => {
    setBusy(key);
    setMsg(null);
    try {
      const r = await fn();
      setMsg({ ok: true, text: ok ?? `✅ ${r?.name ?? r?.tokens ?? "Done"} — success!` });
    } catch (e: any) {
      setMsg({ ok: false, text: `⚠️ ${e.message || "Failed"}` });
    }
    setBusy(null);
  };

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground text-sm">Loading Season Store…</div>;

  const maxExchangeable = store.seasonXp * store.exchangeRate;

  return (
    <div className="animate-fade-in space-y-4">
      {msg && (
        <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>{msg.text}</div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {([["exchange", "🔄 Buy Tokens"], ["store", "🛒 Season Store"], ["vip", "👑 VIP Store"], ["inventory", "🎒 Inventory"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${tab === key ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Buy Tokens */}
      {tab === "exchange" && (
        <div className="mafia-card rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2"><Coins className="size-4 text-amber-400" /> Buy Tokens</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Exchange your XP for tokens</p>
          </div>
          <div className="text-xs text-muted-foreground">
            You have <span className="text-purple-400 font-black">{nf(store.seasonXp)}</span> Season XP and{" "}
            <span className="text-amber-300 font-black">{nf(store.seasonTokens)}</span> Season Tokens
          </div>
          <div className="text-[10px] text-muted-foreground">You can exchange a total of <span className="text-foreground font-bold">{nf(maxExchangeable)}</span> Season XP</div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Amount (XP)</label>
            <input
              type="number" min={1} value={xpAmount} onChange={(e) => setXpAmount(e.target.value)}
              placeholder={`Max ${nf(store.seasonXp)} XP`}
              className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-1.5 flex-wrap">
              {[25, 50, 100].map((pct) => (
                <button key={pct} onClick={() => setXpAmount(String(Math.floor((store.seasonXp * pct) / 100)))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-muted-foreground hover:bg-white/10 transition">
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={busy === "x" || !xpAmount || Number(xpAmount) <= 0}
            onClick={() => run("x", () => exchange({ xpAmount: Number(xpAmount) }), `✅ Exchanged for ${nf(Number(xpAmount) * store.exchangeRate)} tokens!`)}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black hover:brightness-110 disabled:opacity-40 transition">
            🔄 Purchase Tokens
          </button>
        </div>
      )}

      {/* Season Store */}
      {tab === "store" && (
        <div className="mafia-card rounded-xl p-5 space-y-3">
          <div>
            <h3 className="font-bold text-sm">🛒 Season Store</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Spend your tokens on exclusive items</p>
          </div>
          <div className="text-xs">💰 Balance: <span className="text-amber-300 font-black">{nf(store.seasonTokens)}</span> tokens</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {store.items.map((item) => (
              <div key={item.id} className={`rounded-lg border p-3 space-y-2 ${item.stock <= 0 ? "border-slate-700/40 bg-slate-900/40 opacity-75" : "border-amber-500/20 bg-slate-900/30"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black truncate">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground">
                    Price <span className="text-amber-300 font-black">{item.price}</span> · {item.stock > 0 ? <span className="text-green-400 font-bold">{item.stock} in stock</span> : <span className="text-red-400 font-bold">Out of stock</span>}
                  </div>
                  <button
                    disabled={busy === item.id || item.stock <= 0 || store.seasonTokens < item.price}
                    onClick={() => run(item.id, () => buyItem({ itemId: item.id }), `✅ Bought ${item.name}!`)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition disabled:opacity-40 ${store.seasonTokens >= item.price && item.stock > 0 ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110" : "bg-slate-800 text-slate-500"}`}>
                    Purchase
                  </button>
                </div>
                {item.bought > 0 && <div className="text-[9px] text-cyan-400 font-bold">Bought ×{item.bought} this season</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIP Store */}
      {tab === "vip" && (
        <div className="mafia-card rounded-xl p-5 space-y-3">
          <div>
            <h3 className="font-bold text-sm">👑 Seasons VIP Store</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Spend VIP tokens on ultra-exclusive rewards</p>
          </div>
          <div className="text-xs">👑 You have <span className="text-amber-300 font-black">{nf(store.vipTokens)}</span> VIP Tokens</div>
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <div>When you purchase VIP membership, you are given 3 VIP Tokens. This is the maximum per season.</div>
            <div>All VIP store purchases are final and cannot be undone or refunded.</div>
            <div>VIP store items and unused VIP Tokens reset at the end of each season.</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {store.vipStore.map((item) => (
              <div key={item.id} className="rounded-lg border border-amber-500/20 bg-slate-900/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black truncate">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground">Price <span className="text-amber-300 font-black">{item.price}</span> token{item.price > 1 ? "s" : ""}</div>
                  <button
                    disabled={busy === item.id || store.vipTokens < item.price}
                    onClick={() => run(item.id, () => buyVipItem({ itemId: item.id }), `✅ Bought ${item.name}!`)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition disabled:opacity-40 ${store.vipTokens >= item.price ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110" : "bg-slate-800 text-slate-500"}`}>
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory */}
      {tab === "inventory" && (
        <div className="space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            {([["inventory", "🎒 Season Inventory"], ["rewards", "🏆 Rewards"], ["store", "🛒 Store"], ["vip", "👑 VIP Store"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setInvTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${invTab === key ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"}`}>
                {label}
              </button>
            ))}
          </div>

          {invTab === "inventory" && (
            <>
              <div className="mafia-card rounded-xl p-4 space-y-2">
                <button onClick={() => setShowEquipped(!showEquipped)} className="w-full flex items-center gap-2">
                  <Eye className="size-4 text-cyan-400" />
                  <span className="text-sm font-bold flex-1 text-left">Equipped Cosmetics <span className="text-[10px] text-muted-foreground">({Object.keys(store.equipped).length} categories)</span></span>
                  {showEquipped ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </button>
                {showEquipped && (
                  Object.keys(store.equipped).length === 0 ? (
                    <div className="text-[11px] text-muted-foreground py-2">No equipped cosmetics.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {Object.entries(store.equipped).map(([cat, id]) => (
                        <div key={cat} className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/10 px-3 py-2">
                          <span className="text-lg">{store.items.find((i) => i.id === id)?.emoji ?? "✨"}</span>
                          <span className="text-xs font-bold flex-1 truncate">{store.items.find((i) => i.id === id)?.name ?? String(id)}</span>
                          <span className="text-[9px] uppercase text-muted-foreground">{CATEGORY_LABELS[cat] ?? cat}</span>
                          <button onClick={() => run(`uneq${id}`, () => equip({ itemId: String(id), equip: false }), "Unequipped")}
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold">Unequip</button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="mafia-card rounded-xl p-4 space-y-2">
                <button onClick={() => setShowOwned(!showOwned)} className="w-full flex items-center gap-2">
                  <Gift className="size-4 text-amber-400" />
                  <span className="text-sm font-bold flex-1 text-left">Season Inventory <span className="text-[10px] text-muted-foreground">({store.inventory.length} owned)</span></span>
                  {showOwned ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </button>
                {showOwned && (
                  store.inventory.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground py-2">You do not own any season cosmetics yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {store.inventory.map((it: any, idx: number) => {
                        const equippedHere = Object.values(store.equipped).includes(it.id);
                        return (
                          <div key={`${it.id}-${idx}`} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${equippedHere ? "border-cyan-500/30 bg-cyan-950/10" : "border-border/60 bg-slate-900/30"}`}>
                            <span className="text-lg">{it.emoji ?? "✨"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold truncate">{it.name}</div>
                              <div className="text-[9px] text-muted-foreground">{CATEGORY_LABELS[it.category] ?? it.category}</div>
                            </div>
                            <button
                              onClick={() => run(`eq${idx}`, () => equip({ itemId: it.id, equip: !equippedHere }), equippedHere ? "Unequipped" : "Equipped!")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${equippedHere ? "bg-white/5 text-muted-foreground hover:bg-white/10" : "bg-cyan-600 text-white hover:bg-cyan-500"}`}>
                              {equippedHere ? "Unequip" : "Equip"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {invTab === "rewards" && (
            <div className="mafia-card rounded-xl p-4 text-[11px] text-muted-foreground space-y-1">
              <div className="text-sm font-bold text-foreground mb-1">🏆 Rewards</div>
              <div>Season rewards land in your account automatically — packs open from the Packs page, bullets/points/cash apply instantly.</div>
              <div>Season Pass tiers and Daily Reward wins appear here as you claim them.</div>
            </div>
          )}
          {invTab === "store" && <p className="text-[11px] text-muted-foreground px-1">Switch to the 🛒 Season Store tab above to buy items with tokens.</p>}
          {invTab === "vip" && <p className="text-[11px] text-muted-foreground px-1">Switch to the 👑 VIP Store tab above to spend VIP tokens.</p>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════ DAILY REWARD — 16-tile match game ═══════════════════

const TILE_EMOJI: Record<string, string> = {
  doubleXp: "🚀", doublePay: "💰", jailImmune: "🚔", bustBoost: "💥", autoRanks: "⭐",
  heistChance: "🎰", heistTimer: "⏳", commonScrap: "🧩", rareScrap: "🔧", cash: "💵", points: "🏆", bullets: "💀",
};

export function DailyRewardGame() {
  const data = useQuery(api.dailyReward.getDailyRewardState);
  const start = useMutation(api.dailyReward.startGame);
  const reveal = useMutation(api.dailyReward.revealTile);
  const finish = useMutation(api.dailyReward.finishGame);

  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const state = data?.state;
  const active = !!state?.active;
  const revealed = state?.revealed ?? [];
  const matched = state?.matched ?? [];
  const chances = state?.chances ?? 3;
  const pairs = state?.matchedPairs ?? 0;
  const pickCount = revealed.length;
  const cdLeft = Math.max(0, (data?.cooldownMsLeft ?? 0));

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    setMsg(null);
    try { await fn(); } catch (e: any) { setMsg({ ok: false, text: `⚠️ ${e.message || "Failed"}` }); }
    setBusy(false);
  };

  if (!data) return <div className="animate-pulse py-6 text-center text-muted-foreground text-xs">Loading Daily Reward…</div>;

  return (
    <div className="mafia-card rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎰</span>
        <div>
          <h3 className="font-bold text-sm">Daily Reward</h3>
          <p className="text-[10px] text-muted-foreground">Match the symbols to win prizes!</p>
        </div>
        <div className="ml-auto text-right">
          {active ? (
            <span className="text-[10px] font-black text-amber-400">🎯 {pairs}/8 pairs · {chances} chances left</span>
          ) : data.canStart ? (
            <span className="text-[10px] font-black text-green-400">🟢 Ready to play</span>
          ) : (
            <span className="text-[10px] font-black text-muted-foreground">⏳ Ready in {Math.ceil(cdLeft / 60000)}m {Math.floor((cdLeft % 60000) / 1000)}s</span>
          )}
        </div>
      </div>

      {msg && <div className={`rounded-lg px-3 py-2 text-xs font-bold ${msg.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{msg.text}</div>}

      {/* 4x4 grid */}
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {Array.from({ length: 16 }, (_, i) => {
          const isRevealed = revealed.includes(i);
          const isMatched = matched.includes(i);
          const prizeId = state?.board?.[i]?.prize;
          const faceUp = isRevealed || isMatched || !active; // when board over, flip everything
          return (
            <motion.button
              key={i}
              whileTap={active && !faceUp ? { scale: 0.92 } : undefined}
              onClick={() => active && !faceUp && run(() => reveal({ tile: i }))}
              disabled={!active || busy || faceUp}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl border transition-all ${
                isMatched ? "border-green-500/50 bg-green-950/30"
                : isRevealed ? "border-amber-500/50 bg-amber-950/20 animate-pulse"
                : faceUp && prizeId ? "border-slate-600/40 bg-slate-900/40 opacity-60"
                : "border-slate-700/40 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-800/60"}`}
            >
              {faceUp && prizeId ? (
                <span className="flex flex-col items-center">
                  <span>{TILE_EMOJI[prizeId] ?? "🎁"}</span>
                  {isMatched && <span className="text-[7px] text-green-400 font-black">PAIRED</span>}
                </span>
              ) : (
                <span className="text-lg font-black text-muted-foreground/40">?</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2">
        {!active && !state && (
          <button
            disabled={busy || !data.canStart}
            onClick={() => run(async () => {
              const r = await start({});
              setMsg({ ok: true, text: "🎲 Board started — 4 tiles revealed. Pick two to find a pair!" });
            })}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition ${data.canStart ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110" : "bg-slate-800 text-slate-500"}`}>
            🎲 Start Game
          </button>
        )}
        {active && (
          <div className="text-[10px] text-muted-foreground">
            {pickCount === 0 && "Pick a tile to begin — your cooldown starts on the first reveal."}
            {pickCount === 1 && "Pick a second tile to try for a pair!"}
          </div>
        )}
        {!active && state && (
          <button
            disabled={busy}
            onClick={() => run(async () => {
              const r = await finish({});
              setMsg({ ok: true, text: r.pairs > 0 ? `🎁 Board over — ${r.pairs} pair${r.pairs > 1 ? "s" : ""} banked: ${r.rewards.join(", ")}` : "Board over — no pairs matched. Try again in 15 minutes!" });
            })}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-black hover:brightness-110 transition">
            🎁 Claim {pairs > 0 ? `x${pairs} rewards` : "results"}
          </button>
        )}
      </div>

      {/* Rules */}
      <div className="text-center">
        <button onClick={() => setShowRules(!showRules)} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300">
          How to Play & Prize Pool {showRules ? "Hide /" : "Show /"} Hide
        </button>
        {showRules && (
          <div className="text-[10px] text-muted-foreground mt-2 text-left space-y-1 mafia-card rounded-lg p-3">
            <p>There are 16 tiles, once you hit start game it will show 4 random tiles. After that you have to match the pairs.</p>
            <p>You can match up to 8 pairs which will be X8 prizes. You get 3 chances to match after that you fail. If you fail you will still get a reward based on the pairs you have matched.</p>
            <p className="text-amber-400/80">Note: Your cooldown starts when you reveal your first tile, not when you press Start Game. If you refresh mid-game, use Continue Game to resume your current board.</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(TILE_EMOJI).map(([id, emoji]) => (
                <span key={id} className="px-2 py-0.5 rounded-full bg-white/5 border border-border/60 text-[9px] font-bold">
                  {emoji} {id.replace(/([A-Z])/g, " $1")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Last 10 rewards */}
      <div className="text-center">
        <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300">
          Last 10 Rewards — here you can see the last 10 rewards you have won! {showHistory ? "Hide /" : "Show /"} Hide
        </button>
        {showHistory && (
          <div className="mt-2 text-left space-y-1">
            {(data.history?.length ?? 0) === 0 ? (
              <div className="text-[10px] text-muted-foreground">No rewards recorded yet.</div>
            ) : (
              data.history.map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-[10px] rounded-lg bg-white/5 px-2.5 py-1.5">
                  <span className="font-black text-amber-400">x{h.mult}</span>
                  <span className="flex-1 text-muted-foreground">{(h.prizes ?? []).join(" · ")}</span>
                  <span className="text-[9px] opacity-50">{new Date(h.at).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldPlus, Bot, User, Star, Cpu } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

const RANK_NAMES = ["", "Recruit Unit", "Security Unit", "Veteran Unit", "Elite Unit", "War Droid"];

export function BodyguardsPage() {
  const store = useQuery(api.storeSystem.getStoreState);
  const upgrade = useMutation(api.storeSystem.upgradeBodyguard);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading Bodyguards...</div>;

  const bodyguards: any[] = store.robotBodyguards ?? [];
  const totalBgDefense = bodyguards.reduce((s, b) => s + (b.defense ?? 0), 0);

  const doUpgrade = async (bg: any) => {
    setBusy(bg.id);
    setMsg(null);
    try {
      const r = await upgrade({ bodyguardId: bg.id });
      setMsg({ ok: true, text: `✅ ${bg.name} upgraded to ${RANK_NAMES[r.rank]} — armor ${nf(r.defense)}` });
    } catch (e: any) {
      setMsg({ ok: false, text: `⚠️ ${e.message || "Failed"}` });
    }
    setBusy(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🤖</span>
        <div>
          <h2 className="text-2xl font-bold mafia-gold">Bodyguards</h2>
          <p className="text-xs text-muted-foreground">Your robot security detail. Buy units in the 💎 Point Store, then upgrade their armor and rank here.</p>
        </div>
      </div>

      {msg && (
        <div className={`mafia-card rounded-xl p-3 text-xs font-bold ${msg.ok ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>{msg.text}</div>
      )}

      {/* Summary */}
      <div className="mafia-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
              <User className="size-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm font-bold">{store.nickname}</div>
              <div className="text-[10px] text-muted-foreground">Security Detail Commander</div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-400">🛡️ +{nf(totalBgDefense)} DEF</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Units Owned</div>
            <div className="text-lg font-black text-cyan-400">{bodyguards.length} / 4</div>
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Total BG Armour</div>
            <div className="text-lg font-black text-amber-400">{nf(totalBgDefense)}</div>
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Your Defense</div>
            <div className="text-lg font-black text-green-400">{nf(store.defense)}</div>
          </div>
          <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
            <div className="text-[9px] text-muted-foreground">Max Slots</div>
            <div className="text-lg font-black text-purple-400">4 / 4</div>
          </div>
        </div>
        <div className="h-2 bg-background/60 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${(bodyguards.length / 4) * 100}%` }} />
        </div>
      </div>

      {/* Roster */}
      {bodyguards.length === 0 ? (
        <div className="mafia-card rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">🤖</div>
          <div className="text-sm font-bold text-muted-foreground">No bodyguards purchased yet</div>
          <div className="text-[11px] text-muted-foreground max-w-md mx-auto">Buy Robot Bodyguards in the <span className="text-amber-400 font-bold">💎 Point Store</span> (125–525 Points). Each unit adds permanent defense to your profile.</div>
          <div className="text-[10px] text-slate-500">Robot Bodyguard 1 · 125 pts → Robot Bodyguard 4 · 525 pts</div>
        </div>
      ) : (
        <div className="space-y-3">
          {bodyguards.map((bg: any) => {
            const rank = bg.rank ?? 1;
            const armor = bg.defense ?? 0;
            const maxRank = bg.maxRank ?? 5;
            const maxArmor = Math.round(armor * Math.pow(1.4, maxRank - rank));
            const atMax = rank >= maxRank;
            const cost = rank * 200;
            return (
              <div key={bg.id} className="mafia-card rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700/40 to-slate-900/60 border border-slate-600/40 flex items-center justify-center">
                    <Bot className="size-6 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{bg.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-black text-cyan-400">
                        <Cpu className="size-2.5 inline mr-1" />{RANK_NAMES[rank] ?? `Rank ${rank}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: maxRank }, (_, i) => (
                        <Star key={i} className={`size-3 ${i < rank ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-background/40 px-3 py-2">
                      <div className="text-[8px] text-muted-foreground uppercase">BG Armour</div>
                      <div className="text-sm font-black text-amber-400">{nf(armor)}</div>
                    </div>
                    <div className="rounded-lg bg-background/40 px-3 py-2">
                      <div className="text-[8px] text-muted-foreground uppercase">Max Armour</div>
                      <div className="text-sm font-black text-slate-300">{nf(maxArmor)}</div>
                    </div>
                    <div className="rounded-lg bg-background/40 px-3 py-2">
                      <div className="text-[8px] text-muted-foreground uppercase">BG Rank</div>
                      <div className="text-sm font-black text-cyan-400">{rank}</div>
                    </div>
                    <div className="rounded-lg bg-background/40 px-3 py-2">
                      <div className="text-[8px] text-muted-foreground uppercase">Max Rank</div>
                      <div className="text-sm font-black text-slate-300">{maxRank}</div>
                    </div>
                  </div>
                  <button
                    disabled={atMax || busy === bg.id || (store.points ?? 0) < cost}
                    onClick={() => doUpgrade(bg)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${atMax ? "bg-green-900/40 text-green-400 border border-green-500/30" : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110"}`}>
                    {atMax ? "MAX RANK" : `⬆ Upgrade · ${nf(cost)} pts`}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                    <span>Armour</span>
                    <span>{nf(armor)} / {nf(maxArmor)}</span>
                  </div>
                  <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full" style={{ width: `${Math.min(100, Math.round((armor / maxArmor) * 100))}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details note */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2"><ShieldPlus className="size-4 text-amber-400" /><span className="text-xs font-bold">How it works</span></div>
        <ul className="text-[10px] text-muted-foreground space-y-1">
          <li>• Buy Robot Bodyguards in the <span className="text-amber-400">💎 Point Store</span> — max 4 units, each adds permanent DEF.</li>
          <li>• Upgrades cost <span className="text-amber-400">rank × 200 points</span> and boost armour by <span className="text-cyan-400">+40%</span> per rank.</li>
          <li>• Max rank is 5 (War Droid) — the ultimate protection.</li>
        </ul>
      </div>
    </div>
  );
}

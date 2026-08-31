import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PacksOverviewPanel, PerksPanel } from "@/components/PacksPerksPanel";
import { ObjectivesPanel } from "@/components/StorePages";
import { PACK_RARITY_ORDER } from "@/data/objectives";

const nf = (n: number) => Math.floor(n).toLocaleString();
const short = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
};

function InvStat({ label, value, cls = "text-amber-300", icon }: { label: string; value: React.ReactNode; cls?: string; icon: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/40">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-black ${cls}`}>{value}</div>
    </div>
  );
}

// Dedicated left-menu Inventory hub: packs, scraps, perks, objectives,
// bodyguards and player-owned resources all in one place.
export function InventoryPage() {
  const store = useQuery(api.storeSystem.getStoreState) as any;
  if (!store) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading inventory...</div>;

  const packs: Record<string, number> = store.packs ?? { common: 0, rare: 0, epic: 0, legendary: 0 };
  const scraps: Record<string, number> = store.scraps ?? { common: 0, rare: 0, epic: 0 };
  const perks: Record<string, number> = store.perks ?? {};
  const bodyguards: any[] = store.robotBodyguards ?? [];
  const totalPacks = PACK_RARITY_ORDER.reduce((s, r) => s + (packs[r] ?? 0), 0);
  const totalScraps = ["common", "rare", "epic"].reduce((s, r) => s + (scraps[r] ?? 0), 0);
  const perkStock = Object.values(perks).reduce((s: number, v: any) => s + (Number(v) || 0), 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎒</span>
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400">Inventory</h2>
          <p className="text-xs text-muted-foreground">Everything you own — packs, scraps, perks, objectives and resources.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <InvStat label="Total Packs" value={nf(totalPacks)} cls="text-amber-400" icon="📦" />
        <InvStat label="Scraps" value={nf(totalScraps)} cls="text-blue-400" icon="🧩" />
        <InvStat label="Coins" value={nf(store.coins ?? 0)} cls="text-yellow-400" icon="🪙" />
        <InvStat label="Bullets" value={nf(store.bullets ?? 0)} cls="text-orange-400" icon="💀" />
        <InvStat label="Bodyguards" value={`${bodyguards.length}/4`} cls="text-emerald-400" icon="🛡️" />
        <InvStat label="Perk Stock" value={nf(perkStock)} cls="text-purple-400" icon="⚡" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PACK_RARITY_ORDER.map((r) => (
          <div key={r} className="mafia-card rounded-lg p-2 text-center border border-slate-700/40">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{r}</div>
            <div className={`text-base font-black ${r === "legendary" ? "text-amber-400" : r === "epic" ? "text-purple-400" : r === "rare" ? "text-blue-400" : "text-slate-300"}`}>
              {nf(packs[r] ?? 0)} {short(scraps[r] ?? 0) + " scrap"}
            </div>
          </div>
        ))}
      </div>

      <PacksOverviewPanel />
      <PerksPanel />
      <ObjectivesPanel />

      <div className="mafia-card rounded-xl p-4 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold text-emerald-300">🛡️ Robot Bodyguards</div>
          <span className="text-[10px] text-muted-foreground">upgrade in the Bodyguards page</span>
        </div>
        {bodyguards.length === 0 ? (
          <div className="text-[11px] text-muted-foreground">No bodyguards purchased yet. Visit the Point Store or the Bodyguards page to buy them.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {bodyguards.map((b: any, i: number) => (
              <div key={i} className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-2 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div className="flex-1">
                  <div className="text-xs font-bold">Robot Bodyguard {i + 1}</div>
                  <div className="text-[10px] text-muted-foreground">Rank {b.rank ?? 1}/5 · Armour {b.armour ?? 0}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">+{(b.armour ?? 0)} DEF</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
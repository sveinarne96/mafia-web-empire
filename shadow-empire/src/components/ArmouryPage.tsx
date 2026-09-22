import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ARMOURY_GUNS, ARMOURY_PROTECTION, GUN_BUNDLE, PROT_BUNDLE, type ArmouryItem } from "@/data/armoury";
import { Check, X, Crosshair, Shield, Lock } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();
type Pay = "cash" | "points" | "coins";

const RARITY_STYLE: Record<string, string> = {
  Common: "text-slate-300 border-slate-500/40 bg-slate-500/10",
  Rare: "text-sky-300 border-sky-500/40 bg-sky-500/10",
  Epic: "text-purple-300 border-purple-500/40 bg-purple-500/10",
  Legendary: "text-amber-300 border-amber-500/40 bg-amber-500/10",
};

export function ArmouryPage() {
  const player = useQuery(api.game.getPlayer);
  const state = useQuery(api.armoury.getArmouryState);
  const buyItem = useMutation(api.armoury.buyArmouryItem);
  const buyBundle = useMutation(api.armoury.buyArmouryBundle);
  const equipItem = useMutation(api.armoury.equipArmouryItem);

  const [pay, setPay] = useState<Pay>("cash");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const coins = (player as any)?.coins ?? 0;
  const ownedGuns: string[] = state?.guns ?? [];
  const ownedProt: string[] = state?.protection ?? [];
  const equipped = state?.equipped ?? {};

  if (!player || !state) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Unlocking the armoury…</div>;

  const payLabel = (item: ArmouryItem, bundle = false) =>
    pay === "coins" ? "1 IG Coin" : pay === "points" ? `${nf(item.points)} pts` : `$${nf(item.cash)}`;
  const bundlePrice = (b: { cash: number; points: number; igCoins: number }) =>
    pay === "coins" ? "1 IG Coin" : pay === "points" ? `${nf(b.points)} pts` : `$${nf(b.cash)}`;

  const run = async (fn: () => Promise<{ success: boolean; name?: string; added?: number; slot?: string }>, okText: string) => {
    setMsg(null); setBusy(true);
    try { await fn(); setMsg({ ok: true, text: okText }); }
    catch (e: any) { setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Purchase failed" }); }
    setBusy(false);
  };

  const PaymentPicker = () => (
    <div className="flex items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-950/70 p-1">
      {(["cash", "points", "coins"] as Pay[]).map((p) => (
        <button key={p} onClick={() => setPay(p)}
          className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition-all ${pay === p ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}>
          {p === "cash" ? "CASH" : p === "points" ? "POINTS" : "IG COINS"}
        </button>
      ))}
    </div>
  );

  const Card = ({ item, slot, owned }: { item: ArmouryItem; slot: "guns" | "protection"; owned: boolean }) => {
    const isEquipped = equipped[slot] === item.id;
    return (
      <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${owned ? "border-slate-700/60 bg-slate-900/30" : "border-slate-700/60 bg-slate-900/50 hover:border-amber-500/40"}`}>
        {isEquipped && (
          <div className="absolute right-0 top-0 rounded-bl-xl bg-green-600 px-2 py-1 text-[8px] font-black text-white">EQUIPPED</div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <div className="text-sm font-black text-white">{item.name}</div>
              <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${RARITY_STYLE[item.rarity]}`}>{item.rarity}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-wider text-slate-500">{slot === "guns" ? "Attack" : "Defense"}</div>
            <div className="text-lg font-black text-red-400">{slot === "guns" ? "⚔️" : "🛡️"} +{item.power}</div>
          </div>
        </div>
        <p className="mt-2 min-h-8 text-[10px] leading-relaxed text-slate-500">{item.blurb}</p>
        {owned ? (
          <div className="mt-3 flex gap-2">
            {!isEquipped ? (
              <button onClick={() => run(() => equipItem({ slot: slot === "guns" ? "guns" : "protection", itemId: item.id }), `${item.name} equipped.`)}
                disabled={busy} className="flex-1 rounded-xl bg-green-600/80 py-2 text-[10px] font-black text-white hover:bg-green-600 disabled:opacity-50">EQUIP</button>
            ) : (
              <button onClick={() => run(() => equipItem({ slot: slot === "guns" ? "guns" : "protection", itemId: undefined }), `${item.name} unequipped.`)}
                disabled={busy} className="flex-1 rounded-xl bg-slate-700/70 py-2 text-[10px] font-black text-slate-300 hover:bg-slate-700 disabled:opacity-50">UNEQUIP</button>
            )}
            <span className="rounded-xl border border-green-500/30 bg-green-500/10 px-2 py-2 text-[9px] font-bold text-green-400">IN LOCKER</span>
          </div>
        ) : (
          <button
            onClick={() => run(() => buyItem({ slot: slot === "guns" ? "guns" : "protection", itemId: item.id, payment: pay }), `${item.name} added to your locker.`)}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-2.5 text-[10px] font-black tracking-wider text-slate-950 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 transition-all">
            BUY NOW — {payLabel(item)}
          </button>
        )}
      </div>
    );
  };

  const Category = ({ title, icon, list, slot, owned, bundle }: { title: string; icon: string; list: ArmouryItem[]; slot: "guns" | "protection"; owned: string[]; bundle: typeof GUN_BUNDLE }) => {
    const missing = list.filter((x) => !owned.includes(x.id));
    const complete = missing.length === 0;
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-base font-black tracking-wide text-white">{title}</h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400">{owned.length}/{list.length} owned</span>
          </div>
          <div className="flex items-center gap-2">
            <PaymentPicker />
            <button disabled={busy || complete} title={complete ? "Collection complete" : `Buy missing ${list.length - owned.length} items for ${bundlePrice(bundle)}`}
              onClick={() => run(() => buyBundle({ slot: slot === "guns" ? "guns" : "protection", payment: pay }), `Bundle bought — ${missing.length} items added to your locker.`)}
              className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-300 hover:bg-amber-500/20 disabled:opacity-40">
              {complete ? "COMPLETE" : `BUY ALL ${missing.length} — ${bundlePrice(bundle)}`}
            </button>
          </div>
        </div>

        {/* Total purchase cost table */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total purchase cost</div>
          <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
            <span className="text-slate-300">Category: <b className="text-white">{title}</b></span>
            <span className="text-slate-300">Cash <b className="text-green-400">${nf(bundle.cash)}</b></span>
            <span className="text-slate-300">Points <b className="text-amber-300">{nf(bundle.points)}</b></span>
            <span className="text-slate-300">IG Coins <b className="text-purple-300">1</b></span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((item) => <Card key={item.id} item={item} slot={slot} owned={owned.includes(item.id)} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 p-5">
        <div className="pointer-events-none absolute inset-0 scanlines opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-widest text-red-300">🔫 ARMOURY</h1>
            <p className="mt-1 max-w-xl text-xs text-slate-400">
              Licensed firearms and ballistic protection for the discerning professional.
              Everything you buy is stored in your personal locker — equip your best gun and plate before you hit the streets.
            </p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
              <div className="text-sm font-black text-green-400">${nf(player.money ?? 0)}</div>
              <div className="text-[8px] uppercase tracking-wider text-slate-500">Cash</div>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
              <div className="text-sm font-black text-amber-300">{nf(player.points ?? 0)}</div>
              <div className="text-[8px] uppercase tracking-wider text-slate-500">Points</div>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
              <div className="text-sm font-black text-purple-300">{nf(coins)}</div>
              <div className="text-[8px] uppercase tracking-wider text-slate-500">IG Coins</div>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${msg.ok ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {msg.ok ? <Check className="mt-0.5 size-4 shrink-0" /> : <X className="mt-0.5 size-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Category title="Available Gun" icon="🔫" list={ARMOURY_GUNS} slot="guns" owned={ownedGuns} bundle={GUN_BUNDLE} />
        <Category title="Available Protection" icon="🦺" list={ARMOURY_PROTECTION} slot="protection" owned={ownedProt} bundle={PROT_BUNDLE} />
      </div>

      {/* Locker overview */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2">
            <Crosshair className="size-4 text-red-400" />
            <h3 className="text-xs font-black tracking-wider text-red-300">YOUR LOCKER — GUNS</h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ownedGuns.length === 0 ? (
              <span className="py-4 text-[11px] text-slate-600">You do not have any guns</span>
            ) : ownedGuns.map((id) => {
              const g = ARMOURY_GUNS.find((x) => x.id === id);
              if (!g) return null;
              const eq = equipped.guns === id;
              return (
                <span key={id} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${eq ? "border-green-500/50 bg-green-500/10 text-green-300" : "border-slate-700 bg-slate-950 text-slate-300"}`}>
                  {g.icon} {g.name} +{g.power} {eq && <Lock className="size-3 text-green-400" />}
                </span>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-sky-400" />
            <h3 className="text-xs font-black tracking-wider text-sky-300">YOUR LOCKER — PROTECTION</h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ownedProt.length === 0 ? (
              <span className="py-4 text-[11px] text-slate-600">You do not have any protection</span>
            ) : ownedProt.map((id) => {
              const p = ARMOURY_PROTECTION.find((x) => x.id === id);
              if (!p) return null;
              const eq = equipped.protection === id;
              return (
                <span key={id} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${eq ? "border-green-500/50 bg-green-500/10 text-green-300" : "border-slate-700 bg-slate-950 text-slate-300"}`}>
                  {p.icon} {p.name} +{p.power} {eq && <Lock className="size-3 text-green-400" />}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-600">
        Your equipped gun adds <b className="text-red-400">⚔️ attack</b> and your equipped protection adds <b className="text-sky-400">🛡️ defense</b> to your combat power. Upgrade regularly — the streets only get meaner.
      </p>
    </div>
  );
}

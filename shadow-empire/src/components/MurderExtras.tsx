import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skull, Target, Factory, Search, Crosshair } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

function ResultBanner({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`rounded-xl border p-3 text-center text-xs font-bold ${ok ? "border-green-500/30 bg-green-950/30 text-green-400" : "border-red-500/30 bg-red-950/30 text-red-400"}`}>
      {text}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ASSASSINATE — professional hits with weapon + style planning
// ═══════════════════════════════════════════════════════════
export function AssassinatePage() {
  const player = useQuery(api.game.getPlayer);
  const weapons = useQuery(api.hitSystem.getWeapons);
  const styles = useQuery(api.hitSystem.getHitStyles);
  const targets = useQuery(api.hitSystem.getTargets);
  const killFeed = useQuery(api.hitSystem.getKillFeed);
  const executeHit = useMutation(api.hitSystem.executeHit);

  const [weaponId, setWeaponId] = useState("pistol");
  const [styleId, setStyleId] = useState("ambush");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !weapons || !styles || !targets) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Preparing the contract…</div>;

  const weapon = weapons.find((w: any) => w.id === weaponId) ?? weapons[0];
  const style = styles.find((s: any) => s.id === styleId) ?? styles[0];
  const filtered = targets.filter((t: any) => (t.nickname || "").toLowerCase().includes(search.toLowerCase())).slice(0, 25);
  const target = targets.find((t: any) => t._id === targetId);

  // Estimated success: weapon base + style bonus, damped by target defense
  const defDamp = target ? Math.min(0.2, (target.defense ?? 10) / 500) : 0;
  const estChance = Math.max(0.05, Math.min(0.95, weapon.successBase + style.bonusSuccess - defDamp));
  const totalCost = weapon.cost + style.bonusCost;

  const run = async () => {
    if (!targetId || busy) return;
    setBusy(true); setMsg(null);
    try {
      const r: any = await executeHit({ targetId: targetId as any, weaponId, hitStyleId: styleId });
      setMsg({ ok: !!r.success, text: r.success ? `💀 Target eliminated! +$${nf(r.cashStolen ?? 0)} · +${r.xpEarned ?? 0} XP` : r.error || "💀 The hit failed…" });
    } catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Hit failed" }); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Skull className="size-7 text-red-400" />
        <h2 className="text-2xl font-black text-red-300">Assassinate</h2>
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">CONTRACT KILLINGS</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⚔️ Attack</div><div className="text-sm font-black text-red-400">{player.attack ?? 10}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🔫 Bullets</div><div className="text-sm font-black text-orange-400">{nf(player.bullets ?? 0)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💀 Kills</div><div className="text-sm font-black text-purple-400">{player.totalKills ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💰 Cash</div><div className="text-sm font-black text-green-400">${nf(player.money ?? 0)}</div></div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Loadout */}
        <div className="mafia-card space-y-3 rounded-xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🗡️ Loadout</div>
          <div>
            <div className="mb-1 text-[10px] font-bold text-slate-500">WEAPON</div>
            <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
              {weapons.map((w: any) => (
                <button key={w.id} onClick={() => setWeaponId(w.id)}
                  className={`rounded-lg p-2 text-left text-[10px] transition ${weaponId === w.id ? "border border-red-500/40 bg-red-950/40" : "border border-transparent bg-slate-900/50 hover:bg-slate-800/50"}`}>
                  <div className="font-bold text-white">{w.icon} {w.name}</div>
                  <div className="text-slate-500">DMG {w.damage} · {w.cost > 0 ? `$${nf(w.cost)}` : "Free"}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-bold text-slate-500">HIT STYLE</div>
            <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
              {styles.map((s: any) => (
                <button key={s.id} onClick={() => setStyleId(s.id)}
                  className={`rounded-lg p-2 text-left text-[10px] transition ${styleId === s.id ? "border border-red-500/40 bg-red-950/40" : "border border-transparent bg-slate-900/50 hover:bg-slate-800/50"}`}>
                  <div className="font-bold text-white">{s.icon} {s.name}</div>
                  <div className="text-slate-500">+{(s.bonusSuccess * 100).toFixed(0)}% · {s.bonusCost > 0 ? `$${nf(s.bonusCost)}` : "Free"}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target + execute */}
        <div className="mafia-card space-y-3 rounded-xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🎯 Select Target</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…" className="w-full rounded-lg border border-red-500/20 bg-black/30 px-3 py-2 text-xs" />
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {filtered.map((t: any) => (
              <div key={t._id} onClick={() => setTargetId(t._id)}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition ${targetId === t._id ? "border border-red-500/40 bg-red-950/30" : "border border-transparent hover:bg-white/5"}`}>
                <span className="font-bold">{t.nickname} <span className="text-slate-500">Lv.{t.level}{t.isOnline ? " 🟢" : ""}</span></span>
                <span className="text-[10px] text-slate-500">ATK {t.attack} · DEF {t.defense}</span>
              </div>
            ))}
          </div>
          {target && (
            <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-3">
              <div className="mb-2 text-xs font-bold text-white">Contract: {target.nickname}</div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                <div>Est. success: <span className="font-black text-green-400">{(estChance * 100).toFixed(0)}%</span></div>
                <div>Damage: <span className="font-black text-orange-400">{weapon.damage}</span></div>
                <div>Total cost: <span className="font-black text-yellow-400">${nf(totalCost)}</span></div>
              </div>
              <button onClick={run} disabled={busy || (player.money ?? 0) < totalCost}
                className="mt-3 w-full rounded-xl bg-red-600 py-2.5 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-50">
                {busy ? "Executing…" : `💀 EXECUTE HIT — $${nf(totalCost)}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kill feed */}
      {killFeed && killFeed.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">💀 Recent Kills</div>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {killFeed.slice(0, 10).map((k: any, i: number) => (
              <div key={i} className="rounded-lg bg-slate-900/50 p-2 text-[10px] text-slate-400">{k.message ?? JSON.stringify(k)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BULLET CALCULATOR — plan hits before you pull the trigger
// ═══════════════════════════════════════════════════════════
const CALC_WEAPONS = [
  { id: "fists", name: "Bare Fists", dmg: 10, base: 0.40, cost: 0 },
  { id: "knife", name: "Combat Knife", dmg: 20, base: 0.55, cost: 5000 },
  { id: "bat", name: "Steel Bat", dmg: 25, base: 0.50, cost: 8000 },
  { id: "pistol", name: "9mm Pistol", dmg: 35, base: 0.65, cost: 25000 },
  { id: "shotgun", name: "Pump Shotgun", dmg: 50, base: 0.60, cost: 45000 },
  { id: "sniper", name: "Sniper Rifle", dmg: 60, base: 0.70, cost: 80000 },
  { id: "rifle", name: "Assault Rifle", dmg: 45, base: 0.68, cost: 60000 },
  { id: "explosive", name: "C4 Explosive", dmg: 80, base: 0.75, cost: 150000 },
  { id: "poison", name: "Lethal Poison", dmg: 40, base: 0.80, cost: 35000 },
  { id: "silencer", name: "Suppressed", dmg: 30, base: 0.78, cost: 50000 },
  { id: "minigun", name: "Minigun", dmg: 100, base: 0.85, cost: 500000 },
];
const CALC_STYLES = [
  { id: "ambush", name: "Ambush", bonus: 0.15, cost: 0 },
  { id: "driveby", name: "Drive-By", bonus: 0.05, cost: 5000 },
  { id: "snipe", name: "Snipe", bonus: 0.25, cost: 10000 },
  { id: "poison", name: "Poisoned Drink", bonus: 0.30, cost: 15000 },
  { id: "car_bomb", name: "Car Bomb", bonus: 0.20, cost: 25000 },
  { id: "stealth", name: "Stealth", bonus: 0.20, cost: 8000 },
  { id: "contract", name: "Contract", bonus: 0.35, cost: 50000 },
  { id: "ninja", name: "Ninja", bonus: 0.40, cost: 20000 },
];

export function BulletCalculatorPage() {
  const [weaponId, setWeaponId] = useState("pistol");
  const [styleId, setStyleId] = useState("ambush");
  const [targetDef, setTargetDef] = useState(20);
  const [targetLife, setTargetLife] = useState(100);
  const [atk, setAtk] = useState(30);

  const weapon = CALC_WEAPONS.find((w) => w.id === weaponId)!;
  const style = CALC_STYLES.find((s) => s.id === styleId)!;

  const defDamp = Math.min(0.2, targetDef / 500);
  const atkBonus = Math.min(0.15, atk / 600);
  const success = Math.max(0.05, Math.min(0.95, weapon.base + style.bonus + atkBonus - defDamp));
  const dmgDealt = Math.round(weapon.dmg * (1 + atk / 100));
  const kills = Math.max(1, Math.ceil(targetLife / Math.max(1, dmgDealt)));
  const totalCost = weapon.cost + style.cost;
  const evKills = kills / success;
  const costPerKill = Math.round(totalCost * evKills);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Crosshair className="size-7 text-orange-400" />
        <h2 className="text-2xl font-black text-orange-300">Bullet Calculator</h2>
        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-black text-orange-400">PLAN BEFORE YOU SHOOT</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="mafia-card space-y-3 rounded-xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">Your Loadout</div>
          <div>
            <div className="mb-1 text-[10px] font-bold text-slate-500">WEAPON</div>
            <select value={weaponId} onChange={(e) => setWeaponId(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs">
              {CALC_WEAPONS.map((w) => <option key={w.id} value={w.id}>{(w as any).icon} {w.name} — DMG {w.dmg} · ${nf(w.cost)}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-bold text-slate-500">HIT STYLE</div>
            <select value={styleId} onChange={(e) => setStyleId(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs">
              {CALC_STYLES.map((s) => <option key={s.id} value={s.id}>{s.name} — +{(s.bonus * 100).toFixed(0)}% · ${nf(s.cost)}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>YOUR ATTACK</span><span className="text-orange-400">{atk}</span></div>
            <input type="range" min={10} max={300} value={atk} onChange={(e) => setAtk(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="mafia-card space-y-3 rounded-xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">Target Profile</div>
          <div>
            <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>TARGET DEFENSE</span><span className="text-blue-400">{targetDef}</span></div>
            <input type="range" min={10} max={300} value={targetDef} onChange={(e) => setTargetDef(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>TARGET LIFE</span><span className="text-red-400">{targetLife}</span></div>
            <input type="range" min={50} max={1000} value={targetLife} onChange={(e) => setTargetLife(Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-[10px] uppercase text-slate-500">Success Chance</div>
          <div className={`text-2xl font-black ${success > 0.6 ? "text-green-400" : success > 0.35 ? "text-yellow-400" : "text-red-400"}`}>{(success * 100).toFixed(0)}%</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-[10px] uppercase text-slate-500">Damage / Shot</div>
          <div className="text-2xl font-black text-orange-400">{dmgDealt}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-[10px] uppercase text-slate-500">Shots Needed</div>
          <div className="text-2xl font-black text-blue-400">{kills}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-[10px] uppercase text-slate-500">Exp. Cost / Kill</div>
          <div className="text-2xl font-black text-yellow-400">${nf(costPerKill)}</div>
        </div>
      </div>

      <div className="mafia-card rounded-xl p-3 text-[10px] leading-relaxed text-slate-500">
        Estimates include your attack bonus (+{(atkBonus * 100).toFixed(1)}%) and the target's defense penalty (−{(defDamp * 100).toFixed(1)}%).
        Expected cost per kill assumes an average of {(evKills).toFixed(1)} attempts before success.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BULLET FACTORY — craft ammunition from lead + cash
// ═══════════════════════════════════════════════════════════
export function BulletFactoryPage() {
  const player = useQuery(api.game.getPlayer);
  const state = useQuery(api.crimeExtras.getBulletFactoryState);
  const buyLead = useMutation(api.crimeExtras.buyLead);
  const craft = useMutation(api.crimeExtras.craftBullets);
  const upgrade = useMutation(api.crimeExtras.upgradeBulletFactory);

  const [qty, setQty] = useState(100);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !state) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Firing up the factory…</div>;

  const run = async (fn: () => Promise<any>, okText: string) => {
    setBusy(true); setMsg(null);
    try { const r = await fn(); setMsg({ ok: true, text: okText.replace("{r}", JSON.stringify(r)) }); }
    catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Action failed" }); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Factory className="size-7 text-amber-400" />
        <h2 className="text-2xl font-black text-amber-300">Bullet Factory</h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-400">LEVEL {state.factoryLevel}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🔫 Bullets</div><div className="text-lg font-black text-orange-400">{nf(state.bullets)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⛏️ Lead</div><div className="text-lg font-black text-slate-300">{nf(state.lead)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🏭 Crafted</div><div className="text-lg font-black text-amber-400">{nf(state.totalCrafted)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💵 Cash</div><div className="text-lg font-black text-green-400">${nf(player.money ?? 0)}</div></div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="mafia-card space-y-3 rounded-xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🛒 Buy Lead — $75/unit</div>
          <div className="flex gap-2">
            {[100, 500, 1000, 5000].map((q) => (
              <button key={q} onClick={() => run(() => buyLead({ qty: q }), `Purchased ${nf(q)} lead for $${nf(q * 75)}`)} disabled={busy}
                className="flex-1 rounded-lg bg-slate-800 py-2 text-[10px] font-black text-slate-300 transition hover:bg-slate-700 disabled:opacity-50">
                +{nf(q)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs" />
            <button onClick={() => run(() => buyLead({ qty }), `Lead order placed`)} disabled={busy}
              className="flex-1 rounded-lg bg-amber-600 py-1.5 text-xs font-black text-white hover:bg-amber-700 disabled:opacity-50">BUY LEAD</button>
          </div>
        </div>

        <div className="mafia-card space-y-3 rounded-xl p-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">🏭 Craft — {state.leadPerBullet} lead + ${nf(state.cashPerBullet)} / bullet</div>
          <div className="flex gap-2">
            {[50, 100, 500].map((q) => (
              <button key={q} onClick={() => run(() => craft({ qty: q }), `Crafted ${nf(q)} bullets`)} disabled={busy}
                className="flex-1 rounded-lg bg-slate-800 py-2 text-[10px] font-black text-slate-300 transition hover:bg-slate-700 disabled:opacity-50">
                {nf(q)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs" />
            <button onClick={() => run(() => craft({ qty }), `Bullets rolling off the line`)} disabled={busy}
              className="flex-1 rounded-lg bg-orange-600 py-1.5 text-xs font-black text-white hover:bg-orange-700 disabled:opacity-50">CRAFT BULLETS</button>
          </div>
        </div>
      </div>

      <div className="mafia-card flex items-center justify-between rounded-xl p-4">
        <div>
          <div className="text-xs font-black text-white">Upgrade Factory → Level {state.factoryLevel + 1}</div>
          <div className="text-[10px] text-slate-500">Cheaper crafting: {Math.max(1, 3 - Math.floor((state.factoryLevel + 1) / 2))} lead + ${nf(Math.max(50, 250 - state.factoryLevel * 25))} per bullet</div>
        </div>
        <button onClick={() => run(() => upgrade({}), `Factory upgraded to level ${state.factoryLevel + 1}`)} disabled={busy || (player.money ?? 0) < state.upgradeCost}
          className="rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white hover:bg-green-700 disabled:opacity-50">
          ${nf(state.upgradeCost)}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DETECTIVES — hire investigators to profile a rival
// ═══════════════════════════════════════════════════════════
export function DetectivesPage() {
  const players = useQuery(api.statistics.getPlayerDirectory, { limit: 200 });
  const state = useQuery(api.crimeExtras.getDetectiveState);
  const hire = useMutation(api.crimeExtras.hireDetective);

  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  if (!players || !state) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Calling the agency…</div>;

  const candidates = players
    .filter((p: any) => (p.nickname || "").toLowerCase().includes(search.toLowerCase()))
    .slice(0, 20);

  const run = async (targetId: string) => {
    setBusy(true); setResult(null);
    try {
      const r = await hire({ targetId: targetId as any });
      setResult(r.found
        ? { ok: true, text: `🕵️ Intel gathered: ${r.intel.join(" · ")}` }
        : { ok: false, text: "🕳️ The trail went cold — no usable intel this time." });
    } catch (e: any) { setResult({ ok: false, text: e?.message ?? "Investigation failed" }); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Search className="size-7 text-blue-400" />
        <h2 className="text-2xl font-black text-blue-300">Detectives</h2>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-black text-blue-400">$15,000 PER INVESTIGATION</span>
      </div>

      {result && <ResultBanner ok={result.ok} text={result.text} />}

      <div className="mafia-card space-y-3 rounded-xl p-4">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400">Pick someone to investigate</div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…" className="w-full rounded-lg border border-blue-500/20 bg-black/30 px-3 py-2 text-xs" />
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {candidates.map((p: any) => (
            <div key={p._id} className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
              <div className="text-xs">
                <span className="font-bold text-white">{p.nickname || "Unknown"}</span>
                <span className="ml-2 text-slate-500">Lv.{p.level} · 📍 {p.location ?? "?"}</span>
              </div>
              <button onClick={() => run(p._id)} disabled={busy}
                className="rounded-lg bg-blue-600 px-3 py-1 text-[10px] font-black text-white hover:bg-blue-700 disabled:opacity-50">INVESTIGATE</button>
            </div>
          ))}
        </div>
      </div>

      {state.cases && state.cases.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">📁 Case Files ({state.detectivesHired} hired all-time)</div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {state.cases.map((c: any) => (
              <div key={c._id} className={`rounded-lg border p-2 text-[10px] ${c.result === "intel" ? "border-green-500/20 bg-green-950/20" : "border-slate-700/40 bg-slate-900/40"}`}>
                <div className="font-black text-white">{c.result === "intel" ? "✅" : "❌"} {c.targetName}</div>
                {c.intel?.length > 0 && <div className="text-slate-400">{c.intel.join(" · ")}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHOOTING RANGE — convert bullets + cash into accuracy
// ═══════════════════════════════════════════════════════════
export function ShootingRangePage() {
  const player = useQuery(api.game.getPlayer);
  const state = useQuery(api.crimeExtras.getRangeState);
  const drill = useMutation(api.crimeExtras.runRangeDrill);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !state) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Loading the range…</div>;

  const run = async (drillId: string) => {
    setBusy(true); setMsg(null);
    try {
      const r = await drill({ drill: drillId });
      setMsg({ ok: true, text: `🎯 ${r.bullseye ? "BULLSEYE! " : ""}+${r.accGain} accuracy (${r.accuracy}/100)${r.attackUp ? " · ⚔️ +1 ATK" : ""} · ${r.shotsFired} rounds downrange` });
    } catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Drill failed" }); }
    setBusy(false);
  };

  const drills = [
    { id: "target_practice", name: "Target Practice", icon: "🎯", bullets: 10, cost: 1000, desc: "Static paper targets. Cheap warm-up, small accuracy gain." },
    { id: "moving_targets", name: "Moving Targets", icon: "🏃", bullets: 25, cost: 5000, desc: "Runners on rails. Expensive, but accuracy climbs fast." },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Crosshair className="size-7 text-cyan-400" />
        <h2 className="text-2xl font-black text-cyan-300">Shooting Range</h2>
        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black text-cyan-400">ACCURACY {state.accuracy}/100</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🎯 Accuracy</div><div className="text-lg font-black text-cyan-400">{state.accuracy}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🔫 Bullets</div><div className="text-lg font-black text-orange-400">{nf(state.bullets)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⚔️ Attack</div><div className="text-lg font-black text-red-400">{player.attack ?? 10}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">📤 Rounds Fired</div><div className="text-lg font-black text-slate-300">{nf(state.totalShots)}</div></div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="grid gap-3 md:grid-cols-2">
        {drills.map((d) => (
          <div key={d.id} className="mafia-card rounded-xl p-4">
            <div className="mb-1 flex items-center gap-2"><span className="text-2xl">{d.icon}</span><span className="text-sm font-black text-white">{d.name}</span></div>
            <p className="mb-3 text-[10px] text-slate-500">{d.desc}</p>
            <div className="mb-3 flex gap-3 text-[10px] text-slate-400">
              <span>🔫 {d.bullets} bullets</span>
              <span>💵 ${nf(d.cost)}</span>
            </div>
            <button onClick={() => run(d.id)} disabled={busy || state.bullets < d.bullets || (player.money ?? 0) < d.cost}
              className="w-full rounded-xl bg-cyan-600 py-2 text-xs font-black text-white hover:bg-cyan-700 disabled:opacity-50">
              {busy ? "Shooting…" : "RUN DRILL"}
            </button>
          </div>
        ))}
      </div>

      <div className="mafia-card rounded-xl p-3 text-[10px] text-slate-500">
        💡 Accuracy feeds directly into hit success chance on the Assassinate page. Every 10 accuracy = Accuracy Level {state.accuracyLevel + 1}.
      </div>
    </div>
  );
}

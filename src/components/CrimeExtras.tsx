import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trophy, Flame, Hammer, Vault, Package } from "lucide-react";

const nf = (n: number) => Math.floor(n).toLocaleString();

function ResultBanner({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`rounded-xl border p-3 text-center text-xs font-bold ${ok ? "border-green-500/30 bg-green-950/30 text-green-400" : "border-red-500/30 bg-red-950/30 text-red-400"}`}>
      {text}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BOXING / GYM — trade energy for attack & defense
// ═══════════════════════════════════════════════════════════
export function BoxingGymPage() {
  const player = useQuery(api.game.getPlayer);
  const train = useMutation(api.crimeExtras.trainGym);

  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Chalking up…</div>;

  const energy = (player as any).energy ?? 100;
  const lvl = player.level ?? 1;
  const intelPct = Math.floor(lvl / 5);
  const teamPct = intelPct * 2;

  const run = async (stat: "attack" | "defense") => {
    setBusy(stat); setMsg(null);
    try {
      const r: any = await train({ stat });
      setMsg({ ok: true, text: `🥊 ${stat === "attack" ? "Attack" : "Defense"} +${r.gain} · ⭐ +${r.intelBonusPct ? Math.floor(5 * (1 + r.intelBonusPct / 100)) : 5} XP (🧠 +${r.intelBonusPct ?? 0}%) · 💰 +$${nf(r.wage ?? 0)} wage${r.levelUp ? " · 🌟 LEVEL UP!" : ""} · −10 energy` });
    } catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Training failed" }); }
    setBusy(null);
  };

  const programs = [
    { stat: "attack" as const, icon: "🥊", name: "Heavy Bag & Sparring", desc: "Shadow-box, hit the bag, spar a partner. Raw punching power." },
    { stat: "defense" as const, icon: "🛡️", name: "Footwork & Blocking", desc: "Slip rope, head movement, guard drills. Take a beating and keep standing." },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Trophy className="size-7 text-yellow-400" />
        <h2 className="text-2xl font-black text-yellow-300">Boxing / Gym</h2>
        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[9px] font-black text-yellow-400">TRAIN · SWEAT · REPEAT</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⚔️ Attack</div><div className="text-lg font-black text-red-400">{player.attack ?? 10}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🛡️ Defense</div><div className="text-lg font-black text-blue-400">{player.defense ?? 10}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⚡ Energy</div><div className="text-lg font-black text-green-400">{energy}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⭐ Level</div><div className="text-lg font-black text-amber-400">{player.level ?? 1}</div></div>
      </div>

      {/* INTELLIGENCE — your current advantage */}
      <div className="mafia-card rounded-xl border-violet-500/25 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-sm font-black uppercase tracking-[0.14em] text-violet-300">Intelligence</span>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-black text-violet-300">YOUR CURRENT ADVANTAGE</span>
          </div>
          <span className="text-2xl font-black text-violet-200 tabular-nums">+{intelPct}%</span>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-violet-300/75">
          The calculated bonus percentage increases by <span className="font-black text-violet-200">1% every 5 levels</span>, providing more XP and cash bonuses for all training — including team training, which offers superior percentage-based benefits.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-2 text-center">
            <div className="text-[9px] font-bold text-sky-300/70">👤 PERSONAL TRAINING</div>
            <div className="text-base font-black text-sky-200 tabular-nums">+{intelPct}% XP · cash</div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2 text-center">
            <div className="text-[9px] font-bold text-emerald-300/70">👥 TEAM TRAINING</div>
            <div className="text-base font-black text-emerald-200 tabular-nums">+{teamPct}% XP · cash</div>
          </div>
        </div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="grid gap-3 md:grid-cols-2">
        {programs.map((p) => (
          <div key={p.stat} className="mafia-card rounded-xl p-5">
            <div className="mb-1 flex items-center gap-2"><span className="text-3xl">{p.icon}</span><span className="text-sm font-black text-white">{p.name}</span></div>
            <p className="mb-4 text-[10px] text-slate-500">{p.desc}</p>
            <div className="mb-4 flex gap-3 text-[10px] text-slate-400">
              <span>⚡ 10 energy</span><span>⭐ +5 XP <span className="text-violet-300">(+🧠{intelPct}%)</span></span><span>💰 wage <span className="text-violet-300">(+🧠{intelPct}%)</span></span><span className="text-green-400">+1–2 {p.stat}</span>
            </div>
            <button onClick={() => run(p.stat)} disabled={busy !== null || energy < 10}
              className="w-full rounded-xl bg-yellow-600 py-2.5 text-xs font-black text-slate-950 transition hover:bg-yellow-500 disabled:opacity-50">
              {busy === p.stat ? "Training…" : "TRAIN NOW"}
            </button>
          </div>
        ))}
      </div>

      <div className="mafia-card rounded-xl p-3 text-[10px] text-slate-500">
        💡 Gym stats stack on top of gear bonuses and directly raise your murder & fight success. Energy regenerates over time — pace your sessions. 🧠 Intelligence boosts all training payouts, and <span className="font-bold text-emerald-400">team training (Street Trainer coaches) earns double the intelligence bonus</span>.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// POLICE CHASE — stake dirty cash, outrun the law
// ═══════════════════════════════════════════════════════════
export function ChasePage() {
  const player = useQuery(api.game.getPlayer);
  const chase = useMutation(api.crimeExtras.policeChase);

  const [stake, setStake] = useState(10000);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Starting the engine…</div>;

  const money = player.money ?? 0;
  const clampStake = (v: number) => Math.max(0, Math.min(v, money));
  const escapeChance = Math.max(0.35, 0.75 - (stake / 2_000_000) * 0.4);

  const run = async () => {
    setBusy(true); setMsg(null);
    try {
      const r: any = await chase({ stake });
      setMsg(r.escaped
        ? { ok: true, text: `🚗 LOST THEM! Shook the cops and fenced the goods — +$${nf(r.payout)} · 🔴 +${r.wantedGained} wanted` }
        : { ok: false, text: (r.jailTime ?? 0) > 0 ? `🚔 BUSTED! Lost $${nf(r.lost)} and got locked up.` : `🚔 BUSTED! The cops seized $${nf(r.lost)}.` });
    } catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Chase failed" }); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Flame className="size-7 text-red-400" />
        <h2 className="text-2xl font-black text-red-300">Chase</h2>
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black text-red-400">OUTRUN THE LAW</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💰 Cash</div><div className="text-lg font-black text-green-400">${nf(money)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🔴 Wanted</div><div className="text-lg font-black text-red-400">{player.wantedLevel ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🏁 Chases Won</div><div className="text-lg font-black text-cyan-400">{(player as any).chasesWon ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🚔 Chases Lost</div><div className="text-lg font-black text-orange-400">{(player as any).chasesLost ?? 0}</div></div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="mafia-card space-y-4 rounded-xl p-5">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400">Your Stake</div>
        <p className="text-[10px] text-slate-500">Throw cash on the line and run. Bigger stakes mean richer fences — and more patrol units on your tail.</p>
        <div className="flex flex-wrap gap-2">
          {[10000, 50000, 250000, 1000000].map((v) => (
            <button key={v} onClick={() => setStake(v)}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition ${stake === v ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              ${nf(v)}
            </button>
          ))}
          <input type="number" min={0} max={money} value={stake} onChange={(e) => setStake(clampStake(Number(e.target.value)))}
            className="w-32 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span>ESCAPE ODDS</span><span className={escapeChance > 0.55 ? "text-green-400" : "text-red-400"}>{(escapeChance * 100).toFixed(0)}%</span></div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 transition-all" style={{ width: `${escapeChance * 100}%` }} />
          </div>
          <div className="mt-1 text-[9px] text-slate-600">Payout if you escape: 1.5×–3× your stake · 🚔 40% bust chance includes jail time</div>
        </div>
        <button onClick={run} disabled={busy || stake <= 0 || money < stake}
          className="w-full rounded-xl bg-gradient-to-r from-red-700 to-orange-600 py-3 text-sm font-black text-white transition hover:from-red-600 hover:to-orange-500 disabled:opacity-50">
          {busy ? "RUNNING…" : `🚗 HIT THE GAS — $${nf(stake)} ON THE LINE`}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCRAPYARD — buy wrecks, strip them for scrap & rare parts
// ═══════════════════════════════════════════════════════════
export function ScrapyardPage() {
  const player = useQuery(api.game.getPlayer);
  const state = useQuery(api.crimeExtras.getScrapyardState);
  const buyWreck = useMutation(api.crimeExtras.buyWreck);
  const sell = useMutation(api.crimeExtras.sellScrap);

  const [qty, setQty] = useState(100);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !state) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Dragging wrecks in…</div>;

  const run = async (fn: () => Promise<any>, okText: string) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ ok: true, text: okText }); }
    catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Scrapyard failed" }); }
    setBusy(false);
  };

  const tiers = [
    { id: "sedan", name: "Rusted Sedan", icon: "🚙", cost: 5000, yield: "10–30", rare: "5%" },
    { id: "suv", name: "Wrecked SUV", icon: "🚐", cost: 25000, yield: "30–80", rare: "12%" },
    { id: "luxury", name: "Crashed Luxury", icon: "🚘", cost: 100000, yield: "80–200", rare: "25%" },
    { id: "exotic", name: "Totaled Exotic", icon: "🏎️", cost: 500000, yield: "200–500", rare: "45%" },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Hammer className="size-7 text-orange-400" />
        <h2 className="text-2xl font-black text-orange-300">Scrapyard</h2>
        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-black text-orange-400">STRIP · SALVAGE · SELL</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">⚙️ Scrap Metal</div><div className="text-lg font-black text-slate-300">{nf(state.scrap)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💎 Rare Parts</div><div className="text-lg font-black text-purple-400">{nf(state.rareParts)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🚗 Wrecks Stripped</div><div className="text-lg font-black text-orange-400">{(player as any).wrecksStripped ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💵 Cash</div><div className="text-lg font-black text-green-400">${nf(player.money ?? 0)}</div></div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => (
          <div key={t.id} className="mafia-card rounded-xl p-4 text-center">
            <div className="text-3xl">{t.icon}</div>
            <div className="mt-1 text-xs font-black text-white">{t.name}</div>
            <div className="mt-1 text-[10px] text-slate-500">⚙️ {t.yield} scrap · 💎 {t.rare} rare part</div>
            <button onClick={() => run(() => buyWreck({ tier: t.id }), `Stripped a ${t.name}!`)} disabled={busy || (player.money ?? 0) < t.cost}
              className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-[10px] font-black text-white hover:bg-orange-700 disabled:opacity-50">
              ${nf(t.cost)}
            </button>
          </div>
        ))}
      </div>

      <div className="mafia-card space-y-3 rounded-xl p-4">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400">💵 Sell Scrap — $350/unit</div>
        <div className="flex flex-wrap items-center gap-2">
          {[50, 100, 500].map((q) => (
            <button key={q} onClick={() => run(() => sell({ qty: q }), `Sold ${nf(q)} scrap for $${nf(q * 350)}`)} disabled={busy || state.scrap < q}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-black text-slate-300 hover:bg-slate-700 disabled:opacity-50">SELL {nf(q)}</button>
          ))}
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs" />
          <button onClick={() => run(() => sell({ qty }), "Scrap sold to the mill")} disabled={busy || state.scrap < qty}
            className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-black text-white hover:bg-green-700 disabled:opacity-50">SELL ALL LISTED</button>
        </div>
        <div className="text-[9px] text-slate-600">💎 Rare parts are hoarded — future updates let you socket them into cars and gear.</div>
      </div>

      {state.wrecks && state.wrecks.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400"><Package className="size-3.5" /> Recent Wrecks</div>
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {[...state.wrecks].reverse().slice(0, 10).map((w: any) => (
              <div key={w._id} className="flex justify-between rounded-lg bg-slate-900/50 p-2 text-[10px]">
                <span className="text-slate-300">{w.name}</span>
                <span className="text-slate-500">⚙️ {w.scrapYield}{w.rareFound ? " · 💎 rare!" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VAULT — off-grid cash storage robbers can't touch
// ═══════════════════════════════════════════════════════════
export function VaultPage() {
  const player = useQuery(api.game.getPlayer);
  const state = useQuery(api.crimeExtras.getVaultState);
  const deposit = useMutation(api.crimeExtras.vaultDeposit);
  const withdraw = useMutation(api.crimeExtras.vaultWithdraw);
  const upgrade = useMutation(api.crimeExtras.upgradeVault);

  const [amount, setAmount] = useState(100000);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!player || !state) return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Spinning the dial…</div>;

  const run = async (fn: () => Promise<any>, okText: string) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ ok: true, text: okText }); }
    catch (e: any) { setMsg({ ok: false, text: e?.message ?? "Vault action failed" }); }
    setBusy(false);
  };

  const usage = Math.min(100, (state.vaulted / state.capacity) * 100);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Vault className="size-7 text-emerald-400" />
        <h2 className="text-2xl font-black text-emerald-300">Vault</h2>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400">LEVEL {state.vaultLevel} · ROBBERY-PROOF</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🏦 In Vault</div><div className="text-lg font-black text-emerald-400">${nf(state.vaulted)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">💰 Cash</div><div className="text-lg font-black text-green-400">${nf(state.money)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">🏛️ Bank</div><div className="text-lg font-black text-blue-400">${nf(state.bank)}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">📦 Capacity</div><div className="text-lg font-black text-slate-300">${nf(state.capacity)}</div></div>
      </div>

      {msg && <ResultBanner ok={msg.ok} text={msg.text} />}

      <div className="mafia-card space-y-3 rounded-xl p-5">
        <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>VAULT CAPACITY USED</span><span className="text-emerald-400">{usage.toFixed(0)}%</span></div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all" style={{ width: `${usage}%` }} />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-36 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs" />
          <button onClick={() => run(() => deposit({ amount }), `Vaulted $${nf(amount)}`)} disabled={busy || state.money < amount}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">DEPOSIT</button>
          <button onClick={() => run(() => withdraw({ amount }), `Withdrew $${nf(amount)}`)} disabled={busy || state.vaulted < amount}
            className="rounded-lg bg-slate-700 px-4 py-1.5 text-xs font-black text-white hover:bg-slate-600 disabled:opacity-50">WITHDRAW</button>
          {[100000, 1000000].map((v) => (
            <button key={v} onClick={() => setAmount(v)} className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] font-black text-slate-400 hover:bg-slate-700">${nf(v)}</button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3">
          <div>
            <div className="text-xs font-black text-white">Reinforce Vault → Level {state.vaultLevel + 1}</div>
            <div className="text-[10px] text-slate-500">New capacity: ${nf(1_000_000 * (state.vaultLevel + 1))}</div>
          </div>
          <button onClick={() => run(() => upgrade({}), `Vault upgraded to level ${state.vaultLevel + 1}`)} disabled={busy || state.money < state.upgradeCost}
            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white hover:bg-green-700 disabled:opacity-50">${nf(state.upgradeCost)}</button>
        </div>

        <div className="text-[10px] leading-relaxed text-slate-500">
          🔒 Vaulted cash is invisible to robbers, busts, and audits — but it doesn't earn interest like the bank. Balance your risk.
        </div>
      </div>
    </div>
  );
}

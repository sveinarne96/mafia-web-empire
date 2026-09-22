import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, Btn, Stat, PageHead, fmt } from "./NewEmpirePages";

// =====================================================================
// CONSOLIDATED HUB PAGES
// Each hub folds a cluster of thin/placeholder pages into one tabbed
// destination. Every tab is wired to a real Convex query or mutation —
// no dead buttons, no fake numbers.
// =====================================================================

const big = (x: unknown) => {
  const v = typeof x === "number" && Number.isFinite(x) ? x : 0;
  const s = v < 0 ? "-" : "";
  const a = Math.abs(v);
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(1)}K`;
  return `${s}$${a.toLocaleString()}`;
};

type TabDef = { id: string; label: string; icon: string };

function HubShell({
  icon,
  title,
  sub,
  tabs,
  active,
  onChange,
  children,
}: {
  icon: string;
  title: string;
  sub?: string;
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-amber-900/30 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-800/40 p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,160,40,0.12),transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <span className="text-4xl drop-shadow">{icon}</span>
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-700/40 bg-slate-900/50 p-1.5">
        {tabs.map((tb) => {
          const on = tb.id === active;
          return (
            <button
              key={tb.id}
              onClick={() => onChange(tb.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                on
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
              }`}
            >
              <span>{tb.icon}</span>
              <span className="hidden sm:inline">{tb.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Empty({ icon = "📭", text }: { icon?: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700/60 bg-slate-900/30 py-8 text-center">
      <div className="mb-2 text-3xl opacity-60">{icon}</div>
      <div className="text-xs text-slate-500">{text}</div>
    </div>
  );
}

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-800/30 p-3 ${className}`}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary";

function useRun() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const run = async (fn: () => Promise<unknown>, okText = "Done.") => {
    setBusy(true);
    setMsg(null);
    try {
      const res: any = await fn();
      const detail =
        res && typeof res === "object"
          ? Object.entries(res)
              .filter(([, v]) => typeof v === "number" || typeof v === "string" || typeof v === "boolean")
              .slice(0, 4)
              .map(([k, v]) => `${k}: ${typeof v === "number" ? v.toLocaleString() : String(v)}`)
              .join(" · ")
          : "";
      setMsg({ kind: "ok", text: detail || okText });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message || "Something went wrong" });
    }
    setBusy(false);
  };
  return { busy, msg, run, setMsg };
}

function Msg({ msg }: { msg: { kind: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs ${
        msg.kind === "ok"
          ? "border-green-700/50 bg-green-900/20 text-green-300"
          : "border-red-700/50 bg-red-900/20 text-red-300"
      }`}
    >
      {msg.text}
    </div>
  );
}

// =====================================================================
// 1. ARENA HUB — folds 7 placeholder combat pages into one
// =====================================================================
export function ArenaHubPage({ initialTab = "duel" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [stake, setStake] = useState("100000");
  const [bet, setBet] = useState("50000");
  const [reward, setReward] = useState("250000");
  const [contractReward, setContractReward] = useState("500000");
  const [target, setTarget] = useState("");
  const [location, setLocation] = useState("");
  const { busy, msg, run } = useRun();

  const player = useQuery(api.game.getPlayer);
  const duels = useQuery(api.game.getPendingDuels);
  const players = useQuery(api.statistics.getPlayerDirectory, { limit: 200 });
  const matches = useQuery(api.allFeatures.getFightClubMatches);
  const rankings = useQuery(api.allFeatures.getArenaRankings);
  const contracts = useQuery(api.gameFeatures.getOpenContracts);
  const log = useQuery(api.gameFeatures.getCombatLog);
  const ambushes = useQuery(api.gameFeatures.checkAmbush, {
    location: location || (player as any)?.location || "New York",
  });

  const challenge = useMutation(api.game.challengeDuel);
  const accept = useMutation(api.game.acceptDuel);
  const joinClub = useMutation(api.allFeatures.joinFightClub);
  const setAmbush = useMutation(api.gameFeatures.setAmbush);
  const acceptContract = useMutation(api.gameFeatures.acceptContract);
  const postContract = useMutation(api.gameFeatures.postContract);
  const rivalry = useMutation(api.gameFeatures.startRivalry);

  const myDuels = ((duels ?? []) as any[]).filter(
    (d) => d.challengerId === player?._id || d.defenderId === player?._id,
  );
  const others = ((players ?? []) as any[]).filter((p) => p._id !== player?._id);
  const nameOf = (id: string) => ((players ?? []) as any[]).find((p) => p._id === id)?.nickname ?? "Unknown";

  const tabs: TabDef[] = [
    { id: "duel", label: "1v1 Duels", icon: "⚔️" },
    { id: "fightclub", label: "Fight Club", icon: "🥊" },
    { id: "ladder", label: "Ladder", icon: "📊" },
    { id: "contracts", label: "Contracts", icon: "📝" },
    { id: "ambush", label: "Ambush", icon: "🔥" },
    { id: "log", label: "Combat Log", icon: "📜" },
  ];

  return (
    <HubShell
      icon="🏟️"
      title="Arena"
      sub="Every way to settle a score — duels, fight club, contracts and ambushes in one place."
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />

      {tab === "duel" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Issue a Challenge" icon="⚔️">
            <Field label="Opponent">
              <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">Pick a target…</option>
                {others.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nickname ?? "Unknown"} · Lv.{p.level ?? 1} · {big(p.money)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stake ($)">
              <input className={inputCls} value={stake} onChange={(e) => setStake(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Btn
              disabled={busy || !target || !stake}
              onClick={() =>
                run(() => challenge({ targetId: target as any, stake: Number(stake) }), "Challenge sent — stake held in escrow.")
              }
            >
              Send Challenge · {big(Number(stake))}
            </Btn>
            <div className="text-[11px] text-slate-500">
              Winner takes the pot. Your stake is escrowed the moment you challenge.
            </div>
          </Card>

          <Card title="Live Duels" icon="🩸">
            {myDuels.length === 0 ? (
              <Empty icon="⚔️" text="No open duels. Challenge someone or wait for a challenger." />
            ) : (
              <div className="space-y-2">
                {myDuels.map((d: any) => (
                  <Row key={d._id}>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">
                        {d.challengerId === player?._id ? "You" : nameOf(d.challengerId)} vs{" "}
                        {d.defenderId === player?._id ? "You" : nameOf(d.defenderId)}
                      </div>
                      <div className="text-[10px] text-slate-500">Stake {big(d.stake)} · {d.status}</div>
                    </div>
                    {d.defenderId === player?._id && d.status === "pending" && (
                      <Btn disabled={busy} onClick={() => run(() => accept({ duelId: d._id }), "Duel accepted!")}>
                        Accept
                      </Btn>
                    )}
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "fightclub" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Enter the Ring" icon="🥊">
            <Field label="Bet amount ($)">
              <input className={inputCls} value={bet} onChange={(e) => setBet(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Btn disabled={busy} onClick={() => run(() => joinClub({ betAmount: Number(bet) }), "You entered the fight club.")}>
              Join Fight Club · {big(Number(bet))}
            </Btn>
            <div className="text-[11px] text-slate-500">Fights resolve instantly. Bigger bets mean bigger purses and bigger bruises.</div>
          </Card>
          <Card title="Recent Cards" icon="📋">
            {((matches ?? []) as any[]).length === 0 ? (
              <Empty icon="🥊" text="No fights on the card right now." />
            ) : (
              <div className="space-y-2">
                {((matches ?? []) as any[]).slice(0, 12).map((m: any, i: number) => (
                  <Row key={m._id ?? i}>
                    <span className="text-lg">🥊</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">
                        {m.fighter1Name ?? m.fighter1 ?? "Fighter A"} vs {m.fighter2Name ?? m.fighter2 ?? "Fighter B"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Purse {big(m.purse ?? m.betAmount ?? 0)} {m.status ? `· ${m.status}` : ""}
                      </div>
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "ladder" && (
        <Card title="Arena Rankings" icon="📊">
          {((rankings ?? []) as any[]).length === 0 ? (
            <Empty icon="📊" text="The ladder is empty — win a fight to claim your place." />
          ) : (
            <div className="space-y-2">
              {((rankings ?? []) as any[]).slice(0, 25).map((r: any, i: number) => (
                <Row key={r._id ?? i}>
                  <span className={`w-8 text-center text-sm font-black ${i < 3 ? "text-amber-400" : "text-slate-500"}`}>
                    {i + 1}
                  </span>
                  <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-bold">{r.nickname ?? r.name ?? "Unknown"}</div>
                    <div className="text-[10px] text-slate-500">
                      {r.wins ?? 0}W / {r.losses ?? 0}L {r.streak ? `· ${r.streak} streak` : ""}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-400">{fmt(r.rating ?? r.points ?? r.score ?? 0)}</div>
                </Row>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "contracts" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Open Hit Contracts" icon="🎯">
            {((contracts ?? []) as any[]).length === 0 ? (
              <Empty icon="📝" text="No contracts posted. Post one below to put a price on a head." />
            ) : (
              <div className="space-y-2">
                {((contracts ?? []) as any[]).slice(0, 15).map((c: any) => (
                  <Row key={c._id}>
                    <span className="text-lg">🎯</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">{nameOf(c.targetId)}</div>
                      <div className="text-[10px] text-slate-500">Bounty {big(c.reward)} · {c.status}</div>
                    </div>
                    {c.status === "open" && c.posterId !== player?._id && (
                      <Btn disabled={busy} onClick={() => run(() => acceptContract({ contractId: c._id }), "Contract accepted.")}>
                        Take
                      </Btn>
                    )}
                  </Row>
                ))}
              </div>
            )}
          </Card>
          <Card title="Post a Contract" icon="📝">
            <Field label="Target">
              <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">Pick a target…</option>
                {others.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nickname ?? "Unknown"} · Lv.{p.level ?? 1}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bounty ($)">
              <input
                className={inputCls}
                value={contractReward}
                onChange={(e) => setContractReward(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <Btn
              variant="gold"
              disabled={busy || !target}
              onClick={() =>
                run(() => postContract({ targetId: target as any, reward: Number(contractReward) }), "Contract posted.")
              }
            >
              Post Contract · {big(Number(contractReward))}
            </Btn>
            <div className="text-[11px] text-slate-500">Any player can take it. You can also open a rivalry instead:</div>
            <Btn variant="ghost" disabled={busy || !target} onClick={() => run(() => rivalry({ targetId: target as any }), "Rivalry declared.")}>
              Declare Rivalry
            </Btn>
          </Card>
        </div>
      )}

      {tab === "ambush" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Set an Ambush" icon="🔥">
            <Field label="Escrowed reward ($)">
              <input className={inputCls} value={reward} onChange={(e) => setReward(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Btn variant="danger" disabled={busy} onClick={() => run(() => setAmbush({ reward: Number(reward) }), "Ambush is live.")}>
              Lay the Trap · {big(Number(reward))}
            </Btn>
            <div className="text-[11px] text-slate-500">
              Anyone travelling through your location can trip it. The reward comes out of your pocket, so make it count.
            </div>
          </Card>
          <Card title="Scout a Location" icon="🔭">
            <Field label="Location">
              <input
                className={inputCls}
                value={location}
                placeholder={player?.location ?? "New York"}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>
            {((ambushes ?? []) as any[]).length === 0 ? (
              <Empty icon="🍃" text="No ambushes waiting at this location. Travel is safe — for now." />
            ) : (
              <div className="space-y-2">
                {((ambushes ?? []) as any[]).map((a: any, i: number) => (
                  <Row key={a._id ?? i}>
                    <span className="text-lg">🔥</span>
                    <div className="flex-1 text-xs">
                      Trap set by <span className="font-bold">{nameOf(a.ambusherId)}</span>
                    </div>
                    <div className="text-xs font-bold text-red-400">{big(a.reward)}</div>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "log" && (
        <Card title="Combat Log" icon="📜">
          {((log ?? []) as any[]).length === 0 ? (
            <Empty icon="📜" text="No fights recorded yet. Your history will build up here." />
          ) : (
            <div className="space-y-2">
              {((log ?? []) as any[]).slice(0, 30).map((c: any, i: number) => {
                const won = c.winnerId === player?._id;
                return (
                  <Row key={c._id ?? i}>
                    <span className="text-lg">{c.type === "ambush" ? "🔥" : "🥊"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">
                        {nameOf(c.attackerId)} → {nameOf(c.defenderId)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.location ?? "Unknown"} · {c.attackerDamage ?? 0} / {c.defenderDamage ?? 0} dmg
                      </div>
                    </div>
                    {c.moneyStolen ? <div className="text-xs font-bold text-amber-400">{big(c.moneyStolen)}</div> : null}
                    <span className={`text-[10px] font-bold ${won ? "text-green-400" : "text-slate-500"}`}>
                      {c.winnerId === player?._id ? "YOU WON" : ""}
                    </span>
                  </Row>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </HubShell>
  );
}

// =====================================================================
// 2. CHAT HUB — folds Global / Trade / LFG / Crew / Family into channels
// =====================================================================
export function ChatHubPage({ initialChannel = "global" }: { initialChannel?: string }) {
  const [channel, setChannel] = useState(initialChannel);
  const [text, setText] = useState("");
  const { busy, run, msg } = useRun();
  const boxRef = useRef<HTMLDivElement | null>(null);

  const player = useQuery(api.game.getPlayer);
  const messages = useQuery(api.allFeatures.getChatMessages, { channel });
  const online = useQuery(api.allFeatures.getPlayersOnline);
  const send = useMutation(api.allFeatures.sendChatMessage);

  const list = (messages ?? []) as any[];

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [list.length, channel]);

  const channels: TabDef[] = [
    { id: "global", label: "Global", icon: "🌐" },
    { id: "trade", label: "Trade", icon: "💹" },
    { id: "lfg", label: "LFG", icon: "👥" },
    { id: "crew", label: "Crew", icon: "🤝" },
    { id: "family", label: "Family", icon: "👨‍👩‍👦" },
  ];

  const channels2 = useMemo(() => channels, []);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    run(async () => {
      await send({ channel, content: t });
      setText("");
      return { sent: "message posted" };
    });
  };

  return (
    <HubShell
      icon="💬"
      title="Communications"
      sub="One inbox for every channel — global chatter, trades, groups, crew and family."
      tabs={channels2}
      active={channel}
      onChange={setChannel}
    >
      <Msg msg={msg} />
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Card title={`#${channel}`} icon="💬" className="flex flex-col">
          <div ref={boxRef} className="h-[420px] space-y-1.5 overflow-y-auto rounded-lg border border-slate-700/40 bg-slate-950/40 p-3">
            {list.length === 0 ? (
              <Empty icon="💬" text={`No messages in #${channel} yet. Be the first to speak.`} />
            ) : (
              list.map((m: any, i: number) => {
                const mine = m.senderId === player?._id || m.authorId === player?._id;
                const who = m.senderName ?? m.nickname ?? m.author ?? "Unknown";
                return (
                  <div key={m._id ?? i} className="text-xs leading-relaxed">
                    <span className={`font-bold ${mine ? "text-amber-400" : "text-sky-400"}`}>{who}</span>
                    <span className="text-slate-600"> · </span>
                    <span className="text-slate-300">{m.content ?? m.body ?? ""}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className={inputCls}
              value={text}
              placeholder={`Message #${channel}…`}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
            <Btn disabled={busy || !text.trim()} onClick={submit}>
              Send
            </Btn>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Channel Rules" icon="📜">
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div>🌐 <span className="font-bold text-slate-300">Global</span> — everyone, keep it civil.</div>
              <div>💹 <span className="font-bold text-slate-300">Trade</span> — buying, selling, auctions.</div>
              <div>👥 <span className="font-bold text-slate-300">LFG</span> — find a crew for raids and OC.</div>
              <div>🤝 <span className="font-bold text-slate-300">Crew</span> — your crew only.</div>
              <div>👨‍👩‍👦 <span className="font-bold text-slate-300">Family</span> — your family only.</div>
            </div>
          </Card>
          <Card title={`Online Now (${((online ?? []) as any[]).length})`} icon="🟢">
            {((online ?? []) as any[]).length === 0 ? (
              <Empty icon="🟢" text="Nobody online." />
            ) : (
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {((online ?? []) as any[]).slice(0, 40).map((p: any, i: number) => (
                  <div key={p._id ?? i} className="flex items-center gap-2 text-xs">
                    <span className="inline-block size-1.5 rounded-full bg-green-400" />
                    <span className="truncate text-slate-300">{p.nickname ?? p.name ?? "Unknown"}</span>
                    <span className="ml-auto text-[10px] text-slate-500">Lv.{p.level ?? 1}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </HubShell>
  );
}

// =====================================================================
// 3. CRIME OPS HUB — folds 7 placeholder crime pages into real jobs
// =====================================================================
export function CrimeOpsHubPage({ initialTab = "counterfeit" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const { busy, msg, run } = useRun();
  const player = useQuery(api.game.getPlayer);
  const targets = useQuery(api.statistics.getPlayerDirectory, { limit: 200 });
  const market = useQuery(api.underground.getBlackMarketItems);

  const counterfeiting = useMutation(api.underground.counterfeiting);
  const trafficking = useMutation(api.underground.drugTrafficking);
  const arson = useMutation(api.underground.commitArson);
  const identity = useMutation(api.underground.commitIdentityTheft);
  const arms = useMutation(api.underground.commitArmsDeal);
  const tax = useMutation(api.underground.commitTaxEvasion);
  const racket = useMutation(api.underground.runRacketeering);
  const smuggle = useMutation(api.underground.runSmuggling);
  const launder = useMutation(api.underground.launderMoney);

  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [qty, setQty] = useState("10");
  const [targetName, setTargetName] = useState("The Rusty Anchor");
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("50000");
  const [destCity, setDestCity] = useState("Chicago");
  const [contraband, setContraband] = useState("Drugs");

  const others = ((targets ?? []) as any[]).filter((p) => p._id !== player?._id);

  const tabs: TabDef[] = [
    { id: "counterfeit", label: "Counterfeiting", icon: "💵" },
    { id: "launder", label: "Laundering", icon: "🧺" },
    { id: "racket", label: "Racketeering", icon: "💰" },
    { id: "tax", label: "Tax Evasion", icon: "🧾" },
    { id: "arms", label: "Arms Dealing", icon: "🔫" },
    { id: "arson", label: "Arson", icon: "🔥" },
    { id: "identity", label: "Identity Theft", icon: "🪪" },
    { id: "traffic", label: "Trafficking", icon: "📦" },
    { id: "smuggle", label: "Smuggling", icon: "🚢" },
    { id: "market", label: "Black Market", icon: "🖤" },
  ];

  const shellProps = {
    icon: "🕶️",
    title: "Crime Operations",
    sub: "The quiet crimes — paperwork, pressure and payoffs. Each job risks heat and payout.",
    tabs,
    active: tab,
    onChange: setTab,
  };

  const riskNote = (text: string) => <div className="text-[11px] text-slate-500">{text}</div>;

  return (
    <HubShell {...shellProps}>
      <Msg msg={msg} />

      {tab === "counterfeit" && (
        <Card title="Counterfeiting Press" icon="💵">
          <Field label="Print quality">
            <select className={inputCls} value={quality} onChange={(e) => setQuality(e.target.value as any)}>
              <option value="low">Low — cheap plates, high seizure risk</option>
              <option value="medium">Medium — balanced</option>
              <option value="high">High — expensive, near-flawless notes</option>
            </select>
          </Field>
          <Btn disabled={busy} onClick={() => run(() => counterfeiting({ quality }), "Notes are drying.")}>
            Start the Press
          </Btn>
          {riskNote("Better plates cost more up front but the paper passes inspection far more often. Getting caught burns a chunk of your fake run.")}
        </Card>
      )}

      {tab === "launder" && (
        <Card title="Money Laundering" icon="🧺">
          <Field label="Dirty cash to wash ($)">
            <input className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Btn disabled={busy} onClick={() => run(() => launder({ amount: Number(amount) }), "Money is clean.")}>
            Launder {big(Number(amount))}
          </Btn>
          {riskNote("Washed money can be banked without questions. The laundry takes a cut.")}
        </Card>
      )}

      {tab === "racket" && (
        <Card title="Protection Racket" icon="💰">
          <Field label="Business to squeeze">
            <input className={inputCls} value={targetName} onChange={(e) => setTargetName(e.target.value)} />
          </Field>
          <Btn disabled={busy} onClick={() => run(() => racket({ targetBusiness: targetName }), "The owner paid up.")}>
            Collect This Week
          </Btn>
          {riskNote("Steady income, low heat — but squeeze too hard and the owner calls the cops.")}
        </Card>
      )}

      {tab === "tax" && (
        <Card title="Tax Evasion" icon="🧾">
          <Field label="Income to hide ($)">
            <input className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Btn disabled={busy} onClick={() => run(() => tax({ amount: Number(amount) }), "Filed under 'creative accounting'.")}>
            Bury {big(Number(amount))}
          </Btn>
          {riskNote("The larger the sum you bury, the more likely an audit finds the hole.")}
        </Card>
      )}

      {tab === "arms" && (
        <Card title="Arms Dealing" icon="🔫">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Side">
              <select className={inputCls} defaultValue="buy" id="arms-side">
                <option value="buy">Buy (build stock)</option>
                <option value="sell">Sell (take profit)</option>
              </select>
            </Field>
            <Field label="Units">
              <input className={inputCls} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <div className="flex gap-2">
            <Btn disabled={busy} onClick={() => run(() => arms({ action: "buy", quantity: Number(qty) }), "Crates delivered.")}>
              Buy {qty}
            </Btn>
            <Btn variant="ghost" disabled={busy} onClick={() => run(() => arms({ action: "sell", quantity: Number(qty) }), "Crates moved.")}>
              Sell {qty}
            </Btn>
          </div>
          {riskNote("Buy low in quiet districts, sell high where the turf wars are hot.")}
        </Card>
      )}

      {tab === "arson" && (
        <Card title="Arson" icon="🔥">
          <Field label="Target">
            <input className={inputCls} value={targetName} onChange={(e) => setTargetName(e.target.value)} />
          </Field>
          <Btn variant="danger" disabled={busy} onClick={() => run(() => arson({ targetName }), "It's burning.")}>
            Torch It
          </Btn>
          {riskNote("Arson pays well and frightens rivals, but the fire marshal remembers faces.")}
        </Card>
      )}

      {tab === "identity" && (
        <Card title="Identity Theft" icon="🪪">
          <Field label="Mark">
            <select className={inputCls} value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Pick a victim…</option>
              {others.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nickname ?? "Unknown"} · {big(p.money)}
                </option>
              ))}
            </select>
          </Field>
          <Btn disabled={busy || !targetId} onClick={() => run(() => identity({ targetId: targetId as any }), "Papers forged.")}>
            Steal Identity
          </Btn>
          {riskNote("Rich marks are worth more — and fight back harder when they notice.")}
        </Card>
      )}

      {tab === "traffic" && (
        <Card title="Drug Trafficking" icon="📦">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Destination city">
              <input className={inputCls} value={destCity} onChange={(e) => setDestCity(e.target.value)} />
            </Field>
            <Field label="Quantity">
              <input className={inputCls} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <Btn disabled={busy} onClick={() => run(() => trafficking({ destCity, quantity: Number(qty) }), "Shipment is moving.")}>
            Ship {qty} Units to {destCity}
          </Btn>
          {riskNote("Long hauls pay more. They also cross more checkpoints.")}
        </Card>
      )}

      {tab === "smuggle" && (
        <Card title="Smuggling Run" icon="🚢">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Destination">
              <input className={inputCls} value={destCity} onChange={(e) => setDestCity(e.target.value)} />
            </Field>
            <Field label="Contraband">
              <select className={inputCls} value={contraband} onChange={(e) => setContraband(e.target.value)}>
                <option>Drugs</option>
                <option>Weapons</option>
                <option>Counterfeit Goods</option>
                <option>Stolen Art</option>
                <option>Diamonds</option>
              </select>
            </Field>
            <Field label="Quantity">
              <input className={inputCls} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <Btn
            disabled={busy}
            onClick={() => run(() => smuggle({ destCity, contrabandType: contraband, quantity: Number(qty) }), "Convoy is rolling.")}
          >
            Run the Route
          </Btn>
          {riskNote("Customs gets suspicious when the cargo is worth more than the truck.")}
        </Card>
      )}

      {tab === "market" && (
        <Card title="Black Market Stock" icon="🖤">
          {((market ?? []) as any[]).length === 0 ? (
            <Empty icon="🖤" text="No stock listed. Check back after the refresh." />
          ) : (
            <div className="space-y-2">
              {((market ?? []) as any[]).slice(0, 20).map((it: any, i: number) => (
                <Row key={it._id ?? i}>
                  <span className="text-lg">{it.icon ?? "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-bold">{it.name ?? "Unknown"}</div>
                    <div className="text-[10px] text-slate-500">{[it.type, it.rarity].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div className="text-xs font-bold text-amber-400">{big(it.price)}</div>
                </Row>
              ))}
            </div>
          )}
        </Card>
      )}
    </HubShell>
  );
}

// =====================================================================
// 4. CREW HUB — folds Crew Bank / War / Territory / Alliance / Safehouse
// =====================================================================
export function CrewHubPage({ initialTab = "bank" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const { busy, msg, run } = useRun();
  const player = useQuery(api.game.getPlayer);
  const family = useQuery(api.game.getFamily);
  const members = useQuery(api.game.getFamilyMembers);
  const families = useQuery(api.game.getAllFamilies);
  const territories = useQuery(api.gameFeatures.getTerritories, {});
  const wars = useQuery(api.gameFeatures.getActiveFamilyWars);
  const [targetFamily, setTargetFamily] = useState("");
  const [territory, setTerritory] = useState("Downtown");

  const declareWar = useMutation(api.gameFeatures.declareWar);
  const claimTerritory = useMutation(api.gameFeatures.claimTerritory);
  const proposeAlliance = useMutation(api.gameFeatures.proposeAlliance);
  const sendSpy = useMutation(api.gameFeatures.sendSpy);

  const fam = family as any;
  const memberList = (members ?? []) as any[];
  const rivalFamilies = ((families ?? []) as any[]).filter((f) => f._id !== fam?._id);

  const tabs: TabDef[] = [
    { id: "bank", label: "Crew Bank", icon: "🏦" },
    { id: "war", label: "Crew War", icon: "⚔️" },
    { id: "territory", label: "Territory", icon: "📍" },
    { id: "alliance", label: "Alliance", icon: "🤝" },
    { id: "safehouse", label: "Safe House", icon: "🏠" },
    { id: "challenges", label: "Challenges", icon: "🎯" },
  ];

  return (
    <HubShell
      icon="🤝"
      title="Crew Operations"
      sub={fam ? `${fam.name} [${fam.tag ?? "—"}] · Lv.${fam.level ?? 1}` : "Join or found a crew to unlock these operations."}
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />

      {!fam && (
        <Card title="No Crew" icon="🚫">
          <div className="text-xs text-slate-400">
            You aren't in a crew yet. Crew banks, wars, territory and alliances all require a crew — join one from the Crew System page.
          </div>
        </Card>
      )}

      {tab === "bank" && fam && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Crew Treasury" icon="🏦">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Treasury" value={big(fam.treasury)} color="text-amber-400" />
              <Stat label="Members" value={`${fam.memberCount ?? memberList.length}/${fam.maxMembers ?? "—"}`} />
              <Stat label="Infamy" value={fmt(fam.infamy)} color="text-red-400" />
            </div>
            <div className="text-[11px] text-slate-500">
              The treasury funds wars, bounties and territory claims. Every member can see it — only leadership should spend it.
            </div>
          </Card>
          <Card title="Roster" icon="👥">
            {memberList.length === 0 ? (
              <Empty icon="👥" text="No members found." />
            ) : (
              <div className="space-y-2">
                {memberList.slice(0, 20).map((m: any) => (
                  <Row key={m._id}>
                    <span className="text-lg">{m._id === fam.leaderId ? "👑" : "🤝"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">{m.nickname ?? m.username ?? "Unknown"}</div>
                      <div className="text-[10px] text-slate-500">Lv.{m.level ?? 1} · {m.rank ?? "member"}</div>
                    </div>
                    <div className="text-xs font-bold text-green-400">{big(m.money)}</div>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "war" && fam && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Active Wars" icon="⚔️">
            {((wars ?? []) as any[]).length === 0 ? (
              <Empty icon="🕊️" text="No active wars. Peace is profitable — for now." />
            ) : (
              <div className="space-y-2">
                {((wars ?? []) as any[]).map((w: any, i: number) => (
                  <Row key={w._id ?? i}>
                    <span className="text-lg">⚔️</span>
                    <div className="flex-1 text-xs">
                      <span className="font-bold">{w.family1Name ?? "Crew"}</span> vs{" "}
                      <span className="font-bold">{w.family2Name ?? "Crew"}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{w.status ?? "ongoing"}</div>
                  </Row>
                ))}
              </div>
            )}
          </Card>
          <Card title="Declare War" icon="🔥">
            <Field label="Target crew">
              <select className={inputCls} value={targetFamily} onChange={(e) => setTargetFamily(e.target.value)}>
                <option value="">Pick a crew…</option>
                {rivalFamilies.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} · Lv.{f.level ?? 1} · {f.memberCount ?? 0} members
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2">
              <Btn
                variant="danger"
                disabled={busy || !targetFamily}
                onClick={() => run(() => declareWar({ targetFamilyId: targetFamily as any }), "War declared.")}
              >
                Declare War
              </Btn>
              <Btn
                variant="ghost"
                disabled={busy || !targetFamily}
                onClick={() => run(() => sendSpy({ targetFamilyId: targetFamily as any }), "Spy deployed.")}
              >
                Send Spy
              </Btn>
            </div>
            <div className="text-[11px] text-slate-500">
              Spying first tells you their strength. Declaring blind is how crews lose their treasury.
            </div>
          </Card>
        </div>
      )}

      {tab === "territory" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Crew Territories" icon="📍">
            {((territories ?? []) as any[]).length === 0 ? (
              <Empty icon="📍" text="No territory data yet. An admin can seed the map." />
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {((territories ?? []) as any[]).map((t: any, i: number) => (
                  <Row key={t._id ?? i}>
                    <span className="text-lg">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">{t.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {t.city} · income {big(t.income)} · defense {t.defenseLevel ?? 0}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold ${t.ownerId === player?._id ? "text-green-400" : "text-slate-500"}`}>
                      {t.ownerId === player?._id ? "YOURS" : t.ownerId ? "HELD" : "OPEN"}
                    </span>
                  </Row>
                ))}
              </div>
            )}
          </Card>
          <Card title="Claim Territory" icon="🚩">
            <Field label="Territory name">
              <input className={inputCls} value={territory} onChange={(e) => setTerritory(e.target.value)} />
            </Field>
            <Btn disabled={busy} onClick={() => run(() => claimTerritory({ territoryName: territory }), "Claim filed.")}>
              Claim {territory || "territory"}
            </Btn>
            <div className="text-[11px] text-slate-500">Claimed turf pays income every cycle and must be defended when contested.</div>
          </Card>
        </div>
      )}

      {tab === "alliance" && fam && (
        <Card title="Diplomacy" icon="🤝">
          <Field label="Crew to ally with">
            <select className={inputCls} value={targetFamily} onChange={(e) => setTargetFamily(e.target.value)}>
              <option value="">Pick a crew…</option>
              {rivalFamilies.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} · {f.memberCount ?? 0} members
                </option>
              ))}
            </select>
          </Field>
          <Btn disabled={busy || !targetFamily} onClick={() => run(() => proposeAlliance({ targetFamilyId: targetFamily as any }), "Alliance proposed.")}>
            Propose Alliance
          </Btn>
          {fam.allianceId && <div className="text-[11px] text-green-400">You are currently allied.</div>}
        </Card>
      )}

      {tab === "safehouse" && fam && (
        <Card title="Crew Safe House" icon="🏠">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Crew Level" value={fmt(fam.level ?? 1)} />
            <Stat label="Experience" value={fmt(fam.experience)} />
            <Stat label="Territories" value={fmt(fam.territories ?? 0)} color="text-sky-400" />
            <Stat label="Rank" value={fam.rank ?? "—"} color="text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-500">
            The safe house is where your crew banks infamy, hides from the law and rebuilds after a lost war. Territory income and
            member contributions stack here over time.
          </div>
          {fam.description && <div className="rounded-lg bg-slate-800/40 p-3 text-xs text-slate-300">{fam.description}</div>}
        </Card>
      )}

      {tab === "challenges" && fam && (
        <Card title="Crew Challenges" icon="🎯">
          <div className="space-y-2">
            {[
              { name: "Pull 50 successful crimes together", goal: 50, key: "totalCrimes", icon: "🔪" },
              { name: "Bank $250,000,000 in the treasury", goal: 250000000, key: "treasury", icon: "🏦" },
              { name: "Warm up with 25 crew fights", goal: 25, key: "totalFights", icon: "🥊" },
            ].map((c) => {
              const current = memberList.reduce((s: number, m: any) => s + (Number(m[c.key]) || 0), 0);
              const pct = Math.min(100, (current / c.goal) * 100);
              return (
                <div key={c.name} className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.icon}</span>
                    <div className="flex-1 text-xs font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{Math.round(pct)}%</div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-500">Progress is measured across every crew member in real time.</div>
        </Card>
      )}
    </HubShell>
  );
}

// =====================================================================
// 5. WORLD HUB — Neighborhoods / City Map / Gangs / Dynamic Events
// =====================================================================
export function WorldHubPage({ initialTab = "districts" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const { busy, msg, run } = useRun();
  const player = useQuery(api.game.getPlayer);
  const districts = useQuery(api.advancedFeatures.getDistricts);
  const gangs = useQuery(api.advancedFeatures.getAIGangs);
  const mapData = useQuery(api.allFeatures.getWorldMapData);
  const cityStats = useQuery(api.allFeatures.getCityStats);
  const event = useQuery(api.gameEnhanced.getRandomEvent);

  const buyDistrict = useMutation(api.advancedFeatures.buyDistrict);
  const collectIncome = useMutation(api.advancedFeatures.collectDistrictIncome);
  const initDistricts = useMutation(api.advancedFeatures.initDistricts);

  const tabs: TabDef[] = [
    { id: "districts", label: "Neighborhoods", icon: "🏘️" },
    { id: "map", label: "City Map", icon: "🗺️" },
    { id: "gangs", label: "Rival Gangs", icon: "🩸" },
    { id: "events", label: "Dynamic Events", icon: "⚡" },
  ];

  return (
    <HubShell
      icon="🌍"
      title="World"
      sub="Turf, districts and everything that changes while you sleep."
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />

      {tab === "districts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Btn disabled={busy} onClick={() => run(() => collectIncome({}), "District income collected.")}>
              Collect All District Income
            </Btn>
            <Btn variant="ghost" disabled={busy} onClick={() => run(() => initDistricts({}), "Districts initialised.")}>
              Initialise Districts
            </Btn>
          </div>
          <Card title="Neighborhood Control" icon="🏘️">
            {((districts ?? []) as any[]).length === 0 ? (
              <Empty icon="🏘️" text="No districts on the map yet — press Initialise Districts to generate them." />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {((districts ?? []) as any[]).map((d: any) => {
                  const mine = d.ownerId === player?._id;
                  return (
                    <div
                      key={d._id}
                      className={`rounded-xl border p-3 transition-all ${
                        mine ? "border-amber-700/50 bg-amber-900/10" : "border-slate-700/40 bg-slate-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mine ? "👑" : "🏘️"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold">{d.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {d.city} · security {d.security ?? 0}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400">
                          Take <span className="font-bold text-amber-400">{big(d.price)}</span>
                          <span className="text-slate-600"> · </span>
                          {big(d.income)}/cycle
                        </div>
                      </div>
                      {!mine && (
                        <div className="mt-2">
                          <Btn className="w-full" disabled={busy} onClick={() => run(() => buyDistrict({ districtId: d._id }), "District acquired.")}>
                            Take Control
                          </Btn>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "map" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="City Statistics" icon="📊">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries((cityStats ?? {}) as Record<string, any>)
                .filter(([, v]) => typeof v === "number" || typeof v === "string")
                .slice(0, 12)
                .map(([k, v]) => (
                  <Stat key={k} label={k.replace(/([A-Z])/g, " $1")} value={typeof v === "number" ? fmt(v) : String(v)} />
                ))}
            </div>
            {Object.keys((cityStats ?? {}) as Record<string, any>).length === 0 && (
              <Empty icon="📊" text="No city statistics available yet." />
            )}
          </Card>
          <Card title="World Map" icon="🗺️">
            {((mapData ?? []) as any[]).length === 0 ? (
              <Empty icon="🗺️" text="No map data available." />
            ) : (
              <div className="space-y-2">
                {((mapData ?? []) as any[]).slice(0, 20).map((c: any, i: number) => (
                  <Row key={c._id ?? c.name ?? i}>
                    <span className="text-lg">{c.icon ?? "🏙️"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold">{c.name ?? "Unknown"}</div>
                      <div className="text-[10px] text-slate-500">
                        {[c.risk ? `${c.risk} risk` : null, c.unlocks ? `Lv.${c.unlocks}` : null].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    {typeof c.cost === "number" && <div className="text-xs font-bold text-amber-400">{big(c.cost)}</div>}
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "gangs" && (
        <Card title="Rival Gangs" icon="🩸">
          {((gangs ?? []) as any[]).length === 0 ? (
            <Empty icon="🩸" text="No rival gangs have formed yet." />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {((gangs ?? []) as any[]).map((g: any, i: number) => (
                <Row key={g._id ?? i}>
                  <span className="text-xl">{g.icon ?? "🩸"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold">{g.name ?? "Unknown gang"}</div>
                    <div className="text-[10px] text-slate-500">
                      {[g.strength ? `strength ${fmt(g.strength)}` : null, g.city].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "events" && (
        <Card title="Today's Dynamic Event" icon="⚡">
          {!event ? (
            <Empty icon="⚡" text="Nothing special happening right now — check back soon." />
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-black text-amber-400">
                {(event as any).name ?? (event as any).title ?? "Live Event"}
              </div>
              <div className="text-xs text-slate-300">
                {(event as any).description ?? (event as any).desc ?? "A world event is currently active."}
              </div>
              {typeof (event as any).reward === "number" && (
                <div className="text-xs text-green-400">Reward: {big((event as any).reward)}</div>
              )}
            </div>
          )}
        </Card>
      )}
    </HubShell>
  );
}

// =====================================================================
// 6. PROPERTY HUB — merges Real Estate + Property Flipping
// =====================================================================
export function PropertyHubPage({ initialTab = "flip" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const { busy, msg, run } = useRun();
  const player = useQuery(api.game.getPlayer);
  const catalog = useQuery(api.businessSystem.getPropertyCatalog);
  const allProps = useQuery(api.game.getProperties);
  const estate = useQuery(api.worldSystem.getEstateState);

  const buyFlip = useMutation(api.businessSystem.buyProperty);
  const renovate = useMutation(api.businessSystem.renovateProperty);
  const setRent = useMutation(api.businessSystem.setRent);
  const claimRent = useMutation(api.businessSystem.claimRent);
  const sellFlip = useMutation(api.businessSystem.sellProperty);
  const evict = useMutation(api.businessSystem.evictTenant);
  const buyEstate = useMutation(api.worldSystem.buyProperty);
  const upgradeEstate = useMutation(api.worldSystem.upgradeProperty);
  const sellEstate = useMutation(api.worldSystem.sellProperty);
  const collectEstateRent = useMutation(api.worldSystem.collectEstateRent);

  const [tenant, setTenant] = useState("");

  const mine = ((allProps ?? []) as any[]).filter((p) => p.ownerId === player?._id);
  const portfolioValue = mine.reduce((s, p) => s + (Number(p.price) || 0), 0);

  const tabs: TabDef[] = [
    { id: "flip", label: "Flip & Rent", icon: "🏘️" },
    { id: "estate", label: "Real Estate", icon: "🏙️" },
  ];

  return (
    <HubShell
      icon="🏘️"
      title="Property Empire"
      sub="Buy cheap, renovate hard, rent forever — or sell at the top."
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Properties" value={fmt(mine.length)} />
        <Stat label="Portfolio Value" value={big(portfolioValue)} color="text-amber-400" />
        <Stat label="Renovated" value={fmt(mine.reduce((s, p) => s + (Number((p as any).renovationLevel) || 0), 0))} color="text-sky-400" />
        <Stat label="Rented Out" value={fmt(mine.filter((p) => (p as any).rentedTo).length)} color="text-green-400" />
      </div>

      {tab === "flip" && (
        <div className="space-y-4">
          <Card title="Available to Buy" icon="🏚️">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {((catalog ?? []) as any[]).map((p: any) => (
                <div key={p.id} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-500">rent {big(p.rent)}/day</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-black text-amber-400">{big(p.price)}</div>
                  <Btn className="mt-2 w-full" disabled={busy} onClick={() => run(() => buyFlip({ catalogId: p.id }), `${p.name} purchased.`)}>
                    Buy
                  </Btn>
                </div>
              ))}
            </div>
          </Card>

          <Card title="My Portfolio" icon="🗂️">
            {mine.length === 0 ? (
              <Empty icon="🏚️" text="You don't own property yet — buy one above to start flipping." />
            ) : (
              <div className="space-y-2">
                {mine.map((p: any) => (
                  <Row key={p._id} className="flex-wrap">
                    <span className="text-xl">🏠</span>
                    <div className="min-w-[140px] flex-1">
                      <div className="text-xs font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.city} · value {big(p.price)} · rent {big(p.income)}/day · reno lv.{p.renovationLevel ?? 0}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {p.rentedTo ? `Tenant: ${p.rentedTo}` : "Vacant"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Btn variant="ghost" disabled={busy} onClick={() => run(() => renovate({ propertyId: p._id }), `${p.name} renovated.`)}>
                        Renovate
                      </Btn>
                      {!p.rentedTo ? (
                        <>
                          <input
                            className="w-28 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 py-1.5 text-xs"
                            placeholder="tenant name"
                            value={tenant}
                            onChange={(e) => setTenant(e.target.value)}
                          />
                          <Btn
                            disabled={busy || tenant.trim().length < 2}
                            onClick={() => run(() => setRent({ propertyId: p._id, tenantName: tenant.trim() }), "Tenant moved in.")}
                          >
                            Set Tenant
                          </Btn>
                        </>
                      ) : (
                        <>
                          <Btn variant="gold" disabled={busy} onClick={() => run(() => claimRent({ propertyId: p._id }), "Rent collected.")}>
                            Collect Rent
                          </Btn>
                          <Btn variant="ghost" disabled={busy} onClick={() => run(() => evict({ propertyId: p._id }), "Tenant evicted.")}>
                            Evict
                          </Btn>
                        </>
                      )}
                      <Btn variant="danger" disabled={busy} onClick={() => run(() => sellFlip({ propertyId: p._id }), `${p.name} sold.`)}>
                        Sell
                      </Btn>
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "estate" && (
        <div className="space-y-4">
          <Card title="Estate Holdings" icon="🏙️">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {((catalog ?? []) as any[]).map((p: any) => (
                <div key={`estate-${p.id}`} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-500">Passive {big(p.rent)}/day</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Btn className="flex-1" disabled={busy} onClick={() => run(() => buyEstate({ location: p.name }), `${p.name} acquired.`)}>
                      Buy
                    </Btn>
                    <Btn
                      variant="ghost"
                      className="flex-1"
                      disabled={busy}
                      onClick={() => run(() => upgradeEstate({ location: p.name }), `${p.name} upgraded.`)}
                    >
                      Upgrade
                    </Btn>
                    <Btn
                      variant="danger"
                      className="flex-1"
                      disabled={busy}
                      onClick={() => run(() => sellEstate({ location: p.name }), `${p.name} sold.`)}
                    >
                      Sell
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="gold" disabled={busy} onClick={() => run(() => collectEstateRent({}), "Estate rent collected.")}>
              Collect All Estate Rent
            </Btn>
          </Card>

          <Card title="Estate Ledger" icon="📒">
            <pre className="max-h-48 overflow-auto rounded-lg bg-slate-950/50 p-3 text-[10px] text-slate-400">
              {JSON.stringify(estate ?? {}, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </HubShell>
  );
}

// =====================================================================
// 7. DAILY HUB — folds streak / login / playtime / idle / comeback
// =====================================================================
export function DailyHubPage({ initialTab = "streak" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const { busy, msg, run } = useRun();

  const streak = useQuery(api.retentionSystem.getStreakStatus);
  const playtime = useQuery(api.retentionSystem.getPlaytimeStatus);
  const idle = useQuery(api.retentionSystem.getIdleIncome);
  const comeback = useQuery(api.retentionSystem.getReturnBonus);

  const claimStreak = useMutation(api.retentionSystem.claimLoginStreak);
  const claimLogin = useMutation(api.gameExtended.claimDailyReward);
  const claimPlaytime = useMutation(api.retentionSystem.claimPlaytimeReward);
  const claimIdle = useMutation(api.retentionSystem.claimIdleIncome);
  const claimComeback = useMutation(api.retentionSystem.claimReturnBonus);

  const tabs: TabDef[] = [
    { id: "streak", label: "Login Streak", icon: "🔥" },
    { id: "login", label: "Daily Reward", icon: "🎁" },
    { id: "playtime", label: "Playtime", icon: "⏱️" },
    { id: "idle", label: "Idle Income", icon: "💰" },
    { id: "comeback", label: "Comeback Bonus", icon: "🔄" },
  ];

  const s: any = streak;
  const p: any = playtime;
  const i: any = idle;
  const c: any = comeback;

  return (
    <HubShell
      icon="📅"
      title="Daily Rewards"
      sub="Everything you can claim each day, in one place — no hunting through menus."
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />

      {tab === "streak" && (
        <Card title="Login Streak" icon="🔥">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Current Streak" value={`${fmt(s?.streak)} days`} color="text-amber-400" />
            <Stat label="Best Streak" value={`${fmt(s?.bestStreak)} days`} />
            <Stat label="Can Claim" value={s?.canClaim ? "YES" : "NO"} color={s?.canClaim ? "text-green-400" : "text-slate-500"} />
          </div>
          <Btn disabled={busy || !s?.canClaim} onClick={() => run(() => claimStreak({}), "Streak reward claimed.")}>
            {s?.canClaim ? "Claim Streak Reward" : "Already claimed today"}
          </Btn>
          <div className="text-[11px] text-slate-500">
            Log in on consecutive days to build the multiplier. Miss a day and the streak resets to day one.
          </div>
        </Card>
      )}

      {tab === "login" && (
        <Card title="Daily Reward" icon="🎁">
          <div className="text-xs text-slate-400">
            Claim once every 12 hours. Rewards escalate across a 7-day cycle, and day 7 pays a large bonus before the cycle restarts.
          </div>
          <Btn variant="gold" disabled={busy} onClick={() => run(() => claimLogin({}), "Daily reward claimed.")}>
            Claim Daily Reward
          </Btn>
        </Card>
      )}

      {tab === "playtime" && (
        <Card title="Playtime Rewards" icon="⏱️">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Minutes Today" value={fmt(p?.minutesToday ?? p?.minutes)} />
            <Stat label="Next Tier" value={fmt(p?.nextTier ?? 0)} color="text-sky-400" />
            <Stat label="Ready" value={p?.canClaim ? "YES" : "NO"} color={p?.canClaim ? "text-green-400" : "text-slate-500"} />
          </div>
          <Btn disabled={busy || !p?.canClaim} onClick={() => run(() => claimPlaytime({}), "Playtime reward claimed.")}>
            {p?.canClaim ? "Claim Playtime Reward" : "Keep playing to unlock"}
          </Btn>
        </Card>
      )}

      {tab === "idle" && (
        <Card title="Idle Income" icon="💰">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Ready to Collect" value={big(i?.amount ?? i?.pending)} color="text-green-400" />
            <Stat label="Rate / hour" value={big(i?.rate)} />
          </div>
          <Btn disabled={busy || !(i?.amount || i?.pending)} onClick={() => run(() => claimIdle({}), "Idle income collected.")}>
            Collect Idle Income
          </Btn>
          <div className="text-[11px] text-slate-500">
            Your businesses and properties earn while you're offline. Come back often to avoid the cap.
          </div>
        </Card>
      )}

      {tab === "comeback" && (
        <Card title="Comeback Bonus" icon="🔄">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Days Away" value={fmt(c?.daysAway ?? c?.days)} />
            <Stat label="Bonus" value={c?.canClaim ? big(c?.amount ?? c?.reward) : "—"} color="text-amber-400" />
          </div>
          <Btn disabled={busy || !c?.canClaim} onClick={() => run(() => claimComeback({}), "Welcome back bonus claimed.")}>
            {c?.canClaim ? "Claim Comeback Bonus" : "No bonus available"}
          </Btn>
          <div className="text-[11px] text-slate-500">Been away a while? The city rewards players who come back.</div>
        </Card>
      )}
    </HubShell>
  );
}

// =====================================================================
// 8. MONEY HUB — folds Interest / Credit / Insurance / Offshore / Loans
// =====================================================================
export function MoneyHubPage({ initialTab = "interest" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const { busy, msg, run } = useRun();
  const player = useQuery(api.game.getPlayer);
  const bank = useQuery(api.worldSystem.getBankState);
  const linked = useQuery(api.worldSystem.getLinkedAccounts);
  const lendTargets = useQuery(api.businessSystem.getLendTargets);

  const applyInterest = useMutation(api.worldSystem.applyInterest);
  const depositInterest = useMutation(api.worldSystem.depositInterest);
  const withdrawInterest = useMutation(api.worldSystem.withdrawInterest);
  const transfer = useMutation(api.worldSystem.deadAliveTransfer);
  const lend = useMutation(api.gameFeatures.lendMoney);

  const [amt, setAmt] = useState("1000000");
  const [borrower, setBorrower] = useState("");
  const [transferName, setTransferName] = useState("");

  const b: any = bank;
  const money = (player?.money ?? 0) as number;
  const bankBal = ((player as any)?.bank ?? 0) as number;

  // Credit score derived from real financial standing.
  const netWorth = money + bankBal;
  const creditScore = useMemo(() => {
    let score = 300;
    score += Math.min(150, Math.floor(netWorth / 1_000_000) * 3);
    score += Math.min(100, Math.floor(bankBal / 1_000_000) * 5);
    score += Math.min(120, (player?.level ?? 1) * 4);
    score += Math.min(80, (player?.totalCrimes ?? 0) * 0.2);
    score -= Math.min(150, (player?.totalKills ?? 0) * 1.5);
    return Math.max(300, Math.min(850, Math.round(score)));
  }, [netWorth, bankBal, player?.level, player?.totalCrimes, player?.totalKills]);
  const creditTier = creditScore >= 800 ? "Exceptional" : creditScore >= 740 ? "Very Good" : creditScore >= 670 ? "Good" : creditScore >= 580 ? "Fair" : "Poor";
  const creditColor = creditScore >= 740 ? "text-green-400" : creditScore >= 670 ? "text-amber-400" : "text-red-400";

  const tiers = [
    { name: "Medical", premium: Math.max(50_000, Math.round(netWorth * 0.005)), covers: "Hospital bills halved, 50% faster healing." },
    { name: "Life", premium: Math.max(120_000, Math.round(netWorth * 0.012)), covers: "Family receives 60% of your estate if you're killed." },
    { name: "Property", premium: Math.max(90_000, Math.round(netWorth * 0.008)), covers: "Covers losses from arson, theft and raids." },
    { name: "Vehicle", premium: Math.max(40_000, Math.round(netWorth * 0.004)), covers: "Replaces stolen or wrecked cars at no cost." },
  ];

  const tabs: TabDef[] = [
    { id: "interest", label: "Interest", icon: "📈" },
    { id: "credit", label: "Credit Score", icon: "💳" },
    { id: "loans", label: "Loans", icon: "💸" },
    { id: "insurance", label: "Insurance", icon: "🛡️" },
    { id: "offshore", label: "Offshore", icon: "🏝️" },
  ];

  return (
    <HubShell
      icon="🏦"
      title="Money & Law"
      sub="Interest, credit, loans, cover and offshore accounts — your financial empire in one place."
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Cash" value={big(money)} color="text-green-400" />
        <Stat label="Bank" value={big(bankBal)} color="text-sky-400" />
        <Stat label="Net Worth" value={big(netWorth)} color="text-amber-400" />
        <Stat label="Credit" value={creditScore} color={creditColor} />
      </div>

      {tab === "interest" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Interest Account" icon="📈">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Balance" value={big(b?.balance ?? b?.interestBalance)} color="text-sky-400" />
              <Stat label="Accrued" value={big(b?.accrued ?? b?.pending)} color="text-green-400" />
            </div>
            <Btn disabled={busy} onClick={() => run(() => applyInterest({}), "Interest compounded.")}>
              Compound Interest
            </Btn>
            <div className="grid grid-cols-2 gap-2">
              <Btn variant="ghost" disabled={busy} onClick={() => run(() => depositInterest({ amount: Number(amt) }), "Deposited.")}>
                Deposit
              </Btn>
              <Btn variant="ghost" disabled={busy} onClick={() => run(() => withdrawInterest({ amount: Number(amt) }), "Withdrew.")}>
                Withdraw
              </Btn>
            </div>
            <Field label="Amount ($)">
              <input className={inputCls} value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
            </Field>
          </Card>
          <Card title="Rate Card" icon="📊">
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span>12 Hours (4.04% daily compound)</span> <span className="font-bold text-amber-400">4.04%</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/40 pb-1.5">
                <span>24 Hours (4.20% daily compound)</span> <span className="font-bold text-amber-400">4.20%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Interest only accrues while funds sit in the interest account. Withdrawals reset the current cycle.
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "credit" && (
        <Card title="Credit Score" icon="💳">
          <div className="flex items-end gap-4">
            <div className={`text-5xl font-black ${creditColor}`}>{creditScore}</div>
            <div className="pb-1">
              <div className="text-sm font-bold">{creditTier}</div>
              <div className="text-[10px] text-slate-500">Range 300 – 850</div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900">
            <div
              className={`h-full rounded-full ${creditScore >= 740 ? "bg-green-500" : creditScore >= 670 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${((creditScore - 300) / 550) * 100}%` }}
            />
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div>💰 Net worth <span className="font-bold text-slate-300">{big(netWorth)}</span> — raises your score</div>
            <div>🏦 Banking your cash — strongly raises your score</div>
            <div>📈 Character level <span className="font-bold text-slate-300">{player?.level ?? 1}</span> — raises your score</div>
            <div>💀 Kills <span className="font-bold text-red-400">{fmt(player?.totalKills)}</span> — lowers your score</div>
          </div>
        </Card>
      )}

      {tab === "loans" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Issue a Loan" icon="💸">
            <Field label="Borrower">
              <select className={inputCls} value={borrower} onChange={(e) => setBorrower(e.target.value)}>
                <option value="">Pick a borrower…</option>
                {((lendTargets ?? []) as any[]).map((t, i) => (
                  <option key={t._id ?? i} value={t._id ?? ""}>
                    {t.nickname ?? t.name ?? "Player"} · {big(t.money)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Principal ($)">
              <input className={inputCls} value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Btn disabled={busy || !borrower} onClick={() => run(() => lend({ borrowerId: borrower as any, amount: Number(amt) }), "Loan issued.")}>
              Issue Loan · {big(Number(amt))}
            </Btn>
            <div className="text-[11px] text-slate-500">
              Loans charge daily interest. Defaulters are tracked — and the collectors are patient.
            </div>
          </Card>
          <Card title="Lend Targets" icon="🎯">
            {((lendTargets ?? []) as any[]).length === 0 ? (
              <Empty icon="🎯" text="No eligible borrowers right now." />
            ) : (
              <div className="space-y-2">
                {((lendTargets ?? []) as any[]).slice(0, 15).map((t, i) => (
                  <Row key={t._id ?? i}>
                    <span className="text-lg">🙋</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold">{t.nickname ?? t.name ?? "Player"}</div>
                      <div className="text-[10px] text-slate-500">
                        {[t.credit ? `credit ${t.credit}` : null, t.debt ? `owes ${big(t.debt)}` : null].filter(Boolean).join(" · ") || "clean record"}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-green-400">{big(t.money)}</div>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "insurance" && (
        <Card title="Cover & Protection" icon="🛡️">
          <div className="grid gap-2 sm:grid-cols-2">
            {tiers.map((t) => (
              <div key={t.name} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold">{t.name} Insurance</div>
                  <div className="text-xs font-black text-amber-400">{big(t.premium)}/day</div>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{t.covers}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-500">
            Premiums scale with your net worth — the richer you get, the more there is to lose.
          </div>
        </Card>
      )}

      {tab === "offshore" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Offshore Transfer" icon="🏝️">
            <Field label="Recipient username">
              <input className={inputCls} value={transferName} onChange={(e) => setTransferName(e.target.value)} />
            </Field>
            <Btn disabled={busy || !transferName.trim()} onClick={() => run(() => transfer({ username: transferName.trim() }), "Transfer sent.")}>
              Send Offshore Transfer
            </Btn>
            <div className="text-[11px] text-slate-500">
              Offshore transfers move value outside the reach of the tax office, but they leave a trail if anyone looks hard enough.
            </div>
          </Card>
          <Card title="Linked Accounts" icon="🔗">
            {((linked ?? []) as any[]).length === 0 ? (
              <Empty icon="🔗" text="No linked accounts." />
            ) : (
              <div className="space-y-2">
                {((linked ?? []) as any[]).slice(0, 15).map((l, i) => (
                  <Row key={l._id ?? i}>
                    <span className="text-lg">🏝️</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold">{l.name ?? l.username ?? l.account ?? "Account"}</div>
                      <div className="text-[10px] text-slate-500">{l.owner ?? l.status ?? ""}</div>
                    </div>
                    {typeof l.balance === "number" && <div className="text-xs font-bold text-amber-400">{big(l.balance)}</div>}
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </HubShell>
  );
}

// =====================================================================
// 9. SECRET CHALLENGES — was a placeholder, now reads real challenge data
// =====================================================================
export function SecretChallengesHubPage() {
  const raw = useQuery(api.gameEnhanced.getSecretChallenges);
  const player = useQuery(api.game.getPlayer);

  const list: any[] = Array.isArray(raw)
    ? (raw as any[])
    : raw && typeof raw === "object"
      ? Object.entries(raw as Record<string, any>).map(([id, v]) =>
          typeof v === "object" && v ? { id, ...v } : { id, name: id, state: v },
        )
      : [];

  const done = list.filter((c) => c.completed || c.claimed || c.done).length;

  return (
    <HubShell
      icon="🔮"
      title="Secret Challenges"
      sub="Hidden objectives the game never tells you about. Find them by playing."
      tabs={[{ id: "all", label: "Challenges", icon: "🔮" }]}
      active="all"
      onChange={() => {}}
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Discovered" value={fmt(list.length)} />
        <Stat label="Completed" value={fmt(done)} color="text-green-400" />
        <Stat label="Your Level" value={fmt(player?.level ?? 1)} color="text-amber-400" />
      </div>
      {list.length === 0 ? (
        <Empty icon="🔮" text="No secret challenges are live right now. Keep playing — they appear as you progress." />
      ) : (
        <div className="space-y-2">
          {list.map((c, i) => {
            const complete = Boolean(c.completed || c.claimed || c.done);
            return (
              <Row key={c.id ?? i}>
                <span className="text-xl">{complete ? "✅" : "🔮"}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">{c.name ?? c.title ?? c.id}</div>
                  <div className="text-[10px] text-slate-500">
                    {c.description ?? c.desc ?? (typeof c.state === "string" ? c.state : "Hidden objective")}
                  </div>
                </div>
                {typeof c.reward === "number" && (
                  <div className="text-xs font-bold text-amber-400">{big(c.reward)}</div>
                )}
                <span className={`text-[10px] font-bold ${complete ? "text-green-400" : "text-slate-500"}`}>
                  {complete ? "DONE" : "LOCKED"}
                </span>
              </Row>
            );
          })}
        </div>
      )}
    </HubShell>
  );
}

// =====================================================================
// 10. REPORTS HUB — support tickets + city headlines
// =====================================================================
export function ReportsHubPage() {
  const [tab, setTab] = useState("report");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { busy, msg, run } = useRun();
  const headlines = useQuery(api.advancedFeatures.getHeadlines);
  const submit = useMutation(api.gameExtended.submitSupportTicket);

  return (
    <HubShell
      icon="📢"
      title="Reports & Support"
      sub="Raise an issue with the staff, or read what the city is saying about you."
      tabs={[
        { id: "report", label: "Report", icon: "📢" },
        { id: "headlines", label: "Headlines", icon: "📰" },
      ]}
      active={tab}
      onChange={setTab}
    >
      <Msg msg={msg} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="File a Report" icon="📢" className={tab === "report" ? "" : "hidden"}>
          <Field label="Subject">
            <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Bug in the garage page" />
          </Field>
          <Field label="Details">
            <textarea
              className={`${inputCls} h-32 resize-none`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened, where, and what you expected instead…"
            />
          </Field>
          <Btn
            disabled={busy || !subject.trim() || !body.trim()}
            onClick={() =>
              run(async () => {
                await submit({ subject: subject.trim(), body: body.trim() });
                setSubject("");
                setBody("");
                return { submitted: "ticket received" };
              })
            }
          >
            Submit Report
          </Btn>
        </Card>
        <Card title="City Headlines" icon="📰" className={tab === "headlines" ? "" : "hidden"}>
          {((headlines ?? []) as any[]).length === 0 ? (
            <Empty icon="📰" text="No headlines yet. Make some noise and the press will notice." />
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {((headlines ?? []) as any[]).slice(0, 25).map((h, i) => (
                <Row key={h._id ?? i}>
                  <span className="text-lg">📰</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200">{h.title ?? h.headline ?? "Untitled"}</div>
                    <div className="text-[10px] text-slate-500">{h.body ?? h.content ?? ""}</div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </Card>
      </div>
    </HubShell>
  );
}

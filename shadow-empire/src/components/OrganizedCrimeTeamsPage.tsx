import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users, LogOut, Play, Crown, Swords, Send, Bell, Check, BellRing, Timer, Zap,
  Radar, History, Crosshair, Rocket,
} from "lucide-react";
import { OC_JOBS, OC_ROLES, EXECUTE_PHASE_SECONDS, computeOcChance } from "@/data/ocJobs";

const nf = (n: number) => Math.floor(n).toLocaleString();
const fmt = (n: number) => "$" + nf(n);

const RANKS: { min: number; name: string }[] = [
  { min: 90, name: "Shadow Emperor" }, { min: 80, name: "Godfather" },
  { min: 70, name: "Don" }, { min: 60, name: "Underboss" },
  { min: 50, name: "Capo" }, { min: 40, name: "Made Man" },
  { min: 30, name: "Soldier" }, { min: 20, name: "Associate" },
  { min: 10, name: "Street Thug" }, { min: 5, name: "Hustler" },
  { min: 0, name: "Hobo" },
];
const rankName = (lv: number) => (RANKS.find((r) => lv >= r.min) ?? RANKS[RANKS.length - 1]).name;

interface ChatMsg { fromId: string; fromName: string; text: string; system?: boolean; at: number }

const QUICK_CHATS = ["✅ Ready to roll", "⏳ Give me a minute", "🔧 Quick gear check", "👀 Need the invite link"];

const clock = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const timeAgo = (at: number) => {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
};

const short = (n: number) => {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return fmt(n);
};

const oddsColor = (c: number) =>
  c >= 0.7 ? "text-green-400" : c >= 0.5 ? "text-amber-400" : c >= 0.35 ? "text-orange-400" : "text-red-400";

export function OrganizedCrimeTeamsPage() {
  const player = useQuery(api.game.getPlayer);
  const myTeam = useQuery(api.ocTeams.getMyOcTeam);
  const openTeams = useQuery(api.ocTeams.listOpenOcTeams);
  const stats = useQuery(api.ocTeams.getOcStats);
  const history = useQuery(api.ocTeams.getOcHistory);
  const createTeam = useMutation(api.ocTeams.createOcTeam);
  const joinTeam = useMutation(api.ocTeams.joinOcTeam);
  const leaveTeam = useMutation(api.ocTeams.leaveOcTeam);
  const startTeam = useMutation(api.ocTeams.startOcTeam);
  const sendChat = useMutation(api.ocTeams.sendOcChat);
  const setReady = useMutation(api.ocTeams.setOcReady);
  const setRole = useMutation(api.ocTeams.setOcRole);
  const pingCrew = useMutation(api.ocTeams.pingOcCrew);
  const armLaunch = useMutation(api.ocTeams.armAutoLaunch);
  const disarmLaunch = useMutation(api.ocTeams.disarmAutoLaunch);
  const beginExecute = useMutation(api.ocTeams.beginOcExecute);

  const [jobId, setJobId] = useState(OC_JOBS[0].id);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [now, setNow] = useState(Date.now());
  const chatRef = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);

  const chatLen = myTeam ? ((myTeam as any).chat ?? []).length : 0;
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatLen, myTeam?._id]);

  const meId0 = (player as any)?._id ?? "";
  const teamId0 = myTeam?._id;
  const phase0 = (myTeam as any)?.jobPhase ?? "prep";
  const executesAt0 = (myTeam as any)?.executesAt ?? 0;

  // 1s tick while executing (or during an armed auto-launch countdown).
  const needsTick = phase0 === "execute" || !!(myTeam as any)?.autoLaunch;
  useEffect(() => {
    if (!needsTick) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [needsTick]);

  // Slow 20s tick so idle badges stay fresh otherwise.
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(iv);
  }, []);

  // Any member auto-fires the job the moment the execute window is ready.
  useEffect(() => {
    const t = myTeam as any;
    if (!t || t.jobPhase !== "execute" || t.started) return;
    if (!t.executesAt || Date.now() < t.executesAt) return;
    if (firedRef.current) return;
    firedRef.current = true;
    (async () => {
      try {
        const r: any = await startTeam({ teamId: t._id });
        setMsg({
          ok: r.win,
          text: r.win
            ? `✅ ${r.teamName} COMPLETE — every member banked ${fmt(r.rewardEach)} (+${r.xpEach} XP)`
            : `❌ ${r.teamName} went sideways — stake lost, +${r.xpEach} XP each.`,
        });
      } catch (e: any) {
        firedRef.current = false;
        setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Resolution failed" });
      }
    })();
  }, [myTeam, executesAt0, phase0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!player || myTeam === undefined || openTeams === undefined)
    return <div className="animate-pulse py-12 text-center text-sm text-slate-500">Assembling the crew…</div>;

  const job = OC_JOBS.find((j) => j.id === jobId)!;
  const meId = (player as any)._id;

  const run = async (fn: () => Promise<any>, ok: string) => {
    setMsg(null); setBusy(true);
    try {
      const r = await fn();
      setMsg({ ok: true, text: r?.message ?? ok });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Action failed" });
    }
    setBusy(false);
  };

  // Silent runner for chat / pings / readiness — the UI updates reactively.
  const act = async (fn: () => Promise<any>) => {
    try {
      await fn();
    } catch (e: any) {
      setMsg({ ok: false, text: e?.data?.message ?? e?.message ?? "Action failed" });
    }
  };

  const sendDraft = async () => {
    const text = draft.trim();
    if (!text || !myTeam) return;
    setDraft("");
    await act(() => sendChat({ teamId: myTeam._id, text }));
  };

  const myTeamCrew = myTeam as any;
  const members: { id: string; name: string; level: number; seenAt?: number; role?: string | null }[] = myTeamCrew.members ?? [];
  const readyIds: string[] = myTeamCrew.readyIds ?? [];
  const isReadyMember = (id: string) => id === myTeamCrew.hostId || readyIds.includes(id);
  const readyCount = members.filter((m) => isReadyMember(m.id)).length;
  const iAmReady = members.some((m) => m.id === meId) && readyIds.includes(meId);
  const iAmHost = myTeamCrew.hostId === meId;
  const lastPing = myTeamCrew.lastPingAt ?? 0;
  const chat: ChatMsg[] = myTeamCrew.chat ?? [];
  const launchAt = myTeamCrew.launchAt ?? 0;
  const autoArmed = !!myTeamCrew.autoLaunch && launchAt > 0;
  const countdown = autoArmed ? Math.max(0, Math.ceil((launchAt - (now || Date.now())) / 1000)) : 0;
  const crewFullAndReady = members.length === 3 && readyCount === 3;
  const inExecute = myTeamCrew.jobPhase === "execute";
  const execLeft = inExecute ? Math.max(0, Math.ceil((((myTeamCrew.executesAt ?? 0)) - (now || Date.now())) / 1000)) : 0;
  const favRoles: string[] = (OC_JOBS.find((j) => j.id === myTeamCrew.jobId)?.roles ?? []) as string[];
  const liveOdds = computeOcChance(
    { successBase: myTeamCrew.successBase, jobId: myTeamCrew.jobId, roles: members.map((m) => m.role ?? "") },
    members,
  );
  const myRole = members.find((m) => m.id === meId)?.role ?? null;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 p-5">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #ef444433 0, transparent 50%), radial-gradient(circle at 20% 80%, #7c2d1222 0, transparent 45%)" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Swords className="size-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-black tracking-widest text-red-300">ORGANIZED CRIME</h1>
              <p className="text-[11px] text-slate-400">Crews of three. Pick specialist roles that match the job — synergy raises everyone's odds.</p>
            </div>
          </div>
          {stats && (
            <div className="flex gap-2 text-center">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
                <div className="text-sm font-black text-white">{nf(stats.totalOC)}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-500">Jobs done</div>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
                <div className="text-sm font-black text-green-400">{nf(stats.ocWins)}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-500">Wins</div>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2">
                <div className={`text-sm font-black ${((stats as any).ocProfit ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>{short((stats as any).ocProfit ?? 0)}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-500">Net profit</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl border p-3 text-xs font-semibold ${msg.ok ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>{msg.text}</div>
      )}

      {myTeam ? (
        /* ── Current crew ── */
        <div className="rounded-2xl border border-red-500/30 bg-slate-900/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{myTeamCrew.jobIcon}</span>
              <div>
                <h2 className="text-lg font-black text-white">{myTeamCrew.jobName}</h2>
                <p className="text-[10px] text-slate-500">
                  Hosted by {myTeamCrew.hostName} · stake {fmt(myTeamCrew.cost)} each · pays {short(myTeamCrew.rewardMin)}–{short(myTeamCrew.rewardMax)} split 3 ways
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Live odds preview */}
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-center">
                <div className="text-[8px] uppercase tracking-widest text-slate-500">Crew odds</div>
                <div className={`text-lg font-black ${oddsColor(liveOdds)}`}>{Math.round(liveOdds * 100)}%</div>
              </div>
              <button onClick={() => run(() => leaveTeam({ teamId: myTeam._id }), "You left the crew.")}
                disabled={busy || inExecute}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-[10px] font-black text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                <LogOut className="size-3.5" /> LEAVE CREW
              </button>
            </div>
          </div>

          {/* Favored roles hint */}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-950/20 px-3 py-2">
            <Radar className="size-3.5 text-sky-300" />
            <span className="text-[10px] font-bold text-sky-200">This job favors:</span>
            {favRoles.map((r) => (
              <span key={r} className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[9px] font-black text-sky-200">
                {OC_ROLES[r]?.icon} {OC_ROLES[r]?.name ?? r} +{Math.round(0.045 * 100)}%
              </span>
            ))}
            <span className="ml-auto text-[9px] text-sky-200/60">duplicate roles −3% each</span>
          </div>

          {/* Seats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((seat) => {
              const member = members[seat];
              const seatFilled = !!member;
              const ready = seatFilled && isReadyMember(member.id);
              const role = member?.role ? OC_ROLES[member.role] : null;
              const favored = member?.role ? favRoles.includes(member.role) : false;
              return (
                <div key={seat} className={`rounded-xl border p-3 ${seatFilled ? (seat === 0 ? "border-red-500/40 bg-red-950/20" : favored ? "border-green-500/30 bg-green-950/15" : "border-slate-700/60 bg-slate-950/60") : "border-dashed border-slate-700/60 bg-slate-950/40"}`}>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-500">
                    <span>Seat {seat + 1}</span>
                    {seatFilled && seat === 0 && <span className="flex items-center gap-1 text-amber-400"><Crown className="size-3" /> Host</span>}
                  </div>
                  {seatFilled ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5 text-sm font-black text-white">
                        <span className={`size-2 rounded-full ${ready ? "bg-green-400 shadow-[0_0_8px_#4ade8033]" : "bg-amber-400/70 animate-pulse"}`} />
                        <span className="truncate">{member.name}</span>
                        {member.id === meId && <span className="text-[9px] text-red-400">(YOU)</span>}
                      </div>
                      <div className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider ${ready ? "text-green-400" : "text-amber-400/80"}`}>
                        {ready ? "● Ready" : "◐ Standing by"}
                      </div>
                      <div className="text-[10px] text-slate-500">Lv.{member.level} · {rankName(member.level)}</div>
                      <div className={`mt-1 rounded-lg px-2 py-1 text-[10px] font-bold ${role ? (favored ? "border border-green-500/30 bg-green-500/10 text-green-300" : "border border-slate-700 bg-slate-900/60 text-slate-300") : "border border-dashed border-slate-700 text-slate-500"}`}>
                        {role ? `${role.icon} ${role.name}${favored ? " ★" : ""}` : "No role picked"}
                      </div>
                      {!ready && member.seenAt && (now || Date.now()) - member.seenAt > 90_000 && (
                        <div className="mt-0.5 text-[8px] font-bold text-red-400/80">⚠ idle {Math.max(1, Math.floor(((now || Date.now()) - member.seenAt) / 60000))}m</div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 py-2 text-center text-[10px] text-slate-600">
                      Waiting for a member…
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role picker (own seat, prep phase only) */}
          {!inExecute && members.some((m) => m.id === meId) && (
            <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <Crosshair className="size-3.5 text-red-300" /> Your role
                  <span className="normal-case tracking-normal text-slate-600 font-semibold">— starred roles match this job</span>
                </div>
                {myRole && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300">Current: {OC_ROLES[myRole]?.icon} {OC_ROLES[myRole]?.name}</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
                {Object.entries(OC_ROLES).map(([key, r]) => {
                  const favored = favRoles.includes(key);
                  const isMine = myRole === key;
                  return (
                    <button key={key} disabled={busy}
                      onClick={() => act(() => setRole({ teamId: myTeam._id, role: key }))}
                      className={`rounded-lg border p-2 text-left transition-all ${isMine ? "border-red-500/60 bg-red-950/30" : favored ? "border-green-500/30 bg-green-950/15 hover:border-green-500/50" : "border-slate-700/60 bg-slate-900/50 hover:border-slate-500"}`}>
                      <div className="text-base">{r.icon}</div>
                      <div className={`text-[9px] font-black leading-tight ${isMine ? "text-red-300" : favored ? "text-green-300" : "text-slate-300"}`}>{r.name}{favored ? " ★" : ""}</div>
                    </button>
                  );
                })}
              </div>
              {myRole && <div className="mt-1.5 text-[9px] text-slate-500">{OC_ROLES[myRole]?.blurb}</div>}
            </div>
          )}

          {/* Execute phase banner */}
          {inExecute && (
            <div className="mt-3 rounded-xl border border-red-500/50 bg-red-950/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Rocket className={`size-6 ${execLeft <= 10 ? "animate-pulse text-red-400" : "text-red-300"}`} />
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-red-300">THE JOB IS ON</div>
                    <div className="text-[10px] text-slate-400">
                      {execLeft > 0 ? `Rolling in ${execLeft}s — masks on, no backing out.` : "Rolling now — resolving…"}
                    </div>
                  </div>
                </div>
                <button onClick={() => run(() => startTeam({ teamId: myTeam._id }).then((r: any) => ({ message: r.win ? `✅ ${r.teamName} COMPLETE — every member banked ${fmt(r.rewardEach)} (+${r.xpEach} XP)` : `❌ ${r.teamName} went sideways — stake lost, +${r.xpEach} XP each.` })), "Score resolved.")}
                  disabled={busy || execLeft > 0}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-5 py-2.5 text-[11px] font-black tracking-widest text-white hover:from-red-500 hover:to-orange-500 disabled:opacity-40">
                  <Play className="size-3.5" /> RESOLVE THE SCORE
                </button>
              </div>
            </div>
          )}

          {/* Readiness strip */}
          {!inExecute && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-950/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  {members.map((m) => (
                    <span key={m.id} title={isReadyMember(m.id) ? `${m.name}: ready` : `${m.name}: standing by`}
                      className={`size-4 rounded-full border-2 border-slate-950 ${isReadyMember(m.id) ? "bg-green-500" : "bg-slate-600"}`} />
                  ))}
                  {Array.from({ length: Math.max(0, 3 - members.length) }).map((_, i) => (
                    <span key={`empty-${i}`} className="size-4 rounded-full border-2 border-dashed border-slate-700 bg-transparent" />
                  ))}
                </div>
                <div className="text-[11px]">
                  <span className="font-black text-white">Crew readiness</span>
                  <span className="ml-1.5 text-slate-400">{readyCount}/{members.length} seated {readyCount === 3 ? "· all green 🟢" : members.length < 3 ? "· waiting on recruits" : "· still waiting on crew"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lastPing > 0 && Date.now() - lastPing < 60_000 && (
                  <span className="animate-pulse rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black text-amber-300">
                    🔔 PING {timeAgo(lastPing).toUpperCase()}
                  </span>
                )}
                {!iAmHost && members.some((m) => m.id === meId) && (
                  <button onClick={() => act(() => setReady({ teamId: myTeam._id, ready: !iAmReady }))}
                    disabled={busy}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[10px] font-black transition-all disabled:opacity-50 ${iAmReady ? "border border-green-500/40 bg-green-500/15 text-green-300 hover:bg-green-500/25" : "border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"}`}>
                    <Check className="size-3.5" /> {iAmReady ? "I'M READY" : "MARK READY"}
                  </button>
                )}
                {iAmHost && (
                  <button onClick={() => act(() => pingCrew({ teamId: myTeam._id }))}
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3.5 py-2 text-[10px] font-black text-sky-300 hover:bg-sky-500/20 disabled:opacity-50">
                    <BellRing className="size-3.5" /> PING CREW
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Auto-launch countdown (host arms it once the crew is full + ready) */}
          {!inExecute && (autoArmed || iAmHost) && (
            <div className={`mt-3 rounded-xl border px-4 py-3 ${autoArmed ? "border-red-500/40 bg-red-950/20" : "border-slate-700/50 bg-slate-950/50"}`}>
              {autoArmed ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Zap className={`size-5 ${countdown <= 10 ? "animate-pulse text-red-400" : "text-amber-400"}`} />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-red-300">AUTO-LAUNCH ARMED</div>
                      <div className="text-[9px] text-slate-500">Goes live in {countdown}s — then everyone rides the execute window together.</div>
                    </div>
                  </div>
                  {iAmHost && (
                    <button onClick={() => act(() => disarmLaunch({ teamId: myTeam._id }))} disabled={busy}
                      className="rounded-xl border border-slate-600/60 bg-slate-900/60 px-3 py-1.5 text-[10px] font-black text-slate-300 hover:bg-slate-800 disabled:opacity-50">
                      CANCEL
                    </button>
                  )}
                </div>
              ) : iAmHost && crewFullAndReady ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Timer className="size-5 text-slate-400" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auto-launch</div>
                      <div className="text-[9px] text-slate-500">Goes live 45s after arming — no need to babysit the lobby.</div>
                    </div>
                  </div>
                  <button onClick={() => act(() => armLaunch({ teamId: myTeam._id }))} disabled={busy}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-3.5 py-1.5 text-[10px] font-black text-white hover:from-red-500 hover:to-orange-500 disabled:opacity-50">
                    <Zap className="size-3.5" /> ARM (45s)
                  </button>
                </div>
              ) : iAmHost && members.length === 3 ? (
                /* Go now — full crew, all ready */
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Play className="size-5 text-green-400" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-green-300">CREW IS HOT</div>
                      <div className="text-[9px] text-slate-500">All seats filled and ready. Take the job live now, or arm auto-launch above.</div>
                    </div>
                  </div>
                  <button onClick={() => run(() => beginExecute({ teamId: myTeam._id }), "The job is on!")} disabled={busy}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-3.5 py-1.5 text-[10px] font-black text-white hover:from-green-500 hover:to-emerald-400 disabled:opacity-50">
                    <Play className="size-3.5" /> GO NOW
                  </button>
                </div>
              ) : iAmHost ? (
                <div className="text-[9px] text-slate-600">⚡ Auto-launch unlocks when all 3 seats are filled and READY.</div>
              ) : null}
            </div>
          )}

          {/* Crew chat */}
          <div className={`mt-3 rounded-xl border bg-slate-950/50 ${lastPing > 0 && Date.now() - lastPing < 30_000 ? "border-amber-500/50" : "border-slate-700/50"}`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <Bell className="size-3.5 text-amber-400" /> Crew comms
                <span className="text-slate-600 normal-case tracking-normal">— plan the job while seats fill</span>
              </div>
              <span className="text-[9px] text-slate-600">Crew only</span>
            </div>
            <div ref={chatRef} className="h-52 space-y-2 overflow-y-auto px-4 py-3 scrollbar-thin">
              {chat.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                  <span className="text-xl opacity-50">📻</span>
                  <span className="text-[10px] text-slate-600">No chatter yet — say something or hit a quick line below.</span>
                </div>
              ) : chat.map((m, i) =>
                m.system ? (
                  <div key={i} className="flex justify-center">
                    <span className="rounded-full border border-amber-500/15 bg-amber-500/5 px-3 py-1 text-[9px] font-semibold text-amber-200/70">{m.text} <span className="opacity-50">· {clock(m.at)}</span></span>
                  </div>
                ) : (
                  <div key={i} className={`flex ${m.fromId === meId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-xl px-3 py-1.5 text-[11px] leading-snug ${m.fromId === meId ? "rounded-br-sm bg-red-600/20 text-red-100" : "rounded-bl-sm bg-slate-800/80 text-slate-200"}`}>
                      <div className={`mb-0.5 flex items-baseline gap-1.5 text-[9px] font-bold ${m.fromId === meId ? "text-red-300/80" : "text-sky-300/80"}`}>
                        <span>{m.fromId === meId ? "You" : m.fromName}</span>
                        <span className="font-normal text-slate-500">{clock(m.at)}</span>
                      </div>
                      {m.text}
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="border-t border-slate-800/80 px-4 py-2.5">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_CHATS.map((q) => (
                  <button key={q} onClick={() => act(() => sendChat({ teamId: myTeam._id, text: q }))}
                    disabled={busy}
                    className="rounded-full border border-slate-700/70 bg-slate-900/70 px-2.5 py-1 text-[9px] font-semibold text-slate-300 transition-colors hover:border-amber-500/40 hover:text-amber-200 disabled:opacity-50">
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDraft(); } }}
                  maxLength={160}
                  placeholder="Type a message…"
                  className="flex-1 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-amber-500/40 focus:outline-none"
                />
                <button onClick={sendDraft} disabled={busy || !draft.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-[10px] font-black text-white hover:from-red-500 hover:to-orange-500 disabled:opacity-40">
                  <Send className="size-3.5" /> SEND
                </button>
              </div>
            </div>
          </div>

          <div className={`mt-3 rounded-xl border px-4 py-3 text-[11px] ${inExecute ? "border-red-500/30 bg-red-500/5 text-red-200/90" : readyCount === members.length && members.length === 3 ? "border-green-500/30 bg-green-500/5 text-green-200/90" : "border-amber-500/20 bg-amber-500/5 text-amber-200/80"}`}>
            {inExecute
              ? "🚨 The job is going down. When the window dies, anyone can resolve the score — the odds are already locked in."
              : members.length < 3
                ? `🕵️ Waiting for more members — need ${3 - members.length} more to start. Pick your role below while seats fill.`
                : readyCount < 3
                  ? `🚦 Crew is full but ${3 - readyCount} seat${3 - readyCount === 1 ? "" : "s"} still ${3 - readyCount === 1 ? "is" : "are"} standing by. Ping the crew until everyone marks READY.`
                  : "✅ All seats filled and READY. The host can take the job live — every seat pays its stake and splits the take."}
          </div>
        </div>
      ) : (
        /* ── Join / create flow ── */
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-sky-400" />
              <h2 className="text-sm font-black tracking-wider text-sky-300">READY TO JOIN</h2>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Join an organised crime with other players (requires 3 members).</p>
            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
              {openTeams.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700/60 py-10 text-center text-[11px] text-slate-600">
                  No crews recruiting right now.<br />Open your own below and others will fill the seats.
                </div>
              ) : openTeams.map((t: any) => (
                <div key={t._id} className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-950/60 p-3">
                  <span className="text-2xl">{t.jobIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-white truncate">{t.jobName}</div>
                    <div className="text-[9px] text-slate-500">by {t.hostName} · Lv.{t.levelReq}+ · stake {short(t.cost)}</div>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300">{t.count}/{t.max}</span>
                  <button onClick={() => run(() => joinTeam({ teamId: t._id }), `Joined ${t.jobName}. Mark yourself ready and pick a role.`)}
                    disabled={busy}
                    className="rounded-xl bg-sky-600 px-4 py-2 text-[10px] font-black text-white hover:bg-sky-500 disabled:opacity-50">
                    JOIN OC
                  </button>
                </div>
              ))}
            </div>

            {/* Recent scores */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <History className="size-3.5" /> Recent scores
                <span className="normal-case font-semibold tracking-normal text-slate-600">— last 24h</span>
              </div>
              {((history ?? []) as any[]).length === 0 ? (
                <div className="py-3 text-center text-[10px] text-slate-600">No scores settled yet today.</div>
              ) : (
                <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                  {((history ?? []) as any[]).map((h: any) => (
                    <div key={h._id} className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-2.5 py-1.5">
                      <span className="text-sm">{h.jobIcon}</span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-slate-300">
                        {h.jobName}{h.iWasIn ? <span className="ml-1 text-[8px] text-red-400">(you)</span> : null}
                      </span>
                      <span className={`text-[10px] font-black ${h.win ? "text-green-400" : "text-red-400"}`}>
                        {h.win ? `+${short(h.rewardEach)}` : "failed"}
                      </span>
                      <span className="text-[8px] text-slate-600">{timeAgo(h.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2">
              <Swords className="size-4 text-red-400" />
              <h2 className="text-sm font-black tracking-wider text-red-300">OPEN YOUR OWN</h2>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Pick a job and start recruiting. You keep the host seat and pick the crew.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {OC_JOBS.map((j) => {
                const locked = (player.level ?? 0) < j.level;
                const affordable = (player.money ?? 0) >= j.cost;
                return (
                  <button key={j.id} onClick={() => setJobId(j.id)} disabled={locked || !affordable}
                    className={`rounded-xl border p-3 text-left transition-all ${jobId === j.id ? "border-red-500/50 bg-red-950/20" : "border-slate-700/60 bg-slate-950/50 hover:border-slate-500"} ${locked || !affordable ? "opacity-40" : ""}`}>
                    <div className="text-lg">{j.icon}</div>
                    <div className="mt-1 text-[11px] font-black text-white leading-tight">{j.name}</div>
                    <div className="text-[9px] text-slate-500">
                      {locked ? `🔒 Lv.${j.level}` : affordable ? `Stake ${short(j.cost)}` : "Not enough cash"}
                    </div>
                    <div className="mt-1 flex gap-1">
                      {j.roles.map((r) => (
                        <span key={r} title={OC_ROLES[r]?.name} className="text-[10px]">{OC_ROLES[r]?.icon}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-[10px] text-slate-400">
              <span>{job.icon} <b className="text-white">{job.name}</b> — you stake {fmt(job.cost)}</span>
              <span className="flex gap-1">{job.roles.map((r) => <span key={r} title={OC_ROLES[r]?.name}>{OC_ROLES[r]?.icon}</span>)}</span>
            </div>
            <button onClick={() => run(() => createTeam({ jobId }), `Crew opened for ${job.name} — recruiting…`)}
              disabled={busy || (player.level ?? 0) < job.level || (player.money ?? 0) < job.cost}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-xs font-black tracking-widest text-white hover:from-red-500 hover:to-red-400 disabled:opacity-40">
              OPEN CREW — {fmt(job.cost)}
            </button>
            <p className="mt-2 text-[9px] text-slate-600">
              Every member pays the stake when the job starts. Crews pick specialist roles — matching the job's favored roles boosts the odds, duplicate roles hurt them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

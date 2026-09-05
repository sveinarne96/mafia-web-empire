import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, LogOut, Play, Crown, Swords } from "lucide-react";

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

const OC_JOBS = [
  { id: "job_grocery_heist", icon: "🛒", name: "Grocery Depot Heist", level: 5, cost: 3_000_000 },
  { id: "job_armored_truck", icon: "🚛", name: "Armored Truck Ambush", level: 10, cost: 8_000_000 },
  { id: "job_casino_floor", icon: "🎰", name: "Casino Floor Sweep", level: 15, cost: 18_000_000 },
  { id: "job_port_raid", icon: "⚓", name: "Port Container Raid", level: 20, cost: 35_000_000 },
  { id: "job_bank_branch", icon: "🏦", name: "Federal Bank Branch", level: 25, cost: 60_000_000 },
  { id: "job_art_vault", icon: "🖼️", name: "Art Vault Job", level: 30, cost: 95_000_000 },
  { id: "job_central_vault", icon: "💎", name: "Central Vault Cracking", level: 40, cost: 160_000_000 },
  { id: "job_empire_reserve", icon: "👑", name: "Empire Reserve Job", level: 55, cost: 280_000_000 },
];

export function OrganizedCrimeTeamsPage() {
  const player = useQuery(api.game.getPlayer);
  const myTeam = useQuery(api.ocTeams.getMyOcTeam);
  const openTeams = useQuery(api.ocTeams.listOpenOcTeams);
  const stats = useQuery(api.ocTeams.getOcStats);
  const createTeam = useMutation(api.ocTeams.createOcTeam);
  const joinTeam = useMutation(api.ocTeams.joinOcTeam);
  const leaveTeam = useMutation(api.ocTeams.leaveOcTeam);
  const startTeam = useMutation(api.ocTeams.startOcTeam);

  const [jobId, setJobId] = useState(OC_JOBS[0].id);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
              <p className="text-[11px] text-slate-400">Team up with others to commit organized crimes — crews of three, winner-takes-the-lot style scores.</p>
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
              <span className="text-4xl">{myTeam.jobIcon}</span>
              <div>
                <h2 className="text-lg font-black text-white">{myTeam.jobName}</h2>
                <p className="text-[10px] text-slate-500">Hosted by {myTeam.hostName} · stake {fmt(myTeam.cost)} each · pays {fmt(myTeam.rewardMin)}–{fmt(myTeam.rewardMax)} split 3 ways</p>
              </div>
            </div>
            <button onClick={() => run(() => leaveTeam({ teamId: myTeam._id }), "You left the crew.")}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-[10px] font-black text-red-400 hover:bg-red-500/20 disabled:opacity-50">
              <LogOut className="size-3.5" /> LEAVE CREW
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((seat) => {
              const member = myTeam.members[seat];
              const seatFilled = !!member;
              return (
                <div key={seat} className={`rounded-xl border p-3 ${seatFilled ? (seat === 0 ? "border-red-500/40 bg-red-950/20" : "border-slate-700/60 bg-slate-950/60") : "border-dashed border-slate-700/60 bg-slate-950/40"}`}>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-500">
                    <span>Seat {seat + 1}</span>
                    {seatFilled && seat === 0 && <span className="flex items-center gap-1 text-amber-400"><Crown className="size-3" /> Host</span>}
                  </div>
                  {seatFilled ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5 text-sm font-black text-white">
                        <span className="size-2 rounded-full bg-green-400" />
                        {member.name}{member.id === meId && <span className="text-[9px] text-red-400">(YOU)</span>}
                      </div>
                      <div className="text-[10px] text-slate-500">Lv.{member.level} · {rankName(member.level)}</div>
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

          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] text-amber-200/80">
            {myTeam.members.length < 3
              ? `🕵️ Waiting for more members — need ${3 - myTeam.members.length} more to start. Members keep their rank name and level for the crew.`
              : "✅ Crew is full. The host can launch the job now — every seat pays its stake and splits the take."}
          </div>

          {myTeam.isHost && (
            <button onClick={() => run(() => startTeam({ teamId: myTeam._id }).then((r: any) => ({ message: r.win ? `✅ ${r.teamName} COMPLETE — every member banked ${fmt(r.rewardEach)} (+${r.xpEach} XP)` : `❌ ${r.teamName} went sideways — stake lost, +${r.xpEach} XP each.` })), "Crew launched.")}
              disabled={busy || myTeam.members.length < 3}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-3.5 text-xs font-black tracking-widest text-white hover:from-red-500 hover:to-orange-500 disabled:opacity-40">
              <Play className="size-4" /> {myTeam.members.length < 3 ? `WAITING — ${3 - myTeam.members.length} MORE NEEDED` : "START THE JOB"}
            </button>
          )}
        </div>
      ) : (
        /* ── Join / create flow ── */
        <div className="grid lg:grid-cols-2 gap-5">
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
                    <div className="text-[9px] text-slate-500">by {t.hostName} · Lv.{t.levelReq}+ · stake {fmt(t.cost)}</div>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300">{t.count}/{t.max}</span>
                  <button onClick={() => run(() => joinTeam({ teamId: t._id }), `Joined ${t.jobName}.`)}
                    disabled={busy}
                    className="rounded-xl bg-sky-600 px-4 py-2 text-[10px] font-black text-white hover:bg-sky-500 disabled:opacity-50">
                    JOIN OC
                  </button>
                </div>
              ))}
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
                      {locked ? `🔒 Lv.${j.level}` : affordable ? `Stake ${fmt(j.cost)}` : "Not enough cash"}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-[10px] text-slate-400">
              <span>{job.icon} <b className="text-white">{job.name}</b> — you stake {fmt(job.cost)}</span>
            </div>
            <button onClick={() => run(() => createTeam({ jobId }), `Crew opened for ${job.name} — recruiting…`)}
              disabled={busy || (player.level ?? 0) < job.level || (player.money ?? 0) < job.cost}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-xs font-black tracking-widest text-white hover:from-red-500 hover:to-red-400 disabled:opacity-40">
              OPEN CREW — {fmt(job.cost)}
            </button>
            <p className="mt-2 text-[9px] text-slate-600">Every member pays the stake when the job starts. Crew success odds rise with every member's level — each crew has a rank name for its level.</p>
          </div>
        </div>
      )}
    </div>
  );
}

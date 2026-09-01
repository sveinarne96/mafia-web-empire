import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Share2, Copy, Users, Trophy, TrendingUp, ChevronRight, Gift } from "lucide-react";

const REFERRAL_MILESTONES = [
  { rank: "Street Rat", count: 0, icon: "🐀", color: "text-gray-400" },
  { rank: "Thug", count: 3, icon: "⚡", color: "text-slate-400" },
  { rank: "Enforcer", count: 5, icon: "👊", color: "text-yellow-400" },
  { rank: "Soldier", count: 10, icon: "🔫", color: "text-cyan-400" },
  { rank: "Captain", count: 20, icon: "⚔️", color: "text-green-400" },
  { rank: "Consigliere", count: 35, icon: "🛡️", color: "text-blue-400" },
  { rank: "Underboss", count: 50, icon: "🗡️", color: "text-orange-400" },
  { rank: "Don", count: 75, icon: "💀", color: "text-red-400" },
  { rank: "Godfather", count: 100, icon: "🔱", color: "text-purple-400" },
  { rank: "Shadow Emperor", count: 200, icon: "👑", color: "text-amber-400" },
];

export function ReferralPage() {
  const player = useQuery(api.game.getPlayer);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"link" | "rewards" | "players">("link");

  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const referralCode = player.nickname
    ? `SHADOW-${player.nickname.toUpperCase()}-${(player._id ?? "??").slice(-6)}`
    : "UNKNOWN";
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : referralCode;

  const totalReferrals = (player as any).totalReferrals ?? 0;
  const referredPlayers = (player as any).referredPlayers ?? [];
  const referrer = (player as any).referrer ?? null;

  // Calculate milestone progress
  const nextMilestone = REFERRAL_MILESTONES.find((m) => totalReferrals < m.count) ?? REFERRAL_MILESTONES[REFERRAL_MILESTONES.length - 1];
  const prevMilestone = [...REFERRAL_MILESTONES].reverse().find((m) => m.count <= totalReferrals);
  const milestonesUnlocked = REFERRAL_MILESTONES.filter((m) => totalReferrals >= m.count).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Share2 className="size-7 text-primary" />
        <h2 className="text-2xl font-bold mafia-gold">Referral System</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center border border-amber-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Total Referrals</div>
          <div className="text-2xl font-black text-amber-400">{totalReferrals}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center border border-purple-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Milestones Unlocked</div>
          <div className="text-2xl font-black text-purple-400">{milestonesUnlocked}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center border border-green-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Next Milestone</div>
          <div className="text-lg font-black text-green-400">{nextMilestone.rank}</div>
          <div className="text-[9px] text-muted-foreground">{nextMilestone.count - totalReferrals} more needed</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center border border-blue-500/20">
          <div className="text-[10px] text-muted-foreground uppercase">Referred By</div>
          <div className="text-sm font-bold text-blue-400">{referrer || "No referrer"}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {([
          { key: "link" as const, label: "🔗 Referral Link", },
          { key: "rewards" as const, label: "🎁 Referral Rewards", },
          { key: "players" as const, label: "👥 Referred Players", },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              tab === t.key
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "border-slate-700/40 text-slate-500 hover:text-slate-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Referral Link Tab */}
      {tab === "link" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-6 text-center space-y-4 border border-amber-500/20">
            <div className="text-4xl">🔗</div>
            <div className="text-sm text-muted-foreground">Share this link to invite new players using your referral.</div>

            {/* Referral Link */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 font-mono text-xs text-slate-300 break-all">
              {referralLink}
            </div>

            <div className="flex gap-2 justify-center">
              <button onClick={() => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2">
                {copied ? "✅ Copied!" : <><Copy className="size-4" /> Copy Referral Link</>}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(referralCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700/40 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all flex items-center gap-2">
                <Copy className="size-4" /> Code Only
              </button>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/80">
              💡 Share this link on social media, forums, or with friends to earn rewards for every player who joins!
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-3">🏆 Referral Milestones</div>
            <div className="space-y-1.5">
              {REFERRAL_MILESTONES.map((m) => {
                const done = totalReferrals >= m.count;
                const isNext = nextMilestone.count === m.count;
                return (
                  <div key={m.count} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    done ? "bg-green-950/20 border border-green-500/30" :
                    isNext ? "bg-amber-950/20 border border-amber-500/30" :
                    "bg-slate-900/30 border border-slate-700/20"
                  }`}>
                    <span className="text-lg">{m.icon}</span>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${m.color}`}>{m.rank}</div>
                      <div className="text-[9px] text-muted-foreground">{m.count} referrals</div>
                    </div>
                    {done ? (
                      <span className="text-[9px] text-green-400 font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30">✅ UNLOCKED</span>
                    ) : isNext ? (
                      <span className="text-[9px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                        {totalReferrals}/{m.count}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600">🔒</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {tab === "rewards" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-4 border border-green-500/20">
            <div className="text-sm font-bold mb-3">🎁 Referral Rewards</div>
            <div className="space-y-2">
              {[
                { icon: "💀", title: "Bullets Revenue Share", desc: "Receive 2.5% of bullets your referral melts.", always: true },
                { icon: "🎯", title: "Objective Rewards Share", desc: "Receive 2.5% of rewards from objectives your referral completes.", always: true },
                { icon: "📈", title: "Empire Sale Share", desc: "Receive 2.5% of your referral's empire sale points.", always: true },
                { icon: "⭐", title: "Rank XP Share (You)", desc: "Receive 2.5% of your referral's rank XP gains.", always: true },
                { icon: "💰", title: "Crime Cash Share", desc: "Receive 2.5% of your referral's crime cash earnings.", always: true },
                { icon: "⭐", title: "Rank XP Share (Referrer)", desc: "Receive 2.5% of your referrer's rank XP gains once you reach Criminal.", milestone: "Criminal" },
                { icon: "💰", title: "Crime Cash Share (Referrer)", desc: "Receive 2.5% of your referrer's crime cash earnings once you reach Gangster.", milestone: "Gangster" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-700/20">
                  <span className="text-xl">{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{r.title}</div>
                    <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                  </div>
                  {r.always ? (
                    <span className="text-[8px] text-green-400 font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30">ACTIVE</span>
                  ) : (
                    <span className="text-[8px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                      Requires {r.milestone}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Unlocks */}
          <div className="mafia-card rounded-xl p-4 border border-purple-500/20">
            <div className="text-sm font-bold mb-1">📊 Milestone Progress</div>
            <div className="text-[10px] text-muted-foreground mb-3">Track your referred players and how close they are to each referral milestone.</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
                <div className="text-[10px] text-muted-foreground">Criminal</div>
                <div className="text-lg font-black text-amber-400">{totalReferrals} / 10</div>
              </div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 p-3 text-center">
                <div className="text-[10px] text-muted-foreground">Gangster</div>
                <div className="text-lg font-black text-red-400">{totalReferrals} / 25</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referred Players Tab */}
      {tab === "players" && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
            <div className="text-sm font-bold mb-1">👥 Your Referred Players</div>
            <div className="text-[10px] text-muted-foreground mb-3">Players who joined using your referral link.</div>
            {referredPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">You have not referred any players yet.</p>
                <p className="text-[10px] mt-1">Share your referral link to start earning rewards!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {referredPlayers.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/30 border border-slate-700/20">
                    <span className="text-xs text-muted-foreground w-6 text-center">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{p.nickname ?? "Unknown"}</div>
                      <div className="text-[9px] text-muted-foreground">Lv.{p.level ?? 1}</div>
                    </div>
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

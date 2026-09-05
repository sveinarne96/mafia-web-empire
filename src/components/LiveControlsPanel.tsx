import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Wrench, Megaphone, Zap, ShieldAlert, Ghost, TrendingUp, Target, Activity, Ticket } from "lucide-react";

/**
 * LIVE CONTROLS — the real admin console.
 * Every control here writes straight to the `gameConfig`/`announcements`
 * tables, and every connected player's game updates instantly through
 * reactive Convex subscriptions. No redeploys, no new links.
 */

const fmtLeft = (until: number) => {
  const diff = Math.max(0, until - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mafia-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h4 className="text-sm font-bold">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function PresetButtons({ options, onPick, active }: { options: { label: string; value: number }[]; onPick: (v: number) => void; active?: number }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {options.map((o) => (
        <button
          key={o.label}
          onClick={() => onPick(o.value)}
          className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${active === o.value ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const DURATIONS = [
  { label: "1h", value: 1 },
  { label: "6h", value: 6 },
  { label: "12h", value: 12 },
  { label: "24h", value: 24 },
  { label: "48h", value: 48 },
  { label: "7d", value: 168 },
];

const COLORS = ["amber", "red", "green", "blue", "purple", "cyan"];
const EMOJIS = ["📣", "🔥", "💰", "⚡", "🚨", "🎉", "💀", "🏆", "🪙", "🥷"];

export function LiveControlsPanel({ onClose }: { onClose: () => void }) {
  const live = useQuery(api.gameControl.getLiveConfig);
  const adminCfg = useQuery(api.gameControl.getAdminConfig);
  const updateConfig = useMutation(api.gameControl.updateConfig);
  const postAnnouncement = useMutation(api.gameControl.postAnnouncement);
  const removeAnnouncement = useMutation(api.gameControl.removeAnnouncement);
  const postHeadline = useMutation(api.gameControl.postHeadline);
  const setSuperBoost = useMutation(api.gameControl.setSuperBoost);
  const broadcast = useMutation(api.admin.broadcastMessage);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [xpDuration, setXpDuration] = useState(24);
  const [cashDuration, setCashDuration] = useState(24);
  const [annText, setAnnText] = useState("");
  const [annEmoji, setAnnEmoji] = useState("📣");
  const [annColor, setAnnColor] = useState("amber");
  const [annHours, setAnnHours] = useState(24);
  const [headline, setHeadline] = useState("");
  const [maintMsg, setMaintMsg] = useState("");
  const [crimeBonus, setCrimeBonus] = useState(0);
  const [jackpot, setJackpot] = useState("");

  const run = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || "Action failed" });
    }
    setBusy(false);
  };

  if (!live || !adminCfg) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="size-7 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">🎛️ Live Game Controls</h2>
            <p className="text-xs text-muted-foreground">
              Every change below is applied to the live game <span className="text-green-400 font-bold">instantly</span> for all connected players — no redeploy, no new link.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕ Close</button>
      </div>

      {msg && (
        <div className={`text-xs font-bold rounded-lg px-3 py-2 ${msg.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {msg.ok ? "✅ " : "❌ "}{msg.text}
        </div>
      )}

      {/* Live status strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">⚡ XP Multiplier</div>
          <div className={`text-lg font-black ${live.xpMultiplier > 1 ? "text-cyan-400" : "text-muted-foreground"}`}>
            {live.xpMultiplier > 1 ? `×${live.xpMultiplier} (${fmtLeft(live.xpMultiplierUntil)})` : "×1"}
          </div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">💰 Cash Multiplier</div>
          <div className={`text-lg font-black ${live.cashMultiplier > 1 ? "text-green-400" : "text-muted-foreground"}`}>
            {live.cashMultiplier > 1 ? `×${live.cashMultiplier} (${fmtLeft(live.cashMultiplierUntil)})` : "×1"}
          </div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">🎯 Crime Bonus</div>
          <div className={`text-lg font-black ${live.crimeSuccessBonus > 0 ? "text-yellow-400" : "text-muted-foreground"}`}>
            {live.crimeSuccessBonus > 0 ? `+${Math.round(live.crimeSuccessBonus * 100)}%` : "0%"}
          </div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">🔧 Maintenance</div>
          <div className={`text-lg font-black ${live.maintenanceMode ? "text-red-400 animate-pulse" : "text-green-400"}`}>
            {live.maintenanceMode ? "ON" : "OFF"}
          </div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">📣 Active Banners</div>
          <div className="text-lg font-black text-primary">{live.announcements.length}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground">🔥 Super Boost</div>
          <div className={`text-lg font-black ${live.superBoost.active ? "text-amber-400 animate-pulse" : live.superBoost.enabled ? "text-muted-foreground" : "text-red-400"}`}>
            {live.superBoost.active ? "ACTIVE" : live.superBoost.enabled ? "SCHEDULED" : "OFF"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Super Boost — automatic weekly event */}
        <Card title="🔥 Super Boost — automatic weekly event" icon={<Zap className="size-4 text-amber-400" />}>
          <div className={`rounded-lg px-3 py-2 text-xs font-black flex items-center gap-2 border ${live.superBoost.active ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : live.superBoost.enabled ? "bg-white/5 text-muted-foreground border-border/60" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            <span>{live.superBoost.active ? "🟢 ACTIVE NOW" : live.superBoost.enabled ? "⏳ SCHEDULED (auto)" : "⛔ DISABLED"}</span>
            <span className="ml-auto text-[10px] font-bold opacity-70">
              {live.superBoost.active
                ? `ends ${fmtLeft(live.superBoost.endsAt)}`
                : live.superBoost.enabled
                  ? "next start: Thu 00:00 UTC"
                  : "manual override"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Turns itself on every <span className="text-amber-300 font-bold">Thursday 00:00 UTC</span> and off every <span className="text-amber-300 font-bold">Monday 00:00 UTC</span> — zero maintenance. Stack with manual boosts below.</p>
          <ul className="text-[10px] text-muted-foreground space-y-1">
            <li>⏱️ <span className="text-foreground font-bold">75% less waiting time</span> on criminal actions</li>
            <li>⚡ <span className="text-foreground font-bold">75% less energy</span> used per crime</li>
            <li>💥 <span className="text-foreground font-bold">+75% XP</span> boost</li>
            <li>💰 <span className="text-foreground font-bold">+75% cash</span> boost</li>
            <li>🏅 <span className="text-foreground font-bold">+75% points</span> boost</li>
            <li>🔫 <span className="text-foreground font-bold">75% chance</span> to loot bullets on every criminal action</li>
          </ul>
          <div className="flex gap-2">
            <button disabled={busy || live.superBoost.enabled}
              onClick={() => run(() => setSuperBoost({ enabled: true }), "Super Boost schedule ENABLED — auto-starts every Thursday 00:00 UTC")}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 disabled:opacity-40">
              🔥 Enable schedule
            </button>
            <button disabled={busy || !live.superBoost.enabled}
              onClick={() => run(() => setSuperBoost({ enabled: false }), "Super Boost turned OFF — players see no boost")}
              className="flex-1 px-4 py-2 bg-white/5 text-muted-foreground rounded-lg text-xs font-bold hover:bg-white/10 disabled:opacity-40">
              ⛔ Turn off
            </button>
          </div>
        </Card>

        {/* XP / Cash boosts */}
        <Card title="⚡ Global Boosts (XP & Cash)" icon={<Zap className="size-4 text-cyan-400" />}>
          <div className="text-[10px] text-muted-foreground">XP Multiplier — every crime/action reward scales live</div>
          <PresetButtons
            active={adminCfg.xpMultiplier > 1 ? adminCfg.xpMultiplier : undefined}
            options={[{ label: "1x", value: 1 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }, { label: "5x", value: 5 }, { label: "10x", value: 10 }, { label: "25x", value: 25 }, { label: "50x", value: 50 }, { label: "100x", value: 100 }]}
            onPick={(v) => run(() => updateConfig({ xpMultiplier: v, xpDurationHours: xpDuration }), `XP boost set to ${v}x for ${xpDuration}h`)}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Duration:</span>
            {DURATIONS.map((d) => (
              <button key={d.value} onClick={() => setXpDuration(d.value)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${xpDuration === d.value ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}>
                {d.label}
              </button>
            ))}
          </div>
          <div className="border-t border-border/60 pt-2">
            <div className="text-[10px] text-muted-foreground mb-1">Cash Multiplier</div>
            <PresetButtons
              active={adminCfg.cashMultiplier > 1 ? adminCfg.cashMultiplier : undefined}
              options={[{ label: "1x", value: 1 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }, { label: "5x", value: 5 }, { label: "10x", value: 10 }, { label: "25x", value: 25 }]}
              onPick={(v) => run(() => updateConfig({ cashMultiplier: v, cashDurationHours: cashDuration }), `Cash boost set to ${v}x for ${cashDuration}h`)}
            />
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
              <span className="text-[10px] text-muted-foreground">Duration:</span>
              {DURATIONS.map((d) => (
                <button key={d.value} onClick={() => setCashDuration(d.value)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${cashDuration === d.value ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Announcements */}
        <Card title="📣 Live Announcements (banner for every player)" icon={<Megaphone className="size-4 text-amber-400" />}>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => setAnnEmoji(e)}
                className={`size-8 rounded-lg text-base flex items-center justify-center transition ${annEmoji === e ? "bg-primary/30 border border-primary" : "bg-white/5 border border-transparent hover:bg-white/10"}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setAnnColor(c)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition ${annColor === c ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                {c}
              </button>
            ))}
          </div>
          <textarea value={annText} onChange={(e) => setAnnText(e.target.value)} placeholder="Announcement text — appears instantly in every open game..."
            className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none" />
          <div className="flex items-center gap-2">
            <select value={annHours} onChange={(e) => setAnnHours(Number(e.target.value))}
              className="bg-black/30 border border-border rounded-lg px-2 py-1.5 text-xs">
              {[1, 6, 12, 24, 48, 168].map((h) => <option key={h} value={h}>{h === 168 ? "7 days" : `${h} hours`}</option>)}
            </select>
            <button
              disabled={busy || !annText.trim()}
              onClick={() => run(
                () => postAnnouncement({ text: annText.trim(), emoji: annEmoji, color: annColor, durationHours: annHours }),
                `Banner posted — visible to all players for ${annHours}h`
              ).then(() => setAnnText(""))}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 disabled:opacity-40 transition">
              📣 Post Banner
            </button>
            <button
              disabled={busy || !annText.trim()}
              onClick={() => run(
                async () => {
                  await broadcast({ message: annText.trim() });
                  await postAnnouncement({ text: annText.trim(), emoji: annEmoji, color: annColor, durationHours: annHours });
                },
                `Banner + inbox message sent to all players`
              ).then(() => setAnnText(""))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition">
              📣 + 📬 Also notify inbox
            </button>
          </div>
          {live.announcements.length > 0 && (
            <div className="space-y-1">
              {live.announcements.map((a) => (
                <div key={String(a._id)} className="flex items-center gap-2 bg-black/20 border border-border/60 rounded-lg px-2.5 py-1.5">
                  <span>{a.emoji}</span>
                  <span className="flex-1 text-xs truncate">{a.text}</span>
                  <span className="text-[9px] text-muted-foreground shrink-0">{Math.ceil(Math.max(0, a.expiresAt - Date.now()) / 3600000)}h left</span>
                  <button onClick={() => run(() => removeAnnouncement({ announcementId: a._id as any }), "Banner removed")}
                    className="text-red-400 hover:text-red-300 text-xs shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Maintenance & misc */}
        <Card title="🔧 Maintenance Mode" icon={<ShieldAlert className="size-4 text-red-400" />}>
          <input value={maintMsg} onChange={(e) => setMaintMsg(e.target.value)} placeholder="Maintenance message (players see this)"
            className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button disabled={busy}
              onClick={() => run(() => updateConfig({ maintenanceMode: true, maintenanceMessage: maintMsg.trim() || "🔧 Server maintenance in progress — back soon!" }), "Maintenance mode ENABLED — crimes are blocked, banner shows")}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-40">
              ⛔ Enable
            </button>
            <button disabled={busy}
              onClick={() => run(() => updateConfig({ maintenanceMode: false }), "Maintenance mode disabled — game is live")}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-40">
              ✅ Disable
            </button>
          </div>
        </Card>

        {/* Crime / economy / misc */}
        <Card title="🎛️ Economy & Crime Tuning" icon={<TrendingUp className="size-4 text-green-400" />}>
          <div className="text-[10px] text-muted-foreground">Crime success bonus (+% added to the 95% base)</div>
          <input type="range" min={0} max={25} value={Math.round((adminCfg.crimeSuccessBonus ?? 0) * 100)} onChange={(e) => setCrimeBonus(Number(e.target.value))}
            className="w-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-yellow-400">+{Math.round((adminCfg.crimeSuccessBonus ?? 0) * 100)}%</span>
            <button disabled={busy}
              onClick={() => run(() => updateConfig({ crimeSuccessBonus: crimeBonus / 100 }), `Crime success bonus set to +${crimeBonus}%`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-40">
              Apply
            </button>
          </div>
          <div className="border-t border-border/60 pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Activity className="size-3" /> Energy regen/min</span>
              <select value={adminCfg.energyRegenPerMinute ?? 5} onChange={(e) => run(() => updateConfig({ energyRegenPerMinute: Number(e.target.value) }), "Energy regen updated")}
                className="bg-black/30 border border-border rounded-lg px-2 py-1 text-xs">
                {[2, 5, 10, 20, 50, 100].map((v) => <option key={v} value={v}>{v}/min</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Ticket className="size-3" /> Lotto jackpot</span>
              <input type="number" value={jackpot} onChange={(e) => setJackpot(e.target.value)} placeholder={adminCfg.lottoJackpot ? adminCfg.lottoJackpot.toLocaleString() : "0"}
                className="flex-1 bg-black/30 border border-border rounded-lg px-2 py-1.5 text-xs" />
              <button disabled={busy || jackpot === ""}
                onClick={() => run(() => updateConfig({ lottoJackpot: Number(jackpot) }), `Jackpot set to $${Number(jackpot).toLocaleString()}`)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold disabled:opacity-40">
                Set
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Ghost className="size-3" /> Ghost mode</span>
              <button disabled={busy}
                onClick={() => run(() => updateConfig({ ghostMode: !adminCfg.ghostMode }), adminCfg.ghostMode ? "Ghost mode disabled" : "Ghost mode enabled")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${adminCfg.ghostMode ? "bg-purple-600 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                {adminCfg.ghostMode ? "👻 ON" : "👻 OFF"}
              </button>
            </div>
          </div>
        </Card>

        {/* Headlines */}
        <Card title="📰 Post a News Headline" icon={<Target className="size-4 text-red-400" />}>
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder='Headline — e.g. "Police raid Chinatown, 14 arrested"'
            className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
          <div className="flex items-center gap-2">
            <select defaultValue="breaking" className="bg-black/30 border border-border rounded-lg px-2 py-1.5 text-xs" id="hl-type">
              <option value="breaking">🚨 Breaking</option>
              <option value="crime">🔪 Crime</option>
              <option value="business">📈 Business</option>
              <option value="sports">🏆 Sports</option>
              <option value="city">🏙️ City</option>
            </select>
            <button disabled={busy || !headline.trim()}
              onClick={() => {
                const t = (document.getElementById("hl-type") as HTMLSelectElement)?.value ?? "breaking";
                run(() => postHeadline({ title: headline.trim(), crimeType: t }), "Headline posted — visible in the news ticker").then(() => setHeadline(""));
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-40">
              Post
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Latest: {live.headlines[0] ? `${live.headlines[0].title}` : "no headlines yet"}</p>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[10px] text-muted-foreground">
        ⚡ Changes apply instantly via live Convex subscriptions — every player sees updates without refreshing.
      </motion.div>
    </div>
  );
}
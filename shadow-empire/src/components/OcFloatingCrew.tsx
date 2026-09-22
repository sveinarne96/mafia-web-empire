import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Swords, X, Volume2, VolumeX, BellRing } from "lucide-react";

// ─────────────────────────── OC SOUNDS ───────────────────────────
// Tiny WebAudio chimes — no assets needed. Muted state is per browser.
let audioCtx: AudioContext | null = null;

function tone(freq: number, startAt: number, dur: number, type: OscillatorType = "sine", vol = 0.12) {
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return;
  audioCtx = audioCtx || new AC();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(vol, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(startAt);
  osc.stop(startAt + dur + 0.05);
}

const MUTE_KEY = "ocSoundMuted";
export const isOcMuted = () => {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
};
export const setOcMuted = (muted: boolean) => {
  try { muted ? localStorage.setItem(MUTE_KEY, "1") : localStorage.removeItem(MUTE_KEY); } catch { /* noop */ }
};

/** ping: urgent double ring · chat: soft blip · ready: quick chime. */
export function playOcSound(kind: "ping" | "chat" | "ready" = "ping") {
  if (isOcMuted()) return;
  try {
    const t = (audioCtx?.currentTime ?? 0) + 0.02;
    if (kind === "ping") {
      tone(880, t, 0.14, "square", 0.07);
      tone(1174.66, t + 0.16, 0.22, "square", 0.07);
    } else if (kind === "chat") {
      tone(660, t, 0.12, "sine", 0.09);
    } else {
      tone(523.25, t, 0.12, "sine", 0.09);
      tone(659.25, t + 0.1, 0.16, "sine", 0.09);
    }
  } catch { /* audio blocked — ignore */ }
}

const fmtAgo = (at: number) => {
  const s = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
};

type ChatMsg = { fromId: string; fromName: string; text: string; system?: boolean; at: number };

/**
 * Always-mounted crew watcher. When you are seated in an OC lobby and are NOT
 * on the OC page, a floating card shows readiness + unread activity; pings and
 * messages from crewmates play a sound anywhere in the game.
 */
export function OcFloatingCrew({ active, onOpen }: { active: boolean; onOpen: () => void }) {
  const team = useQuery(api.ocTeams.getMyOcTeam);
  const player = useQuery(api.game.getPlayer);

  const [unread, setUnread] = useState(0);
  const [muted, setMuted] = useState(isOcMuted());
  const [nowTick, setNowTick] = useState(Date.now());

  // Last-seen markers (refs survive renders so each fresh event fires once).
  const prevPingAt = useRef(0);
  const prevChatAt = useRef(0);
  const prevChatFrom = useRef("");
  const prevReadyKey = useRef("");
  const prevRoster = useRef("");

  const meId = (player as any)?._id ?? "";
  const teamAny = team as any;
  const chat: ChatMsg[] = teamAny?.chat ?? [];
  const last = chat[chat.length - 1];
  const members = teamAny?.members ?? [];
  const readyIds: string[] = teamAny?.readyIds ?? [];
  const readyKey = readyIds.join(",");
  const rosterKey = members.map((m: any) => m.id).join(",");
  const visible = !!team && !active;

  useEffect(() => {
    if (!team) return;
    const now = Date.now();
    // Clock for idle timers while the card is up.
    setNowTick(now);

    const pingAt = teamAny?.lastPingAt ?? 0;
    const isNewChat = !!last && last.at > prevChatAt.current;
    const fromOther = !!last && last.fromId !== meId;
    const isMyPing = isNewChat && pingAt > prevPingAt.current && !!last.system && last.fromId === meId;

    // 1) A ping (never your own) → loud double ring, everywhere in the game.
    if (pingAt > prevPingAt.current) {
      prevPingAt.current = pingAt;
      if (!isMyPing) {
        playOcSound("ping");
        if (!active) setUnread((u) => u + 1);
      }
    } else if (isNewChat && fromOther && !last.system) {
      // 2) Plain chat from a crewmate → soft blip.
      playOcSound("chat");
      if (!active) setUnread((u) => u + 1);
    } else if (isNewChat && fromOther && last.system) {
      // 3) System lines (joined / kicked / ready status) → light blip.
      playOcSound("chat");
      if (!active) setUnread((u) => u + 1);
    }
    if (isNewChat) {
      prevChatAt.current = last.at;
      prevChatFrom.current = last.fromId;
    }

    // 4) A crewmate flipped readiness / the roster changed → chime + badge.
    if (readyKey !== prevReadyKey.current) {
      if (prevReadyKey.current !== "") {
        playOcSound("ready");
        if (!active) setUnread((u) => u + 1);
      }
      prevReadyKey.current = readyKey;
    }
    if (rosterKey !== prevRoster.current) {
      if (prevRoster.current !== "") {
        playOcSound("ready");
        if (!active) setUnread((u) => u + 1);
      }
      prevRoster.current = rosterKey;
    }
  }, [team, active, meId, last, readyKey, rosterKey, teamAny?.lastPingAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dismiss unread when the user opens the crew.
  useEffect(() => {
    if (active) setUnread(0);
  }, [active]);

  if (!team || active) return null;

  const readyCount = members.filter((m: any) => m.id === teamAny?.hostId || readyIds.includes(m.id)).length;
  const idleNow = (nowTick || Date.now());
  const idleMember = members.find((m: any) => m.id !== teamAny?.hostId && !readyIds.includes(m.id) && idleNow - (m.seenAt ?? idleNow) > 60_000);

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 animate-page-enter">
      <div className={`relative overflow-hidden rounded-2xl border bg-slate-950/95 shadow-2xl backdrop-blur ${unread > 0 ? "border-amber-500/60" : "border-red-500/30"}`}
        style={{ boxShadow: unread > 0 ? "0 0 24px rgba(245,158,11,0.25)" : "0 10px 40px rgba(0,0,0,0.6)" }}>
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 0%, #ef444433 0, transparent 60%)" }} />
        <div className="relative flex items-center gap-2 border-b border-slate-800/80 px-3 py-2">
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
            <Swords className="size-4" />
            {unread > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-black">{unread}</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black tracking-wider text-red-300 uppercase">{teamAny?.jobIcon} {teamAny?.jobName}</div>
            <div className="text-[9px] text-slate-500 truncate">Crew · {members.length}/3 · {readyCount} ready{unread > 0 ? " · new activity" : ""}</div>
          </div>
          <button onClick={() => { const m = !muted; setOcMuted(m); setMuted(m); }} title={muted ? "Unmute crew sounds" : "Mute crew sounds"}
            className="rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors">
            {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </button>
          <button onClick={() => { setUnread(0); onOpen(); }} title="Open OC lobby"
            className="rounded-md bg-gradient-to-r from-red-600 to-orange-600 px-2.5 py-1 text-[9px] font-black text-white hover:from-red-500 hover:to-orange-500 transition">
            OPEN
          </button>
        </div>
        <div className="relative space-y-1.5 px-3 py-2.5">
          {/* readiness pips */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((seat) => {
              const m = members[seat];
              const ready = !!m && (m.id === teamAny?.hostId || readyIds.includes(m.id));
              return m ? (
                <span key={m.id} className={`rounded-full px-2 py-0.5 text-[8px] font-black ${ready ? "bg-green-500/15 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {m.name.split(" ")[0]}{ready ? " ✓" : " …"}
                </span>
              ) : (
                <span key={`e${seat}`} className="rounded-full border border-dashed border-slate-700 px-2 py-0.5 text-[8px] text-slate-600">open</span>
              );
            })}
          </div>
          {idleMember && (
            <div className="flex items-center gap-1 text-[9px] text-amber-300/80">
              <BellRing className="size-3" /> {idleMember.name} idle — a ping may auto-kick them.
            </div>
          )}
          <div className="max-h-12 overflow-hidden rounded-lg bg-slate-900/70 px-2 py-1 text-[9px] leading-snug text-slate-400">
            {last ? (
              <>
                <span className="font-black text-slate-300">{last.fromId === meId ? "You" : last.fromName}:</span> {last.text}
                <span className="ml-1 text-slate-600">{fmtAgo(last.at)}</span>
              </>
            ) : (
              "Waiting for crew chatter…"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

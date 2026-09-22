import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ActionCard, ActionHero, ExecuteButton, SafetyNote,
} from "@/components/ActionVisuals";
import {
  DockPage, ChopShopPage, GraffitiPage, PawnPage, CabPage, DogsPage,
  NightMarketPage, CablePage, NumbersPage, ValetPage, BathhousePage, BillboardPage,
} from "@/components/ExpansionPages";

/* ═════════════════════════════ game-language page styles ═════════════════════════════ */

const money = (v: number) => `$${Math.floor(v).toLocaleString()}`;

function Banner({ res }: { res: { ok: boolean; text: string } | null }) {
  if (!res) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mafia-card rounded-xl p-4 text-sm font-bold ${res.ok ? "border-emerald-500/40 text-emerald-300" : "border-red-500/40 text-red-400"}`}
    >
      {res.ok ? "✅ " : "⚠️ "}{res.text}
    </motion.div>
  );
}

type Res = { ok: boolean; text: string } | null;

/* ═════════════════════════════ ADMIN TOGGLES PANEL ═════════════════════════════ */

const RACKET_DEFS = [
  { id: "dock", label: "Dockworker Hustle", icon: "⚓" },
  { id: "chop", label: "Chop-Shop Parts", icon: "🔧" },
  { id: "graffiti", label: "Graffiti Crew", icon: "🎨" },
  { id: "pawn", label: "Pawn Shop Flips", icon: "🏗️" },
  { id: "cab", label: "Cab Company", icon: "🚕" },
  { id: "dogs", label: "Junkyard Dogs", icon: "🐕" },
  { id: "nightmarket", label: "Night Market", icon: "🏮" },
  { id: "cable", label: "Cable Piracy", icon: "📺" },
  { id: "numbers", label: "Numbers Racket", icon: "🎱" },
  { id: "valet", label: "Valet Hustle", icon: "🅿️" },
  { id: "bath", label: "Bathhouse", icon: "♨️" },
  { id: "billboards", label: "Billboards", icon: "🌆" },
];

function RacketsAdminPanel() {
  const me = useQuery(api.game.getPlayer);
  const cfg = useQuery(api.rackets.getRacketConfig);
  const setRacket = useMutation(api.rackets.setRacketEnabled);
  const [busy, setBusy] = useState<string | null>(null);
  const isAdmin = (me as any)?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="mafia-card rounded-xl p-4 text-center">
        <div className="text-sm text-slate-500">🚫 Admin eyes only — the switches behind the city.</div>
      </div>
      );
  }
  return (
    <div className="mafia-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="eyebrow">🎛️ Racket master switches</div>
        <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-amber-300/60">admin</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {RACKET_DEFS.map((r) => {
          const enabled = cfg ? (cfg as any)[r.id] !== false : true;
          return (
            <button
              key={r.id}
              onClick={async () => {
                setBusy(r.id);
                try { await setRacket({ key: r.id, enabled: !enabled }); } catch {}
                setBusy(null);
                try { window.location.reload(); } catch {}
              }}
              className={`action-card !p-3 text-left transition-all ${enabled ? "border-emerald-500/50" : "opacity-50"}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black text-white truncate">{r.label}</div>
                  <div className={`text-[8px] font-black uppercase tracking-widest ${enabled ? "text-emerald-400" : "text-red-400"}`}>
                    {enabled ? "● ON" : "○ OFF"}
                    {busy === r.id ? " …" : ""}
                  </div>
                </div>
                <span className={`ml-auto inline-flex w-7 h-4 rounded-full relative transition-colors ${enabled ? "bg-emerald-500/70" : "bg-slate-600/60"}`}>
                  <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${enabled ? "left-3.5" : "left-0.5"}`} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <SafetyNote>Toggling a racket off hides it from every player instantly (config is reactive) — history is preserved.</SafetyNote>
    </div>
  );
}

/* ═════════════════════════════ HUB PAGE ═════════════════════════════ */

const TABS = [
  { id: "dock", label: "Dock", icon: "⚓" },
  { id: "chop", label: "Chop-Shop", icon: "🔧" },
  { id: "graffiti", label: "Graffiti", icon: "🎨" },
  { id: "pawn", label: "Pawn", icon: "🏗️" },
  { id: "cab", label: "Cab", icon: "🚕" },
  { id: "dogs", label: "Dogs", icon: "🐕" },
  { id: "nightmarket", label: "Night Market", icon: "🏮" },
  { id: "cable", label: "Cable", icon: "📺" },
  { id: "numbers", label: "Numbers", icon: "🎱" },
  { id: "valet", label: "Valet", icon: "🅿️" },
  { id: "bath", label: "Bathhouse", icon: "♨️" },
  { id: "billboards", label: "Billboards", icon: "🌆" },
];

export function RacketsHubPage() {
  const me = useQuery(api.game.getPlayer);
  const cfg = useQuery(api.rackets.getRacketConfig);
  const [tab, setTab] = useState("dock");
  const isAdmin = (me as any)?.role === "admin";

  const enabledTabs = TABS.filter((t) => (cfg ? (cfg as any)[t.id] !== false : true));
  if (enabledTabs.length === 0) {
    return (
      <div className="mafia-card rounded-xl p-6 text-center text-sm text-slate-500">
        🚧 Every racket is switched off by the administration. Come back later.
      </div>
    );
  }
  const current = enabledTabs.some((t) => t.id === tab) ? tab : enabledTabs[0].id;

  const PAGES: Record<string, React.ReactNode> = {
    dock: <DockPage />,
    chop: <ChopShopPage />,
    graffiti: <GraffitiPage />,
    pawn: <PawnPage />,
    cab: <CabPage />,
    dogs: <DogsPage />,
    nightmarket: <NightMarketPage />,
    cable: <CablePage />,
    numbers: <NumbersPage />,
    valet: <ValetPage />,
    bath: <BathhousePage />,
    billboards: <BillboardPage />,
  };

  return (
    <div className="animate-fade-in space-y-4">
      <ActionHero
        icon="🏙️"
        eyebrow="Twelve rackets · one empire"
        title="Rackets Hub"
        description="Every street hustle in the city under one roof — flip goods, run dogs, tap cables, wash cash. Pick your racket."
        accent="amber"
      />

      {/* Tab strip — wraps so every racket stays visible on small screens */}
      <div className="flex flex-wrap gap-1.5">
        {enabledTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
              tab === t.id
                ? "text-amber-300 border-amber-500/50 bg-amber-500/15"
                : "text-slate-400 border-slate-700/40 hover:text-slate-200 hover:border-slate-500/40"
            }`}
          >
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div className="border-t border-amber-500/10 pt-3" />

      {/* Active racket page */}
      {PAGES[current]}

      {/* Admin toggles (admins only) */}
      {isAdmin && <RacketsAdminPanel />}
    </div>
  );
}

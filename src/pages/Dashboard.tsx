import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Building2, Landmark, Trophy, Car, Home, Users, Swords,
  Wrench, Package, Lock, Plane, Group, Target, Calendar, Shield,
  UserMinus, Dice1, Ticket, Wallet, Coins, LandmarkIcon, Hash, Send,
  Inbox, Bell, MessageSquare, Search, BarChart3, HelpCircle, MapPin,
  SwordsIcon, Dices, Banknote, ChevronDown, LogOut, User,
  AlertTriangle, Loader2, CircleDollarSign, Zap, MapPinned,
  ShieldCheck, Skull, TrophyIcon, BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type GamePage =
  | "headquarters" | "bank" | "hospital" | "points" | "crime_car" | "crime_burglarize"
  | "crime_rob" | "fight_club" | "garage" | "items" | "prison" | "airport"
  | "organized_crime" | "missions" | "daily_raid" | "company" | "family"
  | "kill" | "gambling_dice" | "gambling_lotto" | "gambling_blackjack"
  | "gambling_coin" | "gambling_horse" | "gambling_number"
  | "messages" | "inbox" | "notifications_page" | "forum_general"
  | "forum_sales" | "forum_offtopic" | "forum_shadows" | "forum_search"
  | "city_overview" | "statistics" | "support" | "send_message" | "faq";

const cities = ["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"];

const leftMenuSections = [
  { title: "Headquarters", icon: Building2, page: "headquarters" as GamePage },
  { title: "Bank", icon: Landmark, page: "bank" as GamePage },
  { title: "Hospital", icon: ShieldCheck, page: "hospital" as GamePage },
  { title: "Points", icon: Trophy, page: "points" as GamePage },
  { title: "Crime", icon: AlertTriangle, children: [
    { title: "Car Theft", icon: Car, page: "crime_car" as GamePage },
    { title: "Burglarize Houses", icon: Home, page: "crime_burglarize" as GamePage },
    { title: "Rob Player", icon: UserMinus, page: "crime_rob" as GamePage },
  ]},
  { title: "Fight Club", icon: Swords, page: "fight_club" as GamePage },
  { title: "Garage", icon: Wrench, page: "garage" as GamePage },
  { title: "My Items", icon: Package, page: "items" as GamePage },
  { title: "Prison", icon: Lock, page: "prison" as GamePage },
  { title: "Airport", icon: Plane, page: "airport" as GamePage },
  { title: "Organized Crime", icon: Group, page: "organized_crime" as GamePage },
  { title: "Missions", icon: Target, page: "missions" as GamePage },
  { title: "Daily Raid", icon: Calendar, page: "daily_raid" as GamePage },
  { title: "Company", icon: Shield, page: "company" as GamePage },
  { title: "Family", icon: Users, page: "family" as GamePage },
  { title: "Kill", icon: Skull, page: "kill" as GamePage },
  { title: "Gambling", icon: Dices, children: [
    { title: "Dice", icon: Dice1, page: "gambling_dice" as GamePage },
    { title: "Lotto", icon: Ticket, page: "gambling_lotto" as GamePage },
    { title: "Blackjack", icon: Wallet, page: "gambling_blackjack" as GamePage },
    { title: "Coin Toss", icon: Coins, page: "gambling_coin" as GamePage },
    { title: "Horse Racing", icon: LandmarkIcon, page: "gambling_horse" as GamePage },
    { title: "Number Game", icon: Hash, page: "gambling_number" as GamePage },
  ]},
];

const rightMenuSections = [
  { title: "Messages", icon: MessageSquare, page: "messages" as GamePage },
  { title: "Inbox", icon: Inbox, page: "inbox" as GamePage },
  { title: "Notifications", icon: Bell, page: "notifications_page" as GamePage },
  { title: "Forums", icon: MessageSquare, children: [
    { title: "General", icon: MessageSquare, page: "forum_general" as GamePage },
    { title: "Sales & Wanted", icon: Banknote, page: "forum_sales" as GamePage },
    { title: "Off-Topic", icon: MessageSquare, page: "forum_offtopic" as GamePage },
    { title: "Shadows", icon: MessageSquare, page: "forum_shadows" as GamePage },
    { title: "Search Posts", icon: Search, page: "forum_search" as GamePage },
  ]},
  { title: "City Overview", icon: MapPin, page: "city_overview" as GamePage },
  { title: "Statistics", icon: BarChart3, page: "statistics" as GamePage },
  { title: "FAQ", icon: BookOpen, page: "faq" as GamePage },
  { title: "Support", icon: HelpCircle, page: "support" as GamePage },
];

function LeftSidebar({ activePage, setPage }: { activePage: GamePage; setPage: (p: GamePage) => void }) {
  const [expanded, setExpanded] = useState<string[]>(["Crime", "Gambling"]);
  const toggleSection = (t: string) => setExpanded(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border flex items-center gap-2">
        <Crown className="size-5 text-primary" />
        <span className="font-bold text-sm">ShadowEmpire</span>
      </div>
      <nav className="flex-1 py-2">
        {leftMenuSections.map(s => {
          if (s.children) {
            const open = expanded.includes(s.title);
            return (
              <div key={s.title}>
                <button onClick={() => toggleSection(s.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                  <s.icon className="size-3.5" />{s.title}
                  <ChevronDown className={`size-3 ml-auto transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {s.children.map(c => (
                        <button key={c.page} onClick={() => setPage(c.page)}
                          className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs transition-all mafia-sidebar-item ${activePage === c.page ? "active" : "text-sidebar-foreground/60"}`}>
                          <c.icon className="size-3.5" />{c.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return (
            <button key={s.page} onClick={() => setPage(s.page)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all mafia-sidebar-item ${activePage === s.page ? "active" : "text-sidebar-foreground/60"}`}>
              <s.icon className="size-4" />{s.title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function RightPanel({ setPage }: { setPage: (p: GamePage) => void }) {
  const player = useQuery(api.game.getPlayer);
  const unreadCount = useQuery(api.game.getUnreadCount);
  const [expandedRight, setExpandedRight] = useState(["Forums"]);
  const toggleRight = (t: string) => setExpandedRight(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <aside className="w-52 bg-sidebar border-l border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Status</div>
        {player ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center"><User className="size-3.5 text-primary" /></div>
              <span className="text-sm font-bold truncate">{player.nickname ?? "Unknown"}</span>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-sidebar-foreground/50 mb-0.5"><span>Life</span><span>{player.life ?? 0}/{player.maxLife ?? 100}</span></div>
              <div className="h-1.5 rounded-full bg-sidebar-accent overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all" style={{ width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="bg-sidebar-accent/50 rounded px-2 py-1 text-sidebar-foreground/60">💰 ${(player.money ?? 0).toLocaleString()}</div>
              <div className="bg-sidebar-accent/50 rounded px-2 py-1 text-sidebar-foreground/60">🏦 ${(player.bank ?? 0).toLocaleString()}</div>
              <div className="bg-sidebar-accent/50 rounded px-2 py-1 text-sidebar-foreground/60">⚔️ {(player.attack ?? 0)}</div>
              <div className="bg-sidebar-accent/50 rounded px-2 py-1 text-sidebar-foreground/60">🛡️ {(player.defense ?? 0)}</div>
              <div className="bg-sidebar-accent/50 rounded px-2 py-1 text-sidebar-foreground/60">⭐ Lv.{player.level ?? 1}</div>
              <div className="bg-sidebar-accent/50 rounded px-2 py-1 text-sidebar-foreground/60">📍 {(player.location ?? "").split(" ")[0]}</div>
            </div>
          </div>
        ) : <div className="text-xs text-sidebar-foreground/30">Loading...</div>}
      </div>
      <div className="flex-1 py-2">
        {rightMenuSections.map(s => {
          if (s.children) {
            const open = expandedRight.includes(s.title);
            return (
              <div key={s.title}>
                <button onClick={() => toggleRight(s.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                  <s.icon className="size-3.5" />{s.title}
                  <ChevronDown className={`size-3 ml-auto transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {s.children.map(c => (
                        <button key={c.page} onClick={() => setPage(c.page)}
                          className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-primary transition-colors">
                          <c.icon className="size-3.5" />{c.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return (
            <button key={s.page} onClick={() => setPage(s.page)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-primary transition-colors">
              <s.icon className="size-4" />{s.title}
              {s.page === "inbox" && unreadCount && unreadCount > 0 ? (
                <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ===== HELPER COMPONENTS =====

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center p-3 bg-background/40 rounded-lg border border-border/50">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${color ?? ""}`}>{value}</div>
    </div>
  );
}

function LoadingPage() {
  return <div className="flex items-center justify-center h-64"><Loader2 className="size-6 animate-spin text-primary" /></div>;
}

function EmptyPage({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">{icon}</div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-md">{desc}</p>
    </div>
  );
}

// ===== GAME PAGES =====

function HeadquartersPage() {
  const player = useQuery(api.game.getPlayer);
  const regenHealth = useMutation(api.game.regenHealth);
  const [regenMsg, setRegenMsg] = useState("");
  if (!player) return <LoadingPage />;

  const xpNeeded = (player.level ?? 1) * 100;
  const xpPercent = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);
  const wantedStars = player.wantedLevel ?? 0;
  const rep = player.reputation ?? 0;
  const alignment = player.reputationAlignment ?? "neutral";
  const prestige = player.prestige ?? 0;

  const doRegen = async () => { try { const r = await regenHealth(); setRegenMsg(`+${r.healed} HP`); } catch (e: unknown) { setRegenMsg(e instanceof Error ? e.message : ""); } };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Building2 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Headquarters</h2></div>
        {prestige > 0 && <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-bold text-yellow-400">⭐ Prestige {prestige}</div>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Level" value={`Lv.${player.level ?? 1}`} color="text-primary" />
        <StatBox label="Cash" value={`$${(player.money ?? 0).toLocaleString()}`} color="text-green-400" />
        <StatBox label="Bank" value={`$${(player.bank ?? 0).toLocaleString()}`} color="text-blue-400" />
        <StatBox label="Points" value={(player.points ?? 0).toString()} color="text-yellow-400" />
      </div>
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Vital Stats</h3>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Life</span><span>{player.life ?? 0}/{player.maxLife ?? 100}</span></div>
          <div className="h-2 rounded-full bg-background/60 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all" style={{ width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>XP</span><span>{player.experience ?? 0}/{xpNeeded}</span></div>
          <div className="h-2 rounded-full bg-background/60 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${xpPercent}%` }} /></div>
        </div>
        <div className="flex gap-3">
          <button onClick={doRegen} className="flex-1 py-2 bg-green-500/10 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/20">💚 Heal (+1 HP / 5min)</button>
        </div>
        {regenMsg && <div className="text-xs text-green-400 animate-fade-in">✓ {regenMsg}</div>}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className={`p-2.5 rounded-lg border ${wantedStars > 0 ? "bg-red-950/30 border-red-800/50" : "bg-background/40 border-border/50"}`}>
            <div className="text-muted-foreground mb-0.5">Wanted</div>
            <div className="font-bold">{wantedStars > 0 ? "🔴".repeat(Math.min(wantedStars, 5)) : "—"}</div>
          </div>
          <div className={`p-2.5 rounded-lg border ${alignment === "evil" ? "bg-red-950/30 border-red-800/50" : alignment === "good" ? "bg-green-950/30 border-green-800/50" : "bg-background/40 border-border/50"}`}>
            <div className="text-muted-foreground mb-0.5">Reputation</div>
            <div className="font-bold">{alignment === "evil" ? "😈 Evil" : alignment === "good" ? "😇 Good" : "😐 Neutral"} ({rep})</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div><SwordsIcon className="size-5 mx-auto mb-1 text-primary" /><div className="font-bold text-foreground">{player.totalFights ?? 0}</div>Fights</div>
          <div><Skull className="size-5 mx-auto mb-1 text-destructive" /><div className="font-bold text-foreground">{player.totalKills ?? 0}</div>Kills</div>
          <div><Target className="size-5 mx-auto mb-1 text-green-400" /><div className="font-bold text-foreground">{player.totalCrimes ?? 0}</div>Crimes</div>
        </div>
      </div>
    </div>
  );
}

function BankPage() {
  const player = useQuery(api.game.getPlayer);
  const deposit = useMutation(api.game.deposit);
  const withdraw = useMutation(api.game.withdraw);
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");
  if (!player) return <LoadingPage />;

  const doDeposit = async () => { try { await deposit({ amount }); setMsg(`Deposited $${amount.toLocaleString()}`); setAmount(0); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } };
  const doWithdraw = async () => { try { await withdraw({ amount }); setMsg(`Withdrew $${amount.toLocaleString()}`); setAmount(0); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Landmark className="size-7 text-primary" /><h2 className="text-2xl font-bold">Bank</h2></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card rounded-xl p-5 text-center"><div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cash on Hand</div><div className="text-3xl font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-5 text-center"><div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bank Balance</div><div className="text-3xl font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div></div>
      </div>
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <input type="number" value={amount || ""} onChange={e => setAmount(Number(e.target.value))} placeholder="Enter amount..."
          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <div className="flex gap-3">
          <button onClick={doDeposit} className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 text-sm">Deposit</button>
          <button onClick={doWithdraw} className="flex-1 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-accent text-sm">Withdraw</button>
        </div>
        {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
      </div>
    </div>
  );
}

function CrimePage({ type }: { type: string }) {
  const commitCrime = useMutation(api.game.commitCrime);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const info: Record<string, { title: string; icon: string; desc: string }> = {
    car_theft: { title: "Car Theft", icon: "🚗", desc: "Steal a car from the streets. High reward, risk of arrest." },
    burglarize: { title: "Burglarize Houses", icon: "🏠", desc: "Break into homes and loot valuables. Homeowners may fight back." },
    rob_player: { title: "Rob Player", icon: "🔫", desc: "Target another player. Higher risk, higher reward." },
  };
  const i = info[type] ?? { title: type, icon: "❓", desc: "" };

  const doCrime = async () => {
    setLoading(true);
    try { const res = await commitCrime({ type: type as "car_theft" | "burglarize" | "rob_player" }); setResult(res as unknown as Record<string, unknown>); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><span className="text-2xl">{i.icon}</span><h2 className="text-2xl font-bold">{i.title}</h2></div>
      <p className="text-muted-foreground text-sm">{i.desc}</p>
      <div className="mafia-card rounded-xl p-6">
        <button onClick={doCrime} disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-lg hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 shadow-lg shadow-red-900/20">
          {loading ? "Committing..." : "Commit Crime"}
        </button>
        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg text-sm border ${result.success ? "bg-green-950/30 border-green-800/50" : "bg-red-950/30 border-red-800/50"}`}>
            <div className={`font-bold text-lg ${result.success ? "text-green-400" : "text-red-400"}`}>{result.success ? "SUCCESS!" : "FAILED!"}</div>
            {result.moneyEarned ? <div className="text-green-400 mt-1">💰 +${(result.moneyEarned as number).toLocaleString()}</div> : null}
            {result.damageTaken ? <div className="text-red-400 mt-1">❤️ -{result.damageTaken as number} life</div> : null}
            {result.arrested ? <div className="text-red-400 font-bold mt-1">🔒 Arrested!</div> : null}
          </motion.div>
        )}
        {result?.error ? <div className="mt-4 text-destructive text-sm">{String(result.error)}</div> : null}
      </div>
    </div>
  );
}

function HospitalPage() {
  const player = useQuery(api.game.getPlayer);
  const healAtHospital = useMutation(api.game.healAtHospital);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;

  const heal = async (speed: "standard" | "premium") => {
    setLoading(true); setMsg("");
    try { const r = await healAtHospital({ speed }); setMsg(`Healed ${r.healed} HP for $${r.cost}`); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><span className="text-2xl">🏥</span><h2 className="text-2xl font-bold">Hospital</h2></div>
      <div className="mafia-card rounded-xl p-5 text-sm text-muted-foreground">
        Current HP: <span className="text-primary font-bold">{player.life ?? 0}/{player.maxLife ?? 100}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => heal("standard")} disabled={loading || (player.money ?? 0) < 100}
          className="mafia-card rounded-xl p-5 text-center hover:border-green-500/30 transition-all disabled:opacity-40">
          <div className="text-2xl mb-2">💚</div>
          <div className="font-bold text-sm">Standard Care</div>
          <div className="text-[10px] text-muted-foreground mt-1">+20 HP • $100</div>
        </button>
        <button onClick={() => heal("premium")} disabled={loading || (player.money ?? 0) < 500}
          className="mafia-card rounded-xl p-5 text-center hover:border-yellow-500/30 transition-all disabled:opacity-40">
          <div className="text-2xl mb-2">⭐</div>
          <div className="font-bold text-sm">Premium Care</div>
          <div className="text-[10px] text-muted-foreground mt-1">+50 HP • $500</div>
        </button>
      </div>
      {msg && <div className="mafia-card rounded-lg p-3 text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

function LevelUpModal({ player, onDone }: { player: { _id: string; level?: number; attack?: number; defense?: number; maxLife?: number }; onDone: () => void }) {
  const levelUp = useMutation(api.game.levelUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const choose = async (stat: "attack" | "defense" | "maxLife") => {
    setLoading(true); setError("");
    try { await levelUp({ stat }); onDone(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="mafia-card rounded-2xl p-8 max-w-md w-full text-center space-y-5 border-primary/30 border">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold">Level Up!</h2>
        <p className="text-muted-foreground text-sm">You reached <span className="text-primary font-bold">Lv.{(player.level ?? 1) + 1}</span>! Choose a stat bonus:</p>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => choose("attack")} disabled={loading}
            className="p-4 rounded-xl border-2 border-border hover:border-red-500/50 hover:bg-red-500/5 transition-all">
            <div className="text-2xl mb-1">⚔️</div>
            <div className="font-bold text-sm">+3 ATK</div>
            <div className="text-[10px] text-muted-foreground">{(player.attack ?? 10) + 3}</div>
          </button>
          <button onClick={() => choose("defense")} disabled={loading}
            className="p-4 rounded-xl border-2 border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
            <div className="text-2xl mb-1">🛡️</div>
            <div className="font-bold text-sm">+3 DEF</div>
            <div className="text-[10px] text-muted-foreground">{(player.defense ?? 10) + 3}</div>
          </button>
          <button onClick={() => choose("maxLife")} disabled={loading}
            className="p-4 rounded-xl border-2 border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all">
            <div className="text-2xl mb-1">❤️</div>
            <div className="font-bold text-sm">+20 HP</div>
            <div className="text-[10px] text-muted-foreground">{(player.maxLife ?? 100) + 20}</div>
          </button>
        </div>
        {error && <div className="text-destructive text-sm">{error}</div>}
      </motion.div>
    </div>
  );
}

function AirportPage() {
  const player = useQuery(api.game.getPlayer);
  const changeLocation = useMutation(api.game.changeLocation);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;

  const travel = async (loc: string) => {
    setLoading(true); setMsg("");
    try { await changeLocation({ location: loc }); setMsg(`Traveled to ${loc}!`); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Plane className="size-7 text-primary" /><h2 className="text-2xl font-bold">Airport</h2></div>
      <div className="mafia-card rounded-xl p-4 text-sm text-muted-foreground">
        Current location: <span className="text-primary font-bold">{player.location ?? "Unknown"}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cities.filter(c => c !== player.location).map(c => (
          <button key={c} onClick={() => travel(c)} disabled={loading || player.inPrison}
            className="mafia-card rounded-xl p-4 text-left hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group disabled:opacity-40">
            <div className="flex items-center gap-2 mb-1"><MapPinned className="size-4 text-primary group-hover:scale-110 transition-transform" /><span className="font-semibold text-sm">{c}</span></div>
            <div className="text-[10px] text-muted-foreground">Click to travel</div>
          </button>
        ))}
      </div>
      {msg && <div className="mafia-card rounded-lg p-3 text-sm text-primary animate-fade-in">✈️ {msg}</div>}
    </div>
  );
}

function FightClubPage() {
  const player = useQuery(api.game.getPlayer);
  const fightPlayer = useMutation(api.game.fightPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;

  const fight = async (targetId: string) => {
    setLoading(true); setResult(null);
    try { const res = await fightPlayer({ defenderId: targetId as never }); setResult(res as unknown as Record<string, unknown>); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };

  const opponents = players?.filter(p => p._id !== player._id) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Swords className="size-7 text-primary" /><h2 className="text-2xl font-bold">Fight Club</h2></div>
      <p className="text-muted-foreground text-sm">Challenge players in your city. Winner takes 5% of the loser's cash.</p>
      {opponents.length === 0 ? (
        <EmptyPage icon={<Swords className="size-8 text-primary" />} title="No Opponents" desc="No other players in your city to fight." />
      ) : (
        <div className="space-y-2">
          {opponents.map(p => (
            <div key={p._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center"><User className="size-4 text-destructive" /></div>
                <div>
                  <div className="font-semibold text-sm">{p.nickname ?? "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1} • ATK {p.attack ?? 0} • DEF {p.defense ?? 0}</div>
                </div>
              </div>
              <button onClick={() => fight(p._id)} disabled={loading || player.inPrison}
                className="px-4 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-40">
                FIGHT
              </button>
            </div>
          ))}
        </div>
      )}
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`mafia-card rounded-xl p-4 text-sm border ${result.attackerWins ? "border-green-800/50" : "border-red-800/50"}`}>
          <div className={`font-bold text-lg ${result.attackerWins ? "text-green-400" : "text-red-400"}`}>
            {result.attackerWins ? "VICTORY!" : "DEFEATED!"}
          </div>
          <div className="mt-1 text-muted-foreground">
            You dealt {(result.attackerDamage as number)} damage — Took {(result.defenderDamage as number)} damage
            {result.moneyStolen ? <>, Stole ${(result.moneyStolen as number).toLocaleString()}</> : null}
          </div>
        </motion.div>
      )}
      {result?.error ? <div className="mafia-card rounded-lg p-3 text-destructive text-sm">{String(result.error)}</div> : null}
    </div>
  );
}

function KillPage() {
  const player = useQuery(api.game.getPlayer);
  const killPlayer = useMutation(api.game.killPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;

  const kill = async (targetId: string) => {
    setLoading(true); setResult(null);
    try { const res = await killPlayer({ targetId: targetId as never }); setResult(res as unknown as Record<string, unknown>); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };

  const targets = players?.filter(p => p._id !== player._id) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Skull className="size-7 text-destructive" /><h2 className="text-2xl font-bold">Kill</h2></div>
      <div className="mafia-card rounded-xl p-4 border-destructive/30 border text-sm text-muted-foreground">
        ⚠️ Kill attempts are high-risk. If you fail, you take heavy damage. Only the strong survive.
      </div>
      {targets.length === 0 ? (
        <EmptyPage icon={<Skull className="size-8 text-destructive" />} title="No Targets" desc="No other players in your city to target." />
      ) : (
        <div className="space-y-2">
          {targets.map(p => (
            <div key={p._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center"><Skull className="size-4 text-destructive" /></div>
                <div>
                  <div className="font-semibold text-sm">{p.nickname ?? "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1} • ATK {p.attack ?? 0} • DEF {p.defense ?? 0}</div>
                </div>
              </div>
              <button onClick={() => kill(p._id)} disabled={loading || player.inPrison}
                className="px-4 py-1.5 bg-destructive text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                KILL
              </button>
            </div>
          ))}
        </div>
      )}
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`mafia-card rounded-xl p-4 text-sm border ${result.success ? "border-red-800/50" : "border-orange-800/50"}`}>
          <div className={`font-bold text-lg ${result.success ? "text-red-400" : "text-orange-400"}`}>
            {result.success ? "TARGET ELIMINATED" : "ATTEMPT FAILED"}
          </div>
          <div className="mt-1 text-muted-foreground">{result.success ? "Your target has been permanently eliminated." : "Your target survived. You took damage in the process."}</div>
        </motion.div>
      )}
      {result?.error ? <div className="mafia-card rounded-lg p-3 text-destructive text-sm">{String(result.error)}</div> : null}
    </div>
  );
}

function DailyRaidPage() {
  const player = useQuery(api.game.getPlayer);
  const dailyRaid = useMutation(api.game.dailyRaid);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;

  const raidsLeft = Math.max(0, 5 - (player.dailyRaidUsed ?? 0));

  const raid = async (targetId: string) => {
    setLoading(true); setResult(null);
    try { const res = await dailyRaid({ targetId: targetId as never }); setResult(res as unknown as Record<string, unknown>); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };

  const targets = players?.filter(p => p._id !== player._id) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Calendar className="size-7 text-primary" /><h2 className="text-2xl font-bold">Daily Raid</h2></div>
      <div className="mafia-card rounded-xl p-4 text-sm">
        Raids remaining today: <span className={`font-bold ${raidsLeft > 0 ? "text-primary" : "text-destructive"}`}>{raidsLeft}/5</span>
      </div>
      {raidsLeft === 0 ? (
        <EmptyPage icon={<Calendar className="size-8 text-muted-foreground" />} title="No Raids Left" desc="Come back tomorrow for more raids." />
      ) : targets.length === 0 ? (
        <EmptyPage icon={<Calendar className="size-8 text-primary" />} title="No Targets" desc="No players to raid in your city." />
      ) : (
        <div className="space-y-2">
          {targets.map(p => (
            <div key={p._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-yellow-500/10 flex items-center justify-center"><Calendar className="size-4 text-yellow-400" /></div>
                <div>
                  <div className="font-semibold text-sm">{p.nickname ?? "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1} • Cash ${(p.money ?? 0).toLocaleString()}</div>
                </div>
              </div>
              <button onClick={() => raid(p._id)} disabled={loading || player.inPrison}
                className="px-4 py-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-lg hover:bg-yellow-500/20 transition-colors disabled:opacity-40">
                RAID
              </button>
            </div>
          ))}
        </div>
      )}
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`mafia-card rounded-xl p-4 text-sm border ${result.success ? "border-green-800/50" : "border-red-800/50"}`}>
          <div className={`font-bold text-lg ${result.success ? "text-green-400" : "text-red-400"}`}>{result.success ? "RAID SUCCESSFUL!" : "RAID FAILED!"}</div>
          {result.moneyStolen ? <div className="text-green-400 mt-1">💰 Stole ${(result.moneyStolen as number).toLocaleString()}</div> : null}
          {result.damage ? <div className="text-red-400 mt-1">💥 Dealt {result.damage as number} damage</div> : null}
        </motion.div>
      )}
      {result?.error ? <div className="mafia-card rounded-lg p-3 text-destructive text-sm">{String(result.error)}</div> : null}
    </div>
  );
}

function PrisonPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;
  if (!player.inPrison) return <EmptyPage icon={<Lock className="size-8 text-primary" />} title="Not in Prison" desc="You're a free man. Commit crimes to end up here..." />;

  const remaining = player.prisonTime ? Math.max(0, Math.ceil((player.prisonTime - (Date.now() - (player.registeredAt ?? 0))) / 60000)) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Lock className="size-7 text-destructive" /><h2 className="text-2xl font-bold">Prison</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center border-destructive/30 border">
        <Lock className="size-12 mx-auto mb-3 text-destructive/50" />
        <p className="text-muted-foreground mb-2">You're behind bars. Serve your time or try to escape.</p>
        <div className="text-2xl font-bold text-destructive">{remaining > 0 ? `${remaining} min remaining` : "Release pending..."}</div>
      </div>
    </div>
  );
}

function FamilyPage() {
  const family = useQuery(api.game.getFamily);
  const members = useQuery(api.game.getFamilyMembers);
  const createFamily = useMutation(api.game.createFamily);
  const player = useQuery(api.game.getPlayer);
  const [name, setName] = useState(""); const [tag, setTag] = useState(""); const [desc, setDesc] = useState("");

  if (!player) return <LoadingPage />;

  if (family) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">{family.name} <span className="text-muted-foreground font-normal text-base">[{family.tag}]</span></h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Level" value={`Lv.${family.level}`} color="text-primary" />
          <StatBox label="Members" value={`${family.memberCount}/${family.maxMembers}`} />
          <StatBox label="Treasury" value={`$${(family.treasury ?? 0).toLocaleString()}`} color="text-green-400" />
          <StatBox label="XP" value={(family.experience ?? 0).toLocaleString()} color="text-yellow-400" />
        </div>
        <div className="mafia-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-4">{family.description}</p>
          <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Members</h3>
          <div className="space-y-2">
            {members?.map(m => (
              <div key={m._id} className="flex items-center justify-between p-2.5 bg-background/40 rounded-lg">
                <div className="flex items-center gap-2"><div className="size-7 rounded-full bg-primary/10 flex items-center justify-center"><User className="size-3 text-primary" /></div><span className="font-medium text-sm">{m.nickname ?? "Unknown"}</span></div>
                <span className="text-xs text-muted-foreground">Lv.{m.level ?? 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">Family</h2></div>
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <p className="text-sm text-muted-foreground">No family yet. Create one for $50,000.</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Family name" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag (e.g. [MOB])" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[80px]" />
        <button onClick={() => { if (name && tag) createFamily({ name, tag, description: desc }); }} disabled={(player.money ?? 0) < 50000}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-50">Create Family ($50,000)</button>
      </div>
    </div>
  );
}

function GamblingPage({ type, title, icon }: { type: string; title: string; icon: string }) {
  const diceRoll = useMutation(api.game.gambleDice);
  const coinToss = useMutation(api.game.gambleCoinToss);
  const player = useQuery(api.game.getPlayer);
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const doDice = async (g: "high" | "low" | "seven") => { try { setResult(await diceRoll({ amount: bet, guess: g }) as unknown as Record<string, unknown>); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } };
  const doCoin = async (g: "heads" | "tails") => { try { setResult(await coinToss({ amount: bet, guess: g }) as unknown as Record<string, unknown>); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><span className="text-2xl">{icon}</span><h2 className="text-2xl font-bold">{title}</h2></div>
      {player && <div className="text-sm text-muted-foreground">Balance: <span className="text-primary font-bold">${(player.money ?? 0).toLocaleString()}</span></div>}
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} placeholder="Bet amount"
          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
        {type === "dice" && (
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => doDice("low")} className="py-3 bg-chart-2/80 text-white font-bold rounded-lg hover:opacity-90 text-sm">Low (2-6)</button>
            <button onClick={() => doDice("seven")} className="py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 text-sm">7 (x5)</button>
            <button onClick={() => doDice("high")} className="py-3 bg-chart-3/80 text-white font-bold rounded-lg hover:opacity-90 text-sm">High (8-12)</button>
          </div>
        )}
        {type === "coin" && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => doCoin("heads")} className="py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 text-sm">Heads</button>
            <button onClick={() => doCoin("tails")} className="py-3 bg-secondary text-secondary-foreground font-bold rounded-lg border border-border hover:bg-accent text-sm">Tails</button>
          </div>
        )}
        {type === "horse" && (
          <div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setResult({ won: Math.random() > 0.7, message: `Horse #${n} ${Math.random() > 0.7 ? "WON!" : "lost."}` })}
              className="py-3 bg-secondary text-secondary-foreground text-sm rounded-lg border border-border hover:bg-accent font-bold">🐴 #{n}</button>
          ))}</div>
        )}
        {type === "number" && (
          <div className="space-y-3"><p className="text-xs text-muted-foreground">Pick 1-10. Win 10x your bet!</p>
            <div className="grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setResult({ won: Math.random() > 0.9, message: `Number ${n} ${Math.random() > 0.9 ? "WON!" : "lost."}` })}
                className="py-2.5 bg-secondary text-secondary-foreground text-sm rounded-lg border border-border hover:bg-accent font-bold">{n}</button>
            ))}</div>
          </div>
        )}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mafia-card rounded-lg p-4 text-sm">
            {result.error ? <div className="text-destructive">{String(result.error)}</div> : result.die1 ? (
              <div><div className="text-lg font-bold">🎲 {(result.die1 as number)} + {(result.die2 as number)} = {(result.total as number)}</div>
                <div className={result.won ? "text-primary font-bold" : "text-destructive"}>{result.won ? `WON $${(result.winnings as number).toLocaleString()}!` : "Lost!"}</div></div>
            ) : result.result ? (<div><div className="text-lg font-bold capitalize">{result.result as string}</div><div className={result.won ? "text-primary font-bold" : "text-destructive"}>{result.won ? "WON!" : "Lost!"}</div></div>
            ) : <div>{result.message as string}</div>}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MessagesPage() {
  const messages = useQuery(api.game.getMessages);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Inbox className="size-7 text-primary" /><h2 className="text-2xl font-bold">Inbox</h2></div>
      {messages && messages.length === 0 ? <EmptyPage icon={<Inbox className="size-8 text-muted-foreground" />} title="No Messages" desc="Your inbox is empty." /> : (
        <div className="space-y-2">{messages?.map(msg => (
          <div key={msg._id} className={`mafia-card rounded-lg p-4 ${!msg.read ? "border-l-2 border-l-primary" : ""}`}>
            <div className="flex justify-between items-start mb-1"><span className="font-semibold text-sm">{msg.subject}</span><span className="text-[10px] text-muted-foreground">{new Date(msg.timestamp).toLocaleDateString()}</span></div>
            <p className="text-xs text-muted-foreground">{msg.body}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function NotificationsPage() {
  const notifications = useQuery(api.game.getNotifications);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Bell className="size-7 text-primary" /><h2 className="text-2xl font-bold">Notifications</h2></div>
      {notifications && notifications.length === 0 ? <EmptyPage icon={<Bell className="size-8 text-muted-foreground" />} title="No Notifications" desc="You're all caught up." /> : (
        <div className="space-y-2">{notifications?.map(n => (
          <div key={n._id} className={`mafia-card rounded-lg p-4 ${!n.read ? "border-l-2 border-l-primary" : ""}`}>
            <div className="flex justify-between items-start mb-1"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.type}</span><span className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleDateString()}</span></div>
            <p className="text-sm">{n.message}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function StatisticsPage() {
  const stats = useQuery(api.game.getStats);
  if (!stats) return <LoadingPage />;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><BarChart3 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Statistics</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Players" value={stats.totalPlayers.toString()} color="text-primary" />
        <StatBox label="Crimes" value={stats.totalCrimes.toString()} color="text-red-400" />
        <StatBox label="Fights" value={stats.totalFights.toString()} color="text-orange-400" />
        <StatBox label="Families" value={stats.totalFamilies.toString()} color="text-blue-400" />
      </div>
      <div className="mafia-card rounded-xl p-5">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Top Players</h3>
        <div className="space-y-2">{stats.topPlayers.map((p, i) => (
          <div key={p.nickname} className="flex items-center gap-3 p-2.5 bg-background/40 rounded-lg">
            <span className={`font-bold text-sm w-7 text-center ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>#{i + 1}</span>
            <span className="flex-1 font-medium text-sm">{p.nickname}</span>
            <span className="text-xs text-muted-foreground">Lv.{p.level}</span>
            <span className="text-xs text-destructive">{p.kills} kills</span>
          </div>
        ))}</div>
      </div>
    </div>
  );
}

function ForumPage({ forum }: { forum: string }) {
  const posts = useQuery(api.game.getForumPosts, { forum });
  const createPost = useMutation(api.game.createForumPost);
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => { if (!title || !body) return; try { await createPost({ forum, title, body }); setTitle(""); setBody(""); setShowForm(false); } catch { /* */ } };
  const names: Record<string, string> = { general: "General", sales: "Sales & Wanted", offtopic: "Off-Topic", shadows: "Shadows" };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">{names[forum] ?? forum}</h2></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90">{showForm ? "Cancel" : "New Post"}</button>
      </div>
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mafia-card rounded-xl p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Post content..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px]" />
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90">Post</button>
        </motion.div>
      )}
      {posts && posts.length === 0 ? <EmptyPage icon={<MessageSquare className="size-8 text-muted-foreground" />} title="No Posts" desc="Be the first to post!" /> : (
        <div className="space-y-2">{posts?.map(p => (
          <div key={p._id} className="mafia-card rounded-lg p-4">
            <div className="flex justify-between items-start mb-1"><span className="font-semibold text-sm">{p.title}</span><span className="text-[10px] text-muted-foreground">{new Date(p.timestamp).toLocaleDateString()}</span></div>
            <p className="text-xs text-muted-foreground line-clamp-2">{p.body}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function CityOverviewPage() {
  const player = useQuery(api.game.getPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  if (!player) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><MapPin className="size-7 text-primary" /><h2 className="text-2xl font-bold">{player.location ?? "Unknown"}</h2></div>
      <div className="mafia-card rounded-xl p-4 text-sm text-muted-foreground">
        {players?.length ?? 0} players currently in this city
      </div>
      <div className="space-y-2">{players?.map(p => (
        <div key={p._id} className="mafia-card rounded-lg p-3 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="size-4 text-primary" /></div>
          <div className="flex-1"><div className="font-medium text-sm">{p.nickname ?? "Unknown"}</div><div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1}</div></div>
        </div>
      ))}</div>
    </div>
  );
}

function SendMessagePage() {
  const sendMessage = useMutation(api.game.sendMessage);
  const [receiverId, setReceiverId] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState(""); const [msg, setMsg] = useState("");

  const handleSend = async () => { if (!receiverId || !subject || !body) return; try { await sendMessage({ receiverId: receiverId as never, subject, body }); setMsg("Sent!"); setSubject(""); setBody(""); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Send className="size-7 text-primary" /><h2 className="text-2xl font-bold">Send Message</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <input value={receiverId} onChange={e => setReceiverId(e.target.value)} placeholder="Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Message..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[120px]" />
        <button onClick={handleSend} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90">Send</button>
        {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
      </div>
    </div>
  );
}

// ===== FAQ CONTENT =====

const faqSections = [
  { q: "What is ShadowEmpire?", a: "ShadowEmpire is a text-based mafia game where you rise from a street thug to a crime lord. Commit crimes, fight rivals, gamble, form families, and dominate 10 cities." },
  { q: "How do I earn money?", a: "Commit crimes (Car Theft, Burglarize, Rob Player), fight other players for their cash, complete missions, or gamble. The bank lets you store money safely." },
  { q: "What are the character classes?", a: "Hitter (high ATK), Thief (balanced + extra cash), Enforcer (high DEF + life), Hustler (most starting cash). Each class shapes your early game." },
  { q: "How does fighting work?", a: "Visit the Fight Club to challenge players in your city. Your ATK vs their DEF determines damage. Winner steals 5% of the loser's cash." },
  { q: "What happens when I commit a crime?", a: "There's a chance of success (earning money + XP) or failure (taking damage). Some failures result in arrest, sending you to prison." },
  { q: "How does prison work?", a: "Get arrested during crimes and you go to prison. You serve time and can't act while incarcerated. Avoid getting caught!" },
  { q: "What is the Daily Raid?", a: "Once per day (up to 5 raids), you can raid another player's stash for money and deal damage to them." },
  { q: "How do families work?", a: "Create a family for $50,000. Families can level up, grow their treasury, and eventually participate in Organized Crime operations." },
  { q: "What is the Kill feature?", a: "A high-stakes assassination attempt. If your ATK exceeds their DEF, you permanently eliminate them. Failure means you take heavy damage." },
  { q: "How do I travel between cities?", a: "Use the Airport to travel to any of the 10 cities. Each city has its own player base and economy." },
  { q: "What gambling games are available?", a: "Dice (high/low/seven), Coin Toss (heads/tails), Horse Racing (pick a horse), Number Game (pick 1-10 for 10x payout), and more coming soon." },
  { q: "How do I send messages?", a: "Use Send Message with a player's ID. Check your Inbox for received messages. There are also forums for public discussions." },
  { q: "What are points used for?", a: "Earned through crimes, fights, and missions. Points can be used in the shop for exclusive items and upgrades." },
  { q: "How does the leaderboard work?", a: "Players are ranked by level and experience. Check the Statistics page to see the top players and global game stats." },
  { q: "Can I change my character class?", a: "No. Your class is permanent when you register. Choose wisely based on your preferred playstyle." },
  { q: "What are the forums for?", a: "General discussion, Sales & Wanted (buy/sell items and services), Off-Topic (casual chat), and Shadows (clandestine discussions)." },
];

function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><BookOpen className="size-7 text-primary" /><h2 className="text-2xl font-bold">FAQ</h2></div>
      <p className="text-sm text-muted-foreground">Frequently asked questions about ShadowEmpire. Auto-updated with every game feature.</p>
      <div className="space-y-2">
        {faqSections.map((item, i) => (
          <div key={i} className="mafia-card rounded-lg overflow-hidden">
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-background/30 transition-colors">
              <span className="font-semibold text-sm">{item.q}</span>
              <ChevronDown className={`size-4 text-muted-foreground transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== REGISTRATION =====

type PlayerClass = "hitter" | "thief" | "enforcer" | "hustler";
const classInfo: Record<PlayerClass, { name: string; icon: string; desc: string; attack: number; defense: number; life: number; money: number }> = {
  hitter: { name: "Hitter", icon: "🥊", desc: "Brutal enforcer. High attack power but lower survivability.", attack: 18, defense: 6, life: 80, money: 800 },
  thief: { name: "Thief", icon: "🕵️", desc: "Stealthy and fast. Balanced stats with extra starting cash.", attack: 10, defense: 8, life: 90, money: 1500 },
  enforcer: { name: "Enforcer", icon: "🛡️", desc: "Tough as nails. High defense and life, built to absorb hits.", attack: 12, defense: 16, life: 120, money: 700 },
  hustler: { name: "Hustler", icon: "💰", desc: "Street-smart con artist. Starts with the most cash.", attack: 8, defense: 10, life: 90, money: 2500 },
};

function PlayerRegistration({ onRegistered }: { onRegistered: () => void }) {
  const registerPlayer = useMutation(api.game.registerPlayer);
  const [nickname, setNickname] = useState("");
  const [selectedClass, setSelectedClass] = useState<PlayerClass | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nickname || nickname.length < 3) { setError("Nickname must be at least 3 characters."); return; }
    if (!selectedClass) { setError("Choose a class."); return; }
    setError(""); setLoading(true);
    try { await registerPlayer({ nickname, playerClass: selectedClass }); onRegistered(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Registration failed."); }
    setLoading(false);
  };

  if (step === 1) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Crown className="size-8 text-primary" /></div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Identity</h1>
          <p className="text-muted-foreground text-sm">Pick a nickname for the underworld. Cannot be changed.</p>
        </div>
        <div className="mafia-card rounded-xl p-6 space-y-4">
          <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Street name..." maxLength={20} autoFocus
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
          <div className="text-[10px] text-muted-foreground">{nickname.length}/20 characters</div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <button onClick={() => { if (nickname.length >= 3) { setStep(2); setError(""); } }} disabled={nickname.length < 3}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-40">Choose Class →</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="text-center mb-6"><h1 className="text-3xl font-bold mb-1">Welcome, <span className="text-primary">{nickname}</span></h1><p className="text-muted-foreground text-sm">Choose your class.</p></div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(classInfo).map(([key, cls]) => {
            const pc = key as PlayerClass; const sel = selectedClass === pc;
            return (
              <motion.button key={pc} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedClass(pc)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${sel ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
                <div className="text-3xl mb-2">{cls.icon}</div>
                <div className="font-bold text-lg mb-1">{cls.name}</div>
                <p className="text-xs text-muted-foreground mb-3">{cls.desc}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">ATK</span><span className="font-bold">⚔️ {cls.attack}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">DEF</span><span className="font-bold">🛡️ {cls.defense}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Life</span><span className="font-bold">❤️ {cls.life}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cash</span><span className="font-bold text-primary">${cls.money.toLocaleString()}</span></div>
                </div>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-6 space-y-3">
          {error && <div className="text-destructive text-sm text-center">{error}</div>}
          <div className="flex gap-3">
            <button onClick={() => { setStep(1); setError(""); }} className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-accent">← Back</button>
            <button onClick={handleRegister} disabled={!selectedClass || loading}
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-40">
              {loading ? "Entering..." : "Enter the Streets"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== DEATH SCREEN =====

function DeathScreen() {
  const respawn = useMutation(api.game.respawn);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ keptMoney: number } | null>(null);

  const doRespawn = async () => {
    setLoading(true);
    try { const r = await respawn(); setResult(r as unknown as { keptMoney: number }); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <div className="text-6xl">💀</div>
          <h1 className="text-3xl font-bold">Respawned</h1>
          <p className="text-muted-foreground">You kept <span className="text-primary font-bold">${"$"}{result.keptMoney.toLocaleString()}</span> (10% of your wealth)</p>
          <p className="text-xs text-muted-foreground/60">Refresh to continue...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
        <div className="text-6xl">💀</div>
        <h1 className="text-4xl font-bold text-destructive">YOU DIED</h1>
        <p className="text-muted-foreground">You were eliminated from the underworld.</p>
        <button onClick={doRespawn} disabled={loading}
          className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
          {loading ? "Respawning..." : "Respawn (Keep 10% Cash)"}
        </button>
      </motion.div>
    </div>
  );
}

// ===== MAIN DASHBOARD =====

export default function Dashboard() {
  const { signOut } = useAuth();
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const setPage = useCallback((p: GamePage) => setActivePage(p), []);
  const player = useQuery(api.game.getPlayer);
  const [registered, setRegistered] = useState(false);

  const isRegistered = (player?.nickname && player?.registeredAt) || registered;

  if (!player) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  if (player.isDead) return <DeathScreen />;
  if (!isRegistered) return <PlayerRegistration onRegistered={() => setRegistered(true)} />;

  const pageNames: Record<string, string> = {
    headquarters: "Headquarters", bank: "Bank", hospital: "Hospital", points: "Points", fight_club: "Fight Club",
    garage: "Garage", items: "My Items", prison: "Prison", airport: "Airport",
    organized_crime: "Organized Crime", missions: "Missions", daily_raid: "Daily Raid",
    company: "Company", family: "Family", kill: "Kill", messages: "Messages",
    inbox: "Inbox", notifications_page: "Notifications", city_overview: "City Overview",
    statistics: "Statistics", support: "Support", send_message: "Send Message", faq: "FAQ",
    crime_car: "Car Theft", crime_burglarize: "Burglarize", crime_rob: "Rob Player",
    gambling_dice: "Dice", gambling_lotto: "Lotto", gambling_blackjack: "Blackjack",
    gambling_coin: "Coin Toss", gambling_horse: "Horse Racing", gambling_number: "Number Game",
    forum_general: "General", forum_sales: "Sales & Wanted", forum_offtopic: "Off-Topic",
    forum_shadows: "Shadows", forum_search: "Search Posts",
  };

  const renderPage = () => {
    switch (activePage) {
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <BankPage />;
      case "hospital": return <HospitalPage />;
      case "points": return <EmptyPage icon={<Trophy className="size-8 text-yellow-400" />} title="Points" desc="Earn points through crimes, fights, and missions. Use them in the shop for exclusive items." />;
      case "crime_car": case "crime_burglarize": case "crime_rob": return <CrimePage type={{ crime_car: "car_theft", crime_burglarize: "burglarize", crime_rob: "rob_player" }[activePage]} />;
      case "fight_club": return <FightClubPage />;
      case "garage": return <EmptyPage icon={<Car className="size-8 text-primary" />} title="Garage" desc="Store and manage your vehicles. Armored cars, getaway vehicles, and more." />;
      case "items": return <EmptyPage icon={<Package className="size-8 text-primary" />} title="My Items" desc="View your inventory. Equip weapons and armor to boost your stats." />;
      case "prison": return <PrisonPage />;
      case "airport": return <AirportPage />;
      case "organized_crime": return <EmptyPage icon={<Group className="size-8 text-primary" />} title="Organized Crime" desc="Family-only operations. Bank heists, drug runs, and major scores." />;
      case "missions": return <EmptyPage icon={<Target className="size-8 text-primary" />} title="Missions" desc="Complete daily and story missions for rewards. New missions every day." />;
      case "daily_raid": return <DailyRaidPage />;
      case "company": return <EmptyPage icon={<Shield className="size-8 text-primary" />} title="Company" desc="Run a legitimate front business. Earn passive income." />;
      case "family": return <FamilyPage />;
      case "kill": return <KillPage />;
      case "gambling_dice": return <GamblingPage type="dice" title="Dice" icon="🎲" />;
      case "gambling_lotto": return <EmptyPage icon={<Ticket className="size-8 text-yellow-400" />} title="Lotto" desc="Buy lottery tickets for a chance to win big." />;
      case "gambling_blackjack": return <EmptyPage icon={<Wallet className="size-8 text-primary" />} title="Blackjack" desc="Play blackjack against the house. Get to 21 without going over." />;
      case "gambling_coin": return <GamblingPage type="coin" title="Coin Toss" icon="🪙" />;
      case "gambling_horse": return <GamblingPage type="horse" title="Horse Racing" icon="🐴" />;
      case "gambling_number": return <GamblingPage type="number" title="Number Game" icon="🔢" />;
      case "messages": case "inbox": return <MessagesPage />;
      case "send_message": return <SendMessagePage />;
      case "notifications_page": return <NotificationsPage />;
      case "forum_general": case "forum_sales": case "forum_offtopic": case "forum_shadows": return <ForumPage forum={activePage.replace("forum_", "")} />;
      case "forum_search": return <EmptyPage icon={<Search className="size-8 text-primary" />} title="Search Posts" desc="Search across all forums." />;
      case "city_overview": return <CityOverviewPage />;
      case "statistics": return <StatisticsPage />;
      case "faq": return <FAQPage />;
      case "support": return <EmptyPage icon={<HelpCircle className="size-8 text-primary" />} title="Support" desc="Need help? Check the FAQ or contact support." />;
      default: return <HeadquartersPage />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <LeftSidebar activePage={activePage} setPage={setPage} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-border flex items-center justify-between px-5 bg-card/30 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-foreground/80">{pageNames[activePage] ?? activePage}</div>
            {(player.wantedLevel ?? 0) > 0 && <span className="px-2 py-0.5 bg-red-950/50 border border-red-800/50 rounded-full text-[10px] text-red-400 font-bold">🔴 {(player.wantedLevel ?? 0)} Wanted</span>}
            {(player.reputationAlignment ?? "neutral") !== "neutral" && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${player.reputationAlignment === "evil" ? "bg-red-950/50 border-red-800/50 text-red-400" : "bg-green-950/50 border-green-800/50 text-green-400"}`}>{player.reputationAlignment === "evil" ? "😈 Evil" : "😇 Good"}</span>}
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="size-3.5" /> Sign Out
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">{renderPage()}</div>
      </main>
      {player.levelUpPending ? <LevelUpModal player={player as unknown as { _id: string; level?: number; attack?: number; defense?: number; maxLife?: number }} onDone={() => {}} /> : null}
      <RightPanel setPage={setPage} />
    </div>
  );
}

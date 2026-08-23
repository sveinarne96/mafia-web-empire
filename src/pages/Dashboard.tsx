import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Landmark, ShieldCheck, Trophy, User, ScrollText, AlertTriangle,
  Flame, Skull, Map, Plane, Lock, Users, Package, Shield, Swords, Car, Clock,
  ChevronDown, ChevronRight, MessageSquare, Inbox, Bell, Search, MapPin, Send,
  HelpCircle, Star, Eye, EyeOff, Crosshair, CircleDot, Bomb, Gem, Briefcase,
  Home, DollarSign, Heart, Megaphone, Newspaper, Gamepad2, Zap, Target, Coffee,
  Radio, ShieldAlert, Gauge, Anchor, RotateCcw, GitBranch, Cpu, BarChart3,
  Activity, Wallet, HeartHandshake, Sparkles, Gift, Cloud, Globe
} from "lucide-react";
import {
  CrimesOverviewPage, LegendaryCrimePage, BossFightsPage, CrimeEmpirePage,
  HeistPlanningPage, WorldEventsPage, CriminalPetsPage, BlackMarketPage,
  CrimeFamePage, StockMarketPage2, RealEstatePage2, BusinessesPage2,
  CounterfeitingPage, DrugTraffickingPage, ArsonPage, IdentityTheftPage,
  ArmsDealPage, WitnessPage, TaxEvasionPage, RacketeeringPage,
  GamblingDenPage, LoanSharkPage, CargoTheftPage, RoulettePage, SlotsPage,
  RussianRoulettePage, DogFightPage, StreetRacingPage, GiftingPage, HitListPage,
  DeathMatchPage, SeasonRankingsPage, CombatLogPage, FightingStylesPage,
  ArmorPage, CrimesOverviewPage as CrimeCatPage, PrisonTimeDisplay,
  LegacyStatsPage, ContractsPage,
} from "@/components/GameFeatures";
import {
  StealFromHousePage, GtaCarTheftPage, BodyguardsPage, SecretChallengesPage,
  BoostsPage, EnhancedAdminPage, WantedStatusPage,
} from "@/components/GameEnhanced";
import {
  PointsShopPage, GaragePage, MyItemsPage, MissionsPage,
  OrganizedCrimePage, CompanyPage, LottoPage, BlackjackPage,
  LegacyPage, ForumSearchPage, SupportPage,
} from "@/components/GamePages";
import { MyProfilePage } from "@/components/MyProfile";
import { AdminPanel } from "@/components/AdminPanel";

type GamePage = string;

const leftMenuSections: { title: string; icon: any; page?: GamePage; children?: { title: string; icon: any; page: GamePage }[] }[] = [
  { title: "\uD83C\uDFE0 Overview", icon: Building2, children: [
    { title: "\uD83C\uDFE2 Headquarters", icon: Building2, page: "headquarters" },
    { title: "\uD83C\uDFE6 Bank", icon: Landmark, page: "bank" },
    { title: "\uD83C\uDFE5 Hospital", icon: ShieldCheck, page: "hospital" },
    { title: "\uD83C\uDFC6 Points", icon: Trophy, page: "points" },
    { title: "\uD83D\uDC64 My Profile", icon: User, page: "my_profile" },
    { title: "\uD83D\uDCDC Game Updates", icon: ScrollText, page: "updates" },
  ]},
  { title: "\uD83D\uDD25 Crime", icon: AlertTriangle, children: [
    { title: "\uD83D\uDD25 Street Crimes", icon: AlertTriangle, page: "crimes" },
    { title: "\uD83D\uDDFA\uFE0F Crime Empire", icon: Map, page: "crime_empire" },
    { title: "\uD83C\uDFAF Heist Planning", icon: Target, page: "heist_planning" },
    { title: "\uD83C\uDF10 World Events", icon: Zap, page: "world_events" },
    { title: "\uD83D\uDD10 Prison", icon: Lock, page: "prison" },
    { title: "\u2708\uFE0F Airport", icon: Plane, page: "airport" },
    { title: "\uD83D\uDC65 Organized Crime", icon: Users, page: "organized_crime" },
    { title: "\uD83D\uDCCB Missions", icon: Briefcase, page: "missions" },
    { title: "\uD83D\uDCCA Daily Login", icon: Gift, page: "daily_login" },
    { title: "\uD83D\uDEE1\uFE0F Bodyguards", icon: ShieldAlert, page: "bodyguards" },
    { title: "\uD83C\uDFAF Secret Challenges", icon: Target, page: "secret_challenges" },
    { title: "\u26A1 Boosts & Events", icon: Zap, page: "boosts" },
    { title: "\uD83D\uDCC8 Crime Spree", icon: Activity, page: "crime_spree" },
    { title: "\uD83D\uDCB5 Steal From House", icon: Home, page: "steal_from_house" },
    { title: "\uD83D\uDE97 GTA Car Theft", icon: Car, page: "gta_car_theft" },
  ]},
  { title: "\u2694\uFE0F Combat", icon: Swords, children: [
    { title: "\uD83E\uDD4A Fight Club", icon: Swords, page: "fight_club" },
    { title: "\uD83C\uDFC6 Bounty Board", icon: Crosshair, page: "bounty_board" },
    { title: "\uD83D\uDC51 Kill", icon: Skull, page: "kill" },
    { title: "\uD83C\uDFC6 Season Rankings", icon: Trophy, page: "season_rankings" },
    { title: "\uD83D\uDCCB Combat Log", icon: ScrollText, page: "combat_log" },
    { title: "\uD83E\uDDBE Fighting Styles", icon: Swords, page: "fighting_styles" },
    { title: "\uD83D\uDEE1\uFE0F Armor Shop", icon: Shield, page: "armor" },
  ]},
  { title: "\uD83C\uDFB2 Gambling", icon: CircleDot, children: [
    { title: "\uD83C\uDFB2 Dice", icon: CircleDot, page: "gambling_dice" },
    { title: "\uD83C\uDFB0 Lotto", icon: Sparkles, page: "gambling_lotto" },
    { title: "\uD83D\uDCB3 Blackjack", icon: DollarSign, page: "gambling_blackjack" },
    { title: "\uD83E\uDE99 Coin Toss", icon: CircleDot, page: "gambling_coin" },
    { title: "\uD83D\uDC0E Horse Racing", icon: Zap, page: "gambling_horse" },
    { title: "\uD83D\uDD22 Number Game", icon: Target, page: "gambling_number" },
    { title: "\uD83C\uDFB3 Roulette", icon: CircleDot, page: "roulette" },
    { title: "\uD83C\uDFB0 Slots", icon: Sparkles, page: "slots" },
    { title: "\uD83E\uDD46 Russian Roulette", icon: Skull, page: "russian_roulette" },
  ]},
  { title: "\uD83D\uDCCB Underground", icon: Bomb, children: [
    { title: "\uD83D\uDD2B Underground Economy", icon: Bomb, page: "underground" },
    { title: "\uD83D\uDCB0 Counterfeiting", icon: DollarSign, page: "counterfeiting" },
    { title: "\uD83D\uDCA7 Drug Trafficking", icon: Droplet, page: "drug_trafficking" },
    { title: "\uD83D\uDD25 Arson", icon: Flame, page: "arson" },
    { title: "\uD83D\uDC64 Identity Theft", icon: User, page: "identity_theft" },
    { title: "\uD83D\uDD2B Arms Dealer", icon: Crosshair, page: "arms_dealing" },
    { title: "\uD83D\uDC41\uFE0F Witness Intimidation", icon: Eye, page: "witness_intimidation" },
    { title: "\uD83D\uDCB0 Tax Evasion", icon: DollarSign, page: "tax_evasion" },
    { title: "\uD83C\uDFED Racketeering", icon: Building2, page: "racketeering" },
    { title: "\uD83C\uDFB6 Gambling Dens", icon: CircleDot, page: "gambling_dens" },
    { title: "\uD83D\uDEAA Smuggling Routes", icon: Anchor, page: "smuggling_routes" },
  ]},
  { title: "\uD83D\uDCC8 Economy", icon: DollarSign, children: [
    { title: "\uD83D\uDCC9 Stock Market", icon: BarChart3, page: "stock_market" },
    { title: "\u2728 Crypto", icon: Gem, page: "crypto" },
    { title: "\uD83C\uDFB7 Lottery", icon: Sparkles, page: "lottery" },
  ]},
  { title: "\uD83D\uDCE6 Assets", icon: Package, children: [
    { title: "\uD83D\uDE97 Garage", icon: Car, page: "garage" },
    { title: "\uD83C\uDF92 My Items", icon: Package, page: "items" },
    { title: "\uD83D\uDD2B Black Market", icon: Bomb, page: "black_market" },
    { title: "\uD83C\uDFA8 Mystery Boxes", icon: Sparkles, page: "mystery_boxes" },
    { title: "\uD83C\uDF1F Legendary Items", icon: Gem, page: "legendary_items" },
  ]},
  { title: "\uD83D\uDCCB Social", icon: Users, children: [
    { title: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67 Family", icon: Users, page: "family" },
    { title: "\uD83E\uDD1D Crew System", icon: Users, page: "crew_system" },
    { title: "\uD83C\uDFC6 Crime Fame", icon: Trophy, page: "crime_fame" },
    { title: "\uD83C\uDF0D Reputation", icon: Globe, page: "reputation" },
  ]},
  { title: "\uD83C\uDFAF Progression", icon: Target, children: [
    { title: "\uD83E\uDDE0 Skill Tree", icon: Zap, page: "skill_tree" },
    { title: "\uD83C\uDFC5 Achievements", icon: Trophy, page: "achievements" },
    { title: "\uD83C\uDFC6 Titles", icon: Crown, page: "titles" },
    { title: "\uD83D\uDCDC Legacy", icon: ScrollText, page: "legacy" },
    { title: "\u2B50 Prestige", icon: Star, page: "prestige" },
    { title: "\uD83C\uDFC6 Leaderboards", icon: Trophy, page: "leaderboards" },
    { title: "\uD83C\uDFC5 Season Pass", icon: Trophy, page: "season_pass" },
  ]},
  { title: "\u26D4\uFE0F Special", icon: Skull, children: [
    { title: "\uD83D\uDE08 Ghost Mode", icon: Eye, page: "ghost_mode" },
    { title: "\uD83D\uDCB0 Daily Challenges", icon: Target, page: "daily_challenges" },
    { title: "\uD83D\uDCDC Legacy Board", icon: ScrollText, page: "legacy_board" },
    { title: "\uD83D\uDCDD Advanced Features", icon: Zap, page: "advanced_features" },
  ]},
];

// ============ INLINE PAGES ============

function HeadquartersPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  const xpNeeded = (player.level ?? 1) * 100;
  const xpPct = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);
  const lifePct = ((player.life ?? 100) / (player.maxLife ?? 100)) * 100;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/30 via-red-900/20 to-amber-900/30 border border-amber-500/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-4"><Building2 className="size-8 text-amber-400" /><div><h2 className="text-2xl font-black">Shadow Empire HQ</h2><p className="text-xs text-muted-foreground">Your criminal empire at a glance</p></div></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-xl p-4 border border-green-500/20 animate-money-glow"><div className="text-2xl mb-1">💰</div><div className="text-xl font-black text-green-400 animate-money-text">${(player.money ?? 0).toLocaleString()}</div><div className="text-[10px] text-green-400/60">Cash on Hand</div></div>
          <div className="bg-black/30 rounded-xl p-4 border border-blue-500/20"><div className="text-2xl mb-1">🏦</div><div className="text-xl font-black text-blue-400">${(player.bank ?? 0).toLocaleString()}</div><div className="text-[10px] text-blue-400/60">Bank Balance</div></div>
          <div className="bg-black/30 rounded-xl p-4 border border-red-500/20"><div className="text-2xl mb-1">❤️</div><div className="text-xl font-black text-red-400">{player.life ?? 100}/{player.maxLife ?? 100}</div><div className="h-2 bg-black/50 rounded-full mt-1 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 animate-life-bar" style={{width:`${lifePct}%`}} /></div></div>
          <div className="bg-black/30 rounded-xl p-4 border border-primary/20"><div className="text-2xl mb-1">⭐</div><div className="text-xl font-black text-primary">Lv. {player.level ?? 1}</div><div className="h-2 bg-black/50 rounded-full mt-1 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 animate-xp-bar" style={{width:`${xpPct}%`}} /></div><div className="text-[10px] text-primary/60 mt-1">{player.experience ?? 0}/{xpNeeded} XP</div></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-4 text-center border border-red-500/20 hover:border-red-500/40 transition-colors"><div className="text-3xl mb-1">⚔️</div><div className="text-2xl font-black text-red-400">{player.attack ?? 10}</div><div className="text-[10px] text-muted-foreground">Attack Power</div></div>
        <div className="mafia-card rounded-xl p-4 text-center border border-blue-500/20 hover:border-blue-500/40 transition-colors"><div className="text-3xl mb-1">🛡️</div><div className="text-2xl font-black text-blue-400">{player.defense ?? 10}</div><div className="text-[10px] text-muted-foreground">Defense</div></div>
        <div className="mafia-card rounded-xl p-4 text-center border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"><div className="text-3xl mb-1">🔥</div><div className="text-2xl font-black text-yellow-400">{player.totalCrimes ?? 0}</div><div className="text-[10px] text-muted-foreground">Crimes Committed</div></div>
        <div className="mafia-card rounded-xl p-4 text-center border border-purple-500/20 hover:border-purple-500/40 transition-colors"><div className="text-3xl mb-1">📍</div><div className="text-lg font-black text-purple-400">{player.location ?? "New York"}</div><div className="text-[10px] text-muted-foreground">Current Location</div></div>
      </div>
      {(player.wantedLevel ?? 0) > 0 && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 text-center">
          <div className="text-red-400 font-bold">Wanted Level: {player.wantedLevel}/10</div>
          <div className="text-[10px] text-red-300/60 mt-1">FBI and military may raid you!</div>
        </div>
      )}
    </div>
  );
}

function BankPage() {
  const player = useQuery(api.game.getPlayer);
  const deposit = useMutation(api.game.deposit);
  const withdraw = useMutation(api.game.withdraw);
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  const doDeposit = async () => { setLoading(true); try { await deposit({ amount }); setMsg(`Deposited $${amount.toLocaleString()}`); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  const doWithdraw = async () => { setLoading(true); try { await withdraw({ amount }); setMsg(`Withdrew $${amount.toLocaleString()}`); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Landmark className="size-7 text-primary" /><h2 className="text-2xl font-bold">Bank</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4"><div><div className="text-[10px] text-muted-foreground">Cash</div><div className="text-xl font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div></div><div><div className="text-[10px] text-muted-foreground">Bank</div><div className="text-xl font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div></div></div>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" placeholder="Amount" />
        <div className="flex gap-3">
          <button onClick={doDeposit} disabled={loading || amount <= 0} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-40">Deposit</button>
          <button onClick={doWithdraw} disabled={loading || amount <= 0} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-40">Withdraw</button>
        </div>
        {msg && <div className="text-sm text-primary animate-fade-in">{msg}</div>}
      </div>
    </div>
  );
}

function HospitalPage() {
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  if (!player) return <LoadingPage />;

  const life = player.life ?? 100;
  const maxLife = player.maxLife ?? 100;
  const lifePercent = Math.round((life / maxLife) * 100);

  const treatments = [
    { id: "basic", name: "Basic Bandage", icon: "🩹", desc: "Simple wound care", heal: 25, price: 10000, time: "Instant", color: "border-green-500/20" },
    { id: "standard", name: "Standard Treatment", icon: "💊", desc: "Antibiotics and painkillers", heal: 50, price: 50000, time: "Instant", color: "border-green-500/20" },
    { id: "iv", name: "IV Drip Therapy", icon: "💉", desc: "Saline and vitamin boost", heal: 75, price: 150000, time: "Instant", color: "border-blue-500/20" },
    { id: "surgery", name: "Emergency Surgery", icon: "🏥", desc: "Full surgical repair", heal: 100, price: 500000, time: "Instant", color: "border-blue-500/20" },
    { id: "blood", name: "Blood Transfusion", icon: "🩸", desc: "Complete blood replacement", heal: 100, price: 750000, time: "Instant", color: "border-red-500/20" },
    { id: "regen", name: "Stem Cell Regen", icon: "🧬", desc: "Regenerate damaged tissue", heal: 100, price: 1000000, time: "Instant", color: "border-purple-500/20" },
    { id: "nano", name: "Nanobot Repair", icon: "🤖", desc: "Microscopic robots fix you", heal: 100, price: 2000000, time: "Instant", color: "border-purple-500/20" },
    { id: "clone", name: "Clone Restoration", icon: "🧫", desc: "Full body reconstruction", heal: 100, price: 3500000, time: "Instant", color: "border-cyan-500/20" },
    { id: "adrenaline", name: "Adrenaline Shot", icon: "⚡", desc: "Instant +50 HP, no questions asked", heal: 50, price: 200000, time: "Instant", color: "border-yellow-500/20" },
    { id: "painkiller", name: "Painkiller Pack", icon: "💊", desc: "Pain relief, +30 HP over time", heal: 30, price: 75000, time: "Instant", color: "border-green-500/20" },
    { id: "reconstruct", name: "Full Reconstruction", icon: "🔬", desc: "Maximum HP +50 permanently", heal: 9999, price: 5000000, time: "Permanent", color: "border-amber-500/20" },
    { id: "concierge", name: "VIP Concierge", icon: "👑", desc: "Full heal + buff for 1 hour", heal: 100, price: 7500000, time: "Instant", color: "border-amber-500/20" },
    { id: "revive", name: "Death Revival", icon: "💀", desc: "Bring back from the dead", heal: 100, price: 10000000, time: "If Dead", color: "border-red-500/30" },
    { id: "upgrade_max", name: "Max HP Upgrade", icon: "❤️", desc: "+100 Max HP permanently", heal: 9999, price: 15000000, time: "Permanent", color: "border-red-500/20" },
    { id: "premium", name: "Premium Package", icon: "💎", desc: "Full heal + Max HP upgrade + ATK/DEF +5", heal: 9999, price: 75000000, time: "All-in-One", color: "border-yellow-500/30" },
  ];

  const doHeal = (t: typeof treatments[0]) => {
    if (t.id === "revive" && !player.isDead) { setMsg("❌ You're not dead!"); return; }
    if (t.id === "revive" && player.isDead) { setMsg("✅ You've been revived from death!"); return; }
    if (t.id === "reconstruct" || t.id === "upgrade_max" || t.id === "premium") { setMsg("✅ Permanent upgrade applied!"); return; }
    const newLife = Math.min(maxLife, life + t.heal);
    if (newLife >= maxLife) { setMsg("✅ Fully healed to " + maxLife + " HP!"); }
    else { setMsg("✅ Healed +" + t.heal + " HP! Now at " + newLife + "/" + maxLife); }
  };

  return (
    <div className="animate-fade-in space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/15 via-emerald-950/5 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <div className="relative"><ShieldCheck className="size-8 text-green-400" /><div className="absolute -inset-1 bg-green-400/20 rounded-full blur-lg" /></div>
        <div>
          <h2 className="text-2xl font-black">🏥 <span className="text-green-400">PREMIUM HOSPITAL</span></h2>
          <p className="text-xs text-green-400/60 font-mono">ELITE MEDICAL SERVICES</p>
        </div>
      </div>

      {/* Health Status */}
      <div className="glass-green rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold">❤️ Health Status</div>
          <div className={`text-sm font-black ${lifePercent > 60 ? "text-green-400" : lifePercent > 30 ? "text-yellow-400" : "text-red-400"}`}>{life}/{maxLife}</div>
        </div>
        <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${lifePercent > 60 ? "bg-gradient-to-r from-green-500 to-emerald-400" : lifePercent > 30 ? "bg-gradient-to-r from-yellow-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-red-400"}`} style={{ width: `${lifePercent}%` }} />
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 text-center">{lifePercent}% HP • {maxLife > 100 ? "Enhanced" : "Standard"}体质</div>
      </div>

      {/* Treatment Grid */}
      <div className="space-y-2">
        {treatments.map((t) => (
          <button key={t.id} onClick={() => { setSelected(t.id); doHeal(t); }}
            className={`w-full text-left p-4 rounded-xl border ${t.color} bg-black/20 hover:bg-black/30 transition-all ${selected === t.id ? "ring-2 ring-green-500/40" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{t.icon}</div>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                  <div className="text-[9px] text-green-400 mt-0.5">+{t.heal.toLocaleString()} HP • {t.time}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-green-400">${t.price.toLocaleString()}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {msg && (
        <div className="rounded-xl p-4 text-sm font-bold border-2 bg-green-950/30 border-green-500/50 text-green-400 text-center">
          {msg}
        </div>
      )}
    </div>
  );
}

function DailyLoginPage() {
  const player = useQuery(api.game.getPlayer);
  const claim = useMutation(api.gameExtended.claimDailyReward);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const rewards = [100000, 350000, 700000, 1400000, 2800000, 6000000, 12000000];
  const streak = (player as any)?.dailyStreak ?? 0;
  const lastClaim = (player as any)?.lastDailyClaim ?? 0;
  const now = Date.now();
  const twelveHours = 43200000;
  const cooldownLeft = Math.max(0, twelveHours - (now - lastClaim));
  const hours = Math.floor(cooldownLeft / 3600000);
  const minutes = Math.floor((cooldownLeft % 3600000) / 60000);
  const seconds = Math.floor((cooldownLeft % 60000) / 1000);
  const isLocked = cooldownLeft > 0;
  const [timer, setTimer] = useState(cooldownLeft);
  useEffect(() => { if (timer <= 0) return; const t = setInterval(() => setTimer(c => Math.max(0, c - 1000)), 1000); return () => clearInterval(t); }, [timer]);
  const doClaim = async () => { setLoading(true); setMsg(""); try { const r = await claim({}); setMsg((r as any).message); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Gift className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Daily Login Rewards</h2></div>
      <div className="grid grid-cols-7 gap-2">{rewards.map((r, i) => (<div key={i} className={`mafia-card rounded-xl p-3 text-center ${i === (streak % 7) ? "border-yellow-500/50 bg-yellow-950/20" : ""}`}><div className="text-[10px] text-muted-foreground">Day {i + 1}</div><div className="text-sm font-bold text-green-400">${r.toLocaleString()}</div>{i === 6 && <div className="text-[8px] text-yellow-400">🎁 BONUS!</div>}</div>))}</div>
      <div className="mafia-card rounded-xl p-5 text-center space-y-3">
        {isLocked ? (<div><div className="text-2xl mb-2">🔒</div><div className="text-sm text-muted-foreground">Next reward in</div><div className="text-xl font-bold text-yellow-400">{Math.floor(timer / 3600000)}h {Math.floor((timer % 3600000) / 60000)}m {Math.floor((timer % 60000) / 1000)}s</div></div>) : (
          <button onClick={doClaim} disabled={loading} className="px-6 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-40">{loading ? "Claiming..." : `🎁 Claim Day ${(streak % 7) + 1} — $${rewards[streak % 7].toLocaleString()}`}</button>
        )}
        {msg && <div className="text-sm text-primary">{msg}</div>}
      </div>
    </div>
  );
}

function SupportPageInline() {
  const player = useQuery(api.game.getPlayer);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const doSubmit = async () => { if (!subject || !body) return; try { setMsg("Ticket submitted!"); setSubject(""); setBody(""); } catch (e: any) { setMsg(e.message); } };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Shield className="size-7 text-primary" /><h2 className="text-2xl font-bold">Support</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe your issue..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm min-h-[120px]" />
        <button onClick={doSubmit} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90">Submit Ticket</button>
        {msg && <div className="text-sm text-primary">{msg}</div>}
      </div>
    </div>
  );
}

function BecomeAdminPage() {
  const becomeAdmin = useMutation(api.admin.becomeAdmin);
  const [msg, setMsg] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const doBecome = async () => {
    if (!key) { setMsg("Please enter the admin key"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await becomeAdmin({ secretKey: key });
      setMsg(res.message || "You are now an admin!");
    } catch (e: any) { setMsg(e.message || "Invalid admin key"); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Shield className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">🔑 Become Admin</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🛡️</div>
          <div className="text-sm font-bold">Admin Access</div>
          <div className="text-[10px] text-muted-foreground">Enter the admin secret key to gain admin privileges</div>
        </div>
        <input
          type="password"
          placeholder="Enter admin secret key..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
          onKeyDown={(e) => { if (e.key === 'Enter') doBecome(); }}
        />
        <button onClick={doBecome} disabled={loading || !key}
          className="w-full px-6 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
          {loading ? "⏳ Activating..." : "🔑 Activate Admin"}
        </button>
        {msg && <div className={`text-sm p-2 rounded-lg ${msg.includes("admin") || msg.includes("Admin") ? "bg-green-950/30 text-green-400" : "bg-red-950/30 text-red-400"}`}>{msg}</div>}
      </div>
    </div>
  );
}

function OnlinePlayersPage() {
  const players = useQuery(api.admin.getOnlinePlayers);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">Online Players</h2></div>
      <div className="space-y-2">{(players ?? []).map((p: any) => (<div key={p._id} className="mafia-card rounded-lg p-3 flex items-center gap-3"><div className="size-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="size-4 text-primary" /></div><div className="flex-1"><div className="font-medium text-sm">{p.nickname ?? "Unknown"}</div><div className="text-[10px] text-muted-foreground">Lv. {p.level ?? 1} - {p.location ?? "New York"}</div></div></div>))}</div>
    </div>
  );
}

function SendMoneyPage() {
  const player = useQuery(api.game.getPlayer);
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const doSend = async () => { setLoading(true); setMsg(""); try { setMsg("Money transfers coming soon!"); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><DollarSign className="size-7 text-green-400" /><h2 className="text-2xl font-bold">Send Money</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" />
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" placeholder="Amount" />
        <button onClick={doSend} disabled={loading} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-40">Send</button>
        {msg && <div className="text-sm text-primary">{msg}</div>}
      </div>
    </div>
  );
}

function CityOverviewPage() {
  const player = useQuery(api.game.getPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Map className="size-7 text-primary" /><h2 className="text-2xl font-bold">{player.location ?? "New York"}</h2></div>
      <div className="mafia-card rounded-xl p-4 text-sm text-muted-foreground">{players?.length ?? 0} players in this city</div>
      <div className="space-y-2">{(players ?? []).map((p: any) => (<div key={p._id} className="mafia-card rounded-lg p-3 flex items-center gap-3"><div className="size-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="size-4 text-primary" /></div><div className="flex-1"><div className="font-medium text-sm">{p.nickname ?? "Unknown"}</div><div className="text-[10px] text-muted-foreground">Lv. {p.level ?? 1}</div></div></div>))}</div>
    </div>
  );
}

function StatisticsPage() {
  const stats = useQuery(api.admin.getGameStats);
  if (!stats) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><BarChart3 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Statistics</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-primary">{(stats as any).totalPlayers ?? 0}</div><div className="text-[10px] text-muted-foreground">Total Players</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-green-400">{(stats as any).onlineNow ?? 0}</div><div className="text-[10px] text-muted-foreground">Online Now</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-red-400">{(stats as any).banned ?? 0}</div><div className="text-[10px] text-muted-foreground">Banned</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-yellow-400">{(stats as any).admins ?? 0}</div><div className="text-[10px] text-muted-foreground">Admins</div></div>
      </div>
    </div>
  );
}













function LegacyPageInline() {
  return <LegacyPage />;
}

function LegacyBoardPage() {
  return <LegacyStatsPage />;
}



function MasteryPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Target className="size-7 text-primary" /><h2 className="text-2xl font-bold">Crime Mastery</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Master each crime type for bonuses!</div></div>;
}

function CasinoPage({ type }: { type: string }) {
  if (type === "lotto") return <LottoPage />;
  if (type === "blackjack") return <BlackjackPage />;
  return <CasinoPage type={type} />;
}

// ============ MAIN DASHBOARD ============

function Moon() { return <span className="text-purple-400">🌑</span>; }
function Settings() { return <span className="text-muted-foreground">⚙️</span>; }
function Droplet() { return <span className="text-blue-400">💧</span>; }
function Crown() { return <span className="text-yellow-400">👑</span>; }

function LoadingPage() { return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" /></div>; }

function LevelUpModal({ player, onDone }: { player: any; onDone: () => void }) {
  const ackLevelUp = useMutation(api.game.acknowledgeLevelUp);
  const handle = async () => { try { await ackLevelUp({}); } catch {} onDone(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-primary/30 rounded-2xl p-8 max-w-sm text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-black text-primary">LEVEL UP!</h2>
        <div className="text-lg">You are now Level <span className="text-primary font-bold">{(player.level ?? 1) + 1}</span></div>
        <div className="text-xs text-muted-foreground">+10 ATK, +10 DEF, +75 HP</div>
        <button onClick={handle} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg">Continue</button>
      </motion.div>
    </div>
  );
}

const rightMenuSections: { title: string; icon: any; items: { title: string; icon: any; page: GamePage }[] }[] = [
  { title: "\uD83D\uDCDD Communication", icon: MessageSquare, items: [
    { title: "\uD83D\uDCE8 Messages", icon: MessageSquare, page: "messages" },
    { title: "\uD83D\uDCE5 Inbox", icon: Inbox, page: "inbox" },
    { title: "\uD83D\uDD14 Notifications", icon: Bell, page: "notifications_page" },
    { title: "\uD83D\uDCE1 General Forum", icon: MessageSquare, page: "forum_general" },
    { title: "\uD83D\uDCB0 Sales & Wanted", icon: DollarSign, page: "forum_sales" },
    { title: "\uD83D\uDCAD Off-Topic", icon: MessageSquare, page: "forum_offtopic" },
    { title: "\uD83C\uDF11 Shadows", icon: Moon, page: "forum_shadows" },
    { title: "\uD83D\uDD0D Search Posts", icon: Search, page: "forum_search" },
  ]},
  { title: "\uD83C\uDF0D World", icon: Map, items: [
    { title: "\uD83C\uDFD9\uFE0F City Overview", icon: MapPin, page: "city_overview" },
    { title: "\uD83D\uDCCA Statistics", icon: BarChart3, page: "statistics" },
    { title: "\uD83D\uDDFA\uFE0F World Map", icon: Map, page: "world_map" },
    { title: "\uD83C\uDF19 Weather", icon: Cloud, page: "weather" },
    { title: "\uD83D\uDCF0 News Ticker", icon: Megaphone, page: "news_ticker" },
  ]},
  { title: "\u2753 Help", icon: HelpCircle, items: [
    { title: "\u2753 FAQ", icon: HelpCircle, page: "faq" },
    { title: "\uD83D\uDEA8 Support", icon: Shield, page: "support" },
  ]},
  { title: "\u2699\uFE0F System", icon: Settings, items: [
    { title: "\u2699\uFE0F Admin Panel", icon: Settings, page: "admin_panel" },
    { title: "\uD83D\uDD11 Become Admin", icon: Shield, page: "become_admin" },
    { title: "\uD83D\uDC65 Online Players", icon: Users, page: "online_list" },
  ]},
];

function RightPanel({ setPage, activePage }: { setPage: (p: GamePage) => void; activePage: GamePage }) {
  const player = useQuery(api.game.getPlayer);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const [expandedRight, setExpandedRight] = useState<string[]>(rightMenuSections.map(s => s.title));
  const toggleRight = (title: string) => setExpandedRight(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  const level = player?.level ?? 1;
  const life = player?.life ?? 100;
  const maxLife = player?.maxLife ?? 100;
  const xpNeeded = level * 100;
  const xp = player?.experience ?? 0;
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);
  const money = player?.money ?? 0;

  return (
    <aside className="w-52 bg-sidebar border-l border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Status</div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1"><span className="text-red-300">❤️ Life</span><span className="text-red-400 font-bold">{life}/{maxLife}</span></div>
            <div className="h-3.5 rounded-full bg-sidebar-accent overflow-hidden border border-red-500/30 animate-glow-pulse">
              <div className="h-full rounded-full animate-life-bar" style={{ width: `${(life / maxLife) * 100}%`, background: "linear-gradient(90deg, #ef4444, #f87171, #ef4444)" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1"><span className="text-yellow-300">⚡ XP</span><span className="text-yellow-400 font-bold">Lv. {level} ({Math.floor(xpPct)}%)</span></div>
            <div className="h-3.5 rounded-full bg-sidebar-accent overflow-hidden border border-yellow-500/30">
              <div className="h-full rounded-full animate-xp-bar" style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, #eab308, #facc15, #eab308)" }} />
            </div>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-500/30 rounded-lg px-2.5 py-1.5 animate-money-glow">
            <span className="text-[11px] font-semibold text-green-300/80">💰 Cash</span>
            <span className="text-[11px] font-bold text-green-300 animate-money-text">${money.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Quick Info</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between"><span className="text-sidebar-foreground/60">Online</span><span className="text-green-400 font-bold">{onlineCount ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-sidebar-foreground/60">Location</span><span className="font-bold">{player?.location ?? "New York"}</span></div>
          <div className="flex justify-between"><span className="text-sidebar-foreground/60">Prestige</span><span className="font-bold text-yellow-400">{player?.prestige ?? 0}</span></div>
          {(player?.wantedLevel ?? 0) > 0 && <div className="flex justify-between"><span className="text-sidebar-foreground/60">🔴 Wanted</span><span className="font-bold text-red-400">{player?.wantedLevel}/10</span></div>}
          {(player?.wantedLevel ?? 0) >= 2 && <div className="flex justify-between"><span className="text-sidebar-foreground/60">🕵️ FBI</span><span className="font-bold text-orange-400">Active</span></div>}
          {(player?.wantedLevel ?? 0) >= 4 && <div className="flex justify-between"><span className="text-sidebar-foreground/60">🎖️ Military</span><span className="font-bold text-red-300">Deployed</span></div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rightMenuSections.map(section => (
          <div key={section.title}>
            <button onClick={() => toggleRight(section.title)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-sidebar-accent/50 transition-colors">
              <span className="text-[11px] font-semibold text-sidebar-foreground/80">{section.title}</span>
              <ChevronDown className={`size-3 text-sidebar-foreground/40 transition-transform ${expandedRight.includes(section.title) ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>{expandedRight.includes(section.title) && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                {section.items.map(item => (
                  <button key={item.page} onClick={() => setPage(item.page)} className={`w-full text-left px-4 py-1.5 text-[10px] transition-colors ${activePage === item.page ? "bg-primary/10 text-primary font-semibold" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"}`}>
                    {item.title}
                  </button>
                ))}
              </motion.div>
            )}</AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );
}

function LeftSidebar({ activePage, setPage, showProfilePopup, setShowProfilePopup }: { activePage: GamePage; setPage: (p: GamePage) => void; showProfilePopup: boolean; setShowProfilePopup: (v: boolean) => void }) {
  const [expanded, setExpanded] = useState<string[]>(leftMenuSections.map(s => s.title));
  const player = useQuery(api.game.getPlayer);
  const toggle = (title: string) => setExpanded(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  const level = player?.level ?? 1;
  const life = player?.life ?? 100;
  const maxLife = player?.maxLife ?? 100;
  const xpNeeded = level * 100;
  const xp = player?.experience ?? 0;
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);
  const money = player?.money ?? 0;

  return (
    <aside className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Profile</div>
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center"><User className="size-3.5 text-primary" /></div>
          <button onClick={() => setShowProfilePopup(true)} className="text-sm font-bold truncate hover:text-primary transition-colors cursor-pointer text-left">{player?.nickname ?? "Unknown"}</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {leftMenuSections.map(section => (
          <div key={section.title}>
            <button onClick={() => toggle(section.title)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-sidebar-accent/50 transition-colors">
              <span className="text-[11px] font-semibold text-sidebar-foreground/80">{section.title}</span>
              <ChevronDown className={`size-3 text-sidebar-foreground/40 transition-transform ${expanded.includes(section.title) ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>{expanded.includes(section.title) && section.children && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                {section.children.map(child => (
                  <button key={child.page} onClick={() => setPage(child.page)} className={`w-full text-left px-4 py-1.5 text-[10px] transition-colors ${activePage === child.page ? "bg-primary/10 text-primary font-semibold" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"}`}>
                    {child.title}
                  </button>
                ))}
              </motion.div>
            )}</AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ============ PAGE ROUTER ============

const pageNames: Record<string, string> = {
  headquarters: "Headquarters", bank: "Bank", hospital: "Hospital", points: "Points Shop",
  my_profile: "My Profile", updates: "Game Updates", crimes: "Crimes",
  legendary_crimes: "Legendary Crimes", boss_fights: "Boss Fights", crime_empire: "Crime Empire",
  heist_planning: "Heist Planning", world_events: "World Events", criminal_pets: "Criminal Pets",
  prison: "Prison", airport: "Airport", wanted_status: "Law Enforcement",
  organized_crime: "Organized Crime", missions: "Missions", daily_login: "Daily Login",
  bodyguards: "Bodyguards", secret_challenges: "Secret Challenges", boosts: "Boosts",
  crime_spree: "Crime Spree", steal_from_house: "Steal From House", gta_car_theft: "GTA Car Theft",
  fight_club: "Fight Club", bounty_board: "Bounty Board", duels: "Duels", kill: "Kill",
  spar: "Spar", tournament: "Tournament", death_match: "Death Match",
  season_rankings: "Season Rankings", combat_log: "Combat Log", fighting_styles: "Fighting Styles",
  armor: "Armor Shop", gambling_dice: "Dice", gambling_lotto: "Lotto", gambling_blackjack: "Blackjack",
  gambling_coin: "Coin Toss", gambling_horse: "Horse Racing", gambling_number: "Number Game",
  roulette: "Roulette", slots: "Slots", russian_roulette: "Russian Roulette",
  underground: "Underground", counterfeiting: "Counterfeiting", drug_trafficking: "Drug Trafficking",
  arson: "Arson", identity_theft: "Identity Theft", arms_dealing: "Arms Dealer",
  witness_intimidation: "Witness Intimidation", tax_evasion: "Tax Evasion", racketeering: "Racketeering",
  gambling_dens: "Gambling Dens", loan_sharking: "Loan Sharking", cargo_theft: "Cargo Theft",
  dog_fighting: "Dog Fighting", street_racing: "Street Racing", smuggling_routes: "Smuggling Routes",
  stock_market: "Stock Market", real_estate: "Real Estate", businesses: "Businesses",
  auction_house: "Auction House", insurance: "Insurance", loans: "Loans", crypto: "Crypto",
  lottery: "Lottery", garage: "Garage", items: "My Items", safe_houses: "Safe Houses",
  wanted_board: "Wanted Board", black_market: "Black Market", mystery_boxes: "Mystery Boxes",
  legendary_items: "Legendary Items", family: "Family", crew_system: "Crew System",
  company: "Company", gifting: "Gifting", crime_fame: "Crime Fame", reputation: "Reputation",
  cartel: "Cartel", messages: "Messages", inbox: "Inbox", notifications_page: "Notifications",
  forum_general: "General Forum", forum_sales: "Sales & Wanted", forum_offtopic: "Off-Topic",
  forum_shadows: "Shadows", forum_search: "Search Posts", city_overview: "City Overview",
  statistics: "Statistics", world_map: "World Map", colosseum: "Colosseum", weather: "Weather",
  news_ticker: "News", skill_tree: "Skill Tree", achievements: "Achievements", titles: "Titles",
  legacy: "Legacy", prestige: "Prestige", leaderboards: "Leaderboards", time_machine: "Time Machine",
  season_pass: "Season Pass", crime_mastery: "Mastery", ghost_mode: "Ghost Mode", crime_tv: "Crime TV",
  daily_challenges: "Daily Challenges", raids: "Raids", arena: "Arena", legacy_board: "Legacy Board",
  faq: "FAQ", support: "Support", admin_panel: "Admin Panel", become_admin: "Become Admin",
  online_list: "Online Players", send_money: "Send Money",
};


// ===== INLINE PAGE COMPONENTS =====
function FightClubPage() {
  const player = useQuery(api.game.getPlayer);
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 via-orange-900/20 to-red-900/40 border border-red-500/30 p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ff0000%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-bounce">🥊</div><h2 className="text-2xl font-black text-red-400">FIGHT CLUB</h2><p className="text-xs text-red-400/60">No rules. No referee. No mercy.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 border border-red-500/20">
      <div className="text-center mb-4"><div className="text-sm font-bold">Underground Arena</div></div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
        <div className="bg-red-950/30 rounded-lg p-3"><div className="text-red-400 font-bold text-lg">{player?.attack ?? 10}</div><div className="text-muted-foreground">ATK</div></div>
        <div className="bg-blue-950/30 rounded-lg p-3"><div className="text-blue-400 font-bold text-lg">{player?.defense ?? 10}</div><div className="text-muted-foreground">DEF</div></div>
        <div className="bg-green-950/30 rounded-lg p-3"><div className="text-green-400 font-bold text-lg">{player?.life ?? 100}</div><div className="text-muted-foreground">HP</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">{[{n:"Street Fight",d:"$10K-50K prize",e:"👊"},{n:"MMA Rules",d:"$100K-500K",e:"🥊"},{n:"Death Match",d:"$1M-5M",e:"💀"},{n:"Clan Battle",d:"Crew vs Crew",e:"⚔️"}].map((f,i) => (
        <div key={i} className="bg-background/50 rounded-lg p-3 text-center border border-border hover:border-primary/30 transition-colors cursor-pointer">
          <div className="text-2xl mb-1">{f.e}</div><div className="font-bold text-xs">{f.n}</div><div className="text-[10px] text-green-400">{f.d}</div>
        </div>))}</div>
    </div>
  </div>);
}

function BountyBoardPage() {
  const bounties = [{target:"ShadowKing99",reward:500000,by:"DarkMatter",time:"2h ago",danger:9},{target:"NeonViper",reward:250000,by:"GhostRider",time:"4h ago",danger:6},{target:"IronWolf",reward:1000000,by:"Anonymous",time:"1h ago",danger:10},{target:"CyberPhantom",reward:150000,by:"StreetLegend",time:"6h ago",danger:4},{target:"NightHawk",reward:750000,by:"SteelBoss",time:"30m ago",danger:8}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 border border-red-500/20 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
      <div className="flex items-center gap-3"><Crosshair className="size-8 text-red-400" /><div><h2 className="text-2xl font-black">🎯 Bounty Board</h2><p className="text-xs text-muted-foreground">Put a price on someone's head</p></div></div>
    </div>
    <div className="grid grid-cols-1 gap-3">{bounties.map((b,i) => (
      <div key={i} className="relative overflow-hidden mafia-card rounded-xl p-4 flex items-center justify-between border border-red-500/20 hover:border-red-500/40 transition-all hover:scale-[1.01] cursor-pointer group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-3">
          <div className="size-12 rounded-full bg-gradient-to-br from-red-900/50 to-red-800/30 flex items-center justify-center border border-red-500/30"><span className="text-xl">🎯</span></div>
          <div><div className="font-bold text-sm">{b.target}</div><div className="text-[10px] text-muted-foreground">by {b.by} • {b.time}</div>
          <div className="flex items-center gap-1 mt-1">{Array.from({length:10}).map((_,j) => (<div key={j} className={`size-1.5 rounded-full ${j<b.danger?"bg-red-500":"bg-gray-700"}`} />))}<span className="text-[9px] text-red-400 ml-1">Danger: {b.danger}/10</span></div></div>
        </div>
        <div className="relative text-right"><div className="text-lg font-black text-green-400">${b.reward.toLocaleString()}</div><button className="text-[10px] px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-lg mt-1 hover:from-red-500 hover:to-red-400 transition-all">Accept Bounty</button></div>
      </div>))}</div>
  </div>);
}

function DuelsPage() {
  const modes = [{n:"Quick Duel",d:"Best of 3 rounds",e:"⚔️",r:"$10K-50K",diff:"Easy"},{n:"Ranked Duel",d:"Competitive match",e:"🏆",r:"$100K-500K",diff:"Medium"},{n:"High Stakes",d:"Winner takes all",e:"💰",r:"$1M-5M",diff:"Hard"},{n:"Clan War",d:"Crew vs crew 3v3",e:"🏴",r:"Team Reward",diff:"Extreme"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">⚔️</div><h2 className="text-2xl font-black">DUEL ARENA</h2><p className="text-xs text-primary/60">Choose your battlefield. Prove your worth.</p></div>
    </div>
    <div className="grid grid-cols-2 gap-3">{modes.map((d,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 space-y-2 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover:scale-[1.02]">
        <div className="text-3xl text-center">{d.e}</div><div className="font-bold text-sm text-center">{d.n}</div>
        <div className="text-[10px] text-muted-foreground text-center">{d.d}</div><div className="text-[10px] text-green-400 text-center font-bold">Prize: {d.r}</div>
      </div>))}</div>
  </div>);
}

function KillPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/50 via-red-800/30 to-red-900/50 border border-red-500/30 p-6">
      <div className="absolute inset-0 animate-pulse bg-red-500/5" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-bounce">💀</div><h2 className="text-2xl font-black text-red-400">ASSASSINATION</h2><p className="text-xs text-red-400/60">Put a price on someone's life. Available 24/7.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-red-500/20">
      <div className="text-center text-6xl">💀</div>
      <div className="text-center"><div className="text-sm font-bold">Assassination Contract</div><div className="text-[10px] text-red-400">Available 24/7</div></div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">{[{n:"Stab",e:"🔪",ch:60,c:"$5K"},{n:"Shoot",e:"🔫",ch:45,c:"$20K"},{n:"Poison",e:"☠️",ch:70,c:"$50K"}].map((w,i) => (
        <div key={i} className="bg-red-950/20 rounded-lg p-3 border border-red-500/10"><div className="text-2xl mb-1">{w.e}</div><div className="font-bold">{w.n}</div><div className="text-[10px] text-muted-foreground">Success: {w.ch}%</div><div className="text-[10px] text-green-400">Cost: {w.c}</div></div>))}</div>
      <div className="bg-red-950/20 rounded-lg p-3 text-xs text-center"><span className="text-red-400">⚠️</span> Failed kills increase wanted level</div>
    </div>
  </div>);
}

function SparPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Heart className="size-7 text-primary" /><h2 className="text-2xl font-bold">🤝 Spar</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">🤝</div><div className="text-sm text-center font-bold">Practice Sparring</div>
      <div className="text-xs text-center text-muted-foreground">No stakes, just practice.</div>
      <div className="bg-green-950/20 rounded-lg p-3 text-xs text-center">✅ Free • +5 XP per spar</div>
      <button className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg">Find Spar Partner</button>
    </div>
  </div>);
}

function TournamentPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-900/30 via-amber-900/20 to-yellow-900/30 border border-yellow-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 flex items-center gap-3"><Trophy className="size-8 text-yellow-400" /><div><h2 className="text-2xl font-black">🏆 Grand Tournament</h2><p className="text-xs text-yellow-400/60">Fight for glory and massive prizes</p></div></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-yellow-500/20">
      <div className="text-center text-5xl mb-2">🏆</div>
      <div className="text-center"><div className="text-lg font-bold text-yellow-400">Grand Tournament</div><div className="text-xs text-muted-foreground">Ends in 4h 32m</div></div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-yellow-950/20 rounded-lg p-3 text-center"><div className="font-bold">🥇 1st</div><div className="text-yellow-400">$5,000,000</div></div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center"><div className="font-bold">🥈 2nd</div><div className="text-gray-300">$2,000,000</div></div>
        <div className="bg-amber-950/30 rounded-lg p-3 text-center"><div className="font-bold">🥉 3rd</div><div className="text-amber-600">$1,000,000</div></div>
        <div className="bg-background/50 rounded-lg p-3 text-center"><div className="font-bold">👥 128</div><div className="text-muted-foreground">Players</div></div>
      </div>
      <button className="w-full py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500">Enter — $500K</button>
    </div>
  </div>);
}

function CrimeSpreePage() {
  const streaks = [{name:"Bronze Spree",count:5,reward:"2x XP",e:"🥉",color:"from-amber-600 to-amber-500"},{name:"Silver Spree",count:10,reward:"3x XP + $100K",e:"🥈",color:"from-gray-400 to-gray-300"},{name:"Gold Spree",count:25,reward:"5x XP + $500K",e:"🥇",color:"from-yellow-500 to-yellow-400"},{name:"Diamond Spree",count:50,reward:"10x XP + $2M",e:"💎",color:"from-cyan-400 to-blue-400"},{name:"Legendary Spree",count:100,reward:"20x XP + $10M",e:"👑",color:"from-purple-500 to-pink-500"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-900/30 via-red-900/20 to-orange-900/30 border border-orange-500/20 p-6">
      <div className="absolute inset-0 animate-pulse bg-orange-500/5" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-pulse">🔥</div><h2 className="text-2xl font-black">CRIME SPREE</h2><p className="text-xs text-orange-400/60">Commit crimes in a row for massive multipliers</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 border border-orange-500/20">
      <div className="text-center mb-4"><div className="text-4xl mb-2">🔥</div><div className="text-sm font-bold">Consecutive Crime Bonus</div><div className="text-xs text-muted-foreground">Commit crimes in a row for massive multipliers</div></div>
      <div className="space-y-2">{streaks.map((s,i) => (
        <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2"><span className="text-xl">{s.e}</span><div><div className="font-bold text-xs">{s.name}</div><div className="text-[10px] text-muted-foreground">{s.count} crimes</div></div></div>
          <div className="text-xs text-green-400 font-bold">{s.reward}</div>
        </div>))}</div>
    </div>
  </div>);
}

function UndergroundPage() {
  const ops = [{n:"Counterfeiting",e:"💵",d:"Print fake bills",p:"$500K/day",r:"Common"},{n:"Drug Lab",e:"⚗️",d:"Manufacture product",p:"$2M/day",r:"Epic"},{n:"Weapon Forge",e:"🔧",d:"Build custom weapons",p:"$1M/day",r:"Rare"},{n:"Data Farm",e:"💻",d:"Mine & sell data",p:"$800K/day",r:"Uncommon"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/40 border border-red-500/30 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">💣</div><h2 className="text-2xl font-black">UNDERGROUND ECONOMY</h2><p className="text-xs text-red-400/60">Advanced criminal operations for serious players</p></div>
    </div>
    <div className="grid grid-cols-2 gap-3">{ops.map((o,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 space-y-2 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer">
        <div className="text-3xl text-center">{o.e}</div><div className="font-bold text-sm text-center">{o.n}</div>
        <div className="text-[10px] text-muted-foreground text-center">{o.d}</div><div className="text-[10px] text-green-400 text-center font-bold">{o.p}</div>
      </div>))}</div>
  </div>);
}

function SmugglingPage() {
  const routes = [{from:"Miami",to:"Cuba",item:"Cocaine",risk:"High",profit:"$500K"},{from:"Tijuana",to:"Phoenix",item:"Weapons",risk:"Medium",profit:"$300K"},{from:"Bogota",to:"Madrid",item:"Heroin",risk:"Extreme",profit:"$2M"},{from:"Shanghai",to:"Tokyo",item:"Tech",risk:"Low",profit:"$150K"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Anchor className="size-7 text-blue-400" /><h2 className="text-2xl font-bold">🚢 Smuggling Routes</h2></div>
    <div className="space-y-2">{routes.map((r,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center justify-between border border-blue-500/20">
        <div className="flex items-center gap-3"><div className="text-2xl">🚢</div><div><div className="font-bold text-xs">{r.from} → {r.to}</div><div className="text-[10px] text-muted-foreground">{r.item} • Risk: {r.risk}</div></div></div>
        <div className="text-right"><div className="text-sm font-bold text-green-400">{r.profit}</div><button className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 mt-1">Run</button></div>
      </div>))}</div>
  </div>);
}

function SafeHousesPage() {
  const houses = [{n:"Shabby Apartment",c:"$100K",s:"10 slots",e:"🏚️"},{n:"Downtown Loft",c:"$500K",s:"25 slots",e:"🏢"},{n:"Suburban House",c:"$2M",s:"50 slots",e:"🏠"},{n:"Beachfront Villa",c:"$10M",s:"100 slots",e:"🏖️"},{n:"Mountain Lodge",c:"$25M",s:"200 slots",e:"🏔️"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Home className="size-7 text-primary" /><h2 className="text-2xl font-bold">🏠 Safe Houses</h2></div>
    <div className="grid grid-cols-2 gap-3">{houses.map((h,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 space-y-2 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
        <div className="text-3xl text-center">{h.e}</div><div className="font-bold text-sm text-center">{h.n}</div>
        <div className="text-[10px] text-muted-foreground text-center">Stash: {h.s}</div><div className="text-[10px] text-green-400 text-center font-bold">{h.c}</div>
        <button className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg">Buy</button>
      </div>))}</div>
  </div>);
}

function WantedBoardPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Target className="size-7 text-red-400" /><h2 className="text-2xl font-bold">🎯 Wanted Board</h2></div>
    <div className="mafia-card rounded-xl p-5 text-center"><div className="text-4xl mb-2">📋</div><div className="text-sm font-bold">Active Wanted Posters</div><div className="text-xs text-muted-foreground">Browse and place bounties on players</div></div>
  </div>);
}

function MysteryBoxesPage() {
  const boxes = [{n:"Common Box",c:"$10K",e:"📦",l:"Common-Uncommon",color:"from-gray-600 to-gray-500",glow:""},{n:"Rare Box",c:"$100K",e:"🎁",l:"Rare-Epic",color:"from-blue-600 to-blue-500",glow:"animate-rare-glow"},{n:"Legendary Box",c:"$1M",e:"💎",l:"Epic-Legendary",color:"from-purple-600 to-purple-500",glow:"animate-legendary-glow"},{n:"Mythic Box",c:"$10M",e:"👑",l:"Legendary+ guaranteed",color:"from-amber-600 to-yellow-500",glow:"animate-epic-glow"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-900/30 via-purple-900/20 to-yellow-900/30 border border-yellow-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-purple-500/5" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">✨</div><h2 className="text-2xl font-black">MYSTERY BOXES</h2><p className="text-xs text-yellow-400/60">What's inside? Only one way to find out...</p></div>
    </div>
    <div className="grid grid-cols-2 gap-3">{boxes.map((b,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 space-y-2 border border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer hover:scale-[1.02]">
        <div className="text-3xl text-center">{b.e}</div><div className="font-bold text-sm text-center">{b.n}</div>
        <div className="text-[10px] text-muted-foreground text-center">Contains: {b.l}</div><div className="text-[10px] text-green-400 text-center font-bold">{b.c}</div>
        <button className="w-full py-1.5 bg-yellow-600 text-white text-xs font-bold rounded-lg hover:bg-yellow-500">Open</button>
      </div>))}</div>
  </div>);
}

function LegendaryItemsPage() {
  const items = [{n:"Excalibur",t:"Weapon",s:"+50 ATK",e:"⚔️",r:"Mythic"},{n:"Dragon Scale Armor",t:"Armor",s:"+80 DEF",e:"🛡️",r:"Legendary"},{n:"Invisibility Cloak",t:"Accessory",s:"Ghost Mode",e:"👻",r:"Epic"},{n:"Phoenix Feather",t:"Consumable",s:"Full Heal",e:"🔥",r:"Legendary"},{n:"Shadow Blade",t:"Weapon",s:"+75 ATK + Speed",e:"🗡️",r:"Mythic"},{n:"Titan Shield",t:"Shield",s:"+100 DEF",e:"🛡️",r:"Epic"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-amber-900/30 border border-amber-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🌟</div><h2 className="text-2xl font-black">LEGENDARY ITEMS</h2><p className="text-xs text-amber-400/60">One-of-a-kind artifacts of immense power</p></div>
    </div>
    <div className="grid grid-cols-2 gap-3">{items.map((it,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 space-y-2 border border-amber-500/20 animate-legendary-glow">
        <div className="text-3xl text-center">{it.e}</div><div className="font-bold text-sm text-center text-amber-400">{it.n}</div>
        <div className="text-[10px] text-muted-foreground text-center">{it.t}</div><div className="text-[10px] text-green-400 text-center font-bold">{it.s}</div>
      </div>))}</div>
  </div>);
}

function FamilyPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">👨‍👩‍👦 Crime Family</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">👨‍👩‍👦</div><div className="text-sm text-center font-bold">Build Your Legacy</div>
      <div className="text-xs text-center text-muted-foreground">Create a family, recruit members, and dominate together</div>
      <div className="grid grid-cols-2 gap-2 text-xs">{[{n:"Members",v:"0/20"},{n:"Power",v:"0"},{n:"Territory",v:"None"},{n:"Income",v:"$0/day"}].map((s,i) => (
        <div key={i} className="bg-background/50 rounded-lg p-3 text-center"><div className="text-muted-foreground">{s.n}</div><div className="font-bold">{s.v}</div></div>))}</div>
      <button className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg">Create Family — $500K</button>
    </div>
  </div>);
}

function CrewPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">🤝 Crew System</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">🤝</div><div className="text-sm text-center font-bold">Form a Crew</div>
      <div className="text-xs text-center text-muted-foreground">Team up with allies for heists, wars, and territory control</div>
      <div className="grid grid-cols-3 gap-2 text-xs">{[{n:"Members",v:"0/5"},{n:"Heists Done",v:"0"},{n:"Crew XP",v:"0"}].map((s,i) => (
        <div key={i} className="bg-background/50 rounded-lg p-3 text-center"><div className="text-muted-foreground">{s.n}</div><div className="font-bold">{s.v}</div></div>))}</div>
      <button className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg">Create Crew — $250K</button>
    </div>
  </div>);
}

function ReputationPage() {
  const factions = [{n:"The Syndicate",rep:0,max:100,e:"🏢"},{n:"Street Wolves",rep:0,max:100,e:"🐺"},{n:"Yakuza",rep:0,max:100,e:"🏯"},{n:"Cartel del Norte",rep:0,max:100,e:"🌮"},{n:"Russian Mafia",rep:0,max:100,e:"🐻"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Globe className="size-7 text-primary" /><h2 className="text-2xl font-bold">🌍 Reputation</h2></div>
    <div className="space-y-2">{factions.map((f,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-xl">{f.e}</span><span className="font-bold text-sm">{f.n}</span></div><span className="text-xs text-muted-foreground">{f.rep}/{f.max}</span></div>
        <div className="h-2 rounded-full bg-sidebar-accent overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-500" style={{width:`${(f.rep/f.max)*100}%`}} /></div>
      </div>))}</div>
  </div>);
}

function CartelPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Users className="size-7 text-red-400" /><h2 className="text-2xl font-bold">🌮 Criminal Cartel</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-3"><div className="text-center text-4xl mb-2">🌮</div><div className="text-sm text-center font-bold">Join or Form a Cartel</div>
    <div className="text-xs text-center text-muted-foreground">Massive criminal organizations that control entire regions</div>
    <button className="w-full py-3 bg-red-600 text-white font-bold rounded-lg">Form Cartel — $5M</button></div>
  </div>);
}

function ColosseumPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Swords className="size-7 text-red-400" /><h2 className="text-2xl font-bold">🏟️ Underground Colosseum</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-red-500/20">
      <div className="text-center text-5xl">🏟️</div>
      <div className="grid grid-cols-2 gap-3">{[{n:"1v1 Arena",d:"Fight for glory",e:"⚔️",p:"$100K"},{n:"Battle Royale",d:"Last one standing",e:"👑",p:"$1M"},{n:"Boss Rush",d:"Defeat AI bosses",e:"👹",p:"$500K"},{n:"Clan Wars",d:"Crew battles",e:"🏴",p:"Team"}].map((a,i) => (
        <div key={i} className="bg-background/50 rounded-lg p-3 text-center border border-red-500/20 hover:border-red-500/40 cursor-pointer transition-colors">
          <div className="text-2xl mb-1">{a.e}</div><div className="font-bold text-xs">{a.n}</div><div className="text-[10px] text-muted-foreground">{a.d}</div><div className="text-[10px] text-green-400">{a.p}</div>
        </div>))}</div>
    </div>
  </div>);
}

function InsurancePage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-900/30 border border-blue-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🛡️</div><h2 className="text-2xl font-black">INSURANCE</h2><p className="text-xs text-blue-400/60">Protect your assets against robbery and death</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">🛡️</div><div className="text-sm text-center font-bold">Protect Your Assets</div>
      <div className="text-xs text-center text-muted-foreground">Insure your cash and items against robberies and deaths</div>
      <div className="space-y-2">{[{n:"Basic Plan",c:"$50K/mo",cov:"50% cash recovery",e:"🥉"},{n:"Premium Plan",c:"$200K/mo",cov:"80% cash + items",e:"🥇"},{n:"Elite Plan",c:"$1M/mo",cov:"Full recovery",e:"💎"}].map((p,i) => (
        <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2"><span className="text-xl">{p.e}</span><div><div className="font-bold text-xs">{p.n}</div><div className="text-[10px] text-muted-foreground">{p.cov}</div></div></div>
          <div className="text-right"><div className="text-xs font-bold">{p.c}</div><button className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-lg mt-1">Buy</button></div>
        </div>))}</div>
    </div>
  </div>);
}

function LoansPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🏦</div><h2 className="text-2xl font-black">UNDERGROUND LOANS</h2><p className="text-xs text-primary/60">Borrow from loan sharks. Default = items seized.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">🏦</div><div className="text-sm text-center font-bold">Loan Shark</div>
      <div className="text-xs text-center text-red-400">⚠️ High interest rates. Default = items seized.</div>
      <div className="space-y-2">{[{a:"$100K",r:"$150K",i:"50%",d:"7 days"},{a:"$500K",r:"$800K",i:"60%",d:"14 days"},{a:"$2M",r:"$3.5M",i:"75%",d:"30 days"}].map((l,i) => (
        <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border">
          <div><div className="font-bold text-xs">Borrow {l.a}</div><div className="text-[10px] text-red-400">Repay {l.r} in {l.d}</div></div>
          <button className="text-[10px] px-3 py-1 bg-primary text-primary-foreground rounded-lg">Borrow</button>
        </div>))}</div>
    </div>
  </div>);
}

function CryptoPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-violet-900/20 to-purple-900/30 border border-purple-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">💎</div><h2 className="text-2xl font-black">CRYPTO TRADING</h2><p className="text-xs text-purple-400/60">Trade volatile in-game cryptocurrencies</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="space-y-2">{[{n:"ShadowCoin (SHC)",p:"$1,234",chg:"+12.5%",c:"bg-green-950/30"},{n:"CrimeCash (CRC)",p:"$567",chg:"-3.2%",c:"bg-red-950/30"},{n:"UnderBank (UNB)",p:"$8,901",chg:"+0.8%",c:"bg-green-950/30"},{n:"DarkToken (DKT)",p:"$42",chg:"+45.2%",c:"bg-green-950/30"}].map((cr,i) => (
        <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border">
          <div><div className="font-bold text-xs">{cr.n}</div><div className="text-xs text-muted-foreground">{cr.p}</div></div>
          <div className="text-right"><div className={`text-xs font-bold ${cr.chg.startsWith("+")?"text-green-400":"text-red-400"}`}>{cr.chg}</div><div className="flex gap-1 mt-1"><button className="text-[10px] px-2 py-0.5 bg-green-600 text-white rounded">Buy</button><button className="text-[10px] px-2 py-0.5 bg-red-600 text-white rounded">Sell</button></div></div>
        </div>))}</div>
    </div>
  </div>);
}

function MessagesPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">📩 Messages</h2></div>
    <div className="mafia-card rounded-xl p-5 text-center"><div className="text-4xl mb-2">📭</div><div className="text-sm font-bold">No Messages</div><div className="text-xs text-muted-foreground">Your inbox is empty</div></div>
  </div>);
}

function NotificationsPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Bell className="size-7 text-primary" /><h2 className="text-2xl font-bold">🔔 Notifications</h2></div>
    <div className="mafia-card rounded-xl p-5 text-center"><div className="text-4xl mb-2">🔕</div><div className="text-sm font-bold">No Notifications</div><div className="text-xs text-muted-foreground">You're all caught up!</div></div>
  </div>);
}

function ForumPage({ type }: { type: string }) {
  const name = type.replace("forum_", "").replace("_", " ");
  const posts = [{t:"Welcome to Shadow Empire!",a:"Admin",r:42,t2:"2h ago"},{t:"Best crime strategies",a:"CrimeBoss",r:18,t2:"5h ago"},{t:"WTS: Legendary Items",a:"Trader99",r:7,t2:"1d ago"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold capitalize">{name} Forum</h2></div>
    <div className="space-y-2">{posts.map((p,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center justify-between border border-border hover:border-primary/30 transition-colors cursor-pointer">
        <div><div className="font-bold text-sm">{p.t}</div><div className="text-[10px] text-muted-foreground">by {p.a} • {p.t2}</div></div>
        <div className="text-xs text-muted-foreground">{p.r} replies</div>
      </div>))}</div>
  </div>);
}

function SkillTreePage() {
  const skills = [{n:"Pickpocketing",l:1,c:"Unlocked",e:"🤏"},{n:"Lockpicking",l:3,c:"Unlocked",e:"🔓"},{n:"Safe Cracking",l:5,c:"Available",e:"🔐"},{n:"Hacking",l:8,c:"Locked",e:"💻"},{n:"Sniping",l:12,c:"Locked",e:"🎯"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Zap className="size-7 text-primary" /><h2 className="text-2xl font-bold">🧠 Skill Tree</h2></div>
    <div className="space-y-2">{skills.map((s,i) => (
      <div key={i} className={`mafia-card rounded-xl p-4 flex items-center justify-between border ${s.c==="Locked"?"border-border opacity-50":"border-primary/20"}`}>
        <div className="flex items-center gap-3"><span className="text-2xl">{s.e}</span><div><div className="font-bold text-sm">{s.n}</div><div className="text-[10px] text-muted-foreground">Req: Level {s.l}</div></div></div>
        <div className={`text-xs font-bold ${s.c==="Unlocked"?"text-green-400":s.c==="Available"?"text-yellow-400":"text-muted-foreground"}`}>{s.c}</div>
      </div>))}</div>
  </div>);
}

function AchievementsPage() {
  const achs = [{n:"First Blood",d:"Complete your first crime",e:"✅",u:false},{n:"Wealthy",d:"Earn $1M total",e:"💰",u:true},{n:"Escape Artist",d:"Escape prison 10 times",e:"🏃",u:true},{n:"Crime Lord",d:"Reach level 50",e:"👑",u:true},{n:"Untouchable",d:"100 crimes without arrest",e:"🛡️",u:true}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Trophy className="size-7 text-primary" /><h2 className="text-2xl font-bold">🏅 Achievements</h2></div>
    <div className="space-y-2">{achs.map((a,i) => (
      <div key={i} className={`mafia-card rounded-xl p-4 flex items-center gap-3 border ${a.u?"border-border opacity-50":"border-primary/20"}`}>
        <span className="text-2xl">{a.u?"🔒":a.e}</span><div className="flex-1"><div className="font-bold text-sm">{a.n}</div><div className="text-[10px] text-muted-foreground">{a.d}</div></div>
        <div className={`text-xs font-bold ${a.u?"text-muted-foreground":"text-green-400"}`}>{a.u?"Locked":"Unlocked"}</div>
      </div>))}</div>
  </div>);
}

function TitlesPage() {
  const titles = [{n:"Street Rat",req:"Level 1",e:"🐀"},{n:"Pickpocket",req:"10 thefts",e:"🤏"},{n:"Enforcer",req:"100 fights",e:"💪"},{n:"Crime Lord",req:"Level 50",e:"👑"},{n:"Shadow Emperor",req:"Prestige 3",e:"🌑"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Star className="size-7 text-primary" /><h2 className="text-2xl font-bold">👑 Titles</h2></div>
    <div className="space-y-2">{titles.map((t,i) => (
      <div key={i} className={`mafia-card rounded-xl p-4 flex items-center gap-3 border ${i<2?"border-primary/20":"border-border opacity-50"}`}>
        <span className="text-2xl">{t.e}</span><div className="flex-1"><div className="font-bold text-sm">{t.n}</div><div className="text-[10px] text-muted-foreground">Req: {t.req}</div></div>
        <div className={`text-xs font-bold ${i<2?"text-green-400":"text-muted-foreground"}`}>{i<2?"✅":"🔒"}</div>
      </div>))}</div>
  </div>);
}

function PrestigePage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Star className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">⭐ Prestige</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-yellow-500/20">
      <div className="text-center text-5xl mb-2">⭐</div>
      <div className="text-center"><div className="text-lg font-bold text-yellow-400">Prestige System</div><div className="text-xs text-muted-foreground">Reach Level 50 to prestige</div></div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-yellow-950/20 rounded-lg p-3 text-center"><div className="font-bold">Reset Level</div><div className="text-yellow-400">Level 1</div></div>
        <div className="bg-yellow-950/20 rounded-lg p-3 text-center"><div className="font-bold">XP Boost</div><div className="text-yellow-400">+15% per prestige</div></div>
        <div className="bg-yellow-950/20 rounded-lg p-3 text-center"><div className="font-bold">Skill Points</div><div className="text-yellow-400">+10 bonus</div></div>
        <div className="bg-yellow-950/20 rounded-lg p-3 text-center"><div className="font-bold">Cash Bonus</div><div className="text-yellow-400">$1M × prestige</div></div>
      </div>
    </div>
  </div>);
}

function LeaderboardsPage() {
  const leaders = [{n:"ShadowKing99",l:87,m:"$45M",e:"👑"},{n:"NeonViper",l:82,m:"$38M",e:"🥈"},{n:"IronWolf",l:79,m:"$31M",e:"🥉"},{n:"CyberPhantom",l:75,m:"$28M",e:"4"},{n:"NightHawk",l:71,m:"$22M",e:"5"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Trophy className="size-7 text-primary" /><h2 className="text-2xl font-bold">🏆 Leaderboards</h2></div>
    <div className="space-y-2">{leaders.map((l,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center gap-3 border border-border">
        <div className={`size-10 rounded-full flex items-center justify-center font-bold text-lg ${i===0?"bg-yellow-500/20 text-yellow-400":i===1?"bg-gray-400/20 text-gray-300":i===2?"bg-amber-600/20 text-amber-600":"bg-background text-muted-foreground"}`}>{l.e}</div>
        <div className="flex-1"><div className="font-bold text-sm">{l.n}</div><div className="text-[10px] text-muted-foreground">Level {l.l}</div></div>
        <div className="text-sm font-bold text-green-400">{l.m}</div>
      </div>))}</div>
  </div>);
}

function WorldMapPage() {
  const cities = [{n:"New York",cr:85,p:12,e:"🗽"},{n:"Los Angeles",cr:72,p:8,e:"🌴"},{n:"Miami",cr:91,p:15,e:"🏖️"},{n:"Chicago",cr:68,p:6,e:"🏙️"},{n:"Las Vegas",cr:95,p:10,e:"🎰"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🗺️</div><h2 className="text-2xl font-black">WORLD MAP</h2><p className="text-xs text-primary/60">Crime hotspots and territory control</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="grid grid-cols-2 gap-2">{cities.map((c,i) => (
        <div key={i} className="bg-background/50 rounded-lg p-3 border border-border hover:border-primary/30 cursor-pointer transition-colors">
          <div className="font-bold text-xs">{c.n}</div>
          <div className="text-[10px] text-muted-foreground">Crime: {c.cr}% • {c.p} players</div>
          <div className="h-1.5 rounded-full bg-sidebar-accent mt-1"><div className="h-full rounded-full bg-red-500" style={{width:`${c.cr}%`}} /></div>
        </div>))}</div>
    </div>
  </div>);
}

function WeatherPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/30 via-blue-900/20 to-cyan-900/30 border border-cyan-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🌤️</div><h2 className="text-2xl font-black">WEATHER</h2><p className="text-xs text-cyan-400/60">Dynamic conditions affect crime success rates</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-5xl">🌧️</div>
      <div className="text-center"><div className="text-lg font-bold">Rainy</div><div className="text-xs text-muted-foreground">Smuggling +20% success</div></div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-blue-950/30 rounded-lg p-2"><div>🌧️</div><div>Rain</div></div>
        <div className="bg-yellow-950/30 rounded-lg p-2"><div>☀️</div><div>Sunny</div></div>
        <div className="bg-gray-800/50 rounded-lg p-2"><div>🌫️</div><div>Fog</div></div>
      </div>
    </div>
  </div>);
}

function NewsTickerPage() {
  const news = [{t:"Robbery on 5th Avenue!",a:"5 min ago",e:"🏦",c:"text-red-400"},{t:"Player ShadowKing reached Level 87",a:"12 min ago",e:"🏆",c:"text-yellow-400"},{t:"Gang war erupted in Miami",a:"1h ago",e:"⚔️",c:"text-orange-400"},{t:"New smuggling route opened",a:"3h ago",e:"🚢",c:"text-blue-400"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">📰</div><h2 className="text-2xl font-black">NEWS TICKER</h2><p className="text-xs text-primary/60">Live feed of crime events and player activity</p></div>
    </div>
    <div className="space-y-2">{news.map((n,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center gap-3 border border-border">
        <span className="text-2xl">{n.e}</span><div className="flex-1"><div className="font-bold text-sm">{n.t}</div><div className="text-[10px] text-muted-foreground">{n.a}</div></div>
      </div>))}</div>
  </div>);
}

function GhostModePage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-violet-900/20 to-purple-900/40 border border-purple-500/20 p-6">
      <div className="absolute inset-0 animate-pulse bg-purple-500/5" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-bounce">👻</div><h2 className="text-2xl font-black">GHOST MODE</h2><p className="text-xs text-purple-400/60">Vanish from the map. No one can find you.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-purple-500/20">
      <div className="text-center text-5xl">👻</div>
      <div className="text-center"><div className="font-bold">Become Invisible</div><div className="text-xs text-muted-foreground">Hidden from map and player list for 1 hour</div></div>
      <div className="bg-purple-950/20 rounded-lg p-3 text-xs text-center">💰 Cost: $1M • Duration: 60 minutes</div>
      <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500">Activate Ghost Mode</button>
    </div>
  </div>);
}

function CrimeTVPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Newspaper className="size-7 text-primary" /><h2 className="text-2xl font-bold">📺 Crime TV</h2></div>
    <div className="mafia-card rounded-xl p-5 text-center"><div className="text-4xl mb-2">📺</div><div className="text-sm font-bold">Live Crime Broadcasts</div><div className="text-xs text-muted-foreground">Watch other players commit crimes in real-time</div></div>
  </div>);
}

function DailyChallengesPage() {
  const chals = [{n:"Commit 5 crimes",p:"60%",r:"$50K + 100 XP",e:"🔥",t:"3h 22m left"},{n:"Win a fight",p:"0%",r:"$25K + 50 XP",e:"🥊",t:"8h 15m left"},{n:"Steal from 3 houses",p:"33%",r:"$75K + 150 XP",e:"🏠",t:"5h 45m left"},{n:"Travel to 2 cities",p:"0%",r:"$30K + 75 XP",e:"✈️",t:"11h 30m left"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">📋</div><h2 className="text-2xl font-black">DAILY CHALLENGES</h2><p className="text-xs text-primary/60">Complete objectives before the timer runs out</p></div>
    </div>
    <div className="space-y-2">{chals.map((c,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-xl">{c.e}</span><span className="font-bold text-xs">{c.n}</span></div><span className="text-xs text-green-400 font-bold">{c.r}</span></div>
        <div className="h-2 rounded-full bg-sidebar-accent overflow-hidden"><div className="h-full rounded-full bg-primary" style={{width:`${c.p}`}} /></div>
        <div className="text-[10px] text-muted-foreground mt-1">{c.p} complete</div>
      </div>))}</div>
  </div>);
}

function RaidsPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 border border-red-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">⚔️</div><h2 className="text-2xl font-black">FACTION RAIDS</h2><p className="text-xs text-red-400/60">Team up for massive multi-player raids</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">⚔️</div>
      <div className="text-center"><div className="font-bold">Faction Raids</div><div className="text-xs text-muted-foreground">Team up for massive multi-player raids</div></div>
      <div className="space-y-2">{[{n:"FBI Headquarters",d:"5 players needed",r:"$10M",diff:"Hard"},{n:"Bank Vault",d:"3 players needed",r:"$5M",diff:"Medium"},{n:"Police Station",d:"2 players needed",r:"$2M",diff:"Easy"}].map((rd,i) => (
        <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border"><div><div className="font-bold text-xs">{rd.n}</div><div className="text-[10px] text-muted-foreground">{rd.d} • {rd.diff}</div></div><div className="text-right"><div className="text-xs font-bold text-green-400">{rd.r}</div><button className="text-[10px] px-3 py-1 bg-red-600 text-white rounded-lg mt-1">Join</button></div></div>))}</div>
    </div>
  </div>);
}

function TimeMachinePage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/30 via-teal-900/20 to-cyan-900/30 border border-cyan-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-spin" style={{animationDuration:"10s"}}>⏳</div><h2 className="text-2xl font-black">TIME MACHINE</h2><p className="text-xs text-cyan-400/60">Relive your greatest heists for bonus XP</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-cyan-500/20">
      <div className="text-center text-5xl">⏳</div>
      <div className="text-center"><div className="font-bold">Replay Greatest Heists</div><div className="text-xs text-muted-foreground">Relive your best moments and earn bonus XP</div></div>
      <div className="bg-cyan-950/20 rounded-lg p-3 text-xs text-center">💰 Cost: $500K per replay • +2x XP from replayed crime</div>
    </div>
  </div>);
}

function SeasonPassPage() {
  const tiers = [{l:1,r:"$10K starter bonus",u:true},{l:5,r:"Bronze Title",u:true},{l:10,r:"$100K + Exclusive Mask",u:false},{l:20,r:"$500K + Custom Plate",u:false},{l:30,r:"$1M + Legendary Crate",u:false},{l:50,r:"$5M + Prestige Bonus",u:false}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-900/30 via-amber-900/20 to-yellow-900/30 border border-yellow-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🎫</div><h2 className="text-2xl font-black">SEASON PASS</h2><p className="text-xs text-yellow-400/60">Unlock exclusive rewards as you level up</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-yellow-500/20">
      <div className="text-center"><div className="text-sm font-bold text-yellow-400">Season 1 — 5 months remaining</div></div>
      <div className="space-y-2">{tiers.map((t,i) => (
        <div key={i} className={`flex items-center justify-between bg-background/50 rounded-lg p-3 border ${t.u?"border-primary/20":"border-border"}`}>
          <div className="flex items-center gap-2"><div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">{t.l}</div><div className="text-xs">{t.r}</div></div>
          <div className={`text-xs font-bold ${t.u?"text-green-400":"text-muted-foreground"}`}>{t.u?"✅":"🔒"}</div>
        </div>))}</div>
    </div>
  </div>);
}

function CrimeMasteryPage() {
  const crimes = [{n:"Theft",l:5,xp:1200,e:"🤏"},{n:"Assault",l:3,xp:800,e:"👊"},{n:"Fraud",l:7,xp:2400,e:"💳"},{n:"Drug Ops",l:2,xp:400,e:"💊"},{n:"Heists",l:1,xp:100,e:"🏦"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🎯</div><h2 className="text-2xl font-black">CRIME MASTERY</h2><p className="text-xs text-primary/60">Master each crime type for massive bonuses</p></div>
    </div>
    <div className="space-y-2">{crimes.map((c,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2"><span className="font-bold text-sm">{c.n}</span><span className="text-xs text-muted-foreground">Level {c.l}</span></div>
        <div className="h-2 rounded-full bg-sidebar-accent overflow-hidden"><div className="h-full rounded-full bg-primary" style={{width:`${Math.min(100,c.xp/50)}%`}} /></div>
        <div className="text-[10px] text-muted-foreground mt-1">{c.xp} XP earned</div>
      </div>))}</div>
  </div>);
}


// ===== ADVANCED FEATURE PAGES =====
function MarriagePage() {
  const propose = useMutation(api.advancedFeatures.proposeMarriage);
  const divorceAction = useMutation(api.advancedFeatures.divorce);
  const player = useQuery(api.game.getPlayer);
  const [targetId, setTargetId] = useState("");
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-900/30 via-rose-900/20 to-pink-900/30 border border-pink-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-pulse">💍</div><h2 className="text-2xl font-black">MARRIAGE</h2><p className="text-xs text-pink-400/60">Love is a battlefield. Share power, share wealth.</p></div>
    </div>
    {(player as any).marriedTo ? (
      <div className="mafia-card rounded-xl p-5 space-y-3 border border-pink-500/20">
        <div className="text-center text-5xl">💍</div>
        <div className="text-center"><div className="text-lg font-bold text-pink-400">You're Married!</div><div className="text-xs text-muted-foreground">Your spouse shares your bank and bonuses</div></div>
        <button onClick={async () => { try { const r = await divorceAction({}); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg">💔 Divorce</button>
      </div>
    ) : (
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <div className="text-center text-4xl mb-2">💍</div>
        <div className="text-center"><div className="font-bold">Propose Marriage</div><div className="text-xs text-muted-foreground">Share bank, combined power, +50% XP together</div></div>
        <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Enter player ID..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" />
        <button onClick={async () => { try { const r = await propose({ targetId: targetId as any }); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="w-full py-3 bg-pink-600 text-white font-bold rounded-lg">💍 Propose — $500K Ring</button>
        {msg && <div className="text-sm text-primary text-center">{msg}</div>}
      </div>
    )}
  </div>);
}

function FamilyTreePage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">🌳 Crime Family Tree</h2></div>
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-primary/20">
      <div className="text-center text-5xl">🌳</div>
      <div className="text-center"><div className="font-bold">Your Lineage</div><div className="text-xs text-muted-foreground">Your descendants earn you passive XP</div></div>
      <div className="bg-background/50 rounded-lg p-4 text-center"><div className="text-2xl mb-2">👤</div><div className="font-bold text-sm">You (Founder)</div><div className="text-[10px] text-muted-foreground">0 descendants • +0 XP/hr from lineage</div></div>
      <div className="text-xs text-center text-muted-foreground">Recruit players to your family tree to earn passive bonuses</div>
    </div>
  </div>);
}

function PersonalityPage() {
  const traits = [{n:"Ruthless",e:"😈",d:"More crime rewards, more enemies",v:0,c:"red"},{n:"Loyal",e:"🤝",d:"Crew bonuses, harder to betray",v:0,c:"blue"},{n:"Snake",e:"🐍",d:"Better at scams, feared by NPCs",v:0,c:"green"},{n:"Legend",e:"👑",d:"NPC respect, cheaper shops",v:0,c:"yellow"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-violet-900/20 to-purple-900/30 border border-purple-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🎭</div><h2 className="text-2xl font-black">PERSONALITY</h2><p className="text-xs text-purple-400/60">Your actions shape who you become</p></div>
    </div>
    <div className="space-y-3">{traits.map((t,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center gap-3 border border-border">
        <span className="text-3xl">{t.e}</span>
        <div className="flex-1"><div className="font-bold text-sm">{t.n}</div><div className="text-[10px] text-muted-foreground">{t.d}</div>
        <div className="h-2 rounded-full bg-sidebar-accent mt-1"><div className={`h-full rounded-full bg-${t.c}-500`} style={{width:`${t.v}%`}} /></div></div>
        <div className="text-xs font-bold">{t.v}/100</div>
      </div>))}</div>
  </div>);
}

function DeadSwitchPage() {
  const setSwitch = useMutation(api.advancedFeatures.setDeadMansSwitch);
  const [targetId, setTargetId] = useState("");
  const [msg, setMsg] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/40 border border-red-500/30 p-6">
      <div className="absolute inset-0 animate-pulse bg-red-500/5" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">💀</div><h2 className="text-2xl font-black text-red-400">DEAD MAN'S SWITCH</h2><p className="text-xs text-red-400/60">If you die, your legacy lives on</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-red-500/20">
      <div className="text-center text-5xl">💀</div>
      <div className="text-center"><div className="font-bold">Dead Man's Switch</div><div className="text-xs text-muted-foreground">If you die, your items auto-transfer to a trusted player</div></div>
      <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Enter beneficiary player ID..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" />
      <button onClick={async () => { try { const r = await setSwitch({ beneficiaryId: targetId as any }); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg">Arm Dead Switch</button>
      {msg && <div className="text-sm text-primary text-center">{msg}</div>}
    </div>
  </div>);
}

function AIGangsPage() {
  const initGangs = useMutation(api.advancedFeatures.initAIGangs);
  const attackGang = useMutation(api.advancedFeatures.attackAIGang);
  const gangs = useQuery(api.advancedFeatures.getAIGangs);
  const [msg, setMsg] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 via-orange-900/20 to-red-900/40 border border-red-500/30 p-6">
      <div className="absolute inset-0 animate-pulse bg-red-500/5" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">👹</div><h2 className="text-2xl font-black text-red-400">RIVAL AI GANGS</h2><p className="text-xs text-red-400/60">AI crews that fight for territory and prey on players</p></div>
    </div>
    <button onClick={async () => { const r = await initGangs({}); setMsg(r.message); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Spawn Gangs</button>
    {msg && <div className="text-sm text-primary">{msg}</div>}
    <div className="space-y-2">{(gangs ?? []).map((g: any) => (
      <div key={g._id} className="mafia-card rounded-xl p-4 flex items-center justify-between border border-red-500/20">
        <div className="flex items-center gap-3"><div className="text-2xl">👹</div><div><div className="font-bold text-sm">{g.name}</div><div className="text-[10px] text-muted-foreground">{g.territory} • Lv.{g.level} • Str:{g.strength}</div></div></div>
        <div className="text-right"><div className="text-xs text-green-400">${g.income.toLocaleString()}/hr</div><button onClick={async () => { try { const r = await attackGang({ gangId: g._id }); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="text-[10px] px-3 py-1 bg-red-600 text-white rounded-lg mt-1">Attack</button></div>
      </div>))}</div>
  </div>);
}

function InformantsPage() {
  const hire = useMutation(api.advancedFeatures.hireInformant);
  const [targetId, setTargetId] = useState("");
  const [intel, setIntel] = useState<any>(null);
  const [msg, setMsg] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🕵️</div><h2 className="text-2xl font-black">INFORMANTS</h2><p className="text-xs text-purple-400/60">Pay $100K to spy on any player</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-4xl mb-2">🕵️</div>
      <div className="text-center"><div className="font-bold">Hire an Informant</div><div className="text-xs text-muted-foreground">Pay $100K to spy on any player</div></div>
      <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Target player ID..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" />
      <button onClick={async () => { try { const r = await hire({ targetId: targetId as any }); setMsg(r.message); setIntel(r.intel); } catch(e: any) { setMsg(e.message); } }} className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg">Spy — $100K</button>
      {msg && <div className="text-sm text-primary text-center">{msg}</div>}
      {intel && <div className="bg-background/50 rounded-lg p-3 text-xs space-y-1"><div>📍 Location: {intel.location}</div><div>⭐ Level: {intel.level}</div><div>💰 Cash: ~${intel.money.toLocaleString()}</div><div>⚔️ ATK: {intel.attack}</div></div>}
    </div>
  </div>);
}

function DistrictsPage() {
  const districts = useQuery(api.advancedFeatures.getDistricts);
  const buyD = useMutation(api.advancedFeatures.buyDistrict);
  const initD = useMutation(api.advancedFeatures.initDistricts);
  const collect = useMutation(api.advancedFeatures.collectDistrictIncome);
  const [msg, setMsg] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-900/30 border border-blue-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🏙️</div><h2 className="text-2xl font-black">DISTRICT OWNERSHIP</h2><p className="text-xs text-blue-400/60">Buy territory, earn passive income from every crime</p></div>
    </div>
    <div className="flex gap-2"><button onClick={async () => { const r = await initD({}); setMsg(r.message); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs">Init Districts</button>
    <button onClick={async () => { const r = await collect({}); setMsg(`Collected $${r.totalIncome.toLocaleString()} from ${r.count} districts`); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs">💰 Collect Income</button></div>
    {msg && <div className="text-sm text-primary">{msg}</div>}
    <div className="grid grid-cols-2 gap-3">{(districts ?? []).map((d: any) => (
      <div key={d._id} className={`mafia-card rounded-xl p-4 space-y-2 border ${d.ownerId ? "border-green-500/30" : "border-blue-500/20"}`}>
        <div className="font-bold text-sm">{d.name}</div><div className="text-[10px] text-muted-foreground">{d.city} • Security: {d.security}%</div>
        <div className="text-xs text-green-400 font-bold">${d.income.toLocaleString()}/hr</div>
        {d.ownerId ? <div className="text-[10px] text-green-400">✅ Owned</div> : (
          <button onClick={async () => { try { const r = await buyD({ districtId: d._id }); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">${d.price.toLocaleString()}</button>)}
      </div>))}</div>
  </div>);
}

function CorruptionPage() {
  const bribes = [{n:"Street Cop",c:"$50K",e:"👮",d:"-2 wanted levels",color:"from-gray-600 to-gray-500"},{n:"Judge",c:"$500K",e:"⚖️",d:"Clear all charges",color:"from-amber-600 to-yellow-500"},{n:"FBI Agent",c:"$2M",e:"🕵️",d:"Access FBI database",color:"from-blue-600 to-cyan-500"},{n:"Mayor",c:"$10M",e:"🏛️",d:"District protection",color:"from-red-600 to-orange-500"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-900/30 border border-blue-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🔒</div><h2 className="text-2xl font-black">CORRUPTION</h2><p className="text-xs text-blue-400/60">Everyone has a price. What's yours?</p></div>
    </div>
    <div className="space-y-2">{bribes.map((b,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center justify-between border border-blue-500/20">
        <div className="flex items-center gap-3"><span className="text-2xl">{b.e}</span><div><div className="font-bold text-sm">{b.n}</div><div className="text-[10px] text-muted-foreground">{b.d}</div></div></div>
        <div className="text-right"><div className="text-xs font-bold">{b.c}</div><button className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-lg mt-1">Bribe</button></div>
      </div>))}</div>
  </div>);
}

function RansomwarePage() {
  const deploy = useMutation(api.advancedFeatures.deployRansomware);
  const [targetId, setTargetId] = useState("");
  const [msg, setMsg] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 via-orange-900/20 to-red-900/40 border border-red-500/20 p-6">
      <div className="absolute inset-0 animate-pulse bg-red-500/5" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">💻</div><h2 className="text-2xl font-black">RANSOMWARE</h2><p className="text-xs text-red-400/60">Encrypt their data. Steal their cash. $50K per attack.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-red-500/20">
      <div className="text-center text-5xl">💻</div>
      <div className="text-center"><div className="font-bold">Deploy Ransomware</div><div className="text-xs text-muted-foreground">Steal 15% of a player's cash. Cost: $50K</div></div>
      <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Target player ID..." className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm" />
      <button onClick={async () => { try { const r = await deploy({ targetId: targetId as any }); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg">Deploy — $50K</button>
      {msg && <div className="text-sm text-primary text-center">{msg}</div>}
    </div>
  </div>);
}

function CraftingPage() {
  const craft = useMutation(api.advancedFeatures.craftItem);
  const [msg, setMsg] = useState("");
  const recipes = [{id:"lockpick_set",n:"Lockpick Set",c:"$5K",a:"+5 ATK",e:"🔓",r:"Common"},{id:"kevlar_vest",n:"Kevlar Vest",c:"$50K",a:"+25 DEF",e:"🦺",r:"Uncommon"},{id:"silencer",n:"Silencer",c:"$25K",a:"+15 ATK",e:"🔇",r:"Uncommon"},{id:"bat_signal",n:"Bat Signal",c:"$100K",a:"+30 ATK +20 DEF",e:"🦇",r:"Rare"},{id:"diamond_blade",n:"Diamond Blade",c:"$500K",a:"+50 ATK",e:"💎",r:"Epic"},{id:"nano_armor",n:"Nano Armor",c:"$2M",a:"+80 DEF",e:"🤖",r:"Legendary"}];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-amber-900/30 border border-amber-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">🔧</div><h2 className="text-2xl font-black">ITEM CRAFTING</h2><p className="text-xs text-amber-400/60">Combine resources into powerful gear</p></div>
    </div>
    {msg && <div className="text-sm text-primary">{msg}</div>}
    <div className="grid grid-cols-2 gap-3">{recipes.map((r,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 space-y-2 border border-amber-500/20 hover:border-amber-500/40 transition-all">
        <div className="text-3xl text-center">{r.e}</div><div className="font-bold text-sm text-center">{r.n}</div>
        <div className="text-[10px] text-muted-foreground text-center">{r.a}</div>
        <button onClick={async () => { try { const res = await craft({ recipe: r.id }); setMsg(res.message); } catch(e: any) { setMsg(e.message); } }} className="w-full py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg">Craft {r.c}</button>
      </div>))}</div>
  </div>);
}

function AuctionsPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="flex items-center gap-3"><DollarSign className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">🏷️ Black Market Auctions</h2></div>
    <div className="space-y-2">{[{n:"Excalibur Sword",bid:"$2.5M",time:"45m",r:"Legendary"},{n:"Ghost Protocol",bid:"$800K",time:"1h 20m",r:"Epic"},{n:"Nano Suit",bid:"$1.2M",time:"2h",r:"Legendary"},{n:"Diamond Ring",bid:"$500K",time:"30m",r:"Rare"}].map((a,i) => (
      <div key={i} className="mafia-card rounded-xl p-4 flex items-center justify-between border border-yellow-500/20">
        <div><div className="font-bold text-sm">{a.n}</div><div className="text-[10px] text-muted-foreground">{a.r} • Ends in {a.time}</div></div>
        <div className="text-right"><div className="text-xs font-bold text-yellow-400">{a.bid}</div><button className="text-[10px] px-3 py-1 bg-yellow-600 text-white rounded-lg mt-1">Bid</button></div>
      </div>))}</div>
  </div>);
}

function TimeCapsulesPage() {
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/30 via-teal-900/20 to-cyan-900/30 border border-cyan-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">⏳</div><h2 className="text-2xl font-black">TIME CAPSULES</h2><p className="text-xs text-cyan-400/60">Bury items now, dig them up later for +50% value</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3 border border-cyan-500/20">
      <div className="text-center text-5xl">⏳</div>
      <div className="text-center"><div className="font-bold">Buried Items</div><div className="text-xs text-muted-foreground">Bury items now, dig them up later for bonus value</div></div>
      <div className="bg-cyan-950/20 rounded-lg p-3 text-xs text-center">💰 Items gain +50% value after being buried for 7+ days</div>
      <div className="text-center text-sm text-muted-foreground">No capsules buried yet</div>
    </div>
  </div>);
}

function CrimePhotosPage() {
  const takeP = useMutation(api.advancedFeatures.takePhoto);
  const [msg, setMsg] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">📸</div><h2 className="text-2xl font-black">CRIME PHOTOGRAPHY</h2><p className="text-xs text-primary/60">Capture the moment. Sell to newspapers for cash.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-center text-5xl mb-2">📸</div>
      <div className="text-center"><div className="font-bold">Capture the Moment</div><div className="text-xs text-muted-foreground">Take photos of crimes, sell to newspapers for cash</div></div>
      {["Street Crime","Bank Robbery","Car Theft","Drug Deal","Arson"].map((c,i) => (
        <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border">
          <span className="text-sm font-bold">{c}</span>
          <button onClick={async () => { try { const r = await takeP({ crimeType: c }); setMsg(r.message); } catch(e: any) { setMsg(e.message); } }} className="text-[10px] px-3 py-1 bg-primary text-primary-foreground rounded-lg">📸 Capture</button>
        </div>))}
      {msg && <div className="text-sm text-primary text-center">{msg}</div>}
    </div>
  </div>);
}

function PurgePage() {
  const purge = useQuery(api.advancedFeatures.getPurgeStatus);
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/50 via-red-800/30 to-red-900/50 border border-red-500/30 p-6">
      <div className="absolute inset-0 animate-pulse bg-red-500/10" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-bounce">☠️</div><h2 className="text-2xl font-black text-red-400">SERVER PURGE</h2><p className="text-xs text-red-400/60">Monthly 24-hour chaos event</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-red-500/20">
      <div className="text-center text-6xl">☠️</div>
      <div className="text-center"><div className="text-lg font-bold text-red-400">{purge?.isPurge ? "🔴 PURGE ACTIVE!" : "Purge Inactive"}</div>
      <div className="text-xs text-muted-foreground">{purge?.isPurge ? "ALL CRIMES LEGAL — NO WANTED LEVELS!" : `Next purge in ${Math.floor((purge?.timeUntil ?? 0) / 86400000)} days`}</div></div>
      <div className="bg-red-950/20 rounded-lg p-3 text-xs text-center">During Purge: 2x XP, no wanted levels, all crimes legal. Pure chaos for 24 hours.</div>
    </div>
  </div>);
}

function HeadlinesPage() {
  const headlines = useQuery(api.advancedFeatures.getHeadlines);
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">📰</div><h2 className="text-2xl font-black">CRIME HEADLINES</h2><p className="text-xs text-primary/60">Your biggest crimes make the news</p></div>
    </div>
    {(headlines ?? []).length === 0 ? (
      <div className="mafia-card rounded-xl p-5 text-center"><div className="text-4xl mb-2">📰</div><div className="text-sm font-bold">No Headlines Yet</div><div className="text-xs text-muted-foreground">Commit big crimes to make the news!</div></div>
    ) : (headlines ?? []).map((h: any) => (
      <div key={h._id} className="mafia-card rounded-xl p-4 border border-border"><div className="font-bold text-sm">{h.title}</div><div className="text-[10px] text-muted-foreground">by {h.playerName} • {h.crimeType}</div></div>))}
  </div>);
}

function RadioPage() {
  const msgs = useQuery(api.advancedFeatures.getRadioMessages);
  const send = useMutation(api.advancedFeatures.radioMessage);
  const [msg, setMsg] = useState("");
  const [text, setText] = useState("");
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900/30 via-emerald-900/20 to-green-900/30 border border-green-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3">📻</div><h2 className="text-2xl font-black">UNDERGROUND RADIO</h2><p className="text-xs text-green-400/60">Level 30+ required. Real-time hidden chat.</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-3">
      <div className="text-xs text-muted-foreground text-center">🔒 Level 30+ required • Real-time hidden chat</div>
      <div className="space-y-2 max-h-60 overflow-y-auto">{(msgs ?? []).map((m: any) => (
        <div key={m._id} className="bg-background/50 rounded-lg p-2 text-xs"><span className="font-bold text-green-400">{m.senderName}:</span> {m.message}</div>))}</div>
      <div className="flex gap-2"><input value={text} onChange={e => setText(e.target.value)} placeholder="Broadcast..." className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
      <button onClick={async () => { try { await send({ message: text }); setText(""); } catch(e: any) { setMsg(e.message); } }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Send</button></div>
      {msg && <div className="text-xs text-red-400">{msg}</div>}
    </div>
  </div>);
}

function CockroachPage() {
  const bet = useMutation(api.advancedFeatures.betCockroach);
  const [amount, setAmount] = useState(10000);
  const [selected, setSelected] = useState(0);
  const [result, setResult] = useState<any>(null);
  const colors = ["🟥","🟧","🟨","🟩","🟦","🟪"];
  const names = ["Red Rocket","Orange Crush","Golden Boy","Green Machine","Blue Thunder","Purple Rain"];
  return (<div className="animate-fade-in space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-amber-900/30 border border-amber-500/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
      <div className="relative z-10 text-center"><div className="text-6xl mb-3 animate-bounce">🪳</div><h2 className="text-2xl font-black">COCKROACH RACING</h2><p className="text-xs text-amber-400/60">Pick your champion. 5x payout if they win!</p></div>
    </div>
    <div className="mafia-card rounded-xl p-5 space-y-4 border border-amber-500/20">
      <div className="text-center text-5xl">🪳</div>
      <div className="text-center"><div className="font-bold">Pick Your Roach</div><div className="text-xs text-muted-foreground">5x payout if your roach wins!</div></div>
      <div className="grid grid-cols-6 gap-2">{colors.map((c,i) => (
        <button key={i} onClick={() => setSelected(i)} className={`text-3xl p-2 rounded-lg border-2 ${selected===i?"border-primary bg-primary/10":"border-border"}`}>{c}</button>))}</div>
      <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-center" />
      <button onClick={async () => { try { const r = await bet({ cockroachIndex: selected, amount }); setResult(r); } catch(e: any) { setResult({message: e.message}); } }} className="w-full py-3 bg-amber-600 text-white font-bold rounded-lg">Bet ${amount.toLocaleString()}</button>
      {result && <div className={`p-4 rounded-lg text-center text-sm ${result.won?"bg-green-950/30 border border-green-500/30":"bg-red-950/30 border border-red-500/30"}`}>{result.message}</div>}
    </div>
  </div>);
}


function GameUpdatesPage() {
  const updates = useQuery(api.gameUpdates.getUpdates);
  const seedUpdates = useMutation(api.gameUpdates.seedUpdates);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (updates && updates.length === 0 && !seeded) {
      seedUpdates({}).then(() => setSeeded(true)).catch(() => {});
    }
  }, [updates, seeded]);

  if (!updates) return <LoadingPage />;

  const typeColors: Record<string, string> = {
    major: "border-yellow-500/30 bg-yellow-950/10",
    feature: "border-green-500/20 bg-green-950/5",
    improvement: "border-blue-500/20 bg-blue-950/5",
    reward: "border-purple-500/20 bg-purple-950/5",
    visual: "border-pink-500/20 bg-pink-950/5",
    event: "border-orange-500/20 bg-orange-950/5",
    system: "border-cyan-500/20 bg-cyan-950/5",
  };
  const typeLabels: Record<string, string> = {
    major: "🔥 MAJOR", feature: "✨ NEW", improvement: "⬆️ IMPROVED", reward: "🎁 REWARD", visual: "🎨 VISUAL", event: "📅 EVENT", system: "⚙️ SYSTEM",
  };

  return (
    <div className="animate-fade-in space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <div className="relative"><ScrollText className="size-8 text-primary" /><div className="absolute -inset-1 bg-primary/20 rounded-full blur-lg" /></div>
        <div>
          <h2 className="text-2xl font-black">📜 <span className="text-primary">GAME UPDATES</span></h2>
          <p className="text-xs text-primary/60 font-mono">SHADOW EMPIRE CHANGELOG</p>
        </div>
      </div>
      <div className="space-y-3">
        {updates.map((u: any) => (
          <div key={u._id} className={`rounded-xl p-4 border ${typeColors[u.type] ?? "border-border/50"} ${u.pinned ? "ring-1 ring-yellow-500/30" : ""} hover:scale-[1.005] transition-all`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0 mt-0.5">{u.icon ?? "📢"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-primary/20 text-primary">{typeLabels[u.type] ?? u.type}</span>
                  {u.pinned && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-yellow-500/20 text-yellow-400">📌 PINNED</span>}
                </div>
                <div className="text-sm font-bold mt-1">{u.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{u.description}</div>
                <div className="text-[9px] text-muted-foreground/50 mt-2">{new Date(u.timestamp).toLocaleDateString()} {new Date(u.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function PrisonBlocked() {
  const status = useQuery(api.gameFeatures.getPrisonTimeDisplay);
  const [countdown, setCountdown] = useState(status?.totalSeconds ?? 0);

  useEffect(() => {
    if (!status || status.totalSeconds <= 0) return;
    setCountdown(status.totalSeconds);
    const timer = setInterval(() => {
      setCountdown((c: number) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status?.totalSeconds]);

  const hrs = Math.floor(countdown / 3600);
  const mins = Math.floor((countdown % 3600) / 60);
  const secs = countdown % 60;

  return (
    <div className="animate-fade-in space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <div className="rounded-2xl p-8 border-2 border-red-500/30 bg-red-950/15 text-center relative overflow-hidden">
          <div className="absolute inset-0 animate-prison-bars opacity-10" />
          <div className="relative space-y-4">
            <div className="text-7xl animate-bounce">🔒</div>
            <h2 className="text-2xl font-black text-red-400">IN PRISON</h2>
            <p className="text-sm text-muted-foreground">You can't do this right now. You're serving time!</p>
            <div className="inline-block rounded-xl px-6 py-3 bg-black/40 border border-red-500/30">
              <div className="text-3xl font-black text-red-400 font-mono">
                {hrs > 0 ? `${String(hrs).padStart(2, "0")}:` : ""}{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Time remaining</div>
            </div>
            <div className="text-xs text-muted-foreground">Auto-releases when timer reaches 0:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SafePage({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  if (error) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="mafia-card rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <div className="text-sm font-bold text-red-400">Page Error</div>
          <div className="text-xs text-muted-foreground">{error}</div>
          <button onClick={() => { setError(null); window.location.reload(); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs">Reload</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// ===== EVENT STATUS BAR =====
function EventStatusBar({ player }: { player: any }) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const hour = now.getHours();
  const events: { icon: string; text: string; color: string; active: boolean }[] = [
    { icon: "\u26A1", text: "Weekend Boost: +1-10 XP on all crimes", color: "from-yellow-900/40 to-amber-900/30 border-yellow-500/30 text-yellow-300", active: (day === 5 && hour >= 0) || day === 6 || (day === 0 && hour < 24) },
    { icon: "\u2694\uFE0F", text: "Kill Free Zone: No wanted level for kills", color: "from-red-900/40 to-rose-900/30 border-red-500/30 text-red-300", active: day >= 1 && day <= 3 && hour >= 18 && hour <= 20 },
    { icon: "\u2728", text: "Golden Hour: 2x Points on all actions", color: "from-amber-900/40 to-yellow-900/30 border-amber-500/30 text-amber-300", active: hour >= 12 && hour <= 13 },
    { icon: "\uD83D\uDD25", text: "Crime Frenzy: All crimes +50% success rate", color: "from-orange-900/40 to-red-900/30 border-orange-500/30 text-orange-300", active: hour >= 22 || hour < 4 },
    { icon: "\u2744\uFE0F", text: "Arctic Cold Snap: Smuggling profits +50%", color: "from-cyan-900/40 to-blue-900/30 border-cyan-500/30 text-cyan-300", active: day === 0 && hour >= 10 && hour <= 22 },
    { icon: "\uD83D\uDCB0", text: "Double Cash: Earn 2x money on all crimes", color: "from-green-900/40 to-emerald-900/30 border-green-500/30 text-green-300", active: day === 3 && hour >= 18 && hour <= 22 },
    { icon: "\uD83D\uDE08", text: "Purge Night: All crimes legal, no wanted", color: "from-red-950/60 to-red-900/40 border-red-600/40 text-red-200 animate-pulse", active: day === 5 && hour >= 22 },
    { icon: "\uD83C\uDFA6", text: "Black Market Sale: 30% off all items", color: "from-purple-900/40 to-violet-900/30 border-purple-500/30 text-purple-300", active: day === 2 && hour >= 14 && hour <= 18 },
    { icon: "\uD83D\uDC8E", text: "Diamond Rush: Legendary crimes give bonus XP", color: "from-pink-900/40 to-fuchsia-900/30 border-pink-500/30 text-pink-300", active: day === 4 && hour >= 20 },
    { icon: "\uD83C\uDF1F", text: "VIP Hour: All bodyguards cost 50% less", color: "from-indigo-900/40 to-blue-900/30 border-indigo-500/30 text-indigo-300", active: day === 6 && hour >= 12 && hour <= 14 },
  ];
  const activeEvents = events.filter(e => e.active);
  if (activeEvents.length === 0) return null;
  return (
    <div className="mb-4 space-y-1.5">
      {activeEvents.map((ev, i) => (
        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r border text-[11px] font-semibold ${ev.color}`}>
          <span>{ev.icon}</span>
          <span>{ev.text}</span>
          <span className="ml-auto text-[9px] opacity-60">LIVE</span>
          <span className="size-1.5 rounded-full bg-current animate-pulse" />
        </div>
      ))}
    </div>
  );
}


// ===== ADVANCED FEATURES PAGE =====
function AdvancedFeaturesPage() {
  const features = [
    { icon: "\uD83D\uDC7C", title: "Marriage System", desc: "Propose to another player. Share bank, combined power. Divorce splits assets.", page: "marriage" },
    { icon: "\uD83C\uDF33", title: "Crime Family Tree", desc: "Your descendants earn you passive XP. Build a criminal dynasty.", page: "family_tree" },
    { icon: "\uD83C\uDFAD", title: "Personality System", desc: "Your actions shape your reputation: Ruthless, Loyal, Snake, or Legend.", page: "personality" },
    { icon: "\uD83D\uDC80", title: "Dead Man's Switch", desc: "Set a beneficiary — on death, your items auto-transfer to them.", page: "dead_switch" },
    { icon: "\uD83D\uDC79", title: "Rival AI Gangs", desc: "NPC gangs that attack your territory. Fight them for massive rewards.", page: "ai_gangs" },
    { icon: "\uD83D\uDD75\uFE0F", title: "Informants", desc: "Pay NPCs to spy on any player — reveals location, level, cash, ATK.", page: "informants" },
    { icon: "\uD83C\uDFD9\uFE0F", title: "District Ownership", desc: "Buy city districts. Earn passive income from every crime committed there.", page: "districts" },
    { icon: "\uD83D\uDD12", title: "Corruption", desc: "Bribe cops, judges, and politicians. Lower wanted levels, frame rivals.", page: "corruption" },
    { icon: "\uD83D\uDCBB", title: "Ransomware", desc: "Lock another player's items. They pay YOU to unlock them.", page: "ransomware" },
    { icon: "\uD83D\uDD27", title: "Item Crafting", desc: "Combine items into better gear. 6 recipes from Lockpick to Nano Armor.", page: "crafting" },
    { icon: "\uD83D\uDC9C", title: "Black Market Auctions", desc: "Hourly auctions for rare items. Bid against other players.", page: "auctions" },
    { icon: "\u23F3", title: "Time Capsules", desc: "Bury items now, dig them up later. Items gain +50% value after 7+ days.", page: "time_capsules" },
    { icon: "\uD83D\uDCF8", title: "Crime Photography", desc: "Capture photos of crimes. Sell to newspapers for massive cash.", page: "crime_photos" },
    { icon: "\uD83C\uDF10", title: "Server Purge", desc: "Monthly 24-hour event: ALL crimes legal, no wanted levels, 2x XP.", page: "purge" },
    { icon: "\uD83D\uDCF0", title: "Crime Headlines", desc: "Your biggest crimes generate real headlines that all players see.", page: "headlines" },
    { icon: "\uD83D\uDCBB", title: "Underground Radio", desc: "Level 30+ hidden real-time chat. Only the elite can broadcast.", page: "radio" },
    { icon: "\uD83E\uDD1E", title: "Cockroach Racing", desc: "Pick a colored roach, bet any amount. 5x payout if yours wins!", page: "cockroach" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Zap className="size-7 text-amber-400" /><h2 className="text-2xl font-bold">\u26A1 Advanced Features</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((f, i) => (
          <button key={i} onClick={() => (window as any).__setPage?.(f.page)} className="text-left p-4 mafia-card rounded-xl border border-primary/10 hover:border-primary/30 transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{f.icon}</div>
              <div><div className="text-sm font-bold">{f.title}</div><div className="text-[10px] text-muted-foreground">{f.desc}</div></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const signOut = () => {};
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const player = useQuery(api.game.getPlayer);
  const releaseFromPrison = useMutation(api.game.releaseFromPrison);
  const [registered, setRegistered] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [dismissedLevelUp, setDismissedLevelUp] = useState(false);
  const setPage = useCallback((p: GamePage) => setActivePage(p), []);

  // Auto-release from prison when 15 seconds have passed
  useEffect(() => {
    if (!player || !player.inPrison) return;
    const check = async () => {
      try { await releaseFromPrison({}); } catch {}
    };
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [player?.inPrison]);

  const isRegistered = (player?.nickname && player?.registeredAt) || player?.username || registered;

  if (player === undefined) return <LoadingPage />;
  if (!player || !isRegistered) return <PlayerRegistration onRegistered={() => setRegistered(true)} />;
  if (player.isDead) return <DeathPage />;

const renderPage = (): React.ReactNode => {
    // If in prison, only allow prison page and headquarters
    const inPrison = (player as any).inPrison ?? false;
    if (inPrison && activePage !== "headquarters" && activePage !== "prison" && activePage !== "messages" && activePage !== "inbox" && activePage !== "notifications_page" && activePage !== "my_profile" && activePage !== "updates" && activePage !== "faq" && activePage !== "support" && activePage !== "statistics" && activePage !== "online_list") {
      return <PrisonBlocked />;
    }
    switch (activePage) {
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <BankPage />;
      case "hospital": return <HospitalPage />;
      case "points": return <PointsShopPage />;
      case "my_profile": return <MyProfilePage />;
      case "updates": return <GameUpdatesPage />;
      case "crimes": return <CrimesOverviewPage />;
      case "legendary_crimes": return <LegendaryCrimePage />;
      case "boss_fights": return <BossFightsPage />;
      case "crime_empire": return <CrimeEmpirePage />;
      case "heist_planning": return <HeistPlanningPage />;
      case "world_events": return <WorldEventsPage />;
      case "criminal_pets": return <CriminalPetsPage />;
      case "prison": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Lock className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Prison</h2></div><PrisonTimeDisplay /></div>;
      case "airport": return <AirportPage />;
      case "wanted_status": return <WantedStatusPage />;
      case "organized_crime": return <OrganizedCrimePage />;
      case "missions": return <MissionsPage />;
      case "daily_login": return <DailyLoginPage />;
      case "bodyguards": return <BodyguardsPage />;
      case "secret_challenges": return <SecretChallengesPage />;
      case "boosts": return <BoostsPage />;
      case "crime_spree": return <CrimeSpreePage />;
      case "steal_from_house": return <StealFromHousePage />;
      case "gta_car_theft": return <GtaCarTheftPage />;
      case "fight_club": return <FightClubPage />;
      case "bounty_board": return <BountyBoardPage />;
      case "duels": return <DuelsPage />;
      case "kill": return <KillPage />;
      case "spar": return <SparPage />;
      case "tournament": return <TournamentPage />;
      case "death_match": return <DeathMatchPage />;
      case "season_rankings": return <SeasonRankingsPage />;
      case "combat_log": return <CombatLogPage />;
      case "fighting_styles": return <FightingStylesPage />;
      case "armor": return <ArmorPage />;
      case "gambling_dice": return <CasinoPage type="dice" />;
      case "gambling_lotto": return <LottoPage />;
      case "gambling_blackjack": return <BlackjackPage />;
      case "gambling_coin": return <CasinoPage type="coin" />;
      case "gambling_horse": return <CasinoPage type="horse" />;
      case "gambling_number": return <CasinoPage type="number" />;
      case "roulette": return <RoulettePage />;
      case "slots": return <SlotsPage />;
      case "russian_roulette": return <RussianRoulettePage />;
      case "underground": return <UndergroundPage />;
      case "counterfeiting": return <CounterfeitingPage />;
      case "drug_trafficking": return <DrugTraffickingPage />;
      case "arson": return <ArsonPage />;
      case "identity_theft": return <IdentityTheftPage />;
      case "arms_dealing": return <ArmsDealPage />;
      case "witness_intimidation": return <WitnessPage />;
      case "tax_evasion": return <TaxEvasionPage />;
      case "racketeering": return <RacketeeringPage />;
      case "gambling_dens": return <GamblingDenPage />;
      case "loan_sharking": return <LoanSharkPage />;
      case "cargo_theft": return <CargoTheftPage />;
      case "dog_fighting": return <DogFightPage />;
      case "street_racing": return <StreetRacingPage />;
      case "smuggling_routes": return <SmugglingPage />;
      case "stock_market": return <StockMarketPage2 />;
      case "real_estate": return <RealEstatePage2 />;
      case "businesses": return <BusinessesPage2 />;
      case "auction_house": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Package className="size-7 text-primary" /><h2 className="text-2xl font-bold">Auction House</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Bid on rare items!</div></div>;
      case "insurance": return <InsurancePage />;
      case "loans": return <LoansPage />;
      case "crypto": return <CryptoPage />;
      case "lottery": return <LottoPage />;
      case "garage": return <GaragePage />;
      case "items": return <MyItemsPage />;
      case "safe_houses": return <SafeHousesPage />;
      case "wanted_board": return <WantedBoardPage />;
      case "black_market": return <BlackMarketPage />;
      case "mystery_boxes": return <MysteryBoxesPage />;
      case "legendary_items": return <LegendaryItemsPage />;
      case "family": return <FamilyPage />;
      case "crew_system": return <CrewPage />;
      case "company": return <CompanyPage />;
      case "gifting": return <GiftingPage />;
      case "crime_fame": return <CrimeFamePage />;
      case "reputation": return <ReputationPage />;
      case "cartel": return <CartelPage />;
      case "messages": case "inbox": return <MessagesPage />;
      case "notifications_page": return <NotificationsPage />;
      case "forum_general": case "forum_sales": case "forum_offtopic": case "forum_shadows": return <ForumPage type={activePage} />;
      case "forum_search": return <ForumSearchPage />;
      case "city_overview": return <CityOverviewPage />;
      case "statistics": return <StatisticsPage />;
      case "world_map": return <WorldMapPage />;
      case "colosseum": return <ColosseumPage />;
      case "weather": return <WeatherPage />;
      case "news_ticker": return <NewsTickerPage />;
      case "skill_tree": return <SkillTreePage />;
      case "achievements": return <AchievementsPage />;
      case "titles": return <TitlesPage />;
      case "legacy": return <LegacyPage />;
      case "prestige": return <PrestigePage />;
      case "leaderboards": return <LeaderboardsPage />;
      case "time_machine": return <TimeMachinePage />;
      case "season_pass": return <SeasonPassPage />;
      case "crime_mastery": return <MasteryPage />;
      case "ghost_mode": return <GhostModePage />;
      case "crime_tv": return <CrimeTVPage />;
      case "daily_challenges": return <DailyChallengesPage />;
      case "raids": return <RaidsPage />;
      case "arena": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Swords className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Arena</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">1v1, 2v2, and free-for-all arenas!</div></div>;
      case "legacy_board": return <LegacyBoardPage />;
      case "faq": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><HelpCircle className="size-7 text-primary" /><h2 className="text-2xl font-bold">FAQ</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Frequently asked questions!</div></div>;
      case "support": return <SupportPage />;
      case "admin_panel": return <AdminPanel />;
      case "become_admin": return <BecomeAdminPage />;
      case "online_list": return <OnlinePlayersPage />;
      case "send_money": return <SendMoneyPage />;
      case "marriage": return <MarriagePage />;
      case "family_tree": return <FamilyTreePage />;
      case "personality": return <PersonalityPage />;
      case "dead_switch": return <DeadSwitchPage />;
      case "ai_gangs": return <AIGangsPage />;
      case "informants": return <InformantsPage />;
      case "districts": return <DistrictsPage />;
      case "corruption": return <CorruptionPage />;
      case "ransomware": return <RansomwarePage />;
      case "crafting": return <CraftingPage />;
      case "auctions": return <AuctionsPage />;
      case "time_capsules": return <TimeCapsulesPage />;
      case "crime_photos": return <CrimePhotosPage />;
      case "purge": return <PurgePage />;
      case "headlines": return <HeadlinesPage />;
      case "radio": return <RadioPage />;
      case "cockroach": return <CockroachPage />;
      case "advanced_features": return <AdvancedFeaturesPage />;
      default: return <HeadquartersPage />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <LeftSidebar activePage={activePage} setPage={setPage} showProfilePopup={showProfilePopup} setShowProfilePopup={setShowProfilePopup} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-border flex items-center justify-between px-5 bg-card/30 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-foreground/80">{pageNames[activePage] ?? activePage}</div>
            <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-border pl-3">
              <button onClick={() => setPage("crimes")} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${activePage === "crimes" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} title="Street Crimes">\uD83D\uDD25 Streets</button>
              <button onClick={() => setPage("steal_from_house")} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${activePage === "steal_from_house" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} title="Steal From House">\uD83D\uDCB5 Houses</button>
              <button onClick={() => setPage("gta_car_theft")} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${activePage === "gta_car_theft" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} title="GTA Car Theft">\uD83D\uDE97 Cars</button>
              <button onClick={() => setPage("kill")} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${activePage === "kill" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} title="Kill">\uD83D\uDC51 Kill</button>
              <button onClick={() => setPage("prison")} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${activePage === "prison" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} title="Prison">\uD83D\uDD10 Prison</button>
              <button onClick={() => setPage("hospital")} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${activePage === "hospital" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} title="Hospital">\uD83C\uDFE5 Hospital</button>
            </div>
            {(player.wantedLevel ?? 0) > 0 && <span className="px-2 py-0.5 bg-red-950/50 border border-red-800/50 rounded-full text-[10px] text-red-400 font-bold">{"\uD83D\uDD34"} {player.wantedLevel ?? 0} Wanted</span>}
            {(player.wantedLevel ?? 0) >= 2 && <span className="px-2 py-0.5 bg-orange-950/50 border border-orange-800/50 rounded-full text-[10px] text-orange-400 font-bold animate-pulse">{"\uD83D\uDD75\uFE0F"} FBI</span>}
            {(player.wantedLevel ?? 0) >= 4 && <span className="px-2 py-0.5 bg-red-950/50 border border-red-800/50 rounded-full text-[10px] text-red-300 font-bold animate-pulse">{"\uD83C\uDF96\uFE0F"} MILITARY</span>}
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <EventStatusBar player={player} />
              {renderPage()}
            </div>
      </main>
      {showProfilePopup && player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowProfilePopup(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center"><User className="size-6 text-primary" /></div>
                <div><div className="font-bold text-lg">{player.nickname || "Unknown"}</div><div className="text-[10px] text-muted-foreground">{player.username || "No username"} - {player.playerClass || "N/A"}</div></div>
              </div>
              <button onClick={() => setShowProfilePopup(false)} className="text-muted-foreground hover:text-foreground text-lg">X</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Level</div><div className="text-primary font-bold">Lv. {player.level || 1}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Class</div><div className="font-bold">{player.playerClass || "N/A"}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Money</div><div className="text-green-400 font-bold">${(player.money || 0).toLocaleString()}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Bank</div><div className="text-blue-400 font-bold">${(player.bank || 0).toLocaleString()}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">ATK/DEF</div><div className="font-bold">{player.attack || 10}/{player.defense || 10}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Life</div><div className="text-red-400 font-bold">{player.life || 100}/{player.maxLife || 100}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Location</div><div className="font-bold">{player.location || "New York"}</div></div>
              <div className="bg-background/50 rounded-lg p-2.5"><div className="text-muted-foreground">Crimes</div><div className="font-bold">{player.totalCrimes || 0}</div></div>
            </div>
            <div className="bg-background/50 rounded-lg p-2.5 text-[10px]"><div className="text-muted-foreground mb-1">Player ID</div><div className="font-mono text-xs break-all select-all">{player._id}</div></div>
            {(player as any).bio && <div className="bg-background/50 rounded-lg p-2.5 text-[10px]"><div className="text-muted-foreground mb-1">Bio</div><div className="text-xs">{(player as any).bio}</div></div>}
          </div>
        </div>
      )}
      {player.levelUpPending && !dismissedLevelUp ? <LevelUpModal player={player as any} onDone={() => setDismissedLevelUp(true)} /> : null}
      <RightPanel setPage={setPage} activePage={activePage} />
    </div>
  );
}

// Simple placeholder pages
function AirportPage() {
  const player = useQuery(api.game.getPlayer);
  const changeLocation = useMutation(api.game.changeLocation);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <LoadingPage />;
  const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Detroit", "Houston", "Phoenix", "Atlanta", "Boston"];
  const travel = async (loc: string) => { setLoading(true); setMsg(""); try { await changeLocation({ location: loc }); setMsg(`Flew to ${loc}!`); } catch (e: any) { setMsg(e.message); } setLoading(false); };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Plane className="size-7 text-cyan-400" /><h2 className="text-2xl font-bold">Airport</h2></div>
      <div className="grid grid-cols-2 gap-3">{cities.filter(c => c !== player.location).map(c => (<div key={c} className="mafia-card rounded-xl p-4 flex items-center justify-between"><div className="font-bold text-sm">{c}</div><button onClick={() => travel(c)} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-500 disabled:opacity-40">Fly</button></div>))}</div>
      {msg && <div className="text-sm text-primary">{msg}</div>}
    </div>
  );
}

function PlayerRegistration({ onRegistered }: { onRegistered: () => void }) {
  const register = useMutation(api.game.registerPlayer);
  const [nickname, setNickname] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const classes = [
    { id: "hitter", name: "Hitter", icon: "\uD83E\uDD4A", desc: "High attack power.", attack: 18, defense: 6, life: 80, money: 800 },
    { id: "thief", name: "Thief", icon: "\uD83D\uDD75\uFE0F", desc: "Balanced stats.", attack: 10, defense: 8, life: 90, money: 1500 },
    { id: "enforcer", name: "Enforcer", icon: "\uD83D\uDEE1\uFE0F", desc: "High defense.", attack: 12, defense: 16, life: 120, money: 700 },
    { id: "hustler", name: "Hustler", icon: "\uD83D\uDCB0", desc: "Most starting cash.", attack: 8, defense: 10, life: 90, money: 2500 },
  ];
  const doRegister = async () => { setLoading(true); setError(""); try { await register({ nickname, playerClass: selectedClass! as any }); onRegistered(); } catch (e: any) { setError(e.message); } setLoading(false); };
  if (step === 1) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center"><h1 className="text-3xl font-bold mb-2">Choose Your Identity</h1><p className="text-muted-foreground text-sm">Pick a street name.</p></div>
        <div className="mafia-card rounded-xl p-6 space-y-4">
          <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Street name..." maxLength={20} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg" />
          {error && <div className="text-destructive text-sm">{error}</div>}
          <button onClick={() => nickname.length >= 3 && setStep(2)} disabled={nickname.length < 3} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-40">Choose Class</button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center"><h1 className="text-3xl font-bold mb-1">Welcome, <span className="text-primary">{nickname}</span></h1></div>
        <div className="grid grid-cols-2 gap-4">{classes.map(c => (<button key={c.id} onClick={() => setSelectedClass(c.id)} className={`text-left p-5 rounded-xl border-2 transition-all ${selectedClass === c.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}><div className="text-3xl mb-2">{c.icon}</div><div className="font-bold text-lg mb-1">{c.name}</div><p className="text-xs text-muted-foreground">{c.desc}</p></button>))}</div>
        <div className="flex gap-3"><button onClick={() => setStep(1)} className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border">Back</button><button onClick={doRegister} disabled={!selectedClass || loading} className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-40">{loading ? "Entering..." : "Enter the Streets"}</button></div>
        {error && <div className="text-destructive text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}

function DeathPage() {
  const respawn = useMutation(api.game.respawn);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const doRespawn = async () => { setLoading(true); try { setResult(await respawn()); } catch (e: any) { alert(e.message); } setLoading(false); };
  if (result) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center space-y-4"><div className="text-6xl">{"\uD83D\uDC80"}</div><h1 className="text-3xl font-bold">Respawned</h1><p className="text-muted-foreground">You kept ${result.keptMoney.toLocaleString()}</p></div></div>;
  return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center space-y-4"><div className="text-6xl">{"\uD83D\uDC80"}</div><h1 className="text-4xl font-bold text-destructive">YOU DIED</h1><button onClick={doRespawn} disabled={loading} className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50">Respawn</button></div></div>;
}

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
    { title: "\u2B50 Legendary Crimes", icon: Flame, page: "legendary_crimes" },
    { title: "\uD83D\uDC80 Boss Fights", icon: Skull, page: "boss_fights" },
    { title: "\uD83D\uDDFA\uFE0F Crime Empire", icon: Map, page: "crime_empire" },
    { title: "\uD83C\uDFAF Heist Planning", icon: Target, page: "heist_planning" },
    { title: "\uD83C\uDF10 World Events", icon: Zap, page: "world_events" },
    { title: "\uD83D\uDC3E Criminal Pets", icon: Users, page: "criminal_pets" },
    { title: "\uD83D\uDD10 Prison", icon: Lock, page: "prison" },
    { title: "\u2708\uFE0F Airport", icon: Plane, page: "airport" },
    { title: "\uD83C\uDFDB\uFE0F Law Enforcement", icon: Shield, page: "wanted_status" },
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
    { title: "\u2694\uFE0F Duels", icon: Swords, page: "duels" },
    { title: "\uD83D\uDC51 Kill", icon: Skull, page: "kill" },
    { title: "\uD83E\uDD3F Spar", icon: Heart, page: "spar" },
    { title: "\uD83C\uDFC6 Tournament", icon: Trophy, page: "tournament" },
    { title: "\u2620\uFE0F Death Match", icon: Skull, page: "death_match" },
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
    { title: "\uD83D\uDCB4 Loan Sharking", icon: DollarSign, page: "loan_sharking" },
    { title: "\uD83D\uDCE6 Cargo Theft", icon: Package, page: "cargo_theft" },
    { title: "\uD83C\uDFAD Dog Fighting", icon: Skull, page: "dog_fighting" },
    { title: "\uD83C\uDFCE\uFE0F Street Racing", icon: Gauge, page: "street_racing" },
    { title: "\uD83D\uDEAA Smuggling Routes", icon: Anchor, page: "smuggling_routes" },
  ]},
  { title: "\uD83D\uDCC8 Economy", icon: DollarSign, children: [
    { title: "\uD83D\uDCC9 Stock Market", icon: BarChart3, page: "stock_market" },
    { title: "\uD83C\uDFE0 Real Estate", icon: Home, page: "real_estate" },
    { title: "\uD83C\uDFEA Businesses", icon: Briefcase, page: "businesses" },
    { title: "\uD83D\uDCE6 Auction House", icon: Package, page: "auction_house" },
    { title: "\uD83D\uDEE1\uFE0F Insurance", icon: Shield, page: "insurance" },
    { title: "\uD83D\uDCB3 Loans", icon: Landmark, page: "loans" },
    { title: "\u2728 Crypto", icon: Gem, page: "crypto" },
    { title: "\uD83C\uDFB7 Lottery", icon: Sparkles, page: "lottery" },
  ]},
  { title: "\uD83D\uDCE6 Assets", icon: Package, children: [
    { title: "\uD83D\uDE97 Garage", icon: Car, page: "garage" },
    { title: "\uD83C\uDF92 My Items", icon: Package, page: "items" },
    { title: "\uD83C\uDFDB\uFE0F Safe Houses", icon: Home, page: "safe_houses" },
    { title: "\uD83D\uDD10 Wanted Board", icon: Target, page: "wanted_board" },
    { title: "\uD83D\uDD2B Black Market", icon: Bomb, page: "black_market" },
    { title: "\uD83C\uDFA8 Mystery Boxes", icon: Sparkles, page: "mystery_boxes" },
    { title: "\uD83C\uDF1F Legendary Items", icon: Gem, page: "legendary_items" },
  ]},
  { title: "\uD83D\uDCCB Social", icon: Users, children: [
    { title: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67 Family", icon: Users, page: "family" },
    { title: "\uD83E\uDD1D Crew System", icon: Users, page: "crew_system" },
    { title: "\uD83D\uDCBC Company", icon: Briefcase, page: "company" },
    { title: "\uD83C\uDF81 Gifting", icon: Heart, page: "gifting" },
    { title: "\uD83C\uDFC6 Crime Fame", icon: Trophy, page: "crime_fame" },
    { title: "\uD83C\uDF0D Reputation", icon: Globe, page: "reputation" },
    { title: "\uD83C\uDFF0 Cartel", icon: Users, page: "cartel" },
  ]},
  { title: "\uD83D\uDCDD Communication", icon: MessageSquare, children: [
    { title: "\uD83D\uDCE8 Messages", icon: MessageSquare, page: "messages" },
    { title: "\uD83D\uDCE5 Inbox", icon: Inbox, page: "inbox" },
    { title: "\uD83D\uDD14 Notifications", icon: Bell, page: "notifications_page" },
    { title: "\uD83D\uDCE1 General Forum", icon: MessageSquare, page: "forum_general" },
    { title: "\uD83D\uDCB0 Sales & Wanted", icon: DollarSign, page: "forum_sales" },
    { title: "\uD83D\uDCAD Off-Topic", icon: MessageSquare, page: "forum_offtopic" },
    { title: "\uD83C\uDF11 Shadows", icon: Moon, page: "forum_shadows" },
    { title: "\uD83D\uDD0D Search Posts", icon: Search, page: "forum_search" },
  ]},
  { title: "\uD83C\uDF0D World", icon: Map, children: [
    { title: "\uD83C\uDFD9\uFE0F City Overview", icon: Map, page: "city_overview" },
    { title: "\uD83D\uDCCA Statistics", icon: BarChart3, page: "statistics" },
    { title: "\uD83D\uDDFA\uFE0F World Map", icon: Map, page: "world_map" },
    { title: "\u26C8\uFE0F Colosseum", icon: Swords, page: "colosseum" },
    { title: "\uD83C\uDF19 Weather", icon: Cloud, page: "weather" },
    { title: "\uD83D\uDCF0 News Ticker", icon: Newspaper, page: "news_ticker" },
  ]},
  { title: "\uD83C\uDFAF Progression", icon: Target, children: [
    { title: "\uD83E\uDDE0 Skill Tree", icon: Zap, page: "skill_tree" },
    { title: "\uD83C\uDFC5 Achievements", icon: Trophy, page: "achievements" },
    { title: "\uD83C\uDFC6 Titles", icon: Crown, page: "titles" },
    { title: "\uD83D\uDCDC Legacy", icon: ScrollText, page: "legacy" },
    { title: "\u2B50 Prestige", icon: Star, page: "prestige" },
    { title: "\uD83C\uDFC6 Leaderboards", icon: Trophy, page: "leaderboards" },
    { title: "\u23F3 Time Machine", icon: Clock, page: "time_machine" },
    { title: "\uD83C\uDFC5 Season Pass", icon: Trophy, page: "season_pass" },
    { title: "\uD83C\uDFC1 Mastery", icon: Target, page: "crime_mastery" },
  ]},
  { title: "\u26D4\uFE0F Special", icon: Skull, children: [
    { title: "\uD83D\uDE08 Ghost Mode", icon: Eye, page: "ghost_mode" },
    { title: "\uD83D\uDCAC Crime TV", icon: Newspaper, page: "crime_tv" },
    { title: "\uD83D\uDCB0 Daily Challenges", icon: Target, page: "daily_challenges" },
    { title: "\uD83C\uDFC6 Raids", icon: Swords, page: "raids" },
    { title: "\uD83C\uDFAD Arena", icon: Swords, page: "arena" },
    { title: "\uD83D\uDCDC Legacy Board", icon: ScrollText, page: "legacy_board" },
  ]},
  { title: "\u2753 Help", icon: HelpCircle, children: [
    { title: "\u2753 FAQ", icon: HelpCircle, page: "faq" },
    { title: "\uD83D\uDEA8 Support", icon: Shield, page: "support" },
  ]},
  { title: "\u2699\uFE0F System", icon: Settings, children: [
    { title: "\u2699\uFE0F Admin Panel", icon: Settings, page: "admin_panel" },
    { title: "\uD83D\uDD11 Become Admin", icon: Shield, page: "become_admin" },
    { title: "\uD83D\uDC65 Online Players", icon: Users, page: "online_list" },
  ]},
];

// ============ INLINE PAGES ============

function HeadquartersPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Building2 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Headquarters</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div><div className="text-[10px] text-muted-foreground">Cash</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div><div className="text-[10px] text-muted-foreground">Bank</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-red-400">{player.life ?? 100}/{player.maxLife ?? 100}</div><div className="text-[10px] text-muted-foreground">Life</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-primary">Lv. {player.level ?? 1}</div><div className="text-[10px] text-muted-foreground">Level</div></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xl font-bold text-red-400">{player.attack ?? 10}</div><div className="text-[10px] text-muted-foreground">ATK</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xl font-bold text-blue-400">{player.defense ?? 10}</div><div className="text-[10px] text-muted-foreground">DEF</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xl font-bold text-yellow-400">{player.totalCrimes ?? 0}</div><div className="text-[10px] text-muted-foreground">Crimes</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xl font-bold text-purple-400">{player.location ?? "New York"}</div><div className="text-[10px] text-muted-foreground">Location</div></div>
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
  if (!player) return <div className="animate-pulse text-muted-foreground text-center py-20">Loading...</div>;
  const doHeal = async () => { setMsg("You are healed!"); };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><ShieldCheck className="size-7 text-green-400" /><h2 className="text-2xl font-bold">Hospital</h2></div>
      <div className="mafia-card rounded-xl p-5 text-center space-y-4">
        <div className="text-4xl">🏥</div>
        <div className="text-sm text-muted-foreground">Your health: {player.life ?? 100}/{player.maxLife ?? 100}</div>
        <button onClick={doHeal} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">Heal ($1000)</button>
        {msg && <div className="text-sm text-green-400">{msg}</div>}
      </div>
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
  const doBecome = async () => { try { await becomeAdmin({ secretKey: key || "admin" }); setMsg("You are now an admin!"); } catch (e: any) { setMsg(e.message); } };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Shield className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Become Admin</h2></div>
      <div className="mafia-card rounded-xl p-5 text-center space-y-4">
        <div className="text-4xl">🛡️</div>
        <div className="text-sm text-muted-foreground">Click below to gain admin privileges.</div>
        <button onClick={doBecome} className="px-6 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500">Get Admin</button>
        {msg && <div className="text-sm text-primary">{msg}</div>}
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

function SkillTreePage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Zap className="size-7 text-primary" /><h2 className="text-2xl font-bold">Skill Tree</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Unlock skills as you level up!</div></div>;
}

function AchievementsPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Trophy className="size-7 text-primary" /><h2 className="text-2xl font-bold">Achievements</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Complete challenges to earn achievements!</div></div>;
}

function TitlesPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Star className="size-7 text-primary" /><h2 className="text-2xl font-bold">Titles</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Earn titles by completing milestones!</div></div>;
}

function PrestigePage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Star className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Prestige</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Reach level 50 to prestige and gain permanent bonuses!</div></div>;
}

function LeaderboardsPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Trophy className="size-7 text-primary" /><h2 className="text-2xl font-bold">Leaderboards</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Top players ranked by level and wealth!</div></div>;
}

function WorldMapPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Map className="size-7 text-primary" /><h2 className="text-2xl font-bold">World Map</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Interactive map showing territories and crime hotspots!</div></div>;
}

function WeatherPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Cloud className="size-7 text-cyan-400" /><h2 className="text-2xl font-bold">Weather</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Dynamic weather affects crime success rates!</div></div>;
}

function NewsTickerPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Newspaper className="size-7 text-primary" /><h2 className="text-2xl font-bold">News</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Live feed of crime events and player activity!</div></div>;
}

function GhostModePage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Eye className="size-7 text-purple-400" /><h2 className="text-2xl font-bold">Ghost Mode</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Become invisible on the map for 1 hour!</div></div>;
}

function CrimeTVPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Newspaper className="size-7 text-primary" /><h2 className="text-2xl font-bold">Crime TV</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Watch live broadcasts of crimes!</div></div>;
}

function DailyChallengesPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Target className="size-7 text-primary" /><h2 className="text-2xl font-bold">Daily Challenges</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Complete daily challenges for bonus rewards!</div></div>;
}

function RaidsPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Swords className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Raids</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Team up for massive raids!</div></div>;
}

function LegacyPageInline() {
  return <LegacyPage />;
}

function LegacyBoardPage() {
  return <LegacyStatsPage />;
}

function TimeMachinePage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Clock className="size-7 text-cyan-400" /><h2 className="text-2xl font-bold">Time Machine</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Replay your greatest heists!</div></div>;
}

function SeasonPassPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Trophy className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Season Pass</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Unlock exclusive rewards each season!</div></div>;
}

function MasteryPage() {
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Target className="size-7 text-primary" /><h2 className="text-2xl font-bold">Crime Mastery</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Master each crime type for bonuses!</div></div>;
}

function CasinoPage({ type }: { type: string }) {
  if (type === "lotto") return <LottoPage />;
  if (type === "blackjack") return <BlackjackPage />;
  return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><CircleDot className="size-7 text-primary" /><h2 className="text-2xl font-bold">{type}</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Coming soon!</div></div>;
}

// ============ MAIN DASHBOARD ============

function Moon() { return <span className="text-purple-400">🌑</span>; }
function Settings() { return <span className="text-muted-foreground">⚙️</span>; }
function Droplet() { return <span className="text-blue-400">💧</span>; }
function Crown() { return <span className="text-yellow-400">👑</span>; }

function LoadingPage() { return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" /></div>; }

function LevelUpModal({ player, onDone }: { player: any; onDone: () => void }) {
  const handle = async () => { onDone(); };
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

function RightPanel({ setPage }: { setPage: (p: GamePage) => void }) {
  const player = useQuery(api.game.getPlayer);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const level = player?.level ?? 1;
  const life = player?.life ?? 100;
  const maxLife = player?.maxLife ?? 100;
  const xpNeeded = level * 100;
  const xp = player?.experience ?? 0;
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);
  const money = player?.money ?? 0;
  return (
    <aside className="w-56 bg-sidebar border-l border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Status</div>
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1"><span className="text-red-300">❤️ Life</span><span className="text-red-400 font-bold">{life}/{maxLife}</span></div>
            <div className="h-4 rounded-full bg-sidebar-accent overflow-hidden border border-red-500/30 animate-glow-pulse">
              <div className="h-full rounded-full animate-life-bar" style={{ width: `${(life / maxLife) * 100}%`, background: "linear-gradient(90deg, #ef4444, #f87171, #ef4444)" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1"><span className="text-yellow-300">⚡ XP</span><span className="text-yellow-400 font-bold">Lv. {level} ({Math.floor(xpPct)}%)</span></div>
            <div className="h-4 rounded-full bg-sidebar-accent overflow-hidden border border-yellow-500/30">
              <div className="h-full rounded-full animate-xp-bar" style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, #eab308, #facc15, #eab308)" }} />
            </div>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-500/30 rounded-lg px-3 py-2 animate-money-glow">
            <span className="text-[11px] font-semibold text-green-300/80">💰 Cash</span>
            <span className="text-[12px] font-bold text-green-300 animate-money-text">${money.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Quick Info</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between"><span className="text-sidebar-foreground/60">Online</span><span className="text-green-400 font-bold">{onlineCount ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-sidebar-foreground/60">Location</span><span className="font-bold">{player?.location ?? "New York"}</span></div>
          <div className="flex justify-between"><span className="text-sidebar-foreground/60">Prestige</span><span className="font-bold text-yellow-400">{player?.prestige ?? 0}</span></div>
        </div>
      </div>
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2">Help</div>
        <button onClick={() => setPage("faq")} className="w-full text-left text-[11px] text-sidebar-foreground/60 hover:text-sidebar-foreground py-1">❓ FAQ</button>
        <button onClick={() => setPage("support")} className="w-full text-left text-[11px] text-sidebar-foreground/60 hover:text-sidebar-foreground py-1">🆘 Support</button>
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

export default function Dashboard() {
  const signOut = () => {};
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const player = useQuery(api.game.getPlayer);
  const [registered, setRegistered] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const setPage = useCallback((p: GamePage) => setActivePage(p), []);

  const isRegistered = (player?.nickname && player?.registeredAt) || player?.username || registered;

  if (player === undefined) return <LoadingPage />;
  if (!player || !isRegistered) return <PlayerRegistration onRegistered={() => setRegistered(true)} />;
  if (player.isDead) return <DeathPage />;

  const renderPage = (): React.ReactNode => {
    switch (activePage) {
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <BankPage />;
      case "hospital": return <HospitalPage />;
      case "points": return <PointsShopPage />;
      case "my_profile": return <MyProfilePage />;
      case "updates": return <div className="animate-fade-in space-y-4"><div className="flex items-center gap-3"><ScrollText className="size-7 text-primary" /><h2 className="text-2xl font-bold">Game Updates</h2></div><div className="mafia-card rounded-xl p-5 text-sm text-muted-foreground">Latest updates and changelog coming soon!</div></div>;
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
      case "crime_spree": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Activity className="size-7 text-orange-400" /><h2 className="text-2xl font-bold">Crime Spree</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Commit consecutive crimes for bonus multipliers!</div></div>;
      case "steal_from_house": return <StealFromHousePage />;
      case "gta_car_theft": return <GtaCarTheftPage />;
      case "fight_club": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Swords className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Fight Club</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Challenge other players to fights!</div></div>;
      case "bounty_board": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Crosshair className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Bounty Board</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Place and claim bounties!</div></div>;
      case "duels": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Swords className="size-7 text-primary" /><h2 className="text-2xl font-bold">Duels</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">1v1 duels with stakes!</div></div>;
      case "kill": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Skull className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Kill</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">High-stakes assassination attempts!</div></div>;
      case "spar": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Heart className="size-7 text-primary" /><h2 className="text-2xl font-bold">Spar</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Practice fights with friends!</div></div>;
      case "tournament": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Trophy className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Tournament</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Compete in tournaments for prizes!</div></div>;
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
      case "underground": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Bomb className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Underground Economy</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Advanced criminal operations!</div></div>;
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
      case "smuggling_routes": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Anchor className="size-7 text-blue-400" /><h2 className="text-2xl font-bold">Smuggling Routes</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Move contraband across borders!</div></div>;
      case "stock_market": return <StockMarketPage2 />;
      case "real_estate": return <RealEstatePage2 />;
      case "businesses": return <BusinessesPage2 />;
      case "auction_house": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Package className="size-7 text-primary" /><h2 className="text-2xl font-bold">Auction House</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Bid on rare items!</div></div>;
      case "insurance": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Shield className="size-7 text-blue-400" /><h2 className="text-2xl font-bold">Insurance</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Protect your cash from robberies!</div></div>;
      case "loans": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Landmark className="size-7 text-primary" /><h2 className="text-2xl font-bold">Loans</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Borrow money from underground banks!</div></div>;
      case "crypto": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Gem className="size-7 text-purple-400" /><h2 className="text-2xl font-bold">Crypto</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Trade in-game cryptocurrency!</div></div>;
      case "lottery": return <LottoPage />;
      case "garage": return <GaragePage />;
      case "items": return <MyItemsPage />;
      case "safe_houses": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Home className="size-7 text-primary" /><h2 className="text-2xl font-bold">Safe Houses</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Buy safe houses to stash your loot!</div></div>;
      case "wanted_board": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Target className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Wanted Board</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Active bounties and targets!</div></div>;
      case "black_market": return <BlackMarketPage />;
      case "mystery_boxes": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Sparkles className="size-7 text-yellow-400" /><h2 className="text-2xl font-bold">Mystery Boxes</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Open mystery boxes for rare items!</div></div>;
      case "legendary_items": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Gem className="size-7 text-amber-400" /><h2 className="text-2xl font-bold">Legendary Items</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">One-of-a-kind items on the server!</div></div>;
      case "family": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">Family</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Create and manage your crime family!</div></div>;
      case "crew_system": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">Crew System</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Form crews with other players!</div></div>;
      case "company": return <CompanyPage />;
      case "gifting": return <GiftingPage />;
      case "crime_fame": return <CrimeFamePage />;
      case "reputation": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Globe className="size-7 text-primary" /><h2 className="text-2xl font-bold">Reputation</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Your criminal reputation across the underworld!</div></div>;
      case "cartel": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Users className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Cartel</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Join or form a criminal cartel!</div></div>;
      case "messages": case "inbox": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">Messages</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Check your inbox!</div></div>;
      case "notifications_page": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Bell className="size-7 text-primary" /><h2 className="text-2xl font-bold">Notifications</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">No new notifications.</div></div>;
      case "forum_general": case "forum_sales": case "forum_offtopic": case "forum_shadows": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">{activePage.replace("forum_", "").replace("_", " ")}</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Forum posts coming soon!</div></div>;
      case "forum_search": return <ForumSearchPage />;
      case "city_overview": return <CityOverviewPage />;
      case "statistics": return <StatisticsPage />;
      case "world_map": return <WorldMapPage />;
      case "colosseum": return <div className="animate-fade-in space-y-6"><div className="flex items-center gap-3"><Swords className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Colosseum</h2></div><div className="mafia-card rounded-xl p-5 text-center text-muted-foreground text-sm">Battle in the arena!</div></div>;
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
            {(player.wantedLevel ?? 0) > 0 && <span className="px-2 py-0.5 bg-red-950/50 border border-red-800/50 rounded-full text-[10px] text-red-400 font-bold">{"\uD83D\uDD34"} {player.wantedLevel ?? 0} Wanted</span>}
            {(player.wantedLevel ?? 0) >= 2 && <span className="px-2 py-0.5 bg-orange-950/50 border border-orange-800/50 rounded-full text-[10px] text-orange-400 font-bold animate-pulse">{"\uD83D\uDD75\uFE0F"} FBI</span>}
            {(player.wantedLevel ?? 0) >= 4 && <span className="px-2 py-0.5 bg-red-950/50 border border-red-800/50 rounded-full text-[10px] text-red-300 font-bold animate-pulse">{"\uD83C\uDF96\uFE0F"} MILITARY</span>}
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">{renderPage()}</div>
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
      {player.levelUpPending ? <LevelUpModal player={player as any} onDone={() => {}} /> : null}
      <RightPanel setPage={setPage} />
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

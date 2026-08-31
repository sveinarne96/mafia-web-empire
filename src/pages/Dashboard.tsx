import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
// signOut available via auth provider
import {
  Home, Building2, Wallet, Heart, Shield, MapPin, AlertTriangle, Skull, Gift,
  Bell, MessageSquare, Inbox, Users, Search, HelpCircle, Settings, Crown,
  Trophy, Flame, Crosshair, EyeOff, Receipt, Banknote, Coins, Truck,
  Bomb, Dog, Car, Flag, Handshake, Brain, GraduationCap, Ruler, Vote,
  Globe, Lock, ArrowUp, ScrollText, Clock, Award, Briefcase, Zap,
  BarChart3, CircleDot, Landmark, Swords, ChevronRight, ChevronDown, ShoppingBag,
  Gem, Target, ShieldCheck, Radio, Newspaper, CloudRain, Snowflake, Sun,
  Wifi, WifiOff, Menu, X, Send, UserPlus, Image, Gamepad2, Swords as SwordsIcon,
  ChevronUp, ExternalLink, Minus, Plus, RotateCcw, Copy, DollarSign,
  Swords as CombatIcon, Target as TargetIcon, Map, Activity, Timer,
  TrendingUp, TrendingDown, Circle, Star, Bookmark, FileText, ArrowLeft,
  UserX, Fingerprint, HardHat, Siren, Building, Wrench, Package,
  Store, ShoppingCart, Pipette, FlaskConical, Factory, Pickaxe,
  HeartPulse, Stethoscope, Pill, Syringe, Bandage, Scan, ShieldAlert,
  FlameKindling, Sparkles, PartyPopper, Cherry, Dice5, Hash, LayoutGrid,
  Music, Mic, Volume2, Eye, Camera, Video, Monitor, Smartphone, Laptop,
  Server, Database, ShieldAlert as ShieldAlertIcon, ShieldCheck as ShieldCheckIcon,
  Gavel, Scale, FileWarning, FileCheck, UserCheck, UserMinus, Ban,
  CheckCircle, XCircle, RefreshCcw, RotateCw, Power, PowerOff,
  MessageCircle, Mail, AtSign, Phone, Globe2, Map as MapIcon, Navigation,
  Compass, Anchor, Ship, Plane, Bus, Bike, Footprints, Milestone,
  Locate, Navigation2, Route, SplitSquareHorizontal, CornerDownRight,
  Pencil, Eraser, Trash2, Save, Upload, Download, Printer,
  PieChart, LineChart, BarChart, AreaChart, ScatterChart, Table,
  Layout, Grid, Columns, Rows, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Strikethrough, Code, Terminal, Braces,
  Key, Fingerprint as FingerprintIcon, Unlock, ShieldOff,
  User, Users2, UserCog, UserPlus2, UserMinus2, UserSearch,
  Crown as CrownIcon, Skull as SkullIcon, Heart as HeartIcon,
  Zap as ZapIcon, Flame as FlameIcon, Star as StarIcon,
  Trophy as TrophyIcon, Award as AwardIcon, Medal,
  Target as TargetIcon2, Crosshair as CrosshairIcon, Focus,
  Radar, Scan as ScanIcon, Radar as RadarIcon,
} from "lucide-react";

// Page components
import { AdminPanel } from "@/components/AdminPanel";
import { MyProfilePage } from "@/components/MyProfile";
import CrimeHub from "@/components/CrimeHub";
import { LiveEventBanner } from "@/components/EventBanner";
import { EventsPage } from "@/components/EventsPage";
import { ALL_GAME_EVENTS } from "@/data/events";
import { OnlineList } from "@/components/OnlineList";
import { PlayerProfilePage } from "@/components/PlayerProfile";
import { BecomeAdminPage } from "@/components/BecomeAdmin";
import { UpdatesPage } from "@/components/UpdatesPage";
import { SeasonPassPage } from "@/components/SeasonPass";
import { LogoDropdown } from "@/components/LogoDropdown";
import { StealFromHousePage, GtaCarTheftPage, BodyguardsPage } from "@/components/GameEnhanced";
import { WantedStatusPage } from "@/components/GameEnhanced";
import {
  CrimesOverviewPage, CrimeCategoryPage, CrimeEmpirePage, HeistPlanningPage,
  WorldEventsPage, BlackMarketPage, CrimeFamePage, LegendaryCrimePage,
  RoulettePage, SlotsPage, RussianRoulettePage, DogFightPage, StreetRacingPage,
  GiftingPage, HitListPage,
} from "@/components/GameFeatures";
import {
  PrisonTimeDisplay, DeathMatchPage, SeasonRankingsPage, LegacyStatsPage,
  ContractsPage, CombatLogPage, FightingStylesPage, ArmorPage,
  StockMarketPage2, CounterfeitingPage, DrugTraffickingPage, ArsonPage,
  IdentityTheftPage, ArmsDealPage, TaxEvasionPage, RacketeeringPage,
  GamblingDenPage, LoanSharkPage,
} from "@/components/GameFeatures";
import {
  PointsShopPage, GaragePage, MyItemsPage, MissionsPage,
  OrganizedCrimePage, CompanyPage, LottoPage, BlackjackPage,
  LegacyPage, ForumSearchPage,
} from "@/components/GamePages";
import { MissionsOverviewPage } from "@/components/MissionPages";
import { GamblingOverviewPage } from "@/components/GamblingPages";
import { CombatOverviewPage } from "@/components/CombatPages";
// HubPages inlined below - no external import needed
import { WitnessSystemPage, ForensicsLabPage, CourtSystemPage } from "@/components/SystemWitness";
import { SpyNetworkPage, InformantPage } from "@/components/SystemPrison";
import { PrisonPage } from "@/components/PrisonPage";
import { PropertyEmpirePage, MarketSystemPage } from "@/components/SystemProperty";
import { FactionWarfarePage, AdvancedCraftingPage } from "@/components/SystemFaction";
import { PetSystemPage, DayNightPage } from "@/components/SystemPetDayNight";
import { VehicleSystemPage, BusinessManagementPage } from "@/components/SystemVehicleBusiness";
import { CoopGameplayPage, PrestigeLegacyPage } from "@/components/SystemPrestigeCoop";

import { AdvancedCombatPage, ReputationInfluencePage } from "@/components/SystemCombatReputation";
import { UnderworldEconomyPage, DynamicWorldEventsPage } from "@/components/SystemUnderworldEvents";
import { CrimeScenePage } from "@/components/SystemCrimeScene";
import { CompaniesHubPage } from "@/components/SystemCompanies";
import { EmpireBuildingPage, RelationshipsPage, SurvivalRealismPage, SecurityDefensePage } from "@/components/SystemEmpire";
import LiveEventCalendar from "@/components/LiveEventCalendar";
import { LiveSupportPage } from "@/components/LiveSupport";
import EventsHubPage from "@/components/EventsHub";

import { FamilyPage } from "@/components/FamilyPage";
import { ResourcesPanel } from "@/components/ResourcesPanel";
import { XPVolumePanel } from "@/components/XPVolumePanel";
import { CrimeSubBar, getCrimeByRoute } from "@/components/CrimeSubPages";
import { StreetCrimesPage } from "@/components/StreetCrimesPage";
import { CriminalOperationsPage } from "@/components/CriminalOperationsPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MurderPage } from "@/components/MurderPage";
import { MessagesPage } from "@/components/MessagesPage";
import { InboxPage } from "@/components/InboxPage";
import { FAQPage } from "@/components/FAQPageComponent";
import { ReferralPage } from "@/components/ReferralPage";
import { EnergyDrinksPage } from "@/components/EnergyDrinksPage";
import { HubP } from "@/components/HubPComponent";
import { StorylinePage } from "@/components/StorylinePage";
import { CommunityPage } from "@/components/CommunityPage";
import { FBIStatusPage } from "@/components/FBIStatusPage";
import {
  SkillTreePage, DailyChallengesPage, SafeHousesPage, CrimeSpreePage,
  WantedBoardPage, SmugglingRoutesPage, CartelPage, ReputationPage,
  PrisonBreakPage, ColosseumPage,
} from "@/components/EpicFeatures";
import {
  PrestigePage, CraftingPage, LeaderboardsPage, WorldMapPage,
  FightClubPage, CryptoPage, WeatherPage, NewsTickerPage,
  LegendaryItemsPage, MysteryBoxesPage, GhostModePage,
} from "@/components/AllFeatures";
import {
  DailyLoginPage, RankedPvpPage,
} from "@/components/NewFeatures";
import { CrewSystemPage } from "@/components/CrewSystemPage";
import {
  TournamentPage, AchievementsPage, TitlesPage,
  StockMarketPage, RealEstatePage, BusinessesPage,
  AuctionHousePage, InsurancePage, LoansPage,
} from "@/components/NewPages";
import { CarDealerPage } from "@/components/CarDealerPage";
import { RIGHT_MENU_SECTIONS } from "@/data/menuSections";
import { ObjectivesPage, PointStorePage, CoinStorePage } from "@/components/StorePages";


// ===== RANK SYSTEM =====
function getRank(level: number): string {
  if (level >= 90) return "Shadow Emperor";
  if (level >= 80) return "Godfather";
  if (level >= 70) return "Don";
  if (level >= 60) return "Underboss";
  if (level >= 50) return "Consigliere";
  if (level >= 40) return "Captain";
  if (level >= 30) return "Soldier";
  if (level >= 20) return "Enforcer";
  if (level >= 10) return "Thug";
  return "Street Rat";
}

function getRankStars(level: number): string {
  const base = level >= 90 ? 8 : level >= 80 ? 4 : level >= 70 ? 4 : level >= 60 ? 4 : level >= 50 ? 4 : level >= 40 ? 4 : level >= 30 ? 4 : level >= 20 ? 4 : level >= 10 ? 4 : 0;
  const withinRank = level % 10;
  const stars = Math.min(4, Math.floor(withinRank / 2.5));
  return "🌟".repeat(stars);
}

function RankBadge({ level, size = "sm" }: { level: number; size?: "sm" | "lg" }) {
  const rank = getRank(level);
  const stars = getRankStars(level);
  const cls = size === "lg" ? "text-lg font-black" : "text-xs font-bold";
  return (
    <span className={`${cls} mafia-gold`}>
      {rank} {stars && <span className="text-[10px]">{stars}</span>}
    </span>
  );
}


type GamePage = string;



// ===== MISSING PAGE STUBS =====
function HeadquartersPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const xpNeeded = 2000;
  const xpPercent = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Home className="size-7 text-primary" /><h2 className="text-2xl font-bold">Headquarters</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl mb-1">💰</div><div className="text-xs text-muted-foreground">Cash</div><div className="text-lg font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl mb-1">🏦</div><div className="text-xs text-muted-foreground">Bank</div><div className="text-lg font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl mb-1">⭐</div><div className="text-xs text-muted-foreground">Level</div><div className="text-lg font-bold text-yellow-400">{player.level ?? 1}</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-2xl mb-1">❤️</div><div className="text-xs text-muted-foreground">Life</div><div className="text-lg font-bold text-red-400">{player.life ?? 0}/{player.maxLife ?? 100}</div></div>
      </div>
      <div className="mafia-card rounded-xl p-4">
        <div className="text-sm font-bold mb-2">Experience</div>
        <div className="w-full h-3 bg-slate-800 rounded-full"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${xpPercent}%` }} /></div>
        <div className="text-xs text-muted-foreground mt-1">{player.experience ?? 0} / {xpNeeded} XP</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">⚔️ ATK</div><div className="text-lg font-bold text-orange-400">{player.attack ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">🛡️ DEF</div><div className="text-lg font-bold text-blue-400">{player.defense ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">🏆 Points</div><div className="text-lg font-bold text-yellow-400">{(player.points ?? 0).toLocaleString()}</div></div>
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
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const handle = async (type: "deposit" | "withdraw") => {
    try { await (type === "deposit" ? deposit : withdraw)({ amount }); setMsg(`${type === "deposit" ? "Deposited" : "Withdrew"} $${amount.toLocaleString()}`); }
    catch (e: any) { setMsg(e.message || "Error"); }
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Landmark className="size-7 text-primary" /><h2 className="text-2xl font-bold">Bank</h2></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground">💵 Cash</div><div className="text-xl font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground">🏦 Bank</div><div className="text-xl font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div></div>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Amount..." />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => handle("deposit")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold">💰 Deposit</button>
          <button onClick={() => handle("withdraw")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">🏧 Withdraw</button>
        </div>
        {msg && <div className="text-xs text-primary">{msg}</div>}
      </div>
    </div>
  );
}

function HospitalPage() {
  const player = useQuery(api.game.getPlayer);
  const healAtHospital = useMutation(api.game.healAtHospital);
  const treatments = [
    { name: "Basic Bandage", price: 100, heal: 20, icon: "🩹" },
    { name: "First Aid Kit", price: 500, heal: 50, icon: "🏥" },
    { name: "Full Treatment", price: 2000, heal: 100, icon: "💊" },
  ];
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><HeartPulse className="size-7 text-primary" /><h2 className="text-2xl font-bold">Hospital</h2></div>
      <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground">❤️ Health</div><div className="text-xl font-bold text-red-400">{player.life ?? 0} / {player.maxLife ?? 100}</div></div>
      <div className="space-y-2">
        {treatments.map(t => (
          <div key={t.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">{t.icon}</span>
            <div className="flex-1"><div className="font-bold">{t.name}</div><div className="text-xs text-green-400">+{t.heal} HP</div></div>
            <button onClick={async () => { try { await healAtHospital({ speed: t.heal > 30 ? "premium" : "standard" }); } catch {} }} disabled={(player.money ?? 0) < t.price || player.life >= player.maxLife}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold disabled:opacity-40">${t.price.toLocaleString()}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPage() {
  const notifications = useQuery(api.game.getNotifications);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Bell className="size-7 text-primary" /><h2 className="text-2xl font-bold">Notifications</h2></div>
      {(!notifications || notifications.length === 0) ? <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm">No notifications</div> : (
        <div className="space-y-2">{notifications.map((n: any) => (
          <div key={n._id} className={`mafia-card rounded-xl p-3 ${!n.read ? "border-yellow-500/30" : ""}`}>
            <div className="text-sm">{n.message}</div>
            <div className="text-[10px] text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function ForumPage({ forum }: { forum: string }) {
  const posts = useQuery(api.game.getForumPosts, { forum });
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">{forum} Forum</h2></div>
      <div className="space-y-2">
        {(!posts || posts.length === 0) ? <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm">No posts yet</div> : (
          posts.map((p: any) => (
            <div key={p._id} className="mafia-card rounded-xl p-3"><div className="text-sm font-bold">{p.title}</div><div className="text-xs text-muted-foreground">{p.body}</div></div>
          ))
        )}
      </div>
    </div>
  );
}

function CityOverviewPage() {
  const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "London", "Tokyo", "Berlin", "Sydney", "Dubai"];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Building2 className="size-7 text-primary" /><h2 className="text-2xl font-bold">City Overview</h2></div>
      <div className="grid grid-cols-2 gap-3">
        {cities.map(city => (
          <div key={city} className="mafia-card rounded-xl p-4 text-center hover:border-primary/30 transition cursor-pointer">
            <div className="text-2xl mb-1">🏙️</div><div className="text-sm font-bold">{city}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatisticsPage() {
  const stats = [
    { label: "Total Players", value: "—" }, { label: "Crimes Committed", value: "—" },
    { label: "Money Earned", value: "—" }, { label: "Fights Won", value: "—" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><BarChart3 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Statistics</h2></div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-lg font-bold text-primary">{s.value}</div></div>
        ))}
      </div>
    </div>
  );
}

function AirportPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [traveling, setTraveling] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  const cities = [
    { name: "Small Town", risk: "Low", color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-400", cost: 500, xp: 10, unlocks: "Level 1" },
    { name: "Suburbia", risk: "Low", color: "from-green-500/20 to-green-600/10", border: "border-green-500/30", text: "text-green-400", cost: 1000, xp: 15, unlocks: "Level 1" },
    { name: "Midwest City", risk: "Low", color: "from-teal-500/20 to-teal-600/10", border: "border-teal-500/30", text: "text-teal-400", cost: 2000, xp: 20, unlocks: "Level 1" },
    { name: "Dallas", risk: "Medium", color: "from-yellow-500/20 to-amber-600/10", border: "border-yellow-500/30", text: "text-yellow-400", cost: 5000, xp: 30, unlocks: "Level 5" },
    { name: "Chicago", risk: "Medium", color: "from-amber-500/20 to-orange-600/10", border: "border-amber-500/30", text: "text-amber-400", cost: 8000, xp: 40, unlocks: "Level 5" },
    { name: "Los Angeles", risk: "Medium", color: "from-orange-500/20 to-red-600/10", border: "border-orange-500/30", text: "text-orange-400", cost: 12000, xp: 50, unlocks: "Level 10" },
    { name: "Miami", risk: "High", color: "from-red-500/20 to-rose-600/10", border: "border-red-500/30", text: "text-red-400", cost: 20000, xp: 75, unlocks: "Level 10" },
    { name: "New York", risk: "High", color: "from-rose-500/20 to-pink-600/10", border: "border-rose-500/30", text: "text-rose-400", cost: 35000, xp: 100, unlocks: "Level 15" },
    { name: "Las Vegas", risk: "High", color: "from-pink-500/20 to-purple-600/10", border: "border-pink-500/30", text: "text-pink-400", cost: 50000, xp: 125, unlocks: "Level 20" },
    { name: "London", risk: "Very High", color: "from-purple-500/20 to-violet-600/10", border: "border-purple-500/30", text: "text-purple-400", cost: 75000, xp: 150, unlocks: "Level 25" },
    { name: "Tokyo", risk: "Very High", color: "from-violet-500/20 to-indigo-600/10", border: "border-violet-500/30", text: "text-violet-400", cost: 100000, xp: 175, unlocks: "Level 30" },
    { name: "Dubai", risk: "Extreme", color: "from-indigo-500/20 to-blue-600/10", border: "border-indigo-500/30", text: "text-indigo-400", cost: 150000, xp: 200, unlocks: "Level 35" },
    { name: "Berlin", risk: "Extreme", color: "from-blue-500/20 to-cyan-600/10", border: "border-blue-500/30", text: "text-blue-400", cost: 200000, xp: 225, unlocks: "Level 40" },
    { name: "Sydney", risk: "Extreme", color: "from-cyan-500/20 to-sky-600/10", border: "border-cyan-500/30", text: "text-cyan-400", cost: 250000, xp: 250, unlocks: "Level 45" },
    { name: "Shanghai", risk: "Extreme", color: "from-sky-500/20 to-blue-700/10", border: "border-sky-500/30", text: "text-sky-400", cost: 300000, xp: 275, unlocks: "Level 50" },
    { name: "Mogadishu", risk: "Death Row", color: "from-gray-500/20 to-red-900/10", border: "border-gray-500/30", text: "text-gray-300", cost: 500000, xp: 500, unlocks: "Level 75" },
  ];

  const riskColors: Record<string, string> = {
    "Low": "bg-emerald-500/20 text-emerald-400",
    "Medium": "bg-yellow-500/20 text-yellow-400",
    "High": "bg-red-500/20 text-red-400",
    "Very High": "bg-purple-500/20 text-purple-400",
    "Extreme": "bg-indigo-500/20 text-indigo-400",
    "Death Row": "bg-gray-500/20 text-gray-300",
  };

  const handleTravel = (city: string) => {
    setTraveling(true);
    setDestination(city);
    setTimeout(() => {
      setTraveling(false);
      setSelectedCity(city);
    }, 2000);
  };

  if (traveling) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-64 space-y-6">
        <div className="relative">
          <div className="text-6xl animate-bounce">✈️</div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/30 rounded-full blur-sm animate-pulse" />
        </div>
        <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">Flying to {destination}...</div>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (selectedCity) {
    const city = cities.find(c => c.name === selectedCity)!;
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedCity(null)} className="px-3 py-1 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition">← Back</button>
          <div className="flex-1"><h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{selectedCity}</h2></div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColors[city.risk]}`}>{city.risk} Risk</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Travel Cost</div><div className="text-lg font-bold text-yellow-400">${city.cost.toLocaleString()}</div></div>
          <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">XP Reward</div><div className="text-lg font-bold text-purple-400">+{city.xp} XP</div></div>
          <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">Risk Level</div><div className="text-lg font-bold text-red-400">{city.risk}</div></div>
        </div>
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold mb-2">🏙️ City Overview</div>
            <div className="text-xs text-muted-foreground">{selectedCity} is a {city.risk.toLowerCase()} risk destination with crime opportunities ranging from petty theft to organized crime. Higher risk means higher rewards but more chance of getting caught.</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="mafia-card rounded-xl p-3 text-center hover:border-primary/30 transition cursor-pointer"><div className="text-lg">🔪</div><div className="text-xs font-bold">Street Crime</div><div className="text-[10px] text-muted-foreground">+{Math.floor(city.xp * 0.5)} XP</div></div>
            <div className="mafia-card rounded-xl p-3 text-center hover:border-primary/30 transition cursor-pointer"><div className="text-lg">💰</div><div className="text-xs font-bold">Robbery</div><div className="text-[10px] text-muted-foreground">+{Math.floor(city.xp * 0.8)} XP</div></div>
            <div className="mafia-card rounded-xl p-3 text-center hover:border-primary/30 transition cursor-pointer"><div className="text-lg">🏠</div><div className="text-xs font-bold">Burglary</div><div className="text-[10px] text-muted-foreground">+{Math.floor(city.xp * 0.6)} XP</div></div>
            <div className="mafia-card rounded-xl p-3 text-center hover:border-primary/30 transition cursor-pointer"><div className="text-lg">🕵️</div><div className="text-xs font-bold">Organized Crime</div><div className="text-[10px] text-muted-foreground">+{Math.floor(city.xp * 1.2)} XP</div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Plane className="size-7 text-cyan-400" /><h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Airport</h2></div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Select a destination:</span>
        <span className="text-xs text-cyan-400">Click to travel to a city</span>
      </div>
      <div className="space-y-2">
        {cities.map((city, i) => (
          <div key={city.name} onClick={() => handleTravel(city.name)} className={`bg-gradient-to-r ${city.color} border ${city.border} rounded-xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-all cursor-pointer group`}>
            <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
            <div className="flex-1">
              <div className="font-bold">{city.name}</div>
              <div className="text-[10px] text-muted-foreground">{city.unlocks} · {city.xp} XP</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskColors[city.risk]}`}>{city.risk}</span>
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-400">${city.cost.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FamilyChatPage() { return <GenericStub title="Family Chat" icon="👨‍👩‍👦" />; }
function SecretChallengesPage() { return <GenericStub title="Secret Challenges" icon="🔮" />; }

function CrewRanksPage() {
  const ranks = [{ name: "Initiate", icon: "⭐", req: 0 }, { name: "Soldier", icon: "⚔️", req: 100 }, { name: "Lieutenant", icon: "🎖️", req: 500 }, { name: "Captain", icon: "👑", req: 1000 }, { name: "Boss", icon: "🏆", req: 5000 }];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Crown className="size-7 text-primary" /><h2 className="text-2xl font-bold">Crew Ranks</h2></div>
      <div className="space-y-2">
        {ranks.map(r => (
          <div key={r.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">{r.icon}</span>
            <div className="flex-1"><div className="font-bold">{r.name}</div><div className="text-xs text-muted-foreground">Req: {r.req} rep</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrewBankPage() { return <GenericStub title="Crew Bank" icon="🏦" />; }
function CrewWarPage() { return <GenericStub title="Crew War" icon="⚔️" />; }
function CrewTerritoryPage() { return <GenericStub title="Crew Territory" icon="📍" />; }
function CrewLeaderboardPage() { return <LeaderboardPage title="Crew Leaderboard" icon="🏆" />; }
function CrewChallengesPage() { return <GenericStub title="Crew Challenges" icon="🎯" />; }
function CrewAlliancePage() { return <GenericStub title="Crew Alliance" icon="🤝" />; }

function InterestRatesPage() { return <GenericStub title="Interest Rates" icon="📈" />; }
function CreditScorePage() { return <GenericStub title="Credit Score" icon="💳" />; }
function HealthInsurancePage() { return <GenericStub title="Health Insurance" icon="🏥" />; }
function LifeInsurancePage() { return <GenericStub title="Life Insurance" icon="❤️" />; }
function AutoShopPage() { return <GenericStub title="Auto Shop" icon="🚗" />; }
function OffshorePage() { return <GenericStub title="Offshore Accounts" icon="🏝️" />; }

export default function Dashboard() {
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const player = useQuery(api.game.getPlayer);
  const [registered, setRegistered] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [dismissedAtLevel, setDismissedAtLevel] = useState<number | null>(null);
  const setPage = useCallback((p: GamePage) => { setActivePage(p); setMobileMenuOpen(false); }, []);
  const { t } = useTranslation();
  const isRegistered = (player?.nickname && player?.registeredAt) || player?.username || registered;
  const acknowledgeLevelUp = useMutation(api.game.acknowledgeLevelUp);
  const releaseFromPrison = useMutation(api.game.releaseFromPrison);
  const heartbeat = useMutation(api.admin.heartbeat);
  const [leftExpanded, setLeftExpanded] = useState<string[]>([]);
  const [rightExpanded, setRightExpanded] = useState<string[]>(["Communication","Forums","Chat","Quick Info","Help & Events","System"]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftSearch, setLeftSearch] = useState("");
  const [showRight, setShowRight] = useState(true);
  const [activeEvents, setActiveEvents] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("activeEventIds") || "[]"); } catch { return []; } });
  // Rank progression is always measured against the fixed 2,000 XP threshold.
  // Clamp display values so legacy records such as 1,620/700 cannot overflow the bar.
  const xpNeeded = 2000;

  useEffect(() => {
    if (!player?.inPrison || !player?.lastCrimeAt) return;
    const check = () => { const sentenceMs = (player as any).prisonTime ?? 15000; if (Date.now() - player.lastCrimeAt! >= sentenceMs) releaseFromPrison({}).catch(() => {}); };
    check(); const iv = setInterval(check, 1000); return () => clearInterval(iv);
  }, [player?.inPrison, player?.lastCrimeAt]);

  useEffect(() => { heartbeat().catch(() => {}); const iv = setInterval(() => heartbeat().catch(() => {}), 30000); return () => clearInterval(iv); }, []);

  useEffect(() => {
    const refresh = () => { try { setActiveEvents(JSON.parse(localStorage.getItem("activeEventIds") || "[]")); } catch {} };
    window.addEventListener("eventsChanged", refresh); window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 5000);
    return () => { window.removeEventListener("eventsChanged", refresh); window.removeEventListener("storage", refresh); clearInterval(interval); };
  }, []);

  const xpPercent = Math.min(100, ((player?.experience ?? 0) / xpNeeded) * 100);

  // Registration
  if (!isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl">🎮</div>
            <h1 className="text-2xl font-black">Welcome to Shadow Empire</h1>
            <p className="text-sm text-muted-foreground">Create your criminal identity</p>
          </div>
          <RegisterPlayer onComplete={() => setRegistered(true)} />
        </div>
      </div>
    );
  }

  const getLeftMenuSections = () => [
    { title: "Overview", icon: Home, items: [
      { label: "Headquarters", page: "headquarters", icon: "🏠" },
      { label: "Bank Account", page: "bank", icon: "🏦" },
      { label: "Points Shop", page: "points", icon: "🏆" },
      { label: "Hospital", page: "hospital", icon: "🏥" },
    ]},
    { title: "Crime", icon: Skull, items: [
      { label: "Crimes Hub", page: "crimes", icon: "🔪" },
      { label: "Car Theft", page: "car_theft", icon: "🚗" },
      { label: "Burglarize", page: "steal_house", icon: "🏠" },
      { label: "Organized Crime", page: "organized_crime", icon: "🕵️" },
      { label: "Missions", page: "missions", icon: "📋" },
      { label: "Murder", page: "murder", icon: "💀" },
      { label: "Garage", page: "garage", icon: "🚗" },
      { label: "Items", page: "my_items", icon: "🎒" },
    ]},
    { title: "Economy", icon: Wallet, items: [
      { label: "Stock Market", page: "stock_market", icon: "📈" },
      { label: "Interest Rates", page: "interest_rates", icon: "💰" },
      { label: "Credit Score", page: "credit_score", icon: "💳" },
      { label: "Health Insurance", page: "health_insurance", icon: "🏥" },
      { label: "Life Insurance", page: "life_insurance", icon: "❤️" },
      { label: "Crypto Mining", page: "crypto_mining", icon: "⛏️" },
      { label: "Crypto Trading", page: "crypto", icon: "📊" },
      { label: "Auto Shop", page: "auto_shop", icon: "🚗" },
      { label: "Offshore Accounts", page: "offshore", icon: "🏝️" },
      { label: "Daily Spin", page: "daily_spin", icon: "🎰" },
      { label: "Referral", page: "referral", icon: "🔗" },
      { label: "Crafting", page: "crafting", icon: "🔧" },
    ]},
    { title: "Assets", icon: Package, items: [
      { label: "Garage", page: "garage", icon: "🚗" },
      { label: "My Items", page: "my_items", icon: "🎒" },
      { label: "Black Market", page: "black_market", icon: "🖤" },
      { label: "Bodyguards", page: "bodyguards", icon: "🛡️" },
    ]},
    { title: "Combat", icon: Swords, items: [
      { label: "Arena", page: "arena", icon: "🏟️" },
      { label: "Fight Club", page: "fight_club", icon: "🥊" },
    ]},
    { title: "Social", icon: Users, items: [
      { label: "Crew System", page: "crew_system", icon: "🤝" },
      { label: "Crew Ranks", page: "crew_ranks", icon: "📊" },
      { label: "Crew Bank", page: "crew_bank", icon: "🏦" },
      { label: "Crew War", page: "crew_war", icon: "⚔️" },
      { label: "Crew Territory", page: "crew_territory", icon: "📍" },
      { label: "Crew Leaderboard", page: "crew_leaderboard", icon: "🏆" },
      { label: "Family", page: "family", icon: "👨‍👩‍👦" },
      { label: "Crew Challenges", page: "crew_challenges", icon: "🎯" },
      { label: "Crew Alliance", page: "crew_alliance", icon: "🤝" },
      { label: "Crew Safe House", page: "crew_safehouse", icon: "🏠" },
      { label: "Crew Chat", page: "crew_chat", icon: "💬" },
      { label: "Family Chat", page: "family_chat", icon: "👨‍👩‍👦" },
    ]},
    { title: "Progression", icon: Brain, items: [
      { label: "Prestige", page: "prestige", icon: "⭐" },
      { label: "Skill Tree", page: "skill_tree", icon: "🧠" },
      { label: "Titles", page: "titles", icon: "👑" },
      { label: "Achievements", page: "achievements", icon: "🏅" },
      { label: "Leaderboards", page: "leaderboards", icon: "📊" },
      { label: "Season Pass", page: "season_pass", icon: "🎫" },
      { label: "Daily Challenges", page: "daily_challenges", icon: "📋" },
      { label: "Energy Drinks", page: "energy_drinks", icon: "🥤" },
    ]},
    { title: "Special", icon: Shield, items: [
      { label: "Ghost Mode", page: "ghost_mode", icon: "👻" },
      { label: "Secret Challenges", page: "secret_challenges", icon: "🔮" },
      { label: "Reputation", page: "reputation", icon: "🌍" },
      { label: "Wanted Status", page: "wanted_status", icon: "🔴" },
      { label: "Prison", page: "prison", icon: "🔒" },
    ]},
    { title: "Companies", icon: Building2, items: [
      { label: "Company Empire", page: "companies_hub", icon: "🏢" },
    ]},
    { title: "Underworld", icon: EyeOff, items: [
      { label: "Witness System", page: "witness_system", icon: "🔍" },
      { label: "Forensics Lab", page: "forensics_lab", icon: "🔬" },
      { label: "Court System", page: "court_system", icon: "⚖️" },
      { label: "Crime Scene", page: "crime_scene", icon: "🔎" },
      { label: "Spy Network", page: "spy_network", icon: "🕵️" },
      { label: "Informants", page: "informants", icon: "🐀" },
    ]},
    { title: "Empire Systems", icon: Crown, items: [
      { label: "Empire Building", page: "empire_building", icon: "🏗️" },
      { label: "Empire Building", page: "empire_building", icon: "🏗️" },
      { label: "Relationships", page: "relationships", icon: "🤝" },
      { label: "Survival & Realism", page: "survival", icon: "💀" },
      { label: "Security & Defense", page: "security", icon: "🛡️" },
    ]},
    { title: "Power", icon: Zap, items: [
      { label: "Faction Warfare", page: "faction_warfare", icon: "⚔️" },
      { label: "Advanced Combat", page: "advanced_combat", icon: "🥊" },
      { label: "Advanced Crafting", page: "advanced_crafting", icon: "🔨" },
      { label: "Pet Companions", page: "pets", icon: "🐾" },
    ]},
    { title: "World", icon: Globe, items: [
      { label: "Day/Night Cycle", page: "day_night", icon: "🌙" },
      { label: "World Events", page: "world_events", icon: "🌍" },
      { label: "Co-op Raids", page: "coop_gameplay", icon: "🤝" },
      { label: "Neighborhoods", page: "neighborhoods", icon: "🏘️" },
      { label: "Dynamic Events", page: "dynamic_events", icon: "⚡" },
    ]},
    { title: "Live Events", icon: Clock, items: [
      { label: "Event Calendar", page: "event_calendar", icon: "📅" },
    ]},
    { title: "Stores & Goals", icon: ShoppingBag, items: [
      { label: "Game Objectives", page: "objectives", icon: "🎯" },
      { label: "Point Store", page: "point_store", icon: "💎" },
      { label: "Coin Store", page: "coin_store", icon: "🪙" },
    ]},
    { title: "My Profile", icon: User, items: [
      { label: "My Profile", page: "my_profile", icon: "👤" },
    ]},
  ];

  const getRightMenuSections = () => RIGHT_MENU_SECTIONS;

  const renderPage = () => {
    switch (activePage) {
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <BankPage />;
      case "hospital": return <HospitalPage />;
      case "points": return <PointsShopPage />;
      case "crimes": return <CrimesOverviewPage />;
      case "crime_street": return <CriminalOperationsPage category="street" />;
      case "crime_robbery": return <CriminalOperationsPage category="robbery" />;
      case "crime_fraud": return <CriminalOperationsPage category="fraud" />;
      case "crime_burglary": return <CriminalOperationsPage category="burglary" />;
      case "crime_drugs": return <CriminalOperationsPage category="drugs" />;
      case "crime_organized": return <CriminalOperationsPage category="organized" />;
      case "crime_underground": return <CriminalOperationsPage category="underground" />;

      case "car_theft": return <CarDealerPage />;
      case "objectives": return <ObjectivesPage />;
      case "point_store": return <PointStorePage />;
      case "coin_store": return <CoinStorePage />;
      case "steal_house": return <CriminalOperationsPage category="steal_house" />;
      case "organized_crime": return <OrganizedCrimePage />;
      case "missions": return <MissionsOverviewPage />;
      case "murder": return <CriminalOperationsPage category="murder" />;
      case "stock_market": return <StockMarketPage />;
      case "interest_rates": return <InterestRatesPage />;
      case "credit_score": return <CreditScorePage />;
      case "health_insurance": return <HealthInsurancePage />;
      case "life_insurance": return <LifeInsurancePage />;
      case "crypto_mining": return <CryptoPage />;
      case "crypto": return <CryptoPage />;
      case "auto_shop": return <AutoShopPage />;
      case "offshore": return <OffshorePage />;
      case "daily_spin": return <GamblingOverviewPage />;
      case "referral": return <ReferralPage />;
      case "crafting": return <CraftingPage />;
      case "garage": return <GaragePage />;
      case "my_items": return <MyItemsPage />;
      case "black_market": return <BlackMarketPage />;
      case "bodyguards": return <BodyguardsPage />;
      case "arena": return <CombatOverviewPage />;
      case "fight_club": return <FightClubPage />;
      case "crew_system": return <CrewSystemPage />;
      case "crew_ranks": return <CrewRanksPage />;
      case "crew_bank": return <CrewBankPage />;
      case "crew_war": return <CrewWarPage />;
      case "crew_territory": return <CrewTerritoryPage />;
      case "crew_leaderboard": return <CrewLeaderboardPage />;
      case "family": return <FamilyPage />;
      case "crew_challenges": return <CrewChallengesPage />;
      case "crew_alliance": return <CrewAlliancePage />;
      case "crew_safehouse": return <GenericStub title="Crew Safe House" icon="🏠" />;
      case "prestige": return <PrestigeLegacyPage />;
      case "skill_tree": return <SkillTreePage />;
      case "titles": return <TitlesPage />;
      case "achievements": return <AchievementsPage />;
      case "leaderboards": return <LeaderboardsPage />;
      case "season_pass": return <SeasonPassPage />;
      case "daily_challenges": return <DailyChallengesPage />;
      case "energy_drinks": return <EnergyDrinksPage />;
      case "ghost_mode": return <GhostModePage />;
      case "secret_challenges": return <SecretChallengesPage />;
      case "reputation": return <ReputationPage />;
      case "wanted_status": return <WantedStatusPage />;
      case "prison": return <PrisonPage />;
      case "companies_hub": return <CompaniesHubPage />;
      case "witness_system": return <WitnessSystemPage />;
      case "forensics_lab": return <ForensicsLabPage />;
      case "court_system": return <CourtSystemPage />;
      case "crime_scene": return <CrimeScenePage />;
      case "spy_network": return <SpyNetworkPage />;
      case "informants": return <InformantPage />;
      case "empire_building": return <EmpireBuildingPage player={player} />;
      case "relationships": return <RelationshipsPage player={player} />;
      case "survival": return <SurvivalRealismPage player={player} />;
      case "security": return <SecurityDefensePage player={player} />;
      case "faction_warfare": return <FactionWarfarePage />;
      case "advanced_combat": return <AdvancedCombatPage />;
      case "advanced_crafting": return <AdvancedCraftingPage />;
      case "pets": return <PetSystemPage />;
      case "day_night": return <DayNightPage />;
      case "world_events": return <DynamicWorldEventsPage />;
      case "coop_gameplay": return <CoopGameplayPage />;
      case "neighborhoods": return <GenericStub title="Neighborhoods" icon="🏘️" />;
      case "dynamic_events": return <GenericStub title="Dynamic Events" icon="⚡" />;
      case "event_calendar": return <LiveEventCalendar />;
      case "messages": return <MessagesPage />;
      case "inbox": return <InboxPage />;
      case "notifications_page": return <NotificationsPage />;
      case "forum_general": return <ForumPage forum="general" />;
      case "forum_sales": return <ForumPage forum="sales" />;
      case "forum_offtopic": return <ForumPage forum="offtopic" />;
      case "forum_shadows": return <ForumPage forum="shadows" />;
      case "forum_search": return <ForumSearchPage />;
      case "crew_chat": return <GenericStub title="Crew Chat" icon="💬" />;
      case "family_chat": return <FamilyChatPage />;
      case "global_chat": return <GenericStub title="Global Chat" icon="🌐" />;
      case "trade_chat": return <GenericStub title="Trade Chat" icon="💹" />;
      case "lfg": return <GenericStub title="Looking for Group" icon="👥" />;
      case "airport": return <AirportPage />;
      case "weather": return <WeatherPage />;
      case "news_ticker": return <NewsTickerPage />;
      case "city_map": return <GenericStub title="City Map" icon="🗺️" />;
      case "city_overview": return <CityOverviewPage />;
      case "statistics": return <StatisticsPage />;
      case "world_map": return <WorldMapPage />;
      case "faq": return <FAQPage />;
      case "support": return <LiveSupportPage />;
      case "events_hub": return <EventsHubPage />;
      case "community": return <CommunityPage />;
      case "reports": return <GenericStub title="Reports" icon="📢" />;
      case "admin_panel": return <AdminPanel />;
      case "become_admin": return <BecomeAdminPage />;
      case "online_players": return <OnlineList />;
      case "poker_texas": return <PokerTexasPage />;
      case "craps": return <CrapsPage />;
      case "blackjack": return <BlackjackPage />;
      case "lotto": return <LottoPage />;
      case "coin_flip": return <CoinFlipPage />;
      case "crime_hub": return <CrimeHub />;
      case "my_profile": return <MyProfilePage />;
      case "duel": return <GenericStub title="1v1 Duel" icon="⚔️" />;
      case "ctf": return <GenericStub title="Capture the Flag" icon="🚩" />;
      case "koth": return <GenericStub title="King of the Hill" icon="👑" />;
      case "battle_royale": return <GenericStub title="Battle Royale" icon="🎯" />;
      case "ladder": return <GenericStub title="Ladder" icon="📊" />;
      case "champion": return <GenericStub title="Champion" icon="🏆" />;
      case "ambush": return <GenericStub title="Ambush" icon="🔥" />;
      case "counterfeiting": return <GenericStub title="Counterfeiting" icon="💵" />;
      case "drug_trafficking": return <GenericStub title="Drug Trafficking" icon="💊" />;
      case "arson": return <GenericStub title="Arson" icon="🔥" />;
      case "identity_theft": return <GenericStub title="Identity Theft" icon="🪪" />;
      case "arms_deal": return <GenericStub title="Arms Dealing" icon="🔫" />;
      case "tax_evasion": return <GenericStub title="Tax Evasion" icon="📋" />;
      case "racketeering": return <GenericStub title="Racketeering" icon="💰" />;
      default:
        return <GenericStub title="Crime" icon="🔪" />;
    }
  };

  const inPrison = player?.inPrison;
  const igCoins = (player as any)?.coins ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
        <aside className={`${mobileMenuOpen ? "fixed inset-0 z-50 bg-black/50" : "hidden"} md:block md:relative md:w-64 shrink-0 border-r border-amber-500/10 overflow-y-auto`} style={{ background: 'linear-gradient(180deg, oklch(0.06 0.015 35), oklch(0.05 0.01 40))' }}>
          <nav className="pb-20">
            {getLeftMenuSections().filter(section => !leftSearch || section.title.toLowerCase().includes(leftSearch.toLowerCase()) || section.items.some(item => (item.label || "").toLowerCase().includes(leftSearch.toLowerCase()))).map(section => (
              <div key={section.title}>
                <button onClick={() => setLeftExpanded(prev => prev.includes(section.title) ? prev.filter(s => s !== section.title) : [...prev, section.title])}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-300 hover:bg-amber-500/5 transition-all duration-300 group">
                  <section.icon className="size-3.5 group-hover:animate-float" />
                  <span className="flex-1 text-left group-hover:animate-color-cycle">{section.title}</span>
                  {leftExpanded.includes(section.title) ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                </button>
                {leftExpanded.includes(section.title) && (
                  <div className="pl-4 space-y-0.5 pb-1">
                    {section.items.map(item => (
                      <button key={item.page} onClick={() => { setPage(item.page); setMobileMenuOpen(false); }}
                        className={`w-full px-3 py-1.5 flex items-center gap-2 text-xs rounded-lg transition-all ${
                          activePage === item.page ? "bg-primary/20 text-primary font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                        }`}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* ═══ TOP BAR — CENTERED ═══ */}
          
      <div className="border-b border-amber-500/20 animate-gradient" style={{ background: 'linear-gradient(135deg, oklch(0.07 0.02 30), oklch(0.09 0.03 45), oklch(0.07 0.02 30), oklch(0.10 0.025 55))' }}>
        {/* Animated glow line at top */}
        <div className="h-[1px] w-full relative overflow-hidden" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,200,50,0.3), rgba(255,100,50,0.3), rgba(200,150,255,0.2), transparent)' }}>
          <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent 30%, rgba(255,220,80,0.5) 50%, transparent 70%)' }} />
        </div>
        {/* Row 1: Player Stats — Centered */}
        <div className="flex items-center justify-center px-4 py-2 gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-amber-300"><span className="animate-float" style={{ animationDelay: '1.1s' }}>🪙</span> {igCoins}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black animate-neon-glow" style={{ color: '#ffd700' }}>{player?.nickname || player?.username || player?.name || "Player"}</span>
            <RankBadge level={player?.level ?? 1} />
            <span className="text-[10px] text-amber-400/70">Lv.{player?.level ?? 1}</span>
          </div>
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent hidden md:block" />
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-red-400"><span className="animate-float">❤️</span> {player?.life ?? 0}/{player?.maxLife ?? 100}</span>
            <span className="flex items-center gap-1 text-blue-400"><span className="animate-float" style={{ animationDelay: '0.3s' }}>⭐</span> {player?.experience ?? 0}/{xpNeeded}</span>
            <span className="flex items-center gap-1 text-green-400 font-black"><span className="animate-float" style={{ animationDelay: '0.6s' }}>💰</span> ${(player?.money ?? 0).toLocaleString()}</span>
            <span className="flex items-center gap-1 text-yellow-400"><span className="animate-float" style={{ animationDelay: '0.9s' }}>🏆</span> {(player?.points ?? 0).toLocaleString()}</span>
            <span className="flex items-center gap-1 text-orange-400">⚔️ {player?.attack ?? 0}</span>
            <span className="flex items-center gap-1 text-blue-400">🛡️ {player?.defense ?? 0}</span>
            <span className="flex items-center gap-1 text-red-400">💀 {(player as any)?.kills ?? 0}</span>
          </div>
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent hidden md:block" />
          <div className="flex items-center gap-1.5">
            {(player?.wantedLevel ?? 0) > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-[9px] font-bold text-red-400 animate-pulse border border-red-500/30">🔴 WANTED</span>}
            {(player as any)?.xpBoostUntil > Date.now() && <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[9px] font-bold text-cyan-400 border border-cyan-500/30 animate-breathe">⚡ 3x XP</span>}
            {(player as any)?.cashBoostUntil > Date.now() && <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-[9px] font-bold text-green-400 border border-green-500/30 animate-breathe">💰 3x Cash</span>}
            {(player as any)?.energyDrinkUntil > Date.now() && <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-[9px] font-bold text-orange-400 border border-orange-500/30 animate-breathe">🥤 Energy</span>}
            <button onClick={() => setPage("my_profile")} className="ml-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-900/40 to-amber-800/30 border border-amber-600/30 text-[10px] font-bold text-amber-400 hover:from-amber-800/50 hover:to-amber-700/40 hover:text-amber-300 transition-all animate-border-glow relative overflow-hidden">
              👤 Profile
              <div className="absolute inset-0 animate-slide-glow" />
            </button>
          </div>
        </div>
        {/* Row 2: Navigation Tabs — Smooth & Compact */}
        <div className="relative">
          <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto scrollbar-hide" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.15), rgba(15,8,3,0.25), rgba(0,0,0,0.15))' }}>
            {(
              [
                // ═══ CORE ═══
                { icon: "🏠", label: "HQ", page: "headquarters", c: ["amber","217,119,6"], isCrime: false },
                { icon: "🏦", label: "Bank", page: "bank", c: ["green","34,197,94"], isCrime: false },
                // ═══ CRIME CATEGORIES ═══
                { icon: "🔪", label: "Street", page: "crime_street", c: ["emerald","34,197,94"], isCrime: true, count: 20 },
                { icon: "💰", label: "Robbery", page: "crime_robbery", c: ["red","239,68,68"], isCrime: true, count: 30 },
                { icon: "🃏", label: "Fraud", page: "crime_fraud", c: ["yellow","234,179,8"], isCrime: true, count: 14 },
                { icon: "🏠", label: "Burglary", page: "crime_burglary", c: ["orange","249,115,22"], isCrime: true, count: 8 },
                { icon: "💊", label: "Drugs", page: "crime_drugs", c: ["purple","168,85,247"], isCrime: true, count: 12 },
                { icon: "🕵️", label: "Organized", page: "crime_organized", c: ["blue","59,130,246"], isCrime: true, count: 20 },
                { icon: "🕳️", label: "Underground", page: "crime_underground", c: ["slate","148,163,184"], isCrime: true, count: 24 },
                // ═══ ACTIONS ═══
                { icon: "🚗", label: "GTA", page: "car_theft", c: ["red","220,38,38"], isCrime: false },
                { icon: "🏠", label: "Burglarize", page: "steal_house", c: ["rose","225,29,72"], isCrime: false },
                { icon: "🕵️", label: "Org Crime", page: "organized_crime", c: ["purple","147,51,234"], isCrime: false },
                { icon: "💀", label: "Murder", page: "murder", c: ["red","185,28,28"], isCrime: false },
              ] as const
            ).map((tab, idx) => {
              const isActive = activePage === tab.page;
              const [color, rgb] = tab.c;
              return (
                <React.Fragment key={tab.page}>
                  {/* Divider after Bank */}
                  {idx === 1 && <div className="w-px h-4 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent mx-0.5" />}
                  {/* Divider after Underground, before GTA */}
                  {idx === 8 && <div className="w-px h-4 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent mx-0.5" />}
                  <button onClick={() => setPage(tab.page)}
                    className={`relative px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all duration-200 border ${
                      isActive ? `text-${color}-400 border-${color}-500/40 shadow-md shadow-${color}-500/15 scale-[1.03]` : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent"
                    }`}
                    style={isActive ? { background: `linear-gradient(135deg, rgba(${rgb},0.25), rgba(${rgb},0.1))` } : undefined}>
                    {isActive && <div className="absolute inset-0 rounded-lg animate-slide-glow" />}
                    <span className="relative z-10 flex items-center gap-0.5"><span className="text-[11px]">{tab.icon}</span>{tab.label}{tab.isCrime && <span className="text-[7px] opacity-40">{tab.count}</span>}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          {/* Edge fade gradients for smooth scroll hint */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/30 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/30 to-transparent pointer-events-none z-10" />
        </div>
        {/* Crime sub-bar removed */}
        {/* Animated glow line at bottom */}
        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,200,50,0.15), rgba(200,100,255,0.1), rgba(100,200,255,0.1), transparent)' }} />
      </div>

          <div className="p-4 md:p-6 animate-page-enter" key={activePage}>
            <ErrorBoundary>
              {renderPage()}
            </ErrorBoundary>
          </div>
        </main>

        {/* Right Sidebar */}
        {showRight && (
          <aside className="hidden md:block w-64 shrink-0 border-l border-amber-500/10 overflow-y-auto" style={{ background: 'linear-gradient(180deg, oklch(0.06 0.015 35), oklch(0.05 0.01 40))' }}>
            <div className="p-3 space-y-2">
              {/* Player Status */}
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
                <div className="text-xs font-bold text-slate-300">{player?.nickname || player?.username || player?.name || "Player"}</div>
                <div className="text-[10px] text-slate-500"><RankBadge level={player?.level ?? 1} /> Lv.{player?.level ?? 1}</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-500">❤️ Life</span><span className="text-red-400">{player?.life ?? 0}/{player?.maxLife ?? 100}</span></div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${((player?.life ?? 0) / (player?.maxLife ?? 100)) * 100}%` }} /></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-500">⭐ XP</span><span className="text-blue-400">{player?.experience ?? 0}/{xpNeeded}</span></div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${xpPercent}%` }} /></div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                  <div className="bg-slate-800/50 rounded p-1 text-center"><span className="text-green-400 font-bold">${(player?.money ?? 0).toLocaleString()}</span></div>
                  <div className="bg-slate-800/50 rounded p-1 text-center"><span className="text-yellow-400 font-bold">{(player?.points ?? 0).toLocaleString()}</span></div>
                  <div className="bg-slate-800/50 rounded p-1 text-center"><span className="text-blue-400 font-bold">⚔️ {player?.attack ?? 0}</span></div>
                  <div className="bg-slate-800/50 rounded p-1 text-center"><span className="text-green-400 font-bold">🛡️ {player?.defense ?? 0}</span></div>
                </div>
              </div>

              {/* Resources Panel */}
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
                <ResourcesPanel />
              </div>

              {/* XP Volume Panel */}
              <XPVolumePanel />

              {/* Firearms Panel */}
              {(() => {
                try {
                  const permit = JSON.parse(localStorage.getItem("empirePermit") || "0");
                  const armorDur = JSON.parse(localStorage.getItem("empireArmor") || "0");
                  if (permit === 0 && armorDur === 0) return null;
                  const lockpickLv = JSON.parse(localStorage.getItem("empireLockpick") || "0");
                  return (
                    <div className="bg-slate-900/50 rounded-xl p-2 border border-amber-500/20 text-[10px]">
                      <div className="font-bold text-slate-300 mb-1">🔫 Combat</div>
                      <div className="grid grid-cols-2 gap-1">
                        {permit > 0 && <div className="bg-slate-800/30 rounded p-1 text-center"><div className="text-slate-500">Permit</div><div className="text-green-400 font-bold">{["Basic","Advanced","Class III","FFL"][permit-1]}</div></div>}
                        {permit > 0 && <div className="bg-slate-800/30 rounded p-1 text-center"><div className="text-slate-500">Bullets</div><div className="text-orange-400 font-bold">∞</div></div>}
                        {armorDur > 0 && <div className="bg-slate-800/30 rounded p-1 text-center"><div className="text-slate-500">Armor</div><div className={`font-bold ${armorDur > 50 ? "text-green-400" : armorDur > 20 ? "text-yellow-400" : "text-red-400"}`}>{armorDur}%</div></div>}
                        {lockpickLv > 0 && <div className="bg-slate-800/30 rounded p-1 text-center"><div className="text-slate-500">Lockpick</div><div className="text-amber-400 font-bold">Lv.{Math.min(10, lockpickLv)}</div></div>}
                      </div>
                    </div>
                  );
                } catch { return null; }
              })()}

              {/* Right Menu Sections */}
              {getRightMenuSections().map(section => (
                <div key={section.title}>
                  <button onClick={() => setRightExpanded(prev => prev.includes(section.title) ? prev.filter(s => s !== section.title) : [...prev, section.title])}
                    className="w-full px-2 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-all">
                    <section.icon className="size-3" />
                    <span className="flex-1 text-left">{section.title}</span>
                    {rightExpanded.includes(section.title) ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
                  </button>
                  {rightExpanded.includes(section.title) && (
                    <div className="pl-3 space-y-0.5 pb-1">
                      {section.items.map(item => (
                        <button key={item.page} onClick={() => setPage(item.page)}
                          className={`w-full px-2 py-1 flex items-center gap-1.5 text-[10px] rounded transition-all ${
                            activePage === item.page ? "bg-primary/20 text-primary font-bold" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                          }`}>
                          <span>{item.icon}</span><span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ===== ALL STUB PAGES =====

  
// ===== NEW PAGE STUBS =====













// ===== EVENT PAGE STUB =====
function EventPage({ name, icon, desc }: { name: string; icon: string; desc: string }) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">{icon}</span><h2 className="text-2xl font-bold">{name}</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center"><div className="text-4xl mb-3">{icon}</div><div className="text-sm font-bold mb-1">{name}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
    </div>
  );
}

function GenericStub({ title, icon }: { title: string; icon: string }) {
  const player = useQuery(api.game.getPlayer);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">{icon}</span><h2 className="text-2xl font-bold">{title}</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <div className="text-lg font-bold mb-2">{title}</div>
        <div className="text-xs text-muted-foreground mb-4">This feature is part of the Shadow Empire world.</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your Level</div><div className="text-sm font-bold text-primary">{player?.level ?? 1}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your Cash</div><div className="text-sm font-bold text-green-400">${(player?.money ?? 0).toLocaleString()}</div></div>
        </div>
        <div className="mt-4 text-xs text-primary/60">Unlock more features as you level up!</div>
      </div>
    </div>
  );
}

function LeaderboardPage({ title, icon }: { title: string; icon: string }) {
  const players = useQuery(api.admin.getAllPlayers);
  const sorted = [...(players || [])].sort((a: any, b: any) => (b.level || 0) - (a.level || 0)).slice(0, 50);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">{icon}</span><h2 className="text-2xl font-bold">{title}</h2></div>
      <div className="space-y-1">
        {sorted.map((p: any, i: number) => (
          <div key={p._id} className={`mafia-card rounded-lg p-3 flex items-center gap-3 ${i < 3 ? "border-yellow-500/30" : ""}`}>
            <span className={`text-lg font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>#{i + 1}</span>
            <span className="text-sm font-bold flex-1">{p.nickname || p.username || "Unknown"}</span>
            <span className="text-xs text-muted-foreground">Lv.{p.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ===== ALL WORKING PAGES =====

// === GAMBLING PAGES ===
function PokerTexasPage() {
  const player = useQuery(api.game.getPlayer);
  const gamble = useMutation(api.game.gambleDice);
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const play = async (guess: "high" | "low" | "seven") => {
    if ((player?.money ?? 0) < bet) return;
    setLoading(true);
    try { const r = await gamble({ amount: bet, guess }); setResult(r); } catch (e: any) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🂡</span><h2 className="text-2xl font-bold">Poker Texas Hold'em</h2></div>
      <div className="mafia-card rounded-xl p-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Your Money</div>
        <div className="text-xl font-black text-green-400">${(player?.money ?? 0).toLocaleString()}</div>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold">Place Your Bet</div>
        <input type="range" min={100} max={Math.min(100000, player?.money ?? 0)} value={bet} onChange={e => setBet(Number(e.target.value))} className="w-full" />
        <div className="text-center text-sm font-bold text-primary">${bet.toLocaleString()}</div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => play("high")} disabled={loading || (player?.money ?? 0) < bet} className="px-4 py-3 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50">⬆️ HIGH (7+)</button>
          <button onClick={() => play("seven")} disabled={loading || (player?.money ?? 0) < bet} className="px-4 py-3 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 disabled:opacity-50">🎯 SEVEN</button>
          <button onClick={() => play("low")} disabled={loading || (player?.money ?? 0) < bet} className="px-4 py-3 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50">⬇️ LOW (1-6)</button>
        </div>
      </div>
      {result && (
        <div className={`mafia-card rounded-xl p-4 text-center ${result.won ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className={`text-3xl font-black mb-2 ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? "🏆 YOU WIN!" : "💀 YOU LOSE"}</div>
          <div className="text-sm text-muted-foreground">Rolled: {result.roll ?? "?"}</div>
          <div className="text-sm">{result.won ? `+$${(result.amount ?? 0).toLocaleString()}` : `-$${(result.amount ?? 0).toLocaleString()}`}</div>
        </div>
      )}
    </div>
  );
}

function PokerOmahaPage() { return <PokerTexasPage />; }
function CrapsPage() { return <PokerTexasPage />; }
function PowerballPage() { return <PokerTexasPage />; }
function WheelPage() { return <PokerTexasPage />; }
function HorseRacingPage() { return <PokerTexasPage />; }
function ScratchCardsPage() { return <PokerTexasPage />; }
function BingoPage() { return <PokerTexasPage />; }
function KenoPage() { return <PokerTexasPage />; }
function HigherLowerPage() { return <PokerTexasPage />; }
function BJSwitchPage() { return <BlackjackPage />; }

function CoinFlipPage() {
  const player = useQuery(api.game.getPlayer);
  const gamble = useMutation(api.game.gambleCoinToss);
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const play = async (guess: "heads" | "tails") => {
    if ((player?.money ?? 0) < bet) return;
    setLoading(true);
    try { const r = await gamble({ amount: bet, guess }); setResult(r); } catch (e: any) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🪙</span><h2 className="text-2xl font-bold">Coin Flip</h2></div>
      <div className="mafia-card rounded-xl p-4 text-center">
        <div className="text-xs text-muted-foreground">Your Money</div>
        <div className="text-xl font-black text-green-400">${(player?.money ?? 0).toLocaleString()}</div>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input type="range" min={100} max={Math.min(100000, player?.money ?? 0)} value={bet} onChange={e => setBet(Number(e.target.value))} className="w-full" />
        <div className="text-center text-sm font-bold text-primary">${bet.toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => play("heads")} disabled={loading || (player?.money ?? 0) < bet} className="px-6 py-4 bg-yellow-600 text-white rounded-xl text-lg font-black hover:bg-yellow-700 disabled:opacity-50">👑 HEADS</button>
          <button onClick={() => play("tails")} disabled={loading || (player?.money ?? 0) < bet} className="px-6 py-4 bg-purple-600 text-white rounded-xl text-lg font-black hover:bg-purple-700 disabled:opacity-50">🦅 TAILS</button>
        </div>
      </div>
      {result && (
        <div className={`mafia-card rounded-xl p-4 text-center ${result.won ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className={`text-3xl font-black mb-2 ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? "🏆 HEADS/TAILS WINS!" : "💀 WRONG!"}</div>
          <div className="text-sm text-muted-foreground">Result: {result.roll ?? "?"}</div>
        </div>
      )}
    </div>
  );
}

// === ADMIN PAGES (extra) ===


// ===== FULL MURDER PAGE =====

// ===== UNDERGROUND PAGE =====
function UndergroundPage() {
  const items = [
    { name: "Counterfeiting", icon: "💵", page: "counterfeiting", desc: "Print fake bills" },
    { name: "Drug Trafficking", icon: "💊", page: "drug_trafficking", desc: "Move product" },
    { name: "Arson", icon: "🔥", page: "arson", desc: "Burn it down" },
    { name: "Identity Theft", icon: "🪪", page: "identity_theft", desc: "Steal identities" },
    { name: "Arms Dealing", icon: "🔫", page: "arms_deal", desc: "Sell weapons" },
    { name: "Tax Evasion", icon: "📋", page: "tax_evasion", desc: "Dodge the IRS" },
    { name: "Racketeering", icon: "💰", page: "racketeering", desc: "Protection money" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><EyeOff className="size-7 text-primary" /><h2 className="text-2xl font-bold">Underground</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.name} className="mafia-card rounded-xl p-4 hover:border-primary/30 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <div className="text-sm font-bold">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== REGISTER PLAYER =====
function RegisterPlayer({ onComplete }: { onComplete: () => void }) {
  const [nickname, setNickname] = useState("");
  const [playerClass, setPlayerClass] = useState<"hitter" | "thief" | "enforcer" | "hustler">("enforcer");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useMutation(api.game.registerPlayer);

  const handle = async () => {
    if (!nickname.trim()) {
      setMsg("Nickname is required"); return;
    }
    setLoading(true);
    try {
      await register({ nickname: nickname.trim(), playerClass });
      onComplete();
    } catch (e: any) { setMsg(e.message || "Registration failed"); }
    setLoading(false);
  };

  return (
    <div className="mafia-card rounded-2xl p-6 space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground">Nickname</label>
        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Your street name..."
          className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground">Class</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: "enforcer" as const, label: "Enforcer", icon: "👊" }, { id: "hustler" as const, label: "Hustler", icon: "💰" }, { id: "thief" as const, label: "Thief", icon: "🪪" }].map(c => (
            <button key={c.id} onClick={() => setPlayerClass(c.id)}
              className={`p-3 rounded-lg text-center text-xs font-bold transition border ${
                playerClass === c.id ? "border-primary bg-primary/20 text-primary" : "border-border hover:border-primary/30"
              }`}>
              <div className="text-xl mb-1">{c.icon}</div>
              <div>{c.label}</div>
            </button>
          ))}
        </div>
      </div>
      {msg && <div className="text-xs text-red-400 text-center">{msg}</div>}
      <button onClick={handle} disabled={loading}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition">
        {loading ? "Creating..." : "🎮 Enter the Underworld"}
      </button>
    </div>
  );
}

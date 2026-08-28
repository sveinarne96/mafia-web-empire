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
import { LiveEventBanner } from "@/components/EventBanner";
import { EventsPage } from "@/components/EventsPage";
import { ALL_GAME_EVENTS } from "@/data/events";
import { OnlineList } from "@/components/OnlineList";
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
  LegacyPage, ForumSearchPage, SupportPage,
} from "@/components/GamePages";
import { MissionsOverviewPage } from "@/components/MissionPages";
import { GamblingOverviewPage } from "@/components/GamblingPages";
import { CombatOverviewPage } from "@/components/CombatPages";
// HubPages inlined below - no external import needed
import { WorkingHub, getHubTabs } from "@/components/WorkingHubPages";
import { WitnessSystemPage, ForensicsLabPage, CourtSystemPage } from "@/components/SystemWitness";
import { SpyNetworkPage, InformantPage } from "@/components/SystemPrison";
import { PropertyEmpirePage, MarketSystemPage } from "@/components/SystemProperty";
import { FactionWarfarePage, AdvancedCraftingPage } from "@/components/SystemFaction";
import { PetSystemPage, DayNightPage } from "@/components/SystemPetDayNight";
import { VehicleSystemPage, BusinessManagementPage } from "@/components/SystemVehicleBusiness";
import { CoopGameplayPage } from "@/components/SystemPrestigeCoop";

import { AdvancedCombatPage, ReputationInfluencePage } from "@/components/SystemCombatReputation";
import { UnderworldEconomyPage, DynamicWorldEventsPage } from "@/components/SystemUnderworldEvents";
import { CrimeScenePage } from "@/components/SystemCrimeScene";
import { CompaniesHubPage } from "@/components/SystemCompanies";
import { EmpireBuildingPage, RelationshipsPage, SurvivalRealismPage, SecurityDefensePage } from "@/components/SystemEmpire";

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
  DailyLoginPage, CrewSystemPage, RankedPvpPage,
} from "@/components/NewFeatures";
import {
  TournamentPage, AchievementsPage, TitlesPage,
  StockMarketPage, RealEstatePage, BusinessesPage,
  AuctionHousePage, InsurancePage, LoansPage,
} from "@/components/NewPages";


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

class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, { hasError: boolean; error: string }>
{
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message || String(error) };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="animate-fade-in space-y-4">
          <div className="mafia-card rounded-xl p-6 text-center space-y-3">
            <div className="text-3xl">⚠️</div>
            <div className="text-sm font-bold text-red-400">Page Error</div>
            <div className="text-xs text-muted-foreground max-h-40 overflow-auto">{this.state.error}</div>
            <button onClick={() => { this.setState({ hasError: false, error: "" }); window.location.reload(); }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SafePage({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

const getLeftMenuSections = (t: (k: string) => string) => [
  { title: "Overview", icon: Home, items: [
    { label: "Headquarters", page: "headquarters", icon: "🏠" },
    { label: t("right.bank"), page: "bank", icon: "🏦" },
    { label: t("right.pointsShop"), page: "points", icon: "🏆" },
    { label: t("right.profile"), page: "profile", icon: "👤" },
    { label: "Game Updates", page: "updates", icon: "📜" },
  ]},
  { title: "Crimes", icon: Flame, items: [
    { label: "All Crimes", page: "crimes", icon: "\u{1f52a}" },
    { label: "Murder", page: "kill", icon: "\u{1f5e1}" },
    { label: "Steal From House", page: "steal_from_house", icon: "\u{1f3e0}" },
    { label: "GTA Car Theft", page: "gta_car_theft", icon: "\u{1f697}" },
  ]},
  { title: "Combat", icon: Swords, items: [
    { label: "Arena", page: "arena", icon: "\u2694\ufe0f" },
  ]},
  { title: "Gambling", icon: Coins, items: [
    { label: "🎰 Casino", page: "gambling_overview", icon: "🃏" },
  ]},
  { title: "Missions", icon: Target, items: [
    { label: "Mission Board", page: "missions", icon: "📋" },
  ]},
  { title: "Economy", icon: Coins, items: [
    { label: "Economy Hub", page: "economy", icon: "💰" },
  ]},
  { title: "Assets", icon: Package, items: [
    { label: "Assets Hub", page: "assets", icon: "📦" },
  ]},
  { title: "Social", icon: Users, items: [
    { label: "Social Hub", page: "social", icon: "🤝" },
  ]},
  { title: t("right.progression"), icon: TrendingUp, items: [
    { label: "Progression Hub", page: "progression", icon: "🧠" },
  ]},
  { title: "Special", icon: Sparkles, items: [
    { label: "Special Hub", page: "special", icon: "👻" },
  ]},
  { title: "Companies", icon: Building2, items: [
    { label: "Company Empire", page: "companies_hub", icon: "🏢" },
  ]},
  { title: "Underworld", icon: Skull, items: [
    { label: "Underworld Hub", page: "underworld_hub", icon: "🔍" },
  ]},
  { title: "Empire", icon: Building2, items: [
    { label: "Empire Hub", page: "empire_hub", icon: "🏗️" },
  ]},
  { title: "Power", icon: Swords, items: [
    { label: "Power Hub", page: "power_hub", icon: "⚔️" },
  ]},
  { title: "World", icon: Globe, items: [
    { label: "World Hub", page: "world_hub", icon: "🌍" },
  ]},
  { title: "Empire Building", icon: Building2, items: [
    { label: "Empire Hub", page: "empire_building", icon: "🏗️" },
  ]},
  { title: "Relationships", icon: Users, items: [
    { label: "Relationships Hub", page: "relationships", icon: "🤝" },
  ]},
  { title: "Survival", icon: Skull, items: [
    { label: "Survival Hub", page: "survival", icon: "💀" },
  ]},
  { title: "Security", icon: Shield, items: [
    { label: "Security Hub", page: "security", icon: "🛡️" },
  ]},
];

const getRightMenuSections = (t: (k: string) => string) => [
  { title: t("right.communication"), icon: MessageSquare, items: [
    { label: "Direct Messages", page: "messages", icon: "📩" },
    { label: "Inbox", page: "inbox", icon: "📥" },
    { label: "Notifications", page: "notifications_page", icon: "🔔" },
  ]},
  { title: "Forums", icon: MessageSquare, items: [
    { label: "Forums Hub", page: "forums", icon: "📢" },
  ]},
  { title: "Chat", icon: MessageSquare, items: [
    { label: "Chats Hub", page: "chats", icon: "💬" },
  ]},
  { title: t("right.quickInfo"), icon: Globe, items: [
    { label: "Quick Info Hub", page: "quickinfo", icon: "🗺️" },
  ]},
  { title: "Seasonal Events", icon: Flame, items: [
    { label: "Events Hub", page: "seasonal", icon: "🎆" },
  ]},
  { title: "Server Events", icon: Zap, items: [
    { label: "Events Hub", page: "server_events", icon: "⚡" },
  ]},
  { title: "Help", icon: HelpCircle, items: [
    { label: "Help Hub", page: "help", icon: "❓" },
  ]},
  { title: t("right.system"), icon: Settings, items: [
    { label: t("right.admin"), page: "admin_panel", icon: "⚙️" },
    { label: "Become Admin", page: "become_admin", icon: "🔑" },
    { label: "Online Players", page: "online_players", icon: "👥" },
  ]},
];

// ===== MINIMAL PAGE STUBS =====
function HeadquartersPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const xpNeeded = (player.level ?? 1) * 100;
  const xpPercent = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Home className="size-7 text-primary" />
        <h2 className="text-2xl font-bold">Headquarters</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xs text-muted-foreground">Cash</div>
          <div className="text-lg font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🏦</div>
          <div className="text-xs text-muted-foreground">Bank</div>
          <div className="text-lg font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">❤️</div>
          <div className="text-xs text-muted-foreground">Life</div>
          <div className="text-lg font-bold text-red-400">{player.life}/{player.maxLife}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-xs text-muted-foreground">Level</div>
          <div className="text-sm"><RankBadge level={player.level ?? 1} size="lg" /></div>
          <div className="text-xs text-muted-foreground">Level {player.level}</div>
        </div>
      </div>
      <div className="mafia-card rounded-xl p-4">
        <div className="text-xs text-muted-foreground mb-1">XP Progress</div>
        <div className="w-full h-4 bg-[oklch(0.14_0.012_35)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full transition-all"
            style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">{player.experience ?? 0}/{xpNeeded} XP</div>
      </div>
      <LiveEventBanner />
    </div>
  );
}

function BankPage() {
  const player = useQuery(api.game.getPlayer);
  const deposit = useMutation(api.game.deposit);
  const withdraw = useMutation(api.game.withdraw);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const handle = async (type: "deposit" | "withdraw") => {
    const n = parseInt(amount); if (isNaN(n) || n <= 0) return;
    try {
      if (type === "deposit") await deposit({ amount: n }); else await withdraw({ amount: n });
      setMsg(`${type === "deposit" ? "Deposited" : "Withdrawn"} $${n.toLocaleString()}`);
      setAmount("");
    } catch (e: any) { setMsg(e.message || "Error"); }
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Building2 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Bank</h2></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground">Cash</div><div className="text-xl font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-4 text-center"><div className="text-xs text-muted-foreground">Bank</div><div className="text-xl font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div></div>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount..." className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <button onClick={() => handle("deposit")} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Deposit</button>
          <button onClick={() => handle("withdraw")} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Withdraw</button>
        </div>
        {msg && <div className="text-xs text-primary text-center">{msg}</div>}
      </div>
    </div>
  );
}

function HospitalPage() {
  const player = useQuery(api.game.getPlayer);
  const heal = useMutation(api.game.healAtHospital);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const treatments = [
    { name: "Basic Bandage", icon: "🩹", hp: 25, price: 10000 },
    { name: "Standard Treatment", icon: "💊", hp: 50, price: 50000 },
    { name: "IV Drip Therapy", icon: "💉", hp: 75, price: 150000 },
    { name: "Emergency Surgery", icon: "🏥", hp: 100, price: 500000 },
    { name: "Blood Transfusion", icon: "🩸", hp: 100, price: 750000 },
    { name: "Stem Cell Regen", icon: "🧬", hp: 100, price: 1000000 },
    { name: "Nanobot Repair", icon: "🤖", hp: 100, price: 2000000 },
    { name: "Clone Restoration", icon: "🧫", hp: 100, price: 3500000 },
    { name: "Adrenaline Shot", icon: "⚡", hp: 50, price: 200000 },
    { name: "Painkiller Pack", icon: "💊", hp: 30, price: 75000 },
    { name: "Full Reconstruction", icon: "🔬", hp: 150, price: 5000000 },
    { name: "VIP Concierge", icon: "👑", hp: 100, price: 7500000 },
    { name: "Death Revival", icon: "💀", hp: 100, price: 10000000 },
    { name: "Max HP Upgrade", icon: "❤️", hp: 100, price: 15000000 },
    { name: "Premium Package", icon: "💎", hp: 200, price: 75000000 },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><HeartPulse className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Hospital</h2></div>
      <div className="mafia-card rounded-xl p-4 text-center">
        <div className="text-sm text-muted-foreground">Current HP</div>
        <div className="text-3xl font-black text-red-400">{player.life} / {player.maxLife}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {treatments.map(t => (
          <button key={t.name} onClick={async () => {
            try { await heal({ speed: t.price >= 5000000 ? "premium" : "standard" }); } catch (e: any) { alert(e.message); }
          }} disabled={(player.money ?? 0) < t.price || player.life >= player.maxLife}
            className="mafia-card rounded-xl p-4 text-left hover:border-primary/50 transition disabled:opacity-40">
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="text-sm font-bold">{t.name}</div>
            <div className="text-[10px] text-green-400">+{t.hp} HP | ${t.price.toLocaleString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessagesPage() {
  const messages = useQuery(api.game.getMessages);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">Messages</h2></div>
      {(!messages || messages.length === 0) ? <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm">No messages yet</div> : (
        <div className="space-y-2">{messages.map((m: any) => (
          <div key={m._id} className={`mafia-card rounded-xl p-3 ${!m.read ? "border-primary/30" : ""}`}>
            <div className="flex justify-between"><span className="text-sm font-bold">{m.subject}</span><span className="text-[10px] text-muted-foreground">{new Date(m.timestamp).toLocaleDateString()}</span></div>
            <div className="text-xs text-muted-foreground mt-1">{m.body}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function InboxPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Inbox className="size-7 text-primary" /><h2 className="text-2xl font-bold">Inbox</h2></div>
      <MessagesPage />
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
      <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">{forum.replace("general_", "").replace("sales_", "").replace("offtopic_", "").replace("shadows_", "")} Forum</h2></div>
      {(!posts || posts.length === 0) ? <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm">No posts yet</div> : (
        <div className="space-y-2">{posts.map((p: any) => (
          <div key={p._id} className="mafia-card rounded-xl p-3 hover:border-primary/30 transition cursor-pointer">
            <div className="flex justify-between"><span className="text-sm font-bold">{p.title}</span><span className="text-[10px] text-muted-foreground">{p.replies} replies</span></div>
            <div className="text-[10px] text-muted-foreground mt-1">{new Date(p.timestamp).toLocaleDateString()}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function CityOverviewPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><MapPin className="size-7 text-primary" /><h2 className="text-2xl font-bold">City Overview</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "London", "Tokyo", "Berlin", "Sydney", "Dubai"].map(city => (
          <div key={city} className="mafia-card rounded-xl p-4 text-center hover:border-primary/30 transition">
            <div className="text-lg mb-1">🏙️</div>
            <div className="text-sm font-bold">{city}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatisticsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const stats = [
    { label: "Total Crimes", value: player.totalCrimes ?? 0, icon: "🔥" },
    { label: "Total Fights", value: player.totalFights ?? 0, icon: "⚔️" },
    { label: "Total Kills", value: player.totalKills ?? 0, icon: "💀" },
    { label: "Total Deaths", value: player.totalDeaths ?? 0, icon: "☠️" },
    { label: "Highest Level", value: player.highestLevel ?? player.level ?? 1, icon: "👑" },
    { label: "Total Earned", value: `$${(player.totalEarned ?? 0).toLocaleString()}`, icon: "💰" },
    { label: "Reputation", value: player.reputation ?? 0, icon: "🌍" },
    { label: "Prestige", value: player.prestige ?? 0, icon: "⭐" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><BarChart3 className="size-7 text-primary" /><h2 className="text-2xl font-bold">Statistics</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="mafia-card rounded-xl p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-lg font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQPage() {
  const faqs = [
    { q: "How do I earn money?", a: "Complete crimes, sell items in the garage, trade stocks, or work your way up through the economy." },
    { q: "How do I level up?", a: "Gain XP by doing crimes, fighting, gambling, and completing missions. Each level gives +10 ATK, +10 DEF, +75 HP." },
    { q: "What happens when I die?", a: "You have 1 hour to revive at the Hospital. If you don't, your account resets but keeps its data." },
    { q: "How does prison work?", a: "Getting caught committing crimes sends you to prison for 15 seconds. Complete prison jobs while waiting." },
    { q: "What is Prestige?", a: "At level 50, you can prestige to reset your level for permanent bonuses and exclusive rewards." },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><HelpCircle className="size-7 text-primary" /><h2 className="text-2xl font-bold">FAQ</h2></div>
      {faqs.map((f, i) => (
        <div key={i} className="mafia-card rounded-xl p-4">
          <div className="text-sm font-bold mb-1">{f.q}</div>
          <div className="text-xs text-muted-foreground">{f.a}</div>
        </div>
      ))}
    </div>
  );
}

function AdvancedFeaturesPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Sparkles className="size-7 text-primary" /><h2 className="text-2xl font-bold">Advanced Features</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm">Advanced features are available in the main menu categories.</div>
    </div>
  );
}

function AirportPage() {
  const player = useQuery(api.game.getPlayer);
  const changeLocation = useMutation(api.game.changeLocation);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const cities = [
    { name: "New York", icon: "🗽", level: 1, description: "The Big Apple — street crime capital" },
    { name: "Los Angeles", icon: "🌴", level: 5, description: "Sun, sand, and smuggled goods" },
    { name: "Chicago", icon: "🏙️", level: 10, description: "Windy City — organized crime hub" },
    { name: "Miami", icon: "🌊", level: 15, description: "Drug paradise — beachfront deals" },
    { name: "Las Vegas", icon: "🎰", level: 20, description: "Gambling capital of the world" },
    { name: "London", icon: "🇬🇧", level: 25, description: "Old money and new crime" },
    { name: "Tokyo", icon: "🗼", level: 30, description: "Yakuza territory — high tech crime" },
    { name: "Berlin", icon: "🇩🇪", level: 35, description: "Cold war relics and underground markets" },
    { name: "Sydney", icon: "🦘", level: 40, description: "Down under — smuggling paradise" },
    { name: "Dubai", icon: "🏙️", level: 45, description: "Gold city — luxury crime empire" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Plane className="size-7 text-primary" /><h2 className="text-2xl font-bold">Airport</h2></div>
      <div className="mafia-card rounded-xl p-4 text-center">
        <div className="text-xs text-muted-foreground">Current Location</div>
        <div className="text-lg font-bold">{player.location || "New York"}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cities.map(city => (
          <button key={city.name} disabled={(player.level ?? 1) < city.level || player.location === city.name}
            onClick={async () => { try { await changeLocation({ location: city.name }); setMsg(`Traveled to ${city.name}!`); } catch (e: any) { setMsg(e.message); } }}
            className="mafia-card rounded-xl p-4 text-left hover:border-primary/50 transition disabled:opacity-40">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{city.icon}</div>
              <div>
                <div className="text-sm font-bold">{city.name}</div>
                <div className="text-[10px] text-muted-foreground">{city.description}</div>
                <div className="text-[10px] text-yellow-400">Requires Level {city.level}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {msg && <div className="text-xs text-primary text-center">{msg}</div>}
    </div>
  );
}

// ===== MAIN DASHBOARD =====
// === COMBAT PAGES ===
function CrewWarsPage() {
  const player = useQuery(api.game.getPlayer);
  const [fighting, setFighting] = useState(false);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const fight = () => {
    setFighting(true); setMsg("");
    setTimeout(() => {
      const won = Math.random() > 0.4;
      const xp = won ? 150 : 50;
      const cash = won ? Math.floor(Math.random() * 10000 + 2000) : 0;
      setMsg(won ? `🏴 Victory! +$${cash.toLocaleString()} cash + ${xp} XP` : "🏴 Defeated! Your crew needs better strategy.");
      setFighting(false);
    }, 2000);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏴</span><h2 className="text-2xl font-bold">Crew Wars</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">⚔️</div>
        <div className="text-sm text-muted-foreground">Battle rival crews for territory and glory. Crew with higher total ATK wins more.</div>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your ATK</div><div className="text-lg font-bold text-red-400">{(player.attack ?? 0) + 10}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your DEF</div><div className="text-lg font-bold text-blue-400">{(player.defense ?? 0) + 10}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your HP</div><div className="text-lg font-bold text-green-400">{player.health ?? 100}</div></div>
        </div>
        <button onClick={fight} disabled={fighting} className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition disabled:opacity-50">
          {fighting ? "⚔️ Battle in progress..." : "🏴 Find Crew War"}
        </button>
        {msg && <div className="mt-2 text-sm font-bold text-primary">{msg}</div>}
      </div>
    </div>
  );
}
function CTFPage() {
  const player = useQuery(api.game.getPlayer);
  const [captured, setCaptured] = useState(0);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const attempt = () => {
    const success = Math.random() > 0.5;
    if (success) { setCaptured(c => c + 1); setMsg("🚩 Flag captured! +100 XP"); }
    else setMsg("💀 Defended! Enemy caught you.");
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🚩</span><h2 className="text-2xl font-bold">Capture the Flag</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">🚩</div>
        <div className="text-sm text-muted-foreground">Steal the enemy flag and bring it back to your base. 50% success rate.</div>
        <div className="text-3xl font-bold text-yellow-400">Flags Captured: {captured}</div>
        <button onClick={attempt} disabled={!player.health || player.health <= 0} className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-600 text-white font-bold rounded-xl hover:scale-105 transition">
          🚩 Attempt Capture
        </button>
        {msg && <div className="mt-2 text-sm font-bold text-primary">{msg}</div>}
      </div>
    </div>
  );
}
function KOTHPage() {
  const player = useQuery(api.game.getPlayer);
  const [holding, setHolding] = useState(false);
  const [points, setPoints] = useState(0);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const fight = () => {
    const won = Math.random() > 0.55;
    if (won) { setPoints(p => p + 50); setMsg("👑 You hold the hill! +50 points"); setHolding(true); }
    else { setMsg("💀 Knocked off the hill!"); setHolding(false); }
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">👑</span><h2 className="text-2xl font-bold">King of the Hill</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">{holding ? "👑" : "🏔️"}</div>
        <div className="text-sm text-muted-foreground">Fight to hold the hill. Each round earns points while you hold it.</div>
        <div className="text-3xl font-bold text-yellow-400">Points: {points}</div>
        <button onClick={fight} className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold rounded-xl hover:scale-105 transition">
          {holding ? "👑 Defend Hill" : "🏔️ Storm the Hill"}
        </button>
        {msg && <div className="mt-2 text-sm font-bold text-primary">{msg}</div>}
      </div>
    </div>
  );
}
function BattleRoyalePage() {
  const player = useQuery(api.game.getPlayer);
  const [alive, setAlive] = useState(true);
  const [kills, setKills] = useState(0);
  const [players, setPlayers] = useState(50);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const round = () => {
    if (!alive) return;
    const killed = Math.random() > 0.4;
    const died = Math.random() > 0.85;
    if (died) { setAlive(false); setMsg("💀 Eliminated! Better luck next time."); }
    else if (killed) { const k = kills + 1; setKills(k); const p = Math.max(2, players - Math.floor(Math.random() * 3 + 1)); setPlayers(p); setMsg(`🎯 Eliminated an enemy! ${p} remaining. Kill streak: ${k}`); }
    else { setMsg("🔫 Engaged but no elimination. Safe for now."); }
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🎯</span><h2 className="text-2xl font-bold">Battle Royale</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">{alive ? "🎯" : "☠️"}</div>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Status</div><div className={`text-sm font-bold ${alive ? "text-green-400" : "text-red-400"}`}>{alive ? "🟢 ALIVE" : "🔴 DEAD"}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your Kills</div><div className="text-lg font-bold text-orange-400">{kills}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Remaining</div><div className="text-lg font-bold text-yellow-400">{players}</div></div>
        </div>
        <button onClick={alive ? () => { setAlive(true); setKills(0); setPlayers(50); setMsg("🎮 New game! 50 players remaining."); } : round} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold rounded-xl hover:scale-105 transition">
          {alive ? (kills === 0 && players === 50 ? "🎯 Join Match" : "🔫 Next Round") : "🎮 Play Again"}
        </button>
        {msg && <div className="mt-2 text-sm font-bold text-primary">{msg}</div>}
      </div>
    </div>
  );
}
function LadderPage() {
  const player = useQuery(api.game.getPlayer);
  const [rank, setRank] = useState(500);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const fight = () => {
    const won = Math.random() > 0.5;
    if (won) { setRank(r => Math.max(1, r - Math.floor(Math.random() * 10 + 1))); setMsg("📈 Won! Rank improved!"); }
    else { setRank(r => r + Math.floor(Math.random() * 5 + 1)); setMsg("📉 Lost! Rank dropped."); }
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📊</span><h2 className="text-2xl font-bold">Ladder System</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">📊</div>
        <div className="text-4xl font-bold text-yellow-400">#{rank}</div>
        <div className="text-sm text-muted-foreground">Climb the ranks! Win to go up, lose to go down.</div>
        <button onClick={fight} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition">📊 Find Match</button>
        {msg && <div className="mt-2 text-sm font-bold text-primary">{msg}</div>}
      </div>
    </div>
  );
}
function ChampionPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏆</span><h2 className="text-2xl font-bold">Champion Title</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-6xl">🏆</div>
        <div className="text-lg font-bold">Champion of the Underworld</div>
        <div className="text-sm text-muted-foreground">Win 10 consecutive PvP fights to earn the Champion title. Current streak required: 10 wins.</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Your Level</div><div className="text-lg font-bold text-primary">{player.level ?? 1}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">ATK Power</div><div className="text-lg font-bold text-red-400">{(player.attack ?? 0) + 10}</div></div>
        </div>
        <div className="text-xs text-yellow-400">🏆 Requires Level 50+ and 10 consecutive wins</div>
      </div>
    </div>
  );
}
function AmbushPage() {
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const ambush = () => {
    setLoading(true); setMsg("");
    setTimeout(() => {
      const success = Math.random() > 0.5;
      setMsg(success ? "🔥 Ambush successful! Target neutralized. +$5K +200 XP" : "💀 Ambush failed! They saw you coming.");
      setLoading(false);
    }, 1500);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🔥</span><h2 className="text-2xl font-bold">Ambush</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">🔥</div>
        <div className="text-sm text-muted-foreground">Set up an ambush for a rival player. Choose your position and strike when they least expect it.</div>
        <button onClick={ambush} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:scale-105 transition disabled:opacity-50">
          {loading ? "🔥 Setting trap..." : "🔥 Set Ambush"}
        </button>
        {msg && <div className="mt-2 text-sm font-bold text-primary">{msg}</div>}
      </div>
    </div>
  );
}

// === ECONOMY PAGES (real implementations) ===
function InterestRatesPage() {
  const player = useQuery(api.game.getPlayer);
  const [deposited, setDeposited] = useState(0);
  const [msg, setMsg] = useState("");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const rate = 0.05 + (player.level ?? 1) * 0.002;
  const interest = Math.floor(deposited * rate);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📈</span><h2 className="text-2xl font-bold">Interest Rates</h2></div>
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 mafia-card rounded-lg"><div className="text-xs text-muted-foreground">Interest Rate</div><div className="text-xl font-bold text-green-400">{(rate * 100).toFixed(1)}%</div></div>
          <div className="text-center p-4 mafia-card rounded-lg"><div className="text-xs text-muted-foreground">Deposited</div><div className="text-xl font-bold text-blue-400">${deposited.toLocaleString()}</div></div>
          <div className="text-center p-4 mafia-card rounded-lg"><div className="text-xs text-muted-foreground">Daily Interest</div><div className="text-xl font-bold text-yellow-400">+${interest.toLocaleString()}</div></div>
        </div>
        <div className="text-sm text-muted-foreground">Higher level = better interest rates. Earn passive income on your deposits.</div>
      </div>
    </div>
  );
}
function CreditScorePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const score = Math.min(850, 300 + (player.level ?? 1) * 12 + Math.floor(Math.random() * 50));
  const grade = score > 750 ? "A+" : score > 650 ? "A" : score > 550 ? "B" : score > 450 ? "C" : "D";
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💳</span><h2 className="text-2xl font-bold">Credit Score</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-6xl font-bold text-green-400">{score}</div>
        <div className="text-2xl font-bold">Grade: {grade}</div>
        <div className="text-sm text-muted-foreground">Better credit = better loan rates and access to exclusive services.</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Loan Limit</div><div className="text-sm font-bold text-green-400">${(score * 10000).toLocaleString()}</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Interest Rate</div><div className="text-sm font-bold text-yellow-400">{(10 - score / 100).toFixed(1)}%</div></div>
        </div>
      </div>
    </div>
  );
}
function HealthInsurancePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const plans = [
    { name: "Basic Bandage", cost: 10000, heal: 25, icon: "🩹" },
    { name: "Standard Plan", cost: 50000, heal: 50, icon: "💊" },
    { name: "Premium Care", cost: 150000, heal: 75, icon: "💉" },
    { name: "VIP Health", cost: 500000, heal: 100, icon: "🏥" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏥</span><h2 className="text-2xl font-bold">Health Insurance</h2></div>
      <div className="text-sm text-muted-foreground mb-4">Choose a plan. When you take damage, insurance covers healing costs.</div>
      <div className="grid grid-cols-2 gap-3">
        {plans.map(p => (
          <div key={p.name} className="mafia-card rounded-xl p-4 text-center space-y-2">
            <div className="text-3xl">{p.icon}</div>
            <div className="font-bold text-sm">{p.name}</div>
            <div className="text-xs text-green-400">Heals {p.heal}% HP</div>
            <div className="text-xs text-muted-foreground">${p.cost.toLocaleString()}/month</div>
            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Subscribe</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function LifeInsurancePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">❤️</span><h2 className="text-2xl font-bold">Life Insurance</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">❤️</div>
        <div className="text-sm text-muted-foreground">Protect your legacy. If your character dies, life insurance pays out to your crew.</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Payout</div><div className="text-lg font-bold text-green-400">$500K</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Premium</div><div className="text-lg font-bold text-yellow-400">$10K/mo</div></div>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition">❤️ Purchase Plan</button>
      </div>
    </div>
  );
}
function AutoShopPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const mods = [
    { name: "Engine Tuning", icon: "🔧", desc: "+10% speed", cost: 25000 },
    { name: "Armor Plating", icon: "🛡️", desc: "+15% defense", cost: 40000 },
    { name: "Turbo Boost", icon: "💨", desc: "+20% escape rate", cost: 60000 },
    { name: "Nitro System", icon: "🔥", desc: "+25% speed", cost: 85000 },
    { name: "Smoke Screen", icon: "🌫️", desc: "Evade pursuit", cost: 35000 },
    { name: "Bulletproof Glass", icon: "🪟", desc: "+10% HP in car", cost: 50000 },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🚗</span><h2 className="text-2xl font-bold">Auto Shop</h2></div>
      <div className="text-sm text-muted-foreground mb-4">Upgrade your vehicles with performance mods.</div>
      <div className="grid grid-cols-2 gap-3">
        {mods.map(m => (
          <div key={m.name} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2"><span className="text-2xl">{m.icon}</span><div className="font-bold text-sm">{m.name}</div></div>
            <div className="text-xs text-muted-foreground">{m.desc}</div>
            <div className="text-xs text-green-400">${m.cost.toLocaleString()}</div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Install</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function OffshorePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏝️</span><h2 className="text-2xl font-bold">Offshore Accounts</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">🏝️</div>
        <div className="text-sm text-muted-foreground">Hide your money offshore. immune to seizures and taxes. Higher level = more accounts.</div>
        <div className="grid grid-cols-3 gap-3">
          {[{n:"Cayman Islands",f:"🏝️"},{n:"Swiss Vault",f:"🇨🇭"},{n:"Panama Papers",f:"🇵🇦"}].map(a => (
            <div key={a.n} className="mafia-card rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{a.f}</div>
              <div className="text-xs font-bold">{a.n}</div>
              <div className="text-xs text-green-400 mt-1">0% tax</div>
              <button className="mt-2 px-2 py-1 bg-green-600 text-white rounded text-xs">Deposit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ReferralPage() {
  const player = useQuery(api.game.getPlayer);
  const data = useQuery(api.referralSystem.getMyReferral);
  const top = useQuery(api.referralSystem.getTopReferrers);
  const ensureCode = useMutation(api.referralSystem.ensureMyReferralCode);
  const applyCode = useMutation(api.referralSystem.applyReferralCode);
  const claimCommission = useMutation(api.referralSystem.claimReferralCommission);
  const [msg, setMsg] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (player && data && !data.code) ensureCode({}).catch(() => {});
  }, [player, data]);

  if (!player || !data) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading referral network...</div>;

  const now = Date.now();
  const commissionReady = now - data.lastCommissionAt >= 24 * 3600_000;
  const nextClaimIn = Math.max(0, 24 * 3600_000 - (now - data.lastCommissionAt));
  const fmtH = (ms: number) => `${Math.floor(ms / 3600_000)}h ${Math.floor((ms % 3600_000) / 60_000)}m`;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3"><span className="text-3xl">🔗</span><div><h2 className="text-2xl font-bold gold-shimmer-text">Referral Empire</h2><p className="text-[10px] text-muted-foreground">Recruit soldiers · Climb the milestone ladder · Claim daily tribute</p></div></div>
      {msg && <div className="mafia-card rounded-lg p-3 text-sm text-primary animate-fade-in border border-primary/30">{msg}</div>}

      {/* Your code */}
      <div className="mafia-card rounded-xl p-5 border border-primary/30 glow-gold text-center space-y-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your Personal Code</div>
        <button onClick={() => { navigator.clipboard?.writeText(data.code ?? "").then(() => setMsg("📋 Code copied to clipboard!")); }} className="text-2xl font-black font-mono text-primary hover:text-yellow-300 transition-colors tracking-widest animate-pulse-gold">{data.code ?? "..."}</button>
        <div className="text-[10px] text-muted-foreground">Click to copy · Share with friends — they get $500K + 250 pts + 2h XP boost instantly!</div>
      </div>

      {/* Apply a friend's code */}
      {!data.referredBy ? (
        <div className="mafia-card rounded-xl p-4 flex gap-2 items-center">
          <input value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="Enter a friend's code (SHADOW-XXXXXX)"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={async () => { setBusy(true); setMsg(""); try { const r: any = await applyCode({ code: codeInput }); setMsg(r.message); setCodeInput(""); } catch (e: unknown) { setMsg(`❌ ${e instanceof Error ? e.message : "Error"}`); } setBusy(false); }} disabled={busy || !codeInput}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-bold rounded-lg hover:from-green-500 disabled:opacity-50 transition-all shrink-0">Apply Code (+$500K)</button>
        </div>
      ) : <div className="mafia-card rounded-lg p-3 text-xs text-green-400 border border-green-800/30">✅ You were recruited — welcome bonus claimed!</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-lg p-3 text-center"><div className="text-2xl font-bold text-primary">{data.count}</div><div className="text-[10px] text-muted-foreground">👥 Recruits</div></div>
        <div className="mafia-card rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-400 animate-money-text">${data.totalEarned.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">💵 Total Earned</div></div>
        <div className="mafia-card rounded-lg p-3 text-center"><div className="text-2xl font-bold text-yellow-400">${(data.count * 100000).toLocaleString()}</div><div className="text-[10px] text-muted-foreground">🎁 Daily Tribute</div></div>
        <div className="mafia-card rounded-lg p-3 text-center"><button onClick={async () => { setBusy(true); setMsg(""); try { const r: any = await claimCommission({}); setMsg(`💰 Tribute collected: $${r.earned.toLocaleString()} from ${r.recruits} recruits!`); } catch (e: unknown) { setMsg(`❌ ${e instanceof Error ? e.message : "Error"}`); } setBusy(false); }} disabled={busy || !commissionReady || data.count === 0}
          className={`w-full px-2 py-2 text-xs font-bold rounded-lg transition-all ${commissionReady && data.count > 0 ? "bg-gradient-to-r from-yellow-600 to-amber-500 text-white hover:from-yellow-500 animate-pulse-gold" : "bg-secondary text-muted-foreground"}`}>{commissionReady ? "💰 Claim Tribute" : `⏳ ${fmtH(nextClaimIn)}`}</button><div className="text-[10px] text-muted-foreground mt-1">$100K per recruit / day</div></div>
      </div>

      {/* Milestone ladder */}
      <div className="mafia-card rounded-xl p-4 space-y-2">
        <div className="text-sm font-bold text-primary">🏆 Recruitment Milestone Ladder</div>
        <div className="space-y-1.5">{data.allMilestones.map((m: any) => {
          const done = data.count >= m.refs;
          const claimed = data.milestonesClaimed.includes(m.refs);
          return (
            <div key={m.refs} className={`flex items-center justify-between rounded-lg px-3 py-2 border text-xs ${claimed ? "border-green-700/40 bg-green-950/20" : done ? "border-primary/50 bg-primary/5 animate-pulse-gold" : "border-border/50 opacity-60"}`}>
              <div className="flex items-center gap-2"><span>{claimed ? "✅" : done ? "🎉" : "🔒"}</span><span className="font-semibold">{m.refs} recruit{m.refs > 1 ? "s" : ""} — {m.prize}</span></div>
              <div className="text-muted-foreground hidden sm:block">{m.desc}</div>
            </div>
          );
        })}</div>
        {data.nextMilestone && <div className="text-[10px] text-muted-foreground pt-1">Next reward at {data.nextMilestone.refs} recruits — {data.nextMilestone.refs - data.count} to go!</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Your recruits */}
        <div className="mafia-card rounded-xl p-4 space-y-2">
          <div className="text-sm font-bold text-primary">👥 Your Recruits ({data.count})</div>
          {data.recruits.length === 0 ? <div className="text-xs text-muted-foreground py-4 text-center">No recruits yet. Share your code!</div> :
            <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">{data.recruits.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-1.5 text-xs">
                <span className="font-semibold">👤 {r.name}</span><span className="text-muted-foreground">Lv.{r.level}</span>
              </div>
            ))}</div>}
        </div>
        {/* Leaderboard */}
        <div className="mafia-card rounded-xl p-4 space-y-2">
          <div className="text-sm font-bold text-primary">🥇 Top Recruiters Server-Wide</div>
          {(!top || top.length === 0) ? <div className="text-xs text-muted-foreground py-4 text-center">Be the first recruiter!</div> :
            <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">{top.map((u: any) => (
              <div key={u.rank} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${u.rank <= 3 ? "bg-yellow-500/10 border border-yellow-700/30" : "bg-secondary/40"}`}>
                <span className="font-semibold">{u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`} {u.name}</span>
                <span className="text-primary font-bold">{u.count} 👥</span>
              </div>
            ))}</div>}
        </div>
      </div>
    </div>
  );
}

// === SOCIAL/CREW PAGES ===
function CrewRanksPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const ranks = [
    { name: "Recruit", icon: "🔰", req: "Join crew" },
    { name: "Soldier", icon: "⚔️", req: "Level 10" },
    { name: "Lieutenant", icon: "🎖️", req: "Level 25" },
    { name: "Captain", icon: "🏅", req: "Level 40" },
    { name: "Consigliere", icon: "👑", req: "Level 60" },
    { name: "Underboss", icon: "🏆", req: "Level 80" },
    { name: "Boss", icon: "💎", req: "Level 100" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📊</span><h2 className="text-2xl font-bold">Crew Ranks</h2></div>
      <div className="space-y-2">
        {ranks.map(r => (
          <div key={r.name} className={`mafia-card rounded-xl p-4 flex items-center gap-4 ${(player.level ?? 0) >= parseInt(r.req) || r.req === "Join crew" ? "border-green-500/30" : "opacity-50"}`}>
            <span className="text-3xl">{r.icon}</span>
            <div className="flex-1"><div className="font-bold">{r.name}</div><div className="text-xs text-muted-foreground">{r.req}</div></div>
            <div className={`text-xs px-2 py-1 rounded ${(player.level ?? 0) >= parseInt(r.req) || r.req === "Join crew" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}`}>
              {(player.level ?? 0) >= parseInt(r.req) || r.req === "Join crew" ? "✅ Unlocked" : "🔒 Locked"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function CrewChatPage() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<string[]>(["Welcome to Crew Chat!"]);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💬</span><h2 className="text-2xl font-bold">Crew Chat</h2></div>
      <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto space-y-2">
        {messages.map((m, i) => <div key={i} className="text-sm text-muted-foreground">💬 {m}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { if (msg.trim()) { setMessages([...messages, msg]); setMsg(""); } }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Send</button>
      </div>
    </div>
  );
}
function CrewBankPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏦</span><h2 className="text-2xl font-bold">Crew Bank</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">🏦</div>
        <div className="text-3xl font-bold text-green-400">$0</div>
        <div className="text-sm text-muted-foreground">Pool your crew's money for shared operations, war funds, and territory purchases.</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">💰 Deposit</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">💸 Withdraw</button>
        </div>
      </div>
    </div>
  );
}
function CrewSafehousePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const upgrades = [
    { name: "Hidden Stash", cost: 50000, desc: "+50 storage" },
    { name: "Trap System", cost: 100000, desc: "Auto-defense" },
    { name: "Medical Bay", cost: 75000, desc: "Auto-heal" },
    { name: "Comms Room", cost: 60000, desc: "Crew chat boost" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏠</span><h2 className="text-2xl font-bold">Crew Safe House</h2></div>
      <div className="grid grid-cols-2 gap-3">
        {upgrades.map(u => (
          <div key={u.name} className="mafia-card rounded-xl p-4 text-center space-y-2">
            <div className="font-bold text-sm">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.desc}</div>
            <div className="text-xs text-green-400">${u.cost.toLocaleString()}</div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs">Upgrade</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function CrewWarPage() { return <CrewWarsPage />; }
function CrewAlliancePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🤝</span><h2 className="text-2xl font-bold">Crew Alliance</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">🤝</div>
        <div className="text-sm text-muted-foreground">Form alliances with other crews. Share territory income and fight wars together.</div>
        <div className="text-xs text-yellow-400">Requires Level 30+ and Boss rank in crew</div>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition">🤝 Propose Alliance</button>
      </div>
    </div>
  );
}
function CrewTerritoryPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const territories = [
    { name: "Downtown", income: 5000, owner: "None" },
    { name: "Harbor District", income: 8000, owner: "None" },
    { name: "Industrial Zone", income: 12000, owner: "None" },
    { name: "Financial District", income: 20000, owner: "None" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📍</span><h2 className="text-2xl font-bold">Crew Territory</h2></div>
      <div className="space-y-2">
        {territories.map(t => (
          <div key={t.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <div className="text-2xl">📍</div>
            <div className="flex-1"><div className="font-bold">{t.name}</div><div className="text-xs text-muted-foreground">Income: ${t.income.toLocaleString()}/hr</div></div>
            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs">Claim</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function CrewChallengesPage() {
  const challenges = [
    { name: "Rob 10 Banks", reward: "$50K", icon: "🏦" },
    { name: "Win 5 Crew Wars", reward: "1000 XP", icon: "⚔️" },
    { name: "Earn $500K total", reward: "Special Item", icon: "💰" },
    { name: "Capture 3 Territories", reward: "$100K", icon: "📍" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🎯</span><h2 className="text-2xl font-bold">Crew Challenges</h2></div>
      <div className="space-y-2">
        {challenges.map(c => (
          <div key={c.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1"><div className="font-bold text-sm">{c.name}</div><div className="text-xs text-green-400">Reward: {c.reward}</div></div>
            <div className="text-xs text-muted-foreground">0%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === WORLD PAGES ===
function NeighborhoodsPage() {
  const neighborhoods = [
    { name: "Downtown", icon: "🏙️", danger: "High", income: "Medium", desc: "The heart of the city. High police presence but lucrative targets." },
    { name: "Harbor District", icon: "⚓", danger: "Very High", income: "High", desc: "Smuggling hub. Multiple entry points for contraband." },
    { name: "Suburbs", icon: "🏘️", danger: "Low", income: "Low", desc: "Quiet residential area. Easy pickings for burglary." },
    { name: "Industrial Zone", icon: "🏭", danger: "Medium", income: "High", desc: "Factories and warehouses. Great for theft operations." },
    { name: "Red Light District", icon: "🔴", danger: "High", income: "Very High", desc: "Anything goes here. Illegal businesses thrive." },
    { name: "Financial District", icon: "💼", danger: "Very High", income: "Extreme", desc: "Banks and corporations. High-security, massive rewards." },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏘️</span><h2 className="text-2xl font-bold">Neighborhoods</h2></div>
      <div className="space-y-2">
        {neighborhoods.map(n => (
          <div key={n.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">{n.icon}</span>
            <div className="flex-1">
              <div className="font-bold">{n.name}</div>
              <div className="text-xs text-muted-foreground">{n.desc}</div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded bg-red-600/20 text-red-400">Danger: {n.danger}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-green-600/20 text-green-400">Income: {n.income}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SlumsPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏚️</span><h2 className="text-2xl font-bold">The Slums</h2></div>
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <div className="text-sm text-muted-foreground">The poorest part of the city. Low-level crimes, cheap goods, and desperate people. Good place to start your criminal career.</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="mafia-card rounded-lg p-3 text-center"><div className="text-2xl">🔪</div><div className="text-xs">Street Crimes</div><div className="text-xs text-green-400">+20% XP</div></div>
          <div className="mafia-card rounded-lg p-3 text-center"><div className="text-2xl">💊</div><div className="text-xs">Drug Deals</div><div className="text-xs text-green-400">+15% Cash</div></div>
          <div className="mafia-card rounded-lg p-3 text-center"><div className="text-2xl">🛡️</div><div className="text-xs">Low Heat</div><div className="text-xs text-green-400">-30% Wanted</div></div>
        </div>
      </div>
    </div>
  );
}
function SeasonsPage() {
  const seasons = [
    { name: "Spring", icon: "🌸", effect: "+10% XP on all actions" },
    { name: "Summer", icon: "☀️", effect: "+20% crime rewards" },
    { name: "Autumn", icon: "🍂", effect: "+15% gambling luck" },
    { name: "Winter", icon: "❄️", effect: "+25% smuggling profits" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🍂</span><h2 className="text-2xl font-bold">Seasons</h2></div>
      <div className="grid grid-cols-2 gap-3">
        {seasons.map(s => (
          <div key={s.name} className="mafia-card rounded-xl p-5 text-center space-y-2">
            <div className="text-4xl">{s.icon}</div>
            <div className="font-bold">{s.name}</div>
            <div className="text-xs text-green-400">{s.effect}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === PROGRESSION PAGES ===
function EnergyDrinksPage() {
  const player = useQuery(api.game.getPlayer);
  const buyDrink = useMutation(api.gameExtended.buyEnergyDrink);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const now = Date.now();
  const energyActive = ((player as any).energyDrinkUntil ?? 0) > now;
  const energyLeft = energyActive ? Math.ceil(((player as any).energyDrinkUntil - now) / 60000) : 0;
  const drinks = [
    { name: "Red Bull", icon: "🥤", boost: "+25% XP", duration: "30 min", cost: 5000 },
    { name: "Monster Energy", icon: "⛽", boost: "+25% XP", duration: "1 hr", cost: 15000 },
    { name: "Venom Shot", icon: "💉", boost: "+25% XP", duration: "2 hrs", cost: 50000 },
    { name: "Liquid Gold", icon: "✨", boost: "+25% XP", duration: "4 hrs", cost: 200000 },
    { name: "Shadow Elixir", icon: "🧪", boost: "+25% XP", duration: "8 hrs", cost: 500000 },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">⚡</span><h2 className="text-2xl font-bold">Energy Drinks</h2></div>
      {energyActive && (
        <div className="px-4 py-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-center">
          <div className="text-sm font-bold text-orange-400">🥤 Energy Rush Active!</div>
          <div className="text-xs text-orange-300/70">+25% XP on all crimes · {energyLeft}m remaining</div>
        </div>
      )}
      <div className="text-sm text-muted-foreground mb-3">+25% XP boost on all criminal actions! Stacks with existing boosts.</div>
      <div className="space-y-2">
        {drinks.map((d, i) => (
          <div key={d.name} className="mafia-card rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">{d.icon}</span>
            <div className="flex-1">
              <div className="font-bold">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.boost} for {d.duration}</div>
            </div>
            <button
              onClick={async () => {
                setLoading(true); setMsg("");
                try {
                  const r = await buyDrink({ drinkIndex: i });
                  setMsg(r.message);
                } catch (e: unknown) {
                  setMsg(e instanceof Error ? e.message : "Error");
                }
                setLoading(false);
              }}
              disabled={loading || (player.money ?? 0) < d.cost}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-40 transition-all"
            >${d.cost.toLocaleString()}</button>
          </div>
        ))}
      </div>
      {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

// === CHAT PAGES ===
function GlobalChatPage() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<string[]>(["🌍 Welcome to Global Chat!", "🔥 Stay active to earn reputation!"]);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🌐</span><h2 className="text-2xl font-bold">Global Chat</h2></div>
      <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto space-y-2">
        {messages.map((m, i) => <div key={i} className="text-sm text-muted-foreground">{m}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" onKeyDown={e => { if (e.key === "Enter" && msg.trim()) { setMessages([...messages, `👤 You: ${msg}`]); setMsg(""); } }} />
        <button onClick={() => { if (msg.trim()) { setMessages([...messages, `👤 You: ${msg}`]); setMsg(""); } }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Send</button>
      </div>
    </div>
  );
}
function TradeChatPage() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<string[]>(["💹 Trading Hub — buy, sell, and negotiate!"]);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💹</span><h2 className="text-2xl font-bold">Trade Chat</h2></div>
      <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto space-y-2">
        {messages.map((m, i) => <div key={i} className="text-sm text-muted-foreground">{m}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="WTS/WTB..." className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { if (msg.trim()) { setMessages([...messages, `💹 ${msg}`]); setMsg(""); } }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Post</button>
      </div>
    </div>
  );
}
function LFGPage() {
  const [messages, setMessages] = useState<string[]>(["👥 Looking for Group — find teammates for missions and heists!"]);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">👥</span><h2 className="text-2xl font-bold">Looking for Group</h2></div>
      <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto space-y-2">
        {messages.map((m, i) => <div key={i} className="text-sm text-muted-foreground">{m}</div>)}
      </div>
      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition">👥 Create LFG Post</button>
    </div>
  );
}
function FamilyChatPage() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<string[]>(["👨‍👩‍👦 Family Chat — private family channel"]);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">👨‍👩‍👦</span><h2 className="text-2xl font-bold">Family Chat</h2></div>
      <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto space-y-2">
        {messages.map((m, i) => <div key={i} className="text-sm text-muted-foreground">{m}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Family message..." className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { if (msg.trim()) { setMessages([...messages, `👨‍👩‍👦 ${msg}`]); setMsg(""); } }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Send</button>
      </div>
    </div>
  );
}

// === REPORTS PAGE ===
function ReportsPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📢</span><h2 className="text-2xl font-bold">Player Reports</h2></div>
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <div className="text-sm text-muted-foreground">Report a player for cheating, harassment, or rule violations.</div>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe the issue..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm h-24" />
        <button onClick={() => { if (subject && body) setSubmitted(true); }} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm">
          {submitted ? "✅ Reported!" : "📤 Submit Report"}
        </button>
      </div>
    </div>
  );
}

// === MYSTERY BOX PAGES ===
function MysteryBoxPage({ name, icon, cost, tiers }: { name: string; icon: string; cost: number; tiers: string[] }) {
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState("");
  const [player] = useQuery(api.game.getPlayer) ?? [null];
  const open = () => {
    setOpening(true); setResult("");
    setTimeout(() => {
      const roll = Math.random();
      let tier = "Common";
      if (roll > 0.95) tier = "💎 Legendary";
      else if (roll > 0.85) tier = "💜 Epic";
      else if (roll > 0.70) tier = "💙 Rare";
      else if (roll > 0.45) tier = "💚 Uncommon";
      setResult(`Opened ${name}! You got: ${tier}`);
      setOpening(false);
    }, 2000);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">{icon}</span><h2 className="text-2xl font-bold">{name}</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-7xl animate-bounce">{icon}</div>
        <div className="text-lg font-bold">{name}</div>
        <div className="text-sm text-muted-foreground">Contains: {tiers.join(", ")}</div>
        <div className="text-lg text-green-400 font-bold">${cost.toLocaleString()}</div>
        <button onClick={open} disabled={opening || (player?.money ?? 0) < cost} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition disabled:opacity-50">
          {opening ? "🎁 Opening..." : `🎁 Open (${cost > 0 ? "$" + cost.toLocaleString() : "Free"})`}
        </button>
        {result && <div className="mt-2 text-sm font-bold text-primary animate-fade-in">{result}</div>}
      </div>
    </div>
  );
}
function StandardBoxPage() { return <MysteryBoxPage name="Standard Box" icon="📦" cost={10000} tiers={["Common", "Uncommon", "Rare"]} />; }
function PremiumBoxPage() { return <MysteryBoxPage name="Premium Box" icon="💎" cost={100000} tiers={["Uncommon", "Rare", "Epic"]} />; }
function LegendaryBoxPage() { return <MysteryBoxPage name="Legendary Box" icon="👑" cost={500000} tiers={["Rare", "Epic", "Legendary"]} />; }
function SeasonalBoxPage() { return <MysteryBoxPage name="Seasonal Box" icon="🎄" cost={250000} tiers={["Seasonal Uncommon", "Seasonal Rare", "Seasonal Epic"]} />; }
function CrimeBoxPage() { return <MysteryBoxPage name="Crime Box" icon="🔪" cost={75000} tiers={["Weapon", "Tool", "Blueprint"]} />; }
function CombatBoxPage() { return <MysteryBoxPage name="Combat Box" icon="⚔️" cost={150000} tiers={["Armor", "Weapon", "Shield"]} />; }
function GuaranteedBoxPage() { return <MysteryBoxPage name="Guaranteed Legendary" icon="⭐" cost={1000000} tiers={["Epic", "Legendary (Guaranteed)"]} />; }
function LimitedBoxPage() { return <MysteryBoxPage name="Limited Edition" icon="🔥" cost={750000} tiers={["Limited Epic", "Limited Legendary", "Exclusive"]} />; }

// === GHOST MODE PAGES ===
function GhostStatusPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">👁️</span><h2 className="text-2xl font-bold">Ghost Status</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">👁️‍🗨️</div>
        <div className="text-sm text-muted-foreground">Become invisible on the map for 1 hour. Cannot be targeted by other players.</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Cost</div><div className="text-lg font-bold text-green-400">$5M</div></div>
          <div className="mafia-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Cooldown</div><div className="text-lg font-bold text-yellow-400">24 hrs</div></div>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:scale-105 transition">👁️ Go Ghost</button>
      </div>
    </div>
  );
}
function GhostHistoryPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📋</span><h2 className="text-2xl font-bold">Ghost History</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-sm text-muted-foreground">No ghost sessions yet. Activate Ghost Mode first!</div>
      </div>
    </div>
  );
}

// === SECRET CHALLENGE PAGES ===
function SecretDailyPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const secrets = [
    { name: "Midnight Mugging", desc: "Commit 5 crimes between 12AM-2AM", reward: "$50K", progress: 0, goal: 5 },
    { name: "Lucky Seven", desc: "Win exactly 7 gambling games in a row", reward: "Legendary Item", progress: 0, goal: 7 },
    { name: "Silent Predator", desc: "Complete 10 murders without being wanted", reward: "$200K", progress: 0, goal: 10 },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🔮</span><h2 className="text-2xl font-bold">Daily Secret Challenge</h2></div>
      <div className="space-y-3">
        {secrets.map(s => (
          <div key={s.name} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center"><div className="font-bold">{s.name}</div><div className="text-xs text-yellow-400">Reward: {s.reward}</div></div>
            <div className="text-xs text-muted-foreground">{s.desc}</div>
            <div className="w-full bg-secondary rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(s.progress / s.goal) * 100}%` }} /></div>
            <div className="text-xs text-muted-foreground text-right">{s.progress}/{s.goal}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SecretWeeklyPage() {
  const secrets = [
    { name: "Empire Builder", desc: "Earn $5M in one week", reward: "Mythic Item", progress: "$0", goal: "$5M" },
    { name: "Ghost Protocol", desc: "Use Ghost Mode 3 times in one week", reward: "$1M", progress: "0", goal: "3" },
    { name: "Untouchable", desc: "Avoid prison for 7 consecutive days", reward: "VIP Status", progress: "0 days", goal: "7 days" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💎</span><h2 className="text-2xl font-bold">Weekly Secret Challenge</h2></div>
      <div className="space-y-3">
        {secrets.map(s => (
          <div key={s.name} className="mafia-card rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center"><div className="font-bold">{s.name}</div><div className="text-xs text-yellow-400">{s.reward}</div></div>
            <div className="text-xs text-muted-foreground">{s.desc}</div>
            <div className="text-xs text-primary">Progress: {s.progress} / {s.goal}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SecretAchievementsPage() {
  const hidden = [
    { name: "Shadow Walker", desc: "Complete 100 crimes without being detected", icon: "👤" },
    { name: "Gold Digger", desc: "Earn $100M from stealing alone", icon: "💰" },
    { name: "Phantom", desc: "Reach Level 50 without dying once", icon: "👻" },
    { name: "Dragon's Hoard", desc: "Accumulate $1B in total earnings", icon: "🐉" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏆</span><h2 className="text-2xl font-bold">Hidden Achievements</h2></div>
      <div className="space-y-2">
        {hidden.map(a => (
          <div key={a.name} className="mafia-card rounded-xl p-4 flex items-center gap-4 opacity-50">
            <span className="text-3xl">{a.icon}</span>
            <div><div className="font-bold">???</div><div className="text-xs text-muted-foreground">{a.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SecretEasterEggsPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🥚</span><h2 className="text-2xl font-bold">Easter Eggs</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-5xl mb-3">🥚</div>
        <div className="text-sm text-muted-foreground">Hidden secrets scattered across the game. Explore every page to discover them!</div>
        <div className="text-xs text-yellow-400 mt-2">??/10 Discovered</div>
      </div>
    </div>
  );
}
function SecretCrimePage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🕵️</span><h2 className="text-2xl font-bold">Secret Crime</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">🕵️</div>
        <div className="text-sm text-muted-foreground">A hidden crime operation. Only available for players Level 50+.</div>
        {(player.level ?? 0) >= 50 ? (
          <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition">🕵️ Execute Secret Crime</button>
        ) : (
          <div className="text-xs text-red-400">🔒 Requires Level 50+</div>
        )}
      </div>
    </div>
  );
}

// === HELPER PAGES ===
function Duel1v1Page() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">⚔️</span><h2 className="text-2xl font-bold">1v1 Duel</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-5xl">⚔️</div>
        <div className="text-sm text-muted-foreground">Challenge another player to a 1v1 fight. ATK vs DEF with level scaling.</div>
        <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition">⚔️ Find Opponent</button>
      </div>
    </div>
  );
}
function BankAccountPage() { return <BankPage />; }
function BankRobberyPage() {
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const rob = () => {
    setLoading(true);
    const success = Math.random() > 0.5;
    const reward = success ? Math.floor(Math.random() * 25000 + 5000) : -Math.floor(Math.random() * 5000);
    setMsg(success ? `💰 Robbed $${reward.toLocaleString()}!` : `💀 Failed! Lost $${Math.abs(reward).toLocaleString()}`);
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏦</span><h2 className="text-2xl font-bold">Bank Robbery</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center space-y-4">
        <div className="text-4xl mb-3">💰</div>
        <p className="text-sm text-muted-foreground">High risk, high reward. 50% success rate.</p>
        <button onClick={rob} disabled={loading || (player.level ?? 0) < 10} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50">
          {loading ? "Robbing..." : "🏦 Rob the Bank"}
        </button>
      </div>
      {msg && <div className="mafia-card rounded-xl p-4 text-center text-sm font-bold">{msg}</div>}
    </div>
  );
}
function CryptoTradingPage() { return <CryptoPage />; }
function DailySpinPage() { return <DailyLoginPage />; }
function SeasonRewardsPage() { return <SeasonPassPage />; }
function BattlePassPage() { return <SeasonPassPage />; }
function CrewLeaderboardPage() {
  const players = useQuery(api.admin.getAllPlayers);
  const sorted = [...(players || [])].sort((a: any, b: any) => (b.level || 0) - (a.level || 0)).slice(0, 50);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🤝</span><h2 className="text-2xl font-bold">Crew Leaderboard</h2></div>
      <div className="space-y-2">{sorted.map((p: any, i: number) => (
        <div key={p._id} className="mafia-card rounded-xl p-3 flex items-center gap-3">
          <div className="text-lg font-bold text-yellow-400">#{i+1}</div>
          <div className="flex-1"><div className="text-sm font-bold">{p.nickname || p.username || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">Level {p.level ?? 1}</div></div>
        </div>))}</div>
    </div>
  );
}
function CityMapPage() { return <WorldMapPage />; }
function CityStatsPage() { return <StatisticsPage />; }
function CombatSkillsPage() { return <SkillTreePage />; }
function StealthSkillsPage() { return <SkillTreePage />; }
function HackingSkillsPage() { return <SkillTreePage />; }
function PrestigeShopPage() { return <PrestigePage />; }
function SeasonRewardsProgPage() { return <SeasonPassPage />; }
function SideMissionsPage() { return <MissionsOverviewPage />; }
function DailyMissionsPage() { return <MissionsOverviewPage />; }
function WeeklyMissionsPage() { return <MissionsOverviewPage />; }
function MonthlyMissionsPage() { return <MissionsOverviewPage />; }


// Inline Hub Page component - simple, no external deps
function HubP({ title, icon, tabs }: { title: string; icon: string; tabs: { id: string; l: string; ic: string; d: string }[] }) {
  const [tab, setTab] = useState(tabs[0]?.id || "");
  const [msg, setMsg] = useState("");
  const t = tabs.find(x => x.id === tab);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-black text-amber-400">{title}</h2>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(x => (
          <button key={x.id} onClick={() => { setTab(x.id); setMsg(""); }}
            className={"px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 " + (tab === x.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
            <span className="mr-1">{x.ic}</span>{x.l}
          </button>
        ))}
      </div>
      {msg && <div className="px-4 py-2 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-bold animate-fade-in">✅ {msg}</div>}
      {t && (
        <div className="mafia-card rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{t.ic}</span>
            <div>
              <div className="text-lg font-black text-slate-200">{t.l}</div>
              <div className="text-xs text-slate-400">{t.d}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-[10px] text-slate-400">Status</div><div className="text-xs font-bold text-green-400">Active</div></div>
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-[10px] text-slate-400">Level</div><div className="text-xs font-bold text-amber-400">Lv.1</div></div>
            <div className="mafia-card rounded-lg p-2 text-center"><div className="text-[10px] text-slate-400">Bonus</div><div className="text-xs font-bold text-purple-400">+10%</div></div>
          </div>
          <button onClick={() => setMsg(t.l + " feature activated!")} className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-sm font-black hover:from-amber-500 hover:to-amber-600 active:scale-95 transition-all shadow-lg">
            🔥 Activate {t.l}
          </button>
        </div>
      )}
    </div>
  );
}


export default function Dashboard() {
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const player = useQuery(api.game.getPlayer);
  const [registered, setRegistered] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [dismissedAtLevel, setDismissedAtLevel] = useState<number | null>(null);
  const setPage = useCallback((p: GamePage) => setActivePage(p), []);
  const { t } = useTranslation();

  const isRegistered = (player?.nickname && player?.registeredAt) || player?.username || registered;



  const acknowledgeLevelUp = useMutation(api.game.acknowledgeLevelUp);

  // Prison auto-release check — runs every second, releases EXACTLY when sentence is served
  const releaseFromPrison = useMutation(api.game.releaseFromPrison);
  useEffect(() => {
    if (!player?.inPrison || !player?.lastCrimeAt) return;
    const check = () => {
      const sentenceMs = (player as any).prisonTime ?? 15000;
      if (Date.now() - player.lastCrimeAt! >= sentenceMs) releaseFromPrison({}).catch(() => {});
    };
    check();
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
  }, [player?.inPrison, player?.lastCrimeAt, (player as any)?.prisonTime]);

  // Global heartbeat so every online player shows in the Online Players list
  const heartbeat = useMutation(api.admin.heartbeat);
  useEffect(() => {
    heartbeat().catch(() => {});
    const iv = setInterval(() => heartbeat().catch(() => {}), 30000);
    return () => clearInterval(iv);
  }, []);

  const [leftExpanded, setLeftExpanded] = useState<string[]>(["Overview","Crimes","Combat","Gambling","Missions","Economy","Assets","Social","Progression","Special","Underworld","Empire","Power","World","Companies","Empire Building","Relationships","Survival","Security"]);
  const [rightExpanded, setRightExpanded] = useState<string[]>(["Communication","Forums","Chat","Quick Info","Seasonal Events","Server Events","Help","System"]);
  const [leftItemsExpanded, setLeftItemsExpanded] = useState<string[]>([]);
  const [rightItemsExpanded, setRightItemsExpanded] = useState<string[]>([]);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [activeEvents, setActiveEvents] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("activeEventIds") || "[]"); } catch { return []; }
  });

  const xpNeeded = (player?.level ?? 1) * 100;
  // Listen for event changes from admin panel
  useEffect(() => {
    const refresh = () => {
      try { setActiveEvents(JSON.parse(localStorage.getItem("activeEventIds") || "[]")); } catch {}
    };
    window.addEventListener("eventsChanged", refresh);
    window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 5000);
    return () => { window.removeEventListener("eventsChanged", refresh); window.removeEventListener("storage", refresh); clearInterval(interval); };
  }, []);
  const xpPercent = Math.min(100, ((player?.experience ?? 0) / xpNeeded) * 100);

  // Registration screen
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

  
// ===== NEW PAGE STUBS =====


function StorylinePage() {
  const missions = [
    { id: "origins", name: "Storyline: Origins", icon: "📖", desc: "Your journey begins. Learn the ropes of the criminal underworld.", chapters: 10, difficulty: "Easy" },
    { id: "territory", name: "Storyline: Territory", icon: "🗺️", desc: "Claim your first territory. Fight rival gangs for control.", chapters: 15, difficulty: "Medium" },
    { id: "rivalry", name: "Storyline: Rivalry", icon: "⚔️", desc: "A deadly rivalry begins. Someone wants you dead.", chapters: 20, difficulty: "Hard" },
    { id: "betrayal", name: "Storyline: Betrayal", icon: "🗡️", desc: "Trust no one. A deep betrayal shakes your empire.", chapters: 25, difficulty: "Hard" },
    { id: "fbi", name: "Storyline: FBI", icon: "🕵️", desc: "The FBI is onto you. Stay one step ahead.", chapters: 30, difficulty: "Extreme" },
    { id: "prison", name: "Storyline: Prison", icon: "🔒", desc: "Behind bars. Survive prison and plot your escape.", chapters: 20, difficulty: "Hard" },
  ];
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Target className="size-7 text-primary" /><h2 className="text-2xl font-bold">Storyline Missions</h2></div>
      <div className="space-y-3">
        {missions.map(m => (
          <div key={m.id} className="mafia-card rounded-xl p-5 hover:border-primary/40 transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{m.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-bold">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m.chapters} Chapters</span>
                  <span className="text-[10px] bg-red-400/10 text-red-400 px-2 py-0.5 rounded-full">{m.difficulty}</span>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}












// ===== EVENT PAGE STUB =====
function EventPage({ name, icon, desc }: { name: string; icon: string; desc: string }) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">{icon}</span><h2 className="text-2xl font-bold">{name}</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center"><div className="text-4xl mb-3">{icon}</div><div className="text-sm font-bold mb-1">{name}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
    </div>
  );
}

function CommunityPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📜</span><h2 className="text-2xl font-bold">Community Guidelines</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3 text-sm text-muted-foreground">
        <div className="font-bold text-foreground">1. Be Respectful</div><p>Treat all players with respect.</p>
        <div className="font-bold text-foreground">2. No Cheating</div><p>Exploiting bugs = ban.</p>
        <div className="font-bold text-foreground">3. Play Fair</div><p>No scamming outside in-game mechanics.</p>
        <div className="font-bold text-foreground">4. Have Fun</div><p>Enjoy the criminal underworld!</p>
      </div>
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
function FBIStatusPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const wl = player.wantedLevel ?? 0;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🕵️</span><h2 className="text-2xl font-bold">FBI / Military Status</h2></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-6 rounded-xl bg-red-950/20 border border-red-500/20">
          <div className="text-4xl mb-2">🕵️</div>
          <div className="text-sm font-bold">FBI Activity</div>
          <div className={`text-xs mt-1 ${wl >= 2 ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
            {wl >= 4 ? "FULLY DEPLOYED" : wl >= 2 ? "Active Investigation" : "No Activity"}
          </div>
        </div>
        <div className="text-center p-6 rounded-xl bg-orange-950/20 border border-orange-500/20">
          <div className="text-4xl mb-2">🎖️</div>
          <div className="text-sm font-bold">Military Response</div>
          <div className={`text-xs mt-1 ${wl >= 4 ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
            {wl >= 4 ? "DEPLOYED" : "Standby"}
          </div>
        </div>
      </div>
      <div className="mafia-card rounded-xl p-4 text-center">
        <div className="text-sm text-muted-foreground">Wanted Level: <span className="text-red-400 font-bold">{wl}/5</span></div>
        <div className="w-full h-3 bg-black/40 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all" style={{ width: `${(wl / 5) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}



// ===== FULL MURDER PAGE =====
const MURDER_WEAPONS = [
  { id: "bare_hands", name: "Bare Hands", category: "Melee", damage: 10, trace: 5, cost: 0, icon: "👊" },
  { id: "kitchen_knife", name: "Kitchen Knife", category: "Melee", damage: 25, trace: 15, cost: 500, icon: "🔪" },
  { id: "baseball_bat", name: "Baseball Bat", category: "Melee", damage: 30, trace: 10, cost: 300, icon: "🏏" },
  { id: "steel_pipe", name: "Steel Pipe", category: "Melee", damage: 35, trace: 12, cost: 400, icon: "🔧" },
  { id: "throwing_knife", name: "Throwing Knife", category: "Ranged", damage: 40, trace: 8, cost: 2000, icon: "🗡️" },
  { id: "pistol", name: "Pistol", category: "Firearm", damage: 60, trace: 45, cost: 10000, icon: "🔫" },
  { id: "revolver", name: "Revolver", category: "Firearm", damage: 55, trace: 35, cost: 8000, icon: "🔫" },
  { id: "silenced_pistol", name: "Suppressed Pistol", category: "Firearm", damage: 50, trace: 15, cost: 25000, icon: "🤫" },
  { id: "shotgun", name: "Shotgun", category: "Firearm", damage: 80, trace: 50, cost: 15000, icon: "💥" },
  { id: "sniper", name: "Sniper Rifle", category: "Firearm", damage: 90, trace: 20, cost: 50000, icon: "🎯" },
  { id: "poison_feed", name: "Cyanide", category: "Chemical", damage: 100, trace: 5, cost: 30000, icon: "☠️" },
  { id: "strangulation", name: "Wire Garrote", category: "Melee", damage: 45, trace: 3, cost: 1500, icon: "〰️" },
  { id: "explosive", name: "C4 Explosive", category: "Explosive", damage: 100, trace: 60, cost: 100000, icon: "💣" },
  { id: "car_bomb", name: "Car Bomb", category: "Explosive", damage: 95, trace: 40, cost: 75000, icon: "🚗" },
];

const MURDER_METHODS = [
  { id: "ambush", name: "Ambush", desc: "Hide and strike when they least expect it", successMod: 0.1, icon: "🫣" },
  { id: "driveby", name: "Drive-By", desc: "Roll up and spray from the car", successMod: -0.05, icon: "🚗" },
  { id: "snipe", name: "Snipe from Distance", desc: "One shot, one kill from the rooftops", successMod: 0.15, icon: "🔭" },
  { id: "poison_feed", name: "Poisoned Drink", desc: "Slip something into their coffee", successMod: 0.2, icon: "🍸" },
  { id: "home_invasion", name: "Home Invasion", desc: "Break in while they sleep", successMod: 0.05, icon: "🏠" },
  { id: "strangle", name: "Strangulation", desc: "Up close and personal", successMod: 0, icon: "🫳" },
  { id: "staged_robbery", name: "Staged Robbery", desc: "Make it look like a robbery gone wrong", successMod: 0.1, icon: "🎭" },
  { id: "car_crash", name: "Staged Accident", desc: "Cut the brakes. Make it look like an accident.", successMod: 0.15, icon: "💥" },
  { id: "professional", name: "Professional Hit", desc: "Clean, efficient, no witnesses", successMod: 0.2, icon: "🕵️" },
  { id: "gang_squad", name: "Hit Squad", desc: "Send a team to handle it", successMod: 0.25, icon: "👥" },
  { id: "ninja", name: "Ninja Strike", desc: "In and out before anyone notices", successMod: 0.3, icon: "🥷" },
  { id: "frame", name: "Frame a Player", desc: "Kill them and frame someone else", successMod: -0.1, icon: "🎯" },
];

function MurderPage() {
  const player = useQuery(api.game.getPlayer);
  const players = useQuery(api.admin.getAllPlayers);
  const murder = useMutation(api.murderSystem.commitMurder);
  const [tab, setTab] = useState<"arsenal" | "targets" | "methods" | "stats" | "feed" | "investigations">("targets");
  const [weapon, setWeapon] = useState(MURDER_WEAPONS[0]);
  const [method, setMethod] = useState(MURDER_METHODS[0]);
  const [target, setTarget] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const opponents = (players || []).filter((p: any) => p._id !== player?._id && !p.isBanned && (p.nickname || "").toLowerCase().includes(search.toLowerCase())).slice(0, 30);

  const execute = async () => {
    if (!target || loading) return;
    setLoading(true);
    try {
      const r = await murder({ targetId: target._id, weaponId: weapon.id, methodId: method.id, useGloves: false, useAlibi: false });
      setResult(r);
    } catch (e: any) { setResult({ success: false, error: e.message }); }
    setLoading(false);
  };

  const tabs = [
    { id: "targets" as const, label: "🎯 Targets", icon: "🎯" },
    { id: "arsenal" as const, label: "🗡️ Arsenal", icon: "🗡️" },
    { id: "methods" as const, label: "📋 Methods", icon: "📋" },
    { id: "stats" as const, label: "📊 Stats", icon: "📊" },
    { id: "feed" as const, label: "💀 Kill Feed", icon: "💀" },
    { id: "investigations" as const, label: "🔍 Investigations", icon: "🔍" },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skull className="size-7 text-red-400" />
        <h2 className="text-2xl font-bold">Murder</h2>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">☠️ LETHAL</span>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-4 text-center ${result.success ? "bg-green-950/30 border border-green-500/30" : "bg-red-950/30 border border-red-500/30"}`}>
          <div className={`text-2xl font-black mb-1 ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "💀 TARGET ELIMINATED" : result.error || "💀 ATTEMPT FAILED"}
          </div>
          {result.success && (
            <div className="text-sm text-muted-foreground space-y-1">
              {result.cashStolen > 0 && <div className="text-green-400">💰 Stole: ${result.cashStolen.toLocaleString()}</div>}
              {result.xpEarned > 0 && <div className="text-blue-400">⭐ XP: +{result.xpEarned}</div>}
              {result.reputation > 0 && <div className="text-purple-400">🌍 Rep: +{result.reputation}</div>}
              {result.evidenceFound && <div className="text-red-400">🕵️ Evidence found! Detective investigating...</div>}
              {result.wantedGained > 0 && <div className="text-orange-400">🔴 Wanted: +{result.wantedGained}</div>}
            </div>
          )}
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">✕ Dismiss</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">💰 Cash</div><div className="text-sm font-bold text-green-400">${(player?.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">⚔️ ATK</div><div className="text-sm font-bold text-red-400">{player?.attack ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">🛡️ DEF</div><div className="text-sm font-bold text-blue-400">{player?.defense ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">💀 Kills</div><div className="text-sm font-bold text-purple-400">{player?.totalKills ?? 0}</div></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${tab === t.id ? "bg-red-600 text-white" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "targets" && (
        <div className="space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search players to target..." className="w-full bg-black/30 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm" />
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {opponents.map((p: any) => (
              <div key={p._id} onClick={() => setTarget(p)} className={`p-3 rounded-xl cursor-pointer transition text-sm flex justify-between items-center ${target?._id === p._id ? "bg-red-950/30 border border-red-500/30" : "hover:bg-white/5 border border-transparent"}`}>
                <div>
                  <span className="font-bold">{p.nickname || "Unknown"}</span>
                  <span className="text-muted-foreground ml-2">Lv.{p.level}</span>
                  {p.isDead && <span className="text-red-400 ml-1">💀</span>}
                </div>
                <div className="text-xs text-muted-foreground">ATK:{p.attack} | ${((p.money ?? 0) / 1000).toFixed(0)}K</div>
              </div>
            ))}
          </div>
          {target && (
            <div className="mafia-card rounded-xl p-4 border border-red-500/20">
              <div className="text-sm font-bold mb-2">🎯 Target: {target.nickname}</div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                <div>Level: {target.level}</div><div>ATK: {target.attack}</div><div>DEF: {target.defense}</div><div>HP: {target.life}/{target.maxLife}</div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">Weapon: {weapon.icon} {weapon.name} | Method: {method.icon} {method.name}</div>
              <button onClick={execute} disabled={loading} className="w-full px-4 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm">
                {loading ? "Executing..." : `💀 ELIMINATE ${target.nickname.toUpperCase()}`}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "arsenal" && (
        <div className="space-y-2">
          {["Melee", "Ranged", "Firearm", "Chemical", "Explosive"].map(cat => (
            <div key={cat}>
              <div className="text-xs font-bold text-muted-foreground mb-1 px-1">{cat}</div>
              <div className="grid grid-cols-2 gap-2">
                {MURDER_WEAPONS.filter(w => w.category === cat).map(w => (
                  <button key={w.id} onClick={() => setWeapon(w)} className={`p-3 rounded-xl text-left text-xs transition ${weapon.id === w.id ? "bg-red-950/30 border border-red-500/30" : "mafia-card hover:border-red-500/20"}`}>
                    <div className="flex items-center gap-2"><span className="text-lg">{w.icon}</span><span className="font-bold">{w.name}</span></div>
                    <div className="text-muted-foreground mt-1">DMG: {w.damage} | Trace: {w.trace}% | {w.cost > 0 ? `$${w.cost.toLocaleString()}` : "Free"}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "methods" && (
        <div className="space-y-2">
          {MURDER_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m)} className={`w-full p-3 rounded-xl text-left text-sm transition ${method.id === m.id ? "bg-red-950/30 border border-red-500/30" : "mafia-card hover:border-red-500/20"}`}>
              <div className="flex items-center gap-2"><span className="text-lg">{m.icon}</span><span className="font-bold">{m.name}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Success Modifier: {m.successMod > 0 ? "+" : ""}{(m.successMod * 100).toFixed(0)}%</div>
            </button>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="mafia-card rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><div className="text-2xl font-black text-red-400">{player?.totalKills ?? 0}</div><div className="text-xs text-muted-foreground">Total Kills</div></div>
            <div><div className="text-2xl font-black text-green-400">${(player?.totalEarned ?? 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Earned</div></div>
            <div><div className="text-2xl font-black text-purple-400">{player?.reputation ?? 0}</div><div className="text-xs text-muted-foreground">Reputation</div></div>
            <div><div className="text-2xl font-black text-orange-400">{player?.wantedLevel ?? 0}</div><div className="text-xs text-muted-foreground">Wanted Level</div></div>
          </div>
        </div>
      )}

      {tab === "feed" && (
        <div className="mafia-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          <div className="text-2xl mb-2">💀</div>
          Kill feed shows recent murders across the city.
          <div className="text-xs mt-2">Commit murders to see activity here!</div>
        </div>
      )}

      {tab === "investigations" && (
        <div className="mafia-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          <div className="text-2xl mb-2">🔍</div>
          Active investigations by law enforcement.
          <div className="text-xs mt-2">The more evidence you leave, the more investigations open.</div>
        </div>
      )}
    </div>
  );
}



const renderPage = () => {
    // Prison blocking for crime pages
    const prisonBlockedPages = ["crimes", "steal_from_house", "gta_car_theft", "kill", "hit_list",
      "fight_club", "contracts", "underground", "counterfeiting", "drug_trafficking", "arson",
      "identity_theft", "arms_deal", "tax_evasion", "racketeering", "gambling_den",
      "crime_empire", "heist_planning", "organized_crime", "crime_spree",
      "roulette", "slots", "russian_roulette", "blackjack", "dog_fight", "street_racing", "lotto",
      "smuggling", "colosseum", "last_man_standing"];

    if (player?.inPrison && prisonBlockedPages.includes(activePage)) {
      return (
        <div className="animate-fade-in space-y-6">
          <div className="rounded-2xl p-8 border-2 border-red-500/40 bg-red-950/20 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <div className="text-2xl font-black text-red-400">IN PRISON</div>
            <div className="text-sm text-muted-foreground mt-2">You cannot access crime features while in prison.</div>
            <div className="text-xs text-muted-foreground mt-1">Wait for your sentence to end or visit the Prison page.</div>
          </div>
          <PrisonTimeDisplay />
        </div>
      );
    }

    // Dead player blocking — only block crime/combat/gambling, allow hubs/info/progression
    const deadBlockedPages = ["crimes", "steal_from_house", "gta_car_theft", "kill", "hit_list",
      "fight_club", "contracts", "underground", "counterfeiting", "drug_trafficking", "arson",
      "identity_theft", "arms_deal", "tax_evasion", "racketeering", "gambling_den",
      "crime_empire", "heist_planning", "organized_crime", "crime_spree",
      "roulette", "slots", "russian_roulette", "blackjack", "dog_fight", "street_racing", "lotto",
      "smuggling", "colosseum", "last_man_standing", "robbery", "fraud", "burglary", "drugs", "arena",
      "gambling_overview", "world_events", "storyline"];
    if (player?.isDead && deadBlockedPages.includes(activePage)) {
      return (
        <div className="animate-fade-in space-y-6">
          <div className="rounded-2xl p-8 border-2 border-red-500/40 bg-red-950/20 text-center">
            <div className="text-6xl mb-4">💀</div>
            <div className="text-2xl font-black text-red-400">YOU ARE DEAD</div>
            <div className="text-sm text-muted-foreground mt-2">Visit the Hospital to revive.</div>
            <button onClick={() => setPage("hospital")} className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all">🏥 Go to Hospital</button>
          </div>
        </div>
      );
    }

    switch (activePage) {
      // Overview
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <BankPage />;
      case "hospital": return <HospitalPage />;
      case "points": return <PointsShopPage />;
      case "profile": return <MyProfilePage />;
      case "updates": return <UpdatesPage />;

      // Crime
      case "crimes": return <CrimeCategoryPage categoryId="street" />;
      case "steal_from_house": return <StealFromHousePage />;
      case "gta_car_theft": return <GtaCarTheftPage />;
      case "crime_empire": return <CrimeEmpirePage />;
      case "heist_planning": return <HeistPlanningPage />;
      case "organized_crime": return <OrganizedCrimePage />;
      case "kill": return <SafePage><MurderPage /></SafePage>;
      case "underground": return <CrimeCategoryPage categoryId="underground" />;
      case "crime_spree": return <CrimeSpreePage />;

      // Combat
      case "fight_club": return <FightClubPage />;
      case "hit_list": return <HitListPage />;
      case "contracts": return <ContractsPage />;
      case "combat_log": return <CombatLogPage />;
      case "fighting_styles": return <FightingStylesPage />;
      case "armor": return <ArmorPage />;

      // Gambling
      case "blackjack": return <BlackjackPage />;
      case "roulette": return <RoulettePage />;
      case "slots": return <SlotsPage />;
      case "lotto": return <LottoPage />;
      case "russian_roulette": return <RussianRoulettePage />;
      case "gambling_den": return <GamblingDenPage />;
      case "gambling_overview": return <GamblingOverviewPage />;
      case "dog_fight": return <DogFightPage />;
      case "street_racing": return <StreetRacingPage />;

      // Underground
      case "counterfeiting": return <CounterfeitingPage />;
      case "drug_trafficking": return <DrugTraffickingPage />;
      case "arson": return <ArsonPage />;
      case "identity_theft": return <IdentityTheftPage />;
      case "arms_deal": return <ArmsDealPage />;
      case "tax_evasion": return <TaxEvasionPage />;
      case "racketeering": return <RacketeeringPage />;
      case "smuggling": return <SmugglingRoutesPage />;

      // Economy
      case "stock_market": return <StockMarketPage />;
      case "crypto": return <CryptoPage />;
      case "crafting": return <CraftingPage />;

      // Assets
      case "garage": return <GaragePage />;
      case "items": return <MyItemsPage />;
      case "black_market": return <BlackMarketPage />;
      case "mystery_boxes": return <MysteryBoxesPage />;
      case "legendary_items": return <LegendaryItemsPage />;
      case "bodyguards": return <BodyguardsPage />;

      // Social
      case "family": return <SafePage><div className="animate-fade-in p-6 text-center text-muted-foreground">Family system — Create or join a family to start.</div></SafePage>;
      case "crew": return <CrewSystemPage />;
      case "crime_fame": return <CrimeFamePage />;
      case "reputation": return <ReputationPage />;
      case "gifting": return <GiftingPage />;

      // Progression
      case "skill_tree": return <SkillTreePage />;
      case "achievements": return <AchievementsPage />;
      case "titles": return <TitlesPage />;
      case "legacy": return <LegacyPage />;
      case "prestige": return <PrestigePage />;
      case "leaderboards": return <LeaderboardsPage />;
      case "season_pass": return <SeasonPassPage />;
      case "daily_login": return <DailyLoginPage />;
      case "daily_challenges": return <DailyChallengesPage />;

      // Special
      case "ghost_mode": return <GhostModePage />;
      case "missions": return <MissionsOverviewPage />;
      case "wanted": return <WantedStatusPage />;
      case "colosseum": return <ColosseumPage />;
      case "last_man_standing": return <SafePage><div className="animate-fade-in p-6 text-center text-muted-foreground">Last Man Standing event — active before season wipe.</div></SafePage>;
      case "prison": return <SafePage><PrisonTimeDisplay /></SafePage>;

      // Right menu
      // Event pages
      case "evt_newyear": return <EventPage name="New Year's Heist" icon="🎆" desc="Special New Year event! Fireworks + heists!" />;
      case "evt_valentine": return <EventPage name="Valentine's Crime" icon="❤️" desc="Crime of passion! Romance scams +5x payout!" />;
      case "evt_patricks": return <EventPage name="St. Patrick's Gold" icon="☘️" desc="Gold rush! All rewards have gold bonus +100%!" />;
      case "evt_easter": return <EventPage name="Easter Egg Hunt" icon="🥚" desc="Find hidden eggs across cities for prizes!" />;
      case "evt_summer": return <EventPage name="Summer Crime Wave" icon="☀️" desc="Summer heat brings crime heat! All crimes boosted!" />;
      case "evt_halloween": return <EventPage name="Halloween Horror" icon="🎃" desc="Spooky crimes pay 3x! Ghost mode free!" />;
      case "evt_christmas": return <EventPage name="Christmas Heist" icon="🎄" desc="Steal presents from Santa! Legendary loot!" />;
      case "evt_cyber": return <EventPage name="Cyber Monday" icon="💻" desc="Hacking skills +5x. Digital crimes boosted!" />;
      case "evt_blackfriday": return <EventPage name="Black Friday Heist" icon="🛒" desc="Everything on sale! Crime costs reduced 50%!" />;
      case "evt_tax": return <EventPage name="Tax Season Scam" icon="📋" desc="Tax evasion +10x rewards! IRS is busy!" />;
      case "evt_spring": return <EventPage name="Spring Break Crime" icon="🌸" desc="College town crime wave! Easy targets everywhere!" />;
      case "evt_winter": return <EventPage name="Winter Wonderland" icon="❄️" desc="Blizzard = easy heists! Reduced patrols!" />;
      case "evt_purge": return <EventPage name="Purge Night" icon="💀" desc="24 hours of lawlessness. No police. Maximum chaos!" />;
      case "evt_bloodmoon": return <EventPage name="Blood Moon" icon="🌑" desc="All combat damage doubled. Kills give 5x XP!" />;
      case "evt_robbersmoon": return <EventPage name="Robber's Moon" icon="🌙" desc="Full moon = all crimes have 20% better success!" />;
      case "evt_fullmoon": return <EventPage name="Full Moon" icon="🌕" desc="ALL boosts active! Crime + Combat + Gambling!" />;
      case "evt_grandheist": return <EventPage name="Grand Heist" icon="🏦" desc="Special heist event. 10x rewards on bank heists!" />;
      case "evt_tournament": return <EventPage name="Tournament Championship" icon="🏆" desc="Server-wide PvP tournament. Winner takes $500K!" />;
      case "evt_familywar": return <EventPage name="Family War Week" icon="⚔️" desc="Family wars give 5x reputation!" />;
      case "evt_territory": return <EventPage name="Territory Takeover" icon="📍" desc="Fight for territory! +300% income!" />;
      case "evt_underground": return <EventPage name="Underground Championship" icon="💣" desc="Underground tournament. Best fighter wins!" />;
      case "evt_empire": return <EventPage name="Crime Empire Week" icon="👑" desc="All empire operations +5x reward!" />;
      // Chat pages
      case "crew_chat": return <CrewChatPage />;
      case "family_chat": return <FamilyChatPage />;
      case "global_chat": return <GlobalChatPage />;
      case "trade_chat": return <TradeChatPage />;
      case "lfg": return <LFGPage />;
      // Leaderboards
      case "lb_level": return <LeaderboardPage title="Level Leaderboard" icon="📊" />;
      case "lb_money": return <LeaderboardPage title="Money Leaderboard" icon="💰" />;
      case "lb_kills": return <LeaderboardPage title="Kill Leaderboard" icon="💀" />;
      case "lb_crimes": return <LeaderboardPage title="Crime Leaderboard" icon="🔥" />;
      case "lb_crew": return <LeaderboardPage title="Crew Leaderboard" icon="🤝" />;
      case "lb_family": return <LeaderboardPage title="Family Leaderboard" icon="👨‍👩‍👦" />;
      case "lb_territory": return <LeaderboardPage title="Territory Leaderboard" icon="📍" />;
      case "lb_gambling": return <LeaderboardPage title="Gambling Leaderboard" icon="🎲" />;
      case "lb_missions": return <LeaderboardPage title="Mission Leaderboard" icon="🎯" />;
      case "lb_season": return <LeaderboardPage title="Season Leaderboard" icon="🗓️" />;
      // Mystery boxes
      case "box_standard": return <StandardBoxPage />;
      case "box_premium": return <PremiumBoxPage />;
      case "box_legendary": return <LegendaryBoxPage />;
      case "box_seasonal": return <SeasonalBoxPage />;
      case "box_crime": return <CrimeBoxPage />;
      case "box_combat": return <CombatBoxPage />;
      case "box_guaranteed": return <GuaranteedBoxPage />;
      case "box_limited": return <LimitedBoxPage />;
      // Ghost mode
      case "ghost_status": return <GhostStatusPage />;
      case "ghost_history": return <GhostHistoryPage />;
      // Secret challenges
      case "secret_daily": return <SecretDailyPage />;
      case "secret_weekly": return <SecretWeeklyPage />;
      case "secret_achievements": return <SecretAchievementsPage />;
      case "secret_eggs": return <SecretEasterEggsPage />;
      case "secret_crime": return <SecretCrimePage />;
      // Community
      case "community": return <CommunityPage />;
      case "reports": return <ReportsPage />;
      // Other
      case "city_overview": return <CityOverviewPage />;
      case "fbi_status": return <FBIStatusPage />;
      case "statistics": return <StatisticsPage />;
      case "world_map": return <WorldMapPage />;
      case "messages": return <MessagesPage />;
      case "inbox": return <InboxPage />;
      case "notifications_page": return <NotificationsPage />;
      case "forum_general": return <ForumPage forum="general" />;
      case "forum_sales": return <ForumPage forum="sales" />;
      case "forum_offtopic": return <ForumPage forum="offtopic" />;
      case "forum_shadows": return <ForumPage forum="shadows" />;
      case "forum_search": return <ForumSearchPage />;
      case "airport": return <AirportPage />;
      case "weather": return <WeatherPage />;
      case "news_ticker": return <NewsTickerPage />;
      case "world_events": return <EventsPage />;
      case "faq": return <FAQPage />;
      case "support": return <SupportPage />;
      case "admin_panel": return <AdminPanel />;
      case "become_admin": return <BecomeAdminPage />;
      case "online_players": return <OnlineList />;
      case "advanced_features": return <AdvancedFeaturesPage />;

            // Combat
      case "arena": return <CombatOverviewPage />;
      case "help": return <WorkingHub title="Help Center" icon="❓" tabs={getHubTabs("help")} navigate={setPage} />;
      case "server_events": return <WorkingHub title="Server Events" icon="⚡" tabs={getHubTabs("server_events")} navigate={setPage} />;
      case "seasonal": return <WorkingHub title="Seasonal Events" icon="🎆" tabs={getHubTabs("seasonal")} navigate={setPage} />;
      case "quickinfo": return <WorkingHub title="Quick Info" icon="🗺️" tabs={getHubTabs("quickinfo")} navigate={setPage} />;
      case "chats": return <WorkingHub title="Chats" icon="💬" tabs={getHubTabs("chats")} navigate={setPage} />;
      case "forums": return <WorkingHub title="Forums" icon="📢" tabs={getHubTabs("forums")} navigate={setPage} />;
      case "special": return <WorkingHub title="Special" icon="👻" tabs={getHubTabs("special")} navigate={setPage} />;
      case "progression": return <WorkingHub title="Progression" icon="🧠" tabs={getHubTabs("progression")} navigate={setPage} />;
      case "social": return <WorkingHub title="Social" icon="🤝" tabs={getHubTabs("social")} navigate={setPage} />;
      case "assets": return <WorkingHub title="Assets" icon="📦" tabs={getHubTabs("assets")} navigate={setPage} />;
      case "economy": return <WorkingHub title="Economy" icon="💰" tabs={getHubTabs("economy")} navigate={setPage} />;
      case "underworld_hub": return <WorkingHub title="Underworld" icon="🔍" tabs={getHubTabs("underworld")} navigate={setPage} />;
      case "empire_hub": return <WorkingHub title="Empire" icon="🏗️" tabs={getHubTabs("empire")} navigate={setPage} />;
      case "power_hub": return <WorkingHub title="Power" icon="⚔️" tabs={getHubTabs("power")} navigate={setPage} />;
      case "world_hub": return <WorkingHub title="World" icon="🌍" tabs={getHubTabs("world")} navigate={setPage} />;
      case "companies_hub": return <CompaniesHubPage />;
      
      
      
      
      
      
      
      
      
      
      
      case "duel_1v1": return <Duel1v1Page />;
      case "crew_wars": return <CrewWarsPage />;
      case "ctf": return <CTFPage />;
      case "koth": return <KOTHPage />;
      case "battle_royale": return <BattleRoyalePage />;
      case "ladder": return <LadderPage />;
      case "champion": return <ChampionPage />;
      case "ambush": return <AmbushPage />;
      // Gambling new
      case "poker_texas": return <PokerTexasPage />;
      case "poker_omaha": return <PokerOmahaPage />;
      case "craps": return <CrapsPage />;
      case "powerball": return <PowerballPage />;
      case "coin_flip": return <CoinFlipPage />;
      case "wheel": return <WheelPage />;
      case "horse_racing": return <HorseRacingPage />;
      case "scratch_cards": return <ScratchCardsPage />;
      case "bingo": return <BingoPage />;
      case "keno": return <KenoPage />;
      case "higher_lower": return <HigherLowerPage />;
      case "bj_switch": return <BJSwitchPage />;
      // Economy
      case "bank_account": return <BankAccountPage />;
      case "bank_robbery": return <BankRobberyPage />;
      case "interest_rates": return <InterestRatesPage />;
      case "credit_score": return <CreditScorePage />;
      case "health_insurance": return <HealthInsurancePage />;
      case "life_insurance": return <LifeInsurancePage />;
      case "crypto_trading": return <CryptoTradingPage />;
      case "auto_shop": return <AutoShopPage />;
      case "offshore": return <OffshorePage />;
      case "daily_spin": return <DailySpinPage />;
      case "referral": return <ReferralPage />;
      case "season_rewards": return <SeasonRewardsPage />;
      case "battle_pass": return <BattlePassPage />;
      // Social
      case "crew_ranks": return <CrewRanksPage />;
      case "crew_chat": return <CrewChatPage />;
      case "crew_bank": return <CrewBankPage />;
      case "crew_safehouse": return <CrewSafehousePage />;
      case "crew_war": return <CrewWarPage />;
      case "crew_alliance": return <CrewAlliancePage />;
      case "crew_territory": return <CrewTerritoryPage />;
      case "crew_challenges": return <CrewChallengesPage />;
      case "crew_leaderboard": return <CrewLeaderboardPage />;
      // World
      case "city_map": return <CityMapPage />;
      case "neighborhoods": return <NeighborhoodsPage />;
      case "slums": return <SlumsPage />;
      case "seasons": return <SeasonsPage />;
      case "city_stats": return <CityStatsPage />;
      // Progression
      case "combat_skills": return <CombatSkillsPage />;
      case "stealth_skills": return <StealthSkillsPage />;
      case "hacking_skills": return <HackingSkillsPage />;
      case "prestige_shop": return <PrestigeShopPage />;
      case "season_rewards_prog": return <SeasonRewardsProgPage />;
      case "energy_drinks": return <EnergyDrinksPage />;
      // Missions
      case "storyline": return <StorylinePage />;
      case "side_missions": return <SideMissionsPage />;
      case "daily_missions": return <DailyMissionsPage />;
      case "weekly_missions": return <WeeklyMissionsPage />;
      case "monthly_missions": return <MonthlyMissionsPage />;
      // Crime subcategories
      case "robbery": return <CrimeCategoryPage categoryId="robbery" />;
      case "fraud": return <CrimeCategoryPage categoryId="fraud" />;
      case "burglary": return <CrimeCategoryPage categoryId="burglary" />;
      case "drugs": return <CrimeCategoryPage categoryId="drugs" />;
      case "organized": return <CrimeCategoryPage categoryId="organized" />;
      // case "fraud" handled above
      case "transport": return <CrimeCategoryPage categoryId="street" />;
      // NEW SYSTEM PAGES
      case "witness_system": return <WitnessSystemPage />;
      case "forensics_lab": return <ForensicsLabPage />;
      case "court_system": return <CourtSystemPage />;
      case "crime_scene": return <CrimeScenePage />;
      case "spy_network": return <SpyNetworkPage />;
      case "informants": return <InformantPage />;
      case "property_empire": return <PropertyEmpirePage />;
      case "vehicle_system": return <VehicleSystemPage />;
      case "business_mgmt": return <BusinessManagementPage />;
      case "underworld_econ": return <UnderworldEconomyPage />;
      case "market_system": return <MarketSystemPage />;
      case "faction_warfare": return <FactionWarfarePage />;
      case "advanced_combat": return <AdvancedCombatPage />;
      case "advanced_crafting": return <AdvancedCraftingPage />;
      case "pet_system": return <PetSystemPage />;
      case "day_night": return <DayNightPage />;
      case "world_events_dyn": return <DynamicWorldEventsPage />;
      case "reputation_influence": return <ReputationInfluencePage />;
      case "coop_gameplay": return <CoopGameplayPage />;
      case "empire_building": return <EmpireBuildingPage />;
      case "relationships": return <RelationshipsPage />;
      case "survival": return <SurvivalRealismPage />;
      case "security": return <SecurityDefensePage />;
      default: return <HeadquartersPage />;
    }
  };

  const inPrison = player?.inPrison;

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.08_0.015_35)]">
      {/* Level Up Modal */}
      <AnimatePresence>
        {player?.levelUpPending && dismissedAtLevel !== (player.level ?? 0) + 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
              className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-2 border-yellow-400/50 rounded-2xl p-8 text-center max-w-sm mx-4">
              <div className="text-6xl mb-3">🎉</div>
              <div className="text-xs text-yellow-300/60 tracking-widest mb-1">LEVEL UP!</div>
              <div className="text-4xl font-black text-yellow-300">Level {(player.level ?? 1) + 1}</div>
              <div className="text-xs text-yellow-200/60 mt-3 space-y-1">
                <div>+10 ATK | +10 DEF | +75 HP | +1 Skill Point</div>
              </div>
              <button onClick={() => {
                setDismissedAtLevel((player.level ?? 0) + 1);
                try { acknowledgeLevelUp({}); } catch {}
              }} className="mt-6 px-8 py-3 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition">
                CONTINUE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prison Banner */}
      {inPrison && (
        <div className="bg-red-900/30 border-b border-red-500/30 px-4 py-2 text-center text-xs text-red-400 font-bold">
          🔒 IN PRISON — Sentence in progress...
        </div>
      )}

      {/* Event Status Banner */}
      {activeEvents.length > 0 && (
        <div className="relative overflow-hidden border-b border-primary/20" style={{background: "linear-gradient(90deg, oklch(0.12 0.03 30), oklch(0.14 0.03 45), oklch(0.12 0.03 30))"}}>
          <style>{`
            @keyframes event-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
            @keyframes event-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
            @keyframes event-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
          `}</style>
          <div className="py-1.5 flex items-center gap-4 whitespace-nowrap" style={{animation: "event-scroll 30s linear infinite"}}>
            {[...(activeEvents ?? []), ...(activeEvents ?? [])].map((evtId, i) => {
              const evtData = ALL_GAME_EVENTS.find(ev => ev.id === evtId);
              const e = evtData
                ? { name: evtData.name, icon: evtData.icon, color: evtData.color }
                : { name: evtId, icon: "\u{1F38A}", color: "#f59e0b" };
              return (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold shrink-0" style={{color: e.color, background: `${e.color}15`, border: `1px solid ${e.color}30`}}>
                  <span style={{animation: "event-pulse 1.5s ease-in-out infinite"}}>{e.icon}</span>
                  <span>{e.name}</span>
                  <span className="text-[9px] opacity-60">LIVE</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Menu */}
        {showLeft && (
          <aside className={`${["crimes","robbery","fraud","burglary","drugs","organized","underground","steal_from_house","gta_car_theft","kill","hit_list"].includes(activePage) ? "w-48" : "w-64"} bg-[oklch(0.07_0.015_35)] border-r border-border/50 overflow-y-auto shrink-0 hidden md:block transition-all`}>
            <div className="p-3 space-y-1">
                            {getLeftMenuSections(t).map(section => (
                <div key={section.title}>
                  <button onClick={() => setLeftExpanded(prev => prev.includes(section.title) ? prev.filter(t => t !== section.title) : [...prev, section.title])}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition">
                    <div className="flex items-center gap-2">
                      <section.icon className="size-3.5" />
                      <span>{section.title}</span>
                    </div>
                    {leftExpanded.includes(section.title) ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  </button>
                  {leftExpanded.includes(section.title) && (
                    <div className="ml-2 space-y-0.5">
                      {section.items.map(item => (
                        (item as any).children ? (
                          <div key={item.label}>
                            <button onClick={() => setLeftItemsExpanded((prev: string[]) => prev.includes(item.label) ? prev.filter((t: string) => t !== item.label) : [...prev, item.label])}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition text-muted-foreground hover:text-foreground hover:bg-white/5">
                              <span className="text-xs">{item.icon}</span>
                              <span className="flex-1 text-left truncate">{item.label}</span>
                              {leftItemsExpanded.includes(item.label) ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
                            </button>
                            {leftItemsExpanded.includes(item.label) && (
                              <div className="ml-4 space-y-0.5">
                                {(item as any).children.map((child: any) => (
                                  <button key={child.page} onClick={() => setPage(child.page)}
                                    className={`w-full flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] transition ${
                                      activePage === child.page ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}>
                                    <span className="text-[11px]">{child.icon}</span>
                                    <span>{child.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                        <button key={item.label} onClick={() => setPage(item.page || "")}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                            activePage === item.page ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}>
                          <span className="text-xs">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Middle Column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ═══════════ MAFIA TOP NAVIGATION ═══════════ */}
      <div className="relative border-b border-amber-900/20 shrink-0 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(12,6,3,0.98) 0%, rgba(8,4,2,0.98) 100%)" }}>
        {/* Animated mesh background */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,153,69,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(180,120,50,0.2) 0%, transparent 50%)" }} />
        
        <style>{`
          @keyframes nav-glow { 0%,100% { box-shadow: 0 0 10px var(--gc), inset 0 1px rgba(255,255,255,0.03); } 50% { box-shadow: 0 0 25px var(--gc), 0 0 50px var(--gc), inset 0 1px rgba(255,255,255,0.08); } }
          @keyframes nav-cd { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
          @keyframes nav-shine { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(300%) skewX(-15deg); } }
          @keyframes nav-breathe { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
          .nav-btn { --gc: rgba(212,153,69,0.15); position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); border: 1px solid rgba(255,255,255,0.06); }
          .nav-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 50%); pointer-events: none; }
          .nav-btn::after { content: ''; position: absolute; top: -50%; left: -100%; width: 40%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); transform: skewX(-15deg); transition: none; pointer-events: none; }
          .nav-btn:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 8px 25px var(--gc), 0 0 1px rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.12); }
          .nav-btn:hover::after { animation: nav-shine 0.5s ease-out; }
          .nav-btn:active { transform: translateY(-1px) scale(0.98); }
          .nav-btn.active { animation: nav-glow 2.5s ease-in-out infinite; border-color: rgba(212,153,69,0.4) !important; }
          .nav-btn.active::before { background: linear-gradient(180deg, rgba(212,153,69,0.12) 0%, rgba(212,153,69,0.03) 50%, transparent 100%); }
          .nav-btn.cd::after { content: ''; position: absolute; bottom: 0; left: 0; height: 2px; background: linear-gradient(90deg, #ef4444, #f97316, #ef4444); background-size: 200% 100%; animation: nav-cd 1s linear infinite; width: var(--cd-pct, 100%); top: auto; transform: none; }
          .nav-section { display: flex; align-items: center; gap: 5px; }
          .stat-pill { animation: nav-breathe 2s ease-in-out infinite; }
        `}</style>

        <div className="flex items-center px-3 py-2 relative z-10 gap-1 overflow-x-auto">
          {[
            { page: "crimes", label: t("nav.street"), icon: "🔪", gc: "#22c55e", bg: "linear-gradient(135deg, rgba(22,101,52,0.7) 0%, rgba(6,78,59,0.8) 100%)" },
            { page: "robbery", label: t("nav.robbery"), icon: "💰", gc: "#ef4444", bg: "linear-gradient(135deg, rgba(153,27,27,0.7) 0%, rgba(127,29,29,0.8) 100%)" },
            { page: "fraud", label: t("nav.fraud"), icon: "🎭", gc: "#eab308", bg: "linear-gradient(135deg, rgba(161,98,7,0.7) 0%, rgba(133,77,14,0.8) 100%)" },
            { page: "burglary", label: t("nav.burglary"), icon: "🏠", gc: "#f97316", bg: "linear-gradient(135deg, rgba(154,52,18,0.7) 0%, rgba(124,45,18,0.8) 100%)" },
            { page: "steal_from_house", label: t("nav.houses"), icon: "🔑", gc: "#f59e0b", bg: "linear-gradient(135deg, rgba(161,98,7,0.6) 0%, rgba(120,80,10,0.7) 100%)" },
            { page: "gta_car_theft", label: t("nav.gta"), icon: "🚗", gc: "#3b82f6", bg: "linear-gradient(135deg, rgba(30,64,175,0.7) 0%, rgba(29,78,216,0.8) 100%)" },
            { page: "drugs", label: t("nav.drugs"), icon: "💊", gc: "#a855f7", bg: "linear-gradient(135deg, rgba(107,33,168,0.7) 0%, rgba(88,28,135,0.8) 100%)" },
            { page: "organized", label: t("nav.organized"), icon: "🕵️", gc: "#06b6d4", bg: "linear-gradient(135deg, rgba(21,94,117,0.7) 0%, rgba(15,118,110,0.8) 100%)" },
            { page: "underground", label: t("nav.underground"), icon: "🕳️", gc: "#78716c", bg: "linear-gradient(135deg, rgba(68,64,60,0.7) 0%, rgba(41,37,36,0.8) 100%)" },
            { page: "kill", label: t("nav.murder"), icon: "💀", gc: "#f43f5e", bg: "linear-gradient(135deg, rgba(136,19,55,0.8) 0%, rgba(159,18,57,0.9) 100%)" },
            { page: "world_events", label: t("nav.events"), icon: "🎪", gc: "#f59e0b", bg: "linear-gradient(135deg, rgba(161,98,7,0.7) 0%, rgba(180,83,9,0.8) 100%)" },
            { page: "storyline", label: t("nav.story"), icon: "📖", gc: "#818cf8", bg: "linear-gradient(135deg, rgba(49,46,129,0.7) 0%, rgba(55,48,163,0.8) 100%)" },
            { page: "prison", label: t("nav.prison"), icon: "⛓️", gc: "#94a3b8", bg: "linear-gradient(135deg, rgba(51,65,85,0.7) 0%, rgba(30,41,59,0.8) 100%)" },
            { page: "hospital", label: t("nav.hospital"), icon: "🏥", gc: "#2dd4bf", bg: "linear-gradient(135deg, rgba(13,148,136,0.6) 0%, rgba(19,78,74,0.7) 100%)" },
          ].map(btn => {
            const cdEnd = (player as any)?.crimeCooldowns?.[btn.page] ?? 0;
            const cdLeft = cdEnd > Date.now() ? Math.ceil((cdEnd - Date.now()) / 1000) : 0;
            return (
              <button key={btn.page} onClick={() => setPage(btn.page)}
                className={`nav-btn px-3 py-1.5 rounded-lg text-[11px] font-bold text-white/90 whitespace-nowrap ${activePage === btn.page ? "active" : ""} ${cdLeft > 0 ? "cd opacity-60" : ""}`}
                style={{ background: btn.bg, "--gc": btn.gc + "30" } as any}>
                <span className="relative z-10 flex items-center gap-1">
                  <span className="text-xs">{btn.icon}</span>
                  <span>{btn.label}</span>
                </span>
                {cdLeft > 0 && <span className="relative z-10 ml-1 text-[8px] opacity-70 font-mono">{cdLeft}s</span>}
              </button>
            );
          })}


        </div>
      </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <ErrorBoundary key={activePage}>
              {renderPage()}
            </ErrorBoundary>
          </main>
        </div>

        {/* Right Menu */}
        {showRight && (
          <aside className={`${["crimes","robbery","fraud","burglary","drugs","organized","underground","steal_from_house","gta_car_theft","kill","hit_list"].includes(activePage) ? "w-44" : "w-64"} bg-[oklch(0.07_0.015_35)] border-l border-border/50 overflow-y-auto shrink-0 hidden lg:block transition-all`}>
            <div className="p-3 space-y-3">
              {/* Status Panel */}
              {player && (
                <div className="space-y-2">
                  {/* Username + Rank */}
                  <div className="px-2 text-center mb-1">
                    <div className="text-sm font-black text-primary truncate">{player.nickname || player.username || "Unknown"}</div>
                    <div className="text-[10px] text-muted-foreground"><RankBadge level={player.level ?? 1} /> <span className="text-yellow-400 font-bold">Lv.{player.level ?? 1}</span></div>
                  </div>
                  {/* Life Bar */}
                  <div className="px-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-red-400 font-bold">❤️ Life</span>
                      <span className="text-muted-foreground">{player.life}/{player.maxLife}</span>
                    </div>
                    <div className="h-2.5 bg-[oklch(0.14_0.012_35)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full transition-all"
                        style={{ width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%` }} />
                    </div>
                  </div>
                  {/* RANK BAR */}
                  <div className="px-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-yellow-400 font-bold">⭐ {getRank(player.level ?? 1)} Lv.{player.level ?? 1}</span>
                      <span className="text-muted-foreground">{player.experience ?? 0}/{xpNeeded} XP</span>
                    </div>
                    <style>{`
                      @keyframes rankbar-shimmer { 0% { background-position: -200% 50%; } 100% { background-position: 200% 50%; } }
                      @keyframes rankbar-glow { 0%,100% { box-shadow: 0 0 4px rgba(250,204,21,0.3); } 50% { box-shadow: 0 0 14px rgba(250,204,21,0.7); } }
                    `}</style>
                    <div className="relative w-full h-4 bg-[oklch(0.14_0.012_35)] rounded-full overflow-hidden border border-yellow-500/20">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(xpPercent, (player.experience ?? 0) > 0 ? 3 : 0)}%`,
                          background: "linear-gradient(90deg, #b45309, #f59e0b, #fbbf24, #f59e0b, #b45309)",
                          backgroundSize: "200% 100%",
                          animation: "rankbar-shimmer 2.5s linear infinite, rankbar-glow 2s ease-in-out infinite",
                        }} />
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white/90 drop-shadow">
                        {xpPercent >= 100 ? "LEVEL UP!" : `${xpPercent.toFixed(0)}%`}
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 text-center">Next rank: {getRank((player.level ?? 1) + 1)}</div>
                  </div>
                  {/* Stats Grid */}
                  <div className="px-2 grid grid-cols-2 gap-1.5">
                    <div className="mafia-card rounded p-1.5 text-center">
                      <div className="text-[9px] text-muted-foreground">💰 Cash</div>
                      <div className="text-[11px] font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="mafia-card rounded p-1.5 text-center">
                      <div className="text-[9px] text-muted-foreground">🏆 Points</div>
                      <div className="text-[11px] font-bold text-yellow-400">{(player.points ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="mafia-card rounded p-1.5 text-center">
                      <div className="text-[9px] text-muted-foreground">🌍 Rep</div>
                      <div className="text-[11px] font-bold text-purple-400">{(player.reputation ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="mafia-card rounded p-1.5 text-center">
                      <div className="text-[9px] text-muted-foreground">⚔️ ATK</div>
                      <div className="text-[11px] font-bold text-red-400">{(player.attack ?? 0) + 10}</div>
                    </div>
                    <div className="mafia-card rounded p-1.5 text-center">
                      <div className="text-[9px] text-muted-foreground">🛡️ DEF</div>
                      <div className="text-[11px] font-bold text-blue-400">{(player.defense ?? 0) + 10}</div>
                    </div>
                    <div className="mafia-card rounded p-1.5 text-center">
                      <div className="text-[9px] text-muted-foreground">💀 Kills</div>
                      <div className="text-[11px] font-bold text-orange-400">{player.kills ?? 0}</div>
                    </div>
                  </div>
                  {/* Points under Kills */}
                  <div className="px-2">
                    <div className="mafia-card rounded-lg p-2 text-center border border-yellow-700/30">
                      <div className="text-[10px] text-muted-foreground">🏆 Points</div>
                      <div className="text-base font-bold text-yellow-400 animate-money-text">{(player.points ?? 0).toLocaleString()}</div>
                    </div>
                  </div>
                  {/* Energy Drink Status — Mixed Animated Colors */}
                  {((player as any).energyDrinkUntil ?? 0) > Date.now() && (() => {
                    const remainingMs = (player as any).energyDrinkUntil - Date.now();
                    const remaining = Math.max(0, Math.floor(remainingMs / 60000));
                    const hrs = Math.floor(remaining / 60);
                    const mins = remaining % 60;
                    return (
                      <div className="px-2">
                        <style>{`
                          @keyframes energy-mix-pulse { 0% { box-shadow: 0 0 8px rgba(255,165,0,0.4), 0 0 20px rgba(255,100,0,0.2), inset 0 0 8px rgba(255,200,50,0.1); border-color: rgba(255,165,0,0.5); } 50% { box-shadow: 0 0 16px rgba(0,255,200,0.8), 0 0 40px rgba(255,50,100,0.4), 0 0 60px rgba(100,255,200,0.1), inset 0 0 16px rgba(200,255,0,0.2); border-color: rgba(0,255,200,0.9); } }
                          @keyframes energy-mix-text { 0% { text-shadow: 0 0 6px rgba(255,200,50,0.6), 0 0 12px rgba(255,100,0,0.3); } 50% { text-shadow: 0 0 12px rgba(0,255,200,1), 0 0 24px rgba(255,50,100,0.6), 0 0 48px rgba(100,255,200,0.3); } }
                          @keyframes energy-mix-bar { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                          .energy-mix-active { animation: energy-mix-pulse 2s ease-in-out infinite; }
                          .energy-mix-text { animation: energy-mix-text 1.5s ease-in-out infinite; }
                          .energy-mix-bar { background: linear-gradient(90deg, #ff6400, #00ffc8, #ff3264, #64ff64, #ffaa32, #3264ff); background-size: 200% 100%; animation: energy-mix-bar 2s linear infinite; }
                        `}</style>
                        <div className="rounded-lg p-2.5 text-center border-2 energy-mix-active bg-gradient-to-br from-orange-950/40 via-emerald-950/30 to-pink-950/40">
                          <div className="energy-mix-text text-[11px] font-black text-orange-400">🥤 ENERGY RUSH ACTIVE</div>
                          <div className="h-1.5 rounded-full mt-1.5 overflow-hidden bg-black/40">
                            <div className="h-full rounded-full energy-mix-bar" style={{ width: `${Math.max(5, remaining / Math.max(1, hrs * 60 + mins) * 100)}%` }} />
                          </div>
                          <div className="text-[10px] font-bold text-emerald-400 energy-mix-text mt-1">+25% XP • {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`} left</div>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Active Boosts under Points */}
                  <div className="px-2 space-y-1">
                    {(player?.wantedLevel ?? 0) > 0 && (
                      <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-red-900/60 to-red-950/60 border border-red-500/30 text-red-400 flex items-center gap-1">
                        <span className="text-xs animate-pulse">🔴</span>
                        <span>WANTED {player.wantedLevel}</span>
                      </div>
                    )}
                    {(player as any)?.xpBoostUntil > Date.now() && (
                      <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-cyan-900/50 to-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center gap-1">
                        <span className="text-xs">⚡</span> 3x XP
                      </div>
                    )}
                    {(player as any)?.cashBoostUntil > Date.now() && (
                      <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-emerald-900/50 to-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <span className="text-xs">💰</span> 3x Cash
                      </div>
                    )}
                    {(player as any)?.energyDrinkUntil > Date.now() && (
                      <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-orange-900/50 to-orange-950/50 border border-orange-500/30 text-orange-400 flex items-center gap-1">
                        <span className="text-xs">🥤</span> Energy
                      </div>
                    )}
                    {(player as any)?.rankBoostUntil > Date.now() && (
                      <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-yellow-900/50 to-yellow-950/50 border border-yellow-500/30 text-yellow-400 flex items-center gap-1">
                        <span className="text-xs">🚀</span> Rank
                      </div>
                    )}
                  </div>

                  {/* Active Rank Booster — Neon Animated Status */}
                  {((player as any).rankBoostUntil ?? 0) > Date.now() && (() => {
                    const remainingMs = (player as any).rankBoostUntil - Date.now();
                    const remaining = Math.max(0, Math.floor(remainingMs / 60000));
                    const hrs = Math.floor(remaining / 60);
                    const mins = remaining % 60;
                    return (
                      <div className="px-2">
                        <style>{`
                          @keyframes neon-rank-pulse { 0%,100% { box-shadow: 0 0 8px rgba(0,255,136,0.4), 0 0 20px rgba(0,255,136,0.2), inset 0 0 8px rgba(0,255,136,0.1); border-color: rgba(0,255,136,0.5); } 50% { box-shadow: 0 0 16px rgba(0,255,136,0.8), 0 0 40px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.1), inset 0 0 16px rgba(0,255,136,0.2); border-color: rgba(0,255,136,0.9); } }
                          @keyframes neon-rank-text { 0%,100% { text-shadow: 0 0 6px rgba(0,255,136,0.6), 0 0 12px rgba(0,255,136,0.3); } 50% { text-shadow: 0 0 12px rgba(0,255,136,1), 0 0 24px rgba(0,255,136,0.6), 0 0 48px rgba(0,255,136,0.3); } }
                          @keyframes neon-rank-bar { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                          .neon-rank-active { animation: neon-rank-pulse 2s ease-in-out infinite; }
                          .neon-rank-text { animation: neon-rank-text 1.5s ease-in-out infinite; }
                          .neon-rank-bar { background: linear-gradient(90deg, #00ff88, #00ccff, #8b5cf6, #00ccff, #00ff88); background-size: 200% 100%; animation: neon-rank-bar 2s linear infinite; }
                        `}</style>
                        <div className="rounded-lg p-2.5 text-center border-2 neon-rank-active bg-gradient-to-br from-emerald-950/40 via-cyan-950/30 to-violet-950/40">
                          <div className="neon-rank-text text-[11px] font-black text-emerald-400">🚀 RANK BOOST ACTIVE</div>
                          <div className="h-1.5 rounded-full mt-1.5 overflow-hidden bg-black/40">
                            <div className="h-full rounded-full neon-rank-bar" style={{ width: `${Math.max(5, (remaining / Math.max(1, hrs * 60 + mins)) * 100)}%` }} />
                          </div>
                          <div className="text-[10px] font-bold text-cyan-400 neon-rank-text mt-1">+50% XP • {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`} left</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Info */}
                  {/* Firearms & Ammo */}
                  {(() => {
                    try {
                      const permit = JSON.parse(localStorage.getItem("empirePermit") || "0");
                      if (permit === 0) return null;
                      const armorDur = JSON.parse(localStorage.getItem("empireArmor") || "0");
                      const lockpickLv = JSON.parse(localStorage.getItem("empireLockpick") || "0");
                      return (
                        <div className="px-2">
                          <div className="mafia-card rounded-lg p-2 border border-amber-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-300">🔫 Firearms</span>
                              <span className="text-[9px] text-green-400 font-bold">
                                {permit === 1 ? "Basic" : permit === 2 ? "Advanced" : permit === 3 ? "Class III" : "FFL"} Permit
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="text-center p-1 bg-slate-800/30 rounded">
                                <div className="text-[9px] text-slate-500">🔫 Guns</div>
                                <div className="text-[10px] font-bold text-red-400">{permit}+</div>
                              </div>
                              <div className="text-center p-1 bg-slate-800/30 rounded">
                                <div className="text-[9px] text-slate-500">💀 Bullets</div>
                                <div className="text-[10px] font-bold text-orange-400">&#8734;</div>
                              </div>
                              <div className="text-center p-1 bg-slate-800/30 rounded">
                                <div className="text-[9px] text-slate-500">🦺 Armor</div>
                                <div className={`text-[10px] font-bold ${armorDur > 50 ? "text-green-400" : armorDur > 20 ? "text-yellow-400" : "text-red-400"}`}>{armorDur}%</div>
                              </div>
                              <div className="text-center p-1 bg-slate-800/30 rounded">
                                <div className="text-[9px] text-slate-500">🔑 Lockpick</div>
                                <div className="text-[10px] font-bold text-amber-400">Lv.{Math.min(10, lockpickLv)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } catch { return null; }
                  })()}
                </div>
              )}

              {/* Right Menu Sections */}
              {getRightMenuSections(t).map(section => (
                <div key={section.title}>
                  <button onClick={() => setRightExpanded(prev => prev.includes(section.title) ? prev.filter(t => t !== section.title) : [...prev, section.title])}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition">
                    <div className="flex items-center gap-2">
                      <section.icon className="size-3.5" />
                      <span>{section.title}</span>
                    </div>
                    {rightExpanded.includes(section.title) ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  </button>
                  {rightExpanded.includes(section.title) && (
                    <div className="ml-2 space-y-0.5">
                      {section.items.map(item => (
                        (item as any).children ? (
                          <div key={item.label}>
                            <button onClick={() => setRightItemsExpanded((prev: string[]) => prev.includes(item.label) ? prev.filter((t: string) => t !== item.label) : [...prev, item.label])}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition text-muted-foreground hover:text-foreground hover:bg-white/5">
                              <span className="text-xs">{item.icon}</span>
                              <span className="flex-1 text-left truncate">{item.label}</span>
                              {rightItemsExpanded.includes(item.label) ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
                            </button>
                            {rightItemsExpanded.includes(item.label) && (
                              <div className="ml-4 space-y-0.5">
                                {(item as any).children.map((child: any) => (
                                  <button key={child.page} onClick={() => setPage(child.page)}
                                    className={`w-full flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] transition ${
                                      activePage === child.page ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}>
                                    <span className="text-[11px]">{child.icon}</span>
                                    <span>{child.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                        <button key={item.label} onClick={() => setPage(item.page || "")}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                            activePage === item.page ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}>
                          <span className="text-xs">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-[oklch(0.06_0.015_35)] border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-4">
          <span>{player?.nickname || "Unknown"}</span>
          <span><RankBadge level={player?.level ?? 1} /> Lv.{player?.level ?? 1}</span>
          <span>${(player?.money ?? 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <LogoDropdown />
        </div>
      </div>
    </div>
  );
}

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

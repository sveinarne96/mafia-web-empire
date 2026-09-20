import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { StreetCrimesPage as MegaStreetCrimes, BigHeistsPage, OddJobsPage, SocialHubPage, FrontsHubPage, ViceDenPage, CityDeskPage } from "../components/MegaPackPages";
import Actions500Page from "@/components/Actions500Page";
import PresencePage from "@/components/PresencePage";
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
// Heavy leaf pages are lazy-loaded into their own chunks — keeps the main
// bundle small and the platform build under its memory cap.
const SeasonPassPage = lazy(() => import("@/components/SeasonPass").then((m) => ({      default: m.SeasonPassPage })));
const SeasonStorePanel = lazy(() => import("@/components/SeasonStorePanel").then((m) => ({      default: m.SeasonStorePanel })));
const DailyRewardGame = lazy(() => import("@/components/SeasonStorePanel").then((m) => ({      default: m.DailyRewardGame })));
const OcFloatingCrew = lazy(() => import("@/components/OcFloatingCrew").then((m) => ({      default: m.OcFloatingCrew })));
import { LogoDropdown } from "@/components/LogoDropdown";
import { StealFromHousePage, GtaCarTheftPage } from "@/components/GameEnhanced";
import { BodyguardsPage } from "@/components/BodyguardsPage";
import { PacksOverviewPanel, PerksPanel } from "@/components/PacksPerksPanel";
import { RanksPanel } from "@/components/RanksPanel";
const HeistPage = lazy(() => import("@/components/HeistPage").then((m) => ({      default: m.HeistPage })));
import { PromoBanner } from "@/components/PromoBanner";
import { LiveGameBanner } from "@/components/LiveGameBanner";
import { WantedStatusPage } from "@/components/GameEnhanced";
import {
  FuelMarketPage,
  BusinessEmpirePage,
  PropertyFlipPage,
  StallMarketPage,
  EscrowTradePage,
  GamblingDebtsPage,
  CasinoTablesPage,
  RaceBettingPage,
  TreasureHuntPage,
  CarTuningPage,
  StreakRewardsPage,
  MilestonesBadgesPage,
  FamePage,
  VipLoungePage,
  FlashDealsPage,
  LotteryRolloverPage,
  BossInvasionPage,
  BugBountyPage,
  EconomyHeatmapPage,
} from "@/components/NewEmpirePages";
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
const FullMissionsPage = lazy(() => import("@/components/FullMissionsPage").then((m) => ({      default: m.FullMissionsPage })));
const GamblingOverviewPage = lazy(() => import("@/components/GamblingPages").then((m) => ({      default: m.GamblingOverviewPage })));
const CombatOverviewPage = lazy(() => import("@/components/CombatPages").then((m) => ({      default: m.CombatOverviewPage })));
// HubPages inlined below - no external import needed
import { WitnessStatementsPage, WitnessSystemPage, ForensicsLabPage, CourtSystemPage } from "@/components/SystemWitness";
import { SpyNetworkPage, InformantPage } from "@/components/SystemPrison";
const PrisonPage = lazy(() => import("@/components/PrisonPage").then((m) => ({      default: m.PrisonPage })));
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
import { ArenaHubPage, ChatHubPage, CrimeOpsHubPage, CrewHubPage, WorldHubPage, PropertyHubPage, DailyHubPage, MoneyHubPage, ReportsHubPage, SecretChallengesHubPage } from "@/components/HubPages";
import LiveEventCalendar from "@/components/LiveEventCalendar";
import { LiveSupportPage } from "@/components/LiveSupport";
import EventsHubPage from "@/components/EventsHub";

import { FamilyPage } from "@/components/FamilyPage";
import { ResourcesPanel } from "@/components/ResourcesPanel";
import { XPVolumePanel } from "@/components/XPVolumePanel";
import { CrimeSubBar, getCrimeByRoute } from "@/components/CrimeSubPages";
import { EmpireTopBar, CityPulsePanel } from "@/components/EmpireTopBar";
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
import { CommunityHubPage } from "@/components/CommunityHubPage";
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
  BusinessesPage, AuctionHousePage, InsurancePage, LoansPage,
} from "@/components/NewPages";
import {
  BankPage as FullBankPage, CrackSafePage, StockMarketPage,
  SupplyRunningPage, RealEstatePage, DeadAlivePage,
} from "@/components/WorldPages";
import { CarDealerPage } from "@/components/CarDealerPage";
import { RIGHT_MENU_SECTIONS, LEFT_MENU_SECTIONS } from "@/data/menuSections";
import { ObjectivesPage, PointStorePage, CoinStorePage, ObjectivesPanel } from "@/components/StorePages";
import { InventoryPage } from "@/components/InventoryPage";
import { PromoCodesPage } from "@/components/PromoCodesPage";
import { DrugTradePage } from "@/components/DrugTradePage";
import { QsMarketPage } from "@/components/QsMarketPage";
import { RecordKillsPage, RecordCrimesPage, RecordGtaPage, RecordPointsPage, RecordBulletsPage, RecordBustsPage, RecordStockPage, RecordBettingPage, RecordAssassinationPage, RecordPacksPage, RecordHeistsPage, RecordSupplyPage, RecordCasinoPage } from "@/components/GameRecords";
const casinoLazy = () => import("@/components/CasinoPages");
const CasinosPage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinosPage })));
const CasinoBlackjackPage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinoBlackjackPage })));
const CasinoDicePage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinoDicePage })));
const CasinoRoulettePage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinoRoulettePage })));
const CasinoRacetrackPage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinoRacetrackPage })));
const CasinoVideoPokerPage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinoVideoPokerPage })));
const CasinoScratchcardsPage = lazy(() => casinoLazy().then((m) => ({      default: m.CasinoScratchcardsPage })));
import { BettingSportsPage, BettingMultiDicePage, BettingPokerNightPage, BettingMpBlackjackPage, BettingLmsPage, BettingChampionsPage } from "@/components/BettingPages";
import { QuickTradePage } from "@/components/QuickTradePage";
import { OrganizedCrimeTeamsPage } from "@/components/OrganizedCrimeTeamsPage";
import { ArenaPage, TrainerPage, RangePage, RaceStakesPage, HotelPage, TipsyInformantPage } from "@/components/ArsenalPages";
import {
  DockPage, ChopShopPage, GraffitiPage, PawnPage, CabPage, DogsPage,
  NightMarketPage, CablePage, NumbersPage, ValetPage, BathhousePage, BillboardPage,
} from "@/components/ExpansionPages";
import { RacketsHubPage } from "@/components/RacketsHub";
import { ArmouryPage } from "@/components/ArmouryPage";
import { DemolitionDerbyPage } from "@/components/DemolitionDerbyPage";
import { BoxingGymPage, ChasePage, ScrapyardPage, VaultPage } from "@/components/CrimeExtras";
import { AssassinatePage, BulletCalculatorPage, BulletFactoryPage, DetectivesPage, ShootingRangePage } from "@/components/MurderExtras";


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
const AVATAR_GRADIENTS: Record<string, string> = {
  aurora_outline: 'linear-gradient(135deg, #22d3ee, #a855f7, #22d3ee)',
  inferno_outline: 'linear-gradient(135deg, #f97316, #ef4444, #f97316)',
  royal_outline: 'linear-gradient(135deg, #facc15, #f59e0b, #facc15)',
  toxic_outline: 'linear-gradient(135deg, #a3e635, #14b8a6, #a3e635)',
};

/* Global navigation bridge: lets deeply-rendered HQ panels navigate without
   prop-drilling through the renderPage switch. */
let __hqNavigate: ((page: string) => void) | null = null;
export function setHqNavigate(fn: (page: string) => void) { __hqNavigate = fn; }
function navigateToPage(page: string) { __hqNavigate?.(page); }

function HeadquartersPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const player = useQuery(api.game.getPlayer);
  useEffect(() => {
    const labels: Record<string, string> = {
      daily_rewards: "Daily Reward",
      online_players: "Online Players",
    };
    setHqNavigate((page) => {
      if (onNavigate) {
        onNavigate(page);
        return;
      }
      const target = labels[page];
      if (!target) return;
      const findButton = () => Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.trim().includes(target));
      const button = findButton();
      if (button) {
        button.click();
        return;
      }
      const overview = Array.from(document.querySelectorAll("button")).find((candidate) => candidate.textContent?.trim() === "Overview");
      if (overview) {
        overview.click();
        window.setTimeout(() => findButton()?.click(), 0);
      }
    });
    return () => setHqNavigate(() => undefined);
  }, [onNavigate]);
  if (player === undefined) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  if (!player) return <div className="text-center py-8 text-muted-foreground"><div className="text-3xl mb-2">🎮</div><div className="text-sm font-bold mb-1">Welcome to Shadow Empire</div><div className="text-xs">Setting up your headquarters...</div></div>;
  const xpNeeded = 2000;
  const xpPercent = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);
  const lifePercent = Math.min(100, ((player.life ?? 0) / (player.maxLife ?? 100)) * 100);
  const energy = Math.min(100, Math.max(0, ((player as any).energy ?? 100)));
  const perks = ((player as any).perks ?? {}) as Record<string, number>;
  const perkEntries = Object.entries(perks).filter(([, v]) => v > 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20" style={{ background: 'linear-gradient(135deg, rgba(20,10,5,0.9), rgba(40,20,10,0.8), rgba(20,10,5,0.9))' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
              <Home className="size-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-300">Headquarters</h2>
              <div className="text-[10px] text-amber-400/60">Shadow Empire Command Center</div>
            </div>
            <div className="ml-auto px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="text-[9px] text-green-400 font-bold">🟢 ONLINE</div>
            </div>
          </div>
          {/* Player Identity Row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xl font-black text-amber-200">{player.nickname || player.username || "Shadow Agent"}</div>
              <div className="text-xs text-amber-400/70">Level {player.level ?? 1} · {getRank(player.level ?? 1)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-amber-400/60">LOCATION</div>
              <div className="text-xs font-bold text-amber-300">📍 {player.location ?? "New York"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">💰</span><span className="text-[10px] text-muted-foreground uppercase">Cash</span></div>
          <div className="text-lg font-black text-green-400">${(player.money ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🏦</span><span className="text-[10px] text-muted-foreground uppercase">Bank</span></div>
          <div className="text-lg font-black text-blue-400">${(player.bank ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🏆</span><span className="text-[10px] text-muted-foreground uppercase">Points</span></div>
          <div className="text-lg font-black text-yellow-400">{(player.points ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🪙</span><span className="text-[10px] text-muted-foreground uppercase">Coins</span></div>
          <div className="text-lg font-black text-cyan-400">{(player.coins ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Life & XP Bars */}
      <div className="mafia-card rounded-xl p-4 space-y-3 border border-slate-700/30">
        <div>
          <div className="flex justify-between text-[10px] mb-1"><span className="text-red-400 font-bold">❤️ Life</span><span className="text-muted-foreground">{player.life ?? 0} / {player.maxLife ?? 100}</span></div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${lifePercent}%`, background: lifePercent > 50 ? 'linear-gradient(90deg, #ef4444, #f97316)' : lifePercent > 25 ? 'linear-gradient(90deg, #f97316, #eab308)' : 'linear-gradient(90deg, #dc2626, #991b1b)' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1"><span className="text-blue-400 font-bold">⭐ Experience</span><span className="text-muted-foreground">{player.experience ?? 0} / {xpNeeded} XP</span></div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">{xpPercent.toFixed(1)}% to next rank</div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1"><span className="text-orange-400 font-bold">⚡ Energy</span><span className="text-muted-foreground">{energy} / 100</span></div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${energy}%` }} />
          </div>
        </div>
      </div>

      {/* Combat Stats */}
      <div className="mafia-card rounded-xl p-4 border border-slate-700/30">
        <div className="text-sm font-bold mb-3">⚔️ Combat Stats</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-slate-900/50 rounded-xl">
            <div className="text-[10px] text-orange-400">⚔️ Attack</div>
            <div className="text-xl font-black text-orange-400">{player.attack ?? 0}</div>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-xl">
            <div className="text-[10px] text-blue-400">🛡️ Defense</div>
            <div className="text-xl font-black text-blue-400">{player.defense ?? 0}</div>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-xl">
            <div className="text-[10px] text-red-400">💀 Kills</div>
            <div className="text-xl font-black text-red-400">{(player as any).totalKills ?? 0}</div>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-xl">
            <div className="text-[10px] text-purple-400">🔪 Crimes</div>
            <div className="text-xl font-black text-purple-400">{(player as any).totalCrimes ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Active Perks */}
      {perkEntries.length > 0 && (
        <div className="mafia-card rounded-xl p-4 border border-purple-500/20">
          <div className="text-sm font-bold mb-2">⚡ Active Perks</div>
          <div className="flex flex-wrap gap-1.5">
            {perkEntries.map(([key, count]) => (
              <span key={key} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                {key}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute -right-10 -top-12 text-[150px] opacity-[0.035]">♛</div>
        <div className="relative mb-3 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-lg">⚡</div>
          <div>
            <div className="text-sm font-black tracking-wide text-amber-200">Command shortcuts</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500">Make your next move</div>
          </div>
          <span className="ml-auto rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-300">Live</span>
        </div>
        <div className="relative grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            { icon: "🔪", label: "Street Crime", hint: "Quick hits", page: "crime_street", color: "from-emerald-500/25 to-emerald-600/5 border-emerald-500/30 text-emerald-200" },
            { icon: "💰", label: "Robbery", hint: "High stakes", page: "crime_robbery", color: "from-red-500/25 to-red-600/5 border-red-500/30 text-red-200" },
            { icon: "🎰", label: "Casino", hint: "Play the odds", page: "casinos", color: "from-amber-500/25 to-amber-600/5 border-amber-500/30 text-amber-200" },
            { icon: "🛒", label: "Coin Store", hint: "Upgrade your empire", page: "coin_store", color: "from-cyan-500/25 to-cyan-600/5 border-cyan-500/30 text-cyan-200" },
          ].map((action) => (
            <button key={action.label} onClick={() => (onNavigate ?? navigateToPage)(action.page)} className={`group rounded-xl border bg-gradient-to-r p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:brightness-125 ${action.color}`}>
              <div className="flex items-center justify-between"><span className="text-2xl transition-transform duration-200 group-hover:scale-110">{action.icon}</span><ChevronRight className="size-3 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-90" /></div>
              <div className="mt-2 text-[10px] font-black">{action.label}</div>
              <div className="mt-0.5 text-[8px] text-slate-500">{action.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <ObjectivesPanel />
      <RanksPanel />
      <PacksOverviewPanel />
      <PerksPanel />
      <CityPulsePanel />
      <OverviewQuickPanel onNavigate={onNavigate ?? navigateToPage} />
    </div>
  );
}

/* ═══════════ OVERVIEW QUICK PANEL ═══════════
   Announcements · Daily Reward · Find User · Online Players · Notepad ·
   Polls · Player Guide · Suggestions · Updates — all reachable from HQ. */
function OverviewQuickPanel({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const nav = onNavigate ?? navigateToPage;
  const announcements = useQuery(api.gameControl.getLiveConfig);
  const updates = useQuery(api.gameUpdates.getUpdates);
  const onlineCount = useQuery(api.admin.getOnlineCount);
  const roster = useQuery(api.statistics.getPresenceRoster);
  const [note, setNote] = useState(() => { try { return localStorage.getItem("empireNotepad") ?? ""; } catch { return ""; } });
  const [noteSaved, setNoteSaved] = useState(false);
  const [pollChoice, setPollChoice] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const allPlayers = useQuery(api.admin.getAllPlayers);

  const saveNote = () => {
    try { localStorage.setItem("empireNotepad", note); } catch {}
    setNoteSaved(true); setTimeout(() => setNoteSaved(false), 1500);
  };

  const pollOptions = [
    { id: "crime", label: "🔪 More street crime variety", votes: 42 },
    { id: "economy", label: "💰 Deeper economy & investing", votes: 31 },
    { id: "pvp", label: "⚔️ Team PvP & crew wars", votes: 27 },
    { id: "casino", label: "🎰 Live casino events", votes: 19 },
  ];
  const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);

  const searchResults = (allPlayers ?? [])
    .filter((p: any) => searchName.trim().length > 0 && `${p.nickname || p.username || ""}`.toLowerCase().includes(searchName.toLowerCase()))
    .slice(0, 5);

  const guideTopics = [
    { icon: "🎯", title: "Getting Started", text: "Run street crimes for cash & XP, bank your money, and buy your first car." },
    { icon: "🛡️", title: "Staying Alive", text: "Keep life topped up, buy armor at the Armoury, and hire bodyguards before you get famous." },
    { icon: "👑", title: "Climbing Ranks", text: "Every 10 levels unlocks a new rank. Missions and Organized Crime give the fastest XP." },
    { icon: "💀", title: "Murder Rules", text: "Bullets are required for kills. Hospital bills are real — check your target's defense first." },
  ];

  const suggestions: { icon: string; title: string; status: string; votes: number }[] = [
    { icon: "🏝️", title: "Private islands for top crews", status: "planned", votes: 128 },
    { icon: "🐕", title: "Guard dogs for safehouses", status: "open", votes: 96 },
    { icon: "🏦", title: "Crew-run banks with interest", status: "shipped", votes: 244 },
  ];

  const quickLinks = [
    { icon: "🎁", label: "Daily Reward", page: "daily_rewards" },
    { icon: "👥", label: "Online Players", page: "online_players" },
    { icon: "📣", label: "Updates", page: "updates" },
    { icon: "❓", label: "Player Guide", page: "player_guide" },
    { icon: "💡", label: "Suggestions", page: "suggestions" },
    { icon: "📊", label: "Polls", page: "polls" },
    { icon: "📝", label: "Notepad", page: "notepad" },
    { icon: "🔍", label: "Find User", page: "find_user" },
  ];

  return (
    <div className="mafia-card rounded-xl p-4 border border-amber-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🗂️</span>
        <span className="text-sm font-bold text-amber-300">Overview</span>
        <span className="text-[9px] text-muted-foreground ml-auto">Everything you need, one click away</span>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {quickLinks.map((l) => (
          <button key={l.page} onClick={() => nav(l.page)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/30 text-[10px] font-bold text-slate-300 hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/5 transition-all">
            <span className="text-sm">{l.icon}</span>{l.label}
          </button>
        ))}
      </div>

      {/* Announcements */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
        <div className="text-[10px] font-bold text-amber-300 mb-2">📣 Announcements</div>
        {announcements?.announcements?.length ? (
          <div className="space-y-1.5">
            {announcements.announcements.slice(0, 3).map((a: any) => (
              <div key={a.id} className="text-[10px] flex items-start gap-2 rounded-md bg-slate-900/60 p-2" style={{ borderLeft: `3px solid ${a.color || "#f59e0b"}` }}>
                <span>{a.emoji || "📌"}</span>
                <div className="flex-1"><span className="text-slate-200 font-bold">{a.text}</span>
                  <div className="text-[8px] text-muted-foreground mt-0.5">{a.createdByName ?? "Staff"} · ends {new Date(a.expiresAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground">No active announcements right now.</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Find User */}
        <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
          <div className="text-[10px] font-bold text-amber-300 mb-2">🔍 Find User</div>
          <input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Type a nickname…"
            className="w-full bg-slate-900/70 border border-slate-700/40 rounded-md px-2.5 py-1.5 text-[10px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40" />
          <div className="mt-2 space-y-1">
            {searchResults.map((p: any) => (
              <div key={p._id} className="flex items-center gap-2 text-[10px] rounded-md bg-slate-900/60 px-2 py-1.5">
                <span className="text-sm">👤</span>
                <span className="font-bold text-slate-200 flex-1 truncate">{p.nickname || p.username || "Unknown"}</span>
                <span className="text-muted-foreground">Lv.{p.level ?? 1}</span>
              </div>
            ))}
            {searchName.trim() && searchResults.length === 0 && <div className="text-[10px] text-muted-foreground">No players matched “{searchName}”.</div>}
          </div>
        </div>

        {/* Online Players — live list inline */}
        <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-amber-300">👥 Online Players</div>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-green-400">{roster?.onlineCount ?? onlineCount ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">in the streets right now</span>
          </div>
          <div className="mt-2 space-y-1 max-h-44 overflow-y-auto">
            {(roster?.onlinePlayers ?? []).slice(0, 8).map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-[10px] rounded-md bg-slate-900/60 px-2 py-1">
                <span className="relative flex size-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-bold text-amber-200 flex-1 truncate">{p.name}</span>
                <span className="text-muted-foreground">Lv.{p.level}</span>
                {p.inPrison && <span className="text-[7px] font-black px-1 rounded bg-sky-500/15 text-sky-300">🔒</span>}
                {p.wanted > 0 && <span className="text-[7px] font-black px-1 rounded bg-red-500/15 text-red-300">🚨{p.wanted}</span>}
              </div>
            ))}
            {roster && roster.onlinePlayers.length === 0 && (
              <div className="text-[10px] text-muted-foreground italic">The streets are empty right now.</div>
            )}
            {!roster && <div className="text-[10px] text-muted-foreground animate-pulse">Scanning…</div>}
          </div>
          {roster && (
            <div className="text-[9px] text-muted-foreground mt-1.5">
              ⚫ {roster.total - roster.onlineCount} offline · {roster.total} total
            </div>
          )}
          <button onClick={() => nav("online_players")} className="mt-1.5 text-[10px] font-bold text-amber-400 hover:text-amber-300">View full list →</button>
        </div>

        {/* Notepad */}
        <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
          <div className="text-[10px] font-bold text-amber-300 mb-2">📝 Notepad</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Jot down targets, debts, deals…"
            className="w-full bg-slate-900/70 border border-slate-700/40 rounded-md px-2.5 py-1.5 text-[10px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 resize-none" />
          <button onClick={saveNote} className="mt-1.5 px-3 py-1 rounded-md bg-slate-800 border border-slate-700/40 text-[10px] font-bold text-amber-300 hover:bg-slate-700">
            {noteSaved ? "✅ Saved" : "Save note"}
          </button>
        </div>

        {/* Polls */}
        <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
          <div className="text-[10px] font-bold text-amber-300 mb-2">📊 Weekly Poll — what should we build next?</div>
          <div className="space-y-1.5">
            {pollOptions.map((o) => (
              <button key={o.id} onClick={() => setPollChoice(o.id)} disabled={!!pollChoice}
                className={`w-full text-left rounded-md px-2 py-1.5 text-[10px] font-bold border transition-all relative overflow-hidden ${pollChoice === o.id ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-700/40 bg-slate-900/60 text-slate-300 hover:border-amber-500/30"}`}>
                <div className="absolute inset-y-0 left-0 bg-amber-500/15" style={{ width: `${(o.votes / totalVotes) * 100}%` }} />
                <span className="relative z-10 flex justify-between"><span>{o.label}</span><span className="text-muted-foreground">{Math.round((o.votes / totalVotes) * 100)}%</span></span>
              </button>
            ))}
          </div>
          {pollChoice && <div className="text-[9px] text-green-400 mt-1">Vote recorded — results update every week!</div>}
        </div>
      </div>

      {/* Player Guide */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
        <div className="text-[10px] font-bold text-amber-300 mb-2">📖 Player Guide</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {guideTopics.map((g) => (
            <div key={g.title} className="rounded-md bg-slate-900/60 border border-slate-700/30 p-2">
              <div className="text-[10px] font-bold text-slate-200">{g.icon} {g.title}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{g.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-amber-300">💡 Community Suggestions</div>
          <button onClick={() => nav("suggestions")} className="text-[9px] font-bold text-amber-400 hover:text-amber-300">Add yours →</button>
        </div>
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <div key={s.title} className="flex items-center gap-2 rounded-md bg-slate-900/60 border border-slate-700/30 px-2 py-1.5">
              <span className="text-sm">{s.icon}</span>
              <span className="text-[10px] font-bold text-slate-200 flex-1 truncate">{s.title}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${s.status === "shipped" ? "bg-green-500/10 text-green-400 border-green-500/30" : s.status === "planned" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>{s.status}</span>
              <span className="text-[9px] text-muted-foreground">▲ {s.votes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Updates */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-700/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-amber-300">🆕 Latest Updates</div>
          <button onClick={() => nav("updates")} className="text-[9px] font-bold text-amber-400 hover:text-amber-300">Full changelog →</button>
        </div>
        {(updates ?? []).slice(0, 4).map((u: any) => (
          <div key={u._id} className="flex items-start gap-2 rounded-md bg-slate-900/60 border border-slate-700/30 px-2 py-1.5 mb-1">
            <span className="text-xs">🛠️</span>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-200">{u.icon ? `${u.icon} ` : ""}{u.title}</div>
              {u.description && <div className="text-[9px] text-muted-foreground">{u.description}</div>}
            </div>
            <span className="text-[8px] text-muted-foreground whitespace-nowrap">{new Date(u.timestamp).toLocaleDateString()}</span>
          </div>
        ))}
        {(updates ?? []).length === 0 && <div className="text-[10px] text-muted-foreground">No updates posted yet.</div>}
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

const HOSPITAL_CONDITIONS: Record<string, string> = {
  ambulance: "🚑", helicopter: "🚁", medivac: "🛩️", walk_in: "🚶",
};

function HospitalLiveDispatch({ dispatch }: { dispatch: any[] }) {
  if (!dispatch || dispatch.length === 0) return null;
  return (
    <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-slate-950/60 to-red-950/40 p-4">
      <div className="absolute inset-0 opacity-20 animate-shimmer pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 30%, rgba(239,68,68,0.25) 50%, transparent 70%)" }} />
      <div className="relative flex items-center gap-2 mb-2">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-red-400 animate-pulse">🔴 Live Emergency Dispatch</span>
      </div>
      <div className="relative space-y-1.5">
        {dispatch.map((v: any, i: number) => {
          const eta = Math.max(0, Math.round((45_000 - (Date.now() - v.admittedAt)) / 1000));
          return (
            <div key={v._id ?? i} className="flex items-center gap-2 text-[10px]">
              <span className="text-base animate-float" style={{ animationDelay: `${i * 0.3}s` }}>{HOSPITAL_CONDITIONS[v.emergencyType] ?? "🚑"}</span>
              <span className="text-red-300 font-bold">{v.conditionIcon} {v.condition}</span>
              <span className="text-slate-500">— {v.playerName}</span>
              <span className="ml-auto font-mono text-amber-400">{eta}s ETA</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HospitalSkyScene({ severity, admittedAt }: { severity: string; admittedAt: number }) {
  const elapsed = Date.now() - admittedAt;
  const progress = Math.min(1, elapsed / 45_000);
  const vehicle = severity === "critical" ? "🛩️" : severity === "serious" ? "🚁" : "🚑";
  return (
    <div className="relative h-28 overflow-hidden rounded-xl border border-slate-700/40 bg-gradient-to-b from-[#0b1026] via-[#0d1b3a] to-[#05070f]">
      {[...Array(14)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white/70 animate-pulse"
          style={{ width: 2, height: 2, left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%`, animationDelay: `${i * 0.2}s` }} />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-900/80 border-t border-slate-700/40" />
      <div className="absolute bottom-6 left-4 text-lg">🏥</div>
      <div className="absolute bottom-6 right-6 text-lg">🏘️</div>
      <motion.div
        animate={{ x: ["-12%", "112%"] }}
        transition={{ repeat: Infinity, duration: Math.max(6, 45 - progress * 39), ease: "linear" }}
        className="absolute top-6 text-3xl drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]"
      >{vehicle}</motion.div>
      <div className="absolute top-1 right-2 text-[9px] font-black uppercase tracking-widest text-red-400">
        {severity === "critical" ? "🚨 Code Red" : severity === "serious" ? "⚠️ Urgent" : "Routine"}
      </div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-mono">
        inbound patient · triage in progress
      </div>
    </div>
  );
}

function HospitalPage() {
  const player = useQuery(api.game.getPlayer);
  const hospitalData = useQuery(api.hospitalSystem.getHospitalData);
  const admit = useMutation(api.hospitalSystem.admitToHospital);
  const payInvoice = useMutation(api.hospitalSystem.payInvoice);
  const walkIn = useMutation(api.hospitalSystem.walkInTreatment);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => { const iv = setInterval(() => forceTick((t) => t + 1), 1000); return () => clearInterval(iv); }, []);

  if (player === undefined || hospitalData === undefined) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading hospital…</div>;
  if (!player) return <div className="text-center py-8 text-muted-foreground">Sign in to visit the hospital.</div>;

  const life = player.life ?? 0;
  const maxLife = player.maxLife ?? 100;
  const deficit = maxLife - life;
  const deficitPct = Math.round((deficit / maxLife) * 100);
  const activeVisit = (hospitalData as any)?.activeVisit;
  const dispatch = (hospitalData as any)?.liveDispatch ?? [];
  const history = (hospitalData as any)?.history ?? [];
  const hasInsurance = !!(player as any).insuranceActive;

  const treatments = [
    { id: "triage" as const, name: "ER Triage & Stitches", icon: "🩹", desc: "Patched up in the emergency room · heals 25% of missing health", cost: 5_000, color: "from-emerald-600/30 to-emerald-900/20 border-emerald-500/30" },
    { id: "surgery" as const, name: "Emergency Surgery", icon: "🏥", desc: "Theatre, anesthetist, the works · heals 60% of missing health", cost: 45_000, color: "from-sky-600/30 to-sky-900/20 border-sky-500/30" },
    { id: "full_recovery" as const, name: "Full Recovery Program", icon: "💉", desc: "Private ward, IV drips, top specialists · full heal", cost: 150_000, color: "from-fuchsia-600/30 to-fuchsia-900/20 border-fuchsia-500/30" },
  ];

  const run = async (fn: () => Promise<any>) => {
    setBusy(true); setMsg(null);
    try { const r = await fn(); setMsg({ text: r?.message ?? "✅ Treatment complete — you feel better already.", good: true }); }
    catch (e: any) { setMsg({ text: e.message, good: false }); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <HeartPulse className="size-7 text-red-400" />
        <h2 className="text-2xl font-black tracking-tight">Shadow General Hospital</h2>
        {hasInsurance && <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[9px] font-black">🛡️ INSURED · 85% COVERED</span>}
      </div>

      {/* Patient status */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300">❤️ Patient Vitals</span>
          <span className={`text-xs font-black ${life / maxLife > 0.5 ? "text-emerald-400" : life / maxLife > 0.25 ? "text-amber-400" : "text-red-400"}`}>{life.toLocaleString()} / {maxLife.toLocaleString()} HP</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
          <motion.div animate={{ width: `${(life / maxLife) * 100}%` }} transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${life / maxLife > 0.5 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : life / maxLife > 0.25 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-red-600 to-red-400 animate-pulse"}`}
            style={{ boxShadow: "0 0 12px rgba(239,68,68,0.5)" }} />
        </div>
        {deficit > 0 && <div className="text-[10px] text-red-400 mt-1.5">⚠️ {deficit.toLocaleString()} HP missing ({deficitPct}% trauma) — treatment recommended</div>}
      </div>

      {/* Emergency admission */}
      {deficit >= maxLife * 0.15 && !activeVisit && (
        <button onClick={async () => { try { await admit({ lifePercent: (life / maxLife) * 100 }); setMsg({ text: "🚨 Emergency services dispatched! Vehicle en route…", good: true }); } catch (e: any) { setMsg({ text: e.message, good: false }); } }}
          className="relative w-full rounded-xl border-2 border-red-500/50 bg-gradient-to-r from-red-950/60 via-red-900/40 to-red-950/60 px-4 py-4 text-left overflow-hidden group hover:border-red-400 transition-all">
          <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 30%, rgba(239,68,68,0.3) 50%, transparent 70%)" }} />
          <div className="relative flex items-center gap-3">
            <span className="text-3xl animate-float">🚨</span>
            <div className="flex-1">
              <div className="text-sm font-black text-red-300">CALL AN AMBULANCE — 911</div>
              <div className="text-[10px] text-red-400/80">Critical condition detected. Dispatch ground ambulance, air-ambulance helicopter or medivac jet. You'll receive a realistic invoice.</div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-black group-hover:bg-red-500">DISPATCH</span>
          </div>
        </button>
      )}

      {/* Active admission */}
      {activeVisit && (
        <div className="space-y-3">
          <HospitalSkyScene severity={activeVisit.severity} admittedAt={activeVisit.admittedAt} />
          <div className="mafia-card rounded-xl p-4 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-float">{HOSPITAL_CONDITIONS[activeVisit.emergencyType] ?? "🚑"}</span>
              <div className="flex-1">
                <div className="text-sm font-black text-white">{activeVisit.conditionIcon} {activeVisit.condition}</div>
                <div className="text-[10px] text-muted-foreground">{activeVisit.severity === "critical" ? "Code Red — medivac" : activeVisit.severity === "serious" ? "Urgent — air ambulance" : "Standard — ground ambulance"} · admitted {Math.floor((Date.now() - activeVisit.admittedAt) / 60000)} min ago</div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-slate-700/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 uppercase tracking-widest font-bold">Invoice #{String(activeVisit._id ?? "000000").slice(-6)}</span>
                <span className="text-red-300 font-black">${(activeVisit.invoice ?? 0).toLocaleString()}</span>
              </div>
              <div className="text-[9px] text-slate-500">Includes {HOSPITAL_CONDITIONS[activeVisit.emergencyType] === "🛩️" ? "medivac jet" : HOSPITAL_CONDITIONS[activeVisit.emergencyType] === "🚁" ? "air ambulance" : "ground ambulance"} transport, surgeons, anaesthesia & ward care.</div>
              <div className="grid grid-cols-2 gap-2">
                <button disabled={busy} onClick={() => run(async () => { const r: any = await payInvoice({ visitId: activeVisit._id, paymentMethod: "cash" }); return { message: `✅ Discharged! Paid $${r.cost.toLocaleString()} · healed ${r.healed} HP` }; })}
                  className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-lg text-[10px] font-black disabled:opacity-40">💵 PAY CASH</button>
                <button disabled={busy || !hasInsurance} onClick={() => run(async () => { const r: any = await payInvoice({ visitId: activeVisit._id, paymentMethod: "insurance" }); return { message: `✅ Insurance covered 85% — you paid $${r.cost.toLocaleString()} · healed ${r.healed} HP` }; })}
                  className="px-3 py-2 bg-gradient-to-r from-sky-600 to-blue-500 text-white rounded-lg text-[10px] font-black disabled:opacity-40" title={hasInsurance ? "Insurance covers 85%" : "Requires health insurance"}>🛡️ USE INSURANCE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in treatments */}
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">🚶 Walk-in Treatments</div>
      <div className="grid gap-2 md:grid-cols-3">
        {treatments.map(t => (
          <div key={t.id} className={`mafia-card rounded-xl p-4 bg-gradient-to-br border ${t.color}`}>
            <div className="text-3xl mb-1">{t.icon}</div>
            <div className="text-sm font-black text-white">{t.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 mb-2 min-h-8">{t.desc}</div>
            <button disabled={busy || (player.money ?? 0) < t.cost || life >= maxLife} onClick={() => run(async () => { const r: any = await walkIn({ tier: t.id }); return { message: `✅ ${t.name} done — healed ${r.healed} HP for $${r.cost.toLocaleString()}` }; })}
              className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-lg text-[10px] font-black disabled:opacity-30 transition-all">
              ${t.cost.toLocaleString()}{hasInsurance && <span className="text-emerald-300"> · $15%</span>}
            </button>
          </div>
        ))}
      </div>

      <HospitalLiveDispatch dispatch={dispatch} />

      {/* History */}
      {history.length > 0 && (
        <div className="mafia-card rounded-xl p-4">
          <div className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2">📋 Medical Records</div>
          <div className="space-y-1">
            {history.map((v: any) => (
              <div key={v._id} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-700/20 last:border-0">
                <span>{v.conditionIcon} {v.condition} <span className="text-slate-500">· {new Date(v.admittedAt).toLocaleDateString()}</span></span>
                <span className="text-emerald-400 font-bold">${(v.invoice ?? 0).toLocaleString()} ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && <div className={`rounded-xl px-4 py-2.5 text-xs font-bold text-center border ${msg.good ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" : "bg-rose-500/15 border-rose-400/40 text-rose-300"}`}>{msg.text}</div>}
    </div>
  );
}

function NotificationsPage() {  const notifications = useQuery(api.game.getNotifications);
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
  const online = useQuery(api.statistics.getOnlinePlayers);
  const [q, setQ] = useState("");
  const fmtMoney = (x?: number) => `${(x ?? 0).toLocaleString()}`;

  const players = online?.players ?? [];
  const shown = q.trim()
    ? players.filter((p: any) => p.name?.toLowerCase().includes(q.toLowerCase()))
    : players;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="size-7 text-primary" />
        <h2 className="text-2xl font-bold">City Overview</h2>
      </div>

      {/* Live status strip */}
      <div className="mafia-card rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-black text-emerald-400">{online?.count ?? 0} PLAYERS ONLINE</span>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search players…"
          className="rounded-lg border border-amber-500/30 bg-slate-950 px-3 py-1.5 text-xs font-bold text-amber-200 placeholder:text-slate-600 outline-none focus:border-amber-500/60 w-48"
        />
      </div>

      {/* Online player list */}
      <div className="mafia-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 items-center px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-amber-500/20 bg-amber-500/5">
          <span>Player</span>
          <span className="hidden md:inline text-right">Rank</span>
          <span className="text-right">Cash</span>
          <span className="text-right">Life</span>
          <span className="text-right">Status</span>
          <span className="text-right">Active</span>
        </div>
        <div className="divide-y divide-amber-500/5">
          {!online && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground animate-pulse">Scanning the streets…</div>
          )}
          {online && shown.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {q ? `No online players match "${q}".` : "The streets are empty right now."}
            </div>
          )}
          {shown.map((p: any) => (
            <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 items-center px-4 py-2.5 hover:bg-amber-500/5 transition">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex size-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-black text-amber-300 truncate">{p.name}</span>
                <span className="text-[9px] font-bold text-muted-foreground">Lv.{p.level}</span>
              </div>
              <span className="hidden md:inline text-[10px] font-bold text-muted-foreground text-right">{p.rank}</span>
              <span className="text-[11px] font-bold text-emerald-400/90 text-right tabular-nums">{fmtMoney(p.money)}</span>
              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden" title={`${p.life}/${p.maxLife}`}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.max(0, Math.min(100, (p.life / (p.maxLife || 100)) * 100))}%`,
                  background: p.life / (p.maxLife || 100) > 0.5 ? "#22c55e" : p.life / (p.maxLife || 100) > 0.25 ? "#eab308" : "#ef4444",
                }} />
              </div>
              <div className="flex justify-end gap-1">
                {p.inPrison && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-sky-500/15 text-sky-300">🔒 JAIL</span>}
                {p.wanted > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-red-500/15 text-red-300">🚨 {p.wanted}</span>}
                {p.family && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-amber-500/15 text-amber-300">{p.family}</span>}
              </div>
              <span className="text-[9px] text-muted-foreground text-right tabular-nums">
                {Math.max(0, Math.round((Date.now() - p.lastActive) / 1000))}s
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* City grid */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">Districts</div>
        <div className="grid grid-cols-2 gap-3">
          {["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "London", "Tokyo", "Berlin", "Sydney", "Dubai"].map(city => (
            <div key={city} className="mafia-card rounded-xl p-4 text-center hover:border-primary/30 transition cursor-pointer">
              <div className="text-2xl mb-1">🏙️</div><div className="text-sm font-bold">{city}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatisticsPage() {
  const [tab, setTab] = useState("global");
  const [search, setSearch] = useState("");
  const [queryName, setQueryName] = useState("");
  const [killFilter, setKillFilter] = useState("");
  const [onlineFilter, setOnlineFilter] = useState("");
  const online = useQuery(api.statistics.getOnlinePlayers);
  const globalStats = useQuery(api.statistics.getGlobalStatistics);
  const personal = useQuery(api.statistics.getPersonalStatistics, { username: queryName.trim() || undefined });
  const deaths = useQuery(api.statistics.getRecentDeaths, { limit: 30 });
  const my = useQuery(api.game.getPlayer);
  const money = (x?: number) => `$${(x ?? 0).toLocaleString()}`;
  const num = (x?: number) => (x ?? 0).toLocaleString();
  const pct = (a?: number, b?: number) => (b && b > 0 ? Math.round(((a ?? 0) / b) * 1000) / 10 : 0);
  const g = globalStats?.global;
  const w = globalStats?.wealth;
  const v = globalStats?.vehicle;
  const r = globalStats?.ranking;
  const gam = globalStats?.gambling;
  const o = globalStats?.offence;
  const boards = [
    { id: "global", label: "Global", icon: "🌐" }, { id: "personal", label: "Personal", icon: "👤" },
    { id: "wealth", label: "Wealth", icon: "💰" }, { id: "vehicle", label: "Vehicles", icon: "🚗" },
    { id: "ranking", label: "Ranking", icon: "📊" }, { id: "gambling", label: "Gambling", icon: "🎰" },
    { id: "offence", label: "Offence", icon: "💀" }, { id: "deaths", label: "Death List", icon: "🪦" },
    { id: "online", label: "Online", icon: "🟢" },
  ];
  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="mafia-card rounded-xl p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-black text-primary">{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground/70">{sub}</div>}
    </div>
  );
  const panel = () => {
    if (!globalStats) return <div className="animate-pulse py-16 text-center text-sm text-muted-foreground">Crunching global data…</div>;
    if (tab === "global" && g) return (
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-muted-foreground">Updated automatically</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="Total Users" value={num(g.totalUsers)} />
          <Stat label="Alive Users" value={num(g.aliveUsers)} sub={`${pct(g.aliveUsers, g.totalUsers)}% of total`} />
          <Stat label="Dead Users" value={num(g.deadUsers)} sub={`${pct(g.deadUsers, g.totalUsers)}% of total`} />
          <Stat label="Total Money" value={money(g.totalMoney)} />
          <Stat label="Swissed Money" value={money(g.swissedMoney)} sub={`${pct(g.swissedMoney, g.totalMoney)}% of total`} />
          <Stat label="Banked Money" value={money(g.bankedMoney)} sub={`${pct(g.bankedMoney, g.totalMoney)}% of total`} />
          <Stat label="Points in circulation" value={num(w?.points)} />
          <Stat label="Bullets in circulation" value={num(w?.bullets)} />
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] text-muted-foreground">
          💡 Click an icon below to drill into a statistics board.
        </div>
      </div>
    );
    if (tab === "personal") return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQueryName(search)}
            placeholder="Search… username"
            className="flex-1 rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50" />
          <button onClick={() => setQueryName(search)} className="rounded-xl bg-amber-600 px-4 text-xs font-black text-slate-950 hover:bg-amber-500">SEARCH</button>
          <button onClick={() => { setSearch(""); setQueryName(""); }} className="rounded-xl border border-slate-700 px-3 text-xs text-slate-400">Me</button>
        </div>
        {!personal ? <div className="animate-pulse py-12 text-center text-sm text-muted-foreground">Loading player…</div> : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {personal.rows.map((row: any, i: number) => (
              <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                <div className="text-[9px] uppercase tracking-wider text-slate-500">{row.label}</div>
                <div className="text-xs font-bold text-white break-words">{row.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
    if (tab === "wealth" && w) return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Total Money" value={money(w.totalMoney)} />
        <Stat label="Banked Money" value={money(w.bankedMoney)} />
        <Stat label="Swissed Money" value={money(w.swissedMoney)} />
        <Stat label="Points" value={num(w.points)} />
        <Stat label="IG Coins" value={num(w.igCoins)} />
        <Stat label="Bullets" value={num(w.bullets)} />
      </div>
    );
    if (tab === "vehicle" && v) return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Cars" value={num(v.total)} />
        <Stat label="Rares" value={num(v.rares)} />
        <Stat label="Epics" value={num(v.epics)} />
        <Stat label="Legendaries" value={num(v.legendaries)} />
        <Stat label="Commons" value={num(v.commons)} />
        <Stat label="Stolen" value={num(v.stolen)} />
        <Stat label="Total Bullets Melted" value={num(v.totalBulletsMelted)} />
      </div>
    );
    if (tab === "ranking" && r) return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Total Crimes" value={num(r.totalCrimes)} />
        <Stat label="Cars Stolen" value={num(r.carsStolen)} />
        <Stat label="Total Heists" value={num(r.totalHeists)} />
        <Stat label="Total OCs" value={num(r.totalOCs)} />
        <Stat label="Total Busts" value={num(r.totalBusts)} />
        <Stat label="Assassinations" value={num(r.totalAssassinations)} />
        <Stat label="Packs Opened" value={num(r.packsOpened)} />
        <Stat label="Combined Levels" value={num(r.totalLevels)} />
      </div>
    );
    if (tab === "gambling" && gam) return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Betting Profit" value={money(gam.bettingProfit)} />
        <Stat label="Stock Profit" value={money(gam.stockProfit)} />
        <Stat label="Supply Profit" value={money(gam.supplyProfit)} />
        <Stat label="Casino Wins" value={num(gam.casinoWins)} />
        <Stat label="Bets Placed" value={num(gam.betsPlaced)} />
      </div>
    );
    if (tab === "offence" && o) return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Users Killed" value={num(o.usersKilled)} />
        <Stat label="Bodyguards Killed" value={num(o.bodyguardsKilled)} />
        <Stat label="Bodyguards Bought" value={num(o.bodyguardsBought)} />
        <Stat label="Bullets Fired" value={num(o.bulletsFired)} />
        <Stat label="Times Travelled" value={num(o.timesTravelled)} />
      </div>
    );
    if (tab === "deaths") return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input value={killFilter} onChange={(e) => setKillFilter(e.target.value)}
            placeholder="Filter by killer or victim…"
            className="flex-1 min-w-40 rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-red-500/50" />
          <span className="text-[10px] text-muted-foreground">Updated every minute · last 7 days</span>
        </div>
        {!deaths || deaths.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No kills recorded yet.</div>
        ) : (
          <div className="space-y-1">
            {deaths
              .filter((d: any) => !killFilter || d.killer.toLowerCase().includes(killFilter.toLowerCase()) || d.victim.toLowerCase().includes(killFilter.toLowerCase()))
              .map((d: any, i: number) => (
                <div key={i} className="mafia-card flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2">
                  <span className="text-lg">💀</span>
                  <span className="text-sm font-bold text-red-400">{d.killer}</span>
                  <span className="text-[9px] text-muted-foreground">Lv.{d.killerLv}</span>
                  <span className="text-[10px] text-muted-foreground">killed</span>
                  <span className="text-sm font-bold text-slate-300">{d.victim}</span>
                  <span className="text-[9px] text-muted-foreground">Lv.{d.victimLv}</span>
                  <span className="ml-auto text-[9px] text-muted-foreground">🔫 {num(d.damage)} dmg</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
    if (tab === "online") {
      const players = online?.players ?? [];
      const shown = onlineFilter.trim()
        ? players.filter((p: any) => p.name?.toLowerCase().includes(onlineFilter.toLowerCase()))
        : players;
      return (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-black text-emerald-400">{online?.count ?? 0} PLAYERS ONLINE</span>
            </div>
            <input
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value)}
              placeholder="Search players…"
              className="rounded-lg border border-amber-500/30 bg-slate-950 px-3 py-1.5 text-xs font-bold text-amber-200 placeholder:text-slate-600 outline-none focus:border-amber-500/60 w-48"
            />
          </div>
          <div className="mafia-card rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 items-center px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-amber-500/20 bg-amber-500/5">
              <span>Player</span>
              <span className="hidden md:inline text-right">Rank</span>
              <span className="text-right">Cash</span>
              <span className="text-right">Life</span>
              <span className="text-right">Status</span>
              <span className="text-right">Active</span>
            </div>
            <div className="divide-y divide-amber-500/5">
              {!online && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground animate-pulse">Scanning the streets…</div>
              )}
              {online && shown.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {onlineFilter ? `No online players match "${onlineFilter}".` : "The streets are empty right now."}
                </div>
              )}
              {shown.map((p: any) => (
                <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 items-center px-4 py-2.5 hover:bg-amber-500/5 transition">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex size-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-sm font-black text-amber-300 truncate">{p.name}</span>
                    <span className="text-[9px] font-bold text-muted-foreground">Lv.{p.level}</span>
                  </div>
                  <span className="hidden md:inline text-[10px] font-bold text-muted-foreground text-right">{p.rank}</span>
                  <span className="text-[11px] font-bold text-emerald-400/90 text-right tabular-nums">{"$"}{(p.money ?? 0).toLocaleString()}</span>
                  <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden" title={`${p.life}/${p.maxLife}`}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.max(0, Math.min(100, (p.life / (p.maxLife || 100)) * 100))}%`,
                      background: p.life / (p.maxLife || 100) > 0.5 ? "#22c55e" : p.life / (p.maxLife || 100) > 0.25 ? "#eab308" : "#ef4444",
                    }} />
                  </div>
                  <div className="flex justify-end gap-1">
                    {p.inPrison && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-sky-500/15 text-sky-300">🔒 JAIL</span>}
                    {p.wanted > 0 && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-red-500/15 text-red-300">🚨 {p.wanted}</span>}
                    {p.family && <span className="text-[8px] font-black px-1 py-0.5 rounded bg-amber-500/15 text-amber-300">{p.family}</span>}
                  </div>
                  <span className="text-[9px] text-muted-foreground text-right tabular-nums">
                    {Math.max(0, Math.round((Date.now() - p.lastActive) / 1000))}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-7 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Statistics</h2>
            <p className="text-[10px] text-muted-foreground">City-wide data, refreshed live</p>
          </div>
        </div>
        {my && <div className="text-[10px] text-muted-foreground">Viewing as <b className="text-white">{my.nickname || my.username || "You"}</b></div>}
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
        {boards.map((b) => (
          <button key={b.id} onClick={() => setTab(b.id)}
            className={`flex flex-col items-center rounded-xl border px-1 py-2 text-[8px] font-black uppercase tracking-wider transition-all ${tab === b.id ? "border-amber-500/50 bg-amber-500/15 text-amber-300" : "border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}>
            <span className="text-base mb-0.5">{b.icon}</span>
            {b.label}
          </button>
        ))}
      </div>
      {panel()}
    </div>
  );
}

function AirportPage() {
  const player = useQuery(api.game.getPlayer);
  const changeLocation = useMutation(api.game.changeLocation);
  const [view, setView] = useState<"map" | "flight" | "destination">("map");
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [flightProgress, setFlightProgress] = useState(0);
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [cooldownEnd, setCooldownEnd] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("airport_cooldown") || "0", 10); } catch { return 0; }
  });
  const [adminOverride, setAdminOverride] = useState(false);
  const flightTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const FLIGHT_DURATION = 5 * 60 * 1000; // 5 minutes
  const COOLDOWN_DURATION = 15 * 60 * 1000; // 15 minutes
  const RESET_COST = 25; // points

  const now = Date.now();
  const cooldownRemaining = Math.max(0, cooldownEnd - now);
  const isOnCooldown = cooldownRemaining > 0 && !adminOverride;

  // Countdown ticker for cooldown display
  const [cooldownTick, setCooldownTick] = useState(0);
  useEffect(() => {
    if (!isOnCooldown) return;
    const t = setInterval(() => setCooldownTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, [isOnCooldown]);

  // World cities with real-world approximate coordinates (x%, y% on world map)
  const worldCities = [
    { name: "New York", x: 25, y: 32, risk: "High", cost: 35000, xp: 100, unlocks: 15, icon: "🗽", continent: "NA" },
    { name: "Los Angeles", x: 12, y: 36, risk: "Medium", cost: 12000, xp: 50, unlocks: 10, icon: "🌴", continent: "NA" },
    { name: "Chicago", x: 20, y: 30, risk: "Medium", cost: 8000, xp: 40, unlocks: 5, icon: "🏙️", continent: "NA" },
    { name: "Miami", x: 23, y: 40, risk: "High", cost: 20000, xp: 75, unlocks: 10, icon: "🏖️", continent: "NA" },
    { name: "Las Vegas", x: 14, y: 34, risk: "High", cost: 50000, xp: 125, unlocks: 20, icon: "🎰", continent: "NA" },
    { name: "Dallas", x: 19, y: 36, risk: "Medium", cost: 5000, xp: 30, unlocks: 5, icon: "🤠", continent: "NA" },
    { name: "Toronto", x: 23, y: 28, risk: "Medium", cost: 10000, xp: 45, unlocks: 8, icon: "🍁", continent: "NA" },
    { name: "Mexico City", x: 18, y: 42, risk: "High", cost: 15000, xp: 60, unlocks: 8, icon: "🌮", continent: "SA" },
    { name: "São Paulo", x: 32, y: 62, risk: "Very High", cost: 45000, xp: 110, unlocks: 18, icon: "🇧🇷", continent: "SA" },
    { name: "Buenos Aires", x: 29, y: 70, risk: "High", cost: 30000, xp: 85, unlocks: 15, icon: "🇦🇷", continent: "SA" },
    { name: "London", x: 47, y: 24, risk: "Very High", cost: 75000, xp: 150, unlocks: 25, icon: "🇬🇧", continent: "EU" },
    { name: "Paris", x: 48, y: 27, risk: "Very High", cost: 65000, xp: 140, unlocks: 22, icon: "🇫🇷", continent: "EU" },
    { name: "Berlin", x: 51, y: 24, risk: "Extreme", cost: 200000, xp: 225, unlocks: 40, icon: "🇩🇪", continent: "EU" },
    { name: "Moscow", x: 58, y: 20, risk: "Extreme", cost: 175000, xp: 200, unlocks: 35, icon: "🇷🇺", continent: "EU" },
    { name: "Rome", x: 50, y: 30, risk: "High", cost: 55000, xp: 130, unlocks: 20, icon: "🇮🇹", continent: "EU" },
    { name: "Istanbul", x: 55, y: 31, risk: "High", cost: 40000, xp: 100, unlocks: 15, icon: "🇹🇷", continent: "EU" },
    { name: "Dubai", x: 60, y: 38, risk: "Extreme", cost: 150000, xp: 200, unlocks: 35, icon: "🕌", continent: "ME" },
    { name: "Cairo", x: 55, y: 38, risk: "High", cost: 25000, xp: 70, unlocks: 12, icon: "🇪🇬", continent: "AF" },
    { name: "Mogadishu", x: 59, y: 47, risk: "Death Row", cost: 500000, xp: 500, unlocks: 75, icon: "💀", continent: "AF" },
    { name: "Lagos", x: 47, y: 46, risk: "Very High", cost: 60000, xp: 130, unlocks: 22, icon: "🇳🇬", continent: "AF" },
    { name: "Tokyo", x: 85, y: 30, risk: "Very High", cost: 100000, xp: 175, unlocks: 30, icon: "🗼", continent: "AS" },
    { name: "Shanghai", x: 79, y: 32, risk: "Extreme", cost: 300000, xp: 275, unlocks: 50, icon: "🇨🇳", continent: "AS" },
    { name: "Hong Kong", x: 80, y: 38, risk: "Very High", cost: 90000, xp: 160, unlocks: 28, icon: "🇭🇰", continent: "AS" },
    { name: "Bangkok", x: 77, y: 42, risk: "High", cost: 35000, xp: 90, unlocks: 14, icon: "🇹🇭", continent: "AS" },
    { name: "Mumbai", x: 68, y: 40, risk: "High", cost: 30000, xp: 80, unlocks: 12, icon: "🇮🇳", continent: "AS" },
    { name: "Seoul", x: 83, y: 28, risk: "High", cost: 45000, xp: 110, unlocks: 18, icon: "🇰🇷", continent: "AS" },
    { name: "Sydney", x: 86, y: 64, risk: "Extreme", cost: 250000, xp: 250, unlocks: 45, icon: "🦘", continent: "OC" },
    { name: "Auckland", x: 92, y: 68, risk: "High", cost: 50000, xp: 120, unlocks: 20, icon: "🇳🇿", continent: "OC" },
    // ── 20 new destinations ──
    { name: "Amsterdam", x: 48, y: 22, risk: "Very High", cost: 80000, xp: 155, unlocks: 26, icon: "🚲", continent: "EU" },
    { name: "Madrid", x: 44, y: 32, risk: "High", cost: 50000, xp: 120, unlocks: 20, icon: "💃", continent: "EU" },
    { name: "Vienna", x: 52, y: 25, risk: "High", cost: 60000, xp: 128, unlocks: 22, icon: "🎻", continent: "EU" },
    { name: "Zurich", x: 49, y: 26, risk: "Extreme", cost: 180000, xp: 210, unlocks: 38, icon: "🏦", continent: "EU" },
    { name: "Stockholm", x: 52, y: 17, risk: "High", cost: 70000, xp: 135, unlocks: 24, icon: "🛳️", continent: "EU" },
    { name: "Athens", x: 54, y: 33, risk: "High", cost: 45000, xp: 105, unlocks: 18, icon: "🏛️", continent: "EU" },
    { name: "Warsaw", x: 53, y: 21, risk: "Medium", cost: 35000, xp: 92, unlocks: 15, icon: "🦅", continent: "EU" },
    { name: "Dublin", x: 45, y: 21, risk: "High", cost: 55000, xp: 122, unlocks: 21, icon: "🍺", continent: "EU" },
    { name: "Rio de Janeiro", x: 33, y: 60, risk: "Very High", cost: 55000, xp: 125, unlocks: 22, icon: "🏖️", continent: "SA" },
    { name: "Bogotá", x: 25, y: 48, risk: "Very High", cost: 65000, xp: 132, unlocks: 24, icon: "🌺", continent: "SA" },
    { name: "Lima", x: 26, y: 56, risk: "High", cost: 40000, xp: 98, unlocks: 16, icon: "🏔️", continent: "SA" },
    { name: "Casablanca", x: 46, y: 34, risk: "High", cost: 30000, xp: 85, unlocks: 14, icon: "🕌", continent: "AF" },
    { name: "Nairobi", x: 58, y: 48, risk: "Very High", cost: 45000, xp: 108, unlocks: 18, icon: "🦁", continent: "AF" },
    { name: "Johannesburg", x: 56, y: 55, risk: "Very High", cost: 70000, xp: 138, unlocks: 25, icon: "💎", continent: "AF" },
    { name: "Singapore", x: 77, y: 45, risk: "Extreme", cost: 220000, xp: 240, unlocks: 42, icon: "🦁", continent: "AS" },
    { name: "Jakarta", x: 79, y: 48, risk: "Very High", cost: 85000, xp: 150, unlocks: 27, icon: "🌴", continent: "AS" },
    { name: "Manila", x: 81, y: 41, risk: "Very High", cost: 75000, xp: 140, unlocks: 26, icon: "⛴️", continent: "AS" },
    { name: "Kyiv", x: 55, y: 22, risk: "High", cost: 50000, xp: 115, unlocks: 20, icon: "🌻", continent: "EU" },
    { name: "Toronto Islands", x: 24, y: 27, risk: "Medium", cost: 15000, xp: 55, unlocks: 9, icon: "🛶", continent: "NA" },
    { name: "Honolulu", x: 8, y: 44, risk: "High", cost: 95000, xp: 160, unlocks: 28, icon: "🌺", continent: "OC" },
  ];

  const riskColors: Record<string, string> = {
    "Low": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Medium": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "High": "bg-red-500/20 text-red-400 border-red-500/30",
    "Very High": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Extreme": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "Death Row": "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  const currentCity = player?.location ?? "New York";

  const formatCooldown = (ms: number) => {
    if (ms <= 0) return "Ready";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  const handleSelectCity = (cityName: string) => {
    if (isOnCooldown) return;
    setSelectedDest(cityName);
    setView("destination");
  };

  const handleFly = async () => {
    if (!selectedDest || isOnCooldown) return;
    setFlightFrom(currentCity);
    setFlightTo(selectedDest);
    setFlightProgress(0);
    setView("flight");

    // 5-minute flight animation
    const startTime = Date.now();
    flightTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / FLIGHT_DURATION) * 100);
      setFlightProgress(pct);
      if (pct >= 100) {
        if (flightTimerRef.current) clearInterval(flightTimerRef.current);
      }
    }, 100);

    // After 5 minutes, complete the flight
    setTimeout(async () => {
      if (flightTimerRef.current) clearInterval(flightTimerRef.current);
      setFlightProgress(100);
      try {
        await changeLocation({ location: selectedDest });
      } catch { /* already handled */ }
      // Set 15min cooldown
      const newCooldownEnd = Date.now() + COOLDOWN_DURATION;
      setCooldownEnd(newCooldownEnd);
      try { localStorage.setItem("airport_cooldown", String(newCooldownEnd)); } catch {}
      setView("map");
      setSelectedDest(null);
    }, FLIGHT_DURATION);
  };

  const handleResetCooldown = async () => {
    if ((player?.points ?? 0) < RESET_COST) return;
    setCooldownEnd(0);
    setAdminOverride(false);
    try { localStorage.removeItem("airport_cooldown"); } catch {}
    // Deduct points via a mutation if available, for now just reset client-side
  };

  const handleForceReset = () => {
    setCooldownEnd(0);
    setAdminOverride(true);
    try { localStorage.removeItem("airport_cooldown"); } catch {}
  };

  if (!player) return <div className="animate-pulse py-10 text-center text-muted-foreground">Loading...</div>;

  // ═══ FLIGHT ANIMATION VIEW ═══
  if (view === "flight") {
    const fromCity = worldCities.find(c => c.name === flightFrom);
    const toCity = worldCities.find(c => c.name === flightTo);
    const fx = fromCity?.x ?? 25;
    const fy = fromCity?.y ?? 32;
    const tx = toCity?.x ?? 50;
    const ty = toCity?.y ?? 30;
    const planeX = fx + (tx - fx) * (flightProgress / 100);
    const planeY = fy + (ty - fy) * (flightProgress / 100) - Math.sin((flightProgress / 100) * Math.PI) * 8;
    const elapsed = Math.floor((flightProgress / 100) * FLIGHT_DURATION);
    const remaining = FLIGHT_DURATION - elapsed;
    const rMin = Math.floor(remaining / 60000);
    const rSec = Math.floor((remaining % 60000) / 1000);
    const flightPhase = flightProgress < 10 ? "Taking off" : flightProgress < 30 ? "Climbing" : flightProgress < 70 ? "Cruising at 35,000ft" : flightProgress < 90 ? "Descending" : "Approaching";

    return (
      <div className="animate-fade-in space-y-4">
        <div className="text-center">
          <div className="text-sm font-bold text-cyan-300">✈️ Flight in Progress</div>
          <div className="text-[10px] text-muted-foreground">{flightFrom} → {flightTo}</div>
        </div>
        {/* Flight map with animated plane */}
        <div className="relative rounded-xl overflow-hidden border border-cyan-500/20" style={{ background: "linear-gradient(135deg, #0a1628, #0d1f3c, #0a1628)", height: 260 }}>
          {/* Ocean/grid pattern */}
          <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="flightGrid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(100,200,255,0.05)" strokeWidth="0.1" /></pattern>
            </defs>
            <rect width="100" height="80" fill="url(#flightGrid)" />
            {/* Flight path (curved) */}
            <path d={`M ${fx} ${fy} Q ${(fx+tx)/2} ${Math.min(fy,ty) - 8} ${tx} ${ty}`} fill="none" stroke="rgba(100,200,255,0.3)" strokeWidth="0.3" strokeDasharray="1,1" />
            {/* Traveled path */}
            <path d={`M ${fx} ${fy} Q ${(fx+tx)/2} ${Math.min(fy,ty) - 8} ${tx} ${ty}`} fill="none" stroke="rgba(0,200,255,0.6)" strokeWidth="0.4" strokeDasharray="2,1" strokeDashoffset={100 - flightProgress} />
            {/* From dot */}
            <circle cx={fx} cy={fy} r="1" fill="#22c55e" />
            {/* To dot */}
            <circle cx={tx} cy={ty} r="1" fill="#f59e0b" />
            {/* Plane */}
            <text x={planeX} y={planeY} textAnchor="middle" dominantBaseline="middle" fontSize="3" className="drop-shadow-lg">✈️</text>
          </svg>
          {/* HUD overlay */}
          <div className="absolute top-3 left-3 space-y-1">
            <div className="text-[9px] text-cyan-300 font-mono bg-black/50 px-2 py-0.5 rounded">{flightPhase}</div>
            <div className="text-[9px] text-green-400 font-mono bg-black/50 px-2 py-0.5 rounded">ALT: {Math.floor(35000 * Math.min(1, flightProgress < 30 ? flightProgress/30 : flightProgress > 90 ? (100-flightProgress)/10 : 1))} ft</div>
            <div className="text-[9px] text-amber-400 font-mono bg-black/50 px-2 py-0.5 rounded">SPD: {flightProgress < 10 ? Math.floor(flightProgress * 40) : flightProgress > 90 ? Math.floor((100 - flightProgress) * 40) : 560} mph</div>
          </div>
          <div className="absolute top-3 right-3 text-[9px] text-slate-300 font-mono bg-black/50 px-2 py-0.5 rounded">
            ETA {rMin}m {rSec}s
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex justify-between text-[8px] text-slate-400 mb-1"><span>{flightFrom}</span><span>{flightTo}</span></div>
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${flightProgress}%`, background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)" }} />
            </div>
          </div>
        </div>
        <div className="text-center text-[10px] text-muted-foreground">Your plane is {flightProgress < 30 ? "gaining altitude" : flightProgress < 70 ? "cruising over the ocean" : "beginning its descent"}. Sit tight...</div>
      </div>
    );
  }

  // ═══ DESTINATION DETAIL VIEW ═══
  if (view === "destination" && selectedDest) {
    const city = worldCities.find(c => c.name === selectedDest)!;
    const fromCity = worldCities.find(c => c.name === currentCity);
    const dist = fromCity && city ? Math.sqrt(Math.pow(fromCity.x - city.x, 2) + Math.pow(fromCity.y - city.y, 2)) : 30;
    const estimatedMin = Math.max(1, Math.round(dist * 0.12));
    const canFly = !isOnCooldown && (player.money ?? 0) >= city.cost && player.level >= city.unlocks;

    return (
      <div className="animate-fade-in space-y-4">
        <button onClick={() => setView("map")} className="px-3 py-1.5 bg-secondary rounded-lg text-xs hover:bg-secondary/80 transition">← Back to World Map</button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{city.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedDest}</h2>
            <div className="text-[10px] text-muted-foreground">{city.continent} · {Math.round(dist * 150)}km from {currentCity}</div>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-[10px] font-bold border ${riskColors[city.risk]}`}>{city.risk} RISK</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground uppercase">Cost</div><div className="text-lg font-black text-yellow-400">${city.cost.toLocaleString()}</div></div>
          <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground uppercase">XP</div><div className="text-lg font-black text-purple-400">+{city.xp}</div></div>
          <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground uppercase">Unlocks</div><div className="text-lg font-black text-cyan-400">Lv.{city.unlocks}</div></div>
          <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground uppercase">Flight Time</div><div className="text-lg font-black text-blue-400">~{estimatedMin}min</div></div>
        </div>
        <div className="mafia-card rounded-xl p-4 border border-cyan-500/20">
          <div className="text-sm font-bold text-cyan-300 mb-1">✈️ Flight Details</div>
          <div className="text-[10px] text-muted-foreground space-y-1">
            <div>• Flight time: ~5 minutes (realistic)</div>
            <div>• After landing, 15-minute cooldown before next flight</div>
            <div>• Admin can override cooldown for testing</div>
            <div>• Cost: ${city.cost.toLocaleString()} deducted on takeoff</div>
            {city.unlocks > (player.level ?? 1) && <div className="text-red-400">• Requires Level {city.unlocks} (you are Level {player.level ?? 1})</div>}
          </div>
        </div>
        <button onClick={handleFly} disabled={!canFly}
          className="w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500">
          {isOnCooldown ? `⏱️ Cooldown: ${formatCooldown(cooldownRemaining)}` : (player.money ?? 0) < city.cost ? "💸 Not enough money" : player.level < city.unlocks ? `🔒 Level ${city.unlocks} required` : `✈️ Fly to ${selectedDest} — $${city.cost.toLocaleString()}`}
        </button>
      </div>
    );
  }

  // ═══ WORLD MAP VIEW ═══
  const currentCityObj = worldCities.find(c => c.name === currentCity) || worldCities[0];

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plane className="size-7 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Airport</h2>
            <div className="text-[10px] text-muted-foreground">World Travel System · Fly between {worldCities.length} cities</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Current Location</div>
          <div className="text-sm font-bold text-cyan-300">{currentCityObj.icon} {currentCity}</div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground">💰 Cash</div><div className="text-sm font-black text-green-400">${(player.money ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground">⭐ Points</div><div className="text-sm font-black text-amber-400">{(player.points ?? 0).toLocaleString()}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground">⏱️ Cooldown</div><div className={`text-sm font-black ${isOnCooldown ? "text-red-400" : "text-green-400"}`}>{isOnCooldown ? formatCooldown(cooldownRemaining) : "Ready"}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center border border-slate-700/30"><div className="text-[10px] text-muted-foreground">📍 Cities</div><div className="text-sm font-black text-cyan-400">{worldCities.length}</div></div>
      </div>

      {/* Cooldown Controls */}
      <div className="mafia-card rounded-xl p-3 border border-slate-700/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">⏱️ Flight Cooldown</span>
            {isOnCooldown && <span className="text-[10px] text-red-400">Next flight in {formatCooldown(cooldownRemaining)}</span>}
            {!isOnCooldown && <span className="text-[10px] text-green-400">Ready to fly!</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleResetCooldown} disabled={isOnCooldown || (player.points ?? 0) < RESET_COST}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 disabled:opacity-40">
              🔄 Reset Cooldown ({RESET_COST} pts)
            </button>
            <button onClick={handleForceReset}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30">
              🛡️ Admin Override
            </button>
          </div>
        </div>
        {adminOverride && <div className="text-[9px] text-red-400 mt-1">⚠️ Admin override active — cooldown bypassed</div>}
      </div>

      {/* World Map */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/20" style={{ background: "linear-gradient(135deg, #050d1a, #0a1628, #061020)", aspectRatio: "2/1" }}>
        {/* Grid lines */}
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="mapGrid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(100,200,255,0.04)" strokeWidth="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="50" fill="url(#mapGrid)" />
          {/* Simplified continent outlines */}
          {/* North America */}
          <path d="M 8,15 Q 12,12 18,14 Q 24,10 28,15 Q 30,20 28,25 Q 24,30 20,35 Q 16,38 12,36 Q 8,32 6,25 Q 6,20 8,15" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.15)" strokeWidth="0.2" />
          {/* South America */}
          <path d="M 24,38 Q 28,36 32,40 Q 34,48 32,55 Q 30,62 28,65 Q 26,68 24,65 Q 22,58 22,50 Q 22,42 24,38" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.2" />
          {/* Europe */}
          <path d="M 44,12 Q 48,10 54,12 Q 58,14 56,18 Q 52,20 48,22 Q 44,20 42,16 Z" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.15)" strokeWidth="0.2" />
          {/* Africa */}
          <path d="M 44,28 Q 48,26 54,28 Q 58,32 60,40 Q 60,50 56,56 Q 50,60 46,56 Q 42,48 42,38 Q 42,32 44,28" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.2" />
          {/* Asia */}
          <path d="M 58,10 Q 68,8 78,12 Q 85,16 88,20 Q 90,28 86,32 Q 80,36 72,38 Q 64,36 60,30 Q 56,22 58,10" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.15)" strokeWidth="0.2" />
          {/* Australia */}
          <path d="M 80,52 Q 86,50 92,54 Q 94,58 90,62 Q 84,64 80,60 Q 78,56 80,52" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.2" />
          {/* Current location pulsing ring */}
          <circle cx={currentCityObj.x} cy={currentCityObj.y / 2} r="3" fill="none" stroke="rgba(0,200,255,0.4)" strokeWidth="0.15">
            <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
        {/* City dots */}
        {worldCities.map((city) => {
          const isCurrent = city.name === currentCity;
          const canAfford = (player.money ?? 0) >= city.cost;
          const meetsLevel = (player.level ?? 1) >= city.unlocks;
          const locked = !meetsLevel;
          return (
            <button key={city.name}
              onClick={() => handleSelectCity(city.name)}
              disabled={locked && !isCurrent}
              className={`absolute group transition-all ${locked && !isCurrent ? "opacity-30 cursor-not-allowed" : "hover:scale-125 cursor-pointer"}`}
              style={{ left: `${city.x}%`, top: `${city.y}%`, transform: "translate(-50%, -50%)" }}>
              <div className={`relative flex flex-col items-center ${isCurrent ? "" : ""}`}>
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${isCurrent ? "bg-cyan-400 border-cyan-300 shadow-lg shadow-cyan-400/50" : locked ? "bg-slate-600 border-slate-500" : canAfford ? "bg-green-400 border-green-300" : "bg-amber-400 border-amber-300"}`} />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <div className={`text-[7px] font-bold ${isCurrent ? "text-cyan-300" : "text-slate-300"}`}>{city.icon} {city.name}</div>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 w-36">
                  <div className="bg-slate-900/95 border border-slate-700/50 rounded-lg p-2 text-left shadow-xl">
                    <div className="text-[9px] font-bold text-white">{city.icon} {city.name}</div>
                    <div className="text-[8px] text-muted-foreground">${city.cost.toLocaleString()} · +{city.xp} XP</div>
                    <div className="text-[8px]">Lv.{city.unlocks} · <span className={city.risk === "Death Row" ? "text-red-400" : city.risk === "Extreme" ? "text-purple-400" : "text-yellow-400"}>{city.risk}</span></div>
                    {isCurrent && <div className="text-[8px] text-cyan-400 font-bold mt-0.5">📍 You are here</div>}
                    {locked && !isCurrent && <div className="text-[8px] text-red-400 mt-0.5">🔒 Level {city.unlocks} req</div>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {/* Map legend */}
        <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-1 flex items-center gap-3">
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /><span className="text-[7px] text-slate-400">Current</span></div>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-[7px] text-slate-400">Affordable</span></div>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="text-[7px] text-slate-400">Locked</span></div>
        </div>
      </div>

      {/* City List */}
      <div className="text-xs font-bold text-muted-foreground">🏙️ All Destinations ({worldCities.length} cities)</div>
      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {worldCities.sort((a, b) => a.cost - b.cost).map((city) => {
          const isCurrent = city.name === currentCity;
          const meetsLevel = (player.level ?? 1) >= city.unlocks;
          const canAfford = (player.money ?? 0) >= city.cost;
          return (
            <div key={city.name}
              onClick={() => !isCurrent && handleSelectCity(city.name)}
              className={`mafia-card rounded-lg p-2.5 flex items-center gap-3 border transition-all ${isCurrent ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-700/20 hover:border-cyan-500/20 cursor-pointer"}`}>
              <span className="text-lg">{city.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{city.name}</div>
                <div className="text-[9px] text-muted-foreground">Lv.{city.unlocks} · +{city.xp} XP</div>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${riskColors[city.risk]}`}>{city.risk}</span>
              <div className="text-right">
                <div className={`text-[10px] font-bold ${canAfford ? "text-yellow-400" : "text-red-400"}`}>${city.cost.toLocaleString()}</div>
                {isCurrent && <div className="text-[8px] text-cyan-400">📍 Here</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FamilyChatPage() { return <ChatHubPage initialChannel="family" />; }
function SecretChallengesPage() { return <SecretChallengesHubPage />; }

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

function CrewBankPage() { return <CrewHubPage initialTab="bank" />; }
function CrewWarPage() { return <CrewHubPage initialTab="war" />; }
function CrewTerritoryPage() { return <CrewHubPage initialTab="territory" />; }
function CrewLeaderboardPage() { return <LeaderboardPage title="Crew Leaderboard" icon="🏆" />; }
function CrewChallengesPage() { return <CrewHubPage initialTab="challenges" />; }
function CrewAlliancePage() { return <CrewHubPage initialTab="alliance" />; }

function InterestRatesPage() { return <MoneyHubPage initialTab="interest" />; }
function CreditScorePage() { return <MoneyHubPage initialTab="credit" />; }
function HealthInsurancePage() { return <MoneyHubPage initialTab="insurance" />; }
function LifeInsurancePage() { return <MoneyHubPage initialTab="insurance" />; }
function AutoShopPage() { return <CarTuningPage />; }
function OffshorePage() { return <MoneyHubPage initialTab="offshore" />; }

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

  // Show loading while Convex query resolves — don't flash registration form on refresh
  if (player === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">🎮</div>
          <div className="text-sm font-bold text-muted-foreground">Loading Shadow Empire...</div>
        </div>
      </div>
    );
  }

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

  const getLeftMenuSections = () => LEFT_MENU_SECTIONS;
  const getRightMenuSections = () => RIGHT_MENU_SECTIONS;

  const renderPage = () => {
    switch (activePage) {
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <FullBankPage />;
      case "crack_safe": return <CrackSafePage />;
      case "supply_running": return <SupplyRunningPage />;
      case "dead_alive": return <DeadAlivePage />;
      case "real_estate": return <RealEstatePage />;
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
      case "inventory": return <InventoryPage />;
      case "objectives": return <ObjectivesPage />;
      case "point_store": return <PointStorePage />;
      case "coin_store": return <CoinStorePage />;
      case "steal_house": return <CriminalOperationsPage category="steal_house" />;
      case "organized_crime": return <OrganizedCrimeTeamsPage />;
      case "arsenal_arena": return <ArenaPage />;
      case "arsenal_trainer": return <TrainerPage />;
      case "arsenal_range": return <RangePage />;
      case "arsenal_race": return <RaceStakesPage />;
      case "arsenal_hotel": return <HotelPage />;
      case "arsenal_informant": return <TipsyInformantPage />;
      case "rackets_hub": case "x_dock": return <RacketsHubPage />;
      case "mega_street": return <MegaStreetCrimes />;
      case "actions500": return <Actions500Page />;
      case "mega_heists": return <BigHeistsPage />;
      case "mega_odd": return <OddJobsPage />;
      case "mega_social": return <SocialHubPage />;
      case "mega_fronts": return <FrontsHubPage />;
      case "mega_vice": return <ViceDenPage />;
      case "mega_city": return <CityDeskPage />;
      case "x_chop": return <ChopShopPage />;
      case "x_graffiti": return <GraffitiPage />;
      case "x_pawn": return <PawnPage />;
      case "x_cab": return <CabPage />;
      case "x_dogs": return <DogsPage />;
      case "x_nightmarket": return <NightMarketPage />;
      case "x_cable": return <CablePage />;
      case "x_numbers": return <NumbersPage />;
      case "x_valet": return <ValetPage />;
      case "x_bath": return <BathhousePage />;
      case "x_billboards": return <BillboardPage />;
      case "missions": return <FullMissionsPage />;
      case "murder": return <CriminalOperationsPage category="murder" />;
      case "heist": return <HeistPage />;
      case "season_progress": return (
        <div className="space-y-5">
          <Suspense fallback={<div className="animate-pulse py-8 text-center text-muted-foreground">Loading Season Store…</div>}><SeasonStorePanel /></Suspense>
          <Suspense fallback={<div className="animate-pulse py-8 text-center text-muted-foreground">Loading Season Pass…</div>}><SeasonPassPage /></Suspense>
        </div>
      );
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
      case "crew_safehouse": return <CrewHubPage initialTab="safehouse" />;
      case "prestige": return <PrestigeLegacyPage />;
      case "skill_tree": return <SkillTreePage />;
      case "titles": return <TitlesPage />;
      case "achievements": return <AchievementsPage />;
      case "leaderboards": return <LeaderboardsPage />;
      case "season_pass": return (
        <div className="space-y-5">
          <Suspense fallback={<div className="animate-pulse py-8 text-center text-muted-foreground">Loading Season Store…</div>}><SeasonStorePanel /></Suspense>
          <Suspense fallback={<div className="animate-pulse py-8 text-center text-muted-foreground">Loading Season Pass…</div>}><SeasonPassPage /></Suspense>
        </div>
      );
      case "daily_challenges": return <DailyChallengesPage />;
      case "energy_drinks": return <EnergyDrinksPage />;
      case "ghost_mode": return <GhostModePage />;
      case "secret_challenges": return <SecretChallengesPage />;
      case "reputation": return <ReputationPage />;
      case "wanted_status": return <WantedStatusPage />;
      case "prison": return <PrisonPage />;
      case "quicktrade": return <QuickTradePage />;
      case "demolition_derby": return <DemolitionDerbyPage />;
      case "armoury": return <ArmouryPage />;
      case "companies_hub": return <CompaniesHubPage />;
      case "witness_statements": return <WitnessStatementsPage />;
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
      case "neighborhoods": return <WorldHubPage initialTab="districts" />;
      case "dynamic_events": return <WorldHubPage initialTab="events" />;
      case "event_calendar": return <LiveEventCalendar />;
      case "messages": return <MessagesPage />;
      case "inbox": return <InboxPage />;
      case "notifications_page": return <NotificationsPage />;
      case "forum_general": return <ForumPage forum="general" />;
      case "forum_sales": return <ForumPage forum="sales" />;
      case "forum_offtopic": return <ForumPage forum="offtopic" />;
      case "forum_shadows": return <ForumPage forum="shadows" />;
      case "forum_search": return <ForumSearchPage />;
      case "crew_chat": return <ChatHubPage initialChannel="crew" />;
      case "family_chat": return <FamilyChatPage />;
      case "global_chat": return <ChatHubPage initialChannel="global" />;
      case "trade_chat": return <ChatHubPage initialChannel="trade" />;
      case "lfg": return <ChatHubPage initialChannel="lfg" />;
      case "airport": return <AirportPage />;
      case "weather": return <WeatherPage />;
      case "news_ticker": return <NewsTickerPage />;
      case "city_map": return <WorldHubPage initialTab="map" />;
      case "city_overview": return <CityOverviewPage />;
      case "statistics": return <StatisticsPage />;
      case "world_map": return <WorldMapPage />;
      case "faq": return <FAQPage />;
      case "support": return <LiveSupportPage />;
      case "events_hub": return <EventsHubPage />;
      case "community": return <CommunityPage />;
      case "reports": return <ReportsHubPage />;
      case "promo_codes": return <PromoCodesPage />;
      case "qs_market": return <QsMarketPage />;
      case "daily_rewards": return (
        <div className="animate-fade-in space-y-4 relative">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <h2 className="text-2xl font-black tracking-wide text-amber-300">Daily Rewards</h2>
              <p className="text-[10px] text-amber-400/60">Match symbols on the board — every pair is a prize, up to X8 per game. New board every 15 minutes.</p>
            </div>
          </div>
          <Suspense fallback={<div className="mafia-card rounded-xl p-8 animate-pulse text-center text-sm text-muted-foreground">Shuffling the board…</div>}>
            <DailyRewardGame />
          </Suspense>
        </div>
      );
      case "drug_trade": return <DrugTradePage />;
      case "admin_panel": return <AdminPanel />;
      case "become_admin": return <BecomeAdminPage />;
      case "casinos": return <CasinosPage />;
      case "casino_blackjack": return <CasinoBlackjackPage />;
      case "casino_dice": return <CasinoDicePage />;
      case "casino_roulette": return <CasinoRoulettePage />;
      case "casino_racetrack": return <CasinoRacetrackPage />;
      case "casino_videopoker": return <CasinoVideoPokerPage />;
      case "casino_scratchcards": return <CasinoScratchcardsPage />;
      case "betting_lms": return <BettingLmsPage />;
      case "betting_champions": return <BettingChampionsPage />;
      case "betting_sports": return <BettingSportsPage />;
      case "betting_multidice": return <BettingMultiDicePage />;
      case "betting_poker": return <BettingPokerNightPage />;
      case "betting_mpblackjack": return <BettingMpBlackjackPage />;
      case "record_kills": return <RecordKillsPage />;
      case "record_crimes": return <RecordCrimesPage />;
      case "record_gta": return <RecordGtaPage />;
      case "record_points": return <RecordPointsPage />;
      case "record_bullets": return <RecordBulletsPage />;
      case "record_busts": return <RecordBustsPage />;
      case "record_stock": return <RecordStockPage />;
      case "record_betting": return <RecordBettingPage />;
      case "record_assassination": return <RecordAssassinationPage />;
      case "record_packs": return <RecordPacksPage />;
      case "record_heists": return <RecordHeistsPage />;
      case "record_supply": return <RecordSupplyPage />;
      case "record_casino": return <RecordCasinoPage />;
      case "online_players": return <PresencePage />;
      case "poker_texas": return <PokerTexasPage />;
      case "craps": return <CrapsPage />;
      case "blackjack": return <BlackjackPage />;
      case "lotto": return <LottoPage />;
      case "coin_flip": return <CoinFlipPage />;
      case "crime_hub": return <CrimeHub />;
      case "my_profile": return <MyProfilePage />;
      case "duel": return <ArenaHubPage initialTab="duel" />;
      case "ctf": return <ArenaHubPage initialTab="duel" />;
      case "koth": return <ArenaHubPage initialTab="ladder" />;
      case "battle_royale": return <ArenaHubPage initialTab="duel" />;
      case "ladder": return <ArenaHubPage initialTab="ladder" />;
      case "champion": return <ArenaHubPage initialTab="ladder" />;
      case "ambush": return <ArenaHubPage initialTab="ambush" />;
      case "counterfeiting": return <CrimeOpsHubPage initialTab="counterfeit" />;
      case "drug_trafficking": return <CrimeOpsHubPage initialTab="traffic" />;
      case "arson": return <CrimeOpsHubPage initialTab="arson" />;
      case "identity_theft": return <CrimeOpsHubPage initialTab="identity" />;
      case "arms_deal": return <CrimeOpsHubPage initialTab="arms" />;
      case "tax_evasion": return <CrimeOpsHubPage initialTab="tax" />;
      case "racketeering": return <CrimeOpsHubPage initialTab="racket" />;
      case "arena_hub": return <ArenaHubPage />;
      case "crime_ops": return <CrimeOpsHubPage />;
      case "crew_hub": return <CrewHubPage />;
      case "world_hub": return <WorldHubPage />;
      case "property_hub": return <PropertyHubPage />;
      case "daily_hub": return <DailyHubPage />;
      case "money_hub": return <MoneyHubPage />;
      case "streak_rewards": return <StreakRewardsPage />;
      case "milestones": return <MilestonesBadgesPage />;
      case "player_of_week": return <FamePage />;
      case "vip_lounge": return <VipLoungePage />;
      case "flash_deals": return <FlashDealsPage />;
      case "lottery_rollover": return <LotteryRolloverPage />;
      case "boss_invasion": return <BossInvasionPage />;
      case "bug_bounty": return <BugBountyPage />;
      case "economy_heatmap": return <EconomyHeatmapPage />;
      case "business_empire": return <BusinessEmpirePage />;
      case "property_flip": return <PropertyFlipPage />;
      case "stall_market": return <StallMarketPage />;
      case "escrow_trades": return <EscrowTradePage />;
      case "gambling_debts": return <GamblingDebtsPage />;
      case "casino_tables": return <CasinoTablesPage />;
      case "race_betting": return <RaceBettingPage />;
      case "treasure_hunt": return <TreasureHuntPage />;
      case "fuel_market": return <FuelMarketPage />;
      case "car_tuning": return <CarTuningPage />;
      default:
        return <GenericStub title="Crime" icon="🔪" />;
    }
  };

  const inPrison = player?.inPrison;
  const igCoins = (player as any)?.coins ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LiveGameBanner />
      <PromoBanner />
      <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
        <aside className={`${mobileMenuOpen ? "fixed inset-0 z-50 bg-black/50" : "hidden"} md:block md:relative md:w-64 shrink-0 border-r border-amber-500/10 overflow-y-auto`} style={{ background: 'linear-gradient(180deg, oklch(0.06 0.015 35), oklch(0.05 0.01 40))' }}>
          {/* Search Box */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
              <input
                type="text"
                value={leftSearch}
                onChange={(e) => setLeftSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors"
              />
              {leftSearch && (
                <button onClick={() => setLeftSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
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
          {/* ═══ EMPIRE TOP BAR — cinematic HUD ═══ */}
          <EmpireTopBar activePage={activePage} onNavigate={setPage} />
          <div className="p-4 md:p-6 animate-page-enter" key={activePage}>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
                  <div className="text-4xl animate-pulse">🎮</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Shadow Empire…</div>
                </div>
              }>
                {renderPage()}
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>

        {/* Always-mounted OC crew watcher: ping sounds + floating lobby card */}
        <Suspense fallback={null}>
          <OcFloatingCrew active={activePage === "organized_crime"} onOpen={() => setPage("organized_crime")} />
        </Suspense>

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
                {/* INTELLIGENCE — your current advantage */}
                <div className="mt-2 rounded-lg p-2 border border-violet-500/25 bg-violet-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-300">🧠 Intelligence</span>
                    <span className="text-[11px] font-black text-violet-200 tabular-nums">+{Math.floor((player?.level ?? 1) / 5)}%</span>
                  </div>
                  <div className="text-[9px] text-violet-300/70 mt-0.5 leading-snug">Your current advantage — +1% XP & cash bonus for all training every 5 levels.</div>
                  <div className="mt-1 flex justify-between text-[9px] font-bold">
                    <span className="text-sky-300">👤 Solo +{Math.floor((player?.level ?? 1) / 5)}%</span>
                    <span className="text-emerald-300">👥 Team +{Math.floor((player?.level ?? 1) / 5) * 2}%</span>
                  </div>
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

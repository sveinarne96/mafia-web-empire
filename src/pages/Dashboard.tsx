import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
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
import { LiveEventBanner, EventsList } from "@/components/EventBanner";
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
  GiftingPage, HitListPage, CrimeCategoryPage as CCP,
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

function SafePage({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  if (error) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="mafia-card rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <div className="text-sm font-bold text-red-400">Page Error</div>
          <div className="text-xs text-muted-foreground">{error}</div>
          <button onClick={() => { setError(null); window.location.reload(); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs">Reload</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

const leftMenuSections = [
  { title: "Overview", icon: Home, items: [
    { label: "Headquarters", page: "headquarters", icon: "🏠" },
    { label: "Bank", page: "bank", icon: "🏦" },
    { label: "Hospital", page: "hospital", icon: "🏥" },
    { label: "Points Shop", page: "points", icon: "🏆" },
    { label: "My Profile", page: "profile", icon: "👤" },
    { label: "Game Updates", page: "updates", icon: "📜" },
  ]},
  { title: "Crimes", icon: Flame, items: [
    { label: "Street Crimes", page: "crimes", icon: "🔪" },
    { label: "Robberies & Heists", page: "robbery", icon: "💰" },
    { label: "Fraud & Scams", page: "fraud", icon: "🎭" },
    { label: "Burglary", page: "burglary", icon: "🏠" },
    { label: "Drug Operations", page: "drugs", icon: "💊" },
    { label: "Organized Crime", page: "organized", icon: "👥" },
    { label: "Underground", page: "underground", icon: "💣" },
    { label: "Illegal Transport", page: "transport", icon: "🚛" },
    { label: "Steal From House", page: "steal_from_house", icon: "🏠" },
    { label: "GTA Car Theft", page: "gta_car_theft", icon: "🚗" },
    { label: "Crime Empire", page: "crime_empire", icon: "🗺️" },
    { label: "Heist Planning", page: "heist_planning", icon: "🎯" },
    { label: "Murder", page: "kill", icon: "🗡️" },
    { label: "Crime Spree", page: "crime_spree", icon: "🔥" },
  ]},
  { title: "Combat", icon: Swords, items: [
    { label: "1v1 Duel", page: "duel_1v1", icon: "⚔️" },
    { label: "Crew Wars", page: "crew_wars", icon: "🏴" },
    { label: "Capture the Flag", page: "ctf", icon: "🚩" },
    { label: "King of the Hill", page: "koth", icon: "👑" },
    { label: "Battle Royale", page: "battle_royale", icon: "🎯" },
    { label: "Ladder System", page: "ladder", icon: "📊" },
    { label: "Champion Title", page: "champion", icon: "🏆" },
    { label: "Ambush", page: "ambush", icon: "🔥" },
  ]},
  { title: "Gambling", icon: Crown, items: [
    { label: "Blackjack", page: "blackjack", icon: "🃏" },
    { label: "Poker Texas Holdem", page: "poker_texas", icon: "🂡" },
    { label: "Poker Omaha", page: "poker_omaha", icon: "🂱" },
    { label: "Roulette", page: "roulette", icon: "🎡" },
    { label: "Craps", page: "craps", icon: "🎲" },
    { label: "Slots", page: "slots", icon: "🎰" },
    { label: "Lottery", page: "lotto", icon: "🎟️" },
    { label: "Powerball", page: "powerball", icon: "⚡" },
    { label: "Coin Flip", page: "coin_flip", icon: "🪙" },
    { label: "Wheel of Fortune", page: "wheel", icon: "🎡" },
    { label: "Horse Racing", page: "horse_racing", icon: "🏇" },
    { label: "Scratch Cards", page: "scratch_cards", icon: "🎰" },
    { label: "Bingo", page: "bingo", icon: "🎯" },
    { label: "Keno", page: "keno", icon: "🔢" },
    { label: "Higher or Lower", page: "higher_lower", icon: "⬆️" },
    { label: "Blackjack Switch", page: "bj_switch", icon: "🔄" },
  ]},
  { title: "Missions", icon: Target, items: [
    { label: "Storyline Missions", page: "storyline", icon: "📖" },
    { label: "Side Missions", page: "side_missions", icon: "📋" },
    { label: "Daily Missions", page: "daily_missions", icon: "📅" },
    { label: "Weekly Missions", page: "weekly_missions", icon: "📆" },
    { label: "Monthly Missions", page: "monthly_missions", icon: "🗓️" },
  ]},
  { title: "Economy", icon: Coins, items: [
    { label: "Bank Account", page: "bank_account", icon: "🏦" },
    { label: "Bank Robbery", page: "bank_robbery", icon: "💰" },
    { label: "Interest Rates", page: "interest_rates", icon: "📈" },
    { label: "Credit Score", page: "credit_score", icon: "💳" },
    { label: "Health Insurance", page: "health_insurance", icon: "🏥" },
    { label: "Life Insurance", page: "life_insurance", icon: "❤️" },
    { label: "Crypto Mining", page: "crypto", icon: "⛏️" },
    { label: "Crypto Trading", page: "crypto_trading", icon: "📊" },
    { label: "Auto Shop", page: "auto_shop", icon: "🚗" },
    { label: "Offshore Accounts", page: "offshore", icon: "🏝️" },
    { label: "Daily Spin", page: "daily_spin", icon: "🎰" },
    { label: "Referral System", page: "referral", icon: "🔗" },
    { label: "Crafting", page: "crafting", icon: "🔧" },
  ]},
  { title: "Assets", icon: Package, items: [
    { label: "Garage", page: "garage", icon: "🚗" },
    { label: "My Items", page: "items", icon: "🎒" },
    { label: "Black Market", page: "black_market", icon: "🖤" },
    { label: "Legendary Items", page: "legendary_items", icon: "✨" },
    { label: "Bodyguards", page: "bodyguards", icon: "🛡️" },
    { label: "Mystery Boxes", icon: "📦", children: [
      { label: "Standard Box", page: "box_standard", icon: "📦" },
      { label: "Premium Box", page: "box_premium", icon: "💎" },
      { label: "Legendary Box", page: "box_legendary", icon: "👑" },
      { label: "Seasonal Box", page: "box_seasonal", icon: "🎄" },
      { label: "Crime Box", page: "box_crime", icon: "🔪" },
      { label: "Combat Box", page: "box_combat", icon: "⚔️" },
      { label: "Guaranteed Legendary", page: "box_guaranteed", icon: "⭐" },
      { label: "Limited Edition", page: "box_limited", icon: "🔥" },
    ]},
  ]},
  { title: "Social", icon: Users, items: [
    { label: "Crew System", page: "crew", icon: "🤝" },
    { label: "Crew Ranks", page: "crew_ranks", icon: "📊" },
    { label: "Crew Bank", page: "crew_bank", icon: "🏦" },
    { label: "Crew War", page: "crew_war", icon: "⚔️" },
    { label: "Crew Alliance", page: "crew_alliance", icon: "🤝" },
    { label: "Crew Territory", page: "crew_territory", icon: "📍" },
    { label: "Crew Challenges", page: "crew_challenges", icon: "🎯" },
    { label: "Crew Leaderboard", page: "crew_leaderboard", icon: "🏆" },
    { label: "Family System", page: "family", icon: "👨‍👩‍👦" },
  ]},
  { title: "Progression", icon: TrendingUp, items: [
    { label: "Skill Tree", page: "skill_tree", icon: "🧠" },
    { label: "Combat Skills", page: "combat_skills", icon: "⚔️" },
    { label: "Stealth Skills", page: "stealth_skills", icon: "🥷" },
    { label: "Hacking Skills", page: "hacking_skills", icon: "💻" },
    { label: "Prestige", page: "prestige", icon: "⭐" },
    { label: "Prestige Shop", page: "prestige_shop", icon: "🛒" },
    { label: "Titles", page: "titles", icon: "👑" },
    { label: "Achievements", page: "achievements", icon: "🏅" },
    { label: "Legacy", page: "legacy", icon: "📜" },
    { label: "Leaderboards", icon: "📊", children: [
      { label: "Level Board", page: "lb_level", icon: "📊" },
      { label: "Money Board", page: "lb_money", icon: "💰" },
      { label: "Kill Board", page: "lb_kills", icon: "💀" },
      { label: "Crime Board", page: "lb_crimes", icon: "🔥" },
      { label: "Crew Board", page: "lb_crew", icon: "🤝" },
      { label: "Family Board", page: "lb_family", icon: "👨‍👩‍👦" },
      { label: "Territory Board", page: "lb_territory", icon: "📍" },
      { label: "Gambling Board", page: "lb_gambling", icon: "🎲" },
      { label: "Mission Board", page: "lb_missions", icon: "🎯" },
      { label: "Season Board", page: "lb_season", icon: "🗓️" },
    ]},
    { label: "Season Pass", page: "season_pass", icon: "🎫" },
    { label: "Daily Login", page: "daily_login", icon: "🎁" },
    { label: "Daily Challenges", page: "daily_challenges", icon: "📋" },
    { label: "Energy Drinks", page: "energy_drinks", icon: "⚡" },
  ]},
  { title: "Special", icon: Sparkles, items: [
    { label: "Ghost Mode", icon: "👻", children: [
      { label: "Activate Ghost", page: "ghost_mode", icon: "👻" },
      { label: "Ghost Status", page: "ghost_status", icon: "👁️" },
      { label: "Ghost History", page: "ghost_history", icon: "📋" },
    ]},
    { label: "Secret Challenges", icon: "🔮", children: [
      { label: "Daily Secret", page: "secret_daily", icon: "🔮" },
      { label: "Weekly Secret", page: "secret_weekly", icon: "💎" },
      { label: "Hidden Achievements", page: "secret_achievements", icon: "🏆" },
      { label: "Easter Eggs", page: "secret_eggs", icon: "🥚" },
      { label: "Secret Crime", page: "secret_crime", icon: "🕵️" },
    ]},
    { label: "Reputation", page: "reputation", icon: "🌍" },
    { label: "Wanted Status", page: "wanted", icon: "🔴" },
    { label: "Prison", page: "prison", icon: "🔒" },
    { label: "Colosseum", page: "colosseum", icon: "🏟️" },
    { label: "Last Man Standing", page: "last_man_standing", icon: "🏆" },
  ]},
];

const rightMenuSections = [
  { title: "Communication", icon: MessageSquare, items: [
    { label: "Direct Messages", page: "messages", icon: "📩" },
    { label: "Inbox", page: "inbox", icon: "📥" },
    { label: "Notifications", page: "notifications_page", icon: "🔔" },
  ]},
  { title: "Forums", icon: MessageSquare, items: [
    { label: "General Forum", page: "forum_general", icon: "📢" },
    { label: "Sales Forum", page: "forum_sales", icon: "💰" },
    { label: "Off-Topic", page: "forum_offtopic", icon: "💭" },
    { label: "Shadows Forum", page: "forum_shadows", icon: "🌑" },
    { label: "Search Posts", page: "forum_search", icon: "🔍" },
  ]},
  { title: "Chat", icon: MessageSquare, items: [
    { label: "Crew Chat", page: "crew_chat", icon: "💬" },
    { label: "Family Chat", page: "family_chat", icon: "👨‍👩‍👦" },
    { label: "Global Chat", page: "global_chat", icon: "🌐" },
    { label: "Trade Chat", page: "trade_chat", icon: "💹" },
    { label: "Looking for Group", page: "lfg", icon: "👥" },
  ]},
  { title: "World", icon: Globe, items: [
    { label: "Airport", page: "airport", icon: "✈️" },
    { label: "Weather", page: "weather", icon: "🌤️" },
    { label: "News Ticker", page: "news_ticker", icon: "📰" },
    { label: "City Map", page: "city_map", icon: "🗺️" },
    { label: "City Overview", page: "city_overview", icon: "🏙️" },
    { label: "Statistics", page: "statistics", icon: "📊" },
    { label: "World Map", page: "world_map", icon: "🗺️" },
  ]},
  { title: "Seasonal Events", icon: Flame, items: [
    { label: "New Year's Heist", page: "evt_newyear", icon: "🎆" },
    { label: "Valentine's Crime", page: "evt_valentine", icon: "❤️" },
    { label: "St. Patrick's Gold", page: "evt_patricks", icon: "☘️" },
    { label: "Easter Egg Hunt", page: "evt_easter", icon: "🥚" },
    { label: "Summer Crime Wave", page: "evt_summer", icon: "☀️" },
    { label: "Halloween Horror", page: "evt_halloween", icon: "🎃" },
    { label: "Christmas Heist", page: "evt_christmas", icon: "🎄" },
    { label: "Cyber Monday", page: "evt_cyber", icon: "💻" },
    { label: "Black Friday Heist", page: "evt_blackfriday", icon: "🛒" },
    { label: "Tax Season Scam", page: "evt_tax", icon: "📋" },
    { label: "Spring Break Crime", page: "evt_spring", icon: "🌸" },
    { label: "Winter Wonderland", page: "evt_winter", icon: "❄️" },
  ]},
  { title: "Server Events", icon: Zap, items: [
    { label: "Purge Night", page: "evt_purge", icon: "💀" },
    { label: "Blood Moon", page: "evt_bloodmoon", icon: "🌑" },
    { label: "Robber's Moon", page: "evt_robbersmoon", icon: "🌙" },
    { label: "Full Moon", page: "evt_fullmoon", icon: "🌕" },
    { label: "Grand Heist", page: "evt_grandheist", icon: "🏦" },
    { label: "Tournament Championship", page: "evt_tournament", icon: "🏆" },
    { label: "Family War Week", page: "evt_familywar", icon: "⚔️" },
    { label: "Territory Takeover", page: "evt_territory", icon: "📍" },
    { label: "Underground Championship", page: "evt_underground", icon: "💣" },
    { label: "Crime Empire Week", page: "evt_empire", icon: "👑" },
  ]},
  { title: "Help", icon: HelpCircle, items: [
    { label: "FAQ", page: "faq", icon: "❓" },
    { label: "Support", page: "support", icon: "🆘" },
    { label: "Community Guidelines", page: "community", icon: "📜" },
    { label: "Player Reports", page: "reports", icon: "📢" },
  ]},
  { title: "System", icon: Settings, items: [
    { label: "Admin Panel", page: "admin_panel", icon: "⚙️" },
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
        <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden">
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
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount..." className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
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
export default function Dashboard() {
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const player = useQuery(api.game.getPlayer);
  const [registered, setRegistered] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [dismissedLevelUp, setDismissedLevelUp] = useState(false);
  const setPage = useCallback((p: GamePage) => setActivePage(p), []);

  const isRegistered = (player?.nickname && player?.registeredAt) || player?.username || registered;

  // Auto-reset dismissedLevelUp when new level-up is pending
  useEffect(() => {
    if (player?.levelUpPending) setDismissedLevelUp(false);
  }, [player?.levelUpPending]);

  const acknowledgeLevelUp = useMutation(api.game.acknowledgeLevelUp);

  // Prison auto-release check
  const releaseFromPrison = useMutation(api.game.releaseFromPrison);
  useEffect(() => {
    if (player?.inPrison && player?.lastCrimeAt) {
      const elapsed = Date.now() - player.lastCrimeAt;
      if (elapsed >= 15000) {
        releaseFromPrison({}).catch(() => {});
      }
    }
  }, [player?.inPrison, player?.lastCrimeAt]);

  const [leftExpanded, setLeftExpanded] = useState<string[]>(leftMenuSections.map(s => s.title));
  const [rightExpanded, setRightExpanded] = useState<string[]>(rightMenuSections.map(s => s.title));
  const [leftItemsExpanded, setLeftItemsExpanded] = useState<string[]>([]);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const xpNeeded = (player?.level ?? 1) * 100;
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

// === COMBAT PAGES ===
function Duel1v1Page() {
  const player = useQuery(api.game.getPlayer);
  const players = useQuery(api.admin.getAllPlayers);
  const fight = useMutation(api.game.fightPlayer);
  const [target, setTarget] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const opponents = (players || []).filter((p: any) => p._id !== player?._id && !p.isBanned && (p.nickname || "").toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  const doFight = async () => {
    if (!target) return;
    setLoading(true);
    try { const r = await fight({ defenderId: target._id }); setResult(r); } catch (e: any) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">⚔️</span><h2 className="text-2xl font-bold">1v1 Duel</h2></div>
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">ATK</div><div className="text-lg font-bold text-red-400">{player?.attack ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">DEF</div><div className="text-lg font-bold text-blue-400">{player?.defense ?? 0}</div></div>
        <div className="mafia-card rounded-xl p-3 text-center"><div className="text-xs text-muted-foreground">HP</div><div className="text-lg font-bold text-green-400">{player?.life ?? 0}/{player?.maxLife ?? 100}</div></div>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opponent..." className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
      <div className="max-h-[300px] overflow-y-auto space-y-1">
        {opponents.map((p: any) => (
          <div key={p._id} onClick={() => setTarget(p)} className={`p-3 rounded-lg cursor-pointer text-sm flex justify-between items-center ${target?._id === p._id ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5 border border-transparent"}`}>
            <div><span className="font-bold">{p.nickname || "Unknown"}</span> <span className="text-muted-foreground">Lv.{p.level}</span></div>
            <div className="text-xs text-muted-foreground">ATK:{p.attack} DEF:{p.defense}</div>
          </div>
        ))}
      </div>
      <button onClick={doFight} disabled={!target || loading} className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50">
        {loading ? "Fighting..." : target ? `⚔️ Fight ${target.nickname || "Unknown"}!` : "Select an opponent"}
      </button>
      {result && (
        <div className={`mafia-card rounded-xl p-4 text-center ${result.won ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className={`text-2xl font-black mb-2 ${result.won ? "text-green-400" : "text-red-400"}`}>{result.won ? "🏆 VICTORY!" : "💀 DEFEATED"}</div>
          <div className="text-sm text-muted-foreground">Damage: {result.damage} | Taken: {result.taken}</div>
          {result.stolen > 0 && <div className="text-sm text-green-400">Stole: ${result.stolen.toLocaleString()}</div>}
        </div>
      )}
    </div>
  );
}

function CrewWarsPage() { return <GenericStub title="Crew Wars" icon="🏴" />; }
function CTFPage() { return <GenericStub title="Capture the Flag" icon="🚩" />; }
function KOTHPage() { return <GenericStub title="King of the Hill" icon="👑" />; }
function BattleRoyalePage() { return <GenericStub title="Battle Royale" icon="🎯" />; }
function LadderPage() { return <GenericStub title="Ladder System" icon="📊" />; }
function ChampionPage() { return <GenericStub title="Champion Title" icon="🏆" />; }
function AmbushPage() { return <GenericStub title="Ambush" icon="🔥" />; }

// === ECONOMY PAGES ===
function BankAccountPage() { return <BankPage />; }
function BankRobberyPage() {
  const player = useQuery(api.game.getPlayer);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const rob = async () => {
    setLoading(true);
    try {
      const success = Math.random() > 0.5;
      const reward = success ? Math.floor(Math.random() * 25000 + 5000) : -Math.floor(Math.random() * 5000);
      setMsg(success ? `💰 robbed $${reward.toLocaleString()}!` : `💀 Failed! Lost $${Math.abs(reward).toLocaleString()}`);
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  };
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🏦</span><h2 className="text-2xl font-bold">Bank Robbery</h2></div>
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">💰</div>
        <p className="text-sm text-muted-foreground mb-4">High risk, high reward. 50% chance of success.</p>
        <button onClick={rob} disabled={loading || (player?.level ?? 0) < 10} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50">
          {loading ? "Robbing..." : "🏦 Rob the Bank"}
        </button>
        {(player?.level ?? 0) < 10 && <div className="text-xs text-red-400 mt-2">Requires Level 10+</div>}
      </div>
      {msg && <div className="mafia-card rounded-xl p-4 text-center text-sm font-bold">{msg}</div>}
    </div>
  );
}
function InterestRatesPage() { return <GenericStub title="Interest Rates" icon="📈" />; }
function CreditScorePage() { return <GenericStub title="Credit Score" icon="💳" />; }
function HealthInsurancePage() { return <GenericStub title="Health Insurance" icon="🏥" />; }
function LifeInsurancePage() { return <GenericStub title="Life Insurance" icon="❤️" />; }
function CryptoTradingPage() { return <CryptoPage />; }
function AutoShopPage() { return <GenericStub title="Auto Shop" icon="🚗" />; }
function OffshorePage() { return <GenericStub title="Offshore Accounts" icon="🏝️" />; }
function DailySpinPage() { return <DailyLoginPage />; }
function ReferralPage() { return <GenericStub title="Referral System" icon="🔗" />; }
function SeasonRewardsPage() { return <SeasonPassPage />; }
function BattlePassPage() { return <SeasonPassPage />; }

// === SOCIAL PAGES ===
function CrewRanksPage() { return <GenericStub title="Crew Ranks" icon="📊" />; }
function CrewChatPage() { return <GenericStub title="Crew Chat" icon="💬" />; }
function CrewBankPage() { return <GenericStub title="Crew Bank" icon="🏦" />; }
function CrewSafehousePage() { return <GenericStub title="Crew Safe House" icon="🏠" />; }
function CrewWarPage() { return <GenericStub title="Crew War" icon="⚔️" />; }
function CrewAlliancePage() { return <GenericStub title="Crew Alliance" icon="🤝" />; }
function CrewTerritoryPage() { return <GenericStub title="Crew Territory" icon="📍" />; }
function CrewChallengesPage() { return <GenericStub title="Crew Challenges" icon="🎯" />; }
function CrewLeaderboardPage() { return <LeaderboardPage title="Crew Leaderboard" icon="🤝" />; }

// === WORLD PAGES ===
function CityMapPage() { return <WorldMapPage />; }
function NeighborhoodsPage() { return <GenericStub title="Neighborhoods" icon="🏘️" />; }
function SlumsPage() { return <GenericStub title="Slums" icon="🏚️" />; }
function SeasonsPage() { return <GenericStub title="Seasons" icon="🍂" />; }
function CityStatsPage() { return <StatisticsPage />; }

// === PROGRESSION PAGES ===
function CombatSkillsPage() { return <SkillTreePage />; }
function StealthSkillsPage() { return <SkillTreePage />; }
function HackingSkillsPage() { return <SkillTreePage />; }
function PrestigeShopPage() { return <PrestigePage />; }
function SeasonRewardsProgPage() { return <SeasonPassPage />; }
function EnergyDrinksPage() { return <GenericStub title="Energy Drinks" icon="⚡" />; }

// === MISSIONS PAGES ===
function SideMissionsPage() { return <MissionsPage />; }
function DailyMissionsPage() { return <MissionsPage />; }
function WeeklyMissionsPage() { return <MissionsPage />; }
function MonthlyMissionsPage() { return <MissionsPage />; }

// === CHAT PAGES ===
function GlobalChatPage() { return <GenericStub title="Global Chat" icon="🌐" />; }
function TradeChatPage() { return <GenericStub title="Trade Chat" icon="💹" />; }
function LFGPage() { return <GenericStub title="Looking for Group" icon="👥" />; }
function FamilyChatPage() { return <GenericStub title="Family Chat" icon="👨‍👩‍👦" />; }

// === COMMUNITY PAGES ===
function CommunityPage() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📜</span><h2 className="text-2xl font-bold">Community Guidelines</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3 text-sm text-muted-foreground">
        <div className="font-bold text-foreground">1. Be Respectful</div><p>Treat all players with respect. No harassment or hate speech.</p>
        <div className="font-bold text-foreground">2. No Cheating</div><p>Exploiting bugs or using hacks will result in a ban.</p>
        <div className="font-bold text-foreground">3. Keep It Clean</div><p>No spam, no offensive content in forums or chat.</p>
        <div className="font-bold text-foreground">4. Play Fair</div><p>No scamming other players outside of in-game crime mechanics.</p>
        <div className="font-bold text-foreground">5. Have Fun</div><p>This is a game. Enjoy the criminal underworld responsibly!</p>
      </div>
    </div>
  );
}
function ReportsPage() { return <GenericStub title="Player Reports" icon="📢" />; }

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
  { id: "knife", name: "Kitchen Knife", category: "Melee", damage: 25, trace: 15, cost: 500, icon: "🔪" },
  { id: "bat", name: "Baseball Bat", category: "Melee", damage: 30, trace: 10, cost: 300, icon: "🏏" },
  { id: "pipe", name: "Steel Pipe", category: "Melee", damage: 35, trace: 12, cost: 400, icon: "🔧" },
  { id: "throwing_knife", name: "Throwing Knife", category: "Ranged", damage: 40, trace: 8, cost: 2000, icon: "🗡️" },
  { id: "pistol", name: "Pistol", category: "Firearm", damage: 60, trace: 45, cost: 10000, icon: "🔫" },
  { id: "revolver", name: "Revolver", category: "Firearm", damage: 55, trace: 35, cost: 8000, icon: "🔫" },
  { id: "suppressed", name: "Suppressed Pistol", category: "Firearm", damage: 50, trace: 15, cost: 25000, icon: "🤫" },
  { id: "shotgun", name: "Shotgun", category: "Firearm", damage: 80, trace: 50, cost: 15000, icon: "💥" },
  { id: "sniper", name: "Sniper Rifle", category: "Firearm", damage: 90, trace: 20, cost: 50000, icon: "🎯" },
  { id: "cyanide", name: "Cyanide", category: "Chemical", damage: 100, trace: 5, cost: 30000, icon: "☠️" },
  { id: "garrote", name: "Wire Garrote", category: "Melee", damage: 45, trace: 3, cost: 1500, icon: "〰️" },
  { id: "c4", name: "C4 Explosive", category: "Explosive", damage: 100, trace: 60, cost: 100000, icon: "💣" },
  { id: "car_bomb", name: "Car Bomb", category: "Explosive", damage: 95, trace: 40, cost: 75000, icon: "🚗" },
];

const MURDER_METHODS = [
  { id: "ambush", name: "Ambush", desc: "Hide and strike when they least expect it", successMod: 0.1, icon: "🫣" },
  { id: "driveby", name: "Drive-By", desc: "Roll up and spray from the car", successMod: -0.05, icon: "🚗" },
  { id: "snipe", name: "Snipe from Distance", desc: "One shot, one kill from the rooftops", successMod: 0.15, icon: "🔭" },
  { id: "poison", name: "Poisoned Drink", desc: "Slip something into their coffee", successMod: 0.2, icon: "🍸" },
  { id: "home_inv", name: "Home Invasion", desc: "Break in while they sleep", successMod: 0.05, icon: "🏠" },
  { id: "strangle", name: "Strangulation", desc: "Up close and personal", successMod: 0, icon: "🫳" },
  { id: "staged", name: "Staged Robbery", desc: "Make it look like a robbery gone wrong", successMod: 0.1, icon: "🎭" },
  { id: "accident", name: "Staged Accident", desc: "Cut the brakes. Make it look like an accident.", successMod: 0.15, icon: "💥" },
  { id: "professional", name: "Professional Hit", desc: "Clean, efficient, no witnesses", successMod: 0.2, icon: "🕵️" },
  { id: "hit_squad", name: "Hit Squad", desc: "Send a team to handle it", successMod: 0.25, icon: "👥" },
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

    // Dead player blocking
    if (player?.isDead && !["hospital", "headquarters", "updates"].includes(activePage)) {
      return (
        <div className="animate-fade-in space-y-6">
          <div className="rounded-2xl p-8 border-2 border-red-500/40 bg-red-950/20 text-center">
            <div className="text-6xl mb-4">💀</div>
            <div className="text-2xl font-black text-red-400">YOU ARE DEAD</div>
            <div className="text-sm text-muted-foreground mt-2">Visit the Hospital to revive.</div>
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
      case "crimes": return <CrimesOverviewPage />;
      case "steal_from_house": return <StealFromHousePage />;
      case "gta_car_theft": return <GtaCarTheftPage />;
      case "crime_empire": return <CrimeEmpirePage />;
      case "heist_planning": return <HeistPlanningPage />;
      case "organized_crime": return <OrganizedCrimePage />;
      case "kill": return <SafePage><MurderPage /></SafePage>;
      case "underground": return <UndergroundPage />;
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
      case "missions": return <MissionsPage />;
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
      case "crew_chat": return <GenericStub title="Crew Chat" icon="💬" />;
      case "family_chat": return <GenericStub title="Family Chat" icon="👨‍👩‍👦" />;
      case "global_chat": return <GenericStub title="Global Chat" icon="🌐" />;
      case "trade_chat": return <GenericStub title="Trade Chat" icon="💹" />;
      case "lfg": return <GenericStub title="Looking for Group" icon="👥" />;
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
      case "box_standard": return <GenericStub title="Standard Box" icon="📦" />;
      case "box_premium": return <GenericStub title="Premium Box" icon="💎" />;
      case "box_legendary": return <GenericStub title="Legendary Box" icon="👑" />;
      case "box_seasonal": return <GenericStub title="Seasonal Box" icon="🎄" />;
      case "box_crime": return <GenericStub title="Crime Box" icon="🔪" />;
      case "box_combat": return <GenericStub title="Combat Box" icon="⚔️" />;
      case "box_guaranteed": return <GenericStub title="Guaranteed Legendary" icon="⭐" />;
      case "box_limited": return <GenericStub title="Limited Edition" icon="🔥" />;
      // Ghost mode
      case "ghost_status": return <GenericStub title="Ghost Status" icon="👁️" />;
      case "ghost_history": return <GenericStub title="Ghost History" icon="📋" />;
      // Secret challenges
      case "secret_daily": return <GenericStub title="Daily Secret Challenge" icon="🔮" />;
      case "secret_weekly": return <GenericStub title="Weekly Secret Challenge" icon="💎" />;
      case "secret_achievements": return <GenericStub title="Hidden Achievements" icon="🏆" />;
      case "secret_eggs": return <GenericStub title="Easter Eggs" icon="🥚" />;
      case "secret_crime": return <GenericStub title="Secret Crime" icon="🕵️" />;
      // Community
      case "community": return <GenericStub title="Community Guidelines" icon="📜" />;
      case "reports": return <GenericStub title="Player Reports" icon="📢" />;
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
      case "world_events": return <EventsList />;
      case "faq": return <FAQPage />;
      case "support": return <SupportPage />;
      case "admin_panel": return <AdminPanel />;
      case "become_admin": return <BecomeAdminPage />;
      case "online_players": return <OnlineList />;
      case "advanced_features": return <AdvancedFeaturesPage />;

            // Combat
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
      case "robbery": return <SafePage><CrimeCategoryPage categoryId="robbery" /></SafePage>;
      case "fraud": return <SafePage><CrimeCategoryPage categoryId="fraud" /></SafePage>;
      case "burglary": return <SafePage><CrimeCategoryPage categoryId="burglary" /></SafePage>;
      case "drugs": return <SafePage><CrimeCategoryPage categoryId="drugs" /></SafePage>;
      case "organized": return <SafePage><CrimeCategoryPage categoryId="organized" /></SafePage>;
      case "fraud": return <CrimesOverviewPage />;
      case "transport": return <CrimesOverviewPage />;
      default: return <HeadquartersPage />;
    }
  };

  const inPrison = player?.inPrison;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Level Up Modal */}
      <AnimatePresence>
        {player?.levelUpPending && !dismissedLevelUp && (
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
              <button onClick={async () => {
                try { await acknowledgeLevelUp({}); } catch {}
                setDismissedLevelUp(true);
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

      {/* Top Quick Access Bar */}
      <div className="bg-gradient-to-r from-black/60 via-black/40 to-black/60 border-b border-border/50 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        <style>{`
          @keyframes topbar-glow { 0%,100% { box-shadow: 0 0 6px var(--c); } 50% { box-shadow: 0 0 16px var(--c); } }
          @keyframes topbar-slide { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
          .topbar-btn { --c: rgba(228,130,51,0.3); transition: all 0.3s; position: relative; overflow: hidden; }
          .topbar-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px var(--c); }
          .topbar-btn.active { animation: topbar-glow 2s ease-in-out infinite; }
          .topbar-btn.cooldown::after { content: ''; position: absolute; bottom: 0; left: 0; height: 2px; background: linear-gradient(90deg, #ef4444, #f97316, #ef4444); background-size: 200% 100%; animation: topbar-slide 1s linear infinite; width: var(--cd-pct, 100%); }
        `}</style>
        {[
          { page: "storyline", label: "Storyline", color: "#f59e0b", gradient: "from-amber-600 to-amber-800" },
          { page: "crimes", label: "Street Crimes", color: "#22c55e", gradient: "from-green-600 to-green-800" },
          { page: "robbery", label: "Robberies", color: "#ef4444", gradient: "from-red-600 to-red-800" },
          { page: "fraud", label: "Fraud", color: "#eab308", gradient: "from-yellow-600 to-yellow-800" },
          { page: "burglary", label: "Burglary", color: "#f97316", gradient: "from-orange-600 to-orange-800" },
          { page: "steal_from_house", label: "Steal From House", color: "#fb923c", gradient: "from-orange-500 to-orange-700" },
          { page: "gta_car_theft", label: "GTA Car Theft", color: "#3b82f6", gradient: "from-blue-600 to-blue-800" },
          { page: "drugs", label: "Drugs", color: "#a855f7", gradient: "from-purple-600 to-purple-800" },
          { page: "organized", label: "Organized", color: "#06b6d4", gradient: "from-cyan-600 to-cyan-800" },
          { page: "underground", label: "Underground", color: "#6b7280", gradient: "from-gray-600 to-gray-800" },
          { page: "kill", label: "Murder", color: "#dc2626", gradient: "from-red-700 to-red-900" },
          { page: "prison", label: "Prison", color: "#64748b", gradient: "from-slate-600 to-slate-800" },
          { page: "hospital", label: "Hospital", color: "#22c55e", gradient: "from-green-500 to-green-700" },
        ].map(btn => {
          const cdKey = `cd_${btn.page}`;
          const cdEnd = (player as any)?.crimeCooldowns?.[btn.page] ?? 0;
          const now = Date.now();
          const cdLeft = cdEnd > now ? Math.ceil((cdEnd - now) / 1000) : 0;
          const onCd = cdLeft > 0;
          return (
            <button key={btn.page} onClick={() => setPage(btn.page)}
              className={`topbar-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${btn.gradient} text-white border border-white/10 whitespace-nowrap transition-all ${activePage === btn.page ? "ring-2 ring-white/30 scale-105" : ""} ${onCd ? "cooldown opacity-70" : ""}`}
              style={{ "--c": btn.color + "40" } as any}>
              <span className="relative z-10">{btn.label}</span>
              {onCd && <span className="relative z-10 ml-1.5 text-[9px] opacity-80">{cdLeft}s</span>}
            </button>
          );
        })}
      </div>{/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Menu */}
        {showLeft && (
          <aside className="w-56 bg-black/30 border-r border-border/50 overflow-y-auto shrink-0 hidden md:block">
            <div className="p-3 space-y-1">
              {leftMenuSections.map(section => (
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
                              <span className="flex-1 text-left">{item.label}</span>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>

        {/* Right Menu */}
        {showRight && (
          <aside className="w-56 bg-black/30 border-l border-border/50 overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-3 space-y-3">
              {/* Status Panel */}
              {player && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground px-2">Status</div>
                  {/* Life Bar */}
                  <div className="px-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-red-400 font-bold">❤️ Life</span>
                      <span className="text-muted-foreground">{player.life}/{player.maxLife}</span>
                    </div>
                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full transition-all"
                        style={{ width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%` }} />
                    </div>
                  </div>
                  {/* XP Bar */}
                  <div className="px-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-yellow-400 font-bold">⭐ <RankBadge level={player.level ?? 1} /> Lv.{player.level}</span>
                      <span className="text-muted-foreground">{xpPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full transition-all"
                        style={{ width: `${xpPercent}%` }} />
                    </div>
                  </div>
                  {/* Cash */}
                  <div className="px-2 mafia-card rounded-lg p-2">
                    <div className="text-[10px] text-muted-foreground">💰 Cash</div>
                    <div className="text-sm font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div>
                  </div>
                  {/* Points */}
                  <div className="px-2 mafia-card rounded-lg p-2">
                    <div className="text-[10px] text-muted-foreground">🏆 Points</div>
                    <div className="text-sm font-bold text-yellow-400">{(player.points ?? 0).toLocaleString()}</div>
                  </div>
                  {/* Reputation */}
                  <div className="px-2 mafia-card rounded-lg p-2">
                    <div className="text-[10px] text-muted-foreground">🌍 Reputation</div>
                    <div className="text-sm font-bold text-purple-400">{(player.reputation ?? 0).toLocaleString()}</div>
                  </div>
                  {/* Quick Info */}
                  {(player.wantedLevel ?? 0) > 0 && (
                    <div className="px-2 mafia-card rounded-lg p-2 border-red-500/30">
                      <div className="text-[10px] text-red-400 font-bold">🔴 Wanted: {player.wantedLevel}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Right Menu Sections */}
              {rightMenuSections.map(section => (
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
                            <button onClick={() => setLeftItemsExpanded((prev: string[]) => prev.includes(item.label) ? prev.filter((t: string) => t !== item.label) : [...prev, item.label])}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition text-muted-foreground hover:text-foreground hover:bg-white/5">
                              <span className="text-xs">{item.icon}</span>
                              <span className="flex-1 text-left">{item.label}</span>
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
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/40 border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground shrink-0">
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
          className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
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

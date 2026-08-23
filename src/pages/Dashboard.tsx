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
    { label: "Illegal Transport", page: "transport", icon: "🚛" },
    { label: "Steal From House", page: "steal_from_house", icon: "🏠" },
    { label: "GTA Car Theft", page: "gta_car_theft", icon: "🚗" },
    { label: "Crime Empire", page: "crime_empire", icon: "🗺️" },
    { label: "Heist Planning", page: "heist_planning", icon: "🎯" },
    { label: "Organized Crime", page: "organized_crime", icon: "👥" },
    { label: "Murder", page: "kill", icon: "🗡️" },
    { label: "Underground", page: "underground", icon: "💣" },
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
  { title: "Underground", icon: EyeOff, items: [
    { label: "Counterfeiting", page: "counterfeiting", icon: "💵" },
    { label: "Drug Trafficking", page: "drug_trafficking", icon: "💊" },
    { label: "Arson", page: "arson", icon: "🔥" },
    { label: "Identity Theft", page: "identity_theft", icon: "🪪" },
    { label: "Arms Dealing", page: "arms_deal", icon: "🔫" },
    { label: "Tax Evasion", page: "tax_evasion", icon: "📋" },
    { label: "Racketeering", page: "racketeering", icon: "💰" },
    { label: "Smuggling Routes", page: "smuggling", icon: "🚛" },
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
    { label: "Season Rewards", page: "season_rewards", icon: "🏆" },
    { label: "Battle Pass", page: "battle_pass", icon: "🎫" },
    { label: "Crafting", page: "crafting", icon: "🔧" },
  ]},
  { title: "Assets", icon: Package, items: [
    { label: "Garage", page: "garage", icon: "🚗" },
    { label: "My Items", page: "items", icon: "🎒" },
    { label: "Black Market", page: "black_market", icon: "🖤" },
    { label: "Mystery Boxes", page: "mystery_boxes", icon: "📦" },
    { label: "Legendary Items", page: "legendary_items", icon: "✨" },
    { label: "Bodyguards", page: "bodyguards", icon: "🛡️" },
  ]},
  { title: "Social", icon: Users, items: [
    { label: "Crew System", page: "crew", icon: "🤝" },
    { label: "Crew Ranks", page: "crew_ranks", icon: "📊" },
    { label: "Crew Chat", page: "crew_chat", icon: "💬" },
    { label: "Crew Bank", page: "crew_bank", icon: "🏦" },
    { label: "Crew Safe House", page: "crew_safehouse", icon: "🏠" },
    { label: "Crew War", page: "crew_war", icon: "⚔️" },
    { label: "Crew Alliance", page: "crew_alliance", icon: "🤝" },
    { label: "Crew Territory", page: "crew_territory", icon: "📍" },
    { label: "Crew Challenges", page: "crew_challenges", icon: "🎯" },
    { label: "Crew Leaderboard", page: "crew_leaderboard", icon: "🏆" },
    { label: "Family System", page: "family", icon: "👨‍👩‍👦" },
  ]},
  { title: "World", icon: Globe, items: [
    { label: "City Map", page: "city_map", icon: "🗺️" },
    { label: "Neighborhoods", page: "neighborhoods", icon: "🏘️" },
    { label: "Slums", page: "slums", icon: "🏚️" },
    { label: "Seasons", page: "seasons", icon: "🍂" },
    { label: "Rain Effects", page: "weather", icon: "🌧️" },
    { label: "City Statistics", page: "city_stats", icon: "📊" },
  ]},
  { title: "Progression", icon: TrendingUp, items: [
    { label: "Skill Tree", page: "skill_tree", icon: "🧠" },
    { label: "Combat Skills", page: "combat_skills", icon: "⚔️" },
    { label: "Stealth Skills", page: "stealth_skills", icon: "🥷" },
    { label: "Hacking Skills", page: "hacking_skills", icon: "💻" },
    { label: "Prestige Tiers", page: "prestige", icon: "⭐" },
    { label: "Prestige Shop", page: "prestige_shop", icon: "🛒" },
    { label: "Title System", page: "titles", icon: "👑" },
    { label: "Season Rewards", page: "season_rewards_prog", icon: "🏆" },
    { label: "Energy Drinks", page: "energy_drinks", icon: "⚡" },
    { label: "Achievements", page: "achievements", icon: "🏅" },
    { label: "Legacy", page: "legacy", icon: "📜" },
    { label: "Leaderboards", page: "leaderboards", icon: "📊" },
    { label: "Season Pass", page: "season_pass", icon: "🎫" },
    { label: "Daily Login", page: "daily_login", icon: "🎁" },
    { label: "Daily Challenges", page: "daily_challenges", icon: "📋" },
  ]},
  { title: "Missions", icon: Target, items: [
    { label: "Storyline Missions", page: "storyline", icon: "📖" },
    { label: "Side Missions", page: "side_missions", icon: "📋" },
    { label: "Daily Missions", page: "daily_missions", icon: "📅" },
    { label: "Weekly Missions", page: "weekly_missions", icon: "📆" },
    { label: "Monthly Missions", page: "monthly_missions", icon: "🗓️" },
  ]},
  { title: "Special", icon: Sparkles, items: [
    { label: "Ghost Mode", page: "ghost_mode", icon: "👻" },
    { label: "Missions", page: "missions", icon: "🎯" },
    { label: "Wanted Status", page: "wanted", icon: "🔴" },
    { label: "Colosseum", page: "colosseum", icon: "🏟️" },
    { label: "Last Man Standing", page: "last_man_standing", icon: "🏆" },
    { label: "Prison", page: "prison", icon: "🔒" },
  ]},
];

const rightMenuSections = [
  { title: "Quick Info", icon: Zap, items: [
    { label: "City Overview", page: "city_overview", icon: "🏙️" },
    { label: "Statistics", page: "statistics", icon: "📊" },
    { label: "World Map", page: "world_map", icon: "🗺️" },
    { label: "Wanted Status", page: "wanted", icon: "🔴" },
    { label: "FBI/Military", page: "fbi_status", icon: "🕵️" },
  ]},
  { title: "Communication", icon: MessageSquare, items: [
    { label: "Messages", page: "messages", icon: "📩" },
    { label: "Inbox", page: "inbox", icon: "📥" },
    { label: "Notifications", page: "notifications_page", icon: "🔔" },
  ]},
  { title: "Forums", icon: MessageSquare, items: [
    { label: "General Forum", page: "forum_general", icon: "📢" },
    { label: "Sales & Wanted", page: "forum_sales", icon: "💰" },
    { label: "Off-Topic", page: "forum_offtopic", icon: "💭" },
    { label: "Shadows Forum", page: "forum_shadows", icon: "🌑" },
    { label: "Search Posts", page: "forum_search", icon: "🔍" },
  ]},
  { title: "World", icon: Globe, items: [
    { label: "Airport", page: "airport", icon: "✈️" },
    { label: "Weather", page: "weather", icon: "🌤️" },
    { label: "News Ticker", page: "news_ticker", icon: "📰" },
    { label: "Events", page: "world_events", icon: "🎪" },
    { label: "City Statistics", page: "city_stats", icon: "📊" },
  ]},
  { title: "Help", icon: HelpCircle, items: [
    { label: "FAQ", page: "faq", icon: "❓" },
    { label: "Support", page: "support", icon: "🆘" },
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
          <div className="text-lg font-bold text-yellow-400">{player.level}</div>
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
function GenericPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="mafia-card rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <div className="text-sm font-bold mb-1">{title}</div>
        <div className="text-xs text-muted-foreground">This feature is coming soon. Stay tuned!</div>
      </div>
    </div>
  );
}

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

function Duel1v1Page() { return <GenericPage title="1v1 Duel" icon="⚔️" />; }
function CrewWarsPage() { return <GenericPage title="Crew Wars" icon="🏴" />; }
function CTFPage() { return <GenericPage title="Capture the Flag" icon="🚩" />; }
function KOTHPage() { return <GenericPage title="King of the Hill" icon="👑" />; }
function BattleRoyalePage() { return <GenericPage title="Battle Royale" icon="🎯" />; }
function LadderPage() { return <GenericPage title="Ladder System" icon="📊" />; }
function ChampionPage() { return <GenericPage title="Champion Title" icon="🏆" />; }
function AmbushPage() { return <GenericPage title="Ambush" icon="🔥" />; }

function PokerTexasPage() { return <GenericPage title="Poker Texas Holdem" icon="🂡" />; }
function PokerOmahaPage() { return <GenericPage title="Poker Omaha" icon="🂱" />; }
function CrapsPage() { return <GenericPage title="Craps" icon="🎲" />; }
function PowerballPage() { return <GenericPage title="Powerball" icon="⚡" />; }
function CoinFlipPage() { return <GenericPage title="Coin Flip" icon="🪙" />; }
function WheelPage() { return <GenericPage title="Wheel of Fortune" icon="🎡" />; }
function HorseRacingPage() { return <GenericPage title="Horse Racing" icon="🏇" />; }
function ScratchCardsPage() { return <GenericPage title="Scratch Cards" icon="🎰" />; }
function BingoPage() { return <GenericPage title="Bingo" icon="🎯" />; }
function KenoPage() { return <GenericPage title="Keno" icon="🔢" />; }
function HigherLowerPage() { return <GenericPage title="Higher or Lower" icon="⬆️" />; }
function BJSwitchPage() { return <GenericPage title="Blackjack Switch" icon="🔄" />; }

function BankAccountPage() { return <GenericPage title="Bank Account" icon="🏦" />; }
function BankRobberyPage() { return <GenericPage title="Bank Robbery" icon="💰" />; }
function InterestRatesPage() { return <GenericPage title="Interest Rates" icon="📈" />; }
function CreditScorePage() { return <GenericPage title="Credit Score" icon="💳" />; }
function HealthInsurancePage() { return <GenericPage title="Health Insurance" icon="🏥" />; }
function LifeInsurancePage() { return <GenericPage title="Life Insurance" icon="❤️" />; }
function CryptoTradingPage() { return <GenericPage title="Crypto Trading" icon="📊" />; }
function AutoShopPage() { return <GenericPage title="Auto Shop" icon="🚗" />; }
function OffshorePage() { return <GenericPage title="Offshore Accounts" icon="🏝️" />; }
function DailySpinPage() { return <GenericPage title="Daily Spin" icon="🎰" />; }
function ReferralPage() { return <GenericPage title="Referral System" icon="🔗" />; }
function SeasonRewardsPage() { return <GenericPage title="Season Rewards" icon="🏆" />; }
function BattlePassPage() { return <GenericPage title="Battle Pass" icon="🎫" />; }

function CrewRanksPage() { return <GenericPage title="Crew Ranks" icon="📊" />; }
function CrewChatPage() { return <GenericPage title="Crew Chat" icon="💬" />; }
function CrewBankPage() { return <GenericPage title="Crew Bank" icon="🏦" />; }
function CrewSafehousePage() { return <GenericPage title="Crew Safe House" icon="🏠" />; }
function CrewWarPage() { return <GenericPage title="Crew War" icon="⚔️" />; }
function CrewAlliancePage() { return <GenericPage title="Crew Alliance" icon="🤝" />; }
function CrewTerritoryPage() { return <GenericPage title="Crew Territory" icon="📍" />; }
function CrewChallengesPage() { return <GenericPage title="Crew Challenges" icon="🎯" />; }
function CrewLeaderboardPage() { return <GenericPage title="Crew Leaderboard" icon="🏆" />; }

function CityMapPage() { return <GenericPage title="City Map" icon="🗺️" />; }
function NeighborhoodsPage() { return <GenericPage title="Neighborhoods" icon="🏘️" />; }
function SlumsPage() { return <GenericPage title="Slums" icon="🏚️" />; }
function SeasonsPage() { return <GenericPage title="Seasons" icon="🍂" />; }

function CombatSkillsPage() { return <GenericPage title="Combat Skills" icon="⚔️" />; }
function StealthSkillsPage() { return <GenericPage title="Stealth Skills" icon="🥷" />; }
function HackingSkillsPage() { return <GenericPage title="Hacking Skills" icon="💻" />; }
function PrestigeShopPage() { return <GenericPage title="Prestige Shop" icon="🛒" />; }
function SeasonRewardsProgPage() { return <GenericPage title="Season Rewards" icon="🏆" />; }
function EnergyDrinksPage() { return <GenericPage title="Energy Drinks" icon="⚡" />; }

function SideMissionsPage() { return <GenericPage title="Side Missions" icon="📋" />; }
function DailyMissionsPage() { return <GenericPage title="Daily Missions" icon="📅" />; }
function WeeklyMissionsPage() { return <GenericPage title="Weekly Missions" icon="📆" />; }
function MonthlyMissionsPage() { return <GenericPage title="Monthly Missions" icon="🗓️" />; }

function CityStatsPage() { return <GenericPage title="City Statistics" icon="📊" />; }


function FBIStatusPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  const wl = player.wantedLevel ?? 0;
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Shield className="size-7 text-primary" /><h2 className="text-2xl font-bold">FBI / Military Status</h2></div>
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl bg-red-950/20 border border-red-500/20">
            <div className="text-3xl mb-2">🕵️</div>
            <div className="text-sm font-bold">FBI Activity</div>
            <div className={`text-xs mt-1 ${wl >= 2 ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
              {wl >= 4 ? "FULLY DEPLOYED" : wl >= 2 ? "Active Investigation" : "No Activity"}
            </div>
          </div>
          <div className="text-center p-4 rounded-xl bg-orange-950/20 border border-orange-500/20">
            <div className="text-3xl mb-2">🎖️</div>
            <div className="text-sm font-bold">Military Response</div>
            <div className={`text-xs mt-1 ${wl >= 4 ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
              {wl >= 4 ? "DEPLOYED — Escape immediately" : "Standby"}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Wanted Level: {wl}/5 — {wl === 0 ? "Clean record" : wl < 2 ? "Minor infractions" : wl < 4 ? "Serious criminal" : "Most Wanted"}
        </div>
      </div>
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
      case "kill": return <SafePage><div className="animate-fade-in space-y-4"><div className="flex items-center gap-3"><Skull className="size-7 text-red-400" /><h2 className="text-2xl font-bold">Murder</h2></div></div></SafePage>;
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
      <div className="bg-black/40 border-b border-border/50 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
        <button onClick={() => setPage("storyline")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-900/40 hover:bg-amber-800/40 border border-amber-500/20 transition whitespace-nowrap">Storyline</button>
        <button onClick={() => setPage("crimes")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-900/40 hover:bg-green-800/40 border border-green-500/20 transition whitespace-nowrap">Street Crimes</button>
        <button onClick={() => setPage("robbery")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-900/40 hover:bg-red-800/40 border border-red-500/20 transition whitespace-nowrap">Robberies</button>
        <button onClick={() => setPage("fraud")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-900/40 hover:bg-yellow-800/40 border border-yellow-500/20 transition whitespace-nowrap">Fraud</button>
        <button onClick={() => setPage("burglary")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-900/40 hover:bg-orange-800/40 border border-orange-500/20 transition whitespace-nowrap">Burglary</button>
        <button onClick={() => setPage("steal_from_house")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-900/40 hover:bg-orange-800/40 border border-orange-500/20 transition whitespace-nowrap">Steal From House</button>
        <button onClick={() => setPage("gta_car_theft")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-900/40 hover:bg-blue-800/40 border border-blue-500/20 transition whitespace-nowrap">GTA Car Theft</button>
        <button onClick={() => setPage("drugs")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-900/40 hover:bg-purple-800/40 border border-purple-500/20 transition whitespace-nowrap">Drugs</button>
        <button onClick={() => setPage("organized")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-900/40 hover:bg-blue-800/40 border border-blue-500/20 transition whitespace-nowrap">Organized</button>
        <button onClick={() => setPage("underground")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900/40 hover:bg-gray-800/40 border border-gray-500/20 transition whitespace-nowrap">Underground</button>
        <button onClick={() => setPage("kill")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-900/40 hover:bg-red-800/40 border border-red-500/20 transition whitespace-nowrap">Murder</button>
        <button onClick={() => setPage("prison")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900/40 hover:bg-gray-800/40 border border-gray-500/20 transition whitespace-nowrap">Prison</button>
        <button onClick={() => setPage("hospital")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-900/40 hover:bg-green-800/40 border border-green-500/20 transition whitespace-nowrap">Hospital</button>
      </div>{/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Menu */}
        {showLeft && (
          <aside className="w-56 bg-black/30 border-r border-border/50 overflow-y-auto shrink-0 hidden lg:block">
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
                        <button key={item.page} onClick={() => setPage(item.page)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                            activePage === item.page ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}>
                          <span className="text-xs">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
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
          <aside className="w-56 bg-black/30 border-l border-border/50 overflow-y-auto shrink-0 hidden xl:block">
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
                      <span className="text-yellow-400 font-bold">⭐ Level {player.level}</span>
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
                        <button key={item.page} onClick={() => setPage(item.page)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                            activePage === item.page ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}>
                          <span className="text-xs">{item.icon}</span>
                          <span>{item.label}</span>
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

      {/* Bottom Bar */}
      <div className="bg-black/40 border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-4">
          <span>{player?.nickname || "Unknown"}</span>
          <span>Lv.{player?.level ?? 1}</span>
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

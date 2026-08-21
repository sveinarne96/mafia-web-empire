import { CrimesOverviewPage, BossFightsPage, CrimeEmpirePage, HeistPlanningPage, WorldEventsPage, CriminalPetsPage, BlackMarketPage, CrimeFamePage, LegendaryCrimePage } from "../components/GameFeatures";
import { DailyLoginPage, CrewSystemPage, RankedPvpPage } from "../components/NewFeatures";
import { SkillTreePage, DailyChallengesPage, ColosseumPage, SafeHousesPage, CrimeSpreePage, WantedBoardPage, SmugglingRoutesPage, CartelPage, ReputationPage, PrisonBreakPage } from "../components/EpicFeatures";
import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Building2, LockKeyhole, Landmark, Trophy, Car, Home, Users, Swords, Truck, Wrench, Package, Lock, Plane, Group, Target, Calendar, Shield, Dice1, Ticket, Wallet, Coins, LandmarkIcon, Hash, Send, Inbox, Bell, MessageSquare, Search, BarChart3, HelpCircle, MapPin, SwordsIcon, Dices, Banknote, ChevronDown, LogOut, User, AlertTriangle, Loader2, CircleDollarSign, Zap, MapPinned, ShieldCheck, Skull, BookOpen, Brain, Award, Flame, ShoppingBag, Globe, Gift, Wifi, Key, ScrollText, Newspaper, Cloud, Tv, TreePine, Gem, Bomb, Ghost, Hammer, TrendingUp, Star, Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TournamentPage, AchievementsPage, TitlesPage, StockMarketPage, RealEstatePage, BusinessesPage, AuctionHousePage, InsurancePage, LoansPage } from "../components/NewPages";
import { UndergroundEconomyPage } from "../components/UndergroundEconomy";
import { EpicActionResult, CooldownBar, useCooldown, EpicButton } from "@/components/EpicAction";
import { PointsShopPage, GaragePage, MyItemsPage, MissionsPage, OrganizedCrimePage, CompanyPage, LottoPage, BlackjackPage, LegacyPage, ForumSearchPage, SupportPage } from "../components/GamePages";
import { AdminPanel } from "../components/AdminPanel";
import { OnlineList } from "../components/OnlineList";
import { BecomeAdminPage } from "../components/BecomeAdmin";
import { MyProfilePage } from "../components/MyProfile";
import { SeasonPassPage } from "../components/SeasonPass";
import { UpdatesPage } from "../components/UpdatesPage";
import { StealFromHousePage, GtaCarTheftPage, BodyguardsPage, SecretChallengesPage, BoostsPage, EnhancedAdminPage } from "../components/GameEnhanced";
import { LiveEventBanner, EventsList } from "../components/EventBanner";

import { LiveChatPage, PrestigePage, CraftingPage, LeaderboardsPage, WorldMapPage, LotteryPage, CryptoPage, WeatherPage, NewsTickerPage, CrimeMasteryPage, LegendaryItemsPage, ArenaPage, LegacyBoardPage, RaidsPage, MysteryBoxesPage, GhostModePage, CrimeTVPage, TimeMachinePage } from "../components/AllFeatures";
import {
  DeathMatchPage, SeasonRankingsPage, LegacyStatsPage, CombatLogPage,
  FightingStylesPage, ArmorPage, GamblingDenPage,
  RoulettePage, SlotsPage, RussianRoulettePage, DogFightPage, StreetRacingPage,
  GiftingPage, HitListPage,
} from "../components/GameFeatures";

type GamePage =
  | "headquarters" | "bank" | "hospital" | "points" | "crime_car" | "crime_burglarize"
  | "crime_rob" | "fight_club"  | "garage" | "items" | "airport"
  | "organized_crime" | "missions" | "daily_raid" | "company" | "family"
  | "kill" | "gambling_dice" | "gambling_lotto" | "gambling_blackjack"
  | "gambling_coin" | "gambling_horse" | "gambling_number"
  | "messages" | "inbox" | "notifications_page" | "forum_general"
  | "forum_sales" | "forum_offtopic" | "forum_shadows" | "forum_search"
  | "city_overview" | "statistics" | "support" | "send_message" | "faq"
  | "bounty_board" | "duels" | "spar" | "tournament"
  | "stock_market" | "real_estate" | "businesses" | "auction_house" | "insurance" | "loans" | "achievements" | "titles" | "legacy" | "underground"
  | "death_match" | "season_rankings" | "combat_log" | "fighting_styles" | "armor"
  | "roulette" | "slots" | "russian_roulette" | "dog_fighting" | "street_racing" | "gambling_dens"
  | "gifting" | "hit_list" | "crimes" | "boss_fights" | "crime_empire" | "heist_planning" | "world_events" | "criminal_pets"
  | "black_market" | "crime_fame" | "skill_tree" | "daily_challenges" | "colosseum" | "legendary_crimes"
  | "daily_login" | "crew_system" | "ranked_pvp"
  | "safe_houses" | "crime_spree" | "wanted_board" | "smuggling_routes" | "cartel" | "reputation"
  | "admin_panel" | "online_list" | "become_admin" | "my_profile" | "season_pass" | "updates"
    | "live_chat" | "prestige" | "city_districts" | "crafting" | "leaderboards" | "world_map"
    | "fight_club" | "lottery" | "crypto" | "weather" | "news_ticker" | "crime_mastery"
    | "legendary_items" | "arena" | "legacy_board" | "raids" | "mystery_boxes" | "ghost_mode"
    | "crime_tv" | "time_machine"    | "steal_from_house" | "gta_car_theft" | "bodyguards" | "secret_challenges" | "boosts" | "enhanced_admin" | "events";

const cities = [
  { name: "New York", emoji: "🗽", crime: "high", boost: 1.2, murderCity: true, drugRun: true },
  { name: "Los Angeles", emoji: "🌴", crime: "high", boost: 1.15, murderCity: true, drugRun: true },
  { name: "Chicago", emoji: "🌃", crime: "high", boost: 1.1, murderCity: true, drugRun: true },
  { name: "Miami", emoji: "🏖️", crime: "medium", boost: 1.0, drugRun: true, taxFraud: true },
  { name: "Las Vegas", emoji: "🎰", crime: "medium", boost: 1.0 },
  { name: "Detroit", emoji: "🏭", crime: "high", boost: 1.25 },
  { name: "Houston", emoji: "🤠", crime: "medium", boost: 1.05, drugRun: true },
  { name: "Phoenix", emoji: "🌵", crime: "low", boost: 0.95, taxFraud: true },
  { name: "Philadelphia", emoji: "🔔", crime: "medium", boost: 1.05 },
  { name: "Boston", emoji: "🏛️", crime: "low", boost: 0.95, taxFraud: true },
  { name: "Atlanta", emoji: "🍑", crime: "medium", boost: 1.1, drugRun: true },
  { name: "Dallas", emoji: "🐎", crime: "low", boost: 1.0 },
];

type MenuItem = { title: string; icon: any; page?: GamePage; children?: MenuItem[] };
// Safe menu click helper
function menuClick(page: GamePage | undefined, setPage: (p: GamePage) => void) { if (page) setPage(page); }
const leftMenuSections: MenuItem[] = [
  { title: "🏠 Overview", icon: Building2, children: [
    { title: "🏢 Headquarters", icon: Building2, page: "headquarters" as GamePage },
    { title: "🏦 Bank", icon: Landmark, page: "bank" as GamePage },
    { title: "🏥 Hospital", icon: ShieldCheck, page: "hospital" as GamePage },
    { title: "🏆 Points", icon: Trophy, page: "points" as GamePage },
    { title: "👤 My Profile", icon: User, page: "my_profile" as GamePage },
    { title: "📜 Game Updates", icon: ScrollText, page: "updates" as GamePage },
  ]},
  { title: "🔥 Crime", icon: AlertTriangle, children: [
    { title: "🔥 Street Crimes", icon: AlertTriangle, page: "crimes" as GamePage },
    { title: "⭐ Legendary Crimes", icon: Flame, page: "legendary_crimes" as GamePage },
    { title: "💀 Boss Fights", icon: Skull, page: "boss_fights" as GamePage },
    { title: "🗺️ Crime Empire", icon: MapPinned, page: "crime_empire" as GamePage },
    { title: "🎯 Heist Planning", icon: Target, page: "heist_planning" as GamePage },
    { title: "👥 Organized Crime", icon: Group, page: "organized_crime" as GamePage },
    { title: "🔪 Kill", icon: Skull, page: "kill" as GamePage },
    { title: "🕵️ Underground", icon: Globe, page: "underground" as GamePage },
    { title: "🏚️ Steal From House", icon: Home, page: "steal_from_house" as GamePage },
    { title: "🚗 GTA Car Theft", icon: Car, page: "gta_car_theft" as GamePage },
  ]},
  { title: "⚔️ Combat", icon: Swords, children: [
    { title: "🎯 Bounty Board", icon: Skull, page: "bounty_board" as GamePage },
    { title: "⚔️ Ranked PvP", icon: Trophy, page: "ranked_pvp" as GamePage },
    { title: "🗡️ Duels", icon: Swords, page: "duels" as GamePage },
    { title: "🥊 Spar", icon: SwordsIcon, page: "spar" as GamePage },
    { title: "🏆 Tournament", icon: Trophy, page: "tournament" as GamePage },
    { title: "☠️ Death Match", icon: Skull, page: "death_match" as GamePage },
    { title: "📝 Combat Log", icon: SwordsIcon, page: "combat_log" as GamePage },
    { title: "🥋 Fighting Styles", icon: Swords, page: "fighting_styles" as GamePage },
    { title: "🛡️ Armor", icon: Shield, page: "armor" as GamePage },
    { title: "🏆 Season Rankings", icon: Trophy, page: "season_rankings" as GamePage },
    { title: "🎯 Hit List", icon: Skull, page: "hit_list" as GamePage },
    { title: "🛡️ Bodyguards", icon: Shield, page: "bodyguards" as GamePage },
  ]},
  { title: "🎲 Gambling", icon: Dices, children: [
    { title: "🎲 Dice", icon: Dice1, page: "gambling_dice" as GamePage },
    { title: "🎟️ Lotto", icon: Ticket, page: "gambling_lotto" as GamePage },
    { title: "🃏 Blackjack", icon: Wallet, page: "gambling_blackjack" as GamePage },
    { title: "🪙 Coin Toss", icon: Coins, page: "gambling_coin" as GamePage },
    { title: "🐴 Horse Racing", icon: LandmarkIcon, page: "gambling_horse" as GamePage },
    { title: "🔢 Number Game", icon: Hash, page: "gambling_number" as GamePage },
    { title: "🎲 Gambling Dens", icon: Coins, page: "gambling_dens" as GamePage },
    { title: "🔴 Roulette", icon: Coins, page: "roulette" as GamePage },
    { title: "🎰 Slots", icon: Coins, page: "slots" as GamePage },
    { title: "💀 Russian Roulette", icon: Skull, page: "russian_roulette" as GamePage },
    { title: "🐕 Dog Fighting", icon: SwordsIcon, page: "dog_fighting" as GamePage },
    { title: "🏎️ Street Racing", icon: Car, page: "street_racing" as GamePage },
  ]},
  { title: "📋 Missions", icon: Target, children: [
    { title: "📋 Missions", icon: Target, page: "missions" as GamePage },
    { title: "⚡ World Events", icon: Zap, page: "world_events" as GamePage },
    { title: "🎁 Daily Login", icon: Gift, page: "daily_login" as GamePage },
    { title: "📅 Daily Challenges", icon: Calendar, page: "daily_challenges" as GamePage },
    { title: "🛡️ Season Pass", icon: Shield, page: "season_pass" as GamePage },
    { title: "🗝️ Secret Challenges", icon: LockKeyhole, page: "secret_challenges" as GamePage },
  ]},
  { title: "💰 Economy", icon: Banknote, children: [
    { title: "📈 Stock Market", icon: BarChart3, page: "stock_market" as GamePage },
    { title: "🏠 Real Estate", icon: Building2, page: "real_estate" as GamePage },
    { title: "🏪 Businesses", icon: Shield, page: "businesses" as GamePage },
    { title: "🏷️ Auction House", icon: Banknote, page: "auction_house" as GamePage },
    { title: "🛡️ Insurance", icon: ShieldCheck, page: "insurance" as GamePage },
    { title: "💳 Loans", icon: Landmark, page: "loans" as GamePage },
  ]},
  { title: "📦 Assets", icon: Package, children: [
    { title: "🚗 Garage", icon: Wrench, page: "garage" as GamePage },
    { title: "🎒 My Items", icon: Package, page: "items" as GamePage },
    { title: "✈️ Airport", icon: Plane, page: "airport" as GamePage },
    { title: "🐾 Criminal Pets", icon: Users, page: "criminal_pets" as GamePage },
  ]},
  { title: "📊 Progression", icon: Trophy, children: [
    { title: "🧠 Skill Tree", icon: Brain, page: "skill_tree" as GamePage },
    { title: "🏅 Achievements", icon: Trophy, page: "achievements" as GamePage },
    { title: "👑 Titles", icon: Crown, page: "titles" as GamePage },
    { title: "📜 Legacy", icon: BookOpen, page: "legacy" as GamePage },
    { title: "🏟️ Colosseum", icon: Swords, page: "colosseum" as GamePage },
    { title: "🔥 Crime Spree", icon: Flame, page: "crime_spree" as GamePage },
  ]},
  { title: "🌐 Underworld", icon: Globe, children: [
    { title: "🖤 Black Market", icon: Package, page: "black_market" as GamePage },
    { title: "🔴 Wanted Board", icon: AlertTriangle, page: "wanted_board" as GamePage },
    { title: "🚛 Smuggling Routes", icon: Truck, page: "smuggling_routes" as GamePage },
    { title: "🏠 Safe Houses", icon: Home, page: "safe_houses" as GamePage },
    { title: "🤝 Cartel", icon: Users, page: "cartel" as GamePage },
    { title: "🌍 Reputation", icon: Globe, page: "reputation" as GamePage },
  ]},
  { title: "👥 Social", icon: Users, children: [
    { title: "👨‍👩‍👦 Family", icon: Users, page: "family" as GamePage },
    { title: "🤝 Crew System", icon: Users, page: "crew_system" as GamePage },
    { title: "💼 Company", icon: Shield, page: "company" as GamePage },
    { title: "🎁 Gifting", icon: Crown, page: "gifting" as GamePage },
    { title: "🌟 Crime Fame", icon: Trophy, page: "crime_fame" as GamePage },
  ]},
  { title: "🌐 World", icon: Globe, children: [
    { title: "🗺️ World Map", icon: Globe, page: "world_map" as GamePage },
    { title: "📰 News Ticker", icon: Newspaper, page: "news_ticker" as GamePage },
    { title: "🌦️ Weather", icon: Cloud, page: "weather" as GamePage },
    { title: "📺 Crime TV", icon: Tv, page: "crime_tv" as GamePage },
  ]},
  { title: "💎 Arsenal", icon: Gem, children: [
    { title: "🔨 Crafting", icon: Hammer, page: "crafting" as GamePage },
    { title: "💎 Legendary Items", icon: Gem, page: "legendary_items" as GamePage },
    { title: "🎁 Mystery Boxes", icon: Star, page: "mystery_boxes" as GamePage },
    { title: "👻 Ghost Mode", icon: Ghost, page: "ghost_mode" as GamePage },
  ]},
  { title: "🎮 Arena", icon: Swords, children: [
    { title: "🥊 Fight Club", icon: Swords, page: "spar" as GamePage },
    { title: "⚔️ Deathmatch", icon: Swords, page: "arena" as GamePage },
    { title: "💣 Endgame Raids", icon: Bomb, page: "raids" as GamePage },
  ]},
  { title: "📈 Financial", icon: TrendingUp, children: [
    { title: "₿ Crypto", icon: Coins, page: "crypto" as GamePage },
    { title: "🎰 Lottery", icon: Ticket, page: "lottery" as GamePage },
    { title: "🏙️ Districts", icon: MapPin, page: "city_districts" as GamePage },
  ]},
  { title: "⚡ Boosts", icon: Zap, children: [
    { title: "⚡ Boosts & Events", icon: Zap, page: "boosts" as GamePage },
    { title: "🎉 All Events", icon: Star, page: "events" as GamePage },
  ]},
  { title: "⭐ Status", icon: Star, children: [
    { title: "⭐ Prestige", icon: Crown, page: "prestige" as GamePage },
    { title: "🏆 Leaderboards", icon: Trophy, page: "leaderboards" as GamePage },
    { title: "🌲 Mastery", icon: TreePine, page: "crime_mastery" as GamePage },
    { title: "📜 Legacy", icon: Award, page: "legacy_board" as GamePage },
    { title: "⏪ Time Machine", icon: Clock, page: "time_machine" as GamePage },
  ]},
];

const rightMenuSections: MenuItem[] = [
  { title: "📬 Communication", icon: MessageSquare, children: [
    { title: "📩 Messages", icon: MessageSquare, page: "messages" as GamePage },
    { title: "📥 Inbox", icon: Inbox, page: "inbox" as GamePage },
    { title: "🔔 Notifications", icon: Bell, page: "notifications_page" as GamePage },
  ]},
  { title: "💬 Forums", icon: MessageSquare, children: [
    { title: "📢 General", icon: MessageSquare, page: "forum_general" as GamePage },
    { title: "💰 Sales & Wanted", icon: Banknote, page: "forum_sales" as GamePage },
    { title: "💭 Off-Topic", icon: MessageSquare, page: "forum_offtopic" as GamePage },
    { title: "🌑 Shadows", icon: MessageSquare, page: "forum_shadows" as GamePage },
    { title: "🔍 Search Posts", icon: Search, page: "forum_search" as GamePage },
  ]},
  { title: "🏙️ World", icon: MapPin, children: [
    { title: "🏙️ City Overview", icon: MapPin, page: "city_overview" as GamePage },
    { title: "📊 Statistics", icon: BarChart3, page: "statistics" as GamePage },
    { title: "🟢 Online Players", icon: Wifi, page: "online_list" as GamePage },
  ]},
  { title: "❓ Help", icon: HelpCircle, children: [
    { title: "❓ FAQ", icon: BookOpen, page: "faq" as GamePage },
    { title: "🆘 Support", icon: HelpCircle, page: "support" as GamePage },
  ]},
  { title: "⚙️ System", icon: Shield, children: [
    { title: "⚙️ Admin Panel", icon: Shield, page: "enhanced_admin" as GamePage },
    { title: "🔑 Become Admin", icon: Key, page: "become_admin" as GamePage },
  ]},
];

function LeftSidebar({ activePage, setPage }: { activePage: GamePage; setPage: (p: GamePage) => void }) {
  const [expanded, setExpanded] = useState<string[]>(leftMenuSections.map(s => s.title));
  const toggleSection = (t: string) => setExpanded(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border flex items-center gap-2">
        <Crown className="size-5 text-primary" />
        <span className="font-bold text-sm">ShadowEmpire</span>
      </div>
      <nav className="flex-1 py-2">
        {leftMenuSections.map(s => {
          if (s.children) {
            const open = expanded.includes(s.title);
            return (
              <div key={s.title} className="border-t border-sidebar-border/30 first:border-t-0">
                <button onClick={() => toggleSection(s.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                  <s.icon className="size-3.5" />{s.title}
                  <ChevronDown className={`size-3 ml-auto transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {s.children?.map(c => c.page ? (
                        <button key={c.page} onClick={() => menuClick(c.page, setPage)}
                          className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs transition-all mafia-sidebar-item ${activePage === c.page ? "active" : "text-sidebar-foreground/60"}`}>
                          <c.icon className="size-3.5" />{c.title}
                        </button>
                      ) : null)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return s.page ? (
            <button key={s.page} onClick={() => menuClick(s.page, setPage)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all mafia-sidebar-item ${activePage === s.page ? "active" : "text-sidebar-foreground/60"}`}>
              <s.icon className="size-4" />{s.title}
            </button>
          ) : null;
        })}
      </nav>
    </aside>
  );
}

function RightPanel({ setPage }: { setPage: (p: GamePage) => void }) {
  const player = useQuery(api.game.getPlayer);
  const unreadCount = useQuery(api.game.getUnreadCount);
  const [expandedRight, setExpandedRight] = useState(["💬 Forums", "📬 Communication"]);
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
            <div>
              {(() => { const xpNeeded = (player.level ?? 1) * 100; const xp = player.experience ?? 0; const pct = Math.min(100, (xp / xpNeeded) * 100); const rank = (player.level ?? 1) >= 50 ? "Godfather" : (player.level ?? 1) >= 30 ? "Don" : (player.level ?? 1) >= 20 ? "Capo" : (player.level ?? 1) >= 10 ? "Soldier" : "Associate"; return (
              <>
                <div className="flex justify-between text-[10px] text-sidebar-foreground/50 mb-0.5"><span className="flex items-center gap-1"><Trophy className="size-2.5 text-yellow-400" />{rank}</span><span>XP {xp}/{xpNeeded}</span></div>
                <div className="h-1.5 rounded-full bg-sidebar-accent overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </>
              ); })()}
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
              <div key={s.title} className="border-t border-sidebar-border/30 first:border-t-0">
                <button onClick={() => toggleRight(s.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                  <s.icon className="size-3.5" />{s.title}
                  <ChevronDown className={`size-3 ml-auto transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {s.children?.map(c => c.page ? (
                        <button key={c.page} onClick={() => menuClick(c.page, setPage)}
                          className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-primary transition-colors">
                          <c.icon className="size-3.5" />{c.title}
                        </button>
                      ) : null)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return s.page ? (
            <button key={s.page} onClick={() => menuClick(s.page, setPage)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-primary transition-colors">
              <s.icon className="size-4" />{s.title}
              {s.page === "inbox" && unreadCount && unreadCount > 0 ? (
                <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              ) : null}
            </button>
          ) : null;
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
  const boostInfo = useQuery(api.gameEnhanced.getBoostInfo);
  const randomEvent = useQuery(api.gameEnhanced.getRandomEvent);
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

      {/* Active Events */}
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">⚡ Active Events & Boosts</h3>
        <div className="grid grid-cols-1 gap-2">
          {boostInfo?.weekendBoost?.active && (
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-sm">
              <span className="font-bold text-orange-400">🔥 Weekend Boost</span>
              <span className="text-muted-foreground ml-2">2x rewards on all actions!</span>
            </div>
          )}
          {boostInfo?.goldenHour?.active && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
              <span className="font-bold text-yellow-400">✨ Golden Hour</span>
              <span className="text-muted-foreground ml-2">3x rewards active!</span>
            </div>
          )}
          {boostInfo?.killFreeZone?.active && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
              <span className="font-bold text-blue-400">⚔️ Kill Free Zone</span>
              <span className="text-muted-foreground ml-2">PvP disabled!</span>
            </div>
          )}
          {randomEvent && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-sm">
              <span className="font-bold text-purple-400">{randomEvent.emoji} {randomEvent.name}</span>
              <span className="text-muted-foreground ml-2">{randomEvent.description}</span>
            </div>
          )}
          {!boostInfo?.weekendBoost?.active && !boostInfo?.goldenHour?.active && !boostInfo?.killFreeZone?.active && !randomEvent && (
            <div className="p-3 rounded-lg bg-background/40 border border-border/50 text-sm text-muted-foreground">No active events right now. Check back soon!</div>
          )}
        </div>
        {boostInfo?.weekendBoost && !boostInfo.weekendBoost.active && (
          <div className="text-[10px] text-muted-foreground">🔥 Next Weekend Boost: Friday 00:00</div>
        )}
        {boostInfo?.goldenHour && !boostInfo.goldenHour.active && (
          <div className="text-[10px] text-muted-foreground">✨ Golden Hour: Daily 12:00-13:00</div>
        )}
        {boostInfo?.killFreeZone && !boostInfo.killFreeZone.active && (
          <div className="text-[10px] text-muted-foreground">⚔️ Kill Free Zone: Mon-Wed 20:00-22:00</div>
        )}
      </div>

      {/* Crime Momentum */}
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">🎯 Crime Focus</h3>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Momentum</span>
            <span>{(player.crimeMomentum ?? 0)}% / 90%</span>
          </div>
          <div className="h-3 rounded-full bg-background/60 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${((player.crimeMomentum ?? 0) >= 90) ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-red-500 to-orange-400"}`} style={{ width: `${Math.min(100, ((player.crimeMomentum ?? 0) / 90) * 100)}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">{((player.crimeMomentum ?? 0) >= 90) ? "✅ Maximum focus! Commit crimes for full rewards!" : "Commit crimes to build momentum. Reach 90% for maximum success!"}</div>
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
  const commitCrime = useMutation(api.game.commitCrime);
  const commitCategoryCrime = useMutation(api.game.commitCategoryCrime);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const cooldown = useCooldown(10);
  const travelCooldown = useCooldown(15);

  if (!player) return <LoadingPage />;

  const level = player.level ?? 1;
  const baseSuccessRate = 0.6;
  const levelBonus = Math.min(0.35, level * 0.005); // +0.5% per level, max +35%
  const successRate = Math.min(0.95, baseSuccessRate + levelBonus);

  const travel = async (loc: string) => {
    if (travelCooldown.onCooldown) return;
    setLoading(true); setMsg("");
    try { await changeLocation({ location: loc }); setMsg(`✅ ✈️ Flew to ${loc}! Success rate here: ${Math.round(successRate * 100)}%`); travelCooldown.startCooldown(); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  const doDrugRun = async (city: string) => {
    if (cooldown.onCooldown) return;
    setLoading(true); setMsg("");
    try {
      const res = await commitCategoryCrime({ crimeId: "drug_run", reward: Math.floor(3000 * (cities.find(c => c.name === city)?.boost ?? 1)), risk: Math.max(10, 50 - Math.floor(levelBonus * 100)), xp: 15 });
      const data = res as unknown as Record<string, unknown>;
      if (data.success) { setMsg(`✅ 💊 Drug run in ${city} successful! +$${((data.moneyEarned as number) ?? 0).toLocaleString()} (+50% XP boost!)`); }
      else { setMsg(`❌ 💀 Drug run in ${city} failed! The cops were tipped off.`); }
      cooldown.startCooldown();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  const doTaxFraud = async (city: string) => {
    if (cooldown.onCooldown) return;
    setLoading(true); setMsg("");
    try {
      const res = await commitCategoryCrime({ crimeId: "tax_fraud", reward: Math.floor(8000 * (cities.find(c => c.name === city)?.boost ?? 1)), risk: Math.max(5, 40 - Math.floor(levelBonus * 100)), xp: 20 });
      const data = res as unknown as Record<string, unknown>;
      if (data.success) { setMsg(`✅ 📋 Tax fraud in ${city} filed! +$${((data.moneyEarned as number) ?? 0).toLocaleString()}`); }
      else { setMsg(`❌ 🚨 Tax fraud caught in ${city}!`); }
      cooldown.startCooldown();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  const doMurder = async (city: string) => {
    if (cooldown.onCooldown) return;
    setLoading(true); setMsg("");
    try {
      const res = await commitCategoryCrime({ crimeId: "murder", reward: Math.floor(10000 * (cities.find(c => c.name === city)?.boost ?? 1)), risk: Math.max(10, 55 - Math.floor(levelBonus * 100)), xp: 25 });
      const data = res as unknown as Record<string, unknown>;
      if (data.success) { setMsg(`✅ 🔪 Hit in ${city} completed! +$${((data.moneyEarned as number) ?? 0).toLocaleString()} (+50% XP!)`); }
      else { setMsg(`❌ 🚔 Murder attempt failed in ${city}! Witnesses everywhere!`); }
      cooldown.startCooldown();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    setLoading(false);
  };

  const crimeLevelFor = (c: any) => c.crime === "high" ? "bg-red-950/50 text-red-400 border-red-800/50" : c.crime === "medium" ? "bg-yellow-950/50 text-yellow-400 border-yellow-800/50" : "bg-green-950/50 text-green-400 border-green-800/50";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Plane className="size-7 text-cyan-400" /><div><h2 className="text-2xl font-bold">✈️ International Airport</h2><p className="text-xs text-muted-foreground">Travel between cities • Higher level = higher success rate</p></div></div>
        <div className="text-right"><div className="text-[10px] text-muted-foreground">Crime Success</div><div className={`text-lg font-bold ${successRate >= 0.8 ? "text-green-400" : successRate >= 0.65 ? "text-yellow-400" : "text-red-400"}`}>{Math.round(successRate * 100)}%</div></div>
      </div>

      {/* Current Location & Level Info */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><MapPin className="size-5 text-cyan-400" /></div>
            <div><div className="text-[10px] text-muted-foreground">Current Location</div><div className="text-sm font-bold">{player.location ?? "New York"}</div></div>
          </div>
          <div className="text-right"><div className="text-[10px] text-muted-foreground">Level Bonus</div><div className="text-sm font-bold text-primary">+{Math.round(levelBonus * 100)}%</div></div>
        </div>
        <div className="mt-3 h-2 bg-background/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${(level / 100) * 100}%` }} />
        </div>
        <div className="text-[9px] text-muted-foreground mt-1 text-right">Lv.{level} → Success rate {Math.round(successRate * 100)}% (max 95% at Lv.70+)</div>
      </div>

      <CooldownBar cooldown={travelCooldown} />

      {/* City Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cities.filter(c => c.name !== player.location).map(c => (
          <motion.div key={c.name} whileHover={{ scale: 1.01 }} className={`mafia-card rounded-xl p-4 space-y-3 transition-all ${selectedCity === c.name ? "border-primary shadow-lg shadow-primary/10" : ""}`}
            onClick={() => setSelectedCity(selectedCity === c.name ? null : c.name)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <div className="font-bold text-sm">{c.name}</div>
                  <div className="flex gap-1.5 mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${crimeLevelFor(c)}`}>{c.crime.toUpperCase()} CRIME</span>
                    {c.boost !== 1.0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">+{Math.round((c.boost - 1) * 100)}% REWARDS</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Tags */}
            <div className="flex flex-wrap gap-1.5">
              {c.murderCity && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-950/30 text-red-300 border border-red-800/30">🔥 24/7 MURDERS +50% XP</span>}
              {c.drugRun && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-950/30 text-purple-300 border border-purple-800/30">💊 DRUG RUNS</span>}
              {c.taxFraud && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-950/30 text-orange-300 border border-orange-800/30">📋 TAX FRAUD</span>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); travel(c.name); }} disabled={loading || (player.inPrison ?? false) || travelCooldown.onCooldown}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-xs font-bold rounded-lg hover:from-cyan-500 hover:to-blue-400 disabled:opacity-40 transition-all">
                ✈️ Travel Here
              </button>
            </div>

            {/* Expanded Activity Buttons */}
            {selectedCity === c.name && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase">Activities in {c.name}</div>
                {c.drugRun && (
                  <button onClick={(e) => { e.stopPropagation(); doDrugRun(c.name); }} disabled={loading || cooldown.onCooldown}
                    className="w-full py-2 bg-purple-600/15 text-purple-400 text-xs font-semibold rounded-lg hover:bg-purple-600/25 border border-purple-600/20 disabled:opacity-40 flex items-center justify-center gap-2">
                    💊 Drug Run • ${Math.floor(3000 * (c.boost ?? 1)).toLocaleString()} • {Math.round(successRate * 100)}% success
                  </button>
                )}
                {c.taxFraud && (
                  <button onClick={(e) => { e.stopPropagation(); doTaxFraud(c.name); }} disabled={loading || cooldown.onCooldown}
                    className="w-full py-2 bg-orange-600/15 text-orange-400 text-xs font-semibold rounded-lg hover:bg-orange-600/25 border border-orange-600/20 disabled:opacity-40 flex items-center justify-center gap-2">
                    📋 Tax Fraud • ${Math.floor(8000 * (c.boost ?? 1)).toLocaleString()} • {Math.round(successRate * 100)}% success
                  </button>
                )}
                {c.murderCity && (
                  <button onClick={(e) => { e.stopPropagation(); doMurder(c.name); }} disabled={loading || cooldown.onCooldown}
                    className="w-full py-2 bg-red-600/15 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-600/25 border border-red-600/20 disabled:opacity-40 flex items-center justify-center gap-2">
                    🔪 Murder Contract • ${Math.floor(10000 * (c.boost ?? 1)).toLocaleString()} • {Math.round(successRate * 100)}% success
                  </button>
                )}
                <div className="text-[9px] text-muted-foreground">⏱️ 10s cooldown between actions</div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 text-sm font-bold border-2 ${msg.includes("✅") ? "bg-green-950/30 border-green-500/50 text-green-400" : "bg-red-950/30 border-red-500/50 text-red-400"}`}>{msg}</motion.div>
      )}
    </div>
  );
}

function FightClubPage() {
  const player = useQuery(api.game.getPlayer);
  const fightPlayer = useMutation(api.game.fightPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const cooldown = useCooldown(90);

  if (!player) return <LoadingPage />;

  const fight = async (targetId: string) => {
    if (cooldown.onCooldown) return;
    setLoading(true); setResult(null);
    try { const res = await fightPlayer({ defenderId: targetId as never }); setResult(res as unknown as Record<string, unknown>); cooldown.startCooldown(); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };

  const opponents = players?.filter(p => p._id !== player._id) ?? [];

  return (
    <div className="animate-fade-in space-y-5">
      <AnimatePresence>
        {result && !result.error && (
          <EpicActionResult
            success={!!result.attackerWins}
            title={result.attackerWins ? "🥊 VICTORY!" : "💀 DEFEATED!"}
            money={result.moneyStolen as number}
            message={`You dealt ${(result.attackerDamage as number)} damage — Took ${(result.defenderDamage as number)} damage`}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>
      {result && 'error' in result && !!result.error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400 font-bold">🚨 {String((result as Record<string, unknown>).error)}</motion.div>}
      <CooldownBar cooldown={cooldown} />
      <div className="flex items-center gap-3"><Swords className="size-7 text-primary" /><h2 className="text-2xl font-bold">Fight Club</h2></div>
      <p className="text-muted-foreground text-sm">Challenge players in your city. Winner takes 5% of the loser's cash.</p>
      {opponents.length === 0 ? (
        <EmptyPage icon={<Swords className="size-8 text-primary" />} title="No Opponents" desc="No other players in your city to fight." />
      ) : (
        <div className="space-y-2">
          {opponents.map(p => (
            <motion.div key={p._id} whileHover={{ scale: 1.01 }} className="mafia-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center"><User className="size-4 text-destructive" /></div>
                <div>
                  <div className="font-semibold text-sm">{p.nickname ?? "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1} • ATK {p.attack ?? 0} • DEF {p.defense ?? 0}</div>
                </div>
              </div>
              <EpicButton onClick={() => fight(p._id)} disabled={loading || player.inPrison || cooldown.onCooldown} loading={loading} cooldown={cooldown} variant="danger">
                ⚔️ FIGHT
              </EpicButton>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function KillPage() {
  const player = useQuery(api.game.getPlayer);
  const killPlayer = useMutation(api.game.killPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const cooldown = useCooldown(90);

  if (!player) return <LoadingPage />;

  const kill = async (targetId: string) => {
    if (cooldown.onCooldown) return;
    setLoading(true); setResult(null);
    try { const res = await killPlayer({ targetId: targetId as never }); setResult(res as unknown as Record<string, unknown>); cooldown.startCooldown(); }
    catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); }
    setLoading(false);
  };

  const targets = players?.filter(p => p._id !== player._id) ?? [];

  return (
    <div className="animate-fade-in space-y-5">
      <AnimatePresence>
        {result && !result.error && (
          <EpicActionResult
            success={!!result.success}
            title={result.success ? "💀 TARGET ELIMINATED" : "🚨 ATTEMPT FAILED"}
            message={result.success ? "Your target has been permanently eliminated." : "Your target survived. You took damage in the process."}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>
      {result && 'error' in result && !!result.error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400 font-bold">🚨 {String((result as Record<string, unknown>).error)}</motion.div>}
      <CooldownBar cooldown={cooldown} />
      <div className="flex items-center gap-3"><Skull className="size-7 text-destructive" /><h2 className="text-2xl font-bold">Kill</h2></div>
      <div className="mafia-card rounded-xl p-4 border-destructive/30 border text-sm text-muted-foreground">
        ⚠️ Kill attempts are high-risk. If you fail, you take heavy damage. Only the strong survive.
      </div>
      {targets.length === 0 ? (
        <EmptyPage icon={<Skull className="size-8 text-destructive" />} title="No Targets" desc="No other players in your city to target." />
      ) : (
        <div className="space-y-2">
          {targets.map(p => (
            <motion.div key={p._id} whileHover={{ scale: 1.01 }} className="mafia-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center"><Skull className="size-4 text-destructive" /></div>
                <div>
                  <div className="font-semibold text-sm">{p.nickname ?? "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1} • ATK {p.attack ?? 0} • DEF {p.defense ?? 0}</div>
                </div>
              </div>
              <EpicButton onClick={() => kill(p._id)} disabled={loading || player.inPrison || cooldown.onCooldown} loading={loading} cooldown={cooldown} variant="danger">
                💀 KILL
              </EpicButton>
            </motion.div>
          ))}
        </div>
      )}
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
  const prisonStatus = useQuery(api.game.getPrisonStatus);
  const payBail = useMutation(api.game.payBail);
  const prisonEscape = useMutation(api.game.prisonEscape);
  const paroleHearing = useMutation(api.game.paroleHearing);
  const doPrisonJob = useMutation(api.game.prisonJob);
  const prisonFight = useMutation(api.game.prisonFight);
  const joinGang = useMutation(api.game.joinPrisonGang);
  const smuggleContraband = useMutation(api.game.smuggleContraband);
  const upgradeCell = useMutation(api.game.upgradeCell);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "jobs" | "gangs" | "contraband" | "cells" | "escape">("overview");
  const [secondsLeft, setSecondsLeft] = useState(15);

  // Live 15-second countdown
  useEffect(() => {
    if (!player?.inPrison) return;
    const end = Date.now() + 15000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        window.location.reload();
      }
    }, 500);
    return () => clearInterval(timer);
  }, [player?.inPrison]);

  // Auto-reload when prison sentence is over
  useEffect(() => {
    if (player && !player.inPrison) {
      window.location.reload();
    }
  }, [player?.inPrison]);

  if (!player || !prisonStatus) return <LoadingPage />;
  if (!player.inPrison) return <EmptyPage icon={<Lock className="size-8 text-primary" />} title="Not in Prison" desc="You're a free man. Commit crimes to end up here..." />;

  const remaining = Math.max(0, secondsLeft);
  const bailCost = 2000 + (player.level ?? 1) * 200;
  const solLeft = Math.ceil((prisonStatus.solitaryTime ?? 0) / 1000);

  const doAction = async (fn: () => Promise<unknown>, label: string) => { setLoading(true); setMsg(""); try { await fn(); setMsg(label); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); };

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "escape" as const, label: "Escape" },
    { id: "jobs" as const, label: "Jobs" },
    { id: "gangs" as const, label: "Gangs" },
    { id: "contraband" as const, label: "Contraband" },
    { id: "cells" as const, label: "Cells" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Lock className="size-7 text-destructive" /><h2 className="text-2xl font-bold">Prison</h2></div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Time Left" value={`${secondsLeft}s`} color="text-destructive" />
        <StatBox label="Cell Level" value={`Lv.${prisonStatus.cellLevel ?? 1}`} />
        <StatBox label="Prison $" value={(prisonStatus.prisonCurrency ?? 0).toString()} color="text-yellow-400" />
        <StatBox label="Contraband" value={(prisonStatus.contraband ?? 0).toString()} color="text-purple-400" />
      </div>

      {/* Live Countdown */}
      <div className="mafia-card rounded-xl p-6 text-center">
        <div className="text-6xl font-black text-destructive animate-pulse">{secondsLeft}</div>
        <div className="text-sm text-muted-foreground mt-2">seconds until release</div>
        <div className="h-3 bg-background/60 rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
            animate={{ width: `${((15 - secondsLeft) / 15) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {solLeft > 0 && <div className="mafia-card rounded-lg p-3 border-destructive/30 border text-sm text-destructive">🔒 Solitary: {solLeft} min remaining</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-background/50 rounded-lg p-1 overflow-x-auto">
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>)}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <button onClick={() => doAction(async () => { const r = await payBail(); }, `Paid $${bailCost.toLocaleString()} bail!`)} disabled={loading || (player.money ?? 0) < bailCost}
            className="w-full mafia-card rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all disabled:opacity-40">
            <div className="flex items-center gap-3"><CircleDollarSign className="size-5 text-green-400" /><span className="font-semibold text-sm">Pay Bail</span></div>
            <span className="text-xs text-muted-foreground">${bailCost.toLocaleString()}</span>
          </button>
          <button onClick={() => doAction(async () => { await paroleHearing(); }, "Parole hearing requested!")} disabled={loading || solLeft > 0}
            className="w-full mafia-card rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all disabled:opacity-40">
            <div className="flex items-center gap-3"><Shield className="size-5 text-blue-400" /><span className="font-semibold text-sm">Parole Hearing</span></div>
            <span className="text-xs text-muted-foreground">50% time reduction</span>
          </button>
          {prisonStatus.prisonJob && <div className="mafia-card rounded-lg p-3 text-xs text-muted-foreground">Working as: <span className="text-primary font-bold capitalize">{prisonStatus.prisonJob}</span></div>}
          {prisonStatus.prisonGang && <div className="mafia-card rounded-lg p-3 text-xs text-muted-foreground">Gang: <span className="text-red-400 font-bold">{prisonStatus.prisonGang}</span></div>}
        </div>
      )}

      {tab === "escape" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-5 text-center">
            <div className="text-4xl mb-3">🏃</div>
            <p className="text-sm text-muted-foreground mb-3">Attempt to escape prison. Success chance based on your ATK.</p>
            <button onClick={() => doAction(async () => { const r = await prisonEscape(); if (!r.success) setMsg("Escape failed! Added to solitary."); }, "Escaped!")} disabled={loading || solLeft > 0}
              className="px-8 py-3 bg-destructive text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50">Attempt Escape</button>
          </div>
        </div>
      )}

      {tab === "jobs" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Work to earn money, prison currency, and reduce your sentence.</p>
          {[{ id: "kitchen" as const, icon: "🍳", name: "Kitchen", money: "$100", time: "-10min" }, { id: "laundry" as const, icon: "👕", name: "Laundry", money: "$75", time: "-5min" }, { id: "library" as const, icon: "📚", name: "Library", money: "$50", time: "-30min" }, { id: "workshop" as const, icon: "🔨", name: "Workshop", money: "$150", time: "-7.5min" }].map(j => (
            <button key={j.id} onClick={() => doAction(async () => { await doPrisonJob({ job: j.id }); }, `Worked ${j.name}!`)} disabled={loading || solLeft > 0}
              className="w-full mafia-card rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-all disabled:opacity-40">
              <div className="flex items-center gap-2"><span>{j.icon}</span><span className="text-sm font-semibold">{j.name}</span></div>
              <div className="text-xs text-muted-foreground"><span className="text-green-400">{j.money}</span> • <span className="text-blue-400">{j.time}</span></div>
            </button>
          ))}
          <div className="mafia-card rounded-lg p-3"><p className="text-xs text-muted-foreground mb-2">Fight other inmates:</p>
            <button onClick={() => doAction(async () => { await prisonFight({ targetId: player._id }); }, "Prison fight complete!")} disabled={loading || solLeft > 0}
              className="px-4 py-2 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-40">Prison Fight</button>
          </div>
        </div>
      )}

      {tab === "gangs" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Join a prison gang for protection and perks.</p>
          {["Aryan Brotherhood", "Mexican Mafia", "Black Guerrilla", "Italian Mafia"].map(g => (
            <button key={g} onClick={() => doAction(async () => { await joinGang({ gang: g as never }); }, `Joined ${g}!`)} disabled={loading || solLeft > 0}
              className={`w-full mafia-card rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-all disabled:opacity-40 ${prisonStatus.prisonGang === g ? "border-primary" : ""}`}>
              <span className="text-sm font-semibold">{g}</span>
              {prisonStatus.prisonGang === g && <span className="text-xs text-primary">✓ Joined</span>}
            </button>
          ))}
        </div>
      )}

      {tab === "contraband" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Smuggle items into prison. 30% chance of getting caught!</p>
          {[{ type: "shank" as const, icon: "🔪", name: "Shank", cost: 500 }, { type: "phone" as const, icon: "📱", name: "Phone", cost: 300 }, { type: "drugs" as const, icon: "💊", name: "Drugs", cost: 200 }, { type: "lockpick" as const, icon: "🔑", name: "Lockpick", cost: 400 }].map(i => (
            <button key={i.type} onClick={() => doAction(async () => { const r = await smuggleContraband({ type: i.type }); if (r.caught) setMsg("Caught smuggling! Sent to solitary."); }, `Smuggled ${i.name}!`)} disabled={loading || (player.money ?? 0) < i.cost || solLeft > 0}
              className="w-full mafia-card rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-all disabled:opacity-40">
              <div className="flex items-center gap-2"><span>{i.icon}</span><span className="text-sm font-semibold">{i.name}</span></div>
              <span className="text-xs text-muted-foreground">${i.cost}</span>
            </button>
          ))}
        </div>
      )}

      {tab === "cells" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Upgrade your cell for better conditions.</p>
          {[1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => doAction(async () => { await upgradeCell({ level: l }); }, `Upgraded to Cell Lv.${l}!`)} disabled={loading || l <= (prisonStatus.cellLevel ?? 1) || (player.money ?? 0) < l * 1000}
              className={`w-full mafia-card rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-all disabled:opacity-40 ${(prisonStatus.cellLevel ?? 1) >= l ? "border-green-800/50" : ""}`}>
              <span className="text-sm font-semibold">Cell Level {l}</span>
              <span className="text-xs text-muted-foreground">${(l * 1000).toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}

      {msg && <div className="mafia-card rounded-lg p-3 text-sm text-primary animate-fade-in">✓ {msg}</div>}
    </div>
  );
}

function BountyBoardPage() {
  const player = useQuery(api.game.getPlayer);
  const bounties = useQuery(api.game.getActiveBounties);
  const placeBounty = useMutation(api.game.placeBounty);
  const claimBounty = useMutation(api.game.claimBounty);
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Skull className="size-7 text-destructive" /><h2 className="text-2xl font-bold">Bounty Board</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Place a Bounty</h3>
        <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Target Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Reward" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <button onClick={async () => { setLoading(true); try { await placeBounty({ targetId: targetId as never, reward: amount }); setMsg("Bounty placed!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading || (player.money ?? 0) < amount}
          className="w-full py-2.5 bg-destructive text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 text-sm">Place Bounty</button>
        {msg && <div className="text-xs text-primary">✓ {msg}</div>}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Bounties</h3>
        {bounties && bounties.length === 0 && <EmptyPage icon={<Skull className="size-8 text-muted-foreground" />} title="No Bounties" desc="No active bounties on the board." />}
        {bounties?.filter(b => b.placerId !== player._id).map(b => (
          <div key={b._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div><div className="text-sm font-semibold">Bounty on {b.targetId.slice(0, 8)}...</div><div className="text-xs text-muted-foreground">Placed {new Date(b.createdAt).toLocaleDateString()}</div></div>
            <div className="flex items-center gap-3"><span className="text-primary font-bold">${b.reward.toLocaleString()}</span>
              <button onClick={async () => { setLoading(true); try { const r = await claimBounty({ bountyId: b._id }); setMsg(r.success ? `Claimed $${r.reward}!` : "Claim failed!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading}
                className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-40">Claim</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DuelPage() {
  const player = useQuery(api.game.getPlayer);
  const duels = useQuery(api.game.getPendingDuels);
  const challengeDuel = useMutation(api.game.challengeDuel);
  const acceptDuel = useMutation(api.game.acceptDuel);
  const [targetId, setTargetId] = useState("");
  const [stake, setStake] = useState(500);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Swords className="size-7 text-primary" /><h2 className="text-2xl font-bold">Duels</h2></div>
      <div className="mafia-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Challenge a Player</h3>
        <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="Target Player ID" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <input type="number" value={stake} onChange={e => setStake(Number(e.target.value))} placeholder="Stake" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        <button onClick={async () => { setLoading(true); try { await challengeDuel({ targetId: targetId as never, stake }); setMsg("Duel challenged!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading || (player.money ?? 0) < stake}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 text-sm">Send Challenge</button>
        {msg && <div className="text-xs text-primary">✓ {msg}</div>}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Duels</h3>
        {duels && duels.length === 0 && <EmptyPage icon={<Swords className="size-8 text-muted-foreground" />} title="No Duels" desc="No pending duels." />}
        {duels?.filter(d => d.defenderId === player._id).map(d => (
          <div key={d._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div><div className="text-sm font-semibold">Duel Challenge</div><div className="text-xs text-muted-foreground">Stake: ${d.stake.toLocaleString()}</div></div>
            <button onClick={async () => { setLoading(true); try { await acceptDuel({ duelId: d._id }); setMsg("Duel completed!"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } setLoading(false); }} disabled={loading}
              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Accept</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparPage() {
  const player = useQuery(api.game.getPlayer);
  const sparPlayer = useMutation(api.game.sparPlayer);
  const players = useQuery(api.game.getPlayersInLocation, { location: player?.location ?? "New York" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  if (!player) return <LoadingPage />;
  const opponents = players?.filter(p => p._id !== player._id) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><Swords className="size-7 text-blue-400" /><h2 className="text-2xl font-bold">Spar</h2></div>
      <p className="text-sm text-muted-foreground">Fight friends for XP without losing money. No cash at stake.</p>
      {opponents.length === 0 ? <EmptyPage icon={<Swords className="size-8 text-blue-400" />} title="No Sparring Partners" desc="No players in your city." /> : (
        <div className="space-y-2">{opponents.map(p => (
          <div key={p._id} className="mafia-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-blue-500/10 flex items-center justify-center"><Swords className="size-4 text-blue-400" /></div>
              <div><div className="font-semibold text-sm">{p.nickname ?? "Unknown"}</div><div className="text-[10px] text-muted-foreground">Lv.{p.level ?? 1} • ATK {p.attack ?? 0}</div></div>
            </div>
            <button onClick={async () => { setLoading(true); setResult(null); try { const r = await sparPlayer({ targetId: p._id as never }); setResult(r as unknown as Record<string, unknown>); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } setLoading(false); }} disabled={loading}
              className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-40">SPAR</button>
          </div>
        ))}</div>
      )}
      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mafia-card rounded-xl p-4 text-sm border ${result.won ? "border-blue-800/50" : "border-orange-800/50"}`}>
          <div className={`font-bold text-lg ${result.won ? "text-blue-400" : "text-orange-400"}`}>{result.won ? "SPAR WON!" : "SPAR LOST"}</div>
          <div className="text-muted-foreground">Dealt {result.damage as number} • Took {result.taken as number} • +10 XP</div>
        </motion.div>
      )}
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
        <div className="flex items-center gap-3"><Users className="size-7 text-primary" /><h2 className="text-2xl font-bold">{(family as any).name} <span className="text-muted-foreground font-normal text-base">[{(family as any).tag}]</span></h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label="Level" value={`Lv.${(family as any).level}`} color="text-primary" />
          <StatBox label="Members" value={`${(family as any).memberCount}/${(family as any).maxMembers}`} />
          <StatBox label="Treasury" value={`$${((family as any).treasury ?? 0).toLocaleString()}`} color="text-green-400" />
          <StatBox label="XP" value={((family as any).experience ?? 0).toLocaleString()} color="text-yellow-400" />
        </div>
        <div className="mafia-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-4">{(family as any).description}</p>
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
  const cooldown = useCooldown(90);

  const doDice = async (g: "high" | "low" | "seven") => { try { setResult(await diceRoll({ amount: bet, guess: g }) as unknown as Record<string, unknown>); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } };
  const doCoin = async (g: "heads" | "tails") => { try { setResult(await coinToss({ amount: bet, guess: g }) as unknown as Record<string, unknown>); } catch (e: unknown) { setResult({ error: e instanceof Error ? e.message : "Error" }); } };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><span className="text-2xl">{icon}</span><h2 className="text-2xl font-bold">{title}</h2></div>
      {player && <div className="text-sm text-muted-foreground">Balance: <span className="text-primary font-bold">${(player.money ?? 0).toLocaleString()}</span></div>}
      <AnimatePresence>
        {result && !result.error && (
          <EpicActionResult
            success={!!result.won}
            title={result.won ? "WIN!" : "LOSS!"}
            money={result.winnings ? (result.winnings as number) : (result.won ? bet * 2 : -bet)}
            message={result.message as string}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>
      {result?.error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400 font-bold">{String(result.error)}</motion.div>}
      <CooldownBar cooldown={cooldown} />
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
  { q: "How does Blackjack work?", a: "Play against the dealer to get as close to 21 as possible without going over. Bet, deal cards, then Hit or Stand. Blackjack (21) pays 1.5x your bet!" },
  { q: "How do I buy lottery tickets?", a: "Visit the Lotto page. Choose daily ($100, 5 numbers 1-30), weekly ($500, 5 numbers 1-30), or mega ($5,000, 6 numbers 1-50). Match numbers to win big!" },
  { q: "How does the Garage work?", a: "Buy vehicles from the Garage shop for speed and storage bonuses. You can also steal vehicles (risky - may get arrested). Sell vehicles for 60% of purchase price." },
  { q: "How do I equip items?", a: "Buy items from the Points Shop using your points. Go to My Items and click Equip on weapons (ATK boost) or armor (DEF boost). Items affect your combat stats." },
  { q: "How do missions work?", a: "Accept missions from the Missions page. Each mission has a level requirement and reward. Accept, complete, and claim your money and points rewards." },
  { q: "What is Organized Crime?", a: "Family-only operations. Join a Family first, then participate in family heists for big payouts. Higher levels unlock more profitable operations." },
  { q: "How do businesses work?", a: "Buy businesses in the Company page. Each generates daily income. Upgrade businesses to increase earnings. Collect income anytime from the Collect button." },
  { q: "What is the Legacy system?", a: "When you die and respawn, your heir inherits 10% of your total wealth. Your lifetime stats, titles, and achievements are preserved." },
  { q: "How do I search forums?", a: "Use the Search Posts page to search across all forums by keyword. Results show post titles, bodies, and which forum they belong to." },
  { q: "How do I contact support?", a: "Use the Support page to submit a ticket. Enter a subject and description of your issue. Our team will respond to your messages." },
  { q: "What is the Underground Economy?", a: "A separate section with advanced criminal operations: counterfeiting, smuggling, drug trafficking, arson, racketeering, gambling dens, and more. Higher risk, higher reward." },
  { q: "How does the bounty system work?", a: "Place bounties on other players (min $500). Other players can claim the bounty by killing the target. Check the Bounty Board for active bounties." },
  { q: "How do duels work?", a: "Challenge a player to a formal 1v1 duel. Both players stake money. Winner takes both stakes. No random matchmaking - you choose your opponent." },
  { q: "What is the stock market?", a: "Invest in 5 company stocks. Prices fluctuate randomly. Buy low, sell high. Check your holdings and sell anytime for the current price." },
  { q: "How does insurance work?", a: "Buy insurance plans to protect your cash from robberies and kills. Basic ($500/week) protects up to $10K, Premium ($2K/week) protects up to $50K." },
  { q: "How do loans work?", a: "Borrow money from underground banks. Interest accrues - pay back fast or face debt collectors. You can only have one active loan at a time." },
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

  if (player === undefined) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  if (!player || !isRegistered) return <PlayerRegistration onRegistered={() => setRegistered(true)} />;
  if (player.isDead) return <DeathScreen />;

  const pageNames: Record<string, string> = {
    crimes: "Crimes", legendary_crimes: "Legendary Crimes", boss_fights: "Boss Fights", crime_empire: "Crime Empire", heist_planning: "Heist Planning", world_events: "World Events", criminal_pets: "Criminal Pets", headquarters: "Headquarters", bank: "Bank", hospital: "Hospital", points: "Points", fight_club: "Fight Club", bounty_board: "Bounty Board", duels: "Duels", spar: "Spar", tournament: "Tournament",
    garage: "Garage", items: "My Items", prison: "Prison", airport: "Airport",
    organized_crime: "Organized Crime", missions: "Missions", daily_raid: "Daily Raid",
    company: "Company", family: "Family", kill: "Kill", messages: "Messages",
    inbox: "Inbox", notifications_page: "Notifications", city_overview: "City Overview",
    statistics: "Statistics", support: "Support", send_message: "Send Message", faq: "FAQ",
  
    gambling_dice: "Dice", gambling_lotto: "Lotto", gambling_blackjack: "Blackjack",
    gambling_coin: "Coin Toss", gambling_horse: "Horse Racing", gambling_number: "Number Game",
    forum_general: "General", forum_sales: "Sales & Wanted", forum_offtopic: "Off-Topic",
    forum_shadows: "Shadows", forum_search: "Search Posts",
    stock_market: "Stock Market", real_estate: "Real Estate", businesses: "Businesses", auction_house: "Auction House", insurance: "Insurance", loans: "Loans", achievements: "Achievements", titles: "Titles", underground: "Underground Economy", death_match: "Death Match", season_rankings: "Season Rankings", combat_log: "Combat Log", fighting_styles: "Fighting Styles", armor: "Armor Shop", counterfeiting: "Counterfeiting", drug_trafficking: "Drug Trafficking", arson: "Arson", identity_theft: "Identity Theft", arms_dealing: "Arms Dealer", witness_intimidation: "Witness Intimidation", tax_evasion: "Tax Evasion", racketeering: "Racketeering", gambling_dens: "Gambling Dens", loan_sharking: "Loan Sharking", cargo_theft: "Cargo Theft", roulette: "Roulette", slots: "Slots", russian_roulette: "Russian Roulette", dog_fighting: "Dog Fighting", street_racing: "Street Racing", gifting: "Gifting", hit_list: "Hit List", black_market: "Black Market", crime_fame: "Crime Fame", skill_tree: "Skill Tree", daily_challenges: "Daily Challenges", colosseum: "Colosseum", safe_houses: "Safe Houses", crime_spree: "Crime Spree", wanted_board: "Wanted Board", smuggling_routes: "Smuggling Routes", cartel: "Cartel", reputation: "Reputation", my_profile: "My Profile", season_pass: "Season Pass", steal_from_house: "Steal From House", gta_car_theft: "GTA Car Theft", events: "Events & Competitions", bodyguards: "Bodyguards", secret_challenges: "Secret Challenges", boosts: "Boosts & Events", enhanced_admin: "Admin Panel", updates: "Game Updates", live_chat: "Live Chat", prestige: "Prestige", city_districts: "Districts", crafting: "Crafting", leaderboards: "Leaderboards", world_map: "World Map",  lottery: "Lottery", crypto: "Crypto", weather: "Weather", news_ticker: "News", crime_mastery: "Mastery", legendary_items: "Legendaries", arena: "Arena", legacy_board: "Legacy", raids: "Raids", mystery_boxes: "Mystery Boxes", ghost_mode: "Ghost Mode", crime_tv: "Crime TV", time_machine: "Time Machine", daily_login: "Daily Login Rewards", crew_system: "Crew System", ranked_pvp: "Ranked PvP",
  };

  const renderPage = () => {
    switch (activePage) {
      case "crimes": return <CrimesOverviewPage />;
      case "legendary_crimes": return <LegendaryCrimePage />;
      case "boss_fights": return <BossFightsPage />;
      case "crime_empire": return <CrimeEmpirePage />;
      case "heist_planning": return <HeistPlanningPage />;
      case "world_events": return <WorldEventsPage />;
      case "criminal_pets": return <CriminalPetsPage />;
      case "headquarters": return <HeadquartersPage />;
      case "bank": return <BankPage />;
      case "hospital": return <HospitalPage />;
      case "points": return <PointsShopPage />;
      case "garage": return <GaragePage />;
      case "items": return <MyItemsPage />;
      case "airport": return <AirportPage />;
      case "organized_crime": return <OrganizedCrimePage />;
      case "missions": return <MissionsPage />;
      case "company": return <CompanyPage />;
      case "family": return <FamilyPage />;
      case "kill": return <KillPage />;
      case "bounty_board": return <BountyBoardPage />;
      case "duels": return <DuelPage />;
      case "spar": return <SparPage />;
      case "tournament": return <TournamentPage />;
      case "achievements": return <AchievementsPage />;
      case "titles": return <TitlesPage />;
      case "stock_market": return <StockMarketPage />;
      case "real_estate": return <RealEstatePage />;
      case "businesses": return <BusinessesPage />;
      case "auction_house": return <AuctionHousePage />;
      case "insurance": return <InsurancePage />;
      case "loans": return <LoansPage />;
      case "legacy": return <LegacyPage />;
      case "underground": return <UndergroundEconomyPage />;
      case "gambling_dice": return <GamblingPage type="dice" title="Dice" icon="🎲" />;
      case "gambling_lotto": return <LottoPage />;
      case "gambling_blackjack": return <BlackjackPage />;
      case "gambling_coin": return <GamblingPage type="coin" title="Coin Toss" icon="🪙" />;
      case "gambling_horse": return <GamblingPage type="horse" title="Horse Racing" icon="🐴" />;
      case "gambling_number": return <GamblingPage type="number" title="Number Game" icon="🔢" />;
      case "messages": case "inbox": return <MessagesPage />;
      case "send_message": return <SendMessagePage />;
      case "notifications_page": return <NotificationsPage />;
      case "forum_general": case "forum_sales": case "forum_offtopic": case "forum_shadows": return <ForumPage forum={activePage.replace("forum_", "")} />;
      case "forum_search": return <ForumSearchPage />;
      case "city_overview": return <CityOverviewPage />;
      case "statistics": return <StatisticsPage />;
      case "faq": return <FAQPage />;
      case "support": return <SupportPage />;
      case "death_match": return <DeathMatchPage />;
      case "season_rankings": return <SeasonRankingsPage />;
      case "combat_log": return <CombatLogPage />;
      case "fighting_styles": return <FightingStylesPage />;
      case "armor": return <ArmorPage />;
      case "gambling_dens": return <GamblingDenPage />;
      case "roulette": return <RoulettePage />;
      case "slots": return <SlotsPage />;
      case "russian_roulette": return <RussianRoulettePage />;
      case "dog_fighting": return <DogFightPage />;
      case "street_racing": return <StreetRacingPage />;
      case "gifting": return <GiftingPage />;
      case "hit_list": return <HitListPage />;
      case "black_market": return <BlackMarketPage />;
      case "crime_fame": return <CrimeFamePage />;
      case "skill_tree": return <SkillTreePage />;
      case "daily_challenges": return <DailyChallengesPage />;
      case "colosseum": return <ColosseumPage />;
      case "safe_houses": return <SafeHousesPage />;
      case "crime_spree": return <CrimeSpreePage />;
      case "wanted_board": return <WantedBoardPage />;
      case "smuggling_routes": return <SmugglingRoutesPage />;
      case "cartel": return <CartelPage />;
      case "reputation": return <ReputationPage />;
      case "daily_login": return <DailyLoginPage />;
      case "crew_system": return <CrewSystemPage />;
      case "ranked_pvp": return <RankedPvpPage />;
      case "my_profile": return <MyProfilePage />;
      case "season_pass": return <SeasonPassPage />;
      case "updates": return <UpdatesPage />;
      case "admin_panel": return <AdminPanel />;
      case "online_list": return <OnlineList />;
      case "become_admin": return <BecomeAdminPage />;
      case "fight_club": return <SparPage />;
      case "crime_car": return <CrimePage type="car_theft" />;
      case "crime_burglarize": return <CrimePage type="burglarize" />;
      case "crime_rob": return <CrimePage type="rob_player" />;
      case "daily_raid": return <CrimePage type="daily_raid" />;
      
      case "steal_from_house": return <StealFromHousePage />;
      case "events": return <EventsList />;
      case "gta_car_theft": return <GtaCarTheftPage />;
      case "bodyguards": return <BodyguardsPage />;
      case "secret_challenges": return <SecretChallengesPage />;
      case "boosts": return <BoostsPage />;
      case "enhanced_admin": return <EnhancedAdminPage />;
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

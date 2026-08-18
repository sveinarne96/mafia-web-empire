import { useState, useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Building2,
  Landmark,
  Trophy,
  Car,
  Home,
  Users,
  Swords,
  Wrench,
  Package,
  Lock,
  Plane,
  Group,
  Target,
  Calendar,
  Shield,
  UserMinus,
  Dice1,
  Ticket,
  Wallet,
  Coins,
  LandmarkIcon,
  Hash,
  Send,
  Inbox,
  Bell,
  MessageSquare,
  Search,
  BarChart3,
  HelpCircle,
  MapPin,
  Heart,
  SwordsIcon,
  Dices,
  Banknote,
  TrophyIcon,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type GamePage =
  | "headquarters"
  | "bank"
  | "points"
  | "crime_car"
  | "crime_burglarize"
  | "crime_rob"
  | "fight_club"
  | "garage"
  | "items"
  | "prison"
  | "airport"
  | "organized_crime"
  | "missions"
  | "daily_raid"
  | "company"
  | "family"
  | "kill"
  | "gambling_dice"
  | "gambling_lotto"
  | "gambling_blackjack"
  | "gambling_coin"
  | "gambling_horse"
  | "gambling_number"
  | "messages"
  | "inbox"
  | "notifications_page"
  | "forum_general"
  | "forum_sales"
  | "forum_offtopic"
  | "forum_shadows"
  | "forum_search"
  | "city_overview"
  | "statistics"
  | "support"
  | "send_message";

// Sidebar menu structure
const leftMenuSections = [
  {
    title: "Headquarters",
    icon: Building2,
    page: "headquarters" as GamePage,
  },
  { title: "Bank", icon: Landmark, page: "bank" as GamePage },
  { title: "Points", icon: Trophy, page: "points" as GamePage },
  {
    title: "Crime",
    icon: AlertTriangle,
    children: [
      { title: "Car Theft", icon: Car, page: "crime_car" as GamePage },
      {
        title: "Burglarize Houses",
        icon: Home,
        page: "crime_burglarize" as GamePage,
      },
      { title: "Rob Player", icon: UserMinus, page: "crime_rob" as GamePage },
    ],
  },
  { title: "Fight Club", icon: Swords, page: "fight_club" as GamePage },
  { title: "Garage", icon: Wrench, page: "garage" as GamePage },
  { title: "My Items", icon: Package, page: "items" as GamePage },
  { title: "Prison", icon: Lock, page: "prison" as GamePage },
  { title: "Airport", icon: Plane, page: "airport" as GamePage },
  {
    title: "Organized Crime",
    icon: Group,
    page: "organized_crime" as GamePage,
  },
  { title: "Missions", icon: Target, page: "missions" as GamePage },
  { title: "Daily Raid", icon: Calendar, page: "daily_raid" as GamePage },
  { title: "Company", icon: Shield, page: "company" as GamePage },
  { title: "Family", icon: Users, page: "family" as GamePage },
  { title: "Kill", icon: UserMinus, page: "kill" as GamePage },
  {
    title: "Gambling",
    icon: Dices,
    children: [
      { title: "Dice", icon: Dice1, page: "gambling_dice" as GamePage },
      { title: "Lotto", icon: Ticket, page: "gambling_lotto" as GamePage },
      {
        title: "Blackjack",
        icon: Wallet,
        page: "gambling_blackjack" as GamePage,
      },
      {
        title: "Coin Toss",
        icon: Coins,
        page: "gambling_coin" as GamePage,
      },
      {
        title: "Horse Racing",
        icon: LandmarkIcon,
        page: "gambling_horse" as GamePage,
      },
      {
        title: "Number Game",
        icon: Hash,
        page: "gambling_number" as GamePage,
      },
    ],
  },
];

const rightMenuSections = [
  { title: "Messages", icon: MessageSquare, page: "messages" as GamePage },
  { title: "Inbox", icon: Inbox, page: "inbox" as GamePage },
  {
    title: "Notifications",
    icon: Bell,
    page: "notifications_page" as GamePage,
  },
  {
    title: "Forums",
    icon: MessageSquare,
    children: [
      {
        title: "General",
        icon: MessageSquare,
        page: "forum_general" as GamePage,
      },
      {
        title: "Sales & Wanted",
        icon: Banknote,
        page: "forum_sales" as GamePage,
      },
      {
        title: "Off-Topic",
        icon: MessageSquare,
        page: "forum_offtopic" as GamePage,
      },
      {
        title: "Shadows",
        icon: MessageSquare,
        page: "forum_shadows" as GamePage,
      },
      {
        title: "Search Posts",
        icon: Search,
        page: "forum_search" as GamePage,
      },
    ],
  },
  {
    title: "City Overview",
    icon: MapPin,
    page: "city_overview" as GamePage,
  },
  { title: "Statistics", icon: BarChart3, page: "statistics" as GamePage },
  { title: "Support", icon: HelpCircle, page: "support" as GamePage },
];

function LeftSidebar({
  activePage,
  setPage,
}: {
  activePage: GamePage;
  setPage: (p: GamePage) => void;
}) {
  const [expanded, setExpanded] = useState<string[]>(["Crime", "Gambling"]);

  const toggleSection = (title: string) => {
    setExpanded((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title],
    );
  };

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="p-3 border-b border-sidebar-border flex items-center gap-2">
        <Crown className="size-5 text-sidebar-primary" />
        <span className="font-bold text-sm">ShadowEmpire</span>
      </div>
      <nav className="flex-1 py-2">
        {leftMenuSections.map((section) => {
          if (section.children) {
            const isExpanded = expanded.includes(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                >
                  <section.icon className="size-3.5" />
                  {section.title}
                  <ChevronDown
                    className={`size-3 ml-auto transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {section.children.map((child) => (
                        <button
                          key={child.page}
                          onClick={() => setPage(child.page)}
                          className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs transition-colors mafia-sidebar-item ${
                            activePage === child.page
                              ? "active"
                              : "text-sidebar-foreground/70"
                          }`}
                        >
                          <child.icon className="size-3.5" />
                          {child.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return (
            <button
              key={section.page}
              onClick={() => setPage(section.page)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors mafia-sidebar-item ${
                activePage === section.page
                  ? "active"
                  : "text-sidebar-foreground/70"
              }`}
            >
              <section.icon className="size-4" />
              {section.title}
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

  const toggleRight = (title: string) => {
    setExpandedRight((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title],
    );
  };

  return (
    <aside className="w-52 bg-sidebar border-l border-sidebar-border flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Player Stats */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
          Your Status
        </div>
        {player ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="size-4 text-sidebar-primary" />
              <span className="text-sm font-bold truncate">
                {player.nickname ?? "Unknown"}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-sidebar-foreground/60 mb-0.5">
                <span>Life</span>
                <span>
                  {player.life ?? 0}/{player.maxLife ?? 100}
                </span>
              </div>
              <div className="stat-bar stat-bar-life">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="text-sidebar-foreground/50">
                💰 ${(player.money ?? 0).toLocaleString()}
              </div>
              <div className="text-sidebar-foreground/50">
                🏦 ${(player.bank ?? 0).toLocaleString()}
              </div>
              <div className="text-sidebar-foreground/50">
                ⚔️ ATK {player.attack ?? 0}
              </div>
              <div className="text-sidebar-foreground/50">
                🛡️ DEF {player.defense ?? 0}
              </div>
              <div className="text-sidebar-foreground/50">
                ⭐ Lv.{player.level ?? 1}
              </div>
              <div className="text-sidebar-foreground/50">
                📍 {player.location}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-sidebar-foreground/40">Loading...</div>
        )}
      </div>

      {/* Right Menu Links */}
      <div className="flex-1 py-2">
        {rightMenuSections.map((section) => {
          if (section.children) {
            const isExpanded = expandedRight.includes(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleRight(section.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
                >
                  <section.icon className="size-3.5" />
                  {section.title}
                  <ChevronDown
                    className={`size-3 ml-auto transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {section.children.map((child) => (
                        <button
                          key={child.page}
                          onClick={() => setPage(child.page)}
                          className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors"
                        >
                          <child.icon className="size-3.5" />
                          {child.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return (
            <button
              key={section.page}
              onClick={() => setPage(section.page)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors"
            >
              <section.icon className="size-4" />
              {section.title}
              {section.page === "inbox" && unreadCount && unreadCount > 0 ? (
                <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ===== GAME PAGE COMPONENTS =====

function HeadquartersPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Building2 className="size-6 text-primary" /> Headquarters
      </h2>
      <div className="mafia-card rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="Level" value={`Lv.${player.level ?? 1}`} />
          <StatBox label="Money" value={`$${(player.money ?? 0).toLocaleString()}`} />
          <StatBox
            label="Bank"
            value={`$${(player.bank ?? 0).toLocaleString()}`}
          />
          <StatBox label="Points" value={(player.points ?? 0).toString()} />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Life</span>
              <span>
                {player.life ?? 0}/{player.maxLife ?? 100}
              </span>
            </div>
            <div className="stat-bar stat-bar-life">
              <div
                className="stat-bar-fill"
                style={{ width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%` }}
              />
            </div>
          </div>        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
          <div>
            <SwordsIcon className="size-5 mx-auto mb-1 text-primary" />
            <div className="font-bold text-foreground">
              {player.totalFights ?? 0}
            </div>
            Fights
          </div>
          <div>
            <UserMinus className="size-5 mx-auto mb-1 text-destructive" />
            <div className="font-bold text-foreground">{player.totalKills ?? 0}</div>
            Kills
          </div>
          <div>
            <Target className="size-5 mx-auto mb-1 text-chart-2" />
            <div className="font-bold text-foreground">
              {player.totalCrimes ?? 0}
            </div>
            Crimes
          </div>
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

  const handleDeposit = async () => {
    try {
      await deposit({ amount });
      setMsg(`Deposited $${amount.toLocaleString()}`);
      setAmount(0);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw({ amount });
      setMsg(`Withdrew $${amount.toLocaleString()}`);
      setAmount(0);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Landmark className="size-6 text-primary" /> Bank
      </h2>
      <div className="mafia-card rounded-xl p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Cash
            </div>
            <div className="text-2xl font-bold text-primary mt-1">
              ${(player.money ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Bank Balance
            </div>
            <div className="text-2xl font-bold mt-1">
              ${(player.bank ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              Amount
            </label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              placeholder="Enter amount..."
            />
          </div>
          <button
            onClick={handleDeposit}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-md border border-border hover:bg-accent transition-colors"
          >
            Withdraw
          </button>
        </div>
        {msg && (
          <div className="mt-3 text-sm text-primary animate-fade-in">
            ✓ {msg}
          </div>
        )}
      </div>
    </div>
  );
}

function CrimePage({ type }: { type: string }) {
  const commitCrime = useMutation(api.game.commitCrime);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const titles: Record<string, string> = {
    car_theft: "🚗 Car Theft",
    burglarize: "🏠 Burglarize Houses",
    rob_player: "🔫 Rob Player",
  };

  const descriptions: Record<string, string> = {
    car_theft:
      "Steal a car from the streets. Risk: getting caught or injured. Reward: cold hard cash.",
    burglarize:
      "Break into a house and loot valuables. Risk: homeowner might fight back.",
    rob_player:
      "Rob another player. Higher risk, higher reward. They might fight back.",
  };

  const handleCrime = async () => {
    setLoading(true);
    try {
      const res = await commitCrime({
        type: type as "car_theft" | "burglarize" | "rob_player",
      });
      setResult(res as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Error" });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        {titles[type] ?? type}
      </h2>
      <p className="text-muted-foreground text-sm">{descriptions[type]}</p>
      <div className="mafia-card rounded-xl p-6">
        <button
          onClick={handleCrime}
          disabled={loading}
          className="w-full py-4 bg-destructive text-white font-bold text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Committing crime..." : "Commit Crime"}
        </button>
        {result && !result.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-background/50 rounded-lg text-sm space-y-2"
          >
            <div
              className={`font-bold text-lg ${result.success ? "text-primary" : "text-destructive"}`}
            >
              {result.success ? "SUCCESS!" : "FAILED!"}
            </div>
            {result.moneyEarned ? (
              <div className="text-primary">
                💰 Earned ${(result.moneyEarned as number).toLocaleString()}
              </div>
            ) : null}
            {result.damageTaken ? (
              <div className="text-destructive">
                ❤️ Lost {result.damageTaken as number} life
              </div>
            ) : null}
            {result.arrested ? (
              <div className="text-destructive font-bold">
                🔒 You were arrested!
              </div>
            ) : null}
          </motion.div>
        )}
        {result?.error ? (
          <div className="mt-4 text-destructive text-sm">
            {String(result.error)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GamblingPage({
  type,
  title,
  icon,
}: {
  type: string;
  title: string;
  icon: string;
}) {
  const diceRoll = useMutation(api.game.gambleDice);
  const coinToss = useMutation(api.game.gambleCoinToss);
  const player = useQuery(api.game.getPlayer);

  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleDiceGuess = async (guess: "high" | "low" | "seven") => {
    try {
      const res = await diceRoll({ amount: bet, guess });
      setResult(res as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Error" });
    }
  };

  const handleCoinToss = async (guess: "heads" | "tails") => {
    try {
      const res = await coinToss({ amount: bet, guess });
      setResult(res as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      setResult({ error: e instanceof Error ? e.message : "Error" });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        {icon} {title}
      </h2>
      {player && (
        <div className="text-sm text-muted-foreground">
          Balance:{" "}
          <span className="text-primary font-bold">
            ${(player.money ?? 0).toLocaleString()}
          </span>
        </div>
      )}
      <div className="mafia-card rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Bet Amount
          </label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {type === "dice" && (
          <div className="flex gap-3">
            <button
              onClick={() => handleDiceGuess("low")}
              className="flex-1 py-3 bg-chart-2 text-white font-bold rounded-lg hover:opacity-90"
            >
              Low (2-6)
            </button>
            <button
              onClick={() => handleDiceGuess("seven")}
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90"
            >
              Seven (x5)
            </button>
            <button
              onClick={() => handleDiceGuess("high")}
              className="flex-1 py-3 bg-chart-3 text-white font-bold rounded-lg hover:opacity-90"
            >
              High (8-12)
            </button>
          </div>
        )}

        {type === "coin" && (
          <div className="flex gap-3">
            <button
              onClick={() => handleCoinToss("heads")}
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90"
            >
              Heads
            </button>
            <button
              onClick={() => handleCoinToss("tails")}
              className="flex-1 py-3 bg-secondary text-secondary-foreground font-bold rounded-lg border border-border hover:bg-accent"
            >
              Tails
            </button>
          </div>
        )}

        {type === "horse" && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() =>
                  setResult({
                    horse: n,
                    won: Math.random() > 0.7,
                    message: `Horse #${n} ${
                      Math.random() > 0.7 ? "WON!" : "lost."
                    }`,
                  })
                }
                className="w-full py-2 bg-secondary text-secondary-foreground text-sm rounded-lg border border-border hover:bg-accent"
              >
                🐴 Horse #{n}
              </button>
            ))}
          </div>
        )}

        {type === "number" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Pick a number 1-10. Win x10 your bet!
            </p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setResult({
                      number: n,
                      won: Math.random() > 0.9,
                      message: `Number ${n} ${
                        Math.random() > 0.9 ? "WON!" : "lost."
                      }`,
                    })
                  }
                  className="py-2 bg-secondary text-secondary-foreground text-sm rounded-lg border border-border hover:bg-accent font-bold"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-background/50 rounded-lg text-sm"
          >
            {result.error ? (
              <div className="text-destructive">{result.error as string}</div>
            ) : (
              <div className="space-y-1">
                {result.die1 ? (
                  <>
                    <div className="text-lg font-bold">
                      🎲 {(result.die1 as number)} + {(result.die2 as number)}{" "}
                      = {(result.total as number)}
                    </div>
                    <div
                      className={
                        result.won ? "text-primary font-bold" : "text-destructive"
                      }
                    >
                      {result.won
                        ? `You WON $${(result.winnings as number).toLocaleString()}!`
                        : "You lost!"}
                    </div>
                  </>
                ) : result.result ? (
                  <>
                    <div className="text-lg font-bold capitalize">
                      {result.result as string}
                    </div>
                    <div
                      className={
                        result.won ? "text-primary font-bold" : "text-destructive"
                      }
                    >
                      {result.won ? "You WON!" : "You lost!"}
                    </div>
                  </>
                ) : (
                  <div className="text-sm">{result.message as string}</div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FamilyPage() {
  const family = useQuery(api.game.getFamily);
  const members = useQuery(api.game.getFamilyMembers);
  const createFamily = useMutation(api.game.createFamily);
  const player = useQuery(api.game.getPlayer);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [desc, setDesc] = useState("");

  if (!player) return <LoadingPage />;

  if (family) {
    return (
      <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="size-6 text-primary" /> {family.name}
        </h2>
        <div className="mafia-card rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox label="Tag" value={family.tag} />
            <StatBox label="Level" value={`Lv.${family.level}`} />
            <StatBox label="Members" value={`${family.memberCount}/${family.maxMembers}`} />
            <StatBox label="Treasury" value={`$${(family.treasury ?? 0).toLocaleString()}`} />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{family.description}</p>
          <h3 className="font-bold text-sm mb-2">Members</h3>
          <div className="space-y-2">
            {members?.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-2 bg-background/50 rounded text-sm"
              >
                <span className="font-medium">{m.nickname ?? "Unknown"}</span>
                <span className="text-muted-foreground">Lv.{m.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="size-6 text-primary" /> Family
      </h2>
      <div className="mafia-card rounded-xl p-6">
        <p className="text-sm text-muted-foreground mb-4">
          You are not in a family. Create one for $50,000.
        </p>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Family name"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tag (e.g. [MOB])"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description..."
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
          />
          <button
            onClick={() => {
              if (name && tag) createFamily({ name, tag, description: desc });
            }}
            disabled={player.money < 50000}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            Create Family ($50,000)
          </button>
        </div>
      </div>
    </div>
  );
}

function MessagesPage() {
  const messages = useQuery(api.game.getMessages);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Inbox className="size-6 text-primary" /> Inbox
      </h2>
      <div className="space-y-2">
        {messages && messages.length === 0 && (
          <div className="mafia-card rounded-xl p-8 text-center text-muted-foreground">
            No messages
          </div>
        )}
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`mafia-card rounded-lg p-4 ${!msg.read ? "border-l-2 border-l-primary" : ""}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">{msg.subject}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(msg.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{msg.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatisticsPage() {
  const stats = useQuery(api.game.getStats);
  if (!stats) return <LoadingPage />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="size-6 text-primary" /> Statistics
      </h2>
      <div className="mafia-card rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="Players" value={stats.totalPlayers.toString()} />
          <StatBox label="Crimes" value={stats.totalCrimes.toString()} />
          <StatBox label="Fights" value={stats.totalFights.toString()} />
          <StatBox label="Families" value={stats.totalFamilies.toString()} />
        </div>
        <h3 className="font-bold text-sm mb-3">Top Players</h3>
        <div className="space-y-2">
          {stats.topPlayers.map((p, i) => (
            <div
              key={p.nickname}
              className="flex items-center gap-3 p-2 bg-background/50 rounded text-sm"
            >
              <span className="font-bold text-primary w-6">
                #{i + 1}
              </span>
              <span className="flex-1">{p.nickname}</span>
              <span className="text-muted-foreground">Lv.{p.level}</span>
              <span className="text-destructive">{p.kills} kills</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericPage({
  title,
  icon,
  description,
}: {
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold">{icon} {title}</h2>
      <div className="mafia-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="text-sm text-muted-foreground/50">
          This section is under construction. Check back soon!
        </div>
      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-background/50 rounded-lg">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
    </div>
  );
}

function SendMessagePage() {
  const sendMessage = useMutation(api.game.sendMessage);
  const searchUsers = useQuery(api.game.searchUsers, { query: "" });
  const [receiverId, setReceiverId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  const handleSend = async () => {
    if (!receiverId || !subject || !body) return;
    try {
      await sendMessage({ receiverId: receiverId as unknown as never, subject, body });
      setMsg("Message sent!");
      setSubject("");
      setBody("");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error sending message");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Send className="size-6 text-primary" /> Send Message
      </h2>
      <div className="mafia-card rounded-xl p-6 space-y-3">
        <input
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          placeholder="Player ID"
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message..."
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[120px]"
        />
        <button
          onClick={handleSend}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90"
        >
          Send
        </button>
        {msg && <div className="text-sm text-primary animate-fade-in">✓ {msg}</div>}
      </div>
    </div>
  );
}

function ForumPage({ forum }: { forum: string }) {
  const posts = useQuery(api.game.getForumPosts, { forum });
  const createPost = useMutation(api.game.createForumPost);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    if (!title || !body) return;
    try {
      await createPost({ forum, title, body });
      setTitle("");
      setBody("");
      setShowForm(false);
    } catch {
      // ignore
    }
  };

  const forumNames: Record<string, string> = {
    general: "General Forum",
    sales: "Sales & Wanted",
    offtopic: "Off-Topic",
    shadows: "Shadows Forum",
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{forumNames[forum] ?? forum}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90"
        >
          {showForm ? "Cancel" : "New Post"}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mafia-card rounded-xl p-4 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Post content..."
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90"
          >
            Post
          </button>
        </motion.div>
      )}

      <div className="space-y-2">
        {posts && posts.length === 0 && (
          <div className="mafia-card rounded-xl p-8 text-center text-muted-foreground">
            No posts yet. Be the first to post!
          </div>
        )}
        {posts?.map((post) => (
          <div key={post._id} className="mafia-card rounded-lg p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">{post.title}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(post.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {post.body}
            </p>
            <div className="mt-2 text-[10px] text-muted-foreground/60">
              {post.replies} replies
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== MAIN DASHBOARD =====

type PlayerClass = "hitter" | "thief" | "enforcer" | "hustler";

const classInfo: Record<PlayerClass, { name: string; icon: string; desc: string; attack: number; defense: number; life: number; money: number }> = {
  hitter:    { name: "Hitter",    icon: "🥊", desc: "Brutal enforcer. High attack power but lower survivability. For players who like to deal damage.",     attack: 18, defense: 6,  life: 80,  money: 800 },
  thief:     { name: "Thief",     icon: "🕵️", desc: "Stealthy and fast. Balanced stats with extra starting cash.",                           attack: 10, defense: 8,  life: 90,  money: 1500 },
  enforcer:  { name: "Enforcer",  icon: "🛡️", desc: "Tough as nails. High defense and life, built to absorb punishment and keep going.",              attack: 12, defense: 16, life: 120, money: 700 },
  hustler:   { name: "Hustler",   icon: "💰", desc: "Street-smart con artist. Starts with the most cash but lower combat stats.",                  attack: 8,  defense: 10, life: 90,  money: 2500 },
};

function PlayerRegistration({ onRegistered }: { onRegistered: () => void }) {
  const registerPlayer = useMutation(api.game.registerPlayer);
  const [nickname, setNickname] = useState("");
  const [selectedClass, setSelectedClass] = useState<PlayerClass | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // Debounced nickname check
  useEffect(() => {
    if (nickname.length < 3) { setNicknameCheck("idle"); return; }
    setNicknameCheck("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await fetch("/api/check-nickname", { method: "POST", body: JSON.stringify({ nickname }) }).catch(() => null);
        // Fallback: just proceed
        setNicknameCheck("available");
      } catch {
        setNicknameCheck("available");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [nickname]);

  const handleRegister = async () => {
    if (!nickname || nickname.length < 3) { setError("Nickname must be at least 3 characters."); return; }
    if (!selectedClass) { setError("Choose a class."); return; }
    setError("");
    setLoading(true);
    try {
      await registerPlayer({ nickname, playerClass: selectedClass });
      onRegistered();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    }
    setLoading(false);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Crown className="size-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Choose Your Identity</h1>
            <p className="text-muted-foreground text-sm">Pick a nickname that will define your reputation in the underworld. This cannot be changed later.</p>
          </div>
          <div className="mafia-card rounded-xl p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Nickname</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your street name..."
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                maxLength={20}
                autoFocus
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">3-20 characters</span>
                {nickname.length >= 3 && (
                  <span className={`text-[10px] ${nicknameCheck === "taken" ? "text-destructive" : "text-primary"}`}>
                    {nicknameCheck === "checking" ? "Checking..." : nicknameCheck === "taken" ? "✗ Taken" : "✓ Available"}
                  </span>
                )}
              </div>
            </div>
            {error && <div className="text-destructive text-sm animate-fade-in">{error}</div>}
            <button
              onClick={() => {
                if (nickname.length >= 3) { setStep(2); setError(""); }
              }}
              disabled={nickname.length < 3}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Choose Class →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">Welcome, <span className="text-primary">{nickname}</span></h1>
          <p className="text-muted-foreground text-sm">Choose your class. This determines your starting stats and playstyle.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(classInfo).map(([key, cls]) => {
            const pc = key as PlayerClass;
            const isSelected = selectedClass === pc;
            return (
              <motion.button
                key={pc}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedClass(pc)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 mafia-glow"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="text-3xl mb-2">{cls.icon}</div>
                <div className="font-bold text-lg mb-1">{cls.name}</div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cls.desc}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ATK</span>
                    <span className="font-bold">⚔️ {cls.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DEF</span>
                    <span className="font-bold">🛡️ {cls.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Life</span>
                    <span className="font-bold">❤️ {cls.life}</span>
                  </div>
                  <div className="flex justify-between">
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Starting Cash</span>
                    <span className="font-bold text-primary">${cls.money.toLocaleString()}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-6 space-y-3">
          {error && <div className="text-destructive text-sm text-center animate-fade-in">{error}</div>}
          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setError(""); }}
              className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-accent transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleRegister}
              disabled={!selectedClass || loading}
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {loading ? "Entering the underworld..." : "Enter the Streets"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const { signOut } = useAuth();
  const [activePage, setActivePage] = useState<GamePage>("headquarters");
  const setPage = useCallback((p: GamePage) => setActivePage(p), []);
  const player = useQuery(api.game.getPlayer);
  const [registered, setRegistered] = useState(false);

  // Check if player has a nickname (is registered)
  const isRegistered = player?.nickname && player?.registeredAt;

  // Show loading while player data loads
  if (player === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show registration if not registered
  if (!isRegistered) {
    return <PlayerRegistration onRegistered={() => setRegistered(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "headquarters":
        return <HeadquartersPage />;
      case "bank":
        return <BankPage />;
      case "points":
        return (
          <GenericPage
            title="Points"
            icon="🏆"
            description="Earn points by committing crimes, fighting, and completing missions. Use points in the shop for exclusive items."
          />
        );
      case "crime_car":
      case "crime_burglarize":
      case "crime_rob": {
        const typeMap: Record<string, string> = {
          crime_car: "car_theft",
          crime_burglarize: "burglarize",
          crime_rob: "rob_player",
        };
        return <CrimePage type={typeMap[activePage]} />;
      }
      case "fight_club":
        return (
          <GenericPage
            title="Fight Club"
            icon="⚔️"
            description="Challenge other players to one-on-one fights. Bet money, deal damage, and prove who's the toughest."
          />
        );
      case "garage":
        return (
          <GenericPage
            title="Garage"
            icon="🚗"
            description="Store and manage your vehicles. Armored cars, getaway vehicles, and more."
          />
        );
      case "items":
        return (
          <GenericPage
            title="My Items"
            icon="📦"
            description="View your inventory. Equip weapons and armor to boost your stats."
          />
        );
      case "prison":
        return (
          <GenericPage
            title="Prison"
            icon="🔒"
            description="You're behind bars. Serve your time, or try to escape. Bribe guards for early release."
          />
        );
      case "airport":
        return (
          <GenericPage
            title="Airport"
            icon="✈️"
            description="Travel to different cities. Each city has unique opportunities and dangers."
          />
        );
      case "organized_crime":
        return (
          <GenericPage
            title="Organized Crime"
            icon="👥"
            description="Family-only operations. Bank heists, drug runs, and major scores that require teamwork."
          />
        );
      case "missions":
        return (
          <GenericPage
            title="Missions"
            icon="🎯"
            description="Complete daily and story missions for rewards and experience. New missions every day."
          />
        );
      case "daily_raid":
        return (
          <GenericPage
            title="Daily Raid"
            icon="📅"
            description="Raid another player's stash once per day. Steal their money and deal damage."
          />
        );
      case "company":
        return (
          <GenericPage
            title="Company"
            icon="🛡️"
            description="Run a legitimate front business. Earn passive income and launder dirty money."
          />
        );
      case "family":
        return <FamilyPage />;
      case "kill":
        return (
          <GenericPage
            title="Kill"
            icon="💀"
            description="Target another player for elimination. High stakes. Permadeath risk."
          />
        );
      case "gambling_dice":
        return <GamblingPage type="dice" title="Dice" icon="🎲" />;
      case "gambling_lotto":
        return (
          <GenericPage
            title="Lotto"
            icon="🎟️"
            description="Buy lottery tickets for a chance to win big. Drawings every 24 hours."
          />
        );
      case "gambling_blackjack":
        return (
          <GenericPage
            title="Blackjack"
            icon="🃏"
            description="Play blackjack against the house. Get closer to 21 without going over."
          />
        );
      case "gambling_coin":
        return <GamblingPage type="coin" title="Coin Toss" icon="🪙" />;
      case "gambling_horse":
        return (
          <GamblingPage type="horse" title="Horse Racing" icon="🐴" />
        );
      case "gambling_number":
        return (
          <GamblingPage type="number" title="Number Game" icon="🔢" />
        );
      case "messages":
      case "inbox":
        return <MessagesPage />;
      case "send_message":
        return <SendMessagePage />;
      case "notifications_page":
        return (
          <GenericPage
            title="Notifications"
            icon="🔔"
            description="All your alerts, updates, and system messages."
          />
        );
      case "forum_general":
        return <ForumPage forum="general" />;
      case "forum_sales":
        return <ForumPage forum="sales" />;
      case "forum_offtopic":
        return <ForumPage forum="offtopic" />;
      case "forum_shadows":
        return <ForumPage forum="shadows" />;
      case "forum_search":
        return (
          <GenericPage
            title="Search Posts"
            icon="🔍"
            description="Search across all forums for specific topics and players."
          />
        );
      case "city_overview":
        return (
          <GenericPage
            title="City Overview"
            icon="📍"
            description="View all activity in your current city. See who's online and what's happening."
          />
        );
      case "statistics":
        return <StatisticsPage />;
      case "support":
        return (
          <GenericPage
            title="Support"
            icon="❓"
            description="Need help? Contact support or check the FAQ. Report bugs and suggest features."
          />
        );
      default:
        return <HeadquartersPage />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <LeftSidebar activePage={activePage} setPage={setPage} />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/50 shrink-0">
          <div className="text-sm font-semibold">{activePage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="size-3.5" /> Sign Out
          </button>
        </header>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {renderPage()}
        </div>
      </main>
      <RightPanel setPage={setPage} />
    </div>
  );
}

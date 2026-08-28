import { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Zap, Trophy, Skull, Moon, Star, Swords, Shield, MapPin, Bomb, Crown, Sparkles, TrendingUp, Eye, Crosshair, Heart, Gem, Target, Truck, CloudLightning, Dog, Timer, Coins, Popcorn, Ghost, Search, SkullIcon, MousePointerClick, Flame, Repeat } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// EVENT DATA — ALL EVENTS WITH REAL DATES
// ═══════════════════════════════════════════════════════════════════

interface GameEvent {
  name: string;
  icon: string;
  category: string;
  description: string;
  type: "fixed" | "recurring_weekly" | "recurring_daily" | "full_moon" | "random_weekend" | "random_daily" | "random_gambling" | "random_special";
  startMonth?: number; // 1-12
  startDay?: number;
  endMonth?: number;
  endDay?: number;
  dayOfWeek?: number; // 0=Sun, 1=Mon, etc
  bonuses?: string;
  color: string;
}

const ALL_EVENTS: GameEvent[] = [
  // ═══ FIXED DATE EVENTS ═══
  { name: "Purge Night", icon: "💀", category: "Server Events", description: "All crimes double XP. Police reduced by 50%. No rules for 72 hours.", type: "fixed", startMonth: 1, startDay: 2, endMonth: 1, endDay: 6, bonuses: "2x Crime XP • Reduced Police", color: "red" },
  { name: "Robber's Moon", icon: "🌙", category: "Server Events", description: "Perfect night for heists. All robbery rewards doubled. Stealth boosted.", type: "fixed", startMonth: 1, startDay: 10, endMonth: 1, endDay: 12, bonuses: "2x Heist Rewards • Stealth +25%", color: "blue" },
  { name: "Grand Heist", icon: "🏦", category: "Server Events", description: "Bank robbery payouts tripled. New vaults unlocked. Elite guards deployed.", type: "fixed", startMonth: 1, startDay: 20, endMonth: 1, endDay: 24, bonuses: "3x Bank Robbery • New Vaults", color: "amber" },
  { name: "Family War Week", icon: "⚔️", category: "Server Events", description: "All-out faction warfare. Territory controls worth 3x. Crew wars earn massive points.", type: "fixed", startMonth: 2, startDay: 10, endMonth: 2, endDay: 20, bonuses: "3x Territory • Crew War Points", color: "red" },
  { name: "Underground Championship", icon: "💣", category: "Server Events", description: "Underground fight tournament. Entry fee required. Huge prize pools.", type: "fixed", startMonth: 2, startDay: 21, endMonth: 2, endDay: 25, bonuses: "Fight Tournament • Prize Pools", color: "orange" },
  { name: "Blood Moon", icon: "🌑", category: "Server Events", description: "Kills reward 5x XP. Stealth kills silent. Bounties doubled.", type: "fixed", startMonth: 3, startDay: 1, endMonth: 3, endDay: 5, bonuses: "5x Kill XP • Bounties 2x", color: "red" },
  { name: "Spring Break Crime", icon: "🌸", category: "Seasonal Events", description: "Tourists flood the city. Pickpocketing, car theft, and fraud all boosted.", type: "fixed", startMonth: 3, startDay: 2, endMonth: 3, endDay: 13, bonuses: "Tourist Crime Boost • 2x Pickpocket", color: "pink" },
  { name: "St. Patrick's Gold", icon: "☘️", category: "Seasonal Events", description: "Gold rush! Lucky gambling. Increased cash drops. Leprechaun loot boxes.", type: "fixed", startMonth: 3, startDay: 17, endMonth: 3, endDay: 17, bonuses: "Lucky Gambling • Gold Loot", color: "green" },
  { name: "Easter Egg Hunt", icon: "🥚", category: "Seasonal Events", description: "Hidden eggs across the city. Collect for rare items. Double crafting rewards.", type: "fixed", startMonth: 3, startDay: 28, endMonth: 4, endDay: 6, bonuses: "Hidden Eggs • 2x Crafting", color: "pink" },
  { name: "Cyber Monday", icon: "💻", category: "Seasonal Events", description: "Black market deals everywhere. 50% off all digital goods. Tech crime boosted.", type: "fixed", startMonth: 5, startDay: 2, endMonth: 5, endDay: 6, bonuses: "50% Market Deals • Tech Crime", color: "cyan" },
  { name: "Tax Season Scam", icon: "📋", category: "Seasonal Events", description: "Fraud and money laundering profits tripled. Audit risk increased.", type: "fixed", startMonth: 5, startDay: 8, endMonth: 5, endDay: 10, bonuses: "3x Fraud Income • Higher Audit Risk", color: "yellow" },
  { name: "Summer Crime Wave", icon: "☀️", category: "Seasonal Events", description: "Heat brings chaos. All crimes +25% rewards. Police overtime reduced.", type: "fixed", startMonth: 6, startDay: 21, endMonth: 6, endDay: 21, bonuses: "25% All Crime • Reduced Police", color: "amber" },
  { name: "Halloween Horror", icon: "🎃", category: "Seasonal Events", description: "Spooky crimes. Ghost mode free. Horror loot drops. Costume rewards.", type: "fixed", startMonth: 10, startDay: 31, endMonth: 10, endDay: 31, bonuses: "Free Ghost Mode • Horror Loot", color: "orange" },
  { name: "Winter Wonderland", icon: "❄️", category: "Seasonal Events", description: "Snow-covered streets. Stealth +30%. Vehicle theft harder. Holiday heists.", type: "fixed", startMonth: 11, startDay: 10, endMonth: 11, endDay: 15, bonuses: "Stealth +30% • Holiday Heists", color: "blue" },
  { name: "Black Friday Heist", icon: "🛒", category: "Seasonal Events", description: "Mall robberies tripled. Flash sale items on black market. Getaway vehicles free.", type: "fixed", startMonth: 11, startDay: 27, endMonth: 11, endDay: 27, bonuses: "3x Mall Robbery • Free Getaway", color: "red" },
  { name: "Black Friday Market", icon: "💰", category: "Seasonal Events", description: "Black Market prices slashed 40%. Rare items restocked. Bulk deals.", type: "fixed", startMonth: 11, startDay: 27, endMonth: 11, endDay: 27, bonuses: "40% Off Market • Rare Restock", color: "emerald" },
  { name: "Christmas Heist", icon: "🎄", category: "Seasonal Events", description: "Santa's loot is yours. Gift box raids. Toy store heists. Holiday cheer... or crime.", type: "fixed", startMonth: 12, startDay: 25, endMonth: 12, endDay: 25, bonuses: "Gift Box Raids • Holiday Loot", color: "red" },

  // ═══ RECURRING WEEKLY EVENTS ═══
  { name: "Tournament Championship", icon: "🏆", category: "Server Events", description: "Every Friday to Sunday — fight for glory. Top fighters earn exclusive titles.", type: "recurring_weekly", dayOfWeek: 5, bonuses: "Fight XP 3x • Title Rewards", color: "amber" },
  { name: "Territory Takeover", icon: "📍", category: "Server Events", description: "Every Wednesday — claim territories. 2x territory points. Control blocks.", type: "recurring_weekly", dayOfWeek: 3, bonuses: "2x Territory Points", color: "blue" },
  { name: "Crime Empire Week", icon: "👑", category: "Server Events", description: "Every Monday — crime empire earnings doubled. Business profits up.", type: "recurring_weekly", dayOfWeek: 1, bonuses: "2x Empire Earnings", color: "purple" },

  // ═══ FULL MOON EVENTS ═══
  { name: "Full Moon", icon: "🌕", category: "Server Events", description: "Every full moon (~29.5 days) — werewolf mode. All stealth doubled. Crime XP +50%.", type: "full_moon", bonuses: "2x Stealth • 50% Crime XP", color: "slate" },

  // ═══ WEEKEND BOOST EVENTS (Fri-Sun) ═══
  { name: "Double XP Weekend", icon: "⭐", category: "Weekend Boost", description: "Every weekend — all XP earned doubled across everything.", type: "random_weekend", bonuses: "2x All XP", color: "blue" },
  { name: "Triple XP Weekend", icon: "🌟", category: "Weekend Boost", description: "Every weekend — all XP earned tripled. Rare but massive.", type: "random_weekend", bonuses: "3x All XP", color: "purple" },
  { name: "50x XP Event", icon: "💥", category: "Weekend Boost", description: "Weekend random — insane 50x XP for 1 hour. Watch for the alert!", type: "random_weekend", bonuses: "50x XP (1 Hour)", color: "red" },
  { name: "Double Cash Weekend", icon: "💰", category: "Weekend Boost", description: "Every weekend — all cash earnings doubled.", type: "random_weekend", bonuses: "2x All Cash", color: "emerald" },
  { name: "Cash Rain", icon: "💵", category: "Weekend Boost", description: "Weekend bonus — cash drops from sky. Collect fast before they vanish.", type: "random_weekend", bonuses: "Free Cash Drops", color: "green" },
  { name: "Bank Holiday", icon: "🏦", category: "Weekend Boost", description: "Weekend bonus — bank interest rates tripled. Robberies pay extra.", type: "random_weekend", bonuses: "3x Bank Interest", color: "amber" },
  { name: "Triple Cash Event", icon: "💎", category: "Weekend Boost", description: "Weekend random — all cash earnings tripled. Extremely lucrative.", type: "random_weekend", bonuses: "3x All Cash", color: "yellow" },
  { name: "Server Jackpot", icon: "🎰", category: "Weekend Boost", description: "Weekend event — first player to find the hidden jackpot gets $10M.", type: "random_weekend", bonuses: "$10M Jackpot", color: "amber" },

  // ═══ RANDOM CRIME EVENTS ═══
  { name: "Heatwave", icon: "🔥", category: "Crime Events", description: "Crime rates surge. All crime XP +30%. Police stretched thin.", type: "random_daily", bonuses: "30% Crime XP • Less Police", color: "red" },
  { name: "Crime Frenzy", icon: "⚡", category: "Crime Events", description: "Massive crime wave. Every crime pays double for 2 hours.", type: "random_daily", bonuses: "2x Crime Rewards", color: "yellow" },
  { name: "Black Market Sale", icon: "🏷️", category: "Crime Events", description: "Flash sale — all black market items 30% off. Limited time.", type: "random_daily", bonuses: "30% Off Black Market", color: "gray" },
  { name: "Night Ops", icon: "🌑", category: "Crime Events", description: "Cover of darkness. Stealth crimes +40%. Reduce arrest chance.", type: "random_daily", bonuses: "40% Stealth • Less Arrest", color: "slate" },
  { name: "Lockdown", icon: "🔒", category: "Crime Events", description: "City on lockdown. Crime rewards +50% but arrest risk doubled.", type: "random_daily", bonuses: "50% Crime • 2x Arrest Risk", color: "red" },
  { name: "Thunderstorm", icon: "⛈️", category: "Crime Events", description: "Storm covers tracks. Escape chance +30%. Vehicle crimes boosted.", type: "random_daily", bonuses: "30% Escape • Vehicle Crime", color: "blue" },
  { name: "Diamond Rush", icon: "💎", category: "Crime Events", description: "Rare gems flood the market. Jewel heists pay 5x.", type: "random_daily", bonuses: "5x Jewel Heist", color: "cyan" },
  { name: "Manhunt", icon: "🔫", category: "Crime Events", description: "Wanted criminals get bounty boosts. Hunters earn extra.", type: "random_daily", bonuses: "2x Bounties • Hunter XP", color: "red" },
  { name: "Speed Demon", icon: "🏎️", category: "Crime Events", description: "Getaway vehicles 30% faster. Car theft rewards up.", type: "random_daily", bonuses: "30% Speed • Car Theft Boost", color: "orange" },
  { name: "Guard Dogs Gone", icon: "🐕", category: "Crime Events", description: "Security dogs loose. Burglary success rate +25%.", type: "random_daily", bonuses: "25% Burglary Success", color: "amber" },

  // ═══ GAMBLING EVENTS ═══
  { name: "Lucky Hour", icon: "🍀", category: "Gambling Events", description: "All gambling odds improved by 15%. Lucky streak active.", type: "random_gambling", bonuses: "+15% Win Rate", color: "green" },
  { name: "Gambling Marathon", icon: "🎰", category: "Gambling Events", description: "4-hour marathon. All bet limits doubled. Special high-roller tables.", type: "random_gambling", bonuses: "2x Bet Limits", color: "amber" },
  { name: "Jackpot Hour", icon: "💫", category: "Gambling Events", description: "1-hour window. Slot jackpots 5x more likely. Roulette pays extra.", type: "random_gambling", bonuses: "5x Jackpot Chance", color: "yellow" },
  { name: "Traveling Circus", icon: "🎪", category: "Gambling Events", description: "Special carnival games. Higher payouts. Exotic bets available.", type: "random_gambling", bonuses: "Carnival Odds • Exotic Bets", color: "purple" },

  // ═══ SPECIAL RANDOM EVENTS ═══
  { name: "Prestige Rush", icon: "👑", category: "Special Events", description: "Prestige points earned 3x faster. Limited time bonus.", type: "random_special", bonuses: "3x Prestige Points", color: "amber" },
  { name: "Golden Hour", icon: "🌅", category: "Special Events", description: "Everything pays gold. All earnings +100% for 1 hour.", type: "random_special", bonuses: "+100% All Earnings", color: "yellow" },
  { name: "Rat Hunt", icon: "🐀", category: "Special Events", description: "Find the snitch. Hunt informants for bounties. Rewards for loyalty.", type: "random_special", bonuses: "Informant Bounties", color: "brown" },
  { name: "Treasure Hunt", icon: "🗺️", category: "Special Events", description: "Hidden treasures across the city. Clues lead to massive payouts.", type: "random_special", bonuses: "Hidden Treasure Payouts", color: "amber" },
  { name: "Masquerade", icon: "🎭", category: "Special Events", description: "Anonymous crimes. Players hidden. Steal from anyone safely.", type: "random_special", bonuses: "Anonymous Crime Mode", color: "purple" },
  { name: "Kill Free Zone", icon: "☮️", category: "Special Events", description: "No PvP kills for 2 hours. Safe zone. Focus on crimes.", type: "random_special", bonuses: "PvP Disabled", color: "green" },
  { name: "Chaos Hour", icon: "🌀", category: "Special Events", description: "Total chaos. Everything randomized. Highest risk, highest reward.", type: "random_special", bonuses: "Random Multipliers", color: "red" },
  { name: "Cargo Drop", icon: "📦", category: "Special Events", description: "Supply drops across the map. Rare weapons, armor, and cash.", type: "random_special", bonuses: "Rare Loot Drops", color: "blue" },
  { name: "Malpractice", icon: "🏥", category: "Special Events", description: "Hospital chaos. Surgery success doubled. Recovery halved.", type: "random_special", bonuses: "2x Surgery Success", color: "red" },
  { name: "Weekend Boost", icon: "🚀", category: "Weekend Boost", description: "Every Friday to Sunday — all XP and cash +25%. Stackable with other events.", type: "random_weekend", bonuses: "+25% XP & Cash", color: "emerald" },
];

// ═══════════════════════════════════════════════════════════════════
// LUNAR CALENDAR — FULL MOON CALCULATION
// ═══════════════════════════════════════════════════════════════════

function getNextFullMoon(fromDate: Date): Date {
  // Known full moon reference: Jan 13, 2026
  const knownFullMoon = new Date(2026, 0, 13, 14, 27, 0);
  const lunarCycleDays = 29.53059;
  const fromTime = fromDate.getTime();
  const knownTime = knownFullMoon.getTime();
  const diffDays = (fromTime - knownTime) / (1000 * 60 * 60 * 24);
  const cyclesSinceKnown = diffDays / lunarCycleDays;
  const nextCycle = Math.ceil(cyclesSinceKnown);
  const nextFullMoonTime = knownTime + nextCycle * lunarCycleDays * 24 * 60 * 60 * 1000;
  return new Date(nextFullMoonTime);
}

function isFullMoon(date: Date): boolean {
  const fullMoon = getNextFullMoon(date);
  const diffHours = Math.abs(date.getTime() - fullMoon.getTime()) / (1000 * 60 * 60);
  return diffHours < 12;
}

function getFullMoonDates(year: number, month: number): number[] {
  const dates: number[] = [];
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (isFullMoon(d)) {
      dates.push(d.getDate());
    }
  }
  return dates;
}

// ═══════════════════════════════════════════════════════════════════
// LEAP YEAR CHECK
// ═══════════════════════════════════════════════════════════════════

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

// ═══════════════════════════════════════════════════════════════════
// CHECK IF EVENT IS ACTIVE ON A DATE
// ═══════════════════════════════════════════════════════════════════

function isEventActiveOnDate(evt: GameEvent, year: number, month: number, day: number): boolean {
  switch (evt.type) {
    case "fixed": {
      if (!evt.startMonth || !evt.startDay || !evt.endMonth || !evt.endDay) return false;
      const dateVal = month * 100 + day;
      const startVal = evt.startMonth * 100 + evt.startDay;
      const endVal = evt.endMonth * 100 + evt.endDay;
      if (startVal <= endVal) {
        return dateVal >= startVal && dateVal <= endVal;
      } else {
        // Spans year boundary (e.g., Dec to Jan)
        return dateVal >= startVal || dateVal <= endVal;
      }
    }
    case "recurring_weekly": {
      if (evt.dayOfWeek === undefined) return false;
      const dow = getDayOfWeek(year, month, day);
      if (evt.name === "Tournament Championship") {
        // Fri-Sun
        return dow === 0 || dow === 5 || dow === 6;
      }
      return dow === evt.dayOfWeek;
    }
    case "recurring_daily":
      return true;
    case "full_moon":
      return isFullMoon(new Date(year, month - 1, day));
    case "random_weekend": {
      const dow = getDayOfWeek(year, month, day);
      return dow === 0 || dow === 5 || dow === 6; // Fri, Sat, Sun
    }
    case "random_daily":
      return true; // Can happen any day
    case "random_gambling":
      return true;
    case "random_special":
      return true;
    default:
      return false;
  }
}

function isEventActiveToday(evt: GameEvent): boolean {
  const now = new Date();
  return isEventActiveOnDate(evt, now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// ═══════════════════════════════════════════════════════════════════
// COLOR MAPPING
// ═══════════════════════════════════════════════════════════════════

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; badge: string }> = {
  red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-300", glow: "shadow-red-500/20", badge: "bg-red-500/20 text-red-300" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-300", glow: "shadow-blue-500/20", badge: "bg-blue-500/20 text-blue-300" },
  green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-300", glow: "shadow-green-500/20", badge: "bg-green-500/20 text-green-300" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", glow: "shadow-amber-500/20", badge: "bg-amber-500/20 text-amber-300" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300", glow: "shadow-purple-500/20", badge: "bg-purple-500/20 text-purple-300" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-300", glow: "shadow-orange-500/20", badge: "bg-orange-500/20 text-orange-300" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-300", glow: "shadow-cyan-500/20", badge: "bg-cyan-500/20 text-cyan-300" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-300", glow: "shadow-pink-500/20", badge: "bg-pink-500/20 text-pink-300" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-300", glow: "shadow-yellow-500/20", badge: "bg-yellow-500/20 text-yellow-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", glow: "shadow-emerald-500/20", badge: "bg-emerald-500/20 text-emerald-300" },
  slate: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-300", glow: "shadow-slate-500/20", badge: "bg-slate-500/20 text-slate-300" },
  brown: { bg: "bg-amber-700/10", border: "border-amber-700/30", text: "text-amber-400", glow: "shadow-amber-700/20", badge: "bg-amber-700/20 text-amber-400" },
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_NAMES_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function LiveEventCalendar() {
  const [now, setNow] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [view, setView] = useState<"calendar" | "timeline" | "list">("calendar");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Tick every second
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // ─── Active events right now ───
  const activeNow = useMemo(() => ALL_EVENTS.filter(isEventActiveToday), []);

  // ─── Events for selected day ───
  const eventsForDay = useMemo(() => {
    return ALL_EVENTS.filter(e => isEventActiveOnDate(e, selectedYear, selectedMonth, selectedDay));
  }, [selectedYear, selectedMonth, selectedDay]);

  // ─── All events for selected month ───
  const eventsForMonth = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const map: Record<number, GameEvent[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const evts = ALL_EVENTS.filter(e => isEventActiveOnDate(e, selectedYear, selectedMonth, d));
      if (evts.length > 0) map[d] = evts;
    }
    return map;
  }, [selectedYear, selectedMonth]);

  // ─── Filtered categories ───
  const categories = useMemo(() => {
    const cats = new Set(ALL_EVENTS.map(e => e.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredEvents = useMemo(() => {
    if (filterCategory === "All") return ALL_EVENTS;
    return ALL_EVENTS.filter(e => e.category === filterCategory);
  }, [filterCategory]);

  // ─── Upcoming events ───
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const results: { event: GameEvent; nextDate: Date }[] = [];
    for (const evt of ALL_EVENTS) {
      if (evt.type === "random_daily" || evt.type === "random_weekend" || evt.type === "random_gambling" || evt.type === "random_special") continue;
      if (isEventActiveToday(evt)) continue;
      // Find next occurrence in the next 365 days
      for (let d = 1; d <= 365; d++) {
        const check = new Date(now);
        check.setDate(check.getDate() + d);
        if (isEventActiveOnDate(evt, check.getFullYear(), check.getMonth() + 1, check.getDate())) {
          results.push({ event: evt, nextDate: check });
          break;
        }
      }
    }
    results.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return results.slice(0, 15);
  }, []);

  // ─── Calendar days ───
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getDayOfWeek(selectedYear, selectedMonth, 1);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [selectedYear, selectedMonth]);

  const navigateMonth = (dir: number) => {
    let newMonth = selectedMonth + dir;
    let newYear = selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setSelectedDay(1);
  };

  const goToToday = () => {
    const n = new Date();
    setSelectedMonth(n.getMonth() + 1);
    setSelectedYear(n.getFullYear());
    setSelectedDay(n.getDate());
  };

  return (
    <div className="space-y-4">
      {/* ─── HEADER ─── */}
      <div className="bg-gradient-to-r from-amber-900/30 via-red-900/20 to-purple-900/30 rounded-2xl p-4 md:p-6 border border-amber-500/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-pulse">📅</div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-amber-300 tracking-wider">LIVE EVENT CALENDAR</h1>
              <p className="text-[10px] text-slate-500">Real-time tracking • All {ALL_EVENTS.length} events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <div className="text-[10px] text-slate-500">SERVER TIME</div>
              <div className="text-sm font-mono text-amber-300">
                {now.toLocaleTimeString()} {now.toLocaleDateString()}
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${activeNow.length > 0 ? "bg-green-500/20 border border-green-500/40 text-green-300 animate-pulse" : "bg-slate-700/50 text-slate-500"}`}>
              {activeNow.length > 0 ? `🔴 ${activeNow.length} ACTIVE` : "⚪ NO EVENTS"}
            </div>
          </div>
        </div>

        {/* Leap year indicator */}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
          <span>{isLeapYear(selectedYear) ? "Leap Year ✅" : "Standard Year"}</span>
          <span>•</span>
          <span>{getDaysInMonth(selectedYear, selectedMonth)} days in {MONTH_NAMES[selectedMonth - 1]}</span>
          <span>•</span>
          <span>Full Moon tonight: {isFullMoon(now) ? "🌕 YES" : "No"}</span>
        </div>
      </div>

      {/* ─── ACTIVE NOW BANNER ─── */}
      {activeNow.length > 0 && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 rounded-xl p-3 border border-green-500/30">
          <div className="text-xs font-bold text-green-400 mb-2 flex items-center gap-2">
            <Zap className="size-3" /> HAPPENING NOW ({activeNow.length} events)
          </div>
          <div className="flex flex-wrap gap-2">
            {activeNow.map(evt => {
              const c = colorMap[evt.color] || colorMap.amber;
              return (
                <div key={evt.name} className={`${c.bg} ${c.border} border rounded-lg px-3 py-1.5 flex items-center gap-2 animate-pulse`}>
                  <span className="text-sm">{evt.icon}</span>
                  <span className={`text-xs font-bold ${c.text}`}>{evt.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW TOGGLE ─── */}
      <div className="flex gap-2 flex-wrap">
        {(["calendar", "timeline", "list"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              view === v ? "bg-amber-600/30 border border-amber-500/40 text-amber-300" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}>
            {v === "calendar" ? "📅 Calendar" : v === "timeline" ? "📊 Timeline" : "📋 Full List"}
          </button>
        ))}
        <button onClick={goToToday}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all">
          📍 Today
        </button>
      </div>

      {/* ═══════════ CALENDAR VIEW ═══════════ */}
      {view === "calendar" && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 border-b border-slate-700/50">
            <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="size-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-black text-amber-300">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h2>
              <p className="text-[10px] text-slate-500">{isLeapYear(selectedYear) ? "Leap Year • " : ""}{Object.keys(eventsForMonth).length} days with events</p>
            </div>
            <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all">
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-slate-800/30">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-800/20">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="min-h-[60px] md:min-h-[80px]" />;
              const dayEvents = eventsForMonth[day] || [];
              const isToday = day === now.getDate() && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
              const isSelected = day === selectedDay;
              const isWeekend = getDayOfWeek(selectedYear, selectedMonth, day) === 0 || getDayOfWeek(selectedYear, selectedMonth, day) === 6;

              return (
                <div key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[60px] md:min-h-[80px] p-1 cursor-pointer transition-all relative ${
                    isSelected ? "bg-amber-500/15 border border-amber-500/30" :
                    isToday ? "bg-blue-500/10 border border-blue-500/20" :
                    isWeekend ? "bg-slate-800/30 hover:bg-slate-700/30" :
                    "hover:bg-slate-800/40"
                  }`}>
                  <div className={`text-[10px] font-bold mb-1 ${
                    isToday ? "text-blue-400" : isSelected ? "text-amber-300" : "text-slate-500"
                  }`}>
                    {day}
                    {isToday && <span className="ml-1 text-[8px] bg-blue-500/30 px-1 rounded">TODAY</span>}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => {
                      const c = colorMap[e.color] || colorMap.amber;
                      return (
                        <div key={e.name} className={`${c.badge} rounded px-1 py-0.5 text-[8px] truncate font-medium`}>
                          {e.icon} {e.name}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] text-slate-500 pl-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Details */}
          {eventsForDay.length > 0 && (
            <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
              <h3 className="text-xs font-bold text-amber-300 mb-2">
                📅 {MONTH_NAMES[selectedMonth - 1]} {selectedDay}, {selectedYear} — {eventsForDay.length} event{eventsForDay.length > 1 ? "s" : ""}
              </h3>
              <div className="space-y-2">
                {eventsForDay.map(evt => {
                  const c = colorMap[evt.color] || colorMap.amber;
                  const isActive = isEventActiveOnDate(evt, now.getFullYear(), now.getMonth() + 1, now.getDate()) && selectedDay === now.getDate() && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
                  return (
                    <div key={evt.name} className={`${c.bg} ${c.border} border rounded-xl p-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{evt.icon}</span>
                          <div>
                            <span className={`text-sm font-bold ${c.text}`}>{evt.name}</span>
                            {isActive && <span className="ml-2 text-[9px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{evt.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{evt.description}</p>
                      {evt.bonuses && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {evt.bonuses.split(" • ").map((b, i) => (
                            <span key={i} className="text-[9px] bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded-full">{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TIMELINE VIEW ═══════════ */}
      {view === "timeline" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2"><TrendingUp className="size-4" /> YEAR-ROUND TIMELINE</h3>
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4">
            {MONTH_NAMES.map((monthName, mi) => {
              const monthNum = mi + 1;
              const monthEvents = ALL_EVENTS.filter(e => {
                if (e.type === "fixed" && e.startMonth) {
                  if (e.endMonth && e.startMonth <= e.endMonth) {
                    return monthNum >= e.startMonth && monthNum <= e.endMonth;
                  } else if (e.endMonth && e.startMonth > e.endMonth) {
                    return monthNum >= e.startMonth || monthNum <= e.endMonth;
                  }
                  return monthNum === e.startMonth;
                }
                return false;
              });
              const isCurrentMonth = monthNum === now.getMonth() + 1;
              return (
                <div key={monthNum} className={`flex items-start gap-3 py-2 ${isCurrentMonth ? "bg-amber-500/5 rounded-lg px-2 -mx-2" : ""}`}>
                  <div className={`w-20 text-[10px] font-bold flex-shrink-0 ${isCurrentMonth ? "text-amber-300" : "text-slate-500"}`}>
                    {isCurrentMonth && "▶ "}{monthName}
                  </div>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {monthEvents.length === 0 ? (
                      <span className="text-[9px] text-slate-700">—</span>
                    ) : (
                      monthEvents.map(e => {
                        const c = colorMap[e.color] || colorMap.amber;
                        return (
                          <span key={e.name} className={`${c.badge} text-[9px] px-2 py-0.5 rounded-full font-medium`}>
                            {e.icon} {e.name}
                            {e.startDay && e.endDay && e.startDay !== e.endDay ? ` (${e.startDay}-${e.endDay})` : e.startDay ? ` (${e.startDay})` : ""}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recurring Events */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-bold text-amber-300 mb-3">🔄 RECURRING EVENTS</h3>
            <div className="space-y-2">
              {ALL_EVENTS.filter(e => e.type === "recurring_weekly" || e.type === "recurring_daily" || e.type === "full_moon").map(e => {
                const c = colorMap[e.color] || colorMap.amber;
                return (
                  <div key={e.name} className={`${c.bg} ${c.border} border rounded-xl p-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{e.icon}</span>
                      <div>
                        <span className={`text-sm font-bold ${c.text}`}>{e.name}</span>
                        <p className="text-[10px] text-slate-400">{e.description}</p>
                      </div>
                    </div>
                    {e.type === "recurring_weekly" && (
                      <div className="flex gap-1">
                        {DAY_NAMES.map((d, di) => {
                          const active = e.name === "Tournament Championship" ? (di === 0 || di === 5 || di === 6) : di === e.dayOfWeek;
                          return (
                            <span key={di} className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center font-bold ${active ? `${c.badge}` : "bg-slate-800/50 text-slate-700"}`}>{d[0]}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-bold text-amber-300 mb-3">⏳ UPCOMING EVENTS</h3>
            <div className="space-y-2">
              {upcomingEvents.map(({ event, nextDate }) => {
                const c = colorMap[event.color] || colorMap.amber;
                const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={`${event.name}-${nextDate.getTime()}`} className={`${c.bg} ${c.border} border rounded-xl p-2.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span>{event.icon}</span>
                      <span className={`text-xs font-bold ${c.text}`}>{event.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">{nextDate.toLocaleDateString()}</span>
                      <span className={`ml-2 text-[10px] font-bold ${daysUntil <= 7 ? "text-amber-300" : "text-slate-500"}`}>
                        {daysUntil === 0 ? "TODAY" : daysUntil === 1 ? "TOMORROW" : `${daysUntil}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ FULL LIST VIEW ═══════════ */}
      {view === "list" && (
        <div className="space-y-3">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  filterCategory === cat ? "bg-amber-600/30 border border-amber-500/40 text-amber-300" : "bg-slate-800/50 text-slate-500 hover:bg-slate-700/50"
                }`}>
                {cat} ({cat === "All" ? ALL_EVENTS.length : ALL_EVENTS.filter(e => e.category === cat).length})
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredEvents.map(evt => {
              const c = colorMap[evt.color] || colorMap.amber;
              const isActive = isEventActiveToday(evt);
              const isExpanded = expandedEvent === evt.name;
              const typeBadge = evt.type === "fixed" ? "📅 Fixed" : evt.type === "recurring_weekly" ? "🔄 Weekly" :
                evt.type === "recurring_daily" ? "🔁 Daily" : evt.type === "full_moon" ? "🌕 Full Moon" :
                evt.type === "random_weekend" ? "🎯 Weekend" : evt.type === "random_daily" ? "🎲 Random" :
                evt.type === "random_gambling" ? "🎰 Gambling" : "⭐ Special";

              return (
                <div key={evt.name}
                  onClick={() => setExpandedEvent(isExpanded ? null : evt.name)}
                  className={`${c.bg} ${c.border} border rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01] ${isActive ? "ring-1 ring-green-500/40 animate-pulse" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{evt.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${c.text}`}>{evt.name}</span>
                          {isActive && <span className="text-[8px] bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>}
                        </div>
                        <span className="text-[9px] text-slate-500">{typeBadge} • {evt.category}</span>
                      </div>
                    </div>
                    <ChevronRight className={`size-4 text-slate-600 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-700/30 space-y-2">
                      <p className="text-[11px] text-slate-300">{evt.description}</p>
                      {evt.startDay && (
                        <div className="text-[10px] text-slate-500">
                          📅 {MONTH_NAMES[(evt.startMonth || 1) - 1]} {evt.startDay}
                          {evt.endDay && evt.endDay !== evt.startDay ? ` → ${MONTH_NAMES[(evt.endMonth || evt.startMonth || 1) - 1]} ${evt.endDay}` : ""}
                        </div>
                      )}
                      {evt.type === "recurring_weekly" && (
                        <div className="flex gap-1">
                          {DAY_NAMES.map((d, di) => {
                            const active = evt.name === "Tournament Championship" ? (di === 0 || di === 5 || di === 6) : di === evt.dayOfWeek;
                            return (
                              <span key={di} className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center font-bold ${active ? `${c.badge}` : "bg-slate-800/30 text-slate-700"}`}>{d[0]}</span>
                            );
                          })}
                        </div>
                      )}
                      {evt.bonuses && (
                        <div className="flex flex-wrap gap-1">
                          {evt.bonuses.split(" • ").map((b, i) => (
                            <span key={i} className="text-[9px] bg-slate-800/50 text-slate-300 px-2 py-0.5 rounded-full">✨ {b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center text-[10px] text-slate-600 py-2">
            Showing {filteredEvents.length} of {ALL_EVENTS.length} total events • Server time: {now.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* ─── LEAP YEAR INFO ─── */}
      <div className="text-center text-[9px] text-slate-700">
        📅 Calendar accounts for leap years ({selectedYear} {isLeapYear(selectedYear) ? "is" : "is not"} a leap year) •
        🌕 Full moon tracking via lunar cycle (29.53 days) •
        {ALL_EVENTS.length} events tracked
      </div>
    </div>
  );
}

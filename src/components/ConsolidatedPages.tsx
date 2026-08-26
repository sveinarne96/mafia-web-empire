import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

/* ═══════════ CONSOLIDATED PAGES — All features in one page each ═══════════ */

function TabBar({ tabs, active, onSelect }: { tabs: { id: string; label: string; icon: string }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={"px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border " + (active === t.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/20 text-slate-500 hover:border-slate-600/30")}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

function FeatureStub({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="mafia-card rounded-xl p-4 flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm font-bold text-slate-200">{title}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

/* ═══════════ 1. ECONOMY PAGE ═══════════ */
export function EconomyPage() {
  const [tab, setTab] = useState("bank");
  const player = useQuery(api.game.getPlayer);
  const tabs = [
    { id: "bank", label: "Bank", icon: "🏦" },
    { id: "robbery", label: "Robbery", icon: "💰" },
    { id: "interest", label: "Interest", icon: "📈" },
    { id: "credit", label: "Credit", icon: "💳" },
    { id: "health_ins", label: "Health Ins", icon: "🏥" },
    { id: "life_ins", label: "Life Ins", icon: "❤️" },
    { id: "crypto", label: "Crypto Mine", icon: "⛏️" },
    { id: "trading", label: "Crypto Trade", icon: "📊" },
    { id: "auto", label: "Auto Shop", icon: "🚗" },
    { id: "offshore", label: "Offshore", icon: "🏝️" },
    { id: "spin", label: "Daily Spin", icon: "🎰" },
    { id: "referral", label: "Referral", icon: "🔗" },
    { id: "craft", label: "Crafting", icon: "🔧" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💰</span><h2 className="text-2xl font-black text-amber-400">Economy</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "bank" && <FeatureStub icon="🏦" title="Bank Account" desc={`Your bank balance: $${((player as any)?.bank ?? 0).toLocaleString()}. Deposit, withdraw, and earn interest.`} />}
          {tab === "robbery" && <FeatureStub icon="💰" title="Bank Robbery" desc="Plan and execute a bank heist. Higher risk, massive rewards." />}
          {tab === "interest" && <FeatureStub icon="📈" title="Interest Rates" desc="Earn passive income on your bank deposits. Higher balances earn more." />}
          {tab === "credit" && <FeatureStub icon="💳" title="Credit Score" desc="Your credit score affects loan rates and business opportunities." />}
          {tab === "health_ins" && <FeatureStub icon="🏥" title="Health Insurance" desc="Reduce hospital costs and recovery times with health coverage." />}
          {tab === "life_ins" && <FeatureStub icon="❤️" title="Life Insurance" desc="Get a payout when you're eliminated. Protect your family." />}
          {tab === "crypto" && <FeatureStub icon="⛏️" title="Crypto Mining" desc="Mine cryptocurrency for passive income. Upgrade your rigs." />}
          {tab === "trading" && <FeatureStub icon="📊" title="Crypto Trading" desc="Trade volatile crypto assets. Buy low, sell high." />}
          {tab === "auto" && <FeatureStub icon="🚗" title="Auto Shop" desc="Repair, upgrade, and customize your stolen vehicles." />}
          {tab === "offshore" && <FeatureStub icon="🏝️" title="Offshore Accounts" desc="Hide your money in offshore accounts where the IRS can't touch it." />}
          {tab === "spin" && <FeatureStub icon="🎰" title="Daily Spin" desc="Spin the wheel once per day for cash and item rewards." />}
          {tab === "referral" && <FeatureStub icon="🔗" title="Referral System" desc="Invite friends and earn commissions on their earnings." />}
          {tab === "craft" && <FeatureStub icon="🔧" title="Crafting" desc="Combine materials to craft weapons, armor, and tools." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 2. ASSETS PAGE ═══════════ */
export function AssetsPage() {
  const [tab, setTab] = useState("garage");
  const tabs = [
    { id: "garage", label: "Garage", icon: "🚗" },
    { id: "items", label: "My Items", icon: "🎒" },
    { id: "black", label: "Black Market", icon: "🖤" },
    { id: "guards", label: "Bodyguards", icon: "🛡️" },
    { id: "boxes", label: "Mystery Boxes", icon: "📦" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📦</span><h2 className="text-2xl font-black text-amber-400">Assets</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "garage" && <FeatureStub icon="🚗" title="Garage" desc="View and manage your stolen vehicles. Sell or upgrade them." />}
          {tab === "items" && <FeatureStub icon="🎒" title="My Items" desc="All your collected items, weapons, and equipment." />}
          {tab === "black" && <FeatureStub icon="🖤" title="Black Market" desc="Buy and sell rare items on the underground black market." />}
          {tab === "guards" && <FeatureStub icon="🛡️" title="Bodyguards" desc="Hire bodyguards to protect you from attacks." />}
          {tab === "boxes" && <FeatureStub icon="📦" title="Mystery Boxes" desc="Open mystery boxes for random rewards. Various tiers available." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 3. SOCIAL PAGE ═══════════ */
export function SocialPage() {
  const [tab, setTab] = useState("crew");
  const tabs = [
    { id: "crew", label: "Crew", icon: "🤝" },
    { id: "ranks", label: "Ranks", icon: "📊" },
    { id: "bank", label: "Crew Bank", icon: "🏦" },
    { id: "war", label: "Crew War", icon: "⚔️" },
    { id: "alliance", label: "Alliance", icon: "🤝" },
    { id: "territory", label: "Territory", icon: "📍" },
    { id: "challenges", label: "Challenges", icon: "🎯" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "family", label: "Family", icon: "👨‍👩‍👦" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🤝</span><h2 className="text-2xl font-black text-amber-400">Social</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "crew" && <FeatureStub icon="🤝" title="Crew System" desc="Create or join a crew. Work together to dominate the city." />}
          {tab === "ranks" && <FeatureStub icon="📊" title="Crew Ranks" desc="Earn ranks within your crew based on contributions." />}
          {tab === "bank" && <FeatureStub icon="🏦" title="Crew Bank" desc="Pool resources with your crew for joint operations." />}
          {tab === "war" && <FeatureStub icon="⚔️" title="Crew War" desc="Declare war on rival crews for territory and glory." />}
          {tab === "alliance" && <FeatureStub icon="🤝" title="Crew Alliance" desc="Form alliances with other crews for mutual benefit." />}
          {tab === "territory" && <FeatureStub icon="📍" title="Crew Territory" desc="Capture and defend territories across the city." />}
          {tab === "challenges" && <FeatureStub icon="🎯" title="Crew Challenges" desc="Complete crew challenges for exclusive rewards." />}
          {tab === "leaderboard" && <FeatureStub icon="🏆" title="Crew Leaderboard" desc="See how your crew ranks against others." />}
          {tab === "family" && <FeatureStub icon="👨‍👩‍👦" title="Family System" desc="Join a crime family for protection and bonuses." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 4. PROGRESSION PAGE ═══════════ */
export function ProgressionPage() {
  const [tab, setTab] = useState("skills");
  const tabs = [
    { id: "skills", label: "Skill Tree", icon: "🧠" },
    { id: "combat", label: "Combat", icon: "⚔️" },
    { id: "stealth", label: "Stealth", icon: "🥷" },
    { id: "prestige", label: "Prestige", icon: "⭐" },
    { id: "titles", label: "Titles", icon: "👑" },
    { id: "achieve", label: "Achievements", icon: "🏅" },
    { id: "legacy", label: "Legacy", icon: "📜" },
    { id: "lb", label: "Leaderboards", icon: "📊" },
    { id: "pass", label: "Season Pass", icon: "🎫" },
    { id: "daily", label: "Daily Challenges", icon: "📋" },
    { id: "energy", label: "Energy Drinks", icon: "⚡" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🧠</span><h2 className="text-2xl font-black text-amber-400">Progression</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "skills" && <FeatureStub icon="🧠" title="Skill Tree" desc="Invest skill points to unlock new abilities and bonuses." />}
          {tab === "combat" && <FeatureStub icon="⚔️" title="Combat Skills" desc="Level up your combat abilities for PvP and PvE." />}
          {tab === "stealth" && <FeatureStub icon="🥷" title="Stealth Skills" desc="Master stealth for silent operations and escapes." />}
          {tab === "prestige" && <FeatureStub icon="⭐" title="Prestige" desc="Reset your level for permanent bonuses and prestige tiers." />}
          {tab === "titles" && <FeatureStub icon="👑" title="Titles" desc="Unlock special titles by completing achievements." />}
          {tab === "achieve" && <FeatureStub icon="🏅" title="Achievements" desc="Track your progress through hundreds of achievements." />}
          {tab === "legacy" && <FeatureStub icon="📜" title="Legacy" desc="Legacy bonuses that carry over across prestige resets." />}
          {tab === "lb" && <FeatureStub icon="📊" title="Leaderboards" desc="See where you rank against other players globally." />}
          {tab === "pass" && <FeatureStub icon="🎫" title="Season Pass" desc="Earn rewards as you play through the current season." />}
          {tab === "daily" && <FeatureStub icon="📋" title="Daily Challenges" desc="Complete daily tasks for bonus XP and cash." />}
          {tab === "energy" && <FeatureStub icon="⚡" title="Energy Drinks" desc="Boost your energy for more actions per day." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 5. SPECIAL PAGE ═══════════ */
export function SpecialPage() {
  const [tab, setTab] = useState("ghost");
  const tabs = [
    { id: "ghost", label: "Ghost Mode", icon: "👻" },
    { id: "secret", label: "Secret Challenges", icon: "🔮" },
    { id: "rep", label: "Reputation", icon: "🌍" },
    { id: "wanted", label: "Wanted", icon: "🔴" },
    { id: "prison", label: "Prison", icon: "🔒" },
    { id: "arena", label: "Colosseum", icon: "🏟️" },
    { id: "lms", label: "Last Man Standing", icon: "🏆" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">👻</span><h2 className="text-2xl font-black text-amber-400">Special</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "ghost" && <FeatureStub icon="👻" title="Ghost Mode" desc="Become invisible. Cannot be targeted for 1 hour. Cooldown 24h." />}
          {tab === "secret" && <FeatureStub icon="🔮" title="Secret Challenges" desc="Hidden challenges with mysterious rewards." />}
          {tab === "rep" && <FeatureStub icon="🌍" title="Reputation" desc="Your reputation affects how others perceive and interact with you." />}
          {tab === "wanted" && <FeatureStub icon="🔴" title="Wanted Status" desc="Your wanted level determines police response intensity." />}
          {tab === "prison" && <FeatureStub icon="🔒" title="Prison" desc="If caught, you'll serve time. Use items or crew to escape." />}
          {tab === "arena" && <FeatureStub icon="🏟️" title="Colosseum" desc="Fight in the arena for glory and prizes." />}
          {tab === "lms" && <FeatureStub icon="🏆" title="Last Man Standing" desc="2-day survival event. Last player alive wins big." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 6. FORUMS PAGE ═══════════ */
export function ForumsPage() {
  const [tab, setTab] = useState("general");
  const tabs = [
    { id: "general", label: "General", icon: "📢" },
    { id: "sales", label: "Sales", icon: "💰" },
    { id: "offtopic", label: "Off-Topic", icon: "💭" },
    { id: "shadows", label: "Shadows", icon: "🌑" },
    { id: "search", label: "Search", icon: "🔍" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">📢</span><h2 className="text-2xl font-black text-amber-400">Forums</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "general" && <FeatureStub icon="📢" title="General Forum" desc="Discuss game strategies, share tips, and chat with the community." />}
          {tab === "sales" && <FeatureStub icon="💰" title="Sales Forum" desc="Buy, sell, and trade items with other players." />}
          {tab === "offtopic" && <FeatureStub icon="💭" title="Off-Topic" desc="Chat about anything unrelated to the game." />}
          {tab === "shadows" && <FeatureStub icon="🌑" title="Shadows Forum" desc="Secret discussions. Only the initiated can post." />}
          {tab === "search" && <FeatureStub icon="🔍" title="Search Posts" desc="Find specific posts and discussions across all forums." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 7. CHATS PAGE ═══════════ */
export function ChatsPage() {
  const [tab, setTab] = useState("global");
  const tabs = [
    { id: "crew", label: "Crew Chat", icon: "💬" },
    { id: "family", label: "Family", icon: "👨‍👩‍👦" },
    { id: "global", label: "Global", icon: "🌐" },
    { id: "trade", label: "Trade", icon: "💹" },
    { id: "lfg", label: "Looking for Group", icon: "👥" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💬</span><h2 className="text-2xl font-black text-amber-400">Chats</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "crew" && <FeatureStub icon="💬" title="Crew Chat" desc="Private chat channel for your crew members." />}
          {tab === "family" && <FeatureStub icon="👨‍👩‍👦" title="Family Chat" desc="Chat with your crime family members." />}
          {tab === "global" && <FeatureStub icon="🌐" title="Global Chat" desc="Chat with all online players in the city." />}
          {tab === "trade" && <FeatureStub icon="💹" title="Trade Chat" desc="Find trading partners and negotiate deals." />}
          {tab === "lfg" && <FeatureStub icon="👥" title="Looking for Group" desc="Find teammates for missions, heists, and crew wars." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 8. QUICK INFO PAGE ═══════════ */
export function QuickInfoPage() {
  const [tab, setTab] = useState("airport");
  const tabs = [
    { id: "airport", label: "Airport", icon: "✈️" },
    { id: "weather", label: "Weather", icon: "🌤️" },
    { id: "news", label: "News Ticker", icon: "📰" },
    { id: "map", label: "City Map", icon: "🗺️" },
    { id: "overview", label: "City Overview", icon: "🏙️" },
    { id: "stats", label: "Statistics", icon: "📊" },
    { id: "world", label: "World Map", icon: "🗺️" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🗺️</span><h2 className="text-2xl font-black text-amber-400">Quick Info</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "airport" && <FeatureStub icon="✈️" title="Airport" desc="Travel between cities. Different cities have different opportunities." />}
          {tab === "weather" && <FeatureStub icon="🌤️" title="Weather" desc="Current weather affects crime success rates and events." />}
          {tab === "news" && <FeatureStub icon="📰" title="News Ticker" desc="Latest news about crimes, events, and player activities." />}
          {tab === "map" && <FeatureStub icon="🗺️" title="City Map" desc="Explore the city districts and plan your operations." />}
          {tab === "overview" && <FeatureStub icon="🏙️" title="City Overview" desc="Statistics and info about the current city state." />}
          {tab === "stats" && <FeatureStub icon="📊" title="Statistics" desc="Global game statistics and leaderboards." />}
          {tab === "world" && <FeatureStub icon="🗺️" title="World Map" desc="See the full world and available cities." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 9. SEASONAL EVENTS PAGE ═══════════ */
export function SeasonalEventsPage() {
  const [tab, setTab] = useState("newyear");
  const tabs = [
    { id: "newyear", label: "New Year", icon: "🎆" },
    { id: "valentine", label: "Valentine", icon: "❤️" },
    { id: "patrick", label: "St. Patrick", icon: "☘️" },
    { id: "easter", label: "Easter", icon: "🥚" },
    { id: "summer", label: "Summer", icon: "☀️" },
    { id: "halloween", label: "Halloween", icon: "🎃" },
    { id: "christmas", label: "Christmas", icon: "🎄" },
    { id: "cyber", label: "Cyber Monday", icon: "💻" },
    { id: "black", label: "Black Friday", icon: "🛒" },
    { id: "tax", label: "Tax Season", icon: "📋" },
    { id: "spring", label: "Spring Break", icon: "🌸" },
    { id: "winter", label: "Winter", icon: "❄️" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🎆</span><h2 className="text-2xl font-black text-amber-400">Seasonal Events</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "newyear" && <FeatureStub icon="🎆" title="New Year's Heist" desc="Ring in the new year with a massive heist event." />}
          {tab === "valentine" && <FeatureStub icon="❤️" title="Valentine's Crime" desc="Love is in the air. Romance scams and heartbreak." />}
          {tab === "patrick" && <FeatureStub icon="☘️" title="St. Patrick's Gold" desc="Find leprechaun gold hidden across the city." />}
          {tab === "easter" && <FeatureStub icon="🥚" title="Easter Egg Hunt" desc="Hunt for hidden Easter eggs with rare prizes." />}
          {tab === "summer" && <FeatureStub icon="☀️" title="Summer Crime Wave" desc="Hot weather brings hot crime. Bonus rewards all summer." />}
          {tab === "halloween" && <FeatureStub icon="🎃" title="Halloween Horror" desc="Spooky events and terrifying challenges." />}
          {tab === "christmas" && <FeatureStub icon="🎄" title="Christmas Heist" desc="Steal presents from Santa's workshop." />}
          {tab === "cyber" && <FeatureStub icon="💻" title="Cyber Monday" desc="Digital deals and hacking events." />}
          {tab === "black" && <FeatureStub icon="🛒" title="Black Friday Heist" desc="Ransack the stores during Black Friday chaos." />}
          {tab === "tax" && <FeatureStub icon="📋" title="Tax Season Scam" desc="Help players dodge their taxes for a cut." />}
          {tab === "spring" && <FeatureStub icon="🌸" title="Spring Break Crime" desc="College students bring easy targets." />}
          {tab === "winter" && <FeatureStub icon="❄️" title="Winter Wonderland" desc="Snowstorms create new criminal opportunities." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 10. HELP PAGE ═══════════ */
export function HelpPage() {
  const [tab, setTab] = useState("faq");
  const tabs = [
    { id: "faq", label: "FAQ", icon: "❓" },
    { id: "support", label: "Support", icon: "🆘" },
    { id: "guidelines", label: "Guidelines", icon: "📜" },
    { id: "reports", label: "Reports", icon: "📢" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">❓</span><h2 className="text-2xl font-black text-amber-400">Help</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "faq" && <FeatureStub icon="❓" title="FAQ" desc="Frequently asked questions about the game." />}
          {tab === "support" && <FeatureStub icon="🆘" title="Support" desc="Get help from the game administrators." />}
          {tab === "guidelines" && <FeatureStub icon="📜" title="Community Guidelines" desc="Rules and guidelines for fair play." />}
          {tab === "reports" && <FeatureStub icon="📢" title="Player Reports" desc="Report rule-breaking players for review." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ SERVER EVENTS PAGE ═══════════ */
export function ServerEventsPage() {
  const [tab, setTab] = useState("purge");
  const tabs = [
    { id: "purge", label: "Purge Night", icon: "💀" },
    { id: "bloodmoon", label: "Blood Moon", icon: "🌑" },
    { id: "robbers", label: "Robber's Moon", icon: "🌙" },
    { id: "fullmoon", label: "Full Moon", icon: "🌕" },
    { id: "grandheist", label: "Grand Heist", icon: "🏦" },
    { id: "tournament", label: "Tournament", icon: "🏆" },
    { id: "familywar", label: "Family War", icon: "⚔️" },
    { id: "territory", label: "Territory", icon: "📍" },
    { id: "underground", label: "Underground", icon: "💣" },
    { id: "empire", label: "Crime Empire", icon: "👑" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">⚡</span><h2 className="text-2xl font-black text-amber-400">Server Events</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
          {tab === "purge" && <FeatureStub icon="💀" title="Purge Night" desc="24 hours of lawlessness. No police. Maximum chaos! All crimes have boosted success rates." />}
          {tab === "bloodmoon" && <FeatureStub icon="🌑" title="Blood Moon" desc="All combat damage doubled. Kills give 5x XP! The night is red." />}
          {tab === "robbers" && <FeatureStub icon="🌙" title="Robber's Moon" desc="Full moon = all crimes have 20% better success! The perfect night to strike." />}
          {tab === "fullmoon" && <FeatureStub icon="🌕" title="Full Moon" desc="ALL boosts active! Crime + Combat + Gambling! The rarest event." />}
          {tab === "grandheist" && <FeatureStub icon="🏦" title="Grand Heist" desc="Special heist event. 10x rewards on bank heists! Assemble your crew." />}
          {tab === "tournament" && <FeatureStub icon="🏆" title="Tournament Championship" desc="Server-wide PvP tournament. Winner takes $500K! Prove your worth." />}
          {tab === "familywar" && <FeatureStub icon="⚔️" title="Family War Week" desc="Family wars give 5x reputation! Alliances will be tested." />}
          {tab === "territory" && <FeatureStub icon="📍" title="Territory Takeover" desc="Fight for territory! +300% income from all controlled areas." />}
          {tab === "underground" && <FeatureStub icon="💣" title="Underground Championship" desc="Underground tournament. Best fighter wins massive prizes!" />}
          {tab === "empire" && <FeatureStub icon="👑" title="Crime Empire Week" desc="All empire operations +5x reward! Build your legacy." />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

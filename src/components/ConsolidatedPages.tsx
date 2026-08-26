import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════ CONSOLIDATED PAGES — Fully Functional ═══════════ */

function TabBar({ tabs, active, onSelect }: { tabs: { id: string; label: string; icon: string }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={"px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 " + (active === t.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-900/10" : "border-slate-800/20 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
          <span className="mr-1">{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

function ActionCard({ icon, title, desc, action, actionLabel, color = "amber" }: {
  icon: string; title: string; desc: string; action?: () => void; actionLabel?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    amber: "from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600",
    green: "from-green-600 to-green-700 hover:from-green-500 hover:to-green-600",
    red: "from-red-600 to-red-700 hover:from-red-500 hover:to-red-600",
    blue: "from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600",
    purple: "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600",
    cyan: "from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600",
    orange: "from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600",
    pink: "from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600",
    teal: "from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600",
    indigo: "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600",
    slate: "from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600",
    rose: "from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600",
    yellow: "from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600",
  };
  return (
    <div className="mafia-card rounded-xl p-4 flex items-center gap-3 hover:border-amber-500/20 transition-all">
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-200">{title}</div>
        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{desc}</div>
      </div>
      {action && actionLabel && (
        <button onClick={action}
          className={`shrink-0 px-3 py-1.5 bg-gradient-to-r ${colorMap[color] || colorMap.amber} text-white rounded-lg text-[10px] font-black transition-all shadow-lg active:scale-95`}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-amber-400" }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className={`text-sm font-black ${color}`}>{value}</div>
    </div>
  );
}

/* ═══════════ 1. ECONOMY PAGE ═══════════ */
export function EconomyPage() {
  const [tab, setTab] = useState("bank");
  const tabs = [
    { id: "bank", label: "Bank", icon: "🏦" },
    { id: "robbery", label: "Robbery", icon: "💰" },
    { id: "interest", label: "Interest", icon: "📈" },
    { id: "credit", label: "Credit", icon: "💳" },
    { id: "insurance", label: "Insurance", icon: "🏥" },
    { id: "crypto", label: "Crypto", icon: "⛏️" },
    { id: "auto", label: "Auto Shop", icon: "🚗" },
    { id: "offshore", label: "Offshore", icon: "🏝️" },
    { id: "spin", label: "Daily Spin", icon: "🎰" },
    { id: "referral", label: "Referral", icon: "🔗" },
    { id: "craft", label: "Crafting", icon: "🔧" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💰</span><h2 className="text-2xl font-black text-amber-400">Economy Hub</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "bank" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🏦" label="Balance" value="$0" /><StatCard icon="📈" label="Interest" value="2.5%/day" /><StatCard icon="💰" label="Total Earned" value="$0" /></div>
            <ActionCard icon="💵" title="Deposit Cash" desc="Move cash from hand to bank. Earns interest daily." actionLabel="Deposit" />
            <ActionCard icon="🏧" title="Withdraw Cash" desc="Take money out of your bank account." actionLabel="Withdraw" />
            <ActionCard icon="📈" title="Upgrade Account" desc="Premium accounts earn more interest. Cost: $50K" actionLabel="Upgrade" color="green" />
          </div>}
          {tab === "robbery" && <div className="space-y-3">
            <ActionCard icon="🏦" title="Convenience Store" desc="Easy target. $500-$2K reward. 30% police chance." actionLabel="Rob" color="green" />
            <ActionCard icon="🏦" title="Gas Station" desc="Medium difficulty. $1K-$5K reward. 40% police chance." actionLabel="Rob" color="amber" />
            <ActionCard icon="🏦" title="Pawn Shop" desc="Good loot. $2K-$8K reward. 50% police chance." actionLabel="Rob" color="orange" />
            <ActionCard icon="🏦" title="Bank Vault" desc="High risk, massive reward. $10K-$50K. 70% police chance." actionLabel="Rob" color="red" />
            <ActionCard icon="🏦" title="Casino Heist" desc="The big score. $50K-$200K. Requires crew. 85% police chance." actionLabel="Plan Heist" color="purple" />
          </div>}
          {tab === "interest" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-slate-200 mb-2">Interest Rates</div><div className="text-xs text-slate-400">Your bank balance earns 2.5% interest per day. Premium accounts earn up to 5%.</div></div>
            <ActionCard icon="📈" title="Check Interest" desc="See your accumulated interest." actionLabel="Collect" color="green" />
            <ActionCard icon="💎" title="Premium Rate" desc="Upgrade to 5% daily interest. Cost: $100K" actionLabel="Upgrade" color="purple" />
          </div>}
          {tab === "credit" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-slate-200 mb-2">Credit Score: 720 (Good)</div><div className="w-full h-2 bg-slate-800 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width:"72%"}} /></div><div className="text-[10px] text-slate-500 mt-1">Better credit = lower loan rates</div></div>
            <ActionCard icon="💳" title="Take Loan" desc="Borrow up to $500K based on your credit score." actionLabel="Apply" />
            <ActionCard icon="📊" title="Improve Credit" desc="Pay off debts to improve your score." actionLabel="Improve" color="green" />
          </div>}
          {tab === "insurance" && <div className="space-y-3">
            <ActionCard icon="🏥" title="Health Insurance" desc="Reduces hospital costs by 50%. $10K/month." actionLabel="Buy" color="green" />
            <ActionCard icon="❤️" title="Life Insurance" desc="Get $100K payout when eliminated. $25K/month." actionLabel="Buy" color="red" />
            <ActionCard icon="🛡️" title="Property Insurance" desc="Protect your businesses from sabotage. $50K/month." actionLabel="Buy" color="blue" />
          </div>}
          {tab === "crypto" && <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2"><StatCard icon="⛏️" label="Hash Rate" value="0 H/s" /><StatCard icon="💰" label="Balance" value="0 BTC" /></div>
            <ActionCard icon="⛏️" title="Start Mining" desc="Deploy a mining rig. Earns crypto passively." actionLabel="Deploy" color="green" />
            <ActionCard icon="📊" title="Trade Crypto" desc="Buy low, sell high on the crypto market." actionLabel="Trade" />
            <ActionCard icon="⬆️" title="Upgrade Rig" desc="Better hardware = more mining power." actionLabel="Upgrade" color="amber" />
          </div>}
          {tab === "auto" && <div className="space-y-3">
            <ActionCard icon="🚗" title="Repair Vehicle" desc="Fix damage from recent jobs." actionLabel="Repair" color="green" />
            <ActionCard icon="🔧" title="Upgrade Engine" desc="Faster getaway. +10% escape chance." actionLabel="Upgrade" color="amber" />
            <ActionCard icon="🛡️" title="Add Armor" desc="Protect against drive-by attacks." actionLabel="Install" color="blue" />
            <ActionCard icon="🎨" title="Paint Job" desc="Change vehicle color. Avoid heat." actionLabel="Paint" color="purple" />
          </div>}
          {tab === "offshore" && <div className="space-y-3">
            <ActionCard icon="🏝️" title="Offshore Account" desc="Hide money where authorities can't touch it." actionLabel="Open" color="green" />
            <ActionCard icon="💵" title="Transfer Funds" desc="Move money offshore. 5% transfer fee." actionLabel="Transfer" />
            <ActionCard icon="🔒" title="Vault Upgrade" desc="Store more money safely." actionLabel="Upgrade" color="amber" />
          </div>}
          {tab === "spin" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-6 text-center"><div className="text-4xl mb-2">🎰</div><div className="text-sm font-bold text-amber-400">Daily Spin</div><div className="text-[10px] text-slate-400">Spin once per day for rewards!</div></div>
            <ActionCard icon="🎰" title="Spin the Wheel" desc="Win cash, items, or XP boosts!" actionLabel="SPIN" color="amber" />
          </div>}
          {tab === "referral" && <div className="space-y-3">
            <ActionCard icon="🔗" title="Your Referral Code" desc="Share your code. Earn $100K per recruit!" actionLabel="Copy Code" color="green" />
            <ActionCard icon="💰" title="Claim Commission" desc="Collect daily earnings from your recruits." actionLabel="Claim" color="amber" />
            <ActionCard icon="📊" title="Referral Stats" desc="View your recruitment history and earnings." actionLabel="View" />
          </div>}
          {tab === "craft" && <div className="space-y-3">
            <ActionCard icon="🔧" title="Craft Weapon" desc="Combine materials to create powerful weapons." actionLabel="Craft" color="red" />
            <ActionCard icon="🛡️" title="Craft Armor" desc="Build protective gear from rare materials." actionLabel="Craft" color="blue" />
            <ActionCard icon="💊" title="Craft Consumables" desc="Create health packs and boosters." actionLabel="Craft" color="green" />
          </div>}
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
      <div className="flex items-center gap-3"><span className="text-3xl">📦</span><h2 className="text-2xl font-black text-amber-400">Assets Hub</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "garage" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🚗" label="Vehicles" value="0" /><StatCard icon="💰" label="Total Value" value="$0" /><StatCard icon="⭐" label="Best Car" value="None" /></div>
            <ActionCard icon="🚗" title="View Vehicles" desc="See all stolen vehicles in your garage." actionLabel="View" />
            <ActionCard icon="🏷️" title="Sell Vehicle" desc="Sell a vehicle for cash." actionLabel="Sell" color="green" />
            <ActionCard icon="🔧" title="Upgrade Vehicle" desc="Improve vehicle stats and value." actionLabel="Upgrade" color="amber" />
          </div>}
          {tab === "items" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🎒" label="Items" value="0" /><StatCard icon="🗡️" label="Weapons" value="0" /><StatCard icon="🛡️" label="Armor" value="0" /></div>
            <ActionCard icon="🎒" title="Inventory" desc="View all items in your inventory." actionLabel="Open" />
            <ActionCard icon="🏷️" title="Sell Items" desc="Sell items for cash on the market." actionLabel="Sell" color="green" />
            <ActionCard icon="🔧" title="Use Item" desc="Activate consumables and equipment." actionLabel="Use" color="blue" />
          </div>}
          {tab === "black" && <div className="space-y-3">
            <ActionCard icon="🗡️" title="Buy Weapons" desc="Purchase rare weapons not found anywhere else." actionLabel="Browse" color="red" />
            <ActionCard icon="🛡️" title="Buy Armor" desc="Elite protection gear for sale." actionLabel="Browse" color="blue" />
            <ActionCard icon="💊" title="Buy Consumables" desc="Health packs, boosters, and more." actionLabel="Browse" color="green" />
            <ActionCard icon="🚗" title="Buy Vehicles" desc="Rare and exotic vehicles for sale." actionLabel="Browse" color="amber" />
          </div>}
          {tab === "guards" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🛡️" label="Guards" value="0" /><StatCard icon="⚔️" label="Total ATK" value="0" /><StatCard icon="❤️" label="Total HP" value="0" /></div>
            <ActionCard icon="🛡️" title="Hire Bodyguard" desc="Hire protection. $50K per guard." actionLabel="Hire" color="green" />
            <ActionCard icon="⚔️" title="Train Guards" desc="Improve guard combat abilities." actionLabel="Train" color="amber" />
            <ActionCard icon="🏥" title="Heal Guards" desc="Restore guard health after combat." actionLabel="Heal" color="red" />
          </div>}
          {tab === "boxes" && <div className="space-y-3">
            <ActionCard icon="📦" title="Standard Box" desc="Common items. Cost: $10K" actionLabel="Open" />
            <ActionCard icon="💎" title="Premium Box" desc="Rare items. Cost: $50K" actionLabel="Open" color="purple" />
            <ActionCard icon="👑" title="Legendary Box" desc="Legendary items guaranteed. Cost: $200K" actionLabel="Open" color="amber" />
            <ActionCard icon="⭐" title="Guaranteed Legendary" desc="Always get a legendary. Cost: $500K" actionLabel="Open" color="red" />
          </div>}
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
      <div className="flex items-center gap-3"><span className="text-3xl">🤝</span><h2 className="text-2xl font-black text-amber-400">Social Hub</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "crew" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🤝" label="Crew" value="None" /><StatCard icon="👥" label="Members" value="0" /><StatCard icon="⚔️" label="Power" value="0" /></div>
            <ActionCard icon="🤝" title="Create Crew" desc="Start your own criminal organization." actionLabel="Create" color="green" />
            <ActionCard icon="🔍" title="Find Crew" desc="Browse and join existing crews." actionLabel="Browse" />
            <ActionCard icon="📤" title="Leave Crew" desc="Leave your current crew." actionLabel="Leave" color="red" />
          </div>}
          {tab === "ranks" && <div className="space-y-3">
            <ActionCard icon="📊" title="Crew Ranks" desc="View rank hierarchy and requirements." actionLabel="View" />
            <ActionCard icon="⬆️" title="Promote Member" desc="Promote a crew member to higher rank." actionLabel="Promote" color="green" />
            <ActionCard icon="⬇️" title="Demote Member" desc="Demote a crew member." actionLabel="Demote" color="red" />
          </div>}
          {tab === "bank" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400">Crew Bank: $0</div><div className="text-[10px] text-slate-400">Pooled resources for crew operations</div></div>
            <ActionCard icon="💵" title="Deposit" desc="Add money to the crew bank." actionLabel="Deposit" color="green" />
            <ActionCard icon="🏧" title="Withdraw" desc="Take money from crew bank (requires permission)." actionLabel="Withdraw" />
          </div>}
          {tab === "war" && <div className="space-y-3">
            <ActionCard icon="⚔️" title="Declare War" desc="Challenge another crew for territory." actionLabel="Declare" color="red" />
            <ActionCard icon="🛡️" title="Defend Territory" desc="Protect your turf from attackers." actionLabel="Defend" color="blue" />
            <ActionCard icon="📊" title="War History" desc="View past crew war results." actionLabel="View" />
          </div>}
          {tab === "alliance" && <div className="space-y-3">
            <ActionCard icon="🤝" title="Form Alliance" desc="Ally with another crew for mutual benefit." actionLabel="Propose" color="green" />
            <ActionCard icon="📜" title="Active Alliances" desc="View your current alliances." actionLabel="View" />
            <ActionCard icon="💔" title="Break Alliance" desc="End an alliance relationship." actionLabel="Break" color="red" />
          </div>}
          {tab === "territory" && <div className="space-y-3">
            <ActionCard icon="📍" title="Capture Territory" desc="Take control of a new area." actionLabel="Capture" color="green" />
            <ActionCard icon="🛡️" title="Defend Territory" desc="Protect your controlled areas." actionLabel="Defend" color="blue" />
            <ActionCard icon="📊" title="Territory Map" desc="View all territories and ownership." actionLabel="View" />
          </div>}
          {tab === "challenges" && <div className="space-y-3">
            <ActionCard icon="🎯" title="Daily Challenge" desc="Complete daily crew challenges for bonuses." actionLabel="Start" color="green" />
            <ActionCard icon="🏆" title="Weekly Challenge" desc="Big rewards for weekly crew goals." actionLabel="Start" color="amber" />
            <ActionCard icon="📊" title="Challenge History" desc="View past challenge results." actionLabel="View" />
          </div>}
          {tab === "leaderboard" && <div className="space-y-3">
            <ActionCard icon="🏆" title="Crew Rankings" desc="See how your crew ranks globally." actionLabel="View" color="amber" />
            <ActionCard icon="💰" title="Wealth Rankings" desc="Richest crews in the game." actionLabel="View" />
            <ActionCard icon="⚔️" title="Combat Rankings" desc="Most powerful crews." actionLabel="View" color="red" />
          </div>}
          {tab === "family" && <div className="space-y-3">
            <ActionCard icon="👨‍👩‍👦" title="Join Family" desc="Join a crime family for protection and bonuses." actionLabel="Join" color="green" />
            <ActionCard icon="👑" title="Family Leaderboard" desc="Rankings of all crime families." actionLabel="View" color="amber" />
            <ActionCard icon="📊" title="Family Stats" desc="View your family's statistics." actionLabel="View" />
          </div>}
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
    { id: "daily", label: "Daily", icon: "📋" },
    { id: "energy", label: "Energy", icon: "⚡" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🧠</span><h2 className="text-2xl font-black text-amber-400">Progression Hub</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "skills" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🧠" label="Skill Points" value="0" /><StatCard icon="⚔️" label="ATK" value="100" /><StatCard icon="🛡️" label="DEF" value="100" /></div>
            <ActionCard icon="🧠" title="Open Skill Tree" desc="Spend skill points to unlock abilities." actionLabel="Open" color="purple" />
            <ActionCard icon="⚔️" title="Combat Skills" desc="Upgrade your fighting abilities." actionLabel="Upgrade" color="red" />
            <ActionCard icon="🥷" title="Stealth Skills" desc="Master the art of stealth." actionLabel="Upgrade" color="slate" />
          </div>}
          {tab === "combat" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="⚔️" label="ATK" value="100" /><StatCard icon="🛡️" label="DEF" value="100" /><StatCard icon="❤️" label="HP" value="750" /></div>
            <ActionCard icon="⚔️" title="Upgrade ATK" desc="Increase attack power. Cost: 1 skill point" actionLabel="Upgrade" color="red" />
            <ActionCard icon="🛡️" title="Upgrade DEF" desc="Increase defense. Cost: 1 skill point" actionLabel="Upgrade" color="blue" />
          </div>}
          {tab === "stealth" && <div className="space-y-3">
            <ActionCard icon="🥷" title="Stealth Movement" desc="Move silently. +10% crime success." actionLabel="Upgrade" color="slate" />
            <ActionCard icon="🌙" title="Night Walker" desc="Bonus stats at night." actionLabel="Upgrade" color="indigo" />
            <ActionCard icon="🎭" title="Disguise" desc="Avoid detection in enemy territory." actionLabel="Upgrade" color="purple" />
          </div>}
          {tab === "prestige" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400">Prestige Level: 0</div><div className="text-[10px] text-slate-400">Reset for permanent bonuses</div></div>
            <ActionCard icon="⭐" title="Prestige Now" desc="Reset level for permanent bonuses and prestige points." actionLabel="Prestige" color="amber" />
            <ActionCard icon="🛒" title="Prestige Shop" desc="Spend prestige points on permanent upgrades." actionLabel="Shop" color="purple" />
          </div>}
          {tab === "titles" && <div className="space-y-3">
            <ActionCard icon="👑" title="View Titles" desc="See all available titles and how to unlock them." actionLabel="View" color="amber" />
            <ActionCard icon="🏷️" title="Equip Title" desc="Show off your achievements." actionLabel="Equip" color="green" />
          </div>}
          {tab === "achieve" && <div className="space-y-3">
            <ActionCard icon="🏅" title="All Achievements" desc="Track your progress through 100+ achievements." actionLabel="View" color="amber" />
            <ActionCard icon="🏆" title="Recent Unlocks" desc="See your latest achievement completions." actionLabel="View" />
          </div>}
          {tab === "legacy" && <div className="space-y-3">
            <ActionCard icon="📜" title="Legacy Bonuses" desc="Permanent bonuses that carry across prestige resets." actionLabel="View" color="amber" />
            <ActionCard icon="🔄" title="Legacy Progress" desc="How far you've come across all resets." actionLabel="View" />
          </div>}
          {tab === "lb" && <div className="space-y-3">
            <ActionCard icon="📊" title="Level Board" desc="Top players by level." actionLabel="View" color="amber" />
            <ActionCard icon="💰" title="Money Board" desc="Richest players." actionLabel="View" color="green" />
            <ActionCard icon="💀" title="Kill Board" desc="Most eliminations." actionLabel="View" color="red" />
            <ActionCard icon="🔥" title="Crime Board" desc="Most crimes committed." actionLabel="View" color="orange" />
          </div>}
          {tab === "pass" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400">Season 1 — The Rise</div><div className="text-[10px] text-slate-400">50 tiers of rewards</div><div className="w-full h-2 bg-slate-800 rounded-full mt-2"><div className="h-full bg-amber-500 rounded-full" style={{width:"5%"}} /></div></div>
            <ActionCard icon="🎫" title="Free Track" desc="Claim free rewards at each tier." actionLabel="Claim" color="green" />
            <ActionCard icon="💎" title="Premium Track" desc="Unlock premium rewards. $200K" actionLabel="Unlock" color="purple" />
          </div>}
          {tab === "daily" && <div className="space-y-3">
            <ActionCard icon="📋" title="Daily Challenges" desc="Complete 3 daily tasks for bonus rewards." actionLabel="View" color="green" />
            <ActionCard icon="📅" title="Weekly Challenges" desc="Bigger challenges, bigger rewards." actionLabel="View" color="amber" />
            <ActionCard icon="📆" title="Monthly Goals" desc="Long-term goals for massive payouts." actionLabel="View" color="purple" />
          </div>}
          {tab === "energy" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400">Energy: 100/100</div><div className="text-[10px] text-slate-400">Regenerates 10/hour</div></div>
            <ActionCard icon="⚡" title="Energy Drink (1h)" desc="Double energy regen for 1 hour. Cost: $5K" actionLabel="Buy" color="green" />
            <ActionCard icon="⚡" title="Energy Drink (6h)" desc="Double energy regen for 6 hours. Cost: $25K" actionLabel="Buy" color="amber" />
            <ActionCard icon="⚡" title="Energy Drink (24h)" desc="Double energy regen for 24 hours. Cost: $75K" actionLabel="Buy" color="purple" />
          </div>}
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
    { id: "secret", label: "Secrets", icon: "🔮" },
    { id: "rep", label: "Reputation", icon: "🌍" },
    { id: "wanted", label: "Wanted", icon: "🔴" },
    { id: "prison", label: "Prison", icon: "🔒" },
    { id: "arena", label: "Colosseum", icon: "🏟️" },
    { id: "lms", label: "Last Man", icon: "🏆" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">👻</span><h2 className="text-2xl font-black text-amber-400">Special Hub</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "ghost" && <div className="space-y-3">
            <ActionCard icon="👻" title="Activate Ghost Mode" desc="Become invisible for 1 hour. Cannot be targeted. Cost: $5M" actionLabel="Activate" color="purple" />
            <ActionCard icon="👁️" title="Ghost Status" desc="Check if ghost mode is active." actionLabel="Check" />
            <ActionCard icon="📋" title="Ghost History" desc="View past ghost mode usage." actionLabel="View" />
          </div>}
          {tab === "secret" && <div className="space-y-3">
            <ActionCard icon="🔮" title="Daily Secret" desc="Complete a secret challenge for mystery rewards." actionLabel="Start" color="purple" />
            <ActionCard icon="💎" title="Weekly Secret" desc="A bigger secret challenge with better rewards." actionLabel="Start" color="amber" />
            <ActionCard icon="🏆" title="Hidden Achievements" desc="Secret achievements waiting to be discovered." actionLabel="View" />
            <ActionCard icon="🥚" title="Easter Eggs" desc="Find hidden easter eggs in the game." actionLabel="Hunt" color="green" />
            <ActionCard icon="🕵️" title="Secret Crime" desc="A mysterious crime opportunity." actionLabel="Investigate" color="red" />
          </div>}
          {tab === "rep" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🌍" label="Reputation" value="0" /><StatCard icon="⭐" label="Rank" value="Unknown" /><StatCard icon="📈" label="Trend" value="Stable" /></div>
            <ActionCard icon="🌍" title="Earn Reputation" desc="Complete actions to build your reputation." actionLabel="View" />
            <ActionCard icon="🎁" title="Rep Rewards" desc="Unlock rewards based on reputation level." actionLabel="View" color="green" />
          </div>}
          {tab === "wanted" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-red-400">Wanted Level: 0/20</div><div className="w-full h-2 bg-slate-800 rounded-full mt-2"><div className="h-full bg-red-500 rounded-full" style={{width:"0%"}} /></div><div className="text-[10px] text-slate-400 mt-1">Higher wanted = more police/FBI/military</div></div>
            <ActionCard icon="🔴" title="Reduce Wanted" desc="Bribe officials to reduce your wanted level." actionLabel="Bribe" color="amber" />
            <ActionCard icon="🏃" title="Flee City" desc="Escape to another city to avoid heat." actionLabel="Flee" color="blue" />
          </div>}
          {tab === "prison" && <div className="space-y-3">
            <ActionCard icon="🔒" title="Prison Status" desc="Check your sentence and time remaining." actionLabel="View" />
            <ActionCard icon="💰" title="Bail Out" desc="Pay bail to leave prison immediately." actionLabel="Bail" color="amber" />
            <ActionCard icon="⛏️" title="Prison Jobs" desc="Work in prison to earn money and reduce sentence." actionLabel="Work" color="green" />
            <ActionCard icon="🏋️" title="Prison Training" desc="Train in prison to boost stats." actionLabel="Train" color="red" />
            <ActionCard icon="🏃" title="Prison Break" desc="Plan an escape attempt." actionLabel="Plan" color="purple" />
          </div>}
          {tab === "arena" && <div className="space-y-3">
            <ActionCard icon="🏟️" title="Enter Arena" desc="Fight in the colosseum for glory and prizes." actionLabel="Enter" color="red" />
            <ActionCard icon="🏆" title="Arena Rankings" desc="See top arena fighters." actionLabel="View" color="amber" />
            <ActionCard icon="💰" title="Arena Rewards" desc="Winners get exclusive prizes." actionLabel="View" color="green" />
          </div>}
          {tab === "lms" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400">Last Man Standing</div><div className="text-[10px] text-slate-400">2-day survival event. Last player alive wins!</div></div>
            <ActionCard icon="🏆" title="Join Event" desc="Enter the last man standing event." actionLabel="Join" color="amber" />
            <ActionCard icon="📊" title="Alive Players" desc="See who's still in the event." actionLabel="View" />
            <ActionCard icon="💰" title="Prize Pool" desc="Current prize pool for the winner." actionLabel="View" color="green" />
          </div>}
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
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "general" && <div className="space-y-3">
            <ActionCard icon="📝" title="New Post" desc="Create a new forum post." actionLabel="Create" color="green" />
            <ActionCard icon="📢" title="Recent Posts" desc="View latest community discussions." actionLabel="View" />
            <ActionCard icon="🔥" title="Trending" desc="Most popular posts right now." actionLabel="View" color="red" />
          </div>}
          {tab === "sales" && <div className="space-y-3">
            <ActionCard icon="💰" title="List Item" desc="Sell items to other players." actionLabel="List" color="green" />
            <ActionCard icon="🛒" title="Browse Listings" desc="Find items for sale." actionLabel="Browse" />
            <ActionCard icon="📊" title="My Listings" desc="Manage your active listings." actionLabel="View" />
          </div>}
          {tab === "offtopic" && <div className="space-y-3">
            <ActionCard icon="💭" title="General Chat" desc="Talk about anything." actionLabel="View" />
            <ActionCard icon="🎮" title="Game Discussion" desc="Discuss strategies and tips." actionLabel="View" color="blue" />
          </div>}
          {tab === "shadows" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4 text-center"><div className="text-3xl mb-2">🌑</div><div className="text-sm font-bold text-slate-300">The Shadows</div><div className="text-[10px] text-slate-500">Secret forum. Only the initiated can post.</div></div>
          </div>}
          {tab === "search" && <div className="space-y-3">
            <input type="text" placeholder="Search forums..." className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 placeholder-slate-500" />
            <ActionCard icon="🔍" title="Search Results" desc="Find specific posts across all forums." actionLabel="Search" />
          </div>}
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
    { id: "lfg", label: "LFG", icon: "👥" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">💬</span><h2 className="text-2xl font-black text-amber-400">Chats Hub</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "global" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto"><div className="text-xs text-slate-500 text-center py-8">Chat with all online players</div></div>
            <div className="flex gap-2"><input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300" /><button className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold">Send</button></div>
          </div>}
          {tab === "crew" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto"><div className="text-xs text-slate-500 text-center py-8">Private crew chat</div></div>
            <div className="flex gap-2"><input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300" /><button className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold">Send</button></div>
          </div>}
          {tab === "family" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto"><div className="text-xs text-slate-500 text-center py-8">Family chat</div></div>
            <div className="flex gap-2"><input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300" /><button className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold">Send</button></div>
          </div>}
          {tab === "trade" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4 h-64 overflow-y-auto"><div className="text-xs text-slate-500 text-center py-8">Trade items with players</div></div>
            <div className="flex gap-2"><input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300" /><button className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold">Send</button></div>
          </div>}
          {tab === "lfg" && <div className="space-y-3">
            <ActionCard icon="👥" title="Looking for Group" desc="Find teammates for missions and heists." actionLabel="Join" color="green" />
            <ActionCard icon="📋" title="Available Groups" desc="See groups looking for members." actionLabel="View" />
          </div>}
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
    { id: "news", label: "News", icon: "📰" },
    { id: "map", label: "City Map", icon: "🗺️" },
    { id: "overview", label: "Overview", icon: "🏙️" },
    { id: "stats", label: "Statistics", icon: "📊" },
    { id: "world", label: "World", icon: "🌍" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🗺️</span><h2 className="text-2xl font-black text-amber-400">Quick Info</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "airport" && <div className="space-y-3">
            <ActionCard icon="✈️" title="Fly to Downtown" desc="Travel to downtown district. Cost: $5K" actionLabel="Fly" color="blue" />
            <ActionCard icon="✈️" title="Fly to Harbor" desc="Travel to harbor district. Cost: $8K" actionLabel="Fly" color="blue" />
            <ActionCard icon="✈️" title="Fly to Uptown" desc="Travel to uptown district. Cost: $10K" actionLabel="Fly" color="blue" />
            <ActionCard icon="🌍" title="International" desc="Fly to another city. Cost: $50K" actionLabel="Fly" color="purple" />
          </div>}
          {tab === "weather" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4 text-center"><div className="text-4xl mb-2">🌤️</div><div className="text-sm font-bold text-slate-200">Clear Sky</div><div className="text-[10px] text-slate-400">Normal crime success rates</div></div>
            <div className="grid grid-cols-2 gap-2"><StatCard icon="🌡️" label="Temp" value="72°F" /><StatCard icon="💨" label="Wind" value="5 mph" /></div>
          </div>}
          {tab === "news" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-3"><div className="text-xs font-bold text-amber-400">BREAKING</div><div className="text-sm text-slate-200">Major bank robbery downtown. Police investigating.</div><div className="text-[10px] text-slate-500 mt-1">2 hours ago</div></div>
            <div className="mafia-card rounded-xl p-3"><div className="text-xs font-bold text-slate-400">UPDATE</div><div className="text-sm text-slate-200">New crime syndicate detected in harbor district.</div><div className="text-[10px] text-slate-500 mt-1">5 hours ago</div></div>
          </div>}
          {tab === "map" && <div className="mafia-card rounded-xl p-6 text-center"><div className="text-4xl mb-2">🗺️</div><div className="text-sm font-bold text-slate-200">City Map</div><div className="text-[10px] text-slate-400">Explore districts and plan operations</div></div>}
          {tab === "overview" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="👥" label="Online" value="156" /><StatCard icon="💰" label="Economy" value="$2.5B" /><StatCard icon="🔥" label="Crime Rate" value="High" /></div>
          </div>}
          {tab === "stats" && <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2"><StatCard icon="🔪" label="Crimes" value="12.5K" /><StatCard icon="💀" label="Kills" value="3.2K" /><StatCard icon="💰" label="Earned" value="$890M" /></div>
          </div>}
          {tab === "world" && <div className="mafia-card rounded-xl p-6 text-center"><div className="text-4xl mb-2">🌍</div><div className="text-sm font-bold text-slate-200">World Map</div><div className="text-[10px] text-slate-400">See all available cities</div></div>}
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
    { id: "cyber", label: "Cyber Mon", icon: "💻" },
    { id: "black", label: "Black Fri", icon: "🛒" },
    { id: "tax", label: "Tax Season", icon: "📋" },
    { id: "spring", label: "Spring", icon: "🌸" },
    { id: "winter", label: "Winter", icon: "❄️" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">🎆</span><h2 className="text-2xl font-black text-amber-400">Seasonal Events</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "newyear" && <div className="space-y-3"><ActionCard icon="🎆" title="New Year's Heist" desc="Ring in the new year with a massive heist! 10x rewards." actionLabel="Join Event" color="amber" /><ActionCard icon="🎊" title="Firework Show" desc="Watch the fireworks for bonus XP." actionLabel="Watch" color="green" /></div>}
          {tab === "valentine" && <div className="space-y-3"><ActionCard icon="❤️" title="Valentine's Crime" desc="Love scams and heartbreak. 5x romance scam rewards." actionLabel="Join Event" color="red" /><ActionCard icon="🌹" title="Send Gift" desc="Send a gift to another player." actionLabel="Send" color="pink" /></div>}
          {tab === "patrick" && <div className="space-y-3"><ActionCard icon="☘️" title="St. Patrick's Gold" desc="Find leprechaun gold! Hidden rewards across the city." actionLabel="Hunt" color="green" /><ActionCard icon="🍺" title="Pub Crawl" desc="Visit all pubs for bonus rewards." actionLabel="Start" color="amber" /></div>}
          {tab === "easter" && <div className="space-y-3"><ActionCard icon="🥚" title="Easter Egg Hunt" desc="Find hidden Easter eggs with rare prizes!" actionLabel="Hunt" color="pink" /><ActionCard icon="🐰" title="Bunny Bonus" desc="Double XP during Easter weekend." actionLabel="Activate" color="green" /></div>}
          {tab === "summer" && <div className="space-y-3"><ActionCard icon="☀️" title="Summer Crime Wave" desc="Hot weather = hot crime. 3x crime rewards all summer!" actionLabel="Join Event" color="amber" /><ActionCard icon="🏖️" title="Beach Heist" desc="Rob the beachfront properties." actionLabel="Plan" color="blue" /></div>}
          {tab === "halloween" && <div className="space-y-3"><ActionCard icon="🎃" title="Halloween Horror" desc="Spooky events and terrifying challenges!" actionLabel="Join Event" color="orange" /><ActionCard icon="👻" title="Ghost Hunt" desc="Find ghosts for rare loot." actionLabel="Hunt" color="purple" /></div>}
          {tab === "christmas" && <div className="space-y-3"><ActionCard icon="🎄" title="Christmas Heist" desc="Steal presents from Santa's workshop!" actionLabel="Join Event" color="green" /><ActionCard icon="🎁" title="Gift Exchange" desc="Trade gifts with other players." actionLabel="Trade" color="red" /></div>}
          {tab === "cyber" && <div className="space-y-3"><ActionCard icon="💻" title="Cyber Monday" desc="Digital deals and hacking events. 5x fraud rewards." actionLabel="Join Event" color="blue" /><ActionCard icon="🖥️" title="Hack Challenge" desc="Complete hacking challenges for prizes." actionLabel="Start" color="purple" /></div>}
          {tab === "black" && <div className="space-y-3"><ActionCard icon="🛒" title="Black Friday Heist" desc="Ransack stores during the chaos! 3x robbery rewards." actionLabel="Join Event" color="red" /><ActionCard icon="🏷️" title="Doorbuster Deals" desc="Special items at half price." actionLabel="Shop" color="amber" /></div>}
          {tab === "tax" && <div className="space-y-3"><ActionCard icon="📋" title="Tax Season Scam" desc="Help players dodge taxes for a cut. 4x fraud rewards." actionLabel="Join Event" color="green" /><ActionCard icon="💰" title="Tax Evasion" desc="File false returns for bonus cash." actionLabel="Start" color="amber" /></div>}
          {tab === "spring" && <div className="space-y-3"><ActionCard icon="🌸" title="Spring Break Crime" desc="College students bring easy targets!" actionLabel="Join Event" color="pink" /><ActionCard icon="🎉" title="Party Heist" desc="Rob the spring break parties." actionLabel="Plan" color="amber" /></div>}
          {tab === "winter" && <div className="space-y-3"><ActionCard icon="❄️" title="Winter Wonderland" desc="Snowstorms create new criminal opportunities." actionLabel="Join Event" color="blue" /><ActionCard icon="⛷️" title="Ski Resort Heist" desc="Rob the luxury ski resorts." actionLabel="Plan" color="purple" /></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 10. SERVER EVENTS PAGE ═══════════ */
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
    { id: "empire", label: "Empire", icon: "👑" },
  ];
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">⚡</span><h2 className="text-2xl font-black text-amber-400">Server Events</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "purge" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-red-500/30 bg-red-900/10"><div className="text-sm font-bold text-red-400">💀 PURGE NIGHT — 24 HOURS OF LAWLESSNESS</div><div className="text-[10px] text-slate-400 mt-1">No police. Maximum chaos. All crime boosted!</div></div><ActionCard icon="💀" title="Join the Purge" desc="Enter the chaos. No rules apply." actionLabel="Join" color="red" /></div>}
          {tab === "bloodmoon" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-red-500/30 bg-red-900/10"><div className="text-sm font-bold text-red-400">🌑 BLOOD MOON — COMBAT x2 DAMAGE</div><div className="text-[10px] text-slate-400 mt-1">All combat damage doubled. Kills give 5x XP!</div></div><ActionCard icon="🌑" title="Hunt in the Blood Moon" desc="Maximum combat rewards." actionLabel="Hunt" color="red" /></div>}
          {tab === "robbers" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-slate-500/30 bg-slate-900/10"><div className="text-sm font-bold text-slate-300">🌙 ROBBER'S MOON — CRIME +20%</div><div className="text-[10px] text-slate-400 mt-1">All crimes have 20% better success rate!</div></div><ActionCard icon="🌙" title="Strike Under the Moon" desc="Enhanced crime success." actionLabel="Strike" color="slate" /></div>}
          {tab === "fullmoon" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-purple-500/30 bg-purple-900/10"><div className="text-sm font-bold text-purple-400">🌕 FULL MOON — ALL BOOSTS ACTIVE!</div><div className="text-[10px] text-slate-400 mt-1">Crime + Combat + Gambling all boosted!</div></div><ActionCard icon="🌕" title="Embrace the Full Moon" desc="Everything is boosted!" actionLabel="Embrace" color="purple" /></div>}
          {tab === "grandheist" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-amber-500/30 bg-amber-900/10"><div className="text-sm font-bold text-amber-400">🏦 GRAND HEIST — 10x BANK REWARDS</div><div className="text-[10px] text-slate-400 mt-1">Assemble your crew for the biggest heist!</div></div><ActionCard icon="🏦" title="Plan the Heist" desc="10x rewards on bank heists." actionLabel="Plan" color="amber" /></div>}
          {tab === "tournament" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-yellow-500/30 bg-yellow-900/10"><div className="text-sm font-bold text-yellow-400">🏆 TOURNAMENT — $500K PRIZE</div><div className="text-[10px] text-slate-400 mt-1">Server-wide PvP tournament. Winner takes all!</div></div><ActionCard icon="🏆" title="Enter Tournament" desc="Fight for the $500K prize." actionLabel="Enter" color="amber" /></div>}
          {tab === "familywar" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-orange-500/30 bg-orange-900/10"><div className="text-sm font-bold text-orange-400">⚔️ FAMILY WAR WEEK — 5x REPUTATION</div><div className="text-[10px] text-slate-400 mt-1">Alliances will be tested. Earn massive reputation.</div></div><ActionCard icon="⚔️" title="Declare Family War" desc="5x reputation from wars." actionLabel="Declare" color="orange" /></div>}
          {tab === "territory" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-green-500/30 bg-green-900/10"><div className="text-sm font-bold text-green-400">📍 TERRITORY TAKEOVER — +300% INCOME</div><div className="text-[10px] text-slate-400 mt-1">Fight for territory! Triple income from all areas.</div></div><ActionCard icon="📍" title="Capture Territory" desc="300% income boost." actionLabel="Capture" color="green" /></div>}
          {tab === "underground" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-red-500/30 bg-red-900/10"><div className="text-sm font-bold text-red-400">💣 UNDERGROUND CHAMPIONSHIP</div><div className="text-[10px] text-slate-400 mt-1">Best fighter wins massive underground prizes!</div></div><ActionCard icon="💣" title="Enter the Underground" desc="Fight for glory and prizes." actionLabel="Enter" color="red" /></div>}
          {tab === "empire" && <div className="space-y-3"><div className="mafia-card rounded-xl p-4 border border-amber-500/30 bg-amber-900/10"><div className="text-sm font-bold text-amber-400">👑 CRIME EMPIRE WEEK — 5x EMPIRE REWARDS</div><div className="text-[10px] text-slate-400 mt-1">All empire operations give 5x rewards!</div></div><ActionCard icon="👑" title="Build Your Empire" desc="5x empire rewards." actionLabel="Build" color="amber" /></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ 11. HELP PAGE ═══════════ */
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
      <div className="flex items-center gap-3"><span className="text-3xl">❓</span><h2 className="text-2xl font-black text-amber-400">Help Center</h2></div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
          {tab === "faq" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-1">How do I level up?</div><div className="text-xs text-slate-400">Gain XP by doing crimes, fighting, gambling, and completing missions.</div></div>
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-1">How do I join a crew?</div><div className="text-xs text-slate-400">Go to Social Hub, Crew, Find Crew to browse and join.</div></div>
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-1">How do I earn money?</div><div className="text-xs text-slate-400">Do crimes, complete missions, gamble, or run businesses.</div></div>
          </div>}
          {tab === "support" && <div className="space-y-3">
            <ActionCard icon="🆘" title="Submit Ticket" desc="Get help from the game administrators." actionLabel="Submit" color="blue" />
            <ActionCard icon="📋" title="My Tickets" desc="View your support ticket history." actionLabel="View" />
          </div>}
          {tab === "guidelines" && <div className="space-y-3">
            <div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-2">Community Guidelines</div><div className="text-xs text-slate-400 space-y-1"><div>1. No cheating or exploiting bugs</div><div>2. Be respectful to other players</div><div>3. No hate speech or harassment</div><div>4. Keep trade deals fair</div><div>5. Report rule-breakers</div></div></div>
          </div>}
          {tab === "reports" && <div className="space-y-3">
            <ActionCard icon="📢" title="Report Player" desc="Report a rule-breaking player." actionLabel="Report" color="red" />
            <ActionCard icon="📋" title="My Reports" desc="View your report history." actionLabel="View" />
          </div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

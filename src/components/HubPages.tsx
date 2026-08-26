console.log("[HubPages] Module loaded");
import React from "react";
import { useState } from "react";

/* ═══════════ INLINE HUB PAGES — No external deps ═══════════ */

function HubPage({ title, icon, tabs }: { title: string; icon: string; tabs: { id: string; label: string; icon: string; content: React.ReactNode }[] }) {
  const [tab, setTab] = useState(tabs[0]?.id || "");
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><span className="text-3xl">{icon}</span><h2 className="text-2xl font-black text-amber-400">{title}</h2></div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 " + (tab === t.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {tabs.find(t => t.id === tab)?.content}
      </div>
    </div>
  );
}

function HubCard({ icon, title, desc, btn, color }: { icon: string; title: string; desc: string; btn?: string; color?: string }) {
  const bg = color === "green" ? "from-green-600 to-green-700" : color === "red" ? "from-red-600 to-red-700" : color === "blue" ? "from-blue-600 to-blue-700" : color === "purple" ? "from-purple-600 to-purple-700" : "from-amber-600 to-amber-700";
  return (
    <div className="mafia-card rounded-xl p-4 flex items-center gap-3 hover:border-amber-500/20 transition-all">
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-200">{title}</div>
        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{desc}</div>
      </div>
      {btn && <button className={"shrink-0 px-3 py-1.5 bg-gradient-to-r " + bg + " text-white rounded-lg text-[10px] font-black transition-all shadow-lg active:scale-95"}>{btn}</button>}
    </div>
  );
}

function HubStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="mafia-card rounded-xl p-3 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-sm font-black text-amber-400">{value}</div>
    </div>
  );
}



export function EconomyHub() {
  return (<HubPage title="Economy Hub" icon="💰" tabs={[
      {id:"bank",label:"Bank",icon:"🏦",content:<div className="space-y-3"><div className="grid grid-cols-3 gap-2"><HubStat icon="🏦" label="Balance" value="$0" /><HubStat icon="📈" label="Interest" value="2.5%/day" /><HubStat icon="💰" label="Total Earned" value="$0" /></div><HubCard icon="💵" title="Deposit Cash" desc="Move cash from hand to bank. Earns interest daily." btn="Deposit" /><HubCard icon="🏧" title="Withdraw Cash" desc="Take money out of your bank account." btn="Withdraw" /><HubCard icon="📈" title="Upgrade Account" desc="Premium accounts earn more interest. Cost: $50K" btn="Upgrade" color="green" /></div>},
      {id:"robbery",label:"Robbery",icon:"💰",content:<div className="space-y-3"><HubCard icon="🏦" title="Convenience Store" desc="Easy target. $500-$2K reward. 30% police chance." btn="Rob" color="green" /><HubCard icon="🏦" title="Gas Station" desc="Medium difficulty. $1K-$5K reward." btn="Rob" color="amber" /><HubCard icon="🏦" title="Bank Vault" desc="High risk, massive reward. $10K-$50K." btn="Rob" color="red" /><HubCard icon="🏦" title="Casino Heist" desc="The big score. $50K-$200K. Requires crew." btn="Plan Heist" color="purple" /></div>},
      {id:"interest",label:"Interest",icon:"📈",content:<div className="space-y-3"><HubCard icon="📈" title="Check Interest" desc="See your accumulated interest." btn="Collect" color="green" /><HubCard icon="💎" title="Premium Rate" desc="Upgrade to 5% daily interest. Cost: $100K" btn="Upgrade" color="purple" /></div>},
      {id:"credit",label:"Credit",icon:"💳",content:<div className="space-y-3"><HubCard icon="💳" title="Take Loan" desc="Borrow up to $500K based on your credit score." btn="Apply" /><HubCard icon="📊" title="Improve Credit" desc="Pay off debts to improve your score." btn="Improve" color="green" /></div>},
      {id:"insurance",label:"Insurance",icon:"🏥",content:<div className="space-y-3"><HubCard icon="🏥" title="Health Insurance" desc="Reduces hospital costs by 50%. $10K/month." btn="Buy" color="green" /><HubCard icon="❤️" title="Life Insurance" desc="Get $100K payout when eliminated. $25K/month." btn="Buy" color="red" /><HubCard icon="🛡️" title="Property Insurance" desc="Protect your businesses from sabotage. $50K/month." btn="Buy" color="blue" /></div>},
      {id:"crypto",label:"Crypto",icon:"⛏️",content:<div className="space-y-3"><div className="grid grid-cols-2 gap-2"><HubStat icon="⛏️" label="Hash Rate" value="0 H/s" /><HubStat icon="💰" label="Balance" value="0 BTC" /></div><HubCard icon="⛏️" title="Start Mining" desc="Deploy a mining rig. Earns crypto passively." btn="Deploy" color="green" /><HubCard icon="📊" title="Trade Crypto" desc="Buy low, sell high on the crypto market." btn="Trade" /></div>},
      {id:"auto",label:"Auto Shop",icon:"🚗",content:<div className="space-y-3"><HubCard icon="🚗" title="Repair Vehicle" desc="Fix damage from recent jobs." btn="Repair" color="green" /><HubCard icon="🔧" title="Upgrade Engine" desc="Faster getaway. +10% escape chance." btn="Upgrade" color="amber" /><HubCard icon="🛡️" title="Add Armor" desc="Protect against drive-by attacks." btn="Install" color="blue" /></div>},
      {id:"offshore",label:"Offshore",icon:"🏝️",content:<div className="space-y-3"><HubCard icon="🏝️" title="Offshore Account" desc="Hide money where authorities can't touch it." btn="Open" color="green" /><HubCard icon="💵" title="Transfer Funds" desc="Move money offshore. 5% transfer fee." btn="Transfer" /><HubCard icon="🔒" title="Vault Upgrade" desc="Store more money safely." btn="Upgrade" color="amber" /></div>},
      {id:"spin",label:"Daily Spin",icon:"🎰",content:<div className="space-y-3"><HubCard icon="🎰" title="Spin the Wheel" desc="Win cash, items, or XP boosts!" btn="SPIN" /></div>},
      {id:"referral",label:"Referral",icon:"🔗",content:<div className="space-y-3"><HubCard icon="🔗" title="Your Referral Code" desc="Share your code. Earn $100K per recruit!" btn="Copy Code" color="green" /><HubCard icon="💰" title="Claim Commission" desc="Collect daily earnings from your recruits." btn="Claim" color="amber" /></div>},
      {id:"craft",label:"Crafting",icon:"🔧",content:<div className="space-y-3"><HubCard icon="🔧" title="Craft Weapon" desc="Combine materials to create powerful weapons." btn="Craft" color="red" /><HubCard icon="🛡️" title="Craft Armor" desc="Build protective gear from rare materials." btn="Craft" color="blue" /><HubCard icon="💊" title="Craft Consumables" desc="Create health packs and boosters." btn="Craft" color="green" /></div>}
    ]} />);
}

export function AssetsHub() {
  return (<HubPage title="Assets Hub" icon="📦" tabs={[
      {id:"garage",label:"Garage",icon:"🚗",content:<div className="space-y-3"><HubCard icon="🚗" title="Your Vehicles" desc="View and manage your stolen vehicles." btn="View" color="blue" /><HubCard icon="🔧" title="Sell Vehicle" desc="Sell a vehicle for cash." btn="Sell" color="amber" /><HubCard icon="🎨" title="Repaint Vehicle" desc="Change plates to avoid detection." btn="Repaint" color="purple" /></div>},
      {id:"items",label:"My Items",icon:"🎒",content:<div className="space-y-3"><HubCard icon="🎒" title="Inventory" desc="View all items you own." btn="View" color="blue" /><HubCard icon="💰" title="Sell Items" desc="Sell items for cash on the market." btn="Sell" color="amber" /><HubCard icon="📦" title="Open Mystery Box" desc="Chance for legendary items!" btn="Open" color="purple" /></div>},
      {id:"black",label:"Black Market",icon:"🖤",content:<div className="space-y-3"><HubCard icon="🔪" title="Weapons Dealer" desc="Buy illegal weapons. No questions asked." btn="Browse" color="red" /><HubCard icon="💊" title="Drug Supplier" desc="Bulk discounts on product." btn="Browse" color="purple" /><HubCard icon="📄" title="Fake Documents" desc="IDs, passports, licenses." btn="Buy" color="amber" /></div>},
      {id:"guards",label:"Bodyguards",icon:"🛡️",content:<div className="space-y-3"><HubCard icon="🛡️" title="Hire Bodyguard" desc="Personal protection. $50K/day." btn="Hire" color="blue" /><HubCard icon="💪" title="Upgrade Guards" desc="Better armor and weapons for your team." btn="Upgrade" color="green" /><HubCard icon="🏥" title="Heal Guards" desc="Restore your team to full health." btn="Heal" color="red" /></div>},
      {id:"boxes",label:"Mystery Boxes",icon:"📦",content:<div className="space-y-3"><HubCard icon="📦" title="Standard Box" desc="10% chance of rare item. $5K." btn="Buy $5K" color="amber" /><HubCard icon="📦" title="Premium Box" desc="25% chance of epic item. $25K." btn="Buy $25K" color="purple" /><HubCard icon="📦" title="Legendary Box" desc="50% chance of legendary. $100K." btn="Buy $100K" color="red" /></div>}
    ]} />);
}

export function SocialHub() {
  return (<HubPage title="Social Hub" icon="🤝" tabs={[
      {id:"crew",label:"Crew",icon:"🤝",content:<div className="space-y-3"><HubCard icon="🤝" title="Create Crew" desc="Start your own crew. Cost: $500K." btn="Create" color="green" /><HubCard icon="🔍" title="Find Crew" desc="Browse and join existing crews." btn="Search" color="blue" /><HubCard icon="👋" title="Leave Crew" desc="Leave your current crew." btn="Leave" color="red" /></div>},
      {id:"ranks",label:"Crew Ranks",icon:"📊",content:<div className="space-y-3"><HubCard icon="👑" title="Crew Leader" desc="Full control over crew decisions." btn="View" /><HubCard icon="⭐" title="Officer" desc="Can manage members and start wars." btn="View" color="amber" /><HubCard icon="👤" title="Member" desc="Standard crew member permissions." btn="View" color="blue" /></div>},
      {id:"bank",label:"Crew Bank",icon:"🏦",content:<div className="space-y-3"><HubCard icon="🏦" title="Crew Treasury" desc="Shared crew funds for operations." btn="View" color="amber" /><HubCard icon="💰" title="Donate" desc="Add funds to the crew bank." btn="Donate" color="green" /><HubCard icon="💸" title="Withdraw" desc="Request funds from crew bank." btn="Request" color="red" /></div>},
      {id:"war",label:"Crew War",icon:"⚔️",content:<div className="space-y-3"><HubCard icon="⚔️" title="Declare War" desc="Challenge another crew for territory." btn="Declare" color="red" /><HubCard icon="🛡️" title="Defend Territory" desc="Protect your turf from rival crews." btn="Defend" color="blue" /><HubCard icon="🏆" title="War History" desc="View past wars and victories." btn="View" /></div>},
      {id:"territory",label:"Territory",icon:"📍",content:<div className="space-y-3"><HubCard icon="📍" title="Claim Territory" desc="Take over a neighborhood." btn="Claim" color="green" /><HubCard icon="🗺️" title="Map View" desc="See all crew territories." btn="View" color="blue" /><HubCard icon="💰" title="Collect Tax" desc="Collect protection money from territories." btn="Collect" color="amber" /></div>},
      {id:"leaderboard",label:"Leaderboard",icon:"🏆",content:<div className="space-y-3"><HubCard icon="🏆" title="Crew Rankings" desc="See top crews on the server." btn="View" color="amber" /><HubCard icon="📊" title="Your Rank" desc="See where your crew stands." btn="View" color="blue" /><HubCard icon="🔥" title="War Wins" desc="Most successful crews in combat." btn="View" color="red" /></div>},
      {id:"family",label:"Family",icon:"👨‍👩‍👦",content:<div className="space-y-3"><HubCard icon="👨‍👩‍👦" title="Create Family" desc="Form a criminal dynasty. Cost: $2M." btn="Create" color="green" /><HubCard icon="🔍" title="Find Family" desc="Join an existing family." btn="Search" color="blue" /><HubCard icon="👑" title="Family Tree" desc="View family hierarchy." btn="View" /></div>}
    ]} />);
}

export function ProgressionHub() {
  return (<HubPage title="Progression Hub" icon="🧠" tabs={[
      {id:"skills",label:"Skill Tree",icon:"🧠",content:<div className="space-y-3"><HubCard icon="⚔️" title="Combat Skills" desc="Increase damage, accuracy, and crit chance." btn="Upgrade" color="red" /><HubCard icon="🥷" title="Stealth Skills" desc="Reduce detection chance on crimes." btn="Upgrade" color="purple" /><HubCard icon="💻" title="Hacking Skills" desc="Better success on digital crimes." btn="Upgrade" color="blue" /><HubCard icon="💪" title="Strength" desc="More damage in fights." btn="Upgrade" color="amber" /><HubCard icon="🏃" title="Speed" desc="Faster escapes, better evasion." btn="Upgrade" color="green" /></div>},
      {id:"prestige",label:"Prestige",icon:"⭐",content:<div className="space-y-3"><HubCard icon="⭐" title="Prestige Reset" desc="Reset level for permanent bonuses. Requires Level 100." btn="Prestige" color="purple" /><HubCard icon="🔮" title="Prestige Shop" desc="Buy exclusive items with prestige points." btn="Shop" color="amber" /><HubCard icon="📊" title="Prestige Level" desc="View your prestige progress." btn="View" color="blue" /></div>},
      {id:"titles",label:"Titles",icon:"👑",content:<div className="space-y-3"><HubCard icon="👑" title="Godfather" desc="Reach Level 100 to unlock." btn="Locked" /><HubCard icon="💀" title="The Reaper" desc="Get 500 kills to unlock." btn="Locked" /><HubCard icon="💰" title="Millionaire" desc="Earn $10M total to unlock." btn="Locked" /><HubCard icon="🔥" title="Crime Lord" desc="Complete 1000 crimes to unlock." btn="Locked" /></div>},
      {id:"achievements",label:"Achievements",icon:"🏅",content:<div className="space-y-3"><HubCard icon="🏅" title="First Blood" desc="Commit your first crime." btn="View" color="green" /><HubCard icon="🏅" title="War Hero" desc="Win 10 crew wars." btn="View" color="amber" /><HubCard icon="🏅" title="Untouchable" desc="Reach Wanted Level 20." btn="View" color="red" /></div>},
      {id:"legacy",label:"Legacy",icon:"📜",content:<div className="space-y-3"><HubCard icon="📜" title="Legacy Board" desc="See legendary players who came before." btn="View" color="amber" /><HubCard icon="🏆" title="Season History" desc="Past season winners and champions." btn="View" color="blue" /></div>},
      {id:"leaderboards",label:"Leaderboards",icon:"📊",content:<div className="space-y-3"><HubCard icon="📊" title="Level Board" desc="Top players by level." btn="View" color="amber" /><HubCard icon="💰" title="Money Board" desc="Richest players." btn="View" color="green" /><HubCard icon="💀" title="Kill Board" desc="Most dangerous players." btn="View" color="red" /></div>},
      {id:"pass",label:"Season Pass",icon:"🎫",content:<div className="space-y-3"><HubCard icon="🎫" title="Free Track" desc="Earn rewards as you play. 50 tiers." btn="View" color="green" /><HubCard icon="💎" title="Premium Track" desc="Exclusive rewards. Cost: $500K." btn="Buy" color="purple" /><HubCard icon="⭐" title="Daily Challenges" desc="Complete daily tasks for bonus XP." btn="View" color="amber" /></div>}
    ]} />);
}

export function SpecialHub() {
  return (<HubPage title="Special Hub" icon="👻" tabs={[
      {id:"ghost",label:"Ghost Mode",icon:"👻",content:<div className="space-y-3"><HubCard icon="👻" title="Activate Ghost Mode" desc="Invisible on the map for 1 hour. Cost: $5M." btn="Activate" color="purple" /><HubCard icon="👁️" title="Ghost Status" desc="See remaining ghost time." btn="View" color="blue" /></div>},
      {id:"secrets",label:"Secret Challenges",icon:"🔮",content:<div className="space-y-3"><HubCard icon="🔮" title="Daily Secret" desc="Complete a hidden objective for bonus rewards." btn="View" color="purple" /><HubCard icon="🏆" title="Weekly Secret" desc="Harder challenge, bigger payout." btn="View" color="amber" /><HubCard icon="🥚" title="Easter Egg" desc="Find hidden easter eggs across the game." btn="Hunt" color="green" /></div>},
      {id:"reputation",label:"Reputation",icon:"🌍",content:<div className="space-y-3"><HubCard icon="🌍" title="Reputation Points" desc="Build your reputation in the underworld." btn="View" color="amber" /><HubCard icon="⭐" title="Reputation Ranks" desc="Earn ranks from Street Rat to Shadow Emperor." btn="View" color="purple" /></div>},
      {id:"wanted",label:"Wanted Status",icon:"🔴",content:<div className="space-y-3"><HubCard icon="🔴" title="Current Wanted Level" desc="Check your current wanted status." btn="View" color="red" /><HubCard icon="💰" title="Bribe Officer" desc="Pay to reduce your wanted level." btn="Bribe" color="amber" /><HubCard icon="⚖️" title="Hire Lawyer" desc="Get a lawyer to reduce prison time." btn="Hire" color="blue" /></div>},
      {id:"prison",label:"Prison",icon:"🔒",content:<div className="space-y-3"><HubCard icon="🔒" title="Prison Status" desc="See your current sentence and time remaining." btn="View" color="red" /><HubCard icon="💰" title="Bail Out" desc="Pay bail to leave prison early." btn="Bail" color="amber" /><HubCard icon="🏗️" title="Prison Break" desc="Attempt to escape from prison." btn="Escape" color="purple" /><HubCard icon="💪" title="Prison Workouts" desc="Train while serving time." btn="Train" color="green" /></div>},
      {id:"arena",label:"Arena",icon:"🏟️",content:<div className="space-y-3"><HubCard icon="🏟️" title="Enter Arena" desc="Fight other players in the arena." btn="Enter" color="red" /><HubCard icon="🏆" title="Arena Rankings" desc="See the arena champions." btn="View" color="amber" /><HubCard icon="⚔️" title="Fight History" desc="View your arena fight record." btn="View" color="blue" /></div>},
      {id:"lms",label:"Last Man Standing",icon:"🏆",content:<div className="space-y-3"><HubCard icon="🏆" title="Last Man Standing" desc="Last 2 days before season wipe. Last player alive wins!" btn="Join" color="amber" /><HubCard icon="💀" title="Kill Count" desc="Most kills in LMS event." btn="View" color="red" /></div>}
    ]} />);
}

export function ForumsHub() {
  return (<HubPage title="Forums Hub" icon="📢" tabs={[
      {id:"general",label:"General",icon:"📢",content:<div className="space-y-3"><HubCard icon="📢" title="General Forum" desc="Discuss anything game-related." btn="View" color="blue" /><HubCard icon="📝" title="Create Post" desc="Share your thoughts with the community." btn="Create" color="green" /></div>},
      {id:"sales",label:"Sales",icon:"💰",content:<div className="space-y-3"><HubCard icon="💰" title="Sales Forum" desc="Buy, sell, and trade with other players." btn="View" color="amber" /><HubCard icon="📝" title="List Item" desc="Post an item for sale." btn="Create" color="green" /></div>},
      {id:"offtopic",label:"Off-Topic",icon:"💭",content:<div className="space-y-3"><HubCard icon="💭" title="Off-Topic" desc="Chat about anything outside the game." btn="View" color="blue" /></div>},
      {id:"shadows",label:"Shadows",icon:"🌑",content:<div className="space-y-3"><HubCard icon="🌑" title="Shadows Forum" desc="Secret discussions. VIP only." btn="View" color="purple" /></div>},
      {id:"search",label:"Search",icon:"🔍",content:<div className="space-y-3"><HubCard icon="🔍" title="Search Posts" desc="Find posts by keyword or player." btn="Search" color="blue" /></div>}
    ]} />);
}

export function ChatsHub() {
  return (<HubPage title="Chats Hub" icon="💬" tabs={[
      {id:"crew",label:"Crew Chat",icon:"💬",content:<div className="space-y-3"><HubCard icon="💬" title="Crew Chat" desc="Private chat for your crew members." btn="Open" color="blue" /></div>},
      {id:"family",label:"Family Chat",icon:"👨‍👩‍👦",content:<div className="space-y-3"><HubCard icon="👨‍👩‍👦" title="Family Chat" desc="Chat with your family dynasty." btn="Open" color="amber" /></div>},
      {id:"global",label:"Global Chat",icon:"🌐",content:<div className="space-y-3"><HubCard icon="🌐" title="Global Chat" desc="Talk to everyone on the server." btn="Open" color="green" /></div>},
      {id:"trade",label:"Trade Chat",icon:"💹",content:<div className="space-y-3"><HubCard icon="💹" title="Trade Chat" desc="Buy, sell, and negotiate with players." btn="Open" color="amber" /></div>},
      {id:"lfg",label:"Looking for Group",icon:"👥",content:<div className="space-y-3"><HubCard icon="👥" title="LFG Board" desc="Find players for crew wars and heists." btn="Open" color="red" /></div>}
    ]} />);
}

export function QuickinfoHub() {
  return (<HubPage title="Quick Info Hub" icon="🗺️" tabs={[
      {id:"airport",label:"Airport",icon:"✈️",content:<div className="space-y-3"><HubCard icon="✈️" title="Fly to City" desc="Travel between cities. Cost varies by distance." btn="Fly" color="blue" /><HubCard icon="📋" title="Flight Board" desc="See all available flights." btn="View" color="amber" /></div>},
      {id:"weather",label:"Weather",icon:"🌤️",content:<div className="space-y-3"><HubCard icon="🌤️" title="Current Weather" desc="Weather affects crime success rates." btn="View" color="blue" /><HubCard icon="🌧️" title="Forecast" desc="See upcoming weather changes." btn="View" color="amber" /></div>},
      {id:"news",label:"News Ticker",icon:"📰",content:<div className="space-y-3"><HubCard icon="📰" title="Latest News" desc="Server announcements and events." btn="View" color="amber" /><HubCard icon="📢" title="Breaking News" desc="Major events happening now." btn="View" color="red" /></div>},
      {id:"citymap",label:"City Map",icon:"🗺️",content:<div className="space-y-3"><HubCard icon="🗺️" title="City Map" desc="Explore the city and find targets." btn="View" color="green" /><HubCard icon="📍" title="Hotspots" desc="Areas with high activity." btn="View" color="red" /></div>},
      {id:"stats",label:"Statistics",icon:"📊",content:<div className="space-y-3"><HubCard icon="📊" title="Your Stats" desc="View your complete game statistics." btn="View" color="blue" /><HubCard icon="🏆" title="Server Stats" desc="Global game statistics." btn="View" color="amber" /></div>},
      {id:"world",label:"World Map",icon:"🌍",content:<div className="space-y-3"><HubCard icon="🌍" title="World Map" desc="See all territories and factions." btn="View" color="green" /><HubCard icon="⚔️" title="Active Conflicts" desc="Ongoing wars around the world." btn="View" color="red" /></div>}
    ]} />);
}

export function SeasonalHub() {
  return (<HubPage title="Seasonal Events Hub" icon="🎆" tabs={[
      {id:"newyear",label:"New Year",icon:"🎆",content:<div className="space-y-3"><HubCard icon="🎆" title="New Year's Heist" desc="Special New Year event! Fireworks + heists!" btn="Join" color="amber" /></div>},
      {id:"valentine",label:"Valentine",icon:"❤️",content:<div className="space-y-3"><HubCard icon="❤️" title="Valentine's Crime" desc="Crime of passion! Romance scams +5x payout!" btn="Join" color="red" /></div>},
      {id:"patrick",label:"St. Patrick",icon:"☘️",content:<div className="space-y-3"><HubCard icon="☘️" title="St. Patrick's Gold" desc="Gold rush! All rewards have gold bonus +100%!" btn="Join" color="green" /></div>},
      {id:"easter",label:"Easter",icon:"🥚",content:<div className="space-y-3"><HubCard icon="🥚" title="Easter Egg Hunt" desc="Find hidden eggs across cities for prizes!" btn="Join" color="purple" /></div>},
      {id:"summer",label:"Summer",icon:"☀️",content:<div className="space-y-3"><HubCard icon="☀️" title="Summer Crime Wave" desc="Summer heat brings crime heat! All crimes boosted!" btn="Join" color="amber" /></div>},
      {id:"halloween",label:"Halloween",icon:"🎃",content:<div className="space-y-3"><HubCard icon="🎃" title="Halloween Horror" desc="Spooky crimes pay 3x! Ghost mode free!" btn="Join" color="orange" /></div>},
      {id:"christmas",label:"Christmas",icon:"🎄",content:<div className="space-y-3"><HubCard icon="🎄" title="Christmas Heist" desc="Steal presents from Santa! Legendary loot!" btn="Join" color="green" /></div>},
      {id:"cyber",label:"Cyber Monday",icon:"💻",content:<div className="space-y-3"><HubCard icon="💻" title="Cyber Monday" desc="Hacking skills +5x. Digital crimes boosted!" btn="Join" color="blue" /></div>},
      {id:"blackfriday",label:"Black Friday",icon:"🛒",content:<div className="space-y-3"><HubCard icon="🛒" title="Black Friday Heist" desc="Everything on sale! Crime costs reduced 50%!" btn="Join" color="red" /></div>},
      {id:"tax",label:"Tax Season",icon:"📋",content:<div className="space-y-3"><HubCard icon="📋" title="Tax Season Scam" desc="Tax evasion +10x rewards! IRS is busy!" btn="Join" color="amber" /></div>},
      {id:"spring",label:"Spring Break",icon:"🌸",content:<div className="space-y-3"><HubCard icon="🌸" title="Spring Break Crime" desc="College town crime wave! Easy targets everywhere!" btn="Join" color="pink" /></div>},
      {id:"winter",label:"Winter",icon:"❄️",content:<div className="space-y-3"><HubCard icon="❄️" title="Winter Wonderland" desc="Blizzard = easy heists! Reduced patrols!" btn="Join" color="blue" /></div>}
    ]} />);
}

export function ServerEventsHub() {
  return (<HubPage title="Server Events" icon="⚡" tabs={[
      {id:"purge",label:"Purge Night",icon:"💀",content:<div className="space-y-3"><HubCard icon="💀" title="Purge Night" desc="24 hours of lawlessness. No police. Maximum chaos!" btn="Join" color="red" /></div>},
      {id:"bloodmoon",label:"Blood Moon",icon:"🌑",content:<div className="space-y-3"><HubCard icon="🌑" title="Blood Moon" desc="All combat damage doubled. Kills give 5x XP!" btn="Join" color="red" /></div>},
      {id:"robbers",label:"Robber's Moon",icon:"🌙",content:<div className="space-y-3"><HubCard icon="🌙" title="Robber's Moon" desc="Full moon = all crimes have 20% better success!" btn="Join" color="amber" /></div>},
      {id:"fullmoon",label:"Full Moon",icon:"🌕",content:<div className="space-y-3"><HubCard icon="🌕" title="Full Moon" desc="ALL boosts active! Crime + Combat + Gambling!" btn="Join" color="purple" /></div>},
      {id:"grandheist",label:"Grand Heist",icon:"🏦",content:<div className="space-y-3"><HubCard icon="🏦" title="Grand Heist" desc="Special heist event. 10x rewards on bank heists!" btn="Join" color="amber" /></div>},
      {id:"tournament",label:"Tournament",icon:"🏆",content:<div className="space-y-3"><HubCard icon="🏆" title="Tournament Championship" desc="Server-wide PvP tournament. Winner takes $500K!" btn="Join" color="red" /></div>},
      {id:"familywar",label:"Family War",icon:"⚔️",content:<div className="space-y-3"><HubCard icon="⚔️" title="Family War Week" desc="Family wars give 5x reputation!" btn="Join" color="red" /></div>},
      {id:"territory",label:"Territory",icon:"📍",content:<div className="space-y-3"><HubCard icon="📍" title="Territory Takeover" desc="Fight for territory! +300% income!" btn="Join" color="amber" /></div>},
      {id:"underground",label:"Underground",icon:"💣",content:<div className="space-y-3"><HubCard icon="💣" title="Underground Championship" desc="Underground tournament. Best fighter wins!" btn="Join" color="red" /></div>},
      {id:"empire",label:"Crime Empire",icon:"👑",content:<div className="space-y-3"><HubCard icon="👑" title="Crime Empire Week" desc="All empire operations +5x reward!" btn="Join" color="purple" /></div>}
    ]} />);
}

export function HelpHub() {
  return (<HubPage title="Help Center" icon="❓" tabs={[
      {id:"faq",label:"FAQ",icon:"❓",content:<div className="space-y-3"><div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-1">How do I level up?</div><div className="text-xs text-slate-400">Gain XP by doing crimes, fighting, gambling, and completing missions.</div></div><div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-1">How do I join a crew?</div><div className="text-xs text-slate-400">Go to Social Hub, Crew, Find Crew to browse and join.</div></div><div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-1">How do I earn money?</div><div className="text-xs text-slate-400">Do crimes, complete missions, gamble, or run businesses.</div></div></div>},
      {id:"support",label:"Support",icon:"🆘",content:<div className="space-y-3"><HubCard icon="🆘" title="Submit Ticket" desc="Get help from the game administrators." btn="Submit" color="blue" /><HubCard icon="📋" title="My Tickets" desc="View your support ticket history." btn="View" /></div>},
      {id:"guidelines",label:"Guidelines",icon:"📜",content:<div className="space-y-3"><div className="mafia-card rounded-xl p-4"><div className="text-sm font-bold text-amber-400 mb-2">Community Guidelines</div><div className="text-xs text-slate-400 space-y-1"><div>1. No cheating or exploiting bugs</div><div>2. Be respectful to other players</div><div>3. No hate speech or harassment</div><div>4. Keep trade deals fair</div><div>5. Report rule-breakers</div></div></div></div>},
      {id:"reports",label:"Reports",icon:"📢",content:<div className="space-y-3"><HubCard icon="📢" title="Report Player" desc="Report a rule-breaking player." btn="Report" color="red" /><HubCard icon="📋" title="My Reports" desc="View your report history." btn="View" /></div>}
    ]} />);
}

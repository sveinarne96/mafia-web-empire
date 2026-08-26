import React, { useState } from "react";

type NavigateFn = (page: string) => void;

interface TabDef {
  id: string;
  l: string;
  ic: string;
  d: string;
  pg?: string;
  items?: { icon: string; label: string; desc: string; page: string }[];
}

export function WorkingHub({ title, icon, tabs, navigate }: { title: string; icon: string; tabs: TabDef[]; navigate: NavigateFn }) {
  const [tab, setTab] = useState(tabs[0]?.id || "");
  const t = tabs.find(x => x.id === tab);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-black text-amber-400">{title}</h2>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(x => (
          <button key={x.id} onClick={() => setTab(x.id)}
            className={"px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 " + (tab === x.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400")}>
            <span className="mr-1">{x.ic}</span>{x.l}
          </button>
        ))}
      </div>
      {t && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-5 border border-amber-500/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{t.ic}</span>
              <div>
                <div className="text-lg font-black text-slate-200">{t.l}</div>
                <div className="text-xs text-slate-400">{t.d}</div>
              </div>
            </div>
            {t.pg && (
              <button onClick={() => navigate(t.pg!)} className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-sm font-black hover:from-amber-500 hover:to-amber-600 active:scale-95 transition-all shadow-lg mt-3">
                🔥 Open {t.l}
              </button>
            )}
          </div>
          {t.items && t.items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {t.items.map((item, i) => (
                <button key={i} onClick={() => navigate(item.page)}
                  className="mafia-card rounded-xl p-4 flex items-center gap-3 hover:border-amber-500/20 transition-all active:scale-95 text-left">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                  </div>
                  <span className="text-xs text-amber-400 shrink-0">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function getHubTabs(hub: string): TabDef[] {
  switch (hub) {
    case "economy": return [
      { id: "bank", l: "Bank", ic: "🏦", d: "Deposit & withdraw cash. Earn interest daily.", pg: "bank_account", items: [
        { icon: "💵", label: "Deposit Cash", desc: "Move cash from hand to bank", page: "bank_account" },
        { icon: "🏧", label: "Withdraw Cash", desc: "Take money out of your account", page: "bank_account" },
        { icon: "📈", label: "Interest Rates", desc: "See your daily interest rate", page: "interest_rates" },
      ]},
      { id: "robbery", l: "Robbery", ic: "💰", d: "Rob stores, banks, and heists for massive rewards.", items: [
        { icon: "🏪", label: "Convenience Store", desc: "Easy target, $500-$2K", page: "robbery" },
        { icon: "🏦", label: "Bank Vault", desc: "High risk, $10K-$50K", page: "robbery" },
        { icon: "🎰", label: "Casino Heist", desc: "The big score, $50K-$200K", page: "robbery" },
        { icon: "💣", label: "Armored Car", desc: "Intercept armored vehicles", page: "robbery" },
      ]},
      { id: "interest", l: "Interest", ic: "📈", d: "Earn passive income on your bank deposits.", pg: "interest_rates" },
      { id: "credit", l: "Credit", ic: "💳", d: "Take loans and build your credit score.", pg: "credit_score" },
      { id: "ins", l: "Insurance", ic: "🏥", d: "Protect yourself with health & life insurance.", items: [
        { icon: "🏥", label: "Health Insurance", desc: "Reduces hospital costs by 50%", page: "health_insurance" },
        { icon: "❤️", label: "Life Insurance", desc: "$500K payout when eliminated", page: "life_insurance" },
      ]},
      { id: "crypto", l: "Crypto", ic: "⛏️", d: "Mine and trade cryptocurrency for passive income.", pg: "crypto" },
      { id: "auto", l: "Auto Shop", ic: "🚗", d: "Repair and upgrade your getaway vehicles.", pg: "auto_shop" },
      { id: "offshore", l: "Offshore", ic: "🏝️", d: "Hide money in offshore accounts. Tax free.", pg: "offshore" },
      { id: "spin", l: "Daily Spin", ic: "🎰", d: "Spin the wheel once a day for prizes!", pg: "daily_spin" },
      { id: "ref", l: "Referral", ic: "🔗", d: "Recruit players and earn $100K per recruit!", pg: "referral" },
      { id: "craft", l: "Crafting", ic: "🔧", d: "Combine materials to create weapons & gear.", pg: "crafting" },
    ];
    case "assets": return [
      { id: "garage", l: "Garage", ic: "🚗", d: "Manage your stolen vehicles. Sell or upgrade.", pg: "garage", items: [
        { icon: "🚗", label: "View Vehicles", desc: "See all your stolen rides", page: "garage" },
        { icon: "💰", label: "Sell Vehicle", desc: "Cash out for quick money", page: "garage" },
        { icon: "🔧", label: "Upgrade Vehicle", desc: "Better engines, armor, paint", page: "auto_shop" },
      ]},
      { id: "items", l: "My Items", ic: "🎒", d: "Your inventory of weapons, gear, and supplies.", pg: "items", items: [
        { icon: "🎒", label: "View Inventory", desc: "See everything you own", page: "items" },
        { icon: "💰", label: "Sell Items", desc: "Sell for quick cash", page: "items" },
      ]},
      { id: "bm", l: "Black Market", ic: "🖤", d: "Buy illegal weapons, drugs, and contraband. Resets at midnight.", pg: "black_market", items: [
        { icon: "🔪", label: "Weapons Dealer", desc: "Knives, guns, explosives", page: "black_market" },
        { icon: "💊", label: "Drug Supplier", desc: "Bulk product, big profits", page: "black_market" },
        { icon: "📄", label: "Fake Documents", desc: "IDs, passports, licenses", page: "black_market" },
        { icon: "🧬", label: "Bio Enhancement", desc: "Chemical upgrades for your body", page: "black_market" },
        { icon: "🛡️", label: "Body Armor", desc: "Kevlar to titanium suits", page: "black_market" },
      ]},
      { id: "guards", l: "Bodyguards", ic: "🛡️", d: "Hire personal protection. Max 5 bodyguards.", pg: "bodyguards", items: [
        { icon: "🛡️", label: "Hire Bodyguard", desc: "Protection from attacks, $50K/day", page: "bodyguards" },
        { icon: "💪", label: "Upgrade Guards", desc: "Better armor and weapons", page: "bodyguards" },
        { icon: "🏥", label: "Heal Guards", desc: "Restore guards to full health", page: "bodyguards" },
      ]},
    ];
    case "social": return [
      { id: "crew", l: "Crew", ic: "🤝", d: "Create or join a criminal crew.", pg: "crew", items: [
        { icon: "🤝", label: "Create Crew", desc: "Start your own crew, $500K", page: "crew" },
        { icon: "🔍", label: "Find Crew", desc: "Browse and join existing crews", page: "crew" },
      ]},
      { id: "ranks", l: "Crew Ranks", ic: "📊", d: "Crew hierarchy: Leader → Officer → Member.", pg: "crew_ranks" },
      { id: "bank", l: "Crew Bank", ic: "🏦", d: "Shared crew funds for operations.", pg: "crew_bank" },
      { id: "war", l: "Crew War", ic: "⚔️", d: "Challenge rival crews for territory.", pg: "crew_war", items: [
        { icon: "⚔️", label: "Declare War", desc: "Challenge a rival crew", page: "crew_war" },
        { icon: "🛡️", label: "Defend Territory", desc: "Protect your turf", page: "crew_territory" },
        { icon: "🏆", label: "War History", desc: "View past wars", page: "crew_war" },
      ]},
      { id: "territory", l: "Territory", ic: "📍", d: "Claim neighborhoods for income.", pg: "crew_territory" },
      { id: "lb", l: "Leaderboard", ic: "🏆", d: "Top crew rankings.", pg: "crew_leaderboard" },
      { id: "family", l: "Family", ic: "👨‍👩‍👦", d: "Form a criminal dynasty.", pg: "family" },
    ];
    case "progression": return [
      { id: "skills", l: "Skill Tree", ic: "🧠", d: "Upgrade combat, stealth, and hacking skills.", pg: "skill_tree", items: [
        { icon: "⚔️", label: "Combat Skills", desc: "Damage, accuracy, crit", page: "combat_skills" },
        { icon: "🥷", label: "Stealth Skills", desc: "Lower detection chance", page: "stealth_skills" },
        { icon: "💻", label: "Hacking Skills", desc: "Digital crime success", page: "hacking_skills" },
      ]},
      { id: "prestige", l: "Prestige", ic: "⭐", d: "Reset for permanent bonuses at level 100.", pg: "prestige", items: [
        { icon: "⭐", label: "Prestige Reset", desc: "Requires Level 100", page: "prestige" },
        { icon: "🔮", label: "Prestige Shop", desc: "Exclusive items with prestige points", page: "prestige_shop" },
      ]},
      { id: "titles", l: "Titles", ic: "👑", d: "Unlock special titles by achieving goals.", pg: "titles" },
      { id: "achieve", l: "Achievements", ic: "🏅", d: "Complete challenges for rewards.", pg: "achievements" },
      { id: "legacy", l: "Legacy", ic: "📜", d: "Season history and legendary players.", pg: "legacy" },
      { id: "lb", l: "Leaderboards", ic: "📊", d: "Top players on the server.", pg: "leaderboards" },
      { id: "pass", l: "Season Pass", ic: "🎫", d: "Free + premium tracks with rewards.", pg: "season_pass" },
      { id: "energy", l: "Energy Drinks", ic: "🥤", d: "+25% XP boost for 12 hours.", pg: "energy_drinks" },
    ];
    case "special": return [
      { id: "ghost", l: "Ghost Mode", ic: "👻", d: "Invisible on map for 1 hour. Cost: $5M.", pg: "ghost_mode", items: [
        { icon: "👻", label: "Activate Ghost", desc: "Invisible for 1 hour", page: "ghost_mode" },
        { icon: "👁️", label: "Ghost Status", desc: "Check remaining time", page: "ghost_status" },
      ]},
      { id: "secrets", l: "Secret Challenges", ic: "🔮", d: "Hidden objectives for bonus rewards.", pg: "secret_daily", items: [
        { icon: "🔮", label: "Daily Secret", desc: "Hidden daily objective", page: "secret_daily" },
        { icon: "🏆", label: "Weekly Secret", desc: "Harder challenge, bigger payout", page: "secret_weekly" },
        { icon: "🥚", label: "Easter Eggs", desc: "Find hidden easter eggs", page: "secret_eggs" },
      ]},
      { id: "rep", l: "Reputation", ic: "🌍", d: "Build your reputation in the underworld.", pg: "reputation" },
      { id: "wanted", l: "Wanted Status", ic: "🔴", d: "Check your wanted level and threats.", pg: "wanted" },
      { id: "prison", l: "Prison", ic: "🔒", d: "Prison status, bail, and escape.", pg: "prison" },
      { id: "arena", l: "Arena", ic: "🏟️", d: "Fight other players for glory.", pg: "arena" },
      { id: "lms", l: "Last Man Standing", ic: "🏆", d: "Last alive wins the season!", pg: "last_man_standing" },
    ];
    case "forums": return [
      { id: "general", l: "General", ic: "📢", d: "Discuss anything game-related.", pg: "forum_general", items: [
        { icon: "📢", label: "General Forum", desc: "Discuss game strategies", page: "forum_general" },
        { icon: "📝", label: "Create Post", desc: "Share your thoughts", page: "forum_general" },
      ]},
      { id: "sales", l: "Sales", ic: "💰", d: "Buy, sell, and trade with players.", pg: "forum_sales" },
      { id: "offtopic", l: "Off-Topic", ic: "💭", d: "Chat about anything outside the game.", pg: "forum_offtopic" },
      { id: "shadows", l: "Shadows", ic: "🌑", d: "Secret discussions. VIP only.", pg: "forum_shadows" },
      { id: "search", l: "Search", ic: "🔍", d: "Find posts by keyword or player.", pg: "forum_search" },
    ];
    case "chats": return [
      { id: "crew", l: "Crew Chat", ic: "💬", d: "Private chat for your crew members.", pg: "crew_chat" },
      { id: "family", l: "Family Chat", ic: "👨‍👩‍👦", d: "Chat with your family dynasty.", pg: "family_chat" },
      { id: "global", l: "Global Chat", ic: "🌐", d: "Talk to everyone on the server.", pg: "global_chat" },
      { id: "trade", l: "Trade Chat", ic: "💹", d: "Buy, sell, and negotiate with players.", pg: "trade_chat" },
      { id: "lfg", l: "Looking for Group", ic: "👥", d: "Find players for crew wars and heists.", pg: "lfg" },
    ];
    case "quickinfo": return [
      { id: "airport", l: "Airport", ic: "✈️", d: "Travel between cities.", pg: "airport" },
      { id: "weather", l: "Weather", ic: "🌤️", d: "Weather affects crime success rates.", pg: "weather" },
      { id: "news", l: "News Ticker", ic: "📰", d: "Server announcements and events.", pg: "news_ticker" },
      { id: "map", l: "City Map", ic: "🗺️", d: "Explore the city and find targets.", pg: "city_map" },
      { id: "stats", l: "Statistics", ic: "📊", d: "Your complete game statistics.", pg: "statistics" },
      { id: "world", l: "World Map", ic: "🌍", d: "See all territories and factions.", pg: "world_map" },
    ];
    case "seasonal": return [
      { id: "ny", l: "New Year", ic: "🎆", d: "New Year's Heist! Fireworks + heists!", pg: "evt_newyear" },
      { id: "v", l: "Valentine", ic: "❤️", d: "Crime of passion! Romance scams +5x!", pg: "evt_valentine" },
      { id: "sp", l: "St. Patrick", ic: "☘️", d: "Gold rush! +100% gold bonus!", pg: "evt_patricks" },
      { id: "e", l: "Easter", ic: "🥚", d: "Find hidden eggs for prizes!", pg: "evt_easter" },
      { id: "su", l: "Summer", ic: "☀️", d: "Summer Crime Wave! All crimes boosted!", pg: "evt_summer" },
      { id: "h", l: "Halloween", ic: "🎃", d: "Spooky crimes pay 3x!", pg: "evt_halloween" },
      { id: "ch", l: "Christmas", ic: "🎄", d: "Steal presents from Santa!", pg: "evt_christmas" },
      { id: "cm", l: "Cyber Monday", ic: "💻", d: "Hacking skills +5x!", pg: "evt_cyber" },
      { id: "bf", l: "Black Friday", ic: "🛒", d: "Crime costs reduced 50%!", pg: "evt_blackfriday" },
      { id: "ts", l: "Tax Season", ic: "📋", d: "Tax evasion +10x rewards!", pg: "evt_tax" },
      { id: "sb", l: "Spring Break", ic: "🌸", d: "College town crime wave!", pg: "evt_spring" },
      { id: "ww", l: "Winter", ic: "❄️", d: "Blizzard = easy heists!", pg: "evt_winter" },
    ];
    case "server_events": return [
      { id: "purge", l: "Purge Night", ic: "💀", d: "24h of lawlessness! No police!", pg: "evt_purge" },
      { id: "blood", l: "Blood Moon", ic: "🌑", d: "All combat damage doubled!", pg: "evt_bloodmoon" },
      { id: "robbers", l: "Robber's Moon", ic: "🌙", d: "All crimes +20% success!", pg: "evt_robbersmoon" },
      { id: "full", l: "Full Moon", ic: "🌕", d: "ALL boosts active!", pg: "evt_fullmoon" },
      { id: "grand", l: "Grand Heist", ic: "🏦", d: "10x bank heist rewards!", pg: "evt_grandheist" },
      { id: "tourney", l: "Tournament", ic: "🏆", d: "Server-wide PvP tournament!", pg: "evt_tournament" },
      { id: "family", l: "Family War", ic: "⚔️", d: "5x reputation from wars!", pg: "evt_familywar" },
      { id: "territory", l: "Territory", ic: "📍", d: "+300% income!", pg: "evt_territory" },
      { id: "under", l: "Underground", ic: "💣", d: "Underground fighting tournament!", pg: "evt_underground" },
      { id: "empire", l: "Crime Empire", ic: "👑", d: "All empire ops +5x!", pg: "evt_empire" },
    ];
    case "help": return [
      { id: "faq", l: "FAQ", ic: "❓", d: "Frequently asked questions.", pg: "faq", items: [
        { icon: "❓", label: "How to earn money?", desc: "Do crimes, trade, gamble", page: "faq" },
        { icon: "❓", label: "How to level up?", desc: "Gain XP from crimes and fights", page: "faq" },
        { icon: "❓", label: "How does prison work?", desc: "Caught = 15 seconds in jail", page: "faq" },
      ]},
      { id: "support", l: "Support", ic: "🆘", d: "Get help from administrators.", pg: "support" },
      { id: "guidelines", l: "Guidelines", ic: "📜", d: "Community rules and guidelines.", pg: "community" },
      { id: "reports", l: "Reports", ic: "📢", d: "Report rule-breaking players.", pg: "reports" },
    ];
    default: return [];
  }
}

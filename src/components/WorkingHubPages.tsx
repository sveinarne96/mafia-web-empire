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
    case "underworld": return [
      { id: "witness", l: "Witness System", ic: "🔍", d: "Manage evidence, bribe & eliminate witnesses before the FBI connects the dots.", pg: "witness_system", items: [
        { icon: "👆", label: "Fingerprints", desc: "Decays in 72h — bribe or eliminate", page: "witness_system" },
        { icon: "🧬", label: "DNA Sample", desc: "Critical threat — destroy lab or plant fake", page: "witness_system" },
        { icon: "📹", label: "Security Footage", desc: "Hack or steal DVR before they review", page: "witness_system" },
        { icon: "🗣️", label: "Witness Testimony", desc: "Bribe, intimidate, or discredit", page: "witness_system" },
      ]},
      { id: "forensics", l: "Forensics Lab", ic: "🔬", d: "Advanced forensic analysis to solve (or cover up) crimes.", pg: "forensics_lab", items: [
        { icon: "🧬", label: "DNA Analysis", desc: "$15K — Identifies killer from blood", page: "forensics_lab" },
        { icon: "🔫", label: "Ballistics Report", desc: "$10K — Matches bullet to weapon", page: "forensics_lab" },
        { icon: "💻", label: "Digital Forensics", desc: "$20K — Recover deleted files", page: "forensics_lab" },
      ]},
      { id: "court", l: "Court System", ic: "⚖️", d: "Navigate the justice system — or buy your way out.", pg: "court_system", items: [
        { icon: "💰", label: "Post Bail", desc: "Pay bail to avoid pretrial detention", page: "court_system" },
        { icon: "👨‍⚖️", label: "Hire Lawyer", desc: "Better chances at acquittal", page: "court_system" },
        { icon: "⚖️", label: "Go To Trial", desc: "Risk it all in court", page: "court_system" },
      ]},
      { id: "crime_scene", l: "Crime Scene", ic: "🔎", d: "Collect evidence, crack cold cases, and frame rivals.", pg: "crime_scene" },
      { id: "spy", l: "Spy Network", ic: "🕵️", d: "Wiretaps, surveillance, plant evidence, run double agents.", pg: "spy_network", items: [
        { icon: "📞", label: "Wiretap", desc: "$10K — Listen for 24h", page: "spy_network" },
        { icon: "🛩️", label: "Surveillance Drone", desc: "$25K — Track movements 48h", page: "spy_network" },
        { icon: "🕵️", label: "Double Agent", desc: "$50K — Turn an enemy informant", page: "spy_network" },
      ]},
      { id: "informants", l: "Informants", ic: "🐀", d: "Buy intel from snitches, corrupt officials, stay ahead.", pg: "informants", items: [
        { icon: "🐦", label: "Inside Man", desc: "$5K — Police patrol routes", page: "informants" },
        { icon: "📞", label: "Corrupt Official", desc: "$8K — 911 call intercepts", page: "informants" },
        { icon: "🕵️", label: "Federal Agent", desc: "$50K — FBI investigation status", page: "informants" },
      ]},
    ];
    case "empire": return [
      { id: "property", l: "Property Empire", ic: "🏗️", d: "Buy, manage, and upgrade properties across the city.", pg: "property_empire", items: [
        { icon: "🏠", label: "Buy Property", desc: "Apartments, warehouses, mansions", page: "property_empire" },
        { icon: "⚠️", label: "Illegal Operations", desc: "Drug labs, chop shops, counterfeiting", page: "property_empire" },
        { icon: "🏡", label: "My Properties", desc: "Manage owned properties", page: "property_empire" },
      ]},
      { id: "vehicle", l: "Vehicle System", ic: "🚗", d: "Buy, modify, and upgrade your vehicle fleet.", pg: "vehicle_system", items: [
        { icon: "🏎️", label: "Dealership", desc: "Civic to Helicopter — every tier", page: "vehicle_system" },
        { icon: "🔧", label: "Modifications", desc: "Turbo, armor, nitrous, GPS jammer", page: "vehicle_system" },
        { icon: "⛽", label: "Refuel", desc: "Keep your rides running", page: "vehicle_system" },
      ]},
      { id: "business", l: "Business Mgmt", ic: "🏢", d: "Build your legitimate (and illegitimate) empire.", pg: "business_mgmt", items: [
        { icon: "🍕", label: "Buy Business", desc: "Pizza shops to casinos", page: "business_mgmt" },
        { icon: "👥", label: "Hire Staff", desc: "Employees increase income", page: "business_mgmt" },
        { icon: "⬆️", label: "Upgrade", desc: "Level up businesses for more income", page: "business_mgmt" },
      ]},
      { id: "underworld", l: "Underworld Econ", ic: "🏴", d: "Money laundering, loan sharking, bounty board.", pg: "underworld_econ" },
      { id: "market", l: "Market", ic: "📈", d: "Real-time commodity trading — buy low, sell high.", pg: "market_system", items: [
        { icon: "❄️", label: "Buy Low", desc: "Stock up when prices drop", page: "market_system" },
        { icon: "💰", label: "Sell High", desc: "Cash out when demand spikes", page: "market_system" },
        { icon: "📊", label: "Price Trends", desc: "Track commodity price changes", page: "market_system" },
      ]},
    ];
    case "power": return [
      { id: "faction", l: "Faction Warfare", ic: "⚔️", d: "Choose a faction, fight for territory, dominate the city.", pg: "faction_warfare", items: [
        { icon: "🇮🇹", label: "La Cosa Nostra", desc: "15% crime bonus, Heist crew", page: "faction_warfare" },
        { icon: "🇯🇵", label: "Yakuza", desc: "10% gambling bonus, Tattoo shop", page: "faction_warfare" },
        { icon: "🇷🇺", label: "Russian Bratva", desc: "20% smuggling bonus", page: "faction_warfare" },
        { icon: "🇲🇽", label: "The Cartel", desc: "25% drug bonus, Farm network", page: "faction_warfare" },
      ]},
      { id: "combat", l: "Advanced Combat", ic: "🥊", d: "Fighting styles, weapons, combo system, status effects.", pg: "advanced_combat", items: [
        { icon: "🥋", label: "Fighting Styles", desc: "Boxing, MMA, Muay Thai, Krav Maga", page: "advanced_combat" },
        { icon: "🔫", label: "Weapons Mastery", desc: "Melee and ranged proficiency", page: "advanced_combat" },
        { icon: "💥", label: "Combo System", desc: "Chain attacks for massive damage", page: "advanced_combat" },
      ]},
      { id: "crafting", l: "Crafting", ic: "🔨", d: "Craft weapons, tools, and gear from raw materials.", pg: "advanced_crafting", items: [
        { icon: "🦺", label: "Bulletproof Vest", desc: "Rare — +25 DEF", page: "advanced_crafting" },
        { icon: "🔫", label: "Silenced Pistol", desc: "Epic — +30 ATK, Stealth bonus", page: "advanced_crafting" },
        { icon: "📡", label: "EMP Device", desc: "Legendary — Disable all security", page: "advanced_crafting" },
      ]},
      { id: "pets", l: "Pet Companions", ic: "🐾", d: "Collect, level up, and equip powerful animal companions.", pg: "pet_system", items: [
        { icon: "🐺", label: "Shadow Wolf", desc: "Legendary — +20 ATK, +15% Stealth", page: "pet_system" },
        { icon: "🐈‍⬛", label: "Attack Cat", desc: "Epic — +15 ATK, Night Prowler", page: "pet_system" },
        { icon: "🛒", label: "Pet Shop", desc: "Buy new companions", page: "pet_system" },
      ]},
    ];
    case "world": return [
      { id: "daynight", l: "Day/Night Cycle", ic: "🌙", d: "Time and weather affect crime opportunities.", pg: "day_night", items: [
        { icon: "🌙", label: "Night Crimes", desc: "+20-40% crime bonuses after 8PM", page: "day_night" },
        { icon: "☀️", label: "Day Crimes", desc: "Street robberies, identity theft", page: "day_night" },
        { icon: "🌧️", label: "Weather Effects", desc: "Rain = less police, Snow = harder getaway", page: "day_night" },
      ]},
      { id: "events", l: "World Events", ic: "🌍", d: "Blackouts, protests, police strikes — changing the world.", pg: "world_events_dyn", items: [
        { icon: "⚡", label: "Blackouts", desc: "No cameras, easier crimes", page: "world_events_dyn" },
        { icon: "📢", label: "Protests", desc: "Chaos in the streets", page: "world_events_dyn" },
        { icon: "🚔", label: "Police Strike", desc: "Free reign for 24 hours", page: "world_events_dyn" },
      ]},
      { id: "reputation", l: "Reputation", ic: "🌟", d: "Build Street Cred, Notoriety, and Infamy.", pg: "reputation_influence" },
      { id: "coop", l: "Co-op Raids", ic: "🤝", d: "Team up for heists — find partners and split the loot.", pg: "coop_gameplay", items: [
        { icon: "🏦", label: "Bank Heist", desc: "3-player heist, $500K+ split", page: "coop_gameplay" },
        { icon: "💎", label: "Diamond Job", desc: "Steal gems with a partner", page: "coop_gameplay" },
        { icon: "👥", label: "Looking for Group", desc: "Find players for co-op missions", page: "coop_gameplay" },
      ]},
    ];
    case "empire_building": return [
      { id: "shell", l: "Shell Companies", ic: "🏢", d: "Launder money through legit businesses.", pg: "empire_building", items: [
        { icon: "🏢", label: "Front Holdings LLC", desc: "Generic shell — $25K/day wash", page: "empire_building" },
        { icon: "🚛", label: "North Star Logistics", desc: "Trucking front — $40K/day", page: "empire_building" },
        { icon: "📦", label: "Golden Imports", desc: "Import/export — $65K/day", page: "empire_building" },
      ]},
      { id: "realestate", l: "Real Estate", ic: "🏠", d: "Buy properties, collect rent.", pg: "empire_building" },
      { id: "invest", l: "Investments", ic: "📈", d: "Stocks, bonds, crypto.", pg: "empire_building" },
      { id: "franchise", l: "Franchises", ic: "🍔", d: "Own fast food chains, gyms.", pg: "empire_building" },
      { id: "import", l: "Import/Export", ic: "📦", d: "Smuggle goods legally.", pg: "empire_building" },
      { id: "flip", l: "Property Flip", ic: "🔨", d: "Buy cheap, renovate, sell.", pg: "empire_building" },
      { id: "landlord", l: "Landlord", ic: "🔑", d: "Collect rent, evict deadbeats.", pg: "empire_building" },
      { id: "storage", l: "Storage Auctions", ic: "🗄️", d: "Bid on units, find hidden gems.", pg: "empire_building" },
      { id: "vending", l: "Vending Routes", ic: "🥤", d: "Passive income from machines.", pg: "empire_building" },
      { id: "laundry", l: "Laundromats", ic: "🫧", d: "Classic money laundering front.", pg: "empire_building" },
    ];
    case "relationships": return [
      { id: "trust", l: "Trust System", ic: "🤝", d: "NPCs remember your actions.", pg: "relationships" },
      { id: "diplomacy", l: "Gang Diplomacy", ic: "🕊️", d: "Negotiate truces or wars.", pg: "relationships" },
      { id: "mentor", l: "Mentor System", ic: "🎓", d: "Train new players.", pg: "relationships" },
      { id: "betray", l: "Betrayal", ic: "🗡️", d: "Turn on allies for bounty.", pg: "relationships" },
      { id: "debt", l: "Personal Debt", ic: "💳", d: "Loans with interest.", pg: "relationships" },
      { id: "favors", l: "Favor Economy", ic: "🔄", d: "Call in favors later.", pg: "relationships" },
      { id: "informant", l: "Informant Loyalty", ic: "🐀", d: "Snitches flip back & forth.", pg: "relationships" },
      { id: "reputation", l: "Public Rep", ic: "🌟", d: "Affects shop prices & deals.", pg: "relationships" },
    ];
    case "survival": return [
      { id: "hospital", l: "Hospital", ic: "🏥", d: "Real recovery time & costs.", pg: "survival" },
      { id: "surgery", l: "Surgery", ic: "🔬", d: "Complications can reduce stats.", pg: "survival" },
      { id: "addiction", l: "Addiction", ic: "💊", d: "Alcohol, gambling, painkillers.", pg: "survival" },
      { id: "mental", l: "Mental Health", ic: "🧠", d: "Violence has consequences.", pg: "survival" },
      { id: "insurance_fraud", l: "Insurance Fraud", ic: "📄", d: "Fake accidents for payouts.", pg: "survival" },
      { id: "rehab", l: "Rehab", ic: "🏥", d: "Clean your addiction stat.", pg: "survival" },
      { id: "organ", l: "Organ Traffic", ic: "🫀", d: "Quick money, huge risk.", pg: "survival" },
      { id: "disposal", l: "Body Disposal", ic: "💀", d: "Cover up after hits.", pg: "survival" },
      { id: "evidence", l: "Evidence Destruction", ic: "🔥", d: "Erase your tracks.", pg: "survival" },
      { id: "costs", l: "Hospital Costs", ic: "💰", d: "See full cost breakdown.", pg: "survival" },
    ];
    case "security": return [
      { id: "guards", l: "Private Security", ic: "🛡️", d: "Hire armed protection.", pg: "security" },
      { id: "alarms", l: "Alarm Systems", ic: "🚨", d: "Protect properties from raids.", pg: "security" },
      { id: "safehouse", l: "Safe Houses", ic: "🏠", d: "Hideouts across the city.", pg: "security" },
      { id: "escape", l: "Escape Routes", ic: "🚪", d: "Pre-planned getaways.", pg: "security" },
      { id: "armor", l: "Body Armor", ic: "🦺", d: "Reduce damage in fights.", pg: "security" },
      { id: "permits", l: "Gun Permits", ic: "📋", d: "Legal carry — expensive.", pg: "security" },
      { id: "alibi", l: "Alibi System", ic: "🎭", d: "Proof you were elsewhere.", pg: "security" },
      { id: "safecrack", l: "Safe Cracking", ic: "🔐", d: "Vault difficulty → reward.", pg: "security" },
      { id: "lockpick", l: "Lockpick Skill", ic: "🔑", d: "Improves with practice.", pg: "security" },
      { id: "counter", l: "Counter-Surveillance", ic: "🕵️", d: "Find bugs & tails.", pg: "security" },
    ];
    default: return [];
  }
}

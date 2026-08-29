import { useState } from "react";
import { Search, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";

function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const faqs: { cat: string; icon: string; q: string; a: string }[] = [
    { cat: "General", icon: "🎮", q: "How do I start playing?", a: "Register with a nickname and class (Enforcer, Hustler, or Thief). You start with $700, Level 1. Head to the left menu to begin committing crimes and earning money." },
    { cat: "General", icon: "🎮", q: "How do I earn money?", a: "Commit crimes, sell items in Garage, trade on Stock Market, run Businesses, collect rent from Properties, gamble at Casino, complete Missions, or rob banks." },
    { cat: "General", icon: "🎮", q: "How do I level up?", a: "Gain XP from crimes, Arena fights, gambling, missions, daily logins. Each level: +10 ATK, +10 DEF, +75 HP, +1 Skill Point. XP needed = level x 100." },
    { cat: "General", icon: "🎮", q: "What are my stats?", a: "Right menu: Cash (spendable), Bank (safe), Points (premium), Life/HP, ATK, DEF, Level, XP, Reputation. Boost with items, upgrades, training." },
    { cat: "General", icon: "🎮", q: "What happens when I die?", a: "Limited time to revive at Hospital. If not, account resets. Visit Hospital for healing from basic bandages to nano-repair." },
    { cat: "Crimes", icon: "🔪", q: "How do crimes work?", a: "Pick a crime type. Success chance based on ATK, level, luck. Some have cooldowns. Higher-level crimes need more level but give more rewards." },
    { cat: "Crimes", icon: "🔪", q: "What is Murder?", a: "Choose targets, weapon (bare hands to C4), method (ambush, sniper, poison). Success: ATK vs DEF + weapon power + method bonuses. Leaves evidence." },
    { cat: "Crimes", icon: "🔪", q: "What is GTA Car Theft?", a: "Steal vehicles from streets. Higher-level cars harder but worth more. Cars go to Garage to sell or keep." },
    { cat: "Crimes", icon: "🔪", q: "What is the Black Market?", a: "Resets at midnight: weapons, drugs, fake documents, bio enhancements, body armor. Limited stock, $5K-$500K." },
    { cat: "Crimes", icon: "🔪", q: "How does Wanted Status work?", a: "Crimes increase wanted level (1-5). Higher = more police, harder escape, bigger bounties. Reduce by laying low, alibis, paying officials." },
    { cat: "Combat", icon: "⚔️", q: "How does the Arena work?", a: "Fight players. ATK vs DEF. Winner gets XP+cash, loser takes HP damage. Modes: 1v1, Crew Wars, Battle Royale, KOTH, Ambush." },
    { cat: "Combat", icon: "⚔️", q: "How do I increase ATK/DEF?", a: "Level up (+10 each), spend Skill Points, buy Body Armor, gym training, combat skills, equip weapons." },
    { cat: "Gambling", icon: "🎰", q: "How does the Casino work?", a: "20+ games: Blackjack, Roulette, Slots, Poker, Craps, Coin Flip, Horse Racing, Bingo, Keno. Some strategy, some luck." },
    { cat: "Gambling", icon: "🎰", q: "What is the Daily Spin?", a: "Once per day: cash, XP, items, boxes, or boosts. Resets midnight. Higher level = better prizes." },
    { cat: "Missions", icon: "📋", q: "How do Missions work?", a: "Unlimited cycling missions. Click DO to complete, Claim for rewards. Claim All on Finished tab. New cycles auto-start." },
    { cat: "Missions", icon: "📋", q: "What are Storyline Missions?", a: "6 arcs: Origins, Territory, Rivalry, Betrayal, FBI, Prison. Multiple chapters, increasing difficulty, massive rewards." },
    { cat: "Economy", icon: "💰", q: "How does the Bank work?", a: "Deposit cash for safety + interest. Rate = 5% + (level x 0.2%). Withdraw anytime." },
    { cat: "Economy", icon: "💰", q: "How does Crypto work?", a: "Mining (passive) and Trading (buy low, sell high). Prices change every few minutes." },
    { cat: "Economy", icon: "💰", q: "What are Offshore Accounts?", a: "Hide money from seizures. Higher levels = more storage, better privacy. Immune to theft." },
    { cat: "Economy", icon: "💰", q: "How does the Stock Market work?", a: "Buy/sell stocks. Prices fluctuate with events. Buy low, sell high. Some pay dividends." },
    { cat: "Economy", icon: "💰", q: "What is the Referral System?", a: "Share code. Recruits get $500K+250pts+2h boost. You earn $100K/recruit daily. Milestones at 5,10,25,50,100." },
    { cat: "Economy", icon: "💰", q: "How does Crafting work?", a: "Combine materials: Shiv ($500,+5ATK), Revolver ($3K,+15ATK), Vest ($3.5K,+15DEF). Materials from crimes/missions." },
    { cat: "Assets", icon: "📦", q: "What is the Garage?", a: "Vehicle collection from GTA. Sell cars or keep rare ones. Sell All Cars to liquidate." },
    { cat: "Assets", icon: "📦", q: "What are Bodyguards?", a: "Hire up to 5, $50K/day each. Defend attacks, reduce damage. Upgrade armor/weapons." },
    { cat: "Assets", icon: "📦", q: "What are Mystery Boxes?", a: "Random loot Common to Legendary. Standard, Premium, Legendary, Seasonal boxes." },
    { cat: "Social", icon: "🤝", q: "How do Crews work?", a: "Create/join for shared funds, territory, wars. Ranks: Leader to Member. Shared bank." },
    { cat: "Social", icon: "🤝", q: "How does Family work?", a: "Criminal dynasty. Share income, territory, Family Wars. Up to 10 members." },
    { cat: "Social", icon: "🤝", q: "How do I send messages?", a: "Click message icon on Online Players, or Direct Messages > Compose. Subject, body, recipient, send." },
    { cat: "Social", icon: "🤝", q: "What are Forums?", a: "General, Sales, Off-Topic, Shadows (VIP), Search. Create posts, reply." },
    { cat: "Social", icon: "🤝", q: "What are Chat channels?", a: "Crew, Family, Global, Trade, LFG. Each for different purposes." },
    { cat: "Progression", icon: "🧠", q: "How does the Skill Tree work?", a: "4 branches: Combat, Defense, Vitality, Criminal. 4 tiers each, increasing bonuses." },
    { cat: "Progression", icon: "🧠", q: "What is Prestige?", a: "Level 50+: reset to 1 for permanent multipliers + Prestige Shop items." },
    { cat: "Progression", icon: "🧠", q: "What are Titles?", a: "Godfather (Lv.80), Shadow Emperor (Lv.90), Iron Fist (1000 kills), etc." },
    { cat: "Progression", icon: "🧠", q: "What is the Season Pass?", a: "Free + Premium tracks. Earn XP to advance. Premium = exclusive items + bonus cash." },
    { cat: "Progression", icon: "🧠", q: "What are Energy Drinks?", a: "+25% XP: Red Bull($5K/30min), Monster($15K/1hr), Venom($50K/2hrs), Gold($200K/4hrs), Elixir($500K/8hrs)." },
    { cat: "Progression", icon: "🧠", q: "How do Achievements work?", a: "Complete challenges for cash, XP, or unique items. Combat, Crime, Social, Economy, Special." },
    { cat: "Special", icon: "👻", q: "How does Ghost Mode work?", a: "$5M for 1-hour invisibility. 24h cooldown." },
    { cat: "Special", icon: "👻", q: "What are Secret Challenges?", a: "Hidden daily/weekly objectives. Weekly harder, bigger payouts. Easter Eggs in game." },
    { cat: "Special", icon: "👻", q: "How does Reputation work?", a: "Build through crimes, fights, social. Affects shop prices, services, underworld standing." },
    { cat: "Special", icon: "👻", q: "How does Prison work?", a: "Caught = prison. Do jobs for rewards. Can escape with tools/skills. Guards patrol." },
    { cat: "Empire", icon: "🏗️", q: "What is Empire Building?", a: "Shell Companies, Real Estate, Investments, Franchises, Import/Export, Property Flip, Landlord, Storage, Vending, Laundromats." },
    { cat: "Empire", icon: "🏗️", q: "How do Shell Companies work?", a: "Launder money: Front Holdings($25K/day), Logistics($40K/day), Imports($65K/day)." },
    { cat: "Empire", icon: "🏗️", q: "How does Real Estate work?", a: "Buy properties, collect rent, upgrade for income. Permanent assets." },
    { cat: "Empire", icon: "🏗️", q: "How do Investments work?", a: "Bonds(3%), Stocks(5-15%), Crypto(0-25%). Returns compound daily." },
    { cat: "Relationships", icon: "🤝", q: "How does Trust work?", a: "NPCs remember. Build for discounts, intel. Betray = refused service or reports." },
    { cat: "Relationships", icon: "🤝", q: "How does Gang Diplomacy work?", a: "Truces, wars, alliances. Reputation + strength determine success. Wars give territory." },
    { cat: "Relationships", icon: "🤝", q: "What is Betrayal?", a: "Turn on allies for bounty. +Infamy, +cash, -permanent trust." },
    { cat: "Relationships", icon: "🤝", q: "How does Personal Debt work?", a: "Borrow from loan sharks/players. Interest daily. Default = reputation loss + attacks." },
    { cat: "Survival", icon: "💀", q: "How does the Hospital work?", a: "Tiers: Basic Bandage (cheap/slow) to Nano Repair (expensive/instant)." },
    { cat: "Survival", icon: "💀", q: "How does Surgery work?", a: "Permanent stat boosts with complication risks. Complications reduce stats." },
    { cat: "Survival", icon: "💀", q: "How does Addiction work?", a: "Alcohol, Gambling, Painkillers, Stimulants. Buffs then addiction. 30%+ = debuffs. Visit Rehab." },
    { cat: "Survival", icon: "💀", q: "How does Mental Health work?", a: "Stress, Paranoia, Guilt, Focus. Crimes raise them. Meditate, therapy, boxing to reduce." },
    { cat: "Survival", icon: "💀", q: "What is Insurance Fraud?", a: "Fake accidents for payouts. Policy lasts 48h. Risk: investigators catch you." },
    { cat: "Survival", icon: "💀", q: "What is Body Disposal?", a: "5 methods ($5K-$50K), last 7 days. Better = less evidence after hits." },
    { cat: "Survival", icon: "💀", q: "How does Evidence Destruction?", a: "5 methods ($5K-$100K), last 5 days. Erase fingerprints, DNA, footage, witnesses." },
    { cat: "Security", icon: "🛡️", q: "How does Private Security work?", a: "5 tiers ($5K-$2M), 24h active. Reduces damage, deters attackers." },
    { cat: "Security", icon: "🛡️", q: "How do Alarm Systems work?", a: "5 levels ($10K-$2M), 5 days. 10-90% raid defense." },
    { cat: "Security", icon: "🛡️", q: "How do Safe Houses work?", a: "5 hideout types. Each level +15% protection. Hide, store, recover HP." },
    { cat: "Security", icon: "🛡️", q: "How do Escape Routes work?", a: "5 levels, sequential. Better = higher escape success." },
    { cat: "Security", icon: "🛡️", q: "How does Body Armor work?", a: "5 tiers (30-150 durability). 5-80% damage reduction. Breaks when hit." },
    { cat: "Security", icon: "🛡️", q: "How do Gun Permits work?", a: "4 levels: Basic, Advanced, Class III, FFL. Sequential. Unlocks more weapons." },
    { cat: "Security", icon: "🛡️", q: "How does the Alibi System work?", a: "5 types ($50K-$500K), 7 days. Reduces sentence or gets you off." },
    { cat: "Security", icon: "🛡️", q: "How does Safe Cracking work?", a: "Level 10+ required. Vault difficulties with rewards. Depends on Lockpick skill." },
    { cat: "Security", icon: "🛡️", q: "How does Lockpick work?", a: "Levels with practice. Each level +3% crime success. Max level 10." },
    { cat: "Security", icon: "🛡️", q: "What is Counter-Surveillance?", a: "6 sweep types. Find bugs, tails. Protect from informants/LEA." },
    { cat: "Forums", icon: "📢", q: "What are Forum sections?", a: "General, Sales, Off-Topic, Shadows (VIP), Search." },
    { cat: "Chat", icon: "💬", q: "What Chat channels exist?", a: "Crew, Family, Global, Trade, Looking for Group." },
    { cat: "Quick Info", icon: "🗺️", q: "How does Airport/Travel work?", a: "10 cities: NY, LA, Chicago, Miami, Vegas, London, Tokyo, Berlin, Sydney, Dubai. Min level required." },
    { cat: "Quick Info", icon: "🗺️", q: "How does Weather affect gameplay?", a: "Rain = less police. Snow = harder getaway. Updates every few hours." },
    { cat: "Seasonal Events", icon: "🎆", q: "How do Seasonal Events work?", a: "12 yearly: New Year, Valentine, St Patrick, Easter, Summer, Halloween, Christmas, Cyber Monday, Black Friday, Tax Season, Spring Break, Winter." },
    { cat: "Server Events", icon: "⚡", q: "What are Server Events?", a: "Purge Night, Blood Moon, Robber's Moon, Full Moon, Grand Heist, Tournament, Family War, Territory, Underground, Crime Empire." },
    { cat: "Companies", icon: "🏢", q: "How do Companies work?", a: "200+ businesses, 9 categories: Food, Hospitality, Auto, Construction, Finance, Tech, Medical, Retail, Entertainment. Buy for passive income." },
    { cat: "Underworld", icon: "🕵️", q: "What is the Witness System?", a: "Bribe, destroy fingerprints, hack footage, eliminate testimony. Longer wait = more evidence." },
    { cat: "Underworld", icon: "🕵️", q: "How does the Forensics Lab work?", a: "DNA($15K), Ballistics($10K), Digital Forensics($20K). Solve or cover." },
    { cat: "Underworld", icon: "🕵️", q: "How does the Court System work?", a: "Post bail, hire lawyer, or trial. Better lawyers = higher acquittal." },
    { cat: "Underworld", icon: "🕵️", q: "What is the Spy Network?", a: "Wiretaps($10K/24h), Drones($25K/48h), Double Agents($50K)." },
    { cat: "Underworld", icon: "🕵️", q: "How do Informants work?", a: "Inside Man($5K), Corrupt Official($8K), Federal Agent($50K)." },
    { cat: "Empire", icon: "🏗️", q: "How does Property Empire work?", a: "Buy/manage/upgrade. Collect rent. Run illegal ops." },
    { cat: "Empire", icon: "🏗️", q: "How does the Vehicle System work?", a: "Dealership (civics to helicopters), modify (turbo/armor/nitrous), getaways." },
    { cat: "Empire", icon: "🏗️", q: "How does Business Management work?", a: "Buy businesses, hire staff, upgrade. Some are illegal fronts." },
    { cat: "Empire", icon: "🏗️", q: "What is the Market System?", a: "Real-time commodity trading. Buy low, sell high. Track trends." },
    { cat: "Power", icon: "⚔️", q: "How does Faction Warfare work?", a: "La Cosa Nostra (15% crime), Yakuza (10% gambling), Bratva (20% smuggling), Cartel (25% drugs)." },
    { cat: "Power", icon: "⚔️", q: "How does Advanced Combat work?", a: "Boxing, MMA, Muay Thai, Krav Maga. Weapons Mastery. Combos. Status effects." },
    { cat: "Power", icon: "⚔️", q: "What is Advanced Crafting?", a: "Vest(+25DEF), Silenced Pistol(+30ATK), EMP(disable security). Rare materials." },
    { cat: "Power", icon: "⚔️", q: "How do Pet Companions work?", a: "Shadow Wolf(+20ATK,+15%Stealth), Attack Cat(+15ATK). Fight alongside you." },
    { cat: "World", icon: "🌍", q: "How does Day/Night work?", a: "Night(+20-40% crimes after 8PM), day(street crimes), weather effects." },
    { cat: "World", icon: "🌍", q: "What are World Events?", a: "Blackouts(no cameras), Protests(chaos), Police Strike(24h free reign). Random." },
    { cat: "World", icon: "🌍", q: "How do Co-op Raids work?", a: "Bank Heist(3 players,$500K+split), Diamond Job. Find partners in LFG." },
  ];

  const categories = [...new Set(faqs.map(f => f.cat))];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><HelpCircle className="size-7 text-primary" /><h2 className="text-2xl font-bold">FAQ — Everything You Need to Know</h2></div>
      <div className="text-xs text-muted-foreground">Comprehensive guide to all game features. Click a question to expand.</div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        <button onClick={() => setFilter("All")} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 ${filter === "All" ? "bg-primary/20 border-primary/40 text-primary" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30"}`}>All ({faqs.length})</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 ${filter === c ? "bg-primary/20 border-primary/40 text-primary" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30"}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-1.5">
        {faqs.filter(f => filter === "All" || f.cat === filter).map((f, i) => (
          <div key={i} onClick={() => setOpenIdx(openIdx === i ? null : i)} className={`mafia-card rounded-xl p-3 cursor-pointer transition-all hover:border-primary/30 ${openIdx === i ? "border-primary/50 bg-primary/5" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="text-sm">{f.icon}</span>
              <span className="text-xs font-bold flex-1">{f.q}</span>
              <span className="text-xs text-muted-foreground">{openIdx === i ? "−" : "+"}</span>
            </div>
            {openIdx === i && <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">{f.a}</div>}
          </div>
        ))}
      </div>
      <div className="text-center text-[10px] text-muted-foreground py-2">Shadow Empire — {faqs.length} FAQ entries covering all game systems</div>
    </div>
  );
}
export { FAQPage };

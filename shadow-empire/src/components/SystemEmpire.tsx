import React, { useState } from "react";

/* ═══════════ SHARED HELPERS ═══════════ */
function SectionTitle({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-2xl font-black text-amber-400">{title}</h2>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

function TabBar({ tabs, active, onSelect }: { tabs: { id: string; icon: string; label: string }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${active === t.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400"}`}>
          <span className="mr-1">{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

function InfoCard({ icon, title, desc, stat, statLabel, color = "green" }: { icon: string; title: string; desc: string; stat?: string; statLabel?: string; color?: string }) {
  return (
    <div className="mafia-card rounded-xl p-4 border border-amber-500/10 hover:border-amber-500/20 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-200">{title}</div>
          <div className="text-[10px] text-slate-400 line-clamp-2">{desc}</div>
        </div>
      </div>
      {stat && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
          <span className="text-[10px] text-slate-500">{statLabel}</span>
          <span className={`text-xs font-bold text-${color}-400`}>{stat}</span>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, icon, cost, onClick, disabled, color = "amber" }: { label: string; icon: string; cost?: string; onClick: () => void; disabled?: boolean; color?: string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full px-4 py-3 bg-gradient-to-r from-${color}-600 to-${color}-700 text-white rounded-xl text-sm font-bold hover:from-${color}-500 hover:to-${color}-600 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}>
      {icon} {label}{cost ? ` — ${cost}` : ""}
    </button>
  );
}

/* ═══════════════════════════════════════════
   🏗️ EMPIRE BUILDING
   ═══════════════════════════════════════════ */

const shellCompanies = [
  { name: "Front Holdings LLC", icon: "🏢", cost: 500000, income: 25000, desc: "Generic shell company — washes $25K/day" },
  { name: "North Star Logistics", icon: "🚛", cost: 750000, income: 40000, desc: "Trucking front — legit freight + hidden contraband" },
  { name: "Golden Imports", icon: "📦", cost: 1200000, income: 65000, desc: "Import/export — mix legal goods with smuggling" },
  { name: "Pinnacle Consulting", icon: "💼", cost: 2000000, income: 100000, desc: "Management consulting — invoices for ghost work" },
  { name: "Atlas Financial Group", icon: "🏦", cost: 5000000, income: 250000, desc: "Investment firm — washes millions through shell funds" },
  { name: "Pacific Rim Trading", icon: "🌏", cost: 10000000, income: 500000, desc: "International trade corp — global laundry network" },
];

const realEstate = [
  { name: "1BR Apartment", icon: "🏠", cost: 100000, income: 5000, desc: "Modest rental unit — steady passive income" },
  { name: "Duplex", icon: "🏘️", cost: 300000, income: 18000, desc: "Two units — double the rent" },
  { name: "Office Suite", icon: "🏢", cost: 750000, income: 45000, desc: "Commercial space in downtown core" },
  { name: "Warehouse", icon: "🏭", cost: 1500000, income: 80000, desc: "Industrial storage — used for operations too" },
  { name: "Shopping Mall Unit", icon: "🏬", cost: 3000000, income: 150000, desc: "Prime retail space with high foot traffic" },
  { name: "Luxury Penthouse", icon: "🏰", cost: 8000000, income: 400000, desc: "Penthouse suite — VIP meetups + passive income" },
  { name: "Commercial Block", icon: "🏗️", cost: 15000000, income: 750000, desc: "Entire city block — massive rental empire" },
];

const investments = [
  { name: "Savings Account", icon: "💰", cost: 50000, rate: "3%", desc: "Safe but slow — 3% annual return" },
  { name: "Index Fund", icon: "📊", cost: 200000, rate: "8%", desc: "Market tracking — 8% avg annual return" },
  { name: "Bond Portfolio", icon: "📜", cost: 500000, rate: "5%", desc: "Government bonds — stable 5% yield" },
  { name: "Crypto Staking", icon: "🪙", cost: 1000000, rate: "12%", desc: "Stake crypto — 12% APY but volatile" },
  { name: "Hedge Fund", icon: "📈", cost: 5000000, rate: "18%", desc: "Aggressive strategy — 18% avg with risk" },
  { name: "Private Equity", icon: "💎", cost: 20000000, rate: "25%", desc: "Buy companies, improve, sell — 25% returns" },
];

const franchises = [
  { name: "Pizza Chain", icon: "🍕", cost: 200000, income: 12000, desc: "Franchise a pizza brand — 5 locations" },
  { name: "Coffee Brand", icon: "☕", cost: 350000, income: 22000, desc: "Hipster coffee franchise — high margin" },
  { name: "Gym Franchise", icon: "🏋️", cost: 600000, income: 35000, desc: "Fitness chain — monthly memberships" },
  { name: "Car Wash Chain", icon: "🚿", cost: 800000, income: 50000, desc: "Automated car wash — great laundering front" },
  { name: "Fast Food Empire", icon: "🍔", cost: 1500000, income: 90000, desc: "Multi-location fast food — massive volume" },
  { name: "Ice Cream Parlor", icon: "🍦", cost: 150000, income: 8000, desc: "Family-friendly front — low overhead" },
];

const importExport = [
  { name: "Furniture Import", icon: "🪑", cost: 300000, income: 18000, desc: "Import furniture — hidden compartments in shipping" },
  { name: "Wine Import", icon: "🍷", cost: 500000, income: 30000, desc: "Premium wine shipments — some bottles hold more" },
  { name: "Electronics Export", icon: "📱", cost: 800000, income: 50000, desc: "Ship electronics — mix legit and stolen goods" },
  { name: "Textile Trade", icon: "🧵", cost: 1200000, income: 70000, desc: "Fabric shipments — bulk concealment" },
  { name: "Rare Art Export", icon: "🎨", cost: 5000000, income: 200000, desc: "Art dealing — high value, low scrutiny" },
];

const propertyFlipping = [
  { name: "Fixer-Upper", icon: "🔨", cost: 50000, profit: "60%", desc: "Buy cheap, renovate for $20K, sell for $120K" },
  { name: "Foreclosure", icon: "🏚️", cost: 150000, profit: "80%", desc: "Bank auction deal — renovate and flip" },
  { name: "Fire Damage", icon: "🔥", cost: 80000, profit: "100%", desc: "Burned property — fix structure, resell" },
  { name: "Abandoned Lot", icon: "🏗️", cost: 300000, profit: "150%", desc: "Build from scratch — maximum profit" },
  { name: "Luxury Renovation", icon: "✨", cost: 1000000, profit: "120%", desc: "High-end remodel — granite, marble, smart home" },
];

const landlord = [
  { name: "Tenant Collect", icon: "💵", desc: "Collect monthly rent from all tenants — auto every 24h" },
  { name: "Evict Deadbeat", icon: "🚪", desc: "Remove non-paying tenant — costs $5K legal fee" },
  { name: "Upgrade Units", icon: "⬆️", desc: "Renovate apartments — +20% rent per upgrade" },
  { name: "Screen Tenants", icon: "🔍", desc: "Background check — avoid troublemakers" },
  { name: "Rent Increase", icon: "📈", desc: "Raise rent — risk vacancy for higher income" },
];

const storageFlipping = [
  { name: "Small Unit", icon: "📦", cost: 10000, desc: "5x5 unit — chance of junk or hidden gems" },
  { name: "Medium Unit", icon: "🗄️", cost: 25000, desc: "10x10 unit — better odds for valuables" },
  { name: "Large Unit", icon: "🏪", cost: 75000, desc: "10x20 unit — possible antiques, electronics" },
  { name: "Premium Unit", icon: "💎", cost: 200000, desc: "Climate-controlled — high-value contents" },
];

const vendingRoutes = [
  { name: "Single Machine", icon: "🥤", cost: 5000, income: 500, desc: "Place one machine — $500/day passive" },
  { name: "5-Machine Route", icon: "🚰", cost: 25000, income: 3000, desc: "5 locations — $3K/day combined" },
  { name: "20-Machine Route", icon: "🏭", cost: 100000, income: 15000, desc: "20 machines across the city" },
  { name: "Full Network", icon: "🌐", cost: 500000, income: 80000, desc: "100+ machines — vending empire" },
];

const laundromats = [
  { name: "Corner Laundromat", icon: "🫧", cost: 100000, income: 8000, desc: "Small shop — washes $8K/day" },
  { name: "24hr Laundromat", icon: "⏰", cost: 300000, income: 25000, desc: "Never closes — higher throughput" },
  { name: "Dry Cleaners", icon: "👔", cost: 500000, income: 40000, desc: "Premium cleaning — upscale front" },
  { name: "Laundromat Chain", icon: "🔗", cost: 2000000, income: 150000, desc: "10 locations — major laundry network" },
];

function EmpireBuildingPage({ player }: { player: any }) {
  const [tab, setTab] = useState("shell");
  const [msg, setMsg] = useState("");
  const tabs = [
    { id: "shell", icon: "🏢", label: "Shell Companies" },
    { id: "realestate", icon: "🏠", label: "Real Estate" },
    { id: "invest", icon: "📈", label: "Investments" },
    { id: "franchise", icon: "🍔", label: "Franchises" },
    { id: "import", icon: "📦", label: "Import/Export" },
    { id: "flip", icon: "🔨", label: "Property Flip" },
    { id: "landlord", icon: "🔑", label: "Landlord" },
    { id: "storage", icon: "🗄️", label: "Storage Auctions" },
    { id: "vending", icon: "🥤", label: "Vending Routes" },
    { id: "laundry", icon: "🫧", label: "Laundromats" },
  ];

  const renderItem = (item: any, owned?: boolean) => (
    <div key={item.name} className={`mafia-card rounded-xl p-4 border transition-all ${owned ? "border-green-500/30" : "border-amber-500/10 hover:border-amber-500/20"}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-200">{item.name}</div>
          <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
        <span className="text-[10px] text-slate-500">{item.cost ? `$${item.cost.toLocaleString()}` : ""}{item.income ? ` → $${item.income.toLocaleString()}/day` : ""}{item.rate ? ` → ${item.rate}` : ""}{item.profit ? ` → ${item.profit} profit` : ""}</span>
        {!owned && (
          <button onClick={() => { setMsg(`Purchased ${item.name}!`); setTimeout(() => setMsg(""), 3000); }}
            className="px-3 py-1 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-[10px] font-bold hover:bg-green-600/30 transition">
            Buy ${(item.cost || 0).toLocaleString()}
          </button>
        )}
        {owned && <span className="text-[10px] text-green-400 font-bold">✓ Owned</span>}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <SectionTitle icon="🏗️" title="Empire Building" sub="Build your criminal business empire across the city" />
      {msg && <div className="px-4 py-2 bg-green-600/20 border border-green-500/40 rounded-xl text-xs text-green-300 text-center">{msg}</div>}
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tab === "shell" && shellCompanies.map(i => renderItem(i))}
        {tab === "realestate" && realEstate.map(i => renderItem(i))}
        {tab === "invest" && investments.map(i => renderItem(i))}
        {tab === "franchise" && franchises.map(i => renderItem(i))}
        {tab === "import" && importExport.map(i => renderItem(i))}
        {tab === "flip" && propertyFlipping.map(i => renderItem(i))}
        {tab === "landlord" && landlord.map(i => renderItem(i))}
        {tab === "storage" && storageFlipping.map(i => renderItem(i))}
        {tab === "vending" && vendingRoutes.map(i => renderItem(i))}
        {tab === "laundry" && laundromats.map(i => renderItem(i))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   🤝 RELATIONSHIPS & LOYALTY
   ═══════════════════════════════════════════ */

function RelationshipsPage({ player }: { player: any }) {
  const [tab, setTab] = useState("trust");
  const [msg, setMsg] = useState("");
  const tabs = [
    { id: "trust", icon: "🤝", label: "Trust System" },
    { id: "diplomacy", icon: "🕊️", label: "Gang Diplomacy" },
    { id: "mentor", icon: "🎓", label: "Mentor System" },
    { id: "betray", icon: "🗡️", label: "Betrayal" },
    { id: "debt", icon: "💳", label: "Personal Debt" },
    { id: "favors", icon: "🔄", label: "Favor Economy" },
    { id: "informant", icon: "🐀", label: "Informant Loyalty" },
    { id: "reputation", icon: "🌟", label: "Public Rep" },
  ];

  const npcs = [
    { name: "Sal the Cook", trust: 85, mood: "Loyal", icon: "👨‍🍳" },
    { name: "Viktor the Enforcer", trust: 60, mood: "Neutral", icon: "💪" },
    { name: "Tony Two-Times", trust: 30, mood: "Suspicious", icon: "🐍" },
    { name: "Maria the Lawyer", trust: 95, mood: "Devoted", icon: "👩‍⚖️" },
    { name: "Old Man Castellano", trust: 45, mood: "Wary", icon: "👴" },
    { name: "Rico the Rat", trust: 10, mood: "Hostile", icon: "🐀" },
  ];

  const gangs = [
    { name: "La Cosa Nostra", status: "Allied", rep: 75, icon: "🇮🇹" },
    { name: "Yakuza", status: "Neutral", rep: 50, icon: "🇯🇵" },
    { name: "Russian Bratva", status: "At War", rep: 20, icon: "🇷🇺" },
    { name: "The Cartel", status: "Truce", rep: 60, icon: "🇲🇽" },
    { name: "Triads", status: "Neutral", rep: 45, icon: "🇨🇳" },
    { name: "Bikers MC", status: "Allied", rep: 80, icon: "🏍️" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <SectionTitle icon="🤝" title="Relationships & Loyalty" sub="Manage alliances, debts, and the people who work for you" />
      {msg && <div className="px-4 py-2 bg-amber-600/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 text-center">{msg}</div>}
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {tab === "trust" && (
        <div className="space-y-3">
          {npcs.map(n => (
            <div key={n.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{n.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{n.name}</div>
                  <div className="text-[10px] text-slate-400">Mood: {n.mood}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">{n.trust}%</div>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${n.trust}%`, background: n.trust > 70 ? "#22c55e" : n.trust > 40 ? "#eab308" : "#ef4444" }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-slate-800/50">
                <button onClick={() => setMsg(`Bribed ${n.name} — trust +10`)} className="flex-1 px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold">Bribe $10K</button>
                <button onClick={() => setMsg(`Threatened ${n.name} — trust +5 but risk`) } className="flex-1 px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold">Threaten</button>
                <button onClick={() => setMsg(`Gifted ${n.name} — trust +15`)} className="flex-1 px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">Gift $25K</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "diplomacy" && (
        <div className="space-y-3">
          {gangs.map(g => (
            <div key={g.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{g.name}</div>
                  <div className={`text-[10px] font-bold ${g.status === "Allied" ? "text-green-400" : g.status === "At War" ? "text-red-400" : "text-slate-400"}`}>{g.status}</div>
                </div>
                <div className="text-xs text-amber-400">{g.rep} rep</div>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-slate-800/50">
                <button onClick={() => setMsg(`Proposed truce with ${g.name}`)} className="flex-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-[10px] font-bold">Propose Truce</button>
                <button onClick={() => setMsg(`Declared war on ${g.name}!`)} className="flex-1 px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold">Declare War</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "mentor" && (
        <div className="space-y-3">
          <InfoCard icon="🎓" title="Recruit Protege" desc="Find a new player to mentor — bonus XP when they level up" />
          <InfoCard icon="📚" title="Training Session" desc="Teach combat/stealth/hacking skills to your protege" />
          <InfoCard icon="🏆" title="Mentor Achievements" desc="Unlock rewards when your protege reaches milestones" />
          <InfoCard icon="💰" title="Profit Sharing" desc="Your protege gives you 10% of their earnings" />
          <InfoCard icon="⚔️" title="Joint Operations" desc="Run crimes together for +25% success rate" />
        </div>
      )}

      {tab === "betray" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-red-500/20">
            <div className="text-sm font-bold text-red-400 mb-2">⚠️ Betrayal System</div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>• Turning on an ally places a bounty on their head</div>
              <div>• You receive 50% of the bounty value</div>
              <div>• Your reputation drops significantly</div>
              <div>• Betrayed players can place counter-bounties</div>
              <div>• Other players may refuse to work with you</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {npcs.filter(n => n.trust > 40).map(n => (
              <div key={n.name} className="mafia-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{n.icon}</span>
                  <div className="text-sm font-bold text-slate-200">{n.name}</div>
                </div>
                <button onClick={() => setMsg(`Betrayed ${n.name} — bounty placed!`)}
                  className="w-full px-3 py-2 bg-red-600/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold hover:bg-red-600/30 transition">
                  🗡️ Betray (${(n.trust * 1000).toLocaleString()} bounty)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "debt" && (
        <div className="space-y-3">
          <InfoCard icon="💳" title="Outstanding Debts" stat="$125,000" statLabel="owed to you" color="green" desc="Players who borrowed from you and haven't repaid" />
          <InfoCard icon="📉" title="Your Debts" stat="$0" statLabel="you owe" color="red" desc="Outstanding loans you've taken" />
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-2">Loan Settings</div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between"><span>Interest Rate</span><span className="text-amber-400">5% / day</span></div>
              <div className="flex justify-between"><span>Max Loan Amount</span><span className="text-amber-400">$500,000</span></div>
              <div className="flex justify-between"><span>Enforcement Cost</span><span className="text-amber-400">$10,000 / visit</span></div>
            </div>
          </div>
          <button onClick={() => setMsg("Enforcer dispatched to collect debt")} className="w-full px-4 py-3 bg-red-600/20 border border-red-500/40 text-red-300 rounded-xl text-sm font-bold hover:bg-red-600/30 transition">
            💪 Send Enforcer ($10K)
          </button>
        </div>
      )}

      {tab === "favors" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-2">Favor Ledger</div>
            <div className="space-y-2">
              {[
                { from: "Tony", favor: "Provided alibi for court date", owed: "One getaway driver job", icon: "👔" },
                { from: "Maria", favor: "Got charges dropped", owed: "Legal consulting for 30 days", icon: "👩‍⚖️" },
                { from: "Viktor", favor: "Protected you from hit", owed: "One muscle job, no questions", icon: "💪" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-lg">
                  <span className="text-lg">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200">{f.from}</div>
                    <div className="text-[10px] text-slate-400">{f.favor}</div>
                    <div className="text-[10px] text-amber-400">→ {f.owed}</div>
                  </div>
                  <button onClick={() => setMsg(`Called in favor from ${f.from}`)} className="px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[10px] font-bold">Call In</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "informant" && (
        <div className="space-y-3">
          {[
            { name: "Snitch Pete", loyalty: 45, info: "Police patrol routes", icon: "🐀" },
            { name: "Officer Daniels", loyalty: 70, info: "FBI investigation status", icon: "👮" },
            { name: "Clerk Jones", loyalty: 30, info: "Court hearing schedules", icon: "📋" },
            { name: "Nurse Kim", loyalty: 85, info: "Hospital patient records", icon: "👩‍⚕️" },
          ].map(inf => (
            <div key={inf.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{inf.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{inf.name}</div>
                  <div className="text-[10px] text-slate-400">{inf.info}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Loyalty</div>
                  <div className={`text-xs font-bold ${inf.loyalty > 60 ? "text-green-400" : inf.loyalty > 35 ? "text-yellow-400" : "text-red-400"}`}>{inf.loyalty}%</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-slate-800/50">
                <button onClick={() => setMsg(`Paid ${inf.name} for intel`)} className="flex-1 px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold">Pay $5K</button>
                <button onClick={() => setMsg(`Threatened ${inf.name} — loyalty may drop`)} className="flex-1 px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold">Threaten</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reputation" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">Your Public Reputation</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Street Cred", value: 72, color: "amber" },
                { label: "Business Rep", value: 85, color: "green" },
                { label: "Fear Factor", value: 58, color: "red" },
                { label: "Trust Score", value: 65, color: "blue" },
              ].map(r => (
                <div key={r.label} className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className={`text-lg font-black text-${r.color}-400`}>{r.value}</div>
                  <div className="text-[10px] text-slate-400">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mafia-card rounded-xl p-4">
            <div className="text-xs text-slate-400 space-y-1">
              <div>• High Street Cred = cheaper black market prices</div>
              <div>• High Business Rep = NPCs offer better deals</div>
              <div>• High Fear Factor = fewer rival attacks</div>
              <div>• High Trust Score = informants give better intel</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   💀 SURVIVAL & REALISM
   ═══════════════════════════════════════════ */

function SurvivalRealismPage({ player }: { player: any }) {
  const [tab, setTab] = useState("hospital");
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"green"|"red"|"amber"|"blue">("amber");
  const [playerHealth, setPlayerHealth] = useState(() => { try { return JSON.parse(localStorage.getItem("playerData") || "{}").life ?? 120; } catch { return 120; } });
  const [playerMaxHealth] = useState(() => { try { return JSON.parse(localStorage.getItem("playerData") || "{}").maxLife ?? 120; } catch { return 120; } });
  const [addictions, setAddictions] = useState(() => { try { return JSON.parse(localStorage.getItem("empireAddictions") || '{"alcohol":0,"gambling":0,"painkillers":0,"stimulants":0}'); } catch { return { alcohol: 0, gambling: 0, painkillers: 0, stimulants: 0 }; } });
  const [mentalHealth, setMentalHealth] = useState(() => { try { return JSON.parse(localStorage.getItem("empireMental") || '{"stress":30,"paranoia":20,"guilt":10,"focus":80}'); } catch { return { stress: 30, paranoia: 20, guilt: 10, focus: 80 }; } });
  const [insuranceUntil, setInsuranceUntil] = useState(() => { try { return JSON.parse(localStorage.getItem("empireInsurance") || "0"); } catch { return 0; } });
  const [disposalUntil, setDisposalUntil] = useState(() => { try { return JSON.parse(localStorage.getItem("empireDisposal") || "0"); } catch { return 0; } });
  const [evidenceUntil, setEvidenceUntil] = useState(() => { try { return JSON.parse(localStorage.getItem("empireEvidence") || "0"); } catch { return 0; } });

  React.useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  const save = (key: string, val: unknown) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
  const showMsg = (m: string, type: "green"|"red"|"amber"|"blue" = "amber") => { setMsg(m); setMsgType(type); setTimeout(() => setMsg(""), 4000); };
  const formatTime = (ms: number) => {
    if (ms <= 0) return "Expired";
    const s = Math.floor(ms / 1000); const m = Math.floor(s / 60); const h = Math.floor(m / 60); const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`; if (h > 0) return `${h}h ${m % 60}m`; return `${m}m ${s % 60}s`;
  };
  const getCash = () => player?.money ?? 0;
  const spendCash = (amount: number) => { try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (player?.money ?? 0) - amount; localStorage.setItem("playerData", JSON.stringify(d)); } catch {} };

  const tabs = [
    { id: "hospital", icon: "🏥", label: "Hospital" },
    { id: "surgery", icon: "🔬", label: "Surgery" },
    { id: "addiction", icon: "💊", label: "Addiction" },
    { id: "mental", icon: "🧠", label: "Mental Health" },
    { id: "insurance_fraud", icon: "📄", label: "Insurance Fraud" },
    { id: "rehab", icon: "🏥", label: "Rehab" },
    { id: "organ", icon: "🫀", label: "Organ Traffic" },
    { id: "disposal", icon: "💀", label: "Body Disposal" },
    { id: "evidence", icon: "🔥", label: "Evidence Destruction" },
    { id: "costs", icon: "💰", label: "Hospital Costs" },
  ];

  // Addiction side effects
  const getAddictionEffects = () => {
    const effects: string[] = [];
    if (addictions.alcohol > 30) effects.push(`🍺 Alcohol: -${Math.floor(addictions.alcohol / 5)}% accuracy, random blackout risk`);
    if (addictions.gambling > 30) effects.push(`🎰 Gambling: -${Math.floor(addictions.gambling / 5)}% crime income, +${Math.floor(addictions.gambling / 3)}% gambling losses`);
    if (addictions.painkillers > 30) effects.push(`💊 Painkillers: -${Math.floor(addictions.painkillers / 5)}% defense, healthcare costs x${1 + Math.floor(addictions.painkillers / 30)}`);
    if (addictions.stimulants > 30) effects.push(`💉 Stimulants: +${Math.floor(addictions.stimulants / 4)}% speed but -${Math.floor(addictions.stimulants / 3)}% max HP`);
    return effects;
  };

  return (
    <div className="animate-fade-in space-y-4">
      <SectionTitle icon="💀" title="Survival & Realism" sub="Stay alive, manage addictions, and cover your tracks" />
      {msg && <div className={`px-4 py-2 border rounded-xl text-xs text-center ${msgType === "green" ? "bg-green-600/20 border-green-500/40 text-green-300" : msgType === "red" ? "bg-red-600/20 border-red-500/40 text-red-300" : msgType === "blue" ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-amber-600/20 border-amber-500/40 text-amber-300"}`}>{msg}</div>}
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {/* Hospital — Heal with realistic effects */}
      {tab === "hospital" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-sm text-slate-400">Current Health</div>
            <div className={`text-3xl font-black ${playerHealth > 80 ? "text-green-400" : playerHealth > 40 ? "text-yellow-400" : "text-red-400"}`}>{playerHealth} / {playerMaxHealth}</div>
            <div className="w-full h-3 bg-slate-800 rounded-full mt-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${(playerHealth / playerMaxHealth) * 100}%`, background: playerHealth > 80 ? "#22c55e" : playerHealth > 40 ? "#eab308" : "#ef4444" }} />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {playerHealth <= 20 ? "⚠️ CRITICAL — You need immediate medical attention!" : playerHealth <= 50 ? "⚠️ WOUNDED — Seek treatment soon" : playerHealth <= 80 ? "Minor injuries — heal at your leisure" : "✅ Healthy"}
            </div>
          </div>
          {[
            { name: "ER Visit", cost: 5000, heal: 30, time: "10 min wait", icon: "🚑", sideEffect: "Pain medication may cause drowsiness (-5% focus for 1h)" },
            { name: "Standard Care", cost: 15000, heal: 60, time: "20 min wait", icon: "💊", sideEffect: "Antibiotics prescribed — no side effects" },
            { name: "VIP Ward", cost: 50000, heal: 100, time: "5 min wait", icon: "🏨", sideEffect: "Private room — full recovery, no side effects" },
            { name: "Full Recovery", cost: 150000, heal: "MAX", time: "Instant", icon: "✨", sideEffect: "Surgery + physical therapy — costs extra but zero side effects" },
          ].map(t => {
            const canAfford = getCash() >= t.cost;
            const needsHeal = playerHealth < playerMaxHealth;
            return (
              <div key={t.name} className={`mafia-card rounded-xl p-4 border transition-all ${!needsHeal ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-2 mb-1"><span className="text-xl">{t.icon}</span><span className="text-sm font-bold text-slate-200">{t.name}</span></div>
                <div className="text-[10px] text-slate-400">Heal: {t.heal} HP • Wait: {t.time}</div>
                <div className="text-[10px] text-amber-400 mt-1">⚕️ {t.sideEffect}</div>
                <button onClick={() => {
                  if (!needsHeal) { showMsg("You're already at full health!", "green"); return; }
                  if (!canAfford) { showMsg(`Need $${t.cost.toLocaleString()}`, "red"); return; }
                  spendCash(t.cost);
                  const healed = t.heal === "MAX" ? playerMaxHealth - playerHealth : Math.min(Number(t.heal), playerMaxHealth - playerHealth);
                  const newHP = Math.min(playerMaxHealth, playerHealth + healed);
                  setPlayerHealth(newHP);
                  try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.life = newHP; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                  showMsg(`Treated at ${t.name}! +${healed} HP${t.name === "ER Visit" ? " (Drowsy for 1h)" : ""}`, "green");
                }} disabled={!needsHeal} className={`w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold transition ${needsHeal ? "bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-green-600/30" : "bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed"}`}>
                  ${t.cost.toLocaleString()}{!needsHeal ? " (Full HP)" : ""}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Surgery — Realistic with complications */}
      {tab === "surgery" && (
        <div className="space-y-3">
          <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-[10px] text-red-300">
            ⚠️ All surgeries carry risk. Higher risk = lower cost. Complications can reduce stats permanently.
          </div>
          {[
            { name: "Wound Stitching", cost: 10000, heal: 50, risk: "2%", complication: "Infection — -5% HP for 24h", icon: "🪡" },
            { name: "Emergency Surgery", cost: 200000, heal: 150, risk: "5%", complication: "Blood loss — -10 ATK for 12h", icon: "🔴" },
            { name: "Organ Transplant", cost: 1000000, heal: "FULL", risk: "15%", complication: "Rejection — 20% chance of death", icon: "🫀" },
            { name: "Cybernetic Implant", cost: 5000000, heal: "NONE", risk: "10%", complication: "Malfunction — random stat debuff", icon: "🤖", boost: "+20 ATK, +20 DEF permanent" },
          ].map(s => (
            <div key={s.name} className="mafia-card rounded-xl p-4 border border-amber-500/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-400">Recovery: {s.heal} HP{s.boost ? ` • ${s.boost}` : ""}</div>
                </div>
              </div>
              <div className="text-[10px] text-red-400 mb-1">⚠️ Risk: {s.risk} — Complication: {s.complication}</div>
              <button onClick={() => {
                if ((player?.money ?? 0) < s.cost) { showMsg("Not enough cash!", "red"); return; }
                spendCash(s.cost);
                const roll = Math.random() * 100;
                const riskNum = parseFloat(s.risk);
                if (roll < riskNum) {
                  // Complication!
                  if (s.name === "Organ Transplant" && roll < 5) {
                    showMsg(`💀 SURGICAL FAILURE! The organ was rejected. You died on the table... Hospital bill: $${s.cost.toLocaleString()}`, "red");
                    setPlayerHealth(Math.floor(playerMaxHealth * 0.1));
                  } else {
                    showMsg(`⚠️ Complication during ${s.name}! ${s.complication}. Surgery partially successful.`, "red");
                    if (s.heal !== "NONE" && s.heal !== "FULL") setPlayerHealth((p: number) => Math.min(playerMaxHealth, p + Math.floor(Number(s.heal) * 0.5)));
                  }
                } else {
                  if (s.heal === "FULL") { setPlayerHealth(playerMaxHealth); showMsg(`${s.name} successful! Full recovery.`, "green"); }
                  else if (s.heal === "NONE") { showMsg(`${s.name} installed! ${s.boost}`, "green"); }
                  else { setPlayerHealth((p: number) => Math.min(playerMaxHealth, p + Number(s.heal))); showMsg(`${s.name} successful! +${s.heal} HP recovered.`, "green"); }
                }
                try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.life = playerHealth; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
              }} className="w-full px-3 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition">
                Schedule — ${s.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Addiction — Realistic system with effects */}
      {tab === "addiction" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">Addiction Levels</div>
            {[
              { key: "alcohol" as const, name: "Alcohol", icon: "🍺", desc: "Beer, whiskey, moonshine — social lubricant turned crutch" },
              { key: "gambling" as const, name: "Gambling", icon: "🎰", desc: "Slots, cards, dice — the rush of risk" },
              { key: "painkillers" as const, name: "Painkillers", icon: "💊", desc: "Oxy, morphine, codeine — numbs the pain, kills the mind" },
              { key: "stimulants" as const, name: "Stimulants", icon: "💉", desc: "Cocaine, meth, amphetamines — superhuman then crash" },
            ].map(a => (
              <div key={a.key} className="mb-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">{a.name}</span>
                      <span className={addictions[a.key] > 60 ? "text-red-400" : addictions[a.key] > 30 ? "text-yellow-400" : addictions[a.key] > 0 ? "text-orange-400" : "text-green-400"}>
                        {addictions[a.key]}%
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500">{a.desc}</div>
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-1">
                      <div className="h-full rounded-full transition-all" style={{ width: `${addictions[a.key]}%`, background: addictions[a.key] > 60 ? "#ef4444" : addictions[a.key] > 30 ? "#eab308" : addictions[a.key] > 0 ? "#f97316" : "#22c55e" }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => {
                    const increase = Math.floor(Math.random() * 15 + 5);
                    const newAddictions = { ...addictions, [a.key]: Math.min(100, addictions[a.key] + increase) };
                    setAddictions(newAddictions);
                    save("empireAddictions", newAddictions);
                    // Addictive substances also increase faster over time
                    showMsg(`${a.name} consumed. Addiction +${increase}%${newAddictions[a.key] > 60 ? " ⚠️ SEVERE ADDICTION!" : ""}`, newAddictions[a.key] > 60 ? "red" : "amber");
                  }} className="flex-1 px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold hover:bg-red-600/30 transition">
                    Use +{Math.floor(Math.random() * 15 + 5)}%
                  </button>
                  <button onClick={() => {
                    if (addictions[a.key] <= 0) { showMsg("Already clean!", "green"); return; }
                    const decrease = Math.floor(Math.random() * 8 + 2);
                    const newAddictions = { ...addictions, [a.key]: Math.max(0, addictions[a.key] - decrease) };
                    setAddictions(newAddictions);
                    save("empireAddictions", newAddictions);
                    showMsg(`Resisted ${a.name}. Addiction -${decrease}%`, "green");
                  }} className="flex-1 px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg text-[10px] font-bold hover:bg-green-600/30 transition">
                    Resist -{Math.floor(Math.random() * 8 + 2)}%
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Active Effects */}
          {getAddictionEffects().length > 0 && (
            <div className="mafia-card rounded-xl p-4 border border-red-500/20">
              <div className="text-xs font-bold text-red-400 mb-2">⚠️ Active Addiction Effects</div>
              <div className="space-y-1">
                {getAddictionEffects().map((e, i) => (
                  <div key={i} className="text-[10px] text-red-300">{e}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mental Health — Realistic effects */}
      {tab === "mental" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">Mental State</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "stress" as const, label: "Stress", icon: "😰", color: mentalHealth.stress > 60 ? "red" : mentalHealth.stress > 30 ? "yellow" : "green" },
                { key: "paranoia" as const, label: "Paranoia", icon: "👁️", color: mentalHealth.paranoia > 60 ? "red" : mentalHealth.paranoia > 30 ? "yellow" : "green" },
                { key: "guilt" as const, label: "Guilt", icon: "😞", color: mentalHealth.guilt > 60 ? "red" : mentalHealth.guilt > 30 ? "yellow" : "green" },
                { key: "focus" as const, label: "Focus", icon: "🎯", color: mentalHealth.focus > 60 ? "green" : mentalHealth.focus > 30 ? "yellow" : "red", inverted: true },
              ].map(s => (
                <div key={s.key} className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className="text-lg">{s.icon}</div>
                  <div className={`text-xs font-bold text-${s.color}-400`}>{mentalHealth[s.key]}%</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${mentalHealth[s.key]}%`, background: s.color === "red" ? "#ef4444" : s.color === "yellow" ? "#eab308" : "#22c55e" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setMentalHealth((m: any) => ({ ...m, stress: Math.max(0, m.stress - 15) })); save("empireMental", { ...mentalHealth, stress: Math.max(0, mentalHealth.stress - 15) }); showMsg("Meditation — stress reduced", "green"); }}
              className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🧘</div><div className="text-xs font-bold text-slate-200">Meditate</div><div className="text-[10px] text-green-400">-15% Stress</div>
            </button>
            <button onClick={() => {
              if (getCash() < 50000) { showMsg("Need $50,000", "red"); return; }
              spendCash(50000);
              setMentalHealth((m: any) => ({ ...m, guilt: Math.max(0, m.guilt - 20), stress: Math.max(0, m.stress - 10) }));
              save("empireMental", { ...mentalHealth, guilt: Math.max(0, mentalHealth.guilt - 20), stress: Math.max(0, mentalHealth.stress - 10) });
              showMsg("Therapy session — guilt and stress reduced ($50K)", "green");
            }} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🛋️</div><div className="text-xs font-bold text-slate-200">Therapy</div><div className="text-[10px] text-amber-400">-20% Guilt ($50K)</div>
            </button>
            <button onClick={() => {
              setMentalHealth((m: any) => ({ ...m, stress: Math.max(0, m.stress - 10), paranoia: Math.max(0, m.paranoia - 5), focus: Math.min(100, m.focus + 5) }));
              save("empireMental", { ...mentalHealth, stress: Math.max(0, mentalHealth.stress - 10), paranoia: Math.max(0, mentalHealth.paranoia - 5), focus: Math.min(100, mentalHealth.focus + 5) });
              showMsg("Boxing — stress and paranoia reduced, focus improved", "green");
            }} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🥊</div><div className="text-xs font-bold text-slate-200">Boxing</div><div className="text-[10px] text-green-400">-10% Stress, +5% Focus</div>
            </button>
            <button onClick={() => {
              setMentalHealth((m: any) => ({ ...m, stress: Math.max(0, m.stress - 25), guilt: Math.min(100, m.guilt + 10) }));
              save("empireMental", { ...mentalHealth, stress: Math.max(0, mentalHealth.stress - 25), guilt: Math.min(100, mentalHealth.guilt + 10) });
              showMsg("Night out — stress reduced but guilt increased", "amber");
            }} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🍸</div><div className="text-xs font-bold text-slate-200">Night Out</div><div className="text-[10px] text-amber-400">-25% Stress, +10% Guilt</div>
            </button>
          </div>
        </div>
      )}

      {/* Insurance Fraud — 48h active */}
      {tab === "insurance_fraud" && (
        <div className="space-y-3">
          {insuranceUntil > Date.now() && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-sm font-bold text-green-400">✅ Insurance Active</div>
              <div className="text-xs text-green-300">{formatTime(insuranceUntil - Date.now())} remaining</div>
            </div>
          )}
          {[
            { name: "Fake Car Accident", cost: 20000, payout: "80K-150K", risk: "15%", icon: "🚗", desc: "Staged collision — pay a partner to ram your car" },
            { name: "Staged Break-In", cost: 15000, payout: "50K-100K", risk: "10%", icon: "🏠", desc: "Hire someone to break in — claim stolen items" },
            { name: "Phantom Injury", cost: 10000, payout: "30K-60K", risk: "20%", icon: "🤕", desc: "Fake a slip and fall — sue the property owner" },
            { name: "Arson Claim", cost: 50000, payout: "200K-500K", risk: "25%", icon: "🔥", desc: "Burn your own property — claim insurance" },
            { name: "Medical Fraud", cost: 30000, payout: "100K-250K", risk: "18%", icon: "🏥", desc: "Invent injuries — claim disability payments" },
          ].map(f => (
            <div key={f.name} className={`mafia-card rounded-xl p-4 border transition-all ${insuranceUntil > Date.now() ? "border-green-500/30" : "border-amber-500/10"}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{f.name}</div>
                  <div className="text-[10px] text-slate-400">{f.desc}</div>
                  <div className="text-[10px] text-green-400">Payout: {f.payout} (48h claim window)</div>
                </div>
              </div>
              <div className="text-[10px] text-red-400 mb-2">⚠️ {f.risk} chance of investigation</div>
              <button onClick={() => {
                if ((player?.money ?? 0) < f.cost) { showMsg("Not enough cash!", "red"); return; }
                spendCash(f.cost);
                const roll = Math.random() * 100;
                if (roll < parseFloat(f.risk)) {
                  showMsg(`🚨 INVESTIGATION! Your ${f.name} claim was flagged. Suspicious!`, "red");
                } else {
                  const payout = Math.floor(Math.random() * 100000 + 50000);
                  try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) + payout; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                  setInsuranceUntil(Date.now() + 48 * 60 * 60 * 1000);
                  save("empireInsurance", Date.now() + 48 * 60 * 60 * 1000);
                  showMsg(`Filed ${f.name}! Payout: $${payout.toLocaleString()}. Active for 48h.`, "green");
                }
              }} className="w-full px-3 py-2 bg-green-600/20 border border-green-500/40 text-green-300 rounded-xl text-xs font-bold hover:bg-green-600/30 transition">
                File Claim — ${f.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rehab — Buy programs */}
      {tab === "rehab" && (
        <div className="space-y-3">
          {[
            { name: "Detox Center", cost: 25000, clean: "Random addiction -30%", time: "3 days", icon: "💊", desc: "Quick detox — reduces one random addiction significantly" },
            { name: "Outpatient Program", cost: 100000, clean: "All addictions -20%", time: "7 days", icon: "🏠", desc: "Attend daily sessions — go home at night" },
            { name: "30-Day Facility", cost: 500000, clean: "All addictions -50%", time: "30 days", icon: "🏥", desc: "Full residential treatment — supervised recovery" },
            { name: "Premium Rehab", cost: 2000000, clean: "FULL RESET", time: "14 days", icon: "✨", desc: "Luxury facility — complete addiction wipe, therapy included" },
          ].map(r => (
            <div key={r.name} className="mafia-card rounded-xl p-4 border border-amber-500/10">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{r.name}</div>
                  <div className="text-[10px] text-slate-400">{r.desc}</div>
                  <div className="text-[10px] text-green-400">{r.clean} • {r.time}</div>
                </div>
              </div>
              <button onClick={() => {
                if ((player?.money ?? 0) < r.cost) { showMsg("Not enough cash!", "red"); return; }
                spendCash(r.cost);
                let newAddictions = { ...addictions };
                if (r.clean === "FULL RESET") {
                  newAddictions = { alcohol: 0, gambling: 0, painkillers: 0, stimulants: 0 };
                } else {
                  const keys = Object.keys(newAddictions) as (keyof typeof newAddictions)[];
                  const key = keys[Math.floor(Math.random() * keys.length)];
                  newAddictions[key] = Math.max(0, newAddictions[key] - 30);
                }
                setAddictions(newAddictions);
                save("empireAddictions", newAddictions);
                showMsg(`Enrolled in ${r.name}! ${r.clean}.`, "green");
              }} className="w-full px-3 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition">
                ${r.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Organ Traffic */}
      {tab === "organ" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-red-500/20">
            <div className="text-sm font-bold text-red-400 mb-2">🫀 Organ Trafficking</div>
            <div className="text-xs text-slate-400">High risk, high reward. Get caught = 10 years prison. Better skills = higher payout.</div>
          </div>
          {[
            { name: "Kidney Sale", payout: "150K-300K", risk: "20%", icon: "🫘", desc: "Black market kidney — steady demand from wealthy patients" },
            { name: "Liver Deal", payout: "200K-400K", risk: "25%", icon: "🫀", desc: "Partial liver — regrows, higher risk for higher reward" },
            { name: "Heart Heist", payout: "500K-1M", risk: "35%", icon: "❤️", desc: "The ultimate organ — extremely rare, extremely valuable" },
            { name: "Eye Harvest", payout: "100K-200K", risk: "15%", icon: "👁️", desc: "Corneas and retinas — lower risk, steady income" },
          ].map(o => (
            <div key={o.name} className="mafia-card rounded-xl p-4 border border-red-500/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">{o.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{o.name}</div>
                  <div className="text-[10px] text-slate-400">{o.desc}</div>
                  <div className="text-[10px] text-green-400">Payout: {o.payout}</div>
                </div>
                <div className="text-[10px] text-red-400">{o.risk}</div>
              </div>
              <button onClick={() => {
                const roll = Math.random() * 100;
                if (roll < parseFloat(o.risk)) {
                  showMsg(`🚨 CAUGHT! ${o.name} deal went wrong. 10 years in prison.`, "red");
                } else {
                  const payout = Math.floor(Math.random() * 300000 + 100000);
                  try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) + payout; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                  showMsg(`${o.name} deal completed! +$${payout.toLocaleString()}`, "green");
                }
              }} className="w-full mt-2 px-3 py-2 bg-red-600/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold hover:bg-red-600/30 transition">
                Execute
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Body Disposal — 7 days active */}
      {tab === "disposal" && (
        <div className="space-y-3">
          {disposalUntil > Date.now() && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-sm font-bold text-green-400">✅ Disposal Service Active</div>
              <div className="text-xs text-green-300">{formatTime(disposalUntil - Date.now())} remaining</div>
            </div>
          )}
          {[
            { name: "Burial (Remote)", cost: 5000, chance: "60%", desc: "Quick dig in the woods — risk of discovery", icon: "⚰️" },
            { name: "Ocean Dump", cost: 10000, chance: "80%", desc: "Weighted bags, deep water — hard to find", icon: "🌊" },
            { name: "Acid Bath", cost: 25000, chance: "95%", desc: "Industrial acid — complete dissolution", icon: "🧪" },
            { name: "Pig Farm", cost: 15000, chance: "90%", desc: "Nature's disposal — pigs eat everything", icon: "🐷" },
            { name: "Incinerator", cost: 50000, chance: "99%", desc: "Industrial furnace — zero trace", icon: "🔥" },
          ].map(d => (
            <div key={d.name} className="mafia-card rounded-xl p-4 border border-amber-500/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">{d.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{d.name}</div>
                  <div className="text-[10px] text-slate-400">{d.desc} • Success: {d.chance}</div>
                </div>
              </div>
              <button onClick={() => {
                if ((player?.money ?? 0) < d.cost) { showMsg("Not enough cash!", "red"); return; }
                spendCash(d.cost);
                const roll = Math.random() * 100;
                if (roll < 5) {
                  showMsg(`🚨 PARTIAL FAILURE! Some evidence was left behind. Investigation risk increased.`, "red");
                } else {
                  setDisposalUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  save("empireDisposal", Date.now() + 7 * 24 * 60 * 60 * 1000);
                  showMsg(`${d.name} — body disposed. Service active for 7 days.`, "green");
                }
              }} className="w-full mt-2 px-3 py-2 bg-slate-600/20 border border-slate-500/30 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-600/30 transition">
                ${d.cost.toLocaleString()} (7d service)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Destruction — 5 days active */}
      {tab === "evidence" && (
        <div className="space-y-3">
          {evidenceUntil > Date.now() && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-sm font-bold text-green-400">✅ Evidence Protection Active</div>
              <div className="text-xs text-green-300">{formatTime(evidenceUntil - Date.now())} remaining</div>
            </div>
          )}
          {[
            { name: "Burn Evidence", cost: 5000, desc: "Destroy physical evidence — documents, weapons, clothing", icon: "🔥" },
            { name: "Destroy Security Footage", cost: 30000, desc: "Hack and delete all nearby cameras — clean the area", icon: "📹" },
            { name: "Hack Database", cost: 50000, desc: "Erase digital records — fingerprints, DNA, phone logs", icon: "💻" },
            { name: "Plant False Evidence", cost: 75000, desc: "Frame a rival for your crime — redirect investigation", icon: "🎭" },
            { name: "Bribe Forensics", cost: 100000, desc: "Pay lab techs to lose/contaminate samples", icon: "💰" },
          ].map(e => (
            <div key={e.name} className="mafia-card rounded-xl p-4 border border-amber-500/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{e.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{e.name}</div>
                  <div className="text-[10px] text-slate-400">{e.desc}</div>
                </div>
              </div>
              <button onClick={() => {
                if ((player?.money ?? 0) < e.cost) { showMsg("Not enough cash!", "red"); return; }
                spendCash(e.cost);
                setEvidenceUntil(Date.now() + 5 * 24 * 60 * 60 * 1000);
                save("empireEvidence", Date.now() + 5 * 24 * 60 * 60 * 1000);
                showMsg(`${e.name} — evidence destroyed. Protection active for 5 days.`, "green");
              }} className="w-full px-3 py-2 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold hover:bg-amber-600/30 transition">
                ${e.cost.toLocaleString()} (5d protection)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hospital Costs — Realistic breakdown */}
      {tab === "costs" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">Hospital Cost Breakdown</div>
            <div className="space-y-2 text-xs">
              {[
                { service: "ER Triage (Assessment)", cost: "$2,500", desc: "Initial evaluation by ER nurse" },
                { service: "X-Ray", cost: "$1,500", desc: "Single imaging study" },
                { service: "Blood Work", cost: "$3,000", desc: "Full panel — CBC, metabolic, toxicology" },
                { service: "CT Scan", cost: "$5,000", desc: "Computed tomography — detailed imaging" },
                { service: "MRI Scan", cost: "$8,000", desc: "Magnetic resonance — no radiation" },
                { service: "Surgery (Minor)", cost: "$25,000", desc: "Outpatient procedure — same-day release" },
                { service: "Surgery (Major)", cost: "$100,000", desc: "Open surgery — hospital stay required" },
                { service: "ICU Night", cost: "$15,000", desc: "Intensive care — 24h monitoring" },
                { service: "Ambulance", cost: "$5,000", desc: "Emergency transport with paramedics" },
                { service: "Medication (Daily)", cost: "$1,000-$10,000", desc: "Painkillers, antibiotics, IV fluids" },
              ].map(c => (
                <div key={c.service} className="p-2 bg-slate-800/30 rounded">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-bold">{c.service}</span>
                    <span className="text-amber-400 font-bold">{c.cost}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-green-500/20">
            <div className="text-xs text-green-400 space-y-1">
              <div>💡 <b>Health Insurance</b> reduces all costs by 50% — buy at Insurance Agency</div>
              <div>💡 <b>Life Insurance</b> pays $500K on death — buy at Life Insurance tab</div>
              <div>💡 <b>Criminal Record</b> increases all costs by 10% per wanted level</div>
              <div>💡 <b>VIP Ward</b> — pay extra to skip wait times</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityDefensePage({ player }: { player: any }) {
  const [tab, setTab] = useState("guards");
  const [tick, setTick] = useState(0);
  const playerLevel = player?.level ?? 1;
  const [activeServices, setActiveServices] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem("empireSecurity") || "{}"); } catch { return {}; } });
  const [safehouseLevel, setSafehouseLevel] = useState(() => { try { return JSON.parse(localStorage.getItem("empireSafehouse") || "0"); } catch { return 0; } });
  const [escapeLevel, setEscapeLevel] = useState(() => { try { return JSON.parse(localStorage.getItem("empireEscape") || "0"); } catch { return 0; } });
  const [armorDurability, setArmorDurability] = useState(() => { try { return JSON.parse(localStorage.getItem("empireArmor") || "0"); } catch { return 0; } });
  const [hasPermit, setHasPermit] = useState(() => { try { return JSON.parse(localStorage.getItem("empirePermit") || "0"); } catch { return 0; } });
  const [lockpickLevel, setLockpickLevel] = useState(() => { try { return JSON.parse(localStorage.getItem("empireLockpick") || "0"); } catch { return 0; } });
  const [lockpickXP, setLockpickXP] = useState(() => { try { return JSON.parse(localStorage.getItem("empireLockpickXP") || "0"); } catch { return 0; } });
  const [alibiUntil, setAlibiUntil] = useState(() => { try { return JSON.parse(localStorage.getItem("empireAlibi") || "0"); } catch { return 0; } });
  const [counterLevel, setCounterLevel] = useState(() => { try { return JSON.parse(localStorage.getItem("empireCounter") || "0"); } catch { return 0; } });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"green"|"red"|"amber"|"blue">("amber");
  const [buying, setBuying] = useState(false);

  // Tick every second for timer updates
  React.useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  // Save to localStorage
  const save = (key: string, val: unknown) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  const showMsg = (m: string, type: "green"|"red"|"amber"|"blue" = "amber") => { setMsg(m); setMsgType(type); setTimeout(() => setMsg(""), 4000); };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "Expired";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s % 60}s`;
  };

  const isActive = (key: string) => (activeServices[key] ?? 0) > Date.now();
  const activateService = (key: string, durationMs: number, cost: number) => {
    const cash = player?.money ?? 0;
    if (cash < cost) { showMsg(`Not enough cash! Need $${cost.toLocaleString()}`, "red"); return false; }
    // Deduct cash
    try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (player?.money ?? 0) - cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
    const newEnd = Math.max(activeServices[key] ?? 0, Date.now()) + durationMs;
    const updated = { ...activeServices, [key]: newEnd };
    setActiveServices(updated);
    save("empireSecurity", updated);
    return true;
  };

  const tabs = [
    { id: "guards", icon: "🛡️", label: "Private Security" },
    { id: "alarms", icon: "🚨", label: "Alarm Systems" },
    { id: "safehouse", icon: "🏠", label: "Safe Houses" },
    { id: "escape", icon: "🚪", label: "Escape Routes" },
    { id: "armor", icon: "🦺", label: "Body Armor" },
    { id: "permits", icon: "📋", label: "Gun Permits" },
    { id: "alibi", icon: "🎭", label: "Alibi System" },
    { id: "safecrack", icon: "🔐", label: "Safe Cracking" },
    { id: "lockpick", icon: "🔑", label: "Lockpick" },
    { id: "counter", icon: "🕵️", label: "Counter-Surveillance" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <SectionTitle icon="🛡️" title="Security & Defense" sub="Protect yourself, your businesses, and your empire" />
      {msg && <div className={`px-4 py-2 border rounded-xl text-xs text-center ${msgType === "green" ? "bg-green-600/20 border-green-500/40 text-green-300" : msgType === "red" ? "bg-red-600/20 border-red-500/40 text-red-300" : msgType === "blue" ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-amber-600/20 border-amber-500/40 text-amber-300"}`}>{msg}</div>}
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {/* Private Security — 24h timer */}
      {tab === "guards" && (
        <div className="space-y-3">
          {isActive("guards") && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-sm font-bold text-green-400">✅ Security Active</div>
              <div className="text-xs text-green-300">{formatTime((activeServices.guards ?? 0) - Date.now())} remaining</div>
            </div>
          )}
          {[
            { id: "street_guard", name: "Street Guard", cost: 5000, def: 15, icon: "👮", desc: "Basic protection — eyes on the street" },
            { id: "armed_guard", name: "Armed Guard", cost: 25000, def: 35, icon: "🔫", desc: "Armed response — immediate threat neutralization" },
            { id: "swat_vet", name: "SWAT Veteran", cost: 100000, def: 60, icon: "🎖️", desc: "Ex-SWAT — tactical expertise" },
            { id: "special_forces", name: "Ex-Special Forces", cost: 500000, def: 85, icon: "⭐", desc: "Elite operator — near-impenetrable" },
            { id: "private_army", name: "Private Army", cost: 2000000, def: 100, icon: "💀", desc: "Full military unit — untouchable" },
          ].map(g => {
            const active = isActive(g.id);
            const remaining = (activeServices[g.id] ?? 0) - Date.now();
            return (
              <div key={g.id} className={`mafia-card rounded-xl p-4 border transition-all ${active ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{g.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{g.name}</div>
                    <div className="text-[10px] text-slate-400">{g.desc} • DEF +{g.def}</div>
                  </div>
                </div>
                {active && (
                  <div className="text-[10px] text-green-400 mb-2">⏱️ Active: {formatTime(remaining)}</div>
                )}
                <button onClick={() => {
                  if (activateService(g.id, 24 * 60 * 60 * 1000, g.cost)) {
                    showMsg(`${g.name} hired for 24 hours! DEF +${g.def}`, "green");
                  }
                }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition ${active ? "bg-green-600/20 border border-green-500/40 text-green-300" : "bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30"}`}>
                  {active ? "🔄 Renew 24h" : `Hire — $${g.cost.toLocaleString()}`} (24h)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Alarm Systems — 5 days active */}
      {tab === "alarms" && (
        <div className="space-y-3">
          {isActive("alarms") && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-sm font-bold text-green-400">✅ Alarms Active</div>
              <div className="text-xs text-green-300">{formatTime((activeServices.alarms ?? 0) - Date.now())} remaining</div>
            </div>
          )}
          {[
            { id: "basic_alarm", name: "Basic Alarm", cost: 10000, protection: "10%", desc: "Window/door sensors — basic deterrence", icon: "🔔" },
            { id: "smart_alarm", name: "Smart Alarm System", cost: 50000, protection: "25%", desc: "Connected to monitoring — auto police dispatch", icon: "📱" },
            { id: "motion_sensors", name: "Motion Sensors", cost: 100000, protection: "40%", desc: "Heat/motion detection — no blind spots", icon: "📡" },
            { id: "ai_security", name: "AI Security Grid", cost: 500000, protection: "65%", desc: "AI-powered — learns patterns, predicts threats", icon: "🤖" },
            { id: "full_fortress", name: "Full Fortress", cost: 2000000, protection: "90%", desc: "Retinal scanners, pressure plates, laser grid", icon: "🏰" },
          ].map(a => {
            const active = isActive(a.id);
            const remaining = (activeServices[a.id] ?? 0) - Date.now();
            return (
              <div key={a.id} className={`mafia-card rounded-xl p-4 border transition-all ${active ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{a.name}</div>
                    <div className="text-[10px] text-slate-400">{a.desc}</div>
                    <div className="text-[10px] text-green-400 font-bold">{a.protection} raid defense</div>
                  </div>
                </div>
                {active && (
                  <div className="text-[10px] text-green-400 mt-2">⏱️ Active: {formatTime(remaining)}</div>
                )}
                <button onClick={() => {
                  if (activateService(a.id, 5 * 24 * 60 * 60 * 1000, a.cost)) {
                    showMsg(`${a.name} installed! Active for 5 days.`, "green");
                  }
                }}
                  className={`w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold transition ${active ? "bg-green-600/20 border border-green-500/40 text-green-300" : "bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-green-600/30"}`}>
                  {active ? "🔄 Renew 5 Days" : `Install — $${a.cost.toLocaleString()}`} (5d)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Safe Houses — Buy & Upgrade */}
      {tab === "safehouse" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-200">Your Safe House Level</div>
              <div className="text-lg font-black text-amber-400">Lv.{safehouseLevel}</div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mb-2">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, safehouseLevel * 10)}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">Each level = +15% protection, more storage, faster healing</div>
          </div>
          {[
            { name: "Shabby Apartment", cost: 50000, desc: "Downtown — low profile, single bed, basic locks" },
            { name: "Suburban Hideout", cost: 200000, desc: "Quiet neighborhood — family cover, panic room" },
            { name: "Industrial Loft", cost: 500000, desc: "Converted warehouse — armory, tunnel access" },
            { name: "Underground Bunker", cost: 2000000, desc: "30ft underground — blast doors, 30-day supplies" },
            { name: "Mansion Safe Room", cost: 5000000, desc: "Hidden room — panic button, escape tunnel" },
          ].map((s, i) => {
            const needed = i + 1;
            const canAfford = (player?.money ?? 0) >= s.cost;
            const isUpgrade = safehouseLevel < needed;
            const isMax = safehouseLevel >= needed;
            return (
              <div key={s.name} className={`mafia-card rounded-xl p-4 border transition-all ${isMax ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">🏠</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{s.name}</span>
                      {isMax && <span className="text-[9px] px-1.5 py-0.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-full font-bold">OWNED</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.desc}</div>
                  </div>
                </div>
                {isUpgrade && (
                  <button onClick={() => {
                    if (!canAfford) { showMsg(`Need $${s.cost.toLocaleString()}`, "red"); return; }
                    try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) - s.cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                    setSafehouseLevel(needed);
                    save("empireSafehouse", needed);
                    showMsg(`${s.name} acquired! Safe house upgraded to Level ${needed}`, "green");
                  }} className="w-full mt-2 px-3 py-2 bg-green-600/20 border border-green-500/40 text-green-300 rounded-xl text-xs font-bold hover:bg-green-600/30 transition">
                    Upgrade — ${s.cost.toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Escape Routes — Buy & Upgrade */}
      {tab === "escape" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-200">Escape Route Level</div>
              <div className="text-lg font-black text-amber-400">Lv.{escapeLevel}</div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mb-2">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all" style={{ width: `${Math.min(100, escapeLevel * 20)}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">Higher level = faster extraction, better vehicles, more routes</div>
          </div>
          {[
            { name: "Getaway Driver", cost: 30000, desc: "Pre-planned driver — 2 min pickup, sedan", level: 1 },
            { name: "Tunnel Network", cost: 500000, desc: "Underground escape — access to 3 exit points", level: 2 },
            { name: "Helicopter Extraction", cost: 1000000, desc: "Chopper on standby — 30 sec pickup", level: 3 },
            { name: "Submarine Escape", cost: 5000000, desc: "Water exit — submarine to offshore", level: 4 },
            { name: "Full Extraction Unit", cost: 10000000, desc: "Multi-vehicle convoy — decoys + satellite jamming", level: 5 },
          ].map((e, i) => {
            const needed = i + 1;
            const owned = escapeLevel >= needed;
            return (
              <div key={e.name} className={`mafia-card rounded-xl p-4 border transition-all ${owned ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚪</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{e.name}</span>
                      {owned && <span className="text-[9px] px-1.5 py-0.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-full font-bold">OWNED</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">{e.desc}</div>
                  </div>
                </div>
                {!owned && (
                  <button onClick={() => {
                    if (escapeLevel !== needed - 1) { showMsg(`Must upgrade sequentially! Current: Lv.${escapeLevel}`, "red"); return; }
                    const canAfford2 = (player?.money ?? 0) >= e.cost;
                    if (!canAfford2) { showMsg(`Need $${e.cost.toLocaleString()}`, "red"); return; }
                    try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) - e.cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                    setEscapeLevel(needed);
                    save("empireEscape", needed);
                    showMsg(`${e.name} acquired! Route Level ${needed}`, "green");
                  }} className="w-full mt-2 px-3 py-2 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold hover:bg-amber-600/30 transition">
                    Upgrade — ${e.cost.toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Body Armor — Consumable, breaks when shot */}
      {tab === "armor" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-200">Armor Durability</div>
              <div className={`text-lg font-black ${armorDurability > 50 ? "text-green-400" : armorDurability > 20 ? "text-yellow-400" : "text-red-400"}`}>{armorDurability}%</div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full">
              <div className="h-full rounded-full transition-all" style={{ width: `${armorDurability}%`, background: armorDurability > 50 ? "#22c55e" : armorDurability > 20 ? "#eab308" : "#ef4444" }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">💡 Armor breaks when you get shot. Buy new armor after combat.</div>
          </div>
          {[
            { name: "Leather Jacket", cost: 5000, def: 5, durability: 30, icon: "🧥", desc: "Minimal protection — stops knife wounds" },
            { name: "Kevlar Vest", cost: 25000, def: 15, durability: 60, icon: "🦺", desc: "Stops handgun rounds — torso only" },
            { name: "Ballistic Plate Carrier", cost: 75000, def: 30, durability: 80, icon: "🛡️", desc: "Military-grade — stops rifle rounds" },
            { name: "Full Tactical Kit", cost: 200000, def: 50, durability: 100, icon: "🎖️", desc: "Full body protection — helmet included" },
            { name: "Dragon Skin", cost: 1000000, def: 80, durability: 150, icon: "🤖", desc: "Next-gen scale armor — nearly indestructible" },
          ].map(a => (
            <div key={a.name} className="mafia-card rounded-xl p-4 border border-amber-500/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{a.name}</div>
                  <div className="text-[10px] text-slate-400">{a.desc}</div>
                  <div className="text-[10px] text-blue-400">DEF +{a.def} • {a.durability} durability</div>
                </div>
              </div>
              <button onClick={() => {
                const canAfford3 = (player?.money ?? 0) >= a.cost;
                if (!canAfford3) { showMsg(`Need $${a.cost.toLocaleString()}`, "red"); return; }
                try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) - a.cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                setArmorDurability(a.durability);
                save("empireArmor", a.durability);
                showMsg(`${a.name} equipped! DEF +${a.def}, ${a.durability} durability`, "green");
              }} className="w-full mt-2 px-3 py-2 bg-green-600/20 border border-green-500/40 text-green-300 rounded-xl text-xs font-bold hover:bg-green-600/30 transition">
                Buy — ${a.cost.toLocaleString()}
              </button>
            </div>
          ))}
          <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-[10px] text-red-300">
            ⚠️ Armor breaks when hit in combat. Higher durability = more shots absorbed. Replace after every major fight.
          </div>
        </div>
      )}

      {/* Gun Permits — Required for firearms + bullets */}
      {tab === "permits" && (
        <div className="space-y-3">
          <div className={`mafia-card rounded-xl p-4 border ${hasPermit > 0 ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className="text-sm font-bold text-slate-200 mb-1">Firearm License Status</div>
            <div className={`text-xs font-bold ${hasPermit > 0 ? "text-green-400" : "text-red-400"}`}>
              {hasPermit === 0 ? "❌ No permit — cannot own firearms" : hasPermit === 1 ? "✅ Basic — handguns only" : hasPermit === 2 ? "✅ Advanced — all legal weapons" : hasPermit === 3 ? "✅ Class III — automatic weapons" : "✅ FFL — can sell weapons legally"}
            </div>
          </div>
          {[
            { id: 1, name: "Concealed Carry Permit", cost: 50000, bonus: "+5 ATK • Handgun carry", icon: "📋", desc: "Basic handgun license — legal carry on your person" },
            { id: 2, name: "Firearms License", cost: 150000, bonus: "+10 ATK • All legal weapons", icon: "🔫", desc: "Full firearms license — rifles, shotguns, handguns" },
            { id: 3, name: "Class III Permit", cost: 500000, bonus: "+15 ATK • Automatic weapons", icon: "💥", desc: "NFA stamp — machine guns, suppressors, SBS" },
            { id: 4, name: "FFL License", cost: 2000000, bonus: "+20 ATK • Sell weapons", icon: "🏪", desc: "Federal Firearms License — deal weapons legally" },
          ].map(p => {
            const owned = hasPermit >= p.id;
            return (
              <div key={p.id} className={`mafia-card rounded-xl p-4 border transition-all ${owned ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{p.name}</span>
                      {owned && <span className="text-[9px] px-1.5 py-0.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-full font-bold">OWNED</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">{p.desc}</div>
                    <div className="text-[10px] text-amber-400 font-bold">{p.bonus}</div>
                  </div>
                </div>
                {!owned && (
                  <button onClick={() => {
                    if (hasPermit !== p.id - 1 && p.id > 1) { showMsg(`Must get permits in order! Current: ${["None","Basic","Advanced","Class III"][hasPermit]}`, "red"); return; }
                    const canAfford4 = (player?.money ?? 0) >= p.cost;
                    if (!canAfford4) { showMsg(`Need $${p.cost.toLocaleString()}`, "red"); return; }
                    try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) - p.cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                    setHasPermit(p.id);
                    save("empirePermit", p.id);
                    showMsg(`${p.name} obtained! You can now own firearms.`, "green");
                  }} className="w-full mt-2 px-3 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition">
                    Get Permit — ${p.cost.toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Alibi System — 7 days active */}
      {tab === "alibi" && (
        <div className="space-y-3">
          {alibiUntil > Date.now() && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
              <div className="text-sm font-bold text-green-400">🎭 Alibi Active</div>
              <div className="text-xs text-green-300">{formatTime(alibiUntil - Date.now())} remaining</div>
            </div>
          )}
          {[
            { name: "Witness Coercion", cost: 20000, strength: "60%", desc: "Paid witnesses — shaky but passable", icon: "👥" },
            { name: "Time-Stamped Receipts", cost: 15000, strength: "50%", desc: "Receipts proving you were elsewhere", icon: "🧾" },
            { name: "Photo Manipulation", cost: 50000, strength: "75%", desc: "Photoshopped evidence — good but detectable", icon: "📷" },
            { name: "Location Spoofing", cost: 100000, strength: "85%", desc: "GPS spoofing — digital trail proves alibi", icon: "📍" },
            { name: "Video Deepfake", cost: 200000, strength: "95%", desc: "AI-generated video — nearly flawless", icon: "🎬" },
          ].map(a => {
            const active = alibiUntil > Date.now();
            return (
              <div key={a.name} className={`mafia-card rounded-xl p-4 border transition-all ${active ? "border-green-500/30" : "border-amber-500/10"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{a.name}</div>
                    <div className="text-[10px] text-slate-400">{a.desc}</div>
                    <div className="text-[10px] text-amber-400">Strength: {a.strength}</div>
                  </div>
                </div>
                <button onClick={() => {
                  const canAfford5 = (player?.money ?? 0) >= a.cost;
                  if (!canAfford5) { showMsg(`Need $${a.cost.toLocaleString()}`, "red"); return; }
                  try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) - a.cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                  setAlibiUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  save("empireAlibi", Date.now() + 7 * 24 * 60 * 60 * 1000);
                  showMsg(`${a.name} alibi prepared! Active for 7 days.`, "green");
                }} className={`w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold transition ${active ? "bg-green-600/20 border border-green-500/40 text-green-300" : "bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30"}`}>
                  {active ? "🔄 Renew 7 Days" : `Create — $${a.cost.toLocaleString()}`} (7d)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Safe Cracking — Requires Level 10+ */}
      {tab === "safecrack" && (
        <div className="space-y-3">
          <div className={`mafia-card rounded-xl p-4 border ${playerLevel >= 10 ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className="text-sm font-bold text-slate-200 mb-1">Safe Cracking Skill</div>
            <div className={`text-xs font-bold ${playerLevel >= 10 ? "text-green-400" : "text-red-400"}`}>
              {playerLevel >= 10 ? `✅ Level ${playerLevel} — You can crack safes` : `❌ Level ${playerLevel} — Requires Level 10+ to crack safes`}
            </div>
          </div>
          {[
            { name: "Simple Dial Lock", difficulty: "Easy", reward: "5K-25K", icon: "🔒", reqLevel: 10 },
            { name: "Digital Keypad", difficulty: "Medium", reward: "25K-100K", icon: "🔢", reqLevel: 15 },
            { name: "Time Lock Vault", difficulty: "Hard", reward: "100K-500K", icon: "⏰", reqLevel: 25 },
            { name: "Biometric Safe", difficulty: "Expert", reward: "500K-2M", icon: "🖐️", reqLevel: 40 },
            { name: "Bank Vault", difficulty: "Master", reward: "2M-10M", icon: "🏦", reqLevel: 60 },
          ].map(s => {
            const canCrack = playerLevel >= s.reqLevel;
            return (
              <div key={s.name} className={`mafia-card rounded-xl p-4 border transition-all ${canCrack ? "border-amber-500/20" : "border-red-500/10 opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{s.name}</div>
                    <div className="text-[10px] text-slate-400">Difficulty: {s.difficulty} • Reward: {s.reward}</div>
                    {!canCrack && <div className="text-[10px] text-red-400">🔒 Requires Level {s.reqLevel}</div>}
                  </div>
                </div>
                <button onClick={() => {
                  if (!canCrack) { showMsg(`Need Level ${s.reqLevel} to crack this safe!`, "red"); return; }
                  // Crack attempt — random success based on level
                  const success = Math.random() < Math.min(0.9, 0.3 + (playerLevel - s.reqLevel) * 0.02);
                  if (success) {
                    const reward = Math.floor(Math.random() * 50000 + 5000);
                    try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) + reward; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                    showMsg(`🔓 CRACKED! Stole $${reward.toLocaleString()}!`, "green");
                  } else {
                    const dmg = Math.floor(Math.random() * 20 + 5);
                    showMsg(`❌ Failed! The alarm triggered. Lost ${dmg} HP.`, "red");
                  }
                }} disabled={!canCrack} className={`w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold transition ${canCrack ? "bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30" : "bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed"}`}>
                  {canCrack ? "🔐 Crack Safe" : `🔒 Level ${s.reqLevel} Required`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Lockpick — Skill-based, improves crime success */}
      {tab === "lockpick" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-200">Lockpick Skill</div>
              <div className="text-lg font-black text-amber-400">Lv.{Math.min(10, Math.floor(lockpickLevel))}</div>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full mb-2">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, lockpickXP / 10)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{lockpickXP} / {Math.max(100, lockpickLevel * 100)} XP</span>
              <span>{Math.min(10, Math.floor(lockpickLevel))}/10 levels</span>
            </div>
            <div className="mt-2 text-[10px] text-green-400">
              💡 Better lockpick level = +{Math.min(30, lockpickLevel * 3)}% success rate on ALL criminal activities
            </div>
          </div>
          {[
            { name: "Practice Lock", xp: 50, desc: "Basic tumbler — perfect for beginners", icon: "🔒" },
            { name: "Deadbolt", xp: 150, desc: "Standard door lock — moderate difficulty", icon: "🚪" },
            { name: "Combination Lock", xp: 300, desc: "3-number combo — steady hands required", icon: "🔢" },
            { name: "High-Security Lock", xp: 600, desc: "Pick-resistant pins — requires precision", icon: "🔐" },
            { name: "Electronic Lock", xp: 1000, desc: "Hack + pick combo — ultimate challenge", icon: "💻" },
          ].map(l => (
            <button key={l.name} onClick={() => {
              const newXP = lockpickXP + l.xp;
              const needed = Math.max(100, lockpickLevel * 100);
              let newLevel = lockpickLevel;
              let remainingXP = newXP;
              while (remainingXP >= Math.max(100, newLevel * 100) && newLevel < 10) {
                remainingXP -= Math.max(100, newLevel * 100);
                newLevel++;
              }
              setLockpickLevel(newLevel);
              setLockpickXP(remainingXP);
              save("empireLockpick", newLevel);
              save("empireLockpickXP", remainingXP);
              const levelUp = newLevel > lockpickLevel;
              showMsg(`Picked ${l.name}! +${l.xp} XP${levelUp ? ` 🎉 LEVEL UP! Now Lv.${newLevel}` : ""}`, levelUp ? "green" : "amber");
            }}
              className="mafia-card rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/20 transition w-full text-left">
              <span className="text-lg">🔑</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-200">{l.name}</div>
                <div className="text-[10px] text-slate-400">{l.desc}</div>
              </div>
              <span className="text-[10px] text-amber-400">+{l.xp} XP →</span>
            </button>
          ))}
        </div>
      )}

      {/* Counter-Surveillance — Buy & Upgrade */}
      {tab === "counter" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-200">Counter-Surveillance Level</div>
              <div className="text-lg font-black text-amber-400">Lv.{counterLevel}</div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mb-2">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all" style={{ width: `${Math.min(100, counterLevel * 16)}%` }} />
            </div>
            <div className="text-[10px] text-slate-400">Higher level = better detection of surveillance on you</div>
          </div>
          {[
            { name: "Sweep for Bugs", cost: 15000, desc: "Find and remove wiretaps — basic sweep", level: 1, icon: "📡" },
            { name: "Check for Tails", cost: 10000, desc: "Detect if someone is following you", level: 1, icon: "👀" },
            { name: "Counter-Drone", cost: 75000, desc: "Jam and disable surveillance drones", level: 2, icon: "🛸" },
            { name: "RFID Shield", cost: 5000, desc: "Block tracking chips in your vehicles", level: 1, icon: "🛡️" },
            { name: "Digital Audit", cost: 100000, desc: "Scan for keyloggers, spyware, backdoors", level: 3, icon: "💻" },
            { name: "TSCM Full Sweep", cost: 200000, desc: "Professional sweep of entire property — top-tier", level: 4, icon: "🔍" },
          ].map(c => {
            const canUse = counterLevel >= c.level;
            return (
              <div key={c.name} className={`mafia-card rounded-xl p-4 border transition-all ${canUse ? "border-amber-500/10" : "border-red-500/10 opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.desc}</div>
                    {!canUse && <div className="text-[10px] text-red-400">🔒 Requires Counter-Surveillance Lv.{c.level}</div>}
                  </div>
                </div>
                <button onClick={() => {
                  if (!canUse) { showMsg(`Need Counter-Surveillance Level ${c.level}!`, "red"); return; }
                  if (counterLevel < c.level) {
                    // Buy upgrade
                    const canAfford6 = (player?.money ?? 0) >= c.cost;
                    if (!canAfford6) { showMsg(`Need $${c.cost.toLocaleString()}`, "red"); return; }
                    try { const d = JSON.parse(localStorage.getItem("playerData") || "{}"); d.money = (d.money ?? 0) - c.cost; localStorage.setItem("playerData", JSON.stringify(d)); } catch {}
                    setCounterLevel(c.level);
                    save("empireCounter", c.level);
                    showMsg(`${c.name} acquired! Counter-Surveillance Level ${c.level}`, "green");
                  } else {
                    showMsg(`${c.name} — sweep complete. No surveillance detected.`, "green");
                  }
                }} className={`w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold transition ${canUse ? "bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30" : "bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed"}`}>
                  {canUse ? "🔍 Run Sweep" : `🔒 Lv.${c.level} Required — $${c.cost.toLocaleString()}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════ EXPORTS ═══════════ *//* ═══════════ EXPORTS ═══════════ */
export { EmpireBuildingPage, RelationshipsPage, SurvivalRealismPage, SecurityDefensePage };

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

function EmpireBuildingPage() {
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

function RelationshipsPage() {
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

function SurvivalRealismPage() {
  const [tab, setTab] = useState("hospital");
  const [msg, setMsg] = useState("");
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

  return (
    <div className="animate-fade-in space-y-4">
      <SectionTitle icon="💀" title="Survival & Realism" sub="Stay alive, manage addictions, and cover your tracks" />
      {msg && <div className="px-4 py-2 bg-amber-600/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 text-center">{msg}</div>}
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {tab === "hospital" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 text-center">
            <div className="text-sm text-slate-400">Current Health</div>
            <div className="text-3xl font-black text-red-400">120 / 120</div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "ER Visit", cost: 5000, heal: 30, time: "10 min", icon: "🚑" },
              { name: "Standard Care", cost: 15000, heal: 60, time: "20 min", icon: "💊" },
              { name: "VIP Ward", cost: 50000, heal: 100, time: "5 min", icon: "🏨" },
              { name: "Full Recovery", cost: 150000, heal: "MAX", time: "Instant", icon: "✨" },
            ].map(t => (
              <div key={t.name} className="mafia-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1"><span className="text-xl">{t.icon}</span><span className="text-sm font-bold text-slate-200">{t.name}</span></div>
                <div className="text-[10px] text-slate-400">Heal: {t.heal} HP | Time: {t.time}</div>
                <button onClick={() => setMsg(`Treated at ${t.name}`)} className="w-full mt-2 px-3 py-1.5 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-xs font-bold">
                  ${t.cost.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "surgery" && (
        <div className="space-y-3">
          {[
            { name: "Emergency Surgery", cost: 200000, desc: "Fix critical injuries — recover from near-death", risk: "5% complication", icon: "🔴" },
            { name: "Organ Transplant", cost: 1000000, desc: "Replace damaged organ — restore full health", risk: "15% rejection", icon: "🫀" },
            { name: "Cybernetic Implant", cost: 5000000, desc: "Mechanical arm/eye — permanent stat boost", risk: "10% malfunction", icon: "🤖" },
            { name: "Clone Backup", cost: 25000000, desc: "Clone body backup — instant respawn on death", risk: "Memory loss possible", icon: "🧬" },
          ].map(s => (
            <div key={s.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <div><div className="text-sm font-bold text-slate-200">{s.name}</div><div className="text-[10px] text-slate-400">{s.desc}</div></div>
              </div>
              <div className="text-[10px] text-red-400 mb-2">⚠️ Risk: {s.risk}</div>
              <button onClick={() => setMsg(`Scheduled ${s.name}`)} className="w-full px-3 py-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-bold">
                Schedule — ${s.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "addiction" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">Your Addiction Levels</div>
            {[
              { name: "Alcohol", level: 35, icon: "🍺" },
              { name: "Gambling", level: 60, icon: "🎰" },
              { name: "Painkillers", level: 15, icon: "💊" },
              { name: "Stimulants", level: 0, icon: "💉" },
            ].map(a => (
              <div key={a.name} className="flex items-center gap-3 mb-2">
                <span className="text-lg">{a.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs"><span className="text-slate-300">{a.name}</span><span className={a.level > 50 ? "text-red-400" : a.level > 20 ? "text-yellow-400" : "text-green-400"}>{a.level}%</span></div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1">
                    <div className="h-full rounded-full" style={{ width: `${a.level}%`, background: a.level > 50 ? "#ef4444" : a.level > 20 ? "#eab308" : "#22c55e" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mafia-card rounded-xl p-4 border border-red-500/20">
            <div className="text-xs text-slate-400 space-y-1">
              <div>• <b className="text-slate-300">Gambling addiction</b> — -10% crime income, +20% gambling losses</div>
              <div>• <b className="text-slate-300">Alcohol addiction</b> — -5% accuracy, random blackout events</div>
              <div>• <b className="text-slate-300">Painkiller addiction</b> — -10% defense, healthcare costs x2</div>
              <div>• <b className="text-slate-300">Stimulant addiction</b> — +15% speed but -20% max HP</div>
            </div>
          </div>
        </div>
      )}

      {tab === "mental" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-2">Mental State</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Stress", value: 45, icon: "😰" },
                { label: "Paranoia", value: 30, icon: "👁️" },
                { label: "Guilt", value: 10, icon: "😞" },
                { label: "Focus", value: 80, icon: "🎯" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <div className="text-lg">{s.icon}</div>
                  <div className="text-xs font-bold text-slate-200">{s.value}%</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setMsg("Meditation session — stress reduced")} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🧘</div><div className="text-xs font-bold text-slate-200">Meditate</div><div className="text-[10px] text-slate-400">-15% Stress</div>
            </button>
            <button onClick={() => setMsg("Therapy session — guilt reduced")} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🛋️</div><div className="text-xs font-bold text-slate-200">Therapy</div><div className="text-[10px] text-slate-400">-20% Guilt ($50K)</div>
            </button>
            <button onClick={() => setMsg("Boxing session — stress and paranoia reduced")} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🥊</div><div className="text-xs font-bold text-slate-200">Boxing</div><div className="text-[10px] text-slate-400">-10% Stress, -5% Paranoia</div>
            </button>
            <button onClick={() => setMsg("Night out — stress reduced but guilt increased")} className="mafia-card rounded-xl p-3 text-center hover:border-amber-500/20 transition">
              <div className="text-xl mb-1">🍸</div><div className="text-xs font-bold text-slate-200">Night Out</div><div className="text-[10px] text-slate-400">-25% Stress, +10% Guilt</div>
            </button>
          </div>
        </div>
      )}

      {tab === "insurance_fraud" && (
        <div className="space-y-3">
          {[
            { name: "Fake Car Accident", cost: 20000, payout: "80K-150K", risk: "15% caught", icon: "🚗" },
            { name: "Staged Break-In", cost: 15000, payout: "50K-100K", risk: "10% caught", icon: "🏠" },
            { name: "Phantom Injury", cost: 10000, payout: "30K-60K", risk: "20% caught", icon: "🤕" },
            { name: "Arson Claim", cost: 50000, payout: "200K-500K", risk: "25% caught", icon: "🔥" },
            { name: "Medical Fraud", cost: 30000, payout: "100K-250K", risk: "18% caught", icon: "🏥" },
          ].map(f => (
            <div key={f.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{f.icon}</span>
                <div><div className="text-sm font-bold text-slate-200">{f.name}</div><div className="text-[10px] text-slate-400">Payout: {f.payout}</div></div>
              </div>
              <div className="text-[10px] text-red-400 mb-2">⚠️ {f.risk} of investigation</div>
              <button onClick={() => setMsg(`Filed ${f.name} claim`)} className="w-full px-3 py-1.5 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-xs font-bold">
                File Claim — ${f.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "rehab" && (
        <div className="space-y-3">
          {[
            { name: "Outpatient Program", cost: 100000, clean: "All addictions -20%", time: "7 days", icon: "🏠" },
            { name: "30-Day Facility", cost: 500000, clean: "All addictions -50%", time: "30 days", icon: "🏥" },
            { name: "Premium Rehab", cost: 2000000, clean: "All addictions FULL RESET", time: "14 days", icon: "✨" },
            { name: "Detox Center", cost: 25000, clean: "Random addiction -30%", time: "3 days", icon: "💊" },
          ].map(r => (
            <div key={r.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{r.icon}</span>
                <div><div className="text-sm font-bold text-slate-200">{r.name}</div><div className="text-[10px] text-slate-400">{r.clean} | {r.time}</div></div>
              </div>
              <button onClick={() => setMsg(`Enrolled in ${r.name}`)} className="w-full mt-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-bold">
                ${r.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "organ" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4 border border-red-500/20">
            <div className="text-sm font-bold text-red-400 mb-2">🫀 Organ Trafficking</div>
            <div className="text-xs text-slate-400">High risk, high reward. Get caught = 10 years prison.</div>
          </div>
          {[
            { name: "Kidney Sale", payout: "150K-300K", risk: "20% detection", icon: "🫘" },
            { name: "Liver Deal", payout: "200K-400K", risk: "25% detection", icon: "🫀" },
            { name: "Heart Heist", payout: "500K-1M", risk: "35% detection", icon: "❤️" },
            { name: "Eye Harvest", payout: "100K-200K", risk: "15% detection", icon: "👁️" },
          ].map(o => (
            <div key={o.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{o.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{o.name}</div><div className="text-[10px] text-slate-400">Payout: {o.payout}</div></div>
                <div className="text-[10px] text-red-400">{o.risk}</div>
              </div>
              <button onClick={() => setMsg(`Completed ${o.name} deal`)} className="w-full mt-2 px-3 py-1.5 bg-red-600/20 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold">
                Execute
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "disposal" && (
        <div className="space-y-3">
          {[
            { name: "Acid Bath", cost: 25000, chance: "95% clean", icon: "🧪" },
            { name: "Ocean Dump", cost: 10000, chance: "80% clean", icon: "🌊" },
            { name: "Incinerator", cost: 50000, chance: "99% clean", icon: "🔥" },
            { name: "Burial (Remote)", cost: 5000, chance: "60% clean", icon: "⚰️" },
            { name: "Pig Farm", cost: 15000, chance: "90% clean", icon: "🐷" },
          ].map(d => (
            <div key={d.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{d.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{d.name}</div><div className="text-[10px] text-slate-400">Success: {d.chance}</div></div>
                <button onClick={() => setMsg(`${d.name} — body disposed`)} className="px-3 py-1 bg-slate-600/20 border border-slate-500/30 text-slate-300 rounded-lg text-[10px] font-bold">
                  ${d.cost.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "evidence" && (
        <div className="space-y-3">
          {[
            { name: "Burn Evidence", cost: 5000, desc: "Destroy physical evidence — documents, weapons", icon: "🔥" },
            { name: "Hack Database", cost: 50000, desc: "Erase digital records — fingerprints, DNA", icon: "💻" },
            { name: "Bribe Forensics", cost: 100000, desc: "Pay lab techs to lose samples", icon: "💰" },
            { name: "Plant False Evidence", cost: 75000, desc: "Frame a rival for your crime", icon: "🎭" },
            { name: "Destroy Security Footage", cost: 30000, desc: "Hack and delete all nearby cameras", icon: "📹" },
          ].map(e => (
            <div key={e.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{e.icon}</span>
                <div><div className="text-sm font-bold text-slate-200">{e.name}</div><div className="text-[10px] text-slate-400">{e.desc}</div></div>
              </div>
              <button onClick={() => setMsg(`${e.name} — done!`)} className="w-full px-3 py-1.5 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold">
                ${e.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "costs" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">Hospital Cost Breakdown</div>
            <div className="space-y-2 text-xs">
              {[
                { service: "ER Triage", cost: "$2,500" },
                { service: "X-Ray", cost: "$1,500" },
                { service: "Blood Work", cost: "$3,000" },
                { service: "MRI Scan", cost: "$8,000" },
                { service: "Surgery (Minor)", cost: "$25,000" },
                { service: "Surgery (Major)", cost: "$100,000" },
                { service: "ICU Night", cost: "$15,000" },
                { service: "Ambulance", cost: "$5,000" },
                { service: "Medication", cost: "$1,000-$10,000" },
              ].map(c => (
                <div key={c.service} className="flex justify-between p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-400">{c.service}</span>
                  <span className="text-amber-400 font-bold">{c.cost}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mafia-card rounded-xl p-4 border border-green-500/20">
            <div className="text-xs text-green-400">💡 Health insurance reduces all costs by 50%. Life insurance pays $500K on death.</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   🛡️ SECURITY & DEFENSE
   ═══════════════════════════════════════════ */

function SecurityDefensePage() {
  const [tab, setTab] = useState("guards");
  const [msg, setMsg] = useState("");
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
      {msg && <div className="px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-xs text-blue-300 text-center">{msg}</div>}
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {tab === "guards" && (
        <div className="space-y-3">
          {[
            { name: "Street Guard", cost: 5000, daily: 2000, def: 15, icon: "👮" },
            { name: "Armed Guard", cost: 25000, daily: 8000, def: 35, icon: "🔫" },
            { name: "SWAT Veteran", cost: 100000, daily: 25000, def: 60, icon: "🎖️" },
            { name: "Ex-Special Forces", cost: 500000, daily: 75000, def: 85, icon: "⭐" },
            { name: "Private Army", cost: 2000000, daily: 200000, def: 100, icon: "💀" },
          ].map(g => (
            <div key={g.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{g.name}</div><div className="text-[10px] text-slate-400">DEF +{g.def} | ${g.daily.toLocaleString()}/day</div></div>
              </div>
              <button onClick={() => setMsg(`Hired ${g.name}`)} className="w-full px-3 py-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-bold">
                Hire — ${g.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "alarms" && (
        <div className="space-y-3">
          {[
            { name: "Basic Alarm", cost: 10000, protection: "10% raid defense", icon: "🔔" },
            { name: "Smart Alarm System", cost: 50000, protection: "25% raid defense", icon: "📱" },
            { name: "Motion Sensors", cost: 100000, protection: "40% raid defense", icon: "📡" },
            { name: "AI Security Grid", cost: 500000, protection: "65% raid defense", icon: "🤖" },
            { name: "Full Fortress", cost: 2000000, protection: "90% raid defense", icon: "🏰" },
          ].map(a => (
            <div key={a.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{a.name}</div><div className="text-[10px] text-green-400">{a.protection}</div></div>
                <button onClick={() => setMsg(`Installed ${a.name}`)} className="px-3 py-1 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-[10px] font-bold">
                  ${a.cost.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "safehouse" && (
        <div className="space-y-3">
          {[
            { name: "Shabby Apartment", cost: 50000, slots: 1, desc: "Downtown — low profile, single bed" },
            { name: "Suburban Hideout", cost: 200000, slots: 3, desc: "Quiet neighborhood — family cover" },
            { name: "Industrial Loft", cost: 500000, slots: 5, desc: "Converted warehouse — armory included" },
            { name: "Underground Bunker", cost: 2000000, slots: 10, desc: "30ft underground — blast doors, supplies for weeks" },
            { name: "Mansion Safe Room", cost: 5000000, slots: 8, desc: "Hidden room behind bookshelf — panic button" },
          ].map(s => (
            <div key={s.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">🏠</span>
                <div><div className="text-sm font-bold text-slate-200">{s.name}</div><div className="text-[10px] text-slate-400">{s.desc} | {s.slots} people</div></div>
              </div>
              <button onClick={() => setMsg(`Acquired ${s.name}`)} className="w-full mt-2 px-3 py-1.5 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-xs font-bold">
                ${s.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "escape" && (
        <div className="space-y-3">
          {[
            { name: "Getaway Driver", cost: 30000, desc: "Pre-planned driver waiting within 2 min", icon: "🚗" },
            { name: "Tunnel Network", cost: 500000, desc: "Underground escape route from your hideout", icon: "🚇" },
            { name: "Helicopter Extraction", cost: 1000000, desc: "Chopper on standby — 30 sec pickup", icon: "🚁" },
            { name: "Submarine Escape", cost: 5000000, desc: "Water exit via submarine dock", icon: "🚢" },
            { name: "Decoy Convoy", cost: 100000, desc: "Fake motorcade to distract pursuers", icon: "🚓" },
          ].map(e => (
            <div key={e.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{e.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{e.name}</div><div className="text-[10px] text-slate-400">{e.desc}</div></div>
                <button onClick={() => setMsg(`Prepared ${e.name}`)} className="px-3 py-1 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold">
                  ${e.cost.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "armor" && (
        <div className="space-y-3">
          {[
            { name: "Leather Jacket", cost: 5000, def: 5, icon: "🧥" },
            { name: "Kevlar Vest", cost: 25000, def: 15, icon: "🦺" },
            { name: "Ballistic Plate Carrier", cost: 75000, def: 30, icon: "🛡️" },
            { name: "Full Tactical Kit", cost: 200000, def: 50, icon: "🎖️" },
            { name: "Titanium Exosuit", cost: 1000000, def: 80, icon: "🤖" },
          ].map(a => (
            <div key={a.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{a.name}</div><div className="text-[10px] text-green-400">+{a.def} DEF</div></div>
                <button onClick={() => setMsg(`Equipped ${a.name}`)} className="px-3 py-1 bg-green-600/20 border border-green-500/40 text-green-300 rounded-lg text-[10px] font-bold">
                  ${a.cost.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "permits" && (
        <div className="space-y-3">
          {[
            { name: "Concealed Carry", cost: 50000, bonus: "+5 ATK, legal weapon carry", icon: "📋" },
            { name: "Firearms License", cost: 150000, bonus: "+10 ATK, all legal weapons", icon: "🔫" },
            { name: "Class III Permit", cost: 500000, bonus: "+15 ATK, automatic weapons legal", icon: "💥" },
            { name: "FFL License", cost: 2000000, bonus: "+20 ATK, sell weapons legally", icon: "🏪" },
          ].map(p => (
            <div key={p.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{p.name}</div><div className="text-[10px] text-slate-400">{p.bonus}</div></div>
                <button onClick={() => setMsg(`Obtained ${p.name}`)} className="px-3 py-1 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-lg text-[10px] font-bold">
                  ${p.cost.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "alibi" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-2">Alibi System</div>
            <div className="text-xs text-slate-400 mb-3">Create ironclad proof you were somewhere else during a crime</div>
            {[
              { name: "Witness Coercion", cost: 20000, strength: "60% — paid witnesses", icon: "👥" },
              { name: "Photo Manipulation", cost: 50000, strength: "75% — edited photos", icon: "📷" },
              { name: "Video Deepfake", cost: 200000, strength: "90% — AI-generated video", icon: "🎬" },
              { name: "Location Spoofing", cost: 100000, strength: "85% — fake GPS data", icon: "📍" },
              { name: "Time-Stamped Receipts", cost: 15000, strength: "50% — receipts from your location", icon: "🧾" },
            ].map(a => (
              <div key={a.name} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-lg mb-2">
                <span className="text-lg">{a.icon}</span>
                <div className="flex-1"><div className="text-xs font-bold text-slate-200">{a.name}</div><div className="text-[10px] text-slate-400">{a.strength}</div></div>
                <button onClick={() => setMsg(`Created ${a.name} alibi`)} className="px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded text-[10px] font-bold">
                  ${a.cost.toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "safecrack" && (
        <div className="space-y-3">
          {[
            { name: "Simple Dial Lock", difficulty: "Easy", reward: "5K-25K", icon: "🔒" },
            { name: "Digital Keypad", difficulty: "Medium", reward: "25K-100K", icon: "🔢" },
            { name: "Time Lock Vault", difficulty: "Hard", reward: "100K-500K", icon: "⏰" },
            { name: "Biometric Safe", difficulty: "Expert", reward: "500K-2M", icon: "🖐️" },
            { name: "Bank Vault", difficulty: "Master", reward: "2M-10M", icon: "🏦" },
          ].map(s => (
            <div key={s.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-400">Difficulty: {s.difficulty} | Reward: {s.reward}</div>
                </div>
                <button onClick={() => setMsg(`Cracking ${s.name}...`)} className="px-3 py-1 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold">
                  Crack
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "lockpick" && (
        <div className="space-y-3">
          <div className="mafia-card rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-2">Lockpick Skill</div>
            <div className="w-full h-3 bg-slate-800 rounded-full mb-2">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: "45%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Level 4 / 10</span>
              <span>450 / 1000 XP</span>
            </div>
          </div>
          {[
            { name: "Practice Lock", xp: 50, desc: "Basic tumbler — +50 XP" },
            { name: "Deadbolt", xp: 150, desc: "Standard door — +150 XP" },
            { name: "Combination Lock", xp: 300, desc: "3-number combo — +300 XP" },
            { name: "High-Security Lock", xp: 600, desc: "Pick-resistant pins — +600 XP" },
            { name: "Electronic Lock", xp: 1000, desc: "Hack + pick — +1000 XP" },
          ].map(l => (
            <button key={l.name} onClick={() => setMsg(`Picking ${l.name}... +${l.xp} XP`)}
              className="mafia-card rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/20 transition w-full text-left">
              <span className="text-lg">🔑</span>
              <div className="flex-1"><div className="text-xs font-bold text-slate-200">{l.name}</div><div className="text-[10px] text-slate-400">{l.desc}</div></div>
              <span className="text-[10px] text-amber-400">→</span>
            </button>
          ))}
        </div>
      )}

      {tab === "counter" && (
        <div className="space-y-3">
          {[
            { name: "Sweep for Bugs", cost: 15000, desc: "Find and remove wiretaps and listening devices", icon: "📡" },
            { name: "Check for Tails", cost: 10000, desc: "Detect if someone is following you", icon: "👀" },
            { name: "Counter-Drone", cost: 75000, desc: "Jam and disable surveillance drones", icon: "🛸" },
            { name: "RFID Shield", cost: 5000, desc: "Block tracking chips in your vehicles", icon: "🛡️" },
            { name: "Digital Audit", cost: 100000, desc: "Scan for keyloggers, spyware, and backdoors", icon: "💻" },
            { name: "TSCM Sweep", cost: 200000, desc: "Professional sweep of entire property", icon: "🔍" },
          ].map(c => (
            <div key={c.name} className="mafia-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1"><div className="text-sm font-bold text-slate-200">{c.name}</div><div className="text-[10px] text-slate-400">{c.desc}</div></div>
                <button onClick={() => setMsg(`${c.name} — sweep complete`)} className="px-3 py-1 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-lg text-[10px] font-bold">
                  ${c.cost.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ EXPORTS ═══════════ */
export { EmpireBuildingPage, RelationshipsPage, SurvivalRealismPage, SecurityDefensePage };

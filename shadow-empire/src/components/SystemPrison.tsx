import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ PRISON LIFE EXPANSION ═══════════ */
export function PrisonLifePage() {
  const player = useQuery(api.game.getPlayer);
  const [activeTab, setActiveTab] = useState("yard");
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const tabs = [
    { id: "yard", label: "Prison Yard", icon: "🏋️" },
    { id: "jobs", label: "Prison Jobs", icon: "🔧" },
    { id: "fights", label: "Inmate Fights", icon: "👊" },
    { id: "smuggle", label: "Contraband", icon: "📦" },
    { id: "gangs", label: "Prison Gangs", icon: "☠️" },
    { id: "escape", label: "Escape Plans", icon: "🕳️" },
    { id: "parole", label: "Parole", icon: "🆓" },
  ];

  const jobs = [
    { name: "Kitchen Worker", icon: "🍳", pay: 500, reduction: "1h", risk: "Low" },
    { name: "Laundry", icon: "👕", pay: 300, reduction: "45m", risk: "None" },
    { name: "Library Assistant", icon: "📚", pay: 400, reduction: "30m", risk: "None" },
    { name: "Construction Crew", icon: "🏗️", pay: 800, reduction: "2h", risk: "Medium" },
    { name: "Carpentry Shop", icon: "🪚", pay: 600, reduction: "1.5h", risk: "Low" },
    { name: "Gardening", icon: "🌱", pay: 350, reduction: "1h", risk: "Low" },
  ];

  const inmates = [
    { name: "Big Tony", icon: "👹", rank: "Boss", difficulty: "Hard", reward: 5000, rep: 25 },
    { name: "Slim Jimmy", icon: "🥷", rank: "Soldier", difficulty: "Easy", reward: 1500, rep: 10 },
    { name: "Crazy Mike", icon: "🤪", rank: "Enforcer", difficulty: "Medium", reward: 3000, rep: 18 },
    { name: "The Ghost", icon: "👻", rank: "Spy", difficulty: "Hard", reward: 8000, rep: 35 },
    { name: "Iron Fist", icon: "🥊", rank: "Champion", difficulty: "Extreme", reward: 15000, rep: 50 },
  ];

  const contraband = [
    { name: "Shiv", icon: "🔪", cost: 2000, effect: "+10 ATK in fights" },
    { name: "Phone", icon: "📱", cost: 5000, effect: "Access black market" },
    { name: "Lockpicks", icon: "🔐", cost: 8000, effect: "Attempt escape" },
    { name: "Body Armor", icon: "🦺", cost: 10000, effect: "+20 DEF in fights" },
    { name: "Flash Drive", icon: "💾", cost: 15000, effect: "Hack prison systems" },
    { name: "Poison", icon: "☠️", cost: 20000, effect: "Eliminate rivals silently" },
  ];

  const escapePlans = [
    { name: "Tunnel Dig", icon: "🕳️", cost: 50000, chance: 30, time: "7 days", tools: "Shovel, Flashlight" },
    { name: "Visitor Smuggle", icon: "🚗", cost: 30000, chance: 25, time: "1 day", tools: "Fake ID, Disguise" },
    { name: "Laundry Truck", icon: "🧺", cost: 15000, chance: 15, time: "Immediate", tools: "Lockpicks" },
    { name: "Helicopter extraction", icon: "🚁", cost: 200000, chance: 60, time: "Immediate", tools: "Pilot, Smoke Grenades" },
    { name: "Sewer System", icon: "🚰", cost: 25000, chance: 20, time: "3 days", tools: "Torch, Map" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⛓️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Prison Life</h2>
          <p className="text-xs text-slate-400">Survive, fight, scheme, and escape</p>
        </div>
      </div>

      {/* Prison Status */}
      <div className="grid grid-cols-4 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🔒 Sentence</div>
          <div className="text-sm font-bold text-red-400">14d 6h</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💰 Prison Cash</div>
          <div className="text-sm font-bold text-green-400">$12,500</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">👊 Fight Record</div>
          <div className="text-sm font-bold text-orange-400">7-2</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">☠️ Gang Rank</div>
          <div className="text-sm font-bold text-purple-400">Lieutenant</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${activeTab === t.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400"}`}>
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "yard" && (
        <div className="mafia-card rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-slate-200">🏋️ Prison Yard Activities</div>
          <div className="grid grid-cols-2 gap-3">
            {["Workout (+2 ATK)", "Sparring (+1 ATK/DEF)", "Info Trading", "Smuggling Runs", "Gambling Den", "Recruit Gang Members"].map((a, i) => (
              <button key={i} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl text-xs font-bold text-slate-300 hover:border-amber-500/30 transition-all text-center">
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="grid gap-2">
          {jobs.map((j, i) => (
            <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">{j.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-200 text-sm">{j.name}</div>
                <div className="text-[10px] text-slate-400">Sentence reduction: {j.reduction}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-green-400">${j.pay}</div>
                <div className={`text-[10px] font-bold ${j.risk === "None" ? "text-green-400" : j.risk === "Low" ? "text-yellow-400" : "text-red-400"}`}>{j.risk} risk</div>
              </div>
              <button className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">Work</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "fights" && (
        <div className="grid gap-2">
          {inmates.map((inmate, i) => (
            <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">{inmate.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-200 text-sm">{inmate.name}</div>
                <div className="text-[10px] text-slate-400">{inmate.rank} — {inmate.difficulty}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-green-400">${inmate.reward.toLocaleString()}</div>
                <div className="text-[10px] text-purple-400">+{inmate.rep} Rep</div>
              </div>
              <button className="px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-xs font-bold">Fight</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "smuggle" && (
        <div className="grid grid-cols-2 gap-2">
          {contraband.map((c, i) => (
            <div key={i} className="mafia-card rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.icon}</span>
                <div className="font-bold text-slate-200 text-xs">{c.name}</div>
              </div>
              <div className="text-[10px] text-slate-400">{c.effect}</div>
              <button className="w-full px-2 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold">Buy ${c.cost.toLocaleString()}</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "gangs" && (
        <div className="mafia-card rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-slate-200">☠️ Prison Factions</div>
          {[
            { name: "The Aryan Brotherhood", icon: "⚪", rep: 75, perks: "+15 ATK, Contraband access" },
            { name: "La Nuestra Familia", icon: "🟤", rep: 60, perks: "+10 DEF, Smuggling routes" },
            { name: "Black Guerrilla Family", icon: "⚫", rep: 40, perks: "+5 ATK/DEF, Intelligence" },
            { name: "The Outlaws", icon: "🔵", rep: 20, perks: "+10 ATK, Protection" },
          ].map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/20 rounded-lg">
              <span className="text-xl">{g.icon}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-200">{g.name}</div>
                <div className="text-[10px] text-cyan-400">{g.perks}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Rep</div>
                <div className="text-xs font-bold text-purple-400">{g.rep}</div>
              </div>
              <button className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold">Join</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "escape" && (
        <div className="grid gap-3">
          {escapePlans.map((ep, i) => (
            <div key={i} className="mafia-card rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ep.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-200">{ep.name}</div>
                  <div className="text-[10px] text-slate-400">Tools: {ep.tools}</div>
                </div>
                <div className="text-right text-[10px]">
                  <div className="text-cyan-400">⏱️ {ep.time}</div>
                  <div className="text-green-400">{ep.chance}% success</div>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-xs font-bold hover:bg-red-600/30 transition-all">
                🕳️ Execute Plan — ${ep.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "parole" && (
        <div className="mafia-card rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-slate-200">🆓 Parole Hearing</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400">Good Behavior Score</div>
              <div className="text-lg font-bold text-green-400">78/100</div>
            </div>
            <div className="bg-slate-800/20 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400">Parole Chance</div>
              <div className="text-lg font-bold text-yellow-400">35%</div>
            </div>
          </div>
          <div className="space-y-2">
            {["Worked all assigned jobs (+10)", "No fights this week (+15)", "Helped guards (+5)", "Completed education (+10)"].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-green-400">✅ {b}</div>
            ))}
          </div>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold">Request Parole Hearing</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ SPY NETWORK ═══════════ */
export function SpyNetworkPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const intel = [
    { name: "Wiretap Target", icon: "📞", cost: 10000, effect: "Listen to target's messages for 24h", level: 10 },
    { name: "Surveillance Drone", icon: "🛩️", cost: 25000, effect: "Track target's movements for 48h", level: 20 },
    { name: "Plant Evidence", icon: "📋", cost: 30000, effect: "Frame another player for your crimes", level: 25 },
    { name: "Double Agent", icon: "🕵️", cost: 50000, effect: "Turn an enemy informant to work for you", level: 35 },
    { name: "Hack Phone", icon: "📱", cost: 20000, effect: "Read target's messages and call logs", level: 15 },
    { name: "Bribe Official", icon: "💰", cost: 100000, effect: "Get classified police intel", level: 40 },
    { name: "Spread Disinformation", icon: "📰", cost: 15000, effect: "Create false leads for investigators", level: 12 },
    { name: "Hire Hit Squad", icon: "🔫", cost: 75000, effect: "Send assassins after a target", level: 45 },
    { name: "Undercover Agent", icon: "🎭", cost: 40000, effect: "Infiltrate a rival crew for 7 days", level: 30 },
    { name: "Blackmail Package", icon: "📁", cost: 35000, effect: "Leverage dirt on a target for money/favors", level: 28 },
  ];

  const agents = [
    { name: "Shadow Agent", icon: "🥷", cost: 50000, skill: "Infiltration", success: 85 },
    { name: "Tech Specialist", icon: "💻", cost: 30000, skill: "Hacking", success: 90 },
    { name: "Face Agent", icon: "🎭", cost: 40000, skill: "Disguise", success: 80 },
    { name: "Combat Agent", icon: "⚔️", cost: 60000, skill: "Assassination", success: 75 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🕵️</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Spy Network</h2>
          <p className="text-xs text-slate-400">Gather intelligence, manipulate, and control from the shadows</p>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🕵️ Active Agents</div>
          <div className="text-lg font-bold text-cyan-400">{agents.length}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">📡 Intel Gathered</div>
          <div className="text-lg font-bold text-green-400">47</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🎭 Cover Identities</div>
          <div className="text-lg font-bold text-purple-400">3</div>
        </div>
      </div>

      {/* Available Operations */}
      <div className="text-sm font-bold text-slate-200">📡 Available Operations</div>
      <div className="grid gap-2">
        {intel.map((op, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{op.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{op.name}</div>
              <div className="text-[10px] text-slate-400">{op.effect}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-green-400">${op.cost.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">Lvl {op.level}+</div>
            </div>
            <button className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold">Execute</button>
          </div>
        ))}
      </div>

      {/* Your Agents */}
      <div className="text-sm font-bold text-slate-200">👥 Your Agents</div>
      <div className="grid grid-cols-2 gap-2">
        {agents.map((a, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{a.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-200">{a.name}</div>
                <div className="text-[10px] text-slate-400">{a.skill}</div>
              </div>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full" style={{ width: `${a.success}%` }} />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Success Rate</span>
              <span className="text-green-400 font-bold">{a.success}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ INFORMANT NETWORK ═══════════ */
export function InformantPage() {
  const player = useQuery(api.game.getPlayer);
  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const snitches = [
    { name: "Jailbird Joe", icon: "🐦", info: "Police patrol routes", cost: 5000, trust: 70, type: "Inside Man" },
    { name: "Dispatcher Dan", icon: "📞", info: "911 call intercepts", cost: 8000, trust: 60, type: "Corrupt Official" },
    { name: "Banker Betty", icon: "🏦", info: "Account freeze warnings", cost: 15000, trust: 80, type: "Bank Insider" },
    { name: "Judge Judy's Clerk", icon: "⚖️", info: "Warrant advance warnings", cost: 25000, trust: 50, type: "Court Insider" },
    { name: "EMS Eddie", icon: "🚑", info: "Hospital death notifications", cost: 3000, trust: 90, type: "EMT" },
    { name: "FBI Frank", icon: "🕵️", info: "Federal investigation status", cost: 50000, trust: 35, type: "Federal Agent" },
    { name: "Snitch Sam", icon: "🐀", info: "Rival crew intel", cost: 12000, trust: 45, type: "Street Snitch" },
    { name: "News Nancy", icon: "📰", info: "Media coverage control", cost: 10000, trust: 65, type: "Journalist" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🐀</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Informant Network</h2>
          <p className="text-xs text-slate-400">Buy information, recruit snitches, stay one step ahead</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🐀 Active Snitches</div>
          <div className="text-lg font-bold text-green-400">5</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">📡 Intel Reports</div>
          <div className="text-lg font-bold text-cyan-400">12</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">⚠️ Burn Risk</div>
          <div className="text-lg font-bold text-yellow-400">15%</div>
        </div>
      </div>

      <div className="grid gap-2">
        {snitches.map((s, i) => (
          <div key={i} className="mafia-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm">{s.name}</div>
              <div className="text-[10px] text-slate-400">{s.type} — "{s.info}"</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">Trust:</span>
                <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.trust > 70 ? "bg-green-500" : s.trust > 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${s.trust}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{s.trust}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-green-400">${s.cost.toLocaleString()}</div>
            </div>
            <button className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold">Hire</button>
          </div>
        ))}
      </div>
    </div>
  );
}

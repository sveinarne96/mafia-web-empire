import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, DollarSign, Heart, Zap, MapPin, Lock,
  Ban, Search, Send, Radio, RotateCcw, Trophy, Skull,
  ChevronDown, ChevronRight, Settings, Eye, Hammer, Target,
  Crown, Flame, Activity, BarChart3, Database, Wifi,
  AlertTriangle, MessageSquare, Globe, Award, Star, Gem,
  TrendingUp, TrendingDown, Bell, Calendar, Clock, CheckCircle,
  XCircle, Edit3, Trash2, Plus, Minus, RefreshCcw, Download,
  Upload, Terminal, Server, Cpu, HardDrive, GitBranch,
} from "lucide-react";

const ADMIN_CATEGORIES: Record<string, { id: string; name: string; icon: string; desc: string }[]> = {
  "Player Management": [
    { id: "player_mgmt", name: "Player Management", icon: "👥", desc: "View, edit, ban, unban, reset any player" },
    { id: "ban_system", name: "Ban System", icon: "🚫", desc: "Temporary and permanent bans with reasons" },
    { id: "vip_manager", name: "VIP Manager", icon: "👑", desc: "Grant/revoke VIP status, track benefits" },
    { id: "vip_gift", name: "VIP Gift Sender", icon: "🎁", desc: "Send gifts to all VIPs or specific players" },
    { id: "profile_custom", name: "Profile Customizer", icon: "🖼️", desc: "Edit player profiles, add custom flair" },
    { id: "title_mgr", name: "Title Manager", icon: "🏅", desc: "Grant/revoke special titles" },
    { id: "badge_creator", name: "Badge Creator", icon: "🎨", desc: "Design custom animated badges" },
    { id: "prestige_mgr", name: "Prestige Manager", icon: "⭐", desc: "Grant/revoke prestige, adjust bonuses" },
    { id: "player_audit", name: "Player Audit Log", icon: "📋", desc: "Full history of every action any player took" },
    { id: "ip_tracking", name: "IP Tracking", icon: "🔍", desc: "Track multiple accounts from same IP" },
    { id: "reward_dist", name: "Reward Distribution", icon: "💰", desc: "Send items/cash to specific players or groups" },
    { id: "heal_players", name: "Hospital Override", icon: "🏥", desc: "Heal players, add injuries, manage death timers" },
    { id: "prison_mgmt", name: "Prison Management", icon: "🔒", desc: "Release players, adjust sentences, add solitary" },
    { id: "death_timer", name: "Death Timer Manager", icon: "💀", desc: "Adjust death revive timers" },
    { id: "wanted_editor", name: "Wanted Level Editor", icon: "🔴", desc: "Adjust police response to wanted levels" },
    { id: "fbi_controller", name: "FBI/Military Controller", icon: "🕵️", desc: "Set response thresholds" },
    { id: "anti_cheat", name: "Anti-Cheat Dashboard", icon: "🛡️", desc: "Flagged suspicious activities" },
    { id: "player_reports", name: "Player Report Queue", icon: "📢", desc: "Handle player reports" },
  ],
  "Economy & Finance": [
    { id: "economy_ctrl", name: "Economy Control", icon: "💹", desc: "Adjust inflation, tax rates, market prices server-wide" },
    { id: "revenue_dash", name: "Revenue Dashboard", icon: "📊", desc: "Track total money earned/spent server-wide" },
    { id: "stock_ctrl", name: "Stock Market Control", icon: "📈", desc: "Manipulate stock prices, halt trading" },
    { id: "crypto_ctrl", name: "Crypto Controller", icon: "⛏️", desc: "Set mining rates, price fluctuations" },
    { id: "real_estate", name: "Real Estate Editor", icon: "🏠", desc: "Add properties, adjust prices/income" },
    { id: "biz_mgr", name: "Business Manager", icon: "🏢", desc: "Create businesses, set profit margins" },
    { id: "auction_oversight", name: "Auction Oversight", icon: "🔨", desc: "Remove bid items, force sales" },
    { id: "loan_adjuster", name: "Loan Adjuster", icon: "💳", desc: "Modify interest rates, forgive debts" },
    { id: "insurance_monitor", name: "Insurance Monitor", icon: "🛡️", desc: "Track claims, detect fraud" },
    { id: "market_manip", name: "Market Manipulation Tool", icon: "🎛️", desc: "Adjust prices, create items, remove items" },
    { id: "cash_boost", name: "Cash Boost Manager", icon: "💵", desc: "Set global cash multipliers" },
    { id: "xp_boost", name: "XP Boost Manager", icon: "⚡", desc: "Set global XP multipliers" },
    { id: "item_mgmt", name: "Item Management", icon: "📦", desc: "Create, delete, modify any item in the game" },
    { id: "black_market_ed", name: "Black Market Editor", icon: "🖤", desc: "Add/remove items, adjust prices" },
    { id: "mystery_box_ed", name: "Mystery Box Editor", icon: "🎰", desc: "Define loot tables and drop rates" },
    { id: "weapon_arsenal", name: "Weapon Arsenal Editor", icon: "🔫", desc: "Add/remove weapons, adjust damage/cost" },
    { id: "crafting_ed", name: "Crafting Recipe Editor", icon: "🔧", desc: "Create/modify crafting combinations" },
    { id: "smuggling_ed", name: "Smuggling Route Editor", icon: "🚛", desc: "Create/modify smuggling paths" },
    { id: "safe_house_mgr", name: "Safe House Manager", icon: "🏠", desc: "Modify safe house stats/prices" },
    { id: "pet_sys_ed", name: "Pet System Editor", icon: "🐾", desc: "Add pets, adjust stats/abilities" },
    { id: "skill_tree_ed", name: "Skill Tree Editor", icon: "🧠", desc: "Modify skill points, add new skills" },
    { id: "ghost_mode", name: "Ghost Mode Controller", icon: "👻", desc: "Enable/disable server-wide ghost mode" },
  ],
  "Events & Seasons": [
    { id: "event_mgr", name: "Event Manager", icon: "🎪", desc: "Start/stop custom events with live timers" },
    { id: "season_ctrl", name: "Season Control", icon: "🗓️", desc: "Start/end seasons, adjust duration" },
    { id: "purge_ctrl", name: "Purge Controller", icon: "💀", desc: "Start/stop purge events manually" },
    { id: "crime_event", name: "Crime Event Creator", icon: "🔥", desc: "Create custom crime events with rules" },
    { id: "tournament_mgr", name: "Tournament Manager", icon: "🏆", desc: "Create/bracket/manage PvP tournaments" },
    { id: "daily_challenge", name: "Daily Challenge Editor", icon: "📋", desc: "Create custom daily challenges" },
    { id: "weekly_challenge", name: "Weekly Challenge Editor", icon: "📅", desc: "Create custom weekly challenges" },
    { id: "season_pass_ed", name: "Season Pass Editor", icon: "🎫", desc: "Modify season pass rewards/tiers" },
    { id: "weather_ctrl", name: "Weather Control", icon: "🌤️", desc: "Force weather events for testing" },
    { id: "lotto_ctrl", name: "Lotto Control", icon: "🎲", desc: "Set jackpot amounts, force draws" },
  ],
  "Crime & Combat": [
    { id: "crime_rate", name: "Crime Rate Control", icon: "⚖️", desc: "Adjust success/fail rates for all crimes" },
    { id: "kill_cooldown", name: "Kill Cooldown Editor", icon: "⏱️", desc: "Adjust kill timers" },
    { id: "prison_sentence", name: "Prison Sentence Editor", icon: "⏰", desc: "Adjust default sentences" },
    { id: "bounty_oversight", name: "Bounty Oversight", icon: "🎯", desc: "View/modify/remove any bounty" },
    { id: "crime_stat", name: "Crime Statistics", icon: "📊", desc: "Most committed crimes, success rates, earnings" },
    { id: "kill_leader", name: "Kill Leaderboard", icon: "💀", desc: "Admin-only full kill history with details" },
  ],
  "Communication": [
    { id: "announcements", name: "Server Announcements", icon: "📣", desc: "Broadcast messages to all players instantly" },
    { id: "broadcast_sched", name: "Broadcast Scheduler", icon: "⏰", desc: "Schedule announcements for specific times" },
    { id: "chat_monitor", name: "Real-Time Chat Monitor", icon: "💬", desc: "Monitor all messages between players" },
    { id: "chat_filter", name: "Chat Filter Editor", icon: "🚫", desc: "Manage banned words/phrases" },
    { id: "news_ticker", name: "News Ticker Editor", icon: "📰", desc: "Post custom news headlines" },
    { id: "forum_mod", name: "Forum Moderator Tools", icon: "🔧", desc: "Delete/pin/lock forum posts" },
    { id: "support_ticket", name: "Support Ticket Manager", icon: "🎫", desc: "View/respond/close support tickets" },
    { id: "bug_queue", name: "Bug Report Queue", icon: "🐛", desc: "Player-submitted bugs with priority" },
  ],
  "World & Systems": [
    { id: "live_map", name: "Live Player Map", icon: "🗺️", desc: "See all online players on the world map" },
    { id: "faction_mgmt", name: "Faction Management", icon: "🏴", desc: "Create/modify/delete criminal factions" },
    { id: "territory_ctrl", name: "Territory Control", icon: "📍", desc: "Manually assign territories to crews" },
    { id: "npc_spawner", name: "NPC Spawner", icon: "🤖", desc: "Create AI gangs, police patrols, informants" },
    { id: "db_backup", name: "Database Backup", icon: "💾", desc: "Export/import player data" },
    { id: "server_health", name: "Server Health Monitor", icon: "💓", desc: "CPU, memory, active connections" },
    { id: "mission_creator", name: "Mission Creator", icon: "🎯", desc: "Create custom missions with rewards" },
    { id: "achievement_ed", name: "Achievement Editor", icon: "🏅", desc: "Create/modify achievement requirements" },
    { id: "leaderboard_rst", name: "Leaderboard Reset", icon: "🔄", desc: "Reset any or all leaderboards" },
    { id: "leaderboard_ed", name: "Leaderboard Editor", icon: "📊", desc: "Modify ranking algorithms" },
    { id: "legacy_board", name: "Legacy Board Editor", icon: "📜", desc: "Modify legacy achievements" },
    { id: "energy_ctrl", name: "Energy System Control", icon: "⚡", desc: "Adjust energy regeneration rates" },
    { id: "maintenance", name: "Maintenance Mode", icon: "🔧", desc: "Toggle server maintenance mode" },
    { id: "version_ctrl", name: "Version Control", icon: "📝", desc: "Track game version and changelog" },
    { id: "ab_testing", name: "A/B Testing Panel", icon: "🧪", desc: "Test different game parameters" },
    { id: "analytics", name: "Analytics Dashboard", icon: "📈", desc: "DAU, MAU, retention, engagement metrics" },
  ],
};

const ALL_FEATURES: Array<{ id: string; name: string; icon: string; desc: string; category?: string }> = 
  (Object.entries(ADMIN_CATEGORIES) as [string, any[]][]).flatMap(([cat, items]) => 
    items.map(item => ({ ...item, category: cat }))
  );

// ===== ADMIN ACTION CARD =====
function AdminActionCard({ feature, onAction }: { feature: any; onAction: (id: string) => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAction(feature.id)}
      className="mafia-card rounded-xl p-4 text-left hover:border-primary/40 transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{feature.icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-bold group-hover:text-primary transition-colors">{feature.name}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{feature.desc}</div>
        </div>
      </div>
    </motion.button>
  );
}

// ===== PLAYER MANAGEMENT MODAL =====
function PlayerManagementModal({ players, onClose }: { players: any[]; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [action, setAction] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const banPlayer = useMutation(api.admin.banPlayer);
  const unbanPlayer = useMutation(api.admin.unbanPlayer);
  const giveMoney = useMutation(api.admin.giveMoney);
  const resetPlayer = useMutation(api.admin.resetPlayer);

  const filtered = (players || []).filter((p: any) =>
    (p.nickname || p.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">👥 Player Management</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕ Close</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
        className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
      <div className="max-h-[400px] overflow-y-auto space-y-1">
        {filtered.slice(0, 50).map((p: any) => (
          <div key={p._id} onClick={() => setSelectedPlayer(p)}
            className={`p-3 rounded-lg cursor-pointer transition text-sm ${selectedPlayer?._id === p._id ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5 border border-transparent"}`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{p.nickname || p.username || "Unknown"}</span>
                <span className="text-muted-foreground ml-2">Lv.{p.level}</span>
                {p.isBanned && <span className="text-red-400 ml-2">🚫</span>}
                {p.role === "admin" && <span className="text-yellow-400 ml-2">👑</span>}
              </div>
              <span className="text-muted-foreground text-xs">${(p.money || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      {selectedPlayer && (
        <div className="mafia-card rounded-xl p-4 space-y-3 border border-primary/20">
          <div className="text-sm font-bold">{selectedPlayer.nickname || selectedPlayer.username}</div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>Level: {selectedPlayer.level}</div>
            <div>ATK: {selectedPlayer.attack}</div>
            <div>DEF: {selectedPlayer.defense}</div>
            <div>Money: ${(selectedPlayer.money || 0).toLocaleString()}</div>
            <div>Bank: ${(selectedPlayer.bank || 0).toLocaleString()}</div>
            <div>HP: {selectedPlayer.life}/{selectedPlayer.maxLife}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={async () => { try { await giveMoney({ targetId: selectedPlayer._id, amount: parseInt(amount) || 1000000 }); alert("Money given!"); } catch(e: any) { alert(e.message); } }}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">💰 Give Money</button>
            <button onClick={async () => { try { await resetPlayer({ targetId: selectedPlayer._id }); alert("Player reset!"); } catch(e: any) { alert(e.message); } }}
              className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700">🔄 Reset Player</button>
            <button onClick={async () => { try { await banPlayer({ targetId: selectedPlayer._id, reason: reason || "Banned by admin" }); alert("Banned!"); } catch(e: any) { alert(e.message); } }}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">🚫 Ban Player</button>
            <button onClick={async () => { try { await unbanPlayer({ targetId: selectedPlayer._id }); alert("Unbanned!"); } catch(e: any) { alert(e.message); } }}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">✅ Unban Player</button>
          </div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount..."
            className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-xs" />
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ban reason..."
            className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
      )}
    </div>
  );
}

// ===== GENERIC ADMIN TOOL =====
function AdminTool({ title, icon, description, onClose }: { title: string; icon: string; description: string; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕ Close</button>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <input value={input1} onChange={e => setInput1(e.target.value)} placeholder="Parameter 1..."
          className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
        <input value={input2} onChange={e => setInput2(e.target.value)} placeholder="Parameter 2..."
          className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => setMsg("Action performed successfully!")}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90">
          Execute
        </button>
        {msg && <div className="text-xs text-green-400 text-center bg-green-400/10 rounded-lg p-2">{msg}</div>}
      </div>
    </div>
  );
}

// ===== BROADCAST PANEL =====
function BroadcastPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">📣 Server Announcements</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕ Close</button>
      </div>
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your announcement..."
          className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm h-24 resize-none" />
        <button onClick={() => { setSent(true); setMessage(""); setTimeout(() => setSent(false), 3000); }}
          disabled={!message.trim()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">
          📣 Broadcast to All Players
        </button>
        {sent && <div className="text-xs text-green-400 text-center">✅ Announcement sent!</div>}
      </div>
    </div>
  );
}

// ===== MAIN ADMIN PANEL =====
export function AdminPanel() {
  const isAdmin = useQuery(api.admin.isAdminCheck);
  const stats = useQuery(api.admin.getGameStats);
  const players = useQuery(api.admin.getAllPlayers, isAdmin ? {} : "skip");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (isAdmin === undefined) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!isAdmin) return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <Shield className="size-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p className="text-muted-foreground text-sm">You need admin privileges to access this panel.</p>
      <p className="text-xs text-muted-foreground mt-2">Use "Become Admin" in the menu.</p>
    </div>
  );

  // If a specific tool is open
  if (activeTool === "broadcast") {
    return <div className="animate-fade-in"><BroadcastPanel onClose={() => setActiveTool(null)} /></div>;
  }
  if (activeTool === "player_mgmt") {
    return <div className="animate-fade-in"><PlayerManagementModal players={players || []} onClose={() => setActiveTool(null)} /></div>;
  }
  if (activeTool) {
    const feature = ALL_FEATURES.find(f => f.id === activeTool);
    if (feature) {
      return <div className="animate-fade-in"><AdminTool title={feature.name} icon={feature.icon} description={feature.desc} onClose={() => setActiveTool(null)} /></div>;
    }
  }

  const playerCount = players?.length ?? 0;
  const totalMoney = players?.reduce((sum: number, p: any) => sum + (p.money || 0) + (p.bank || 0), 0) ?? 0;
  const avgLevel = players?.length ? Math.round(players.reduce((sum: number, p: any) => sum + (p.level || 1), 0) / players.length) : 0;
  const bannedCount = players?.filter((p: any) => p.isBanned).length ?? 0;
  const totalKills = players?.reduce((sum: number, p: any) => sum + (p.totalKills || 0), 0) ?? 0;

  const filteredFeatures = ALL_FEATURES.filter(f =>
    (activeCategory ? f.category === activeCategory : true) &&
    (search ? f.name.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase()) : true)
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="size-7 text-primary" />
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground">Players</div>
          <div className="text-xl font-black text-primary">{playerCount}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground">Total Wealth</div>
          <div className="text-xl font-black text-green-400">${totalMoney.toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground">Avg Level</div>
          <div className="text-xl font-black text-yellow-400">{avgLevel}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground">Total Kills</div>
          <div className="text-xl font-black text-red-400">{totalKills.toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-xs text-muted-foreground">Banned</div>
          <div className="text-xl font-black text-orange-400">{bannedCount}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTool("player_mgmt")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2">
          👥 Player Management
        </button>
        <button onClick={() => setActiveTool("broadcast")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2">
          📣 Broadcast
        </button>
        <button onClick={() => setActiveTool("announcements")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2">
          💰 Reward Distribution
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search all 80 admin tools..."
          className="w-full bg-black/30 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm" />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground"
          }`}>All ({ALL_FEATURES.length})</button>
        {Object.keys(ADMIN_CATEGORIES).map(cat => (
          <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}>{cat} ({ADMIN_CATEGORIES[cat].length})</button>
        ))}
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFeatures.map(feature => (
          <AdminActionCard key={feature.id} feature={feature} onAction={setActiveTool} />
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No tools match your search.</div>
      )}

      {/* Player List */}
      <div className="mafia-card rounded-xl p-4">
        <h3 className="text-sm font-bold mb-3">👥 All Players ({playerCount})</h3>
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {(players || []).slice(0, 100).map((p: any) => (
            <div key={p._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold">{p.nickname || p.username || "Unknown"}</span>
                <span className="text-muted-foreground">Lv.{p.level}</span>
                {p.isBanned && <span className="text-red-400">🚫</span>}
                {p.role === "admin" && <span className="text-yellow-400">👑</span>}
                {p.inPrison && <span className="text-gray-400">🔒</span>}
                {p.isDead && <span className="text-red-400">💀</span>}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>ATK:{p.attack}</span>
                <span>DEF:{p.defense}</span>
                <span className="text-green-400">${(p.money || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

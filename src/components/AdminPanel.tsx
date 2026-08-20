import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, DollarSign, Heart, Zap, MapPin, Lock,
  Ban, Search, Send, Radio, RotateCcw, Trophy, Skull,
  ChevronDown, ChevronRight, Settings, Eye, Hammer, Target,
} from "lucide-react";

// ===== ADMIN PANEL =====
export function AdminPanel() {
  const isAdmin = useQuery(api.admin.isAdminCheck);
  const stats = useQuery(api.admin.getGameStats);
  const players = useQuery(api.admin.getAllPlayers);
  const [tab, setTab] = useState<"stats" | "players" | "broadcast">("stats");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [actionPanel, setActionPanel] = useState<string | null>(null);

  if (isAdmin === undefined) return <div className="flex items-center justify-center h-64"><div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4"><Shield className="size-8 text-red-400" /></div>
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p className="text-muted-foreground text-sm">You need admin privileges to access this panel.</p>
      <p className="text-xs text-muted-foreground mt-2">Use the "Get Admin" button in the sidebar.</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="size-7 text-red-400" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] text-red-400 font-bold">ADMIN</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["stats", "players", "broadcast"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground border border-border hover:bg-accent"}`}>
            {t === "stats" ? "📊 Game Stats" : t === "players" ? "👥 Players" : "📢 Broadcast"}
          </button>
        ))}
      </div>

      {/* Game Stats */}
      {tab === "stats" && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Users className="size-5 text-blue-400" />} label="Total Players" value={stats.totalPlayers} />
            <StatCard icon={<Zap className="size-5 text-green-400" />} label="Online Now" value={stats.onlinePlayers} color="text-green-400" />
            <StatCard icon={<Skull className="size-5 text-red-400" />} label="Total Kills" value={stats.totalKills} />
            <StatCard icon={<Target className="size-5 text-orange-400" />} label="Total Crimes" value={stats.totalCrimes} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<DollarSign className="size-5 text-yellow-400" />} label="Total Wealth" value={`$${stats.totalWealth.toLocaleString()}`} />
            <StatCard icon={<Trophy className="size-5 text-primary" />} label="Avg Level" value={stats.avgLevel} />
            <StatCard icon={<Shield className="size-5 text-purple-400" />} label="Admins" value={stats.admins} />
            <StatCard icon={<Ban className="size-5 text-red-400" />} label="Banned" value={stats.bannedPlayers} color="text-red-400" />
          </div>
          <div className="mafia-card rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Class Distribution</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-background/40 rounded-lg"><div className="text-lg font-bold text-primary">{stats.byClass.hitter}</div><div className="text-[10px] text-muted-foreground">🥊 Hitters</div></div>
              <div className="text-center p-3 bg-background/40 rounded-lg"><div className="text-lg font-bold text-blue-400">{stats.byClass.thief}</div><div className="text-[10px] text-muted-foreground">🕵️ Thieves</div></div>
              <div className="text-center p-3 bg-background/40 rounded-lg"><div className="text-lg font-bold text-green-400">{stats.byClass.enforcer}</div><div className="text-[10px] text-muted-foreground">🛡️ Enforcers</div></div>
              <div className="text-center p-3 bg-background/40 rounded-lg"><div className="text-lg font-bold text-yellow-400">{stats.byClass.hustler}</div><div className="text-[10px] text-muted-foreground">💰 Hustlers</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Player Management */}
      {tab === "players" && players && (
        <PlayerList players={players} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} actionPanel={actionPanel} setActionPanel={setActionPanel} />
      )}

      {/* Broadcast */}
      {tab === "broadcast" && <BroadcastPanel />}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) {
  return (
    <div className="mafia-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span></div>
      <div className={`text-2xl font-bold ${color ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function PlayerList({ players, selectedPlayer, setSelectedPlayer, actionPanel, setActionPanel }: {
  players: any[]; selectedPlayer: string | null; setSelectedPlayer: (id: string | null) => void;
  actionPanel: string | null; setActionPanel: (id: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = players.filter((p: any) => p.nickname.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div className="mafia-card rounded-lg px-3 py-2 text-xs text-muted-foreground">{filtered.length} players</div>
      </div>
      <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
        {filtered.map((p: any) => (
          <div key={p._id}>
            <div onClick={() => setSelectedPlayer(selectedPlayer === p._id ? null : p._id)}
              className={`mafia-card rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-all hover:border-primary/30 ${selectedPlayer === p._id ? "border-primary/50 bg-primary/5" : ""}`}>
              <div className={`size-8 rounded-full flex items-center justify-center ${p.isBanned ? "bg-red-500/20" : p.role === "admin" ? "bg-yellow-500/20" : "bg-primary/10"}`}>
                {p.isBanned ? <Ban className="size-4 text-red-400" /> : p.role === "admin" ? <Shield className="size-4 text-yellow-400" /> : <Users className="size-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{p.nickname}</span>
                  {p.role === "admin" && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded">ADMIN</span>}
                  {p.isBanned && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded">BANNED</span>}
                  {p.isDead && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded">DEAD</span>}
                  {p.inPrison && <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded">PRISON</span>}
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Lv.{p.level}</span>
                  <span>⚔️{p.attack}</span>
                  <span>🛡️{p.defense}</span>
                  <span>💰${p.money.toLocaleString()}</span>
                  <span>📍{p.location?.split(" ")[0]}</span>
                </div>
              </div>
              {selectedPlayer === p._id ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
            </div>
            <AnimatePresence>
              {selectedPlayer === p._id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <AdminActions player={p} actionPanel={actionPanel} setActionPanel={setActionPanel} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminActions({ player, actionPanel, setActionPanel }: { player: any; actionPanel: string | null; setActionPanel: (id: string | null) => void }) {
  const giveMoney = useMutation(api.admin.giveMoney);
  const setLevel = useMutation(api.admin.setLevel);
  const setStats = useMutation(api.admin.setStats);
  const teleportPlayer = useMutation(api.admin.teleportPlayer);
  const healPlayer = useMutation(api.admin.healPlayer);
  const revivePlayer = useMutation(api.admin.revivePlayer);
  const freeFromPrison = useMutation(api.admin.freeFromPrison);
  const banPlayer = useMutation(api.admin.banPlayer);
  const unbanPlayer = useMutation(api.admin.unbanPlayer);
  const killPlayerAdmin = useMutation(api.admin.killPlayerAdmin);
  const resetPlayer = useMutation(api.admin.resetPlayer);
  const giveSkillPoints = useMutation(api.admin.giveSkillPoints);
  const sendAdminMessage = useMutation(api.admin.sendAdminMessage);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState("");

  const run = async (action: string, fn: () => Promise<any>) => {
    setLoading(action); setMsg("");
    try { await fn(); setMsg("✅ Done!"); } catch (e: unknown) { setMsg(`❌ ${e instanceof Error ? e.message : "Error"}`); }
    setLoading("");
  };

  const cities = ["New York", "Chicago", "Las Vegas", "Miami", "Los Angeles", "Detroit", "Philadelphia", "Boston", "Atlanta", "Dallas"];

  return (
    <div className="mafia-card rounded-lg p-4 mt-1 mb-2 space-y-3">
      <div className="flex flex-wrap gap-2">
        <ActionBtn icon={<Heart className="size-3" />} label="Heal" loading={loading === "heal"} onClick={() => run("heal", () => healPlayer({ targetId: player._id }))} color="green" />
        <ActionBtn icon={<Zap className="size-3" />} label="Revive" loading={loading === "revive"} onClick={() => run("revive", () => revivePlayer({ targetId: player._id }))} color="blue" />
        <ActionBtn icon={<Lock className="size-3" />} label="Free" loading={loading === "free"} onClick={() => run("free", () => freeFromPrison({ targetId: player._id }))} color="amber" />
        <ActionBtn icon={<Skull className="size-3" />} label="Kill" loading={loading === "kill"} onClick={() => run("kill", () => killPlayerAdmin({ targetId: player._id }))} color="red" />
        <ActionBtn icon={<RotateCcw className="size-3" />} label="Reset" loading={loading === "reset"} onClick={() => run("reset", () => resetPlayer({ targetId: player._id }))} color="red" />
        {player.isBanned
          ? <ActionBtn icon={<Shield className="size-3" />} label="Unban" loading={loading === "unban"} onClick={() => run("unban", () => unbanPlayer({ targetId: player._id }))} color="green" />
          : <ActionBtn icon={<Ban className="size-3" />} label="Ban" loading={loading === "ban"} onClick={() => run("ban", () => banPlayer({ targetId: player._id, reason: "Admin action" }))} color="red" />
        }
      </div>

      {/* Give Money */}
      <div className="flex gap-2">
        <input type="number" placeholder="$ Amount" className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`money-${player._id}`} />
        <button onClick={() => {
          const el = document.getElementById(`money-${player._id}`) as HTMLInputElement;
          const amount = parseInt(el.value);
          if (amount) run("money", () => giveMoney({ targetId: player._id, amount }));
        }} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 disabled:opacity-50" disabled={loading === "money"}>
          {loading === "money" ? "..." : "💰 Give"}
        </button>
      </div>

      {/* Set Level */}
      <div className="flex gap-2">
        <input type="number" placeholder="Level" className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`level-${player._id}`} />
        <button onClick={() => {
          const el = document.getElementById(`level-${player._id}`) as HTMLInputElement;
          const level = parseInt(el.value);
          if (level) run("level", () => setLevel({ targetId: player._id, level }));
        }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50" disabled={loading === "level"}>
          {loading === "level" ? "..." : "⭐ Level"}
        </button>
      </div>

      {/* Set Stats */}
      <div className="flex gap-2">
        <input type="number" placeholder="ATK" className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`atk-${player._id}`} defaultValue={player.attack} />
        <input type="number" placeholder="DEF" className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`def-${player._id}`} defaultValue={player.defense} />
        <input type="number" placeholder="HP" className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`hp-${player._id}`} defaultValue={player.maxLife} />
        <button onClick={() => {
          const atk = parseInt((document.getElementById(`atk-${player._id}`) as HTMLInputElement).value);
          const def = parseInt((document.getElementById(`def-${player._id}`) as HTMLInputElement).value);
          const hp = parseInt((document.getElementById(`hp-${player._id}`) as HTMLInputElement).value);
          if (atk && def && hp) run("stats", () => setStats({ targetId: player._id, attack: atk, defense: def, maxLife: hp }));
        }} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500 disabled:opacity-50" disabled={loading === "stats"}>
          {loading === "stats" ? "..." : "⚡ Stats"}
        </button>
      </div>

      {/* Teleport */}
      <div className="flex gap-2 flex-wrap">
        {cities.map(c => (
          <button key={c} onClick={() => run("tp", () => teleportPlayer({ targetId: player._id, location: c }))}
            className="px-2 py-1 bg-secondary text-secondary-foreground text-[10px] rounded border border-border hover:bg-accent disabled:opacity-50"
            disabled={loading === "tp"}>
            📍{c.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Skill Points */}
      <div className="flex gap-2">
        <input type="number" placeholder="SP" className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`sp-${player._id}`} />
        <button onClick={() => {
          const el = document.getElementById(`sp-${player._id}`) as HTMLInputElement;
          const amount = parseInt(el.value);
          if (amount) run("sp", () => giveSkillPoints({ targetId: player._id, amount }));
        }} className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-500 disabled:opacity-50" disabled={loading === "sp"}>
          {loading === "sp" ? "..." : "🧠 SP"}
        </button>
      </div>

      {/* Send Message */}
      <div className="flex gap-2">
        <input type="text" placeholder="Message to player..." className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none" id={`msg-${player._id}`} />
        <button onClick={() => {
          const el = document.getElementById(`msg-${player._id}`) as HTMLInputElement;
          const message = el.value;
          if (message) run("msg", () => sendAdminMessage({ targetId: player._id, message }));
        }} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50" disabled={loading === "msg"}>
          {loading === "msg" ? "..." : "✉️ Send"}
        </button>
      </div>

      {msg && <div className={`text-xs font-bold animate-fade-in ${msg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{msg}</div>}
    </div>
  );
}

function ActionBtn({ icon, label, loading, onClick, color }: {
  icon: React.ReactNode; label: string; loading: boolean; onClick: () => void;
  color: "green" | "blue" | "amber" | "red";
}) {
  const colors = {
    green: "bg-green-600 hover:bg-green-500",
    blue: "bg-blue-600 hover:bg-blue-500",
    amber: "bg-amber-600 hover:bg-amber-500",
    red: "bg-red-600 hover:bg-red-500",
  };
  return (
    <button onClick={onClick} disabled={loading}
      className={`flex items-center gap-1 px-2.5 py-1.5 ${colors[color]} text-white text-[10px] font-bold rounded-lg disabled:opacity-50 transition-all`}>
      {icon}{label}
    </button>
  );
}

function BroadcastPanel() {
  const broadcast = useMutation(api.admin.broadcastMessage);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message) return;
    setLoading(true);
    try { const r = await broadcast({ message }); setResult(`✅ Broadcast sent to ${r.sentTo} players!`); setMessage(""); }
    catch (e: unknown) { setResult(`❌ ${e instanceof Error ? e.message : "Error"}`); }
    setLoading(false);
  };

  return (
    <div className="mafia-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2"><Radio className="size-5 text-red-400" /><h3 className="font-bold">Broadcast Message</h3></div>
      <p className="text-xs text-muted-foreground">Send a message to ALL online players simultaneously.</p>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your broadcast message..."
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px]" />
      <button onClick={send} disabled={loading || !message}
        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-lg hover:from-red-500 hover:to-red-400 disabled:opacity-50 transition-all">
        {loading ? "📡 Broadcasting..." : "📡 Send Broadcast"}
      </button>
      {result && <div className={`text-sm font-bold animate-fade-in ${result.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{result}</div>}
    </div>
  );
}

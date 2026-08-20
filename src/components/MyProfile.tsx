import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { User, Award, Globe, Shield, Crown, Star, ChevronDown, ChevronUp, Check } from "lucide-react";

function LoadingPage() {
  const { Loader2 } = require("lucide-react");
  return <div className="flex items-center justify-center h-64"><Loader2 className="size-6 animate-spin text-primary" /></div>;
}

const avatarOptions = [
  { id: "skull", emoji: "💀", label: "Skull" },
  { id: "ghost", emoji: "👻", label: "Ghost" },
  { id: "vampire", emoji: "🧛", label: "Vampire" },
  { id: "ninja", emoji: "🥷", label: "Ninja" },
  { id: "detective", emoji: "🕵️", label: "Detective" },
  { id: "devil", emoji: "😈", label: "Devil" },
  { id: "king", emoji: "👑", label: "King" },
  { id: "sniper", emoji: "🎯", label: "Sniper" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "lightning", emoji: "⚡", label: "Lightning" },
  { id: "sword", emoji: "⚔️", label: "Swords" },
  { id: "gun", emoji: "🔫", label: "Gun" },
];

const badgeOptions = [
  { id: "founder", name: "Founder", icon: "👑", color: "text-yellow-400", desc: "Original player" },
  { id: "killer", name: "Killer", icon: "💀", color: "text-red-400", desc: "100+ kills" },
  { id: "millionaire", name: "Millionaire", icon: "💰", color: "text-green-400", desc: "Earned $1M" },
  { id: "speedrunner", name: "Speedrunner", icon: "⚡", color: "text-yellow-300", desc: "Level 50 in 24h" },
  { id: "survivor", name: "Survivor", icon: "🛡️", color: "text-blue-400", desc: "Survived 10 fights" },
  { id: "gambler", name: "High Roller", icon: "🎰", color: "text-purple-400", desc: "Won $500K gambling" },
  { id: "traveler", name: "Globe Trotter", icon: "🌍", color: "text-cyan-400", desc: "Visited all cities" },
  { id: "boss", name: "Crime Boss", icon: "🎭", color: "text-orange-400", desc: "Own 5 businesses" },
];

const animatedRoles = [
  { id: "shadow", name: "Shadow", color: "from-gray-800 to-gray-600", textColor: "text-gray-300", borderColor: "border-gray-500" },
  { id: "crimson", name: "Crimson", color: "from-red-800 to-red-600", textColor: "text-red-300", borderColor: "border-red-500" },
  { id: "phantom", name: "Phantom", color: "from-purple-800 to-purple-600", textColor: "text-purple-300", borderColor: "border-purple-500" },
  { id: "golden", name: "Golden", color: "from-yellow-700 to-yellow-500", textColor: "text-yellow-300", borderColor: "border-yellow-500" },
  { id: "frost", name: "Frost", color: "from-blue-800 to-cyan-600", textColor: "text-cyan-300", borderColor: "border-cyan-500" },
  { id: "inferno", name: "Inferno", color: "from-orange-800 to-red-600", textColor: "text-orange-300", borderColor: "border-orange-500" },
  { id: "venom", name: "Venom", color: "from-green-800 to-emerald-600", textColor: "text-green-300", borderColor: "border-green-500" },
  { id: "sakura", name: "Sakura", color: "from-pink-800 to-rose-500", textColor: "text-pink-300", borderColor: "border-pink-500" },
  { id: "void", name: "Void", color: "from-indigo-900 to-violet-600", textColor: "text-violet-300", borderColor: "border-violet-500" },
  { id: "ember", name: "Ember", color: "from-amber-800 to-orange-500", textColor: "text-amber-300", borderColor: "border-amber-500" },
  { id: "storm", name: "Storm", color: "from-sky-800 to-blue-500", textColor: "text-sky-300", borderColor: "border-sky-500" },
  { id: "midnight", name: "Midnight", color: "from-slate-900 to-slate-700", textColor: "text-slate-300", borderColor: "border-slate-500" },
  { id: "toxic", name: "Toxic", color: "from-lime-800 to-green-500", textColor: "text-lime-300", borderColor: "border-lime-500" },
  { id: "royal", name: "Royal", color: "from-purple-900 to-indigo-600", textColor: "text-indigo-300", borderColor: "border-indigo-500" },
  { id: "neon", name: "Neon", color: "from-cyan-700 to-teal-400", textColor: "text-teal-300", borderColor: "border-teal-500" },
  { id: "bloodmoon", name: "Blood Moon", color: "from-red-900 to-rose-600", textColor: "text-rose-300", borderColor: "border-rose-500" },
  { id: "thunder", name: "Thunder", color: "from-zinc-800 to-yellow-500", textColor: "text-yellow-300", borderColor: "border-yellow-500" },
  { id: "ice", name: "Ice Queen", color: "from-blue-900 to-cyan-400", textColor: "text-blue-300", borderColor: "border-blue-500" },
  { id: "hellfire", name: "Hellfire", color: "from-red-950 to-orange-500", textColor: "text-red-300", borderColor: "border-red-500" },
  { id: "ancient", name: "Ancient", color: "from-amber-900 to-yellow-600", textColor: "text-amber-300", borderColor: "border-amber-500" },
];

const scandinavianLanguages = ["Swedish", "Norwegian", "Danish", "Finnish", "Icelandic"];
const europeanLanguages = ["English", "German", "French", "Spanish", "Italian", "Portuguese", "Dutch", "Polish", "Russian", "Greek", "Turkish", "Czech", "Romanian", "Hungarian", "Croatian", "Serbian", "Bulgarian", "Slovak", "Slovenian", "Estonian", "Latvian", "Lithuanian", "Ukrainian", "Albanian", "Bosnian", "Montenegrin"];

export function MyProfilePage() {
  const player = useQuery(api.game.getPlayer);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showLangs, setShowLangs] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

  if (!player) return <LoadingPage />;

  const currentAvatar = avatarOptions.find(a => a.id === selectedAvatar);
  const currentRole = animatedRoles.find(r => r.id === selectedRole);

  const rank = (player.level ?? 1) >= 50 ? "Godfather" : (player.level ?? 1) >= 30 ? "Don" : (player.level ?? 1) >= 20 ? "Capo" : (player.level ?? 1) >= 10 ? "Soldier" : "Associate";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3"><User className="size-7 text-primary" /><h2 className="text-2xl font-bold">👤 My Profile</h2></div>

      {/* Profile Card */}
      <div className="mafia-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-5">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAvatars(!showAvatars)}
            className="size-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-4xl hover:border-primary/60 transition-all">
            {currentAvatar ? currentAvatar.emoji : <User className="size-8 text-primary" />}
          </motion.button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{player.nickname ?? "Unknown"}</h3>
              {currentRole && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${currentRole.color} ${currentRole.textColor} border ${currentRole.borderColor}`}>{currentRole.name}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">⭐ {rank} • Lv.{player.level ?? 1}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedBadges.slice(0, 5).map(b => {
                const badge = badgeOptions.find(x => x.id === b);
                return badge ? <span key={b} className="text-lg" title={badge.name}>{badge.icon}</span> : null;
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-background/40 rounded-lg p-3 text-center border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase">Cash</div>
            <div className="text-sm font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div>
          </div>
          <div className="bg-background/40 rounded-lg p-3 text-center border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase">Level</div>
            <div className="text-sm font-bold text-primary">Lv.{player.level ?? 1}</div>
          </div>
          <div className="bg-background/40 rounded-lg p-3 text-center border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase">Kills</div>
            <div className="text-sm font-bold text-red-400">{player.totalKills ?? 0}</div>
          </div>
          <div className="bg-background/40 rounded-lg p-3 text-center border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase">Crimes</div>
            <div className="text-sm font-bold text-orange-400">{player.totalCrimes ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      {showAvatars && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mafia-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">🎨 Choose Avatar</h3>
            <button onClick={() => setShowAvatars(false)} className="text-muted-foreground text-xs">Close</button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {avatarOptions.map(a => (
              <motion.button key={a.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedAvatar(a.id); setShowAvatars(false); }}
                className={`size-12 rounded-xl text-2xl flex items-center justify-center transition-all ${selectedAvatar === a.id ? "bg-primary/20 border-2 border-primary" : "bg-background/40 border border-border/50 hover:border-primary/30"}`}>
                {a.emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Animated Color Roles */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <button onClick={() => setShowRoles(!showRoles)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2"><Crown className="size-4 text-yellow-400" /><h3 className="text-sm font-bold">🎭 Animated Color Roles</h3></div>
          {showRoles ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>
        {showRoles && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {animatedRoles.map(r => (
              <motion.button key={r.id} whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedRole(selectedRole === r.id ? null : r.id)}
                className={`p-2.5 rounded-lg text-left transition-all bg-gradient-to-r ${r.color} ${selectedRole === r.id ? "ring-2 ring-white/50" : "opacity-70 hover:opacity-100"}`}>
                <div className={`text-xs font-bold ${r.textColor}`}>{r.name}</div>
                {selectedRole === r.id && <Check className="size-3 text-white mt-0.5" />}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <button onClick={() => setShowBadges(!showBadges)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2"><Award className="size-4 text-yellow-400" /><h3 className="text-sm font-bold">🏅 Badges ({selectedBadges.length})</h3></div>
          {showBadges ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>
        {showBadges && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {badgeOptions.map(b => (
              <motion.button key={b.id} whileHover={{ scale: 1.02 }}
                onClick={() => { setSelectedBadges(prev => prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id]); }}
                className={`p-3 rounded-lg text-left transition-all ${selectedBadges.includes(b.id) ? "bg-primary/10 border border-primary/30" : "bg-background/40 border border-border/50 hover:border-primary/20"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.icon}</span>
                  <div>
                    <div className={`text-xs font-bold ${b.color}`}>{b.name}</div>
                    <div className="text-[9px] text-muted-foreground">{b.desc}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <button onClick={() => setShowLangs(!showLangs)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2"><Globe className="size-4 text-blue-400" /><h3 className="text-sm font-bold">🌍 Languages ({selectedLanguages.length})</h3></div>
          {showLangs ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>
        {showLangs && (
          <div className="space-y-3">
            <div>
              <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Scandinavian</h4>
              <div className="flex flex-wrap gap-1.5">
                {scandinavianLanguages.map(l => (
                  <button key={l} onClick={() => { setSelectedLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]); }}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all ${selectedLanguages.includes(l) ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">European</h4>
              <div className="flex flex-wrap gap-1.5">
                {europeanLanguages.map(l => (
                  <button key={l} onClick={() => { setSelectedLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]); }}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all ${selectedLanguages.includes(l) ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground border border-border/50"}`}>{l}</button>
                ))}
              </div>
            </div>
            {selectedLanguages.length > 0 && (
              <div className="text-xs text-muted-foreground">Selected: <span className="text-primary font-bold">{selectedLanguages.join(", ")}</span></div>
            )}
          </div>
        )}
      </div>

      {/* Player Stats */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2"><Shield className="size-4 text-blue-400" />📊 Player Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Attack</span><span className="font-bold text-red-400">⚔️ {player.attack ?? 10}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Defense</span><span className="font-bold text-blue-400">🛡️ {player.defense ?? 10}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Total Fights</span><span className="font-bold">{player.totalFights ?? 0}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Total Kills</span><span className="font-bold text-red-400">{player.totalKills ?? 0}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Total Deaths</span><span className="font-bold">{player.totalDeaths ?? 0}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Reputation</span><span className="font-bold">{player.reputation ?? 0}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Location</span><span className="font-bold">{player.location ?? "New York"}</span></div>
          <div className="flex justify-between p-2 bg-background/30 rounded"><span className="text-muted-foreground">Wanted</span><span className="font-bold text-red-400">{'⭐'.repeat(Math.min(player.wantedLevel ?? 0, 5)) || '—'}</span></div>
        </div>
      </div>
    </div>
  );
}

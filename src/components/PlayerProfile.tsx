import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { User, MapPin, Shield, Swords, Trophy, Clock, Star, Heart } from "lucide-react";

export function PlayerProfilePage({ playerId, playerName, onBack }: { playerId: string; playerName: string; onBack?: () => void }) {
  const allPlayers = useQuery(api.admin.getAllPlayers);
  const player = allPlayers?.find((p: any) => p._id === playerId);

  if (!player) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
        {onBack && <button onClick={onBack} className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs font-bold hover:bg-accent transition-all">← Back</button>}
        <User className="size-7 text-primary" /><h2 className="text-2xl font-bold">{playerName}</h2>
      </div>
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm">Loading profile...</div>
      </div>
    );
  }

  const xpNeeded = (player.level ?? 1) * 100;
  const xpPercent = Math.min(100, ((player.experience ?? 0) / xpNeeded) * 100);

  const getRank = (level: number) => {
    if (level >= 90) return "Shadow Emperor";
    if (level >= 80) return "Godfather";
    if (level >= 70) return "Don";
    if (level >= 60) return "Underboss";
    if (level >= 50) return "Consigliere";
    if (level >= 40) return "Captain";
    if (level >= 30) return "Soldier";
    if (level >= 20) return "Enforcer";
    if (level >= 10) return "Thug";
    return "Street Rat";
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="mafia-card rounded-xl overflow-hidden">
        <div className="relative h-28" style={{ background: "linear-gradient(135deg, #0c0402, #1a0a06, #0c0402)" }}>
          <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(135deg, #d09945, #7e5c2a)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[oklch(0.10_0.015_35)] to-transparent" />
        </div>
        <div className="px-6 pb-4 -mt-10 relative z-10">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="size-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
              {player.role === "admin" ? <Shield className="size-8 text-yellow-400" /> :
               <span className="text-2xl font-bold text-primary">{(player.nickname || "U")[0]?.toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black truncate">{player.nickname || "Unknown"}</h2>
                {player.role === "admin" && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded">ADMIN</span>}
                {player.wantedLevel > 0 && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">WANTED {player.wantedLevel}</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{getRank(player.level ?? 1)} • Level {player.level ?? 1}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-[10px] text-muted-foreground">Cash</div>
          <div className="text-sm font-bold text-green-400">${(player.money ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🏦</div>
          <div className="text-[10px] text-muted-foreground">Bank</div>
          <div className="text-sm font-bold text-blue-400">${(player.bank ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-[10px] text-muted-foreground">Points</div>
          <div className="text-sm font-bold text-yellow-400">{((player as any).points ?? 0).toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">⚔️</div>
          <div className="text-[10px] text-muted-foreground">ATK</div>
          <div className="text-sm font-bold text-red-400">{(player.attack ?? 0) + 10}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🛡️</div>
          <div className="text-[10px] text-muted-foreground">DEF</div>
          <div className="text-sm font-bold text-blue-400">{(player.defense ?? 0) + 10}</div>
        </div>
        <div className="mafia-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">💀</div>
          <div className="text-[10px] text-muted-foreground">Kills</div>
          <div className="text-sm font-bold text-orange-400">{player.totalKills ?? 0}</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-yellow-400 font-bold">⭐ {getRank(player.level ?? 1)} Lv.{player.level ?? 1}</span>
          <span className="text-muted-foreground">{player.experience ?? 0}/{xpNeeded} XP</span>
        </div>
        <div className="w-full h-3 bg-[oklch(0.14_0.012_35)] rounded-full overflow-hidden border border-yellow-500/20">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(xpPercent, (player.experience ?? 0) > 0 ? 3 : 0)}%`,
              background: "linear-gradient(90deg, #b45309, #f59e0b, #fbbf24, #f59e0b, #b45309)",
            }} />
        </div>
      </div>

      {/* Life Bar */}
      <div className="mafia-card rounded-xl p-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-400 font-bold">❤️ Life</span>
          <span className="text-muted-foreground">{player.life ?? 0}/{player.maxLife ?? 100}</span>
        </div>
        <div className="w-full h-3 bg-[oklch(0.14_0.012_35)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full transition-all"
            style={{ width: `${((player.life ?? 0) / (player.maxLife ?? 100)) * 100}%` }} />
        </div>
      </div>

      {/* Details */}
      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold flex items-center gap-2"><User className="size-4 text-primary" /> Details</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2"><MapPin className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Location:</span> <span className="font-bold">{player.location || "New York"}</span></div>
          <div className="flex items-center gap-2"><Shield className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Class:</span> <span className="font-bold capitalize">{player.playerClass || "None"}</span></div>
          <div className="flex items-center gap-2"><Star className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Reputation:</span> <span className="font-bold">{player.reputation ?? 0}</span></div>
          <div className="flex items-center gap-2"><Trophy className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Crimes:</span> <span className="font-bold">{player.totalCrimes ?? 0}</span></div>
          <div className="flex items-center gap-2"><Swords className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Fights:</span> <span className="font-bold">{player.totalFights ?? 0}</span></div>
          <div className="flex items-center gap-2"><Heart className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Deaths:</span> <span className="font-bold">{player.totalDeaths ?? 0}</span></div>
          <div className="flex items-center gap-2"><Clock className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Status:</span> <span className="font-bold">{player.isDead ? "💀 Dead" : player.inPrison ? "🔒 In Prison" : "🟢 Active"}</span></div>
        </div>
      </div>
    </div>
  );
}

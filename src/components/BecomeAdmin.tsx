import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Shield, Crown, Search, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";

export function BecomeAdminPage() {
  const isAdmin = useQuery(api.admin.isAdminCheck);
  const players = useQuery(api.admin.getAllPlayers);
  const grantAdmin = useMutation(api.admin.grantAdmin);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Loading state
  if (isAdmin === undefined) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Non-admin: access denied
  if (!isAdmin) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="size-20 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-6"
        >
          <AlertTriangle className="size-10 text-red-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-4">
          Only administrators can assign admin roles to other players.
          Contact an admin if you need elevated privileges.
        </p>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
          <AlertTriangle className="size-4 text-red-400" />
          <span className="text-xs font-bold text-red-400">ADMIN REQUIRED</span>
        </div>
      </div>
    );
  }

  // Admin panel: grant admin to players
  const filteredPlayers = (players || []).filter((p: any) =>
    p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()) && p.role !== "admin"
  );

  const handleGrant = async (targetId: string) => {
    setLoading(true);
    setMsg(null);
    try {
      await grantAdmin({ targetId: targetId as any });
      setMsg({ success: true, text: "Admin role granted successfully!" });
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : "Failed to grant admin role";
      setMsg({ success: false, text });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="size-12 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center"
        >
          <Crown className="size-7 text-yellow-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Assign admin roles to trusted players</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full w-fit">
        <Shield className="size-4 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">ADMIN ACCESS</span>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
          msg.success
            ? "bg-green-500/10 border border-green-500/30 text-green-400"
            : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          {msg.success ? <CheckCircle className="size-4" /> : <AlertTriangle className="size-4" />}
          {msg.text}
        </div>
      )}

      <div className="mafia-card rounded-xl p-4 space-y-3">
        <div className="text-sm font-bold flex items-center gap-2">
          <UserCheck className="size-4 text-primary" />
          Grant Admin Role
        </div>
        <p className="text-xs text-muted-foreground">
          Search for a player and grant them admin privileges. Admins can manage all players,
          broadcast messages, and control the game.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players by name..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              {search ? "No non-admin players found matching your search" : "All players are already admins"}
            </div>
          ) : (
            filteredPlayers.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition">
                <div>
                  <div className="text-sm font-bold">{p.nickname}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level} • {p.role || "user"}</div>
                </div>
                <button
                  onClick={() => handleGrant(p._id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 disabled:opacity-50 transition"
                >
                  👑 Grant Admin
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

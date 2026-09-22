import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Shield, Crown, Search, UserCheck, AlertTriangle, CheckCircle, KeyRound } from "lucide-react";

export function BecomeAdminPage() {
  const isAdmin = useQuery(api.admin.isAdminCheck);
  const players = useQuery(api.admin.getAllPlayers);
  const grantAdmin = useMutation(api.admin.grantAdmin);
  const becomeAdmin = useMutation(api.admin.becomeAdmin);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Self-serve unlock: enter the master key to make YOUR current account admin.
  const handleUnlock = async () => {
    if (!secretKey.trim()) return;
    setUnlocking(true);
    setMsg(null);
    try {
      const r = await becomeAdmin({ secretKey: secretKey.trim() });
      setMsg({ success: true, text: r.message || "Admin access granted! Reload to see the admin menu." });
      setSecretKey("");
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : "Invalid admin key";
      setMsg({ success: false, text });
    }
    setUnlocking(false);
  };

  // Loading state
  if (isAdmin === undefined) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Non-admin: self-serve unlock with the master key
  if (!isAdmin) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="size-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-6"
        >
          <KeyRound className="size-10 text-amber-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Admin Unlock</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-5">
          Enter the admin master key to activate administrator access on your current account.
        </p>
        {msg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold mb-4 ${
            msg.success ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {msg.success ? <CheckCircle className="size-4" /> : <AlertTriangle className="size-4" />}
            {msg.text}
          </div>
        )}
        <div className="w-full max-w-sm space-y-3">
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
            placeholder="Admin master key..."
            className="w-full bg-[oklch(0.10_0.012_35)] border border-border rounded-lg px-4 py-3 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={handleUnlock}
            disabled={unlocking || !secretKey.trim()}
            className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-black hover:bg-amber-500 disabled:opacity-40 transition"
          >
            {unlocking ? "Unlocking..." : "👑 Unlock Admin Access"}
          </button>
        </div>
        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-500/10 border border-slate-500/20 rounded-full">
          <Shield className="size-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400">MASTER KEY REQUIRED</span>
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

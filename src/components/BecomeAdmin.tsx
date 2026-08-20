import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Shield, Key, CheckCircle, AlertTriangle, Crown, Lock } from "lucide-react";

export function BecomeAdminPage() {
  const becomeAdmin = useMutation(api.admin.becomeAdmin);
  const isAdmin = useQuery(api.admin.isAdminCheck);
  const [secretKey, setSecretKey] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!secretKey) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await becomeAdmin({ secretKey });
      setResult({ success: true, message: r.message });
    } catch (e: unknown) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Failed to activate admin. Make sure you are signed in." });
    }
    setLoading(false);
  };

  // Still loading
  if (isAdmin === undefined) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="size-20 rounded-2xl bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mb-6"
        >
          <Crown className="size-10 text-yellow-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">You Are Already Admin</h2>
        <p className="text-muted-foreground text-sm mb-4">You have full admin privileges.</p>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
          <Shield className="size-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">ADMIN ROLE ACTIVE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12 }}
        className="size-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6"
      >
        <Key className="size-10 text-primary" />
      </motion.div>

      <h2 className="text-2xl font-bold mb-2">Get Admin Access</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-8">
        Enter the admin secret key to gain full administrative privileges over the game.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="password"
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Enter admin secret key..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !secretKey}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Authenticating..." : "🔑 Activate Admin"}
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
              result.success
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {result.success ? <CheckCircle className="size-4" /> : <AlertTriangle className="size-4" />}
            {result.message}
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-secondary/50 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">ADMIN PRIVILEGES</span>
          </div>
          <ul className="text-[10px] text-muted-foreground space-y-1 text-left">
            <li>• Manage all players (ban, kick, give money, teleport)</li>
            <li>• View real-time game statistics</li>
            <li>• Send broadcast messages to all players</li>
            <li>• Modify player levels, stats, and skill points</li>
            <li>• Free players from prison or revive dead players</li>
            <li>• Reset player accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

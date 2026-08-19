import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== 90-SECOND COOLDOWN HOOK =====
export function useCooldown(seconds = 90) {
  const [remaining, setRemaining] = useState(0);
  const endRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    endRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [remaining > 0]);

  const onCooldown = remaining > 0;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = onCooldown ? `${minutes}:${secs.toString().padStart(2, "0")}` : "";
  const pct = onCooldown ? ((seconds - remaining) / seconds) * 100 : 100;

  return { onCooldown, remaining, display, pct, startCooldown };
}

// ===== EPIC ACTION RESULT =====
interface EpicActionResultProps {
  success: boolean;
  title?: string;
  money?: number;
  xp?: number;
  message?: string;
  extra?: React.ReactNode;
  onClose?: () => void;
}

export function EpicActionResult({ success, title, money, xp, message, extra, onClose }: EpicActionResultProps) {
  const [phase, setPhase] = useState<"intro" | "reveal" | "done">("intro");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 400);
    const t2 = setTimeout(() => setPhase("done"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative overflow-hidden rounded-2xl border-2 ${
          success
            ? "border-green-500/60 bg-gradient-to-br from-green-950/80 via-green-900/40 to-emerald-950/60 shadow-[0_0_40px_rgba(34,197,94,0.15)]"
            : "border-red-500/60 bg-gradient-to-br from-red-950/80 via-red-900/40 to-rose-950/60 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
        }`}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${success ? "bg-green-400" : "bg-red-400"}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.5, 0],
                x: [0, (Math.random() - 0.5) * 300],
                y: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: 2,
                delay: 0.1 + i * 0.08,
                ease: "easeOut",
              }}
              style={{
                width: 4 + Math.random() * 6,
                height: 4 + Math.random() * 6,
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6">
          {/* Main result flash */}
          <motion.div
            initial={{ opacity: 0, scale: 3 }}
            animate={{ opacity: [0, 1, 0.8, 1], scale: [3, 1.1, 0.95, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-4"
          >
            {phase === "intro" ? (
              <div className="text-5xl">
                {success ? "⚡" : "💥"}
              </div>
            ) : (
              <div className={`text-3xl md:text-4xl font-black tracking-tight ${
                success ? "text-green-300" : "text-red-300"
              }`}>
                {title || (success ? "💰 HEIST SUCCESS!" : "🚨 BUSTED!")}
              </div>
            )}
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {phase !== "intro" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="space-y-3"
              >
                {money !== undefined && money !== 0 && (
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`flex items-center justify-center gap-2 text-xl font-bold ${
                      money > 0 ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    <span>{money > 0 ? "💰" : "💸"}</span>
                    <span>{money > 0 ? "+" : "-"}${Math.abs(money).toLocaleString()}</span>
                  </motion.div>
                )}

                {xp !== undefined && xp > 0 && (
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center justify-center gap-2 text-lg font-bold text-blue-300"
                  >
                    <span>⭐</span>
                    <span>+{xp} XP</span>
                  </motion.div>
                )}

                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-center text-muted-foreground"
                  >
                    {message}
                  </motion.p>
                )}

                {extra && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                  >
                    {extra}
                  </motion.div>
                )}

                {onClose && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center pt-2"
                  >
                    <button
                      onClick={onClose}
                      className="px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-lg hover:bg-background/50 transition-all"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animated scan line */}
        <motion.div
          className={`absolute inset-x-0 h-[2px] ${success ? "bg-green-400/50" : "bg-red-400/50"}`}
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.2, ease: "linear", delay: 0.2 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ===== COOLDOWN TIMER BAR =====
export function CooldownBar({ cooldown }: { cooldown: ReturnType<typeof useCooldown> }) {
  if (!cooldown.onCooldown) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl border border-amber-900/40 bg-gradient-to-r from-amber-950/50 via-amber-900/20 to-amber-950/50 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-lg"
            >
              ⏳
            </motion.div>
            <span className="text-sm font-bold text-amber-300">Cooldown Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black font-mono text-amber-200 tabular-nums">
              {cooldown.display}
            </span>
          </div>
        </div>
        <div className="h-2 bg-amber-950 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${cooldown.pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-[10px] text-amber-400/60 mt-1.5 text-center">Next action available in {cooldown.display}</p>
      </div>
    </motion.div>
  );
}

// ===== EPIC ACTION BUTTON =====
interface EpicButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  cooldown?: ReturnType<typeof useCooldown>;
  children: React.ReactNode;
  className?: string;
  variant?: "danger" | "primary" | "warning" | "success";
}

const variantStyles = {
  primary: "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground shadow-lg shadow-primary/20",
  danger: "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-lg shadow-red-900/30",
  warning: "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30",
  success: "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white shadow-lg shadow-green-900/30",
};

export function EpicButton({ onClick, disabled, loading, cooldown, children, className = "", variant = "primary" }: EpicButtonProps) {
  const isDisabled = disabled || loading || cooldown?.onCooldown;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.03, y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={isDisabled}
      className={`relative w-full py-3.5 px-6 font-black text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden ${variantStyles[variant]} ${className}`}
    >
      {/* Shimmer effect */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="size-4 border-2 border-current border-t-transparent rounded-full"
            />
            <span>Executing...</span>
          </>
        ) : cooldown?.onCooldown ? (
          <>
            <span>⏳</span>
            <span>Cooldown {cooldown.display}</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface EpicActionResult {
  success: boolean;
  title: string;
  description: string;
  icon: string;
  cash?: number;
  xp?: number;
  damage?: number;
  item?: string;
  streak?: number;
  bounty?: number;
  wanted?: number;
  extra?: string;
  special?: string;
}

interface EpicActionModalProps {
  result: EpicActionResult | null;
  onClose: () => void;
}

// Cinematic stage phases
type Phase = "idle" | "buildup" | "impact" | "reveal" | "rewards";

export function EpicActionModal({ result, onClose }: EpicActionModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!result) {
      setPhase("idle");
      return;
    }
    setPhase("buildup");
    const t1 = setTimeout(() => setPhase("impact"), 600);
    const t2 = setTimeout(() => setPhase("reveal"), 1200);
    const t3 = setTimeout(() => setPhase("rewards"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [result]);

  const handleClose = useCallback(() => {
    setPhase("idle");
    onClose();
  }, [onClose]);

  if (!result) return null;

  const isWin = result.success;
  const successColor = isWin ? "text-green-400" : "text-red-400";
  const successBorder = isWin ? "border-green-500/30" : "border-red-500/30";
  const successBg = isWin
    ? "from-green-950/80 via-background to-green-950/40"
    : "from-red-950/80 via-background to-red-950/40";
  const glowColor = isWin ? "shadow-green-500/20" : "shadow-red-500/20";
  const particleColor = isWin ? "#22c55e" : "#ef4444";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Full screen flash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase === "impact" ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: particleColor }}
        />

        {/* Radial particles */}
        {phase === "impact" && Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: [0, 2, 0.5],
              x: Math.cos((i / 12) * Math.PI * 2) * (150 + Math.random() * 100),
              y: Math.sin((i / 12) * Math.PI * 2) * (150 + Math.random() * 100),
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{ backgroundColor: particleColor }}
          />
        ))}

        {/* Main card */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotateZ: -10 }}
          animate={
            phase === "buildup"
              ? { scale: 1.1, opacity: 1, rotateZ: 0 }
              : phase === "impact"
              ? { scale: [1.1, 0.95, 1.02, 1], opacity: 1, rotateZ: 0 }
              : { scale: 1, opacity: 1, rotateZ: 0 }
          }
          transition={
            phase === "buildup"
              ? { duration: 0.5, ease: "easeOut" }
              : phase === "impact"
              ? { duration: 0.6, times: [0, 0.3, 0.6, 1] }
              : { duration: 0.3 }
          }
          onClick={(e) => e.stopPropagation()}
          className={`relative w-[92vw] max-w-md mx-4 rounded-2xl border ${successBorder} bg-gradient-to-b ${successBg} shadow-2xl ${glowColor} overflow-hidden`}
        >
          {/* Animated top bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === "reveal" || phase === "rewards" ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-1 origin-left ${isWin ? "bg-gradient-to-r from-green-600 via-emerald-400 to-green-600" : "bg-gradient-to-r from-red-600 via-orange-400 to-red-600"}`}
          />

          {/* Icon + Title */}
          <div className="p-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={phase !== "idle" ? { scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              {result.icon}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={phase !== "buildup" ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className={`text-2xl font-black tracking-tight ${successColor}`}
            >
              {result.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={phase === "reveal" || phase === "rewards" ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mt-2 leading-relaxed"
            >
              {result.description}
            </motion.p>
          </div>

          {/* Rewards Panel */}
          <AnimatePresence>
            {phase === "rewards" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6"
              >
                <div className="border-t border-border/30 pt-4 space-y-2">
                  {/* Cash reward */}
                  {result.cash !== undefined && result.cash !== 0 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-green-950/30 border border-green-800/30"
                    >
                      <span className="text-sm text-green-300 flex items-center gap-2">
                        <span className="text-lg">💵</span> Cash
                      </span>
                      <span className={`text-lg font-black ${result.cash > 0 ? "text-green-400" : "text-red-400"}`}>
                        {result.cash > 0 ? "+" : ""}${Math.abs(result.cash).toLocaleString()}
                      </span>
                    </motion.div>
                  )}

                  {/* XP reward */}
                  {result.xp !== undefined && result.xp > 0 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-blue-950/30 border border-blue-800/30"
                    >
                      <span className="text-sm text-blue-300 flex items-center gap-2">
                        <span className="text-lg">⚡</span> Experience
                      </span>
                      <span className="text-lg font-black text-blue-400">+{result.xp} XP</span>
                    </motion.div>
                  )}

                  {/* Damage */}
                  {result.damage !== undefined && result.damage > 0 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-orange-950/30 border border-orange-800/30"
                    >
                      <span className="text-sm text-orange-300 flex items-center gap-2">
                        <span className="text-lg">💥</span> Damage Taken
                      </span>
                      <span className="text-lg font-black text-orange-400">-{result.damage}</span>
                    </motion.div>
                  )}

                  {/* Wanted level */}
                  {result.wanted !== undefined && result.wanted > 0 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-red-950/30 border border-red-800/30"
                    >
                      <span className="text-sm text-red-300 flex items-center gap-2">
                        <span className="text-lg">🚨</span> Wanted Level
                      </span>
                      <span className="text-lg font-black text-red-400">+{result.wanted}</span>
                    </motion.div>
                  )}

                  {/* Streak */}
                  {result.streak !== undefined && result.streak > 1 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-yellow-950/30 border border-yellow-800/30"
                    >
                      <span className="text-sm text-yellow-300 flex items-center gap-2">
                        <span className="text-lg">🔥</span> Streak
                      </span>
                      <span className="text-lg font-black text-yellow-400">x{result.streak}</span>
                    </motion.div>
                  )}

                  {/* Item drop */}
                  {result.item && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-800/30"
                    >
                      <span className="text-sm text-purple-300 flex items-center gap-2">
                        <span className="text-lg">💎</span> Item Found
                      </span>
                      <span className="text-sm font-bold text-purple-400">{result.item}</span>
                    </motion.div>
                  )}

                  {/* Special */}
                  {result.special && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="text-center py-2"
                    >
                      <span className="text-sm font-black text-yellow-400 animate-pulse">⭐ {result.special}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          {phase === "rewards" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-6 pb-6"
            >
              <button
                onClick={handleClose}
                className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isWin
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                CONTINUE
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

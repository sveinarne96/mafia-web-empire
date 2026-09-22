import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Crosshair, Shield, Users, Banknote, Swords, Skull,  Crown, ChevronRight,
  Flame, Target, Eye, Zap, Lock, Heart, MapPin, Star, Trophy, Bomb,
  Building2, Car, Gem, Clock, TrendingUp, AlertTriangle,
  Megaphone, Siren, Gavel, Radio, Map, Download,
} from "lucide-react";

// ===== ANIMATED COUNTER =====
function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <div ref={ref} className="text-3xl md:text-4xl font-black mafia-gold">{prefix}{count.toLocaleString()}{suffix}</div>;
}

// ===== FLOATING PARTICLES =====
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 3 === 0 ? "#e48233" : i % 3 === 1 ? "#e62b34" : "#ffd700",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -200 - Math.random() * 300],
            x: [(Math.random() - 0.5) * 100],
            scale: [0.5, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ===== TYPING EFFECT =====
function TypingText({ texts, className }: { texts: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    const timer = setInterval(() => {
      if (!deleting) {
        setText(current.substring(0, text.length + 1));
        if (text.length === current.length) {
          setTimeout(() => setDeleting(true), 2000);
        }
      } else {
        setText(current.substring(0, text.length - 1));
        if (text.length === 0) {
          setDeleting(false);
          setIndex((index + 1) % texts.length);
        }
      }
    }, deleting ? 30 : 60);
    return () => clearInterval(timer);
  }, [text, deleting, index, texts]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
}

// ===== MAIN LANDING =====
export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  // Secret: tap the footer crown 5x to reveal the source-code download
  const [secretTaps, setSecretTaps] = useState(0);
  const [showSourceDownload, setShowSourceDownload] = useState(false);
  const revealSourceDownload = () => {
    setSecretTaps((t) => {
      if (t + 1 >= 5) setShowSourceDownload(true);
      return t + 1;
    });
  };

  const features = [
    { icon: Crosshair, title: "Street Crimes", desc: "Mugging, pickpocketing, shoplifting, car theft — 100+ criminal actions across 10 cities.", color: "text-red-400", bg: "from-red-900/20 to-red-950/10", border: "border-red-500/20" },
    { icon: Bomb, title: "Heists & Robberies", desc: "Bank vaults, casino heists, armored cars, diamond exchanges — plan and execute the perfect score.", color: "text-orange-400", bg: "from-orange-900/20 to-orange-950/10", border: "border-orange-500/20" },
    { icon: Skull, title: "Murder System", desc: "14 weapons, 12 methods, forensic evidence, detective investigations — plan the perfect hit.", color: "text-purple-400", bg: "from-purple-900/20 to-purple-950/10", border: "border-purple-500/20" },
    { icon: Users, title: "Crime Families", desc: "Create or join a family. Wage wars, forge alliances, control territories, dominate the underworld.", color: "text-blue-400", bg: "from-blue-900/20 to-blue-950/10", border: "border-blue-500/20" },
    { icon: Shield, title: "Prison System", desc: "Get caught and serve time. Work prison jobs, join gangs, smuggle contraband, plan your escape.", color: "text-gray-400", bg: "from-gray-900/20 to-gray-950/10", border: "border-gray-500/20" },
    { icon: Gem, title: "Underground Economy", desc: "Stock market, crypto mining, black market, auction house — launder money and build wealth.", color: "text-green-400", bg: "from-green-900/20 to-green-950/10", border: "border-green-500/20" },
    { icon: Star, title: "PvP Combat", desc: "Fight club, 1v1 duels, crew wars, bounties, contracts — prove you're the deadliest player.", color: "text-yellow-400", bg: "from-yellow-900/20 to-yellow-950/10", border: "border-yellow-500/20" },
    { icon: Target, title: "50,000+ Missions", desc: "Storyline campaigns, daily/weekly missions, side quests — endless progression and rewards.", color: "text-pink-400", bg: "from-pink-900/20 to-pink-950/10", border: "border-pink-500/20" },
    { icon: Crown, title: "Prestige System", desc: "Reach level 50 and prestige for permanent bonuses, exclusive titles, and legendary rewards.", color: "text-amber-400", bg: "from-amber-900/20 to-amber-950/10", border: "border-amber-500/20" },
  ];

  const cities = [
    { name: "New York", level: 1, icon: "🗽", desc: "Street crime capital" },
    { name: "Los Angeles", level: 5, icon: "🌴", desc: "Smuggling paradise" },
    { name: "Chicago", level: 10, icon: "🏙️", desc: "Organized crime hub" },
    { name: "Miami", level: 15, icon: "🌊", desc: "Drug paradise" },
    { name: "Las Vegas", level: 20, icon: "🎰", desc: "Gambling capital" },
    { name: "London", level: 25, icon: "🇬🇧", desc: "Old money, new crime" },
    { name: "Tokyo", level: 30, icon: "🗼", desc: "Yakuza territory" },
    { name: "Berlin", level: 35, icon: "🇩🇪", desc: "Underground markets" },
    { name: "Sydney", level: 40, icon: "🦘", desc: "Down under crime" },
    { name: "Dubai", level: 45, icon: "🏙️", desc: "Gold city empire" },
  ];

  const timeline = [
    { time: "0:00", event: "You arrive in the city with $1,000 and a dream." },
    { time: "1:00", event: "First mugging. $200 earned. Wanted level rising." },
    { time: "5:00", event: "Joined a crew. Territory wars begin." },
    { time: "15:00", event: "First bank heist. $250,000 earned. FBI is watching." },
    { time: "30:00", event: "Arrested. 15 seconds in prison. Released." },
    { time: "1:00", event: "Level 10. New weapons unlocked. Murder menu opens." },
    { time: "3:00", event: "Created your own crime family. Members joining." },
    { time: "10:00", event: "Controlling 3 city districts. $50M empire." },
    { time: "24:00", event: "Prestige achieved. The cycle begins again." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex items-center justify-center">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.06_0.02_30)] via-[oklch(0.08_0.02_35)] to-background" />

        {/* Animated radial glows */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[200px]" />
        </div>

        {/* Scan lines overlay */}
        <div className="absolute inset-0 scanlines opacity-20" />

        {/* Floating particles */}
        <FloatingParticles />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
            {/* Crown icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-6"
            >
              <Crown className="size-16 mx-auto text-primary drop-shadow-[0_0_30px_rgba(228,130,51,0.4)]" />
            </motion.div>

            {/* Title */}
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-4">
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">SHADOW</span>
              <br />
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-clip-text text-transparent">EMPIRE</span>
            </h1>

            {/* Subtitle with typing effect */}
            <div className="h-8 mb-4">
              <TypingText
                texts={[
                  "Rule the underworld.",
                  "Build your empire.",
                  "Eliminate all rivals.",
                  "Control the streets.",
                  "Become the Don.",
                ]}
                className="text-lg md:text-xl text-muted-foreground font-medium"
              />
            </div>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground/50 mb-10 tracking-[0.3em] uppercase font-medium">
              10 Cities &bull; 100+ Crimes &bull; 50,000+ Missions &bull; Unlimited Power
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(228,130,51,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="group relative px-10 py-5 bg-gradient-to-r from-primary to-amber-600 text-primary-foreground font-black text-lg rounded-xl shadow-2xl shadow-primary/20 transition-all flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  {isAuthenticated ? "Enter the Underworld" : "Start Your Empire"}
                  <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="px-10 py-5 bg-secondary/50 text-secondary-foreground font-semibold text-lg rounded-xl border border-border hover:border-primary/30 hover:bg-secondary transition-all"
              >
                {isAuthenticated ? "Dashboard" : "Join Free"}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Players", value: "2,847", icon: Users },
              { label: "Crimes Committed", value: "1.2M+", icon: Crosshair },
              { label: "Battles Fought", value: "847K+", icon: Swords },
              { label: "Families Founded", value: "312", icon: Crown },
            ].map((stat) => (
              <div key={stat.label} className="mafia-card rounded-xl p-4 text-center hover:mafia-glow transition-shadow group">
                <stat.icon className="size-5 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-xl font-black mafia-gold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </motion.section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[oklch(0.12_0.02_38)/0.2] to-background" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-xs text-primary tracking-[0.4em] uppercase mb-3 font-medium">Everything You Need</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              Rule the <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Underworld</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From street-level crimes to international heists — every system is designed to keep you hooked.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative rounded-2xl p-6 bg-gradient-to-br ${feat.bg} border ${feat.border} hover:shadow-xl transition-all group cursor-default`}
              >
                <div className={`size-12 rounded-xl bg-black/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feat.icon className={`size-6 ${feat.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS - JOURNEY ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[oklch(0.25_0.08_15)/0.05] to-background" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-xs text-red-400 tracking-[0.4em] uppercase mb-3 font-medium">Your Journey</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              From <span className="text-red-400">Zero</span> to <span className="mafia-gold">Don</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Watch how a player's first 24 hours unfolds in Shadow Empire.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-red-500/50 to-primary/50" />

            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-center gap-6 mb-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} text-left`}>
                  <div className="mafia-card rounded-xl p-4 inline-block hover:mafia-glow transition-shadow">
                    <div className="text-xs text-primary font-bold mb-1">{item.time} in-game</div>
                    <div className="text-sm text-muted-foreground">{item.event}</div>
                  </div>
                </div>
                {/* Center dot */}
                <div className="relative z-10 size-4 rounded-full bg-primary border-2 border-background shrink-0 shadow-lg shadow-primary/30" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CITIES SECTION ===== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[oklch(0.12_0.02_38)/0.2] to-background" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-xs text-primary tracking-[0.4em] uppercase mb-3 font-medium">Open World</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="mafia-gold">10 Cities</span> to Conquer
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Travel between cities. Each has unique opportunities, dangers, and rewards. Higher levels unlock more cities.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="mafia-card rounded-2xl p-5 text-center hover:mafia-glow transition-all cursor-default group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{city.icon}</div>
                <div className="text-sm font-bold mb-1">{city.name}</div>
                <div className="text-[10px] text-muted-foreground mb-2">{city.desc}</div>
                <div className="text-[10px] text-primary font-bold bg-primary/10 rounded-full px-2 py-0.5 inline-block">
                  Lv. {city.level}+
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NUMBERS SECTION ===== */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[oklch(0.75_0.14_75)/0.05] to-background" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-xs text-primary tracking-[0.4em] uppercase mb-3 font-medium">By The Numbers</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">The Scale is <span className="mafia-gold">Massive</span></h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Criminal Actions", target: 150, suffix: "+" },
              { label: "Weapons", target: 14, suffix: "" },
              { label: "Missions", target: 50000, suffix: "+" },
              { label: "Events", target: 30, suffix: "+" },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mafia-card rounded-2xl p-6 text-center hover:mafia-glow transition-shadow"
              >
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-red-950/10 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-8"
            >
              <Skull className="size-20 mx-auto text-primary drop-shadow-[0_0_40px_rgba(228,130,51,0.3)]" />
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              The Streets<br />
              <span className="bg-gradient-to-r from-red-500 via-primary to-amber-400 bg-clip-text text-transparent">Are Waiting</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-4 max-w-xl mx-auto">
              Sign up free. Start with $1,000 and a dream.
            </p>
            <p className="text-sm text-muted-foreground/50 mb-10">
              How far will you go?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(228,130,51,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="group relative px-12 py-6 bg-gradient-to-r from-primary to-amber-600 text-primary-foreground font-black text-xl rounded-2xl shadow-2xl shadow-primary/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  {isAuthenticated ? "Back to the Game" : "Create Your Character"}
                  <ChevronRight className="size-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <button
              type="button"
              onClick={revealSourceDownload}
              aria-label="Shadow Empire"
              className="flex items-center gap-3 cursor-default select-none"
            >
              <Crown className="size-6 text-primary" />
              <span className="text-xl font-black">SHADOW<span className="text-red-400">EMPIRE</span></span>
            </button>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Support</span>
              <span>Discord</span>
            </div>
          </div>
          {showSourceDownload && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <a
                href="/shadow-empire.zip"
                download="shadow-empire.zip"
                title="Download the full Shadow Empire source code"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-secondary/40 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
              >
                <Download className="size-3.5" />
                Download Source
              </a>
            </motion.div>
          )}
          <div className="text-center text-[10px] text-muted-foreground/40">
            A text-based mafia game. Not affiliated with any real criminal organizations. Play responsibly.
          </div>
        </div>
      </footer>
    </div>
  );
}

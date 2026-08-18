import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Crosshair,
  Shield,
  Users,
  Banknote,
  Swords,
  Skull,
  Crown,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Crosshair,
    title: "Commit Crimes",
    desc: "Car theft, burglaries, armed robberies — build your criminal empire one heist at a time.",
  },
  {
    icon: Swords,
    title: "Fight Club",
    desc: "Challenge rivals to brutal fights. Win respect, steal money, climb the rankings.",
  },
  {
    icon: Users,
    title: "Form Families",
    desc: "Create or join a crime family. Coordinate organized crimes and dominate territories.",
  },
  {
    icon: Banknote,
    title: "Underground Economy",
    desc: "Bank, shop, auction house, and a black market — launder money and trade contraband.",
  },
  {
    icon: Shield,
    title: "Prison System",
    desc: "Get caught and you serve time. Plan escapes, bribe guards, or rot in a cell.",
  },
  {
    icon: Skull,
    title: "Live or Die",
    desc: "Permadeath is real. Kill or be killed. The streets show no mercy.",
  },
];

const locations = [
  "New York",
  "Chicago",
  "Las Vegas",
  "Miami",
  "Los Angeles",
  "Detroit",
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background effect */}
        <div className="absolute inset-0 mafia-gradient" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.7 0.15 55 / 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.6 0.22 25 / 0.15) 0%, transparent 50%)`,
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <Crown className="size-12 text-primary" />
              <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                <span className="mafia-gold">SHADOW</span>
                <span className="text-foreground">EMP</span>
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              A text-based mafia underworld. Rise from a street thug to a
              crime lord. Every decision shapes your empire.
            </p>

            <p className="text-sm text-muted-foreground/60 mb-10 font-medium tracking-widest uppercase">
              10 cities &bull; 20+ activities &bull; Unlimited power
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/auth")
                }
                className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow flex items-center gap-2"
              >
                {isAuthenticated ? "Enter the Underworld" : "Start Your Empire"}
                <ChevronRight className="size-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/auth")
                }
                className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold text-lg rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {isAuthenticated ? "Dashboard" : "Join Now — Free"}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Players", value: "2,847" },
              { label: "Crimes Today", value: "18,392" },
              { label: "Fights Won", value: "4,201" },
              { label: "Families", value: "156" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="mafia-card rounded-lg p-4 text-center"
              >
                <div className="text-2xl font-bold mafia-gold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Rule the <span className="mafia-gold">Streets</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every choice matters. Every rival is a threat. Build your empire
              or watch it crumble.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="mafia-card rounded-xl p-6 hover:mafia-glow transition-shadow group"
              >
                <feat.icon className="size-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="mafia-gold">10 Cities</span> to Conquer
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Travel between cities. Each has its own economy, gangs, and
              opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {locations.map((loc, i) => (
              <motion.div
                key={loc}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="mafia-card rounded-lg p-4 text-center hover:mafia-glow transition-all cursor-default"
              >
                <div className="text-sm font-semibold">{loc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Skull className="size-16 mx-auto mb-6 text-primary animate-pulse-gold" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Streets Are Waiting
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Sign up free. Start with $1,000 and a dream. How far will you go?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                navigate(isAuthenticated ? "/dashboard" : "/auth")
              }
              className="px-10 py-5 bg-primary text-primary-foreground font-bold text-xl rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow"
            >
              {isAuthenticated
                ? "Back to the Game"
                : "Create Your Character"}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-primary" />
            <span className="font-bold">ShadowEmpire</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A text-based mafia game. Not affiliated with any real criminal
            organizations.
          </p>
        </div>
      </footer>
    </div>
  );
}

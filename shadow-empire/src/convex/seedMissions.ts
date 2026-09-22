import { mutation } from "./_generated/server";

export const seedMissions = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("missions").collect();
    if (existing.length > 100) return { seeded: 0, total: existing.length };
    const existingTitles = new Set(existing.map((m: any) => m.title));
    let seeded = 0;

    // 8 Storyline Arcs (120 chapters total)
    const storylines = [
      { name: "The Shadow Empire", emoji: "🎭", desc: "Rise from nobody to the most feared crime lord" },
      { name: "Criminal Hearts", emoji: "💕", desc: "Find love in the underworld" },
      { name: "Arctic Freeze", emoji: "❄️", desc: "Frozen underworld, only the cold-blooded survive" },
      { name: "Golden Rush", emoji: "🏆", desc: "Massive gold shipment, everyone wants a piece" },
      { name: "Delta Run", emoji: "🏃", desc: "Clock is ticking, run the gauntlet across cities" },
      { name: "Deep Glow", emoji: "💎", desc: "Mysterious glow beneath the city" },
      { name: "Fire Brain", emoji: "🔥", desc: "Genius arsonist sets the city ablaze" },
      { name: "Dark Rush", emoji: "🌑", desc: "Dark force moves through the underworld" },
    ];

    for (const sl of storylines) {
      for (let i = 0; i < 15; i++) {
        const titles = ["The Beginning", "First Blood", "Rising Action", "Betrayal", "Escape", "Alliance", "Revenge", "The Heist", "Breaking Point", "New Order", "Dark Alliance", "Final Stand", "Redemption", "Legacy", "Endgame"];
        const title = `${sl.emoji} ${sl.name} Ch.${i + 1}: ${titles[i]}`;
        if (!existingTitles.has(title)) {
          await ctx.db.insert("missions", {
            title, description: `Chapter ${i + 1} of ${sl.name}: ${sl.desc}`,
            reward: (i + 1) * 200000, pointsReward: (i + 1) * 10, levelRequired: Math.max(1, (i + 1) * 3),
            type: sl.name, storyline: sl.name, storyOrder: i + 1, location: "any",
            timeLimitMinutes: 30 + i * 5, difficulty: i < 5 ? "easy" : i < 10 ? "medium" : "hard",
            xpReward: (i + 1) * 50,
          });
          seeded++;
        }
      }
    }

    // Generate ~9900 general missions to reach 10000 total
    const types = ["crime", "heist", "gambling", "combat", "transport", "empire", "business", "travel", "social", "progression", "legendary", "underworld", "cyber", "prison_ops", "heist_chain", "territory", "espionage", "tournament", "drug_ops", "cop_evasion", "heist_crew", "smuggling", "black_market", "night_ops", "bodyguard", "fraud", "arms_trade", "corporate", "street_race", "arena", "legendary_heist", "real_estate", "investment", "bounty", "forum", "daily"];
    const diffs = ["easy", "medium", "hard", "legendary"];
    const locs = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Detroit", "Houston", "Phoenix", "Philadelphia", "Boston", "Atlanta", "Dallas", "any"];

    for (let i = 0; i < 9900; i++) {
      const type = types[i % types.length];
      const diff = diffs[Math.floor(Math.random() * diffs.length)];
      const loc = locs[Math.floor(Math.random() * locs.length)];
      const num = i + 1;
      const title = `${type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} #${num}`;
      if (!existingTitles.has(title)) {
        const rm = diff === "legendary" ? 50 : diff === "hard" ? 20 : diff === "medium" ? 8 : 2;
        await ctx.db.insert("missions", {
          title, description: `${diff} ${type.replace(/_/g, " ")} operation`,
          reward: Math.floor(Math.random() * 100000 * rm) + 10000,
          pointsReward: Math.floor(Math.random() * 50 * rm) + 5,
          levelRequired: Math.floor(Math.random() * 50) + 1, type, location: loc,
          timeLimitMinutes: diff === "legendary" ? 120 : diff === "hard" ? 60 : diff === "medium" ? 30 : 15,
          difficulty: diff, xpReward: Math.floor(Math.random() * 200 * rm) + 10,
        });
        seeded++;
      }
    }

    return { seeded, total: existing.length + seeded };
  },
});

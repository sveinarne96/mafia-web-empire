import { mutation } from "./_generated/server";

// Seed 5000+ missions + 8 storyline arcs
export const seedMissions = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("missions").collect();
    if (existing.length > 100) return { seeded: 0, total: existing.length };
    const existingTitles = new Set(existing.map((m: any) => m.title));
    let seeded = 0;

    // 8 Storyline Arcs
    const storylines = [
      { name: "The Shadow Empire", emoji: "🎭", theme: "Main Story", desc: "Rise from nobody to the most feared crime lord" },
      { name: "Criminal Hearts", emoji: "💕", theme: "Love Story", desc: "Find love in the underworld" },
      { name: "Arctic Freeze", emoji: "❄️", theme: "Winter Survival", desc: "Frozen underworld, only the cold-blooded survive" },
      { name: "Golden Rush", emoji: "🏆", theme: "Gold Mining", desc: "Massive gold shipment, everyone wants a piece" },
      { name: "Delta Run", emoji: "🏃", theme: "Speed Challenges", desc: "Clock is ticking, run the gauntlet across cities" },
      { name: "Deep Glow", emoji: "💎", theme: "Underground Mystery", desc: "Mysterious glow beneath the city" },
      { name: "Fire Brain", emoji: "🔥", theme: "Arson & Chaos", desc: "Genius arsonist sets the city ablaze" },
      { name: "Dark Rush", emoji: "🌑", theme: "Shadow Organization", desc: "Dark force moves through the underworld" },
    ];

    for (const sl of storylines) {
      for (let i = 0; i < 15; i++) {
        const title = `${sl.emoji} ${sl.name} Ch.${i + 1}: ${["The Beginning", "First Blood", "Rising Action", "Betrayal", "Escape", "Alliance", "Revenge", "The Heist", "Breaking Point", "New Order", "Dark Alliance", "Final Stand", "Redemption", "Legacy", "Endgame"][i]}`;
        if (!existingTitles.has(title)) {
          await ctx.db.insert("missions", {
            title,
            description: `Chapter ${i + 1} of ${sl.name}: ${sl.desc}`,
            reward: (i + 1) * 200000,
            pointsReward: (i + 1) * 10,
            levelRequired: Math.max(1, (i + 1) * 3),
            type: sl.theme,
            storyline: sl.name,
            storyOrder: i + 1,
            location: "any",
            timeLimitMinutes: 30 + i * 5,
            difficulty: i < 5 ? "easy" : i < 10 ? "medium" : "hard",
            xpReward: (i + 1) * 50,
          });
          seeded++;
        }
      }
    }

    // General missions - 5000+
    const types = ["crime", "heist", "gambling", "combat", "transport", "empire", "business", "travel", "social", "progression", "legendary", "underworld", "cyber", "prison_ops", "heist_chain", "territory", "espionage", "tournament", "drug_ops", "cop_evasion", "heist_crew", "smuggling", "black_market", "night_ops", "bodyguard", "fraud", "arms_trade", "corporate", "street_race", "arena", "legendary_heist", "real_estate", "investment", "bounty", "forum", "daily"];

    const difficulties = ["easy", "medium", "hard", "legendary"];
    const locations = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Detroit", "Houston", "Phoenix", "Philadelphia", "Boston", "Atlanta", "Dallas", "any"];

    for (let i = 0; i < 5000; i++) {
      const type = types[i % types.length];
      const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const num = i + 1;
      const title = `${type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} Mission #${num}`;

      if (!existingTitles.has(title)) {
        const rewardMult = diff === "legendary" ? 50 : diff === "hard" ? 20 : diff === "medium" ? 8 : 2;
        await ctx.db.insert("missions", {
          title,
          description: `Complete a ${diff} ${type.replace(/_/g, " ")} operation`,
          reward: Math.floor(Math.random() * 100000 * rewardMult) + 10000,
          pointsReward: Math.floor(Math.random() * 50 * rewardMult) + 5,
          levelRequired: Math.floor(Math.random() * 50) + 1,
          type,
          location: loc,
          timeLimitMinutes: diff === "legendary" ? 120 : diff === "hard" ? 60 : diff === "medium" ? 30 : 15,
          difficulty: diff,
          xpReward: Math.floor(Math.random() * 200 * rewardMult) + 10,
        });
        seeded++;
      }
    }

    return { seeded, total: existing.length + seeded };
  },
});

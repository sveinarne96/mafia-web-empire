import { mutation } from "./_generated/server";

const missionsData = [
  { title: "🔴 Street Beginner", description: "Complete 15 street crimes to prove your worth.", reward: 5000, pointsReward: 50, levelRequired: 1, type: "crime", location: "New York" },
  { title: "🔪 Street Runner", description: "Complete 10 street crimes and survive to tell the tale.", reward: 10000, pointsReward: 75, levelRequired: 3, type: "crime", location: "New York" },
  { title: "🏠 House Breaker", description: "Burglarize 5 houses without getting caught.", reward: 8000, pointsReward: 60, levelRequired: 5, type: "crime", location: "Chicago" },
  { title: "🚗 Car Thief Elite", description: "Steal 3 cars in one session.", reward: 12000, pointsReward: 80, levelRequired: 5, type: "crime", location: "Los Angeles" },
  { title: "🎯 Heist Apprentice", description: "Complete 5 heist & robbery operations.", reward: 25000, pointsReward: 120, levelRequired: 10, type: "heist", location: "Las Vegas" },
  { title: "🚛 Illegal Transport Master", description: "Complete 30 illegal transport missions.", reward: 50000, pointsReward: 200, levelRequired: 15, type: "transport", location: "Miami" },
  { title: "🎰 High Roller", description: "Win or lose $100,000 in gambling operations.", reward: 30000, pointsReward: 150, levelRequired: 10, type: "gambling", location: "Las Vegas" },
  { title: "🏢 Crime Empire Builder", description: "Visit your Crime Empire headquarters.", reward: 5000, pointsReward: 30, levelRequired: 1, type: "explore", location: "New York" },
  { title: "🌍 World Traveler", description: "Visit 5 different cities via the Airport.", reward: 15000, pointsReward: 100, levelRequired: 8, type: "travel", location: "any" },
  { title: "🏪 Corner Store Owner", description: "Buy your first business from the Company page.", reward: 20000, pointsReward: 100, levelRequired: 10, type: "business", location: "any" },
  { title: "👨‍👩‍👦 Family Man", description: "Create a Family for $50,000.", reward: 30000, pointsReward: 150, levelRequired: 15, type: "social", location: "any" },
  { title: "🤝 Crew Up", description: "Join or create a Crew in the Crew System.", reward: 10000, pointsReward: 75, levelRequired: 5, type: "social", location: "any" },
  { title: "🎯 Bounty Hunter", description: "Visit the Bounty Board and place a bounty on a player.", reward: 15000, pointsReward: 80, levelRequired: 8, type: "pvp", location: "any" },
  { title: "⚔️ Ranked Warrior", description: "Win 5 ranked PvP matches.", reward: 40000, pointsReward: 180, levelRequired: 15, type: "pvp", location: "any" },
  { title: "💀 Killer Instinct", description: "Successfully eliminate 3 targets.", reward: 60000, pointsReward: 250, levelRequired: 20, type: "combat", location: "any" },
  { title: "💊 Drug Runner", description: "Complete 10 drug runs across different cities.", reward: 35000, pointsReward: 160, levelRequired: 12, type: "crime", location: "any" },
  { title: "🧠 Skill Master", description: "Unlock 5 skills from the Skill Tree.", reward: 25000, pointsReward: 120, levelRequired: 10, type: "progression", location: "any" },
  { title: "🏠 Safe House Mogul", description: "Own 3 safe houses simultaneously.", reward: 45000, pointsReward: 200, levelRequired: 18, type: "empire", location: "any" },
  { title: "🔥 Crime Spree Legend", description: "Complete a 10-crime streak without getting arrested.", reward: 50000, pointsReward: 250, levelRequired: 15, type: "crime", location: "any" },
  { title: "🏆 Tournament Champion", description: "Win the tournament.", reward: 75000, pointsReward: 300, levelRequired: 20, type: "pvp", location: "any" },
  { title: "📋 Mission Chain 1", description: "Do 100 street crimes to unlock organized crime tier.", reward: 100000, pointsReward: 500, levelRequired: 25, type: "crime", location: "any" },
  { title: "🌍 Global Operations", description: "Visit all 12 cities at least once.", reward: 80000, pointsReward: 400, levelRequired: 20, type: "travel", location: "any" },
  { title: "💰 Organized Crime 100", description: "Complete 100 organized crime operations.", reward: 150000, pointsReward: 600, levelRequired: 30, type: "crime", location: "any" },
  { title: "🎰 Gambling King", description: "Win 500,000 in total gambling winnings.", reward: 200000, pointsReward: 750, levelRequired: 25, type: "gambling", location: "any" },
  { title: "💀 Elite Assassin", description: "Reach level 50 and eliminate 100 targets.", reward: 500000, pointsReward: 1000, levelRequired: 50, type: "combat", location: "any" },
];

export const seedMissions = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("missions").collect();
    if (existing.length >= missionsData.length) {
      return { message: `Already have ${existing.length} missions seeded.` };
    }
    let seeded = 0;
    for (const m of missionsData) {
      const already = existing.find((e: any) => e.title === m.title);
      if (!already) {
        await ctx.db.insert("missions", m);
        seeded++;
      }
    }
    return { message: `Seeded ${seeded} missions! Total: ${existing.length + seeded}` };
  },
});

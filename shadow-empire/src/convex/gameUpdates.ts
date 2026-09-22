import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all game updates, newest first
export const getUpdates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gameUpdates")
      .order("desc")
      .collect();
  },
});

// Post a new update (admin only)
export const postUpdate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    icon: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gameUpdates", {
      title: args.title,
      description: args.description,
      type: args.type,
      icon: args.icon ?? "📢",
      timestamp: Date.now(),
      pinned: args.pinned ?? false,
    });
  },
});

// Delete an update (admin only)
export const deleteUpdate = mutation({
  args: { updateId: v.id("gameUpdates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.updateId);
    return { success: true };
  },
});

// Seed all game updates
export const seedUpdates = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("gameUpdates").collect();
    if (existing.length > 0) return { seeded: false, count: 0 };

    const updates = [
      // ===== MAJOR FEATURE DROPS =====
      { title: "🚀 Shadow Empire v2.0 — MASSIVE UPDATE", description: "Complete game overhaul with 50+ new systems, realistic visuals, and immersive gameplay. Welcome to the new Shadow Empire!", type: "major", icon: "🚀", pinned: true },
      { title: "💰 100% Sell Value on All Items", description: "Stolen cars and items now sell for 100% of their value in Garage and My Items. No more losing money when selling!", type: "feature", icon: "💰" },
      { title: "🌈 Neon & Ultra Neon Supercars", description: "GTA Car Theft now has 35% chance for Neon Supercars ($50M-$500M) and 10% chance for Ultra Rare Gold/Orange Neon ($100M-$5B) with animated glowing effects!", type: "feature", icon: "🌈" },
      { title: "⚡ XP Now Scales With Item Value", description: "Higher value steals = more XP. Steal mansions for 30K+ XP! All criminal actions now give 500% more XP with +5% bonus per level.", type: "feature", icon: "⚡" },
      { title: "🏛️ FBI & Military Police System", description: "Wanted levels now trigger FBI raids and Military Police responses. Bribe officers, post bail, clear your record. Risk vs reward!", type: "feature", icon: "🏛️" },
      { title: "💍 Marriage System", description: "Propose to other players. Share bank accounts, combine power, get married or divorced. Find your crime partner!", type: "feature", icon: "💍" },
      { title: "👹 Rival AI Gangs", description: "6 NPC criminal organizations with territories, strength, and income. Attack them for massive rewards — or they'll attack you!", type: "feature", icon: "👹" },
      { title: "🏙️ District Ownership", description: "Buy city districts for passive income. Earn cash from every crime committed in your territory. Defend against raids!", type: "feature", icon: "🏙️" },
      { title: "🏷️ Black Market Auctions", description: "Hourly auctions for rare items. Bid against other players in real-time. Snag legendary gear at the right moment!", type: "feature", icon: "🏷️" },
      { title: "🔧 Item Crafting System", description: "6 craftable recipes: Lockpick ($5K), Kevlar ($50K), Silencer ($25K), Bat Signal ($100K), Diamond Blade ($500K), Nano Armor ($2M).", type: "feature", icon: "🔧" },
      { title: "🕵️ Informant Network", description: "Pay $100K to spy on any player — reveals their location, level, cash, and attack power. Knowledge is power!", type: "feature", icon: "🕵️" },
      { title: "💻 Ransomware Attacks", description: "Deploy ransomware on rival players. Steal 15% of their cash. Costs $50K per attack. Cyber warfare is here!", type: "feature", icon: "💻" },
      { title: "🔒 Corruption System", description: "Bribe street cops ($50K), judges ($500K), FBI agents ($2M), or the mayor ($10M). Lower wanted levels, get early warnings!", type: "feature", icon: "🔒" },
      { title: "🪳 Cockroach Racing", description: "Pick a colored roach, bet any amount. 5x payout if yours wins. Pure gambling chaos under the streets!", type: "feature", icon: "🪳" },
      { title: "🌳 Crime Family Tree", description: "Build a criminal dynasty. Your descendants earn you passive XP. Create a legacy that outlives you!", type: "feature", icon: "🌳" },
      { title: "💀 Dead Man's Switch", description: "Set a beneficiary — on death, your items auto-transfer to them. Without one, they're burned. Plan ahead!", type: "feature", icon: "💀" },
      { title: "📰 Crime Headlines", description: "Your biggest crimes generate real headlines that all players can see. Build your reputation through infamy!", type: "feature", icon: "📰" },
      { title: "📸 Crime Photography", description: "Capture photos of your crimes. Sell to newspapers for cash. Rare photos = legendary items!", type: "feature", icon: "📸" },
      { title: "⏳ Time Capsules", description: "Bury items now, dig them up later. Items gain +50% value after 7+ days. Patience pays!", type: "feature", icon: "⏳" },
      { title: "📻 Underground Radio", description: "Level 30+ hidden real-time chat channel. Only the elite can broadcast. The underground never sleeps!", type: "feature", icon: "📻" },
      { title: "🎭 Personality System", description: "Your actions shape your reputation: Ruthless, Loyal, Snake, or Legend. Affects how NPCs and players interact with you.", type: "feature", icon: "🎭" },
      { title: "☠️ Server Purge Event", description: "Monthly 24-hour event: ALL crimes legal, no wanted levels, 2x XP. Pure chaos — survive the purge!", type: "event", icon: "☠️" },

      // ===== GAMEPLAY IMPROVEMENTS =====
      { title: "⏱️ 15-Second Cooldown on All Crimes", description: "All criminal actions now have individual 15-second cooldowns. You can do different crime types simultaneously across different pages!", type: "improvement", icon: "⏱️" },
      { title: "📊 Crime Momentum System", description: "Chain crimes to build momentum. Higher momentum = better success rates. Keep the streak alive!", type: "improvement", icon: "📊" },
      { title: "🏥 Premium Hospital", description: "15 healing types from $575K basic treatment to $7.5M full reconstruction. Choose your recovery!", type: "improvement", icon: "🏥" },
      { title: "👤 Bodyguard System", description: "1 free bodyguard. More cost $10M-$125M. They protect you from attacks. If they die, buy new ones!", type: "improvement", icon: "👤" },
      { title: "🔫 300 Different Cars in GTA Theft", description: "Economy to Ultra Neon Hypercars. 13 categories from parking lots to cartel boss collections. Cars go to your Garage!", type: "improvement", icon: "🔫" },
      { title: "📦 300 Different Items in Steal From House", description: "4 tiers: Easy House ($50-$3K), Average ($500-$10M), Luxury ($12.5M), Mansion ($1M-$15M). All items go to My Items!", type: "improvement", icon: "📦" },
      { title: "📈 40+ Missions System", description: "Story missions, daily challenges, skill-based quests. Earn massive rewards. Missions sorted by level requirement!", type: "improvement", icon: "📈" },

      // ===== DAILY LOGIN REWARDS =====
      { title: "🎁 Daily Login Rewards Updated", description: "Day 1: $100K → Day 2: $350K → Day 3: $700K → Day 4: $1.4M → Day 5: $2.8M → Day 6: $6M → Day 7: $12M + Legendary Item!", type: "reward", icon: "🎁" },

      // ===== VISUAL OVERHAUL =====
      { title: "🎨 Complete Visual Overhaul", description: "Every page now has unique immersive design: glass morphism, holographic shimmer, neon effects, animated stats, gradient headers. The underworld has never looked this good!", type: "visual", icon: "🎨" },
      { title: "✨ 20+ New CSS Animations", description: "Holographic shimmer, neon flicker, heartbeat pulse, orbital spin, glitch effects, scanlines, smoke effects, blood drip, and more!", type: "visual", icon: "✨" },
      { title: "📊 Animated Life, XP & Cash Bars", description: "Status bars now have shimmer animations, glow effects, and real-time pulse. See your stats come alive!", type: "visual", icon: "📊" },

      // ===== EVENTS =====
      { title: "⚡ Double XP Weekend", description: "2x XP on ALL actions every weekend! Stack with hourly XP boosts for insane leveling speed!", type: "event", icon: "⚡" },
      { title: "❄️ Arctic Cold Snap Event", description: "Smuggling profits +50% during arctic weather events. Cold weather, hot profits!", type: "event", icon: "❄️" },
      { title: "🏆 Grand Heist Tournament", description: "Top heist crew wins $50M prize pool! Form your crew and plan the perfect heist!", type: "event", icon: "🏆" },
      { title: "🏎️ Street Race Championship", description: "1v1 street racing tournament with exclusive vehicle rewards. Speed kills!", type: "event", icon: "🏎️" },
      { title: "🌙 Full Moon Night", description: "All rewards x1.5 during full moon events. Rare item drops doubled. Hunt under the moonlight!", type: "event", icon: "🌙" },

      // ===== SYSTEM =====
      { title: "🔑 Admin Panel", description: "Full admin control: manage players, give money, set levels, ban/unban, trigger events, and more. Admin key: shadowempire_admin_2024", type: "system", icon: "🔑" },
      { title: "🛡️ Rank Up Bonuses", description: "Every level up grants: +10 ATK, +10 DEF, +75 HP, +1 Skill Point. Get stronger as you rise!", type: "system", icon: "🛡️" },
      { title: "📊 Level-Based XP Multiplier", description: "+5% XP bonus for every level you gain. Level 50 = +250% more XP on ALL criminal actions!", type: "system", icon: "📊" },
      { title: "🌍 10 Realistic Cities", description: "Travel between New York, Los Angeles, Miami, Chicago, Las Vegas, Seattle, Houston, Atlanta, Denver, and Boston!", type: "system", icon: "🌍" },
    ];

    let count = 0;
    for (const u of updates) {
      await ctx.db.insert("gameUpdates", {
        title: u.title,
        description: u.description,
        type: u.type,
        icon: u.icon ?? "📢",
        timestamp: Date.now() - count * 60000,
        pinned: (u as any).pinned ?? false,
      });
      count++;
    }

    return { seeded: true, count };
  },
});

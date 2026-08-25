import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


// ===== READ-ONLY DEFAULTS (safe for queries) =====
function ensurePlayerDefaults(player: any) {
  // NaN-safe helper
  const n = (v: any, d: number) => (typeof v === "number" && !isNaN(v)) ? v : d;
  return {
    ...player,
    money: n(player.money, 1000),
    bank: n(player.bank, 0),
    points: n(player.points, 0),
    life: n(player.life, 100),
    maxLife: n(player.maxLife, 100),
    level: n(player.level, 1),
    experience: n(player.experience, 0),
    attack: n(player.attack, 10),
    defense: n(player.defense, 10),
    inPrison: player.inPrison ?? false,
    isDead: player.isDead ?? false,
    totalCrimes: n(player.totalCrimes, 0),
    totalKills: n(player.totalKills, 0),
    totalDeaths: n(player.totalDeaths, 0),
    wantedLevel: n(player.wantedLevel, 0),
    prisonTime: n(player.prisonTime, 0),
    skillPoints: n(player.skillPoints, 0),
    levelUpPending: player.levelUpPending ?? false,
    crimeMomentum: n(player.crimeMomentum, 0),
    reputation: n(player.reputation, 0),
    prestige: n(player.prestige, 0),
    prestigeMultiplier: n(player.prestigeMultiplier, 1),
  };
}

// ===== PATCH MISSING FIELDS (mutation only) =====
async function ensurePlayerReady(ctx: { db: any }, player: any) {
  const patches: Record<string, unknown> = {};
  if (player.money === undefined) patches.money = 1000;
  if (player.life === undefined) patches.life = 100;
  if (player.maxLife === undefined) patches.maxLife = 100;
  if (player.level === undefined) patches.level = 1;
  if (player.experience === undefined) patches.experience = 0;
  if (player.attack === undefined) patches.attack = 10;
  if (player.defense === undefined) patches.defense = 10;
  if (player.inPrison === undefined) patches.inPrison = false;
  if (player.isDead === undefined) patches.isDead = false;
  if (player.totalCrimes === undefined) patches.totalCrimes = 0;
  if (player.totalKills === undefined) patches.totalKills = 0;
  if (player.totalDeaths === undefined) patches.totalDeaths = 0;
  if (player.wantedLevel === undefined) patches.wantedLevel = 0;
  if (player.prisonTime === undefined) patches.prisonTime = 0;
  if (player.skillPoints === undefined) patches.skillPoints = 0;
  if (player.levelUpPending === undefined) patches.levelUpPending = false;
  if (player.crimeMomentum === undefined) patches.crimeMomentum = 0;
  if (Object.keys(patches).length > 0) {
    await ctx.db.patch(player._id, patches);
    return { ...player, ...patches };
  }
  return player;
}

async function getCurrentUser(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return ensurePlayerDefaults(user);
}


// ===== XP BOOST SYSTEM (Automatic based on hours played) =====
// Hours played → XP multiplier tiers
const XP_BOOST_TIERS = [
  { hours: 0, multiplier: 5, label: "5x XP" },
  { hours: 1, multiplier: 10, label: "10x XP" },
  { hours: 2, multiplier: 15, label: "15x XP" },
  { hours: 3, multiplier: 25, label: "25x XP" },
  { hours: 5, multiplier: 30, label: "30x XP" },
  { hours: 8, multiplier: 35, label: "35x XP" },
  { hours: 12, multiplier: 40, label: "40x XP" },
  { hours: 18, multiplier: 45, label: "45x XP" },
  { hours: 24, multiplier: 50, label: "50x XP" },
];

export const getXpBoostInfo = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    // Calculate hours played from account creation
    const registeredAt = player.registeredAt ?? Date.now();
    const hoursPlayed = Math.floor((Date.now() - registeredAt) / 3600000);
    // Find current tier
    let currentTier = XP_BOOST_TIERS[0];
    let nextTier = XP_BOOST_TIERS[1] ?? null;
    for (let i = XP_BOOST_TIERS.length - 1; i >= 0; i--) {
      if (hoursPlayed >= XP_BOOST_TIERS[i].hours) {
        currentTier = XP_BOOST_TIERS[i];
        nextTier = XP_BOOST_TIERS[i + 1] ?? null;
        break;
      }
    }
    return {
      multiplier: currentTier.multiplier,
      label: currentTier.label,
      hoursPlayed,
      currentTierHours: currentTier.hours,
      nextTierHours: nextTier?.hours ?? null,
      nextTierMultiplier: nextTier?.multiplier ?? null,
      nextTierLabel: nextTier?.label ?? null,
      allTiers: XP_BOOST_TIERS,
    };
  },
});

// ===== SAVE PROFILE (fix save button) =====
export const saveProfile = mutation({
  args: {
    nickname: v.optional(v.string()),
    avatarId: v.optional(v.string()),
    activeRole: v.optional(v.string()),
    activeTitle: v.optional(v.string()),
    bio: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    activeLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const patch: Record<string, unknown> = {};
    if (args.nickname !== undefined) patch.nickname = args.nickname;
    if (args.avatarId !== undefined) patch.avatarId = args.avatarId;
    if (args.activeRole !== undefined) patch.activeRole = args.activeRole;
    if (args.activeTitle !== undefined) patch.activeTitle = args.activeTitle;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.profilePictureUrl !== undefined) patch.profilePictureUrl = args.profilePictureUrl;
    if (args.activeLanguage !== undefined) patch.activeLanguage = args.activeLanguage;
    await ctx.db.patch(player._id, patch);
    return { success: true };
  },
});


// ===== ADVANCE CRIME MOMENTUM =====
export const advanceCrimeMomentum = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const current = (player.crimeMomentum ?? 0);
    const newMomentum = Math.min(90, current + Math.floor(Math.random() * 8) + 3);
    await ctx.db.patch(player._id, { crimeMomentum: newMomentum });
    return { momentum: newMomentum };
  },
});

// ===== RESET CRIME MOMENTUM =====
export const resetCrimeMomentum = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    await ctx.db.patch(player._id, { crimeMomentum: 0 });
    return { momentum: 0 };
  },
});

// ===== STEAL FROM HOUSE =====
export const stealFromHouse = mutation({
  args: { difficulty: v.string(), houseType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    const baseRate = 0.75;
    const levelBonus = Math.min(0.20, ((player.level ?? 1) * 0.004));
    const successRate = Math.min(0.95, baseRate + levelBonus);
    const succeeded = Math.random() < successRate;

    const difficultyMultipliers: Record<string, number> = {
      easy: 0.5, medium: 1.0, hard: 1.5, extreme: 2.5,
    };
    const mult = difficultyMultipliers[args.difficulty] ?? 1.0;
    // House type tier multiplier
    const houseTier: string = (args as any).houseType ?? "easy";
    const houseTierMult: Record<string, number> = { easy: 1.0, average: 2.5, luxury: 4.0 };
    const finalMult = mult * (houseTierMult[houseTier] ?? 1.0);

    const stolenItemNames = [
      // Common ($50-$500)
      "Loose Change","Broken Watch","Old Phone","USB Drive","Cash Stash","Medicine","Old TV","CD Collection",
      "Cash Register","Bicycle Lock","Car Keys","Wallet","Purse","Backpack","Sunglasses","Jacket",
      "Headphones","Bluetooth Speaker","Power Bank","Flashlight","Pocket Knife","Bottle Cap Collection",
      "Old Coins","Pressed Pennies","Cassette Tapes","Old Camera","Film Roll","Baseball Cap",
      "Sneakers","Running Shoes","Beanie","Scarf","Umbrella","Plastic Bags","Old Book",
      "Newspaper Stack","Vending Machine Coins","Laundry Quarters","Parking Meters","Phone Charger",
      "Extension Cord","Light Bulbs","Paint Can","Duct Tape","Zip Ties","Glue Gun","Screwdriver Set",
      "Wrench Set","Pliers","Measuring Tape","Level Tool","Utility Knife","Hammer","Nails Pack",
      "Drill Bit Set","Sandpaper Pack","Wire Strippers","Electrical Tape","Plumber's Tape",
      // Uncommon ($500-$2,000)
      "Gold Watch","Laptop","Designer Bag","Crystal Decanter","Gold Chain","Silver Set","Lamp",
      "Blender","Coffee Maker","Toaster Oven","Vacuum Cleaner","Iron","Hair Dryer","Microwave",
      "Game Console","Tablet","Wireless Earbuds","Smartwatch","E-Reader","Drone","Action Camera",
      "Gaming Controller","VR Headset","Digital Scale","Mini Projector","Electric Guitar","Violin",
      "Roku Device","Apple TV","Smart Speaker","Robot Vacuum","Air Fryer","Stand Mixer","Sewing Machine",
      "Telescope","Binoculars","Camping Gear","Fishing Rod Set","Snowboard","Skateboard","Bicycle",
      "Kayak Paddle","Snorkel Set","Diving Watch","Cycling Helmet","Boxing Gloves","Dumbbell Set",
      "Yoga Mat","Resistance Bands","Treadmill Remote","Peloton Screen","Weight Scale",
      // Rare ($2,000-$8,000)
      "Jewelry Box","Antique Vase","Art Sculpture","Gemstone Ring","Pearl Earrings","Vintage Watch",
      "Leather Briefcase","CCTV DVR","Bronze Statue","Antique Clock","Oil Painting","Porcelain Doll",
      "Carved Figurine","Crystal Chandelier","Silver Tea Set","Gold Candlesticks","Linen Tapestry",
      "Embroidered Cushion","Antique Mirror","Bronze Bell","Marble Bust","Engraved Plate","Ivory Chess Set",
      "Hand-Painted Fan","Cloisonne Vase","Ink Stone","Jade Pendant","Ivory Tusk Carving","Lacquer Box",
      "Antique Compass","Vintage Globe","Brass Telescope","Pipe Organ Key","Mandolin","Sitar",
      "Oud Instrument","Harmonica Collection","Piano Tuning Fork","Metronome","Sheet Music Collection",
      "Leather Journal","Quill Pen Set","Sealing Wax Kit","Pocket Watch Chain","Cufflink Set","Silk Pocket Square",
      "Monogrammed Towel","Crystal Perfume Bottle","Silver Hairbrush","Bone China Set",
      // Epic ($8,000-$25,000)
      "Diamond Necklace","Platinum Chain","Rolex Submariner","Emerald Pendant","Ruby Tiara","Sapphire Ring",
      "Antique Map","First Edition Book","Gold Bar","Bullion Stack","Rare Wine Bottle","Crystal Decanter Set",
      "Diamond Brooch","Sapphire Bracelet","Emerald Ring","Ruby Necklace","Platinum Watch","Gold Cigarette Case",
      "Diamond Cufflinks","Ruby Tiara Crown","Emerald Necklace","Sapphire Brooch","Platinum Pocket Watch",
      "Gold Snuff Box","Antique Fob Chain","Diamond Stickpin","Ruby Pendant","Sapphire Tiara","Emerald Brooch",
      "Diamond Tennis Bracelet","Platinum Cigarette Case","Gold Locket","Emerald Anklet","Ruby Earrings",
      "Sapphire Crown","Antique Diamond Ring","Platinum Letter Opener","Gold Magnifying Glass",
      // 🏠 MANSION TIER ($1,000,000 - $15,000,000)
      "Silk Tapestry","Rare Painting","Ancient Scroll","Gold Chalice","Jade Dragon","Pearl Necklace",
      "Crystal Skull","Diamond Crown","Platinum Sculpture","Ruby Sword","Emerald Tablet","Sapphire Shield",
      "Antique Armor Piece","Medieval Dagger","Samurai Katana","Viking Axe","Egyptian Amulet","Greek Urn",
      "Roman Coin Collection","Mayan Calendar Fragment","Tibetan Singing Bowl","Ming Vase","Faberge Egg",
      "Stradivarius Bow","Monet Sketch","Picasso Fragment","Leonardo Study","Rembrandt Etching",
      "Cezanne Palette","Van Gogh Brush","Warhol Print","Banksy Original","Hirst Butterfly",
      "Kusama Pumpkin","Calder Mobile","Hepworth Bronze","Moore Sculpture","Giacometti Figure",
      "Dalí Watch","Warhol Soup Can","Basquiat Canvas","Rothko Study","Pollock Drip",
    ];
    const stolenItemValues = [
      // Common ($50-$500)
      50, 100, 120, 150, 200, 250, 300, 320, 350, 380, 400, 420, 450, 480, 500, 180, 220, 280, 350, 400,
      320, 380, 420, 450, 480, 100, 150, 200, 250, 300,
      350, 400, 450, 480, 500, 180, 220, 280, 320, 360,
      100, 150, 200, 250, 300, 350, 400, 450, 480, 500,
      // Uncommon ($500-$2,000)
      500, 800, 1200, 1500, 600, 700, 850, 900, 950, 1000,
      1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
      550, 650, 750, 850, 950, 1050, 1150, 1250, 1350, 1450,
      1550, 1650, 1750, 1850, 1950, 550, 650, 750, 850, 950,
      1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,
      // Rare ($2,000-$8,000)
      2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500,
      7000, 7500, 8000, 2200, 2700, 3200, 3700, 4200, 4700, 5200,
      5700, 6200, 6700, 7200, 7700, 2400, 2900, 3400, 3900, 4400,
      4900, 5400, 5900, 6400, 6900, 7400, 7900, 2600, 3100, 3600,
      4100, 4600, 5100, 5600, 6100, 6600, 7100, 7600, 3300, 3800,
      // Epic ($8,000-$25,000)
      8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000,
      18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 8500, 9500,
      10500, 11500, 12500, 13500, 14500, 15500, 16500, 17500, 18500, 19500,
      20500, 21500, 22500, 23500, 24500, 8200, 9200, 10200, 11200, 12200,
      13200, 14200, 15200, 16200, 17200, 18200, 19200, 20200, 21200, 22200,
      // Mansion Tier ($1,000,000 - $15,000,000)
      1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 5500000,
      6000000, 6500000, 7000000, 7500000, 1200000, 1800000, 2200000, 2800000, 3200000, 3800000,
      4200000, 4800000, 5200000, 5800000, 6200000, 6800000, 7200000, 8000000, 8500000, 9000000,
      9500000, 10000000, 10500000, 11000000, 11500000, 12000000, 12500000, 13000000, 13500000, 14000000,
      14500000, 15000000, 1100000, 1300000, 1600000, 1900000, 2300000, 2700000, 3100000, 3600000,
    ];

    let moneyEarned = 0;
    let itemsStolen: string[] = [];
    let damageTaken = 0;
    let arrested = false;

    if (succeeded) {
      const numItems = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numItems; i++) {
        const idx = Math.floor(Math.random() * stolenItemNames.length);
        const itemValue = Math.floor(stolenItemValues[idx] * finalMult);
        moneyEarned += itemValue;
        itemsStolen.push(stolenItemNames[idx] + " ($" + itemValue + ")");
        // Actually insert stolen item into inventory
        await ctx.db.insert("inventory", {
          userId: player._id,
          itemId: `stolen_${Date.now()}_${i}`,
          name: stolenItemNames[idx],
          type: "stolen",
          equipped: false,
          quantity: 1,
          attack: 0,
          defense: 0,
          price: itemValue,
          rarity: itemValue > 5000 ? "epic" : itemValue > 2000 ? "rare" : itemValue > 500 ? "uncommon" : "common",
        });
      }
      if (Math.random() < 0.05) { itemsStolen.push("Energy Drink"); }
      if (Math.random() < 0.025) { itemsStolen.push("SECRET CHEST FOUND!"); }
    } else {
      damageTaken = Math.floor(Math.random() * 25 + 5);
      arrested = Math.random() > 0.25;
    }

    const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
        // XP scales with total value of items stolen + level multiplier
    const levelMult = 1 + ((player.level ?? 1) * 0.05); // +5% per level
    const valueXp = succeeded ? Math.max(25, Math.floor(moneyEarned / 500)) : 6; // $1 per 500 value, min 25
    const xpEarned = Math.floor(valueXp * 11.0 * levelMult * (Date.now() < ((player as any).xpBoostUntil ?? 0) ? 3 : 1));
    const currentXP = player.experience ?? 0;
    const newXP = currentXP + xpEarned;
    const xpNeeded = (player.level ?? 1) * 100;
    const levelUpNow = newXP >= xpNeeded;

    await ctx.db.patch(player._id, {
      money: Math.max(0, (player.money ?? 0) + moneyEarned),
      life: newLife,
      totalCrimes: (player.totalCrimes ?? 0) + 1,
      experience: levelUpNow ? 0 : newXP,
      levelUpPending: levelUpNow ? true : (player.levelUpPending ?? false),
      inPrison: arrested,
      prisonTime: arrested ? 15000 : (player.prisonTime ?? 0),
      wantedLevel: arrested ? 0 : Math.min(20, (player.wantedLevel ?? 0) + (succeeded ? 1 : 0)),
      lastCrimeAt: Date.now(), crimeMomentum: Math.min(100, (player.crimeMomentum ?? 0) + 4),
    });

    return { success: succeeded, moneyEarned, itemsStolen, damageTaken, arrested, xpEarned };
  },
});

// Helper: add XP and check for level-up
async function addXpAndCheckLevel(ctx: any, player: any, xpAmount: number) {
  const newXP = (player.experience ?? 0) + xpAmount;
  const xpNeeded = (player.level ?? 1) * 100;
  const levelUpNow = newXP >= xpNeeded;
  if (!levelUpNow) {
    return { experience: newXP };
  }
  // Level up! Apply all stats immediately
  return {
    experience: 0,
    level: (player.level ?? 1) + 1,
    levelUpPending: false,
    attack: (player.attack ?? 10) + 10,
    defense: (player.defense ?? 10) + 10,
    maxLife: (player.maxLife ?? 100) + 75,
    life: (player.maxLife ?? 100) + 75,
    skillPoints: (player.skillPoints ?? 0) + 1,
    highestLevel: Math.max(player.highestLevel ?? 0, (player.level ?? 1) + 1),
  };
}

// ===== GTA CAR THEFT (cars show in garage) =====
export const gtaCarTheft = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    const baseRate = 0.75;
    const levelBonus = Math.min(0.20, ((player.level ?? 1) * 0.004));
    const successRate = Math.min(0.95, baseRate + levelBonus);
    const succeeded = Math.random() < successRate;

    // Realistic car names, values, and stats
        const carData = [
      // Economy ($5K-$20K)
      { name: "2018 Nissan Versa", type: "economy", speed: 35, storage: 20, price: 5000, armored: false },
      { name: "2019 Chevrolet Spark", type: "economy", speed: 32, storage: 18, price: 4500, armored: false },
      { name: "2020 Mitsubishi Mirage", type: "economy", speed: 34, storage: 17, price: 5500, armored: false },
      { name: "2018 Kia Rio", type: "economy", speed: 38, storage: 19, price: 6000, armored: false },
      { name: "2019 Hyundai Accent", type: "economy", speed: 37, storage: 18, price: 5800, armored: false },
      { name: "2020 Toyota Yaris", type: "economy", speed: 36, storage: 16, price: 7000, armored: false },
      { name: "2019 Honda Fit", type: "economy", speed: 39, storage: 22, price: 8000, armored: false },
      { name: "2020 Ford Fiesta", type: "economy", speed: 40, storage: 17, price: 7500, armored: false },
      { name: "2018 Fiat 500", type: "economy", speed: 38, storage: 12, price: 9000, armored: false },
      { name: "2021 Smart ForTwo", type: "economy", speed: 30, storage: 8, price: 6500, armored: false },
      { name: "2019 Volkswagen Polo", type: "economy", speed: 42, storage: 18, price: 8500, armored: false },
      { name: "2020 Peugeot 208", type: "economy", speed: 41, storage: 17, price: 7800, armored: false },
      { name: "2018 Renault Clio", type: "economy", speed: 40, storage: 16, price: 7200, armored: false },
      { name: "2019 Opel Corsa", type: "economy", speed: 39, storage: 17, price: 7400, armored: false },
      { name: "2020 Suzuki Swift", type: "economy", speed: 43, storage: 18, price: 8200, armored: false },
      // Compact ($10K-$30K)
      { name: "2019 Honda Civic", type: "compact", speed: 55, storage: 25, price: 18000, armored: false },
      { name: "2020 Toyota Corolla", type: "compact", speed: 52, storage: 24, price: 20000, armored: false },
      { name: "2021 Hyundai Elantra", type: "compact", speed: 54, storage: 23, price: 19500, armored: false },
      { name: "2020 Mazda 3", type: "compact", speed: 56, storage: 22, price: 22000, armored: false },
      { name: "2021 Subaru Impreza", type: "compact", speed: 53, storage: 23, price: 21000, armored: false },
      { name: "2019 Kia Forte", type: "compact", speed: 51, storage: 24, price: 17500, armored: false },
      { name: "2020 Nissan Sentra", type: "compact", speed: 52, storage: 23, price: 19000, armored: false },
      { name: "2021 Volkswagen Jetta", type: "compact", speed: 55, storage: 22, price: 23000, armored: false },
      { name: "2020 Ford Focus", type: "compact", speed: 54, storage: 21, price: 18500, armored: false },
      { name: "2019 Chevrolet Cruze", type: "compact", speed: 50, storage: 22, price: 16500, armored: false },
      { name: "2021 Toyota Prius", type: "compact", speed: 48, storage: 20, price: 25000, armored: false },
      { name: "2020 Honda Insight", type: "compact", speed: 50, storage: 21, price: 24000, armored: false },
      { name: "2021 Hyundai Ioniq", type: "compact", speed: 49, storage: 20, price: 24500, armored: false },
      { name: "2020 Kia Niro", type: "compact", speed: 48, storage: 24, price: 26000, armored: false },
      { name: "2019 Dodge Dart", type: "compact", speed: 52, storage: 22, price: 16000, armored: false },
      // Sedan ($20K-$50K)
      { name: "2020 Toyota Camry", type: "sedan", speed: 58, storage: 28, price: 25000, armored: false },
      { name: "2021 Honda Accord", type: "sedan", speed: 60, storage: 27, price: 28000, armored: false },
      { name: "2020 Nissan Altima", type: "sedan", speed: 57, storage: 26, price: 24000, armored: false },
      { name: "2021 Hyundai Sonata", type: "sedan", speed: 59, storage: 27, price: 26000, armored: false },
      { name: "2020 Subaru Legacy", type: "sedan", speed: 55, storage: 28, price: 27000, armored: false },
      { name: "2021 Volkswagen Passat", type: "sedan", speed: 58, storage: 26, price: 27500, armored: false },
      { name: "2020 Chevrolet Malibu", type: "sedan", speed: 56, storage: 25, price: 23000, armored: false },
      { name: "2019 Ford Fusion", type: "sedan", speed: 55, storage: 25, price: 22000, armored: false },
      { name: "2021 Mazda 6", type: "sedan", speed: 59, storage: 24, price: 28500, armored: false },
      { name: "2020 Chrysler 300", type: "sedan", speed: 62, storage: 22, price: 32000, armored: false },
      { name: "2021 Dodge Charger", type: "sedan", speed: 68, storage: 22, price: 35000, armored: false },
      { name: "2020 Toyota Avalon", type: "sedan", speed: 57, storage: 24, price: 33000, armored: false },
      { name: "2021 Nissan Maxima", type: "sedan", speed: 60, storage: 23, price: 34000, armored: false },
      { name: "2020 Buick Regal", type: "sedan", speed: 58, storage: 23, price: 31000, armored: false },
      { name: "2019 Chevrolet Impala", type: "sedan", speed: 56, storage: 25, price: 29000, armored: false },
      // Sport ($35K-$80K)
      { name: "2020 BMW 3 Series", type: "sport", speed: 72, storage: 20, price: 45000, armored: false },
      { name: "2021 Mercedes C-Class", type: "sport", speed: 75, storage: 18, price: 55000, armored: false },
      { name: "2020 Audi A4", type: "sport", speed: 73, storage: 19, price: 48000, armored: false },
      { name: "2021 Lexus IS", type: "sport", speed: 70, storage: 18, price: 42000, armored: false },
      { name: "2020 Genesis G70", type: "sport", speed: 74, storage: 17, price: 44000, armored: false },
      { name: "2021 Alfa Romeo Giulia", type: "sport", speed: 76, storage: 16, price: 50000, armored: false },
      { name: "2020 Jaguar XE", type: "sport", speed: 71, storage: 17, price: 46000, armored: false },
      { name: "2021 Volvo S60", type: "sport", speed: 68, storage: 19, price: 43000, armored: false },
      { name: "2020 Cadillac CT4", type: "sport", speed: 72, storage: 18, price: 47000, armored: false },
      { name: "2021 BMW 4 Series", type: "sport", speed: 76, storage: 16, price: 52000, armored: false },
      { name: "2020 Mercedes CLA", type: "sport", speed: 74, storage: 15, price: 40000, armored: false },
      { name: "2021 Audi A5", type: "sport", speed: 75, storage: 16, price: 51000, armored: false },
      { name: "2020 Lexus RC", type: "sport", speed: 73, storage: 15, price: 45000, armored: false },
      { name: "2021 Genesis G80", type: "sport", speed: 70, storage: 20, price: 53000, armored: false },
      { name: "2020 BMW M340i", type: "sport", speed: 78, storage: 17, price: 58000, armored: false },
      // Luxury ($50K-$150K)
      { name: "2021 BMW 5 Series", type: "luxury", speed: 74, storage: 20, price: 62000, armored: false },
      { name: "2020 Mercedes E-Class", type: "luxury", speed: 76, storage: 19, price: 68000, armored: false },
      { name: "2021 Audi A6", type: "luxury", speed: 78, storage: 22, price: 62000, armored: false },
      { name: "2020 Lexus ES", type: "luxury", speed: 68, storage: 22, price: 55000, armored: false },
      { name: "2021 Volvo S90", type: "luxury", speed: 67, storage: 21, price: 58000, armored: false },
      { name: "2020 Genesis G90", type: "luxury", speed: 69, storage: 23, price: 70000, armored: false },
      { name: "2021 Cadillac CT5", type: "luxury", speed: 72, storage: 19, price: 52000, armored: false },
      { name: "2020 Lincoln Continental", type: "luxury", speed: 65, storage: 22, price: 60000, armored: false },
      { name: "2021 BMW 7 Series", type: "luxury", speed: 76, storage: 20, price: 95000, armored: false },
      { name: "2020 Mercedes S-Class", type: "luxury", speed: 78, storage: 21, price: 110000, armored: false },
      { name: "2021 Audi A8", type: "luxury", speed: 77, storage: 21, price: 90000, armored: false },
      { name: "2020 Lexus LS", type: "luxury", speed: 72, storage: 23, price: 80000, armored: false },
      { name: "2021 Maserati Ghibli", type: "luxury", speed: 80, storage: 17, price: 85000, armored: false },
      { name: "2020 Jaguar XF", type: "luxury", speed: 74, storage: 18, price: 65000, armored: false },
      { name: "2021 BMW X5", type: "luxury", speed: 70, storage: 40, price: 75000, armored: false },
      // SUV ($60K-$200K)
      { name: "2021 Porsche Cayenne", type: "suv", speed: 78, storage: 30, price: 95000, armored: false },
      { name: "2020 Range Rover Sport", type: "suv", speed: 68, storage: 35, price: 85000, armored: false },
      { name: "2021 Mercedes GLE", type: "suv", speed: 72, storage: 38, price: 78000, armored: false },
      { name: "2020 BMW X7", type: "suv", speed: 68, storage: 45, price: 88000, armored: false },
      { name: "2021 Audi Q7", type: "suv", speed: 70, storage: 42, price: 72000, armored: false },
      { name: "2020 Lexus RX", type: "suv", speed: 65, storage: 38, price: 58000, armored: false },
      { name: "2021 Volvo XC90", type: "suv", speed: 66, storage: 40, price: 62000, armored: false },
      { name: "2020 Lincoln Aviator", type: "suv", speed: 67, storage: 38, price: 65000, armored: false },
      { name: "2021 Cadillac Escalade", type: "suv", speed: 60, storage: 55, price: 110000, armored: false },
      { name: "2022 Range Rover", type: "suv", speed: 70, storage: 48, price: 130000, armored: false },
      { name: "2021 Mercedes GLS", type: "suv", speed: 68, storage: 45, price: 95000, armored: false },
      { name: "2020 Porsche Macan", type: "suv", speed: 75, storage: 28, price: 68000, armored: false },
      { name: "2021 BMW X6", type: "suv", speed: 73, storage: 32, price: 82000, armored: false },
      { name: "2020 Mercedes G-Wagon", type: "suv", speed: 72, storage: 35, price: 180000, armored: true },
      { name: "2021 Jeep Grand Cherokee", type: "suv", speed: 64, storage: 40, price: 55000, armored: false },
      // Electric ($50K-$200K)
      { name: "2021 Tesla Model 3", type: "electric", speed: 78, storage: 22, price: 50000, armored: false },
      { name: "2022 Tesla Model S", type: "electric", speed: 85, storage: 24, price: 85000, armored: false },
      { name: "2021 Tesla Model X", type: "electric", speed: 80, storage: 35, price: 110000, armored: false },
      { name: "2022 Porsche Taycan", type: "electric", speed: 88, storage: 18, price: 90000, armored: false },
      { name: "2021 Audi e-tron", type: "electric", speed: 72, storage: 35, price: 75000, armored: false },
      { name: "2022 Mercedes EQS", type: "electric", speed: 82, storage: 28, price: 105000, armored: false },
      { name: "2021 BMW iX", type: "electric", speed: 76, storage: 32, price: 85000, armored: false },
      { name: "2022 Ford Mustang Mach-E", type: "electric", speed: 80, storage: 30, price: 55000, armored: false },
      { name: "2021 Rivian R1T", type: "electric", speed: 72, storage: 50, price: 75000, armored: false },
      { name: "2022 Lucid Air", type: "electric", speed: 92, storage: 20, price: 140000, armored: false },
      { name: "2021 Polestar 2", type: "electric", speed: 74, storage: 20, price: 52000, armored: false },
      { name: "2022 BMW i4", type: "electric", speed: 80, storage: 22, price: 60000, armored: false },
      { name: "2021 Mercedes EQC", type: "electric", speed: 75, storage: 30, price: 70000, armored: false },
      { name: "2022 Audi Q4 e-tron", type: "electric", speed: 72, storage: 28, price: 55000, armored: false },
      { name: "2021 Jaguar I-PACE", type: "electric", speed: 78, storage: 28, price: 80000, armored: false },
      // Muscle ($30K-$80K)
      { name: "2021 Ford Mustang GT", type: "muscle", speed: 78, storage: 15, price: 55000, armored: false },
      { name: "2020 Dodge Challenger", type: "muscle", speed: 75, storage: 16, price: 35000, armored: false },
      { name: "2021 Chevrolet Camaro", type: "muscle", speed: 77, storage: 14, price: 42000, armored: false },
      { name: "2020 Dodge Charger R/T", type: "muscle", speed: 72, storage: 18, price: 38000, armored: false },
      { name: "2021 Ford Mustang Mach 1", type: "muscle", speed: 82, storage: 13, price: 58000, armored: false },
      { name: "2020 Chevrolet Corvette", type: "muscle", speed: 90, storage: 12, price: 68000, armored: false },
      { name: "2021 Dodge Challenger SRT", type: "muscle", speed: 85, storage: 15, price: 72000, armored: false },
      { name: "2020 Chevrolet Camaro ZL1", type: "muscle", speed: 88, storage: 12, price: 75000, armored: false },
      { name: "2021 Ford Mustang Shelby", type: "muscle", speed: 92, storage: 12, price: 80000, armored: false },
      { name: "2020 Dodge Charger Hellcat", type: "muscle", speed: 82, storage: 18, price: 75000, armored: false },
      { name: "2021 Chevrolet Corvette Z06", type: "muscle", speed: 95, storage: 10, price: 78000, armored: false },
      { name: "2020 Ford Mustang Boss 302", type: "muscle", speed: 80, storage: 14, price: 52000, armored: false },
      { name: "2021 Dodge Viper", type: "muscle", speed: 94, storage: 8, price: 95000, armored: false },
      { name: "2020 Chevrolet Nova SS", type: "muscle", speed: 76, storage: 14, price: 48000, armored: false },
      { name: "2021 Pontiac GTO", type: "muscle", speed: 78, storage: 15, price: 50000, armored: false },
      // Truck ($30K-$80K)
      { name: "2021 Ford F-150", type: "truck", speed: 52, storage: 45, price: 38000, armored: false },
      { name: "2020 Chevrolet Silverado", type: "truck", speed: 50, storage: 48, price: 40000, armored: false },
      { name: "2021 Ram 1500", type: "truck", speed: 51, storage: 46, price: 42000, armored: false },
      { name: "2020 Toyota Tacoma", type: "truck", speed: 48, storage: 38, price: 35000, armored: false },
      { name: "2021 GMC Sierra", type: "truck", speed: 50, storage: 47, price: 43000, armored: false },
      { name: "2020 Nissan Titan", type: "truck", speed: 49, storage: 44, price: 38000, armored: false },
      { name: "2021 Chevrolet Colorado", type: "truck", speed: 47, storage: 36, price: 32000, armored: false },
      { name: "2020 Ford Ranger", type: "truck", speed: 46, storage: 34, price: 30000, armored: false },
      { name: "2021 Jeep Gladiator", type: "truck", speed: 48, storage: 35, price: 36000, armored: false },
      { name: "2020 Toyota Tundra", type: "truck", speed: 50, storage: 50, price: 45000, armored: false },
      { name: "2021 Ram 1500 TRX", type: "truck", speed: 62, storage: 40, price: 85000, armored: false },
      { name: "2020 Ford F-150 Raptor", type: "truck", speed: 58, storage: 42, price: 70000, armored: false },
      { name: "2021 Chevrolet Silverado ZR2", type: "truck", speed: 56, storage: 44, price: 65000, armored: false },
      { name: "2020 GMC Hummer EV", type: "truck", speed: 60, storage: 48, price: 80000, armored: true },
      { name: "2021 Tesla Cybertruck", type: "truck", speed: 65, storage: 60, price: 120000, armored: true },
      // Supercar ($100K-$500K)
      { name: "2022 BMW M5", type: "supercar", speed: 88, storage: 16, price: 110000, armored: false },
      { name: "2021 Mercedes-AMG GT", type: "supercar", speed: 94, storage: 8, price: 185000, armored: false },
      { name: "2022 Porsche 911 Carrera", type: "supercar", speed: 92, storage: 10, price: 120000, armored: false },
      { name: "2021 Audi R8", type: "supercar", speed: 96, storage: 8, price: 180000, armored: false },
      { name: "2022 Maserati MC20", type: "supercar", speed: 96, storage: 6, price: 240000, armored: false },
      { name: "2022 Bentley Continental GT", type: "supercar", speed: 82, storage: 14, price: 245000, armored: false },
      { name: "2021 Aston Martin DB11", type: "supercar", speed: 90, storage: 10, price: 215000, armored: false },
      { name: "2023 Porsche Taycan Turbo S", type: "supercar", speed: 93, storage: 15, price: 195000, armored: false },
      { name: "2021 Lexus LC 500", type: "supercar", speed: 80, storage: 16, price: 95000, armored: false },
      { name: "2022 Ferrari Roma", type: "supercar", speed: 96, storage: 8, price: 280000, armored: false },
      { name: "2023 Lamborghini Urus Performante", type: "supercar", speed: 92, storage: 20, price: 265000, armored: false },
      { name: "2021 Aston Martin DBX707", type: "supercar", speed: 88, storage: 28, price: 245000, armored: false },
      { name: "2022 Ferrari 296 GTB", type: "supercar", speed: 99, storage: 5, price: 350000, armored: false },
      { name: "2021 Lamborghini Huracan", type: "supercar", speed: 98, storage: 6, price: 250000, armored: false },
      { name: "2022 Ferrari F8 Tributo", type: "supercar", speed: 99, storage: 5, price: 320000, armored: false },
      { name: "2021 McLaren 720S", type: "supercar", speed: 97, storage: 5, price: 310000, armored: false },
      { name: "2022 McLaren Artura", type: "supercar", speed: 95, storage: 6, price: 235000, armored: false },
      { name: "2021 Bentley Flying Spur", type: "supercar", speed: 78, storage: 22, price: 220000, armored: false },
      { name: "2022 Rolls-Royce Ghost", type: "supercar", speed: 70, storage: 30, price: 350000, armored: false },
      { name: "2021 Rolls-Royce Wraith", type: "supercar", speed: 72, storage: 20, price: 380000, armored: false },
      // Ultra Luxury ($200K-$800K)
      { name: "2022 Rolls-Royce Phantom", type: "ultra", speed: 68, storage: 32, price: 450000, armored: false },
      { name: "2021 Rolls-Royce Cullinan", type: "ultra", speed: 66, storage: 40, price: 380000, armored: false },
      { name: "2022 Bentley Bentayga", type: "ultra", speed: 74, storage: 35, price: 250000, armored: false },
      { name: "2021 Mercedes-Maybach S580", type: "ultra", speed: 72, storage: 20, price: 285000, armored: false },
      { name: "2022 Bentley Mulsanne", type: "ultra", speed: 70, storage: 22, price: 350000, armored: false },
      { name: "2021 Rolls-Royce Dawn", type: "ultra", speed: 72, storage: 18, price: 420000, armored: false },
      { name: "2022 Bugatti Chiron", type: "ultra", speed: 100, storage: 4, price: 500000, armored: false },
      { name: "2021 Pagani Huayra", type: "ultra", speed: 100, storage: 3, price: 600000, armored: false },
      { name: "2022 Ferrari SF90", type: "ultra", speed: 100, storage: 5, price: 420000, armored: false },
      { name: "2021 Lamborghini Aventador", type: "ultra", speed: 99, storage: 5, price: 400000, armored: false },
      { name: "2022 McLaren Speedtail", type: "ultra", speed: 100, storage: 4, price: 450000, armored: false },
      { name: "2021 Aston Martin Valkyrie", type: "ultra", speed: 100, storage: 3, price: 650000, armored: false },
      { name: "2022 Ferrari LaFerrari", type: "ultra", speed: 100, storage: 3, price: 550000, armored: false },
      { name: "2021 McLaren P1", type: "ultra", speed: 100, storage: 3, price: 600000, armored: false },
      { name: "2022 Porsche 918 Spyder", type: "ultra", speed: 99, storage: 4, price: 500000, armored: false },
      // Hypercar ($1M-$10M)
      { name: "2023 Mercedes-AMG One", type: "hypercar", speed: 100, storage: 4, price: 2750000, armored: false },
      { name: "2021 Koenigsegg Jesko", type: "hypercar", speed: 100, storage: 3, price: 3000000, armored: false },
      { name: "2022 Rimac Nevera", type: "hypercar", speed: 100, storage: 5, price: 2200000, armored: false },
      { name: "2023 Pagani Huayra R", type: "hypercar", speed: 100, storage: 3, price: 3500000, armored: false },
      { name: "2022 Gordon Murray T.50", type: "hypercar", speed: 100, storage: 3, price: 3000000, armored: false },
      { name: "2021 Zenvo TSR-S", type: "hypercar", speed: 100, storage: 4, price: 1800000, armored: false },
      { name: "2022 Bugatti Divo", type: "hypercar", speed: 100, storage: 3, price: 5800000, armored: false },
      { name: "2023 Bugatti Mistral", type: "hypercar", speed: 100, storage: 3, price: 5000000, armored: false },
      { name: "2021 Koenigsegg Gemera", type: "hypercar", speed: 100, storage: 6, price: 1700000, armored: false },
      { name: "2022 Bugatti Bolide", type: "hypercar", speed: 100, storage: 2, price: 4700000, armored: false },
      { name: "2021 Aston Martin Valkyrie AMR Pro", type: "hypercar", speed: 100, storage: 2, price: 3500000, armored: false },
      { name: "2023 Pagani Utopia", type: "hypercar", speed: 100, storage: 3, price: 2500000, armored: false },
      { name: "2022 Ferrari Daytona SP3", type: "hypercar", speed: 100, storage: 3, price: 2200000, armored: false },
      { name: "2021 McLaren Solus GT", type: "hypercar", speed: 100, storage: 2, price: 3600000, armored: false },
      { name: "2023 Lamborghini Countach LPI 800", type: "hypercar", speed: 100, storage: 4, price: 2600000, armored: false },
      // Legendary ($10M+)
      { name: "2020 Bugatti Chiron Super Sport", type: "legendary", speed: 100, storage: 4, price: 10000000, armored: false },
      { name: "2021 Bugatti Centodieci", type: "legendary", speed: 100, storage: 3, price: 12000000, armored: false },
      { name: "2022 Ferrari Monza SP2", type: "legendary", speed: 100, storage: 2, price: 18000000, armored: false },
      { name: "2021 Rolls-Royce Boat Tail", type: "legendary", speed: 70, storage: 25, price: 30000000, armored: false },
      { name: "2023 Bugatti Tourbillon", type: "legendary", speed: 100, storage: 3, price: 40000000, armored: false },
      { name: "2020 Koenigsegg Jesko Absolut", type: "legendary", speed: 100, storage: 3, price: 15000000, armored: false },
      { name: "2022 Lamborghini Invencible", type: "legendary", speed: 100, storage: 3, price: 11000000, armored: false },
      { name: "2021 Pagani Codalunga", type: "legendary", speed: 100, storage: 3, price: 14000000, armored: false },
      { name: "2023 Bugatti Chiron Profilée", type: "legendary", speed: 100, storage: 3, price: 12000000, armored: false },
      { name: "2020 Ferrari LaFerrari Aperta", type: "legendary", speed: 100, storage: 2, price: 16000000, armored: false },
      { name: "2021 McLaren Elva", type: "legendary", speed: 100, storage: 2, price: 17000000, armored: false },
      { name: "2022 Pininfarina Battista", type: "legendary", speed: 100, storage: 4, price: 2500000, armored: false },
      { name: "2023 Lotus Evija", type: "legendary", speed: 100, storage: 3, price: 2100000, armored: false },
      { name: "2021 GMA T.50s Niki Lauda", type: "legendary", speed: 100, storage: 2, price: 5000000, armored: false },
      { name: "2022 De Tomaso Pantera", type: "legendary", speed: 98, storage: 4, price: 3200000, armored: false },
      // Armored ($500K-$5M)
      { name: "2021 armored BMW 7 Series", type: "armored", speed: 68, storage: 22, price: 500000, armored: true },
      { name: "2022 armored Mercedes S-Class", type: "armored", speed: 70, storage: 20, price: 600000, armored: true },
      { name: "2021 armored Range Rover", type: "armored", speed: 65, storage: 38, price: 550000, armored: true },
      { name: "2022 armored Cadillac Escalade", type: "armored", speed: 58, storage: 50, price: 650000, armored: true },
      { name: "2021 armored Audi A8", type: "armored", speed: 72, storage: 21, price: 480000, armored: true },
      { name: "2022 armored Tesla Model S", type: "armored", speed: 80, storage: 24, price: 750000, armored: true },
      { name: "2021 armored BMW X5", type: "armored", speed: 68, storage: 35, price: 520000, armored: true },
      { name: "2022 armored Mercedes G-Wagon 4x4", type: "armored", speed: 72, storage: 30, price: 850000, armored: true },
      { name: "2021 armored Lexus LX", type: "armored", speed: 60, storage: 45, price: 450000, armored: true },
      { name: "2022 armored Ford F-550", type: "armored", speed: 50, storage: 55, price: 400000, armored: true },
      // Vintage ($50K-$500K)
      { name: "1967 Ford Mustang", type: "vintage", speed: 60, storage: 14, price: 150000, armored: false },
      { name: "1969 Chevrolet Camaro", type: "vintage", speed: 62, storage: 12, price: 120000, armored: false },
      { name: "1970 Dodge Challenger", type: "vintage", speed: 58, storage: 14, price: 100000, armored: false },
      { name: "1963 Chevrolet Corvette Stingray", type: "vintage", speed: 65, storage: 10, price: 180000, armored: false },
      { name: "1961 Jaguar E-Type", type: "vintage", speed: 68, storage: 8, price: 250000, armored: false },
      { name: "1957 Mercedes-Benz 300SL", type: "vintage", speed: 70, storage: 8, price: 350000, armored: false },
      { name: "1969 Ferrari 288 GTO", type: "vintage", speed: 85, storage: 6, price: 400000, armored: false },
      { name: "1962 Ferrari 250 GTO", type: "vintage", speed: 80, storage: 5, price: 500000, armored: false },
      { name: "1955 Mercedes-Benz 300 SLR", type: "vintage", speed: 75, storage: 6, price: 380000, armored: false },
      { name: "1970 Plymouth Hemi Cuda", type: "vintage", speed: 62, storage: 12, price: 200000, armored: false },
      { name: "1967 Shelby GT500", type: "vintage", speed: 66, storage: 12, price: 180000, armored: false },
      { name: "1966 Ford GT40", type: "vintage", speed: 88, storage: 4, price: 450000, armored: false },
      { name: "1957 Chevrolet Bel Air", type: "vintage", speed: 50, storage: 16, price: 80000, armored: false },
      { name: "1969 Pontiac GTO Judge", type: "vintage", speed: 60, storage: 14, price: 130000, armored: false },
      { name: "1973 Porsche 911 Carrera RS", type: "vintage", speed: 72, storage: 8, price: 280000, armored: false },
      // Rally ($30K-$200K)
      { name: "2020 Subaru WRX STI", type: "rally", speed: 72, storage: 16, price: 40000, armored: false },
      { name: "2021 Mitsubishi Lancer Evo", type: "rally", speed: 75, storage: 14, price: 45000, armored: false },
      { name: "2020 Ford Focus RS", type: "rally", speed: 73, storage: 14, price: 42000, armored: false },
      { name: "2021 Volkswagen Golf R", type: "rally", speed: 72, storage: 16, price: 43000, armored: false },
      { name: "2020 Hyundai i30 N", type: "rally", speed: 70, storage: 15, price: 35000, armored: false },
      { name: "2021 Toyota GR Yaris", type: "rally", speed: 74, storage: 12, price: 38000, armored: false },
      { name: "2020 Peugeot 208 Rallye", type: "rally", speed: 68, storage: 12, price: 30000, armored: false },
      { name: "2021 Citroen C3 WRC", type: "rally", speed: 76, storage: 10, price: 55000, armored: false },
      { name: "2020 Ford Fiesta WRC", type: "rally", speed: 78, storage: 10, price: 60000, armored: false },
      { name: "2021 Toyota GR Corolla", type: "rally", speed: 72, storage: 14, price: 40000, armored: false },
      { name: "2020 Mini Cooper JCW", type: "rally", speed: 68, storage: 12, price: 36000, armored: false },
      { name: "2021 BMW M2 Competition", type: "rally", speed: 78, storage: 12, price: 58000, armored: false },
      { name: "2020 Audi RS3 Sportback", type: "rally", speed: 80, storage: 14, price: 62000, armored: false },
      { name: "2021 Mercedes-AMG A45", type: "rally", speed: 82, storage: 14, price: 55000, armored: false },
      { name: "2020 Honda Civic Type R", type: "rally", speed: 76, storage: 14, price: 45000, armored: false },
    ];
    const carNames = carData.map(c => c.name);
    const carSpeeds = carData.map(c => c.speed);
    const carStorages = carData.map(c => c.storage);
    const carPrices = carData.map(c => c.price);

    let vehicleId = null;
    let moneyEarned = 0;
    let damageTaken = 0;
    let arrested = false;

    if (succeeded) {
      // 10% ULTRA RARE gold/orange neon ($100M-$1B), 25% regular neon ($50M-$500M)
      const roll = Math.random();
      let idx: number;
      let isNeonCar = false;
      let isUltraNeon = false;
      if (roll < 0.10) {
        // ULTRA RARE gold/orange neon
        idx = Math.floor(Math.random() * carNames.length);
        isUltraNeon = true;
        isNeonCar = true;
      } else if (roll < 0.35) {
        // Regular neon
        idx = Math.floor(Math.random() * carNames.length);
        isNeonCar = true;
      } else {
        idx = Math.floor(Math.random() * carNames.length);
      }
      vehicleId = await ctx.db.insert("vehicles", {
        userId: userId,
        name: carNames[idx],
        type: carData[idx].type,
        speed: carSpeeds[idx],
        storage: carStorages[idx],
        armored: carData[idx].armored,
        stolen: true,
        purchasePrice: carPrices[idx],
      });
      moneyEarned = isUltraNeon ? Math.floor(carPrices[idx] * (2000 + Math.floor(Math.random() * 8000))) : isNeonCar ? Math.floor(carPrices[idx] * (100 + Math.floor(Math.random() * 400))) : carPrices[idx];
    } else {
      damageTaken = Math.floor(Math.random() * 20 + 5);
      arrested = Math.random() > 0.25;
    }

    const newLife = Math.max(0, (player.life ?? 100) - damageTaken);
        // XP scales with car price + level multiplier
    const levelMult = 1 + ((player.level ?? 1) * 0.05); // +5% per level
    const valueXp = succeeded ? Math.max(20, Math.floor(moneyEarned / 1000)) : 4; // $1 per 1000 value, min 20
    const xpEarned = Math.floor(valueXp * 11.0 * levelMult);

    await ctx.db.patch(userId, {
      money: Math.max(0, (player.money ?? 0) + moneyEarned),
      life: newLife,
      totalCrimes: (player.totalCrimes ?? 0) + 1,
      ...(await addXpAndCheckLevel(ctx, player, xpEarned)),
      inPrison: arrested,
      prisonTime: arrested ? 15000 : (player.prisonTime ?? 0),
      wantedLevel: arrested ? 0 : Math.min(20, (player.wantedLevel ?? 0) + (succeeded ? 2 : 0)),
      lastCrimeAt: Date.now(), crimeMomentum: Math.min(100, (player.crimeMomentum ?? 0) + 4),
    });

    return { success: succeeded, vehicleId, moneyEarned, damageTaken, arrested, xpEarned };
  },
});

// ===== BODYGUARD SYSTEM =====
export const getBodyguardInfo = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player) return null;
    const bodyguards = await ctx.db
      .query("bodyguards")
      .withIndex("by_employer", (q) => q.eq("employerId", player._id))
      .collect();
    return {
      active: bodyguards.filter((b: any) => b.active),
      bodyguardCount: bodyguards.filter((b: any) => b.active).length,
    };
  },
});

export const buyBodyguard = mutation({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");

    const costs: Record<number, number> = {
      1: 0, // free
      2: 10000000,
      3: 35000000,
      4: 95000000,
      5: 125000000,
    };

    // Check current bodyguard count
    const existing = await ctx.db
      .query("bodyguards")
      .withIndex("by_employer", (q) => q.eq("employerId", player._id))
      .collect();
    const activeCount = existing.filter((b: any) => b.active).length;

    if (args.count <= activeCount) throw new Error("Already have that many bodyguards!");
    if (args.count > 5) throw new Error("Max 5 bodyguards!");

    // Check if died - half price for new account
    const died = (player.totalDeaths ?? 0) > 0;
    const cost = died ? Math.floor((costs[args.count] ?? 0) / 2) : (costs[args.count] ?? 0);

    if ((player.money ?? 0) < cost) throw new Error(`Need $${cost.toLocaleString()}!`);
    if (args.count !== activeCount + 1) throw new Error(`Must buy one at a time! Next: bodyguard #${activeCount + 1}`);

    await ctx.db.patch(player._id, { money: (player.money ?? 0) - cost });
    await ctx.db.insert("bodyguards", {
      employerId: player._id,
      guardId: player._id, // NPC guard, use employer as placeholder
      payPerDay: 0,
      active: true,
      hiredAt: Date.now(),
    });

    return { success: true, newCount: activeCount + 1, cost };
  },
});

// ===== SELL INVENTORY/GARAGE SPACE =====
export const sellCapacity = mutation({
  args: { type: v.union(v.literal("inventory"), v.literal("garage")), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    const price = Math.min(500000, args.amount * 5000);
    await ctx.db.patch(player._id, { money: (player.money ?? 0) + price });
    return { price };
  },
});

// ===== PRESTIGE SYSTEM =====
export const prestige = mutation({
  args: {},
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player) throw new Error("Not authenticated");
    if ((player.level ?? 1) < 50) throw new Error("Need level 50 to prestige!");

    const newPrestige = (player.prestige ?? 0) + 1;
    const multiplier = 1 + (newPrestige * 0.15);

    await ctx.db.patch(player._id, {
      prestige: newPrestige,
      prestigeMultiplier: multiplier,
      level: 1,
      experience: 0,
      skillPoints: (player.skillPoints ?? 0) + 10,
      money: (player.money ?? 0) + 1000000 * newPrestige,
    });

    return { prestige: newPrestige, multiplier, bonus: 1000000 * newPrestige };
  },
});

// ===== SECRET CHALLENGES =====
export const getSecretChallenges = query({
  args: {},
  handler: async (ctx) => {
    const challenges = [];
    const categories = [
      "Crime Streak", "Speed Run", "Survival", "Gambling", "Combat",
      "Exploration", "Economy", "Social", "Smuggling", "Heist",
      "Stealth", "Bounty", "Boss", "Daily", "Weekly",
    ];
    for (const cat of categories) {
      for (let i = 0; i < 50; i++) {
        const difficulty = Math.random() < 0.3 ? "legendary" : Math.random() < 0.5 ? "hard" : "medium";
        challenges.push({
          id: `sc_${cat.toLowerCase().replace(/\s/g, "_")}_${i}`,
          name: `${cat} Challenge #${i + 1}`,
          category: cat,
          difficulty,
          reward: difficulty === "legendary" ? 1000000 : difficulty === "hard" ? 500000 : 100000,
          xpReward: difficulty === "legendary" ? 500 : difficulty === "hard" ? 250 : 100,
          description: `Complete a ${difficulty} ${cat.toLowerCase()} challenge`,
        });
      }
    }
    return challenges;
  },
});

// ===== BOOST SYSTEM =====
export const getBoostInfo = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const date = new Date(now);
    const day = date.getDay(); // 0=Sun, 1=Mon, etc.
    const hour = date.getHours();

    // Weekend boost: Fri 00:00 to Sun 00:00
    const isWeekendBoost = day === 5 || day === 6;
    const weekendBoostActive = isWeekendBoost;

    // Kill free zone: Mon-Wed 2 hours (let's say 20:00-22:00)
    const isKillFreeZone = (day >= 1 && day <= 3) && (hour >= 20 && hour < 22);

    // Golden hour: 1 hour each day (12:00-13:00)
    const isGoldenHour = hour === 12;

    // Next random event (every 30 min)
    const minutesSinceHour = date.getMinutes();
    const nextEventMinutes = 30 - (minutesSinceHour % 30);
    const nextEventAt = now + nextEventMinutes * 60 * 1000;

    return {
      weekendBoost: { active: weekendBoostActive, multiplier: 2.0, description: weekendBoostActive ? "🔥 WEEKEND BOOST ACTIVE! 2x rewards!" : `Next: Friday ${nextEventMinutes} min` },
      killFreeZone: { active: isKillFreeZone, description: isKillFreeZone ? "⚔️ KILL FREE ZONE! No PvP!" : "Next: Mon-Wed 20:00-22:00" },
      goldenHour: { active: isGoldenHour, multiplier: 3.0, description: isGoldenHour ? "✨ GOLDEN HOUR! 3x rewards!" : `Next in: ${nextEventMinutes} min` },
      nextRandomEventAt: nextEventAt,
      energyDrinkActive: false,
    };
  },
});

// ===== ADMIN FEATURES =====
export const adminGetAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") return [];
    return await ctx.db.query("users").collect();
  },
});

export const adminGiveMoney = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found");
    await ctx.db.patch(args.targetId, { money: (target.money ?? 0) + args.amount });
    return { success: true };
  },
});

export const adminResetMoney = mutation({
  args: { targetId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found");
    await ctx.db.patch(args.targetId, { money: args.amount });
    return { success: true };
  },
});

export const adminBan = mutation({
  args: { targetId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { isBanned: true, banReason: args.reason });
    return { success: true };
  },
});

export const adminUnban = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { isBanned: false, banReason: undefined });
    return { success: true };
  },
});

export const adminSetLevel = mutation({
  args: { targetId: v.id("users"), level: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { level: args.level, experience: 0 });
    return { success: true };
  },
});

export const adminKillPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { life: 0, isDead: true });
    return { success: true };
  },
});

export const adminHealPlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Player not found");
    await ctx.db.patch(args.targetId, { life: target.maxLife ?? 100, isDead: false });
    return { success: true };
  },
});

export const adminJailPlayer = mutation({
  args: { targetId: v.id("users"), seconds: v.number() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, { inPrison: true, prisonTime: args.seconds * 1000 });
    return { success: true };
  },
});

export const adminWipePlayer = mutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (!player || (player.role ?? "user") !== "admin") throw new Error("Admin only");
    await ctx.db.patch(args.targetId, {
      money: 0, bank: 0, points: 0, level: 1, experience: 0,
      totalCrimes: 0, totalFights: 0, totalKills: 0, totalDeaths: 0,
      wantedLevel: 0, reputation: 0, prestige: 0,
    });
    return { success: true };
  },
});

// ===== ADMIN: GET EVENTS =====
export const adminGetEvents = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return {
      active: [
        { id: "ev1", name: "Double XP Weekend", type: "boost", endsAt: now + 86400000, description: "2x XP on all actions" },
        { id: "ev2", name: "Arctic Cold Snap", type: "weather", endsAt: now + 43200000, description: "Smuggling profits +50%" },
      ],
      scheduled: [
        { id: "ev3", name: "Grand Heist Tournament", type: "competition", startsAt: now + 172800000, description: "Top heist crew wins $50M" },
        { id: "ev4", name: "Street Race Championship", type: "competition", startsAt: now + 259200000, description: "1v1 street racing tournament" },
      ],
    };
  },
});

// ===== RANDOM EVENTS =====
export const getRandomEvent = query({
  args: {},
  handler: async (ctx) => {
    const events = [
      { name: "Police Chase!", emoji: "🚔", description: "Police spotted nearby! +50% arrest chance for 5 min", duration: 5, type: "danger" },
      { name: "Lucky Find!", emoji: "🍀", description: "Found cash on the ground! +$10,000", duration: 2, type: "bonus" },
      { name: "Rival Gang Attack!", emoji: "⚔️", description: "Rivals spotted! Defense +20% for 10 min", duration: 10, type: "combat" },
      { name: "Informant Tip!", emoji: "🕵️", description: "Someone leaked info! Crime success +15% for 5 min", duration: 5, type: "crime" },
      { name: "Black Market Sale!", emoji: "🏷️", description: "Items 30% off in the black market!", duration: 15, type: "shop" },
      { name: "Full Moon!", emoji: "🌕", description: "All crime rewards x1.5 for 10 min", duration: 10, type: "bonus" },
      { name: "Power Outage!", emoji: "🔌", description: "City in darkness! Stealth crimes +25% for 8 min", duration: 8, type: "crime" },
      { name: "Gang War!", emoji: "💥", description: "Active gang warfare! Combat XP x2 for 5 min", duration: 5, type: "combat" },
      { name: "VIP Target!", emoji: "🎯", description: "High-value target spotted! Rob rewards x3 for 3 min", duration: 3, type: "bonus" },
      { name: "Customs Crackdown!", emoji: "🚧", description: "Border tightened! Smuggling risk +30% for 10 min", duration: 10, type: "danger" },
    ];
    const idx = Math.floor(Math.random() * events.length);
    return events[idx];
  },
});

// ===== WEEKEND BOOST CHECK (for criminal actions) =====
export const isWeekendBoostActive = query({
  args: {},
  handler: async () => {
    const day = new Date().getDay();
    return day === 5 || day === 6;
  },
});

// ===== KILL FREE ZONE CHECK =====
export const isKillFreeZoneActive = query({
  args: {},
  handler: async () => {
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    return (day >= 1 && day <= 3) && (hour >= 20 && hour < 22);
  },
});

// ===== GOLDEN HOUR CHECK =====
export const isGoldenHourActive = query({
  args: {},
  handler: async () => {
    const hour = new Date().getHours();
    return hour === 12;
  },
});


// ===== FBI / MILITARY POLICE SYSTEM =====
export const fbiRaid = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    const wanted = player.wantedLevel ?? 0;
    if (wanted < 5) throw new Error("FBI only investigates wanted criminals (level 5+)");

    // FBI raid chance scales with wanted level
    const raidChance = Math.min(0.95, 0.10 + (wanted * 0.05));
    const raided = Math.random() < raidChance;

    if (raided) {
      const damage = Math.floor(30 + wanted * 15);
      const moneyLoss = Math.floor((player.money ?? 0) * (0.05 + wanted * 0.03));
      const newLife = Math.max(0, (player.life ?? 100) - damage);
      const arrested = wanted >= 4 || Math.random() < 0.5;

      await ctx.db.patch(userId, {
        life: newLife,
        money: Math.max(0, (player.money ?? 0) - moneyLoss),
        wantedLevel: arrested ? 0 : Math.max(0, wanted - 1),
        inPrison: arrested,
        prisonTime: arrested ? 15000 : 0,
        lastCrimeAt: Date.now(),
      });

      // Log the raid
      await ctx.db.insert("crimes", {
        userId: player._id,
        type: "fbi_raid",
        target: "FBI",
        success: false,
        moneyEarned: 0,
        pointsEarned: 0,
        damageTaken: damage,
        timestamp: Date.now(),
      });

      return {
        raided: true,
        damage,
        moneyLoss,
        arrested,
        message: arrested
          ? `🚨 FBI RAID! ${damage} damage dealt, $${moneyLoss.toLocaleString()} seized, ARRESTED and sent to prison!`
          : `🚨 FBI RAID! ${damage} damage dealt, $${moneyLoss.toLocaleString()} seized! Wanted level reduced.`,
      };
    }

    // FBI didn't raid - wanted level still increases
    return {
      raided: false,
      message: "🕵️ The FBI is investigating but hasn't raided yet. Stay low.",
    };
  },
});

export const militaryPoliceResponse = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    const wanted = player.wantedLevel ?? 0;
    if (wanted < 12) throw new Error("Military responds to extreme threats only (wanted level 12+)");

    // Military is deadly - 80% raid chance at level 5
    const raidChance = Math.min(0.95, 0.20 + (wanted * 0.04));
    const raided = Math.random() < raidChance;

    if (raided) {
      const damage = Math.floor(60 + wanted * 20);
      const moneyLoss = Math.floor((player.money ?? 0) * (0.10 + wanted * 0.05));
      const newLife = Math.max(0, (player.life ?? 100) - damage);
      // Military always arrests
      const arrested = true;

      await ctx.db.patch(userId, {
        life: newLife,
        money: Math.max(0, (player.money ?? 0) - moneyLoss),
        wantedLevel: 0,
        inPrison: true,
        prisonTime: 15000,
        lastCrimeAt: Date.now(),
      });

      await ctx.db.insert("crimes", {
        userId: player._id,
        type: "military_response",
        target: "Military Police",
        success: false,
        moneyEarned: 0,
        pointsEarned: 0,
        damageTaken: damage,
        timestamp: Date.now(),
      });

      return {
        raided: true,
        damage,
        moneyLoss,
        arrested: true,
        message: `⚔️ MILITARY RESPONSE! ${damage} damage, $${moneyLoss.toLocaleString()} seized! Military always arrests. You're going to supermax.`,
      };
    }

    return {
      raided: false,
      message: "🎖️ The military mobilized but didn't reach you. You're on thin ice.",
    };
  },
});

export const bribeLawEnforcement = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");

    const wanted = player.wantedLevel ?? 0;
    const cost = args.amount;
    if ((player.money ?? 0) < cost) throw new Error("Not enough money");

    const bribeChance = Math.min(0.95, 0.3 + (cost / 100000) * 0.1 + (wanted * 0.05));

    if (Math.random() < bribeChance) {
      const newWanted = Math.max(0, wanted - 2);
      await ctx.db.patch(userId, {
        money: (player.money ?? 0) - cost,
        wantedLevel: newWanted,
      });
      return {
        success: true,
        message: `💰 Bribe accepted! Wanted level: ${wanted} → ${newWanted}. The evidence "disappeared".`,
      };
    }

    // Bribe failed - money lost, wanted level increases
    await ctx.db.patch(userId, {
      money: (player.money ?? 0) - cost,
      wantedLevel: Math.min(20, wanted + 1),
    });
    return {
      success: false,
      message: `❌ Bribe REJECTED! The officer was an undercover agent. Money lost, wanted level increased!`,
    };
  },
});

export const payBail = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("You're not in prison!");

    const bail = Math.floor(50000 + (player.wantedLevel ?? 0) * 100000);
    if ((player.money ?? 0) < bail) throw new Error(`Bail costs $${bail.toLocaleString()}. Not enough money.`);

    await ctx.db.patch(userId, {
      money: (player.money ?? 0) - bail,
      inPrison: false,
      prisonTime: 0,
      wantedLevel: Math.max(0, (player.wantedLevel ?? 0) - 1),
    });

    return {
      success: true,
      bail,
      message: `🏛️ Bail posted for $${bail.toLocaleString()}! You're free... for now.`,
    };
  },
});

export const clearWantedLevel = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");

    const wanted = player.wantedLevel ?? 0;
    if (wanted === 0) throw new Error("You're already clean!");

    // Cost: $200K per wanted level
    const cost = wanted * 200000;
    if ((player.money ?? 0) < cost) throw new Error(`Clearing costs $${cost.toLocaleString()}. Not enough money.`);

    await ctx.db.patch(userId, {
      money: (player.money ?? 0) - cost,
      wantedLevel: 0,
    });

    return {
      success: true,
      cost,
      message: `🧹 Record cleaned! Paid $${cost.toLocaleString()} to make it all go away.`,
    };
  },
});

export const getWantedStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const player = await ctx.db.query("users").withIndex("by_id", (q: any) => q.eq("_id", identity.subject as any)).first();
    if (!player) return null;

    const wanted = player.wantedLevel ?? 0;
    const threats = [];

    // Street Police — always active when wanted
    if (wanted >= 1) threats.push({ agency: "🚔 Street Police", level: "Patrol", severity: "low", message: "Local cops are on the lookout. Stay cool.", icon: "🚔" });

    // SWAT — tier 3+
    if (wanted >= 3) threats.push({ agency: "⚡ SWAT Team", level: "Deployed", severity: "low", message: "SWAT units mobilized for raids.", icon: "⚡" });

    // FBI — tier 5+
    if (wanted >= 5) threats.push({ agency: "🕵️ FBI", level: "Investigating", severity: "medium", message: "FBI is building a federal case. Raids incoming.", icon: "🕵️" });

    // FBI Manhunt — tier 8+
    if (wanted >= 8) threats.push({ agency: "🕵️‍♂️ FBI Manhunt", level: "ACTIVE SEARCH", severity: "high", message: "FBI has your photo on every bulletin board. Agents are searching block by block.", icon: "🕵️‍♂️" });

    // Military Police — tier 12+
    if (wanted >= 12) threats.push({ agency: "🎖️ Military Police", level: "Mobilized", severity: "high", message: "The military has been deployed. Lethal force authorized.", icon: "🎖️" });

    // Military Manhunt — tier 15+
    if (wanted >= 15) threats.push({ agency: "⚔️ Military Manhunt", level: "ACTIVE SEARCH", severity: "critical", message: "Armored vehicles. Helicopters. You are public enemy #1.", icon: "⚔️" });

    // National Guard — tier 18+
    if (wanted >= 18) threats.push({ agency: "🇺🇸 National Guard", level: "LOCKDOWN", severity: "critical", message: "The city is under martial law. Curfew enforced. Snipers on rooftops.", icon: "🇺🇸" });

    // Martial Law — tier 20
    if (wanted >= 20) threats.push({ agency: "☢️ MARSHAL LAW", level: "TOTAL WAR", severity: "critical", message: "Every agency on Earth is after you. This is the endgame.", icon: "☢️" });

    const nextRaidIn = wanted > 0 ? Math.floor(600 - (wanted * 30)) : 0;
    const bail = Math.floor(500000 + wanted * 250000);
    const bribeCost = Math.floor(500000 + wanted * 100000);
    const clearCost = wanted * 500000;
    const buyoutCost = Math.floor(2500000 + wanted * 7500000);

    // Which agency runs your prison block (if in prison)
    let prisonAgency = "🚔 Local Police";
    if (wanted >= 16) prisonAgency = "☢️ Military Supermax";
    else if (wanted >= 12) prisonAgency = "🎖️ Military Prison";
    else if (wanted >= 8) prisonAgency = "🕵️ FBI Black Site";
    else if (wanted >= 5) prisonAgency = "🕵️ FBI Holding";

    return {
      wantedLevel: wanted,
      threats,
      bail,
      bribeCost,
      clearCost,
      buyoutCost,
      prisonAgency,
      nextRaidIn: Math.max(30, nextRaidIn),
      isSafe: wanted === 0,
      riskLevel: wanted >= 15 ? "EXTREME" : wanted >= 10 ? "CRITICAL" : wanted >= 5 ? "HIGH" : wanted >= 2 ? "MODERATE" : wanted >= 1 ? "LOW" : "SAFE",
    };
  },
});

// ===== BUY OUT OF PRISON (Corrupt Warden) =====
export const buyOutOfPrison = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const player = await ctx.db.get(userId);
    if (!player) throw new Error("Player not found");
    if (!player.inPrison) throw new Error("You're not in prison!");

    const wanted = player.wantedLevel ?? 0;
    const cost = Math.floor(2500000 + wanted * 7500000);

    if ((player.money ?? 0) < cost) throw new Error(`Buy-out costs $${cost.toLocaleString()}. Not enough money.`);

    // Higher wanted = harder to buy out (less reliable)
    const successChance = Math.max(0.3, 0.95 - (wanted * 0.04));
    const succeeded = Math.random() < successChance;

    if (succeeded) {
      await ctx.db.patch(userId, {
        money: (player.money ?? 0) - cost,
        inPrison: false,
        prisonTime: 0,
        wantedLevel: Math.max(0, wanted - 2),
      });
      return {
        success: true,
        cost,
        message: `🔓 Corrupt warden accepted your payment of $${cost.toLocaleString()}! You're free. Wanted: ${wanted} → ${Math.max(0, wanted - 2)}`,
      };
    }

    // Failed buyout — money lost, sentence extended, wanted increases
    await ctx.db.patch(userId, {
      money: (player.money ?? 0) - cost,
      wantedLevel: Math.min(20, wanted + 2),
      prisonTime: (player.prisonTime ?? 15000) * 2,
    });
    return {
      success: false,
      cost,
      message: `❌ The warden took your money ($${cost.toLocaleString()}) and DOUBLE-CROSSED you! Your sentence doubled and wanted level increased. The FBI knows about your bribery attempt.`,
    };
  },
});
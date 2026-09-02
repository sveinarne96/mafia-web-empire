import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

/* ═══════════ MISSION CATEGORIES ═══════════ */
const CATEGORIES = [
  { id: "crimes", name: "Street Crimes", icon: "🔪", color: "red" },
  { id: "heists", name: "Heists & Robberies", icon: "🏦", color: "amber" },
  { id: "fraud", name: "Fraud & Scams", icon: "🎭", color: "purple" },
  { id: "drugs", name: "Drug Operations", icon: "💊", color: "green" },
  { id: "smuggling", name: "Smuggling", icon: "🚛", color: "cyan" },
  { id: "murder", name: "Assassinations", icon: "🗡️", color: "red" },
  { id: "combat", name: "Combat & PvP", icon: "⚔️", color: "orange" },
  { id: "gambling", name: "Gambling", icon: "🎰", color: "yellow" },
  { id: "business", name: "Business", icon: "💼", color: "blue" },
  { id: "social", name: "Crew & Social", icon: "👥", color: "violet" },
  { id: "exploration", name: "Exploration", icon: "🗺️", color: "teal" },
  { id: "collection", name: "Collection", icon: "📦", color: "pink" },
  { id: "story", name: "Story Arc", icon: "📖", color: "amber" },
  { id: "daily", name: "Daily Grind", icon: "📅", color: "green" },
  { id: "elite", name: "Elite Challenges", icon: "👑", color: "red" },
];



/* ═══════════ STORYLINE MISSIONS ═══════════ */
// Auto-generating story arcs that never run out. Rewards scale low to high.

const STORY_ARCS = [
  {
    id: "origins",
    name: "Origins",
    icon: "🌟",
    color: "from-amber-500 to-yellow-600",
    description: "From nothing to something. Your rise begins here.",
    chapters: [
      { name: "First Steps", desc: "Commit your first crime. The streets are watching.", xp: 50, cash: 200, icon: "👣" },
      { name: "Street Cred", desc: "Mug 3 people. Earn respect on the block.", xp: 100, cash: 500, icon: " street" },
      { name: "Small Time", desc: "Shoplift from 5 stores. Build your reputation.", xp: 150, cash: 800, icon: "🏪" },
      { name: "Making Friends", desc: "Recruit your first crew member.", xp: 200, cash: 1000, icon: "🤝" },
      { name: "First Job", desc: "Complete a bank robbery with your crew.", xp: 300, cash: 2000, icon: "🏦" },
      { name: "Heat", desc: "Evade the police 3 times.", xp: 400, cash: 3000, icon: "🚔" },
      { name: "Trust Issues", desc: "Betray a rival and take their territory.", xp: 500, cash: 5000, icon: "🗡️" },
      { name: "The Setup", desc: "Establish a front business.", xp: 600, cash: 8000, icon: "💼" },
      { name: "Cleaning House", desc: "Eliminate 10 rivals.", xp: 800, cash: 12000, icon: "💀" },
      { name: "Made Man", desc: "You are now a made man. Respect is earned.", xp: 1000, cash: 20000, icon: "🏅" },
    ],
  },
  {
    id: "territory",
    name: "Territory",
    icon: "🗺️",
    color: "from-blue-500 to-cyan-600",
    description: "Claim the city block by block.",
    chapters: [
      { name: "Scout the Area", desc: "Explore the slums and find opportunity.", xp: 80, cash: 300, icon: "🔍" },
      { name: "First Block", desc: "Take control of a street corner.", xp: 150, cash: 800, icon: "📍" },
      { name: "Push Back", desc: "Defend your corner against rivals.", xp: 250, cash: 1500, icon: "🛡️" },
      { name: "Expand", desc: "Capture 3 territories.", xp: 400, cash: 3000, icon: "🏴" },
      { name: "Turf War", desc: "Win a crew war for a major district.", xp: 600, cash: 6000, icon: "⚔️" },
      { name: "The Deal", desc: "Negotiate a truce with a rival crew.", xp: 500, cash: 4000, icon: "🤝" },
      { name: "Break the Truce", desc: "Betray and take their territory.", xp: 800, cash: 10000, icon: "🗡️" },
      { name: "Half the City", desc: "Control 50% of all territories.", xp: 1200, cash: 25000, icon: "🏙️" },
      { name: "Full Control", desc: "Dominate every territory in the city.", xp: 2000, cash: 50000, icon: "👑" },
      { name: "King of the City", desc: "You rule the streets. All bow to you.", xp: 3000, cash: 100000, icon: "🏆" },
    ],
  },
  {
    id: "rivalry",
    name: "Rivalry",
    icon: "⚔️",
    color: "from-red-500 to-orange-600",
    description: "A bitter enemy rises. Time to settle the score.",
    chapters: [
      { name: "The Rival Appears", desc: "A new player challenges your authority.", xp: 100, cash: 400, icon: "😠" },
      { name: "First Blood", desc: "Strike the first blow in this war.", xp: 200, cash: 1000, icon: "🩸" },
      { name: "Retaliation", desc: "They strike back. Prepare your defenses.", xp: 300, cash: 2000, icon: "🛡️" },
      { name: "Spy Game", desc: "Plant a mole in their organization.", xp: 400, cash: 3500, icon: "🕵️" },
      { name: "Sabotage", desc: "Destroy their drug lab.", xp: 600, cash: 6000, icon: "💣" },
      { name: "Counter-Attack", desc: "They hit your businesses. Fight back.", xp: 800, cash: 10000, icon: "⚔️" },
      { name: "The Betrayal", desc: "One of their lieutenants switches sides.", xp: 1000, cash: 15000, icon: "🎭" },
      { name: "All-Out War", desc: "Full-scale war. No mercy.", xp: 1500, cash: 30000, icon: "🔥" },
      { name: "The Boss", desc: "Challenge the rival boss to a final duel.", xp: 2000, cash: 50000, icon: "👑" },
      { name: "Victory", desc: "You have won. The rivalry ends here.", xp: 3000, cash: 100000, icon: "🏆" },
    ],
  },
  {
    id: "betrayal",
    name: "Betrayal",
    icon: "🎭",
    color: "from-purple-500 to-pink-600",
    description: "Trust no one. Especially not your closest allies.",
    chapters: [
      { name: "Inner Circle", desc: "Gather your most trusted allies.", xp: 120, cash: 500, icon: "👥" },
      { name: "Suspicion", desc: "Someone is leaking information.", xp: 200, cash: 1200, icon: "🔍" },
      { name: "The Mole", desc: "Identify the traitor in your ranks.", xp: 350, cash: 2500, icon: "🕵️" },
      { name: "Confrontation", desc: "Face the traitor with evidence.", xp: 500, cash: 4000, icon: "😠" },
      { name: "Clean Sweep", desc: "Remove all compromised members.", xp: 700, cash: 8000, icon: "🧹" },
      { name: "Rebuild", desc: "Rebuild your organization from scratch.", xp: 900, cash: 15000, icon: "🔨" },
      { name: "Revenge", desc: "Hunt down the one who betrayed you.", xp: 1200, cash: 25000, icon: "🗡️" },
      { name: "New Order", desc: "Establish a new hierarchy you can trust.", xp: 1600, cash: 40000, icon: "👑" },
      { name: "Iron Fist", desc: "Rule with an iron fist. No more betrayals.", xp: 2200, cash: 60000, icon: "✊" },
      { name: "Legacy", desc: "Your name will never be forgotten.", xp: 3500, cash: 120000, icon: "📜" },
    ],
  },
  {
    id: "fbi",
    name: "The FBI",
    icon: "🕵️",
    color: "from-slate-500 to-blue-600",
    description: "The feds are closing in. Stay one step ahead.",
    chapters: [
      { name: "Surveillance", desc: "The FBI has you under surveillance.", xp: 150, cash: 600, icon: "👁️" },
      { name: "Cover Your Tracks", desc: "Destroy all evidence of your operations.", xp: 250, cash: 1500, icon: "🔥" },
      { name: "The Informant", desc: "Someone is talking to the feds.", xp: 400, cash: 3000, icon: "🤫" },
      { name: "Interrogation", desc: "An agent questions you. Stay cool.", xp: 500, cash: 4000, icon: "🗣️" },
      { name: "The Raid", desc: "The FBI raids one of your operations.", xp: 700, cash: 8000, icon: "🚔" },
      { name: "Fugitive", desc: "Go on the run. Evade capture.", xp: 1000, cash: 15000, icon: "🏃" },
      { name: "Clean Slate", desc: "Get a new identity. Start fresh.", xp: 1400, cash: 30000, icon: "🎭" },
      { name: "Counter-Intelligence", desc: "Plant false evidence to mislead the FBI.", xp: 1800, cash: 45000, icon: "🕵️" },
      { name: "The Mole", desc: "Turn an FBI agent to your side.", xp: 2500, cash: 70000, icon: "🤝" },
      { name: "Untouchable", desc: "The FBI can never prove anything.", xp: 4000, cash: 150000, icon: "🏆" },
    ],
  },
  {
    id: "prison",
    name: "Prison",
    icon: "⛓️",
    color: "from-gray-500 to-gray-700",
    description: "Behind bars. But the game never stops.",
    chapters: [
      { name: "Arrested", desc: "The cops finally caught you.", xp: 100, cash: 200, icon: "🚔" },
      { name: "Processing", desc: "Fingerprinted. Photographed. Locked up.", xp: 150, cash: 300, icon: "📸" },
      { name: "Cell Life", desc: "Adapt to prison life. Find your place.", xp: 200, cash: 500, icon: "🔒" },
      { name: "The Yard", desc: "Establish dominance in the yard.", xp: 300, cash: 1000, icon: "🏋️" },
      { name: "Contraband", desc: "Smuggle items into the prison.", xp: 400, cash: 2000, icon: "📦" },
      { name: "The Guard", desc: "Bribe a guard for special treatment.", xp: 500, cash: 3000, icon: "💰" },
      { name: "Prison Gang", desc: "Join or form a prison gang.", xp: 600, cash: 4000, icon: "👥" },
      { name: "The Escape", desc: "Plan your escape from prison.", xp: 1000, cash: 10000, icon: "🏃" },
      { name: "Free Man", desc: "You're out. But the FBI is watching.", xp: 1500, cash: 20000, icon: "🌅" },
      { name: "Revenge", desc: "Pay back everyone who put you behind bars.", xp: 2500, cash: 50000, icon: "🗡️" },
    ],
  },
  {
    id: "empire",
    name: "Empire",
    icon: "👑",
    color: "from-yellow-500 to-amber-600",
    description: "Build a criminal empire that spans the globe.",
    chapters: [
      { name: "Small Business", desc: "Start with a single front business.", xp: 200, cash: 1000, icon: "🏪" },
      { name: "Expansion", desc: "Open 3 more businesses.", xp: 400, cash: 3000, icon: "📈" },
      { name: "The Bank", desc: "Establish your own bank for money laundering.", xp: 600, cash: 8000, icon: "🏦" },
      { name: "International", desc: "Expand operations to another city.", xp: 1000, cash: 20000, icon: "✈️" },
      { name: "The Cartel", desc: "Form a cartel with international partners.", xp: 1500, cash: 40000, icon: "🤝" },
      { name: "Market Control", desc: "Control 50% of the drug market.", xp: 2000, cash: 80000, icon: "📊" },
      { name: "The Corporation", desc: "Create a legitimate corporation as a front.", xp: 2500, cash: 120000, icon: "🏢" },
      { name: "Global Network", desc: "Establish operations on 3 continents.", xp: 3500, cash: 200000, icon: "🌍" },
      { name: "The Summit", desc: "Host a summit of the world's top crime bosses.", xp: 5000, cash: 500000, icon: "🏛️" },
      { name: "Shadow Emperor", desc: "You rule the global underworld.", xp: 8000, cash: 1000000, icon: "👑" },
    ],
  },
  {
    id: "ghost",
    name: "Ghost Protocol",
    icon: "👻",
    color: "from-indigo-500 to-purple-600",
    description: "Become invisible. Erase all traces. Strike from the shadows.",
    chapters: [
      { name: "Digital Footprint", desc: "Erase your digital footprint.", xp: 250, cash: 1500, icon: "💻" },
      { name: "New Identity", desc: "Create a completely new identity.", xp: 400, cash: 3000, icon: "🎭" },
      { name: "Ghost Protocol", desc: "Activate ghost mode for 24 hours.", xp: 600, cash: 6000, icon: "👻" },
      { name: "Infiltrate", desc: "Infiltrate a rival organization undetected.", xp: 1000, cash: 15000, icon: "🕵️" },
      { name: "Data Heist", desc: "Steal classified data without being traced.", xp: 1500, cash: 30000, icon: "💾" },
      { name: "Ghost Strike", desc: "Eliminate a target and vanish.", xp: 2000, cash: 50000, icon: "🗡️" },
      { name: "Dead Drop", desc: "Set up a network of dead drops across the city.", xp: 2500, cash: 75000, icon: "📦" },
      { name: "Shadow Network", desc: "Build an invisible network of operatives.", xp: 3500, cash: 120000, icon: "🕸️" },
      { name: "The Phantom", desc: "You become a myth. A ghost story.", xp: 5000, cash: 200000, icon: "🌑" },
      { name: "Legend", desc: "Your name is whispered in fear. You are the ghost.", xp: 8000, cash: 500000, icon: "🏆" },
    ],
  },
];

// Generate infinite storyline missions by cycling through arcs
function generateStorylineMissions(completedStoryIds: Set<string>, playerLevel: number) {
  const missions: Array<{
    id: string;
    arcId: string;
    arcName: string;
    arcIcon: string;
    arcColor: string;
    chapter: number;
    totalChapters: number;
    name: string;
    description: string;
    xpReward: number;
    cashReward: number;
    icon: string;
    difficulty: string;
    levelRequired: number;
  }> = [];

  // Calculate which cycle we're on (cycles repeat arcs with higher rewards)
  const completedCount = completedStoryIds.size;
  const cycle = Math.floor(completedCount / (STORY_ARCS.length * 10)) + 1;

  STORY_ARCS.forEach(arc => {
    arc.chapters.forEach((ch, idx) => {
      // Generate a unique ID that includes the cycle
      const missionId = `story_${arc.id}_${idx}_cycle${cycle}`;
      // Scale rewards by cycle
      const rewardMultiplier = cycle;
      const xpReward = Math.floor(ch.xp * rewardMultiplier * (1 + playerLevel * 0.05));
      const cashReward = Math.floor(ch.cash * rewardMultiplier * (1 + playerLevel * 0.08));
      const levelRequired = Math.min(1 + idx * 2 + (cycle - 1) * 20, 200);

      missions.push({
        id: missionId,
        arcId: arc.id,
        arcName: arc.name,
        arcIcon: arc.icon,
        arcColor: arc.color,
        chapter: idx + 1,
        totalChapters: arc.chapters.length,
        name: `[${arc.icon}] ${arc.name} ${idx + 1}: ${ch.name}`,
        description: ch.desc,
        xpReward,
        cashReward,
        icon: ch.icon,
        difficulty: idx < 3 ? "easy" : idx < 6 ? "medium" : idx < 8 ? "hard" : "legendary",
        levelRequired,
      });
    });
  });

  return missions;
}

const DIFFICULTIES = [
  { id: "easy", name: "Easy", color: "text-green-400", bg: "bg-green-900/30" },
  { id: "medium", name: "Medium", color: "text-yellow-400", bg: "bg-yellow-900/30" },
  { id: "hard", name: "Hard", color: "text-orange-400", bg: "bg-orange-900/30" },
  { id: "elite", name: "Elite", color: "text-red-400", bg: "bg-red-900/30" },
  { id: "legendary", name: "Legendary", color: "text-purple-400", bg: "bg-purple-900/30" },
];

/* ═══════════ MISSION GENERATOR ═══════════ */
const MISSION_TEMPLATES: { name: string; desc: string; cat: string; diff: string; xp: [number,number]; cash: [number,number] }[] = [
  // ═══════════ STREET CRIMES EXPANDED ═══════════
  { name: "Bike Theft Ring", desc: "Steal 10 bicycles and sell them to a fence.", cat: "crimes", diff: "easy", xp: [6,14], cash: [120,600] },
  { name: "Pickpocket Rush", desc: "Hit 5 targets in the subway within 10 minutes.", cat: "crimes", diff: "medium", xp: [14,32], cash: [400,2200] },
  { name: "Shake Down", desc: "Shake down a local merchant for protection money.", cat: "crimes", diff: "easy", xp: [8,20], cash: [200,1000] },
  { name: "Window Smasher", desc: "Smash 15 car windows and grab valuables.", cat: "crimes", diff: "easy", xp: [10,22], cash: [250,1200] },
  { name: "Store Robbery", desc: "Hit a convenience store with a demand note.", cat: "crimes", diff: "medium", xp: [18,40], cash: [800,4000] },
  { name: "Bicycle Bandit", desc: "Steal bicycles from a locked rack.", cat: "crimes", diff: "easy", xp: [5,12], cash: [80,400] },
  { name: "Corner Hustle", desc: "Run a street corner scam for quick cash.", cat: "crimes", diff: "easy", xp: [6,16], cash: [100,500] },
  { name: "Package Thief", desc: "Steal packages from doorsteps during the holidays.", cat: "crimes", diff: "easy", xp: [7,18], cash: [150,700] },
  { name: "Construction Theft", desc: "Steal copper wiring from a construction site.", cat: "crimes", diff: "medium", xp: [12,28], cash: [300,1800] },
  { name: "ATM Robbery", desc: "Rob someone at an ATM after midnight.", cat: "crimes", diff: "medium", xp: [16,36], cash: [500,3000] },
  { name: "Laptop Snatcher", desc: "Snatch a laptop from a cafe table.", cat: "crimes", diff: "easy", xp: [8,20], cash: [200,1000] },
  { name: "Shoe Heist", desc: "Steal limited edition sneakers from a delivery truck.", cat: "crimes", diff: "medium", xp: [10,24], cash: [300,1500] },
  { name: "Mail Theft", desc: "Raid mailboxes for credit cards and checks.", cat: "crimes", diff: "easy", xp: [6,14], cash: [100,600] },
  { name: "Tool Theft", desc: "Steal power tools from an unlocked van.", cat: "crimes", diff: "easy", xp: [5,12], cash: [80,400] },
  { name: "Coin Collection", desc: "Break into a parking meter and collect coins.", cat: "crimes", diff: "easy", xp: [4,10], cash: [60,300] },
  { name: "Garden Gnome Bandit", desc: "Steal garden decorations and sell them online.", cat: "crimes", diff: "easy", xp: [3,8], cash: [40,200] },
  { name: "Porch Pirate", desc: "Steal deliveries from porches.", cat: "crimes", diff: "easy", xp: [6,14], cash: [100,500] },
  { name: "Bike Messenger Robbery", desc: "Rob a bike messenger of their delivery bag.", cat: "crimes", diff: "medium", xp: [12,28], cash: [300,1600] },
  { name: "Parking Lot Theft", desc: "Break into cars in a mall parking lot.", cat: "crimes", diff: "easy", xp: [8,20], cash: [200,1000] },
  { name: "Hot Dog Stand Hit", desc: "Rob a hot dog vendor of their day's earnings.", cat: "crimes", diff: "easy", xp: [6,14], cash: [100,600] },
  // ═══════════ HEISTS EXPANDED ═══════════
  { name: "Pawn Shop Smash", desc: "Smash the display cases and grab the jewelry.", cat: "heists", diff: "medium", xp: [22,48], cash: [1200,6000] },
  { name: "Donut Shop Raid", desc: "Hit the donut shop when the register is full.", cat: "heists", diff: "easy", xp: [10,22], cash: [300,1500] },
  { name: "Liquor Store Job", desc: "Rob the liquor store on a busy night.", cat: "heists", diff: "medium", xp: [14,32], cash: [500,2500] },
  { name: "Mini Mart Blitz", desc: "Quick hit on the mini mart. In and out.", cat: "heists", diff: "easy", xp: [8,18], cash: [200,800] },
  { name: "Electronics Store Raid", desc: "Hit the electronics store during closing.", cat: "heists", diff: "hard", xp: [28,58], cash: [2000,8000] },
  { name: "Jewelry Store Blitz", desc: "Smash and grab at the jewelry store.", cat: "heists", diff: "elite", xp: [55,110], cash: [8000,30000] },
  { name: "Bank Vault Cracker", desc: "Crack the bank vault with thermite.", cat: "heists", diff: "legendary", xp: [100,200], cash: [25000,100000] },
  { name: "Casino VIP Room", desc: "Hit the casino VIP room during peak hours.", cat: "heists", diff: "legendary", xp: [110,220], cash: [30000,120000] },
  { name: "Museum Night Job", desc: "Steal artifacts from the museum at night.", cat: "heists", diff: "elite", xp: [65,130], cash: [12000,50000] },
  { name: "Art Gallery Heist", desc: "Steal a priceless painting.", cat: "heists", diff: "elite", xp: [70,140], cash: [15000,60000] },
  { name: "Armored Car Job", desc: "Intercept an armored car on the highway.", cat: "heists", diff: "elite", xp: [80,160], cash: [18000,70000] },
  { name: "Cargo Ship Raid", desc: "Board a cargo ship and steal the goods.", cat: "heists", diff: "legendary", xp: [130,260], cash: [35000,140000] },
  { name: "Train Robbery", desc: "Stop the train and rob the cargo.", cat: "heists", diff: "elite", xp: [85,170], cash: [20000,80000] },
  { name: "Diamond Exchange", desc: "Raid the diamond exchange.", cat: "heists", diff: "legendary", xp: [140,280], cash: [45000,180000] },
  { name: "Luxury Yacht Theft", desc: "Board a luxury yacht and steal everything.", cat: "heists", diff: "legendary", xp: [120,240], cash: [35000,140000] },
  // ═══════════ FRAUD EXPANDED ═══════════
  { name: "Phishing Scheme", desc: "Send phishing emails to steal login credentials.", cat: "fraud", diff: "medium", xp: [14,32], cash: [500,2500] },
  { name: "Credit Card Cloner", desc: "Clone credit cards using a skimmer device.", cat: "fraud", diff: "hard", xp: [22,48], cash: [1500,6000] },
  { name: "Fake Invoice", desc: "Create fake invoices and collect payment.", cat: "fraud", diff: "medium", xp: [16,36], cash: [600,3000] },
  { name: "Tax Fraud", desc: "File false tax returns for refunds.", cat: "fraud", diff: "hard", xp: [28,60], cash: [3000,12000] },
  { name: "Identity Swap", desc: "Steal someone's identity and open accounts.", cat: "fraud", diff: "hard", xp: [25,55], cash: [2500,10000] },
  { name: "Check Fraud", desc: "Forge checks and cash them.", cat: "fraud", diff: "medium", xp: [18,40], cash: [800,4000] },
  { name: "Wire Transfer Scam", desc: "Trick someone into wiring money.", cat: "fraud", diff: "hard", xp: [24,52], cash: [2000,8000] },
  { name: "Insurance Claim", desc: "File a fake insurance claim.", cat: "fraud", diff: "medium", xp: [15,34], cash: [500,2500] },
  { name: "Crypto Rug Pull", desc: "Create a fake crypto token and dump it.", cat: "fraud", diff: "elite", xp: [50,100], cash: [15000,60000] },
  { name: "Ponzi Scheme Setup", desc: "Set up a Ponzi scheme with fake returns.", cat: "fraud", diff: "elite", xp: [55,110], cash: [20000,80000] },
  // ═══════════ DRUGS EXPANDED ═══════════
  { name: "Corner Deal", desc: "Move product on the street corner.", cat: "drugs", diff: "easy", xp: [10,24], cash: [400,2000] },
  { name: "Drop Off", desc: "Deliver product to a customer.", cat: "drugs", diff: "easy", xp: [8,18], cash: [200,1000] },
  { name: "Lab Setup", desc: "Set up a small cooking operation.", cat: "drugs", diff: "medium", xp: [20,44], cash: [1500,6000] },
  { name: "Supply Run", desc: "Pick up precursor chemicals.", cat: "drugs", diff: "medium", xp: [14,32], cash: [600,3000] },
  { name: "Distribution Deal", desc: "Sell bulk product to a distributor.", cat: "drugs", diff: "hard", xp: [30,65], cash: [5000,20000] },
  { name: "Lab Expansion", desc: "Expand your cooking operation.", cat: "drugs", diff: "hard", xp: [35,75], cash: [8000,30000] },
  { name: "Smuggling Run", desc: "Move product across state lines.", cat: "drugs", diff: "elite", xp: [50,100], cash: [15000,60000] },
  { name: "Cartel Meeting", desc: "Meet with cartel representatives.", cat: "drugs", diff: "legendary", xp: [70,140], cash: [30000,120000] },
  { name: "Precursor Theft", desc: "Steal precursor chemicals from a lab.", cat: "drugs", diff: "hard", xp: [28,60], cash: [4000,16000] },
  { name: "Market Control", desc: "Take over a drug market from rivals.", cat: "drugs", diff: "elite", xp: [45,90], cash: [12000,48000] },
  // ═══════════ MURDER EXPANDED ═══════════
  { name: "Silent Takedown", desc: "Eliminate a target quietly.", cat: "murder", diff: "hard", xp: [35,70], cash: [5000,20000] },
  { name: "Contract Hit", desc: "Complete a contract killing.", cat: "murder", diff: "elite", xp: [55,110], cash: [15000,60000] },
  { name: "Car Bomb", desc: "Plant a bomb in a target's car.", cat: "murder", diff: "elite", xp: [65,130], cash: [20000,80000] },
  { name: "Poison Job", desc: "Poison a target's drink.", cat: "murder", diff: "hard", xp: [30,65], cash: [4000,16000] },
  { name: "Drive-By Hit", desc: "Eliminate a target from a moving vehicle.", cat: "murder", diff: "hard", xp: [40,85], cash: [8000,32000] },
  { name: "Witness Removal", desc: "Remove a witness before they talk.", cat: "murder", diff: "elite", xp: [50,100], cash: [12000,48000] },
  { name: "Boss Kill", desc: "Take out a rival boss.", cat: "murder", diff: "legendary", xp: [90,180], cash: [50000,200000] },
  { name: "Clean Up", desc: "Dispose of evidence and witnesses.", cat: "murder", diff: "hard", xp: [28,58], cash: [3000,12000] },
  { name: "Retaliation", desc: "Retaliate for a betrayal.", cat: "murder", diff: "hard", xp: [32,68], cash: [5000,20000] },
  { name: "Ghost Kill", desc: "Eliminate a target without leaving any trace.", cat: "murder", diff: "legendary", xp: [100,200], cash: [60000,240000] },
  // ═══════════ COMBAT EXPANDED ═══════════
  { name: "Street Brawl", desc: "Win a street fight.", cat: "combat", diff: "easy", xp: [8,18], cash: [100,500] },
  { name: "Boxing Match", desc: "Win an underground boxing match.", cat: "combat", diff: "medium", xp: [18,40], cash: [800,4000] },
  { name: "Duel Victory", desc: "Win a 1v1 duel.", cat: "combat", diff: "medium", xp: [20,44], cash: [1000,5000] },
  { name: "Ambush Success", desc: "Successfully ambush a target.", cat: "combat", diff: "medium", xp: [16,36], cash: [600,3000] },
  { name: "Turf Defense", desc: "Defend your turf against invaders.", cat: "combat", diff: "hard", xp: [28,60], cash: [2000,8000] },
  { name: "Faction War Win", desc: "Win a faction war.", cat: "combat", diff: "hard", xp: [32,68], cash: [3000,12000] },
  { name: "Kill Streak", desc: "Get 5 kills in a row.", cat: "combat", diff: "elite", xp: [55,110], cash: [10000,40000] },
  { name: "Battle Royale Win", desc: "Be the last one standing.", cat: "combat", diff: "legendary", xp: [75,150], cash: [15000,60000] },
  { name: "Interrogation", desc: "Extract info from a captive.", cat: "combat", diff: "medium", xp: [14,32], cash: [400,2000] },
  { name: "Sabotage Op", desc: "Destroy a rival's operations.", cat: "combat", diff: "hard", xp: [24,52], cash: [2000,8000] },
  // ═══════════ GAMBLING EXPANDED ═══════════
  { name: "Blackjack Win", desc: "Win $5K at blackjack.", cat: "gambling", diff: "medium", xp: [12,28], cash: [5000,5000] },
  { name: "Poker Victory", desc: "Win a poker hand with a full house.", cat: "gambling", diff: "medium", xp: [14,32], cash: [3000,3000] },
  { name: "Roulette Spin", desc: "Bet on a number and win.", cat: "gambling", diff: "medium", xp: [10,24], cash: [3500,3500] },
  { name: "Slot Jackpot", desc: "Hit the slot machine jackpot.", cat: "gambling", diff: "hard", xp: [25,55], cash: [20000,20000] },
  { name: "Lottery Win", desc: "Win the lottery.", cat: "gambling", diff: "legendary", xp: [70,140], cash: [100000,100000] },
  { name: "Baccarat Streak", desc: "Win 10 hands of baccarat in a row.", cat: "gambling", diff: "hard", xp: [30,65], cash: [15000,15000] },
  { name: "Craps Hot Roll", desc: "Roll 7 or 11 five times in a row.", cat: "gambling", diff: "hard", xp: [28,60], cash: [12000,12000] },
  { name: "High Roller", desc: "Bet $100K on a single hand.", cat: "gambling", diff: "legendary", xp: [90,180], cash: [200000,200000] },
  { name: "Tournament Winner", desc: "Win a poker tournament.", cat: "gambling", diff: "elite", xp: [45,90], cash: [40000,40000] },
  { name: "Casino Run", desc: "Win at 5 different casino games.", cat: "gambling", diff: "elite", xp: [50,100], cash: [30000,30000] },
  // ═══════════ BUSINESS EXPANDED ═══════════
  { name: "Front Shop", desc: "Open a front business.", cat: "business", diff: "easy", xp: [8,18], cash: [300,1500] },
  { name: "Property Buy", desc: "Purchase a property.", cat: "business", diff: "easy", xp: [10,22], cash: [500,2500] },
  { name: "Casino Setup", desc: "Open an underground casino.", cat: "business", diff: "hard", xp: [30,65], cash: [8000,32000] },
  { name: "Drug Lab Build", desc: "Build a hidden drug lab.", cat: "business", diff: "hard", xp: [28,60], cash: [6000,24000] },
  { name: "Business Takeover", desc: "Acquire a rival business.", cat: "business", diff: "elite", xp: [45,90], cash: [18000,72000] },
  { name: "Crypto Mining Rig", desc: "Set up crypto mining.", cat: "business", diff: "medium", xp: [16,36], cash: [2000,8000] },
  { name: "Empire Builder", desc: "Own 10 businesses.", cat: "business", diff: "legendary", xp: [75,150], cash: [50000,200000] },
  { name: "Offshore Move", desc: "Move money offshore.", cat: "business", diff: "medium", xp: [14,32], cash: [2500,10000] },
  { name: "Business Flip", desc: "Buy and sell a business for profit.", cat: "business", diff: "medium", xp: [18,40], cash: [4000,16000] },
  { name: "Monopoly", desc: "Own 50% of businesses in a district.", cat: "business", diff: "legendary", xp: [90,180], cash: [100000,400000] },
  // ═══════════ SOCIAL EXPANDED ═══════════
  { name: "Recruit Member", desc: "Recruit a new crew member.", cat: "social", diff: "easy", xp: [6,14], cash: [100,500] },
  { name: "Crew Creation", desc: "Create a new crew.", cat: "social", diff: "medium", xp: [16,36], cash: [800,4000] },
  { name: "Crew War Victory", desc: "Win a crew war.", cat: "social", diff: "hard", xp: [30,65], cash: [4000,16000] },
  { name: "Protection Money", desc: "Collect protection money from all businesses.", cat: "social", diff: "medium", xp: [12,28], cash: [1500,6000] },
  { name: "Alliance Form", desc: "Form an alliance with another crew.", cat: "social", diff: "medium", xp: [14,32], cash: [1200,5000] },
  { name: "Betrayal", desc: "Betray an ally.", cat: "social", diff: "hard", xp: [25,55], cash: [6000,24000] },
  { name: "Become Don", desc: "Rise to Don of your family.", cat: "social", diff: "legendary", xp: [70,140], cash: [30000,120000] },
  { name: "Crew Bank Deposit", desc: "Deposit $50K into crew bank.", cat: "social", diff: "easy", xp: [8,18], cash: [200,1000] },
  { name: "Boss Meeting", desc: "Host a meeting of crime bosses.", cat: "social", diff: "hard", xp: [22,48], cash: [2500,10000] },
  { name: "Territory Control", desc: "Control 5 territories.", cat: "social", diff: "elite", xp: [50,100], cash: [15000,60000] },
  // ═══════════ EXPLORATION EXPANDED ═══════════
  { name: "Slum Scout", desc: "Scout the slums.", cat: "exploration", diff: "easy", xp: [4,10], cash: [80,400] },
  { name: "Dock Check", desc: "Check the docks.", cat: "exploration", diff: "easy", xp: [6,14], cash: [120,600] },
  { name: "Casino Scout", desc: "Scout the casino district.", cat: "exploration", diff: "medium", xp: [12,28], cash: [400,2000] },
  { name: "Rival Territory", desc: "Infiltrate rival territory.", cat: "exploration", diff: "hard", xp: [20,44], cash: [1200,5000] },
  { name: "Safehouse Find", desc: "Discover a hidden safehouse.", cat: "exploration", diff: "medium", xp: [14,32], cash: [2500,10000] },
  { name: "Tunnel Network", desc: "Map the underground tunnels.", cat: "exploration", diff: "hard", xp: [25,55], cash: [1500,6000] },
  { name: "Black Market", desc: "Find the black market dealer.", cat: "exploration", diff: "elite", xp: [40,80], cash: [6000,24000] },
  { name: "City Tour", desc: "Visit every district.", cat: "exploration", diff: "medium", xp: [16,36], cash: [800,3200] },
  { name: "Night Patrol", desc: "Patrol at night.", cat: "exploration", diff: "medium", xp: [12,28], cash: [300,1200] },
  { name: "Ghost Walk", desc: "Move undetected.", cat: "exploration", diff: "elite", xp: [35,70], cash: [4000,16000] },
  // ═══════════ COLLECTION EXPANDED ═══════════
  { name: "Weapon Collector", desc: "Collect 5 weapons.", cat: "collection", diff: "easy", xp: [8,18], cash: [400,1600] },
  { name: "Arsenal Builder", desc: "Collect 20 weapons.", cat: "collection", diff: "hard", xp: [30,65], cash: [4000,16000] },
  { name: "Intel Gatherer", desc: "Collect 10 intel docs.", cat: "collection", diff: "medium", xp: [14,32], cash: [800,3200] },
  { name: "Rare Hunter", desc: "Find 5 rare items.", cat: "collection", diff: "hard", xp: [25,55], cash: [2500,10000] },
  { name: "Car Collector", desc: "Steal 10 cars.", cat: "collection", diff: "hard", xp: [22,48], cash: [3000,12000] },
  { name: "Easter Egg Finder", desc: "Find 5 Easter eggs.", cat: "collection", diff: "medium", xp: [12,28], cash: [1500,6000] },
  { name: "Full Arsenal", desc: "Collect every weapon.", cat: "collection", diff: "legendary", xp: [70,140], cash: [18000,72000] },
  { name: "Explosive Stockpile", desc: "Collect 15 explosives.", cat: "collection", diff: "hard", xp: [28,60], cash: [5000,20000] },
  { name: "Medical Supplies", desc: "Stock medical supplies.", cat: "collection", diff: "easy", xp: [6,14], cash: [200,800] },
  { name: "Complete Set", desc: "Collect all items in a category.", cat: "collection", diff: "elite", xp: [45,90], cash: [8000,32000] },
  // ═══════════ DAILY GRIND EXPANDED ═══════════
  { name: "5 Crimes Daily", desc: "Commit 5 crimes today.", cat: "daily", diff: "easy", xp: [6,14], cash: [150,800] },
  { name: "3 Wins Daily", desc: "Win 3 fights today.", cat: "daily", diff: "medium", xp: [12,28], cash: [400,2000] },
  { name: "10K Earned", desc: "Earn $10K today.", cat: "daily", diff: "medium", xp: [16,36], cash: [1500,6000] },
  { name: "Gamble 5x", desc: "Place 5 bets today.", cat: "daily", diff: "easy", xp: [8,18], cash: [200,1000] },
  { name: "Mission Complete", desc: "Finish any mission today.", cat: "daily", diff: "easy", xp: [6,12], cash: [150,600] },
  { name: "Sell 3 Items", desc: "Sell 3 items today.", cat: "daily", diff: "easy", xp: [4,10], cash: [80,400] },
  { name: "Chat Active", desc: "Send 5 messages today.", cat: "daily", diff: "easy", xp: [3,8], cash: [30,150] },
  { name: "50K Earned", desc: "Earn $50K today.", cat: "daily", diff: "hard", xp: [25,55], cash: [4000,16000] },
  { name: "20 Crimes", desc: "Commit 20 crimes today.", cat: "daily", diff: "hard", xp: [20,44], cash: [2500,10000] },
  { name: "Perfect Gambling", desc: "Win all 10 bets today.", cat: "daily", diff: "elite", xp: [45,90], cash: [8000,32000] },
  // ═══════════ ELITE EXPANDED ═══════════
  { name: "Speed Millionaire", desc: "Earn $1M fast.", cat: "elite", diff: "legendary", xp: [130,260], cash: [100000,400000] },
  { name: "No Death Run", desc: "50 actions without dying.", cat: "elite", diff: "legendary", xp: [110,220], cash: [70000,280000] },
  { name: "Pacifist Rich", desc: "$100K without violence.", cat: "elite", diff: "hard", xp: [50,100], cash: [25000,100000] },
  { name: "One Shot Kill", desc: "Kill a legendary boss in one hit.", cat: "elite", diff: "legendary", xp: [90,180], cash: [45000,180000] },
  { name: "20 Win Streak", desc: "Win 20 fights in a row.", cat: "elite", diff: "legendary", xp: [120,240], cash: [65000,260000] },
  { name: "Casino King", desc: "Win $500K at casino.", cat: "elite", diff: "legendary", xp: [130,260], cash: [180000,720000] },
  { name: "Mission Master", desc: "Complete 1000 missions.", cat: "elite", diff: "legendary", xp: [180,360], cash: [450000,1800000] },
  { name: "Ghost Runner", desc: "50 missions without wanted.", cat: "elite", diff: "legendary", xp: [100,200], cash: [55000,220000] },
  { name: "Untouchable", desc: "100 crimes without arrest.", cat: "elite", diff: "legendary", xp: [140,280], cash: [130000,520000] },
  { name: "Shadow Ruler", desc: "Reach highest rank.", cat: "elite", diff: "legendary", xp: [220,440], cash: [900000,3600000] },
  // ═══════════ SMUGGLING ═══════════
  { name: "Border Run", desc: "Smuggle goods across the border.", cat: "smuggling", diff: "hard", xp: [30,65], cash: [5000,20000] },
  { name: "Contraband Move", desc: "Move contraband through checkpoints.", cat: "smuggling", diff: "medium", xp: [18,40], cash: [1200,5000] },
  { name: "Container Ship", desc: "Load goods onto a container ship.", cat: "smuggling", diff: "elite", xp: [55,110], cash: [15000,60000] },
  { name: "Tunnel Route", desc: "Use underground tunnels for smuggling.", cat: "smuggling", diff: "hard", xp: [35,75], cash: [8000,32000] },
  { name: "Air Drop", desc: "Smuggle goods via private plane.", cat: "smuggling", diff: "legendary", xp: [80,160], cash: [30000,120000] },
  { name: "Fence Network", desc: "Set up a fence network for stolen goods.", cat: "smuggling", diff: "medium", xp: [14,32], cash: [800,3200] },
  { name: "Cargo Intercept", desc: "Intercept a rival's cargo shipment.", cat: "smuggling", diff: "hard", xp: [28,60], cash: [4000,16000] },
  { name: "Coast Run", desc: "Smuggle goods along the coast.", cat: "smuggling", diff: "medium", xp: [16,36], cash: [1000,4000] },
  { name: "Black Market Deal", desc: "Sell smuggled goods on the black market.", cat: "smuggling", diff: "hard", xp: [25,55], cash: [3000,12000] },
  { name: "International Route", desc: "Establish an international smuggling route.", cat: "smuggling", diff: "legendary", xp: [90,180], cash: [50000,200000] },
// Street Crimes (id 0-199)
  { name: "Pickpocket a Tourist", desc: "Lift a wallet from an unsuspecting tourist on the boardwalk.", cat: "crimes", diff: "easy", xp: [5,15], cash: [100,500] },
  { name: "Mug a Drunk", desc: "Find someone stumbling out of a bar. Take their cash.", cat: "crimes", diff: "easy", xp: [8,20], cash: [200,800] },
  { name: "Shoplift Electronics", desc: "Grab a laptop from the electronics store without getting caught.", cat: "crimes", diff: "easy", xp: [10,25], cash: [300,1200] },
  { name: "Car Break-In", desc: "Smash a car window and grab whatever's inside.", cat: "crimes", diff: "easy", xp: [10,20], cash: [200,1000] },
  { name: "Phone Snatch", desc: "Snatch a phone from someone texting on the sidewalk.", cat: "crimes", diff: "easy", xp: [6,15], cash: [150,600] },
  { name: "ATM Skimming", desc: "Install a skimmer on an ATM and collect card data.", cat: "crimes", diff: "medium", xp: [15,35], cash: [500,3000] },
  { name: "Bicycle Theft", desc: "Steal a bicycle from the park. Quick cash.", cat: "crimes", diff: "easy", xp: [4,10], cash: [50,300] },
  { name: "Purse Snatching", desc: "Run by and grab a purse. Don't look back.", cat: "crimes", diff: "easy", xp: [8,18], cash: [200,900] },
  { name: "Ticket Scalping", desc: "Buy concert tickets and resell at 3x markup.", cat: "crimes", diff: "medium", xp: [12,28], cash: [400,2000] },
  { name: "Dumpster Diving", desc: "Raid restaurant dumpsters for recyclables and cash.", cat: "crimes", diff: "easy", xp: [2,8], cash: [30,150] },
  { name: "Petty Vandalism", desc: "Tag a wall with your crew's symbol.", cat: "crimes", diff: "easy", xp: [5,12], cash: [50,300] },
  { name: "Scrap Metal Theft", desc: "Strip copper from a construction site.", cat: "crimes", diff: "easy", xp: [8,20], cash: [150,800] },
  { name: "Egg Smuggling", desc: "Run a rare egg smuggling ring across state lines.", cat: "crimes", diff: "medium", xp: [12,30], cash: [300,1500] },
  { name: "Bootlegging", desc: "Bootleg movies and sell copies on the street.", cat: "crimes", diff: "medium", xp: [14,32], cash: [400,2000] },
  { name: "Fence Stolen Goods", desc: "Set up a fence to move hot merchandise.", cat: "crimes", diff: "medium", xp: [16,36], cash: [500,3000] },
  // Heists (id 200-399)
  { name: "Convenience Store Holdup", desc: "Walk in with a mask. Walk out with cash.", cat: "heists", diff: "medium", xp: [20,50], cash: [1000,5000] },
  { name: "Gas Station Robbery", desc: "Hit the gas station on a quiet night.", cat: "heists", diff: "medium", xp: [25,55], cash: [1500,6000] },
  { name: "Pawn Shop Heist", desc: "Break into the pawn shop after hours.", cat: "heists", diff: "medium", xp: [30,60], cash: [2000,8000] },
  { name: "Pharmacy Robbery", desc: "Hit the pharmacy for drugs and cash.", cat: "heists", diff: "hard", xp: [35,70], cash: [3000,10000] },
  { name: "ATM Bombing", desc: "Blow open an ATM and grab the cash inside.", cat: "heists", diff: "hard", xp: [40,80], cash: [5000,15000] },
  { name: "Electronics Store Heist", desc: "Hit the electronics store. Grab everything.", cat: "heists", diff: "hard", xp: [45,90], cash: [4000,12000] },
  { name: "Jewelry Store Blitz", desc: "Smash and grab at the jewelry store.", cat: "heists", diff: "elite", xp: [60,120], cash: [8000,30000] },
  { name: "Art Gallery Theft", desc: "Steal a painting worth millions.", cat: "heists", diff: "elite", xp: [70,140], cash: [12000,50000] },
  { name: "Armored Car Robbery", desc: "Intercept an armored car on the highway.", cat: "heists", diff: "elite", xp: [80,160], cash: [15000,60000] },
  { name: "Bank Vault Heist", desc: "Crack the bank vault. The big score.", cat: "heists", diff: "legendary", xp: [100,200], cash: [25000,100000] },
  { name: "Casino Heist", desc: "Rob the casino's VIP room.", cat: "heists", diff: "legendary", xp: [120,250], cash: [35000,150000] },
  { name: "Museum Artifact Heist", desc: "Steal a priceless artifact from the museum.", cat: "heists", diff: "legendary", xp: [130,260], cash: [40000,200000] },
  { name: "Diamond Exchange Raid", desc: "Raid the diamond exchange. Hit hard, hit fast.", cat: "heists", diff: "legendary", xp: [150,300], cash: [50000,250000] },
  { name: "Train Robbery", desc: "Stop the train and rob the cargo.", cat: "heists", diff: "elite", xp: [90,180], cash: [22000,80000] },
  { name: "Cargo Ship Hijacking", desc: "Board a cargo ship and steal the goods.", cat: "heists", diff: "legendary", xp: [140,280], cash: [30000,120000] },
  // Fraud (id 400-599)
  { name: "Credit Card Fraud", desc: "Use cloned cards at high-end stores.", cat: "fraud", diff: "medium", xp: [18,40], cash: [800,4000] },
  { name: "Identity Theft", desc: "Steal someone's identity. Open accounts.", cat: "fraud", diff: "hard", xp: [25,55], cash: [2000,8000] },
  { name: "Lottery Scam", desc: "Tell people they won the lottery. Collect fees.", cat: "fraud", diff: "medium", xp: [15,35], cash: [500,3000] },
  { name: "Tax Evasion", desc: "Cook the books. Hide the money.", cat: "fraud", diff: "hard", xp: [30,65], cash: [5000,20000] },
  { name: "Insurance Fraud", desc: "Stage an accident. Collect the payout.", cat: "fraud", diff: "medium", xp: [22,48], cash: [3000,12000] },
  { name: "Car Insurance Scam", desc: "Crash a junk car and claim full value.", cat: "fraud", diff: "medium", xp: [20,44], cash: [2000,10000] },
  { name: "Romance Scam", desc: "Catfish someone for money online.", cat: "fraud", diff: "medium", xp: [16,38], cash: [1000,6000] },
  { name: "Wire Fraud", desc: "Trick someone into wiring money.", cat: "fraud", diff: "hard", xp: [28,60], cash: [4000,18000] },
  { name: "Money Laundering", desc: "Clean dirty money through a front business.", cat: "fraud", diff: "hard", xp: [32,70], cash: [8000,30000] },
  { name: "Ponzi Scheme", desc: "Build a pyramid of lies. Cash out big.", cat: "fraud", diff: "elite", xp: [50,100], cash: [15000,60000] },
  { name: "Insider Trading", desc: "Use secret info to make millions on stocks.", cat: "fraud", diff: "elite", xp: [55,110], cash: [20000,80000] },
  { name: "Corporate Espionage", desc: "Steal trade secrets from a rival company.", cat: "fraud", diff: "elite", xp: [60,120], cash: [25000,100000] },
  { name: "Ransomware Attack", desc: "Lock their systems. Demand payment.", cat: "fraud", diff: "legendary", xp: [70,140], cash: [30000,120000] },
  { name: "Counterfeit Currency", desc: "Print money. Spend it fast.", cat: "fraud", diff: "hard", xp: [35,75], cash: [6000,25000] },
  { name: "Extortion", desc: "Blackmail someone with leverage.", cat: "fraud", diff: "hard", xp: [30,68], cash: [5000,22000] },
  // Drugs (id 600-799)
  { name: "Street Corner Deal", desc: "Move product on the street corner.", cat: "drugs", diff: "easy", xp: [12,28], cash: [500,2500] },
  { name: "Drug Running", desc: "Run product across town. Fast.", cat: "drugs", diff: "medium", xp: [22,48], cash: [2000,8000] },
  { name: "Manufacturing Operation", desc: "Set up a lab. Cook product.", cat: "drugs", diff: "hard", xp: [35,75], cash: [8000,30000] },
  { name: "Distribution Network", desc: "Build a distribution network across the city.", cat: "drugs", diff: "hard", xp: [40,85], cash: [12000,45000] },
  { name: "Smuggling Ring", desc: "Move product across borders.", cat: "drugs", diff: "elite", xp: [55,110], cash: [20000,75000] },
  { name: "Lab Expansion", desc: "Expand your operation. More product.", cat: "drugs", diff: "hard", xp: [45,90], cash: [15000,55000] },
  { name: "International Supply Chain", desc: "Set up international supply lines.", cat: "drugs", diff: "legendary", xp: [70,140], cash: [35000,130000] },
  { name: "Cartel Partnership", desc: "Partner with a major cartel.", cat: "drugs", diff: "legendary", xp: [80,160], cash: [50000,200000] },
  { name: "Bulk Shipment Interception", desc: "Intercept a rival's bulk shipment.", cat: "drugs", diff: "elite", xp: [50,100], cash: [18000,70000] },
  { name: "Underground Lab", desc: "Hidden lab, maximum production.", cat: "drugs", diff: "elite", xp: [60,120], cash: [25000,95000] },
  // Murder (id 800-999)
  { name: "Street Execution", desc: "Quick hit on the street. In and out.", cat: "murder", diff: "hard", xp: [40,80], cash: [5000,20000] },
  { name: "Contract Kill", desc: "Take a contract. Clean and professional.", cat: "murder", diff: "elite", xp: [60,120], cash: [15000,50000] },
  { name: "Car Bombing", desc: "Plant the device. Wait for the spark.", cat: "murder", diff: "elite", xp: [70,140], cash: [20000,70000] },
  { name: "Poisoning", desc: "Slip something in their drink. Silent.", cat: "murder", diff: "hard", xp: [35,70], cash: [8000,30000] },
  { name: "Drive-By Elimination", desc: "Cruise by. Handle business. Keep moving.", cat: "murder", diff: "hard", xp: [45,90], cash: [10000,40000] },
  { name: "Witness Elimination", desc: "Remove a witness before the trial.", cat: "murder", diff: "elite", xp: [55,110], cash: [12000,45000] },
  { name: "Rival Boss Assassination", desc: "Take out the rival family's boss.", cat: "murder", diff: "legendary", xp: [100,200], cash: [50000,200000] },
  { name: "Retaliation Strike", desc: "Retaliate for a betrayal. Make it hurt.", cat: "murder", diff: "hard", xp: [38,76], cash: [6000,25000] },
  { name: "Clean Up Crew", desc: "Dispose of evidence and witnesses.", cat: "murder", diff: "hard", xp: [32,64], cash: [4000,18000] },
  { name: "Silent Takedown", desc: "No noise. No traces. Gone.", cat: "murder", diff: "elite", xp: [65,130], cash: [18000,65000] },
  // Combat (id 1000-1199)
  { name: "Win a Street Fight", desc: "Challenge someone to a fistfight. Win.", cat: "combat", diff: "easy", xp: [10,25], cash: [200,1000] },
  { name: "Survive an Ambush", desc: "Someone's coming for you. Fight back.", cat: "combat", diff: "medium", xp: [20,45], cash: [500,3000] },
  { name: "Win a Boxing Match", desc: "Go 12 rounds in the underground ring.", cat: "combat", diff: "medium", xp: [25,55], cash: [1000,5000] },
  { name: "Win a Duel", desc: "Challenge a rival to a 1v1 duel.", cat: "combat", diff: "medium", xp: [22,48], cash: [800,4000] },
  { name: "Defend Your Turf", desc: "Defend your territory against invaders.", cat: "combat", diff: "hard", xp: [30,65], cash: [2000,8000] },
  { name: "Win a Faction War", desc: "Lead your crew to victory in faction war.", cat: "combat", diff: "hard", xp: [35,75], cash: [3000,12000] },
  { name: "Kill Streak of 5", desc: "Eliminate 5 targets in a row without dying.", cat: "combat", diff: "elite", xp: [60,120], cash: [10000,40000] },
  { name: "Win a Battle Royale", desc: "Be the last one standing.", cat: "combat", diff: "legendary", xp: [80,160], cash: [15000,60000] },
  { name: "Interrogate a Snitch", desc: "Extract information from a captured rival.", cat: "combat", diff: "medium", xp: [18,40], cash: [500,2500] },
  { name: "Sabotage a Rival", desc: "Destroy a rival's operations.", cat: "combat", diff: "hard", xp: [28,60], cash: [2500,10000] },
  // Gambling (id 1200-1399)
  { name: "Win $10K at Blackjack", desc: "Hit the tables. Walk out $10K richer.", cat: "gambling", diff: "medium", xp: [15,35], cash: [10000,10000] },
  { name: "Hit a Royal Flush", desc: "Get a royal flush at the poker table.", cat: "gambling", diff: "hard", xp: [40,80], cash: [50000,50000] },
  { name: "Win the Lottery", desc: "Buy a ticket and hit the jackpot.", cat: "gambling", diff: "legendary", xp: [80,160], cash: [100000,100000] },
  { name: "Win 10 Consecutive Bets", desc: "Ride a winning streak at the casino.", cat: "gambling", diff: "hard", xp: [35,70], cash: [20000,20000] },
  { name: "Double Your Money", desc: "Double your starting bankroll at the casino.", cat: "gambling", diff: "medium", xp: [20,44], cash: [5000,5000] },
  { name: "Win at Roulette", desc: "Bet on a number. It hits.", cat: "gambling", diff: "medium", xp: [18,40], cash: [3500,3500] },
  { name: "Crack the Jackpot", desc: "Hit the slot machine jackpot.", cat: "gambling", diff: "hard", xp: [30,60], cash: [25000,25000] },
  { name: "Win a Poker Tournament", desc: "Enter and win a high-stakes tournament.", cat: "gambling", diff: "elite", xp: [50,100], cash: [40000,40000] },
  { name: "Beat the House", desc: "Walk away with more than you came with, 5 times.", cat: "gambling", diff: "hard", xp: [32,64], cash: [15000,15000] },
  { name: "Gamble $1M", desc: "Risk it all. Bet $1,000,000 on a single hand.", cat: "gambling", diff: "legendary", xp: [100,200], cash: [200000,200000] },
  // Business (id 1400-1599)
  { name: "Open a Front Business", desc: "Set up a laundromat as a money front.", cat: "business", diff: "easy", xp: [10,22], cash: [500,2000] },
  { name: "Buy a Property", desc: "Purchase your first real estate investment.", cat: "business", diff: "easy", xp: [12,28], cash: [1000,5000] },
  { name: "Establish a Casino", desc: "Open an underground casino.", cat: "business", diff: "hard", xp: [35,75], cash: [10000,40000] },
  { name: "Build a Drug Lab", desc: "Set up a hidden manufacturing lab.", cat: "business", diff: "hard", xp: [30,65], cash: [8000,30000] },
  { name: "Acquire a Rival Business", desc: "Buy out or take over a competitor.", cat: "business", diff: "elite", xp: [50,100], cash: [20000,80000] },
  { name: "Max Out Crypto Mining", desc: "Set up a full crypto mining operation.", cat: "business", diff: "elite", xp: [45,90], cash: [15000,60000] },
  { name: "Build an Empire", desc: "Own 10+ businesses across the city.", cat: "business", diff: "legendary", xp: [80,160], cash: [50000,200000] },
  { name: "Offshore Account", desc: "Move money to an offshore account.", cat: "business", diff: "medium", xp: [18,40], cash: [3000,12000] },
  { name: "Sell a Business", desc: "Flip a business for profit.", cat: "business", diff: "medium", xp: [20,44], cash: [5000,20000] },
  { name: "Monopoly Control", desc: "Own 50% of all businesses in a district.", cat: "business", diff: "legendary", xp: [100,200], cash: [100000,400000] },
  // Social (id 1600-1799)
  { name: "Recruit a Member", desc: "Convince someone to join your crew.", cat: "social", diff: "easy", xp: [8,18], cash: [100,500] },
  { name: "Start a Crew", desc: "Create your own criminal organization.", cat: "social", diff: "medium", xp: [20,44], cash: [1000,5000] },
  { name: "Win a Crew War", desc: "Defeat a rival crew in organized combat.", cat: "social", diff: "hard", xp: [35,75], cash: [5000,20000] },
  { name: "Collect Protection Money", desc: "Collect from all your businesses in a district.", cat: "social", diff: "medium", xp: [15,35], cash: [2000,8000] },
  { name: "Form an Alliance", desc: "Ally with another crew for mutual benefit.", cat: "social", diff: "medium", xp: [18,40], cash: [1500,6000] },
  { name: "Betray an Ally", desc: "Turn on your allies when they least expect it.", cat: "social", diff: "hard", xp: [30,65], cash: [8000,30000] },
  { name: "Become Don", desc: "Rise to the top of your family.", cat: "social", diff: "legendary", xp: [80,160], cash: [30000,120000] },
  { name: "Crew Bank Deposit", desc: "Deposit $100K into the crew bank.", cat: "social", diff: "medium", xp: [12,28], cash: [500,2000] },
  { name: "Host a Meeting", desc: "Gather the bosses for a sit-down.", cat: "social", diff: "hard", xp: [25,55], cash: [3000,12000] },
  { name: "Control Territory", desc: "Take control of 5 territories.", cat: "social", diff: "elite", xp: [55,110], cash: [15000,60000] },
  // Exploration (id 1800-1999)
  { name: "Explore the Slums", desc: "Scout the slums for opportunities.", cat: "exploration", diff: "easy", xp: [5,12], cash: [100,500] },
  { name: "Visit the Docks", desc: "Check out the docks for smuggling routes.", cat: "exploration", diff: "easy", xp: [8,18], cash: [200,800] },
  { name: "Scout the Casino District", desc: "Map out the casino district for future heists.", cat: "exploration", diff: "medium", xp: [15,32], cash: [500,2500] },
  { name: "Infiltrate a Rival Territory", desc: "Sneak into enemy territory. Gather intel.", cat: "exploration", diff: "hard", xp: [25,55], cash: [1500,6000] },
  { name: "Discover a Hidden Safehouse", desc: "Find a secret stash location.", cat: "exploration", diff: "medium", xp: [18,40], cash: [3000,12000] },
  { name: "Map the Underground", desc: "Explore the city's underground tunnel network.", cat: "exploration", diff: "hard", xp: [30,65], cash: [2000,8000] },
  { name: "Find the Black Market", desc: "Locate the hidden black market dealer.", cat: "exploration", diff: "elite", xp: [45,90], cash: [8000,30000] },
  { name: "Explore Every District", desc: "Visit every district in the city.", cat: "exploration", diff: "medium", xp: [20,44], cash: [1000,4000] },
  { name: "Night Patrol", desc: "Patrol the city at night. Handle business.", cat: "exploration", diff: "medium", xp: [16,36], cash: [400,2000] },
  { name: "Ghost Walk", desc: "Move through the city without being detected.", cat: "exploration", diff: "elite", xp: [40,80], cash: [5000,20000] },
  // Collection (id 2000-2199)
  { name: "Collect 5 Weapons", desc: "Acquire 5 different weapons.", cat: "collection", diff: "easy", xp: [10,22], cash: [500,2000] },
  { name: "Build a Weapon Arsenal", desc: "Collect 20 different weapons.", cat: "collection", diff: "hard", xp: [35,75], cash: [5000,20000] },
  { name: "Gather Intel Documents", desc: "Collect 10 intelligence documents.", cat: "collection", diff: "medium", xp: [18,40], cash: [1000,4000] },
  { name: "Collect Rare Items", desc: "Find 5 rare items in the game.", cat: "collection", diff: "hard", xp: [30,65], cash: [3000,12000] },
  { name: "Steal 10 Cars", desc: "Steal 10 vehicles and add them to your garage.", cat: "collection", diff: "hard", xp: [28,60], cash: [4000,16000] },
  { name: "Collect Easter Eggs", desc: "Find 5 Easter eggs during the event.", cat: "collection", diff: "medium", xp: [15,35], cash: [2000,8000] },
  { name: "Full Weapon Cache", desc: "Collect every weapon in the game.", cat: "collection", diff: "legendary", xp: [80,160], cash: [20000,80000] },
  { name: "Stockpile Explosives", desc: "Collect 15 different explosive devices.", cat: "collection", diff: "hard", xp: [32,68], cash: [6000,24000] },
  { name: "Gather Medical Supplies", desc: "Stock up on medical supplies for your crew.", cat: "collection", diff: "easy", xp: [8,18], cash: [300,1200] },
  { name: "Complete a Set", desc: "Collect all items in a category.", cat: "collection", diff: "elite", xp: [50,100], cash: [10000,40000] },
  // Daily Grind (id 2200-2399)
  { name: "Commit 5 Crimes Today", desc: "Do any 5 crimes in one day.", cat: "daily", diff: "easy", xp: [8,18], cash: [200,1000] },
  { name: "Win 3 Fights", desc: "Win 3 fights in a single day.", cat: "daily", diff: "medium", xp: [15,35], cash: [500,2500] },
  { name: "Earn $10K Today", desc: "Make $10,000 in a single day.", cat: "daily", diff: "medium", xp: [20,44], cash: [2000,8000] },
  { name: "Gamble 5 Times", desc: "Place 5 bets at the casino today.", cat: "daily", diff: "easy", xp: [10,22], cash: [300,1500] },
  { name: "Complete a Mission", desc: "Finish any mission today.", cat: "daily", diff: "easy", xp: [8,16], cash: [200,800] },
  { name: "Sell 3 Items", desc: "Sell 3 items from your inventory today.", cat: "daily", diff: "easy", xp: [6,14], cash: [100,500] },
  { name: "Chat with Crew", desc: "Send 5 messages in crew chat.", cat: "daily", diff: "easy", xp: [4,10], cash: [50,200] },
  { name: "Earn $50K Today", desc: "Make $50,000 in a single day.", cat: "daily", diff: "hard", xp: [30,65], cash: [5000,20000] },
  { name: "Commit 20 Crimes", desc: "Do 20 crimes in a single day.", cat: "daily", diff: "hard", xp: [25,55], cash: [3000,12000] },
  { name: "Win Every Gamble", desc: "Win all 10 bets you place today.", cat: "daily", diff: "elite", xp: [50,100], cash: [10000,40000] },
  // Elite (id 2400-2599)
  { name: "Speed Run: $1M", desc: "Earn $1,000,000 as fast as possible.", cat: "elite", diff: "legendary", xp: [150,300], cash: [100000,500000] },
  { name: "No Death Run", desc: "Complete 50 actions without dying.", cat: "elite", diff: "legendary", xp: [120,240], cash: [80000,300000] },
  { name: "Pacifist Crime Spree", desc: "Earn $100K without using violence.", cat: "elite", diff: "hard", xp: [55,110], cash: [30000,120000] },
  { name: "One Hit Kill", desc: "Eliminate a legendary boss in one shot.", cat: "elite", diff: "legendary", xp: [100,200], cash: [50000,200000] },
  { name: "Underground Champion", desc: "Win 20 fights in a row.", cat: "elite", diff: "legendary", xp: [130,260], cash: [75000,300000] },
  { name: "Casino Royalty", desc: "Win $500K at the casino in one session.", cat: "elite", diff: "legendary", xp: [140,280], cash: [200000,800000] },
  { name: "Crime Lord", desc: "Complete 1000 total missions.", cat: "elite", diff: "legendary", xp: [200,400], cash: [500000,2000000] },
  { name: "Ghost", desc: "Complete 50 missions without being wanted.", cat: "elite", diff: "legendary", xp: [110,220], cash: [60000,240000] },
  { name: "Untouchable", desc: "Never get arrested for 100 consecutive crimes.", cat: "elite", diff: "legendary", xp: [160,320], cash: [150000,600000] },
  { name: "Shadow Emperor", desc: "Reach the highest rank in the game.", cat: "elite", diff: "legendary", xp: [250,500], cash: [1000000,5000000] },
];

/**
 * Deterministic seeded PRNG — replaces Math.random() in mission generation so
 * rewards are identical on every render and match what the server pays out.
 */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function generateMission(seed: number, cycle: number = 0) {
  const offset = cycle * 255000;
  const effectiveSeed = seed + offset;
  const tmplIdx = seed % MISSION_TEMPLATES.length;
  const tmpl = MISSION_TEMPLATES[tmplIdx];
  const variation = Math.floor(effectiveSeed / MISSION_TEMPLATES.length) + 1;
  const xpMin = tmpl.xp[0] * Math.ceil(variation / 50);
  const xpMax = tmpl.xp[1] * Math.ceil(variation / 50);
  const cashMin = tmpl.cash[0] * Math.ceil(variation / 30);
  const cashMax = tmpl.cash[1] * Math.ceil(variation / 30);
  // Deterministic seeded PRNG (mulberry32) — same seed = same reward on every
  // render and on the server. (Math.random() here made rewards drift between renders.)
  const xpRand = mulberry32(effectiveSeed * 31 + 1);
  const cashRand = mulberry32(effectiveSeed * 31 + 7);
  const xpReward = Math.floor(xpRand() * (xpMax - xpMin)) + xpMin;
  const cashReward = Math.floor(cashRand() * (cashMax - cashMin)) + cashMin;
  const names = [
    tmpl.name,
    tmpl.name + " II",
    tmpl.name + " III",
    tmpl.name + ": Advanced",
    tmpl.name + ": Expert",
    tmpl.name + ": Master",
    tmpl.name + ": Grandmaster",
    tmpl.name + ": Ultimate",
    tmpl.name + " (Elite)",
    tmpl.name + " (Legendary)",
    tmpl.name + " (Mythic)",
    tmpl.name + " (Godlike)",
    tmpl.name + " (Divine)",
    tmpl.name + " (Eternal)",
    tmpl.name + " (Transcendent)",
  ];
  return {
    id: cycle > 0 ? `mission_c${cycle}_${seed}` : `mission_${seed}`,
    name: names[variation % names.length],
    description: tmpl.desc,
    category: tmpl.cat,
    difficulty: tmpl.diff,
    xpReward,
    cashReward,
    levelRequired: Math.min(1 + Math.floor(variation / 10), 100),
  };
}

/* ═══════════ MISSION CARD ═══════════ */
function MissionCard({ mission, onComplete, isCompleted }: {
  mission: ReturnType<typeof generateMission>;
  onComplete: (m: ReturnType<typeof generateMission>) => void;
  isCompleted: boolean;
}) {
  const diff = DIFFICULTIES.find(d => d.id === mission.difficulty) || DIFFICULTIES[0];
  const cat = CATEGORIES.find(c => c.id === mission.category) || CATEGORIES[0];
  const diffColors: Record<string, string> = {
    easy: "from-green-500/20 to-green-900/10 border-green-500/30",
    medium: "from-yellow-500/20 to-yellow-900/10 border-yellow-500/30",
    hard: "from-orange-500/20 to-orange-900/10 border-orange-500/30",
    elite: "from-red-500/20 to-red-900/10 border-red-500/30",
    legendary: "from-purple-500/20 to-purple-900/10 border-purple-500/30",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer ${isCompleted ? "opacity-40" : ""} bg-gradient-to-br ${diffColors[mission.difficulty] || diffColors.easy}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${mission.difficulty === "legendary" ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" : mission.difficulty === "elite" ? "bg-gradient-to-r from-red-500 to-orange-500" : mission.difficulty === "hard" ? "bg-gradient-to-r from-orange-500 to-yellow-500" : mission.difficulty === "medium" ? "bg-gradient-to-r from-yellow-500 to-amber-500" : "bg-gradient-to-r from-green-500 to-emerald-500"}`} />

      <div className="p-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-base">{cat.icon}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${diff.bg} ${diff.color}`}>{diff.name}</span>
          </div>
          {isCompleted ? (
            <span className="text-green-400 text-sm">✅</span>
          ) : (
            <button onClick={() => onComplete(mission)}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-[10px] font-black hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95">
              DO
            </button>
          )}
        </div>

        {/* Mission name */}
        <div className="text-xs font-black text-slate-100 leading-tight mb-0.5 line-clamp-1">{mission.name}</div>

        {/* Description */}
        <div className="text-[10px] text-slate-400 leading-tight line-clamp-2 mb-1.5">{mission.description}</div>

        {/* Rewards */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-900/30 text-green-400">⚡ {mission.xpReward.toLocaleString()} XP</span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400">💰 ${mission.cashReward.toLocaleString()}</span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500">Lv.{mission.levelRequired}+</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════ MAIN MISSIONS PAGE ═══════════ */
export function MissionsOverviewPage() {
  const player = useQuery(api.game.getPlayer);
  const missionData = useQuery(api.missionSystem.getMissions, { page: 0, pageSize: 100 });
  const completeMission = useMutation(api.missionSystem.completeMission);
  const [tab, setTab] = useState<"active" | "finished">("active");
  const [catFilter, setCatFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 20;
  const TOTAL_MISSIONS = 255000;

  const [cycle, setCycle] = useState(() => {
    try { return parseInt(localStorage.getItem("missionCycle") || "0", 10); } catch { return 0; }
  });

  // Generate missions client-side for display — uses cycle for unlimited regeneration
  const allMissions = useMemo(() => {
    return Array.from({ length: TOTAL_MISSIONS }, (_, i) => generateMission(i, cycle));
  }, [cycle]);

  // Filter missions
  const filteredMissions = useMemo(() => {
    let missions = allMissions;
    if (catFilter !== "all") missions = missions.filter(m => m.category === catFilter);
    if (diffFilter !== "all") missions = missions.filter(m => m.difficulty === diffFilter);
    if (search) {
      const q = search.toLowerCase();
      missions = missions.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return missions;
  }, [allMissions, catFilter, diffFilter, search]);

  const totalCompletedAllTime = useMemo(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("completedMissionIds") || "[]");
      return ids.length;
    } catch { return 0; }
  }, [tab, cycle]);

  const completedIds = useMemo(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("completedMissionIds") || "[]");
      return new Set(ids);
    } catch { return new Set<string>(); }
  }, [tab, cycle]);

  const activeMissions = useMemo(() =>
    filteredMissions.filter(m => !completedIds.has(m.id)),
    [filteredMissions, completedIds]
  );

  const finishedMissions = useMemo(() =>
    filteredMissions.filter(m => completedIds.has(m.id)),
    [filteredMissions, completedIds]
  );

  const displayMissions = tab === "active" ? activeMissions : finishedMissions;
  const pagedMissions = displayMissions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(displayMissions.length / PAGE_SIZE);

  const handleComplete = async (mission: ReturnType<typeof generateMission>) => {
    if (completedIds.has(mission.id)) return;
    setLoading(true);
    try {
      const result: any = await completeMission({
        missionId: mission.id,
        reward: mission.cashReward,
        xpReward: mission.xpReward,
      });
      // Save to localStorage
      const ids = JSON.parse(localStorage.getItem("completedMissionIds") || "[]");
      ids.push(mission.id);
      localStorage.setItem("completedMissionIds", JSON.stringify(ids));
      setMsg(`✅ Mission complete! +$${mission.cashReward.toLocaleString()} +${mission.xpReward} XP`);
      setTimeout(() => setMsg(""), 3000);
      // Force re-render
      setTab(tab);
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Error completing mission"}`);
      setTimeout(() => setMsg(""), 3000);
    }
    setLoading(false);
  };

  const handleClaimAll = async () => {
    // Finished missions are already paid out — Claim All would just re-call the
    // server and throw "Mission already completed!". This is now a no-op guard.
    // Payout already happened at completion time — re-claiming would hit the
    // server's "Mission already completed!" guard. Nothing to do here.
    setMsg(`✅ All ${finishedMissions.length} finished missions were already paid out when completed.`);
    setTimeout(() => setMsg(""), 4000);
  };

  // Auto-advance to the next wave 24/7 — when every mission in the wave is done,
  // the next wave rolls out automatically (in an effect, never during render).
  const allWaveDone = completedIds.size >= TOTAL_MISSIONS;
  useEffect(() => {
    if (!allWaveDone) return;
    const newCycle = cycle + 1;
    try {
      localStorage.setItem("missionCycle", String(newCycle));
      localStorage.removeItem("completedMissionIds");
    } catch {}
    setCycle(newCycle);
  }, [allWaveDone, cycle]);

  const completedCount = completedIds.size;

  // Storyline missions
  const storyMissions = useMemo(() => {
    return generateStorylineMissions(completedIds, (player as any)?.level ?? 1);
  }, [completedIds, player]);

  const activeStoryMissions = useMemo(() =>
    storyMissions.filter(m => !completedIds.has(m.id)),
    [storyMissions, completedIds]
  );

  const finishedStoryMissions = useMemo(() =>
    storyMissions.filter(m => completedIds.has(m.id)),
    [storyMissions, completedIds]
  );

  const [storyTab, setStoryTab] = useState<"active"|"finished">("active");
  const displayStoryMissions = storyTab === "active" ? activeStoryMissions : finishedStoryMissions;

  return (
    <div className="animate-fade-in space-y-4">
      {/* ═══════════ STORYLINE MISSIONS ═══════════ */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h3 className="text-lg font-black text-amber-400">Storyline Missions</h3>
              <p className="text-[10px] text-slate-500">{activeStoryMissions.length} active | {finishedStoryMissions.length} completed | Never-ending stories</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setStoryTab("active")} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${storyTab==="active"?"bg-amber-600 text-black":"bg-slate-800 text-slate-400"}`}>Active</button>
            <button onClick={() => setStoryTab("finished")} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${storyTab==="finished"?"bg-green-600 text-black":"bg-slate-800 text-slate-400"}`}>Done</button>
          </div>
        </div>

        {/* Story Arc Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {displayStoryMissions.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs">
              {storyTab === "active" ? "All storyline missions completed! New cycle starting..." : "No completed storyline missions yet"}
            </div>
          ) : (
            displayStoryMissions.map(m => (
              <div key={m.id} className={`relative overflow-hidden rounded-xl border transition-all ${completedIds.has(m.id) ? "bg-green-900/10 border-green-500/20 opacity-50" : "bg-gradient-to-br from-amber-500/10 to-amber-900/5 border-amber-500/20 hover:border-amber-500/40"}`}>
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-yellow-500" />
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-base">{m.icon}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${m.difficulty==="easy"?"bg-green-900/40 text-green-400":m.difficulty==="medium"?"bg-yellow-900/40 text-yellow-400":m.difficulty==="hard"?"bg-orange-900/40 text-orange-400":"bg-purple-900/40 text-purple-400"}`}>{m.difficulty}</span>
                      <span className="text-[9px] text-slate-500 font-bold">Ch.{m.chapter}/{m.totalChapters}</span>
                    </div>
                    {completedIds.has(m.id) ? (
                      <span className="text-green-400 text-sm">✅</span>
                    ) : (
                      <button onClick={() => handleComplete({id: m.id, name: m.name, description: m.description, category: "story", difficulty: m.difficulty, xpReward: m.xpReward, cashReward: m.cashReward, levelRequired: m.levelRequired})}
                        className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-[10px] font-black hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95">
                        DO
                      </button>
                    )}
                  </div>
                  <div className="text-xs font-black text-slate-100 leading-tight mb-0.5 line-clamp-1">{m.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight line-clamp-1 mb-1">{m.description}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-900/30 text-green-400">⚡ {m.xpReward.toLocaleString()} XP</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400">💰 ${m.cashReward.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Story Progress */}
        <div className="mt-3 pt-3 border-t border-slate-800/50">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STORY_ARCS.map(arc => {
              const arcCompleted = arc.chapters.filter((_, idx) => completedIds.has(`story_${arc.id}_${idx}_cycle${Math.floor(completedIds.size / 80) + 1}`)).length;
              return (
                <div key={arc.id} className="flex flex-col items-center gap-0.5 shrink-0 px-2">
                  <span className="text-lg">{arc.icon}</span>
                  <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{width:`${(arcCompleted/arc.chapters.length)*100}%`}} />
                  </div>
                  <span className="text-[8px] text-slate-500">{arcCompleted}/{arc.chapters.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">📋</span>
        <div>
          <h2 className="text-xl font-black text-amber-400 tracking-tight">Mission Board</h2>
          <p className="text-[10px] text-slate-500">Unlimited missions | Cycle {cycle + 1} | {totalCompletedAllTime.toLocaleString()} total completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mafia-card p-3 rounded-xl">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Overall Progress</span>
          <span>{completedCount.toLocaleString()} / ∞ ({cycle > 0 ? `Cycle ${cycle + 1}` : "First Cycle"})</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all" style={{width:`${(completedCount/TOTAL_MISSIONS)*100}%`}} />
        </div>
      </div>

      {/* Status Message */}
      {msg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-2 rounded-xl bg-amber-900/30 border border-amber-500/30 text-amber-300 text-sm text-center font-bold">
          {msg}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => { setTab("active"); setPage(0); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "active" ? "bg-amber-600/20 border border-amber-500/40 text-amber-300" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>
          📋 Active ({activeMissions.length.toLocaleString()})
        </button>
        <button onClick={() => { setTab("finished"); setPage(0); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "finished" ? "bg-green-600/20 border border-green-500/40 text-green-300" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"}`}>
          ✅ Finished ({finishedMissions.length.toLocaleString()})
        </button>
      </div>

      {/* Claim All Finished Button */}
      {tab === "finished" && finishedMissions.length > 0 && (
        <button onClick={handleClaimAll} disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-black bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-green-900/30 disabled:opacity-50">
          {loading ? "⏳ Claiming..." : `🎉 CLAIM ALL (${finishedMissions.length.toLocaleString()} finished)`}
        </button>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input type="text" placeholder="Search missions..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 min-w-[120px] px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(0); }}
          className="px-2 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-300">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={diffFilter} onChange={e => { setDiffFilter(e.target.value); setPage(0); }}
          className="px-2 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-300">
          <option value="all">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Category Quick Filters */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button onClick={() => { setCatFilter("all"); setPage(0); }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${catFilter === "all" ? "bg-amber-600 text-black" : "bg-slate-800/50 text-slate-400"}`}>
          ALL
        </button>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setCatFilter(c.id); setPage(0); }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${catFilter === c.id ? "bg-amber-600 text-black" : "bg-slate-800/50 text-slate-400"}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Mission List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnimatePresence mode="wait">
          {pagedMissions.length > 0 ? (
            pagedMissions.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                onComplete={handleComplete}
                isCompleted={completedIds.has(m.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              {tab === "finished" ? "No completed missions yet" : "No missions match your filters"}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-30">
            Prev
          </button>
          <span className="text-xs text-slate-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

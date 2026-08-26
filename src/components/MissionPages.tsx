import React, { useState, useMemo } from "react";
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

const DIFFICULTIES = [
  { id: "easy", name: "Easy", color: "text-green-400", bg: "bg-green-900/30" },
  { id: "medium", name: "Medium", color: "text-yellow-400", bg: "bg-yellow-900/30" },
  { id: "hard", name: "Hard", color: "text-orange-400", bg: "bg-orange-900/30" },
  { id: "elite", name: "Elite", color: "text-red-400", bg: "bg-red-900/30" },
  { id: "legendary", name: "Legendary", color: "text-purple-400", bg: "bg-purple-900/30" },
];

/* ═══════════ MISSION GENERATOR ═══════════ */
const MISSION_TEMPLATES: { name: string; desc: string; cat: string; diff: string; xp: [number,number]; cash: [number,number] }[] = [
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

function generateMission(seed: number) {
  const tmplIdx = seed % MISSION_TEMPLATES.length;
  const tmpl = MISSION_TEMPLATES[tmplIdx];
  const variation = Math.floor(seed / MISSION_TEMPLATES.length) + 1;
  const xpMin = tmpl.xp[0] * Math.ceil(variation / 50);
  const xpMax = tmpl.xp[1] * Math.ceil(variation / 50);
  const cashMin = tmpl.cash[0] * Math.ceil(variation / 30);
  const cashMax = tmpl.cash[1] * Math.ceil(variation / 30);
  const xpReward = Math.floor(Math.random() * (xpMax - xpMin)) + xpMin;
  const cashReward = Math.floor(Math.random() * (cashMax - cashMin)) + cashMin;
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
    id: `mission_${seed}`,
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mafia-card rounded-xl p-3 transition-all hover:border-amber-500/30 ${isCompleted ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{cat.icon}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${diff.bg} ${diff.color}`}>{diff.name}</span>
          </div>
          <div className="text-sm font-bold text-slate-200 truncate">{mission.name}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{mission.description}</div>
          <div className="flex gap-2 mt-1.5">
            <span className="text-[10px] text-green-400">+{mission.xpReward.toLocaleString()} XP</span>
            <span className="text-[10px] text-amber-400">+${mission.cashReward.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Lv.{mission.levelRequired}+</span>
          </div>
        </div>
        <div className="shrink-0">
          {isCompleted ? (
            <span className="text-green-500 text-lg">✅</span>
          ) : (
            <button
              onClick={() => onComplete(mission)}
              className="px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-600/30 transition-all whitespace-nowrap"
            >
              DO
            </button>
          )}
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
  const TOTAL_MISSIONS = 5000;

  // Generate all 5000 missions client-side for display
  const allMissions = useMemo(() => {
    return Array.from({ length: TOTAL_MISSIONS }, (_, i) => generateMission(i));
  }, []);

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

  const completedIds = useMemo(() => {
    // Get from localStorage
    try {
      return new Set(JSON.parse(localStorage.getItem("completedMissionIds") || "[]"));
    } catch { return new Set<string>(); }
  }, [tab]);

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

  const completedCount = completedIds.size;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">📋</span>
        <div>
          <h2 className="text-xl font-black text-amber-400 tracking-tight">Mission Board</h2>
          <p className="text-[10px] text-slate-500">{TOTAL_MISSIONS.toLocaleString()} missions | {completedCount.toLocaleString()} completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mafia-card p-3 rounded-xl">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Overall Progress</span>
          <span>{completedCount}/{TOTAL_MISSIONS.toLocaleString()} ({((completedCount/TOTAL_MISSIONS)*100).toFixed(1)}%)</span>
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
      <div className="space-y-2">
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

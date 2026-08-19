export interface Crime {
  id: string;
  name: string;
  description: string;
  reward: number;
  risk: number; // 0-100
  xp: number;
  levelRequired: number;
}

export interface CrimeCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  crimes: Crime[];
}

export const crimeCategories: CrimeCategory[] = [
  {
    id: "heists",
    name: "Heists & Robberies",
    icon: "💰",
    description: "High-stakes robberies and heists for maximum profit",
    crimes: [
      { id: "bank_vault", name: "Bank Vault Heist", description: "Coordinate with crew to rob a bank vault. Requires 3+ members.", reward: 25000, risk: 85, xp: 150, levelRequired: 15 },
      { id: "armored_car", name: "Armored Car Robbery", description: "Ambush and loot cash transport vehicles on the highway.", reward: 15000, risk: 70, xp: 100, levelRequired: 10 },
      { id: "jewelry_store", name: "Jewelry Store Heist", description: "Smash-and-grab at a high-end jewelry store.", reward: 8000, risk: 55, xp: 75, levelRequired: 5 },
      { id: "casino_heist", name: "Casino Heist", description: "Infiltrate the casino and loot the vault.", reward: 35000, risk: 90, xp: 200, levelRequired: 20 },
      { id: "art_gallery", name: "Art Gallery Theft", description: "Steal priceless artwork to sell on the black market.", reward: 12000, risk: 60, xp: 80, levelRequired: 8 },
      { id: "museum_theft", name: "Museum Artifact Theft", description: "Steal antiquities and sell them to private collectors.", reward: 18000, risk: 65, xp: 120, levelRequired: 12 },
      { id: "power_plant", name: "Power Plant Sabotage", description: "Cause a blackout to loot the surrounding area.", reward: 10000, risk: 50, xp: 60, levelRequired: 7 },
      { id: "warehouse_raid", name: "Warehouse Raid", description: "Steal inventory from a storage warehouse.", reward: 6000, risk: 40, xp: 50, levelRequired: 4 },
      { id: "yacht_theft", name: "Luxury Yacht Theft", description: "Steal a high-value yacht from the marina.", reward: 20000, risk: 75, xp: 130, levelRequired: 14 },
      { id: "atm_bombing", name: "ATM Bombing", description: "Blow up ATMs for quick cash grabs.", reward: 3000, risk: 45, xp: 40, levelRequired: 3 },
      { id: "train_robbery", name: "Train Robbery", description: "Ambush cargo trains carrying valuables.", reward: 22000, risk: 80, xp: 160, levelRequired: 16 },
      { id: "diamond_exchange", name: "Diamond Exchange Heist", description: "High-risk raid on a diamond trading center.", reward: 40000, risk: 95, xp: 250, levelRequired: 25 },
      { id: "drug_lab_raid", name: "Drug Lab Raid", description: "Steal from a rival drug operation's lab.", reward: 14000, risk: 60, xp: 90, levelRequired: 11 },
      { id: "cargo_hijack", name: "Cargo Ship Hijacking", description: "Hijack containers at the port dock.", reward: 30000, risk: 85, xp: 180, levelRequired: 18 },
      { id: "luxury_car", name: "Luxury Car Theft", description: "Steal high-end vehicles for black market sales.", reward: 9000, risk: 50, xp: 70, levelRequired: 6 },
    ],
  },
  {
    id: "business",
    name: "Criminal Businesses",
    icon: "🏪",
    description: "Run illegal operations for steady income",
    crimes: [
      { id: "money_launder", name: "Money Laundering Service", description: "Clean dirty money for other criminals at a fee.", reward: 5000, risk: 30, xp: 40, levelRequired: 5 },
      { id: "gambling_den", name: "Underground Gambling Den", description: "Run an illegal casino in a hidden location.", reward: 8000, risk: 35, xp: 50, levelRequired: 7 },
      { id: "protection", name: "Protection Racket", description: "Extort local businesses for weekly payments.", reward: 4000, risk: 25, xp: 35, levelRequired: 4 },
      { id: "loan_shark", name: "Loan Sharking Operation", description: "Lend money at high interest rates to desperate people.", reward: 6000, risk: 20, xp: 30, levelRequired: 3 },
      { id: "counterfeit", name: "Counterfeiting Ring", description: "Print and distribute fake currency.", reward: 10000, risk: 40, xp: 60, levelRequired: 8 },
      { id: "smuggling", name: "Smuggling Network", description: "Move contraband across borders undetected.", reward: 12000, risk: 45, xp: 70, levelRequired: 9 },
      { id: "bootleg", name: "Bootleg Alcohol Operation", description: "Produce and sell illegal moonshine.", reward: 3500, risk: 20, xp: 25, levelRequired: 2 },
      { id: "fight_ring", name: "Underground Fighting Ring", description: "Host illegal boxing matches and take bets.", reward: 7000, risk: 30, xp: 45, levelRequired: 6 },
      { id: "prostitution", name: "Prostitution Ring", description: "Manage workers in the red light district.", reward: 9000, risk: 35, xp: 55, levelRequired: 7 },
      { id: "piracy", name: "Piracy Operation", description: "Hijack and resell digital content and media.", reward: 4500, risk: 15, xp: 20, levelRequired: 2 },
      { id: "identity_theft", name: "Identity Theft Operation", description: "Steal and sell personal identities on the dark web.", reward: 11000, risk: 40, xp: 65, levelRequired: 9 },
      { id: "chop_shop", name: "Car Chop Shop", description: "Steal and dismantle vehicles for parts.", reward: 5500, risk: 30, xp: 40, levelRequired: 5 },
      { id: "arms_deal", name: "Illegal Arms Dealing", description: "Buy and sell weapons on the black market.", reward: 15000, risk: 50, xp: 80, levelRequired: 12 },
      { id: "workers", name: "Human Trafficking Ring", description: "Recruit workers for underground operations.", reward: 8000, risk: 45, xp: 60, levelRequired: 10 },
      { id: "theft_ring", name: "Organized Theft Ring", description: "Coordinate shoplifting crews across the city.", reward: 4000, risk: 25, xp: 30, levelRequired: 3 },
    ],
  },
  {
    id: "espionage",
    name: "Espionage & Intelligence",
    icon: "🕵️",
    description: "Gather intel, spy on rivals, and manipulate information",
    crimes: [
      { id: "surveillance", name: "Spy Camera Surveillance", description: "Record targets secretly for blackmail material.", reward: 3000, risk: 15, xp: 25, levelRequired: 3 },
      { id: "wiretap", name: "Wiretapping", description: "Listen to conversations of rival bosses.", reward: 5000, risk: 25, xp: 40, levelRequired: 5 },
      { id: "hack_security", name: "Hack Security Systems", description: "Bypass alarms and cameras before a heist.", reward: 4000, risk: 20, xp: 35, levelRequired: 4 },
      { id: "bribe_guards", name: "Bribe Guards", description: "Pay security guards to look the other way.", reward: 2000, risk: 10, xp: 15, levelRequired: 2 },
      { id: "plant_evidence", name: "Plant Evidence", description: "Frame your rivals with fake evidence.", reward: 6000, risk: 30, xp: 45, levelRequired: 6 },
      { id: "bribe_politicians", name: "Bribe Politicians", description: "Gain political influence through corruption.", reward: 10000, risk: 35, xp: 60, levelRequired: 10 },
      { id: "bribe_cops", name: "Bribe Police Officers", description: "Pay off cops to avoid arrest and get intel.", reward: 4500, risk: 25, xp: 35, levelRequired: 5 },
      { id: "infiltrate", name: "Infiltrate Rival Family", description: "Become a mole inside a rival crime family.", reward: 8000, risk: 40, xp: 55, levelRequired: 8 },
      { id: "steal_docs", name: "Steal Classified Documents", description: "Steal secret files and sell to highest bidder.", reward: 7000, risk: 35, xp: 50, levelRequired: 7 },
      { id: "blackmail", name: "Blackmail Operations", description: "Force compliance through blackmail material.", reward: 6500, risk: 25, xp: 40, levelRequired: 6 },
      { id: "decoy", name: "Set Up Decoy Operations", description: "Create diversions to distract police.", reward: 3000, risk: 15, xp: 20, levelRequired: 3 },
      { id: "fake_id", name: "Create Fake Identities", description: "Generate new personas for undercover work.", reward: 2500, risk: 10, xp: 15, levelRequired: 2 },
      { id: "front_business", name: "Establish Front Businesses", description: "Set up legitimate fronts for illegal operations.", reward: 5000, risk: 20, xp: 30, levelRequired: 5 },
      { id: "monitor_cops", name: "Monitor Law Enforcement", description: "Track police movements and patrol routes.", reward: 3500, risk: 20, xp: 25, levelRequired: 4 },
      { id: "intercept_comms", name: "Intercept Communications", description: "Read encrypted messages between rivals.", reward: 5500, risk: 30, xp: 40, levelRequired: 6 },
    ],
  },
  {
    id: "enforcement",
    name: "Enforcement & Violence",
    icon: "⚔️",
    description: "Use force and intimidation to achieve your goals",
    crimes: [
      { id: "arson_fraud", name: "Arson for Insurance Fraud", description: "Burn buildings for insurance payouts.", reward: 12000, risk: 55, xp: 80, levelRequired: 8 },
      { id: "witness_intimidate", name: "Witness Intimidation", description: "Scare away witnesses from testifying.", reward: 4000, risk: 20, xp: 30, levelRequired: 4 },
      { id: "contract_kill", name: "Contract Killing", description: "Accept hit jobs to eliminate targets.", reward: 20000, risk: 70, xp: 120, levelRequired: 15 },
      { id: "driveby", name: "Drive-By Shooting", description: "Intimidate rivals with drive-by attacks.", reward: 3000, risk: 40, xp: 35, levelRequired: 5 },
      { id: "car_bomb", name: "Car Bombing", description: "Eliminate targets with vehicle explosives.", reward: 15000, risk: 65, xp: 100, levelRequired: 12 },
      { id: "kidnapping", name: "Kidnapping for Ransom", description: "Hold targets for ransom money.", reward: 18000, risk: 60, xp: 110, levelRequired: 13 },
      { id: "hostage", name: "Bank Robbery with Hostages", description: "High-stakes heist with hostage situation.", reward: 30000, risk: 90, xp: 180, levelRequired: 20 },
      { id: "extortion", name: "Extortion Through Violence", description: "Threaten and beat people for money.", reward: 5000, risk: 30, xp: 40, levelRequired: 5 },
      { id: "debt_collect", name: "Debt Collection Enforcement", description: "Collect debts by force from delinquents.", reward: 3500, risk: 25, xp: 30, levelRequired: 3 },
      { id: "gang_war", name: "Gang Warfare", description: "Launch attacks on rival gang territories.", reward: 8000, risk: 50, xp: 70, levelRequired: 10 },
      { id: "street_fight", name: "Street Fight Club", description: "Participate in underground boxing matches.", reward: 4000, risk: 35, xp: 45, levelRequired: 4 },
      { id: "dog_fight", name: "Dog Fighting Ring", description: "Organize illegal dog fights for profit.", reward: 6000, risk: 30, xp: 40, levelRequired: 6 },
      { id: "cockfight", name: "Cockfighting", description: "Run illegal bird fights for gambling revenue.", reward: 3000, risk: 20, xp: 25, levelRequired: 3 },
      { id: "arson_revenge", name: "Arson for Revenge", description: "Burn rival properties to send a message.", reward: 5000, risk: 40, xp: 50, levelRequired: 7 },
      { id: "sabotage", name: "Sabotage Operations", description: "Damage rival equipment and infrastructure.", reward: 4500, risk: 30, xp: 35, levelRequired: 5 },
    ],
  },
  {
    id: "financial",
    name: "Financial Crimes",
    icon: "💸",
    description: "Manipulate money and financial systems",
    crimes: [
      { id: "ponzi", name: "Ponzi Scheme", description: "Run a pyramid investment fraud operation.", reward: 25000, risk: 50, xp: 100, levelRequired: 12 },
      { id: "insurance_fraud", name: "Insurance Fraud", description: "Stage fake accidents for insurance payouts.", reward: 8000, risk: 35, xp: 55, levelRequired: 6 },
      { id: "tax_evasion", name: "Tax Evasion", description: "Hide income from the government.", reward: 10000, risk: 30, xp: 50, levelRequired: 7 },
      { id: "embezzle", name: "Embezzlement", description: "Steal from your employer's accounts.", reward: 12000, risk: 40, xp: 65, levelRequired: 8 },
      { id: "insider_trade", name: "Insider Trading", description: "Manipulate stock market with insider info.", reward: 15000, risk: 45, xp: 80, levelRequired: 10 },
      { id: "credit_card", name: "Credit Card Fraud", description: "Steal and use credit card information.", reward: 6000, risk: 25, xp: 35, levelRequired: 4 },
      { id: "bank_fraud", name: "Bank Fraud", description: "Manipulate bank accounts for profit.", reward: 9000, risk: 35, xp: 55, levelRequired: 7 },
      { id: "check_forgery", name: "Check Forgery", description: "Forge signatures on checks.", reward: 4000, risk: 20, xp: 25, levelRequired: 3 },
      { id: "wire_fraud", name: "Wire Fraud", description: "Electronic scams across networks.", reward: 7000, risk: 30, xp: 45, levelRequired: 5 },
      { id: "mail_fraud", name: "Mail Fraud", description: "Run postal scams and fake lotteries.", reward: 3500, risk: 15, xp: 20, levelRequired: 2 },
      { id: "real_estate_fraud", name: "Real Estate Fraud", description: "Property scams and title manipulation.", reward: 11000, risk: 35, xp: 60, levelRequired: 8 },
      { id: "crypto_scam", name: "Cryptocurrency Scam", description: "Launch fake crypto projects to steal funds.", reward: 20000, risk: 40, xp: 90, levelRequired: 11 },
      { id: "insurance_ring", name: "Insurance Fraud Ring", description: "Coordinate fake claims across multiple people.", reward: 14000, risk: 45, xp: 75, levelRequired: 9 },
      { id: "crypto_launder", name: "Money Laundering Through Crypto", description: "Clean dirty money using blockchain.", reward: 8000, risk: 30, xp: 50, levelRequired: 7 },
      { id: "offshore", name: "Offshore Account Hiding", description: "Hide money in international banks.", reward: 6000, risk: 25, xp: 35, levelRequired: 5 },
    ],
  },
  {
    id: "transport",
    name: "Illegal Transport",
    icon: "🚗",
    description: "Smuggle goods and move contraband across borders",
    crimes: [
      { id: "car_theft_ring", name: "Car Theft Ring", description: "Steal and sell vehicles through a network.", reward: 7000, risk: 35, xp: 50, levelRequired: 5 },
      { id: "smuggle_cars", name: "Smuggling Vehicles", description: "Move stolen cars across borders.", reward: 12000, risk: 45, xp: 70, levelRequired: 8 },
      { id: "cargo_theft", name: "Cargo Theft", description: "Hijack truck shipments on highways.", reward: 9000, risk: 40, xp: 60, levelRequired: 6 },
      { id: "drone_smuggle", name: "Drone Smuggling", description: "Use drones to transport contraband.", reward: 5000, risk: 25, xp: 35, levelRequired: 4 },
      { id: "tunnel", name: "Tunnel Construction", description: "Build underground smuggling routes.", reward: 15000, risk: 35, xp: 80, levelRequired: 10 },
      { id: "boat_smuggle", name: "Boat Smuggling", description: "Maritime transport of illegal goods.", reward: 11000, risk: 40, xp: 65, levelRequired: 7 },
      { id: "train_theft", name: "Train Car Theft", description: "Rob train cargo containers.", reward: 10000, risk: 45, xp: 70, levelRequired: 8 },
      { id: "air_cargo", name: "Air Cargo Theft", description: "Hijack plane shipments at the airport.", reward: 18000, risk: 60, xp: 100, levelRequired: 12 },
      { id: "motorcycle", name: "Motorcycle Courier", description: "Quick delivery of contraband on bikes.", reward: 3000, risk: 20, xp: 25, levelRequired: 3 },
      { id: "underground_rail", name: "Underground Railroad", description: "Secret transport network for fugitives.", reward: 8000, risk: 30, xp: 45, levelRequired: 6 },
    ],
  },
  {
    id: "territory",
    name: "Territory Control",
    icon: "🌆",
    description: "Claim and control territories for passive income",
    crimes: [
      { id: "street_corner", name: "Street Corner Control", description: "Claim drug spots for steady income.", reward: 4000, risk: 30, xp: 35, levelRequired: 4 },
      { id: "neighborhood", name: "Neighborhood Extortion", description: "Control and tax local neighborhoods.", reward: 6000, risk: 25, xp: 40, levelRequired: 5 },
      { id: "port_control", name: "Port Control", description: "Dominate shipping operations at the docks.", reward: 12000, risk: 45, xp: 70, levelRequired: 9 },
      { id: "downtown", name: "Downtown Business District", description: "Run the city center's criminal operations.", reward: 10000, risk: 40, xp: 60, levelRequired: 8 },
      { id: "underground_bunker", name: "Underground Bunker", description: "Establish a secret operations base.", reward: 8000, risk: 20, xp: 50, levelRequired: 7 },
    ],
  },
];

export function getCrimeTypeColor(risk: number): string {
  if (risk < 30) return "text-green-400";
  if (risk < 50) return "text-yellow-400";
  if (risk < 70) return "text-orange-400";
  return "text-red-400";
}

export function getCrimeTypeBg(risk: number): string {
  if (risk < 30) return "bg-green-950/30 border-green-800/50";
  if (risk < 50) return "bg-yellow-950/30 border-yellow-800/50";
  if (risk < 70) return "bg-orange-950/30 border-orange-800/50";
  return "bg-red-950/30 border-red-800/50";
}

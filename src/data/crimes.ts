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
  // ═══════════════════════════════════════════
  // 🔪 STREET CRIMES — Available from Level 1
  // ═══════════════════════════════════════════
  {
    id: "street",
    name: "Street Crimes",
    icon: "🔪",
    description: "Basic street-level crimes open from your first day on the block",
    crimes: [
      { id: "pickpocket", name: "Pickpocketing", description: "Lift wallets from unsuspecting pedestrians.", reward: 200, risk: 10, xp: 25, levelRequired: 35 },
      { id: "mugging", name: "Street Mugging", description: "Confront pedestrians and take their cash.", reward: 400, risk: 20, xp: 25, levelRequired: 35 },
      { id: "shoplift", name: "Shoplifting", description: "Steal merchandise from retail stores.", reward: 300, risk: 15, xp: 25, levelRequired: 35 },
      { id: "bicycle_theft", name: "Bicycle Theft", description: "Swipe unlocked bikes from the sidewalk.", reward: 150, risk: 8, xp: 25, levelRequired: 35 },
      { id: "purse_snatch", name: "Purse Snatching", description: "Grab a bag and run.", reward: 350, risk: 18, xp: 25, levelRequired: 35 },
      { id: "car_breakin", name: "Car Break-In", description: "Smash a car window and grab valuables.", reward: 500, risk: 25, xp: 25, levelRequired: 35 },
      { id: "drug_deal_skip", name: "Drug Deal Gone Wrong", description: "Rip off a small-time dealer and run.", reward: 600, risk: 30, xp: 25, levelRequired: 35 },
      { id: "phone_theft", name: "Phone Snatching", description: "Grab a phone from someone's hand and bolt.", reward: 250, risk: 12, xp: 25, levelRequired: 35 },
      { id: "garbage_scavenge", name: "Garbage Scavenging", description: "Dig through trash for sellable items.", reward: 100, risk: 3, xp: 25, levelRequired: 35 },
      { id: "sneak_bus", name: "Sneak onto the Bus", description: "Ride public transit without paying.", reward: 50, risk: 5, xp: 25, levelRequired: 35 },
      { id: "panhandle_hustle", name: "Panhandle Hustle", description: "Work the corner with a sob story.", reward: 180, risk: 2, xp: 25, levelRequired: 35 },
      { id: "petty_vandalism", name: "Petty Vandalism", description: "Tag walls and smash mailboxes for thrills.", reward: 120, risk: 10, xp: 25, levelRequired: 35 },
      { id: "dumpster_dive", name: "Dumpster Diving", description: "Find valuables thrown out by businesses.", reward: 80, risk: 2, xp: 25, levelRequired: 35 },
      { id: "ticket_scalp", name: "Ticket Scalping", description: "Buy event tickets and resell at markup.", reward: 450, risk: 10, xp: 25, levelRequired: 35 },
      { id: "scam_call", name: "Scam Phone Call", description: "Run a quick phone scam on mark.", reward: 300, risk: 8, xp: 25, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🔐 HEISTS & ROBBERIES (25 crimes)
  // ═══════════════════════════════════════════
  {
    id: "heists",
    name: "Heists & Robberies",
    icon: "💰",
    description: "High-stakes robberies and heists for maximum profit",
    crimes: [
      { id: "bank_vault", name: "Bank Vault Heist", description: "Coordinate with crew to rob a bank vault.", reward: 25000, risk: 85, xp: 150, levelRequired: 35 },
      { id: "armored_car", name: "Armored Car Robbery", description: "Ambush and loot cash transport vehicles.", reward: 15000, risk: 70, xp: 100, levelRequired: 35 },
      { id: "jewelry_store", name: "Jewelry Store Heist", description: "Smash-and-grab at a high-end jewelry store.", reward: 8000, risk: 55, xp: 75, levelRequired: 35 },
      { id: "casino_heist", name: "Casino Heist", description: "Infiltrate the casino and loot the vault.", reward: 35000, risk: 90, xp: 200, levelRequired: 35 },
      { id: "art_gallery", name: "Art Gallery Theft", description: "Steal priceless artwork to sell on the black market.", reward: 12000, risk: 60, xp: 80, levelRequired: 35 },
      { id: "museum_theft", name: "Museum Artifact Theft", description: "Steal antiquities and sell to private collectors.", reward: 18000, risk: 65, xp: 120, levelRequired: 35 },
      { id: "power_plant", name: "Power Plant Sabotage", description: "Cause a blackout to loot the surrounding area.", reward: 10000, risk: 50, xp: 60, levelRequired: 35 },
      { id: "warehouse_raid", name: "Warehouse Raid", description: "Steal inventory from a storage warehouse.", reward: 6000, risk: 40, xp: 50, levelRequired: 35 },
      { id: "yacht_theft", name: "Luxury Yacht Theft", description: "Steal a high-value yacht from the marina.", reward: 20000, risk: 75, xp: 130, levelRequired: 35 },
      { id: "atm_bombing", name: "ATM Bombing", description: "Blow up ATMs for quick cash grabs.", reward: 3000, risk: 45, xp: 40, levelRequired: 35 },
      { id: "train_robbery", name: "Train Robbery", description: "Ambush cargo trains carrying valuables.", reward: 22000, risk: 80, xp: 160, levelRequired: 35 },
      { id: "diamond_exchange", name: "Diamond Exchange Heist", description: "High-risk raid on a diamond trading center.", reward: 40000, risk: 95, xp: 250, levelRequired: 35 },
      { id: "drug_lab_raid", name: "Drug Lab Raid", description: "Steal from a rival drug operation's lab.", reward: 14000, risk: 60, xp: 90, levelRequired: 35 },
      { id: "cargo_hijack", name: "Cargo Ship Hijacking", description: "Hijack containers at the port dock.", reward: 30000, risk: 85, xp: 180, levelRequired: 35 },
      { id: "luxury_car", name: "Luxury Car Theft", description: "Steal high-end vehicles for black market sales.", reward: 9000, risk: 50, xp: 70, levelRequired: 35 },
      { id: "convenience_store", name: "Convenience Store Robbery", description: "Quick cash grab at a local store.", reward: 1500, risk: 25, xp: 25, levelRequired: 35 },
      { id: "gas_station", name: "Gas Station Holdup", description: "Rob a gas station at closing time.", reward: 2000, risk: 30, xp: 25, levelRequired: 35 },
      { id: "pharmacy_robbery", name: "Pharmacy Robbery", description: "Steal valuable prescription drugs.", reward: 4500, risk: 35, xp: 40, levelRequired: 35 },
      { id: "electronics_heist", name: "Electronics Store Heist", description: "Steal high-value electronics for resale.", reward: 5500, risk: 40, xp: 45, levelRequired: 35 },
      { id: "pawn_shop", name: "Pawn Shop Robbery", description: "Hit a pawn shop for its inventory.", reward: 3500, risk: 30, xp: 30, levelRequired: 35 },
      { id: "construction_theft", name: "Construction Site Theft", description: "Steal materials from active construction sites.", reward: 2500, risk: 20, xp: 25, levelRequired: 35 },
      { id: "church_theft", name: "Church Donation Theft", description: "Steal from church donation boxes.", reward: 1000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "charity_embezzle", name: "Charity Fund Embezzlement", description: "Skim funds from charity organizations.", reward: 8000, risk: 25, xp: 40, levelRequired: 35 },
      { id: "school_theft", name: "School Fundraiser Theft", description: "Steal from school fundraising events.", reward: 1500, risk: 15, xp: 25, levelRequired: 35 },
      { id: "hospital_theft", name: "Hospital Supply Theft", description: "Steal medical supplies for black market.", reward: 7000, risk: 30, xp: 50, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🏪 CRIMINAL BUSINESSES (15 crimes)
  // ═══════════════════════════════════════════
  {
    id: "business",
    name: "Criminal Businesses",
    icon: "🏪",
    description: "Run illegal operations for steady income",
    crimes: [
      { id: "money_launder", name: "Money Laundering Service", description: "Clean dirty money for other criminals at a fee.", reward: 5000, risk: 30, xp: 40, levelRequired: 35 },
      { id: "gambling_den", name: "Underground Gambling Den", description: "Run an illegal casino in a hidden location.", reward: 8000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "protection", name: "Protection Racket", description: "Extort local businesses for weekly payments.", reward: 4000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "loan_shark", name: "Loan Sharking Operation", description: "Lend money at high interest rates.", reward: 6000, risk: 20, xp: 30, levelRequired: 35 },
      { id: "counterfeit", name: "Counterfeiting Ring", description: "Print and distribute fake currency.", reward: 10000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "smuggling_net", name: "Smuggling Network", description: "Move contraband across borders undetected.", reward: 12000, risk: 45, xp: 70, levelRequired: 35 },
      { id: "bootleg", name: "Bootleg Alcohol Operation", description: "Produce and sell illegal moonshine.", reward: 3500, risk: 20, xp: 25, levelRequired: 35 },
      { id: "fight_ring", name: "Underground Fighting Ring", description: "Host illegal boxing matches and take bets.", reward: 7000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "prostitution", name: "Prostitution Ring", description: "Manage workers in the red light district.", reward: 9000, risk: 35, xp: 55, levelRequired: 35 },
      { id: "piracy", name: "Piracy Operation", description: "Hijack and resell digital content and media.", reward: 4500, risk: 15, xp: 25, levelRequired: 35 },
      { id: "identity_theft_op", name: "Identity Theft Operation", description: "Steal and sell personal identities on the dark web.", reward: 11000, risk: 40, xp: 65, levelRequired: 35 },
      { id: "chop_shop", name: "Car Chop Shop", description: "Steal and dismantle vehicles for parts.", reward: 5500, risk: 30, xp: 40, levelRequired: 35 },
      { id: "arms_deal", name: "Illegal Arms Dealing", description: "Buy and sell weapons on the black market.", reward: 15000, risk: 50, xp: 80, levelRequired: 35 },
      { id: "workers", name: "Human Trafficking Ring", description: "Recruit workers for underground operations.", reward: 8000, risk: 45, xp: 60, levelRequired: 35 },
      { id: "theft_ring", name: "Organized Theft Ring", description: "Coordinate shoplifting crews across the city.", reward: 4000, risk: 25, xp: 30, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🕵️ ESPIONAGE & INTELLIGENCE (15 crimes)
  // ═══════════════════════════════════════════
  {
    id: "espionage",
    name: "Espionage & Intelligence",
    icon: "🕵️",
    description: "Gather intel, spy on rivals, and manipulate information",
    crimes: [
      { id: "surveillance", name: "Spy Camera Surveillance", description: "Record targets secretly for blackmail.", reward: 3000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "wiretap", name: "Wiretapping", description: "Listen to conversations of rival bosses.", reward: 5000, risk: 25, xp: 40, levelRequired: 35 },
      { id: "hack_security", name: "Hack Security Systems", description: "Bypass alarms and cameras before a heist.", reward: 4000, risk: 20, xp: 35, levelRequired: 35 },
      { id: "bribe_guards", name: "Bribe Guards", description: "Pay security guards to look the other way.", reward: 2000, risk: 10, xp: 25, levelRequired: 35 },
      { id: "plant_evidence", name: "Plant Evidence", description: "Frame your rivals with fake evidence.", reward: 6000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "bribe_politicians", name: "Bribe Politicians", description: "Gain political influence through corruption.", reward: 10000, risk: 35, xp: 60, levelRequired: 35 },
      { id: "bribe_cops", name: "Bribe Police Officers", description: "Pay off cops to avoid arrest and get intel.", reward: 4500, risk: 25, xp: 35, levelRequired: 35 },
      { id: "infiltrate", name: "Infiltrate Rival Family", description: "Become a mole inside a rival crime family.", reward: 8000, risk: 40, xp: 55, levelRequired: 35 },
      { id: "steal_docs", name: "Steal Classified Documents", description: "Steal secret files and sell to highest bidder.", reward: 7000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "blackmail", name: "Blackmail Operations", description: "Force compliance through blackmail material.", reward: 6500, risk: 25, xp: 40, levelRequired: 35 },
      { id: "decoy", name: "Set Up Decoy Operations", description: "Create diversions to distract police.", reward: 3000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "fake_id", name: "Create Fake Identities", description: "Generate new personas for undercover work.", reward: 2500, risk: 10, xp: 25, levelRequired: 35 },
      { id: "front_business", name: "Establish Front Businesses", description: "Set up legitimate fronts for illegal operations.", reward: 5000, risk: 20, xp: 30, levelRequired: 35 },
      { id: "monitor_cops", name: "Monitor Law Enforcement", description: "Track police movements and patrol routes.", reward: 3500, risk: 20, xp: 25, levelRequired: 35 },
      { id: "intercept_comms", name: "Intercept Communications", description: "Read encrypted messages between rivals.", reward: 5500, risk: 30, xp: 40, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // ⚔️ ENFORCEMENT & VIOLENCE (15 crimes)
  // ═══════════════════════════════════════════
  {
    id: "enforcement",
    name: "Enforcement & Violence",
    icon: "⚔️",
    description: "Use force and intimidation to achieve your goals",
    crimes: [
      { id: "arson_fraud", name: "Arson for Insurance Fraud", description: "Burn buildings for insurance payouts.", reward: 12000, risk: 55, xp: 80, levelRequired: 35 },
      { id: "witness_intimidate", name: "Witness Intimidation", description: "Scare away witnesses from testifying.", reward: 4000, risk: 20, xp: 30, levelRequired: 35 },
      { id: "contract_kill", name: "Contract Killing", description: "Accept hit jobs to eliminate targets.", reward: 20000, risk: 70, xp: 120, levelRequired: 35 },
      { id: "driveby", name: "Drive-By Shooting", description: "Intimidate rivals with drive-by attacks.", reward: 3000, risk: 40, xp: 35, levelRequired: 35 },
      { id: "car_bomb", name: "Car Bombing", description: "Eliminate targets with vehicle explosives.", reward: 15000, risk: 65, xp: 100, levelRequired: 35 },
      { id: "kidnapping", name: "Kidnapping for Ransom", description: "Hold targets for ransom money.", reward: 18000, risk: 60, xp: 110, levelRequired: 35 },
      { id: "hostage", name: "Bank Robbery with Hostages", description: "High-stakes heist with hostage situation.", reward: 30000, risk: 90, xp: 180, levelRequired: 35 },
      { id: "extortion", name: "Extortion Through Violence", description: "Threaten and beat people for money.", reward: 5000, risk: 30, xp: 40, levelRequired: 35 },
      { id: "debt_collect", name: "Debt Collection Enforcement", description: "Collect debts by force from delinquents.", reward: 3500, risk: 25, xp: 30, levelRequired: 35 },
      { id: "gang_war", name: "Gang Warfare", description: "Launch attacks on rival gang territories.", reward: 8000, risk: 50, xp: 70, levelRequired: 35 },
      { id: "street_fight", name: "Street Fight Club", description: "Participate in underground boxing matches.", reward: 4000, risk: 35, xp: 45, levelRequired: 35 },
      { id: "dog_fight", name: "Dog Fighting Ring", description: "Organize illegal dog fights for profit.", reward: 6000, risk: 30, xp: 40, levelRequired: 35 },
      { id: "cockfight", name: "Cockfighting", description: "Run illegal bird fights for gambling revenue.", reward: 3000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "arson_revenge", name: "Arson for Revenge", description: "Burn rival properties to send a message.", reward: 5000, risk: 40, xp: 50, levelRequired: 35 },
      { id: "sabotage", name: "Sabotage Operations", description: "Damage rival equipment and infrastructure.", reward: 4500, risk: 30, xp: 35, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 💸 FINANCIAL CRIMES (15 crimes)
  // ═══════════════════════════════════════════
  {
    id: "financial",
    name: "Financial Crimes",
    icon: "💸",
    description: "Manipulate money and financial systems",
    crimes: [
      { id: "ponzi", name: "Ponzi Scheme", description: "Run a pyramid investment fraud operation.", reward: 25000, risk: 50, xp: 100, levelRequired: 35 },
      { id: "insurance_fraud", name: "Insurance Fraud", description: "Stage fake accidents for insurance payouts.", reward: 8000, risk: 35, xp: 55, levelRequired: 35 },
      { id: "tax_evasion", name: "Tax Evasion", description: "Hide income from the government.", reward: 10000, risk: 30, xp: 50, levelRequired: 35 },
      { id: "embezzle", name: "Embezzlement", description: "Steal from your employer's accounts.", reward: 12000, risk: 40, xp: 65, levelRequired: 35 },
      { id: "insider_trade", name: "Insider Trading", description: "Manipulate stock market with insider info.", reward: 15000, risk: 45, xp: 80, levelRequired: 35 },
      { id: "credit_card", name: "Credit Card Fraud", description: "Steal and use credit card information.", reward: 6000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "bank_fraud", name: "Bank Fraud", description: "Manipulate bank accounts for profit.", reward: 9000, risk: 35, xp: 55, levelRequired: 35 },
      { id: "check_forgery", name: "Check Forgery", description: "Forge signatures on checks.", reward: 4000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "wire_fraud", name: "Wire Fraud", description: "Electronic scams across networks.", reward: 7000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "mail_fraud", name: "Mail Fraud", description: "Run postal scams and fake lotteries.", reward: 3500, risk: 15, xp: 25, levelRequired: 35 },
      { id: "real_estate_fraud", name: "Real Estate Fraud", description: "Property scams and title manipulation.", reward: 11000, risk: 35, xp: 60, levelRequired: 35 },
      { id: "crypto_scam", name: "Cryptocurrency Scam", description: "Launch fake crypto projects to steal funds.", reward: 20000, risk: 40, xp: 90, levelRequired: 35 },
      { id: "insurance_ring", name: "Insurance Fraud Ring", description: "Coordinate fake claims across multiple people.", reward: 14000, risk: 45, xp: 75, levelRequired: 35 },
      { id: "crypto_launder", name: "Crypto Money Laundering", description: "Clean dirty money using blockchain.", reward: 8000, risk: 30, xp: 50, levelRequired: 35 },
      { id: "offshore", name: "Offshore Account Hiding", description: "Hide money in international banks.", reward: 6000, risk: 25, xp: 35, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🚗 ILLEGAL TRANSPORT (24 crimes)
  // ═══════════════════════════════════════════
  {
    id: "transport",
    name: "Illegal Transport",
    icon: "🚗",
    description: "Steal vehicles, smuggle goods, and move contraband across borders",
    crimes: [
      { id: "car_theft_ring", name: "Car Theft Ring", description: "Steal and sell vehicles through a network.", reward: 7000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "smuggle_cars", name: "Smuggling Vehicles", description: "Move stolen cars across borders.", reward: 12000, risk: 45, xp: 70, levelRequired: 35 },
      { id: "cargo_theft", name: "Cargo Theft", description: "Hijack truck shipments on highways.", reward: 9000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "drone_smuggle", name: "Drone Smuggling", description: "Use drones to transport contraband.", reward: 5000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "tunnel", name: "Tunnel Construction", description: "Build underground smuggling routes.", reward: 15000, risk: 35, xp: 80, levelRequired: 35 },
      { id: "boat_smuggle", name: "Boat Smuggling", description: "Maritime transport of illegal goods.", reward: 11000, risk: 40, xp: 65, levelRequired: 35 },
      { id: "train_theft", name: "Train Car Theft", description: "Rob train cargo containers.", reward: 10000, risk: 45, xp: 70, levelRequired: 35 },
      { id: "air_cargo", name: "Air Cargo Theft", description: "Hijack plane shipments at the airport.", reward: 18000, risk: 60, xp: 100, levelRequired: 35 },
      { id: "motorcycle", name: "Motorcycle Courier", description: "Quick delivery of contraband on bikes.", reward: 3000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "underground_rail", name: "Underground Railroad", description: "Secret transport network for fugitives.", reward: 8000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "bus_hijack", name: "Bus Hijacking", description: "Hijack public buses for valuables.", reward: 4000, risk: 35, xp: 35, levelRequired: 35 },
      { id: "taxi_rob", name: "Taxi Driver Robbery", description: "Rob taxi drivers of their earnings.", reward: 1500, risk: 20, xp: 25, levelRequired: 35 },
      { id: "delivery_hijack", name: "Delivery Truck Hijacking", description: "Steal packages from delivery trucks.", reward: 5500, risk: 30, xp: 40, levelRequired: 35 },
      { id: "fuel_theft", name: "Fuel Theft Operation", description: "Siphon fuel from trucks and tanks.", reward: 3000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "tire_theft", name: "Tire Theft Ring", description: "Steal and sell tires from parked vehicles.", reward: 2500, risk: 15, xp: 25, levelRequired: 35 },
      { id: "catalytic_theft", name: "Catalytic Converter Theft", description: "Cut and steal converters for precious metals.", reward: 3500, risk: 25, xp: 30, levelRequired: 35 },
      { id: "container_theft", name: "Shipping Container Theft", description: "Break into and steal from containers.", reward: 14000, risk: 50, xp: 80, levelRequired: 35 },
      { id: "bike_theft", name: "Bicycle Theft Ring", description: "Steal and resell bicycles in bulk.", reward: 1500, risk: 10, xp: 25, levelRequired: 35 },
      { id: "scooter_theft", name: "Scooter Theft Operation", description: "Steal electric scooters for resale.", reward: 2000, risk: 12, xp: 25, levelRequired: 35 },
      { id: "boat_theft", name: "Boat Theft Ring", description: "Steal boats from marinas and docks.", reward: 10000, risk: 45, xp: 65, levelRequired: 35 },
      { id: "aircraft_parts", name: "Aircraft Parts Theft", description: "Steal high-value aircraft components.", reward: 20000, risk: 65, xp: 120, levelRequired: 35 },
      { id: "train_cargo", name: "Train Cargo Heist", description: "Rob high-speed freight trains.", reward: 12000, risk: 50, xp: 75, levelRequired: 35 },
      { id: "postal_theft", name: "Postal Package Theft", description: "Steal packages from mailboxes and sorting centers.", reward: 2500, risk: 15, xp: 25, levelRequired: 35 },
      { id: "delivery_package", name: "Delivery Package Theft", description: "Steal packages from doorsteps and porches.", reward: 1800, risk: 12, xp: 25, levelRequired: 35 },
      { id: "moving_truck", name: "Moving Truck Theft", description: "Hijack moving trucks with valuables.", reward: 8000, risk: 35, xp: 55, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🌆 TERRITORY CONTROL (25 crimes)
  // ═══════════════════════════════════════════
  {
    id: "territory",
    name: "Territory Control",
    icon: "🌆",
    description: "Claim and control territories for passive income and power",
    crimes: [
      { id: "street_corner", name: "Street Corner Control", description: "Claim drug spots for steady income.", reward: 4000, risk: 30, xp: 35, levelRequired: 35 },
      { id: "neighborhood", name: "Neighborhood Extortion", description: "Control and tax local neighborhoods.", reward: 6000, risk: 25, xp: 40, levelRequired: 35 },
      { id: "port_control", name: "Port Control", description: "Dominate shipping operations at the docks.", reward: 12000, risk: 45, xp: 70, levelRequired: 35 },
      { id: "downtown", name: "Downtown Business District", description: "Run the city center's criminal operations.", reward: 10000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "underground_bunker", name: "Underground Bunker", description: "Establish a secret operations base.", reward: 8000, risk: 20, xp: 50, levelRequired: 35 },
      { id: "bar_takeover", name: "Bar Takeover", description: "Seize control of a local bar.", reward: 3000, risk: 25, xp: 25, levelRequired: 35 },
      { id: "club_takeover", name: "Nightclub Takeover", description: "Take over a nightclub for money laundering.", reward: 7000, risk: 35, xp: 45, levelRequired: 35 },
      { id: "restaurant_extort", name: "Restaurant Extortion", description: "Force restaurants to pay protection fees.", reward: 4000, risk: 20, xp: 30, levelRequired: 35 },
      { id: "market_extort", name: "Market Extortion", description: "Tax vendors in local markets.", reward: 3500, risk: 18, xp: 25, levelRequired: 35 },
      { id: "market_stall", name: "Market Stall Control", description: "Control vending stalls in flea markets.", reward: 2000, risk: 12, xp: 25, levelRequired: 35 },
      { id: "parking_lot", name: "Parking Lot Control", description: "Extort parking lot owners.", reward: 3000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "warehouse_district", name: "Warehouse District Control", description: "Control warehouse operations area.", reward: 9000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "industrial_zone", name: "Industrial Zone Control", description: "Dominate the industrial sector.", reward: 11000, risk: 42, xp: 65, levelRequired: 35 },
      { id: "residential", name: "Residential Area Control", description: "Control a residential neighborhood.", reward: 5000, risk: 22, xp: 35, levelRequired: 35 },
      { id: "entertainment", name: "Entertainment District Control", description: "Control the theater and entertainment zone.", reward: 8000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "red_light", name: "Red Light District Control", description: "Control the red light district's operations.", reward: 10000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "wholesale", name: "Wholesale Market Control", description: "Dominate wholesale distribution.", reward: 7500, risk: 30, xp: 45, levelRequired: 35 },
      { id: "retail_district", name: "Retail District Control", description: "Control retail store protection rackets.", reward: 5500, risk: 25, xp: 35, levelRequired: 35 },
      { id: "financial_district", name: "Financial District Control", description: "Infiltrate and control financial institutions.", reward: 15000, risk: 55, xp: 90, levelRequired: 35 },
      { id: "gov_building", name: "Government Building Infiltration", description: "Bribe and control government offices.", reward: 18000, risk: 60, xp: 100, levelRequired: 35 },
      { id: "military_base", name: "Military Base Infiltration", description: "Steal from military supply chains.", reward: 25000, risk: 80, xp: 150, levelRequired: 35 },
      { id: "airport_control", name: "Airport Control", description: "Control smuggling through airport security.", reward: 14000, risk: 50, xp: 80, levelRequired: 35 },
      { id: "seaport", name: "Seaport Control", description: "Dominate cargo operations at seaports.", reward: 13000, risk: 48, xp: 75, levelRequired: 35 },
      { id: "train_station", name: "Train Station Control", description: "Control drug distribution at train stations.", reward: 6000, risk: 30, xp: 40, levelRequired: 35 },
      { id: "bus_terminal", name: "Bus Terminal Control", description: "Extort bus drivers and vendors.", reward: 4500, risk: 22, xp: 30, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🎰 GAMBLING OPERATIONS (25 crimes)
  // ═══════════════════════════════════════════
  {
    id: "gambling_ops",
    name: "Gambling Operations",
    icon: "🎰",
    description: "Run illegal gambling operations and fix sporting events",
    crimes: [
      { id: "underground_poker", name: "Underground Poker Ring", description: "Run high-stakes poker games in back rooms.", reward: 8000, risk: 25, xp: 45, levelRequired: 35 },
      { id: "sports_betting", name: "Illegal Sports Betting", description: "Run a bookmaking operation for sports bets.", reward: 10000, risk: 30, xp: 55, levelRequired: 35 },
      { id: "dog_bets", name: "Dog Fighting Bets", description: "Organize gambling on dog fights.", reward: 6000, risk: 35, xp: 40, levelRequired: 35 },
      { id: "cockfight_bets", name: "Cockfighting Bets", description: "Run gambling on illegal cockfights.", reward: 4000, risk: 25, xp: 30, levelRequired: 35 },
      { id: "underground_lottery", name: "Underground Lottery", description: "Run an illegal lottery operation.", reward: 5000, risk: 20, xp: 35, levelRequired: 35 },
      { id: "race_fixing", name: "Race Fixing", description: "Fix horse and greyhound races.", reward: 15000, risk: 55, xp: 85, levelRequired: 35 },
      { id: "match_fixing", name: "Match Fixing", description: "Fix professional sports matches.", reward: 20000, risk: 65, xp: 110, levelRequired: 35 },
      { id: "illegal_mma", name: "Illegal MMA Fights", description: "Run unlicensed mixed martial arts events.", reward: 7000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "street_racing_bets", name: "Street Racing for Money", description: "Organize and bet on street races.", reward: 8000, risk: 40, xp: 55, levelRequired: 35 },
      { id: "backroom_craps", name: "Backroom Craps Games", description: "Run dice games in private rooms.", reward: 4500, risk: 20, xp: 30, levelRequired: 35 },
      { id: "numbers_racket", name: "Numbers Game (Policy)", description: "Run the numbers racket in neighborhoods.", reward: 6000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "bookmaking", name: "Professional Bookmaking", description: "Run a high-volume betting operation.", reward: 12000, risk: 35, xp: 65, levelRequired: 35 },
      { id: "point_shaving", name: "Sports Point Shaving", description: "Pay players to underperform deliberately.", reward: 18000, risk: 60, xp: 100, levelRequired: 35 },
      { id: "fight_fixing", name: "Boxing Match Fixing", description: "Fix professional boxing matches.", reward: 14000, risk: 50, xp: 80, levelRequired: 35 },
      { id: "horse_fix", name: "Horse Race Fixing", description: "Bribe jockeys to throw races.", reward: 16000, risk: 55, xp: 90, levelRequired: 35 },
      { id: "greyhound_fix", name: "Greyhound Race Fixing", description: "Fix greyhound racing outcomes.", reward: 8000, risk: 40, xp: 55, levelRequired: 35 },
      { id: "illegal_slots", name: "Illegal Slot Machines", description: "Place unlicensed slot machines in bars.", reward: 5000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "illegal_cards", name: "Illegal Card Games", description: "Run high-stakes card games underground.", reward: 6500, risk: 22, xp: 38, levelRequired: 35 },
      { id: "underground_roulette", name: "Underground Roulette", description: "Run roulette tables in hidden locations.", reward: 5500, risk: 20, xp: 32, levelRequired: 35 },
      { id: "backroom_blackjack", name: "Backroom Blackjack", description: "Run blackjack games in private clubs.", reward: 6000, risk: 22, xp: 35, levelRequired: 35 },
      { id: "illegal_baccarat", name: "Illegal Baccarat", description: "Run high-roller baccarat games.", reward: 10000, risk: 30, xp: 55, levelRequired: 35 },
      { id: "private_poker", name: "Private Poker Tournaments", description: "Host exclusive poker tournaments with buy-ins.", reward: 8000, risk: 25, xp: 45, levelRequired: 35 },
      { id: "dice_game", name: "Street Dice Games", description: "Organize craps games on street corners.", reward: 3000, risk: 18, xp: 25, levelRequired: 35 },
      { id: "lottery_scam", name: "Lottery Ticket Scam", description: "Sell fake winning lottery tickets.", reward: 4000, risk: 30, xp: 30, levelRequired: 35 },
      { id: "betting_ring", name: "Betting Syndicate", description: "Organize a professional betting syndicate.", reward: 15000, risk: 40, xp: 80, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 💊 DRUG OPERATIONS (25 crimes)
  // ═══════════════════════════════════════════
  {
    id: "drugs",
    name: "Drug Operations",
    icon: "💊",
    description: "Manufacture, distribute, and sell controlled substances",
    crimes: [
      { id: "drug_manufacture", name: "Drug Manufacturing", description: "Set up a drug production lab.", reward: 20000, risk: 60, xp: 100, levelRequired: 35 },
      { id: "drug_distribute", name: "Drug Distribution Network", description: "Establish distribution channels across the city.", reward: 12000, risk: 40, xp: 65, levelRequired: 35 },
      { id: "drug_smuggle", name: "Drug Smuggling", description: "Move drugs across international borders.", reward: 25000, risk: 70, xp: 120, levelRequired: 35 },
      { id: "drug_transport", name: "Drug Transportation", description: "Transport drugs between cities safely.", reward: 8000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "drug_storage", name: "Drug Storage Facility", description: "Set up hidden drug storage warehouses.", reward: 5000, risk: 20, xp: 35, levelRequired: 35 },
      { id: "drug_packaging", name: "Drug Packaging", description: "Package drugs for street distribution.", reward: 3000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "drug_cutting", name: "Drug Cutting (Diluting)", description: "Dilute drugs to increase profit margins.", reward: 6000, risk: 20, xp: 35, levelRequired: 35 },
      { id: "drug_dealer", name: "Street Level Drug Dealing", description: "Sell drugs directly on the streets.", reward: 4000, risk: 35, xp: 30, levelRequired: 35 },
      { id: "drug_wholesale", name: "Wholesale Drug Distribution", description: "Sell in bulk to smaller dealers.", reward: 15000, risk: 50, xp: 80, levelRequired: 35 },
      { id: "drug_retail", name: "Retail Drug Sales", description: "Manage multiple retail drug sellers.", reward: 10000, risk: 45, xp: 60, levelRequired: 35 },
      { id: "drug_launder", name: "Drug Money Laundering", description: "Clean drug profits through businesses.", reward: 8000, risk: 30, xp: 50, levelRequired: 35 },
      { id: "drug_equipment", name: "Drug Equipment Theft", description: "Steal lab equipment from chemical suppliers.", reward: 5000, risk: 30, xp: 35, levelRequired: 35 },
      { id: "drug_precursor", name: "Drug Precursor Theft", description: "Steal chemical precursors from factories.", reward: 7000, risk: 35, xp: 45, levelRequired: 35 },
      { id: "drug_lab_setup", name: "Drug Lab Setup", description: "Configure a new drug production facility.", reward: 10000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "drug_routes", name: "Drug Route Establishment", description: "Create new smuggling routes.", reward: 12000, risk: 45, xp: 70, levelRequired: 35 },
      { id: "drug_territory", name: "Drug Territory Expansion", description: "Expand drug sales into new areas.", reward: 9000, risk: 40, xp: 55, levelRequired: 35 },
      { id: "drug_pricing", name: "Drug Price Manipulation", description: "Control drug prices in the market.", reward: 6000, risk: 20, xp: 35, levelRequired: 35 },
      { id: "drug_quality", name: "Drug Quality Control", description: "Ensure product quality for repeat customers.", reward: 4000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "drug_customers", name: "Customer Acquisition", description: "Recruit new drug customers.", reward: 3000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "drug_suppliers", name: "Supplier Negotiations", description: "Negotiate with international drug suppliers.", reward: 14000, risk: 45, xp: 75, levelRequired: 35 },
      { id: "drug_design", name: "Drug Packaging Design", description: "Create branded packaging for drugs.", reward: 2500, risk: 10, xp: 25, levelRequired: 35 },
      { id: "drug_logistics", name: "Drug Transportation Logistics", description: "Manage complex drug transport networks.", reward: 11000, risk: 40, xp: 65, levelRequired: 35 },
      { id: "drug_collection", name: "Drug Money Collection", description: "Collect drug debts from street dealers.", reward: 5000, risk: 30, xp: 35, levelRequired: 35 },
      { id: "drug_debt", name: "Drug Debt Collection", description: "Enforce drug debts with violence.", reward: 6000, risk: 35, xp: 40, levelRequired: 35 },
      { id: "drug_expansion", name: "Drug Empire Expansion", description: "Expand drug operations to new cities.", reward: 30000, risk: 75, xp: 180, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 👥 ORGANIZED CRIME (25 crimes)
  // ═══════════════════════════════════════════
  {
    id: "organized",
    name: "Organized Crime",
    icon: "👥",
    description: "Build and manage your criminal empire with family operations",
    crimes: [
      { id: "family_business", name: "Family Business Management", description: "Oversee all family criminal operations.", reward: 10000, risk: 30, xp: 60, levelRequired: 35 },
      { id: "family_hierarchy", name: "Family Hierarchy Management", description: "Promote and demote family members.", reward: 5000, risk: 10, xp: 30, levelRequired: 35 },
      { id: "family_initiation", name: "Family Initiation Rituals", description: "Recruit and initiate new family members.", reward: 4000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "family_discipline", name: "Family Discipline", description: "Punish disloyal family members.", reward: 3000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "family_treasury", name: "Family Treasury Management", description: "Manage the family's shared wealth.", reward: 8000, risk: 15, xp: 45, levelRequired: 35 },
      { id: "family_alliance", name: "Family Alliance Building", description: "Form alliances with other crime families.", reward: 12000, risk: 25, xp: 65, levelRequired: 35 },
      { id: "family_enemy", name: "Family Enemy Elimination", description: "Eliminate threats to the family.", reward: 15000, risk: 55, xp: 85, levelRequired: 35 },
      { id: "family_territory", name: "Family Territory Expansion", description: "Expand family operations to new areas.", reward: 11000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "family_acquisition", name: "Family Business Acquisition", description: "Buy out rival criminal businesses.", reward: 20000, risk: 35, xp: 80, levelRequired: 35 },
      { id: "family_politics", name: "Family Political Influence", description: "Bribe politicians for family protection.", reward: 18000, risk: 50, xp: 90, levelRequired: 35 },
      { id: "family_legal", name: "Family Legal Protection", description: "Hire lawyers to protect family members.", reward: 8000, risk: 10, xp: 40, levelRequired: 35 },
      { id: "family_witness", name: "Family Witness Elimination", description: "Silence witnesses against the family.", reward: 25000, risk: 70, xp: 140, levelRequired: 35 },
      { id: "family_snitch", name: "Family Snitch Elimination", description: "Deal with informants and traitors.", reward: 15000, risk: 50, xp: 80, levelRequired: 35 },
      { id: "family_rival", name: "Family Rival Elimination", description: "Destroy rival criminal organizations.", reward: 30000, risk: 80, xp: 160, levelRequired: 35 },
      { id: "family_merger", name: "Family Business Merger", description: "Merge operations with another family.", reward: 16000, risk: 30, xp: 70, levelRequired: 35 },
      { id: "family_protect", name: "Family Asset Protection", description: "Protect family wealth from seizure.", reward: 7000, risk: 15, xp: 35, levelRequired: 35 },
      { id: "family_succession", name: "Family Succession Planning", description: "Prepare the next generation of leaders.", reward: 6000, risk: 10, xp: 30, levelRequired: 35 },
      { id: "family_crisis", name: "Family Crisis Management", description: "Handle major crises and investigations.", reward: 10000, risk: 25, xp: 55, levelRequired: 35 },
      { id: "family_reputation", name: "Family Reputation Building", description: "Build the family's feared reputation.", reward: 5000, risk: 15, xp: 30, levelRequired: 35 },
      { id: "family_legacy", name: "Family Legacy Building", description: "Create a lasting criminal legacy.", reward: 8000, risk: 20, xp: 45, levelRequired: 35 },
      { id: "family_code", name: "Family Code Enforcement", description: "Enforce the family's code of conduct.", reward: 4000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "family_oath", name: "Family Oath Taking", description: "Administer loyalty oaths to new members.", reward: 2000, risk: 5, xp: 25, levelRequired: 35 },
      { id: "family_meeting", name: "Family Meeting Organization", description: "Organize secret family meetings.", reward: 3000, risk: 10, xp: 25, levelRequired: 35 },
      { id: "family_dispute", name: "Family Dispute Resolution", description: "Mediate disputes between family factions.", reward: 5000, risk: 15, xp: 30, levelRequired: 35 },
      { id: "family_honor", name: "Family Honor Maintenance", description: "Uphold the family's honor and traditions.", reward: 3000, risk: 10, xp: 25, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🔫 WEAPONS & VIOLENCE (15 crimes)
  // ═══════════════════════════════════════════
  {
    id: "weapons",
    name: "Weapons & Combat",
    icon: "🔫",
    description: "Acquire, modify, and use weapons for profit and power",
    crimes: [
      { id: "weapon_smuggle", name: "Weapon Smuggling", description: "Import illegal firearms from overseas.", reward: 18000, risk: 60, xp: 90, levelRequired: 35 },
      { id: "weapon_trade", name: "Black Market Weapon Trade", description: "Buy and sell weapons illegally.", reward: 12000, risk: 45, xp: 65, levelRequired: 35 },
      { id: "weapon_mod", name: "Weapon Modification", description: "Modify and enhance firearms.", reward: 8000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "weapon_theft", name: "Military Weapon Theft", description: "Steal military-grade weapons.", reward: 25000, risk: 80, xp: 150, levelRequired: 35 },
      { id: "explosives", name: "Explosives Manufacturing", description: "Create and sell homemade explosives.", reward: 15000, risk: 70, xp: 110, levelRequired: 35 },
      { id: "knife_fight", name: "Knife Fighting Ring", description: "Organize underground knife fights.", reward: 5000, risk: 40, xp: 40, levelRequired: 35 },
      { id: "gun_range", name: "Illegal Gun Range", description: "Run an unlicensed shooting range.", reward: 6000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "body_armor", name: "Body Armor Sales", description: "Sell military-grade body armor.", reward: 7000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "weapon_cache", name: "Weapon Cache Building", description: "Build hidden weapon storage.", reward: 4000, risk: 20, xp: 30, levelRequired: 35 },
      { id: "ammo_theft", name: "Ammunition Theft", description: "Steal ammunition from military sources.", reward: 5000, risk: 35, xp: 40, levelRequired: 35 },
      { id: "sniper_contract", name: "Sniper Contract", description: "Accept high-value assassination contracts.", reward: 30000, risk: 85, xp: 200, levelRequired: 35 },
      { id: "gang_armory", name: "Gang Armory Management", description: "Manage weapons for your gang.", reward: 8000, risk: 30, xp: 50, levelRequired: 35 },
      { id: "weapon_forge", name: "Weapon Forging", description: "Create custom weapons from scratch.", reward: 10000, risk: 40, xp: 60, levelRequired: 35 },
      { id: "tactical_gear", name: "Tactical Gear Theft", description: "Steal police and military tactical gear.", reward: 9000, risk: 50, xp: 65, levelRequired: 35 },
      { id: "weapon_auction", name: "Weapon Auction", description: "Run secret weapon auctions.", reward: 12000, risk: 40, xp: 70, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // 🕸️ DARK WEB & CYBER (15 crimes)
  // ═══════════════════════════════════════════
  {
    id: "cyber",
    name: "Dark Web & Cyber Crime",
    icon: "🕸️",
    description: "Exploit technology for criminal profit",
    crimes: [
      { id: "dark_market", name: "Dark Web Marketplace", description: "Run a marketplace on the dark web.", reward: 15000, risk: 40, xp: 80, levelRequired: 35 },
      { id: "ransomware", name: "Ransomware Attack", description: "Encrypt and ransom company data.", reward: 20000, risk: 55, xp: 100, levelRequired: 35 },
      { id: "ddos_attack", name: "DDoS Attack for Hire", description: "Attack websites for ransom payments.", reward: 5000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "crypto_mining", name: "Illegal Crypto Mining", description: "Mine cryptocurrency using stolen power.", reward: 4000, risk: 20, xp: 25, levelRequired: 35 },
      { id: "data_theft", name: "Corporate Data Theft", description: "Steal corporate databases for sale.", reward: 18000, risk: 50, xp: 90, levelRequired: 35 },
      { id: "phishing", name: "Phishing Campaign", description: "Trick victims into revealing credentials.", reward: 6000, risk: 20, xp: 35, levelRequired: 35 },
      { id: "card_cloning", name: "Credit Card Cloning", description: "Clone credit cards using skimmers.", reward: 8000, risk: 35, xp: 50, levelRequired: 35 },
      { id: "bank_hack", name: "Bank System Hacking", description: "Breach banking systems for funds.", reward: 30000, risk: 75, xp: 180, levelRequired: 35 },
      { id: "social_engineer", name: "Social Engineering", description: "Manipulate people into giving access.", reward: 4000, risk: 15, xp: 25, levelRequired: 35 },
      { id: "identity_generate", name: "Digital Identity Generation", description: "Create flawless fake digital identities.", reward: 3500, risk: 12, xp: 25, levelRequired: 35 },
      { id: "botnet", name: "Botnet Operations", description: "Control networks of compromised computers.", reward: 7000, risk: 30, xp: 45, levelRequired: 35 },
      { id: "crypto_theft", name: "Cryptocurrency Theft", description: "Hack and steal cryptocurrency wallets.", reward: 25000, risk: 60, xp: 130, levelRequired: 35 },
      { id: "surveillance_hack", name: "Surveillance System Hack", description: "Breach security camera systems.", reward: 5000, risk: 25, xp: 35, levelRequired: 35 },
      { id: "identity_trade", name: "Digital Identity Trade", description: "Buy and sell fake online identities.", reward: 6000, risk: 25, xp: 40, levelRequired: 35 },
      { id: "cyber_espionage", name: "Cyber Espionage", description: "Spy on targets through digital channels.", reward: 12000, risk: 45, xp: 70, levelRequired: 35 },
    ],
  },

  // ═══════════════════════════════════════════
  // ⚡ LEVEL-BASED ELITE CRIMES
  // ═══════════════════════════════════════════
  {
    id: "elite",
    name: "⚡ Elite Crimes",
    icon: "⚡",
    description: "High-level crimes with massive cash and XP rewards",
    crimes: [
      { id: "federal_vault", name: "Federal Reserve Heist", description: "Breach the federal reserve vault for unlimited cash.", reward: 500000, risk: 95, xp: 500, levelRequired: 30 },
      { id: "pentagon_breach", name: "Pentagon Data Breach", description: "Hack into classified government servers.", reward: 750000, risk: 98, xp: 600, levelRequired: 35 },
      { id: "island_fortress", name: "Private Island Fortress Raid", description: "Storm a billionaire's private island.", reward: 1000000, risk: 99, xp: 750, levelRequired: 40 },
      { id: "space_station", name: "Orbital Station Heist", description: "Steal experimental tech from a space station.", reward: 2000000, risk: 99, xp: 1000, levelRequired: 45 },
      { id: "underwater_vault", name: "Deep Sea Vault Crack", description: "Dive to an underwater vault in the Mariana Trench.", reward: 1500000, risk: 97, xp: 800, levelRequired: 42 },
      { id: "nuclear_facility", name: "Nuclear Facility Infiltration", description: "Infiltrate a nuclear power plant for weapons-grade material.", reward: 800000, risk: 99, xp: 650, levelRequired: 38 },
      { id: "crypto_mine", name: "Crypto Mining Farm Raid", description: "Steal 10,000 Bitcoin from a mining operation.", reward: 3000000, risk: 96, xp: 900, levelRequired: 48 },
      { id: "military_convoy", name: "Military Convoy Ambush", description: "Intercept a classified military transport.", reward: 600000, risk: 94, xp: 550, levelRequired: 32 },
      { id: "royal_palace", name: "Royal Palace Jewelry Heist", description: "Steal the crown jewels from a foreign palace.", reward: 4000000, risk: 98, xp: 1200, levelRequired: 50 },
      { id: "art_museum_vip", name: "VIP Art Vault Robbery", description: "Break into the world's most secure art vault.", reward: 900000, risk: 93, xp: 700, levelRequired: 36 },
      { id: "hacker_society", name: "Dark Web Syndicate Takeover", description: "Overthrow the dark web's ruling council.", reward: 1200000, risk: 97, xp: 850, levelRequired: 44 },
      { id: "diamond_mine", name: "De Beers Diamond Mine Raid", description: "Raid the world's largest diamond mine.", reward: 5000000, risk: 99, xp: 1500, levelRequired: 50 },
      { id: "ghost_protocol", name: "Ghost Protocol Activation", description: "Erase your identity and steal a new one from MI6.", reward: 3500000, risk: 98, xp: 1100, levelRequired: 46 },
      { id: "cartel_takeover", name: "Full Cartel Takeover", description: "Eliminate the entire cartel leadership.", reward: 2500000, risk: 96, xp: 950, levelRequired: 43 },
      { id: "olympic_heist", name: "Olympic Gold Vault", description: "Steal every gold medal from the Olympics.", reward: 800000, risk: 92, xp: 650, levelRequired: 34 },
      { id: "casino_royale", name: "Casino Royale Total Sweep", description: "Clean out every table and vault in Monaco.", reward: 1800000, risk: 95, xp: 880, levelRequired: 41 },
      { id: "embassy_raid", name: "Embassy Server Extraction", description: "Extract classified data from an embassy.", reward: 1100000, risk: 94, xp: 750, levelRequired: 39 },
      { id: "wine_fortress", name: "Chateau Wine Vault Heist", description: "Steal the world's rarest wine collection.", reward: 650000, risk: 90, xp: 550, levelRequired: 33 },
      { id: "smart_city", name: "Smart City Override", description: "Take control of a smart city's infrastructure.", reward: 4500000, risk: 99, xp: 1300, levelRequired: 49 },
      { id: "final_job", name: "The Final Job", description: "The ultimate crime - retire with unlimited wealth.", reward: 10000000, risk: 100, xp: 2000, levelRequired: 50 },
    ],
  },
];
crimeCategories.sort((a, b) => {
  const maxA = Math.max(...a.crimes.map(c => c.xp));
  const maxB = Math.max(...b.crimes.map(c => c.xp));
  return maxB - maxA;
});

// Street Crimes stays at top. Sort crimes within each category by XP (highest first)
crimeCategories.forEach((cat) => {
  cat.crimes.sort((a, b) => b.xp - a.xp);
});

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

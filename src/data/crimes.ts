export interface Crime {
  id: string;
  name: string;
  description: string;
  reward: number;
  risk: number;
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
  // ═══ STREET CRIMES ═══
  {
    id: "street",
    name: "Street Crimes",
    icon: "🔪",
    description: "Street-level crimes. Low risk, steady income. Available from level 1.",
    crimes: [
      { id: "pickpocket", name: "Pickpocketing", description: "Lift wallets from unsuspecting pedestrians.", reward: 200, risk: 10, xp: 150, levelRequired: 1 },
      { id: "mugging", name: "Street Mugging", description: "Confront targets on dark streets. Take their wallet.", reward: 400, risk: 20, xp: 175, levelRequired: 1 },
      { id: "shoplifting", name: "Shoplifting", description: "Stuff your pockets in retail stores.", reward: 300, risk: 15, xp: 150, levelRequired: 1 },
      { id: "phone_snatch", name: "Phone Snatching", description: "Grab a phone and bolt through the crowd.", reward: 250, risk: 12, xp: 150, levelRequired: 1 },
      { id: "bicycle_theft", name: "Bicycle Theft", description: "Swipe unlocked bikes from the sidewalk.", reward: 150, risk: 8, xp: 150, levelRequired: 1 },
      { id: "purse_snatch", name: "Purse Snatching", description: "Grab a bag and run.", reward: 350, risk: 18, xp: 150, levelRequired: 2 },
      { id: "car_breakin", name: "Car Break-In", description: "Smash a car window and grab valuables.", reward: 500, risk: 25, xp: 175, levelRequired: 2 },
      { id: "drug_rip", name: "Drug Deal Rip-Off", description: "Rip off a small-time dealer and run.", reward: 600, risk: 30, xp: 175, levelRequired: 3 },
      { id: "scrap_metal", name: "Scrap Metal Theft", description: "Strip copper wiring from construction sites.", reward: 350, risk: 8, xp: 150, levelRequired: 1 },
      { id: "garbage_scavenge", name: "Garbage Scavenging", description: "Dig through trash for sellable items.", reward: 100, risk: 3, xp: 150, levelRequired: 1 },
      { id: "ticket_scalp", name: "Ticket Scalping", description: "Buy event tickets and resell at markup.", reward: 450, risk: 10, xp: 150, levelRequired: 2 },
      { id: "scam_call", name: "Scam Phone Call", description: "Run a quick phone scam on a mark.", reward: 300, risk: 8, xp: 150, levelRequired: 1 },
      { id: "panhandle", name: "Panhandle Hustle", description: "Work the corner with a sob story.", reward: 180, risk: 2, xp: 150, levelRequired: 1 },
      { id: "vandalism", name: "Petty Vandalism", description: "Tag walls and smash mailboxes.", reward: 120, risk: 10, xp: 150, levelRequired: 1 },
      { id: "egg_smuggle", name: "Egg Smuggling", description: "Transport contraband eggs across city lines.", reward: 500, risk: 15, xp: 175, levelRequired: 2 },
      { id: "bootlegging", name: "Bootlegging", description: "Brew and sell unlicensed alcohol.", reward: 600, risk: 18, xp: 175, levelRequired: 2 },
      { id: "fence_stolen", name: "Fence Stolen Goods", description: "Sell hot merchandise to contacts.", reward: 450, risk: 10, xp: 150, levelRequired: 1 },
      { id: "dumpster_dive", name: "Dumpster Diving", description: "Find valuables thrown out by businesses.", reward: 80, risk: 2, xp: 150, levelRequired: 1 },
      { id: "sneak_bus", name: "Sneak onto Bus", description: "Ride public transit without paying.", reward: 50, risk: 5, xp: 150, levelRequired: 1 },
      { id: "atm_skim", name: "ATM Skimming", description: "Install skimmers on ATMs to harvest card data.", reward: 800, risk: 20, xp: 200, levelRequired: 3 },
    ],
  },

  // ═══ ROBBERIES & HEISTS ═══
  {
    id: "robbery",
    name: "Robberies & Heists",
    icon: "💰",
    description: "High-stakes robberies requiring planning and nerve.",
    crimes: [
      { id: "breaking_entering", name: "Breaking & Entering", description: "Pick locks and break into homes. Grab valuables.", reward: 800, risk: 30, xp: 250, levelRequired: 3 },
      { id: "smash_grab", name: "Smash & Grab", description: "Smash windows, grab jewelry, flee.", reward: 1200, risk: 35, xp: 275, levelRequired: 4 },
      { id: "convenience_store", name: "Convenience Store Holdup", description: "Quick cash grab at a local store.", reward: 1500, risk: 25, xp: 225, levelRequired: 4 },
      { id: "gas_station", name: "Gas Station Robbery", description: "Rob a gas station at closing time.", reward: 2000, risk: 30, xp: 250, levelRequired: 4 },
      { id: "pawn_shop", name: "Pawn Shop Heist", description: "Hit a pawn shop for its inventory.", reward: 3500, risk: 30, xp: 275, levelRequired: 5 },
      { id: "pharmacy_robbery", name: "Pharmacy Robbery", description: "Steal valuable prescription drugs.", reward: 4500, risk: 35, xp: 300, levelRequired: 6 },
      { id: "atm_bombing", name: "ATM Bombing", description: "Blow up ATMs for quick cash grabs.", reward: 3000, risk: 45, xp: 275, levelRequired: 5 },
      { id: "construction_theft", name: "Construction Site Theft", description: "Steal materials from active sites.", reward: 2500, risk: 20, xp: 250, levelRequired: 5 },
      { id: "electronics_heist", name: "Electronics Store Heist", description: "Steal high-value electronics for resale.", reward: 5500, risk: 40, xp: 325, levelRequired: 8 },
      { id: "credit_fraud", name: "Credit Card Fraud", description: "Clone cards and make unauthorized purchases.", reward: 2000, risk: 35, xp: 300, levelRequired: 6 },
      { id: "identity_theft", name: "Identity Theft", description: "Steal personal data, drain bank accounts.", reward: 3000, risk: 40, xp: 350, levelRequired: 7 },
      { id: "armed_robbery", name: "Armed Robbery", description: "Hold up a store at gunpoint.", reward: 2500, risk: 60, xp: 400, levelRequired: 8 },
      { id: "jewelry_blitz", name: "Jewelry Store Blitz", description: "Smash-and-grab at a high-end jewelry store.", reward: 8000, risk: 55, xp: 500, levelRequired: 10 },
      { id: "art_gallery", name: "Art Gallery Theft", description: "Steal priceless artwork for the black market.", reward: 12000, risk: 60, xp: 400, levelRequired: 12 },
      { id: "museum_heist", name: "Museum Artifact Heist", description: "Steal antiquities from a museum.", reward: 18000, risk: 65, xp: 600, levelRequired: 14 },
      { id: "armored_car", name: "Armored Car Robbery", description: "Ambush and loot cash transport vehicles.", reward: 15000, risk: 70, xp: 750, levelRequired: 14 },
      { id: "bank_vault", name: "Bank Vault Heist", description: "Coordinate a crew to rob a bank vault.", reward: 25000, risk: 85, xp: 1000, levelRequired: 18 },
      { id: "casino_heist", name: "Casino Heist", description: "Infiltrate the casino vault. Ghost or loud.", reward: 35000, risk: 90, xp: 1250, levelRequired: 22 },
      { id: "yacht_theft", name: "Luxury Yacht Theft", description: "Steal a high-value yacht from the marina.", reward: 20000, risk: 75, xp: 650, levelRequired: 16 },
      { id: "diamond_raid", name: "Diamond Exchange Raid", description: "High-risk raid on a diamond trading center.", reward: 40000, risk: 95, xp: 1250, levelRequired: 22 },
      { id: "train_robbery", name: "Train Robbery", description: "Ambush cargo trains carrying valuables.", reward: 22000, risk: 80, xp: 800, levelRequired: 16 },
      { id: "cargo_hijack", name: "Cargo Ship Hijacking", description: "Hijack containers at the port dock.", reward: 30000, risk: 85, xp: 900, levelRequired: 20 },
      { id: "drug_lab_raid", name: "Drug Lab Raid", description: "Steal from a rival drug operation lab.", reward: 14000, risk: 60, xp: 450, levelRequired: 12 },
      { id: "luxury_car_theft", name: "Luxury Car Theft", description: "Steal high-end vehicles for black market.", reward: 9000, risk: 50, xp: 350, levelRequired: 10 },
      { id: "power_plant", name: "Power Plant Sabotage", description: "Cause a blackout to loot the area.", reward: 10000, risk: 50, xp: 300, levelRequired: 10 },
      { id: "warehouse_raid", name: "Warehouse Raid", description: "Steal inventory from a storage warehouse.", reward: 6000, risk: 40, xp: 250, levelRequired: 8 },
      { id: "hospital_theft", name: "Hospital Supply Theft", description: "Steal medical supplies for black market.", reward: 7000, risk: 30, xp: 250, levelRequired: 8 },
      { id: "charity_embezzle", name: "Charity Embezzlement", description: "Skim funds from charity organizations.", reward: 8000, risk: 25, xp: 200, levelRequired: 10 },
      { id: "church_theft", name: "Church Theft", description: "Steal from church donation boxes.", reward: 1000, risk: 15, xp: 150, levelRequired: 3 },
      { id: "school_theft", name: "School Fundraiser Theft", description: "Steal from school fundraising events.", reward: 1500, risk: 15, xp: 150, levelRequired: 4 },
    ],
  },

  // ═══ FRAUD & SCAMS ═══
  {
    id: "fraud",
    name: "Fraud & Scams",
    icon: "🎭",
    description: "Clever cons and financial manipulation.",
    crimes: [
      { id: "lottery_scam", name: "Lottery Scam", description: "Con marks they won the lottery. Collect fees.", reward: 1500, risk: 20, xp: 225, levelRequired: 4 },
      { id: "tax_evasion", name: "Tax Evasion", description: "Cook the books and dodge the IRS.", reward: 5000, risk: 30, xp: 325, levelRequired: 8 },
      { id: "car_insurance", name: "Car Insurance Scam", description: "Stage accidents and file false claims.", reward: 2000, risk: 25, xp: 250, levelRequired: 5 },
      { id: "romance_scam", name: "Romance Scam", description: "Build fake online relationships. Drain accounts.", reward: 4000, risk: 15, xp: 275, levelRequired: 6 },
      { id: "extortion", name: "Extortion", description: "Collect protection money. Pay up or else.", reward: 3500, risk: 35, xp: 300, levelRequired: 7 },
      { id: "kidnapping", name: "Kidnapping", description: "Abduct a target and demand ransom.", reward: 10000, risk: 70, xp: 600, levelRequired: 12 },
      { id: "counterfeit", name: "Counterfeit Currency", description: "Print and distribute fake bills.", reward: 6000, risk: 40, xp: 350, levelRequired: 9 },
      { id: "insurance_fraud", name: "Insurance Fraud", description: "File massive false insurance claims.", reward: 7000, risk: 35, xp: 375, levelRequired: 10 },
      { id: "wire_fraud", name: "Wire Fraud", description: "Electronic financial deception.", reward: 8000, risk: 30, xp: 400, levelRequired: 11 },
      { id: "money_laundering", name: "Money Laundering", description: "Clean dirty money through shell companies.", reward: 12000, risk: 25, xp: 450, levelRequired: 12 },
      { id: "ponzi", name: "Ponzi Scheme", description: "Build a pyramid of lies. Massive payout.", reward: 20000, risk: 50, xp: 600, levelRequired: 14 },
      { id: "insider_trading", name: "Insider Trading", description: "Trade on stolen corporate information.", reward: 15000, risk: 30, xp: 500, levelRequired: 13 },
      { id: "corp_espionage", name: "Corporate Espionage", description: "Steal trade secrets from competitors.", reward: 18000, risk: 45, xp: 550, levelRequired: 14 },
      { id: "ransomware", name: "Ransomware Attack", description: "Encrypt systems and demand payment.", reward: 25000, risk: 55, xp: 650, levelRequired: 15 },
    ],
  },

  // ═══ BURGLARY ═══
  {
    id: "burglary",
    name: "Burglary",
    icon: "🏠",
    description: "Break into homes. Easy money from easy targets.",
    crimes: [
      { id: "suburban_casing", name: "Suburban Casing", description: "Scout a suburban neighborhood for easy targets.", reward: 1500, risk: 20, xp: 200, levelRequired: 3 },
      { id: "apartment_ransack", name: "Apartment Ransack", description: "Break into a small apartment. Grab electronics.", reward: 3000, risk: 25, xp: 225, levelRequired: 4 },
      { id: "easy_house", name: "Easy House Break-In", description: "Quick in-and-out from a modest home.", reward: 4000, risk: 15, xp: 175, levelRequired: 2 },
      { id: "average_house", name: "Average House Burglary", description: "Standard residential burglary.", reward: 8000, risk: 30, xp: 275, levelRequired: 5 },
      { id: "vacation_home", name: "Vacation Home Hit", description: "Hit an empty vacation home.", reward: 14000, risk: 40, xp: 350, levelRequired: 8 },
      { id: "luxury_villa", name: "Luxury Villa Heist", description: "Infiltrate a high-security luxury villa.", reward: 12500, risk: 50, xp: 400, levelRequired: 10 },
      { id: "penthouse_raid", name: "Penthouse Raid", description: "Storm a downtown penthouse.", reward: 2750000, risk: 55, xp: 500, levelRequired: 12 },
      { id: "mansion", name: "Mansion Infiltration", description: "Full-scale mansion burglary. Multiple rooms.", reward: 7500000, risk: 65, xp: 600, levelRequired: 15 },
    ],
  },

  // ═══ DRUG OPERATIONS ═══
  {
    id: "drugs",
    name: "Drug Operations",
    icon: "💊",
    description: "Manufacture, distribute, and sell controlled substances.",
    crimes: [
      { id: "corner_deal", name: "Street Corner Deal", description: "Sell product on the corner. Quick and dirty.", reward: 1000, risk: 25, xp: 200, levelRequired: 5 },
      { id: "drug_running", name: "Drug Running", description: "Move product across neighborhoods.", reward: 5000, risk: 40, xp: 350, levelRequired: 8 },
      { id: "cook_operation", name: "Cook Operation", description: "Cook a batch in your basement lab.", reward: 8000, risk: 45, xp: 400, levelRequired: 9 },
      { id: "precursor_theft", name: "Precursor Theft", description: "Steal chemicals needed for production.", reward: 12000, risk: 40, xp: 450, levelRequired: 11 },
      { id: "manufacturing", name: "Manufacturing Operation", description: "Set up a full-scale production lab.", reward: 10000, risk: 50, xp: 450, levelRequired: 10 },
      { id: "distribution", name: "Distribution Network", description: "Build a network of street dealers.", reward: 15000, risk: 45, xp: 500, levelRequired: 12 },
      { id: "lab_expansion", name: "Lab Expansion", description: "Upgrade and expand your production facility.", reward: 20000, risk: 55, xp: 550, levelRequired: 14 },
      { id: "bulk_intercept", name: "Bulk Shipment Interception", description: "Intercept a rival's bulk shipment.", reward: 25000, risk: 60, xp: 600, levelRequired: 15 },
      { id: "underground_lab", name: "Underground Lab", description: "Build a hidden underground production facility.", reward: 40000, risk: 55, xp: 750, levelRequired: 20 },
      { id: "smuggling_ring", name: "Smuggling Ring", description: "Run a full smuggling operation.", reward: 35000, risk: 60, xp: 650, levelRequired: 17 },
      { id: "intl_supply", name: "International Supply Chain", description: "Source product from international suppliers.", reward: 30000, risk: 65, xp: 700, levelRequired: 18 },
      { id: "cartel_partner", name: "Cartel Partnership", description: "Partner with a major cartel for distribution.", reward: 50000, risk: 70, xp: 850, levelRequired: 22 },
    ],
  },

  // ═══ ORGANIZED CRIME ═══
  {
    id: "organized",
    name: "Organized Crime",
    icon: "👥",
    description: "Large-scale criminal enterprises requiring connections.",
    crimes: [
      { id: "protection", name: "Protection Racket", description: "Collect protection money from local businesses.", reward: 8000, risk: 30, xp: 400, levelRequired: 10 },
      { id: "loan_sharking", name: "Loan Sharking", description: "Lend money at extreme interest rates.", reward: 15000, risk: 25, xp: 450, levelRequired: 12 },
      { id: "racketeering", name: "Racketeering", description: "Run a network of illegal businesses.", reward: 20000, risk: 35, xp: 500, levelRequired: 14 },
      { id: "blackmail_op", name: "Blackmail Operation", description: "Gather dirt and force payment.", reward: 25000, risk: 30, xp: 550, levelRequired: 15 },
      { id: "extortion_ring", name: "Extortion Ring", description: "Run a city-wide extortion operation.", reward: 30000, risk: 40, xp: 600, levelRequired: 16 },
      { id: "smuggling_syndicate", name: "Smuggling Syndicate", description: "Multi-route smuggling operation.", reward: 40000, risk: 50, xp: 700, levelRequired: 18 },
      { id: "arms_traffic", name: "Arms Trafficking", description: "Sell weapons on the black market.", reward: 50000, risk: 55, xp: 800, levelRequired: 20 },
      { id: "human_traffic", name: "Human Trafficking", description: "Move people across borders for profit.", reward: 60000, risk: 70, xp: 900, levelRequired: 22 },
      { id: "laundering_empire", name: "Money Laundering Empire", description: "Full-scale money laundering network.", reward: 35000, risk: 35, xp: 650, levelRequired: 17 },
      { id: "family_alliance", name: "Crime Family Alliance", description: "Form an alliance with other families.", reward: 45000, risk: 45, xp: 750, levelRequired: 19 },
      { id: "territory_takeover", name: "Territory Takeover", description: "Seize control of rival territory.", reward: 55000, risk: 60, xp: 850, levelRequired: 21 },
      { id: "underground_casino", name: "Underground Casino", description: "Run an illegal gambling operation.", reward: 30000, risk: 40, xp: 600, levelRequired: 16 },
      { id: "prostitution_ring", name: "Prostitution Ring", description: "Run an escort operation.", reward: 25000, risk: 35, xp: 550, levelRequired: 14 },
      { id: "political_corruption", name: "Political Corruption", description: "Bribe politicians for protection.", reward: 80000, risk: 45, xp: 1000, levelRequired: 25 },
      { id: "judicial_bribery", name: "Judicial Bribery", description: "Bribe judges and court officials.", reward: 70000, risk: 40, xp: 900, levelRequired: 23 },
      { id: "police_corruption", name: "Police Corruption", description: "Turn cops into your informants.", reward: 60000, risk: 35, xp: 850, levelRequired: 22 },
      { id: "tax_evasion_net", name: "Tax Evasion Network", description: "Build a network to evade taxes.", reward: 45000, risk: 30, xp: 700, levelRequired: 18 },
      { id: "id_theft_ring", name: "Identity Theft Ring", description: "Organized identity theft operation.", reward: 35000, risk: 40, xp: 650, levelRequired: 17 },
      { id: "cyber_syndicate", name: "Cyber Crime Syndicate", description: "Digital crime empire.", reward: 55000, risk: 50, xp: 800, levelRequired: 20 },
      { id: "border_bribery", name: "Border Control Bribery", description: "Corrupt border officials for easy crossings.", reward: 40000, risk: 45, xp: 700, levelRequired: 19 },
    ],
  },

  // ═══ UNDERGROUND ═══
  {
    id: "underground",
    name: "Underground",
    icon: "💣",
    description: "Deep criminal operations hidden from the surface.",
    crimes: [
      { id: "counterfeiting", name: "Counterfeiting", description: "Print convincing fake currency.", reward: 6000, risk: 40, xp: 350, levelRequired: 5 },
      { id: "drug_trafficking", name: "Drug Trafficking", description: "Move large quantities of product.", reward: 10000, risk: 50, xp: 450, levelRequired: 8 },
      { id: "arson", name: "Arson", description: "Burn it all down for insurance money.", reward: 8000, risk: 55, xp: 425, levelRequired: 7 },
      { id: "underground_id", name: "Identity Theft", description: "Steal and sell personal identities.", reward: 12000, risk: 35, xp: 475, levelRequired: 10 },
      { id: "arms_dealing", name: "Arms Dealing", description: "Sell weapons to the highest bidder.", reward: 20000, risk: 60, xp: 600, levelRequired: 14 },
      { id: "underground_tax", name: "Tax Evasion", description: "Deep cover financial fraud.", reward: 15000, risk: 30, xp: 500, levelRequired: 12 },
      { id: "underground_racket", name: "Racketeering", description: "Control illegal operations city-wide.", reward: 18000, risk: 40, xp: 550, levelRequired: 13 },
      { id: "underground_smuggle", name: "Smuggling Routes", description: "Run established smuggling paths.", reward: 25000, risk: 55, xp: 650, levelRequired: 16 },
      { id: "witness_intim", name: "Witness Intimidation", description: "Silence witnesses before trial.", reward: 8000, risk: 45, xp: 400, levelRequired: 9 },
      { id: "jury_tamper", name: "Jury Tampering", description: "Buy or threaten jurors.", reward: 12000, risk: 35, xp: 450, levelRequired: 11 },
      { id: "evidence_destroy", name: "Evidence Destruction", description: "Destroy incriminating evidence.", reward: 5000, risk: 40, xp: 325, levelRequired: 6 },
      { id: "court_bribery", name: "Courtroom Bribery", description: "Bribe court officials.", reward: 20000, risk: 30, xp: 500, levelRequired: 13 },
      { id: "jailbreak", name: "Jailbreak Planning", description: "Plan an elaborate prison break.", reward: 30000, risk: 70, xp: 750, levelRequired: 18 },
      { id: "fight_ring", name: "Underground Fight Ring", description: "Run an illegal fighting tournament.", reward: 15000, risk: 50, xp: 500, levelRequired: 12 },
      { id: "illegal_gambling", name: "Illegal Gambling Den", description: "Operate an underground casino.", reward: 12000, risk: 35, xp: 450, levelRequired: 11 },
      { id: "pirated_goods", name: "Pirated Goods Distribution", description: "Sell counterfeit products.", reward: 8000, risk: 25, xp: 350, levelRequired: 8 },
      { id: "organ_trade", name: "Organ Trade", description: "Traffic human organs on the black market.", reward: 50000, risk: 80, xp: 1000, levelRequired: 22 },
      { id: "cyber_attack", name: "Cyber Attack", description: "Launch coordinated cyber attacks.", reward: 35000, risk: 55, xp: 700, levelRequired: 17 },
      { id: "data_breach", name: "Data Breach", description: "Hack corporate servers for data.", reward: 25000, risk: 50, xp: 600, levelRequired: 15 },
      { id: "deep_web", name: "Deep Web Operations", description: "Conduct business on the dark web.", reward: 40000, risk: 60, xp: 750, levelRequired: 19 },
      { id: "darknet", name: "Darknet Marketplace", description: "Run a darknet marketplace.", reward: 30000, risk: 45, xp: 650, levelRequired: 16 },
      { id: "cryptojack", name: "Cryptojacking", description: "Hijack systems to mine crypto.", reward: 20000, risk: 40, xp: 550, levelRequired: 14 },
      { id: "ransomware_deploy", name: "Ransomware Deployment", description: "Deploy ransomware on critical systems.", reward: 45000, risk: 65, xp: 800, levelRequired: 20 },
      { id: "zero_day", name: "Zero-Day Exploit", description: "Discover and sell zero-day vulnerabilities.", reward: 60000, risk: 70, xp: 900, levelRequired: 23 },
    ],
  },

  // GTA THEFT (40 energy)
  {
    id: "gta_theft",
    name: "GTA Car Theft",
    icon: "🚗",
    description: "Steal vehicles from junk cars to luxury rides.",
    crimes: [
      { id: "gta_parked_car", name: "Parked Car Theft", description: "Hotwire a car parked on the street.", reward: 25000, risk: 10, xp: 125, levelRequired: 1 },
      { id: "gta_sports_car", name: "Sports Car Theft", description: "Steal a high-performance sports car.", reward: 150000, risk: 25, xp: 200, levelRequired: 4 },
      { id: "gta_luxury_suv", name: "Luxury SUV Theft", description: "Swipe an expensive SUV from a dealership.", reward: 500000, risk: 30, xp: 250, levelRequired: 6 },
      { id: "gta_supercar", name: "Supercar Heist", description: "Steal an exotic hypercar worth millions.", reward: 1500000, risk: 50, xp: 400, levelRequired: 10 },
    ],
  },

  // STEAL FROM HOUSE (40 energy)
  {
    id: "steal_house",
    name: "Steal from House",
    icon: "🏠",
    description: "Break into homes and grab what you can.",
    crimes: [
      { id: "sh_easy_home", name: "Easy Suburban Home", description: "An unlocked door in the suburbs.", reward: 10000, risk: 5, xp: 100, levelRequired: 1 },
      { id: "sh_poor_apartment", name: "Tenant Apartment", description: "A ground-floor apartment with a hidden stash.", reward: 30000, risk: 10, xp: 125, levelRequired: 1 },
      { id: "sh_average_house", name: "Average Family Home", description: "A standard house with a jewelry safe.", reward: 75000, risk: 15, xp: 150, levelRequired: 2 },
      { id: "sh_suburban_mansion", name: "Suburban Mansion", description: "A big house in the wealthy suburbs.", reward: 200000, risk: 25, xp: 200, levelRequired: 5 },
      { id: "sh_penthouse", name: "Downtown Penthouse", description: "A luxury penthouse apartment.", reward: 600000, risk: 40, xp: 350, levelRequired: 8 },
      { id: "sh_rich_estate", name: "Rich Estate", description: "A gated estate with private security.", reward: 2000000, risk: 55, xp: 500, levelRequired: 12 },
      { id: "sh_ceo_condo", name: "CEO Condo", description: "The penthouse of a tech billionaire.", reward: 6000000, risk: 70, xp: 700, levelRequired: 18 },
      { id: "sh_villa_heist", name: "Private Villa Heist", description: "An oceanfront villa with armed guards.", reward: 15000000, risk: 85, xp: 900, levelRequired: 22 },
    ],
  },

  // MURDER (40 energy)
  {
    id: "murder",
    name: "Murder",
    icon: "💀",
    description: "The darkest jobs. Maximum risk, maximum reward.",
    crimes: [
      { id: "mur_back_alley", name: "Back Alley Hit", description: "A quick job in a dark alley.", reward: 2000, risk: 20, xp: 200, levelRequired: 1 },
      { id: "mur_drug_dealer", name: "Drug Dealer Hit", description: "Eliminate a competing dealer.", reward: 5000, risk: 30, xp: 300, levelRequired: 3 },
      { id: "mur_witness", name: "Witness Elimination", description: "Silence a key witness.", reward: 8000, risk: 40, xp: 400, levelRequired: 5 },
      { id: "mur_businessman", name: "Businessman Assassination", description: "Take out a corporate rival.", reward: 15000, risk: 50, xp: 500, levelRequired: 8 },
      { id: "mur_politician", name: "Political Hit", description: "Eliminate a politician.", reward: 30000, risk: 65, xp: 700, levelRequired: 12 },
      { id: "mur_sniper", name: "Sniper Assassination", description: "Long-range precision kill.", reward: 25000, risk: 55, xp: 600, levelRequired: 10 },
      { id: "mur_car_bomb", name: "Car Bombing", description: "Plant explosives on a target vehicle.", reward: 20000, risk: 60, xp: 550, levelRequired: 9 },
      { id: "mur_poison", name: "Poison Contract", description: "A slow, untraceable death.", reward: 18000, risk: 45, xp: 500, levelRequired: 7 },
      { id: "mur_mass_hit", name: "Mass Elimination", description: "Take out multiple targets in one job.", reward: 50000, risk: 80, xp: 900, levelRequired: 18 },
      { id: "mur_donor_removal", name: "Donor Removal", description: "Eliminate a high-value organ donor.", reward: 35000, risk: 70, xp: 750, levelRequired: 15 },
    ],
  },
];

// Specific vehicles granted by each GTA Car Theft option (last = most expensive).
export const GTA_LOOT: Record<string, { name: string; speed: number; storage: number; damage: number; cost: number; armored?: boolean; rarity: string }> = {
  gta_parked_car: { name: "2015 Toyota Corolla XSE", speed: 60, storage: 20, damage: 0, cost: 25000, rarity: "common" },
  gta_sports_car: { name: "2019 BMW M4 Competition", speed: 88, storage: 16, damage: 5, cost: 150000, rarity: "rare" },
  gta_luxury_suv: { name: "2021 Range Rover Autobiography", speed: 82, storage: 30, damage: 0, cost: 500000, rarity: "epic" },
  gta_supercar: { name: "2018 Lamborghini Huracán Performante", speed: 116, storage: 12, damage: 8, cost: 1500000, rarity: "legendary" },
};

// Specific loot granted by each Steal-from-House option (last = most expensive).
export const SH_LOOT: Record<string, { name: string; rarity: string; attack?: number; defense?: number; price: number }> = {
  sh_easy_home: { name: "Coin & Stamp Collection", rarity: "common", defense: 1, price: 10000 },
  sh_poor_apartment: { name: "Hidden Jewelry Case", rarity: "common", defense: 2, price: 30000 },
  sh_average_house: { name: "Solid Gold Watch", rarity: "uncommon", defense: 3, price: 75000 },
  sh_suburban_mansion: { name: "Hi-End Watch Collection", rarity: "uncommon", attack: 2, defense: 4, price: 200000 },
  sh_penthouse: { name: "Original Master Painting", rarity: "rare", attack: 4, defense: 4, price: 600000 },
  sh_rich_estate: { name: "Kilo Gold Bars (5x)", rarity: "rare", attack: 5, defense: 5, price: 2000000 },
  sh_ceo_condo: { name: "Historic Diamond Vault", rarity: "legendary", attack: 6, defense: 6, price: 6000000 },
  sh_villa_heist: { name: "Rare Black Diamond Crown", rarity: "legendary", attack: 10, defense: 10, price: 15000000 },
};

export function getCrimeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    street: "text-green-400",
    robbery: "text-red-400",
    fraud: "text-yellow-400",
    burglary: "text-orange-400",
    drugs: "text-purple-400",
    organized: "text-blue-400",
    underground: "text-gray-400",
    transport: "text-cyan-400",
  };
  return colors[type] || "text-muted-foreground";
}

export function getCrimeTypeBg(type: string): string {
  const bgs: Record<string, string> = {
    street: "bg-green-400/10 border-green-400/20",
    robbery: "bg-red-400/10 border-red-400/20",
    fraud: "bg-yellow-400/10 border-yellow-400/20",
    burglary: "bg-orange-400/10 border-orange-400/20",
    drugs: "bg-purple-400/10 border-purple-400/20",
    organized: "bg-blue-400/10 border-blue-400/20",
    underground: "bg-gray-400/10 border-gray-400/20",
    transport: "bg-cyan-400/10 border-cyan-400/20",
  };
  return bgs[type] || "bg-white/5 border-border";
}

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
  {
    id: "street",
    name: "Street Crimes",
    icon: "🔪",
    description: "Street-level crimes open from your first day. Low risk, steady income.",
    crimes: [
      { id: "pickpocket", name: "Pickpocketing", description: "Lift wallets from unsuspecting pedestrians. Quick hands, quick cash.", reward: 200, risk: 10, xp: 30, levelRequired: 1 },
      { id: "mugging", name: "Mugging", description: "Confront targets on dark streets. Demand their wallet or face the consequences.", reward: 400, risk: 20, xp: 35, levelRequired: 1 },
      { id: "shoplifting", name: "Shoplifting", description: "Stuff your pockets in retail stores. Avoid security cameras.", reward: 300, risk: 15, xp: 30, levelRequired: 1 },
      { id: "phone_snatch", name: "Phone Snatching", description: "Grab a phone from someone hand and bolt through the crowd.", reward: 250, risk: 12, xp: 30, levelRequired: 1 },
      { id: "scrap_metal", name: "Scrap Metal Theft", description: "Strip copper wiring and metal from construction sites.", reward: 350, risk: 8, xp: 30, levelRequired: 1 },
      { id: "egg_smuggle", name: "Egg Smuggling", description: "Transport contraband eggs across city lines for massive profit.", reward: 500, risk: 15, xp: 35, levelRequired: 2 },
      { id: "bootlegging", name: "Bootlegging", description: "Brew and sell unlicensed alcohol from your basement distillery.", reward: 600, risk: 18, xp: 35, levelRequired: 2 },
      { id: "phone_scam", name: "Phone Scam", description: "Run elaborate phone scams on unsuspecting marks.", reward: 300, risk: 8, xp: 30, levelRequired: 1 },
      { id: "fence_stolen", name: "Fence Stolen Goods", description: "Sell hot merchandise to contacts. 40-80% of real value depending on heat.", reward: 450, risk: 10, xp: 30, levelRequired: 1 },
    ],
  },
  {
    id: "robbery",
    name: "Robberies & Heists",
    icon: "💰",
    description: "High-stakes robberies requiring planning and nerve.",
    crimes: [
      { id: "breaking_entering", name: "Breaking & Entering", description: "Pick locks and break into homes. Grab valuables before cops arrive.", reward: 800, risk: 30, xp: 50, levelRequired: 3 },
      { id: "smash_grab", name: "Smash & Grab", description: "Smash store windows, grab jewelry and electronics, flee.", reward: 1200, risk: 35, xp: 55, levelRequired: 4 },
      { id: "armed_robbery", name: "Armed Robbery", description: "Hold up a store at gunpoint. High reward, very high risk.", reward: 2500, risk: 60, xp: 80, levelRequired: 8 },
      { id: "identity_theft", name: "Identity Theft", description: "Steal personal data, open credit lines, drain bank accounts.", reward: 3000, risk: 40, xp: 70, levelRequired: 7 },
      { id: "credit_fraud", name: "Credit Card Fraud", description: "Clone cards and make unauthorized purchases.", reward: 2000, risk: 35, xp: 60, levelRequired: 6 },
      { id: "bank_vault", name: "Bank Vault Heist", description: "Coordinate a crew to rob a bank vault. The ultimate score.", reward: 25000, risk: 85, xp: 200, levelRequired: 18 },
      { id: "armored_car", name: "Armored Car Robbery", description: "Ambush and loot cash transport vehicles on the highway.", reward: 15000, risk: 70, xp: 150, levelRequired: 14 },
      { id: "casino_heist", name: "Casino Heist", description: "Infiltrate the casino vault through air ducts. Ghost or loud.", reward: 35000, risk: 90, xp: 250, levelRequired: 22 },
      { id: "jewelry_heist", name: "Jewelry Store Blitz", description: "Hit multiple jewelry stores simultaneously across a district.", reward: 8000, risk: 55, xp: 100, levelRequired: 10 },
    ],
  },
  {
    id: "fraud",
    name: "Fraud & Scams",
    icon: "🎭",
    description: "Clever cons and financial manipulation for the smooth talker.",
    crimes: [
      { id: "lottery_scam", name: "Lottery Scam", description: "Convince marks they won the lottery. Collect processing fees.", reward: 1500, risk: 20, xp: 45, levelRequired: 4 },
      { id: "tax_evasion", name: "Tax Evasion", description: "Cook the books and dodge the IRS. A classic crime.", reward: 5000, risk: 30, xp: 65, levelRequired: 8 },
      { id: "car_insurance", name: "Car Insurance Scam", description: "Stage accidents and file false insurance claims.", reward: 2000, risk: 25, xp: 50, levelRequired: 5 },
      { id: "romance_scam", name: "Romance Scam", description: "Build fake online relationships. Drain their bank accounts.", reward: 4000, risk: 15, xp: 55, levelRequired: 6 },
      { id: "extortion", name: "Extortion", description: "Collect protection money. Pay up or face consequences.", reward: 3500, risk: 35, xp: 60, levelRequired: 7 },
      { id: "kidnapping", name: "Kidnapping", description: "Abduct a target and demand ransom. High risk, massive payout.", reward: 10000, risk: 70, xp: 120, levelRequired: 12 },
    ],
  },
  {
    id: "transport",
    name: "Illegal Transport",
    icon: "🚛",
    description: "Move contraband between cities for profit.",
    crimes: [
      { id: "smuggle_small", name: "Small Package Run", description: "Carry a small package across city lines. Low profile.", reward: 800, risk: 15, xp: 40, levelRequired: 3 },
      { id: "smuggle_large", name: "Large Cargo Transport", description: "Move a full van of goods through checkpoints.", reward: 3000, risk: 40, xp: 70, levelRequired: 7 },
      { id: "smuggle_dangerous", name: "Dangerous Cargo", description: "Transport volatile materials. One wrong move = boom.", reward: 6000, risk: 55, xp: 90, levelRequired: 10 },
      { id: "smuggle_luxury", name: "Luxury Smuggling", description: "Move high-end stolen goods through international routes.", reward: 12000, risk: 60, xp: 110, levelRequired: 14 },
    ],
  },
];

export function getCrimeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    street: "text-green-400",
    robbery: "text-red-400",
    fraud: "text-yellow-400",
    transport: "text-blue-400",
  };
  return colors[type] || "text-muted-foreground";
}

export function getCrimeTypeBg(type: string): string {
  const bgs: Record<string, string> = {
    street: "bg-green-400/10 border-green-400/20",
    robbery: "bg-red-400/10 border-red-400/20",
    fraud: "bg-yellow-400/10 border-yellow-400/20",
    transport: "bg-blue-400/10 border-blue-400/20",
  };
  return bgs[type] || "bg-white/5 border-border";
}

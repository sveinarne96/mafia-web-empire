// Armoury catalog — guns & protection sold at the Armoury.
// Single source of truth shared by the Convex backend and the UI.

export interface ArmouryItem {
  id: string;
  name: string;
  icon: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  power: number; // attack for guns, defense for protection
  cash: number;
  points: number;
  blurb: string;
}

export const ARMOURY_GUNS: ArmouryItem[] = [
  { id: "gun_street_hide", name: "Street Hide", icon: "🔫", rarity: "Common", power: 12, cash: 8_500_000, points: 8, blurb: "Cheap revolver that never jams. Standard issue for first-timers." },
  { id: "gun_apex_single", name: "Apex Single Shot", icon: "🔫", rarity: "Common", power: 15, cash: 8_500_000, points: 8, blurb: "#1 — Apex Single Shot. One clean round, one clean drop." },
  { id: "gun_viper_9", name: "Viper 9mm", icon: "🔫", rarity: "Common", power: 22, cash: 24_000_000, points: 22, blurb: "Lightweight polymer sidearm with a 15-round magazine." },
  { id: "gun_silent_owl", name: "Silent Owl", icon: "🤫", rarity: "Rare", power: 38, cash: 58_000_000, points: 52, blurb: "Integrally suppressed pistol — neighbours hear nothing." },
  { id: "gun_bloodhound", name: "Bloodhound SMG", icon: "💥", rarity: "Rare", power: 52, cash: 92_000_000, points: 84, blurb: "Compact full-auto. Built for drive-bys and close rooms." },
  { id: "gun_spectre", name: "Spectre Tactical", icon: "🔫", rarity: "Rare", power: 66, cash: 137_000_000, points: 125, blurb: "Tricked-out carbine with rails, red dot and a long reach." },
  { id: "gun_iron_widow", name: "Iron Widow Shotgun", icon: "💥", rarity: "Epic", power: 88, cash: 168_000_000, points: 152, blurb: "Pump-action menace. Buckshot clears rooms in one pull." },
  { id: "gun_executioner", name: "Executioner .50", icon: "🎯", rarity: "Epic", power: 120, cash: 195_000_000, points: 178, blurb: "Anti-material rifle that deletes whatever it touches." },
  { id: "gun_shadow_emperor", name: "Shadow Emperor Rifle", icon: "🌑", rarity: "Legendary", power: 165, cash: 294_000_000, points: 268, blurb: "One of three built for the empire. Whisper-quiet, surgical." },
  { id: "gun_godfather", name: "Godfather Custom", icon: "👑", rarity: "Legendary", power: 220, cash: 400_000_000, points: 360, blurb: "Hand-fitted, gold-inlaid, perfectly balanced. A collector's execution piece." },
];

export const ARMOURY_PROTECTION: ArmouryItem[] = [
  { id: "prot_street_hide", name: "Street Hide", icon: "🦺", rarity: "Common", power: 10, cash: 8_500_000, points: 8, blurb: "Padded jacket. Stops a knife, slows a bullet." },
  { id: "prot_kevlar_vest", name: "Kevlar Vest", icon: "🛡️", rarity: "Common", power: 18, cash: 19_000_000, points: 18, blurb: "NIJ Level IIIA. Everyday workwear for the working criminal." },
  { id: "prot_riot_plate", name: "Riot Plate Carrier", icon: "🛡️", rarity: "Common", power: 26, cash: 34_000_000, points: 32, blurb: "Ceramic plates front and back. Built for the worst districts." },
  { id: "prot_shadow_weave", name: "Shadow Weave Suit", icon: "🤵", rarity: "Rare", power: 42, cash: 71_000_000, points: 65, blurb: "Bulletproof tailoring that still fits under a dinner jacket." },
  { id: "prot_blackguard", name: "Blackguard Armor", icon: "🛡️", rarity: "Rare", power: 58, cash: 118_000_000, points: 107, blurb: "Full torso protection with articulated joints. Mob standard." },
  { id: "prot_phoenix_rig", name: "Phoenix Blast Rig", icon: "🔥", rarity: "Epic", power: 78, cash: 156_000_000, points: 141, blurb: "Stops rifle rounds and shrugs off shrapnel. You get back up." },
  { id: "prot_iron_court", name: "Iron Court Exo", icon: "⚙️", rarity: "Epic", power: 104, cash: 210_000_000, points: 190, blurb: "Powered plating with trauma padding. Slow walk, unstoppable." },
  { id: "prot_obsidian_shell", name: "Obsidian Shell", icon: "🖤", rarity: "Legendary", power: 140, cash: 268_000_000, points: 243, blurb: "Experimental composite. Dealer plates laugh at AP rounds." },
  { id: "prot_emperor_shroud", name: "Emperor Shroud", icon: "👑", rarity: "Legendary", power: 182, cash: 351_000_000, points: 318, blurb: "Woven graphene for the throne room. Nearly impossible to put down." },
  { id: "prot_reaper_vault", name: "Reaper Vault Suit", icon: "💀", rarity: "Legendary", power: 232, cash: 420_000_000, points: 380, blurb: "The last word in protection. Death came, got turned away." },
];

// Whole-category bundle pricing (Buy All).
export const GUN_BUNDLE = {
  cash: ARMOURY_GUNS.reduce((s, g) => s + g.cash, 0), // $739.5M
  points: ARMOURY_GUNS.reduce((s, g) => s + g.points, 0),
  igCoins: 1,
};
export const PROT_BUNDLE = {
  cash: ARMOURY_PROTECTION.reduce((s, p) => s + p.cash, 0),
  points: ARMOURY_PROTECTION.reduce((s, p) => s + p.points, 0),
  igCoins: 1,
};

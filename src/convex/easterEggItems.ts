// ===== EASTER EGG VAULT — 560 unique items that can hatch from Easter Eggs =====
// Each item gets a deterministic rarity + randomized price at drop time.

const WEAPONS = "Dragonbone Katana|Void Reaver Axe|Serpent Fang Dagger|Thunderclap Warhammer|Obsidian Cleaver|Ghostwalk Rapier|Bloodmoon Scimitar|Titanbreaker Maul|Shadowstep Kukri|Stormforged Halberd|Crimson Widow Blade|Iron Emperor Scepter|Nightshade Throwing Stars|Phoenix Talon Spear|Frostbane Greatsword|Viper's Kiss Pistol|Golden Gun of Capone|Whisper Silenced Sniper|Hellfire Shotgun|Reaper's Scythe|Executioner's Cleaver|Twin Dragon Pistols|Bonecrusher Knuckles|Venomfang Kris|Eclipse Longbow|Midnight Stiletto|Warlord's Chainblade|Sapphire Edge Saber|Ruby Thorn Whip|Onyx Piercer Crossbow|Molten Core Lance|Arctic Wolf Bowie|Cursed Pirate Cutlass|Samurai Lord's Katana|Gladiator's Trident|Assassin's Garrote Wire|Mafia Don's Cane Sword|Bootlegger's Tommy Gun|Speakeasy Slugger|Diamond Dust Shiv|Platinum Knuckle Dusters|Emerald Fang Dirk|Obsidian Skull Crusher|Lightning Rod Staff|Grave Digger Shovel|Butcher's Hook|Silent Death Blowgun|Chrome Vulture Revolver|Titanium Fang Machete|Royal Guard Saber|Chaos Bringer Greataxe|Serpent Coil Bow|Wraith Binder Chains|Inferno Thrower|Frostbite Claw Gauntlets|Kingmaker Broadsword|Last Rites Dagger|Storm Caller Javelin|Doom Herald Flail|Godslayer Greatblade";

const ARMOR = "Dragonscale Cuirass|Phantom Veil Cloak|Titan Plate Armor|Shadow Weave Suit|Bulwark of Ages|Crimson Guard Vest|Mithril Chainmail|Warden's Riot Shield|Ghost Skin Jacket|Imperial Bodyguard Suit|Bulletproof Emperor Coat|Obsidian Bone Plating|Phoenix Feather Mantle|Frostwolf Fur Cloak|Viper Scale Shirt|Golden Aegis Breastplate|Night Stalker Hood|Iron Syndicate Vest|Diamond Mesh Underlayer|Kevlar Kingpin Coat|Serpent Hide Robes|Thunder Guard Pauldrons|Eclipse Sentinel Armor|Blood Warden Plate|Arctic Hunter Parka|Desert Phantom Shroud|Steel Monarch Gauntlets|Raven Feather Cloak|Gilded Mobster Vest|Underground Boss Armor|Whisper Wind Cape|Molten Shield Pauldron|Jade Emperor Robe|Onyx Guard Helm|Silver Wolf Chestplate|Storm Rider Leathers|Void Walker Mantle|Royal Decree Armor|Last Stand Barrier Vest|Godfather's Silk-Lined Suit|Executioner's Mask|Bone Lord Ribcage Plate|Crystal Bastion Shield|Emerald Serpent Scale|Platinum Guardian Plate|Ruby Warlord Cuirass|Sapphire Aegis Mail|Titanium Riot Gear|Umbra Assassin Wraps|Victory Warden Armor";

const JEWELS = "Flawless Hope Diamond|Star of Bombay Sapphire|Imperial Green Emerald|Pigeon Blood Ruby|Black Opal of Midnight|Kashmir Blue Sapphire|Alexandrite Eye Stone|Pink Star Diamond|Great Mogul Diamond|Cursed Amethyst Skull|Fire Heart Ruby|Ocean Tear Pearl|Golden South Sea Pearl|Paraiba Tourmaline|Burmese Jade Boulder|Tanzanite Crown Gem|Black Orlov Diamond|Regent Diamond|Hope Mirror Opal|Sunburst Yellow Diamond|Blood Red Garnet Cluster|Moonstone of Selene|Emerald Eye of Cthulhu|Diamond Encrusted Crown|Platinum Nugget of Kings|Rose Quartz Colossus|Amber Fossil with Dragonfly|Peridot of Volcanoes|Aquamarine Mermaid Tear|Spinel of Emperors|Zircon Star Fragment|Onyx Panther Brooch|Cat's Eye Chrysoberyl|Morganite Heart Stone|Lapis Lazuli Sarcophagus Piece|Turquoise Thunderbird|Malachite Pharaoh Mask|Kunzite Angel Wing|Demantoid Tsavorite|Rubellite Torch Stone|Iolite Water Sapphire|Fire Agate Dragon Egg Stone|Rainbow Moonstone Orb|Jet Black Pearls Dozen|Canary Diamond Pendant|Sapphire Serpent Ring|Emerald Duchess Parure|Ruby Sultan's Turban Ornament|Diamond Duchess Necklace|Imperial Jade Seal";

const ARTIFACTS = "Terracotta Warrior Statue|Rosetta Fragment Replica|Ark of Covenant Shard|Holy Grail Chalice|Excalibur Blade Hilt|Troy's Golden Mask|Tutankhamun Death Mask|Dead Sea Scroll Case|Antikythera Mechanism|Baghdad Battery|Crystal Skull of Doom|Philosopher's Stone Tablet|Fountain of Youth Vial|Noah's Ark Timber Piece|Sphinx Paw Statue|Pompeii Bronze Mirror|Viking Sunstone|Aztec Sun Stone Disc|Maya Codex Original Page|Egyptian Book of the Dead|Sumerian King List Tablet|Oracle Bone of Shang|Terracotta Army Horse|Alexander's Signet Ring|Caesar's Laurel Crown|Napoleon's Saber|Mona Lisa Study Sketch|Gutenberg Press Type Block|Shakespeare First Folio|Magna Carta Wax Seal|Columbus Compass|Magellan Astrolabe|Da Vinci Flying Machine Model|Tesla Death Ray Blueprint|Newton's Apple Prism|Galileo Telescope Lens|Mozart's Lost Symphony Sheet|Beethoven's Unfinished Piano Roll|Cleopatra's Perfume Flask|Nefertiti Bust Miniature|Samurai Shogun Armor Piece|Ninja Clan Scroll|Shaolin Iron Palm Manual|Druid Oak Talisman|Celtic Torc of Kings|Norse Rune Stone|Odin's Missing Eye Gem|Thor Hammer Pendant|Anubis Canopic Jar|Phoenix Ash Urn";

const COLLECTIBLES = "Babe Ruth Signed Baseball|Honus Wagner T-206 Card|Black Lotus Trading Card|Action Comics #1 Copy|Batman Detective #27|Mickey Mouse Cel Original|Beatles White Album Pressing|Elvis' Gold Cadillac Key|Marilyn Monroe Dress Pin|James Dean Jacket Button|Michael Jordan Rookie Card|Muhammad Ali Glove Lace|Secretariat Horseshoe|Seabiscuit Saddle Stirrup|Ferrari 250 GTO Hood Ornament|Bugatti Royale Radiator Cap|Rolls Royce Spirit of Ecstasy|Aston Martin DB5 Gadget Kit|Steve McQueen Sunglasses|Frank Sinatra Fedora|Al Capone Cigar Band|Lucky Luciano Pocket Watch|Bugsy Siegel Casino Chip|Bonnie Clyde Barrow Poem|Jesse James Revolver Holster|Wild Bill Hickok Derringer|Calamity Jane Rifle Stock|Buffalo Bill Show Poster|Annie Oakley Target Medal|Houdini Handcuff Set|Tesla Coil Desk Model|Edison First Light Bulb|Wright Brothers Propeller Splinter|Lindbergh Flight Medal|Amelia Earhart Flight Scarf|Apollo 11 Moon Rock Fragment|Yuri Gagarin Cosmonaut Pin|Challenger Mission Patch|Titanic Deck Chair Plaque|Lusitania Salvage Bell|Pirate Doubloon Chest|Spanish Galleon Gold Bar|Aztec Calendar Coin|Roman Denarii Hoard|Greek Drachma Collection|Byzantine Icon Triptych|Fabergé Egg Imperial Edition|Fabergé Egg Winter Edition|Stradivarius Violin Bow|Guarneri del Gesù Viola|Ming Dynasty Vase";

const GADGETS = "Quantum Decryptor Device|Ghost Protocol Communicator|Invisibility Cloak Prototype|Neural Interface Headset|Holographic Disguise Projector|EMP Pulse Emitter|Laser Grid Bypass Kit|Thermal Vision Goggles|Sonar Ear Implant Replica|Nano Drone Swarm Pod|Biometric Lockpick Set|Satellite Uplink Briefcase|Voice Mimic Collar|Memory Eraser Pen|Bullet Time Watch|Gravity Boots Prototype|Plasma Cutter Torch|Sonic Silencer Device|X-Ray Scanner Glasses|Polygraph Jammer|Face Shift Mask Printer|DNA Splicer Kit|Retinal Clone Lens|Signal Ghost Router|Data Vault Cube|Crypto Cold Wallet Max|Quantum Dice Set|Probability Calculator Chip|Lockdown Override Key|Vault Breacher Charge|Silent Taser Umbrella|Poison Dart Cufflink|Smoke Screen Tie Clip|Grappling Hook Belt|Parachute Cuff Blazer|Bulletproof Umbrella|Tracking Bug Sweeper|Hidden Blade Wristwatch|Camera Contact Lenses|Recorder Button Flower|Escape Powder Ring|Flash Bang Lighter|Taser Gloves Deluxe|Night Vision Monocle|Decoder Ring Supreme|Cipher Wheel Ancient|Microfilm Tie Tack|Hollow Heel Shoes|Gas Mask Pocket Watch|Caltrop Cigarette Pack|Wire Tap Lapel Pin";

const CONTRABAND = "Cuban Dictator Reserve Cigars|Prohibition Whiskey Barrel|Original Absinthe Recipe|Moonshine Still Blueprint|Counterfeit Mint Plates|Forged Currency Plates|Fake Passport Library|Cloned Credit Card Stack|Laundered Bond Certificates|Stolen Picasso Lithograph|Van Gogh Lost Sketch|Rembrandt Etching Plate|Fabergé Forgery Master Mold|Uncut Diamond Parcel|Blood Ruby Shipment|Ancient Amber Cache|Rare Orchid Smuggling Case|Vintage Wine Château Case|1926 Macallan Bottle|Napoleon Cognac Crate|Sake Emperor Barrel|Tequila Añejo Reserve|Vodka Czar Cellar Case|Royal Havana Humidor|Gambling Den Ledger|Casino Skim Bag|Numbers Racket Book|Loan Shark Ledger|Protection Money Map|Dock Worker Bribe List|Border Tunnel Blueprints|Harbor Master's Silence Contract|Union Strike Bribe Fund|Election Ballot Bundle|Jury Tampering Envelope|Witness Protection File|Evidence Room Master Key|Police Auction Insider List|Confiscated Goods Manifest|Customs Forged Stamp Set|Ship Manifest Alteration Kit|Container Switch Manifest|Night Cargo Priority Pass|Airfield Landing Lights Code|Runway Access Master Card|Hangar Seven Rental Deed|Submarine Fuel Requisition|Speedboat Racing Papers|Getaway Driver Registry|Safe Cracker Toolchest";

const RELICS = "Excalibur Scabbard Fragment|Spear of Destiny Tip|Thor's Hammer Core|Zeus Lightning Shard|Poseidon Trident Prong|Hades Helm Fragment|Athena Aegis Scale|Apollo Sun Disk|Artemis Silver Arrowhead|Hermes Winged Sandal Buckle|Dionysus Wine Krater|Midas Golden Touch Coin|Pandora Box Lid|Prometheus Flame Ember|Atlas Shoulder Titan Core|Hydra Fang Vial|Minotaur Horn Trophy|Medusa Shield Fragment|Phoenix Rebirth Feather|Griffin Claw Talisman|Dragon Heart Ember Stone|Unicorn Horn Spiral|Kraken Ink Vial|Leviathan Scale Plate|Behemoth Bone Carving|Serpent of Eden Scale|Tree of Life Seed Pod|Fountain Elixir Residue|Elixir of Immortality Vial|Philosopher Catalyst Stone|Alchemist Transmutation Circle|Necronomicon Bound Page|Cthulhu Idol Miniature|Atlantis Tide Jewel|El Dorado Gold Idol|Shangri-La Lotus Blossom|Avalon Mist Vial|Valhalla Mead Horn|Olympus Ambrosia Jar|Titan Chain Link";

const CURIOS = "Victorian Music Box|Brass Chronometer Marine|Antique Dueling Pistol Pair|Clockwork Automaton Bird|Mechanical Fortune Teller|Zoetrope Motion Drum|Magic Lantern Slide Set|Stereoscope Photo Viewer|Phonograph Horn Deluxe|Player Piano Scroll Library|Typewriter Hemingway Used|Fountain Pen of Diplomats|Wax Cylinder Opera Recording|Daguerreotype Family Portrait|Tin Type Civil War Photo|Cabinet Card Circus Performers|Penny Farthing Bicycle Bell|Steam Engine Whistle|Railroad Lantern Conductor|Stagecoach Strongbox Lock|Wells Fargo Saddlebags|Pony Express Mail Satchel|Telegraph Key Operator|Morse Code Practice Set|Sextant Navigator's Pride|Astrolabe Brass Engraved|Barometer Storm Glass|Telescope Spyglass Captain|Diving Helmet Copper Mark V|Submarine Periscope Lens|Hot Air Balloon Basket Weave|Zeppelin Navigation Chart|Orient Express Ticket Punch|Grand Hotel Room Key Rack|Speakeasy Door Peephole Scope|Prohibition Agent Badge|Federal Marshal Star|Sheriff Tin Star Texas|Wanted Poster Original Print|Gallows Rope Segment Display|Prison Ball and Chain Miniature|Alcatraz Cell Door Key|Devil's Island Shackle|Guillotine Blade Letter Opener|Medieval Dungeon Key Ring|Iron Maiden Display Model|Apothecary Cabinet Full Set|Doctor's Bloodletting Kit|Barber Surgeon Razor Set|Dentist Tooth Key Victorian|Optician Trial Lens Case|Chemist Mortar Pestle Silver|Botanist Fern Pressing Album|Entomologist Butterfly Case|Taxidermy Raven Glass Dome|Naturalist Shell Collection|Miner's Gold Pan Nugget|Prospector Claim Map 1849|Cowboy Spur Silver Inlaid|Indian Peace Medal Treaty Era|Frontier Scout Knife Sheath";

const LUXURY = "Solid Gold Business Card|Platinum Cigar Holder|Diamond Encrusted Phone|Ostrich Leather Attaché|Crocodile Skin Briefcase|Ermine Fur Winter Coat|Sable Fur Stole Imperial|Cashmere Himalayan Shawl|Silk Dragon Embroidered Robe|Persian Carpet Museum Grade|Aubusson Tapestry Wall Panel|Baccarat Crystal Chandelier|Carrara Marble Venus Statue|Rodin Bronze Casting Study|Old Master Oil Painting|Monet Watercolor Study|Picasso Era Charcoal Sketch|Sumi-e Master Ink Scroll|Emperor Calligraphy Brush Set|Ebony & Gold Piano Keys";

const EGG_SPECIALS = "Golden Yolk of Fortune|Rainbow Shell Fragment|Chocolate Dragon Egg|Crystal Nest Stone|Phoenix Eggshell Powder|Roc Giant Feather Inside|Basilisk Petrified Egg|Cockatrice Crest Stone|Nest of Midas Straw|Egg Hunt Champion Trophy|Bunny Mask of Luck|Spring Festival Lantern|Painted Folk Art Egg Set|Fabergé Hen Egg Surprise|Egg Timer of Destiny|Omelette du Fromage Recipe Book|Silver Deviled Egg Platter|Eggcellent Armor Polish|Sunny Side Up Sunglasses|Scrambled Map Fragment|Poached Treasure Net|Eggshell Mosaic Artwork|Quail Egg Pearl Necklace|Ostrich Egg Drinking Vessel|Carved Emu Egg Cameo|Turtle Egg Beach Cache|Crocodile Nest Guard Stone|Platypus Mystery Pouch|Last Dodo Egg Ever|Jurassic Amber Egg";

interface PoolGroup { type: string; icon: string; names: string[] }

const GROUPS: PoolGroup[] = [
  { type: "weapon", icon: "⚔️", names: WEAPONS.split("|") },
  { type: "armor", icon: "🛡️", names: ARMOR.split("|") },
  { type: "jewel", icon: "💎", names: JEWELS.split("|") },
  { type: "artifact", icon: "🏺", names: ARTIFACTS.split("|") },
  { type: "collectible", icon: "🖼️", names: COLLECTIBLES.split("|") },
  { type: "gadget", icon: "🕶️", names: GADGETS.split("|") },
  { type: "contraband", icon: "📦", names: CONTRABAND.split("|") },
  { type: "relic", icon: "🔮", names: RELICS.split("|") },
  { type: "curio", icon: "🕰️", names: CURIOS.split("|") },
  { type: "luxury", icon: "👑", names: LUXURY.split("|") },
  { type: "egg_special", icon: "🥚", names: EGG_SPECIALS.split("|") },
];

export const EGG_POOL_SIZE = GROUPS.reduce((n, g) => n + g.names.length, 0);

const PRICE_RANGE: Record<string, [number, number]> = {
  common: [100_000, 1_000_000],
  uncommon: [1_000_000, 5_000_000],
  rare: [5_000_000, 20_000_000],
  epic: [20_000_000, 75_000_000],
  legendary: [75_000_000, 250_000_000],
};

function pickRarity(i: number): string {
  const h = (i * 37 + 13) % 100;
  if (h < 8) return "legendary";
  if (h < 25) return "epic";
  if (h < 55) return "rare";
  if (h < 82) return "uncommon";
  return "common";
}

/** Roll one random item out of the 560-item vault. */
export function rollEggPoolItem(): { name: string; type: string; icon: string; rarity: string; price: number } {
  const gi = Math.floor(Math.random() * GROUPS.length);
  const group = GROUPS[gi];
  const ni = Math.floor(Math.random() * group.names.length);
  const baseName = group.names[ni];
  const rarity = pickRarity(gi * 61 + ni);
  const [min, max] = PRICE_RANGE[rarity];
  const price = min + Math.floor(Math.random() * ((max - min) / 50_000)) * 50_000;
  const prefix: Record<string, string> = {
    common: "", uncommon: "✨ ", rare: "💠 ", epic: "🌟 ", legendary: "🌟🌟 ",
  };
  return { name: `${group.icon}${prefix[rarity]}${baseName}`, type: group.type, icon: group.icon, rarity, price };
}

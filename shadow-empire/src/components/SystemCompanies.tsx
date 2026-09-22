import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ═══════════ BUSINESS DATA ═══════════ */

type Business = {
  name: string;
  icon: string;
  cost: number;
  income: number;
  level: number;
  maxLevel: number;
  desc: string;
  category: string;
};

const ALL_BUSINESSES: Record<string, Business[]> = {
  restaurants: [
    { name: "Pizza Shop", icon: "🍕", cost: 50000, income: 3000, level: 0, maxLevel: 10, desc: "Classic front, steady income", category: "restaurants" },
    { name: "Italian Restaurant", icon: "🍝", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "High-end mafia staple", category: "restaurants" },
    { name: "Chinese Restaurant", icon: "🥡", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Triad front", category: "restaurants" },
    { name: "Mexican Restaurant", icon: "🌮", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Cartel front", category: "restaurants" },
    { name: "Japanese Sushi Bar", icon: "🍣", cost: 180000, income: 11000, level: 0, maxLevel: 10, desc: "Yakuza front", category: "restaurants" },
    { name: "Steakhouse", icon: "🥩", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Wealthy clientele", category: "restaurants" },
    { name: "Seafood Restaurant", icon: "🦐", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Dock income", category: "restaurants" },
    { name: "Bakery", icon: "🥐", cost: 40000, income: 2500, level: 0, maxLevel: 10, desc: "Low cost, steady profit", category: "restaurants" },
    { name: "Food Truck", icon: "🚚", cost: 30000, income: 2000, level: 0, maxLevel: 10, desc: "Mobile, cheap startup", category: "restaurants" },
    { name: "Coffee Shop", icon: "☕", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "Low overhead, high volume", category: "restaurants" },
    { name: "Ice Cream Parlor", icon: "🍦", cost: 45000, income: 3500, level: 0, maxLevel: 10, desc: "Family-friendly front", category: "restaurants" },
    { name: "Brewery", icon: "🍺", cost: 350000, income: 20000, level: 0, maxLevel: 10, desc: "Craft beer money", category: "restaurants" },
    { name: "Distillery", icon: "🥃", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "High-end spirits", category: "restaurants" },
    { name: "Winery", icon: "🍷", cost: 800000, income: 45000, level: 0, maxLevel: 10, desc: "Luxury wine production", category: "restaurants" },
    { name: "Candy Shop", icon: "🍬", cost: 35000, income: 2000, level: 0, maxLevel: 10, desc: "Kids love it, easy money", category: "restaurants" },
    { name: "Deli / Sandwich Shop", icon: "🥪", cost: 45000, income: 3000, level: 0, maxLevel: 10, desc: "Quick service", category: "restaurants" },
    { name: "Diner", icon: "🍳", cost: 70000, income: 5000, level: 0, maxLevel: 10, desc: "24/7 operations", category: "restaurants" },
    { name: "Fast Food Chain", icon: "🍔", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Scale fast", category: "restaurants" },
    { name: "Catering Company", icon: "🍱", cost: 80000, income: 5500, level: 0, maxLevel: 10, desc: "Event money", category: "restaurants" },
    { name: "Vending Machine Route", icon: "🏧", cost: 20000, income: 1200, level: 0, maxLevel: 10, desc: "Passive income", category: "restaurants" },
    { name: "Farmer's Market Stand", icon: "🧺", cost: 15000, income: 1000, level: 0, maxLevel: 10, desc: "Fresh produce", category: "restaurants" },
    { name: "Organic Farm", icon: "🌱", cost: 250000, income: 16000, level: 0, maxLevel: 10, desc: "Premium produce", category: "restaurants" },
    { name: "Cannabis Dispensary", icon: "🌿", cost: 600000, income: 50000, level: 0, maxLevel: 10, desc: "Legal weed money", category: "restaurants" },
    { name: "Mushroom Farm", icon: "🍄", cost: 100000, income: 7000, level: 0, maxLevel: 10, desc: "Specialty ingredients", category: "restaurants" },
  ],
  hospitality: [
    { name: "Hotel", icon: "🏨", cost: 1000000, income: 60000, level: 0, maxLevel: 10, desc: "Tourist money", category: "hospitality" },
    { name: "Motel", icon: "🏩", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Budget travelers", category: "hospitality" },
    { name: "Hostel", icon: "🛏️", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Backpackers", category: "hospitality" },
    { name: "Bed & Breakfast", icon: "🏡", cost: 150000, income: 8000, level: 0, maxLevel: 10, desc: "Cozy income", category: "hospitality" },
    { name: "Luxury Resort", icon: "🏖️", cost: 5000000, income: 150000, level: 0, maxLevel: 10, desc: "High-end guests", category: "hospitality" },
    { name: "Casino Hotel", icon: "🎰", cost: 3000000, income: 120000, level: 0, maxLevel: 10, desc: "Gambling + rooms", category: "hospitality" },
    { name: "Conference Center", icon: "🎤", cost: 800000, income: 40000, level: 0, maxLevel: 10, desc: "Business events", category: "hospitality" },
    { name: "Event Venue", icon: "💒", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Weddings, parties", category: "hospitality" },
    { name: "Airbnb Management", icon: "🏠", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Rent out properties", category: "hospitality" },
    { name: "RV Park", icon: "🚐", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Road trippers", category: "hospitality" },
    { name: "Camping Ground", icon: "⛺", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Nature tourism", category: "hospitality" },
    { name: "Marina / Boat Slip Rental", icon: "⛵", cost: 1500000, income: 80000, level: 0, maxLevel: 10, desc: "Dock fees", category: "hospitality" },
    { name: "Helicopter Tour Company", icon: "🚁", cost: 2000000, income: 100000, level: 0, maxLevel: 10, desc: "Scenic flights", category: "hospitality" },
    { name: "Travel Agency", icon: "✈️", cost: 120000, income: 7000, level: 0, maxLevel: 10, desc: "Booking commissions", category: "hospitality" },
    { name: "Tour Guide Company", icon: "🗺️", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "City tours", category: "hospitality" },
    { name: "Limo Service", icon: "🚗", cost: 400000, income: 22000, level: 0, maxLevel: 10, desc: "VIP transport", category: "hospitality" },
    { name: "Party Bus Company", icon: "🚌", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Nightlife transport", category: "hospitality" },
    { name: "Airport Shuttle", icon: "🚐", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Reliable income", category: "hospitality" },
    { name: "Car Rental Agency", icon: "🚙", cost: 500000, income: 28000, level: 0, maxLevel: 10, desc: "Vehicle fleet income", category: "hospitality" },
  ],
  auto: [
    { name: "Auto Repair Shop", icon: "🔧", cost: 100000, income: 7000, level: 0, maxLevel: 10, desc: "Mechanic income", category: "auto" },
    { name: "Body Shop", icon: "🎨", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Paint and collision repair", category: "auto" },
    { name: "Tire Shop", icon: "🛞", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Quick service", category: "auto" },
    { name: "Oil Change Chain", icon: "🛢️", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Fast turnover", category: "auto" },
    { name: "Car Wash", icon: "🧽", cost: 70000, income: 4500, level: 0, maxLevel: 10, desc: "Steady traffic", category: "auto" },
    { name: "Detailing Service", icon: "✨", cost: 50000, income: 3500, level: 0, maxLevel: 10, desc: "Premium cleaning", category: "auto" },
    { name: "Custom Garage", icon: "⚙️", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Aftermarket mods", category: "auto" },
    { name: "Towing Company", icon: "🚛", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Impound + fees", category: "auto" },
    { name: "Junkyard", icon: "♻️", cost: 150000, income: 8000, level: 0, maxLevel: 10, desc: "Scrap metal money", category: "auto" },
    { name: "Used Car Dealership", icon: "🚗", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Buy low, sell high", category: "auto" },
    { name: "Luxury Car Dealership", icon: "🏎️", cost: 2000000, income: 120000, level: 0, maxLevel: 10, desc: "High margin", category: "auto" },
    { name: "Motorcycle Dealership", icon: "🏍️", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Bike sales", category: "auto" },
    { name: "Boat Dealership", icon: "🚤", cost: 1500000, income: 80000, level: 0, maxLevel: 10, desc: "Watercraft sales", category: "auto" },
    { name: "Trucking Company", icon: "🚚", cost: 800000, income: 50000, level: 0, maxLevel: 10, desc: "Freight hauling", category: "auto" },
    { name: "Moving Company", icon: "📦", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Relocation services", category: "auto" },
    { name: "Delivery Service", icon: "📮", cost: 100000, income: 7000, level: 0, maxLevel: 10, desc: "Package delivery", category: "auto" },
    { name: "Courier Service", icon: "🏃", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "Fast delivery", category: "auto" },
    { name: "Taxi Company", icon: "🚕", cost: 250000, income: 14000, level: 0, maxLevel: 10, desc: "Ride service", category: "auto" },
    { name: "Driving School", icon: "🎓", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Teach to drive", category: "auto" },
    { name: "Auto Parts Store", icon: "🔩", cost: 120000, income: 7500, level: 0, maxLevel: 10, desc: "Parts sales", category: "auto" },
    { name: "Scrap Metal Yard", icon: "🏗️", cost: 200000, income: 11000, level: 0, maxLevel: 10, desc: "Recycled metal", category: "auto" },
    { name: "Junk Car Buyer", icon: "🗑️", cost: 50000, income: 3000, level: 0, maxLevel: 10, desc: "Buy cheap, sell parts", category: "auto" },
    { name: "Fleet Management", icon: "📋", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Manage vehicle groups", category: "auto" },
    { name: "Auto Auction", icon: "🏷️", cost: 600000, income: 35000, level: 0, maxLevel: 10, desc: "Buy/sell wholesale", category: "auto" },
  ],
  construction: [
    { name: "Construction Company", icon: "🏗️", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Build buildings", category: "construction" },
    { name: "Demolition Company", icon: "💣", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Tear down buildings", category: "construction" },
    { name: "Roofing Company", icon: "🏠", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Essential service", category: "construction" },
    { name: "Plumbing Company", icon: "🚿", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Always needed", category: "construction" },
    { name: "Electrical Company", icon: "⚡", cost: 180000, income: 11000, level: 0, maxLevel: 10, desc: "High demand", category: "construction" },
    { name: "HVAC Company", icon: "🌡️", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Climate control", category: "construction" },
    { name: "Painting Company", icon: "🖌️", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "Interior/exterior", category: "construction" },
    { name: "Landscaping Company", icon: "🌳", cost: 80000, income: 5500, level: 0, maxLevel: 10, desc: "Yard work", category: "construction" },
    { name: "Lawn Care Service", icon: "🌿", cost: 30000, income: 2000, level: 0, maxLevel: 10, desc: "Weekly income", category: "construction" },
    { name: "Snow Removal Service", icon: "❄️", cost: 40000, income: 2500, level: 0, maxLevel: 10, desc: "Seasonal", category: "construction" },
    { name: "Pest Control", icon: "🐛", cost: 70000, income: 4500, level: 0, maxLevel: 10, desc: "Bug problems", category: "construction" },
    { name: "Cleaning Company", icon: "🧹", cost: 50000, income: 3000, level: 0, maxLevel: 10, desc: "Janitorial", category: "construction" },
    { name: "Property Management", icon: "🏢", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Manage buildings", category: "construction" },
    { name: "Real Estate Agency", icon: "🏘️", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Buy/sell homes", category: "construction" },
    { name: "Home Inspection", icon: "🔍", cost: 50000, income: 3500, level: 0, maxLevel: 10, desc: "Pre-sale checks", category: "construction" },
    { name: "Appraisal Company", icon: "📊", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Value estimates", category: "construction" },
    { name: "Title Company", icon: "📜", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Paperwork", category: "construction" },
    { name: "Mortgage Broker", icon: "🏦", cost: 250000, income: 16000, level: 0, maxLevel: 10, desc: "Loan facilitation", category: "construction" },
    { name: "Interior Design", icon: "🎨", cost: 100000, income: 7000, level: 0, maxLevel: 10, desc: "Luxury upgrades", category: "construction" },
    { name: "Architecture Firm", icon: "📐", cost: 350000, income: 22000, level: 0, maxLevel: 10, desc: "Building design", category: "construction" },
    { name: "Engineering Firm", icon: "⚙️", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Structural work", category: "construction" },
    { name: "Surveying Company", icon: "📍", cost: 120000, income: 7500, level: 0, maxLevel: 10, desc: "Land measurement", category: "construction" },
    { name: "Concrete Company", icon: "🧱", cost: 200000, income: 13000, level: 0, maxLevel: 10, desc: "Foundation work", category: "construction" },
    { name: "Lumber Yard", icon: "🪵", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Building materials", category: "construction" },
    { name: "Hardware Store", icon: "🔨", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Tools and supplies", category: "construction" },
    { name: "Building Supply Store", icon: "📦", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Wholesale materials", category: "construction" },
  ],
  finance: [
    { name: "Investment Firm", icon: "📈", cost: 1000000, income: 60000, level: 0, maxLevel: 10, desc: "Manage portfolios", category: "finance" },
    { name: "Hedge Fund", icon: "💰", cost: 3000000, income: 150000, level: 0, maxLevel: 10, desc: "Aggressive investing", category: "finance" },
    { name: "Private Equity", icon: "💎", cost: 5000000, income: 250000, level: 0, maxLevel: 10, desc: "Buy and improve companies", category: "finance" },
    { name: "Venture Capital", icon: "🚀", cost: 2000000, income: 100000, level: 0, maxLevel: 10, desc: "Fund startups", category: "finance" },
    { name: "Pawn Shop", icon: "🏪", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Collateral loans", category: "finance" },
    { name: "Payday Lender", icon: "💵", cost: 200000, income: 15000, level: 0, maxLevel: 10, desc: "Short-term loans", category: "finance" },
    { name: "Insurance Agency", icon: "🛡️", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Sell policies", category: "finance" },
    { name: "Check Cashing Store", icon: "💲", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Cash services", category: "finance" },
    { name: "Money Transfer Service", icon: "💸", cost: 250000, income: 16000, level: 0, maxLevel: 10, desc: "Wire money", category: "finance" },
    { name: "Currency Exchange", icon: "💱", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Forex", category: "finance" },
    { name: "Tax Preparation Service", icon: "📋", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "Tax season money", category: "finance" },
    { name: "Accounting Firm", icon: "🧮", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Bookkeeping", category: "finance" },
    { name: "Wealth Management", icon: "👨‍💼", cost: 2000000, income: 120000, level: 0, maxLevel: 10, desc: "Rich client advisory", category: "finance" },
    { name: "Family Office", icon: "🏛️", cost: 5000000, income: 300000, level: 0, maxLevel: 10, desc: "Ultra-wealthy management", category: "finance" },
    { name: "Trust Company", icon: "🔑", cost: 1500000, income: 80000, level: 0, maxLevel: 10, desc: "Estate management", category: "finance" },
    { name: "Bail Bonds", icon: "⛓️", cost: 200000, income: 18000, level: 0, maxLevel: 10, desc: "Prison system money", category: "finance" },
    { name: "Repossession Agency", icon: "🚗", cost: 100000, income: 8000, level: 0, maxLevel: 10, desc: "Recover debts", category: "finance" },
    { name: "Debt Collection Agency", icon: "📞", cost: 120000, income: 10000, level: 0, maxLevel: 10, desc: "Chase payments", category: "finance" },
  ],
  tech: [
    { name: "Software Company", icon: "💻", cost: 500000, income: 35000, level: 0, maxLevel: 10, desc: "Build apps", category: "tech" },
    { name: "IT Consulting", icon: "🖥️", cost: 200000, income: 14000, level: 0, maxLevel: 10, desc: "Tech support", category: "tech" },
    { name: "Cybersecurity Firm", icon: "🔒", cost: 800000, income: 50000, level: 0, maxLevel: 10, desc: "Protection services", category: "tech" },
    { name: "Data Center", icon: "🗄️", cost: 2000000, income: 100000, level: 0, maxLevel: 10, desc: "Server hosting", category: "tech" },
    { name: "Web Hosting Company", icon: "🌐", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Website hosting", category: "tech" },
    { name: "Cloud Service Provider", icon: "☁️", cost: 3000000, income: 150000, level: 0, maxLevel: 10, desc: "Storage/compute", category: "tech" },
    { name: "Digital Marketing Agency", icon: "📱", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Online ads", category: "tech" },
    { name: "SEO Company", icon: "🔍", cost: 80000, income: 6000, level: 0, maxLevel: 10, desc: "Search optimization", category: "tech" },
    { name: "Social Media Management", icon: "📣", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "Online presence", category: "tech" },
    { name: "App Development Studio", icon: "📲", cost: 400000, income: 28000, level: 0, maxLevel: 10, desc: "Mobile apps", category: "tech" },
    { name: "Game Studio", icon: "🎮", cost: 600000, income: 40000, level: 0, maxLevel: 10, desc: "Video games", category: "tech" },
    { name: "E-commerce Platform", icon: "🛒", cost: 500000, income: 32000, level: 0, maxLevel: 10, desc: "Online stores", category: "tech" },
    { name: "Payment Processor", icon: "💳", cost: 1000000, income: 60000, level: 0, maxLevel: 10, desc: "Transaction fees", category: "tech" },
    { name: "Cryptocurrency Exchange", icon: "₿", cost: 2000000, income: 120000, level: 0, maxLevel: 10, desc: "Digital currency", category: "tech" },
    { name: "Crypto Mining Farm", icon: "⛏️", cost: 1500000, income: 80000, level: 0, maxLevel: 10, desc: "Digital gold", category: "tech" },
    { name: "AI Company", icon: "🤖", cost: 3000000, income: 180000, level: 0, maxLevel: 10, desc: "Machine learning", category: "tech" },
    { name: "Robotics Company", icon: "🦾", cost: 2500000, income: 140000, level: 0, maxLevel: 10, desc: "Automation", category: "tech" },
    { name: "3D Printing Service", icon: "🖨️", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Custom manufacturing", category: "tech" },
    { name: "Drone Company", icon: "🛸", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Aerial services", category: "tech" },
    { name: "Surveillance Tech Company", icon: "📹", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Security cameras", category: "tech" },
    { name: "Phone Repair Shop", icon: "📱", cost: 50000, income: 3500, level: 0, maxLevel: 10, desc: "Device fixes", category: "tech" },
    { name: "Electronics Store", icon: "🔌", cost: 200000, income: 13000, level: 0, maxLevel: 10, desc: "Gadget sales", category: "tech" },
    { name: "Computer Shop", icon: "🖥️", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "PC builds", category: "tech" },
    { name: "Gaming Cafe", icon: "🎮", cost: 120000, income: 7000, level: 0, maxLevel: 10, desc: "PC/console rental", category: "tech" },
    { name: "Co-working Space", icon: "🏢", cost: 400000, income: 24000, level: 0, maxLevel: 10, desc: "Office rental", category: "tech" },
    { name: "Data Broker", icon: "📊", cost: 600000, income: 45000, level: 0, maxLevel: 10, desc: "Sell information", category: "tech" },
    { name: "Hacking Service", icon: "💀", cost: 800000, income: 60000, level: 0, maxLevel: 10, desc: "Digital crime (grey area)", category: "tech" },
    { name: "Identity Service", icon: "🎭", cost: 500000, income: 40000, level: 0, maxLevel: 10, desc: "New identities", category: "tech" },
  ],
  medical: [
    { name: "Private Clinic", icon: "🏥", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Outpatient care", category: "medical" },
    { name: "Dental Office", icon: "🦷", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Teeth money", category: "medical" },
    { name: "Optometry Clinic", icon: "👁️", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Eye care", category: "medical" },
    { name: "Chiropractic Office", icon: "🦴", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Back cracks", category: "medical" },
    { name: "Physical Therapy Center", icon: "🏃", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Recovery", category: "medical" },
    { name: "Veterinary Clinic", icon: "🐕", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Animal care", category: "medical" },
    { name: "Pharmacy", icon: "💊", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Medicine sales", category: "medical" },
    { name: "Medical Supply Store", icon: "🩺", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Equipment", category: "medical" },
    { name: "Ambulance Company", icon: "🚑", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Emergency transport", category: "medical" },
    { name: "Home Health Agency", icon: "🏡", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "In-home care", category: "medical" },
    { name: "Nursing Home", icon: "👴", cost: 800000, income: 50000, level: 0, maxLevel: 10, desc: "Elder care", category: "medical" },
    { name: "Rehab Center", icon: "🏥", cost: 600000, income: 35000, level: 0, maxLevel: 10, desc: "Addiction recovery", category: "medical" },
    { name: "Mental Health Clinic", icon: "🧠", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Therapy", category: "medical" },
    { name: "Cosmetic Surgery Clinic", icon: "💎", cost: 1000000, income: 70000, level: 0, maxLevel: 10, desc: "Vanity money", category: "medical" },
    { name: "Dialysis Center", icon: "🩸", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Kidney care", category: "medical" },
    { name: "Blood Bank", icon: "🩸", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Blood supply", category: "medical" },
    { name: "Lab Testing Facility", icon: "🧪", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Medical tests", category: "medical" },
    { name: "MRI/CT Imaging Center", icon: "📡", cost: 1500000, income: 90000, level: 0, maxLevel: 10, desc: "Scans", category: "medical" },
    { name: "Fertility Clinic", icon: "👶", cost: 800000, income: 50000, level: 0, maxLevel: 10, desc: "Baby making", category: "medical" },
    { name: "Organic Supplement Store", icon: "🌿", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Vitamins", category: "medical" },
    { name: "GYM", icon: "🏋️", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Fitness membership", category: "medical" },
    { name: "CrossFit Box", icon: "💪", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Premium fitness", category: "medical" },
    { name: "Martial Arts Dojo", icon: "🥋", cost: 120000, income: 7000, level: 0, maxLevel: 10, desc: "Fighting classes", category: "medical" },
    { name: "Yoga Studio", icon: "🧘", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Wellness", category: "medical" },
    { name: "Wellness Spa", icon: "💆", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Relaxation", category: "medical" },
    { name: "Tanning Salon", icon: "☀️", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "UV service", category: "medical" },
    { name: "Nail Salon", icon: "💅", cost: 50000, income: 3500, level: 0, maxLevel: 10, desc: "Beauty service", category: "medical" },
    { name: "Hair Salon", icon: "💇", cost: 70000, income: 4500, level: 0, maxLevel: 10, desc: "Style service", category: "medical" },
    { name: "Barbershop", icon: "💈", cost: 40000, income: 2500, level: 0, maxLevel: 10, desc: "Quick cuts", category: "medical" },
    { name: "Tattoo Parlor", icon: "🖊️", cost: 80000, income: 5500, level: 0, maxLevel: 10, desc: "Ink money", category: "medical" },
    { name: "Tattoo Removal Clinic", icon: "激光", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Reverse ink", category: "medical" },
    { name: "Weight Loss Clinic", icon: "⚖️", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Diet money", category: "medical" },
  ],
  retail: [
    { name: "Convenience Store", icon: "🏪", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "24/7 income", category: "retail" },
    { name: "Grocery Store", icon: "🛒", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Essential goods", category: "retail" },
    { name: "Liquor Store", icon: "🍶", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Alcohol sales", category: "retail" },
    { name: "Tobacco Shop", icon: "🚬", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Smoking goods", category: "retail" },
    { name: "Clothing Boutique", icon: "👗", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Fashion", category: "retail" },
    { name: "Thrift Store", icon: "👕", cost: 40000, income: 2500, level: 0, maxLevel: 10, desc: "Used goods", category: "retail" },
    { name: "Antique Store", icon: "🏺", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Vintage finds", category: "retail" },
    { name: "Jewelry Store", icon: "💍", cost: 500000, income: 35000, level: 0, maxLevel: 10, desc: "High margin", category: "retail" },
    { name: "Watch Store", icon: "⌚", cost: 400000, income: 28000, level: 0, maxLevel: 10, desc: "Luxury timepieces", category: "retail" },
    { name: "Electronics Store", icon: "📺", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Gadgets", category: "retail" },
    { name: "Furniture Store", icon: "🛋️", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Home goods", category: "retail" },
    { name: "Mattress Store", icon: "🛏️", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Sleep products", category: "retail" },
    { name: "Appliance Store", icon: "🧊", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Home devices", category: "retail" },
    { name: "Bookstore", icon: "📚", cost: 80000, income: 4500, level: 0, maxLevel: 10, desc: "Reading material", category: "retail" },
    { name: "Music Store", icon: "🎸", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Instruments", category: "retail" },
    { name: "Sports Store", icon: "⚽", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Athletic gear", category: "retail" },
    { name: "Toy Store", icon: "🧸", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Kids products", category: "retail" },
    { name: "Gift Shop", icon: "🎁", cost: 60000, income: 4000, level: 0, maxLevel: 10, desc: "Presents", category: "retail" },
    { name: "Flower Shop", icon: "💐", cost: 50000, income: 3000, level: 0, maxLevel: 10, desc: "Bouquets", category: "retail" },
    { name: "Pet Store", icon: "🐾", cost: 120000, income: 7500, level: 0, maxLevel: 10, desc: "Animal supplies", category: "retail" },
    { name: "Garden Center", icon: "🌻", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Plants and tools", category: "retail" },
    { name: "Craft Store", icon: "🧶", cost: 70000, income: 4000, level: 0, maxLevel: 10, desc: "DIY supplies", category: "retail" },
    { name: "Art Supply Store", icon: "🎨", cost: 60000, income: 3500, level: 0, maxLevel: 10, desc: "Creative tools", category: "retail" },
    { name: "Gun Shop", icon: "🔫", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Firearms (legal)", category: "retail" },
    { name: "Fishing Store", icon: "🎣", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Tackle and gear", category: "retail" },
    { name: "Hunting Store", icon: "🦌", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Outdoor gear", category: "retail" },
    { name: "Army Surplus", icon: "🎖️", cost: 100000, income: 6500, level: 0, maxLevel: 10, desc: "Military gear", category: "retail" },
    { name: "Gas Station", icon: "⛽", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Fuel + convenience", category: "retail" },
    { name: "Supermarket", icon: "🏬", cost: 1000000, income: 60000, level: 0, maxLevel: 10, desc: "Big grocery", category: "retail" },
    { name: "Warehouse Store", icon: "📦", cost: 800000, income: 45000, level: 0, maxLevel: 10, desc: "Bulk buying", category: "retail" },
    { name: "Dollar Store", icon: "💲", cost: 60000, income: 3500, level: 0, maxLevel: 10, desc: "Budget goods", category: "retail" },
    { name: "Subscription Box Service", icon: "📬", cost: 100000, income: 8000, level: 0, maxLevel: 10, desc: "Monthly delivery", category: "retail" },
    { name: "Dropshipping Business", icon: "🚚", cost: 30000, income: 3000, level: 0, maxLevel: 10, desc: "No inventory", category: "retail" },
  ],
  entertainment: [
    { name: "Nightclub", icon: "🪩", cost: 1000000, income: 60000, level: 0, maxLevel: 10, desc: "Cover charge + drinks", category: "entertainment" },
    { name: "Bar / Pub", icon: "🍺", cost: 200000, income: 14000, level: 0, maxLevel: 10, desc: "Drinks + food", category: "entertainment" },
    { name: "Sports Bar", icon: "🏈", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Games + drinks", category: "entertainment" },
    { name: "Karaoke Bar", icon: "🎤", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Sing for cash", category: "entertainment" },
    { name: "Comedy Club", icon: "😂", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Laughs for money", category: "entertainment" },
    { name: "Concert Venue", icon: "🎵", cost: 800000, income: 50000, level: 0, maxLevel: 10, desc: "Ticket sales", category: "entertainment" },
    { name: "Recording Studio", icon: "🎙️", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Music production", category: "entertainment" },
    { name: "Music Label", icon: "🎶", cost: 1000000, income: 65000, level: 0, maxLevel: 10, desc: "Artist management", category: "entertainment" },
    { name: "Radio Station", icon: "📻", cost: 600000, income: 35000, level: 0, maxLevel: 10, desc: "Ad revenue", category: "entertainment" },
    { name: "TV Production Company", icon: "📺", cost: 2000000, income: 120000, level: 0, maxLevel: 10, desc: "Shows", category: "entertainment" },
    { name: "Film Production Company", icon: "🎬", cost: 3000000, income: 180000, level: 0, maxLevel: 10, desc: "Movies", category: "entertainment" },
    { name: "Movie Theater", icon: "🎦", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Ticket sales", category: "entertainment" },
    { name: "Drive-in Theater", icon: "🎦", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Retro cinema", category: "entertainment" },
    { name: "Arcade", icon: "🕹️", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Game machines", category: "entertainment" },
    { name: "Bowling Alley", icon: "🎳", cost: 400000, income: 22000, level: 0, maxLevel: 10, desc: "Lane rental", category: "entertainment" },
    { name: "Roller Skating Rink", icon: "⛸️", cost: 250000, income: 14000, level: 0, maxLevel: 10, desc: "Skate rental", category: "entertainment" },
    { name: "Ice Skating Rink", icon: "⛸️", cost: 350000, income: 20000, level: 0, maxLevel: 10, desc: "Winter fun", category: "entertainment" },
    { name: "Go-Kart Track", icon: "🏎️", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Racing fun", category: "entertainment" },
    { name: "Mini Golf Course", icon: "⛳", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Family fun", category: "entertainment" },
    { name: "Amusement Park", icon: "🎡", cost: 5000000, income: 300000, level: 0, maxLevel: 10, desc: "Ride tickets", category: "entertainment" },
    { name: "Water Park", icon: "🏊", cost: 3000000, income: 180000, level: 0, maxLevel: 10, desc: "Splash money", category: "entertainment" },
    { name: "Theme Park", icon: "🎢", cost: 4000000, income: 250000, level: 0, maxLevel: 10, desc: "Entertainment", category: "entertainment" },
    { name: "Escape Room Business", icon: "🔐", cost: 100000, income: 7000, level: 0, maxLevel: 10, desc: "Puzzle fun", category: "entertainment" },
    { name: "Haunted House", icon: "👻", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Seasonal scare", category: "entertainment" },
    { name: "Paintball Arena", icon: "🎨", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Combat fun", category: "entertainment" },
    { name: "Laser Tag Arena", icon: "🔫", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Sci-fi fun", category: "entertainment" },
    { name: "Axe Throwing Bar", icon: "🪓", cost: 120000, income: 8000, level: 0, maxLevel: 10, desc: "Trendy fun", category: "entertainment" },
    { name: "VR Arcade", icon: "🥽", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Virtual reality", category: "entertainment" },
    { name: "Board Game Cafe", icon: "🎲", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Tabletop", category: "entertainment" },
    { name: "Hookah Lounge", icon: "💨", cost: 150000, income: 10000, level: 0, maxLevel: 10, desc: "Smoking lounge", category: "entertainment" },
    { name: "Strip Club", icon: "💃", cost: 800000, income: 60000, level: 0, maxLevel: 10, desc: "Adult entertainment", category: "entertainment" },
    { name: "Casino", icon: "🎰", cost: 5000000, income: 350000, level: 0, maxLevel: 10, desc: "Gambling profits", category: "entertainment" },
    { name: "Bingo Hall", icon: "🎯", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Number games", category: "entertainment" },
    { name: "Dance Club", icon: "🪩", cost: 600000, income: 38000, level: 0, maxLevel: 10, desc: "EDM nights", category: "entertainment" },
    { name: "Jazz Club", icon: "🎷", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Live jazz", category: "entertainment" },
    { name: "Dive Bar", icon: "🍸", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Cheap drinks", category: "entertainment" },
    { name: "Wine Bar", icon: "🍷", cost: 200000, income: 13000, level: 0, maxLevel: 10, desc: "Wine tasting", category: "entertainment" },
    { name: "Cocktail Lounge", icon: "🍹", cost: 300000, income: 20000, level: 0, maxLevel: 10, desc: "Craft drinks", category: "entertainment" },
    { name: "Rooftop Bar", icon: "🏙️", cost: 500000, income: 32000, level: 0, maxLevel: 10, desc: "Views + drinks", category: "entertainment" },
    { name: "Beach Bar", icon: "🏖️", cost: 400000, income: 25000, level: 0, maxLevel: 10, desc: "Sand + drinks", category: "entertainment" },
    { name: "Pool Bar", icon: "🏊", cost: 350000, income: 22000, level: 0, maxLevel: 10, desc: "Swim + drinks", category: "entertainment" },
  ],
  agriculture: [
    { name: "Organic Farm", icon: "🌱", cost: 250000, income: 16000, level: 0, maxLevel: 10, desc: "Premium produce", category: "agriculture" },
    { name: "Cannabis Farm", icon: "🌿", cost: 600000, income: 50000, level: 0, maxLevel: 10, desc: "Legal weed", category: "agriculture" },
    { name: "Vineyard", icon: "🍇", cost: 1000000, income: 60000, level: 0, maxLevel: 10, desc: "Wine grapes", category: "agriculture" },
    { name: "Orchard", icon: "🍎", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Fruit trees", category: "agriculture" },
    { name: "Dairy Farm", icon: "🐄", cost: 400000, income: 22000, level: 0, maxLevel: 10, desc: "Milk/cheese", category: "agriculture" },
    { name: "Chicken Farm", icon: "🐔", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Eggs/meat", category: "agriculture" },
    { name: "Cattle Ranch", icon: "🐂", cost: 800000, income: 45000, level: 0, maxLevel: 10, desc: "Beef/leather", category: "agriculture" },
    { name: "Pig Farm", icon: "🐷", cost: 250000, income: 14000, level: 0, maxLevel: 10, desc: "Pork products", category: "agriculture" },
    { name: "Fish Farm", icon: "🐟", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Aquaculture", category: "agriculture" },
    { name: "Shrimp Farm", icon: "🦐", cost: 350000, income: 22000, level: 0, maxLevel: 10, desc: "Seafood", category: "agriculture" },
    { name: "Mushroom Farm", icon: "🍄", cost: 100000, income: 7000, level: 0, maxLevel: 10, desc: "Specialty fungi", category: "agriculture" },
    { name: "Bee Farm", icon: "🐝", cost: 80000, income: 5000, level: 0, maxLevel: 10, desc: "Honey production", category: "agriculture" },
    { name: "Flower Farm", icon: "🌸", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Bouquet supply", category: "agriculture" },
    { name: "Nursery", icon: "🌳", cost: 200000, income: 12000, level: 0, maxLevel: 10, desc: "Plant sales", category: "agriculture" },
    { name: "Tree Farm", icon: "🌲", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Timber supply", category: "agriculture" },
    { name: "Hemp Farm", icon: "🧵", cost: 250000, income: 15000, level: 0, maxLevel: 10, desc: "Fiber/cbd", category: "agriculture" },
    { name: "Hydroponic Farm", icon: "💧", cost: 400000, income: 28000, level: 0, maxLevel: 10, desc: "Indoor growing", category: "agriculture" },
    { name: "Vertical Farm", icon: "🏢", cost: 600000, income: 40000, level: 0, maxLevel: 10, desc: "Stack growing", category: "agriculture" },
    { name: "Aquaponic Farm", icon: "🐠", cost: 350000, income: 22000, level: 0, maxLevel: 10, desc: "Fish + plants", category: "agriculture" },
    { name: "Grain Farm", icon: "🌾", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Wheat/corn/soy", category: "agriculture" },
    { name: "Cotton Farm", icon: "☁️", cost: 400000, income: 24000, level: 0, maxLevel: 10, desc: "Textile raw", category: "agriculture" },
    { name: "Sugarcane Farm", icon: "🎋", cost: 350000, income: 20000, level: 0, maxLevel: 10, desc: "Sugar/molasses", category: "agriculture" },
    { name: "Coffee Plantation", icon: "☕", cost: 800000, income: 50000, level: 0, maxLevel: 10, desc: "Bean production", category: "agriculture" },
    { name: "Tea Plantation", icon: "🍵", cost: 600000, income: 35000, level: 0, maxLevel: 10, desc: "Leaf production", category: "agriculture" },
    { name: "Rubber Plantation", icon: "🧤", cost: 500000, income: 28000, level: 0, maxLevel: 10, desc: "Latex supply", category: "agriculture" },
    { name: "Palm Oil Plantation", icon: "🌴", cost: 700000, income: 42000, level: 0, maxLevel: 10, desc: "Cooking oil", category: "agriculture" },
    { name: "Kennel", icon: "🐕", cost: 150000, income: 9000, level: 0, maxLevel: 10, desc: "Dog breeding/boarding", category: "agriculture" },
    { name: "Cattery", icon: "🐈", cost: 100000, income: 6000, level: 0, maxLevel: 10, desc: "Cat breeding", category: "agriculture" },
    { name: "Horse Stable", icon: "🐴", cost: 500000, income: 30000, level: 0, maxLevel: 10, desc: "Horse boarding/breeding", category: "agriculture" },
    { name: "Falconry", icon: "🦅", cost: 300000, income: 18000, level: 0, maxLevel: 10, desc: "Bird training", category: "agriculture" },
  ],
};

const CATEGORIES = [
  { id: "restaurants", label: "Restaurants & Food", icon: "🍕" },
  { id: "hospitality", label: "Hospitality & Travel", icon: "🏨" },
  { id: "auto", label: "Auto & Transport", icon: "🚗" },
  { id: "construction", label: "Construction & Real Estate", icon: "🏗️" },
  { id: "finance", label: "Finance & Banking", icon: "💰" },
  { id: "tech", label: "Tech & Digital", icon: "💻" },
  { id: "medical", label: "Medical & Health", icon: "🏥" },
  { id: "retail", label: "Retail & Commerce", icon: "🛒" },
  { id: "entertainment", label: "Entertainment & Media", icon: "🎭" },
  { id: "agriculture", label: "Agriculture & Farms", icon: "🌾" },
];

/* ═══════════ COMPANIES HUB PAGE ═══════════ */

export function CompaniesHubPage() {
  const player = useQuery(api.game.getPlayer);
  const [activeCategory, setActiveCategory] = useState("restaurants");
  const [msg, setMsg] = useState("");
  const [buyMsg, setBuyMsg] = useState("");

  if (!player) return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;

  const businesses = ALL_BUSINESSES[activeCategory] || [];
  const cat = CATEGORIES.find(c => c.id === activeCategory);
  const totalOwned = Object.values(ALL_BUSINESSES).flat().filter(b => b.level > 0).length;
  const totalIncome = Object.values(ALL_BUSINESSES).flat().reduce((sum, b) => sum + (b.level > 0 ? b.income * b.level : 0), 0);

  const handleBuy = (b: Business) => {
    if ((player.money ?? 0) < b.cost) {
      setBuyMsg(`❌ Not enough cash! Need $${b.cost.toLocaleString()}`);
      return;
    }
    if (b.level > 0) {
      const nextLevel = b.level + 1;
      if (nextLevel > b.maxLevel) { setBuyMsg("❌ Max level reached!"); return; }
      const upgradeCost = Math.floor(b.cost * 0.6 * nextLevel);
      if ((player.money ?? 0) < upgradeCost) { setBuyMsg(`❌ Need $${upgradeCost.toLocaleString()} to upgrade!`); return; }
      b.level = nextLevel;
      setMsg(`⬆️ ${b.name} upgraded to Level ${nextLevel}! +$${b.income.toLocaleString()}/day`);
    } else {
      b.level = 1;
      setMsg(`✅ ${b.name} purchased! Earns $${b.income.toLocaleString()}/day`);
    }
    setTimeout(() => { setMsg(""); setBuyMsg(""); }, 3000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏢</span>
        <div>
          <h2 className="text-2xl font-black text-amber-400">Company Empire</h2>
          <p className="text-xs text-slate-400">Build your business empire across {CATEGORIES.length} industries</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">🏢 Businesses Owned</div>
          <div className="text-lg font-bold text-green-400">{totalOwned}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💰 Daily Income</div>
          <div className="text-lg font-bold text-yellow-400">${totalIncome.toLocaleString()}</div>
        </div>
        <div className="mafia-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400">💵 Your Cash</div>
          <div className="text-lg font-bold text-cyan-400">${(player.money ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Messages */}
      {msg && <div className="px-4 py-2 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-bold animate-fade-in">✅ {msg}</div>}
      {buyMsg && <div className="px-4 py-2 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-bold animate-fade-in">{buyMsg}</div>}

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setActiveCategory(c.id); setMsg(""); setBuyMsg(""); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${activeCategory === c.id ? "bg-amber-600/20 border-amber-500/40 text-amber-300" : "border-slate-800/40 text-slate-500 hover:border-slate-600/30 hover:text-slate-400"}`}>
            <span className="mr-1">{c.icon}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Category Header */}
      <div className="mafia-card rounded-xl p-4 border border-amber-500/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cat?.icon}</span>
          <div>
            <div className="text-lg font-black text-slate-200">{cat?.label}</div>
            <div className="text-xs text-slate-400">{businesses.length} businesses available</div>
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {businesses.map((b, i) => {
          const owned = b.level > 0;
          const atMax = b.level >= b.maxLevel;
          const upgradeCost = owned && !atMax ? Math.floor(b.cost * 0.6 * (b.level + 1)) : b.cost;
          return (
            <div key={i} className={`mafia-card rounded-xl p-3 space-y-2 ${owned ? "border border-green-500/20" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-200 text-sm">{b.name}</div>
                  <div className="text-[10px] text-slate-400">{b.desc}</div>
                  {owned && (
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: b.maxLevel }).map((_, j) => (
                        <div key={j} className={`w-3 h-1 rounded-full ${j < b.level ? "bg-amber-400" : "bg-slate-700"}`} />
                      ))}
                      <span className="text-[9px] text-slate-400 ml-1">Lvl {b.level}/{b.maxLevel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {owned && <div className="text-[10px] text-green-400 font-bold">+${(b.income * b.level).toLocaleString()}/day</div>}
                  <div className="text-[10px] text-slate-400">{atMax ? "MAX LEVEL" : `Cost: $${upgradeCost.toLocaleString()}`}</div>
                </div>
                <button onClick={() => handleBuy(b)}
                  disabled={atMax}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${atMax ? "bg-slate-700/50 text-slate-500 cursor-default" : owned ? "bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/30" : "bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30"}`}>
                  {atMax ? "✅ MAX" : owned ? `⬆️ Upgrade $${upgradeCost.toLocaleString()}` : `🛒 Buy $${b.cost.toLocaleString()}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

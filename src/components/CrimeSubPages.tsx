import React, { useState } from "react";
import { crimeCategories } from "@/data/crimes";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_COLORS: Record<string, string> = {
  street: "from-green-500/20 to-emerald-500/10 border-green-500/30",
  robbery: "from-red-500/20 to-rose-500/10 border-red-500/30",
  fraud: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30",
  burglary: "from-orange-500/20 to-red-500/10 border-orange-500/30",
  drugs: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
  organized: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
  underground: "from-gray-500/20 to-slate-500/10 border-gray-500/30",
};

const CATEGORY_TEXT: Record<string, string> = {
  street: "text-green-400",
  robbery: "text-red-400",
  fraud: "text-yellow-400",
  burglary: "text-orange-400",
  drugs: "text-purple-400",
  organized: "text-blue-400",
  underground: "text-gray-400",
};

const CATEGORY_ICONS: Record<string, string> = {
  street: "🔪",
  robbery: "💰",
  fraud: "🃏",
  burglary: "🏠",
  drugs: "💊",
  organized: "🕵️",
  underground: "🕳️",
};

export function CrimeSubPages({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Map crime IDs to route names
  const getCrimeRoute = (categoryId: string, crimeId: string) => `crime_${categoryId}_${crimeId}`;

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 px-3 py-1 overflow-x-auto scrollbar-hide"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.15), rgba(20,10,5,0.2), rgba(0,0,0,0.15))' }}>
        {crimeCategories.map(cat => (
          <button key={cat.id}
            onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
            className={`relative px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all duration-300 ${
              expandedCategory === cat.id
                ? `bg-gradient-to-r ${CATEGORY_COLORS[cat.id]} ${CATEGORY_TEXT[cat.id]} scale-105 shadow-lg`
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5 hover:scale-105"
            }`}>
            <span className="mr-1">{CATEGORY_ICONS[cat.id]}</span>
            {cat.name}
            <span className="ml-1 text-[8px] opacity-50">({cat.crimes.length})</span>
          </button>
        ))}
      </div>

      {/* Expanded Crime List */}
      <AnimatePresence>
        {expandedCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-1.5 overflow-x-auto scrollbar-hide flex gap-1"
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.1), rgba(20,10,5,0.15), rgba(0,0,0,0.1))' }}>
              {crimeCategories.find(c => c.id === expandedCategory)?.crimes.map(crime => {
                const route = getCrimeRoute(expandedCategory, crime.id);
                const isActive = activePage === route;
                return (
                  <button key={crime.id}
                    onClick={() => { onNavigate(route); setExpandedCategory(null); }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${CATEGORY_COLORS[expandedCategory]} ${CATEGORY_TEXT[expandedCategory]} scale-105`
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}>
                    <span className="opacity-70">Lv.{crime.levelRequired}</span> {crime.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to generate all crime routes for the router
export function getAllCrimeRoutes() {
  const routes: string[] = [];
  crimeCategories.forEach(cat => {
    cat.crimes.forEach(crime => {
      routes.push(`crime_${cat.id}_${crime.id}`);
    });
  });
  return routes;
}

// Get crime data by route
export function getCrimeByRoute(route: string) {
  // route format: crime_{categoryId}_{crimeId}
  const parts = route.replace("crime_", "").split("_");
  const categoryId = parts[0];
  const crimeId = parts.slice(1).join("_");
  const category = crimeCategories.find(c => c.id === categoryId);
  if (!category) return null;
  const crime = category.crimes.find(c => c.id === crimeId);
  if (!crime) return null;
  return { category, crime };
}

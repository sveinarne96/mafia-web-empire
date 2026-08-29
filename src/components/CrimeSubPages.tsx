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

  const getCrimeRoute = (categoryId: string, crimeId: string) => `crime_${categoryId}_${crimeId}`;

  return (
    <>
      {crimeCategories.map(cat => (
        <button key={cat.id}
          onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
          className={`relative px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all duration-300 ${
            expandedCategory === cat.id
              ? `bg-gradient-to-r ${CATEGORY_COLORS[cat.id]} ${CATEGORY_TEXT[cat.id]} scale-105 shadow-lg`
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5 hover:scale-105"
          }`}>
          {CATEGORY_ICONS[cat.id]} {cat.name} <span className="text-[8px] opacity-50">({cat.crimes.length})</span>
        </button>
      ))}
    </>
  );
}

// Sub-bar that shows below the top bar when a category is expanded
export function CrimeSubBar({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  const activeCategoryId = activePage.startsWith("crime_") ? activePage.replace("crime_", "") : null;
  const activeCategory = activeCategoryId ? crimeCategories.find(c => c.id === activeCategoryId) : null;
  if (!activeCategory) return null;

  const getCrimeRoute = (catId: string, crimeId: string) => `crime_${catId}_${crimeId}`;

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }} className="overflow-hidden w-full">
      <div className="relative">
        <div className="px-2 py-1 overflow-x-auto scrollbar-hide flex gap-0.5 items-center"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.1), rgba(15,8,3,0.15), rgba(0,0,0,0.1))' }}>
          {activeCategory.crimes.map(crime => {
            const route = getCrimeRoute(activeCategoryId!, crime.id);
            const isActive = activePage === route;
            return (
              <button key={crime.id} onClick={() => onNavigate(route)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive ? `${CATEGORY_TEXT[activeCategoryId!]} bg-white/5` : "text-slate-600 hover:text-slate-400 hover:bg-white/3"
                }`}>
                <span className="opacity-50">{crime.levelRequired}</span> {crime.name}
              </button>
            );
          })}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

export function getAllCrimeRoutes() {
  const routes: string[] = [];
  crimeCategories.forEach(cat => {
    cat.crimes.forEach(crime => {
      routes.push(`crime_${cat.id}_${crime.id}`);
    });
  });
  return routes;
}

export function getCrimeByRoute(route: string) {
  const parts = route.replace("crime_", "").split("_");
  const categoryId = parts[0];
  const crimeId = parts.slice(1).join("_");
  const category = crimeCategories.find(c => c.id === categoryId);
  if (!category) return null;
  const crime = category.crimes.find(c => c.id === crimeId);
  if (!crime) return null;
  return { category, crime };
}

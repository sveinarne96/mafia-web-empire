import React, { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, Save, Globe, Shield, Award, Palette, Sparkles, ChevronRight, Check, X } from "lucide-react";
import { LANGUAGES, BADGES, COLOR_ROLES, type GameBadge, type ColorRole } from "@/data/profileData";

// Title presets
const TITLES = [
  { id: "", name: "None", color: "" },
  { id: "Street Legend", color: "text-gray-400" },
  { id: "Crime Lord", color: "text-red-400" },
  { id: "The Untouchable", color: "text-blue-400" },
  { id: "Shadow Emperor", color: "text-purple-400" },
  { id: "Golden God", color: "text-yellow-400" },
  { id: "Mastermind", color: "text-cyan-400" },
  { id: "Godfather", color: "text-amber-400" },
  { id: "Phantom", color: "text-indigo-400" },
  { id: "Bloodmoon", color: "text-rose-400" },
  { id: "Iron Fist", color: "text-gray-300" },
  { id: "Diamond Hands", color: "text-cyan-300" },
  { id: "The Architect", color: "text-emerald-400" },
  { id: "Viper", color: "text-lime-400" },
  { id: "Nightcrawler", color: "text-violet-400" },
  { id: "Warlord", color: "text-orange-400" },
  { id: "Silencer", color: "text-slate-400" },
  { id: "Apex Predator", color: "text-red-300" },
  { id: "Cartel King", color: "text-emerald-300" },
  { id: "Zero Hour", color: "text-white" },
];

export function MyProfilePage() {
  const player = useQuery(api.game.getPlayer);
  const updateProfile = useMutation(api.profileSystem.updateProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable state
  const [bio, setBio] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [previewPic, setPreviewPic] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "badge" | "role" | "title" | "language">("general");
  const [initialized, setInitialized] = useState(false);

  // Load from DB once
  useEffect(() => {
    if (player && !initialized) {
      setBio((player as any).bio ?? "");
      setSelectedLang((player as any).activeLanguage ?? "en");
      setSelectedBadge((player as any).activeBadge ?? "");
      setSelectedRole((player as any).activeRole ?? "");
      setSelectedTitle((player as any).activeTitle ?? "");
      setPreviewPic((player as any).profilePictureUrl ?? null);
      setInitialized(true);
    }
  }, [player, initialized]);

  const handlePictureUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewPic(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio,
        activeLanguage: selectedLang,
        activeBadge: selectedBadge,
        activeRole: selectedRole,
        activeTitle: selectedTitle,
        profilePictureUrl: previewPic ?? "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Profile save failed:", err);
    }
    setSaving(false);
  }, [bio, selectedLang, selectedBadge, selectedRole, selectedTitle, previewPic, updateProfile]);

  if (!player) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading profile...</div>;

  const currentLang = LANGUAGES.find(l => l.id === selectedLang);
  const currentBadge = BADGES.find(b => b.id === selectedBadge);
  const currentRole = COLOR_ROLES.find(r => r.id === selectedRole);

  const tabs = [
    { id: "general" as const, label: "General", icon: <User size={14} /> },
    { id: "badge" as const, label: "Badge", icon: <Award size={14} /> },
    { id: "role" as const, label: "Color Role", icon: <Palette size={14} /> },
    { id: "title" as const, label: "Title", icon: <Sparkles size={14} /> },
    { id: "language" as const, label: "Language", icon: <Globe size={14} /> },
  ];

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto p-4">
      {/* Profile Header */}
      <div className="mafia-card rounded-xl overflow-hidden">
        <div className="relative h-24" style={{ background: "linear-gradient(135deg, #0c0402, #1a0a06, #0c0402)" }}>
          <div className="absolute inset-0 opacity-20" style={{ background: currentRole?.gradient ?? "linear-gradient(135deg, #d09945, #7e5c2a)" }} />
        </div>
        <div className="relative px-5 pb-5">
          <div className="relative -mt-10 flex items-end gap-3 mb-3">
            {/* Profile Picture */}
            <div className="relative w-20 h-20 rounded-xl border-2 border-amber-700/50 overflow-hidden cursor-pointer hover:border-amber-500/70 transition group" onClick={() => fileInputRef.current?.click()}>
              {previewPic ? (
                <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, #1a0a06, #0c0402)" }}>👤</div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={18} className="text-white" /></div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />

            <div className="flex-1 pb-1">
              <div className="text-base font-bold text-amber-400">{(player as any).username ?? (player as any).name ?? "Unknown"}</div>
              {currentBadge && <div className="text-[11px] text-amber-600/80">{currentBadge.icon} {currentBadge.name}</div>}
              {currentRole && <div className="text-[11px]" style={{ background: currentRole.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{currentRole.prefix} {currentRole.name}</div>}
              {selectedTitle && <div className="text-[10px] text-amber-500/60">★ {selectedTitle}</div>}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[["Level", (player as any).level ?? 1, "text-amber-400"], ["Kills", (player as any).totalKills ?? 0, "text-red-400"], ["Crimes", (player as any).totalCrimes ?? 0, "text-green-400"], ["Rep", (player as any).reputation ?? 0, "text-purple-400"]].map(([label, value, color]) => (
              <div key={label as string} className="text-center p-1.5 rounded-lg bg-black/30 border border-amber-900/20">
                <div className="text-[9px] text-muted-foreground">{label as string}</div>
                <div className={`text-xs font-bold ${color}`}>{value as number}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-amber-900/20 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === tab.id ? "bg-amber-900/30 text-amber-400 border border-amber-700/40" : "text-muted-foreground hover:text-amber-500/70"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mafia-card rounded-xl p-4 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-amber-500/80 mb-1.5 block">Status Message / Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={200} placeholder="Write something about yourself..." className="w-full h-20 bg-black/40 border border-amber-900/30 rounded-lg p-3 text-sm text-amber-100/90 placeholder:text-amber-900/40 resize-none focus:outline-none focus:border-amber-700/50" />
                <div className="text-[10px] text-muted-foreground text-right mt-1">{bio.length}/200</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-amber-500/80">Currently Equipped</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[["Badge", currentBadge ? `${currentBadge.icon} ${currentBadge.name}` : "None"], ["Role", currentRole ? `${currentRole.prefix} ${currentRole.name}` : "None"], ["Title", selectedTitle || "None"], ["Language", `${currentLang?.flag ?? "🇬🇧"} ${currentLang?.name ?? "English"}`]].map(([label, value]) => (
                    <div key={label} className="p-2.5 rounded-lg bg-black/30 border border-amber-900/20">
                      <div className="text-muted-foreground mb-0.5">{label}</div>
                      <div className="text-amber-300 truncate">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "badge" && (
            <motion.div key="badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 className="text-xs font-bold text-amber-500/80 mb-3">Select Your Badge</h3>
              <div className="grid grid-cols-2 gap-2">
                {BADGES.map(badge => (
                  <button key={badge.id} onClick={() => setSelectedBadge(selectedBadge === badge.id ? "" : badge.id)} className={`p-3 rounded-xl text-left transition cursor-pointer ${selectedBadge === badge.id ? "border-2 border-amber-500 bg-amber-900/20" : "border border-amber-900/20 bg-black/30 hover:border-amber-700/40"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-xs font-bold text-amber-300">{badge.name}</span>
                      {selectedBadge === badge.id && <Check size={14} className="text-amber-400 ml-auto" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{badge.description}</div>
                    <div className="text-[9px] text-amber-700/60 mt-0.5">{badge.requirement}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "role" && (
            <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 className="text-xs font-bold text-amber-500/80 mb-3">Select Your Color Role</h3>
              <div className="space-y-1.5">
                {COLOR_ROLES.map(role => (
                  <button key={role.id} onClick={() => setSelectedRole(selectedRole === role.id ? "" : role.id)} className={`w-full p-2.5 rounded-lg text-left flex items-center gap-3 transition cursor-pointer ${selectedRole === role.id ? "border-2 border-amber-500/50 bg-amber-900/15" : "border border-amber-900/20 bg-black/30 hover:border-amber-700/30"}`}>
                    <span className="text-sm">{role.prefix}</span>
                    <span className="text-sm font-bold flex-1" style={{ background: role.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{role.name}</span>
                    <span className="text-[10px] text-muted-foreground">{"★".repeat(role.glowIntensity)}</span>
                    {selectedRole === role.id && <Check size={14} className="text-amber-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "title" && (
            <motion.div key="title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 className="text-xs font-bold text-amber-500/80 mb-3">Select Your Title</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {TITLES.map(title => (
                  <button key={title.id} onClick={() => setSelectedTitle(title.id)} className={`p-2.5 rounded-lg text-left text-xs transition cursor-pointer ${selectedTitle === title.id ? "border-2 border-amber-500 bg-amber-900/20" : "border border-amber-900/20 bg-black/30 hover:border-amber-700/30"}`}>
                    <div className={`font-bold ${title.color || "text-amber-300"}`}>{title.name || "None"}</div>
                    {selectedTitle === title.id && <Check size={12} className="text-amber-400 mt-0.5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "language" && (
            <motion.div key="language" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 className="text-xs font-bold text-amber-500/80 mb-3">Select Your Language</h3>
              {["Scandinavia", "Nordic", "Western Europe", "Southern Europe", "Eastern Europe", "Baltic", "Celtic"].map(region => {
                const langs = LANGUAGES.filter(l => l.region === region);
                if (langs.length === 0) return null;
                return (
                  <div key={region} className="mb-3">
                    <div className="text-[10px] text-amber-700/60 font-bold mb-1.5 uppercase tracking-wider">{region}</div>
                    <div className="grid grid-cols-3 gap-1">
                      {langs.map(lang => (
                        <button key={lang.id} onClick={() => setSelectedLang(lang.id)} className={`p-2 rounded-lg text-left text-xs transition flex items-center gap-1.5 cursor-pointer ${selectedLang === lang.id ? "border-2 border-amber-500 bg-amber-900/20" : "border border-amber-900/20 bg-black/30 hover:border-amber-700/30"}`}>
                          <span>{lang.flag}</span>
                          <span className="text-amber-200/80 truncate">{lang.name}</span>
                          {selectedLang === lang.id && <Check size={10} className="text-amber-400 ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving} className={`w-full py-3 rounded-xl font-bold text-sm transition cursor-pointer ${saved ? "bg-green-900/40 border border-green-500/40 text-green-400" : "bg-gradient-to-r from-amber-900/60 to-amber-800/40 border border-amber-700/40 text-amber-300 hover:border-amber-500/60 hover:text-amber-200"}`}>
        {saving ? "Saving..." : saved ? "✓ Saved!" : <span className="flex items-center justify-center gap-2"><Save size={16} /> Save All Changes</span>}
      </button>
    </div>
  );
}

export default MyProfilePage;

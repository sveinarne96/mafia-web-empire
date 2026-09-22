import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

export function FamilyPage() {
  const player = useQuery(api.game.getPlayer);
  const family = useQuery(api.game.getFamily);
  const members = useQuery(api.game.getFamilyMembers);
  const allFamilies = useQuery(api.game.getAllFamilies);
  const createFamily = useMutation(api.game.createFamily);
  const joinFamily = useMutation(api.game.joinFamily);
  const leaveFamily = useMutation(api.game.leaveFamily);
  const disbandFamily = useMutation(api.game.disbandFamily);

  const [view, setView] = useState<"home" | "create" | "browse" | "my_family">("home");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const hasFamily = !!family;
  const isLeader = family && player && (family as any).leaderId === player._id;

  const handleCreate = async () => {
    if (!name.trim() || !tag.trim()) { setMsg("Name and tag required"); return; }
    if ((player?.money ?? 0) < 50000) { setMsg("Need $50,000!"); return; }
    setLoading(true); setMsg("");
    try {
      await createFamily({ name: name.trim(), tag: tag.trim().slice(0, 4), description: description.trim() || "A criminal family" });
      setView("my_family");
      setMsg("");
    } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  const handleJoin = async (familyId: string) => {
    setLoading(true); setMsg("");
    try {
      await joinFamily({ familyId: familyId as any });
      setView("my_family");
    } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true); setMsg("");
    try { await leaveFamily({}); setView("home"); } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  const handleDisband = async () => {
    if (!confirm("Disband your family? This cannot be undone!")) return;
    setLoading(true); setMsg("");
    try { await disbandFamily({}); setView("home"); } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 p-6">
        <h2 className="text-2xl font-black text-purple-400">👨‍👩‍👦 FAMILY</h2>
        <p className="text-sm text-purple-200/60">Build your criminal dynasty. Rule the underworld together.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "home" as const, label: "🏠 Overview" },
          ...(hasFamily ? [{ id: "my_family" as const, label: "👨‍👩‍👦 My Family" }] : []),
          { id: "create" as const, label: "➕ Create" },
          { id: "browse" as const, label: "🔍 Browse" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === tab.id ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {msg && <div className="bg-red-950/50 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400">{msg}</div>}

      {/* Overview */}
      {view === "home" && (
        <div className="space-y-4">
          {hasFamily ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">👨‍👩‍👦</div>
                <div className="text-lg font-bold text-purple-400">{(family as any)?.name}</div>
                <div className="text-xs text-muted-foreground">[{(family as any)?.tag}]</div>
                <div className="text-xs text-yellow-400 mt-2">Level {(family as any)?.level ?? 1}</div>
              </div>
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-2xl font-black text-white">{(family as any)?.memberCount ?? 0}/{(family as any)?.maxMembers ?? 10}</div>
                <div className="text-xs text-muted-foreground">Members</div>
              </div>
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-2xl font-black text-green-400">${((family as any)?.treasury ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Treasury</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} className="mafia-card rounded-xl p-6 text-center cursor-pointer" onClick={() => setView("create")}>
                <div className="text-4xl mb-3">👑</div>
                <h3 className="text-lg font-bold text-white mb-2">Create a Family</h3>
                <p className="text-xs text-muted-foreground mb-3">Start your criminal dynasty</p>
                <div className="text-xs text-yellow-400 font-bold">Cost: $50,000</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="mafia-card rounded-xl p-6 text-center cursor-pointer" onClick={() => setView("browse")}>
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-white mb-2">Join a Family</h3>
                <p className="text-xs text-muted-foreground mb-3">Find allies to rule with</p>
                <div className="text-xs text-green-400 font-bold">Free to join</div>
              </motion.div>
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold text-white mb-2">{(allFamilies?.length ?? 0)} Families</h3>
                <p className="text-xs text-muted-foreground">Active in the underworld</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create */}
      {view === "create" && (
        <div className="mafia-card rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Create Your Family</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Family Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Shadow Syndicate"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tag (2-4 letters)</label>
            <input value={tag} onChange={e => setTag(e.target.value.toUpperCase().slice(0, 4))} placeholder="e.g. SHS"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white uppercase" maxLength={4} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="About your family..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white" />
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
            <div className="font-bold text-white mb-1">Family Features:</div>
            <div>• Shared treasury for family funds</div>
            <div>• Family-only chat channel</div>
            <div>• Family vs Family wars</div>
            <div>• Shared territory income</div>
            <div>• Up to {10} members</div>
          </div>
          <div className="text-xs text-yellow-400">Cost: $50,000 | Your cash: ${(player?.money ?? 0).toLocaleString()}</div>
          <button onClick={handleCreate} disabled={loading || (player?.money ?? 0) < 50000}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {loading ? "Creating..." : "👑 Create Family"}
          </button>
        </div>
      )}

      {/* Browse */}
      {view === "browse" && (
        <div className="space-y-3">
          {(!allFamilies || allFamilies.length === 0) ? (
            <div className="mafia-card rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">🏚️</div>
              <div className="text-lg font-bold text-white">No Families Yet</div>
              <div className="text-sm text-muted-foreground mt-1">Be the first to create a family!</div>
              <button onClick={() => setView("create")} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all">
                👑 Create Family
              </button>
            </div>
          ) : (
            allFamilies.map((f: any) => (
              <motion.div key={f._id} whileHover={{ scale: 1.01 }} className="mafia-card rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👨‍👩‍👦</div>
                    <div>
                      <div className="font-bold text-white">{f.name} <span className="text-xs text-purple-400">[{f.tag}]</span></div>
                      <div className="text-xs text-muted-foreground">{f.description || "No description"}</div>
                      <div className="text-xs text-yellow-400 mt-1">Lv.{f.level ?? 1} · {(f.memberCount ?? 0)}/{f.maxMembers ?? 10} members · ${(f.treasury ?? 0).toLocaleString()} treasury</div>
                    </div>
                  </div>
                  <div>
                    {hasFamily ? (
                      <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-slate-800/50">In a family</span>
                    ) : (
                      <button onClick={() => handleJoin(f._id)} disabled={loading}
                        className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-all">
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* My Family */}
      {view === "my_family" && hasFamily && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-purple-400">{(family as any)?.name} <span className="text-sm">[{(family as any)?.tag}]</span></h3>
                <p className="text-xs text-muted-foreground">{(family as any)?.description}</p>
              </div>
              {isLeader && (
                <button onClick={handleDisband} disabled={loading}
                  className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-600/30 transition-all">
                  Disband
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-purple-400">{(family as any)?.level ?? 1}</div>
                <div className="text-[10px] text-muted-foreground">Level</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-white">{(family as any)?.memberCount ?? 0}/{(family as any)?.maxMembers ?? 10}</div>
                <div className="text-[10px] text-muted-foreground">Members</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-green-400">${((family as any)?.treasury ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Treasury</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-orange-400">{(family as any)?.infamy ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Infamy</div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="mafia-card rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-3">👥 Members ({members?.length ?? 0})</h4>
            <div className="space-y-2">
              {members?.map((m: any) => (
                <div key={m._id} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{(family as any)?.leaderId === m._id ? "👑" : "👤"}</span>
                    <span className="text-xs font-bold text-white">{m.nickname || m.name || "Unknown"}</span>
                    {(family as any)?.leaderId === m._id && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">Leader</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">Lv.{m.level ?? 1}</span>
                </div>
              ))}
              {(!members || members.length === 0) && <div className="text-xs text-muted-foreground text-center py-4">No members found</div>}
            </div>
          </div>

          {!isLeader && (
            <button onClick={handleLeave} disabled={loading}
              className="w-full px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-600/30 transition-all">
              {loading ? "Leaving..." : "🚪 Leave Family"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

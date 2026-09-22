import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

const TERRITORIES = ["Downtown", "South Side", "Chinatown", "Little Italy", "Japantown", "Harbor District", "Industrial Zone", "Uptown", "East Side", "West End"];

export function CrewSystemPage() {
  const player = useQuery(api.game.getPlayer);
  const crew = useQuery(api.game.getCrew);
  const members = useQuery(api.game.getCrewMembers);
  const allCrews = useQuery(api.game.getAllCrews);
  const createCrew = useMutation(api.game.createCrew);
  const joinCrew = useMutation(api.game.joinCrew);
  const leaveCrew = useMutation(api.game.leaveCrew);
  const disbandCrew = useMutation(api.game.disbandCrew);

  const [view, setView] = useState<"home" | "create" | "browse" | "my_crew">("home");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [territory, setTerritory] = useState("Downtown");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const hasCrew = !!crew;
  const isLeader = crew && player && (crew as any).leaderId === player._id;

  const handleCreate = async () => {
    if (!name.trim() || !tag.trim()) { setMsg("Name and tag required"); return; }
    if ((player?.money ?? 0) < 100000) { setMsg("Need $100,000!"); return; }
    setLoading(true); setMsg("");
    try {
      await createCrew({ name: name.trim(), tag: tag.trim().slice(0, 4), description: description.trim() || "A criminal crew", territory });
      setView("my_crew");
    } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  const handleJoin = async (crewId: string) => {
    setLoading(true); setMsg("");
    try { await joinCrew({ crewId: crewId as any }); setView("my_crew"); } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true); setMsg("");
    try { await leaveCrew({}); setView("home"); } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  const handleDisband = async () => {
    if (!confirm("Disband your crew? This cannot be undone!")) return;
    setLoading(true); setMsg("");
    try { await disbandCrew({}); setView("home"); } catch (e: any) { setMsg(e.message || "Failed"); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-red-500/30 bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 p-6">
        <h2 className="text-2xl font-black text-red-400">👥 CREW SYSTEM</h2>
        <p className="text-sm text-red-200/60">Form your crew. Rule the streets together. Fight for territory.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "home" as const, label: "🏠 Overview" },
          ...(hasCrew ? [{ id: "my_crew" as const, label: "👥 My Crew" }] : []),
          { id: "create" as const, label: "➕ Create" },
          { id: "browse" as const, label: "🔍 Browse" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === tab.id ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {msg && <div className="bg-red-950/50 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400">{msg}</div>}

      {/* Overview */}
      {view === "home" && (
        <div className="space-y-4">
          {hasCrew ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="mafia-card rounded-xl p-6 text-center border border-red-500/20">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-lg font-bold text-red-400">{(crew as any)?.name}</div>
                <div className="text-xs text-muted-foreground">[{(crew as any)?.tag}]</div>
                <div className="text-xs text-yellow-400 mt-2">Level {(crew as any)?.level ?? 1}</div>
              </div>
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">📍</div>
                <div className="text-sm font-bold text-white">{(crew as any)?.territory || "No territory"}</div>
                <div className="text-xs text-muted-foreground">Territory</div>
              </div>
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-2xl font-black text-white">{(crew as any)?.memberCount ?? 0}/{(crew as any)?.maxMembers ?? 15}</div>
                <div className="text-xs text-muted-foreground">Members</div>
              </div>
              <div className="mafia-card rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">💪</div>
                <div className="text-2xl font-black text-orange-400">{(crew as any)?.power ?? 0}</div>
                <div className="text-xs text-muted-foreground">Power</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} className="mafia-card rounded-xl p-6 text-center cursor-pointer border border-red-500/20" onClick={() => setView("create")}>
                <div className="text-4xl mb-3">👑</div>
                <h3 className="text-lg font-bold text-white mb-2">Create a Crew</h3>
                <p className="text-xs text-muted-foreground mb-3">Start your own crew</p>
                <div className="text-xs text-yellow-400 font-bold">Cost: $100,000</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="mafia-card rounded-xl p-6 text-center cursor-pointer border border-red-500/20" onClick={() => setView("browse")}>
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-white mb-2">Join a Crew</h3>
                <p className="text-xs text-muted-foreground mb-3">Find allies to fight with</p>
                <div className="text-xs text-green-400 font-bold">Free to join</div>
              </motion.div>
              <div className="mafia-card rounded-xl p-6 text-center border border-red-500/20">
                <div className="text-4xl mb-3">⚔️</div>
                <h3 className="text-lg font-bold text-white mb-2">{(allCrews?.length ?? 0)} Active Crews</h3>
                <p className="text-xs text-muted-foreground">Battling for control</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create */}
      {view === "create" && (
        <div className="mafia-card rounded-xl p-6 space-y-4 border border-red-500/20">
          <h3 className="text-lg font-bold text-white">Create Your Crew</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Crew Name</label>
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
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="About your crew..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Territory</label>
            <select value={territory} onChange={e => setTerritory(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-white">
              {TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
            <div className="font-bold text-white mb-1">Crew Features:</div>
            <div>• Shared treasury for crew funds</div>
            <div>• Crew-only chat channel</div>
            <div>• Crew vs Crew wars</div>
            <div>• Territory control & income</div>
            <div>• Up to 15 members</div>
            <div>• Crew power ranking</div>
          </div>
          <div className="text-xs text-yellow-400">Cost: $100,000 | Your cash: ${(player?.money ?? 0).toLocaleString()}</div>
          <button onClick={handleCreate} disabled={loading || (player?.money ?? 0) < 100000}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {loading ? "Creating..." : "👥 Create Crew"}
          </button>
        </div>
      )}

      {/* Browse */}
      {view === "browse" && (
        <div className="space-y-3">
          {(!allCrews || allCrews.length === 0) ? (
            <div className="mafia-card rounded-xl p-8 text-center border border-red-500/20">
              <div className="text-4xl mb-3">🏚️</div>
              <div className="text-lg font-bold text-white">No Crews Yet</div>
              <div className="text-sm text-muted-foreground mt-1">Be the first to create a crew!</div>
              <button onClick={() => setView("create")} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all">
                👥 Create Crew
              </button>
            </div>
          ) : (
            allCrews.map((c: any) => (
              <motion.div key={c._id} whileHover={{ scale: 1.01 }} className="mafia-card rounded-xl p-4 border border-red-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👥</div>
                    <div>
                      <div className="font-bold text-white">{c.name} <span className="text-xs text-red-400">[{c.tag}]</span></div>
                      <div className="text-xs text-muted-foreground">{c.description || "No description"}</div>
                      <div className="text-xs text-yellow-400 mt-1">Lv.{c.level ?? 1} · {(c.memberCount ?? 0)}/{c.maxMembers ?? 15} · 💪{c.power ?? 0} · 📍{c.territory || "None"}</div>
                    </div>
                  </div>
                  <div>
                    {hasCrew ? (
                      <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-slate-800/50">In a crew</span>
                    ) : (
                      <button onClick={() => handleJoin(c._id)} disabled={loading}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-all">
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

      {/* My Crew */}
      {view === "my_crew" && hasCrew && (
        <div className="space-y-4">
          <div className="mafia-card rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-red-400">{(crew as any)?.name} <span className="text-sm">[{(crew as any)?.tag}]</span></h3>
                <p className="text-xs text-muted-foreground">{(crew as any)?.description}</p>
                <p className="text-xs text-yellow-400 mt-1">📍 {(crew as any)?.territory || "No territory"}</p>
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
                <div className="text-lg font-black text-red-400">{(crew as any)?.level ?? 1}</div>
                <div className="text-[10px] text-muted-foreground">Level</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-white">{(crew as any)?.memberCount ?? 0}/{(crew as any)?.maxMembers ?? 15}</div>
                <div className="text-[10px] text-muted-foreground">Members</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-green-400">${((crew as any)?.treasury ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Treasury</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-black text-orange-400">{(crew as any)?.power ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Power</div>
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
                    <span className="text-sm">{(crew as any)?.leaderId === m._id ? "👑" : "👤"}</span>
                    <span className="text-xs font-bold text-white">{m.nickname || m.name || "Unknown"}</span>
                    {(crew as any)?.leaderId === m._id && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Leader</span>}
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
              {loading ? "Leaving..." : "🚪 Leave Crew"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

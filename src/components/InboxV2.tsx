import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Inbox, Shield, MessageSquare, Send, Plus, Bell, Search } from "lucide-react";

/* ═══════════════ INBOX v2 — messages, support tickets, alerts ═══════════════ */

type Tab = "messages" | "support" | "alerts";

export function InboxV2() {
  const me = useQuery(api.game.getPlayer);
  const messages = useQuery(api.game.getMessages);
  const notifications = useQuery(api.game.getNotifications);
  const tickets = useQuery(api.empireFeatures.getMyTickets);
  const botMessages = useQuery(api.empireFeatures.getBotMessages);
  const sendMsg = useMutation(api.game.sendMessage);
  const createTicket = useMutation(api.empireFeatures.createTicket);
  const replyTicket = useMutation(api.empireFeatures.replyTicket);
  const claimReward = useMutation(api.empireFeatures.claimBotReplyReward);
  const markAllRead = useMutation(api.empireFeatures.markAllNotificationsRead);

  const [tab, setTab] = useState<Tab>("messages");
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState<Record<string, string>>({});
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [tSubject, setTSubject] = useState("");
  const [tBody, setTBody] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const players = useQuery(api.statistics.getPlayerDirectory, { limit: 200 });

  const show = (t: string) => { setFlash(t); setTimeout(() => setFlash(null), 2500); };

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !body.trim()) return;
    setBusy(true);
    try {
      await sendMsg({ receiverId: recipient as any, subject: subject.trim(), body: body.trim() });
      show("✅ Message sent!");
      setComposeOpen(false); setRecipient(""); setSubject(""); setBody("");
    } catch (e: any) { show(`⚠️ ${e.message}`); }
    setBusy(false);
  };

  const handleNewTicket = async () => {
    if (!tSubject.trim() || !tBody.trim()) return;
    setBusy(true);
    try {
      await createTicket({ subject: tSubject.trim(), body: tBody.trim(), category: "other" });
      show("🎫 Ticket created! Check back for replies.");
      setNewTicketOpen(false); setTSubject(""); setTBody("");
    } catch (e: any) { show(`⚠️ ${e.message}`); }
    setBusy(false);
  };

  const handleReplyTicket = async (ticketId: string) => {
    const text = ticketReply[ticketId]?.trim();
    if (!text) return;
    setBusy(true);
    try {
      await replyTicket({ ticketId: ticketId as any, message: text });
      show("💬 Reply sent!");
      setTicketReply((p) => ({ ...p, [ticketId]: "" }));
    } catch (e: any) { show(`⚠️ ${e.message}`); }
    setBusy(false);
  };

  const handleClaimReward = async (messageId: string) => {
    setBusy(true);
    try {
      const r = await claimReward({ messageId: messageId as any });
      show(r.text || (r.reward ? `🎁 ${r.reward}` : "Reply sent"));
    } catch (e: any) { show(`⚠️ ${e.message}`); }
    setBusy(false);
  };

  const unreadAlerts = (notifications ?? []).filter((n: any) => !n.read).length;
  const playerList = (players || []).filter((p: any) => p.nickname && p._id !== me?._id);

  const filteredMessages = (messages ?? []).filter((m: any) =>
    !search || m.subject?.toLowerCase().includes(search.toLowerCase()) || m.body?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Inbox className="size-7 text-primary" />
        <h2 className="text-2xl font-bold">Inbox</h2>
        {unreadAlerts > 0 && (
          <button onClick={() => setTab("alerts")} className="rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-[10px] font-black text-red-300 animate-pulse">
            🔔 {unreadAlerts} unread alerts
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setTab("messages"); setComposeOpen(true); }} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-300 hover:bg-amber-500/20">
            ✉️ Compose
          </button>
          <button onClick={() => { setTab("support"); setNewTicketOpen(true); }} className="rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-[10px] font-black text-green-300 hover:bg-green-500/20">
            🎫 New Ticket
          </button>
        </div>
      </div>

      {flash && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-center text-xs font-bold text-amber-300 animate-fade-in">{flash}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "messages" as Tab, label: `💬 Messages (${messages?.length ?? 0})` },
          { id: "support" as Tab, label: `🆘 Support (${tickets?.length ?? 0})` },
          { id: "alerts" as Tab, label: `🔔 Alerts ${unreadAlerts > 0 ? `(${unreadAlerts})` : ""}` },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${tab === t.id ? "border border-amber-500/40 bg-amber-600/20 text-amber-300" : "border border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* MESSAGES TAB */}
      {tab === "messages" && (
        <div className="space-y-3">
          {composeOpen && (
            <div className="mafia-card rounded-xl p-4 space-y-3 border border-primary/20 animate-fade-in">
              <div className="text-sm font-bold">✉️ New Message</div>
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                <option value="">Select player…</option>
                {playerList.map((p: any) => <option key={p._id} value={p._id}>{p.nickname} (Lv.{p.level})</option>)}
              </select>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…" rows={4} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <button onClick={handleSend} disabled={busy || !recipient || !subject.trim() || !body.trim()}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 py-2.5 text-xs font-black text-primary-foreground disabled:opacity-40">
                {busy ? "Sending…" : "📤 Send Message"}
              </button>
            </div>
          )}

          {(!filteredMessages || filteredMessages.length === 0) ? (
            <div className="mafia-card rounded-xl p-8 text-center text-muted-foreground text-sm space-y-2">
              <div className="text-3xl">📭</div>
              <div>No messages yet</div>
              <div className="text-[10px]">Street contacts and players will reach out here.</div>
            </div>
          ) : (
            filteredMessages.map((m: any) => (
              <div key={m._id} onClick={() => setExpanded(expanded === m._id ? null : m._id)}
                className={`mafia-card cursor-pointer rounded-xl p-3 transition-all hover:border-primary/30 ${!m.read ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-3.5 shrink-0 text-primary" />
                  <span className="flex-1 truncate text-sm font-bold">{m.subject}</span>
                  {!m.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(m.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {expanded === m._id && (
                  <div className="mt-3 space-y-2 border-t border-border/50 pt-3 animate-fade-in">
                    <div className="text-xs text-muted-foreground whitespace-pre-wrap">{m.body}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SUPPORT TAB */}
      {tab === "support" && (
        <div className="space-y-3">
          {newTicketOpen && (
            <div className="mafia-card rounded-xl p-4 space-y-3 border border-green-500/20 animate-fade-in">
              <div className="text-sm font-bold">🎫 New Support Ticket</div>
              <input value={tSubject} onChange={(e) => setTSubject(e.target.value)} placeholder="Subject (e.g. Bug report)…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <textarea value={tBody} onChange={(e) => setTBody(e.target.value)} placeholder="Describe your issue…" rows={4} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <button onClick={handleNewTicket} disabled={busy || !tSubject.trim() || !tBody.trim()}
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 py-2.5 text-xs font-black text-white disabled:opacity-40">
                {busy ? "Creating…" : "🎫 Create Ticket"}
              </button>
            </div>
          )}

          {(!tickets || tickets.length === 0) ? (
            <div className="mafia-card rounded-xl p-8 text-center text-muted-foreground text-sm space-y-2">
              <div className="text-3xl">🎫</div>
              <div>No tickets yet</div>
              <div className="text-[10px]">Create a ticket and staff will reply right here.</div>
            </div>
          ) : (
            tickets.map((t: any) => (
              <div key={t._id} className="mafia-card rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 shrink-0 text-green-400" />
                  <span className="flex-1 text-sm font-black">{t.subject}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${t.status === "resolved" ? "bg-green-500/20 text-green-400" : t.status === "waiting" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>{t.status}</span>
                </div>
                {/* Thread */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(t.messages ?? []).map((msg: any, i: number) => (
                    <div key={i} className={`rounded-lg p-2.5 ${msg.senderRole === "player" ? "bg-slate-900/60 ml-6" : "bg-green-950/20 mr-6 border border-green-500/20"}`}>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase">
                        <span className={msg.senderRole === "player" ? "text-cyan-400" : "text-green-400"}>{msg.sender}</span>
                        <span className="text-slate-600">{new Date(msg.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-300 whitespace-pre-wrap">{msg.message}</div>
                    </div>
                  ))}
                </div>
                {/* Reply box */}
                <div className="flex gap-2">
                  <input value={ticketReply[t._id] ?? ""} onChange={(e) => setTicketReply((p) => ({ ...p, [t._id]: e.target.value }))}
                    placeholder="Write a reply…" onKeyDown={(e) => e.key === "Enter" && handleReplyTicket(t._id)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs" />
                  <button onClick={() => handleReplyTicket(t._id)} disabled={busy || !ticketReply[t._id]?.trim()}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-[10px] font-black text-black disabled:opacity-40">Reply</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ALERTS TAB */}
      {tab === "alerts" && (
        <div className="space-y-2">
          {unreadAlerts > 0 && (
            <button onClick={async () => { await markAllRead(); show("All alerts marked read"); }}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 py-2 text-[10px] font-black text-slate-300 hover:bg-slate-800">
              ✓ Mark all read
            </button>
          )}
          {(!notifications || notifications.length === 0) ? (
            <div className="mafia-card rounded-xl p-8 text-center text-muted-foreground text-sm space-y-2">
              <Bell className="size-8 mx-auto text-slate-700" />
              <div>No alerts</div>
              <div className="text-[10px]">Game events — arrests, rewards, attacks — appear here.</div>
            </div>
          ) : (
            notifications.map((n: any) => (
              <div key={n._id} className={`flex items-start gap-3 rounded-xl border p-3 ${n.read ? "border-slate-800/60 bg-slate-900/30" : "border-amber-500/30 bg-amber-950/20"}`}>
                <Bell className={`mt-0.5 size-4 shrink-0 ${n.read ? "text-slate-600" : "text-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs ${n.read ? "text-slate-400" : "font-bold text-slate-200"}`}>{n.message}</div>
                  <div className="mt-0.5 text-[9px] text-slate-600">{new Date(n.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  HelpCircle, Send, Clock, AlertTriangle, CheckCircle2, 
  MessageSquare, User, Shield, Zap, Eye, ChevronDown, 
  ChevronUp, Circle, Headphones, Ticket, Radio, Activity
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface SupportTicket {
  id: string;
  subject: string;
  body: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  createdAt: number;
  updatedAt: number;
  messages: TicketMessage[];
  player: string;
}

interface TicketMessage {
  id: string;
  sender: string;
  senderRole: "player" | "staff" | "system";
  message: string;
  timestamp: number;
}

interface LiveFeedItem {
  id: string;
  type: "ticket_created" | "ticket_updated" | "staff_response" | "ticket_resolved" | "player_reply";
  message: string;
  timestamp: number;
  ticketId: string;
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════

const TICKET_CATEGORIES = [
  { id: "bug", label: "🐛 Bug Report", color: "red", desc: "Report a bug or glitch" },
  { id: "payment", label: "💰 Payment Issue", color: "amber", desc: "Billing or transaction problems" },
  { id: "account", label: "👤 Account Issue", color: "blue", desc: "Login, password, or account access" },
  { id: "cheater", label: "🚨 Cheater Report", color: "red", desc: "Report a player cheating/exploiting" },
  { id: "gameplay", label: "🎮 Gameplay Question", color: "purple", desc: "How does something work?" },
  { id: "feature", label: "💡 Feature Request", color: "green", desc: "Suggest a new feature" },
  { id: "appeal", label: "⚖️ Ban Appeal", color: "orange", desc: "Appeal a punishment" },
  { id: "other", label: "📋 Other", color: "slate", desc: "Anything else" },
];

const PRIORITY_LEVELS = [
  { id: "low", label: "🟢 Low", color: "green", desc: "General question or suggestion" },
  { id: "medium", label: "🟡 Medium", color: "amber", desc: "Issue affecting gameplay" },
  { id: "high", label: "🟠 High", color: "orange", desc: "Major issue or account problem" },
  { id: "critical", label: "🔴 Critical", color: "red", desc: "Urgent — game-breaking or security issue" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; pulse: boolean }> = {
  open: { label: "Open", color: "blue", icon: "🔵", pulse: false },
  in_progress: { label: "In Progress", color: "amber", icon: "🟡", pulse: true },
  waiting: { label: "Awaiting Reply", color: "purple", icon: "🟣", pulse: false },
  resolved: { label: "Resolved", color: "green", icon: "🟢", pulse: false },
  closed: { label: "Closed", color: "slate", icon: "⚫", pulse: false },
};

// ═══════════════════════════════════════════════════════════════════
// AUTO-RESPONSE TEMPLATES (simulates staff)
// ═══════════════════════════════════════════════════════════════════

const STAFF_NAMES = ["ShadowMod", "NightAdmin", "CrimeBoss_Support", "UndergroundMod", "DarkGuardian"];

function getAutoResponse(category: string): string {
  const responses: Record<string, string[]> = {
    bug: [
      "Thank you for reporting this bug. Our team has been notified and is investigating. We'll update you within 24 hours.",
      "Bug acknowledged. We've logged this in our tracking system. Priority: High. Expected resolution: 12-24 hours.",
      "We've identified the issue. A hotfix is being prepared. Thank you for your patience.",
    ],
    payment: [
      "We've reviewed your transaction. A billing specialist will reach out within 2-4 hours. Your account has been noted.",
      "Payment issue logged. Please provide your transaction ID in the next message for faster resolution.",
    ],
    account: [
      "Account security team notified. Please check your email for a password reset link. Do not share your credentials.",
      "We've verified your account. If you're still locked out, a manual review will be completed within 6 hours.",
    ],
    cheater: [
      "Thank you for the report. Our anti-cheat team will review the flagged player. Reports are handled within 48 hours.",
      "Cheater report received. The player has been flagged for review. You'll be notified of the outcome.",
    ],
    gameplay: [
      "Great question! Check out our FAQ page for detailed guides. If you need more help, we're here 24/7.",
      "This is covered in our game guide. The short answer: focus on leveling up your skills first. Let us know if you need more details!",
    ],
    feature: [
      "Feature request logged! We love hearing ideas from our community. This will be reviewed by the dev team.",
      "Thanks for the suggestion! We've added it to our feature backlog. Popular requests get prioritized!",
    ],
    appeal: [
      "Ban appeal received. A senior admin will review your case within 48 hours. Please be patient.",
      "Your appeal has been submitted. Evidence will be reviewed. You'll receive a verdict via inbox.",
    ],
    other: [
      "We've received your message. A support agent will respond shortly. Average response time: 2-4 hours.",
      "Ticket received! Our team is reviewing your inquiry. You'll hear back soon.",
    ],
  };
  const pool = responses[category] || responses.other;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════

function loadTickets(): SupportTicket[] {
  try { return JSON.parse(localStorage.getItem("support_tickets") || "[]"); } catch { return []; }
}
function saveTickets(tickets: SupportTicket[]) {
  localStorage.setItem("support_tickets", JSON.stringify(tickets));
}
function loadFeed(): LiveFeedItem[] {
  try { return JSON.parse(localStorage.getItem("support_feed") || "[]"); } catch { return []; }
}
function saveFeed(feed: LiveFeedItem[]) {
  localStorage.setItem("support_feed", JSON.stringify(feed.slice(0, 100)));
}
function loadInboxItems() {
  try { return JSON.parse(localStorage.getItem("inbox_items") || "[]"); } catch { return []; }
}
function saveInboxItems(items: any[]) {
  localStorage.setItem("inbox_items", JSON.stringify(items));
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SUPPORT PAGE
// ═══════════════════════════════════════════════════════════════════

export function LiveSupportPage() {
  const player = useQuery(api.game.getPlayer);
  const [tab, setTab] = useState<"create" | "tickets" | "feed" | "faq">("create");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [feed, setFeed] = useState<LiveFeedItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Create form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("bug");
  const [priority, setPriority] = useState("medium");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTickets(loadTickets());
    setFeed(loadFeed());
  }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [feed]);

  const addFeedItem = (item: Omit<LiveFeedItem, "id" | "timestamp">) => {
    const newItem: LiveFeedItem = { ...item, id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now() };
    const updated = [...feed, newItem];
    setFeed(updated);
    saveFeed(updated);
  };

  const addToInbox = (subject: string, message: string, ticketId: string) => {
    const items = loadInboxItems();
    items.unshift({
      id: `inbox_${Date.now()}`,
      type: "support_response",
      subject: `🆘 ${subject}`,
      message,
      ticketId,
      read: false,
      timestamp: Date.now(),
    });
    saveInboxItems(items);
  };

  const createTicket = async () => {
    if (!subject || !body) return;
    setCreating(true);
    await new Promise(r => setTimeout(r, 800));
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subject,
      body,
      category,
      priority,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        { id: "msg_1", sender: player?.name || "You", senderRole: "player", message: body, timestamp: Date.now() },
      ],
      player: player?.name || "Unknown",
    };
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveTickets(updated);
    addFeedItem({ type: "ticket_created", message: `New ticket: "${subject}" [${category}]`, ticketId: newTicket.id });
    setSubject("");
    setBody("");
    setCategory("bug");
    setPriority("medium");
    setCreated(true);
    setCreating(false);
    setTimeout(() => setCreated(false), 3000);

    // Auto-respond after delay (simulates staff)
    setTimeout(() => {
      const currentTickets = loadTickets();
      const ticket = currentTickets.find(t => t.id === newTicket.id);
      if (ticket && ticket.status === "open") {
        const response = getAutoResponse(category);
        const staffName = STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)];
        const staffMsg: TicketMessage = {
          id: `msg_${Date.now()}`,
          sender: staffName,
          senderRole: "staff",
          message: response,
          timestamp: Date.now(),
        };
        ticket.messages.push(staffMsg);
        ticket.status = "waiting";
        ticket.updatedAt = Date.now();
        saveTickets(currentTickets);
        setTickets([...currentTickets]);
        addFeedItem({ type: "staff_response", message: `${staffName} responded to "${subject}"`, ticketId: newTicket.id });
        addToInbox(subject, response, newTicket.id);
      }
    }, 3000 + Math.random() * 5000);
  };

  const sendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const currentTickets = loadTickets();
    const ticket = currentTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    ticket.messages.push({
      id: `msg_${Date.now()}`,
      sender: player?.name || "You",
      senderRole: "player",
      message: replyText,
      timestamp: Date.now(),
    });
    ticket.status = "waiting";
    ticket.updatedAt = Date.now();
    saveTickets(currentTickets);
    setTickets([...currentTickets]);
    addFeedItem({ type: "player_reply", message: `You replied to "${ticket.subject}"`, ticketId });
    setReplyText("");

    // Auto staff reply
    setTimeout(() => {
      const fresh = loadTickets();
      const t = fresh.find(x => x.id === ticketId);
      if (t && t.status === "waiting") {
        const response = getAutoResponse(t.category);
        const staffName = STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)];
        t.messages.push({
          id: `msg_${Date.now()}`,
          sender: staffName,
          senderRole: "staff",
          message: response,
          timestamp: Date.now(),
        });
        t.status = "in_progress";
        t.updatedAt = Date.now();
        saveTickets(fresh);
        setTickets([...fresh]);
        addFeedItem({ type: "staff_response", message: `${staffName} responded to "${t.subject}"`, ticketId });
        addToInbox(t.subject, response, ticketId);
      }
    }, 2000 + Math.random() * 4000);
  };

  const closeTicket = (ticketId: string) => {
    const currentTickets = loadTickets();
    const ticket = currentTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    ticket.status = "closed";
    ticket.updatedAt = Date.now();
    saveTickets(currentTickets);
    setTickets([...currentTickets]);
    addFeedItem({ type: "ticket_resolved", message: `Ticket "${ticket.subject}" closed`, ticketId });
  };

  const openCount = tickets.filter(t => t.status === "open" || t.status === "in_progress" || t.status === "waiting").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
  const activeTicket = tickets.find(t => t.id === selectedTicket);

  return (
    <div className="animate-fade-in space-y-4">
      {/* ─── HEADER ─── */}
      <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 rounded-2xl p-4 md:p-6 border border-blue-500/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Headphones className="size-8 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-blue-300 tracking-wider">LIVE SUPPORT</h1>
              <p className="text-[10px] text-slate-500">24/7 Response • Average reply: 2-4 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
              <Radio className="size-3 text-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-green-300">STAFF ONLINE</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">YOUR TICKETS</div>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-blue-300">{openCount} open</span>
                <span className="text-xs font-bold text-green-300">{resolvedCount} resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: "create" as const, label: "✏️ New Ticket", color: "blue" },
          { id: "tickets" as const, label: `📋 My Tickets (${tickets.length})`, color: "amber" },
          { id: "feed" as const, label: "📡 Live Feed", color: "green" },
          { id: "faq" as const, label: "❓ Quick Help", color: "purple" },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? `bg-${t.color}-600/30 border border-${t.color}-500/40 text-${t.color}-300` : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ CREATE TICKET ═══════════ */}
      {tab === "create" && (
        <div className="space-y-4">
          {created && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="size-5 text-green-400" />
              <div>
                <span className="text-sm font-bold text-green-300">Ticket Created Successfully!</span>
                <p className="text-[10px] text-green-400/70">A staff member will respond shortly. Check your Inbox for updates.</p>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-xs font-bold text-slate-400 mb-3">CATEGORY</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TICKET_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    category === cat.id
                      ? `bg-${cat.color}-500/15 border-${cat.color}-500/40 text-${cat.color}-300`
                      : "bg-slate-800/50 border-slate-700/30 text-slate-400 hover:bg-slate-700/50"
                  }`}>
                  <div className="text-sm font-bold">{cat.label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-xs font-bold text-slate-400 mb-3">PRIORITY</h3>
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_LEVELS.map(p => (
                <button key={p.id} onClick={() => setPriority(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    priority === p.id
                      ? `bg-${p.color}-500/15 border-${p.color}-500/40 text-${p.color}-300`
                      : "bg-slate-800/50 border-slate-700/30 text-slate-400 hover:bg-slate-700/50"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 space-y-3">
            <input value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Subject — Brief description of your issue"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none" />
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Describe your issue in detail. Include steps to reproduce if it's a bug, your username, and any relevant information..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none min-h-[140px] resize-none" />
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-slate-600">
                📎 Tip: Include screenshots, error messages, or transaction IDs for faster resolution
              </div>
              <button onClick={createTicket} disabled={creating || !subject || !body}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2">
                <Send className="size-4" />
                {creating ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </div>

          {/* SLA Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Avg Response", value: "2-4 hrs", icon: "⚡" },
              { label: "Resolution", value: "12-48 hrs", icon: "✅" },
              { label: "Staff Online", value: "24/7", icon: "👨‍💼" },
              { label: "Satisfaction", value: "98.2%", icon: "⭐" },
            ].map(s => (
              <div key={s.label} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-3 text-center">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-xs font-bold text-slate-300">{s.value}</div>
                <div className="text-[9px] text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ MY TICKETS ═══════════ */}
      {tab === "tickets" && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8 text-center">
              <Ticket className="size-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-400">No Tickets Yet</h3>
              <p className="text-[10px] text-slate-600 mt-1">Create your first support ticket to get help</p>
              <button onClick={() => setTab("create")} className="mt-3 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold">
                ✏️ Create Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(ticket => {
                const st = STATUS_CONFIG[ticket.status];
                const isActive = selectedTicket === ticket.id;
                const unreadStaffMsgs = ticket.messages.filter(m => m.senderRole === "staff").length;
                return (
                  <div key={ticket.id}
                    className={`bg-slate-900/50 rounded-xl border transition-all ${
                      isActive ? "border-blue-500/40" : "border-slate-700/50 hover:border-slate-600/50"
                    }`}>
                    {/* Ticket Header */}
                    <div onClick={() => setSelectedTicket(isActive ? null : ticket.id)}
                      className="p-3 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${st.pulse ? "bg-amber-400 animate-pulse" : "bg-slate-600"}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{ticket.subject}</span>
                            {unreadStaffMsgs > 0 && !isActive && (
                              <span className="bg-blue-500/30 text-blue-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                {unreadStaffMsgs} reply
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{TICKET_CATEGORIES.find(c => c.id === ticket.category)?.label || ticket.category}</span>
                            <span>•</span>
                            <span>{PRIORITY_LEVELS.find(p => p.id === ticket.priority)?.label || ticket.priority}</span>
                            <span>•</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-${st.color}-500/20 text-${st.color}-300`}>
                          {st.icon} {st.label}
                        </span>
                        {isActive ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
                      </div>
                    </div>

                    {/* Expanded Ticket */}
                    {isActive && (
                      <div className="border-t border-slate-700/30 p-3 space-y-3">
                        {/* Messages Thread */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {ticket.messages.map(msg => (
                            <div key={msg.id} className={`flex gap-2 ${msg.senderRole === "staff" ? "" : "flex-row-reverse"}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                msg.senderRole === "staff" ? "bg-blue-500/20" : "bg-amber-500/20"
                              }`}>
                                {msg.senderRole === "staff" ? <Shield className="size-4 text-blue-400" /> : <User className="size-4 text-amber-400" />}
                              </div>
                              <div className={`max-w-[80%] rounded-xl p-3 ${
                                msg.senderRole === "staff" ? "bg-blue-500/10 border border-blue-500/20" : "bg-slate-800/50 border border-slate-700/30"
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold ${msg.senderRole === "staff" ? "text-blue-300" : "text-amber-300"}`}>
                                    {msg.senderRole === "staff" ? `🛡️ ${msg.sender}` : msg.sender}
                                  </span>
                                  <span className="text-[9px] text-slate-600">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply Box */}
                        {ticket.status !== "closed" && (
                          <div className="flex gap-2">
                            <input value={replyText} onChange={e => setReplyText(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && sendReply(ticket.id)}
                              placeholder="Type your reply..."
                              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                            <button onClick={() => sendReply(ticket.id)}
                              className="px-4 py-2 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-600/40 transition-all">
                              <Send className="size-3.5" />
                            </button>
                            <button onClick={() => closeTicket(ticket.id)}
                              className="px-3 py-2 bg-slate-700/50 border border-slate-600/30 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-600/50 transition-all">
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ LIVE FEED ═══════════ */}
      {tab === "feed" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-green-400 flex items-center gap-2">
              <Radio className="size-3.5 animate-pulse" /> LIVE ACTIVITY FEED
            </h3>
            <span className="text-[10px] text-slate-600">{feed.length} events</span>
          </div>
          <div ref={feedRef} className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 max-h-[500px] overflow-y-auto space-y-2">
            {feed.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="size-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No activity yet. Create a ticket to start!</p>
              </div>
            ) : (
              [...feed].reverse().map(item => {
                const typeConfig: Record<string, { color: string; icon: string }> = {
                  ticket_created: { color: "blue", icon: "📝" },
                  ticket_updated: { color: "amber", icon: "🔄" },
                  staff_response: { color: "green", icon: "🛡️" },
                  ticket_resolved: { color: "emerald", icon: "✅" },
                  player_reply: { color: "purple", icon: "💬" },
                };
                const cfg = typeConfig[item.type] || typeConfig.ticket_created;
                return (
                  <div key={item.id} className={`flex items-start gap-2 p-2 rounded-lg bg-${cfg.color}-500/5 border border-${cfg.color}-500/10`}>
                    <span className="text-sm">{cfg.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-300">{item.message}</p>
                      <span className="text-[9px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════ QUICK HELP ═══════════ */}
      {tab === "faq" && (
        <div className="space-y-3">
          {[
            { q: "How do I report a cheater?", a: "Go to New Ticket → Cheater Report. Include the player's name, what they did, and when. Our team reviews within 48 hours." },
            { q: "I lost items/money — can you restore them?", a: "If it was a bug, we can restore within 24 hours. If it was PvP theft, that's part of the game. Include proof for bug claims." },
            { q: "How long does a ban appeal take?", a: "Ban appeals are reviewed by senior admins within 48 hours. You'll receive a verdict in your Inbox." },
            { q: "I found a bug — what should I include?", a: "Steps to reproduce, screenshots/video if possible, your browser/device, and what you expected to happen vs what actually happened." },
            { q: "Can I talk to a staff member directly?", a: "Create a ticket and reply in the thread. Staff respond within 2-4 hours on average. For urgent issues, select Critical priority." },
            { q: "How do I check my ticket status?", a: "Go to 'My Tickets' tab. Click any ticket to see the full conversation and current status." },
            { q: "My payment didn't go through", a: "Create a Payment Issue ticket with your transaction ID, amount, and payment method. We'll resolve within 12 hours." },
            { q: "I was hacked — what do I do?", a: "Create a Critical Account Issue ticket immediately. Include your last login time and any suspicious activity. Change your password ASAP." },
          ].map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-800/30 transition-all">
        <span className="text-sm font-bold text-slate-300">{question}</span>
        {open ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-slate-700/30">
          <p className="text-xs text-slate-400 mt-2">{answer}</p>
        </div>
      )}
    </div>
  );
}

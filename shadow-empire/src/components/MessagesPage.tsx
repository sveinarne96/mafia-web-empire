import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquare, Send, User, Shield } from "lucide-react";

function MessagesPage() {
  const messages = useQuery(api.game.getMessages);
  const players = useQuery(api.statistics.getPlayerDirectory, { limit: 200 });
  const sendMsg = useMutation(api.game.sendMessage);
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await sendMsg({ receiverId: recipient as any, subject: subject.trim(), body: body.trim() });
      setSentMsg("Message sent!");
      setComposeOpen(false);
      setRecipient("");
      setSubject("");
      setBody("");
      setTimeout(() => setSentMsg(""), 3000);
    } catch (e: any) { alert(e.message || "Failed to send"); }
    setSending(false);
  };

  const playerList = (players || []).filter((p: any) => p.nickname);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><MessageSquare className="size-7 text-primary" /><h2 className="text-2xl font-bold">Messages</h2></div>
        <button onClick={() => setComposeOpen(!composeOpen)} className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5">
          {composeOpen ? "✕ Close" : "✉️ Compose"}
        </button>
      </div>

      {sentMsg && <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold animate-fade-in">✓ {sentMsg}</div>}

      {/* Compose Form */}
      {composeOpen && (
        <div className="mafia-card rounded-xl p-4 space-y-3 border border-primary/20 animate-fade-in">
          <div className="text-sm font-bold flex items-center gap-2">✉️ New Message</div>
          <select value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm">
            <option value="">Select player...</option>
            {playerList.map((p: any) => <option key={p._id} value={p._id}>{p.nickname} (Lv.{p.level})</option>)}
          </select>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={4} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" />
          <button onClick={handleSend} disabled={sending || !recipient || !subject.trim() || !body.trim()} className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-all">
            {sending ? "Sending..." : "📤 Send Message"}
          </button>
        </div>
      )}

      {/* Message List */}
      {(!messages || messages.length === 0) ? (
        <div className="mafia-card rounded-xl p-6 text-center text-muted-foreground text-sm space-y-2">
          <div className="text-3xl">📭</div>
          <div>No messages yet</div>
          <div className="text-[10px]">Click Compose to send your first message, or click the message icon on any online player.</div>
        </div>
      ) : (
        <div className="space-y-2">{messages.map((m: any) => (
          <div key={m._id} onClick={() => setExpandedMsg(expandedMsg === m._id ? null : m._id)} className={`mafia-card rounded-xl p-3 cursor-pointer transition-all hover:border-primary/30 ${!m.read ? "border-primary/30 bg-primary/5" : ""} ${expandedMsg === m._id ? "border-primary/50" : ""}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-3.5 text-primary shrink-0" />
                <span className="text-sm font-bold">{m.subject}</span>
                {!m.read && <span className="size-2 bg-primary rounded-full shrink-0" />}
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {expandedMsg === m._id && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-fade-in">
                <div className="text-xs text-muted-foreground">From: {m.senderId?.slice(-6) || "Unknown"}</div>
                <div className="text-sm text-foreground/80">{m.body}</div>
              </div>
            )}
          </div>
        ))}</div>
      )}
    </div>
  );
}
export { MessagesPage };

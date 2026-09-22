import { useState, useEffect } from "react";
import { Inbox, Shield, MessageSquare } from "lucide-react";
import { MessagesPage } from "@/components/MessagesPage";

function InboxPage() {
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "messages" | "support">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try { setInboxItems(JSON.parse(localStorage.getItem("inbox_items") || "[]")); } catch { setInboxItems([]); }
  }, []);

  const markRead = (id: string) => {
    const updated = inboxItems.map(item => item.id === id ? { ...item, read: true } : item);
    setInboxItems(updated);
    localStorage.setItem("inbox_items", JSON.stringify(updated));
  };

  const supportItems = inboxItems.filter(i => i.type === "support_response");
  const unreadCount = inboxItems.filter(i => !i.read).length;
  const filtered = activeTab === "all" ? inboxItems : activeTab === "support" ? supportItems : inboxItems.filter(i => i.type !== "support_response");

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Inbox className="size-7 text-primary" />
            {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">{unreadCount}</div>}
          </div>
          <h2 className="text-2xl font-bold">Inbox</h2>
        </div>
        <span className="text-xs text-slate-500">{inboxItems.length} items • {unreadCount} unread</span>
      </div>

      <div className="flex gap-2">
        {(["all", "messages", "support"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? "bg-amber-600/30 border border-amber-500/40 text-amber-300" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}>
            {tab === "all" ? "📬 All" : tab === "messages" ? "💬 Messages" : `🆘 Support (${supportItems.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8 text-center">
          <Inbox className="size-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-400">Inbox Empty</h3>
          <p className="text-[10px] text-slate-600 mt-1">Messages and support responses will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...filtered].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map(item => {
            const isSupport = item.type === "support_response";
            const isExp = expanded === item.id;
            return (
              <div key={item.id}
                onClick={() => { setExpanded(isExp ? null : item.id); if (!item.read) markRead(item.id); }}
                className={`bg-slate-900/50 rounded-xl border cursor-pointer transition-all ${
                  isExp ? "border-amber-500/30" : !item.read ? "border-blue-500/30" : "border-slate-700/50 hover:border-slate-600/50"
                }`}>
                <div className="p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSupport ? "bg-green-500/20" : "bg-blue-500/20"}`}>
                    {isSupport ? <Shield className="size-4 text-green-400" /> : <MessageSquare className="size-4 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${!item.read ? "text-white" : "text-slate-300"} truncate`}>{item.subject}</span>
                      {!item.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{item.message?.substring(0, 80)}...</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[9px] text-slate-600">{new Date(item.timestamp).toLocaleDateString()}</div>
                    <div className="text-[9px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
                {isExp && (
                  <div className="px-3 pb-3 border-t border-slate-700/30 pt-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                    {item.ticketId && (
                      <div className="mt-2 text-[9px] text-slate-500">Ticket: {item.ticketId.substring(0, 20)}...</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 border-t border-slate-700/50 pt-4">
        <h3 className="text-sm font-bold text-slate-300 mb-2">💬 Direct Messages</h3>
        <MessagesPage />
      </div>
    </div>
  );
}
export { InboxPage };

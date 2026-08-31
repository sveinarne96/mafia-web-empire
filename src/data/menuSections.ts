import {
  Shield,
  MessageSquare,
  Globe,
  Swords,
  HelpCircle,
  Settings,
} from "lucide-react";

export const RIGHT_MENU_SECTIONS = [
  { title: "Firearms", icon: Shield, items: [
    { label: "Permit", page: "security", icon: "📋" },
    { label: "FFL", page: "security", icon: "🏪" },
    { label: "Bullets", page: "security", icon: "💀" },
    { label: "Armor", page: "security", icon: "🦺" },
    { label: "Lockpick", page: "security", icon: "🔑" },
  ]},
  { title: "Communication", icon: MessageSquare, items: [
    { label: "Direct Messages", page: "messages", icon: "📩" },
    { label: "Inbox", page: "inbox", icon: "📥" },
    { label: "Notifications", page: "notifications_page", icon: "🔔" },
  ]},
  { title: "Forums", icon: MessageSquare, items: [
    { label: "General Forum", page: "forum_general", icon: "📢" },
    { label: "Sales Forum", page: "forum_sales", icon: "💰" },
    { label: "Off-Topic", page: "forum_offtopic", icon: "💭" },
    { label: "Shadows Forum", page: "forum_shadows", icon: "🌑" },
    { label: "Search Posts", page: "forum_search", icon: "🔍" },
  ]},
  { title: "Chat", icon: MessageSquare, items: [
    { label: "Global Chat", page: "global_chat", icon: "🌐" },
    { label: "Trade Chat", page: "trade_chat", icon: "💹" },
    { label: "Looking for Group", page: "lfg", icon: "👥" },
  ]},
  { title: "Quick Info", icon: Globe, items: [
    { label: "Airport", page: "airport", icon: "✈️" },
    { label: "Weather", page: "weather", icon: "🌤️" },
    { label: "News Ticker", page: "news_ticker", icon: "📰" },
    { label: "City Map", page: "city_map", icon: "🗺️" },
    { label: "City Overview", page: "city_overview", icon: "🏙️" },
    { label: "Statistics", page: "statistics", icon: "📊" },
    { label: "World Map", page: "world_map", icon: "🌍" },
  ]},
  { title: "Combat", icon: Swords, items: [
    { label: "Arena", page: "arena", icon: "🏟️" },
    { label: "Fight Club", page: "fight_club", icon: "🥊" },
    { label: "1v1 Duel", page: "duel", icon: "⚔️" },
    { label: "Capture the Flag", page: "ctf", icon: "🚩" },
    { label: "King of the Hill", page: "koth", icon: "👑" },
    { label: "Battle Royale", page: "battle_royale", icon: "🎯" },
    { label: "Ladder", page: "ladder", icon: "📊" },
    { label: "Champion", page: "champion", icon: "🏆" },
    { label: "Ambush", page: "ambush", icon: "🔥" },
  ]},
  { title: "Help & Events", icon: HelpCircle, items: [
    { label: "FAQ", page: "faq", icon: "❓" },
    { label: "Live Support", page: "support", icon: "🆘" },
    { label: "Events Hub", page: "events_hub", icon: "🎆" },
    { label: "Live Calendar", page: "event_calendar", icon: "📅" },
    { label: "Guidelines", page: "community", icon: "📜" },
    { label: "Reports", page: "reports", icon: "📢" },
  ]},
  { title: "System", icon: Settings, items: [
    { label: "My Profile", page: "my_profile", icon: "👤" },
    { label: "Admin", page: "admin_panel", icon: "⚙️" },
    { label: "Become Admin", page: "become_admin", icon: "🔑" },
    { label: "Online Players", page: "online_players", icon: "👥" },
  ]},
];

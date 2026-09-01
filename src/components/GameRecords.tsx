import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trophy } from "lucide-react";

interface GameRecordProps {
  title: string;
  icon: string;
  field: string;
  label: string;
}

function GameRecordPage({ title, icon, field, label }: GameRecordProps) {
  const allPlayers = useQuery(api.admin.getAllPlayers);
  if (allPlayers === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const sorted = [...allPlayers]
    .filter((p: any) => p.nickname)
    .sort((a: any, b: any) => (b[field] ?? 0) - (a[field] ?? 0))
    .slice(0, 50);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-2xl font-bold mafia-gold">{title}</h2>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      <div className="space-y-1">
        {sorted.map((p: any, i: number) => {
          const value = p[field] ?? 0;
          const isTop3 = i < 3;
          const medalColors = ["text-yellow-400", "text-gray-300", "text-orange-400"];
          return (
            <div
              key={p._id}
              className={`mafia-card rounded-lg p-3 flex items-center gap-3 ${
                isTop3 ? "border-amber-500/30" : ""
              }`}
            >
              <span
                className={`text-lg font-black ${
                  isTop3 ? medalColors[i] : "text-muted-foreground"
                }`}
              >
                #{i + 1}
              </span>
              <span className="text-sm font-bold flex-1">
                {p.nickname || p.username || "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground">
                Lv.{p.level ?? 0}
              </span>
              <span className="text-sm font-black text-primary">
                {typeof value === "number" ? value.toLocaleString() : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RecordKillsPage() {
  return (
    <GameRecordPage
      title="Total Kills"
      icon="💀"
      field="totalKills"
      label="Users with the most total kills"
    />
  );
}

export function RecordCrimesPage() {
  return (
    <GameRecordPage
      title="Total Crimes Committed"
      icon="🔪"
      field="totalCrimes"
      label="Users with the most crimes committed"
    />
  );
}

export function RecordGtaPage() {
  return (
    <GameRecordPage
      title="Total GTA's Committed"
      icon="🚗"
      field="totalGta"
      label="Users with the most GTA's committed"
    />
  );
}

export function RecordPointsPage() {
  return (
    <GameRecordPage
      title="Total Points Spent"
      icon="🏆"
      field="pointsSent"
      label="Users with the most points spent"
    />
  );
}

export function RecordBulletsPage() {
  return (
    <GameRecordPage
      title="Total Bullets Melted"
      icon="💀"
      field="totalBulletsMelted"
      label="Users with the most bullets melted"
    />
  );
}

export function RecordBustsPage() {
  return (
    <GameRecordPage
      title="Total Successful Busts"
      icon="🚔"
      field="totalBusts"
      label="Users with the most successful busts"
    />
  );
}

export function RecordStockPage() {
  return (
    <GameRecordPage
      title="Total Stock Profit"
      icon="📈"
      field="totalStockProfit"
      label="Users with the most stock profit"
    />
  );
}

export function RecordBettingPage() {
  return (
    <GameRecordPage
      title="Total Betting Profit"
      icon="🎰"
      field="totalBettingProfit"
      label="Users with the most betting profit"
    />
  );
}

export function RecordAssassinationPage() {
  return (
    <GameRecordPage
      title="Total Assassination Kills"
      icon="🎯"
      field="totalAssassinations"
      label="Users with the most assassination kills"
    />
  );
}

export function RecordPacksPage() {
  return (
    <GameRecordPage
      title="Total Packs Opened"
      icon="📦"
      field="packsOpened"
      label="Users with the most packs opened"
    />
  );
}

export function RecordHeistsPage() {
  return (
    <GameRecordPage
      title="Total Heists"
      icon="💰"
      field="totalHeists"
      label="Users with the most heists"
    />
  );
}

export function RecordSupplyPage() {
  return (
    <GameRecordPage
      title="Supply Running Profit"
      icon="📦"
      field="totalSupplyProfit"
      label="Users with the highest supply running profit"
    />
  );
}

export function RecordCasinoPage() {
  return (
    <GameRecordPage
      title="Casino Wins"
      icon="🎰"
      field="totalCasinoWins"
      label="Users with the most casino wins"
    />
  );
}

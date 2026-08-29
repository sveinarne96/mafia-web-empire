import { useState } from "react";
import { Shield, Eye, AlertTriangle } from "lucide-react";

export function FBIStatusPage() {
  const [investigation] = useState(() => Math.random() > 0.5);
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3"><Shield className="size-7 text-primary" /><h2 className="text-2xl font-bold">FBI Status</h2></div>
      <div className={`mafia-card rounded-xl p-6 text-center ${investigation ? "border-red-500/30" : "border-green-500/30"}`}>
        <div className="text-4xl mb-3">{investigation ? "🔴" : "🟢"}</div>
        <div className={`text-lg font-bold ${investigation ? "text-red-400" : "text-green-400"}`}>
          {investigation ? "ACTIVE INVESTIGATION" : "NO INVESTIGATION"}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {investigation ? "The FBI is investigating recent criminal activity in your area." : "No active investigations against you."}
        </div>
      </div>
    </div>
  );
}

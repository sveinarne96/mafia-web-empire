import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertTriangle, Trash2, CheckCircle, Shield } from "lucide-react";

export function DatabaseWipeUI({ action }: { action: string }) {
  const preview = useQuery(api.adminWipe.getWipePreview);
  const wipeAll = useMutation(api.adminWipe.wipeAllPlayers);
  const [confirmText, setConfirmText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (action === "Preview") {
    if (!preview) return <div className="text-xs text-muted-foreground">Loading preview...</div>;
    return (
      <div className="space-y-3">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            Database Wipe Preview
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Players:</span>
              <span className="text-foreground font-bold">{preview.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admins (safe):</span>
              <span className="text-green-400 font-bold">{preview.admins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Will be wiped:</span>
              <span className="text-red-400 font-bold">{preview.willWipe}</span>
            </div>
            {preview.adminNames.length > 0 && (
              <div className="mt-2 pt-2 border-t border-red-500/20">
                <span className="text-green-400 font-bold">Protected admins:</span>
                {preview.adminNames.map((name: string, i: number) => (
                  <div key={i} className="text-green-300 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          All non-admin players will be reset to level 0 with $0. Their vehicles, inventory, items, 
          achievements, missions, families, crews, and all progress will be deleted. Admin accounts are safe.
        </div>
      </div>
    );
  }

  // Wipe action
  return (
    <div className="space-y-3">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
          <AlertTriangle className="h-4 w-4" />
          ⚠️ DESTRUCTIVE ACTION — IRREVERSIBLE
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          This will wipe ALL non-admin players. Type <span className="text-red-400 font-bold">WIPE ALL</span> to confirm.
        </div>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type WIPE ALL to confirm..."
          className="w-full bg-black/30 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300 mb-3"
        />
        <button
          disabled={confirmText !== "WIPE ALL" || loading}
          onClick={async () => {
            setLoading(true);
            setError("");
            try {
              const res = await wipeAll();
              setResult(res);
            } catch (e: any) {
              setError(e.message || "Wipe failed");
            }
            setLoading(false);
          }}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">💀 Wiping...</span>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              💣 WIPE {preview?.willWipe ?? "?"} PLAYERS
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-1">
            <CheckCircle className="h-4 w-4" />
            Wipe Complete!
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Players wiped: <span className="text-foreground font-bold">{result.wiped}</span></div>
            <div>Admins skipped: <span className="text-green-400 font-bold">{result.skipped}</span></div>
            <div>Related tables cleared: <span className="text-foreground font-bold">{result.tablesCleared}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

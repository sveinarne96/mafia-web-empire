import { EmpirePanel, MissionGuidePanel } from "./EmpireAndBust";
import { MissionsMapPanel } from "./MissionsMapPanel";
import { MissionsOverviewPage } from "./MissionPages";

export function FullMissionsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <MissionsMapPanel />
      <EmpirePanel />
      <MissionGuidePanel />
      <MissionsOverviewPage />
    </div>
  );
}

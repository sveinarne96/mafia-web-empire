import { EmpirePanel, MissionGuidePanel, PrisonBustPanel } from "./EmpireAndBust";
import { MissionsOverviewPage } from "./MissionPages";

export function FullMissionsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <EmpirePanel />
      <MissionGuidePanel />
      <MissionsOverviewPage />
      <PrisonBustPanel />
    </div>
  );
}
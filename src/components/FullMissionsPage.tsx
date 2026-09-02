import { EmpirePanelNew, MissionGuideNew } from "./EmpirePanelNew";
import { MissionsMapPanel } from "./MissionsMapPanel";
import { MissionsOverviewPage } from "./MissionPages";

export function FullMissionsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <MissionsMapPanel />
      <EmpirePanelNew />
      <MissionGuideNew />
      <MissionsOverviewPage />
    </div>
  );
}

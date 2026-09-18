import { useEffect, useRef } from "react";

type CrimeOperationsDeckProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

type OperationMeta = {
  label: string;
  description: string;
  cooldown: number;
};

const OPERATIONS: OperationMeta[] = [
  { label: "Street", description: "Quick hit · low profile", cooldown: 45 },
  { label: "Robbery", description: "High payout · heat rises", cooldown: 120 },
  { label: "Fraud", description: "Work the mark · leave no trail", cooldown: 180 },
  { label: "Burglary", description: "Quiet entry · clean exit", cooldown: 240 },
  { label: "Drugs", description: "Move product · manage exposure", cooldown: 300 },
  { label: "Organized", description: "Crew pressure · serious return", cooldown: 600 },
  { label: "Underground", description: "Off-grid work · slow setup", cooldown: 900 },
  { label: "GTA", description: "Take the wheel · garage delivery", cooldown: 180 },
  { label: "Burglarize", description: "Case the house · lift the loot", cooldown: 240 },
  { label: "Org Crime", description: "Coordinate the crew · split the take", cooldown: 900 },
  { label: "Murder", description: "Lethal contract · extreme exposure", cooldown: 1800 },
  { label: "Heist", description: "Build the plan · chase the big score", cooldown: 3600 },
];

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "READY";
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${String(seconds % 60).padStart(2, "0")}s` : `${seconds}s`;
};

/**
 * The operation cards live in Dashboard's compact top bar. This component
 * intentionally renders no separate panel; it adds the live intelligence HUD
 * to those existing buttons without changing their navigation handlers.
 */
export function CrimeOperationsDeck({ activePage: _activePage, onNavigate: _onNavigate }: CrimeOperationsDeckProps) {
  const deadlines = useRef<Record<string, number>>({});

  useEffect(() => {
    let disposed = false;
    const timers = new Map<HTMLButtonElement, (event: MouseEvent) => void>();

    const enhance = () => {
      if (disposed) return;
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
      for (const operation of OPERATIONS) {
        const button = buttons.find((candidate) => {
          const text = candidate.textContent?.replace(/\s+/g, " ").trim() ?? "";
          return text.includes(operation.label) && !candidate.closest("aside") && !candidate.closest("nav");
        });
        if (!button) continue;

        button.dataset.operationRail = operation.label;
        button.title = `${operation.description} · ${Math.floor(operation.cooldown / 60)}m cycle`;
        button.style.minWidth = "92px";
        button.style.minHeight = "47px";
        button.style.position = "relative";
        button.style.overflow = "hidden";
        button.style.transition = "transform 180ms ease, filter 180ms ease, border-color 180ms ease";

        let intel = button.querySelector<HTMLElement>("[data-operation-intel]");
        if (!intel) {
          intel = document.createElement("span");
          intel.dataset.operationIntel = "true";
          intel.style.cssText = "display:block;position:relative;z-index:2;margin-top:2px;text-align:left;pointer-events:none;line-height:1.1;";
          const description = document.createElement("span");
          description.dataset.operationDescription = "true";
          description.textContent = operation.description;
          description.style.cssText = "display:block;max-width:112px;overflow:hidden;text-overflow:ellipsis;color:rgba(148,163,184,.82);font-size:8px;font-weight:500;white-space:nowrap;";
          const cooldown = document.createElement("span");
          cooldown.dataset.operationCooldown = "true";
          cooldown.style.cssText = "display:block;margin-top:2px;color:#fbbf24;font-size:8px;font-weight:900;letter-spacing:.04em;white-space:nowrap;";
          intel.append(description, cooldown);
          button.appendChild(intel);

          const progress = document.createElement("span");
          progress.dataset.operationProgress = "true";
          progress.style.cssText = "position:absolute;left:0;bottom:0;height:2px;width:100%;transform-origin:left;background:linear-gradient(90deg,#f59e0b,#ef4444);opacity:.9;pointer-events:none;transition:transform 250ms linear;";
          button.appendChild(progress);
        }

        if (!timers.has(button)) {
          const handleClick = () => {
            deadlines.current[operation.label] = Math.max(deadlines.current[operation.label] ?? 0, Date.now() + operation.cooldown * 1000);
          };
          button.addEventListener("click", handleClick);
          timers.set(button, handleClick);
        }
      }
    };

    const update = () => {
      enhance();
      const now = Date.now();
      for (const button of Array.from(document.querySelectorAll<HTMLButtonElement>("[data-operation-rail]"))) {
        const operation = OPERATIONS.find((candidate) => candidate.label === button.dataset.operationRail);
        if (!operation) continue;
        const seconds = Math.max(0, Math.ceil(((deadlines.current[operation.label] ?? 0) - now) / 1000));
        const cooldown = button.querySelector<HTMLElement>("[data-operation-cooldown]");
        const progress = button.querySelector<HTMLElement>("[data-operation-progress]");
        if (cooldown) cooldown.textContent = seconds > 0 ? `⏱ ${formatTime(seconds)} · RECOVERING` : `✓ READY · ${Math.floor(operation.cooldown / 60)}m cycle`;
        if (progress) progress.style.transform = `scaleX(${seconds > 0 ? Math.max(0, seconds / operation.cooldown) : 0})`;
        button.style.filter = seconds > 0 ? "saturate(.72)" : "saturate(1)";
      }
    };

    update();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(update, 250);
    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(interval);
      for (const [button, handler] of timers) button.removeEventListener("click", handler);
      document.querySelectorAll<HTMLElement>("[data-operation-intel], [data-operation-progress]").forEach((element) => element.remove());
      document.querySelectorAll<HTMLButtonElement>("[data-operation-rail]").forEach((button) => {
        delete button.dataset.operationRail;
        button.style.removeProperty("min-width");
        button.style.removeProperty("min-height");
        button.style.removeProperty("position");
        button.style.removeProperty("overflow");
        button.style.removeProperty("filter");
        button.style.removeProperty("transition");
      });
    };
  }, []);

  return null;
}

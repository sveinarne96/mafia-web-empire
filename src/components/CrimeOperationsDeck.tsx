import { useEffect, useRef } from "react";

type CrimeOperationsDeckProps = { activePage: string; onNavigate: (page: string) => void };
type OperationMeta = { label: string; description: string; cooldown: number; section: "street" | "major" };

const OPERATIONS: OperationMeta[] = [
  { label: "Street", description: "Quick hit · low profile", cooldown: 45, section: "street" },
  { label: "Robbery", description: "High payout · heat rises", cooldown: 120, section: "street" },
  { label: "Fraud", description: "Work the mark · leave no trail", cooldown: 180, section: "street" },
  { label: "Burglary", description: "Quiet entry · clean exit", cooldown: 240, section: "street" },
  { label: "Drugs", description: "Move product · manage exposure", cooldown: 300, section: "street" },
  { label: "Organized", description: "Crew pressure · serious return", cooldown: 600, section: "street" },
  { label: "Underground", description: "Off-grid work · slow setup", cooldown: 900, section: "street" },
  { label: "GTA", description: "Take the wheel · garage delivery", cooldown: 180, section: "major" },
  { label: "Burglarize", description: "Case the house · lift the loot", cooldown: 240, section: "major" },
  { label: "Org Crime", description: "Coordinate the crew · split the take", cooldown: 900, section: "major" },
  { label: "Murder", description: "Lethal contract · extreme exposure", cooldown: 1800, section: "major" },
  { label: "Heist", description: "Build the plan · chase the big score", cooldown: 3600, section: "major" },
];

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "READY";
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${String(seconds % 60).padStart(2, "0")}s` : `${seconds}s`;
};

/** Enhances Dashboard's existing compact operation bar; it intentionally renders no second panel. */
export function CrimeOperationsDeck({ activePage: _activePage, onNavigate: _onNavigate }: CrimeOperationsDeckProps) {
  const deadlines = useRef<Record<string, number>>({});

  useEffect(() => {
    let disposed = false;
    const listeners = new Map<HTMLButtonElement, (event: MouseEvent) => void>();
    const style = document.createElement("style");
    style.dataset.operationRailStyle = "true";
    style.textContent = `
      [data-operation-rail] { isolation:isolate; }
      [data-operation-rail]::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity .25s ease; box-shadow:inset 0 0 18px rgba(245,158,11,.14), 0 0 18px rgba(245,158,11,.08); }
      [data-operation-rail]:hover::after { opacity:1; }
      [data-operation-rail]:hover { transform:translateY(-1px); }
      [data-operation-rail] [data-operation-progress] { animation:operation-rail-pulse 2.4s ease-in-out infinite; }
      @keyframes operation-rail-pulse { 0%,100% { opacity:.45 } 50% { opacity:1 } }
    `;
    document.head.appendChild(style);

    const enhance = () => {
      if (disposed) return;
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
      const topBarButtons = buttons.filter((candidate) => !candidate.closest("aside") && !candidate.closest("nav"));
      const operationButtons = OPERATIONS.map((operation) => ({ operation, button: topBarButtons.find((candidate) => (candidate.textContent?.replace(/\s+/g, " ").trim() ?? "").includes(operation.label)) })).filter((item): item is { operation: OperationMeta; button: HTMLButtonElement } => Boolean(item.button));
      if (!operationButtons.length) return;

      const parent = operationButtons[0].button.parentElement;
      if (parent) {
        parent.style.gap = "4px";
        parent.style.alignItems = "stretch";
      }

      operationButtons.forEach(({ operation, button }, index) => {
        button.dataset.operationRail = operation.label;
        button.title = `${operation.description} · ${Math.floor(operation.cooldown / 60)}m recovery cycle`;
        button.style.minWidth = "116px";
        button.style.minHeight = "68px";
        button.style.padding = "7px 8px 6px";
        button.style.position = "relative";
        button.style.overflow = "hidden";
        button.style.display = "flex";
        button.style.flexDirection = "column";
        button.style.alignItems = "stretch";
        button.style.justifyContent = "flex-start";
        button.style.borderRadius = "11px";
        button.style.background = operation.section === "major" ? "linear-gradient(145deg, rgba(65,24,12,.56), rgba(19,12,10,.84))" : "linear-gradient(145deg, rgba(16,29,34,.66), rgba(12,15,20,.88))";
        button.style.borderColor = operation.section === "major" ? "rgba(245,158,11,.24)" : "rgba(148,163,184,.16)";
        button.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.06), 0 5px 14px rgba(0,0,0,.18)";
        button.style.transition = "transform 180ms ease, filter 180ms ease, border-color 180ms ease, box-shadow 180ms ease";

        const primary = button.querySelector<HTMLElement>("span.relative.z-10") ?? button.querySelector<HTMLElement>("span");
        if (primary) {
          primary.style.display = "flex";
          primary.style.alignItems = "center";
          primary.style.justifyContent = "space-between";
          primary.style.gap = "5px";
          primary.style.width = "100%";
          primary.style.fontSize = "10px";
          primary.style.fontWeight = "900";
          primary.style.letterSpacing = ".01em";
        }

        let intel = button.querySelector<HTMLElement>("[data-operation-intel]");
        if (!intel) {
          intel = document.createElement("span");
          intel.dataset.operationIntel = "true";
          intel.style.cssText = "display:block;position:relative;z-index:3;margin-top:4px;text-align:left;pointer-events:none;line-height:1.1;";
          const description = document.createElement("span");
          description.dataset.operationDescription = "true";
          description.textContent = operation.description;
          description.style.cssText = "display:block;overflow:hidden;text-overflow:ellipsis;color:rgba(148,163,184,.86);font-size:8px;font-weight:600;white-space:nowrap;";
          const cooldown = document.createElement("span");
          cooldown.dataset.operationCooldown = "true";
          cooldown.style.cssText = "display:block;margin-top:4px;color:#fbbf24;font-size:8px;font-weight:950;letter-spacing:.04em;white-space:nowrap;";
          intel.append(description, cooldown);
          button.appendChild(intel);
          const progress = document.createElement("span");
          progress.dataset.operationProgress = "true";
          progress.style.cssText = "position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;background:linear-gradient(90deg,#f59e0b,#ef4444);opacity:.9;pointer-events:none;transition:transform 250ms linear;";
          button.appendChild(progress);
        }

        if (!listeners.has(button)) {
          const handleClick = () => { deadlines.current[operation.label] = Math.max(deadlines.current[operation.label] ?? 0, Date.now() + operation.cooldown * 1000); };
          button.addEventListener("click", handleClick);
          listeners.set(button, handleClick);
        }

        const divider = button.previousElementSibling;
        if (index === 7 && divider instanceof HTMLElement) divider.style.marginLeft = "7px";
      });
    };

    const update = () => {
      enhance();
      const now = Date.now();
      document.querySelectorAll<HTMLButtonElement>("[data-operation-rail]").forEach((button) => {
        const operation = OPERATIONS.find((candidate) => candidate.label === button.dataset.operationRail);
        if (!operation) return;
        const seconds = Math.max(0, Math.ceil(((deadlines.current[operation.label] ?? 0) - now) / 1000));
        const cooldown = button.querySelector<HTMLElement>("[data-operation-cooldown]");
        const progress = button.querySelector<HTMLElement>("[data-operation-progress]");
        if (cooldown) cooldown.textContent = seconds > 0 ? `⏱ ${formatTime(seconds)} · RECOVERING` : `✓ READY · ${Math.floor(operation.cooldown / 60)}m cycle`;
        if (progress) progress.style.transform = `scaleX(${seconds > 0 ? Math.max(0, seconds / operation.cooldown) : 0})`;
        button.style.filter = seconds > 0 ? "saturate(.72) brightness(.9)" : "saturate(1) brightness(1)";
      });
    };

    update();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(update, 250);
    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(interval);
      listeners.forEach((handler, button) => button.removeEventListener("click", handler));
      document.querySelectorAll<HTMLElement>("[data-operation-intel], [data-operation-progress]").forEach((element) => element.remove());
      document.querySelectorAll<HTMLButtonElement>("[data-operation-rail]").forEach((button) => { delete button.dataset.operationRail; button.style.removeProperty("min-width"); button.style.removeProperty("min-height"); button.style.removeProperty("padding"); button.style.removeProperty("position"); button.style.removeProperty("overflow"); button.style.removeProperty("display"); button.style.removeProperty("flex-direction"); button.style.removeProperty("align-items"); button.style.removeProperty("justify-content"); button.style.removeProperty("border-radius"); button.style.removeProperty("background"); button.style.removeProperty("border-color"); button.style.removeProperty("box-shadow"); button.style.removeProperty("filter"); button.style.removeProperty("transition"); });
      style.remove();
    };
  }, []);

  return null;
}

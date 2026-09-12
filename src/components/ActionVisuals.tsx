import type { ReactNode } from "react";
import { Activity, ArrowUpRight, Crosshair, ShieldCheck, Sparkles } from "lucide-react";

export function ActionHero({
  eyebrow,
  title,
  description,
  icon,
  accent = "red",
  right,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  accent?: "red" | "amber" | "cyan" | "purple" | "emerald";
  right?: ReactNode;
}) {
  return (
    <section className={`action-hero action-hero-${accent}`}>
      <div className="action-hero-grid" />
      <div className="action-hero-orb action-hero-orb-one" />
      <div className="action-hero-orb action-hero-orb-two" />
      <div className="relative flex items-center gap-4">
        <div className="action-hero-icon" aria-hidden="true">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="action-eyebrow"><Activity className="size-3" /> {eyebrow}</div>
          <h1 className="action-title">{title}</h1>
          <p className="action-description">{description}</p>
        </div>
        {right}
      </div>
      <div className="action-hero-line" />
    </section>
  );
}

export function ActionStat({ icon, label, value, tone = "neutral" }: { icon: string; label: string; value: ReactNode; tone?: "neutral" | "green" | "red" | "amber" | "blue" }) {
  return <div className={`action-stat action-stat-${tone}`}><span className="action-stat-icon">{icon}</span><span className="min-w-0"><span className="action-stat-label">{label}</span><span className="action-stat-value">{value}</span></span></div>;
}

export function ActionCard({ children, active = false, className = "" }: { children: ReactNode; active?: boolean; className?: string }) {
  return <div className={`action-card ${active ? "action-card-active" : ""} ${className}`}>{children}</div>;
}

export function ExecuteButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="action-execute"><Crosshair className="size-4" /> {children}<ArrowUpRight className="ml-auto size-4 opacity-60" /></button>;
}

export function SafetyNote({ children }: { children: ReactNode }) {
  return <div className="action-safety"><ShieldCheck className="size-3.5 shrink-0" /> <span>{children}</span><Sparkles className="ml-auto size-3.5 opacity-40" /></div>;
}

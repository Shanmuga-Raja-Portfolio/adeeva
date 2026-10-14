import { hasClock, type ServiceRun } from "../../../core";
import type { ServiceHeading } from "./serviceHeading";
import { formatClock } from "./serviceView";

export interface ServiceHeaderProps {
  readonly service: ServiceRun;
  readonly heading: ServiceHeading;
  readonly now: number;
  readonly paused: boolean;
  readonly reducedMotion: boolean;
  readonly onPause: () => void;
  readonly onTeamFinish: () => void;
  readonly onStepOut: () => void;
}

export function ServiceHeader({
  service,
  heading,
  now,
  paused,
  reducedMotion,
  onPause,
  onTeamFinish,
  onStepOut,
}: ServiceHeaderProps) {
  const clocked = hasClock(service);
  const share = clocked ? Math.max(0, 1 - now / service.plan.lengthSeconds) : 1;
  return (
    <header className="ck-service__bar">
      <div>
        <span className="ad-eyebrow">{heading.eyebrow}</span>
        <h1 className="ck-service__title">{heading.title}</h1>
      </div>
      <div
        className={reducedMotion ? "ck-lamp ck-lamp--still" : "ck-lamp"}
        role="timer"
        aria-label={
          clocked ? `${formatClock(service.plan.lengthSeconds - now)} left in service` : "No clock on Relaxed"
        }
      >
        <span className="ck-lamp__shade" aria-hidden="true" />
        <span className="ck-lamp__glow" style={{ opacity: 0.25 + share * 0.75 }} aria-hidden="true" />
        <span className="ck-lamp__bar" aria-hidden="true">
          <span style={{ width: `${share * 100}%` }} />
        </span>
        <strong>{clocked ? formatClock(service.plan.lengthSeconds - now) : "No clock"}</strong>
      </div>
      <div className="ck-service__actions">
        <button type="button" className="ck-pause" onClick={onStepOut} data-testid="step-out">
          Step out
        </button>
        {clocked ? null : (
          <button type="button" className="ck-pause" onClick={onTeamFinish} data-testid="team-finish">
            Let the team finish
          </button>
        )}
        <button
          type="button"
          className="ck-big-button ck-big-button--pause"
          aria-pressed={paused}
          onClick={onPause}
          data-testid="service-pause"
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
    </header>
  );
}

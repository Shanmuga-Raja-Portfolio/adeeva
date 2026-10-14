import { Icon } from "../../../../../ui/kit/IconSet";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { panelVerdict, type FairPanelScore } from "../../../core";
import { PANEL_LOOKS } from "./panelLooks";

export interface PanelFlipCardsProps {
  readonly panels: readonly FairPanelScore[];
  readonly instant: boolean;
}

function FlipCard({ panel, order, instant }: { panel: FairPanelScore; order: number; instant: boolean }) {
  const delay = 300 + order * 500;
  const score = useCountUp(panel.score, 1200, delay, instant);
  const look = PANEL_LOOKS[panel.id];
  return (
    <article
      className={`pa-flip pa-flip--${panel.id}`}
      style={{ animationDelay: instant ? "0ms" : `${delay - 300}ms` }}
      aria-label={`${panel.label}: ${panel.score} out of 100, ${panelVerdict(panel.score)}`}
      data-testid={`flip-${panel.id}`}
    >
      <span className="pa-flip__icon" aria-hidden="true">
        <Icon name={look.icon} size={22} />
      </span>
      <strong className="pa-flip__name">{panel.label}</strong>
      <span className="pa-flip__score" aria-hidden="true">
        {score}
      </span>
      <span className="pa-flip__verdict">{panelVerdict(panel.score)}</span>
    </article>
  );
}

export function PanelFlipCards({ panels, instant }: PanelFlipCardsProps) {
  return (
    <div className="pa-flips">
      {panels.map((panel, order) => (
        <FlipCard key={panel.id} panel={panel} order={order} instant={instant} />
      ))}
    </div>
  );
}

import type { PanelScore } from "../../../core";
import { Icon, type IconName } from "../../../../../ui/kit/IconSet";
import { Meter, type MeterTone } from "../../../../../ui/kit/Meter";
import { useCountUp } from "../../../../../ui/kit/useCountUp";

export interface PanelCardProps {
  panel: PanelScore;
  order: number;
  instant: boolean;
}

const PANEL_LOOK: Record<PanelScore["id"], { icon: IconName; tone: MeterTone; blurb: string }> = {
  critics: { icon: "star", tone: "rose", blurb: "Craft, theme and cohesion" },
  buyers: { icon: "bag", tone: "sage", blurb: "Would it sell on Monday?" },
  audience: { icon: "heart", tone: "gold", blurb: "Gasps, cheers and phone screens" },
};

function verdict(score: number): string {
  if (score >= 85) return "Adored it";
  if (score >= 70) return "Loved it";
  if (score >= 50) return "Warmed to it";
  if (score >= 30) return "Curious";
  return "Not yet won over";
}

export function PanelCard({ panel, order, instant }: PanelCardProps) {
  const look = PANEL_LOOK[panel.id];
  const delay = 350 + order * 450;
  const score = useCountUp(panel.score, 1300, delay, instant);
  return (
    <article
      className={`ad-jury ad-jury--${panel.id}`}
      style={{ animationDelay: instant ? "0ms" : `${delay - 250}ms` }}
      data-testid={`panel-${panel.id}`}
      aria-label={`${panel.label}: ${panel.score} out of 100`}
    >
      <header className="ad-jury__head">
        <span className="ad-jury__icon" aria-hidden="true">
          <Icon name={look.icon} size={22} />
        </span>
        <div>
          <h3 className="ad-jury__title">{panel.label}</h3>
          <span className="ad-jury__blurb">{look.blurb}</span>
        </div>
        <span className="ad-jury__score" aria-hidden="true">
          {score}
        </span>
      </header>
      <p className="ad-jury__verdict">{verdict(panel.score)}</p>
      <ul className="ad-jury__parts">
        {panel.parts.map((part) => (
          <li key={part.id} className="ad-jury__part">
            <Meter
              label={`${part.label} · ${Math.round(part.weight * 100)}%`}
              value={part.value}
              tone={look.tone}
              valueText={String(part.value)}
            />
            <p className="ad-jury__detail">{part.detail}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

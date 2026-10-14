import type { PanelScore } from "../../engine/panelScore";
import { Icon, type IconName } from "./IconSet";
import { Meter, type MeterTone } from "./Meter";
import { useCountUp } from "./useCountUp";
import "./PanelCard.css";

export interface PanelCardProps {
  readonly panel: PanelScore;
  readonly order: number;
  readonly instant: boolean;
  readonly icon: IconName;
  readonly tone: MeterTone;
  readonly blurb: string;
  readonly verdict: string;
  readonly note?: string | undefined;
}

export function PanelCard({ panel, order, instant, icon, tone, blurb, verdict, note }: PanelCardProps) {
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
          <Icon name={icon} size={22} />
        </span>
        <div>
          <h3 className="ad-jury__title">{panel.label}</h3>
          <span className="ad-jury__blurb">{blurb}</span>
        </div>
        <span className="ad-jury__score" aria-hidden="true">
          {score}
        </span>
      </header>
      <p className="ad-jury__verdict">{verdict}</p>
      {note !== undefined ? <p className="ad-jury__note">{note}</p> : null}
      <ul className="ad-jury__parts">
        {panel.parts.map((part) => (
          <li key={part.id} className="ad-jury__part">
            <Meter
              label={`${part.label} · ${Math.round(part.weight * 100)}%`}
              value={part.value}
              tone={tone}
              valueText={String(part.value)}
            />
            <p className="ad-jury__detail">{part.detail}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
